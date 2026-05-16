/* MicroPatches — audit fixes runtime
 * Applied via Cowork / Claude / Zapier-GitHub on 2026-05-15.
 * Companion to audit-fixes.css. Load after site.js.
 */
(function () {
  "use strict";
  document.querySelectorAll('link[rel="canonical"]').forEach(function (link) {
    if (link.href.indexOf("officialmicropatches.github.io") !== -1) {
      link.href = link.href.replace("officialmicropatches.github.io", "officialmicropatches.com");
    }
  });
  document.querySelectorAll('meta[property="og:image"], meta[name="og:image"]').forEach(function (m) {
    var c = m.getAttribute("content") || "";
    if (c.indexOf("officialmicropatches.github.io") !== -1) {
      m.setAttribute("content", c.replace("officialmicropatches.github.io", "officialmicropatches.com"));
    }
  });
  if (!document.querySelector('link[rel="icon"], link[rel="shortcut icon"]')) {
    var ico = document.createElement("link");
    ico.rel = "icon";
    ico.href = "/assets/img/favicon.ico";
    document.head.appendChild(ico);
  }
  if (!document.querySelector('meta[property="og:image"]')) {
    var og = document.createElement("meta");
    og.setAttribute("property", "og:image");
    og.setAttribute("content", "https://officialmicropatches.com/assets/img/og-cover.jpg");
    document.head.appendChild(og);
  }
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 80) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  document.body.setAttribute("data-active-tab", "all");
  var setActive = function (tabKey) {
    document.body.setAttribute("data-active-tab", tabKey || "all");
  };
  document.querySelectorAll(".shop-tab[data-tab]").forEach(function (tab) {
    tab.addEventListener("click", function () { setActive(tab.dataset.tab); });
  });
  var activeTab = document.querySelector(".shop-tab.active[data-tab]");
  if (activeTab) setActive(activeTab.dataset.tab);
  var footers = document.querySelectorAll("footer.site-footer");
  if (footers.length > 1) {
    for (var i = 0; i < footers.length - 1; i++) { footers[i].remove(); }
  }
  document.documentElement.setAttribute("data-audit-fixes", "2026-05-15");
})();