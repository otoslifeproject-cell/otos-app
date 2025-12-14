// scripts/embeddings/run.js
import { Client } from "@notionhq/client";
import OpenAI from "openai";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BRAIN_DB_ID = process.env.BRAIN_DB;

if (!BRAIN_DB_ID) {
  console.error("❌ BRAIN_DB env var missing");
  process.exit(1);
}

console.log("🧠 Loading Brain DB from Notion…");

const pages = await notion.databases.query({
  database_id: BRAIN_DB_ID,
});

console.log(`📄 Loaded ${pages.results.length} records`);

let embeddedCount = 0;

for (const page of pages.results) {
  const title =
    page.properties?.Name?.title?.[0]?.plain_text ?? "";

  if (!title) continue;

  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: title,
  });

  // NOTE: We are not writing embeddings back yet
  // This is a pipeline sanity run only

  embeddedCount++;
}

console.log(`🧠 Embeddings generated for ${embeddedCount} records`);
console.log("✅ Embeddings builder completed successfully");
