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
<div class="announce-bar">
  <span>Free U.S. shipping over $70</span>
  <span class="announce-bar__sep">·</span>
  <span>10% off 3+ keychains, automatic at checkout</span>
  <span class="announce-bar__sep">·</span>
  <a href="custom.html">Custom orders open →</a>
</div>
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
        <form data-newsletter style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;max-width:340px">
          <input type="email" name="email" required placeholder="Email for new drops &amp; restocks" autocomplete="email"
            style="flex:1 1 180px;min-width:0;background:var(--bg-2);border:1px solid var(--line-2);border-radius:8px;padding:10px 12px;color:var(--ink);font:inherit;font-size:14px">
          <button type="submit"
            style="background:var(--accent);color:var(--on-accent);border:0;border-radius:8px;padding:10px 16px;font-family:var(--f-mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer">Join</button>
          <p data-newsletter-msg style="flex:1 1 100%;margin:2px 0 0;font-size:12px;color:var(--ink-dim);min-height:1em"></p>
        </form>
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
      <div>© <span data-year>2026</span> MicroPatches · Phoenix, AZ · USA Made · Active LE Owned</div>
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
    try { wireNewsletter(); } catch (e) {}
  }

  // Footer email capture — writes to the same Firebase the custom form uses
  // (submissions collection, type:"subscribe"). Self-contained REST, no SDK.
  function wireNewsletter() {
    var form = document.querySelector('form[data-newsletter]');
    if (!form || form.dataset.wired) return;
    form.dataset.wired = '1';
    var KEY = 'AIzaSyBJD5r0KmlqygWAa0rT17dWplXQQ96IeW4';
    var PROJ = 'patch-559c8';
    var msg = form.querySelector('[data-newsletter-msg]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = (form.email.value || '').trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { msg.textContent = 'Enter a valid email.'; return; }
      var btn = form.querySelector('button');
      btn.disabled = true; msg.textContent = 'Joining…';
      fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + KEY, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnSecureToken: true })
      })
        .then(function (r) { return r.json(); })
        .then(function (a) {
          if (!a.idToken) throw new Error('auth');
          return fetch('https://firestore.googleapis.com/v1/projects/' + PROJ + '/databases/(default)/documents/submissions', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + a.idToken, 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields: {
              type: { stringValue: 'subscribe' },
              email: { stringValue: email },
              submittedAt: { stringValue: new Date().toISOString() },
              source: { stringValue: location.host + location.pathname }
            } })
          });
        })
        .then(function (r) {
          if (!r.ok) throw new Error('save');
          msg.style.color = 'var(--accent)';
          msg.textContent = '✓ You’re on the list — thanks!';
          form.email.value = '';
        })
        .catch(function () {
          msg.textContent = 'Could not sign up — email OfficialMicroPatches@gmail.com';
        })
        .then(function () { btn.disabled = false; });
    });
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
        note.textContent = 'Secure checkout via Shopify.';
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
    const first = cart[0];
    const fallback = () => {
      if (first && first.handle && cfg.productUrl) window.location.href = cfg.productUrl(first.handle);
    };
    // Resolve variant IDs from the live catalog so multi-item checkout works
    // even when items were added without a variant ID.
    if (cfg.buildCheckoutUrl) {
      toast('Opening secure checkout…');
      cfg.buildCheckoutUrl(cart)
        .then((url) => { url ? (window.location.href = url) : fallback(); })
        .catch(fallback);
      return;
    }
    const syncUrl = cfg.cartUrl ? cfg.cartUrl(cart) : null;
    if (syncUrl) { window.location.href = syncUrl; return; }
    fallback();
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
