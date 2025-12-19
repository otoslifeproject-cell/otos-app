/* =========================================================
   OTOS — UI INTERACTION v1.2
   CARD FOCUS MODE (SINGLE ACTION)
   Purpose: Expand / focus one card, dim all others
   Location: otos-app/docs/ui-card-focus.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARD ---------- */
  if (window.OTOS_UI_CARD_FOCUS_ACTIVE) return;
  window.OTOS_UI_CARD_FOCUS_ACTIVE = true;

  /* ---------- STYLE ---------- */
  const style = document.createElement("style");
  style.textContent = `
    .otos-dimmed { opacity: 0.15; pointer-events:none; }
    .otos-focused {
      position:fixed !important;
      top:8%; left:50%;
      transform:translateX(-50%);
      width:60vw; max-width:900px;
      z-index:10000;
      box-shadow:0 60px 120px rgba(0,0,0,.65) !important;
    }
    .otos-focus-btn {
      position:absolute; bottom:10px; right:10px;
      padding:6px 10px; font-size:11px;
      border-radius:10px; border:0;
      background:#3b82f6; color:white;
      cursor:pointer;
    }
  `;
  document.head.appendChild(style);

  /* ---------- APPLY ---------- */
  const cards = document.querySelectorAll(".card, .otos-card");

  cards.forEach(card => {
    if (card.querySelector(".otos-focus-btn")) return;

    const btn = document.createElement("button");
    btn.className = "otos-focus-btn";
    btn.textContent = "Focus";

    btn.onclick = () => {
      const focused = card.classList.contains("otos-focused");

      document.querySelectorAll(".card, .otos-card").forEach(c => {
        c.classList.remove("otos-focused","otos-dimmed");
      });

      if (!focused) {
        card.classList.add("otos-focused");
        document.querySelectorAll(".card, .otos-card")
          .forEach(c => { if (c !== card) c.classList.add("otos-dimmed"); });
        btn.textContent = "Close";
      } else {
        btn.textContent = "Focus";
      }
    };

    card.appendChild(btn);
  });

})();
