# Story

**Reader**: the project manager and the stakeholders first, the developer second. It goes deeper than an epic and stops before the code.

## Sections, in this order

| Section | Form | Present when |
|---|---|---|
| Module | One line of prose | Always |
| Problem statement | Prose, usually 2 to 3 sentences | Always |
| How it works today | Bullets | Always |
| Business rules | Bullets | A rule governs the work that a stakeholder can approve or veto |
| Expected outcome | Bullets | Always |

**Module.** The module or product area the story belongs to, named the way the team names it.

**Problem statement.** What is wrong or missing now and who it costs. Prose, because it is a chain of cause and consequence.

**How it works today.** The state the change starts from, one fact per bullet: what exists, what it does, where it falls short. Written so a reader can compare it against the expected outcome without scrolling back.

**Business rules.** The policy that governs the work, stated so a stakeholder can approve or veto it: what is allowed, what is not, what wins when two rules meet. Never the code-level version of a rule, which is the task's job.

**Expected outcome.** The end state, one observable statement per bullet, each specific enough to argue with and checkable on its own. This is the story's judgment bar and it is why the section is bullets rather than prose: a bar written as a paragraph cannot be checked item by item.

## A story never carries

- **An acceptance criteria section.** The expected outcome is the bar, and a story with both says the same thing twice; on a story with child tasks the criteria would duplicate theirs as well.
