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

  // One-click cart permalink — only usable when every line item has a
  // numeric Shopify variant ID. Variant IDs are not linked yet, so this
  // returns null and checkout falls back to the product page.
  cartUrl: function (cart) {
    if (!Array.isArray(cart) || cart.length === 0) return null;
    var parts = [];
    for (var i = 0; i < cart.length; i++) {
      var item = cart[i];
      if (!item.variantId) return null;
      parts.push(item.variantId + ':' + (item.qty || 1));
    }
    return 'https://' + SHOP_DOMAIN + '/cart/' + parts.join(',');
  }
};
