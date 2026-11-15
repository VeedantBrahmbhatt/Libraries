# Evaluation phase

This phase collects comparable results from our keyword, semantic, and hybrid search for the same 12 draft questions. The questions cover English, Spanish, French, and German, and include development and holdout groups. They are authored pilot prompts, not real student questions or evidence of relevance.

The [design](design.md) explains the measurements and their limits. The [review handoff design](review-design.md) explains the shared grading files. The [runbook](runbook.md) tells the team how to run the cloud job and judge results. The [session log](session-log.md) records what was built and verified. The [implementation plans](implementation-plan.md) and [review plan](review-implementation-plan.md) record the work sequence.

No book has a human relevance label yet. The collector leaves every grade blank, and the scorer refuses to calculate relevance metrics until every returned question–book pair is judged. Its scores are measurements of a judged candidate pool, not confidence percentages.

The [first cloud pilot](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43693270526) passed on 2026-11-15 and produced 233 distinct pairs for review. The [12 shared question sheets](../../evaluation/review/pilot/README.md) preserve the selected metadata in GitHub with blank grades. Its [original artifact](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43693270526/artifacts/14153335931) is available until 2026-12-15. Neither source contains completed judgments or a relevance report.

For a later meaningful assessment, collect 100–150 natural, anonymous student-style questions across the intended languages. The provisional targets are 80% of questions with a clearly useful book in the top five, hybrid top-ten quality at least 10% above keyword-only, 95% known-title success at rank one, and 95% of warm searches under two seconds. These are targets, not achieved results.
