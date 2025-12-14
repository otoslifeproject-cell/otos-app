/**
 * SYSTEM READY CHECK
 * Single binary gate: GO or NO-GO
 * Any failure = hard stop
 */

import { Client } from "@notionhq/client";
import fs from "fs";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const CORE_DB = process.env.CORE_DB;
const MEMORY_DB = process.env.BRAIN_DB;
const AGENTS_DB = process.env.AGENTS_DB;

async function assertCoreSeal() {
  const res = await notion.databases.query({
    database_id: CORE_DB,
    filter: {
      property: "Title",
      title: { equals: "CORE_STABILITY_SEAL" }
    }
  });

  if (res.results.length === 0) throw new Error("CORE SEAL MISSING");
  if (!res.results[0].properties.Immutable.checkbox)
    throw new Error("CORE SEAL NOT IMMUTABLE");
}

async function assertMemoryFrozen() {
  const res = await notion.databases.query({
    database_id: MEMORY_DB,
    filter: {
      property: "Frozen",
      checkbox: { equals: true }
    }
  });

  if (res.results.length === 0) throw new Error("NO FROZEN MEMORY RECORDS");
}

async function assertAgentBoundaries() {
  const res = await notion.databases.query({ database_id: AGENTS_DB });

  for (const a of res.results) {
    const name = a.properties.Agent_Name.title[0].plain_text;
    const type = a.properties.Agent_Type.select.name;
    const immutable = a.properties.Immutable.checkbox;

    if (type === "Core" && !immutable)
      throw new Error(`CORE AGENT ${name} NOT IMMUTABLE`);
  }
}

function assertUIMirror() {
  if (!fs.existsSync("ui/mirror/readonly_state.json"))
    throw new Error("UI MIRROR MISSING");
}

async function run() {
  try {
    await assertCoreSeal();
    await assertMemoryFrozen();
    await assertAgentBoundaries();
    assertUIMirror();

    console.log("🟢 SYSTEM READY — GO");
  } catch (e) {
    console.error("🔴 SYSTEM NOT READY — NO-GO");
    console.error(e.message);
    process.exit(1);
  }
}

run();
