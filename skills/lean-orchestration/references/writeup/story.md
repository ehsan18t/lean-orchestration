# Story

**Reader**: the project manager and the stakeholders first, the developer second. It goes deeper than an epic and stops before the code.

## Sections, in this order

| Section | Form | Present when |
|---|---|---|
| Module | One line of prose | Always |
| Problem statement | Prose, usually 2 to 3 sentences | Always |
| How it works today | Bullets | Always |
| Business rules | Bullets | A rule governs the work that a stakeholder can approve or veto |
| Expected outcome | Bullets | The decision model below picks it |
| Acceptance criteria | Labelled bullets | The decision model below picks it |

**Module.** The module or product area the story belongs to, named the way the team names it.

**Problem statement.** What is wrong or missing now and who it costs. Prose, because it is a chain of cause and consequence.

**How it works today.** The state the change starts from, one fact per bullet: what exists, what it does, where it falls short. Written so a reader can compare it against the last section without scrolling back.

**Business rules.** The policy that governs the work, stated so a stakeholder can approve or veto it: what is allowed, what is not, what wins when two rules meet. Never the code-level version of a rule, which is the task's job.

**Expected outcome.** The end state, one observable statement per bullet, each specific enough to argue with. It says what is true when the story is done, and each ticket under it is verified on its own.

**Acceptance criteria.** The QA bar for the whole story, in the same form every other type uses. This is the only place the feature is testable, so the criteria cover the behavior end to end rather than the parts: what a person can now do, what the system now returns, what happens on the failure path.

## Decision model: which of the two the story carries

One question decides it. **Is there a ticket under this story that nobody can verify without another ticket under the same story?**

- **Yes: acceptance criteria.** This is the usual shape when the story is split by layer rather than by outcome, for example one ticket designing the schema and the services while another builds the endpoints against them. Neither ticket is observable alone, so no ticket can carry the bar and QA has nothing to test against until both land. The story carries it for all of them.
- **No: expected outcome.** Each ticket under the story is testable on its own, or the story ships as a single ticket, so the bar lives in those tickets and the story states the end state instead.

Never both. They are the same fact in two shapes, and a reader then has to work out which one QA actually uses.

When the answer changes later, because a story split by outcome turns out to need a layer split, the section changes with it: this is a property of how the work was divided, not a preference.

## A story never carries

- **Both an expected outcome and acceptance criteria.**
