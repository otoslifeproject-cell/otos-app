/* =========================================================
   OTOS — ANDY ENGINE v6.2
   PROJECT BUILDER (ACTIONS → TASKS → PROJECTS)
   Purpose: Auto-group classified docs into Tasks + Projects
   Scope: Local synthesis only (no writes yet)
   Location: otos-app/docs/andy-project-builder.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARD ---------- */
  if (window.OTOS_PROJECT_BUILDER_ACTIVE) return;
  window.OTOS_PROJECT_BUILDER_ACTIVE = true;

  const CLASS_KEY = "OTOS_CLASSIFIED_DOCS";
  const PROJ_KEY  = "OTOS_PROJECTS";
  const TASK_KEY  = "OTOS_TASKS";
  const ACT_KEY   = "OTOS_ACTIVITY_STREAM";

  const classified = JSON.parse(localStorage.getItem(CLASS_KEY) || "{}");
  const projects = JSON.parse(localStorage.getItem(PROJ_KEY) || "{}");
  const tasks = JSON.parse(localStorage.getItem(TASK_KEY) || []);
  const activity = JSON.parse(localStorage.getItem(ACT_KEY) || []);

  const push = (msg) => {
    activity.push({ at: new Date().toISOString(), msg });
    localStorage.setItem(ACT_KEY, JSON.stringify(activity));
  };

  /* ---------- HEURISTIC ---------- */
  const projectFor = (doc) => {
    const n = doc.name.toLowerCase();
    if (n.includes("nhs") || n.includes("icb")) return "NHS & COMMISSIONING";
    if (n.includes("invest") || n.includes("fund")) return "FUNDING & INVESTMENT";
    if (n.includes("ui") || n.includes("design")) return "UI / PRODUCT";
    return "GENERAL";
  };

  /* ---------- BUILD ---------- */
  Object.values(classified).flat().forEach(doc => {
    if (doc.projected) return;

    const project = projectFor(doc);
    if (!projects[project]) projects[project] = { tasks: [] };

    const task = {
      name: doc.name,
      from: doc.command,
      createdAt: new Date().toISOString(),
      status: "OPEN"
    };

    projects[project].tasks.push(task);
    tasks.push(task);

    doc.projected = true;
    push(`🧩 Projected → ${project}: ${doc.name}`);
  });

  localStorage.setItem(PROJ_KEY, JSON.stringify(projects));
  localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
  localStorage.setItem(CLASS_KEY, JSON.stringify(classified));

})();
