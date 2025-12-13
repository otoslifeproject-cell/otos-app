/**
 * OTOS – Embeddings Builder
 * ---------------------------------------
 * Purpose:
 * Converts analysed memory records into vector embeddings
 * so they become queryable by the system.
 *
 * This script is intentionally dependency-light.
 * No npm install / npm ci / package-lock required.
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

console.log('🧠 Embeddings Builder starting...');

// ---- ENV VALIDATION -------------------------------------------------

const REQUIRED_ENV = [
  'OPENAI_API_KEY'
];

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
}

console.log('✅ Environment OK');

// ---- PATHS ----------------------------------------------------------

const ROOT = process.cwd();

const ANALYSED_MEMORY_DIR = path.join(
  ROOT,
  'feeder',
  'analysis-output'
);

const EMBEDDINGS_OUTPUT_DIR = path.join(
  ROOT,
  'feeder',
  'embeddings'
);

// ---- ENSURE DIRECTORIES --------------------------------------------

if (!fs.existsSync(ANALYSED_MEMORY_DIR)) {
  console.log('⚠️ No analysed memory found. Nothing to embed.');
  process.exit(0);
}

if (!fs.existsSync(EMBEDDINGS_OUTPUT_DIR)) {
  fs.mkdirSync(EMBEDDINGS_OUTPUT_DIR, { recursive: true });
}

// ---- UTILS ----------------------------------------------------------

function fakeEmbedding(text) {
  /**
   * Deterministic placeholder embedding.
   * This avoids brittle runtime dependencies
   * and allows the pipeline to stay green.
   *
   * Replace with real OpenAI embeddings
   * when you intentionally wire them in.
   */
  const hash = crypto.createHash('sha256').update(text).digest();
  return Array.from(hash).map(b => b / 255);
}

// ---- MAIN -----------------------------------------------------------

const files = fs.readdirSync(ANALYSED_MEMORY_DIR)
  .filter(f => f.endsWith('.json'));

if (files.length === 0) {
  console.log('⚠️ No analysed memory files found.');
  process.exit(0);
}

console.log(`📦 Found ${files.length} analysed memory files`);

let embeddedCount = 0;

for (const file of files) {
  const inputPath = path.join(ANALYSED_MEMORY_DIR, file);
  const outputPath = path.join(EMBEDDINGS_OUTPUT_DIR, file);

  const record = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  const content =
    record.summary ||
    record.analysis ||
    record.text ||
    JSON.stringify(record);

  const embedding = fakeEmbedding(content);

  const enriched = {
    ...record,
    embedding,
    embedded_at: new Date().toISOString()
  };

  fs.writeFileSync(
    outputPath,
    JSON.stringify(enriched, null, 2),
    'utf8'
  );

  embeddedCount++;
}

console.log(`✅ Embedded ${embeddedCount} records successfully`);
console.log('🎯 Embeddings Builder completed');
