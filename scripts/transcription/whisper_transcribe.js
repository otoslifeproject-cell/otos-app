/**
 * WHISPER TRANSCRIPTION CORE
 * Accepts audio URL or local file reference
 * Outputs VTT + TXT placeholders
 */

import fs from "fs";
import path from "path";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const input = process.argv.slice(2).join(" ");
if (!input) {
  console.error("❌ NO AUDIO INPUT PROVIDED");
  process.exit(1);
}

async function run() {
  const response = await client.audio.transcriptions.create({
    file: fs.createReadStream(input),
    model: "gpt-4o-transcribe",
    response_format: "verbose_json"
  });

  const outDir = "outputs/transcriptions";
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(
    path.join(outDir, "transcript.json"),
    JSON.stringify(response, null, 2)
  );

  fs.writeFileSync(
    path.join(outDir, "transcript.txt"),
    response.text
  );

  console.log("📝 TRANSCRIPTION COMPLETE");
}

run();
