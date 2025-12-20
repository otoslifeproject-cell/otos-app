/**
 * feeder.js
 * Andy Intake Feeder – Tier-1 (local, non-destructive)
 * ND-safe: explicit actions, no auto side-effects
 */

(() => {
  // ---- State ----
  const state = {
    processed: 0,
    queue: 0,
    lastCommand: null,
    lastFile: null
  };

  // ---- Helpers ----
  const $ = (id) => document.getElementById(id);
  const text = (id, value) => { if ($(id)) $(id).textContent = value; };

  function log(msg) {
    console.log(`[ANDY][FEEDER] ${msg}`);
    text("highlight-report", msg);
  }

  function parseCommand(raw) {
    if (!raw) return null;
    const c = raw.trim().toUpperCase();
    const map = {
      A: "ANALYSE",
      G: "GOLDEN",
      R: "REVENUE",
      C: "CANON",
      T: "TASKS"
    };
    return map[c] || null;
  }

  // ---- DOM Bindings ----
  const fileInput = $("intake-file");
  const commandInput = $("intake-command");
  const ingestBtn = $("ingest-btn");

  if (!fileInput || !commandInput || !ingestBtn) {
    console.warn("Andy feeder bindings not found");
    return;
  }

  // ---- UI State ----
  function updateStats() {
    text("stats-processed", state.processed);
    text("stats-queue", state.queue);
  }

  function enableIngest(enabled) {
    ingestBtn.disabled = !enabled;
  }

  // ---- Events ----
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    state.lastFile = file || null;
    log(file ? `File selected: ${file.name}` : "No file selected");
    enableIngest(!!file);
  });

  ingestBtn.addEventListener("click", () => {
    const file = state.lastFile;
    if (!file) {
      log("No file to ingest");
      return;
    }

    const cmd = parseCommand(commandInput.value);
    state.lastCommand = cmd;

    state.queue += 1;
    updateStats();

    log(`Queued: ${file.name} (${cmd || "NO COMMAND"})`);

    // Simulated processing (Tier-1 only)
    setTimeout(() => {
      state.queue -= 1;
      state.processed += 1;
      updateStats();
      log(`Processed: ${file.name}`);
    }, 600);
  });

  // ---- Boot ----
  updateStats();
  enableIngest(false);
  log("Andy feeder ready (Tier-1, idle)");
})();
