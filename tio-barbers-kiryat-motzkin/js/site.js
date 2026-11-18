(function () {
  var root = document.documentElement, WA = '972508554452';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var hoverable = matchMedia('(hover: hover)').matches;
  var TITLE = { he: 'Tío Barbers · מספרת גברים · שושנה דמרי 4, קריית מוצקין', en: 'Tío Barbers · Men’s barbershop · 4 Shoshana Damari St, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Tío Barbers · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Tío Barbers · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'חיוג ל-050-855-4452', 'Call 050-855-4452');
    aria('[data-t-prev]', 'הקודם', 'Previous');
    aria('[data-t-next]', 'הבא', 'Next');
    aria('[data-t-dist]', 'מרחק', 'Distance');
    aria('[data-t-what]', 'מה עושים', 'What');
    aria('[data-t-day]', 'איזה יום', 'Which day');
    $$('[data-co]').forEach(function (c) { if (c.classList.contains('on')) $('b', c).textContent = c.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('tio-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout(); bulbs.size();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('tio-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-co]').forEach(function (c) { decode(c, true); });
    layout(); spots.kick(); quilt.kick(); focus.kick(); bulbs.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  // As on the Google listing (Thursday's opening is listed as 2:30)
  var H = { 0: [10, 20], 1: [12, 19], 2: [10, 20], 3: [10, 20], 4: [2.5, 20], 5: [9, 15], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], shortEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
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
    $$('[data-week] .col').forEach(function (c, i) { $('.bar', c).classList.toggle('today', i === n.d && !!H[i]); });
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
      return '<div class="col' + (H[d] ? '' : ' x') + '"><i class="bar" style="--d:' + d * 70 + 'ms"></i><span class="lbl">' + (l ? shortHe : shortEn)[d] + '</span></div>';
    }).join('');
    weekGrow(weekSeen || still());
    status();
  }
  var weekSeen = false;
  function weekGrow(on) { $$('[data-week] .col').forEach(function (c, d) { $('.bar', c).style.setProperty('--v', on ? (H[d] ? 1 : .12) : 0); }); }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento,.v-bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); if (e.target.classList.contains('t-hours')) { weekSeen = true; weekGrow(true); } } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  if (!rio) weekSeen = true;

  // ---------------------------------------------------------------- headline, letter by letter
  var ci = 0;
  $$('[data-split] .ln').forEach(function (ln) { ln.innerHTML = ln.textContent.split('').map(function (c) { return '<span class="ch" style="--i:' + (ci++) + '">' + c + '</span>'; }).join(''); });

  var hero = $('[data-hero]'), hphoto = $('[data-hphoto]'), roomImg = $('.room', hphoto), nav = $('[data-nav]');
  // where a point of the 1179×1572 photo lands on screen (object-fit: cover)
  function cover(el, iw, ih, ox, oy) {
    var W = el.clientWidth, Hh = el.clientHeight, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s;
    var px = (W - dw) * ox, py = (Hh - dh) * oy;
    return function (x, y) { return [px + x * dw, py + y * dh, s]; };
  }
  var map = null;
  function heroMap() { map = cover(hphoto, 1179, 1572, .5, innerWidth >= 900 ? .52 : .5); }

  // ---------------------------------------------------------------- glyph-decode labels on the photo
  var GL = 'ABCDEFGHJKLMNPRSTUVXYZאבגדהוזחטיכלמנסעפצקרשת0123456789';
  function decode(c, instant) {
    var b = $('b', c), txt = c.dataset[root.lang]; c.classList.add('on'); clearInterval(c._t);
    if (instant || still()) { b.textContent = txt; return; }
    var f = 0, n = txt.length;
    c._t = setInterval(function () {
      f++; var done = Math.floor(f / 2);
      b.textContent = txt.split('').map(function (ch, i) { return i < done || ch === ' ' ? ch : GL[Math.floor(Math.random() * GL.length)]; }).join('');
      if (done >= n) { clearInterval(c._t); b.textContent = txt; }
    }, 30);
  }
  var cos = $$('[data-co]');
  function placeCallouts() {
    cos.forEach(function (c) {
      var p = map(+c.dataset.x, +c.dataset.y), W = hphoto.clientWidth;
      c.style.left = p[0] + 'px'; c.style.top = p[1] + 'px';
      c.classList.toggle('flip', p[0] > W * .62);
      c.hidden = p[0] < 8 || p[0] > W - 8 || p[1] < 70 || p[1] > hphoto.clientHeight * .62;
    });
  }

  // ---------------------------------------------------------------- the ceiling's track lights: on one by one, then a spotlight follows the hand
  var spots = (function () {
    var cv = $('[data-spots]'), c = cv.getContext('2d'), glow = $('[data-signglow]'), raf = 0, vis = true, t0 = 0, w, h;
    var P = [[.09, .14], [.25, .15], [.39, .17], [.53, .19], [.67, .2], [.17, .3], [.29, .3], [.38, .31], [.47, .32], [.56, .33], [.9, .23], [.82, .34], [.9, .35], [.96, .35], [.61, .4], [.67, .4], [.74, .41], [.8, .41], [.85, .41], [.92, .42], [.06, .37], [.15, .38], [.22, .38], [.32, .39], [.4, .39], [.48, .39]];
    var mx = -1, my = -1, sx = .5, sy = .45, tx = .5, ty = .45, lastMove = 0;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hphoto.clientWidth; h = hphoto.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var a = map(.205, .395), b = map(.715, .48);
      glow.style.left = (a[0] - (b[0] - a[0]) * .15) + 'px'; glow.style.top = (a[1] - (b[1] - a[1]) * .9) + 'px';
      glow.style.width = (b[0] - a[0]) * 1.3 + 'px'; glow.style.height = (b[1] - a[1]) * 2.8 + 'px';
    }
    function draw(T, calm) {
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var on = calm ? 1 : smooth((T - .5 - i * .06) / .25), fl = calm ? 1 : .9 + .1 * Math.sin(T * 7 + i * 1.7);
        if (on <= 0) continue;
        var p = map(P[i][0], P[i][1]), r = Math.max(16, 34 * p[2] * 2.4);
        var g = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], r);
        g.addColorStop(0, 'rgba(255,246,222,' + (on * fl).toFixed(3) + ')');
        g.addColorStop(.18, 'rgba(255,214,150,' + (.7 * on * fl).toFixed(3) + ')');
        g.addColorStop(.5, 'rgba(255,200,120,' + (.16 * on * fl).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(255,200,120,0)');
        c.fillStyle = g; c.beginPath(); c.arc(p[0], p[1], r, 0, 6.283); c.fill();
      }
    }
    function frame(now) {
      raf = 0; var calm = still(), T = (now - t0) / 1000;
      draw(T, calm);
      if (calm) { hero.style.setProperty('--sx', '50%'); hero.style.setProperty('--sy', '45%'); hphoto.querySelector('.dark').style.cssText = ''; return; }
      // nobody pointing (phones, or the mouse left): the spot sweeps the room by itself
      if (mx < 0 || now - lastMove > 2600) { tx = .5 + Math.sin(T * .42) * .3; ty = .5 + Math.sin(T * .31 + 1) * .16; }
      else { tx = mx / w; ty = my / h; }
      sx = lerp(sx, tx, .07); sy = lerp(sy, ty, .07);
      var d = $('.dark', hphoto); d.style.setProperty('--sx', (sx * 100).toFixed(2) + '%'); d.style.setProperty('--sy', (sy * 100).toFixed(2) + '%');
      // the light decodes a label when it reaches it
      if (T > 1.8) cos.forEach(function (co) { if (co.hidden || co.classList.contains('on')) return; var px = parseFloat(co.style.left) / w, py = parseFloat(co.style.top) / h; if (Math.abs(px - sx) < .16 && Math.abs(py - sy) < .16 || T > 4 + cos.indexOf(co) * 1.2) decode(co); });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hphoto.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = hphoto.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; lastMove = performance.now(); });
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = hphoto.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; lastMove = performance.now(); });
    hero.addEventListener('pointerdown', function (e) { var r = hphoto.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; lastMove = performance.now(); });
    hero.addEventListener('pointerleave', function () { mx = -1; });
    watch(hero, function (v) { vis = v; kick(); });
    return { size: function () { size(); kick(); }, kick: kick, start: function () { t0 = performance.now(); kick(); } };
  })();

  // ---------------------------------------------------------------- THE PLACE: one frame, three distances
  var close = $('[data-close]'), zoom = $('[data-czoom]'), clight = $('[data-clight]'), caps = $$('[data-cap]'), tabs = $$('[data-ctab]');
  // target point in the photo (0–1) and the scale for each distance
  var ST = [{ x: .5, y: .52, s: 1 }, { x: .46, y: .44, s: 2.2 }, { x: .23, y: .8, s: 2.4 }], stage = -1;
  var cframe = $('[data-cframe]');
  function applyStage() {
    if (stage < 0) return;
    // the zoom box is the whole photo at cover size; it slides and scales so the target sits mid-frame, never showing an edge
    var t = ST[stage], Fw = cframe.clientWidth, Fh = cframe.clientHeight, k = Math.max(Fw / 1179, Fh / 1572), dw = 1179 * k, dh = 1572 * k, s = t.s;
    zoom.style.width = dw + 'px'; zoom.style.height = dh + 'px';
    var tx = clamp(Fw / 2 - s * t.x * dw, Fw - s * dw, 0), ty = clamp(Fh / 2 - s * t.y * dh, Fh - s * dh, 0);
    zoom.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + s + ')';
  }
  function setStage(n) {
    if (n === stage) return; stage = n; applyStage();
    clight.style.setProperty('--ly', n ? '50%' : '36%');
    caps.forEach(function (c, i) { c.classList.toggle('on', i === n); });
    tabs.forEach(function (b, i) { b.setAttribute('aria-selected', i === n ? 'true' : 'false'); });
    close.classList.toggle('s1', n >= 1); close.classList.toggle('s2', n >= 2);
  }
  function goStage(n) {
    n = clamp(n, 0, 2);
    if (still()) { setStage(n); return; }
    var top = close.getBoundingClientRect().top + scrollY, span = close.offsetHeight - innerHeight;
    scrollTo({ top: top + span * (n / 3 + .16), behavior: 'smooth' });
  }
  tabs.forEach(function (b, i) { b.addEventListener('click', function () { goStage(i); }); });
  $('[data-cprev]').addEventListener('click', function () { goStage(stage - 1); });
  $('[data-cnext]').addEventListener('click', function () { goStage(stage + 1); });
  setStage(0);

  // ---------------------------------------------------------------- SEAM: diamond-stitched leather, the tufts press in one after another
  var quilt = (function () {
    var box = $('[data-quilt]'), cv = $('[data-quiltcv]'), c = cv.getContext('2d'), w, h, raf = 0, vis = false, mx = -999, my = -999, cell;
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = box.clientWidth; h = box.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); cell = Math.max(54, Math.min(90, w / 12)); }
    function frame(now) {
      raf = 0; var calm = still(), r = box.getBoundingClientRect(), p = calm ? .5 : clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1);
      var front = lerp(-.2, 1.2, p) * w, T = now / 1000, dw = cell, dh = cell * .62;
      c.fillStyle = '#0d0c0d'; c.fillRect(0, 0, w, h);
      for (var row = -1; row * dh / 2 < h + dh; row++) {
        for (var col = -1; col * dw < w + dw; col++) {
          var cx = col * dw + (row % 2 ? dw / 2 : 0), cy = row * dh / 2, X = rtl() ? w - cx : cx;
          var press = calm ? .55 : smooth(1 - Math.abs(X - front) / (w * .35));
          var dx = cx - mx, dy = cy - my; if (dx * dx + dy * dy < 14000) press = Math.max(press, 1 - Math.sqrt(dx * dx + dy * dy) / 118);
          var g = c.createRadialGradient(cx - dw * .12, cy - dh * .2, 2, cx, cy, dw * .62);
          var hi = 46 + press * 26, lo = 10 + press * 4;
          g.addColorStop(0, 'rgb(' + hi + ',' + (hi - 4) + ',' + (hi - 7) + ')'); g.addColorStop(1, 'rgb(' + lo + ',' + lo + ',' + (lo + 1) + ')');
          c.fillStyle = g; c.beginPath(); c.moveTo(cx, cy - dh / 2 + 1); c.lineTo(cx + dw / 2 - 1, cy); c.lineTo(cx, cy + dh / 2 - 1); c.lineTo(cx - dw / 2 + 1, cy); c.closePath(); c.fill();
          // the stitch runs along the seam, lit where the press passes
          c.strokeStyle = 'rgba(255,214,150,' + (.08 + press * .5).toFixed(3) + ')'; c.lineWidth = 1; c.setLineDash([4, 4]); c.stroke(); c.setLineDash([]);
          // the button at each crossing
          c.fillStyle = 'rgba(255,220,160,' + (.15 + press * .6).toFixed(3) + ')'; c.beginPath(); c.arc(cx, cy - dh / 2, 1.8 + press * 1.2, 0, 6.283); c.fill();
        }
      }
      var fade = c.createLinearGradient(0, 0, 0, h); fade.addColorStop(0, 'rgba(34,31,30,1)'); fade.addColorStop(.22, 'rgba(34,31,30,0)'); fade.addColorStop(.78, 'rgba(13,12,13,0)'); fade.addColorStop(1, 'rgba(13,12,13,1)');
      c.fillStyle = fade; c.fillRect(0, 0, w, h);
      if (vis && !calm && (mx > -999 || true)) { /* redraw on scroll only (tick) and while the hand is on it */ if (mx > -999) raf = requestAnimationFrame(frame); }
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    box.addEventListener('pointermove', function (e) { var r = box.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; kick(); });
    box.addEventListener('pointerleave', function () { mx = my = -999; kick(); });
    watch(box, function (v) { vis = v; kick(); });
    return { size: function () { size(); kick(); }, kick: kick, on: function () { return vis; } };
  })();

  // ---------------------------------------------------------------- bento: the LED rim follows the hand; the fade comes into focus under it
  $$('.tile').forEach(function (t) {
    var set = function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); };
    t.addEventListener('pointermove', set); t.addEventListener('pointerdown', set);
  });
  var focus = (function () {
    var t = $('[data-focus]'), raf = 0, vis = false, hand = false, fx = .5, fy = .4;
    function frame(now) {
      raf = 0; if (still() || !vis) return;
      if (!hand) { var T = now / 1000; fx = lerp(fx, .52 + Math.sin(T * .5) * .26, .05); fy = lerp(fy, .45 + Math.sin(T * .37 + 2) * .22, .05); }
      t.style.setProperty('--fx', (fx * 100).toFixed(2) + '%'); t.style.setProperty('--fy', (fy * 100).toFixed(2) + '%');
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); hand = true; fx = (e.clientX - r.left) / r.width; fy = (e.clientY - r.top) / r.height; });
    t.addEventListener('pointerleave', function () { hand = false; });
    watch(t, function (v) { vis = v; kick(); });
    return { kick: kick };
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
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- BOOK: light switches, steps, the message that writes itself
  var whats = $$('[data-what]'), days = $$('[data-day]'), steps = $$('[data-step]'), msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
  $$('[data-day]').forEach(function (b) { if (!H[+b.dataset.day]) b.remove(); });
  function radio(group, b) { group.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); }
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  whats.forEach(function (b) { b.addEventListener('click', function () { radio(whats, b); lightStep(0); write(); }); });
  days.forEach(function (b) { b.addEventListener('click', function () { radio(days, b.getAttribute('aria-checked') === 'true' ? null : b); lightStep(1); write(); }); });
  [whats, days].forEach(function (g) { g.forEach(function (b, i) { b.addEventListener('keydown', function (e) { var k = e.key, d = (k === 'ArrowLeft') !== rtl() ? 1 : -1; if (k !== 'ArrowLeft' && k !== 'ArrowRight') return; e.preventDefault(); var n = g[(i + (rtl() ? -d : d) + g.length) % g.length]; n.focus(); n.click(); }); }); });
  var send = $('[data-send]');
  send.addEventListener('pointerenter', function () { lightStep(2); });
  send.addEventListener('focus', function () { lightStep(2); });
  function compose() {
    var l = he(), w = whats.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], d = days.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0];
    var what = w.dataset[l ? 'he' : 'en'], day = d ? +d.dataset.day : -1;
    return l ? 'היי, אשמח לקבוע תור ל' + what + (day >= 0 ? ' ביום ' + dayHe[day] : ' השבוע') + '. מתי יש מקום?'
             : 'Hi, I’d like to book ' + what + (day >= 0 ? ' on ' + dayEn[day] : ' this week') + '. When do you have a spot?';
  }
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
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

  // ---------------------------------------------------------------- footer: the name in bulbs, lit one by one
  var bulbs = (function () {
    var foot = $('[data-foot]'), cv = $('[data-bulbs]'), c = cv.getContext('2d'), B = [], w, h, raf = 0, vis = false, t0 = 0;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; if (!w) return;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var o = document.createElement('canvas'), ow = 600, oh = 200; o.width = ow; o.height = oh; var x = o.getContext('2d');
      x.fillStyle = '#fff'; x.font = '900 180px Heebo, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('TÍO', ow / 2, oh / 2 + 12);
      var d = x.getImageData(0, 0, ow, oh).data, s = 13, k = Math.min(w / ow, h / oh), ox = (w - ow * k) / 2, oy = (h - oh * k) / 2; B = [];
      for (var yy = s / 2; yy < oh; yy += s) for (var xx = s / 2; xx < ow; xx += s) if (d[(Math.floor(yy) * ow + Math.floor(xx)) * 4 + 3] > 160) B.push([ox + xx * k, oy + yy * k, xx / ow]);
      draw(still() ? 99 : (vis ? (performance.now() - t0) / 1000 : 0));
    }
    function draw(T) {
      c.clearRect(0, 0, w, h); var r = Math.max(2.5, Math.min(w, 1400) / 210);
      for (var i = 0; i < B.length; i++) {
        var b = B[i], on = smooth((T - b[2] * 1.6) / .3), fl = T > 3 ? .9 + .1 * Math.sin(T * 3 + i) : 1;
        c.fillStyle = 'rgba(70,60,52,1)'; c.beginPath(); c.arc(b[0], b[1], r, 0, 6.283); c.fill();
        if (on > 0) {
          var g = c.createRadialGradient(b[0], b[1], 0, b[0], b[1], r * 3.2);
          g.addColorStop(0, 'rgba(255,244,214,' + (on * fl).toFixed(3) + ')'); g.addColorStop(.3, 'rgba(255,200,120,' + (.55 * on * fl).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,190,110,0)');
          c.fillStyle = g; c.beginPath(); c.arc(b[0], b[1], r * 3.2, 0, 6.283); c.fill();
        }
      }
    }
    function frame(now) { raf = 0; var T = (now - t0) / 1000; draw(still() ? 99 : T); if (vis && !still() && T < 8) raf = requestAnimationFrame(frame); }
    function kick() { if (still()) { draw(99); return; } if (!raf) raf = requestAnimationFrame(frame); }
    watch(foot, function (v) { if (v && !vis) t0 = performance.now(); vis = v; kick(); });
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var par = $('[data-par]'), parImg = $('img', par);
  var revs = $('[data-revs]'), rvs = $$('[data-rv]'), rail = $('[data-rail]'), heads = $$('.head', rail), dock = $('[data-dock]');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    dock.classList.toggle('show', scrollY > vh * .6);
    // the place: three distances
    if (!calm) setStage(Math.min(2, Math.floor(prog(close) * 3)));
    // the FAQ photo drifts slowly inside its frame
    var fr = par.getBoundingClientRect(); parImg.style.setProperty('--py', calm ? '0px' : (clamp((vh / 2 - (fr.top + fr.height / 2)) / vh, -1, 1) * 30).toFixed(1) + 'px');
    // the quilt seam
    if (quilt.on()) quilt.kick();
    // reviews: the rail slides in, each head swings onto its review and lights it
    var rr = revs.getBoundingClientRect(), pin = calm ? 1 : smooth((vh - rr.top) / (vh * .6));
    rail.style.setProperty('--rail', pin.toFixed(3));
    heads.forEach(function (hd, i) { hd.style.setProperty('--ho', smooth((pin - .6 - i * .1) / .2).toFixed(3)); });
    var wide = innerWidth >= 900;
    rvs.forEach(function (rv, i) {
      var lit;
      if (calm) lit = 1;
      else if (wide) { var pp = clamp((vh * .75 - rr.top) / (rr.height * .7), 0, 1); lit = smooth(pp * 3.4 - i * 1.05); }
      else { var b = rv.getBoundingClientRect(), mid = b.top + b.height / 2; lit = smooth(1 - Math.abs(mid - vh * .5) / (vh * .5)); lit = Math.max(lit, .25); }
      rv.style.setProperty('--lit', (.5 + .5 * lit).toFixed(3)); rv.style.setProperty('--cone', lit.toFixed(3));
      if (heads[i]) { heads[i].style.setProperty('--hl', lit.toFixed(3)); heads[i].style.setProperty('--tilt', ((1 - lit) * (i - 1) * 14).toFixed(1) + 'deg'); }
    });
  }

  function layout() { heroMap(); placeCallouts(); spots.size(); quilt.size(); applyStage(); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); if (innerWidth !== lw) { lw = innerWidth; bulbs.size(); } }, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  if (still()) cos.forEach(function (co) { decode(co, true); });
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); spots.start(); bulbs.size(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  if (roomImg.complete) layout(); else roomImg.addEventListener('load', layout, { once: true });
  addEventListener('load', function () { layout(); bulbs.size(); });
})();
