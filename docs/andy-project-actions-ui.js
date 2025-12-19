/* =========================================================
   OTOS — ANDY ENGINE v3.8
   PROJECT ↔ ACTION EXPANDER (CLICK TO DRILL-DOWN)
   Purpose: Allow Projects to reveal their Actions on demand
   Location: otos-app/docs/andy-project-actions-ui.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARDS ---------- */
  if (localStorage.getItem("OTOS_ANDY_STATUS") !== "LIVE") return;

  /* ---------- STATE ---------- */
  const projects = JSON.parse(localStorage.getItem("OTOS_PROJECTS") || "{}");
  const actions  = JSON.parse(localStorage.getItem("OTOS_ACTIONS") || "[]");

  /* ---------- HELPERS ---------- */
  const highlight = (msg) => {
    const report = Array.from(document.querySelectorAll(".card"))
      .find(c => c.textContent.includes("Highlight"));
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
  };

  const actionsForProject = (project) =>
    actions.filter(a => project.actions.includes(a.id));

  /* ---------- BIND ---------- */
  Object.values(projects).forEach(project => {
    const box = document.getElementById(`proj-${project.id}`);
    if (!box || box._bound) return;
    box._bound = true;

    box.onclick = () => {
      let panel = box.querySelector(".actions-panel");
      if (panel) {
        panel.remove();
        highlight(`🔽 Actions hidden: ${project.title}`);
        return;
      }

      panel = document.createElement("div");
      panel.className = "actions-panel";
      panel.style.marginTop = "12px";
      panel.style.paddingTop = "10px";
      panel.style.borderTop = "1px solid #e5e7eb";

      actionsForProject(project).forEach(a => {
        const row = document.createElement("div");
        row.textContent = `• ${a.title}`;
        row.style.fontSize = "14px";
        row.style.marginTop = "4px";
        panel.appendChild(row);
      });

      box.appendChild(panel);
      highlight(`🔼 Actions shown: ${project.title}`);
    };
  });

})();
