#!/usr/bin/env node
// Measures how long the messages the user reads are, from the session transcripts
// Claude Code keeps under ~/.claude/projects/<project>/<session>.jsonl, so the output
// rules can be judged on evidence instead of impression.
//
// Usage:
//   node scripts/output-length.mjs [--since YYYY-MM-DD] [--project <substring>] [--min-messages N]
//
// Per session: date, project, assistant text messages, median and p90 words per message
// (code blocks and table rows excluded), and whether the output rules were injected.
// Then a summary split by rules present / absent. No dependencies. Reads only.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { OUTPUT_LABEL, injectedReminder } from "../hooks/lib.mjs";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};
const SINCE = opt("--since", "1970-01-01");
const PROJECT = opt("--project", "");
const MIN = Number(opt("--min-messages", "3"));

const root = join(process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude"), "projects");
// A session has the rules only when the per-prompt hook injected a reminder carrying its
// output label. hooks/lib.mjs recognizes the reminder, with or without a version, and
// never counts a tool result, diff or message that merely quotes it.
const injectsRules = (line) => (injectedReminder(line) ?? "").includes(OUTPUT_LABEL);

function words(text) {
  const noCode = text.replace(/```[\s\S]*?```/g, " ");
  const noTables = noCode
    .split("\n")
    .filter((l) => !/^\s*\|/.test(l))
    .join("\n");
  return noTables.split(/\s+/).filter(Boolean).length;
}

function quantile(sorted, q) {
  if (!sorted.length) return 0;
  const i = Math.min(sorted.length - 1, Math.floor(q * sorted.length));
  return sorted[i];
}

function analyze(path) {
  let lines;
  try {
    lines = readFileSync(path, "utf8").split("\n").filter(Boolean);
  } catch {
    return null;
  }
  const s = { counts: [], rules: false, first: null };
  for (const raw of lines) {
    let line;
    try {
      line = JSON.parse(raw);
    } catch {
      continue;
    }
    if (injectsRules(line)) s.rules = true;
    if (!s.first && line.timestamp) s.first = line.timestamp;
    if (line.type !== "assistant") continue;
    const content = line.message && line.message.content;
    if (!Array.isArray(content)) continue;
    const text = content
      .filter((b) => b && b.type === "text" && typeof b.text === "string")
      .map((b) => b.text)
      .join("\n")
      .trim();
    if (!text) continue;
    s.counts.push(words(text));
  }
  return s;
}

const rows = [];
let projects;
try {
  projects = readdirSync(root);
} catch {
  console.error(`No projects directory at ${root}`);
  process.exit(1);
}
for (const project of projects) {
  if (PROJECT && !project.includes(PROJECT)) continue;
  const dir = join(root, project);
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    continue;
  }
  for (const f of entries) {
    if (!f.endsWith(".jsonl")) continue;
    const path = join(dir, f);
    let st;
    try {
      st = statSync(path);
    } catch {
      continue;
    }
    if (!st.isFile()) continue;
    const s = analyze(path);
    if (!s || !s.first) continue;
    const date = s.first.slice(0, 10);
    if (date < SINCE || s.counts.length < MIN) continue;
    const sorted = [...s.counts].sort((a, b) => a - b);
    rows.push({ date, project: project.slice(-28), session: f.slice(0, 8), n: s.counts.length, median: quantile(sorted, 0.5), p90: quantile(sorted, 0.9), rules: s.rules, all: s.counts });
  }
}

rows.sort((a, b) => a.date.localeCompare(b.date));
const pad = (v, n) => String(v).padEnd(n);
console.log(pad("date", 11) + pad("project", 30) + pad("session", 9) + pad("msgs", 6) + pad("median", 8) + pad("p90", 6) + "rules");
for (const r of rows) console.log(pad(r.date, 11) + pad(r.project, 30) + pad(r.session, 9) + pad(r.n, 6) + pad(r.median, 8) + pad(r.p90, 6) + (r.rules ? "yes" : "no"));

function summary(label, set) {
  const all = set.flatMap((r) => r.all).sort((a, b) => a - b);
  console.log(`${label}: ${set.length} sessions, ${all.length} messages, median ${quantile(all, 0.5)} words, p90 ${quantile(all, 0.9)}`);
}
console.log("");
summary("rules present", rows.filter((r) => r.rules));
summary("rules absent ", rows.filter((r) => !r.rules));
