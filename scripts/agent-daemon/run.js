/**
 * OTOS Agent Daemon – Phase 1
 * PURPOSE:
 *  - Write HARD LOG heartbeat into Notion HLR DB
 *  - Update docs/status.json for Cockpit visibility
 *  - No ingestion yet (by design)
 */

import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const STATUS_FILE = path.join(ROOT, "docs", "status.json");
const CONFIG_FILE = path.join(ROOT, "notion.config.json");

function nowISO() {
  return new Date().toISOString();
}

function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    throw new Error("notion.config.json missing");
  }
  return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
}

async function notion(endpoint, method, body, token) {
  const res = await fetch(`https://api.notion.com/v1/${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(json?.message || `Notion API error ${res.status}`);
  }
  return json;
}

function writeStatus(data) {
  fs.mkdirSync(path.dirname(STATUS_FILE), { recursive: true });
  fs.writeFileSync(STATUS_FILE, JSON.stringify(data, null, 2));
}

async function writeHLR({ token, dbId, status }) {
  const props = {
    "Name": {
      "title": [{ "text": { "content": `HLR Heartbeat ${status.run_id}` } }]
    },
    "Type": {
      "rich_text": [{ "text": { "content": "HEARTBEAT" } }]
    },
    "Run ID": {
      "rich_text": [{ "text": { "content": status.run_id } }]
    },
    "Timestamp": {
      "date": { "start": status.timestamp }
    },
    "Result": {
      "select": { "name": status.ok ? "OK" : "ERROR" }
    },
    "Notes": {
      "rich_text": [{ "text": { "content": status.note } }]
    }
  };

  await notion("pages", "POST", {
    parent: { database_id: dbId },
    properties: props
  }, token);
}

async function main() {
  const run_id = `HLR-${Date.now()}`;
  const timestamp = nowISO();

  const status = {
    ok: true,
    run_id,
    timestamp,
    note: "HLR heartbeat written successfully",
    errors: []
  };

  try {
    const token = process.env.NOTION_TOKEN;
    if (!token) throw new Error("NOTION_TOKEN missing");

    const config = loadConfig();
    if (!config.hlr_db_id) throw new Error("hlr_db_id missing in config");

    await writeHLR({
      token,
      dbId: config.hlr_db_id,
      status
    });

  } catch (err) {
    status.ok = false;
    status.note = "HLR write failed";
    status.errors.push(err.message);
  }

  writeStatus(status);

  if (!status.ok) {
    console.error(status.errors);
    process.exit(1);
  }

  console.log(`HLR heartbeat complete: ${run_id}`);
}

main();
