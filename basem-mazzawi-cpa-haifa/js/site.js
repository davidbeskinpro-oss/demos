(function () {
  var root = document.documentElement, WA = '972526415760', MAIL = 'mazzawi.b@gmail.com';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 900; };
  var TITLE = { he: 'באסם מזאווי · רואה חשבון ובודק שכר מוסמך · חיפה', en: 'Basem Mazzawi · CPA & certified payroll examiner · Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור באסם מזאווי רו״ח · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Basem Mazzawi CPA · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'באסם מזאווי רו״ח', 'Basem Mazzawi CPA');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-seg]', 'סוג עסק', 'Business type');
    aria('[data-t-call]', 'התקשרו לבאסם, 052-641-5760', 'Call Basem, 052-641-5760');
    aria('[data-t-wa]', 'וואטסאפ לבאסם', 'WhatsApp Basem');
    $$('[data-decode]').forEach(function (d) { d.textContent = d.dataset[l]; });
    $$('.tg').forEach(function (t) { t.innerHTML = '<span>' + t.dataset[l] + '</span>'; });
    month();
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('bm-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('bm-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-odo]').forEach(function (o) { roll(o, true); });
    layout(); digits.kick(); write(true); setStep(curStep, true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8.5, 17], 1: [8.5, 17], 2: [8.5, 17], 3: [8.5, 17], 4: [8.5, 17], 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', month: 'numeric', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, m: (+o.month) - 1 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t === 'all') { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
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
      var val = t === 'all' ? (l ? '24 שעות' : '24 hours') : t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento,.cb').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 70 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // letters of his name, and of the footer name
  function split(el, base) {
    var i = base || 0;
    el.innerHTML = el.textContent.split('').map(function (c) { return c === ' ' ? ' ' : '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('');
  }
  $$('[data-split] > span[lang]').forEach(function (sp, k) { split(sp, sp.closest('.h-b') ? 5 : 0); });
  $$('[data-fname] > span[lang]').forEach(function (sp) { split(sp); });

  var hero = $('[data-hero]'), stage = $('[data-stage]'), nav = $('[data-nav]'), frame = $('[data-frame]');

  // fit the two halves of the name beside the frame (desktop) or across the phone (rule h)
  function fitName() {
    var halves = $$('.half'), W = stage.clientWidth, m = parseFloat(getComputedStyle(halves[0]).insetInlineStart) || 16;
    root.style.setProperty('--nsz', '100px');
    var nameEl = $('.name'); nameEl.style.setProperty('--nsz', '100px');
    halves.forEach(function (h) { h.style.fontSize = '100px'; });
    var wmax = Math.max.apply(null, halves.map(function (h) { var s = h.querySelector('span[lang]:not([hidden])'); return h.scrollWidth || 1; }));
    var avail, cap;
    if (phone()) { avail = W - 32; cap = W * .19; }
    else { avail = (W - frame.offsetWidth) / 2 - m - 40; cap = Math.min(160, innerHeight * .2); }
    var sz = Math.max(36, Math.min(cap, 100 * avail / wmax));
    halves.forEach(function (h) { h.style.fontSize = sz.toFixed(1) + 'px'; });
  }

  // ---------------------------------------------------------------- the logo's bars and arrow, rebuilt from ledger digits
  var digits = (function () {
    var cv = $('[data-digits]'), c = cv.getContext('2d'), img = $('[data-logosrc]');
    var P = [], A = [], w, h, raf = 0, vis = true, t0 = 0, mx = -999, my = -999, pulses = [], ok = false, src = null;
    function readLogo() {
      try {
        var sw = 260, sh = Math.round(260 * img.naturalHeight / img.naturalWidth), sc = document.createElement('canvas');
        sc.width = sw; sc.height = sh; var x2 = sc.getContext('2d'); x2.drawImage(img, 0, 0, sw, sh);
        var d = x2.getImageData(0, 0, sw, sh).data, pts = [], minx = 1e9, maxx = 0, miny = 1e9, maxy = 0;
        for (var y = 0; y < sh; y++) for (var x = 0; x < sw; x++) {
          var k = (y * sw + x) * 4, r = d[k], g = d[k + 1], b = d[k + 2], a = d[k + 3]; if (a < 140) continue;
          var type = b > r + 40 && b > 120 ? 1 : (r < 100 && g < 100 && b < 100 && y < sh * .66) ? 2 : 0;
          if (!type) continue;
          pts.push([x, y, type]); if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y;
        }
        var grid = {}; pts.forEach(function (p) { grid[p[0] + ',' + p[1]] = p[2]; });
        src = { grid: grid, minx: minx, maxx: maxx, miny: miny, maxy: maxy }; return true;
      } catch (e) { return false; }
    }
    function build() {
      if (!src) return;
      var dpr = Math.min(2, devicePixelRatio || 1); w = stage.clientWidth; h = stage.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var x0 = w * .03, x1 = w * .97, y0 = h * (phone() ? .1 : .2), y1 = h * (phone() ? .62 : .97);
      var gx = phone() ? 11 : 14, gy = phone() ? 13 : 16, cols = Math.floor((x1 - x0) / gx), rows = Math.floor((y1 - y0) / gy);
      var bw = src.maxx - src.minx, bh = src.maxy - src.miny; P = [];
      for (var r = 0; r < rows; r++) for (var q = 0; q < cols; q++) {
        var lx = Math.round(src.minx + q / cols * bw), ly = Math.round(src.miny + r / rows * bh), t = src.grid[lx + ',' + ly];
        if (!t) continue;
        P.push({ hx: x0 + q * gx, hy: y0 + r * gy, t: t, d: Math.floor(Math.random() * 10), nx: Math.random() * 3000, x: Math.random() * w, y: Math.random() * h, sx: 0, sy: 0, vx: 0, vy: 0, dl: Math.random() * .8, hot: 0 });
      }
      P.forEach(function (p) { p.sx = p.x; p.sy = p.y; });
      A = []; for (var i = 0; i < (phone() ? 50 : 110); i++) A.push({ x: Math.random() * w, y: Math.random() * h, d: Math.floor(Math.random() * 10), v: .1 + Math.random() * .25 });
      t0 = performance.now();
    }
    function frame(now) {
      raf = 0; if (!ok) return;
      var calm = still(), T = (now - t0) / 1000, ph = phone();
      c.clearRect(0, 0, w, h);
      c.font = '600 ' + (ph ? 11 : 13) + 'px "Open Sans",Arial,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      // the drifting ledger figures in the background
      c.fillStyle = 'rgba(134,185,222,.09)';
      for (var a = 0; a < A.length; a++) { var q = A[a]; if (!calm) { q.y -= q.v; if (q.y < -10) { q.y = h + 10; q.x = Math.random() * w; } } c.fillText(q.d, q.x, q.y); }
      var band = ph && !calm ? ((T % 4.5) / 4.5) * h * .75 : -999;
      pulses = pulses.filter(function (p) { return now - p.t < 1300; });
      for (var i = 0; i < P.length; i++) {
        var p = P[i], e = calm ? 1 : smooth((T - p.dl) / 1.5);
        var tx = p.hx, ty = p.hy;
        if (calm) { p.x = tx; p.y = ty; }
        else if (e < 1) { p.x = lerp(p.sx, tx, e); p.y = lerp(p.sy, ty, e); }
        else {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 14400) { var f = (14400 - d2) / 14400 * 2.4, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; p.hot = 1; }
          for (var k = 0; k < pulses.length; k++) { var pu = pulses[k], rr = (now - pu.t) * .5, ex = p.x - pu.x, ey = p.y - pu.y, dist = Math.sqrt(ex * ex + ey * ey); if (Math.abs(dist - rr) < 16) { p.hot = 1; p.vx += ex / (dist || 1) * 3; p.vy += ey / (dist || 1) * 3; } }
          if (Math.abs(p.hy - band) < 14) p.hot = Math.max(p.hot, .8);
          p.vx += (tx - p.x) * .07; p.vy += (ty - p.y) * .07; p.vx *= .8; p.vy *= .8; p.x += p.vx; p.y += p.vy;
        }
        if (!calm && (now > p.nx || p.hot > .5)) { p.d = Math.floor(Math.random() * 10); p.nx = now + 900 + Math.random() * 3200; }
        var hot = p.hot; p.hot *= .94;
        if (hot > .05) c.fillStyle = 'rgba(227,178,61,' + (.3 + hot * .65).toFixed(3) + ')';
        else c.fillStyle = p.t === 1 ? 'rgba(96,160,210,.34)' : 'rgba(225,232,240,.4)';
        c.fillText(p.d, p.x, p.y);
      }
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() { ok = readLogo(); if (ok) { build(); kick(); } }
    stage.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = stage.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    stage.addEventListener('pointerleave', function () { mx = my = -999; });
    stage.addEventListener('pointerdown', function (e) { var r = stage.getBoundingClientRect(); pulses.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }); kick(); });
    watch(stage, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { var keep = P.length; build(); if (keep) P.forEach(function (p) { p.dl = -2; }); kick(); } } };
  })();

  // ---------------------------------------------------------------- the reel inside the frame
  var reel = $('[data-reel]'), reelIdx = 0;
  var reelStart = performance.now();
  setInterval(function () {
    if (still() || !phone() || performance.now() - reelStart < 5500) return;
    var r = hero.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    reelIdx = (reelIdx + 1) % 4; reel.style.transition = 'transform 1s cubic-bezier(.77,0,.175,1)'; reel.style.transform = 'translateY(' + (-reelIdx * 100) + '%)';
  }, 4200);

  // ---------------------------------------------------------------- Basem: photo tilts toward the hand, the sheet tilts and lands
  var bsec = $('.basem'), tilt = $('[data-tilt] .b-in'), sheet = $('[data-sheet]');
  watch(bsec, function (v) { bsec.classList.toggle('on', v); });
  $('[data-tilt]').addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var r = tilt.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    tilt.style.transform = 'rotateY(' + (x * 9).toFixed(2) + 'deg) rotateX(' + (-y * 7).toFixed(2) + 'deg)';
    tilt.style.setProperty('--sx', (x * 120).toFixed(1) + '%');
  });
  $('[data-tilt]').addEventListener('pointerleave', function () { tilt.style.transform = ''; });

  // ---------------------------------------------------------------- odometers and decoding labels
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });
  var GL = '0123456789₪%';
  function decode(el, txt) {
    if (still()) { el.textContent = txt; return; }
    var n = 0, steps = 14; clearInterval(el._d);
    el._d = setInterval(function () {
      n++; var keep = Math.floor(txt.length * n / steps);
      el.textContent = txt.slice(0, keep) + txt.slice(keep).replace(/\S/g, function () { return GL[Math.floor(Math.random() * GL.length)]; });
      if (n >= steps) { clearInterval(el._d); el.textContent = txt; }
    }, 45);
  }
  $$('[data-decode]').forEach(function (d) { watch(d, function (v) { if (v && !d._seen) { d._seen = 1; decode(d, d.dataset[root.lang]); } }); });

  // ---------------------------------------------------------------- services: spotlight, the living fragments
  var svc = $('#services');
  watch(svc, function (v) { svc.classList.toggle('on', v); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var segs = $$('[data-seg]'), segTouched = false, segI = 0;
  function seg(i) {
    segI = i; segs.forEach(function (b, k) { b.setAttribute('aria-checked', k === i ? 'true' : 'false'); });
    $('[data-fb="tax"]').style.transform = 'scaleX(' + (i ? .58 : .86) + ')';
    $('[data-fb="keep"]').style.transform = 'scaleX(' + (i ? .9 : .62) + ')';
  }
  segs.forEach(function (b, k) { b.addEventListener('click', function () { segTouched = true; seg(k); }); });
  seg(0);
  setInterval(function () { if (!segTouched && !still() && svc.classList.contains('on')) seg(1 - segI); }, 2600);

  // ---------------------------------------------------------------- method: the monthly report that builds his logo
  var MHe = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
  var MEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var mBox = $('[data-months]'); mBox.innerHTML = new Array(13).join('<i></i>');
  function month() {
    var m = now().m; $('[data-month]').textContent = (he() ? MHe : MEn)[m];
    $$('i', mBox).forEach(function (c, i) { c.className = i < m ? 'past' : i === m ? 'now' : ''; });
  }
  var report = $('[data-report]'), steps = $$('[data-step]'), checks = $$('[data-checks] li'), curStep = -1;
  function setStep(n, force) {
    if (n === curStep && !force) return; curStep = n;
    var full = still(), p = full ? 1 : (n + 1) / steps.length;
    [.0, .1, .3, .45, .6].forEach(function (off, i) { report.style.setProperty('--b' + (i + 1), clamp((p - off * .7) * 1.5, .1, 1).toFixed(3)); });
    report.style.setProperty('--t', (1 - smooth((p - .2) / .7)).toFixed(3));
    report.style.setProperty('--ha', p > .85 ? 1 : 0);
    report.style.setProperty('--f', full || n >= steps.length - 1 ? 0 : 1);
    checks.forEach(function (c, i) { c.classList.toggle('on', full || i <= n); });
    steps.forEach(function (s, i) { s.classList.toggle('on', full || i === n); });
  }
  if (io) steps.forEach(function (s, i) { new IntersectionObserver(function (es) { if (es[0].isIntersecting && !still()) setStep(i); }, { rootMargin: '-45% 0px -45% 0px' }).observe(s); });

  // ---------------------------------------------------------------- trade: tags and parallax
  var trade = $('[data-trade]'), tphoto = $('[data-tphoto]'), tags = $$('.tg');
  trade.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    tphoto.style.setProperty('--px', (-x * 18).toFixed(1) + 'px'); tphoto.style.setProperty('--py', (-y * 12).toFixed(1) + 'px');
  });
  function tagOn(t, on) { if (on === t.classList.contains('on')) return; t.classList.toggle('on', on); if (on) decode(t.firstChild, t.dataset[root.lang]); }

  // ---------------------------------------------------------------- reviews: copies so the drift loops without a seam
  $$('[data-row]').forEach(function (r) { $$('.rv', r).forEach(function (q) { var k = q.cloneNode(true); k.setAttribute('aria-hidden', 'true'); r.appendChild(k); }); if (r.children.length < 8) $$('.rv', r).forEach(function (q) { var k = q.cloneNode(true); k.setAttribute('aria-hidden', 'true'); r.appendChild(k); }); });

  // ---------------------------------------------------------------- meet: the boxes and the memo that writes itself
  var who = $$('[data-who-o]'), what = $$('[data-what-o]'), msgEl = $('[data-msg]'), shown = '', typing = 0, memoSeen = false;
  who.forEach(function (b) { b.addEventListener('click', function () { who.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write(); }); });
  what.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); write(); }); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), k = l ? 'he' : 'en';
    var w = who.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0];
    var topics = what.filter(function (x) { return x.getAttribute('aria-pressed') === 'true'; }).map(function (x) { return x.dataset[k]; });
    return l ? 'שלום באסם, אשמח לקבוע פגישת היכרות. מי אני: ' + w.dataset.he + '.' + (topics.length ? ' בנושא ' + list(topics, true) + '.' : '')
             : 'Hello Basem, I’d like to set up an introductory meeting. I’m ' + w.dataset.en + '.' + (topics.length ? ' It’s about ' + list(topics, false) + '.' : '');
  }
  function write(instant) {
    var target = compose();
    $('[data-send-wa]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    $('[data-send-mail]').href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(he() ? 'פגישת היכרות' : 'Introductory meeting') + '&body=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !memoSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 14);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-memo]'), function (v) { if (v && !memoSeen) { memoSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .5 });

  // ---------------------------------------------------------------- footer: a curtain, the name rising, the arrow drawn
  var foot = $('[data-foot]'), page = $('.page'), keys = $('[data-keys]'), cphoto = $('.c-photo img');
  var fa = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  fa.setAttribute('class', 'f-arrow'); fa.setAttribute('viewBox', '0 0 1000 300'); fa.setAttribute('preserveAspectRatio', 'none'); fa.setAttribute('aria-hidden', 'true');
  fa.innerHTML = '<path pathLength="1" d="M0 280 L240 200 L380 245 L620 120 L760 160 L1000 20"/>';
  foot.insertBefore(fa, foot.firstChild);
  var fchars = $$('.f-name .ch');
  function curtain() {
    var fh = foot.offsetHeight, ok = fh < innerHeight * .9;
    foot.classList.toggle('static', !ok);
    page.style.marginBottom = ok ? fh + 'px' : '';
  }

  // ---------------------------------------------------------------- one scroll loop
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, ph = phone();
    nav.classList.toggle('pill', scrollY > 40);
    // hero reel (desktop: scroll-driven) and the landing sheet
    if (!ph) {
      if (calm) { reel.style.transition = ''; reel.style.transform = ''; stage.style.transform = ''; stage.style.filter = ''; }
      else {
        var rel = -hero.getBoundingClientRect().top, k = clamp(rel / (vh * .95), 0, 1) * 3, wh = Math.min(2, Math.floor(k)), kk = wh + smooth((k - wh - .2) / .6);
        if (k >= 3) kk = 3;
        reel.style.transition = 'none'; reel.style.transform = 'translateY(' + (-kk * 100).toFixed(2) + '%)';
        var bt = bsec.getBoundingClientRect().top, cover = clamp(1 - bt / vh, 0, 1);
        stage.style.transform = cover ? 'scale(' + (1 - cover * .06).toFixed(4) + ')' : '';
        stage.style.filter = cover ? 'brightness(' + (1 - cover * .55).toFixed(3) + ')' : '';
        var land = clamp((vh - bt) / (vh * .9), 0, 1);
        sheet.style.transform = 'translateY(' + ((1 - smooth(land)) * 60).toFixed(1) + 'px) rotate(' + lerp(-3.5, -.8, smooth(land)).toFixed(2) + 'deg)';
      }
    } else { stage.style.transform = ''; stage.style.filter = ''; sheet.style.transform = calm ? '' : 'rotate(-.8deg)'; }
    if (!calm && ph) { var tr = tilt.getBoundingClientRect(); tilt.style.setProperty('--sx', ((tr.top / vh - .5) * -140).toFixed(1) + '%'); }
    // trade: the photo opens to the full screen
    var tp = calm ? 1 : smooth(prog(trade) / .55);
    if (!calm) {
      tphoto.style.setProperty('--it', lerp(ph ? 22 : 15, 0, tp).toFixed(2) + 'svh');
      tphoto.style.setProperty('--ix', lerp(ph ? 6 : 24, 0, tp).toFixed(2) + 'vw');
      tphoto.style.setProperty('--ir', lerp(26, 0, tp).toFixed(1) + 'px');
      tphoto.style.setProperty('--ts', lerp(1.22, 1.02, tp).toFixed(4));
    } else { ['--it', '--ix', '--ir', '--ts'].forEach(function (v) { tphoto.style.removeProperty(v); }); }
    var tpr = calm ? 1 : prog(trade);
    tags.forEach(function (t, i) { tagOn(t, calm || tpr > .5 + i * .08); });
    // contact photo drifts with the scroll
    var cr = cphoto.parentNode.getBoundingClientRect();
    cphoto.style.setProperty('--ks', calm ? 1.04 : (1.14 - .1 * clamp((vh - cr.top) / (vh + cr.height), 0, 1)).toFixed(4));
    // footer
    var fr = foot.getBoundingClientRect(), fp = clamp((vh - fr.top) / Math.max(1, fr.height), 0, 1);
    var pr = page.getBoundingClientRect(), shown2 = calm ? 1 : clamp((vh - pr.bottom) / Math.max(1, foot.offsetHeight * .8), 0, 1);
    if (foot.classList.contains('static')) shown2 = calm ? 1 : clamp((vh - fr.top) / (fr.height * .7), 0, 1);
    fchars.forEach(function (ch, i) { ch.style.setProperty('--fy', calm ? '0' : ((1 - smooth(shown2 * 1.6 - i * .05)) * 70).toFixed(1) + '%'); });
    fa.style.setProperty('--fa', calm ? 0 : (1 - smooth(shown2 * 1.2)).toFixed(3));
    var ha = $('.h-acts').getBoundingClientRect(), heroBtns = ha.bottom > 0 && ha.top < vh;
    keys.classList.toggle('hide', heroBtns || (foot.classList.contains('static') ? fp > .3 : shown2 > .25));
  }

  function layout() { fitName(); digits.size(); curtain(); tick(); }
  var rz, lastW = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (innerWidth !== lastW || !phone()) { lastW = innerWidth; layout(); } else { curtain(); tick(); } }, 140); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); setStep(still() ? steps.length - 1 : 0, true); layout();
  var once = false, go = function () { if (once) return; once = true; fitName(); digits.size(); requestAnimationFrame(function () { hero.classList.add('ready'); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { fitName(); curtain(); tick(); });
})();
