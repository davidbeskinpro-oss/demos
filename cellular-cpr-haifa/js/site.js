(function () {
  var root = document.documentElement, WA = '972532441877';
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var clamp = function (v, a, b) { a = a == null ? 0 : a; b = b == null ? 1 : b; return v < a ? a : v > b ? b : v; };
  var outC = function (t) { return 1 - Math.pow(1 - t, 3); };
  var ioC = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var TITLE = { he: 'סלולר CPR · מעבדת סלולר וחנות · שד\' הנשיא 124, חיפה', en: 'Cellular CPR · Phone lab and shop · 124 HaNassi Blvd, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור סלולר CPR · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Cellular CPR · This is not the business’s official website' };
  var ARIA = { '[data-island]': ['ראשי', 'Main'], '[data-run]': ['תחומי המעבדה', 'What the lab handles'], '[data-bright]': ['שלבי התיקון', 'Repair steps'] };

  // ---------------------------------------------------------------- language
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    try { localStorage.setItem('cpr-lang', l); } catch (e) {}
    var m = $('[name=model]'); if (m) m.placeholder = m.dataset[l === 'he' ? 'phHe' : 'phEn'];
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    Object.keys(ARIA).forEach(function (k) { var el = $(k); if (el) el.setAttribute('aria-label', ARIA[k][l === 'he' ? 0 : 1]); });
    $('.map iframe').title = l === 'he' ? 'מפת Google: שד\' הנשיא 124, חיפה' : 'Google Maps: 124 HaNassi Blvd, Haifa';
    write(); hours(); clock(); seamW = 0; buildSeams(); runUI(); storyShown = -1; storyRender();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- animations switch, remembered
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(), step = storyStep;
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('cpr-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI(); write();
    secs.forEach(function (s) { s._k = null; });
    if (!on) { secs.forEach(function (s) { s.classList.add('awake'); }); cardsFinal(); $('.score').classList.add('lit'); }
    else { $$('.card').forEach(function (c) { c.classList.remove('live', 'lit'); }); }
    // keep the same story step in view when the pinned story grows or shrinks
    storyStep = step; storyShown = -1;
    if (on) storyGo(step, true); else storyRender();
    tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- live opening status, Haifa time. null = closed that day
  var H = { 0: [9, 20], 1: [9, 20], 2: [9, 20], 3: [9, 21], 4: [9, 21], 5: [9, 15.5], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, short, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = short = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); short = txt; }
    else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); short = l ? 'נפתח היום ב-' + hhmm(t[0]) : 'Opens today at ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      var tomorrow = nd === (n.d + 1) % 7;
      if (!H[nd]) { txt = short = l ? 'סגור עכשיו' : 'Closed now'; }
      else {
        var when = tomorrow ? (l ? 'מחר' : 'tomorrow') : (l ? 'ביום ' + dayHe[nd] : 'on ' + dayEn[nd]);
        txt = l ? 'סגור עכשיו · נפתח ' + when + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + when + ' at ' + hhmm(H[nd][0]);
        short = l ? 'נפתח ' + when + ' ב-' + hhmm(H[nd][0]) : 'Opens ' + when + ' at ' + hhmm(H[nd][0]);
      }
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot" aria-hidden="true"></span>' + txt; });
    $$('[data-status-short]').forEach(function (el) { el.textContent = short; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = '<tbody>' + rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var two = r[1] - r[0] === 1;
      var label = r[0] === r[1] ? names[r[0]] : names[r[0]] + (two ? (l ? ' ו' : ' and ') : '–') + names[r[1]];
      var time = !t ? '<span class="off-day">' + (l ? 'סגור' : 'Closed') + '</span>' : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + label + '</td><td class="t">' + time + '</td></tr>';
    }).join('') + '</tbody>';
    status();
  }
  // the lock screen and the handset's status bar show the time in Haifa
  function clock() {
    var d = new Date(), l = he() ? 'he-IL' : 'en-GB';
    var t = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
    $('[data-time]').textContent = t;
    $$('[data-clock]').forEach(function (el) { el.textContent = t.replace(/^0/, ''); });
    $('[data-date]').textContent = new Intl.DateTimeFormat(l, { timeZone: 'Asia/Jerusalem', weekday: 'long', day: 'numeric', month: 'long' }).format(d);
    status();
  }
  setInterval(clock, 20000);
  window.__status = status; window.__H = H; window.__hours = hours;

  // ---------------------------------------------------------------- the home screen writes the WhatsApp message
  var T = {
    he: { n: { screen: 'יש בעיה במסך של הטלפון', charge: 'הטלפון לא נטען כמו שצריך', sim: 'הטלפון לא מזהה את הסים', data: 'אני רוצה להעביר את המידע לטלפון חדש', phone: 'אשמח לעזרה בבחירת טלפון חדש', gear: 'אשמח לשמוע על אביזרים לטלפון' },
          hi: 'שלום סלולר CPR, הגעתי דרך האתר. ', model: '. הטלפון: ', end: '. מתי אפשר לקפוץ?' },
    en: { n: { screen: 'there’s a problem with my phone’s screen', charge: 'my phone isn’t charging properly', sim: 'my phone isn’t reading the SIM', data: 'I’d like to move my data to a new phone', phone: 'I’d like help choosing a new phone', gear: 'I’m looking for phone accessories' },
          hi: 'Hi Cellular CPR, I found you through your website. ', model: '. The phone: ', end: '. When could I drop by?' }
  };
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]');
  function write() {
    var t = T[root.lang] || T.he, f = new FormData(form), model = (f.get('model') || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    var need = t.n[f.get('need') || 'screen'];
    if (root.lang === 'en') need = need.charAt(0).toUpperCase() + need.slice(1);
    var m = t.hi + need + (model ? t.model + model : '') + t.end;
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    type(m);
  }
  var typeT = 0, lastMsg = '';
  function type(m) {
    clearInterval(typeT);
    if (still() || m === lastMsg) { preview.textContent = m; lastMsg = m; return; }
    var common = 0; while (common < m.length && common < lastMsg.length && m[common] === lastMsg[common]) common++;
    lastMsg = m;
    var i = common;
    typeT = setInterval(function () {
      i = Math.min(m.length, i + 2);
      preview.textContent = m.slice(0, i);
      if (i < m.length) preview.insertAdjacentHTML('beforeend', '<span class="caret"></span>'); else clearInterval(typeT);
    }, 16);
  }
  form.addEventListener('change', write);
  form.addEventListener('input', function (e) { if (e.target.name === 'model') write(); });

  // ---------------------------------------------------------------- the seam between screens:
  // a crack runs out from an impact point across the glass, fresh glass slides over it, and the next screen wakes from the top down.
  // All of it is tied to the scroll, both ways, so it plays again on every pass.
  var secs = $$('.sec[data-seam]');
  function rnd(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
  // a jagged run of glass: short straight pieces whose heading wanders a little, pulled back toward `base`
  function jag(r, x, y, a, len, base, pull, step0, h) {
    var p = [[x, y]], d = 0;
    while (d < len) {
      var st = step0 * (0.55 + r() * 0.9); a += (r() - 0.5) * 0.7; if (base != null) a = base + (a - base) * pull;
      x += Math.cos(a) * st; y += Math.sin(a) * st; d += st;
      if (h) { if (y < 14) { y = 14; a = base != null ? base : a; } if (y > h - 14) { y = h - 14; a = base != null ? base : a; } }
      p.push([x, y]);
    }
    return p;
  }
  var dstr = function (p) { return 'M' + p.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('L'); };
  function crackSVG(w, h, fx, seed) {
    var r = rnd(seed), cx = fx * w, cy = h / 2, lines = [];
    var add = function (p, sw, op) { lines.push({ d: dstr(p), w: sw, o: op }); };
    // the two long cracks that run across the whole screen, with branches breaking off them
    [-1, 1].forEach(function (dir) {
      var base = dir < 0 ? Math.PI : 0, x = cx, y = cy, a = base + (r() - 0.5) * 0.5, p = [[x, y]];
      while (dir < 0 ? x > -30 : x < w + 30) {
        var st = 16 + r() * 34; a += (r() - 0.5) * 0.62; a = base + (a - base) * 0.8;
        if (Math.abs(y - cy) > h * 0.26) a = base + (a - base) * 0.3 + (y > cy ? -1 : 1) * 0.12 * dir;
        x += Math.cos(a) * st; y += Math.sin(a) * st; p.push([x, y]);
        if (r() < 0.15 && Math.abs(x - cx) > 40) {
          var ba = a + (r() < 0.5 ? -1 : 1) * (0.55 + r() * 0.75), bp = jag(r, x, y, ba, 30 + r() * 120, ba, 0.7, 12, h);
          add(bp, 0.8, 0.5 + r() * 0.3);
          if (r() < 0.35) { var q = bp[Math.floor(bp.length / 2)], sa = ba + (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.6); add(jag(r, q[0], q[1], sa, 18 + r() * 50, sa, 0.7, 9, h), 0.6, 0.45); }
        }
      }
      add(p, 1.25, 0.9);
    });
    // radial cracks around the point of impact, and the rings that join them (the spider web of a hit)
    var n = 8 + Math.floor(r() * 4), rays = [];
    for (var k = 0; k < n; k++) {
      var ang = k / n * Math.PI * 2 + (r() - 0.5) * 0.45, vert = Math.abs(Math.sin(ang));
      var len = (28 + r() * 70) * (1 - vert * 0.45);
      var rp = jag(r, cx, cy, ang, len, ang, 0.75, 8, h); rays.push({ a: ang, p: rp, len: len }); add(rp, 0.95, 0.55 + r() * 0.35);
    }
    [9 + r() * 4, 20 + r() * 7, 34 + r() * 8].forEach(function (rad, ri) {
      for (var k = 0; k < rays.length; k++) {
        var a1 = rays[k], a2 = rays[(k + 1) % rays.length];
        if (a1.len < rad || a2.len < rad || r() < 0.22 + ri * 0.15) continue;
        var j1 = rad * (0.9 + r() * 0.2), j2 = rad * (0.9 + r() * 0.2);
        add([[cx + Math.cos(a1.a) * j1, cy + Math.sin(a1.a) * j1], [cx + Math.cos((a1.a + a2.a) / 2 + (k === rays.length - 1 ? Math.PI : 0)) * rad * 1.04, cy + Math.sin((a1.a + a2.a) / 2 + (k === rays.length - 1 ? Math.PI : 0)) * rad * 1.04], [cx + Math.cos(a2.a) * j2, cy + Math.sin(a2.a) * j2]], 0.7, 0.5);
      }
    });
    var s = '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true" focusable="false"><g fill="none" stroke-linecap="round" stroke-linejoin="round">';
    // each crack twice: a dark edge just below, then the light catching the broken glass
    lines.forEach(function (l) { s += '<path d="' + l.d + '" stroke="rgba(0,0,0,.6)" stroke-width="' + (l.w + 0.7) + '" transform="translate(.7 1)"/>'; });
    lines.forEach(function (l) { s += '<path d="' + l.d + '" stroke="rgba(232,244,255,' + l.o.toFixed(2) + ')" stroke-width="' + l.w + '"/>'; });
    s += '</g><circle cx="' + cx.toFixed(1) + '" cy="' + cy + '" r="3.2" fill="rgba(240,248,255,.92)"/><circle cx="' + cx.toFixed(1) + '" cy="' + cy + '" r="7" fill="rgba(200,232,255,.16)"/></svg>';
    return s;
  }
  secs.forEach(function (s, i) {
    var seam = document.createElement('div'); seam.className = 'seam' + (i % 2 ? ' from-r' : ''); seam.setAttribute('aria-hidden', 'true');
    seam.innerHTML = '<div class="crack"></div><div class="glass"></div>';
    // the section's own content sits on a "screen" that is dark until it wakes
    var scr = document.createElement('div'); scr.className = 'scr';
    while (s.firstChild) scr.appendChild(s.firstChild);
    var scan = document.createElement('div'); scan.className = 'scanl'; scan.setAttribute('aria-hidden', 'true');
    s.appendChild(seam); s.appendChild(scan); s.appendChild(scr);
    s._seam = seam; s._crack = seam.firstChild; s._glass = seam.lastChild; s._scr = scr; s._scan = scan; s._fx = parseFloat(s.dataset.seam) || 0.5; s._i = i; s._k = null;
    $$('.rv', s).forEach(function (el, j) { el.style.setProperty('--rd', (60 + Math.min(j, 6) * 80) + 'ms'); });
  });
  var seamW = 0;
  function buildSeams() {
    var w = document.documentElement.clientWidth;
    if (w === seamW) return; seamW = w;
    secs.forEach(function (s) {
      // in Hebrew the page reads from the right, so the point of impact mirrors with it
      s._cx = (he() ? 1 - s._fx : s._fx) * w; s._w = w;
      s._crack.innerHTML = crackSVG(w, 260, he() ? 1 - s._fx : s._fx, 7919 * (s._i + 3));
      s._R = Math.max(s._cx, w - s._cx) + 30; s._k = null;
    });
  }
  function seam(s, q) {
    // q: 0 = this section's top edge enters at the bottom of the screen, 1 = it has reached the middle
    var cr = outC(clamp((q - 0.02) / 0.32)), gl = ioC(clamp((q - 0.34) / 0.32)), gf = clamp((q - 0.66) / 0.16), wk = ioC(clamp((q - 0.5) / 0.44));
    var w = s._w, fromR = s._i % 2 === 1;
    if (gl <= 0) s._crack.style.clipPath = cr <= 0 ? 'circle(0px at 0 50%)' : cr >= 1 ? 'none' : 'circle(' + (cr * s._R).toFixed(1) + 'px at ' + s._cx.toFixed(1) + 'px 50%)';
    else {
      // fresh glass covers the crack: what is under the new glass is whole again
      var edge = gl * w;
      s._crack.style.clipPath = fromR ? 'inset(0 ' + edge.toFixed(1) + 'px 0 0)' : 'inset(0 0 0 ' + edge.toFixed(1) + 'px)';
    }
    s._glass.style.opacity = gl > 0 ? (1 - gf).toFixed(3) : 0;
    s._glass.style.transform = 'translateX(' + ((fromR ? 1 : -1) * (1 - gl) * 105).toFixed(2) + '%)';
    s._seam.style.visibility = q <= 0.02 || gf >= 1 ? 'hidden' : 'visible';
    // the screen wakes: black lifts from the top down behind a scanning line
    var vh = innerHeight * 1.1;
    s._scr.style.clipPath = wk >= 1 ? '' : 'inset(0 0 calc(100% - ' + Math.max(0, wk * vh - s._scr.offsetTop).toFixed(1) + 'px) 0)';
    s._scan.style.opacity = wk > 0 && wk < 1 ? 1 : 0; s._scan.style.visibility = wk > 0 && wk < 1 ? 'visible' : 'hidden';
    s._scan.style.transform = 'translateY(' + (wk * vh).toFixed(1) + 'px)';
    s.classList.toggle('awake', q >= 0.8);
  }
  function seamTick() {
    if (still()) { secs.forEach(function (s) { if (s._k !== 'still') { s._k = 'still'; s.classList.add('awake'); s._scr.style.clipPath = ''; } }); return; }
    var vh = innerHeight, tops = secs.map(function (s) { return s.getBoundingClientRect().top; });
    for (var i = 0; i < secs.length; i++) {
      var s = secs[i], q = (vh - tops[i]) / (vh * 0.5);
      var key = clamp(q, -0.01, 1.11).toFixed(3); if (key === s._k) continue; s._k = key;
      seam(s, q);
    }
  }

  // ---------------------------------------------------------------- the lab's cards come alive when they are in view, and again on every return
  var cards = $$('.card[data-live]'), countT = new Map();
  function countUp(el, ms, done) {
    var t0 = performance.now(); cancelAnimationFrame(countT.get(el));
    (function f(t) { var k = clamp((t - t0) / ms); el.textContent = Math.round(outC(k) * 100) + '%'; if (k < 1) countT.set(el, requestAnimationFrame(f)); else if (done) done(); })(t0);
  }
  function cardLive(c, on) {
    if (still()) return;
    if (on) {
      c.classList.add('live');
      var p = $('[data-pct]', c); if (p) countUp(p, 2200);
      var d = $('[data-dpct]', c); if (d) countUp(d, 3600);
      if (c.dataset.live === 'pixels') { clearTimeout(c._lt); c._lt = setTimeout(function () { c.classList.add('lit'); }, 1600); }
    } else {
      c.classList.remove('live', 'lit'); clearTimeout(c._lt);
      $$('[data-pct],[data-dpct]', c).forEach(function (el) { cancelAnimationFrame(countT.get(el)); el.textContent = '0%'; });
    }
  }
  function cardsFinal() { $$('[data-pct],[data-dpct]').forEach(function (el) { el.textContent = '100%'; }); }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (es) { es.forEach(function (e) { cardLive(e.target, e.isIntersecting); }); }, { threshold: 0.6 });
    cards.forEach(function (c) { cio.observe(c); });
  }
  if (still()) cardsFinal();

  // the card run: arrows step one card; they follow the reading direction
  var run = $('[data-run]'), prev = $('[data-run-prev]'), next = $('[data-run-next]');
  function runStep(k) { var c = cards[0], gap = 18, w = c.getBoundingClientRect().width + gap; run.scrollBy({ left: k * w * (he() ? -1 : 1), behavior: still() ? 'auto' : 'smooth' }); }
  function runUI() {
    var max = run.scrollWidth - run.clientWidth, x = Math.abs(run.scrollLeft);
    prev.disabled = x < 4; next.disabled = x > max - 4;
  }
  prev.addEventListener('click', function () { runStep(-1); });
  next.addEventListener('click', function () { runStep(1); });
  run.addEventListener('scroll', function () { requestAnimationFrame(runUI); }, { passive: true });

  // ---------------------------------------------------------------- from cracked to alive: the pinned frame
  var track = $('[data-story]'), frames = $$('[data-frame] img'), caps = $$('[data-caps] li'), bfill = $('[data-bfill]');
  var storyStep = 0, storyShown = -1;
  function storyP() { var r = track.getBoundingClientRect(), run2 = track.offsetHeight - innerHeight; return run2 > 0 ? clamp(-r.top / run2) : 0; }
  function storyRender() {
    var s, p;
    if (still()) { s = storyStep; p = s / 3; }
    else { p = storyP(); s = p * 3; storyStep = Math.round(s); }
    frames.forEach(function (im, i) {
      var op = still() ? (i === storyStep ? 1 : 0) : clamp((0.72 - Math.abs(s - i)) / 0.44);
      im.style.opacity = op.toFixed(3);
      im.style.transform = still() ? '' : 'scale(' + (1.05 - 0.05 * clamp(1 - Math.abs(s - i))).toFixed(4) + ')';
    });
    bfill.style.transform = 'scaleY(' + (0.16 + 0.84 * p).toFixed(4) + ')';
    if (storyShown !== storyStep) { storyShown = storyStep; caps.forEach(function (c, i) { c.classList.toggle('on', i === storyStep); }); }
    $('[data-sprev]').disabled = storyStep <= 0; $('[data-snext]').disabled = storyStep >= 3;
  }
  function storyGo(i, instant) {
    i = clamp(i, 0, 3); storyStep = i;
    if (still()) { storyRender(); return; }
    var top = track.getBoundingClientRect().top + scrollY, run2 = track.offsetHeight - innerHeight;
    scrollTo({ top: top + run2 * (i / 3) + 2, behavior: instant ? 'auto' : 'smooth' });
  }
  $('[data-sprev]').addEventListener('click', function () { storyGo(storyStep - 1); });
  $('[data-snext]').addEventListener('click', function () { storyGo(storyStep + 1); });
  $$('[data-step]').forEach(function (b) { b.addEventListener('click', function () { storyGo(+b.dataset.step); }); });

  // ---------------------------------------------------------------- the rating, drawn in OLED pixels that light row by row
  var G = { '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'], '.': ['00', '00', '00', '00', '00', '01', '01'], '0': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'] }; // taste-skill-ignore: pixel font bitmap, not numbering
  (function () {
    var m = $('[data-matrix]'), chars = ['5', '.', '0'], html = '';
    for (var row = 0; row < 7; row++) {
      var col = 0;
      chars.forEach(function (ch, ci) {
        G[ch][row].split('').forEach(function (b) { html += '<i' + (b === '1' ? ' class="px" style="--pd:' + (row * 90 + col * 14) + 'ms"' : '') + '></i>'; col++; });
        if (ci < 2) { html += '<i></i>'; col++; }
      });
    }
    m.innerHTML = html;
  })();
  var score = $('.score');
  if (still()) score.classList.add('lit');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { if (still()) return; score.classList.toggle('lit', es[0].isIntersecting); }, { threshold: 0.45 }).observe(score);
  } else score.classList.add('lit');

  // ---------------------------------------------------------------- the island: up under the screen edge once you scroll, the menu opens out of it
  var island = $('[data-island]'), menu = $('[data-menu]'), panel = $('[data-panel]');
  function setMenu(open) {
    menu.setAttribute('aria-expanded', open ? 'true' : 'false'); panel.hidden = !open;
    if (open && !still()) { panel.classList.remove('opening'); void panel.offsetWidth; panel.classList.add('opening'); }
  }
  menu.addEventListener('click', function () { setMenu(panel.hidden); });
  panel.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { setMenu(false); menu.focus(); } });
  document.addEventListener('click', function (e) { if (!panel.hidden && !island.contains(e.target)) setMenu(false); });
  var navLinks = $$('[data-nav]');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { var id = e.target.id === 'message' ? 'visit' : e.target.id; navLinks.forEach(function (a) { a.classList.toggle('on', a.dataset.nav === id); }); } });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['top', 'lab', 'revive', 'shop', 'reviews', 'message', 'visit'].forEach(function (id) { var el = document.getElementById(id); if (el) nio.observe(el); });
  }

  // ---------------------------------------------------------------- the incoming-call banner shows once the hero's buttons are gone, and steps aside for other call buttons
  var incall = $('[data-incall]'), away = new Set(), hero = $('.hero');
  function incallUI() { incall.classList.toggle('show', away.size === 0); }
  if ('IntersectionObserver' in window) {
    var kio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? away.add(e.target) : away.delete(e.target); }); incallUI(); }, { threshold: 0 });
    [$('[data-hero-acts]'), $('[data-send]'), $('[data-visit-acts]')].forEach(function (el) { if (el) kio.observe(el); });
    new IntersectionObserver(function (es) { hero.classList.toggle('away', !es[0].isIntersecting); }).observe(hero);
  } else incall.classList.add('show');

  // ---------------------------------------------------------------- one scroll loop
  var ticking = false;
  function tick() { island.classList.toggle('up', scrollY > 24); seamTick(); storyRender(); }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); } }, { passive: true });
  var rz = 0;
  addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { buildSeams(); secs.forEach(function (s) { s._k = null; }); tick(); runUI(); }, 120); });

  setLang(root.lang === 'en' ? 'en' : 'he');
  tick();
  window.__tick = tick;
})();
