# Synthesize and Implement — Steps 8 to 9

Loaded from `SKILL.md` Step 1 on the **fixes**, **feature** and **refactor** routes. Step 10 verification of what you build here is in `references/verify.md`.

## Steps 8-9 — Synthesize and implement

Think and merge inline using anchors; pull exact bytes on demand. On merge, run a **seam-check**: reconcile shared types and call signatures across worker outputs rather than stapling summaries together. For state, lifecycle, caching, or failure designs, trace one value end-to-end before committing to the shape.

- Reshaping a module boundary, interface, or seam → invoke `codebase-design`.
- A state model uncertain enough that arguing costs more than building → invoke `prototype`, then throw it away.

Implement inline by default; invoke `tdd` at the seams agreed in the grill. Delegate only parallel-independent slices in separate worktrees — that buys isolation, not context savings. **After any implementation subagent, read `git diff` inline** and check the worker did not weaken a spec or a test to make its claim pass.

