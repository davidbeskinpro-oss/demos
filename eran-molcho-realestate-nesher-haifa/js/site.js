(function () {
  var root = document.documentElement, WA = '972509700717';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'ערן מולכו · תיווך נדל״ן בנשר ובחיפה · שדרות מוריה 125', en: 'Eran Molcho · Real estate in Nesher & Haifa · 125 Moriya Ave' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור ערן מולכו - מתווך נדל"ן בעיר נשר וחיפה · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Eran Molcho, real-estate agent in Nesher & Haifa · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'ערן מולכו, תיווך נדל״ן', 'Eran Molcho, real estate');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-wa]', 'וואטסאפ לערן', 'WhatsApp Eran');
    aria('[data-t-call]', 'התקשרו לערן, 050-970-0717', 'Call Eran, 050-970-0717');
    aria('[data-t-word]', 'ערן מולכו', 'Eran Molcho');
    aria('[data-fp]', 'תוכנית דירה להמחשה', 'Illustrative flat plan');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: שדרות מוריה 125, חיפה' : 'Map: 125 Moriya Ave, Haifa'; });
    $$('[data-card]').forEach(function (c) { $('.c-name', c).textContent = c.dataset[l]; });
    $$('[data-decode]').forEach(function (d) { d.textContent = d.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('em-lang', l); } catch (e) {}
    texts(l); hours(); compose(true); fitWord(); ring.front = -1; layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('em-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $('[data-word]').classList.add('in');
    curtain(); ring.size(); layout(); lights.kick(); dots.kick(); ring.kick(); compose(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8, 21], 1: [8, 21], 2: [8, 21], 3: [8, 21], 4: [8, 21], 5: [8, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // consecutive days with the same hours share a row; the week starts on Sunday
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : 'Open 24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', i * 80 + 'ms'); }); });
  $$('.f-list [data-reveal]').forEach(function (t, i) { t.style.setProperty('--d', i * 60 + 'ms'); });
  $$('.pl-grid [data-reveal]').forEach(function (t, i) { t.style.setProperty('--d', i * 90 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- letters (headline, footer wordmark)
  function split(sp, start) {
    var i = start || 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  }
  $$('[data-split] > span[lang], [data-word] > span[lang]').forEach(function (sp) { split(sp); });

  // ---------------------------------------------------------------- glyph decode (labels settle out of scrambled letters)
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHJKLMNPRSTUVWXYZ' };
  function decode(el, text) {
    if (still()) { el.textContent = text; return; }
    var set = GL[he() ? 'he' : 'en'], t0 = performance.now(), dur = 700, id = (el._dc = (el._dc || 0) + 1);
    (function step(now) {
      if (el._dc !== id) return;
      var p = clamp((now - t0) / dur, 0, 1), n = Math.floor(text.length * p), out = text.slice(0, n);
      for (var k = n; k < text.length; k++) out += text[k] === ' ' ? ' ' : set[Math.floor(Math.random() * set.length)];
      el.textContent = out;
      if (p < 1) requestAnimationFrame(step); else el.textContent = text;
    })(t0);
  }
  $$('[data-decode]').forEach(function (d) { watch(d, function (v) { if (v) decode(d, d.dataset[root.lang]); }, { threshold: .6 }); });

  // ---------------------------------------------------------------- odometers (only the real numbers: 5.0 and 29)
  function odo(el, val) {
    var s = String(val);
    el.innerHTML = s.split('').map(function (c) {
      if (!/\d/.test(c)) return '<span class="oc">' + c + '</span>';
      // the digit column is drawn by CSS (::before), so the text of the page stays the real number
      return '<span class="od" aria-hidden="true"><span class="odi" data-d="' + c + '"></span></span>';
    }).join('') + '<span class="vh">' + s + '</span>';
    el.setAttribute('aria-label', s);
    var go = function () { $$('.odi', el).forEach(function (c, k) { c.style.transitionDelay = k * 120 + 'ms'; c.style.transform = 'translateY(-' + c.dataset.d + 'em)'; }); };
    if (still()) { $$('.odi', el).forEach(function (c) { c.style.transition = 'none'; }); go(); }
    else watch(el, function (v) { if (v) requestAnimationFrame(go); }, { threshold: .5 });
  }
  $$('[data-odo]').forEach(function (el) { el.style.lineHeight = '1'; el.style.display = 'inline-flex'; odo(el, el.dataset.odo); });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), dock = $('[data-dock]');

  // ---------------------------------------------------------------- the bay's own lit windows, glowing under the hand
  var lights = (function () {
    var cv = $('[data-lights]'), c = cv.getContext('2d'), img = $('[data-lightsrc]'), P = [], ok = false, w, h, raf = 0, vis = true, mx = -1, my = -1, lastMove = 0, flares = [];
    var sprite = document.createElement('canvas'); sprite.width = sprite.height = 32;
    (function () { var s = sprite.getContext('2d'), g = s.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,236,190,1)'); g.addColorStop(.25, 'rgba(255,196,110,.65)'); g.addColorStop(1, 'rgba(255,170,70,0)'); s.fillStyle = g; s.fillRect(0, 0, 32, 32); })();
    function sample() {
      try {
        var iw = 480, ih = Math.round(480 * img.naturalHeight / img.naturalWidth), sc = document.createElement('canvas'); sc.width = iw; sc.height = ih;
        var x = sc.getContext('2d'); x.drawImage(img, 0, 0, iw, ih);
        var d = x.getImageData(0, 0, iw, ih).data, pts = [];
        for (var y = 1; y < ih - 1; y++) for (var q = 1; q < iw - 1; q++) {
          var k = (y * iw + q) * 4, L = d[k] * .3 + d[k + 1] * .59 + d[k + 2] * .11;
          if (L > 150 && L >= d[k - 4] * .3 + d[k - 3] * .59 + d[k - 2] * .11 && L >= d[k + 4] * .3 + d[k + 5] * .59 + d[k + 6] * .11) pts.push([q / iw, y / ih, L / 255]);
        }
        var want = phone() ? 420 : 900, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) { var p = pts[Math.floor(f)]; P.push({ u: p[0], v: p[1], L: p[2], ph: Math.random() * 6.28, sp: .6 + Math.random() * 1.8, glow: 0 }); }
        ok = P.length > 0;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(t) {
      raf = 0; if (!ok || !vis || still()) { c.clearRect(0, 0, w, h); return; }
      var iw = img.naturalWidth, ih = img.naturalHeight, s = Math.max(w / iw, h / ih), dx = (w - iw * s) * .5, dy = (h - ih * s) * .7, T = t / 1000;
      // with no hand on it (phones, or a still mouse), a slow beam walks along the bay by itself
      var auto = t - lastMove > 2500, bx = auto ? w * (.5 + .42 * Math.sin(T * .35)) : mx, by = auto ? h * (.62 + .08 * Math.sin(T * .6)) : my, R = phone() ? 120 : 190;
      if (Math.random() < .05) flares.push({ p: P[Math.floor(Math.random() * P.length)], t: t });
      flares = flares.filter(function (f) { return t - f.t < 1600; });
      c.clearRect(0, 0, w, h); c.globalCompositeOperation = 'lighter';
      for (var i = 0; i < P.length; i++) {
        var p = P[i], x = dx + p.u * iw * s, y = dy + p.v * ih * s;
        var dd = Math.hypot(x - bx, y - by), near = dd < R ? 1 - dd / R : 0;
        p.glow = lerp(p.glow, near, .12);
        var a = (.18 + .22 * (.5 + .5 * Math.sin(T * p.sp + p.ph))) * p.L + p.glow * .75, z = 5 + p.L * 5 + p.glow * 14;
        c.globalAlpha = clamp(a, 0, 1); c.drawImage(sprite, x - z / 2, y - z / 2, z, z);
      }
      for (var k = 0; k < flares.length; k++) {
        var f = flares[k], e = (t - f.t) / 1600, fx = dx + f.p.u * iw * s, fy = dy + f.p.v * ih * s, fz = 10 + 26 * Math.sin(Math.PI * e);
        c.globalAlpha = Math.sin(Math.PI * e) * .9; c.drawImage(sprite, fx - fz / 2, fy - fz / 2, fz, fz);
      }
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; lastMove = performance.now(); });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    function init() { sample(); size(); kick(); }
    if (img.complete && img.naturalWidth) init(); else img.addEventListener('load', init);
    return { size: function () { if (ok) size(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- the key tag swings with the hand and the scroll
  var tag = (function () {
    var el = $('[data-tag]'), th = 16, om = 0, raf = 0, lastX = null, lastY = scrollY;
    function frame() {
      raf = 0; if (still()) { el.style.setProperty('--sw', '0deg'); return; }
      om += -th * .045 - om * .045; th += om;
      el.style.setProperty('--sw', th.toFixed(2) + 'deg');
      if (Math.abs(th) > .05 || Math.abs(om) > .05) raf = requestAnimationFrame(frame);
    }
    function push(v) { if (still() || !el.offsetParent) return; om = clamp(om + v, -5, 5); if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { if (lastX !== null) push((e.clientX - lastX) * .012); lastX = e.clientX; });
    addEventListener('scroll', function () { push((scrollY - lastY) * .01); lastY = scrollY; }, { passive: true });
    if (!still()) setTimeout(function () { if (!raf) raf = requestAnimationFrame(frame); }, 900);
    return { push: push };
  })();

  // pointer parallax on the hero photo and on Eran
  hero.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
    $('[data-hmove]').style.setProperty('--hx', (-nx * 14).toFixed(1) + 'px'); $('[data-hmove]').style.setProperty('--hy', (-ny * 10).toFixed(1) + 'px');
    $('[data-heran]').style.setProperty('--ex', (nx * 16).toFixed(1) + 'px');
  });

  // ---------------------------------------------------------------- Eran's own photo, assembling out of warm dots
  var dots = (function () {
    var box = $('[data-portrait]'), cv = $('[data-dots]'), c = cv.getContext('2d'), img = $('[data-dotsrc]'), D = [], ok = false, w, h, raf = 0, vis = false, prog = 0, mx = -999, my = -999, dis = 0, disT = 0, tapUntil = 0;
    function build() {
      try {
        var dpr = Math.min(2, devicePixelRatio || 1); w = box.clientWidth; h = box.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
        var cell = phone() ? 6 : 7, cols = Math.floor(w / cell), rows = Math.floor(h / cell), sc = document.createElement('canvas'); sc.width = cols; sc.height = rows;
        var x = sc.getContext('2d'); x.drawImage(img, 0, 0, cols, rows);
        var d = x.getImageData(0, 0, cols, rows).data; D = [];
        for (var y = 0; y < rows; y++) for (var q = 0; q < cols; q++) {
          var k = (y * cols + q) * 4, A = d[k + 3] / 255; if (A < .35) continue;
          var L = (d[k] * .3 + d[k + 1] * .59 + d[k + 2] * .11) / 255;
          var r = cell * .5 * clamp(.24 + Math.pow(L, .75) * .9, 0, 1);
          var R = Math.round(lerp(d[k], 255, .25)), G = Math.round(lerp(d[k + 1], 200, .2)), B = Math.round(lerp(d[k + 2], 120, .15));
          D.push({ hx: q * cell + cell / 2, hy: y * cell + cell / 2, r: r, col: 'rgb(' + R + ',' + G + ',' + B + ')', ox: (Math.random() - .5) * w * 1.4, oy: (Math.random() * .8 + .2) * h, dl: Math.random() * .35, px: 0, py: 0 });
        }
        ok = D.length > 0;
      } catch (e) { ok = false; }
    }
    function frame(t) {
      raf = 0; if (!ok) return;
      if (still()) { box.style.setProperty('--pv', 1); return; }
      var T = t / 1000, wantDis = (mx > -999 || t < tapUntil) ? 1 : 0;
      dis = lerp(dis, wantDis, .08);
      var pv = smooth((prog - .62) / .25) * (1 - dis * .9);
      box.style.setProperty('--pv', pv.toFixed(3));
      c.clearRect(0, 0, w, h);
      if (pv < .99) {
        c.globalAlpha = 1 - pv * .85;
        for (var i = 0; i < D.length; i++) {
          var p = D[i], a = smooth((prog - p.dl) / .45), x = p.hx + p.ox * (1 - a), y = p.hy + p.oy * (1 - a);
          var dx = x - mx, dy = y - my, d2 = dx * dx + dy * dy, push = d2 < 6400 ? (6400 - d2) / 6400 : 0;
          p.px = lerp(p.px, dx / Math.sqrt(d2 + 1) * push * 26, .18); p.py = lerp(p.py, dy / Math.sqrt(d2 + 1) * push * 26, .18);
          var wave = .82 + .18 * Math.sin(T * 2.2 - (p.hy / h) * 7);
          c.fillStyle = p.col; c.beginPath(); c.arc(x + p.px, y + p.py, Math.max(.6, p.r * wave * (.4 + .6 * a)), 0, 6.283); c.fill();
        }
        c.globalAlpha = 1;
      }
      if (vis) raf = requestAnimationFrame(frame);
    }
    box.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = box.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    box.addEventListener('pointerleave', function () { mx = my = -999; });
    box.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') return; var r = box.getBoundingClientRect(); tapUntil = performance.now() + 1400; mx = e.clientX - r.left; my = e.clientY - r.top; setTimeout(function () { mx = my = -999; }, 1400); });
    watch(box, function (v) { vis = v; kick(); }, { rootMargin: '100px' });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    function init() { build(); kick(); }
    if (img.complete && img.naturalWidth) init(); else { img.loading = 'eager'; img.addEventListener('load', init); }
    return { kick: kick, size: function () { if (img.naturalWidth) build(); }, set: function (p) { prog = p; }, box: box };
  })();

  // ---------------------------------------------------------------- the ring of real views: turns by itself, with the scroll and with a drag
  var ring = (function () {
    var stage = $('[data-stage]'), el = $('[data-ring]');
    // two rounds of the six views make one wide, gentle arc
    $$('[data-card]', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $$('img', k).forEach(function (i) { i.alt = ''; delete i.dataset.altHe; delete i.dataset.altEn; }); el.appendChild(k); });
    var cards = $$('[data-card]', el), N = cards.length, step = 360 / N;
    var base = 0, scrollA = 0, drag = null, vel = 0, raf = 0, vis = false, last = 0, self = { front: -1 };
    cards.forEach(function (c, i) { c.style.setProperty('--i', i); });
    function size() {
      var cw = phone() ? Math.min(innerWidth * .56, 250) : clamp(innerWidth * .22, 220, 340);
      el.style.setProperty('--cw', cw + 'px'); el.style.setProperty('--R', (cw * (phone() ? 1.95 : 2.15)) + 'px'); el.style.setProperty('--step', step + 'deg'); if (!still()) stage.style.height = Math.round(cw * 4 / 3 + (phone() ? 90 : 150)) + 'px'; else stage.style.height = '';
    }
    function apply() {
      var a = base + scrollA; el.style.setProperty('--a', a.toFixed(2) + 'deg');
      var best = 0, bd = 999;
      cards.forEach(function (c, i) {
        var ang = ((i * step + a) % 360 + 540) % 360 - 180, d = Math.abs(ang);
        c.style.setProperty('--lit', (.35 + .65 * Math.pow(Math.cos(d * Math.PI / 360), 6)).toFixed(3));
        if (d < bd) { bd = d; best = i; }
      });
      if (best !== self.front) { self.front = best; var n = $('.c-name', cards[best]); decode(n, cards[best].dataset[root.lang]); }
    }
    function frame(t) {
      raf = 0; if (still()) return;
      var dt = Math.min(50, t - (last || t)); last = t;
      if (!drag) { base += vel; vel *= .94; if (Math.abs(vel) < .02) base += dt * .006; }
      apply();
      if (vis) raf = requestAnimationFrame(frame); else last = 0;
    }
    stage.addEventListener('pointerdown', function (e) { if (still()) return; drag = { x: e.clientX, b: base, t: performance.now(), lx: e.clientX }; stage.setPointerCapture && stage.setPointerCapture(e.pointerId); });
    stage.addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - drag.x; base = drag.b + dx * .28; vel = (e.clientX - drag.lx) * .28; drag.lx = e.clientX; });
    var end = function () { drag = null; };
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
    watch(stage, function (v) { vis = v; kick(); });
    function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); }
    self.size = size; self.kick = kick; self.scroll = function (p) { scrollA = -p * 150; if (!raf) apply(); };
    size(); apply();
    return self;
  })();

  // ---------------------------------------------------------------- the live thing: key tags -> floor plan + WhatsApp message
  var S = { intent: 'buy', city: 'nesher', rooms: 4 };
  var CITY = { nesher: { he: 'נשר', en: 'Nesher' }, haifa: { he: 'חיפה', en: 'Haifa' } };
  function message() {
    var l = he(), c = CITY[S.city][l ? 'he' : 'en'], n = S.rooms;
    if (l) return 'היי ערן, הגעתי דרך האתר.\n' + (S.intent === 'buy' ? 'אנחנו מחפשים לקנות דירת ' + n + ' חדרים ב' + c + '. אפשר לדבר?' : S.intent === 'sell' ? 'יש לנו דירת ' + n + ' חדרים ב' + c + ' ואנחנו חושבים למכור אותה. אפשר לדבר?' : 'יש לי שאלה על נדל״ן ב' + c + '. אפשר לדבר?');
    return 'Hi Eran, I found you through the website.\n' + (S.intent === 'buy' ? 'We’re looking to buy a ' + n + '-room flat in ' + c + '. Can we talk?' : S.intent === 'sell' ? 'We have a ' + n + '-room flat in ' + c + ' and are thinking of selling it. Can we talk?' : 'I have a question about property in ' + c + '. Can we talk?');
  }
  var NSS = 'http://www.w3.org/2000/svg';
  function plan() {
    var svg = $('[data-fp]'), l = he(), b = S.rooms - 1, X = 20, Y = 20, W = 380, top = 112, Hh = 240, mid = Y + top, bot = Y + Hh;
    var o = [], seg = function (x1, y1, x2, y2, cls) { o.push('<path class="' + cls + ' draw" d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '"/>'); };
    var g = ''; for (var gx = 0; gx <= 420; gx += 20) g += '<path class="grid" d="M' + gx + ' 0V300"/>'; for (var gy = 0; gy <= 300; gy += 20) g += '<path class="grid" d="M0 ' + gy + 'H420"/>';
    var rooms = '', labels = '', bw = W / b;
    for (var i = 0; i < b; i++) {
      var x0 = X + i * bw;
      rooms += '<rect class="room" data-bed x="' + x0 + '" y="' + Y + '" width="' + bw + '" height="' + top + '"/>';
      labels += '<text x="' + (x0 + bw / 2) + '" y="' + (Y + top / 2 + 4) + '" text-anchor="middle">' + (l ? 'חדר' : (b > 3 ? 'Room' : 'Bedroom')) + '</text>';
      if (i) seg(x0, Y, x0, mid, 'inner');
      seg(x0, mid, x0 + 6, mid, 'inner'); seg(x0 + 30, mid, x0 + bw, mid, 'inner');
      o.push('<path class="door draw" d="M' + (x0 + 6) + ' ' + mid + 'A24 24 0 0 1 ' + (x0 + 30) + ' ' + (mid - 24) + 'M' + (x0 + 6) + ' ' + mid + 'V' + (mid - 24) + '"/>');
    }
    var sx = X + W * .56, kx = X + W * .84;
    rooms += '<rect class="room" x="' + X + '" y="' + mid + '" width="' + (sx - X) + '" height="' + (bot - mid) + '"/>';
    labels += '<text x="' + ((X + sx) / 2) + '" y="' + ((mid + bot) / 2 + 4) + '" text-anchor="middle">' + (l ? 'סלון' : 'Living') + '</text>';
    labels += '<text x="' + ((sx + kx) / 2) + '" y="' + ((mid + bot) / 2 + 4) + '" text-anchor="middle">' + (l ? 'מטבח' : 'Kitchen') + '</text>';
    labels += '<text x="' + ((kx + X + W) / 2) + '" y="' + (mid + 34) + '" text-anchor="middle">' + (l ? 'רחצה' : 'Bath') + '</text>';
    seg(sx, mid, sx, mid + 54, 'inner');
    seg(kx, mid, kx, mid + 64, 'inner'); seg(kx, mid + 90, kx, bot, 'inner');
    o.push('<path class="door draw" d="M' + kx + ' ' + (mid + 64) + 'A26 26 0 0 1 ' + (kx + 26) + ' ' + (mid + 90) + 'M' + kx + ' ' + (mid + 64) + 'H' + (kx + 26) + '"/>');
    // the outer walls, with the front door in the living room
    o.unshift('<path class="wall draw" d="M' + (X + 70) + ' ' + bot + 'H' + X + 'V' + Y + 'H' + (X + W) + 'V' + bot + 'H' + (X + 104) + '"/>');
    o.push('<path class="door draw" d="M' + (X + 70) + ' ' + bot + 'A34 34 0 0 1 ' + (X + 104) + ' ' + (bot - 34) + 'M' + (X + 70) + ' ' + bot + 'V' + (bot - 34) + '"/>');
    o.push('<path class="dim draw" d="M' + X + ' 278H' + (X + W) + 'M' + X + ' 272V284M' + (X + W) + ' 272V284"/>');
    svg.innerHTML = g + rooms + o.join('') + labels;
    $$('.draw', svg).forEach(function (p, k) { var L = Math.ceil(p.getTotalLength ? p.getTotalLength() : 600); p.style.setProperty('--len', L); p.style.setProperty('--dl', (k * 45) + 'ms'); });
    // the bedrooms light up one after another, like windows at dusk
    $$('[data-bed]', svg).forEach(function (r, k) { if (still()) r.classList.add('lit'); else setTimeout(function () { r.classList.add('lit'); }, 500 + k * 160); });
    var n = $('[data-fpn]'); n.textContent = S.rooms;
    if (!still() && n.animate) n.animate([{ transform: 'translateY(60%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.23,1,.32,1)' });
    $('[data-fpcap]').textContent = (l ? 'חדרים · ' : 'rooms · ') + CITY[S.city][l ? 'he' : 'en'] + (l ? ' · תוכנית להמחשה' : ' · illustrative plan');
  }
  var typing = 0;
  function compose(instant) {
    var txt = message(), bub = $('[data-bubble]'), id = ++typing;
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(txt);
    var hi = he() ? 'היי ערן, הגעתי דרך האתר.' : 'Hi Eran, I found you through the website.';
    $$('[data-wa]').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(hi); });
    $('[data-group="rooms"]').style.opacity = S.intent === 'ask' ? .45 : '';
    plan();
    if (instant || still()) { bub.textContent = txt; return; }
    var i = 0;
    (function tick() {
      if (id !== typing) return;
      i = Math.min(txt.length, i + 2);
      bub.innerHTML = ''; bub.appendChild(document.createTextNode(txt.slice(0, i)));
      var cr = document.createElement('span'); cr.className = 'caret'; bub.appendChild(cr);
      if (i < txt.length) setTimeout(tick, 22);
    })();
  }
  $$('.tag').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.dataset.k; S[k] = k === 'rooms' ? +b.dataset.v : b.dataset.v;
      $$('.tag[data-k="' + k + '"]').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      b.closest('.hooks').classList.add('set');
      b.classList.remove('swing'); void b.offsetWidth; b.classList.add('swing');
      compose();
    });
  });
  var planSeen = false;
  watch($('[data-plan]'), function (v) { if (v && !planSeen) { planSeen = true; compose(); } }, { threshold: .25 });

  // ---------------------------------------------------------------- reviews: a second copy so the row drifts without end
  (function () { var ul = $('[data-driftin]'); $$('li', ul).forEach(function (li) { var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.setAttribute('data-clone', ''); ul.appendChild(c); }); })();

  // ---------------------------------------------------------------- FAQ photo leans toward the hand
  (function () {
    var f = $('[data-tilt]');
    f.addEventListener('pointermove', function (e) { if (still() || e.pointerType !== 'mouse') return; var r = f.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5; f.style.setProperty('--ty', (nx * 8).toFixed(2) + 'deg'); f.style.setProperty('--tx', (-ny * 8).toFixed(2) + 'deg'); });
    f.addEventListener('pointerleave', function () { f.style.setProperty('--ty', '0deg'); f.style.setProperty('--tx', '0deg'); });
  })();

  // ---------------------------------------------------------------- bento: a soft light follows the hand (tap on phones)
  $$('[data-tile]').forEach(function (t) {
    var at = function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--x', (e.clientX - r.left) + 'px'); t.style.setProperty('--y', (e.clientY - r.top) + 'px'); t.classList.add('lit'); };
    t.addEventListener('pointermove', at); t.addEventListener('pointerdown', at);
    t.addEventListener('pointerleave', function () { t.classList.remove('lit'); });
  });

  // ---------------------------------------------------------------- footer: wordmark fitted to its width, curtain reveal
  var foot = $('[data-foot]'), word = $('[data-word]');
  function fitWord() {
    var sp = $('span[lang="' + root.lang + '"]', word); if (!sp) return;
    word.style.fontSize = '100px'; var avail = word.clientWidth, wd = sp.getBoundingClientRect().width || 1;
    word.style.fontSize = Math.min(100 * avail / wd * .98, innerHeight * .34) + 'px';
  }
  function curtain() { foot.classList.toggle('curtain', !still() && foot.offsetHeight <= innerHeight); }
  watch(word, function (v) { if (v) word.classList.add('in'); }, { threshold: .3 });

  // ---------------------------------------------------------------- one scroll loop
  var band = $('[data-band]'), bandIn = $('[data-bandin]'), places = $('[data-places]'), faqImg = $('[data-tilt]');
  var ticking = false;
  function layout() {
    ticking = false;
    root.style.setProperty('--cb', $('.concept').offsetHeight + 'px');
    var vh = innerHeight, calm = still();
    nav.classList.toggle('gathered', scrollY > 40);
    var hr = hero.getBoundingClientRect(), hp = clamp(-hr.top / (hr.height * .85), 0, 1);
    hero.style.setProperty('--c', calm ? 0 : smooth(hp).toFixed(4));
    $('[data-heran]').style.setProperty('--ey', calm ? '0px' : (hp * 90).toFixed(1) + 'px');
    if (dock) dock.classList.toggle('show', hr.bottom < vh * .55);
    var pr = dots.box.getBoundingClientRect();
    dots.set(calm ? 1 : clamp((vh - pr.top) / (vh * .55 + pr.height * .55), 0, 1));
    var br = band.getBoundingClientRect(), bp = clamp((vh - br.top) / (vh + br.height), 0, 1), iw = bandIn.firstElementChild.getBoundingClientRect().width;
    bandIn.style.setProperty('--bx', calm ? '0px' : ((rtl() ? 1 : -1) * bp * Math.max(0, iw - band.clientWidth)).toFixed(1) + 'px');
    var plr = places.getBoundingClientRect(); ring.scroll(calm ? 0 : clamp((vh - plr.top) / (vh + plr.height), 0, 1));
    var fr = faqImg.getBoundingClientRect(); faqImg.style.setProperty('--fz', calm ? 0 : clamp((vh - fr.top) / (vh + fr.height), 0, 1).toFixed(3));
    var mb = $('#main').getBoundingClientRect().bottom, fh = foot.offsetHeight;
    foot.style.setProperty('--fp', calm ? 1 : clamp((vh - mb) / fh, 0, 1).toFixed(3));
    if (!calm) dots.kick();
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(layout); } }
  addEventListener('scroll', onScroll, { passive: true });
  var rs; addEventListener('resize', function () { clearTimeout(rs); rs = setTimeout(function () { lights.size(); dots.size(); ring.size(); fitWord(); curtain(); layout(); }, 120); });

  texts(root.lang); hours(); compose(true); curtain(); layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitWord(); });
  fitWord();
})();
