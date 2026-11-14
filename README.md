# Libraries

Libraries is an NYU-focused prototype for discovering open-access books. This repository currently covers **data preparation**. Search, ranking, and the interface are later phases.

## Current phase

The preparation workflow streams DOAB's [repository metadata export](https://www.doabooks.org/en/researchers/full-faq), keeps book records, validates them, and publishes a compressed catalog to [Tox1/LibrariesBookData](https://huggingface.co/datasets/Tox1/LibrariesBookData). The DOAB metadata is CC0; the books have their own licenses. No raw DOAB dataset is committed here.

## Repository guide

| Path | Purpose |
| --- | --- |
| `src/libraries_data/` | Data preparation and publishing commands |
| `tests/` | Synthetic-record tests; no DOAB dump |
| `.github/workflows/` | GitHub Actions validation and manual publication |
| `Documentation/Data-Preparation/` | Design, steps, field definitions, operations, and session record |
| `Documentation/Model/` | Scope and handover for model work |
| `Documentation/Evaluation/` | Scope and handover for evaluation work |
| `Documentation/HANDOVER.md` | How to continue the project |

## Run and update

See [the data preparation runbook](Documentation/Data-Preparation/runbook.md) for exact setup, commands, publishing steps, and troubleshooting. The GitHub Actions workflow is the intended way to publish: it uses the `HF_TOKEN` repository secret and temporary runner storage. It runs after data-preparation changes reach `main`, and can also be started manually.

## Project status

The first preparation phase is complete. [The published snapshot](https://huggingface.co/datasets/Tox1/LibrariesBookData/commit/daba70f6e6de9f7a5c9a1f830fd255415c6d6bb7) contains **91,667 books** from 102,078 rows in DOAB's direct export, prepared on 2026-11-14. The compressed Parquet file is about 117 MB in the shared Hugging Face repository. [The manifest](https://huggingface.co/datasets/Tox1/LibrariesBookData/raw/main/manifest.json) gives the exact count, source, date, and checksum; [the quality report](https://huggingface.co/datasets/Tox1/LibrariesBookData/raw/main/quality_report.json) lists missing fields and exclusions. The [publication run](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43653263362) passed. No actual dataset file was saved on a team member's laptop.

DOAB's website advertises over 111,000 books, more than this official export yielded. Treat this as an export snapshot for the prototype, not proven coverage of every live-site title. Search and model work will build on this shared corpus in later phases. Update this README and the relevant `Documentation/` folder after each phase.
