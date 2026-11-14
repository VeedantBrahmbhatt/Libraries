"""Read the official DOAB CSV export as a stream without a raw local copy."""

import csv
import io
from collections.abc import Iterator
from typing import TextIO

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

DOAB_CSV_URL = "https://memo.doabooks.org/file/oapen/DOAB.csv"
REQUIRED_COLUMNS = frozenset({"id", "dc.type", "dc.title"})


def parse_csv(stream: TextIO) -> Iterator[dict[str, str | None]]:
    """Validate the feed header before yielding records."""
    reader = csv.DictReader(stream)
    found = set(reader.fieldnames or [])
    missing = REQUIRED_COLUMNS - found
    if missing:
        raise ValueError(f"Missing required DOAB columns: {', '.join(sorted(missing))}")
    yield from reader


def fetch_rows(url: str = DOAB_CSV_URL) -> Iterator[dict[str, str | None]]:
    """Fetch and parse a DOAB export with bounded memory and HTTP retries."""
    retry = Retry(total=3, backoff_factor=2, status_forcelist=[429, 500, 502, 503, 504])
    with requests.Session() as session:
        session.mount("https://", HTTPAdapter(max_retries=retry))
        with session.get(url, stream=True, timeout=(10, 90)) as response:
            response.raise_for_status()
            response.raw.decode_content = True
            with io.TextIOWrapper(response.raw, encoding="utf-8-sig", newline="") as stream:
                yield from parse_csv(stream)
