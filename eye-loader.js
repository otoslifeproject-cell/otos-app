/* =========================================================
   OTOS — CONTROLLED LOADER v1.0
   Purpose: Manually attach EYE21 bootstrap from UI
   Scope: Safe, opt-in, Parent-only
   Location: otos-app/docs/eye-loader.js
   ========================================================= */

(() => {

  /* ---------- GUARD ---------- */
  if (window.OTOS_EYE21_LOADED) return;
  window.OTOS_EYE21_LOADED = true;

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

  /* ---------- BUTTON INJECTION (SAFE) ---------- */
  const parentCard = cardByTitle("Parent Node");
  if (!parentCard) {
    console.warn("Parent Node card not found");
    return;
  }

  const btn = document.createElement("button");
  btn.textContent = "Enter EYE21 (Parent)";
  btn.style.marginTop = "10px";

  parentCard.appendChild(btn);

  /* ---------- ACTION ---------- */
  btn.onclick = () => {
    if (localStorage.getItem("OTOS_ANDY_STATUS") !== "LIVE") {
      highlight("Cannot enter EYE21 — Andy not LIVE");
      return;
    }

    highlight("Authorising EYE21 bootstrap…");

    const s = document.createElement("script");
    s.src = "../eye21-bootstrap.js";
    s.onload = () => highlight("EYE21 bootstrap loaded");
    s.onerror = () => highlight("FAILED to load EYE21 bootstrap");

    document.body.appendChild(s);
  };

  /* ---------- READY ---------- */
  highlight("Parent loader ready");

})();
