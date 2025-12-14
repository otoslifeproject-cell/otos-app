import { Client } from "@notionhq/client";

export function requireEnv(name) {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return val;
}

export function createNotionClient() {
  return new Client({
    auth: requireEnv("NOTION_TOKEN"),
  });
}
