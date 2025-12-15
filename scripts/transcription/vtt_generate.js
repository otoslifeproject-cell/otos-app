/**
 * VTT GENERATOR
 * Converts Whisper segments → WebVTT
 */

import fs from "fs";
import path from "path";

const input = "outputs/transcriptions/transcript.json";
if (!fs.existsSync(input)) {
  console.error("❌ TRANSCRIPT JSON NOT FOUND");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(input, "utf8"));

let vtt = "WEBVTT\n\n";

data.segments.forEach((s, i) => {
  const start = new Date(s.start * 1000).toISOString().substr(11, 12);
  const end = new Date(s.end * 1000).toISOString().substr(11, 12);

  vtt += `${i + 1}\n${start} --> ${end}\n${s.text}\n\n`;
});

fs.writeFileSync("outputs/transcriptions/transcript.vtt", vtt);

console.log("🎬 VTT FILE GENERATED");
