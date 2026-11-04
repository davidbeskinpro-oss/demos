(function () {
  var root = document.documentElement, WA = '972547595754';
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
  var TITLE = { he: 'Witch Beauty · מספרה של נטלי · שדרות מוריה 15, חיפה', en: 'Witch Beauty · Natalie’s hair salon · 15 Sderot Moriya, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Witch Beauty · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Witch Beauty · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-spools]', 'צבעי החוטים', 'Thread colours');
    aria('[data-t-cards]', 'מה תרצו', 'What would you like');
    aria('[data-t-when]', 'מתי נוח', 'When suits you');
    aria('[data-t-call]', 'התקשרו לנטלי, 054-759-5754', 'Call Natalie, 054-759-5754');
    aria('[data-t-wa]', 'וואטסאפ לנטלי', 'WhatsApp Natalie');
    $('.v-map iframe').title = l === 'he' ? 'Google Maps: שדרות מוריה 15, חיפה' : 'Google Maps: 15 Sderot Moriya, Haifa';
    $$('[data-decode]').forEach(function (f) { f.textContent = f.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('wb-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('wb-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    clearStyles(); layout(); dust.kick(); orbit.kick(); powder.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [10.5, 21], 1: [10, 21], 2: [10.5, 21], 3: [10, 21], 4: [11, 21], 5: [10.5, 21], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false, dial = 0;
    if (t && t[0] === 0 && t[1] === 24) { open = true; dial = 1; txt = l ? 'פתוח עכשיו' : 'Open now'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; dial = (n.h - t[0]) / (t[1] - t[0]); txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      dial = t ? 1 : 0;
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
    // the moon on the dial travels the arc of today's opening hours (sunrise side = opening)
    var a = Math.PI * (1 - dial), x = 110 + 90 * Math.cos(a) * (rtl() ? -1 : 1), y = 110 - 90 * Math.sin(a);
    $('[data-dialmoon]').setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
    var dd = $('[data-dialdone]'); dd.style.strokeDashoffset = (283 * (1 - dial)).toFixed(1); dd.style.transform = rtl() ? 'scaleX(-1)' : ''; dd.style.transformOrigin = '110px 0';
  }
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

  // ---------------------------------------------------------------- entrances
  $$('.bento,.v-bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // the name, letter by letter (hero) and in the footer
  var ci = 0;
  $$('[data-split] .ln').forEach(function (ln) { ln.innerHTML = ln.textContent.split('').map(function (c) { return '<span class="ch" style="--i:' + (ci++) + '">' + c + '</span>'; }).join(''); });
  var fmark = $('[data-fmark]');
  fmark.innerHTML = fmark.textContent.split('').map(function (c) { return '<span class="ch" aria-hidden="true">' + (c === ' ' ? '&nbsp;' : c) + '</span>'; }).join('');
  var fch = $$('.ch', fmark);

  var hero = $('[data-hero]'), nav = $('[data-nav]'), mirror = $('[data-mirror]'), mphoto = $('[data-mphoto]'), shine = $('[data-shine]'), moon = $('[data-moon]');

  // ---------------------------------------------------------------- sparkle dust: drifts up by itself, follows the hand;
  // on a phone an invisible wand traces a slow figure over the mirror
  function star(c, x, y, r, rot) {
    c.save(); c.translate(x, y); c.rotate(rot); c.beginPath();
    c.moveTo(0, -r); c.quadraticCurveTo(0, 0, r, 0); c.quadraticCurveTo(0, 0, 0, r); c.quadraticCurveTo(0, 0, -r, 0); c.quadraticCurveTo(0, 0, 0, -r);
    c.fill(); c.restore();
  }
  var COLS = ['255,236,214', '242,183,197', '232,203,146', '201,184,240'];
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = true, px = -1, py = -1, lx = -1, ly = -1, t0 = performance.now();
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function add(x, y, burst) {
      P.push({ x: x, y: y, vx: (Math.random() - .5) * (burst ? 1.6 : .3), vy: -(Math.random() * (burst ? 1.2 : .45) + .15), r: Math.random() * (burst ? 5 : 3.4) + 1.2, life: 0, max: 60 + Math.random() * 90, rot: Math.random() * 6.28, vr: (Math.random() - .5) * .06, col: COLS[Math.floor(Math.random() * COLS.length)] });
    }
    function drawStatic() {
      c.clearRect(0, 0, w, h); var rnd = 7;
      for (var i = 0; i < 46; i++) { rnd = (rnd * 9301 + 49297) % 233280; var a = rnd / 233280; rnd = (rnd * 9301 + 49297) % 233280; var b = rnd / 233280; c.fillStyle = 'rgba(' + COLS[i % 4] + ',.55)'; star(c, a * w, b * h, 1.5 + (i % 5), 0); }
    }
    function frame(t) {
      raf = 0; if (still()) { drawStatic(); return; }
      if (P.length < 90 && Math.random() < .55) add(Math.random() * w, h * (.3 + Math.random() * .75));
      var ax = px, ay = py;
      if (!fine || px < 0) {   // the wand: a slow figure of eight around the mirror
        var mr = mirror.getBoundingClientRect(), hr = hero.getBoundingClientRect(), T = (t - t0) / 1000;
        ax = mr.left - hr.left + mr.width * (.5 + .42 * Math.sin(T * .7)); ay = mr.top - hr.top + mr.height * (.55 + .32 * Math.sin(T * 1.4));
      }
      if (ax >= 0) {
        if (lx >= 0) { var d = Math.hypot(ax - lx, ay - ly), n = Math.min(6, Math.ceil(d / 14)); for (var k = 0; k < n; k++) if (Math.random() < .6) add(lerp(lx, ax, k / n), lerp(ly, ay, k / n), true); }
        lx = ax; ly = ay;
      }
      c.clearRect(0, 0, w, h);
      for (var i = P.length - 1; i >= 0; i--) {
        var p = P[i]; p.life++; p.x += p.vx; p.y += p.vy; p.vx *= .985; p.rot += p.vr;
        var a = Math.sin(Math.PI * p.life / p.max);
        if (p.life >= p.max) { P.splice(i, 1); continue; }
        c.fillStyle = 'rgba(' + p.col + ',' + (a * .9).toFixed(3) + ')';
        star(c, p.x, p.y, p.r * (.6 + .4 * a), p.rot);
      }
      if (vis) raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = hero.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { px = -1; lx = -1; });
    hero.addEventListener('pointerdown', function (e) { if (still()) return; var r = hero.getBoundingClientRect(); for (var k = 0; k < 22; k++) add(e.clientX - r.left, e.clientY - r.top, true); });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // mirror: the photo leans toward the hand; a sheen slides across the hair (hand on desktop, time + scroll on phones)
  hero.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var r = mirror.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
    mphoto.style.setProperty('--px', (-nx * 18).toFixed(1) + 'px'); mphoto.style.setProperty('--py', (-ny * 18).toFixed(1) + 'px');
    shine.style.setProperty('--sx', (nx * 120).toFixed(1) + '%');
  });

  // ---------------------------------------------------------------- the orbit of her photos around the moon
  var orbit = (function () {
    var wrap = $('[data-orbitwrap]'), el = $('[data-orbit]');
    $$('.oc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $('img', k).alt = ''; el.appendChild(k); });
    var cards = $$('.oc', el), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = false, last = 0, front = -1;
    function R() { var cw = cards[0].offsetWidth || 180; return Math.max(cw * 1.08 / (2 * Math.tan(Math.PI / N)), phone() ? 250 : innerWidth * .34); }
    function frame(t) {
      raf = 0; if (still()) return;
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (7 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var r = R(), sc = scrollY * .05 * (rtl() ? 1 : -1), best = -2, bi = 0;
      cards.forEach(function (c, i) {
        var a = rot + sc + i * step, f = Math.cos(a * Math.PI / 180), lift = f > .95 ? (f - .95) * 20 : 0;
        if (f > best) { best = f; bi = i; }
        c.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + (r + lift * 40).toFixed(1) + 'px) scale(' + (1 + lift * .06).toFixed(3) + ')';
        c.style.filter = 'brightness(' + (.35 + .65 * Math.pow(Math.max(f, 0), 1.5)).toFixed(3) + ')';
      });
      if (bi !== front) { front = bi; decode($('figcaption', cards[bi])); }
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still()) { last = 0; raf = requestAnimationFrame(frame); } }
    el.style.transform = 'rotateX(-8deg)';
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .25; vel = dx * 2 * (rtl() ? 1 : -1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(wrap, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // labels decode out of scrambled letters as their card comes to the front
  function decode(f) {
    var txt = f.dataset[he() ? 'he' : 'en'], pool = he() ? 'אבגדהוזחטיכלמנסעפצקרשת' : 'abcdefghijklmnopqrstuvwxyz';
    clearInterval(f._t);
    if (still()) { f.textContent = txt; return; }
    var n = 0;
    f._t = setInterval(function () {
      n++;
      f.textContent = txt.split('').map(function (ch, i) { return ch === ' ' || i < n / 2 ? ch : pool[Math.floor(Math.random() * pool.length)]; }).join('');
      if (n / 2 >= txt.length) { clearInterval(f._t); f.textContent = txt; }
    }, 34);
  }

  // ---------------------------------------------------------------- the braid: lobes woven one by one with the scroll
  var braids = $('[data-braids]'), plait = $('[data-plait]'), bphoto = $('[data-bphoto]'), spools = $$('[data-spool]');
  var SP = [['#f2a0a8', '#f1e07c'], ['#a88be8', '#d6336f'], ['#8a6040', '#a8784f']], spool = 0, picked = false;
  var LOBES = 12, STEP = 46, TOP = 26, lobes = [], tails, band, woven = -1;
  function el(tag, at, parent) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  function leaf(s, y, wide) {
    // a lobe runs from the outer edge on one side, down and across the middle to the other side
    var x0 = 100 + s * 64 * wide, y0 = y, x1 = 100 - s * 22 * wide, y1 = y + 78;
    return 'M' + x0 + ' ' + y0 +
      ' C' + (100 + s * 82 * wide) + ' ' + (y + 26) + ' ' + (100 + s * 30 * wide) + ' ' + (y + 64) + ' ' + x1 + ' ' + y1 +
      ' C' + (100 + s * 4 * wide) + ' ' + (y + 54) + ' ' + (100 + s * 40 * wide) + ' ' + (y + 18) + ' ' + x0 + ' ' + y0 + 'Z';
  }
  function buildPlait() {
    plait.innerHTML = '';
    var defs = el('defs', {}, plait), g = el('linearGradient', { id: 'hair', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
    el('stop', { offset: 0, 'stop-color': '#9a6c48' }, g); el('stop', { offset: .55, 'stop-color': '#6b4630' }, g); el('stop', { offset: 1, 'stop-color': '#4a2f22' }, g);
    tails = el('g', {}, plait);
    for (var i = 0; i < LOBES; i++) {
      var s = i % 2 ? -1 : 1, y = TOP + i * STEP, grp = el('g', { class: 'lobe' }, plait);
      el('path', { d: leaf(s, y, 1), fill: 'url(#hair)' }, grp);
      el('path', { d: leaf(s, y + 8, .62), class: 'thr', 'data-strand': i % 3 }, grp);
      for (var k = 0; k < 3; k++) el('path', { d: 'M' + (100 + s * (60 - k * 8)) + ' ' + (y + 6 + k * 4) + ' C' + (100 + s * (64 - k * 10)) + ' ' + (y + 34) + ' ' + (100 + s * (20 - k * 6)) + ' ' + (y + 60) + ' ' + (100 - s * (14 - k * 3)) + ' ' + (y + 72 - k * 3), fill: 'none', stroke: 'rgba(255,226,196,.28)', 'stroke-width': .9 }, grp);
      lobes.push(grp);
    }
    band = el('ellipse', { rx: 13, ry: 6, fill: '#e8cb92' }, plait);
    paint();
  }
  function paint() {
    $$('.thr', plait).forEach(function (p) { var st = +p.dataset.strand; p.style.fill = st === 2 ? '#7a5338' : SP[spool][st]; });
    if (tails) setTails(woven < 0 ? 0 : woven, true);
  }
  function setTails(k, force) {
    if (k === woven && !force) return; woven = k;
    lobes.forEach(function (g, i) { g.classList.toggle('off', i >= k); });
    var y = TOP + (k ? (k - 1) * STEP + 78 : 0), len = 70 + (LOBES - k) * 30, xs = k ? [86, 100, 114] : [70, 100, 130], spread = k ? 18 : 30;
    tails.innerHTML = '';
    xs.forEach(function (x, i) {
      var d = 'M' + x + ' ' + y + ' C' + (x + (i - 1) * spread) + ' ' + (y + len * .35) + ' ' + (x - (i - 1) * 6) + ' ' + (y + len * .7) + ' ' + (x + (i - 1) * spread * 1.4) + ' ' + (y + len);
      el('path', { d: d, fill: 'none', stroke: '#6b4630', 'stroke-width': 13, 'stroke-linecap': 'round' }, tails);
      if (i < 2) el('path', { d: d, fill: 'none', stroke: SP[spool][i], 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-dasharray': '10 7' }, tails);
    });
    band.setAttribute('cx', 100); band.setAttribute('cy', y + 2); band.style.opacity = k >= LOBES ? 1 : 0;
  }
  function setSpool(n, byHand) {
    if (byHand) picked = true;
    if (n === spool) return; spool = n;
    spools.forEach(function (b) { b.setAttribute('aria-checked', +b.dataset.spool === n ? 'true' : 'false'); });
    bphoto.classList.toggle('v', n === 1);
    paint();
  }
  spools.forEach(function (b) { b.addEventListener('click', function () { setSpool(+b.dataset.spool, true); }); });
  buildPlait();

  // ---------------------------------------------------------------- bento: tilt toward the hand, spotlight, the powder field
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) {
      var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px');
      if (t.hasAttribute('data-tilt') && !still() && e.pointerType === 'mouse') { var im = $('img', t); im.style.setProperty('--tx', (-((e.clientX - r.left) / r.width - .5) * 22).toFixed(1) + 'px'); im.style.setProperty('--ty', (-((e.clientY - r.top) / r.height - .5) * 22).toFixed(1) + 'px'); }
    });
  });
  var evening = $('#evening');
  watch(evening, function (v) { evening.classList.toggle('on', v); powder.vis(v); });
  var powder = (function () {
    var cv = $('[data-powder]'), c = cv.getContext('2d'), tile = cv.parentNode, P = [], w, h, raf = 0, vis = false;
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = tile.clientWidth; h = tile.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame() {
      raf = 0; c.clearRect(0, 0, w, h);
      if (still() && P.length < 40) { while (P.length < 40) P.push({ x: Math.random() * w, y: Math.random() * h * .7, r: Math.random() * 2.6 + .8, l: 60, m: 120, col: COLS[P.length % 4] }); }
      if (P.length < 50) P.push({ x: Math.random() * w, y: Math.random() * h * .6, r: Math.random() * 2.6 + .8, l: 0, m: 80 + Math.random() * 100, col: COLS[Math.floor(Math.random() * 4)] });
      for (var i = P.length - 1; i >= 0; i--) {
        var p = P[i]; p.l++; p.y += .18; if (p.l > p.m) { P.splice(i, 1); continue; }
        c.fillStyle = 'rgba(' + p.col + ',' + (Math.sin(Math.PI * p.l / p.m) * .85).toFixed(3) + ')'; star(c, p.x, p.y, p.r, p.l * .02);
      }
      if (vis && !still()) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: function () { size(); kick(); }, kick: kick, vis: function (v) { vis = v; if (v) kick(); } };
  })();

  // ---------------------------------------------------------------- odometer
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

  // reviews drift: two copies so the loop is seamless
  var drow = $('[data-driftrow]');
  $$('.rv', drow).forEach(function (r) { var k = r.cloneNode(true); k.setAttribute('aria-hidden', 'true'); drow.appendChild(k); });

  // ---------------------------------------------------------------- composer: tarot cards + moon phases -> a WhatsApp message
  var cards = $$('.tarot'), whens = $$('[data-when]'), msgEl = $('[data-msg]'), chat = $('[data-chat]'), shown = '', typing = 0, chatSeen = false;
  cards.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); write(); }); });
  whens.forEach(function (b) { b.addEventListener('click', function () { whens.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write(); }); });
  function compose() {
    var l = he(), picked = cards.filter(function (n) { return n.getAttribute('aria-pressed') === 'true'; }).map(function (n) { return n.dataset[l ? 'he' : 'en']; });
    var w = whens.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0];
    if (l) {
      var what = picked.length ? ' ' + picked.map(function (p, i) { return (i && i === picked.length - 1 ? 'ול' : 'ל') + p; }).join(', ').replace(/, ול/, ' ול') : '';
      return 'היי נטלי, אשמח לקבוע תור' + what + '. הכי נוח לי ' + w.dataset.he + '.';
    }
    var list = picked.length < 2 ? picked.join('') : picked.slice(0, -1).join(', ') + ' and ' + picked[picked.length - 1];
    return 'Hi Natalie, I’d like to book ' + (picked.length ? list : 'an appointment') + '. ' + w.dataset.en + ' suit me best.';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; chat.classList.remove('typing'); return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    chat.classList.add('typing');
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st); else chat.classList.remove('typing');
    })(t0);
  }
  watch(chat, function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = '';
    // one card turns over by itself the first time, so the deck shows what it does
    if (!cards.some(function (c) { return c.getAttribute('aria-pressed') === 'true'; })) cards[2].setAttribute('aria-pressed', 'true');
    write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var dock = $('[data-dock]'), foot = $('[data-foot]'), fmoon = $('[data-fmoon]'), hcopy = $('.h-copy'), ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function clearStyles() {
    [hcopy, mirror].forEach(function (e) { e.style.transform = ''; e.style.opacity = ''; });
    fch.forEach(function (c) { c.style.removeProperty('--fy'); c.style.removeProperty('--fo'); });
    $$('.oc').forEach(function (c) { c.style.transform = ''; c.style.filter = ''; });
    moon.style.removeProperty('--my'); fmoon.style.removeProperty('--set');
  }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, hr = hero.getBoundingClientRect();
    nav.classList.toggle('pill', scrollY > 40);
    dock.classList.toggle('show', hr.bottom < vh * .35);
    // hero -> work: the hero sinks back while the work card rides up over it
    if (!calm) {
      var hp = clamp(-hr.top / hr.height, 0, 1);
      hcopy.style.transform = 'translate3d(0,' + (hp * 22).toFixed(1) + '%,0)'; hcopy.style.opacity = (1 - hp * .8).toFixed(3);
      mirror.style.transform = 'translate3d(0,' + (hp * 14).toFixed(1) + '%,0) scale(' + (1 - hp * .08).toFixed(3) + ')';
      moon.style.setProperty('--my', (-hp * 90).toFixed(1) + 'px');
      shine.style.setProperty('--sx', (Math.sin(performance.now() / 1600) * 60 + hp * 80).toFixed(1) + '%');
    }
    // the braid weaves with the scroll; halfway the threads change to the second photo's colours unless chosen by hand
    var br = braids.getBoundingClientRect(), bp = calm ? 1 : clamp((vh * .55 - br.top) / Math.max(1, br.height - vh * .45), 0, 1);
    setTails(Math.max(calm ? LOBES : 1, Math.round(smooth(bp / .92) * LOBES)));
    if (!calm && !picked) setSpool(bp > .55 ? 1 : 0);
    // footer: the name rises letter by letter, the moon sets behind it
    var fr = foot.getBoundingClientRect(), fp = calm ? 1 : clamp((vh - fr.top) / Math.min(fr.height, vh), 0, 1);
    fch.forEach(function (c, i) { var v = calm ? 1 : smooth((fp - .1 - i * .04) / .4); c.style.setProperty('--fy', ((1 - v) * 60).toFixed(1) + 'px'); c.style.setProperty('--fo', v.toFixed(3)); });
    fmoon.style.setProperty('--set', ((1 - fp) * -140).toFixed(1) + 'px');
  }
  // the sheen keeps moving on phones while the hero is in view
  setInterval(function () { if (!still() && !fine && hero.getBoundingClientRect().bottom > 0) tick(); }, 60);

  function layout() { dust.size(); powder.size(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
})();
