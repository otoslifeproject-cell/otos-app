import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { createNotionClient, requireEnv } from "../notion/client.js";

const notion = createNotionClient();
const openai = new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY") });

const BRAIN_DB_ID = requireEnv("BRAIN_DB");

async function run() {
  const pages = await notion.databases.query({
    database_id: BRAIN_DB_ID
  });

  if (!pages.results.length) {
    console.log("🧠 No Brain records found");
    return;
  }

  let count = 0;

  for (const page of pages.results) {
    const title =
      page.properties.Title?.title?.[0]?.plain_text || "";

    if (!title) continue;

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: title
    });

    await notion.pages.update({
      page_id: page.id,
      properties: {
        Embedding_Vector: {
          rich_text: [
            {
              text: {
                content: JSON.stringify(embedding.data[0].embedding)
              }
            }
          ]
        }
      }
    });

    count++;
  }

  console.log(`✅ Embeddings updated for ${count} pages`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
