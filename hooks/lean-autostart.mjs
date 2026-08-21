// SessionStart hook: loads the lean-orchestration skill once, at the top of the
// session, so routing is in force before the first request instead of depending
// on the model noticing the skill description mid-conversation.
//
// This replaces the old per-prompt nudge. A nudge costs tokens on every message
// and only ever points at the skill; the model still has to load it for any real
// task, so the nudge was pure addition. Loading once puts the actual rules in
// context and leaves them in the cached prefix for the rest of the session.
//
// Measured over 72 local sessions (2026-08-21): with this hook injected the skill
// loaded in 8 of 9 sessions (89%); without it, in 6 of 63 (10%). Model judgment on
// the frontmatter alone is not a substitute, which is what this hook exists to fix.
//
// A cheaper variant was tried and reverted: injecting only the Step 0 anti-trigger
// (~170 tokens) and letting the model decide whether to load. That saves roughly
// 3-4% of session spend, but it hands the 89% back to model judgment with no way to
// tell when routing silently stopped firing. The load is ~4.9 KB against sessions
// that routinely run 200k-500k prefixes; buying certainty at that price is correct.
// If the cost ever needs cutting, split the core so autostart loads only the route
// table and defers the cost model, rather than deferring the load itself.
//
// initialUserMessage is used rather than additionalContext because it enters the
// turn as a real request, which is what makes the skill load. The text is prose
// rather than a slash command on purpose: the command resolves as `/lean` from a
// user-level install but `/lean-orchestration:lean` from a plugin install, and
// prose works under both.
//
// Never blocks a session: any failure exits 0 with no output.

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

try {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        initialUserMessage: [
          "Use the Skill tool to load `lean-orchestration` now. Actually invoke the tool; do not just",
          "acknowledge. Keep the skill in force for this entire session.",
          "Run its Step 0 anti-trigger on every request that follows, and emit the one-line Route",
          "before dispatching any subagent or writing a plan.",
          "Acknowledge in one short line. If the user has already made a request in this turn,",
          "handle it immediately in the same reply; otherwise wait for their first request.",
        ].join(" "),
      },
    }),
  );
} catch {
  process.exit(0);
}
