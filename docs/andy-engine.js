/* =========================================================
   ANDY ENGINE v1.0
   Safe / Local / Token-Gated
   No UI mutation
   ========================================================= */

(function () {
  const STATE = {
    tokens: false,
    processed: 0,
    queue: 0,
    highlights: [],
    archive: []
  };

  const el = (id) => document.getElementById(id);

  const renderStats = () => {
    const statsCards = document.querySelectorAll(".card");
    statsCards.forEach(card => {
      if (card.innerText.includes("Processed")) {
        card.innerHTML = `
          <h3>Stats</h3>
          <div class="row"><span>Processed</span><strong>${STATE.processed}</strong></div>
          <div class="row"><span>Queue</span><strong>${STATE.queue}</strong></div>
          <button id="export-archive">Export Tier-3 Archive (JSON)</button>
        `;
        document
          .getElementById("export-archive")
          .addEventListener("click", exportArchive);
      }
    });
  };

  const renderHighlights = () => {
    const box = document.querySelector(".highlight-box");
    if (!box) return;
    box.innerHTML = STATE.highlights
      .slice(-10)
      .map(h => `<div class="highlight-item">${h}</div>`)
      .join("");
  };

  const issueTokens = () => {
    STATE.tokens = true;
    console.log("Andy: tokens issued");
  };

  const revokeTokens = () => {
    STATE.tokens = false;
    console.log("Andy: tokens revoked");
  };

  const ingestFiles = (files, mode = "A") => {
    if (!STATE.tokens) {
      alert("Execution tokens required.");
      return;
    }

    if (!files || files.length === 0) return;

    STATE.queue += files.length;
    renderStats();

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const entry = {
          name: file.name,
          size: file.size,
          type: file.type,
          mode,
          contentPreview: reader.result.slice(0, 500),
          timestamp: new Date().toISOString()
        };

        STATE.archive.push(entry);
        STATE.highlights.push(`Ingested: ${file.name}`);
        STATE.processed++;
        STATE.queue--;

        renderStats();
        renderHighlights();
      };
      reader.readAsText(file);
    });
  };

  const exportArchive = () => {
    const blob = new Blob(
      [JSON.stringify(STATE.archive, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "andy-tier3-archive.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Expose Andy safely
  window.ANDY = {
    issueTokens,
    revokeTokens,
    ingestFiles,
    exportArchive
  };

  // Wire buttons when DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    document
      .querySelectorAll("button")
      .forEach(btn => {
        if (btn.innerText.includes("Issue token")) {
          btn.addEventListener("click", issueTokens);
        }
        if (btn.innerText.includes("Revoke")) {
          btn.addEventListener("click", revokeTokens);
        }
        if (btn.innerText.includes("Ingest batch")) {
          btn.addEventListener("click", () => {
            const fileInput = document.querySelector('input[type="file"]');
            const cmdInput = document.querySelector('input[placeholder^="Command"]');
            ingestFiles(fileInput.files, cmdInput?.value || "A");
          });
        }
      });
  });

})();
