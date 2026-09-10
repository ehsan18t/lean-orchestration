# PR

**Reader**: a reviewer with the diff already open, who can also open the ticket.

**The PR's bar is narrower than every other type.** A fact belongs in the PR only if the diff does not show it and the ticket does not state it. That test, not a word count, is what keeps a PR short, and it never argues for dropping something the reviewer has no other way to learn. The completeness bar in the core file is met by the ticket, the diff and this text together, not by this text alone.

## Sections, in this order

| Section | Form | Present when |
|---|---|---|
| Summary | Prose, usually 1 to 2 sentences | Always |
| Changes | Bullets, one per area | Always |
| Action required | Bullets | The reviewer or a consumer has to act |
| Verification | Bullets | Always |
| Review focus | Bullets, usually one or two | Always |
| Not included | Bullets | A reviewer would otherwise assume the thing is in this PR |

**Summary.** What this does and why, with the ticket link. Never a restatement of the ticket, which the reviewer can open, unless there is no ticket to open.

**Changes.** One bullet per area, each leading with what changed rather than with a path, and naming the file inside the bullet where it helps. No sub-bullets. A reason only where the code does not make it obvious. This says the shape of the change, which the diff cannot say.

**Action required.** Only what someone must act on: a migration, a config change, a moved shared type, a behavior change a consumer depends on. Nothing here otherwise, and the section is dropped. This is not the task's Scope and effects, which is the whole blast radius; only the part someone has to do something about reaches a PR.

**Verification.** What was actually run, and any gate that failed, was skipped, or is expected to fail. A claim nobody checked is stated as unverified here rather than left out, and a PR where nothing was run says that.

**Review focus.** The one or two things to read first, by name, and why they are the risky part.

**Not included.** Only what a reviewer would actively assume is in this PR. Not a list of everything the PR is not, and not the ticket's out of scope section repeated.

## A PR never carries

- **Acceptance criteria.** They live in the ticket, and copying them here is the same fact in two documents.
- **The ticket's problem statement**, unless the reviewer cannot open the ticket.
