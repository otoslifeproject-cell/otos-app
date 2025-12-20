/* ============================================================
   ANDY INTAKE PIPELINE v1
   ------------------------------------------------------------
   Purpose:
   - Single controlled entry point for all ingested files
   - Token-gated execution
   - Deterministic command parsing (A/G/R/C/T)
   - Emits clean events for stats + archive
   ============================================================ */

(function () {
  const STATE = {
    tokensIssued: false,
    processed: 0,
    queue: 0,
  };

  const COMMAND_MAP = {
    A: "ANALYSE",
    G: "GOLDEN",
    R: "REVENUE",
    C: "CANON",
    T: "TASKS",
  };

  /* ------------------------------
     TOKEN CONTROL
     ------------------------------ */
  function issueTokens() {
    STATE.tokensIssued = true;
    log("Tokens issued");
  }

  function revokeTokens() {
    STATE.tokensIssued = false;
    log("Tokens revoked");
  }

  /* ------------------------------
     COMMAND PARSER
     ------------------------------ */
  function parseCommand(input) {
    if (!input) return [];
    return input
      .toUpperCase()
      .split("/")
      .map(c => c.trim())
      .filter(c => COMMAND_MAP[c])
      .map(c => COMMAND_MAP[c]);
  }

  /* ------------------------------
     INTAKE HANDLER
     ------------------------------ */
  function ingestBatch(files, commandString) {
    if (!STATE.tokensIssued) {
      alert("Andy cannot act without explicit tokens.");
      return;
    }

    if (!files || files.length === 0) {
      alert("No files selected for ingestion.");
      return;
    }

    const commands = parseCommand(commandString);
    STATE.queue += files.length;

    Array.from(files).forEach(file => {
      processFile(file, commands);
    });
  }

  function processFile(file, commands) {
    const reader = new FileReader();

    reader.onload = () => {
      const payload = {
        name: file.name,
        size: file.size,
        type: file.type,
        commands,
        content: reader.result,
        timestamp: new Date().toISOString(),
      };

      emit("andy:intake", payload);
      STATE.processed++;
      STATE.queue--;

      updateStats();
    };

    reader.readAsText(file);
  }

  /* ------------------------------
     EVENTS
     ------------------------------ */
  function emit(event, payload) {
    document.dispatchEvent(
      new CustomEvent(event, { detail: payload })
    );
    log(`Event emitted: ${event}`);
  }

  /* ------------------------------
     UI + LOGGING
     ------------------------------ */
  function updateStats() {
    const processedEl = document.querySelector("[data-stat='processed']");
    const queueEl = document.querySelector("[data-stat='queue']");

    if (processedEl) processedEl.textContent = STATE.processed;
    if (queueEl) queueEl.textContent = STATE.queue;
  }

  function log(msg) {
    console.log(`[ANDY] ${msg}`);
  }

  /* ------------------------------
     PUBLIC API (window)
     ------------------------------ */
  window.ANDY = {
    issueTokens,
    revokeTokens,
    ingestBatch,
  };
})();
