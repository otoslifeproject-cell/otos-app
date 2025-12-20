/* ============================================================
   ANDY STATS SYNC v1
   ------------------------------------------------------------
   Purpose:
   - Maintain authoritative stats for Andy execution
   - Sync processed / queue counters to UI
   - Survive refresh via localStorage
   ============================================================ */

(function () {
  const KEY = "OTOS_ANDY_STATS";

  const DEFAULT = {
    processed: 0,
    queue: 0
  };

  function load() {
    try {
      return { ...DEFAULT, ...(JSON.parse(localStorage.getItem(KEY)) || {}) };
    } catch {
      return { ...DEFAULT };
    }
  }

  function save(stats) {
    localStorage.setItem(KEY, JSON.stringify(stats));
  }

  function render(stats) {
    const processedEl =
      document.querySelector("[data-stat='processed']") ||
      findStatByLabel("processed");

    const queueEl =
      document.querySelector("[data-stat='queue']") ||
      findStatByLabel("queue");

    if (processedEl) processedEl.textContent = stats.processed;
    if (queueEl) queueEl.textContent = stats.queue;
  }

  function findStatByLabel(label) {
    const cards = Array.from(document.querySelectorAll(".card"));
    for (const c of cards) {
      if ((c.textContent || "").toLowerCase().includes(label)) {
        const v = c.querySelector(".value");
        if (v) return v;
      }
    }
    return null;
  }

  let STATS = load();
  render(STATS);

  /* ------------------------------
     EVENTS
     ------------------------------ */

  document.addEventListener("andy:intake", () => {
    STATS.queue += 1;
    save(STATS);
    render(STATS);
  });

  document.addEventListener("andy:processed", () => {
    STATS.queue = Math.max(0, STATS.queue - 1);
    STATS.processed += 1;
    save(STATS);
    render(STATS);
  });

  /* ------------------------------
     SAFETY SYNC (PAGE LOAD)
     ------------------------------ */

  window.addEventListener("load", () => {
    STATS = load();
    render(STATS);
  });

  console.log("[ANDY STATS] Live stats active.");
})();
