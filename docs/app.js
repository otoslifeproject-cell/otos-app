/* OTOS Cockpit · ND-safe behaviours
   - No surprise execution
   - Token-gated actions
   - Move mode is opt-in (prevents accidental drag)
*/

(() => {
  const $ = (sel) => document.querySelector(sel);

  // ---------- START OVERLAY ----------
  const overlay = $("#startOverlay");
  const skipStart = $("#skipStart");
  const enterDefault = $("#enterDefault");

  const storedSkip = localStorage.getItem("otos_skip_start") === "1";
  if (storedSkip && overlay) overlay.hidden = true;

  const setDest = (dest) => {
    localStorage.setItem("otos_dest", dest);
    focusDest(dest);
  };

  const focusDest = (dest) => {
    const map = {
      core: "#zoneCore",
      feeder: "#zoneAndy",
      monitor: "#cardRadar",
      dev: "#zoneDev"
    };
    const target = document.querySelector(map[dest] || "#zoneCore");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      // subtle highlight pulse (calm, not animated chaos)
      target.classList.add("pulse");
      setTimeout(() => target.classList.remove("pulse"), 800);
    }
  };

  if (overlay) {
    overlay.querySelectorAll("[data-dest]").forEach(btn => {
      btn.addEventListener("click", () => {
        const dest = btn.getAttribute("data-dest") || "core";
        setDest(dest);

        if (skipStart?.checked) localStorage.setItem("otos_skip_start", "1");
        overlay.hidden = true;
      });
    });

    enterDefault?.addEventListener("click", () => {
      if (skipStart?.checked) localStorage.setItem("otos_skip_start", "1");
      overlay.hidden = true;
      focusDest(localStorage.getItem("otos_dest") || "core");
    });
  }

  // ---------- TOKEN GATING ----------
  let tokenIssued = localStorage.getItem("otos_token") === "1";

  const tokenChip = $("#tokenChip");
  const systemLine = $("#systemLine");
  const fileInput = $("#fileInput");
  const commandInput = $("#commandInput");
  const ingestBtn = $("#ingestBtn");
  const dryRunBtn = $("#dryRunBtn");

  const renderToken = () => {
    if (tokenChip) {
      tokenChip.textContent = tokenIssued ? "Issued" : "None";
      tokenChip.className = "chip " + (tokenIssued ? "chip--ok" : "chip--warn");
    }

    if (systemLine) {
      systemLine.textContent = tokenIssued
        ? "System ready · Token issued (explicit authority)"
        : "System idle · No execution tokens issued";
    }

    const enabled = !!tokenIssued;
    if (fileInput) fileInput.disabled = !enabled;
    if (commandInput) commandInput.disabled = !enabled;
    if (ingestBtn) ingestBtn.disabled = !enabled;
    if (dryRunBtn) dryRunBtn.disabled = !enabled;

    localStorage.setItem("otos_token", tokenIssued ? "1" : "0");
  };

  $("#issueToken")?.addEventListener("click", () => {
    tokenIssued = true;
    renderToken();
  });

  $("#revokeToken")?.addEventListener("click", () => {
    tokenIssued = false;
    renderToken();
  });

  renderToken();

  // ---------- STATS / HIGHLIGHT (placeholder behaviour) ----------
  const processedCount = $("#processedCount");
  const queueCount = $("#queueCount");
  const highlightLine = $("#highlightLine");
  const exportBtn = $("#exportBtn");

  const state = {
    processed: 0,
    queue: 0
  };

  const renderStats = () => {
    if (processedCount) processedCount.textContent = String(state.processed);
    if (queueCount) queueCount.textContent = String(state.queue);
  };
  renderStats();

  $("#dryRunBtn")?.addEventListener("click", () => {
    if (!tokenIssued) return;
    if (highlightLine) highlightLine.textContent = "Dry run: ready to ingest (no write)";
  });

  $("#ingestBtn")?.addEventListener("click", () => {
    if (!tokenIssued) return;

    const cmd = (commandInput?.value || "").trim().toUpperCase();
    if (!cmd) {
      if (highlightLine) highlightLine.textContent = "Add a command first (A/G/R/C/T).";
      return;
    }

    // Calm, deterministic update: we simulate “queue then processed”
    state.queue = 1;
    renderStats();
    if (highlightLine) highlightLine.textContent = `Ingest queued (${cmd}) · waiting…`;

    setTimeout(() => {
      state.queue = 0;
      state.processed += 1;
      renderStats();
      if (highlightLine) highlightLine.textContent = `Ingest complete (${cmd}) · classified safely.`;
    }, 450);
  });

  exportBtn?.addEventListener("click", () => {
    const payload = {
      exported_at: new Date().toISOString(),
      stats: { ...state },
      note: "Tier-3 archive placeholder (wiring next)"
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "otos-tier3-archive.json";
    a.click();
    URL.revokeObjectURL(a.href);

    if (highlightLine) highlightLine.textContent = "Exported Tier-3 archive (JSON).";
  });

  // ---------- MOVE MODE (opt-in drag) ----------
  const toggleMove = $("#toggleMove");
  const resetLayout = $("#resetLayout");
  let moveMode = localStorage.getItem("otos_move_mode") === "1";

  const applyMoveMode = () => {
    document.body.classList.toggle("move-mode", moveMode);
    if (toggleMove) toggleMove.textContent = moveMode ? "Layout: Move mode" : "Layout: Locked";
    localStorage.setItem("otos_move_mode", moveMode ? "1" : "0");
  };

  toggleMove?.addEventListener("click", () => {
    moveMode = !moveMode;
    applyMoveMode();
  });

  resetLayout?.addEventListener("click", () => {
    // clear stored positions
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith("otos_pos_")) localStorage.removeItem(k);
    });
    // reset inline transforms
    document.querySelectorAll("[data-draggable='true']").forEach(el => {
      el.style.transform = "";
    });
    if (highlightLine) highlightLine.textContent = "Layout reset to default.";
  });

  applyMoveMode();

  // drag engine
  const draggables = () => Array.from(document.querySelectorAll("[data-draggable='true']"));
  const loadPos = (id) => {
    try {
      const raw = localStorage.getItem("otos_pos_" + id);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch { return null; }
  };
  const savePos = (id, pos) => {
    localStorage.setItem("otos_pos_" + id, JSON.stringify(pos));
  };

  // restore positions
  draggables().forEach(el => {
    if (!el.id) return;
    const pos = loadPos(el.id);
    if (pos && typeof pos.x === "number" && typeof pos.y === "number") {
      el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    }
  });

  let drag = null;

  const onDown = (e) => {
    if (!moveMode) return;
    const handle = e.target.closest(".drag-handle");
    if (!handle) return;

    const box = handle.closest("[data-draggable='true']");
    if (!box || !box.id) return;

    const rect = box.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;

    // current translate
    const m = box.style.transform.match(/translate\(([-0-9.]+)px,\s*([-0-9.]+)px\)/);
    const curX = m ? Number(m[1]) : 0;
    const curY = m ? Number(m[2]) : 0;

    drag = { box, startX, startY, curX, curY };

    e.preventDefault();
  };

  const onMove = (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const x = Math.round(drag.curX + dx);
    const y = Math.round(drag.curY + dy);
    drag.box.style.transform = `translate(${x}px, ${y}px)`;
  };

  const onUp = () => {
    if (!drag) return;
    const box = drag.box;
    const m = box.style.transform.match(/translate\(([-0-9.]+)px,\s*([-0-9.]+)px\)/);
    const x = m ? Number(m[1]) : 0;
    const y = m ? Number(m[2]) : 0;
    savePos(box.id, { x, y });
    drag = null;
  };

  window.addEventListener("mousedown", onDown);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);

  // ---------- tiny style pulse helper ----------
  const style = document.createElement("style");
  style.textContent = `
    .pulse { box-shadow: 0 0 0 4px rgba(37,99,235,.12), 0 20px 60px rgba(2,6,23,.10) !important; }
  `;
  document.head.appendChild(style);

})();
