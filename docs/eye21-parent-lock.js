/* ============================================================
   EYE21 PARENT LOCK v1
   ------------------------------------------------------------
   Purpose:
   - Define EYE21 readiness state
   - Enforce Parent-only authority boundaries
   - Gate execution behind explicit Parent enable
   - Provide observable, reversible lock (no hard freeze)
   ============================================================ */

(function () {
  const KEY = "OTOS_EYE21_STATE";

  const DEFAULT = {
    mode: "PRE_EYE21",        // PRE_EYE21 | EYE21_ACTIVE
    parentEnabled: false,     // explicit toggle
    enteredAt: null,
    notes: ""
  };

  function load() {
    try {
      return { ...DEFAULT, ...(JSON.parse(localStorage.getItem(KEY)) || {}) };
    } catch {
      return { ...DEFAULT };
    }
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state, null, 2));
  }

  function setHighlight(msg) {
    const el =
      document.querySelector("[data-andy-highlight]") ||
      document.querySelector("[data-highlight]") ||
      findHighlightCardValue();

    if (el) el.textContent = msg;
  }

  function findHighlightCardValue() {
    const cards = Array.from(document.querySelectorAll(".card"));
    const card = cards.find(c =>
      (c.textContent || "").toLowerCase().includes("running highlight")
    );
    if (!card) return null;
    return card.querySelector(".value") || card;
  }

  let STATE = load();

  /* ------------------------------
     GUARDS
     ------------------------------ */

  function requireParent() {
    if (!STATE.parentEnabled) {
      alert("Parent mode not enabled. Action blocked.");
      return false;
    }
    return true;
  }

  // Soft gate Andy execution (token issue/revoke already exists)
  document.addEventListener("andy:intake", () => {
    if (!STATE.parentEnabled) {
      console.warn("[EYE21] Intake observed while Parent disabled.");
    }
  });

  /* ------------------------------
     PUBLIC CONTROLS
     ------------------------------ */

  function enterEye21(note = "") {
    STATE.mode = "EYE21_ACTIVE";
    STATE.parentEnabled = true;
    STATE.enteredAt = new Date().toISOString();
    STATE.notes = note;
    save(STATE);
    setHighlight("EYE21 ACTIVE • Parent enabled");
    console.log("[EYE21] Entered:", STATE);
  }

  function exitEye21() {
    STATE.mode = "PRE_EYE21";
    STATE.parentEnabled = false;
    save(STATE);
    setHighlight("EYE21 exited • Parent disabled");
    console.log("[EYE21] Exited");
  }

  function isActive() {
    return STATE.mode === "EYE21_ACTIVE" && STATE.parentEnabled === true;
  }

  /* ------------------------------
     INITIAL STATE
     ------------------------------ */

  if (STATE.mode === "EYE21_ACTIVE" && STATE.parentEnabled) {
    setHighlight("EYE21 ACTIVE • Parent enabled");
  } else {
    setHighlight("Pre-EYE21 • Awaiting Parent enable");
  }

  /* ------------------------------
     EXPORT
     ------------------------------ */

  window.EYE21 = {
    enter: enterEye21,
    exit: exitEye21,
    requireParent,
    isActive,
    state: () => ({ ...STATE })
  };
})();
