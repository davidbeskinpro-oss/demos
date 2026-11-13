(function () {
  var root = document.documentElement, WA = '972505537793';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'ליב מזגנים · תיקון, התקנה וניקוי מזגנים · אילון 24, קריית ביאליק', en: 'Liv Air Conditioners · A/C repair, installation and cleaning · 24 Ilon St, Kiryat Bialik' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור ליב מזגנים · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Liv Air Conditioners · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'ליב מזגנים', 'Liv Air Conditioners');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-job]', 'מה צריך', 'The job');
    aria('[data-t-room]', 'באיזה חדר', 'The room');
    aria('[data-t-call]', 'התקשרו לליב מזגנים, 050-553-7793', 'Call Liv A/C, 050-553-7793');
    aria('[data-t-wa]', 'וואטסאפ לליב מזגנים', 'WhatsApp Liv A/C');
    $$('.rv .st').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
    var m = $('[data-t-map]'); if (m) m.title = l === 'he' ? 'מפה: אילון 24, קריית ביאליק' : 'Map: 24 Ilon St, Kiryat Bialik';
    var a = $('[data-area]'); if (a) a.placeholder = l === 'he' ? 'איפה? למשל קריית ביאליק' : 'Where? e.g. Kiryat Bialik';
    $$('[data-decode]').forEach(function (c) { c.textContent = c.dataset[l]; });
    $$('.spot b').forEach(function (b) { b.textContent = b.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('liv-lang', l); } catch (e) {}
    texts(l); hours(); compose(true); split(); wordmark(); louvres.build(); placeSpots();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('liv-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],.wm').forEach(function (el) { el.classList.add('in'); });
    louvres.build(); onScroll(); air.kick(); ring.kick(); mist.kick(); lens.reset(); compose(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed, [0,24] = open all day
  var H = { 0: [0, 24], 1: [0, 24], 2: [0, 24], 3: [0, 24], 4: [0, 24], 5: [0, 24], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && n.h >= t[0] && n.h < t[1]) {
      open = true;
      var nextDay = H[(n.d + 1) % 7], allDay = t[0] === 0 && t[1] === 24;
      if (allDay && nextDay && nextDay[0] === 0) txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours';
      else txt = l ? 'פתוח עכשיו · עד ' + (t[1] === 24 ? 'חצות' : hhmm(t[1])) : 'Open now · until ' + (t[1] === 24 ? 'midnight' : hhmm(t[1]));
    } else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      var at = function (x) { return x[0] === 0 ? '' : (l ? ' ב-' : ' at ') + hhmm(x[0]); };
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור היום · נפתח מחר' + at(H[nd]) : 'Closed today · opens tomorrow' + at(H[nd]))
        : (l ? 'סגור היום · נפתח ביום ' + dayHe[nd] + at(H[nd]) : 'Closed today · opens ' + dayEn[nd] + at(H[nd]));
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
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -6% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline and footer name: letter by letter (the last word carries the logo's colours)
  function chars(sp, colorLast) {
    if (!sp.dataset.txt) sp.dataset.txt = sp.textContent;
    var i = 0, words = sp.dataset.txt.split(' ');
    sp.innerHTML = words.map(function (w, wi) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch' + (colorLast && wi === words.length - 1 ? ' g' : '') + '" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  }
  function split() { $$('[data-split] .ln > span[lang]').forEach(function (sp) { chars(sp, false); }); }
  function wordmark() { $$('[data-wm] > span[lang]').forEach(function (sp) { chars(sp, true); }); }
  split(); wordmark();
  var wm = $('[data-wm]');
  watch(wm, function (v) { if (v) wm.classList.add('in'); }, { threshold: .4 });

  // ---------------------------------------------------------------- nav gathers into a pill; phone capsule after the hero
  var nav = $('[data-nav]'), cap = $('[data-capsule]'), hero = $('[data-hero]');

  // ---------------------------------------------------------------- hero air: snowflakes (the card's own bullet) and streaks, parting around the hand
  var air = (function () {
    var cv = $('[data-air]'), c = cv.getContext('2d'), w, h, P = [], raf = 0, vis = true, mx = -999, my = -999, gust = 0;
    function flake(x, y, r, a) {
      c.save(); c.translate(x, y); c.rotate(a); c.beginPath();
      for (var k = 0; k < 3; k++) { c.rotate(Math.PI / 3); c.moveTo(-r, 0); c.lineTo(r, 0); c.moveTo(r * .55, 0); c.lineTo(r * .8, r * .22); c.moveTo(r * .55, 0); c.lineTo(r * .8, -r * .22); c.moveTo(-r * .55, 0); c.lineTo(-r * .8, r * .22); c.moveTo(-r * .55, 0); c.lineTo(-r * .8, -r * .22); }
      c.stroke(); c.restore();
    }
    function seed() {
      var n = phone() ? 42 : 90; P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, s: Math.random(), a: Math.random() * 6, f: Math.random() < .55 });
    }
    function size() { var d = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * d; cv.height = h * d; c.setTransform(d, 0, 0, d, 0, 0); seed(); }
    function frame(t) {
      raf = 0; if (!vis || still()) { c.clearRect(0, 0, w, h); return; }
      c.clearRect(0, 0, w, h);
      var dir = rtl() ? -1 : 1, tt = t / 1000;
      if (!fine) { mx = w * (.5 + .35 * Math.sin(tt * .4)); my = h * (.45 + .2 * Math.cos(tt * .55)); }
      gust *= .96;
      P.forEach(function (p) {
        var sp = .35 + p.s * .9 + gust;
        var tx = dir * sp * 1.2 + Math.sin(tt * .7 + p.a) * .25, ty = sp * .55;
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy, R = 150;
        if (d2 < R * R) { var d = Math.sqrt(d2) || 1, f = (1 - d / R) * 3.2; tx += dx / d * f; ty += dy / d * f; }
        p.vx += (tx - p.vx) * .08; p.vy += (ty - p.vy) * .08;
        p.x += p.vx; p.y += p.vy; p.a += .004 + p.s * .006;
        if (p.x > w + 30) p.x = -30; if (p.x < -30) p.x = w + 30; if (p.y > h + 30) { p.y = -30; p.x = Math.random() * w; }
        var al = .25 + p.s * .55;
        if (p.f) { c.strokeStyle = 'rgba(214,236,255,' + al + ')'; c.lineWidth = 1.1; flake(p.x, p.y, 3 + p.s * 6, p.a); }
        else { var len = 18 + p.s * 40; c.strokeStyle = 'rgba(' + (p.s > .6 ? '255,160,215' : p.s > .3 ? '190,150,255' : '150,215,255') + ',' + al * .7 + ')'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * len / 2, p.y - p.vy * len / 2); c.stroke(); }
      });
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && vis && !still()) raf = requestAnimationFrame(frame); else if (still()) c.clearRect(0, 0, w, h); }
    hero.addEventListener('pointermove', function (e) { if (!fine) return; var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
      hero.style.setProperty('--px', ((e.clientX / innerWidth - .5) * -14) + 'px'); hero.style.setProperty('--py', ((e.clientY / innerHeight - .5) * -10) + 'px'); });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function () { gust = 4; });
    watch(hero, function (v) { vis = v; kick(); });
    size();
    return { kick: kick, size: size };
  })();

  // ---------------------------------------------------------------- hero → work: the photo closes like an A/C's louvres as you scroll on
  var louvres = (function () {
    var el = $('[data-louvres]'), img = $('[data-hphoto] img'), N = 9, slats = [];
    function build() {
      el.innerHTML = ''; slats = [];
      if (still()) { el.style.display = 'none'; return; }
      // match object-fit:cover, object-position 50% 62% and the photo's scale(1.06) about its centre
      var W = hero.clientWidth, Hh = hero.clientHeight, iw = 1200, ih = 1600, s0 = Math.max(W / iw, Hh / ih), K = 1.06, bw = iw * s0 * K, bh = ih * s0 * K, ox = W / 2 + ((W - iw * s0) / 2 - W / 2) * K, oy = Hh / 2 + ((Hh - ih * s0) * .62 - Hh / 2) * K;
      for (var i = 0; i < N; i++) {
        var sl = document.createElement('i'), top = Hh * i / N, sh = Hh / N + 1;
        sl.style.top = top + 'px'; sl.style.height = sh + 'px';
        sl.style.backgroundImage = 'url(' + (img.currentSrc || img.src) + ')';
        sl.style.backgroundSize = bw + 'px ' + bh + 'px';
        sl.style.backgroundPosition = ox + 'px ' + (oy - top) + 'px';
        el.appendChild(sl); slats.push(sl);
      }
    }
    function update(p) {
      if (still() || !slats.length) return;
      var on = p > 0.001; el.style.display = on ? 'block' : 'none'; img.parentNode.style.visibility = on ? 'hidden' : '';
      slats.forEach(function (sl, i) { var k = smooth((p * 1.6) - (N - 1 - i) / N * .6); sl.style.transform = 'perspective(900px) rotateX(' + (k * 88) + 'deg)'; sl.style.opacity = 1 - k * .15; });
      var o = 1 - smooth(p * 2.2); $('.h-copy').style.opacity = o; $('.h-cap').style.opacity = o;
    }
    return { build: build, update: update };
  })();

  // ---------------------------------------------------------------- the arc of their jobs: turns by itself, with the scroll and with a drag
  var ring = (function () {
    var wrap = $('[data-ring-wrap]'), el = $('[data-ring]');
    $$('.rc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $$('img', k).forEach(function (i) { i.alt = ''; }); el.appendChild(k); });
    var cards = $$('.rc', el), N = cards.length, rot = 0, vel = 0, raf = 0, vis = false, drag = false, lx = 0, last = 0, lastY = scrollY;
    function R() { var cw = cards[0].offsetWidth || 200; return Math.max(cw * 1.1 / (2 * Math.tan(Math.PI / N)), phone() ? 300 : innerWidth * .42); }
    function frame(t) {
      raf = 0;
      if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.opacity = ''; c.style.filter = ''; }); return; }
      var dt = last ? Math.min(50, t - last) : 16; last = t;
      if (!drag) { rot += (vel + (rtl() ? -6 : 6)) * dt / 1000; vel *= .95; }
      var r = R(), cw = cards[0].offsetWidth, ch = cards[0].offsetHeight;
      cards.forEach(function (c, i) {
        var a = (i * 360 / N + rot) * Math.PI / 180, z = Math.cos(a), x = Math.sin(a) * r;
        var front = (z + 1) / 2;
        c.style.transform = 'translate(' + (x - cw / 2) + 'px,' + (-ch / 2 + (1 - front) * 50) + 'px) translateZ(' + (z * r * .35 - r * .35) + 'px) rotateY(' + (Math.sin(a) * 28) + 'deg)';
        c.style.opacity = (.25 + front * .75).toFixed(3);
        c.style.zIndex = Math.round(front * 100);
        c.style.filter = 'brightness(' + (.45 + front * .55).toFixed(3) + ')';
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .2; vel = dx * 3; });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('scroll', function () { var d = scrollY - lastY; lastY = scrollY; if (vis && !still()) vel += d * .5; }, { passive: true });
    watch(wrap, function (v) { vis = v; if (v) { kick(); decodeAll(); } });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- labels decode out of static glyphs
  var GLY = { he: 'אבגדהוזחטיכלמנסעפצקרשת0123456789', en: 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789' };
  function decode(el, txt) {
    if (still()) { el.textContent = txt; return; }
    var n = 0, steps = 16;
    clearInterval(el._t);
    el._t = setInterval(function () {
      n++; var k = Math.floor(txt.length * n / steps);
      el.textContent = txt.slice(0, k) + txt.slice(k).replace(/\S/g, function () { var g = GLY[root.lang]; return g[Math.floor(Math.random() * g.length)]; });
      if (n >= steps) { clearInterval(el._t); el.textContent = txt; }
    }, 45);
  }
  var decoded = false;
  function decodeAll() { if (decoded) return; decoded = true; $$('[data-decode]').forEach(function (c, i) { setTimeout(function () { decode(c, c.dataset[root.lang]); }, i * 70); }); }
  $$('.rc').forEach(function (c) { c.addEventListener('pointerenter', function () { var f = $('[data-decode]', c); if (f) decode(f, f.dataset[root.lang]); }); });

  // ---------------------------------------------------------------- the cold lens over their gauge photo
  var lens = (function () {
    var st = $('[data-lens]'), spots = $$('.spot', st), keys = $$('[data-key]'), lx = .55, ly = .45, tx = .55, ty = .45, raf = 0, vis = false, user = 0, dragging = false;
    var pts = spots.map(function (s) { return [parseFloat(s.style.getPropertyValue('--x')) / 100, parseFloat(s.style.getPropertyValue('--y')) / 100]; });
    function rad() { return parseFloat(getComputedStyle(st).getPropertyValue('--lr')) || 110; }
    function apply() {
      st.style.setProperty('--lx', (lx * 100) + '%'); st.style.setProperty('--ly', (ly * 100) + '%');
      if (still()) return;
      var W = st.clientWidth, Hh = st.clientHeight, r = rad(), best = -1, bd = 1e9;
      spots.forEach(function (s, i) { var dx = (pts[i][0] - lx) * W, dy = (pts[i][1] - ly) * Hh, d = Math.sqrt(dx * dx + dy * dy); var on = d < r * .9; s.classList.toggle('on', on); if (d < bd) { bd = d; best = i; } });
      keys.forEach(function (k, i) { k.classList.toggle('on', spots[i].classList.contains('on')); });
    }
    function frame(t) {
      raf = 0; if (still()) return;
      if (!dragging && performance.now() - user > 2600) {
        // a slow tour of the five parts in the photo
        var s = t / 1000 * .32, i = Math.floor(s) % pts.length, j = (i + 1) % pts.length, f = smooth((s % 1) * 1.6 - .3);
        tx = pts[i][0] + (pts[j][0] - pts[i][0]) * f; ty = pts[i][1] + (pts[j][1] - pts[i][1]) * f;
      }
      lx += (tx - lx) * .09; ly += (ty - ly) * .09; apply();
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && vis && !still()) raf = requestAnimationFrame(frame); }
    function point(e) { var r = st.getBoundingClientRect(); tx = clamp((e.clientX - r.left) / r.width, 0, 1); ty = clamp((e.clientY - r.top) / r.height, 0, 1); user = performance.now(); kick(); }
    st.addEventListener('pointermove', function (e) { if (fine || dragging) point(e); });
    st.addEventListener('pointerdown', function (e) { dragging = true; point(e); });
    addEventListener('pointerup', function () { dragging = false; });
    keys.forEach(function (k, i) { k.addEventListener('pointerenter', function () { tx = pts[i][0]; ty = pts[i][1]; user = performance.now(); kick(); }); k.addEventListener('click', function () { tx = pts[i][0]; ty = pts[i][1]; user = performance.now(); kick(); }); });
    watch(st, function (v) { vis = v; kick(); });
    function reset() { if (still()) { lx = .55; ly = .45; st.style.setProperty('--lx', '55%'); st.style.setProperty('--ly', '45%'); spots.forEach(function (s) { s.classList.add('on'); }); } else kick(); }
    reset();
    return { reset: reset };
  })();
  // labels near the right edge open towards the inside
  function placeSpots() { $$('.spot').forEach(function (s) { var x = parseFloat(s.style.getPropertyValue('--x')); s.classList.toggle('flip', rtl() ? x < 45 : x > 45); }); }
  placeSpots();

  // ---------------------------------------------------------------- cleaning photo comes alive: mist from the sprayer, water down the drain hose
  var mist = (function () {
    var cv = $('[data-mist]'), c = cv.getContext('2d'), w, h, P = [], raf = 0, vis = false;
    // spots measured on img/cleaning.jpg (fractions of the frame): nozzle, coil, drain hose
    var NZ = [.44, .21], COIL = [.12, .3], TUBE = [[.255, .7], [.245, .99]];
    function size() { var d = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * d; cv.height = h * d; c.setTransform(d, 0, 0, d, 0, 0); }
    // object-fit: cover maps fractions of the picture to the box
    function map(fx, fy) { var iw = 900, ih = 1594, s = Math.max(w / iw, h / ih), ox = (w - iw * s) / 2, oy = (h - ih * s) / 2; return [ox + fx * iw * s, oy + fy * ih * s]; }
    function frame(t) {
      raf = 0; c.clearRect(0, 0, w, h); if (!vis || still()) return;
      var n = map(NZ[0], NZ[1]), co = map(COIL[0], COIL[1]);
      for (var k = 0; k < 3; k++) {
        var ang = Math.atan2(co[1] - n[1], co[0] - n[0]) + (Math.random() - .5) * .5, sp = 2.4 + Math.random() * 2.6;
        P.push({ x: n[0], y: n[1], vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1, r: .8 + Math.random() * 1.8, k: 0 });
      }
      if (Math.random() < .35) { var a = map(TUBE[0][0], TUBE[0][1]); P.push({ x: a[0] + (Math.random() - .5) * 4, y: a[1], vx: 0, vy: 1.6 + Math.random(), life: 1, r: 1.6 + Math.random() * 1.4, k: 1 }); }
      var bot = map(TUBE[1][0], TUBE[1][1])[1];
      P = P.filter(function (p) {
        if (p.k === 0) { p.vx *= .975; p.vy = p.vy * .975 + .03; p.life -= .016; }
        else { p.vy += .05; if (p.y > bot) p.life = 0; }
        p.x += p.vx; p.y += p.vy;
        if (p.life <= 0) return false;
        c.fillStyle = p.k ? 'rgba(200,235,255,.75)' : 'rgba(225,240,255,' + (p.life * .55) + ')';
        c.beginPath(); c.arc(p.x, p.y, p.k ? p.r : p.r * (1.6 - p.life), 0, 7); c.fill();
        return true;
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && vis && !still()) raf = requestAnimationFrame(frame); else if (still()) c.clearRect(0, 0, w || 0, h || 0); }
    watch(cv, function (v) { vis = v; if (v) { size(); kick(); } });
    return { kick: kick, size: size };
  })();

  // ---------------------------------------------------------------- the remote writes the message
  var JOB = { he: ['תיקון מזגן', 'התקנת מזגן', 'פירוק מזגן', 'ניקוי מזגן'], en: ['repairing an A/C', 'installing an A/C', 'removing an A/C', 'cleaning an A/C'] };
  var MODE = { he: ['תיקון', 'התקנה', 'פירוק', 'ניקוי'], en: ['Repair', 'Install', 'Removal', 'Cleaning'] };
  var ROOM = { he: ['בסלון', 'בחדר השינה', 'ביחידת הדיור', 'במשרד'], en: ['in the living room', 'in the bedroom', 'in the flat', 'in the office'] };
  var ICON = ['i-wrench', 'i-unit', 'i-out', 'i-drop'];
  var job = 0, room = -1, typing = 0, touched = [true, false, false];
  var lcd = $('[data-lcd]'), send = $('[data-send]'), area = $('[data-area]');
  function msg() {
    var l = root.lang, a = area.value.trim();
    if (l === 'he') return 'שלום ליב מזגנים, אשמח לעזרה עם ' + JOB.he[job] + (room >= 0 ? ' ' + ROOM.he[room] : '') + '.' + (a ? ' אזור: ' + a + '.' : '') + ' תודה!';
    return 'Hi Liv A/C, I’d like help with ' + JOB.en[job] + (room >= 0 ? ' ' + ROOM.en[room] : '') + '.' + (a ? ' Area: ' + a + '.' : '') + ' Thanks!';
  }
  function steps() { $$('[data-step]').forEach(function (s, i) { s.classList.toggle('on', i < 3 ? touched[i] : false); }); }
  function compose(instant) {
    var m = msg();
    $('[data-lcd-mode]').textContent = MODE[root.lang][job];
    $('[data-lcd-icon] use').setAttribute('href', '#' + ICON[job]);
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    clearInterval(typing);
    if (instant || still()) { lcd.textContent = m; return; }
    var cur = lcd.textContent, k = 0; while (k < cur.length && cur[k] === m[k]) k++;
    typing = setInterval(function () { k++; lcd.textContent = m.slice(0, k); if (k >= m.length) clearInterval(typing); }, 22);
  }
  $$('[data-job]').forEach(function (b) { b.addEventListener('click', function () { job = +b.dataset.job; touched[0] = true; $$('[data-job]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); steps(); compose(); }); });
  $$('[data-room]').forEach(function (b) { b.addEventListener('click', function () { var r = +b.dataset.room; room = room === r ? -1 : r; touched[1] = room >= 0; $$('[data-room]').forEach(function (x) { x.setAttribute('aria-pressed', +x.dataset.room === room ? 'true' : 'false'); }); steps(); compose(); }); });
  area.addEventListener('input', function () { touched[2] = !!area.value.trim(); steps(); compose(true); });
  send.addEventListener('click', function () { $$('[data-step]')[3].classList.add('on'); });
  // first time the remote is seen it types its opening message
  var typed = false;
  watch($('[data-remote]'), function (v) { if (v && !typed) { typed = true; lcd.textContent = ''; compose(); steps(); } }, { threshold: .3 });

  // ---------------------------------------------------------------- odometer for the rating
  $$('[data-odo]').forEach(function (o) {
    o.setAttribute('aria-label', o.dataset.odo);
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span aria-hidden="true">' + ch + '</span>';
      return '<span class="odo-d" aria-hidden="true" data-to="' + ch + '"><span></span></span>';
    }).join('');
    function roll(go) { $$('.odo-d', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? i * 160 + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 1.2) + 'em)'; }); }
    if (still()) roll(true); else { roll(false); watch(o, function (v) { if (v) roll(true); }, { threshold: .4 }); }
  });

  // ---------------------------------------------------------------- reviews: a second copy keeps the drift seamless
  (function () { var row = $('.rv-row'); $$('.rv', row).forEach(function (r) { var k = r.cloneNode(true); k.setAttribute('aria-hidden', 'true'); row.appendChild(k); }); })();

  // ---------------------------------------------------------------- bento spotlight and the tilting card
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  $$('[data-tilt]').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { if (still() || !fine) return; var r = t.getBoundingClientRect(); t.style.setProperty('--rx', ((e.clientX - r.left) / r.width - .5) * 14 + 'deg'); t.style.setProperty('--ry', -((e.clientY - r.top) / r.height - .5) * 14 + 'deg'); });
    t.addEventListener('pointerleave', function () { t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); });
  });

  // ---------------------------------------------------------------- scroll loop: nav, louvres, stacked landing, rack focus
  var hideCap = [$('[data-remote] .remote'), $('.bento')], foot = $('[data-foot]');
  var work = $('[data-work]'), tools = $('[data-tools]'), focus = $('[data-focus]'), tick = false;
  function onScroll() {
    tick = false;
    var y = scrollY, vh = innerHeight;
    nav.classList.toggle('pill', y > 60);
    // the curtain footer is only painted once the page above starts to lift off it
    var mainEl = $('main'); foot.style.visibility = y + vh > mainEl.offsetTop + mainEl.offsetHeight - 4 ? '' : 'hidden';
    cap.classList.toggle('show', y > hero.offsetHeight * .6 && !hideCap.some(function (el) { var r = el.getBoundingClientRect(); return r.top < vh * .8 && r.bottom > vh * .3; }) && y + vh < document.documentElement.scrollHeight - foot.offsetHeight * .5);
    var hr = hero.getBoundingClientRect();
    louvres.update(clamp(-hr.top / (hr.height * .85), 0, 1));
    // the work section settles back as the tools card lands over it
    var tr = tools.getBoundingClientRect(), p = still() ? 0 : clamp(1 - tr.top / vh, 0, 1);
    work.style.transform = p ? 'scale(' + (1 - p * .05) + ')' : '';
    work.style.opacity = p ? 1 - p * .45 : '';
    var fr = focus.getBoundingClientRect();
    focus.style.setProperty('--f', still() ? 1 : smooth(1 - (fr.top + fr.height * .3 - vh * .5) / vh).toFixed(3));
  }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { air.size(); mist.size(); louvres.build(); onScroll(); }, 150); });

  // ---------------------------------------------------------------- start
  texts(root.lang); hours(); compose(true); steps();
  var hImg = $('[data-hphoto] img');
  function go() { louvres.build(); onScroll(); hero.classList.add('ready', 'dealt'); }
  if (hImg.complete) go(); else { hImg.addEventListener('load', go); setTimeout(go, 1200); }
  requestAnimationFrame(function () { hero.classList.add('ready'); });
})();
