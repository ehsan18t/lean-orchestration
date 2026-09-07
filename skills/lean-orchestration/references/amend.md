# Amend — a correction or extension to work already delivered

Loaded from `SKILL.md` Step 1 on the **amend** route only. This file is self-contained on purpose: a follow-up is the most common request in a real session and must not pay for `ground.md`, `find.md` or `implement.md` to change one thing.

**What routes here.** The request changes work that already exists: a text or copy change, a business rule that turned out wrong, a defect in the feature just built, a small extension ("also handle X"), a reversal of an earlier decision. The work may have been delivered earlier in this conversation or in an earlier session; the ledger index the hook injected is how you find it either way.

**What does not route here.** A correction so large it is a new task: it crosses a module seam, it invalidates more than two checklist items, or "also handle X" is a feature of its own. Say so in one line, emit the fresh route (`feature`, `fixes`, `refactor`), and hand that route the ledger as its grounding. It never re-grills what the ledger already answers.

## Steps

**A1 — Locate the ledger.** Match the request against the ledger index. If no entry matches, list the ledger directory once; if still nothing, the original work never had a ledger (it stayed inline under the anti-trigger) and this is not an amend: go back to Step 0 and route the request on its own merits, creating a ledger only if that route creates one. Never create a ledger for a one-line change.

Read the ledger in full; it is small by design. It is the grounding, so no Recon and no Navigate dispatch unless the correction touches code the ledger does not name.

**A2 — Classify the correction against the ledger.** Every correction contradicts something. Find it:

- a **false assumption** (an `A` entry): the most common cause, and a one-line fix once named;
- a **decision being reversed** (a `D` entry): confirm in one line that the reversal is intended if the ledger records it as `asked`, because the user chose it once;
- a **checklist item that was met as written but wrong as understood**: the item gets rewritten, not the code alone;
- a **defect**: the item was marked met and is not; treat it as a named defect (repro or red gate first, then fix);
- a **scope extension**: a new checklist item.

Write the log line and the item change **before** editing code. The ledger is what the next follow-up reads; an unrecorded correction is the context rot this route exists to prevent.

**A3 — Clarify only what the correction opened.** One batched question with a recommended default, and only if the correction exposes a load-bearing unknown the ledger cannot answer; wait for the answer. Otherwise assume, add the assumption, proceed. Never re-ask what the ledger records. Running non-interactively, there is no one to ask: take your recommended default, record it as an assumption marked unverified, and open the deliverable with it.

**A4 — Implement inline.** Read-to-edit, exact bytes, narrow edits. No implementation subagent for an amend.

**A5 — Verify.** Gates first. Then re-walk **only the affected checklist items** plus any item that shares a file with the change, reporting each as met / not met. Then a reader who did not write the change, over the diff pinned to a fixed point, with the lenses named: code-defect, spec-conformance against the ledger items you paste in, and standards. Exempt only a change to a literal value, a copy string, or the ledger alone. Full `finder` when the diff touches a seam, a shared type or signature, more than one module, a user-visible number, persisted state, money, or will be auto-applied, or when the defect class needs sustained reasoning (concurrency, lifecycle, caching, security, a spec claim that resolves across files); `finder-lite` for a single-module diff below both lines, where reading it carefully is the whole job. A change touching persisted state, money, security, or a user-visible number adds a second `finder` on the `spec-conformance` lens alone, checklist first, diff second; dedup the two returns by root cause, keep the lens labels, never re-rank across readers. Findings are dispositioned before delivery: a code-defect finding is fixed, or refuted with the anchor and logged; a spec finding rewrites the affected item; a standards finding is fixed or logged as a nit; a finding that touches data, security, or a wedge goes to `skeptic-max` before any fix is applied. A named defect fixed here gets its regression test seen red once before green counts.

**Strike rule for amends.** A third amend against the same checklist item, or an amend that breeds a new defect, means the item was never understood: stop patching and grill that item alone (one question at a time, recommended answer) before touching code again; non-interactively, stop and report the strike instead of patching further. Record the strike in the log.

**A6 — Deliver.** Update the ledger: item marks, files, `updated`, a log line, status (`open` while anything is unmet or not checked, `done` otherwise). Report the change in a few lines and name what was re-walked. If an assumption proved false in a way that will recur across projects, save one memory saying how to apply it; otherwise the ledger is the write-back.

## Exit

The amend is finished when every affected item has been re-walked and marked met or not met, gates are green, the review's findings are dispositioned, and the ledger records the correction. An item marked not met is delivered as such, with the reason in the log and the status left `open`; it is never rounded up. A strike exits to the grill of that one item, not to delivery. Not when the change feels done.
