var LOGO_BITS='000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111000000000000000000000000000000000000000000001101111000011111111100001111000000000000000000000000000000000111110000111101111100011111111111101111111000000000000000000000000010011111111000111101111110011111111111101111111111011000000000000000011110011111111100111100011110000000001111001111111111011110000000111100011110011000111100111100011110000000001111000000011110001111001111111110011110000000111100111100011110011110011111000000011110001111001111011110001111000000111100111100011110011110011110000000111100001111101111011110001111000000111100011110011110011110011110000000111100011111101111001111001111000000011100011110011110011110111100000001111000111111111110001111001111000000011110011111111100011110111100000001111000111111111110001111001111000000011110001111111100011110111100000001111000111101111100001111000111000000011110000011110000011110111000000011110000111001111000000111100111100000001000000000000000011110000000000001110001111001111000000111100111000000000000000000000000011110000000000000000000111000111000000111100000000000000000000000000000011110000000000000000000000000111100000111100000000000000000000000000000011110000000000000000000000000000000000011100000000000000000000000000000000000000000000000000000000000000000000011110000000000000000000000000000000000000000000000000000000000000000000011110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[es.length - 1].isIntersecting); }, opt || {}).observe(el); };
  var dpr = function () { return Math.min(2, window.devicePixelRatio || 1); };
  function fit(cv) { var r = cv.getBoundingClientRect(), d = dpr(); var w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d)); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; } return { w: r.width, h: r.height, d: d }; }
  var loops = [];
  var tickLang = function () {};   // things to re-kick when motion is switched back on or the size changes

  // ---------------------------------------------------------------- language
  function texts(l) {
    $$('[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-aria-he]').forEach(function (el) { el.setAttribute('aria-label', el.dataset[l === 'he' ? 'ariaHe' : 'ariaEn']); });
    $$('[data-title-he]').forEach(function (el) { el.title = el.dataset[l === 'he' ? 'titleHe' : 'titleEn']; });
    document.title = l === 'he' ? 'אלקטרון · מעבדת אלקטרוניקה · חיפה וקריית טבעון' : 'Elektron · Electronics lab · Haifa & Kiryat Tivon';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('el-lang', l); } catch (e) {}
    texts(l); hours(); composer.render(true); dial.place(); bench.ro(); tickLang();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('el-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-rise],[data-blur],[data-row]').forEach(function (el) { el.classList.add('in'); });
    loops.forEach(function (f) { f(); });
    onScroll();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9, 20], 1: [9, 20], 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [9, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {};
    try { new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); }
    catch (e) { var d = new Date(); return { d: d.getDay(), h: d.getHours() + d.getMinutes() / 60 }; }
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
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span><span>' + txt + '</span>'; });
    var led = $('[data-led-status]'); if (led) led.classList.toggle('open', open);
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    var tb = $('[data-hours]');
    if (tb) tb.innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : '24 hours') : '<span class="num">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-rise],[data-blur],[data-row]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  // the first screen never waits on the observer
  requestAnimationFrame(function () { $$('.hero [data-rise], .hero [data-blur]').forEach(function (el) { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in'); }); });

  // ---------------------------------------------------------------- nav gathers into a pill; the remote hides over the footer
  var nav = $('[data-nav]'), remote = $('[data-remote]'), footer = $('footer');
  var footVis = false; watch(footer, function (v) { footVis = v; if (remote) remote.classList.toggle('hide', v); });

  // ---------------------------------------------------------------- odometer
  (function () {
    var el = $('[data-odo]'); if (!el) return;
    var v = el.dataset.odo;
    el.innerHTML = v.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="col"><span><i>' + ch + '</i></span></span>';
      return '<span class="col" data-d="' + ch + '"><span class="reel"></span></span>';
    }).join('');
    function roll() { $$('.col[data-d] > span', el).forEach(function (s, k) { s.style.transitionDelay = (k * 120) + 'ms'; s.style.transform = 'translateY(-' + s.parentNode.dataset.d + 'em)'; }); }
    if (still()) roll(); else watch(el, function (vis) { if (vis) setTimeout(roll, 250); }, { threshold: .4 });
    loops.push(roll);
  })();

  // ---------------------------------------------------------------- TV: boots with the logo in backlight dots, powers down as you scroll on
  var LOGO = { w: 72, h: 22, bits: LOGO_BITS };
  var tv = (function () {
    var tile = $('[data-tv]'), glass = $('[data-tv-glass]'), cv = $('[data-tv-canvas]'), img = $('[data-tv-img]'), bl = $('[data-tv-bl]'), dot = $('[data-tv-dot]');
    if (!tile) return { scroll: function () {} };
    var c = cv.getContext('2d'), raf = 0, t0 = 0, booted = false, dots = [], px = 0, py = 0, tx = 0, ty = 0, vis = true;
    function makeDots(sz) {
      dots = []; var cols = LOGO.w, rows = LOGO.h, cell = Math.min(sz.w * .72 / cols, sz.h * .42 / rows), ox = (sz.w - cols * cell) / 2, oy = (sz.h - rows * cell) / 2;
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) if (LOGO.bits.charAt(y * cols + x) === '1') {
        var a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 260;
        dots.push({ x: ox + (x + .5) * cell, y: oy + (y + .5) * cell, r: cell * .36, k: 1 - x / cols, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40 });
      }
    }
    function frame(ts) {
      raf = 0; if (still()) { finish(); return; }
      var sz = fit(cv); c.setTransform(sz.d, 0, 0, sz.d, 0, 0); c.clearRect(0, 0, sz.w, sz.h);
      if (!dots.length) makeDots(sz);
      var t = (ts - t0) / 1000;
      // 0–.35 s the backlight line opens; .35–1.15 the logo lights in a sweep (from the right, as it reads); hold; 1.75–2.5 it scatters
      bl.style.opacity = t < .5 ? String(clamp(t / .15, 0, 1) * (1 - smooth((t - .3) / .2))) : '0';
      bl.style.transform = 'scaleX(' + smooth(t / .32) + ')';
      var sweep = smooth((t - .35) / .8), burst = smooth((t - 1.75) / .75);
      c.fillStyle = 'rgba(4,14,16,' + (1 - burst) + ')'; c.fillRect(0, 0, sz.w, sz.h);
      img.style.opacity = String(burst);
      c.shadowColor = 'rgba(142,239,232,.9)'; c.shadowBlur = 8;
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i], on = clamp((sweep - d.k * .85) / .15, 0, 1); if (on <= 0) continue;
        var bt = Math.max(0, t - 1.75), x = d.x + d.vx * bt, y = d.y + d.vy * bt + 90 * bt * bt;
        c.globalAlpha = on * (1 - burst);
        c.fillStyle = on < 1 ? '#ffffff' : '#bff8f3';
        c.beginPath(); c.arc(x, y, d.r * (1 + (1 - on) * .8), 0, 6.283); c.fill();
      }
      c.globalAlpha = 1; c.shadowBlur = 0;
      if (t < 2.55) raf = requestAnimationFrame(frame); else finish();
    }
    function finish() { booted = true; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); img.style.opacity = '1'; bl.style.opacity = '0'; parallax(); }
    function boot() { if (still()) { finish(); return; } dots = []; t0 = performance.now(); booted = false; img.style.opacity = '0'; if (!raf) raf = requestAnimationFrame(function (ts) { t0 = ts; frame(ts); }); }
    var startedOnce = false;
    if (still()) finish(); else { img.style.opacity = '0'; watch(tile, function (v) { vis = v; if (v && !startedOnce) { startedOnce = true; boot(); } }, { threshold: .3 }); }
    $('[data-tv-power]').addEventListener('click', function () { tv.scroll(true); boot(); });
    // the photo leans toward the hand, gently
    var praf = 0;
    function parallax() { if (praf || still() || !booted) return; praf = requestAnimationFrame(function () { praf = 0; tx = lerp(tx, px, .08); ty = lerp(ty, py, .08); img.style.transform = 'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0) scale(1.02)'; if (Math.abs(tx - px) > .1 || Math.abs(ty - py) > .1) parallax(); }); }
    tile.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = tile.getBoundingClientRect(); px = ((e.clientX - r.left) / r.width - .5) * -16; py = ((e.clientY - r.top) / r.height - .5) * -12; parallax(); });
    tile.addEventListener('pointerleave', function () { px = py = 0; parallax(); });
    loops.push(function () { if (!still() && !booted) boot(); if (still()) finish(); });
    // power-down: the picture folds into a line, the line into a point, as the tile leaves the screen
    function scroll(reset) {
      if (still() || reset === true) { glass.style.transform = ''; dot.style.opacity = '0'; img.style.filter = ''; return; }
      var r = tile.getBoundingClientRect(), top = (nav ? nav.offsetHeight : 60);
      var p = clamp((top - r.top) / (r.height * .8), 0, 1);
      var sy = lerp(1, .008, smooth(p / .5)), sx = lerp(1, .012, smooth((p - .5) / .3));
      glass.style.transform = p > 0 ? 'scale(' + sx.toFixed(4) + ',' + sy.toFixed(4) + ')' : '';
      img.style.filter = p > 0 ? 'brightness(' + (1 + smooth(p / .5) * 2.2).toFixed(2) + ')' : '';
      dot.style.opacity = String(smooth((p - .72) / .1) * (1 - smooth((p - .9) / .1)));
    }
    return { scroll: scroll };
  })();

  // ---------------------------------------------------------------- the real scope's screen comes alive: the trace follows the hand
  (function () {
    var cv = $('[data-scope]'); if (!cv) return;
    var c = cv.getContext('2d'), raf = 0, vis = false, fx = .35, fy = .6, tx = .35, ty = .6, user = 0, wrap = cv.parentNode;
    function draw(ts) {
      raf = 0;
      var sz = fit(cv), w = sz.w, h = sz.h, t = (ts || 0) / 1000;
      c.setTransform(sz.d, 0, 0, sz.d, 0, 0);
      if (!still() && performance.now() - user > 2500) { tx = .5 + Math.sin(t * .6) * .3; ty = .55 + Math.sin(t * .37 + 1) * .3; }
      fx = lerp(fx, tx, .06); fy = lerp(fy, ty, .06);
      c.fillStyle = '#35adb6'; c.fillRect(0, 0, w, h);
      c.strokeStyle = 'rgba(16,60,66,.55)'; c.lineWidth = 1;
      for (var i = 1; i < 10; i++) { c.beginPath(); c.moveTo(i * w / 10, 0); c.lineTo(i * w / 10, h); c.stroke(); }
      for (i = 1; i < 8; i++) { c.beginPath(); c.moveTo(0, i * h / 8); c.lineTo(w, i * h / 8); c.stroke(); }
      var cyc = 1 + fx * 3.2, amp = (.12 + fy * .3) * h, ph = still() ? 0 : t * 2.2;
      c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = Math.max(1.6, w / 150); c.shadowColor = 'rgba(255,255,255,.9)'; c.shadowBlur = 6;
      c.beginPath();
      for (var x = 0; x <= w; x += 2) { var y = h / 2 - Math.sin((x / w) * cyc * 6.283 + ph) * amp; x ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.stroke(); c.shadowBlur = 0;
      if (vis && !still()) raf = requestAnimationFrame(draw);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(draw); }
    function point(e) { var r = cv.getBoundingClientRect(); tx = clamp((e.clientX - r.left) / r.width, 0, 1); ty = clamp(1 - (e.clientY - r.top) / r.height, 0, 1); user = performance.now(); if (still()) draw(); kick(); }
    wrap.addEventListener('pointermove', point); wrap.addEventListener('pointerdown', point);
    watch(cv, function (v) { vis = v; if (v) kick(); });
    loops.push(function () { draw(); kick(); });
    addEventListener('resize', function () { draw(); });
    draw();
  })();


  // ---------------------------------------------------------------- what the lab repairs: words decode out of static; a light runs down the LED strip
  (function () {
    var el = $('[data-tick]'), glow = $('[data-tick-glow]'); if (!el) return;
    var W = { he: ['טלוויזיות לד', 'מסכי LCD', 'טלוויזיות פלזמה', 'מסכי מחשב', 'מחשבים ניידים', 'מחשבים נייחים'], en: ['LED TVs', 'LCD screens', 'Plasma TVs', 'Computer screens', 'Laptops', 'Desktops'] };
    var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHKLMNPRSTVXZ' }, i = 0, timer = 0, raf = 0, vis = false, t0 = 0;
    function show(word, l) {
      var start = performance.now(), dur = 520;
      cancelAnimationFrame(raf);
      (function step(ts) {
        var k = clamp((ts - start) / dur, 0, 1), n = Math.floor(word.length * k), out = '';
        for (var j = 0; j < word.length; j++) { var ch = word.charAt(j); out += j < n || ch === ' ' ? ch : '<span class="g">' + GL[l].charAt(Math.floor(Math.random() * GL[l].length)) + '</span>'; }
        el.innerHTML = '<span lang="' + l + '">' + out + '</span>';
        if (k < 1) raf = requestAnimationFrame(step);
      })(start);
    }
    function next() { clearTimeout(timer); var l = he() ? 'he' : 'en'; if (still()) { el.innerHTML = '<span lang="' + l + '">' + W[l][0] + '</span>'; return; } i = (i + 1) % W[l].length; show(W[l][i], l); if (vis) timer = setTimeout(next, 2600); }
    var graf = 0;
    function sweep(ts) { graf = 0; if (still() || !vis) { glow.style.setProperty('--gx', '-20%'); return; } if (!t0) t0 = ts; var p = ((ts - t0) / 2600) % 1; glow.style.setProperty('--gx', (rtl() ? 120 - p * 140 : -20 + p * 140).toFixed(1) + '%'); graf = requestAnimationFrame(sweep); }
    watch(el, function (v) { vis = v; if (v) { timer = setTimeout(next, 1400); if (!graf) graf = requestAnimationFrame(sweep); } else clearTimeout(timer); });
    loops.push(function () { next(); if (!graf) graf = requestAnimationFrame(sweep); });
    tickLang = function () { i = -1; next(); };
  })();

  // ---------------------------------------------------------------- LED backlight: scattered points → one strip → the lit rows of a real panel
  var led = (function () {
    var st = $('[data-led]'); if (!st) return { scroll: function () {} };
    var cv = $('[data-led-canvas]'), c = cv.getContext('2d'), img = $('img', st), steps = $$('[data-led-steps] li');
    var IW = 1180, IH = 746, P = { x0: .175, x1: .82, y0: .165, y1: .73 };   // the panel's lit area inside the photo
    var N = 150, COLS = 15, ROWS = 10, sq = [], seed = 7;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (var i = 0; i < N; i++) sq.push({ sx: rnd(), sy: rnd(), tw: rnd() * 6.28, dead: rnd() < .8 });
    var last = -1;
    function map(w, h) { var s = Math.max(w / IW, h / IH), ox = (w - IW * s) / 2, oy = (h - IH * s) / 2; return function (u, v) { return [ox + u * IW * s, oy + v * IH * s]; }; }
    function draw(p) {
      var sz = fit(cv), w = sz.w, h = sz.h; c.setTransform(sz.d, 0, 0, sz.d, 0, 0); c.clearRect(0, 0, w, h);
      var m = map(w, h), a0 = m(P.x0, P.y0), a1 = m(P.x1, P.y1), pw = a1[0] - a0[0], ph = a1[1] - a0[1];
      var A = smooth(p / .38), B = smooth((p - .4) / .32), C = smooth((p - .7) / .26);
      st.style.setProperty('--lit', (.1 + .9 * C).toFixed(3));
      var s = clamp(w / 95, 6, 13), rb = 50, ribW = Math.min(pw * 1.05, w * .86), cell = ribW / rb;
      c.shadowColor = 'rgba(142,239,232,.85)';
      for (var i = 0; i < N; i++) {
        var q = sq[i];
        var x0 = w * (.06 + q.sx * .88), y0 = h * (.08 + q.sy * .84);
        var rx = w / 2 - ribW / 2 + (i % rb + .5) * cell, ry = h / 2 + (Math.floor(i / rb) - 1) * cell * 1.1;
        if (rtl()) rx = w - rx;
        var gx = a0[0] + ((i % COLS) + .5) * pw / COLS, gy = a0[1] + (Math.floor(i / COLS) + .5) * ph / ROWS;
        var x = lerp(lerp(x0, rx, A), gx, B), y = lerp(lerp(y0, ry, A), gy, B);
        // a dead point stays dim until the strip is formed; the strip lights bead by bead from one end
        var bead = clamp((A * 1.4 - (i % rb) / rb * .9), 0, 1);
        var lit = q.dead ? bead : Math.max(.55 + .45 * Math.sin(q.tw + p * 30), bead);
        var size = lerp(s, Math.min(cell * .7, s), A) * lerp(1, .9, B);
        c.globalAlpha = (1 - C) * (.35 + .65 * lit);
        c.shadowBlur = lit > .6 ? 10 : 0;
        c.fillStyle = lit > .6 ? '#c9fbf6' : '#7d8f92';
        c.beginPath(); c.roundRect ? c.roundRect(x - size / 2, y - size / 2, size, size, size * .25) : c.rect(x - size / 2, y - size / 2, size, size); c.fill();
      }
      c.globalAlpha = 1; c.shadowBlur = 0;
      var k = p < .38 ? 0 : p < .7 ? 1 : 2;
      if (k !== last) { last = k; steps.forEach(function (li, j) { li.classList.toggle('on', j === k); }); }
    }
    function scroll() {
      if (still()) { st.style.setProperty('--lit', '1'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); steps.forEach(function (li) { li.classList.add('on'); }); last = -1; return; }
      var r = st.getBoundingClientRect(), vh = innerHeight;
      if (r.bottom < -50 || r.top > vh + 50) return;
      draw(clamp((vh * .82 - r.top) / (r.height + vh * .25), 0, 1));
    }
    return { scroll: scroll };
  })();

  // ---------------------------------------------------------------- the bench: a live scope and a red selector knob
  var bench = (function () {
    var cv = $('[data-crt]'); if (!cv) return { ro: function () {}, set: function () {} };
    var c = cv.getContext('2d'), raf = 0, vis = false, stage = 0, since = performance.now();
    var W = [{ v: 1, s: 0, n: 0, g: 0 }, { v: 0, s: .8, n: .22, g: 1 }, { v: 0, s: .9, n: .06, g: 1 }, { v: 0, s: 1, n: 0, g: 0 }], cur = { v: 1, s: 0, n: 0, g: 0 };
    var RO = [['CH1 0.5V', '5ms', 'CALL'], ['CH1 2V', '1ms', 'FAULT'], ['CH1 2V', '1ms', 'SOLDER'], ['CH1 2V', '1ms', 'OK']];
    function ro() { var r = RO[stage]; $('[data-ro-a]').textContent = r[0]; $('[data-ro-b]').textContent = r[1]; $('[data-ro-c]').textContent = r[2]; }
    function noise(x, t) { return Math.sin(x * 91.7 + t * 13) * .5 + Math.sin(x * 211.3 - t * 29) * .3 + Math.sin(x * 37.1 + t * 7) * .2; }
    function draw(ts) {
      raf = 0;
      var sz = fit(cv), w = sz.w, h = sz.h, t = still() ? 1.3 : (ts || performance.now()) / 1000, el = still() ? .8 : (performance.now() - since) / 1000;
      c.setTransform(sz.d, 0, 0, sz.d, 0, 0);
      var tg = W[stage], k = still() ? 1 : .08;
      ['v', 's', 'n', 'g'].forEach(function (key) { cur[key] = lerp(cur[key], tg[key], k); });
      var glitch = cur.g * (stage === 2 ? clamp(1 - el / 1.6, 0, 1) : 1);
      c.fillStyle = '#0c2226'; c.fillRect(0, 0, w, h);
      c.strokeStyle = 'rgba(142,239,232,.12)'; c.lineWidth = 1;
      for (var i = 1; i < 10; i++) { c.beginPath(); c.moveTo(i * w / 10, 0); c.lineTo(i * w / 10, h); c.stroke(); }
      for (i = 1; i < 7; i++) { c.beginPath(); c.moveTo(0, i * h / 7); c.lineTo(w, i * h / 7); c.stroke(); }
      c.strokeStyle = 'rgba(142,239,232,.25)'; c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.moveTo(w / 2, 0); c.lineTo(w / 2, h); c.stroke();
      var gx0 = .56, gx1 = .68;
      // the search marker sweeps until it rests on the fault
      if (stage === 1) {
        var mx = still() ? (gx0 + gx1) / 2 : Math.min((gx0 + gx1) / 2, (el * .35) % 1.2);
        c.strokeStyle = 'rgba(255,206,120,.75)'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(mx * w, 0); c.lineTo(mx * w, h); c.stroke(); c.setLineDash([]);
        if (mx >= (gx0 + gx1) / 2 - .001) { c.strokeStyle = 'rgba(255,206,120,.9)'; c.lineWidth = 1.5; c.strokeRect(gx0 * w, h * .12, (gx1 - gx0) * w, h * .76); c.lineWidth = 1; }
      }
      c.strokeStyle = '#a8fff8'; c.lineWidth = Math.max(1.8, w / 220); c.shadowColor = 'rgba(142,239,232,.95)'; c.shadowBlur = 9;
      c.beginPath();
      for (var x = 0; x <= w; x += 1.5) {
        var u = x / w, y = 0;
        // a voice: bursts of a fast wave under a syllable envelope
        var env = Math.max(0, Math.sin(u * 9.5 + t * 3.1)) * Math.max(0, Math.sin(u * 3.3 - t * 1.3) + .3);
        y += cur.v * env * Math.sin(u * 160 + t * 40) * .34;
        y += cur.s * Math.sin(u * 6.283 * 3 - t * 2.4) * .3;
        y += cur.n * noise(u, t) * .22;
        if (u > gx0 && u < gx1) { var gu = (u - gx0) / (gx1 - gx0); y += glitch * Math.sin(gu * 3.14) * (Math.sin(gu * 70 + t * 30) * .35 + .12); }
        y = h / 2 - y * h;
        x ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.stroke(); c.shadowBlur = 0;
      // the iron touches the joint: sparks while the fault fades out
      if (stage === 2 && glitch > .05) {
        var cx = (gx0 + gx1) / 2 * w, cy = h / 2;
        for (i = 0; i < 9; i++) { var a = (i / 9) * 6.28 + t * 3, rr = (6 + ((t * 60 + i * 13) % 18)) * (w / 400); c.fillStyle = 'rgba(255,214,140,' + (glitch * .9).toFixed(2) + ')'; c.beginPath(); c.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 1.6 * (w / 400) + .8, 0, 6.283); c.fill(); }
      }
      if (vis && !still()) raf = requestAnimationFrame(draw);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(draw); }
    function set(s) {
      s = (s + 4) % 4; if (s === stage) return; stage = s; since = performance.now(); ro();
      $$('[data-step]').forEach(function (li) { li.classList.toggle('on', +li.dataset.step === s); });
      dial.turn(s);
      if (phoneQ.matches && !fromSwipe) { var li = $('[data-step="' + s + '"]'), row2 = li.parentNode; row2.scrollTo({ left: row2.scrollLeft + (li.getBoundingClientRect().left + li.offsetWidth / 2) - (row2.getBoundingClientRect().left + row2.clientWidth / 2), behavior: still() ? 'auto' : 'smooth' }); }
      if (still()) { cur = { v: W[s].v, s: W[s].s, n: W[s].n, g: W[s].g }; draw(); }
      kick();
    }
    watch(cv, function (v) { vis = v; if (v) kick(); });
    // the step in the middle of the screen sets the stage
    var phoneQ = matchMedia('(max-width:760px)');
    if (io) { var sio = new IntersectionObserver(function (es) { if (still() || phoneQ.matches) return; es.forEach(function (e) { if (e.isIntersecting) set(+e.target.dataset.step); }); }, { rootMargin: '-45% 0px -45% 0px' }); $$('[data-step]').forEach(function (li) { sio.observe(li); }); }
    $$('[data-step]').forEach(function (li) { li.addEventListener('click', function () { set(+li.dataset.step); }); });
    // on phones the steps are a swipe row under the scope: the card in the middle sets the stage
    var row = $('[data-steps]'), hraf = 0;
    row.addEventListener('scroll', function () { if (!phoneQ.matches || hraf) return; hraf = requestAnimationFrame(function () { hraf = 0; var r = row.getBoundingClientRect(), mid = r.left + r.width / 2, best = 0, bd = 1e9; $$('[data-step]', row).forEach(function (li) { var q = li.getBoundingClientRect(), d = Math.abs(q.left + q.width / 2 - mid); if (d < bd) { bd = d; best = +li.dataset.step; } }); if (best !== stage) { fromSwipe = true; set(best); fromSwipe = false; } }); }, { passive: true });
    var fromSwipe = false;
    loops.push(function () { cur = { v: W[stage].v, s: W[stage].s, n: W[stage].n, g: W[stage].g }; draw(); kick(); });
    addEventListener('resize', function () { draw(); });
    ro(); draw();
    return { ro: ro, set: set, get: function () { return stage; } };
  })();

  var dial = (function () {
    var box = $('[data-dial]'); if (!box) return { place: function () {}, turn: function () {} };
    var labels = $$('[data-stage]', box), cap = $('.cap-red', box), ANG = [-45, 45, 135, 225];
    function place() {
      labels.forEach(function (b, i) { var a = ANG[i] * Math.PI / 180, sx = rtl() ? -1 : 1; b.style.left = (50 + sx * 40 * Math.sin(a)) + '%'; b.style.top = (50 - 40 * Math.cos(a)) + '%'; });
      turn(bench.get ? bench.get() : 0);
    }
    function turn(s) { labels.forEach(function (b, i) { b.classList.toggle('on', i === s); b.setAttribute('aria-pressed', i === s ? 'true' : 'false'); }); cap.style.transform = 'rotate(' + (ANG[s] * (rtl() ? -1 : 1)) + 'deg)'; }
    labels.forEach(function (b) { b.addEventListener('click', function () { bench.set(+b.dataset.stage); }); });
    $('[data-knob]', box).addEventListener('click', function () { bench.set(bench.get() + 1); });
    return { place: place, turn: turn };
  })();
  dial.place();

  // ---------------------------------------------------------------- services: the old board zooms out as you pass
  var zimg = $('[data-zoom]');
  function zoom() { if (!zimg) return; if (still()) { zimg.style.setProperty('--z', '1'); return; } var r = zimg.getBoundingClientRect(), p = clamp(1 - (r.top + r.height / 2) / innerHeight, 0, 1); zimg.style.setProperty('--z', (1.22 - p * .2).toFixed(3)); }

  // ---------------------------------------------------------------- repair tags swing on their strings (scroll and the hand push them)
  var tags = (function () {
    var els = $$('[data-tag]'); if (!els.length) return { push: function () {} };
    var S = els.map(function (el, i) { return { el: el, a: 0, w: 0, k: 9 + i * 1.7 }; }), raf = 0, lt = 0, vis = false;
    function frame(ts) {
      raf = 0; if (still()) { S.forEach(function (s) { s.a = s.w = 0; s.el.style.transform = ''; }); return; }
      var dt = Math.min(.033, lt ? (ts - lt) / 1000 : .016); lt = ts; var e = 0;
      S.forEach(function (s) { s.w += (-s.k * s.a - 1.6 * s.w) * dt; s.a += s.w * dt; e += Math.abs(s.a) + Math.abs(s.w); s.el.style.transform = 'rotate(' + s.a.toFixed(3) + 'deg)'; });
      if (e > .02) raf = requestAnimationFrame(frame); else lt = 0;
    }
    function push(v) { if (still() || !vis) return; S.forEach(function (s, i) { s.w += v * (i % 2 ? 1 : -.8); }); if (!raf) raf = requestAnimationFrame(frame); }
    els.forEach(function (el, i) {
      var lx = null;
      el.addEventListener('pointermove', function (e) { if (still()) return; if (lx !== null) { S[i].w += clamp((e.clientX - lx) * .9, -14, 14); if (!raf) raf = requestAnimationFrame(frame); } lx = e.clientX; });
      el.addEventListener('pointerleave', function () { lx = null; });
    });
    watch($('[data-rail]'), function (v) { vis = v; if (v) push(14); });
    return { push: push };
  })();

  // ---------------------------------------------------------------- composer
  var composer = (function () {
    var host = $('[data-composer]'); if (!host) return { render: function () {} };
    var DEV = [['טלוויזיה', 'TV', 'בטלוויזיה', 'my TV'], ['מסך מחשב', 'Screen', 'במסך מחשב', 'my computer screen'], ['מחשב נייד', 'Laptop', 'במחשב נייד', 'my laptop'], ['מחשב נייח', 'Desktop', 'במחשב נייח', 'my desktop computer'], ['אחר', 'Other', 'במכשיר אחר', 'another device']];
    var FAULT = [['אין תמונה, יש קול', 'No picture, has sound', 'אין תמונה, אבל יש קול', 'no picture, but there is sound'], ['לא נדלק', 'Won’t turn on', 'המכשיר לא נדלק', 'it doesn’t turn on'], ['פסים או כתמים', 'Lines or spots', 'יש פסים או כתמים על המסך', 'there are lines or spots on the screen'], ['נכבה לבד', 'Switches off', 'המכשיר נכבה לבד', 'it switches off by itself'], ['משהו אחר', 'Something else', 'משהו אחר, אסביר', 'something else, I’ll explain']];
    var BR = [['בחיפה', 'in Haifa'], ['בקריית טבעון', 'in Kiryat Tivon']];
    var dev = 0, faults = [0], br = 0, typing = 0;
    var sel = $('[data-sel]'), knob = $('[data-sel-knob]'), keys = $('[data-keys]'), lcd = $('[data-lcd]'), wa = $('[data-wa-send]');
    var ANG = [-110, -55, 0, 55, 110];
    var btns = DEV.map(function (d, i) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'radio'); b.addEventListener('click', function () { dev = i; render(); }); sel.appendChild(b); return b; });
    knob.addEventListener('click', function () { dev = (dev + 1) % DEV.length; render(); });
    knob.style.cursor = 'pointer';
    var kb = FAULT.map(function (f, i) { var b = document.createElement('button'); b.type = 'button'; b.className = 'key'; b.addEventListener('click', function () { var j = faults.indexOf(i); j < 0 ? faults.push(i) : faults.splice(j, 1); faults.sort(); render(); }); keys.appendChild(b); return b; });
    $$('[data-branch]').forEach(function (b) { b.addEventListener('click', function () { br = +b.dataset.branch; render(); }); });
    function msg() {
      var l = he();
      var f = faults.map(function (i) { return FAULT[i][l ? 2 : 3]; });
      if (l) return 'שלום אמנון, יש לי תקלה ' + DEV[dev][2] + (f.length ? ': ' + f.join('; ') + '.' : '.') + ' אפשר לתאם בדיקה ' + BR[br][0] + '? אשלח גם תמונה.';
      return 'Hi Amnon, I have a problem with ' + DEV[dev][3] + (f.length ? ': ' + f.join('; ') + '.' : '.') + ' Could we arrange a check ' + BR[br][1] + '? I’ll send a photo too.';
    }
    function render(instant) {
      var l = he();
      btns.forEach(function (b, i) { var a = ANG[i] * Math.PI / 180, sx = rtl() ? -1 : 1; b.textContent = DEV[i][l ? 0 : 1]; b.style.left = (50 + sx * 38 * Math.sin(a)) + '%'; b.style.top = (54 - 42 * Math.cos(a)) + '%'; b.classList.toggle('on', i === dev); b.setAttribute('aria-checked', i === dev ? 'true' : 'false'); });
      knob.style.transform = 'rotate(' + (ANG[dev] * (rtl() ? -1 : 1)) + 'deg)';
      kb.forEach(function (b, i) { b.innerHTML = '<i aria-hidden="true"></i><span>' + FAULT[i][l ? 0 : 1] + '</span>'; b.setAttribute('aria-pressed', faults.indexOf(i) >= 0 ? 'true' : 'false'); });
      $$('[data-branch]').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.branch === br ? 'true' : 'false'); });
      var m = msg();
      wa.href = 'https://wa.me/972544335732?text=' + encodeURIComponent(m);
      lcd.dir = l ? 'rtl' : 'ltr';
      cancelAnimationFrame(typing);
      if (instant === true || still()) { lcd.innerHTML = esc(m) + '<span class="cur" aria-hidden="true"></span>'; return; }
      var t0 = performance.now(), from = lcd.textContent || '', keep = 0;
      while (keep < from.length && keep < m.length && from.charAt(keep) === m.charAt(keep)) keep++;
      (function step(ts) { var n = Math.min(m.length, keep + Math.floor((ts - t0) / 9)); lcd.innerHTML = esc(m.slice(0, n)) + '<span class="cur" aria-hidden="true"></span>'; if (n < m.length) typing = requestAnimationFrame(step); })(t0);
    }
    function esc(s) { return s.replace(/[&<>]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]; }); }
    render(true);
    return { render: render };
  })();

  // ---------------------------------------------------------------- contact: a seamless strip, a spotlight under the hand
  (function () {
    var s = $('[data-strip]'); if (!s) return;
    $$('img', s).forEach(function (im) { var k = im.cloneNode(true); s.appendChild(k); });
    $$('.b').forEach(function (b) { b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.setProperty('--x', (e.clientX - r.left) + 'px'); b.style.setProperty('--y', (e.clientY - r.top) + 'px'); }); });
  })();

  // ---------------------------------------------------------------- closing: the photo shrinks into a small screen and powers down
  var closing = (function () {
    var sec = $('[data-closing]'), pin = $('.closing-pin'), shell = $('[data-closing-shell]'), out = $('[data-closing-out]'), fr = $('[data-closing-frame]'), im = $('[data-closing-img]'), line = $('[data-closing-line]'), msg = $('.msg', fr);
    if (!sec) return { scroll: function () {} };
    function scroll() {
      if (still()) { fr.style.clipPath = ''; im.style.transform = ''; line.style.opacity = '0'; msg.style.opacity = ''; im.style.filter = ''; return; }
      var r = sec.getBoundingClientRect(), vh = innerHeight; if (r.bottom < 0 || r.top > vh) return;
      var p = clamp(-r.top / (r.height - vh), 0, 1);
      var a = smooth((p - .08) / .4), b = smooth((p - .55) / .2), d = smooth((p - .76) / .14);
      var cs = getComputedStyle(pin), IX = parseFloat(cs.getPropertyValue('--ix')) || 31, IY = parseFloat(cs.getPropertyValue('--iy')) || 24;
      var ix = lerp(0, IX, a), iy = lerp(0, IY, a);                    // shrink into a small screen
      shell.style.opacity = String(smooth((a - .75) / .25));
      out.style.opacity = String(smooth((a - .8) / .2)); out.classList.toggle('on', a > .9);
      var cy = lerp(iy, 49.7, b), cx = lerp(ix, 49.6, d);                // fold to a line, then to a point
      fr.style.clipPath = 'inset(' + cy.toFixed(2) + '% ' + cx.toFixed(2) + '% round ' + lerp(18, 4, a).toFixed(1) + 'px)';
      im.style.transform = 'scale(' + lerp(1.08, 1, a).toFixed(3) + ')';
      im.style.filter = b > 0 ? 'brightness(' + (1 + b * 2.4).toFixed(2) + ')' : '';
      msg.style.opacity = String(1 - smooth((p - .2) / .2));
      line.style.opacity = String(smooth((b - .7) / .3) * (1 - smooth((p - .9) / .08)));
      line.style.transform = 'scaleX(' + lerp(.38, .004, d).toFixed(3) + ')';
    }
    return { scroll: scroll };
  })();

  // ---------------------------------------------------------------- one scroll loop for every scroll-linked piece
  var sraf = 0, lastY = scrollY;
  function onScroll() {
    if (sraf) return;
    sraf = requestAnimationFrame(function () {
      sraf = 0;
      var y = scrollY, v = y - lastY; lastY = y;
      if (nav) nav.classList.toggle('gathered', y > 40);
      tv.scroll(); led.scroll(); zoom(); closing.scroll();
      if (Math.abs(v) > 2) tags.push(clamp(v * .06, -6, 6));
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  texts(root.lang); hours(); onScroll();
})();
