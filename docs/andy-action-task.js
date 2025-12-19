/* =========================================================
   OTOS — ANDY ENGINE v3.9
   ACTION → TASK PROMOTION + STATUS TRANSITIONS
   Purpose: Convert Actions into executable Tasks
   Location: otos-app/docs/andy-action-task.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARDS ---------- */
  if (localStorage.getItem("OTOS_ANDY_STATUS") !== "LIVE") return;

  /* ---------- STATE ---------- */
  const actions = JSON.parse(localStorage.getItem("OTOS_ACTIONS") || "[]");
  const tasks   = JSON.parse(localStorage.getItem("OTOS_TASKS") || "[]");

  /* ---------- HELPERS ---------- */
  const highlight = (msg) => {
    const report = Array.from(document.querySelectorAll(".card"))
      .find(c => c.textContent.includes("Highlight"));
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
  };

  /* ---------- PROMOTE ---------- */
  actions.forEach(action => {
    if (action._tasked) return;

    const task = {
      id: crypto.randomUUID(),
      title: action.title,
      fromAction: action.id,
      priority: action.score,
      status: "READY",
      createdAt: new Date().toISOString()
    };

    tasks.push(task);
    action._tasked = true;

    highlight(`🧩 Task created: ${task.title}`);
  });

  /* ---------- COMMIT ---------- */
  localStorage.setItem("OTOS_TASKS", JSON.stringify(tasks));
  localStorage.setItem("OTOS_ACTIONS", JSON.stringify(actions));

  highlight(`Tasks total: ${tasks.length}`);

})();
