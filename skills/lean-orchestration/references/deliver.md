# Deliver — Step 11

Loaded from `SKILL.md` Step 1 on every route except amend, which carries its own deliver. Every other path ends here, including the ledger update and the write-back.

## Step 11 — Deliver

Artifacts go to files, not the chat. Report the path plus a compact summary. **Calibrate length**: cover the substance the task needs and stop — no filler sections, no summary of the summary, no boilerplate around a short answer.

Tag each finding with its verification level so the reader knows where to spend attention: `gate-caught`, `proof-confirmed` (a skeptic returned PROVEN, or you checked it yourself), `refuted-survived` (SURVIVES), `finder-claim` (reported, never independently verified), `refuted`. Most report-mode findings are `finder-claim`; tagging one a level up overstates confidence. `refuted` stays in the report, marked, never silently dropped.

**Report the checklist walk**, item by item, as met / not met / not checked. An item not checked is said so, never rounded up. If the budget dropped a lens or a slice, say so here; silent truncation reads as full coverage.

## Update the ledger

On any **feature**, **fixes** or **refactor** route the ledger already exists (the grill created it, or Step 2.75 did) and is brought current before the deliverable is written: checklist marks, files touched, `updated`, a log line, and `status` (`open` while anything is unmet or not checked, `done` otherwise). Copy to `wont-fix.md` any won't-fix entry that must stay settled beyond this task, so a later report on the same area does not reparade it.

The **answer** and **report** routes create no ledger at Deliver. If the grill ran on one of them, its ledger already exists and is marked `done` here with the checklist walked (for a report, the items are the coverage the review promised). A report's triage decisions that should stay settled go into the won't-fix registry (`wont-fix.md` in the ledger directory), one line each with the reason.

## Write back what would otherwise be relearned

The ledger holds what is specific to this task. A memory holds what will recur across tasks or projects: an assumption that proved false in a way that will repeat, a strike rule that fired for a reason the next session would hit again, a route that had to be corrected. Save one memory recording the fact and how to apply it. Every step above avoids paying twice within a session; this is the same principle across sessions, and the cheapest of them.

If the session has run long, say so now, in one line: the ledger is current and a fresh session will pick the task up from the index.
