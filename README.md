# lean-orchestration

Route every non-trivial Claude Code task for the highest-quality output per token, and never lose the context of a task between requests, compactions, or sessions.

Quality comes from adversarial *framing*, which is free text, and from *fresh context*, which is not. Two things cost money: a dispatch, which buys a worker its own context and its own read, and a byte admitted to the main context, which is then re-billed on every turn that follows. The second is the one most cost advice leaves unpriced. This plugin encodes one rule: maximum framing, fewest fresh contexts, fewest bytes resident in the main one.

It is model-agnostic. Nothing in it names a model; roles inherit the session's effort level and only pin below it, with one deliberate exception for the proof-burden pass.

## What it installs

| Component | What it does |
| --- | --- |
| `lean-orchestration` skill | The routing procedure: anti-trigger, escalation ladder, cost model, seven routes, and the phase files each route loads. |
| Internal procedures | The grill, the diagnosis loop, research, design, prototype, test-first, and review, all inside the skill. No other skill is required. |
| Ledger | One file per task, written by the grill and kept current through delivery, so a follow-up reads it instead of re-deriving it. |
| `navigator` agent | Read-only. Answers one precise question about code you will not edit, returns anchors plus only load-bearing lines. |
| `finder` / `finder-lite` agent | Read-only. Reviews one slice through named lenses (code-defect, spec-conformance, design-critique, standards). |
| `skeptic` / `skeptic-max` agent | Adversarial. Tries to refute a finding it did not author, at the burden direction you state. |
| `/lean` command | Enter lean mode explicitly for the current task. |
| Hooks | Inject the skill at session start, re-inject the ledger index on resume, re-arm Step 0 with one short line on every prompt, and remove permission prompts for the skill's own files and the ledger directory. |
| Output rules | Six rules for every message you read: answer first, the important with its reasoning, the rest compressed, tables and lists over prose, real names, stop when the content stops. Injected with the skill and re-armed on every prompt. |
| `scripts/route-rate.mjs`, `scripts/output-length.mjs` | Measure, from your own transcripts, how often the skill fires and how long its messages are. |

## Install

```
/plugin marketplace add ehsan18t/lean-orchestration
/plugin install lean-orchestration
```

Requires `node` on your PATH for the hooks. A hook failure is silent: a missing Node costs you the autostart and nothing else.

## The routes

Every request starts at Step 0, the anti-trigger, which keeps small work inline. Anything non-trivial gets one visible Route line carrying the forecast of dispatches, so a misroute can be vetoed before it costs anything.

| Route | When | Shape |
| --- | --- | --- |
| answer | A question about the code | Ground, navigate, answer inline. |
| report | A review or audit | Find in slices, dedup, triage, verify only the contested findings. |
| fixes | Defects to fix | Find, or diagnose when the defect is named, then implement and verify. |
| feature | New behavior | Grill first, then implement test-first, then verify against the checklist. |
| refactor | Same behavior, new shape | Implement, then a skeptic hunts for behavior changes. |
| amend | A correction or extension to work already delivered | Load the ledger, record what the correction contradicts, change it, re-walk only the affected items. |
| writeup | A ticket, issue, epic, story, task, bug report, or PR title or description to write | Harvest until a reader could act without asking, write it the way you would explain it, subtract every restatement, emit copyable text with a handoff. |

The writeup route exists because a model asked for a ticket writes from memory of the conversation, at the altitude of "updated the typography" instead of "Roboto to Inter", with the blast radius missing and the reason a platitude, and writes it differently every time. The bar is completeness: someone who was not in the room knows what is being done, why, everything it touches, what is deliberately left out and how it will be judged, without asking a question. There is no length limit, because length is never a reason to drop a fact. What is cut instead is filler, which has an exact definition: a section restating another section, a rule that is already an acceptance criterion, a paragraph where a line carries the same fact, a heading over nothing, a fact stated twice. The other half of the bar is readability, because a ticket is written to be read and not parsed: the reader gets all of it by reading once, in order, the way they would if you explained the work at their desk, and a grid of cells they have to rebuild the meaning from is a failure even when every fact is in it. So the route harvests the named instances and everything the change touches from the ledger, the diff and the code, chooses the type and a title in that type's grammar, and writes in the order a person explains things: what is being done and why, what is in it, what is deliberately not, what it depends on, how it will be judged, where to look first. Form follows content rather than a template. Prose carries the explaining, because a cell cannot hold a because; a list is for things that genuinely are lists; a table is for rows that share a shape and a column someone will scan, never for an inventory of files and paths. Four questions gate the emit, the first two being whether a reader could act without asking and whether they could get it by reading once, and then one subtraction pass removes every restatement; removing a fact in that pass is a defect, not a saving.

The amend route is the one most sessions spend most of their time on. Work is never one-shot: the text is wrong, a business rule turned out different, the new feature has a bug. Without a ledger each of those either re-grounds the whole task or drops to an unrecorded inline edit, and the context of the task rots. With one, each correction is a one-line change to a written record, the edit itself, and a low-effort read by a fresh context for anything beyond a literal or a copy string.

## Ask first, build second

A model left alone fills every gap with a plausible guess and pays for the rebuild later. The grill runs by default on any vague or underspecified request: one question at a time, each with a recommended answer, facts looked up in the repo rather than asked, only decisions put to you. It exits when the set of load-bearing unknowns is empty, not at a question count, and its deliverable is the ledger: an acceptance checklist of observable statements, the decisions taken, and the assumptions made. That checklist is what verification walks and what a later amend reads.

Running non-interactively, the grill records every load-bearing unknown as an explicit assumption instead, so a wrong one becomes an amend rather than a rebuild.

## The ledger

A ledger is a small Markdown file per task: request, acceptance checklist, decisions, assumptions, won't-fix entries, files touched, and a log. The grill creates it before its first question and appends to it as each answer lands; verification and delivery update it; a follow-up amends it. Three project-wide files live beside the ledgers and are never indexed: `wont-fix.md` for settled triage, `decisions.md` for the hard-to-reverse decisions a later task must not quietly undo, and `glossary.md` for settled terms. When the repo already keeps these itself (a `CONTEXT.md` glossary, a `docs/adr/` directory), the repo's convention wins and the grill writes there instead.

At session start the hook injects an index of ledgers: every unfinished one first, then the most recently finished, ten lines in total, each with its title, route, date and path. That costs about sixty tokens per line, and a follow-up then reads only the one ledger it needs. When a session has run long, the ledger is the checkpoint: the skill brings it current and tells you a fresh session will pick the task up from the index.

### Where ledgers live

| Setting | Location | Use it when |
| --- | --- | --- |
| `ledger_in_project` off (default) | `~/.claude/projects/<project>/lean-orchestration/` | You want the ledgers shared by every session of this project and kept out of the repo. |
| `ledger_in_project` on | `<project>/.lean-orchestration/` | You want them in the repo, to commit or to ignore as you prefer. The plugin does neither for you. |

The plugin asks for both settings when you enable it; change them later in the `userConfig` block the plugin saved in your `settings.json`. Two environment variables override the saved settings for one session: `LEAN_ORCHESTRATION_LEDGER_DIR=<path>` points ledgers anywhere, and `LEAN_ORCHESTRATION_AUTOSTART=off` disables the hooks.

## The escalation ladder

Rungs are entry depths, not a sequence. Enter where the stakes land.

```
0. Your own check, inline            free, and it already happened
1. Gates (tests / typecheck / lint)  deterministic, near free. ALWAYS first
2. One adversarial skeptic           buys INDEPENDENCE, not verification
3. Small panel (2-3 skeptics)        high blast-radius or auto-applied changes only
4. Proof-burden pass (skeptic-max)   critical findings only
```

Never pay an LLM to find what a gate finds for free, or to repeat a check you already made. Rungs 2 and up buy exactly one thing the main loop cannot: a reader who did not author the claim. Dispatching to "double-check" is not that, and produces over-verification instead of correctness.

The implementation review is where quality is guaranteed by process rather than by hope: every change that ships is read by someone who did not write it. It is one finder over the diff, reading it through three lenses at once (defects, conformance to the ledger's checklist, and the repo's own standards). What varies with the stakes is the tier, never whether it runs: the full finder on a feature or on any diff that touches a seam, a shared type, more than one module, a user-visible number, or persisted state; the low-effort finder on a small single-module fix or amend, where reading it carefully is the whole job. A change that touches persisted state, money, security, or a user-visible number gets a second reader that holds the checklist first and the diff second, so the reading of intent is not anchored by the code. A refactor gets the behavior-preservation skeptic instead. Under the review sit the gates, which always run first, and the checklist walk against what you actually asked for; above it, a finding that touches data, security, or a wedge goes to the proof-burden skeptic before the fix is applied.

## The hooks

The skill's description excludes small work, so left to model judgment it fires inconsistently. Measured over 72 local sessions in August 2026, a session-start hook that injected the skill loaded it in 8 of 9 sessions, against 6 of 63 with no hook. Injecting the body itself, rather than an instruction to load it, removed the one step that could still be skipped.

Three hooks now do the work, one per event. On `startup`, `clear` and `compact`, the session-start hook injects the skill body, the ledger directory, the ledger index and the output rules, so routing is in force before your first message and survives a compaction. The harness truncates any single hook output above roughly 10 KB to a 2 KB preview plus a file on disk, and the limit is per hook (measured: 9 KB arrives whole, 11 KB does not; three 9 KB hooks all arrive). Earlier versions injected the 13 KB body in one piece and only its first 2 KB ever reached the model in full. The hook is therefore registered four times and emits the payload in parts under 8.5 KB, split at section boundaries; unused parts emit nothing, which leaves room for the body to grow. On `resume` it injects only a fresh ledger index and a one-line note, because the transcript already carries the body. On every prompt, a second hook adds one line of about sixty tokens that re-arms Step 0 and names the amend route; the body sits in the prefix from the start, but a standing instruction decays over a long session and a per-prompt line is the direct countermeasure. It loads nothing, so its whole cost is its own length.

A third hook removes permission prompts for exactly two places: reads of the skill's own phase files, and reads or edits inside the ledger directory. Both sit outside your working directory, so without it every phase-file read and every ledger update would ask, and a non-interactive session would refuse them and silently fall back to unrecorded inline work. Measured in a print-mode session before this hook existed, that is exactly what happened: the model routed to amend, was refused the ledger and the amend phase file, and made the edit with no record. With the hook, the same session read both, recorded the false assumption before touching code, fixed it, and logged the correction. Nothing else is auto-allowed.

`/lean-orchestration:lean` no longer reloads the body when it is already present; a second copy is pure rent.

### Measuring it

```
node scripts/route-rate.mjs --since 2026-09-01
node scripts/output-length.mjs --since 2026-09-01
```

The second reports median and 90th-percentile words per message, code and tables excluded, split by whether the output rules were injected. Baseline over 55 sessions before the rules: median 19 words, 90th percentile 228.

Scans your own transcripts and reports, per session, the number of real prompts, the number of Route lines, whether the per-prompt reminder was present, and the old skill-load count, then a routed rate for sessions with and without the reminder. Before the per-prompt hook existed, 41 of 54 sessions with at least two prompts (76 percent, 2026-08-18 onward) carried a Route line. Run it after a week on the new hooks to see the difference.

### Turning it off

Answer no to the autostart question when enabling the plugin, or set `autostart` to false in the saved config, and load the skill yourself with `/lean-orchestration:lean`. Both hooks respect the same switch. Do not edit `hooks/hooks.json` to disable them: plugin files are replaced on update.

## Effort

The session's effort level is the user's cost intent. A role may pin below it (`finder-lite`) for genuinely light work. No role may pin above it, with one exception: `skeptic-max`, because the proof-burden pass is the one place where being wrong is expensive enough to justify the overspend.

At a low session effort, skip a marginal skeptic rather than dispatch a weak one. A low-effort skeptic rubber-stamps, which is worse than no skeptic, because it launders an unverified finding into a verified one.

## License

MIT
