/**
 * Canonical Lock Script
 * ---------------------
 * Locks the CORE Notion DB by validating access and
 * writing a Canonical lock marker property if present.
 *
 * HARD REQUIREMENTS:
 * - process.env.NOTION_TOKEN
 * - process.env.CORE_DB  (DATABASE ID ONLY – 32 chars, no URL)
 */

import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function run() {
  const CORE_DB = process.env.CORE_DB;

  // 🔒 Hard guards (no silent failure ever)
  if (!process.env.NOTION_TOKEN) {
    throw new Error("NOTION_TOKEN is missing");
  }

  if (!CORE_DB) {
    throw new Error("CORE_DB is missing");
  }

  if (CORE_DB.includes("http")) {
    throw new Error("CORE_DB must be a DATABASE ID, not a URL");
  }

  if (CORE_DB.length !== 32) {
    throw new Error(
      `CORE_DB looks wrong length (${CORE_DB.length}). Expected 32-char database ID`
    );
  }

  console.log("🔒 Canonical Lock starting");
  console.log("📦 CORE_DB:", CORE_DB);

  // ✅ This is the call that was failing before
  const db = await notion.databases.retrieve({
    database_id: CORE_DB,
  });

  console.log("✅ CORE DB verified:", db.title?.[0]?.plain_text || "(untitled)");

  // Optional: write a canonical lock marker if property exists
  const properties = db.properties || {};

  if (properties.Canonical_Artefact) {
    console.log("🧷 Writing Canonical_Artefact = Canonical (locked)");

    await notion.pages.create({
      parent: { database_id: CORE_DB },
      properties: {
        Name: {
          title: [{ text: { content: "🔒 Canonical Lock Marker" } }],
        },
        Canonical_Artefact: {
          select: { name: "Canonical (locked)" },
        },
      },
    });
  } else {
    console.log(
      "ℹ️ Canonical_Artefact property not present — DB verified only"
    );
  }

  console.log("🟢 Canonical lock complete");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Canonical lock FAILED");
  console.error(err.message || err);
  process.exit(1);
});
