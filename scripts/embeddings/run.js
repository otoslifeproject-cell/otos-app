/**
 * OTOS Embeddings Builder
 * ----------------------
 * - Uses Notion as the Brain DB
 * - Generates OpenAI embeddings
 * - Designed for GitHub Actions
 * - Safe (no secret leakage)
 */

import process from "process";
import { Client as NotionClient } from "@notionhq/client";
import OpenAI from "openai";

// ─────────────────────────────────────────────────────────────
// ENV VALIDATION (hard fail, explicit)
// ─────────────────────────────────────────────────────────────

const REQUIRED_ENV = [
  "OPENAI_API_KEY",
  "NOTION_TOKEN",
  "NOTION_DATABASE_ID",
];

const missing = REQUIRED_ENV.filter((k) => !process.env[k]);

if (missing.length > 0) {
  console.error("❌ Missing required environment variables:");
  for (const key of missing) console.error(` - ${key}`);
  process.exit(1);
}

console.log("✅ Environment variables present");

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

function extractPlainText(richText = []) {
  return richText.map((t) => t.plain_text).join(" ").trim();
}

async function fetchAllNotionPages(databaseId) {
  const pages = [];
  let cursor = undefined;

  while (true) {
    const res = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    });

    pages.push(...res.results);

    if (!res.has_more) break;
    cursor = res.next_cursor;
  }

  return pages;
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

async function run() {
  console.log("🧠 Loading Notion Brain DB…");

  const pages = await fetchAllNotionPages(
    process.env.NOTION_DATABASE_ID
  );

  console.log(`📄 Loaded ${pages.length} records`);

  let embedded = 0;

  for (const page of pages) {
    const props = page.properties;

    const titleProp =
      props.Title ||
      props.Name ||
      Object.values(props).find((p) => p.type === "title");

    if (!titleProp) continue;

    const text = extractPlainText(titleProp.title);
    if (!text) continue;

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
    });

    const vector = embedding.data[0].embedding;

    // Store embedding back into Notion (as JSON text)
    await notion.pages.update({
      page_id: page.id,
      properties: {
        Embedding: {
          rich_text: [
            {
              text: {
                content: JSON.stringify(vector),
              },
            },
          ],
        },
      },
    });

    embedded++;
  }

  console.log(`✅ Embeddings written: ${embedded}`);
}

run().catch((err) => {
  console.error("🔥 Fatal error:", err);
  process.exit(1);
});
