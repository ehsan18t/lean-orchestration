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
// hook adds after the split is exactly what the earlier version of this gate could not see.
//
// Usage: node scripts/check-injection.mjs
// Exits non-zero and prints every failure. No dependencies. Reads only.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PART_LIMIT, SLOTS, buildPart, splitIntoParts } from "../hooks/lib.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HOOK = join(ROOT, "hooks", "session-start.mjs");
const failures = [];
const notes = [];

function check(name, condition, detail) {
  if (condition) notes.push(`  ok    ${name}`);
  else failures.push(`  FAIL  ${name}\n        ${detail}`);
}

// Runs the hook exactly as the harness does and returns the injected text, or "" when the
// slot emits nothing.
function runSlot(part, source) {
  const out = execFileSync(process.execPath, [HOOK, String(part)], {
    input: JSON.stringify({ source, cwd: ROOT }),
    encoding: "utf8",
  });
  if (!out.trim()) return "";
  return JSON.parse(out).hookSpecificOutput?.additionalContext ?? "";
}

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
  `hooks.json passes ${JSON.stringify(numbers)}, session-start.mjs declares SLOTS=${SLOTS}`,
);

// 2. The real hook, run slot by slot. This is the payload the harness sees, framing included.
const startup = [];
for (const n of wanted) startup.push([n, runSlot(n, "startup")]);
const live = startup.filter(([, text]) => text !== "");
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
  `${live.length} of ${SLOTS} slots are in use, so the body cannot grow by a whole part`,
);
notes.push(
  `  info  live payload uses ${live.length} of ${SLOTS} slots ` +
    `(${live.map(([, t]) => Buffer.byteLength(t)).join(", ")} bytes emitted, limit ${PART_LIMIT})`,
);
check("a slot with no part emits nothing at all", runSlot(SLOTS, "startup") === "" || live.length === SLOTS, "the last slot emitted content");
check("a malformed part number emits nothing", runSlot("abc", "startup") === "" && runSlot("0", "startup") === "", "a bad argument still injected");

// 3. The resume path, which shares buildPart and is otherwise untested.
const resume = runSlot(1, "resume");
check("the resume injection fits one slot", resume !== "" && Buffer.byteLength(resume) <= PART_LIMIT, `${Buffer.byteLength(resume)} bytes`);
check("the resume injection is closed", resume.endsWith("</EXTREMELY_IMPORTANT>"), "resume slot 1 does not close the block");
check("resume uses one slot only", runSlot(2, "resume") === "", "resume spilled into slot 2");

// 4. A payload larger than the slots can hold must not lose content in silence.
const skill = readFileSync(join(ROOT, "skills", "lean-orchestration", "SKILL.md"), "utf8").trim();
const grown = Array.from({ length: 4 }, () => skill).join("\n\n");
const grownParts = splitIntoParts(grown, PART_LIMIT);
const emitted = [];
for (let i = 1; i <= SLOTS + 3; i++) {
  const text = buildPart(grown, i);
  if (text !== null) emitted.push([i, text]);
}
const last = emitted[emitted.length - 1];
check("an overrun emits into no slot that exists", emitted.length === SLOTS, `emitted ${emitted.length} parts into ${SLOTS} slots`);
check("an overrun still closes the block", Boolean(last) && last[1].endsWith("</EXTREMELY_IMPORTANT>"), "the last slot that runs does not close the block");
check(
  "an overrun reports the drop and names what to read",
  Boolean(last) && /were dropped/i.test(last[1]) && /SKILL\.md/.test(last[1]),
  `${grownParts.length} parts wanted, ${SLOTS} slots, and the last slot says nothing about it`,
);
check(
  "the overrun notice does not push its own part over the limit",
  Boolean(last) && Buffer.byteLength(last[1]) <= PART_LIMIT,
  `${last ? Buffer.byteLength(last[1]) : 0} bytes`,
);

// 5. Structures the split can break.
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
const fenced = `# Code\n\n\`\`\`js\n${Array.from({ length: 400 }, (_, i) => `const v${i} = ${i};`).join("\n")}\n\`\`\`\n`;
const fencedParts = splitIntoParts(fenced, 1200);
check(
  "no part leaves a code fence unterminated",
  fencedParts.every((p) => (p.match(/^```/gm) || []).length % 2 === 0),
  `fence counts: ${fencedParts.map((p) => (p.match(/^```/gm) || []).length)}`,
);
const astral = `# E\n\n${"\u{1F600}".repeat(300)}\n`;
check(
  "cutting inside a word does not corrupt a character",
  !splitIntoParts(astral, 200).join("").includes("�") &&
    !Buffer.from(splitIntoParts(astral, 200).join(""), "utf8").includes(Buffer.from("�")),
  "a surrogate pair was split across two parts",
);
const start = Date.now();
splitIntoParts("# H\n\n€€€€€", 2);
check("a limit smaller than one character terminates", Date.now() - start < 1000, "splitIntoParts did not return");

console.log(notes.join("\n"));
if (failures.length) {
  console.log(`\n${failures.join("\n")}\n\n${failures.length} failing check(s).`);
  process.exit(1);
}
console.log("\nall checks passed.");
