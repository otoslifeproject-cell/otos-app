/**
 * OTOS Embeddings Builder
 * Uses Notion as Brain DB
 * Runs safely inside GitHub Actions
 */

import { Client as NotionClient } from "@notionhq/client";
import OpenAI from "openai";

// ---- ENV CHECK (NO LEAKS) ----
const required = [
  "OPENAI_API_KEY",
  "NOTION_TOKEN",
  "NOTION_DATABASE_ID"
];

const missing = required.filter(k => !process.env[k]);

if (missing.length) {
  console.error("❌ Missing required environment variables:");
  missing.forEach(k => console.error(` - ${k}`));
  process.exit(1);
}

console.log("✅ Environment variables present");

// ---- CLIENTS ----
const notion = new NotionClient({
  auth: process.env.NOTION_TOKEN
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ---- MAIN ----
async function run() {
  console.log("🧠 Starting OTOS embeddings builder...");

  const dbId = process.env.NOTION_DATABASE_ID;

  const pages = await notion.databases.query({
    database_id: dbId
  });

  console.log(`📄 Loaded ${pages.results.length} records from Brain DB`);

  for (const page of pages.results) {
    const text =
      page.properties?.Name?.title?.[0]?.plain_text ||
      "";

    if (!text) continue;

    await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text
    });
  }

  console.log("✅ Embeddings run completed");
}

run().catch(err => {
  console.error("🔥 Fatal error:", err);
  process.exit(1);
});
