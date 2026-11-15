# Evaluation phase

Human relevance evaluation has not begun. Synthetic tests and a cloud smoke query check software behavior, not whether a result satisfies a student's information need. The team should collect at least 100–150 natural student-style queries across the intended languages, judge book relevance, and keep some queries unseen while choosing ranking settings.

Compare keyword-only, semantic-only, and hybrid results on the same query set. Track whether a relevant book appears in the top five, top-ten ranking quality, known-title success, language-level results, missing-abstract impact, duplicate results, and warm response time. The provisional goals discussed with the user are 80% of queries with a relevant top-five result, at least 10% better top-ten ranking than keyword-only for the hybrid system, 95% known-title top-one success, and 95% of warm searches within two seconds. These are targets, not measured outcomes or release claims.

`rank_score` and cosine similarity are relative ranking signals, not calibrated confidence probabilities. A confidence percentage would require a separate calibration study with human judgments. The source export also has 91,667 books versus DOAB's advertised 111,000-plus; evaluate only corpus-covered questions for relevance and report absent-book cases separately.
