# Data preparation runbook

## For every team member

1. Open the GitHub repository or a GitHub Codespace for it; the dataset itself lives at [Tox1/LibrariesBookData](https://huggingface.co/datasets/Tox1/LibrariesBookData).
2. Use Python 3.11 or newer and create a project-only environment: `python -m venv .venv`.
3. Activate it and install checks: `python -m pip install -e '.[dev]'`.
4. Run `ruff check .` and `python -m pytest -q`. Tests use small synthetic records, not a local DOAB dump.

The `.venv` directory is ignored by Git. No Hugging Face token is needed to inspect the public dataset or run tests.

## Publish a fresh complete snapshot

1. Confirm the GitHub repository has an Actions **repository secret** named `HF_TOKEN`. Its fine-grained Hugging Face token must have read and write contents permission for `Tox1/LibrariesBookData`.
2. Open **Actions → Prepare and publish DOAB metadata → Run workflow** on the main branch.
3. Watch the preparation step. It reads the official DOAB CSV directly into the runner's memory, writes a compressed Parquet catalog in the runner's temporary directory, and checks the book count.
4. If preparation passes, the publish step validates the checksum, row count, and schema, then commits the four output files to Hugging Face together.
5. Confirm `manifest.json`, `quality_report.json`, `README.md`, and `data/books.parquet` are visible in the Hugging Face dataset. Compare the manifest count with the Actions log.

The workflow is manual to avoid repeated full-feed processing. It does not commit raw DOAB data or upload it as a GitHub artifact. Its temporary output is removed after the run, and the runner is ephemeral.

## Interpret a failure

| Failure | Meaning and response |
| --- | --- |
| Source download or required-header error | DOAB may be unavailable or may have changed its feed; check the current DOAB metadata page before changing the mapping. |
| Prepared count below 50,000 | The feed may be incomplete or book type values may have changed. Inspect `quality_report.json` in the runner log only if available; do not lower the threshold without checking the source. |
| Checksum, schema, or row-count error | The prepared bundle changed or is incomplete; rerun preparation. |
| Hugging Face 401/403 | Check that the `HF_TOKEN` secret exists and its token has permissions for the selected dataset. Never print the token. |
| Hugging Face upload error | Check the dataset repository and service status; rerun after the issue clears. A failed upload should not be treated as a new published snapshot. |

## Update or roll back

Changes to field mapping require a code review, updated tests and data dictionary, and a schema-version change if output columns or types change. A new successful run replaces the current dataset files with a new commit. Hugging Face keeps previous repository revisions, so a prior snapshot can be referenced by commit if the new one needs investigation.

## Cost and data location

The workflow uses GitHub-hosted Actions and Hugging Face's public dataset repository. Both have service limits and policies that may change; check them before relying on this as an always-on service. No cloud bill is created by this code. Only the small project code and synthetic test inputs need to live on a developer's machine.
