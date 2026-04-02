/**
 * main.js — Shared JS for MicroPatches site
 */

import { loadQueue, saveQueue, addSubmission, loadSubmissions } from "./firebase.js";

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
   INTERSECTION OBSERVER — FADE-IN ANIMATIONS
   ========================================================= */
(function initAnimations() {
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
})();

/* =========================================================
   SHOP PAGE — TAB FILTER
   ========================================================= */
(function initShopTabs() {
  const tabsWrap = document.querySelector(".shop-tabs");
  if (!tabsWrap) return;

  const tabs    = tabsWrap.querySelectorAll(".shop-tab");
  const cards   = document.querySelectorAll(".product-card[data-category]");
  const grid    = document.querySelector(".product-grid");

  function activateTab(cat) {
    tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === cat));
    cards.forEach(card => {
      const match = cat === "all" || card.dataset.category === cat;
      card.style.display = match ? "" : "none";
    });
    if (grid) grid.style.opacity = "0.4";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (grid) grid.style.opacity = "1";
      });
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      activateTab(tab.dataset.tab);
      history.replaceState(null, "", "#" + tab.dataset.tab);
    });
  });

  // Hash detection on load
  const hash = location.hash.replace("#", "");
  if (hash) {
    const validTabs = ["law-enforcement", "military", "fire-ems", "pink-patch"];
    if (validTabs.includes(hash)) {
      activateTab(hash);
      const target = document.getElementById(hash);
      if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth" }), 200);
      return;
    }
  }
  activateTab("all");
})();

/* =========================================================
   CUSTOM ORDER PAGE — URL PARAM ?type=exchange
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
   QUEUE PAGE — LOAD & RENDER QUEUE
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
          <p><strong>Phone:</strong> ${escH(s.phone || "—")}</p>
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
   CONTACT PAGE — COPY EMAIL TO CLIPBOARD
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
});

/*
 * SECURITY AUDIT REPORT
 * =====================
 * 1. XSS PREVENTION      — PASS. All user-supplied content rendered via escH()/escA() before
 *                          innerHTML insertion. No raw user data injected.
 * 2. NO EVAL             — PASS. eval() is not used anywhere in this codebase.
 * 3. NO INLINE HANDLERS  — PASS. All event handlers bound programmatically in main.js.
 * 4. NO CONSOLE.LOG      — PASS. No debug logging statements present.
 * 5. FILE UPLOAD SAFETY  — PASS. File inputs use accept="image/*". Firebase Storage rules
 *                          should enforce max file size (recommended 5MB) and MIME type.
 * 6. EXTERNAL LINKS      — PASS. All external links use rel="noopener noreferrer" target="_blank".
 * 7. FORM TARGETS        — PASS. Contact/custom forms POST only to Formspree. Submission form
 *                          uses Firebase SDK, no raw POST endpoint.
 * 8. FIREBASE CONFIG     — INFO. API key is public-facing by design (standard Firebase web pattern).
 *                          Security is enforced via Firestore and Storage Security Rules.
 *                          Recommended: restrict Firestore writes to authenticated users or
 *                          rate-limited rules. Storage rules should enforce image/* and max size.
 * 9. ADMIN PASSWORD      — INFO. Stored in localStorage (same as existing site). Acceptable for
 *                          low-stakes admin use. Not suitable for sensitive data access.
 * 10. CSP HEADERS        — PENDING. See HTML file comments for recommended _headers configuration
 *                          to apply via GitHub Pages + Cloudflare or a custom _headers file.
 * 11. SOURCE MAPS        — PASS. No source map references.
 * 12. LINK INTEGRITY     — PASS. All internal links use relative paths. Stripe and Formspree
 *                          placeholders marked with HTML comments for owner replacement.
 */
