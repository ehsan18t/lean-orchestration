---
name: lean-orchestration
description: Use when starting any non-trivial task (a feature, bug hunt, review/audit, design critique, refactor, a follow-up that corrects or extends work already delivered, or a loose narrative request that mixes several of those) before dispatching any subagent or writing a plan. NOT for quick lookups, tight debug loops (a red gate or repro already in hand and a local fix), or single-file changes to work that has no ledger, EXCEPT a single-file change that can alter a user-visible number or wedge/lose state, which does route here. Governs one request, not one conversation: once its content is loaded, re-run Step 0 for each new request in the same conversation and either emit a fresh Route line or say in one line that the prior route still holds.
---

# Lean Orchestration

**Goal: the highest-quality output for the least token spend.** Quality comes from adversarial *framing*, which is free text, plus *fresh context*, which is not. Two things cost money: a **dispatch**, which buys a worker its own context and its own read, and a byte admitted to **your own** context, which is then re-billed on every turn that follows. The second is the one this page used to leave unpriced. Maximum framing; fewest fresh contexts; fewest bytes resident in this one.

The role agents (`navigator`, `finder`, `finder-lite`, `skeptic`, `skeptic-max`) carry their own return contracts and evidence bars. Never restate those in a dispatch prompt; state only the task, the slice, the grounding, and the burden direction.

## Scope: one request, not one conversation

This procedure governs the request in front of you. When a new request arrives later in the same conversation, **you are at Step 0 again**: re-run the anti-trigger, then either emit a fresh Route line or say in one line that the prior route still covers it. Nothing about the *procedure* carries over on its own — a route, a budget, a grounding summary and a strike count each belong to the request that produced them. The **ledger** does carry over: the acceptance checklist, decisions, assumptions and won't-fix entries belong to the task, live in the ledger directory the session-start hook names, and are read by any later request that touches that task (`references/ledger-template.md`). A follow-up reads the ledger; it never re-derives it.

This matters because the two halves of this file decay at different rates. The structure lives in the early steps and fires once. The restrictions read as standing law and persist. Inheriting the restrictions without re-running the routing that justified them is worse than not using this file at all: you get the brakes with no steering.

## Step 0 — Anti-trigger

**First, the ledger check.** If the request corrects or extends work that has a ledger (see the index the hook injected, or the ledgers this conversation wrote), it is an **amend** and routes to `references/amend.md`, however small the change. The small-work exclusions below do not apply to it: a ledger that no longer matches the code is worse than none, because the next session reads it and builds on it. A one-word copy change to ledgered work is still an amend; recording it costs two narrow edits. Only a correction to work that never had a ledger falls through to the rules below.

The frontmatter already excludes small work. A **tight debug loop** means a red gate or a repro is already in hand and the fix is local; a bug without one is not small, it is a `fixes` request. The one small case that routes *in*: a single-file change that can alter a user-visible number or wedge or lose data. That gets gates, then one skeptic, and skips the rest of this file. If in doubt on a small task with no ledger behind it, stay inline.

## Cost model

**1. The escalation ladder.** Rungs are entry depths, not a sequence. Enter where the stakes land.

```
0. Your own check, inline               free, and it already happened. Never instruct it, never buy it twice.
1. Gates (tests / typecheck / lint)     deterministic, near free. ALWAYS first.
2. One adversarial skeptic              buys INDEPENDENCE, not verification.
3. Small panel (2-3 skeptics, different  expensive. ONLY for high blast-radius or auto-applied
   burden directions or slices)          changes. Diversity here is framing, not roles.
4. Proof-burden pass (skeptic-max)      critical findings only. Presumed at the burden direction
                                        you state; flips only on positive proof.
```

Never pay an LLM to find what a gate finds for free, or to repeat a check you already made. Rungs 2 and up buy one thing the main loop cannot: a reader who did not author the claim. Dispatching to "double-check" or "be sure" is not that, and produces over-verification instead of correctness.

**2. Effort: inherit as the baseline; go lower, never higher.** The session's effort level is the user's cost intent for this task. A role may pin *below* it for genuinely light work (`finder-lite`). No role may pin above it, with one deliberate exception: `skeptic-max` pins max, because the proof-burden pass is the one place where being wrong is expensive enough to justify exceeding the baseline. The same rule governs any variant added later.

A `-lite` pin is a floor, not a delta, so when the session already sits at or below it the variants are identical and the plain role is the simpler choice. At a low session effort, skip a marginal skeptic rather than dispatch a weak one: a low-effort skeptic rubber-stamps, which is worse than none because it launders an unverified finding into a verified one.

**3. Dispatch discipline.** A subagent pays a fixed context tax before it reads its prompt, and only the agent definition can slim it. Use the lean roles, all of which strip MCP; reserve `general-purpose` for workers that genuinely need broad tools. Prefer repeated dispatches of the *same* role, which hits a warm cache. Custom agents inherit project CLAUDE.md (never re-paste it; built-in `Explore` and `Plan` skip it); skills content does not arrive, so inject the distilled grounding instead.

**The failure mode here is over-dispatching.** Budgets are a ceiling you enforce, not a target you fill. Never dispatch work you could finish in a handful of tool calls: a few reads, a simple search, a small check. Once you delegate, commit — do not re-derive a worker's findings after it reports. The one exception is reading `git diff` after a worker with write access, which checks something its report structurally cannot.

**Zero-tax execution.** Anything mechanical and multi-command goes to a sandboxed exec tool where one is available (`ctx_batch_execute`, `ctx_execute`): no agent prompt, no inherited CLAUDE.md, raw bytes never reach main context. This covers gates, multi-file lookups, and log or diff scans. Where no such tool is loaded, run it inline and keep only what you need.

**4. Main context is rented, not bought.** Every turn re-reads the entire prefix, so a byte you admit is not paid once, it is paid again on every turn that follows. On a long session that recurring rent, not any fan-out, is the largest line on the bill.

This item is about the **size** of what you admit. It does not tell you whether to dispatch: that call belongs to the discriminator in `ground.md`, and nothing here overrides it.

- **Keep what lands here small — including what comes back.** A worker's return rents exactly like a file you read. One 20k return admitted at turn 8 of a 211-turn session was re-billed 200-odd times and cost more than the dispatch that produced it. Ask a worker for a distilled answer, never a dump. The same discipline applies to what you admit directly: read line ranges rather than whole files, and never re-read a file you already read. **One exception: bytes you are about to edit stay inline and verbatim.** `Edit` matches against exact text, so a summary of a file you then edit is a correctness bug, not a saving. Cost never buys a wrong edit.
- **Tool *inputs* are prefix too.** A `Write` carrying a whole file, or an `Edit` carrying long strings, sits in the prefix exactly like output does — measured, they run about 40% of durable context. Prefer a narrow edit over rewriting a file to change a line.
- **When the session has run long, say so out loud.** You cannot clear your own context; only the user can. So when a lot of work has accumulated and the task is still going, bring the ledger current and tell them plainly that a fresh session will cost less than continuing and will pick the task up from the ledger index. The ledger *is* the checkpoint on any route that has one; on an answer or report route without one, the deliverable file written so far is, so name it. Do not derive a threshold from the window size: on a 1M-token model "half the window" never fires at all. Err toward saying it early — where this mattered, the crossing came in the first tens of turns with nearly all of the spend still ahead.

You cannot read your own prefix size; the harness does not report it, and most of it is never visible to you. So treat the trigger above as a rough sense of accumulated work, not a number you check.

## Step 1 — Route

Classify, then emit one visible line carrying the forecast, so a misroute can be vetoed before it costs anything.

| Axis | Values |
|---|---|
| Deliverable | answer / report / fixes / feature / refactor / amend |
| Review objects | code / design-artifact / spec |
| Scope | repo / branch-diff / module / file |
| Stakes | reversible note to auto-applied edit |

`Route: review of branch diff (code + design), deliverable=report | ~4 dispatches`

**The forecast counts every subagent you plan to spawn** — navigators, finders, skeptics, `Explore`, `Plan`, `general-purpose`, a grounding worker, background navigators (research), and implementation workers in worktrees. If the run will exceed it, emit a corrected line rather than spending past it quietly. Correct the route the same way when evidence contradicts it.

| Deliverable | Path |
|---|---|
| **answer** | Route → Ground → Clarify (if ambiguous) → Navigate → answer inline → Deliver. No Find, Triage or Implement. |
| **report** | Route → Ground → Recon + Clarify (if ambiguous) → Find → Dedup → Triage (rank+label) → Verify contested → Deliver. |
| **fixes** | Route → Ground → Recon + Clarify (if ambiguous) → Find → Dedup → Triage (filter) → Verify contested → Implement → Verify-impl → Deliver. **A defect already named in the prompt** replaces everything from Find through Implement with `references/diagnose.md`, whose loop ends in the fix and its regression test; Verify-impl and Deliver still follow. |
| **feature** | Route → Ground → Recon → Clarify → Navigate → Synthesize → Implement → Verify-impl → Deliver. No Find. |
| **refactor** | Route → Ground (the decision record and the won't-fix registry; a spec only if one exists) → Clarify (if ambiguous) → Navigate → Implement → Verify-impl (flipped to behavior preservation) → Deliver. No Find. |
| **amend** | Route → Load ledger → Classify the correction → Clarify (only what it opened) → Implement inline → Verify affected items → Deliver (ledger updated). No Ground, Recon, Find, or review dispatch by default. |

Every path ends at Deliver, including the write-back in Step 11.

### Load the phase files for your route

Steps 2 through 11 live in `references/`, next to this file, and load only when the route reaches them. Read a file **before** executing its steps, never after. Everything above this line is standing law: it applies to every route and is never reloaded.

| Route | Read, in order |
|---|---|
| **answer** | `ground.md` (+ `grill.md` if Clarify reaches the grill) → `deliver.md` |
| **report** | `ground.md` (+ `grill.md` if Clarify reaches the grill) → `find.md` → `verify.md` (Step 7) → `deliver.md` |
| **fixes** | `ground.md` (+ `grill.md` if Clarify reaches the grill) → `find.md` → `verify.md` (Step 7) → `implement.md` → `verify.md` (Step 10) → `deliver.md` |
| **fixes, defect named** | `ground.md` (+ `grill.md` if Clarify reaches the grill) → `diagnose.md` (replaces `find.md`, Step 7 and `implement.md`) → `verify.md` (Step 10) → `deliver.md` |
| **feature** | `ground.md` → `grill.md` → `implement.md` → `verify.md` (Step 10) → `deliver.md` |
| **refactor** | `ground.md` (+ `grill.md` if Clarify reaches the grill) → `implement.md` → `verify.md` (Step 10, flipped to behavior preservation) → `deliver.md` |
| **amend** | `amend.md` only, which carries its own verify and deliver |

`ledger-template.md` is read once whenever a route creates a ledger (the grill at its start, or Step 2.75 when no grill ran) and is not listed per row.

| File | Steps | Contents |
|---|---|---|
| `references/ground.md` | 2, 2.25, 2.5, 2.75, 3 | Ground once (with research), Recon, Clarify (when to grill), the ledger before building, Navigate |
| `references/grill.md` | 2.5 | The grill: one question at a time, the domain model, the acceptance checklist, the ledger write |
| `references/find.md` | 4, 5-6 | Find, Dedup, Triage |
| `references/diagnose.md` | 4-9 (fixes, defect named) | Reproduce, hypothesize, isolate, fix at the root, regression test; replaces Find through Implement |
| `references/verify.md` | 7, 10 | Verify findings (burden direction), Verify implementation (gates, checklist walk, review, strike rule) |
| `references/implement.md` | 8-9 | Synthesize and implement, with design, prototype and test-first |
| `references/deliver.md` | 11 | Deliver, verification-level tags, ledger update, write-back |
| `references/amend.md` | A1-A6 | The whole amend route, self-contained |
| `references/ledger-template.md` | any | The ledger format, its write points, the project-wide files (`wont-fix.md`, `decisions.md`, `glossary.md`), the checkpoint |

Read each file once per request and hold it for that request. A new request restarts at Step 0 and reloads only what its own route names. **Never execute a phase from memory of a previous request**: that is the same failure as inheriting the restrictions without the routing, one file down. If you find yourself about to skip a read because you think you recall the rule, read it.

## Step 1.5 — Procedures

Everything a route needs lives inside this skill. No external skill is required, and none is named here. Each procedure loads with the phase file that owns it, at the step where it fires, never before.

| Fires at | Procedure | Lives in | Condition |
|---|---|---|---|
| Step 2 | research | `ground.md` | A load-bearing fact lives outside the repo. Runs in the background. |
| Step 2.5 | grill | `grill.md` | Any vague, narrative, or underspecified request. **The default, not the exception.** Carries the domain model for a feature or consequential design. |
| Steps 4-9 | diagnose | `diagnose.md` | The defect is already named. Replaces Find through Implement; its Phase 5 is the test-first loop for that fix. |
| Step 8 | design | `implement.md` | The work reshapes a module boundary, interface, or seam. |
| Step 8 | prototype | `implement.md` | A state model is uncertain enough that arguing costs more than building. |
| Step 9 | test-first | `implement.md` | Implementing a feature, a refactor, or a fix that Find surfaced, at the seams the grill named (or Step 2.75 named). |
| Step 10 | review | `verify.md` | One finder over the diff: always on feature, conditional on fixes, off by default on amend. |

Other installed skills stay available through the Skill tool, but no route depends on one. If the user names one, use it; never substitute it for a step here, and never reimplement a step from memory of one.

## Loop exits — name the exit before entering any loop

- **grill**: the load-bearing set is empty. Not a question count.
- **verify-findings**: every survivor adjudicated, including the ones returned INCONCLUSIVE.
- **verify-implementation**: clean on correctness and spec, or the strike limit is reached, then escalate.
- **fix / re-verify**: governed by the strike rule above, not by whether it feels done.
- **amend**: every affected checklist item re-walked and marked met or not met, gates green, and the ledger records the correction; a not-met item is delivered as such with status left open, and a strike exits to grilling that one item.

No open-ended "keep going until sure."

Exiting a loop is not exiting the procedure, and finishing a request is not finishing with this file. The next request in this conversation starts at Step 0.
