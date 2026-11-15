# Parallel build recovery — 2026-11-15

## Evidence

The [first full search build](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43669092912) encoded 75,008 of 91,667 books before the three-hour job limit cancelled it. Progress was steady at about 5,000 books every 11–12 minutes. The smoke search and publication did not run. No search artifacts were published by that attempt.

## Decision

Keep the exact source snapshot, model revision, passage text, 384 dimensions, keyword index, and ranking algorithm. Split the source rows into four fixed, contiguous ranges. Four standard GitHub runners encode one range each. A fifth runner validates all four vector files, builds the SQLite keyword index from the same pinned source, joins the vectors in source order, runs a real search, and publishes the verified bundle.

This reduces wall time without changing the meaning of the book vectors or asking an external provider to select results. Intermediate shard files are one-day GitHub Actions artifacts; the source and final index remain on temporary runners until the final verified index is uploaded to Hugging Face.

## Implementation and checks

1. Add a shard builder with explicit row boundaries and checksum, model, shape, normalization, and source-revision records.
2. Add an assembler that rejects missing, duplicate, changed, overlapping, or incomplete shards before publishing.
3. Change the workflow to run four independent shard jobs, then one dependent assemble, smoke-search, and publish job.
4. Test shard boundaries, exact row order, search over an assembled synthetic catalog, and damaged-shard rejection without downloading real data locally.
5. Update the runbook, session record, handover, and README with the new workflow and the cloud run result.

The new build is complete only after the cloud workflow succeeds and the three remote `search/v1/` files match its manifest.
