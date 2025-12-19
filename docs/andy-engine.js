/* =========================================================
   OTOS — ANDY ENGINE v1.9
   TASK LIST SURFACE (READ-ONLY, SAFE)
   Scope: Tasks → Projects awareness (no edits)
   ========================================================= */

(() => {

  /* ---------- STATE ---------- */
  const STATE = {
    engine: "Andy v1.9",
    tasks: []
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

  /* ---------- LOAD ---------- */
  STATE.tasks = loadTasks();
  if (!STATE.tasks.length) {
    highlight("No tasks to surface");
    return;
  }

  /* ---------- SURFACE INTO UI ---------- */
  const projectsCard = cardByTitle("Projects");
  if (!projectsCard) {
    highlight("Projects card not found");
    return;
  }

  const list = document.createElement("div");
  list.style.marginTop = "8px";
  list.style.fontSize = "13px";
  list.style.color = "#0f172a";

  STATE.tasks
    .slice(0, 5)               // top 5 only (safe)
    .forEach(task => {
      const row = document.createElement("div");
      row.style.marginBottom = "6px";
      row.innerHTML = `
        <strong>${task.description}</strong><br>
        <span style="color:#475569">
          From ${task.source} · Score ${task.score}
        </span>
      `;
      list.appendChild(row);
    });

  projectsCard.appendChild(list);

  /* ---------- SIGNAL ---------- */
  highlight(`Tasks surfaced (${Math.min(STATE.tasks.length, 5)} shown)`);
  localStorage.setItem("OTOS_TASK_LIST_READY", "true");

})();
