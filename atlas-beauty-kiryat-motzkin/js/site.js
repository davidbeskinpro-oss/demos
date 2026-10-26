(function () {
  var root = document.documentElement, WA = '972522121856';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var wide = function () { return innerWidth >= 900; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'אטלס ביוטי · הסרת שיער בלייזר · שושנה דמארי 4, קריית מוצקין', en: 'Atlas Beauty · Laser hair removal · 4 Shoshana Damari St, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור ATLAS BEAUTY אטלס ביוטי · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for ATLAS BEAUTY · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'אטלס ביוטי', 'Atlas Beauty');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו, 052-212-1856', 'Call, 052-212-1856');
    aria('[data-t-wa]', 'וואטסאפ ליוליה', 'WhatsApp Yulia');
    aria('[data-t-areas]', 'אזור הטיפול', 'Treatment area');
    aria('[data-t-part]', 'שעה ביום', 'Time of day');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: שושנה דמארי 4, קריית מוצקין' : 'Map: 4 Shoshana Damari St, Kiryat Motzkin'; });
    $$('[data-lbl]').forEach(function (b) { b._txt = b.dataset[l]; if (b.classList.contains('on')) $('b', b).textContent = b._txt; });
    ticksUI();
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('atlas-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout(); tick();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('atlas-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    clearInline(); layout(); pollen.kick(); fan.kick(); write(true); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9, 21], 1: [9, 21], 2: [9, 21], 3: [9, 21], 4: [9, 21], 5: [9, 17], 6: null };
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
    clockFace(n, t);
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
  // the hours tile: today's opening hours drawn as an arc on a clock face, hands at the time now
  function clockFace(n, t) {
    var arc = $('[data-arc]'); if (!arc) return;
    var pt = function (h, r) { var a = (h % 12) / 12 * Math.PI * 2 - Math.PI / 2; return [60 + Math.cos(a) * r, 60 + Math.sin(a) * r]; };
    if (t) { var span = t[1] - t[0], a = pt(t[0], 44), b = pt(t[1] - .001, 44); arc.setAttribute('d', 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + ' A44 44 0 ' + (span % 12 > 6 || span >= 12 ? 1 : 0) + ' 1 ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1)); }
    else arc.setAttribute('d', '');
    $('[data-hh]').style.transform = 'rotate(' + ((n.h % 12) * 30) + 'deg)';
    $('[data-mm]').style.transform = 'rotate(' + ((n.h % 1) * 360) + 'deg)';
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- the name, letter by letter out of a soft blur
  $$('[data-split] > span[lang]').forEach(function (sp) {
    var i = 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w" style="white-space:nowrap">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });
  var wm = $('[data-wordmark]');
  wm.innerHTML = wm.textContent.split('').map(function (c) { return '<span class="ch" aria-hidden="true">' + (c === ' ' ? '&nbsp;' : c) + '</span>'; }).join('');
  var wch = $$('.ch', wm);

  var hero = $('[data-hero]'), nav = $('[data-nav]'), opening = root.classList.contains('opening'), T0 = performance.now();
  try { sessionStorage.setItem('atlas-open', '1'); } catch (e) {}
  $('[data-opener]').addEventListener('click', function () { root.classList.remove('opening'); });
  setTimeout(function () { hero.classList.add('ready'); }, opening ? 1100 : 60);
  setTimeout(function () { root.classList.remove('opening'); }, opening ? 1800 : 0);
  var openDelay = opening ? 900 : 0;

  // ---------------------------------------------------------------- the logo in pearl light: its own pixels, parting under the hand
  var pollen = (function () {
    var cv = $('[data-pollen]'), c = cv.getContext('2d'), img = $('[data-logosrc]'), fw = $('[data-fanwrap]');
    var P = [], M = [], w, h, raf = 0, vis = true, t0 = 0, mx = -999, my = -999, ok = false, box = { x: 0, y: 0, s: 100 }, ripples = [];
    var COLS = ['228,203,164', '248,238,233', '233,163,169', '228,203,164'];
    function sample() {
      try {
        var sc = document.createElement('canvas'), n = 192; sc.width = n; sc.height = n;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, n, n);
        var d = sx.getImageData(0, 0, n, n).data, pts = [];
        for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (d[(y * n + x) * 4 + 3] > 110) pts.push([x / n, y / n]);
        var want = phone() ? 1100 : 2200, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) { var q = pts[Math.floor(f)]; P.push({ hx: q[0], hy: q[1], x: Math.random(), y: Math.random(), vx: 0, vy: 0, ph: Math.random() * 6.28, dl: Math.random() * .8, col: COLS[Math.floor(Math.random() * 4)], rx: Math.random() - .5, ry: Math.random() }); }
        M = []; for (var k = 0; k < (phone() ? 34 : 70); k++) M.push({ x: Math.random(), y: Math.random(), s: .4 + Math.random() * 1.4, v: .01 + Math.random() * .03, ph: Math.random() * 6.28 });
        ok = true;
      } catch (e) { ok = false; }
    }
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var hr = hero.getBoundingClientRect(), r = fw.getBoundingClientRect();
      // the logo's circle rides just above the tip of the front petal; its lotus base sits at the petals' pivot
      var pt = $('.pt', fw), ch = pt.offsetHeight, top = r.top - hr.top + pt.offsetTop, s = (1.5 * ch + 36) / .77;
      s = Math.min(s, w * (phone() ? 1.15 : .9));
      box = { s: s, x: r.left - hr.left + r.width / 2 - s / 2, y: top - 36 - .03 * s };
      if (still()) { s = Math.min(w * .9, 460); box = { s: s, x: r.left - hr.left + r.width / 2 - s / 2, y: r.top - hr.top + r.height / 2 - s * .45 }; }
    }
    function frame(nowT) {
      raf = 0; if (!ok) return;
      var calm = still(), T = (nowT - t0) / 1000;
      var hr = hero.getBoundingClientRect(), lift = calm ? 0 : clamp(-hr.top / (hr.height * .8), 0, 1.2);
      c.clearRect(0, 0, w, h); c.globalCompositeOperation = 'lighter';
      // drifting motes: the soft shine in the room's air
      for (var m = 0; m < M.length; m++) {
        var o = M[m], my2 = ((o.y - (calm ? 0 : T * o.v)) % 1 + 1) % 1, mx2 = o.x + Math.sin(T * .3 + o.ph) * .01;
        c.globalAlpha = .25 + .2 * Math.sin(T + o.ph); c.fillStyle = 'rgb(255,236,226)';
        c.beginPath(); c.arc(mx2 * w, my2 * h, o.s, 0, 6.283); c.fill();
      }
      ripples = ripples.filter(function (r) { return nowT - r.t < 1600; });
      var sz = phone() ? 1.7 : 2.1;
      for (var i = 0; i < P.length; i++) {
        var p = P[i], a = calm ? 1 : smooth((T - openDelay / 1000 - p.dl) / 1.4);
        var tx = box.x + p.hx * box.s + Math.sin(T * 1.1 + p.ph) * 1.6, ty = box.y + p.hy * box.s + Math.cos(T * .9 + p.ph) * 1.6;
        if (lift > 0) { tx += p.rx * lift * w * .5; ty -= p.ry * lift * h * .7; }
        if (calm) { p.x = tx; p.y = ty; }
        else if (a < 1) { if (p.sx === undefined) { p.sx = p.x * w; p.sy = p.y * h; } p.x = lerp(p.sx, tx, a); p.y = lerp(p.sy, ty, a); }
        else {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 9000) { var f = (9000 - d2) / 9000 * 2.4, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
          for (var k = 0; k < ripples.length; k++) { var rp = ripples[k], rr = (nowT - rp.t) * .35, ex = p.x - rp.x, ey = p.y - rp.y, dist = Math.sqrt(ex * ex + ey * ey) || 1; if (Math.abs(dist - rr) < 14) { p.vx += ex / dist * 1.6; p.vy += ey / dist * 1.6; } }
          p.vx += (tx - p.x) * .05; p.vy += (ty - p.y) * .05; p.vx *= .84; p.vy *= .84; p.x += p.vx; p.y += p.vy;
        }
        var tw = Math.pow(Math.max(0, Math.sin(T * 1.3 + p.ph * 3)), 12);
        c.globalAlpha = (calm ? .8 : .5 + tw * .5) * (1 - clamp(lift, 0, 1) * .6);
        c.fillStyle = 'rgb(' + p.col + ')';
        var s = sz + tw * 1.6; c.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() { sample(); size(); t0 = performance.now() - (performance.now() - T0); kick(); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) { var r = hero.getBoundingClientRect(); ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }); });
    watch(hero, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // ---------------------------------------------------------------- the fan of photo petals: opens out of the bud, turns by itself, with the scroll and with a drag
  var fan = (function () {
    var wrap = $('[data-fanwrap]'), cards = $$('.pt', wrap), N = cards.length, o = N - 1, drag = 0, vel = 0, down = false, lastX = 0, raf = 0, vis = true, last = 0, born = 0;
    function place(t) {
      var step = phone() ? 22 : 22, open = still() ? 1 : smooth((t - openDelay - 150) / 1100), sOff = still() ? 0 : scrollY / 520;
      cards.forEach(function (cd, i) {
        var rel = i - (o + sOff); rel = ((rel % N) + N + N / 2) % N - N / 2;
        var ar = Math.abs(rel), ang = rel * step * open, sc = (1 - ar * .07) * lerp(.72, 1, open);
        var op = (1 - smooth((ar - 1.3) / 1.1)) * smooth(open * 3 - ar * .4);
        cd.style.transform = 'rotate(' + ang.toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
        cd.style.opacity = op.toFixed(3);
        cd.style.zIndex = String(20 - Math.round(ar * 4));
        cd.style.setProperty('--cap', clamp(1 - ar * 2.2, 0, 1).toFixed(2));
        cd.style.setProperty('--shine', (-70 + clamp((rel + 1.5) / 3, 0, 1) * 140).toFixed(1) + '%');
      });
    }
    function frame(t) {
      raf = 0; if (still()) return;
      var dt = Math.min(.05, (t - (last || t)) / 1000); last = t;
      if (!down) { vel *= .94; o += vel + (t > openDelay + 1300 ? dt * .07 : 0); }
      place(t - T0);
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (still()) { cards.forEach(function (cd) { cd.style.transform = ''; cd.style.opacity = ''; cd.style.zIndex = ''; }); return; } if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; down = true; lastX = e.clientX; vel = 0; wrap.setPointerCapture && wrap.setPointerCapture(e.pointerId); });
    wrap.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - lastX; lastX = e.clientX; var d = -dx / (phone() ? 90 : 140); o += d; vel = d * .5; kick(); });
    var up = function () { down = false; };
    wrap.addEventListener('pointerup', up); wrap.addEventListener('pointercancel', up);
    watch(wrap, function (v) { vis = v; kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- the lens: goggles pass the camera, the tint lifts, the room comes alive
  var lens = $('[data-lens]'), lview = $('[data-lview]'), lphoto = $('[data-lphoto]'), lbls = $$('[data-lbl]'), lcap = $('[data-lcap]');
  // the goggles outline, unit box (from the clinic's own goggles); the camera passes through the left lens
  var G = [[.04, .3], [.06, .12, .2, .06, .33, .08], [.42, .1, .46, .2, .5, .24], [.54, .2, .58, .1, .67, .08], [.8, .06, .94, .12, .96, .3], [.98, .52, .92, .82, .72, .9], [.6, .95, .54, .8, .5, .62], [.46, .8, .4, .95, .28, .9], [.08, .82, .02, .52, .04, .3]];
  function gogglePath(W, Hh, ax, ay, au, av) {
    var X = function (u) { return (ax + (u - au) * W).toFixed(1); }, Y = function (v) { return (ay + (v - av) * Hh).toFixed(1); };
    var d = 'M' + X(G[0][0]) + ' ' + Y(G[0][1]);
    for (var i = 1; i < G.length; i++) { var g = G[i]; d += 'C' + X(g[0]) + ' ' + Y(g[1]) + ' ' + X(g[2]) + ' ' + Y(g[3]) + ' ' + X(g[4]) + ' ' + Y(g[5]); }
    return "path('" + d + "Z')";
  }
  var GLY = 'אבגדהוזחטיכלמנסעפצקרשתABCDEFGHKLMNPRSTXYZ0123456789';
  function decode(b, on) {
    if (b._on === on) return; b._on = on; b.classList.toggle('on', on);
    var el = $('b', b), txt = b._txt || b.dataset[root.lang];
    if (!on) return;
    if (still()) { el.textContent = txt; return; }
    var t0 = performance.now();
    (function st(t) {
      var k = Math.floor((t - t0) / 28);
      el.textContent = txt.split('').map(function (ch, i) { return i < k - 4 ? ch : ch === ' ' ? ' ' : GLY[Math.floor(Math.random() * GLY.length)]; }).join('');
      if (k - 4 < txt.length && b._on) requestAnimationFrame(st); else el.textContent = txt;
    })(t0);
  }

  // ---------------------------------------------------------------- yulia: the stack is dealt; the front card leans to the hand
  var yul = $('[data-yulia]'), stack = $('[data-stack]'), scs = $$('.sc', stack), tiltX = 0, tiltY = 0;
  if (fine) {
    stack.addEventListener('pointermove', function (e) { var r = stack.getBoundingClientRect(); tiltX = ((e.clientX - r.left) / r.width - .5) * 2; tiltY = ((e.clientY - r.top) / r.height - .5) * 2; tick(); });
    stack.addEventListener('pointerleave', function () { tiltX = tiltY = 0; tick(); });
  }
  function dealStack(p) {
    var N = scs.length, f = p * (N - 1);
    scs.forEach(function (cd, i) {
      var r = N - 1 - i, eff = r - f, q, extra = '', z;
      if (eff < 0 && eff > -1) {   // being dealt: lifts to the side, then slides in behind
        var t = -eff, sn = Math.sin(Math.PI * t); q = lerp(0, N - 1, smooth(t));
        extra = ' translateX(' + ((rtl() ? 1 : -1) * 62 * sn).toFixed(1) + '%) rotate(' + ((rtl() ? 1 : -1) * 9 * sn).toFixed(2) + 'deg)';
        z = t < .5 ? 30 : 1;
      } else { q = eff < 0 ? N - 1 + eff + 1 : eff; q = clamp(q, 0, N - 1); z = 20 - Math.round(q * 4); }
      var front = q < .3, tl = front ? ' rotateY(' + (tiltX * 7).toFixed(2) + 'deg) rotateX(' + (-tiltY * 6).toFixed(2) + 'deg)' : '';
      cd.style.transform = 'translateY(' + (-q * 16).toFixed(1) + 'px) scale(' + (1 - q * .05).toFixed(3) + ') rotate(' + ((r % 2 ? 1 : -1) * q * 2.2).toFixed(2) + 'deg)' + extra + tl;
      cd.style.zIndex = String(z);
      cd.style.filter = q > .5 ? 'brightness(' + (1 - q * .1).toFixed(2) + ')' : '';
    });
  }

  // ---------------------------------------------------------------- odometers (only the real number is text, via aria-label)
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 4) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- bento: living tiles, a rose light under the hand
  var treat = $('#treat');
  watch(treat, function (v) { treat.classList.toggle('on', v); $$('[data-tile]', treat).forEach(function (t) { t.classList.toggle('on', v); }); });
  $$('[data-tile]').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); t.style.setProperty('--spot', 1); });
    t.addEventListener('pointerleave', function () { t.style.setProperty('--spot', 0); });
  });
  var mphoto = $('.tm-photo');
  if (fine) mphoto.addEventListener('pointermove', function (e) { var r = mphoto.getBoundingClientRect(); var img = $('img', mphoto); img.style.setProperty('--tx', (((e.clientX - r.left) / r.width - .5) * -14).toFixed(1) + 'px'); img.style.setProperty('--ty', (((e.clientY - r.top) / r.height - .5) * -14).toFixed(1) + 'px'); });

  // ---------------------------------------------------------------- reviews: a drifting row (cloned once for a seamless loop)
  var track = $('[data-rtrack]');
  $$('.rv', track).forEach(function (r) { var k = r.cloneNode(true); k.setAttribute('aria-hidden', 'true'); track.appendChild(k); });

  // ---------------------------------------------------------------- the glide pass
  var revSec = $('[data-reviews]'), bands = $$('.band', revSec), hp = $('[data-hp]'), lastFire = 0, lastHX = 0;

  // ---------------------------------------------------------------- book: the machine's touch screen writes the WhatsApp message
  var areas = $$('[data-area]'), parts = $$('[data-part]'), day = $('[data-day]'), ticks = $('[data-ticks]'), steps = $$('[data-step]'), msgEl = $('[data-msg]'), send = $('[data-send]');
  var DSH = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳'], DSE = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  var PE = { morning: 'in the morning', midday: 'at midday', evening: 'in the evening' };
  function ticksUI() {
    if (!ticks) return;
    var l = he(), d = +day.value;
    ticks.innerHTML = (l ? DSH : DSE).map(function (s, i) { return '<span class="' + (i === d ? 'on' : '') + '">' + s + '</span>'; }).join('');
    day.setAttribute('aria-valuetext', (l ? dayHe : dayEn)[d]);
    var fri = d === 5, ev = parts[2];
    ev.disabled = fri;
    if (fri && ev.getAttribute('aria-checked') === 'true') { ev.setAttribute('aria-checked', 'false'); parts[1].setAttribute('aria-checked', 'true'); }
  }
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = areas.filter(function (a) { return a.getAttribute('aria-pressed') === 'true'; }).map(function (a) { return a.dataset[l ? 'he' : 'en']; });
    var p = parts.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], d = +day.value;
    return l ? 'שלום יוליה, אשמח לתאם הסרת שיער בלייזר. אזור: ' + (picked.length ? list(picked, true) : 'עוד לא החלטתי') + '. יום נוח לי: ' + dayHe[d] + ', ' + p.dataset.he + '.'
             : 'Hi Yulia, I’d like to book laser hair removal. Area: ' + (picked.length ? list(picked, false) : 'not sure yet') + '. A good day for me: ' + dayEn[d] + ', ' + PE[p.dataset.en] + '.';
  }
  var shown = '', typing = 0, chatSeen = false;
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 14);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  areas.forEach(function (a) { a.addEventListener('click', function () { a.setAttribute('aria-pressed', a.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); lightStep(0); write(); }); });
  parts.forEach(function (p) { p.addEventListener('click', function () { if (p.disabled) return; parts.forEach(function (x) { x.setAttribute('aria-checked', x === p ? 'true' : 'false'); }); lightStep(1); write(); }); });
  day.addEventListener('input', function () { ticksUI(); lightStep(1); write(); });
  ['pointerenter', 'focus', 'click'].forEach(function (ev) { send.addEventListener(ev, function () { lightStep(2); }); });
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- faq: her photo leans toward the hand
  var tiltEl = $('[data-tilt]');
  if (fine) {
    tiltEl.parentNode.addEventListener('pointermove', function (e) { var r = tiltEl.getBoundingClientRect(); tiltEl.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 14).toFixed(2) + 'deg'); tiltEl.style.setProperty('--rx', (((e.clientY - r.top) / r.height - .5) * -10).toFixed(2) + 'deg'); });
    tiltEl.parentNode.addEventListener('pointerleave', function () { tiltEl.style.setProperty('--ry', '0deg'); tiltEl.style.setProperty('--rx', '0deg'); });
  }

  // ---------------------------------------------------------------- visit and footer
  var visit = $('[data-visit]'), vphoto = $('[data-vphoto]'), vimg = $('img', vphoto), vmark = $('.v-mark', vphoto), vcards = $('[data-vcards]'), vstage = $('.v-stage', visit);
  var foot = $('[data-foot]'), fh = $('.f-horizon', foot), dawn = $('.dawn i', hero), gog = $('[data-gog]');

  function clearInline() {
    [lview, lphoto].forEach(function (el) { el.removeAttribute('style'); });
    placeLabels();
    $$('.band').forEach(function (b) { b.removeAttribute('style'); });
    scs.forEach(function (c) { c.removeAttribute('style'); });
    vimg.style.clipPath = ''; vcards.style.opacity = ''; vcards.style.transform = '';
    wch.forEach(function (c) { c.style.removeProperty('--wy'); c.style.removeProperty('--wo'); });
    lbls.forEach(function (b) { b._on = undefined; decode(b, true); });
    lcap.style.opacity = '';
  }

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, vw = innerWidth;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) { pollen.kick(); fan.kick(); }
    // the hero's horizon sinks as you leave
    var hr = hero.getBoundingClientRect();
    dawn.style.setProperty('--rise', (calm ? 0 : clamp(-hr.top * .35, 0, 400)).toFixed(1) + 'px');

    // lens
    if (calm) { lbls.forEach(function (b) { decode(b, true); }); }
    else {
      var lp = prog(lens), e = smooth(lp / .62);
      var W = lview.clientWidth, Hh = lview.clientHeight, W0 = Math.min(W * (phone() ? 1.02 : .8), Hh * 1.7), H0 = W0 * .52;
      var au = .27, av = .5, ax = W / 2 + (au - .5) * W0, ay = Hh / 2;
      var sEnd = 1.25 * Math.sqrt(W * W + Hh * Hh) / (.19 * W0), s = Math.exp(Math.log(sEnd) * e * e);
      lview.style.setProperty('--gclip', e >= .999 ? 'inset(0 round 0px)' : gogglePath(W0 * s, H0 * s, ax, ay, au, av));
      lview.style.setProperty('--tint', (1 - smooth((e - .2) / .55)).toFixed(3));
      lview.style.setProperty('--gx', (-60 + e * 160).toFixed(1) + '%');
      lphoto.style.setProperty('--ps', lerp(1.32, 1.04, smooth(lp / .9)).toFixed(4));
      $('.l-sun', lphoto).style.setProperty('--sx', (30 + lp * 50).toFixed(1) + '%');
      lbls.forEach(function (b, i) { decode(b, lp > .66 + i * .06); });
      lcap.style.opacity = smooth((lp - .6) / .1).toFixed(3);
    }

    // yulia
    if (calm) { scs.forEach(function (c) { c.style.transform = ''; c.style.zIndex = ''; }); dealStack(0); }
    else if (wide()) dealStack(smooth((prog(yul) - .08) / .84));
    else { var sr = stack.getBoundingClientRect(); dealStack(smooth(((vh - sr.top) / (vh + sr.height) - .3) / .5)); }

    // glide: bands lift row by row, the handpiece rides the seam
    var rr = revSec.getBoundingClientRect();
    if (!calm) {
      var gp = clamp((vh - rr.top) / (vh * .95), 0, 1), act = -1, Rh = revSec.clientHeight, Wd = revSec.clientWidth;
      bands.forEach(function (b, k) {
        var t = clamp(gp * 6.4 - k * 1.0, 0, 1), fromStart = k % 2 === 0;
        b.style.setProperty('--o', fromStart ? 'right' : 'left');
        b.style.setProperty('--k', (1 - t).toFixed(4));
        if (t > 0 && t < 1 && act < 0) {
          act = k;
          var x = fromStart ? t * Wd : Wd - t * Wd, y = (k + .5) * Rh / 6;
          hp.style.setProperty('--hx', (x - (fromStart ? 100 : 10)).toFixed(1) + 'px');
          hp.style.setProperty('--hy', (y - 30).toFixed(1) + 'px');
          hp.style.setProperty('--hf', fromStart ? 1 : -1);
          if (Math.abs(x - lastHX) > 70) { lastHX = x; hp.classList.remove('fire'); void hp.getBoundingClientRect(); hp.classList.add('fire'); }
        }
      });
      hp.style.opacity = act >= 0 ? '1' : '0';
    }

    // visit: the photo shrinks into the logo's arch (desktop, motion on)
    if (!calm && wide()) {
      var kp = prog(visit), s2 = smooth(kp / .55);
      var st = vstage.getBoundingClientRect(), tr = vphoto.getBoundingClientRect();
      var it = (tr.top - st.top) * s2, il = (tr.left - st.left) * s2, ir = (st.right - tr.right) * s2, ib = (st.bottom - tr.bottom) * s2;
      var rad = tr.width / 2 * s2;
      vimg.style.clipPath = 'inset(' + it.toFixed(1) + 'px ' + ir.toFixed(1) + 'px ' + ib.toFixed(1) + 'px ' + il.toFixed(1) + 'px round ' + rad.toFixed(1) + 'px ' + rad.toFixed(1) + 'px ' + (26 * s2).toFixed(1) + 'px ' + (26 * s2).toFixed(1) + 'px)';
      vphoto.style.setProperty('--mkx', (tr.left - st.left + tr.width / 2).toFixed(1) + 'px');
      vphoto.style.setProperty('--mky', (tr.bottom - st.top - 50).toFixed(1) + 'px');
      vphoto.style.setProperty('--mko', smooth((s2 - .85) / .15).toFixed(3));
      var cv = smooth((s2 - .8) / .2);
      vcards.style.opacity = cv.toFixed(3); vcards.style.transform = cv >= 1 ? '' : 'translateY(' + ((1 - cv) * 40).toFixed(1) + 'px)';
    } else { vimg.style.clipPath = ''; vcards.style.opacity = ''; vcards.style.transform = ''; }

    // footer: the horizon rises and the name climbs in letter by letter
    var fr = foot.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / Math.max(1, fr.height));
    fh.style.setProperty('--rise', ((1 - fp) * 120).toFixed(1) + 'px');
    wch.forEach(function (c, i) { var v = calm ? 1 : smooth(fp * 1.7 - .3 - i * .045); c.style.setProperty('--wy', ((1 - v) * 90).toFixed(1) + '%'); c.style.setProperty('--wo', v.toFixed(3)); });
    // the goggles step aside over the footer
    gog.style.setProperty('--gy', (scrollY + vh > document.documentElement.scrollHeight - foot.offsetHeight + 160 ? 130 : 0) + 'px');
  }
  // labels sit on the real objects of the photo, whatever the crop (object-fit: cover)
  function placeLabels() {
    var W = lphoto.clientWidth, Hh = lphoto.clientHeight, k = Math.max(W / 1600, Hh / 1200), dw = 1600 * k, dh = 1200 * k, px = phone() ? .52 : .5;
    lbls.forEach(function (b) {
      var x = (W - dw) * px + (+b.dataset.ix) * dw, y = (Hh - dh) * .5 + (+b.dataset.iy) * dh;
      b.style.left = x.toFixed(1) + 'px'; b.style.top = y.toFixed(1) + 'px'; b.classList.toggle('r', x > W * .58);
    });
  }
  function layout() { placeLabels(); pollen.size(); var hw = $('.v-hair'); if (hw) hw.style.setProperty('--hw', hw.clientWidth + 'px'); tick(); }
  addEventListener('scroll', tick, { passive: true });
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 120); });
  texts(root.lang); hours(); write(true); layout(); fan.kick();
  addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
})();
