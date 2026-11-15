# Evaluation phase record

## 2026-11-15: pilot evaluation framework

The published 91,667-book index is pinned to Hugging Face revision `f54ded49b97a92ca8e5dce0463500043ea2a19a4`. We chose a reproducible cloud pilot because the team wants to own the candidate selection and ranking while keeping the full index off laptops.

We added 12 authored questions across English, Spanish, French, and German. They include subject searches and one known-title query. Development and holdout labels are included so later ranking changes can be checked without using every question for tuning. This set checks the machinery and exposes examples; it does not represent actual student needs.

The collector runs keyword, semantic, and hybrid modes on every question, times warm searches, and pools the top 10 candidates for human review. The review sheet includes metadata and a short abstract excerpt; relevance is deliberately blank. Checksums and source revisions make the output traceable. The scorer rejects incomplete, invalid, duplicated, or changed judgments before reporting Success@5, pooled nDCG@10, known-title top-one, warm p95 latency, group breakdowns, and abstract-availability counts.

The GitHub Actions job uses temporary runner storage for the pinned index and model. Its browser summary contains the review pool, and its short-lived artifact contains the CSV files. No third-party search API selects candidates. The separate [runbook](runbook.md) covers operation and grading.

Local verification passed: 32 tests, Ruff, workflow YAML parsing, and `git diff --check`. The real-index CLI refused a laptop run before downloading anything. The purpose branch `evaluate-search-quality` passed [GitHub checks](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43693158514), then was fast-forwarded to `main`. The GitHub connector could read checks but returned HTTP 403 when asked to create a pull request, so the authorized Git push was used.

The [first cloud evaluation run](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43693270526) passed on 2026-11-15. It collected 233 distinct question–book pairs from 12 questions, left every relevance grade blank, and deliberately skipped scoring. The [five-file review artifact](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43693270526/artifacts/14153335931) was uploaded successfully at 113,795 bytes and expires on 2026-12-15. The job's browser summary shows all review candidates without a laptop index download. These are operational results only; they do not establish that any returned book is useful.

Changing `pyproject.toml` also triggered the existing [DOAB preparation workflow](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43693270595). It passed, again wrote 91,667 books, and published catalog revision `c436c43dfd58db15accea210aa5013bffdcfb6ce`. The evaluation remains pinned to the previously verified index revision `f54ded49b97a92ca8e5dce0463500043ea2a19a4`, so that catalog refresh does not alter this pilot's search input.

Next: human reviewers grade every pair in the pilot sheet, and the team expands to 100–150 anonymous natural questions before treating any quality KPI as meaningful. No human relevance labels exist yet; quality targets remain unmeasured.

## 2026-11-15: shared human review handoff

The first pilot artifact was retrieved only as a small temporary ZIP, verified against its recorded query and review checksums, and used to create 12 question-specific CSV files in `evaluation/review/pilot/`. The files contain 233 selected metadata rows, about 120 KB in total, rather than the full catalog or index. They are sorted by book ID and omit search ranks to reduce grading bias. All 233 relevance cells remain blank. Of the 233 rows, 37 have no abstract preview; each still has an HTTPS source link.

`src/libraries_evaluation/review.py` checks the frozen question–book pool, metadata, and grade values; it reports partial progress and assembles a full judgment file only after every row is graded. A lightweight workflow checks grading edits without downloading the index. The full evaluation workflow no longer runs after each review-file edit; a manual run after completion recollects and validates the pinned candidates before scoring. The [review design](review-design.md), [plan](review-implementation-plan.md), and [runbook](runbook.md) record the decisions and team steps. [Question collection guidance](question-collection.md) covers the later, larger natural-query study.

Seven focused review tests passed after the missing-module red test; the complete suite passed 39 tests. Ruff, workflow YAML parsing, and whitespace checks passed locally. Cloud check results and final publication details are recorded after the branch is pushed.
