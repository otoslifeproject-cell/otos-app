import fs from "fs";
import path from "path";

const ROOT_DIR = ".";
const TARGET_DIR = "public/ui";

function fail(msg) {
  console.error("❌ UI MIRROR FAILED");
  console.error(msg);
  process.exit(1);
}

function run() {
  console.log("🪞 UI Read-Only Mirror starting (root HTML)");

  const files = fs.readdirSync(ROOT_DIR)
    .filter(f => f.endsWith(".html"));

  if (files.length === 0) {
    fail("No HTML files found at repo root");
  }

  fs.mkdirSync(TARGET_DIR, { recursive: true });

  for (const file of files) {
    const src = path.join(ROOT_DIR, file);
    const dst = path.join(TARGET_DIR, file);
    fs.copyFileSync(src, dst);
    console.log(`→ mirrored ${file}`);
  }

  console.log("✅ UI READ-ONLY MIRROR COMPLETE");
}

run();
