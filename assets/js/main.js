/**
 * main.js ÃÂ¢ÃÂÃÂ Shared JS for MicroPatches site
 */

import { loadQueue, saveQueue, addSubmission, loadSubmissions, uploadProduct, loadProductPhotos, uploadProductPhoto, loadHiddenProducts, saveHiddenProducts, loadHeroImage, uploadHeroImage, loadShopifyLinks, saveShopifyLinks } from "./firebase.js";

/* =========================================================
   STICKY NAV
   ========================================================= */
(function initNav() {
  const nav = document.querySelector(".site-nav");
  if (!nav) return;
  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 50);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* =========================================================
   HAMBURGER MENU
   ========================================================= */
(function initHamburger() {
  const btn  = document.querySelector(".nav-hamburger");
  const menu = document.querySelector(".nav-mobile-menu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    btn.classList.toggle("open", isOpen);
    btn.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      btn.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    });
  });
})();

/* =========================================================
   INTERSECTION OBSERVER ÃÂ¢ÃÂÃÂ FADE-IN ANIMATIONS
   ========================================================= */
function initAnimations() {
  const targets = document.querySelectorAll(".anim, .fade-in");
  if (!targets.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  targets.forEach(el => observer.observe(el));
}
initAnimations();

/* =========================================================
   SHOP PAGE ÃÂ¢ÃÂÃÂ TAB FILTER
   ========================================================= */
(function initShopTabs() {
  const tabsWrap = document.querySelector(".shop-tabs");
  if (!tabsWrap) return;

  const PRODUCT_FILTER_META = {
    "az-dps": { category: "law-enforcement", state: "AZ", type: "state" },
    "auburn-pd-retired": { category: "law-enforcement", state: "WA", type: "police" },
    "chandler-pd": { category: "law-enforcement", state: "AZ", type: "police" },
    "chandler-pd-retired": { category: "law-enforcement", state: "AZ", type: "police" },
    "chicago-pd": { category: "law-enforcement", state: "IL", type: "police" },
    "surprise-pd": { category: "law-enforcement", state: "AZ", type: "police" },
    "el-mirage-pd": { category: "law-enforcement", state: "AZ", type: "police" },
    "florida-hp": { category: "law-enforcement", state: "FL", type: "state" },
    "gila-river-pd": { category: "law-enforcement", state: "AZ", type: "tribal" },
    "gilbert-pd": { category: "law-enforcement", state: "AZ", type: "police" },
    "goodyear-pd-retired": { category: "law-enforcement", state: "AZ", type: "police" },
    "honolulu-pd": { category: "law-enforcement", state: "HI", type: "police" },
    "houston-tx": { category: "law-enforcement", state: "TX", type: "police" },
    "kent-pd": { category: "law-enforcement", state: "WA", type: "police" },
    "maricopa-pd": { category: "law-enforcement", state: "AZ", type: "police" },
    "maricopa-sheriff": { category: "law-enforcement", state: "AZ", type: "sheriff" },
    "maui-pd": { category: "law-enforcement", state: "HI", type: "police" },
    "mesa-pd": { category: "law-enforcement", state: "AZ", type: "police" },
    "nypd": { category: "law-enforcement", state: "NY", type: "police" },
    "phoenix-pd": { category: "law-enforcement", state: "AZ", type: "police" },
    "pinal-sheriff": { category: "law-enforcement", state: "AZ", type: "sheriff" },
    "prescott-pd": { category: "law-enforcement", state: "AZ", type: "police" },
    "queen-creek-pd": { category: "law-enforcement", state: "AZ", type: "police" },
    "san-jose-pd": { category: "law-enforcement", state: "CA", type: "police" },
    "scottsdale-pd": { category: "law-enforcement", state: "AZ", type: "police" },
    "seattle-pd": { category: "law-enforcement", state: "WA", type: "police" },
    "simi-valley-pd": { category: "law-enforcement", state: "CA", type: "police" },
    "tempe-pd": { category: "law-enforcement", state: "AZ", type: "police" },
    "tucson-pd": { category: "law-enforcement", state: "AZ", type: "police" },
    "us-border-patrol": { category: "law-enforcement", state: "all", type: "federal" },
    "101st-airborne": { category: "military", branch: "army" },
    "10th-mountain": { category: "military", branch: "army" },
    "173rd-airborne": { category: "military", branch: "army" },
    "504th-pir-ww2": { category: "military", branch: "army" },
    "82nd-airborne": { category: "military", branch: "army" },
    "seabees": { category: "military", branch: "navy" },
    "chandler-fire": { category: "fire", state: "AZ", type: "department" },
    "amr-emt": { category: "ems", state: "AZ", type: "emt" },
    "amr-paramedic": { category: "ems", state: "AZ", type: "paramedic" },
    "amr-cct-rn": { category: "ems", state: "AZ", type: "cct-rn" },
    "pink-patch": { category: "pink-patch", state: "all", type: "awareness" },
    "chandler-pd-pink": { category: "pink-patch", state: "AZ", type: "awareness" },
    "harris-constable-pct4": { category: "law-enforcement", state: "TX", type: "sheriff" },
    "ice": { category: "law-enforcement", state: "all", type: "federal" },
    "flagstaff-pd-retired": { category: "law-enforcement", state: "AZ", type: "police" },
    "austin-pd": { category: "law-enforcement", state: "TX", type: "police" },
    "oakland-pd": { category: "law-enforcement", state: "CA", type: "police" },
    "birmingham-pd": { category: "law-enforcement", state: "AL", type: "police" },
    "pima-sheriff": { category: "law-enforcement", state: "AZ", type: "sheriff" },
    "flagstaff-pd": { category: "law-enforcement", state: "AZ", type: "police" },
    "madison-pd": { category: "law-enforcement", state: "WI", type: "police" },
    "texarkana-pd": { category: "law-enforcement", state: "TX", type: "police" },
    "ohio-deputy-sheriff": { category: "law-enforcement", state: "OH", type: "sheriff" },
    "avondale-pd": { category: "law-enforcement", state: "AZ", type: "police" },
    "arizona-rangers": { category: "law-enforcement", state: "AZ", type: "state" },
    "harris-county-sheriff": { category: "law-enforcement", state: "TX", type: "sheriff" },
    "glendale-pd-az": { category: "law-enforcement", state: "AZ", type: "police" },
    "cochise-sheriff": { category: "law-enforcement", state: "AZ", type: "sheriff" },
    "buckeye-pd": { category: "law-enforcement", state: "AZ", type: "police" },
    "asu-pd": { category: "law-enforcement", state: "AZ", type: "university" },
    "detroit-pd": { category: "law-enforcement", state: "MI", type: "police" },
    "santa-fe-pd": { category: "law-enforcement", state: "NM", type: "police" },
    "apache-junction-pd": { category: "law-enforcement", state: "AZ", type: "police" },
    "peoria-pd-az": { category: "law-enforcement", state: "AZ", type: "police" },
    "auburn-pd": { category: "law-enforcement", state: "WA", type: "police" },
    "maricopa-detention-deputy": { category: "corrections", state: "AZ", type: "detention" },
    "az-doc": { category: "corrections", state: "AZ", type: "corrections" },
    "az-doc-logo": { category: "corrections", state: "AZ", type: "corrections" },
    "75th-ranger-regiment": { category: "military", state: "all", branch: "army" },
    "us-air-force": { category: "military", state: "all", branch: "air-force" },
    "3rd-battalion-7th-marines": { category: "military", state: "all", branch: "marines" },
    "army-ranger-medic": { category: "military", state: "all", branch: "army" },
    "phoenix-fire": { category: "fire", state: "AZ", type: "department" },
    "mammoth-fire": { category: "fire", state: "AZ", type: "department" },
    "pomona-pink-patch": { category: "pink-patch", state: "CA", type: "awareness" },
    "bulk-orders": { category: "all", state: "all", type: "quote" }
  };

  const tabs    = tabsWrap.querySelectorAll(".shop-tab");
  const cards   = document.querySelectorAll(".product-card[data-category]");
  const grid    = document.querySelector(".product-grid");
  const filterPanel = document.querySelector(".shop-filter-panel");
  const filterGroups = filterPanel ? filterPanel.querySelectorAll(".shop-filter-group") : [];
  const emptyState = document.querySelector(".shop-empty-state");
  const validTabs = ["law-enforcement", "corrections", "military", "fire", "ems", "pink-patch"];
  const filterState = { category: "all", state: "all", type: "all", branch: "all" };

  cards.forEach(card => {
    const imgEl = card.querySelector(".product-card-img[data-product-id]");
    const productId = imgEl && imgEl.dataset.productId;
    const meta = productId ? PRODUCT_FILTER_META[productId] : null;
    if (!meta) return;
    Object.entries(meta).forEach(([key, value]) => {
      if (value) card.dataset[key] = value;
    });
  });

  function scrollToShopTop() {
    const forceTop = () => {
      const scroller = document.scrollingElement || document.documentElement;
      window.scrollTo(0, 0);
      if (scroller) scroller.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    forceTop();
    requestAnimationFrame(forceTop);
    setTimeout(forceTop, 50);
    setTimeout(forceTop, 250);
  }

  function resetSubfilters() {
    filterState.state = "all";
    filterState.type = "all";
    filterState.branch = "all";
    if (!filterPanel) return;
    filterPanel.querySelectorAll("select[data-shop-filter]").forEach(select => {
      select.value = "all";
    });
    filterPanel.querySelectorAll(".shop-subfilter").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.filterValue === "all");
    });
  }

  function updateFilterPanel(cat) {
    if (!filterPanel) return;
    const hasFilters = cat !== "all" && cat !== "pink-patch";
    filterPanel.classList.toggle("is-visible", hasFilters);
    filterGroups.forEach(group => {
      group.classList.toggle("active", group.dataset.filterFor === cat);
    });
  }

  function cardMatchesFilters(card, cat) {
    if (cat === "all") return true;
    if (card.dataset.category !== cat) return false;
    if (filterState.state !== "all" && card.dataset.state !== "all" && card.dataset.state !== filterState.state) return false;
    if (cat === "military" && filterState.branch !== "all" && card.dataset.branch !== filterState.branch) return false;
    if (cat !== "military" && filterState.type !== "all" && card.dataset.type !== filterState.type) return false;
    return true;
  }

  function activateTab(cat, shouldResetFilters = true) {
    filterState.category = cat;
    if (shouldResetFilters) resetSubfilters();
    updateFilterPanel(cat);
    tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === cat));
    let visibleCount = 0;
    cards.forEach(card => {
      const match = cardMatchesFilters(card, cat);
      if (!match) {
        card.style.display = "none";
      } else {
        let isAdminHidden = false;
        try {
          const imgEl = card.querySelector(".product-card-img[data-product-id]");
          const productId = imgEl && imgEl.dataset.productId;
          isAdminHidden = productId ? hiddenProductIds.includes(productId) : false;
        } catch(e) {}
        card.style.display = isAdminHidden ? "none" : "";
        if (!isAdminHidden) {
          card.classList.add("visible");
          visibleCount += 1;
        }
      }
    });
    if (emptyState) emptyState.hidden = visibleCount > 0;
    if (grid) grid.style.opacity = "0.4";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (grid) grid.style.opacity = "1";
      });
    });
  }

  function setShopCategory(cat, shouldScroll = false) {
    activateTab(cat);
    history.replaceState(null, "", "#" + cat);
    if (shouldScroll) scrollToShopTop();
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      setShopCategory(tab.dataset.tab, false);
    });
  });

  if (filterPanel) {
    filterPanel.addEventListener("change", e => {
      const select = e.target.closest("select[data-shop-filter]");
      if (!select) return;
      filterState[select.dataset.shopFilter] = select.value;
      activateTab(filterState.category, false);
    });

    filterPanel.addEventListener("click", e => {
      const btn = e.target.closest(".shop-subfilter");
      if (!btn) return;
      const key = btn.dataset.shopFilter;
      filterState[key] = btn.dataset.filterValue || "all";
      const group = btn.closest(".shop-filter-group");
      if (group) {
        group.querySelectorAll(`.shop-subfilter[data-shop-filter="${key}"]`).forEach(item => {
          item.classList.toggle("active", item === btn);
        });
      }
      activateTab(filterState.category, false);
    });
  }

  window.applyActiveShopFilters = () => activateTab(filterState.category, false);

  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href*="#"]');
    if (!link) return;

    const url = new URL(link.getAttribute("href"), location.href);
    const samePage = url.pathname.split("/").pop() === "shop.html" && location.pathname.split("/").pop() === "shop.html";
    const hash = url.hash.replace("#", "");
    if (!samePage || !validTabs.includes(hash)) return;

    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    setShopCategory(hash, true);
  }, true);

  window.addEventListener("hashchange", () => {
    const hash = location.hash.replace("#", "");
    if (validTabs.includes(hash)) setShopCategory(hash, true);
  });

  // Hash detection on load
  const hash = location.hash.replace("#", "");
  if (hash) {
    if (validTabs.includes(hash)) {
      activateTab(hash);
      setTimeout(scrollToShopTop, 200);
      return;
    }
  }
  activateTab("all");
})();

/* =========================================================
   CUSTOM ORDER PAGE ÃÂ¢ÃÂÃÂ URL PARAM ?type=exchange
   ========================================================= */
(function initCustomPage() {
  const sel = document.getElementById("product-type");
  if (!sel) return;
  const params = new URLSearchParams(location.search);
  if (params.get("type") === "exchange") {
    sel.value = "Patch Exchange";
  }
})();

/* =========================================================
   QUEUE PAGE ÃÂ¢ÃÂÃÂ LOAD & RENDER QUEUE
   ========================================================= */
const queueFullList = document.querySelector(".queue-full-list");
const queuePreviewList = document.querySelector(".queue-preview-list");
let allQueueItems = [];

async function initQueuePage() {
  if (!queueFullList && !queuePreviewList) return;

  const loadingEls = document.querySelectorAll(".queue-loading");
  try {
    allQueueItems = await loadQueue();

    if (queuePreviewList) {
      renderQueuePreview(allQueueItems.slice(0, 4));
    }
    if (queueFullList) {
      renderQueueFull(allQueueItems);
      loadingEls.forEach(el => el.remove());
    }
  } catch (_e) {
    loadingEls.forEach(el => {
      el.textContent = "Unable to load queue. Please try again later.";
    });
  }
}

function escH(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* =========================================================
   PRODUCT PHOTOS
   ========================================================= */
const PRODUCTS = [
  // Law Enforcement
  { id: "az-dps",              name: "Arizona Department of Public Safety" },
  { id: "auburn-pd-retired",   name: "Auburn Police Department Retired" },
  { id: "chandler-pd",         name: "Chandler Police Department" },
  { id: "chandler-pd-retired", name: "Chandler Police Department Retired" },
  { id: "chicago-pd",          name: "Chicago Police Department" },
  { id: "surprise-pd",         name: "City of Surprise Police Department" },
  { id: "el-mirage-pd",        name: "El Mirage Police Department" },
  { id: "florida-hp",          name: "Florida Highway Patrol" },
  { id: "gila-river-pd",       name: "Gila River Indian Police Department" },
  { id: "gilbert-pd",          name: "Gilbert Police Department" },
  { id: "goodyear-pd-retired", name: "Goodyear Police Department Retired" },
  { id: "honolulu-pd",         name: "Honolulu Police Department" },
  { id: "houston-tx",          name: "Houston Texas Keychain" },
  { id: "kent-pd",             name: "Kent Police Department" },
  { id: "maricopa-pd",         name: "Maricopa Police Department" },
  { id: "maricopa-sheriff",    name: "Maricopa County Sheriff Office" },
  { id: "maui-pd",             name: "Maui Police Department" },
  { id: "mesa-pd",             name: "Mesa Police Department" },
  { id: "nypd",                name: "New York City Police Department" },
  { id: "phoenix-pd",          name: "Phoenix Police Department" },
  { id: "pinal-sheriff",       name: "Pinal County Sheriff Office" },
  { id: "prescott-pd",         name: "Prescott Police Department" },
  { id: "queen-creek-pd",      name: "Queen Creek Police Department" },
  { id: "san-jose-pd",         name: "San Jose Police Department" },
  { id: "scottsdale-pd",       name: "Scottsdale Police Department" },
  { id: "seattle-pd",          name: "Seattle Police Department" },
  { id: "simi-valley-pd",      name: "Simi Valley Police Department" },
  { id: "tempe-pd",            name: "Tempe Police Department" },
  { id: "tucson-pd",           name: "Tucson Police Department" },
  { id: "us-border-patrol",    name: "U.S. Border Patrol" },
  // Additional active law enforcement / corrections
  { id: "harris-constable-pct4", name: "Harris County Constable Precinct 4" },
  { id: "ice", name: "Immigration and Customs Enforcement" },
  { id: "flagstaff-pd-retired", name: "Flagstaff Police Department Retired" },
  { id: "austin-pd", name: "Austin Texas Police Department" },
  { id: "oakland-pd", name: "Oakland Police Department" },
  { id: "birmingham-pd", name: "Birmingham Police Department" },
  { id: "pima-sheriff", name: "Pima County Sheriff's Office" },
  { id: "flagstaff-pd", name: "Flagstaff Police Department" },
  { id: "madison-pd", name: "Madison Police Department" },
  { id: "texarkana-pd", name: "Texarkana Police Department" },
  { id: "ohio-deputy-sheriff", name: "Ohio Deputy Sheriff" },
  { id: "avondale-pd", name: "Avondale Police Department" },
  { id: "arizona-rangers", name: "Arizona Rangers" },
  { id: "harris-county-sheriff", name: "Harris County Sheriff's Office" },
  { id: "glendale-pd-az", name: "Glendale Police Department Arizona" },
  { id: "cochise-sheriff", name: "Cochise County Sheriff" },
  { id: "buckeye-pd", name: "Buckeye Police Department" },
  { id: "asu-pd", name: "Arizona State University Police Department" },
  { id: "detroit-pd", name: "Detroit Police Department" },
  { id: "santa-fe-pd", name: "Santa Fe Police Department" },
  { id: "apache-junction-pd", name: "Apache Junction Police Department" },
  { id: "peoria-pd-az", name: "Peoria Arizona Police Department" },
  { id: "auburn-pd", name: "Auburn Police Department" },
  { id: "maricopa-detention-deputy", name: "Maricopa County Sheriff's Office Detention Deputy" },
  { id: "az-doc", name: "Arizona Department of Corrections" },
  { id: "az-doc-logo", name: "Arizona Department of Corrections Logo" },
  { id: "75th-ranger-regiment", name: "75th Ranger Regiment" },
  { id: "us-air-force", name: "U.S. Air Force" },
  { id: "3rd-battalion-7th-marines", name: "3rd Battalion 7th Marines" },
  { id: "army-ranger-medic", name: "Army Ranger Medic" },
  { id: "phoenix-fire", name: "Phoenix Fire Department" },
  { id: "mammoth-fire", name: "Mammoth Fire Department" },
  { id: "pomona-pink-patch", name: "Pomona Police Pink Patch" },
  // Military
  { id: "101st-airborne",      name: "101st Airborne Division Screaming Eagles" },
  { id: "10th-mountain",       name: "10th Mountain Division" },
  { id: "173rd-airborne",      name: "173rd Airborne Brigade Sky Soldiers" },
  { id: "504th-pir-ww2",       name: "504th Parachute Infantry Regiment WW2" },
  { id: "82nd-airborne",       name: "82nd Airborne Division" },
  { id: "seabees",             name: "U.S. Naval Construction Battalions Seabees" },
  // Fire & EMS
  { id: "chandler-fire",       name: "Chandler Fire Department" },
  { id: "amr-emt",             name: "American Medical Response AMR EMT" },
  { id: "amr-paramedic",       name: "American Medical Response AMR Paramedic" },
  { id: "amr-cct-rn",          name: "American Medical Response CCT-RN" },
  // Pink Patch
  { id: "pink-patch",          name: "Pink Patch Project" },
  { id: "chandler-pd-pink",    name: "Chandler PD Pink Patch Project" },
  // Accessories
  { id: "bulk-orders",         name: "Bulk and Wholesale Orders" }
];

function applyProductPhoto(productId, url) {
  if (!url) return;
  const cardImgs = document.querySelectorAll(`.product-card-img[data-product-id="${productId}"]`);
  if (!cardImgs.length) return;
  cardImgs.forEach(cardImg => {
    const placeholder = cardImg.querySelector(".img-placeholder");
    const img = cardImg.querySelector(".product-card-photo");
    if (placeholder) placeholder.style.display = "none";
    if (img) { img.src = url; img.style.display = "block"; }
  });
}

function applyHeroImage(url) {
  if (!url) return;
  const img = document.getElementById("hero-logo-img");
  const placeholder = document.getElementById("hero-logo-placeholder");
  const card = img && img.closest(".hero-product-card");
  if (img) { img.src = url; img.style.display = "block"; }
  if (placeholder) placeholder.style.display = "none";
  if (card) card.classList.add("hero-logo-loaded");
}

async function initHeroImage() {
  try {
    const url = await loadHeroImage();
    applyHeroImage(url);
  } catch (_e) { /* silent */ }
}

async function initProductPhotos() {
  try {
    const photos = await loadProductPhotos();
    Object.entries(photos).forEach(([id, url]) => applyProductPhoto(id, url));
  } catch (_e) { /* silent ÃÂ¢ÃÂÃÂ photos are non-critical */ }
}

let hiddenProductIds = [];
let shopifyLinks = {};
let adminShopifyLinks = {};

const DEFAULT_HIDDEN_PRODUCT_IDS = Object.freeze([
  "maricopa-pd",
  "prescott-pd",
  "honolulu-pd",
  "seattle-pd",
  "us-air-force",
  "101st-airborne",
  "el-mirage-pd",
  "nypd",
  "kent-pd",
  "florida-hp",
  "10th-mountain",
  "seabees",
  "queen-creek-pd",
  "504th-pir-ww2",
  "simi-valley-pd",
  "maui-pd",
  "chandler-pd-pink"
]);

function mergeHiddenProductIds(savedHidden = []) {
  return [...new Set([...DEFAULT_HIDDEN_PRODUCT_IDS, ...(Array.isArray(savedHidden) ? savedHidden : [])])];
}

const DEFAULT_SHOPIFY_LINKS = Object.freeze({
  "az-dps": "https://micropatches.myshopify.com/products/arizona-department-of-public-safety-az-state-trooper-collector-patch-keychain-ma",
  "auburn-pd-retired": "https://micropatches.myshopify.com/products/auburn-police-department-retired-patch-collector-patch-keychain-magnet-police-wi",
  "chandler-pd": "https://micropatches.myshopify.com/products/chandler-police-department-chandler-pd-collector-patch-keychain-magnet-croc-char",
  "chandler-pd-retired": "https://micropatches.myshopify.com/products/chandler-police-department-retired-chandler-pd-collector-patch-keychain-magnet-p",
  "chicago-pd": "https://micropatches.myshopify.com/products/chicago-police-department-collector-patch-keychain-magnet-croc-charm-police-wife",
  "surprise-pd": "https://micropatches.myshopify.com/products/city-of-surprise-police-patch-keychain-magnet-3d-printed-arizona-pd-pride",
  "el-mirage-pd": "https://micropatches.myshopify.com/products/el-mirage-pd-patch-keychain-magnet-3d-printed-arizona-police-pride-accessory",
  "florida-hp": "https://micropatches.myshopify.com/products/florida-highway-patrol-keychain-3d-printed-trooper-collector-patch",
  "gila-river-pd": "https://micropatches.myshopify.com/products/gila-river-indian-police-department-collector-patch-keychain-magnet-police-wife",
  "gilbert-pd": "https://micropatches.myshopify.com/products/gilbert-police-department-gilbert-pd-collector-patch-keychain-magnet-arizona-pol",
  "goodyear-pd-retired": "https://micropatches.myshopify.com/products/goodyear-police-department-retired-goodyear-pd-collector-patch-keychain-magnet-p",
  "honolulu-pd": "https://micropatches.myshopify.com/products/honolulu-police-department-honolulu-pd-collector-patch-keychain-magnet-hawaii-po",
  "houston-tx": "https://micropatches.myshopify.com/products/houston-police-keychain-police-gift",
  "kent-pd": "https://micropatches.myshopify.com/products/kent-police-department-kent-pd-collector-patch-keychain-magnet-washington-police",
  "maricopa-pd": "https://micropatches.myshopify.com/products/maricopa-police-department-maricopa-pd-collector-patch-keychain-magnet-arizona-p",
  "maricopa-sheriff": "https://micropatches.myshopify.com/products/maricopa-county-sheriff39s-office-collector-patch-keychain-magnet-police-wife-gi",
  "maui-pd": "https://micropatches.myshopify.com/products/maui-police-department-collector-patch-keychain-magnet-police-wife-gift-thin-blu",
  "mesa-pd": "https://micropatches.myshopify.com/products/mesa-police-department-collector-patch-keychain-magnet-police-wife-gift-thin-blu",
  "nypd": "https://micropatches.myshopify.com/products/new-york-city-police-department-collector-patch-keychain-magnet-croc-charm-polic",
  "phoenix-pd": "https://micropatches.myshopify.com/products/phoenix-police-department-keychain-3d-printed-replica",
  "pinal-sheriff": "https://micropatches.myshopify.com/products/pinal-county-sheriff-replica-patch-keychain-thin-blue-line-accessory",
  "prescott-pd": "https://micropatches.myshopify.com/products/prescott-police-department-prescott-pd-collector-patch-keychain-magnet-croc-char",
  "queen-creek-pd": "https://micropatches.myshopify.com/products/queen-creek-police-department-queen-creek-pd-collector-patch-keychain-magnet-ari",
  "san-jose-pd": "https://micropatches.myshopify.com/products/san-jose-police-department-san-jose-pd-collector-patch-keychain-magnet-californi",
  "scottsdale-pd": "https://micropatches.myshopify.com/products/scottsdale-police-department-scottsdale-pd-collector-patch-keychain-magnet-arizo",
  "seattle-pd": "https://micropatches.myshopify.com/products/seattle-police-department-collector-patch-keychain-magnet-police-wife-gift-thin",
  "simi-valley-pd": "https://micropatches.myshopify.com/products/simi-valley-police-patch-keychain-3d-printed-collector-pride",
  "tempe-pd": "https://micropatches.myshopify.com/products/tempe-police-department-tempe-pd-collector-patch-keychain-magnet-arizona-police",
  "tucson-pd": "https://micropatches.myshopify.com/products/tucson-police-department-keychain-tucson-pd-collector-patch-keychain",
  "us-border-patrol": "https://micropatches.myshopify.com/products/us-border-patrol-collector-patch-keychain-federal-law-enforcement-wife-gift-thin",
  "101st-airborne": "https://micropatches.myshopify.com/products/101st-airborne-division-patch-keychain-magnet-military-collectible",
  "10th-mountain": "https://micropatches.myshopify.com/products/10th-mountain-division-collector-patch-keychain-magnet-military-family-gift-supp",
  "173rd-airborne": "https://micropatches.myshopify.com/products/173rd-airborne-brigade-quotsky-soldiersquot-patch-keychain-3d-printed-military-r",
  "504th-pir-ww2": "https://micropatches.myshopify.com/products/504th-pir-ww2-devil-in-baggy-pants-keychain-magnet-3d-printed-patch",
  "82nd-airborne": "https://micropatches.myshopify.com/products/82nd-airborne-division-collector-patch-keychain-magnet-military-family-gift-supp",
  "seabees": "https://micropatches.myshopify.com/products/us-naval-construction-battalions-quotseabeesquot-collector-patch-keychain-vetera",
  "chandler-fire": "https://micropatches.myshopify.com/products/chandler-fire-department-collector-patch-keychain-magnet-firefighter-family-gift",
  "amr-emt": "https://micropatches.myshopify.com/products/american-medical-response-amr-emt-collector-patch-keychain-magnet-croc-charm-ems",
  "amr-paramedic": "https://micropatches.myshopify.com/products/american-medical-response-amr-paramedic-collector-patch-keychain-magnet-croc-cha",
  "amr-cct-rn": "https://micropatches.myshopify.com/products/american-medical-response-cct-rn-collector-patch-keychain-magnet-croc-charm-ems",
  "pink-patch": "https://micropatches.myshopify.com/products/pink-patch-project-police-patches-gone-pink-for-breast-cancer-research-10-donate",
  "chandler-pd-pink": "https://micropatches.myshopify.com/products/chandler-pd-pink-patch-project-chandler-pd-goes-pink-for-breast-cancer-10-donate",
  "harris-constable-pct4": "https://micropatches.myshopify.com/products/harris-county-constable-precinct-4-keychain",
  "ice": "https://micropatches.myshopify.com/products/ice-keychain-immigration-and-customs-enforcement-keychain-federal-law-enforcemen",
  "flagstaff-pd-retired": "https://micropatches.myshopify.com/products/flagstaff-retired-patch-police-department-keychain-flagstaff-pd-keychain-police",
  "austin-pd": "https://micropatches.myshopify.com/products/austin-texas-police-department-collector-patch-keychain-police-gift-thin-blue-li",
  "oakland-pd": "https://micropatches.myshopify.com/products/oakland-california-police-department-collector-patch-keychain-police-gift-thin-b",
  "birmingham-pd": "https://micropatches.myshopify.com/products/birmingham-alabama-police-department-collector-patch-keychain-police-gift-thin-b",
  "pima-sheriff": "https://micropatches.myshopify.com/products/pima-county-sheriff39s-office-collector-patch-keychain-magnet-deputy-wife-gift-t",
  "flagstaff-pd": "https://micropatches.myshopify.com/products/flagstaff-police-department-collector-patch-keychain-police-gift-thin-blue-line",
  "madison-pd": "https://micropatches.myshopify.com/products/madison-police-department-collector-patch-keychain-police-gift-thin-blue-line",
  "texarkana-pd": "https://micropatches.myshopify.com/products/texarkana-police-department-keychain-tpd-keychain-police-keychain",
  "ohio-deputy-sheriff": "https://micropatches.myshopify.com/products/ohio-deputy-sheriff-keychain-sheriff-keychain-45mm",
  "avondale-pd": "https://micropatches.myshopify.com/products/avondale-police-department-keychain-avondale-arizona-pd-keychain-police-keychain",
  "arizona-rangers": "https://micropatches.myshopify.com/products/arizona-rangers-keychain-law-enforcement-keychain",
  "harris-county-sheriff": "https://micropatches.myshopify.com/products/harris-county-sheriffs-office-keychain-texas-pride-gift-constable-gift",
  "glendale-pd-az": "https://micropatches.myshopify.com/products/glendale-police-department-arizona-collector-patch-keychain-magnet-police-wife-g",
  "cochise-sheriff": "https://micropatches.myshopify.com/products/cochise-county-sheriff-keychain-sheriff-keychain-sheriff-deputy-keychain",
  "buckeye-pd": "https://micropatches.myshopify.com/products/buckeye-police-department-arizona-collector-patch-keychain-magnet-police-wife-gi",
  "asu-pd": "https://micropatches.myshopify.com/products/arizona-state-university-police-department-keychain-asu-police-keychain-45mm",
  "detroit-pd": "https://micropatches.myshopify.com/products/detroit-michigan-police-department-keychain-police-keychain-45mm",
  "santa-fe-pd": "https://micropatches.myshopify.com/products/santa-fe-new-mexico-police-department-keychain-police-keychain-45mm",
  "apache-junction-pd": "https://micropatches.myshopify.com/products/apache-junction-police-department-arizona-collector-patch-keychain-magnet-police",
  "peoria-pd-az": "https://micropatches.myshopify.com/products/peoria-arizona-police-patch-keychain-magnet-3d-printed-collector-item",
  "auburn-pd": "https://micropatches.myshopify.com/products/auburn-police-department-patch-keychain-3d-printed-replica-thin-blue-line-access",
  "maricopa-detention-deputy": "https://micropatches.myshopify.com/products/maricopa-county-sheriffs-office-detention-deputy-keychain-corrections-officer-ke",
  "az-doc": "https://micropatches.myshopify.com/products/arizona-department-of-corrections-keychain-doc-keychain-corrections-keychain",
  "az-doc-logo": "https://micropatches.myshopify.com/products/arizona-department-of-corrections-logo-keychain-corrections-keychain",
  "75th-ranger-regiment": "https://micropatches.myshopify.com/products/75th-ranger-regiment-collector-patch-keychain-military-family-gift-support-our-t",
  "us-air-force": "https://micropatches.myshopify.com/products/us-airforce-keychain-military-collectible",
  "3rd-battalion-7th-marines": "https://micropatches.myshopify.com/products/3rd-batallion-7th-marines-patch-keychain-military-collectible",
  "army-ranger-medic": "https://micropatches.myshopify.com/products/army-ranger-medic-collector-patch-keychain-military-family-gift-support-our-troo",
  "phoenix-fire": "https://micropatches.myshopify.com/products/phoenix-fire-department-keychain-collector-patch-keychain-magnet-firefighter-fam",
  "mammoth-fire": "https://micropatches.myshopify.com/products/mammoth-fire-department-keychain-collector-patch-keychain-magnet-firefighter-fam",
  "pomona-pink-patch": "https://micropatches.myshopify.com/products/pomona-police-pink-patch-keychain-breast-cancer-awareness-support-3d-replica"
});

/* =========================================================
   PRODUCT VARIANT TYPES — pricing, sizing, and descriptions
   ========================================================= */
const PRODUCT_TYPE_DEFAULTS = Object.freeze({
  magnet: {
    label: "Micro Magnet",
    price: 14.99,
    size: "25mm (approx. 1 in.)",
  },
  keychain: {
    label: "MicroKeychain",
    price: 13.99,
    size: "45mm (approx. 1.75 in.)",
  },
  pin: {
    label: "Micro Pin",
    price: 9.99,
    size: "22mm (approx. 0.875 in.)",
  },
  charm: {
    label: "Micro Charm",
    price: 9.99,
    size: "20mm (approx. 0.75 in.)",
  }
});

/* Add variant Shopify URLs here as you create Shopify listings.
   The "keychain" variant is auto-filled from DEFAULT_SHOPIFY_LINKS.
   Example:
   "tucson-pd": {
     micro:   "https://micropatches.myshopify.com/products/tucson-pd-micro-keychain",
     charm:   "https://micropatches.myshopify.com/products/tucson-pd-croc-charm",
     pin:     "https://micropatches.myshopify.com/products/tucson-pd-micro-pin",
     magnet:  "https://micropatches.myshopify.com/products/tucson-pd-micro-magnet",
   }
*/
const PRODUCT_VARIANT_URLS = {};

/* =========================================================
   PRODUCT DATA — supplemental info for product detail pages
   ========================================================= */
const PRODUCT_DATA = Object.freeze({
  "az-dps":                   { name: "Arizona Department of Public Safety", location: "Statewide, AZ", category: "Law Enforcement" },
  "auburn-pd-retired":        { name: "Auburn Police Department Retired", location: "Auburn, WA", category: "Law Enforcement" },
  "chandler-pd":              { name: "Chandler Police Department", location: "Chandler, AZ", category: "Law Enforcement" },
  "chandler-pd-retired":      { name: "Chandler Police Department Retired", location: "Chandler, AZ", category: "Law Enforcement" },
  "chicago-pd":               { name: "Chicago Police Department", location: "Chicago, IL", category: "Law Enforcement" },
  "surprise-pd":              { name: "City of Surprise Police Department", location: "Surprise, AZ", category: "Law Enforcement" },
  "el-mirage-pd":             { name: "El Mirage Police Department", location: "El Mirage, AZ", category: "Law Enforcement" },
  "florida-hp":               { name: "Florida Highway Patrol", location: "Statewide, FL", category: "Law Enforcement" },
  "gila-river-pd":            { name: "Gila River Indian Police Department", location: "Gila River, AZ", category: "Law Enforcement" },
  "gilbert-pd":               { name: "Gilbert Police Department", location: "Gilbert, AZ", category: "Law Enforcement" },
  "goodyear-pd-retired":      { name: "Goodyear Police Department Retired", location: "Goodyear, AZ", category: "Law Enforcement" },
  "honolulu-pd":              { name: "Honolulu Police Department", location: "Honolulu, HI", category: "Law Enforcement" },
  "houston-tx":               { name: "Houston Police Department", location: "Houston, TX", category: "Law Enforcement" },
  "kent-pd":                  { name: "Kent Police Department", location: "Kent, WA", category: "Law Enforcement" },
  "maricopa-pd":              { name: "Maricopa Police Department", location: "Maricopa, AZ", category: "Law Enforcement" },
  "maricopa-sheriff":         { name: "Maricopa County Sheriff's Office", location: "Maricopa County, AZ", category: "Law Enforcement" },
  "maui-pd":                  { name: "Maui Police Department", location: "Maui, HI", category: "Law Enforcement" },
  "mesa-pd":                  { name: "Mesa Police Department", location: "Mesa, AZ", category: "Law Enforcement" },
  "nypd":                     { name: "New York City Police Department", location: "New York City, NY", category: "Law Enforcement" },
  "phoenix-pd":               { name: "Phoenix Police Department", location: "Phoenix, AZ", category: "Law Enforcement" },
  "pinal-sheriff":            { name: "Pinal County Sheriff's Office", location: "Pinal County, AZ", category: "Law Enforcement" },
  "prescott-pd":              { name: "Prescott Police Department", location: "Prescott, AZ", category: "Law Enforcement" },
  "queen-creek-pd":           { name: "Queen Creek Police Department", location: "Queen Creek, AZ", category: "Law Enforcement" },
  "san-jose-pd":              { name: "San Jose Police Department", location: "San Jose, CA", category: "Law Enforcement" },
  "scottsdale-pd":            { name: "Scottsdale Police Department", location: "Scottsdale, AZ", category: "Law Enforcement" },
  "seattle-pd":               { name: "Seattle Police Department", location: "Seattle, WA", category: "Law Enforcement" },
  "simi-valley-pd":           { name: "Simi Valley Police Department", location: "Simi Valley, CA", category: "Law Enforcement" },
  "tempe-pd":                 { name: "Tempe Police Department", location: "Tempe, AZ", category: "Law Enforcement" },
  "tucson-pd":                { name: "Tucson Police Department", location: "Tucson, AZ", category: "Law Enforcement" },
  "us-border-patrol":         { name: "U.S. Border Patrol", location: "Federal — Nationwide", category: "Law Enforcement" },
  "harris-constable-pct4":    { name: "Harris County Constable Precinct 4", location: "Harris County, TX", category: "Law Enforcement" },
  "ice":                      { name: "Immigration and Customs Enforcement", location: "Federal — Nationwide", category: "Law Enforcement" },
  "flagstaff-pd-retired":     { name: "Flagstaff Police Department Retired", location: "Flagstaff, AZ", category: "Law Enforcement" },
  "austin-pd":                { name: "Austin Police Department", location: "Austin, TX", category: "Law Enforcement" },
  "oakland-pd":               { name: "Oakland Police Department", location: "Oakland, CA", category: "Law Enforcement" },
  "birmingham-pd":            { name: "Birmingham Police Department", location: "Birmingham, AL", category: "Law Enforcement" },
  "pima-sheriff":             { name: "Pima County Sheriff's Office", location: "Pima County, AZ", category: "Law Enforcement" },
  "flagstaff-pd":             { name: "Flagstaff Police Department", location: "Flagstaff, AZ", category: "Law Enforcement" },
  "madison-pd":               { name: "Madison Police Department", location: "Madison, WI", category: "Law Enforcement" },
  "texarkana-pd":             { name: "Texarkana Police Department", location: "Texarkana, TX/AR", category: "Law Enforcement" },
  "ohio-deputy-sheriff":      { name: "Ohio Deputy Sheriff", location: "Ohio", category: "Law Enforcement" },
  "avondale-pd":              { name: "Avondale Police Department", location: "Avondale, AZ", category: "Law Enforcement" },
  "arizona-rangers":          { name: "Arizona Rangers", location: "Arizona", category: "Law Enforcement" },
  "harris-county-sheriff":    { name: "Harris County Sheriff's Office", location: "Harris County, TX", category: "Law Enforcement" },
  "glendale-pd-az":           { name: "Glendale Police Department", location: "Glendale, AZ", category: "Law Enforcement" },
  "cochise-sheriff":          { name: "Cochise County Sheriff's Office", location: "Cochise County, AZ", category: "Law Enforcement" },
  "buckeye-pd":               { name: "Buckeye Police Department", location: "Buckeye, AZ", category: "Law Enforcement" },
  "asu-pd":                   { name: "Arizona State University Police Department", location: "Tempe, AZ", category: "Law Enforcement" },
  "detroit-pd":               { name: "Detroit Police Department", location: "Detroit, MI", category: "Law Enforcement" },
  "santa-fe-pd":              { name: "Santa Fe Police Department", location: "Santa Fe, NM", category: "Law Enforcement" },
  "apache-junction-pd":       { name: "Apache Junction Police Department", location: "Apache Junction, AZ", category: "Law Enforcement" },
  "peoria-pd-az":             { name: "Peoria Police Department", location: "Peoria, AZ", category: "Law Enforcement" },
  "auburn-pd":                { name: "Auburn Police Department", location: "Auburn, WA", category: "Law Enforcement" },
  "maricopa-detention-deputy":{ name: "MCSO Detention Deputy", location: "Maricopa County, AZ", category: "Corrections" },
  "az-doc":                   { name: "Arizona Department of Corrections", location: "Arizona", category: "Corrections" },
  "az-doc-logo":              { name: "Arizona Dept. of Corrections Logo", location: "Arizona", category: "Corrections" },
  "101st-airborne":           { name: "101st Airborne Division — Screaming Eagles", location: "Ft. Campbell, KY", category: "Military" },
  "10th-mountain":            { name: "10th Mountain Division", location: "Ft. Drum, NY", category: "Military" },
  "173rd-airborne":           { name: "173rd Airborne Brigade — Sky Soldiers", location: "Vicenza, Italy", category: "Military" },
  "504th-pir-ww2":            { name: "504th Parachute Infantry Regiment — WW2", location: "Historical — U.S. Army", category: "Military" },
  "82nd-airborne":            { name: "82nd Airborne Division", location: "Ft. Bragg (Ft. Liberty), NC", category: "Military" },
  "seabees":                  { name: "U.S. Naval Construction Battalions — Seabees", location: "U.S. Navy", category: "Military" },
  "75th-ranger-regiment":     { name: "75th Ranger Regiment", location: "Ft. Benning (Ft. Moore), GA", category: "Military" },
  "us-air-force":             { name: "United States Air Force", location: "U.S. Air Force", category: "Military" },
  "3rd-battalion-7th-marines":{ name: "3rd Battalion 7th Marines", location: "U.S. Marine Corps", category: "Military" },
  "army-ranger-medic":        { name: "Army Ranger Medic", location: "U.S. Army", category: "Military" },
  "chandler-fire":            { name: "Chandler Fire Department", location: "Chandler, AZ", category: "Fire" },
  "phoenix-fire":             { name: "Phoenix Fire Department", location: "Phoenix, AZ", category: "Fire" },
  "mammoth-fire":             { name: "Mammoth Fire Department", location: "Mammoth Lakes, CA", category: "Fire" },
  "amr-emt":                  { name: "AMR Emergency Medical Technician", location: "American Medical Response", category: "EMS" },
  "amr-paramedic":            { name: "AMR Paramedic", location: "American Medical Response", category: "EMS" },
  "amr-cct-rn":               { name: "AMR Critical Care Transport RN", location: "American Medical Response", category: "EMS" },
  "pink-patch":               { name: "Pink Patch Project", location: "Nationwide", category: "Pink Patch" },
  "chandler-pd-pink":         { name: "Chandler PD — Pink Patch Project", location: "Chandler, AZ", category: "Pink Patch" },
  "pomona-pink-patch":        { name: "Pomona Police — Pink Patch Project", location: "Pomona, CA", category: "Pink Patch" }
});

function applyProductVisibility(hidden) {
  if (typeof window.applyActiveShopFilters === "function") {
    window.applyActiveShopFilters();
    return;
  }
  const activeTab = document.querySelector(".shop-tab.active");
  const activeCategory = activeTab ? activeTab.dataset.tab : "all";

  document.querySelectorAll(".product-card-img[data-product-id]").forEach(el => {
    const card = el.closest(".product-card");
    if (!card) return;
    const matchesCategory = activeCategory === "all" || card.dataset.category === activeCategory;
    const isHidden = hidden.includes(el.dataset.productId);
    card.style.display = matchesCategory && !isHidden ? "" : "none";
    if (matchesCategory && !isHidden) card.classList.add("visible");
  });
}

function applyShopifyLinks(links) {
  document.querySelectorAll(".product-card-img[data-product-id]").forEach(el => {
    const productId = el.dataset.productId;
    const card = el.closest(".product-card");
    if (!card) return;
    const btn = card.querySelector(".btn-gold[href]");
    if (!btn) return;
    const url = links[productId] || "";
    btn.dataset.shopifyHandled = "true";
    btn.dataset.shopifyUrl = url;
    btn.textContent = url ? "Buy on Shopify" : "Coming Soon";
    btn.setAttribute("href", url || "#");
    btn.setAttribute("aria-disabled", url ? "false" : "true");
    btn.classList.toggle("shopify-coming-soon", !url);
    if (!btn.dataset.shopifyClickBound) {
      btn.dataset.shopifyClickBound = "true";
      btn.addEventListener("click", e => {
        const shopifyUrl = btn.dataset.shopifyUrl || "";
        if (!shopifyUrl) {
          e.preventDefault();
          return;
        }
        btn.setAttribute("href", shopifyUrl);
      });
    }
  });
}

async function initShopifyLinks() {
  try {
    shopifyLinks = { ...DEFAULT_SHOPIFY_LINKS, ...(await loadShopifyLinks()) };
    applyShopifyLinks(shopifyLinks);
  } catch (_e) {
    applyShopifyLinks(DEFAULT_SHOPIFY_LINKS);
  }
}

/* Legacy quantity controls are intentionally disabled for Shopify checkout. */
function removeLegacyQuantitySelectors() {
  document.querySelectorAll(".qty-wrap").forEach(wrap => wrap.remove());
}

async function initCommerceLinks() {
  removeLegacyQuantitySelectors();
  await initShopifyLinks();
}

async function initProductVisibility() {
  try {
    hiddenProductIds = mergeHiddenProductIds(await loadHiddenProducts());
    try { applyProductVisibility(hiddenProductIds); } catch(e) {}
  } catch (_e) { /* silent */ }
}

function statusClass(status) {
  if (!status) return "status-queued";
  const s = status.toLowerCase();
  if (s.includes("progress")) return "status-progress";
  if (s.includes("complete")) return "status-complete";
  return "status-queued";
}

function renderQueuePreview(items) {
  if (!queuePreviewList) return;
  if (!items.length) {
    queuePreviewList.innerHTML = '<p class="queue-empty">Queue is empty. Be the first to submit!</p>';
    return;
  }
  queuePreviewList.innerHTML = items.map((item, i) => `
    <div class="queue-row anim anim-delay-${Math.min(i + 1, 5)}">
      <span class="queue-pos">#${i + 1}</span>
      <span class="queue-name">${escH(item.name || "")}</span>
      <span class="status-badge ${statusClass(item.status)}">${escH(item.status || "Queued")}</span>
    </div>
  `).join("");
  initAnimations();
}

function renderQueueFull(items) {
  if (!queueFullList) return;
  if (!items.length) {
    queueFullList.innerHTML = '<p class="queue-empty">Queue is empty. Be the first to submit!</p>';
    return;
  }
  queueFullList.innerHTML = items.map((item, i) => {
    const hasImg = item.img && item.img.trim();
    const thumbHtml = hasImg
      ? `<img class="queue-thumb" src="${escH(item.img)}" alt="${escH(item.name || "")}" loading="lazy">`
      : `<div class="queue-thumb-placeholder">IMG</div>`;
    return `
      <div class="queue-full-row anim anim-delay-${Math.min((i % 5) + 1, 5)}">
        <span class="queue-pos">#${i + 1}</span>
        ${thumbHtml}
        <span class="queue-name">${escH(item.name || "")}</span>
        <span class="status-badge ${statusClass(item.status)}">${escH(item.status || "Queued")}</span>
      </div>
    `;
  }).join("");

  // photo viewer on thumb click
  queueFullList.querySelectorAll(".queue-thumb").forEach(img => {
    img.addEventListener("click", () => openPhotoModal(img.src));
  });

  initAnimations();
}

/* expand / collapse toggle */
(function initQueueToggle() {
  const btn = document.querySelector(".queue-expand-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const collapsed = document.querySelectorAll(".queue-collapsed");
    const isOpen = btn.dataset.open === "true";
    collapsed.forEach(el => el.classList.toggle("queue-hidden", isOpen));
    btn.dataset.open = isOpen ? "false" : "true";
    btn.textContent = isOpen ? "Show More" : "Show Less";
  });
})();

/* =========================================================
   PHOTO VIEWER MODAL
   ========================================================= */
const photoModalOverlay = document.getElementById("photo-modal");
const photoModalImg     = document.getElementById("photo-modal-img");

function openPhotoModal(src) {
  if (!photoModalOverlay || !photoModalImg) return;
  photoModalImg.src = src;
  photoModalOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closePhotoModal() {
  if (!photoModalOverlay) return;
  photoModalOverlay.classList.remove("open");
  photoModalImg.src = "";
  document.body.style.overflow = "";
}

if (photoModalOverlay) {
  document.getElementById("photo-modal-close").addEventListener("click", closePhotoModal);
  photoModalOverlay.addEventListener("click", (e) => {
    if (e.target === photoModalOverlay) closePhotoModal();
  });
}

/* =========================================================
   SUBMISSION MODAL
   ========================================================= */
const submissionModal = document.getElementById("submission-modal");

function openSubmissionModal() {
  if (!submissionModal) return;
  submissionModal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeSubmissionModal() {
  if (!submissionModal) return;
  submissionModal.classList.remove("open");
  document.body.style.overflow = "";
}

document.querySelectorAll(".open-submission-modal").forEach(btn => {
  btn.addEventListener("click", openSubmissionModal);
});

if (submissionModal) {
  document.getElementById("submission-modal-close").addEventListener("click", closeSubmissionModal);
  submissionModal.addEventListener("click", (e) => {
    if (e.target === submissionModal) closeSubmissionModal();
  });

  const form = document.getElementById("submission-form");
  const successMsg = document.getElementById("submission-success");
  const submitBtn  = document.getElementById("submission-submit");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      const data = {
        name:        form.querySelector("#sub-name").value.trim(),
        email:       form.querySelector("#sub-email").value.trim(),
        phone:       form.querySelector("#sub-phone").value.trim(),
        agency:      form.querySelector("#sub-agency").value.trim(),
        description: form.querySelector("#sub-description").value.trim()
      };

      const genFileInput   = form.querySelector("#sub-generated");
      const patchFileInput = form.querySelector("#sub-patch-photo");
      const genFile   = genFileInput && genFileInput.files[0] ? genFileInput.files[0] : null;
      const patchFile = patchFileInput && patchFileInput.files[0] ? patchFileInput.files[0] : null;

      try {
        await addSubmission(data, genFile, patchFile);
        form.style.display = "none";
        successMsg.classList.add("visible");
        allQueueItems = await loadQueue();
        renderQueueFull(allQueueItems);
        renderQueuePreview(allQueueItems.slice(0, 4));
      } catch (_e) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Request";
        alert("Submission failed. Please try again or email us directly at OfficialMicroPatches@gmail.com.");
      }
    });
  }
}

/* =========================================================
   ADMIN PANEL
   ========================================================= */
const adminOverlay  = document.getElementById("admin-overlay");
const adminAuth     = document.getElementById("admin-auth");
const adminContent  = document.getElementById("admin-content");
const adminTrigger  = document.getElementById("admin-trigger");
const ADMIN_PW_KEY  = "mp_admin_pw";

function getAdminPw() {
  return localStorage.getItem(ADMIN_PW_KEY) || "micropatches";
}

function escA(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

if (adminTrigger && adminOverlay) {
  adminTrigger.addEventListener("click", () => {
    adminOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
  });

  document.getElementById("admin-overlay-close").addEventListener("click", closeAdmin);
  adminOverlay.addEventListener("click", (e) => {
    if (e.target === adminOverlay) closeAdmin();
  });
}

function closeAdmin() {
  if (!adminOverlay) return;
  adminOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

const adminLoginForm = document.getElementById("admin-login-form");
if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const pw = document.getElementById("admin-pw-input").value;
    if (pw === getAdminPw()) {
      adminAuth.style.display = "none";
      adminContent.classList.add("visible");
      loadAdminQueueTab();
    } else {
      document.getElementById("admin-pw-error").textContent = "Incorrect password.";
    }
  });
}

const adminLogoutBtn = document.getElementById("admin-logout");
if (adminLogoutBtn) {
  adminLogoutBtn.addEventListener("click", () => {
    adminContent.classList.remove("visible");
    adminAuth.style.display = "";
    document.getElementById("admin-pw-input").value = "";
    document.getElementById("admin-pw-error").textContent = "";
    closeAdmin();
  });
}

/* admin tabs */
document.querySelectorAll(".admin-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".admin-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".admin-tab-pane").forEach(p => p.style.display = "none");
    tab.classList.add("active");
    const pane = document.getElementById("admin-pane-" + tab.dataset.adminTab);
    if (pane) pane.style.display = "block";

    if (tab.dataset.adminTab === "queue") loadAdminQueueTab();
    if (tab.dataset.adminTab === "photos") loadAdminPhotosTab();
    if (tab.dataset.adminTab === "submissions") loadAdminSubmissionsTab();
    if (tab.dataset.adminTab === "settings") { /* no async load needed */ }
  });
});

let adminQueueItems = [];

async function loadAdminQueueTab() {
  const pane = document.getElementById("admin-pane-queue");
  if (!pane) return;
  const statusEl = document.getElementById("admin-queue-status");
  if (statusEl) statusEl.textContent = "Loading...";
  try {
    adminQueueItems = await loadQueue();
    renderAdminQueue();
    if (statusEl) statusEl.textContent = "";
  } catch (_e) {
    if (statusEl) { statusEl.textContent = "Failed to load queue."; statusEl.className = "admin-status err"; }
  }
}

function renderAdminQueue() {
  const list = document.getElementById("admin-queue-list");
  if (!list) return;
  list.innerHTML = adminQueueItems.map((item, i) => `
    <div class="admin-queue-row" data-idx="${i}">
      <div class="admin-order-btns">
        <button class="admin-order-btn" data-dir="up" data-idx="${i}" title="Move up">&#9650;</button>
        <button class="admin-order-btn" data-dir="down" data-idx="${i}" title="Move down">&#9660;</button>
      </div>
      <span style="color:var(--text-muted);font-size:0.8rem;min-width:24px">${i + 1}</span>
      <input type="text" value="${escA(item.name || "")}" data-field="name" data-idx="${i}" placeholder="Agency name">
      <input type="text" value="${escA(item.img || "")}" data-field="img" data-idx="${i}" placeholder="Photo URL (optional)">
      <select data-field="status" data-idx="${i}">
        <option value="Queued" ${item.status === "Queued" ? "selected" : ""}>Queued</option>
        <option value="In Progress" ${item.status === "In Progress" ? "selected" : ""}>In Progress</option>
        <option value="Complete" ${item.status === "Complete" ? "selected" : ""}>Complete</option>
      </select>
      <button class="admin-remove-btn" data-idx="${i}">Remove</button>
    </div>
  `).join("");

  list.querySelectorAll("input[data-field], select[data-field]").forEach(inp => {
    inp.addEventListener("change", () => {
      const idx   = parseInt(inp.dataset.idx, 10);
      const field = inp.dataset.field;
      adminQueueItems[idx][field] = inp.value;
    });
  });

  list.querySelectorAll(".admin-order-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx, 10);
      const dir = btn.dataset.dir;
      if (dir === "up" && idx > 0) {
        [adminQueueItems[idx], adminQueueItems[idx - 1]] = [adminQueueItems[idx - 1], adminQueueItems[idx]];
        renderAdminQueue();
      } else if (dir === "down" && idx < adminQueueItems.length - 1) {
        [adminQueueItems[idx], adminQueueItems[idx + 1]] = [adminQueueItems[idx + 1], adminQueueItems[idx]];
        renderAdminQueue();
      }
    });
  });

  list.querySelectorAll(".admin-remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx, 10);
      adminQueueItems.splice(idx, 1);
      renderAdminQueue();
    });
  });
}

const addQueueEntryBtn = document.getElementById("admin-add-entry");
if (addQueueEntryBtn) {
  addQueueEntryBtn.addEventListener("click", () => {
    adminQueueItems.push({ name: "", status: "Queued", img: "" });
    renderAdminQueue();
    const list = document.getElementById("admin-queue-list");
    if (list) list.lastElementChild.querySelector("input").focus();
  });
}

const saveQueueBtn = document.getElementById("admin-save-queue");
if (saveQueueBtn) {
  saveQueueBtn.addEventListener("click", async () => {
    const statusEl = document.getElementById("admin-queue-status");
    saveQueueBtn.disabled = true;
    if (statusEl) statusEl.textContent = "Saving...";
    try {
      await saveQueue(adminQueueItems);
      allQueueItems = [...adminQueueItems];
      renderQueueFull(allQueueItems);
      renderQueuePreview(allQueueItems.slice(0, 4));
      if (statusEl) { statusEl.textContent = "Saved."; statusEl.className = "admin-status ok"; }
    } catch (_e) {
      if (statusEl) { statusEl.textContent = "Save failed."; statusEl.className = "admin-status err"; }
    } finally {
      saveQueueBtn.disabled = false;
    }
  });
}

async function loadAdminSubmissionsTab() {
  const list = document.getElementById("admin-submissions-list");
  if (!list) return;
  list.innerHTML = '<p class="queue-loading">Loading submissions...</p>';
  try {
    const subs = await loadSubmissions();
    if (!subs.length) {
      list.innerHTML = '<p class="queue-empty">No submissions yet.</p>';
      return;
    }
    list.innerHTML = subs.map(s => {
      const genImg = s.generatedImageURL
        ? `<img class="admin-submission-img" src="${escA(s.generatedImageURL)}" alt="Generated" loading="lazy">`
        : "";
      const patchImg = s.patchPhotoURL
        ? `<img class="admin-submission-img" src="${escA(s.patchPhotoURL)}" alt="Patch" loading="lazy">`
        : "";
      return `
        <div class="admin-submission-card">
          <h4>${escH(s.agency || "")}</h4>
          <p><strong>Name:</strong> ${escH(s.name || "")}</p>
          <p><strong>Email:</strong> ${escH(s.email || "")}</p>
          <p><strong>Phone:</strong> ${escH(s.phone || "ÃÂ¢ÃÂÃÂ")}</p>
          <p><strong>Description:</strong> ${escH(s.description || "")}</p>
          <p><strong>Submitted:</strong> ${escH(s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "")}</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap">${genImg}${patchImg}</div>
        </div>
      `;
    }).join("");

    list.querySelectorAll(".admin-submission-img").forEach(img => {
      img.addEventListener("click", () => openPhotoModal(img.src));
    });
  } catch (_e) {
    list.innerHTML = '<p class="queue-empty" style="color:#f87171">Failed to load submissions.</p>';
  }
}

/* =========================================================
   ADMIN ÃÂ¢ÃÂÃÂ PHOTOS TAB
   ========================================================= */
let adminProductPhotos = {};

async function loadAdminPhotosTab() {
  const statusEl = document.getElementById("admin-photos-status");
  if (statusEl) { statusEl.textContent = "Loading..."; statusEl.className = "admin-status"; }
  try {
    const savedShopifyLinks = await loadShopifyLinks();
    const [loadedProductPhotos, loadedHiddenProductIds, loadedHeroImageUrl] = await Promise.all([
      loadProductPhotos(),
      loadHiddenProducts(),
      loadHeroImage()
    ]);
    adminProductPhotos = loadedProductPhotos;
    hiddenProductIds = mergeHiddenProductIds(loadedHiddenProductIds);
    adminHeroImageUrl = loadedHeroImageUrl;
    adminShopifyLinks = { ...DEFAULT_SHOPIFY_LINKS, ...savedShopifyLinks };
    renderAdminPhotos();
    if (statusEl) statusEl.textContent = "";
  } catch (_e) {
    if (statusEl) { statusEl.textContent = "Failed to load."; statusEl.className = "admin-status err"; }
  }
}

let adminHeroImageUrl = "";

function renderAdminPhotos() {
  const list = document.getElementById("admin-photos-list");
  if (!list) return;

  const heroThumb = adminHeroImageUrl
    ? `<img src="${escA(adminHeroImageUrl)}" style="width:100%;max-height:140px;object-fit:contain;border-radius:8px;margin-bottom:8px">`
    : `<div style="width:100%;height:80px;background:var(--bg-surface);border:2px dashed rgba(201,151,42,0.35);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:0.82rem;margin-bottom:8px">No logo set</div>`;
  list.innerHTML = `
    <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.1)">
      <p style="font-family:'Oswald',sans-serif;font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:8px">Hero Logo</p>
      ${heroThumb}
      <label for="hero-logo-upload" class="btn btn-outline btn-small" style="cursor:pointer;display:inline-block">Change Logo</label>
      <input type="file" id="hero-logo-upload" accept="image/*" style="display:none">
    </div>
  `;
  list.innerHTML += PRODUCTS.map(p => {
    const url = adminProductPhotos[p.id] || "";
    const isHidden = hiddenProductIds.includes(p.id);
    const thumbHtml = url
      ? `<img class="admin-photo-thumb" src="${escA(url)}" alt="${escA(p.name)}"${isHidden ? ' style="opacity:0.35"' : ""}>`
      : `<div class="admin-photo-thumb admin-photo-placeholder">No Photo</div>`;
    const rowStyle = isHidden ? ' style="opacity:0.55"' : "";
    const toggleBtn = isHidden
      ? `<button class="btn btn-small admin-toggle-visibility" data-product-id="${p.id}" data-hidden="true" style="flex-shrink:0;background:rgba(74,200,100,0.12);border:1px solid rgba(74,200,100,0.35);color:#4ac864">Show</button>`
      : `<button class="btn btn-small admin-toggle-visibility" data-product-id="${p.id}" data-hidden="false" style="flex-shrink:0;background:rgba(255,59,59,0.1);border:1px solid rgba(255,59,59,0.25);color:#f87171">Remove</button>`;
    return `
      <div class="admin-photo-row"${rowStyle}>
        ${thumbHtml}
        <span class="admin-photo-name">${escH(p.name)}</span>
        <label for="photo-input-${p.id}" class="btn btn-outline btn-small" style="cursor:pointer;flex-shrink:0">Photo</label>
        <input type="file" id="photo-input-${p.id}" accept="image/*" style="display:none" data-product-id="${p.id}">
        ${toggleBtn}
        <input type="url" class="admin-shopify-input" data-product-id="${p.id}" placeholder="Shopify product link (https://your-store.myshopify.com/products/...)" value="${escA(adminShopifyLinks[p.id] || '')}" style="flex:1;min-width:160px;background:var(--bg-dark);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:6px 10px;font-size:0.8rem">
      </div>
    `;
  }).join("");

  const heroUploadInput = document.getElementById("hero-logo-upload");
  if (heroUploadInput) {
    heroUploadInput.addEventListener("change", async () => {
      const file = heroUploadInput.files[0];
      if (!file) return;
      const statusEl = document.getElementById("admin-photos-status");
      if (statusEl) { statusEl.textContent = "Uploading logo..."; statusEl.className = "admin-status"; }
      try {
        const url = await uploadHeroImage(file);
        adminHeroImageUrl = url;
        applyHeroImage(url);
        renderAdminPhotos();
        if (statusEl) { statusEl.textContent = "Logo updated!"; statusEl.className = "admin-status ok"; }
        setTimeout(() => { if (statusEl) statusEl.textContent = ""; }, 3000);
      } catch (err) {
        if (statusEl) { statusEl.textContent = "Upload failed: " + err.message; statusEl.className = "admin-status err"; }
      }
    });
  }

  list.querySelectorAll("input[type=file][data-product-id]").forEach(input => {
    input.addEventListener("change", async () => {
      const file = input.files[0];
      const productId = input.dataset.productId;
      if (!file || !productId) return;
      const statusEl = document.getElementById("admin-photos-status");
      const label = list.querySelector(`label[for="photo-input-${productId}"]`);
      if (label) label.textContent = "Uploading...";
      if (statusEl) { statusEl.textContent = "Uploading..."; statusEl.className = "admin-status"; }
      try {
        const url = await uploadProductPhoto(productId, file);
        adminProductPhotos[productId] = url;
        applyProductPhoto(productId, url);
        renderAdminPhotos();
        if (statusEl) { statusEl.textContent = "Photo saved!"; statusEl.className = "admin-status ok"; }
        setTimeout(() => { if (statusEl) statusEl.textContent = ""; }, 3000);
      } catch (err) {
        if (statusEl) { statusEl.textContent = "Upload failed: " + err.message; statusEl.className = "admin-status err"; }
        if (label) label.textContent = "Photo";
      }
    });
  });


  list.querySelectorAll(".admin-shopify-input").forEach(input => {
    input.addEventListener("input", () => {
      adminShopifyLinks[input.dataset.productId] = input.value.trim();
    });
  });

  const saveShopifyBtn = document.getElementById("admin-save-shopify");
  if (saveShopifyBtn) {
    saveShopifyBtn.onclick = async () => {
      const statusEl = document.getElementById("admin-photos-status");
      saveShopifyBtn.disabled = true;
      if (statusEl) { statusEl.textContent = "Saving..."; statusEl.className = "admin-status"; }
      try {
        await saveShopifyLinks(adminShopifyLinks);
        shopifyLinks = { ...adminShopifyLinks };
        applyShopifyLinks(shopifyLinks);
        if (statusEl) { statusEl.textContent = "Shopify links saved!"; statusEl.className = "admin-status ok"; }
        setTimeout(() => { if (statusEl) statusEl.textContent = ""; }, 3000);
      } catch (err) {
        if (statusEl) { statusEl.textContent = "Save failed: " + err.message; statusEl.className = "admin-status err"; }
      } finally { saveShopifyBtn.disabled = false; }
    };
  }

  list.querySelectorAll(".admin-toggle-visibility").forEach(btn => {
    btn.addEventListener("click", async () => {
      const productId = btn.dataset.productId;
      const currentlyHidden = btn.dataset.hidden === "true";
      const statusEl = document.getElementById("admin-photos-status");
      btn.disabled = true;
      try {
        if (currentlyHidden) {
          hiddenProductIds = hiddenProductIds.filter(id => id !== productId);
        } else {
          hiddenProductIds = [...hiddenProductIds, productId];
        }
        await saveHiddenProducts(hiddenProductIds);
        try { applyProductVisibility(hiddenProductIds); } catch(e) {}
        renderAdminPhotos();
        if (statusEl) {
          statusEl.textContent = currentlyHidden ? "Listing restored." : "Listing removed.";
          statusEl.className = "admin-status ok";
          setTimeout(() => { if (statusEl) statusEl.textContent = ""; }, 3000);
        }
      } catch (err) {
        if (statusEl) { statusEl.textContent = "Failed: " + err.message; statusEl.className = "admin-status err"; }
        btn.disabled = false;
      }
    });
  });
}

/* admin change password */
const changePasswordForm = document.getElementById("admin-change-pw-form");
if (changePasswordForm) {
  changePasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newPw  = document.getElementById("admin-new-pw").value.trim();
    const status = document.getElementById("admin-pw-change-status");
    if (newPw.length < 6) {
      status.textContent = "Password must be at least 6 characters.";
      status.className = "admin-status err";
      return;
    }
    localStorage.setItem(ADMIN_PW_KEY, newPw);
    status.textContent = "Password updated.";
    status.className = "admin-status ok";
    document.getElementById("admin-new-pw").value = "";
  });
}

/* =========================================================
   ADMIN ÃÂ¢ÃÂÃÂ UPLOAD PRODUCT PHOTO
   ========================================================= */
(function initUploadProduct() {
  const upFileEl   = document.getElementById("up-file");
  const upSubmitEl = document.getElementById("up-submit");
  if (!upFileEl || !upSubmitEl) return;

  upFileEl.addEventListener("change", () => {
    if (!upFileEl.files[0]) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.getElementById("up-preview-img");
      const ph  = document.getElementById("up-placeholder");
      if (img) { img.src = e.target.result; img.style.display = "block"; }
      if (ph)  { ph.style.display = "none"; }
    };
    reader.readAsDataURL(upFileEl.files[0]);
  });

  upSubmitEl.addEventListener("click", async () => {
    const nameEl   = document.getElementById("up-name");
    const statusEl = document.getElementById("up-status");
    const msgEl    = document.getElementById("up-status-msg");
    const name   = nameEl ? nameEl.value.trim() : "";
    const status = statusEl ? statusEl.value : "complete";
    const file   = upFileEl.files[0];

    if (!name) { if (nameEl) nameEl.focus(); return; }
    if (!file) {
      if (msgEl) { msgEl.textContent = "Please select a photo."; msgEl.style.color = "#f87171"; }
      return;
    }

    upSubmitEl.disabled = true;
    upSubmitEl.textContent = "Uploading...";
    if (msgEl) msgEl.textContent = "";

    try {
      const item = await uploadProduct(name, status, file);
      allQueueItems.unshift(item);
      adminQueueItems.unshift({ ...item });
      renderAdminQueue();
      renderQueueFull(allQueueItems);
      renderQueuePreview(allQueueItems.slice(0, 4));
      if (nameEl)   nameEl.value = "";
      if (statusEl) statusEl.value = "complete";
      upFileEl.value = "";
      const img = document.getElementById("up-preview-img");
      const ph  = document.getElementById("up-placeholder");
      if (img) img.style.display = "none";
      if (ph)  ph.style.display = "block";
      if (msgEl) { msgEl.textContent = "ÃÂ¢ÃÂÃÂ Added to queue!"; msgEl.style.color = "#4caf7a"; }
      setTimeout(() => { if (msgEl) msgEl.textContent = ""; }, 3000);
    } catch (err) {
      if (msgEl) { msgEl.textContent = "Upload failed: " + err.message; msgEl.style.color = "#f87171"; }
    }

    upSubmitEl.disabled = false;
    upSubmitEl.textContent = "Upload & Add to Queue";
  });
})();

/* =========================================================
   CONTACT PAGE ÃÂ¢ÃÂÃÂ COPY EMAIL TO CLIPBOARD
   ========================================================= */
const copyEmailBtn = document.getElementById("copy-email-btn");
if (copyEmailBtn) {
  copyEmailBtn.addEventListener("click", () => {
    navigator.clipboard.writeText("OfficialMicroPatches@gmail.com").then(() => {
      copyEmailBtn.textContent = "Copied!";
      copyEmailBtn.classList.add("copied");
      setTimeout(() => {
        copyEmailBtn.textContent = "Copy";
        copyEmailBtn.classList.remove("copied");
      }, 2000);
    });
  });
}

/* =========================================================
   CART SYSTEM
   ========================================================= */

// Set this once you have a Shopify Storefront API token
const SHOPIFY_STOREFRONT_TOKEN = "";
const SHOPIFY_DOMAIN = "micropatches.myshopify.com";
const CART_KEY = "mp_cart";

function cartGet() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; }
}
function cartSave(items) { localStorage.setItem(CART_KEY, JSON.stringify(items)); }

function cartAdd(product) {
  const cart = cartGet();
  const existing = cart.find(i => i.id === product.id);
  if (existing) { existing.qty += 1; } else { cart.push({ ...product, qty: 1 }); }
  cartSave(cart);
  cartUpdateUI();
  cartOpen();
}

function cartRemove(id) { cartSave(cartGet().filter(i => i.id !== id)); cartUpdateUI(); }

function cartSetQty(id, qty) {
  if (qty <= 0) { cartRemove(id); return; }
  const cart = cartGet();
  const item = cart.find(i => i.id === id);
  if (item) { item.qty = qty; cartSave(cart); cartUpdateUI(); }
}

function cartCount() { return cartGet().reduce((s, i) => s + i.qty, 0); }
function cartTotal() { return cartGet().reduce((s, i) => s + i.price * i.qty, 0); }

function cartUpdateUI() {
  const count = cartCount();
  document.querySelectorAll(".cart-count").forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  });
  cartRenderItems();
}

function cartRenderItems() {
  const container = document.getElementById("cart-items");
  if (!container) return;
  const cart = cartGet();
  const emptyEl = document.getElementById("cart-empty");
  const footerEl = document.getElementById("cart-footer");
  const totalEl = document.getElementById("cart-total");

  if (cart.length === 0) {
    container.innerHTML = "";
    if (emptyEl) emptyEl.style.display = "flex";
    if (footerEl) footerEl.style.display = "none";
    return;
  }
  if (emptyEl) emptyEl.style.display = "none";
  if (footerEl) footerEl.style.display = "block";

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">
        ${item.img ? `<img src="${escA(item.img)}" alt="${escH(item.name)}" loading="lazy">` : '<div class="cart-item-placeholder"></div>'}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${escH(item.name)}</div>
        <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" data-action="dec" data-id="${escH(item.id)}" aria-label="Decrease">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-action="inc" data-id="${escH(item.id)}" aria-label="Increase">+</button>
        </div>
      </div>
      <button class="cart-item-remove" data-id="${escH(item.id)}" aria-label="Remove">×</button>
    </div>
  `).join("");

  if (totalEl) totalEl.textContent = `$${cartTotal().toFixed(2)}`;

  container.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = cartGet().find(i => i.id === btn.dataset.id);
      if (item) cartSetQty(btn.dataset.id, item.qty + (btn.dataset.action === "inc" ? 1 : -1));
    });
  });
  container.querySelectorAll(".cart-item-remove").forEach(btn => {
    btn.addEventListener("click", () => cartRemove(btn.dataset.id));
  });
}

function cartOpen() {
  document.getElementById("cart-drawer")?.classList.add("open");
  document.getElementById("cart-overlay")?.classList.add("open");
  document.body.style.overflow = "hidden";
}

function cartClose() {
  document.getElementById("cart-drawer")?.classList.remove("open");
  document.getElementById("cart-overlay")?.classList.remove("open");
  document.body.style.overflow = "";
}

async function cartCheckout() {
  const cart = cartGet();
  if (!cart.length) return;
  const btn = document.getElementById("cart-checkout-btn");
  if (btn) { btn.disabled = true; btn.textContent = "Redirecting..."; }

  // Build cart permalink via JSONP (no token, no CORS issues)
  try {
    const lineItems = [];
    for (const item of cart) {
      const productUrl = item.shopifyUrl || DEFAULT_SHOPIFY_LINKS[item.id.split("--")[0]] || "";
      const handle = productUrl.split("/products/")[1]?.split("?")[0];
      if (!handle) continue;
      const variantId = await shopifyVariantIdJSONP(handle);
      if (variantId) lineItems.push(`${variantId}:${item.qty}`);
    }
    if (lineItems.length > 0) {
      window.location.href = `https://${SHOPIFY_DOMAIN}/cart/${lineItems.join(",")}`;
      return;
    }
  } catch (_e) { /* fall through */ }

  // Storefront API path (if token is configured)
  if (SHOPIFY_STOREFRONT_TOKEN) {
    try {
      const lineItems = [];
      for (const item of cart) {
        const variantId = await shopifyGetVariantId(item.id);
        if (variantId) lineItems.push({ variantId, quantity: item.qty });
      }
      if (lineItems.length > 0) {
        const checkoutUrl = await shopifyCreateCheckout(lineItems);
        if (checkoutUrl) { window.location.href = checkoutUrl; return; }
      }
    } catch (_e) { /* fall through */ }
  }

  // Final fallback: go to first item's product page
  const fallbackUrl = cart.map(i => i.shopifyUrl || DEFAULT_SHOPIFY_LINKS[i.id.split("--")[0]] || "").find(Boolean);
  window.location.href = fallbackUrl || `https://${SHOPIFY_DOMAIN}`;
  if (btn) { btn.disabled = false; btn.textContent = "Checkout"; }
}

function shopifyVariantIdJSONP(handle) {
  return new Promise((resolve) => {
    const cb = `_mpv${Math.random().toString(36).slice(2)}`;
    const timer = setTimeout(() => { cleanup(); resolve(null); }, 6000);
    function cleanup() {
      clearTimeout(timer);
      delete window[cb];
      document.getElementById(cb)?.remove();
    }
    window[cb] = (data) => { cleanup(); resolve(data?.product?.variants?.[0]?.id ?? null); };
    const s = document.createElement("script");
    s.id = cb;
    s.src = `https://${SHOPIFY_DOMAIN}/products/${handle}.json?callback=${cb}`;
    s.onerror = () => { cleanup(); resolve(null); };
    document.head.appendChild(s);
  });
}

async function shopifyGetVariantId(productId) {
  // Derive handle from the known Shopify product URL, fall back to slug from productId
  const url = DEFAULT_SHOPIFY_LINKS[productId] || "";
  const handle = url.split("/products/")[1] || productId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const res = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN },
    body: JSON.stringify({ query: `{product(handle:"${handle}"){variants(first:1){edges{node{id}}}}}` })
  });
  const data = await res.json();
  return data?.data?.product?.variants?.edges?.[0]?.node?.id || null;
}

async function shopifyCreateCheckout(lineItems) {
  const res = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN },
    body: JSON.stringify({
      query: `mutation checkoutCreate($input:CheckoutCreateInput!){checkoutCreate(input:$input){checkout{webUrl}}}`,
      variables: { input: { lineItems: lineItems.map(i => ({ variantId: i.variantId, quantity: i.quantity })) } }
    })
  });
  const data = await res.json();
  return data?.data?.checkoutCreate?.checkout?.webUrl || null;
}

function initCart() {
  document.querySelectorAll(".product-card-footer .btn-gold").forEach(link => {
    const card = link.closest(".product-card");
    if (!card) return;
    const productId = card.querySelector("[data-product-id]")?.dataset?.productId || "";
    const name = card.querySelector("h3")?.textContent?.trim() || "Product";
    const price = parseFloat(card.querySelector(".product-price")?.textContent?.replace(/[^0-9.]/g, "") || "13.99");
    const shopifyUrl = DEFAULT_SHOPIFY_LINKS[productId] || "";

    const btn = document.createElement("button");
    btn.className = "btn btn-gold add-to-cart-btn";
    btn.style.cssText = link.style.cssText;
    btn.textContent = "Add to Cart";
    btn.setAttribute("aria-label", `Add ${name} to cart`);
    btn.addEventListener("click", () => {
      const photoEl = card.querySelector(".product-card-photo");
      const img = (photoEl?.src && !photoEl.src.endsWith("/")) ? photoEl.src : "";
      cartAdd({ id: productId, name, price, img, shopifyUrl });
    });
    link.replaceWith(btn);
  });

  document.querySelectorAll(".cart-toggle").forEach(el => el.addEventListener("click", cartOpen));
  document.getElementById("cart-close")?.addEventListener("click", cartClose);
  document.getElementById("cart-overlay")?.addEventListener("click", cartClose);
  document.getElementById("cart-checkout-btn")?.addEventListener("click", cartCheckout);
  cartUpdateUI();
}

function initProductLinks() {
  document.querySelectorAll(".product-card").forEach(card => {
    const productId = card.querySelector("[data-product-id]")?.dataset?.productId;
    if (!productId) return;

    // Stretched <a> over the card — iOS Safari requires a real anchor for tap events
    const name = card.querySelector("h3")?.textContent?.trim() || productId;
    const a = document.createElement("a");
    a.href = `product.html?id=${encodeURIComponent(productId)}`;
    a.className = "product-card-link";
    a.setAttribute("aria-label", `View ${name} details`);
    card.style.position = "relative";
    card.appendChild(a);

    // Inject variant type hint into card body
    const body = card.querySelector(".product-card-body");
    if (body && !body.querySelector(".card-variant-hint")) {
      const hint = document.createElement("p");
      hint.className = "card-variant-hint";
      hint.textContent = "MicroKeychain · Micro Magnet · Micro Pin · Micro Charm";
      body.appendChild(hint);
    }
  });
}

async function initProductPage() {
  const main = document.getElementById("product-main");
  if (!main) return;

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  const notFound = document.getElementById("product-not-found");

  if (!productId) {
    main.hidden = true;
    if (notFound) notFound.hidden = false;
    return;
  }

  const data = PRODUCT_DATA[productId] || {};
  const name = data.name || productId.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const category = data.category || "Patch Keychain";
  const location = data.location || "USA";
  const description = `UV-printed 3D replica of the ${name} patch. Handcrafted in Phoenix, AZ — a collector piece for officers, veterans, families, and supporters.`;

  // Update page metadata
  document.title = `${name} — MicroPatches`;
  const metaDesc = document.getElementById("page-description");
  const ogTitle = document.getElementById("og-title");
  const ogDesc = document.getElementById("og-description");
  if (metaDesc) metaDesc.content = description;
  if (ogTitle) ogTitle.content = `${name} — MicroPatches`;
  if (ogDesc) ogDesc.content = description;

  // Populate static elements
  const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  set("product-name", name);
  set("product-category-badge", category);
  set("product-spec-category", category);
  set("product-location", location);
  set("product-description", description);

  // Back link
  const catSlug = { "Law Enforcement": "law-enforcement", "Corrections": "corrections", "Military": "military", "Fire": "fire", "EMS": "ems", "Pink Patch": "pink-patch" }[category] || "all";
  const backLink = document.getElementById("product-back-link");
  if (backLink) backLink.href = `shop.html#${catSlug}`;

  // ── Build variant URLs for this product ──────────────────
  // keychain always falls back to DEFAULT_SHOPIFY_LINKS
  const overrides = PRODUCT_VARIANT_URLS[productId] || {};
  const variantUrls = {
    keychain: overrides.keychain || DEFAULT_SHOPIFY_LINKS[productId] || "",
    micro:    overrides.micro    || "",
    charm:    overrides.charm    || "",
    pin:      overrides.pin      || "",
    magnet:   overrides.magnet   || "",
  };

  // Track selected variant
  let selectedType = "keychain";

  // ── Render variant picker ─────────────────────────────────
  const pickerEl = document.getElementById("product-variant-picker");
  if (pickerEl) {
    function renderPicker() {
      pickerEl.innerHTML = `
        <p class="variant-label">Type</p>
        <div class="variant-pills">
          ${Object.entries(PRODUCT_TYPE_DEFAULTS).map(([type, info]) => {
            const available = !!variantUrls[type];
            const active = type === selectedType;
            return `<button
              class="variant-pill${active ? " active" : ""}${!available ? " coming-soon" : ""}"
              data-type="${escH(type)}"
              ${!available ? 'title="Coming soon"' : ""}
            >
              <span class="variant-pill-label">${escH(info.label)}</span>
              <span class="variant-pill-price">${available ? `$${info.price.toFixed(2)}` : "Soon"}</span>
            </button>`;
          }).join("")}
        </div>
      `;
      pickerEl.querySelectorAll(".variant-pill:not(.coming-soon)").forEach(btn => {
        btn.addEventListener("click", () => {
          selectedType = btn.dataset.type;
          applyVariant(selectedType);
          renderPicker();
        });
      });
    }

    function applyVariant(type) {
      const info = PRODUCT_TYPE_DEFAULTS[type];
      if (!info) return;
      const url = variantUrls[type] || "";

      // Update price
      const priceEl = document.getElementById("product-price");
      if (priceEl) priceEl.textContent = `$${info.price.toFixed(2)}`;

      // Update size spec
      const sizeEl = document.getElementById("product-size");
      if (sizeEl) sizeEl.textContent = info.size;

      // Update type description
      const typeDescEl = document.getElementById("product-type-desc");
      if (typeDescEl) typeDescEl.textContent = info.description;

      // Update Add to Cart
      const atcBtn = document.getElementById("product-atc-btn");
      if (atcBtn) {
        atcBtn.disabled = !url;
        atcBtn.textContent = url ? "Add to Cart" : "Coming Soon";
        atcBtn.onclick = url ? () => {
          const img = document.getElementById("product-photo")?.src || "";
          const cartName = `${name} — ${info.label}`;
          cartAdd({ id: `${productId}--${type}`, name: cartName, price: info.price, img, shopifyUrl: url });
        } : null;
      }

      // Update Shopify button
      const shopifyBtn = document.getElementById("product-shopify-btn");
      if (shopifyBtn) {
        shopifyBtn.href = url || "#";
        shopifyBtn.style.opacity = url ? "1" : "0.4";
        shopifyBtn.style.pointerEvents = url ? "" : "none";
      }
    }

    renderPicker();
    applyVariant(selectedType);
  }

  // Load photo from Firebase
  try {
    const photos = await loadProductPhotos();
    const photoUrl = photos[productId];
    if (photoUrl) {
      const photoEl = document.getElementById("product-photo");
      const placeholder = document.getElementById("product-photo-placeholder");
      if (photoEl) { photoEl.src = photoUrl; photoEl.alt = name; photoEl.style.display = "block"; }
      if (placeholder) placeholder.style.display = "none";
      const ogImage = document.getElementById("og-image");
      if (ogImage) ogImage.content = photoUrl;
    }
  } catch (_e) { /* photo non-critical */ }
}

function initShopSearch() {
  const input = document.getElementById("shop-search");
  if (!input) return;
  input.addEventListener("input", () => {
    const q = input.value.toLowerCase().trim();
    document.querySelectorAll(".product-card").forEach(card => {
      const name = card.querySelector("h3")?.textContent?.toLowerCase() || "";
      card.style.display = (!q || name.includes(q)) ? "" : "none";
    });
  });
  input.addEventListener("keydown", e => { if (e.key === "Escape") { input.value = ""; input.dispatchEvent(new Event("input")); } });
}

/* =========================================================
   SMOOTH SCROLL (anchor links)
   ========================================================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", (e) => {
    const href = anchor.getAttribute("href");
    if (href === "#") return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  initQueuePage();
  initHeroImage();
  initProductPhotos();
  initProductVisibility();
  initCart();
  initProductLinks();
  initShopSearch();
  initProductPage();
  initCommerceLinks();
});

/*
 * SECURITY AUDIT REPORT
 * =====================
 * 1. XSS PREVENTION      ÃÂ¢ÃÂÃÂ PASS. All user-supplied content rendered via escH()/escA() before
 *                          innerHTML insertion. No raw user data injected.
 * 2. NO EVAL             ÃÂ¢ÃÂÃÂ PASS. eval() is not used anywhere in this codebase.
 * 3. NO INLINE HANDLERS  ÃÂ¢ÃÂÃÂ PASS. All event handlers bound programmatically in main.js.
 * 4. NO CONSOLE.LOG      ÃÂ¢ÃÂÃÂ PASS. No debug logging statements present.
 * 5. FILE UPLOAD SAFETY  ÃÂ¢ÃÂÃÂ PASS. File inputs use accept="image/*". Firebase Storage rules
 *                          should enforce max file size (recommended 5MB) and MIME type.
 * 6. EXTERNAL LINKS      ÃÂ¢ÃÂÃÂ PASS. All external links use rel="noopener noreferrer" target="_blank".
 * 7. FORM TARGETS        ÃÂ¢ÃÂÃÂ PASS. Contact/custom forms POST only to Formspree. Submission form
 *                          uses Firebase SDK, no raw POST endpoint.
 * 8. FIREBASE CONFIG     ÃÂ¢ÃÂÃÂ INFO. API key is public-facing by design (standard Firebase web pattern).
 *                          Security is enforced via Firestore and Storage Security Rules.
 *                          Recommended: restrict Firestore writes to authenticated users or
 *                          rate-limited rules. Storage rules should enforce image/* and max size.
 * 9. ADMIN PASSWORD      ÃÂ¢ÃÂÃÂ INFO. Stored in localStorage (same as existing site). Acceptable for
 *                          low-stakes admin use. Not suitable for sensitive data access.
 * 10. CSP HEADERS        ÃÂ¢ÃÂÃÂ PENDING. See HTML file comments for recommended _headers configuration
 *                          to apply via GitHub Pages + Cloudflare or a custom _headers file.
 * 11. SOURCE MAPS        ÃÂ¢ÃÂÃÂ PASS. No source map references.
 * 12. LINK INTEGRITY     ÃÂ¢ÃÂÃÂ PASS. All internal links use relative paths. Shopify and Formspree
 *                          destinations are managed by the site owner.
 */
