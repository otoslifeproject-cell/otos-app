// FILE: nav-loader.js (FULL REPLACEMENT)

/*
  OTOS Shared Navigation Loader
  HARDENED VERSION

  Rules enforced:
  - nav.html must be pure HTML
  - This file must be pure JS
  - HTML pages must NOT contain inline nav JS

  Usage (HTML):
  <div id="nav"></div>
  <script src="nav-loader.js" defer></script>
*/

(function () {
  if (window.__OTOS_NAV_LOADED__) return;
  window.__OTOS_NAV_LOADED__ = true;

  document.addEventListener("DOMContentLoaded", () => {
    const navTarget = document.getElementById("nav");
    if (!navTarget) return;

    fetch("nav.html", { cache: "no-store" })
      .then(res => {
        if (!res.ok) throw new Error("Nav fetch failed");
        return res.text();
      })
      .then(html => {
        navTarget.innerHTML = html;
      })
      .catch(err => {
        console.error("OTOS nav-loader error:", err);
      });
  });
})();
