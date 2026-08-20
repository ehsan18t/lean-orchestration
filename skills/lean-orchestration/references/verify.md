# Verify — Steps 7 and 10

Loaded from `SKILL.md` Step 1 on any route that verifies: findings (Step 7, report and fixes routes) or an implementation (Step 10, fixes / feature / refactor routes). Steps 8-9 sit between these two and live in `references/implement.md`.

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
- **Gates first**, in the sandbox where available. Spend a skeptic only on what gates cannot see. A gate added in this task must be seen red once before its green counts.
- **Walk the acceptance checklist** item by item, reporting each as met / not met / not checked. Where there is no checklist because the request was unambiguous, say that plainly rather than inventing one. `code-review` checks the work against repo standards; the checklist checks it against what the user actually said.
- **Refactor routes flip the question to behavior preservation**: gates green before and after, and the skeptic hunts for behavior *changes*. Verdicts invert — PROVEN means a proven change, so preservation is disproven; SURVIVES means old and new held equivalent, which is the good outcome. Say which sense you mean when you tag it.
- Verifier scope is **correctness and spec, not taste.** Nits are logged, not looped.
- **Strike rule**, keyed on recurrence rather than count: three different unrelated fixed issues is review working. **Same class three times, or fixes that breed new issues, means stop patching and interrogate the plan.** You hold this state.
- On any fixes or feature route, invoke `code-review` before delivering.

