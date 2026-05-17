// Shopify store configuration
// site.js reads window.SHOPIFY for cart/checkout routing.
const SHOP_DOMAIN = 'micropatches.myshopify.com';

// Back-compat: some inline scripts read the bare domain.
window.SHOP_DOMAIN = SHOP_DOMAIN;

window.SHOPIFY = {
  SHOP_DOMAIN: SHOP_DOMAIN,

  // Direct product page on the Shopify store.
  productUrl: function (handle) {
    return 'https://' + SHOP_DOMAIN + '/products/' + encodeURIComponent(handle);
  },

  // Synchronous permalink — only when every line item already has a variant ID.
  cartUrl: function (cart) {
    if (!Array.isArray(cart) || cart.length === 0) return null;
    var parts = [];
    for (var i = 0; i < cart.length; i++) {
      var item = cart[i];
      if (!item.variantId) return null;
      parts.push(item.variantId + ':' + (item.qty || 1));
    }
    return 'https://' + SHOP_DOMAIN + '/cart/' + parts.join(',');
  },

  // Loads the live Shopify catalog once and caches a handle -> variant map.
  loadCatalog: function () {
    if (window.SHOPIFY._catalogP) return window.SHOPIFY._catalogP;
    window.SHOPIFY._catalogP = new Promise(function (resolve) {
      var map = {};
      function page(n) {
        fetch('https://' + SHOP_DOMAIN + '/products.json?limit=250&page=' + n)
          .then(function (r) { return r.ok ? r.json() : { products: [] }; })
          .then(function (d) {
            var arr = (d && d.products) || [];
            arr.forEach(function (pr) {
              var v = (pr.variants && pr.variants[0]) || {};
              if (pr.handle && v.id) {
                map[pr.handle] = { variantId: v.id, price: v.price, available: v.available };
              }
            });
            if (arr.length === 250) page(n + 1);
            else resolve(map);
          })
          .catch(function () { resolve(map); });
      }
      page(1);
    });
    return window.SHOPIFY._catalogP;
  },

  // Resolves variant IDs (from the cart or the live catalog by handle) and
  // returns a Promise of a single Shopify cart permalink for the WHOLE cart.
  buildCheckoutUrl: function (cart) {
    if (!Array.isArray(cart) || cart.length === 0) return Promise.resolve(null);
    return window.SHOPIFY.loadCatalog().then(function (map) {
      var parts = [];
      for (var i = 0; i < cart.length; i++) {
        var it = cart[i];
        var vid = it.variantId || (map[it.handle] && map[it.handle].variantId);
        if (!vid) return null;
        parts.push(vid + ':' + (it.qty || 1));
      }
      return 'https://' + SHOP_DOMAIN + '/cart/' + parts.join(',');
    });
  }
};
