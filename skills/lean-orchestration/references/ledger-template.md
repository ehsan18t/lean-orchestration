# Ledger — the durable record of one task

A ledger is one file per task in the ledger directory the session-start hook names (`Ledger directory:` line). It is the only task state that outlives a request: the route, budgets and restrictions belong to the request; the ledger belongs to the task and persists across requests, compactions and sessions. Follow-ups (`amend` route) read it instead of re-grounding, and a fresh session finds it through the index the hook injects.

**Filename:** `YYYY-MM-DD-<slug>.md`, slug from the task title, lowercase, hyphenated. Never rename a ledger; the index and the log reference it by path.

**Size discipline.** Keep it under ~80 lines. It is read on every follow-up, so every line rents. Record decisions and observable facts, not narrative. Update with narrow `Edit`s, never by rewriting the file.

## Template

```markdown
---
task: <slug>
title: <one line, the task in the user's terms>
status: open | parked | done | abandoned
route: feature | fixes | report | answer | refactor | amend
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

## Request

<One paragraph: what was asked, restated in the user's terms. Not the prompt verbatim.>

## Acceptance checklist

1. [ ] <Observable statement, confirmable by looking at code, a test, or a run.>
2. [ ] ...

## Decisions

- D1 (asked | assumed): <decision, and the alternative it rejected in a few words>

## Assumptions

- A1: <assumption> — unverified | confirmed | false, corrected <date>

## Won't fix

- <a finding or request left alone for this task, one line, with why; anything that must stay settled beyond this task is copied to `wont-fix.md` at Deliver>

## Files

1. [ ] <build step> — <files it touches> — items <n, m>
2. [ ] ...

## Log

- YYYY-MM-DD <event>: <one line>
```

**Checklist marks:** `[ ]` not checked, `[x]` met, `[-]` not met (say why in the log), `[~]` superseded by an amend (point at the log entry). An item added by a review's *later* choice reads `[ ] (deferred YYYY-MM-DD) <item>` and is open work for any later request; it does not hold the status `open`. Any request that picks the item up removes the tag first, with one narrow edit, and from then on it is an ordinary item that is walked and marked like any other. The `Files` build steps use `[ ]` and `[x]` only.

## Write points

| When | Who writes | What |
|---|---|---|
| Grill start (Step 2.5) | the main agent | Create the file with the request and the open load-bearing set; append each decision, assumption and term as it is settled. |
| Grill exit (Step 2.5) | the main agent | Add the checklist, the seams the tests will cross, and the `Files` build map. This is the grill's deliverable; the grill is not over until the checklist is in the file. |
| Implement (Step 9) | the main agent | Tick each build step with one narrow edit as it lands. Workers never edit the ledger. |
| Review choice (Step 10) | the main agent | *Later*: a new checklist item marked deferred. *As-is*: a `Won't fix` entry, copied to `wont-fix.md`. |
| Grill that could not run (non-interactive, or "just build it") | the main agent | Same file, created at grill start as usual: every load-bearing unknown decided and recorded as an assumption marked unverified, and the checklist written from those decisions, marked unconfirmed, with the `Files` build map. |
| Fixes / refactor route that reaches Step 2.75 with no ledger (Clarify needed no grill) | the main agent, at Step 2.75 | Create the file with the request restated as observable checklist items (marked unconfirmed), the assumptions made, the seams the tests will cross, and the `Files` build map. Steps 8 to 10 then have a ledger to write to. |
| Strike rule fires, assumption proves false, route corrected (Step 10) | the main agent | Log line, and the assumption or checklist item it changes. |
| Deliver (Step 11) | the main agent | Checklist marks, the `Files` build map brought current (it is the record of what changed; there is no second file list), status, `updated`, log line. |
| Amend route | the main agent | The contradicted item, a log line naming the correction, status back to `open` if it was `done`. |
| Writeup route (W4), when its harvest read this ledger | the main agent | One log line naming the writeup; nothing else changes. |

`answer`, `report` and `writeup` routes create no ledger; if the grill ran on an answer or report, the ledger it created is marked done at Deliver, and a writeup that read a ledger appends one log line. A report's triage goes to the won't-fix registry.

## Project-wide files

Three files in the same directory belong to the project, not to a task, and are never listed in the index:

- `wont-fix.md`: one line per finding or request deliberately left alone: `- <what> — <why> (<date>)`. Triage (Steps 5-6) filters against it so settled decisions are not reparaded; a refactor reads it at Ground.
- `decisions.md`: the hard-to-reverse, surprising, traded-off decisions (the grill's triple test), one entry each: date, decision, alternatives rejected, why, the ledger it came from. Read at Ground for the area a task touches and by diagnose; a later unrelated task never opens the ledger that made the decision, so this is where it survives. Used only when the repo has no `docs/adr/` of its own.
- `glossary.md`: settled project terms, used only when the repo has no `CONTEXT.md` of its own (see `grill.md`).

## Checkpoint

When a session has run long, the checkpoint is the ledger. Bring it current (checklist marks, build map, log), then tell the user in one line that the ledger is current and a fresh session will pick it up from the index. Nothing else needs writing. On an answer or report route that has no ledger, the checkpoint is the deliverable file written so far (the report's findings), which is one reason artifacts go to files; say which file it is.
