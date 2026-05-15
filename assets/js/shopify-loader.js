/**
 * shopify-loader.js
 * MicroPatches — Dynamic product grid loader
 * Version: 1.0 — 2026-05-15
 *
 * WHAT THIS DOES:
 *   Reads window.SHOPIFY_PRODUCTS (from shopify-products-data.js) and replaces
 *   the static product grid on officialmicropatches.com with live Shopify-sourced
 *   product cards. All existing filters (category, state, type) continue to work.
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

    // data attributes used by the existing filter JS
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
      // Try common fallback selectors
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

    // Update product count display if one exists on the page
    var countEl = document.querySelector('.product-count, #product-count, .results-count');
    if (countEl) {
      countEl.textContent = products.length + ' products';
    }

    console.log('[MicroPatches] Loaded ' + products.length + ' products from Shopify catalog.');

    // Re-trigger the existing filter system so it recognizes the new cards
    triggerFilterRefresh();
  }

  /* ------------------------------------------------------------------ */
  /*  Re-initialize the page's existing filter/search logic              */
  /* ------------------------------------------------------------------ */
  function triggerFilterRefresh() {
    // Pattern 1: filterProducts() global function
    if (typeof window.filterProducts === 'function') {
      try { window.filterProducts(); } catch (e) {}
      return;
    }

    // Pattern 2: applyFilters() global function
    if (typeof window.applyFilters === 'function') {
      try { window.applyFilters(); } catch (e) {}
      return;
    }

    // Pattern 3: dispatch a custom event the filter script might listen for
    var evt;
    try {
      evt = new CustomEvent('productsLoaded', { bubbles: true });
    } catch (e) {
      evt = document.createEvent('CustomEvent');
      evt.initCustomEvent('productsLoaded', true, false, {});
    }
    document.dispatchEvent(evt);

    // Pattern 4: simulate a change event on any active filter dropdowns/buttons
    // so the filter re-runs without the user needing to interact
    var filterControls = document.querySelectorAll(
      'select[data-filter], input[data-filter], .filter-btn.active, .filter-button.active'
    );
    for (var i = 0; i < filterControls.length; i++) {
      try {
        var changeEvt = document.createEvent('HTMLEvents');
        changeEvt.initEvent('change', true, true);
        filterControls[i].dispatchEvent(changeEvt);
      } catch (e) {}
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Safety helpers (no template-literal deps for older browser compat) */
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
    // DOMContentLoaded already fired (script is deferred or at bottom of body)
    renderGrid();
  }

})();
