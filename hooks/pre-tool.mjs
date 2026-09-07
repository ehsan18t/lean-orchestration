// PreToolUse hook: removes permission prompts for the two directories this plugin owns.
//
// The skill's phase files live in the plugin directory and the ledgers live, by default,
// in Claude's per-project directory. Both are outside the working directory, so without
// this hook every phase-file read and every ledger update asks for permission, and in a
// non-interactive session is refused outright, which silently drops the model back to
// inline work with no ledger. Measured in a print-mode session before this hook existed:
// the model routed to amend, tried to read the ledger and amend.md, was refused both, and
// fell back to an unrecorded inline edit.
//
// Scope, deliberately narrow:
//   Read                      inside this plugin's skills/lean-orchestration/ directory
//   Read / Edit / Write       inside the resolved ledger directory
// Anything else emits no decision and goes through the normal permission flow.

import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { autostartEnabled, emit, readStdinJson, resolveLedgerDir } from "./lib.mjs";

function inside(file, dir) {
  const f = resolve(file).toLowerCase();
  const d = resolve(dir).toLowerCase();
  return f === d || f.startsWith(d.endsWith(sep) ? d : d + sep);
}

try {
  if (!autostartEnabled()) process.exit(0);
  const input = readStdinJson();
  const tool = String(input.tool_name || "");
  const file = input.tool_input && input.tool_input.file_path;
  if (!file || typeof file !== "string") process.exit(0);

  const SKILL_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "skills", "lean-orchestration");
  const ledgerDir = resolveLedgerDir(input);

  let reason = "";
  if (tool === "Read" && inside(file, SKILL_DIR)) reason = "lean-orchestration phase file";
  else if ((tool === "Read" || tool === "Edit" || tool === "Write" || tool === "MultiEdit") && inside(file, ledgerDir)) reason = "lean-orchestration ledger";
  if (!reason) process.exit(0);

  emit({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",
      permissionDecisionReason: reason,
    },
  });
} catch {
  process.exit(0);
}
