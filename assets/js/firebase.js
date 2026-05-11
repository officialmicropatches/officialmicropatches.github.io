/**
 * firebase.js - All Firebase logic for MicroPatches
 *
 * Firebase API keys in client-side code are normal and expected for Firebase
 * web apps. Security is enforced through Firebase Security Rules in the
 * Firebase Console. Ensure Firestore rules require authentication for write
 * operations or restrict writes to specific collections. Storage rules should
 * restrict file types and sizes.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  query,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

function installProductCardLiftStyles() {
  if (typeof document === "undefined" || document.getElementById("product-card-lift-styles")) return;

  const style = document.createElement("style");
  style.id = "product-card-lift-styles";
  style.textContent = `
    .product-card {
      position: relative;
      transform: translateY(0) scale(1);
      will-change: transform, box-shadow, border-color;
      transition:
        transform 180ms ease,
        box-shadow 180ms ease,
        border-color 180ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    .product-card:hover {
      border-color: rgba(201,151,42,0.42);
      box-shadow: 0 18px 34px rgba(0,0,0,0.46), 0 0 28px rgba(201,151,42,0.18);
      transform: translateY(-8px) scale(1.015);
    }
    .product-card:active {
      border-color: rgba(201,151,42,0.5);
      box-shadow: 0 12px 24px rgba(0,0,0,0.42), 0 0 18px rgba(201,151,42,0.16);
      transform: translateY(-4px) scale(1.008);
      transition-duration: 90ms;
    }
    .product-card:hover .product-card-img img,
    .product-card:hover h3 {
      opacity: 0.92;
      transition: opacity 0.18s;
    }
    .card-variant-btn.coming-soon,
    .variant-pill.coming-soon {
      opacity: 0.72;
      cursor: pointer;
      border-color: rgba(201,151,42,0.24);
      color: var(--text-muted);
      background: rgba(138,155,176,0.08);
    }
    .card-variant-btn.coming-soon:hover,
    .variant-pill.coming-soon:hover {
      border-color: rgba(201,151,42,0.5);
      background: rgba(201,151,42,0.1);
      color: #fff;
    }
    .mp-shop-overview-hidden {
      display: none !important;
    }
    .mp-coming-soon-bubble {
      position: fixed;
      z-index: 99999;
      max-width: min(280px, calc(100vw - 32px));
      padding: 12px 16px;
      border: 1px solid rgba(201,151,42,0.55);
      border-radius: 8px;
      background: rgba(9,13,22,0.96);
      color: #fff;
      box-shadow: 0 18px 40px rgba(0,0,0,0.42), 0 0 24px rgba(201,151,42,0.16);
      font-family: inherit;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-align: center;
      pointer-events: none;
      transform: translate(-50%, -12px);
      animation: mpComingSoonBubble 1500ms ease forwards;
    }
    @keyframes mpComingSoonBubble {
      0% { opacity: 0; transform: translate(-50%, 2px); }
      12% { opacity: 1; transform: translate(-50%, -12px); }
      78% { opacity: 1; transform: translate(-50%, -12px); }
      100% { opacity: 0; transform: translate(-50%, -20px); }
    }
    @media (hover: none) and (pointer: coarse) {
      .product-card:hover {
        border-color: var(--border);
        box-shadow: none;
        transform: translateY(0) scale(1);
      }
      .product-card:active,
      .product-card.is-pressing {
        border-color: rgba(201,151,42,0.5);
        box-shadow: 0 14px 28px rgba(0,0,0,0.44), 0 0 20px rgba(201,151,42,0.16);
        transform: translateY(-6px) scale(1.012);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .product-card {
        transition: border-color 120ms ease, box-shadow 120ms ease;
      }
      .product-card:hover,
      .product-card:active,
      .product-card.is-pressing {
        transform: none;
      }
      .mp-coming-soon-bubble {
        animation: none;
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}

function initShopCategoryViewportBehavior() {
  if (typeof document === "undefined") return;

  const validTabs = new Set(["law-enforcement", "corrections", "military", "fire", "ems", "pink-patch"]);

  const findOverviewSections = () => {
    const candidates = Array.from(document.querySelectorAll("section, .section, [id], [class]"));
    return candidates.filter(el => {
      if (el.closest(".site-nav, .nav-mobile-menu, .shop-tabs-wrap, .shop-filter-panel")) return false;
      const idClass = `${el.id || ""} ${el.className || ""}`.toLowerCase();
      const text = (el.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
      return idClass.includes("what-we-make") || idClass.includes("whatwemake") || text.includes("what we make");
    }).filter((el, index, arr) => !arr.some(other => other !== el && other.contains(el)));
  };

  const toggleShopOverview = (cat) => {
    const hide = cat && cat !== "all";
    findOverviewSections().forEach(section => {
      section.classList.toggle("mp-shop-overview-hidden", hide);
    });
  };

  const scrollToProducts = () => {
    const grid = document.querySelector(".product-grid");
    if (!grid) return;
    const target = grid.closest("section") || grid;
    const nav = document.querySelector(".site-nav")?.getBoundingClientRect().height || 0;
    const tabs = document.querySelector(".shop-tabs-wrap")?.getBoundingClientRect().height || 0;
    const filters = document.querySelector(".shop-filter-panel.is-visible")?.getBoundingClientRect().height || 0;
    const top = target.getBoundingClientRect().top + window.scrollY - nav - tabs - filters - 14;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion ? "auto" : "smooth" });
  };

  const getActiveCat = () => document.querySelector(".shop-tab.active")?.dataset.tab || "all";

  const sync = (cat = getActiveCat(), shouldScroll = false) => {
    toggleShopOverview(cat);
    if (shouldScroll && cat !== "all") {
      setTimeout(scrollToProducts, 90);
      setTimeout(scrollToProducts, 260);
    }
  };

  const start = () => {
    sync(getActiveCat(), false);

    document.addEventListener("click", event => {
      const tab = event.target.closest?.(".shop-tab[data-tab]");
      if (!tab) return;
      const cat = tab.dataset.tab || "all";
      setTimeout(() => sync(cat, validTabs.has(cat)), 0);
    });

    document.addEventListener("change", event => {
      if (!event.target.closest?.(".shop-filter-panel")) return;
      setTimeout(() => sync(getActiveCat(), true), 0);
    });

    document.addEventListener("click", event => {
      if (!event.target.closest?.(".shop-subfilter")) return;
      setTimeout(() => sync(getActiveCat(), true), 0);
    });

    window.addEventListener("hashchange", () => {
      const hash = location.hash.replace("#", "");
      setTimeout(() => sync(hash || getActiveCat(), validTabs.has(hash)), 0);
    });

    const initialHash = location.hash.replace("#", "");
    if (validTabs.has(initialHash)) setTimeout(() => sync(initialHash, true), 350);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}

function labelUpcomingProductVariantButtons() {
  if (typeof document === "undefined") return;

  const variantInfo = {
    keychain: { label: "Micro Keychain", price: "$13.99" },
    magnet: { label: "Micro Magnet", price: "$14.99" },
    pin: { label: "Micro Pin", price: "$9.99" },
    charm: { label: "Micro Charm", price: "$9.99" }
  };
  const nonKeychainOrder = ["magnet", "pin", "charm"];

  const textOf = el => (el?.textContent || "").trim().toLowerCase();

  const inferType = (btn) => {
    const raw = [
      btn.dataset?.type,
      btn.dataset?.variant,
      btn.dataset?.variantType,
      btn.value,
      btn.getAttribute("aria-label"),
      btn.getAttribute("title"),
      btn.textContent
    ].filter(Boolean).join(" ").toLowerCase();

    if (raw.includes("keychain")) return "keychain";
    if (raw.includes("magnet")) return "magnet";
    if (raw.includes("pin")) return "pin";
    if (raw.includes("charm")) return "charm";

    const buttons = Array.from(btn.parentElement?.querySelectorAll(".card-variant-btn, .variant-pill") || []);
    const nonKeychainButtons = buttons.filter(item => !textOf(item).includes("keychain"));
    const index = nonKeychainButtons.indexOf(btn);
    return nonKeychainOrder[index] || "magnet";
  };

  const setButtonText = (btn, type) => {
    const info = variantInfo[type] || variantInfo.magnet;
    btn.dataset.variantType = type;

    const labelEl = btn.querySelector(".variant-pill-label");
    const priceEl = btn.querySelector(".variant-pill-price");
    if (labelEl || priceEl) {
      if (labelEl) labelEl.textContent = info.label;
      if (priceEl) priceEl.textContent = info.price;
      return;
    }

    btn.textContent = `${info.label} ${info.price}`;
  };

  const showComingSoonBubble = (target) => {
    document.querySelectorAll(".mp-coming-soon-bubble").forEach(el => el.remove());
    const bubble = document.createElement("div");
    bubble.className = "mp-coming-soon-bubble";
    bubble.textContent = "Coming soon...";
    document.body.appendChild(bubble);

    const rect = target?.getBoundingClientRect?.();
    const top = Math.max(24, (rect?.top ?? window.innerHeight / 2) - 10);
    const left = Math.min(window.innerWidth - 24, Math.max(24, rect ? rect.left + rect.width / 2 : window.innerWidth / 2));
    bubble.style.top = `${top}px`;
    bubble.style.left = `${left}px`;
    window.setTimeout(() => bubble.remove(), 1550);
  };

  const updateLabels = (root = document) => {
    root.querySelectorAll?.(".card-variant-btn, .variant-pill").forEach(btn => {
      const type = inferType(btn);
      if (type === "keychain") return;
      setButtonText(btn, type);
      btn.classList.remove("active");
      btn.classList.add("coming-soon");
      btn.disabled = false;
      btn.setAttribute("aria-disabled", "true");
      btn.setAttribute("aria-label", `${variantInfo[type].label} ${variantInfo[type].price} - Coming soon`);
      btn.setAttribute("title", "Coming soon...");
    });

    root.querySelectorAll?.(".product-card").forEach(card => {
      const active = card.querySelector(".card-variant-btn.active");
      if (active && inferType(active) !== "keychain") {
        active.classList.remove("active");
        const keychain = Array.from(card.querySelectorAll(".card-variant-btn"))
          .find(btn => inferType(btn) === "keychain");
        if (keychain) keychain.classList.add("active");
      }
    });
  };

  const start = () => {
    updateLabels(document);
    document.addEventListener("click", event => {
      const unavailableVariant = event.target.closest?.(".card-variant-btn.coming-soon, .variant-pill.coming-soon");
      if (unavailableVariant) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
        showComingSoonBubble(unavailableVariant);
        return;
      }

      const addButton = event.target.closest?.(".add-to-cart-btn");
      if (!addButton) return;
      const card = addButton.closest(".product-card");
      const active = card?.querySelector(".card-variant-btn.active");
      if (active && inferType(active) !== "keychain") {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
        active.classList.remove("active");
        const keychain = Array.from(card.querySelectorAll(".card-variant-btn"))
          .find(btn => inferType(btn) === "keychain");
        if (keychain) keychain.classList.add("active");
        showComingSoonBubble(addButton);
      }
    }, true);

    if (!document.body) return;
    new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) updateLabels(node);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}

installProductCardLiftStyles();
initShopCategoryViewportBehavior();
labelUpcomingProductVariantButtons();

const firebaseConfig = {
  apiKey: "AIzaSyBJD5r0KmlqygWAa0rT17dWplXQQ96IeW4",
  authDomain: "patch-559c8.firebaseapp.com",
  projectId: "patch-559c8",
  storageBucket: "patch-559c8.firebasestorage.app",
  messagingSenderId: "584233188985",
  appId: "1:584233188985:web:7be3979a2ad505bc711ea8",
  measurementId: "G-WCE9XXHF2F"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const storage = getStorage(app);

const QUEUE_DOC = doc(db, "config", "queue");

/**
 * loadQueue - loads queue items from Firestore
 * @returns {Promise<Array>} array of { name, status, img }
 */
export async function loadQueue() {
  try {
    const snap = await getDoc(QUEUE_DOC);
    if (snap.exists()) {
      return snap.data().items || [];
    }
    return [];
  } catch (err) {
    throw err;
  }
}

/**
 * saveQueue - saves queue array to Firestore
 * @param {Array} items - array of { name, status, img }
 */
export async function saveQueue(items) {
  await setDoc(QUEUE_DOC, { items });
}

/**
 * validateImageFile - checks that a file is an image and under 10MB.
 * Throws a user-friendly Error if validation fails.
 * @param {File} file
 */
function validateImageFile(file) {
  if (!file.type.startsWith('image/')) throw new Error('Only image files are accepted.');
  if (file.size > 10 * 1024 * 1024) throw new Error('File must be under 10MB.');
}

/**
 * addSubmission - uploads files to Storage, saves submission to Firestore,
 * appends new entry to the live queue
 * @param {Object} data - { name, email, phone, agency, description }
 * @param {File|null} generatedFile - preferred digital/vector file
 * @param {File|null} patchFile - physical patch photo
 */
export async function addSubmission(data, generatedFile, patchFile) {
  let generatedImageURL = "";
  let patchPhotoURL = "";

  if (generatedFile) {
    validateImageFile(generatedFile);
    const gRef = ref(storage, "submissions/" + Date.now() + "_gen_" + generatedFile.name);
    await uploadBytes(gRef, generatedFile);
    generatedImageURL = await getDownloadURL(gRef);
  }

  if (patchFile) {
    validateImageFile(patchFile);
    const pRef = ref(storage, "submissions/" + Date.now() + "_patch_" + patchFile.name);
    await uploadBytes(pRef, patchFile);
    patchPhotoURL = await getDownloadURL(pRef);
  }

  const submission = {
    name: data.name,
    email: data.email,
    phone: data.phone || "",
    agency: data.agency,
    description: data.description,
    generatedImageURL,
    patchPhotoURL,
    submittedAt: new Date().toISOString()
  };

  await addDoc(collection(db, "submissions"), submission);

  // Append to live queue
  const currentItems = await loadQueue();
  const newItem = {
    name: data.agency,
    status: "Queued",
    img: patchPhotoURL || generatedImageURL || ""
  };
  await saveQueue([...currentItems, newItem]);
}

/**
 * uploadProduct - uploads a completed keychain photo and prepends it to the queue
 */
export async function uploadProduct(name, status, file) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const safeName = name.replace(/[^a-zA-Z0-9_-]/g, "_");
  const storageRef = ref(storage, `products/${safeName}_${Date.now()}.${ext}`);
  await uploadBytes(storageRef, file);
  const img = await getDownloadURL(storageRef);
  const currentItems = await loadQueue();
  const newItem = { name, status, img };
  await saveQueue([newItem, ...currentItems]);
  return newItem;
}

/**
 * loadSubmissions - returns all submissions ordered by submittedAt desc
 * @returns {Promise<Array>}
 */
export async function loadSubmissions() {
  const q = query(collection(db, "submissions"), orderBy("submittedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

const PRODUCT_PHOTOS_DOC = doc(db, "config", "productPhotos");
const HIDDEN_PRODUCTS_DOC = doc(db, "config", "hiddenProducts");
const HERO_IMAGE_DOC = doc(db, "config", "heroImage");

/**
 * loadProductPhotos - returns map of { productId: photoURL }
 */
export async function loadProductPhotos() {
  const snap = await getDoc(PRODUCT_PHOTOS_DOC);
  return snap.exists() ? snap.data() : {};
}

/**
 * loadHiddenProducts - returns array of hidden product IDs
 */
export async function loadHiddenProducts() {
  const snap = await getDoc(HIDDEN_PRODUCTS_DOC);
  return snap.exists() ? (snap.data().items || []) : [];
}

/**
 * saveHiddenProducts - saves array of hidden product IDs
 */
export async function saveHiddenProducts(ids) {
  await setDoc(HIDDEN_PRODUCTS_DOC, { items: ids });
}

/**
 * loadHeroImage - returns hero logo URL or empty string
 */
export async function loadHeroImage() {
  const snap = await getDoc(HERO_IMAGE_DOC);
  return snap.exists() ? (snap.data().url || "") : "";
}

/**
 * uploadHeroImage - uploads logo to Storage and saves URL to Firestore
 */
export async function uploadHeroImage(file) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const storageRef = ref(storage, `hero/logo_${Date.now()}.${ext}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  await setDoc(HERO_IMAGE_DOC, { url });
  return url;
}

/**
 * uploadProductPhoto - uploads file to Storage and saves URL to Firestore
 * @param {string} productId
 * @param {File} file
 * @returns {Promise<string>} download URL
 */
export async function uploadProductPhoto(productId, file) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const storageRef = ref(storage, `product-photos/${productId}_${Date.now()}.${ext}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  await setDoc(PRODUCT_PHOTOS_DOC, { [productId]: url }, { merge: true });
  return url;
}

const SHOPIFY_LINKS_DOC = doc(db, "config", "shopifyLinks");

/**
 * loadShopifyLinks - returns map of { productId: shopifyProductUrl }
 */
export async function loadShopifyLinks() {
  const snap = await getDoc(SHOPIFY_LINKS_DOC);
  return snap.exists() ? snap.data() : {};
}

/**
 * saveShopifyLinks - saves map of { productId: shopifyProductUrl }
 */
export async function saveShopifyLinks(links) {
  await setDoc(SHOPIFY_LINKS_DOC, links);
}
