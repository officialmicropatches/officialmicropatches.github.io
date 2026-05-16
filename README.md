# MicroPatches — officialmicropatches.com

Design / copy / brand updates from the design Claude session. **This bundle does NOT contain Shopify-integration files** because those already exist on your live site (built by Claude Code) — overwriting them would break ecommerce.

## What's in this bundle (safe to extract over your repo)

```
index.html             ← gold accent, "Your patch, scaled down", singular product names, cart re-enabled
about.html             ← same copy + brand updates
faq.html               ← product-type answers updated (MicroKeychain / MicroMagnet / MicroPin / MicroCharm)
product.html           ← updated spec list (Design / Base), description copy
contact.html           ← unchanged structurally, included for consistency
shipping.html / refunds.html / privacy.html / terms.html  ← legal pages
launch-checklist.html  ← now reflects current live state (Shopify Forms ✓, Firebase ✓)
sitemap.xml / robots.txt / CNAME
listings.json          ← keep as fallback for home featured grid
assets/css/style.css                  ← gold accent, dark theme tokens, premium type system
assets/css/shopify-forms-theme.css   ← ⭐ NEW — styles the Shopify Forms embed
assets/js/site.js                    ← header/footer/cart, mobile menu, multi-item Shopify checkout
assets/js/image-slot.js
internal/inventory.html              ← internal-only review tool
```

## What's NOT in this bundle (KEEP your live versions — backend agent owns these)

```
custom.html                  ← Shopify Forms #992535 embed + Firebase upload
shop.html                    ← uses shopify-loader.js (live Shopify product feed)
assets/js/shopify-config.js  ← sets window.SHOP_DOMAIN
assets/js/shopify-loader.js  ← live product sync v3.0
assets/js/firebase.js        ← Firebase SDK init
assets/js/main.js            ← original site JS
assets/js/shopify-products-data.js  ← deprecated snapshot, safe to ignore
```

## How to merge into your repo

```bash
cd path/to/officialmicropatches.github.io
unzip /path/to/deploy.zip            # extract — it will NOT touch protected files
git status                            # review
git diff
git add -A
git commit -m "Design: gold accent, product-name finalize, premium copy, cart re-enable, forms theme"
git push                              # GitHub Pages auto-deploys in ~1 min
```

## To activate the Shopify Forms theme

The new `shopify-forms-theme.css` is standalone and tries every known Shopify Forms hook (Shadow-DOM `::part()` AND light-DOM fallbacks). It also auto-hides the "Reference Image URL" field, which Claude Code's MutationObserver does — having both is fine, the CSS just makes the page render correctly before the JS runs.

**Add ONE line** to the `<head>` of your live `custom.html` (this is a minimal addition, not an overwrite of the file):

```html
<link rel="stylesheet" href="assets/css/shopify-forms-theme.css" />
```

After deploy, inspect the form on the live site. If parts of the form don't pick up the theme, it's because Shopify is using selectors my stylesheet doesn't target — open browser devtools, identify the element/attribute, send me the snippet, I'll add the matching rule.

## After deploy — final QA checklist

1. **Home** loads, gold accent visible, hero copy reads "Your patch. Now micro.", featured grid populates from Shopify
2. **Shop** — ~118 products load from live Shopify, cards link to real product pages
3. **Custom** — form themed (dark, gold accent), reference image URL field hidden, file upload works, submit creates Shopify customer record
4. **PDP** — `product.html?handle=...` loads correctly, "Add to Cart" or "Buy on Shopify" works
5. **Cart drawer** — opens, multi-item cart deep-links a real Shopify checkout
6. **Mobile** — hamburger menu opens, no horizontal scroll, all tap targets ≥ 44px
7. **Legal pages** — all four open and link in the footer

## Brand language quick reference (sitewide)

- **Product description:** "Premium UV ink. Raised texture you can see and feel." (short) · "UV-cured ink on a 3D-printed base" (technical, when relevant)
- **Catalog headline:** *MicroKeychains. Your patch, scaled down.*
- **Custom product types** (singular, this order): MicroKeychain, MicroMagnet, MicroPin, MicroCharm
- **Currently in catalog:** MicroKeychain only. Others are custom-only.
- **Brand phrases:** *Your Patch. Now Micro.* · *Carry Your Patch. Anywhere.* · *Made in Phoenix, Arizona.* · *USA Made.* · *Active Law Enforcement Owned.*
- **Color accent:** Gold (`--accent: #d9a441`). Pink reserved for Pink Patch Project blocks only.
