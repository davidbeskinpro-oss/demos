(function () {
  'use strict';
  var root = document.documentElement, WA = '972559344246';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 700; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';
  var TITLE = { he: 'הודיה · ציפורניים ויופי · שדרות מוריה 30, חיפה', en: 'Hodaya · Nails & Beauty · 30 Moria Blvd, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור HODAYA NAILS – מכון יופי לציפורניים · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for HODAYA NAILS – Nails & Beauty · This is not the business’s official website' };

  // ------------------------------------------------------------ language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-wa]', 'וואטסאפ להודיה', 'WhatsApp Hodaya');
    aria('[data-t-call]', 'התקשרו לסטודיו, 055-934-4246', 'Call the studio, 055-934-4246');
    aria('[data-range]', 'שעה', 'Time');
    $$('[data-tags] .tag').forEach(function (t) { t.textContent = t.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('hd197-lang', l); } catch (e) {}
    texts(l); hours(); days(); ring.name(true); steps.label(true); write(true); layout();
  }
  $$('[data-lang-toggle]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ------------------------------------------------------------ motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('hd197-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-land]').forEach(function (el) { el.classList.add('in'); });
    $$('.odo').forEach(function (o) { odoSet(o, true); });
    layout(); kickAll(); write(true);
  }); });
  motionUI();

  // ------------------------------------------------------------ hours + live status (Haifa time). null = closed
  var H = { 0: [9, 19], 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var dayShortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], dayShortEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function is247() { for (var d = 0; d < 7; d++) if (!H[d] || H[d][0] !== 0 || H[d][1] !== 24) return false; return true; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (is247()) { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
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
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], ds = [], k; for (k = r[0]; k <= r[1]; k++) ds.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + ds.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ------------------------------------------------------------ entrances
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); });
  $$('.v-bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', i * 70 + 'ms'); });
  $$('[data-land]').forEach(function (t, i) { t.style.setProperty('--d', i * 120 + 'ms'); t.style.setProperty('--r', (i % 2 ? 3 : -3) + 'deg'); });
  $$('[data-reveal],[data-tile],[data-land]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter
  $$('[data-split] > span[lang]').forEach(function (sp) {
    sp.innerHTML = sp.textContent.split('').map(function (c, i) { return '<span class="ch" style="--i:' + i + '">' + c + '</span>'; }).join('');
  });

  // ------------------------------------------------------------ odometers (real figures only: 5.0 and 32)
  function odoBuild(o) {
    var v = o.dataset.odo; o.innerHTML = '<span class="vh">' + v + '</span>';
    v.split('').forEach(function (c) {
      if (!/\d/.test(c)) { var s = document.createElement('span'); s.textContent = c; s.setAttribute('aria-hidden', 'true'); o.appendChild(s); return; }
      var col = document.createElement('span'); col.className = 'col'; col.setAttribute('aria-hidden', 'true');
      var strip = document.createElement('i'); strip.dataset.d = c;
      col.appendChild(strip); o.appendChild(col);
    });
  }
  function odoSet(o, on) { $$('i', o).forEach(function (s, k) { s.style.transitionDelay = (k * 120) + 'ms'; s.style.transform = 'translateY(' + (on ? -s.dataset.d * 1.15 : 0) + 'em)'; }); }
  $$('.odo').forEach(function (o) { odoBuild(o); if (still() || !io) odoSet(o, true); else watch(o, function (v) { if (v) odoSet(o, true); }); });

  // ------------------------------------------------------------ flowers: fine gold line peonies, drawn as you arrive
  function flower(el, n) {
    var s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '-110 -110 220 220');
    var g = function (d, tr) { var p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('pathLength', '1'); if (tr) p.setAttribute('transform', tr); s.appendChild(p); return p; };
    g('M-6 40 C-14 70 -30 92 -58 108');                                    // stem
    g('M-22 76 C-48 66 -70 74 -84 92 C-60 98 -38 92 -22 76Z');              // leaf
    g('M-22 76 C-44 82 -62 84 -80 90');
    g('M-38 96 C-30 116 -12 124 8 120 C0 106 -18 96 -38 96Z');              // leaf
    var k, a;
    for (k = 0; k < n; k++) { a = k * 360 / n + 18; g('M0 0 C26 -14 34 -52 0 -76 C-34 -52 -26 -14 0 0Z', 'rotate(' + a + ')'); g('M0 -10 C8 -30 8 -48 0 -62', 'rotate(' + a + ')'); }
    for (k = 0; k < n; k++) { a = k * 360 / n; g('M0 0 C16 -10 20 -30 0 -44 C-20 -30 -16 -10 0 0Z', 'rotate(' + a + ')'); }
    for (k = 0; k < 7; k++) { var c = document.createElementNS(NS, 'circle'); a = k / 7 * Math.PI * 2; c.setAttribute('cx', (Math.cos(a) * 9).toFixed(1)); c.setAttribute('cy', (Math.sin(a) * 9).toFixed(1)); c.setAttribute('r', '2.2'); c.setAttribute('class', 'fc'); s.appendChild(c); }
    el.appendChild(s);
  }
  var flowers = $$('[data-flower]');
  flowers.forEach(function (f) { flower(f, +f.dataset.flower || 6); });

  // ------------------------------------------------------------ nav gathers into a pill
  var nav = $('[data-nav]');

  // ------------------------------------------------------------ WALK: through her door, into the studio
  var walk = $('[data-walk]'), stage = $('[data-stage]'), win = $('[data-win]'), door = $('[data-door]'), inside = $('[data-inside]'),
      studio = $('[data-studio]'), tags = $$('[data-tags] .tag'), incap = $('[data-incap]'), shelf = $('[data-shelf]'), shelfLines = $$('i', shelf),
      heroEl = $('[data-hero]'), cue = $('.scroll-cue'), slot = $('[data-slot]'), deal = $('[data-deal]');
  var DW = 844, DH = 1500, SW = 1600, SH = 1066;
  var GL = { x0: .39, x1: .742, y0: .367, y1: .82 }, DC = { x: .566, y: .594 };       // the glass door in her entrance photo
  var SHELF = { x0: .351, x1: .692, ys: [.474, .507, .539, .574] }, SHELF_F = { x: .52, y: .52 };
  var W = 0, Hh = 0, S = null;
  function cover(r, iw, ih, f) {
    var s = Math.max(r.w / iw, r.h / ih), x = r.x + r.w / 2 - f.x * iw * s, y = r.y + r.h / 2 - f.y * ih * s;
    x = clamp(x, r.x + r.w - iw * s, r.x); y = clamp(y, r.y + r.h - ih * s, r.y);
    return { x: x, y: y, s: s };
  }
  function slotRect() {
    var st = stage.getBoundingClientRect(), r = slot.getBoundingClientRect(), ty = heroShift;
    return { x: r.left - st.left, y: r.top - st.top - ty, w: r.width, h: r.height };
  }
  var heroShift = 0;
  function layoutWalk() {
    W = stage.clientWidth; Hh = stage.clientHeight;
    if (still()) {
      var r = slotRect();
      win.style.cssText = 'left:' + r.x + 'px;top:' + r.y + 'px;width:' + r.w + 'px;height:' + r.h + 'px';
      door.style.transform = ''; return;
    }
    win.style.cssText = '';
    S = slotRect();
  }
  var place = function (img, t) { img.style.transform = 'translate3d(' + t.x.toFixed(2) + 'px,' + t.y.toFixed(2) + 'px,0) scale(' + t.s.toFixed(5) + ')'; };
  var walkP = 0;
  function walkUpdate() {
    if (still() || !S) return;
    var r = walk.getBoundingClientRect(), span = walk.offsetHeight - Hh;
    var p = clamp(-r.top / span, 0, 1); walkP = p;
    var full = { x: 0, y: 0, w: W, h: Hh };
    // A: the arch opens to the full screen
    var a = smooth(p / .24);
    var cl = { x: lerp(S.x, 0, a), y: lerp(S.y, 0, a), w: lerp(S.w, W, a), h: lerp(S.h, Hh, a) };
    var rt = lerp(S.w / 2, 0, a), rb = lerp(26, 0, a);
    win.style.setProperty('--clip', 'inset(' + cl.y.toFixed(1) + 'px ' + (W - cl.x - cl.w).toFixed(1) + 'px ' + (Hh - cl.y - cl.h).toFixed(1) + 'px ' + cl.x.toFixed(1) + 'px round ' + rt.toFixed(1) + 'px ' + rt.toFixed(1) + 'px ' + rb.toFixed(1) + 'px ' + rb.toFixed(1) + 'px)');
    var c0 = cover(S, DW, DH, DC), c1 = cover(full, DW, DH, DC);
    var dt = { x: lerp(c0.x, c1.x, a), y: lerp(c0.y, c1.y, a), s: lerp(c0.s, c1.s, a) };
    heroShift = -60 * smooth(p / .14);
    heroEl.style.opacity = 1 - smooth(p / .12);
    heroEl.style.transform = 'translateY(' + heroShift + 'px)';
    heroEl.style.visibility = p > .14 ? 'hidden' : '';
    cue.style.opacity = p > .02 ? 0 : '';
    // B: the camera walks into the glass door; the studio opens out of it
    var b = smooth((p - .24) / .34);
    if (p > .24) {
      var gw = GL.x1 - GL.x0, gh = GL.y1 - GL.y0, gcx = (GL.x0 + GL.x1) / 2, gcy = (GL.y0 + GL.y1) / 2;
      var sB = Math.max(W / (gw * DW), Hh / (gh * DH)) * 1.08, s = c1.s * Math.pow(sB / c1.s, b);
      var fA = { x: c1.x + gcx * DW * c1.s, y: c1.y + gcy * DH * c1.s }, fx = lerp(fA.x, W / 2, b), fy = lerp(fA.y, Hh / 2, b);
      dt = { x: fx - gcx * DW * s, y: fy - gcy * DH * s, s: s };
    }
    place(door, dt);
    var gx0 = dt.x + GL.x0 * DW * dt.s, gx1 = dt.x + GL.x1 * DW * dt.s, gy0 = dt.y + GL.y0 * DH * dt.s, gy1 = dt.y + GL.y1 * DH * dt.s;
    inside.style.opacity = p > .24 ? clamp((p - .24) / .04, 0, 1) : 0;
    inside.style.clipPath = 'inset(' + Math.max(0, gy0).toFixed(1) + 'px ' + Math.max(0, W - gx1).toFixed(1) + 'px ' + Math.max(0, Hh - gy1).toFixed(1) + 'px ' + Math.max(0, gx0).toFixed(1) + 'px round ' + lerp(6, 0, b).toFixed(1) + 'px)';
    // C: inside, the camera drifts to the polish wall
    var c = smooth((p - .58) / .3), sc = cover(full, SW, SH, { x: .5, y: .5 });
    var zs = p < .58 ? lerp(1.22, 1, b) : lerp(1, phone() ? 1.18 : 1.32, c);
    var u0 = (W / 2 - sc.x) / (SW * sc.s), v0 = (Hh / 2 - sc.y) / (SH * sc.s), cc = p < .58 ? 0 : c;
    var u = lerp(u0, SHELF_F.x, cc), v = lerp(v0, SHELF_F.y, cc), st = { s: sc.s * zs };
    st.x = clamp(W / 2 - u * SW * st.s, W - SW * st.s, 0); st.y = clamp(Hh / 2 - v * SH * st.s, Hh - SH * st.s, 0);
    place(studio, st);
    var d = smooth((p - .88) / .1);
    studio.style.filter = d > 0 ? 'brightness(' + (1 - .82 * d).toFixed(3) + ')' : '';
    incap.style.opacity = clamp((p - .62) / .1, 0, 1) * (1 - d);
    incap.style.transform = 'translateY(' + (24 * (1 - smooth((p - .62) / .1))) + 'px)';
    tags.forEach(function (t, i) {
      var at = t.dataset.at.split(','), x = st.x + (+at[0]) * SW * st.s, y = st.y + (+at[1]) * SH * st.s;
      var ok = x > 70 && x < W - 70 && y > 90 && y < Hh * (phone() ? .6 : .72);
      t.style.left = x.toFixed(1) + 'px'; t.style.top = y.toFixed(1) + 'px';
      t.classList.toggle('on', ok && p > .62 + i * .05 && d < .5);
    });
    // D: the shelf's four lights stretch into the next room
    shelf.style.opacity = d;
    shelfLines.forEach(function (ln, k) {
      var y = st.y + SHELF.ys[k] * SH * st.s, x0 = st.x + SHELF.x0 * SW * st.s, x1 = st.x + SHELF.x1 * SW * st.s;
      var L = lerp(x0, -20, d), R = lerp(x1, W + 20, d);
      ln.style.transform = 'translate3d(' + L.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scaleX(' + ((R - L) / 100).toFixed(4) + ')';
    });
  }

  // opening: her photos dealt like cards into the arch; the door is the last card
  var dealt = false;
  function dealIn() {
    if (dealt) return; dealt = true;
    if (still() || !deal.animate) { root.classList.add('dealt'); return; }
    var r = S || slotRect(), imgs = $$('img', deal);
    imgs.forEach(function (im, i) {
      im.style.cssText = 'left:' + r.x + 'px;top:' + r.y + 'px;width:' + r.w + 'px;height:' + r.h + 'px';
      var rot = (i - 1.5) * 5;
      im.animate([
        { opacity: 0, transform: 'translate3d(' + ((i - 1.5) * 40) + 'px,' + (Hh * .7) + 'px,0) rotate(' + (rot * 3) + 'deg) scale(.86)' },
        { opacity: 1, transform: 'translate3d(0,0,0) rotate(' + rot + 'deg) scale(.96)', offset: .55 },
        { opacity: 1, transform: 'translate3d(0,0,0) rotate(' + (rot * .3) + 'deg) scale(.98)', offset: .8 },
        { opacity: 0, transform: 'translate3d(0,0,0) rotate(0deg) scale(1)' }
      ], { duration: 1250, delay: i * 90, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'both' });
    });
    win.animate([{ opacity: 0 }, { opacity: 0, offset: .55 }, { opacity: 1 }], { duration: 1350, easing: 'ease-out' });
  }

  // ------------------------------------------------------------ dust: the real logo's monogram in gold particles, then a drifting shimmer
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), pts = [], raf = 0, vis = true, t0 = 0, mx = -999, my = -999, w = 0, h = 0, targets = [];
    function sample(done) {
      var img = new Image(); img.onload = function () {
        try {
          var o = document.createElement('canvas'); o.width = 300; o.height = 300; var oc = o.getContext('2d'); oc.drawImage(img, 0, 0);
          var d = oc.getImageData(0, 0, 300, 300).data, out = [];
          for (var y = 30; y < 182; y += 3) for (var x = 88; x < 212; x += 3) { var k = (y * 300 + x) * 4; if (d[k + 3] > 100 && d[k] < 170) out.push([(x - 150) / 152, (y - 106) / 152]); }
          done(out);
        } catch (e) { done(null); }
      }; img.onerror = function () { done(null); }; img.src = 'img/logo.png';
    }
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = stage.clientWidth; h = stage.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function build(t) {
      var r = S || slotRect(), cx = r.x + r.w / 2, cy = r.y + r.h * .42, sc = Math.min(r.w * .9, r.h * .6);
      var src = t && t.length ? t : null, n = phone() ? 420 : 760; pts = [];
      for (var i = 0; i < n; i++) {
        var tg = src ? src[Math.floor(Math.random() * src.length)] : [Math.cos(i) * .4, Math.sin(i) * .5];
        pts.push({ x: Math.random() * w, y: Math.random() * h, tx: cx + tg[0] * sc + (Math.random() - .5) * 2, ty: cy + tg[1] * sc + (Math.random() - .5) * 2,
          vx: 0, vy: 0, r: .6 + Math.random() * 1.5, g: Math.random() < .7, a: .5 + Math.random() * .5, ph: Math.random() * 6.28, dl: Math.random() * 260 });
      }
    }
    function frame(ts) {
      raf = 0; if (still()) { c.clearRect(0, 0, w, h); return; }
      if (!t0) t0 = ts; var t = ts - t0;
      c.clearRect(0, 0, w, h);
      var fade = 1 - smooth(walkP / .5) * .75;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i], e;
        if (t < 1500) { e = smooth((t - p.dl) / 900); p.cx = lerp(p.x, p.tx, e); p.cy = lerp(p.y, p.ty, e); }
        else {
          if (!p.free) { p.free = 1; p.x = p.cx; p.y = p.cy; var an = Math.random() * 6.28, sp = .2 + Math.random() * .9; p.vx = Math.cos(an) * sp; p.vy = Math.sin(an) * sp - .3; }
          p.vx *= .985; p.vy = p.vy * .985 - .004; p.x += p.vx + Math.sin(t / 1400 + p.ph) * .15; p.y += p.vy;
          var dx = p.x - mx, dy = p.y - my, dd = dx * dx + dy * dy;
          if (dd < 9000) { var f = (1 - dd / 9000) * .9, ds = Math.sqrt(dd) || 1; p.vx += dx / ds * f; p.vy += dy / ds * f; }
          if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; p.vy = -.15 - Math.random() * .3; }
          if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
          p.cx = p.x; p.cy = p.y;
        }
        var tw = .55 + .45 * Math.sin(t / 600 + p.ph);
        c.fillStyle = (p.g ? 'rgba(169,127,74,' : 'rgba(148,80,91,') + (p.a * tw * fade * (t < 1500 ? 1 : .7)).toFixed(3) + ')';
        c.beginPath(); c.arc(p.cx, p.cy, p.r, 0, 6.283); c.fill();
      }
      if (vis) raf = requestAnimationFrame(frame);
    }
    stage.addEventListener('pointermove', function (e) { var r = stage.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    stage.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(stage, function (v) { vis = v; kick(); });
    function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); }
    return { start: function () { size(); sample(function (t) { targets = t; build(t); kick(); }); }, size: function () { size(); if (pts.length) build(targets); }, kick: kick };
  })();

  // ------------------------------------------------------------ ring of her work under the shelf light
  var ring = (function () {
    var wrap = $('[data-ringwrap]'), el = $('[data-ring]'), cards = $$('.rc', el), n = cards.length, step = 360 / n, nameEl = $('[data-cname]');
    var base = 0, drag = 0, dragging = false, lx = 0, vel = 0, raf = 0, vis = false, last = 0, front = -1, R = 400;
    function size() { var cw = cards[0].offsetWidth || 200; R = cw / (2 * Math.tan(Math.PI / n)) * 1.12; }
    function sectionP() { var r = wrap.getBoundingClientRect(); return clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1); }
    function draw() {
      var ang = base + drag + sectionP() * 160;
      el.style.transform = 'translateZ(' + (-R) + 'px) rotateY(' + ang + 'deg)';
      var best = 0, bi = 0;
      cards.forEach(function (cd, i) {
        var a = ((i * step + ang) % 360 + 360) % 360, cs = Math.cos(a * Math.PI / 180);
        var lift = cs > .9 ? (cs - .9) * 10 : 0;
        cd.style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + R + 'px) scale(' + (1 + lift * .08) + ') translateY(' + (-lift * 14) + 'px)';
        cd.style.filter = 'brightness(' + (0.45 + .55 * Math.max(0, cs)).toFixed(3) + ')';
        if (cs > best) { best = cs; bi = i; }
      });
      if (bi !== front) { if (front >= 0) cards[front].classList.remove('front'); front = bi; cards[bi].classList.add('front'); name(); }
    }
    function frame(ts) {
      raf = 0; var dt = last ? Math.min(50, ts - last) : 16; last = ts;
      if (!dragging) { base -= dt * .006; drag += vel; vel *= .94; }
      draw(); if (vis && !still()) raf = requestAnimationFrame(frame); else last = 0;
    }
    function kick() { if (!still() && !raf) raf = requestAnimationFrame(frame); }
    var GH = 'אבגדהוזחטיכלמנסעפצקרשת', GE = 'abcdefghijklmnopqrstuvwxyz';
    var decT = 0;
    function name(now) {
      if (front < 0) return; var target = cards[front].dataset[he() ? 'he' : 'en'];
      if (still() || now) { nameEl.textContent = target; return; }
      var t0 = performance.now(), G = he() ? GH : GE; cancelAnimationFrame(decT);
      (function tick() {
        var e = (performance.now() - t0) / 420, k = Math.floor(e * target.length);
        nameEl.textContent = target.split('').map(function (ch, i) { return i < k || ch === ' ' ? ch : G[Math.floor(Math.random() * G.length)]; }).join('');
        if (e < 1) decT = requestAnimationFrame(tick); else nameEl.textContent = target;
      })();
    }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; dragging = true; lx = e.clientX; vel = 0; wrap.setPointerCapture(e.pointerId); });
    wrap.addEventListener('pointermove', function (e) {
      if (dragging) { var dx = e.clientX - lx; lx = e.clientX; drag += dx * .25; vel = dx * .25; }
      var f = cards[front]; if (f) { var r = f.getBoundingClientRect(); f.style.setProperty('--sx', clamp((e.clientX - r.left) / r.width * 100, 0, 100) + '%'); }
    });
    var up = function () { dragging = false; }; wrap.addEventListener('pointerup', up); wrap.addEventListener('pointercancel', up);
    watch(wrap, function (v) { vis = v; kick(); });
    return { size: function () { if (still()) { cards.forEach(function (cd) { cd.style.transform = ''; cd.style.filter = ''; }); el.style.transform = ''; return; } size(); draw(); }, kick: kick, name: name, draw: draw };
  })();

  // ------------------------------------------------------------ ritual steps beside her work
  var steps = (function () {
    var sec = $('#ritual'), items = $$('[data-step]'), imgs = $$('.r-arch img'), arch = $('.r-arch'), lab = $('[data-rlabel]'), cur = 0, top = $('.arch-top');
    function set(i, force) {
      if (i === cur && !force) return; cur = i;
      items.forEach(function (li, k) { li.classList.toggle('on', k === i); });
      imgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
      if (!still()) { arch.classList.remove('shine'); void arch.offsetWidth; arch.classList.add('shine'); }
      label();
    }
    function label(now) {
      var t = $('b [lang="' + root.lang + '"]', items[cur]).textContent;
      if (still() || now) { lab.textContent = t; return; }
      var G = he() ? 'אבגדהוזחטיכלמנסעפצקרשת' : 'abcdefghijklmnopqrstuvwxyz', t0 = performance.now();
      (function tick() { var e = (performance.now() - t0) / 380, k = Math.floor(e * t.length); lab.textContent = t.split('').map(function (ch, i) { return i < k || ch === ' ' ? ch : G[Math.floor(Math.random() * G.length)]; }).join(''); if (e < 1) requestAnimationFrame(tick); else lab.textContent = t; })();
    }
    items.forEach(function (li, k) { $('button', li).addEventListener('click', function () { set(k); }); });
    function scroll() {
      var r = sec.getBoundingClientRect();
      top.style.setProperty('--ax', (0.55 + .45 * smooth((innerHeight - r.top) / (innerHeight * .7))).toFixed(3));
      if (still()) return;
      var p = clamp((innerHeight * .5 - r.top) / (r.height - innerHeight * .4), 0, .999);
      if (r.top < innerHeight * .5 && r.bottom > innerHeight * .4) set(Math.floor(p * items.length));
    }
    return { scroll: scroll, label: label };
  })();

  // ------------------------------------------------------------ bento spotlight (follows the hand; wanders by itself on touch)
  var bento = $('[data-bento]'), tiles = $$('.tile', bento), hover = matchMedia('(hover: hover)').matches, bentoVis = false, braf = 0;
  if (hover) bento.addEventListener('pointermove', function (e) {
    tiles.forEach(function (t) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); t.style.setProperty('--spot', 1); });
  });
  if (hover) bento.addEventListener('pointerleave', function () { tiles.forEach(function (t) { t.style.setProperty('--spot', 0); }); });
  function wander(ts) {
    braf = 0; if (still() || !bentoVis || hover) return;
    tiles.forEach(function (t, i) { var a = ts / 2600 + i * 1.7; t.style.setProperty('--mx', (50 + 38 * Math.cos(a)) + '%'); t.style.setProperty('--my', (45 + 30 * Math.sin(a * 1.3)) + '%'); t.style.setProperty('--spot', 1); });
    braf = requestAnimationFrame(wander);
  }
  watch(bento, function (v) { bentoVis = v; if (v && !braf) braf = requestAnimationFrame(wander); });

  // ------------------------------------------------------------ petals over the reviews
  var petals = (function () {
    var cv = $('[data-petals]'), c = cv.getContext('2d'), ps = [], raf = 0, vis = false, w, h, last = 0;
    var cols = ['rgba(148,80,91,.32)', 'rgba(244,233,226,.85)', 'rgba(217,152,154,.55)', 'rgba(226,189,132,.45)'];
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      ps = []; var n = phone() ? 14 : 26; for (var i = 0; i < n; i++) ps.push({ x: Math.random() * w, y: Math.random() * h, s: 6 + Math.random() * 10, r: Math.random() * 6.28, vr: (Math.random() - .5) * .02, vy: .25 + Math.random() * .45, ph: Math.random() * 6.28, col: cols[i % 4] }); }
    function frame(ts) {
      raf = 0; var dt = last ? Math.min(50, ts - last) / 16 : 1; last = ts; c.clearRect(0, 0, w, h);
      ps.forEach(function (p) {
        p.y += p.vy * dt; p.x += Math.sin(ts / 1500 + p.ph) * .45 * dt; p.r += p.vr * dt; if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; }
        c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.scale(1, .55 + .45 * Math.sin(ts / 900 + p.ph)); c.fillStyle = p.col;
        c.beginPath(); c.moveTo(0, -p.s); c.bezierCurveTo(p.s * .9, -p.s * .5, p.s * .7, p.s * .7, 0, p.s); c.bezierCurveTo(-p.s * .7, p.s * .7, -p.s * .9, -p.s * .5, 0, -p.s); c.fill(); c.restore();
      });
      if (vis && !still()) raf = requestAnimationFrame(frame); else last = 0;
    }
    watch(cv, function (v) { vis = v; kick(); });
    function kick() { if (!still() && !raf && vis) raf = requestAnimationFrame(frame); }
    return { size: size, kick: kick };
  })();

  // ------------------------------------------------------------ the appointment card (live thing)
  var TR = { he: ['לק ג׳ל', 'ג׳ל במבנה אנטומי', 'בנייה בג׳ל', 'פדיקור', 'עיצוב גבות ושעווה'], en: ['gel polish', 'anatomical gel', 'gel extensions', 'a pedicure', 'brows & waxing'] };
  var dayRow = $('[data-days]'), range = $('[data-range]'), bead = $('[data-bead]'), dfill = $('[data-dfill]'), dtime = $('[data-dtime]'), msg = $('[data-msg]'), send = $('[data-send]');
  dfill.setAttribute('pathLength', '1');
  var pickDay = null;
  function days() {
    var n = now(), l = he();
    if (pickDay === null) { var d = n.d, k = 0; if (!H[d] || n.h >= H[d][1] - 1) { d = (d + 1) % 7; while (!H[d] && k++ < 7) d = (d + 1) % 7; } pickDay = d; }
    var html = '';
    for (var d2 = 0; d2 < 7; d2++) {
      html += '<label><input type="radio" name="d" value="' + d2 + '"' + (d2 === pickDay ? ' checked' : '') + (H[d2] ? '' : ' disabled') + '><span class="dd">' + (l ? dayShortHe : dayShortEn)[d2] + (H[d2] ? '' : '<small>' + (l ? 'סגור' : 'closed') + '</small>') + '</span></label>';
    }
    dayRow.innerHTML = html;
  }
  function slots() { var t = H[pickDay] || [9, 19], out = []; for (var x = t[0]; x <= t[1] - 1; x += .5) out.push(x); return out; }
  function dial() {
    var v = +range.value / 100, s = slots(), tm = s[Math.round(v * (s.length - 1))];
    var a = Math.PI - v * Math.PI, box = range.getBoundingClientRect(), k = box.width / 300 || 1;
    bead.style.transform = 'translate(' + ((150 + 130 * Math.cos(a)) * k).toFixed(1) + 'px,' + ((150 - 130 * Math.sin(a)) * k).toFixed(1) + 'px)';
    dfill.style.setProperty('--df', (1 - v).toFixed(3));
    dtime.textContent = hhmm(tm);
    return tm;
  }
  var typeT = 0, lastPlain = '';
  function write(now) {
    var l = he() ? 'he' : 'en', t = +($('input[name="t"]:checked') || { value: 0 }).value, tm = dial();
    var dn = (l === 'he' ? dayHe : dayEn)[pickDay], tr = TR[l][t];
    var parts = l === 'he'
      ? [['היי הודיה, אשמח לקבוע תור ל', 0], [tr, 1], [' ביום ', 0], [dn, 1], [', בסביבות ', 0], [hhmm(tm), 1], ['. תודה!', 0]]
      : [['Hi Hodaya, I’d like to book ', 0], [tr, 1], [' on ', 0], [dn, 1], [', around ', 0], [hhmm(tm), 1], ['. Thank you!', 0]];
    var plain = parts.map(function (p) { return p[0]; }).join('');
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(plain);
    var render = function (n) {
      var out = '', left = n;
      parts.forEach(function (p) { if (left <= 0) return; var s = p[0].slice(0, left); left -= p[0].length; s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); out += p[1] ? '<b>' + s + '</b>' : s; });
      return out;
    };
    clearInterval(typeT);
    if (still() || now === true) { msg.innerHTML = render(plain.length); lastPlain = plain; return; }
    var i = 0; while (i < plain.length && i < lastPlain.length && plain[i] === lastPlain[i]) i++;
    lastPlain = plain;
    typeT = setInterval(function () { i += 1; msg.innerHTML = render(i) + (i < plain.length ? '<span class="caret"></span>' : ''); if (i >= plain.length) clearInterval(typeT); }, 22);
  }
  $$('input[name="t"]').forEach(function (r) { r.addEventListener('change', function () { write(); }); });
  dayRow.addEventListener('change', function (e) { pickDay = +e.target.value; write(); });
  range.addEventListener('input', function () { write(); });
  $$('[data-wa-plain]').forEach(function (a) { a.addEventListener('click', function () { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(he() ? 'היי הודיה, אשמח לקבוע תור' : 'Hi Hodaya, I’d like to book an appointment'); }); });
  var bookSeen = false; watch($('[data-appt]'), function (v) { if (v && !bookSeen) { bookSeen = true; lastPlain = ''; write(); } });

  // ------------------------------------------------------------ close: her door shrinks back into the arch
  var close = $('[data-close]'), clwin = $('[data-clwin]');
  function closeUpdate() {
    if (still()) { clwin.style.removeProperty('--cc'); return; }
    var r = close.getBoundingClientRect(), vh = innerHeight, q = smooth(clamp(-r.top / (close.offsetHeight - vh) , 0, 1) * 1.15);
    var aw = Math.min(360, innerWidth * .7), ah = Math.min(vh * .7, aw * 1.4), ww = clwin.clientWidth, hh = clwin.clientHeight;
    var ix = lerp(0, (ww - aw) / 2, q), iy = lerp(0, (hh - ah) / 2, q), rt = lerp(0, aw / 2, q), rb = lerp(0, 26, q);
    clwin.style.setProperty('--cc', 'inset(' + iy.toFixed(1) + 'px ' + ix.toFixed(1) + 'px ' + iy.toFixed(1) + 'px ' + ix.toFixed(1) + 'px round ' + rt.toFixed(1) + 'px ' + rt.toFixed(1) + 'px ' + rb + 'px ' + rb + 'px)');
    clwin.style.setProperty('--cs', (1.12 - .12 * q).toFixed(4));
  }

  // ------------------------------------------------------------ flowers draw with scroll
  function flowersUpdate() {
    if (still()) { flowers.forEach(function (f) { f.style.removeProperty('--draw'); }); return; }
    flowers.forEach(function (f) { var r = f.getBoundingClientRect(); if (r.bottom < -50 || r.top > innerHeight + 50) return; f.style.setProperty('--draw', (1 - smooth((innerHeight - r.top) / (innerHeight * .6 + r.height * .5))).toFixed(3)); });
  }

  // ------------------------------------------------------------ scroll loop
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      nav.classList.toggle('pill', scrollY > 40);
      walkUpdate(); steps.scroll(); closeUpdate(); flowersUpdate();
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  function layout() { layoutWalk(); walkUpdate(); dust.size(); ring.size(); petals.size(); dial(); closeUpdate(); flowersUpdate(); steps.scroll(); }
  function kickAll() { dust.kick(); ring.kick(); petals.kick(); if (!braf && bentoVis) braf = requestAnimationFrame(wander); }
  var rz = 0; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });

  // ------------------------------------------------------------ start
  texts(root.lang); hours(); days();
  layout(); write(true); steps.label(true);
  function go() {
    layoutWalk(); walkUpdate();
    document.body.classList.add('ready');
    dust.start(); dealIn(); ring.kick(); onScroll();
  }
  if (document.fonts && document.fonts.ready) { var once = false, g = function () { if (!once) { once = true; go(); } }; document.fonts.ready.then(g); setTimeout(g, 700); } else go();
})();
