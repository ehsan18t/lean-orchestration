// SessionStart hook: injects the lean-orchestration skill body directly, at the top
// of the session, so routing is in force before the first request instead of
// depending on the model noticing the skill description mid-conversation.
//
// Why inject the CONTENT rather than an instruction to load it:
//
// The previous version emitted "use the Skill tool to load lean-orchestration",
// which leaves one step that can fail. It has to argue with the model in its own
// text ("Actually invoke the tool; do not just acknowledge"), and it spent a real
// user turn to do it. Injecting the file removes the step entirely. It is also
// cheaper, not more expensive: on any session that routed, the old path paid the
// instruction AND then loaded the same SKILL.md anyway.
//
// This is the mechanism the superpowers plugin uses, and the reason its skills
// chain reliably: hook injects a body, and each phase names its successor
// explicitly, so description matching never has to fire twice.
//
// Measured over 72 local sessions (2026-08-21), against the older load-by-instruction
// hook: the skill loaded in 8 of 9 sessions (89%); with no hook at all, in 6 of 63
// (10%). Model judgment on the frontmatter alone is not a substitute, which is what
// this hook exists to fix. Injection should sit above the 89%, because there is no
// longer an invocation that can be skipped.
//
// A cheaper variant was tried and reverted: injecting only the Step 0 anti-trigger
// (~170 tokens) and letting the model decide whether to load. That saves roughly
// 3-4% of session spend, but it hands the guarantee back to model judgment with no
// way to tell when routing silently stopped firing. If the cost ever needs cutting,
// split the core so autostart injects only the route table and defers the cost
// model, rather than deferring the injection itself.
//
// additionalContext is used rather than initialUserMessage: the body needs to be
// present, not acted on, so it should not consume a user turn. The older hook needed
// a real request to force the Skill call; nothing forces anything now.
//
// Never blocks a session: any failure exits 0, and an unreadable SKILL.md degrades
// to the old load-by-instruction path rather than to nothing.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Off switch, highest precedence first:
//   1. LEAN_ORCHESTRATION_AUTOSTART   escape hatch, works however the skill was installed
//   2. CLAUDE_PLUGIN_OPTION_AUTOSTART set from the plugin's userConfig prompt or settings.json
// Anything else leaves autostart on.
const OFF = new Set(["off", "false", "0", "no"]);

function optionValue() {
  const direct = process.env.LEAN_ORCHESTRATION_AUTOSTART;
  if (direct !== undefined) return direct;
  // The exact casing of the injected option var is not contractual, so match loosely.
  for (const [k, v] of Object.entries(process.env)) {
    if (/^CLAUDE_PLUGIN_OPTION_AUTOSTART$/i.test(k)) return v;
  }
  return undefined;
}

const configured = optionValue();
if (configured !== undefined && OFF.has(String(configured).trim().toLowerCase())) process.exit(0);

// Resolved relative to this file rather than to CLAUDE_PLUGIN_ROOT, so the hook also
// works when the skill is installed on its own, outside the plugin.
const SKILL_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "skills", "lean-orchestration", "SKILL.md");

const SKILL_DIR = dirname(SKILL_PATH);

// Carries two things the injected body does not: what its prose leaves implicit (in force
// for the whole session, Step 0 re-runs per request), and the base directory, which the
// Skill tool would have supplied for free. SKILL.md points at its `references/*.md` phase
// files by relative path, so without the base directory the whole phase split is
// unresolvable. The Skill-tool line is scoped to this skill on purpose: Step 1.5 routes to
// other skills, and a blanket ban would break it.
const FRAMING = [
  "You are running under lean-orchestration. The full body of its SKILL.md follows, already",
  "loaded, so you do not need to load the lean-orchestration skill yourself. Other skills are",
  "unaffected: invoke them with the Skill tool as normal.",
  "This is in force for the entire session. Run its Step 0 anti-trigger on every request, and",
  "emit the one-line Route before dispatching any subagent or writing a plan.",
].join(" ");

// The one thing additionalContext does not supply that the Skill tool does. Without it the
// `references/*.md` phase files named in SKILL.md Step 1 cannot be resolved.
const BASE_DIR_LINE = `Base directory for this skill: ${SKILL_DIR}\nResolve every relative path in the body against that directory, the \`references/*.md\` phase files included.`;

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

try {
  let payload;
  try {
    const skill = readFileSync(SKILL_PATH, "utf8").trim();
    if (!skill) throw new Error("empty skill file");
    payload = {
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext: `<EXTREMELY_IMPORTANT>\n${FRAMING}\n\n${BASE_DIR_LINE}\n\n${skill}\n</EXTREMELY_IMPORTANT>`,
      },
    };
  } catch {
    payload = {
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        initialUserMessage: FALLBACK,
      },
    };
  }
  process.stdout.write(JSON.stringify(payload));
} catch {
  process.exit(0);
}
