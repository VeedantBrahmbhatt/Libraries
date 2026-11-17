# Browser demo session record

## 2026-11-17 — purpose branch `build-nyu-search-demo`

1. Reviewed NYU's published violet, dark-purple, black, gray, and white design guidance; created an independent NYU-inspired interface without an official logo or affiliation claim. See [design.md](design.md).
2. Chose a static GitHub Pages application because it can be shared free, but cannot run the full Python search server. Browser inference keeps query selection and ranking in project code.
3. Pinned E5 small, E5 base, and GTE base browser models; selected GTE hybrid as the default from the prior full-catalog assistant diagnostic (19/50 first-five fits versus 18/50 and 17/50). This is not a validated student success rate.
4. Built a cloud-only sampler that checks source, index, result, and shard provenance. The successful [sample run](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/44054267545) exported 1,884 selected records and three aligned float16 vector files. The [publication run](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/44058806471) rechecked all hashes, dimensions, and IDs before committing the compact files.
5. Built natural-language search, browser model loading, optional voice input, model and mode selectors, five-first result cards, source links, short metadata summaries, and a relative relevance score. Added frontend ranking and vector-format tests.
6. Added a GitHub Pages Actions deployment workflow, local and meeting runbook, README updates, and handover notes.
7. Enabled GitHub Pages with a workflow source and allowed the purpose branch in the `github-pages` environment. The [latest deployment run](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/44081815805) passed with five frontend tests and a production build. The dependency update's [first successful run](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/44074832303) reported zero npm vulnerabilities after updating Transformers.js and Vitest.
8. Opened the public page and verified that the 1,884-book badge appears; the hosted catalog hash matches the committed manifest. A first E5 small search in the Codex in-app browser could not finish because its large model download returned a network error. Regular-browser end-to-end search remains to be checked before a stakeholder meeting.

The browser sample is deliberately limited and drawn from prior evaluation outputs. It must not be used as a new KPI test. No full-corpus source or full index is stored in this branch.
