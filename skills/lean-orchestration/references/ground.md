# Ground — Steps 2 to 3

Loaded from `SKILL.md` Step 1 on every route. Covers grounding, recon, the clarify grill, and navigation. The goal, scope rule, Step 0 anti-trigger, cost model, Step 1 route table and loop exits stay in `SKILL.md` and still govern; nothing here restates them.

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

