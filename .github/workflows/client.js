/* eslint-disable no-console */
const { Client } = require("@notionhq/client");

function requireEnv(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) throw new Error(`Missing required env: ${name}`);
  return String(v).trim();
}

function optionalEnv(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) return null;
  return String(v).trim();
}

function createNotionClient() {
  const token = requireEnv("NOTION_TOKEN");
  return new Client({ auth: token });
}

module.exports = {
  requireEnv,
  optionalEnv,
  createNotionClient,
};
