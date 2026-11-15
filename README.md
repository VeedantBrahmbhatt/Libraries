# Libraries

Libraries is an NYU-focused prototype for discovering open-access books. The repository contains **data preparation** and a project-owned **keyword and multilingual semantic search baseline**. A student-facing interface is a later phase.

## Current phase

The preparation workflow streams DOAB's [repository metadata export](https://www.doabooks.org/en/researchers/full-faq), keeps book records, validates them, and publishes a compressed catalog to [Tox1/LibrariesBookData](https://huggingface.co/datasets/Tox1/LibrariesBookData). The DOAB metadata is CC0; the books have their own licenses. No raw DOAB dataset is committed here.

## Repository guide

| Path | Purpose |
| --- | --- |
| `src/libraries_data/` | Data preparation and publishing commands |
| `src/libraries_search/` | Keyword and meaning-based index building, publishing, and query ranking |
| `tests/` | Synthetic-record tests; no DOAB dump |
| `.github/workflows/` | GitHub Actions validation and manual publication |
| `Documentation/Data-Preparation/` | Design, steps, field definitions, operations, and session record |
| `Documentation/Search/` | Search design, plan, cloud runbook, and session record |
| `Documentation/Model/` | Model choice, pinned version, encoding method, and limits |
| `Documentation/Evaluation/` | Human relevance evaluation plan and provisional targets |
| `Documentation/HANDOVER.md` | How to continue the project |

## Run and update

See [the data preparation runbook](Documentation/Data-Preparation/runbook.md) for exact setup, commands, publishing steps, and troubleshooting. The GitHub Actions workflow is the intended way to publish: it uses the `HF_TOKEN` repository secret and temporary runner storage. It runs after data-preparation changes reach `main`, and can also be started manually.

See [the search runbook](Documentation/Search/runbook.md) for the four-part cloud index build, own-code ranking modes, output files, and failure handling. The full build is restricted to GitHub Actions so a teammate cannot accidentally download the dataset onto a laptop.

## Project status

The first preparation phase is complete. [The published snapshot](https://huggingface.co/datasets/Tox1/LibrariesBookData/commit/daba70f6e6de9f7a5c9a1f830fd255415c6d6bb7) contains **91,667 books** from 102,078 rows in DOAB's direct export, prepared on 2026-11-14. The compressed Parquet file is about 117 MB in the shared Hugging Face repository. [The manifest](https://huggingface.co/datasets/Tox1/LibrariesBookData/raw/main/manifest.json) gives the exact count, source, date, and checksum; [the quality report](https://huggingface.co/datasets/Tox1/LibrariesBookData/raw/main/quality_report.json) lists missing fields and exclusions. The [publication run](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43653263362) passed. No actual dataset file was saved on a team member's laptop.

The original search baseline is on `main`; the four-part build update and 19 synthetic tests are on `build-search-index` for the next merge. The [first full build](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43669092912) encoded 75,008 books before its three-hour single-runner limit stopped it. No index was published by that run. The next build divides the same pinned books across four free GitHub runners, then verifies and combines the parts. See the [parallel build recovery record](Documentation/Search/parallel-build-plan.md). The new cloud run and Hugging Face artifacts must be verified before the index is described as published or search quality as measured.

DOAB's website advertises over 111,000 books, more than this official export yielded. Treat this as an export snapshot for the prototype, not proven coverage of every live-site title. The student-facing interface and human relevance evaluation are later phases. Update this README and the relevant `Documentation/` folder after each phase.
