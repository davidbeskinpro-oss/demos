(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var hover = matchMedia('(hover: hover)').matches;
  var io = 'IntersectionObserver' in window;
  var PHONE = '972545247724';

  // ------------------------------------------------------------ language
  function texts() {
    var l = he() ? 'he' : 'en';
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-aria-he]').forEach(function (el) { el.setAttribute('aria-label', el.dataset[l === 'he' ? 'ariaHe' : 'ariaEn']); });
    $$('.pin').forEach(function (p) { p.setAttribute('aria-label', p.dataset[l]); if (p.classList.contains('on')) $('.lbl', p).textContent = p.dataset[l]; });
    $('[data-set-lang]').setAttribute('aria-label', l === 'he' ? 'Switch to English' : 'מעבר לעברית');
    document.title = l === 'he' ? 'פולטרון · מעבדה לתיקון טלוויזיות · פנחס לבון 17, קריית ים' : 'Poletron · TV repair lab · 17 Pinchas Lavon St, Kiryat Yam';
    status(); hours(); compose(true); hero.osd(); fit(); waLinks();
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('pt-lang', l); } catch (e) {}
    var u = new URL(location.href); if (l === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang');
    try { history.replaceState(null, '', u); } catch (e) {}
    texts();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ------------------------------------------------------------ motion switch
  var sw = $('[data-motion]');
  function motionUI() { sw.setAttribute('aria-checked', still() ? 'false' : 'true'); }
  sw.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('pt-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    hero.reset(); visit.reset(); footer.reset(); bars.reset(); signal.draw(1);
    onScroll();
    if (on) { pixels.start(); scopeTrace.kick(); strip.kick(); pattern.kick(); }
  });
  motionUI();

  // ------------------------------------------------------------ hours / open now
  // 0 = Sunday. null = closed.
  var H = [[11, 18.75], [11, 18.75], [11, 18.75], [11, 18.75], [11, 18.75], [11, 14], null];
  var DAYS = { he: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] };
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function nextOpen(n) {
    for (var k = 0; k < 8; k++) {
      var d = (n.d + k) % 7, r = H[d];
      if (r && (k > 0 || n.h < r[0])) return { d: d, k: k, at: r[0] };
    }
    return null;
  }
  function status() {
    var n = now(), r = H[n.d], open = !!(r && n.h >= r[0] && n.h < r[1]), txt;
    if (open) txt = he() ? 'פתוח עכשיו · עד ' + hhmm(r[1]) : 'Open now · until ' + hhmm(r[1]);
    else {
      var x = nextOpen(n);
      if (!x) txt = he() ? 'סגור עכשיו' : 'Closed now';
      else if (x.k === 0) txt = he() ? 'סגור עכשיו · נפתח היום ב-' + hhmm(x.at) : 'Closed now · opens today at ' + hhmm(x.at);
      else if (x.k === 1) txt = he() ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(x.at) : 'Closed now · opens tomorrow at ' + hhmm(x.at);
      else txt = he() ? 'סגור עכשיו · נפתח ביום ' + DAYS.he[x.d] + ' ב-' + hhmm(x.at) : 'Closed now · opens ' + DAYS.en[x.d] + ' at ' + hhmm(x.at);
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
  }
  function hours() {
    var n = now(), l = he() ? 'he' : 'en';
    $('[data-hours]').innerHTML = H.map(function (r, d) {
      return '<tr class="' + (d === n.d ? 'today ' : '') + (r ? '' : 'closed') + '"><td>' + DAYS[l][d] + '</td><td>' + (r ? hhmm(r[0]) + '–' + hhmm(r[1]) : (l === 'he' ? 'סגור' : 'Closed')) + '</td></tr>';
    }).join('');
  }
  setInterval(status, 60000);

  // ------------------------------------------------------------ nav pill
  var nav = $('#nav');

  // ------------------------------------------------------------ reveals
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); });
  $$('.tag-grid [data-reveal]').forEach(function (t, i) { t.style.setProperty('--d', i * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  var watch = function (el, fn) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }).observe(el); };

  // ------------------------------------------------------------ HERO: dead panel -> flashlight -> backlight strips
  var hero = (function () {
    var sec = $('#hero'), scr = $('.screen', sec), strips = $('.strips', sec), osdT = $('.osd-t', sec), osd = $('.osd', sec);
    var N = 7, lv = [], p = 0, fx = 50, fy = 45, auto = true, t0 = performance.now(), raf = 0, vis = true;
    for (var i = 0; i < N; i++) strips.appendChild(document.createElement('span'));
    var bars = $$('span', strips);
    var order = [3, 2, 4, 1, 5, 0, 6]; // the middle strip first, then outwards
    function level(i) { var k = order.indexOf(i); return smooth((p - 0.16 - k * 0.075) / 0.1); }
    var lastOsd = '';
    function osdText() {
      var lit = 0; for (var i = 0; i < N; i++) if (lv[i] > 0.9) lit++;
      var s;
      if (p < 0.14) s = he() ? 'בדיקת פנס: יש תמונה, אין תאורה אחורית' : 'Flashlight test: picture is there, no backlight';
      else if (lit < N) s = he() ? 'פסי לד נדלקים · ' + lit + '/' + N : 'LED strips on · ' + lit + '/' + N;
      else s = he() ? 'התמונה חזרה' : 'Picture is back';
      osd.classList.toggle('good', lit === N);
      if (s !== lastOsd) { osdT.textContent = s; lastOsd = s; }
    }
    function render() {
      if (still()) return;
      for (var i = 0; i < N; i++) lv[i] = level(i);
      var diff = smooth((p - 0.72) / 0.16); // diffuser: hot LED bars soften into an even picture
      var stops = ['rgba(0,0,0,' + lv[0].toFixed(3) + ') 0%'];
      for (i = 0; i < N; i++) {
        var c = (i + 0.5) / N * 100, a = lv[i];
        var edge = a * (0.55 + 0.45 * diff);
        stops.push('rgba(0,0,0,' + edge.toFixed(3) + ') ' + (c - 50 / N + 0.01).toFixed(2) + '%');
        stops.push('rgba(0,0,0,' + a.toFixed(3) + ') ' + c.toFixed(2) + '%');
      }
      stops.push('rgba(0,0,0,' + lv[N - 1].toFixed(3) + ') 100%');
      var m = 'linear-gradient(90deg,' + stops.join(',') + ')';
      scr.style.setProperty('--mask', m);
      scr.style.setProperty('--bri', (0.8 + 0.2 * diff).toFixed(3));
      bars.forEach(function (b, i) { b.style.opacity = (lv[i] * (1 - diff * 0.92)).toFixed(3); });
      scr.style.setProperty('--torch', (1 - smooth((p - 0.1) / 0.2)).toFixed(3));
      scr.style.setProperty('--fx', fx.toFixed(1) + '%');
      scr.style.setProperty('--fy', fy.toFixed(1) + '%');
      osdText();
    }
    function frame(t) {
      raf = 0;
      if (still() || !vis) return;
      if (auto) { var s = (t - t0) / 1000; fx = 50 + 34 * Math.sin(s * 1.6 - 1.2); fy = 48 + 22 * Math.sin(s * 2.6 + 1); }
      render();
      if (p < 0.32) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    function scroll() {
      if (still()) return;
      var r = sec.getBoundingClientRect(), span = r.height - innerHeight;
      p = span > 0 ? clamp(-r.top / span, 0, 1) : 1;
      render(); kick();
    }
    scr.addEventListener('pointermove', function (e) {
      var r = scr.getBoundingClientRect(); auto = false;
      fx = (e.clientX - r.left) / r.width * 100; fy = (e.clientY - r.top) / r.height * 100; kick();
    });
    scr.addEventListener('pointerleave', function () { auto = true; t0 = performance.now(); });
    watch(sec, function (v) { vis = v; if (v) kick(); });
    function reset() {
      if (still()) { osd.classList.add('good'); osdT.textContent = he() ? 'התמונה חזרה' : 'Picture is back'; lastOsd = ''; }
      else scroll();
    }
    return { scroll: scroll, kick: kick, reset: reset, osd: function () { lastOsd = ''; if (still()) reset(); else osdText(); } };
  })();

  // ------------------------------------------------------------ pixel field: RGB subpixels rippling like the drop in the logo
  var pixels = (function () {
    var cv = $('.pixels'), c = cv.getContext('2d'), stage = $('.hero-stage');
    var w, h, dpr, G = 16, rings = [], raf = 0, vis = true, lastAuto = 0, base = document.createElement('canvas');
    function size() {
      dpr = Math.min(2, devicePixelRatio || 1); w = stage.clientWidth; h = stage.clientHeight;
      cv.width = base.width = w * dpr; cv.height = base.height = h * dpr;
      var b = base.getContext('2d'); b.setTransform(dpr, 0, 0, dpr, 0, 0); b.clearRect(0, 0, w, h);
      for (var y = G / 2; y < h; y += G) for (var x = G / 2; x < w; x += G) {
        b.fillStyle = 'rgba(255,70,60,.11)'; b.fillRect(x - 4, y - 3, 2, 6);
        b.fillStyle = 'rgba(80,255,120,.09)'; b.fillRect(x - 1, y - 3, 2, 6);
        b.fillStyle = 'rgba(80,140,255,.12)'; b.fillRect(x + 2, y - 3, 2, 6);
      }
    }
    function drop(x, y) { rings.push({ x: x, y: y, t: performance.now() }); if (rings.length > 6) rings.shift(); kick(); }
    function frame(t) {
      raf = 0;
      if (still() || !vis) return;
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); c.drawImage(base, 0, 0);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (t - lastAuto > 1100) { lastAuto = t; drop(w * (0.15 + Math.random() * 0.7), h * (0.2 + Math.random() * 0.6)); }
      // panel refresh sweep: a soft band of lit subpixels travels down the field
      var sy = ((t / 3800) % 1) * (h + 160) - 80;
      for (var yy = Math.floor(Math.max(0, sy - 70) / G) * G + G / 2; yy < Math.min(h, sy + 70); yy += G) {
        var aa = (1 - Math.abs(yy - sy) / 70) * 0.32;
        for (var xx = G / 2; xx < w; xx += G) {
          c.fillStyle = 'rgba(255,90,70,' + aa + ')'; c.fillRect(xx - 4, yy - 3, 2, 6);
          c.fillStyle = 'rgba(110,255,140,' + aa + ')'; c.fillRect(xx - 1, yy - 3, 2, 6);
          c.fillStyle = 'rgba(120,170,255,' + aa + ')'; c.fillRect(xx + 2, yy - 3, 2, 6);
        }
      }
      rings = rings.filter(function (r) { return t - r.t < 2600; });
      rings.forEach(function (r) {
        var age = (t - r.t) / 1000, R = age * 260, life = 1 - age / 2.6, band = 36;
        var x0 = Math.max(0, r.x - R - band), x1 = Math.min(w, r.x + R + band), y0 = Math.max(0, r.y - R - band), y1 = Math.min(h, r.y + R + band);
        for (var y = Math.floor(y0 / G) * G + G / 2; y < y1; y += G) for (var x = Math.floor(x0 / G) * G + G / 2; x < x1; x += G) {
          var d = Math.abs(Math.hypot(x - r.x, y - r.y) - R); if (d > band) continue;
          var a = (1 - d / band) * life * 0.8;
          c.fillStyle = 'rgba(255,90,70,' + a + ')'; c.fillRect(x - 4, y - 3, 2, 6);
          c.fillStyle = 'rgba(110,255,140,' + a + ')'; c.fillRect(x - 1, y - 3, 2, 6);
          c.fillStyle = 'rgba(120,170,255,' + a + ')'; c.fillRect(x + 2, y - 3, 2, 6);
        }
      });
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still() && vis) raf = requestAnimationFrame(frame); }
    var lastMove = 0;
    stage.addEventListener('pointermove', function (e) {
      var t = performance.now(); if (t - lastMove < 380) return; lastMove = t;
      var r = stage.getBoundingClientRect(); drop(e.clientX - r.left, e.clientY - r.top);
    });
    stage.addEventListener('pointerdown', function (e) { var r = stage.getBoundingClientRect(); drop(e.clientX - r.left, e.clientY - r.top); });
    watch(stage, function (v) { vis = v; kick(); });
    return { start: function () { size(); kick(); }, size: size };
  })();

  // ------------------------------------------------------------ seam 1: test pattern bars pour down
  var bars = (function () {
    var el = $('.bars'), is = $$('.bars i');
    function scroll() {
      if (still()) return;
      var r = el.getBoundingClientRect(), p = clamp((innerHeight - r.top) / (innerHeight * 0.3), 0, 1);
      is.forEach(function (b, i) { var k = i % 7; b.style.setProperty('--s', (0.35 + 0.65 * smooth((p - k * 0.025) / 0.8)).toFixed(3)); });
    }
    return { scroll: scroll, reset: function () { if (still()) is.forEach(function (b) { b.style.setProperty('--s', 1); }); else scroll(); } };
  })();

  // ------------------------------------------------------------ bento: spotlight, pins, living tiles
  if (hover) $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', e.clientX - r.left + 'px'); t.style.setProperty('--my', e.clientY - r.top + 'px'); });
    t.addEventListener('pointerleave', function () { t.style.setProperty('--mx', '-400px'); });
  });
  var openTile = $('.t-open');
  if (hover) openTile.addEventListener('pointermove', function (e) {
    if (still()) return;
    var r = openTile.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    var img = $('.open-img img'); img.style.setProperty('--tx', (-x * 14).toFixed(1) + 'px'); img.style.setProperty('--ty', (-y * 10).toFixed(1) + 'px');
  });
  // labels type themselves onto the photo
  function typeLabel(pin) {
    var lbl = $('.lbl', pin), txt = pin.dataset[he() ? 'he' : 'en'];
    pin.classList.add('on'); pin.style.setProperty('--lead', 1);
    if (still()) { lbl.textContent = txt; return; }
    var i = 0; lbl.textContent = '';
    (function step() { lbl.textContent = txt.slice(0, ++i); if (i < txt.length) setTimeout(step, 45); })();
  }
  var pins = $$('.pin');
  pins.forEach(function (p) { p.addEventListener('click', function () { typeLabel(p); }); if (hover) p.addEventListener('pointerenter', function () { typeLabel(p); }); });
  watch(openTile, function (v) { if (v && !openTile.dataset.done) { openTile.dataset.done = 1; pins.forEach(function (p, i) { setTimeout(function () { typeLabel(p); }, 500 + i * 650); }); } });

  // LED strip tile: LEDs light in sequence, one dead LED gets replaced
  var strip = (function () {
    var leds = $$('.t-strip .pcb i'), tile = $('.t-strip'), vis = false, timer = 0, k = 0;
    var DEAD = 13;
    function show(n) { leds.forEach(function (l, i) { l.classList.toggle('on', i < n && !(i === DEAD && n < leds.length + 6)); l.classList.toggle('dead', i === DEAD && n >= DEAD + 1 && n < leds.length + 6); }); }
    function tick() {
      timer = 0; if (!vis || still()) { if (still()) show(leds.length + 6); return; }
      k = (k + 1) % (leds.length + 14); show(k);
      timer = setTimeout(tick, k === leds.length + 6 ? 900 : k > leds.length + 6 ? 220 : 160);
    }
    function kick() { if (!timer) timer = setTimeout(tick, 200); }
    watch(tile, function (v) { vis = v; if (v) kick(); });
    if (still()) show(leds.length + 6);
    return { kick: kick };
  })();

  // scope tile: a live trace drawn on the screen of their own oscilloscope
  var scopeTrace = (function () {
    var cv = $('.trace'), c = cv.getContext('2d'), vis = false, raf = 0;
    function size() { var r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); cv.width = Math.max(1, r.width * d); cv.height = Math.max(1, r.height * d); }
    function draw(t) {
      var W = cv.width, Hh = cv.height; c.clearRect(0, 0, W, Hh);
      c.strokeStyle = 'rgba(160,255,190,.18)'; c.lineWidth = 1;
      for (var g = 1; g < 8; g++) { c.beginPath(); c.moveTo(W * g / 8, 0); c.lineTo(W * g / 8, Hh); c.stroke(); }
      for (g = 1; g < 6; g++) { c.beginPath(); c.moveTo(0, Hh * g / 6); c.lineTo(W, Hh * g / 6); c.stroke(); }
      var ph = t / 900;
      c.shadowColor = 'rgba(120,255,160,.9)'; c.shadowBlur = 8; c.strokeStyle = '#b9ffc8'; c.lineWidth = Math.max(1.5, W / 160);
      c.beginPath();
      for (var x = 0; x <= W; x += 2) { var u = x / W * Math.PI * 6 + ph * 3; var y = Hh / 2 - Math.sin(u) * Hh * 0.28 - Math.sin(u * 3) * Hh * 0.04; x ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.stroke(); c.shadowBlur = 0;
    }
    function frame(t) { raf = 0; if (!vis || still()) return; draw(t); raf = requestAnimationFrame(frame); }
    function kick() { size(); if (still()) { draw(0); return; } if (!raf && vis) raf = requestAnimationFrame(frame); }
    watch(cv, function (v) { vis = v; kick(); });
    addEventListener('resize', function () { size(); draw(performance.now()); });
    return { kick: kick };
  })();

  // test pattern tile: cycles bars / greyscale / grid / red / green (with a dead pixel) / blue
  var pattern = (function () {
    var pts = $$('.pt'), i = 0, vis = false, timer = 0;
    pts[0].classList.add('on');
    function tick() { timer = 0; if (!vis || still()) return; pts[i].classList.remove('on'); i = (i + 1) % pts.length; pts[i].classList.add('on'); timer = setTimeout(tick, 1500); }
    function kick() { if (!timer) timer = setTimeout(tick, 1500); }
    watch($('.pattern'), function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // odometer figures
  function odo(el, to, dec) {
    if (still()) { el.textContent = dec ? to.toFixed(1) : to; return; }
    var t0 = performance.now(), dur = 1300;
    (function f(t) { var k = smooth((t - t0) / dur), v = to * (1 - Math.pow(1 - k, 3)); el.textContent = dec ? v.toFixed(1) : Math.round(v); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  $$('[data-odo]').forEach(function (el) { watch(el, function (v) { if (v && !el.dataset.done) { el.dataset.done = 1; $('.diag').style.setProperty('--d', 1); odo(el, +el.dataset.odo); } }); });
  $$('[data-odo-dec]').forEach(function (el) { watch(el, function (v) { if (v && !el.dataset.done) { el.dataset.done = 1; odo(el, +el.dataset.odoDec, true); } }); });

  // ------------------------------------------------------------ seam 2: scope trace, flat line -> clean signal
  var signal = (function () {
    var el = $('.signal'), paths = $$('.signal path');
    function draw(p) {
      var amp = smooth((p - 0.15) / 0.6) * 58, noise = 1 - smooth((p - 0.2) / 0.5), d = 'M0 80';
      for (var x = 0; x <= 1200; x += 6) {
        var y = 80 - Math.sin(x / 1200 * Math.PI * 10) * amp + Math.sin(x * 1.7) * 3 * noise * (p > 0.05 ? 1 : 0);
        d += ' L' + x + ' ' + y.toFixed(1);
      }
      paths.forEach(function (q) { q.setAttribute('d', d); });
    }
    function scroll() { if (still()) return; var r = el.getBoundingClientRect(); draw(clamp((innerHeight - r.top) / (innerHeight * 0.8), 0, 1)); }
    draw(still() ? 1 : 0);
    return { scroll: scroll, draw: draw };
  })();

  // ------------------------------------------------------------ repair tag: rows tick as they pass
  var rows = $$('.rows li');
  var tio = io ? new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('done', e.isIntersecting || e.boundingClientRect.top < 0); }); }, { rootMargin: '0px 0px -38% 0px' }) : null;
  rows.forEach(function (r) { tio ? tio.observe(r) : r.classList.add('done'); });

  // ------------------------------------------------------------ composer on the remote
  var SIZES = [32, 40, 43, 50, 55, 65, 75, 85];
  var st = { brand: 'Samsung', size: 55, sym: 'dark' };
  var SYM = {
    dark: { he: 'יש קול אבל אין תמונה', en: 'there is sound but no picture' },
    lines: { he: 'יש פסים במסך', en: 'there are lines on the screen' },
    off: { he: 'היא לא נדלקת', en: "it won't turn on" },
    flicker: { he: 'התמונה מהבהבת', en: 'the picture flickers' }
  };
  var mini = $('.mini-tv'), msgT = $('.msg-t'), typing = 0;
  function message() {
    var b = st.brand;
    if (he()) return 'שלום אולג, יש לי טלוויזיה ' + (b ? b + ' ' : '') + 'בגודל ' + st.size + ' אינץ\', ו' + SYM[st.sym].he + '. אפשר לשלוח לך תמונות?';
    return 'Hi Oleg, I have a ' + st.size + '-inch ' + (b ? b + ' ' : '') + 'TV and ' + SYM[st.sym].en + '. Can I send you photos?';
  }
  function compose(instant) {
    var m = message();
    mini.dataset.sym = st.sym;
    mini.style.setProperty('--w', Math.min(85, st.size) * (innerWidth < 500 ? 0.68 : 1));
    $('[data-inch]').textContent = st.size;
    $('[data-size-out]').textContent = st.size + '″';
    $('[data-compose-send]').href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(m);
    clearTimeout(typing);
    if (instant || still()) { msgT.textContent = m; return; }
    var from = msgT.textContent, i = 0;
    while (i < from.length && from[i] === m[i]) i++;
    (function step() { msgT.textContent = m.slice(0, i); if (i++ < m.length) typing = setTimeout(step, 14); })();
  }
  function press(group, btn) { $$('button', group).forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); }); }
  $$('[data-brand]').forEach(function (b) { b.addEventListener('click', function () { st.brand = b.dataset.brand; press(b.parentNode, b); compose(); }); });
  $$('.syms [data-sym]').forEach(function (b) { b.addEventListener('click', function () { st.sym = b.dataset.sym; press(b.parentNode, b); compose(); }); });
  $$('[data-size-step]').forEach(function (b) { b.addEventListener('click', function () { var i = SIZES.indexOf(st.size) + (+b.dataset.sizeStep); st.size = SIZES[clamp(i, 0, SIZES.length - 1)]; compose(); }); });
  // plain WhatsApp buttons carry a short hello
  function waLinks() { $$('[data-wa]').forEach(function (a) { a.href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(he() ? 'שלום אולג, יש לי שאלה לגבי תיקון טלוויזיה' : 'Hi Oleg, I have a question about a TV repair'); }); }

  // ------------------------------------------------------------ reviews: subtitles + channel buttons
  var subs = $$('.sub-q'), ch = 0, chEl = $('[data-ch]');
  function channel(n) { ch = (n + subs.length) % subs.length; subs.forEach(function (s, i) { s.classList.toggle('on', i === ch); }); chEl.textContent = ch + 1; }
  $$('[data-ch-step]').forEach(function (b) { b.addEventListener('click', function () { channel(ch + (+b.dataset.chStep)); }); });
  // drifting row: duplicate for a seamless loop
  var row = $('.drift-row'); row.innerHTML += row.innerHTML; $$('p', row).slice(4).forEach(function (p) { p.setAttribute('aria-hidden', 'true'); });

  // ------------------------------------------------------------ visit: building photo shrinks into its frame
  var visit = (function () {
    var sec = $('#visit'), ph = $('.v-photo'), fr = $('.v-frame'), stage = $('.v-stage');
    function scroll() {
      if (still()) return;
      var T = sec.getBoundingClientRect().top, vh = innerHeight;
      var f = fr.getBoundingClientRect();
      var land = (f.top - T) - vh * 0.1; // scroll distance until the frame sits near the top
      var p = smooth(clamp(-T / Math.max(1, land), 0, 1));
      var t = f.top * p, l = f.left * p, r = (innerWidth - f.right) * p, b = (vh - f.bottom) * p;
      ph.style.setProperty('--ct', t + 'px'); ph.style.setProperty('--cl', l + 'px'); ph.style.setProperty('--cr', r + 'px'); ph.style.setProperty('--cb', b + 'px');
      ph.style.setProperty('--cR', (22 * p) + 'px');
      stage.style.setProperty('--vh', (1 - smooth(p / 0.5)).toFixed(3));
      sec.style.setProperty('--vb', smooth((p - 0.55) / 0.45).toFixed(3));
    }
    function reset() { if (still()) { ['--ct', '--cl', '--cr', '--cb', '--cR'].forEach(function (k) { ph.style.removeProperty(k); }); stage.style.removeProperty('--vh'); sec.style.removeProperty('--vb'); } else scroll(); }
    return { scroll: scroll, reset: reset };
  })();

  // ------------------------------------------------------------ footer: curtain + wordmark letters rise
  var fit = function () {
    var w = $('.word'), s = $('[data-fit]'); if (!w || !s) return;
    w.style.fontSize = '120px';
    var k = (w.clientWidth || innerWidth) / s.scrollWidth; w.style.fontSize = Math.min(260, 120 * k * 0.98) + 'px';
  };
  var footer = (function () {
    var f = $('#foot'), main = $('main'), word = $('[data-fit]');
    word.innerHTML = word.textContent.split('').map(function (c, i) { return '<span class="chr" style="--i:' + i + '">' + c + '</span>'; }).join('');
    function size() { root.style.setProperty('--fh', still() ? '0px' : f.offsetHeight + 'px'); }
    function scroll() {
      var shown = innerHeight - main.getBoundingClientRect().bottom, up = still() || shown > f.offsetHeight * 0.35;
      word.style.setProperty('--rise', up ? '0' : '0.6em'); word.style.setProperty('--op', up ? 1 : 0);
    }
    return { size: size, scroll: scroll, reset: function () { size(); scroll(); } };
  })();

  // ------------------------------------------------------------ scroll loop
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      nav.classList.toggle('pill', scrollY > 40);
      hero.scroll(); bars.scroll(); signal.scroll(); visit.scroll(); footer.scroll();
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', function () { pixels.size(); fit(); footer.size(); compose(true); onScroll(); });

  // init
  texts();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(); footer.size(); });
  footer.reset(); hero.reset(); bars.reset(); visit.reset();
  if (!still()) pixels.start();
  onScroll();
  // the opening never blocks: it is pointer-events:none and gone after ~1.7s
  setTimeout(function () { var d = $('.deal'); if (d) d.remove(); }, 900);
})();
