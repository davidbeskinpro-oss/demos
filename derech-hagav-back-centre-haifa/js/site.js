(function () {
  var root = document.documentElement, WA = '972505882060';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth <= 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'מרכז דרך הגב · בני בקיש · טשרניחובסקי 37, חיפה', en: 'Derech HaGav · Benny Bakish · 37 Tchernichovsky St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור מרכז דרך הגב · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Derech HaGav centre · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'מרכז דרך הגב', 'Derech HaGav centre');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-spine]', 'פרקים', 'Chapters');
    aria('[data-t-wa]', 'וואטסאפ לבני', 'WhatsApp Benny');
    aria('[data-t-callfull]', 'התקשרו לבני, 050-588-2060', 'Call Benny, 050-588-2060');
    aria('[data-t-call]', 'התקשרו לבני', 'Call Benny');
    aria('[data-set-lang]', 'English', 'עברית');
    aria('[data-t-pick]', 'איפה כואב', 'Where it hurts');
    aria('[data-t-when]', 'מתי נוח', 'Preferred time');
    aria('[data-rv-prev]', 'הביקורת הקודמת', 'Previous review');
    aria('[data-rv-next]', 'הביקורת הבאה', 'Next review');
    $$('[data-decode-he]').forEach(function (f) { decode(f, f.dataset[l === 'he' ? 'decodeHe' : 'decodeEn'], true); });
    $$('[data-tag]').forEach(function (t) { if (t.dataset.shown) t.innerHTML = '<span>' + t.dataset[l] + '</span>'; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('dg-lang', l); } catch (e) {}
    texts(l); hours(); showReview(rvI, true); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('dg-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    mosaic.classList.add('dealt');
    clearStyles(); layout(); dust.kick(); live.kick(); breathe.kick(); write(true); showReview(rvI, true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8, 19], 1: [8, 19], 2: null, 3: [8, 19], 4: [8, 19], 5: [8, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
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
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 70 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- labels that decode out of scrambled glyphs
  var GL = 'אבגדהוזחטיכלמנסעפצקרשת#&+0123456789';
  function decode(el, txt, instant) {
    clearInterval(el._dt);
    if (instant || still()) { el.textContent = txt; return; }
    var n = 0, steps = txt.length + 8;
    el._dt = setInterval(function () {
      n++;
      var G = /[\u0590-\u05FF]/.test(txt) ? GL : 'ABCDEFGHKMNPRSTVXZ#&+0123456789';
      el.textContent = txt.split('').map(function (c, i) { return c === ' ' || i < n - 8 ? c : (i < n ? G[Math.floor(Math.random() * G.length)] : ''); }).join('');
      if (n >= steps) { clearInterval(el._dt); el.textContent = txt; }
    }, 42);
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
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { setTimeout(function () { roll(o, true); }, 500); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- hero: the photos are dealt into the mosaic; they lean toward the hand
  var hero = $('[data-hero]'), nav = $('[data-nav]'), mosaic = $('[data-mosaic]'), cells = $$('[data-cell]', mosaic), heroOn = true;
  function dealSetup() {
    var mr = mosaic.getBoundingClientRect(), cx = mr.left + mr.width / 2, cy = mr.top + mr.height / 2;
    cells.forEach(function (c, i) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--dx', (cx - (r.left + r.width / 2)).toFixed(0) + 'px');
      c.style.setProperty('--dy', (cy - (r.top + r.height / 2) + 40).toFixed(0) + 'px');
      c.style.setProperty('--dr', ((i % 2 ? 1 : -1) * (6 + i * 2)) + 'deg');
      c.style.setProperty('--dd', (i * 90) + 'ms');
      c.style.zIndex = c.classList.contains('c-benny') ? 9 : i;
    });
  }
  var pmx = 0, pmy = 0, auto = !fine;
  hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; auto = false; pmx = e.clientX / innerWidth - .5; pmy = e.clientY / innerHeight - .5; });
  watch(hero, function (v) { heroOn = v; if (v) live.kick(); });

  // ---------------------------------------------------------------- the spine: crooked near the top, aligned by the end; it marks the chapter you are in
  var spine = $('[data-spine]'), vts = $$('.vt', spine), chapters = vts.map(function (v) { return $(v.getAttribute('href')); });
  var crook = 1, tBreath = 0;
  function spineDraw() {
    var amp = phone() ? 5 : 13, b = still() ? 0 : Math.sin(tBreath) * .9;
    vts.forEach(function (v, i) {
      var k = i - 3.5, x = crook * amp * Math.sin(i * .95 + .7) + b * (i % 2 ? 1 : -1) * .6, r = crook * 13 * Math.cos(i * .95 + .7) + b * .8;
      v.style.setProperty('--sx', x.toFixed(2) + 'px'); v.style.setProperty('--sr', r.toFixed(2) + 'deg');
    });
  }
  var breathe = (function () {
    var raf = 0;
    function f(t) { raf = 0; if (still()) { spineDraw(); return; } tBreath = t / 1400; spineDraw(); raf = requestAnimationFrame(f); }
    function kick() { if (!raf) raf = requestAnimationFrame(f); }
    return { kick: kick };
  })();
  function spineActive() {
    var a = 0, mid = innerHeight * .42;
    chapters.forEach(function (c, i) { if (c && c.getBoundingClientRect().top < mid) a = i; });
    vts.forEach(function (v, i) { v.classList.toggle('on', i === a); if (i === a) v.setAttribute('aria-current', 'true'); else v.removeAttribute('aria-current'); });
  }

  // ---------------------------------------------------------------- Benny: the logo's own particles form its oval, then open like a lens onto him
  var lens = $('[data-lens]'), scene = $('[data-scene]'), lensOn = false;
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), img = $('[data-dustsrc]'), P = [], M = [], w = 1, h = 1, raf = 0, ok = false, t0 = 0, mx = -999, my = -999;
    function sample() {
      try {
        var sc = document.createElement('canvas'), n = 220; sc.width = n; sc.height = n;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, n, n);
        var d = sx.getImageData(0, 0, n, n).data, pts = [];
        for (var y = 0; y < n; y += 2) for (var x = 0; x < n; x += 2) {
          var k = (y * n + x) * 4, r = d[k], g = d[k + 1], b = d[k + 2];
          if (r + g + b < 560 && r - b > 30) pts.push([x / n - .5, y / n - .5, r > 170 ? '#e6a45a' : '#b0685a']);
        }
        var want = phone() ? 1300 : 2400, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) { var q = pts[Math.floor(f)]; P.push({ hx: q[0], hy: q[1], col: q[2], a: Math.atan2(q[1], q[0]), sx: (Math.random() - .5) * 2.4, sy: (Math.random() - .5) * 2.4, ph: Math.random() * 6.28, j: .9 + Math.random() * .2, x: 0, y: 0, vx: 0, vy: 0 }); }
        M = []; for (var m = 0; m < (phone() ? 70 : 150); m++) M.push({ x: Math.random(), y: Math.random(), v: .004 + Math.random() * .012, s: 1 + Math.random() * 1.8, ph: Math.random() * 6.28 });
        ok = P.length > 0;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth || innerWidth; h = cv.clientHeight || innerHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(now) {
      raf = 0; if (!ok || still()) { c.clearRect(0, 0, w, h); return; }
      var T = (now - t0) / 1000, r = lens.getBoundingClientRect(), vh = innerHeight;
      var enter = smooth(1 - r.top / vh), p = prog(lens), open = smooth(p / .42), fade = 1 - smooth((p - .38) / .16);
      var S = Math.min(w, h) * (phone() ? .78 : .56), cx = w / 2, cy = h / 2;
      var rx = lerp(S * .46, Math.hypot(w, h) * .62, open), ry = lerp(S * .4, Math.hypot(w, h) * .62, open);
      c.clearRect(0, 0, w, h);
      // motes in the treatment-room light, drifting up through the whole scene
      c.fillStyle = '#f0bf7e';
      M.forEach(function (m) { var yy = ((m.y - T * m.v) % 1 + 1) % 1, xx = m.x + Math.sin(T * .6 + m.ph) * .01; c.globalAlpha = .18 + .14 * Math.sin(T * 1.5 + m.ph); c.beginPath(); c.arc(xx * w, yy * h, m.s, 0, 7); c.fill(); });
      if (fade <= 0) { if (lensOn) raf = requestAnimationFrame(frame); return; }
      c.globalAlpha = 1;
      for (var i = 0; i < P.length; i++) {
        var q = P[i];
        var lx = cx + q.hx * S + Math.sin(T * 1.2 + q.ph) * 1.2, ly = cy + q.hy * S + Math.cos(T + q.ph) * 1.2;
        var ox = cx + Math.cos(q.a) * rx * q.j, oy = cy + Math.sin(q.a) * ry * q.j;
        var tx = lerp(lx, ox, open), ty = lerp(ly, oy, open);
        var fx = lerp(cx + q.sx * w, tx, enter), fy = lerp(cy + q.sy * h, ty, enter);
        var dx = q.x - mx, dy = q.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 9000 && open < .05) { var ff = (9000 - d2) / 9000 * 3, dd = Math.sqrt(d2) || 1; q.vx += dx / dd * ff; q.vy += dy / dd * ff; }
        q.vx = (q.vx + (fx - q.x) * .12) * .78; q.vy = (q.vy + (fy - q.y) * .12) * .78; q.x += q.vx; q.y += q.vy;
        c.globalAlpha = fade * (.55 + .45 * Math.sin(T * 2 + q.ph) * .5 + .2);
        c.fillStyle = q.col; c.fillRect(q.x - 1.4, q.y - 1.4, 2.8, 2.8);
      }
      c.globalAlpha = 1;
      if (lensOn) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() { size(); sample(); t0 = performance.now(); P.forEach(function (q) { q.x = w / 2 + q.sx * w; q.y = h / 2 + q.sy * h; }); kick(); }
    lens.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    lens.addEventListener('pointerleave', function () { mx = my = -999; });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();
  watch(lens, function (v) { lensOn = v; if (v) dust.kick(); });
  var lmx = 0, lmy = 0;
  lens.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; lmx = e.clientX / innerWidth - .5; lmy = e.clientY / innerHeight - .5; tick(); });

  // ---------------------------------------------------------------- care rows: the row nearest the middle is lit; its drawing comes alive
  var rows = $$('[data-row]'), rowsOn = new Set();
  rows.forEach(function (r) {
    r.addEventListener('pointermove', function (e) { var b = r.getBoundingClientRect(); r.style.setProperty('--mx', (e.clientX - b.left) + 'px'); r.style.setProperty('--my', (e.clientY - b.top) + 'px'); });
    r.addEventListener('pointerenter', function () { rowsOn.add(r); live.kick(); });
    r.addEventListener('pointerleave', function () { rowsOn.delete(r); });
  });
  var activeRow = null;
  function rowActive() {
    var mid = innerHeight * .5, best = null, bd = 1e9;
    rows.forEach(function (r) { var b = r.getBoundingClientRect(), d = Math.abs(b.top + b.height / 2 - mid); if (d < bd && b.bottom > 0 && b.top < innerHeight) { bd = d; best = r; } });
    if (bd > innerHeight * .45) best = null;
    if (best !== activeRow) { rows.forEach(function (r) { r.classList.toggle('on', r === best); }); activeRow = best; live.kick(); }
  }
  // the neck's seven vertebrae, the back's muscle fibres and the foot's pressure points are built here
  var cvG = $('[data-cv]'), cvR = [];
  for (var i = 0; i < 7; i++) { var rc = document.createElementNS(NS, 'rect'); rc.setAttribute('width', 34 - i); rc.setAttribute('height', 15); rc.setAttribute('rx', 4); cvG.appendChild(rc); cvR.push(rc); }
  var skull = document.createElementNS(NS, 'path'); skull.setAttribute('d', 'M-34 -10 C-34 -40 34 -40 34 -10 C34 4 20 10 0 10 C-20 10 -34 4 -34 -10Z'); cvG.appendChild(skull);
  function neck(b) {   // b: 0 = head pushed forward, 1 = stacked over the shoulders
    var x0 = 110, y0 = 168;
    cvR.forEach(function (rc, i) {
      var t = (6 - i) / 6, fwd = (1 - b) * 46 * t * t, curve = b * 9 * Math.sin(t * Math.PI);
      var x = x0 + fwd - curve, y = y0 - (7 - i) * 18;
      rc.setAttribute('x', (x - (34 - i) / 2).toFixed(1)); rc.setAttribute('y', y.toFixed(1));
      rc.setAttribute('transform', 'rotate(' + ((1 - b) * 22 * t).toFixed(1) + ' ' + x.toFixed(1) + ' ' + (y + 7).toFixed(1) + ')');
    });
    var hx = x0 + (1 - b) * 52, hy = 34 + (1 - b) * 8;
    skull.setAttribute('transform', 'translate(' + hx.toFixed(1) + ' ' + hy.toFixed(1) + ') rotate(' + ((1 - b) * 18).toFixed(1) + ')');
  }
  var fibG = $('[data-fib]'), fibs = [];
  for (i = 0; i < 6; i++) { var fp = document.createElementNS(NS, 'path'); fibG.appendChild(fp); fibs.push(fp); }
  function fibres(amp, ph) {
    fibs.forEach(function (fp, i) {
      var side = i < 3 ? -1 : 1, x = 110 + side * (34 + (i % 3) * 14), d = 'M' + x + ' 14';
      for (var y = 14; y <= 170; y += 8) d += ' L' + (x + Math.sin(y * .09 + ph + i) * amp * (1 - (i % 3) * .2)).toFixed(1) + ' ' + y;
      fp.setAttribute('d', d);
    });
  }
  var prG = $('[data-pr]'), prs = [[52, 140], [64, 146], [84, 146], [108, 142], [132, 132], [154, 112], [170, 98], [184, 96], [176, 120]];
  prs = prs.map(function (p) { var c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', p[0]); c.setAttribute('cy', p[1]); c.setAttribute('r', 0); prG.appendChild(c); return c; });
  var nuc = $('[data-nuc]'), shin = $('[data-shin]');
  function drawViz(T, calm) {
    var on = function (z) { var r = rows[z]; return !calm && (r === activeRow || rowsOn.has(r)); };
    neck(calm ? 1 : on(1) ? .5 + .5 * Math.sin(T * 1.1 - 1.2) : .25);
    fibres(calm ? 2 : on(2) ? 3 + 4 * (.5 + .5 * Math.sin(T * .9)) : 5, calm ? 0 : T * 2.2);
    var bl = calm ? 0 : on(3) ? .5 + .5 * Math.sin(T * 1.2) : .6;
    nuc.setAttribute('cx', (110 + bl * 26).toFixed(1)); nuc.setAttribute('rx', (26 + bl * 14).toFixed(1));
    shin.setAttribute('transform', 'rotate(' + (calm ? 0 : on(4) ? -22 * (.5 + .5 * Math.sin(T * 1.3)) : 0).toFixed(1) + ' 110 97)');
    prs.forEach(function (c, i) { var u = calm ? 1 : on(5) ? clamp(((T * .9) % 2.2) * prs.length / 1.6 - i, 0, 1) : .35; c.setAttribute('r', (u * (i === 0 || i > 6 ? 7 : 5)).toFixed(1)); c.setAttribute('opacity', (.3 + u * .7).toFixed(2)); });
  }

  // ---------------------------------------------------------------- one rAF for the living bits that need it (hero drift, the care drawings)
  var live = (function () {
    var raf = 0, t0 = performance.now();
    function f(t) {
      raf = 0; var T = (t - t0) / 1000, calm = still();
      // hero: the photos lean toward the hand; on touch they drift by themselves
      if (!calm && heroOn) {
        var ax = auto ? Math.sin(T * .5) * .35 : pmx, ay = auto ? Math.cos(T * .4) * .3 : pmy;
        cells.forEach(function (c, i) { var dpt = c.classList.contains('c-benny') ? 10 : 18 + (i % 3) * 6; c.style.setProperty('--px', (-ax * dpt).toFixed(2) + 'px'); c.style.setProperty('--py', (-ay * dpt).toFixed(2) + 'px'); });
      }
      drawViz(T, calm);
      if (!calm && (heroOn || activeRow || rowsOn.size)) raf = requestAnimationFrame(f);
    }
    return { kick: function () { if (!raf) raf = requestAnimationFrame(f); } };
  })();

  // ---------------------------------------------------------------- insoles: a pressure scan over the real photo, then it shrinks into its frame
  var ins = $('[data-ins]'), iph = $('[data-iphoto]'), heat = $('[data-heat]'), hc = heat.getContext('2d'), scan = $('.i-scan', iph), stairs = $$('[data-st]'), tags = $$('[data-tag]');
  // pressure points on the photo (image coordinates 0..1): heel, mid-foot, ball, toes, where the foot meets the insole
  var HP = [[.86, .55, 1], [.80, .63, .85], [.70, .68, .6], [.58, .72, .5], [.46, .76, .75], [.36, .78, .95], [.27, .76, .85], [.20, .72, .7]];
  var iw = 1231, ih = 1231, hw = 1, hh = 1;
  function heatSize() { var dpr = Math.min(2, devicePixelRatio || 1); hw = iph.clientWidth; hh = iph.clientHeight; heat.width = hw * dpr; heat.height = hh * dpr; hc.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function cover() { var s = Math.max(hw / iw, hh / ih); return { s: s, ox: (hw - iw * s) / 2, oy: (hh - ih * s) / 2 }; }
  function heatDraw(scanY) {
    hc.clearRect(0, 0, hw, hh); var cv = cover();
    HP.forEach(function (p) {
      var x = cv.ox + p[0] * iw * cv.s, y = cv.oy + p[1] * ih * cv.s, k = clamp((scanY * hh - y) / (hh * .12) + .2, 0, 1) * p[2];
      if (k <= 0) return;
      var R = Math.min(hw, hh) * .17 * (.7 + p[2] * .5), g = hc.createRadialGradient(x, y, 0, x, y, R);
      g.addColorStop(0, 'rgba(255,226,160,' + (.95 * k) + ')'); g.addColorStop(.3, 'rgba(240,150,70,' + (.75 * k) + ')'); g.addColorStop(.65, 'rgba(170,60,40,' + (.4 * k) + ')'); g.addColorStop(1, 'rgba(120,40,30,0)');
      hc.fillStyle = g; hc.beginPath(); hc.arc(x, y, R, 0, 7); hc.fill();
    });
  }
  function tagsPlace() {
    var cv = cover();
    tags.forEach(function (t) { t.style.left = (cv.ox + +t.style.getPropertyValue('--x') * iw * cv.s) + 'px'; t.style.top = (cv.oy + +t.style.getPropertyValue('--y') * ih * cv.s) + 'px'; });
  }
  function tagShow(t, on) {
    if (!!t.dataset.shown === on) return;
    if (!on) { delete t.dataset.shown; t.innerHTML = ''; return; }
    t.dataset.shown = '1'; t.innerHTML = '<span></span>'; decode(t.firstChild, t.dataset[he() ? 'he' : 'en']);
  }

  // ---------------------------------------------------------------- room: the camera walks through the door
  var room = $('[data-room]'), cam = $('[data-cam]');

  // ---------------------------------------------------------------- reviews: one at a time, the quote fills in letter by letter
  var src = $$('[data-rv-src] li'), qEl = $('[data-rv-q]'), qBox = qEl.parentNode, nmEl = $('[data-rv-name]'), nEl = $('[data-rv-n]'), rvI = 0, rvTimer = 0, rvSeen = false, rvTouched = false;
  function showReview(i, instant) {
    rvI = (i + src.length) % src.length;
    var li = src[rvI], l = he() ? 'he' : 'en', txt = $('[lang="' + l + '"]', li).textContent.trim(), k = 0;
    nmEl.textContent = li.dataset[l === 'he' ? 'nHe' : 'nEn']; nEl.textContent = (rvI + 1) + ' / ' + src.length;
    qEl.classList.toggle('long', txt.length > 200);
    qEl.innerHTML = txt.split(' ').map(function (w) { return '<span style="white-space:nowrap">' + w.split('').map(function (ch) { return '<span class="q" style="--i:' + (k++) + '">' + ch + '</span>'; }).join('') + '</span>'; }).join(' ');
    qBox.classList.remove('fill');
    if (instant || still()) qBox.classList.add('fill');
    else requestAnimationFrame(function () { requestAnimationFrame(function () { qBox.classList.add('fill'); }); });
  }
  $('[data-rv-prev]').addEventListener('click', function () { rvTouched = true; showReview(rvI - 1); });
  $('[data-rv-next]').addEventListener('click', function () { rvTouched = true; showReview(rvI + 1); });
  watch($('[data-split]'), function (v) {
    clearInterval(rvTimer);
    if (v && !rvSeen) { rvSeen = true; showReview(0); }
    if (v) rvTimer = setInterval(function () { if (!rvTouched && !still()) showReview(rvI + 1); }, 9000);
  }, { threshold: .35 });

  // ---------------------------------------------------------------- write: tap the vertebrae, the request card writes itself
  var pvs = $$('.pv'), whens = $$('[data-t-when] button'), msgEl = $('[data-msg]'), shown = '', typing = 0, cardSeen = false;
  pvs.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); write(); }); });
  whens.forEach(function (b) { b.addEventListener('click', function () { whens.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write(); }); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = pvs.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.dataset[l ? 'he' : 'en']; });
    var w = whens.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], when = w.dataset[l ? 'he' : 'en'];
    return l ? 'שלום בני, ' + (picked.length ? 'אני פונה בעניין ' + list(picked, true) + '. ' : '') + 'אשמח לקבוע תור, עדיף ' + when + '.'
             : 'Hi Benny, ' + (picked.length ? 'I’m getting in touch about: ' + picked.join(', ') + '. ' : '') + 'I’d like to book an appointment, ideally ' + when + '.';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !cardSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 16);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  $$('[data-go]').forEach(function (b) { b.addEventListener('click', function () {
    var pv = pvs[+b.dataset.go]; pvs.forEach(function (x) { x.setAttribute('aria-pressed', x === pv ? 'true' : 'false'); });
    var t = $('#write'); t.scrollIntoView({ behavior: still() ? 'auto' : 'smooth' }); setTimeout(function () { write(); }, 400);
  }); });
  watch($('[data-card]'), function (v) { if (v && !cardSeen) { cardSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- footer: the number fills the width and rises as the curtain opens
  var foot = $('[data-foot]'), fph = $('[data-fit]');
  function fitPhone() { fph.style.fontSize = ''; var box = fph.parentNode.clientWidth, w = fph.scrollWidth, fs = parseFloat(getComputedStyle(fph).fontSize); fph.style.fontSize = Math.min(fs * box / w * .98, 260) + 'px'; }

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, W = innerWidth;
    nav.classList.toggle('pill', scrollY > 40);
    var max = Math.max(1, document.documentElement.scrollHeight - vh);
    crook = calm ? .25 : 1 - smooth(scrollY / max * 1.05);
    spineDraw(); spineActive(); rowActive();
    if (!calm) { dust.kick(); live.kick(); }

    // Benny: the oval opens; the room and Benny move at two depths
    if (!calm) {
      var p = prog(lens), op = smooth(p / .42), sw = scene.clientWidth, sh = scene.clientHeight, S = Math.min(sw, sh) * (phone() ? .78 : .56);
      var gate = smooth(op * 2.2);   // the scene opens from nothing inside the particle oval
      scene.style.setProperty('--rx', (lerp(S * .46, Math.hypot(sw, sh) * .62, op) * gate).toFixed(1) + 'px');
      scene.style.setProperty('--ry', (lerp(S * .4, Math.hypot(sw, sh) * .62, op) * gate).toFixed(1) + 'px');
      scene.style.setProperty('--as', lerp(1.18, 1, smooth(p / .8)).toFixed(4));
      scene.style.setProperty('--bs', lerp(1.12, 1, smooth(p / .7)).toFixed(4));
      scene.style.setProperty('--by', lerp(40, 0, smooth(p / .7)).toFixed(1) + 'px');
      scene.style.setProperty('--ax', (-lmx * 14).toFixed(1) + 'px'); scene.style.setProperty('--ay', (-lmy * 10).toFixed(1) + 'px');
      scene.style.setProperty('--bx', (-lmx * 34).toFixed(1) + 'px');
      lens.style.setProperty('--co', smooth((p - .38) / .2).toFixed(3));
      if (p > .4 && !lens._dec) { lens._dec = 1; var dc = $('.decode', lens); decode(dc, dc.dataset.decode); }
    }

    // insoles
    var ip = calm ? 1 : prog(ins);
    if (!calm) {
      var sy = clamp(ip / .32, 0, 1); heatDraw(sy * 1.1);
      scan.style.transform = 'translateY(' + (sy * iph.clientHeight).toFixed(1) + 'px)'; scan.style.opacity = sy > 0 && sy < 1 ? .9 : 0;
      tags.forEach(function (t, i) { tagShow(t, ip > .1 + i * .07 && ip < .42); });
      var e = smooth((ip - .34) / .24), Wp = iph.clientWidth, Hp = iph.clientHeight, S0 = Math.min(Wp, Hp), side, tcx, tcy;
      if (phone()) { side = Math.min(Wp - 2 * 16 - 22, Hp * .36); tcx = rtl() ? (Wp - 22) / 2 + 22 : (Wp - 22) / 2; tcy = 84 + side / 2; }
      else { var ax = Wp * .42; side = Math.min(Hp * .7, ax - 60); tcx = rtl() ? Wp - ax / 2 : ax / 2; tcy = Hp / 2; }
      var fcx = Wp * .5, fcy = Hp * .5;     // the foot sits in the middle of the photo
      var ci = lerp(0, 1, e), insX = (Wp - S0) / 2 * ci, insY = (Hp - S0) / 2 * ci, sc = lerp(1, side / S0, e);
      iph.style.setProperty('--pl', insX.toFixed(1) + 'px'); iph.style.setProperty('--pr', insX.toFixed(1) + 'px');
      iph.style.setProperty('--pt', insY.toFixed(1) + 'px'); iph.style.setProperty('--pb', insY.toFixed(1) + 'px');
      iph.style.setProperty('--prr', (e * 22 / Math.max(sc, .1)).toFixed(1) + 'px');
      iph.style.transform = 'translate(' + ((tcx - fcx) * e).toFixed(1) + 'px,' + ((tcy - fcy) * e).toFixed(1) + 'px) scale(' + sc.toFixed(4) + ')';
      stairs.forEach(function (s, i) { s.style.setProperty('--o', smooth((ip - .56 - i * .07) / .07).toFixed(3)); });
    }

    // room: the camera pushes toward the treatment room's door
    if (!calm) {
      var rp = prog(room), re = smooth(rp / .85), r0 = room.getBoundingClientRect(), pre = clamp(1 - r0.top / vh, 0, 1);
      cam.style.setProperty('--cs', (1.06 + re * .66 + (1 - pre) * .08).toFixed(4));
      cam.style.setProperty('--cx', (-lmx * 18).toFixed(1) + 'px'); cam.style.setProperty('--cy', ((1 - pre) * 40).toFixed(1) + 'px');
      cam.style.setProperty('--cb', (.5 + re * .32).toFixed(3));
      cam.style.setProperty('--ls', (.5 + re * 1.4).toFixed(3)); cam.style.setProperty('--lo', (.3 + re * .55).toFixed(3));
    }

    // footer number rises as the curtain opens
    var fr = foot.getBoundingClientRect(), fp2 = calm ? 1 : smooth((vh - fr.top) / Math.max(1, fr.height));
    fph.style.setProperty('--rise', ((1 - fp2) * 70).toFixed(1) + 'px');
  }
  function clearStyles() {
    if (!still()) return;
    ['--rx', '--ry', '--as', '--bs', '--by', '--ax', '--ay', '--bx'].forEach(function (k) { scene.style.removeProperty(k); });
    lens.style.removeProperty('--co');
    iph.style.transform = ''; ['--pl', '--pr', '--pt', '--pb', '--prr'].forEach(function (k) { iph.style.removeProperty(k); });
    stairs.forEach(function (s) { s.style.removeProperty('--o'); });
    scan.style.opacity = 0; cells.forEach(function (c) { c.style.removeProperty('--px'); c.style.removeProperty('--py'); });
    tags.forEach(function (t) { tagShow(t, true); });
    $$('.decode').forEach(function (d) { d.textContent = d.dataset.decode; });
    requestAnimationFrame(function () { heatSize(); tagsPlace(); heatDraw(1.2); });
  }

  function layout() { dust.size(); heatSize(); tagsPlace(); fitPhone(); if (still()) heatDraw(1.2); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); if (innerWidth !== lw) { lw = innerWidth; } }, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); showReview(0, true);
  if (still()) { mosaic.classList.add('dealt'); clearStyles(); }
  layout(); breathe.kick();
  var once = false, go = function () {
    if (once) return; once = true;
    dealSetup();
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      mosaic.classList.add('dealt'); hero.classList.add('ready'); live.kick();
      setTimeout(function () { $$('[data-decode-he]').forEach(function (f, i) { setTimeout(function () { decode(f, f.dataset[he() ? 'decodeHe' : 'decodeEn']); }, i * 120); }); }, 900);
    }); });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { layout(); });
  if (still()) { $$('[data-decode-he]').forEach(function (f) { decode(f, f.dataset[he() ? 'decodeHe' : 'decodeEn'], true); }); }
})();
