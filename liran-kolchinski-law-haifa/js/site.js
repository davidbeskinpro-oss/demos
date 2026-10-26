(function () {
  var root = document.documentElement, WA = '972526662828';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'לירן קולצינסקי · עורך דין אזרחי ומסחרי · דרך העצמאות 84, חיפה', en: 'Liran Kolchinski · Civil & commercial lawyer · 84 Derech HaAtzmaut, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור משרד עורך דין אזרחי מסחרי ודים לירן קולצינסקי · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for the civil & commercial law office of Vadim Liran Kolchinski · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'משרד עורך דין קולצינסקי', 'Kolchinski Law Firm');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-call]', 'התקשרו ללירן, 052-666-2828', 'Call Liran, 052-666-2828');
    aria('[data-t-wa]', 'וואטסאפ ללירן', 'WhatsApp Liran');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: דרך העצמאות 84, חיפה' : 'Map: 84 Derech HaAtzmaut, Haifa'; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('kl-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('kl-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    if (on) { dust.restart(); fdust.restart(); }
    layout(); arc.kick(); dust.kick(); fdust.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 18], 1: [9, 18], 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: null, 6: null };
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
  // consecutive days with the same hours share a row; the week starts on Sunday
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- split text into letters (keeps words whole, keeps <em>)
  function split(el) {
    var i = 0;
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            var ws = document.createElement('span'); ws.className = 'w'; ws.style.whiteSpace = 'nowrap'; ws.style.display = 'inline-block';
            w.split('').forEach(function (c) { var s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = c; ws.appendChild(s); });
            frag.appendChild(ws);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
    return i;
  }
  $$('[data-fill] > span[lang]').forEach(split);

  // ---------------------------------------------------------------- entrances
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('.mosaic,.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var pending = $$('[data-reveal],[data-tile]');   // the scroll loop below is a fallback for a late observer
  pending.forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), page = $('.page');

  // ---------------------------------------------------------------- particles made of the real logo's own pixels
  var shieldImg = new Image(); shieldImg.src = 'img/shield.png';
  var shieldPts = null;
  function sampleShield() {
    if (shieldPts) return shieldPts;
    try {
      var iw = 164, ih = 205, sc = document.createElement('canvas'); sc.width = iw; sc.height = ih;
      var sx = sc.getContext('2d'); sx.drawImage(shieldImg, 0, 0, iw, ih);
      var d = sx.getImageData(0, 0, iw, ih).data, pts = [];
      for (var y = 0; y < ih; y += 2) for (var x = 0; x < iw; x += 2) {
        var k = (y * iw + x) * 4; if (d[k + 3] > 140) pts.push([x / ih, y / ih, d[k], d[k + 1], d[k + 2]]);
      }
      shieldPts = pts; return pts;
    } catch (e) { return null; }
  }
  function makeDust(cv, host, opt) {
    var c = cv.getContext('2d'), P = [], w = 0, h = 0, raf = 0, vis = false, t0 = 0, mx = -999, my = -999, ok = false;
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = host.clientWidth; h = host.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function build() {
      var pts = sampleShield(); if (!pts) return; P = [];
      var want = phone() ? opt.nPhone : opt.n, stp = Math.max(1, pts.length / want);
      for (var f = 0; f < pts.length; f += stp) {
        var q = pts[Math.floor(f)];
        P.push({ hx: q[0], hy: q[1], col: 'rgb(' + q[2] + ',' + q[3] + ',' + q[4] + ')', x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, ph: Math.random() * 6.28, dl: Math.random() * .5, fx: Math.random(), fy: Math.random(), sp: .2 + Math.random() * .6 });
      }
      ok = true;
    }
    function frame(nowT) {
      raf = 0; if (!ok) return;
      var calm = still(), T = (nowT - t0) / 1000, box = opt.box(w, h), sz = phone() ? 1.6 : 2;
      var burst = opt.burst ? smooth((T - opt.burst) / 1.4) : 0;
      c.clearRect(0, 0, w, h);
      if (calm && opt.stillHide) return;
      for (var i = 0; i < P.length; i++) {
        var p = P[i], tx = box.x + p.hx * box.s, ty = box.y + p.hy * box.s;
        if (burst > 0) {   // after the cards are dealt, the shield loosens into slow dust across the hero
          var dx0 = p.fx * w + Math.sin(T * .3 * p.sp + p.ph) * 30, dy0 = p.fy * h + Math.cos(T * .25 * p.sp + p.ph) * 24;
          tx = lerp(tx, dx0, burst); ty = lerp(ty, dy0, burst);
        } else { tx += Math.sin(T * 1.2 + p.ph) * 1.2; ty += Math.cos(T + p.ph) * 1.2; }
        if (calm) { p.x = tx; p.y = ty; }
        else {
          var a = smooth((T - p.dl) / 1.1), ddx = p.x - mx, ddy = p.y - my, d2 = ddx * ddx + ddy * ddy;
          if (d2 < 12000) { var fz = (12000 - d2) / 12000 * 3, dd = Math.sqrt(d2) || 1; p.vx += ddx / dd * fz; p.vy += ddy / dd * fz; }
          p.vx += (tx - p.x) * (.02 + .06 * a); p.vy += (ty - p.y) * (.02 + .06 * a); p.vx *= .84; p.vy *= .84; p.x += p.vx; p.y += p.vy;
        }
        c.globalAlpha = (opt.alpha || .85) * (1 - burst * .6);
        c.fillStyle = p.col; c.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
      }
      c.globalAlpha = 1;
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() { size(); build(); t0 = performance.now(); kick(); }
    host.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    host.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(host, function (v) { vis = v; if (v && opt.onShow) { t0 = performance.now(); P.forEach(function (p) { p.x = Math.random() * w; p.y = Math.random() * h; }); } kick(); });
    if (shieldImg.complete && shieldImg.naturalWidth) setTimeout(start, 0); else shieldImg.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } }, restart: function () { t0 = performance.now(); kick(); } };
  }
  var arcWrap = $('[data-arcwrap]');
  var dust = makeDust($('[data-dust]'), hero, {
    n: 1700, nPhone: 900, alpha: .9, burst: 1.9, stillHide: true,
    box: function (w) { var s = Math.min(arcWrap.clientHeight * .62, 300); return { s: s, x: w / 2 - s * .4, y: arcWrap.offsetTop + arcWrap.clientHeight * .49 - s * .5 }; }
  });
  var foot = $('[data-foot]');
  var fdust = makeDust($('[data-fdust]'), foot, {
    n: 2600, nPhone: 1100, alpha: .42, onShow: true,
    box: function (w, h) { var s = Math.min(h * .78, w * (phone() ? .9 : .5)); return { s: s, x: rtl() ? w * .08 : w * .92 - s * .8, y: h * .1 }; }
  });

  // ---------------------------------------------------------------- the arc: his photos dealt out of the shield, the portrait in front
  var arc = (function () {
    var el = $('[data-arc]'), cards = $$('.ac', el), N = cards.length, step = 360 / N, front = N - 1;
    var off = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = true, t0 = 0, last = 0, dragged = 0;
    function R() { var cw = cards[0].offsetWidth || 160; return Math.max(cw * 1.08 / (2 * Math.tan(Math.PI / N)), phone() ? 200 : innerWidth * .26); }
    function frame(t) {
      raf = 0;
      if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; c.style.opacity = ''; }); return; }
      if (!t0) t0 = t;
      var T = (t - t0) / 1000, dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { off += vel * dt; vel *= .9; off += (0 - off) * Math.min(1, dt * (dragged > 0 ? 1.4 : .9)); dragged = Math.max(0, dragged - dt); }
      var sway = Math.sin(T * .42) * 22 + (scrollY * .05) * (rtl() ? 1 : -1), r = R();
      el.style.transform = 'translateZ(' + (-r).toFixed(1) + 'px) rotateX(-6deg)';   // the front card sits at its own size, the rest fall back into depth
      cards.forEach(function (c, i) {
        var rel = (i - front) * step, deal = smooth((T - .55 - (i === front ? N : i) * .09) / .8);
        var a = (rel + sway + off) * deal, f = Math.cos(a * Math.PI / 180), lift = f > .94 ? (f - .94) * 16 : 0;
        c.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + (r * deal + lift * 40).toFixed(1) + 'px) scale(' + (lerp(.2, 1, deal) * (1 + lift * .05)).toFixed(3) + ')';
        c.style.opacity = deal.toFixed(3);
        c.style.filter = 'brightness(' + (.28 + .72 * Math.pow(Math.max(f, 0), 1.7)).toFixed(3) + ')';
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    el.style.transform = 'rotateX(-6deg)';
    arcWrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; arcWrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; off += dx * .22; vel = dx * 3; dragged = 1.2; });
    addEventListener('pointerup', function () { drag = false; arcWrap.classList.remove('drag'); });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- the engraved portrait: the hand (or the scroll on a phone) uncovers the photo
  var engrave = (function () {
    var fig = $('[data-engrave]'), img = $('[data-engsrc]', fig), cv = $('[data-engcanvas]', fig), c = cv.getContext('2d');
    var w = 0, h = 0, eng = null, trail = [], raf = 0, vis = false, auto = !fine, t0 = 0, ok = false;
    function build() {
      w = img.clientWidth; h = img.clientHeight; if (!w) return;
      var dpr = Math.min(2, devicePixelRatio || 1); cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      try {
        var s = document.createElement('canvas'), sw = Math.round(w), sh = Math.round(h); s.width = sw; s.height = sh;
        var sx = s.getContext('2d'); sx.drawImage(img, 0, 0, sw, sh); var d = sx.getImageData(0, 0, sw, sh).data;
        eng = document.createElement('canvas'); eng.width = sw * dpr; eng.height = sh * dpr;
        var ex = eng.getContext('2d'); ex.scale(dpr, dpr); ex.fillStyle = '#ece6da'; ex.fillRect(0, 0, sw, sh); ex.fillStyle = '#231d1f';
        var gap = sw < 340 ? 4 : 5;
        for (var y = gap / 2; y < sh; y += gap) for (var x = 0; x < sw; x += 2) {
          var k = (Math.floor(y) * sw + x) * 4, lum = (d[k] * .3 + d[k + 1] * .59 + d[k + 2] * .11) / 255;
          var wave = Math.sin(x * .045 + y * .02) * .6, th = Math.pow(1 - lum, 1.25) * (gap - .6);
          if (th > .25) ex.fillRect(x, y + wave - th / 2, 2.1, th);
        }
        ok = true;
      } catch (e) { ok = false; }
    }
    function draw(t) {
      raf = 0; if (!ok || still()) return;
      var T = (t - t0) / 1000;
      if (auto) {   // phones: a slow lens wanders over the face; it widens as the card scrolls up past the middle
        var rr = fig.getBoundingClientRect(), pr = clamp((innerHeight * .9 - rr.top) / (rr.height + innerHeight * .4), 0, 1);
        trail.push({ x: w * (.5 + Math.sin(T * .9) * .28), y: h * (.36 + Math.sin(T * .63 + 1) * .2), r: lerp(w * .16, w * .9, smooth((pr - .45) / .45)), t: t });
      }
      trail = trail.filter(function (p) { return t - p.t < 1600; });
      c.clearRect(0, 0, w, h); c.drawImage(eng, 0, 0, w, h);
      c.save(); c.beginPath();
      trail.forEach(function (p) { var k = 1 - (t - p.t) / 1600, r = p.r * (.4 + .6 * k); c.moveTo(p.x + r, p.y); c.arc(p.x, p.y, r, 0, 6.2832); });
      c.clip(); c.drawImage(img, 0, 0, w, h); c.restore();
      if (vis) raf = requestAnimationFrame(draw);
    }
    function kick() { if (!raf && ok && !still()) raf = requestAnimationFrame(draw); }
    cv.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; auto = false; var r = cv.getBoundingClientRect(); trail.push({ x: (e.clientX - r.left) * w / r.width, y: (e.clientY - r.top) * h / r.height, r: w * .17, t: performance.now() }); kick(); });
    cv.addEventListener('pointerdown', function (e) { var r = cv.getBoundingClientRect(); trail.push({ x: (e.clientX - r.left) * w / r.width, y: (e.clientY - r.top) * h / r.height, r: w * .3, t: performance.now() }); kick(); });
    watch(fig, function (v) { vis = v; if (v) { if (!t0) t0 = performance.now(); kick(); } });
    function go() { build(); t0 = performance.now(); kick(); }
    if (img.complete && img.naturalWidth) setTimeout(go, 0); else img.addEventListener('load', go, { once: true });
    return { size: function () { if (img.complete) { build(); kick(); } }, kick: kick };
  })();

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
  $$('[data-odo]').forEach(function (o) { roll(o, still()); watch(o, function (v) { if (v) roll(o, true); else if (!still()) roll(o, false); }, { threshold: .3 }); });

  // ---------------------------------------------------------------- glyph decode (Russian tile, FAQ questions)
  var GL = { ru: 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ', he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' };
  function decode(el, text, set) {
    if (still()) { el.textContent = text; return; }
    clearInterval(el._dc); var n = 0, L = text.length;
    el._dc = setInterval(function () {
      n += Math.max(1, L / 22);
      el.textContent = text.split('').map(function (ch, i) { return i < n || ch === ' ' || /[?,.״׳]/.test(ch) ? ch : GL[set][Math.floor(Math.random() * GL[set].length)]; }).join('');
      if (n >= L) { clearInterval(el._dc); el.textContent = text; }
    }, 34);
  }
  var ru = $('[data-decode]');
  watch(ru, function (v) { if (v) decode(ru, ru.dataset.decode, 'ru'); });
  ru.closest('.tile').addEventListener('pointerenter', function () { decode(ru, ru.dataset.decode, 'ru'); });
  $$('.qr dt').forEach(function (dt) {
    watch(dt, function (v) { if (!v) return; var l = he() ? 'he' : 'en', sp = $('[lang="' + l + '"]', dt); decode(sp, dt.dataset[l === 'he' ? 'decodeHe' : 'decodeEn'], l); }, { threshold: .6 });
  });

  // ---------------------------------------------------------------- mosaic: tiles play when they come in and replay on the next pass; a light under the hand
  $$('.tile, .c-tile').forEach(function (t) {
    watch(t, function (v) { t.classList.toggle('on', v); }, { threshold: .35 });
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); t.classList.add('lit'); });
    t.addEventListener('pointerleave', function () { t.classList.remove('lit'); });
  });
  var tilt = $('[data-tilt]');
  if (fine) {
    tilt.addEventListener('pointermove', function (e) { if (still()) return; var r = tilt.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; tilt.style.transform = 'perspective(800px) rotateY(' + (x * 9).toFixed(2) + 'deg) rotateX(' + (-y * 9).toFixed(2) + 'deg)'; });
    tilt.addEventListener('pointerleave', function () { tilt.style.transform = ''; });
  }

  // ---------------------------------------------------------------- sign: the photo opens, the headline arrives letter by letter, the pen line runs
  var sign = $('[data-sign]'), sphoto = $('[data-sphoto]'), stitle = $('[data-schars]'), sink = $('[data-sink]'), sLen = 0;
  $$('span[lang]', stitle).forEach(split);
  function signUpdate(calm, vh) {
    var r = sign.getBoundingClientRect(), p = calm ? 1 : clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
    if (r.bottom < -50 || r.top > vh + 50) return;
    var e = calm ? 1 : smooth(p / .24), ph = phone();
    sphoto.style.setProperty('--ct', (lerp(ph ? 20 : 16, 0, e)).toFixed(2) + '%');
    sphoto.style.setProperty('--cb', (lerp(ph ? 20 : 16, 0, e)).toFixed(2) + '%');
    sphoto.style.setProperty('--cx', (lerp(ph ? 7 : 24, 0, e)).toFixed(2) + '%');
    sphoto.style.setProperty('--cr', (lerp(26, 0, e)).toFixed(1) + 'px');
    sphoto.style.setProperty('--sc', calm ? 1 : (1.02 + .16 * p).toFixed(4));
    var chs = $$('[lang="' + root.lang + '"] .ch', stitle), n = chs.length || 1;
    chs.forEach(function (ch, i) { ch.style.setProperty('--a', calm ? 1 : smooth((p - .1 - i / n * .14) / .06).toFixed(3)); });
    if (!sLen) { sLen = sink.getTotalLength ? sink.getTotalLength() : 1000; sink.style.strokeDasharray = sLen; }
    sink.style.strokeDashoffset = (sLen * (1 - (calm ? 1 : smooth((p - .2) / .14)))).toFixed(1);
  }

  // ---------------------------------------------------------------- write: the staircase lights, the letter writes itself
  var steps = $$('[data-step]');
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  steps.forEach(function (s, i) { watch(s, function (v) { if (v) lightStep(i); }, { rootMargin: '-38% 0px -38% 0px' }); });
  var topics = $$('[data-topics] button'), nameEl = $('[data-name]'), noteEl = $('[data-note]'), msgEl = $('[data-msg]'), seal = $('[data-lseal]'), shown = '', typing = 0, chatSeen = false;
  function pressSeal() { if (still()) return; seal.classList.remove('press'); void seal.offsetWidth; seal.classList.add('press'); }
  topics.forEach(function (b) { b.addEventListener('click', function () { topics.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); pressSeal(); write(); }); });
  [nameEl, noteEl].forEach(function (f) { f.addEventListener('input', function () { write(); }); });
  function compose() {
    var l = he(), t = topics.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], topic = t.dataset[l ? 'he' : 'en'];
    var nm = nameEl.value.trim(), nt = noteEl.value.trim();
    return l ? 'שלום לירן, ' + (nm ? 'שמי ' + nm + '. ' : '') + 'אשמח להתייעץ איתך לגבי ' + topic + '.' + (nt ? ' בקצרה: ' + nt : '')
             : 'Hello Liran, ' + (nm ? 'my name is ' + nm + '. ' : '') + 'I’d like to consult you about ' + topic + '.' + (nt ? ' In short: ' + nt : '');
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
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
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; if (still()) return; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .5 });

  // ---------------------------------------------------------------- reviews: tap a name; the quotation fills in letter by letter
  var rvs = $$('[data-rv]'), names = $$('[data-rvnames] button'), rvSeen = false;
  rvs.forEach(function (rv) { $$('p > span[lang]', rv).forEach(split); });
  function showRv(k) {
    rvs.forEach(function (rv, i) { rv.classList.toggle('on', i === k); rv.classList.remove('go'); rv.classList.toggle('fill', !still()); });
    names.forEach(function (b, i) { b.setAttribute('aria-selected', i === k ? 'true' : 'false'); });
    if (!still()) requestAnimationFrame(function () { requestAnimationFrame(function () { rvs[k].classList.add('go'); }); });
  }
  names.forEach(function (b, i) { b.addEventListener('click', function () { showRv(i); }); });
  watch($('[data-rvstage]'), function (v) { if (v && !rvSeen) { rvSeen = true; showRv(0); } }, { threshold: .4 });

  // ---------------------------------------------------------------- office: the logo's shield opens like a window onto his street
  var office = $('[data-office]'), ophoto = $('[data-ophoto]'), ostage = $('.o-stage', office);
  var SH = [[-.42, -.42], [0, -.5], [.42, -.42], [.41, .04], [.24, .32], [0, .5], [-.24, .32], [-.41, .04]];
  function officeUpdate(calm, vh) {
    var r = office.getBoundingClientRect();
    if (calm) { ophoto.style.removeProperty('--clip'); ostage.style.removeProperty('--ot'); ophoto.style.removeProperty('--osc'); return; }
    if (r.bottom < -50 || r.top > vh + 50) return;
    var p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1), W = ostage.clientWidth, Hh = ostage.clientHeight;
    var e = smooth((p + .08) / .58), s = lerp(Math.min(W, Hh) * .42, Math.max(W, Hh) * 2.6, e * e), cx = W / 2, cy = Hh * .46;
    ophoto.style.setProperty('--clip', e >= .999 ? 'none' : 'polygon(' + SH.map(function (q) { return (cx + q[0] * s).toFixed(1) + 'px ' + (cy + q[1] * s).toFixed(1) + 'px'; }).join(',') + ')');
    ophoto.style.setProperty('--osc', (1.14 - .12 * p).toFixed(4));
    ostage.style.setProperty('--ot', smooth((p - .5) / .2).toFixed(3));
  }

  // ---------------------------------------------------------------- the red thread: one line that binds the page, with a knot at every chapter
  var thread = $('[data-thread]'), tpath = $('[data-thread-path]'), knots = [], tLen = 0, tMap = [];
  function threadLayout() {
    var pr = page.getBoundingClientRect(), top = pr.top + scrollY, W = page.clientWidth, Hp = page.scrollHeight;
    var m = parseFloat(getComputedStyle(hero).paddingLeft) || 16, x0 = rtl() ? W - Math.max(7, m * .45) : Math.max(7, m * .45), s = rtl() ? -1 : 1;
    thread.setAttribute('viewBox', '0 0 ' + W + ' ' + Hp); thread.style.height = Hp + 'px';
    knots = $$('[data-knot]').filter(function (k) { return !k.closest('.s-stage,.o-stage'); }).map(function (k) {
      var rule = $('.rule', k) || k, rr = rule.getBoundingClientRect(); return { el: k, y: rr.top + rr.height / 2 + scrollY - top, x: rtl() ? rr.right - pr.left : rr.left - pr.left };
    }).sort(function (a, b) { return a.y - b.y; });
    if (!knots.length) return;
    var k0 = knots[0], d = 'M' + k0.x.toFixed(1) + ' ' + k0.y.toFixed(1) + ' L' + x0.toFixed(1) + ' ' + k0.y.toFixed(1), len = Math.abs(x0 - k0.x), y = k0.y, R = 9, loop = 2 * Math.PI * R;
    tMap = [[k0.y, len]]; k0.len = 0;
    knots.slice(1).forEach(function (k) {
      d += ' L' + x0.toFixed(1) + ' ' + k.y.toFixed(1); len += k.y - y; y = k.y; tMap.push([y, len]); k.len = len;
      d += ' a' + R + ' ' + R + ' 0 1 ' + (s > 0 ? 1 : 0) + ' ' + (s * 2 * R) + ' 0 a' + R + ' ' + R + ' 0 1 ' + (s > 0 ? 1 : 0) + ' ' + (-s * 2 * R) + ' 0';
      len += loop; tMap.push([y, len]);
    });
    var yEnd = Hp - 30; d += ' L' + x0.toFixed(1) + ' ' + yEnd.toFixed(1); len += yEnd - y; tMap.push([yEnd, len]);
    tpath.setAttribute('d', d); tLen = len; tpath.style.strokeDasharray = tLen.toFixed(1);
    page._top = top;
  }
  function threadUpdate(calm, vh) {
    if (!tLen) return;
    var yT = scrollY + vh * .64 - page._top, L = 0;
    if (calm) L = tLen;
    else if (yT <= tMap[0][0]) L = 0;
    else { L = tLen; for (var i = 1; i < tMap.length; i++) if (yT < tMap[i][0]) { var a = tMap[i - 1], b = tMap[i]; L = b[0] === a[0] ? b[1] : lerp(a[1], b[1], (yT - a[0]) / (b[0] - a[0])); break; } }
    if (!calm && hero.classList.contains('ready')) L = Math.max(L, 1);
    tpath.style.strokeDashoffset = (tLen - L).toFixed(1);
    knots.forEach(function (k, i) { k.el.classList.toggle('knot-on', calm || (i === 0 ? hero.classList.contains('ready') : L >= k.len - 2)); });
  }

  // ---------------------------------------------------------------- one scroll loop
  var dock = $('[data-dock]'), fh = $('.f-horizon'), ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    dock.classList.toggle('show', scrollY > hero.offsetHeight * .55);
    signUpdate(calm, vh); officeUpdate(calm, vh); threadUpdate(calm, vh);
    if (pending.length) pending = pending.filter(function (el) { if (el.classList.contains('in')) return false; if (el.getBoundingClientRect().top < vh * .94) { el.classList.add('in'); return false; } return true; });
    var fr = foot.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / fr.height);
    fh.style.setProperty('--rise', ((1 - fp) * 110).toFixed(1) + 'px');
    if (!calm) { arc.kick(); }
  }
  function layout() { dust.size(); fdust.size(); engrave.size(); sLen = 0; threadLayout(); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (innerWidth !== lw || !phone()) { lw = innerWidth; layout(); } else tick(); }, 140); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true);
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); layout(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 900);
  addEventListener('load', function () { layout(); });
  if (window.ResizeObserver) { var ro = new ResizeObserver(function () { clearTimeout(ro._t); ro._t = setTimeout(threadLayout, 200); }); ro.observe(page); }
})();
