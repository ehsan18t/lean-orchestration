# Epic

**Reader**: a project manager, product owner or stakeholder deciding what a sprint contains and what it is worth. They are not going to open the code.

**What an epic is**: a body of work that ships as several tickets. It covers everything the work includes and stays above the level of how any of it is done.

## Sections, in this order

| Section | Form | Present when |
|---|---|---|
| Overview | Prose, 2 to 4 sentences | Always |
| Module | One line | Always |
| Scope | Bullets, one per affected feature or area | Always |

**Overview.** What the work is, the situation today that makes it necessary, and what it costs to not do it. Where it sits in a sequence, when it sits in one. This is prose because it is a chain of reasons, and a reason does not survive being cut into cells.

**Module.** The module, product area or system the work belongs to, named the way the team names it. One line, no elaboration.

**Scope.** One bullet per affected feature or area, each with one line on what changes there. Where a child ticket already exists, name it on its own bullet rather than in a list of its own: a separate breakdown duplicates the tracker and is stale the moment a ticket is split. The bullets together are the answer to "does this miss anything", so an area left out is left out deliberately.

## An epic never carries

- **Business rules.** They belong to the story or the task under it.
- **Acceptance criteria.** The overview and the scope bullets are what a stakeholder judges.
- **File names, symbol names or implementation detail.** If a bullet cannot be written without one, it is a task and not an epic scope line.
- **A list of child tickets as its own section.**
