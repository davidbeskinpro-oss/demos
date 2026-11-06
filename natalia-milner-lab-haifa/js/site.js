(function () {
  var root = document.documentElement, WA = '972543500500';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'נטליה מילנר · Milner L·A·B · טיפולי פנים והסרת שיער בלייזר · שדרות מוריה 123, חיפה', en: 'Natalia Milner · Milner L·A·B · Facials and laser hair removal · 123 Moriah Blvd, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור נטליה מילנר · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Natalia Milner · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-call]', 'התקשרו לנטליה, 054-350-0500', 'Call Natalia, 054-350-0500');
    aria('[data-day]', 'יום', 'Day');
    $$('[data-decode]').forEach(function (s) { s.textContent = s.dataset[l]; });
    var m = $('.t-map iframe'); if (m) m.title = l === 'he' ? 'מפה: שדרות מוריה 123, חיפה' : 'Map: 123 Moriah Blvd, Haifa';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('nm244-lang', l); } catch (e) {}
    texts(l); hours(); care.set(care.k, true); composer.write(true); stem.build(); scroll();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch (saved; default off for weak devices, set in <head>)
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('nm244-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    odos(); decodeAll(); stem.build(); scroll(); kickAll();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8, 18], 1: [8, 18], 2: [8, 18], 3: [8, 18], 4: [8, 18], 5: [8, 13], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    var all = [0, 1, 2, 3, 4, 5, 6].every(function (d) { return H[d] && H[d][0] === 0 && H[d][1] === 24; });
    if (all) { open = true; txt = l ? 'פתוח 24/7' : 'Open 24/7'; }
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

  // ---------------------------------------------------------------- entrances, staggered inside each section
  $$('section').forEach(function (s) { $$('[data-reveal],[data-tile]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline letter by letter, out of a blur
  function split() {
    $$('[data-split] .ln > span[lang]').forEach(function (sp) {
      var i = 0;
      sp.innerHTML = sp.textContent.split(' ').map(function (w) {
        return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  }

  // ---------------------------------------------------------------- opening: her photos dealt like cards, the last becomes the hero
  var deal = $('[data-deal]'), seen = false;
  try { seen = sessionStorage.getItem('nm244-deal') === '1'; } catch (e) {}
  if (!still() && !seen && deal) {
    deal.classList.add('run'); $('.h-title').style.visibility = 'hidden';
    var end = function () { deal.classList.remove('run'); deal.style.display = 'none'; $('.h-title').style.visibility = ''; split(); };
    var tm = setTimeout(end, 1500);
    deal.addEventListener('click', function () { clearTimeout(tm); end(); });
    try { sessionStorage.setItem('nm244-deal', '1'); } catch (e) {}
  } else split();

  // ---------------------------------------------------------------- nav gathers into a pill; phone sprig appears after the hero
  var nav = $('[data-nav]'), hero = $('[data-hero]'), sprig = $('[data-sprig]');

  // ---------------------------------------------------------------- magnifier lamp: a lit ring over her real photo; follows the hand, drifts by itself
  var lamp = (function () {
    var el = $('[data-lamp]'), raf = 0, vis = true, tx = .55, ty = .4, x = .55, y = .4, user = 0, t0 = performance.now();
    function size() { el.style.setProperty('--rw', Math.round(el.clientWidth * .44) + 'px'); }
    function put() { el.style.setProperty('--x', (x * 100).toFixed(2) + '%'); el.style.setProperty('--y', (y * 100).toFixed(2) + '%'); }
    function frame(t) {
      raf = 0; if (!vis || still()) return;
      if (t - user > 2600) { var s = (t - t0) / 1000; tx = .5 + .26 * Math.sin(s * .55); ty = .42 + .2 * Math.sin(s * .9 + 1); }
      x += (tx - x) * .08; y += (ty - y) * .08; put();
      raf = requestAnimationFrame(frame);
    }
    function point(e) { var r = el.getBoundingClientRect(); tx = clamp((e.clientX - r.left) / r.width, .08, .92); ty = clamp((e.clientY - r.top) / r.height, .08, .92); user = performance.now(); kick(); }
    el.addEventListener('pointermove', point);
    el.addEventListener('pointerdown', point);
    watch(el, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- motes: the sprig of the real logo, re-made of drifting light
  function motes(cv, host, opt) {
    var c = cv.getContext('2d'), img = new Image(), pts = [], w, h, raf = 0, vis = true, px = -9999, py = -9999, ready = false;
    img.src = 'img/logo.png';
    function sample() {
      var o = document.createElement('canvas'), W = img.naturalWidth, Hh = img.naturalHeight; o.width = W; o.height = Hh;
      var g = o.getContext('2d'); g.drawImage(img, 0, 0); var d = g.getImageData(0, 0, W, Hh).data, raw = [];
      var x0 = Math.round(W * .44), x1 = Math.round(W * .63);
      for (var yy = 0; yy < Hh; yy += 2) for (var xx = x0; xx < x1; xx += 2) { var k = (yy * W + xx) * 4; if (d[k] < 150) raw.push([(xx - x0) / (x1 - x0), yy / Hh]); }
      return raw;
    }
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = host.clientWidth; h = host.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!ready) return;
      var raw = sample(), sh = h * opt.scale, sw = sh * .42, cx = opt.cx(w), cy = h * opt.cy, step = Math.max(1, Math.floor(raw.length / opt.n));
      var old = pts; pts = [];
      for (var i = 0; i < raw.length; i += step) {
        var p = old[pts.length] || { x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, r: .8 + Math.random() * 1.6, c: Math.random() < .35 ? 'rgba(216,181,123,' : 'rgba(236,211,206,', a: .35 + Math.random() * .55, ph: Math.random() * 6.3 };
        p.hx = cx - sw / 2 + raw[i][0] * sw; p.hy = cy - sh / 2 + raw[i][1] * sh; pts.push(p);
      }
      for (var f = 0; f < opt.free; f++) pts.push({ x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, r: .6 + Math.random() * 1.4, c: 'rgba(236,211,206,', a: .2 + Math.random() * .4, ph: Math.random() * 6.3, free: true });
      if (still()) pts.forEach(function (p) { if (!p.free) { p.x = p.hx; p.y = p.hy; } });
      draw(0);
    }
    function draw(t) {
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < pts.length; i++) { var p = pts[i]; c.fillStyle = p.c + (p.a * (.75 + .25 * Math.sin(t / 900 + p.ph))).toFixed(3) + ')'; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill(); }
    }
    function frame(t) {
      raf = 0; if (!vis || still()) return;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (p.free) { p.y -= .25 + p.r * .1; p.x += Math.sin(t / 1400 + p.ph) * .3; if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; } }
        else { var ox = Math.sin(t / 1600 + p.ph) * 3, oy = Math.cos(t / 1900 + p.ph) * 3; p.vx += (p.hx + ox - p.x) * .012; p.vy += (p.hy + oy - p.y) * .012; }
        var dx = p.x - px, dy = p.y - py, dd = dx * dx + dy * dy;
        if (dd < 9000) { var f = (9000 - dd) / 9000 * 1.6; p.vx += dx / Math.sqrt(dd + 1) * f; p.vy += dy / Math.sqrt(dd + 1) * f; }
        p.vx *= .88; p.vy *= .88; p.x += p.vx; p.y += p.vy;
      }
      draw(t); raf = requestAnimationFrame(frame);
    }
    function point(e) { var r = cv.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; }
    host.addEventListener('pointermove', point); host.addEventListener('pointerdown', point);
    host.addEventListener('pointerleave', function () { px = py = -9999; });
    img.onload = function () { ready = true; size(); kick(); };
    watch(host, function (v) { vis = v; kick(); });
    function kick() { if (!raf && ready) raf = requestAnimationFrame(frame); if (still() && ready) { pts.forEach(function (p) { if (!p.free) { p.x = p.hx; p.y = p.hy; } }); draw(0); } }
    return { size: size, kick: kick };
  }
  var phoneW = function () { return innerWidth < 821; };
  var heroMotes = motes($('[data-motes]'), hero, { n: 700, free: 40, scale: 1.08, cy: .5, cx: function (w) { var r = $('[data-lamp]').getBoundingClientRect(), hr = hero.getBoundingClientRect(); return phoneW() ? w * (rtl() ? .18 : .82) : (rtl() ? r.right - hr.left + 30 : r.left - hr.left - 30); } });
  var footMotes = motes($('[data-fmotes]'), $('.foot'), { n: 500, free: 30, scale: 1.3, cy: .5, cx: function (w) { return w * (rtl() ? .14 : .86); } });

  // ---------------------------------------------------------------- odometers and decoding labels (real numbers only)
  function odos() {
    $$('[data-odo]').forEach(function (o) {
      if (!o.dataset.built) {
        o.dataset.built = 1;
        o.innerHTML = o.dataset.odo.split('').map(function (ch, i) {
          if (!/\d/.test(ch)) return '<span data-n="' + ch + '"></span>';
          var col = ''; for (var d = 0; d <= 9; d++) col += '<span data-n="' + d + '"></span>';
          return '<span class="col"><span style="--d:' + i * 120 + 'ms" data-to="' + ch + '">' + col + '</span></span>';
        }).join('');
        o.setAttribute('aria-label', o.dataset.odo); o.setAttribute('role', 'img');
      }
      if (still() || o.dataset.go) $$('[data-to]', o).forEach(function (s) { s.style.transform = 'translateY(-' + s.dataset.to + 'em)'; });
    });
  }
  odos();
  $$('[data-odo]').forEach(function (o) { watch(o, function (v) { if (v && !o.dataset.go) { o.dataset.go = 1; requestAnimationFrame(function () { odos(); }); } }); });
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' };
  function decode(s) {
    var to = s.dataset[root.lang], set = GL[root.lang], t0 = performance.now();
    if (still()) { s.textContent = to; return; }
    (function f(t) {
      var k = (t - t0) / 700, out = '';
      for (var i = 0; i < to.length; i++) out += i < k * to.length ? to[i] : set[Math.floor(Math.random() * set.length)];
      s.textContent = out; if (k < 1) requestAnimationFrame(f); else s.textContent = to;
    })(t0);
  }
  function decodeAll() { $$('[data-decode]').forEach(function (s) { s.textContent = s.dataset[root.lang]; }); }
  watch($('.lab'), function (v) { if (v) $$('[data-decode]').forEach(function (s, i) { setTimeout(function () { decode(s); }, i * 160); }); }, { threshold: .6 });

  // ---------------------------------------------------------------- treatments: a name swaps the photo and the leaf colour
  var care = (function () {
    var btns = $$('[data-ci]'), pics = $$('.c-pic img'), leaf = $('[data-cleaf]'), fact = $('[data-cfact]');
    var COL = ['#e6bcbb', '#d8b57b', '#c99aa3'];
    var F = {
      he: ['מסכות, עיסוי פנים ותכשירים מקצועיים, על מיטת הטיפול בקליניקה.', 'מכשיר לייזר בקליניקה, עם משקפי מגן בזמן הטיפול.', 'סרומים וקצפים מהמדף, לשגרת הטיפוח בבית.'],
      en: ['Masks, facial massage and professional products, on the clinic’s treatment bed.', 'A laser device in the clinic, with protective glasses during the session.', 'Serums and foams from the shelf, for your skincare routine at home.']
    };
    var o = { k: 0, set: function (k, quiet) {
      o.k = k;
      btns.forEach(function (b, i) { b.classList.toggle('on', i === k); b.setAttribute('aria-pressed', i === k ? 'true' : 'false'); });
      pics.forEach(function (p, i) { p.classList.toggle('on', i === k); });
      leaf.style.backgroundColor = COL[k]; leaf.style.transform = quiet ? '' : 'rotate(' + (k * 7 - 7) + 'deg)';
      fact.textContent = F[root.lang][k];
    } };
    btns.forEach(function (b, i) { b.addEventListener('click', function () { o.set(i); }); });
    return o;
  })();

  // ---------------------------------------------------------------- ring of her photos: ambient turn + scroll + drag
  var ring = (function () {
    var st = $('[data-rstage]'), wh = $('[data-wheel]'), figs = $$('figure', wh), n = figs.length, drag = 0, base = 0, raf = 0, vis = false, last = 0, sp = 0, dn = null;
    function place() {
      if (still()) { figs.forEach(function (f) { f.style.transform = ''; f.style.opacity = ''; f.style.filter = ''; }); return; }
      var cw = figs[0].offsetWidth, STEP = 28, R = cw * 2.6, rot = base + sp * 160 + drag;
      wh.style.transform = 'translateZ(' + (-R) + 'px) rotateX(-5deg)';
      figs.forEach(function (f, i) {
        var a = ((i * STEP + rot) % (n * STEP) + n * STEP * 1.5) % (n * STEP) - n * STEP / 2, c = Math.cos(a * Math.PI / 180);
        f.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + R.toFixed(0) + 'px)';
        f.style.opacity = Math.abs(a) > 84 ? 0 : (.2 + .8 * Math.pow(Math.max(0, c), 2)).toFixed(3); f.style.zIndex = Math.round(c * 100);
        f.style.filter = 'brightness(' + (.55 + .45 * Math.max(0, c)).toFixed(3) + ')';
      });
    }
    function frame(t) { raf = 0; if (!vis || still()) return; if (!dn) base += Math.min(50, t - (last || t)) * .006; last = t; place(); raf = requestAnimationFrame(frame); }
    st.addEventListener('pointerdown', function (e) { if (still()) return; dn = { x: e.clientX, d: drag }; });
    addEventListener('pointermove', function (e) { if (dn) { drag = dn.d + (e.clientX - dn.x) * .3; place(); } });
    addEventListener('pointerup', function () { dn = null; });
    addEventListener('pointercancel', function () { dn = null; });
    watch(st, function (v) { vis = v; last = 0; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); place(); }
    return { kick: kick, scroll: function (p) { sp = p; if (!raf) place(); } };
  })();

  // ---------------------------------------------------------------- the stem: one gold line grows down the middle of the page, leaves open at each chapter
  var stem = (function () {
    var run = $('[data-stemrun]'), svg = $('[data-stem]'), path = $('[data-stem-path]'), leaves = [], len = 1, NS = 'http://www.w3.org/2000/svg';
    function build() {
      var h = run.offsetHeight, w = svg.clientWidth || 40, mid = w / 2, d = 'M' + mid + ' 0';
      for (var y = 40; y <= h; y += 40) d += ' L' + (mid + Math.sin(y / 180) * w * .32).toFixed(1) + ' ' + y;
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h); path.setAttribute('d', d);
      len = path.getTotalLength(); path.style.strokeDasharray = len;
      leaves.forEach(function (l) { l.remove(); }); leaves = [];
      $$('section', run).forEach(function (s, i) {
        var y = s.offsetTop + 40, x = mid + Math.sin(y / 180) * w * .32;
        var l = document.createElementNS(NS, 'path'); l.setAttribute('class', 'lf');
        var side = i % 2 ? -1 : 1;
        l.setAttribute('d', 'M' + x.toFixed(1) + ' ' + y + ' c' + (8 * side) + ' -18 ' + (22 * side) + ' -22 ' + (26 * side) + ' -20 c' + (-2 * side) + ' 14 ' + (-12 * side) + ' 22 ' + (-26 * side) + ' 20z');
        l.dataset.y = y; svg.appendChild(l); leaves.push(l);
      });
      upd();
    }
    function upd() {
      var r = run.getBoundingClientRect(), reach = clamp(innerHeight * .7 - r.top, 0, r.height);
      if (still()) reach = r.height;
      path.style.strokeDashoffset = (len * (1 - reach / r.height)).toFixed(1);
      leaves.forEach(function (l) { l.classList.toggle('on', +l.dataset.y < reach); });
    }
    return { build: build, upd: upd };
  })();

  // ---------------------------------------------------------------- scroll-linked scenes (all reversible)
  var words = $('[data-words]'), aw = $('[data-awning]'), drift = $('[data-drift]'), vshot = $('[data-vshot]'), vimg = $('img', vshot), ringEl = $('[data-ring]');
  var prog = function (el, a, b) { var r = el.getBoundingClientRect(); return clamp((innerHeight * a - r.top) / (r.height + innerHeight * b), 0, 1); };
  function scroll() {
    var y = scrollY;
    nav.classList.toggle('gather', y > 40);
    sprig.classList.toggle('show', y > hero.offsetHeight * .6);
    stem.upd();
    ring.scroll(prog(ringEl, 1, 1));
    if (still()) { aw.style.setProperty('--aw', 1); drift.style.removeProperty('--dx'); vshot.style.clipPath = ''; vimg.style.setProperty('--vs', 1); return; }
    // awning unrolls as the reviews arrive
    var ra = words.getBoundingClientRect(); aw.style.setProperty('--aw', clamp((innerHeight - ra.top) / (innerHeight * .6), .12, 1).toFixed(3));
    // quotes drift sideways with the scroll
    var over = Math.max(0, drift.scrollWidth - innerWidth + 32), p = prog(words, 1, 1);
    drift.style.setProperty('--dx', ((rtl() ? 1 : -1) * over * p).toFixed(1) + 'px');
    // storefront: full width, shrinks into a leaf frame
    var rv = vshot.getBoundingClientRect(), k = clamp((innerHeight * .85 - rv.top) / (innerHeight * .8), 0, 1), e = k * k * (3 - 2 * k);
    var big = (e * 22).toFixed(1), small = (e * 4).toFixed(1), rad = rtl() ? small + '% ' + big + '% ' + small + '% ' + big + '%' : big + '% ' + small + '% ' + big + '% ' + small + '%';
    vshot.style.clipPath = 'inset(' + (e * 3).toFixed(2) + '% ' + (e * 5).toFixed(2) + '% round ' + rad + ')';
    vimg.style.setProperty('--vs', (1.12 - e * .12).toFixed(3));
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; scroll(); }); } }, { passive: true });

  // ---------------------------------------------------------------- composer: choices write the message to Natalia
  var composer = (function () {
    var form = $('[data-composer]'), msg = $('[data-msg]'), send = $('[data-send]'), day = $('[data-day]'), out = $('[data-dayout]'), names = $('[data-daynames]'), pm = $('[data-pm]'), typing = 0;
    var T = { he: ['טיפול פנים', 'הסרת שיער בלייזר'], en: ['a facial', 'laser hair removal'] };
    var P = { he: ['בבוקר', 'בצהריים', 'אחר הצהריים'], en: ['morning', 'at midday', 'afternoon'] };
    var DS = { he: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'] };
    function val(n) { var c = $('input[name="' + n + '"]:checked', form); return c ? +c.value : 0; }
    function text() {
      var l = root.lang, t = val('t'), d = +day.value, p = val('p'), D = (l === 'he' ? dayHe : dayEn)[d];
      if (l === 'he') return t < 2 ? 'היי נטליה, אשמח לתאם ' + T.he[t] + ' ביום ' + D + ' ' + P.he[p] + '. מתי מתאים לך?' : 'היי נטליה, אשמח להתייעץ איזה טיפול מתאים לי. אפשר להגיע ביום ' + D + ' ' + P.he[p] + '?';
      return t < 2 ? 'Hi Natalia, I’d like to book ' + T.en[t] + ' on ' + D + ' ' + P.en[p] + '. When suits you?' : 'Hi Natalia, I’d like some advice on which treatment suits me. Could I come on ' + D + ' ' + P.en[p] + '?';
    }
    function write(quiet) {
      var fri = +day.value === 5, pin = $('input', pm);
      pm.classList.toggle('off', fri); pin.disabled = fri; if (fri && pin.checked) $('input[name="p"][value="1"]', form).checked = true;
      names.innerHTML = DS[root.lang].map(function (s) { return '<span>' + s + '</span>'; }).join('');
      out.textContent = (root.lang === 'he' ? 'יום ' : '') + (root.lang === 'he' ? dayHe : dayEn)[+day.value];
      var s = text(); send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(s);
      cancelAnimationFrame(typing);
      if (quiet || still()) { msg.textContent = s; return; }
      var t0 = performance.now();
      (function f(t) { var k = clamp((t - t0) / 650, 0, 1); msg.textContent = s.slice(0, Math.ceil(s.length * k)); if (k < 1) typing = requestAnimationFrame(f); })(t0);
    }
    form.addEventListener('input', function (e) { $$('[data-step]').forEach(function (f) { f.classList.toggle('act', f.contains(e.target)); }); write(); });
    return { write: write };
  })();

  // ---------------------------------------------------------------- bento spotlight + gentle tilt on the clinic photo (desktop)
  var spot = $('[data-spot]');
  if (fine) spot.addEventListener('pointermove', function (e) { $$('.tile', spot).forEach(function (t) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', e.clientX - r.left + 'px'); t.style.setProperty('--my', e.clientY - r.top + 'px'); }); });
  var tilt = $('[data-tilt]');
  if (fine) { tilt.addEventListener('pointermove', function (e) { if (still()) return; var r = tilt.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; tilt.style.transform = 'perspective(900px) rotateY(' + (x * 8).toFixed(2) + 'deg) rotateX(' + (-y * 8).toFixed(2) + 'deg)'; }); tilt.addEventListener('pointerleave', function () { tilt.style.transform = ''; }); }

  function kickAll() { lamp.kick(); heroMotes.kick(); footMotes.kick(); ring.kick(); }
  function layout() { lamp.size(); heroMotes.size(); footMotes.size(); stem.build(); scroll(); ring.kick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 150); });
  addEventListener('load', function () { stem.build(); scroll(); });

  texts(root.lang); hours(); care.set(0, true); composer.write(true); layout(); kickAll();
  if (still()) { $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); }); }
  window.__nm = { ready: true };
})();
