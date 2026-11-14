"""Harvest the complete DOAB directory through its OAI-PMH metadata feed."""

import re
import xml.etree.ElementTree as ET
from collections.abc import Callable, Iterator
from dataclasses import dataclass

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

DOAB_OAI_URL = "https://directory.doabooks.org/oai/request"
OAI_NS = "http://www.openarchives.org/OAI/2.0/"
_DOWNLOAD = re.compile(r"\.(?:pdf|epub)(?:$|[?#])", flags=re.I)
_CLASS_CODE = re.compile(r"^[A-Z]{1,4}\d")


@dataclass(frozen=True)
class OAIPage:
    rows: list[dict[str, str | list[str]]]
    next_token: str | None
    expected_size: int | None


def _local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def _record_to_row(record: ET.Element) -> dict[str, str | list[str]]:
    header = record.find(f"{{{OAI_NS}}}header")
    if header is None:
        raise ValueError("DOAB OAI record has no header")
    identifier = header.findtext(f"{{{OAI_NS}}}identifier", default="")
    book_id = identifier.rsplit(":", 1)[-1]
    if header.get("status") == "deleted":
        return {"id": book_id, "dc.type": "deleted"}

    metadata = record.find(f"{{{OAI_NS}}}metadata")
    if metadata is None or len(metadata) != 1:
        raise ValueError(f"DOAB OAI record {book_id} has no Dublin Core metadata")
    fields: dict[str, list[ET.Element]] = {}
    for child in metadata[0]:
        fields.setdefault(_local_name(child.tag), []).append(child)

    def values(name: str) -> list[str]:
        return [
            item.text.strip() for item in fields.get(name, []) if item.text and item.text.strip()
        ]

    def typed_values(name: str, type_name: str) -> list[str]:
        return [
            item.text.strip()
            for item in fields.get(name, [])
            if item.get("type", "").casefold() == type_name.casefold()
            and item.text
            and item.text.strip()
        ]

    titles = values("title")
    descriptions = values("description")
    raw_subjects = values("subject")
    classifications = [
        item for item in raw_subjects if "::" in item or _CLASS_CODE.match(item)
    ]
    subjects = [item for item in raw_subjects if item not in classifications]
    identifiers = values("identifier")
    canonical_url = next(
        (
            item.text.strip()
            for item in fields.get("identifier", [])
            if item.get("type", "").casefold() == "url"
            and item.text
            and "directory.doabooks.org/handle/" in item.text
        ),
        f"https://directory.doabooks.org/handle/{book_id}",
    )
    download_url = next((item for item in identifiers if _DOWNLOAD.search(item)), "")
    license_url = next(
        (item.get("uri", "") for item in fields.get("licenseCondition", []) if item.get("uri")),
        "",
    )
    doi = next(iter(typed_values("identifier", "DOI")), "")
    if not doi:
        doi = next((item for item in identifiers if "doi.org/" in item), "")

    return {
        "id": book_id,
        "dc.type": next(iter(values("resourceType")), ""),
        "dc.title": next(iter(titles), ""),
        "dc.title.alternative": titles[1:],
        "dc.contributor.author": values("creator"),
        "dc.subject.other": subjects,
        "dc.subject.classification.description": classifications,
        "dc.description.abstract": next(iter(descriptions), ""),
        "oapen.abstract.otherlanguage": " ".join(descriptions[1:]),
        "dc.language": values("language"),
        "dc.date.issued": next(iter(typed_values("date", "Issued")), ""),
        "BITSTREAM_ISBN": typed_values("alternateIdentifier", "ISBN"),
        "oapen.relation.isbn": values("relationisbn"),
        "oapen.identifier.doi": doi,
        "dc.identifier.uri": canonical_url,
        "BITSTREAM_Download_URL": download_url,
        "BITSTREAM_License": license_url,
        "oapen.relation.isPublishedBy_publisher.name": next(iter(values("publisher")), ""),
    }


def parse_oai_page(xml_bytes: bytes) -> OAIPage:
    """Decode one page of DOAB's OAI-PMH `oai_dc` feed."""
    root = ET.fromstring(xml_bytes)
    error = root.find(f"{{{OAI_NS}}}error")
    if error is not None:
        raise ValueError(f"DOAB OAI error {error.get('code', '')}: {error.text or ''}")
    listing = root.find(f"{{{OAI_NS}}}ListRecords")
    if listing is None:
        raise ValueError("DOAB OAI response has no ListRecords element")
    rows = [_record_to_row(record) for record in listing.findall(f"{{{OAI_NS}}}record")]
    token_element = listing.find(f"{{{OAI_NS}}}resumptionToken")
    token = token_element.text.strip() if token_element is not None and token_element.text else ""
    expected = (
        int(token_element.get("completeListSize"))
        if token_element is not None and token_element.get("completeListSize")
        else None
    )
    return OAIPage(rows=rows, next_token=token or None, expected_size=expected)


def iter_oai_rows(
    fetch_page: Callable[[str | None], bytes],
) -> Iterator[dict[str, str | list[str]]]:
    """Follow every resumption token and detect incomplete or repeated pages."""
    token: str | None = None
    seen_tokens: set[str] = set()
    expected_size: int | None = None
    count = 0
    while True:
        page = parse_oai_page(fetch_page(token))
        if expected_size is None:
            expected_size = page.expected_size
        count += len(page.rows)
        yield from page.rows
        if page.next_token is None:
            break
        if page.next_token in seen_tokens:
            raise ValueError("DOAB OAI returned a repeated resumption token")
        seen_tokens.add(page.next_token)
        token = page.next_token
    if expected_size is not None and count < expected_size:
        raise ValueError(f"DOAB OAI harvest incomplete: {count} of {expected_size} records")


def fetch_rows(url: str = DOAB_OAI_URL) -> Iterator[dict[str, str | list[str]]]:
    """Fetch the complete OAI feed page by page without a raw local copy."""
    retry = Retry(total=4, backoff_factor=2, status_forcelist=[429, 500, 502, 503, 504])
    with requests.Session() as session:
        session.mount("https://", HTTPAdapter(max_retries=retry))

        def fetch_page(token: str | None) -> bytes:
            params = (
                {"verb": "ListRecords", "resumptionToken": token}
                if token is not None
                else {"verb": "ListRecords", "metadataPrefix": "oai_dc"}
            )
            response = session.get(url, params=params, timeout=(10, 90))
            response.raise_for_status()
            return response.content

        yield from iter_oai_rows(fetch_page)
