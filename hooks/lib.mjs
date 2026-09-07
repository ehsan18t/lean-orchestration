// Shared helpers for the lean-orchestration hooks. No dependencies, never throws
// out of an exported function: every hook must degrade to "inject nothing" rather
// than block a session.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { homedir } from "node:os";

const OFF = new Set(["off", "false", "0", "no"]);
const ON = new Set(["on", "true", "1", "yes"]);

// Hook input arrives as one JSON document on stdin (session_id, transcript_path,
// cwd, source, prompt, ...). Missing or malformed input degrades to {}.
export function readStdinJson() {
  try {
    const raw = readFileSync(0, "utf8");
    return raw.trim() ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Setting lookup, highest precedence first:
//   1. LEAN_ORCHESTRATION_<NAME>      escape hatch, works however the skill was installed
//   2. CLAUDE_PLUGIN_OPTION_<NAME>    set from the plugin's userConfig prompt or settings.json
// The exact casing of the injected option var is not contractual, so match loosely.
export function option(name) {
  const direct = process.env[`LEAN_ORCHESTRATION_${name}`];
  if (direct !== undefined) return direct;
  const re = new RegExp(`^CLAUDE_PLUGIN_OPTION_${name}$`, "i");
  for (const [k, v] of Object.entries(process.env)) {
    if (re.test(k)) return v;
  }
  return undefined;
}

export function isOff(v) {
  return v !== undefined && OFF.has(String(v).trim().toLowerCase());
}

export function isOn(v) {
  return v !== undefined && ON.has(String(v).trim().toLowerCase());
}

// Anything other than an explicit "off" leaves autostart on.
export function autostartEnabled() {
  return !isOff(option("AUTOSTART"));
}

export function projectDir(input) {
  return (input && input.cwd) || process.env.CLAUDE_PROJECT_DIR || process.cwd();
}

// Claude's own per-project directory (~/.claude/projects/<slug>/). Derived from the
// transcript path the hook receives, so the slug is never recomputed here. The
// recomputation below is only a fallback for a hook invoked without stdin.
export function claudeProjectDir(input) {
  const transcript = input && input.transcript_path;
  if (transcript) {
    let dir = dirname(transcript);
    // A subagent transcript sits one level down, in a directory named by session id.
    if (/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(basename(dir))) dir = dirname(dir);
    return dir;
  }
  const config = process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude");
  const slug = projectDir(input).replace(/[^A-Za-z0-9]/g, "-");
  return join(config, "projects", slug);
}

// Where ledgers live, highest precedence first:
//   1. LEAN_ORCHESTRATION_LEDGER_DIR      an explicit directory
//   2. ledger_in_project = on             <project>/.lean-orchestration/
//   3. default                            <claude project dir>/lean-orchestration/
export function resolveLedgerDir(input) {
  const explicit = process.env.LEAN_ORCHESTRATION_LEDGER_DIR;
  if (explicit && explicit.trim()) return explicit.trim();
  if (isOn(option("LEDGER_IN_PROJECT"))) return join(projectDir(input), ".lean-orchestration");
  return join(claudeProjectDir(input), "lean-orchestration");
}

const PROJECT_FILES = new Set(["wont-fix.md", "decisions.md", "glossary.md"]);

function parseFrontmatter(text) {
  const out = {};
  if (!text.startsWith("---")) return out;
  const end = text.indexOf("\n---", 3);
  if (end < 0) return out;
  for (const line of text.slice(3, end).split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) out[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
  }
  return out;
}

// One line per ledger: unfinished ones first, then the most recently updated
// finished ones, `cap` lines in total. A ledger is a file whose frontmatter carries a
// `task:` key; the project-wide files (wont-fix.md, decisions.md, glossary.md) and
// anything else without one are never listed. Older ledgers stay on disk; the count
// of unlisted ones is reported so the model knows to list the directory when a
// follow-up names old work.
export function ledgerIndex(dir, cap = 10) {
  let files;
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".md") && !PROJECT_FILES.has(f.toLowerCase()));
  } catch {
    return { lines: [], unlisted: 0, total: 0 };
  }
  const items = [];
  for (const file of files) {
    const path = join(dir, file);
    let head = "";
    let mtime = 0;
    try {
      head = readFileSync(path, "utf8").slice(0, 2000);
      mtime = statSync(path).mtimeMs;
    } catch {
      continue;
    }
    const fm = parseFrontmatter(head);
    if (!fm.task) continue;
    items.push({
      path,
      title: fm.title || file.replace(/\.md$/, ""),
      status: (fm.status || "open").toLowerCase(),
      route: fm.route || "",
      updated: fm.updated || "",
      mtime,
    });
  }
  const rank = (s) => (s === "done" || s === "abandoned" ? 1 : 0);
  items.sort((a, b) => rank(a.status) - rank(b.status) || b.updated.localeCompare(a.updated) || b.mtime - a.mtime);
  const shown = items.slice(0, cap);
  const lines = shown.map((i) => {
    const meta = [i.route, i.updated ? `updated ${i.updated}` : ""].filter(Boolean).join(", ");
    return `- [${i.status}] ${i.title}${meta ? ` (${meta})` : ""}: ${i.path}`;
  });
  return { lines, unlisted: items.length - shown.length, total: items.length };
}

export function ledgerBlock(dir) {
  const index = ledgerIndex(dir);
  const header =
    index.total === 0
      ? "Ledgers: none yet."
      : `Ledgers (${index.total} on disk${index.unlisted ? `, ${index.unlisted} older not listed` : ""}):`;
  return [`Ledger directory: ${dir}`, header, ...index.lines].join("\n");
}

export function emit(payload) {
  process.stdout.write(JSON.stringify(payload));
}
