"""Evaluation tests use synthetic questions and books only."""

import json

import pytest

from libraries_evaluation.queries import load_queries


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
