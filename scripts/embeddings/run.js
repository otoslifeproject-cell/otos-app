/**
 * OTOS EMBEDDINGS BUILDER v1.0 (Brain DB)
 * - Reads Brain DB
 * - Embeds rows that have Content but no Embedding_JSON
 * - Writes Embedding_JSON + Embedding_Status + Embedding_Updated_At
 *
 * Required env:
 *   NOTION_TOKEN
 *   BRAIN_DB
 *   OPENAI_API_KEY
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("@notionhq/client");

function requireEnv(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) throw new Error(`Missing env var: ${name}`);
  return String(v).trim();
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

async function queryAll(notion, database_id) {
  let results = [];
  let cursor = undefined;
  while (true) {
    const resp = await notion.databases.query({
      database_id,
      start_cursor: cursor,
      page_size: 100,
    });
    results = results.concat(resp.results);
    if (!resp.has_more) break;
    cursor = resp.next_cursor;
  }
  return results;
}

function plainTextRichText(rt) {
  if (!rt || !Array.isArray(rt)) return "";
  return rt.map((t) => t.plain_text || "").join("").trim();
}

async function embedTextOpenAI({ apiKey, text, model = "text-embedding-3-small" }) {
  const resp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: text,
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`OpenAI embeddings failed: ${resp.status} ${resp.statusText} ${errText}`);
  }

  const data = await resp.json();
  const vec = data?.data?.[0]?.embedding;
  if (!Array.isArray(vec)) throw new Error("OpenAI embeddings response missing embedding array");
  return { vector: vec, model };
}

async function main() {
  const NOTION_TOKEN = requireEnv("NOTION_TOKEN");
  const BRAIN_DB = requireEnv("BRAIN_DB");
  const OPENAI_API_KEY = requireEnv("OPENAI_API_KEY");

  const notion = new Client({ auth: NOTION_TOKEN });

  const artifactsDir = path.join(process.cwd(), "artifacts");
  ensureDir(artifactsDir);

  console.log("🧠 Loading Brain DB from Notion...");
  const pages = await queryAll(notion, BRAIN_DB);
  console.log(`✅ Loaded ${pages.length} records`);

  // Eligible: has Content and Embedding_JSON empty
  const eligible = pages.filter((p) => {
    const props = p.properties || {};
    const content = plainTextRichText(props.Content?.rich_text);
    const embedded = plainTextRichText(props.Embedding_JSON?.rich_text);
    return content.length > 0 && embedded.length === 0;
  });

  console.log(`🧪 Eligible for embedding: ${eligible.length}`);

  // Safety cap per run (stability-first)
  const MAX_PER_RUN = 25;
  const batch = eligible.slice(0, MAX_PER_RUN);

  const report = {
    ran_at_utc: new Date().toISOString(),
    total: pages.length,
    eligible: eligible.length,
    processed: 0,
    errors: [],
  };

  for (const page of batch) {
    const pageId = page.id;
    try {
      const props = page.properties || {};
      const content = plainTextRichText(props.Content?.rich_text);

      // Embed
      const { vector, model } = await embedTextOpenAI({
        apiKey: OPENAI_API_KEY,
        text: content,
      });

      // Store (JSON string chunked across rich_text blocks is okay)
      const jsonStr = JSON.stringify(vector);

      await notion.pages.update({
        page_id: pageId,
        properties: {
          "Embedding_JSON": {
            rich_text: [{ type: "text", text: { content: jsonStr } }],
          },
          "Embedding_Status": { select: { name: "Embedded" } },
          "Embedding_Updated_At": { date: { start: new Date().toISOString() } },
        },
      });

      report.processed += 1;
      console.log(`✅ Embedded: ${pageId}`);
    } catch (e) {
      const msg = e?.message || String(e);
      report.errors.push({ page_id: pageId, error: msg });
      console.error(`❌ Embed failed for ${pageId}: ${msg}`);
      // mark error status (non-fatal)
      try {
        await notion.pages.update({
          page_id: pageId,
          properties: {
            "Embedding_Status": { select: { name: "Error" } },
            "Embedding_Updated_At": { date: { start: new Date().toISOString() } },
          },
        });
      } catch {}
    }
  }

  fs.writeFileSync(
    path.join(artifactsDir, "embeddings_report.json"),
    JSON.stringify(report, null, 2),
    "utf-8"
  );

  console.log("✅ Embeddings builder completed successfully");
  console.log(`Processed: ${report.processed} | Errors: ${report.errors.length}`);
}

main().catch((err) => {
  console.error("❌ EMBEDDINGS FAILED:", err?.message || err);
  process.exit(1);
});
