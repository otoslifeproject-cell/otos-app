/* =========================================================
   COPY–REPLACE FILE
   Path: /docs/registry-engine.js
   Purpose: Dynamic lane/module rendering from registry.json
   ========================================================= */

(async function () {
  const REGISTRY_URL = "registry.json";

  const app = document.getElementById("app");
  if (!app) return;

  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; }

  function laneFor(slot){
    if (slot === "left") return qs(".lane-parent");
    if (slot === "center") return qs(".lane-centre");
    if (slot === "right") return qs(".lane-agent");
    return null;
  }

  function makeCard(name, id){
    const c = document.createElement("div");
    c.className = "card";
    c.dataset.module = id;

    const t = document.createElement("div");
    t.className = "card-title";
    t.textContent = name;

    c.appendChild(t);
    return c;
  }

  async function loadRegistry(){
    const res = await fetch(REGISTRY_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Registry fetch failed");
    return res.json();
  }

  function clearDynamic(){
    qsa("[data-module]").forEach(n => n.remove());
  }

  try {
    const registry = await loadRegistry();
    clearDynamic();

    registry
      .filter(m => m.enabled)
      .forEach(mod => {
        const lane = laneFor(mod.slot);
        if (!lane) return;

        const stack = qs(".stack", lane);
        if (!stack) return;

        const card = makeCard(mod.name, mod.id);
        stack.appendChild(card);
      });

    console.log("Registry loaded:", registry.length);
  } catch (err){
    console.error(err);
    const pill = document.getElementById("pill-text");
    if (pill) pill.textContent = "Registry load failed";
  }
})();
