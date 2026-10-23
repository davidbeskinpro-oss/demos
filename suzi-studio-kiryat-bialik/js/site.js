(function () {
  var root = document.documentElement, WA = '972536291173';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 900; };
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var TITLE = { he: 'סטודיו סוזי · ציפורניים, גבות, ריסים · שדרות ירושלים 12, קריית ביאליק', en: 'Suzi Studio · Nails, brows, lashes · 12 Sderot Yerushalayim, Kiryat Bialik' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור סטודיו היופי Suzi · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Suzi Beauty Studio · This is not the business’s official website' };

  // ------------------------------------------------ language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'סטודיו סוזי', 'Suzi Studio');
    aria('[data-t-navlinks]', 'ראשי', 'Main');
    aria('[data-t-foot]', 'תחתית', 'Footer');
    aria('[data-t-call]', 'התקשרו לסטודיו, 053-629-1173', 'Call the studio, 053-629-1173');
    aria('[data-t-wa]', 'וואטסאפ לסטודיו', 'WhatsApp the studio');
    aria('[data-shelf]', 'בחירת טיפולים', 'Pick treatments');
    aria('[data-compare-range]', 'השוואה בין מבריק למט', 'Compare gloss and matte');
    var f = $('.v-map iframe'); if (f) f.title = l === 'he' ? 'מפה: שדרות ירושלים 12, קריית ביאליק' : 'Map: 12 Sderot Yerushalayim, Kiryat Bialik';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('suzi-lang', l); } catch (e) {}
    texts(l); hours(); compose(true); waLinks(); sizeDots();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ------------------------------------------------ motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('suzi-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    fanDeal(); compose(true); dots.kick(); tick();
  }); });
  motionUI();

  // ------------------------------------------------ hours, Israel time. null = closed
  var H = { 0: [9, 21], 1: [9, 21], 2: [9, 21], 3: [9, 21], 4: [9, 21], 5: [9, 16], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    var is247 = Object.keys(H).every(function (k) { return H[k] && H[k][0] === 0 && H[k][1] === 24; });
    if (is247) { open = true; txt = l ? 'פתוח 24/7' : 'Open 24/7'; }
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

  // ------------------------------------------------ entrances + living tiles
  $$('[data-bento],.vbento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  var lio = io ? new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('live', e.isIntersecting); }); }) : null;
  $$('.tile').forEach(function (t) { lio ? lio.observe(t) : t.classList.add('live'); });
  if (finePointer) $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });

  // ------------------------------------------------ hero: the real photos dealt into a swatch fan
  var fan = $('[data-fan]'), cards = $$('.card', fan), fanbox = $('[data-fanbox]'), heroEl = $('[data-hero]');
  var lifted = cards.length - 1, cycle = 0;
  function fanLayout(close) {
    var n = cards.length, step = phone() ? 10 : 12.5;
    cards.forEach(function (c, i) {
      var r = (i - (n - 1) / 2) * step * (1 - close * .75);
      var spread = 0;
      if (lifted >= 0 && i !== lifted && close < .5) spread = (i < lifted ? -1 : 1) * 3;
      c.style.setProperty('--r', (r + spread).toFixed(2) + 'deg');
      c.style.setProperty('--y', (i === lifted ? -26 : 0) - close * 40 + 'px');
      c.classList.toggle('lift', i === lifted);
    });
  }
  function fanDeal() {
    cards.forEach(function (c, i) { c.style.transitionDelay = still() ? '0ms' : (120 + i * 90) + 'ms'; });
    requestAnimationFrame(function () {
      fan.classList.add('dealt'); fanLayout(0);
      setTimeout(function () { cards.forEach(function (c) { c.style.transitionDelay = ''; c.style.setProperty('--sh', '120%'); }); }, still() ? 0 : 1100);
    });
  }
  fanDeal();
  if (finePointer) {
    fanbox.addEventListener('pointermove', function (e) {
      var best = -1, bd = 1e9;
      cards.forEach(function (c, i) { var r = c.getBoundingClientRect(); var d = Math.abs(e.clientX - (r.left + r.width / 2)); if (d < bd) { bd = d; best = i; } });
      if (best !== lifted) { lifted = best; fanLayout(heroP); }
    });
  }
  fan.addEventListener('click', function (e) { var c = e.target.closest('.card'); if (c) { lifted = cards.indexOf(c); fanLayout(heroP); } });
  setInterval(function () {
    if (still() || finePointer || document.hidden || heroP > .6) return;
    cycle = (cycle + 1) % cards.length; lifted = cards.length - 1 - cycle; fanLayout(heroP);
  }, 1800);

  // ------------------------------------------------ the logo made of particles: pink dot + SUZI, petals drifting
  var cv = $('[data-dots]'), cx = cv.getContext('2d'), W = 0, Hh = 0, pts = [], petals = [], mouse = { x: -999, y: -999 }, heroP = 0, dotsVisible = true;
  function sizeDots() {
    var dpr = Math.min(2, devicePixelRatio || 1), r = cv.getBoundingClientRect();
    W = r.width; Hh = r.height; cv.width = W * dpr; cv.height = Hh * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildDots();
  }
  function buildDots() {
    pts = [];
    var R = Math.min(W, Hh) * .4, ox = W / 2, oy = Hh * .42;
    // the letters: rendered once off-screen in the logo's condensed face, sampled to points
    var oc = document.createElement('canvas'), s = Math.ceil(R * 2); oc.width = s; oc.height = s;
    var o = oc.getContext('2d'); o.direction = 'ltr'; o.fillStyle = '#fff'; o.textAlign = 'center'; o.textBaseline = 'middle';
    o.font = '700 ' + Math.round(R * 1.05) + 'px Karantina, "Arial Narrow", sans-serif';
    o.fillText('SUZI', s / 2, s / 2 + R * .06);
    var data = o.getImageData(0, 0, s, s).data, gap = Math.max(4, Math.round(R / 34));
    for (var y = 0; y < s; y += gap) for (var x = 0; x < s; x += gap) {
      var dx = x - R, dy = y - R; if (dx * dx + dy * dy > R * R) continue;
      var letter = data[(y * s + x) * 4 + 3] > 128;
      var jx = (Math.random() - .5) * gap * .5, jy = (Math.random() - .5) * gap * .5;
      pts.push({ hx: ox + dx + jx, hy: oy + dy + jy, x: ox + dx * 1.6 + (Math.random() - .5) * W * .4, y: oy + dy * 1.6 + (Math.random() - .5) * Hh * .4, vx: 0, vy: 0, l: letter, a: Math.random() * 6.28, sz: letter ? gap * .36 : gap * (.26 + Math.random() * .16) });
    }
    if (still()) pts.forEach(function (p) { p.x = p.hx; p.y = p.hy; });
    petals = [];
    var np = phone() ? 9 : 14;
    for (var k = 0; k < np; k++) petals.push({ x: Math.random() * W, y: Math.random() * Hh, s: 8 + Math.random() * 12, r: Math.random() * 6.28, vr: (Math.random() - .5) * .02, vy: .25 + Math.random() * .45, ph: Math.random() * 6.28, c: ['#f7a3c6', '#fbb8d6', '#e86a9c', '#f6d7c2'][k % 4] });
  }
  function petal(p) {
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.globalAlpha = .75;
    cx.beginPath(); cx.moveTo(0, -p.s); cx.bezierCurveTo(p.s * .9, -p.s * .6, p.s * .7, p.s * .7, 0, p.s); cx.bezierCurveTo(-p.s * .7, p.s * .7, -p.s * .9, -p.s * .6, 0, -p.s); cx.fill();
    cx.globalAlpha = .35; cx.fillStyle = '#fff'; cx.beginPath(); cx.ellipse(-p.s * .2, -p.s * .25, p.s * .12, p.s * .45, -.3, 0, 6.28); cx.fill();
    cx.restore();
  }
  var t0 = performance.now();
  function drawDots(t) {
    cx.clearRect(0, 0, W, Hh);
    var R = Math.min(W, Hh) * .4, ox = W / 2, oy = Hh * .42, disp = smooth(heroP * 1.4), live = !still();
    // soft glow under the dot, like light on the shop's pink fascia
    var g = cx.createRadialGradient(ox, oy, R * .2, ox, oy, R * 1.25);
    g.addColorStop(0, 'rgba(251,184,214,' + (.55 * (1 - disp)) + ')'); g.addColorStop(1, 'rgba(251,184,214,0)');
    cx.fillStyle = g; cx.fillRect(0, 0, W, Hh);
    var pink = new Path2D(), white = new Path2D();
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      var tx = p.hx + (p.hx - ox) * disp * 1.3, ty = p.hy + (p.hy - oy) * disp * 1.3 - disp * 60;
      if (live) {
        p.a += .02; tx += Math.cos(p.a) * 1.2; ty += Math.sin(p.a * 1.3) * 1.2;
        var mx = p.x - mouse.x, my = p.y - mouse.y, d2 = mx * mx + my * my;
        if (d2 < 6400) { var f = (6400 - d2) / 6400 * 2.6, d = Math.sqrt(d2) || 1; p.vx += mx / d * f; p.vy += my / d * f; }
        p.vx += (tx - p.x) * .045; p.vy += (ty - p.y) * .045; p.vx *= .82; p.vy *= .82; p.x += p.vx; p.y += p.vy;
      } else { p.x = tx; p.y = ty; }
      var path = p.l ? white : pink; path.moveTo(p.x + p.sz, p.y); path.arc(p.x, p.y, p.sz, 0, 6.2832);
    }
    cx.globalAlpha = 1 - disp * .9;
    cx.fillStyle = '#f7a3c6'; cx.fill(pink);
    cx.fillStyle = '#ffffff'; cx.fill(white);
    cx.globalAlpha = 1;
    for (var k = 0; k < petals.length; k++) {
      var q = petals[k];
      if (live) { q.y += q.vy; q.x += Math.sin(t / 900 + q.ph) * .5; q.r += q.vr; if (q.y > Hh + 20) { q.y = -20; q.x = Math.random() * W; } }
      petal(q);
    }
  }
  var dots = { raf: 0, kick: function () { if (!dots.raf) dots.raf = requestAnimationFrame(dots.loop); }, loop: function (t) {
    dots.raf = 0; drawDots(t);
    if (!still() && dotsVisible && !document.hidden) dots.raf = requestAnimationFrame(dots.loop);
  } };
  if (io) new IntersectionObserver(function (es) { dotsVisible = es[0].isIntersecting; if (dotsVisible) dots.kick(); }).observe(heroEl);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) dots.kick(); });
  fanbox.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  fanbox.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });
  // phones: a tap sends a ripple through the dots
  fanbox.addEventListener('pointerdown', function (e) { if (finePointer) return; var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; setTimeout(function () { mouse.x = mouse.y = -999; }, 380); });
  var fontsReady = document.fonts && document.fonts.load ? document.fonts.load('700 100px Karantina') : Promise.resolve();
  sizeDots(); dots.kick();
  fontsReady.then(function () { sizeDots(); dots.kick(); }, function () {});

  // ------------------------------------------------ scroll scenes (all reversible)
  var nav = $('[data-nav]'), portal = $('[data-portal]'), mirror = $('[data-mirror]'), mphoto = $('[data-mirrorphoto]'), bulbsRow = $$('[data-bulbrow] i'),
      bulbs = $$('.bulb', mphoto), lessons = $$('.lessons li'), band = $('[data-band]'), reviews = $('[data-reviews]'), foot = $('[data-foot]'),
      dock = $('[data-dock]'), heroCta = $('.hero .cta');
  var lastLit = -1;
  function tick() {
    var vh = innerHeight, y = scrollY, s = still();
    nav.classList.toggle('pill', y > 40);
    var hr = heroEl.getBoundingClientRect();
    var hp = clamp(-hr.top / Math.max(1, hr.height * .9), 0, 1);
    if (Math.abs(hp - heroP) > .002) { heroP = hp; if (!s) { fanLayout(heroP); dots.kick(); } }
    // portal: the pink dot opens into the team photo
    if (!s) {
      var pr = portal.getBoundingClientRect(), pp = clamp(-pr.top / Math.max(1, pr.height - vh), 0, 1);
      var diag = Math.hypot(innerWidth, vh) / 2, r0 = Math.min(innerWidth, vh) * .24;
      var o = smooth((pp - .04) / .56);
      portal.style.setProperty('--cr', lerp(r0, diag + 10, o).toFixed(1) + 'px');
      portal.style.setProperty('--ds', (1 + o * .5).toFixed(3));
      portal.style.setProperty('--ps', lerp(1.3, 1, o).toFixed(3));
      portal.style.setProperty('--po', (1 - smooth(o * 4)).toFixed(3));
      portal.style.setProperty('--co', smooth((pp - .58) / .2).toFixed(3));
    }
    // the mirror: bulbs switch on one by one
    var mr = mirror.getBoundingClientRect();
    var rowK = s ? 1 : clamp((vh - mr.top) / (vh * .7), 0, 1);
    var lit = Math.round(rowK * bulbsRow.length);
    if (lit !== lastLit) { lastLit = lit; bulbsRow.forEach(function (b, i) { b.classList.toggle('on', i < lit); }); }
    var ph = mphoto.getBoundingClientRect(), mk = s ? 1 : clamp((vh * .95 - ph.top) / (ph.height * .9), 0, 1);
    bulbs.forEach(function (b, i) { b.classList.toggle('on', mk > (i + 1) / (bulbs.length + 1)); });
    lessons.forEach(function (li, i) { li.classList.toggle('on', mk > (i + .5) / (lessons.length + .5)); });
    if (!s) { mphoto.style.setProperty('--mb', lerp(.42, 1, smooth(mk)).toFixed(3)); mphoto.style.setProperty('--ms', lerp(.7, 1.05, smooth(mk)).toFixed(3)); }
    // the petal band drifts sideways
    var br = band.getBoundingClientRect(), bk = clamp((vh - br.top) / (vh + br.height), 0, 1);
    band.style.setProperty('--bx', s ? '0%' : lerp(-14, 14, bk).toFixed(2) + '%');
    // the peony opens behind the reviews
    var rr = reviews.getBoundingClientRect(), rk = clamp((vh - rr.top) / (vh + rr.height), 0, 1);
    reviews.style.setProperty('--bz', s ? 1.05 : lerp(1.4, 1.02, smooth(rk * 1.3)).toFixed(3));
    reviews.style.setProperty('--br', s ? '0deg' : lerp(-8, 0, smooth(rk * 1.3)).toFixed(2) + 'deg');
    // footer curtain: the shop front settles and the sign catches the light
    var fr = foot.getBoundingClientRect(), fk = clamp((vh - fr.top) / fr.height, 0, 1);
    var docEnd = document.documentElement.scrollHeight - vh - y;
    var fk2 = clamp(1 - docEnd / Math.max(1, fr.height), 0, 1);
    foot.style.setProperty('--fy', s ? '0%' : lerp(-18, 0, smooth(fk2)).toFixed(2) + '%');
    foot.style.setProperty('--fz', s ? 1 : lerp(1.14, 1, smooth(fk2)).toFixed(3));
    foot.style.setProperty('--ss', s ? '-100%' : lerp(-110, 110, smooth((fk2 - .35) / .6)).toFixed(1) + '%');
    // phone dock steps aside while the hero buttons are on screen
    var cr = heroCta.getBoundingClientRect();
    dock.classList.toggle('away', cr.bottom > 0 && cr.top < vh);
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); } }, { passive: true });
  addEventListener('resize', function () { sizeDots(); fanLayout(heroP); tick(); });

  // ------------------------------------------------ odometer: 4.9 rolls up when it arrives
  var odo = $('[data-odo]');
  if (io) new IntersectionObserver(function (es, ob) {
    if (!es[0].isIntersecting) return; ob.disconnect();
    if (still()) return;
    var t1 = performance.now(), target = 4.9;
    (function f(t) { var k = clamp((t - t1) / 1400, 0, 1), e = 1 - Math.pow(1 - k, 3); odo.textContent = (target * e).toFixed(1); if (k < 1) requestAnimationFrame(f); })(t1);
  }).observe(odo);

  // ------------------------------------------------ reviews drift: duplicate the run so it loops without a seam
  var track = $('[data-track]');
  $$('.rev', track).forEach(function (r) { var c = r.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); });

  // ------------------------------------------------ gloss or matte
  var cmp = $('[data-compare]'), rng = $('[data-compare-range]');
  function setX(v) { cmp.style.setProperty('--x', v + '%'); }
  rng.addEventListener('input', function () { setX(rng.value); });
  if (io) new IntersectionObserver(function (es, ob) {
    if (!es[0].isIntersecting) return; ob.disconnect();
    if (still()) return;
    var keys = [50, 22, 78, 50], t1 = performance.now(), D = 2200;
    (function f(t) {
      var k = clamp((t - t1) / D, 0, 1), seg = Math.min(2, Math.floor(k * 3)), lk = smooth(k * 3 - seg);
      var v = lerp(keys[seg], keys[seg + 1], lk); setX(v.toFixed(1)); rng.value = v;
      if (k < 1) requestAnimationFrame(f);
    })(t1);
  }, { threshold: .5 }).observe(cmp);

  // ------------------------------------------------ build a set: bottles -> ticket -> WhatsApp message typing itself
  var bottles = $$('.bottle'), picks = $('[data-picks]'), empty = $('[data-empty]'), msgEl = $('[data-msg]'), send = $('[data-send]'), typeT = 0;
  function listJoin(a, l) {
    if (a.length < 2) return a.join('');
    return l === 'he' ? a.slice(0, -1).join(', ') + ' ו' + a[a.length - 1] : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
  }
  function message() {
    var l = he() ? 'he' : 'en', chosen = bottles.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.dataset[l]; });
    if (!chosen.length) return l === 'he' ? 'היי, אשמח לקבוע תור בסטודיו. מתי יש מקום?' : 'Hi, I’d like to book an appointment at the studio. When do you have a spot?';
    return l === 'he' ? 'היי, אשמח לקבוע תור ל' + listJoin(chosen, 'he') + '. מתי יש מקום?' : 'Hi, I’d like to book ' + listJoin(chosen, 'en') + ' at Suzi Studio. When do you have a spot?';
  }
  function compose(instant) {
    var l = he() ? 'he' : 'en';
    var chosen = bottles.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; });
    picks.innerHTML = chosen.map(function (b) { return '<li><i style="--c:' + b.style.getPropertyValue('--c') + '"></i>' + b.dataset[l].replace(/^./, function (c) { return c.toUpperCase(); }) + '</li>'; }).join('');
    empty.hidden = chosen.length > 0;
    var m = message();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    clearTimeout(typeT);
    if (instant || still()) { msgEl.textContent = m; return; }
    var cur = msgEl.textContent, i = 0;
    while (i < cur.length && i < m.length && cur[i] === m[i]) i++;
    (function step() { msgEl.textContent = m.slice(0, i); if (i < m.length) { i += 1; typeT = setTimeout(step, 18); } })();
  }
  bottles.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); compose(false); }); });
  function waLinks() { $$('[data-wa-link]').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(he() ? 'היי, אשמח לקבוע תור בסטודיו. מתי יש מקום?' : 'Hi, I’d like to book an appointment at the studio. When do you have a spot?'); }); }
  waLinks();

  texts(root.lang === 'en' ? 'en' : 'he'); hours(); compose(true); tick();
  addEventListener('load', function () { sizeDots(); tick(); });
})();
