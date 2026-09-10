# Task

**Reader**: the developer who will do the work. They already work in this codebase and on this product.

**What a task is**: a change described by what the code does afterwards. It is the most technical of the ticket types.

## Sections, in this order

| Section | Form | Present when |
|---|---|---|
| What to do | Bullets | Always |
| Business rules | Bullets | A rule binds the work and the criteria do not already make it observable |
| Cautions | Bullets | Something can go wrong, or something must land first |
| Scope and effects | Bullets | Always |
| Acceptance criteria | Labelled bullets, `AC-1:` upward | Always |

**What to do.** One bullet per piece of work, each saying what changes and what it becomes. Name the file, component or endpoint inside the bullet that acts on it. Say the shape of the change, not the steps to make it.

**Business rules.** Only the rules that bind this change, in terms checkable against the code: which value wins, what happens at the boundary, what the failure path is. A rule the acceptance criteria already make observable is dropped, because a rule and a criterion saying the same thing is the most common filler in a task.

**Cautions.** What breaks if this is done the obvious wrong way, what a past attempt got wrong, a limit that is easy to cross, and what must land before this can start or what waits on it.

**Scope and effects.** What this touches and what it does not: the areas changed, the consumers affected, anything downstream that has to move with it, and the adjacent thing deliberately left alone.

**Acceptance criteria.** Observable statements in present tense, one per bullet, each checkable on its own. Never a restatement of a What to do bullet: a criterion says what is true afterwards, not what someone did.

## A task never carries

- **A materials or files section.** Every file is named in the bullet that acts on it; a separate list is an inventory of the diff.
- **An explanation of an internal term.** Use the module, service and domain names the team uses, and never define them. The developer reading this knows them.
- **Background that does not change what the developer does.** The why stays only where it would change a decision.
- **Step by step narration** of the implementation.
