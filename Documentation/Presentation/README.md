# Technical presentation

The [editable PowerPoint](violet-library-technical-deep-dive.pptx) and [PDF preview](violet-library-technical-deep-dive.pdf) contain a 14-slide technical overview for a stakeholder meeting. The deck covers the data source, full research index, browser search, model comparison, quality and engineering blockers, public deployment, and feedback loop. Speaker notes give the repository source for each measured claim.

## Presentation map

| Slides | Subject | Main repository sources |
| --- | --- | --- |
| 1–2 | Project scope and system boundaries | `README.md`, `Documentation/UI/runbook.md`, `Documentation/Feedback/runbook.md` |
| 3–4 | Data preparation and parallel index build | `Documentation/Data-Preparation/data-dictionary.md`, `Documentation/Search/parallel-build-plan.md` |
| 5–6 | Ranking logic and browser models | `src/libraries_search/`, `frontend/src/search.ts`, `frontend/src/model-config.ts` |
| 7–8 | Search diagnostics and model comparison | `Documentation/Evaluation/persona-results.md`, `Documentation/Evaluation/embedding-model-comparison-results.md` |
| 9–10 | Quality and engineering blockers | `Documentation/Evaluation/query-fit-results.md`, `Documentation/Evaluation/assistant-v2-results.md` |
| 11–12 | Public deployment and feedback release | `.github/workflows/deploy-demo-pages.yml`, `feedback-api/worker/index.js`, `Documentation/Feedback/runbook.md` |
| 13–14 | Next decisions and live demo | `Documentation/Evaluation/embedding-model-comparison-results.md`, `Documentation/UI/runbook.md` |

## Scope of the numbers

The full research catalog has 91,667 prepared DOAB book records. The public GitHub Pages demo searches a selected 1,884-book sample in each visitor's browser. The 50-question fit counts on slides 7 and 8 belong to full-catalog development runs, not the public sample. “Relative score” in the interface orders a result list; it is not a probability.

The first baseline run measured 11/50 keyword, 14/50 meaning-only, and 15/50 hybrid top-five clear fits. The later model comparison measured 17/50 E5 small hybrid, 18/50 E5 base hybrid, and 19/50 GTE base hybrid. Those are different experiment phases. The stated goal is more than 40 of 50, or at least 41/50.

## Editing and rebuilding

Open the PPTX in PowerPoint, Keynote, or LibreOffice Impress to edit the slides directly. Text, diagrams, and bars are native presentation objects. The PDF is for sharing and quick review.

The slide source is [`build-technical-deck.js`](build-technical-deck.js). For a fresh local export, install or supply the `@oai/artifact-tool` runtime, set `ARTIFACT_TOOL_MODULE` to its module path if it is outside normal Node module resolution, then run `node Documentation/Presentation/export-local.mjs`. Generated PNGs and intermediate files stay under `Documentation/Presentation/output/`; only the final PPTX and PDF are committed. For this release, a 14-page PDF was converted from the exported PPTX and visually checked against the native slide renders.

## Live demonstration

Open [Violet Library](https://veedantbrahmbhatt.github.io/Libraries/), enter a natural student request, compare the model choices, open a book link, and rate a recommendation. Expect a first-use model download in the browser. The site displays five books at first and up to ten through More options.
