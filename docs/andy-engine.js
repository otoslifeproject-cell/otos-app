/* =========================================================
   OTOS — ANDY ENGINE v1.0
   Behaviour Wiring Only
   Scope: Intake → Stats → Highlight
   No UI / CSS / Layout mutations
   ========================================================= */

(() => {
  /* ---------- STATE ---------- */
  const STATE = {
    tokensIssued: false,
    queue: 0,
    processed: 0,
    highlights: [],
    engine: "Andy v1",
    mode: "IDLE"
  };

  /* ---------- HELPERS ---------- */
  const $ = (sel) => document.querySelector(sel);

  const cardByTitle = (title) => {
    const cards = Array.from(document.querySelectorAll("div"));
    return cards.find(d => d.textContent?.trim().startsWith(title));
  };

  const updateStats = (label, value) => {
    const statsCard = cardByTitle("Stats");
    if (!statsCard) return;
    const lines = statsCard.querySelectorAll("div, span, p");
    lines.forEach(l => {
      if (l.textContent?.includes(label)) {
        l.textContent = `${label}: ${value}`;
      }
    });
  };

  const highlight = (msg) => {
    const report = cardByTitle("Running Highlight Report");
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
    STATE.highlights.push(msg);
  };

  /* ---------- TOKENS ---------- */
  const tokenBtn = Array.from(document.querySelectorAll("button"))
    .find(b => b.textContent.includes("Issue token"));

  if (tokenBtn) {
    tokenBtn.onclick = () => {
      STATE.tokensIssued = true;
      highlight("Execution token issued");
    };
  }

  /* ---------- INTAKE ---------- */
  const ingestBtn = Array.from(document.querySelectorAll("button"))
    .find(b => b.textContent.includes("Ingest batch"));

  if (ingestBtn) {
    ingestBtn.onclick = () => {
      if (!STATE.tokensIssued) {
        highlight("Ingest blocked — no token");
        return;
      }

      STATE.mode = "INGESTING";
      STATE.queue += 1;
      updateStats("Queue", STATE.queue);
      highlight("Ingest started");

      /* Simulated processing delay */
      setTimeout(() => {
        STATE.queue -= 1;
        STATE.processed += 1;
        updateStats("Queue", STATE.queue);
        updateStats("Processed", STATE.processed);
        highlight("Document processed");
        STATE.mode = "IDLE";
      }, 900);
    };
  }

  /* ---------- EXPORT ---------- */
  const exportBtn = Array.from(document.querySelectorAll("button"))
    .find(b => b.textContent.includes("Export"));

  if (exportBtn) {
    exportBtn.onclick = () => {
      const payload = {
        engine: STATE.engine,
        processed: STATE.processed,
        highlights: STATE.highlights,
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob(
        [JSON.stringify(payload, null, 2)],
        { type: "application/json" }
      );

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "otos-tier3-archive.json";
      a.click();

      highlight("Tier-3 archive exported");
    };
  }

  /* ---------- BOOT ---------- */
  highlight("Andy engine initialised (idle)");

})();
