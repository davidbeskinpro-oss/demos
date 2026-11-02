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
  var phone = function () { return innerWidth <= 820; };
  var io = 'IntersectionObserver' in window;
  var PHONE = '972524586522';
  var KH = 'M50 11A34 34 0 0 1 66 75L76 150H24L34 75A34 34 0 0 1 50 11Z';

  /* ---------- language ---------- */
  function texts() {
    var l = root.lang;
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var kc = $('[data-keys] [data-k="clear"]'), ks = $('[data-keys] [data-k="send"]'), kg = $('[data-keys]');
    if (kc) { kc.setAttribute('aria-label', l === 'he' ? 'ניקוי' : 'Clear'); ks.setAttribute('aria-label', l === 'he' ? 'שליחה בוואטסאפ' : 'Send on WhatsApp'); kg.setAttribute('aria-label', l === 'he' ? 'מקלדת המנעול' : 'Lock keypad'); }
    var lb = $('[data-set-lang]'); if (lb) lb.setAttribute('aria-label', l === 'he' ? 'English' : 'עברית');
    $$('[data-wa-plain]').forEach(function (a) { a.href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(l === 'he' ? 'היי רועי, הגעתי מהאתר ואשמח לעזרה.' : 'Hi Roy, I found you through the website and would like some help.'); });
    status(); compose(); layout();
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('hm-lang', l); } catch (e) {}
    var u = new URL(location.href); if (l === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang');
    try { history.replaceState(null, '', u); } catch (e) {}
    texts(); buildChk();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  /* ---------- animations on/off ---------- */
  var sw = $$('[data-motion-toggle]');
  function motionUI() { sw.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  sw.forEach(function (b) { b.addEventListener('click', function () {
    var off = !still(); root.classList.toggle('still', off);
    try { localStorage.setItem('hm-motion', off ? 'off' : 'on'); } catch (e) {}
    motionUI(); $$('[data-tile]').forEach(function (t) { t.classList.add('in'); });
    layout(); onScroll(); buildChk(); startChk();
  }); });
  motionUI();

  /* ---------- intro: keyhole gauge + dealt photos (first visit per session) ---------- */
  var intro = $('[data-intro]'), seen = null;
  try { seen = sessionStorage.getItem('hm-intro'); } catch (e) {}
  function go() { root.classList.add('go'); }
  if (intro && !still() && !seen) {
    intro.classList.add('run');
    try { sessionStorage.setItem('hm-intro', '1'); } catch (e) {}
    var end = function () { intro.classList.add('out'); go(); setTimeout(function () { intro.remove(); }, 480); };
    var t = setTimeout(end, 800);
    addEventListener('pointerdown', function () { clearTimeout(t); end(); }, { once: true });
  } else { if (intro) intro.remove(); go(); }

  /* ---------- hours + live status (Asia/Jerusalem) ---------- */
  var H = [[7, 21], [7, 21], [7, 21], [7, 21], [7, 21], [7, 21], [7, 21]]; // Sun..Sat, null = closed
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  var dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = now(), l = he(), t = H[n.d], txt, open = false;
    if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    var tb = $('[data-hours]');
    if (tb) tb.innerHTML = H.map(function (r, i) {
      return '<tr' + (i === n.d ? ' class="today"' : '') + '><td>' + (l ? 'יום ' + dayHe[i] : dayEn[i]) + '</td><td>' + (r ? hhmm(r[0]) + '–' + hhmm(r[1]) : (l ? 'סגור' : 'Closed')) + '</td></tr>';
    }).join('');
  }
  setInterval(status, 60000);

  /* ---------- hero: the camera goes through the keyhole ---------- */
  var hero = $('[data-hero]'), stage = $('[data-stage]'), pimg = $('[data-photo] img'), photo = $('[data-photo]');
  var khp = $('[data-khp]'), rim = $('[data-rim]'), lid = $('[data-lid]'), copy = $('[data-herocopy]'), sheen = $('[data-sheen]'), phl = $('[data-phlabel]');
  var G = {}; // geometry
  var conceptEl = $('.concept'), nav = $('[data-nav]');
  function conceptH() { return conceptEl ? conceptEl.offsetHeight : 0; }
  var ptr = { x: .5, y: .4, tx: .5, ty: .4, live: false };
  function layout() {
    if (!stage) return;
    var W = stage.clientWidth, Hh = stage.clientHeight, s0, cx, cy, h0, ct = conceptH();
    if (nav && !nav.classList.contains('pill')) nav.style.top = ct + 'px';
    if (!phone()) {
      h0 = (Hh - ct) * .74; cx = rtl() ? W * .25 : W * .75; cy = (Hh - ct) * .55;
      if (W < 1100) cx = rtl() ? W * .23 : W * .77;
    } else {
      var cb = copy.getBoundingClientRect().bottom - stage.getBoundingClientRect().top;
      var avail = Hh - cb - 40 - ct;
      h0 = clamp(avail, 150, Hh * .5); cx = W / 2; cy = cb + 18 + h0 / 2;
    }
    s0 = h0 / 139;
    var sE = Math.max(W, Hh) / 6 * 1.2;
    var wE = Math.max(W * 1.08, Hh * .92);
    var w0 = (h0 / .6) / 1.333;
    G = { W: W, H: Hh, s0: s0, cx: cx, cy: cy, sE: sE, wE: wE, w0: w0 };
    if (pimg) photo.style.setProperty('--pw', wE + 'px');
    var top = 0; for (var i = 0; i <= 100; i++) top = Math.max(top, geo(i / 100).w);
    G.w0 = Math.max(G.w0, top * .55); // start close enough that the push stays gentle
    // camera only ever pushes in: eased toward the widest frame, never below what keeps the keyhole filled
    G.wt = []; for (i = 0; i <= 100; i++) G.wt.push(Math.max(geo(i / 100).w, G.w0 * Math.pow(top / G.w0, smooth(i / 100)), i ? G.wt[i - 1] : 0));
    render(lastP);
  }
  function geo(e) {
    var s = G.s0 * Math.pow(G.sE / G.s0, e), cx = lerp(G.cx, G.W / 2, e), cy = lerp(G.cy, G.H / 2, e);
    var w = G.w0 * Math.pow(G.wE / G.w0, e);
    var L = Math.max(0, cx - 34 * s), R = Math.min(G.W, cx + 34 * s), T = Math.max(0, cy - 69.5 * s), B = Math.min(G.H, cy + 69.5 * s);
    w = Math.max(w, (cx - L) / .5, (R - cx) / .46, (cy - T) / .41 / 1.333, (B - cy) / .55 / 1.333) + 24;
    return { s: s, cx: cx, cy: cy, w: w };
  }
  var lastP = 0;
  function render(p) {
    if (!G.W) return;
    lastP = p;
    var e = smooth(p), g = geo(e), s = g.s, cx = g.cx, cy = g.cy;
    var tr = 'translate(' + (cx - 50 * s).toFixed(2) + ' ' + (cy - 80.5 * s).toFixed(2) + ') scale(' + s.toFixed(4) + ')';
    khp.setAttribute('transform', tr); rim.setAttribute('transform', tr);
    rim.style.opacity = clamp(1 - p * 3.2, 0, 1);
    lid.style.opacity = p > .92 ? clamp((1 - p) / .08, 0, 1) : 1;
    // camera only ever pushes in: running max of the width that keeps the keyhole filled
    var w = G.wt[Math.round(e * 100)];
    var k = w / G.wE, h = w * 1.333;
    var px = (ptr.x - .5) * 18 * (1 - e), py = (ptr.y - .5) * 14 * (1 - e);
    pimg.style.transform = 'translate(' + (cx - .52 * w + px).toFixed(1) + 'px,' + (cy - .43 * h + py).toFixed(1) + 'px) scale(' + k.toFixed(4) + ')';
    copy.style.opacity = clamp(1 - p * 4, 0, 1);
    copy.style.transform = p ? 'translateY(' + (-p * 90).toFixed(1) + 'px)' : '';
    copy.style.visibility = p > .45 ? 'hidden' : '';
    if (phl) phl.style.opacity = clamp(1 - p * 3, 0, 1);
  }
  function heroScroll() {
    if (!hero) return;
    if (still()) { render(0); photo.style.setProperty('--dim', 0); return; }
    var y = -hero.getBoundingClientRect().top, Hh = G.H || innerHeight;
    render(clamp(y / (Hh * .7), 0, 1));
    photo.style.setProperty('--dim', clamp((y - Hh * .8) / (Hh * .7), 0, 1) * .55);
  }
  // cursor light across the brass (auto-drift on touch)
  if (stage) {
    stage.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = stage.getBoundingClientRect(); ptr.tx = (e.clientX - r.left) / r.width; ptr.ty = (e.clientY - r.top) / r.height; ptr.live = true;
    });
    stage.addEventListener('pointerleave', function () { ptr.live = false; });
  }

  /* checker particles from the logo's chequered flag */
  var cv = $('[data-chk]'), cx2 = cv && cv.getContext('2d'), sq = [], dpr = 1, heroOn = true, chkT0 = 0;
  function buildChk() {
    if (!cv || !G.W) return;
    dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = G.W * dpr; cv.height = G.H * dpr;
    sq = [];
    var s = G.s0, c = Math.max(12, s * 7.2), rows = Math.round(100 * s / c), cols = phone() ? 4 : 5;
    var outer = phone() ? -1 : (rtl() ? 1 : -1); // which side the flag trails to
    var edgeX = G.cx + outer * (phone() ? 40 : 46) * s; // just outside the keyhole body
    var top = G.cy - 46 * s;
    for (var r = 0; r < rows; r++) for (var q = 0; q < cols; q++) {
      if ((r + q) % 2) continue;
      var keep = 1 - q / (cols + .5); if (((r * 7 + q * 13) % 10) / 10 > keep + .15) continue;
      var tx = edgeX + outer * (q * c + c * .6) - r * c * .18 * outer * -1, ty = top + r * c;
      sq.push({ tx: tx, ty: ty, x: tx + outer * (300 + ((r * 37 + q * 91) % 400)), y: ty + (((r * 53 + q * 17) % 200) - 100), vx: 0, vy: 0, a: keep, c: c * .9, ph: r * .7 + q });
    }
    chkT0 = performance.now();
    if (still()) { sq.forEach(function (p) { p.x = p.tx; p.y = p.ty; }); drawChk(0, 0); }
  }
  function drawChk(t, p) {
    cx2.setTransform(dpr, 0, 0, dpr, 0, 0); cx2.clearRect(0, 0, G.W, G.H);
    var a0 = clamp(1 - p * 1.6, 0, 1); if (!a0) return;
    var mx = ptr.x * G.W, my = ptr.y * G.H;
    for (var i = 0; i < sq.length; i++) {
      var o = sq[i], tx = o.tx + (o.tx - G.cx) * p * 2.2, ty = o.ty + (o.ty - G.cy) * p * 2.2 + Math.sin(t / 900 + o.ph) * 2;
      if (!still()) {
        if (ptr.live) { var dx = o.x - mx, dy = o.y - my, d2 = dx * dx + dy * dy, R = 130;
        if (d2 < R * R) { var d = Math.sqrt(d2) || 1, f = (1 - d / R) * 2.4; o.vx += dx / d * f; o.vy += dy / d * f; } }
        o.vx += (tx - o.x) * .045; o.vy += (ty - o.y) * .045; o.vx *= .82; o.vy *= .82; o.x += o.vx; o.y += o.vy;
      }
      cx2.globalAlpha = o.a * a0;
      cx2.fillStyle = '#ffd21a';
      cx2.fillRect(o.x - o.c / 2, o.y - o.c / 2, o.c, o.c);
    }
    cx2.globalAlpha = 1;
  }
  var raf = 0;
  function frame(t) {
    raf = 0;
    if (still() || !heroOn) return;
    if (!ptr.live) { var k = t / 1000; ptr.tx = .5 + Math.sin(k * .6) * .32; ptr.ty = .45 + Math.sin(k * .9 + 1) * .25; }
    ptr.x += (ptr.tx - ptr.x) * .08; ptr.y += (ptr.ty - ptr.y) * .08;
    if (sheen) { sheen.style.setProperty('--sx', (ptr.x * 100).toFixed(1) + '%'); sheen.style.setProperty('--sy', (ptr.y * 100).toFixed(1) + '%'); }
    if (lastP < 1) render(lastP);
    if (cx2) drawChk(t, lastP);
    raf = requestAnimationFrame(frame);
  }
  function startChk() { if (!raf && !still() && heroOn) raf = requestAnimationFrame(frame); }
  if (io && stage) new IntersectionObserver(function (es) { heroOn = es[0].isIntersecting; startChk(); }).observe(stage);

  /* ---------- nav pill + key fob ---------- */
  var fob = $('[data-fob]');

  /* ---------- bento: reveal, run while visible, spotlight ---------- */
  $$('[data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); });
  if (io) {
    var tio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('in'); e.target.classList.toggle('run', e.isIntersecting && !still()); }); }, { threshold: .12 });
    $$('[data-tile]').forEach(function (t) { tio.observe(t); });
  } else $$('[data-tile]').forEach(function (t) { t.classList.add('in'); });
  var bento = $('[data-bento]');
  if (bento) {
    bento.addEventListener('pointermove', function (e) {
      $$('[data-tile]', bento).forEach(function (t) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); t.style.setProperty('--spot', 1); });
    });
    bento.addEventListener('pointerleave', function () { $$('[data-tile]', bento).forEach(function (t) { t.style.setProperty('--spot', 0); }); });
  }
  // smart lock: a code typed, then the green light
  var pad = $('.t-smart .pad'), code = $('[data-code]'), step = 0;
  setInterval(function () {
    if (!pad || still() || !pad.parentNode.classList.contains('run')) return;
    step = (step + 1) % 7;
    pad.classList.toggle('ok', step >= 5);
    code.textContent = step >= 5 ? (he() ? 'פתוח' : 'OPEN') : '••••'.slice(0, step).padEnd(4, '·');
  }, 600);
  // home / business / car
  var trio = $$('.trio svg'), ti = 0;
  setInterval(function () { if (!trio.length) return; ti = (ti + 1) % 3; trio.forEach(function (s, i) { s.classList.toggle('on', i === ti); }); }, 1400);
  if (trio[0]) trio[0].classList.add('on');

  /* ---------- the keypad composes the WhatsApp message ---------- */
  var SV = { 1: ['מנעול חכם', 'a smart lock'], 2: ['החלפת צילינדר', 'replacing a cylinder'], 3: ['פתיחת דלת', 'opening a door'], 4: ['מנגנון או רב בריח', 'a lock mechanism'] };
  var PL = { 0: ['זה לבית.', 'It’s for my home.'], 5: ['זה לרכב.', 'It’s for my car.'], 6: ['זה לעסק.', 'It’s for my business.'] };
  var TM = { 7: ['מתי: היום', 'When: today'], 8: ['מתי: השבוע', 'When: this week'], 9: ['בלי לחץ, מתי שנוח לך', 'No rush, whenever suits you'] };
  var picked = [], place = null, when = null;
  var msgEl = $('[data-msg]'), send = $('[data-send]');
  function message() {
    var L = he() ? 0 : 1, lines = [L ? 'Hi Roy, I found you through the website.' : 'היי רועי, הגעתי מהאתר.'];
    if (picked.length) lines.push((L ? 'I’d like help with: ' : 'אשמח לעזרה עם: ') + picked.map(function (k) { return SV[k][L]; }).join(', ') + '.');
    else lines.push(L ? 'I’d like some help.' : 'אשמח לעזרה.');
    if (place !== null) lines.push(PL[place][L]);
    if (when !== null) lines.push(TM[when][L]);
    return lines.join('\n');
  }
  function compose() {
    if (!msgEl) return;
    var m = message(); msgEl.textContent = m;
    send.href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(m);
    $$('[data-legend] li').forEach(function (li) {
      var k = +li.dataset.k; li.classList.toggle('on', picked.indexOf(k) >= 0 || place === k || when === k);
    });
  }
  $$('[data-keys] button').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.dataset.k;
      if (!still() && b.animate) b.animate([{ background: 'rgba(140,202,255,.32)' }, { background: 'rgba(140,202,255,0)' }], { duration: 280, easing: 'ease-out' });
      if (k === 'clear') { picked = []; place = when = null; }
      else if (k === 'send') {
        var kn = $('.lock .knob'); kn.classList.add('read'); setTimeout(function () { kn.classList.remove('read'); }, 700);
        window.open(send.href, '_blank', 'noopener'); return;
      } else {
        k = +k;
        if (SV[k]) { var i = picked.indexOf(k); if (i >= 0) picked.splice(i, 1); else picked.push(k); }
        else if (PL[k]) place = place === k ? null : k;
        else if (TM[k]) when = when === k ? null : k;
      }
      compose();
    });
  });
  $$('[data-legend] li').forEach(function (li) { li.addEventListener('click', function () { var b = $('[data-keys] button[data-k="' + li.dataset.k + '"]'); if (b) b.click(); }); });

  /* ---------- odometers ---------- */
  var odo = $$('[data-odo]');
  function runOdo() {
    odo.forEach(function (b) {
      var v = parseFloat(b.dataset.odo), dec = b.dataset.odo.indexOf('.') >= 0;
      if (still()) { b.textContent = b.dataset.odo; return; }
      var t0 = performance.now();
      (function f(t) { var k = smooth((t - t0) / 1300); b.textContent = dec ? (v * k).toFixed(1) : Math.round(v * k); if (k < 1) requestAnimationFrame(f); })(t0);
    });
  }
  if (io && odo.length) { var oio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { runOdo(); oio.disconnect(); } }, { threshold: .4 }); oio.observe(odo[0]); }

  /* ---------- band: one turn pulls the bolts back ---------- */
  var band = $('[data-band]'), bolts = $$('[data-bolts] i'), cyl = $('[data-cyl] span');
  function bandScroll() {
    if (!band) return;
    if (still()) { bolts.forEach(function (b) { b.style.setProperty('--b', 0); }); return; }
    var r = band.getBoundingClientRect(), p = clamp((innerHeight - r.top) / (innerHeight + r.height * .2), 0, 1);
    cyl.style.setProperty('--turn', (smooth((p - .2) / .35) * 360).toFixed(1) + 'deg');
    bolts.forEach(function (b, i) { b.style.setProperty('--b', smooth((p - .45 - i * .03) / .18).toFixed(3)); });
  }

  /* ---------- gallery: turning arc of their photos ---------- */
  var arc = $('[data-arc]'), ring = $('[data-ring]');
  // a fuller ring: repeat four of the photos (hidden from screen readers; removed visually in still mode)
  if (ring) $$('.card', ring).slice(0, 4).forEach(function (c) { var d = c.cloneNode(true); d.setAttribute('aria-hidden', 'true'); d.classList.add('dup'); ring.appendChild(d); });
  var cards = $$('.card', ring), drag = 0, vel = 0, dragging = false, lx = 0;
  function arcRender() {
    if (!ring) return;
    if (still()) { cards.forEach(function (c) { c.style.transform = ''; }); ring.style.transform = ''; return; }
    var cw = Math.round(clamp(innerWidth * .17, 170, 330)), N = cards.length, step = 360 / N, R = cw / (2 * Math.tan(Math.PI / N)) * 1.22;
    var r = arc.getBoundingClientRect(), sp = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1);
    var ang = drag - sp * 150 + 30;
    arc.style.setProperty('--cw', cw + 'px');
    ring.style.transform = 'translateZ(' + (-R).toFixed(0) + 'px) rotateY(' + ang.toFixed(2) + 'deg)';
    cards.forEach(function (c, i) {
      var a = i * step; c.style.transform = 'rotateY(' + a + 'deg) translateZ(' + R.toFixed(0) + 'px)';
      var rel = ((a + ang) % 360 + 540) % 360 - 180; c.style.setProperty('--shade', (Math.abs(rel) / 180 * .75).toFixed(2));
    });
  }
  if (arc) {
    arc.addEventListener('pointerdown', function (e) { if (still()) return; dragging = true; lx = e.clientX; vel = 0; arc.setPointerCapture(e.pointerId); });
    arc.addEventListener('pointermove', function (e) { if (!dragging) return; var dx = e.clientX - lx; lx = e.clientX; vel = dx * .35; drag += vel; arcRender(); });
    var up = function () { if (!dragging) return; dragging = false; (function glide() { if (Math.abs(vel) < .05 || dragging) return; vel *= .93; drag += vel; arcRender(); requestAnimationFrame(glide); })(); };
    arc.addEventListener('pointerup', up); arc.addEventListener('pointercancel', up);
  }

  /* ---------- reviews drift with the scroll ---------- */
  var drift = $('[data-drift]'), track = $('[data-track]');
  function driftScroll() {
    if (!drift || still()) { if (track) track.style.transform = ''; return; }
    var r = drift.getBoundingClientRect(), p = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1);
    var max = track.scrollWidth - drift.clientWidth; if (max <= 0) { track.style.transform = ''; return; }
    track.style.transform = 'translateX(' + ((rtl() ? 1 : -1) * smooth((p - .1) / .8) * max).toFixed(1) + 'px)';
  }

  /* ---------- closing photo shrinks into a keyhole ---------- */
  var closing = $('[data-closing]');
  function closingScroll() {
    if (!closing) return;
    if (still()) { closing.style.setProperty('--m', '96%'); return; }
    var r = closing.getBoundingClientRect(), p = smooth((innerHeight - r.top) / (innerHeight * .95));
    closing.style.setProperty('--m', (2200 * Math.pow(96 / 2200, p)).toFixed(1) + '%');
  }

  /* ---------- scroll loop ---------- */
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = scrollY;
    if (nav) nav.classList.toggle('pill', y > 30);
    if (fob) fob.classList.toggle('show', y > innerHeight * .55);
    heroScroll(); bandScroll(); arcRender(); driftScroll(); closingScroll();
    startChk();
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); buildChk(); onScroll(); }, 120); });

  texts();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); buildChk(); onScroll(); });
  layout(); buildChk(); onScroll(); startChk();
  if (still()) runOdo();
})();
