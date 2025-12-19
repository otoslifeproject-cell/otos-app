/* =========================================================
   OTOS — ANDY ENGINE v3.5
   TOP ACTION UI BINDER (VISIBLE CONFIRMATION)
   Purpose: Render the single Top Action into the UI
   Location: otos-app/docs/andy-top-action-ui.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARDS ---------- */
  if (localStorage.getItem("OTOS_ANDY_STATUS") !== "LIVE") return;

  const top = JSON.parse(localStorage.getItem("OTOS_TOP_ACTION") || "null");
  if (!top) return;

  /* ---------- HELPERS ---------- */
  const cardByTitle = (title) =>
    Array.from(document.querySelectorAll(".card"))
      .find(c => c.textContent.includes(title));

  const highlight = (msg) => {
    const report = cardByTitle("Highlight");
    if (!report) return;
    const line = document.createElement("div");
    line.textContent = `• ${msg}`;
    report.appendChild(line);
  };

  /* ---------- TARGET ---------- */
  const target =
    cardByTitle("Top Action") ||
    document.getElementById("center") ||
    document.body;

  /* ---------- RENDER ---------- */
  target.innerHTML = "";

  const box = document.createElement("div");
  box.style.padding = "20px";
  box.style.borderRadius = "14px";
  box.style.boxShadow = "0 20px 40px rgba(0,0,0,.15)";
  box.style.background = "linear-gradient(180deg,#0f172a,#020617)";
  box.style.color = "white";
  box.style.maxWidth = "520px";

  const title = document.createElement("h2");
  title.textContent = "ONE THING";
  title.style.opacity = "0.7";
  title.style.marginBottom = "6px";

  const action = document.createElement("div");
  action.textContent = top.title;
  action.style.fontSize = "22px";
  action.style.fontWeight = "600";

  const meta = document.createElement("div");
  meta.textContent = `Priority ${top.score} / 10`;
  meta.style.marginTop = "10px";
  meta.style.opacity = "0.6";

  box.appendChild(title);
  box.appendChild(action);
  box.appendChild(meta);

  target.appendChild(box);

  highlight("Top Action rendered to UI");

})();
