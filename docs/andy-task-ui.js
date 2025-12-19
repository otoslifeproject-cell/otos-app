/* =========================================================
   OTOS — ANDY ENGINE v4.0
   TASK UI RENDERER + STATUS CONTROLS
   Purpose: Visualise Tasks and allow basic state changes
   Location: otos-app/docs/andy-task-ui.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARDS ---------- */
  if (localStorage.getItem("OTOS_ANDY_STATUS") !== "LIVE") return;

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

  /* ---------- TARGET ---------- */
  const surface =
    document.getElementById("right") ||
    document.getElementById("center") ||
    document.body;

  /* ---------- RENDER ---------- */
  tasks.forEach(task => {
    if (document.getElementById(`task-${task.id}`)) return;

    const box = document.createElement("div");
    box.id = `task-${task.id}`;
    box.style.marginBottom = "12px";
    box.style.padding = "14px";
    box.style.borderRadius = "14px";
    box.style.background = "#f8fafc";
    box.style.boxShadow = "0 10px 24px rgba(0,0,0,.12)";

    const title = document.createElement("div");
    title.textContent = task.title;
    title.style.fontWeight = "600";

    const meta = document.createElement("div");
    meta.textContent = `Priority ${task.priority} · ${task.status}`;
    meta.style.opacity = "0.6";
    meta.style.marginTop = "4px";

    const btn = document.createElement("button");
    btn.textContent = "Mark Done";
    btn.style.marginTop = "10px";

    btn.onclick = () => {
      task.status = "DONE";
      meta.textContent = `Priority ${task.priority} · DONE`;
      localStorage.setItem("OTOS_TASKS", JSON.stringify(tasks));
      highlight(`✅ Task completed: ${task.title}`);
    };

    box.appendChild(title);
    box.appendChild(meta);
    box.appendChild(btn);
    surface.appendChild(box);

    highlight(`🧩 Task rendered: ${task.title}`);
  });

})();
