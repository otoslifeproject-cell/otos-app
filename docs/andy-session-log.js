/* =========================================================
   OTOS — ANDY ENGINE v5.2
   ANDY LIVE SESSION LOGGER
   Purpose: Record every LIVE session start/stop with context
   Location: otos-app/docs/andy-session-log.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- STATE ---------- */
  const KEY = "OTOS_ANDY_SESSIONS";
  const sessions = JSON.parse(localStorage.getItem(KEY) || "[]");

  /* ---------- HELPERS ---------- */
  const now = () => new Date().toISOString();

  const log = (event) => {
    sessions.push({
      event,
      at: now(),
      eye: localStorage.getItem("OTOS_PARENT_NODE"),
      quiet: localStorage.getItem("OTOS_QUIET_MODE") || "OFF"
    });
    localStorage.setItem(KEY, JSON.stringify(sessions));
  };

  /* ---------- WATCH ---------- */
  let last = localStorage.getItem("OTOS_ANDY_STATUS");

  setInterval(() => {
    const current = localStorage.getItem("OTOS_ANDY_STATUS");
    if (current !== last) {
      log(current === "LIVE" ? "START" : "STOP");
      last = current;
    }
  }, 800);

})();
