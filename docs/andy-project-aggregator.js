/* =========================================================
   OTOS — ANDY ENGINE v3.6
   PROJECT AGGREGATOR (ACTIONS → PROJECTS)
   Purpose: Group actions into Projects automatically
   Location: otos-app/docs/andy-project-aggregator.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARDS ---------- */
  if (localStorage.getItem("OTOS_ANDY_STATUS") !== "LIVE") return;

  /* ---------- STATE ---------- */
  const actions  = JSON.parse(localStorage.getItem("OTOS_ACTIONS") || "[]");
  const projects = JSON.parse(localStorage.getItem("OTOS_PROJECTS") || "{}");

  /* ---------- HELPERS ---------- */
  const highlight = (msg) => {
    const report = Array.from(document.querySelectorAll(".card"))
      .find(c => c.textContent.includes("Highlight"));
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
  };

  const projectKeyFor = (action) => {
    // Simple deterministic grouping (upgrade later)
    return action.title.split(":")[0].trim();
  };

  /* ---------- AGGREGATE ---------- */
  actions.forEach(action => {
    if (action._projected) return;

    const key = projectKeyFor(action);
    if (!projects[key]) {
      projects[key] = {
        id: crypto.randomUUID(),
        title: key,
        actions: [],
        createdAt: new Date().toISOString(),
        status: "ACTIVE"
      };
      highlight(`📁 Project created: ${key}`);
    }

    projects[key].actions.push(action.id);
    action._projected = true;
  });

  /* ---------- COMMIT ---------- */
  localStorage.setItem("OTOS_PROJECTS", JSON.stringify(projects));
  localStorage.setItem("OTOS_ACTIONS", JSON.stringify(actions));

  highlight(`Projects total: ${Object.keys(projects).length}`);

})();
