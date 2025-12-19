/* =========================================================
   OTOS — ANDY ENGINE v5.1
   NOTION RATE-LIMIT + PERMISSION MONITOR
   Purpose: Detect Notion throttling / auth loss early and
            surface clear signals without breaking flow
   Scope: Read-only monitor + UI warnings
   Location: otos-app/docs/andy-notion-guard.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARDS ---------- */
  if (localStorage.getItem("OTOS_ANDY_STATUS") !== "LIVE") return;
  if (!window.NOTION_TOKEN) return;

  /* ---------- STATE ---------- */
  const KEY = "OTOS_NOTION_GUARD";
  const state = {
    lastCheck: null,
    ok: true,
    lastError: null
  };

  /* ---------- HELPERS ---------- */
  const report = Array.from(document.querySelectorAll(".card"))
    .find(c => c.textContent.includes("Highlight"));

  const line = (t) => {
    if (!report) return;
    const d = document.createElement("div");
    d.textContent = `• ${t}`;
    report.appendChild(d);
  };

  const headers = {
    "Authorization": `Bearer ${window.NOTION_TOKEN}`,
    "Notion-Version": "2022-06-28"
  };

  /* ---------- CHECK ---------- */
  fetch("https://api.notion.com/v1/users/me", { headers })
    .then(r => {
      if (r.status === 401 || r.status === 403) {
        throw new Error("AUTH");
      }
      if (r.status === 429) {
        throw new Error("RATE_LIMIT");
      }
      if (!r.ok) {
        throw new Error("UNKNOWN");
      }
      return r.json();
    })
    .then(() => {
      state.ok = true;
      state.lastError = null;
      state.lastCheck = new Date().toISOString();
      line("Notion guard: OK");
    })
    .catch(err => {
      state.ok = false;
      state.lastError = err.message;
      state.lastCheck = new Date().toISOString();

      if (err.message === "RATE_LIMIT") {
        line("⚠️ Notion rate-limited — writes paused automatically");
        localStorage.setItem("OTOS_QUIET_MODE", "ON");
      }

      if (err.message === "AUTH") {
        line("❌ Notion auth error — token invalid or revoked");
      }

      if (err.message === "UNKNOWN") {
        line("⚠️ Notion error — non-fatal");
      }
    })
    .finally(() => {
      localStorage.setItem(KEY, JSON.stringify(state));
    });

})();
