(function () {
  var root = document.documentElement, WA = '972537016555';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'NAIL POINT · מניקור ופדיקור · חניתה 64, חיפה', en: 'NAIL POINT · Manicure & pedicure · 64 Hanita St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור NAIL POINT · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for NAIL POINT · This is not the business’s official website' };
  var dpr = Math.min(2, devicePixelRatio || 1);
  function fitCanvas(cv) { var w = cv.clientWidth, h = cv.clientHeight; cv.width = Math.max(1, w * dpr); cv.height = Math.max(1, h * dpr); var c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); return { c: c, w: w, h: h }; }

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-wa]', 'וואטסאפ ל-NAIL POINT', 'WhatsApp NAIL POINT');
    aria('[data-t-call]', 'התקשרו ל-NAIL POINT, 053-701-6555', 'Call NAIL POINT, 053-701-6555');
    $$('[data-track]').forEach(function (t) { t.setAttribute('aria-label', t.dataset[l === 'he' ? 'tHe' : 'tEn']); });
    $$('.rv .stars').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
    $('[data-t-map]').title = l === 'he' ? 'מפה: חניתה 64, חיפה' : 'Map: 64 Hanita St, Haifa';
    $$('[data-lsteps] li').forEach(function (li) { $('.dc', li).textContent = li.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('np-lang', l); } catch (e) {}
    texts(l); split(); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('np-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI(); $$('[data-tile]').forEach(function (el) { el.classList.add('in'); });
    resetInline(); layout(); kickAll();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8, 20], 1: [8, 20], 2: [8, 20], 3: [8, 20], 4: [8, 20], 5: [8, 15], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
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
    var td = $('[data-today]');
    if (td) td.innerHTML = (l ? 'היום, יום ' + dayHe[n.d] + ': ' : 'Today, ' + dayEn[n.d] + ': ') + (t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'closed'));
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

  // ---------------------------------------------------------------- hero line: letter by letter
  var lineSrc = {};
  function split() {
    $$('[data-split] > span[lang]').forEach(function (sp) {
      var k = sp.getAttribute('lang'); if (!lineSrc[k]) lineSrc[k] = sp.innerHTML;
      var i = 0, tmp = document.createElement('div'); tmp.innerHTML = lineSrc[k];
      var out = '';
      [].slice.call(tmp.childNodes).forEach(function (n) {
        var isEm = n.nodeType === 1, txt = n.textContent;
        var words = txt.split(' ').map(function (w) { return w ? '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>' : ''; }).join(' ');
        out += isEm ? '<em>' + words + '</em>' : words;
      });
      sp.innerHTML = out; sp.setAttribute('aria-label', tmp.textContent);
    });
  }
  split();

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- glitter points: drift, part under the hand, burst on a tap
  var glitter = (function () {
    var cv = $('[data-glitter]'), g, P = [], raf = 0, vis = true, mx = -999, my = -999, bursts = [];
    var COLS = ['#a3141f', '#c25a66', '#f8eee8', '#e8cc98', '#b98d50', '#e6a69e'];
    function size() {
      g = fitCanvas(cv); var n = phone() ? 70 : 150; P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * g.w, y: Math.random() * g.h, r: Math.random() < .12 ? 3 + Math.random() * 4 : .8 + Math.random() * 2.2, c: COLS[i % COLS.length], vx: (Math.random() - .5) * .15, vy: -.05 - Math.random() * .2, ph: Math.random() * 6.3, ox: 0, oy: 0 });
    }
    function draw(t) {
      var c = g.c; c.clearRect(0, 0, g.w, g.h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], tw = .55 + .45 * Math.sin(t / 700 + p.ph);
        c.globalAlpha = p.r > 3 ? .85 : tw * .9; c.fillStyle = p.c;
        c.beginPath(); c.arc(p.x + p.ox, p.y + p.oy, p.r, 0, 6.283); c.fill();
        if (p.r > 3) { c.globalAlpha = .7; c.fillStyle = '#fff'; c.beginPath(); c.arc(p.x + p.ox - p.r * .35, p.y + p.oy - p.r * .35, p.r * .28, 0, 6.283); c.fill(); }
      }
      c.globalAlpha = 1;
    }
    function frame(t) {
      raf = 0; if (!g) return;
      if (still()) { draw(0); return; }
      for (var i = 0; i < P.length; i++) {
        var p = P[i]; p.x += p.vx; p.y += p.vy + Math.sin(t / 1500 + p.ph) * .08;
        if (p.y < -10) { p.y = g.h + 10; p.x = Math.random() * g.w; }
        if (p.x < -10) p.x = g.w + 10; if (p.x > g.w + 10) p.x = -10;
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy, tx = 0, ty = 0;
        if (d2 < 14400) { var f = (14400 - d2) / 14400 * 40, d = Math.sqrt(d2) || 1; tx = dx / d * f; ty = dy / d * f; }
        bursts.forEach(function (b) { var bx = p.x - b.x, by = p.y - b.y, bd = Math.sqrt(bx * bx + by * by) || 1, e = 1 - (t - b.t) / 900; if (e > 0 && bd < 220) { tx += bx / bd * 60 * e * (1 - bd / 220); ty += by / bd * 60 * e * (1 - bd / 220); } });
        p.ox += (tx - p.ox) * .12; p.oy += (ty - p.oy) * .12;
      }
      bursts = bursts.filter(function (b) { return t - b.t < 900; });
      draw(t); if (vis) raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) { var r = cv.getBoundingClientRect(); bursts.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }); });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- the arc of manicures: dealt from one point, turns by itself, with scroll and drag
  var ring = (function () {
    var wrap = $('[data-arcwrap]'), el = $('[data-ring]');
    $$('.rc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $('img', k).alt = ''; el.appendChild(k); });
    var cards = $$('.rc', el), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = true, last = 0, t0 = 0;
    function R() { var cw = cards[0].offsetWidth || 160; return Math.max(cw * 1.08 / (2 * Math.tan(Math.PI / N)), phone() ? 250 : innerWidth * .36); }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; c.style.opacity = ''; }); return; }
      if (!t0) t0 = t;
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      var deal = smooth((t - t0 - 300) / 1400);
      if (!drag) { rot += (7 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var r = R(), sc = scrollY * .07 * (rtl() ? 1 : -1);
      cards.forEach(function (c, i) {
        var a = (rot + sc + i * step) * deal + (1 - deal) * (i - N / 2) * 1.5, f = Math.cos(a * Math.PI / 180), lift = f > .95 ? (f - .95) * 20 : 0;
        c.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + (r * deal + lift * 40).toFixed(1) + 'px) translateY(' + ((1 - deal) * 60).toFixed(1) + 'px) scale(' + (1 + lift * .07).toFixed(3) + ')';
        c.style.filter = 'brightness(' + (.45 + .55 * Math.pow(Math.max(f, 0), 1.4)).toFixed(3) + ')';
        c.style.opacity = f < -.2 ? Math.max(0, 1 + (f + .2) * 2).toFixed(2) : (deal < 1 ? Math.min(1, deal * 3 + (i === N - 1 ? 1 : 0)).toFixed(2) : '1');
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    el.style.transform = 'rotateX(-8deg)';
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .25; vel = dx * 2 * (rtl() ? 1 : -1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- LAYERS: point -> nail -> base, colour, top coat, lamp -> full screen
  var layers = $('[data-layers]'), lwin = $('[data-lwin]'), limg = $('img', lwin), lgloss = $('[data-lgloss]'), ldot = $('[data-ldot]'), lglow = $('[data-lglow]'), lrings = $('[data-lrings]'), lsteps = $$('[data-lsteps] li');
  var GLYPH = 'אבגדהוזחטיכלמנסעפצקרשת•◦·';
  function decode(li, on) {
    var span = $('.dc', li), target = li.dataset[root.lang];
    if (on === li.classList.contains('on')) return;
    li.classList.toggle('on', on); clearInterval(li._t);
    if (!on || still()) { span.textContent = target; return; }
    var k = 0, n = target.length;
    li._t = setInterval(function () {
      k++; var out = '';
      for (var i = 0; i < n; i++) out += i < k / 2 ? target[i] : (target[i] === ' ' ? ' ' : GLYPH[Math.floor(Math.random() * GLYPH.length)]);
      span.textContent = out; if (k / 2 >= n) { clearInterval(li._t); span.textContent = target; }
    }, 38);
  }
  function layersUpdate(p) {
    var W = innerWidth, Hh = innerHeight, cx = W / 2, cy = Hh * .56;
    var aw = Math.min(W * (phone() ? .5 : .24), 300), ah = aw * 1.42;
    if (phone()) { ah = Math.min(ah, Hh * .42); aw = ah / 1.42; }
    var g = smooth((p - .02) / .2), o = smooth((p - .76) / .2);          // grow to the nail, then open to the screen
    var w = lerp(lerp(28, aw, g), W, o), h = lerp(lerp(28, ah, g), Hh, o), x = lerp(cx, W / 2, o), y = lerp(cy, Hh / 2, o);
    var top = y - h / 2, left = x - w / 2, k = 1 - o;
    var rxT = w / 2 * k, ryT = h * .55 * k, rxB = w / 2 * k, ryB = h * .3 * k;
    if (g < .02) { lwin.style.clipPath = 'inset(50% 50% 50% 50%)'; }
    else lwin.style.clipPath = 'inset(' + top.toFixed(1) + 'px ' + (W - left - w).toFixed(1) + 'px ' + (Hh - top - h).toFixed(1) + 'px ' + left.toFixed(1) + 'px round ' + rxT.toFixed(1) + 'px ' + rxT.toFixed(1) + 'px ' + rxB.toFixed(1) + 'px ' + rxB.toFixed(1) + 'px / ' + ryT.toFixed(1) + 'px ' + ryT.toFixed(1) + 'px ' + ryB.toFixed(1) + 'px ' + ryB.toFixed(1) + 'px)';
    ldot.style.opacity = (1 - smooth((p - .08) / .1)).toFixed(3);
    lrings.style.opacity = (1 - smooth((p - .03) / .1)).toFixed(3);
    ldot.style.transform = 'scale(' + (1 + g * 2).toFixed(3) + ')';
    // base (pale and soft) -> colour -> top coat gloss -> lamp glow
    var col = smooth((p - .3) / .14), top2 = smooth((p - .46) / .14), lamp = smooth((p - .6) / .08) * (1 - smooth((p - .72) / .08));
    limg.style.filter = 'grayscale(' + ((1 - col) * .85).toFixed(3) + ') brightness(' + (1 + (1 - col) * .25).toFixed(3) + ') contrast(' + (1 - (1 - col) * .2).toFixed(3) + ') blur(' + ((1 - col) * 1.5).toFixed(2) + 'px)';
    limg.style.transform = 'scale(' + lerp(1.25, 1, smooth(p / .95)).toFixed(4) + ')';
    lgloss.style.opacity = (top2 * (1 - o * .6)).toFixed(3);
    lgloss.style.transform = 'translateX(' + lerp(-45, 45, top2).toFixed(1) + '%)';
    lglow.style.opacity = (lamp * .95).toFixed(3); lglow.style.transform = 'scale(' + (.7 + lamp * .9).toFixed(3) + ')';
    lwin.style.setProperty('--scrim', o.toFixed(3));
    layers.classList.toggle('full', o > .5);
    var th = [.18, .3, .46, .6];
    lsteps.forEach(function (li, i) { decode(li, p >= th[i]); });
  }

  // ---------------------------------------------------------------- WORKS: the stage stays, each new photo opens from the point you touched
  var stage = $('[data-wstage]'), wimgs = $$('img', stage), wrows = $$('[data-w]'), wcur = 0;
  function showWork(i, ex, ey) {
    if (i === wcur) return;
    var nx = wimgs[i]; if (!nx.complete) { nx.addEventListener('load', function () { if (wrows[i].classList.contains('on')) showWork(i, ex, ey); }, { once: true }); wrows.forEach(function (r, k) { r.classList.toggle('on', k === i); }); return; }
    wrows.forEach(function (r, k) { r.classList.toggle('on', k === i); });
    var next = wimgs[i], prev = wimgs[wcur];
    wimgs.forEach(function (im) { if (im !== next && im !== prev) im.classList.remove('cur', 'prev', 'go'); });
    prev.classList.remove('cur', 'go'); prev.classList.add('prev');
    next.style.setProperty('--x', ex || '50%'); next.style.setProperty('--y', ey || '50%');
    if (still()) { prev.classList.remove('prev'); next.classList.add('cur'); wcur = i; return; }
    next.classList.remove('go', 'cur'); void next.offsetWidth;
    next.classList.add('go', 'cur');
    var was = prev; setTimeout(function () { if (!was.classList.contains('cur')) was.classList.remove('prev'); }, 950);
    wcur = i;
  }
  wrows.forEach(function (r, i) {
    r.addEventListener('click', function (e) {
      var sr = stage.getBoundingClientRect(), rr = r.getBoundingClientRect();
      var y = clamp((rr.top + rr.height / 2 - sr.top) / sr.height, .1, .9);
      showWork(i, (rtl() ? '8%' : '92%'), (y * 100).toFixed(0) + '%'); r._clicked = performance.now();
    });
    if (io) new IntersectionObserver(function (es) { if (es[0].isIntersecting && !(performance.now() - (r._clicked || 0) < 800)) showWork(i, '50%', '50%'); }, { rootMargin: phone() ? '-62% 0px -22% 0px' : '-45% 0px -45% 0px' }).observe(r);
  });
  stage.addEventListener('pointermove', function (e) { var r = stage.getBoundingClientRect(); stage.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); stage.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); });
  stage.addEventListener('pointerdown', function (e) { var r = stage.getBoundingClientRect(); showWork((wcur + 1) % wimgs.length, (e.clientX - r.left) + 'px', (e.clientY - r.top) + 'px'); });

  // ---------------------------------------------------------------- MENU: tiles, spotlight, glitter on the French, a sweep on the gel, dotting on the art
  $$('[data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var menu = $('[data-menu]'), menuOn = false;
  watch(menu, function (v) { menuOn = v; if (v) { sparkle.kick(); bloom.kick(); } });

  var sparkle = (function () {
    var cv = $('[data-sparkle]'), g, S = [], raf = 0;
    function size() { g = fitCanvas(cv); S = []; for (var i = 0; i < (phone() ? 26 : 46); i++) S.push({ x: g.w * (.25 + Math.random() * .6), y: g.h * (.12 + Math.random() * .7), ph: Math.random() * 6.3, sp: .6 + Math.random() * 1.4, s: 3 + Math.random() * 6 }); }
    function star(c, x, y, s, a) { c.globalAlpha = a; c.beginPath(); c.moveTo(x, y - s); c.quadraticCurveTo(x, y, x + s, y); c.quadraticCurveTo(x, y, x, y + s); c.quadraticCurveTo(x, y, x - s, y); c.quadraticCurveTo(x, y, x, y - s); c.fill(); }
    function frame(t) {
      raf = 0; if (!g) return; var c = g.c; c.clearRect(0, 0, g.w, g.h); c.fillStyle = '#fff8f0';
      S.forEach(function (p) { var a = still() ? .5 : Math.max(0, Math.sin(t / 1000 * p.sp + p.ph)); if (a > .05) star(c, p.x, p.y, p.s * a, a * .9); });
      c.globalAlpha = 1; if (menuOn && !still()) raf = requestAnimationFrame(frame);
    }
    return { size: function () { size(); this.kick(); }, kick: function () { if (!raf) raf = requestAnimationFrame(frame); } };
  })();

  // a blossom of dots for the pedicure tile: the dotting tool's flower, opening petal by petal
  var bloom = (function () {
    var cv = $('[data-bloom]'), g, raf = 0, t0 = 0;
    var COL = ['#f6e8df', '#e6a69e', '#e8cc98'];
    function frame(t) {
      raf = 0; if (!g) return; if (!t0) t0 = t;
      var c = g.c, cx = g.w / 2, cy = g.h * .42, R = Math.min(g.w, g.h) * .3, T = still() ? 99 : (t - t0) / 1000;
      c.clearRect(0, 0, g.w, g.h);
      for (var pet = 0; pet < 6; pet++) {
        var base = pet / 6 * 6.283 + T * .12;
        for (var k = 1; k <= 7; k++) {
          var open = smooth((T * .9 - pet * .25 - k * .08) / .6), rr = R * (k / 7) * open, wob = Math.sin(k / 7 * 3.14) * .32;
          [-1, 1].forEach(function (sd) {
            var a = base + sd * wob * (1 - k / 9), x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
            c.globalAlpha = open * .95; c.fillStyle = COL[(k + pet) % 3];
            c.beginPath(); c.arc(x, y, 2 + (7 - Math.abs(k - 4)) * .9, 0, 6.283); c.fill();
          });
        }
      }
      c.globalAlpha = 1; c.fillStyle = '#a3141f'; c.beginPath(); c.arc(cx, cy, 9 + Math.sin(T * 2) * 1.2, 0, 6.283); c.fill();
      c.fillStyle = '#ffb3b3'; c.beginPath(); c.arc(cx - 3, cy - 3, 2.5, 0, 6.283); c.fill();
      if (menuOn && !still()) raf = requestAnimationFrame(frame);
    }
    return { size: function () { g = fitCanvas(cv); t0 = 0; this.kick(); }, kick: function () { if (!raf) raf = requestAnimationFrame(frame); } };
  })();

  // dotting: every touch on the nail-art photo leaves a point of lacquer (and the tile dots itself on phones)
  var art = $('[data-dotting]'), artOn = false;
  function dot(x, y) {
    var d = document.createElement('i'); d.className = 'ink-dot' + (Math.random() < .4 ? ' pearl' : ''); d.style.left = x + 'px'; d.style.top = y + 'px'; art.appendChild(d);
    if (!d.animate) { setTimeout(function () { d.remove(); }, 1500); return; }
    d.animate([{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1)', opacity: 1, offset: .25 }, { transform: 'scale(1)', opacity: 1, offset: .75 }, { transform: 'scale(.6)', opacity: 0 }], { duration: 1800, easing: 'cubic-bezier(.23,1,.32,1)' }).onfinish = function () { d.remove(); };
  }
  var lastDot = 0;
  art.addEventListener('pointermove', function (e) { if (still() || e.pointerType !== 'mouse') return; var t = performance.now(); if (t - lastDot < 90) return; lastDot = t; var r = art.getBoundingClientRect(); dot(e.clientX - r.left, e.clientY - r.top); });
  art.addEventListener('pointerdown', function (e) { if (still()) return; var r = art.getBoundingClientRect(); dot(e.clientX - r.left, e.clientY - r.top); });
  watch(art, function (v) { artOn = v; });
  setInterval(function () { if (!artOn || still() || !phone()) return; dot(art.clientWidth * (.2 + Math.random() * .6), art.clientHeight * (.15 + Math.random() * .5)); }, 650);

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 150) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- BOOK: connect the dots, the message writes itself
  var tracks = $('[data-tracks]'), threadPath = $('[data-threadpath]'), thread = $('[data-thread]');
  var tk = {}; $$('[data-track]').forEach(function (t) { tk[t.dataset.track] = t; });
  function picked(key) { return $('[aria-checked="true"]', tk[key]); }
  $$('[data-track] button').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.closest('[data-track]');
      $$('button', t).forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); });
      t.classList.add('done');
      if (t.dataset.track === 'd') {            // Friday closes at 15:00: no afternoon
        var fri = b.dataset.day === '5', late = $('[data-late]');
        late.disabled = fri; if (fri && late.getAttribute('aria-checked') === 'true') { late.setAttribute('aria-checked', 'false'); if (!picked('h')) tk.h.classList.remove('done'); }
      }
      drawThread(true); write();
    });
  });
  function drawThread(anim) {
    var tr = tracks.getBoundingClientRect(), pts = ['t', 'd', 'h'].map(picked).filter(Boolean).map(function (b) { var r = $('i', b).getBoundingClientRect(); return [r.left + r.width / 2 - tr.left, r.top + r.height / 2 - tr.top]; });
    thread.setAttribute('viewBox', '0 0 ' + tr.width + ' ' + tr.height);
    if (pts.length < 2) { threadPath.setAttribute('d', ''); return; }
    var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var i = 1; i < pts.length; i++) { var a = pts[i - 1], b = pts[i], my = (a[1] + b[1]) / 2; d += ' C' + a[0].toFixed(1) + ' ' + my.toFixed(1) + ' ' + b[0].toFixed(1) + ' ' + my.toFixed(1) + ' ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1); }
    threadPath.setAttribute('d', d);
    if (anim && !still() && threadPath.animate) { var L = threadPath.getTotalLength(); threadPath.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 600, easing: 'cubic-bezier(.23,1,.32,1)' }); }
  }
  var msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
  function compose() {
    var l = he(), t = picked('t'), d = picked('d'), h = picked('h'), s;
    if (l) {
      s = 'שלום, אשמח לקבוע תור' + (t ? ' ל' + t.dataset.he : '');
      if (d) s += ' ביום ' + dayHe[+d.dataset.day]; if (h) s += ' ' + h.dataset.he;
      return s + '. תודה!';
    }
    s = 'Hi, I’d like to book ' + (t ? t.dataset.en : 'an appointment');
    if (d) s += ' on ' + dayEn[+d.dataset.day]; if (h) s += ' ' + h.dataset.en;
    return s + '. Thank you!';
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
      msgEl.textContent = shown; if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- scroll-linked: one loop
  var revs = $('[data-reviews]'), rrow = $('[data-rrow]'), visit = $('[data-visit]'), vphoto = $('[data-vphoto]'), vtiles = $$('[data-vt]'), works = $('[data-works]'), gelSweep = $('.t-sweep');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function resetInline() {
    [lwin, limg, lgloss, ldot, lglow, lrings, rrow, vphoto].forEach(function (e) { e.style.cssText = ''; });
    vtiles.forEach(function (e) { e.style.opacity = ''; e.style.transform = ''; });
    layers.classList.remove('full'); lsteps.forEach(function (li) { li.classList.remove('on'); $('.dc', li).textContent = li.dataset[root.lang]; });
    stage.style.filter = '';
  }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    if (calm) { lsteps.forEach(function (li) { li.classList.add('on'); }); return; }
    ring.kick(); glitter.kick();
    layersUpdate(prog(layers));
    // works: the stage dims as the cherry bento lands over it
    var mr = menu.getBoundingClientRect(), cover = clamp(1 - mr.top / vh, 0, 1);
    stage.style.filter = cover > 0 ? 'brightness(' + (1 - cover * .35).toFixed(3) + ')' : '';
    if (phone()) stage.style.setProperty('--gy', (20 + 60 * prog(works)).toFixed(1) + '%');
    // gel tile: the shine crosses as you pass
    var gr = gelSweep.parentNode.getBoundingClientRect(); gelSweep.style.setProperty('--sw', lerp(-40, 40, clamp(1 - gr.bottom / (vh + gr.height), 0, 1)).toFixed(1) + '%');
    // reviews drift sideways with the scroll (desktop)
    if (innerWidth >= 900) {
      var rr = revs.getBoundingClientRect(), rp = clamp((vh - rr.top) / (vh + rr.height), 0, 1), over = Math.max(0, rrow.scrollWidth - innerWidth);
      rrow.style.transform = 'translateX(' + ((rtl() ? 1 : -1) * lerp(-over * .1, over * 1.05, rp)).toFixed(1) + 'px)';
    }
    // visit: the photo shrinks from the whole screen into its tile
    var vb = vphoto.getBoundingClientRect(), vp = smooth((vh * .95 - vb.top) / (vh * .75));
    var S = Math.max(innerWidth / vb.width, vh / vb.height) * 1.02, s = lerp(S, 1, vp);
    var dx = (innerWidth / 2 - (vb.left + vb.width / 2)) * (1 - vp), dy = (vh / 2 - (vb.top + vb.height / 2)) * (1 - vp) * .0;
    vphoto.style.transform = vp >= 1 ? '' : 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
    vphoto.style.borderRadius = (24 / s).toFixed(1) + 'px';
    vtiles.forEach(function (t, i) { var v = smooth((vp - .55 - i * .06) / .3); t.style.opacity = v.toFixed(3); t.style.transform = v >= 1 ? '' : 'translateY(' + ((1 - v) * 30).toFixed(1) + 'px)'; });
    // footer: the name rises
    fword.update();
  }

  // ---------------------------------------------------------------- footer: NAIL POINT made of glitter points, rising letter by letter
  var fword = (function () {
    var cv = $('[data-fword]'), g, P = [], foot = $('[data-foot]'), last = -1;
    function size() {
      g = fitCanvas(cv); var oc = document.createElement('canvas'), w = Math.round(g.w), h = Math.round(g.h); if (!w || !h) return;
      oc.width = w; oc.height = h; var o = oc.getContext('2d'), fs = h * .78;
      o.font = '700 ' + fs + 'px "IBM Plex Sans Hebrew", sans-serif'; var tw = o.measureText('NAIL POINT').width; if (tw > w * .98) { fs *= w * .98 / tw; o.font = '700 ' + fs + 'px "IBM Plex Sans Hebrew", sans-serif'; tw = o.measureText('NAIL POINT').width; }
      o.textBaseline = 'middle'; o.fillStyle = '#000'; o.fillText('NAIL POINT', (w - tw) / 2, h / 2);
      var d = o.getImageData(0, 0, w, h).data, gap = Math.max(5, Math.round(fs / 22)); P = [];
      for (var y = 0; y < h; y += gap) for (var x = 0; x < w; x += gap) if (d[(y * w + x) * 4 + 3] > 128) P.push({ x: x, y: y, k: (x - (w - tw) / 2) / tw, r: gap * .42 * (.75 + Math.random() * .5), c: Math.random() < .14 ? '#e8cc98' : Math.random() < .3 ? '#e6a69e' : '#f6e8df', j: Math.random() });
      last = -1; draw(still() ? 1 : cur());
    }
    function cur() { var r = foot.getBoundingClientRect(); return clamp((innerHeight - r.top) / (r.height * .8), 0, 1); }
    function draw(p) {
      if (!g) return; var c = g.c; c.clearRect(0, 0, g.w, g.h);
      for (var i = 0; i < P.length; i++) {
        var q = P[i], e = smooth((p * 1.6 - q.k * .7 - q.j * .15) / .6);
        if (e <= 0) continue;
        c.globalAlpha = e; c.fillStyle = q.c; c.beginPath(); c.arc(q.x, q.y + (1 - e) * g.h * .6, q.r, 0, 6.283); c.fill();
      }
      c.globalAlpha = 1;
    }
    return { size: size, update: function () { var p = still() ? 1 : cur(); if (Math.abs(p - last) > .004) { last = p; draw(p); } } };
  })();

  // ---------------------------------------------------------------- layout and start
  function layout() { glitter.size(); sparkle.size(); bloom.size(); fword.size(); drawThread(false); tick(); }
  function kickAll() { glitter.kick(); ring.kick(); sparkle.kick(); bloom.kick(); tick(); fword.update(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (innerWidth !== lw || !phone()) { lw = innerWidth; layout(); } else tick(); }, 140); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); fword.size(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 400);
  addEventListener('load', function () { layout(); });
})();
