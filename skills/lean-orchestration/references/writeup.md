# Writeup — ticket, issue and PR text

Loaded from `SKILL.md` Step 1 on the **writeup** route: the user asks for a ticket, an issue, an epic, a story, a task, a bug report, a PR title or description, or one part of those (title only, description only). The route is harvest → draft → emit, all inline, 0 dispatches. The output is read by people: no em dashes and no hard-wrapped prose in it, even though this file uses em dashes itself. A writeup about ledgered work is not an amend: it reads the ledger and changes only its log.

## The bar

Two things at once. Neither is negotiable, and neither is ever traded for the other.

**Complete.** Someone who was not in the room opens the ticket and knows exactly what is being done, why, everything it touches, what is deliberately left out, and how it will be judged, without asking anyone a question. There is no length limit. Length is never a reason to drop a fact, shorten a list, or generalise a name.

**Readable.** They get all of it by reading once, in order, the way they would if you explained the work to them at their desk. A ticket is written to be read, not parsed. It has failed if a reader has to rebuild the meaning out of a grid of cells, or re-read a sentence to find where its list ended, even when every fact is present.

These conflict only if you try to buy readability with content. What you cut instead is **filler**, which has an exact definition:

- a sentence that restates the title, or a section that restates another section;
- a rule that is already an acceptance criterion;
- a paragraph where a line carries the same fact, a section where a sentence does;
- a heading with nothing under it, "N/A", or anything written because the format offers the slot;
- a fact stated twice anywhere in the same ticket.

Cut filler to zero. Cut content never. They are different operations and only the first is ever correct.

## W1 — Harvest

Sources, going past one only for what it lacks: the task's ledger (checklist items become criteria, D-lines decisions already made, A-lines that mattered constraints; it never holds the instances), the branch diff (`git diff --stat`, then every hunk that carries a name), the code (grep each instance for where it is used), the conversation last. When the work does not exist yet the ledger and the diff are empty, so the conversation and the code are the whole source; say so in the handoff rather than inventing verification or blast radius that nothing supports.

Collect, and keep collecting until the completeness bar is met:

- **Instances**: the real names. The font family, the hex values, the component, the hook, the route, the token, the namespace, the file, the command, the error text verbatim with its numbers. A user's or customer's words are quoted in the sentence that carries the fact and linked in full, never paraphrased.
- **Everything the change touches**: every screen, route, job, module, locale file or consumer, named. "Site-wide" only when it is set at the root and you saw the root.
- **The adjacent thing left alone**: what usually moves with this and is not moving, and why.
- **Decisions already made**, each with the reason that makes it a decision rather than a preference.
- **Dependencies and order**: what must land first, what waits on this, what may merge in either order.
- **Verification**: what was run, or what will judge it, and where to look first if it misbehaves.
- **Severity** (bug): who is hurt and how often, from the surfaces and the reproducibility.
- **Conventions**: `.github/PULL_REQUEST_TEMPLATE.md` and `.github/ISSUE_TEMPLATE/` when present, followed exactly; the PR title prefix from `gh pr list --limit 15` when `gh` is available, else `git log --oneline -15`.

End with the list in hand. The draft names every entry on it, or the omission is deliberate and stated. A fact only the user holds: one question with a recommended answer, grill style; running non-interactively, take the recommended answer and list it in the handoff as an assumption. A fact nobody holds: an open line in the handoff, never smoothed over. Two independent outcomes in one harvest are two tickets: write both and say so.

## W2 — Type and title

Type, when the user did not name one: **epic** for a body of work that ships as several tickets; **bug** for something that does not work as intended; **story** for a change described by what a person can now do; **task** for a change described by what the code now does. A technical rebuild a user sees is a story if the ticket is written from the user's side, a task if from the code's side. Say which you chose in the handoff.

| Type | Title grammar | Example |
|---|---|---|
| Epic | noun phrase naming the outcome or the area, title case | HCP and Corporate Onboarding Redesign |
| Story, task | imperative verb + the specific thing, sentence case | Add the setup tokens and shared primitives |
| Bug | the failure as a statement, subject first, sentence case; never the fix | CSV import drops the last row without a trailing newline |
| PR | task grammar, with the repo's prefix convention if it has one | Move the employee CSV parser into shared utilities |

No trailing period. The title carries the name a teammate would search for; "improve", "enhance", "update" or "fix" without the instance fails.

## W3 — Write it the way you would explain it

Write to the person who will pick this up, in the order they need things. These are the questions a reader asks, not a set of headings to fill: a question this ticket has no answer for is simply absent, and one that needs three paragraphs gets three.

1. **What is being done, and why it exists.** What the work is, what the situation is today that makes it necessary, and what breaks or costs if it does not happen. Where it sits in a sequence, if it sits in one. This comes first because everything after it is read differently once the reader knows the point.
2. **What is in it.** The substance: everything the change touches and what happens in each place, with the reason wherever the reason is not obvious. This is the part that carries completeness, and the part that most often gets flattened into an unreadable sentence or a grid.
3. **What is deliberately not in it.** Only what a knowledgeable reader would assume was included, or what someone has already proposed. Not a list of everything the ticket is not.
4. **What it depends on.** What must land first, what waits on this, what may merge in either order.
5. **How it will be judged.** Acceptance criteria: numbered, observable, present tense, each checkable without reading the rest of the ticket, and never a restatement of the change. Every type except an epic, whose equivalent is the observable end state of the whole body of work.
6. **Where to look first if it misbehaves**, by name.

A **bug** reorders this: what fails, where and for whom, and how often; then reproduction steps, expected, actual and environment; then the impact; then a suspected cause, labelled suspected; then the criteria, which are the fix condition and its regression check.

A **PR** links its ticket instead of restating it, says what the diff does and why, then what was actually run and any expected gate that was not, then the one thing to read first.

**Headings when they help a reader navigate, not otherwise.** A ticket someone will jump around in earns them. One that reads straight through in four paragraphs does not, and gains nothing from being cut into labelled boxes.

### Form follows the content

- **Prose** whenever you are explaining: a reason, a consequence, a chain of "so that" or "without it". Most of a good ticket is prose, because most of what a reader needs is explanation and a cell cannot hold a because.
- **A list** when the content genuinely is a list of peers that each carry their own clause: acceptance criteria, reproduction steps, an epic's child tickets, a set of independent decisions. A run of short noun phrases is not a list; it reads fine inside a sentence.
- **A table** only when every row has the same shape and a reader will scan one column to find their row: an epic's children with what each delivers, a set of values with their meanings, a set of states with what each shows. Never a table of files and paths, which is an inventory of the diff and tells a reader nothing they could not get from the code.
- **Read every sentence back.** One you cannot read aloud is an enumeration wearing a sentence's clothes; make it a real list, or split it into sentences that each explain one thing.
- Never reach for a list or a table because the format offers one, and never for prose when the thing is a list. The content decides, every time, and the same content decides the same way next month.

## W4 — Rules

- Name the instance, never the category: the font family, the hex, the component, the namespace, the file.
- Everything touched is enumerated, or stated as total. Never "various", "several", "some".
- Every fact appears exactly once. Before emitting, find any fact in two places and keep it in the one where a reader needs it, which for anything observable is the acceptance criteria.
- Each reason rides in the sentence it justifies. No rationale section, no sentence whose only job is to introduce the next one.
- Never narrate the implementation step by step; the diff shows that. The shape of the change and any decision someone could re-open both stay.
- Facts apart from speculation. A guess is labelled a guess or is absent.
- File and directory names wherever a reader needs them. **Never a line number and never a position in a diff**: both are wrong as soon as anyone edits the file.
- The text stands without its links: the fact a link points to is in the sentence.
- Repo conventions and any repo template win over this file.

## W5 — Emit

Four questions before sending, each failing somewhere specific:

1. Could a reader who was not in the room act on this without asking anyone a question? Fails to W1: harvest more.
2. Could they get it by reading once, in order? Fails to W3: an unreadable sentence, a grid where an explanation belongs, headings over a four-paragraph ticket.
3. Could a project manager sequence and size it? Fails to what is in it, what is not, and what it depends on.
4. Could an engineer start, and know when they are finished? Fails to the substance and the criteria.

Then one subtraction pass, the only pass that removes anything: delete every restatement, every heading that earns nothing, every word carrying no fact. Removing a fact here is a defect, not a saving.

Emit the title on its own line, then the description, as copyable text in the chat. A file only for a batch, or on request. Only the part that was asked for, when one was. After the ticket text, the **handoff**, one line each and only when non-empty: the type you chose when the user did not name one; a bug's severity and its reason; facts nobody could supply; assumptions taken because no one could answer; attachments to add; "this is two tickets". The route creates no ledger; when the harvest read one, append one log line naming the writeup, in the ledger's log format, and change nothing else.
