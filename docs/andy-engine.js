/* =========================================================
   OTOS — ANDY ENGINE v2.3
   NOTION LIVE TOGGLE + WRITE GUARD
   Scope: Safe → Live switch with hard Parent consent
   Behaviour only. No UI / CSS changes.
   ========================================================= */

(() => {

  /* ---------- CONFIG ---------- */
  const NOTION = {
    enabled: false,                 // hard default
    version: "2022-06-28"
  };

  /* ---------- STATE ---------- */
  const STATE = {
    engine: "Andy v2.3",
    liveArmed: false,
    consentHash: null
  };

  /* ---------- HELPERS ---------- */
  const cardByTitle = (title) =>
    Array.from(document.querySelectorAll(".card"))
      .find(c => c.querySelector("h3")?.textContent.trim() === title);

  const highlight = (msg) => {
    const report = cardByTitle("Running Highlight Report");
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
  };

  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v, null, 2));

  /* ---------- CONSENT FLOW ---------- */
  const tokenCard = cardByTitle("Execution Tokens");
  if (!tokenCard) {
    highlight("Live toggle unavailable (token card missing)");
    return;
  }

  const issueBtn = Array.from(tokenCard.querySelectorAll("button"))
    .find(b => b.textContent.includes("Issue"));
  const revokeBtn = Array.from(tokenCard.querySelectorAll("button"))
    .find(b => b.textContent.includes("Revoke"));

  if (issueBtn) {
    issueBtn.addEventListener("click", () => {
      STATE.liveArmed = true;
      STATE.consentHash = crypto.randomUUID();
      NOTION.enabled = true;

      save("OTOS_LIVE_CONSENT", {
        armedAt: new Date().toISOString(),
        consentHash: STATE.consentHash
      });

      highlight("LIVE WRITE ARMED (Parent consent)");
      highlight(`Consent hash: ${STATE.consentHash}`);
    });
  }

  if (revokeBtn) {
    revokeBtn.addEventListener("click", () => {
      STATE.liveArmed = false;
      NOTION.enabled = false;
      STATE.consentHash = null;

      localStorage.removeItem("OTOS_LIVE_CONSENT");
      highlight("LIVE WRITE REVOKED — SAFE MODE");
    });
  }

  /* ---------- GUARD ---------- */
  window.OTOS_CAN_WRITE_NOTION = () => {
    const consent = localStorage.getItem("OTOS_LIVE_CONSENT");
    return Boolean(consent && NOTION.enabled && STATE.liveArmed);
  };

  /* ---------- BOOT ---------- */
  save("OTOS_ANDY_LIVE_TOGGLE", {
    engine: STATE.engine,
    liveArmed: STATE.liveArmed
  });

  highlight("Live-write guard initialised");

})();
