# Synthesize and Implement — Steps 8 to 9

Loaded from `SKILL.md` Step 1 on the **fixes**, **feature** and **refactor** routes. Step 10 verification of what you build here is in `references/verify.md`. The acceptance checklist you build against is in the ledger, which exists by now on every route that reaches this file (the grill created it, or Step 2.75 did).

## Step 8 — Synthesize

Think and merge inline using anchors; pull exact bytes on demand. On merge, run a **seam-check**: reconcile shared types and call signatures across worker outputs rather than stapling summaries together. For state, lifecycle, caching, or failure designs, trace one value end-to-end before committing to the shape.

Read the project glossary (the repo's `CONTEXT.md`, or the context's own under a `CONTEXT-MAP.md`, else `glossary.md` in the ledger directory) and the decision record (`docs/adr/`, else `decisions.md` in the ledger directory) when they exist, so names in code match the settled language and no settled decision is quietly reversed. A **module** has one **interface** and an **implementation**; **leverage** is what callers get from depth (more capability per unit of interface learned) and **locality** is what maintainers get (change, bugs and knowledge concentrate in one place). A **seam** is the place where a module's interface lives, where behavior can be swapped without editing there; a module may keep private **internal seams** for its own tests, never exposed through the interface.

- Reshaping a module boundary, interface, or seam: read `design.md` now, before choosing the shape.
- A state model or screen uncertain enough that arguing costs more than building: read `prototype.md` now.

## Step 9 — Implement

Implement inline by default. Read-to-edit stays inline and verbatim, in narrow edits. Tick each step of the ledger's `Files` build map with one narrow edit as it lands (`ledger-template.md`).

### Test-first, at the seams the grill agreed

Tests verify behavior through the interface, never through the internals of the module under test: a good test reads like a line of the acceptance checklist, uses only the public surface, and survives an internal rewrite. A module's own private internal seams may carry its own tests, but nothing outside it tests through them. The seams under test are the ones named under the ledger's checklist, by the grill or at Step 2.75; write no test at a seam not named there. If none were named, name them in one line before the first test and add them to the ledger. An item that maps onto no seam is a finding about the code's shape, not a reason to test past the interface.

The loop is **red, then green, one slice at a time**: write one failing test for one checklist item, watch it fail, write only enough code to pass it, watch it pass, next slice. A test that was never red proves nothing; a gate added in this task must be seen red once before its green counts (Step 10 holds you to this). Vertical slices, never all tests first then all code: bulk tests verify imagined behavior and lock in structure before the implementation has taught you anything. Refactoring is not part of the loop; it belongs to review.

Three test shapes to refuse:

- **Implementation-coupled.** Mocks internal collaborators, tests private functions, asserts on call counts, or verifies through a side channel (querying the table instead of calling the read interface). The tell: it breaks on a refactor that changed no behavior.
- **Tautological.** The expected value is computed the way the code computes it, so the test passes by construction. Expected values come from an independent source: a known literal, a worked example, the spec.
- **Boundary-blind.** Mock only at system boundaries you do not control (external services, time, randomness, sometimes the filesystem), through injected dependencies with one specific function per operation, never a generic fetcher whose mock needs conditional logic. Never mock your own modules.

### Delegating implementation

Delegate only parallel-independent slices in separate worktrees; that buys isolation, not context savings. Give each worker the ledger's relevant checklist items and the seam it owns. **After any implementation subagent, read `git diff` inline** and check the worker did not weaken a spec or a test to make its claim pass: a loosened assertion, a skipped test, a widened type, a swallowed error. Then tick the build steps it completed; workers never edit the ledger.
