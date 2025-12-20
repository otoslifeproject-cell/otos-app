/**
 * andy-feeder.js
 * Token-gated feeder intake + analysis
 *
 * HARD RULES:
 * - Andy cannot execute without Parent token
 * - Token is consumed on first successful run
 * - No background / silent execution
 * - ND-safe: explicit, deterministic, inspectable
 */

(() => {
  function log(msg) {
    console.log(`[ANDY][FEEDER] ${msg}`);
  }

  function error(msg) {
    console.error(`[ANDY][BLOCKED] ${msg}`);
    alert(`Andy blocked:\n${msg}`);
  }

  // -------------------------------
  // Core execution entry
  // -------------------------------
  function runFeeder({ file, command }) {
    // HARD GATE — token check
    if (!window.ANDY_TOKEN || !window.ANDY_TOKEN.canExecute()) {
      error("No valid execution token. Parent authorisation required.");
      return;
    }

    // Consume token immediately (single-use)
    if (!window.ANDY_TOKEN.consume()) {
      error("Execution token could not be consumed.");
      return;
    }

    // -------------------------------
    // Execution begins (explicit)
    // -------------------------------
    log("Execution authorised");
    log(`Command: ${command || "none"}`);
    log(`File: ${file ? file.name : "none"}`);

    // Placeholder for real pipeline
    // (analysis, extraction, classification)
    simulateProcessing(file, command);
  }

  // -------------------------------
  // Simulated processing (safe stub)
  // -------------------------------
  function simulateProcessing(file, command) {
    const statsProcessed = document.getElementById("stat-processed");
    const statsQueue = document.getElementById("stat-queue");
    const highlight = document.getElementById("highlight-status");

    if (highlight) {
      highlight.textContent = "Processing batch…";
    }

    setTimeout(() => {
      if (statsProcessed) statsProcessed.textContent = "1";
      if (statsQueue) statsQueue.textContent = "0";
      if (highlight) highlight.textContent = "Andy run complete";

      log("Processing complete");
    }, 900);
  }

  // -------------------------------
  // Wire UI (if present)
  // -------------------------------
  const ingestBtn = document.getElementById("ingest-btn");
  const fileInput = document.getElementById("file-input");
  const commandInput = document.getElementById("command-input");

  if (ingestBtn) {
    ingestBtn.addEventListener("click", () => {
      runFeeder({
        file: fileInput?.files?.[0] || null,
        command: commandInput?.value || ""
      });
    });
  }

  log("Feeder ready (token-gated, idle)");
})();
  title.textContent = "Andy · Intake";
  title.style.fontWeight = "700";
  title.style.marginBottom = "10px";

  const drop = document.createElement("div");
  drop.textContent = "Drop files here or click to add";
  drop.style.border = "2px dashed rgba(255,255,255,.15)";
  drop.style.borderRadius = "14px";
  drop.style.padding = "22px";
  drop.style.textAlign = "center";
  drop.style.cursor = "pointer";
  drop.style.marginBottom = "10px";

  const list = document.createElement("div");

  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  input.style.display = "none";

  /* ---------- RENDER ---------- */
  const render = () => {
    list.innerHTML = "";
    staged.forEach((f, i) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.padding = "6px 0";
      row.style.opacity = f.accepted ? "0.7" : "1";
      row.textContent = `${f.name} · ${f.size} bytes`;
      list.appendChild(row);
    });
  };

  /* ---------- ADD ---------- */
  const addFiles = (files) => {
    [...files].forEach(file => {
      staged.push({
        name: file.name,
        size: file.size,
        type: file.type,
        accepted: false,
        at: new Date().toISOString()
      });
    });
    save();
    render();
  };

  drop.onclick = () => input.click();
  input.onchange = e => addFiles(e.target.files);

  drop.ondragover = e => { e.preventDefault(); drop.style.opacity = "0.8"; };
  drop.ondragleave = () => drop.style.opacity = "1";
  drop.ondrop = e => {
    e.preventDefault();
    drop.style.opacity = "1";
    addFiles(e.dataTransfer.files);
  };

  /* ---------- MOUNT ---------- */
  wrap.appendChild(title);
  wrap.appendChild(drop);
  wrap.appendChild(list);
  wrap.appendChild(input);
  host.prepend(wrap);

  render();

})();
