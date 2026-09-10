#!/usr/bin/env node
// Gate for the session-start injection. The hook splits its payload into parts and each
// part is emitted by its own registered slot in hooks.json, so three things can silently
// go wrong: a payload that needs more parts than there are slots loses its tail, the
// closing tag rides on a part that never runs, and a section too big to split at a blank
// line goes out over the harness limit. None of the three reports an error at runtime.
//
// Usage: node scripts/check-injection.mjs
// Exits non-zero and prints every failure. No dependencies. Reads only.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PART_LIMIT, SLOTS, buildPart, splitIntoParts } from "../hooks/session-start.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const notes = [];

function check(name, condition, detail) {
  if (condition) notes.push(`  ok    ${name}`);
  else failures.push(`  FAIL  ${name}\n        ${detail}`);
}

// The real payload, built the way the hook builds it.
const skill = readFileSync(join(ROOT, "skills", "lean-orchestration", "SKILL.md"), "utf8").trim();
const output = readFileSync(join(ROOT, "skills", "lean-orchestration", "OUTPUT.md"), "utf8").trim();
const payload = `${skill}\n\n${output}`;

// 1. hooks.json registers exactly as many slots as the script believes it has.
const hooks = JSON.parse(readFileSync(join(ROOT, "hooks", "hooks.json"), "utf8"));
const registered = hooks.hooks.SessionStart.flatMap((entry) => entry.hooks)
  .filter((h) => (h.args || []).some((a) => String(a).endsWith("session-start.mjs"))).length;
check(
  "hooks.json registers SLOTS invocations",
  registered === SLOTS,
  `hooks.json registers ${registered}, session-start.mjs declares SLOTS=${SLOTS}`,
);

// 2. Today's payload fits, with the parts each under the limit.
const parts = splitIntoParts(payload, PART_LIMIT);
const over = parts.map((p, i) => [i + 1, Buffer.byteLength(p)]).filter(([, n]) => n > PART_LIMIT);
check("every part of the real payload is under the limit", over.length === 0, `over: ${JSON.stringify(over)}`);
check(
  "the real payload fits the registered slots",
  parts.length <= SLOTS,
  `needs ${parts.length} parts, ${SLOTS} slots registered`,
);
notes.push(
  `  info  payload ${Buffer.byteLength(payload)} bytes in ${parts.length} parts ` +
    `(${parts.map((p) => Buffer.byteLength(p)).join(", ")}), ${SLOTS} slots, limit ${PART_LIMIT}`,
);

// 3. A payload larger than the slots can hold must not lose content silently.
//    Grown from the real payload so the section shapes stay realistic.
const grown = Array.from({ length: 4 }, () => payload).join("\n\n");
const grownParts = splitIntoParts(grown, PART_LIMIT);
const emitted = [];
for (let i = 1; i <= SLOTS + 4; i++) {
  const text = buildPart(grown, i);
  if (text !== null) emitted.push([i, text]);
}
check(
  "an oversized payload emits nothing into a slot that does not exist",
  emitted.every(([i]) => i <= SLOTS),
  `emitted into slots ${emitted.map(([i]) => i).join(", ")} with only ${SLOTS} registered`,
);
const lastEmitted = emitted.filter(([i]) => i <= SLOTS).pop();
check(
  "the injected block is closed even when the payload overruns its slots",
  Boolean(lastEmitted) && lastEmitted[1].includes("</EXTREMELY_IMPORTANT>"),
  `slot ${lastEmitted ? lastEmitted[0] : "none"} is the last that runs and it does not close the block`,
);
check(
  "an overrun says so instead of dropping the tail in silence",
  Boolean(lastEmitted) && /were dropped/i.test(lastEmitted[1]) && /SKILL\.md/.test(lastEmitted[1]),
  `${grownParts.length} parts needed, ${SLOTS} slots, and the last slot neither reports the drop nor sends the model to SKILL.md`,
);
const grownOver = emitted.filter(([, t]) => Buffer.byteLength(t) > PART_LIMIT).map(([i]) => i);
check("no emitted part of an oversized payload exceeds the limit", grownOver.length === 0, `over: ${grownOver}`);

// 4. A single section too large to split at a blank line must still be cut under the limit.
const wall = `# Wall\n\n${"word ".repeat(4000).trim()}\n`;
const wallParts = splitIntoParts(wall, PART_LIMIT);
const wallOver = wallParts.map((p, i) => [i + 1, Buffer.byteLength(p)]).filter(([, n]) => n > PART_LIMIT);
check(
  "a paragraph larger than the limit is still split under it",
  wallOver.length === 0,
  `${Buffer.byteLength(wall)} bytes in one paragraph produced parts ${JSON.stringify(wallOver)} over the limit`,
);
check(
  "splitting a giant paragraph loses no bytes",
  wallParts.join("\n\n").replace(/\s+/g, " ").trim() === wall.replace(/\s+/g, " ").trim(),
  "the rejoined parts do not match the input",
);

console.log(notes.join("\n"));
if (failures.length) {
  console.log(`\n${failures.join("\n")}\n\n${failures.length} failing check(s).`);
  process.exit(1);
}
console.log("\nall checks passed.");
