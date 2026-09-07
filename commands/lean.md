---
description: Enter lean-orchestration mode: route this task for the most quality per token (inline vs. subagent per phase, adversarial verify only where it pays).
---

Apply the `lean-orchestration` procedure to the task below (or, if none is given here, to the current task in this conversation).

The skill body is normally already in this context, injected at session start and marked EXTREMELY_IMPORTANT. If it is there, do not load it again: a second copy is pure rent. Only if it is absent (autostart is off, or the injection never arrived) load it now with the Skill tool.

Then follow it exactly: run Step 0 first (if the task is small, a quick lookup, or a tight debug loop, say so and stay inline; if it corrects work already delivered, it is an amend), then emit the one-line Route before spending on any fan-out.

$ARGUMENTS
