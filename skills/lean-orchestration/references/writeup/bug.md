# Bug

**Reader**: the developer who will fix it. They know the product and are about to try to reproduce it.

## Sections, in this order

| Section | Form | Present when |
|---|---|---|
| Problem | Prose, usually 2 to 3 sentences | Always |
| Steps to reproduce | Numbered list | Always |
| Actual and expected | One table, or two sections; see below | Always |
| Effects | Bullets | Always |
| Scope | Bullets | Always |
| Acceptance criteria | Labelled bullets | Always |

**Problem.** What fails, where, and for whom, with the error text verbatim when there is one. A suspected cause, when you have one, is the last line of this section and starts with "Suspected:"; without that word it reads as a fact and sends the fixer to the wrong place.

**Steps to reproduce.** Numbered, starting from a state the reader can get to, including the data or account that matters. They come before the comparison because a reader who has just read the problem tries to reproduce it next. Plain numbers, not `AC-` labels: nobody cites a step by number. When the defect has no path through the product, the steps are the command, script or state that demonstrates it, said as such, and the last step names what to observe.

**Actual and expected.** Actual first, because that is the order the reader meets them. Count one pair per observable divergence, not per cause.

- **One table** labelled `Actual and expected`, columns Actual and Expected, when there are two or more pairs and each side of every row fits on one line.
- **Two sections** labelled `Actual result` and then `Expected behavior`, replacing the single label above, when either side needs more than a line or there is only one pair. A one row table is a sentence wearing a grid.

**Effects.** Who is hurt, how often, and what they cannot do meanwhile. Say whether it is total or partial, and name any data that is wrong or lost. This is where severity lives, as a fact rather than a label. A defect that is real but reaches nobody yet says exactly that, and says what would make it reach someone.

**Scope.** What is affected and what is not: the surfaces, the roles, the environments, the versions, and the build or release the observation came from. A reader uses this to decide whether their own case is this bug.

**Acceptance criteria.** The fix condition and its regression check. At least one criterion states that the reproduction steps no longer produce the actual result.

## A bug never carries

- **A cause presented as an observation.** What was not observed is prefixed "Suspected:".
