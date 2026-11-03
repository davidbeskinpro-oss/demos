(function () {
  var root = document.documentElement, WA = '972547766020';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 760; };
  var TITLE = { he: 'עו״ד נופר לנקרי · נדל״ן ומקרקעין · זבולון 3, קריית אתא', en: 'Adv. Nofar Lankry · Real estate & land law · 3 Zevulun St, Kiryat Ata' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור עו״ד נופר לנקרי · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Adv. Nofar Lankry · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';

  // ---------------------------------------------------------------- glyph decode: letters settle out of scrambled ones
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHKLMNPRSTVXZ' };
  function decode(el, txt, dur) {
    cancelAnimationFrame(el._dec);
    if (still() || !dur) { el.textContent = txt; return; }
    var set = /[֐-׿]/.test(txt) ? GL.he : GL.en, t0 = performance.now();
    (function st(t) {
      var p = (t - t0) / dur, n = Math.floor(p * txt.length), s = txt.slice(0, n);
      for (var i = n; i < txt.length; i++) s += txt[i] === ' ' ? ' ' : set[Math.floor(Math.random() * set.length)];
      el.textContent = p >= 1 ? txt : s;
      if (p < 1) el._dec = requestAnimationFrame(st);
    })(t0);
  }

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'עו״ד נופר לנקרי', 'Adv. Nofar Lankry');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-visit]', 'יצירת קשר', 'Contact');
    aria('[data-t-prev]', 'התחנה הקודמת', 'Previous stop');
    aria('[data-t-next]', 'התחנה הבאה', 'Next stop');
    aria('[data-t-who]', 'מה העניין', 'What it’s about');
    aria('[data-t-where]', 'איפה', 'Where');
    aria('[data-t-call]', 'התקשרו לנופר, 054-776-6020', 'Call Nofar, 054-776-6020');
    aria('[data-t-wa]', 'וואטסאפ לנופר', 'WhatsApp Nofar');
    $$('[data-decode]').forEach(function (el) { el.textContent = el.dataset[l]; });
    $$('[data-pick] option').forEach(function (o) { o.textContent = o.dataset[l]; });
    $$('[data-btag]').forEach(function (b) { b.textContent = b.dataset[l]; });
    var ow = $('[data-owner]'); ow.textContent = ow.dataset[l + (dealStage >= 4 ? '1' : '0')];
    var ty = $('[data-type-he]'); ty.textContent = dealStage >= 2 ? ty.dataset[l === 'he' ? 'typeHe' : 'typeEn'] : '';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('nl-lang', l); } catch (e) {}
    texts(l); hours(); compose(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('nl-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-aerial]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-odo]').forEach(function (o) { roll(o, true); });
    layout(); mono.kick(); plots.kick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [8.5, 19.5], 1: [8.5, 19.5], 2: [8.5, 19.5], 3: [8.5, 19.5], 4: [8.5, 19.5], 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
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
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-aerial]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 9 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]');
  var ptr = { x: -1, y: -1, t: 0 };
  hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = hero.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.t = performance.now(); });
  hero.addEventListener('pointerleave', function () { ptr.x = -1; });

  // where the monogram and the lens rest: the side opposite the headline (above it on phones)
  function anchor() {
    var w = hero.clientWidth, h = hero.clientHeight;
    if (phone()) return { x: w / 2, y: 70 + w * .24, s: Math.min(w * .5, 260) };
    return { x: rtl() ? w * .27 : w * .73, y: h * .5, s: Math.min(w * .3, h * .62, 470) };
  }

  // ---------------------------------------------------------------- the parcels of the land registry, drawn over the frond
  var plots = (function () {
    var svg = $('[data-plots]'), cols, rows, cw, ch, paths = [], raf = 0, lastLit = 0, vis = true;
    function build() {
      var w = hero.clientWidth, h = hero.clientHeight, seed = 7;
      var rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
      cw = phone() ? 110 : 150; ch = phone() ? 90 : 120; cols = Math.ceil(w / cw) + 1; rows = Math.ceil(h / ch) + 1;
      var P = [];
      for (var y = 0; y <= rows; y++) for (var x = 0; x <= cols; x++) P.push([x * cw + (x && x < cols ? (rnd() - .5) * cw * .5 : 0), y * ch + (y && y < rows ? (rnd() - .5) * ch * .5 : 0)]);
      var g = function (x, y) { return P[y * (cols + 1) + x]; };
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      var out = '';
      for (y = 0; y < rows; y++) for (x = 0; x < cols; x++) {
        var a = g(x, y), b = g(x + 1, y), c = g(x + 1, y + 1), d = g(x, y + 1);
        var len = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) + Math.hypot(c[0] - b[0], c[1] - b[1]) + Math.hypot(d[0] - c[0], d[1] - c[1]) + Math.hypot(a[0] - d[0], a[1] - d[1]));
        out += '<path d="M' + a.map(Math.round) + 'L' + b.map(Math.round) + 'L' + c.map(Math.round) + 'L' + d.map(Math.round) + 'Z" style="--len:' + len + ';--pd:' + Math.round((x + y) * 60 + rnd() * 200) + 'ms"/>';
      }
      svg.innerHTML = out; paths = $$('path', svg);
    }
    function at(x, y) { var cx = clamp(Math.floor(x / cw), 0, cols - 1), cy = clamp(Math.floor(y / ch), 0, rows - 1); return paths[cy * cols + cx]; }
    var hot = null;
    function frame(t) {
      raf = 0; if (!vis || still()) return;
      var p = ptr.x >= 0 ? at(ptr.x, ptr.y) : null;
      if (!p && t - lastLit > 1400) { lastLit = t; var a = anchor(); p = at(a.x + (Math.random() - .5) * a.s * 1.6, a.y + (Math.random() - .5) * a.s * 1.4); }
      if (p && p !== hot) { if (hot) hot.classList.remove('lit'); hot = p; hot.classList.add('lit'); }
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    watch(hero, function (v) { vis = v; kick(); });
    return { build: build, kick: kick };
  })();

  // ---------------------------------------------------------------- the lens: Kiryat Ata under the leaves
  var lens = (function () {
    var el = $('[data-lens]'), x = 0, y = 0, init = false;
    function step(t) {
      var a = anchor(), tx, ty;
      if (ptr.x >= 0 && t - ptr.t < 2500) { tx = ptr.x; ty = ptr.y; }
      else { tx = a.x + Math.sin(t / 2300) * a.s * .35; ty = a.y + Math.cos(t / 3100) * a.s * .22; }
      if (!init) { x = tx; y = ty; init = true; }
      x = lerp(x, tx, .08); y = lerp(y, ty, .08);
      el.style.setProperty('--x', x.toFixed(1) + 'px'); el.style.setProperty('--y', y.toFixed(1) + 'px');
      el.style.setProperty('--rr', (phone() ? a.s * .62 : Math.min(a.s * .55, 220)).toFixed(0) + 'px');
    }
    return { step: step };
  })();

  // ---------------------------------------------------------------- the monogram of her real logo, made of light; it scatters into the parcels as you scroll
  var mono = (function () {
    var cv = $('[data-mono]'), c = cv.getContext('2d'), img = $('[data-monosrc]');
    var P = [], w, h, raf = 0, vis = true, t0 = 0, ok = false;
    function sample() {
      try {
        var sc = document.createElement('canvas'), N = 300; sc.width = N; sc.height = N;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, N, N);
        var d = sx.getImageData(0, 0, N, N).data, pts = [];
        for (var y = 50; y < 168; y += 2) for (var x = 60; x < 240; x += 2) {
          var k = (y * N + x) * 4, r = d[k], g = d[k + 1], b = d[k + 2];
          if (r > 175 && g > 175 && b > 175 && Math.max(r, g, b) - Math.min(r, g, b) < 40) pts.push([x / N, y / N]);
        }
        var cx = 0, cy = 0; pts.forEach(function (q) { cx += q[0]; cy += q[1]; }); cx /= pts.length || 1; cy /= pts.length || 1; pts = pts.map(function (q) { return [q[0] - cx, q[1] - cy]; });
        var want = phone() ? 900 : 1500, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) { var q = pts[Math.floor(f)]; P.push({ hx: q[0], hy: q[1], x: 0, y: 0, vx: 0, vy: 0, sx: Math.random(), sy: Math.random(), ph: Math.random() * 6.28, dl: Math.random() * .6, fall: .4 + Math.random() }); }
        ok = P.length > 50;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(now) {
      raf = 0; if (!ok) return;
      var calm = still(), T = (now - t0) / 1000, a = anchor(), S = a.s * 1.9;
      var hr = hero.getBoundingClientRect(), sc = calm ? 0 : clamp(-hr.top / (hr.height * .6), 0, 1.2);
      if (!calm) lens.step(now);
      c.clearRect(0, 0, w, h);
      c.fillStyle = '#f2f4ec';
      var sz = phone() ? 2 : 2.6, mx = ptr.x, my = ptr.y;
      for (var i = 0; i < P.length; i++) {
        var p = P[i], tx = a.x + p.hx * S + Math.sin(T * 1.2 + p.ph) * 1.2, ty = a.y + p.hy * S + Math.cos(T + p.ph) * 1.2;
        if (sc > 0) { tx += (p.sx - .5) * w * sc * .9; ty += sc * h * .5 * p.fall; }
        if (calm) { p.x = tx; p.y = ty; }
        else {
          var arr = smooth((T - p.dl) / 1.4);
          if (arr < 1) { p.x = lerp(p.sx * w, tx, arr); p.y = lerp(p.sy * h, ty, arr); }
          else {
            if (mx >= 0) { var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy; if (d2 < 9000) { var f = (9000 - d2) / 9000 * 2.4, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; } }
            p.vx += (tx - p.x) * .07; p.vy += (ty - p.y) * .07; p.vx *= .8; p.vy *= .8; p.x += p.vx; p.y += p.vy;
          }
        }
        c.globalAlpha = .9 * (1 - clamp(sc, 0, 1) * .6);
        c.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
      }
      c.globalAlpha = 1;
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() { size(); sample(); P.forEach(function (p) { var a = anchor(); p.x = p.sx * w; p.y = p.sy * h; }); t0 = performance.now(); kick(); }
    watch(hero, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // ---------------------------------------------------------------- the logo card leans to the hand; its labels decode
  var zone = $('[data-cardzone]'), lcard = $('[data-lcard]');
  zone.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var r = zone.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
    lcard.style.setProperty('--ry', (nx * 22).toFixed(2) + 'deg'); lcard.style.setProperty('--rx', (-ny * 22).toFixed(2) + 'deg');
    lcard.style.setProperty('--sx', ((nx + .5) * 100).toFixed(1) + '%'); lcard.style.setProperty('--sy', ((ny + .5) * 100).toFixed(1) + '%');
  });
  zone.addEventListener('pointerleave', function () { lcard.style.setProperty('--rx', '0deg'); lcard.style.setProperty('--ry', '0deg'); });
  var decoded = false;
  watch($('[data-who]'), function (v) { if (v && !decoded) { decoded = true; $$('[data-decode]').forEach(function (el, i) { setTimeout(function () { decode(el, el.dataset[root.lang], 900); }, 250 + i * 260); }); } }, { threshold: .3 });

  // ---------------------------------------------------------------- odometers
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
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- bento: the light under the hand, a parcel that moves across the land plan
  var areas = $('#areas');
  watch(areas, function (v) { areas.classList.toggle('on', v); }, { threshold: .15 });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var lots = $$('[data-land] .lots path'), hotLot = $('[data-hot]'), li = 4;
  setInterval(function () { if (still() || !areas.classList.contains('on')) return; li = (li + 1 + Math.floor(Math.random() * 4)) % lots.length; hotLot.setAttribute('d', lots[li].getAttribute('d')); }, 1700);

  // ---------------------------------------------------------------- the deal: stops beside a registry extract
  var deal = $('[data-deal]'), stops = $$('[data-stop]'), doc = $('[data-doc]'), dmap = $('[data-dmap]'), dealStage = -1, typeT = 0;
  function setStage(k, sub) {
    var l = root.lang;
    if (k !== dealStage) {
      var prev = dealStage; dealStage = k; deal.dataset.stage = k;
      stops.forEach(function (b, i) { b.classList.toggle('on', i === k); b.classList.toggle('done', i < k); b.parentNode.classList.toggle('cur', i === k); b.setAttribute('aria-current', i === k ? 'step' : 'false'); });
      $$('[data-on]', doc).forEach(function (el) { el.classList.toggle('lit', k >= +el.dataset.on); });
      // the caveat types itself onto the extract
      var ty = $('[data-type-he]'), txt = ty.dataset[l === 'he' ? 'typeHe' : 'typeEn'];
      clearInterval(typeT);
      if (k >= 2 && prev < 2 && !still()) { var n = 0; ty.textContent = ''; typeT = setInterval(function () { ty.textContent = txt.slice(0, ++n); if (n >= txt.length) clearInterval(typeT); }, 34); }
      else ty.textContent = k >= 2 ? txt : '';
      // the owner changes at the registry
      var ow = $('[data-owner]'), want = ow.dataset[l + (k >= 4 ? '1' : '0')];
      if (ow.textContent !== want) decode(ow, want, prev >= 0 ? 700 : 0);
      ow.classList.toggle('swap', k >= 4);
    }
    $('.scan', doc).style.setProperty('--scan', (k === 0 ? (sub || 0) * (doc.clientHeight - 46) : 0).toFixed(0) + 'px');
  }
  function dealTop() { return deal.getBoundingClientRect().top + scrollY + parseFloat(getComputedStyle(deal).paddingTop); }
  stops.forEach(function (b) { b.addEventListener('click', function () {
    var k = +b.dataset.stop;
    if (still()) { setStage(k); return; }
    var span = deal.offsetHeight - parseFloat(getComputedStyle(deal).paddingTop) - innerHeight;
    scrollTo({ top: dealTop() + span * (.12 + (k + .5) * .8 / 5), behavior: 'smooth' });
  }); });
  $('[data-dprev]').addEventListener('click', function () { setStage(Math.max(0, dealStage - 1)); });
  $('[data-dnext]').addEventListener('click', function () { setStage(Math.min(4, dealStage + 1)); });

  // ---------------------------------------------------------------- renewal: the building rises through its plan
  var renew = $('[data-renew]'), bld = $('[data-bld]'), blines = $$('[data-blines] path'), btags = $$('[data-btag]'), floorsEl = $('[data-floors]');
  var CUTS = [52, 40.5, 23.8, 11.5, 0], FLOORS = [3, 4, 5, 5, 5];   // the slab lines of the photo (percent from the top): three old floors are real from the start

  // ---------------------------------------------------------------- composer: a sentence with blanks
  var sentence = $('.sentence');
  [].slice.call(sentence.childNodes).forEach(function (n) { if (n.nodeType === 3 && !n.textContent.trim()) n.remove(); });
  var picks = $$('[data-pick]'), send = $('[data-send]');
  var PARTS = { he: { a: 'שלום נופר, אנחנו ', b: ' ב', c: '. נשמח לשיחה.' }, en: { a: 'Hi Nofar, we’re ', b: ' in ', c: '. We’d like to talk.' } };
  function compose(instant, which) {
    var l = root.lang, P = PARTS[l];
    $('[data-s="a"]').textContent = P.a; $('[data-s="b"]').textContent = P.b; $('[data-s="c"]').textContent = P.c;
    var vals = {};
    picks.forEach(function (s) {
      var v = s.options[s.selectedIndex].dataset[l]; vals[s.dataset.pick] = v;
      var bv = $('[data-bv="' + s.dataset.pick + '"]');
      if (!instant && which === s) decode(bv, v, 500); else bv.textContent = v;
    });
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(P.a + vals.who + P.b + vals.where + P.c);
  }
  picks.forEach(function (s) { s.addEventListener('change', function () { compose(false, s); }); });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false, foot = $('[data-foot]'), ffrond = $('[data-ffrond]'), keytag = $('[data-keytag]'), acts = $('[data-heroacts]'), hcopy = $('.h-copy');
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(), pt = parseFloat(getComputedStyle(el).paddingTop) || 0; return clamp(-(r.top + pt) / Math.max(1, r.height - pt - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) { mono.kick(); plots.kick(); }
    // the hero copy sinks back as the next page rides over it
    var hr = hero.getBoundingClientRect(), hp = calm ? 0 : clamp(-hr.top / hr.height, 0, 1);
    hcopy.style.transform = hp ? 'translateY(' + (hp * 90).toFixed(1) + 'px) scale(' + (1 - hp * .06).toFixed(3) + ')' : '';
    hcopy.style.opacity = hp ? (1 - hp * .9).toFixed(3) : '';
    // deal: the survey map unrolls, then five stops
    if (!calm) {
      var dp = prog(deal), unroll = smooth(dp / .1);
      dmap.style.setProperty('--unroll', (unroll * 100).toFixed(1) + '%');
      var sp = clamp((dp - .12) / .8, 0, .9999), k = Math.floor(sp * 5);
      setStage(k, sp * 5 - k);
    } else { dmap.style.setProperty('--unroll', '100%'); if (dealStage < 0) setStage(4); }
    // renewal: the plan draws itself, then the photograph rises floor by floor
    var rp = calm ? 1 : prog(renew), draw = smooth(rp / .2), build = clamp((rp - .2) / .72, 0, 1);
    var f = build * (CUTS.length - 1), fi = Math.floor(f), cut = fi >= CUTS.length - 1 ? 0 : lerp(CUTS[fi], CUTS[fi + 1], smooth(f - fi));
    bld.style.setProperty('--cut', cut.toFixed(2) + '%');
    blines.forEach(function (p, i) { p.style.setProperty('--draw', smooth(draw * blines.length - (blines.length - 1 - i)).toFixed(3)); });
    btags.forEach(function (b, i) { b.classList.toggle('on', calm || cut < [70, 45, 20][i]); });
    floorsEl.textContent = calm ? 5 : FLOORS[Math.min(fi, FLOORS.length - 1)];
    // the footer frond opens from a point
    var fr = foot.getBoundingClientRect(), fo = calm ? 1 : smooth((vh - fr.top) / (Math.min(fr.height, vh) * .9));
    ffrond.style.setProperty('--open', (6 + fo * 110).toFixed(1) + '%');
    // the key tag on phones, once the hero buttons are gone
    var ar = acts.getBoundingClientRect();
    keytag.classList.toggle('show', ar.bottom < 0 && fr.top > vh - 40);
  }

  function layout() { plots.build(); mono.size(); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (innerWidth !== lw || !phone()) { lw = innerWidth; layout(); } else tick(); }, 140); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); compose(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); plots.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 900);
  addEventListener('load', tick);
})();
