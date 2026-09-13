#!/usr/bin/env node
// Measures whether lean-orchestration actually fires, from the session transcripts
// Claude Code keeps under ~/.claude/projects/<project>/<session>.jsonl.
//
// Body injection made the old metric ("was the Skill tool called for lean-orchestration")
// meaningless, because nothing is loaded any more. The observable signal now is the Route
// line the skill requires on every non-trivial request, or its "prior route holds" form.
//
// Usage:
//   node scripts/route-rate.mjs [--since YYYY-MM-DD] [--project <substring>] [--min-prompts N] [--all]
//
// Columns per session: date, project, user prompts, Route lines, whether the per-prompt
// reminder was present (so the new hook can be told apart from the old one), turn of the
// first Route line, and Skill-tool loads of lean-orchestration (the old metric).
// No dependencies. Reads only; never writes.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { injectedReminder } from "../hooks/lib.mjs";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};
const SINCE = opt("--since", "1970-01-01");
const PROJECT = opt("--project", "");
const MIN_PROMPTS = Number(opt("--min-prompts", "2"));
const SHOW_ALL = args.includes("--all");

const root = join(process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude"), "projects");

// "Route:" within the first few characters of a line: covers `Route:`, **Route:**, - Route:, > Route:
const ROUTE = /(^|\n)[^\n]{0,6}Route:/;
const HOLDS = /prior route (still )?(holds|covers)/i;
const STRIP_REMINDERS = /<system-reminder>[\s\S]*?<\/system-reminder>/g;

function textOf(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((b) => b && b.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("\n");
}

function isRealPrompt(line) {
  if (line.isMeta) return false;
  const raw = textOf(line.message && line.message.content);
  if (!raw) return false;
  const t = raw.replace(STRIP_REMINDERS, "").trim();
  if (!t) return false;
  if (/^<(command-name|local-command|command-message)/.test(t)) return false;
  return true;
}

function analyze(path) {
  let lines;
  try {
    lines = readFileSync(path, "utf8").split("\n").filter(Boolean);
  } catch {
    return null;
  }
  const s = { prompts: 0, routes: 0, holds: 0, reminder: false, firstRouteTurn: null, skillLoads: 0, first: null, cwd: "" };
  let turn = 0;
  for (const rawLine of lines) {
    let line;
    try {
      line = JSON.parse(rawLine);
    } catch {
      continue;
    }
    // Hook output is stored as its own attachment line, not inside the user message; a quote
    // of the reminder in a tool result or message is not one (hooks/lib.mjs).
    if (injectedReminder(line)) s.reminder = true;
    if (!s.first && line.timestamp) s.first = line.timestamp;
    if (!s.cwd && line.cwd) s.cwd = line.cwd;
    const content = line.message && line.message.content;
    if (line.type === "user") {
      if (isRealPrompt(line)) {
        s.prompts += 1;
        turn += 1;
      }
    } else if (line.type === "assistant") {
      const text = textOf(content);
      if (ROUTE.test(text)) {
        s.routes += 1;
        if (s.firstRouteTurn === null) s.firstRouteTurn = turn;
      } else if (HOLDS.test(text)) {
        s.holds += 1;
      }
      if (Array.isArray(content)) {
        for (const b of content) {
          if (b && b.type === "tool_use" && b.name === "Skill" && /lean-orchestration/.test(JSON.stringify(b.input || {}))) s.skillLoads += 1;
        }
      }
    }
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
    if (date < SINCE) continue;
    if (!SHOW_ALL && s.prompts < MIN_PROMPTS) continue;
    rows.push({ date, project: project.slice(-28), session: f.slice(0, 8), ...s });
  }
}

rows.sort((a, b) => a.date.localeCompare(b.date));
const pad = (v, n) => String(v).padEnd(n);
console.log(pad("date", 11) + pad("project", 30) + pad("session", 9) + pad("prompts", 8) + pad("routes", 7) + pad("holds", 6) + pad("reminder", 9) + pad("1st@", 5) + "skill-loads");
for (const r of rows) {
  console.log(
    pad(r.date, 11) +
      pad(r.project, 30) +
      pad(r.session, 9) +
      pad(r.prompts, 8) +
      pad(r.routes, 7) +
      pad(r.holds, 6) +
      pad(r.reminder ? "yes" : "no", 9) +
      pad(r.firstRouteTurn === null ? "-" : r.firstRouteTurn, 5) +
      r.skillLoads,
  );
}
const n = rows.length;
const routed = rows.filter((r) => r.routes + r.holds > 0).length;
const withReminder = rows.filter((r) => r.reminder);
const routedWithReminder = withReminder.filter((r) => r.routes + r.holds > 0).length;
const pct = (a, b) => (b ? `${Math.round((100 * a) / b)}%` : "n/a");
console.log("");
console.log(`sessions with >= ${MIN_PROMPTS} prompts since ${SINCE}: ${n}`);
console.log(`  routed (>= 1 Route line or "prior route holds"): ${routed} (${pct(routed, n)})`);
console.log(`  with the per-prompt reminder present: ${withReminder.length}, of which routed: ${routedWithReminder} (${pct(routedWithReminder, withReminder.length)})`);
console.log(`  without the reminder: ${n - withReminder.length}, of which routed: ${routed - routedWithReminder} (${pct(routed - routedWithReminder, n - withReminder.length)})`);
