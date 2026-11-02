/* Chika Spa & Beauty — demo behaviour */
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang !== 'en'; };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var store = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };
  var WA = 'https://wa.me/972533575331';

  /* ---------- language ---------- */
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr'; store('chika-lang', l);
    var u = new URL(location.href); if (l === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang');
    history.replaceState(null, '', u);
    renderHours(); renderComposer(false); fitCall();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  /* ---------- motion switch ---------- */
  var mt = $('[data-motion-toggle]');
  function syncMotion() { mt.setAttribute('aria-checked', still() ? 'false' : 'true'); }
  mt.addEventListener('click', function () {
    root.classList.toggle('still'); store('chika-motion', still() ? 'off' : 'on'); syncMotion();
    if (still()) { $$('[data-rv]').forEach(function (e) { e.classList.add('in'); }); stopPetals(); }
    else startPetals();
    hairs(still() ? 1 : browP()); frame();
  });
  syncMotion();

  /* ---------- hours + live status (Asia/Jerusalem) ---------- */
  var HOURS = [[8, 22], [8, 22], [8, 22], [8, 22], [8, 22], [8, 16], null]; // Sun..Sat, null = closed
  var DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function nowIL() {
    var p = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
    var d = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday);
    return { d: d, h: (+o.hour % 24) + (+o.minute) / 60 };
  }
  function nextOpen(n) {
    for (var i = 0; i < 8; i++) {
      var d = (n.d + i) % 7, h = HOURS[d];
      if (h && (i > 0 || n.h < h[0])) return { i: i, d: d, at: h[0] };
    }
    return null;
  }
  function renderHours() {
    var n = nowIL(), h = HOURS[n.d], open = h && n.h >= h[0] && n.h < h[1], txt;
    if (open) txt = he() ? 'פתוח עכשיו · עד ' + h[1] + ':00' : 'Open now · until ' + h[1] + ':00';
    else {
      var x = nextOpen(n);
      if (!x) txt = he() ? 'סגור כרגע' : 'Closed now';
      else if (x.i === 0) txt = he() ? 'סגור · נפתח היום ב־' + x.at + ':00' : 'Closed · opens today at ' + x.at + ':00';
      else if (x.i === 1) txt = he() ? 'סגור · נפתח מחר ב־' + x.at + ':00' : 'Closed · opens tomorrow at ' + x.at + ':00';
      else txt = he() ? 'סגור · נפתח ביום ' + DAYS_HE[x.d] + ' ב־' + x.at + ':00' : 'Closed · opens ' + DAYS_EN[x.d] + ' at ' + x.at + ':00';
    }
    $$('[data-status]').forEach(function (s) { s.classList.toggle('open', !!open); s.querySelector('[data-status-text]').textContent = txt; });
    var ul = $('[data-hours]'); ul.innerHTML = '';
    HOURS.forEach(function (hh, d) {
      var li = document.createElement('li'); if (d === n.d) li.className = 'today';
      var a = document.createElement('span'); a.textContent = he() ? 'יום ' + DAYS_HE[d] : DAYS_EN[d];
      var b = document.createElement('span'); b.className = 't'; b.textContent = hh ? hh[0] + ':00–' + hh[1] + ':00' : (he() ? 'סגור' : 'Closed');
      li.appendChild(a); li.appendChild(b); ul.appendChild(li);
    });
  }
  renderHours(); setInterval(renderHours, 60000);

  /* ---------- composer: swatch fan + bracelet of days + time tray ---------- */
  var SVC = {
    mani: ['מניקור', 'a manicure'], pedi: ['פדיקור', 'a pedicure'], gel: ['ג׳ל לק', 'gel polish'],
    ext: ['בניית ציפורניים', 'nail extensions'], brows: ['איפור קבוע לגבות', 'permanent brows'], laser: ['הסרת שיער בלייזר', 'laser hair removal']
  };
  var PARTS = [['בבוקר', 'morning', 8, 12], ['בצהריים', 'midday', 12, 16], ['בערב', 'evening', 16, 22]];
  var BEAD = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], BEAD_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  var pick = { svc: 'gel', day: -1, part: -1 };
  var daysEl = $('[data-days]'), partsEl = $('[data-parts]'), msgEl = $('[data-msg]'), sendEl = $('[data-send]');
  (function () { var n = nowIL(), x = nextOpen({ d: n.d, h: 99 }); pick.day = x ? x.d : 0; })();
  function radio(el, on) { el.setAttribute('aria-checked', on ? 'true' : 'false'); }
  function msgText() {
    var s = SVC[pick.svc], d = pick.day, p = PARTS[pick.part];
    if (he()) return 'היי צ׳יקה, אשמח לקבוע תור ל' + s[0] + ' ביום ' + DAYS_HE[d] + (p ? ' ' + p[0] : '') + '. תודה!';
    return 'Hi Chika, I’d like to book ' + s[1] + ' on ' + DAYS_EN[d] + (p ? ' in the ' + p[1] : '') + '. Thank you!';
  }
  var typeT = 0;
  function renderComposer(animate) {
    daysEl.innerHTML = ''; partsEl.innerHTML = '';
    HOURS.forEach(function (h, d) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'bead'; b.setAttribute('role', 'radio');
      b.textContent = he() ? BEAD[d] : BEAD_EN[d];
      b.setAttribute('aria-label', (he() ? 'יום ' + DAYS_HE[d] : DAYS_EN[d]) + (h ? '' : he() ? ' (סגור)' : ' (closed)'));
      if (!h) b.disabled = true; radio(b, d === pick.day);
      b.addEventListener('click', function () { pick.day = d; if (pick.part === 2 && HOURS[d][1] <= 16) pick.part = -1; renderComposer(true); });
      daysEl.appendChild(b);
    });
    PARTS.forEach(function (p, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'slot'; b.setAttribute('role', 'radio');
      b.textContent = he() ? p[0].replace(/^ב/, '') : p[1][0].toUpperCase() + p[1].slice(1);
      var h = HOURS[pick.day]; if (!h || p[2] >= h[1]) b.disabled = true;
      radio(b, i === pick.part);
      b.addEventListener('click', function () { pick.part = pick.part === i ? -1 : i; renderComposer(true); });
      partsEl.appendChild(b);
    });
    $$('.stick').forEach(function (s) { radio(s, s.dataset.svc === pick.svc); });
    var t = msgText();
    sendEl.href = WA + '?text=' + encodeURIComponent(t);
    clearInterval(typeT);
    if (!animate || still()) { msgEl.textContent = t; return; }
    var i = 0; msgEl.textContent = '';
    var caret = document.createElement('span'); caret.className = 'caret';
    typeT = setInterval(function () {
      i = Math.min(t.length, i + 2); msgEl.textContent = t.slice(0, i); msgEl.appendChild(caret);
      if (i >= t.length) { clearInterval(typeT); setTimeout(function () { if (caret.parentNode) caret.remove(); }, 900); }
    }, 22);
  }
  $$('.stick').forEach(function (s) { s.addEventListener('click', function () { pick.svc = s.dataset.svc; renderComposer(true); }); });
  $$('[data-pick]').forEach(function (a) { a.addEventListener('click', function () { pick.svc = a.dataset.pick; renderComposer(true); }); });
  renderComposer(false);

  /* ---------- odometer ---------- */
  $$('[data-odo]').forEach(function (o) {
    o.textContent = '';
    o.dataset.odo.split('').forEach(function (ch) {
      if (!/\d/.test(ch)) { var t = document.createElement('b'); t.dataset.n = ch; t.className = 'dot'; t.style.fontWeight = 'inherit'; o.appendChild(t); return; }
      var col = document.createElement('span'); col.className = 'col';
      var s = document.createElement('span');
      for (var k = 0; k <= 9 + +ch; k++) { var b = document.createElement('b'); b.dataset.n = k % 10; s.appendChild(b); }
      s.dataset.to = 9 + +ch; col.appendChild(s); o.appendChild(col);
    });
  });
  function rollOdo(on) { $$('[data-odo] .col > span').forEach(function (s) { s.style.transform = on ? 'translateY(-' + s.dataset.to + 'em)' : 'none'; }); }
  if (still()) rollOdo(true);

  /* ---------- drift: duplicate the row for a seamless loop ---------- */
  var drift = $('[data-drift]'); drift.innerHTML += drift.innerHTML;
  $$('p', drift).slice(3).forEach(function (p) { p.setAttribute('aria-hidden', 'true'); });

  /* ---------- reveals ---------- */
  var rvSel = ['.case-h', '.row', '.field .note', '.interlock', '.sec-h', '.sub', '.fan', '.compose', '.score', '.q-lead', '.q-c', '.card', '.tile', '.foot-top'];
  $$(rvSel.join(',')).forEach(function (e, i) { e.setAttribute('data-rv', ''); e.style.setProperty('--d', (i % 3) * 80 + 'ms'); });
  if ('IntersectionObserver' in window && !still()) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('[data-rv]').forEach(function (e) { io.observe(e); });
    var oo = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { rollOdo(true); oo.disconnect(); } }); }, { threshold: .4 });
    oo.observe($('.score'));
  } else { $$('[data-rv]').forEach(function (e) { e.classList.add('in'); }); rollOdo(true); }

  /* ---------- brow: hair strokes draw the real brow in (microblading) ---------- */
  var hairG = $('[data-hairs]'), mfill = $('.mfill'), HAIRS = [];
  (function () {
    var P = [[120, 180], [300, 112], [480, 186], [625, 330], [708, 560]];
    function pt(t) { // Catmull-Rom through P
      var n = P.length - 1, f = t * n, i = Math.min(n - 1, Math.floor(f)), u = f - i;
      var p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n, i + 2)];
      function c(k) { return .5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u * u + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u * u * u); }
      return [c(0), c(1)];
    }
    var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    var ns = 'http://www.w3.org/2000/svg';
    for (var k = 0; k < 110; k++) {
      var t = k / 110, a = pt(t), b = pt(Math.min(1, t + .01));
      var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
      var nx = -dy, ny = dx, off = (rnd() - .5) * (90 - t * 50);
      var x = a[0] + nx * off, y = a[1] + ny * off;
      var ang = Math.atan2(dy, dx) - (.45 - t * .35), len = 70 + rnd() * 50;
      var l = document.createElementNS(ns, 'path');
      l.setAttribute('d', 'M' + (x - Math.cos(ang) * len * .5).toFixed(1) + ' ' + (y - Math.sin(ang) * len * .5).toFixed(1) + ' q ' + (Math.cos(ang) * len * .5 - Math.sin(ang) * 8).toFixed(1) + ' ' + (Math.sin(ang) * len * .5 + Math.cos(ang) * 8).toFixed(1) + ' ' + (Math.cos(ang) * len).toFixed(1) + ' ' + (Math.sin(ang) * len).toFixed(1));
      l.setAttribute('stroke-width', (14 + rnd() * 10).toFixed(1));
      l.setAttribute('pathLength', '1'); l.style.strokeDasharray = '1'; l.style.strokeDashoffset = '1';
      hairG.appendChild(l); HAIRS.push(l);
    }
  })();
  var browPanel = $('[data-strokes]');
  function browP() { var r = browPanel.getBoundingClientRect(), vh = innerHeight; return clamp((vh - r.top) / (vh * .95), 0, 1); }
  function hairs(p) {
    var n = HAIRS.length;
    HAIRS.forEach(function (l, i) { var s = i / n * .7; l.style.strokeDashoffset = (1 - clamp((p - s) / .2, 0, 1)).toFixed(3); });
    mfill.setAttribute('fill-opacity', clamp((p - .86) / .14, 0, 1).toFixed(3));
  }
  hairs(still() ? 1 : 0);

  /* ---------- hero ring: their photos dealt into a turning ring ---------- */
  var ring = $('[data-ring]'), cards = $$('.rc', ring), N = cards.length;
  var theta = 0, vel = 0, drag = null, dealStart = performance.now(), lastT = performance.now(), scrollTurn = 0;
  function layoutRing(now) {
    var w = ring.clientWidth, R = w * .36, deal = still() ? 1 : clamp((now - dealStart - 150) / 1300, 0, 1);
    var e = 1 - Math.pow(1 - deal, 3);
    cards.forEach(function (c, i) {
      var a = theta + scrollTurn + i / N * Math.PI * 2, z = Math.cos(a), x = Math.sin(a) * R;
      var sc = .62 + .38 * (z + 1) / 2, op = .45 + .55 * (z + 1) / 2, rot = Math.sin(a) * -10;
      // dealt: from a tight stacked deck at centre-bottom, fanning out in order
      var d = clamp(e * N - (N - 1 - i) * .6, 0, 1); d = d * d * (3 - 2 * d);
      var dx = (1 - d) * (i - 2) * 6, dy = (1 - d) * 120, drot = (1 - d) * (i - 2) * 7;
      c.style.transform = 'translate(-50%,-50%) translate3d(' + (x * d + dx).toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0) rotate(' + (rot * d + drot).toFixed(2) + 'deg) scale(' + (sc * d + .7 * (1 - d)).toFixed(3) + ')';
      c.style.opacity = (op * d + (1 - d)).toFixed(3);
      c.style.zIndex = Math.round((z * d + (1 - d) * i / N) * 100) + 200;
      c.style.setProperty('--gx', (.5 + Math.sin(a) * .6).toFixed(3));
    });
  }
  ring.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, t: theta }; vel = 0; });
  addEventListener('pointermove', function (e) { if (!drag) return; var nt = drag.t + (e.clientX - drag.x) / 220; vel = nt - theta; theta = nt; if (still()) frame(); });
  addEventListener('pointerup', function () { drag = null; });
  addEventListener('pointercancel', function () { drag = null; });

  /* ---------- gloss follows the hand on desktop ---------- */
  var gx = .5;
  if (matchMedia('(hover:hover)').matches) addEventListener('pointermove', function (e) { gx = e.clientX / innerWidth; });

  /* ---------- bento spotlight ---------- */
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', e.clientX - r.left + 'px'); t.style.setProperty('--my', e.clientY - r.top + 'px'); });
    t.addEventListener('pointerleave', function () { t.style.setProperty('--mx', '-300px'); });
  });

  /* ---------- nav pill + ringbar ---------- */
  var nav = $('[data-nav]'), rb = $('[data-ringbar]'), hero = $('[data-hero]');

  /* ---------- scroll-linked frame ---------- */
  var fields = $$('[data-field]'), shots = $$('[data-shot]'), close = $('[data-close]'), nailPanel = $('[data-gloss]');
  function prog(el) { var r = el.getBoundingClientRect(); return clamp((innerHeight - r.top) / (r.height + innerHeight), 0, 1); }
  function frame() {
    var y = scrollY, vh = innerHeight;
    nav.classList.toggle('pill', y > 40);
    rb.classList.toggle('on', y > hero.offsetHeight * .6);
    if (still()) {
      root.style.setProperty('--cp', 1);
      fields.forEach(function (f) { f.style.removeProperty('transform'); f.style.removeProperty('filter'); f.style.removeProperty('visibility'); });
      layoutRing(performance.now());
      return;
    }
    scrollTurn = y / 900;
    var np = prog(nailPanel);
    nailPanel.style.setProperty('--py', np.toFixed(3));
    nailPanel.querySelector('.sheen').style.setProperty('--gx', (1 - np * 1.2 + (gx - .5) * .3).toFixed(3));
    hairs(browP());
    fields.forEach(function (f, i) {
      var r = f.getBoundingClientRect(), p = clamp(1 - r.top / vh, 0, 1.6);
      f.style.setProperty('--fp', p.toFixed(3));
      var nx = fields[i + 1];
      if (nx) { // as the next tray rides up, this one sinks a little: never a gap, the next covers it fully
        var c = clamp(1 - nx.getBoundingClientRect().top / vh, 0, 1);
        f.style.filter = 'brightness(' + (1 - c * .35).toFixed(3) + ')';
        f.style.visibility = c >= 1 && nx.getBoundingClientRect().top <= 0 ? 'hidden' : '';
      }
      var sh = f.querySelector('.sheen'); if (sh) sh.style.setProperty('--gx', (1.1 - p * .8 + (gx - .5) * .3).toFixed(3));
    });
    shots.forEach(function (s) {
      var r = s.parentNode.getBoundingClientRect(), p = clamp(-r.top / (r.height), 0, 1);
      s.style.setProperty('--sp', p.toFixed(3));
      s.querySelector('.sheen').style.setProperty('--gx', (1 - p * 2 + (gx - .5) * .4).toFixed(3));
    });
    var cr = close.getBoundingClientRect();
    root.style.setProperty('--cp', clamp(-cr.top / (cr.height - vh), 0, 1).toFixed(3));
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; frame(); }); } }, { passive: true });
  addEventListener('resize', function () { frame(); fitCall(); });

  /* ring loop: slow turn + inertia (stopped when animations are off) */
  function loop(now) {
    var dt = Math.min(50, now - lastT); lastT = now;
    if (!still()) {
      if (!drag) { theta += vel; vel *= .94; theta += dt * .00012; }
      layoutRing(now);
    }
    requestAnimationFrame(loop);
  addEventListener('load', function () { dealStart = performance.now(); });
  }
  requestAnimationFrame(loop);

  /* ---------- hibiscus petals (from the logo's flower), parting around the hand ---------- */
  var cv = $('[data-petals]'), ctx = cv.getContext('2d'), PET = [], pRun = false, ptr = { x: -999, y: -999 }, dpr = Math.min(2, devicePixelRatio || 1);
  function sizeCv() { cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; }
  function mk(init) {
    var w = cv.clientWidth, h = cv.clientHeight;
    return { x: Math.random() * w, y: init ? Math.random() * h : -30, s: 8 + Math.random() * 16, r: Math.random() * 6.28, vr: (Math.random() - .5) * .02,
      vx: (Math.random() - .5) * .3, vy: .25 + Math.random() * .5, ph: Math.random() * 6.28, hue: Math.random(), glint: Math.random() < .22 };
  }
  function petal(p) {
    ctx.save(); ctx.translate(p.x * dpr, p.y * dpr); ctx.rotate(p.r);
    var s = p.s * dpr, flip = Math.cos(p.ph);
    ctx.scale(1, .45 + .55 * Math.abs(flip));
    if (p.glint) { // the small four-point sparkle from the logo
      ctx.fillStyle = 'rgba(255,230,240,' + (.5 + .5 * Math.abs(flip)) + ')';
      ctx.beginPath(); var g = s * .45;
      ctx.moveTo(0, -g); ctx.quadraticCurveTo(0, 0, g, 0); ctx.quadraticCurveTo(0, 0, 0, g); ctx.quadraticCurveTo(0, 0, -g, 0); ctx.quadraticCurveTo(0, 0, 0, -g); ctx.fill();
    } else {
      var gr = ctx.createLinearGradient(0, -s, 0, s);
      gr.addColorStop(0, p.hue > .5 ? '#ff7fb2' : '#f7b6cf'); gr.addColorStop(.7, p.hue > .5 ? '#d4136a' : '#e0629a'); gr.addColorStop(1, '#8d0c47');
      ctx.fillStyle = gr; ctx.globalAlpha = .85;
      ctx.beginPath(); ctx.moveTo(0, s); ctx.bezierCurveTo(s * .9, s * .4, s * .8, -s * .9, 0, -s * .75); ctx.bezierCurveTo(-s * .8, -s * .9, -s * .9, s * .4, 0, s); ctx.fill();
      ctx.globalAlpha = .35; ctx.strokeStyle = '#ffd6e6'; ctx.lineWidth = dpr; ctx.beginPath(); ctx.moveTo(0, s * .9); ctx.lineTo(0, -s * .4); ctx.stroke();
    }
    ctx.restore();
  }
  function tick() {
    if (!pRun) return;
    var w = cv.clientWidth, h = cv.clientHeight;
    ctx.clearRect(0, 0, cv.width, cv.height);
    var t = performance.now() / 1000;
    PET.forEach(function (p, i) {
      var dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy;
      if (d2 < 16000) { var f = (16000 - d2) / 16000 * .9, d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f * .6; }
      p.vx = p.vx * .96 + Math.sin(t * .7 + p.ph) * .012; p.vy = p.vy * .985 + .012;
      p.x += p.vx; p.y += Math.min(p.vy, 2.2); p.r += p.vr; p.ph += .02;
      if (p.y > h + 30 || p.x < -40 || p.x > w + 40) PET[i] = mk(false);
      petal(p);
    });
    requestAnimationFrame(tick);
  }
  function startPetals() {
    if (pRun || still()) return; sizeCv();
    var n = innerWidth < 700 ? 22 : 40; PET = []; for (var i = 0; i < n; i++) PET.push(mk(true));
    pRun = true; requestAnimationFrame(tick);
  }
  function stopPetals() { pRun = false; ctx.clearRect(0, 0, cv.width, cv.height); }
  hero.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; });
  hero.addEventListener('pointerleave', function () { ptr.x = ptr.y = -999; });
  hero.addEventListener('pointerdown', function (e) { // tap: a little gust from the finger
    var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    PET.forEach(function (p) { var dx = p.x - x, dy = p.y - y, d = Math.hypot(dx, dy) || 1; if (d < 260) { p.vx += dx / d * 4; p.vy += dy / d * 2.5 - 1; } });
  });
  addEventListener('resize', function () { if (pRun) sizeCv(); });
  startPetals();

  /* ---------- footer number fills its width ---------- */
  var cl = $('[data-fit]');
  function fitCall() {
    cl.style.fontSize = ''; var avail = cl.parentNode.clientWidth - 2 * parseFloat(getComputedStyle(cl.parentNode).paddingLeft);
    var fs = parseFloat(getComputedStyle(cl).fontSize), w = cl.scrollWidth;
    if (w > 0) cl.style.fontSize = Math.min(fs * avail / w * .98, 260) + 'px';
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitCall); fitCall();

  frame();
})();
