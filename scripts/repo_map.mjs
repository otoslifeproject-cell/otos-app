#!/usr/bin/env node
/**
 * OTOS Repo Map Generator (non-destructive)
 * - Scans repo tree (workflows + scripts + UI)
 * - Writes docs/SYSTEM_MAP.md + docs/system_map.json
 * - Does NOT change any existing files
 *
 * Run:
 *   node scripts/repo_map.mjs
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

const ROOT = process.cwd();
const OUT_MD = path.join(ROOT, "docs", "SYSTEM_MAP.md");
const OUT_JSON = path.join(ROOT, "docs", "system_map.json");

const IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  "dist",
  "build",
  ".cache",
]);

function exists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

function sha1(s) {
  return crypto.createHash("sha1").update(s).digest("hex").slice(0, 10);
}

function walk(dir, acc = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const full = path.join(dir, it.name);
    const rel = path.relative(ROOT, full);
    if (it.isDirectory()) {
      if (IGNORE_DIRS.has(it.name)) continue;
      walk(full, acc);
    } else {
      acc.push(rel);
    }
  }
  return acc;
}

function readTextSafe(rel) {
  const full = path.join(ROOT, rel);
  try {
    return fs.readFileSync(full, "utf8");
  } catch {
    return "";
  }
}

/**
 * Lightweight YAML “peek” for workflows:
 * We only need name + triggers + top-level jobs keys.
 * No dependency, no full YAML parsing.
 */
function parseWorkflow(rel) {
  const txt = readTextSafe(rel);
  const lines = txt.split(/\r?\n/);

  const nameLine = lines.find(l => /^\s*name\s*:\s*/.test(l)) || "";
  const name = nameLine.replace(/^\s*name\s*:\s*/,"").trim() || path.basename(rel);

  // Triggers: find `on:` block start, then capture next ~30 lines (good enough for a map)
  let onBlock = [];
  const onIdx = lines.findIndex(l => /^\s*on\s*:\s*/.test(l));
  if (onIdx >= 0) {
    onBlock = lines.slice(onIdx, onIdx + 35)
      .map(l => l.trimEnd())
      .filter(l => l.trim() !== "");
  }

  // Jobs: list top-level job ids (best-effort)
  const jobsIdx = lines.findIndex(l => /^\s*jobs\s*:\s*/.test(l));
  let jobs = [];
  if (jobsIdx >= 0) {
    for (let i = jobsIdx + 1; i < Math.min(lines.length, jobsIdx + 80); i++) {
      const l = lines[i];
      // job id lines look like: "  build:" or "  audit:"
      if (/^\s{2}[A-Za-z0-9_\-]+\s*:\s*$/.test(l)) {
        jobs.push(l.trim().replace(/:\s*$/,""));
      }
      // stop if we hit another top-level key
      if (/^[A-Za-z0-9_\-]+\s*:\s*$/.test(l) && !/^\s/.test(l)) break;
    }
  }

  return {
    path: rel,
    name,
    triggers_preview: onBlock.slice(0, 35),
    jobs,
    fingerprint: sha1(txt),
  };
}

function classify(rel) {
  const r = rel.replace(/\\/g, "/");
  if (r.startsWith(".github/workflows/")) return "workflow";
  if (r.startsWith("docs/")) return "docs_ui";
  if (r.startsWith("ui/")) return "ui_engine";
  if (r.startsWith("scripts/notion/") || r.includes("notion")) return "notion";
  if (r.startsWith("scripts/andy/") || r.includes("andy")) return "andy";
  if (r.startsWith("scripts/feeder/") || r.includes("feeder")) return "feeder";
  if (r.startsWith("scripts/transcription/") || r.includes("whisper") || r.includes("vtt")) return "transcription";
  if (r.startsWith("scripts/youtube/") || r.includes("youtube")) return "youtube";
  if (r.startsWith("scripts/audit/") || r.includes("audit") || r.includes("nhs_")) return "audit";
  if (r.startsWith("scripts/system/") || r.includes("heartbeat") || r.includes("ready_check")) return "system";
  if (r.startsWith("schemas/") || r.includes("schema")) return "schema";
  if (r.includes("guard") || r.includes("lock")) return "governance";
  return "other";
}

function ensureDocsDir() {
  const docsDir = path.join(ROOT, "docs");
  if (!exists(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
}

function writeOut(map) {
  ensureDocsDir();

  const now = new Date().toISOString();
  const lines = [];

  lines.push(`# OTOS System Map`);
  lines.push(``);
  lines.push(`Generated: ${now}`);
  lines.push(`Repo root: \`${ROOT}\``);
  lines.push(``);
  lines.push(`## What this proves`);
  lines.push(`- No rewrites needed: the system already has workflows, guards, ingestion, UI engine, Notion wiring.`);
  lines.push(`- Next work is *wiring + surfacing* (registry → UI modules, Actions → One Action deck).`);
  lines.push(``);

  // Entry points we care about
  lines.push(`## Key entrypoints`);
  const entryCandidates = [
    "docs/index.html",
    "docs/registry.json",
    "docs/styles.css",
    "ui/index.html",
    "server.js",
    "scripts/boot/run.js",
    "scripts/system/live_enable.js",
    "scripts/system/ready_check.js",
  ].filter(p => map.files.includes(p));

  if (entryCandidates.length) {
    for (const e of entryCandidates) lines.push(`- \`${e}\``);
  } else {
    lines.push(`- (No canonical entrypoints detected by filename — this is fine, we will surface them next)`);
  }
  lines.push(``);

  // Workflows
  lines.push(`## GitHub Workflows (.github/workflows)`);
  if (map.workflows.len
