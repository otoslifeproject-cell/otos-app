import { notion, requireEnv } from "../notion/client.js";
import { ENV } from "../_bootstrap/esm-env.js";
import OpenAI from "openai";

requireEnv("BRAIN_DB", "OPENAI_API_KEY");

const openai = new OpenAI({
  apiKey: ENV.OPENAI_API_KEY,
});

async function run() {
  const pages = await notion.databases.query({
    database_id: ENV.BRAIN_DB,
  });

  let updated = 0;

  for (const page of pages.results) {
    const title =
      page.properties.Title?.title?.[0]?.plain_text || "";

    if (!title) continue;

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: title,
    });

    await notion.pages.update({
      page_id: page.id,
      properties: {
        Embedding_Version: {
          number: 1,
        },
      },
    });

    updated++;
  }

  console.log(`✅ Embeddings updated for ${updated} pages`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
