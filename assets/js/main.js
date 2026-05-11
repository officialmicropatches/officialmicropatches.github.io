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
    if (isRealProductPhoto(src)) photo.dataset.keychainSrc = src;
    return photo.dataset.keychainSrc || "";
  };

  const restoreKeychainPhoto = (card) => {
    const imgArea = card.querySelector(".product-card-img");
    const photo = imgArea?.querySelector(".product-card-photo");
    const placeholder = imgArea?.querySelector(".img-placeholder");
    const src = rememberPhoto(photo);
    if (!photo || !src) return;
    photo.src = src;
    photo.style.display = "block";
    photo.style.opacity = "1";
    if (placeholder) placeholder.style.display = "none";
  };

  const repairCard = (card) => {
    if (!card || card.dataset.keychainPhotoHotfix === "true") return;
    const photo = card.querySelector(".product-card-photo");
    if (!photo) return;
    card.dataset.keychainPhotoHotfix = "true";
    rememberPhoto(photo);

    new MutationObserver(() => rememberPhoto(photo)).observe(photo, {
      attributes: true,
      attributeFilter: ["src"]
    });

    card.addEventListener("click", (event) => {
      const btn = event.target.closest(".card-variant-btn");
      if (!btn || !card.contains(btn)) return;
      const isKeychain = /keychain/i.test(btn.textContent || "");
      setTimeout(() => {
        if (isKeychain) restoreKeychainPhoto(card);
        else rememberPhoto(photo);
      }, 0);
    });
  };

  const repairAllCards = () => {
    document.querySelectorAll(".product-card").forEach(repairCard);
  };

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
