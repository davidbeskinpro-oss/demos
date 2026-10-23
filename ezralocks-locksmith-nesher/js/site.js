(function () {
  'use strict';
  var root = document.documentElement, WA = '972525230133';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var easeOut = function (t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); };
  var easeIn = function (t) { t = clamp(t, 0, 1); return t * t * t; };
  var span = function (v, a, b) { return clamp((v - a) / (b - a), 0, 1); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';
  var mk = function (tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

  var TITLE = { he: 'מנעולן EzraLocks · ישראל עזרא · השיטה 9, נשר', en: 'EzraLocks Locksmith · Israel Ezra · 9 HaShita St, Nesher' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור מנעולן EzraLocks · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for EzraLocks Locksmith · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'מנעולן EzraLocks', 'EzraLocks Locksmith');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'להתקשר לישראל, 052-523-0133', 'Call Israel, 052-523-0133');
    aria('[data-t-rate]', '5.0 בגוגל, 75 ביקורות', '5.0 on Google, 75 reviews');
    aria('[data-t-cyl]', 'חתך של צילינדר: מפתח נכנס, הפינים מתיישרים והגליל מסתובב', 'Cut-away of a cylinder: a key goes in, the pins line up and the plug turns');
    aria('[data-t-door]', 'דלת רכב: כרית אוויר, מרווח, מוט וכפתור הפתיחה', 'A car door: air wedge, gap, rod and the unlock button');
    aria('[data-t-pump]', 'ללחוץ על המשאבה: לשלב הבא', 'Squeeze the pump: next step');
    aria('[data-t-prev]', 'לשלב הקודם', 'Previous step');
    aria('[data-t-next]', 'לשלב הבא', 'Next step');
    aria('[data-t-keybar]', 'יצירת קשר מהירה', 'Quick contact');
    aria('[data-motion-toggle]', 'אנימציות', 'Animations');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: השיטה 9, נשר' : 'Map: 9 HaShita St, Nesher'; });
    var w = $('[data-where]'); if (w) w.placeholder = l === 'he' ? 'נשר, רמות רמז…' : 'Nesher, Ramot Remez…';
    $$('[data-decode]').forEach(function (el) { el.textContent = el.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ez-lang', l); } catch (e) {}
    texts(l); hours(); compose(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('ez-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $('[data-mast]').classList.remove('deal');
    sparks.reset(); layout(); living.kick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed, [0,24] = all day
  var H = { 0: [0, 24], 1: [0, 24], 2: [0, 24], 3: [0, 24], 4: [0, 24], 5: [0, 24], 6: [0, 24] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { x = x % 24; var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  var allDay = function (t) { return t && t[0] === 0 && t[1] >= 24; };
  function now() {
    var o = {};
    try { new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); }
    catch (e) { var d = new Date(); return { d: d.getDay(), h: d.getHours() + d.getMinutes() / 60 }; }
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    var every = [0, 1, 2, 3, 4, 5, 6].every(function (d) { return allDay(H[d]); });
    if (every) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות, כל השבוע' : 'Open now · 24 hours, all week'; }
    else if (allDay(t)) { open = true; txt = l ? 'פתוח עכשיו · כל היום' : 'Open now · all day'; }
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
      var val = !t ? (l ? 'סגור' : 'Closed') : allDay(t) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- reveals
  var revealIO = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el, i) {
    if (el.hasAttribute('data-tile')) { var sib = [].indexOf.call(el.parentNode.children, el); el.style.setProperty('--td', (sib % 4) * 80 + 'ms'); }
    if (revealIO) revealIO.observe(el); else el.classList.add('in');
  });

  // ---------------------------------------------------------------- nav gathers into a pill
  var nav = $('[data-nav]');
  function navState() { nav.classList.toggle('pill', scrollY > 40); }

  // ---------------------------------------------------------------- opening: his photos are dealt from the middle of the band
  var mast = $('[data-mast]');
  function deal() {
    if (still()) return;
    var mr = mast.getBoundingClientRect(), cx = mr.left + mr.width / 2, cy = mr.top + mr.height / 2;
    $$('[data-deal]', mast).forEach(function (c) {
      var r = c.getBoundingClientRect(), d = +c.dataset.deal;
      c.style.setProperty('--dx', (cx - (r.left + r.width / 2)) + 'px');
      c.style.setProperty('--dy', (cy - (r.top + r.height / 2)) + 'px');
      c.style.setProperty('--rot', ((d % 2 ? -1 : 1) * (4 + d * 2)) + 'deg');
      c.style.setProperty('--d', d - 1);
    });
    mast.classList.add('deal');
    setTimeout(function () { mast.classList.remove('deal'); }, 1800);
  }

  // ---------------------------------------------------------------- odometer + counters
  function odo(el) {
    var v = el.dataset.odo; el.innerHTML = '<span class="vh">' + v + '</span>';
    v.split('').forEach(function (ch, i) {
      if (!/\d/.test(ch)) { var s = document.createElement('span'); s.className = 'odo-sep'; s.setAttribute('aria-hidden', 'true'); s.dataset.ch = ch; el.appendChild(s); return; }
      var dg = document.createElement('span'); dg.className = 'dg'; dg.setAttribute('aria-hidden', 'true');
      var col = document.createElement('span'), n = +ch, seq = [];
      for (var k = 0; k <= 10 + n; k++) seq.push(k % 10);
      col.dataset.seq = seq.join('\n'); dg.appendChild(col); el.appendChild(dg);
      var target = 10 + n;
      if (still()) { col.style.transition = 'none'; col.style.transform = 'translateY(-' + target + 'em)'; return; }
      col.style.transitionDelay = (i * 120) + 'ms';
      watch(el, function (vis) { if (vis) requestAnimationFrame(function () { col.style.transform = 'translateY(-' + target + 'em)'; }); });
    });
  }
  $$('[data-odo]').forEach(odo);

  // ---------------------------------------------------------------- glyph-decode labels
  function decode(el) {
    if (still()) return;
    var final = el.textContent, glyphs = he() ? 'אבגדהוזחטיכלמנסעפצקרשת' : 'ABCDEFGHKLMNOPRSTUVWXZ', t0 = performance.now();
    (function step(t) {
      var p = (t - t0) / 700, out = '';
      for (var i = 0; i < final.length; i++) out += (i / final.length < p || final[i] === ' ' || final[i] === '·') ? final[i] : glyphs[(Math.random() * glyphs.length) | 0];
      el.textContent = out;
      if (p < 1.05) requestAnimationFrame(step); else el.textContent = final;
    })(t0);
  }

  // ---------------------------------------------------------------- the logo, rebuilt from sparks (points sampled from his real logo file)
  var sparks = (function () {
    var tile = $('.c-spark'), cv = $('[data-sparks]'), P = window.LOGO_PTS, ctx, W, Hh, dpr, parts = [], embers = [], raf = 0, vis = true, t0 = 0, mx = -999, my = -999, burstAt = 0;
    if (!cv || !P || !cv.getContext) return { reset: function () { if (tile) tile.classList.add('done'); }, start: function () {} };
    ctx = cv.getContext('2d');
    var pts = [];
    for (var i = 0; i < P.d.length; i += 3) pts.push([P.d.charCodeAt(i) - 48, P.d.charCodeAt(i + 1) - 48, P.pal[P.d.charCodeAt(i + 2) - 48]]);
    function size() {
      var r = tile.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = r.width; Hh = r.height;
      cv.width = W * dpr; cv.height = Hh * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var sc = Math.min(W * .7 / P.w, Hh * .66 / P.h), ox = (W - P.w * sc) / 2, oy = (Hh - P.h * sc) / 2 - Hh * .02;
      parts = pts.map(function (p, k) {
        var old = parts[k];
        return { hx: ox + p[0] * sc, hy: oy + p[1] * sc, x: old ? old.x : Math.random() * W, y: old ? old.y : Hh + Math.random() * Hh * .6, vx: 0, vy: 0, c: p[2], s: Math.max(1.2, sc * .62), d: Math.random() };
      });
    }
    function ember() { return { x: Math.random() * W, y: Hh + 10, vy: -(0.25 + Math.random() * .7), vx: (Math.random() - .5) * .3, life: 0, max: 160 + Math.random() * 160, r: .8 + Math.random() * 1.8 }; }
    function frame(t) {
      raf = 0; if (!vis || still()) return;
      if (!t0) t0 = t;
      var age = t - t0, form = smooth(age / 1300);
      ctx.clearRect(0, 0, W, Hh);
      var burst = Math.max(0, 1 - (t - burstAt) / 900);
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], k = .06 + form * .1;
        var tx = p.hx + Math.sin(t / 900 + p.d * 9) * .6, ty = p.hy + Math.cos(t / 1100 + p.d * 7) * .6;
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 3600) { var f = (3600 - d2) / 3600 * 2.2; p.vx += dx / 60 * f; p.vy += dy / 60 * f; }
        if (burst > 0) { p.vx += (Math.random() - .5) * 6 * burst; p.vy += (Math.random() - .7) * 6 * burst; }
        p.vx = (p.vx + (tx - p.x) * k * .5) * .78; p.vy = (p.vy + (ty - p.y) * k * .5) * .78;
        p.x += p.vx; p.y += p.vy;
        ctx.fillStyle = p.c; ctx.globalAlpha = .55 + .45 * form;
        ctx.fillRect(p.x, p.y, p.s, p.s);
      }
      // rising embers from the bottom of the tile
      if (embers.length < 34 && Math.random() < .5) embers.push(ember());
      for (var j = embers.length - 1; j >= 0; j--) {
        var e = embers[j]; e.life++; e.x += e.vx + Math.sin((e.life + j * 20) / 30) * .25; e.y += e.vy;
        var a = Math.sin(Math.PI * e.life / e.max);
        ctx.globalAlpha = a * .9; ctx.fillStyle = e.life % 40 < 20 ? '#f5b743' : '#f07a32';
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, 6.283); ctx.fill();
        if (e.life > e.max) embers.splice(j, 1);
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      if (age > 1500) tile.classList.add('done');
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && vis && !still()) raf = requestAnimationFrame(frame); }
    tile.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; if (fine) tile.classList.remove('done'); });
    tile.addEventListener('pointerleave', function () { mx = my = -999; setTimeout(function () { tile.classList.add('done'); }, 500); });
    tile.addEventListener('pointerdown', function () { burstAt = performance.now(); tile.classList.remove('done'); setTimeout(function () { tile.classList.add('done'); }, 1400); });
    watch(tile, function (v) { vis = v; kick(); });
    return {
      start: function () { size(); kick(); },
      resize: function () { size(); },
      reset: function () { if (still()) { ctx.clearRect(0, 0, W || 0, Hh || 0); tile.classList.add('done'); } else { t0 = 0; tile.classList.remove('done'); size(); kick(); } }
    };
  })();

  // ---------------------------------------------------------------- hero photo follows the hand (desktop); drifts with scroll (touch)
  var heroCell = $('[data-tilt]'), heroImg = heroCell && $('img', heroCell);
  if (heroCell && fine) {
    heroCell.addEventListener('pointermove', function (e) {
      if (still()) return;
      var r = heroCell.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      heroImg.style.transform = 'scale(1.12) translate(' + (-x * 22) + 'px,' + (-y * 16) + 'px)';
    });
    heroCell.addEventListener('pointerleave', function () { heroImg.style.transform = ''; });
  }

  // ---------------------------------------------------------------- SIGNATURE: dive into the keyhole
  var dive = $('[data-dive]'), stage = dive && $('.dive-stage', dive), dPhoto = $('[data-dive-photo]'), dGlow = $('[data-dive-glow]'), dCopy = $('[data-dive-copy]'), pinsEl = $('[data-pins]');
  // the plug face of the cylinder in escutcheon.jpg (1200 x 1600): centre and radii, measured on the photo
  var KH = { w: 1200, h: 1600, x: 613, y: 836, rx: 93, ry: 68 };
  var cover = { W: 0, H: 0, X: 0, Y: 0 };
  function diveSize() {
    if (!stage) return;
    var vw = stage.clientWidth, vh = stage.clientHeight, s = Math.max(vw / KH.w, vh / KH.h);
    cover.W = KH.w * s; cover.H = KH.h * s;
    // keep the cylinder a bit off-centre towards the page's end side so the heading has room
    var want = vw * (rtl() ? .34 : .66);
    if (phone()) want = vw * .5;
    var X = want - KH.x * s; X = clamp(X, vw - cover.W, 0);
    cover.X = X; cover.Y = (vh - cover.H) / 2;
    dPhoto.style.width = cover.W + 'px'; dPhoto.style.height = cover.H + 'px';
  }
  function diveDraw() {
    if (!dive) return;
    if (still()) { dPhoto.style.transform = ''; pinsEl.style.clipPath = ''; dCopy.style.opacity = ''; stage.style.setProperty('--scrim', 1); return; }
    var r = dive.getBoundingClientRect(), vh = stage.clientHeight, vw = stage.clientWidth;
    var p = clamp(-r.top / (r.height - vh), 0, 1);
    var z = span(p, .06, .42);
    var kx0 = cover.X + KH.x * cover.W / KH.w, ky0 = cover.Y + KH.y * cover.H / KH.h;
    var rx0 = KH.rx * cover.W / KH.w, ry0 = KH.ry * cover.H / KH.h;
    // scale needed for the plug-face ellipse to swallow the whole screen
    var cx = vw / 2, cy = vh / 2, need = 0;
    [[0, 0], [vw, 0], [0, vh], [vw, vh]].forEach(function (c) { var dx = (c[0] - cx) / rx0, dy = (c[1] - cy) / ry0; need = Math.max(need, Math.sqrt(dx * dx + dy * dy)); });
    need *= 1.04;
    var ez = smooth(z), s = Math.exp(Math.log(need) * easeIn(z) * .55 + Math.log(need) * smooth(z) * .45);
    var kx = lerp(kx0, cx, ez), ky = lerp(ky0, cy, ez);
    var tx = kx - s * (KH.x * cover.W / KH.w), ty = ky - s * (KH.y * cover.H / KH.h);
    dPhoto.style.transform = 'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0) scale(' + s.toFixed(4) + ')';
    // warm light behind the keyhole as you approach
    var g = span(p, .02, .16) * (1 - span(z, .5, .9));
    dGlow.style.opacity = g.toFixed(3);
    var gw = rx0 * s * 2.6, gh = ry0 * s * 2.6;
    dGlow.style.transform = 'translate3d(' + (kx - gw / 2).toFixed(1) + 'px,' + (ky - gh / 2).toFixed(1) + 'px,0) scale(' + (gw / 10).toFixed(3) + ',' + (gh / 10).toFixed(3) + ')';
    var fade = 1 - span(z, 0, .28);
    dCopy.style.opacity = fade.toFixed(3); dCopy.style.transform = 'translateY(' + (-(1 - fade) * 30).toFixed(1) + 'px)';
    stage.style.setProperty('--scrim', fade.toFixed(3));
    // the scene inside: exactly the plug face's ellipse, scaled with the photo, so no seam ever shows
    if (z >= 1) pinsEl.style.clipPath = 'none';
    else pinsEl.style.clipPath = 'ellipse(' + (rx0 * s).toFixed(1) + 'px ' + (ry0 * s).toFixed(1) + 'px at ' + kx.toFixed(1) + 'px ' + ky.toFixed(1) + 'px)';
    pinsEl.style.opacity = z <= 0 ? 0 : smooth(span(z, 0, .12)).toFixed(3);
    pins.draw(span(p, .44, .96));
  }

  // ---------------------------------------------------------------- the pin-tumbler cut-away
  var pins = (function () {
    var svg = $('.cyl'); if (!svg) return { draw: function () {}, step: function () {} };
    var CX = [250, 360, 470, 580, 690], LK = [44, 62, 36, 54, 48], LD = 56, REST = 306, SHEAR = 214, TOP = 72, TIP = 780;
    var chambers = $('[data-chambers]', svg), set = $('[data-pinset]', svg), blade = $('[data-key-blade]', svg), key = $('[data-key]', svg), bolt = $('[data-bolt]', svg), shear = $('[data-shear]', svg), face = $('[data-face]'), lines = $('[data-plug-lines]', svg);
    var steps = $$('[data-pin-steps] li');
    CX.forEach(function (x) { mk('rect', { x: x - 21, y: TOP, width: 42, height: 236, rx: 6 }, chambers); });
    for (var i = 0; i < 9; i++) mk('line', { x1: 96, x2: 816, y1: 226 + i * 15, y2: 226 + i * 15 }, lines);
    var els = CX.map(function () {
      var g = mk('g', {}, set);
      return {
        spring: mk('path', { fill: 'none', stroke: '#c9ced0', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g),
        driver: mk('rect', { width: 34, height: LD, rx: 5, fill: 'url(#g-pinsteel)', stroke: '#3f4548', 'stroke-width': 1.5 }, g),
        keypin: mk('path', { fill: 'url(#g-brassx)', stroke: '#6a4a1c', 'stroke-width': 1.5 }, g)
      };
    });
    // key bitting: valleys under each chamber so each key pin's top lands exactly on the shear line
    var prof = [[96, 246]];
    CX.forEach(function (x, i) {
      var v = SHEAR + LK[i];
      if (i > 0) { var pv = SHEAR + LK[i - 1]; prof.push([(CX[i - 1] + x) / 2, Math.min(pv, v) - 16]); }
      prof.push([x - 7, v], [x + 7, v]);
    });
    prof.push([CX[4] + 34, SHEAR + LK[4] - 12], [TIP - 14, 282], [TIP, 300]);
    function P(x) {
      if (x <= prof[0][0]) return prof[0][1];
      for (var i = 1; i < prof.length; i++) if (x <= prof[i][0]) { var a = prof[i - 1], b = prof[i]; return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); }
      return 999;
    }
    var bladeD = 'M-90 262 L96 262 L96 ' + prof[0][1] + ' ' + prof.map(function (q) { return 'L' + q[0] + ' ' + q[1].toFixed(1); }).join(' ') + ' L' + TIP + ' 322 L-90 322 Z';
    blade.setAttribute('d', bladeD);
    function springD(x, y0, y1) {
      var n = 7, h = (y1 - y0) / n, d = 'M' + x + ' ' + y0;
      for (var i = 0; i < n; i++) d += ' L' + (x + (i % 2 ? -13 : 13)) + ' ' + (y0 + h * (i + .5)).toFixed(1);
      return d + ' L' + x + ' ' + y1.toFixed(1);
    }
    var last = -1;
    function draw(q) {
      var ins = easeOut(span(q, 0, .5)), shift = (1 - ins) * 700;
      var turn = smooth(span(q, .62, .92)), aligned = span(q, .46, .56);
      key.setAttribute('transform', 'translate(' + (-shift).toFixed(1) + ' 0)');
      CX.forEach(function (x, i) {
        var under = x + shift, top = P(under);
        var bottom = Math.min(REST, top);
        var kTop = bottom - LK[i], dTop = kTop - LD;
        var e = els[i];
        e.keypin.setAttribute('d', 'M' + (x - 17) + ' ' + kTop.toFixed(1) + ' h34 v' + (LK[i] - 9) + ' l-17 9 l-17 -9 z');
        e.driver.setAttribute('x', x - 17); e.driver.setAttribute('y', dTop.toFixed(1));
        e.spring.setAttribute('d', springD(x, TOP + 4, dTop));
      });
      shear.setAttribute('opacity', (aligned * (1 - turn * .4)).toFixed(3));
      lines.setAttribute('transform', 'translate(0 ' + (-turn * 15).toFixed(2) + ')');
      if (face) face.setAttribute('transform', 'rotate(' + (rtl() ? -1 : 1) * turn * 90 + ' 100 100)');
      bolt.setAttribute('transform', 'translate(' + (turn * 38).toFixed(1) + ' 0)');
      var k = q < .5 ? 0 : q < .62 ? 1 : 2;
      if (k !== last) { last = k; steps.forEach(function (li, j) { li.classList.toggle('on', j === k); }); ctlUI(); }
    }
    // animations off: three stills, stepped by arrows or by tapping a stage
    var cur = 2, Q = [0, .58, 1];
    var prev = $('[data-pins-prev]'), next = $('[data-pins-next]');
    function ctlUI() { if (!prev) return; prev.disabled = last <= 0; next.disabled = last >= 2; }
    function step(k) { cur = clamp(k, 0, 2); draw(Q[cur]); }
    if (prev) { prev.addEventListener('click', function () { step(cur - 1); }); next.addEventListener('click', function () { step(cur + 1); }); }
    steps.forEach(function (li, j) { li.addEventListener('click', function () { if (still()) step(j); }); });
    return { draw: draw, step: step, cur: function () { return cur; } };
  })();

  // ---------------------------------------------------------------- bento: spotlight under the hand + small living layers
  function spot(el) {
    el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px'); el.classList.add('lit'); });
    el.addEventListener('pointerleave', function () { el.classList.remove('lit'); });
  }
  $$('.tile, .vt').forEach(spot);

  var living = (function () {
    var anims = [];
    var kg = $('.live-keys g');
    if (kg) for (var r = 0; r < 4; r++) for (var c = 0; c < 3; c++) mk('rect', { x: 6 + c * 18, y: 6 + r * 20, width: 14, height: 14, rx: 3 }, kg);
    var keyRects = kg ? $$('rect', kg) : [];
    function add(sel, frames, opt) { $$(sel).forEach(function (el, i) { if (!el.animate) return; var a = el.animate(frames, Object.assign({ duration: 2400, iterations: Infinity, easing: 'cubic-bezier(.45,0,.55,1)', delay: i * 140 }, opt)); a.pause(); anims.push({ a: a, el: el.closest('.tile') }); }); }
    add('.live-pins rect', [{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(4px)' }, { transform: 'translateY(0)' }], { duration: 2000 });
    add('.live-hole .halo', [{ transform: 'scale(.8)', opacity: .9 }, { transform: 'scale(1.35)', opacity: 0 }], { duration: 2600, easing: 'cubic-bezier(.23,1,.32,1)' });
    add('.live-bolt .bar', [{ transform: 'translateY(0)' }, { transform: 'translateY(56px)' }, { transform: 'translateY(56px)' }, { transform: 'translateY(0)' }], { duration: 3600 });
    add('.live-closer .arm', [{ transform: 'rotate(0deg)' }, { transform: 'rotate(38deg)' }, { transform: 'rotate(0deg)' }], { duration: 3800 });
    add('.live-ring .sweep', [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 3200, easing: 'linear' });
    add('.live-hinge rect', [{ opacity: 1 }, { opacity: .35 }, { opacity: 1 }], { duration: 2400 });
    add('.live-lever .lever', [{ transform: 'rotate(0deg)' }, { transform: 'rotate(24deg)' }, { transform: 'rotate(24deg)' }, { transform: 'rotate(0deg)' }], { duration: 3000 });
    var codeTimer = 0, code = [1, 4, 7, 10, 5], ci = 0;
    function codeTick() { keyRects.forEach(function (r) { r.classList.remove('on'); }); if (keyRects[code[ci]]) keyRects[code[ci]].classList.add('on'); ci = (ci + 1) % code.length; }
    var visible = new Set();
    function apply() {
      anims.forEach(function (o) { if (!still() && visible.has(o.el)) o.a.play(); else o.a.pause(); });
      var codeTile = $('.t-code');
      if (!still() && visible.has(codeTile)) { if (!codeTimer) codeTimer = setInterval(codeTick, 650); } else { clearInterval(codeTimer); codeTimer = 0; }
    }
    $$('.tile').forEach(function (t) { watch(t, function (v) { if (v) visible.add(t); else visible.delete(t); apply(); }); });
    return { kick: apply };
  })();

  // ---------------------------------------------------------------- car: his air-wedge method, scroll-driven; the pump steps it
  var car = (function () {
    var sec = $('[data-car]'); if (!sec) return { draw: function () {} };
    var frame = $('[data-frame]', sec), glass = $('[data-glass]', sec), wedge = $('[data-wedge-body]', sec), hose = $('[data-hose]', sec), rod = $('[data-rod]', sec), btnIn = $('[data-btn-in]', sec), lock = $('[data-shackle]', sec), doorG = $('[data-door-g]', sec), wedgeG = $('[data-wedge]', sec);
    var steps = $$('[data-car-steps] li', sec), pump = $('[data-pump]', sec);
    var WX = 520; // where the wedge goes in, near the top rear corner of the door
    function sag(x, g) { var d = (x - WX) / 120; return g * Math.exp(-d * d); }
    function topLine(x0, x1, y0, y1, g, n) { var a = []; for (var k = 0; k <= n; k++) { var xx = lerp(x0, x1, k / n); a.push(xx.toFixed(1) + ' ' + (lerp(y0, y1, k / n) + sag(xx, g)).toFixed(1)); } return a.join(' L'); }
    function glassPath(g) { return 'M104 242 Q116 136 212 ' + (110 + sag(212, g)).toFixed(1) + ' L' + topLine(212, 546, 110, 100, g, 16) + ' L546 242 Z'; }
    function framePath(g) {
      return 'M60 400 L60 250 Q68 112 200 ' + (58 + sag(200, g)).toFixed(1) + ' L' + topLine(200, 560, 58, 50, g, 24) +
        ' Q580 ' + (52 + sag(580, g) * .6).toFixed(1) + ' 584 ' + (74 + sag(584, g) * .3).toFixed(1) + ' L584 400 Z ' + glassPath(g);
    }
    frame.setAttribute('fill-rule', 'evenodd');
    var cur = 0, last = -1;
    function draw(r) {
      var a = easeOut(span(r, .02, .2)), g = smooth(span(r, .24, .44)) * 15, rl = smooth(span(r, .48, .7)), press = span(r, .7, .76), open = smooth(span(r, .78, .96));
      frame.setAttribute('d', framePath(g)); glass.setAttribute('d', glassPath(g));
      // wedge: a flat bladder lying in the gap, it swells with g
      var top = 30, bot = 51 + sag(WX, g) + 2, x0 = WX - 62, x1 = WX + 62, bulge = 2 + g * 1.1;
      wedge.setAttribute('d', 'M' + x0 + ' ' + (top + 3) + ' Q' + WX + ' ' + (top - bulge * .4) + ' ' + x1 + ' ' + (top + 3) + ' L' + (x1 - 6) + ' ' + bot.toFixed(1) + ' Q' + WX + ' ' + (bot + bulge * .8).toFixed(1) + ' ' + (x0 + 6) + ' ' + bot.toFixed(1) + ' Z');
      hose.setAttribute('d', 'M' + (x1 - 10) + ' ' + (top + 2) + ' C' + (x1 + 30) + ' 10 610 8 ' + (660) + ' -6');
      wedgeG.setAttribute('transform', 'translate(0 ' + ((1 - a) * -70).toFixed(1) + ')');
      wedgeG.setAttribute('opacity', a.toFixed(3));
      // rod: from outside, through the gap beside the wedge, down to the button
      var gx = WX - 70, gy = 50 + sag(WX - 70, g), bx = 489, by = 172 + press * 4;
      var L1 = Math.hypot(gx - 640, gy + 4), L2 = Math.hypot(bx - gx, by - gy), L = (L1 + L2) * rl;
      rod.setAttribute('d', 'M640 -4 L' + gx.toFixed(1) + ' ' + gy.toFixed(1) + ' L' + bx + ' ' + by.toFixed(1));
      rod.style.strokeDasharray = (L1 + L2).toFixed(1); rod.style.strokeDashoffset = (L1 + L2 - L).toFixed(1);
      rod.setAttribute('opacity', rl > 0 ? 1 : 0);
      btnIn.setAttribute('transform', 'translate(0 ' + (press * 4).toFixed(1) + ')');
      lock.setAttribute('transform', 'translate(' + (open * 13) + ' ' + (-open * 7) + ') rotate(' + (-open * 25) + ' 13 -8)');
      doorG.setAttribute('transform', 'translate(' + (open * 30).toFixed(1) + ' 0) scale(' + (1 - open * .06).toFixed(3) + ' 1)');
      var k = r < .22 ? 0 : r < .46 ? 1 : r < .76 ? 2 : 3;
      if (k !== last) { last = k; steps.forEach(function (li, j) { li.classList.toggle('on', j === k); li.classList.toggle('done', j < k); }); }
    }
    var ENDS = [.2, .44, .74, 1];
    function progress() { var r = sec.getBoundingClientRect(), vh = innerHeight; return clamp(-r.top / (r.height - vh), 0, 1); }
    pump.addEventListener('click', function () {
      var k = (last + 1) % 4;
      if (still()) { cur = k; draw(ENDS[k]); return; }
      var r = sec.getBoundingClientRect(), y = scrollY + r.top + (r.height - innerHeight) * (k === 0 ? .1 : ENDS[k] - .04);
      scrollTo({ top: y, behavior: 'smooth' });
    });
    steps.forEach(function (li, j) { li.addEventListener('click', function () { if (still()) { cur = j; draw(ENDS[j]); } }); });
    return { draw: function () { draw(still() ? ENDS[cur] : progress()); }, setCur: function (k) { cur = k; } };
  })();

  // ---------------------------------------------------------------- reviews drift with the scroll (desktop), swipe on phones
  var drift = $('[data-drift]'), row = drift && $('.drift-row', drift);
  function driftDraw() {
    if (!row) return;
    if (still() || phone()) { row.style.transform = ''; return; }
    var r = drift.getBoundingClientRect(), p = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1);
    var over = Math.max(0, row.scrollWidth - drift.clientWidth + 40);
    var x = lerp(over * .1, -over * .9, p) * (rtl() ? -1 : 1);
    row.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
  }

  // ---------------------------------------------------------------- footer horizon rises as you arrive
  var horizon = $('.horizon'), foot = $('.foot');
  function footDraw() {
    if (!horizon) return;
    if (still()) { horizon.style.setProperty('--rise', '0px'); return; }
    var r = foot.getBoundingClientRect(), p = clamp((innerHeight - r.top) / r.height, 0, 1);
    horizon.style.setProperty('--rise', ((1 - smooth(p)) * 160).toFixed(1) + 'px');
  }

  // ---------------------------------------------------------------- key ring composer → WhatsApp
  var choice = { obj: 'home', need: 'out' };
  var OBJ = { he: { home: 'בדלת הבית', car: 'ברכב', biz: 'בעסק', mamad: 'בדלת הממ״ד' }, en: { home: 'my front door', car: 'my car', biz: 'my business', mamad: 'my safe-room door' } };
  var NEED = { he: { out: 'ננעלתי בחוץ', cyl: 'צריך להחליף צילינדר', fix: 'צריך לתקן ידית או דלת', other: 'משהו אחר, אפרט כאן' }, en: { out: 'I’m locked out', cyl: 'I need a new cylinder', fix: 'a handle or door needs fixing', other: 'something else, details below' } };
  function compose(quiet) {
    var l = he() ? 'he' : 'en', where = ($('[data-where]').value || '').trim().slice(0, 60);
    var msg = l === 'he'
      ? 'שלום ישראל, הגעתי מהאתר. מדובר ' + OBJ.he[choice.obj] + ': ' + NEED.he[choice.need] + '.' + (where ? ' אני ב' + where.replace(/^ב(?=[^\s])/, '') + '.' : '')
      : 'Hi Israel, I found you through the website. It’s about ' + OBJ.en[choice.obj] + ': ' + NEED.en[choice.need] + '.' + (where ? ' I’m in ' + where + '.' : '');
    $('[data-msg]').textContent = msg;
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
    if (!quiet && !still()) { var c = $('[data-tagcard]'); c.classList.remove('swing'); void c.offsetWidth; c.classList.add('swing'); }
  }
  $$('[data-set]').forEach(function (fs) {
    var keys = $$('.key', fs);
    keys.forEach(function (k) { k.addEventListener('click', function () {
      keys.forEach(function (o) { o.setAttribute('aria-pressed', o === k ? 'true' : 'false'); });
      choice[fs.dataset.set] = k.dataset.v; compose();
    }); });
  });
  var whereIn = $('[data-where]'), wt = 0;
  whereIn.addEventListener('input', function () { clearTimeout(wt); wt = setTimeout(function () { compose(true); }, 120); });

  // ---------------------------------------------------------------- frame loop for scroll-linked scenes
  var ticking = false;
  function tick() { ticking = false; navState(); diveDraw(); car.draw(); driftDraw(); footDraw(); }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }
  function layout() {
    diveSize();
    if (still()) { pins.step(pins.cur()); }
    tick();
  }
  addEventListener('scroll', onScroll, { passive: true });
  var rt = 0; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { sparks.resize && sparks.resize(); layout(); }, 120); });

  // ---------------------------------------------------------------- start
  texts(root.lang === 'en' ? 'en' : 'he');
  hours(); compose(true);
  layout();
  deal();
  sparks.start();
  if (still()) $('.c-spark').classList.add('done');
  $$('[data-decode]').forEach(function (el) { watch(el, function (v) { if (v && !el.dataset.done) { el.dataset.done = 1; setTimeout(function () { decode(el); }, 900); } }); });
  // tests can force a scene: ?scene=dive:0.5
  try { window.__ez = { dive: diveDraw, pins: pins, car: car }; } catch (e) {}
})();
