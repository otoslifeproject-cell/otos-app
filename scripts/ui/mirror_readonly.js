import fs from "fs";
import path from "path";

const SOURCE_DIR = "ui";           // CANONICAL SOURCE (REPO TRACKED)
const TARGET_DIR = "public/ui";    // READ-ONLY MIRROR TARGET

function fail(msg) {
  console.error("❌ UI MIRROR FAILED");
  console.error(msg);
  process.exit(1);
}

function run() {
  console.log("🪞 UI Read-Only Mirror starting");

  if (!fs.existsSync(SOURCE_DIR)) {
    fail(`Source folder missing: ${SOURCE_DIR}`);
  }

  const files = fs.readdirSync(SOURCE_DIR).filter(f =>
    fs.statSync(path.join(SOURCE_DIR, f)).isFile()
  );

  if (files.length === 0) {
    fail("No UI files found in source folder");
  }

  fs.mkdirSync(TARGET_DIR, { recursive: true });

  for (const file of files) {
    const src = path.join(SOURCE_DIR, file);
    const dst = path.join(TARGET_DIR, file);
    fs.copyFileSync(src, dst);
    console.log(`→ mirrored ${file}`);
  }

  console.log("✅ UI READ-ONLY MIRROR COMPLETE");
}

run();
