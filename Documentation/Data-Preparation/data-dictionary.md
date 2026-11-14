# Prepared catalog data dictionary

The output is `data/books.parquet` in [the shared Hugging Face dataset](https://huggingface.co/datasets/Tox1/LibrariesBookData). One row is one DOAB **book record**. The exact DOAB CSV header was inspected on 2026-11-14. Empty strings and empty lists mean the source did not provide a usable value; no values are invented. The Parquet schema is versioned in `src/libraries_data/schema.py`.

| Output column | DOAB CSV source | Preparation and reason |
| --- | --- | --- |
| `book_id` | `id` | Stable identity; deduplication and later updates. |
| `title` | `dc.title` | Original display title and strongest search signal; required. |
| `alternate_titles` | `dc.title.alternative` | Other searchable title forms, kept separately. |
| `authors` | `dc.contributor.author` | Exact author search and display. |
| `subjects` | `dc.subject.other` | Publisher keywords; useful semantic and keyword signals. |
| `classifications` | `dc.subject.classification.description` | Broad subjects for browsing or filters; excluded from `semantic_text` to avoid noise. |
| `abstract` | `dc.description.abstract` | Main description for semantic comparison; books without one remain in the catalog. |
| `other_language_abstract` | `oapen.abstract.otherlanguage` | Additional original-language description, if present. |
| `languages` | `dc.language` | Lowercased source codes for language filtering; no translation. |
| `publication_year` | `dc.date.issued` | Leading four-digit year for display or filters. |
| `isbns` | `BITSTREAM_ISBN`, `oapen.relation.isbn` | Exact identifier lookup; unique values kept in source order. |
| `doi` | `oapen.identifier.doi` | Exact identifier lookup; DOI URL prefix removed. |
| `publisher` | `oapen.relation.isPublishedBy_publisher.name`, then `oapen.imprint` | Display and filtering. |
| `book_url` | `dc.identifier.uri` | Canonical DOAB record link. |
| `download_url` | `BITSTREAM_Download_URL` | Direct access link when provided. |
| `license_url` | `BITSTREAM_License` | Shows the book's own license; separate from metadata CC0. |
| `semantic_text` | Derived from title, alternate titles, subjects, and abstracts | A ready input for future model experiments; source fields are retained for other weighting choices. |

Text is HTML-unescaped, stripped of simple markup, whitespace-normalized, and Unicode-normalized to NFC. Accents, scripts, and original wording are preserved. Multiple values use DOAB's semicolon separator and are stored as lists. Deduplication uses only `book_id`; books with the same title, DOI, or ISBN may be distinct editions or translations.

## Exclusions and checks

Rows whose `dc.type` is not `book` are excluded. Book rows without `id` or `dc.title` are rejected and counted. A complete publication requires at least 50,000 unique books. The report also counts duplicates and missing abstracts, subjects, languages, and record URLs. These missing fields are measured, not guessed.

`semantic_text` is **not** an embedding, model score, confidence score, or relevance label. The metadata does not include NYU holdings or book full text.
