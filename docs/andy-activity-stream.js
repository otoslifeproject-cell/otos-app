/* =========================================================
   OTOS — ANDY ENGINE v4.8
   LIVE ACTIVITY STREAM (AUDIT-FRIENDLY)
   Purpose: Chronological, append-only activity log for Andy
   Location: otos-app/docs/andy-activity-stream.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARD ---------- */
  if (localStorage.getItem("OTOS_ANDY_STATUS") !== "LIVE") return;

  /* ---------- STATE ---------- */
  const KEY = "OTOS_ACTIVITY_STREAM";
  const MAX = 50;

  /* ---------- HELPERS ---------- */
  const read = () => JSON.parse(localStorage.getItem(KEY) || "[]");
  const write = (arr) => localStorage.setItem(KEY, JSON.stringify(arr));

  const log = (msg) => {
    const stream = read();
    stream.push({
      msg,
      at: new Date().toISOString()
    });
    if (stream.length > MAX) stream.shift();
    write(stream);
  };

  /* ---------- HOOKS ---------- */
  const wrap = (name, fn) => {
    if (typeof fn !== "function") return;
    window[name] = (...args) => {
      log(`${name} called`);
      return fn(...args);
    };
  };

  wrap("OTOS_INGEST", window.OTOS_INGEST);
  wrap("OTOS_CLASSIFY", window.OTOS_CLASSIFY);
  wrap("OTOS_EXTRACT_ACTIONS", window.OTOS_EXTRACT_ACTIONS);

  log("Andy activity stream LIVE");

})();
