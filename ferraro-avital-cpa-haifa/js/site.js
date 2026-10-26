(function () {
  var root = document.documentElement, WA = '97248624524', MAIL = 'office@ferraro.co.il';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var eio = function (t) { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 1000; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'פררו אביטל ושות׳ רואי חשבון · בלפור 2, חיפה', en: 'Ferraro, Avital & Co. CPA · 2 Balfour St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור פררו אביטל ושות׳ רואי חשבון · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Ferraro, Avital & Co. CPA · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var R2 = Math.SQRT1_2;

  // ---------------------------------------------------------------- glyph decode: labels settle out of scrambled letters
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת0123456789', en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' };
  function decode(el, txt, dur) {
    cancelAnimationFrame(el._dec);
    if (still()) { el.textContent = txt; return; }
    var set = GL[he() ? 'he' : 'en'], t0 = performance.now(); dur = dur || 600;
    (function st(t) {
      var k = clamp((t - t0) / dur, 0, 1), n = Math.floor(k * txt.length), out = txt.slice(0, n);
      for (var i = n; i < txt.length; i++) out += txt[i] === ' ' ? ' ' : set[Math.floor(Math.random() * set.length)];
      el.textContent = out;
      if (k < 1) el._dec = requestAnimationFrame(st);
    })(t0);
  }

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'פררו אביטל ושות׳ רואי חשבון', 'Ferraro, Avital & Co. CPA');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-visit]', 'יצירת קשר', 'Contact');
    aria('[data-t-topic]', 'נושא', 'Subject');
    aria('[data-t-who]', 'מי פונה', 'Who is writing');
    aria('[data-t-thumbs]', 'תמונות המשרד', 'Office photos');
    aria('[data-t-call]', 'התקשרו למשרד, 04-862-4524', 'Call the office, 04-862-4524');
    aria('[data-t-wa]', 'וואטסאפ למשרד', 'WhatsApp the office');
    aria('[data-wprev]', 'התמונה הקודמת', 'Previous photo');
    aria('[data-wnext]', 'התמונה הבאה', 'Next photo');
    aria('[data-rprev]', 'הביקורת הקודמת', 'Previous review');
    aria('[data-rnext]', 'הביקורת הבאה', 'Next review');
    $$('[data-callout] b').forEach(function (b) { b.textContent = b.parentNode.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('fa-lang', l); } catch (e) {}
    texts(l); hours(); write(true); bigSet(curLine, true); walkCap(curShot, true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); root.classList.remove('opening'); delete root.dataset.motionAuto;
    try { localStorage.setItem('fa-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    layout(); folds.kick(); dust.kick(); write(true); pad.rest();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8, 16.5], 1: [8, 16.5], 2: [8, 16.5], 3: [8, 16.5], 4: [8, 16.5], 5: [8, 12.5], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function allDay() { for (var k = 0; k < 7; k++) if (!H[k] || H[k][0] !== 0 || H[k][1] !== 24) return false; return true; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (allDay()) { open = true; txt = l ? 'פתוח 24/7' : 'Open 24/7'; }
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
    // the dial: today's opening hours as an arc on a 24-hour face, the hand at the time in Haifa
    var arc = $('[data-arc]'), hand = $('[data-hand]');
    if (arc) {
      var pt = function (h) { var a = (h / 24) * Math.PI * 2 - Math.PI / 2; return (60 + 50 * Math.cos(a)).toFixed(2) + ' ' + (60 + 50 * Math.sin(a)).toFixed(2); };
      arc.setAttribute('d', t ? 'M' + pt(t[0]) + ' A50 50 0 ' + (t[1] - t[0] > 12 ? 1 : 0) + ' 1 ' + pt(t[1]) : '');
      hand.style.transform = 'rotate(' + (n.h / 24 * 360).toFixed(1) + 'deg)';
    }
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
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- concept bar height (it wraps on phones)
  var cb = $('.concept');
  function cbh() { root.style.setProperty('--cbh', cb.offsetHeight + 'px'); }

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 70 + 'ms'); }); });
  $$('.cbento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 70 + 'ms'); });
  $$('.qa details').forEach(function (t, i) { t.style.setProperty('--d', i * 50 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  // the under-sheet is uncovered by the peel, not by scrolling into view
  $$('.under [data-reveal]').forEach(function (el) { if (rio) rio.unobserve(el); });
  // living drawings: stagger index
  ['.v-ledger .rows', '.v-bars .bars', '.v-calc .keys'].forEach(function (s) { var g = $(s); if (g) $$('rect', g).forEach(function (r, i) { r.style.setProperty('--k', i); }); });
  $$('.folder').forEach(function (f, i) { f.style.setProperty('--k', i); });

  // headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 10 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), stage = $('[data-stage]'), sheet = $('[data-sheet]'), under = $('[data-under]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- the fold: geometry shared by the hero sheet and the review pad
  // corner = bottom-left, crease at 45° like the logo; s = distance of the crease from the corner along the diagonal
  function fdist(x, y, Hh) { return (x + Hh - y) * R2; }
  function clipHalf(poly, Hh, s, keepAbove) {
    var out = [], n = poly.length;
    for (var i = 0; i < n; i++) {
      var a = poly[i], b = poly[(i + 1) % n], fa = fdist(a[0], a[1], Hh) - s, fb = fdist(b[0], b[1], Hh) - s;
      var ina = keepAbove ? fa >= 0 : fa < 0, inb = keepAbove ? fb >= 0 : fb < 0;
      if (ina) out.push(a);
      if (ina !== inb) { var t = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    return out;
  }
  function reflect(p, Hh, s) { var k = 2 * (s - fdist(p[0], p[1], Hh)); return [p[0] + k * R2, p[1] - k * R2]; }
  var ptsStr = function (pp) { return pp.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); };
  var cssPoly = function (pp) { return pp.length ? 'polygon(' + pp.map(function (p) { return p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px'; }).join(',') + ')' : 'polygon(0 0,0 0,0 0)'; };
  function fold(W, Hh, s) {
    var rect = [[0, 0], [W, 0], [W, Hh], [0, Hh]];
    var keep = clipHalf(rect, Hh, s, true), cut = clipHalf(rect, Hh, s, false);
    var shade = clipHalf(clipHalf(rect, Hh, s, true), Hh, s + Math.min(60, s * .8 + 10), false);
    return { keep: keep, flap: cut.map(function (p) { return reflect(p, Hh, s); }), shade: shade,
      c0: [s * R2, Hh - s * R2], c1: [2 * s * R2, Hh - 2 * s * R2], s1: [(s + Math.min(60, s * .8 + 10)) * R2, Hh - (s + Math.min(60, s * .8 + 10)) * R2] };
  }
  function grad(g, a, b) { g.setAttribute('x1', a[0]); g.setAttribute('y1', a[1]); g.setAttribute('x2', b[0]); g.setAttribute('y2', b[1]); }

  var fShade = $('[data-fshade]'), fFlap = $('[data-fflap]'), flg = $('[data-flg]'), fls = $('[data-fls]');
  var heroLift = 0, heroLiftT = 0;
  function s0() { return phone() ? 40 : 58; }
  function drawHero(e) {
    var W = stage.clientWidth, Hh = stage.clientHeight, smax = (W + Hh) * R2 + 40;
    var s = lerp(s0() + heroLift, smax, e), g = fold(W, Hh, s);
    sheet.style.clipPath = cssPoly(g.keep);
    fFlap.setAttribute('points', ptsStr(g.flap)); fShade.setAttribute('points', ptsStr(g.shade));
    grad(flg, g.c0, g.c1); grad(fls, g.c0, g.s1);
    root.classList.toggle('peeling', e > .01);
  }
  if (fine) {
    sheet.addEventListener('pointermove', function (ev) { var r = stage.getBoundingClientRect(), dx = ev.clientX - r.left, dy = r.bottom - ev.clientY; heroLiftT = Math.hypot(dx, dy) < 220 ? 34 : 0; liftLoop(); });
    sheet.addEventListener('pointerleave', function () { heroLiftT = 0; liftLoop(); });
  }
  var liftRaf = 0;
  function liftLoop() { if (liftRaf) return; liftRaf = requestAnimationFrame(function st() { liftRaf = 0; heroLift += (heroLiftT - heroLift) * .18; if (Math.abs(heroLiftT - heroLift) > .3) liftRaf = requestAnimationFrame(st); else heroLift = heroLiftT; tick(); }); }

  // ---------------------------------------------------------------- the logo's squares: a field of little sheets whose corners fold orange under the hand
  var folds = (function () {
    var cv = $('[data-folds]'), c = cv.getContext('2d'), cell = 58, cols, rows, act, w, h, raf = 0, vis = true, px = -1, py = -1, t0 = performance.now();
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = sheet.clientWidth; h = sheet.clientHeight; cell = phone() ? 44 : 58;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / cell); rows = Math.ceil(h / cell); act = new Float32Array(cols * rows);
      if (still()) for (var k = 0; k < act.length; k++) act[k] = Math.random() < .06 ? .8 : 0;
    }
    function rr(x, y, s, r) { c.moveTo(x + r, y); c.arcTo(x + s, y, x + s, y + s, r); c.arcTo(x + s, y + s, x, y + s, r); c.arcTo(x, y + s, x, y, r); c.arcTo(x, y, x + s, y, r); c.closePath(); }
    function draw() {
      c.clearRect(0, 0, w, h);
      var pad = cell * .2, s = cell - pad * 2;
      c.strokeStyle = 'rgba(243,239,232,.05)'; c.lineWidth = 1; c.beginPath();
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) rr(x * cell + pad, y * cell + pad, s, 4);
      c.stroke();
      for (var k = 0; k < act.length; k++) {
        var a = act[k]; if (a < .03) continue;
        var cx = (k % cols) * cell + pad, cy = Math.floor(k / cols) * cell + pad, f = s * .5 * a;
        c.strokeStyle = 'rgba(243,239,232,' + (.05 + a * .25).toFixed(3) + ')'; c.beginPath(); rr(cx, cy, s, 4); c.stroke();
        c.fillStyle = 'rgba(232,127,44,' + (.35 + a * .6).toFixed(3) + ')';
        c.beginPath(); c.moveTo(cx, cy + s - f); c.lineTo(cx + f * .9, cy + s - f); c.lineTo(cx + f, cy + s); c.closePath(); c.fill();
      }
    }
    function frame(t) {
      raf = 0; if (!vis || still()) { draw(); return; }
      var T = (t - t0) / 1000;
      for (var k = 0; k < act.length; k++) act[k] *= .94;
      if (px >= 0) {
        for (var k2 = 0; k2 < act.length; k2++) { var dx = (k2 % cols + .5) * cell - px, dy = (Math.floor(k2 / cols) + .5) * cell - py, d = Math.sqrt(dx * dx + dy * dy); if (d < 150) act[k2] = Math.max(act[k2], 1 - d / 150); }
      } else {
        // no hand: a diagonal wave runs along the logo's fold direction, every four seconds
        var front = ((T % 4) / 4) * (cols + rows) * 1.2 - rows * .1;
        for (var k3 = 0; k3 < act.length; k3++) { var ix = k3 % cols, iy = rows - 1 - Math.floor(k3 / cols), dd = Math.abs(ix + iy - front); if (dd < 1.2) act[k3] = Math.max(act[k3], (1 - dd / 1.2) * .85); }
      }
      // light across the glass on touch screens
      if (!fine) { tilt.style.setProperty('--sx', (50 + Math.sin(T * .6) * 40).toFixed(1) + '%'); tilt.style.setProperty('--sy', (30 + Math.cos(T * .45) * 20).toFixed(1) + '%'); }
      draw(); raf = requestAnimationFrame(frame);
    }
    sheet.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = sheet.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
    sheet.addEventListener('pointerleave', function () { px = -1; });
    sheet.addEventListener('pointerdown', function (e) { var r = sheet.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; for (var k = 0; k < act.length; k++) { var dx = (k % cols + .5) * cell - x, dy = (Math.floor(k / cols) + .5) * cell - y; if (dx * dx + dy * dy < 160 * 160) act[k] = 1; } kick(); });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: function () { size(); draw(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- the hero photo leans toward the hand, light slides over the glass
  var hph = $('[data-hphoto]'), tilt = $('[data-tilt]');
  if (fine) {
    hph.addEventListener('pointermove', function (e) {
      if (still()) return;
      var r = hph.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      tilt.style.transform = 'rotateY(' + (x * 7).toFixed(2) + 'deg) rotateX(' + (-y * 6).toFixed(2) + 'deg)';
      tilt.style.setProperty('--px', (-x * 22).toFixed(1) + 'px'); tilt.style.setProperty('--py', (-y * 16).toFixed(1) + 'px');
      tilt.style.setProperty('--sx', ((x + .5) * 100).toFixed(1) + '%'); tilt.style.setProperty('--sy', ((y + .5) * 100).toFixed(1) + '%');
    });
    hph.addEventListener('pointerleave', function () { tilt.style.transform = ''; tilt.style.setProperty('--px', '0px'); tilt.style.setProperty('--py', '0px'); });
  }

  // ---------------------------------------------------------------- opener
  function endOpen() { if (!root.classList.contains('opening')) return; try { sessionStorage.setItem('fa-open', '1'); } catch (e) {} setTimeout(function () { root.classList.remove('opening', 'op-skip'); }, 300); }
  if (root.classList.contains('opening')) {
    var op = $('[data-opener]');
    op.addEventListener('animationend', function (e) { if (e.target === op) { root.classList.remove('opening'); try { sessionStorage.setItem('fa-open', '1'); } catch (er) {} } });
    var skip = function () { root.classList.add('op-skip'); endOpen(); };
    ['pointerdown', 'wheel', 'keydown', 'touchstart'].forEach(function (ev) { addEventListener(ev, skip, { once: true, passive: true }); });
    setTimeout(endOpen, 2200);
  }

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 120) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }

  // ---------------------------------------------------------------- figures: the tape prints, the big figure decodes
  var figs = $('[data-figs]'), paper = $('[data-paper]'), lines = $$('[data-line]'), big = $('[data-big]'), bigcap = $('[data-bigcap]'), curLine = -1;
  lines.forEach(function (li) { roll($('.odo', li), false); li._on = false; });
  function bigSet(i, instant) {
    var li = lines[i < 0 ? (still() ? 2 : 0) : i]; if (!li) return;
    if (instant || still()) big.textContent = li.dataset.big; else decode(big, li.dataset.big, 520);
    $$('span[lang]', bigcap).forEach(function (s) { s.textContent = li.dataset[s.lang]; });
  }

  // ---------------------------------------------------------------- the office walk
  var walk = $('[data-walk]'), shots = $$('[data-shot]'), wlight = $('[data-wlight]'), wcap = $('[data-wcap]'), wn = $('[data-wn]'), thumbs = $$('[data-wthumb]'), curShot = -1, stillShot = 0, wmx = 0, wmy = 0;
  function walkCap(i, instant) {
    if (i < 0) i = 0; var s = shots[i], txt = s.dataset[he() ? 'he' : 'en'];
    if (instant) wcap.textContent = txt; else decode(wcap, txt, 560);
    wn.textContent = (i + 1) + '/' + shots.length;
    thumbs.forEach(function (t, k) { t.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    if (still()) shots.forEach(function (sh, k) { sh.classList.toggle('cur', k === i); });
  }
  function goShot(i) {
    i = (i + shots.length) % shots.length;
    if (still()) { stillShot = i; curShot = i; walkCap(i); return; }
    var top = walk.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + i * innerHeight + (i ? innerHeight * .05 : 0), behavior: 'smooth' });
  }
  thumbs.forEach(function (t, i) { t.addEventListener('click', function () { goShot(i); }); });
  $('[data-wprev]').addEventListener('click', function () { goShot((curShot < 0 ? 0 : curShot) - 1); });
  $('[data-wnext]').addEventListener('click', function () { goShot((curShot < 0 ? 0 : curShot) + 1); });
  if (fine) walk.addEventListener('pointermove', function (e) { wmx = e.clientX / innerWidth - .5; wmy = e.clientY / innerHeight - .5; tick(); });

  // ---------------------------------------------------------------- services spotlight
  var svc = $('#services');
  watch(svc, function (v) { svc.classList.toggle('on', v); });
  $$('.tile,.ct').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- ask: the live thing
  var topics = $$('[data-topic]'), whos = $$('[data-who]'), msgEl = $('[data-msg]'), note = $('[data-note]'), steps = $$('[data-step]'), rmark = $('[data-rmark]'), ruler = $('[data-ruler]');
  var shown = '', typing = 0, noteSeen = false;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function radio(group, b) { group.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); }
  topics.forEach(function (b) { b.addEventListener('click', function () { radio(topics, b); lightStep(0); write(); }); });
  whos.forEach(function (b) { b.addEventListener('click', function () { radio(whos, b); lightStep(1); placeMark(); write(); }); });
  function placeMark() { var b = whos.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0]; rmark.style.setProperty('--rx', (b.offsetLeft + b.offsetWidth / 2 - 9) + 'px'); }
  ['[data-send-wa]', '[data-send-mail]'].forEach(function (s) { var a = $(s); a.addEventListener('pointerenter', function () { lightStep(2); }); a.addEventListener('focus', function () { lightStep(2); }); a.addEventListener('click', function () { lightStep(2); }); });
  function compose() {
    var l = he(), t = topics.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], w = whos.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0];
    return l ? 'שלום, אני פונה בנושא ' + t.dataset.he + '. ' + w.dataset.he + '. אשמח לתאם שיחה.'
             : 'Hello, I’m getting in touch about ' + t.dataset.en + '. ' + w.dataset.en + '. I’d be glad to set up a call.';
  }
  function write(instant) {
    var target = compose();
    $('[data-send-wa]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    $('[data-send-mail]').href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(he() ? 'פנייה מהאתר' : 'An enquiry from the website') + '&body=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !noteSeen) { shown = target; msgEl.textContent = target; note.classList.remove('typing'); return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    note.classList.add('typing');
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st); else note.classList.remove('typing');
    })(t0);
  }
  watch(note, function (v) { if (v && !noteSeen) { noteSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- reviews: a pad of sheets, each turning away from its corner
  var pad = (function () {
    var box = $('[data-pad]'), cards = $$('.rv', box), N = cards.length, cur = 0, anim = 0, busy = false;
    var rpoly = $('[data-rpoly]'), rshade = $('[data-rshade]'), rfg = $('[data-rfg]'), rfs = $('[data-rfs]'), count = $('[data-rcount]');
    var ROT = [0, -2.2, 1.8, -1.2, 2.4];
    function lay() {
      cards.forEach(function (c, i) {
        var d = (i - cur + N) % N;
        c.style.zIndex = N - d; c.style.setProperty('--rot', ROT[d] + 'deg');
        c.style.setProperty('--ox', (d * (he() ? -3 : 3)) + 'px'); c.style.setProperty('--oy', (d * 7) + 'px');
        c.style.filter = d ? 'brightness(' + (1 - d * .12).toFixed(2) + ')' : '';
        if (d) c.style.clipPath = '';
        c.setAttribute('aria-hidden', d ? 'true' : 'false');
      });
      count.textContent = (cur + 1) + '/' + N;
    }
    function draw(s) {
      var W = box.clientWidth, Hh = box.clientHeight, g = fold(W, Hh, s);
      cards[cur].style.clipPath = cssPoly(g.keep);
      rpoly.setAttribute('points', ptsStr(g.flap)); rshade.setAttribute('points', ptsStr(g.shade));
      grad(rfg, g.c0, g.c1); grad(rfs, g.c0, g.s1);
    }
    function smax() { return (box.clientWidth + box.clientHeight) * R2 + 30; }
    var S0 = 34, sNow = S0;
    function tween(from, to, dur, done) {
      cancelAnimationFrame(anim); busy = true; var t0 = performance.now();
      (function st(t) { var k = eio((t - t0) / dur); sNow = lerp(from, to, k); draw(sNow); if (k < 1) anim = requestAnimationFrame(st); else { busy = false; done && done(); } })(t0);
    }
    function next() {
      if (busy) return;
      if (still()) { cur = (cur + 1) % N; lay(); draw(S0); return; }
      tween(sNow, smax(), 760, function () { cur = (cur + 1) % N; lay(); sNow = S0; draw(S0); });
    }
    function prev() {
      if (busy) return;
      cur = (cur - 1 + N) % N; lay();
      if (still()) { draw(S0); return; }
      draw(smax()); tween(smax(), S0, 760);
    }
    $('[data-rnext]').addEventListener('click', next);
    $('[data-rprev]').addEventListener('click', prev);
    // drag the corner
    var drag = null;
    box.addEventListener('pointerdown', function (e) { if (busy || still()) return; drag = { x: e.clientX, y: e.clientY, moved: false }; });
    addEventListener('pointermove', function (e) {
      if (!drag) return; var dx = e.clientX - drag.x, dy = e.clientY - drag.y, pr = (dx - dy) * R2;
      if (Math.abs(dx) + Math.abs(dy) > 8) drag.moved = true;
      if (drag.moved) { sNow = clamp(S0 + pr, S0, smax()); draw(sNow); }
    });
    addEventListener('pointerup', function () {
      if (!drag) return; var d = drag; drag = null;
      if (!d.moved) { next(); return; }
      if (sNow > smax() * .3) tween(sNow, smax(), 420, function () { cur = (cur + 1) % N; lay(); sNow = S0; draw(S0); });
      else tween(sNow, S0, 320);
    });
    var demo = false;
    watch(box, function (v) { if (v && !demo && !still()) { demo = true; setTimeout(function () { if (!busy && !still()) next(); }, 1100); } }, { threshold: .6 });
    function rest() { cancelAnimationFrame(anim); busy = false; sNow = S0; lay(); draw(S0); }
    return { rest: rest };
  })();

  // ---------------------------------------------------------------- visit: Balfour 1964 drifts under the hand
  var street = $('[data-street]');
  if (fine) {
    street.addEventListener('pointermove', function (e) { if (still()) return; var r = street.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; street.style.setProperty('--px', (-x * 26).toFixed(1) + 'px'); street.style.setProperty('--py', (-y * 26).toFixed(1) + 'px'); });
    street.addEventListener('pointerleave', function () { street.style.setProperty('--px', '0px'); street.style.setProperty('--py', '0px'); });
  }

  // ---------------------------------------------------------------- footer: the real logo's own pixels gather into its mark
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), img = new Image(), P = [], ok = false, raf = 0, t0 = 0, w = 0, mx = -999, my = -999, seen = false;
    img.src = 'img/logo-mark.png';
    function sample() {
      try {
        var n = 110, sc = document.createElement('canvas'); sc.width = n; sc.height = n;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, n, n);
        var d = sx.getImageData(0, 0, n, n).data; P = [];
        for (var y = 0; y < n; y += 2) for (var x = 0; x < n; x += 2) {
          var k = (y * n + x) * 4; if (d[k + 3] < 120) continue;
          var orange = d[k] > 180 && d[k + 1] < 170;
          P.push({ hx: x / n, hy: y / n, col: orange ? '#f4eee4' : '#1d1d1f', x: Math.random(), y: Math.random() * 1.6 - .3, dl: Math.random() * .6, vx: 0, vy: 0 });
        }
        ok = true;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; cv.width = w * dpr; cv.height = w * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(t) {
      raf = 0; if (!ok) return;
      var T = (t - t0) / 1000, calm = still() || !seen, moving = false;
      c.clearRect(0, 0, w, w);
      var sz = Math.max(2, w / 70);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], tx = p.hx * w, ty = p.hy * w, a = calm ? 1 : smooth((T - p.dl) / 1.3);
        if (calm) { p.cx = tx; p.cy = ty; }
        else if (a < 1) { p.cx = lerp(p.x * w, tx, a); p.cy = lerp(p.y * w, ty, a); moving = true; }
        else {
          if (p.cx === undefined) { p.cx = tx; p.cy = ty; }
          var dx = p.cx - mx, dy = p.cy - my, d2 = dx * dx + dy * dy;
          if (d2 < 1600) { var f = (1600 - d2) / 1600 * 2.2, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
          p.vx += (tx - p.cx) * .08; p.vy += (ty - p.cy) * .08; p.vx *= .8; p.vy *= .8; p.cx += p.vx; p.cy += p.vy;
          if (Math.abs(p.vx) + Math.abs(p.vy) > .05) moving = true;
        }
        c.fillStyle = p.col; c.fillRect(p.cx - sz / 2, p.cy - sz / 2, sz, sz);
      }
      if (moving && !still()) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() { size(); sample(); kick(); }
    cv.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; kick(); });
    cv.addEventListener('pointerleave', function () { mx = my = -999; kick(); });
    cv.addEventListener('pointerdown', function () { if (still()) return; P.forEach(function (p) { p.vx += (Math.random() - .5) * 30; p.vy += (Math.random() - .5) * 30; }); kick(); });
    watch($('[data-foot]'), function (v) { if (v && !seen) { seen = true; t0 = performance.now(); P.forEach(function (p) { p.cx = undefined; }); kick(); } }, { threshold: .25 });
    if (img.complete && img.naturalWidth) start(); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // the phone number is the footer's headline: fit it to the width
  var fit = $('[data-fit]');
  function fitPhone() { fit.style.fontSize = ''; var cw = fit.parentNode.clientWidth - 2 * parseFloat(getComputedStyle(fit.parentNode).paddingLeft), fw = fit.scrollWidth, fs = parseFloat(getComputedStyle(fit).fontSize); if (fw > 0) fit.style.fontSize = Math.min(fs * cw / fw, 260) + 'px'; }

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el, extra) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight - (extra || 0)), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // the peel
    if (!calm) {
      var hp = prog(hero), e = eio((hp - .04) / .78);
      drawHero(e);
      $('[data-uphoto]').style.setProperty('--uy', ((1 - e) * 30).toFixed(1) + 'px');
      if (e > .18 && !under._in) { under._in = true; $$('[data-reveal]', under).forEach(function (el) { el.classList.add('in'); }); }
    } else { sheet.style.clipPath = ''; $$('[data-reveal]', under).forEach(function (el) { el.classList.add('in'); }); }
    // the tape
    var fp = calm ? 1 : clamp((prog(figs) - .06) / .78, 0, 1), shownL = fp * lines.length;
    var endH = paper.firstElementChild.offsetHeight + 16, vis = endH, k;
    for (k = 0; k < lines.length; k++) vis += lines[k].offsetHeight * clamp(shownL - k, 0, 1);
    paper.style.setProperty('--ty', calm ? '0px' : (vis - paper.offsetHeight).toFixed(1) + 'px');
    var last = -1;
    lines.forEach(function (li, i) { var on = calm || shownL > i + .55; if (on) last = i; if (on !== li._on) { li._on = on; li.classList.toggle('on', on); roll($('.odo', li), on); } });
    if (calm) last = 2;
    if (last !== curLine) { curLine = last; bigSet(last); }
    // the walk
    if (!calm) {
      var wr = walk.getBoundingClientRect(), t = clamp(-wr.top / (vh * 3), 0, 1) * 3, W = innerWidth, cur = 0;
      shots.forEach(function (sh, i) {
        var img = sh.firstElementChild, fx = parseFloat(img.style.getPropertyValue('--fx')) / 100, fy = parseFloat(img.style.getPropertyValue('--fy')) / 100;
        var wv = i === 0 ? 1 : smooth((t - (i - 1) - .3) / .7), push = clamp(t - i + .15, 0, 1.3);
        if (i > 0) {
          var side = wv * Math.max(W, vh) * 1.5, cx = fx * W, cy = fy * vh;
          var it = Math.max(0, cy - side / 2), ib = Math.max(0, vh - cy - side / 2), il = Math.max(0, cx - side / 2), ir = Math.max(0, W - cx - side / 2), rad = 28 * (1 - wv);
          sh.style.clipPath = wv <= 0 ? 'inset(50% 50% 50% 50%)' : 'inset(' + it.toFixed(1) + 'px ' + ir.toFixed(1) + 'px ' + ib.toFixed(1) + 'px ' + il.toFixed(1) + 'px round ' + rad.toFixed(1) + 'px)';
          var fd = $('.w-fold', sh), fs = wv <= 0 || wv >= 1 ? 0 : Math.min(110, side * .28) * (1 - smooth((wv - .55) / .45));
          fd.style.setProperty('--fs', fs.toFixed(1) + 'px'); fd.style.setProperty('--fl', il.toFixed(1) + 'px'); fd.style.setProperty('--fb', ib.toFixed(1) + 'px');
          if (wv > .5) cur = i;
        }
        var sc = (i === 0 ? 1.04 : lerp(1.32, 1.05, wv)) + push * .1;
        img.style.transform = 'translate3d(' + (-wmx * 18).toFixed(1) + 'px,' + (-wmy * 14).toFixed(1) + 'px,0) scale(' + sc.toFixed(4) + ')';
      });
      wlight.style.setProperty('--lx', (20 + (t % 1) * 60).toFixed(1) + '%'); wlight.style.setProperty('--ly', (25 + Math.sin(t * 2) * 15).toFixed(1) + '%');
      if (cur !== curShot) { curShot = cur; walkCap(cur); }
    } else if (curShot !== stillShot) { curShot = stillShot; walkCap(stillShot, true); }
  }

  function layout() { cbh(); folds.size(); dust.size(); placeMark(); fitPhone(); pad.rest(); if (still()) walkCap(stillShot, true); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); lw = innerWidth; }, 140); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout(); bigSet(-1, true);
  var once = false, go = function () {
    if (once) return; once = true;
    requestAnimationFrame(function () {
      root.classList.add('ready'); folds.kick(); fitPhone();
      $$('[data-callout]').forEach(function (c, i) { setTimeout(function () { decode($('b', c), c.dataset[he() ? 'he' : 'en'], 700); }, 900 + i * 260); });
    });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { fitPhone(); tick(); });
})();
