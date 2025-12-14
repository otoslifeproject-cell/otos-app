// scripts/embeddings/run.js
import fs from "fs";
import path from "path";
import { Client } from "@notionhq/client";
import OpenAI from "openai";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const notion = new Client({ auth: requireEnv("NOTION_TOKEN") });
const openai = new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY") });

const BRAIN_DB_ID = requireEnv("BRAIN_DB");

async function run() {
  const pages = await notion.databases.query({
    database_id: BRAIN_DB_ID
  });

  let count = 0;

  for (const page of pages.results) {
    const titleProp = Object.values(page.properties).find(p => p.type === "title");
    const text = titleProp?.title?.map(t => t.plain_text).join(" ") || "";

    if (!text) continue;

    await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text
    });

    count++;
  }

  console.log(`Embeddings updated for ${count} pages`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
