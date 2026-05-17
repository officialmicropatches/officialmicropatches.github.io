/* MicroPatches — product photo carousel
 * ------------------------------------------------------------------
 * Reusable, dependency-free image carousel used on product cards,
 * the hero, and the PDP gallery.
 *
 * - Smooth cross-fade between photos
 * - Auto-advance (default ~3.2s); pause on hover / touch
 * - Swipe on touch devices
 * - Minimal dot indicators (tap to jump)
 * - No layout shift: media box owns a fixed aspect-ratio
 * - First image eager + preloaded; the rest lazy-loaded only once
 *   the card enters the viewport
 * - Cycling stops entirely while the card is off-screen
 *
 * Usage: MPCarousel.mount(mediaEl, imageUrls, { alt, interval, priority })
 * ------------------------------------------------------------------ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mount(media, images, opts) {
    opts = opts || {};
    if (!media) return;
    images = (images || []).filter(Boolean);
    // De-dupe while keeping order.
    var seen = {};
    images = images.filter(function (s) {
      if (seen[s]) return false; seen[s] = 1; return true;
    });
    if (!images.length) return;

    var alt = opts.alt || '';
    var interval = opts.interval || 3200;

    media.classList.add('pcar');
    media.innerHTML = '';

    var track = document.createElement('div');
    track.className = 'pcar__track';
    media.appendChild(track);

    var slides = [];
    images.forEach(function (src, i) {
      var slide = document.createElement('div');
      slide.className = 'pcar__slide' + (i === 0 ? ' is-active' : '');
      var img = document.createElement('img');
      img.alt = alt;
      img.decoding = 'async';
      if (i === 0) {
        img.src = src;
        img.loading = 'eager';
        if (opts.priority) img.setAttribute('fetchpriority', 'high');
      } else {
        img.dataset.src = src;
        img.loading = 'lazy';
      }
      img.addEventListener('error', function () { slide.style.display = 'none'; });
      slide.appendChild(img);
      track.appendChild(slide);
      slides.push(slide);
    });

    var dots = null;
    if (images.length > 1) {
      dots = document.createElement('div');
      dots.className = 'pcar__dots';
      images.forEach(function (_, i) {
        var d = document.createElement('button');
        d.type = 'button';
        d.className = 'pcar__dot' + (i === 0 ? ' is-active' : '');
        d.setAttribute('aria-label', 'View image ' + (i + 1));
        d.addEventListener('click', function (e) {
          e.preventDefault(); e.stopPropagation();
          go(i); restart();
        });
        dots.appendChild(d);
      });
      media.appendChild(dots);
    }

    var cur = 0, timer = null;
    var visible = false, hovered = false, touching = false;
    var loadedRest = images.length <= 1;

    function loadRest() {
      if (loadedRest) return;
      loadedRest = true;
      slides.forEach(function (s) {
        var im = s.querySelector('img');
        if (im && im.dataset.src) {
          im.src = im.dataset.src;
          im.removeAttribute('data-src');
        }
      });
    }

    function go(n) {
      slides[cur].classList.remove('is-active');
      if (dots) dots.children[cur].classList.remove('is-active');
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add('is-active');
      if (dots) dots.children[cur].classList.add('is-active');
    }

    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function play() {
      stop();
      if (REDUCED || images.length < 2) return;
      if (visible && !hovered && !touching) {
        timer = setInterval(function () { go(cur + 1); }, interval);
      }
    }
    function restart() { play(); }

    media.addEventListener('mouseenter', function () { hovered = true; stop(); });
    media.addEventListener('mouseleave', function () { hovered = false; play(); });

    var sx = 0, sy = 0, swiping = false;
    media.addEventListener('touchstart', function (e) {
      touching = true; stop();
      var t = e.touches[0]; sx = t.clientX; sy = t.clientY; swiping = true;
    }, { passive: true });
    media.addEventListener('touchend', function (e) {
      touching = false;
      if (swiping) {
        var t = e.changedTouches[0];
        var dx = t.clientX - sx, dy = t.clientY - sy;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          go(cur + (dx < 0 ? 1 : -1));
        }
      }
      swiping = false;
      setTimeout(play, 700);
    }, { passive: true });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          visible = entries[i].isIntersecting;
          if (visible) { loadRest(); play(); }
          else { stop(); }
        }
      }, { rootMargin: '150px 0px' });
      io.observe(media);
    } else {
      visible = true;
      loadRest();
      play();
    }
  }

  window.MPCarousel = { mount: mount };
})();
