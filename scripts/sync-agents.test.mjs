// Tests for scripts/sync-agents.mjs. Run: node --test scripts/sync-agents.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PAIRS, build, staleAgents } from "./sync-agents.mjs";

const AGENTS = join(dirname(fileURLToPath(import.meta.url)), "..", "agents");
const finder = PAIRS.find((pair) => pair.from === "finder");
const source = readFileSync(join(AGENTS, "finder.md"), "utf8");
const body = (text) => text.slice(text.indexOf("\n---", 3));

test("build swaps the name, the description's tier sentence and the model, and keeps the body", () => {
  const out = build(source, finder);
  assert.match(out, /^name: finder-session$/m);
  assert.match(out, /^model: inherit$/m);
  assert.ok(out.includes(finder.sessionSentence));
  assert.ok(!out.includes(finder.tierSentence));
  assert.equal(body(out), body(source));
});

test("build keeps a byte order mark and CRLF line endings", () => {
  const out = build("﻿" + source.replace(/\n/g, "\r\n"), finder);
  assert.ok(out.startsWith("﻿---\r\n"));
  assert.ok(!/[^\r]\n/.test(out));
});

test("build writes $ in the session sentence literally", () => {
  assert.ok(build(source, { ...finder, sessionSentence: "costs $& and $1" }).includes("costs $& and $1"));
});

test("build refuses a source without its tier sentence or its model line", () => {
  assert.throws(() => build(source.replace(finder.tierSentence, "something else"), finder), /tier sentence/);
  assert.throws(() => build(source.replace(/^model:.*\r?\n/m, ""), finder), /no model/);
});

test("build refuses a source with no frontmatter block, or without a name or description", () => {
  assert.throws(() => build(source.replace(/^---\r?\n/, ""), finder), /no frontmatter/);
  assert.throws(() => build(source.replace(/^name:.*\r?\n/m, ""), finder), /no name/);
  assert.throws(() => build(source.replace(/^description:.*\r?\n/m, ""), finder), /no description/);
});

test("staleAgents names a session-tier file that no longer matches its source", () => {
  const dir = mkdtempSync(join(tmpdir(), "sync-agents-"));
  try {
    for (const pair of PAIRS) {
      const src = readFileSync(join(AGENTS, `${pair.from}.md`), "utf8");
      writeFileSync(join(dir, `${pair.from}.md`), src);
      writeFileSync(join(dir, `${pair.to}.md`), build(src, pair));
    }
    assert.deepEqual(staleAgents(dir), []);
    writeFileSync(join(dir, "finder.md"), `${source}\nOne more rule.\n`);
    assert.deepEqual(staleAgents(dir), ["finder-session"]);
    rmSync(join(dir, "skeptic-session.md"));
    assert.deepEqual(staleAgents(dir), ["finder-session", "skeptic-session"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the repo's session-tier agents are in sync with their sources", () => {
  assert.deepEqual(staleAgents(), []);
});
