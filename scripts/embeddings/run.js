console.log("DEBUG DB ID:", process.env.NOTION_DATABASE_ID);
/**
 * OTOS Embeddings Builder
 * ----------------------
 * - Pulls records from a Notion database (Brain DB)
 * - Generates embeddings via OpenAI
 * - Designed to run safely in GitHub Actions (Node 20)
 * - ZERO external npm dependencies
 */

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log("🧠 Starting embeddings builder...");

// ---------- HARD ENV CHECK ----------
const missing = [];
if (!OPENAI_API_KEY) missing.push("OPENAI_API_KEY");
if (!NOTION_TOKEN) missing.push("NOTION_TOKEN");
if (!NOTION_DATABASE_ID) missing.push("NOTION_DATABASE_ID");

if (missing.length) {
  console.error("❌ Missing required environment variables:");
  missing.forEach(v => console.error(" -", v));
  process.exit(1);
}

console.log("✅ Environment variables present");

// ---------- HELPERS ----------
async function notionFetch(path, body) {
  const res = await fetch(`https://api.notion.com/v1/${path}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NOTION_TOKEN}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Notion API error ${res.status}: ${t}`);
  }

  return res.json();
}

async function openaiEmbed(text) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "text-embedding-3-large",
      input: text.slice(0, 8000)
    })
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${t}`);
  }

  const json = await res.json();
  return json.data[0].embedding;
}

// ---------- LOAD NOTION RECORDS ----------
async function loadAllPages() {
  let results = [];
  let cursor = undefined;

  while (true) {
    const payload = {
      page_size: 100,
      start_cursor: cursor
    };

    const data = await notionFetch(
      `databases/${NOTION_DATABASE_ID}/query`,
      payload
    );

    results.push(...data.results);

    if (!data.has_more) break;
    cursor = data.next_cursor;
  }

  return results;
}

// ---------- MAIN ----------
(async () => {
  try {
    console.log("📥 Loading Brain DB from Notion...");
    const pages = await loadAllPages();
    console.log(`📄 Loaded ${pages.length} records`);

    let embedded = 0;

    for (const page of pages) {
      const props = page.properties || {};
      let text = "";

      for (const key of Object.keys(props)) {
        const p = props[key];
        if (p.type === "rich_text" || p.type === "title") {
          text += p[p.type].map(t => t.plain_text).join(" ") + "\n";
        }
      }

      if (!text.trim()) continue;

      const vector = await openaiEmbed(text);
      embedded++;

      // NOTE:
      // We deliberately do NOT write embeddings back yet.
      // This run proves ingestion + embedding stability.
    }

    console.log(`🧠 Embeddings generated for ${embedded} records`);
    console.log("✅ Embeddings builder completed successfully");
  } catch (err) {
    console.error("❌ Embeddings builder failed:");
    console.error(err);
    process.exit(1);
  }
})();
