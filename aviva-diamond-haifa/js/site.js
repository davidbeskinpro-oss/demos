(function () {
  var root = document.documentElement, WA = '972538238448';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth <= 800; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';
  var TITLE = { he: 'אביבה דיימונד · ציפורניים, ריסים וגבות · דרך צרפת 38, חיפה', en: 'Aviva Diamond · Nails, lashes & brows · 38 Derech Tsarfat, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור אביבה דיימונד · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Aviva Diamond · This is not the business’s official website' };
  var wa = function (t) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'אביבה דיימונד', 'Aviva Diamond');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-range]', 'לפני ואחרי', 'Before and after');
    aria('[data-t-pairs]', 'זוגות תמונות', 'Photo pairs');
    aria('[data-t-treat]', 'טיפול', 'Treatment');
    aria('[data-t-day]', 'יום', 'Day');
    aria('[data-t-time]', 'שעה', 'Time');
    aria('[data-t-call]', 'להתקשר לאביבה, 053-823-8448', 'Call Aviva, 053-823-8448');
    aria('[data-t-wa]', 'וואטסאפ לאביבה', 'WhatsApp Aviva');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפת Google: דרך צרפת 38, חיפה' : 'Google map: 38 Derech Tsarfat, Haifa'; });
    var Q = { hands: ['היי אביבה, אשמח לקבוע תור לציפורניים', 'Hi Aviva, I’d like to book a nail appointment'],
              feet: ['היי אביבה, אשמח לקבוע תור לפדיקור', 'Hi Aviva, I’d like to book a pedicure'],
              eyes: ['היי אביבה, אשמח לקבוע תור לריסים וגבות', 'Hi Aviva, I’d like to book lashes and brows'] };
    $$('[data-wa-for]').forEach(function (a) { a.href = wa(Q[a.dataset.waFor][l === 'he' ? 0 : 1]); });
    $('[data-wa-hero]').href = wa(l === 'he' ? 'היי אביבה, אשמח לקבוע תור' : 'Hi Aviva, I’d like to book an appointment');
    decodeAll(true);
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ad-lang', l); } catch (e) {}
    splitName(); texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('ad-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI(); placeCard();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $('[data-foot]').classList.add('in');
    layout(); gem.kick(); dust.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 19.5], 1: [9, 19.5], 2: [9, 20], 3: [9, 20], 4: [9, 19.5], 5: [8, 15], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · כל היום' : 'Open now · all day'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    var td = H[n.d];
    $('[data-today]').innerHTML = (l ? 'היום, יום ' + dayHe[n.d] + ': ' : 'Today, ' + dayEn[n.d] + ': ') + (td ? '<span dir="ltr">' + hhmm(td[0]) + '–' + hhmm(td[1]) + '</span>' : (l ? 'סגור' : 'closed'));
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
  $$('[data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- letters: the name arrives letter by letter; the footer word rises
  function split(sp, start) {
    var i = start || 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="ln-w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
    return i;
  }
  function splitName() {
    var n = 0;
    $$('.name > span > span[lang]').forEach(function (sp, k) { if (!sp.querySelector('.ch')) split(sp, k % 2 ? 6 : 0); });
    $$('[data-word] > span[lang]').forEach(function (sp) { if (!sp.querySelector('.ch')) split(sp, 0); });
    return n;
  }
  splitName();

  // ---------------------------------------------------------------- glyph decode on the cards' lines
  var GL = '◇◆·◊';
  function decode(el, instant) {
    $$('span[lang]', el).forEach(function (sp) {
      var full = sp.dataset.full || (sp.dataset.full = sp.textContent);
      clearInterval(sp._t);
      if (instant || still()) { sp.textContent = full; return; }
      var k = 0, n = full.length;
      sp._t = setInterval(function () {
        k += Math.max(1, n / 18);
        sp.textContent = full.split('').map(function (c, i) { return i < k || c === ' ' ? c : GL[(i + Math.floor(k)) % GL.length]; }).join('');
        if (k >= n) { clearInterval(sp._t); sp.textContent = full; }
      }, 40);
    });
  }
  function decodeAll(instant) { $$('[data-decode]').forEach(function (d) { decode(d, instant); }); }

  var hero = $('[data-hero]'), stage = $('[data-stage]'), nav = $('[data-nav]'), core = $('[data-core]'), lead = $('[data-lead]');
  var f1 = $('.f1'), card1 = $('.card', f1), cap1 = $('.cap', f1);
  // the first card belongs to the hero's last screen when motion is on, and to its own frame when it is off
  function placeCard() { if (still()) { f1.appendChild(card1); f1.appendChild(cap1); } else { stage.appendChild(card1); stage.appendChild(cap1); } }
  placeCard();

  // ---------------------------------------------------------------- the stone: a brilliant cut, every facet a window onto her work
  var gem = (function () {
    var svg = $('[data-gem]'), R = 96, RT = R * .5, RS = R * .78, P = [], rot = 0, raf = 0, vis = true, t0 = 0, last = 0;
    var tilt = { x: 0, y: 0, tx: 0, ty: 0 }, light = 0, e = 0;
    var pol = function (r, a) { a = a * Math.PI / 180; return [Math.cos(a) * r, Math.sin(a) * r]; };
    var imgs = ['img/th-6.jpg', 'img/th-1.jpg', 'img/th-2.jpg', 'img/th-5.jpg'];
    var faces = [];
    for (var k = 0; k < 8; k++) {
      var T0 = pol(RT, 22.5 + 45 * k), T1 = pol(RT, 67.5 + 45 * k), S = pol(RS, 45 + 45 * k), Sp = pol(RS, 45 * k), G = pol(R, 22.5 + 45 * k), M = pol(R, 45 + 45 * k), G1 = pol(R, 67.5 + 45 * k);
      faces.push({ pts: [T0, T1, S], img: 0, base: .18 });
      faces.push({ pts: [T0, Sp, G, S], img: 1, base: .1 });
      faces.push({ pts: [S, G, M], img: 2, base: .22 });
      faces.push({ pts: [S, M, G1], img: 3, base: .05 });
    }
    var defs = document.createElementNS(NS, 'defs'); svg.appendChild(defs);
    var spin = document.createElementNS(NS, 'g'); svg.appendChild(spin);
    faces.forEach(function (f, i) {
      var cx = 0, cy = 0; f.pts.forEach(function (p) { cx += p[0]; cy += p[1]; }); cx /= f.pts.length; cy /= f.pts.length;
      var d = Math.sqrt(cx * cx + cy * cy) || 1; f.c = [cx, cy]; f.dir = [cx / d, cy / d]; f.ang = Math.atan2(cy, cx);
      f.sc = [(Math.random() - .5) * 260, (Math.random() - .5) * 260]; f.sr = (Math.random() - .5) * 140; f.er = (Math.random() - .5) * 90; f.dl = .1 + Math.random() * .55;
      var pts = f.pts.map(function (p) { return p[0].toFixed(2) + ',' + p[1].toFixed(2); }).join(' ');
      var cp = document.createElementNS(NS, 'clipPath'); cp.id = 'fc' + i; var pg = document.createElementNS(NS, 'polygon'); pg.setAttribute('points', pts); cp.appendChild(pg); defs.appendChild(cp);
      var g = document.createElementNS(NS, 'g'); f.g = g;
      var inner = document.createElementNS(NS, 'g'); inner.setAttribute('clip-path', 'url(#fc' + i + ')');
      var im = document.createElementNS(NS, 'image'); im.setAttribute('href', imgs[f.img]); im.setAttribute('x', -100); im.setAttribute('y', -100); im.setAttribute('width', 200); im.setAttribute('height', 200); im.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      im.setAttribute('transform', 'rotate(' + (i * 37 % 360) + ') scale(' + (1.3 + (i % 3) * .25) + ')');
      inner.appendChild(im);
      var fl = document.createElementNS(NS, 'polygon'); fl.setAttribute('points', pts); fl.setAttribute('class', 'fl'); f.fl = fl;
      var fc = document.createElementNS(NS, 'polygon'); fc.setAttribute('points', pts); fc.setAttribute('class', 'fc'); fc.setAttribute('fill', 'none');
      g.appendChild(inner); g.appendChild(fl); g.appendChild(fc); spin.appendChild(g);
    });
    var tb = document.createElementNS(NS, 'polygon'); tb.setAttribute('class', 'tb');
    tb.setAttribute('points', [0, 1, 2, 3, 4, 5, 6, 7].map(function (k) { var p = pol(RT, 22.5 + 45 * k); return p[0].toFixed(2) + ',' + p[1].toFixed(2); }).join(' '));
    spin.appendChild(tb);
    var rim = document.createElementNS(NS, 'circle'); rim.setAttribute('r', R); rim.setAttribute('class', 'rim'); spin.appendChild(rim);

    var geo = { cx: 0, cy: 0, s: 1, W: 0, H: 0 };
    function size() {
      var W = stage.clientWidth, Hh = stage.clientHeight, gw, gx, gy;
      if (phone()) { gw = Math.min(W * .84, Hh * .44); gx = W / 2; gy = Math.max(34 + 64 + W * .155 * .85 + gw / 2 + 10, Hh * .43); }
      else { gw = Math.min(Hh * .66, W * .42); gx = W * (rtl() ? .42 : .58); gy = Hh * .54; }
      geo = { cx: gx, cy: gy, s: gw / 200, W: W, H: Hh, gw: gw };
      stage.style.setProperty('--gx', gx + 'px'); stage.style.setProperty('--gy', gy + 'px'); stage.style.setProperty('--gw', gw + 'px');
      core.style.transformOrigin = gx + 'px ' + gy + 'px';
    }
    function frame(t) {
      raf = 0;
      var calm = still(), T = t0 ? (t - t0) / 1000 : 0, dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!calm) rot += dt * 7;
      tilt.x = lerp(tilt.x, tilt.tx, .08); tilt.y = lerp(tilt.y, tilt.ty, .08);
      var damp = 1 - smooth(e * 3), tx = (calm ? 0 : tilt.x) * damp, ty = (calm ? 0 : tilt.y) * damp;
      stage.style.setProperty('--tx', tx.toFixed(2) + 'deg'); stage.style.setProperty('--ty', ty.toFixed(2) + 'deg');
      core.style.transform = 'perspective(900px) rotateX(' + tx.toFixed(2) + 'deg) rotateY(' + ty.toFixed(2) + 'deg)';
      spin.setAttribute('transform', 'rotate(' + rot.toFixed(2) + ')');
      light = calm ? -.8 : T * .9 + tilt.y * .08;
      faces.forEach(function (f) {
        var a = calm ? 1 : smooth((T - f.dl) / .9), x = (1 - a) * f.sc[0] + f.dir[0] * e * 150, y = (1 - a) * f.sc[1] + f.dir[1] * e * 150, r = (1 - a) * f.sr + e * f.er;
        var op = a * (1 - smooth((e - .35) / .45));
        f.g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + r.toFixed(1) + ' ' + f.c[0].toFixed(1) + ' ' + f.c[1].toFixed(1) + ')');
        f.g.setAttribute('opacity', op.toFixed(3));
        var gl = Math.pow(Math.max(0, Math.cos(f.ang + rot * Math.PI / 180 - light)), 8);
        f.fl.setAttribute('opacity', clamp(f.base + gl * .75, 0, .95).toFixed(3));
      });
      var ra = calm ? 1 : smooth((T - .2) / 1.1), rimOp = ra * (1 - smooth(e / .3));
      rim.setAttribute('opacity', rimOp.toFixed(3)); tb.setAttribute('opacity', rimOp.toFixed(3));
      // the table opens into the whole photograph
      var big = 1.7 * Math.max(geo.W, geo.H), rr = lerp(RT * geo.s * ra, big, smooth((e - .05) / .6));
      var ang = rot * Math.PI / 180;
      core.style.clipPath = 'polygon(' + [0, 1, 2, 3, 4, 5, 6, 7].map(function (k) { var a2 = (22.5 + 45 * k) * Math.PI / 180 + ang * (1 - smooth(e / .5)); return (geo.cx + Math.cos(a2) * rr).toFixed(1) + 'px ' + (geo.cy + Math.sin(a2) * rr).toFixed(1) + 'px'; }).join(',') + ')';
      $('img', core).style.setProperty('--cs', lerp(1.5, 1.04, smooth(e / .7)).toFixed(3));
      stage.style.setProperty('--fo', (1 - smooth(e / .4)).toFixed(3));
      var busy = !calm && (vis && (T < 2.2 || true));
      if (busy) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    stage.addEventListener('pointermove', function (ev) { if (ev.pointerType !== 'mouse') return; tilt.ty = ((ev.clientX - geo.cx) / geo.W) * 16; tilt.tx = -((ev.clientY - geo.cy) / geo.H) * 12; });
    stage.addEventListener('pointerleave', function () { tilt.tx = tilt.ty = 0; });
    if (window.DeviceOrientationEvent) addEventListener('deviceorientation', function (ev) { if (ev.gamma == null) return; tilt.ty = clamp(ev.gamma / 4, -8, 8); tilt.tx = clamp((ev.beta - 45) / 6, -6, 6); });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { size: size, kick: kick, start: function () { t0 = performance.now(); kick(); }, setE: function (v) { e = v; } };
  })();

  // ---------------------------------------------------------------- dust: diamond sparkles and rose petals that drift and part around the hand
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), w, h, P = [], raf = 0, vis = true, mx = -999, my = -999, bursts = [];
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = stage.clientWidth; h = stage.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 46 : 90; P = [];
      for (var i = 0; i < n; i++) P.push(mk(true));
    }
    function mk(any) {
      var petal = Math.random() < .3;
      return { x: Math.random() * w, y: any ? Math.random() * h : -20, vx: 0, vy: 0, s: petal ? 6 + Math.random() * 7 : 1 + Math.random() * 2.6, petal: petal, r: Math.random() * 6.28, vr: (Math.random() - .5) * .02, ph: Math.random() * 6.28, sp: .15 + Math.random() * .35, col: petal ? (Math.random() < .5 ? '236,170,182' : '242,204,196') : (Math.random() < .5 ? '248,238,234' : '236,211,182') };
    }
    function star(x, y, s, a) {
      c.globalAlpha = a; c.beginPath();
      c.moveTo(x, y - s * 2.2); c.lineTo(x + s * .45, y - s * .45); c.lineTo(x + s * 2.2, y); c.lineTo(x + s * .45, y + s * .45);
      c.lineTo(x, y + s * 2.2); c.lineTo(x - s * .45, y + s * .45); c.lineTo(x - s * 2.2, y); c.lineTo(x - s * .45, y - s * .45); c.closePath(); c.fill();
    }
    function draw(t) {
      c.clearRect(0, 0, w, h);
      var calm = still(), T = t / 1000;
      P.forEach(function (p) {
        if (!calm) {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 14000) { var f = (14000 - d2) / 14000 * .9, d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f; }
          p.vx *= .93; p.vy *= .93;
          p.x += p.vx + Math.sin(T * .7 + p.ph) * (p.petal ? .45 : .12); p.y += p.vy + p.sp * (p.petal ? 1.1 : .35); p.r += p.vr;
          if (p.y > h + 20 || p.x < -30 || p.x > w + 30) { var q = mk(false); for (var k in q) p[k] = q[k]; }
        }
        c.fillStyle = 'rgb(' + p.col + ')';
        if (p.petal) {
          c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.globalAlpha = .55; c.beginPath();
          c.moveTo(0, -p.s); c.bezierCurveTo(p.s * .9, -p.s * .6, p.s * .7, p.s * .8, 0, p.s); c.bezierCurveTo(-p.s * .7, p.s * .8, -p.s * .9, -p.s * .6, 0, -p.s); c.fill(); c.restore();
        } else {
          var tw = calm ? .7 : .35 + .65 * Math.pow(Math.max(0, Math.sin(T * 2.2 + p.ph * 3)), 6);
          star(p.x, p.y, p.s, tw);
        }
      });
      bursts = bursts.filter(function (b) { return t - b.t < 900; });
      bursts.forEach(function (b) { var u = (t - b.t) / 900; c.fillStyle = 'rgb(248,238,234)'; for (var i = 0; i < 10; i++) { var a = i / 10 * 6.28; star(b.x + Math.cos(a) * u * 70, b.y + Math.sin(a) * u * 70, 2.2 * (1 - u), 1 - u); } });
      c.globalAlpha = 1;
    }
    function frame(t) { raf = 0; draw(t); if (!still() && vis) raf = requestAnimationFrame(frame); }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    stage.addEventListener('pointermove', function (ev) { var r = stage.getBoundingClientRect(); mx = ev.clientX - r.left; my = ev.clientY - r.top; });
    stage.addEventListener('pointerleave', function () { mx = my = -999; });
    stage.addEventListener('pointerdown', function (ev) { var r = stage.getBoundingClientRect(); bursts.push({ x: ev.clientX - r.left, y: ev.clientY - r.top, t: performance.now() }); kick(); });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { size: function () { size(); draw(performance.now()); }, kick: kick };
  })();

  // ---------------------------------------------------------------- before / after
  var baView = $('[data-baview]'), range = $('[data-barange]'), baSeen = false, sweepRaf = 0;
  function setX(v) { baView.style.setProperty('--x', v + '%'); }
  range.addEventListener('input', function () { cancelAnimationFrame(sweepRaf); setX(range.value); });
  $$('[data-pair]').forEach(function (b) { b.addEventListener('click', function () {
    $$('[data-pair]').forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); });
    var n = b.dataset.pair; $('[data-ba-after]').src = 'img/ba' + n + '-after.jpg'; $('[data-ba-before]').src = 'img/ba' + n + '-before.jpg'; sweep();
  }); });
  function sweep() {
    if (still()) return;
    cancelAnimationFrame(sweepRaf);
    var t0 = performance.now(), keys = [50, 14, 86, 50];
    (function st(t) { var u = (t - t0) / 2600, seg = Math.min(2, Math.floor(u * 3)), lu = smooth(u * 3 - seg); var v = u >= 1 ? 50 : lerp(keys[seg], keys[seg + 1], lu); setX(v); range.value = v; if (u < 1) sweepRaf = requestAnimationFrame(st); })(t0);
  }
  watch(baView, function (v) { if (v && !baSeen) { baSeen = true; setTimeout(sweep, 400); } }, { threshold: .5 });

  // ---------------------------------------------------------------- bento: spotlight, living tiles, brow drawn by a pencil
  var bento = $('[data-bento]');
  watch(bento, function (v) { bento.classList.toggle('on', v); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (ev) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (ev.clientX - r.left) + 'px'); t.style.setProperty('--my', (ev.clientY - r.top) + 'px'); }); });
  var brow = $('.brow'), bpath = $('.stroke', brow), hairs = $('.hairs', brow), pencil = $('.pencil', brow), L = bpath.getTotalLength ? bpath.getTotalLength() : 0, hairN = 26;
  for (var hI = 0; hI < hairN; hI++) {
    var u = (hI + .5) / hairN, pt = bpath.getPointAtLength(u * L), pt2 = bpath.getPointAtLength(Math.min(L, u * L + 4)), ang = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) - .9 + u * .5, ln = 10 + Math.sin(u * 3.1) * 8;
    var line = document.createElementNS(NS, 'line'); line.setAttribute('x1', pt.x.toFixed(1)); line.setAttribute('y1', (pt.y + 4).toFixed(1));
    line.setAttribute('x2', (pt.x + Math.cos(ang) * ln).toFixed(1)); line.setAttribute('y2', (pt.y + 4 + Math.sin(ang) * ln).toFixed(1)); line.dataset.u = u; hairs.appendChild(line);
  }
  var hl = $$('line', hairs), browT0 = 0, browRaf = 0, browOn = false;
  function browDraw(u) {
    bpath.style.setProperty('--bd', (1 - u).toFixed(3));
    hl.forEach(function (l) { l.style.setProperty('--ho', +l.dataset.u < u ? 1 : 0); });
    var p = bpath.getPointAtLength(clamp(u, 0, 1) * L); pencil.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ') rotate(28)');
    pencil.style.opacity = u >= 1 || u <= 0 ? 0 : 1;
  }
  function browLoop(t) { browRaf = 0; if (!browOn || still()) { browDraw(1); return; } if (!browT0) browT0 = t; var c = ((t - browT0) / 1000) % 6, u = c < 3.2 ? smooth(c / 3.2) : c < 5.2 ? 1 : 1 - smooth((c - 5.2) / .8); browDraw(u); browRaf = requestAnimationFrame(browLoop); }
  watch($('.t-brow'), function (v) { browOn = v; if (v && !browRaf) browRaf = requestAnimationFrame(browLoop); });
  browDraw(1);

  // ---------------------------------------------------------------- odometer
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
    var roll = function (go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); };
    roll(still());
    watch(o, function (v) { if (v) roll(true); }, { threshold: .4 });
  });

  // ---------------------------------------------------------------- book: three choices, the message writes itself
  var stones = $$('[data-treat]'), daysB = $$('[data-day]'), timesB = $$('[data-time]'), steps = $$('[data-step]'), msgEl = $('[data-msg]'), sendA = $('[data-send]'), shown = '', typing = 0, chatSeen = false;
  function lightSteps() {
    var a = stones.some(function (s) { return s.getAttribute('aria-pressed') === 'true'; }), b = daysB.some(function (s) { return s.getAttribute('aria-checked') === 'true'; }), c = timesB.some(function (s) { return s.getAttribute('aria-checked') === 'true'; });
    steps[0].classList.add('on'); steps[1].classList.toggle('on', a || b); steps[2].classList.toggle('on', b || c);
  }
  stones.forEach(function (s) { s.addEventListener('click', function () { s.setAttribute('aria-pressed', s.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); lightSteps(); write(); }); });
  function radio(list, b) { list.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); }
  daysB.forEach(function (b) { b.addEventListener('click', function () {
    radio(daysB, b);
    var fri = b.dataset.day === '5', ev = timesB[2]; ev.disabled = fri;
    if (fri && ev.getAttribute('aria-checked') === 'true') ev.setAttribute('aria-checked', 'false');
    $$('[data-fri-note] span[lang]').forEach(function (sp) { sp.textContent = sp.lang === 'he' ? (fri ? 'בשישי עד 15:00, אז בוקר או צהריים.' : 'בוקר, צהריים או ערב.') : (fri ? 'Friday closes at 15:00, so morning or midday.' : 'Morning, midday or evening.'); });
    lightSteps(); write();
  }); });
  timesB.forEach(function (b) { b.addEventListener('click', function () { radio(timesB, b); lightSteps(); write(); }); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = stones.filter(function (s) { return s.getAttribute('aria-pressed') === 'true'; }).map(function (s) { return s.dataset[l ? 'he' : 'en']; });
    var d = daysB.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], tm = timesB.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0];
    var what = picked.length ? list(picked, l) : (l ? 'טיפול' : 'a treatment');
    var when = (d ? (l ? ' ביום ' + dayHe[+d.dataset.day] : ' on ' + dayEn[+d.dataset.day]) : '') + (tm ? ' ' + tm.dataset[l ? 'he' : 'en'] : '');
    return l ? 'היי אביבה, אשמח לקבוע תור ל' + what + when + '. תודה!' : 'Hi Aviva, I’d like to book ' + what + when + '. Thank you!';
  }
  function write(instant) {
    var target = compose();
    sendA.href = wa(target);
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
  lightSteps();

  // ---------------------------------------------------------------- reviews drift: two copies so the loop is seamless
  var tr = $('[data-track]'); $$('.rv', tr).forEach(function (r) { var k = r.cloneNode(true); k.setAttribute('aria-hidden', 'true'); tr.appendChild(k); });

  // ---------------------------------------------------------------- footer word fits its width, rises letter by letter
  var foot = $('[data-foot]'), word = $('[data-word]');
  function fitWord() {
    var sp = $$('span[lang]', word).filter(function (s) { return s.offsetWidth; })[0]; if (!sp) return;
    word.style.setProperty('--wf', '100px'); var w = sp.offsetWidth || 1, avail = foot.clientWidth - 2 * parseFloat(getComputedStyle(foot.firstElementChild).paddingLeft);
    word.style.setProperty('--wf', Math.min(260, Math.floor(100 * avail / w)) + 'px');
  }
  watch(foot, function (v) { foot.classList.toggle('in', v || still()); }, { threshold: .25 });

  // ---------------------------------------------------------------- one scroll loop
  var frames = $$('[data-frame]'), dock = $('[data-dock]'), ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // hero: the stone opens, the first card lands, the next frame rides over
    var hr = hero.getBoundingClientRect(), p = calm ? 0 : clamp(-hr.top / Math.max(1, hr.height - vh), 0, 1);
    var e = calm ? 0 : smooth(p / .3);
    gem.setE(e); if (!calm) gem.kick();
    stage.classList.toggle('over', e > .55);
    stage.classList.toggle('scrolled', p > 0);
    var lo = 1 - smooth(p / .12);
    stage.style.setProperty('--lo', lo.toFixed(3)); stage.style.setProperty('--ly', ((1 - lo) * -30).toFixed(1) + 'px');
    lead.style.visibility = lo < .02 && !calm ? 'hidden' : '';
    var co = calm ? 1 : smooth((p - .24) / .14);
    stage.style.setProperty('--co', co.toFixed(3)); stage.style.setProperty('--cy', ((1 - co) * 60).toFixed(1) + 'px');
    card1.style.visibility = !calm && co < .02 ? 'hidden' : '';
    if (!calm && co > .5 && !card1._dec) { card1._dec = true; decode($('[data-decode]', card1)); } else if (co < .2) card1._dec = false;
    // frames stack: each one dims the one beneath
    frames.forEach(function (f, i) {
      if (calm || f === f1) { f.style.removeProperty('--dim'); f.style.removeProperty('--k'); return; }
      var r = f.getBoundingClientRect(), enter = clamp(1 - r.top / vh, 0, 1);
      f.style.setProperty('--k', lerp(1.14, 1.02, smooth(enter)).toFixed(3));
      var prev = i === 1 ? stage : frames[i - 1];
      prev.style.setProperty('--dim', (smooth(enter) * .6).toFixed(3));
      var d = $('[data-decode]', f);
      if (enter > .7 && !f._dec) { f._dec = true; decode(d); } else if (enter < .3) f._dec = false;
    });
    if (calm) stage.style.removeProperty('--dim');
    // the dock hides while the booking phone is on screen
    var bk = $('[data-chat]').getBoundingClientRect(), baTop = $('[data-ba]').getBoundingClientRect().top;
    dock.classList.toggle('hide', baTop > vh * .6 || (bk.top < vh * .8 && bk.bottom > vh * .2));
  }

  function layout() { gem.size(); dust.size(); fitWord(); tick(); gem.kick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { stage.classList.add('ready'); hero.classList.add('ready'); gem.start(); dust.kick(); fitWord(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 900);
})();
