/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const OpenAI = require("openai");
const { createNotionClient, requireEnv } = require("../notion/client");

function hash(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function richTextToString(rich = []) {
  return rich.map((r) => r.plain_text || "").join("").trim();
}

async function loadBrainPages(notion, databaseId) {
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

function buildEmbeddingText(page) {
  const p = page.properties || {};
  const parts = [];

  if (p.Name?.title) parts.push(richTextToString(p.Name.title));
  if (p.Summary?.rich_text) parts.push(richTextToString(p.Summary.rich_text));
  if (p.Content?.rich_text) parts.push(richTextToString(p.Content.rich_text));
  if (p["AI Notes"]?.rich_text) parts.push(richTextToString(p["AI Notes"].rich_text));

  return parts.filter(Boolean).join("\n\n");
}

async function main() {
  const notion = createNotionClient();
  const openai = new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY") });

  const BRAIN_DB = requireEnv("NOTION_BRAIN_DB_ID");

  console.log("🧠 Loading OTOS Brain DB...");
  const pages = await loadBrainPages(notion, BRAIN_DB);
  console.log(`📄 Loaded ${pages.length} pages`);

  let embedded = 0;

  for (const page of pages) {
    const text = buildEmbeddingText(page);
    if (!text) continue;

    const digest = hash(text);

    const existingHash = richTextToString(
      page.properties?.UUID?.rich_text || []
    );

    if (existingHash === digest) continue;

    const emb = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
    });

    await notion.pages.update({
      page_id: page.id,
      properties: {
        UUID: {
          rich_text: [{ type: "text", text: { content: digest } }],
        },
      },
    });

    const outDir = path.join("artifacts", "embeddings");
    fs.mkdirSync(outDir, { recursive: true });

    fs.writeFileSync(
      path.join(outDir, `${page.id}.json`),
      JSON.stringify(
        {
          page_id: page.id,
          embedding: emb.data[0].embedding,
          updated_at: new Date().toISOString(),
        },
        null,
        2
      )
    );

    embedded++;
  }

  console.log(`✅ Embeddings updated for ${embedded} pages`);
}

main().catch((err) => {
  console.error("❌ Embeddings builder failed");
  console.error(err?.stack || err);
  process.exit(1);
});
