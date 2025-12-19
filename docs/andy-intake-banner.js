/* =========================================================
   OTOS — ANDY ENGINE v4.7
   INTAKE CONFIRMATION BANNER (NON-INTRUSIVE)
   Purpose: Give unmistakable “it worked” feedback after ingest
   Location: otos-app/docs/andy-intake-banner.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARD ---------- */
  if (localStorage.getItem("OTOS_ANDY_STATUS") !== "LIVE") return;

  /* ---------- STATE ---------- */
  let banner;

  /* ---------- HELPERS ---------- */
  const showBanner = (text) => {
    if (!banner) {
      banner = document.createElement("div");
      banner.style.position = "fixed";
      banner.style.bottom = "24px";
      banner.style.right = "24px";
      banner.style.padding = "14px 18px";
      banner.style.borderRadius = "14px";
      banner.style.background = "linear-gradient(180deg,#0ea5e9,#0284c7)";
      banner.style.color = "white";
      banner.style.boxShadow = "0 18px 36px rgba(0,0,0,.25)";
      banner.style.fontSize = "14px";
      banner.style.fontWeight = "600";
      banner.style.zIndex = "9999";
      document.body.appendChild(banner);
    }

    banner.textContent = text;
    banner.style.opacity = "1";

    setTimeout(() => {
      banner.style.opacity = "0";
    }, 1400);
  };

  /* ---------- HOOK ---------- */
  const original = window.OTOS_INGEST;
  if (typeof original !== "function") return;

  window.OTOS_INGEST = (files, cmd) => {
    showBanner(`Ingested ${files.length} file${files.length > 1 ? "s" : ""}`);
    return original(files, cmd);
  };

})();
