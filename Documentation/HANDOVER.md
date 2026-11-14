# Project handover

## Current scope

The first session prepares DOAB book metadata from its full OAI-PMH feed. Code is in `src/libraries_data`; test fixtures are synthetic. The shared output belongs in `Tox1/LibrariesBookData`, and `HF_TOKEN` is stored as a GitHub Actions repository secret. The README is the current entry point and must be updated with every later project phase.

## How to continue

1. Read the [data preparation design](Data-Preparation/design.md), [field dictionary](Data-Preparation/data-dictionary.md), and [runbook](Data-Preparation/runbook.md).
2. Check the latest [session record](Data-Preparation/session-log.md) and GitHub Actions run before claiming that a dataset snapshot was published.
3. Start later work on a purpose-named branch, add tests and documentation for that phase, and update the root README.
4. Build the search index from the shared Hugging Face dataset with your own retrieval and ranking code. The prepared data does not provide a search API or an index.

## Boundaries to preserve

The prototype has no real student login or profiles. Do not add paid infrastructure, raw DOAB files to Git, or secrets to code. Keep book licenses distinct from the CC0 metadata license. Avoid presenting uncalibrated ranking numbers as confidence probabilities.
