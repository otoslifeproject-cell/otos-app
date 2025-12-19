/* =========================================================
   OTOS — ANDY FEEDER v1.0
   DRAG & DROP INTAKE + STATUS (NO NOTION WRITE)
   Purpose: Accept files, stage them, show progress
   Location: otos-app/docs/andy-feeder.js
   FULL SCRIPT REPLACEMENT
   ========================================================= */

(() => {

  /* ---------- GUARD ---------- */
  if (window.OTOS_ANDY_FEEDER_ACTIVE) return;
  window.OTOS_ANDY_FEEDER_ACTIVE = true;

  /* ---------- STATE ---------- */
  const KEY = "OTOS_STAGED_DOCS";
  const staged = JSON.parse(localStorage.getItem(KEY) || "[]");

  const save = () => localStorage.setItem(KEY, JSON.stringify(staged));

  /* ---------- HOST ---------- */
  const host =
    document.getElementById("center") ||
    document.getElementById("left") ||
    document.body;

  /* ---------- UI ---------- */
  const wrap = document.createElement("div");
  wrap.style.padding = "16px";
  wrap.style.borderRadius = "16px";
  wrap.style.background = "#020617";
  wrap.style.color = "#e5e7eb";
  wrap.style.boxShadow = "0 20px 40px rgba(0,0,0,.35)";
  wrap.style.marginBottom = "14px";

  const title = document.createElement("div");
  title.textContent = "Andy · Intake";
  title.style.fontWeight = "700";
  title.style.marginBottom = "10px";

  const drop = document.createElement("div");
  drop.textContent = "Drop files here or click to add";
  drop.style.border = "2px dashed rgba(255,255,255,.15)";
  drop.style.borderRadius = "14px";
  drop.style.padding = "22px";
  drop.style.textAlign = "center";
  drop.style.cursor = "pointer";
  drop.style.marginBottom = "10px";

  const list = document.createElement("div");

  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  input.style.display = "none";

  /* ---------- RENDER ---------- */
  const render = () => {
    list.innerHTML = "";
    staged.forEach((f, i) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.padding = "6px 0";
      row.style.opacity = f.accepted ? "0.7" : "1";
      row.textContent = `${f.name} · ${f.size} bytes`;
      list.appendChild(row);
    });
  };

  /* ---------- ADD ---------- */
  const addFiles = (files) => {
    [...files].forEach(file => {
      staged.push({
        name: file.name,
        size: file.size,
        type: file.type,
        accepted: false,
        at: new Date().toISOString()
      });
    });
    save();
    render();
  };

  drop.onclick = () => input.click();
  input.onchange = e => addFiles(e.target.files);

  drop.ondragover = e => { e.preventDefault(); drop.style.opacity = "0.8"; };
  drop.ondragleave = () => drop.style.opacity = "1";
  drop.ondrop = e => {
    e.preventDefault();
    drop.style.opacity = "1";
    addFiles(e.dataTransfer.files);
  };

  /* ---------- MOUNT ---------- */
  wrap.appendChild(title);
  wrap.appendChild(drop);
  wrap.appendChild(list);
  wrap.appendChild(input);
  host.prepend(wrap);

  render();

})();
