# Ground — Steps 2 to 3

Loaded from `SKILL.md` Step 1 on every route except amend. Covers grounding (with research), recon, when to clarify, and navigation. The grill itself is in `grill.md`. The goal, scope rule, Step 0 anti-trigger, cost model, Step 1 route table and loop exits stay in `SKILL.md` and still govern; nothing here restates them.

## Step 2 — Ground once

If the task references a spec, README, design image, stated scope, or a won't-fix registry: load and distill it **once**, then inject that summary plus anchors into every worker prompt. Never let N workers re-read the same source or vision-parse the same image N times.

Ground as its own dispatch only when several workers consume it and the source is big; otherwise fold it into the one worker's prompt.

Read the ledger index the session-start hook injected. If an existing ledger covers this task or a task it builds on, read it first; it is grounding that has already been paid for, and a request that corrects that work belongs on the amend route, not here. If the project has a decision record (the repo's `docs/adr/`, else `decisions.md` in the ledger directory) or a glossary (the repo's `CONTEXT.md` / `CONTEXT-MAP.md`, else `glossary.md` there), read the entries that touch this task's area: a decision recorded there is settled unless the user reopens it, and a term defined there is the term to use.

**Research.** When a load-bearing fact lives outside the repo (a library's current API, a protocol rule, a platform limit), never guess and never hand-fetch pages into main context. Dispatch one `navigator` in the background with the precise question and the primary sources to check: official docs, the library's source, the spec, the first-party API, never a secondary write-up. It returns the fact with its source anchored, and you keep working while it reads. The fact goes into the ledger as a decision or assumption with its source, or, on a route that has no ledger, into the deliverable with its source; write a separate notes file only if the repo already keeps such notes and the fact is worth keeping beyond this task.

## Step 2.25 — Recon

**Fires on ambiguity, whenever Step 2.5 will grill.** Dispatch one navigator with a precise question before asking the user anything: *what already exists here that the request will collide with?* Name the specific thing being changed rather than surveying — a navigator answers one question and files the rest under UNKNOWNS.

Without this the grill asks what the repo already answers, which is what trains people to skip grills. Skip only on genuinely greenfield work. Counts against the Step 3 budget.

## Step 2.5 — Clarify

**Fires on ambiguity, not on deliverable type.** A vague report request needs the grill exactly as much as a vague feature does.

Gate: would a wrong guess here cause rework or a throwaway? If yes it is load-bearing and must be resolved. If no, state it as an assumption and move on. **No question cap** — the stop condition is an empty load-bearing set.

A vague prompt is not a failure of the request; the user is carrying context they did not know needed saying. So the default response to vagueness is to grill, not to guess and not to shrink the scope.

1. **Assume and proceed** for anything minor, on a short visible assumptions list.
2. **Batched questions** for an otherwise crisp task with one to three load-bearing unknowns: one numbered list, each with your recommended default.
3. **The grill** (`grill.md`, read it before the first question) for anything broader, and for every real feature or consequential design, where it also carries the domain model: the glossary and the decision record.

The grill runs in the main agent — a subagent has no channel to the user and would stall or invent answers. Running non-interactively you cannot grill: `grill.md` says what to do instead.

**The grill exits with a written ledger** (`ledger-template.md`): the acceptance checklist of numbered, observable statements that define done, plus the decisions and assumptions. Not "handles errors gracefully" but "a malformed payload returns 400 naming the bad field, and writes no partial row." That checklist, not the original prompt, is what Step 10 walks and what a later amend reads. It is the only mechanism here that structurally prevents the build-wrong then re-explain then rebuild loop, which costs more than every dispatch on this page combined.

If a Step 10 strike appears later, check the ledger's assumptions first. A false assumption turns a mystery bug into a one-line correction.

## Step 2.75 — The ledger exists before anything is built

On a **fixes** or **refactor** route that reaches this point without a ledger, because Clarify found the request unambiguous and no grill ran, create one now from `ledger-template.md`: the request restated as observable checklist items, marked **unconfirmed** (no user confirmed them), plus every assumption you made and the seams the tests will cross. It costs a few hundred tokens once, gives Steps 8 to 10 somewhere to write, and is what makes the next follow-up an amend instead of a rebuild. A **feature** always grills, so its ledger already exists; a grill that could not run (non-interactive) creates its own, per `grill.md`. **answer** and **report** routes create none here.

## Step 3 — Navigate

Discriminator: **am I going to edit these files, or just understand them?** Read-to-edit stays inline, because Edit needs exact bytes. Read-to-understand delegates.

Before dispatching, check the answer is not already in the grounding, the recon return, an earlier worker's return, or session memory. Dispatch a **precise question**, never "explore module X".

- Budget: **~3-4 navigator dispatches per route**, recon included. Exceed only with a stated reason.
- Fire them in one message so they run concurrently, then keep working inline.
- `navigator` for a question needing synthesis; `Explore` for a broad locate-only sweep.
- **A simple search is not a dispatch.** Mechanical lookups go to the sandbox or inline.
- On the **answer** route there is no verify step, so the navigator's UNKNOWNS section is the backstop: a second dispatch fires when UNKNOWNS covers something load-bearing, and on nothing weaker.

