import { loadProductPhotos } from "./firebase.js";

const INTERVAL_MS = 3200;

function escA(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function productNameFromId(id) {
  return String(id)
    .split("-")
    .filter(Boolean)
    .map(part => part.toUpperCase() === part ? part : part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function renderCarousel(photos) {
  const stage = document.getElementById("hero-carousel-stage");
  if (!stage) return;

  const products = Object.entries(photos || {})
    .filter(([, url]) => Boolean(url))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, url]) => ({ id, url, name: productNameFromId(id) }));

  if (!products.length) return;

  const caption = document.getElementById("hero-carousel-caption");
  const title = document.getElementById("hero-carousel-title");
  const dots = document.getElementById("hero-carousel-dots");

  stage.innerHTML = products.map((product, index) => `
    <div class="hero-carousel-slide${index === 0 ? " is-active" : ""}" data-hero-slide="${index}">
      <img src="${escA(product.url)}" alt="${escA(product.name)}" loading="${index === 0 ? "eager" : "lazy"}" decoding="async">
    </div>
  `).join("");

  if (caption) caption.hidden = false;
  if (title) title.textContent = products[0].name;

  if (dots) {
    dots.hidden = products.length > 18;
    dots.innerHTML = dots.hidden ? "" : products.map((_, index) => (
      `<span class="hero-carousel-dot${index === 0 ? " is-active" : ""}"></span>`
    )).join("");
  }

  const slides = [...stage.querySelectorAll(".hero-carousel-slide")];
  const dotEls = dots ? [...dots.querySelectorAll(".hero-carousel-dot")] : [];
  let activeIndex = 0;

  const setActive = (nextIndex) => {
    activeIndex = nextIndex % slides.length;
    slides.forEach((slide, index) => slide.classList.toggle("is-active", index === activeIndex));
    dotEls.forEach((dot, index) => dot.classList.toggle("is-active", index === activeIndex));
    if (title) title.textContent = products[activeIndex].name;
  };

  if (slides.length > 1) {
    setInterval(() => setActive(activeIndex + 1), INTERVAL_MS);
  }
}

async function initHeroCarousel() {
  if (!document.getElementById("hero-product-carousel")) return;
  try {
    renderCarousel(await loadProductPhotos());
  } catch (_e) {
    /* Product photos are non-critical. */
  }
}

document.addEventListener("DOMContentLoaded", initHeroCarousel);
