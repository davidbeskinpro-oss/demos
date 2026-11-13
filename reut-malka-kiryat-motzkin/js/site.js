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
  var phone = function () { return innerWidth < 760; };
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[es.length - 1].isIntersecting); }, opt || {}).observe(el); };
  var refreshers = [], langers = [];

  /* ---------- language ---------- */
  function texts() {
    var l = root.lang;
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-he][data-en]').forEach(function (t) { t.textContent = t.dataset[l]; });
    var n = $('[data-t-nav]'); if (n) n.setAttribute('aria-label', l === 'he' ? 'ראשי' : 'Main');
    var lv = $('[data-t-leaves]'); if (lv) lv.setAttribute('aria-label', l === 'he' ? 'טיפולים' : 'Treatments');
    $$('[data-set-lang]').forEach(function (b) { b.setAttribute('aria-label', l === 'he' ? 'English' : 'עברית'); });
    var c = $('.d-call'); if (c) c.setAttribute('aria-label', l === 'he' ? 'חיוג לרעות' : 'Call Reut');
    var f = $('[data-flower]'); if (f) f.setAttribute('aria-label', l === 'he' ? 'בחירת טיפול' : 'Choose a treatment');
    var w = $('[data-week]'); if (w) w.setAttribute('aria-label', l === 'he' ? 'יום' : 'Day');
    document.title = l === 'he' ? 'רעות מלכה · קוסמטיקה ופדיקור · פנחס ספיר 14, קריית מוצקין' : 'Reut Malka · Cosmetics & pedicure · 14 Pinchas Sapir, Kiryat Motzkin';
    langers.forEach(function (fn) { fn(); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('rm233-lang', l); } catch (e) {}
    texts(); refresh();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  /* ---------- motion switch ---------- */
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('rm233-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],.ch,.f-num').forEach(function (el) { el.classList.add('in'); });
    refresh();
  }); });
  function refresh() { refreshers.forEach(function (fn) { fn(); }); }

  /* ---------- hours ---------- */
  var H = { 0: [15.5, 20], 1: [15.5, 20], 2: [15.5, 20], 3: [15.5, 21], 4: [15.5, 21], 5: [1, 15.5], 6: null };   // as on Google (Friday 1:00 is the listing's own value)
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], shortEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: shortEn.indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  var span = function (d) { return d === 5 ? (he() ? 'עד ' : 'until ') + hhmm(H[5][1]) : hhmm(H[d][0]) + '–' + hhmm(H[d][1]); };
  function opensText(d, rel) {
    var name = rel === 0 ? (he() ? 'היום' : 'today') : rel === 1 ? (he() ? 'מחר' : 'tomorrow') : (he() ? 'ביום ' + dayHe[d] : 'on ' + dayEn[d]);
    if (d === 5) return he() ? 'נפתח ' + name : 'Opens ' + name;   // Friday's opening hour on Google looks like a typo, so no hour is shown
    return he() ? 'נפתח ' + name + ' ב-' + hhmm(H[d][0]) : 'Opens ' + name + ' at ' + hhmm(H[d][0]);
  }
  function status() {
    var n = now(), t = H[n.d], open = !!t && n.h >= t[0] && n.h < t[1], txt, frac = 0;
    if (open) { txt = (he() ? 'פתוח עכשיו · עד ' : 'Open now · until ') + hhmm(t[1]); frac = (n.h - t[0]) / (t[1] - t[0]); }
    else {
      for (var k = 0; k < 8; k++) {
        var d = (n.d + k) % 7, x = H[d];
        if (x && (k > 0 || n.h < x[0])) { txt = (he() ? 'סגור עכשיו · ' : 'Closed now · ') + opensText(d, k); break; }
      }
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', +r.dataset.d === n.d); });
    var ring = $('[data-ring]'); if (ring) ring.style.strokeDashoffset = 314.16 * (1 - (open ? clamp(frac, .04, 1) : 0));
  }
  function hoursTable() {
    var el = $('[data-hours]'); if (!el) return;
    var rows = [0, 1, 2, 3, 4, 5, 6].map(function (d) {
      return '<tr data-d="' + d + '"><td>' + (he() ? dayHe[d] : dayEn[d]) + '</td><td class="num" dir="ltr">' + (H[d] ? span(d) : (he() ? 'סגור' : 'Closed')) + '</td></tr>';
    });
    el.innerHTML = '<tbody>' + rows.join('') + '</tbody>';
    status();
  }
  langers.push(hoursTable);
  setInterval(status, 60000);

  /* ---------- split text into characters ---------- */
  function split(el) {
    var i = 0;
    $$('span[lang]', el).forEach(function (sp) {
      if (sp.querySelector('span')) return;
      i = 0;
      sp.innerHTML = sp.textContent.split(' ').map(function (w) {
        return '<span class="w" style="display:inline-block">' + w.split('').map(function (c) { return '<span class="lt" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  }
  $$('[data-split], [data-letters]').forEach(split);
  (function () { var f = $('[data-fnum]'); if (!f) return; var i = 0; f.innerHTML = f.textContent.split('').map(function (c) { return '<span class="lt" style="--i:' + (i++) + '">' + c + '</span>'; }).join(''); f.setAttribute('aria-label', '058-676-9611'); })();

  /* ---------- reveals ---------- */
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px' }) : null;
  $$('[data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); });
  $$('[data-reveal],[data-tile],.ch,.f-num').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  /* ---------- nav: gathers into a pill ---------- */
  var nav = $('[data-nav]'), concept = $('.concept'), dock = $('[data-dock]'), hero = $('[data-hero]');
  function navTick() {
    var ch = concept.offsetHeight, y = scrollY;
    nav.style.setProperty('--nav-top', Math.max(10, ch - y + (y > 30 ? 10 : 0)) + 'px');
    nav.classList.toggle('gathered', y > 30);
    if (dock) dock.classList.toggle('show', hero.getBoundingClientRect().bottom < innerHeight * .4);
  }

  /* ---------- hero: the logo's leaves gather out of dust ---------- */
  var dust = (function () {
    var cv = $('[data-dust]'), src = $('[data-marksrc]'), top = $('.h-top');
    if (!cv || !cv.getContext) return { kick: function () {}, size: function () {} };
    var c = cv.getContext('2d'), P = [], petals = [], w = 0, h = 0, raf = 0, vis = true, t0 = 0, mx = -999, my = -999, ok = false;
    function sample() {
      var img = new Image(); img.src = src.src;
      img.onload = function () {
        try {
          var k = document.createElement('canvas'), W = 172, Hh = 162; k.width = W; k.height = Hh;
          var x = k.getContext('2d'); x.drawImage(img, 0, 0, W, Hh);
          var d = x.getImageData(0, 0, W, Hh).data, step = phone() ? 3 : 2, pts = [];
          for (var yy = 0; yy < Hh; yy += step) for (var xx = 0; xx < W; xx += step) {
            var o = (yy * W + xx) * 4; if (d[o + 3] > 120) pts.push([xx / W, yy / Hh, d[o], d[o + 1], d[o + 2]]);
          }
          P = pts.map(function (p, i) {
            var rose = Math.random() < .14;
            return { u: p[0], v: p[1], col: rose ? 'rgba(190,120,128,' : (Math.random() < .5 ? 'rgba(128,138,92,' : 'rgba(148,157,111,'), a: Math.random() * Math.PI * 2, sx: Math.random(), sy: Math.random(), d: Math.random() * 900 + (i % 7) * 60, ox: 0, oy: 0 };
          });
          ok = true; root.classList.remove('no-canvas'); size(); t0 = performance.now(); kick();
        } catch (e) { root.classList.add('no-canvas'); }
      };
      img.onerror = function () { root.classList.add('no-canvas'); };
    }
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = top.clientWidth; h = top.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      petals = []; for (var i = 0; i < (phone() ? 7 : 14); i++) petals.push({ x: Math.random() * w, y: Math.random() * h, s: 6 + Math.random() * 9, v: .12 + Math.random() * .25, r: Math.random() * 6.28, vr: (Math.random() - .5) * .01, ph: Math.random() * 6 });
    }
    function box() {
      var r = src.getBoundingClientRect(), t = top.getBoundingClientRect();
      return { x: r.left - t.left, y: r.top - t.top, w: r.width, h: r.height };
    }
    function frame(now) {
      raf = 0; if (!vis || still()) { c.clearRect(0, 0, w, h); return; }
      var b = box(), T = now - t0, ps = Math.max(1.6, b.w / 120);
      c.clearRect(0, 0, w, h);
      // drifting petals behind the mark
      petals.forEach(function (p) {
        p.y += p.v; p.x += Math.sin(now / 1600 + p.ph) * .35; p.r += p.vr;
        if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; }
        c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = 'rgba(201,138,140,.28)';
        c.beginPath(); c.ellipse(0, 0, p.s * .45, p.s, 0, 0, 6.283); c.fill(); c.restore();
      });
      for (var i = 0; i < P.length; i++) {
        var p = P[i], e = smooth((T - p.d) / 1500);
        var tx = b.x + p.u * b.w + Math.sin(now / 1400 + p.a) * 1.4, ty = b.y + p.v * b.h + Math.cos(now / 1700 + p.a) * 1.4;
        var x = lerp(p.sx * w, tx, e), y = lerp(p.sy * h, ty, e);
        var dx = x - mx, dy = y - my, d2 = dx * dx + dy * dy;
        if (d2 < 9000) { var f = (1 - d2 / 9000) * 26; var dd = Math.sqrt(d2) || 1; p.ox += (dx / dd * f - p.ox) * .2; p.oy += (dy / dd * f - p.oy) * .2; }
        else { p.ox *= .92; p.oy *= .92; }
        c.fillStyle = p.col + (.35 + .65 * e) + ')';
        c.fillRect(x + p.ox, y + p.oy, ps, ps);
      }
      kick();
    }
    function kick() { if (ok && !raf && vis && !still()) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { var r = top.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) { var r = top.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; setTimeout(function () { mx = my = -999; }, 500); });
    watch(top, function (v) { vis = v; kick(); });
    if (!still()) sample(); else root.classList.add('no-canvas');
    refreshers.push(function () { if (still()) { c.clearRect(0, 0, w, h); } else if (!ok) { sample(); } else { kick(); } });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  /* ---------- hero arc of real photos ---------- */
  var arc = (function () {
    var wrap = $('[data-arc-wrap]'), el = $('[data-arc]'); if (!el) return { kick: function () {} };
    var cards = $$('.ac', el), N = cards.length, rot = 0, vel = 0, raf = 0, vis = true, drag = false, lx = 0, t0 = performance.now(), last = 0;
    function R() { var cw = cards[0].offsetWidth || 200; return cw * 1.18 / (2 * Math.tan(Math.PI / N)); }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.opacity = ''; }); return; }
      var dt = last ? Math.min(50, t - last) : 16; last = t;
      if (!drag) { rot += (dt / 1000) * 7 + vel * dt / 1000; vel *= .94; }
      var r = R(), deal = smooth((t - t0 - 300) / 1600), sc = scrollY * .06;
      cards.forEach(function (c, i) {
        var a = (i * 360 / N + rot + sc) % 360; if (a > 180) a -= 360; if (a < -180) a += 360;
        var di = smooth(deal * 1.6 - i * .08), aa = a * di;
        var f = (Math.cos(aa * Math.PI / 180) + 1) / 2;
        c.style.transform = 'rotateY(' + aa.toFixed(2) + 'deg) translateZ(' + (r * di).toFixed(1) + 'px) scale(' + (.7 + .3 * di).toFixed(3) + ')';
        c.style.opacity = (di * (.25 + .75 * f)).toFixed(3);
        c.style.zIndex = Math.round(f * 100);
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && vis) { last = 0; raf = requestAnimationFrame(frame); } }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .22; vel = dx * 6; });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(wrap, function (v) { vis = v; kick(); });
    refreshers.push(kick);
    return { kick: kick };
  })();

  /* ---------- signature: one leaf opens into the photo ---------- */
  var win = $('[data-window]'), leafPath = $('[data-leafpath]'), leafImg = $('[data-leafimg]'), wStage = $('.w-stage', win);
  var wChars = $$('[data-letters] .lt', win);
  function leafTo(s, r) { leafPath.setAttribute('transform', 'translate(50 50) rotate(' + r.toFixed(2) + ') scale(' + s.toFixed(3) + ') translate(-50 -26)'); }
  function windowTick() {
    if (!win) return;
    if (still()) { leafImg.setAttribute('clip-path', 'url(#leafclip)'); leafTo(phone() ? 2.2 : 2.6, -12); wStage.style.setProperty('--scrim', '.9'); wChars.forEach(function (c) { c.classList.add('on'); }); return; }
    var r = win.getBoundingClientRect(), p = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
    var g = smooth(p / .72);
    leafTo(lerp(.62, 12, g * g), lerp(-24, 0, g));
    if (p > .74) leafImg.removeAttribute('clip-path'); else leafImg.setAttribute('clip-path', 'url(#leafclip)');
    wStage.style.setProperty('--scrim', smooth((p - .3) / .3).toFixed(3));
    wStage.style.setProperty('--wl', smooth((p - .55) / .15).toFixed(3));
    var vis = wChars.filter(function (c) { return c.offsetParent; }), n = vis.length || 1;
    vis.forEach(function (c, i) { c.classList.toggle('on', p > .1 + i * (.42 / n)); });
  }

  /* ---------- chapters: land on each other ---------- */
  var chs = $$('.ch');
  function chapterTick() {
    chs.forEach(function (c, i) {
      if (still()) { c.style.top = ''; c.style.setProperty('--cover', 0); return; }
      c.style.top = Math.min(0, innerHeight - c.offsetHeight) + 'px';
      var nx = chs[i + 1];
      if (nx) { var nt = nx.getBoundingClientRect().top; c.style.setProperty('--cover', (smooth(1 - nt / innerHeight) * .5).toFixed(3)); }
    });
  }

  /* ---------- photos lean toward the hand (scroll on touch) ---------- */
  var tilts = $$('[data-tilt]');
  tilts.forEach(function (f) {
    if (!finePointer) return;
    f.addEventListener('pointermove', function (e) {
      if (still()) return;
      var r = f.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      f.style.setProperty('--ry', ((x - .5) * 10).toFixed(2) + 'deg'); f.style.setProperty('--rx', ((.5 - y) * 8).toFixed(2) + 'deg');
      f.style.setProperty('--lx', (x * 100).toFixed(1) + '%'); f.style.setProperty('--ly', (y * 100).toFixed(1) + '%');
      f.style.setProperty('--px', ((.5 - x) * 18).toFixed(1) + 'px'); f.style.setProperty('--py', ((.5 - y) * 14).toFixed(1) + 'px');
    });
    f.addEventListener('pointerleave', function () { ['--rx', '--ry', '--px', '--py'].forEach(function (k) { f.style.removeProperty(k); }); });
  });
  function tiltScroll() {
    if (finePointer || still()) return;
    tilts.forEach(function (f) {
      var r = f.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      var k = (r.top + r.height / 2) / innerHeight - .5;
      f.style.setProperty('--py', (k * -24).toFixed(1) + 'px'); f.style.setProperty('--ly', (50 + k * 80).toFixed(1) + '%');
    });
  }

  /* ---------- bento spotlight ---------- */
  $$('[data-tile]').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });
  var photoTile = $('.t-photo');

  /* ---------- odometer ---------- */
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="sep" data-n="' + ch + '"></span>';
      var s = ''; for (var i = 0; i < 10; i++) s += '<i data-n="' + i + '"></i>';
      return '<span class="d" data-to="' + ch + '"><span>' + s + '</span></span>';
    }).join('');
    function roll(go) { $$('.d', o).forEach(function (d, i) { var s = d.firstChild, to = go || still() ? +d.dataset.to : 0; s.style.transitionDelay = go ? i * 160 + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
    roll(false);
    watch(o, function (v) { if (v) roll(true); }, { threshold: .4 });
    refreshers.push(function () { if (still()) roll(true); });
  });

  /* ---------- reviews drift: duplicate each row for a seamless loop ---------- */
  $$('[data-drift] .row').forEach(function (r) { $$('.rv', r).forEach(function (c) { var k = c.cloneNode(true); k.classList.add('dup'); k.setAttribute('aria-hidden', 'true'); r.appendChild(k); }); });

  /* ---------- composer: tap leaves, pick a day, the message writes itself ---------- */
  (function () {
    var petals = $$('.petal'), week = $('[data-week]'), bubble = $('[data-bubble]'), send = $('[data-send]');
    if (!bubble) return;
    var pick = {}, day = null, typed = '', timer = 0, seen = false;
    var itemHe = { face: 'טיפול פנים', laser: 'טיפול לייזר', pedi: 'פדיקור', nails: 'ציפורניים' }, itemEn = { face: 'a facial', laser: 'a laser treatment', pedi: 'a pedicure', nails: 'nails' };
    var order = ['face', 'laser', 'pedi', 'nails'];
    function joinHe(a) { a = a.map(function (x) { return 'ל' + x; }); return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' ו' + a[a.length - 1]; }
    function joinEn(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
    function message() {
      var items = order.filter(function (k) { return pick[k]; }), ask = !!pick.ask, s;
      if (he()) {
        s = 'היי רעות, ';
        if (items.length) s += 'אשמח לקבוע תור ' + joinHe(items.map(function (k) { return itemHe[k]; })) + '.';
        else if (!ask) s += 'אשמח לקבוע תור.';
        if (ask) s += items.length ? ' יש לי גם שאלה: ' : 'יש לי שאלה: ';
        if (day !== null) s += (ask ? '\n' : ' ') + 'מתאים לי ביום ' + dayHe[day] + '.';
      } else {
        s = 'Hi Reut, ';
        if (items.length) s += 'I’d like to book ' + joinEn(items.map(function (k) { return itemEn[k]; })) + '.';
        else if (!ask) s += 'I’d like to book an appointment.';
        if (ask) s += items.length ? ' I also have a question: ' : 'I have a question: ';
        if (day !== null) s += (ask ? '\n' : ' ') + dayEn[day] + ' would suit me.';
      }
      return s;
    }
    function render(instant) {
      var m = message();
      send.href = 'https://wa.me/972586769611?text=' + encodeURIComponent(m);
      clearTimeout(timer);
      if (instant || still() || !seen) { typed = m; bubble.textContent = m; return; }
      var k = 0; while (k < typed.length && typed[k] === m[k]) k++;     // keep what is already written, type the rest
      var cur = typed.slice(0, k), rest = m.slice(k), stepN = Math.max(1, Math.ceil(rest.length / 40));
      (function tick() {
        cur += rest.slice(0, stepN); rest = rest.slice(stepN); typed = cur;
        bubble.innerHTML = ''; bubble.appendChild(document.createTextNode(cur));
        if (rest) { var c = document.createElement('span'); c.className = 'caret'; bubble.appendChild(c); timer = setTimeout(tick, 22); }
      })();
    }
    petals.forEach(function (p) {
      function toggle() { var k = p.dataset.k; pick[k] = !pick[k]; p.setAttribute('aria-checked', pick[k] ? 'true' : 'false'); render(); }
      p.addEventListener('click', toggle);
      p.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } });
    });
    function buildWeek() {
      week.innerHTML = [0, 1, 2, 3, 4, 5, 6].map(function (d) {
        return '<button type="button" class="day" role="radio" aria-checked="' + (day === d) + '" data-d="' + d + '"' + (H[d] ? '' : ' disabled') + '>' + (he() ? shortHe[d] : shortEn[d]) + '<small class="num" dir="ltr">' + (H[d] ? (d === 5 ? (he() ? 'עד 15:30' : '–15:30') : hhmm(H[d][0])) : (he() ? 'סגור' : 'closed')) + '</small></button>';
      }).join('');
      $$('.day', week).forEach(function (b) { b.addEventListener('click', function () { var d = +b.dataset.d; day = day === d ? null : d; $$('.day', week).forEach(function (x) { x.setAttribute('aria-checked', String(+x.dataset.d === day)); }); render(); }); });
    }
    // start with a gentle example: a pedicure on the next open day
    var n = now(); for (var k = 0; k < 7; k++) { var dd = (n.d + k) % 7; if (H[dd] && dd !== 5 && (k > 0 || n.h < H[dd][1])) { day = dd; break; } }
    pick.pedi = true; $('.petal[data-k="pedi"]').setAttribute('aria-checked', 'true');
    buildWeek(); render(true);
    watch($('.cp-phone'), function (v) { if (v && !seen) { seen = true; typed = ''; render(); } }, { threshold: .4 });
    langers.push(function () { buildWeek(); typed = ''; render(true); });
  })();

  /* ---------- footer: a curtain, the number rises, leaves fall ---------- */
  var curtain = $('[data-curtain]'), foot = $('[data-foot]');
  function curtainSize() {
    var fits = foot.offsetHeight <= innerHeight;
    var on = !still() && fits;
    curtain.classList.toggle('on', on);
    curtain.style.setProperty('--fh', on ? foot.offsetHeight + 'px' : 'auto');
  }
  var fall = (function () {
    var cv = $('[data-fall]'), c = cv.getContext && cv.getContext('2d'), L = [], w = 0, h = 0, raf = 0, vis = false;
    if (!c) return { size: function () {} };
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = foot.clientWidth; h = foot.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); L = []; for (var i = 0; i < (phone() ? 10 : 22); i++) L.push({ x: Math.random() * w, y: Math.random() * h, s: 8 + Math.random() * 12, v: .2 + Math.random() * .35, r: Math.random() * 6.28, vr: (Math.random() - .5) * .012, ph: Math.random() * 6, rose: Math.random() < .35 }); }
    function leaf(s) { c.beginPath(); c.moveTo(0, s); c.bezierCurveTo(-s * .7, s * .4, -s * .6, -s * .6, 0, -s); c.bezierCurveTo(s * .6, -s * .6, s * .7, s * .4, 0, s); c.fill(); }
    function frame(t) {
      raf = 0; c.clearRect(0, 0, w, h); if (!vis || still()) return;
      L.forEach(function (p) { p.y += p.v; p.x += Math.sin(t / 1800 + p.ph) * .4; p.r += p.vr; if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; }
        c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.rose ? 'rgba(242,191,203,.22)' : 'rgba(211,217,180,.2)'; leaf(p.s); c.restore(); });
      raf = requestAnimationFrame(frame);
    }
    watch(curtain, function (v) { vis = v; if (v && !raf) raf = requestAnimationFrame(frame); });
    refreshers.push(function () { if (!raf && vis) raf = requestAnimationFrame(frame); });
    return { size: size };
  })();

  /* ---------- scroll loop ---------- */
  var ticking = false;
  function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(function () { ticking = false; navTick(); windowTick(); chapterTick(); tiltScroll(); }); }
  addEventListener('scroll', onScroll, { passive: true });
  var rt = 0;
  addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { dust.size(); fall.size(); curtainSize(); onScroll(); }, 120); });
  refreshers.push(function () { curtainSize(); onScroll(); arc.kick(); });

  texts(); motionUI(); navTick(); windowTick(); chapterTick(); fall.size(); curtainSize();
  if (photoTile && still()) photoTile.classList.add('in');
  requestAnimationFrame(function () { setTimeout(function () { root.classList.add('ready'); }, 60); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { curtainSize(); onScroll(); });
})();
