# Feedback design record

## 2026-11-19 — `design-public-feedback-loop`

1. Reviewed the current GitHub Pages browser demo, existing human-review rubric, 1,884-book sample limitations, and the unmet more-than-40/50 relevance target.
2. Proposed explicit per-book ratings and a whole-list none-fit signal. The user chose **any visitor** rather than invited testers for the first release.
3. Kept feedback private and separate from public Git, and retained the decision that no real NYU login or profile is part of the prototype.
4. Chose a replaceable feedback API/private database boundary because static GitHub Pages cannot receive submissions. Cloudflare Worker plus D1 is the free pilot candidate, not a deployment decision or a guarantee of production capacity.
5. Required human review and frozen evaluation before any feedback-derived ranking or model change. Public anonymous ratings are diagnostic signals, not verified student labels.
6. Wrote [the proposed design](design.md) and [build sequence](roadmap.md). No application or infrastructure code was changed, and no feedback is currently collected.
