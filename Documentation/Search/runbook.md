# Search index runbook

## What runs where

GitHub stores the code and runs the full index build in Actions. The pinned book file and finished search artifacts live in `Tox1/LibrariesBookData` on Hugging Face. The full build command refuses to run outside GitHub Actions so a teammate cannot accidentally download the real catalog onto a laptop. Tests use synthetic books only.

## Check code without the dataset

1. Create a project-only Python 3.11 environment: `python -m venv .venv`.
2. Install test tools: `python -m pip install -e '.[dev]'`.
3. Run `ruff check .` and `python -m pytest -q`.

The project environment and caches are ignored by Git. This step does not download the model, the real book file, or the indexes.

## Build and publish in the cloud

1. Check the pinned `SOURCE_REVISION` and `MODEL_REVISION` in `src/libraries_search/config.py`. The source revision must contain the expected `manifest.json` and `data/books.parquet`.
2. Confirm the GitHub Actions repository secret `HF_TOKEN` can write to `Tox1/LibrariesBookData`.
3. Open **Actions → Build and publish owned search index → Run workflow** on `main`. The same workflow also runs when search code or its workflow reaches `main`.
4. Follow the build, smoke-search, and publish steps. The job checks source and output checksums, schema, counts, vector dimensions, SQLite integrity, and row alignment before upload.
5. Verify `search/v1/manifest.json`, `search/v1/books.sqlite`, and `search/v1/vectors.npy` in the Hugging Face dataset. Compare the published manifest with the Actions log.

The workflow installs a CPU-only model runtime. It uses temporary runner disk and deletes both the source cache and output directory after every run. `HF_TOKEN` is available only in the publishing step. No index is committed to GitHub.

## Reading the search output

`libraries-search --input-dir <remote-index-directory> --query 'climate adaptation' --mode hybrid --limit 10` runs our own keyword and semantic retrieval on an already downloaded index. Run this in a remote demo environment, not on a laptop under the current data-location rule. Modes are `keyword`, `semantic`, and `hybrid`; `--offset` selects later results. `rank_score` combines positions in the two result lists. It is not a probability or a confidence percentage.

The workflow's smoke search proves that the published code can return results from the built index. It does not prove that students will find the results relevant; the [evaluation notes](../Evaluation/README.md) describe that separate requirement.

## Failure handling

| Signal | Response |
| --- | --- |
| Pinned source file or checksum changed | Stop. Compare the source revision and manifest before updating the pin. |
| Model returns wrong dimensions, missing values, or non-unit vectors | Stop. Check the pinned model revision and encoding instructions. |
| SQLite count or integrity fails | Stop. Do not upload a partial or misaligned index. |
| GitHub runner runs out of time or space | Reduce batch size or split the build while keeping the same pinned inputs; do not silently switch to an external search provider. |
| Hugging Face 401/403 | Check the `HF_TOKEN` secret permissions without printing the token. |
| Upload fails | Keep the previous index snapshot; rerun after fixing the cause. |

## Refreshing inputs

When the prepared book dataset changes, review its quality report, update the pinned source revision in code and documentation, then run the workflow again. When the model changes, update its exact revision and rebuild every book vector. The `search/v1` manifest records both revisions and file checksums so the team can trace any search result to its inputs.
