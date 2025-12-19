/* OTOS · Andy Execution Engine v2 */
/* STRICT RULE: NO UI / CSS / LAYOUT MUTATION */

(function () {

  const STATE = {
    tokens: false,
    processed: 0,
    queue: 0
  };

  /* ---------- HELPERS ---------- */

  function cardByTitle(title) {
    return Array.from(document.querySelectorAll(".card"))
      .find(c => c.querySelector("h3")?.textContent.trim() === title);
  }

  function setStats(label, value) {
    const statsCard = cardByTitle("Stats");
    if (!statsCard) return;
    const p = Array.from(statsCard.querySelectorAll("p"))
      .find(x => x.textContent.startsWith(label));
    if (p) p.innerHTML = `${label}: <strong>${value}</strong>`;
  }

  function highlight(msg) {
    const report = cardByTitle("Running Highlight Report");
    if (!report) return;
    let p = report.querySelector("p");
    if (!p) {
      p = document.createElement("p");
      report.appendChild(p);
    }
    p.textContent = msg;
  }

  /* ---------- TOKEN CONTROL ---------- */

  const tokenCard = cardByTitle("Execution Tokens");
  if (tokenCard) {
    const buttons = tokenCard.querySelectorAll("button");

    buttons.forEach(btn => {
      if (btn.textContent.includes("Issue")) {
        btn.onclick = () => {
          STATE.tokens = true;
          highlight("Andy engine armed (tokens issued)");
        };
      }
      if (btn.textContent.includes("Revoke")) {
        btn.onclick = () => {
          STATE.tokens = false;
          highlight("Andy engine idle (tokens revoked)");
        };
      }
    });
  }

  /* ---------- INGEST ---------- */

  const intakeCard = cardByTitle("Intake");
  if (intakeCard) {
    const ingestBtn = Array.from(intakeCard.querySelectorAll("button"))
      .find(b => b.textContent.includes("Ingest"));

    if (ingestBtn) {
      ingestBtn.onclick = () => {
        if (!STATE.tokens) {
          highlight("Blocked: no execution tokens");
          return;
        }

        STATE.queue += 1;
        setStats("Queue", STATE.queue);
        highlight("Ingest accepted");

        setTimeout(() => {
          STATE.queue -= 1;
          STATE.processed += 1;
          setStats("Queue", STATE.queue);
          setStats("Processed", STATE.processed);
          highlight("Ingest complete");
        }, 700);
      };
    }
  }

  /* ---------- EXPORT ---------- */

  const statsCard = cardByTitle("Stats");
  if (statsCard) {
    const exportBtn = Array.from(statsCard.querySelectorAll("button"))
      .find(b => b.textContent.includes("Export"));

    if (exportBtn) {
      exportBtn.onclick = () => {
        const payload = {
          processed: STATE.processed,
          exportedAt: new Date().toISOString(),
          engine: "Andy v2"
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
  }

  /* ---------- BOOT CONFIRM ---------- */

  highlight("Andy engine loaded (bound, idle)");

})();
