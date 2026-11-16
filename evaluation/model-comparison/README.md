# Model comparison evidence

This folder contains compact search results and assistant judgments from the controlled [E5 base and GTE trial](../../Documentation/Evaluation/embedding-model-comparison-results.md). The full book list, model weights, and search vectors are not stored here.

| File | Purpose |
| --- | --- |
| `e5-base/manifest.json` | Pinned model, source, query, and result checksums from the cloud run. |
| `e5-base/runs.csv` | First ten E5 base books for each of 50 queries in meaning-only and combined search, with rank and runner timing. |
| `e5-base-labels.csv` | One strict assistant relevance judgment per distinct query–book pair in the first five; 222 prior identical-pair judgments carried, 191 new pairs inspected. |
| `e5-base-metrics.json` | Recomputed E5 base quality and timing figures from the checked run and labels. |

GTE files will be added only after its eight shards and full 50-query search succeed. The [runbook](../../Documentation/Evaluation/embedding-model-comparison-runbook.md) explains how to reproduce the scoring. These are assistant-reviewed development results, not human ratings.
