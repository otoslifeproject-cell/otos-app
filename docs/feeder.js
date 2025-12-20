/**
 * feeder.js
 * Andy Execution Feeder
 *
 * HARD GUARANTEES:
 * - No execution without explicit Parent-issued token
 * - Deterministic, ND-safe behaviour
 * - One action at a time
 */

(() => {
  // -------------------------------
  // Utilities
  // -------------------------------
  const $ = (id) => document.getElementById(id);

  function log(msg) {
    console.log(`[ANDY][FEEDER] ${msg}`);
    const report = $("highlight-report");
    if (report) report.textContent = msg;
  }

  // -------------------------------
  // Token Gate (HARD)
  // -------------------------------
  function tokenAllowed() {
    if (!window.ANDY_TOKEN || !window.ANDY_TOKEN.canExecute()) {
      log("Blocked: No execution token issued");
      return false;
    }
    return true;
  }

  // -------------------------------
  // State
  // -------------------------------
  const STATE = {
    processing: false,
    processed: 0,
    queue: 0
  };

  function updateStats() {
    const p = $("stat-processed");
    const q = $("stat-queue");
    if (p) p.textContent = STATE.processed;
    if (q) q.textContent = STATE.queue;
  }

  // -------------------------------
  // Command Parsing
  // -------------------------------
  function parseCommand(cmd) {
    return {
      analyse: cmd.includes("A"),
      golden: cmd.includes("G"),
      revenue: cmd.includes("R"),
      canon: cmd.includes("C"),
      tasks: cmd.includes("T")
    };
  }

  // -------------------------------
  // Core Ingest
  // -------------------------------
  async function ingest(file, command) {
    if (STATE.processing) {
      log("Busy: ingestion already running");
      return;
    }

    if (!tokenAllowed()) return;

    STATE.processing = true;
    STATE.queue = 1;
    updateStats();

    log("Ingest started");

    try {
      const text = await file.text();
      const intent = parseCommand(command);

      // ---- Simulated extraction pipeline ----
      await new Promise((r) => setTimeout(r, 400));

      const payload = {
        filename: file.name,
        size: file.size,
        intent,
        preview: text.slice(0, 500)
      };

      console.log("[ANDY][PAYLOAD]", payload);

      STATE.processed += 1;
      STATE.queue = 0;

      log("Ingest complete (idle)");

    } catch (err) {
      console.error(err);
      log("Error during ingest");
    } finally {
      STATE.processing = false;
      updateStats();
    }
  }

  // -------------------------------
  // Wire UI
  // -------------------------------
  const ingestBtn = $("ingest-btn");
  const fileInput = $("file-input");
  const commandInput = $("command-input");

  if (!ingestBtn || !fileInput || !commandInput) {
    console.warn("Feeder UI elements missing");
    return;
  }

  ingestBtn.addEventListener("click", () => {
    const file = fileInput.files[0];
    const command = commandInput.value || "";

    if (!file) {
      log("No file selected");
      return;
    }

    ingest(file, command.toUpperCase());
  });

  // -------------------------------
  // Boot
  // -------------------------------
  updateStats();
  log("Andy engine ready (idle)");
})();
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
