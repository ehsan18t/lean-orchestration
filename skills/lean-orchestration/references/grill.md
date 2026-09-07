# Grill — Step 2.5, the interview that replaces guessing

Loaded from `ground.md` Step 2.5 when a request is vague, narrative, or underspecified, on any route. Interview the user relentlessly about every aspect of the plan until you share an understanding of it, and write the docs as you go: the glossary, the decisions, and the ledger. A model left alone fills every gap with a plausible guess and pays for the rebuild later; an experienced developer would rather answer ten questions now. So the answer to vagueness is to ask, not to guess and not to shrink the scope.

**Create the ledger before the first question** (`ledger-template.md`), with the request and the open load-bearing set, and append each decision, assumption and term the moment it is settled, in narrow edits. A grill abandoned at question eight, or compacted midway, then leaves a record instead of nothing.

## Before the first question

1. Recon (Step 2.25) is done: you know what exists and what the request collides with, and every question cites it where it applies.
2. Build the **load-bearing set**. Walk the request as a design tree (deliverable, boundaries, data and state, failure paths, user-visible behavior, integration points, rollout) and ask at each node: *would a wrong guess here cause rework?* Yes: it is a question. No: it is an assumption; decide it, write it down, never ask it.
3. Order the set by dependency. The decision that unlocks or deletes the most other questions goes first.
4. Look up every **fact**: the codebase, the spec, the tests and the git history answer facts. Only **decisions** go to the user. Asking a fact the repo answers is what trains people to skip grills.

## Each question

One question per message; several at once is bewildering and gets shallow answers to all of them. The message carries the question, what the repo already says (one line, anchored), two to four options with their consequence, **your recommended answer** with its one-line reason, what the answer closes or opens, and the count of open questions remaining. Then wait: do not proceed on silence, do not answer for the user, do not stack the next question.

While the answers come in:

- **Challenge vocabulary.** A term that collides with the glossary or the code (`Customer` vs `User`, `cancel` vs `refund`) is settled on the spot: canonical term, words to avoid, written to the glossary.
- **Sharpen fuzzy words.** "Handle errors", "should be fast", "the usual way": ask for the observable behavior. It becomes a checklist item.
- **Probe with a scenario.** Run each load-bearing rule yourself against the edge cases (empty, duplicate, concurrent, partial failure, just past the boundary) and ask only about the one whose answer you cannot predict. A rule that survives three scenarios is a rule; one that does not was two.
- **Cross-check against code.** When the user says how something works today, confirm it in the code first; if the code disagrees, show the anchor and ask which is right. Half of later "bugs" are this.
- **Re-plan after each answer.** Delete the questions it closed, add the ones it opened, restate the count.

## Decisions and assumptions

Each answer becomes a ledger line as it is given: `D<n> (asked): <decision>, rejecting <alternative>`. Each gap you closed yourself becomes `A<n>: <assumption> — unverified` when you close it. A decision the user could not care about is an assumption.

A decision gets its alternatives and reason (three lines, not a page) and a copy in the project-wide decision record only when all three hold: hard to reverse, surprising to a future reader, and a real trade-off. The usual shapes: an architectural choice, an integration pattern, a technology with lock-in, an ownership or boundary rule (the explicit no matters as much as the yes), a deliberate deviation from the obvious path, a constraint invisible in the code, a rejection someone will otherwise propose again.

## Docs as you go

The repo's own conventions win. Terms go to a root `CONTEXT.md`, or, under a `CONTEXT-MAP.md`, to the `CONTEXT.md` of the context this task belongs to (infer which; ask if unclear); decisions go to `docs/adr/` as the next-numbered short file when that directory exists. Without those, terms go to `glossary.md` and decisions to `decisions.md` in the ledger directory, both created lazily on the first entry. A glossary entry is the term, one or two sentences on what it *is* (not what it does), and the words to avoid; only terms specific to this project, grouped under subheadings when clusters emerge. Read the glossary and the decision record at the start of any grill on a project that has them, and challenge the request against them.

## Exit

The grill exits when the load-bearing set is empty. Not at a question count, not when the user seems tired, not when you feel you understand. Then, in one message:

1. **The acceptance checklist**: numbered, observable statements that define done, each confirmable by looking at code, a test, or a run. Not "handles errors gracefully" but "a malformed payload returns 400 naming the bad field and writes no partial row." Each answered question and each surviving scenario becomes one item. For a feature or a fix, name under it the **seams the tests will cross**; no test is written later at a seam not named here. This checklist, not the prompt, is what Step 10 walks and what a later `amend` reads.
2. **The assumptions**, listed, so the user can veto any in one word.
3. **Complete the ledger** with the checklist and the seams; everything else is already there.
4. Ask for confirmation in one line. Do not enact anything before the checklist is confirmed, except when no one can confirm it (below).

## When you cannot grill

Running non-interactively, or told "just build it": do not silently guess. Create the ledger as usual, decide every load-bearing unknown yourself, record each as an assumption marked unverified, write the acceptance checklist from those decisions and mark it **unconfirmed**, and proceed; open the deliverable with the assumptions list. The `amend` route then turns a wrong assumption into a one-line correction instead of a rebuild.

## Anti-patterns, each of which has cost a rebuild

Three questions in one message. A fact the repo answers. A question that is not load-bearing but feels thorough. A question with no recommended answer. Proceeding after the first answer as if all were answered. Re-asking what the ledger or glossary records. Ending with a summary of the conversation instead of an acceptance checklist.
