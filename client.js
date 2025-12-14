import { Client } from "@notionhq/client";
import { ENV } from "../_bootstrap/esm-env.js";

export const notion = new Client({
  auth: ENV.NOTION_TOKEN,
});

export function requireEnv(...keys) {
  for (const key of keys) {
    if (!ENV[key]) {
      throw new Error(`❌ Missing ENV var: ${key}`);
    }
  }
}
