# Data preparation session record — 2026-11-14

## Request and approved scope

Prepare the complete DOAB book metadata catalog for a later NYU-focused semantic-search prototype. Keep the code and its history in GitHub, the processed catalog in one Hugging Face dataset, and no actual dataset files on a team member's laptop. Use a purpose-named branch and document each step, file, and decision. Search models, ranking, scores, and UI are outside this session.

## Steps and reasons

1. Inspected the initially empty local and remote Git repositories. Initialized `main` with an empty commit so feature work could use the requested `prepare-doab-data` branch.
2. Checked DOAB's official metadata page and inspected the live CSV header and one record without saving the feed. This confirmed the source names used in the mapping, including book type, title, author, subjects, abstract, language, identifiers, links, and license.
3. Wrote the design and implementation plan before package code. This records the agreed source, boundaries, validation, and publishing approach.
4. Created a project-only Python environment in ignored `.venv/`. The repository contains code and synthetic tests, not a DOAB dump.
5. Wrote tests for multilingual normalization, book selection, edition identity, CSV header validation, catalog output, small-feed rejection, and bundle integrity before implementing those behaviors.
6. Implemented streaming CSV reading, model-neutral normalization, bounded-batch Parquet writing, quality reporting, and checked Hugging Face publishing.
7. Added a test workflow for each push and a full-feed publish workflow with manual dispatch and a restricted main-branch trigger. The publish workflow reads `HF_TOKEN` only during the upload step and removes temporary output afterward.
8. Added the root README, data dictionary, runbook, model and evaluation handoff notes, and project handover.

## Important decisions

| Decision | Reason |
| --- | --- |
| Official DOAB CSV feed | Provides the full metadata export without delegating search or candidate selection. |
| Stream instead of download a raw file | Keeps raw DOAB files off laptops and out of Git; bounds processing memory. |
| Preserve separate source fields and add `semantic_text` | Supports keyword, hybrid, and multilingual model experiments without losing original field boundaries. |
| No translation, stemming, or lowercasing of descriptions | Preserves multilingual meaning and display quality. Only language codes are lowercased. |
| Deduplicate by DOAB ID only | Avoids collapsing distinct editions and translations. |
| Keep records without abstracts | Prevents silent loss of books; missing descriptions are measured. |
| Require at least 50,000 books | Stops a truncated or unexpectedly changed full feed from replacing the shared dataset. |
| One atomic Hugging Face upload | Avoids publishing a mix of old and new output files. |
| Restricted main-branch publication plus manual refresh | Publishes reviewed pipeline changes automatically, while unrelated documentation edits avoid full-feed processing. A manual run remains available. |

## Verification and publication record

Local verification before branch publication:

- `ruff check .`: passed.
- `python -m pytest -q`: 8 passed.
- Live-source smoke check: the DOAB CSV could be streamed, and its first record had an ID and `dc.type=book`. No actual DOAB row was saved locally.
- First branch push: GitHub Actions check run [#1](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43650602861) completed successfully.

The GitHub Actions checks and full metadata publish must also be inspected before claiming the shared dataset was updated. Results and links are added below after those runs.
