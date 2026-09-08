# Writeup — ticket, issue and PR text

Loaded from `SKILL.md` Step 1 on the **writeup** route: the user asks for a ticket, an issue, an epic, a story, a task, a bug report, a PR title or description, or one part of those (title only, description only). The deliverable is text a person reads to rank, sequence, build or review. No Ground, Find or Implement; the route is harvest → draft → emit, all inline, 0 dispatches. The output is read by people: no em dashes and no hard-wrapped prose in it, even though this file uses em dashes itself. A writeup about ledgered work is not an amend: it reads the ledger and changes only its log.

The failure this file prevents: text written from memory of the conversation instead of from the source, at category altitude ("updated the typography") instead of instance altitude (Roboto to Inter; `#0F62FE` on the primary button and link text), with the blast radius missing, the reason a platitude, and a different shape every time.

**Precedence.** A repo template (`.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/`) comes first: its headings and order replace the shape in W2, W3 still governs every sentence under them, and a heading with nothing to put under it is left out unless the template marks it required. Then the type's example (W5) for shape, density and voice. Then W2 and W3, which decide what is present. Inside the ticket text this file's shape overrides the output rules; they govern the message around it.

## W1 — Harvest

Sources in this order, going past one only for what it lacks: the task's ledger (checklist items become criteria, D-lines decisions already made, A-lines that mattered constraints; it never holds the instances), the branch diff (`git diff --stat`, then only the hunks that carry names), the code (one grep per instance for where it is used), the conversation last.

Collect before writing a word:

- **Instances**: the real names. The font family, the hex values, the component, the route, the token, the command, the error text verbatim with its numbers. A user's or customer's message is quoted in the sentences that carry the facts and linked in full, never paraphrased.
- **Surfaces**: every screen, route or job that renders or runs the change. "Site-wide" only when it is set at the root and you saw the root.
- **The adjacent thing left alone**: what usually moves with this and is not moving (state with a component revamp, tests with a parser move, mobile with a desktop layout).
- **Dependencies**: what must land first, what waits on this, where it sits in a sequence.
- **Verification**: what was run, or what will judge it.
- **Severity** (bug): who is hurt and how often, from the surfaces and the reproducibility.
- **Conventions**: the repo templates above; the PR title prefix from `gh pr list --limit 15` when `gh` is available, else `git log --oneline -15` (a ticket key, a `type:` prefix, or none; follow the majority).

End with the instance list in hand; the draft names every entry or the omission is deliberate. A fact only the user holds: one question with a recommended answer, grill style; running non-interactively, take the recommended answer and list it in the handoff as an assumption. A fact nobody holds: an open line in the handoff, never smoothed over. Two independent outcomes in one harvest are two tickets (or two PRs): write both and say so.

## W2 — Draft

Read the requested type's example from `writeup/` (W5), then draft in one pass; the checks in W4 run in your head, never as a visible second draft.

### Title

| Type | Grammar | Example |
|---|---|---|
| Epic | noun phrase naming the outcome or the area, title case | HCP Onboarding UI Revamp |
| Story, task | imperative verb + the specific thing, sentence case | Switch the site font from Roboto to Inter |
| Bug | the failure as a statement, subject first, sentence case; never the fix | CSV import drops the last row without a trailing newline |
| PR | task grammar, with the repo's prefix convention if it has one | Move the employee CSV parser into shared utilities |

Aim under 60 characters, never over 72. No trailing period. It carries the name a teammate would search for; "improve", "enhance", "update" or "fix" without the instance fails.

### Description: the narrative, then the blocks

The narrative has no headings and runs the four moves below in order, declarative present ("It adds", "It exists so that"; a PR may start with the verb, subject implied, as a commit body does). Each move is a sentence, a clause, or absent. Moves that chain (a "so that", a "without it") share a paragraph; a move that does not is its own paragraph; never more than four. One run of the moves per change the ticket carries: a side change gets its own short run after the main one, as the task example does for the parser move.

1. **What.** The thing with its instances named; where it lands; its place in the sequence if it has one. The first sentence never restates the title: it adds what the title cannot hold.
2. **Why.** What it enables, as a consequence a reader can picture: a user, a screen, a cost, a blocked ticket. The counterfactual is the strongest form ("without it, corporate could not ship until HCP shipped"). Dependencies live here. "To improve UX" fails.
3. **Boundary.** What is deliberately untouched that a reader would expect to move, marked as deliberate. Decisions already made, each with its reason in the same sentence ("a move rather than a copy, so the app never carries two parsers"). A detail an implementer could burn a day on if unstated. Known shortcomings of the approach and the intended next step. On a bug: what was tried or ruled out, and a suspected cause only when labelled suspected.
4. **Judgment.** How it is verified; the user-visible part isolated; where to look first if it misbehaves, by surface name.

Per type. An **epic** is the product after it ships, present tense: move 1 carries the before and the after in one sentence, which is its why; a further move 2 and a move 3 appear only when a dependency or a boundary is surprising; move 4 is the observable end state; no blocks. A **story** names who it is for and what they can now do, in surfaces, never symbols, files or classes. A **task** may name symbols, directories and commands. A **bug**'s move 1 is what fails, where and for whom; its move 2 is the impact. A **PR** never repeats its ticket's narrative: it links the ticket, says in one sentence what the diff does and why, and adds only what is PR-specific, written from the final diff and rewritten if the PR changes materially.

Blocks follow the narrative in this order, each labelled in bold (a bold lead-in on the same line for the one-line fields), and only these:

- Bug: **Steps to reproduce** (method plus intent, at most eight), **Expected** and **Actual** (what is seen, error text verbatim with its numbers), **Environment** (only what matters: build, browser or OS, role, data state; the reproducibility, every time, sometimes or once; the last build where it worked when it is a regression), then **Acceptance criteria**.
- Story, task, bug: **Acceptance criteria**, numbered, three to seven, each an observable condition in the present tense that someone could check without reading the narrative. Never a restatement of the change. On a bug: the fix condition and the regression check.
- PR: **Verified** (what was actually run, and any gate a reader would expect that was not), **Review first** (the one symbol or file to read first), then the ticket reference as the last line, with the repo's closing keyword when the PR closes it.

Inline or list: short noun phrases stay inline however many (twelve components in one sentence read fine); items that each carry a clause (a condition, a step, a reason) become a list. The shape of the item decides, not a count.

## W3 — Rules

- Replace every category noun with the instance the source gives.
- Blast radius enumerated or explicitly total. Never "various", "several", "some".
- Never narrate how, step by step; the diff shows how. The shape of the diff (a move plus three import paths) and a decision someone could re-open stay.
- Cut any sentence that would still be true of a different change.
- Put each reason in the sentence it justifies. No rationale section, no sentence whose only job is to introduce the next one.
- One fact once, in the smallest form that carries it. A list of one is a line.
- Anchors that survive: the symbol, then the directory, then the file, and a file only when the symbol alone would not find it. Never a line number, never a position in a diff.
- A pronoun only when it can refer to one thing; otherwise name the thing again.
- Facts apart from speculation. A guess is labelled a guess or is absent.
- The text stands without its links; the fact a link points to is in the sentence.
- Nothing empty: no "N/A", no heading over one line, no move or block written to fill its slot. Above a ceiling, split or cut; never compress by going vague.

## W4 — Emit (the route's Deliver)

Three questions before sending, each failure naming the missing move; a failure on a fact nobody holds exits to the handoff, it does not loop:

1. A product manager could rank this against another ticket (move 2; for an epic, the before-and-after sentence).
2. A project manager could sequence and size it without asking (moves 1 and 3; for an epic, the slices in move 1 and the end state in move 4).
3. An engineer could start, and would know when they are finished, without asking (moves 3 and 4 and the blocks; not run on an epic). For a PR the hats are the reviewer's: what the diff does and why, what was run, where to read first.

Emit the title on its own line, then the description, as copyable text in the chat: no type label, no bold on the title, no code fence; the block labels and code spans around symbols are the only markup. A file only for a batch, or on request. Only the part that was asked for when one was. After the ticket text, the **handoff**, one line each and only when non-empty: the type you inferred when none was stated; a bug's severity and its reason; facts nobody could supply; assumptions taken because no one could answer; attachments to add (a before/after for anything a user can see); "this is two tickets". The route creates no ledger; when the harvest read one, append one log line naming the writeup, in the ledger's log format, and change nothing else.

## W5 — Examples

One file per type in `writeup/`: `epic.md`, `story.md`, `task.md`, `bug.md`, `pr.md`. Read only the type you are writing. Each is the ticket text in the exact form W4 emits, title line first and without the handoff that follows it; the epic and the task are real tickets from the user's own tracker (ENS-1944, ENS-1951) and set the standard for density and voice. The example decides shape, density and voice; W2 decides which moves and blocks are present.
