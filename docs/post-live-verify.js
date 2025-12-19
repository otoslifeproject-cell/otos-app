/* =========================================================
   OTOS — POST-LIVE VERIFICATION v1.0
   Purpose: One-click health check after EYE21 takeover
   Scope: Read-only verification, no mutations
   Location: otos-app/docs/post-live-verify.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  const ok = (k) => localStorage.getItem(k) !== null;

  const report = Array.from(document.querySelectorAll(".card"))
    .find(c => c.textContent.includes("Highlight"));

  const line = (t) => {
    if (!report) return;
    const d = document.createElement("div");
    d.textContent = `• ${t}`;
    report.appendChild(d);
  };

  const checks = [
    ["Parent Node", ok("OTOS_PARENT_NODE") && localStorage.getItem("OTOS_PARENT_NODE")==="EYE21"],
    ["Andy Status", ok("OTOS_ANDY_STATUS") && localStorage.getItem("OTOS_ANDY_STATUS")==="LIVE"],
    ["Baseline Locked", ok("OTOS_ANDY_BASELINE")],
    ["Quiet Mode", ok("OTOS_QUIET_MODE")],
    ["Heartbeat", ok("OTOS_HEARTBEAT")],
    ["Activity Stream", ok("OTOS_ACTIVITY_STREAM")],
    ["Pipeline Dashboard", ok("OTOS_UI_DRAG_PERSIST")],
    ["Top Action", ok("OTOS_TOP_ACTION")],
    ["Projects", ok("OTOS_PROJECTS")],
    ["Tasks", ok("OTOS_TASKS")]
  ];

  line("Post-live verification starting…");
  checks.forEach(([name, pass]) => {
    line(`${pass ? "✅" : "❌"} ${name}`);
  });
  line("Verification complete.");

})();
