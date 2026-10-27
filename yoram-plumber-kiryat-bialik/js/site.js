(function () {
  var root = document.documentElement, WA = '972523766753';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 861; };
  var vh = function () { return innerHeight; };
  var TITLE = { he: 'יורם האינסטלטור · אינסטלטור בקריות · דרך עכו 102, קריית ביאליק', en: 'Yoram the Plumber · Plumber in the Krayot · 102 Derech Akko, Kiryat Bialik' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור יורם אינסטלטור בקריות 24/7 · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Yoram the Plumber, Krayot · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- glyph decode: a label settles out of scrambled plan marks
  var GLYPHS = 'אבגדהוזחטיכלמנסעפצקרשת0123456789⌀∠+=/';
  function decode(el, text, dur) {
    if (still() || !text) { el.textContent = text; return; }
    var t0 = performance.now(), d = dur || 520, n = text.length;
    if (el._dec) cancelAnimationFrame(el._dec);
    (function step(now) {
      var k = clamp((now - t0) / d, 0, 1), fixed = Math.floor(k * n), s = '';
      for (var i = 0; i < n; i++) s += i < fixed || text[i] === ' ' ? text[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      el.textContent = s;
      if (k < 1) el._dec = requestAnimationFrame(step); else { el.textContent = text; el._dec = 0; }
    })(t0);
  }
  function label(el) { return el.dataset[he() ? 'he' : 'en']; }

  // ---------------------------------------------------------------- language
  var AREAS = { '': ['בחרו קריה או עיר', 'Choose an area'], bialik: ['קריית ביאליק', 'Kiryat Bialik'], motzkin: ['קריית מוצקין', 'Kiryat Motzkin'], haim: ['קריית חיים', 'Kiryat Haim'], yam: ['קריית ים', 'Kiryat Yam'], ata: ['קריית אתא', 'Kiryat Ata'], haifa: ['חיפה', 'Haifa'] };
  function texts(l) {
    var i = l === 'he' ? 0 : 1;
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (im) { im.alt = im.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'יורם האינסטלטור', 'Yoram the Plumber');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-call]', 'התקשרו ליורם, 052-376-6753', 'Call Yoram, 052-376-6753');
    aria('[data-t-wa]', 'וואטסאפ ליורם', 'WhatsApp Yoram');
    aria('[data-t-steps]', 'שלבים', 'Stages');
    aria('[data-t-five]', '5 כוכבים', '5 stars');
    $$('[data-dec]').forEach(function (el) { el.textContent = label(el); });
    $$('[data-area] option').forEach(function (o) { o.textContent = AREAS[o.value][i]; });
    var note = $('[data-note]'); note.placeholder = l === 'he' ? 'למשל: הכיור במטבח לא מתנקז' : 'e.g. the kitchen sink won’t drain';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('yp-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('yp-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-parts]').forEach(function (el) { el.classList.add('in'); });
    texts(root.lang); layout(); plan.kick(); lens.kick(); write(true); work.set(work.cur());
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed, [0,24] = all day
  var H = { 0: [0, 24], 1: [0, 24], 2: [0, 24], 3: [0, 24], 4: [0, 24], 5: [0, 24], 6: [0, 24] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  var allDay = function (t) { return t && t[0] === 0 && t[1] === 24; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    var every = [0, 1, 2, 3, 4, 5, 6].every(function (d) { return allDay(H[d]); });
    if (every) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות, כל השבוע' : 'Open now · 24 hours, all week'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = allDay(t) ? (l ? 'פתוח עכשיו · כל היום' : 'Open now · all day') : (l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1])); }
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
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : allDay(t) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  $$('.pr').forEach(function (p, i) { p.style.setProperty('--d2', 200 + i * 60 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); odoIn(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-parts]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- odometer figures (real numbers only)
  $$('[data-odo]').forEach(function (el) {
    var v = el.dataset.odo, html = '';
    v.split('').forEach(function (c) {
      if (!/\d/.test(c)) { html += '<span>' + c + '</span>'; return; }
      html += '<span class="odo" aria-hidden="true"><span class="col" data-to="' + c + '"></span></span>'; // the digits live in CSS (::before), the value in aria-label
    });
    el.setAttribute('aria-label', v); el.innerHTML = html;
  });
  function odoIn(scope) {
    $$('.col', scope).forEach(function (c, i) { c.style.transitionDelay = (i * 90 + 150) + 'ms'; c.style.transform = 'translateY(-' + (+c.dataset.to) + 'em)'; });
  }

  // ---------------------------------------------------------------- headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 14 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- the drawing behind the hero: a plan grid with water running along its lines
  var plan = (function () {
    var cv = $('[data-plan]'), c = cv.getContext('2d'), cell = 44, w, h, runs = [], raf = 0, vis = true, px = -999, py = -999, t0 = performance.now();
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      runs = []; var n = phone() ? 6 : 11, seed = 7;
      var rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
      for (var k = 0; k < n; k++) {
        var x = Math.round(rnd() * w / cell) * cell, y = Math.round(rnd() * h / cell) * cell, pts = [[x, y]], horiz = rnd() > .5;
        for (var s = 0; s < 4; s++) { var len = (2 + Math.floor(rnd() * 6)) * cell * (rnd() > .5 ? 1 : -1); if (horiz) x = clamp(x + len, 0, w); else y = clamp(y + len, 0, h); pts.push([x, y]); horiz = !horiz; }
        var L = 0; for (var q = 1; q < pts.length; q++) L += Math.abs(pts[q][0] - pts[q - 1][0]) + Math.abs(pts[q][1] - pts[q - 1][1]);
        runs.push({ pts: pts, L: L, hot: k % 3 === 0, sp: 60 + rnd() * 70, off: rnd() * L });
      }
    }
    function at(r, d) {
      d = ((d % r.L) + r.L) % r.L;
      for (var q = 1; q < r.pts.length; q++) { var a = r.pts[q - 1], b = r.pts[q], l = Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]); if (d <= l) { var k = l ? d / l : 0; return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; } d -= l; }
      return r.pts[r.pts.length - 1];
    }
    function draw(T) {
      c.clearRect(0, 0, w, h);
      c.strokeStyle = 'rgba(170,200,255,.07)'; c.lineWidth = 1; c.beginPath();
      for (var x = 0; x <= w; x += cell) { c.moveTo(x + .5, 0); c.lineTo(x + .5, h); }
      for (var y = 0; y <= h; y += cell) { c.moveTo(0, y + .5); c.lineTo(w, y + .5); }
      c.stroke();
      runs.forEach(function (r) {
        c.strokeStyle = r.hot ? 'rgba(255,154,26,.16)' : 'rgba(143,211,255,.14)'; c.lineWidth = 6; c.lineCap = 'round'; c.lineJoin = 'round';
        c.beginPath(); c.moveTo(r.pts[0][0], r.pts[0][1]); for (var q = 1; q < r.pts.length; q++) c.lineTo(r.pts[q][0], r.pts[q][1]); c.stroke();
        if (still()) return;
        var head = r.off + T * r.sp;
        for (var s = 0; s < 14; s++) { var p = at(r, head - s * 7); c.fillStyle = r.hot ? 'rgba(255,181,77,' + (.75 - s * .05) + ')' : 'rgba(190,230,255,' + (.75 - s * .05) + ')'; c.beginPath(); c.arc(p[0], p[1], 3.2 - s * .18, 0, 6.283); c.fill(); }
      });
      if (px > -999) { // the junctions near the hand light up like fittings on the plan
        for (var gx = Math.floor((px - 160) / cell) * cell; gx < px + 160; gx += cell) for (var gy = Math.floor((py - 160) / cell) * cell; gy < py + 160; gy += cell) {
          var d = Math.hypot(gx - px, gy - py); if (d > 160) continue;
          c.fillStyle = 'rgba(255,181,77,' + ((1 - d / 160) * .55).toFixed(3) + ')'; c.beginPath(); c.arc(gx, gy, 3 + (1 - d / 160) * 3, 0, 6.283); c.fill();
        }
      }
    }
    function frame(now) { raf = 0; draw((now - t0) / 1000); if (vis && !still()) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = hero.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { px = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: function () { size(); draw(0); }, kick: kick };
  })();

  // ---------------------------------------------------------------- the lens: the logo's orange disc shows the pipes behind his tiles
  var lens = (function () {
    var box = $('[data-lensbox]'), tags = $$('.tag', box), raf = 0, vis = true, x = .62, y = .6, tx = .62, ty = .6, last = -1e9, drag = false, t0 = performance.now(), inside = {};
    function apply() {
      var r = box.clientWidth * (phone() ? .25 : .21);
      box.style.setProperty('--lx', (x * 100).toFixed(2) + '%'); box.style.setProperty('--ly', (y * 100).toFixed(2) + '%'); box.style.setProperty('--lr', r.toFixed(1) + 'px');
      var bw = box.clientWidth, bh = box.clientHeight;
      tags.forEach(function (t, i) {
        var lx = parseFloat(t.style.left) / 100, ly = parseFloat(t.style.top) / 100, d = Math.hypot((lx - x) * bw, (ly - y) * bh), inn = d < r * .95;
        if (inn && !inside[i]) decode(t, label(t), 420);
        inside[i] = inn;
      });
    }
    function frame(now) {
      raf = 0;
      if (still()) { x = .64; y = .6; apply(); return; }
      if (!drag && now - last > 2200) { var T = (now - t0) / 1000; tx = .55 + Math.sin(T * .42) * .3; ty = .7 + Math.sin(T * .63 + 1) * .2; }
      x = lerp(x, tx, .08); y = lerp(y, ty, .08); apply();
      if (vis) raf = requestAnimationFrame(frame);
    }
    function point(e) { var r = box.getBoundingClientRect(); tx = clamp((e.clientX - r.left) / r.width, .08, .92); ty = clamp((e.clientY - r.top) / r.height, .08, .92); last = performance.now(); box.classList.add('used'); kick(); }
    box.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' || drag) point(e); });
    box.addEventListener('pointerdown', function (e) { drag = e.pointerType !== 'mouse'; point(e); if (still()) { x = tx; y = ty; apply(); } });
    addEventListener('pointerup', function () { drag = false; });
    box.addEventListener('pointermove', function (e) { if (still() && (e.pointerType === 'mouse' || drag)) { x = tx; y = ty; apply(); } });
    watch(box, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { kick: kick, apply: apply };
  })();

  // ---------------------------------------------------------------- the work scene: from the wall to the roof
  var work = (function () {
    var sec = $('[data-work]'), frameEl = $('[data-wframe]'), ws = $$('[data-ws]'), caps = $$('[data-wcaps] li'), bgs = $$('.w-bg i'), dots = $$('[data-wdots] button'), gauge = $('[data-wgauge]'), deck = $$('[data-wdeck] i'), head = $('.w-head', sec);
    var N = ws.length, cur = 0, base = null;
    // camera path per photo: [scale from, scale to, x from, x to, y from, y to] in % of the photo, and how the next photo wipes in
    var CAM = [[1.22, 1.13, 4, -4, 3, -3], [1.16, 1.09, 0, 0, 4, -4], [1.1, 1.3, 0, 2, 0, 5], [1.3, 1.07, -2, 0, -3, 0], [1.09, 1.2, 0, 0, -3, 4]];
    var WIPE = ['up', 'side', 'circle', 'down'];
    function camera(k, lp) { var c = CAM[k], e = smooth(lp); ws[k].firstElementChild.style.transform = 'translate(' + lerp(c[2], c[3], e).toFixed(2) + '%,' + lerp(c[4], c[5], e).toFixed(2) + '%) scale(' + lerp(c[0], c[1], e).toFixed(3) + ')'; }
    function wipe(k, w) {
      var how = WIPE[k - 1], el = ws[k], rtl = root.dir === 'rtl';
      if (w >= 1) { el.style.clipPath = 'none'; return; }
      var q = ((1 - w) * 100).toFixed(2) + '%';
      el.style.clipPath = how === 'up' ? 'inset(' + q + ' 0 0 0)' : how === 'down' ? 'inset(0 0 ' + q + ' 0)' : how === 'side' ? (rtl ? 'inset(0 0 0 ' + q + ')' : 'inset(0 ' + q + ' 0 0)') : 'circle(' + (w * 120).toFixed(2) + '% at 60% 30%)';
    }
    function show(i) {
      caps.forEach(function (c, k) { c.classList.toggle('on', k === i); });
      bgs.forEach(function (b, k) { b.classList.toggle('on', k === i); });
      dots.forEach(function (d, k) { d.classList.toggle('on', k === i); d.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      if (i !== cur || !ws[i].classList.contains('lit')) {
        ws.forEach(function (w, k) { w.classList.toggle('lit', k === i); });
        $$('.lbl', ws[i]).forEach(function (l, j) { setTimeout(function () { decode(l, label(l), 520); }, 150 + j * 160); });
      }
      cur = i;
    }
    function set(i) { // animations off: a plain stepper
      i = clamp(i, 0, N - 1);
      ws.forEach(function (w, k) { w.classList.toggle('on', k === i); w.style.clipPath = ''; w.style.visibility = ''; w.firstElementChild.style.transform = ''; });
      frameEl.style.transform = ''; frameEl.style.clipPath = '';
      show(i);
    }
    function update() {
      if (still()) return;
      var r = sec.getBoundingClientRect(), span = r.height - vh(); if (span <= 0) return;
      if (r.bottom < -50 || r.top > vh() + 50) return;
      var p = clamp(-r.top / span, 0, 1), o = smooth(p / .07), t = clamp((p - .07) / .88, 0, 1) * (N - 1), idx = Math.min(N - 1, Math.floor(t)), f = t - idx;
      gauge.parentNode.style.setProperty('--wp', p.toFixed(4));
      // the frame opens from a card to the full stage
      if (phone()) {
        frameEl.style.transform = '';
        frameEl.style.clipPath = o >= 1 ? 'none' : 'inset(' + lerp(22, 0, o).toFixed(2) + '% ' + lerp(12, 0, o).toFixed(2) + '% ' + lerp(30, 0, o).toFixed(2) + '% ' + lerp(12, 0, o).toFixed(2) + '% round ' + lerp(28, 0, o).toFixed(1) + 'px)';
      } else {
        if (!base) { frameEl.style.transform = 'none'; var fr = frameEl.getBoundingClientRect(); base = (innerWidth / 2) - (fr.left + fr.width / 2); }
        frameEl.style.transform = 'translateX(' + (base * (1 - o) * .55).toFixed(1) + 'px) scale(' + lerp(.72, 1, o).toFixed(3) + ')';
        frameEl.style.clipPath = '';
      }
      var w = idx < N - 1 ? smooth((f - .6) / .4) : 0;
      ws.forEach(function (el, k) {
        var visible = k === idx || (k === idx + 1 && w > 0);
        el.style.visibility = visible ? 'visible' : 'hidden';
        el.style.zIndex = k;
        if (k === idx) { el.style.clipPath = 'none'; }
        if (k === idx + 1) wipe(k, w);
        if (visible) camera(k, k === idx ? clamp((f + (idx === 0 ? .3 : 0)) / 1.3 + .1, 0, 1) : w * .2);
      });
      deck.forEach(function (c, k) { // the deck follows the scroll: past cards fly up and away, the next ones wait fanned behind
        var d = k - t, past = d < 0, a = Math.abs(d), dir = root.dir === 'rtl' ? -1 : 1;
        var x = past ? d * 40 : d * 46, y = past ? d * 120 : d * -10, rot = past ? d * 18 : d * 7, sc = past ? 1 + d * .08 : 1 - a * .07, op = past ? clamp(1 + d * 1.2, 0, 1) : clamp(1 - (a - 3) * .8, 0, 1);
        c.style.transform = 'translate(' + (x * dir).toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + (rot * dir).toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
        c.style.opacity = op.toFixed(3); c.style.zIndex = 10 - Math.round(a * 2);
      });
      head.classList.toggle('gone', t > .55);
      var shown = w > .5 ? idx + 1 : idx;
      show(shown);
      ws.forEach(function (el, k) { el.classList.toggle('lit', k === shown && o > .9 && (w < .15 || w > .9)); });
    }
    dots.forEach(function (d, k) { d.addEventListener('click', function () {
      if (still()) { set(k); return; }
      var r = sec.getBoundingClientRect(), span = r.height - vh(), p = .07 + Math.min(k + .25, N - 1) / (N - 1) * .88;
      if (k === N - 1) p = .97;
      scrollTo({ top: scrollY + r.top + p * span, behavior: 'smooth' });
    }); });
    $('[data-wprev]').addEventListener('click', function () { set(cur - 1); });
    $('[data-wnext]').addEventListener('click', function () { set(cur + 1); });
    return { update: update, set: set, cur: function () { return cur; }, reset: function () { base = null; } };
  })();

  // ---------------------------------------------------------------- services: the row under your finger shows its drawing or his photo
  var svc = $('[data-svc]'), parts = $('[data-parts]'), rows = $$('.pr'), pvis = $$('[data-pvi]'), lastTap = 0;
  function pick(key) { rows.forEach(function (r) { r.classList.toggle('on', r.dataset.pv === key); r.setAttribute('aria-pressed', r.dataset.pv === key ? 'true' : 'false'); }); pvis.forEach(function (p) { p.classList.toggle('on', p.dataset.pvi === key); }); }
  rows.forEach(function (r) {
    r.addEventListener('click', function () { lastTap = performance.now(); pick(r.dataset.pv); });
    r.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') pick(r.dataset.pv); });
    r.addEventListener('focus', function () { pick(r.dataset.pv); });
  });
  var spot = document.createElement('span'); spot.className = 'spot'; spot.setAttribute('aria-hidden', 'true'); parts.prepend(spot);
  function spotlight(el) { el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); }
  spotlight(parts); $$('.tile').forEach(spotlight);
  function svcScroll() { // on phones the row crossing the middle of the screen lights up by itself
    if (!phone() || still() || performance.now() - lastTap < 3500) return;
    var best = null, bd = 1e9, mid = vh() * .7;
    rows.forEach(function (r) { var b = r.getBoundingClientRect(); if (b.bottom < 0 || b.top > vh()) return; var d = Math.abs(b.top + b.height / 2 - mid); if (d < bd) { bd = d; best = r; } });
    if (best && !best.classList.contains('on') && bd < 120) pick(best.dataset.pv);
  }

  // ---------------------------------------------------------------- the reviews sheet lands over the parts list
  var reviews = $('[data-land]'), dim = $('[data-svcdim]');
  function landing() {
    if (still()) { svc.style.top = ''; reviews.style.removeProperty('--ly2'); reviews.style.removeProperty('--ls'); dim.style.setProperty('--dim', 0); return; }
    svc.style.top = Math.min(0, vh() - svc.offsetHeight) + 'px';
    var t = reviews.getBoundingClientRect().top, e = smooth(1 - (t - vh() * .15) / (vh() * .85));
    reviews.style.setProperty('--ly2', ((1 - e) * 70).toFixed(1) + 'px');
    reviews.style.setProperty('--ls', lerp(.93, 1, e).toFixed(4));
    dim.style.setProperty('--dim', (e * .7).toFixed(3));
  }

  // ---------------------------------------------------------------- the yoram sheet unrolls over the hero
  var yoram = $('[data-unroll]');
  function unroll() {
    if (still()) return;
    var r = yoram.getBoundingClientRect(), k = clamp((vh() * .94 - r.top) / (vh() * .78), 0, 1);
    yoram.style.setProperty('--u', (k * r.height).toFixed(1) + 'px');
    yoram.classList.toggle('done', k >= 1);
  }

  // ---------------------------------------------------------------- footer: the disc rises
  var foot = $('[data-foot]'), sun = $('[data-fsun] i');
  function sunrise() { if (still()) { sun.style.transform = ''; return; } var r = foot.getBoundingClientRect(), e = smooth((vh() - r.top) / Math.min(r.height, vh())); sun.style.transform = 'translateY(' + ((1 - e) * 280).toFixed(1) + 'px) scale(' + lerp(.85, 1, e).toFixed(3) + ')'; }

  // ---------------------------------------------------------------- the work order (the live thing)
  var ITEMS = { clog: ['סתימה', 'a blockage'], leak: ['נזילה', 'a leak'], burst: ['פיצוץ בצנרת', 'a burst pipe'], pipe: ['החלפת צנרת', 'new pipes'], press: ['לחץ מים חלש', 'low water pressure'], sun: ['דוד שמש', 'a solar heater'], bath: ['שיפוץ חדר רחצה', 'a bathroom renovation'], other: ['עוד משהו', 'something else'] };
  var boxes = $$('[data-legend] input[type=checkbox]'), area = $('[data-area]'), note = $('[data-note]'), msgEl = $('[data-msg]'), send = $('[data-send]'), ticket = $('[data-ticket]'), steps = $$('[data-osteps] li'), shown = '', typing = 0;
  function list(a, l) { if (a.length < 2) return a.join(''); return a.slice(0, -1).join(', ') + (l ? ' ו' : ' and ') + a[a.length - 1]; }
  function message() {
    var l = he(), i = l ? 0 : 1, picked = boxes.filter(function (b) { return b.checked; }).map(function (b) { return ITEMS[b.value][i]; }), a = area.value ? AREAS[area.value][i] : '', n = note.value.trim(), s;
    if (l) { s = 'שלום יורם, הגעתי דרך האתר.\n' + (picked.length ? 'אשמח לעזרה עם ' + list(picked, true) + '.' : 'אשמח לעזרה בעבודת אינסטלציה.') + (a ? '\nאני ב' + a + '.' : '') + (n ? '\n' + n : ''); }
    else { s = 'Hi Yoram, I found you through the website.\n' + (picked.length ? 'I’d like help with ' + list(picked, false) + '.' : 'I’d like help with some plumbing work.') + (a ? '\nI’m in ' + a + '.' : '') + (n ? '\n' + n : ''); }
    steps[0].classList.toggle('on', picked.length > 0); steps[1].classList.toggle('on', !!a); steps[2].classList.toggle('on', picked.length > 0 && !!a);
    return s;
  }
  function write(instant) {
    var s = message(); send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(s);
    if (typing) { cancelAnimationFrame(typing); typing = 0; }
    if (instant || still()) { shown = s; msgEl.textContent = s; return; }
    var k = 0; while (k < shown.length && k < s.length && shown[k] === s[k]) k++;
    var from = shown.slice(0, k), t0 = performance.now();
    if (ticket.animate) ticket.animate([{ transform: 'translateY(-16px)' }, { transform: 'none' }], { duration: 460, easing: 'cubic-bezier(.23,1,.32,1)' });
    (function step(now) {
      var m = Math.min(s.length, k + Math.floor((now - t0) / 14));
      shown = s.slice(0, m); msgEl.innerHTML = ''; msgEl.textContent = shown; var cur = document.createElement('span'); cur.className = 'cur'; msgEl.appendChild(cur);
      if (m < s.length) typing = requestAnimationFrame(step); else typing = 0;
    })(t0);
    void from;
  }
  boxes.forEach(function (b) { b.addEventListener('change', function () { write(); }); });
  area.addEventListener('change', function () { write(); });
  note.addEventListener('input', function () { write(); });

  // ---------------------------------------------------------------- FAQ index cards
  $$('[data-card]').forEach(function (c) {
    $('.c-q', c).addEventListener('click', function () {
      var open = !c.classList.contains('open');
      $$('[data-card]').forEach(function (o) { o.classList.remove('open'); $('.c-q', o).setAttribute('aria-expanded', 'false'); });
      if (open) { c.classList.add('open'); $('.c-q', c).setAttribute('aria-expanded', 'true'); }
    });
  });

  // ---------------------------------------------------------------- opening: the logo, then its orange disc opens the page
  var opener = $('[data-opener]');
  function opening(done) {
    if (!root.classList.contains('opening')) { done(); return; }
    try { sessionStorage.setItem('yp-open', '1'); } catch (e) {}
    var logo = $('.op-logo', opener), finished = false;
    function end() { if (finished) return; finished = true; root.classList.remove('opening', 'op-in'); done(); }
    opener.addEventListener('pointerdown', end);
    requestAnimationFrame(function () { root.classList.add('op-in'); });
    setTimeout(function () {
      var r = logo.getBoundingClientRect(), cx = r.left + r.width * .905, cy = r.top + r.height * .56, R0 = r.width * .1, R1 = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) + 40, t0 = performance.now();
      opener.style.setProperty('--ox', cx + 'px'); opener.style.setProperty('--oy', cy + 'px');
      (function step(now) {
        if (finished) return;
        var k = clamp((now - t0) / 760, 0, 1), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        opener.style.setProperty('--or', lerp(R0 * .6, R1, e).toFixed(1) + 'px');
        if (k < 1) requestAnimationFrame(step); else end();
      })(t0);
    }, 520);
    setTimeout(end, 2200);
  }

  // ---------------------------------------------------------------- layout + the scroll loop
  function layout() { plan.size(); lens.apply(); work.reset(); if (still()) work.set(work.cur()); tick(); }
  var ticking = false;
  function tick() {
    ticking = false;
    nav.classList.toggle('pill', scrollY > 40);
    unroll(); work.update(); landing(); svcScroll(); sunrise();
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }, { passive: true });
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });

  texts(root.lang); hours(); write(true);
  if (still()) work.set(0); else work.update();
  layout();
  opening(function () { hero.classList.add('ready'); plan.kick(); lens.kick(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
})();
