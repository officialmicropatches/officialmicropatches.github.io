/**
 * shopify-loader.js
 * MicroPatches — Dynamic product grid loader + filter engine
 * Version: 2.0 — 2026-05-15
 *
 * WHAT THIS DOES:
 *   Reads window.SHOPIFY_PRODUCTS (from shopify-products-data.js) and replaces
 *   the static product grid on officialmicropatches.com with live Shopify-sourced
 *   product cards. Owns its own filter engine so the page's original main.js
 *   filter (which holds stale NodeList references) is bypassed entirely.
 *
 * SETUP (add to index.html BEFORE </body>, in this order):
 *   1.  <script src="assets/js/shopify-products-data.js"></script>
 *   2.  <script src="assets/js/shopify-loader.js"></script>
 *
 * TO UPDATE PRODUCTS:
 *   Re-upload a new shopify-products-data.js. No changes needed to this file.
 */

(function () {
  'use strict';

  var STORE_URL = 'https://micropatches.myshopify.com';

  /* ------------------------------------------------------------------ */
  /*  Bail out if data file wasn't loaded first                          */
  /* ------------------------------------------------------------------ */
  if (!window.SHOPIFY_PRODUCTS || !Array.isArray(window.SHOPIFY_PRODUCTS)) {
    console.warn('[MicroPatches] shopify-products-data.js not loaded — product grid unchanged.');
    return;
  }

  /* ------------------------------------------------------------------ */
  /*  Build a single product card element                                */
  /* ------------------------------------------------------------------ */
  function buildCard(product) {
    var inStock    = product.inventory > 0;
    var productUrl = STORE_URL + '/products/' + product.handle;
    var cartUrl    = STORE_URL + '/cart/' + product.variantId + ':1';

    var card = document.createElement('div');
    card.className = 'product-card';

    // data attributes used by the filter engine
    card.setAttribute('data-category', product.category || '');
    card.setAttribute('data-state',    product.state    || '');
    card.setAttribute('data-type',     product.type     || '');

    // Out-of-stock badge
    var badgeHtml = '';
    if (!inStock) {
      badgeHtml = '<span class="out-of-stock-badge">Out of Stock</span>';
    }

    // Build image HTML — lazy-load for performance
    var imgHtml = product.image
      ? '<img src="' + escapeAttr(product.image) + '" alt="' + escapeAttr(product.title) + '" loading="lazy" onerror="this.style.display=\'none\'">'
      : '<div class="no-image">No Image</div>';

    card.innerHTML =
      '<a href="' + escapeAttr(productUrl) + '" target="_blank" rel="noopener" class="product-image-link">' +
        '<div class="product-image-container">' +
          imgHtml +
          badgeHtml +
        '</div>' +
      '</a>' +
      '<div class="product-info">' +
        '<h3 class="product-title">' +
          '<a href="' + escapeAttr(productUrl) + '" target="_blank" rel="noopener">' +
            escapeHtml(product.title) +
          '</a>' +
        '</h3>' +
        '<p class="product-price">$' + escapeHtml(String(product.price)) + '</p>' +
        (inStock
          ? '<a href="' + escapeAttr(cartUrl) + '" target="_blank" rel="noopener" class="add-to-cart-btn">Add to Cart</a>'
          : '<button class="add-to-cart-btn out-of-stock-btn" disabled>Out of Stock</button>'
        ) +
      '</div>';

    return card;
  }

  /* ------------------------------------------------------------------ */
  /*  Inject products into the grid                                      */
  /* ------------------------------------------------------------------ */
  function renderGrid() {
    var grid = document.querySelector('.product-grid.homepage-product-grid');
    if (!grid) {
      grid = document.querySelector('.product-grid') ||
             document.querySelector('#product-grid') ||
             document.querySelector('.homepage-product-grid');
    }

    if (!grid) {
      console.warn('[MicroPatches] Could not find a product grid container — no products rendered.');
      return;
    }

    // Clear existing static cards
    grid.innerHTML = '';

    var fragment = document.createDocumentFragment();
    var products = window.SHOPIFY_PRODUCTS;

    for (var i = 0; i < products.length; i++) {
      fragment.appendChild(buildCard(products[i]));
    }

    grid.appendChild(fragment);

    console.log('[MicroPatches] Loaded ' + products.length + ' products from Shopify catalog.');

    // Now wire up our own filter engine
    setupFilters();
  }

  /* ------------------------------------------------------------------ */
  /*  Self-contained filter engine                                       */
  /*  Queries .product-card fresh on every filter change so stale        */
  /*  NodeList references from main.js are never an issue.               */
  /* ------------------------------------------------------------------ */
  function setupFilters() {
    var activeTab  = 'all';
    var activeType = 'all';
    var searchTerm = '';

    /* -- Apply all active filters to every card ----------------------- */
    function applyFilters() {
      var cards = document.querySelectorAll('.product-card');
      var visible = 0;

      for (var i = 0; i < cards.length; i++) {
        var cat  = cards[i].getAttribute('data-category') || '';
        var type = cards[i].getAttribute('data-type')     || '';
        var title = (cards[i].querySelector('.product-title') || {}).textContent || '';

        var tabMatch    = activeTab  === 'all' || cat  === activeTab;
        var typeMatch   = activeType === 'all' || type === activeType;
        var searchMatch = searchTerm === ''    || title.toLowerCase().indexOf(searchTerm) !== -1;

        var show = tabMatch && typeMatch && searchMatch;
        cards[i].style.display = show ? '' : 'none';
        if (show) visible++;
      }

      updateCount(visible);
    }

    /* -- Update any product-count display on the page ----------------- */
    function updateCount(n) {
      var countEl = document.querySelector('.product-count, #product-count, .results-count');
      if (countEl) {
        countEl.textContent = n + ' product' + (n === 1 ? '' : 's');
      }
    }

    /* -- Category tab buttons (data-tab="military" etc.) -------------- */
    var tabBtns = document.querySelectorAll('[data-tab]');
    for (var t = 0; t < tabBtns.length; t++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          activeTab  = btn.getAttribute('data-tab') || 'all';
          activeType = 'all';   // reset sub-filter when switching tabs

          // Update active class on tab buttons
          for (var j = 0; j < tabBtns.length; j++) {
            tabBtns[j].classList.toggle('active', tabBtns[j] === btn);
          }

          // Clear active class on type filter buttons
          var typeBtns = document.querySelectorAll('[data-shop-filter]');
          for (var k = 0; k < typeBtns.length; k++) {
            typeBtns[k].classList.remove('active');
          }

          applyFilters();
        });
      })(tabBtns[t]);
    }

    /* -- Sub-type filter buttons (data-shop-filter="type" etc.) ------- */
    var filterBtns = document.querySelectorAll('[data-shop-filter]');
    for (var f = 0; f < filterBtns.length; f++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var val = btn.getAttribute('data-filter-value') || 'all';

          // Toggle: clicking an already-active type filter resets it
          if (activeType === val) {
            activeType = 'all';
            btn.classList.remove('active');
          } else {
            activeType = val;
            for (var j = 0; j < filterBtns.length; j++) {
              filterBtns[j].classList.toggle('active', filterBtns[j] === btn);
            }
          }

          applyFilters();
        });
      })(filterBtns[f]);
    }

    /* -- Search input ------------------------------------------------- */
    var searchInput = document.querySelector('input[type="search"], .shop-search-input, #product-search, .search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        searchTerm = (searchInput.value || '').trim().toLowerCase();
        applyFilters();
      });
    }

    /* -- Initial pass: show all products and set count ---------------- */
    applyFilters();
  }

  /* ------------------------------------------------------------------ */
  /*  Safety helpers                                                     */
  /* ------------------------------------------------------------------ */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;');
  }

  /* ------------------------------------------------------------------ */
  /*  Entry point — run after DOM is ready                               */
  /* ------------------------------------------------------------------ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderGrid);
  } else {
    renderGrid();
  }

})();
