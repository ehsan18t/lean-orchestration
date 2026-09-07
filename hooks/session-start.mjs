// SessionStart hook: injects the lean-orchestration skill body at the top of the
// session, so routing is in force before the first request instead of depending on
// the model noticing the skill description mid-conversation.
//
// Why inject the CONTENT rather than an instruction to load it: an instruction leaves
// one step that can fail (the model can acknowledge without invoking), and on any
// session that routed, that path paid the instruction AND then loaded the same
// SKILL.md anyway. Measured over 72 local sessions (2026-08-21): a session-start
// hook loaded the skill in 8 of 9 sessions (89%); with no hook at all, in 6 of 63
// (10%). Injection removes the invocation that could be skipped.
//
// What it injects, by source:
//   startup / clear / compact   the framing, the skill's base directory, the ledger
//                               directory and index, then the full SKILL.md body.
//                               Compaction can summarize the body away; this re-arms it.
//   resume                      the ledger directory and index only, plus a one-line
//                               "in force" note. A resumed transcript already carries
//                               the body; re-injecting it would double its rent.
//
// additionalContext is used rather than initialUserMessage: the body needs to be
// present, not acted on, so it must not consume a user turn.
//
// Never blocks a session: any failure exits 0, and an unreadable SKILL.md degrades to
// an instruction to load the skill rather than to nothing.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { autostartEnabled, emit, ledgerBlock, readStdinJson, resolveLedgerDir } from "./lib.mjs";

try {
  if (!autostartEnabled()) process.exit(0);

  // Resolved relative to this file rather than to CLAUDE_PLUGIN_ROOT, so the hook also
  // works when the skill is installed on its own, outside the plugin.
  const SKILL_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "skills", "lean-orchestration");
  const SKILL_PATH = join(SKILL_DIR, "SKILL.md");

  const input = readStdinJson();
  const source = String(input.source || "startup").toLowerCase();
  const ledgers = ledgerBlock(resolveLedgerDir(input));

  if (source === "resume") {
    const note = [
      "lean-orchestration is in force for this session; its body was injected earlier in this",
      "transcript. If you cannot see that body, load the `lean-orchestration` skill with the Skill",
      "tool now. Run its Step 0 on every request. The ledger index below is current; the one in",
      "the earlier injection is not.",
    ].join(" ");
    emit({
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext: `<EXTREMELY_IMPORTANT>\n${note}\n\n${ledgers}\n</EXTREMELY_IMPORTANT>`,
      },
    });
    process.exit(0);
  }

  // Carries what the injected body leaves implicit (in force for the whole session,
  // Step 0 re-runs per request) and the base directory, which the Skill tool would have
  // supplied for free. SKILL.md points at its `references/*.md` phase files by relative
  // path, so without the base directory the phase split is unresolvable. The Skill-tool
  // line is scoped to this skill on purpose: a blanket ban would break other skills.
  const FRAMING = [
    "You are running under lean-orchestration. The full body of its SKILL.md follows, already",
    "loaded, so you do not need to load the lean-orchestration skill yourself. Other skills are",
    "unaffected: invoke them with the Skill tool as normal.",
    "This is in force for the entire session. Run its Step 0 anti-trigger on every request, and",
    "emit the one-line Route before dispatching any subagent or writing a plan.",
  ].join(" ");

  const BASE_DIR_LINE =
    `Base directory for this skill: ${SKILL_DIR}\n` +
    "Resolve every relative path in the body against that directory, the `references/*.md` phase files included.";

  // Used only when SKILL.md cannot be read. Weaker, because the model can acknowledge
  // without invoking, but better than arming nothing.
  const FALLBACK = [
    "Use the Skill tool to load `lean-orchestration` now. Actually invoke the tool; do not just",
    "acknowledge. Keep the skill in force for this entire session.",
    "Run its Step 0 anti-trigger on every request that follows, and emit the one-line Route",
    "before dispatching any subagent or writing a plan.",
    "Acknowledge in one short line. If the user has already made a request in this turn,",
    "handle it immediately in the same reply; otherwise wait for their first request.",
  ].join(" ");

  let skill = "";
  try {
    skill = readFileSync(SKILL_PATH, "utf8").trim();
  } catch {
    skill = "";
  }

  if (!skill) {
    emit({ hookSpecificOutput: { hookEventName: "SessionStart", initialUserMessage: FALLBACK } });
    process.exit(0);
  }

  emit({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: `<EXTREMELY_IMPORTANT>\n${FRAMING}\n\n${BASE_DIR_LINE}\n\n${ledgers}\n\n${skill}\n</EXTREMELY_IMPORTANT>`,
    },
  });
} catch {
  process.exit(0);
}
