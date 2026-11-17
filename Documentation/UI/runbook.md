# Browser demo runbook

## What is deployed

The public GitHub Pages site serves a static interface, metadata for 1,884 open-access DOAB books, and three compact, book-aligned vector files. The visitor's browser downloads one selected multilingual model and computes its own query vector. Project-owned JavaScript ranks every book in the demo sample. No outside provider chooses candidates for a visitor's query. The full 91,667-book research index is **not** queried by the public demo.

The 1,884 records are the union of saved top-ten result pools from the prior 50-question E5 small, E5 base, and GTE comparisons. The source order is preserved and every file is checked against a SHA-256 manifest. Because this sample was selected from evaluated results, it is not representative of the full collection and cannot be used to verify the earlier 17/50, 18/50, or 19/50 quality figures. No book text is copied; the short excerpts come from DOAB metadata.

## Run it locally

1. Clone the `build-nyu-search-demo` branch of `VeedantBrahmbhatt/Libraries`.
2. Install Node 20 or later and run `npm ci --prefix frontend` from the repository root.
3. Run `npm test --prefix frontend` and `npm run build --prefix frontend`.
4. Run `npm run dev --prefix frontend` and open the localhost URL that Vite prints.
5. Write a full-sentence request, leave **Best evaluated · GTE hybrid** selected, and select **Find books**.
6. The first query downloads the GTE model; later queries reuse its browser cache. Switch to E5 small or E5 base to compare them.
7. Read five results; select **More options** for up to ten. Open a source link to inspect a book record.

The approximate first-use model downloads are E5 small 118 MB, E5 base 278 MB, and GTE base 340 MB. Browser cache behavior varies. Wait for the loading message before assuming the search has failed. A stable internet connection is required for the initial model download. Voice entry appears only where the browser supports its speech API.

## Meeting demo

Open `https://veedantbrahmbhatt.github.io/Libraries/` on a laptop with a current Chrome or Edge browser and stable internet. Run one query before the meeting so the default model is cached. Explain that the first five results and their summaries come from metadata, the score is relative within a search, and the 1,884-book sample is a limited prototype. Enter a new natural-language question live; the examples are optional. Compare models only if the meeting connection can handle their separate first-use downloads. The UI has no real student login, profile storage, or NYU catalog access.

## Publish and maintain

The `deploy-demo-pages.yml` workflow builds and tests `frontend/` from the purpose branch, then publishes `frontend/dist` to GitHub Pages. The branch's `frontend/public/data/` contains only the small, checked sample. `build-browser-demo-sample.yml` regenerates the sample on a temporary GitHub runner from pinned source/index revisions and saved result pools. `publish-browser-demo-sample.yml` verified and committed the sample once; its source artifact expires, so future regeneration should use a fresh build run and update its artifact run ID. Do not commit the 91,667-book Parquet source, full search index, model weights, `HF_TOKEN`, or local caches.

Update this runbook and the root README when the sample, models, ranking, hosting, or user flow changes. Check [the evaluation reports](../Evaluation/embedding-model-comparison-results.md) before making claims about search quality. The 40/50 target remains unmet and human review is pending.
