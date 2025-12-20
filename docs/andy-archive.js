/* ============================================================
   ANDY TIER-3 ARCHIVE v1
   ------------------------------------------------------------
   Purpose:
   - Capture every ingested payload (Tier-3, raw + enriched)
   - Store locally (safe, deterministic)
   - Enable JSON export via UI button
   ============================================================ */

(function () {
  const KEY = "OTOS_ANDY_TIER3_ARCHIVE";

  function loadArchive() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveArchive(items) {
    localStorage.setItem(KEY, JSON.stringify(items, null, 2));
  }

  function addToArchive(payload) {
    const archive = loadArchive();
    archive.push({
      ...payload,
      archivedAt: new Date().toISOString(),
      tier: 3
    });
    saveArchive(archive);
  }

  function exportArchive() {
    const archive = loadArchive();
    if (!archive.length) {
      alert("Tier-3 archive is empty.");
      return;
    }

    const blob = new Blob(
      [JSON.stringify(archive, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `OTOS_ANDY_TIER3_${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ------------------------------
     EVENT LISTENERS
     ------------------------------ */

  document.addEventListener("andy:intake", (e) => {
    if (!e.detail) return;
    addToArchive(e.detail);
  });

  /* ------------------------------
     UI HOOK (EXPORT BUTTON)
     ------------------------------ */

  function bindExport() {
    const buttons = Array.from(document.querySelectorAll("button"));
    const exportBtn = buttons.find(b =>
      (b.textContent || "").toLowerCase().includes("export tier-3")
    );

    if (!exportBtn) {
      console.warn("[ANDY ARCHIVE] Export button not found.");
      return;
    }

    exportBtn.addEventListener("click", exportArchive);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindExport);
  } else {
    bindExport();
  }

  console.log("[ANDY ARCHIVE] Tier-3 archive active.");
})();
