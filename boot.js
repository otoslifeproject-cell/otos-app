/**
 * OTOS BOOT v1.0 — Stability First
 * Boot order (non-negotiable):
 *   1) Load Rules (OPS_DB)
 *   2) Validate Memory Stores (BRAIN_DB, CORE_DB)
 *   3) Ensure minimum schema exists (non-destructive add-only)
 *   4) Emit boot report to artifacts/
 *
 * Required env:
 *   NOTION_TOKEN
 *   BRAIN_DB
 *   CORE_DB
 *   OPS_DB
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("@notionhq/client");

function requireEnv(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) throw new Error(`Missing env var: ${name}`);
  return String(v).trim();
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

async function queryAll(notion, database_id, filter) {
  let results = [];
  let cursor = undefined;
  while (true) {
    const resp = await notion.databases.query({
      database_id,
      start_cursor: cursor,
      page_size: 100,
      ...(filter ? { filter } : {}),
    });
    results = results.concat(resp.results);
    if (!resp.has_more) break;
    cursor = resp.next_cursor;
  }
  return results;
}

async function ensureSchemaAddOnly(notion, database_id, requiredProps) {
  const db = await notion.databases.retrieve({ database_id });
  const existing = db.properties || {};
  const missing = Object.keys(requiredProps).filter((k) => !existing[k]);

  if (missing.length === 0) {
    return { updated: false, missing: [] };
  }

  const patch = {};
  for (const k of missing) patch[k] = requiredProps[k];

  await notion.databases.update({
    database_id,
    properties: patch,
  });

  return { updated: true, missing };
}

async function main() {
  const NOTION_TOKEN = requireEnv("NOTION_TOKEN");
  const BRAIN_DB = requireEnv("BRAIN_DB");
  const CORE_DB = requireEnv("CORE_DB");
  const OPS_DB = requireEnv("OPS_DB");

  const notion = new Client({ auth: NOTION_TOKEN });

  const artifactsDir = path.join(process.cwd(), "artifacts");
  ensureDir(artifactsDir);

  const bootReport = {
    timestamp_utc: new Date().toISOString(),
    mode: "STABILITY_FIRST",
    dbs: {
      brain: "***" + BRAIN_DB.slice(-6),
      core: "***" + CORE_DB.slice(-6),
      ops: "***" + OPS_DB.slice(-6),
    },
    schema_updates: {},
    counts: {},
    rules_loaded: 0,
  };

  // ---------------------------
  // 1) OPS_DB — Rules store (minimum)
  // ---------------------------
  const opsSchema = {
    "Kind": { select: { options: [
      { name: "Rule", color: "red" },
      { name: "Config", color: "blue" },
      { name: "Log", color: "gray" },
    ]}},
    "Body": { rich_text: {} },
    "Status": { select: { options: [
      { name: "Active", color: "green" },
      { name: "Paused", color: "yellow" },
      { name: "Deprecated", color: "gray" },
    ]}},
    "Updated_At": { date: {} },
  };

  const opsRes = await ensureSchemaAddOnly(notion, OPS_DB, opsSchema);
  bootReport.schema_updates.ops = opsRes;

  // Load Rules (non-fatal if none exist yet)
  const rules = await queryAll(notion, OPS_DB, {
    property: "Kind",
    select: { equals: "Rule" },
  }).catch(() => []);
  bootReport.rules_loaded = rules.length;

  // ---------------------------
  // 2) CORE_DB — Core truth anchors (minimum)
  // ---------------------------
  const coreSchema = {
    "Kind": { select: { options: [
      { name: "Golden", color: "yellow" },
      { name: "Definition", color: "blue" },
      { name: "Policy", color: "red" },
      { name: "Identity", color: "green" },
    ]}},
    "Body": { rich_text: {} },
    "Tags": { multi_select: { options: [] } },
    "Updated_At": { date: {} },
  };

  const coreRes = await ensureSchemaAddOnly(notion, CORE_DB, coreSchema);
  bootReport.schema_updates.core = coreRes;

  // ---------------------------
  // 3) BRAIN_DB — Canonical memory (minimum)
  // ---------------------------
  const brainSchema = {
    "Content": { rich_text: {} },
    "Source": { select: { options: [
      { name: "Feeder", color: "blue" },
      { name: "Conversation", color: "purple" },
      { name: "Document", color: "yellow" },
      { name: "Manual", color: "gray" },
    ]}},
    "Tags": { multi_select: { options: [] } },
    "Status": { select: { options: [
      { name: "New", color: "gray" },
      { name: "Processed", color: "green" },
      { name: "Archived", color: "red" },
    ]}},
    "Embedding_Status": { select: { options: [
      { name: "Pending", color: "yellow" },
      { name: "Embedded", color: "green" },
      { name: "Error", color: "red" },
    ]}},
    "Embedding_JSON": { rich_text: {} },
    "Embedding_Updated_At": { date: {} },
    "UUID": { rich_text: {} },
    "Updated_At": { date: {} },
  };

  const brainRes = await ensureSchemaAddOnly(notion, BRAIN_DB, brainSchema);
  bootReport.schema_updates.brain = brainRes;

  // Count rows for visibility (read-only)
  const brainPages = await queryAll(notion, BRAIN_DB).catch(() => []);
  const corePages = await queryAll(notion, CORE_DB).catch(() => []);
  const opsPages = await queryAll(notion, OPS_DB).catch(() => []);
  bootReport.counts = {
    brain_rows_total: brainPages.length,
    core_rows_total: corePages.length,
    ops_rows_total: opsPages.length,
  };

  // Emit boot report
  fs.writeFileSync(
    path.join(artifactsDir, "boot_report.json"),
    JSON.stringify(bootReport, null, 2),
    "utf-8"
  );

  console.log("✅ OTOS BOOT OK");
  console.log(`Rules loaded: ${bootReport.rules_loaded}`);
  console.log(`Brain rows: ${bootReport.counts.brain_rows_total}`);
  console.log(`Core rows: ${bootReport.counts.core_rows_total}`);
  console.log(`Ops rows: ${bootReport.counts.ops_rows_total}`);
}

main().catch((err) => {
  console.error("❌ BOOT FAILED:", err?.message || err);
  process.exit(1);
});
