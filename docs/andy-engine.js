/* OTOS · Andy Execution Engine (SAFE / NO-UI-TOUCH) */
/* Layout is NEVER modified here */

(function () {
  const STATE = {
    tokens: false,
    processed: 0,
    queue: 0
  };

  const qs = (sel) => document.querySelector(sel);
  const qsa = (sel) => Array.from(document.querySelectorAll(sel));

  function setText(label, value) {
    const rows = qsa(".stats");
    rows.forEach(r => {
      if (r.textContent.includes(label)) {
        const strong = r.querySelector("strong");
        if (strong) strong.textContent = value;
      }
    });
  }

  function highlight(msg) {
    const box = document.querySelector(".card h3")
      ?.closest(".card")
      ?.parentElement
      ?.querySelector(".card:last-child p");
    if (box) box.textContent = msg;
  }

  /* TOKEN CONTROL */
  qsa("button").forEach(btn => {
    if (btn.textContent.includes("Issue token")) {
      btn.onclick = () => {
        STATE.tokens = true;
        highlight("Andy engine ready (tokens issued)");
      };
    }
    if (btn.textContent.includes("Revoke")) {
      btn.onclick = () => {
        STATE.tokens = false;
        highlight("Andy engine idle (tokens revoked)");
      };
    }
  });

  /* INGEST */
  const ingestBtn = qsa("button").find(b => b.textContent.includes("Ingest"));
  if (ingestBtn) {
    ingestBtn.onclick = () => {
      if (!STATE.tokens) {
        highlight("Blocked: no execution tokens");
        return;
      }
      STATE.queue += 1;
      setText("Queue", STATE.queue);
      highlight("Ingest queued");
      setTimeout(() => {
        STATE.queue -= 1;
        STATE.processed += 1;
        setText("Queue", STATE.queue);
        setText("Processed", STATE.processed);
        highlight("Ingest complete");
      }, 600);
    };
  }

  /* EXPORT */
  const exportBtn = qsa("button").find(b => b.textContent.includes("Export"));
  if (exportBtn) {
    exportBtn.onclick = () => {
      const blob = new Blob([JSON.stringify({
        processed: STATE.processed,
        timestamp: new Date().toISOString()
      }, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "otos-tier3-archive.json";
      a.click();
      highlight("Archive exported");
    };
  }

})();
