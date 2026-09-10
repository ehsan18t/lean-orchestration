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
