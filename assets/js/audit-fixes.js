/* MicroPatches — audit fixes runtime v2.1 */
(function () {
  "use strict";
  var ZAPIER_WEBHOOK_URL = "REPLACE_ME_AFTER_ZAPIER_SETUP";
  var NOTIFY_EMAIL = "officialmicropatches@gmail.com";

  document.querySelectorAll('link[rel="canonical"]').forEach(function (link) {
    if (link.href.indexOf("officialmicropatches.github.io") !== -1) {
      link.href = link.href.replace("officialmicropatches.github.io", "officialmicropatches.com");
    }
  });
  document.querySelectorAll('meta[property="og:image"], meta[name="og:image"]').forEach(function (m) {
    var c = m.getAttribute("content") || "";
    if (c.indexOf("officialmicropatches.github.io") !== -1) {
      m.setAttribute("content", c.replace("officialmicropatches.github.io", "officialmicropatches.com"));
    }
  });
  if (!document.querySelector('link[rel="icon"], link[rel="shortcut icon"]')) {
    var ico = document.createElement("link");
    ico.rel = "icon"; ico.href = "/assets/img/favicon.svg";
    document.head.appendChild(ico);
  }
  if (!document.querySelector('meta[property="og:image"]')) {
    var og = document.createElement("meta");
    og.setAttribute("property", "og:image");
    og.setAttribute("content", "https://officialmicropatches.com/assets/img/og-cover.jpg");
    document.head.appendChild(og);
  }
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 80) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  document.body.setAttribute("data-active-tab", "all");
  var setActive = function (tabKey) { document.body.setAttribute("data-active-tab", tabKey || "all"); };
  document.querySelectorAll(".shop-tab[data-tab]").forEach(function (tab) {
    tab.addEventListener("click", function () { setActive(tab.dataset.tab); });
  });
  var activeTab = document.querySelector(".shop-tab.active[data-tab]");
  if (activeTab) setActive(activeTab.dataset.tab);
  var footers = document.querySelectorAll("footer.site-footer");
  if (footers.length > 1) {
    for (var i = 0; i < footers.length - 1; i++) { footers[i].remove(); }
  }
  document.documentElement.setAttribute("data-audit-fixes", "2026-05-16-v2.1");

  if (!/custom\.html/i.test(location.pathname)) return;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    /* CLEANUP: hide original patch-photo-wrap section (the leftover widget below new form) */
    document.querySelectorAll('#patch-photo-wrap, .patch-photo-wrap, .shopify-form-container').forEach(function(n){ n.style.display='none'; });
    /* Also hide any orphaned file input outside our new form */
    document.querySelectorAll('input[type="file"]').forEach(function(inp){
      if (!inp.closest('.patch-form-wrap')) {
        var wrap = inp.closest('#patch-photo-wrap, .patch-photo-wrap') || inp.parentElement;
        if (wrap) wrap.style.display = 'none';
      }
    });

    var headings = Array.from(document.querySelectorAll("h2, h3, .section-head"));
    var target = null;
    headings.forEach(function (h) {
      if (/send your request/i.test(h.innerText || "")) target = h;
    });
    if (!target) {
      var sf = document.querySelector('script[src*="shopify-form"], shopify-form');
      target = sf && sf.parentElement ? sf.parentElement : null;
    }
    if (!target) return;
    if (document.querySelector('.patch-form-wrap')) return;

    var formHtml = '<form class="patch-form" novalidate><div class="patch-form-grid"><label class="patch-field"><span>First name *</span><input type="text" name="firstName" required maxlength="80"></label><label class="patch-field"><span>Last name</span><input type="text" name="lastName" maxlength="80"></label><label class="patch-field"><span>Email *</span><input type="email" name="email" required maxlength="120"></label><label class="patch-field"><span>Phone</span><input type="tel" name="phone" maxlength="40"></label><label class="patch-field patch-field--full"><span>Agency / Unit name *</span><input type="text" name="agency" required maxlength="160"></label><label class="patch-field patch-field--full"><span>Product type</span><select name="productType"><option value="MicroKeychain">MicroKeychain (13.99)</option><option value="MicroMagnet">MicroMagnet</option><option value="MicroCharm">MicroCharm</option><option value="MicroPin">MicroPin</option><option value="Not sure">Not sure</option></select></label><label class="patch-field patch-field--full"><span>Quantity / notes</span><textarea name="message" rows="4" maxlength="2000"></textarea></label><label class="patch-field patch-field--full"><span>Patch photo *</span><input type="file" name="photo" accept="image/*" capture="environment" required><small class="patch-hint">Lay flat on solid surface. Phone directly above. No angles.</small></label></div><button type="submit" class="patch-submit">Send custom order request</button><p class="patch-status" role="status" aria-live="polite"></p><p class="patch-fallback"><small>Form not working? Email us at <a href="mailto:' + NOTIFY_EMAIL + '">' + NOTIFY_EMAIL + '</a>.</small></p></form>';

    var brokenSF = document.querySelector('script[src*="shopify-form"], shopify-form');
    if (brokenSF && brokenSF.parentElement) {
      Array.from(brokenSF.parentElement.querySelectorAll('shopify-form')).forEach(function (n) { n.style.display = 'none'; });
    }

    var wrapper = document.createElement('div');
    wrapper.className = 'patch-form-wrap';
    wrapper.innerHTML = formHtml;
    target.parentElement.insertBefore(wrapper, target.nextSibling);

    var css = document.createElement('style');
    css.textContent = '.patch-form-wrap{max-width:720px;margin:24px auto}.patch-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.patch-field{display:flex;flex-direction:column;gap:6px;font-size:14px}.patch-field--full{grid-column:1/-1}.patch-field span{color:#ddd;letter-spacing:.04em;text-transform:uppercase;font-size:11px}.patch-field input,.patch-field select,.patch-field textarea{background:rgba(255,255,255,.04);color:#fff;border:1px solid rgba(255,255,255,.18);border-radius:6px;padding:10px 12px;font:inherit;font-size:14px}.patch-field input:focus,.patch-field select:focus,.patch-field textarea:focus{outline:2px solid #e7b54e;outline-offset:1px}.patch-hint{color:rgba(255,255,255,.55);font-size:12px}.patch-submit{margin-top:18px;background:#e7b54e;color:#0a1633;border:0;padding:14px 24px;border-radius:6px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;cursor:pointer}.patch-submit:disabled{opacity:.55}.patch-status{margin-top:10px;min-height:1.5em;font-size:14px}.patch-status.is-success{color:#6ad29a}.patch-status.is-error{color:#f08a8a}.patch-fallback{margin-top:10px;color:rgba(255,255,255,.55)}.patch-fallback a{color:#e7b54e}@media(max-width:600px){.patch-form-grid{grid-template-columns:1fr}}';
    document.head.appendChild(css);

    var formEl = wrapper.querySelector('form');
    var statusEl = wrapper.querySelector('.patch-status');
    var submitBtn = wrapper.querySelector('.patch-submit');

    formEl.addEventListener('submit', function (ev) {
      ev.preventDefault();
      submitBtn.disabled = true;
      statusEl.className = 'patch-status';
      statusEl.textContent = 'Uploading...';
      var fd = new FormData(formEl);
      var file = fd.get('photo');

      function sendToHook(photoUrl) {
        var payload = {
          firstName: fd.get('firstName') || '', lastName: fd.get('lastName') || '',
          email: fd.get('email') || '', phone: fd.get('phone') || '',
          agency: fd.get('agency') || '', productType: fd.get('productType') || '',
          message: fd.get('message') || '', photoUrl: photoUrl || '',
          submittedAt: new Date().toISOString(),
          source: 'officialmicropatches.com/custom.html', notifyEmail: NOTIFY_EMAIL
        };
        if (ZAPIER_WEBHOOK_URL.indexOf('REPLACE_ME') === 0) {
          statusEl.className = 'patch-status is-error';
          statusEl.textContent = 'Form backend not configured yet. Opening email app as fallback...';
          var body = Object.keys(payload).map(function (k) { return k + ': ' + payload[k]; }).join('\n');
          window.location.href = 'mailto:' + NOTIFY_EMAIL + '?subject=' + encodeURIComponent('Custom Order Request') + '&body=' + encodeURIComponent(body);
          submitBtn.disabled = false;
          return;
        }
        fetch(ZAPIER_WEBHOOK_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(function (r) {
          if (!r.ok) throw new Error('Webhook ' + r.status);
          statusEl.className = 'patch-status is-success';
          statusEl.textContent = 'Thanks! We typically respond within 1-2 business days.';
          formEl.reset();
        }).catch(function () {
          statusEl.className = 'patch-status is-error';
          statusEl.textContent = 'Sorry - submission failed. Please email ' + NOTIFY_EMAIL + ' directly.';
        }).finally(function () { submitBtn.disabled = false; });
      }

      if (file && file.size && window.firebase && window.firebase.storage) {
        try {
          var storage = window.firebase.storage();
          var ref = storage.ref('custom-orders/' + Date.now() + '-' + (file.name || 'photo.jpg').replace(/[^a-z0-9._-]/gi, '_'));
          var task = ref.put(file);
          task.on('state_changed', null, function () { sendToHook(''); }, function () { ref.getDownloadURL().then(function (url) { sendToHook(url); }); });
        } catch (e) { sendToHook(''); }
      } else {
        sendToHook(file && file.name ? '(photo: ' + file.name + ')' : '');
      }
    });
  });
})();