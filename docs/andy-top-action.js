/* =========================================================
   OTOS — ANDY ENGINE v6.1
   TOP ACTION SYNTHESIZER
   Purpose: Derive and surface the single highest-leverage ACTION
   Scope: Read-only synthesis + UI card
   Location: otos-app/docs/andy-top-action.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARD ---------- */
  if (window.OTOS_TOP_ACTION_ACTIVE) return;
  window.OTOS_TOP_ACTION_ACTIVE = true;

  const ACT_KEY = "OTOS_ACTIVITY_STREAM";
  const ACTION_KEY = "OTOS_TOP_ACTION";

  /* ---------- INPUTS ---------- */
  const classified = JSON.parse(localStorage.getItem("OTOS_CLASSIFIED_DOCS") || "{}");
  const actions = [];

  Object.entries(classified).forEach(([bucket, docs]) => {
    docs.forEach(d => {
      actions.push({
        name: d.name,
        bucket,
        score:
          (bucket === "REVENUE" ? 5 : 0) +
          (bucket === "GOLDEN" ? 4 : 0) +
          (bucket === "CANON" ? 3 : 0) +
          (bucket === "TASK" ? 2 : 1)
      });
    });
  });

  if (!actions.length) return;

  actions.sort((a,b) => b.score - a.score);
  const top = actions[0];

  localStorage.setItem(ACTION_KEY, JSON.stringify(top));

  /* ---------- UI ---------- */
  const host =
    document.getElementById("center") ||
    document.getElementById("left") ||
    document.body;

  const card = document.createElement("div");
  card.style.padding = "18px";
  card.style.borderRadius = "18px";
  card.style.background = "linear-gradient(135deg,#1e293b,#020617)";
  card.style.color = "white";
  card.style.boxShadow = "0 30px 60px rgba(0,0,0,.45)";
  card.style.marginBottom = "16px";

  const h = document.createElement("div");
  h.textContent = "🔥 Top Action";
  h.style.fontWeight = "800";
  h.style.marginBottom = "8px";

  const t = document.createElement("div");
  t.textContent = top.name;
  t.style.fontSize = "18px";
  t.style.fontWeight = "600";

  const s = document.createElement("div");
  s.textContent = `Source: ${top.bucket} · Score ${top.score}`;
  s.style.fontSize = "12px";
  s.style.opacity = "0.7";
  s.style.marginTop = "6px";

  card.appendChild(h);
  card.appendChild(t);
  card.appendChild(s);
  host.prepend(card);

  /* ---------- ACTIVITY ---------- */
  const a = JSON.parse(localStorage.getItem(ACT_KEY) || "[]");
  a.push({ at: new Date().toISOString(), msg: `🔥 Top Action set → ${top.name}` });
  localStorage.setItem(ACT_KEY, JSON.stringify(a));

})();
