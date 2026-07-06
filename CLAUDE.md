# CLAUDE.md — MicroPatches Codebase Guide

Full working analysis of this repository for AI agents (Claude, Codex, etc.).
Read this before making changes. It documents architecture, gotchas, and
conventions discovered through a complete site audit.

---

## 0. ⚠️ HOSTING CHANGED (verified 2026-07-06): the live site is Shopify, NOT this repo

`officialmicropatches.com` is now the **primary domain of the Shopify store**
(`micropatches.myshopify.com`). What buyers see at that domain is the Shopify
**theme**, not the HTML in this repository. Editing files here does NOT change
the live site.

- Live homepage sections (hero, "Shop by Category" tiles, reviews, etc.) are
  `custom-liquid` sections in the theme's `templates/index.json`; the category
  tiles render `snippets/mp-category-tiles.liquid` and each tile links to a
  Shopify **collection** (`/collections/<handle>`).
- Theme-file writes to the **published** theme are blocked for agents: duplicate
  the live theme via the Admin API (`themeDuplicate`), edit the draft with
  `themeFilesUpsert`, and have the merchant publish it from Shopify admin
  (Online Store → Themes).
- The sections below describe this repo's static site, which the domain no
  longer serves. Treat them as history/reference until the repo's role is
  re-decided (it may return as a landing page or be retired).

## 1. What this is

- **Static marketing + storefront site** for *MicroPatches* (3D-printed,
  UV-cured-ink miniature patch **keychains**). Phoenix, AZ. Active law
  enforcement owned.
- **Plain HTML/CSS/JS. No build system, no framework, no package.json.**
  Files are edited and served as-is.
- **Hosting:** GitHub Pages, repo `officialmicropatches/officialmicropatches.github.io`.
- **Custom domain:** `officialmicropatches.com` (see `CNAME`). All canonical
  URLs / og:url must use `officialmicropatches.com`, NOT the github.io domain.
- **Commerce backend:** Shopify store `micropatches.myshopify.com`. Checkout
  is performed on Shopify via cart permalinks; this site only hosts a local
  preview cart and routes to Shopify.

## 2. CRITICAL gotcha: cache-busting

GitHub Pages + browser caching aggressively serve stale CSS/JS. **Every
reference to a local CSS/JS asset uses a `?v=YYYYMMDD` query string.** When
you change `assets/css/style.css` or any `assets/js/*.js`, you MUST bump the
version on *every* HTML page that references it, or users will not see the
change (this caused several "it's still broken" cycles).

Pattern to bump (run from repo root, pick a new date):
```
for f in $(grep -rl 'assets/js/site\.js' *.html); do
  sed -i -E 's#(assets/js/site\.js)(\?v=[0-9]+)?#\1?v=20260525#g' "$f"; done
```
Keep the version identical across all pages for a given file. Files that
were historically unversioned (caused stale-bug reports): `shopify-loader.js`,
`shopify-config.js`, `audit-fixes.js` — always version them now.

## 3. Repo layout

```
/*.html                 public pages (see Page Inventory)
/internal/*.html        internal/admin pages
CNAME                   officialmicropatches.com
sitemap.xml             keep in sync with real public pages (10 entries)
robots.txt, favicon.svg
listings.json           static product fallback (NO variant IDs)
reviews.json
assets/css/
  style.css             PRIMARY stylesheet (~1500 lines, the new design system)
  audit-fixes.css       small runtime/layout patches
  hero-carousel.css     homepage hero carousel
  shopify-forms-theme.css
assets/js/
  site.js               shared chrome (header/footer/cart drawer) + local cart + checkout
  shopify-config.js     window.SHOPIFY: domain, productUrl, cartUrl, loadCatalog, buildCheckoutUrl
  shopify-loader.js     shop.html catalog: fetches Shopify products.json, builds cards, filters
  main.js               legacy multi-purpose module (still used on some pages; a competing renderer)
  main-original.js      DEAD. not referenced. ignore/delete.
  firebase.js           product-card hover styles + custom-order photo helpers
  hero-carousel.js      homepage hero carousel
  image-slot.js         <image-slot> custom element placeholder
  audit-fixes.js        RUNTIME BAND-AID layer (see §7)
assets/img/
```

## 4. Two design systems (important)

The site mixes two CSS systems. Know which a page uses before styling:

- **NEW (BEM-ish, canonical):** `.container`, `.section`, `.hero__*`,
  `.card`, `.card__media/__body/__title/__cat/__desc/__foot/__price/__add`,
  `.products`, `.btn--primary/--ghost/--lg/--sm`, `.eyebrow`, `.tag`.
  Defined in `style.css`. Used by: index, about, faq, contact, product,
  and now shop cards.
- **OLD (kebab, partially unstyled):** `.product-card`, `.product-info`,
  `.product-title`, `.btn-gold`, `.nav-logo`, `.faq-accordion`,
  `.custom-pricing-summary`, `.cart-drawer/.cart-items` (bespoke),
  `.exchange-*`, `.coin-*`, `.admin-*`, `.steps-grid`. Many of these have
  **no CSS at all** and render as raw HTML.

**Recurring class of bug:** HTML uses class names that have zero CSS rule →
section renders unstyled. Always grep the class in `assets/css/*.css` before
assuming it's styled. This bit the shop filter, the custom-order form, and
the now-dropped pages.

`shop.html`'s catalog cards are produced by JS (`shopify-loader.js
buildCard()`), which now emits the **NEW** `.card` structure while keeping
`.product-card` + `data-category/data-type` for filter JS hooks.

## 5. Shared chrome injection (site.js)

`site.js` is loaded on most pages and:
- Injects the header into `<div data-site-header></div>` (`renderHeader`),
  footer into `<div data-site-footer></div>`, and the cart drawer into
  `<div data-cart-drawer-mount></div>` (`renderCartDrawer`).
- `NAV_ITEMS` (in site.js) defines the primary nav: home, shop, custom,
  about, faq, contact. Active link comes from `<body data-page="...">` —
  keep `data-page` set correctly per page (empty value breaks highlight).
- Mobile nav is a fixed overlay drawer that locks body scroll
  (`body.nav-open`), closes on link/backdrop/Escape/scroll.
- Owns the local cart (`localStorage` key `mp_cart_v2`) and `checkout()`.
- Exposes `window.MP = { addToCart, removeFromCart, openCart, closeCart,
  toast, checkout }`.

Pages that hand-roll their own header/footer/cart instead of using these
mounts are the legacy/broken ones.

## 6. Cart & checkout flow (current, post-fix)

Single unified flow — do not reintroduce per-page carts:

1. Any "add" control is `[data-add-to-cart]` with `data-id, data-handle,
   data-name, data-price, data-variant-id (optional), data-image, data-cat`.
2. `site.js` delegates clicks → `addToCart()` → localStorage cart. (There is
   NO "bounce to Shopify if no variant ID" anymore — that was the main bug.)
3. `checkout()` calls `window.SHOPIFY.buildCheckoutUrl(cart)`:
   - `loadCatalog()` fetches `https://micropatches.myshopify.com/products.json?limit=250&page=N`
     (paginated, cached) → map of `handle → {variantId, price, available}`.
   - Resolves each cart item's variant ID (from the item or by handle) and
     returns ONE Shopify cart permalink `…/cart/<vid>:<qty>,<vid>:<qty>`.
   - Redirects there → real multi-item Shopify checkout.
   - Fallback: open the first item's Shopify product page.

`shopify-config.js` also still exposes `productUrl(handle)` and a synchronous
`cartUrl(cart)` (only works if every item already has a variant ID).

**Data gap:** `listings.json` and the homepage snapshot have no variant IDs.
That's fine now — variants resolve from the live catalog at checkout.

## 7. audit-fixes.js — the band-aid layer (handle with care)

Loaded on every page (`defer`). It mutates the DOM at runtime:
- Rewrites canonical/og links github.io → .com (source is now also fixed;
  this is redundant but harmless).
- Adds `is-scrolled` class to header on scroll.
- On `custom.html` ONLY: hides the legacy Shopify-form widgets and
  **injects a replacement custom-order form** (`.patch-form-wrap`) after the
  "Send Your Request" heading. Submits via Zapier webhook **or** falls back
  to `mailto:` (the webhook URL is the placeholder
  `REPLACE_ME_AFTER_ZAPIER_SETUP` — real submissions are not wired yet).
- Removes duplicate `<footer>` if more than one exists.

Known pitfall (fixed): its orphan-`input[type=file]` cleanup used to hide the
file input's closest `<section>`, which nuked the entire custom-order form
section. It is now scoped to `#patch-photo-wrap` only. Do not widen it again.

## 8. Per-page JS load order / conflicts

- `index.html`: shopify-config, site.js, hero-carousel, image-slot, inline
  featured-grid renderer (its own `.card` template using `listings.json`/live
  snapshot). Clean.
- `shop.html`: shopify-config → shopify-loader → site.js. `shopify-loader`
  fetches live products, renders the grid into `.product-grid`, and runs
  `setupFilters()` (tabs `[data-tab]`, pills `[data-shop-filter]`, search).
  `main.js` was REMOVED from shop (it was a competing renderer + duplicate
  cart). The State `<select>` filter is inert by design (cards have empty
  `data-state`) — acceptable; hide it if undesired.
- `product.html`: image-slot, shopify-config, site.js. Loads product by
  `?handle=` from `listings.json`. Add-to-cart via `window.MP.addToCart`.
- `custom.html`: image-slot, shopify-config, site.js, Shopify forms script,
  Firebase (photo upload). Real form is injected by `audit-fixes.js`.
- Other content pages: shopify-config + site.js + image-slot.

`main.js` is still referenced by some non-shop pages; treat it as legacy.
`main-original.js` is dead — safe to delete.

## 9. Page inventory

Public (in nav/sitemap): `index.html`, `shop.html`, `custom.html`,
`about.html`, `faq.html`, `contact.html`, `product.html`,
`shipping.html`, `refunds.html`, `privacy.html`, `terms.html`.

Dropped (kept in repo, `noindex`, delinked, not in sitemap):
`challenge-coins.html`, `patch-exchange.html`, `queue.html` — these are
unstyled/broken (old design system, dozens of classless elements). Rebuild
on the NEW design system or delete; don't relink as-is.

Internal: `internal/*`, `launch-checklist.html` (uses inline `<style>`).

## 10. Known tech debt / open items

1. **Custom-order backend:** `audit-fixes.js` ZAPIER_WEBHOOK_URL is a
   placeholder; submissions only open the user's email client. Wire a real
   endpoint (Formspree/Zapier/Cloudflare) for true submission.
2. **`product.html`** reads `listings.json` (can be stale; no live stock).
   Consider fetching live Shopify product like the hero carousel does.
3. **Two design systems** still coexist; the dropped pages and parts of
   `custom.html` use the old one.
4. **`audit-fixes.js`** does work that should live in source HTML/CSS
   (canonical rewrite is now redundant; the injected custom form should
   become real markup + styled in `style.css`).
5. **`main-original.js`** dead code.
6. Some Shopify product **tags/product-types** still contain
   "embroidered"/"45x45mm"/"Micro Patch" wording (descriptions were already
   rewritten via the Shopify Admin API; tags/types were intentionally left).

## 11. Conventions for changes

- **Branch + PR workflow.** Develop on a `claude/<topic>` branch, rebase
  onto `origin/main`, open a PR, squash-merge. Never commit straight to main.
- **Bump the `?v=` cache version** on all referencing pages for any changed
  CSS/JS (see §2). Pick the current date `YYYYMMDD`.
- **Verify class names exist in CSS** before relying on them (§4).
- **Keep `sitemap.xml`, `data-page`, canonicals consistent** when adding or
  removing pages.
- **Don't add competing renderers/carts.** Use `site.js` mounts and the
  unified cart/checkout (§5, §6).
- Material/marketing copy: these are **3D-printed base + UV-cured ink
  keychains**. Never describe them as embroidered / iron-on / sew-on /
  for jackets-vests, and avoid hard size claims like "45x45mm".
- Mobile-first: the site is primarily used on phones. Test narrow widths;
  avoid horizontal overflow; 44px+ tap targets.

## 12. Useful Shopify references

- Storefront JSON: `https://micropatches.myshopify.com/products.json?limit=250&page=N`
- Cart permalink: `https://micropatches.myshopify.com/cart/<variantId>:<qty>,...`
- Product page: `https://micropatches.myshopify.com/products/<handle>`
- Product descriptions are managed via the Shopify Admin API (not in this
  repo). The repo only routes buyers to Shopify.
