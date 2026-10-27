(function () {
  var root = document.documentElement, WA = '972525257499';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var narrow = function () { return innerWidth <= 900; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var TITLE = { he: 'ש.ת מנעולן · שמואל · שדרות כצנלסון, קריית אתא', en: 'S.T Locksmith · Shmuel · Katznelson Blvd, Kiryat Ata' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור ש.ת מנעולן · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for S.T Locksmith · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';
  var SHIELD = new Path2D('M161.332 41.97c-9.542 0-38.568-3.701-57.654-20.705-1.789-1.6-4.572-1.7-6.561-.2C73.659 39.27 50.399 41.97 38.669 41.97c-2.883 0-5.169 2.3-5.169 5.201 0 30.807 5.666 74.316 32.902 106.523 16.501 19.705 33.201 25.706 33.897 26.006.497.2 1.094.301 1.689.301.796 0 1.491-.1 2.187-.5.597-.301 16.203-7.602 31.61-27.706 6.823-8.911 14.278-21.32 20.137-37.846.057-.151.107-.306.163-.457 6.09-17.348 10.415-39.202 10.415-66.319.001-2.903-2.285-5.203-5.168-5.203z');

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'ש.ת מנעולן', 'S.T Locksmith');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-tabs]', 'סוגי פריצה', 'Kinds of opening');
    aria('[data-t-dial]', 'בחירת עבודה', 'Choose the job');
    aria('[data-t-jobs]', 'העבודה', 'The job');
    aria('[data-t-areas]', 'אזור', 'Area');
    aria('[data-t-call]', 'התקשרו לשמואל, 052-525-7499', 'Call Shmuel, 052-525-7499');
    aria('[data-t-wa]', 'וואטסאפ לשמואל', 'WhatsApp Shmuel');
    $$('[data-tag]').forEach(function (t) { t.textContent = t.dataset[l]; });
    $$('[data-decode]').forEach(function (h) { $$('span[lang]', h).forEach(function (s) { if (s.dataset.t) s.textContent = s.dataset.t; }); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('st-lang', l); } catch (e) {}
    texts(l); hours(); dialUI(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('st-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-land]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-odo]').forEach(function (o) { roll(o, true); });
    layout(); field.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time
  // Sunday–Thursday around the clock; Friday until 13:30; Saturday from 21:00 (the Google listing). null = closed
  var H = { 0: [[0, 24]], 1: [[0, 24]], 2: [[0, 24]], 3: [[0, 24]], 4: [[0, 24]], 5: [[0, 13.5]], 6: [[21, 24]] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { x = x % 24; var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  // the week as merged intervals in hours from Sunday 0:00, so Saturday night runs on into Sunday
  function week() {
    var iv = [];
    for (var d = 0; d < 7; d++) (H[d] || []).forEach(function (t) { iv.push([d * 24 + t[0], d * 24 + t[1]]); });
    var m = [];
    iv.forEach(function (t) { var l = m[m.length - 1]; if (l && Math.abs(l[1] - t[0]) < 1e-6) l[1] = t[1]; else m.push(t.slice()); });
    if (m.length > 1 && m[0][0] === 0 && m[m.length - 1][1] === 168) { var last = m.pop(); m[0] = [last[0] - 168, m[0][1]]; }
    return m;
  }
  function status() {
    var n = window.__now || now(), l = he(), t = n.d * 24 + n.h, W = week(), txt, open = false;
    if (W.length === 1 && W[0][1] - W[0][0] >= 168) { open = true; txt = l ? 'פתוח עכשיו · 24/7' : 'Open now · 24/7'; }
    else {
      var cur = null;
      W.forEach(function (iv) { [0, 168, -168].forEach(function (k) { if (t >= iv[0] + k && t < iv[1] + k) cur = [iv[0] + k, iv[1] + k]; }); });
      if (cur) {
        open = true;
        var ed = Math.floor(cur[1] / 24) % 7, eh = cur[1] - Math.floor(cur[1] / 24) * 24, same = Math.floor(cur[1] / 24) === Math.floor(t / 24) || (eh === 0 && cur[1] - t <= 24);
        if (eh === 0) { ed = (ed + 6) % 7; eh = 24; }
        txt = same ? (l ? 'פתוח עכשיו · עד ' + hhmm(eh) : 'Open now · until ' + hhmm(eh))
                   : (l ? 'פתוח עכשיו · עד יום ' + dayHe[ed] + ' ' + hhmm(eh) : 'Open now · until ' + dayEn[ed] + ' ' + hhmm(eh));
      } else {
        var nx = null;
        W.forEach(function (iv) { [0, 168, 336].forEach(function (k) { var s = iv[0] + k; if (s > t && (nx === null || s < nx)) nx = s; }); });
        var sd = Math.floor(nx / 24) % 7, sh = nx - Math.floor(nx / 24) * 24, today = Math.floor(nx / 24) === Math.floor(t / 24);
        txt = today ? (sd === 6 ? (l ? 'סגור עכשיו · נפתח במוצאי שבת ב-' + hhmm(sh) : 'Closed now · opens tonight at ' + hhmm(sh)) : (l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(sh) : 'Closed now · opens today at ' + hhmm(sh)))
              : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[sd] + ' ב-' + hhmm(sh) : 'Closed now · opens ' + dayEn[sd] + ' at ' + hhmm(sh));
      }
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0, key = function (d) { return JSON.stringify(H[d]); };
    while (i < 7) { var j = i; while (j + 1 < 7 && key(j + 1) === key(i)) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed')
        : t.map(function (x) { return x[0] === 0 && x[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(x[0]) + '–' + hhmm(x[1]) + '</span>'; }).join(', ');
      if (r[0] === 6 && t) val = (l ? 'מוצאי שבת, ' : 'Saturday night, ') + val;
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.specs').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); }); });
  $$('[data-land]').forEach(function (t, i) { t.style.setProperty('--d', i * 140 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); if (e.target.hasAttribute('data-tile')) decode($('[data-decode]', e.target)); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-land]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 10 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });
  // the creed fills in letter by letter as you scroll
  var fillChars = [];
  $$('[data-fill] > span[lang]').forEach(function (sp) {
    sp.innerHTML = sp.textContent.split(' ').map(function (w) { return '<span class="w" style="white-space:nowrap">' + w.split('').map(function (c) { return '<span class="c">' + c + '</span>'; }).join('') + '</span>'; }).join(' ');
  });
  // service names decode out of scrambled letters, like a code lock settling
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHKLMNPRSTUVXZ' };
  $$('[data-decode] span[lang]').forEach(function (s) { s.dataset.t = s.textContent; });
  function decode(h) {
    if (!h || still()) return;
    var s = $('span[lang="' + root.lang + '"]', h), fin = s.dataset.t, set = GL[root.lang], t0 = performance.now(), dur = 700;
    (function st(t) {
      var k = clamp((t - t0) / dur, 0, 1), n = Math.floor(fin.length * k);
      s.textContent = fin.split('').map(function (c, i) { return i < n || c === ' ' || c === '-' ? c : set[Math.floor(Math.random() * set.length)]; }).join('');
      if (k < 1) requestAnimationFrame(st); else s.textContent = fin;
    })(t0);
  }

  // ---------------------------------------------------------------- odometers (the figures roll like a combination)
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  var creedOdos = $$('[data-creed] [data-odo]'), creedRolled = false;
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (creedOdos.indexOf(o) >= 0) return;
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  var nav = $('[data-nav]');

  // ---------------------------------------------------------------- HERO: the shield window, the torch and the field of shields
  var open = $('[data-open]'), box = $('.hero-box'), win = $('[data-win]'), imgs = $$('img', win), real = $('[data-real]');
  var hcopy = $('[data-hcopy]'), wcap = $('[data-wcap]'), creed = $('[data-creed]');
  var G = { w: 0, h: 0, e: 0, s0: null, tx: 0, ty: 0, px: -1, py: -1, pt: 0 };
  function shieldAt(e) {
    var W = box.clientWidth, Hh = box.clientHeight, w0, h0, cx0, top0;
    if (narrow()) { w0 = W * 1.3; h0 = w0 * 160 / 133; cx0 = W / 2; top0 = Hh * .56; }
    else { h0 = Hh * 1.2; w0 = h0 * 133 / 160; cx0 = W * (rtl() ? .25 : .75); top0 = Hh * .55 - h0 / 2; }
    var w1 = Math.max(W / .84, (Hh / .44) * 133 / 160), h1 = w1 * 160 / 133, cx1 = W / 2, top1 = -h1 * .13;
    return { w: lerp(w0, w1, e), h: lerp(h0, h1, e), cx: lerp(cx0, cx1, e), top: lerp(top0, top1, e), vx: cx0, vy: narrow() ? (top0 + Hh) / 2 : Hh * .52, w0: w0 };
  }
  function heroLayout(e) {
    var W = box.clientWidth, Hh = box.clientHeight, S = shieldAt(e);
    win.style.setProperty('--mw', S.w.toFixed(1) + 'px'); win.style.setProperty('--mh', S.h.toFixed(1) + 'px');
    win.style.setProperty('--mx', (S.cx - S.w / 2).toFixed(1) + 'px'); win.style.setProperty('--my', S.top.toFixed(1) + 'px');
    // put the cylinder and the drill bit under the window, then let the photo settle to the centre as it opens
    var s = Math.max(W / 1100, Hh / 1466), dw = 1100 * s, dh = 1466 * s, ox = (W - dw) * .5, oy = (Hh - dh) * .3;
    var fx = ox + dw * .52, fy = oy + dh * .36, k = 1 - smooth(e / .9);
    var ix = (S.vx - fx) * k, iy = (S.vy - fy) * k, sc = 1.12 - .12 * smooth(e);
    G.ix = ix; G.iy = iy; G.sc = sc; G.S = S;
    imgs.forEach(function (im) { im.style.setProperty('--ix', ix.toFixed(1) + 'px'); im.style.setProperty('--iy', iy.toFixed(1) + 'px'); im.style.setProperty('--is', sc.toFixed(4)); });
  }
  // the torch: position on screen -> the real photo's own coordinates (it is translated and scaled)
  function torch(x, y, r) {
    var W = box.clientWidth, Hh = box.clientHeight;
    var lx = (x - G.ix - W / 2) / G.sc + W / 2, ly = (y - G.iy - Hh / 2) / G.sc + Hh / 2;
    real.style.setProperty('--tx', lx.toFixed(1) + 'px'); real.style.setProperty('--ty', ly.toFixed(1) + 'px'); real.style.setProperty('--tr', (r / G.sc).toFixed(1) + 'px');
    G.tx = x; G.ty = y; G.tr = r;
  }
  box.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = box.getBoundingClientRect(); G.px = e.clientX - r.left; G.py = e.clientY - r.top; G.pt = performance.now(); field.kick(); });
  box.addEventListener('pointerleave', function () { G.px = -1; });
  box.addEventListener('pointerdown', function (e) { var r = box.getBoundingClientRect(); G.px = e.clientX - r.left; G.py = e.clientY - r.top; G.pt = performance.now(); field.kick(); });

  var field = (function () {
    var cv = $('[data-field]'), c = cv.getContext('2d'), w, h, cell, P = [], raf = 0, vis = true, t0 = performance.now(), cx = 0, cy = 0;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = box.clientWidth; h = box.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = narrow() ? 40 : 52; P = [];
      for (var y = cell / 2; y < h + cell; y += cell) for (var x = cell / 2 + ((y / cell) % 2 ? cell / 2 : 0); x < w + cell; x += cell) P.push({ x: x, y: y, ph: Math.random() * 6.28, f: 0 });
    }
    function draw(T, calm) {
      c.clearRect(0, 0, w, h);
      var tx = G.tx, ty = G.ty, R = narrow() ? 200 : 300;
      for (var i = 0; i < P.length; i++) {
        var p = P[i], dx = p.x - tx, dy = p.y - ty, d = Math.sqrt(dx * dx + dy * dy), near = calm ? 0 : clamp(1 - d / R, 0, 1);
        if (!calm && Math.random() < .0015) p.f = 1; p.f *= .95;
        var a = .07 + near * .55 + p.f * .35, sc = (narrow() ? .085 : .1) * (1 + near * .5), lift = near * 6;
        c.save(); c.translate(p.x + (calm ? 0 : Math.sin(T * .6 + p.ph) * 1.5), p.y - lift); c.scale(sc, sc); c.translate(-100, -100);
        c.fillStyle = 'rgba(124,196,255,' + a.toFixed(3) + ')'; c.fill(SHIELD); c.restore();
      }
    }
    function frame(now) {
      raf = 0;
      var calm = still(), T = (now - t0) / 1000, S = G.S || shieldAt(0), e = G.e;
      var r0 = narrow() ? 120 : 170, R = calm ? 5000 : r0 + smooth(e / .7) * Math.max(w, h) * 1.4;
      var auto = G.px < 0 || now - G.pt > 2600;
      var ax = S.vx + Math.sin(T * .55) * S.w0 * .2, ay = S.vy + Math.sin(T * .8 + 1) * Math.min(h * .14, S.w0 * .25);
      if (narrow()) { ax = S.vx + Math.sin(T * .55) * w * .3; ay = S.vy + Math.sin(T * .8 + 1) * h * .1; }
      var tx = auto ? ax : G.px, ty = auto ? ay : G.py;
      cx = calm ? S.vx : lerp(cx || tx, tx, .12); cy = calm ? S.vy : lerp(cy || ty, ty, .12);
      torch(cx, cy, R);
      draw(T, calm);
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    watch(box, function (v) { vis = v; kick(); });
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- services: living tiles, a light under the hand, the keypad types a code
  var work = $('#work'), workOn = false;
  watch(work, function (v) { workOn = v; work.classList.toggle('on', v); });
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); t.classList.add('lit'); });
    t.addEventListener('pointerleave', function () { t.classList.remove('lit'); });
  });
  var keys = $$('.v-pad .keys circle'), pins = $$('[data-pin] circle'), led = $('.v-pad .led'), code = 0;
  setInterval(function () {
    if (!workOn || still()) return;
    if (code === 4) { pins.forEach(function (p) { p.classList.remove('on'); }); led.classList.remove('ok'); code = 0; return; }
    var k = keys[Math.floor(Math.random() * keys.length)];
    if (k.animate) k.animate([{ fill: '#7cc4ff' }, { fill: '#2a4a86' }], { duration: 420, easing: 'ease-out' });
    pins[code].classList.add('on'); code++;
    if (code === 4) led.classList.add('ok');
  }, 520);

  // ---------------------------------------------------------------- craft: tabs
  var tabs = $$('[data-tab]'), panes = $$('[data-pane]'), tabTouched = false, curTab = 0;
  function showTab(i, focus) {
    curTab = i;
    tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
    panes.forEach(function (p, k) { p.hidden = k !== i; });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { tabTouched = true; showTab(i); });
    t.addEventListener('keydown', function (e) { var d = e.key === 'ArrowLeft' ? (rtl() ? 1 : -1) : e.key === 'ArrowRight' ? (rtl() ? -1 : 1) : 0; if (d) { e.preventDefault(); tabTouched = true; showTab((i + d + tabs.length) % tabs.length, true); } });
  });
  var craft = $('[data-craft]'), plate = $('[data-plate]'), preal = $('[data-preal]'), scan = $('[data-scan]'), tagEls = $$('[data-tag]');
  function placeTags() { tagEls.forEach(function (t) { t.style.left = (+t.dataset.x * 100) + '%'; t.style.top = (+t.dataset.y * 100) + '%'; }); }
  plate.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse' || still()) return; var r = plate.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; plate.style.transform = 'perspective(1200px) rotateY(' + (x * 6).toFixed(2) + 'deg) rotateX(' + (-y * 6).toFixed(2) + 'deg)'; });
  plate.addEventListener('pointerleave', function () { plate.style.transform = ''; });
  plate.style.transition = 'transform .5s cubic-bezier(.23,1,.32,1)';

  // ---------------------------------------------------------------- the dial (the live thing)
  var dial = $('[data-dial]'), dwrap = $('[data-dialwrap]'), jobs = $$('[data-job]'), N = jobs.length, STEP = 360 / N, rot = 0, sel = 0, dlabel = $('[data-dlabel]'), mark = $('.d-face .mark');
  (function buildDial() {
    var tk = $('[data-ticks]'), gp = $('[data-grip]');
    for (var i = 0; i < 48; i++) { var a = i * 7.5 * Math.PI / 180, big = i % 6 === 0, r1 = big ? 112 : 118, r2 = 126, l = document.createElementNS(NS, 'line'); l.setAttribute('x1', 150 + Math.sin(a) * r1); l.setAttribute('y1', 150 - Math.cos(a) * r1); l.setAttribute('x2', 150 + Math.sin(a) * r2); l.setAttribute('y2', 150 - Math.cos(a) * r2); if (big) l.setAttribute('class', 'big'); tk.appendChild(l); }
    for (var j = 0; j < 16; j++) { var b = j * 22.5 * Math.PI / 180, c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', 150 + Math.sin(b) * 54); c.setAttribute('cy', 150 - Math.cos(b) * 54); c.setAttribute('r', 3.2); gp.appendChild(c); }
  })();
  var mod = function (a, n) { return ((a % n) + n) % n; };
  function dialUI() {
    dial.style.setProperty('--rot', rot.toFixed(2) + 'deg');
    jobs.forEach(function (b, i) {
      var a = (i * STEP + rot) * Math.PI / 180, r = 33;
      b.style.setProperty('--x', (50 + Math.sin(a) * r).toFixed(2) + '%'); b.style.setProperty('--y', (50 - Math.cos(a) * r).toFixed(2) + '%');
    });
    var ns = mod(Math.round(-rot / STEP), N);
    if (ns !== sel) { sel = ns; if (mark.animate && !still()) mark.animate([{ transform: 'translateY(3px)' }, { transform: 'none' }], { duration: 140, easing: 'ease-out' }); write(); lightStep(0); }
    jobs.forEach(function (b, i) { b.setAttribute('aria-checked', i === sel ? 'true' : 'false'); b.tabIndex = i === sel ? 0 : -1; });
    var lab = $('span[lang="' + root.lang + '"]', jobs[sel]).textContent;
    dlabel.textContent = lab;
    dial.setAttribute('aria-valuenow', sel + 1); dial.setAttribute('aria-valuetext', lab);
  }
  var anim = 0;
  function turnTo(target) {
    cancelAnimationFrame(anim);
    if (still()) { rot = target; dialUI(); return; }
    var from = rot, t0 = performance.now(), dur = 420;
    (function st(t) { var k = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 3); rot = lerp(from, target, e); dialUI(); if (k < 1) anim = requestAnimationFrame(st); })(t0);
  }
  function choose(i) { var target = -i * STEP, d = mod(target - rot + 180, 360) - 180; turnTo(rot + d); }
  var drag = null;
  function ang(e) { var r = dial.getBoundingClientRect(); return Math.atan2(e.clientX - r.left - r.width / 2, -(e.clientY - r.top - r.height / 2)) * 180 / Math.PI; }
  dwrap.addEventListener('pointerdown', function (e) {
    var r = dial.getBoundingClientRect(), dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2;
    if (Math.sqrt(dx * dx + dy * dy) > r.width / 2) return;
    cancelAnimationFrame(anim); drag = { a: ang(e), moved: 0, id: e.pointerId, job: e.target.closest('[data-job]') }; dial.classList.add('drag');
    try { dwrap.setPointerCapture(e.pointerId); } catch (x) {}
  });
  dwrap.addEventListener('pointermove', function (e) {
    if (!drag) return; var a = ang(e), d = mod(a - drag.a + 180, 360) - 180; drag.a = a; drag.moved += Math.abs(d); rot += d; dialUI();
  });
  function endDrag() {
    if (!drag) return; var d = drag; drag = null; dial.classList.remove('drag');
    if (d.moved < 4 && d.job) { choose(jobs.indexOf(d.job)); return; }
    turnTo(Math.round(rot / STEP) * STEP);
  }
  dwrap.addEventListener('pointerup', endDrag); dwrap.addEventListener('pointercancel', endDrag);
  jobs.forEach(function (b, i) { b.addEventListener('click', function (e) { if (e.detail === 0) choose(i); }); });
  dial.addEventListener('keydown', function (e) {
    var d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
    if (d) { e.preventDefault(); choose(mod(sel + d, N)); }
  });
  $('[data-t-jobs]').addEventListener('keydown', function (e) {
    var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (d) { e.preventDefault(); var n = mod(sel + d, N); choose(n); jobs[n].focus(); }
  });

  // ---------------------------------------------------------------- the composer: the message to Shmuel writes itself on the lock's screen
  var steps = $$('[data-step]'), areas = $$('[data-area]'), msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  areas.forEach(function (b) { b.addEventListener('click', function () { areas.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lightStep(1); write(); }); });
  $('[data-send]').addEventListener('pointerenter', function () { lightStep(2); });
  $('[data-send]').addEventListener('focus', function () { lightStep(2); });
  $('[data-send]').addEventListener('click', function () { lightStep(2); });
  function compose() {
    var l = he(), job = jobs[sel].dataset[l ? 'he' : 'en'], a = areas.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0].dataset[l ? 'he' : 'en'];
    return l ? 'שלום שמואל, אשמח לעזרה עם ' + job + ', ' + a + '.' : 'Hi Shmuel, I’d like help with ' + job + ', ' + a + '.';
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
  watch($('[data-screen]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- the rest of the scroll-linked parts
  var band = $('[data-band]'), drift = $('[data-drift]'), revs = $('[data-revs]');
  var close = $('[data-close]'), clwin = $('[data-clwin]'), clseal = $('[data-clseal]'), clh = $('[data-clh]'), clStage = $('.cl-stage'), foot = $('.foot');

  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function pass(el) { var r = el.getBoundingClientRect(); return clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // hero: the shield opens to the whole screen, the creed fills in over the photo
    var p = calm ? 0 : prog(open), e = calm ? 0 : smooth((p - .03) / .27);
    G.e = e; heroLayout(e); field.kick();
    if (!calm) {
      var hf = 1 - smooth((p - .01) / .12);
      hcopy.style.opacity = hf.toFixed(3); hcopy.style.transform = narrow() ? 'translateY(' + ((1 - hf) * -40).toFixed(1) + 'px)' : 'translateY(calc(-46% + ' + ((1 - hf) * -40).toFixed(1) + 'px))';
      hcopy.style.visibility = hf < .01 ? 'hidden' : '';
      wcap.style.opacity = hf.toFixed(3);
      var co = smooth((p - .24) / .08); creed.style.setProperty('--co', co.toFixed(3));
      var q = smooth((p - .27) / .17), chars = $$('[data-fill] > span[lang="' + root.lang + '"] .c'), lit = Math.round(q * chars.length);
      chars.forEach(function (c, i) { c.classList.toggle('on', i < lit); });
      if (co > .6 && !creedRolled) { creedRolled = true; creedOdos.forEach(function (o) { roll(o, true); }); }
    } else { hcopy.style.opacity = ''; hcopy.style.transform = ''; hcopy.style.visibility = ''; wcap.style.opacity = ''; }
    // band slides with the scroll
    var bp = pass(band.parentNode), bw = band.scrollWidth - innerWidth;
    band.style.transform = calm ? '' : 'translate3d(' + ((rtl() ? 1 : -1) * bp * Math.max(0, bw) * .6).toFixed(1) + 'px,0,0)';
    // craft: the scan passes down the plate; tabs follow it until the visitor picks one
    var cp = calm ? 1 : prog(craft), sp = calm ? 1 : smooth((cp - .06) / .62);
    preal.style.setProperty('--sp', (sp * 100).toFixed(2) + '%'); scan.style.setProperty('--sp', (sp * 100).toFixed(2) + '%');
    scan.style.setProperty('--so', !calm && sp > .005 && sp < .995 ? '1' : '0');
    tagEls.forEach(function (t) { t.classList.toggle('on', calm || sp > +t.dataset.y + .03); });
    if (!calm && !tabTouched) { var ti = cp < .45 ? 0 : cp < .72 ? 1 : 2; if (ti !== curTab) showTab(ti); }
    // reviews drift past
    var rp = pass(revs), dw = drift.scrollWidth - innerWidth;
    drift.style.transform = calm ? '' : 'translate3d(' + ((rtl() ? 1 : -1) * smooth(rp * 1.15 - .1) * Math.max(0, dw)).toFixed(1) + 'px,0,0)';
    // closing: the boulevard shrinks back into the shield, the real logo settles over it
    if (!calm) {
      var kp = prog(close), ke = smooth(kp / .55), W = clStage.clientWidth, Hh = clStage.clientHeight;
      var w1 = Math.max(W / .84, (Hh / .44) * 133 / 160), h1 = w1 * 160 / 133;
      var ws = narrow() ? Math.min(W * .5, 200) : Math.min(Hh * .34 * 133 / 160, 220), hs = ws * 160 / 133;
      var cy = Hh * .42, w = lerp(w1, ws, ke), h = lerp(h1, hs, ke), top = lerp(-h1 * .13, cy - hs / 2, ke);
      clwin.style.setProperty('--cw', w.toFixed(1) + 'px'); clwin.style.setProperty('--ch', h.toFixed(1) + 'px');
      clwin.style.setProperty('--cx', (W / 2 - w / 2).toFixed(1) + 'px'); clwin.style.setProperty('--cy', top.toFixed(1) + 'px');
      clwin.style.setProperty('--cs', (1 + .18 * ke).toFixed(4));
      clseal.style.setProperty('--sw', ws.toFixed(1) + 'px'); clseal.style.setProperty('--sy', cy.toFixed(1) + 'px');
      clseal.style.setProperty('--so', smooth((kp - .55) / .14).toFixed(3));
      clh.style.setProperty('--ho', smooth((kp - .6) / .14).toFixed(3));
    }
  }

  // the footer name fills its width
  var fw = $('[data-fit]');
  function fit() { fw.style.fontSize = ''; var s = getComputedStyle(fw), f = parseFloat(s.fontSize), sp = $('span[lang="' + root.lang + '"]', fw); if (!sp) return; var avail = fw.clientWidth, need = sp.getBoundingClientRect().width; if (need > avail) fw.style.fontSize = Math.floor(f * avail / need * .98) + 'px'; }

  function layout() { field.size(); placeTags(); dialUI(); fit(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); dialUI(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { box.classList.add('ready'); field.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { go(); fit(); });
  setTimeout(go, 1200);
  addEventListener('load', function () { layout(); });
})();
