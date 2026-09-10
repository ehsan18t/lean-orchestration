# Task

**Reader**: the developer who will do the work. They already work in this codebase and on this product.

## Sections, in this order

| Section | Form | Present when |
|---|---|---|
| What to do | Bullets | Always |
| Business rules | Bullets | A rule binds the work and is not fully carried by an acceptance criterion |
| Cautions | Bullets | Something can go wrong, or something must land first |
| Scope and effects | Bullets | Always |
| Acceptance criteria | Labelled bullets | Always |

**What to do.** One bullet per piece of work, each saying what changes and what it becomes, with the file, component or endpoint named inside the bullet that acts on it. The shape of the change, not the steps to make it: if a bullet only makes sense read after the one above it, it is a step and the two belong together as one.

**Business rules.** Only the rules that bind this change, in terms checkable against the code: which value wins, what happens at the boundary, what the failure path is. A rule whose whole content is already observable in an acceptance criterion is dropped, because a rule and a criterion saying the same thing is the most common filler in a task. It stays when it carries a reason, a measurement or a constant the criterion leaves out, and then the criterion states the observable half.

**Cautions.** What breaks if this is done the obvious wrong way, what a past attempt got wrong, a limit that is easy to cross, and what must land before this can start or what waits on it.

**Scope and effects.** What this touches and what it does not: the areas changed, the consumers affected, anything downstream that has to move with it, and the adjacent thing deliberately left alone.

**Acceptance criteria.** Never a restatement of a What to do bullet: a criterion says what is true afterwards, not what someone did. Together they cover every outcome of the work that can be observed, including the ones from the business rules; a change nobody can observe gets no criterion rather than an invented one.

**When a fact fits two sections**, put it in the first of these that takes it, and nowhere else: Business rules, then Cautions, then Scope and effects. A constraint that governs the work is a rule before it is a hazard, and a hazard before it is a boundary.

## A task never carries

- **A materials or files section.**
- **Background that does not change what the developer does.** The why stays only where it would change a decision.
