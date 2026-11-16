# E5 base and GTE comparison results

## Status and evidence

E5 base is complete. GTE is still building its full-catalog vectors in the [recovery run](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43896334769); no GTE relevance score exists yet. The complete E5 encode shards came from [run 43848201040](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43848201040), and the independent E5 search artifact is [artifact 14239726079](https://github.com/VeedantBrahmbhatt/Libraries/actions/runs/43896334769/artifacts/14239726079). The committed [manifest](../../evaluation/model-comparison/e5-base/manifest.json) pins the exact model, 50 questions, v2 book database, vector and ranking checksums. The compact [ranked results](../../evaluation/model-comparison/e5-base/runs.csv), [assistant labels](../../evaluation/model-comparison/e5-base-labels.csv), and [computed metrics](../../evaluation/model-comparison/e5-base-metrics.json) reproduce the E5 numbers below. The full model and index remain only on temporary cloud runners.

## E5 base versus the current E5 small model

| Search mode | E5 small suitable searches in first five | E5 base suitable searches in first five | E5 base suitable first result | E5 base suitable book slots in first five | E5 base warm p95 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Meaning only | 14/50 | **18/50** | 8/50 | 10.8% | 125 ms |
| Meaning plus keyword | 17/50 | **18/50** | 12/50 | 11.2% | 199 ms |

E5 base adds **one** first-five success in the intended meaning-plus-keyword mode. It remains **22 searches short** of the 40/50 target and **23 short** of a strictly above-40 target. The 95th-percentile timing is a warm GitHub runner measurement, excluding model startup, downloading, network, and the future UI. It is not a deployment response-time promise.

The assistant judged 413 distinct E5 first-five question–book pairs across the two modes. **222** pairs had the same question and book in the earlier E5 small assistant review and kept that judgment. The assistant inspected the other **191** pairs using the displayed title, language, subjects, description, and, for borderline fits, linked publisher or institutional pages. Eight of those newly inspected pairs had a clearly supported full fit. A `0` means the available evidence did not establish the full reading need; it does not assert that the book is useless. No human reviewer graded these results.

The eight newly supported fits are:

| Question | Book | Why it fits |
| --- | --- | --- |
| `student-06` | [*The Ethics of AI*](https://directory.doabooks.org/handle/20.500.12854/160641) | Accessible discussion of AI power, bias, and unequal treatment. |
| `student-19` | [*Translanguaging for Equal Opportunities*](https://uplopen.com/en/books/e/10.1515/9783110769609) | Teacher-led classroom examples that treat home languages as assets. |
| `student-19` | [*Codeswitching in the Classroom*](https://directory.doabooks.org/handle/20.500.12854/121189) | Bilingual teaching practices and classroom learning cases. |
| `student-28` | [*Navigating Pandemic Phases*](https://nordicom.gu.se/en/publications/navigating-pandemic-phases) | A public-health communication case with a chapter on building vaccine trust. |
| `student-32` | [*Trastornos de aprendizaje*](https://editorial.inudi.edu.pe/plus/index.php/libro/trastornos-de-aprendizaje-guia-integral-para-la-evaluacion-intervencion-y-apoyo-educativo-9) | Spanish-language reading-difficulty interventions with cases and evidence. |
| `student-34` | [*Archival Silences*](https://www.routledge.com/Archival-Silences-Missing-Lost-and-Uncreated-Archives/Moss-Thomas/p/book/9781003003618) | Methods for reading archival gaps and a Caribbean archival-memory chapter. |
| `student-39` | [*Groupwork with Refugees and Survivors of Human Rights Abuses*](https://www.routledge.com/Groupwork-with-Refugees-and-Survivors-of-Human-Rights-Abuses/Boyles-Ewart-Biggs-Horn-Lamb/p/book/9781032043883) | Applied, culturally relevant group practice with refugee survivors. |
| `student-47` | [*Indigenous Data Sovereignty*](https://directory.doabooks.org/handle/20.500.12854/36695) | Indigenous rights to collection, ownership, and use of research data. |

The `rank_score` in `runs.csv` is a relative ordering number from our search algorithm, **not a calibrated confidence or probability** that a book fits. A future UI should not display it as a percent without separate calibration and human validation.

Compared question by question, E5 base hybrid newly succeeds on the affordable-housing question with [*Cities and Affordable Housing*](https://directory.doabooks.org/handle/20.500.12854/71469) and the Caribbean archives question with [*Archival Silences*](https://www.routledge.com/Archival-Silences-Missing-Lost-and-Uncreated-Archives/Moss-Thomas/p/book/9781003003618). It loses the previous ocean-plastics success because the suitable book moved to rank seven. E5 base meaning-only search finds a relevant [Spanish special-education guide](https://editorial.inudi.edu.pe/plus/index.php/libro/trastornos-de-aprendizaje-guia-integral-para-la-evaluacion-intervencion-y-apoyo-educativo-9) at rank two and a [public-health communication case](https://nordicom.gu.se/en/publications/navigating-pandemic-phases) at rank one, but the current keyword fusion places neither in its first ten. This shows that ranking logic can still hide useful meaning-search results.

E5 base hybrid succeeds on 17/40 English, 1/2 German, 0/4 Spanish, and 0/4 French questions. Those language groups are tiny. The 50 questions were written by us for fictional personas and are all development cases; they are not natural student searches or an independent acceptance test. This comparison caps both trial models at 512 tokens, so it does not assess GTE's longer-context potential.

With hindsight, taking a suitable first-five book from either E5 base mode would cover **20/50** questions. That is a diagnostic ceiling for these two already reviewed result lists, not a working ranking method: the system does not know a book is suitable at search time. It also remains far below the requested bar, so ranking changes alone on these result lists cannot close the gap.

## Decision pending GTE

Do not promote E5 base based on a one-question gain. Finish the same frozen evaluation for GTE, compare first-five and first-result success, inspect per-question wins and losses, and then decide whether model size or ranking/data changes offer the better next step.
