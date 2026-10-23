(function () {
  var root = document.documentElement, WA = '972525221010';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var TITLE = { he: 'שלו · שירותים למחשבים ולתקשורת · הרץ היינריך 2, חיפה', en: 'Shalev · Computer & network services · 2 Heinrich Hertz St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור שלו – מתן שירותים למחשבים ותקשורת · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Shalev Computer & Network Services · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'שלו – מתן שירותים למחשבים', 'Shalev Computer Services');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-nodes]', 'מה צריך טיפול', 'What needs care');
    aria('[data-t-where]', 'איפה', 'Where');
    aria('[data-t-call]', 'התקשרו לעמרי, 052-522-1010', 'Call Omri, 052-522-1010');
    aria('[data-t-wa]', 'וואטסאפ לעמרי', 'WhatsApp Omri');
    $$('[data-node]').forEach(function (n) { $('.nl', n).textContent = n.dataset[l === 'he' ? 'he' : 'en'].replace(/^./, function (c) { return c.toUpperCase(); }); });
    $$('.spot').forEach(function (s) { var t = s.dataset[l]; s.setAttribute('aria-label', t); if (s.classList.contains('on')) $('.tag', s).textContent = t; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('sh-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('sh-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    layout(); ring.kick(); brain.kick(); lattice.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8, 20], 1: [8, 20], 2: [8, 20], 3: [8, 20], 4: [8, 20], 5: [8, 20], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
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
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances (tiles staggered by their place in the grid)
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 70 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 12 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- the logo's grid: lit under the hand, twinkling by itself
  var lattice = (function () {
    var cv = $('[data-lattice]'), c = cv.getContext('2d'), cell = 46, cols, rows, lit, w, h, raf = 0, vis = true, px = -1, py = -1;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / cell); rows = Math.ceil(h / cell); lit = new Float32Array(cols * rows);
    }
    function draw() {
      c.clearRect(0, 0, w, h);
      c.strokeStyle = 'rgba(154,157,255,.07)'; c.lineWidth = 1; c.beginPath();
      for (var x = 0; x <= cols; x++) { c.moveTo(x * cell + .5, 0); c.lineTo(x * cell + .5, h); }
      for (var y = 0; y <= rows; y++) { c.moveTo(0, y * cell + .5); c.lineTo(w, y * cell + .5); }
      c.stroke();
      for (var k = 0; k < lit.length; k++) if (lit[k] > .02) {
        c.fillStyle = (k % 3 ? 'rgba(98,198,224,' : 'rgba(120,124,255,') + (lit[k] * .3).toFixed(3) + ')';
        c.fillRect((k % cols) * cell + 1, Math.floor(k / cols) * cell + 1, cell - 1, cell - 1);
      }
    }
    function light(x, y, v) { var cx = Math.floor(x / cell), cy = Math.floor(y / cell); if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) return; var k = cy * cols + cx; lit[k] = Math.max(lit[k], v); }
    function frame() {
      raf = 0; if (!vis || still()) { draw(); return; }
      for (var k = 0; k < lit.length; k++) lit[k] *= .93;
      if (Math.random() < .4) lit[Math.floor(Math.random() * lit.length)] = .5 + Math.random() * .5;
      if (px >= 0) { light(px, py, 1); light(px + cell, py, .5); light(px - cell, py, .5); light(px, py + cell, .5); light(px, py - cell, .5); }
      draw(); raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { px = -1; });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: function () { size(); draw(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- the circuit brain behind the slogan, made of the real logo's own pixels
  var brain = (function () {
    var cv = $('[data-brainfield]'), c = cv.getContext('2d'), img = $('[data-brainsrc]');
    var P = [], w, h, raf = 0, vis = true, t0 = 0, mx = -999, my = -999, pulses = [], lastPulse = 0, ok = false;
    function sample() {
      try {
        var sc = document.createElement('canvas'), iw = 380, ih = 304; sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data, pts = [];
        for (var y = 0; y < ih; y += 2) for (var x = 0; x < iw; x += 2) {
          var k = (y * iw + x) * 4, diff = Math.abs(d[k] - 32) + Math.abs(d[k + 1] - 35) + Math.abs(d[k + 2] - 52);
          if (diff > 90) pts.push([x / iw, y / ih, 'rgb(' + d[k] + ',' + d[k + 1] + ',' + d[k + 2] + ')']);
        }
        var want = phone() ? 1500 : 3000, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) { var q = pts[Math.floor(f)]; P.push({ hx: q[0], hy: q[1], col: q[2], x: Math.random(), y: Math.random(), vx: 0, vy: 0, ph: Math.random() * 6.28, dl: Math.random() * .7, rx: Math.random() - .5, ry: Math.random() }); }
        ok = true;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); P.forEach(function (p) { p.sx = undefined; }); }
    function frame(now) {
      raf = 0; if (!ok) return;
      var calm = still(), T = (now - t0) / 1000;
      var hr = hero.getBoundingClientRect(), burst = calm ? 0 : clamp(-hr.top / (hr.height * .7), 0, 1.2);
      // the brain sits behind the slogan, large and quiet; the slogan stays readable over it
      var bw = Math.min(w * (phone() ? .95 : .62), 860), bh = bw * 304 / 380, ox = (w - bw) / 2, oy = Math.max(10, h * (phone() ? .02 : .04));
      if (!calm && now - lastPulse > 700 && T > 1.6) { lastPulse = now; var o = P[Math.floor(Math.random() * P.length)]; pulses.push({ x: ox + o.hx * bw, y: oy + o.hy * bh, t: now }); }
      pulses = pulses.filter(function (p) { return now - p.t < 1400; });
      c.clearRect(0, 0, w, h); c.globalCompositeOperation = 'lighter';
      var sz = phone() ? 2 : 2.4;
      for (var i = 0; i < P.length; i++) {
        var p = P[i], a = calm ? 1 : smooth((T - p.dl) / 1.3);
        var tx = ox + p.hx * bw + Math.sin(T * 1.3 + p.ph) * 1.4, ty = oy + p.hy * bh + Math.cos(T * 1.1 + p.ph) * 1.4;
        if (burst > 0) { tx += p.rx * burst * w * .9; ty += p.ry * burst * h * 1.1; }
        if (calm) { p.x = tx; p.y = ty; }
        else if (a < 1) { if (p.sx === undefined) { p.sx = p.x * w; p.sy = p.y * h; } p.x = lerp(p.sx, tx, a); p.y = lerp(p.sy, ty, a); }
        else {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 10000) { var f = (10000 - d2) / 10000 * 2.6, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
          p.vx += (tx - p.x) * .06; p.vy += (ty - p.y) * .06; p.vx *= .82; p.vy *= .82; p.x += p.vx; p.y += p.vy;
        }
        var glow = 0;
        for (var k = 0; k < pulses.length; k++) { var pu = pulses[k], r = (now - pu.t) * .26, ddx = p.x - pu.x, ddy = p.y - pu.y, dist = Math.sqrt(ddx * ddx + ddy * ddy); if (Math.abs(dist - r) < 9) glow = Math.max(glow, 1 - (now - pu.t) / 1400); }
        c.globalAlpha = (glow ? .95 : .42) * (1 - clamp(burst, 0, 1) * .7);
        c.fillStyle = glow ? '#bfeaf6' : p.col;
        var s = glow ? sz + 1.2 : sz; c.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() { size(); sample(); t0 = performance.now(); kick(); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) { var r = hero.getBoundingClientRect(); pulses.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }); });
    watch(hero, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // ---------------------------------------------------------------- the arc of his cards: turns by itself, with the scroll and with a drag
  var ring = (function () {
    var wrap = $('[data-ringwrap]'), el = $('[data-ring]');
    $$('.rc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); el.appendChild(k); });   // twelve cards make a wide, gentle arc
    var cards = $$('.rc', el), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = true, last = 0;
    function R() { var cw = cards[0].offsetWidth || 180; return Math.max(cw * 1.12 / (2 * Math.tan(Math.PI / N)), phone() ? 280 : innerWidth * .42); }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (8 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var r = R(), sc = scrollY * .06 * (rtl() ? 1 : -1);
      cards.forEach(function (c, i) {
        var a = rot + sc + i * step, f = Math.cos(a * Math.PI / 180), lift = f > .95 ? (f - .95) * 20 : 0;
        c.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + (r + lift * 46).toFixed(1) + 'px) scale(' + (1 + lift * .06).toFixed(3) + ')';
        c.style.filter = 'brightness(' + (.3 + .7 * Math.pow(Math.max(f, 0), 1.6)).toFixed(3) + ')';
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    el.style.transform = 'rotateX(-7deg)';
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .25; vel = dx * 2 * (rtl() ? 1 : -1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // ticker: two copies so the loop is seamless
  var tk = $('[data-ticker]'); tk.innerHTML += tk.innerHTML;

  // the hero dissolves into the next section in square pixels, like the dissolve on the logo's own brain
  var pxBox = $('[data-px]'), pxCells = [];
  function buildPx() {
    pxBox.innerHTML = ''; pxCells = [];
    var w = hero.clientWidth, s = Math.max(28, Math.round(w / 26)), cols = Math.ceil(w / s);
    for (var r = 0; r < 5; r++) for (var c = 0; c < cols; c++) {
      var i = document.createElement('i');
      i.style.cssText = 'width:' + (s + 1) + 'px;height:' + (s + 1) + 'px;left:' + (c * s) + 'px;bottom:' + (r * s) + 'px';
      i.dataset.th = (r * .19 + Math.random() * .32 + .02).toFixed(3);
      pxBox.appendChild(i); pxCells.push(i);
    }
  }

  // ---------------------------------------------------------------- Omri: the deck is dealt, the portrait comes to the front
  var deal = $('[data-deal]'), deck = $('[data-deck]'), cards = $$('.card', deck), ROT = [-7, 5, -3, 8, -2];
  function dealDeck(p) {
    var W = deck.clientWidth, Hh = deck.clientHeight, e = still() ? 1 : smooth((p - .05) / .5), g = still() ? 1 : smooth((p - .45) / .3), side = rtl() ? 1 : -1;
    cards.forEach(function (cd, i) {
      var last = i === cards.length - 1, x, y, r, s;
      if (last) { x = lerp(0, side * W * .04, g); y = lerp(0, Hh * .14, g); r = lerp(ROT[i], -2, e); s = lerp(1, 1.08, g); }
      else { x = lerp(0, (i - 1.5) * W * .2, e); y = lerp(i * -3, Math.abs(i - 1.5) * Hh * .05 - Hh * .17, e); r = lerp(ROT[i], (i - 1.5) * 10, e); s = lerp(1, .78, g); }
      cd.style.transform = 'translate(-50%,-50%) translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + r.toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')';
      cd.style.zIndex = last ? 10 : i;
    });
  }

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');    // numerals come from CSS so only the real number is text (aria-label on the wrapper)
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 4) % 10; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- bento: living tiles, a spotlight under the hand, packets on the network
  var svc = $('#services'), svcOn = false;
  watch(svc, function (v) { svcOn = v; svc.classList.toggle('on', v); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  function packet(g, a, b, dur, r) {
    var c = document.createElementNS(NS, 'circle'); c.setAttribute('r', r || 4); g.appendChild(c);
    var t0 = performance.now();
    (function st(t) { var u = smooth((t - t0) / dur); c.setAttribute('cx', lerp(a[0], b[0], u)); c.setAttribute('cy', lerp(a[1], b[1], u)); if (u < 1) requestAnimationFrame(st); else c.remove(); })(t0);
  }
  var pk = $('[data-pk]'), ends = [[60, 50], [60, 210], [340, 50], [340, 210], [200, 28], [200, 232], [40, 130], [360, 130]];
  setInterval(function () { if (!svcOn || still()) return; var e = ends[Math.floor(Math.random() * ends.length)]; Math.random() < .5 ? packet(pk, e, [200, 130], 800, 5) : packet(pk, [200, 130], e, 800, 5); }, 300);

  // ---------------------------------------------------------------- cameras: a live wall that zooms into one feed and labels the job
  var cams = $('[data-cams]'), wall = $('[data-wall]'), hot = $('[data-hot]'), wfig = $('[data-wfig]'), spots = $$('.spot'), clock = $('[data-clock]'), camsOn = false;
  watch(cams, function (v) { camsOn = v; cams.classList.toggle('on', v); });
  setInterval(function () { if (!camsOn) return; var o = nowParts(); clock.textContent = ((o.hour % 24) < 10 ? '0' : '') + (o.hour % 24) + ':' + o.minute + ':' + o.second; }, 1000);
  function placeSpots() {
    var W = wfig.clientWidth, Hh = wfig.clientHeight, iw = 1100, ih = 2062, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s, ox = (W - dw) * .5, oy = (Hh - dh) * .3;
    spots.forEach(function (sp) {
      var x = ox + dw * +sp.dataset.x, y = oy + dh * +sp.dataset.y;
      sp.style.left = x + 'px'; sp.style.top = y + 'px';
      sp.classList.toggle('flip', x > W * .58);
      sp.hidden = x < 10 || x > W - 10 || y < 10 || y > Hh - 10;
    });
  }
  function typeTag(sp, on) {
    var tag = $('.tag', sp), txt = sp.dataset[he() ? 'he' : 'en'];
    if (on === sp.classList.contains('on')) return;
    sp.classList.toggle('on', on); clearInterval(sp._t);
    if (!on) { tag.textContent = ''; return; }
    if (still()) { tag.textContent = txt; return; }
    var i = 0; tag.textContent = '';
    sp._t = setInterval(function () { tag.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(sp._t); }, 34);
  }
  var hoverSpot = null;
  spots.forEach(function (sp) {
    sp.addEventListener('mouseenter', function () { hoverSpot = sp; typeTag(sp, true); });
    sp.addEventListener('mouseleave', function () { hoverSpot = null; tick(); });
    sp.addEventListener('click', function () { typeTag(sp, !sp.classList.contains('on')); sp._pinned = sp.classList.contains('on'); });
  });

  // ---------------------------------------------------------------- how: the live network, the steps and the chat that writes itself
  var how = $('#how'), howOn = false, map = $('[data-map]'), wires = $('[data-wires]'), hub = $('[data-hub]'), nodes = $$('[data-node]'), lines = [], hubPos = [0, 0], nodePos = [];
  watch(how, function (v) { howOn = v; how.classList.toggle('on', v); });
  var steps = $$('[data-step]');
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  nodes.forEach(function (n, i) {
    var ln = document.createElementNS(NS, 'line'); wires.appendChild(ln); lines.push(ln);
    n.addEventListener('click', function () {
      var on = n.getAttribute('aria-pressed') !== 'true';
      n.setAttribute('aria-pressed', on ? 'true' : 'false'); ln.classList.toggle('on', on);
      if (on && !still()) { packet(wires, nodePos[i], hubPos, 600, 7); setTimeout(function () { packet(wires, nodePos[i], hubPos, 600, 7); }, 160); }
      lightStep(0); write();
    });
  });
  function mapLayout() {
    var W = map.clientWidth, Hh;
    if (innerWidth <= 900) {
      var top = 70, gap = 78; Hh = top + 80 + 4 * gap; map.style.height = Hh + 'px';
      hubPos = [W / 2, top];
      nodePos = nodes.map(function (n, i) { var col = i % 2, row = Math.floor(i / 2); return [W * (rtl() ? (col ? .26 : .74) : (col ? .74 : .26)), top + 110 + row * gap]; });
    } else {
      map.style.height = ''; Hh = map.clientHeight; hubPos = [W / 2, Hh / 2];
      var rx = Math.max(60, Math.min(W * .5 - 80, 300)), ry = Hh * .38;
      nodePos = nodes.map(function (n, i) { var a = -Math.PI / 2 + i * Math.PI * 2 / nodes.length; return [W / 2 + Math.cos(a) * rx * (rtl() ? -1 : 1), Hh / 2 + Math.sin(a) * ry]; });
    }
    hub.style.left = hubPos[0] + 'px'; hub.style.top = hubPos[1] + 'px';
    nodes.forEach(function (n, i) {
      n.style.left = nodePos[i][0] + 'px'; n.style.top = nodePos[i][1] + 'px';
      var l = lines[i]; l.setAttribute('x1', hubPos[0]); l.setAttribute('y1', hubPos[1]); l.setAttribute('x2', nodePos[i][0]); l.setAttribute('y2', nodePos[i][1]);
    });
  }
  setInterval(function () { if (!howOn || still() || !nodePos.length) return; var i = Math.floor(Math.random() * nodes.length); Math.random() < .5 ? packet(wires, nodePos[i], hubPos, 700) : packet(wires, hubPos, nodePos[i], 700); }, 420);
  if (io) steps.forEach(function (s, i) { new IntersectionObserver(function (es) { if (es[0].isIntersecting && i === 0) lightStep(0); }, { rootMargin: '-30% 0px -30% 0px' }).observe(s); });
  var where = $$('[data-where]'), msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
  where.forEach(function (b) { b.addEventListener('click', function () { where.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lightStep(1); write(); }); });
  $('[data-send]').addEventListener('pointerenter', function () { lightStep(2); });
  $('[data-send]').addEventListener('focus', function () { lightStep(2); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = nodes.filter(function (n) { return n.getAttribute('aria-pressed') === 'true'; }).map(function (n) { return n.dataset[l ? 'he' : 'en']; });
    var w = where.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], place = w.dataset[l ? 'he' : 'en'];
    return l ? 'שלום עמרי, אשמח לעזרה עם ' + (picked.length ? list(picked, true) : 'המחשב') + '. איפה: ' + place + '.'
             : 'Hi Omri, I’d like help with ' + (picked.length ? 'the ' + list(picked, false) : 'my computer') + '. Where: ' + place + '.';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 16);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- reviews pile, contact, footer horizon
  var revs = $('[data-revs]'), rvs = $$('.rv', revs), dots = $$('[data-rdots] i'), RR = [-2.5, 1.8, -1.2, 2.2, -1.6];
  var reach = $('.r-wrap'), rphoto = $('[data-rphoto]'), rows = $$('[data-rows] > *'), fh = $('.f-horizon');

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) { brain.kick(); ring.kick(); }
    // pixel seam
    var hr = hero.getBoundingClientRect(), pp0 = calm ? 0 : clamp(-hr.top / (hr.height * .55), 0, 1.4);
    pxCells.forEach(function (c) { c.classList.toggle('on', !calm && pp0 > +c.dataset.th); });
    // deck
    dealDeck(calm ? 1 : prog(deal));
    // cctv zoom
    var cp = calm ? 1 : prog(cams), e = calm ? 0 : smooth((cp - .12) / .45);
    if (!calm) {
      var W = cams.clientWidth, Hs = vh, tx0 = hot.offsetLeft, ty0 = hot.offsetTop, tw = hot.offsetWidth, th = hot.offsetHeight;
      var S = Math.max(W / tw, Hs / th) * 1.02, cx = tx0 + tw / 2, cy = ty0 + th / 2;
      wall.style.transform = 'translate3d(' + lerp(0, W / 2 - cx * S, e).toFixed(1) + 'px,' + lerp(0, Hs / 2 - cy * S, e).toFixed(1) + 'px,0) scale(' + lerp(1, S, e).toFixed(4) + ')';
      var f = smooth((e - .78) / .22); wfig.style.opacity = f.toFixed(3); wfig.classList.toggle('show', f > .5);
    } else { wall.style.transform = ''; wfig.style.opacity = ''; }
    spots.forEach(function (sp, i) { if (sp === hoverSpot || sp._pinned) return; typeTag(sp, calm || cp > .64 + i * .07); });
    // reviews land one over another
    var pr = calm ? 1 : prog(revs), seg = .9 / (rvs.length - 1);
    rvs.forEach(function (rv, i) {
      if (calm) { rv.style.transform = ''; rv.style.filter = ''; return; }
      var t = i === 0 ? 1 : smooth((pr - .04 - (i - 1) * seg) / (seg * .85)), above = 0;
      for (var j = i + 1; j < rvs.length; j++) above += smooth((pr - .04 - (j - 1) * seg) / (seg * .85));
      rv.style.transform = 'translateY(' + ((1 - t) * 118).toFixed(2) + '%) rotate(' + lerp(10, RR[i], t).toFixed(2) + 'deg) scale(' + (1 - Math.min(above, 3) * .04).toFixed(3) + ')';
      rv.style.filter = above ? 'brightness(' + (1 - Math.min(above, 3) * .15).toFixed(3) + ')' : '';
      if (dots[i]) dots[i].classList.toggle('on', t > .5);
    });
    // contact: the photo shrinks into its frame, the cards rise beside it
    var kp = calm ? 1 : prog(reach), s2 = calm ? 1 : smooth(kp / .5);
    if (!calm) {
      var PW = rphoto.clientWidth, PH = rphoto.clientHeight, t1, b1, st, en;
      if (innerWidth <= 800) { t1 = 70; b1 = PH * .62; st = 16; en = 16; } else { t1 = PH * .14; b1 = PH * .1; st = PW * .58; en = PW * .04; }
      var L = rtl() ? en : st, Rr = rtl() ? st : en;
      rphoto.style.setProperty('--pt', (t1 * s2).toFixed(1) + 'px'); rphoto.style.setProperty('--pb', (b1 * s2).toFixed(1) + 'px');
      rphoto.style.setProperty('--pl', (L * s2).toFixed(1) + 'px'); rphoto.style.setProperty('--pr', (Rr * s2).toFixed(1) + 'px'); rphoto.style.setProperty('--pr2', (22 * s2).toFixed(1) + 'px');
    }
    rows.forEach(function (r, i) { var v = calm ? 1 : smooth((s2 - .6 - i * .05) / .14); r.style.opacity = calm ? '' : v.toFixed(3); r.style.transform = calm || v >= 1 ? '' : 'translateY(' + ((1 - v) * 26).toFixed(1) + 'px)'; });
    // the footer horizon rises as you arrive
    var fr = fh.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / fr.height);
    fh.style.setProperty('--rise', ((1 - fp) * 90).toFixed(1) + 'px');
  }

  function layout() { lattice.size(); brain.size(); buildPx(); placeSpots(); mapLayout(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); lattice.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { placeSpots(); mapLayout(); tick(); });
})();
