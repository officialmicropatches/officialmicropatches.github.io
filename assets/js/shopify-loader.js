/**
 * shopify-loader.js
 * MicroPatches — Live product grid loader
 * Version: 3.0 — 2026-05-15
 *
 * Fetches products live from the public Shopify JSON endpoint on every page
 * load. No API token required. Add a product in Shopify → it appears on the
 * site automatically on the next page load.
 */

(function () {
  'use strict';

  var STORE_URL = 'https://micropatches.myshopify.com';

  var CATEGORY_MAP = [
    { tags: ['fire', 'fire department', 'fire dept', 'firefighter'], value: 'fire' },
    { tags: ['military', 'army', 'navy', 'marines', 'air force', 'coast guard', 'national guard', 'usmc', 'usaf', 'usn'], value: 'military' },
    { tags: ['ems', 'emergency medical', 'paramedic', 'medic', 'ambulance'], value: 'ems' },
    { tags: ['corrections', 'correctional', 'jail', 'prison', 'detention'], value: 'corrections' },
    { tags: ['search and rescue', 'sar', 'rescue'], value: 'search-rescue' },
    { tags: ['law enforcement', 'police', 'sheriff', 'constable', 'marshal', 'trooper', 'highway patrol', 'state police'], value: 'law-enforcement' }
  ];

  var TYPE_MAP = [
    { tags: ['sheriff'], value: 'sheriff' },
    { tags: ['police'], value: 'police' },
    { tags: ['fire', 'firefighter'], value: 'fire' },
    { tags: ['corrections', 'correctional'], value: 'corrections' },
    { tags: ['military'], value: 'military' },
    { tags: ['ems', 'paramedic'], value: 'ems' },
    { tags: ['search and rescue', 'sar'], value: 'search-rescue' }
  ];

  function matchTags(productTags, mapEntry) {
    var lower = productTags.map(function (t) { return t.toLowerCase(); });
    return mapEntry.tags.some(function (keyword) {
      return lower.indexOf(keyword) !== -1;
    });
  }

  function getCategory(tags) {
    for (var i = 0; i < CATEGORY_MAP.length; i++) {
      if (matchTags(tags, CATEGORY_MAP[i])) return CATEGORY_MAP[i].value;
    }
    return '';
  }

  function getType(tags) {
    for (var i = 0; i < TYPE_MAP.length; i++) {
      if (matchTags(tags, TYPE_MAP[i])) return TYPE_MAP[i].value;
    }
    return '';
  }

  function buildCard(product) {
    var variant   = (product.variants && product.variants[0]) || {};
    var inStock   = variant.available === true;
    var variantId = variant.id;
    var price     = variant.price || '13.99';
    var title     = product.title  || '';
    var handle    = product.handle || '';
    var tags      = product.tags   || [];
    var image     = (product.images && product.images[0]) ? product.images[0].src : null;
    var category  = getCategory(tags);
    var type      = getType(tags);

    var productUrl = STORE_URL + '/products/' + handle;
    var cartUrl    = STORE_URL + '/cart/' + variantId + ':1';

    var name = String(title).split('|')[0].trim();
    for (var ci = 0; ci < 5; ci++) {
      name = name.replace(/[\s\-–—]*\b(Collector|Patch|Keychain|Magnet|Replica)\b\s*$/i, '').trim();
    }
    if (!name) name = String(title).split('|')[0].trim() || String(title);
    var priceNum = parseFloat(price).toFixed(2);

    var card = document.createElement('div');
    card.className = 'product-card card anim';
    card.setAttribute('data-category', category);
    card.setAttribute('data-type',     type);
    card.setAttribute('data-state',    '');

    var badgeHtml = inStock ? '' : '<span class="card__badge">Sold out</span>';
    var imgHtml   = image
      ? '<img src="' + escapeAttr(image) + '" alt="' + escapeAttr(name) + '" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" onerror="this.style.display=\'none\'">'
      : '<div class="no-image">No Image</div>';

    card.innerHTML =
      '<a href="' + escapeAttr(productUrl) + '" target="_blank" rel="noopener" class="card__media">' + imgHtml + badgeHtml + '</a>' +
      '<div class="card__body">' +
        '<span class="card__cat">MicroKeychain</span>' +
        '<h3 class="card__title product-title">' +
          '<a href="' + escapeAttr(productUrl) + '" target="_blank" rel="noopener" style="color:inherit;">' +
            escapeHtml(name) +
          '</a>' +
        '</h3>' +
        '<p class="card__desc">Premium UV ink. Raised texture you can see and feel.</p>' +
        '<div class="card__foot">' +
          '<span class="card__price"><span class="cur">$</span>' + escapeHtml(priceNum) + '</span>' +
          (inStock
            ? '<a href="' + escapeAttr(cartUrl) + '" target="_blank" rel="noopener" class="card__add add-to-cart-btn"><span class="label">Add</span> +</a>'
            : '<span class="card__add out-of-stock-btn" aria-disabled="true">Sold out</span>') +
        '</div>' +
      '</div>';

    return card;
  }

  function renderGrid(products) {
    var grid = document.querySelector('.product-grid.homepage-product-grid') ||
               document.querySelector('.product-grid') ||
               document.querySelector('#product-grid') ||
               document.querySelector('.homepage-product-grid');

    if (!grid) {
      console.warn('[MicroPatches] Could not find product grid container.');
      return;
    }

    var display = products.filter(function (p) {
      return !(/^TEST\s*[\u2014\u2013-]/i.test(p.title || ''));
    });

    grid.innerHTML = '';
    var fragment = document.createDocumentFragment();
    for (var i = 0; i < display.length; i++) {
      fragment.appendChild(buildCard(display[i]));
    }
    grid.appendChild(fragment);

    console.log('[MicroPatches] Loaded ' + display.length + ' live products from Shopify.');
    setupFilters();
  }

  function fetchAllProducts(onDone) {
    var all  = [];
    var page = 1;

    function next() {
      fetch(STORE_URL + '/products.json?limit=250&page=' + page)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var batch = data.products || [];
          all = all.concat(batch);
          if (batch.length === 250) {
            page++;
            next();
          } else {
            onDone(all);
          }
        })
        .catch(function (err) {
          console.error('[MicroPatches] Product fetch failed:', err);
          onDone(all);
        });
    }

    next();
  }

  function setupFilters() {
    var activeTab  = 'all';
    var activeType = 'all';
    var searchTerm = '';

    function applyFilters() {
      var cards   = document.querySelectorAll('.product-card');
      var visible = 0;
      for (var i = 0; i < cards.length; i++) {
        var cat     = cards[i].getAttribute('data-category') || '';
        var type    = cards[i].getAttribute('data-type')     || '';
        var titleEl = cards[i].querySelector('.product-title');
        var title   = titleEl ? titleEl.textContent : '';

        var tabMatch    = activeTab  === 'all' || cat  === activeTab;
        var typeMatch   = activeType === 'all' || type === activeType;
        var searchMatch = searchTerm === ''    || title.toLowerCase().indexOf(searchTerm) !== -1;

        var show = tabMatch && typeMatch && searchMatch;
        cards[i].style.display = show ? '' : 'none';
        if (show) visible++;
      }
      var countEl = document.querySelector('.product-count, #product-count, .results-count');
      if (countEl) countEl.textContent = visible + ' product' + (visible === 1 ? '' : 's');
    }

    var tabBtns = document.querySelectorAll('[data-tab]');
    for (var t = 0; t < tabBtns.length; t++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          activeTab  = btn.getAttribute('data-tab') || 'all';
          activeType = 'all';
          for (var j = 0; j < tabBtns.length; j++) {
            tabBtns[j].classList.toggle('active', tabBtns[j] === btn);
          }
          document.querySelectorAll('[data-shop-filter]').forEach(function (b) {
            b.classList.remove('active');
          });
          applyFilters();
        });
      })(tabBtns[t]);
    }

    var filterBtns = document.querySelectorAll('[data-shop-filter]');
    for (var f = 0; f < filterBtns.length; f++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var val = btn.getAttribute('data-filter-value') || 'all';
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

    var searchInput = document.querySelector('input[type="search"], .shop-search-input, #product-search, .search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        searchTerm = (searchInput.value || '').trim().toLowerCase();
        applyFilters();
      });
    }

    applyFilters();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function escapeAttr(str) { return String(str).replace(/"/g, '&quot;'); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { fetchAllProducts(renderGrid); });
  } else {
    fetchAllProducts(renderGrid);
  }

})();
