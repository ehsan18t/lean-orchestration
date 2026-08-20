# Find, Dedup, Triage — Steps 4 to 6

Loaded from `SKILL.md` Step 1 on the **report** and **fixes** routes only. The **answer**, **feature** and **refactor** routes have no Find step and must not load this file. Grounding and navigation are in `references/ground.md`; verification is in `references/verify.md`.

## Step 4 — Find (review/audit only)

Partition the surface, assign each finder a slice, broadcast the shared grounding to all of them. Never hand the whole surface to every finder.

- Budget: **~3-5 finder dispatches per review.** Prefer fewer, larger slices.
- **Pick the tier per slice, in one pass.** `finder-lite` for breadth, where reading carefully is the work. Full `finder` where the defect class needs sustained reasoning: concurrency, lifecycle, caching, security, spec drift across files. A cheap sweep followed by an expensive one doubles the dispatch count the budget exists to hold down.
- **A finder's job is coverage, not filtering.** Never put a severity floor in a dispatch ("only high-severity", "be conservative", "don't nitpick"): it is obeyed literally, the finding is judged below the bar and dropped silently, and your recall falls while nothing looks wrong. Findings return with severity and confidence; Steps 5-6 do the cutting.
- **code-defect** covers every slice. **spec-conformance** runs where the grounding maps a spec claim onto the slice. **design-critique** runs once, over the seams — module boundaries, signatures, shared types. Seams span slices, so the seam pass is exempt from the partition and counts as one finder against the budget. When you send all lenses in one dispatch, name them explicitly and say which slice owns the seams.
- If the budget drops a lens or a slice, **say so in the deliverable.** Silent truncation reads as full coverage.

## Steps 5-6 — Dedup, then Triage

Collapse findings to root cause **across lenses**. One root in three files is one finding, not three verifications.

- **fixes** → triage is a **filter**: fix-now only what shows a wrong result or can wedge or lose data. The rest become notes.
- **report** → triage is a **rank + label** (`fix-now` / `note` / `won't-fix`). Keep everything.
- Both: filter against the won't-fix registry so settled decisions are not reparaded.

Triage is the master cost lever. The cheapest verifier is the finding you decided not to chase.

