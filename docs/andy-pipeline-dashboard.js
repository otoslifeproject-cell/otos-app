/* =========================================================
   OTOS — ANDY ENGINE v4.5
   LIVE PIPELINE DASHBOARD (ONE-GLANCE CONFIRMATION)
   Purpose: Show real-time counts for each pipeline stage
   Location: otos-app/docs/andy-pipeline-dashboard.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARDS ---------- */
  if (localStorage.getItem("OTOS_ANDY_STATUS") !== "LIVE") return;

  /* ---------- TARGET ---------- */
  const host =
    document.getElementById("left") ||
    document.body;

  /* ---------- PANEL ---------- */
  const panel = document.createElement("div");
  panel.style.padding = "16px";
  panel.style.borderRadius = "14px";
  panel.style.background = "#0b1220";
  panel.style.color = "#e5e7eb";
  panel.style.boxShadow = "0 18px 36px rgba(0,0,0,.25)";
  panel.style.marginBottom = "12px";
  panel.style.fontSize = "14px";

  const title = document.createElement("div");
  title.textContent = "Andy · Live Pipeline";
  title.style.fontWeight = "600";
  title.style.marginBottom = "8px";
  panel.appendChild(title);

  const rows = {
    staged: document.createElement("div"),
    classified: document.createElement("div"),
    actions: document.createElement("div"),
    projects: document.createElement("div"),
    tasks: document.createElement("div")
  };

  Object.values(rows).forEach(r => {
    r.style.marginTop = "4px";
    panel.appendChild(r);
  });

  host.prepend(panel);

  /* ---------- UPDATE ---------- */
  const read = () => {
    const staged = JSON.parse(localStorage.getItem("OTOS_STAGED_DOCS") || "[]").length;
    const classified = Object.values(
      JSON.parse(localStorage.getItem("OTOS_CLASSIFIED_DOCS") || "{}")
    ).flat().length;
    const actions = JSON.parse(localStorage.getItem("OTOS_ACTIONS") || "[]").length;
    const projects = Object.keys(
      JSON.parse(localStorage.getItem("OTOS_PROJECTS") || "{}")
    ).length;
    const tasks = JSON.parse(localStorage.getItem("OTOS_TASKS") || "[]").length;

    rows.staged.textContent     = `Staged: ${staged}`;
    rows.classified.textContent = `Classified: ${classified}`;
    rows.actions.textContent    = `Actions: ${actions}`;
    rows.projects.textContent   = `Projects: ${projects}`;
    rows.tasks.textContent      = `Tasks: ${tasks}`;
  };

  read();
  setInterval(read, 1000);

})();
