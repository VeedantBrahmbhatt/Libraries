# Search evaluation runbook

## Run the pilot

1. Open the repository's **Actions** tab and select **Collect and score owned search evaluation**.
2. Select **Run workflow** on `main`. The workflow also runs when evaluation code or questions reach `main`.
3. The job downloads the pinned published index and model to a temporary GitHub runner. It uses our `SearchEngine` for all three ranking modes. No full index is downloaded to a teammate's laptop.
4. Open the completed job's **Summary** for the top examples and complete review pool. The **search-evaluation-pilot** artifact contains `runs.csv`, `timings.csv`, `review.csv`, `manifest.json`, and `summary.md`; GitHub retains it for 30 days.

The job needs no Hugging Face token because the published dataset and model are public. It uses free GitHub Actions capacity, subject to the repository's available quota. The large index is discarded when the job ends. Only the small review output remains as a GitHub artifact during its retention period.

## Judge the results

Use `review.csv` as the exact grading template. Each row is one question–book pair returned by at least one mode. The same book may have different ranks across modes, but receives one grade per question. Read the title, subjects, abstract preview, and source page before assigning:

| Grade | Meaning |
| --- | --- |
| `0` | Does not answer the question |
| `1` | Partly useful or related |
| `2` | Clearly useful for the question |

Leave `relevance` blank when unsure and resolve it with another reviewer; a blank row cannot be scored. Do not change any other column. Keep names, email addresses, and real student details out of questions and judgments. The review output is small; it may be edited in a temporary CSV copy or in GitHub's browser, while the full catalog and index stay remote.

Commit the completed sheet as `evaluation/judgments/pilot.csv` on a purpose-named branch, review it, then merge it into `main`. The next workflow run validates every row against the newly collected run and writes `metrics.json` only when every pooled pair has a valid 0/1/2 grade. If the question file, index, or ranking code changes, recollect and rejudge the new pool. A failed scoring step means the judgments are incomplete or no longer match, not that a search mode scored zero.

## Read the report

`success_at_5` means a clearly useful book appeared in the first five. `pooled_ndcg_at_10` measures ordering within books the three modes retrieved. `known_title_top_1` checks the expected ID for known-title questions. `latency_p95_ms` is the slow end of warm search times on the GitHub runner. Breakdown counts are important because the 12-question pilot is too small for broad claims.

`rank_score` and semantic similarity are relative signals, not confidence percentages. A book missing from the 91,667-book export is a corpus coverage issue; it cannot be fixed by reranking the returned books. Expand to 100–150 anonymous natural questions and complete human judgments before assessing the provisional project targets.

## Change or rerun

Edit `evaluation/queries/pilot.jsonl` only when intentionally changing the pilot. Keep stable IDs for unchanged questions. Run local synthetic tests with `python -m pytest -q` and `ruff check .`; the real-index command refuses to run outside GitHub Actions. Read [the design](design.md) before altering metric definitions, and record each change in [the session log](session-log.md) and root README.
