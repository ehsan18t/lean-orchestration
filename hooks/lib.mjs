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

// --- Splitting the session-start injection ----------------------------------------
// The harness truncates a single hook's additionalContext above roughly 10 KB and the
// limit is per hook, so the payload is split into parts and each part is emitted by its
// own registered slot in hooks.json. Two counts have to agree: how many parts the payload
// wants and how many slots exist. A slot with no part emits nothing, which is the room the
// body has to grow; a part with no slot never runs at all, so buildPart clamps to the slot
// count and reports the drop rather than losing the tail in silence.
// This lives here rather than in session-start.mjs so the hook stays a plain entry point:
// a module that both runs as a hook and exports its internals needs a main-module guard,
// and that guard is a false negative on any symlinked install, which would disable the
// injection with no error at all.

export const PART_LIMIT = 8500;
// How many times hooks.json registers session-start.mjs. `node scripts/check-injection.mjs`
// fails when the two disagree. Six covers about two and a half times the current payload;
// every unused slot is one node start that exits immediately, so the count is not free.
export const SLOTS = 6;
// Room left inside every part for the header line and the opening and closing tags, which
// buildPart adds after the split. Without it a part sized to exactly the limit is emitted
// over it and truncated.
const FRAMING_RESERVE = 220;

// Cuts a line too long to fit, at spaces first and inside a word only as a last resort.
// Never returns an empty fragment and always makes progress, so a limit smaller than one
// character cannot loop.
function splitLongLine(line, cap) {
  const limit = Math.max(1, cap);
  const out = [];
  let buf = "";
  for (const word of line.split(" ")) {
    if (buf && Buffer.byteLength(buf) + Buffer.byteLength(word) + 1 > limit) {
      out.push(buf);
      buf = "";
    }
    if (Buffer.byteLength(word) > limit) {
      if (buf) out.push(buf);
      buf = "";
      let rest = word;
      while (rest && Buffer.byteLength(rest) > limit) {
        let n = 1;
        while (n < rest.length && Buffer.byteLength(rest.slice(0, n + 1)) <= limit) n++;
        // Never cut between the halves of a surrogate pair: the two halves encode
        // separately as replacement characters and the character is lost.
        if (n > 1 && n < rest.length && /[\uD800-\uDBFF]/.test(rest[n - 1])) n--;
        out.push(rest.slice(0, n));
        rest = rest.slice(n);
      }
      buf = rest;
      continue;
    }
    buf += (buf ? " " : "") + word;
  }
  if (buf) out.push(buf);
  return out;
}

// Last resort when a piece is still over the limit after the blank-line split: cut it at
// line boundaries, then inside a line. A cut inside a fenced block closes the fence and
// reopens it on the next piece, so no part carries an unterminated code block.
function hardSplit(piece, limit) {
  if (Buffer.byteLength(piece) <= limit) return [piece];
  const out = [];
  let chunk = null; // null means nothing started yet, so a leading blank line survives
  let inFence = false;
  let reopen = false;
  const cut = () => {
    if (chunk === null) return;
    out.push(inFence ? `${chunk}\n\`\`\`` : chunk);
    reopen = inFence;
    chunk = null;
  };
  const add = (line) => {
    if (chunk === null) chunk = reopen ? `\`\`\`\n${line}` : line;
    else chunk += `\n${line}`;
  };
  for (const line of piece.split("\n")) {
    const bytes = Buffer.byteLength(line);
    if (bytes + 1 > limit) {
      cut();
      for (const fragment of splitLongLine(line, limit - 8)) {
        add(fragment);
        cut();
      }
      continue;
    }
    if (chunk !== null && Buffer.byteLength(chunk) + bytes + 1 > limit) cut();
    add(line);
    if (/^```/.test(line)) inFence = !inFence;
  }
  cut();
  return out;
}

// Splits at markdown headings (never inside a fenced block), packing sections greedily
// into parts under the limit; a single oversize section is split at blank lines, and
// anything still over the limit after that goes to hardSplit.
export function splitIntoParts(text, limit) {
  const sections = [];
  let current = "";
  let inFence = false;
  for (const line of text.split("\n")) {
    if (/^```/.test(line)) inFence = !inFence;
    if (!inFence && /^#{1,3} /.test(line) && current) {
      sections.push(current);
      current = "";
    }
    current += (current ? "\n" : "") + line;
  }
  if (current) sections.push(current);
  const raw = [];
  for (const sec of sections) {
    if (Buffer.byteLength(sec) <= limit) {
      raw.push(sec);
      continue;
    }
    let chunk = "";
    for (const para of sec.split("\n\n")) {
      if (chunk && Buffer.byteLength(chunk) + Buffer.byteLength(para) + 2 > limit) {
        raw.push(chunk);
        chunk = "";
      }
      chunk += (chunk ? "\n\n" : "") + para;
    }
    if (chunk) raw.push(chunk);
  }
  const pieces = raw.flatMap((piece) => hardSplit(piece, limit));
  const parts = [];
  let part = "";
  for (const piece of pieces) {
    if (part && Buffer.byteLength(part) + Buffer.byteLength(piece) + 2 > limit) {
      parts.push(part);
      part = "";
    }
    part += (part ? "\n\n" : "") + piece;
  }
  if (part) parts.push(part);
  return parts;
}

// Returns the text one slot injects, or null when that slot has nothing to emit.
export function buildPart(payload, part, slots = SLOTS) {
  const parts = splitIntoParts(payload, PART_LIMIT - FRAMING_RESERVE);
  const k = parts.length;
  const emitted = Math.min(k, slots);
  if (!Number.isInteger(part) || part < 1 || part > emitted) return null;
  const short = k > emitted ? `, of which only ${emitted} have a slot to run in` : "";
  const head = k > 1 ? `[lean-orchestration injection, part ${part} of ${k}${short}; the parts together are one document]\n` : "";
  const open = part === 1 ? "<EXTREMELY_IMPORTANT>\n" : "";
  const last = part === emitted;
  const close = last ? "\n</EXTREMELY_IMPORTANT>" : "";
  let body = parts[part - 1];
  let overrun = "";
  if (last && k > emitted) {
    overrun =
      `\n\n[${k - emitted} of this document's ${k} parts had no slot to run in and were dropped. ` +
      "Read SKILL.md in the skill directory named in part 1 of this injection, with the Read tool, " +
      "before acting on anything in this document.]";
    // This part's tail is being dropped anyway, so trim it to make room for saying so,
    // rather than shrinking every other part to reserve space only this one needs.
    const room = PART_LIMIT - Buffer.byteLength(`${open}${head}${overrun}${close}`);
    while (Buffer.byteLength(body) > room) {
      const at = body.lastIndexOf("\n", body.length - 2);
      body = body.slice(0, Math.max(0, at));
    }
  }
  return `${open}${head}${body}${overrun}${close}`;
}
