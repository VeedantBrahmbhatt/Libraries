# Evaluation phase record

## 2026-11-15: pilot evaluation framework

The published 91,667-book index is pinned to Hugging Face revision `f54ded49b97a92ca8e5dce0463500043ea2a19a4`. We chose a reproducible cloud pilot because the team wants to own the candidate selection and ranking while keeping the full index off laptops.

We added 12 authored questions across English, Spanish, French, and German. They include subject searches and one known-title query. Development and holdout labels are included so later ranking changes can be checked without using every question for tuning. This set checks the machinery and exposes examples; it does not represent actual student needs.

The collector runs keyword, semantic, and hybrid modes on every question, times warm searches, and pools the top 10 candidates for human review. The review sheet includes metadata and a short abstract excerpt; relevance is deliberately blank. Checksums and source revisions make the output traceable. The scorer rejects incomplete, invalid, duplicated, or changed judgments before reporting Success@5, pooled nDCG@10, known-title top-one, warm p95 latency, group breakdowns, and abstract-availability counts.

The GitHub Actions job uses temporary runner storage for the pinned index and model. Its browser summary contains the review pool, and its short-lived artifact contains the CSV files. No third-party search API selects candidates. The separate [runbook](runbook.md) covers operation and grading.

Verification and cloud pilot details are recorded below after execution. No human relevance labels exist yet; quality targets remain unmeasured.
