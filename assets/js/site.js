/* MicroPatches — shared site behavior
 * ------------------------------------------------------------------
 * - Renders shared nav + footer + cart drawer from placeholders
 * - Manages local cart (preview); routes checkout to Shopify
 * - Sets aria-current on nav from <body data-page="…">
 * - Toast notifications, edit-mode hooks
 * ------------------------------------------------------------------ */
(function () {
  'use strict';

  // ============================================================
  // Shared chrome
  // ============================================================
  const NAV_ITEMS = [
    { id: 'home',     label: 'Home',          href: 'index.html'   },
    { id: 'shop',     label: 'Shop',          href: 'shop.html'    },
    { id: 'custom',   label: 'Custom Orders', href: 'custom.html'  },
    { id: 'about',    label: 'About',         href: 'about.html'   },
    { id: 'faq',      label: 'FAQ',           href: 'faq.html'     },
    { id: 'contact',  label: 'Contact',       href: 'contact.html' },
  ];

  function currentPage() {
    return document.body.dataset.page || '';
  }

  function renderHeader(target) {
    const page = currentPage();
    target.outerHTML = `
<header class="site-header">
  <div class="container site-header__inner">
    <a class="brand" href="index.html" aria-label="MicroPatches home">
      <span class="brand__mark">M</span>
      <span>MicroPatches</span>
    </a>
    <nav class="nav" aria-label="Primary">
      ${NAV_ITEMS.map(n => `<a href="${n.href}"${n.id === page ? ' aria-current="page"' : ''}>${n.label}</a>`).join('')}
    </nav>
    <div class="header-tools">
      <button class="menu-toggle" data-menu-toggle aria-label="Menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <a href="#" class="cart-btn" data-cart-open>
        Cart <span class="cart-btn__count" data-cart-count>0</span>
      </a>
    </div>
  </div>
  <div class="mobile-nav-backdrop" data-mobile-nav-backdrop hidden></div>
  <div class="mobile-nav" data-mobile-nav hidden>
    ${NAV_ITEMS.map(n => `<a href="${n.href}"${n.id === page ? ' aria-current="page"' : ''}>${n.label}</a>`).join('')}
  </div>
</header>`;
  }

  function renderFooter(target) {
    target.outerHTML = `
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <h3 class="display">MicroPatches</h3>
        <p>Your patch. Now micro. Carry your patch anywhere — made in Phoenix, Arizona.</p>
        <div class="footer-stamps">
          <span class="tag dot red">USA Made</span>
          <span class="tag dot">Active LE Owned</span>
          <span class="tag dot">No Minimums</span>
        </div>
      </div>
      <div class="footer-col">
        <h4>Shop</h4>
        <ul>
          <li><a href="shop.html">All MicroKeychains</a></li>
          <li><a href="custom.html">Custom Orders</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="about.html">About</a></li>
          <li><a href="faq.html">FAQ</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Policies</h4>
        <ul>
          <li><a href="shipping.html">Shipping Policy</a></li>
          <li><a href="refunds.html">Refund Policy</a></li>
          <li><a href="privacy.html">Privacy Policy</a></li>
          <li><a href="terms.html">Terms of Service</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-base">
      <div>© <span data-year>2026</span> MicroPatches · officialmicropatches.com · Made in Phoenix, AZ · USA Made · Active Law Enforcement Owned</div>
      <div class="socials">
        <a href="mailto:OfficialMicroPatches@gmail.com" aria-label="Email">Email</a>
        <a href="https://instagram.com/micropatches" target="_blank" rel="noopener">IG</a>
        <a href="https://tiktok.com/@micro.patches" target="_blank" rel="noopener">TT</a>
      </div>
    </div>
  </div>
</footer>`;
  }

  function renderCartDrawer(target) {
    target.outerHTML = `
<div class="cart-drawer-bg" data-cart-bg></div>
<aside class="cart-drawer" data-cart-drawer aria-label="Shopping cart">
  <div class="cart-drawer__head">
    <h3>Your Cart</h3>
    <button class="cart-drawer__close" data-cart-close aria-label="Close cart">Close ×</button>
  </div>
  <div class="cart-drawer__body" data-cart-body></div>
  <div class="cart-drawer__foot">
    <div class="cart-drawer__totals"><span>Subtotal</span><span data-cart-sub>$0.00</span></div>
    <div class="cart-drawer__totals"><span>Shipping</span><span>Calculated at checkout</span></div>
    <div class="cart-drawer__totals grand"><span>Total</span><span data-cart-grand>$0.00</span></div>
    <button class="btn btn--primary" data-cart-checkout>
      <span class="label">Checkout on Shopify</span>
      <span class="arr">→</span>
    </button>
    <p class="cart-drawer__note" data-cart-note></p>
  </div>
</aside>`;
  }

  function injectChrome() {
    const h = document.querySelector('[data-site-header]');
    if (h) renderHeader(h);
    const f = document.querySelector('[data-site-footer]');
    if (f) renderFooter(f);
    const c = document.querySelector('[data-cart-drawer-mount]');
    if (c) renderCartDrawer(c);
    // Set year
    document.querySelectorAll('[data-year]').forEach(e => e.textContent = new Date().getFullYear());
  }

  // ============================================================
  // Cart (local preview)
  // ============================================================
  const CART_KEY = 'mp_cart_v2';

  function readCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function writeCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    renderCart();
    updateBadge();
  }
  function addToCart(item) {
    const cart = readCart();
    const idx = cart.findIndex(i => i.id === item.id);
    if (idx >= 0) cart[idx].qty += (item.qty || 1);
    else cart.push({ ...item, qty: item.qty || 1 });
    writeCart(cart);
    toast('Added: ' + item.name);
  }
  function removeFromCart(id) { writeCart(readCart().filter(i => i.id !== id)); }
  function setQty(id, qty) {
    const cart = readCart();
    const i = cart.find(x => x.id === id);
    if (!i) return;
    i.qty = Math.max(1, qty);
    writeCart(cart);
  }

  function updateBadge() {
    const count = readCart().reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = count;
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function renderCart() {
    const cart = readCart();
    const body = document.querySelector('[data-cart-body]');
    const sub  = document.querySelector('[data-cart-sub]');
    const grand = document.querySelector('[data-cart-grand]');
    const checkoutBtn = document.querySelector('[data-cart-checkout]');
    const note = document.querySelector('[data-cart-note]');
    if (!body) return;

    if (cart.length === 0) {
      body.innerHTML = '<div class="cart-drawer__empty">Cart is empty.<br/><br/><a href="shop.html" class="btn btn--ghost btn--sm">Browse MicroKeychains</a></div>';
      if (sub) sub.textContent = '$0.00';
      if (grand) grand.textContent = '$0.00';
      if (checkoutBtn) checkoutBtn.setAttribute('disabled', 'true');
      if (note) note.textContent = '';
      return;
    }
    if (checkoutBtn) checkoutBtn.removeAttribute('disabled');

    body.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item__img" ${item.image ? `style="background:url('${escapeHtml(item.image)}') center/cover, var(--bg-2);"` : ''}></div>
        <div>
          <div class="cart-item__name">${escapeHtml(item.name)}</div>
          <div class="cart-item__meta">${item.lot ? 'LOT ' + escapeHtml(item.lot) + ' · ' : ''}${escapeHtml(item.cat || '')}</div>
          <div class="cart-item__qty">
            <button data-qty-dec="${escapeHtml(item.id)}" aria-label="Decrease">−</button>
            <span>${item.qty}</span>
            <button data-qty-inc="${escapeHtml(item.id)}" aria-label="Increase">+</button>
          </div>
        </div>
        <div>
          <div class="cart-item__price">$${(item.price * item.qty).toFixed(2)}</div>
          <button class="cart-item__remove" data-remove="${escapeHtml(item.id)}">Remove</button>
        </div>
      </div>
    `).join('');

    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    if (sub) sub.textContent = '$' + subtotal.toFixed(2);
    if (grand) grand.innerHTML = '<b>$' + subtotal.toFixed(2) + '</b>';

    // Checkout state — show clear note based on Shopify config
    if (note) {
      const cfg = window.SHOPIFY || {};
      if (!cfg.SHOP_DOMAIN) {
        note.innerHTML = '<span class="warn">⚠ Preview mode — set SHOP_DOMAIN in assets/js/shopify-config.js to enable real checkout.</span>';
      } else {
        const hasVariants = cart.every(i => i.variantId);
        note.textContent = hasVariants
          ? 'Secure checkout via Shopify.'
          : 'Each item opens on Shopify (variant IDs not yet linked — see launch checklist).';
      }
    }

    body.querySelectorAll('[data-qty-dec]').forEach(b => b.addEventListener('click', () => {
      const id = b.getAttribute('data-qty-dec'); const i = readCart().find(x => x.id === id); if (i) setQty(id, i.qty - 1);
    }));
    body.querySelectorAll('[data-qty-inc]').forEach(b => b.addEventListener('click', () => {
      const id = b.getAttribute('data-qty-inc'); const i = readCart().find(x => x.id === id); if (i) setQty(id, i.qty + 1);
    }));
    body.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => {
      removeFromCart(b.getAttribute('data-remove'));
    }));
  }

  function openCart() {
    document.querySelector('[data-cart-drawer]')?.classList.add('open');
    document.querySelector('[data-cart-bg]')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    document.querySelector('[data-cart-drawer]')?.classList.remove('open');
    document.querySelector('[data-cart-bg]')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ============================================================
  // Checkout — routes to Shopify
  // ============================================================
  function checkout() {
    const cart = readCart();
    if (cart.length === 0) return;
    const cfg = window.SHOPIFY || {};
    if (!cfg.SHOP_DOMAIN) {
      toast('Shopify not configured — see launch checklist.');
      return;
    }
    // Prefer cart permalink with variant IDs (single-click checkout)
    const url = cfg.cartUrl ? cfg.cartUrl(cart) : null;
    if (url) {
      window.location.href = url;
      return;
    }
    // Fallback: open the first product page on Shopify (one at a time)
    const first = cart[0];
    if (first.handle && cfg.productUrl) {
      window.location.href = cfg.productUrl(first.handle);
    }
  }

  // ============================================================
  // Toast
  // ============================================================
  let toastT;
  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.innerHTML = '<span class="dot"></span>' + escapeHtml(msg);
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 2400);
  }

  // ============================================================
  // Mobile menu
  // ============================================================
  function wireMobileMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');
    const backdrop = document.querySelector('[data-mobile-nav-backdrop]');
    if (!toggle || !nav) return;

    const isOpen = () => !nav.hasAttribute('hidden');

    const openMenu = () => {
      nav.removeAttribute('hidden');
      backdrop?.removeAttribute('hidden');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.classList.add('is-open');
      document.body.classList.add('nav-open');
    };

    const closeMenu = () => {
      if (!isOpen()) return;
      nav.setAttribute('hidden', '');
      backdrop?.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.classList.remove('is-open');
      document.body.classList.remove('nav-open');
    };

    toggle.addEventListener('click', () => { isOpen() ? closeMenu() : openMenu(); });
    backdrop?.addEventListener('click', closeMenu);
    window.addEventListener('scroll', closeMenu, { passive: true });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }

  // ============================================================
  // Init
  // ============================================================
  document.addEventListener('DOMContentLoaded', () => {
    injectChrome();
    wireMobileMenu();
    renderCart();
    updateBadge();

    document.querySelectorAll('[data-cart-open]').forEach(el => el.addEventListener('click', (e) => { e.preventDefault(); openCart(); }));
    document.querySelectorAll('[data-cart-close]').forEach(el => el.addEventListener('click', closeCart));
    document.querySelectorAll('[data-cart-bg]').forEach(el => el.addEventListener('click', closeCart));
    document.querySelectorAll('[data-cart-checkout]').forEach(el => el.addEventListener('click', checkout));

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });

    // Add-to-cart buttons (delegation so dynamic content works too)
    document.body.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-add-to-cart]');
      if (!btn) return;
      e.preventDefault();
      const d = btn.dataset;

      const cfg = window.SHOPIFY || {};
      // If Shopify is configured and we don't have a variant ID, the most reliable
      // purchase path is the real Shopify product page. Skip the local cart entirely.
      if (cfg.SHOP_DOMAIN && !d.variantId && d.handle) {
        window.open(cfg.productUrl(d.handle), '_blank', 'noopener');
        return;
      }

      addToCart({
        id: d.id, name: d.name,
        price: parseFloat(d.price) || 13.99,
        lot: d.lot || '', cat: d.cat || '',
        handle: d.handle || '',
        variantId: d.variantId || '',
        image: d.image || '',
      });
      btn.classList.add('added');
      const label = btn.querySelector('.label');
      if (label) {
        const orig = label.textContent;
        label.textContent = 'Added ✓';
        setTimeout(() => { label.textContent = orig; btn.classList.remove('added'); }, 1400);
      }
    });
  });

  // expose
  window.MP = { addToCart, removeFromCart, openCart, closeCart, toast, checkout };
})();
