# Prepared catalog data dictionary

The output is `data/books.parquet` in [the shared Hugging Face dataset](https://huggingface.co/datasets/Tox1/LibrariesBookData). One row is one DOAB **book record**. The source is DOAB's full OAI-PMH `oai_dc` feed, which was inspected live on 2026-11-14. Empty strings and empty lists mean the source did not provide a usable value; no values are invented. The Parquet schema is versioned in `src/libraries_data/schema.py`.

| Output column | OAI-PMH source | Preparation and reason |
| --- | --- | --- |
| `book_id` | OAI header identifier's handle | Stable identity; deduplication and later updates. |
| `title` | First `dc:title` | Original display title and strongest search signal; required. |
| `alternate_titles` | Additional `dc:title` values | Other searchable title forms, kept separately. |
| `authors` | `dc:creator` | Exact author search and display. |
| `subjects` | `dc:subject`, excluding classification codes and paths | Topic keywords for semantic and keyword search. |
| `classifications` | `dc:subject` classification codes and `::` paths | Broad subjects for browsing or filters; excluded from `semantic_text` to avoid noise. |
| `abstract` | First `dc:description` | Main description for semantic comparison; books without one remain in the catalog. |
| `other_language_abstract` | Additional `dc:description` values | Additional description text, if present. The source does not reliably label its language. |
| `languages` | `dc:language` | Lowercased source codes for language filtering; no translation. |
| `publication_year` | `dc:date type="Issued"` | Leading four-digit year for display or filters. |
| `isbns` | `dc:alternateIdentifier type="ISBN"`, `oapen:relationisbn` | Exact identifier lookup; unique values kept in source order. |
| `doi` | `dc:identifier type="DOI"`, or a DOI URL | Exact identifier lookup; DOI URL prefix removed. |
| `publisher` | `dc:publisher` | Display and filtering. |
| `book_url` | Canonical `dc:identifier type="URL"`, or derived from OAI handle | Stable DOAB record link. |
| `download_url` | A `dc:identifier` ending in PDF or EPUB | Direct access link when clearly identified. |
| `license_url` | `oaire:licenseCondition` URI | Shows the book's own license; separate from metadata CC0. |
| `semantic_text` | Derived from title, alternate titles, subject keywords, and descriptions | Ready input for future model experiments; source fields remain available for other weighting choices. |

Text is HTML-unescaped, stripped of simple markup, whitespace-normalized, and Unicode-normalized to NFC. Accents, scripts, and original wording are preserved. OAI values are kept as separate list entries; no semicolon splitting is applied to them. Deduplication uses only `book_id`; books with the same title, DOI, or ISBN may be distinct editions or translations.

## Exclusions and checks

OAI rows whose resource type is not `book`, including deleted records and chapters, are excluded. Book rows without an ID or title are rejected and counted. A complete publication requires at least 100,000 unique books, consistent with DOAB's stated collection size. The OAI pagination code also checks the expected total record count. The quality report counts duplicates and missing abstracts, subjects, languages, and record URLs. Missing fields are measured, not guessed.

The first CSV-based trial produced 55,606 books from 60,859 rows, while DOAB's public site says it covers over 111,000 books. That trial is recorded in the session log and is superseded by the full OAI-PMH harvest. `semantic_text` is **not** an embedding, model score, confidence score, or relevance label. The metadata does not include NYU holdings or book full text.

Source: https://doabooks.org/en/librarians/doab-metadata
