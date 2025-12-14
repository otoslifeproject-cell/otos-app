import { Client } from "@notionhq/client";

export function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export function createNotionClient() {
  return new Client({
    auth: requireEnv("NOTION_TOKEN"),
  });
}
