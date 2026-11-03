(function () {
  var root = document.documentElement, WA = '972539739849';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 860; };
  var TITLE = { he: 'טניה גור · קוסמטיקאית · ורדיה 12, חיפה', en: 'Tanya Gur · Cosmetician · 12 Vardia St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור טניה גור · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Tanya Gur · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'טניה גור', 'Tanya Gur');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-visit]', 'יצירת קשר', 'Contact');
    aria('[data-t-treat]', 'טיפול', 'Treatment');
    aria('[data-t-day]', 'יום', 'Day');
    aria('[data-t-when]', 'שעה', 'Time');
    aria('[data-t-call]', 'התקשרו לטניה, 053-973-9849', 'Call Tanya, 053-973-9849');
    aria('[data-t-wa]', 'וואטסאפ לטניה', 'WhatsApp Tanya');
    $$('.tag').forEach(function (t) { t.textContent = t.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('tg-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('tg-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    layout(); leaves.kick(); crown.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 21], 1: [9, 21], 2: [9, 21], 3: [9, 21], 4: [9, 21], 5: [8, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], shortEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: shortEn.indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
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
    $$('[data-week] div').forEach(function (c, i) { c.classList.toggle('today', i === n.d); });
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
    $('[data-week]').innerHTML = [0, 1, 2, 3, 4, 5, 6].map(function (d) {
      var t = H[d]; return '<div class="' + (t ? '' : 'off') + '"><b>' + (l ? shortHe : shortEn)[d] + '</b><span dir="ltr">' + (t ? hhmm(t[0]) + '<br>' + hhmm(t[1]) : (l ? 'סגור' : 'Closed')) + '</span></div>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- the leaves of her logo: coral, peach and outlined, as in the logo
  function leafPath(c, L, W) { c.beginPath(); c.moveTo(-L, 0); c.quadraticCurveTo(0, -W, L, 0); c.quadraticCurveTo(0, W, -L, 0); c.closePath(); }
  function drawLeaf(c, p) {
    c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.scale(1, p.flip);
    leafPath(c, p.s, p.s * .5);
    if (p.k === 2) { c.lineWidth = 1.6; c.strokeStyle = p.ink; c.stroke(); c.beginPath(); c.moveTo(-p.s * .7, 0); c.lineTo(p.s * .7, 0); c.stroke(); }
    else { c.fillStyle = p.k ? '#f1c6b3' : '#d9707a'; c.fill(); c.lineWidth = 1.4; c.strokeStyle = p.ink; c.stroke(); }
    c.restore();
  }
  function makeLeaf(w, h, ink) {
    return { x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, r: Math.random() * 6.28, vr: 0, s: 13 + Math.random() * 20, k: Math.floor(Math.random() * 3), ph: Math.random() * 6.28, fall: .18 + Math.random() * .3, flip: Math.random() < .5 ? 1 : -1, ink: ink };
  }

  // hero: they drift down slowly, sway, part around the hand, and a tap sends a gust
  var leaves = (function () {
    var cv = $('[data-leaves]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = true, mx = -999, my = -999, gust = null, t0 = performance.now();
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 16 : 30; P = []; for (var i = 0; i < n; i++) P.push(makeLeaf(w, h, '#3b2428'));
      draw();
    }
    function draw() { c.clearRect(0, 0, w, h); P.forEach(function (p) { drawLeaf(c, p); }); }
    function frame(t) {
      raf = 0; if (still() || !vis) { draw(); return; }
      var T = (t - t0) / 1000, sy = scrollY;
      P.forEach(function (p) {
        p.vx += Math.sin(T * .7 + p.ph) * .012; p.vy += p.fall * .02;
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 16000) { var f = (16000 - d2) / 16000 * .9, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; p.vr += (Math.random() - .5) * .02; }
        if (gust) { var gx = p.x - gust.x, gy = p.y - gust.y, gd = Math.sqrt(gx * gx + gy * gy) || 1, age = (t - gust.t) / 600; if (age < 1 && gd < 380) { var gf = (1 - gd / 380) * (1 - age) * 2.2; p.vx += gx / gd * gf; p.vy += gy / gd * gf - .5 * gf; p.vr += .01 * gf; } }
        p.vx *= .96; p.vy *= .96; p.vr *= .96;
        p.x += p.vx; p.y += p.vy + sy * 0; p.r += p.vr + Math.sin(T + p.ph) * .004;
        if (p.y > h + 30) { p.y = -30; p.x = Math.random() * w; p.vy = 0; }
        if (p.y < -60) p.y = h + 20;
        if (p.x < -40) p.x = w + 30; if (p.x > w + 40) p.x = -30;
      });
      draw(); raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) { var r = hero.getBoundingClientRect(); gust = { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }; });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: size, kick: kick };
  })();

  // footer: the leaves fall in and settle into a crown over the real logo, as in her logo (scroll-linked, reversible)
  var foot = $('[data-foot]');
  var crown = (function () {
    var cv = $('[data-crown]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = false, cx, cy, mx = -999, my = -999;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = foot.clientWidth; h = foot.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var lg = $('.f-logo'), fr = foot.getBoundingClientRect(), lr = lg.getBoundingClientRect();
      cx = lr.left - fr.left + lr.width / 2; cy = lr.top - fr.top + lr.height / 2;
      P = []; var n = 11, R = lr.width / 2 + 34;
      for (var i = 0; i < n; i++) {
        var a = Math.PI + (i + .5) / n * Math.PI, p = makeLeaf(w, h, '#f1c6b3'), out = i % 2 ? 0 : 16;
        p.tx = cx + Math.cos(a) * (R + out); p.ty = cy + Math.sin(a) * (R + out) * .92; p.tr = a; p.k = i % 3; p.s = 15 + (i % 2) * 6; p.flip = 1;
        p.sx = Math.random() * w; p.sy = -40 - Math.random() * 200; p.sr = Math.random() * 6.28; p.dl = Math.random() * .35;
        P.push(p);
      }
      tick();
    }
    function frame() {
      raf = 0; if (!P.length) return;
      var fr = foot.getBoundingClientRect(), pr = still() ? 1 : clamp((innerHeight - fr.top) / (Math.min(fr.height, innerHeight) * .9), 0, 1);
      c.clearRect(0, 0, w, h);
      P.forEach(function (p, i) {
        var e = smooth((pr - p.dl) / (1 - p.dl)), sw = Math.sin(e * Math.PI) * 40;
        var x = lerp(p.sx, p.tx, e) + sw * (i % 2 ? 1 : -1), y = lerp(p.sy, p.ty, e), r = lerp(p.sr, p.tr, e);
        if (!still()) { var dx = x - mx, dy = y - my, d = Math.sqrt(dx * dx + dy * dy); if (d < 90) { x += dx / (d || 1) * (90 - d) * .5; y += dy / (d || 1) * (90 - d) * .5; } }
        p.x = x; p.y = y; p.r = r; drawLeaf(c, p);
      });
    }
    function tick() { if (!raf) raf = requestAnimationFrame(frame); }
    foot.addEventListener('pointermove', function (e) { var r = foot.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; tick(); });
    foot.addEventListener('pointerleave', function () { mx = my = -999; tick(); });
    watch(foot, function (v) { vis = v; tick(); });
    return { size: size, kick: tick, vis: function () { return vis; } };
  })();

  // ---------------------------------------------------------------- portrait: leans toward the hand, a soft shine travels across it
  var portrait = $('[data-portrait]');
  hero.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var r = portrait.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    portrait.style.transform = 'perspective(1200px) rotateY(' + ((x - .5) * 5).toFixed(2) + 'deg) rotateX(' + ((.5 - y) * 4).toFixed(2) + 'deg)';
    portrait.style.setProperty('--sx', (x * 100).toFixed(1) + '%'); portrait.style.setProperty('--sy', (y * 100).toFixed(1) + '%');
  });
  hero.addEventListener('pointerleave', function () { portrait.style.transform = ''; });

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

  // ---------------------------------------------------------------- bento spotlight
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- treatments rail
  var treat = $('[data-treat]'), rail = $('[data-rail]'), tbar = $('[data-tbar]'), tcs = $$('.tc'), railDist = 0;
  function railLayout() {
    rail.style.transform = '';
    railDist = Math.max(0, rail.scrollWidth - innerWidth);
    treat.style.setProperty('--rail', still() ? '0px' : railDist + 'px');
  }
  watch(treat, function (v) { treat.classList.toggle('on', v); });
  tcs.forEach(function (t) { watch(t, function (v) { t.classList.toggle('on', v); }, { threshold: .35 }); });

  // ---------------------------------------------------------------- skin check: the ring of lights, labels, ripple, the lens opens
  var scan = $('[data-scan]'), sfig = $('[data-sfig]'), ledBox = $('[data-leds]'), ripple = $('[data-ripple]'), tags = $$('.tag'), leds = [];
  var IW = 1500, IH = 1000, RING = { x: .3125, y: .574, r: .148 }, LENS = { x: .284, y: .58 };
  for (var k = 0; k < 12; k++) { var li = document.createElement('i'); ledBox.appendChild(li); leds.push(li); }
  function cover(fx, fy) {   // image fraction -> px inside the figure (object-fit: cover; object-position 30% 55%)
    var W = sfig.clientWidth, Hh = sfig.clientHeight, s = Math.max(W / IW, Hh / IH), dw = IW * s, dh = IH * s;
    return [(W - dw) * .3 + dw * fx, (Hh - dh) * .55 + dh * fy, s];
  }
  function scanLayout() {
    leds.forEach(function (l, i) { var a = -Math.PI / 2 + i * Math.PI * 2 / 12, p = cover(RING.x + Math.cos(a) * RING.r, RING.y + Math.sin(a) * RING.r * IW / IH); l.style.left = p[0] + 'px'; l.style.top = p[1] + 'px'; });
    tags.forEach(function (t) { var p = cover(+t.dataset.x, +t.dataset.y), W = sfig.clientWidth; t.style.left = clamp(p[0], 10, W - 170) + 'px'; t.style.top = p[1] + 'px'; t.hidden = p[0] < 0 || p[0] > W; });
    var lp = cover(LENS.x, LENS.y); ripple.style.left = lp[0] + 'px'; ripple.style.top = lp[1] + 'px';
  }
  function decode(t, on) {
    if (on === t.classList.contains('on')) return;
    t.classList.toggle('on', on); clearInterval(t._t);
    var txt = t.dataset[he() ? 'he' : 'en'];
    if (!on || still()) { t.textContent = txt; return; }
    var glyphs = he() ? 'אבגדהוזחטיכלמנסעפצקרשת' : 'abcdefghijklmnopqrstuvwxyz', n = 0;
    t._t = setInterval(function () {
      n++; t.textContent = txt.split('').map(function (ch, i) { return ch === ' ' || i < n / 2 ? ch : glyphs[Math.floor(Math.random() * glyphs.length)]; }).join('');
      if (n / 2 >= txt.length) { clearInterval(t._t); t.textContent = txt; }
    }, 40);
  }

  // ---------------------------------------------------------------- tanya: true colour where you point; on touch it wanders by itself
  var tanyaSec = $('[data-tanya]'), tyfig = $('[data-tyfig]'), tyOn = false, tyHand = false, tyRaf = 0;
  tyfig.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; tyHand = true; var r = tyfig.getBoundingClientRect(); tyfig.style.setProperty('--x', (e.clientX - r.left) + 'px'); tyfig.style.setProperty('--y', (e.clientY - r.top) + 'px'); });
  tyfig.addEventListener('pointerleave', function () { tyHand = false; tyLoop(); });
  watch(tyfig, function (v) { tyOn = v; tyLoop(); });
  function tyLoop() {
    if (tyRaf || !tyOn || tyHand || still()) return;
    tyRaf = requestAnimationFrame(function st(t) {
      tyRaf = 0; if (!tyOn || tyHand || still()) return;
      var W = tyfig.clientWidth, Hh = tyfig.clientHeight, T = t / 1000;
      tyfig.style.setProperty('--x', (W * (.55 + .3 * Math.sin(T * .5))).toFixed(1) + 'px');
      tyfig.style.setProperty('--y', (Hh * (.45 + .28 * Math.sin(T * .37 + 1))).toFixed(1) + 'px');
      tyfig.style.setProperty('--rr', (Math.min(W, Hh) * .36).toFixed(0) + 'px');
      tyRaf = requestAnimationFrame(st);
    });
  }

  // ---------------------------------------------------------------- book: the diary that writes the message
  var steps = $$('[data-step]'), lvs = $$('[data-lv]'), days = $$('[data-day]'), whens = $$('[data-when]'), msgEl = $('[data-msg]'), msgBox = $('.msg'), send = $('[data-send]'), shown = '', typing = 0, seen = false;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  lvs.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); lightStep(0); write(); }); });
  function radio(group, n) { group.forEach(function (b) { b.addEventListener('click', function () { group.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lightStep(n); write(); }); }); }
  radio(days, 1); radio(whens, 1);
  send.addEventListener('pointerenter', function () { lightStep(2); });
  send.addEventListener('focus', function () { lightStep(2); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = lvs.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.dataset[l ? 'he' : 'en']; });
    var d = +days.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0].dataset.day;
    var w = whens.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0].dataset.when;
    var wHe = { m: 'בבוקר', a: 'בצהריים', e: 'בערב' }[w], wEn = { m: 'in the morning', a: 'around midday', e: 'in the evening' }[w];
    if (d === 5 && w === 'e') { wHe = 'בצהריים'; wEn = 'around midday'; }
    return l ? 'היי טניה, אשמח לקבוע תור ל' + (picked.length ? list(picked, true) : 'טיפול') + '. נוח לי ביום ' + dayHe[d] + ' ' + wHe + '. תודה.'
             : 'Hi Tanya, I’d like to book ' + (picked.length ? list(picked, false) : 'a treatment') + '. ' + dayEn[d] + ' ' + wEn + ' works for me. Thank you.';
  }
  // Friday closes at 14:00: no evening
  function fridayGuard() {
    var fri = days[5].getAttribute('aria-checked') === 'true', ev = whens[2];
    ev.disabled = fri; if (fri && ev.getAttribute('aria-checked') === 'true') { ev.setAttribute('aria-checked', 'false'); whens[1].setAttribute('aria-checked', 'true'); }
  }
  function write(instant) {
    fridayGuard();
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing); msgBox.classList.remove('typing');
    if (instant || still() || !seen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    msgBox.classList.add('typing');
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st); else msgBox.classList.remove('typing');
    })(t0);
  }
  watch($('[data-diary]'), function (v) { if (v && !seen) { seen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .35 });

  // ---------------------------------------------------------------- reviews: a seamless drifting row (a second copy, hidden from readers)
  var track = $('[data-track]');
  $$('.rv', track).forEach(function (r) { var k = r.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.classList.add('clone'); track.appendChild(k); });

  // ---------------------------------------------------------------- dock hides over the footer
  var dock = $('[data-dock]');

  // ---------------------------------------------------------------- one scroll loop
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // seam: her pink box opens out into the rose chapter
    var tr = treat.getBoundingClientRect(), op = calm ? 1 : smooth((vh - tr.top) / (vh * .85));
    treat.style.setProperty('--cs', calm ? '0px' : ((1 - op) * innerWidth * .3).toFixed(1) + 'px');
    treat.style.setProperty('--cr', calm ? '0px' : ((1 - op) * 60).toFixed(1) + 'px');
    // rail
    if (!calm) {
      var tp = prog(treat);
      rail.style.transform = 'translate3d(' + ((rtl() ? 1 : -1) * tp * railDist).toFixed(1) + 'px,0,0)';
      tbar.parentNode.style.setProperty('--tp', tp.toFixed(3));
    }
    // skin check
    var sp = calm ? .6 : prog(scan);
    leds.forEach(function (l, i) { l.classList.toggle('on', calm || sp > .04 + i * .03); });
    sfig.style.setProperty('--sb', calm ? 1 : lerp(.5, 1, smooth(sp / .4)).toFixed(3));
    tags.forEach(function (t, i) { decode(t, calm || sp > .3 + i * .07); });
    if (!calm) {
      var rp = smooth((sp - .5) / .2), lp = cover(LENS.x, LENS.y);
      ripple.style.opacity = rp > 0 && rp < 1 ? (1 - rp).toFixed(3) : 0;
      ripple.style.transform = 'scale(' + (1 + rp * 60).toFixed(2) + ')';
      var fr = sfig.getBoundingClientRect(), ir = clamp((sp - .6) / .4, 0, 1), tt = tanyaSec.getBoundingClientRect();
      ir = ir * ir * (3 - 2 * ir);
      var ixp = fr.left + lp[0], iyp = fr.top + lp[1], far = Math.hypot(Math.max(ixp, innerWidth - ixp), Math.max(iyp, vh - iyp));
      tanyaSec.style.clipPath = sp >= 1 && tt.top <= 1 ? 'none' : 'circle(' + (ir * far).toFixed(1) + 'px at ' + ixp.toFixed(1) + 'px ' + (iyp - tt.top).toFixed(1) + 'px)';
    } else tanyaSec.style.clipPath = '';
    // footer crown and the dock
    crown.kick();
    var fb = foot.getBoundingClientRect().top < vh * .8; dock.classList.toggle('away', fb);
  }

  function layout() { leaves.size(); railLayout(); scanLayout(); crown.size(); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (innerWidth !== lw || !phone()) { lw = innerWidth; layout(); } else { scanLayout(); crown.size(); tick(); } }, 140); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); leaves.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { railLayout(); scanLayout(); crown.size(); tick(); });
})();
