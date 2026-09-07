# Diagnose — Steps 4 to 9 on the fixes route when the defect is already named

Loaded from `SKILL.md` Step 1 when the prompt names the defect (something broken, throwing, failing, wrong, or slow). It replaces Find, Dedup, Triage, Verify-findings and Implement: its loop ends in the fix and its regression test, and Step 10 (`verify.md`) then walks the checklist. Skip a phase only with a stated reason.

**Before anything else, read the ledger** of the broken work, and the decision record for the area (`docs/adr/`, else `decisions.md` in the ledger directory). An unverified assumption near the symptom is hypothesis number one, not a shortcut past the loop: reproduce the symptom red in the cheapest form Phase 1 allows, flip the assumption, and only if the loop goes green is the bug a false assumption, fixed on the `amend` route with that loop as its gate. A symptom attributed to an assumption without being seen red once ships a wrong fix exactly when the attribution is wrong. Then confirm you know the *expected* behavior. If it is not written anywhere and not obvious, that is a decision, not a fact: ask one question with a recommended answer before hypothesizing. Debugging toward the wrong expectation is the most expensive way to be busy.

## Phase 1 — Build a red-capable loop

**This is the whole skill.** A tight pass/fail signal that goes red on *this* bug finds the cause; bisection, hypotheses and instrumentation merely consume it. Without one, reading code produces theories, not fixes. Spend disproportionate effort here and refuse to give up.

Ways to build one, in rough order of preference: a failing test at whatever seam reaches the bug; a script against a running dev server; a CLI run on a fixture input diffed against a known-good output; a headless browser script asserting on DOM, console or network; a captured real payload or event log replayed through the code path in isolation; a throwaway harness that boots one service with mocked dependencies and calls the path once; a property loop over a thousand random inputs when the output is "sometimes wrong"; a bisection harness (`git bisect run`) when the bug appeared between two known states; a differential run of old versus new, or of two configs, through the same input. Last resort, when a human must click: script the human, with numbered steps and a place to paste what they saw, so even that loop is structured.

**Tighten it.** Faster (cache the setup, skip unrelated initialization, narrow the scope), sharper (assert the exact symptom, not "did not crash"), deterministic (pin time, seed randomness, isolate the filesystem, freeze the network). A two-second deterministic loop is the tool; a thirty-second flaky one is barely better than none. For a non-deterministic bug the goal is a *higher reproduction rate*, not a clean repro: loop the trigger a hundred times, parallelize, add stress, narrow timing windows, inject sleeps. A bug that reproduces half the time is debuggable; one in a hundred is not. Keep raising the rate until it is.

Run the loop in the sandbox exec tool where one is available, so its output never rents main context.

**Exit criterion.** One command you have already run, whose invocation and output you can paste, that drives the real bug path, asserts the user's exact symptom, gives the same verdict every run (for a flaky bug: a pinned, high reproduction rate), finishes in seconds, and runs unattended (or, as the last resort above, drives the human through a script). If you catch yourself building a theory before this command exists, stop: that is the failure this file prevents. If you genuinely cannot build one, say so, list what you tried, and ask for the environment, a captured artifact (log dump, HAR, recording with timestamps), or permission to add temporary instrumentation. Never hypothesize without a loop.

## Phase 2 — Reproduce, then minimize

Run it red. Confirm it is the *user's* failure and not a nearby one; the wrong bug gets the wrong fix. Capture the exact symptom for Phase 5 to check against.

Then shrink the repro to the smallest scenario that still goes red: cut inputs, callers, config, data and steps one at a time, re-running after each cut. Done when removing any remaining element turns it green. A minimal repro shrinks the hypothesis space and becomes the regression test for free.

## Phase 3 — Hypothesize, several at once

Write three to five ranked hypotheses before testing any. One hypothesis anchors on the first plausible idea. Each must be falsifiable: *if X is the cause, then changing Y makes the bug disappear, or Z makes it worse.* A hypothesis that cannot state its prediction is a hunch; sharpen it or drop it.

Show the ranked list to the user in a few lines before testing. They often re-rank it instantly ("we just deployed a change there") or have already ruled one out. Do not block on the reply.

## Phase 4 — Instrument one variable at a time

Every probe maps to one prediction from Phase 3. A debugger or REPL beats logs when the environment allows it; otherwise targeted logs at the boundaries that separate hypotheses, never "log everything and grep." Tag every debug line with one unique prefix such as `[DBG-7f3a]` so cleanup is a single search. For a performance regression, logs are the wrong tool: measure a baseline first (timing harness, profiler, query plan), then bisect.

## Phase 5 — Fix at the root, regression test first

Turn the minimized repro into a failing test at a *correct* seam: one that exercises the bug as it happens at the real call site. A test at a seam too shallow to reproduce the chain (single caller where the bug needs two, a unit where the bug is an interaction) gives false confidence; if no correct seam exists, say so in the deliverable, because that is itself a finding about the codebase.

Watch the test fail, apply the fix, watch it pass, then re-run the original un-minimized loop. A fix that only satisfies the minimized repro is not yet a fix. The fix addresses the cause the winning hypothesis named; a fix that makes the symptom disappear without explaining it is a strike.

## Phase 6 — Clean up and write back

Before declaring done: the original repro no longer reproduces; the regression test passes or the missing seam is recorded; every tagged debug line is gone; throwaway harnesses are deleted. State the confirmed cause in the commit message and in the ledger's log, so the next reader learns it.

Then ask what would have prevented this bug. If the answer is architectural (no seam to test at, tangled callers, hidden coupling), record it as a note for the deliverable, after the fix is in, not before: you know more now than when you started.
