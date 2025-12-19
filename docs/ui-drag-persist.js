/* =========================================================
   OTOS — UI CORE v1.1
   DRAG POSITION PERSISTENCE (PROJECTS + PANELS)
   Purpose: Save & restore positions across reloads
   Location: otos-app/docs/ui-drag-persist.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- CONFIG ---------- */
  const STORE_KEY = "OTOS_UI_POSITIONS";

  /* ---------- STATE ---------- */
  const positions = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");

  /* ---------- HELPERS ---------- */
  const save = () =>
    localStorage.setItem(STORE_KEY, JSON.stringify(positions));

  const applyPosition = (el, id) => {
    const p = positions[id];
    if (!p) return;
    el.style.position = "absolute";
    el.style.left = p.left;
    el.style.top = p.top;
  };

  const makeDraggable = (el, id) => {
    let sx = 0, sy = 0, ox = 0, oy = 0;

    el.onmousedown = (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      sx = e.clientX; sy = e.clientY;
      ox = el.offsetLeft; oy = el.offsetTop;

      document.onmousemove = (e) => {
        const nx = ox + (e.clientX - sx);
        const ny = oy + (e.clientY - sy);
        el.style.left = nx + "px";
        el.style.top  = ny + "px";
      };

      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
        positions[id] = { left: el.style.left, top: el.style.top };
        save();
      };
    };
  };

  /* ---------- BIND PROJECTS ---------- */
  document.querySelectorAll("[id^='proj-']").forEach(el => {
    const id = el.id;
    applyPosition(el, id);
    makeDraggable(el, id);
  });

  /* ---------- BIND PANELS ---------- */
  ["left","center","right"].forEach(col => {
    const el = document.getElementById(col);
    if (!el) return;
    const id = `col-${col}`;
    applyPosition(el, id);
    makeDraggable(el, id);
  });

  /* ---------- BOOT ---------- */
  localStorage.setItem("OTOS_UI_DRAG_PERSIST", "ACTIVE");

})();
