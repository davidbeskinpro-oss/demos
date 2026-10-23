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
    aria('[data-t-round]', 'וואטסאפ לעמרי', 'WhatsApp Omri');
    aria('[data-t-call]', 'התקשרו לעמרי, 052-522-1010', 'Call Omri, 052-522-1010');
    aria('[data-t-wa]', 'וואטסאפ לעמרי', 'WhatsApp Omri');
    $$('[data-node]').forEach(function (n) { $('.nl', n).textContent = n.dataset[l === 'he' ? 'he' : 'en'].replace(/^./, function (c) { return c.toUpperCase(); }); });
    $$('.spot').forEach(function (s) { var t = s.dataset[l]; s.setAttribute('aria-label', t); if (s.classList.contains('on')) $('.tag', s).textContent = t; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('sh-lang', l); } catch (e) {}
    texts(l); hours(); write(); layout();
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
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    layout(); brain.kick(); lattice.kick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8, 20], 1: [8, 20], 2: [8, 20], 3: [8, 20], 4: [8, 20], 5: [8, 20], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return o;
  }
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

  // ---------------------------------------------------------------- entrances
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 9 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // ---------------------------------------------------------------- the logo's grid, lit under the hand and twinkling
  var hero = $('[data-hero]');
  var lattice = (function () {
    var cv = $('[data-lattice]'), c = cv.getContext('2d'), cell = 46, cols, rows, lit, w, h, dpr, raf = 0, vis = true, px = -1, py = -1;
    function size() {
      dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
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
        c.fillStyle = 'rgba(120,124,255,' + (lit[k] * .32).toFixed(3) + ')';
        c.fillRect((k % cols) * cell + 1, Math.floor(k / cols) * cell + 1, cell - 1, cell - 1);
      }
    }
    function light(x, y, v) { var cx = Math.floor(x / cell), cy = Math.floor(y / cell); if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) return; var k = cy * cols + cx; lit[k] = Math.max(lit[k], v); }
    function frame() {
      raf = 0; if (!vis || still()) { draw(); return; }
      for (var k = 0; k < lit.length; k++) lit[k] *= .93;
      if (Math.random() < .35) lit[Math.floor(Math.random() * lit.length)] = .5 + Math.random() * .5;
      if (px >= 0) { light(px, py, 1); light(px + cell, py, .5); light(px - cell, py, .5); light(px, py + cell, .5); light(px, py - cell, .5); }
      draw(); raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { px = -1; });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: function () { size(); draw(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- the circuit brain, made of the real logo's own pixels
  var brainEl = $('[data-brain]');
  var brain = (function () {
    var cv = $('canvas', brainEl), c = cv.getContext('2d'), img = $('.brain-still', brainEl);
    var P = [], w, h, dpr, raf = 0, vis = true, t0 = 0, mx = -999, my = -999, pulses = [], lastPulse = 0, ok = false;
    function sample() {
      try {
        var sc = document.createElement('canvas'), iw = 380, ih = 304; sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data, pts = [];
        for (var y = 0; y < ih; y += 2) for (var x = 0; x < iw; x += 2) {
          var k = (y * iw + x) * 4, diff = Math.abs(d[k] - 32) + Math.abs(d[k + 1] - 35) + Math.abs(d[k + 2] - 52);
          if (diff > 90) pts.push([x / iw, y / ih, d[k], d[k + 1], d[k + 2]]);
        }
        var want = phone() ? 1700 : 3400, step = Math.max(1, pts.length / want);
        P = [];
        for (var f = 0; f < pts.length; f += step) {
          var q = pts[Math.floor(f)];
          P.push({ hx: q[0], hy: q[1], col: 'rgb(' + q[2] + ',' + q[3] + ',' + q[4] + ')', x: Math.random(), y: Math.random() * 1.4 - .2, vx: 0, vy: 0, ph: Math.random() * 6.28, dl: Math.random() * .7, rx: Math.random() - .5, ry: Math.random() });
        }
        ok = true;
      } catch (e) { ok = false; brainEl.classList.add('fallback'); }
    }
    function size() { dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(now) {
      raf = 0; if (!ok) return;
      var calm = still(), T = (now - t0) / 1000;
      var hr = hero.getBoundingClientRect(), burst = calm ? 0 : clamp(-hr.top / (hr.height * .75), 0, 1.2);
      // the drawing area: the logo fitted into the canvas with a margin
      var pad = .09, bw = w * (1 - 2 * pad), bh = bw * 304 / 380; if (bh > h * (1 - 2 * pad)) { bh = h * (1 - 2 * pad); bw = bh * 380 / 304; }
      var ox = (w - bw) / 2, oy = (h - bh) / 2;
      if (!calm && now - lastPulse > 850 && T > 1.6) { lastPulse = now; var o = P[Math.floor(Math.random() * P.length)]; pulses.push({ x: ox + o.hx * bw, y: oy + o.hy * bh, t: now }); }
      pulses = pulses.filter(function (p) { return now - p.t < 1300; });
      c.clearRect(0, 0, w, h);
      c.globalCompositeOperation = 'lighter';
      var sz = phone() ? 2.3 : 2.7;
      for (var i = 0; i < P.length; i++) {
        var p = P[i], a = calm ? 1 : smooth((T - p.dl) / 1.3);
        var tx = ox + p.hx * bw + Math.sin(T * 1.3 + p.ph) * 1.4, ty = oy + p.hy * bh + Math.cos(T * 1.1 + p.ph) * 1.4;
        if (burst > 0) { tx += p.rx * burst * w * .9; ty += p.ry * burst * h * 1.1; }
        if (calm) { p.x = tx; p.y = ty; }
        else {
          if (a < 1) { p.x = lerp(p.sx === undefined ? (p.sx = p.x * w) : p.sx, tx, a); p.y = lerp(p.sy === undefined ? (p.sy = p.y * h) : p.sy, ty, a); }
          else {
            var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
            if (d2 < 9000) { var f = (9000 - d2) / 9000 * 2.6, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
            p.vx += (tx - p.x) * .06; p.vy += (ty - p.y) * .06; p.vx *= .82; p.vy *= .82; p.x += p.vx; p.y += p.vy;
          }
        }
        var glow = 0;
        for (var k = 0; k < pulses.length; k++) { var pu = pulses[k], r = (now - pu.t) * .26, ddx = p.x - pu.x, ddy = p.y - pu.y, dist = Math.sqrt(ddx * ddx + ddy * ddy); if (Math.abs(dist - r) < 9) glow = Math.max(glow, 1 - (now - pu.t) / 1300); }
        c.globalAlpha = (glow ? 1 : .78) * (1 - clamp(burst, 0, 1) * .75);
        c.fillStyle = glow ? '#ffffff' : p.col;
        var s = glow ? sz + 1.4 : sz;
        c.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!ok) return; if (!raf) raf = requestAnimationFrame(frame); }
    function start() { size(); sample(); t0 = performance.now(); kick(); }
    brainEl.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    brainEl.addEventListener('pointerleave', function () { mx = my = -999; });
    brainEl.addEventListener('pointerdown', function (e) { var r = cv.getBoundingClientRect(); pulses.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }); mx = e.clientX - r.left; my = e.clientY - r.top; setTimeout(function () { mx = my = -999; }, 500); });
    watch(hero, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { size: function () { if (ok) { size(); kick(); } }, kick: kick };
  })();

  // ticker: two copies so the loop is seamless
  var tk = $('[data-ticker]'); tk.innerHTML += tk.innerHTML;

  // ---------------------------------------------------------------- Omri: the deck is dealt, the portrait comes to the front
  var deal = $('[data-deal]'), deck = $('[data-deck]'), cards = $$('.card', deck);
  var ROT = [-7, 5, -3, 8, -2];
  function dealDeck(p) {
    var W = deck.clientWidth, Hh = deck.clientHeight, e = still() ? 1 : smooth((p - .05) / .5), g = still() ? 1 : smooth((p - .45) / .3);
    var side = rtl() ? 1 : -1;
    cards.forEach(function (cd, i) {
      var last = i === cards.length - 1, x, y, r, s;
      var fx = (i - 1.5) * W * .19, fy = Math.abs(i - 1.5) * Hh * .06 - Hh * .2, fr = (i - 1.5) * 11;
      if (last) { x = lerp(0, side * W * .04, g); y = lerp(0, Hh * .17, g); r = lerp(ROT[i], -2, e); s = lerp(1, 1.06, g); }
      else { x = lerp(0, fx, e); y = lerp(i * -3, fy, e); r = lerp(ROT[i], fr, e); s = lerp(1, .74, g); }
      cd.style.transform = 'translate(-50%,-50%) translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + r.toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')';
      cd.style.zIndex = last ? 10 : i;
    });
  }

  // ---------------------------------------------------------------- services: the rail slides sideways with the scroll
  var rail = $('[data-rail]'), track = $('[data-track]');
  function railSize() {
    if (still()) { rail.style.height = ''; track.style.transform = ''; return; }
    var over = Math.max(0, track.scrollWidth - innerWidth);
    rail.style.height = (innerHeight + over + innerHeight * .25) + 'px';
  }
  watch(rail, function (v) { rail.classList.toggle('on', v); });

  // ---------------------------------------------------------------- cameras: a live wall that zooms into one feed
  var cams = $('[data-cams]'), wall = $('[data-wall]'), hot = $('[data-hot]'), wfig = $('[data-wfig]'), spots = $$('.spot'), clock = $('[data-clock]'), camsOn = false;
  watch(cams, function (v) { camsOn = v; cams.classList.toggle('on', v); });
  setInterval(function () { if (!camsOn) return; var o = nowParts(); clock.textContent = (o.hour % 24 < 10 ? '0' : '') + (o.hour % 24) + ':' + o.minute + ':' + o.second; }, 1000);
  function placeSpots() {
    var W = wfig.clientWidth, Hh = wfig.clientHeight, iw = 1100, ih = 2062, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s;
    var ox = (W - dw) * .5, oy = (Hh - dh) * .3;
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

  // ---------------------------------------------------------------- reviews: odometers and a pile that lands
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');    // numerals come from CSS so only the real number is text (aria-label on the wrapper)
    o.setAttribute('role', 'img');
  });
  function roll(o, go) {
    $$('.d[data-to]', o).forEach(function (d, i) {
      var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 4) % 10;
      s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms';
      s.style.transform = 'translateY(' + (-to * 10) + '%)';
    });
  }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });
  var revs = $('[data-revs]'), rvs = $$('.rv', revs), RR = [-2.5, 1.8, -1.2];

  // ---------------------------------------------------------------- the network map (the live thing)
  var net = $('#net'), map = $('[data-map]'), wires = $('[data-wires]'), hub = $('[data-hub]'), nodes = $$('[data-node]'), lines = [], NS = 'http://www.w3.org/2000/svg';
  var hubPos = [0, 0], nodePos = [], netOn = false;
  nodes.forEach(function (n, i) {
    var ln = document.createElementNS(NS, 'line'); wires.appendChild(ln); lines.push(ln);
    n.addEventListener('click', function () {
      var on = n.getAttribute('aria-pressed') !== 'true';
      n.setAttribute('aria-pressed', on ? 'true' : 'false'); ln.classList.toggle('on', on);
      if (on) { packet(i, 7); packet(i, 7, 160); }
      write();
    });
  });
  function mapLayout() {
    var W = map.clientWidth, Hh;
    if (innerWidth <= 900 && phone()) {
      var top = 70, gap = 80; Hh = top + 80 + 4 * gap; map.style.height = Hh + 'px';
      hubPos = [W / 2, top];
      nodePos = nodes.map(function (n, i) { var col = i % 2, row = Math.floor(i / 2); return [W * (rtl() ? (col ? .25 : .75) : (col ? .75 : .25)), top + 110 + row * gap]; });
    } else {
      map.style.height = ''; Hh = map.clientHeight; hubPos = [W / 2, Hh / 2];
      var rx = Math.max(60, Math.min(W * .5 - 90, 420)), ry = Hh * .4;
      nodePos = nodes.map(function (n, i) { var a = -Math.PI / 2 + i * Math.PI * 2 / nodes.length; return [W / 2 + Math.cos(a) * rx * (rtl() ? -1 : 1), Hh / 2 + Math.sin(a) * ry]; });
    }
    hub.style.left = hubPos[0] + 'px'; hub.style.top = hubPos[1] + 'px';
    nodes.forEach(function (n, i) {
      n.style.left = nodePos[i][0] + 'px'; n.style.top = nodePos[i][1] + 'px';
      var l = lines[i]; l.setAttribute('x1', hubPos[0]); l.setAttribute('y1', hubPos[1]); l.setAttribute('x2', nodePos[i][0]); l.setAttribute('y2', nodePos[i][1]);
    });
  }
  function packet(i, r, delay) {
    if (still()) return;
    setTimeout(function () {
      var c = document.createElementNS(NS, 'circle'); c.setAttribute('r', r || 4); wires.appendChild(c);
      var t0 = performance.now(), a = hubPos, b = nodePos[i], back = Math.random() < .5 && !r;
      (function step(now) {
        var t = smooth((now - t0) / 700), u = back ? 1 - t : t;
        c.setAttribute('cx', lerp(b[0], a[0], u)); c.setAttribute('cy', lerp(b[1], a[1], u));
        if (t < 1) requestAnimationFrame(step); else c.remove();
      })(t0);
    }, delay || 0);
  }
  // data keeps flowing while the map is on screen
  setInterval(function () { if (netOn && !still()) packet(Math.floor(Math.random() * nodes.length)); }, 420);
  function scramble() {
    var pool = he() ? 'אבגדהוזחטיכלמנסעפצקרשת' : 'abcdefghijklmnopqrstuvwxyz';
    nodes.forEach(function (n, j) {
      var el = $('.nl', n), txt = el.textContent, start = performance.now() + j * 70;
      (function step(now) {
        var p = clamp((now - start) / 640, 0, 1), k = Math.floor(p * txt.length), out = txt.slice(0, k);
        for (var q = k; q < txt.length; q++) out += txt[q] === ' ' ? ' ' : pool[Math.floor(Math.random() * pool.length)];
        el.textContent = out;
        if (p < 1) requestAnimationFrame(step); else el.textContent = txt;
      })(performance.now());
    });
  }
  var scrambled = false;
  watch(net, function (v) { netOn = v; net.classList.toggle('on', v); if (v && !scrambled && !still()) { scrambled = true; scramble(); } }, { threshold: .2 });

  var where = $$('[data-where]');
  where.forEach(function (b) { b.addEventListener('click', function () { where.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write(); }); });
  function list(items, l) {
    if (items.length < 2) return items.join('');
    return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }
  function write() {
    var l = he(), picked = nodes.filter(function (n) { return n.getAttribute('aria-pressed') === 'true'; }).map(function (n) { return n.dataset[l ? 'he' : 'en']; });
    var w = where.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], place = w.dataset[l ? 'he' : 'en'];
    var msg = l ? 'שלום עמרי, אשמח לעזרה עם ' + (picked.length ? list(picked, true) : 'המחשב') + '. איפה: ' + place + '.'
                : 'Hi Omri, I’d like help with ' + (picked.length ? 'the ' + list(picked, false) : 'my computer') + '. Where: ' + place + '.';
    $('[data-msg]').textContent = msg;
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
  }

  // ---------------------------------------------------------------- contact
  var reach = $('.r-wrap'), rphoto = $('[data-rphoto]'), rows = $$('.row', $('[data-rows]'));

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    if (!calm) brain.kick();
    // deck
    dealDeck(calm ? 1 : prog(deal));
    // rail
    if (!calm) { var over = Math.max(0, track.scrollWidth - innerWidth), rp = smooth(prog(rail) / .85); track.style.transform = 'translate3d(' + ((rtl() ? 1 : -1) * over * rp).toFixed(1) + 'px,0,0)'; }
    // cctv zoom
    var cp = calm ? 1 : prog(cams), e = calm ? 0 : smooth((cp - .12) / .45);
    if (!calm) {
      var W = cams.clientWidth, Hs = innerHeight, tx0 = hot.offsetLeft, ty0 = hot.offsetTop, tw = hot.offsetWidth, th = hot.offsetHeight;
      var S = Math.max(W / tw, Hs / th) * 1.02, cx = tx0 + tw / 2, cy = ty0 + th / 2;
      var sc = lerp(1, S, e), Tx = lerp(0, W / 2 - cx * S, e), Ty = lerp(0, Hs / 2 - cy * S, e);
      wall.style.transform = 'translate3d(' + Tx.toFixed(1) + 'px,' + Ty.toFixed(1) + 'px,0) scale(' + sc.toFixed(4) + ')';
      var f = smooth((e - .78) / .22); wfig.style.opacity = f.toFixed(3); wfig.classList.toggle('show', f > .5);
    } else { wall.style.transform = ''; wfig.style.opacity = ''; }
    spots.forEach(function (sp, i) { if (sp === hoverSpot || sp._pinned) return; typeTag(sp, calm || cp > .64 + i * .07); });
    // reviews pile
    var pp = calm ? 1 : prog(revs);
    rvs.forEach(function (rv, i) {
      if (calm) { rv.style.transform = ''; return; }
      var t = i === 0 ? 1 : smooth((pp - .06 - (i - 1) * .36) / .3), above = 0;
      for (var j = i + 1; j < rvs.length; j++) above += smooth((pp - .06 - (j - 1) * .36) / .3);
      var y = (1 - t) * 118, r = lerp(10, RR[i], t), s = 1 - above * .05;
      rv.style.transform = 'translateY(' + y.toFixed(2) + '%) rotate(' + r.toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')';
      rv.style.filter = above ? 'brightness(' + (1 - above * .18).toFixed(3) + ')' : '';
    });
    // contact
    var kp = calm ? 1 : prog(reach), s2 = calm ? 1 : smooth(kp / .5);
    if (!calm) {
      var PW = rphoto.clientWidth, PH = rphoto.clientHeight, t, b, st, en;
      if (innerWidth <= 800) { t = 64; b = PH * .6; st = 16; en = 16; }
      else { t = PH * .16; b = PH * .1; st = PW * .6; en = PW * .04; }
      var L = rtl() ? en : st, R = rtl() ? st : en;
      rphoto.style.setProperty('--pt', (t * s2).toFixed(1) + 'px'); rphoto.style.setProperty('--pb', (b * s2).toFixed(1) + 'px');
      rphoto.style.setProperty('--pl', (L * s2).toFixed(1) + 'px'); rphoto.style.setProperty('--pr', (R * s2).toFixed(1) + 'px');
      rphoto.style.setProperty('--pr2', (18 * s2).toFixed(1) + 'px');
    }
    rows.forEach(function (r, i) {
      var v = calm ? 1 : smooth((s2 - .6 - i * .05) / .14);
      r.style.opacity = calm ? '' : v.toFixed(3); r.style.transform = calm || v >= 1 ? '' : 'translateY(' + ((1 - v) * 26).toFixed(1) + 'px)';
    });
  }

  function layout() { lattice.size(); brain.size(); railSize(); placeSpots(); mapLayout(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); lattice.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { railSize(); placeSpots(); mapLayout(); tick(); });
})();
