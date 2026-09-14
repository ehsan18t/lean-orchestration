#!/usr/bin/env node
// Gate for the session-start injection. The hook splits its payload into parts and each
// part is emitted by its own registered slot in hooks.json, so several things can go wrong
// with no error at runtime: a payload needing more parts than there are slots loses its
// tail, the closing tag rides on a part that never runs, a slot is registered with the
// wrong part number, framing pushes a part over the harness limit after the split, or a
// section too big to cut at a blank line goes out whole.
//
// The slot checks run the real hook as a subprocess and measure the additionalContext it
// actually emits, rather than the split it would have produced, because everything the
// hook adds after the split is what the first version of this gate could not see. They run
// it against a fixture ledger directory holding the maximum number of index lines, so the
// headroom reported is a property of the artifact and not of whoever runs the gate.
//
// Usage: node scripts/check-injection.mjs
// Exits non-zero and prints every failure. No dependencies. Writes only to a temp directory.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { OUTPUT_LABEL, PART_LIMIT, SLOTS, buildPart, injectedReminder, pluginVersion, reminderLead, splitIntoParts } from "../hooks/lib.mjs";
import { staleAgents } from "./sync-agents.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HOOK = join(ROOT, "hooks", "session-start.mjs");
const failures = [];
const notes = [];

function check(name, condition, detail) {
  if (condition) notes.push(`  ok    ${name}`);
  else failures.push(`  FAIL  ${name}\n        ${detail}`);
}

// A worst-case ledger directory: the index caps at 10 lines, each carrying a full path and
// title, and it is the one input to the payload that grows outside this repo's control.
const FIXTURE = mkdtempSync(join(tmpdir(), "lean-orch-gate-"));
for (let i = 0; i < 12; i++) {
  const name = `2026-09-${String(i + 1).padStart(2, "0")}-${"a-long-enough-task-slug".repeat(2)}-${i}.md`;
  writeFileSync(
    join(FIXTURE, name),
    `---\ntask: fixture-${i}\ntitle: ${"A ledger title long enough to be realistic ".repeat(2)}${i}\nstatus: open\nroute: feature\nupdated: 2026-09-${String(i + 1).padStart(2, "0")}\n---\n\nbody\n`,
  );
}

// Runs the hook exactly as the harness does and returns the injected text, or "" when the
// slot emits nothing. The environment is pinned so a developer's own settings cannot make
// the gate pass on a broken build or fail on a working one.
function runSlot(part, source) {
  const out = execFileSync(process.execPath, [HOOK, String(part)], {
    input: JSON.stringify({ source, cwd: ROOT }),
    encoding: "utf8",
    env: { ...process.env, LEAN_ORCHESTRATION_AUTOSTART: "on", LEAN_ORCHESTRATION_LEDGER_DIR: FIXTURE },
  });
  if (!out.trim()) return "";
  return JSON.parse(out).hookSpecificOutput?.additionalContext ?? "";
}

try {
  // 1. hooks.json registers the part numbers 1 through SLOTS, each exactly once. Counting
  //    the registrations is not enough: two slots both passing "3" leave part 5 unemitted.
  const hooks = JSON.parse(readFileSync(join(ROOT, "hooks", "hooks.json"), "utf8"));
  const numbers = hooks.hooks.SessionStart.flatMap((entry) => entry.hooks)
    .filter((h) => (h.args || []).some((a) => String(a).trim().endsWith("session-start.mjs")))
    .map((h) => Number(String(h.args[1]).trim()))
    .sort((a, b) => a - b);
  const wanted = Array.from({ length: SLOTS }, (_, i) => i + 1);
  check(
    "hooks.json registers part numbers 1 to SLOTS, each once",
    JSON.stringify(numbers) === JSON.stringify(wanted),
    `hooks.json passes ${JSON.stringify(numbers)}, lib.mjs declares SLOTS=${SLOTS}`,
  );

  // 2. The real hook, run slot by slot. This is the payload the harness sees, framing included.
  const startup = wanted.map((n) => [n, runSlot(n, "startup")]);
  const live = startup.filter(([, text]) => text !== "");
  check("the hook injects anything at all", live.length > 0, "every slot emitted nothing, so no check below proves anything");
  if (live.length > 0) {
    const oversize = live.filter(([, text]) => Buffer.byteLength(text) > PART_LIMIT).map(([n]) => n);
    check("every emitted slot is under the limit, framing included", oversize.length === 0, `over: ${oversize}`);
    check(
      "the emitted slots are the first ones, with no gap",
      live.every(([n], i) => n === i + 1),
      `emitted slots ${live.map(([n]) => n).join(", ")}`,
    );
    check(
      "the injection opens once and closes once",
      live.filter(([, t]) => t.includes("<EXTREMELY_IMPORTANT>")).length === 1 &&
        live.filter(([, t]) => t.includes("</EXTREMELY_IMPORTANT>")).length === 1 &&
        live[0][1].startsWith("<EXTREMELY_IMPORTANT>") &&
        live[live.length - 1][1].endsWith("</EXTREMELY_IMPORTANT>"),
      "the opening or closing tag is missing, duplicated, or not on the first and last emitted slot",
    );
    check(
      "the payload still has slots to spare",
      live.length < SLOTS,
      `${live.length} of ${SLOTS} slots are in use against the fullest ledger index, so the body cannot grow by a whole part`,
    );
    check(
      "the slot after the last live one emits nothing",
      live.length >= SLOTS || runSlot(live.length + 1, "startup") === "",
      `slot ${live.length + 1} emitted content although slot ${live.length} was the last with a part`,
    );
    notes.push(
      `  info  worst-case payload uses ${live.length} of ${SLOTS} slots ` +
        `(${live.map(([, t]) => Buffer.byteLength(t)).join(", ")} bytes emitted, limit ${PART_LIMIT})`,
    );
  }
  check("a malformed part number emits nothing", runSlot("abc", "startup") === "" && runSlot("0", "startup") === "", "a bad argument still injected");

  // 3. The resume path. It carries the ledger index and the full output rules, which can
  //    outgrow one slot, and every slot runs on resume too, so it is held to the same rules
  //    as startup: slots in order with no gap, each under the limit, opened and closed once,
  //    and the output rules arriving whole.
  const resumed = wanted.map((n) => [n, runSlot(n, "resume")]).filter(([, text]) => text !== "");
  check("the resume injection emits anything at all", resumed.length > 0, "every resume slot emitted nothing");
  if (resumed.length > 0) {
    check("every resume slot is under the limit", resumed.every(([, t]) => Buffer.byteLength(t) <= PART_LIMIT), `bytes: ${resumed.map(([, t]) => Buffer.byteLength(t))}`);
    check("the resume slots are the first ones, with no gap", resumed.every(([n], i) => n === i + 1), `emitted slots ${resumed.map(([n]) => n).join(", ")}`);
    check(
      "the resume injection opens once and closes once",
      resumed.filter(([, t]) => t.includes("<EXTREMELY_IMPORTANT>")).length === 1 &&
        resumed.filter(([, t]) => t.includes("</EXTREMELY_IMPORTANT>")).length === 1 &&
        resumed[0][1].startsWith("<EXTREMELY_IMPORTANT>") &&
        resumed[resumed.length - 1][1].endsWith("</EXTREMELY_IMPORTANT>"),
      "the opening or closing tag is missing, duplicated, or not on the first and last resume slot",
    );
    const rulesTail = readFileSync(join(ROOT, "skills", "lean-orchestration", "OUTPUT.md"), "utf8")
      .split("\n")
      .filter((line) => line.trim() && !/^\s*(```|~~~)/.test(line))
      .pop();
    check(
      "the resume injection carries the output rules to their last line",
      resumed.some(([, t]) => t.includes(rulesTail)),
      `the last line of OUTPUT.md is missing from the resume slots: ${rulesTail.slice(0, 60)}`,
    );
    check("the resume injection leaves slots to spare", resumed.length < SLOTS, `${resumed.length} of ${SLOTS} slots are in use on resume`);
  }

  // 4. A payload larger than the slots can hold must not lose content in silence. Grown
  //    until it genuinely overruns, so the checks below do not depend on SKILL.md's size.
  const skill = readFileSync(join(ROOT, "skills", "lean-orchestration", "SKILL.md"), "utf8").trim();
  let grown = skill;
  while (splitIntoParts(grown, PART_LIMIT).length <= SLOTS) grown = `${grown}\n\n${skill}`;
  const wants = splitIntoParts(grown, PART_LIMIT).length;
  const emitted = [];
  for (let i = 1; i <= SLOTS + 3; i++) {
    const text = buildPart(grown, i);
    if (text !== null) emitted.push([i, text]);
  }
  const last = emitted[emitted.length - 1];
  check("an overrun fills the slots and stops", emitted.length === SLOTS, `${wants} parts wanted, ${emitted.length} emitted into ${SLOTS} slots`);
  check("an overrun still closes the block", Boolean(last) && last[1].endsWith("</EXTREMELY_IMPORTANT>"), "the last slot that runs does not close the block");
  check(
    "an overrun reports the drop and names what to read",
    Boolean(last) && /were dropped/i.test(last[1]) && /SKILL\.md/.test(last[1]),
    `${wants} parts wanted, ${SLOTS} slots, and the last slot says nothing about it`,
  );
  check(
    "the overrun notice does not push its own part over the limit",
    Boolean(last) && Buffer.byteLength(last[1]) <= PART_LIMIT,
    `${last ? Buffer.byteLength(last[1]) : 0} bytes`,
  );
  const single = buildPart(grown, 1, 1);
  check(
    "an overrun into a single slot keeps its content",
    Boolean(single) && Buffer.byteLength(single) > 1000 && single.endsWith("</EXTREMELY_IMPORTANT>"),
    `one slot for ${wants} parts emitted ${single ? Buffer.byteLength(single) : 0} bytes`,
  );

  // 5. Structures the split can break. Each part is inspected on its own, because each is
  //    a separate hook output: nothing downstream ever rejoins them.
  const wall = `# Wall\n\n${"word ".repeat(4000).trim()}\n`;
  const wallParts = splitIntoParts(wall, PART_LIMIT);
  check(
    "a paragraph larger than the limit is still cut under it",
    wallParts.every((p) => Buffer.byteLength(p) <= PART_LIMIT),
    `parts: ${wallParts.map((p) => Buffer.byteLength(p))}`,
  );
  check(
    "cutting a giant paragraph loses no non-whitespace content",
    wallParts.join("\n\n").replace(/\s+/g, " ").trim() === wall.replace(/\s+/g, " ").trim(),
    "the rejoined parts do not match the input",
  );
  const code = Array.from({ length: 400 }, (_, i) => `const v${i} = ${i};`).join("\n");
  const fences = {
    plain: `# Code\n\n\`\`\`js\n${code}\n\`\`\`\n`,
    "with a blank line inside": `# Code\n\n\`\`\`js\nconst a = 1;\n\n${code}\n\`\`\`\n`,
    tilde: `# Code\n\n~~~js\n${code}\n~~~\n`,
  };
  for (const [name, doc] of Object.entries(fences)) {
    const cut = splitIntoParts(doc, 1200);
    check(
      `no part leaves a fence unterminated (${name})`,
      cut.length > 1 && cut.every((p) => (p.match(/^ {0,3}(```|~~~)/gm) || []).length % 2 === 0),
      `${cut.length} parts, fence counts ${JSON.stringify(cut.map((p) => (p.match(/^ {0,3}(```|~~~)/gm) || []).length))}`,
    );
  }
  const astral = `# E\n\n${"\u{1F600}".repeat(300)}\n`;
  const lone = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;
  check(
    "no single part ends on half of a character",
    [200, 12, 40].every((l) => splitIntoParts(astral, l).every((p) => !lone.test(p))),
    "a part contains a lone surrogate, which reaches the model as a replacement character",
  );
  const start = Date.now();
  splitIntoParts("# H\n\n€€€€€", 2);
  check("a limit smaller than one character terminates", Date.now() - start < 1000, "splitIntoParts did not return");

  // 6. The session-tier agents are generated from their default-tier sources by
  //    scripts/sync-agents.mjs; a stale one ships the old rules under a new model.
  let stale;
  try {
    stale = staleAgents();
  } catch (error) {
    stale = [`(could not build them: ${error.message})`];
  }
  check("the session-tier agents match their sources", stale.length === 0, `stale: ${stale.join(", ")}; run node scripts/sync-agents.mjs`);
  let testsPass = true;
  let testTail = "";
  try {
    execFileSync(process.execPath, ["--test", join(ROOT, "scripts", "sync-agents.test.mjs")], { encoding: "utf8", stdio: "pipe" });
  } catch (error) {
    testsPass = false;
    testTail = String(error.stdout || error.message).trim().split("\n").slice(-6).join(" | ");
  }
  check("scripts/sync-agents.test.mjs passes", testsPass, testTail);

  // 7. The per-prompt reminder names the plugin version, and the transcript scripts recognize
  //    it and its unversioned form, but never a quote of it.
  const version = pluginVersion();
  const reminder =
    JSON.parse(
      execFileSync(process.execPath, [join(ROOT, "hooks", "prompt-submit.mjs")], {
        input: "{}",
        encoding: "utf8",
        env: { ...process.env, LEAN_ORCHESTRATION_AUTOSTART: "on" },
      }) || "{}",
    ).hookSpecificOutput?.additionalContext ?? "";
  check("the plugin version is readable", Boolean(version), "pluginVersion() found no version in .claude-plugin/plugin.json");
  check("the reminder opens with the plugin name and version", reminder.startsWith(`lean-orchestration ${version}: run Step 0`), `the reminder opens: ${reminder.slice(0, 60)}`);
  const attached = (text, hookEvent = "UserPromptSubmit") => ({ type: "attachment", attachment: { type: "hook_additional_context", hookEvent, content: [text] } });
  const fallback = `${reminderLead(null)}${reminder.slice(reminderLead(version).length)}`;
  check("an unreadable version falls back to the unversioned opening", reminderLead(null) === "lean-orchestration: run Step 0", `reminderLead(null) is ${JSON.stringify(reminderLead(null))}`);
  // The first reminder that carried the output rules (da7f95b), so older transcripts still count.
  const firstShipped =
    "lean-orchestration: run Step 0 on this request now. If it corrects or extends work that has a ledger, however small, it is an amend: read that ledger and references/amend.md before editing. Emit a Route line or say in one line that the prior route holds. Output: answer first, the important with its reasoning, the rest compressed, nothing padded.";
  check(
    "the transcript scripts recognize the reminder, versioned, unversioned and first shipped, with its output label",
    [reminder, fallback, firstShipped].every((t) => (injectedReminder(attached(t)) ?? "").includes(OUTPUT_LABEL)),
    "injectedReminder() missed the current reminder, its fallback, or the first shipped wording",
  );
  check(
    "a quote of the reminder is not an injection",
    injectedReminder({ type: "user", toolUseResult: { stdout: reminder } }) === null &&
      injectedReminder(attached(reminder, "SessionStart")) === null &&
      injectedReminder(attached(`Another hook quoting it: ${reminder}`)) === null,
    "injectedReminder() counted a tool result, a SessionStart attachment, or a hook context that only quotes the reminder",
  );
} finally {
  rmSync(FIXTURE, { recursive: true, force: true });
}

console.log(notes.join("\n"));
if (failures.length) {
  console.log(`\n${failures.join("\n")}\n\n${failures.length} failing check(s).`);
  process.exit(1);
}
console.log("\nall checks passed.");
