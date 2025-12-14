import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { createNotionClient, requireEnv } from "../notion/client.js";

const notion = createNotionClient();
const openai = new OpenAI({
  apiKey: requireEnv("OPENAI_API_KEY"),
});

const BRAIN_DB = requireEnv("BRAIN_DB");

async function run() {
  console.log("🧠 Starting embeddings builder…");

  const pages = await notion.databases.query({
    database_id: BRAIN_DB,
  });

  console.log(`📥 Loaded ${pages.results.length} records`);

  let embedded = 0;

  for (const page of pages.results) {
    const text =
      page.properties?.Summary?.rich_text
        ?.map(t => t.plain_text)
        .join(" ")
        ?.trim() || "";

    if (!text) continue;

    await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
    });

    embedded++;
  }

  console.log(`🧠 Embeddings generated for ${embedded} records`);
  console.log("✅ Embeddings builder completed successfully");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
