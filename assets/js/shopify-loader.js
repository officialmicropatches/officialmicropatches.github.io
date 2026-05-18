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

  /**
   * Category / type are derived from the (standardized) product TITLE, not
   * from Shopify tags. The catalog uses titles like
   *   "Chandler Police Department, Arizona - MicroKeychain"
   *   "82nd Airborne Division, U.S. Army - MicroKeychain"
   *   "U.S. Border Patrol, Federal Agency - MicroKeychain"
   *   "American Medical Response, EMS - EMT MicroKeychain"
   * so every product (including brand-new ones) classifies correctly with no
   * tag maintenance required.
   */
  function lc(s) { return String(s || '').toLowerCase(); }

  function getCategory(title) {
    var t = lc(title);
    if (t.indexOf('pink patch') !== -1) return 'pink-patch';
    if (/, ems -|\bems\b|\bemt\b|paramedic|\bcct[\s-]?rn\b|emergency medical|ambulance/.test(t)) return 'ems';
    if (/, u\.s\. (army|navy|marine|air force|space force|military)|airborne|ranger regiment|army ranger|mountain division|\bbattalion\b|\binfantry\b|\bpir\b|naval construction|seabee|\bmarines\b|air force|space force/.test(t)) return 'military';
    if (/fire department|fire dept|firefighter|\bfire\b/.test(t)) return 'fire';
    if (/department of corrections|correctional|corrections|detention|\bscore\b/.test(t)) return 'corrections';
    return 'law-enforcement';
  }

  function getType(title, category) {
    var t = lc(title);
    if (category === 'military') {
      if (/marine/.test(t)) return 'marines';
      if (/navy|naval|seabee/.test(t)) return 'navy';
      if (/air force/.test(t)) return 'air-force';
      if (/space force/.test(t)) return 'space-force';
      return 'army';
    }
    // Corrections is a single bucket — no Officers/Detention split.
    // Only the State filter narrows it.
    if (category === 'corrections') return '';
    if (category === 'fire') return 'department';
    if (category === 'ems') {
      if (/paramedic/.test(t)) return 'paramedic';
      if (/cct[\s-]?rn/.test(t)) return 'cct-rn';
      if (/\bemt\b/.test(t)) return 'emt';
      return '';
    }
    if (category === 'law-enforcement') {
      if (/, federal agency -|border patrol|\bice\b|\bfbi\b|\bdea\b|\batf\b|\bcbp\b|marshal|customs|secret service|homeland/.test(t)) return 'federal';
      if (/university/.test(t)) return 'university';
      if (/indian police|tribal|gila river/.test(t)) return 'tribal';
      if (/highway patrol|department of public safety|public safety|state trooper|state police|\bdps\b|\brangers\b/.test(t)) return 'state';
      if (/sheriff|constable/.test(t)) return 'sheriff';
      return 'police';
    }
    return '';
  }

  function getStateFromTags(tags) {
    for (var i = 0; i < tags.length; i++) {
      var m = String(tags[i]).match(/^state:\s*([A-Za-z]{2})$/);
      if (m) return m[1].toUpperCase();
    }
    return '';
  }

  var STATE_MAP = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
    'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
    'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
    'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
    'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN',
    'mississippi': 'MS', 'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE',
    'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
    'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC',
    'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK', 'oregon': 'OR',
    'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
    'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
    'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA',
    'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
  };
  // Longest names first so "west virginia" wins over "virginia", etc.
  var STATE_NAMES = Object.keys(STATE_MAP).sort(function (a, b) {
    return b.length - a.length;
  });

  function getState(title) {
    var t = ' ' + String(title || '').toLowerCase().replace(/[^a-z\s]/g, ' ')
      .replace(/\s+/g, ' ') + ' ';
    for (var i = 0; i < STATE_NAMES.length; i++) {
      if (t.indexOf(' ' + STATE_NAMES[i] + ' ') !== -1) return STATE_MAP[STATE_NAMES[i]];
    }
    // Standalone USPS code, e.g. "Killeen TX PD".
    var m = String(title || '').match(/\b([A-Z]{2})\b/);
    if (m) {
      for (var k in STATE_MAP) { if (STATE_MAP[k] === m[1]) return m[1]; }
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
    var images    = (product.images || []).map(function (im) { return im && im.src; }).filter(Boolean);
    var image     = images[0] || null;
    var category  = getCategory(title);
    var type      = getType(title, category);
    var state     = getStateFromTags(tags) || getState(title);

    var productUrl = 'product.html?handle=' + encodeURIComponent(handle);

    var name = String(title).split('|')[0].trim();
    for (var ci = 0; ci < 6; ci++) {
      name = name.replace(/[\s\-–—]*\b(Collector|Patch|Keychain|Magnet|Pin|Charm|Replica|3D Printed|45mm)\b\s*$/i, '').trim();
    }
    if (!name) name = String(title).split('|')[0].trim() || String(title);
    var priceNum = parseFloat(price).toFixed(2);

    var card = document.createElement('div');
    card.className = 'product-card pcard anim';
    card.setAttribute('data-category', category);
    card.setAttribute('data-type',     type);
    card.setAttribute('data-state',    state);

    var badgeHtml = inStock
      ? '<span class="pcard__rts">Ready To Ship</span>'
      : '<span class="pcard__rts" style="background:var(--line-2);color:var(--ink-dim);">Sold Out</span>';

    card.innerHTML =
      '<a href="' + escapeAttr(productUrl) + '" class="pcard__media" aria-label="' + escapeAttr(name) + '">' + badgeHtml + '</a>' +
      '<div class="pcard__body">' +
        '<h3 class="pcard__title product-title">' +
          '<a href="' + escapeAttr(productUrl) + '">' + escapeHtml(name) + '</a>' +
        '</h3>' +
        '<div class="pcard__foot">' +
          '<span class="pcard__price"><span class="cur">$</span>' + escapeHtml(priceNum) + '</span>' +
          (inStock
            ? '<button type="button" class="pcard__add add-to-cart-btn" data-add-to-cart' +
                ' data-id="' + escapeAttr(handle) + '"' +
                ' data-handle="' + escapeAttr(handle) + '"' +
                ' data-name="' + escapeAttr(name) + '"' +
                ' data-price="' + escapeAttr(priceNum) + '"' +
                ' data-variant-id="' + escapeAttr(variantId || '') + '"' +
                ' data-image="' + escapeAttr(image || '') + '"' +
                ' data-cat="MicroKeychain"><span class="label">Add</span> +</button>'
            : '<span class="pcard__add out-of-stock-btn" aria-disabled="true" style="background:var(--line-2);color:var(--ink-dim);">Sold Out</span>') +
        '</div>' +
      '</div>';

    var media = card.querySelector('.pcard__media');
    if (image) {
      var img = document.createElement('img');
      img.className = 'pcard__img';
      img.src = image; img.alt = name;
      img.loading = 'lazy'; img.decoding = 'async';
      media.appendChild(img);
    } else {
      var ph = document.createElement('span');
      ph.className = 'pcard__ph';
      ph.innerHTML = '<span class="pcard__ph-mark">M</span>' +
                     '<span class="pcard__ph-txt">Photo Coming Soon</span>';
      media.appendChild(ph);
    }

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
    var activeTab   = 'all';
    var activeType  = 'all';
    var activeState = 'all';
    var searchTerm  = '';

    function applyFilters() {
      var cards   = document.querySelectorAll('.product-card');
      var visible = 0;
      for (var i = 0; i < cards.length; i++) {
        var cat     = cards[i].getAttribute('data-category') || '';
        var type    = cards[i].getAttribute('data-type')     || '';
        var state   = cards[i].getAttribute('data-state')    || '';
        var titleEl = cards[i].querySelector('.product-title');
        var title   = titleEl ? titleEl.textContent : '';

        var tabMatch    = activeTab   === 'all' || cat  === activeTab;
        var typeMatch   = activeType  === 'all' || type === activeType;
        var stateMatch  = activeState === 'all' || state === activeState;
        var searchMatch = searchTerm  === ''    || title.toLowerCase().indexOf(searchTerm) !== -1;

        var show = tabMatch && typeMatch && stateMatch && searchMatch;
        cards[i].style.display = show ? '' : 'none';
        if (show) visible++;
      }
      var countEl = document.querySelector('.product-count, #product-count, .results-count');
      if (countEl) countEl.textContent = visible + ' product' + (visible === 1 ? '' : 's');
    }

    var stateSelects = document.querySelectorAll('select[data-shop-filter="state"]');
    function syncStateSelects(val) {
      stateSelects.forEach(function (s) { s.value = val; });
    }
    stateSelects.forEach(function (sel) {
      sel.addEventListener('change', function () {
        activeState = sel.value || 'all';
        syncStateSelects(activeState);
        applyFilters();
      });
    });

    var tabBtns = document.querySelectorAll('[data-tab]');
    for (var t = 0; t < tabBtns.length; t++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          activeTab   = btn.getAttribute('data-tab') || 'all';
          activeType  = 'all';
          activeState = 'all';
          syncStateSelects('all');
          for (var j = 0; j < tabBtns.length; j++) {
            tabBtns[j].classList.toggle('active', tabBtns[j] === btn);
          }
          document.querySelectorAll('button[data-shop-filter]').forEach(function (b) {
            b.classList.remove('active');
          });
          applyFilters();
        });
      })(tabBtns[t]);
    }

    var filterBtns = document.querySelectorAll('button[data-shop-filter]');
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
