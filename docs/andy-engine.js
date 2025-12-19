/* =========================================================
   OTOS — ANDY ENGINE v1.1
   Notion Bridge (Dry-Run / Local)
   Scope: Intake → Parse → Stage → Preview Push
   No UI mutations
   ========================================================= */

(() => {
  /* ---------- STATE ---------- */
  const STATE = {
    tokensIssued: false,
    queue: 0,
    processed: 0,
    staged: [],
    mode: "IDLE",
    engine: "Andy v1.1"
  };

  /* ---------- HELPERS ---------- */
  const cardByTitle = (title) =>
    Array.from(document.querySelectorAll("div"))
      .find(d => d.textContent?.trim().startsWith(title));

  const highlight = (msg) => {
    const report = cardByTitle("Running Highlight Report");
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
  };

  const setStat = (label, value) => {
    const stats = cardByTitle("Stats");
    if (!stats) return;
    stats.querySelectorAll("*").forEach(n => {
      if (n.textContent?.startsWith(label)) {
        n.textContent = `${label}: ${value}`;
      }
    });
  };

  /* ---------- TOKEN GATE ---------- */
  const tokenBtn = [...document.querySelectorAll("button")]
    .find(b => b.textContent.includes("Issue token"));

  if (tokenBtn) {
    tokenBtn.onclick = () => {
      STATE.tokensIssued = true;
      highlight("Execution token confirmed");
    };
  }

  /* ---------- FILE INGEST ---------- */
  const fileInput = document.querySelector("input[type='file']");
  const ingestBtn = [...document.querySelectorAll("button")]
    .find(b => b.textContent.includes("Ingest batch"));

  if (ingestBtn) {
    ingestBtn.onclick = async () => {
      if (!STATE.tokensIssued) {
        highlight("Ingest blocked — token required");
        return;
      }

      if (!fileInput || !fileInput.files.length) {
        highlight("No files selected");
        return;
      }

      STATE.mode = "INGESTING";
      STATE.queue += fileInput.files.length;
      setStat("Queue", STATE.queue);
      highlight(`Ingesting ${fileInput.files.length} file(s)`);

      for (const file of fileInput.files) {
        const text = await file.text();

        const stagedDoc = {
          name: file.name,
          size: file.size,
          type: file.type || "text/plain",
          preview: text.slice(0, 800),
          stagedAt: new Date().toISOString()
        };

        STATE.staged.push(stagedDoc);
        STATE.queue -= 1;
        STATE.processed += 1;

        setStat("Queue", STATE.queue);
        setStat("Processed", STATE.processed);

        highlight(`Parsed: ${file.name}`);
      }

      STATE.mode = "STAGED";
      highlight("All documents staged (Notion dry-run)");
    };
  }

  /* ---------- STAGE EXPORT ---------- */
  const exportBtn = [...document.querySelectorAll("button")]
    .find(b => b.textContent.includes("Export"));

  if (exportBtn) {
    exportBtn.onclick = () => {
      const payload = {
        engine: STATE.engine,
        mode: STATE.mode,
        processed: STATE.processed,
        staged: STATE.staged,
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob(
        [JSON.stringify(payload, null, 2)],
        { type: "application/json" }
      );

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "otos-notion-stage-preview.json";
      a.click();

      highlight("Staged payload exported (Notion-ready)");
    };
  }

  /* ---------- BOOT ---------- */
  highlight("Andy v1.1 online — Notion bridge staged");

})();
