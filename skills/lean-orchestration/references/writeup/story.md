# Story

**Reader**: the project manager and the stakeholders first, the developer second. It goes deeper than an epic and stops before the code.

**What a story is**: a change described by what a person can do afterwards. It can hold several items of work under it.

## Sections, in this order

| Section | Form | Present when |
|---|---|---|
| Module | One line | Always |
| Problem statement | Prose, 2 to 3 sentences | Always |
| How it works today | Bullets | Always |
| Business rules | Bullets | The work is governed by rules a stakeholder can approve or veto |
| Expected outcome | Prose, 2 to 3 sentences | Always |

**Module.** The module or product area the story belongs to, named the way the team names it.

**Problem statement.** What is wrong or missing now and who it costs. Prose, because it is a chain of cause and consequence.

**How it works today.** The state the change starts from, one fact per bullet: what exists, what it does, where it falls short. Written so a reader can compare it against the expected outcome without scrolling back.

**Business rules.** The policy that governs the work, stated so a stakeholder can approve or veto it: what is allowed, what is not, what wins when two rules meet. Never the code-level version of a rule, which is the task's job.

**Expected outcome.** The end state, written as statements someone can observe and check. This is the story's judgment bar, so it is specific enough to argue with.

## A story never carries

- **An acceptance criteria section.** The expected outcome is the bar; a story with both says the same thing twice, and on a story with child tasks the criteria would duplicate theirs.
- **File names, symbol names, endpoints or store names.** A story that needs one is a task.
- **Step by step implementation.**
