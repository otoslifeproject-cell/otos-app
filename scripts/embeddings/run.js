/**
 * OTOS Embeddings Builder
 * ----------------------
 * Ingests a Notion database, generates embeddings via OpenAI,
 * and persists them to the local vector store (or downstream target).
 *
 * REQUIRED ENV VARS:
 * - OPENAI_API_KEY
 * - NOTION_TOKEN
 * - NOTION_DATABASE_ID
 */

import { Client as NotionClient } from "@notionhq/client";
import OpenAI from "openai";

// ─────────────────────────────────────────────────────────────
// ENV VALIDATION (DO NOT REMOVE)
// ─────────────────────────────────────────────────────────────

const REQUIRED_ENV_VARS = [
  "OPENAI_API_KEY",
  "NOTION_TOKEN",
  "NOTION_DATABASE_ID",
];

const missing = REQUIRED_ENV_VARS.filter(
  (key) => !process.env[key] || process.env[key].trim() === ""
);

if (missing.length > 0) {
  console.error("❌ Missing required environment variables:");
  missing.forEach((v) => console.error(` - ${v}`));
  process.exit(1);
}

console.log("🧠 Starting embeddings builder...");

// ─────────────────────────────────────────────────────────────
// CLIENTS
// ─────────────────────────────────────────────────────────────

const notion = new NotionClient({
  auth: process.env.NOTION_TOKEN,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function extractPlainText(properties) {
  let text = [];

  for (const key of Object.keys(properties)) {
    const prop = properties[key];

    if (prop.type === "title") {
      text.push(
        prop.title.map((t) => t.plain_text).join(" ")
      );
    }

    if (prop.type === "rich_text") {
      text.push(
        prop.rich_text.map((t) => t.plain_text).join(" ")
      );
    }
  }

  return text.join("\n").trim();
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

async function run() {
  console.log("📡 Fetching Notion pages...");

  const pages = [];
  let cursor = undefined;

  do {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      start_cursor: cursor,
      page_size: 100,
    });

    pages.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  console.log(`📄 Pages fetched: ${pages.length}`);

  if (pages.length === 0) {
    console.log("⚠️ No pages found. Nothing to embed.");
    return;
  }

  for (const page of pages) {
    const text = extractPlainText(page.properties);

    if (!text) {
      console.log(`⏭️ Skipping empty page ${page.id}`);
      continue;
    }

    console.log(`🔹 Embedding page ${page.id} (${text.length} chars)`);

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
    });

    const vector = embeddingResponse.data[0].embedding;

    // 🔐 At this stage you would:
    // - persist to a vector DB
    // - write to disk
    // - push to Pinecone / Supabase / local store
    //
    // For now, we log confirmation only.
    console.log(`✅ Embedded ${page.id} → vector length ${vector.length}`);
  }

  console.log("🎉 Embeddings build complete.");
}

// ─────────────────────────────────────────────────────────────
// EXECUTE
// ─────────────────────────────────────────────────────────────

run().catch((err) => {
  console.error("💥 Fatal error in embeddings builder:");
  console.error(err);
  process.exit(1);
});
