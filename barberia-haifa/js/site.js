/* Barberia Haifa concept: language, the motion switch, live hours and the turning pole, the chalk-board composer,
   and the signature move: one straight-razor pass along the top edge of every section, tied to the scroll both ways. */
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang !== 'en'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var store = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };
  var PHONE = '972507744286';

  // ---------------------------------------------------------------- hours, from the Google listing (0 = Sunday). Monday and Saturday closed
  var HOURS = window.BARBERIA_HOURS || { 0: [540, 1080], 1: null, 2: [540, 1080], 3: [540, 1080], 4: [540, 1080], 5: [540, 900], 6: null };
  var DAY_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  var DAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (m) { return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2); };
  function nowIL() {
    var p = {};
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
        .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), m: (+p.hour % 24) * 60 + (+p.minute) };
    } catch (e) { var n = new Date(); return { d: n.getDay(), m: n.getHours() * 60 + n.getMinutes() }; }
  }
  function state() {
    var n = nowIL(), h = HOURS[n.d];
    if (h && n.m >= h[0] && n.m < h[1]) return { open: true, until: h[1], d: n.d };
    if (h && n.m < h[0]) return { open: false, inDays: 0, at: h[0], d: n.d, nd: n.d };
    for (var i = 1; i <= 7; i++) { var d = (n.d + i) % 7; if (HOURS[d]) return { open: false, inDays: i, at: HOURS[d][0], d: n.d, nd: d }; }
    return { open: false, d: n.d };
  }
  function statusText(s) {
    if (s.open && s.until >= 1440) return he() ? 'פתוח עכשיו · כל היום' : 'Open now · all day';
    if (s.open) return he() ? 'פתוח עכשיו · עד ' + hhmm(s.until) : 'Open now · until ' + hhmm(s.until);
    if (s.inDays === 0) return he() ? 'סגור עכשיו · נפתח היום ב-' + hhmm(s.at) : 'Closed now · opens today at ' + hhmm(s.at);
    if (s.inDays === 1) return he() ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(s.at) : 'Closed now · opens tomorrow at ' + hhmm(s.at);
    return he() ? 'סגור עכשיו · נפתח ביום ' + DAY_HE[s.nd] + ' ב-' + hhmm(s.at) : 'Closed now · opens ' + DAY_EN[s.nd] + ' at ' + hhmm(s.at);
  }
  function renderHours() {
    var s = state();
    $$('[data-status]').forEach(function (el) { el.textContent = statusText(s); el.classList.toggle('is-open', s.open); el.classList.toggle('is-closed', !s.open); });
    var pole = $('[data-pole]'); if (pole) pole.classList.toggle('turning', s.open);
    var pin = $('[data-pin]'); if (pin) { pin.classList.toggle('open', s.open); pin.classList.toggle('closed', !s.open); }
    var tb = $('[data-hours]'); if (!tb) return;
    tb.innerHTML = '';
    for (var d = 0; d < 7; d++) {
      var h = HOURS[d], tr = document.createElement('tr'), a = document.createElement('td'), b = document.createElement('td');
      a.textContent = he() ? 'יום ' + DAY_HE[d] : DAY_EN[d];
      b.textContent = !h ? (he() ? 'סגור' : 'Closed') : h[0] === 0 && h[1] >= 1440 ? (he() ? '24 שעות' : '24 hours') : hhmm(h[0]) + '–' + hhmm(h[1]);
      b.dir = 'ltr';
      if (!h) tr.className = 'closed';
      if (d === s.d) tr.classList.add('today');
      tr.appendChild(a); tr.appendChild(b); tb.appendChild(tr);
    }
  }

  // ---------------------------------------------------------------- language
  var ARIA = [
    ['[data-nav]', 'ראשי', 'Main'],
    ['[data-razorbar]', 'יצירת קשר מהירה', 'Quick contact'],
    ['[data-run-step="-1"]', 'הקודם', 'Previous'],
    ['[data-run-step="1"]', 'הבא', 'Next'],
    ['[data-pano-track]', 'תמונה פנורמית של המספרה, אפשר לגלול לצדדים', 'Panorama of the shop, scroll sideways'],
    ['.five', '5 כוכבים', '5 stars']
  ];
  function applyLang() {
    var e = !he();
    $$('[data-alt-he]').forEach(function (img) { img.alt = img.getAttribute(e ? 'data-alt-en' : 'data-alt-he'); });
    $$('[data-ph-he]').forEach(function (i) { i.placeholder = i.getAttribute(e ? 'data-ph-en' : 'data-ph-he'); });
    ARIA.forEach(function (a) { $$(a[0]).forEach(function (el) { el.setAttribute('aria-label', e ? a[2] : a[1]); }); });
    document.title = e ? 'Barberia · Men’s barbershop · 3 HaNamal St, Haifa' : 'ברבריה · מספרת גברים · הנמל 3, חיפה';
    renderHours(); writeMsg(true);
  }
  $$('[data-set-lang]').forEach(function (b) {
    b.addEventListener('click', function () {
      var l = he() ? 'en' : 'he';
      root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr'; store('lang', l);
      var u = new URL(location.href); if (l === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang');
      history.replaceState(null, '', u);
      applyLang(); layout(); runKeys();
    });
  });

  // ---------------------------------------------------------------- the chalk board composer
  var form = $('[data-composer]'), preview = $('[data-preview]'), send = $('[data-send]');
  var WHAT = { cut: ['תור לתספורת', 'a haircut'], shave: ['תור לגילוח תער', 'a razor shave'], both: ['תור לתספורת וגילוח תער', 'a haircut and a razor shave'] };
  var WHEN = { am: ['בבוקר', ' morning'], noon: ['בצהריים', ' around midday'], pm: ['אחר הצהריים', ' afternoon'] };
  function pickDefaultDay() {
    var s = state(), d = s.open && HOURS[s.d][1] - nowIL().m > 120 ? s.d : (s.nd != null ? s.nd : 0);
    var r = form && form.querySelector('input[name="day"][value="' + d + '"]'); if (r) r.checked = true;
  }
  function msg() {
    var f = new FormData(form), w = f.get('what'), d = +f.get('day'), t = f.get('when'), n = (f.get('name') || '').trim(), i = he() ? 0 : 1;
    if (he()) return 'היי ברבריה, אשמח לקבוע ' + WHAT[w][0] + ' ביום ' + DAY_HE[d] + ' ' + WHEN[t][0] + '. יש מקום?' + (n ? '\nתודה, ' + n : '');
    return 'Hi Barberia, I’d like to book ' + WHAT[w][i] + ' on ' + DAY_EN[d] + WHEN[t][i] + '. Do you have a slot?' + (n ? '\nThanks, ' + n : '');
  }
  function writeMsg(quiet) {
    if (!form) return;
    // a part of the day is only offered when the shop is open in it on the chosen day (Friday closes at 15:00: no afternoon)
    var day = form.querySelector('input[name="day"]:checked'), h = day && HOURS[+day.value], SLOT = { am: [540, 720], noon: [720, 900], pm: [900, 1080] };
    var whens = $$('input[name="when"]', form), first = null;
    whens.forEach(function (r) { var sl = SLOT[r.value]; r.disabled = !h || h[1] <= sl[0] || h[0] >= sl[1]; if (!r.disabled && !first) first = r; });
    if (first && whens.some(function (r) { return r.checked && r.disabled; })) first.checked = true;
    var m = msg();
    preview.textContent = m;
    send.href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(m);
    if (!quiet) { preview.classList.remove('write'); void preview.offsetWidth; preview.classList.add('write'); }
  }
  if (form) {
    pickDefaultDay();
    form.addEventListener('change', function () { writeMsg(false); });
    form.addEventListener('input', function (e) { if (e.target.name === 'name') writeMsg(true); });
  }

  // ---------------------------------------------------------------- the razor cut: build the sheet, the razor, the seam line and the hairs in each section
  var secs = $$(".sec[data-cut]"), N = 22;
  secs.forEach(function (s, si) {
    $$('.rv', s).forEach(function (el, i) { el.style.setProperty('--rd', (120 + Math.min(i, 6) * 80) + 'ms'); });
    var wrap = document.createElement('div'); wrap.className = 'cutwrap'; wrap.setAttribute('aria-hidden', 'true');
    var sheet = document.createElement('i'); sheet.className = 'sheet'; wrap.appendChild(sheet);
    var fx = document.createElement('div'); fx.className = 'cutfx'; fx.setAttribute('aria-hidden', 'true');
    var line = document.createElement('i'); line.className = 'seamline'; fx.appendChild(line);
    var hairs = [];
    for (var i = 0; i < N; i++) {
      var h = document.createElement('i'); h.className = 'hair';
      // a fixed, per-section scatter so every pass looks the same going down and coming back up
      var r1 = Math.sin((si + 1) * 12.9898 + i * 78.233) * 43758.5453; r1 -= Math.floor(r1);
      var r2 = Math.sin((si + 1) * 39.346 + i * 11.135) * 24634.6345; r2 -= Math.floor(r2);
      h.style.setProperty('--hl', (7 + r1 * 10).toFixed(1) + 'px');
      hairs.push({ el: h, at: (i + 0.3 + r2 * 0.4) / N, drift: (r1 - 0.5) * 2, spin: (r2 - 0.5) * 2, rot: (r1 * 180) | 0, k: '' });
      fx.appendChild(h);
    }
    var rz = document.createElement('div'); rz.className = 'cut-razor';
    rz.innerHTML = '<svg viewBox="0 0 350 62"><use href="#razor"/></svg>';
    fx.appendChild(rz);
    s.insertBefore(wrap, s.firstChild); s.appendChild(fx);
    s._c = { sheet: sheet, line: line, rz: rz, hairs: hairs, W: 0, H: 0, L: 0, sk: 0, rw: 0, rh: 0, k: '' };
  });
  function layout() {
    root.style.setProperty('--cb', $('.concept').offsetHeight + 'px');
    secs.forEach(function (s) {
      var c = s._c; c.W = s.clientWidth; c.H = s.offsetHeight; c.L = c.W * 0.35;
      c.sk = Math.atan(c.L / Math.max(1, c.H)) * 180 / Math.PI;
      c.sheet.style.width = (c.W + c.L + 2).toFixed(0) + 'px';
      c.rw = c.rz.offsetWidth; c.rh = c.rz.offsetHeight; c.k = '';
    });
    tick();
  }
  var smooth = function (t) { return t * t * (3 - 2 * t); };
  function cut(s, t) {
    var c = s._c, key = clamp(t, -0.01, 1.4).toFixed(4);
    if (key === c.k) return; c.k = key;
    var e = smooth(clamp(t, 0, 1)), xr = e * (c.W + c.L);
    // the sheet's top corner rides under the blade; its foot trails behind, so the new ground opens on a slant
    c.sheet.style.transform = 'translate3d(' + (xr - c.W - c.L).toFixed(1) + 'px,0,0) skewX(' + (-c.sk).toFixed(3) + 'deg)';
    // the razor: the middle of the edge sits on the seam, tipped slightly into the stroke
    var on = t > 0 && t < 1 ? Math.min(1, t / 0.05, (1 - t) / 0.05) : 0;
    c.rz.style.opacity = on.toFixed(3);
    c.rz.style.transform = 'translate3d(' + (xr - 0.74 * c.rw).toFixed(1) + 'px,' + (-0.84 * c.rh).toFixed(1) + 'px,0) rotate(-1.5deg)';
    // the clean line left behind the blade, fading once the pass is done
    var lo = t <= 0 ? 0 : t < 1 ? 0.9 : Math.max(0, 0.9 - (t - 1) * 3);
    c.line.style.opacity = lo.toFixed(3);
    c.line.style.transform = 'scaleX(' + clamp(xr / Math.max(1, c.W), 0, 1).toFixed(4) + ')';
    // the hairs: each one is cut when the blade reaches it, then falls under gravity, turning, and fades
    for (var i = 0; i < c.hairs.length; i++) {
      var h = c.hairs[i], x0 = h.at * c.W, f = (xr - x0) / (c.W * 0.32);
      if (f <= 0 || f >= 1) { if (h.k !== 'x') { h.el.style.opacity = 0; h.k = 'x'; } continue; }
      h.k = '';
      var y = 3 + 230 * f * f, x = x0 + h.drift * 46 * f, r = h.rot + h.spin * 220 * f;
      h.el.style.opacity = (f < 0.7 ? 0.95 : 0.95 * (1 - f) / 0.3).toFixed(3);
      h.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + r.toFixed(1) + 'deg)';
    }
    s.classList.toggle('open', t >= 0.42);
  }

  // ---------------------------------------------------------------- the scroll-linked pictures
  var pano = $('[data-pano-track]'), panoImg = pano && $('img', pano), heroPic = $('[data-hero-pic]'), hero = $('.hero');
  var drifts = $$('[data-drift] img');
  function tick() {
    var vh = innerHeight;
    if (still()) return;
    var rects = secs.map(function (s) { return s.getBoundingClientRect(); });
    for (var i = 0; i < secs.length; i++) {
      var top = rects[i].top, t = (vh * 0.92 - top) / (vh * 0.58);
      if (t < -0.3 && secs[i]._c.k === '-0.0100') continue;
      cut(secs[i], t);
    }
    var hr = hero.getBoundingClientRect();
    if (hr.bottom > 0) heroPic.style.transform = 'translate3d(0,' + (-hr.top * 0.22).toFixed(1) + 'px,0)';
    if (pano) {
      var pr = pano.getBoundingClientRect();
      if (pr.bottom > -50 && pr.top < vh + 50) {
        var p = clamp((vh - pr.top) / (vh + pr.height), 0, 1), over = Math.max(0, panoImg.offsetWidth - pano.clientWidth);
        panoImg.style.transform = 'translate3d(' + (-over * (rtl() ? 1 - p : p)).toFixed(1) + 'px,0,0)';
      }
    }
    drifts.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) return;
      var off = (r.top + r.height / 2 - vh / 2) / vh;
      img.style.transform = 'translate3d(0,' + (off * -34).toFixed(1) + 'px,0) scale(1.1)';
    });
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); } }, { passive: true });
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 120); });

  // ---------------------------------------------------------------- the motion switch
  var mt = $('[data-motion-toggle]');
  function setMotion(on, save) {
    root.classList.toggle('still', !on);
    mt.setAttribute('aria-checked', on ? 'true' : 'false');
    if (save) { store('motion', on ? 'on' : 'off'); delete root.dataset.motionAuto; }
    if (!on) {
      secs.forEach(function (s) { s.classList.add('open'); s._c.k = ''; });
      if (heroPic) heroPic.style.transform = '';
      if (panoImg) { panoImg.style.transform = ''; pano.scrollLeft = (panoImg.offsetWidth - pano.clientWidth) / 2; }
      drifts.forEach(function (img) { img.style.transform = ''; });
    } else { layout(); }
  }
  mt.addEventListener('click', function () { setMotion(still(), true); });

  // ---------------------------------------------------------------- the card run: keys, and which cards are on screen (their small pictures only move then)
  var run = $('[data-cards]'), cards = $$('.card', run);
  function runKeys() {
    var max = run.scrollWidth - run.clientWidth, x = Math.abs(run.scrollLeft);
    var prev = $('[data-run-step="-1"]'), next = $('[data-run-step="1"]');
    prev.disabled = x < 4; next.disabled = x > max - 4;
    $('.run-keys').style.display = max < 8 ? 'none' : '';
  }
  $$('[data-run-step]').forEach(function (b) {
    b.addEventListener('click', function () {
      var step = (cards[0].offsetWidth + 16) * +b.dataset.runStep * (rtl() ? -1 : 1);
      run.scrollBy({ left: step, behavior: still() ? 'auto' : 'smooth' });
    });
  });
  run.addEventListener('scroll', function () { requestAnimationFrame(runKeys); }, { passive: true });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('live', e.isIntersecting); }); }, { threshold: 0.55 });
    cards.forEach(function (c) { io.observe(c); });
    // the pole and the hero only animate while they are on screen
    var pio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.style.animationPlayState = ''; e.target.classList.toggle('offscreen', !e.isIntersecting); }); });
    $$('[data-pole]').forEach(function (p) { pio.observe(p); });
  } else cards.forEach(function (c) { c.classList.add('live'); });

  // ---------------------------------------------------------------- the razor bar steps aside while typing
  var bar = $('[data-razorbar]');
  $$('input[type="text"]').forEach(function (i) {
    i.addEventListener('focus', function () { bar.classList.add('hide'); });
    i.addEventListener('blur', function () { bar.classList.remove('hide'); });
  });

  // ---------------------------------------------------------------- start
  applyLang();
  mt.setAttribute('aria-checked', still() ? 'false' : 'true');
  if (still()) setMotion(false, false);
  layout(); runKeys();
  addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  setInterval(renderHours, 60000);
})();
