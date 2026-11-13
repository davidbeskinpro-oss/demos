(function () {
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 861; };
  var hover = matchMedia('(hover: hover)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var WA = '972529593917';

  // ---------------------------------------------------------------- glyph decode (labels settle out of scrambled letters)
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHJKLMNOPRSTUVWXYZ' };
  function decode(el, text) {
    cancelAnimationFrame(el._raf);
    if (still()) { el.textContent = text; return; }
    var pool = /[֐-׿]/.test(text) ? GL.he : GL.en, t0 = performance.now();
    (function f(t) {
      var k = Math.floor((t - t0) / 38), out = '';
      for (var i = 0; i < text.length; i++) out += i < k - 3 || text[i] === ' ' ? text[i] : pool[Math.floor(Math.random() * pool.length)];
      el.textContent = out;
      if (k - 3 < text.length) el._raf = requestAnimationFrame(f); else el.textContent = text;
    })(t0);
  }

  // ---------------------------------------------------------------- language
  function texts(l) {
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-decode]').forEach(function (el) { el.textContent = el.dataset[l]; });
    $$('[data-mchip]').forEach(function (b) { b.textContent = b.dataset[l]; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-set-lang]', 'Switch to English', 'החלפה לעברית');
    aria('[data-mstep="-1"]', 'הקודם', 'Previous');
    aria('[data-mstep="1"]', 'הבא', 'Next');
    aria('.d-side[href^="tel"]', 'חיוג', 'Call');
    aria('.d-main', 'וואטסאפ', 'WhatsApp');
    aria('.d-side[href*="calmark"]', 'תור בקלמרק', 'Book on Calmark');
    aria('.links', 'ניווט', 'Navigation');
    document.title = l === 'he' ? 'The_Cutstation · מספרת גברים וילדים · שרת 32, טירת כרמל' : 'The_Cutstation · Men’s & kids’ barbershop · 32 Sharet St., Tirat Carmel';
    $('[data-concept]').setAttribute('data-concept', l === 'he' ? 'קונספט לדוגמה שנבנה עבור The_Cutstation · זה אינו האתר הרשמי של העסק' : 'A sample concept built for The_Cutstation · This is not the business’s official website');
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('cs1243-lang', l); } catch (e) {}
    texts(l); hours(); write(true); mirrorLabel(true); ring.size(); tick();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(); root.classList.toggle('still', !on);
    try { localStorage.setItem('cs1243-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $('[data-hero]').classList.add('dealt', 'typed');
    resetScrollFx(); ring.kick(); clips.kick(); spot.kick(); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours, live status and the dial. Haifa time, null = closed
  var H = { 0: [10, 19], 1: null, 2: [10, 19], 3: [10, 19], 4: [10, 19], 5: [10, 15], 6: null };
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
    // dial: 24h face, today's open hours as an oak arc, the hand at the time now
    var a = function (h) { return (h / 24) * Math.PI * 2 - Math.PI / 2; }, pt = function (h, r) { return (100 + Math.cos(a(h)) * r).toFixed(1) + ' ' + (100 + Math.sin(a(h)) * r).toFixed(1); };
    $('[data-arcopen]').setAttribute('d', t ? 'M' + pt(t[0], 86) + ' A86 86 0 ' + (t[1] - t[0] > 12 ? 1 : 0) + ' 1 ' + pt(Math.min(t[1], 23.99), 86) : '');
    $('[data-hand]').style.transform = 'rotate(' + (n.h / 24 * 360) + 'deg)';
  }
  (function ticks() { var g = $('[data-ticks]'), s = ''; for (var i = 0; i < 24; i++) { var an = i / 24 * Math.PI * 2, r1 = i % 6 ? 70 : 64; s += '<line x1="' + (100 + Math.cos(an) * r1).toFixed(1) + '" y1="' + (100 + Math.sin(an) * r1).toFixed(1) + '" x2="' + (100 + Math.cos(an) * 74).toFixed(1) + '" y2="' + (100 + Math.sin(an) * 74).toFixed(1) + '"/>'; } g.innerHTML = s; })();
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

  // ---------------------------------------------------------------- opening: tiles dealt from a deck at the centre, the name typed in
  var hero = $('[data-hero]'), board = $('.board');
  (function deal() {
    var br = board.getBoundingClientRect(), cx = br.left + br.width / 2, cy = br.top + Math.min(br.height, innerHeight) / 2;
    $$('[data-deal]', board).forEach(function (t, i) {
      var r = t.getBoundingClientRect(), k = +t.dataset.deal;
      t.style.setProperty('--dx', (cx - (r.left + r.width / 2)) + 'px');
      t.style.setProperty('--dy', (cy - (r.top + r.height / 2)) + 'px');
      t.style.setProperty('--rot', ((k % 2 ? 1 : -1) * (4 + k * 2)) + 'deg');
      t.style.setProperty('--dd', (k * 90) + 'ms');
    });
    var h = $('.h-name'), i = 0;
    [].slice.call(h.childNodes).forEach(function (n) {
      if (n.nodeType === 3) { var f = document.createDocumentFragment(); n.textContent.split('').forEach(function (c) { var s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = c; f.appendChild(s); }); h.replaceChild(f, n); }
      else { n.classList.add('ch'); n.style.setProperty('--i', i++); }
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('dealt', 'typed'); }); });
  })();

  // ---------------------------------------------------------------- the ring light over the room photo: follows the hand, drifts by itself on phones
  var spot = (function () {
    var fig = $('.t-room'), img = $('img', fig), lit = img.cloneNode(); lit.className = 'lit'; lit.alt = ''; lit.setAttribute('aria-hidden', 'true');
    fig.insertBefore(lit, img.nextSibling);
    var tx = .31, ty = .5, x = .31, y = .5, user = 0, raf = 0, vis = true;
    fig.addEventListener('pointermove', function (e) { var r = fig.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; user = performance.now(); kick(); });
    function frame(t) {
      raf = 0; if (still() || !vis) { fig.style.setProperty('--x', '31%'); fig.style.setProperty('--y', '50%'); return; }
      if (t - user > 2500) { tx = .5 + Math.sin(t / 2300) * .28; ty = .48 + Math.sin(t / 1700) * .2; }
      x += (tx - x) * .08; y += (ty - y) * .08;
      fig.style.setProperty('--x', (x * 100).toFixed(2) + '%'); fig.style.setProperty('--y', (y * 100).toFixed(2) + '%');
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    watch(fig, function (v) { vis = v; kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- cut hair drifting down over the board; the hand blows it aside
  var clips = (function () {
    var cv = $('[data-clips]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = true, mx = -999, my = -999;
    function size() { var d = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * d; cv.height = h * d; c.setTransform(d, 0, 0, d, 0, 0); var n = Math.round(clamp(w * h / 9000, 40, 150)); P = []; for (var i = 0; i < n; i++) P.push(make(true)); }
    function make(any) { return { x: Math.random() * w, y: any ? Math.random() * h : -10, l: 3 + Math.random() * 7, a: Math.random() * 6.28, va: (Math.random() - .5) * .04, vy: .25 + Math.random() * .5, vx: 0, o: .25 + Math.random() * .45 }; }
    function frame() {
      raf = 0; c.clearRect(0, 0, w, h); if (still() || !vis) return;
      c.lineCap = 'round';
      P.forEach(function (p, i) {
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 9000) { var f = (9000 - d2) / 9000; p.vx += dx / 60 * f; p.vy += dy / 120 * f; p.va += .02 * f; }
        p.vx *= .95; p.vy += (.45 - p.vy) * .02; p.x += p.vx + Math.sin((p.y + i) / 40) * .25; p.y += p.vy; p.a += p.va;
        if (p.y > h + 10 || p.x < -20 || p.x > w + 20) P[i] = make(false);
        c.strokeStyle = 'rgba(30,24,20,' + p.o + ')'; c.lineWidth = 1.4;
        c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x + Math.cos(p.a) * p.l, p.y + Math.sin(p.a) * p.l); c.stroke();
        c.strokeStyle = 'rgba(238,230,220,' + (p.o * .35) + ')'; c.lineWidth = .6;
        c.beginPath(); c.moveTo(p.x + .6, p.y); c.lineTo(p.x + .6 + Math.cos(p.a) * p.l, p.y + Math.sin(p.a) * p.l); c.stroke();
      });
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; setTimeout(function () { mx = my = -999; }, 400); });
    watch(hero, function (v) { vis = v; kick(); });
    return { kick: kick, size: function () { size(); kick(); } };
  })();

  // ---------------------------------------------------------------- odometers
  function odo(el) {
    var to = el.dataset.odo, dec = to.indexOf('.') >= 0, end = parseFloat(to);
    if (still()) { el.textContent = to; return; }
    var t0 = performance.now();
    (function f(t) { var p = smooth((t - t0) / 1400), v = end * p; el.textContent = dec ? v.toFixed(1) : Math.round(v); if (p < 1) requestAnimationFrame(f); })(t0);
  }
  $$('[data-odo]').forEach(function (el) { var done = false; watch(el, function (v) { if (v && !done) { done = true; odo(el); } }); });

  // ---------------------------------------------------------------- through the mirror (scroll-scrubbed iris), stepping stills when motion is off
  var mir = $('[data-mirror]'), stage = $('.m-stage'), roomImg = $('.m-room img'), shots = $$('.m-shot'), ringEl = $('.iris-ring'), mlabel = $('[data-mlabel]'), chips = $$('[data-mchip]'), cur = -1, stillIdx = 0;
  var MIR = { x: .31 * 1400, y: .53 * 1006, r: 120 };
  var START = [.06, .4, .7], SPAN = .22;
  function mirrorLabel(force) {
    var i = still() ? stillIdx : cur; if (i < 0) i = 0;
    chips.forEach(function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    var txt = chips[i].dataset[he() ? 'he' : 'en'];
    if (force) mlabel.textContent = txt; else decode(mlabel, txt);
  }
  function setStill(i) { stillIdx = (i + 3) % 3; shots.forEach(function (s, k) { s.classList.toggle('on', k === stillIdx); }); mirrorLabel(); }
  function goShot(i) {
    i = (i + 3) % 3;
    if (still()) { setStill(i); return; }
    var top = mir.getBoundingClientRect().top + scrollY, len = mir.offsetHeight - innerHeight;
    scrollTo({ top: top + len * (START[i] + SPAN + .02), behavior: 'smooth' });
  }
  chips.forEach(function (b, k) { b.addEventListener('click', function () { goShot(k); }); });
  $$('[data-mstep]').forEach(function (b) { b.addEventListener('click', function () { goShot((still() ? stillIdx : Math.max(cur, 0)) + (+b.dataset.mstep)); }); });
  function mirrorFx(p) {
    var W = stage.clientWidth, Hh = stage.clientHeight, sc = Math.max(W / 1400, Hh / 1006), ox = (W - 1400 * sc) / 2, oy = (Hh - 1006 * sc) / 2;
    var mx = ox + MIR.x * sc, my = oy + MIR.y * sc, diag = Math.sqrt((W * W + Hh * Hh) / 2);
    var z = 1 + smooth(p / (START[0] + SPAN)) * 1.6;
    roomImg.style.transformOrigin = mx + 'px ' + my + 'px';
    stage.style.setProperty('--z', z.toFixed(3)); stage.style.setProperty('--b', (.8 - smooth(p / .3) * .3).toFixed(3));
    var active = -1, ringR = 0, ringO = 0, rcx = mx, rcy = my;
    shots.forEach(function (s, k) {
      var q = smooth((p - START[k]) / SPAN), cx = k === 0 ? mx : W / 2, cy = k === 0 ? my : Hh * .45;
      var r0 = k === 0 ? MIR.r * sc * z * .55 : 0, rpx = r0 + q * (diag * 1.45 - r0);
      if (p < START[k]) rpx = k === 0 ? 0 : 0;
      s.style.setProperty('--cx', cx + 'px'); s.style.setProperty('--cy', cy + 'px');
      s.style.setProperty('--r', (rpx / diag * 100).toFixed(2) + '%');
      s.style.setProperty('--s', (1.18 - q * .18).toFixed(3));
      if (p >= START[k]) active = k;
      if (p >= START[k] && q < 1) { ringR = rpx; ringO = 1 - smooth((q - .6) / .4); rcx = cx; rcy = cy; }
    });
    stage.style.setProperty('--cx', rcx + 'px'); stage.style.setProperty('--cy', rcy + 'px');
    ringEl.style.setProperty('--rp', ringR.toFixed(1)); ringEl.style.setProperty('--ro', ringO.toFixed(3));
    ringEl.style.left = rcx + 'px'; ringEl.style.top = rcy + 'px';
    if (active !== cur) { cur = active; if (cur >= 0) mirrorLabel(); else { mlabel.textContent = he() ? 'גוללים פנימה' : 'Scroll in'; chips.forEach(function (b) { b.setAttribute('aria-selected', 'false'); }); } }
  }

  // ---------------------------------------------------------------- the arc of photo cards: turns by itself, with the scroll and with a drag
  var ring = (function () {
    var wrap = $('[data-ringwrap]'), el = $('[data-ring]');
    $$('.rc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); el.appendChild(k); });
    var cards = $$('.rc', el), N = cards.length, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = false, last = 0, R = 400;
    function size() { var cw = cards[0].offsetWidth || 200; R = Math.max(cw * 1.08 / (2 * Math.tan(Math.PI / N)), phone() ? 300 : innerWidth * .4); }
    function frame(t) {
      raf = 0;
      if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.opacity = ''; }); return; }
      var dt = last ? Math.min(50, t - last) : 16; last = t;
      if (!drag) { rot += (vel + (rtl() ? -.012 : .012) * dt); vel *= .92; }
      var cw = cards[0].offsetWidth, ch = cards[0].offsetHeight;
      cards.forEach(function (c, i) {
        var a = (i / N) * 360 + rot, rad = a * Math.PI / 180, cz = Math.cos(rad);
        c.style.transform = 'translate(' + (-cw / 2) + 'px,' + (-ch / 2) + 'px) rotateY(' + a + 'deg) translateZ(' + R + 'px) rotateX(' + (-4) + 'deg)';
        c.style.opacity = (cz > -0.15 ? .35 + .65 * Math.max(0, cz) : 0).toFixed(3);
      });
      el.style.transform = 'translateZ(' + (-R) + 'px)';
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .25; vel = dx * .2; });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(wrap, function (v) { vis = v; kick(); });
    return { kick: kick, size: function () { size(); kick(); }, nudge: function (d) { if (!still()) vel += d; } };
  })();

  // ---------------------------------------------------------------- bento: staggered blur-up entrances, cursor spotlight, a living calendar
  $$('[data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 90 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  if (hover) $$('[data-spotlight]').forEach(function (b) { b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.setProperty('--mx', (e.clientX - r.left) + 'px'); b.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var cal = $('[data-minical]'), cells = [];
  for (var ci = 0; ci < 21; ci++) { var c = document.createElement('i'); if (ci % 7 === 1 || ci % 7 === 6) c.className = 'x'; cal.appendChild(c); cells.push(c); }
  var calOn = false; watch(cal, function (v) { calOn = v; });
  setInterval(function () { if (still() || !calOn) return; var open = cells.filter(function (c) { return c.className !== 'x'; }); open.forEach(function (c) { c.classList.remove('on'); }); open[Math.floor(Math.random() * open.length)].classList.add('on'); }, 1300);
  cells[7].classList.add('on');

  // ---------------------------------------------------------------- composer: the message writes itself inside the mirror
  var cuts = $$('[data-cut]'), days = $$('[data-day]'), steps = $$('[data-step]'), msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
  function lightStep(i) { steps.forEach(function (s, k) { s.classList.toggle('lit', k <= i); }); }
  function radio(list, b) { list.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); }
  cuts.forEach(function (b) { b.addEventListener('click', function () { radio(cuts, b); lightStep(0); write(); }); });
  days.forEach(function (b) { b.addEventListener('click', function () { radio(days, b); lightStep(1); write(); }); });
  $('[data-send]').addEventListener('pointerenter', function () { lightStep(2); });
  $('[data-send]').addEventListener('focus', function () { lightStep(2); });
  function compose() {
    var l = he(), cut = cuts.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0].dataset[l ? 'he' : 'en'];
    var d = +days.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0].dataset.day;
    return l ? 'היי, אשמח לקבוע ' + cut + ' ביום ' + dayHe[d] + '. מה השעות הפנויות?' : 'Hi, I’d like to book ' + cut + ' on ' + dayEn[d] + '. What times are free?';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var curS = shown, t0 = performance.now(), del = curS.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 16);
      shown = n < del ? curS.slice(0, curS.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; lightStep(0); shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- reviews: 347 lights around a ring, reviews drifting
  var track = $('.track');
  $$('.rv', track).forEach(function (r) { var k = r.cloneNode(true); k.setAttribute('aria-hidden', 'true'); track.appendChild(k); });
  (function () {
    var cv = $('[data-rcv]'), c = cv.getContext('2d'), N = 347, t0 = 0, seen = false;
    function draw(p) {
      var d = Math.min(2, devicePixelRatio || 1), s = cv.clientWidth; cv.width = cv.height = s * d; c.setTransform(d, 0, 0, d, 0, 0);
      var lit = Math.round(N * p);
      for (var i = 0; i < N; i++) {
        var a = i / N * Math.PI * 2 - Math.PI / 2, ring = i % 3, r = s / 2 - 6 - ring * 7;
        c.fillStyle = i < lit ? (ring === 0 ? 'rgba(238,244,255,.95)' : 'rgba(207,159,102,.9)') : 'rgba(244,238,230,.1)';
        c.beginPath(); c.arc(s / 2 + Math.cos(a) * r, s / 2 + Math.sin(a) * r, 1.8, 0, 7); c.fill();
      }
    }
    draw(still() ? 1 : 0);
    watch(cv, function (v) { if (!v || seen) return; seen = true; if (still()) { draw(1); return; } t0 = performance.now(); (function f(t) { var p = smooth((t - t0) / 1600); draw(p); if (p < 1) requestAnimationFrame(f); })(t0); });
    addEventListener('resize', function () { if (seen || still()) draw(1); });
  })();

  // ---------------------------------------------------------------- footer wordmark letters
  var fwm = $('[data-fwm]'), fi = 0;
  [].slice.call(fwm.childNodes).forEach(function (n) {
    if (n.nodeType === 3) { var f = document.createDocumentFragment(); n.textContent.split('').forEach(function (ch) { var s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', fi++); s.textContent = ch; f.appendChild(s); }); fwm.replaceChild(f, n); }
    else { n.classList.add('ch'); n.style.setProperty('--i', fi++); }
  });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var nav = $('[data-nav]'), place = $('[data-wipe]'), visit = $('[data-visit]'), vphoto = $('[data-vphoto]'), vboard = $('[data-vboard]'), foot = $('.foot'), main = $('main');
  var ticking = false, lastY = scrollY;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function resetScrollFx() {
    place.style.removeProperty('--w'); vphoto.style.transform = ''; vphoto.style.borderRadius = ''; vboard.style.opacity = ''; vboard.style.transform = '';
    $$('.m-shot').forEach(function (s) { s.style.removeProperty('--r'); });
    stage.style.removeProperty('--z'); setStill(stillIdx);
    main.style.removeProperty('--fh'); fwm.style.removeProperty('--fp');
  }
  function update() {
    ticking = false;
    var dy = scrollY - lastY; lastY = scrollY;
    nav.classList.toggle('pill', scrollY > 40);
    if (still()) return;
    ring.nudge(clamp(dy * .03, -2, 2) * (rtl() ? -1 : 1));
    mirrorFx(prog(mir));
    var pr = place.getBoundingClientRect(); place.style.setProperty('--w', smooth((innerHeight - pr.top) / (innerHeight * .6)).toFixed(3));
    if (!phone()) {
      var vp = smooth(prog(visit) / .7), st = $('.v-stage').getBoundingClientRect();
      vphoto.style.transform = '';
      var r = vphoto.getBoundingClientRect(), sc = Math.max(st.width / r.width, st.height / r.height) * 1.02;
      var tx = (st.left + st.width / 2) - (r.left + r.width / 2), ty = (st.top + st.height / 2) - (r.top + r.height / 2);
      var k = 1 - vp;
      vphoto.style.transform = 'translate(' + (tx * k).toFixed(1) + 'px,' + (ty * k).toFixed(1) + 'px) scale(' + (1 + (sc - 1) * k).toFixed(3) + ')';
      vphoto.style.borderRadius = (50 * vp).toFixed(1) + '%';
      vboard.style.opacity = smooth((vp - .55) / .45).toFixed(3);
      vboard.style.transform = 'translateY(' + ((1 - smooth((vp - .55) / .45)) * 40).toFixed(1) + 'px)';
      var fh = foot.offsetHeight; main.style.setProperty('--fh', fh + 'px');
      var left = document.documentElement.scrollHeight - innerHeight - scrollY;
      fwm.style.setProperty('--fp', smooth(1 - left / fh).toFixed(3));
    } else { vphoto.style.transform = ''; vboard.style.opacity = ''; vboard.style.transform = ''; fwm.style.setProperty('--fp', 1); }
  }
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', function () { ring.size(); clips.size(); tick(); });

  texts(root.lang); hours(); setStill(0); write(true); ring.size(); clips.size(); tick();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ring.size(); tick(); });
})();
