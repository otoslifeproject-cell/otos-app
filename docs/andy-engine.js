/* =========================================================
   OTOS — ANDY ENGINE v2.4
   NOTION WRITE EXECUTOR (GUARDED)
   Scope: Execute queued writes ONLY when LIVE guard passes
   Behaviour only. No UI / CSS changes.
   ========================================================= */

(() => {

  /* ---------- CONFIG ---------- */
  const NOTION = {
    endpoint: "https://api.notion.com/v1/pages",
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
    engine: "Andy v2.4",
    sent: 0,
    failed: 0
  };

  /* ---------- HELPERS ---------- */
  const cardByTitle = (title) =>
    Array.from(document.querySelectorAll(".card"))
      .find(c => c.querySelector("h3")?.textContent.trim() === title);

  const highlight = (msg) => {
    const report = cardByTitle("Running Highlight Report");
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
  };

  const canWrite = () =>
    typeof window.OTOS_CAN_WRITE_NOTION === "function" &&
    window.OTOS_CAN_WRITE_NOTION() === true;

  const getBuckets = () => {
    const raw = localStorage.getItem("OTOS_CLASSIFIED_DOCS");
    if (!raw) return null;
    try { return JSON.parse(raw); }
    catch { return null; }
  };

  const buildNotionPage = (doc, dbId) => ({
    parent: { database_id: dbId },
    properties: {
      Name: { title: [{ text: { content: doc.name } }] },
      Type: { select: { name: doc.type || "text" } },
      Size: { number: doc.size || 0 },
      ImportedAt: { date: { start: new Date().toISOString() } }
    },
    children: [
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ text: { content: doc.preview.slice(0, 1800) } }]
        }
      }
    ]
  });

  /* ---------- EXECUTION ---------- */
  if (!canWrite()) {
    highlight("Write executor idle (SAFE MODE)");
    return;
  }

  const buckets = getBuckets();
  if (!buckets) {
    highlight("No classified buckets to write");
    return;
  }

  highlight("LIVE WRITE ENABLED — pushing to Notion");

  Object.entries(buckets).forEach(([bucket, docs]) => {
    const dbId = NOTION.databases[bucket];
    if (!dbId || !docs.length) return;

    docs.forEach(doc => {
      const payload = buildNotionPage(doc, dbId);

      fetch(NOTION.endpoint, {
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
        highlight(`LIVE → ${doc.name} → ${bucket}`);
      })
      .catch(err => {
        STATE.failed += 1;
        highlight(`FAILED → ${doc.name}`);
        console.error(err);
      });
    });
  });

  /* ---------- FINAL ---------- */
  localStorage.setItem(
    "OTOS_NOTION_WRITE_STATUS",
    JSON.stringify({ sent: STATE.sent, failed: STATE.failed }, null, 2)
  );

  highlight(`Notion write complete (sent:${STATE.sent} failed:${STATE.failed})`);

})();
