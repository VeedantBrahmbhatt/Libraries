"""Stream DOAB's full repository export without saving the raw CSV."""

import csv
import io
from collections.abc import Iterator
from typing import TextIO

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

DOAB_EXPORT_URL = "https://directory.doabooks.org/download-export?format=csv"
REQUIRED_COLUMNS = frozenset(
    {
        "id",
        "dc.type",
        "dc.title",
        "dc.description.abstract",
        "dc.subject.other",
        "dc.language",
        "dc.identifier.uri",
    }
)


def parse_csv(stream: TextIO) -> Iterator[dict[str, str | None]]:
    """Read quoted multiline CSV records after checking essential column names."""
    reader = csv.DictReader(stream)
    missing = REQUIRED_COLUMNS - set(reader.fieldnames or [])
    if missing:
        raise ValueError(f"Missing required DOAB columns: {', '.join(sorted(missing))}")
    yield from reader


def fetch_rows(url: str = DOAB_EXPORT_URL) -> Iterator[dict[str, str | None]]:
    """Fetch the full CSV over HTTPS with retries and bounded memory."""
    retry = Retry(total=4, backoff_factor=2, status_forcelist=[429, 500, 502, 503, 504])
    with requests.Session() as session:
        session.mount("https://", HTTPAdapter(max_retries=retry))
        with session.get(url, stream=True, timeout=(10, 90)) as response:
            response.raise_for_status()
            response.raw.decode_content = True
            with io.TextIOWrapper(response.raw, encoding="utf-8-sig", newline="") as stream:
                yield from parse_csv(stream)
