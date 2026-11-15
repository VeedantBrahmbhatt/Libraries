# Project handover

## Current scope

The first session prepared 91,667 DOAB book records from its direct repository export. Code is in `src/libraries_data`; test fixtures are synthetic. The [shared output](https://huggingface.co/datasets/Tox1/LibrariesBookData/commit/daba70f6e6de9f7a5c9a1f830fd255415c6d6bb7) is in `Tox1/LibrariesBookData`, and `HF_TOKEN` is stored as a GitHub Actions repository secret. The [publication run](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43653263362) passed.

The second phase added `src/libraries_search`: a pinned multilingual E5 encoder, project-owned SQLite keyword search, exact vector search, and reciprocal-rank fusion. The [four-part cloud run](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43682889772) built and smoke-tested an index for all 91,667 books, then [published it to the shared Hugging Face dataset](https://huggingface.co/datasets/Tox1/LibrariesBookData/commit/f54ded49b97a92ca8e5dce0463500043ea2a19a4). The [index manifest](https://huggingface.co/datasets/Tox1/LibrariesBookData/raw/f54ded49b97a92ca8e5dce0463500043ea2a19a4/search/v1/manifest.json) pins the source, model, checksums, and sizes. The [recovery record](Search/parallel-build-plan.md) explains the earlier single-runner timeout and parallel design. The README is the current entry point and must be updated with every later project phase.

## How to continue

1. Read the [data preparation design](Data-Preparation/design.md), [field dictionary](Data-Preparation/data-dictionary.md), and [runbook](Data-Preparation/runbook.md).
2. Check the [preparation record](Data-Preparation/session-log.md), [search record](Search/session-log.md), and relevant GitHub Actions runs before claiming that a dataset or index was published.
3. Start later work on a purpose-named branch, add tests and documentation for that phase, and update the root README.
4. Follow the [search runbook](Search/runbook.md) to query or rebuild the owned search index in a remote environment. The source dataset itself does not provide our search API or ranking.
5. Evaluate real search relevance with the [evaluation plan](Evaluation/README.md) before claiming the ranking meets student needs. A smoke query checks operation only.
6. Build the student-facing interface as a later phase. Real student login and profiles remain outside this prototype's approved scope.

## Boundaries to preserve

The prototype has no real student login or profiles. Do not add paid infrastructure, raw DOAB files to Git, or secrets to code. Keep book licenses distinct from the CC0 metadata license. Avoid presenting uncalibrated ranking numbers as confidence probabilities.

DOAB's website advertises over 111,000 books, while its direct export yielded 91,667 books on 2026-11-14. Investigate this gap before claiming full live-site coverage. The 90,000-book publication gate guards against a major drop in export size, not every possible missing record.
