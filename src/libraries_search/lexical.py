"""Store book display fields and our own SQLite full-text candidate index."""

import json
import re
import sqlite3
from pathlib import Path


def create_database(path: Path) -> sqlite3.Connection:
    """Create numbered book rows and a separate weighted full-text table."""
    connection = sqlite3.connect(path)
    connection.execute("PRAGMA journal_mode=DELETE")
    connection.execute(
        """CREATE TABLE books (
            ordinal INTEGER PRIMARY KEY,
            book_id TEXT NOT NULL UNIQUE,
            title TEXT NOT NULL,
            authors TEXT NOT NULL,
            subjects TEXT NOT NULL,
            abstract TEXT NOT NULL,
            languages TEXT NOT NULL,
            publication_year INTEGER,
            book_url TEXT NOT NULL
        )"""
    )
    connection.execute(
        "CREATE VIRTUAL TABLE books_fts USING fts5(title, authors, subjects, abstract)"
    )
    return connection


def insert_books(
    connection: sqlite3.Connection, books: list[dict[str, object]], start_ordinal: int
) -> None:
    """Insert each display row and its matching full-text row at the same number."""
    for offset, book in enumerate(books):
        ordinal = start_ordinal + offset
        authors = list(book["authors"])
        subjects = list(book["subjects"])
        connection.execute(
            "INSERT INTO books VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                ordinal,
                book["book_id"],
                book["title"],
                json.dumps(authors, ensure_ascii=False),
                json.dumps(subjects, ensure_ascii=False),
                book["abstract"],
                json.dumps(book["languages"], ensure_ascii=False),
                book["publication_year"],
                book["book_url"],
            ),
        )
        connection.execute(
            "INSERT INTO books_fts(rowid, title, authors, subjects, abstract) "
            "VALUES (?, ?, ?, ?, ?)",
            (
                ordinal,
                book["title"],
                " ".join(authors),
                " ".join(subjects),
                book["abstract"],
            ),
        )


def keyword_candidates(connection: sqlite3.Connection, query: str, limit: int) -> list[int]:
    """Return our BM25-ranked book row numbers using safe literal query terms."""
    terms = re.findall(r"\w+", query, flags=re.UNICODE)[:16]
    if not terms:
        return []
    expression = " OR ".join(f'"{term}"' for term in terms)
    rows = connection.execute(
        "SELECT rowid FROM books_fts WHERE books_fts MATCH ? "
        "ORDER BY bm25(books_fts, 8.0, 5.0, 4.0, 1.0), rowid LIMIT ?",
        (expression, limit),
    )
    return [int(row[0]) for row in rows]
