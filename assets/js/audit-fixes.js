/* MicroPatches — audit fixes runtime v2.3 (header + og/icon fallback + footer) */
(function () {
  "use strict";

  // NOTE: the github.io -> .com canonical/og rewrite was removed; all page
  // sources now use officialmicropatches.com directly (verified site-wide).

  if (!document.querySelector('link[rel="icon"], link[rel="shortcut icon"]')) {
    var ico = document.createElement("link");
    ico.rel = "icon"; ico.href = "/assets/img/favicon.svg";
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
  var setActive = function (tabKey) { document.body.setAttribute("data-active-tab", tabKey || "all"); };
  document.querySelectorAll(".shop-tab[data-tab]").forEach(function (tab) {
    tab.addEventListener("click", function () { setActive(tab.dataset.tab); });
  });
  var activeTab = document.querySelector(".shop-tab.active[data-tab]");
  if (activeTab) setActive(activeTab.dataset.tab);
  var footers = document.querySelectorAll("footer.site-footer");
  if (footers.length > 1) {
    for (var i = 0; i < footers.length - 1; i++) { footers[i].remove(); }
  }
  document.documentElement.setAttribute("data-audit-fixes", "2026-05-16-v2.1");

})();