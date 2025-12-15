// FILE: scripts/ui/attach_live.js
// FULL REPLACEMENT — COPY/PASTE EXACTLY
// Fix: your GitHub runner does NOT have your Desktop folder "Notion_Injection".
// So this script now supports TWO modes:
//
// Mode A (preferred): if repo contains /Notion_Injection or /ui -> copy that.
// Mode B (fallback): if no UI folder exists, build runtime/ui from the repo-root UI files
// (index.html, cockpit.html, feeder.html, signals.html, presence.html, nav*.html, app.css, *.js, etc.)
//
// Hard-guarded. No guessing beyond "copy what exists".

import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const LIVE_DIR = path.join(ROOT, "runtime", "ui");

const FOLDER_CANDIDATES = ["Notion_Injection", "ui", "UI", "notion_injection"];

const ROOT_FILE_ALLOW = new Set([
  // Core pages (copy if present)
  "index.html", "cockpit.html", "feeder.html", "signals.html", "presence.html",
  "focus.html", "state.html", "velocity.html", "nav.html", "nav-loader.html",

  // Styles
  "app.css",

  // Boot / wiring
  "boot.js", "client.js", "server.js",
  "nav-loader.js", "ui-memory-sync.js",

  // Other known UI helpers from your tree (copy if present)
  "feeder.js", "embeddings.js", "snapshot.js", "schema-check.js",
  "notion-client.js", "notion-sync.js", "notion.config.js",
  "pages.yml", "feeder.yml"
]);

function existsDir(p) {
  try { return fs.existsSync(p) && fs.statSync(p).isDirectory(); } catch { return false; }
}
function existsFile(p) {
  try { return fs.existsSync(p) && fs.statSync(p).isFile(); } catch { return false; }
}

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const s = path.join(src, item);
    const d = path.join(dest, item);
    const st = fs.statSync(s);
    if (st.isDirectory()) copyRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function findUIFolder() {
  for (const dir of FOLDER_CANDIDATES) {
    const full = path.join(ROOT, dir);
    if (existsDir(full)) return full;
  }
  return null;
}

console.log("🧷 UI LIVE ATTACH starting");

fs.mkdirSync(LIVE_DIR, { recursive: true });

// MODE A: Folder exists in repo
const uiFolder = findUIFolder();
if (uiFolder) {
  copyRecursive(uiFolder, LIVE_DIR);
  console.log("✅ UI folder detected:", path.basename(uiFolder));
  console.log("✅ UI copied into runtime/ui");
  console.log("🟢 UI LIVE ATTACH COMPLETE");
  process.exit(0);
}

// MODE B: No folder — build from repo root UI files
console.log("ℹ️ No UI folder found in repo. Falling back to repo-root UI files…");

const rootItems = fs.readdirSync(ROOT);
let copied = 0;

// 1) Copy known allow-list files if present
for (const name of ROOT_FILE_ALLOW) {
  const src = path.join(ROOT, name);
  if (existsFile(src)) {
    copyFile(src, path.join(LIVE_DIR, name));
    copied++;
  }
}

// 2) Also copy ANY root *.html, *.css, *.js that exist (safe UI bundle), excluding obvious non-UI
const EXCLUDE_PREFIX = new Set(["package", "README", "LOCK", "ANALYSIS", "FEEDER"]);
const EXCLUDE_NAMES = new Set([
  "package.json",
  "package-lock.json",
  ".env",
  ".env.example"
]);

for (const name of rootItems) {
  if (EXCLUDE_NAMES.has(name)) continue;
  if ([...EXCLUDE_PREFIX].some(p => name.startsWith(p))) continue;

  const src = path.join(ROOT, name);
  if (!existsFile(src)) continue;

  const ext = path.extname(name).toLowerCase();
  if (ext === ".html" || ext === ".css" || ext === ".js" || ext === ".yml" || ext === ".yaml") {
    // Don’t overwrite if already copied via allow-list
    const dest = path.join(LIVE_DIR, name);
    if (!existsFile(dest)) {
      copyFile(src, dest);
      copied++;
    }
  }
}

if (copied === 0) {
  console.error("❌ UI LIVE ATTACH FAILED");
  console.error("No UI folder AND no root UI files were found to copy.");
  console.error("Fix required: commit your Notion_Injection folder into the repo (preferred) OR ensure index.html exists at repo root.");
  process.exit(1);
}

console.log(`✅ Built runtime/ui from repo root (${copied} files copied)`);
console.log("🟢 UI LIVE ATTACH COMPLETE");
process.exit(0);
