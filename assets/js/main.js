import "./main-original.js";

(() => {
  const isRealProductPhoto = (src) => {
    if (!src) return false;
    try {
      const url = new URL(src, window.location.href);
      if (url.hostname === "placehold.co") return false;
      if (url.pathname === "/" || url.pathname.endsWith("/shop.html") || url.pathname.endsWith("/index.html")) return false;
      return true;
    } catch {
      return false;
    }
  };

  const rememberPhoto = (photo) => {
    if (!photo) return "";
    const src = photo.currentSrc || photo.src || "";
    if (isRealProductPhoto(src)) photo.dataset.productPhotoSrc = src;
    return photo.dataset.productPhotoSrc || "";
  };

  const restoreProductPhoto = (card) => {
    const imgArea = card.querySelector(".product-card-img");
    const photo = imgArea?.querySelector(".product-card-photo");
    const placeholder = imgArea?.querySelector(".img-placeholder");
    const saved = photo?.dataset.productPhotoSrc || "";
    const current = photo?.currentSrc || photo?.src || "";
    const src = saved || (isRealProductPhoto(current) ? current : "");
    if (!photo || !src) return;
    photo.dataset.productPhotoSrc = src;
    if (photo.src !== src) photo.src = src;
    photo.style.display = "block";
    photo.style.opacity = "1";
    if (placeholder) placeholder.style.display = "none";
  };

  const repairCard = (card) => {
    if (!card || card.dataset.productPhotoHotfix === "true") return;
    const photo = card.querySelector(".product-card-photo");
    if (!photo) return;
    card.dataset.productPhotoHotfix = "true";
    rememberPhoto(photo);

    new MutationObserver(() => {
      const src = photo.currentSrc || photo.src || "";
      if (isRealProductPhoto(src)) rememberPhoto(photo);
    }).observe(photo, {
      attributes: true,
      attributeFilter: ["src"]
    });
  };

  const repairAllCards = () => {
    document.querySelectorAll(".product-card").forEach(repairCard);
  };

  document.addEventListener("click", (event) => {
    const btn = event.target.closest(".card-variant-btn");
    if (!btn) return;
    const card = btn.closest(".product-card");
    if (!card) return;
    repairCard(card);
    restoreProductPhoto(card);
    setTimeout(() => restoreProductPhoto(card), 0);
    setTimeout(() => restoreProductPhoto(card), 80);
    setTimeout(() => restoreProductPhoto(card), 250);
  }, true);

  document.addEventListener("DOMContentLoaded", () => {
    repairAllCards();
    setTimeout(repairAllCards, 250);
    setTimeout(repairAllCards, 1000);
  });

  new MutationObserver(repairAllCards).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
