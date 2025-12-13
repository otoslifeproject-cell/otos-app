/**
 * OTOS Embeddings Builder
 * ======================
 * Source of truth: NOTION_DATABASE_ID
 * Output: data/embeddings.json
 * Runtime: GitHub Actions / Node 20+
 */

import { Client as NotionClient } from "@notionhq/client";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

// ==============================
// ENV CHECK (HARD FAIL)
// ==============================
const REQUIRED = [
  "OPENAI_API_KEY",
  "NOTION_TOKEN",
  "NOTION_DATABASE_ID",
];

const missing = REQUIRED.filter(k => !process.env[k]);

if (missing.length) {
  console.error("❌ Missing environment variables:");
  missing.forEach(k => console.error(` - ${k}`));
  process.exit(1);
}

console.log("🧠 OTOS Embeddings Builder starting…");

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
function extractText(props) {
  let out = [];

  for (const key in props) {
    const p = props[key];

    if (p.type === "title") {
      out.push(...p.title.map(t => t.plain_text));
    }

    if (p.type === "rich_text") {
      out.push(...p.rich_text.map(t => t.plain_text));
    }
  }

  return out.join(" ").trim();
}

// ==============================
// MAIN
// ==============================
async function run() {
  const pages = [];
  let cursor = undefined;

  // Pull entire Notion DB
  do {
    const res = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      start_cursor: cursor,
    });

    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  console.log(`📄 Loaded ${pages.length} Notion records`);

  if (!pages.length) {
    console.log("⚠️ No records found. Exiting cleanly.");
    return;
  }

  const docs = pages
    .map(p => ({
      id: p.id,
      text: extractText(p.properties),
    }))
    .filter(d => d.text.length > 0);

  console.log(`🧹 Prepared ${docs.length} documents`);

  const vectors = [];

  for (const doc of docs) {
    const emb = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: doc.text,
    });

    vectors.push({
      id: doc.id,
      embedding: emb.data[0].embedding,
    });
  }

  console.log("⚡ Embeddings generated");

  const outDir = path.resolve("data");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, "embeddings.json");
  fs.writeFileSync(outFile, JSON.stringify(vectors, null, 2), "utf8");

  console.log(`✅ Written ${vectors.length} embeddings → ${outFile}`);
}

// ==============================
// EXEC
// ==============================
run().catch(err => {
  console.error("🔥 FATAL ERROR");
  console.error(err);
  process.exit(1);
});

