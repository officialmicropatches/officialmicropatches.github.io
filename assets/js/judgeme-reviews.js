/**
 * judgeme-reviews.js
 * MicroPatches — Judge.me review widgets for a non-Liquid static site.
 *
 * This site is NOT the Shopify theme, so Judge.me's usual Liquid snippets
 * can't be used. Instead this module calls Judge.me's public Reviews API
 * directly from the browser and renders review markup styled to match
 * assets/css/style.css (the .pcard / .msection / --accent design system).
 *
 * SETUP (one-time):
 *   1. Shopify Admin -> Apps -> Judge.me -> Settings -> Integrations -> Developers
 *   2. Copy the "Public token" (safe for client-side use; read-only).
 *   3. Paste it below as PUBLIC_TOKEN. Until then, every page falls back to
 *      the static Etsy reviews in reviews.json (store-wide, not per-product).
 *
 * Until Judge.me has published reviews for a given product, its badges and
 * blocks stay hidden rather than showing misleading store-wide numbers.
 */

window.MPReviews = (function () {
  'use strict';

  var PUBLIC_TOKEN = ''; // <-- paste your Judge.me Public token here

  var cfg = {
    shopDomain: (window.SHOPIFY && window.SHOPIFY.SHOP_DOMAIN) || 'y1aqhh-dq.myshopify.com',
    publicToken: PUBLIC_TOKEN
  };

  var fetchCache = {};
  var etsyPromise = null;

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function formatDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  }

  function starsHtml(rating, size) {
    var r = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    var cls = 'jm-stars' + (size ? ' jm-stars--' + size : '');
    return '<span class="' + cls + '" aria-label="' + r + ' out of 5 stars">' +
      '★★★★★'.slice(0, r) + '☆☆☆☆☆'.slice(0, 5 - r) +
    '</span>';
  }

  function average(list) {
    if (!list.length) return 0;
    var sum = 0;
    for (var i = 0; i < list.length; i++) sum += list[i].rating;
    return sum / list.length;
  }

  function normalizeReview(r) {
    var reviewer = r.reviewer || {};
    return {
      rating: Number(r.rating) || 0,
      title: r.title || '',
      body: r.body || r.content || '',
      name: reviewer.name || reviewer.display_name || 'Verified buyer',
      date: r.created_at || r.updated_at || '',
      verified: !!(r.verified || r.reviewer_verified || r.verified_buyer || r.verified_reviewer)
    };
  }

  // Sends both product_handle and external_id (Shopify numeric product id)
  // since either may be the field Judge.me's API keys reviews on; unused
  // params are ignored server-side, and every caller degrades to the
  // Etsy/hidden fallback on an empty or failed response either way.
  function fetchJudgeMe(params) {
    if (!cfg.publicToken) return Promise.resolve(null);
    var qs = [];
    var all = Object.assign({ shop_domain: cfg.shopDomain, api_token: cfg.publicToken }, params);
    for (var k in all) {
      if (all[k] === '' || all[k] == null) continue;
      qs.push(encodeURIComponent(k) + '=' + encodeURIComponent(all[k]));
    }
    var url = 'https://judge.me/api/v1/reviews?' + qs.join('&');
    if (!fetchCache[url]) {
      fetchCache[url] = fetch(url, { mode: 'cors' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) { return (data && Array.isArray(data.reviews)) ? data.reviews.map(normalizeReview) : null; })
        .catch(function () { return null; });
    }
    return fetchCache[url];
  }

  function fetchEtsy() {
    if (!etsyPromise) {
      etsyPromise = fetch('reviews.json', { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; });
    }
    return etsyPromise;
  }

  function reviewCardHtml(r) {
    return (
      '<figure class="jm-review-card">' +
        '<div class="jm-review-card__head">' +
          starsHtml(r.rating, 'sm') +
          (r.verified ? '<span class="tag jm-verified">Verified Buyer</span>' : '') +
        '</div>' +
        (r.title ? '<h4 class="jm-review-card__title">' + escapeHtml(r.title) + '</h4>' : '') +
        '<blockquote>“' + escapeHtml(r.body) + '”</blockquote>' +
        '<figcaption>— ' + escapeHtml(r.name) + (r.date ? ' · ' + formatDate(r.date) : '') + '</figcaption>' +
      '</figure>'
    );
  }

  function summaryHtml(overall, total, metaText) {
    return (
      '<div class="jm-summary">' +
        starsHtml(overall, 'lg') +
        '<strong class="jm-summary__num">' + overall.toFixed(1) + '</strong>' +
        '<span class="jm-summary__meta">' + escapeHtml(metaText) + '</span>' +
      '</div>'
    );
  }

  // ---- Product page block (#pdp-reviews) ----
  function renderProductBlock(el, opts) {
    if (!el) return Promise.resolve(null);
    opts = opts || {};
    return fetchJudgeMe({
      per_page: 10, page: 1,
      product_handle: opts.handle || '',
      external_id: opts.productId || ''
    }).then(function (list) {
      list = (list || []).filter(function (r) { return r.rating > 0; });
      if (list.length) {
        var overall = average(list);
        el.innerHTML =
          '<div class="jm-block">' +
            summaryHtml(overall, list.length, list.length + ' review' + (list.length === 1 ? '' : 's') + ' · Verified by Judge.me') +
            list.slice(0, 5).map(reviewCardHtml).join('') +
          '</div>';
        return { overall: overall, total: list.length, source: 'judgeme', reviews: list.slice(0, 5) };
      }
      return renderEtsyFallback(el);
    });
  }

  function renderEtsyFallback(el) {
    return fetchEtsy().then(function (rv) {
      if (!rv) { if (el) el.innerHTML = ''; return null; }
      var overall = Number(rv.overall) || 5;
      var total = Number(rv.total) || (rv.reviews || []).length;
      var list = (rv.reviews || []).filter(function (r) { return r && r.quote; }).slice(0, 5)
        .map(function (r) { return { rating: r.stars || 5, title: '', body: r.quote, name: r.name || 'Verified buyer', date: '', verified: false }; });
      if (el && list.length) {
        el.innerHTML =
          '<div class="jm-block jm-block--etsy">' +
            summaryHtml(overall, total, total + ' reviews · ' + (rv.platform || 'Verified')) +
            list.map(reviewCardHtml).join('') +
          '</div>';
      }
      return { overall: overall, total: total, source: 'etsy', reviews: list };
    });
  }

  // ---- Shop grid badges ([data-jm-rating]) ----
  function hydrateBadges(root) {
    var els = (root || document).querySelectorAll('[data-jm-rating]');
    var queue = Array.prototype.slice.call(els);
    var CONCURRENCY = 5;

    function runOne() {
      var el = queue.shift();
      if (!el) return;
      fetchJudgeMe({
        per_page: 5, page: 1,
        product_handle: el.getAttribute('data-handle') || '',
        external_id: el.getAttribute('data-product-id') || ''
      }).then(function (list) {
        list = (list || []).filter(function (r) { return r.rating > 0; });
        if (list.length) {
          var overall = average(list);
          el.innerHTML = starsHtml(overall, 'xs') +
            '<span class="pcard__rating-num">' + overall.toFixed(1) + '</span>' +
            '<span class="pcard__rating-count">(' + list.length + ')</span>';
        } else {
          el.remove();
        }
      }).catch(function () { el.remove(); })
        .then(runOne);
    }

    if (!cfg.publicToken) { els.forEach(function (el) { el.remove(); }); return; }
    for (var i = 0; i < Math.min(CONCURRENCY, queue.length); i++) runOne();
  }

  // ---- Homepage store-wide badge ----
  function renderStoreBadge(el) {
    if (!el) return;
    fetchJudgeMe({ per_page: 30, page: 1 }).then(function (list) {
      list = (list || []).filter(function (r) { return r.rating > 0; });
      if (list.length) {
        var overall = average(list);
        el.innerHTML = summaryHtml(overall, list.length, 'from ' + list.length + ' reviews');
        el.hidden = false;
        return;
      }
      fetchEtsy().then(function (rv) {
        if (!rv) { el.hidden = true; return; }
        var overall = Number(rv.overall) || 5;
        var total = Number(rv.total) || (rv.reviews || []).length;
        el.innerHTML = summaryHtml(overall, total, 'from ' + total + ' reviews · ' + (rv.platform || 'Verified'));
        el.hidden = false;
      });
    });
  }

  // ---- Homepage testimonial carousel ----
  function renderTestimonials(el) {
    if (!el) return;
    fetchJudgeMe({ per_page: 20, page: 1 }).then(function (list) {
      list = (list || []).filter(function (r) { return r.rating >= 4 && r.body; });
      if (list.length) {
        el.innerHTML = list.slice(0, 8).map(reviewCardHtml).join('');
        el.hidden = false;
        return;
      }
      fetchEtsy().then(function (rv) {
        if (!rv) { el.hidden = true; return; }
        var list2 = (rv.reviews || []).filter(function (r) { return r && r.quote; })
          .map(function (r) { return { rating: r.stars || 5, title: '', body: r.quote, name: r.name || 'Verified buyer', date: '', verified: false }; });
        if (!list2.length) { el.hidden = true; return; }
        el.innerHTML = list2.map(reviewCardHtml).join('');
        el.hidden = false;
      });
    });
  }

  return {
    config: cfg,
    starsHtml: starsHtml,
    renderProductBlock: renderProductBlock,
    hydrateBadges: hydrateBadges,
    renderStoreBadge: renderStoreBadge,
    renderTestimonials: renderTestimonials
  };
})();
