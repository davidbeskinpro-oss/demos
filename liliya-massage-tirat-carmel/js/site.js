(function () {
  'use strict';
  var root = document.documentElement;
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
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var prog = function (el) { var r = el.getBoundingClientRect(), run = r.height - innerHeight; return run > 0 ? clamp(-r.top / run, 0, 1) : (r.top < 0 ? 1 : 0); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('.pb-call', 'חיוג לליליה', 'Call Liliya');
    aria('.pb-wa', 'וואטסאפ לליליה', 'WhatsApp Liliya');
    aria('.pebbles', 'יצירת קשר', 'Contact');
    aria('[data-lily]', 'תמונות של ליליה והטיפולים', 'Photos of Liliya and her treatments');
    aria('.links', 'ראשי', 'Main');
    aria('.brand', 'ליליה', 'Liliya');
    var f = $('.c-map iframe'); if (f) f.title = l === 'he' ? 'מפה: העוגן 11, טירת כרמל' : 'Map: 11 HaOgen, Tirat Carmel';
    document.title = l === 'he' ? 'ליליה · עיסוי טיפולי ורפלקסולוגיה · העוגן 11, טירת כרמל' : 'Liliya · Therapeutic massage & reflexology · 11 HaOgen, Tirat Carmel';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('lt-lang', l); } catch (e) {}
    texts(l); hours(); compose(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- animations on/off
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(); root.classList.toggle('still', !on);
    try { localStorage.setItem('lt-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI(); revealAll(); layout(); kick(); petalsA.kick(); petalsB.kick();
  }); });

  // ---------------------------------------------------------------- hours + live status (Israel time)
  var H = { 0: [8, 20], 1: [8, 20], 2: [8, 20], 3: [8, 20], 4: [8, 20], 5: [8, 16], 6: [8, 20] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
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
  // consecutive days with the same hours share a row; Saturday wraps onto Sunday's group only if adjacent in the week
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

  // ---------------------------------------------------------------- letters
  function split(el) {
    var i = 0;
    $$('span[lang]', el).forEach(function (sp) {
      i = 0;
      var nodes = [].slice.call(sp.childNodes);
      sp.innerHTML = '';
      nodes.forEach(function (n) {
        var txt = n.textContent, host = sp;
        if (n.nodeType === 1) { host = n.cloneNode(false); sp.appendChild(host); }
        txt.split(/(\s+)/).forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) { host.appendChild(document.createTextNode(' ')); return; }
          var ws = document.createElement('span'); ws.style.whiteSpace = 'nowrap'; ws.style.display = 'inline-block';
          w.split('').forEach(function (c) { var s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = c; ws.appendChild(s); });
          host.appendChild(ws);
        });
      });
    });
  }
  $$('[data-letters],[data-fill]').forEach(split);
  (function () { var w = $('[data-word]'); if (!w) return; w.innerHTML = w.textContent.split('').map(function (c, i) { return '<span class="ch" style="--i:' + i + '">' + c + '</span>'; }).join(''); })();

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.classList.add('odo');
    o.setAttribute('aria-label', o.dataset.odo);
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span aria-hidden="true">' + ch + '</span>';
      return '<span class="d" aria-hidden="true" data-to="' + ch + '"></span>';
    }).join('');
    watch(o, function (v) { if (!v) return; $$('.d', o).forEach(function (d, i) { d.style.setProperty('--dl', still() ? '0ms' : (i * 160) + 'ms'); d.style.setProperty('--to', d.dataset.to); }); });
  });

  // ---------------------------------------------------------------- reveals
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-bento]').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 5) * 80 + 'ms'); }); });
  $$('[data-reveal],[data-land],[data-word]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  // a bento grid arrives as one: all its tiles settle together (staggered), so no tile is left as an empty hole at the fold
  $$('[data-bento]').forEach(function (g) { watch(g, function (v) { if (v) $$('[data-tile]', g).forEach(function (t) { t.classList.add('in'); }); }, { rootMargin: '0px 0px -10% 0px' }); });
  function revealAll() { if (still()) $$('[data-reveal],[data-tile],[data-land],[data-word],.tc').forEach(function (el) { el.classList.add('in'); }); }

  // glyph-decode labels (letters settle out of scrambled glyphs)
  var glyphs = 'אבגדהוזחטיכלמנסעפצקרשתABCDEFGHKLMNPRSTXYZ0123456789·';
  $$('[data-decode-he]').forEach(function (cap) {
    watch(cap, function (v) {
      if (!v || still() || cap.dataset.done) return; cap.dataset.done = 1;
      var sp = $('span[lang="' + root.lang + '"]', cap), target = cap.dataset[he() ? 'decodeHe' : 'decodeEn'], t0 = performance.now();
      (function step(t) {
        var k = (t - t0) / 900, out = '';
        for (var i = 0; i < target.length; i++) out += (target[i] === ' ' || i / target.length < k) ? target[i] : glyphs[(Math.random() * glyphs.length) | 0];
        sp.textContent = out; if (k < 1) requestAnimationFrame(step); else sp.textContent = target;
      })(t0);
    });
  });

  // spotlight + tilt on bento tiles
  $$('.b, .c').forEach(function (t) {
    t.addEventListener('pointermove', function (e) {
      var r = t.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      t.style.setProperty('--mx', x + 'px'); t.style.setProperty('--my', y + 'px');
      if (fine && !still() && t.hasAttribute('data-tilt') && t.classList.contains('in')) t.style.transform = 'perspective(900px) rotateY(' + ((x / r.width - .5) * 7) + 'deg) rotateX(' + ((.5 - y / r.height) * 6) + 'deg)';
    });
    t.addEventListener('pointerleave', function () { t.style.setProperty('--mx', '-300px'); if (t.hasAttribute('data-tilt')) t.style.transform = ''; });
  });

  // ---------------------------------------------------------------- drifting lily petals (the logo's flower, as particles)
  function Petals(cv, host, opt) {
    var c = cv.getContext('2d'), P = [], w = 0, h = 0, raf = 0, vis = false, mx = -999, my = -999, last = 0;
    function make(x, y, burst) {
      var s = (phone() ? 9 : 12) + Math.random() * (phone() ? 12 : 18);
      return { x: x == null ? Math.random() * w : x, y: y == null ? Math.random() * h : y, s: s, a: Math.random() * 6.28, va: (Math.random() - .5) * .02,
        vx: burst ? (Math.random() - .5) * 3 : (Math.random() - .5) * .3, vy: burst ? -Math.random() * 2 : .25 + Math.random() * .45, ph: Math.random() * 6.28, life: burst ? 1 : 0, tint: Math.random() };
    }
    function size() { var d = Math.min(2, devicePixelRatio || 1); w = host.clientWidth; h = host.clientHeight; cv.width = w * d; cv.height = h * d; c.setTransform(d, 0, 0, d, 0, 0); var n = Math.round((phone() ? opt.n * .55 : opt.n)); while (P.length < n) P.push(make()); P.length = n; }
    function petal(p, alpha) {
      c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.globalAlpha = alpha;
      var s = p.s, g = c.createLinearGradient(0, -s, 0, s);
      g.addColorStop(0, opt.c1); g.addColorStop(1, p.tint > .5 ? opt.c2 : opt.c3);
      c.fillStyle = g; c.beginPath(); c.moveTo(0, -s); c.bezierCurveTo(s * .7, -s * .5, s * .55, s * .7, 0, s); c.bezierCurveTo(-s * .55, s * .7, -s * .7, -s * .5, 0, -s); c.fill();
      c.strokeStyle = opt.vein; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -s * .7); c.quadraticCurveTo(s * .08, 0, 0, s * .8); c.stroke();
      c.restore();
    }
    function frame(t) {
      raf = 0; if (!vis || still()) { if (still()) draw(0); return; }
      var dt = last ? Math.min(3, (t - last) / 16.7) : 1; last = t;
      P.forEach(function (p, i) {
        p.ph += .01 * dt; p.x += (p.vx + Math.sin(p.ph) * .35) * dt; p.y += p.vy * dt; p.a += p.va * dt + Math.sin(p.ph) * .004;
        if (p.life) { p.vx *= .97; p.vy += .02 * dt; }
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 16000) { var f = (1 - d2 / 16000) * 1.6; p.x += dx / Math.sqrt(d2 + 1) * f * dt * 2; p.y += dy / Math.sqrt(d2 + 1) * f * dt * 2; p.va += .002; }
        if (p.y > h + 30 || p.x < -40 || p.x > w + 40) { if (p.life) { P.splice(i, 1); return; } var q = make(Math.random() * w, -30); P[i] = q; }
      });
      draw(1); raf = requestAnimationFrame(frame);
    }
    function draw(m) { c.clearRect(0, 0, w, h); P.forEach(function (p) { petal(p, opt.alpha * (m ? 1 : .8)); }); }
    host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    host.addEventListener('pointerleave', function () { mx = my = -999; });
    host.addEventListener('pointerdown', function (e) { if (still()) return; var r = host.getBoundingClientRect(); for (var k = 0; k < 6; k++) P.push(make(e.clientX - r.left, e.clientY - r.top, true)); });
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    watch(host, function (v) { vis = v; kick(); });
    size();
    return { kick: kick, size: function () { size(); kick(); } };
  }
  var hero = $('[data-hero]');
  var petalsA = Petals($('[data-petals]'), hero, { n: 26, alpha: .85, c1: 'rgba(252,236,226,.95)', c2: 'rgba(240,201,182,.85)', c3: 'rgba(227,173,98,.7)', vein: 'rgba(201,141,67,.35)' });
  var words = $('[data-words]');
  var petalsB = Petals($('[data-petals2]'), words, { n: 16, alpha: .7, c1: 'rgba(251,239,232,.95)', c2: 'rgba(220,161,137,.75)', c3: 'rgba(201,141,67,.5)', vein: 'rgba(125,92,85,.3)' });

  // ---------------------------------------------------------------- the lily of photos (hero)
  var lily = $('[data-lily]'), pts = $$('.pt', lily);
  var ANG = [-64, -33, 0, 33, 64, 0], ANGP = [-50, -26, 0, 26, 50, 0], LIFT = [0, 2, 7, 2, 0, 0], t0 = 0, pick = -1, pickT = 0, tx = 0, ty = 0, cx = 0, cy = 0, heroP = 0;
  function lilyFrame(t) {
    if (!t0) t0 = t;
    var s = (t - t0) / 1000, st = still(), auto = !fine;
    cx += (tx - cx) * .08; cy += (ty - cy) * .08;
    var ax = auto ? Math.sin(s * .5) * .35 : cx, ay = auto ? Math.cos(s * .4) * .2 : cy;
    if (!st) lily.style.transform = 'rotateY(' + (ax * 10) + 'deg) rotateX(' + (-ay * 7) + 'deg)';
    else lily.style.transform = '';
    pts.forEach(function (p, i) {
      var o = st ? 1 : smooth((s - .15 - i * .13) / .9);   // dealt open one by one, the portrait last
      var close = st ? 0 : heroP * .8;                    // folds back into a bud as you scroll away (reverses on the way up)
      var open = o * (1 - close), sway = st ? 0 : Math.sin(s * .9 + i * 1.3) * 1.6 * o;
      var front = i === pick && t - pickT < 2600;
      var sc = (i === 5 ? 1 : .94) * lerp(.55, 1, o) * (front ? 1.08 : 1);
      p.style.transform = 'rotate(' + ((phone() ? ANGP : ANG)[i] * open + sway + (i < 5 ? (ax * 4) : 0)) + 'deg) translateY(' + (-LIFT[i] * open) + '%) scale(' + sc + ')';
      p.style.opacity = st ? 1 : clamp(o * 1.6, 0, 1);
      p.style.zIndex = front ? 12 : (i === 5 ? 10 : (i === 2 ? 1 : 5 - Math.abs(i - 2)));
      p.style.setProperty('--sh', (120 - ((s * 18 + i * 30) % 240)) + '%');
      p.classList.toggle('on', front); p.classList.toggle('dim', pick >= 0 && !front && t - pickT < 2600);
    });
    if (!st) requestAnimationFrame(lilyFrame); else lilyRaf = 0;
  }
  var lilyRaf = 0;
  function lilyKick() { if (!lilyRaf) lilyRaf = requestAnimationFrame(function (t) { lilyRaf = 1; lilyFrame(t); }); }
  hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - .5; ty = (e.clientY - r.top) / r.height - .5; });
  hero.addEventListener('pointerleave', function () { tx = ty = 0; });
  pts.forEach(function (p, i) { p.addEventListener('click', function () { pick = i; pickT = performance.now(); if (still()) lilyFrame(performance.now()); }); });

  // ---------------------------------------------------------------- scroll scenes
  var nav = $('[data-nav]'), pebbles = $('.pebbles');
  var warm = $('[data-warmth]'), wframe = $('[data-wframe]'), wchars = $$('[data-fill] .ch');
  var menu = $('[data-menu]'), track = $('[data-track]'), cards = $$('.tc', track), mbar = $('[data-mbar]'), D = 0;
  var vwrap = $('[data-vwrap]'), vphoto = $('[data-vphoto]');
  var notes = $$('[data-land]');
  function layout() {
    D = Math.max(0, track.scrollWidth - menu.clientWidth);
    menu.style.setProperty('--D', D + 'px');
    if (still()) {
      track.style.transform = ''; wframe.removeAttribute('style'); $('img', wframe).style.transform = ''; vphoto.removeAttribute('style');
      notes.forEach(function (n) { n.style.removeProperty('--py'); });
      lily.style.transform = ''; lilyFrame(performance.now());
    } else lilyKick();
    petalsA.size(); petalsB.size(); tick();
  }
  function tick() {
    raf = 0;
    var y = scrollY;
    nav.classList.toggle('pill', y > 40);
    pebbles.classList.toggle('on', y > innerHeight * .7);
    var r = hero.getBoundingClientRect(); heroP = clamp(-r.top / (r.height * .9), 0, 1);
    if (still()) return;
    // warm stones: from a small rounded window to the whole screen
    var p = prog(warm), o = smooth(p / .55), ph = phone();
    var t0_ = ph ? 14 : 12, s0 = ph ? 8 : 24;
    wframe.style.setProperty('--ct', lerp(t0_, 0, o) + '%'); wframe.style.setProperty('--cbm', lerp(t0_ + 6, 0, o) + '%');
    wframe.style.setProperty('--cs', lerp(s0, 0, o) + '%'); wframe.style.setProperty('--cr', lerp(ph ? 160 : 260, 0, o) + 'px');
    wframe.style.setProperty('--ws', lerp(1.3, 1.02, smooth(p)));
    wframe.style.setProperty('--hv', lerp(.15, .9, smooth((p - .2) / .6)));
    var lit = smooth((p - .25) / .5) * wchars.length;
    wchars.forEach(function (c, i) { c.classList.toggle('lit', i < lit); });
    // rail: vertical scroll moves the card run sideways
    var mr = menu.getBoundingClientRect(), hp = D ? clamp(-mr.top / D, 0, 1) : 0;
    track.style.transform = 'translate3d(' + ((rtl() ? 1 : -1) * hp * D) + 'px,0,0)';
    mbar.parentNode.style.setProperty('--p', hp);
    if (mr.top < innerHeight && mr.bottom > 0) cards.forEach(function (c) { var b = c.getBoundingClientRect(); if (b.left < innerWidth * .98 && b.right > innerWidth * .02) c.classList.add('in'); });
    // reviews drift at different speeds
    notes.forEach(function (n, i) { var b = n.getBoundingClientRect(); var k = (b.top + b.height / 2 - innerHeight / 2) / innerHeight; n.style.setProperty('--py', (k * (i % 2 ? -26 : 18)).toFixed(1) + 'px'); });
    // the entrance photo shrinks from full screen into its frame
    var vp = smooth(prog(vwrap) / .8);
    vphoto.style.setProperty('--vt', lerp(0, ph ? 16 : 12, vp) + '%');
    vphoto.style.setProperty('--vb', lerp(0, ph ? 30 : 32, vp) + '%');
    vphoto.style.setProperty('--vs', lerp(0, ph ? 5 : 19, vp) + '%');
    vphoto.style.setProperty('--vr', lerp(0, 34, vp) + 'px');
  }
  var raf = 0;
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }
  addEventListener('scroll', kick, { passive: true });
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 120); });

  // ---------------------------------------------------------------- composer: a session card that writes the WhatsApp message
  var comp = $('[data-composer]'), msgEl = $('[data-msg]'), send = $('[data-send]'), card = $('[data-card]'), sel = {}, typing = 0;
  var T = {
    he: { t: { mix: 'עיסוי משולב', stone: 'עיסוי באבנים חמות', cup: 'עיסוי בכוסות רוח', reflex: 'טיפול רפלקסולוגיה', ask: 'טיפול' },
          w: { back: 'יש לי כאבי גב.', neck: 'יש לי כאבי צוואר.', rest: 'אני רוצה פשוט לנוח.' },
          d: { am: 'הכי נוח לי בבוקר.', noon: 'הכי נוח לי בצהריים.', pm: 'הכי נוח לי בערב.', fri: 'הכי נוח לי ביום שישי.' } },
    en: { t: { mix: 'combined massage', stone: 'hot stone massage', cup: 'cupping massage', reflex: 'reflexology session', ask: 'treatment' },
          w: { back: 'I have back pain.', neck: 'I have neck pain.', rest: 'I just want to rest.' },
          d: { am: 'Mornings work best for me.', noon: 'Midday works best for me.', pm: 'Evenings work best for me.', fri: 'Friday works best for me.' } }
  };
  function message() {
    var L = he() ? T.he : T.en, l = he(), t = sel.t, out = [];
    out.push(l ? 'שלום ליליה, הגעתי מהאתר.' : 'Hi Liliya, I found you through the website.');
    var noun = t ? L.t[t] : (l ? 'טיפול' : 'treatment');
    var line;
    if (sel.w === 'gift') line = l ? 'אשמח לשובר מתנה ל' + noun + '.' : 'I’d like a gift certificate for a ' + noun + '.';
    else line = l ? 'אשמח לקבוע ' + noun + (t === 'ask' ? ', ועוד לא החלטתי איזה.' : '.') : 'I’d like to book a ' + noun + (t === 'ask' ? ', not sure which one yet.' : '.');
    if (sel.w && sel.w !== 'gift') line += ' ' + L.w[sel.w];
    out.push(line);
    if (sel.w === 'gift') { out.push(l ? 'איך אפשר לקבל את השובר?' : 'How can I get the certificate?'); return out.join('\n'); }
    if (sel.d) out.push(L.d[sel.d]);
    out.push(l ? 'מתי יש לך מקום?' : 'When do you have a free slot?');
    return out.join('\n');
  }
  function compose(instant) {
    var m = message();
    send.href = 'https://wa.me/972525319615?text=' + encodeURIComponent(m);
    cancelAnimationFrame(typing);
    if (instant || still()) { msgEl.textContent = m; return; }
    var from = msgEl.textContent, k = 0; while (k < from.length && from[k] === m[k]) k++;
    var t0c = 0;
    (function step(t) { if (!t0c) t0c = t; var n = Math.min(m.length, k + Math.floor((t - t0c) / 22)); msgEl.textContent = m.slice(0, n); if (n < m.length) typing = requestAnimationFrame(step); })(performance.now());
  }
  function steps() {
    var first = true;
    $$('[data-step]', comp).forEach(function (f) { var done = !!sel[f.dataset.step]; f.classList.toggle('done', done); f.classList.toggle('cur', !done && first); if (!done) first = false; });
    card.classList.toggle('ready', !!(sel.t && sel.w && sel.d));
  }
  $$('[data-step]', comp).forEach(function (f) {
    $$('button', f).forEach(function (b) {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        var k = f.dataset.step, on = sel[k] === b.dataset.v;
        $$('button', f).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        if (on) delete sel[k]; else { sel[k] = b.dataset.v; b.setAttribute('aria-pressed', 'true'); }
        card.classList.remove('ready'); void card.offsetWidth; steps(); compose();
      });
    });
  });
  watch(comp, function (v) { if (v && !msgEl.textContent) compose(); });

  // ---------------------------------------------------------------- start
  motionUI(); texts(root.lang); hours(); steps(); compose(true); msgEl.textContent = still() ? msgEl.textContent : '';
  revealAll(); layout();
  requestAnimationFrame(function () { root.classList.add('ready'); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
})();
