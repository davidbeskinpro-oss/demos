(function () {
  var root = document.documentElement, WA = '972526249849';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 900; };
  var TITLE = { he: 'אטיה מנעולים · מנעולן בקריות ובחיפה · הרב מיימון 5, קריית ביאליק', en: 'Atia Locks · Locksmith in the Krayot and Haifa · 5 HaRav Maimon St, Kiryat Bialik' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור אטיה מנעולים · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Atia Locks · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting, es[0]); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    var H = l === 'he';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[H ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', H ? h : e); }); };
    aria('[data-t-brand]', 'אטיה מנעולים', 'Atia Locks');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-hook]', 'במה צריך עזרה', 'What you need help with');
    aria('[data-t-call]', 'התקשרו לשחר, 052-624-9849', 'Call Shachar, 052-624-9849');
    aria('[data-t-wa]', 'וואטסאפ לשחר', 'WhatsApp Shachar');
    $('[data-t-map]').title = H ? 'מפה: הרב מיימון 5, קריית ביאליק' : 'Map: 5 HaRav Maimon St, Kiryat Bialik';
    var pl = $('[data-place]'); pl.placeholder = pl.dataset[H ? 'phHe' : 'phEn'];
    $$('[data-decode]').forEach(function (h) { h.textContent = h.dataset[l]; });
    doorState(lastOpen, true);
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('atia-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch (the stairwell light)
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('atia-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    hero.classList.add('ready');
    layout(); filings.kick(); ring.kick(); lens.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed, [0,24] = all day
  var H = { 0: [0, 24], 1: [0, 24], 2: [0, 24], 3: [0, 24], 4: [0, 24], 5: [0, 24], 6: [0, 24] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  var allDay = function (t) { return t && t[0] === 0 && t[1] === 24; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (allDay(t)) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
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

  // ---------------------------------------------------------------- entrances
  $$('.bento,.r-bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 70 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); if (e.target.querySelector('[data-decode]')) decode(e.target.querySelector('[data-decode]')); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // labels decode out of scrambled glyphs
  var GLY = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHKLMNPRSTVXZ#*' };
  function decode(h) {
    var fin = h.dataset[root.lang], pool = GLY[root.lang], t0 = performance.now(), dur = 700;
    if (still()) { h.textContent = fin; return; }
    (function st(t) {
      var p = (t - t0) / dur, n = Math.floor(fin.length * clamp(p, 0, 1));
      h.textContent = fin.slice(0, n) + fin.slice(n).replace(/\S/g, function () { return pool[Math.floor(Math.random() * pool.length)]; });
      if (p < 1) requestAnimationFrame(st); else h.textContent = fin;
    })(t0);
  }

  // ---------------------------------------------------------------- hero headline: letter by letter, filled out of a brass outline
  $$('[data-split] > span[lang], .wordmark > span[lang]').forEach(function (sp) {
    var i = 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- the peephole: follows the hand, drifts by itself on touch
  var lens = (function () {
    var el = $('[data-lens]'), inn = $('[data-lensin]'), ph = $('[data-hphoto]'), Ph, Pw, ox = 0, W, Hh, r, M = 1.32, x, y, tx, ty, raf = 0, vis = true, hand = false, pause = 0, t0 = performance.now();
    function size() {
      W = hero.clientWidth; Hh = hero.clientHeight; Ph = ph.clientHeight; Pw = ph.clientWidth; ox = ph.offsetLeft;
      var s = phone() ? Math.min(W * .46, 220) : clamp(Math.min(W, Hh) * .34, 220, 340); r = s / 2;
      el.style.setProperty('--ls', s + 'px'); inn.style.width = Pw + 'px'; inn.style.height = Ph + 'px';
      if (x === undefined) { x = tx = phone() ? W * .5 : ox + Pw * .5; y = ty = Ph * .5; }
      place();
    }
    function auto(t) {
      var k = (t - t0) / 1000;
      if (phone()) { tx = W * (.5 + .09 * Math.sin(k * .42)); ty = Ph * (.47 + .05 * Math.sin(k * .71 + 1)); }
      else { tx = ox + Pw * (.42 + .1 * Math.sin(k * .33)); ty = Ph * (.46 + .08 * Math.sin(k * .52 + 1)); }
    }
    function place() {
      el.style.transform = 'translate3d(' + (x - r).toFixed(1) + 'px,' + (y - r).toFixed(1) + 'px,0)';
      inn.style.transform = 'translate3d(' + (r - (x - ox) * M).toFixed(1) + 'px,' + (r - y * M).toFixed(1) + 'px,0) scale(' + M + ')';
    }
    function frame(t) {
      raf = 0;
      if (still()) { x = phone() ? W * .5 : ox + Pw * .42; y = Ph * .47; place(); return; }
      if (!hand && t > pause) auto(t);
      x = lerp(x, tx, .08); y = lerp(y, ty, .08); place();
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var b = hero.getBoundingClientRect(); hand = true; tx = e.clientX - b.left; ty = e.clientY - b.top; });
    hero.addEventListener('pointerleave', function () { hand = false; });
    hero.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse' || e.target.closest('a,button')) return; var b = hero.getBoundingClientRect(); tx = e.clientX - b.left; ty = e.clientY - b.top; pause = performance.now() + 3500; });
    watch(hero, function (v) { vis = v; kick(); });
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- his key logo, made of steel and brass filings that part under the hand
  var filings = (function () {
    var cv = $('[data-filings]'), c = cv.getContext('2d'), img = $('[data-filingsrc]');
    var P = [], w, h, raf = 0, vis = true, t0 = 0, mx = -999, my = -999, ok = false;
    function sample() {
      try {
        var sc = document.createElement('canvas'), iw = 156, ih = 207; sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data, pts = [];
        for (var yy = 0; yy < ih; yy += 1) for (var xx = 0; xx < iw; xx += 1) if (d[(yy * iw + xx) * 4 + 3] > 140) pts.push([xx / iw, yy / ih]);
        var want = phone() ? 900 : 1800, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) {
          var q = pts[Math.floor(f)], b = Math.random();
          P.push({ hx: q[0], hy: q[1], col: b < .22 ? '#ead296' : b < .35 ? '#c9a35a' : b < .7 ? '#a7abb4' : '#7d8290', x: Math.random(), y: Math.random(), vx: 0, vy: 0, ph: Math.random() * 6.28, dl: Math.random() * .8, up: .4 + Math.random() });
        }
        ok = true;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); P.forEach(function (p) { p.sx = undefined; }); }
    function box() {
      var bh = phone() ? h * .2 : Math.min(h * .3, 300), bw = bh * 156 / 207, cx = phone() ? .17 : .09;
      cx = w * (rtl() ? cx : 1 - cx);
      return { x: cx - bw / 2, y: phone() ? h * .1 : h * .12, w: bw, h: bh };
    }
    function frame(now) {
      raf = 0; if (!ok) return;
      var calm = still(), T = (now - t0) / 1000, B = box();
      var hr = hero.getBoundingClientRect(), lift = calm ? 0 : clamp(-hr.top / (hr.height * .6), 0, 1.3);
      c.clearRect(0, 0, w, h);
      var sz = phone() ? 1.8 : 2.2;
      for (var i = 0; i < P.length; i++) {
        var p = P[i], a = calm ? 1 : smooth((T - .5 - p.dl) / 1.2);
        var tx = B.x + p.hx * B.w + Math.sin(T * 1.2 + p.ph) * 1.2, ty = B.y + p.hy * B.h + Math.cos(T + p.ph) * 1.2;
        if (lift > 0) { ty -= lift * h * .5 * p.up; tx += Math.sin(p.ph) * lift * 60; }
        if (calm) { p.x = tx; p.y = ty; }
        else if (a < 1) { if (p.sx === undefined) { p.sx = B.x + B.w / 2 + (p.hx - .5) * w * .9; p.sy = h + 20 + p.hy * 80; } p.x = lerp(p.sx, tx, a); p.y = lerp(p.sy, ty, a); }
        else {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 9000) { var f = (9000 - d2) / 9000 * 2.8, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
          p.vx += (tx - p.x) * .05; p.vy += (ty - p.y) * .05; p.vx *= .84; p.vy *= .84; p.x += p.vx; p.y += p.vy;
        }
        c.globalAlpha = (phone() ? .55 : .8) * (1 - clamp(lift, 0, 1));
        c.fillStyle = p.col; c.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
      }
      c.globalAlpha = 1;
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() { size(); sample(); t0 = performance.now(); kick(); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // ---------------------------------------------------------------- the door: bolts back, the leaf swings in, we walk through
  var door = $('[data-door]'), scene = $('[data-dscene]'), frameEl = $('[data-frame]'), leaf = $('[data-leaf]'), bolts = $$('[data-bolts] i'),
    shade = $('.shade', leaf), spill = $('[data-spill]'), dcopy = $('[data-dcopy]'), dstate = $('[data-dstate]'), veil = $('[data-veil]'), S = 3, lastOpen = false;
  function doorLayout() {
    scene.style.transform = 'none';
    var sr = scene.getBoundingClientRect(), fr = frameEl.getBoundingClientRect();
    scene.style.setProperty('--ox', (fr.left - sr.left + fr.width / 2) + 'px');
    scene.style.setProperty('--oy', (fr.top - sr.top + fr.height / 2) + 'px');
    S = Math.max(innerWidth / fr.width, innerHeight / fr.height) * 1.18;
  }
  function doorState(open, force) {
    if (open === lastOpen && !force) return;
    lastOpen = open;
    dstate.dataset.he = open ? 'פתוח' : 'נעול'; dstate.dataset.en = open ? 'Open' : 'Locked';
    dstate.parentNode.classList.toggle('open', open);
    force ? (dstate.textContent = dstate.dataset[root.lang]) : decode(dstate);
  }

  // ---------------------------------------------------------------- the key ring of his photos: turns by itself, with the scroll and with a drag
  var ring = (function () {
    var wrap = $('[data-ringwrap]'), el = $('[data-ring]'), kr = $('.keyring', wrap), TILT = 9;
    $$('.rc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $$('img', k).forEach(function (i) { i.alt = ''; i.removeAttribute('data-alt-he'); }); el.appendChild(k); });
    var cards = $$('.rc', el), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = false, last = 0, r = 400;
    function R() { var cw = cards[0].offsetWidth || 180; return Math.max(cw * 1.08 / (2 * Math.tan(Math.PI / N)), phone() ? 250 : Math.min(innerWidth * .4, 620)); }
    function size() {
      r = R();
      var hh = 2 * r * Math.sin(TILT * Math.PI / 180);
      kr.style.width = 2 * r + 'px'; kr.style.height = hh + 'px'; kr.style.top = (el.offsetTop - hh / 2) + 'px';
    }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (7 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var sc = scrollY * .05 * (rtl() ? 1 : -1), T = t / 1000;
      cards.forEach(function (c, i) {
        var a = rot + sc + i * step, f = Math.cos(a * Math.PI / 180), sw = Math.sin(T * 1.3 + i * 1.7) * 3.5;
        c.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + r.toFixed(1) + 'px) rotateZ(' + sw.toFixed(2) + 'deg)';
        c.style.filter = 'brightness(' + (.28 + .72 * Math.pow(Math.max(f, 0), 1.5)).toFixed(3) + ')';
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    el.style.transform = 'rotateX(-' + TILT + 'deg)';
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .25; vel = dx * 2 * (rtl() ? 1 : -1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(wrap, function (v) { vis = v; if (v) kick(); });
    return { kick: kick, size: size };
  })();

  // ---------------------------------------------------------------- services: on-screen switch, cursor spotlight, the code pad typing
  var svc = $('#services'), svcOn = false;
  watch(svc, function (v) { svcOn = v; svc.classList.toggle('on', v); });
  $$('.tile, .rt').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var pin = $('[data-pinscreen]'), pkeys = $$('.keys i'), typed = 0;
  setInterval(function () {
    if (!svcOn || still()) { pin.textContent = '••••'; return; }
    if (typed === 4) { pin.textContent = he() ? 'פתוח' : 'OPEN'; typed = 5; return; }
    if (typed === 5) { typed = 0; pin.textContent = '____'; return; }
    var k = pkeys[Math.floor(Math.random() * 10)]; k.classList.add('hit'); setTimeout(function () { k.classList.remove('hit'); }, 160);
    typed++; pin.textContent = '••••'.slice(0, typed) + '____'.slice(typed);
  }, 560);

  // ---------------------------------------------------------------- Shachar: the photo leans toward the hand; his card sticks on
  var tilt = $('[data-tilt]');
  tilt.addEventListener('pointermove', function (e) { if (still() || e.pointerType !== 'mouse') return; var r = tilt.getBoundingClientRect(); tilt.style.setProperty('--tx', (((e.clientX - r.left) / r.width - .5) * 10).toFixed(2) + 'deg'); tilt.style.setProperty('--ty', (-((e.clientY - r.top) / r.height - .5) * 8).toFixed(2) + 'deg'); });
  tilt.addEventListener('pointerleave', function () { tilt.style.setProperty('--tx', '0deg'); tilt.style.setProperty('--ty', '0deg'); });
  var stk = $('[data-sticker]');
  watch(stk.parentNode, function (v) { if (v) stk.classList.add('in'); }, { threshold: .45 });

  // odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 4) % 10; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    watch(o, function (v) { if (v) roll(o, true); }, { threshold: .3 });
  });

  // ---------------------------------------------------------------- reviews land on the board (and lift off again when it leaves)
  var board = $('[data-board]');
  $$('.note', board).forEach(function (n, i) { n.style.setProperty('--d', i * 140 + 'ms'); });
  watch(board, function (v) { board.classList.toggle('in', v); }, { threshold: .15 });

  // ---------------------------------------------------------------- the message: keys off the hook, a place, the bubble writes itself
  var msgSec = $('#message'), keys = $$('[data-k]'), place = $('[data-place]'), msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
  keys.forEach(function (k, i) {
    k.style.setProperty('--i', i);
    k.addEventListener('click', function () { k.setAttribute('aria-pressed', k.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); write(); });
  });
  place.addEventListener('input', function () { write(); });
  watch(msgSec, function (v) { msgSec.classList.toggle('on', v); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = keys.filter(function (k) { return k.getAttribute('aria-pressed') === 'true'; }).map(function (k) { return k.dataset[l ? 'he' : 'en']; });
    var where = place.value.trim().slice(0, 60);
    var s = l ? 'שלום שחר, אשמח לעזרה עם ' + (picked.length ? list(picked, true) : 'מנעול') + '.' : 'Hi Shachar, I’d like help with ' + (picked.length ? list(picked, false) : 'a lock') + '.';
    if (where) s += l ? ' המיקום: ' + where + '.' : ' Location: ' + where + '.';
    return s;
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- footer: curtain, wordmark fitted and rising, the light coming up
  var foot = $('[data-foot]'), fl = $('.f-light'), wm = $('[data-fit]'), bar = $('.sticker-bar');
  watch(foot, function (v) { if (v) foot.classList.add('in'); }, { threshold: .2 });
  function fit() {
    wm.style.fontSize = '100px';
    var sp = $('span[lang="' + root.lang + '"]', wm), w = sp.getBoundingClientRect().width || 1, avail = $('.f-in').clientWidth;
    wm.style.fontSize = Math.min(220, Math.floor(100 * avail / w * .96)) + 'px';
    foot.classList.toggle('tall', foot.offsetHeight > innerHeight * .9);
  }

  // ---------------------------------------------------------------- one scroll loop
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    bar.classList.toggle('show', scrollY > hero.offsetHeight * .5);
    if (!calm) filings.kick();
    // the door
    var p = calm ? 0 : prog(door), b = smooth(p / .2), o = smooth((p - .2) / .4), dd = smooth((p - .56) / .4), ct = smooth((p - .4) / .18);
    bolts.forEach(function (bo, i) { bo.style.transform = 'translateX(' + (-smooth((b * 1.4) - i * .13) * 34).toFixed(1) + 'px)'; });
    doorState(!calm && b > .9);
    leaf.style.transform = calm ? '' : 'rotateY(' + (o * 98).toFixed(2) + 'deg)';
    shade.style.opacity = (o * .6).toFixed(3);
    veil.style.opacity = calm ? '' : smooth((dd - .8) / .2).toFixed(3);
    spill.style.opacity = o.toFixed(3);
    spill.style.transform = 'scaleX(' + (.3 + o * .7).toFixed(3) + ')';
    scene.style.transform = calm ? '' : 'scale(' + lerp(1, S, dd * dd).toFixed(4) + ')';
    dcopy.style.opacity = calm ? '' : (1 - ct).toFixed(3);
    dcopy.style.translate = calm ? '' : '0 ' + (-ct * 40).toFixed(1) + 'px';
    // the footer light rises as you arrive
    var fr = foot.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / Math.max(1, fr.height));
    fl.style.setProperty('--rise', ((1 - fp) * -120).toFixed(1) + 'px');
  }

  function layout() { lens.size(); filings.size(); doorLayout(); ring.size(); fit(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; hero.classList.add('go'); requestAnimationFrame(function () { hero.classList.add('ready'); lens.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(); go(); });
  setTimeout(go, 900);
  addEventListener('load', function () { layout(); });
})();
