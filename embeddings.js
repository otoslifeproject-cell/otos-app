// FILE: embeddings.js (FULL REPLACEMENT — LOCAL + NOTION SAFE)

import fs from "fs";
import crypto from "crypto";
import { getNotionClient } from "./notion-client.js";
import { NOTION_CONFIG } from "./notion.config.js";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const notion = getNotionClient();

/*
  PURPOSE:
  - Generate embeddings for BRAIN + CORE records
  - Store hash to ensure idempotency
  - Append embedding vector as JSON text (no overwrite)
*/

function hash(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

async function embed(text) {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: text.slice(0, 8000)
  });
  return res.data[0].embedding;
}

async function processDB(databaseId, name) {
  let cursor;
  do {
    const res = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor
    });

    for (const page of res.results) {
      const blocks = await notion.blocks.children.list({
        block_id: page.id
      });

      const text = blocks.results
        .map(b => b.paragraph?.rich_text?.map(t => t.plain_text).join(""))
        .join("\n")
        .trim();

      if (!text) continue;

      const contentHash = hash(text);

      const props = page.properties;
      const existing =
        props.embedding_hash?.rich_text?.[0]?.plain_text;

      if (existing === contentHash) continue;

      const vector = await embed(text);

      await notion.pages.update({
        page_id: page.id,
        properties: {
          embedding_hash: {
            rich_text: [{ text: { content: contentHash } }]
          },
          embedding_vector: {
            rich_text: [
              { text: { content: JSON.stringify(vector.slice(0, 256)) } }
            ]
          }
        }
      });
    }

    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  console.log(`✅ Embedded ${name}`);
}

async function run() {
  await processDB(NOTION_CONFIG.DATABASE_IDS.BRAIN, "BRAIN");
  await processDB(NOTION_CONFIG.DATABASE_IDS.CORE, "CORE");
}

run();
