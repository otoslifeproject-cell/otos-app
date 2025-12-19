/* =========================================================
   OTOS — ANDY ENGINE v4.1
   TASK → NOTION SYNC (SAFE, ONE-WAY)
   Purpose: Persist Tasks to Notion Task DB once completed
   Location: otos-app/docs/andy-task-notion-sync.js
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
    db: "NOTION_DB_TASK_ID"
  };

  /* ---------- STATE ---------- */
  const tasks = JSON.parse(localStorage.getItem("OTOS_TASKS") || "[]");

  /* ---------- HELPERS ---------- */
  const highlight = (msg) => {
    const report = Array.from(document.querySelectorAll(".card"))
      .find(c => c.textContent.includes("Highlight"));
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
  };

  const buildPage = (task) => ({
    parent: { database_id: NOTION.db },
    properties: {
      Name: { title: [{ text: { content: task.title } }] },
      Priority: { number: task.priority },
      Status: { select: { name: task.status } },
      CompletedAt: task.status === "DONE"
        ? { date: { start: new Date().toISOString() } }
        : undefined
    }
  });

  /* ---------- SYNC ---------- */
  tasks.forEach(task => {
    if (task._synced || task.status !== "DONE") return;

    fetch(NOTION.endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${window.NOTION_TOKEN}`,
        "Notion-Version": NOTION.version,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildPage(task))
    })
    .then(r => r.ok ? r.json() : Promise.reject(r))
    .then(() => {
      task._synced = true;
      highlight(`📤 Task synced to Notion: ${task.title}`);
      localStorage.setItem("OTOS_TASKS", JSON.stringify(tasks));
    })
    .catch(() => {
      highlight(`❌ Task sync failed: ${task.title}`);
    });
  });

})();
