/* =========================================================
   OTOS — UI INTERACTION v1.0
   DRAG + SNAP MODULES (GRAB HANDLE)
   Purpose: Make UI cards draggable with snap-to-columns
   Location: otos-app/docs/ui-drag-snap.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARD ---------- */
  if (window.OTOS_UI_DRAG_ACTIVE) return;
  window.OTOS_UI_DRAG_ACTIVE = true;

  /* ---------- CONFIG ---------- */
  const SNAP_MARGIN = 40;
  const columns = ["left", "center", "right"]
    .map(id => document.getElementById(id))
    .filter(Boolean);

  /* ---------- STYLE ---------- */
  const style = document.createElement("style");
  style.textContent = `
    .otos-card { position: relative; }
    .otos-grab {
      position:absolute; top:10px; right:10px;
      width:14px; height:14px; border-radius:50%;
      background:#64748b; cursor:grab; opacity:.7;
    }
    .otos-dragging { opacity:.85; z-index:9999; }
  `;
  document.head.appendChild(style);

  /* ---------- APPLY ---------- */
  const cards = document.querySelectorAll(".card, .otos-card");
  cards.forEach(card => {
    if (card.querySelector(".otos-grab")) return;

    card.classList.add("otos-card");

    const grab = document.createElement("div");
    grab.className = "otos-grab";
    card.appendChild(grab);

    let dragging = false, ox = 0, oy = 0;

    grab.onmousedown = e => {
      dragging = true;
      ox = e.clientX - card.getBoundingClientRect().left;
      oy = e.clientY - card.getBoundingClientRect().top;
      card.classList.add("otos-dragging");
      card.style.position = "fixed";
    };

    document.onmousemove = e => {
      if (!dragging) return;
      card.style.left = `${e.clientX - ox}px`;
      card.style.top  = `${e.clientY - oy}px`;
    };

    document.onmouseup = () => {
      if (!dragging) return;
      dragging = false;
      card.classList.remove("otos-dragging");

      const rect = card.getBoundingClientRect();
      let snapped = false;

      columns.forEach(col => {
        const r = col.getBoundingClientRect();
        if (rect.left > r.left - SNAP_MARGIN && rect.right < r.right + SNAP_MARGIN) {
          col.appendChild(card);
          card.style.position = "relative";
          card.style.left = card.style.top = "";
          snapped = true;
        }
      });

      if (!snapped) {
        card.style.position = "relative";
        card.style.left = card.style.top = "";
      }
    };
  });

})();
