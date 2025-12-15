/**
 * YOUTUBE → AUDIO EXTRACTOR
 * Requires yt-dlp available in runner
 * Outputs .mp3 to outputs/youtube_audio/
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const url = process.argv[2];
if (!url) {
  console.error("❌ NO YOUTUBE URL PROVIDED");
  process.exit(1);
}

const outDir = "outputs/youtube_audio";
fs.mkdirSync(outDir, { recursive: true });

const cmd = [
  "yt-dlp",
  "-x",
  "--audio-format mp3",
  "--audio-quality 0",
  "-o",
  `"${outDir}/%(title)s.%(ext)s"`,
  `"${url}"`
].join(" ");

try {
  execSync(cmd, { stdio: "inherit" });
  console.log("🎧 AUDIO EXTRACTION COMPLETE");
} catch (e) {
  console.error("❌ AUDIO EXTRACTION FAILED");
  process.exit(1);
}
