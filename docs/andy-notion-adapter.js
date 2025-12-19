/* =========================================================
   OTOS — ANDY ENGINE v3.1
   NOTION INTAKE ADAPTER (SAFE WRITE, GUARDED)
   Purpose: Push Tier-1 classified docs into Notion Intake DB
   Location: otos-app/docs/andy-notion-adapter.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARDS ---------- */
  if (localStorage.getItem("OTOS_ANDY_STATUS") !== "LIVE") return;
  if (!window.NOTION_TOKEN) return;

  /* ---------- CONFIG ---------- */
  const NOTION = {
    endpoint: "https://api.notion.com/v1/pages",
    version: "2022-06-28",
    databases: {
      ANALYSE: "NOTION_DB_ANALYSE_ID",
      GOLDEN:  "NOTION_DB_GOLDEN_ID",
      REVENUE: "NOTION_DB_REVENUE_ID",
      CANON:   "NOTION_DB_CANON_ID",
      TASK:    "NOTION_DB_TASK_ID"
    }
  };

  /* ---------- HELPERS ---------- */
  const highlight = (msg) => {
    const report = Array.from(document.querySelectorAll(".card"))
      .find(c => c.textContent.includes("Highlight"));
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
  };

  const buildPage = (doc, dbId) => ({
    parent: { database_id: dbId },
    properties: {
      Name: { title: [{ text: { content: doc.name } }] },
      Command: { select: { name: doc.command } },
      Size: { number: doc.size || 0 },
      ImportedAt: { date: { start: new Date().toISOString() } }
    },
    children: [{
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{ text: { content: `Imported via Andy\n\n${doc.name}` } }]
      }
    }]
  });

  /* ---------- LOAD ---------- */
  const classified = JSON.parse(localStorage.getItem("OTOS_CLASSIFIED_DOCS") || "{}");
  let sent = 0;

  Object.entries(classified).forEach(([bucket, docs]) => {
    const dbId = NOTION.databases[bucket];
    if (!dbId || !docs?.length) return;

    docs.forEach(doc => {
      fetch(NOTION.endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${window.NOTION_TOKEN}`,
          "Notion-Version": NOTION.version,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(buildPage(doc, dbId))
      })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(() => {
        sent++;
        highlight(`🧠 → Notion: ${doc.name} (${bucket})`);
      })
      .catch(() => {
        highlight(`❌ Notion failed: ${doc.name}`);
      });
    });
  });

  /* ---------- FINAL ---------- */
  localStorage.setItem(
    "OTOS_NOTION_WRITE_STATUS",
    JSON.stringify({ sent, at: new Date().toISOString() })
  );

  highlight(`Notion adapter complete (sent: ${sent})`);

})();
