/* =========================================================
   OTOS — ANDY ENGINE v2.0
   PROJECT AGGREGATION + READINESS FLAGS
   Scope: Tasks → Projects (grouped, read-only)
   No UI / CSS / layout mutation
   ========================================================= */

(() => {

  /* ---------- STATE ---------- */
  const STATE = {
    engine: "Andy v2.0",
    projects: {}
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

  const loadTasks = () => {
    const raw = localStorage.getItem("OTOS_TASKS");
    if (!raw) return [];
    try { return JSON.parse(raw); }
    catch { return []; }
  };

  /* ---------- AGGREGATION ---------- */
  const tasks = loadTasks();
  if (!tasks.length) {
    highlight("No tasks found — skipping project aggregation");
    return;
  }

  tasks.forEach(t => {
    const key = t.source || "General";
    if (!STATE.projects[key]) {
      STATE.projects[key] = {
        name: key,
        tasks: [],
        readiness: 0
      };
    }
    STATE.projects[key].tasks.push(t);
  });

  Object.values(STATE.projects).forEach(p => {
    const avgScore =
      p.tasks.reduce((s, t) => s + (t.score || 0), 0) / p.tasks.length;
    p.readiness = Math.round(avgScore);
  });

  /* ---------- PERSIST ---------- */
  localStorage.setItem(
    "OTOS_PROJECTS",
    JSON.stringify(STATE.projects, null, 2)
  );

  /* ---------- SURFACE (READ-ONLY) ---------- */
  const projectsCard = cardByTitle("Projects");
  if (projectsCard) {
    const block = document.createElement("div");
    block.style.marginTop = "8px";
    block.style.fontSize = "13px";

    Object.values(STATE.projects)
      .slice(0, 5)
      .forEach(p => {
        const row = document.createElement("div");
        row.style.marginBottom = "6px";
        row.innerHTML = `
          <strong>${p.name}</strong><br>
          <span style="color:#475569">
            Tasks ${p.tasks.length} · Readiness ${p.readiness}/10
          </span>
        `;
        block.appendChild(row);
      });

    projectsCard.appendChild(block);
  }

  /* ---------- SIGNAL ---------- */
  highlight(`Projects aggregated (${Object.keys(STATE.projects).length})`);
  localStorage.setItem("OTOS_PROJECTS_READY", "true");

})();
