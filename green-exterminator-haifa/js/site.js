(function () {
  var root = document.documentElement, WA = '972527261261';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var TITLE = { he: 'המדביר הירוק · מאיר · הרחקת יונים והדברה · ההסתדרות 72, חיפה', en: 'The Green Exterminator · Meir · pigeon-proofing & pest control · 72 HaHistadrut, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור המדביר הירוק · זה אינו האתר הרשמי של העסק', en: 'Concept demo made for The Green Exterminator · not the business’s official website' };

  // ================================================================ small drawn things: stars, the hero's five leaves, the wreath of 11
  var STAR = '<svg viewBox="0 0 92 16" aria-hidden="true">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; }).join('') + '</svg>';
  $$('[data-stars]').forEach(function (s) { s.innerHTML = STAR; });
  $$('[data-leaves]').forEach(function (s) { s.innerHTML = '<i></i><i></i><i></i><i></i><i></i>'; });
  var wreath = $('[data-wreath]');
  if (wreath) {
    // an olive twig bent into a ring, open at the bottom, with 11 leaves (one per review) alternating out and in
    var g = '<path class="ring" d="' + (function () { var d = '', i, a, r = 84; for (i = 0; i <= 40; i++) { a = (-150 + i * 7.5 - 90) * Math.PI / 180; d += (i ? 'L' : 'M') + (100 + r * Math.cos(a)).toFixed(1) + ' ' + (100 + r * Math.sin(a)).toFixed(1); } return d; })() + '"/>';
    for (var i = 0; i < 11; i++) {
      var a = -140 + i * 28, r = 84, rad = (a - 90) * Math.PI / 180;
      var x = 100 + r * Math.cos(rad), y = 100 + r * Math.sin(rad);
      g += '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + (a + (i % 2 ? 60 : -60) + 180 * (a < 0 ? 0 : 0)) + ')"><path class="lf" style="transition-delay:' + (i * 70) + 'ms" d="M0 0C-6.5 -6 -6.5 -17 0 -25C6.5 -17 6.5 -6 0 0Z"/></g>';
    }
    wreath.innerHTML = g;
  }

  // ================================================================ language
  var STEPS = { he: ['לפני: יונים על המעקה', 'הרשת נפרסת', 'אחרי: רשת מתוחה'], en: ['Before: pigeons on the rail', 'The net goes up', 'After: a taut net'] };
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    try { localStorage.setItem('gx-lang', l); } catch (e) {}
    $$('img[data-alt-he]').forEach(function (im) { im.alt = im.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('iframe[data-title-he]').forEach(function (f) { f.title = f.dataset[l === 'he' ? 'titleHe' : 'titleEn']; });
    $$('[data-aria-he]').forEach(function (el) { el.setAttribute('aria-label', el.dataset[l === 'he' ? 'ariaHe' : 'ariaEn']); });
    var aria = function (sel, h, e) { var el = $(sel); if (el) el.setAttribute('aria-label', l === 'he' ? h : e); };
    aria('[data-pill]', 'ראשי', 'Main');
    aria('[data-seed]', 'חייגו למאיר, 052-726-1261', 'Call Meir, 052-726-1261');
    aria('[data-net-prev]', 'שלב קודם', 'Previous step');
    aria('[data-net-next]', 'שלב הבא', 'Next step');
    aria('[data-spots-label]', 'מקומות שבודקים', 'Places that get checked');
    street.placeholder = l === 'he' ? 'למשל: הרצל 12…' : 'E.g. 12 Herzl St…';
    rotReset(); hours(); write(); whenUI(); stepUI(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ================================================================ motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('gx-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    if (wreath) wreath.classList.add('in');
    rotReset(); layout(); write();
  }); });
  motionUI();

  // ================================================================ hours and live status, Israel time. null = closed that day, [0, 24] = all day
  var H = { 0: [7, 19], 1: [7, 19], 2: [7, 19], 3: [7, 19], 4: [7, 19], 5: [7, 16.5], 6: [7, 19] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; };
  var all = function (t) { return t && t[0] === 0 && t[1] === 24; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (all(t)) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · היום מ-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      var from = H[nd] ? hhmm(H[nd][0]) : '', allNext = all(H[nd]);
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · מחר ' + (allNext ? 'כל היום' : 'מ-' + from) : 'Closed now · tomorrow ' + (allNext ? 'all day' : 'from ' + from))
        : (l ? 'סגור עכשיו · ביום ' + dayHe[nd] + ' ' + (allNext ? 'כל היום' : 'מ-' + from) : 'Closed now · ' + dayEn[nd] + (allNext ? ', all day' : ' from ' + from));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    var lc = $('[data-leafcap]'); if (lc) lc.classList.toggle('open', open);
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // consecutive days with the same hours share a row
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var label = r[0] === r[1] ? names[r[0]] : names[r[0]] + (r[1] - r[0] === 1 ? (l ? ' ו' : ' and ') : '–') + names[r[1]];
      var time = !t ? (l ? 'סגור' : 'Closed') : all(t) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + label + '</td><td>' + time + '</td></tr>';
    }).join('');
    status();
  }
  window.__status = status; window.__H = H; window.__hours = hours;
  setInterval(status, 30000);

  // ================================================================ the hero's one animated line: the place the quiet returns to
  var rotT = 0;
  function rotReset() {
    clearTimeout(rotT);
    $$('.rot').forEach(function (r) { r.querySelector('b').textContent = r.dataset.rot.split('|')[0]; });
    if (still()) return;
    var el = $('html[lang="' + root.lang + '"] [lang="' + root.lang + '"] .rot') || $('.rot');
    var words = el.dataset.rot.split('|'), b = el.querySelector('b'), idx = 0;
    var step = function () {
      idx++;
      var w = words[idx % words.length];
      if (!b.animate) { b.textContent = w; }
      else {
        var out = b.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-.22em)' }], { duration: 180, easing: 'ease-in', fill: 'forwards' });
        out.onfinish = function () { b.textContent = w; out.cancel(); b.animate([{ opacity: 0, transform: 'translateY(.22em)' }, { opacity: 1, transform: 'none' }], { duration: 280, easing: 'cubic-bezier(.22,.8,.24,1)' }); };
      }
      if (idx < words.length) rotT = setTimeout(step, 1900); // one pass, then it rests on the first word
    };
    rotT = setTimeout(step, 1600);
  }

  // ================================================================ reveals
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -10% 0px' });
    $$('[data-reveal]').forEach(function (el, i) { el.style.transitionDelay = (i % 5) * 70 + 'ms'; io.observe(el); });
    if (wreath) io.observe(wreath);
  } else { $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); }); if (wreath) wreath.classList.add('in'); }

  // ================================================================ FIND: the inspection torch, scroll-linked (transform only)
  var room = $('[data-room]'), beam = $('[data-beam]'), spots = $$('[data-spot]');
  var VB = { w: 1200, h: 620 };
  var PATH = [[120, 230], [262, 300], [430, 470], [800, 552], [712, 296], [1060, 170]];
  var SPOT_AT = [[262, 300], [430, 470], [800, 552], [712, 296]];
  var R = { top: 0, h: 0, w: 0, rh: 0, s: 1, ox: 0, oy: 0 };
  function cr(p0, p1, p2, p3, t) { var t2 = t * t, t3 = t2 * t; return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); }
  function along(s) {
    var n = PATH.length - 1, f = clamp(s, 0, 1) * n, i = Math.min(n - 1, Math.floor(f)), t = f - i;
    var P = function (k) { return PATH[clamp(k, 0, n)]; };
    return [cr(P(i - 1)[0], P(i)[0], P(i + 1)[0], P(i + 2)[0], t), cr(P(i - 1)[1], P(i)[1], P(i + 1)[1], P(i + 2)[1], t)];
  }
  function roomLayout() {
    if (!room) return;
    var r = room.getBoundingClientRect();
    R.top = r.top + window.scrollY; R.w = r.width; R.rh = r.height;
    R.s = Math.max(R.w / VB.w, R.rh / VB.h); R.ox = (R.w - VB.w * R.s) / 2; R.oy = (R.rh - VB.h * R.s) / 2;
    spots.forEach(function (sp, i) {
      var x = R.ox + SPOT_AT[i][0] * R.s, y = R.oy + SPOT_AT[i][1] * R.s, wd = sp.offsetWidth;
      sp.style.setProperty('--px', clamp(x - 8, 6, R.w - wd - 6) + 'px');
      sp.style.setProperty('--py', Math.min(y - 8, R.rh - 34) + 'px');
    });
  }
  function roomFrame(vh) {
    if (!room || still()) return;
    var p = (window.scrollY + vh - R.top) / (vh + R.rh), s = clamp((p - 0.18) / 0.62, 0, 1);
    var pt = along(s), x = R.ox + pt[0] * R.s, y = R.oy + pt[1] * R.s;
    beam.style.transform = 'translate3d(' + (x - R.w / 2).toFixed(1) + 'px,' + (y - R.rh / 2).toFixed(1) + 'px,0)';
    var n = PATH.length - 1;
    spots.forEach(function (sp, i) { sp.classList.toggle('on', s >= (i + 1) / n - 0.03); });
  }

  // ================================================================ NET: the signature. A Haifa balcony at golden hour; a bird net is pulled across, then made taut.
  var netSec = $('[data-net]'), cv = $('[data-net-canvas]'), ctx = cv && cv.getContext('2d'), note = $('[data-net-note]');
  var N = { top: 0, h: 0, W: 0, H: 0, dpr: 1, bg: null, last: -1 };
  var STILLS = [0, 0.34, 1], stepI = 0;
  function sceneGeom() {
    var W = N.W, Hh = N.H, mob = W < 700;
    var pw = Math.max(22, W * 0.055);
    return { W: W, H: Hh, mob: mob, xa: pw, xb: W - pw, ceil: Hh * (mob ? 0.34 : 0.29), rail: Hh * (mob ? 0.74 : 0.71), floor: Hh * 0.86, hor: Hh * (mob ? 0.6 : 0.585), cell: clamp(W / 58, 13, 22) };
  }
  function buildBg() {
    var G = sceneGeom(), c = document.createElement('canvas'); c.width = Math.round(G.W * N.dpr); c.height = Math.round(G.H * N.dpr);
    var x = c.getContext('2d'); x.scale(N.dpr, N.dpr);
    // sky, warm towards the horizon
    var sky = x.createLinearGradient(0, G.ceil, 0, G.hor);
    sky.addColorStop(0, '#4a5638'); sky.addColorStop(0.55, '#a2875a'); sky.addColorStop(1, '#efbb76');
    x.fillStyle = sky; x.fillRect(0, 0, G.W, G.hor);
    // the sun, low, with its glow
    var sx = G.W * (G.mob ? 0.66 : 0.64), sy = G.hor - G.H * 0.06, sr = Math.max(14, G.H * 0.035);
    var glow = x.createRadialGradient(sx, sy, 0, sx, sy, G.H * 0.42);
    glow.addColorStop(0, 'rgba(255,226,160,.55)'); glow.addColorStop(0.25, 'rgba(255,200,120,.18)'); glow.addColorStop(1, 'rgba(255,190,110,0)');
    x.fillStyle = glow; x.fillRect(0, 0, G.W, G.H);
    x.fillStyle = '#ffe8b4'; x.beginPath(); x.arc(sx, sy, sr, 0, Math.PI * 2); x.fill();
    // the bay below the horizon, with the sun's path on the water
    var sea = x.createLinearGradient(0, G.hor, 0, G.floor);
    sea.addColorStop(0, '#b59563'); sea.addColorStop(1, '#4f5238');
    x.fillStyle = sea; x.fillRect(0, G.hor, G.W, G.floor - G.hor);
    for (var k = 0; k < 26; k++) {
      var yy = G.hor + 3 + k * k * 0.42, ww = (6 + k * 2.2) * (0.6 + 0.4 * Math.sin(k * 2.7));
      x.fillStyle = 'rgba(255,228,170,' + (0.5 - k * 0.017).toFixed(3) + ')';
      x.fillRect(sx - ww / 2 + Math.sin(k * 1.9) * 6, yy, ww, 1.6);
    }
    // the far shore of the bay, thin and hazy
    x.fillStyle = 'rgba(92,92,66,.75)';
    x.beginPath(); x.moveTo(G.W * 0.45, G.hor); x.lineTo(G.W, G.hor - G.H * 0.012); x.lineTo(G.W, G.hor + 2); x.lineTo(G.W * 0.45, G.hor + 2); x.fill();
    // the Carmel slope on the near side, with houses and lit windows
    x.fillStyle = '#2c3826';
    x.beginPath(); x.moveTo(0, G.hor - G.H * 0.2);
    for (var t = 0; t <= 1.0001; t += 0.05) { var hx = t * G.W * 0.56; x.lineTo(hx, G.hor - G.H * 0.2 * Math.pow(1 - t, 1.6) - 2 + Math.sin(t * 17) * 2.5 * (1 - t)); }
    x.lineTo(G.W * 0.56, G.hor + 6); x.lineTo(0, G.hor + 6); x.fill();
    var seed = 7, rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (var b = 0; b < 34; b++) {
      var t2 = rnd() * 0.8, bx = t2 * G.W * 0.56, top = G.hor - G.H * 0.2 * Math.pow(1 - t2, 1.6), bw = 8 + rnd() * 16, bh = 6 + rnd() * 14, by = top + 4 + rnd() * (G.hor - top);
      if (by + bh > G.hor + 4) continue;
      x.fillStyle = rnd() > 0.5 ? '#3a4632' : '#34402e'; x.fillRect(bx, by, bw, bh);
      if (rnd() > 0.45) { x.fillStyle = 'rgba(255,214,140,.75)'; x.fillRect(bx + 2 + rnd() * (bw - 5), by + 2 + rnd() * (bh - 4), 2.2, 2.2); }
    }
    // floor, in perspective, with sun on it
    x.fillStyle = '#2d3122'; x.fillRect(0, G.floor, G.W, G.H - G.floor);
    x.strokeStyle = 'rgba(0,0,0,.28)'; x.lineWidth = 1.2;
    var vx = G.W * 0.5;
    x.strokeStyle = 'rgba(0,0,0,.18)'; for (var f = -6; f <= 6; f++) { x.beginPath(); x.moveTo(vx + f * G.W * 0.075, G.floor); x.lineTo(vx + f * G.W * 0.16, G.H); x.stroke(); }
    for (var fr = 1; fr < 5; fr++) { var fy = G.floor + (G.H - G.floor) * (fr * fr) / 25; x.beginPath(); x.moveTo(0, fy); x.lineTo(G.W, fy); x.stroke(); }
    x.fillStyle = 'rgba(239,187,118,.08)';
    x.beginPath(); x.moveTo(G.xa, G.floor); x.lineTo(G.xb, G.floor); x.lineTo(G.xb + G.W * 0.06, G.H); x.lineTo(G.xa - G.W * 0.06, G.H); x.fill();
    // the railing: top bar, bars, bottom bar; the sun behind it rims the top
    x.fillStyle = '#1b211a';
    for (var bx2 = G.xa + 10; bx2 < G.xb - 4; bx2 += Math.max(18, G.cell * 1.1)) x.fillRect(bx2, G.rail, 3.4, G.floor - G.rail);
    x.fillRect(G.xa, G.rail - 6, G.xb - G.xa, 10); x.fillRect(G.xa, G.floor - 8, G.xb - G.xa, 8);
    x.fillStyle = 'rgba(255,214,150,.55)'; x.fillRect(G.xa, G.rail - 7, G.xb - G.xa, 1.6);
    // the ceiling slab and the two side walls of the balcony
    x.fillStyle = '#1e291f'; x.fillRect(0, 0, G.W, G.ceil);
    x.fillStyle = '#26332a'; x.fillRect(0, G.ceil - 16, G.W, 16);
    x.fillStyle = 'rgba(255,214,150,.18)'; x.fillRect(G.xa, G.ceil - 1.5, G.xb - G.xa, 1.5);
    x.fillStyle = '#212c22'; x.fillRect(0, G.ceil, G.xa, G.H - G.ceil); x.fillRect(G.xb, G.ceil, G.W - G.xb, G.H - G.ceil);
    x.fillStyle = 'rgba(255,214,150,.16)'; x.fillRect(G.xb, G.ceil, 2, G.H - G.ceil);
    x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(G.xa - 2, G.ceil, 2, G.H - G.ceil);
    // the steel wire fixed under the ceiling, already in place, with its hooks
    x.strokeStyle = '#9aa092'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(G.xa, G.ceil + 2); x.lineTo(G.xb, G.ceil + 2); x.stroke();
    x.fillStyle = '#b8bcae';
    for (var hk = G.xa; hk <= G.xb; hk += G.cell * 4) { x.beginPath(); x.arc(hk, G.ceil + 2, 2.4, 0, Math.PI * 2); x.fill(); }
    // a flower pot in the corner (its new leaves are drawn live)
    var px = G.xb - Math.max(40, G.W * 0.07), py = G.H - (G.H - G.floor) * 0.35;
    x.fillStyle = '#6b4b34'; x.beginPath(); x.moveTo(px - 30, py - 44); x.lineTo(px + 30, py - 44); x.lineTo(px + 22, py + 6); x.lineTo(px - 22, py + 6); x.fill();
    x.fillStyle = '#5a3f2c'; x.fillRect(px - 33, py - 50, 66, 9);
    N.pot = { x: px, y: py - 50 };
    N.bg = c; N.G = G;
  }
  function leaf(x, y, len, ang, s, col) {
    if (s <= 0.01) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-len * 0.36, -len * 0.3, -len * 0.3, -len * 0.8, 0, -len); ctx.bezierCurveTo(len * 0.3, -len * 0.8, len * 0.36, -len * 0.3, 0, 0); ctx.fill();
    ctx.strokeStyle = 'rgba(20,30,18,.45)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(0, -len * 0.9); ctx.stroke();
    ctx.restore();
  }
  // a pigeon in silhouette against the low sun; dir = 1 faces right. flap: -1..1 (flying), null = perched
  function pigeon(x, y, s, dir, flap, bob, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.scale(s * dir, s);
    ctx.fillStyle = '#20271e'; ctx.strokeStyle = 'rgba(255,212,150,.55)'; ctx.lineWidth = 1.2 / s;
    if (flap === null) {
      ctx.beginPath(); // body, breast forward, tail low behind
      ctx.moveTo(14, -16); ctx.bezierCurveTo(20, -14, 20, -4, 12, 0); ctx.lineTo(-6, 0); ctx.lineTo(-24, 4); ctx.lineTo(-22, -1);
      ctx.bezierCurveTo(-10, -6, -4, -18, 6, -18); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(14, -21 + bob, 5.2, 0, Math.PI * 2); ctx.fill(); // head
      ctx.beginPath(); ctx.moveTo(18.5, -21.5 + bob); ctx.lineTo(23, -20 + bob); ctx.lineTo(18.5, -19 + bob); ctx.fill(); // beak
      ctx.beginPath(); ctx.moveTo(-8, -16); ctx.bezierCurveTo(0, -20, 10, -20, 18, -24 + bob); ctx.stroke(); // rim light on the back
      ctx.strokeStyle = '#20271e'; ctx.lineWidth = 1.6 / s; ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(1, 6); ctx.moveTo(7, 0); ctx.lineTo(8, 6); ctx.stroke();
    } else {
      var a = flap * 1.05;
      ctx.beginPath(); ctx.ellipse(0, 0, 17, 6, -0.08, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(17, -3, 4.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(21, -3.5); ctx.lineTo(25, -2.6); ctx.lineTo(21, -1.6); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-14, -1); ctx.lineTo(-27, -5); ctx.lineTo(-27, 4); ctx.closePath(); ctx.fill();
      // far wing, then near wing; both hinge at the shoulder and bend at the wrist
      [[-0.7, 0.75], [1, 1]].forEach(function (w) {
        var sh = 0.6 * w[1], tipX = -6 + Math.cos(a) * 4, tipY = -Math.sin(a) * 30 * w[1], wrX = 2, wrY = -Math.sin(a) * 16 * w[1];
        ctx.beginPath(); ctx.moveTo(-4, -2); ctx.quadraticCurveTo(wrX, wrY - 4 * sh, tipX, tipY); ctx.quadraticCurveTo(wrX + 8, wrY + 2, 10, -1); ctx.closePath(); ctx.fill();
      });
    }
    ctx.restore();
  }
  var PIG = [{ f: 0.3, dir: 1 }, { f: 0.47, dir: -1 }, { f: 0.68, dir: 1 }];
  function edgeU(p) { return smooth((p - 0.08) / 0.42); }
  function pFor(u) { for (var p = 0.08; p <= 0.5; p += 0.002) if (edgeU(p) >= u) return p; return 0.5; }
  function netLayout() {
    if (!cv) return;
    var r = netSec.getBoundingClientRect();
    N.top = r.top + window.scrollY; N.h = netSec.offsetHeight;
    var stage = cv.parentNode; N.W = stage.clientWidth; N.H = stage.clientHeight;
    N.dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(N.W * N.dpr); cv.height = Math.round(N.H * N.dpr);
    buildBg();
    var G = N.G;
    PIG.forEach(function (pg) { pg.x = G.xa + (G.xb - G.xa) * pg.f; pg.p0 = pFor((G.xb - pg.x - G.cell * 3) / (G.xb - G.xa)); });
    N.last = -1;
  }
  function drawNet(p) {
    if (!ctx || !N.bg) return;
    var G = N.G;
    ctx.setTransform(N.dpr, 0, 0, N.dpr, 0, 0);
    ctx.clearRect(0, 0, G.W, G.H);
    ctx.drawImage(N.bg, 0, 0, G.W, G.H);
    // pigeons: perched until the net comes close, then they lift off and fly out over the bay, away from the net
    PIG.forEach(function (pg, i) {
      var q = clamp((p - pg.p0) / 0.17, 0, 1), s0 = G.mob ? 1.05 : 1.7;
      if (q <= 0) { pigeon(pg.x, G.rail - 6, s0, pg.dir, null, Math.sin(p * 90 + i * 2) * 1.2, 1); return; }
      var e = 1 - Math.pow(1 - q, 2);
      var x = pg.x - (G.W * 0.22 + i * G.W * 0.06) * e, y = G.rail - 10 - G.H * (0.13 + i * 0.05) * Math.sin(e * Math.PI / 2) - 26 * q * (1 - q);
      var s = s0 * (1 - 0.5 * e), flap = Math.sin(q * Math.PI * 2 * (5 + i));
      pigeon(x, y, s, -1, flap, 0, q > 0.8 ? (1 - q) / 0.2 : 1);
    });
    // the net
    var u = edgeU(p), t = smooth((p - 0.52) / 0.22), vel = clamp(Math.sin(Math.PI * clamp((p - 0.08) / 0.42, 0, 1)), 0, 1);
    if (u > 0.002) {
      var cell = G.cell, span = G.xb - G.xa, nC = Math.max(4, Math.round(span / cell)), nR = Math.max(4, Math.round((G.rail - G.ceil) / cell));
      var e0 = G.xb - span * u, cover = G.xb - e0, slack = 1 - u;
      var ring = (1 - t) * (1 - t) + 0.08 * Math.sin(t * Math.PI * 3) * (1 - t); // slack falls away, with a small shiver as it locks
      var sagMax = G.H * 0.05 * (0.35 + slack) * ring, drop = G.H * 0.06 * ring, lag = G.W * 0.05 * vel * (1 - t);
      var jit = function (j, k, s) { var v = Math.sin(j * 12.9898 + k * 78.233 + s) * 43758.5453; return (v - Math.floor(v) - 0.5) * 1.2; };
      var X = function (j, k) { var d = j / nR; return G.xb - (k / nC) * cover + lag * d * d * (k / nC) + (k && k < nC ? jit(j, k, 1) : 0); };
      var Y = function (j, k) { var d = j / nR, f = k / nC; return G.ceil + 2 + d * (G.rail - G.ceil - 2) + (j && j < nR ? jit(j, k, 7) : 0) + drop * d * d + sagMax * d * Math.sin(Math.PI * f) + (slack > 0 ? Math.sin(f * nC * 1.7) * 2.2 * slack * d : 0); };
      var grd = ctx.createRadialGradient(G.W * (G.mob ? 0.66 : 0.64), G.hor - G.H * 0.06, 0, G.W * 0.64, G.hor, G.W * 0.75);
      grd.addColorStop(0, 'rgba(255,232,186,.7)'); grd.addColorStop(0.45, 'rgba(232,222,190,.32)'); grd.addColorStop(1, 'rgba(210,214,196,.2)');
      ctx.strokeStyle = grd; ctx.lineWidth = G.mob ? 0.75 : 0.9;
      ctx.beginPath();
      for (var j = 0; j <= nR; j++) { ctx.moveTo(X(j, 0), Y(j, 0)); for (var k = 1; k <= nC; k++) ctx.lineTo(X(j, k), Y(j, k)); }
      for (var k2 = 0; k2 <= nC; k2++) { ctx.moveTo(X(0, k2), Y(0, k2)); for (var j2 = 1; j2 <= nR; j2++) ctx.lineTo(X(j2, k2), Y(j2, k2)); }
      ctx.stroke();
      // the border rope on the leading edge and along the bottom, a little heavier
      ctx.lineWidth = G.mob ? 1.6 : 2; ctx.strokeStyle = 'rgba(236,228,200,.5)';
      ctx.beginPath(); ctx.moveTo(X(0, nC), Y(0, nC)); for (var j3 = 1; j3 <= nR; j3++) ctx.lineTo(X(j3, nC), Y(j3, nC));
      for (var k3 = nC - 1; k3 >= 0; k3--) ctx.lineTo(X(nR, k3), Y(nR, k3)); ctx.stroke();
      // ties to the rail and the walls, appearing as the net is pulled tight
      if (t > 0) {
        ctx.fillStyle = 'rgba(255,236,200,.9)';
        for (var k4 = 0; k4 <= nC; k4 += 3) if (1 - k4 / nC <= t * 1.15) { ctx.beginPath(); ctx.arc(X(nR, k4), Y(nR, k4), 2.3, 0, Math.PI * 2); ctx.fill(); }
        for (var j4 = 0; j4 <= nR; j4 += 3) if (j4 / nR <= t * 1.15) { ctx.beginPath(); ctx.arc(X(j4, nC), Y(j4, nC), 2.3, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(X(j4, 0), Y(j4, 0), 2.3, 0, Math.PI * 2); ctx.fill(); }
      }
    }
    // the plant in the corner puts out new leaves once the balcony is quiet
    var g2 = smooth((p - 0.72) / 0.22), P = N.pot, L = G.mob ? 30 : 42;
    leaf(P.x - 8, P.y, L, -0.5, 1, '#6f8c5a'); leaf(P.x + 6, P.y, L * 0.9, 0.45, 1, '#7b9a63'); leaf(P.x, P.y, L * 1.1, 0.02, 1, '#86a56d');
    leaf(P.x - 4, P.y - 4, L * 0.85, -1.0, g2, '#a9c08f'); leaf(P.x + 4, P.y - 6, L * 0.8, 0.95, smooth((p - 0.78) / 0.18), '#a9c08f'); leaf(P.x, P.y - 8, L * 0.7, -0.2, smooth((p - 0.84) / 0.14), '#bcd2a2');
    if (note) note.classList.toggle('on', p > 0.82);
  }
  function stepUI() {
    var l = he() ? 'he' : 'en', lab = $('[data-net-step]');
    if (lab) lab.textContent = STEPS[l][stepI];
    var pv = $('[data-net-prev]'), nx = $('[data-net-next]');
    if (pv) pv.disabled = stepI === 0; if (nx) nx.disabled = stepI === STILLS.length - 1;
  }
  function stepTo(i) { stepI = clamp(i, 0, STILLS.length - 1); stepUI(); drawNet(STILLS[stepI]); }
  var pv0 = $('[data-net-prev]'), nx0 = $('[data-net-next]');
  if (pv0) pv0.addEventListener('click', function () { stepTo(stepI - 1); });
  if (nx0) nx0.addEventListener('click', function () { stepTo(stepI + 1); });
  function netFrame(vh) {
    if (!cv) return;
    if (still()) { if (N.last !== -2 - stepI) { drawNet(STILLS[stepI]); N.last = -2 - stepI; } return; }
    var p = clamp((window.scrollY - N.top) / Math.max(1, N.h - vh), 0, 1);
    if (Math.abs(p - N.last) < 0.0005) return;
    N.last = p; drawNet(p);
  }
  window.__drawNet = drawNet;

  // ================================================================ the message: tap the place in the little house, pick what and when
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]'), street = $('[data-street]'), when = $('[data-when]'), whenVal = $('[data-when-val]'), sun = $('[data-sun]'), hspot = $('[data-hspot]');
  var ZONE = { roof: [160, 64], balcony: [216, 160], kitchen: [97, 158], garden: [288, 216] };
  var T = {
    he: { hi: 'היי מאיר, הגעתי דרך האתר. ', what: { pigeons: 'יש לי עניין של יונים', pests: 'יש לי בעיה של מזיקים', home: 'אשמח לעזרה בעבודה בבית' },
          where: { roof: ' בגג', balcony: ' במרפסת', kitchen: ' במטבח', garden: ' בגינה' }, st: ', ברחוב ',
          when: ['. אפשר להגיע היום?', '. אפשר לתאם השבוע?', '. מתי נוח לך להגיע?'], end: ' תודה!', wl: ['היום, אם אפשר', 'השבוע', 'בלי לחץ'] },
    en: { hi: 'Hi Meir, I found you through your website. ', what: { pigeons: 'I have a pigeon problem', pests: 'I have a pest problem', home: 'I’d like help with some work at home' },
          where: { roof: ' on the roof', balcony: ' on the balcony', kitchen: ' in the kitchen', garden: ' in the garden' }, st: ', on ',
          when: ['. Could you come today?', '. Could we set something up this week?', '. When would suit you?'], end: ' Thanks!', wl: ['Today, if possible', 'This week', 'No rush'] }
  };
  function val(name, d) { var el = form.querySelector('input[name=' + name + ']:checked'); return el ? el.value : d; }
  function whenUI() {
    var v = +when.value, t = [0.2, 0.5, 0.8][v]; if (!he()) t = t; else t = 1 - t;
    var bx = (1 - t) * (1 - t) * 14 + 2 * (1 - t) * t * 150 + t * t * 286, by = (1 - t) * (1 - t) * 66 + 2 * (1 - t) * t * -30 + t * t * 66;
    sun.style.transform = 'translate(' + (bx - 14).toFixed(1) + 'px,' + (by - 66).toFixed(1) + 'px)';
    whenVal.textContent = T[he() ? 'he' : 'en'].wl[v];
    when.setAttribute('aria-valuetext', whenVal.textContent);
  }
  function write() {
    var l = he() ? 'he' : 'en', t = T[l], w = val('what', 'pigeons'), z = val('where', 'balcony'), st = (street.value || '').trim().slice(0, 60);
    var m = t.hi + t.what[w] + t.where[z] + (st ? t.st + st : '') + t.when[+when.value] + t.end;
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    var zz = ZONE[z]; hspot.style.transform = 'translate(' + zz[0] + 'px,' + zz[1] + 'px)';
    type(m);
  }
  var typeT = 0, lastM = '';
  function type(m) {
    clearInterval(typeT);
    if (still() || !lastM || (m.indexOf(lastM) === 0 && m.length - lastM.length < 3) || lastM.indexOf(m) === 0) { preview.textContent = m; lastM = m; return; }
    var common = 0; while (common < m.length && m[common] === lastM[common]) common++;
    lastM = m; var i = common;
    typeT = setInterval(function () {
      i += 2; preview.innerHTML = '';
      preview.appendChild(document.createTextNode(m.slice(0, i)));
      if (i < m.length) { var c = document.createElement('span'); c.className = 'caret'; preview.appendChild(c); } else clearInterval(typeT);
    }, 16);
  }
  form.addEventListener('change', write);
  street.addEventListener('input', write);
  when.addEventListener('input', function () { whenUI(); write(); });
  $$('[data-wa]').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('היי מאיר, הגעתי דרך האתר. '); a.addEventListener('click', function () { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(he() ? 'היי מאיר, הגעתי דרך האתר. ' : 'Hi Meir, I found you through your website. '); }); });

  // ================================================================ layout, the scroll loop (rAF-throttled; layout is read only on resize)
  var pill = $('[data-pill]'), sticky = $('[data-sticky]'), heroEnd = 0, vhC = window.innerHeight, ticking = false;
  function layout() { vhC = window.innerHeight; var h = $('.hero'); heroEnd = h.offsetTop + h.offsetHeight * 0.7; roomLayout(); netLayout(); tick(); }
  function frame() {
    ticking = false;
    var y = window.scrollY;
    pill.classList.toggle('up', y > 24);
    if (sticky) sticky.classList.toggle('show', y > heroEnd);
    roomFrame(vhC); netFrame(vhC);
  }
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', tick, { passive: true });
  var rz = 0; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  window.addEventListener('load', layout);

  setLang(root.lang === 'en' ? 'en' : 'he');
})();
