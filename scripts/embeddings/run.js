/**
 * OTOS Embeddings Builder
 * -----------------------
 * - Uses Notion as Brain DB
 * - Generates OpenAI embeddings
 * - Runs safely in GitHub Actions
 * - Hard-fails if anything is missing
 */

import { Client as NotionClient } from "@notionhq/client";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

// ==============================
// ENV VALIDATION
// ==============================
const REQUIRED_ENV_VARS = [
  "OPENAI_API_KEY",
  "NOTION_TOKEN",
  "NOTION_DATABASE_ID",
];

const missing = REQUIRED_ENV_VARS.filter(
  (key) => !process.env[key]
);

if (missing.length > 0) {
  console.error("❌ Missing required environment variables:");
  missing.forEach((v) => console.error(` - ${v}`));
  process.exit(1);
}

console.log("🧠 Starting embeddings builder…");

// ==============================
// CLIENTS
// ==============================
const notion = new NotionClient({
  auth: process.env.NOTION_TOKEN,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ==============================
// HELPERS
// ==============================
function extractPlainText(properties) {
  let text = [];

  for (const key in properties) {
    const prop = properties[key];

    if (prop.type === "title") {
      text.push(...prop.title.map(t => t.plain_text));
    }

    if (prop.type === "rich_text") {
      text.push(...prop.rich_text.map(t => t.plain_text));
    }
  }

  return text.join(" ").trim();
}

// ==============================
// MAIN
// ==============================
async function run() {
  // 1. Load Notion records
  const pages = [];
  let cursor = undefined;

  do {
    const res = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      start_cursor: cursor,
    });

    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  console.log(`📄 Loaded ${pages.length} records from Notion`);

  if (pages.length === 0) {
    console.log("⚠️ No records found — exiting cleanly");
    return;
  }

  // 2. Prepare text
  const documents = pages
    .map((page) => ({
      id: page.id,
      text: extractPlainText(page.properties),
    }))
    .filter((d) => d.text.length > 0);

  console.log(`🧹 Prepared ${documents.length} text documents`);

  // 3. Generate embeddings
  const embeddings = [];

  for (const doc of documents) {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: doc.text,
    });

    embeddings.push({
      id: doc.id,
      embedding: response.data[0].embedding,
    });
  }

  console.log("⚡ Embeddings generated");

  // 4. Persist output
  const outDir = path.resolve("data");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, "embeddings.json");

  fs.writeFileSync(
    outPath,
    JSON.stringify(embeddings, null, 2),
    "utf8"
  );

  console.log(`✅ Embeddings written to ${outPath}`);
}

// ==============================
// EXECUTE
// ==============================
run().catch((err) => {
  console.error("🔥 Embeddings builder failed:");
  console.error(err);
  process.exit(1);
});
