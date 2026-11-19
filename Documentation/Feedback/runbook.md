# Feedback release and review runbook

## What visitors see

The public [Violet Library demo](https://veedantbrahmbhatt.github.io/Libraries/) searches 1,884 open-access books in the visitor's browser. Under each recommendation, a visitor can choose Useful, Somewhat useful, or Not useful; a fixed reason is optional. A separate control says none of the shown books fit. The page explains what a submission sends. Searching, opening a link, or changing the model does not send feedback. A saved rating can be changed or deleted while the page stays open. There is no login or personal profile.

## What the service stores

Each submission stores the query, shown book IDs and positions, one rating and optional reason, model and mode, release ID, catalog checksum, timestamps, and a daily keyed IP hash for abuse limits. It does not store raw IP, NYU email, or a persistent visitor ID. The receipt remains in the visitor's browser memory. The private D1 database is attached to the [Sites feedback service](https://violet-library-feedback.fabled-tetra-1279.chatgpt.site/health); the public API has no read endpoint. Raw feedback expires after 90 days when `/health` runs. The scheduled [retention workflow](../../.github/workflows/feedback-retention.yml) calls that endpoint daily.

## Release order

1. If the catalog changes, run `node feedback-api/scripts/sync-catalog.mjs` and commit the generated allowlist with the new frontend manifest.
2. Run `node --test feedback-api/test/*.test.js`, `npm test --prefix frontend`, `npm run build --prefix frontend`, `bash feedback-api/scripts/build.sh`, and `node feedback-api/scripts/validate-artifact.mjs` using Node 22 or later.
3. Publish `feedback-api/` through the Sites source helper, save its pushed commit and archive as a Site version, and deploy it. Confirm `/health` returns 200 and a synthetic submission can be deleted.
4. Push the purpose branch to GitHub, then fast-forward `build-nyu-search-demo` to that reviewed commit. The Pages workflow builds with the feedback API URL and Git commit as release ID. Confirm its run succeeds and the public page shows feedback controls after a search. The Pages environment permits its deployment branch, not arbitrary feature branches.
5. Keep the retention workflow on the repository's default `main` branch so GitHub schedules it. Run it manually once after deployment and check its status. Keep the Sites secret `RATE_PEPPER` outside Git and GitHub Actions.

If the API is down, book search still works; visitors see a retry message when they try to send feedback. If the catalog checksum changes before the API is redeployed, feedback returns an error until the service is updated. Do not deploy a new catalog before its allowlist.

## Weekly review

1. In Sites, allow only named project maintainers to view private D1 rows. Export the minimum fields needed into a private review environment; do not commit raw visitor queries or ratings.
2. Group reports by topic, language, reading level, broken links, and `none_fit`. Inspect duplicates and implausible patterns; anonymous votes are not verified student labels.
3. Check whether a suitable book exists in the **demo sample** before blaming ranking. Fix missing metadata or sample coverage with a versioned data change.
4. Have reviewers judge a selected set of question–book pairs using the established 0/1/2 rubric. Keep those human judgments separate from anonymous feedback.
5. Test proposed ranking or model changes against a frozen independent question set. The current target is at least 41/50 questions with a clearly suitable top-five book; no release has met this target yet.
6. Release a change only after measured improvement and regression review. Keep its catalog, model, code revision, and evaluation record together for rollback.

The current release **collects** feedback. It does not retrain models or change recommendations in real time. There is no bot challenge yet, so treat public votes as low-trust diagnostic signals.
