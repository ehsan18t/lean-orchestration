// UserPromptSubmit hook: prepends the lean-orchestration Step 0 anti-trigger to
// every prompt, so routing is enforced by the harness instead of left to the
// model noticing the skill description on its own.
//
// Deliberately tiny (~55 tokens). It does NOT inline SKILL.md: loading the full
// procedure on a trivial turn gives you the brakes with no steering, which the
// skill itself warns against. The nudge points at the skill; the model loads it
// only when Step 0 says the task is non-trivial.
//
// Runs under Node so it works on macOS, Linux, and Windows without a POSIX
// shell. Never blocks a prompt: any failure exits 0 silently.

try {
  process.stdout.write(
    [
      "Before acting on this request, run lean-orchestration Step 0 (the anti-trigger).",
      'If the task is a quick lookup, a tight debug loop, or a single-file change that cannot',
      'alter a user-visible number or wedge/lose state, say "inline" in one line and proceed.',
      "Otherwise invoke the lean-orchestration skill and emit its one-line Route before",
      "dispatching any subagent or writing a plan. If a Route from an earlier request in this",
      "conversation still covers this one, say so in one line instead of re-routing.",
    ].join("\n"),
  );
} catch {
  process.exit(0);
}
