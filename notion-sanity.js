/* =========================================================
   OTOS — ANDY ENGINE v2.6
   NOTION CREDENTIAL SANITY + DRY-RUN VERIFY
   Scope: Verify token, DB IDs, permissions (NO WRITES)
   Behaviour only. No UI / CSS changes.
   Location: otos-app/docs/notion-sanity.js
   ========================================================= */

(() => {

  /* ---------- CONFIG ---------- */
  const NOTION = {
    version: "2022-06-28",
    endpoint: "https://api.notion.com/v1/databases/",
    databases: {
      ANALYSE: "NOTION_DB_ANALYSE_ID",
      GOLDEN: "NOTION_DB_GOLDEN_ID",
      REVENUE: "NOTION_DB_REVENUE_ID",
      CANON:  "NOTION_DB_CANON_ID",
      TASK:   "NOTION_DB_TASK_ID"
    }
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

  const hasToken = () => typeof window.NOTION_TOKEN === "string" && window.NOTION_TOKEN.length > 10;

  /* ---------- EXECUTION ---------- */
  if (!hasToken()) {
    highlight("Notion sanity: MISSING token");
    localStorage.setItem("OTOS_NOTION_SANITY", "FAILED_TOKEN");
    return;
  }

  highlight("Notion sanity: token present");

  const headers = {
    "Authorization": `Bearer ${window.NOTION_TOKEN}`,
    "Notion-Version": NOTION.version
  };

  const checks = Object.entries(NOTION.databases);

  Promise.all(
    checks.map(([key, dbId]) =>
      fetch(`${NOTION.endpoint}${dbId}`, { headers })
        .then(r => r.ok ? "OK" : Promise.reject(r.status))
        .then(() => {
          highlight(`Notion DB ${key}: OK`);
          return true;
        })
        .catch(err => {
          highlight(`Notion DB ${key}: FAIL (${err})`);
          return false;
        })
    )
  ).then(results => {
    const allGood = results.every(Boolean);
    localStorage.setItem(
      "OTOS_NOTION_SANITY",
      allGood ? "OK" : "PARTIAL"
    );
    highlight(`Notion sanity complete: ${allGood ? "ALL OK" : "ISSUES FOUND"}`);
  });

})();
