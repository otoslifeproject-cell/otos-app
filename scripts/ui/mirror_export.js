/**
 * UI READ-ONLY MIRROR EXPORTER
 * Exports Core + Memory + Canonical Artefacts into a single read-only JSON
 * Used by Dean’s Cockpit UI (no write-back possible)
 */

import { Client } from "@notionhq/client";
import fs from "fs";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const CORE_DB = process.env.CORE_DB;
const MEMORY_DB = process.env.BRAIN_DB;
const CANONICAL_DB = process.env.CORE_DB; // canonical artefacts live in Core

async function dumpDB(dbId, mapFn) {
  const res = await notion.databases.query({ database_id: dbId });
  return res.results.map(mapFn);
}

async function run() {
  const core = await dumpDB(CORE_DB, p => ({
    id: p.id,
    title: p.properties.Title?.title?.[0]?.plain_text || "",
    immutable: p.properties.Immutable?.checkbox || false,
    sealed_at: p.properties.Sealed_At?.date?.start || null
  }));

  const memory = await dumpDB(MEMORY_DB, p => ({
    id: p.id,
    title: p.properties.Title?.title?.[0]?.plain_text || "",
    content: p.properties.Content?.rich_text?.map(t => t.plain_text).join("") || "",
    source: p.properties.Source?.select?.name || "",
    agent: p.properties.Origin_Agent?.select?.name || "",
    frozen: p.properties.Frozen?.checkbox || false
  }));

  const canonical = core.filter(c => c.title && c.immutable);

  const payload = {
    generated_at: new Date().toISOString(),
    core,
    memory,
    canonical
  };

  fs.mkdirSync("ui/mirror", { recursive: true });
  fs.writeFileSync("ui/mirror/readonly_state.json", JSON.stringify(payload, null, 2));

  console.log("🪞 UI READ-ONLY MIRROR WRITTEN");
}

run();
