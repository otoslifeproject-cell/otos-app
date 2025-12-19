window.ANDY = (() => {

  let tokensIssued = false;
  let processed = 0;
  let queue = 0;
  const highlights = [];

  const el = id => document.getElementById(id);

  function update() {
    el("processed").textContent = processed;
    el("queue").textContent = queue;
    el("state").textContent = tokensIssued ? "READY" : "IDLE";
    el("highlight-report").innerHTML = highlights.map(h => `• ${h}`).join("<br>");
  }

  function issueTokens() {
    tokensIssued = true;
    update();
  }

  function revokeTokens() {
    tokensIssued = false;
    update();
  }

  function ingestFiles(files, mode) {
    if (!tokensIssued) {
      alert("Execution tokens required.");
      return;
    }

    queue = files.length;
    update();

    Array.from(files).forEach((file, i) => {
      setTimeout(() => {
        processed++;
        queue--;
        highlights.push(`[${mode}] ${file.name}`);
        update();
      }, 400 * (i + 1));
    });
  }

  function exportArchive() {
    const blob = new Blob(
      [JSON.stringify({ processed, highlights }, null, 2)],
      { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "andy-tier3-archive.json";
    a.click();
  }

  return {
    issueTokens,
    revokeTokens,
    ingestFiles,
    exportArchive
  };

})();

/* UI bindings */
document.getElementById("issue-token").onclick = ANDY.issueTokens;
document.getElementById("revoke-token").onclick = ANDY.revokeTokens;
document.getElementById("ingest-btn").onclick = () => {
  ANDY.ingestFiles(
    document.getElementById("file-input").files,
    document.getElementById("cmd").value || "A"
  );
};
document.getElementById("export-archive").onclick = ANDY.exportArchive;
