// Writes each session-tier agent from its default-tier source, so a pair shares one body.
// Only the frontmatter `name`, the tier sentence of `description`, and `model` differ.
// Edit the source (agents/finder.md, agents/skeptic.md), then run: node scripts/sync-agents.mjs
// `--check` writes nothing and exits 1 when a session-tier file is out of date.
import { readFileSync, writeFileSync, existsSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const AGENTS = join(dirname(fileURLToPath(import.meta.url)), "..", "agents");
const TABLE = "the lean-orchestration skill's tier table (SKILL.md cost model item 2)";

export const PAIRS = [
  {
    from: "finder",
    to: "finder-session",
    tierSentence: `Default tier (Opus 4.8); ${TABLE} says when \`finder-session\` runs instead.`,
    sessionSentence: `Session-model tier of \`finder\`, same contract; ${TABLE} says when it runs.`,
  },
  {
    from: "skeptic",
    to: "skeptic-session",
    tierSentence: `Default tier (Opus 4.8); ${TABLE} says when \`skeptic-session\` or \`skeptic-max\` runs instead.`,
    sessionSentence: `Session-model tier of \`skeptic\`, same contract; ${TABLE} says when it runs.`,
  },
];

export function build(source, { from, to, tierSentence, sessionSentence }) {
  const eol = source.includes("\r\n") ? "\r\n" : "\n";
  const bom = source.startsWith("﻿") ? "﻿" : "";
  const lines = source.slice(bom.length).split(/\r?\n/);
  const end = lines.indexOf("---", 1);
  if (lines[0] !== "---" || end < 0) throw new Error(`agents/${from}.md has no frontmatter block`);
  const fields = lines.slice(1, end);
  const at = (key) => fields.findIndex((line) => line.startsWith(`${key}:`));
  for (const key of ["name", "description", "model"]) {
    if (at(key) < 0) throw new Error(`agents/${from}.md frontmatter has no ${key}`);
  }
  if (!fields[at("description")].includes(tierSentence)) {
    throw new Error(`agents/${from}.md description lacks its tier sentence: ${tierSentence}`);
  }
  fields[at("name")] = `name: ${to}`;
  fields[at("description")] = fields[at("description")].replace(tierSentence, () => sessionSentence);
  fields[at("model")] = "model: inherit";
  return bom + ["---", ...fields, ...lines.slice(end)].join(eol);
}

// The session-tier agents in `dir` that are missing or differ from what their source builds.
export function staleAgents(dir = AGENTS) {
  return PAIRS.filter((pair) => {
    const path = join(dir, `${pair.to}.md`);
    const want = build(readFileSync(join(dir, `${pair.from}.md`), "utf8"), pair);
    return !existsSync(path) || readFileSync(path, "utf8") !== want;
  }).map((pair) => pair.to);
}

// True only when this file is the script node was asked to run, never when it is imported.
function runAsScript() {
  try {
    return Boolean(process.argv[1]) && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(resolve(process.argv[1]));
  } catch {
    return false;
  }
}

if (runAsScript()) {
  const check = process.argv.includes("--check");
  let stale = 0;
  for (const pair of PAIRS) {
    const want = build(readFileSync(join(AGENTS, `${pair.from}.md`), "utf8"), pair);
    const path = join(AGENTS, `${pair.to}.md`);
    if (existsSync(path) && readFileSync(path, "utf8") === want) continue;
    if (check) {
      console.error(`stale: agents/${pair.to}.md does not match agents/${pair.from}.md; run node scripts/sync-agents.mjs`);
      stale++;
    } else {
      writeFileSync(path, want);
      console.log(`wrote agents/${pair.to}.md`);
    }
  }
  if (check && stale) process.exit(1);
  if (check) console.log("session-tier agents match their sources.");
}
