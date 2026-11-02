(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var io = 'IntersectionObserver' in window;
  var WA = 'https://wa.me/972507791496';

  /* ---------- language ---------- */
  function texts() {
    var l = root.lang;
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $('.nav').setAttribute('aria-label', l === 'he' ? 'ראשי' : 'Main');
    $('.arc').setAttribute('aria-label', l === 'he' ? 'תמונות מהמספרה' : 'Photos from the salon');
    $('.clip').setAttribute('aria-label', l === 'he' ? 'יצירת קשר' : 'Contact');
    $('.c-call').setAttribute('aria-label', l === 'he' ? 'התקשרו לבני' : 'Call Benny');
    $('.drift').setAttribute('aria-label', l === 'he' ? 'עוד ביקורות' : 'More reviews');
    $('.vb.map iframe').title = l === 'he' ? 'מפה: אינטרנציונל 9, חיפה' : 'Map: 9 International St., Haifa';
    $$('[data-cs]').forEach(function (b) { b.setAttribute('aria-label', b.dataset.cs === '1' ? (l === 'he' ? 'הבא' : 'Next') : (l === 'he' ? 'הקודם' : 'Previous')); });
    document.title = l === 'he' ? 'בני עיצוב שיער · נשים, גברים וילדים · אינטרנציונל 9, חיפה' : 'Benny Hair Design · Women, men & kids · 9 International St., Haifa';
    $('[data-wa-hero]').href = WA + '?text=' + encodeURIComponent(l === 'he' ? 'היי בני, אשמח לקבוע תור' : 'Hi Benny, I would like to book an appointment');
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('benny-lang', l); } catch (e) {}
    var u = new URL(location.href); if (l === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang');
    try { history.replaceState(null, '', u); } catch (e) {}
    texts(); status(); hours(); buildTicket(); splitQuote(); if (ring) ring.layout(); cut.size(); onScroll();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  /* ---------- motion switch ---------- */
  var switches = $$('[data-motion]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    root.classList.toggle('still');
    try { localStorage.setItem('benny-motion', still() ? 'off' : 'on'); } catch (e) {}
    motionUI(); applyMotion();
  }); });
  function applyMotion() {
    if (still()) { $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); }); $('.ticket').classList.add('out'); fillAll(); }
    curtain(); onScroll(); if (ring) ring.kick(); snips.kick();
  }

  /* ---------- hours & status (Asia/Jerusalem) ---------- */
  var H = [[10, 19], null, [10, 19], [10, 19], [10, 19], [8, 15], null]; // Sun..Sat, null = closed
  var DAY_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  var DAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'numeric', year: 'numeric', hour12: false })
      .formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, date: new Date(+o.year, +o.month - 1, +o.day) };
  }
  function status() {
    var n = now(), t = H[n.d], open = !!t && n.h >= t[0] && n.h < t[1], txt;
    if (open) txt = he() ? 'פתוח עכשיו · עד ' + hm(t[1]) : 'Open now · until ' + hm(t[1]);
    else {
      var k = 0, d = n.d;
      if (t && n.h < t[0]) k = 0; else { for (k = 1; k < 8; k++) { d = (n.d + k) % 7; if (H[d]) break; } }
      var o = H[d], when = k === 0 ? (he() ? 'היום' : 'today') : k === 1 ? (he() ? 'מחר' : 'tomorrow') : (he() ? 'ביום ' + DAY_HE[d] : 'on ' + DAY_EN[d]);
      txt = he() ? 'סגור עכשיו · נפתח ' + when + ' ב-' + hm(o[0]) : 'Closed now · opens ' + when + ' at ' + hm(o[0]);
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
  }
  function hours() {
    var n = now(), order = [0, 1, 2, 3, 4, 5, 6];
    $('[data-hours]').innerHTML = order.map(function (d) {
      var t = H[d];
      return '<tr class="' + (d === n.d ? 'today ' : '') + (t ? '' : 'closed') + '"><td>' + (he() ? 'יום ' + DAY_HE[d] : DAY_EN[d]) + '</td><td dir="ltr">' + (t ? hm(t[0]) + '–' + hm(t[1]) : (he() ? 'סגור' : 'Closed')) + '</td></tr>';
    }).join('');
  }

  /* ---------- reveals ---------- */
  var rio = io ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { rio && !still() ? rio.observe(el) : el.classList.add('in'); });

  /* ---------- hero headline: seam shut ---------- */
  (function () {
    if (still() || !window.Element.prototype.animate) return;
    $$('.h1 .seam').forEach(function (s) {
      var a = s.querySelector('.a'), b = s.querySelector('.b'), dx = 46;
      a.animate([{ transform: 'translateX(' + dx + 'px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 900, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'both', delay: 60 });
      b.animate([{ transform: 'translateX(' + (-dx) + 'px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 900, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'both', delay: 60 });
    });
  })();

  /* ---------- turning arc of real photos (dealt in on load) ---------- */
  var PH = [
    ['station.jpg', 'בני בעמדה', 'Benny at his station', 0],
    ['shears.jpg', 'תמונה להמחשה', 'Illustrative photo', 1],
    ['woman-cut.jpg', 'תמונה להמחשה', 'Illustrative photo', 1],
    ['sign.jpg', 'השלט ברחוב', 'The street sign', 0],
    ['comb.jpg', 'מסרק ומספריים', 'Comb and scissors', 0],
    ['tools.jpg', 'תמונה להמחשה', 'Illustrative photo', 1],
    ['building.jpg', 'אינטרנציונל 9', '9 International St.', 0],
    ['station.jpg', 'המראה של בני', "Benny's mirror", 0],
    ['tools.jpg', 'תמונה להמחשה', 'Illustrative photo', 1],
    ['comb.jpg', 'רמות רמז', 'Ramot Remez', 0]
  ];
  var ring = (function () {
    var box = $('.ring'), arc = $('.arc'); if (!box) return null;
    var N = PH.length, cards = [], ang = 0, vel = 0, drag = null, t0 = performance.now(), raf = 0, vis = true, tiltX = 0, tx = 0;
    PH.forEach(function (p) {
      var c = document.createElement('div'); c.className = 'card';
      c.innerHTML = '<img src="img/' + p[0] + '" alt="" loading="eager" decoding="async"><span class="lab"><span lang="he">' + p[1] + '</span><span lang="en">' + p[2] + '</span></span>';
      box.appendChild(c); cards.push(c);
    });
    function R() { return Math.max(arc.clientWidth * 0.42, parseFloat(getComputedStyle(cards[0]).width) * 2.2); }
    function layout(time) {
      var r = R(), deal = still() ? 1 : clamp(((time || performance.now()) - t0 - 200) / 1400, 0, 1);
      cards.forEach(function (c, i) {
        var k = still() ? 1 : smooth(clamp(deal * 1.6 - i * 0.06, 0, 1));
        var a = (i / N) * Math.PI * 2 + ang, s = Math.sin(a), co = Math.cos(a);
        var x = s * r * k, z = (co - 1) * r * 0.55 * k, y = (1 - co) * -18 * k;
        var lit = clamp((co + 0.2) / 1.2, 0, 1);
        c.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotateY(' + (s * -26 * k).toFixed(2) + 'deg)';
        c.style.opacity = (k * clamp(co * 0.9 + 0.55, 0, 1)).toFixed(3);
        c.style.filter = 'brightness(' + (0.42 + 0.58 * lit).toFixed(3) + ')';
        c.style.zIndex = Math.round(co * 100) + 100;
      });
      box.style.transform = 'rotateX(' + (-6 + tiltX).toFixed(2) + 'deg) translateX(' + tx.toFixed(1) + 'px)';
    }
    var last = performance.now();
    function frame(time) {
      raf = 0; var dt = Math.min(64, time - last); last = time;
      if (!drag) { vel *= 0.94; ang += (0.00011 + vel) * dt; }
      layout(time);
      if (vis && !still()) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still()) { last = performance.now(); raf = requestAnimationFrame(frame); } else if (still()) layout(); }
    arc.addEventListener('pointerdown', function (e) { if (still()) return; drag = { x: e.clientX, a: ang, t: performance.now() }; try { arc.setPointerCapture(e.pointerId); } catch (er) {} });
    arc.addEventListener('pointermove', function (e) {
      if (drag) { var dx = e.clientX - drag.x; var na = drag.a + dx / R(); vel = (na - ang) / 16; ang = na; }
    });
    var end = function () { drag = null; };
    arc.addEventListener('pointerup', end); arc.addEventListener('pointercancel', end);
    $('.hero').addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return; var r = this.getBoundingClientRect();
      tiltX = ((e.clientY - r.top) / r.height - 0.5) * -6; tx = ((e.clientX - r.left) / r.width - 0.5) * -24;
    });
    if (io) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; kick(); }).observe($('.hero'));
    return { kick: kick, layout: function () { layout(); } };
  })();

  /* ---------- hair snips: drifting strands + logo stars in the hero; burst at the scissors ---------- */
  var HAIR = ['#8a5a3c', '#c79a6b', '#e6c99b', '#5b3a29', '#b9b3ae', '#a0522d', '#d9b38c'];
  function Snips(cv, host, ambient) {
    var c = cv.getContext('2d'), P = [], w = 0, h = 0, raf = 0, vis = true, px = -999, py = -999, last = 0;
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = host.clientWidth; h = host.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function strand(x, y, burst) {
      return { x: x, y: y, vx: burst ? (Math.random() - 0.5) * 1.6 : (Math.random() - 0.5) * 0.15, vy: burst ? -Math.random() * 1.2 : 0.18 + Math.random() * 0.35,
        a: Math.random() * 6.28, va: (Math.random() - 0.5) * 0.03, L: 10 + Math.random() * (burst ? 18 : 30), bend: (Math.random() - 0.5) * 0.9,
        col: HAIR[(Math.random() * HAIR.length) | 0], lw: 0.7 + Math.random() * 0.9, life: 1, g: burst ? 0.05 : 0, star: !burst && Math.random() < 0.12 };
    }
    function seed() { P = []; if (!ambient) return; var n = Math.round(clamp(w * h / 16000, 26, 90)); for (var i = 0; i < n; i++) P.push(strand(Math.random() * w, Math.random() * h, false)); }
    function star(p) {
      c.save(); c.translate(p.x, p.y); c.rotate(p.a * 0.3); var s = 4 + p.L * 0.12, tw = 0.45 + 0.55 * Math.abs(Math.sin(p.a * 2));
      c.globalAlpha = tw * 0.8; c.strokeStyle = '#f4c9b8'; c.lineWidth = 1; c.beginPath();
      for (var i = 0; i < 10; i++) { var r = i % 2 ? s * 0.45 : s, t = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(Math.cos(t) * r, Math.sin(t) * r); }
      c.closePath(); c.stroke(); c.restore();
    }
    function frame(t) {
      raf = 0; var dt = Math.min(3, (t - (last || t)) / 16.7) || 1; last = t;
      c.clearRect(0, 0, w, h);
      for (var i = P.length - 1; i >= 0; i--) {
        var p = P[i];
        if (ambient && px > -900) { var dx = p.x - px, dy = p.y - py, d2 = dx * dx + dy * dy; if (d2 < 9000) { var f = (1 - d2 / 9000) * 0.6; p.vx += dx / Math.sqrt(d2 + 1) * f; p.vy += dy / Math.sqrt(d2 + 1) * f * 0.5; } }
        p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt; p.vx *= 0.985; if (ambient) p.vy = p.vy * 0.985 + 0.004;
        if (!ambient) { p.life -= 0.006 * dt; if (p.life <= 0 || p.y > h + 40) { P.splice(i, 1); continue; } }
        else if (p.y > h + 30) { p.y = -30; p.x = Math.random() * w; p.vy = 0.18 + Math.random() * 0.35; }
        if (p.star) { star(p); continue; }
        var cx = Math.cos(p.a) * p.L / 2, sy = Math.sin(p.a) * p.L / 2;
        c.globalAlpha = ambient ? 0.55 : p.life; c.strokeStyle = p.col; c.lineWidth = p.lw; c.lineCap = 'round';
        c.beginPath(); c.moveTo(p.x - cx, p.y - sy); c.quadraticCurveTo(p.x + sy * p.bend, p.y - cx * p.bend, p.x + cx, p.y + sy); c.stroke();
      }
      c.globalAlpha = 1;
      if (vis && !still() && (ambient || P.length)) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && vis && !still()) { last = 0; raf = requestAnimationFrame(frame); } if (still()) c.clearRect(0, 0, w, h); }
    if (ambient) {
      host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
      host.addEventListener('pointerleave', function () { px = py = -999; });
    }
    if (io) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; kick(); }).observe(host);
    size(); seed();
    return { size: function () { size(); seed(); }, kick: kick, burst: function (x, y, n) { if (still()) return; for (var i = 0; i < n; i++) P.push(strand(x + (Math.random() - 0.5) * 14, y + (Math.random() - 0.5) * 8, true)); kick(); } };
  }
  var snips = Snips($('.hero canvas'), $('.hero'), true);
  snips.kick();

  /* ---------- the cut: scissors cut Benny's station photo and the halves part to show the next photo ---------- */
  var cut = (function () {
    var track = $('.cut-track'), stage = $('.cut-stage'), glass = $('.glass'), sheen = $('.sheen'), gx = 0, gy = 0, top = $('.cut-half.top'), bot = $('.cut-half.bot'),
      path = $('.cut-svg path'), sc = $('.scissors'), under = $('.cut-under img'), c1 = $('.cut-copy .c1'), c2 = $('.cut-copy .c2'),
      blA = $('.bl-a', sc), blB = $('.bl-b', sc), fx = Snips($('.cut-stage canvas'), stage, false), W = 0, Hh = 0, lastC = 0;
    var yAt = function (u) { return 0.47 + 0.05 * Math.sin(u * Math.PI * 2.3 + 0.6) + (u - 0.5) * 0.1; }; // u: 0..1 from left
    var STEPS = 28;
    function polys() {
      var pts = []; for (var i = 0; i <= STEPS; i++) { var u = i / STEPS; pts.push([u * 100, yAt(u) * 100]); }
      var upper = pts.map(function (p) { return p[0].toFixed(2) + '% ' + (p[1] + 0.25).toFixed(2) + '%'; }); // 0.25% overlap: no hairline seam
      var lower = pts.map(function (p) { return p[0].toFixed(2) + '% ' + (p[1] - 0.25).toFixed(2) + '%'; });
      top.style.clipPath = 'polygon(0% 0%, 100% 0%, ' + upper.slice().reverse().join(', ') + ')';
      bot.style.clipPath = 'polygon(' + lower.join(', ') + ', 100% 100%, 0% 100%)';
    }
    function pathD() {
      var rtl = root.dir === 'rtl', d = '';
      for (var i = 0; i <= STEPS; i++) { var u = rtl ? 1 - i / STEPS : i / STEPS; d += (i ? ' L' : 'M') + (u * 1000).toFixed(1) + ' ' + (yAt(u) * 1000).toFixed(1); }
      path.setAttribute('d', d);
    }
    function size() { W = glass.clientWidth; Hh = glass.clientHeight; var g = glass.getBoundingClientRect(), s0 = stage.getBoundingClientRect(); gx = g.left - s0.left; gy = g.top - s0.top; fx.size(); pathD(); polys(); }
    function set(p) {
      var rtl = root.dir === 'rtl';
      var cP = smooth((p - 0.14) / 0.42), sP = smooth((p - 0.58) / 0.24);
      var push = 1.1 - 0.08 * smooth(p / 0.58);
      [top, bot].forEach(function (h) { h.firstElementChild.style.transform = 'scale(' + push.toFixed(4) + ')'; });
      under.style.transform = 'scale(' + (1.16 - 0.12 * smooth((p - 0.55) / 0.45)).toFixed(4) + ') translateX(' + ((rtl ? 1 : -1) * 2 * smooth((p - 0.55) / 0.45)).toFixed(2) + '%)';
      path.style.strokeDashoffset = (1 - cP).toFixed(4);
      path.style.opacity = (1 - sP).toFixed(3);
      top.style.transform = 'translateY(' + (-sP * 62).toFixed(2) + '%) rotate(' + (-sP * 3).toFixed(2) + 'deg)';
      bot.style.transform = 'translateY(' + (sP * 72).toFixed(2) + '%) rotate(' + ((rtl ? -1 : 1) * sP * 4).toFixed(2) + 'deg)';
      top.style.transformOrigin = rtl ? '100% 100%' : '0% 100%'; bot.style.transformOrigin = rtl ? '0% 0%' : '100% 0%';
      var u = rtl ? 1 - cP : cP, x = u * W, y = yAt(u) * Hh, sw = sc.offsetWidth, open = Math.abs(Math.sin(cP * Math.PI * 9)) * 15;
      var slope = (yAt(Math.min(1, u + 0.01)) - yAt(Math.max(0, u - 0.01))) * Hh / (0.02 * W), rot = Math.atan(slope) * 57.3;
      sc.style.opacity = (cP > 0.001 && cP < 0.999 ? 1 : 0) * (1 - sP);
      sc.style.transform = 'translate(' + (x + glass.offsetLeft - (rtl ? sw * 0.02 : sw * 0.98)).toFixed(1) + 'px,' + (y + glass.offsetTop - sw * 0.225).toFixed(1) + 'px) scaleX(' + (rtl ? -1 : 1) + ') rotate(' + ((rtl ? -1 : 1) * rot).toFixed(2) + 'deg)';
      sc.style.transformOrigin = (rtl ? '2% 50%' : '98% 50%');
      blA.setAttribute('transform', 'rotate(' + (-open).toFixed(2) + ' 95 45)'); blB.setAttribute('transform', 'rotate(' + open.toFixed(2) + ' 95 45)');
      if (cP > lastC + 0.004 && cP < 0.999) fx.burst(gx + x, gy + y, 3);
      sheen.style.setProperty('--sx', (-60 + 120 * smooth(p / 0.5)).toFixed(1) + '%');
      lastC = cP;
      var o1 = 1 - smooth((p - 0.5) / 0.1), o2 = smooth((p - 0.64) / 0.12);
      c1.style.opacity = o1.toFixed(3); c1.style.transform = 'translateY(' + (-(1 - o1) * 30).toFixed(1) + 'px)';
      c2.style.opacity = o2.toFixed(3); c2.style.transform = 'translateY(' + ((1 - o2) * 30).toFixed(1) + 'px)';
      c1.style.visibility = o1 < 0.01 ? 'hidden' : 'visible'; c2.style.visibility = o2 < 0.01 ? 'hidden' : 'visible';
    }
    function update() {
      if (still()) return;
      var r = track.getBoundingClientRect(), span = track.offsetHeight - innerHeight;
      set(clamp(-r.top / span, 0, 1));
    }
    size();
    return { size: size, update: update, set: set };
  })();

  /* still-mode stepper for the cut */
  (function () {
    var figs = $$('.cs-view figure'), i = 0, dots = $$('[data-cs-i]');
    function go(n) { i = (n + figs.length) % figs.length; figs.forEach(function (f, k) { f.classList.toggle('on', k === i); }); dots.forEach(function (d, k) { d.setAttribute('aria-pressed', k === i ? 'true' : 'false'); }); }
    $$('[data-cs]').forEach(function (b) { b.addEventListener('click', function () { go(i + (+b.dataset.cs)); }); });
    dots.forEach(function (d) { d.addEventListener('click', function () { go(+d.dataset.csI); }); });
  })();

  /* ---------- bento: cursor spotlight, colour wefts, face shapes ---------- */
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); t.classList.add('lit'); });
    t.addEventListener('pointerleave', function () { t.classList.remove('lit'); });
  });
  (function wefts() {
    var svg = $('.wefts'); if (!svg) return;
    var cols = [['#2b1a14', '#4a2e22'], ['#5b3a29', '#7b5038'], ['#8a5a3c', '#ad7a52'], ['#a0522d', '#c4703f'], ['#c79a6b', '#e2bb8a'], ['#e6c99b', '#f6e3c0'], ['#9c2a35', '#c94450']];
    var s = '<path d="M40 34 Q150 6 260 34" stroke="#c9cdd3" stroke-width="5" fill="none" stroke-linecap="round"/>';
    cols.forEach(function (c, i) {
      var x = 58 + i * 31, a = (i - 3) * 6;
      s += '<g class="weft" style="--a:' + a + 'deg;animation-delay:' + (-i * 0.6) + 's"><rect x="' + (x - 10) + '" y="' + (26 - Math.abs(i - 3) * 1.4) + '" width="20" height="9" rx="3" fill="#2a2023"/>';
      for (var k = 0; k < 7; k++) {
        var ox = x - 8 + k * 2.6, len = 150 + (k % 3) * 8 - Math.abs(i - 3) * 4, bend = (k - 3) * 1.6;
        s += '<path d="M' + ox + ' 34 C' + (ox + bend) + ' 90 ' + (ox - bend) + ' 140 ' + (ox + bend * 0.6) + ' ' + (34 + len) + '" stroke="' + (k % 2 ? c[1] : c[0]) + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
      }
      s += '<path d="M' + (x - 2) + ' 40 C' + (x - 1) + ' 90 ' + (x - 3) + ' 130 ' + (x - 1) + ' 170" stroke="#fff" stroke-opacity=".28" stroke-width="1.2" fill="none"/></g>';
    });
    svg.innerHTML = s;
  })();
  (function faces() {
    var f = $$('.face'), i = 0;
    setInterval(function () { if (still() || document.hidden) return; f[i].classList.remove('on'); i = (i + 1) % f.length; f[i].classList.add('on'); }, 2200);
  })();

  /* ---------- reviews: letter fill, odometer, stars ---------- */
  var chars = [];
  function splitQuote() {
    var q = $('[data-fill]'); if (!q) return;
    $$('span[lang]', q).forEach(function (sp) {
      if (!sp.dataset.raw) sp.dataset.raw = sp.textContent.trim();
      sp.innerHTML = sp.dataset.raw.split(' ').map(function (w) { return '<span style="white-space:nowrap">' + w.split('').map(function (ch) { return '<span class="ch">' + ch + '</span>'; }).join('') + '</span>'; }).join(' ');
    });
    chars = $$('span[lang="' + root.lang + '"] .ch', q);
    if (still()) fillAll();
  }
  function fillAll() { $$('.quote .ch').forEach(function (c) { c.classList.add('f'); }); }
  function fillUpdate() {
    if (still() || !chars.length) return;
    var r = $('[data-fill]').getBoundingClientRect(), p = clamp((innerHeight * 0.92 - r.top) / (innerHeight * 0.55), 0, 1), n = Math.round(p * chars.length);
    chars.forEach(function (c, i) { c.classList.toggle('f', i < n); });
  }
  (function gauge() {
    var gs = $('.g-stars'); if (!gs) return;
    gs.innerHTML = [0, 1, 2, 3, 4].map(function (i) {
      var fill = clamp(4.8 - i, 0, 1);
      return '<svg viewBox="0 0 24 24" style="color:#eaa48d"><defs><clipPath id="sc' + i + '"><rect width="' + (24 * fill) + '" height="24"/></clipPath></defs><use href="#i-star"/><g clip-path="url(#sc' + i + ')"><use href="#i-starf"/></g></svg>';
    }).join('');
    $$('.odo').forEach(function (o) { o.textContent = o.dataset.to; });
    var roll = function () {
      if (still()) return;
      $$('.odo').forEach(function (o) {
        var to = +o.dataset.to, col = document.createElement('span'), n = 10 + to;
        col.setAttribute('aria-hidden', 'true');
        for (var d = 0; d <= n; d++) { var sp = document.createElement('span'); sp.textContent = d % 10; col.appendChild(sp); }
        o.textContent = ''; o.appendChild(col);
        requestAnimationFrame(function () { requestAnimationFrame(function () { col.style.transform = 'translateY(' + (-n * 1.1).toFixed(2) + 'em)'; }); });
        col.addEventListener('transitionend', function () { o.textContent = to; });
      });
    };
    if (still() || !io) roll(); else new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(); ob.disconnect(); } }, { threshold: 0.4 }).observe($('.gauge'));
  })();

  /* ---------- the appointment card (punch-hole composer) ---------- */
  var OPT = {
    who: [['me', 'בשבילי', 'For me'], ['kid', 'בשביל הילד/ה', 'For my child']],
    what: [['cut', 'תספורת', 'A haircut'], ['hl', 'גוונים', 'Highlights'], ['beard', 'סידור זקן', 'A beard trim'], ['ask', 'רק להתייעץ', 'Just advice']]
  };
  var sel = { who: 'me', what: 'cut', day: null };
  function days() {
    var n = now(), out = [];
    for (var k = 0; out.length < 5 && k < 14; k++) {
      var d = (n.d + k) % 7, t = H[d]; if (!t) continue; if (k === 0 && n.h >= t[1] - 0.5) continue;
      var dt = new Date(n.date.getTime()); dt.setDate(dt.getDate() + k);
      var dm = dt.getDate() + '.' + (dt.getMonth() + 1);
      out.push([String(k), k === 0 ? (he() ? 'היום' : 'Today') : k === 1 ? (he() ? 'מחר' : 'Tomorrow') : (he() ? DAY_HE[d] + ' ' + dm : DAY_EN[d].slice(0, 3) + ' ' + dm), k === 0 ? (he() ? 'היום' : 'today') : k === 1 ? (he() ? 'מחר' : 'tomorrow') : (he() ? 'ביום ' + DAY_HE[d] + ' (' + dm + ')' : 'on ' + DAY_EN[d] + ' ' + dm)]);
    }
    return out;
  }
  var dayList = [];
  function buildTicket() {
    dayList = days();
    if (!sel.day || !dayList.some(function (d) { return d[0] === sel.day; })) sel.day = dayList[0] && dayList[0][0];
    $$('#ticket [data-group]').forEach(function (g) {
      var key = g.dataset.group, list = key === 'day' ? dayList.map(function (d) { return [d[0], d[1], d[1]]; }) : OPT[key];
      g.innerHTML = list.map(function (o) {
        return '<label class="punch"><input type="radio" name="' + key + '" value="' + o[0] + '"' + (sel[key] === o[0] ? ' checked' : '') + '><span class="hole" aria-hidden="true"></span><span>' + (he() ? o[1] : o[2]) + '</span></label>';
      }).join('');
    });
    msg();
  }
  function msg() {
    var name = $('#t-name').value.trim(), whoI = sel.who === 'kid', d = dayList.filter(function (x) { return x[0] === sel.day; })[0];
    var whatHe = { cut: 'תספורת', hl: 'גוונים', beard: 'סידור זקן', ask: 'ייעוץ' }[sel.what], whatEn = { cut: 'a haircut', hl: 'highlights', beard: 'a beard trim', ask: 'some advice' }[sel.what];
    var t;
    if (he()) t = 'היי בני' + (name ? ', כאן ' + name : '') + '. ' + (sel.what === 'ask' ? 'אשמח להתייעץ איתך' + (whoI ? ' לגבי השיער של הילד/ה שלי' : '') + '.' : 'אשמח לקבוע תור ל' + whatHe + (whoI ? ' לילד/ה שלי' : '') + '.') + (d ? ' נוח לי ' + d[2] + ', אם יש מקום.' : '') + ' תודה!';
    else t = 'Hi Benny' + (name ? ', this is ' + name : '') + '. ' + (sel.what === 'ask' ? 'I would like ' + whatEn + (whoI ? ' about my child\'s hair' : '') + '.' : 'I would like to book ' + whatEn + (whoI ? ' for my child' : '') + '.') + (d ? ' ' + d[2].charAt(0).toUpperCase() + d[2].slice(1) + ' would suit me, if there is a free slot.' : '') + ' Thanks!';
    $('[data-msg]').textContent = t;
    $('[data-send]').href = WA + '?text=' + encodeURIComponent(t);
  }
  $('#ticket').addEventListener('change', function (e) {
    var el = e.target; if (el.type !== 'radio') return; sel[el.name] = el.value; msg();
    if (still() || !Element.prototype.animate) return;
    var hole = el.nextElementSibling, r = hole.getBoundingClientRect(), tk = $('#ticket').getBoundingClientRect(), chad = document.createElement('span');
    chad.className = 'chad'; chad.style.left = (r.left - tk.left) + 'px'; chad.style.top = (r.top - tk.top) + 'px'; $('#ticket').appendChild(chad);
    var dx = (Math.random() - 0.5) * 60;
    chad.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(' + dx + 'px,140px) rotate(' + (dx * 4) + 'deg) scale(.8)', opacity: 0 }], { duration: 700, easing: 'cubic-bezier(.5,0,.75,0)' }).onfinish = function () { chad.remove(); };
  });
  $('#ticket').addEventListener('input', function (e) { if (e.target.id === 't-name') msg(); });
  $('#ticket').addEventListener('submit', function (e) { e.preventDefault(); });
  if (io && !still()) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { $('.ticket').classList.add('out'); ob.disconnect(); } }, { threshold: 0.25 }).observe($('.slot'));
  else $('.ticket').classList.add('out');

  /* ---------- reviews card lands over the bento; closing photo shrinks into its frame ---------- */
  var chairs = $('.chairs'), voices = $('.voices'), sTrack = $('.shrink-track'), sPic = $('.shrink-pic'), sImg = $('.shrink-pic img');
  function seams() {
    if (still()) { chairs.style.transform = voices.style.transform = ''; chairs.style.setProperty('--dim', 0); sPic.style.clipPath = ''; sImg.style.transform = ''; return; }
    var vr = voices.getBoundingClientRect(), k = clamp(1 - vr.top / innerHeight, 0, 1);
    voices.style.transform = 'translateY(' + ((1 - smooth(k * 1.3)) * 60).toFixed(1) + 'px)';
    var under = clamp((innerHeight * 0.5 - vr.top) / (innerHeight * 0.5), 0, 1);
    chairs.style.transform = 'scale(' + (1 - under * 0.05).toFixed(4) + ')';
    chairs.style.setProperty('--dim', (under * 0.5).toFixed(3));
    var sr = sTrack.getBoundingClientRect(), sp = smooth(clamp(-sr.top / (sTrack.offsetHeight - innerHeight), 0, 1));
    var ix = innerWidth < 700 ? 6 : 14, iy = innerWidth < 700 ? 16 : 12;
    sPic.style.clipPath = 'inset(' + (sp * iy).toFixed(2) + '% ' + (sp * ix).toFixed(2) + '% round ' + (sp * 28).toFixed(1) + 'px)';
    sImg.style.transform = 'scale(' + (1.12 - sp * 0.12).toFixed(4) + ')';
  }

  /* ---------- curtain footer ---------- */
  var foot = $('.foot'), mainEl = $('main');
  function curtain() {
    var on = !still() && foot.offsetHeight < innerHeight * 0.9;
    root.classList.toggle('curtain', on);
    mainEl.style.marginBottom = on ? foot.offsetHeight + 'px' : '';
  }
  if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { $('.lightbox').classList.add('on'); ob.disconnect(); } }, { threshold: 0.3 }).observe($('.lightbox'));

  /* ---------- nav pill ---------- */
  var nav = $('.nav');
  function onScroll() {
    nav.classList.toggle('pill', scrollY > 60);
    cut.update(); seams(); fillUpdate();
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; onScroll(); }); } }, { passive: true });
  addEventListener('resize', function () { snips.size(); cut.size(); curtain(); onScroll(); if (ring) ring.layout(); });

  texts(); status(); hours(); buildTicket(); splitQuote(); motionUI(); curtain(); onScroll();
  if (still()) applyMotion();
  setInterval(status, 60000);
})();
