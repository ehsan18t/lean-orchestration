// UserPromptSubmit hook: one short line per prompt, re-arming Step 0.
//
// The skill body sits in the prefix from session start, but a standing instruction
// decays over a long session: the structure fires once and the restrictions persist.
// A per-prompt line is the direct countermeasure. It points at the body already in
// context and loads nothing, so its whole cost is its own length, roughly 60 tokens,
// re-billed as prefix like everything else. The earlier per-prompt nudge that was
// removed cost more because it pointed at a skill that then had to be loaded.
//
// Respects the same setting as the session-start hook: with autostart off there is
// no body to point at, so this emits nothing.

import { autostartEnabled, emit } from "./lib.mjs";

try {
  if (!autostartEnabled()) process.exit(0);
  emit({
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext:
        "lean-orchestration: run Step 0 on this request now. If it corrects or extends work that has a ledger, however small, it is an amend: read that ledger and references/amend.md before editing. Emit a Route line or say in one line that the prior route holds. Output: answer on line one, then short sections of bullets and no paragraphs, sections and bullets both ordered most important first, nothing important dropped.",
    },
  });
} catch {
  process.exit(0);
}
