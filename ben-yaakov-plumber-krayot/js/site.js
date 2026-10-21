(function () {
  var root = document.documentElement, WA = '972559538144';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var TITLE = { he: 'בן יעקב · אינסטלטור הקריות · איתור נזילות וביוב 24/7', en: 'Ben Yaakov · Krayot Plumber · leak detection & sewer repair, 24/7' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור בן יעקב · אינסטלטור הקריות · זה אינו האתר הרשמי של העסק', en: 'Concept demo made for Ben Yaakov · Krayot Plumber · not the business’s official website' };

  // ================================================================ stars (4.7 = four full and most of the fifth)
  var STAR = function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; };
  var ROW = [0, 18, 36, 54, 72].map(STAR).join('');
  $$('[data-stars]').forEach(function (s, i) {
    var v = parseFloat(s.getAttribute('data-stars')) || 5, w = (v / 5) * 88, id = 'stc' + i;
    s.innerHTML = '<svg viewBox="0 0 88 16" aria-hidden="true" focusable="false"><defs><clipPath id="' + id + '"><rect width="' + w.toFixed(1) + '" height="16"/></clipPath></defs>' +
      '<g fill="rgba(236,235,228,.22)">' + ROW + '</g><g fill="#d98a5f" clip-path="url(#' + id + ')">' + ROW + '</g></svg>';
  });
  var tk = $('[data-ticks]');
  if (tk) { var t = ''; for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6, r1 = i % 3 ? 47 : 42; t += '<path d="M' + (100 + Math.sin(a) * r1).toFixed(1) + ' ' + (80 - Math.cos(a) * r1).toFixed(1) + 'L' + (100 + Math.sin(a) * 51).toFixed(1) + ' ' + (80 - Math.cos(a) * 51).toFixed(1) + '"/>'; } tk.innerHTML = t; }

  // ================================================================ language
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    try { localStorage.setItem('by-lang', l); } catch (e) {}
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-aria-he]').forEach(function (a) { a.setAttribute('aria-label', a.dataset[l === 'he' ? 'ariaHe' : 'ariaEn']); });
    $('[data-pill]').setAttribute('aria-label', l === 'he' ? 'ראשי' : 'Main');
    $('[data-who]').setAttribute('aria-label', l === 'he' ? 'ביקורות' : 'Reviews');
    $('[data-map-title]').title = l === 'he' ? 'מפה: משה שרת 69, חיפה' : 'Map: 69 Moshe Sharet St, Haifa';
    hours(); write(); frame(true); trace(traceT);
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ================================================================ motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('by-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    traceT = 1; trace(1); frame(true);
  }); });
  motionUI();

  // ================================================================ hours and live status, Israel time. null = closed that day, [0, 24] = all day
  var H = { 0: [0, 24], 1: [0, 24], 2: [0, 24], 3: [0, 24], 4: [0, 24], 5: [0, 24], 6: [0, 24] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); if (m === 60) { h++; m = 0; } return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; };
  var all = function (t) { return t && t[0] === 0 && t[1] === 24; };
  var always = function () { for (var d = 0; d < 7; d++) if (!all(H[d])) return false; return true; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, short, open = false;
    if (always()) { open = true; txt = l ? 'פתוח עכשיו · 24/7' : 'Open now · 24/7'; short = l ? 'פתוח 24/7' : 'Open 24/7'; }
    else if (all(t)) { open = true; txt = l ? 'פתוח עכשיו · כל היום' : 'Open now · all day'; short = l ? 'פתוח עכשיו' : 'Open now'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); short = l ? 'פתוח עכשיו' : 'Open now'; }
    else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); short = l ? 'היום מ-' + hhmm(t[0]) : 'Today from ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      var from = H[nd] ? hhmm(H[nd][0]) : '', allNext = all(H[nd]);
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · מחר ' + (allNext ? 'כל היום' : 'מ-' + from) : 'Closed now · tomorrow ' + (allNext ? 'all day' : 'from ' + from))
        : (l ? 'סגור עכשיו · ביום ' + dayHe[nd] + ' ' + (allNext ? 'כל היום' : 'מ-' + from) : 'Closed now · ' + dayEn[nd] + (allNext ? ', all day' : ' from ' + from));
      short = l ? 'השאירו הודעה' : 'Leave a message';
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    var ps = $('[data-probe-status]'); if (ps) ps.textContent = short;
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

  // ================================================================ the composer: where in the house + how urgent -> WhatsApp to Ben
  var T = {
    he: { hi: 'היי, הגעתי דרך האתר. ', where: { bath: 'יש לי נזילה באמבטיה', kitchen: 'יש לי נזילה במטבח', ceiling: 'יש לי כתם רטיבות בתקרה', garden: 'יש לי נזילה בגינה', sewer: 'יש לי בעיה בביוב' },
          st: ', ב', urg: ['. אפשר להגיע עכשיו?', '. אפשר להגיע היום?', '. מתי יש לך זמן השבוע?'], tag: ['עכשיו', 'היום', 'השבוע'], end: ' תודה!' },
    en: { hi: 'Hi, I found you through your website. ', where: { bath: 'I have a leak in the bathroom', kitchen: 'I have a leak in the kitchen', ceiling: 'There’s a damp patch on my ceiling', garden: 'I have a leak in the garden', sewer: 'I have a problem with the sewer' },
          st: ', at ', urg: ['. Could you come now?', '. Could you come today?', '. When would you have time this week?'], tag: ['now', 'today', 'this week'], end: ' Thanks!' }
  };
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]'), street = $('[data-street]'), urg = $('[data-urg]'), urgOut = $('[data-urg-out]');
  function write() {
    var l = he() ? 'he' : 'en', t = T[l], w = (form.querySelector('input[name=where]:checked') || {}).value || 'bath', u = +urg.value || 0;
    var st = (street.value || '').trim().replace(/\s+/g, ' ').slice(0, 80);
    street.placeholder = l === 'he' ? 'למשל: הרצל 12, קרית ביאליק…' : 'E.g. 12 Herzl St, Kiryat Bialik…';
    var m = t.hi + t.where[w] + (st ? t.st + st : '') + t.urg[u] + t.end;
    urgOut.textContent = t.tag[u];
    urg.setAttribute('aria-valuetext', t.tag[u]);
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    preview.textContent = m;
  }
  form.addEventListener('input', write);
  form.addEventListener('change', function (e) {
    write();
    if (e.target.name === 'where' && !still() && e.target.nextElementSibling.animate) {
      e.target.nextElementSibling.animate([{ transform: 'scale(.82)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'cubic-bezier(.23,1,.32,1)' });
    }
  });

  // ================================================================ reviews: names are tabs
  var tabs = $$('[data-who] [role=tab]');
  function pick(i, focus) {
    tabs.forEach(function (b, k) {
      var on = k === i, p = document.getElementById(b.getAttribute('aria-controls'));
      b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1;
      p.hidden = !on; p.classList.toggle('on', on);
    });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (b, k) {
    b.addEventListener('click', function () { pick(k); });
    b.addEventListener('keydown', function (e) {
      var n = { ArrowDown: 1, ArrowUp: -1, ArrowRight: rtl() ? -1 : 1, ArrowLeft: rtl() ? 1 : -1 }[e.key];
      if (n) { e.preventDefault(); pick((k + n + tabs.length) % tabs.length, true); }
    });
  });

  // ================================================================ card run arrows; tapping a card replays its little scene
  var run = $('[data-run]');
  function step(dir) { var c = run.querySelector('.job'); var w = c ? c.getBoundingClientRect().width + 16 : 300; run.scrollBy({ left: dir * w * (rtl() ? -1 : 1), behavior: still() ? 'auto' : 'smooth' }); }
  $('[data-run-next]').addEventListener('click', function () { step(1); });
  $('[data-run-prev]').addEventListener('click', function () { step(-1); });
  $$('.job').forEach(function (j) { j.addEventListener('click', function () { if (still()) return; j.classList.remove('in'); void j.offsetWidth; j.classList.add('in'); }); });

  // ================================================================ reveals
  var revs = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
    revs.forEach(function (el) {
      var sib = el.parentElement ? [].indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty('--d', Math.min(sib, 4) * 75 + 'ms');
      io.observe(el);
    });
  } else revs.forEach(function (el) { el.classList.add('in'); });

  // the detector sweep around the photo in #find: one turn then it settles on the spot
  var sweepFig = $('[data-sweep]'), arc = $('[data-sweep-arc]'), dot = $('[data-sweep-dot]');
  if (sweepFig && 'IntersectionObserver' in window) {
    var swio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; swio.disconnect();
      if (still() || !arc.animate) return;
      arc.animate([{ transform: 'rotate(-90deg)' }, { transform: 'rotate(312deg)' }], { duration: 2200, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'both' });
      dot.animate([{ opacity: 0 }, { opacity: 0, offset: .85 }, { opacity: 1 }], { duration: 2400, fill: 'both' });
      $('.sw-halo', dot).animate([{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1.6)', opacity: 1, offset: .5 }, { transform: 'scale(1)', opacity: 1 }], { duration: 900, delay: 2200, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'both' });
    }, { threshold: .4 });
    swio.observe(sweepFig);
  }
  if (arc) arc.style.transform = 'rotate(312deg)';

  // ================================================================ hero trace: one pass, peaks once inside the ring, then rests
  var tr = $('[data-trace]'), traceT = still() ? 1 : 0;
  function trace(t) {
    if (!tr) return;
    var peakX = rtl() ? 260 : 740; // over the photo inside the ring (the ring sits at the end side)
    if (innerWidth <= 700) peakX = rtl() ? 330 : 670;
    var head = rtl() ? 1000 - t * (1000 - peakX) : t * peakX, d = 'M', pts = [];
    for (var x = 0; x <= 1000; x += 5) {
      var reached = rtl() ? x >= head : x <= head;
      var y = 60;
      if (reached) {
        var dx = x - peakX, env = Math.exp(-(dx * dx) / (2 * 26 * 26)), live = Math.exp(-Math.pow((x - head) / 60, 2)) * (1 - t);
        y = 60 - 44 * env * Math.sin(dx / 6.5) * smooth(.55, 1, t) - 10 * live * Math.sin(x / 4);
      }
      pts.push(x + ' ' + y.toFixed(1));
    }
    // undrawn part stays invisible: clip by building the path only over the drawn span
    var drawn = pts.filter(function (p) { var x = +p.split(' ')[0]; return rtl() ? x >= head : x <= head; });
    tr.setAttribute('d', drawn.length ? d + drawn.join('L') : 'M0 60');
  }
  if (!still()) {
    var t0 = null;
    var tick = function (ts) { if (t0 === null) t0 = ts + 350; var t = clamp((ts - t0) / 1700, 0, 1); traceT = 1 - Math.pow(1 - t, 3); trace(traceT); if (t < 1 && !still()) requestAnimationFrame(tick); else { traceT = 1; trace(1); } };
    requestAnimationFrame(tick);
  }
  trace(traceT);

  // ================================================================ signature seam 1: the wave edge under #find
  var wave = $('[data-wave]'), wFill = $('[data-wave-fill]'), wLine = $('[data-wave-line]'), wMark = $('[data-wave-mark]');
  function waveFrame(force) {
    var r = wave.getBoundingClientRect(), vh = innerHeight;
    var q = still() ? .72 : clamp((vh - r.top) / (vh * .85), 0, 1);
    if (!force && waveFrame.q === q) return; waveFrame.q = q;
    var leak = rtl() ? 360 : 640, base = 120;
    var c = rtl() ? 1080 - q * 1160 : -80 + q * 1160; // packet centre crosses the whole width
    var near = Math.exp(-Math.pow((c - leak) / 210, 2)), A = 14 + 70 * near, pts = [];
    for (var x = 0; x <= 1000; x += 8) {
      var env = Math.exp(-Math.pow((x - c) / 120, 2));
      pts.push(x + ' ' + (base - A * env * Math.sin((x - c) / 15)).toFixed(1));
    }
    var line = 'M' + pts.join('L');
    wLine.setAttribute('d', line); wFill.setAttribute('d', line + 'V200H0Z');
    var passed = rtl() ? leak - c : c - leak;
    wMark.style.opacity = still() ? 1 : smooth(-30, 40, passed).toFixed(3);
    wMark.style.transform = 'translate3d(' + (leak / 1000 * r.width).toFixed(1) + 'px,' + (base / 200 * r.height).toFixed(1) + 'px,0) scale(' + (0.6 + 0.4 * smooth(-30, 40, passed)).toFixed(3) + ')';
  }

  // ================================================================ signature seam 2: down the pipe
  var tube = $('[data-tube]'), rings = $('[data-tn-rings]'), lines = $('[data-tn-lines]'), cap = $('[data-tn-cap]'), copy = $('[data-tube-copy]'), exit = $('[data-exit]'), exitIn = $('[data-exit-in]'), box = $('.tunnel-box');
  var fade = $('[data-tn-fade]'), patch = $('.sl-patch'), flows = $$('.sl-flow');
  var F = 250, CAM = 0.2, ZEND = 10.4, S = 0.78, Z0 = 0.34;
  function tunnel(p) {
    var D = p * (ZEND - 0.1), out = '', ln = '';
    // the pipe's own lines run from the camera to the far end (the bottom invert and two side seams)
    [72, 108, 200, 340].forEach(function (deg, k) {
      var a = deg * Math.PI / 180, zA = 0.14, zB = Math.max(ZEND - D, 0.2);
      var x1 = F / zA * Math.cos(a), y1 = -F * CAM / zA + F / zA * Math.sin(a), x2 = F / zB * Math.cos(a), y2 = -F * CAM / zB + F / zB * Math.sin(a);
      ln += '<path d="M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + '" stroke="rgba(214,190,160,' + (k < 2 ? .16 : .08) + ')" stroke-width="2" fill="none"/>';
    });
    // joints, near to far; the camera's light falls off with distance
    for (var i = 0; i < 14; i++) {
      var z = Z0 + i * S - D;
      if (z <= 0.12 || z >= ZEND - D) continue;
      var r = F / z, cy = -F * CAM / z, L = clamp(1 - (z - 0.3) / 6.5, 0.04, 1), w = Math.max(r * 0.05, 1);
      out += '<circle cx="0" cy="' + cy.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="none" stroke="rgba(206,182,152,' + (0.08 + 0.55 * L).toFixed(3) + ')" stroke-width="' + w.toFixed(1) + '"/>' +
        '<circle cx="0" cy="' + cy.toFixed(1) + '" r="' + (r * 0.955).toFixed(1) + '" fill="none" stroke="rgba(0,0,0,' + (0.25 + 0.35 * L).toFixed(3) + ')" stroke-width="' + (w * 0.8).toFixed(1) + '"/>';
    }
    // the patch: a smooth liner band, placed at one point down the pipe
    var zp = Z0 + 7.3 * S + 0.4 - D, zp2 = zp + 0.22;
    if (zp2 > 0.12 && zp < ZEND - D) {
      var a1 = F / Math.max(zp, 0.12), a2 = F / zp2, Lp = clamp(1 - (zp - 0.3) / 6.5, 0.05, 1), cyp = -F * CAM / ((zp + zp2) / 2);
      out += '<circle cx="0" cy="' + cyp.toFixed(1) + '" r="' + ((a1 + a2) / 2).toFixed(1) + '" fill="none" stroke="rgba(150,168,118,' + (0.06 + 0.22 * Lp).toFixed(3) + ')" stroke-width="' + Math.max(a1 - a2, 1).toFixed(1) + '"/>';
    }
    rings.innerHTML = out; lines.innerHTML = ln;
    var cOp = smooth(.7, 1.2, zp) * (1 - smooth(3.2, 4, zp));
    cap.style.opacity = still() ? 1 : cOp.toFixed(3);
    return { ze: ZEND - D };
  }
  function frame(force) {
    waveFrame(force);
    var vw = innerWidth, vh = innerHeight;
    if (still()) {
      var b = box.getBoundingClientRect();
      tunnel(0.36);
      exit.style.clipPath = ''; copy.style.opacity = ''; copy.style.transform = ''; exitIn.style.opacity = ''; exitIn.style.transform = '';
      patch.style.strokeDasharray = '100 0';
      return;
    }
    var r = tube.getBoundingClientRect();
    if (!force && (r.bottom < -50 || r.top > vh + 50)) return;
    var p = clamp(-r.top / (r.height - vh), 0, 1);
    if (!force && frame.p === p) return; frame.p = p;
    var o = tunnel(p), s = Math.max(vw, vh) / 1000;
    var rad = F / o.ze * s, cy = vh / 2 + (-F * CAM / o.ze) * s;
    exit.style.clipPath = 'circle(' + Math.min(rad, Math.hypot(vw, vh)).toFixed(1) + 'px at 50% ' + cy.toFixed(1) + 'px)';
    fade.style.opacity = (1 - smooth(0, .06, p)).toFixed(3);
    var co = 1 - smooth(.1, .26, p);
    copy.style.opacity = co.toFixed(3); copy.style.transform = 'translate3d(0,' + (-40 * (1 - co)).toFixed(1) + 'px,0)';
    var ei = smooth(.76, .94, p);
    exitIn.style.opacity = ei.toFixed(3); exitIn.style.transform = 'scale(' + (0.9 + 0.1 * ei).toFixed(4) + ')';
    var pk = smooth(.88, 1, p) * 100;
    patch.style.strokeDasharray = pk.toFixed(1) + ' ' + (100 - pk).toFixed(1);
    flows.forEach(function (f, k) { f.style.transform = 'scale(' + (1 + 0.05 * Math.sin(p * 30 + k)).toFixed(3) + ')'; });
  }
  var ticking = false;
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; frame(false); navState(); }); }
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', function () { frame(true); trace(traceT); }, { passive: true });

  // ================================================================ nav: shrink after the concept bar, current section, the probe hides while the hero buttons show
  var pill = $('[data-pill]'), probe = $('[data-probe]'), heroActs = $('.hero .acts'), sendBtn = $('[data-send]'), footActs = $('.facts-acts');
  var navLinks = $$('.links a'), secs = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var concept = $('[data-concept]');
  function navState() {
    pill.classList.toggle('up', scrollY > 30);
    pill.style.top = scrollY > 30 ? '' : 'calc(' + (concept.offsetHeight + 8) + 'px + env(safe-area-inset-top))';
    var mid = innerHeight * .4, cur = -1;
    secs.forEach(function (s, i) { if (s) { var r = s.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) cur = i; } });
    navLinks.forEach(function (a, i) { if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    var ha = heroActs.getBoundingClientRect(), sb = sendBtn.getBoundingClientRect();
    var fa = footActs.getBoundingClientRect(), vis = function (r) { return r.bottom > 0 && r.top < innerHeight; };
    probe.classList.toggle('away', vis(ha) || vis(sb) || vis(fa));
  }

  setLang(root.lang === 'en' ? 'en' : 'he');
  navState(); frame(true);
  window.__frame = frame;
})();
