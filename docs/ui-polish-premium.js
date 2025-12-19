/* =========================================================
   OTOS — UI POLISH v1.3
   PREMIUM VISUAL LAYER (TYPE, SPACING, SHADOWS)
   Purpose: Apple-grade finish without touching layout logic
   Location: otos-app/docs/ui-polish-premium.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARD ---------- */
  if (window.OTOS_UI_POLISH_ACTIVE) return;
  window.OTOS_UI_POLISH_ACTIVE = true;

  /* ---------- STYLE ---------- */
  const style = document.createElement("style");
  style.textContent = `
    :root{
      --bg:#020617;
      --panel:#0b1220;
      --ink:#e5e7eb;
      --muted:#94a3b8;
      --accent:#3b82f6;
      --radius:18px;
      --shadow-lg:0 40px 80px rgba(0,0,0,.55);
      --shadow-md:0 24px 48px rgba(0,0,0,.45);
      --shadow-sm:0 12px 24px rgba(0,0,0,.35);
    }

    body{
      background:radial-gradient(1200px 600px at 80% -10%,#0f172a,transparent),var(--bg);
      color:var(--ink);
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,system-ui,sans-serif;
      letter-spacing:.2px;
    }

    .topbar{
      backdrop-filter: blur(10px);
      background:rgba(2,6,23,.7);
      border-bottom:1px solid rgba(255,255,255,.06);
      padding:16px 22px;
    }

    .column{
      padding:18px;
      gap:16px;
    }

    .card,.otos-card{
      background:linear-gradient(180deg,#0f172a,#020617);
      border-radius:var(--radius);
      box-shadow:var(--shadow-md);
      border:1px solid rgba(255,255,255,.06);
      padding:18px;
      transition:transform .15s ease,box-shadow .15s ease;
    }

    .card:hover,.otos-card:hover{
      transform:translateY(-2px);
      box-shadow:var(--shadow-lg);
    }

    .card h1,.card h2,.card h3{
      font-weight:800;
      letter-spacing:.3px;
    }

    .card small{
      color:var(--muted);
    }

    button{
      border-radius:14px;
      font-weight:700;
    }

    .otos-focus-btn{
      background:var(--accent) !important;
    }
  `;
  document.head.appendChild(style);

})();
