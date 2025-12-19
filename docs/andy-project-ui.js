/* =========================================================
   OTOS — ANDY ENGINE v3.7
   PROJECT UI RENDERER (DRAGGABLE MODULES)
   Purpose: Visualise Projects as movable tiles
   Location: otos-app/docs/andy-project-ui.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARDS ---------- */
  if (localStorage.getItem("OTOS_ANDY_STATUS") !== "LIVE") return;

  /* ---------- STATE ---------- */
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

  const makeDraggable = (el) => {
    let x = 0, y = 0, dx = 0, dy = 0;
    el.onmousedown = (e) => {
      e.preventDefault();
      dx = e.clientX;
      dy = e.clientY;
      document.onmousemove = (e) => {
        e.preventDefault();
        x = dx - e.clientX;
        y = dy - e.clientY;
        dx = e.clientX;
        dy = e.clientY;
        el.style.top = (el.offsetTop - y) + "px";
        el.style.left = (el.offsetLeft - x) + "px";
      };
      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  };

  /* ---------- TARGET ---------- */
  const surface = document.getElementById("center") || document.body;

  /* ---------- RENDER ---------- */
  Object.values(projects).forEach(project => {
    if (document.getElementById(`proj-${project.id}`)) return;

    const box = document.createElement("div");
    box.id = `proj-${project.id}`;
    box.style.position = "absolute";
    box.style.top = "120px";
    box.style.left = "120px";
    box.style.padding = "18px";
    box.style.borderRadius = "16px";
    box.style.background = "white";
    box.style.boxShadow = "0 18px 40px rgba(0,0,0,.18)";
    box.style.minWidth = "260px";
    box.style.cursor = "grab";

    const title = document.createElement("h3");
    title.textContent = project.title;
    title.style.marginBottom = "6px";

    const meta = document.createElement("div");
    meta.textContent = `${project.actions.length} actions`;
    meta.style.opacity = "0.6";

    box.appendChild(title);
    box.appendChild(meta);
    surface.appendChild(box);

    makeDraggable(box);
    highlight(`📁 Project rendered: ${project.title}`);
  });

})();
