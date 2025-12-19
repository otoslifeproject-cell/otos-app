/* =========================================================
   OTOS — ANDY ENGINE v2.7
   DOCUMENT FLOW VISUAL PULSE (NON-INTRUSIVE)
   Scope: Show life-signs while docs process
   Rule: NO layout change, append-only text
   Location: otos-app/docs/andy-pulse.js
   ========================================================= */

(() => {

  /* ---------- STATE ---------- */
  const STATE = {
    engine: "Andy v2.7",
    pulseCount: 0,
    last: Date.now()
  };

  /* ---------- HELPERS ---------- */
  const cardByTitle = (title) =>
    Array.from(document.querySelectorAll(".card"))
      .find(c => c.querySelector("h3")?.textContent.trim() === title);

  const report = cardByTitle("Running Highlight Report");
  if (!report) return;

  const pulse = () => {
    const now = Date.now();
    if (now - STATE.last < 1200) return; // throttle
    STATE.last = now;
    STATE.pulseCount++;

    const line = document.createElement("div");
    line.textContent = `• Andy pulse ${STATE.pulseCount} — system alive`;
    report.appendChild(line);

    // keep report readable
    if (report.children.length > 12) {
      report.removeChild(report.firstChild);
    }
  };

  /* ---------- TRIGGERS ---------- */
  window.addEventListener("click", pulse);
  window.addEventListener("keydown", pulse);

  /* ---------- BOOT ---------- */
  pulse();
  localStorage.setItem("OTOS_ANDY_PULSE", "ACTIVE");

})();
