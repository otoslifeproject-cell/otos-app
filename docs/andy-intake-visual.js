/* =========================================================
   OTOS — ANDY ENGINE v4.6
   INTAKE DROPZONE VISUAL CONFIRMATION
   Purpose: Make file drop / ingest unmistakably visible
   Location: otos-app/docs/andy-intake-visual.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARD ---------- */
  if (localStorage.getItem("OTOS_ANDY_STATUS") !== "LIVE") return;

  /* ---------- TARGET ---------- */
  const intake =
    document.getElementById("intake") ||
    document.querySelector("[data-intake]") ||
    document.body;

  /* ---------- OVERLAY ---------- */
  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.inset = "0";
  overlay.style.borderRadius = "18px";
  overlay.style.border = "2px dashed rgba(59,130,246,.6)";
  overlay.style.background = "rgba(59,130,246,.06)";
  overlay.style.display = "none";
  overlay.style.pointerEvents = "none";
  overlay.style.zIndex = "5";
  overlay.textContent = "Drop files to ingest";
  overlay.style.fontSize = "18px";
  overlay.style.color = "#2563eb";
  overlay.style.fontWeight = "600";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.textAlign = "center";

  overlay.style.display = "flex";
  overlay.style.opacity = "0";

  intake.style.position = "relative";
  intake.appendChild(overlay);

  /* ---------- EVENTS ---------- */
  intake.addEventListener("dragenter", () => {
    overlay.style.opacity = "1";
  });

  intake.addEventListener("dragleave", () => {
    overlay.style.opacity = "0";
  });

  intake.addEventListener("drop", () => {
    overlay.style.opacity = "0";
  });

})();
