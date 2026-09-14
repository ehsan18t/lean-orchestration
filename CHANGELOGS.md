# Changelog

All notable changes to lean-orchestration, newest version first. Versions before 0.7.0 predate this file.

<!--
MAINTAINING THIS FILE. These rules are not user-facing: keep every one of them inside this comment.

WHEN TO WRITE
- Only immediately before the release commit. Never while the work is landing: between releases this file does not change, and a commit that adds a feature does not touch it.
- The release is ONE commit containing the new entry and the matching version in `.claude-plugin/plugin.json`, with the message `release: X.Y.Z`.
- If asked to release and this file already has an entry for the version being released, the previous attempt was undone: rewrite that entry from the sources below rather than trusting it.

WHERE THE CONTENT COMES FROM
- `git log --oneline <sha of the previous release: commit>..HEAD` for everything unreleased. Find that sha with `git log --oneline --grep="^release"`, never from memory.
- Read the commit bodies, not just the subjects: the body carries what actually changed and why.
- Read the ledgers for those tasks in the ledger directory the session-start hook names. A commit says what moved; the ledger says why it mattered and what was decided, which is what a reader of this file needs.
- Never write an entry from memory of the session that produced the work.

HOW COMMITS COLLAPSE INTO ENTRIES
- One entry per user-visible change, never one per commit. Several commits normally become one entry.
- A fix to a feature that has not shipped yet is PART of that feature: it gets no entry of its own, and the feature's entry describes the result that shipped, not the path taken to it.
- A fix or a change to behavior that IS already released gets its own entry, under Fixed or Changed.
- Work no user of the plugin can observe (a pure refactor, a test, a comment, a ledger) gets no entry at all.

THE VERSION NUMBER
- Take the current number from the previous `release:` commit and from `.claude-plugin/plugin.json`. Check both agree before deciding.
- Patch (0.7.0 to 0.7.1): only fixes to released behavior.
- Minor (0.7.0 to 0.8.0): anything added, anything removed from the package, or a decision recorded in a ledger reversed.
- Major: reserved for a change that breaks an existing install.
- The version in the top entry and in `.claude-plugin/plugin.json` must match before the commit is made.

WRITING AN ENTRY
- Headings in this order, and a heading with nothing under it is omitted: Added, Changed, Fixed, Removed.
- Each bullet opens with a bold clause naming what changed for the reader, then the consequence, then the reason where the reason is not obvious.
- Say what changed for someone using the plugin, not which file moved. Name a file only where the reader interacts with it directly.
- No em dashes, and never hard-wrap a line: this half of the file is read by people.
- A released entry is never rewritten. A mistake in one is corrected in the next release's entry.
-->

## [0.8.1] - 2026-09-14

### Fixed

- **You now see the plugin name and version in the chat on every prompt**, as "lean-orchestration 0.8.1". In 0.8.0 the version reached only the model's per-prompt reminder, so the chat never showed which release is running.

## [0.8.0] - 2026-09-14

### Added

- **Two model tiers for the role agents.** `navigator`, `finder` and `skeptic` run on Opus 4.8, which does this work well with fewer tokens. The new `finder-session` and `skeptic-session`, and `skeptic-max`, run on your session's model, so a newer session model is picked up with no plugin change.
- **The session model is used only where a second, different model reading the same work pays for itself.** That is the second, checklist-first reader on a change touching persisted state, money, security or a user-visible number, a contested finding that could lose data, breach security or wedge, the single-file risky change, and the proof-burden pass. The rule lives in one table in the skill.
- **The per-prompt reminder names the plugin version**, as "lean-orchestration 0.8.0: run Step 0", so the chat shows which release is running.
- **A build map in the ledger.** Written when the grill finishes, it lists numbered build steps with the files each touches and the checklist items each satisfies, ticked as each lands, so a later session can resume a build halfway.
- **An approaches question in the grill.** When a feature has more than one reasonable shape, you choose between minimal change, clean architecture and pragmatic balance, each with its consequence and a recommendation.
- **Standards findings from a review come back to you as a choice**: fix now, later as a deferred checklist item, or as-is as a Won't fix entry. A deferred item stays open work without holding the ledger open.
- **Three more smells in the standards lens**: reinvented helper, needless complexity and dead code.

### Changed

- **The output rules are now a full communication prompt.** The answer comes first, results replace narration of the work, every risk and unchecked claim is kept, and nothing is repeated. It adds banned stock phrases, no flattery or analogies, reference codes such as `F1` and `D1` for three or more findings or decisions, scope limits, the aliases `scr`, `eli`, `foc` and `ref`, and do and do-not examples.
- **`CLAUDE_CODE_SUBAGENT_MODEL` no longer changes the model of this plugin's agents**, because each now pins its own. Built-in agents still follow it, and setting `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` as well overrides the pins.
- **A contested finding that could lose data, breach security or wedge gets its own skeptic first**, then the proof-burden skeptic before the fix if it survives. A finding already judged critical still goes straight to the proof-burden skeptic.
- **The grill reports how many questions are open now**, a number that can grow, instead of "question k of n", which read as a cap.

### Fixed

- **`scripts/output-length.mjs` counted most sessions as having no output rules**, because it matched one phrase from a reminder that had been reworded twice, and counted sessions that merely quoted that phrase as having them. It and `scripts/route-rate.mjs` now count only the hook's own injection.

### Removed

- **The `finder-lite` agent.** Small reviews now use `finder` on Opus 4.8.

## [0.7.0] - 2026-09-10

### Added

- **Per-type rules for the writeup route.** Each of epic, story, task, bug and PR now has its own reader, its own closed set of sections in a fixed order, and the form of every section fixed in the rules rather than chosen while writing. Previously one generic shape produced all five, so an epic came back carrying business rules and acceptance criteria and a task came back as paragraphs.
- **An epic carries no business rules and no acceptance criteria.** Its scope list is one bullet per affected area with one line on what changes there.
- **A story carries either an expected outcome or acceptance criteria, never both**, decided by one question: is there a ticket under this story that nobody can verify without another ticket under the same story. Work split by layer gets the criteria, because no single ticket can carry the bar.
- **A task, a bug and a PR use internal terms by name and never define them.** Their reader already works on the product.
- **A PR carries only what its diff does not show and its ticket does not state**, which is what keeps it short without a word count.
- **Acceptance criteria are labelled `AC-1:` upward**, so a reviewer can cite one in a comment.
- **The rules load on demand.** Asking for a task reads the core file and `references/writeup/task.md`, and none of the other four types.
- **`scripts/check-injection.mjs`**, a gate that runs the session-start hook slot by slot against a worst-case ledger index and checks that the whole injection arrives intact. Run it before a release.

### Changed

- **The output rules are written for a reader who skims and stops early.** Paragraphs are banned outright: everything after the first line is a bullet, a numbered step, a table row or a heading.
- **A message covering more than one kind of thing is divided into short named sections**, so a reader can jump to the one they need instead of scanning a single long list.
- **Sections and the bullets inside them are both ordered by what matters most**, so stopping at any line leaves the reader correct rather than misinformed.
- **The per-prompt reminder matches the new rules.**

### Fixed

- **The session-start injection could lose its tail with no error at all.** `hooks.json` registered four slots while the script computed its part count from the payload, and nothing connected the two, so a payload needing a fifth part lost everything past the fourth and never emitted the closing tag. Roughly 4.7 KB of growth in `SKILL.md` would have triggered it.
- **Six slots are now registered, and the injection is closed by the last slot that actually runs.** If the payload ever outgrows them, the last slot reports how many parts were dropped and sends the model to read `SKILL.md` itself, rather than going quiet.
- **A section too large to cut at a blank line went out over the harness limit** and was truncated. Anything oversized is now cut at line, then word, then character boundaries.
- **A fenced code block is no longer torn across parts**, in either CommonMark spelling and with the indent the spec allows.
