---
name: lean-orchestration
description: Use when starting any non-trivial task (a feature, bug hunt, review/audit, design critique, refactor, or a loose narrative request that mixes several of those) before dispatching any subagent or writing a plan. NOT for quick lookups, tight debug loops, or single-file changes, EXCEPT a single-file change that can alter a user-visible number or wedge/lose state, which does route here. Governs one request, not one conversation: once its content is loaded, re-run Step 0 for each new request in the same conversation and either emit a fresh Route line or say in one line that the prior route still holds.
---

# Lean Orchestration

**Goal: the highest-quality output for the least token spend.** Quality comes from adversarial *framing*, which is free text, plus *fresh context*, which is not: every dispatch re-pays its overhead and its read. Maximum framing, fewest fresh contexts.

The role agents (`navigator`, `finder`, `finder-lite`, `skeptic`, `skeptic-max`) carry their own return contracts and evidence bars. Never restate those in a dispatch prompt; state only the task, the slice, the grounding, and the burden direction.

## Scope: one request, not one conversation

This procedure governs the request in front of you. When a new request arrives later in the same conversation, **you are at Step 0 again**: re-run the anti-trigger, then either emit a fresh Route line or say in one line that the prior route still covers it. Nothing carries over on its own — a route, a grounding summary, an acceptance checklist and a strike count each belong to the request that produced them.

This matters because the two halves of this file decay at different rates. The structure lives in the early steps and fires once. The restrictions read as standing law and persist. Inheriting the restrictions without re-running the routing that justified them is worse than not using this file at all: you get the brakes with no steering.

## Step 0 — Anti-trigger

The frontmatter already excludes small work. The one case it routes *in*: a single-file change that can alter a user-visible number or wedge or lose data. That gets gates, then one skeptic, and skips the rest of this file. If in doubt on a small task, stay inline.

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

## Step 1 — Route

Classify, then emit one visible line carrying the forecast, so a misroute can be vetoed before it costs anything.

| Axis | Values |
|---|---|
| Deliverable | answer / report / fixes / feature / refactor |
| Review objects | code / design-artifact / spec |
| Scope | repo / branch-diff / module / file |
| Stakes | reversible note to auto-applied edit |

`Route: review of branch diff (code + design), deliverable=report | ~4 dispatches`

**The forecast counts every subagent you plan to spawn** — navigators, finders, skeptics, `Explore`, `Plan`, `general-purpose`, a grounding worker, background skills, and implementation workers in worktrees. If the run will exceed it, emit a corrected line rather than spending past it quietly. Correct the route the same way when evidence contradicts it.

| Deliverable | Path |
|---|---|
| **answer** | Route → Ground → Navigate → answer inline → Deliver. No Find, Triage or Implement. |
| **report** | Route → Ground → Clarify (if ambiguous) → Find → Dedup → Triage (rank+label) → Verify contested → Deliver. |
| **fixes** | Route → Ground → Recon + Clarify (if ambiguous) → Find → Dedup → Triage (filter) → Implement → Verify-impl → Deliver. **A defect already named in the prompt skips Find**: invoke `diagnosing-bugs` in its place. |
| **feature** | Route → Ground → Recon → Clarify → Navigate → Synthesize → Implement → Verify-impl → Deliver. No Find. |
| **refactor** | Route → Ground (only if a spec or won't-fix registry bears on it) → Navigate → Implement → Verify-impl (flipped to behavior preservation) → Deliver. No Find. |

Every path ends at Deliver, including the write-back in Step 11.

## Step 1.5 — Skill routing

Installed and model-invocable. Invoke via the Skill tool; reimplementing them inline is strictly worse, because they are tuned and you will drift.

| Fires at | Skill | Condition |
|---|---|---|
| Step 2.5 | `grilling` | Any vague, narrative, or underspecified request. **The default, not the exception.** |
| Step 2.5 | `+ domain-modeling` | Add for a feature or consequential design. |
| Step 2 | `research` | A load-bearing fact lives outside the repo. Runs in the background. |
| Step 3 | `diagnosing-bugs` | The defect is already named. Replaces Find. |
| Step 8 | `codebase-design` | The work reshapes a module boundary, interface, or seam. |
| Step 8 | `prototype` | A state model is uncertain enough that arguing costs more than building. |
| Step 9 | `tdd` | Implementing a feature or bugfix, at the seams agreed in the grill. |
| Step 10 | `code-review` | Before delivering on any fixes or feature route. |

Some skills are user-launch-only (`/grill-with-docs`, `/implement`, `/to-spec`, `/to-tickets`, `/triage`). Name one in a line (`Suggest /to-tickets to split this.`), do not stall for it, do not hand-roll a substitute, and do not edit their frontmatter.

## Step 2 — Ground once

If the task references a spec, README, design image, stated scope, or a won't-fix registry: load and distill it **once**, then inject that summary plus anchors into every worker prompt. Never let N workers re-read the same source or vision-parse the same image N times.

Ground as its own dispatch only when several workers consume it and the source is big; otherwise fold it into the one worker's prompt. For a fact outside the repo, invoke `research` rather than guessing or hand-fetching, and keep working while it reads.

## Step 2.25 — Recon

**Fires on ambiguity, whenever Step 2.5 will grill.** Dispatch one navigator with a precise question before asking the user anything: *what already exists here that the request will collide with?* Name the specific thing being changed rather than surveying — a navigator answers one question and files the rest under UNKNOWNS.

Without this the grill asks what the repo already answers, which is what trains people to skip grills. Skip only on genuinely greenfield work. Counts against the Step 3 budget.

## Step 2.5 — Clarify

**Fires on ambiguity, not on deliverable type.** A vague report request needs the grill exactly as much as a vague feature does.

Gate: would a wrong guess here cause rework or a throwaway? If yes it is load-bearing and must be resolved. If no, state it as an assumption and move on. **No question cap** — the stop condition is an empty load-bearing set.

A vague prompt is not a failure of the request; the user is carrying context they did not know needed saying. So the default response to vagueness is to grill, not to guess and not to shrink the scope.

1. **Assume and proceed** for anything minor, on a short visible assumptions list.
2. **Batched questions** for an otherwise crisp task with one to three load-bearing unknowns: one numbered list, each with your recommended default.
3. **`grilling`** for anything broader. Launch it yourself.
4. **`grilling` + `domain-modeling`** for a real feature or consequential design. Its ADRs and glossary *are* the assumptions ledger.

Follow `grilling`'s protocol: one question at a time, each with your recommended answer, waiting for the reply. Look up any *fact* the codebase can answer; the *decisions* are the user's. The grill runs in the main agent — a subagent has no channel to the user and would stall or invent answers. Running non-interactively you cannot grill: record the load-bearing unknowns as explicit assumptions and say so in the deliverable.

**The grill exits with an acceptance checklist:** numbered, observable statements that define done, each confirmable by looking at code, a test, or a run. Not "handles errors gracefully" but "a malformed payload returns 400 naming the bad field, and writes no partial row." That checklist, not the original prompt, is what Step 10 walks. It is the only mechanism here that structurally prevents the build-wrong then re-explain then rebuild loop, which costs more than every dispatch on this page combined.

If a Step 10 strike appears later, check the assumptions list first. A false assumption turns a mystery bug into a one-line correction.

## Step 3 — Navigate

Discriminator: **am I going to edit these files, or just understand them?** Read-to-edit stays inline, because Edit needs exact bytes. Read-to-understand delegates.

Before dispatching, check the answer is not already in the grounding, the recon return, an earlier worker's return, or session memory. Dispatch a **precise question**, never "explore module X".

- Budget: **~3-4 navigator dispatches per route**, recon included. Exceed only with a stated reason.
- Fire them in one message so they run concurrently, then keep working inline.
- `navigator` for a question needing synthesis; `Explore` for a broad locate-only sweep.
- **A simple search is not a dispatch.** Mechanical lookups go to the sandbox or inline.
- On the **answer** route there is no verify step, so the navigator's UNKNOWNS section is the backstop: a second dispatch fires when UNKNOWNS covers something load-bearing, and on nothing weaker.

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

## Steps 8-9 — Synthesize and implement

Think and merge inline using anchors; pull exact bytes on demand. On merge, run a **seam-check**: reconcile shared types and call signatures across worker outputs rather than stapling summaries together. For state, lifecycle, caching, or failure designs, trace one value end-to-end before committing to the shape.

- Reshaping a module boundary, interface, or seam → invoke `codebase-design`.
- A state model uncertain enough that arguing costs more than building → invoke `prototype`, then throw it away.

Implement inline by default; invoke `tdd` at the seams agreed in the grill. Delegate only parallel-independent slices in separate worktrees — that buys isolation, not context savings. **After any implementation subagent, read `git diff` inline** and check the worker did not weaken a spec or a test to make its claim pass.

## Step 10 — Verify implementation

- **Never add a verification step for its own sake**, and never dispatch one to feel surer. A step whose only content is "check again" produces over-verification, not correctness. Each item below earns its place by catching something self-checking structurally cannot.
- **Gates first**, in the sandbox where available. Spend a skeptic only on what gates cannot see. A gate added in this task must be seen red once before its green counts.
- **Walk the acceptance checklist** item by item, reporting each as met / not met / not checked. Where there is no checklist because the request was unambiguous, say that plainly rather than inventing one. `code-review` checks the work against repo standards; the checklist checks it against what the user actually said.
- **Refactor routes flip the question to behavior preservation**: gates green before and after, and the skeptic hunts for behavior *changes*. Verdicts invert — PROVEN means a proven change, so preservation is disproven; SURVIVES means old and new held equivalent, which is the good outcome. Say which sense you mean when you tag it.
- Verifier scope is **correctness and spec, not taste.** Nits are logged, not looped.
- **Strike rule**, keyed on recurrence rather than count: three different unrelated fixed issues is review working. **Same class three times, or fixes that breed new issues, means stop patching and interrogate the plan.** You hold this state.
- On any fixes or feature route, invoke `code-review` before delivering.

## Step 11 — Deliver

Artifacts go to files, not the chat. Report the path plus a compact summary. **Calibrate length**: cover the substance the task needs and stop — no filler sections, no summary of the summary, no boilerplate around a short answer.

Tag each finding with its verification level so the reader knows where to spend attention: `gate-caught`, `proof-confirmed` (a skeptic returned PROVEN, or you checked it yourself), `refuted-survived` (SURVIVES), `finder-claim` (reported, never independently verified), `refuted`. Most report-mode findings are `finder-claim`; tagging one a level up overstates confidence. `refuted` stays in the report, marked, never silently dropped.

**Write back what would otherwise be relearned.** If an assumption proved false, the strike rule fired, or the route needed correcting, save one memory recording the fact and how to apply it. Every step above avoids paying twice within a session; this is the same principle across sessions, and the cheapest of them.

## Loop exits — name the exit before entering any loop

- **grill**: the load-bearing set is empty. Not a question count.
- **verify-findings**: every survivor adjudicated, including the ones returned INCONCLUSIVE.
- **verify-implementation**: clean on correctness and spec, or the strike limit is reached, then escalate.
- **fix / re-verify**: governed by the strike rule above, not by whether it feels done.

No open-ended "keep going until sure."

Exiting a loop is not exiting the procedure, and finishing a request is not finishing with this file. The next request in this conversation starts at Step 0.
