/**
 * FILE: scripts/agent-daemon/run.js
 * PURPOSE: Background daemon (GitHub Actions) that:
 *  - Loads Notion config from secrets (or notion.config.json fallback)
 *  - Writes a heartbeat record to HLR (Hard Log Register)
 *  - Updates docs/status.json (visible proof in Cockpit)
 *
 * REQUIREMENTS (GitHub Secrets):
 *  - NOTION_TOKEN = Notion integration token
 *  - OTOS_NOTION_CONFIG = JSON string containing DB IDs
 *
 * INBOX:
 *  - Put files into /inbox to be picked up by future phases.
 */

import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const STATUS_PATH = path.join(ROOT, "docs", "status.json");
const INBOX_DIR = path.join(ROOT, "inbox");
const FALLBACK_CONFIG_PATH = path.join(ROOT, "notion.config.json");

function nowISO() {
  return new Date().toISOString();
}

function safeJsonParse(str, fallback = null) {
  try { return JSON.parse(str); } catch { return fallback; }
}

function writeStatus(status) {
  fs.mkdirSync(path.dirname(STATUS_PATH), { recursive: true });
  fs.writeFileSync(STATUS_PATH, JSON.stringify(status, null, 2), "utf8");
}

function listInboxFiles() {
  if (!fs.existsSync(INBOX_DIR)) return [];
  const items = fs.readdirSync(INBOX_DIR, { withFileTypes: true });
  return items
    .filter(d => d.isFile())
    .map(d => ({
      name: d.name,
      fullPath: path.join(INBOX_DIR, d.name),
      bytes: fs.statSync(path.join(INBOX_DIR, d.name)).size
    }));
}

/**
 * Minimal Notion client (no extra deps required)
 */
async function notionRequest(endpoint, method, body, notionToken) {
  const res = await fetch(`https://api.notion.com/v1/${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${notionToken}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* ignore */ }

  if (!res.ok) {
    const msg = json?.message || text || `HTTP ${res.status}`;
    throw new Error(`Notion API error (${endpoint}): ${msg}`);
  }
  return json;
}

async function writeHLRHeartbeat({ notionToken, hlrDbId, status }) {
  // Creates a page in the HLR DB with a minimal schema expectation.
  // If your DB uses different property names, we’ll align them next.
  const props = {
    "Name": { title: [{ text: { content: `Agent Heartbeat ${status.run_id}` } }] },
    "Type": { rich_text: [{ text: { content: "HEARTBEAT" } }] },
    "Run ID": { rich_text: [{ text: { content: status.run_id } }] },
    "When": { date: { start: status.last_run_utc } },
    "Processed": { number: status.processed_count || 0 },
    "Queue": { number: status.queue_count || 0 },
    "Result": { select: { name: status.ok ? "OK" : "ERROR" } },
    "Notes": { rich_text: [{ text: { content: status.note || "" } }] }
  };

  await notionRequest(
    "pages",
    "POST",
    { parent: { database_id: hlrDbId }, properties: props },
    notionToken
  );
}

async function main() {
  const run_id = `RUN-${Date.now()}`;
  const started = nowISO();

  const notionToken = process.env.NOTION_TOKEN || "";
  const configFromSecret = process.env.OTOS_NOTION_CONFIG || "";
  const configSecretObj = safeJsonParse(configFromSecret, null);

  let configFileObj = null;
  if (fs.existsSync(FALLBACK_CONFIG_PATH)) {
    configFileObj = safeJsonParse(fs.readFileSync(FALLBACK_CONFIG_PATH, "utf8"), null);
  }

  const config = configSecretObj || configFileObj;

  const inboxFiles = listInboxFiles();
  const status = {
    ok: true,
    run_id,
    last_run_utc: started,
    processed_count: 0,
    queue_count: inboxFiles.length,
    inbox_files: inboxFiles.map(f => ({ name: f.name, bytes: f.bytes })),
    note: "Heartbeat only (Phase 1). Inbox processing will be enabled next.",
    errors: []
  };

  try {
    // Hard fail if Notion not configured, because you want NO pretending.
    if (!notionToken) throw new Error("NOTION_TOKEN missing (GitHub Secrets).");
    if (!config) throw new Error("OTOS_NOTION_CONFIG secret missing (or notion.config.json not found).");
    if (!config.hlr_db_id) throw new Error("hlr_db_id missing from Notion config.");

    // Write heartbeat to HLR so you can SEE it in Notion as proof.
    await writeHLRHeartbeat({
      notionToken,
      hlrDbId: config.hlr_db_id,
      status
    });

    // Mark as proof-complete
    status.processed_count = 1;
    status.note = "Heartbeat written to Notion HLR + status.json updated (proof ON).";
  } catch (err) {
    status.ok = false;
    status.errors.push(String(err?.message || err));
    status.note = "Agent failed. Fix secrets/config, then rerun workflow_dispatch.";
  }

  writeStatus(status);

  if (!status.ok) {
    console.error(status.errors.join("\n"));
    process.exit(1);
  }

  console.log("Agent OK:", status.run_id);
}

main();
