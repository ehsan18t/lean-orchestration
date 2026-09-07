# Verify — Steps 7 and 10

Loaded from `SKILL.md` Step 1 on any route that verifies: findings (Step 7, report and fixes routes) or an implementation (Step 10, fixes / feature / refactor routes). Steps 8-9 sit between these two and live in `references/implement.md`. The amend route carries its own smaller verify in `amend.md` and does not load this file.

## Step 7 — Verify findings

**Default: no dispatch.** A skeptic buys independence — a reader who did not author the finding and does not share the context that produced it. Spend one only where that is what is in doubt: **contested or high-stakes** survivors. A blatant defect with an obvious failing input rides on the fix plus gates.

State the lens and the burden direction. **Burden direction is yours to decide, not the agent's:**

- Fix is risky or expensive, impact-if-unfixed tolerable → **default-reject.** Prove it real before touching code.
- Impact-if-real is catastrophic (data loss, security, wedge) → **default-suspect.** Prove it safe before dismissing.

The burden falls on whichever side is cheaper to be wrong about. Findings already triaged critical go straight to `skeptic-max`; never pay a plain skeptic first for a finding whose stakes you already know.

- Depth scales with the consumer: a report a human reviews gets one skeptic, since the human is the backstop. An auto-applied edit gets a panel sized to blast radius.
- **Batch small survivors**, soft cap ~5 per skeptic, each with a short stable ID so the returns can be joined back.
- Run independent verifications in parallel. Serialise only to early-exit or when findings interact.
- `INCONCLUSIVE` means the skeptic could not evaluate, not that the finding is dead. Re-dispatch with what it lacked, or carry the finding forward unverified and tag it as such.

## Step 10 — Verify implementation

- **Never add a verification step for its own sake**, and never dispatch one to feel surer. A step whose only content is "check again" produces over-verification, not correctness. Each item below earns its place by catching something self-checking structurally cannot.
- **Gates first**, in the sandbox where available. Spend an LLM only on what gates cannot see. A gate added in this task must be seen red once before its green counts.
- **Walk the acceptance checklist** in the ledger item by item, marking each `[x]` met, `[-]` not met (with why, in the log), or `[ ]` not checked. A checklist marked unconfirmed (no grill ran, or no one could answer it) is walked the same way, and the deliverable says it was never user-confirmed. The review below checks the work against the repo and the diff; the checklist checks it against what the user actually said. Both are needed and neither substitutes for the other.
- **Refactor routes flip the question to behavior preservation**: gates green before and after, and the skeptic hunts for behavior *changes*. Verdicts invert — PROVEN means a proven change, so preservation is disproven; SURVIVES means old and new held equivalent, which is the good outcome. Say which sense you mean when you tag it.
- Verifier scope is **correctness and spec, not taste.** Nits are logged, not looped.
- **Strike rule**, keyed on recurrence rather than count: three different unrelated fixed issues is review working. **Same class three times, or fixes that breed new issues, means stop patching and interrogate the plan.** Check the ledger's assumptions first: a false one turns a mystery into a one-line correction. You hold this state; record strikes in the ledger log.

### Review — one finder over the diff

A review is a **reader who did not write the diff**, reading it against three things at once: the code itself, the ledger's checklist, and the repo's own standards. That is one `finder` dispatch with the lenses named explicitly: `code-defect`, `spec-conformance` against the checklist items you paste in (the finder cannot see the ledger), and `standards`. Pin the diff to a fixed point first (`git diff <base>...HEAD`, three-dot), confirm it is non-empty, and pass the commit list (`git log <base>..HEAD --oneline`) so unasked behavior is visible per commit; a bad ref should fail here, not inside a dispatch. If there is no checklist, say so in the dispatch, tell the finder to report `spec-conformance` as not run, and say in the deliverable that spec conformance was not reviewed. The tier follows the rule under **When it runs** below. A diff spanning more than three modules is split into module slices with one finder each, all three lenses, the same way Step 4 partitions a review and within its budget: prefer fewer, larger slices.

The three lenses stay separate in the return and in your triage: code that follows every standard but implements the wrong item, and code that meets every item but breaks the project's conventions, are both failures, and merging the lists lets one mask the other. Do not rerank across lenses.

**When it runs.** Every change that ships code is read by someone who did not write it, with one exemption: a change to a literal value, a copy string, or the ledger alone. What varies with the stakes is the tier:

- **feature** route: always, full `finder`.
- **fixes** route: always. Full `finder` when the diff touches a seam, a shared type or signature, more than one module, a user-visible number, persisted state, or will be auto-applied, or when the defect class needs sustained reasoning (concurrency, lifecycle, caching, security, a spec claim that resolves across files); `finder-lite` for a single-module diff below both lines, where reading it carefully is the whole job. Either way the checklist walk also reads the diff hunk by hunk and treats any hunk that serves no checklist item (a copied block, a guard removed "while here") as scope creep to revert or to record as a new item.
- **refactor** route: the behavior-preservation skeptic above is the review; do not also run a finder.
- **amend** route: the same tier rule as fixes, under the exemption above (see `amend.md`).

Spec findings from the review feed the checklist walk, standards findings are fixed or logged as nits, code-defect findings go through Step 7's burden rule like any other finding. A finding that survives all of this and touches data, security, or a wedge goes to `skeptic-max` before the fix is applied, never after.
