/* MicroPatches — product photo carousel
 * ------------------------------------------------------------------
 * Reusable, dependency-free image carousel used on product cards,
 * the hero, and the PDP gallery.
 *
 * - Smooth cross-fade between photos
 * - Auto-advance (default ~3.2s); pause on hover / touch
 * - Swipe on touch devices
 * - Optional overlaid caption (product name) + per-slide link to the
 *   product page
 * - No layout shift: media box owns a fixed aspect-ratio
 * - First image eager + preloaded; the rest lazy-loaded only once
 *   the card enters the viewport
 * - Cycling stops entirely while the card is off-screen
 *
 * Usage: MPCarousel.mount(mediaEl, items, { alt, interval, priority })
 *   items: array of image URL strings, OR array of
 *          { src, label, href } objects (label → caption, href → link)
 * ------------------------------------------------------------------ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mount(media, items, opts) {
    opts = opts || {};
    if (!media) return;

    // Normalize to [{ src, label, href }]
    var list = (items || [])
      .map(function (it) {
        return (typeof it === 'string') ? { src: it } : (it || {});
      })
      .filter(function (it) { return it && it.src; });

    // De-dupe by src while keeping order.
    var seen = {};
    list = list.filter(function (it) {
      if (seen[it.src]) return false; seen[it.src] = 1; return true;
    });
    if (!list.length) return;

    var alt = opts.alt || '';
    var interval = opts.interval || 3200;
    var mediaIsLink = media.tagName === 'A';

    media.classList.add('pcar');
    media.innerHTML = '';

    var track = document.createElement('div');
    track.className = 'pcar__track';
    media.appendChild(track);

    var slides = [];
    list.forEach(function (it, i) {
      // A per-slide link is only safe when the media element itself is
      // not already an anchor (no nested <a>).
      var slide;
      if (it.href && !mediaIsLink) {
        slide = document.createElement('a');
        slide.href = it.href;
        if (it.label) slide.setAttribute('aria-label', it.label);
      } else {
        slide = document.createElement('div');
      }
      slide.className = 'pcar__slide' + (i === 0 ? ' is-active' : '');
      var img = document.createElement('img');
      img.alt = it.label || alt;
      img.decoding = 'async';
      if (i === 0) {
        img.src = it.src;
        img.loading = 'eager';
        if (opts.priority) img.setAttribute('fetchpriority', 'high');
      } else {
        img.dataset.src = it.src;
        img.loading = 'lazy';
      }
      img.addEventListener('error', function () { slide.style.display = 'none'; });
      slide.appendChild(img);
      track.appendChild(slide);
      slides.push(slide);
    });

    var hasCaption = list.some(function (it) { return it.label; });
    var cap = null;
    if (hasCaption) {
      cap = document.createElement('div');
      cap.className = 'pcar__cap';
      cap.textContent = list[0].label || '';
      media.appendChild(cap);
    }

    var cur = 0, timer = null;
    var visible = false, hovered = false, touching = false;
    var loadedRest = list.length <= 1;

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
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add('is-active');
      if (cap) cap.textContent = list[cur].label || '';
    }

    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function play() {
      stop();
      if (REDUCED || list.length < 2) return;
      if (visible && !hovered && !touching) {
        timer = setInterval(function () { go(cur + 1); }, interval);
      }
    }

    media.addEventListener('mouseenter', function () { hovered = true; stop(); });
    media.addEventListener('mouseleave', function () { hovered = false; play(); });

    var sx = 0, sy = 0, swiping = false, moved = false;
    media.addEventListener('touchstart', function (e) {
      touching = true; stop();
      var t = e.touches[0]; sx = t.clientX; sy = t.clientY;
      swiping = true; moved = false;
    }, { passive: true });
    media.addEventListener('touchmove', function (e) {
      if (!swiping) return;
      var t = e.touches[0];
      if (Math.abs(t.clientX - sx) > 8 || Math.abs(t.clientY - sy) > 8) moved = true;
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
    // A swipe on a linked slide must not also navigate.
    media.addEventListener('click', function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);

    // Manual prev/next arrows. go()'s modulo wrap makes this an infinite
    // loop in both directions. stopPropagation keeps a tap from also
    // triggering a linked slide / parent <a>; works for click and tap.
    if (list.length > 1) {
      var mkArrow = function (dir, label, pts) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'pcar__nav pcar__nav--' + (dir < 0 ? 'prev' : 'next');
        b.setAttribute('aria-label', label);
        b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
          '<polyline points="' + pts + '"></polyline></svg>';
        b.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          go(cur + dir);
          play();
        });
        media.appendChild(b);
      };
      mkArrow(-1, 'Previous photo', '15 18 9 12 15 6');
      mkArrow(1, 'Next photo', '9 18 15 12 9 6');
    }

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
