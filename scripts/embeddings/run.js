/**
 * OTOS – Embeddings Builder
 * ------------------------------------------------
 * - Loads records from a Notion database (Brain DB)
 * - Generates OpenAI embeddings
 * - Writes embeddings to /data/embeddings.json
 * - Designed to run in GitHub Actions
 * ------------------------------------------------
 */

import fs from "fs";
import path from "path";
import process from "process";
import { Client as NotionClient } from "@notionhq/client";
import OpenAI from "openai";

/* =========================
   ENV VALIDATION
========================= */

const {
  OPENAI_API_KEY,
  NOTION_TOKEN,
  NOTION_DATABASE_ID,
} = process.env;

if (!OPENAI_API_KEY || !NOTION_TOKEN || !NOTION_DATABASE_ID) {
  console.error("❌ Missing required environment variables:");
  if (!OPENAI_API_KEY) console.error(" - OPENAI_API_KEY");
  if (!NOTION_TOKEN) console.error(" - NOTION_TOKEN");
  if (!NOTION_DATABASE_ID) console.error(" - NOTION_DATABASE_ID");
  process.exit(1);
}

/* =========================
   CLIENTS
========================= */

const notion = new NotionClient({
  auth: NOTION_TOKEN,
});

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

/* =========================
   HELPERS
========================= */

function extractPlainText(properties) {
  let text = "";

  for (const key of Object.keys(properties)) {
    const prop = properties[key];

    if (prop.type === "title") {
      text += prop.title.map(t => t.plain_text).join(" ") + "\n";
    }

    if (prop.type === "rich_text") {
      text += prop.rich_text.map(t => t.plain_text).join(" ") + "\n";
    }

    if (prop.type === "select" && prop.select) {
      text += prop.select.name + "\n";
    }

    if (prop.type === "multi_select") {
      text += prop.multi_select.map(t => t.name).join(", ") + "\n";
    }
  }

  return text.trim();
}

/* =========================
   MAIN
========================= */

async function run() {
  console.log("🧠 OTOS Embeddings Builder starting…");

  /* ---- Load Notion Records ---- */

  const pages = [];
  let cursor = undefined;

  do {
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      start_cursor: cursor,
    });

    pages.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  console.log(`📄 Loaded ${pages.length} records from Notion`);

  if (pages.length === 0) {
    console.log("⚠️ No records found. Exiting.");
    return;
  }

  /* ---- Prepare Documents ---- */

  const documents = pages
    .map(page => {
      const text = extractPlainText(page.properties);
      if (!text) return null;

      return {
        id: page.id,
        text,
      };
    })
    .filter(Boolean);

  console.log(`🧹 Prepared ${documents.length} documents`);

  /* ---- Generate Embeddings ---- */

  const embeddings = [];

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];

    console.log(`⚡ Embedding ${i + 1}/${documents.length}`);

    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: doc.text,
    });

    embeddings.push({
      id: doc.id,
      embedding: response.data[0].embedding,
      text: doc.text,
    });
  }

  /* ---- Write Output ---- */

  const outDir = path.resolve("data");
  const outFile = path.join(outDir, "embeddings.json");

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outFile, JSON.stringify(embeddings, null, 2));

  console.log(`✅ Embeddings written to ${outFile}`);
  console.log("🎉 Embeddings Builder completed successfully");
}

/* =========================
   EXECUTE
========================= */

run().catch(err => {
  console.error("💥 Fatal error in embeddings builder:");
  console.error(err);
  process.exit(1);
});
