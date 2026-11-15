(function () {
  var root = document.documentElement, WA = '972504530040';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var TITLE = { he: 'נאור כהן · Prime Nadlan · יועץ נדל״ן בקריות · שדרות משה גושן 12, קריית מוצקין', en: 'Naor Cohen · Prime Nadlan · Real-estate consultant in the Krayot · 12 Moshe Goshen Ave, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור נאור כהן "PRIME-NADLAN" יועץ נדלן בקריות · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Naor Cohen "PRIME-NADLAN", real-estate consultant in the Krayot · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  // where a point of a photo lands inside an object-fit: cover box
  function cover(W, H, iw, ih, px, py) { var s = Math.max(W / iw, H / ih), dw = iw * s, dh = ih * s; return { s: s, ox: (W - dw) * px, oy: (H - dh) * py }; }

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'Prime Nadlan, נאור כהן', 'Prime Nadlan, Naor Cohen');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-what]', 'מה צריך', 'What do you need');
    aria('[data-t-type]', 'איזה נכס', 'What kind of property');
    aria('[data-t-where]', 'איפה', 'Where');
    aria('[data-t-map]', 'מפה סכמטית של הקריות', 'A schematic map of the Krayot');
    aria('[data-t-5]', '5 כוכבים', '5 stars');
    aria('[data-t-wa]', 'וואטסאפ לנאור', 'WhatsApp Naor');
    aria('[data-t-call]', 'התקשרו לנאור, 050-453-0040', 'Call Naor, 050-453-0040');
    var lb = { y: ['ים', 'Yam'], m: ['מוצקין', 'Motzkin'], b: ['ביאליק', 'Bialik'], a: ['אתא', 'Ata'], h: ['חיים', 'Haim'] };
    $$('[data-l]').forEach(function (t) { t.textContent = lb[t.dataset.l][l === 'he' ? 0 : 1]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('pn843-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('pn843-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    clearAll(); layout(); dust.kick(); motes.kick(); write(true);
  }); });
  motionUI();
  function clearAll() {
    [$('[data-cam]'), $('.h-copy'), $('[data-oframe]'), $('[data-track]')].forEach(function (el) { if (el) { el.style.transform = ''; el.style.opacity = ''; } });
    $$('.rv').forEach(function (r) { r.style.transform = ''; });
    drape.set(still() ? oStep : 1);
  }

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [8.5, 21], 1: [8.5, 21], 2: [8.5, 21], 3: [8.5, 21], 4: [8.5, 21], 5: [8.5, 21], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
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
      var val = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // labels that decode out of scrambled letters
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHJKLMNOPRSTUVWXYZ' };
  function decode(el, dur) {
    if (!el) return;
    var txt = el.dataset.txt || (el.dataset.txt = el.textContent), pool = /[֐-׿]/.test(txt) ? GL.he : GL.en;
    if (still()) { el.textContent = txt; return; }
    cancelAnimationFrame(el._raf); var t0 = performance.now(); dur = dur || 900;
    (function st(t) {
      var u = clamp((t - t0) / dur, 0, 1), done = Math.floor(u * txt.length), out = '';
      for (var i = 0; i < txt.length; i++) { var c = txt[i]; out += i < done || /[\s·,.״׳-]/.test(c) ? c : pool[Math.floor(Math.random() * pool.length)]; }
      el.textContent = out; if (u < 1) el._raf = requestAnimationFrame(st);
    })(t0);
  }

  var hero = $('[data-hero]'), nav = $('[data-nav]'), cam = $('[data-cam]'), lit = $('.h-img.lit'), hcopy = $('.h-copy');

  // ---------------------------------------------------------------- hero: the lamps sit on the real lamps; a lens of daylight follows the hand
  var lamps = [[$('.lamp.l1'), 785, 212], [$('.lamp.l2'), 762, 246]];
  function placeLamps() {
    var W = hero.clientWidth, Hh = hero.clientHeight, pos = phone() ? .58 : .5, c = cover(W, Hh, 1600, 900, pos, .4);
    lamps.forEach(function (L) { L[0].style.left = (c.ox + L[1] * c.s) + 'px'; L[0].style.top = (c.oy + L[2] * c.s) + 'px'; L[0].style.width = L[0].style.height = Math.max(70, 150 * c.s * 1.1) + 'px'; L[0].style.margin = (-Math.max(70, 150 * c.s * 1.1) / 2) + 'px 0 0 ' + (-Math.max(70, 150 * c.s * 1.1) / 2) + 'px'; });
  }
  var lens = { x: .5, y: .45, tx: .5, ty: .45, user: 0 };
  hero.addEventListener('pointermove', function (e) { if (e.pointerType === 'touch') return; var r = hero.getBoundingClientRect(); lens.tx = (e.clientX - r.left) / r.width; lens.ty = (e.clientY - r.top) / r.height; lens.user = performance.now(); });
  hero.addEventListener('pointerdown', function (e) { var r = hero.getBoundingClientRect(); lens.tx = (e.clientX - r.left) / r.width; lens.ty = (e.clientY - r.top) / r.height; lens.user = performance.now(); });

  // dust drifting in the light; brighter where the lens is
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = true;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 46 : 90; P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 1.8, vy: -(.08 + Math.random() * .25), ph: Math.random() * 6.28 });
    }
    function frame(t) {
      raf = 0;
      // the lens: the hand leads; with no hand it wanders the room by itself
      if (performance.now() - lens.user > 2600) { var T = t / 1000; lens.tx = .5 + Math.sin(T * .31) * .3; lens.ty = .42 + Math.sin(T * .47 + 1) * .16; }
      lens.x = lerp(lens.x, lens.tx, .07); lens.y = lerp(lens.y, lens.ty, .07);
      lit.style.setProperty('--lx', (lens.x * 100).toFixed(2) + '%'); lit.style.setProperty('--ly', (lens.y * 100).toFixed(2) + '%');
      lit.style.setProperty('--lr', Math.round(Math.max(170, Math.min(w, h) * .34)) + 'px');
      c.clearRect(0, 0, w, h);
      var lx = lens.x * w, ly = lens.y * h, R = Math.max(170, Math.min(w, h) * .34);
      for (var i = 0; i < P.length; i++) {
        var p = P[i]; p.y += p.vy; p.x += Math.sin(t / 1400 + p.ph) * .18;
        if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; }
        var d = Math.hypot(p.x - lx, p.y - ly), a = d < R ? .85 - d / R * .55 : .22;
        c.fillStyle = 'rgba(255,226,170,' + a.toFixed(3) + ')'; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
      }
      if (vis && !still()) raf = requestAnimationFrame(frame);
    }
    function kick() { if (still()) { c.clearRect(0, 0, w || 0, h || 0); lit.style.setProperty('--lr', '2000px'); return; } if (!raf) raf = requestAnimationFrame(frame); }
    watch(hero, function (v) { vis = v; kick(); });
    return { size: function () { size(); kick(); }, kick: kick, vis: function (v) { vis = v; kick(); } };
  })();

  // ---------------------------------------------------------------- the real logo out of its own gold and silver dust
  var motes = (function () {
    var stage = $('.f-stage'), cv = $('[data-motes]'), c = cv.getContext('2d'), img = $('[data-logosrc]');
    var P = [], F = [], w, h, raf = 0, vis = false, ok = false, mx = -999, my = -999, waves = [], t0 = 0, lastWave = 0;
    function sample() {
      try {
        var sc = document.createElement('canvas'), iw = 350, ih = 120; sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 150, 352, 700, 240, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data, pts = [];
        for (var y = 0; y < ih; y += 1) for (var x = 0; x < iw; x += 1) {
          var k = (y * iw + x) * 4, lum = (d[k] + d[k + 1] + d[k + 2]) / 3;
          if (lum > 95) pts.push([x / iw, y / ih, 'rgb(' + d[k] + ',' + d[k + 1] + ',' + d[k + 2] + ')']);
        }
        var want = Math.min(pts.length, phone() ? 2400 : 4600); P = [];
        for (var f = pts.length - 1; f > 0; f--) { var r = Math.floor(Math.random() * (f + 1)), tmp = pts[f]; pts[f] = pts[r]; pts[r] = tmp; }   // a random handful of the logo's own pixels, not every n-th row
        for (var g = 0; g < want; g++) { var q = pts[g]; P.push({ hx: q[0], hy: q[1], col: q[2], sx: Math.random(), sy: Math.random(), x: 0, y: 0, vx: 0, vy: 0, ph: Math.random() * 6.28 }); }
        F = []; for (var i = 0; i < (phone() ? 70 : 140); i++) F.push({ x: Math.random(), y: Math.random(), r: .5 + Math.random() * 1.6, v: .00015 + Math.random() * .0004, ph: Math.random() * 6.28, g: Math.random() < .6 });
        ok = true;
      } catch (e) { ok = false; root.classList.add('no-motes'); }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = stage.clientWidth; h = stage.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(now) {
      raf = 0; if (!ok) return;
      var T = (now - t0) / 1000, r = stage.getBoundingClientRect(), vh = innerHeight;
      var A = smooth((vh - r.top) / (vh * .75));       // scroll brings the dust together, scrolling back scatters it
      var bw = w * .94, bh = bw * 120 / 350, ox = (w - bw) / 2, oy = (h - bh) / 2;
      if (now - lastWave > (fine.matches ? 5200 : 3200) && A > .95) { lastWave = now; waves.push({ t: now, x: rtl() ? w : 0 }); }
      waves = waves.filter(function (q) { return now - q.t < 2200; });
      c.clearRect(0, 0, w, h);
      // free motes drifting like dust in the office light
      for (var j = 0; j < F.length; j++) {
        var m = F[j]; m.y -= m.v; if (m.y < -.02) m.y = 1.02;
        var tw = .35 + .35 * Math.sin(T * 1.6 + m.ph);
        c.fillStyle = m.g ? 'rgba(243,217,152,' + tw.toFixed(3) + ')' : 'rgba(211,214,219,' + (tw * .7).toFixed(3) + ')';
        c.fillRect(m.x * w + Math.sin(T * .5 + m.ph) * 6, m.y * h, m.r, m.r);
      }
      var sz = phone() ? 1.6 : 1.9;
      for (var i = 0; i < P.length; i++) {
        var p = P[i], tx = ox + p.hx * bw, ty = oy + p.hy * bh;
        var hx = lerp(p.sx * w, tx, A), hy = lerp(p.sy * h, ty, A);
        // a slow breeze runs through the letters
        for (var k = 0; k < waves.length; k++) { var q = waves[k], front = (now - q.t) / 2200 * (w + 200) - 100, fx = rtl() ? w - front : front, dd = Math.abs(tx - fx); if (dd < 60) hy -= (1 - dd / 60) * 7 * Math.sin((now - q.t) / 120 + p.ph); }
        if (p.x === 0 && p.y === 0) { p.x = hx; p.y = hy; }
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 6400) { var f = (6400 - d2) / 6400 * 3, dist = Math.sqrt(d2) || 1; p.vx += dx / dist * f; p.vy += dy / dist * f; }
        p.vx += (hx - p.x) * .08; p.vy += (hy - p.y) * .08; p.vx *= .8; p.vy *= .8; p.x += p.vx; p.y += p.vy;
        c.globalAlpha = .55 + .45 * A; c.fillStyle = p.col; c.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
      }
      c.globalAlpha = 1;
      if (vis && !still()) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf && !still()) raf = requestAnimationFrame(frame); }
    function start() { size(); sample(); t0 = performance.now(); kick(); }
    cv.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    cv.addEventListener('pointerleave', function () { mx = my = -999; });
    cv.addEventListener('pointerdown', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; setTimeout(function () { mx = my = -999; }, 380); });
    watch(stage, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // ---------------------------------------------------------------- fields: the pin travels to the field you point at; cycles by itself until you choose
  var flist = $('[data-flist]'), fis = $$('.fi', flist), fpin = $('[data-fpin]'), fcur = 0, fchose = false, fvis = false;
  function fset(i, quiet) {
    fcur = i; fis.forEach(function (f, k) { f.classList.toggle('on', k === i); });
    var f = fis[i]; fpin.style.transform = 'translateY(' + (f.offsetTop + 22) + 'px)';
    if (!quiet) decode($('.ft > span[lang="' + root.lang + '"]', f), 700);
  }
  fis.forEach(function (f, i) {
    var go = function () { fchose = true; if (fcur !== i) fset(i); };
    f.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') go(); });
    f.addEventListener('click', go); f.addEventListener('focus', go);
  });
  watch(flist, function (v) { fvis = v; });
  setInterval(function () { if (fvis && !fchose && !still()) fset((fcur + 1) % fis.length); }, 3200);

  // ---------------------------------------------------------------- office: the curtains of his meeting room, cut from his own photo, draw apart pleat by pleat
  var office = $('[data-office]'), oframe = $('[data-oframe]'), vpins = $$('.vpin', office), oStep = 1;
  var drape = (function () {
    var box = $('[data-drape]'), N = 14, strips = [], cur = 1;
    // window in view.jpg (1600x900) and the curtain in curtains.jpg (1600x900), in photo pixels
    var WIN = [448, 66, 1075, 652], CUR = [404, 94, 1084, 488];
    for (var i = 0; i < N; i++) { var s = document.createElement('i'); box.appendChild(s); strips.push(s); }
    function place() {
      var W = oframe.clientWidth, Hh = oframe.clientHeight, cv = cover(W, Hh, 1600, 900, .5, .5);
      var x0 = cv.ox + WIN[0] * cv.s, y0 = cv.oy + WIN[1] * cv.s, bw = (WIN[2] - WIN[0]) * cv.s, bh = (WIN[3] - WIN[1]) * cv.s;
      box.style.cssText = 'left:' + x0 + 'px;top:' + y0 + 'px;width:' + bw + 'px;height:' + bh + 'px';
      var sw = bw / N, gx = bw / (CUR[2] - CUR[0]), gy = bh / (CUR[3] - CUR[1]);
      strips.forEach(function (s, i) {
        s.style.left = (i * sw) + 'px'; s.style.width = (sw + 1) + 'px';
        s.style.backgroundSize = (1600 * gx) + 'px ' + (900 * gy) + 'px';
        s.style.backgroundPosition = (-(CUR[0] * gx) - i * sw) + 'px ' + (-(CUR[1] * gy)) + 'px';
        s.style.transformOrigin = i < N / 2 ? '0 0' : '100% 0';
      });
      set(cur);
      vpins.forEach(function (p) { var x = cv.ox + 1600 * +p.dataset.x * cv.s; p.style.left = x + 'px'; p.style.top = (cv.oy + 900 * +p.dataset.y * cv.s) + 'px'; p.classList.toggle('flip', x > W - 220); });
    }
    // open = p: every pleat narrows toward its own side and the pleats stay touching, so nothing behind ever shows through a gap
    function set(p) {
      cur = p; var bw = box.clientWidth, sw = bw / N, k = lerp(1, .17, p);
      strips.forEach(function (s, i) {
        var left = i < N / 2, j = left ? i : N - 1 - i, shift = j * sw * (1 - k) * (left ? -1 : 1);
        s.style.transform = 'translateX(' + shift.toFixed(2) + 'px) scaleX(' + k.toFixed(4) + ')';
        s.style.setProperty('--fold', p.toFixed(3));
      });
    }
    return { place: place, set: set };
  })();
  $$('[data-ostep]').forEach(function (b) { b.addEventListener('click', function () {
    oStep = +b.dataset.ostep; $$('[data-ostep]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    drape.set(oStep); vpins.forEach(function (p) { p.classList.toggle('on', oStep === 1); });
  }); });

  // ---------------------------------------------------------------- write: the live thing
  var groups = {}; $$('[data-group]').forEach(function (g) { groups[g.dataset.group] = $$('button', g); });
  var steps = $$('[data-step]'), msgEl = $('[data-msg]'), sendEl = $('[data-send]'), kpin = $('[data-kpin]'), shown = '', typing = 0, chatSeen = false;
  var PT = { y: [110, 40], m: [120, 96], b: [172, 90], a: [252, 80], h: [126, 150] };
  function pick(g) { return groups[g].filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0]; }
  Object.keys(groups).forEach(function (g, gi) {
    groups[g].forEach(function (b) { b.addEventListener('click', function () {
      groups[g].forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); });
      steps[gi].classList.add('on'); write(); pinMap();
    }); });
  });
  function pinMap() {
    var k = pick('where').dataset.pt, p = PT[k];
    kpin.style.transform = 'translate(' + p[0] + 'px,' + p[1] + 'px)';
    $$('[data-d]').forEach(function (d) { d.classList.toggle('on', d.dataset.d === k); });
    $$('[data-l]').forEach(function (t) { t.classList.toggle('on', t.dataset.l === k); });
  }
  function compose() {
    var l = he(), w = pick('what').dataset.en, ty = pick('type'), wh = pick('where');
    if (l) {
      var T = ty.dataset.he, P = 'ב' + wh.dataset.he;
      return 'שלום נאור, ' + ({ sell: 'אני רוצה למכור ' + T + ' ' + P, buy: 'אני רוצה לקנות ' + T + ' ' + P, dev: 'רציתי לדבר איתך על יזמות נדל״ן ' + P + ' (' + T + ')', mkt: 'רציתי לדבר איתך על שיווק ' + T + ' ' + P })[w] + '. אשמח שנדבר.';
    }
    var e = ty.dataset.en, a = (/^[aeiou]/i.test(e) ? 'an ' : 'a ') + e, E = 'in ' + wh.dataset.en;
    return 'Hi Naor, ' + ({ sell: 'I’d like to sell ' + a + ' ' + E, buy: 'I’d like to buy ' + a + ' ' + E, dev: 'I’d like to talk about real-estate development ' + E + ' (' + e + ')', mkt: 'I’d like to talk about marketing ' + a + ' ' + E })[w] + '. Could we talk?';
  }
  function write(instant) {
    var target = compose();
    sendEl.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep; msgEl.classList.add('typing');
    (function st(t) {
      var n = Math.floor((t - t0) / 14);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st); else msgEl.classList.remove('typing');
    })(t0);
  }
  watch($('[data-card]'), function (v) { if (v && !chatSeen) { chatSeen = true; steps[0].classList.add('on'); if (!still()) { shown = ''; msgEl.textContent = ''; } write(); } }, { threshold: .35 });

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 6) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { setTimeout(function () { roll(o, true); }, o.closest('.hero') ? 1100 : 100); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- tilt, spotlight
  var tiltEl = $('[data-tilt]');
  tiltEl.addEventListener('pointermove', function (e) { if (still() || e.pointerType === 'touch') return; var r = tiltEl.getBoundingClientRect(); tiltEl.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 8).toFixed(2) + 'deg'); tiltEl.style.setProperty('--rx', ((.5 - (e.clientY - r.top) / r.height) * 6).toFixed(2) + 'deg'); });
  tiltEl.addEventListener('pointerleave', function () { tiltEl.style.setProperty('--rx', '0deg'); tiltEl.style.setProperty('--ry', '0deg'); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- one scroll loop
  var fields = $('[data-fields]'), revs = $('[data-reviews]'), track = $('[data-track]'), rvs = $$('.rv'), contact = $('[data-contact]'), dock = $('[data-dock]'), fh = $('.ft-horizon');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // hero: walk down the table while the next card rides over
    var fr = fields.getBoundingClientRect(), hp = clamp(1 - fr.top / vh, 0, 1);
    dust.vis(fr.top > 0); hero.style.visibility = fr.top < -40 ? 'hidden' : '';
    if (!calm) {
      cam.style.transform = 'scale(' + (1 + hp * .22).toFixed(4) + ') translateY(' + (hp * -2).toFixed(2) + '%)';
      hcopy.style.transform = 'translateY(' + (hp * -70).toFixed(1) + 'px)'; hcopy.style.opacity = (1 - hp * 1.3).toFixed(3);
    }
    // office: the curtains part, the view settles, pins land
    var op = prog(office), dp = calm ? oStep : smooth((op - .1) / .5);
    if (!calm) { drape.set(dp); oframe.style.transform = 'scale(' + lerp(1.1, 1, dp).toFixed(4) + ')'; vpins.forEach(function (p) { p.classList.toggle('on', op > .66); }); }
    // reviews: the rail is passed across the table
    if (!calm) {
      var rp = prog(revs), over = Math.max(0, track.scrollWidth - innerWidth), x = (rtl() ? 1 : -1) * over * smooth(rp * 1.08 - .04);
      track.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
      var mid = innerWidth / 2;
      rvs.forEach(function (rv) { var r = rv.getBoundingClientRect(), d = clamp((r.left + r.width / 2 - mid) / innerWidth, -1, 1); rv.style.transform = 'translateY(' + (Math.abs(d) * 26).toFixed(1) + 'px) rotate(' + (d * 5).toFixed(2) + 'deg)'; });
    }
    // phones: the pins step aside while the hero's own buttons or the contact tiles are in view
    var cr = contact.getBoundingClientRect();
    dock.classList.toggle('away', fr.top > vh * .35 || (cr.top < vh * .7 && cr.bottom > vh * .2));
    // the footer horizon rises as you arrive
    var hr = fh.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - hr.top) / hr.height);
    fh.style.setProperty('--rise', ((1 - fp) * 80).toFixed(1) + 'px');
  }

  function layout() { placeLamps(); dust.size(); motes.size(); drape.place(); fset(fcur, true); pinMap(); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (innerWidth !== lw || !phone()) { lw = innerWidth; layout(); } else tick(); }, 140); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout(); clearAll();

  // ---------------------------------------------------------------- opening: the hole in the pin-shaped P opens onto the office (once per visit)
  var opening = $('[data-opening]'), started = false;
  function ready() { if (started) return; started = true; requestAnimationFrame(function () { hero.classList.add('ready'); setTimeout(function () { $$('.hero [data-decode]').forEach(function (d) { if (d.offsetParent) decode(d, 1100); }); }, 650); }); }
  var seen = false; try { seen = sessionStorage.getItem('pn843-open') === '1'; } catch (e) {}
  if (still() || seen || !opening) { if (opening) opening.classList.add('gone'); (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(ready); setTimeout(ready, 1200); }
  else {
    try { sessionStorage.setItem('pn843-open', '1'); } catch (e) {}
    var oimg = $('img', opening), t0 = 0, done = false;
    var finish = function () { if (done) return; done = true; opening.classList.add('gone'); ready(); };
    opening.addEventListener('click', finish);
    requestAnimationFrame(function () { opening.classList.add('show'); });
    setTimeout(function () {
      var r = oimg.getBoundingClientRect(), hx = r.left + r.width * .225, hy = r.top + r.height * .42, R = Math.hypot(Math.max(hx, innerWidth - hx), Math.max(hy, innerHeight - hy));
      opening.style.setProperty('--hx', hx + 'px'); opening.style.setProperty('--hy', hy + 'px');
      setTimeout(ready, 260);
      (function st(t) { if (!t0) t0 = t; var u = clamp((t - t0) / 950, 0, 1), e = u * u * u; opening.style.setProperty('--r', (e * R).toFixed(1) + 'px'); if (u < 1 && !done) requestAnimationFrame(st); else finish(); })(performance.now());
    }, 750);
    setTimeout(finish, 2600);
  }
  addEventListener('load', function () { layout(); });
})();
