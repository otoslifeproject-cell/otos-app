/* ============================================================
   ANDY RUNNING HIGHLIGHT REPORT v1
   ------------------------------------------------------------
   Purpose:
   - Maintain a calm, readable “what just happened” feed
   - ND-safe: no flashing, no spam, last-good-signal wins
   - Consolidates intake, tier-2 prep, archive, and EYE21 state
   ============================================================ */

(function () {
  const KEY = "OTOS_ANDY_HIGHLIGHT";

  function load() {
    return localStorage.getItem(KEY) || "";
  }

  function save(text) {
    localStorage.setItem(KEY, text);
  }

  function set(text) {
    save(text);
    render(text);
  }

  function render(text) {
    const el =
      document.querySelector("[data-andy-highlight]") ||
      document.querySelector("[data-highlight]") ||
      findHighlightValue();

    if (!el) return;
    el.textContent = text;
  }

  function findHighlightValue() {
    const cards = Array.from(document.querySelectorAll(".card"));
    const card = cards.find(c =>
      (c.textContent || "").toLowerCase().includes("running highlight")
    );
    if (!card) return null;
    return card.querySelector(".value") || card;
  }

  /* ------------------------------
     EVENT SOURCES
     ------------------------------ */

  document.addEventListener("andy:intake", (e) => {
    const d = e.detail || {};
    set(`Ingested: ${d.name || "file"} • commands ${Array.isArray(d.commands) && d.commands.length ? d.commands.join(", ") : "none"}`);
  });

  document.addEventListener("andy:tier2-ready", (e) => {
    const d = e.detail || {};
    set(`Prepared for Notion: ${d.filename || "record"} • Tier-2 ready`);
  });

  document.addEventListener("andy:archive", () => {
    set("Tier-3 archive updated");
  });

  document.addEventListener("eye21:enter", () => {
    set("EYE21 ACTIVE • Parent enabled");
  });

  document.addEventListener("eye21:exit", () => {
    set("EYE21 exited • Parent disabled");
  });

  /* ------------------------------
     INITIAL RENDER
     ------------------------------ */

  render(load() || "System ready • Awaiting action");

  console.log("[ANDY HIGHLIGHT] Running report active.");
})();
