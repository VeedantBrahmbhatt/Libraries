# Project handover

## Current scope

The first session prepared 91,667 DOAB book records from its direct repository export. Code is in `src/libraries_data`; test fixtures are synthetic. The [shared output](https://huggingface.co/datasets/Tox1/LibrariesBookData/commit/daba70f6e6de9f7a5c9a1f830fd255415c6d6bb7) is in `Tox1/LibrariesBookData`, and `HF_TOKEN` is stored as a GitHub Actions repository secret. The [publication run](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43653263362) passed.

The second phase added `src/libraries_search`: a pinned multilingual E5 encoder, project-owned SQLite keyword search, exact vector search, and reciprocal-rank fusion. The [four-part cloud run](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43682889772) built and smoke-tested an index for all 91,667 books, then [published it to the shared Hugging Face dataset](https://huggingface.co/datasets/Tox1/LibrariesBookData/commit/f54ded49b97a92ca8e5dce0463500043ea2a19a4). The [index manifest](https://huggingface.co/datasets/Tox1/LibrariesBookData/raw/f54ded49b97a92ca8e5dce0463500043ea2a19a4/search/v1/manifest.json) pins the source, model, checksums, and sizes. The [recovery record](Search/parallel-build-plan.md) explains the earlier single-runner timeout and parallel design. The README is the current entry point and must be updated with every later project phase.

The third phase adds `src/libraries_evaluation` and a GitHub Actions pilot. It compares all three owned search modes on 12 authored multilingual questions, publishes a small human-review sheet, and scores only a complete judged pool. The full index is used only on a temporary GitHub runner. See the [evaluation runbook](Evaluation/runbook.md) and [phase record](Evaluation/session-log.md). No relevance-quality claim is supported until people grade the returned books.

The [first pilot run](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43693270526) passed and produced 233 distinct pairs. The [review artifact](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43693270526/artifacts/14153335931) expires on 2026-12-15. No grades or relevance metrics exist yet. A `pyproject.toml` change also reran the catalog publisher; [that run](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43693270595) passed with 91,667 books, while the pilot remains pinned to its earlier index revision.

The next handoff step saves the 233 ungraded pairs as [12 question files](../evaluation/review/pilot/README.md) in GitHub. The lightweight progress check accepts partial grading and rejects changed candidate rows. The full index is downloaded only when the cloud evaluation workflow is run. See the [question collection guide](Evaluation/question-collection.md) for the separate, larger study. Humans must supply all grades and natural questions; none are inferred by code.

## How to continue

1. Read the [data preparation design](Data-Preparation/design.md), [field dictionary](Data-Preparation/data-dictionary.md), and [runbook](Data-Preparation/runbook.md).
2. Check the [preparation record](Data-Preparation/session-log.md), [search record](Search/session-log.md), [evaluation record](Evaluation/session-log.md), and relevant GitHub Actions runs before claiming that a dataset, index, or evaluation output was published.
3. Start later work on a purpose-named branch, add tests and documentation for that phase, and update the root README.
4. Follow the [search runbook](Search/runbook.md) to query or rebuild the owned search index in a remote environment. The source dataset itself does not provide our search API or ranking.
5. Follow the [evaluation runbook](Evaluation/runbook.md) to judge every pooled question–book pair, then expand the pilot to 100–150 anonymous natural questions before claiming the ranking meets student needs. A smoke query checks operation only.
6. Build the student-facing interface as a later phase. Real student login and profiles remain outside this prototype's approved scope.

## Boundaries to preserve

The prototype has no real student login or profiles. Do not add paid infrastructure, raw DOAB files to Git, or secrets to code. Keep book licenses distinct from the CC0 metadata license. Avoid presenting uncalibrated ranking numbers as confidence probabilities.

DOAB's website advertises over 111,000 books, while its direct export yielded 91,667 books on 2026-11-14. Investigate this gap before claiming full live-site coverage. The 90,000-book publication gate guards against a major drop in export size, not every possible missing record.
