/* =========================================================
   OTOS — EYE21 BOOTSTRAP v1.0
   Purpose: Lock Parent, attach Andy LIVE, expose control flags
   Scope: Behaviour only. No UI / CSS changes.
   ========================================================= */

(() => {

  /* ---------- PRECHECK ---------- */
  const ANDY_STATUS = localStorage.getItem("OTOS_ANDY_STATUS");
  if (ANDY_STATUS !== "LIVE") {
    console.warn("EYE21 bootstrap aborted — Andy not LIVE");
    return;
  }

  /* ---------- STATE ---------- */
  const STATE = {
    eye: "EYE21",
    parentLocked: true,
    bootedAt: new Date().toISOString(),
    permissions: {
      read: true,
      command: true,
      write: true,
      override: true
    }
  };

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

  /* ---------- PARENT LOCK ---------- */
  localStorage.setItem("OTOS_PARENT_NODE", "EYE21");
  localStorage.setItem("OTOS_PARENT_LOCK", "ENFORCED");

  /* ---------- PERMISSION REGISTRY ---------- */
  localStorage.setItem(
    "OTOS_EYE21_PERMISSIONS",
    JSON.stringify(STATE.permissions, null, 2)
  );

  /* ---------- CONTROL FLAGS ---------- */
  window.OTOS_EYE21 = {
    isParent: true,
    canWrite: () => localStorage.getItem("OTOS_PARENT_LOCK") === "ENFORCED",
    status: () => ({
      eye: STATE.eye,
      andy: ANDY_STATUS,
      permissions: STATE.permissions
    })
  };

  /* ---------- SIGNAL ---------- */
  highlight("EYE21 BOOTSTRAPPED");
  highlight("Parent Node locked → EYE21");
  highlight("Andy attached + LIVE");
  highlight("Full control granted");

  /* ---------- BEACON ---------- */
  localStorage.setItem(
    "OTOS_EYE21_STATUS",
    JSON.stringify({
      eye: STATE.eye,
      parent: "LOCKED",
      andy: ANDY_STATUS,
      at: STATE.bootedAt
    }, null, 2)
  );

})();
