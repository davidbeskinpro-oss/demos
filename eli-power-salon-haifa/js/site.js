(function () {
  var root = document.documentElement, WA = '972507637921';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var NS = 'http://www.w3.org/2000/svg';
  var TITLE = { he: 'מספרת אלי פאור · חניתה 64, חיפה', en: 'Eli Power Hair Salon · 64 Hanita St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור מספרת אלי פאור · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Eli Power Hair Salon · This is not the business’s official website' };
  // seeded random so the drawings stay the same on every visit
  var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  // ------------------------------------------------ language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-t-call]').forEach(function (a) { a.setAttribute('aria-label', l === 'he' ? 'התקשרו לאלי' : 'Call Eli'); });
    $$('[data-t-nav]').forEach(function (a) { a.setAttribute('aria-label', l === 'he' ? 'ראשי' : 'Main'); });
    $('.v-map iframe').title = l === 'he' ? 'מפה: חניתה 64, חיפה' : 'Map: 64 Hanita St, Haifa';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ep-lang', l); } catch (e) {}
    texts(l); hours(); write(true); fit(); onScroll();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ------------------------------------------------ motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('ep-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI(); drift.reset();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('.reviews .r-head').forEach(function (el) { el.classList.add('stuck'); });
    sky.kick(); onScroll(); write(true); tick();
  }); });
  motionUI();

  // ------------------------------------------------ hours, live status (Haifa time) and the wall clock. null = closed
  var H = { 0: [9, 19], 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 15], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, m: +o.minute, s: +o.second };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
    arc(t);
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
  // the clock is drawn after the carved wooden clock on the salon wall
  (function clockFace() {
    var rim = $('.clock .rim'), nums = $('.clock .nums'), g = '';
    g += '<circle class="r1" cx="120" cy="120" r="104"/>';
    for (var i = 0; i < 12; i++) {
      var a = i * Math.PI / 6, x = 120 + Math.sin(a) * 104, y = 120 - Math.cos(a) * 104, deg = i * 30;
      g += '<path d="M' + (x - 13) + ' ' + y + 'q13 -16 26 0q-13 16 -26 0z" transform="rotate(' + deg + ' ' + x + ' ' + y + ')"/>';
      g += '<path class="curl" d="M' + (x - 9) + ' ' + (y + 1) + 'q4 -7 9 -2q5 5 9 -2" transform="rotate(' + deg + ' ' + x + ' ' + y + ')"/>';
    }
    g += '<circle class="r2" cx="120" cy="120" r="84"/>';
    rim.innerHTML = g; g = '';
    for (var n = 1; n <= 12; n++) { var b = n * Math.PI / 6; g += '<text x="' + (120 + Math.sin(b) * 64).toFixed(1) + '" y="' + (120 - Math.cos(b) * 64).toFixed(1) + '">' + n + '</text>'; }
    nums.innerHTML = g;
  })();
  function arc(t) {
    var p = $('[data-arc]'); if (!t) { p.setAttribute('d', ''); return; }
    var span = t[1] - t[0], R = 74, pt = function (h) { var a = (h % 12) / 12 * Math.PI * 2; return (120 + Math.sin(a) * R).toFixed(1) + ' ' + (120 - Math.cos(a) * R).toFixed(1); };
    p.setAttribute('d', span >= 12 ? 'M120 46a74 74 0 1 1 -.01 0' : 'M' + pt(t[0]) + 'A74 74 0 ' + (span > 6 ? 1 : 0) + ' 1 ' + pt(t[1]));
  }
  var hh = $('[data-hh]'), mh = $('[data-mh]'), sh = $('[data-sh]'), clockVis = true;
  function tick() {
    var n = now(), H12 = (n.h % 12);
    hh.style.transform = 'rotate(' + (H12 * 30) + 'deg)';
    mh.style.transform = 'rotate(' + (n.m * 6 + n.s * .1) + 'deg)';
    sh.style.transform = 'rotate(' + (n.s * 6) + 'deg)';
  }
  setInterval(function () { if (clockVis && !still()) tick(); }, 1000);
  setInterval(function () { status(); tick(); }, 60000);

  // ------------------------------------------------ headline letter by letter
  var ci = 0;
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.lang === 'he' ? ci : (sp.closest('.ln').previousElementSibling ? 9 : 0);
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      if (/^\d+$/.test(w)) return '<span class="w"><span class="ch" style="--i:' + (i++) + '">' + w + '</span></span>';
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
    if (sp.lang === 'he') ci = i;
  });

  // ------------------------------------------------ entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  var watch = function (el, fn, m) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, { rootMargin: m || '0px' }).observe(el); };

  // ------------------------------------------------ odometers
  $$('[data-odo]').forEach(function (o) {
    o.setAttribute('aria-label', o.dataset.odo);
    o.innerHTML = o.dataset.odo.split('').map(function (ch, k) {
      if (!/\d/.test(ch)) return '<span aria-hidden="true">' + ch + '</span>';
      var s = ''; for (var d = 0; d <= 9; d++) s += '<span data-n="' + d + '"></span>';
      return '<span class="col" aria-hidden="true" data-d="' + ch + '" style="--od:' + (k * 140) + 'ms">' + s + '</span>';
    }).join('');
    watch(o, function (v) { if (!v) return; $$('.col', o).forEach(function (c) { c.style.transform = 'translateY(' + (-c.dataset.d * 1.2) + 'em)'; }); });
  });

  // ------------------------------------------------ review stars stuck on one by one, like the stickers on the sign
  var stk = $('[data-stickers]'); stk.innerHTML = [0, 1, 2, 3, 4].map(function (i) { return '<svg style="--sd:' + (300 + i * 140) + 'ms"><use href="#i-star"/></svg>'; }).join('');
  watch($('.r-head'), function (v) { if (v) $('.r-head').classList.add('stuck'); });

  // ------------------------------------------------ hero: deal the photos, then the window lights up
  var hero = $('[data-hero]'), win = $('[data-window]'), nav = $('[data-nav]');
  requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('ready'); }); });
  setTimeout(function () { hero.classList.add('settled'); }, 1700);
  var px = .5, py = .5, heroVis = true;
  hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = hero.getBoundingClientRect(); px = (e.clientX - r.left) / r.width; py = (e.clientY - r.top) / r.height; sky.point(e.clientX - r.left, e.clientY - r.top); });
  hero.addEventListener('pointerleave', function () { px = .5; py = .5; sky.point(-999, -999); });
  hero.addEventListener('pointerdown', function (e) { var r = hero.getBoundingClientRect(); sky.burst(e.clientX - r.left, e.clientY - r.top); });
  function heroTilt(t) {
    var dx = px - .5, dy = py - .5;
    if (!fine) { dx = Math.sin(t / 1700) * .35; dy = Math.cos(t / 2300) * .25; }
    if (!hero.classList.contains('settled')) return;
    win.style.setProperty('--ry', (dx * 12).toFixed(2) + 'deg'); win.style.setProperty('--rx', (-dy * 9).toFixed(2) + 'deg');
    $$('[data-deal]').forEach(function (d, i) { var k = (i + 1) * 10; d.style.setProperty('--tx', (-dx * k).toFixed(1) + 'px'); d.style.setProperty('--ty', (-dy * k).toFixed(1) + 'px'); });
    hero.style.setProperty('--bx', (-dx * 18).toFixed(1) + 'px'); hero.style.setProperty('--by', (-dy * 12).toFixed(1) + 'px');
  }

  // ------------------------------------------------ the sign's own motifs (stars, moon, sun, hearts, notes) drifting over the hero
  var sky = (function () {
    var cv = $('[data-sky]'), c = cv.getContext('2d'), w, h, ps = [], raf = 0, mx = -999, my = -999;
    var COL = ['248,236,223', '243,170,140', '229,189,99', '233,164,180'];
    function make(x, y, burst) {
      var a = rnd() * Math.PI * 2, sp = burst ? 1.5 + rnd() * 2.5 : 0;
      return { x: x, y: y, r: 5 + rnd() * 9, k: Math.floor(rnd() * 5), c: COL[Math.floor(rnd() * 4)], vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - .12 - rnd() * .2, ph: rnd() * 6.28, rot: rnd() * 6.28, life: burst ? 1 : -1, glow: 0 };
    }
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed = 11; ps = []; var n = w < 700 ? 22 : 42; for (var i = 0; i < n; i++) ps.push(make(rnd() * w, rnd() * h));
    }
    function shape(p, a) {
      c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.globalAlpha = a; c.fillStyle = c.strokeStyle = 'rgb(' + p.c + ')'; c.lineWidth = 1.6; var r = p.r;
      c.beginPath();
      if (p.k === 0 || p.k === 4) { for (var i = 0; i < 10; i++) { var q = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * .42 : r; c.lineTo(Math.cos(q) * rr, Math.sin(q) * rr); } c.closePath(); c.fill(); }
      else if (p.k === 1) { c.arc(0, 0, r, .6, Math.PI * 2 - .6, false); c.arc(r * .45, 0, r * .8, Math.PI * 2 - .9, .9, true); c.closePath(); c.fill(); }
      else if (p.k === 2) { c.arc(0, 0, r * .45, 0, 7); c.fill(); for (var j = 0; j < 8; j++) { var b = j * Math.PI / 4; c.moveTo(Math.cos(b) * r * .65, Math.sin(b) * r * .65); c.lineTo(Math.cos(b) * r, Math.sin(b) * r); } c.stroke(); }
      else { c.moveTo(0, r * .6); c.bezierCurveTo(-r * 1.1, -r * .2, -r * .5, -r, 0, -r * .35); c.bezierCurveTo(r * .5, -r, r * 1.1, -r * .2, 0, r * .6); c.fill(); }
      c.restore();
    }
    function draw(t) {
      c.clearRect(0, 0, w, h);
      for (var i = ps.length - 1; i >= 0; i--) {
        var p = ps[i], d = Math.hypot(p.x - mx, p.y - my);
        if (!still()) {
          if (d < 150) { p.glow = Math.min(1, p.glow + .08); p.x += (p.x - mx) / d * .9; p.y += (p.y - my) / d * .9; } else p.glow *= .95;
          p.x += p.vx; p.y += p.vy; p.rot += .004;
          if (p.life > 0) { p.vx *= .97; p.vy = p.vy * .97 - .01; p.life -= .012; if (p.life <= 0) { ps.splice(i, 1); continue; } }
          if (p.y < -20) { p.y = h + 20; p.x = rnd() * w; }
        }
        var a = (p.life > 0 ? p.life : 1) * (.32 + .28 * Math.sin(t / 700 + p.ph) + p.glow * .5);
        shape(p, clamp(a, .08, 1));
      }
    }
    function frame(t) { raf = 0; if (!heroVis || still()) { draw(0); return; } draw(t); heroTilt(t); raf = requestAnimationFrame(frame); }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: function () { size(); draw(0); }, kick: kick, point: function (x, y) { mx = x; my = y; },
      burst: function (x, y) { if (still()) return; for (var i = 0; i < 9; i++) ps.push(make(x, y, true)); kick(); } };
  })();
  watch(hero, function (v) { heroVis = v; sky.kick(); });

  // ------------------------------------------------ mirror beads, kids' stars
  (function () {
    var f = $('.m-frame .f1'), g = $('.m-frame .beads'), L = f.getTotalLength ? f.getTotalLength() : 0, s = '';
    for (var i = 0; i < 28 && L; i++) { var p = f.getPointAtLength(L * i / 28); s += '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + (i % 2 ? 2.6 : 4.2) + '"/>'; }
    g.innerHTML = s;
    var st = $('.t-kids .stars'), out = '', pos = [[30, 30, 12], [80, 18, 7], [150, 26, 10], [196, 50, 7], [120, 62, 15], [46, 84, 8], [178, 96, 11], [96, 110, 6], [16, 120, 6]];
    pos.forEach(function (q, i) {
      var d = ''; for (var k = 0; k < 10; k++) { var a = k * Math.PI / 5 - Math.PI / 2, r = k % 2 ? q[2] * .42 : q[2]; d += (k ? 'L' : 'M') + (q[0] + Math.cos(a) * r).toFixed(1) + ' ' + (q[1] + Math.sin(a) * r).toFixed(1); }
      out += '<path d="' + d + 'Z" style="--tw:' + (i * 290) + 'ms"/>';
    });
    st.innerHTML = out;
  })();

  // ------------------------------------------------ hair strands: wavy → straight behind a comb (signature) and in the small tile
  function strands(svg, n, W, Hh, top, bottom, ampMax) {
    var cols = ['244,205,214', '229,189,99', '248,236,223', '233,164,180', '243,212,141'], list = [];
    seed = 29 + n;
    for (var i = 0; i < n; i++) {
      var p = document.createElementNS(NS, 'path'), y0 = top + (bottom - top) * (i + .5) / n + (rnd() - .5) * 8;
      p.setAttribute('stroke', 'rgba(' + cols[i % 5] + ',' + (.5 + rnd() * .45).toFixed(2) + ')');
      p.setAttribute('stroke-width', (1.6 + rnd() * 2.6).toFixed(1));
      svg.appendChild(p);
      list.push({ el: p, y0: y0, a: ampMax * (.55 + rnd() * .45), k1: (.012 + rnd() * .012) * 1200 / W, k2: (.026 + rnd() * .02) * 1200 / W, k3: (.05 + rnd() * .025) * 1200 / W, p1: rnd() * 6, p2: rnd() * 6 });
    }
    return function (cut, rev, t) { // cut: 0..1 position of the comb along the strands; straight on the side it has passed
      list.forEach(function (s) {
        var d = '';
        for (var x = 0; x <= W; x += W / 110) {
          var u = rev ? 1 - x / W : x / W, f = smooth((u - cut) / .12 + .5); // f: 1 = still frizzy (ahead of the comb)
          var y = s.y0 + f * s.a * (Math.sin(x * s.k1 + s.p1) + .5 * Math.sin(x * s.k2 + s.p2) + .22 * Math.sin(x * s.k3 + s.p1 * 2)) + Math.sin(x * .006 + (t || 0) / 900 + s.p2) * 4;
          d += (x ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
        }
        s.el.setAttribute('d', d);
      });
    };
  }
  var stSec = $('[data-strands]'), comb = $('[data-comb]');
  var HW = innerWidth < 700 ? 600 : 1200; $('.st-svg').setAttribute('viewBox', '0 0 ' + HW + ' 420');
  var hair = strands($('[data-hair]'), 20, HW, 420, 40, 380, 19);
  var mini = strands($('[data-mini]'), 8, 300, 110, 14, 96, 10);

  // ------------------------------------------------ reviews drift; scrolling nudges them along
  var drift = (function () {
    var tr = $('[data-dtrack]'), orig = tr.innerHTML, off = 0, w = 0, vis = false, raf = 0, hover = false, last = scrollY, cloned = false;
    function reset() {
      if (still()) { tr.innerHTML = orig; cloned = false; tr.style.setProperty('--dx', '0px'); return; }
      if (!cloned) { tr.insertAdjacentHTML('beforeend', orig.replace(/<figure class="rev"/g, '<figure class="rev" aria-hidden="true"')); cloned = true; }
      w = tr.scrollWidth / 2; kick();
    }
    function frame() {
      raf = 0; if (!vis || still()) return;
      var dy = scrollY - last; last = scrollY;
      off += (hover ? 0 : .45) + Math.abs(dy) * .25; if (w) off %= w;
      tr.style.setProperty('--dx', (rtl() ? off : -off).toFixed(1) + 'px');
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    tr.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hover = true; });
    tr.addEventListener('pointerleave', function () { hover = false; });
    watch(tr, function (v) { vis = v; if (v) { w = tr.scrollWidth / 2; kick(); } });
    return { reset: reset };
  })();

  // ------------------------------------------------ composer: a note to Eli, typed into the phone
  var card = $('[data-card]'), bubble = $('[data-bubble]'), send = $('[data-send]'), typing = 0;
  var MSG = {
    he: { who: ['בשבילי', 'לבן שלי', 'לבת שלי', 'לכמה מאיתנו'], what: ['תספורת', 'עיצוב שיער', 'החלקה'], when: ['היום', 'השבוע', 'ביום שישי'],
      f: function (a, b, c) { return 'שלום אלי, אשמח לקבוע תור ל' + b + ' ' + a + ' ' + c + '. מתי נוח לך?'; } },
    en: { who: ['for me', 'for my son', 'for my daughter', 'for a few of us'], what: ['a haircut', 'hair styling', 'straightening'], when: ['today', 'this week', 'on Friday'],
      f: function (a, b, c) { return 'Hi Eli, I’d like to book ' + b + ' ' + a + ' ' + c + '. When suits you?'; } }
  };
  function val(n) { var e = $('input[name="' + n + '"]:checked', card); return e ? +e.value : 0; }
  function write(instant) {
    var m = MSG[he() ? 'he' : 'en'], txt = m.f(m.who[val('who')], m.what[val('what')], m.when[val('when')]);
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(txt);
    clearInterval(typing);
    if (instant || still()) { bubble.textContent = txt; return; }
    var i = 0; typing = setInterval(function () { i += 2; bubble.innerHTML = ''; bubble.textContent = txt.slice(0, i); bubble.insertAdjacentHTML('beforeend', '<span class="cur"></span>'); if (i >= txt.length) { clearInterval(typing); bubble.textContent = txt; } }, 22);
  }
  card.addEventListener('change', function () { write(false); });
  var wroteOnce = false;
  watch($('.phone'), function (v) { if (v && !wroteOnce) { wroteOnce = true; write(false); } });

  // ------------------------------------------------ bento spotlight + photo lean
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--cx', (e.clientX - r.left) + 'px'); t.style.setProperty('--cy', (e.clientY - r.top) + 'px'); t.style.setProperty('--spot', 1); });
    t.addEventListener('pointerleave', function () { t.style.setProperty('--spot', 0); });
  });
  var lean = $('[data-lean]');
  lean.addEventListener('pointermove', function (e) { if (still()) return; var r = lean.getBoundingClientRect(); lean.style.setProperty('--lx', ((e.clientX - r.left) / r.width - .5) * -16 + 'px'); lean.style.setProperty('--ly', ((e.clientY - r.top) / r.height - .5) * -16 + 'px'); });
  var mirror = $('[data-mirror]');
  mirror.addEventListener('pointermove', function (e) { if (still()) return; var r = mirror.getBoundingClientRect(); mirror.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5) * -12 + 'px'); mirror.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5) * -12 + 'px'); });

  // ------------------------------------------------ map loads when near
  var ifr = $('.v-map iframe'); watch(ifr, function (v) { if (v && !ifr.src) ifr.src = ifr.dataset.src; }, '400px');
  watch($('[data-clock]'), function (v) { clockVis = v; });

  // ------------------------------------------------ footer wordmark fitted to its width
  function fit() {
    var wm = $('[data-fit]'); wm.style.fontSize = ''; var avail = wm.clientWidth, sp = $('span[lang="' + root.lang + '"]', wm);
    var fs = parseFloat(getComputedStyle(wm).fontSize), sw = sp.getBoundingClientRect().width;
    if (sw > avail * .96) wm.style.fontSize = (fs * avail * .96 / sw) + 'px';
  }

  // ------------------------------------------------ scroll-linked scenes, all reversible
  var frieze = $('[data-ftrack]'), clip = $('[data-clipper]'), cframe = $('[data-cframe]'), foot = $('[data-foot]'), eli = $('#eli'), mtile = $('.t-straight');
  var ticking = false, vh = innerHeight;
  function prog(el, a, b) { var r = el.getBoundingClientRect(); return clamp((vh - r.top) / (vh + r.height) * (1) - a, 0, b - a) / (b - a); }
  function onScroll() {
    ticking = false; vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 60);
    var S = still(), t = performance.now();
    // gold sign band slides sideways with the page
    var fx = S ? 0 : -((scrollY * .35) % 960);
    frieze.style.setProperty('--fx', (rtl() ? -fx : fx).toFixed(1) + 'px');
    // mirror sheen crosses the glass
    var pe = prog(eli, .1, .8); eli.style.setProperty('--sx', S ? '30%' : (-70 + pe * 140).toFixed(1) + '%');
    $('.sheen').style.setProperty('--sx', S ? '30%' : (-70 + pe * 140).toFixed(1) + '%');
    // clipper pass reveals the cut
    var pc = S ? 1 : prog(clip, .12, .48); clip.style.setProperty('--cut', (pc * 100).toFixed(1) + '%'); clip.style.setProperty('--cutdone', pc > .98 ? 1 : 0);
    // the comb straightens the hair
    var ps = S ? 1.2 : -.1 + prog(stSec, .22, .72) * 1.25;
    hair(ps, rtl(), S ? 0 : t);
    var sw = stSec.clientWidth; comb.style.setProperty('--kx', (rtl() ? sw - ps * sw : ps * sw - 30).toFixed(1) + 'px');
    mini(S ? 1.2 : -.1 + prog(mtile, .15, .55) * 1.25, rtl(), 0);
    // closing photo shrinks into the lit frame
    cframe.style.setProperty('--cp', S ? 1 : smooth(prog(cframe, .05, .45)).toFixed(3));
    // curtain parts over the footer
    var r = foot.getBoundingClientRect(); foot.style.setProperty('--op', S ? 1 : smooth((vh - r.top) / (Math.min(r.height, vh) * .8)).toFixed(3));
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', function () { sky.size(); fit(); drift.reset(); req(); });

  // ------------------------------------------------ start
  texts(root.lang); hours(); tick(); sky.size(); sky.kick(); drift.reset(); write(true); onScroll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit); else fit();
  window.__ep = true;
})();
