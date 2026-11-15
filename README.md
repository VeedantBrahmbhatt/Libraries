# Libraries

Libraries is an NYU-focused prototype for discovering open-access books. The repository contains **data preparation**, a project-owned **keyword and multilingual semantic search baseline**, and a **search-quality evaluation pilot**. A student-facing interface is a later phase.

## Current phase

The preparation workflow streams DOAB's [repository metadata export](https://www.doabooks.org/en/researchers/full-faq), keeps book records, validates them, and publishes a compressed catalog to [Tox1/LibrariesBookData](https://huggingface.co/datasets/Tox1/LibrariesBookData). The DOAB metadata is CC0; the books have their own licenses. No raw DOAB dataset is committed here.

## Repository guide

| Path | Purpose |
| --- | --- |
| `src/libraries_data/` | Data preparation and publishing commands |
| `src/libraries_search/` | Keyword and meaning-based index building, publishing, and query ranking |
| `src/libraries_evaluation/` | Comparable search runs, human-review pool, and judged scoring |
| `evaluation/queries/` | Authored multilingual pilot questions; no student details |
| `evaluation/review/pilot/` | Twelve small, shared CSV sheets for human grading of the pilot candidates |
| `tests/` | Synthetic-record tests; no DOAB dump |
| `.github/workflows/` | GitHub Actions validation and manual publication |
| `Documentation/Data-Preparation/` | Design, steps, field definitions, operations, and session record |
| `Documentation/Search/` | Search design, plan, cloud runbook, and session record |
| `Documentation/Model/` | Model choice, pinned version, encoding method, and limits |
| `Documentation/Evaluation/` | Evaluation design, cloud runbook, session record, and provisional targets |
| `Documentation/HANDOVER.md` | How to continue the project |

## Run and update

See [the data preparation runbook](Documentation/Data-Preparation/runbook.md) for exact setup, commands, publishing steps, and troubleshooting. The GitHub Actions workflow is the intended way to publish: it uses the `HF_TOKEN` repository secret and temporary runner storage. It runs after data-preparation changes reach `main`, and can also be started manually.

See [the search runbook](Documentation/Search/runbook.md) for the four-part cloud index build, own-code ranking modes, output files, and failure handling. The full build is restricted to GitHub Actions so a teammate cannot accidentally download the dataset onto a laptop.

See [the evaluation runbook](Documentation/Evaluation/runbook.md) to run the pilot in GitHub Actions, inspect the review pool, grade books, and read a scored report. The real-index evaluation command also runs only in GitHub Actions. It does not use Google's or Hugging Face's search ranking.

The [pilot review sheets](evaluation/review/pilot/README.md) let teammates grade one question at a time in GitHub. A lightweight workflow checks partial progress without downloading the index. Once all 233 pairs have human grades, a manual cloud evaluation run validates the frozen candidate pool and calculates metrics. [Question collection guidance](Documentation/Evaluation/question-collection.md) explains the later 100–150-question study.

## Project status

The first preparation phase is complete. [The published snapshot](https://huggingface.co/datasets/Tox1/LibrariesBookData/commit/daba70f6e6de9f7a5c9a1f830fd255415c6d6bb7) contains **91,667 books** from 102,078 rows in DOAB's direct export, prepared on 2026-11-14. The compressed Parquet file is about 117 MB in the shared Hugging Face repository. [The manifest](https://huggingface.co/datasets/Tox1/LibrariesBookData/raw/main/manifest.json) gives the exact count, source, date, and checksum; [the quality report](https://huggingface.co/datasets/Tox1/LibrariesBookData/raw/main/quality_report.json) lists missing fields and exclusions. The [publication run](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43653263362) passed. No actual dataset file was saved on a team member's laptop.

The search index is published. The [four-part cloud run](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43682889772) passed on 2026-11-15: it encoded **all 91,667 books**, assembled the keyword and semantic indexes, returned results for a real smoke query, and [published the verified files](https://huggingface.co/datasets/Tox1/LibrariesBookData/commit/f54ded49b97a92ca8e5dce0463500043ea2a19a4). The [index manifest](https://huggingface.co/datasets/Tox1/LibrariesBookData/raw/f54ded49b97a92ca8e5dce0463500043ea2a19a4/search/v1/manifest.json) records the exact source and model revisions, checksums, and file sizes: about 367 MB for `books.sqlite` and 141 MB for `vectors.npy`. This workflow kept the real catalog and index on cloud runners and Hugging Face, without downloading either to the laptop. The [parallel build record](Documentation/Search/parallel-build-plan.md) explains why the first single-runner attempt was replaced.

Search selection and ranking run in this project's code. Results include a relative rank score and semantic similarity; neither is a calibrated confidence percentage. The smoke query proves the system runs. The [evaluation pilot](Documentation/Evaluation/README.md) now compares keyword, semantic, and hybrid results for 12 authored questions in four languages. Human relevance labels are still required before ranking quality can be claimed.

The [first evaluation cloud run](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43693270526) passed on 2026-11-15. It produced **233 distinct question–book review pairs** from the 12 questions, with all grades blank. Its [small review artifact](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43693270526/artifacts/14153335931) holds the ranked runs, timings, review sheet, manifest, and browser summary through 2026-12-15. No relevance KPI has been measured yet. The same push also reran [catalog publication](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43693270595) because `pyproject.toml` changed; it again wrote 91,667 books. The search evaluation remains pinned to its previously verified index revision.

DOAB's website advertises over 111,000 books, more than this official export yielded. Treat this as an export snapshot for the prototype, not proven coverage of every live-site title. A student-facing interface and a larger, human-judged study are later phases. Update this README and the relevant `Documentation/` folder after each phase.
