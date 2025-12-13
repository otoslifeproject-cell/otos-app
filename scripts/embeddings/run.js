/**
 * OTOS Embeddings Builder
 * -----------------------
 * - Pulls records from a Notion database (Brain DB)
 * - Generates OpenAI embeddings
 * - Writes embeddings back to Notion
 *
 * HARD FAILS if env vars are missing
 * Safe for GitHub Actions
 */

import { Client as NotionClient } from "@notionhq/client";
import OpenAI from "openai";

// ─────────────────────────────────────────────────────────────
// ENV VALIDATION (FAIL FAST)
// ─────────────────────────────────────────────────────────────
const REQUIRED_ENV = [
  "NOTION_TOKEN",
  "NOTION_DATABASE_ID",
  "OPENAI_API_KEY"
];

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}`);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────
// CLIENTS
// ─────────────────────────────────────────────────────────────
const notion = new NotionClient({
  auth: process.env.NOTION_TOKEN
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function extractPlainText(richText = []) {
  return richText.map(t => t.plain_text).join(" ").trim();
}

async function fetchAllNotionRows(databaseId) {
  let results = [];
  let cursor = undefined;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor
    });

    results.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return results;
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
async function run() {
  console.log("🧠 Starting embeddings builder…");

  const rows = await fetchAllNotionRows(
    process.env.NOTION_DATABASE_ID
  );

  console.log(`📄 Loaded ${rows.length} records from Notion`);

  let processed = 0;

  for (const row of rows) {
    const props = row.properties;

    // EXPECTED PROPERTIES (adjust names ONLY if needed)
    const title =
      extractPlainText(props.Name?.title) ||
      extractPlainText(props.Title?.title) ||
      "";

    const body =
      extractPlainText(props.Content?.rich_text) ||
      extractPlainText(props.Notes?.rich_text) ||
      "";

    const text = `${title}\n\n${body}`.trim();

    if (!text) continue;

    // ─────────────────────────────────────────
    // GENERATE EMBEDDING
    // ─────────────────────────────────────────
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text
    });

    const vector = embeddingResponse.data[0].embedding;

    // ─────────────────────────────────────────
    // WRITE BACK TO NOTION
    // (expects a property named "Embedding")
    // ─────────────────────────────────────────
    await notion.pages.update({
      page_id: row.id,
      properties: {
        Embedding: {
          rich_text: [
            {
              text: {
                content: JSON.stringify(vector)
              }
            }
          ]
        }
      }
    });

    processed++;
    if (processed % 10 === 0) {
      console.log(`⚙️ Processed ${processed}/${rows.length}`);
    }
  }

  console.log(`✅ Embeddings written successfully (${processed} records)`);
}

// ─────────────────────────────────────────────────────────────
run().catch(err => {
  console.error("🔥 Fatal error in embeddings builder");
  console.error(err);
  process.exit(1);
});
