(function () {
  var root = document.documentElement, WA = '972529774774';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth <= 900; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'דנה בר · סטודיו והדרכות לאיפור קבוע · שדרות מוריה 129, חיפה', en: 'Dana Bar · Permanent makeup studio & training · 129 Moriya Blvd, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור דנה בר סטודיו והדרכות לאיפור קבוע · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Dana Bar Permanent Makeup Studio & Training · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';
  var STATE = { he: ['לפני', 'מיפוי', 'אחרי'], en: ['Before', 'Mapping', 'After'] };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'דנה בר, לראש העמוד', 'Dana Bar, back to top');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לדנה, 052-977-4774', 'Call Dana, 052-977-4774');
    aria('[data-t-wa]', 'וואטסאפ לדנה', 'WhatsApp Dana');
    aria('[data-t-cups]', 'נושא ההודעה', 'What the message is about');
    aria('[data-t-when]', 'מתי נוח', 'When suits you');
    aria('[data-t-qprev]', 'הביקורת הקודמת', 'Previous review');
    aria('[data-t-qnext]', 'הביקורת הבאה', 'Next review');
    aria('.ba .arr.prev', 'השלב הקודם', 'Previous stage');
    aria('.ba .arr.next', 'השלב הבא', 'Next stage');
    aria('.q .stars', '5 כוכבים', '5 stars');
    $$('.tag').forEach(function (t) { t.textContent = t.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('db-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('db-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $('[data-fname]').classList.add('in');
    orbOpen = 1; layout(); ink.kick(); care.kick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 18], 1: [9, 18], 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 12], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && (t[1] - t[0] >= 24 || (n.h >= t[0] && n.h < t[1]))) { open = true; txt = t[1] - t[0] >= 24 ? (l ? 'פתוח עכשיו' : 'Open now') : (l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1])); }
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
  // consecutive days with the same hours share a row; the week starts on Sunday
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : t[1] - t[0] >= 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  // the footer name rises letter by letter
  var fname = $('[data-fname]');
  $$('span[lang]', fname).forEach(function (sp) { var i = 0; sp.innerHTML = sp.textContent.split('').map(function (c) { return c === ' ' ? ' ' : '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join(''); });
  watch(fname, function (v) { if (v) fname.classList.add('in'); }, { threshold: .4 });

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- ink: pigment clouds drifting in water; the hand stirs them
  var ink = (function () {
    var cv = $('[data-ink]'), c = cv.getContext('2d'), w, h, raf = 0, vis = true, mx = -999, my = -999, B = [], P = [], last = 0;
    var COL = [[200, 67, 92], [244, 173, 185], [217, 180, 124], [120, 40, 64], [228, 120, 140]];
    function size() {
      w = hero.clientWidth; h = hero.clientHeight; cv.width = w; cv.height = h;   // dpr 1: it is soft anyway
      var n = phone() ? 6 : 9; B = [];
      for (var i = 0; i < n; i++) B.push({ x: Math.random() * w, y: Math.random() * h, r: (phone() ? .5 : .32) * Math.max(w, h) * (.5 + Math.random() * .6), c: COL[i % COL.length], ph: Math.random() * 6.3, sp: .05 + Math.random() * .08, vx: 0, vy: 0 });
      P = []; var m = phone() ? 70 : 140;
      for (var k = 0; k < m; k++) P.push({ x: Math.random() * w, y: Math.random() * h, s: .6 + Math.random() * 1.8, c: COL[k % 3], ph: Math.random() * 6.3, vx: 0, vy: 0 });
    }
    function draw(T) {
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < B.length; i++) {
        var b = B[i], x = b.x + Math.sin(T * b.sp + b.ph) * w * .08, y = b.y + Math.cos(T * b.sp * .8 + b.ph) * h * .07;
        var g = c.createRadialGradient(x, y, 0, x, y, b.r);
        g.addColorStop(0, 'rgba(' + b.c + ',.30)'); g.addColorStop(.55, 'rgba(' + b.c + ',.10)'); g.addColorStop(1, 'rgba(' + b.c + ',0)');
        c.fillStyle = g; c.fillRect(x - b.r, y - b.r, b.r * 2, b.r * 2);
      }
      for (var k = 0; k < P.length; k++) {
        var p = P[k]; c.globalAlpha = .5 + .3 * Math.sin(T + p.ph); c.fillStyle = 'rgb(' + p.c + ')';
        c.beginPath(); c.arc(p.x, p.y, p.s, 0, 6.283); c.fill();
      }
      c.globalAlpha = 1;
    }
    function frame(t) {
      raf = 0; var T = t / 1000;
      if (still()) { draw(4); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      for (var i = 0; i < B.length; i++) {
        var b = B[i], dx = b.x - mx, dy = b.y - my, d2 = dx * dx + dy * dy, R = 260;
        if (d2 < R * R) { var f = (1 - Math.sqrt(d2) / R) * 40, d = Math.sqrt(d2) || 1; b.vx += dx / d * f * dt; b.vy += dy / d * f * dt; }
        b.x += b.vx * dt * 20; b.y += b.vy * dt * 20; b.vx *= .96; b.vy *= .96;
        b.x = clamp(b.x, -b.r * .3, w + b.r * .3); b.y = clamp(b.y, -b.r * .3, h + b.r * .3);
      }
      for (var k = 0; k < P.length; k++) {
        var p = P[k];
        p.vx += Math.sin(p.y * .006 + T * .4 + p.ph) * .02; p.vy += Math.cos(p.x * .006 + T * .3) * .02 - .004;
        var ex = p.x - mx, ey = p.y - my, e2 = ex * ex + ey * ey;
        if (e2 < 22000) { var q = Math.sqrt(e2) || 1; p.vx += (-ey / q * .5 + ex / q * .25); p.vy += (ex / q * .5 + ey / q * .25); }   // swirl around the hand
        p.vx *= .94; p.vy *= .94; p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10; if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
      }
      draw(T);
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- the seal ring: her work turns on an orbit around the logo; spreads out on arrival, turns by itself, with the scroll and with a drag
  var orbWrap = $('[data-orbwrap]'), orb = $('[data-orb]'), discs = $$('.disc', orb), core = $('.core', orb), track = $('[data-track]');
  var orbOpen = still() ? 1 : 0, orbRot = 0, orbVel = 0, orbDrag = false, orbLx = 0, orbT0 = 0, orbLast = 0, orbRaf = 0, orbVis = true, tiltX = 0, tiltY = 0, G = {};
  function orbSize() {
    var W = orbWrap.clientWidth, Hh = orbWrap.clientHeight, D = discs[0].offsetWidth, front = 1.3;
    G = { W: W, H: Hh, D: D, cx: W / 2, cy: Hh * .47, rx: Math.max(40, (W - D * front) / 2 - 6) };
    G.ry = Math.max(10, Math.min(D * 1.35, Hh / 2 - D * front / 2 - 30));
    track.setAttribute('cx', G.cx); track.setAttribute('cy', G.cy); track.setAttribute('rx', G.rx); track.setAttribute('ry', G.ry);
    core.style.left = G.cx + 'px'; core.style.top = G.cy + 'px';
  }
  function orbDraw() {
    var sc = still() ? 0 : clamp(scrollY / Math.max(1, hero.offsetHeight), 0, 1) * 120, o = smooth(orbOpen), dir = rtl() ? -1 : 1;
    discs.forEach(function (el, i) {
      var a = (orbRot + sc * dir + i * 72) * Math.PI / 180, d = (Math.cos(a) + 1) / 2;   // d = 1 at the front of the ring
      var x = G.cx + Math.sin(a) * G.rx * o + tiltX * d * 14, y = G.cy + Math.cos(a) * G.ry * o + tiltY * d * 10;
      var s = (.62 + .63 * d) * lerp(.4, 1, o);
      el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
      el.style.zIndex = Math.round(d * 100);
      el.style.opacity = (lerp(.35, 1, d) * lerp(.2, 1, o)).toFixed(3);
      el.style.setProperty('--cap', d > .93 ? '1' : '0');
    });
    core.style.setProperty('--ring', (1 - o).toFixed(3));
  }
  function orbFrame(t) {
    orbRaf = 0;
    if (!orbT0) orbT0 = t;
    var dt = orbLast ? Math.min(.05, (t - orbLast) / 1000) : .016; orbLast = t;
    if (!still()) {
      if (orbOpen < 1) orbOpen = clamp((t - orbT0 - 200) / 1300, 0, 1);
      if (!orbDrag) { orbRot += (7 + orbVel) * dt * (rtl() ? -1 : 1); orbVel *= .94; }
    }
    orbDraw();
    if (!still() && orbVis) orbRaf = requestAnimationFrame(orbFrame);
  }
  watch(orbWrap, function (v) { orbVis = v; orbKick(); });
  function orbKick() { if (!orbRaf) { orbLast = 0; orbRaf = requestAnimationFrame(orbFrame); } }
  orbWrap.addEventListener('pointerdown', function (e) { if (still()) return; orbDrag = true; orbLx = e.clientX; orbWrap.classList.add('drag'); orbKick(); });
  addEventListener('pointermove', function (e) {
    if (orbDrag) { var dx = e.clientX - orbLx; orbLx = e.clientX; orbRot += dx * .35; orbVel = Math.abs(dx) * 1.5; }
  });
  addEventListener('pointerup', function () { orbDrag = false; orbWrap.classList.remove('drag'); });
  if (fine) orbWrap.addEventListener('pointermove', function (e) {
    var r = orbWrap.getBoundingClientRect(); tiltX = (e.clientX - r.left) / r.width - .5; tiltY = (e.clientY - r.top) / r.height - .5;
  });
  orbWrap.addEventListener('pointerleave', function () { tiltX = tiltY = 0; });

  // ---------------------------------------------------------------- the logo's dot falls out of the headline and blooms into Dana's blush
  var dot = $('[data-dot]'), bloom = $('[data-bloom]');
  function seam() {
    if (still()) { dot.style.transform = ''; dot.style.opacity = ''; return; }
    var hr = hero.getBoundingClientRect(), pp = clamp(-hr.top / (hr.height * .6), 0, 1);
    dot.style.transform = 'none';
    var dr = dot.getBoundingClientRect(), fall = hr.bottom - dr.bottom - 30, f = smooth(pp / .32);
    dot.style.transform = 'translateY(' + (fall * f * f).toFixed(1) + 'px) scale(' + (1 + f * .6).toFixed(3) + ')';
    dot.style.opacity = (1 - smooth((pp - .3) / .08)).toFixed(3);
    var g = smooth((pp - .28) / .72), cx = ((dr.left + dr.width / 2 - hr.left) / hr.width) * 1000;
    bloom.setAttribute('cx', cx.toFixed(1));
    bloom.setAttribute('rx', (g * 1350).toFixed(1)); bloom.setAttribute('ry', (g * 900).toFixed(1));
  }

  // ---------------------------------------------------------------- Dana: the portrait leans to the hand, the ring of her studio's name turns with the scroll
  var portrait = $('[data-portrait]'), frame = $('[data-tilt]'), ringtext = $('[data-ringtext]');
  if (fine) {
    portrait.addEventListener('pointermove', function (e) {
      if (still()) return; var r = portrait.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      frame.style.transform = 'perspective(900px) rotateY(' + ((x - .5) * 14).toFixed(2) + 'deg) rotateX(' + ((.5 - y) * 10).toFixed(2) + 'deg)';
      frame.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); frame.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
    });
    portrait.addEventListener('pointerleave', function () { frame.style.transform = ''; });
  }

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to) + 'em)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { setTimeout(function () { roll(o, true); }, 60); ob.disconnect(); } }, { threshold: .4 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- before / after: mapping thread, then the pigment goes in
  var work = $('[data-work]'), bas = $$('[data-ba]'), GL = 'אבגדהוזחטיכלמנסעפצקרשתABCDEFGHKMNRSTXZ';
  function decode(t) {
    var txt = t.dataset[he() ? 'he' : 'en'];
    if (still()) { t.textContent = txt; return; }
    var t0 = performance.now(); cancelAnimationFrame(t._r);
    (function st(n) {
      var k = Math.floor((n - t0) / 40);
      t.textContent = txt.split('').map(function (c, i) { return i < k - 3 || c === ' ' ? c : GL[(Math.random() * GL.length) | 0]; }).join('');
      if (k - 3 < txt.length) t._r = requestAnimationFrame(st); else t.textContent = txt;
    })(t0);
  }
  function placeTags(ba) {
    var pic = $('.ba-pic', ba), img = $('img.b', pic), W = pic.clientWidth, Hh = pic.clientHeight, iw = +img.getAttribute('width'), ih = +img.getAttribute('height');
    var s = Math.max(W / iw, Hh / ih), ox = (W - iw * s) / 2, oy = (Hh - ih * s) / 2;
    $$('.tag', ba).forEach(function (t) {
      var x = ox + +t.dataset.x * s, y = oy + +t.dataset.y * s, tw = t.offsetWidth || 90;
      t.style.left = clamp(x, tw / 2 + 8, W - tw / 2 - 8) + 'px'; t.style.top = clamp(y, 44, Hh - 8) + 'px';
    });
  }
  function setBA(ba, m, r) {
    var pic = $('.ba-pic', ba);
    pic.style.setProperty('--m', m.toFixed(3)); pic.style.setProperty('--r', r.toFixed(3));
    var stg = r > .5 ? 2 : m > .5 ? 1 : 0;
    ba.classList.toggle('after', r > .5);
    $$('.tag', ba).forEach(function (t) { var on = m > .75 && r < .35; if (on !== t.classList.contains('on')) { t.classList.toggle('on', on); if (on) decode(t); } });
    var sn = $('[data-sn]', ba), lab = STATE[he() ? 'he' : 'en'][stg]; if (sn.textContent !== lab) sn.textContent = lab;
    ba._stg = stg;
  }
  var WT = { brow: [[.02, .27, .52]], lips: [[.47, .72, .97]] };
  function baTiming(p, which) {
    return which === 'brow' ? [smooth((p - .04) / .18), smooth((p - .27) / .18)] : [smooth((p - .5) / .16), smooth((p - .7) / .2)];
  }
  bas.forEach(function (ba) {
    ba._stg = 0;
    $$('[data-step]', ba).forEach(function (b) { b.addEventListener('click', function () {
      var next = clamp((ba._stg || 0) + +b.dataset.step, 0, 2);
      if (still()) { ba.dataset.state = next; setBA(ba, next >= 1 ? 1 : 0, next >= 2 ? 1 : 0); return; }
      var p = WT[ba.dataset.ba][0][next], top = work.getBoundingClientRect().top + scrollY;
      scrollTo({ top: top + p * (work.offsetHeight - innerHeight), behavior: 'smooth' });
    }); });
    var pic = $('.ba-pic', ba), up = function () { pic.classList.remove('hold'); };
    pic.addEventListener('pointerdown', function () { pic.classList.add('hold'); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { pic.addEventListener(ev, up); });
    pic.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  });

  // ---------------------------------------------------------------- care: spotlight, a loupe over the brow, a gloss over the lips
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); t.classList.add('lit'); });
    t.addEventListener('pointerleave', function () { t.classList.remove('lit'); });
  });
  var care = (function () {
    var brow = $('[data-loupe]'), lens = $('.lens', brow), lips = $('[data-gloss]'), raf = 0, vis = false, hand = 0, Z = 2.3;
    function lensAt(x, y) {
      var W = brow.clientWidth, Hh = brow.clientHeight, iw = 939, ih = 1200, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s, ox = (W - dw) * .4, oy = (Hh - dh) * .35;
      var u = (x - ox) / dw, v = (y - oy) / dh;
      brow.style.setProperty('--lx', x + 'px'); brow.style.setProperty('--ly', y + 'px');
      lens.style.backgroundSize = (dw * Z) + 'px ' + (dh * Z) + 'px';
      lens.style.backgroundPosition = (-(u * dw * Z - 75)) + 'px ' + (-(v * dh * Z - 75)) + 'px';
    }
    function frame(t) {
      raf = 0; if (still() || !vis) { brow.classList.remove('lensing'); return; }
      if (t - hand > 1800) {
        var W = brow.clientWidth, Hh = brow.clientHeight, T = t / 1000;
        lensAt(W * (.48 + .26 * Math.sin(T * .55)), Hh * (.4 + .07 * Math.sin(T * .9))); brow.classList.add('lensing');
        lips.style.setProperty('--sx', (50 + 26 * Math.sin(T * .7)) + '%'); lips.style.setProperty('--sy', (52 + 12 * Math.cos(T * .5)) + '%');
      }
      raf = requestAnimationFrame(frame);
    }
    brow.addEventListener('pointermove', function (e) { if (still()) return; hand = performance.now(); var r = brow.getBoundingClientRect(); lensAt(e.clientX - r.left, e.clientY - r.top); brow.classList.add('lensing'); });
    lips.addEventListener('pointermove', function (e) { if (still()) return; hand = performance.now(); var r = lips.getBoundingClientRect(); lips.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100) + '%'); lips.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100) + '%'); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    watch($('#care'), function (v) { vis = v; kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- write: the cups fill, the note writes itself
  var cups = $$('[data-cup]'), whens = $$('[data-when]'), msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
  cups.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); write(); }); });
  whens.forEach(function (b) { b.addEventListener('click', function () { whens.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write(); }); });
  function compose() {
    var l = he(), on = {}; cups.forEach(function (c) { on[c.dataset.cup] = c.getAttribute('aria-pressed') === 'true'; });
    var w = whens.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0].dataset.when, it = [];
    if (l) {
      if (on.brows && on.lips) it.push('איפור קבוע לגבות ולשפתיים'); else if (on.brows) it.push('איפור קבוע לגבות'); else if (on.lips) it.push('איפור קבוע לשפתיים');
      if (on.touch) it.push('טאצ׳-אפ'); if (on.train) it.push('ההדרכות לאיפור קבוע');
      var list = !it.length ? 'איפור קבוע' : it.length === 1 ? it[0] : it.slice(0, -1).join(', ') + ' ו' + it[it.length - 1];
      return 'היי דנה, אשמח לשמוע פרטים על ' + list + '. הכי נוח לי ' + { m: 'בבוקר', a: 'אחר הצהריים', f: 'ביום שישי בבוקר' }[w] + '.';
    }
    if (on.brows && on.lips) it.push('permanent makeup for brows and lips'); else if (on.brows) it.push('permanent makeup for brows'); else if (on.lips) it.push('permanent makeup for lips');
    if (on.touch) it.push('a touch-up'); if (on.train) it.push('your permanent makeup training');
    var le = !it.length ? 'permanent makeup' : it.length === 1 ? it[0] : it.slice(0, -1).join(', ') + ' and ' + it[it.length - 1];
    return 'Hi Dana, I’d like to hear about ' + le + '. ' + { m: 'Mornings', a: 'Afternoons', f: 'Friday mornings' }[w] + ' suit me best.';
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
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- words: the reviewers' names on the seal's ring; the active one turns to the top
  var names = $('[data-names]'), qs = $$('.q'), qk = 0, qrot = 45, userQ = false, wordsVis = false;
  qs.forEach(function (q, i) {
    var t = document.createElementNS(NS, 'text'), tp = document.createElementNS(NS, 'textPath');
    tp.setAttribute('href', '#name-p'); tp.setAttribute('startOffset', (12.5 + i * 25) + '%'); tp.setAttribute('text-anchor', 'middle');
    tp.textContent = $('footer', q).textContent; t.appendChild(tp); t.setAttribute('class', /[\u0590-\u05ff]/.test(tp.textContent) ? 'rtl' : 'ltr'); names.appendChild(t);
    t.style.cursor = 'pointer'; t.addEventListener('click', function () { userQ = true; showQ(i); });
  });
  $('[data-nametext]').remove();
  var ntexts = $$('text', names);
  function showQ(i) {
    var d = ((i - qk) % 4 + 4) % 4; if (d === 3) d = -1; qrot -= d * 90; qk = i;
    qs.forEach(function (q, j) { q.classList.toggle('on', j === i); });
    ntexts.forEach(function (t, j) { t.classList.toggle('on', j === i); });
    names.style.transform = 'rotate(' + qrot + 'deg)';
  }
  $$('[data-q]').forEach(function (b) { b.addEventListener('click', function () { userQ = true; showQ(((qk + +b.dataset.q) % 4 + 4) % 4); }); });
  showQ(0);
  watch($('[data-words]'), function (v) { wordsVis = v; }, { threshold: .3 });
  setInterval(function () { if (wordsVis && !userQ && !still() && !document.hidden) showQ((qk + 1) % 4); }, 7000);

  // ---------------------------------------------------------------- visit: the photo closes from full screen into the seal's circle
  var visit = $('[data-visit]'), vtrack = $('.v-track'), vphoto = $('[data-vphoto]'), vrows = $$('[data-rows] > *'), dock = $('[data-dock]'), dring = $('[data-dockring]');

  // the dock steps aside while a WhatsApp button of the page itself is on screen
  var awayN = 0; [$('[data-chat]'), $('[data-rows]')].forEach(function (el) { var seen = false; watch(el, function (v) { if (v !== seen) { seen = v; awayN += v ? 1 : -1; dock.classList.toggle('away', awayN > 0); } }, { threshold: .25 }); });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    seam();
    if (calm) orbDraw(); else orbKick();
    // the studio's name turns around the portrait
    ringtext.style.transform = calm ? '' : 'rotate(' + (scrollY * .045 * (rtl() ? -1 : 1)).toFixed(2) + 'deg)';
    if (!calm && !fine) { var pr = portrait.getBoundingClientRect(), pv = clamp((vh - pr.top) / (vh + pr.height), 0, 1) - .5; frame.style.transform = 'perspective(900px) rotateY(' + (pv * 16).toFixed(2) + 'deg)'; frame.style.setProperty('--gx', (50 + pv * 80) + '%'); }
    // the work sheet rides up over Dana; the stage plays the mapping and the pigment
    if (!calm) {
      var wr = work.getBoundingClientRect(), arrive = smooth(1 - wr.top / vh);
      work.style.transform = 'translateY(' + ((1 - arrive) * 60).toFixed(1) + 'px)';
      var p = prog(work);
      bas.forEach(function (ba) { var tm = baTiming(p, ba.dataset.ba); setBA(ba, tm[0], tm[1]); });
      if (phone()) { var lp = bas[1]; lp.style.transform = 'translateY(' + ((1 - smooth((p - .42) / .07)) * 112).toFixed(2) + '%)'; }
      else bas[1].style.transform = '';
    } else {
      work.style.transform = ''; bas[1].style.transform = '';
      bas.forEach(function (ba) { var s = +ba.dataset.state || 0; setBA(ba, s >= 1 ? 1 : 0, s >= 2 ? 1 : 0); });
    }
    // visit
    var pin = visit.classList.contains('pin');
    if (!calm) {
      var vr = visit.getBoundingClientRect(), k = pin ? smooth(prog(vtrack) / .55) : smooth((vh - vr.top) / (vh * .9));
      var W = vphoto.offsetWidth, cr = vphoto.parentNode.getBoundingClientRect(), ox = vphoto.offsetLeft + W / 2, oy = vphoto.offsetTop + vphoto.offsetHeight / 2;
      var S = pin ? Math.hypot(innerWidth, vh) / W * 1.05 : 1.7, dx = pin ? innerWidth / 2 - (cr.left + ox) : 0, dy = pin ? vh / 2 - oy : 0;
      vphoto.style.transform = 'translate(' + (dx * (1 - k)).toFixed(1) + 'px,' + (dy * (1 - k)).toFixed(1) + 'px) scale(' + lerp(S, 1, k).toFixed(4) + ')';
      vphoto.style.zIndex = k < 1 ? 5 : '';
      vrows.forEach(function (r, i) { var v = smooth((k - .55 - i * .08) / .3); r.style.setProperty('--o', v.toFixed(3)); r.style.setProperty('--ty', ((1 - v) * 30).toFixed(1) + 'px'); });
    } else { vphoto.style.transform = ''; vrows.forEach(function (r) { r.style.removeProperty('--o'); r.style.removeProperty('--ty'); }); }
    // the dock arrives after the hero and turns its ring with the scroll
    dock.classList.toggle('show', scrollY > hero.offsetHeight * .55);
    if (!calm) dring.style.transform = 'rotate(' + (scrollY * .12 * (rtl() ? -1 : 1)).toFixed(1) + 'deg)';
  }

  function layout() {
    visit.classList.toggle('pin', !still() && innerWidth > 900 && innerHeight >= 620);
    ink.size(); orbSize(); orbDraw(); bas.forEach(placeTags); tick();
  }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); orbT0 = 0; orbKick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { layout(); });
})();
