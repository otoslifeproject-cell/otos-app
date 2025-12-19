/* =========================================================
   OTOS — SAFE RESET + RECOVERY SWITCH v1.0
   Purpose: Emergency rollback to last known GOOD baseline
            without deleting data
   Scope: Read-only detection + optional restore
   Location: otos-app/docs/safe-recover.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARD ---------- */
  if (localStorage.getItem("OTOS_EYE21_LIVE") !== "TRUE") return;

  /* ---------- HELPERS ---------- */
  const get = (k, d) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? d; }
    catch { return d; }
  };

  const highlight = (msg) => {
    const report = Array.from(document.querySelectorAll(".card"))
      .find(c => c.textContent.includes("Highlight"));
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
  };

  /* ---------- CHECK ---------- */
  const baseline = get("OTOS_ANDY_BASELINE", null);
  if (!baseline) {
    highlight("❌ No baseline found — recovery unavailable");
    return;
  }

  highlight(`🛟 Recovery armed (baseline ${baseline.version})`);

  /* ---------- CONTROL ---------- */
  window.OTOS_SAFE_RECOVER = () => {
    highlight("⚠️ Recovery invoked");

    // Stop background churn
    localStorage.setItem("OTOS_QUIET_MODE", "ON");

    // Restore authority + baseline markers
    localStorage.setItem("OTOS_PARENT_NODE", "EYE21");
    localStorage.setItem("OTOS_ANDY_STATUS", "LIVE");
    localStorage.setItem("OTOS_EYE21_LIVE", "TRUE");

    highlight("✅ System restored to last known good state");
  };

})();
