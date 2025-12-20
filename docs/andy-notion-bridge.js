/* ============================================================
   ANDY → NOTION BRIDGE (TIER-2) v1 — STUB
   ------------------------------------------------------------
   Purpose:
   - Transform Tier-3 raw intake into Tier-2 structured records
   - Prepare Notion-ready payloads (schema-safe)
   - NO live Notion writes yet (safe, observable)
   ============================================================ */

(function () {
  const KEY = "OTOS_ANDY_TIER2_BUFFER";

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  }

  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items, null, 2));
  }

  function normaliseText(text) {
    if (!text) return "";
    return String(text)
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 20000); // Notion-safe cap
  }

  function buildTier2(payload) {
    return {
      id: crypto.randomUUID(),
      source: "ANDY",
      tier: 2,
      filename: payload.name || "unknown",
      mime: payload.type || "unknown",
      size: payload.size || 0,
      commands: payload.commands || [],
      ingestedAt: payload.timestamp || new Date().toISOString(),
      content: normaliseText(payload.content),
      status: "READY_FOR_NOTION",
      notes: []
    };
  }

  function pushTier2(record) {
    const buf = load();
    buf.push(record);
    save(buf);
  }

  /* ------------------------------
     EVENT LISTENER
     ------------------------------ */

  document.addEventListener("andy:intake", (e) => {
    if (!e.detail) return;

    const tier2 = buildTier2(e.detail);
    pushTier2(tier2);

    document.dispatchEvent(
      new CustomEvent("andy:tier2-ready", { detail: tier2 })
    );

    console.log("[ANDY → NOTION] Tier-2 record prepared:", tier2.filename);
  });

  console.log("[ANDY → NOTION] Bridge stub active (no live writes).");
})();
