"""Evaluation tests use synthetic questions and books only."""

import csv
import hashlib
import json

import numpy as np
import pyarrow as pa
import pyarrow.parquet as pq
import pytest

from libraries_data.schema import BOOK_SCHEMA
from libraries_evaluation.collect import collect_results
from libraries_evaluation.queries import load_queries
from libraries_search.build import build_index
from libraries_search.search import SearchEngine


def _write_queries(path, rows):
    path.write_text("\n".join(json.dumps(row) for row in rows) + "\n")
    return path


def _query(query_id="q1", **changes):
    row = {
        "query_id": query_id,
        "text": "How do coastal cities adapt to floods?",
        "language": "en",
        "intent": "topic",
        "split": "development",
    }
    row.update(changes)
    return row


def test_load_queries_preserves_multilingual_order_and_known_title(tmp_path):
    path = _write_queries(
        tmp_path / "queries.jsonl",
        [
            _query(),
            _query("q2", text="adaptación climática urbana", language="es", split="holdout"),
            _query(
                "q3",
                text="Climate Adaptation Finance and Investment in California",
                intent="known_title",
                expected_book_id="book-123",
            ),
        ],
    )
    queries = load_queries(path)
    assert [query.query_id for query in queries] == ["q1", "q2", "q3"]
    assert queries[1].language == "es"
    assert queries[2].expected_book_id == "book-123"


@pytest.mark.parametrize(
    ("rows", "message"),
    [
        ([_query(), _query()], "Duplicate query_id"),
        ([_query(text="  ")], "text"),
        ([_query(intent="voice")], "intent"),
        ([_query(split="training")], "split"),
        ([_query(intent="known_title")], "expected_book_id"),
    ],
)
def test_load_queries_rejects_invalid_contract(tmp_path, rows, message):
    path = _write_queries(tmp_path / "queries.jsonl", rows)
    with pytest.raises(ValueError, match=message):
        load_queries(path)


class FakeEncoder:
    def __init__(self, vectors):
        self.vectors = vectors

    def encode(self, texts, **_kwargs):
        return np.asarray([self.vectors[text] for text in texts], dtype=np.float32)


def _book(book_id, title, abstract):
    return {
        "book_id": book_id,
        "title": title,
        "alternate_titles": [],
        "authors": ["Example Author"],
        "subjects": ["Cities"],
        "classifications": [],
        "abstract": abstract,
        "other_language_abstract": "",
        "languages": ["eng"],
        "publication_year": 2024,
        "isbns": [],
        "doi": "",
        "publisher": "Example Press",
        "book_url": f"https://example.org/{book_id}",
        "download_url": "",
        "license_url": "",
        "semantic_text": f"Title: {title}\nSubject: Cities\nDescription: {abstract}",
    }


def _engine(tmp_path):
    books = [
        _book("flood", "Coastal flood policy", "Preparing cities for sea level rise"),
        _book("housing", "Urban housing", "Affordable housing in cities"),
    ]
    parquet = tmp_path / "books.parquet"
    pq.write_table(pa.Table.from_pylist(books, schema=BOOK_SCHEMA), parquet)
    manifest = {
        "schema_version": 1,
        "books_written": 2,
        "parquet_sha256": hashlib.sha256(parquet.read_bytes()).hexdigest(),
    }
    vectors = {
        f"passage: {books[0]['semantic_text']}": [1.0, 0.0],
        f"passage: {books[1]['semantic_text']}": [0.0, 1.0],
        "query: coastal flood": [1.0, 0.0],
    }
    encoder = FakeEncoder(vectors)
    index = tmp_path / "index"
    build_index(
        parquet,
        manifest,
        index,
        encoder,
        source_revision="synthetic-source",
        model_repo="example/model",
        model_revision="synthetic-model",
        dimensions=2,
    )
    return SearchEngine(index, encoder)


def _csv_rows(path):
    with path.open(newline="", encoding="utf-8") as stream:
        return list(csv.DictReader(stream))


def test_collect_results_pools_three_modes_without_fake_labels(tmp_path):
    queries_path = _write_queries(tmp_path / "queries.jsonl", [_query(text="coastal flood")])
    with _engine(tmp_path) as engine:
        manifest = collect_results(
            engine, queries_path, tmp_path / "evaluation", index_revision="synthetic-index", top_k=2
        )

    runs = _csv_rows(tmp_path / "evaluation" / "runs.csv")
    review = _csv_rows(tmp_path / "evaluation" / "review.csv")
    timings = _csv_rows(tmp_path / "evaluation" / "timings.csv")
    assert {row["mode"] for row in runs} == {"keyword", "semantic", "hybrid"}
    assert len(timings) == 3
    assert len(review) == 2
    assert {row["book_id"] for row in review} == {"flood", "housing"}
    assert all(row["relevance"] == "" for row in review)
    assert review[0]["abstract_excerpt"].startswith("Preparing cities")
    assert review[0]["book_url"] == "https://example.org/flood"
    assert manifest["query_count"] == 1
    assert manifest["candidate_count"] == 2
    assert manifest["index_books_indexed"] == 2
    assert manifest["index_revision"] == "synthetic-index"
    assert "Unjudged pilot" in (tmp_path / "evaluation" / "summary.md").read_text()


def test_collect_results_rejects_invalid_top_k_before_output(tmp_path):
    queries_path = _write_queries(tmp_path / "queries.jsonl", [_query(text="coastal flood")])
    with _engine(tmp_path) as engine:
        with pytest.raises(ValueError, match="top_k"):
            collect_results(
                engine,
                queries_path,
                tmp_path / "evaluation",
                index_revision="synthetic-index",
                top_k=0,
            )
    assert not (tmp_path / "evaluation").exists()
