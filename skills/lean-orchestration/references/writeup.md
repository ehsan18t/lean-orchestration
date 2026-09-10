# Writeup — ticket, issue and PR text

Loaded from `SKILL.md` Step 1 on the **writeup** route: the user asks for a ticket, an issue, an epic, a story, a task, a bug report, a PR title or description, or one part of those (title only, description only). The route is harvest → draft → emit, all inline, 0 dispatches. The output is read by people: no em dashes and no hard-wrapped prose in it, even though this file uses em dashes itself. A writeup about ledgered work is not an amend: it reads the ledger and changes only its log.

## Read the type file before drafting

| Asked for | Read |
|---|---|
| epic | `writeup/epic.md` |
| story | `writeup/story.md` |
| task | `writeup/task.md` |
| bug, bug report, defect | `writeup/bug.md` |
| PR, pull request, MR | `writeup/pr.md` |

**No ticket is drafted before its type file is read.** This file carries only what is true of every type; the sections, their order and the form of each section live in the type file and nowhere else. Asked for two types, read this file once and both type files, and write two separate pieces of text. A rule is stated in exactly one file, so nothing here is repeated in a type file, and nothing in a type file overrides what is here except where that file says so.

## The bar

**Complete.** Someone who was not in the room knows what is being done, why, everything it touches, what is deliberately left out, and how it will be judged, without asking anyone a question. There is no length limit anywhere in this route. Length is never a reason to drop a fact, shorten a list, or generalise a name.

**Scannable.** The reader gets it by moving down the page. A section label says what is under it without the reader opening the bullets, and a bullet carries one fact. A ticket is read, not parsed.

The two never trade against each other, because what gets cut is filler, which has an exact definition:

- a sentence restating the title, or a section restating another section;
- a rule that is already an acceptance criterion;
- a paragraph where a bullet carries the same fact;
- a heading with nothing under it, "N/A", or anything written because the format offers the slot;
- a fact stated twice anywhere in the same piece of text.

Cut filler to zero. Cut content never. They are different operations and only the first is ever correct.

## W1 — Harvest

Sources, going past one only for what it lacks: the task's ledger (checklist items become criteria, D-lines decisions already made, A-lines that mattered constraints; it never holds the instances), the branch diff (`git diff --stat`, then every hunk that carries a name), the code (grep each instance for where it is used), the conversation last. When the work does not exist yet the ledger and the diff are empty, so the conversation and the code are the whole source; say so rather than inventing verification or blast radius that nothing supports.

Collect, and keep collecting until the completeness bar is met:

- **Instances**: the real names. The font family, the hex values, the component, the hook, the route, the token, the namespace, the file, the command, the error text verbatim with its numbers. A user's or customer's words are quoted in the sentence that carries the fact and linked in full, never paraphrased.
- **Everything the change touches**: every screen, route, job, module, locale file or consumer, named. "Site-wide" only when it is set at the root and you saw the root.
- **The adjacent thing left alone**: what usually moves with this and is not moving, and why.
- **Decisions already made**, each with the reason that makes it a decision rather than a preference.
- **Dependencies and order**: what must land first, what waits on this, what may merge in either order.
- **Verification**: what was run, or what will judge it, and where to look first if it misbehaves.
- **Conventions**: `.github/PULL_REQUEST_TEMPLATE.md` and `.github/ISSUE_TEMPLATE/` when present, followed exactly; the PR title prefix from `gh pr list --limit 15` when `gh` is available, else `git log --oneline -15`.

End with the list in hand. The draft names every entry on it, or the omission is deliberate and stated. A fact only the user holds: one question with a recommended answer, grill style; running non-interactively, take the recommended answer and say so in the chat, outside the ticket. A fact nobody holds: an open line in the section that would have carried it, never smoothed over. Two independent outcomes in one harvest are two tickets: write both.

## W2 — Type and title

Type, when the user did not name one: **epic** for a body of work that ships as several tickets; **bug** for something that does not work as intended; **story** for a change described by what a person can now do; **task** for a change described by what the code now does. A technical rebuild a user sees is a story if the ticket is written from the user's side, a task if from the code's side. Say which you chose in the chat, outside the ticket text.

| Type | Title grammar | Example |
|---|---|---|
| Epic | noun phrase naming the outcome or the area, title case | HCP and Corporate Onboarding Redesign |
| Story, task | imperative verb + the specific thing, sentence case | Add the setup tokens and shared primitives |
| Bug | the failure as a statement, subject first, sentence case; never the fix | CSV import drops the last row without a trailing newline |
| PR | task grammar, with the repo's prefix convention if it has one | Move the employee CSV parser into shared utilities |

No trailing period. Aim under 60 characters, hard 72. The title carries the name a teammate would search for; "improve", "enhance", "update" or "fix" without the instance fails.

## W3 — Rules that hold for every type

- **Sections are labelled and closed.** Emit the type file's sections, in its order, with its label wording, as a bold line above the content. A section with nothing real to say is dropped whole. Never add a section the type file does not list, and never fill one to have filled it.
- **Form is fixed per section** by the type file, not chosen while writing. A section the type file calls bullets is never written as a paragraph, and the reverse.
- **One fact per bullet**, and no bullet that restates another bullet or an acceptance criterion.
- **Acceptance criteria**, in the types that carry them, are labelled bullets: `AC-1:` through `AC-n:`, colon after the label, each an observable statement in present tense, each checkable without reading the rest of the ticket, none a restatement of the change. The label lets a reviewer cite one in a comment.
- **Name the instance, never the category**: the font family, the hex, the component, the namespace, the file.
- **Everything touched is enumerated, or stated as total.** Never "various", "several", "some".
- **No standalone list of files** in any type. A file is named inside the bullet that acts on it; a separate list is an inventory of the diff under a heading, and the reader gets that from the code.
- **Each reason rides in the sentence or bullet it justifies.** No rationale section, no line whose only job is to introduce the next one.
- **Never narrate the implementation step by step**; the diff shows that. The shape of the change and any decision someone could re-open both stay.
- **Facts apart from speculation.** A guess is labelled a guess or is absent.
- **Never a line number and never a position in a diff**: both are wrong as soon as anyone edits the file. Durable anchors only, symbol before directory before file.
- **The text stands without its links**: the fact a link points to is in the sentence.
- **Repo conventions and any repo template win** over this file and over the type file.

## W4 — Emit

Three checks, each failing somewhere specific:

1. Could a reader who was not in the room act on this without asking anyone a question? Fails to W1: harvest more.
2. Does every section label say its content, and does every bullet carry one fact? Fails to the type file: wrong section, wrong form.
3. Does any fact appear twice, in two sections or in two bullets? Fails to the subtraction pass below.

Then one subtraction pass, the only pass that removes anything: delete every restatement, every section that earns nothing, every word carrying no fact. Removing a fact here is a defect, not a saving.

Emit the title on its own line, then the sections, as copyable text in the chat. A file only for a batch, or on request. Only the part that was asked for, when one was.

**No handoff block.** Anything worth saying is inside a section: an unverified gate belongs in the type's verification or scope section, a fact nobody could supply is an open line in the section that would have carried it, an attachment is named in the bullet that needs it, and two outcomes are two pieces of text. Only a note about the writing itself, such as which type you chose when the user named none, or an assumption you took because no one was there to ask, is said as a plain sentence in the chat outside the copyable text.

When the harvest read a ledger, append one log line naming the writeup, in that ledger's log format, and change nothing else. The route creates no ledger.
