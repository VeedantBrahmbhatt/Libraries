# E5 base and GTE model comparison

## Decision

Compare `intfloat/multilingual-e5-base` and `Alibaba-NLP/gte-multilingual-base` with the current E5 small baseline on the same pinned 91,667 DOAB records and 50 frozen authored student questions. Use our own candidate selection and ranking throughout. Keep the complete catalog, model files, and temporary indexes only on GitHub Actions runners. Commit only compact ranked results, judgments, metrics, and documentation.

## Fair comparison

- Pin each model to an exact Hugging Face revision; record model, source, and result checksums.
- Use the same original source `semantic_text`, v2 keyword database, first-five success rule, and 50 questions for both models. Keep the current keyword plus meaning-search fusion unchanged.
- Limit book and query inputs to 512 tokens for a comparable first test. E5 receives its `query:` and `passage:` prefixes; GTE receives the same text without those E5-specific prefixes.
- Build each model's vectors in four validated cloud shards; assemble them with the verified v2 keyword database. Do not publish the experimental full indexes.
- Save top-ten semantic and hybrid results and measured warm search times. Review every new first-five question–book pair before computing fit KPIs. Carry an existing assistant grade only for the same question and book.
- Report first-five success, first-result success, strong precision at five, warm p95, language groups, and the number of new versus carried judgments. Use only the small frozen artifacts for scoring on the laptop.

## Gates and limits

The current baseline is hybrid **17/50** under assistant review. More than 40/50 means at least 41. A larger model may improve candidate recall but cannot fix missing books or weak catalog descriptions. This is a development comparison on authored questions, not a human acceptance test. Model loading, memory, and total search response time on a public free host remain separate deployment checks.

## Implementation sequence

1. Add synthetic tests for model input conventions, revision pins, shard integrity, and ranked-run collection; watch each fail before implementation.
2. Add one cloud-only trial command and a branch-scoped workflow that runs four shards per model, then assembles, searches, and uploads only compact results.
3. Verify local tests and lint; push the purpose branch and monitor cloud jobs, fixing concrete failures.
4. Download only compact results, validate them, review new pairs, compute the same KPIs as the current baseline, and update the README, evaluation record, and handover.

## Cloud compatibility finding

The first GTE shard run failed on its first batch with a nonsensical `position_ids` index. GitHub Actions had installed Transformers 5.23.0; the [model's own issue #30](https://huggingface.co/Alibaba-NLP/gte-multilingual-base/discussions/30) identifies uninitialized position buffers with Transformers 5 and warns they can also silently produce wrong embeddings. Pin Transformers 4.57.6 for both trial models and reject GTE loading under version 5 or later. The failed run produced no trustworthy GTE vectors or score. Rerun after the pin; do not reuse any failed shard artifact.
