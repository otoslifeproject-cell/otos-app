/**
 * OTOS Core DB — Baseline Schema Enforcer
 * -------------------------------------
 * Canonical contract for OTOS System Core DB
 * Safe to re-run. Creates missing properties only.
 *
 * Required env:
 * - NOTION_TOKEN
 * - CORE_DB (database ID)
 */

import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const CORE_DB = process.env.CORE_DB;

if (!CORE_DB) {
  console.error("❌ CORE_DB env var missing");
  process.exit(1);
}

console.log("🧠 OTOS Baseline Boot starting…");

const REQUIRED_PROPERTIES = {
  Type: {
    select: {
      options: [
        { name: "Core", color: "blue" },
        { name: "Agent", color: "purple" },
        { name: "Workflow", color: "orange" },
        { name: "Document", color: "green" },
        { name: "Memory", color: "pink" },
      ],
    },
  },

  Status: {
    select: {
      options: [
        { name: "Active", color: "green" },
        { name: "Inactive", color: "gray" },
        { name: "Deprecated", color: "red" },
      ],
    },
  },

  Canonical: {
    checkbox: {},
  },

  Created_At: {
    created_time: {},
  },

  Notes: {
    rich_text: {},
  },
};

async function run() {
  const db = await notion.databases.retrieve({ database_id: CORE_DB });

  const existingProps = db.properties || {};
  const updates = {};

  for (const [name, schema] of Object.entries(REQUIRED_PROPERTIES)) {
    if (!existingProps[name]) {
      updates[name] = schema;
      console.log(`➕ Will create property: ${name}`);
    } else {
      console.log(`✔ Property exists: ${name}`);
    }
  }

  if (Object.keys(updates).length === 0) {
    console.log("✅ Baseline already satisfied — no changes needed");
    console.log("✅ OTOS Core Intelligence is STABLE");
    return;
  }

  await notion.databases.update({
    database_id: CORE_DB,
    properties: updates,
  });

  console.log("✅ Baseline properties applied");
  console.log("✅ OTOS Core Intelligence is STABLE");
}

run().catch((err) => {
  console.error("❌ Baseline boot FAILED");
  console.error(err.body || err);
  process.exit(1);
});
