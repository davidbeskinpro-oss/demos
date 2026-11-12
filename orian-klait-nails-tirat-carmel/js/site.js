(function () {
  var root = document.documentElement, WA = '972539649734';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 960; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'אוריין קלייט · עיצוב ציפורניים · יצחק שמיר 20, טירת כרמל', en: 'Orian Klait · Nail design · 20 Yitzhak Shamir St, Tirat Carmel' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור אוריין קלייט עיצוב ציפורניים · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Orian Klait Nail Design · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'אוריין קלייט', 'Orian Klait');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'חייגו לאוריין, 053-964-9734', 'Call Orian, 053-964-9734');
    aria('[data-t-rack]', 'מה תרצו לעשות', 'What would you like');
    aria('[data-t-when]', 'מתי נוח', 'When suits you');
    aria('[data-step-prev]', 'השלב הקודם', 'Previous step');
    aria('[data-step-next]', 'השלב הבא', 'Next step');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: יצחק שמיר 20, טירת כרמל' : 'Map: 20 Yitzhak Shamir St, Tirat Carmel'; });
    $$('[data-decode]').forEach(function (b) { b.textContent = b.dataset[l]; });
    fanName(true);
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ok-lang', l); } catch (e) {}
    texts(l); hours(); write(true); stage(curStep, true); clock();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('ok-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    petals.kick(); loop(); stage(curStep, true); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9, 20], 1: [9, 20], 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, hh: ((+o.hour) % 24), mm: o.minute }; }
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
  function clock() { var n = now(), c = $('[data-clock]'); if (c) c.textContent = (n.hh < 10 ? '0' : '') + n.hh + ':' + n.mm; }
  setInterval(function () { status(); clock(); }, 30000);

  // ---------------------------------------------------------------- entrances
  $$('[data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 90 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); if (e.target.hasAttribute('data-tile')) decodeIn(e.target); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- labels decode out of scrambled letters
  var GLY = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'abcdefghijklmnopqrstuvwxyz' };
  function decode(el, text) {
    if (still()) { el.textContent = text; return; }
    var g = GLY[he() ? 'he' : 'en'], f = 0, n = text.length, id = el._dc = (el._dc || 0) + 1;
    (function step() {
      if (el._dc !== id) return;
      var out = ''; for (var i = 0; i < n; i++) out += (i < f / 2 || text[i] === ' ') ? text[i] : g[Math.floor(Math.random() * g.length)];
      el.textContent = out; if (f++ < n * 2) setTimeout(step, 34); else el.textContent = text;
    })();
  }
  function decodeIn(tile) { var b = $('[data-decode]', tile); if (b) decode(b, b.dataset[he() ? 'he' : 'en']); }

  // ---------------------------------------------------------------- hero letters
  var hero = $('[data-hero]');
  $$('[data-letters] > span[lang]').forEach(function (sp) {
    var i = 0; sp.innerHTML = sp.textContent.split(' ').map(function (w) { return '<span style="white-space:nowrap">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>'; }).join(' ');
  });
  $$('[data-fill] > span[lang]').forEach(function (sp) {
    sp.innerHTML = sp.textContent.split(' ').map(function (w) { return '<span style="white-space:nowrap">' + w.split('').map(function (c) { return '<span class="ch">' + c + '</span>'; }).join('') + '</span>'; }).join(' ');
  });
  requestAnimationFrame(function () { hero.classList.add('on'); });

  // ---------------------------------------------------------------- the swatch fan: dealt in, tilts to the hand, tap brings a set to the front
  var fan = $('[data-fan]'), tips = $$('.tip', fan), front = tips[5];
  // DOM order: pedicure, coral, stiletto, velvet, square, milky; the milky set sits near the middle
  [-50, -30, 10, 30, 50, -10].forEach(function (a, i) { tips[i].style.setProperty('--a', a + 'deg'); });
  front.classList.add('front');
  function fanName(instant) {
    var b = $('[data-fan-name]'), t = front.dataset[he() ? 'nameHe' : 'nameEn'];
    instant ? (b.textContent = t) : decode(b, t);
  }
  tips.forEach(function (t) {
    t.setAttribute('aria-label', '');
    t.addEventListener('click', function () {
      if (t === front) return;
      front.classList.remove('front'); t.classList.add('front'); front = t; fanName(false);
    });
  });
  function tipLabels() { tips.forEach(function (t) { t.setAttribute('aria-label', t.dataset[he() ? 'nameHe' : 'nameEn']); }); }
  setTimeout(function () { fan.classList.add('dealt'); setTimeout(function () { fan.classList.add('settled'); }, 1400); }, 250);
  var fanWrap = $('.fan-wrap');
  hero.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var r = fanWrap.getBoundingClientRect();
    fan.style.setProperty('--tx', ((e.clientX - r.left) / r.width - .5) * 16);
    fan.style.setProperty('--ty', -((e.clientY - r.top) / r.height - .5) * 10);
  });
  hero.addEventListener('pointerleave', function () { fan.style.setProperty('--tx', 0); fan.style.setProperty('--ty', 0); });

  // ---------------------------------------------------------------- petals drifting over the hero, parting around the hand
  var petals = (function () {
    var cv = $('[data-petals]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = true, mx = -999, my = -999;
    var COL = ['rgba(232,180,186,.75)', 'rgba(248,236,232,.85)', 'rgba(216,184,134,.6)', 'rgba(196,110,135,.45)'];
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 16 : 28; P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, s: 5 + Math.random() * 9, r: Math.random() * 6.28, vr: (Math.random() - .5) * .02, vy: .25 + Math.random() * .45, ph: Math.random() * 6.28, col: COL[i % 4], dx: 0 });
    }
    function petal(p) {
      c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.col; c.beginPath();
      c.moveTo(0, -p.s); c.bezierCurveTo(p.s * .7, -p.s * .4, p.s * .55, p.s * .8, 0, p.s); c.bezierCurveTo(-p.s * .55, p.s * .8, -p.s * .7, -p.s * .4, 0, -p.s); c.fill(); c.restore();
    }
    function frame(t) {
      raf = 0; c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 12000) { var f = (12000 - d2) / 12000; p.dx += dx / Math.sqrt(d2 + 1) * f * 1.4; }
        p.dx *= .94; p.y += p.vy; p.x += Math.sin(t / 1400 + p.ph) * .4 + p.dx; p.r += p.vr;
        if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; }
        if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
        petal(p);
      }
      if (vis && !still()) raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf && !still() && vis) raf = requestAnimationFrame(frame); else if (still()) c.clearRect(0, 0, w || 0, h || 0); }
    size();
    return { kick: kick, size: size };
  })();

  // ---------------------------------------------------------------- the build: one real set comes alive, step by step
  var build = $('[data-build]'), bench = $('[data-bench]'), stepsLi = $$('[data-steps] li'), curStep = 0;
  var LINES = $$('[data-steps] .t').map(function (t) { return { he: t.querySelector(':scope > span[lang="he"]'), en: t.querySelector(':scope > span[lang="en"]') }; });
  // callouts sit on the nails: map image fractions through object-fit: cover (object-position 40% 30%)
  var bph = $('.b-photo', bench), bimg = $('.b-raw', bench), calls = $$('.call', bench);
  function place() {
    var W = bph.clientWidth, Hh = bph.clientHeight, iw = 880, ih = 1400, sc = Math.max(W / iw, Hh / ih), dw = iw * sc, dh = ih * sc, ox = (W - dw) * .4, oy = (Hh - dh) * .3;
    calls.forEach(function (c) { var fx = parseFloat(c.style.getPropertyValue('--x')) / 100, fy = parseFloat(c.style.getPropertyValue('--y')) / 100;
      c.style.setProperty('--px', Math.round(ox + fx * dw) + 'px'); c.style.setProperty('--py', Math.round(oy + fy * dh) + 'px'); });
  }
  if ('ResizeObserver' in window) new ResizeObserver(place).observe(bph); place();
  function seg(q, a, b) { return clamp((q - a) / (b - a), 0, 1); }
  function paint(q) {   // q runs 0..5 across the five steps
    var s = bench.style;
    s.setProperty('--bl', (6 * (1 - seg(q, .3, 1.2))).toFixed(2));
    s.setProperty('--fo', (seg(q, 1, 1.5) * (1 - seg(q, 2.4, 3))).toFixed(3));
    s.setProperty('--cw', seg(q, 2, 2.9).toFixed(3));
    s.setProperty('--uv', (seg(q, 3, 3.4) * (1 - seg(q, 3.7, 4.1)) * .9).toFixed(3));
    s.setProperty('--gl', seg(q, 4.05, 4.85).toFixed(3));
    $('.c3', bench).classList.toggle('on', q >= 1.25);
    $('.c2', bench).classList.toggle('on', q >= 2.5);
    $('.c1', bench).classList.toggle('on', q >= 2.75);
  }
  function stage(i, quiet) {
    var changed = i !== curStep; curStep = i;
    stepsLi.forEach(function (li, k) { li.classList.toggle('on', k === i); li.classList.toggle('done', k < i); });
    var line = LINES[i][he() ? 'he' : 'en'];
    $('[data-step-line]').textContent = line ? line.textContent : '';
    $('[data-step-count]').textContent = (i + 1) + ' / 5';
    if (still()) paint(i + .99);
  }
  $$('[data-step]').forEach(function (b) { b.addEventListener('click', function () {
    var i = +b.dataset.step;
    if (still()) { stage(i); return; }
    var r = build.getBoundingClientRect(), span = build.offsetHeight - innerHeight;
    scrollTo({ top: scrollY + r.top + span * (i + .6) / 5, behavior: 'smooth' });
  }); });
  $('[data-step-prev]').addEventListener('click', function () { stage((curStep + 4) % 5); });
  $('[data-step-next]').addEventListener('click', function () { stage((curStep + 1) % 5); });

  // ---------------------------------------------------------------- the review deck
  var deck = $('[data-deck]'), cards = $$('.card', deck), order = cards.slice(), dealN = $('[data-deal-n]'), seen = 1;
  function layDeck() { deck.style.setProperty('--dx', root.dir === 'rtl' ? -1 : 1); order.forEach(function (c, k) { c.style.setProperty('--k', k); c.setAttribute('aria-hidden', k ? 'true' : 'false'); }); dealN.textContent = seen + '/' + cards.length; }
  function deal(dir) {
    var top = order.shift(); top.style.setProperty('--outx', dir || (root.dir === 'rtl' ? 1 : -1));
    if (still()) { order.push(top); seen = seen % cards.length + 1; layDeck(); return; }
    top.classList.add('out');
    setTimeout(function () { top.classList.remove('out'); order.push(top); layDeck(); }, 420);
    seen = seen % cards.length + 1; dealN.textContent = seen + '/' + cards.length;
    order.forEach(function (c, k) { c.style.setProperty('--k', k); });
  }
  $('[data-deal]').addEventListener('click', function () { deal(); });
  var sx = null;
  deck.addEventListener('pointerdown', function (e) { if (e.target.closest('.card')) sx = e.clientX; });
  deck.addEventListener('pointerup', function (e) { if (sx !== null && Math.abs(e.clientX - sx) > 40) deal(e.clientX < sx ? -1 : 1); sx = null; });
  layDeck();

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    var v = o.dataset.odo;
    o.innerHTML = v.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span>' + ch + '</span>';
      var reel = ''; for (var d = 0; d <= 9; d++) reel += '<span data-n="' + d + '"></span>';
      return '<span class="col"><span class="reel" data-d="' + ch + '">' + reel + '</span></span>';
    }).join('');
    o.setAttribute('aria-label', v);
    watch(o, function (vis) { if (vis) $$('.reel', o).forEach(function (r, i) { r.style.transitionDelay = i * 120 + 'ms'; r.style.setProperty('--d', r.dataset.d); }); }, { threshold: .4 });
  });

  // ---------------------------------------------------------------- bento: spotlight under the hand, loupe on the velvet
  $$('[data-tile]').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', e.clientX - r.left + 'px'); t.style.setProperty('--my', e.clientY - r.top + 'px'); });
  });
  var lt = $('[data-loupe]'), lens = $('.lens', lt), auto = true, ZOOM = 2.6;
  function lensAt(x, y) {
    var r = lt.getBoundingClientRect(), img = $('img', lt), lw = lens.offsetWidth;
    // the photo is object-fit: cover; work out its drawn size so the loupe shows the exact spot
    var sc = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight) || 1, dw = img.naturalWidth * sc, dh = img.naturalHeight * sc, ox = (r.width - dw) / 2, oy = (r.height - dh) / 2;
    lens.style.setProperty('--lx', x - lw / 2 + 'px'); lens.style.setProperty('--ly', y - lw / 2 + 'px');
    lens.style.backgroundSize = dw * ZOOM + 'px ' + dh * ZOOM + 'px';
    lens.style.backgroundPosition = (-(x - ox) * ZOOM + lw / 2) + 'px ' + (-(y - oy) * ZOOM + lw / 2) + 'px';
  }
  function lensEvt(e) { auto = false; var r = lt.getBoundingClientRect(); lt.classList.add('looking'); lensAt(e.clientX - r.left, e.clientY - r.top); }
  lt.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' || e.buttons) lensEvt(e); });
  lt.addEventListener('pointerdown', lensEvt);
  lt.addEventListener('pointerleave', function () { lt.classList.remove('looking'); setTimeout(function () { auto = true; }, 2500); });
  var ltVis = false; watch(lt, function (v) { ltVis = v; if (!v) lt.classList.remove('looking'); });
  var menuLi = $$('.menu li'), menuI = 0;
  setInterval(function () { if (still()) { menuLi.forEach(function (l) { l.classList.add('hot'); }); return; } menuLi.forEach(function (l, k) { l.classList.toggle('hot', k === menuI); }); menuI = (menuI + 1) % menuLi.length; }, 1600);

  // ---------------------------------------------------------------- the shelf: bottles write the WhatsApp message
  var bottles = $$('.bottle'), whens = $$('[data-when-he]'), nameIn = $('[data-name]'), msgEl = $('[data-msg]'), send = $('[data-send]'), typing = 0, shown = '';
  function list(items, l) {
    if (l === 'he') { items = items.map(function (x) { return 'ל' + x; }); return items.length < 2 ? items[0] : items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1]; }
    return items.length < 2 ? items[0] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }
  function message() {
    var l = he() ? 'he' : 'en', picked = bottles.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.dataset[l]; });
    var w = whens.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0], nm = nameIn.value.trim();
    var wt = w ? w.dataset[l === 'he' ? 'whenHe' : 'whenEn'] : '';
    if (l === 'he') return 'היי אוריין, אשמח לקבוע תור' + (picked.length ? ' ' + list(picked, l) : '') + (wt ? ', ' + wt + ' אם אפשר' : '') + '. מתי יש לך מקום?\n' + (nm ? 'תודה, ' + nm : 'תודה');
    return 'Hi Orian, I’d like to book' + (picked.length ? ' ' + list(picked, l) : ' an appointment') + (wt ? ', ' + wt + ' if possible' : '') + '. When do you have a free spot?\n' + (nm ? 'Thanks, ' + nm : 'Thanks');
  }
  function write(instant) {
    var m = message(); send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    clearTimeout(typing);
    if (instant || still()) { msgEl.textContent = shown = m; return; }
    var k = 0; while (k < shown.length && k < m.length && shown[k] === m[k]) k++;
    (function back() {   // erase back to the common start, then type the rest
      if (shown.length > k) { shown = shown.slice(0, -1); msgEl.textContent = shown; typing = setTimeout(back, 12); return; }
      (function type() { if (shown.length < m.length) { shown = m.slice(0, shown.length + 1); msgEl.textContent = shown; typing = setTimeout(type, 22); } })();
    })();
  }
  bottles.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); write(); }); });
  whens.forEach(function (b) { b.addEventListener('click', function () { var on = b.getAttribute('aria-checked') === 'true'; whens.forEach(function (x) { x.setAttribute('aria-checked', 'false'); }); b.setAttribute('aria-checked', on ? 'false' : 'true'); write(); }); });
  nameIn.addEventListener('input', function () { write(); });

  // ---------------------------------------------------------------- scroll loop: open, build, visit frame, nav, dock, footer
  var nav = $('[data-nav]'), dock = $('[data-dock]'), open = $('[data-open]'), oPhoto = $('[data-open-photo]'), vframe = $('[data-vframe]'), foot = $('[data-foot]');
  var raf = 0, t0 = performance.now();
  function prog(el) { var r = el.getBoundingClientRect(), span = el.offsetHeight - innerHeight; return span > 0 ? clamp(-r.top / span, 0, 1) : 0; }
  var BL = [241, 220, 215], PL = [51, 23, 43];
  function tick() {
    raf = 0; var y = scrollY, calm = still();
    nav.classList.toggle('pill', y > 40);
    dock.classList.toggle('show', y > hero.offsetHeight * .55);
    if (!calm) {
      // almond → full screen, ground darkens from blush to plum behind it
      var p = prog(open), m = 60 + Math.pow(seg(p, .02, .55), 2.2) * 1700;
      oPhoto.style.setProperty('--m', m.toFixed(1));
      var op = seg(p, .35, .6); oPhoto.style.setProperty('--op', op.toFixed(3));
      var g = seg(p, .05, .5); open.style.setProperty('--og', 'rgb(' + BL.map(function (v, i) { return Math.round(v + (PL[i] - v) * g); }).join(',') + ')');
      var cp = seg(p, .5, .7); $('.open-copy', open).style.setProperty('--cp', cp.toFixed(3));
      var chs = $$('[data-fill] > span[lang="' + root.lang + '"] .ch'), lit = Math.round(seg(p, .52, .88) * chs.length);
      chs.forEach(function (c, i) { c.classList.toggle('lit', i < lit); });
      // the sheen drifts across the photo by itself on phones; follows the hand on desktop
      if (!mouseSheen) { var T = (performance.now() - t0) / 1000; oPhoto.style.setProperty('--sx', 50 + Math.sin(T * .6) * 30 + '%'); oPhoto.style.setProperty('--sy', 40 + Math.cos(T * .45) * 20 + '%'); }
      // the build
      var q = prog(build) * 5; paint(q); var st = Math.min(4, Math.floor(q)); if (st !== curStep || !stepsLi[st].classList.contains('on')) stage(st);
      // visit: the closing photo settles into its arch
      var vr = vframe.getBoundingClientRect(), v = clamp(1 - (vr.top - innerHeight * .25) / (innerHeight * .75), 0, 1);
      vframe.style.setProperty('--v', v.toFixed(3));
      if (auto && ltVis) { var LR = lt.getBoundingClientRect(), T2 = (performance.now() - t0) / 1000; lt.classList.add('looking'); lensAt(LR.width * (.5 + Math.sin(T2 * .5) * .3), LR.height * (.45 + Math.sin(T2 * .8) * .22)); }
    }
    var fr = foot.getBoundingClientRect(); if (fr.top < innerHeight * .9) foot.classList.add('on');
    if (!calm && !document.hidden) raf = requestAnimationFrame(tick);
  }
  var mouseSheen = false;
  open.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; mouseSheen = true; oPhoto.style.setProperty('--sx', e.clientX / innerWidth * 100 + '%'); oPhoto.style.setProperty('--sy', e.clientY / innerHeight * 100 + '%'); });
  function loop() { if (!raf) raf = requestAnimationFrame(tick); }
  addEventListener('scroll', loop, { passive: true });
  addEventListener('resize', function () { petals.size(); petals.kick(); loop(); });
  document.addEventListener('visibilitychange', loop);

  texts(root.lang); tipLabels(); hours(); clock(); write(true); stage(0, true); loop();
  if (still()) { paint(4.99); stage(4, true); }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', tipLabels); });
})();
