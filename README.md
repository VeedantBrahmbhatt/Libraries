# Libraries

Libraries is an NYU-focused prototype for discovering open-access books. This repository currently covers **data preparation**. Search, ranking, and the interface are later phases.

## Current phase

The preparation workflow reads the complete [DOAB metadata feed](https://doabooks.org/en/librarians/doab-metadata), keeps book records, validates them, and publishes a compressed catalog to [Tox1/LibrariesBookData](https://huggingface.co/datasets/Tox1/LibrariesBookData). The DOAB metadata is CC0; the books have their own licenses. No raw DOAB dataset is committed here.

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

See [the data preparation runbook](Documentation/Data-Preparation/runbook.md) for exact setup, commands, publishing steps, and troubleshooting. The GitHub Actions workflow is the intended way to publish: it uses the `HF_TOKEN` repository secret and temporary runner storage.

## Project status

Data preparation is being implemented on `prepare-doab-data`. The README and session record are updated with each phase.
