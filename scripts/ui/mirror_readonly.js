import fs from "fs";
import path from "path";

const SOURCE_DIR = "Notion_Injection";
const TARGET_DIR = "public/ui";

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

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  const files = fs.readdirSync(SOURCE_DIR);

  files.forEach(file => {
    const src = path.join(SOURCE_DIR, file);
    const dst = path.join(TARGET_DIR, file);

    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, dst);
      console.log(`→ mirrored ${file}`);
    }
  });

  console.log("✅ UI READ-ONLY MIRROR COMPLETE");
}

run();
