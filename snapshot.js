/**
 * OTOS SNAPSHOT EXPORT v1.0
 * Produces a portable snapshot to artifacts/otos_snapshot.json
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

function plainTextRichText(rt) {
  if (!rt || !Array.isArray(rt)) return "";
  return rt.map((t) => t.plain_text || "").join("").trim();
}

function getTitle(props) {
  for (const [k, v] of Object.entries(props || {})) {
    if (v && v.type === "title") {
      return (v.title || []).map((t) => t.plain_text || "").join("").trim();
    }
  }
  return "";
}

function pageToLite(page) {
  const props = page.properties || {};
  return {
    id: page.id,
    created_time: page.created_time,
    last_edited_time: page.last_edited_time,
    name: getTitle(props),
    content: plainTextRichText(props.Content?.rich_text),
    kind: props.Kind?.select?.name || null,
    source: props.Source?.select?.name || null,
    status: props.Status?.select?.name || null,
    embedding_status: props.Embedding_Status?.select?.name || null,
    tags: (props.Tags?.multi_select || []).map((o) => o.name),
  };
}

async function main() {
  const NOTION_TOKEN = requireEnv("NOTION_TOKEN");
  const BRAIN_DB = requireEnv("BRAIN_DB");
  const CORE_DB = requireEnv("CORE_DB");
  const OPS_DB = requireEnv("OPS_DB");

  const notion = new Client({ auth: NOTION_TOKEN });

  const artifactsDir = path.join(process.cwd(), "artifacts");
  ensureDir(artifactsDir);

  const rulesPages = await queryAll(notion, OPS_DB, {
    property: "Kind",
    select: { equals: "Rule" },
  }).catch(() => []);
  const corePages = await queryAll(notion, CORE_DB).catch(() => []);
  const brainPages = await queryAll(notion, BRAIN_DB).catch(() => []);

  const snapshot = {
    version: "otos_snapshot_v1",
    exported_at_utc: new Date().toISOString(),
    dbs: {
      brain: "***" + BRAIN_DB.slice(-6),
      core: "***" + CORE_DB.slice(-6),
      ops: "***" + OPS_DB.slice(-6),
    },
    counts: {
      rules: rulesPages.length,
      core: corePages.length,
      brain: brainPages.length,
    },
    rules: rulesPages.map(pageToLite),
    core: corePages.map(pageToLite),
    brain_index: brainPages.slice(0, 200).map(pageToLite), // capped for artifact size safety
  };

  fs.writeFileSync(
    path.join(artifactsDir, "otos_snapshot.json"),
    JSON.stringify(snapshot, null, 2),
    "utf-8"
  );

  console.log("✅ SNAPSHOT WRITTEN: artifacts/otos_snapshot.json");
  console.log(`Rules: ${snapshot.counts.rules} | Core: ${snapshot.counts.core} | Brain: ${snapshot.counts.brain}`);
}

main().catch((err) => {
  console.error("❌ SNAPSHOT FAILED:", err?.message || err);
  process.exit(1);
});
