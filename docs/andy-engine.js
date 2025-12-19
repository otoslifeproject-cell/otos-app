/* =========================================================
   OTOS — ANDY ENGINE v1.4
   NOTION BUCKET PUSH (CONTROLLED / SINGLE-SHOT)
   Scope: Classified Buckets → Notion Databases
   Mode: SAFE (no retries, no loops)
   ========================================================= */

(() => {

  /* ---------- CONFIG (LOCKED) ---------- */
  const NOTION = {
    enabled: false,                 // 🔒 set TRUE only in EYE21 Parent
    version: "2022-06-28",
    databases: {
      ANALYSE: "NOTION_DB_ANALYSE_ID",
      GOLDEN: "NOTION_DB_GOLDEN_ID",
      REVENUE: "NOTION_DB_REVENUE_ID",
      CANON: "NOTION_DB_CANON_ID",
      TASK: "NOTION_DB_TASK_ID"
    }
  };

  /* ---------- STATE ---------- */
  const STATE = {
    engine: "Andy v1.4",
    sent: 0,
    skipped: 0,
    failed: 0
  };

  /* ---------- HELPERS ---------- */
  const cardByTitle = (title) =>
    Array.from(document.querySelectorAll("div"))
      .find(d => d.textContent?.trim().startsWith(title));

  const highlight = (msg) => {
    const report = cardByTitle("Running Highlight Report");
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
  };

  const getBuckets = () => {
    const raw = localStorage.getItem("OTOS_CLASSIFIED_DOCS");
    if (!raw) return null;
    try { return JSON.parse(raw); }
    catch { return null; }
  };

  const buildNotionPage = (doc, dbId) => ({
    parent: { database_id: dbId },
    properties: {
      Name: {
        title: [{ text: { content: doc.name } }]
      },
      Type: {
        select: { name: doc.type || "text" }
      },
      Size: {
        number: doc.size || 0
      },
      ImportedAt: {
        date: { start: new Date().toISOString() }
      }
    },
    children: [
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            { text: { content: doc.preview.slice(0, 1800) } }
          ]
        }
      }
    ]
  });

  /* ---------- EXECUTION ---------- */
  const buckets = getBuckets();

  if (!buckets) {
    highlight("No classified buckets found");
    return;
  }

  highlight("Preparing bucket push to Notion");

  Object.entries(buckets).forEach(([bucket, docs]) => {
    const dbId = NOTION.databases[bucket];
    if (!dbId || !docs.length) {
      STATE.skipped += docs.length;
      return;
    }

    docs.forEach(doc => {
      const payload = buildNotionPage(doc, dbId);

      if (!NOTION.enabled) {
        console.group(`Notion DRY-RUN [${bucket}] → ${doc.name}`);
        console.log(payload);
        console.groupEnd();
        STATE.sent += 1;
        highlight(`Dry-run OK: ${doc.name} → ${bucket}`);
        return;
      }

      fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${window.NOTION_TOKEN}`,
          "Notion-Version": NOTION.version,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(() => {
        STATE.sent += 1;
        highlight(`Pushed: ${doc.name} → ${bucket}`);
      })
      .catch(err => {
        STATE.failed += 1;
        highlight(`FAILED: ${doc.name}`);
        console.error(err);
      });
    });
  });

  /* ---------- FINAL ---------- */
  highlight(`Andy v1.4 complete — sent:${STATE.sent} failed:${STATE.failed}`);
  localStorage.setItem("OTOS_NOTION_PUSH_READY", "true");

})();
