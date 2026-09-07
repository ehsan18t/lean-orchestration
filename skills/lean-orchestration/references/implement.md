# Synthesize and Implement — Steps 8 to 9

Loaded from `SKILL.md` Step 1 on the **fixes**, **feature** and **refactor** routes. Step 10 verification of what you build here is in `references/verify.md`. The acceptance checklist you build against is in the ledger, which exists by now on every route that reaches this file (the grill created it, or Step 2.75 did).

## Step 8 — Synthesize

Think and merge inline using anchors; pull exact bytes on demand. On merge, run a **seam-check**: reconcile shared types and call signatures across worker outputs rather than stapling summaries together. For state, lifecycle, caching, or failure designs, trace one value end-to-end before committing to the shape.

Read the project glossary (the repo's `CONTEXT.md`, or the context's own under a `CONTEXT-MAP.md`, else `glossary.md` in the ledger directory) and the decision record (`docs/adr/`, else `decisions.md` in the ledger directory) when they exist, so names in code match the settled language and no settled decision is quietly reversed. A **module** has one **interface** and an **implementation**; **leverage** is what callers get from depth (more capability per unit of interface learned) and **locality** is what maintainers get (change, bugs and knowledge concentrate in one place).

### Design — when the work reshapes a module boundary, interface, or seam

Vocabulary, used exactly so that a dispatch prompt and a review share it. A **module** is anything with an interface and an implementation, at any scale. Its **interface** is everything a caller must know to use it correctly: the signature, plus invariants, ordering constraints, error modes, required configuration and performance characteristics. A **seam** is the place where the interface lives, and where behavior can be swapped without editing there. An **adapter** is a concrete thing that satisfies an interface at a seam. **Depth** is leverage: how much behavior a caller or a test exercises per unit of interface they must learn.

Design **deep modules**: a lot of behavior behind a small interface, at a clean seam, testable through that interface. When shaping one, ask three things: can the number of entry points shrink, can the parameters simplify, can more complexity move inside. Then apply the tests:

- **The deletion test.** Imagine deleting the module. If complexity vanishes, it was a pass-through and should not exist. If complexity reappears across N callers, it was earning its keep.
- **Two adapters make a seam.** Do not introduce an interface unless something actually varies across it, usually production plus test. One adapter is indirection, not a seam.
- **The interface is the test surface.** Callers and tests cross the same seam. If a test needs to reach past the interface, the module is the wrong shape.
- **Depth is a property of the interface, not the implementation.** A deep module may be composed inside of small, swappable parts with **internal seams** that its own tests use; those seams stay private and never get exposed through the interface because a test wanted them.
- **Accept dependencies, return results.** Take collaborators as parameters instead of constructing them inside; return values instead of mutating inputs. Both make the seam testable without mocks of your own code.

Dependencies decide how the seam is tested: in-process logic is tested directly; a dependency with a local stand-in (an embedded database, an in-memory filesystem) is tested with the stand-in; a service you own across a network gets a port with an in-memory adapter for tests and a transport adapter for production; a third-party service gets the same port with a mock adapter. When a deepened module replaces several shallow ones, delete the old tests at the shallow interfaces once tests at the new interface exist; layering both is waste.

**Design it twice** when the seam is consequential and the first shape is the only one on the table. Inline: sketch two radically different interfaces (minimal entry points versus optimized for the common caller is the usual pair), each with its invariants, ordering constraints and error modes, not just signatures; compare on depth, locality of change, and seam placement; pick one with a stated reason, or a hybrid. Dispatched, when the user wants alternatives worth a fresh context each: two to four `Plan` or `general-purpose` workers in one message, each with the same brief (the constraint the interface must satisfy, the dependencies behind the seam and their category above, the glossary terms) and a different design constraint: minimize the interface to one to three entry points; maximize flexibility; make the most common caller trivial; ports and adapters for a cross-seam dependency. Each returns the interface with invariants, ordering and error modes, one usage example, what it hides, its dependency strategy, and where its leverage is thin. Present them, compare on the same three axes, recommend one, and propose a hybrid if parts combine.

### Prototype — when arguing costs more than building

A prototype is throwaway code that answers one question, and the question decides its shape. A state model or logic question gets a tiny interactive terminal program, the logic in a pure module of its own, that the user drives through the cases that are hard to reason about on paper, printing the full state after every action; the moments where the user says "that should not be possible" are the payload, and the pure module can be lifted into the real code if the model survives. A "what should this look like" question gets several radically different variants of one screen behind a switch that is hidden from production builds, so they can be compared in place.

Rules: name it so no reader mistakes it for production, and keep it next to what it prototypes; one command to run; no persistence unless persistence is the question, and then a scratch database or a local file named as a prototype to wipe, never the real database; variants never wire to real mutations; no tests, error handling or abstractions beyond what makes it run; surface the state after every action. When it has answered the question, fold the validated decision into the ledger as a decision line, commit the prototype to a throwaway branch out of main and note the branch in the ledger, and delete it from the working tree. The main branch keeps the decision, never the prototype.

## Step 9 — Implement

Implement inline by default. Read-to-edit stays inline and verbatim, in narrow edits.

### Test-first, at the seams the grill agreed

Tests verify behavior through the interface, never through the internals of the module under test: a good test reads like a line of the acceptance checklist, uses only the public surface, and survives an internal rewrite. A module's own private internal seams may carry its own tests, but nothing outside it tests through them. The seams under test are the ones named under the ledger's checklist, by the grill or at Step 2.75; write no test at a seam not named there. If none were named, name them in one line before the first test and add them to the ledger. An item that maps onto no seam is a finding about the code's shape, not a reason to test past the interface.

The loop is **red, then green, one slice at a time**: write one failing test for one checklist item, watch it fail, write only enough code to pass it, watch it pass, next slice. A test that was never red proves nothing; a gate added in this task must be seen red once before its green counts (Step 10 holds you to this). Vertical slices, never all tests first then all code: bulk tests verify imagined behavior and lock in structure before the implementation has taught you anything. Refactoring is not part of the loop; it belongs to review.

Three test shapes to refuse:

- **Implementation-coupled.** Mocks internal collaborators, tests private functions, asserts on call counts, or verifies through a side channel (querying the table instead of calling the read interface). The tell: it breaks on a refactor that changed no behavior.
- **Tautological.** The expected value is computed the way the code computes it, so the test passes by construction. Expected values come from an independent source: a known literal, a worked example, the spec.
- **Boundary-blind.** Mock only at system boundaries you do not control (external services, time, randomness, sometimes the filesystem), through injected dependencies with one specific function per operation, never a generic fetcher whose mock needs conditional logic. Never mock your own modules.

### Delegating implementation

Delegate only parallel-independent slices in separate worktrees; that buys isolation, not context savings. Give each worker the ledger's relevant checklist items and the seam it owns. **After any implementation subagent, read `git diff` inline** and check the worker did not weaken a spec or a test to make its claim pass: a loosened assertion, a skipped test, a widened type, a swallowed error.
