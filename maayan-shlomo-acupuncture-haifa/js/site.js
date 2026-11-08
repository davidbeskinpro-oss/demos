(function () {
  var root = document.documentElement, WA = '972524481056';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var hoverable = matchMedia('(hover: hover)').matches;
  var TITLE = { he: 'מעין שלמה · דיקור, עיסוי ורפלקסולוגיה · מרכז פנימה, דרך חנקין 58, חיפה', en: 'Maayan Shlomo · Acupuncture, massage & reflexology · Pnima centre, 58 Derech Hankin, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור מעין שלמה קליניקה לדיקור, עיסוי רפלקסולוגיה · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Maayan Shlomo, clinic for acupuncture, massage and reflexology · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'מעין שלמה', 'Maayan Shlomo');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-foot]', 'מפת כף הרגל: אצבעות, כרית כף הרגל, הקשת והעקב, והנקודה "המעיין המבעבע"', 'Map of the sole: toes, ball, arch and heel, and the point called Bubbling Spring');
    aria('[data-t-call]', 'התקשרו למעין, 052-448-1056', 'Call Maayan, 052-448-1056');
    aria('[data-t-wa2]', 'וואטסאפ למעין', 'WhatsApp Maayan');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: מרכז פנימה, דרך חנקין 58, חיפה' : 'Map: Pnima centre, 58 Derech Hankin, Haifa'; });
    $$('.co.on b').forEach(function (b) { b.textContent = b.parentNode.dataset[l]; });
    $$('[data-labels] .lab').forEach(function (li) { if (li._done) $('text', li).textContent = li.dataset[l]; });
    $('[data-pn]').textContent = l === 'he' ? 'המעיין המבעבע' : 'Bubbling Spring';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ms334-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('ms334-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    hero.classList.add('ready');
    $$('.co').forEach(function (c) { typeIn(c, true); });
    layout(); ripples.kick(); ring.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: null, 1: [8.5, 13.5], 2: [15, 21], 3: null, 4: null, 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], shortEn = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && (t[0] === 0 && t[1] === 24)) { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
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
    $$('[data-week] span').forEach(function (s, i) { s.classList.toggle('today', i === n.d); });
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    // the week strip: her two openings, each with a bar as long as the hours
    $('[data-week]').innerHTML = (l ? shortHe : shortEn).map(function (d, k) { var t = H[k]; return '<span class="' + (t ? 'o' : '') + '"' + (t ? ' style="--f:' + ((t[1] - t[0]) / 6).toFixed(2) + '"' : '') + '>' + d + '</span>'; }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 10 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { setTimeout(function () { roll(o, true); }, 60); ob.disconnect(); } }, { threshold: .4 }).observe(o); else roll(o, true);
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), hphoto = $('[data-hphoto]');

  // ---------------------------------------------------------------- where a point of the room photo lands on screen (object-fit: cover)
  var IW = 1600, IH = 1040;
  function mapPt(x, y) {
    var W = hphoto.clientWidth, Hh = hphoto.clientHeight, s = Math.max(W / IW, Hh / IH), dw = IW * s, dh = IH * s, px = phone() ? .6 : .62;
    return [(W - dw) * px + x * dw, (Hh - dh) * .5 + y * dh];
  }

  // the city lights in her window
  var LIGHTS = [[1145, 42, 16], [1157, 82, 12], [1211, 89, 7], [1452, 50, 14], [1480, 37, 18], [1465, 79, 9], [1415, 64, 9], [1280, 131, 7], [1342, 135, 10], [1542, 45, 14]];
  var lightsEl = $('[data-lights]');
  lightsEl.innerHTML = LIGHTS.map(function (l, i) { return '<i style="--s:' + l[2] * 2 + 'px;--t:' + (2.2 + (i % 4) * .7) + 's;--dl:-' + (i * .53).toFixed(2) + 's"></i>'; }).join('');
  function placeLights() {
    $$('i', lightsEl).forEach(function (el, i) { var p = mapPt(LIGHTS[i][0] / IW, LIGHTS[i][1] / IH); el.style.left = p[0] + 'px'; el.style.top = p[1] + 'px'; el.hidden = p[0] < 0 || p[0] > hphoto.clientWidth; });
    // callouts sit on the photo, never on the headline or buttons
    var hr0 = hphoto.getBoundingClientRect(), boxes = $$('.h-title,.h-lead,.h-acts,.h-chips').map(function (e) { var r = e.getBoundingClientRect(); return [r.left - hr0.left - 24, r.top - hr0.top - 24, r.right - hr0.left + 24, r.bottom - hr0.top + 24]; });
    $$('.co').forEach(function (c) {
      var p = mapPt(+(rtl() ? c.dataset.x : (c.dataset.xl || c.dataset.x)), +c.dataset.y), w = 190;
      c.style.left = p[0] + 'px'; c.style.top = p[1] + 'px';
      var hit = boxes.some(function (b) { return p[0] < b[2] && p[0] + w > b[0] && p[1] - 14 < b[3] && p[1] + 18 > b[1]; });
      c.hidden = hit || p[0] < 12 || p[0] > hphoto.clientWidth - w || p[1] < 70;
    });
  }
  // callouts type themselves onto the photo
  function typeIn(c, instant) {
    var b = $('b', c), txt = c.dataset[root.lang], i = 0;
    c.classList.add('on'); clearInterval(c._t);
    if (instant || still()) { b.textContent = txt; return; }
    b.textContent = '';
    c._t = setInterval(function () { b.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(c._t); }, 45);
  }
  if (hoverable) hero.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    $$('.co').forEach(function (c) { var d = Math.hypot(c.offsetLeft - x, c.offsetTop - y); if (d < 120 && !c._near) { c._near = true; typeIn(c); } else if (d > 220) c._near = false; });
  });

  // ---------------------------------------------------------------- ripples: light wells up where you point, like a spring; warm motes drift in the lamp light
  var ripples = (function () {
    var cv = $('[data-ripples]'), c = cv.getContext('2d'), W = 0, Hh = 0, R = [], M = [], raf = 0, vis = true, lastAuto = 0, lastMove = 0;
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; Hh = cv.clientHeight; cv.width = W * dpr; cv.height = Hh * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      M = []; var n = phone() ? 26 : 50; for (var i = 0; i < n; i++) M.push({ x: Math.random() * W, y: Math.random() * Hh, r: .6 + Math.random() * 1.8, v: .08 + Math.random() * .25, p: Math.random() * 6.28 }); }
    function add(x, y, big) { R.push({ x: x, y: y, t: performance.now(), max: big ? 420 : 170 + Math.random() * 80, dur: big ? 2600 : 2000, s1: Math.random() * 6.28, s2: Math.random() * 6.28, a: big ? .55 : .32 }); if (R.length > 26) R.shift(); }
    function frame(t) {
      raf = 0; c.clearRect(0, 0, W, Hh);
      if (still() || !vis) return;
      if (t - lastAuto > 2300) { lastAuto = t; var p = mapPt(.47 + Math.random() * .12, .56 + Math.random() * .1); add(p[0], p[1], false); }
      R = R.filter(function (r) { return t - r.t < r.dur; });
      R.forEach(function (r) {
        var u = (t - r.t) / r.dur, e = 1 - Math.pow(1 - u, 3), rad = 6 + e * r.max;
        for (var k = 0; k < 2; k++) {
          var rr = rad * (1 - k * .32); if (rr < 4) continue;
          c.beginPath();
          for (var a = 0; a <= 64; a++) {
            var th = a / 64 * Math.PI * 2, w = 1 + Math.sin(th * 3 + r.s1 + u * 2) * .045 + Math.sin(th * 5 + r.s2) * .025;
            var x = r.x + Math.cos(th) * rr * w, y = r.y + Math.sin(th) * rr * w * .62;
            a ? c.lineTo(x, y) : c.moveTo(x, y);
          }
          c.strokeStyle = k ? 'rgba(233,165,143,' + (r.a * (1 - u) * .8).toFixed(3) + ')' : 'rgba(241,217,162,' + (r.a * (1 - u)).toFixed(3) + ')';
          c.lineWidth = k ? 1 : 1.5; c.stroke();
        }
      });
      M.forEach(function (m) {
        m.y -= m.v; m.x += Math.sin(t / 2400 + m.p) * .18; if (m.y < -4) { m.y = Hh + 4; m.x = Math.random() * W; }
        c.beginPath(); c.arc(m.x, m.y, m.r, 0, 6.283); c.fillStyle = 'rgba(255,224,170,' + (.18 + .22 * Math.sin(t / 900 + m.p) ** 2).toFixed(3) + ')'; c.fill();
      });
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && vis && !still()) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { var n = performance.now(); if (n - lastMove < 170) return; lastMove = n; var r = cv.getBoundingClientRect(); add(e.clientX - r.left, e.clientY - r.top, false); });
    hero.addEventListener('pointerdown', function (e) { var r = cv.getBoundingClientRect(); add(e.clientX - r.left, e.clientY - r.top, true); });
    watch(hero, function (v) { vis = v; kick(); });
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- Maayan: her photo surfaces out of a field of dots
  var meet = $('[data-meet]'), portrait = $('[data-portrait]'), dotsCv = $('[data-dots]'), dc = dotsCv.getContext('2d'), DOTS = [], dW = 0, dH = 0, lastDot = -1;
  function dotsSize() {
    var dpr = Math.min(2, devicePixelRatio || 1); dW = portrait.clientWidth; dH = portrait.clientHeight; dotsCv.width = dW * dpr; dotsCv.height = dH * dpr; dc.setTransform(dpr, 0, 0, dpr, 0, 0);
    DOTS = []; var g = 14; for (var y = g / 2; y < dH; y += g) for (var x = g / 2; x < dW; x += g) { var cx = dW * .32, cy = dH * .38; DOTS.push({ x: x, y: y, k: Math.hypot(x - cx, y - cy) / Math.hypot(dW, dH) * .9 + Math.random() * .25 }); }
    lastDot = -1;
  }
  function drawDots(p) {
    if (Math.abs(p - lastDot) < .004) return; lastDot = p;
    dc.clearRect(0, 0, dW, dH); if (p >= 1) return;
    dc.fillStyle = '#0e1b17'; dc.globalAlpha = 1;
    DOTS.forEach(function (d) { var v = clamp((p * 1.5 - d.k) / .35, 0, 1); var r = 8.6 * (1 - v); if (r > .3) { dc.beginPath(); dc.arc(d.x, d.y, r, 0, 6.283); dc.fill(); } });
    dc.fillStyle = '#dcb872';
    DOTS.forEach(function (d) { var v = clamp((p * 1.5 - d.k) / .35, 0, 1); if (v > 0 && v < 1) { dc.globalAlpha = (1 - v) * .9; dc.beginPath(); dc.arc(d.x, d.y, 1.4 + 2.2 * (1 - v), 0, 6.283); dc.fill(); } });
    dc.globalAlpha = 1;
  }

  // ---------------------------------------------------------------- treatments: the ring of real photos
  var ring = (function () {
    var wrap = $('[data-ringwrap]'), el = $('[data-ring]');
    $$('.rc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); el.appendChild(k); });
    var cards = $$('.rc', el), N = cards.length, rot = 0, vel = 0, raf = 0, vis = false, drag = false, lx = 0, last = 0, sc = 0;
    function R() { var cw = cards[0].offsetWidth || 240; return Math.max(cw * 1.08 / (2 * Math.tan(Math.PI / N)), phone() ? 300 : innerWidth * .4); }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; c.style.zIndex = ''; }); return; }
      var dt = last ? Math.min(50, t - last) : 16; last = t;
      if (!drag) { rot += (rtl() ? -1 : 1) * .006 * dt + vel * dt * .001; vel *= .94; }
      var rr = R(), base = rot + sc;
      cards.forEach(function (c, i) {
        var a = (i / N) * 360 + base, rad = a * Math.PI / 180, z = Math.cos(rad), f = (z + 1) / 2;
        c.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + rr.toFixed(0) + 'px) translateY(' + ((1 - f) * -30).toFixed(1) + 'px)';
        c.style.filter = 'brightness(' + (.35 + .65 * Math.pow(f, 1.6)).toFixed(3) + ')';
        c.style.zIndex = Math.round(f * 100);
      });
      el.style.transform = 'translateZ(' + (-rr).toFixed(0) + 'px) rotateX(-6deg)';
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .22; vel = dx * 3; });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(wrap, function (v) { vis = v; if (v) kick(); });
    return { kick: kick, scroll: function (p) { sc = p * 120 * (rtl() ? -1 : 1); } };
  })();

  // ---------------------------------------------------------------- the sole: drawn, zoned, walked, and the point
  var sole = $('[data-sole]'), footSvg = $('[data-foot]'), walk = $('[data-walk]'), thumb = $('[data-thumb]'), sphoto = $('[data-sphoto]');
  var WL = walk.getTotalLength(), steps = $$('[data-sgo]'), labels = $$('[data-labels] .lab'), soleStage = -1;
  var GLYPHS = 'אבגדהוזחטיכלמנסעפצקרשתABCDEFGHKMNPRSTUVWXYZ';
  function decode(li, on) {
    var b = $('text', li), txt = li.dataset[root.lang];
    if (!on) { if (li._done || li._run) { clearInterval(li._t); li._done = li._run = false; b.textContent = ''; } return; }
    if (li._done || li._run) return;
    if (still()) { b.textContent = txt; li._done = true; return; }
    li._run = true; var n = 0;
    li._t = setInterval(function () {
      n++; var keep = Math.floor(n / 2);
      b.textContent = txt.split('').map(function (ch, i) { return i < keep || ch === ' ' ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]; }).join('');
      if (keep >= txt.length) { clearInterval(li._t); li._run = false; li._done = true; b.textContent = txt; }
    }, 34);
  }
  function soleAt(p) {
    var s = footSvg.style, calm = still();
    if (calm) p = 1;
    var o = 1 - smooth(p / .22);
    s.setProperty('--o0', o.toFixed(4));
    for (var z = 0; z < 4; z++) s.setProperty('--z' + z, smooth((p - .2 - z * .06) / .08).toFixed(3));
    labels.forEach(function (li, i) { var on = p > .22 + i * .06; li.style.setProperty('--lo', on ? 1 : 0); decode(li, on); });
    var w = smooth((p - .48) / .3), L = WL * w;
    walk.style.strokeDasharray = L.toFixed(1) + ' ' + WL.toFixed(1);
    var pt = walk.getPointAtLength(Math.max(.01, L));
    thumb.setAttribute('cx', pt.x.toFixed(1)); thumb.setAttribute('cy', pt.y.toFixed(1));
    s.setProperty('--th', (w > 0 && w < 1 && !calm ? 1 : 0));
    var b = smooth((p - .8) / .1);
    s.setProperty('--pt', b.toFixed(3)); sole.style.setProperty('--pt', b.toFixed(3));
    sole.classList.toggle('bloom', b > .6);
    sphoto.style.setProperty('--pb', p > .45 ? 1 : 0);
    var st = p < .2 ? 0 : p < .48 ? 1 : p < .8 ? 2 : 3;
    if (calm) st = -1;
    if (st !== soleStage) { soleStage = st; steps.forEach(function (b2, i) { b2.classList.toggle('on', i === st || calm); }); }
  }
  var STAGE_AT = [.12, .36, .66, .94];
  steps.forEach(function (b, i) { b.addEventListener('click', function () {
    if (still()) return;
    var top = sole.getBoundingClientRect().top + scrollY, span = sole.offsetHeight - innerHeight;
    scrollTo({ top: top + span * STAGE_AT[i], behavior: 'smooth' });
  }); });

  // ---------------------------------------------------------------- the clinic: spotlight on tiles, a lamp through the dim room
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var lamp = $('[data-lamp]'), lampVis = false, lampHand = 0, lampRaf = 0;
  lamp.addEventListener('pointermove', function (e) { var r = lamp.getBoundingClientRect(); lampHand = performance.now(); lamp.style.setProperty('--lx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); lamp.style.setProperty('--ly', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); });
  function lampLoop(t) {
    lampRaf = 0; if (!lampVis || still()) return;
    if (t - lampHand > 1800) { lamp.style.setProperty('--lx', (50 + Math.sin(t / 2600) * 30).toFixed(1) + '%'); lamp.style.setProperty('--ly', (48 + Math.sin(t / 1900 + 1) * 22).toFixed(1) + '%'); }
    lampRaf = requestAnimationFrame(lampLoop);
  }
  watch(lamp, function (v) { lampVis = v; if (v && !lampRaf) lampRaf = requestAnimationFrame(lampLoop); });
  var chartImg = $('.t-chart img');

  // ---------------------------------------------------------------- the message: a needle slides into the chosen row, the text writes itself
  var trs = $$('[data-tr]'), days = $$('[data-day]'), msgEl = $('[data-msg]'), chat = $('[data-chat]'), shown = '', typing = 0, chatSeen = false;
  function radio(group, b) { group.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write(); }
  trs.forEach(function (b) { b.addEventListener('click', function () { radio(trs, b); }); });
  days.forEach(function (b) { b.addEventListener('click', function () { radio(days, b); }); });
  function compose() {
    var l = he(), k = l ? 'he' : 'en';
    var t = trs.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0].dataset[k];
    var d = days.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0].dataset[k];
    if (l) return 'שלום מעין, ' + (t ? 'אשמח לתאם ' + t + '.' : 'אשמח להתייעץ איתך לגבי טיפול.') + ' ' + (d ? 'נוח לי ' + d + '.' : 'מתי יש לך מקום?') + ' תודה!';
    return 'Hi Maayan, ' + (t ? 'I’d like to book ' + t + '.' : 'I’d like to ask you about a treatment.') + ' ' + (d ? 'It would suit me ' + d + '.' : 'When do you have a free slot?') + ' Thanks!';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing); chat.classList.remove('typing');
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    chat.classList.add('typing');
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st); else chat.classList.remove('typing');
    })(t0);
  }
  watch(chat, function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var care = $('[data-care]'), words = $('[data-words]'), rail = $('[data-wrail]'), visit = $('[data-visit]'), vphoto = $('[data-vphoto]'), vcards = $('[data-vcards]'), foot = $('[data-foot]'), dock = $('[data-dock]');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function through(el) { var r = el.getBoundingClientRect(); return clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    dock.classList.toggle('show', scrollY > vh * .7);
    // the next section wells up out of the hero in a widening ring
    var mr = meet.getBoundingClientRect(), wp = calm ? 1 : smooth((vh - mr.top) / (vh * .75));
    meet.style.setProperty('--well', (wp * 150).toFixed(1) + '%');
    meet.style.setProperty('--ws', (1 + (1 - wp) * .25).toFixed(3));
    var pr = portrait.getBoundingClientRect(), pp = calm ? 1 : smooth((vh * .92 - pr.top) / (vh * .6));
    drawDots(pp);
    portrait.style.setProperty('--draw', (1 - smooth((vh * .8 - pr.top) / (vh * .5))) * (calm ? 0 : 1));
    // ring turns with the scroll
    if (!calm) ring.scroll(through(care));
    // the sole
    soleAt(prog(sole));
    // chart drifts in its tile
    if (chartImg) chartImg.style.setProperty('--cy', calm ? '0px' : ((through(chartImg) - .5) * -40).toFixed(1) + 'px');
    // reviews carried sideways
    if (!calm) {
      var extra = Math.max(0, rail.scrollWidth - innerWidth), wq = smooth((through(words) - .15) / .7);
      rail.style.setProperty('--wx', ((rtl() ? 1 : -1) * extra * wq).toFixed(1) + 'px');
    } else rail.style.removeProperty('--wx');
    // visit: the photo shrinks from full screen into its frame
    if (!calm && innerWidth > 900) {
      var kp = smooth(prog(visit) / .55), PW = vphoto.parentNode.clientWidth, PH = vphoto.parentNode.clientHeight;
      var start = PW * .58, end = PW * .03, L = rtl() ? end : start, Rr = rtl() ? start : end;
      vphoto.style.setProperty('--pt', (PH * .16 * kp).toFixed(1) + 'px'); vphoto.style.setProperty('--pb', (PH * .1 * kp).toFixed(1) + 'px');
      vphoto.style.setProperty('--pl', (L * kp).toFixed(1) + 'px'); vphoto.style.setProperty('--pr', (Rr * kp).toFixed(1) + 'px'); vphoto.style.setProperty('--prr', (26 * kp).toFixed(1) + 'px');
      vcards.style.setProperty('--vo', smooth((kp - .55) / .4).toFixed(3));
    } else { ['--pt', '--pb', '--pl', '--pr', '--prr'].forEach(function (k) { vphoto.style.removeProperty(k); }); vcards.style.removeProperty('--vo'); }
    // footer rings rise
    var fr = foot.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / fr.height);
    foot.style.setProperty('--rise', ((1 - fp) * 160).toFixed(1));
  }

  function layout() { ripples.size(); placeLights(); dotsSize(); lastDot = -1; tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () {
    if (once) return; once = true;
    requestAnimationFrame(function () { hero.classList.add('ready'); ripples.kick(); });
    $$('.co').forEach(function (c, i) { setTimeout(function () { typeIn(c); }, still() ? 0 : 1400 + i * 550); });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { layout(); });
})();
