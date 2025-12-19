/* =========================================================
   OTOS — ANDY ENGINE v5.8
   NOTION WRITE EXECUTOR (PIPELINE RUNNER)
   Purpose: Actually execute pending Notion writes safely
            when Flush has been requested
   Location: otos-app/docs/andy-notion-writer.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARDS ---------- */
  if (!window.OTOS_CAN_WRITE_NOTION || !window.OTOS_CAN_WRITE_NOTION()) return;
  if (!window.NOTION_TOKEN) return;

  /* ---------- CONFIG ---------- */
  const NOTION_VERSION = "2022-06-28";
  const ENDPOINT = "https://api.notion.com/v1/pages";

  const DBS = {
    ANALYSE: "NOTION_DB_ANALYSE_ID",
    GOLDEN:  "NOTION_DB_GOLDEN_ID",
    REVENUE: "NOTION_DB_REVENUE_ID",
    CANON:   "NOTION_DB_CANON_ID",
    TASK:    "NOTION_DB_TASK_ID"
  };

  /* ---------- KEYS ---------- */
  const CLASS_KEY = "OTOS_CLASSIFIED_DOCS";
  const ACT_KEY   = "OTOS_ACTIVITY_STREAM";

  const classified = JSON.parse(localStorage.getItem(CLASS_KEY) || "{}");
  const activity   = JSON.parse(localStorage.getItem(ACT_KEY) || "[]");

  /* ---------- HELPERS ---------- */
  const push = (msg) => {
    activity.push({ at: new Date().toISOString(), msg });
    localStorage.setItem(ACT_KEY, JSON.stringify(activity));
  };

  const buildPage = (doc, dbId) => ({
    parent: { database_id: dbId },
    properties: {
      Name: { title: [{ text: { content: doc.name } }] },
      Source: { select: { name: "Andy" } },
      Size: { number: doc.size || 0 },
      Imported: { date: { start: new Date().toISOString() } }
    }
  });

  /* ---------- EXECUTE ---------- */
  Object.entries(classified).forEach(([bucket, docs]) => {
    const dbId = DBS[bucket];
    if (!dbId) return;

    docs.forEach(doc => {
      if (doc.written) return;

      fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${window.NOTION_TOKEN}`,
          "Notion-Version": NOTION_VERSION,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(buildPage(doc, dbId))
      })
      .then(r => {
        if (!r.ok) throw new Error("WRITE_FAIL");
        return r.json();
      })
      .then(() => {
        doc.written = true;
        push(`🧠 Written → Notion (${bucket}): ${doc.name}`);
        localStorage.setItem(CLASS_KEY, JSON.stringify(classified));
      })
      .catch(() => {
        push(`❌ Notion write failed: ${doc.name}`);
      });
    });
  });

})();
