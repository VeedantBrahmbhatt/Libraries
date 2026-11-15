# Search index session record — 2026-11-14

## Approved scope

The user chose GitHub Actions for cloud processing and rejected the proposed graph autoencoder. Build our own keyword and multilingual semantic search baseline from the existing Hugging Face book snapshot. Keep the code in a purpose-named branch and document decisions, files, tests, cloud runs, and output. Do not store real dataset files on a laptop.

## Steps and reasons

1. Reviewed the clean `main` branch, current data-preparation package, publication workflow, handover, and synthetic tests. This established the existing file and secret contracts before adding search code.
2. Created `build-search-index` from `main`. It names the work, as requested, and keeps the new phase separate until reviewed.
3. Pinned the [published source snapshot](https://huggingface.co/datasets/Tox1/LibrariesBookData/commit/daba70f6e6de9f7a5c9a1f830fd255415c6d6bb7) and the [multilingual E5 small model](https://huggingface.co/intfloat/multilingual-e5-small) by exact revision. This makes rebuilds traceable even when repository heads change.
4. Wrote the search design and implementation plan before package code. The selected design uses our own SQLite keyword index, our own book vectors, and our own reciprocal-rank fusion. No external provider chooses candidates.
5. Wrote synthetic tests for source checksum rejection, book/vector alignment, keyword and semantic ranking, malformed queries, duplicate book IDs, damaged artifacts, and restricted upload paths. These tests never fetch real book data.
6. Added bounded-batch Parquet reading, SQLite FTS5, pinned E5 inference, vector validation, a manifest, bundle validation, query ranking, and exact-path Hugging Face publishing.
7. Added a GitHub Actions build with CPU-only PyTorch, a smoke search, temporary runner storage, and secret exposure only in the publish step. It shares a publication concurrency group with the metadata workflow to avoid simultaneous writes to the dataset repository.
8. Added ignored search artifact extensions and a guard that rejects the full-data build outside GitHub Actions. This reduces the chance of a real index or source file being created or committed on a laptop by accident.
9. The initial branch push produced a GitHub Actions workflow-definition failure before any search job started. The job-level `env` expression used `runner.temp`, which is not available when GitHub evaluates that section. Moved the temporary `HF_HOME` assignment into a setup step using `GITHUB_ENV`, where the runner's `RUNNER_TEMP` variable is available. The ordinary code check remained separate.

## File map

| Path | Role |
| --- | --- |
| `src/libraries_search/config.py` | Exact source and model revisions, index version, vector dimension |
| `src/libraries_search/source.py` | Download and validate the pinned input |
| `src/libraries_search/lexical.py` | SQLite book rows and full-text candidate ranking |
| `src/libraries_search/model.py` | Load pinned open-source E5 weights for our own inference |
| `src/libraries_search/build.py` | Stream books, encode vectors, align rows, write manifest |
| `src/libraries_search/shards.py` | Encode a checked, contiguous row range in a parallel job |
| `src/libraries_search/assemble.py` | Verify all shards, join vectors, build keyword rows |
| `src/libraries_search/publish.py` | Verify artifacts and upload only `search/v1/` files |
| `src/libraries_search/search.py` | Select and combine keyword and semantic candidates |
| `.github/workflows/build-search-index.yml` | Four parallel cloud encoders, assembly, smoke test, upload, cleanup |
| `tests/test_search_index.py` | Synthetic correctness and corruption checks |

## Verification and publication

Local verification before the branch push: `python -m pytest -q` passed with 17 tests, `ruff check .` passed, the project installed with `pip install -e '.[dev]'`, all three new command help screens opened, and the full-data build command rejected a non-GitHub laptop run before downloading anything. The [corrected branch code check](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43669025099), [main code check](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43669092904), and [concurrent data-preparation refresh](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43669092892) passed. No relevance-quality claim is made from synthetic tests or a smoke query.

## Full-build recovery — 2026-11-15

The [first full search build](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43669092912) was cancelled at the workflow's three-hour limit. Its log shows steady encoding through 75,008/91,667 books, about 5,000 every 11–12 minutes; no source, model, or vector validation error preceded the cancellation. The smoke query and upload were skipped, and no index was published.

The [parallel build plan](parallel-build-plan.md) keeps the source and model revisions and the same passage text, then divides source rows into four balanced ranges. Added `src/libraries_search/shards.py` for deterministic encoding and `src/libraries_search/assemble.py` for strict range, checksum, source/model, and vector checks before the SQLite build and final publication. The workflow uses four one-day Actions artifacts as temporary handoff files. Synthetic tests now cover range boundaries, assembled row order and search, and damaged or missing shards. The outcome of the next cloud run and remote artifact verification must be added below before claiming publication.

Before the parallel branch push, `python -m pytest -q` passed 19 tests, `ruff check .` passed, both new command help screens opened, and the workflow parsed with four shard jobs and an assembly dependency. No real catalog or model was downloaded to the laptop for these checks.
