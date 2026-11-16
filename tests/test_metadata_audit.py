"""Only source-provided values can close a metadata gap."""

from libraries_evaluation.metadata_audit import summarize_book_fields


def test_summarize_book_fields_separates_recoverable_and_unrecoverable_gaps():
    books = [
        {"abstract": "Primary", "other_language_abstract": "", "subjects": ["Cities"],
         "classifications": [], "alternate_titles": []},
        {"abstract": "", "other_language_abstract": "Otro idioma", "subjects": [],
         "classifications": ["Urban planning"], "alternate_titles": ["Another title"]},
        {"abstract": "", "other_language_abstract": "", "subjects": [],
         "classifications": [], "alternate_titles": []},
    ]

    assert summarize_book_fields(books) == {
        "books": 3,
        "missing_primary_abstract": 2,
        "alternate_abstract_available_for_missing_primary": 1,
        "no_abstract_in_either_field": 1,
        "missing_subjects": 2,
        "classifications_available_for_missing_subjects": 1,
        "alternate_titles_available": 1,
    }
