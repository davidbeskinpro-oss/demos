(function () {
  var root = document.documentElement, WA = '972587212727';
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var clamp = function (v, a, b) { a = a == null ? 0 : a; b = b == null ? 1 : b; return v < a ? a : v > b ? b : v; };
  var smooth = function (a, b, v) { var t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  var ioC = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var TITLE = { he: 'P.C.P · מחשבים, סלולר ומעבדה · טרומפלדור 39, חיפה', en: 'P.C.P · Computers, Cellular & Lab · 39 Trumpeldor St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור P.C.P · זה אינו האתר הרשמי של העסק', en: 'Concept demo made for P.C.P · not the business’s official website' };
  var ARIA = { '.lang': ['Switch to English', 'מעבר לעברית'], '.step.prev': ['הגדלה קודמת', 'Previous magnification'], '.step.next': ['הגדלה הבאה', 'Next magnification'], '[data-nav]': ['ראשי', 'Main'], '#lab': ['המעבדה', 'The lab'], '[data-turret]': ['הגדלה', 'Magnification'], '[data-run]': ['תמונות מהחנות', 'Photos from the shop'] };

  // ---------------------------------------------------------------- language
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    try { localStorage.setItem('pcp-lang', l); } catch (e) {}
    var m = $('[name=model]'); if (m) m.placeholder = m.dataset[l === 'he' ? 'phHe' : 'phEn'];
    $$('option[data-he]').forEach(function (o) { o.textContent = o.dataset[l]; });
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    Object.keys(ARIA).forEach(function (k) { var el = $(k); if (el) el.setAttribute('aria-label', ARIA[k][l === 'he' ? 0 : 1]); });
    $('.map iframe').title = l === 'he' ? 'מפת Google: טרומפלדור 39, חיפה' : 'Google Maps: 39 Trumpeldor St, Haifa';
    lastMsg = ''; write(); hours(); trace(); lensK = null; lensTick();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch, remembered
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(), stage = lensStage;
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('pcp-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    if (!on) { $$('.rv').forEach(function (el) { el.classList.add('in'); }); cellsFinal(); meterFinal(); }
    lensK = null;
    // keep the same magnification when the pinned lens grows back or shrinks
    if (on) lensGo(stage, true); else { lensStill = stage; lensTick(); }
    lastMsg = ''; write();
  }); });
  motionUI();

  // ---------------------------------------------------------------- live opening status, Haifa time. null = closed that day; [0,24] = 24 hours
  var H = { 0: [10, 19], 1: [10, 19], 2: [10, 19], 3: [10, 19], 4: [10, 19], 5: [9, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, short, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = short = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); short = l ? 'פתוח עד ' + hhmm(t[1]) : 'Open until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); short = l ? 'נפתח היום ב-' + hhmm(t[0]) : 'Opens today ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      var tomorrow = nd === (n.d + 1) % 7;
      if (!H[nd]) { txt = short = l ? 'סגור עכשיו' : 'Closed now'; }
      else {
        var when = tomorrow ? (l ? 'מחר' : 'tomorrow') : (l ? 'ביום ' + dayHe[nd] : 'on ' + dayEn[nd]);
        var at = H[nd][0] === 0 && H[nd][1] === 24 ? (l ? ' · 24 שעות' : ' · 24 hours') : (l ? ' ב-' : ' at ') + hhmm(H[nd][0]);
        txt = (l ? 'סגור עכשיו · נפתח ' : 'Closed now · opens ') + when + at;
        short = (l ? 'נפתח ' : 'Opens ') + when + at;
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
  setInterval(status, 30000);
  window.__status = status; window.__H = H; window.__hours = hours;

  // ---------------------------------------------------------------- the repair tag writes the WhatsApp message
  var T = {
    he: { dev: { desktop: 'מחשב נייח', laptop: 'מחשב נייד', phone: 'טלפון', tablet: 'טאבלט' },
          hi: 'שלום לצוות P.C.P, הגעתי דרך האתר. ', has: 'יש לי ', model: ' (', modelEnd: ')', dash: ': ', when: { today: 'אפשר לקפוץ היום?', tomorrow: 'אפשר לקפוץ מחר?', week: 'מתי נוח לכם השבוע?' }, end: ' תודה!' },
    en: { dev: { desktop: 'a desktop PC', laptop: 'a laptop', phone: 'a phone', tablet: 'a tablet' },
          hi: 'Hi P.C.P team, I found you through your website. ', has: 'I have ', model: ' (', modelEnd: ')', dash: ': ', when: { today: 'Could I drop by today?', tomorrow: 'Could I drop by tomorrow?', week: 'When suits you this week?' }, end: ' Thanks!' }
  };
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]');
  function write() {
    var l = he() ? 'he' : 'en', t = T[l], f = new FormData(form);
    var model = (f.get('model') || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    var opt = form.querySelector('[name=issue]').selectedOptions[0];
    var m = t.hi + t.has + t.dev[f.get('dev') || 'desktop'] + (model ? t.model + model + t.modelEnd : '') + t.dash + opt.dataset[l] + '. ' + t.when[f.get('when') || 'today'] + t.end;
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    type(m);
  }
  var typeT = 0, lastMsg = '';
  function type(m) {
    clearInterval(typeT);
    if (still() || m === lastMsg || !lastMsg) { preview.textContent = m; lastMsg = m; return; }
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
  // every WhatsApp button outside the tag sends a short hello
  var hello = { he: 'שלום לצוות P.C.P, הגעתי דרך האתר ואשמח לעזרה.', en: 'Hi P.C.P team, I found you through your website and would like some help.' };
  function helloLinks() { $$('a[data-wa]').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(hello[he() ? 'he' : 'en']); }); }

  // ---------------------------------------------------------------- hero: the reticle's scale and the trace from the headline to the chip
  (function ticks() {
    var g = $('.reticle .ticks'), s = '';
    for (var i = 0; i < 72; i++) {
      var a = i / 72 * Math.PI * 2, r1 = 92, r2 = i % 6 === 0 ? 84 : 88;
      s += 'M' + (100 + Math.cos(a) * r1).toFixed(2) + ' ' + (100 + Math.sin(a) * r1).toFixed(2) + 'L' + (100 + Math.cos(a) * r2).toFixed(2) + ' ' + (100 + Math.sin(a) * r2).toFixed(2);
    }
    s += 'M100 20V44M100 156V180M20 100H44M156 100H180';
    g.innerHTML = '<path d="' + s + '"/>';
  })();
  var heroEl = $('.hero'), traceSvg = $('.trace'), traceP = $('[data-trace]'), traceC = $('[data-trace-pad]');
  function trace() {
    var hr = heroEl.getBoundingClientRect(), h1 = $('.hero h1').getBoundingClientRect(), eye = $('.eyepiece').getBoundingClientRect();
    traceSvg.setAttribute('viewBox', '0 0 ' + hr.width.toFixed(0) + ' ' + hr.height.toFixed(0));
    var ex = eye.left - hr.left + eye.width / 2, ey = eye.top - hr.top + eye.height / 2;
    var rtl = !he() ? false : true, d;
    var stacked = eye.bottom <= h1.top + 4;
    if (stacked) {
      // phone: a straight trace drops from the chip in the eyepiece to the headline
      d = 'M' + ex.toFixed(1) + ' ' + ey.toFixed(1) + 'V' + (h1.top - hr.top - 12).toFixed(1);
    } else {
      // desktop: from under the headline across the seam into the eyepiece, in 45-degree runs like a board trace
      var x0 = (rtl ? h1.right : h1.left) - hr.left, y0 = h1.bottom - hr.top + 2;
      var dir = ex > x0 ? 1 : -1, run = Math.abs(ex - x0);
      var yk = y0 + 10;
      var dx = Math.min(80, Math.abs(ey - yk));
      d = 'M' + x0.toFixed(1) + ' ' + y0.toFixed(1) + 'V' + yk.toFixed(1) + 'H' + (ex - dir * (dx + 0)).toFixed(1) + 'L' + ex.toFixed(1) + ' ' + (yk + (ey > yk ? 1 : -1) * dx).toFixed(1) + 'V' + ey.toFixed(1);
      if (run < 40) d = 'M' + x0 + ' ' + y0 + 'L' + ex + ' ' + ey;
    }
    traceP.setAttribute('d', d);
    var len = traceP.getTotalLength ? traceP.getTotalLength() : 2000;
    traceP.style.setProperty('--len', len.toFixed(0));
    traceC.setAttribute('cx', ex.toFixed(1)); traceC.setAttribute('cy', ey.toFixed(1));
  }

  // ---------------------------------------------------------------- THE LENS: board ×1 → chip ×8 → die ×64, then the iris opens
  var lens = $('#lab'), field = $('[data-field]'), iris = $('[data-iris]'), rim = $('[data-iris-rim]'), turret = $('[data-turret]');
  var L = { board: $('[data-layer=board]'), chip: $('[data-layer=chip]'), die: $('[data-layer=die]') };
  var caps = $$('[data-cap]'), objs = $$('[data-obj]'), magEl = $('[data-mag]'), glint = $('.glint'), copy = $('.lens-copy');
  var ZMAX = 100, ZOOM_END = 0.8, STAGE_Z = [1, 8, 64];
  var lensK = null, lensStage = 0, lensStill = 0;
  // zoom grows by the same factor for every bit of scroll, so the travel feels steady at every magnification
  function zAt(p) { return Math.exp(Math.log(ZMAX) * ioC(clamp(p / ZOOM_END))); }
  function stageOf(z) { return z < 3.2 ? 0 : z < 34 ? 1 : 2; }
  function setLayer(el, z, k, op) {
    if (op <= 0.001) { el.style.visibility = 'hidden'; return; }
    el.style.visibility = 'visible';
    el.style.opacity = op.toFixed(3);
    el.style.transform = 'scale(' + (z / k).toFixed(4) + ')';
  }
  function render(z, q) {
    setLayer(L.board, z, 1, z > 9.5 ? 0 : 1);
    // the chip layer is the same part drawn eight times finer: it takes over while the board is at ×4.5–×7
    setLayer(L.chip, z, 8, z > 90 ? 0 : smooth(4.5, 7, z));
    // then the lid clears and the die below comes into focus
    setLayer(L.die, z, 64, smooth(34, 52, z));
    // solder-mask green glint slides across as the stage tilts under the light
    var g = Math.log(z) / Math.log(ZMAX);
    glint.style.transform = 'translate(' + (-40 + g * 80).toFixed(1) + '%,' + (-30 + g * 40).toFixed(1) + '%)';
    glint.style.opacity = (0.4 + 0.6 * Math.sin(g * Math.PI)).toFixed(2);
    var st = stageOf(z); lensStage = st;
    caps.forEach(function (c, i) { c.classList.toggle('on', i === st); c.setAttribute('aria-hidden', i === st ? 'false' : 'true'); });
    objs.forEach(function (b, i) { b.setAttribute('aria-pressed', i === st ? 'true' : 'false'); });
    magEl.textContent = '×' + (z < 10 ? z.toFixed(1).replace(/\.0$/, '') : Math.round(z));
    // the iris: eight blades open from the centre of the die and let the next room in
    if (q <= 0) { iris.style.visibility = rim.style.visibility = 'hidden'; copy.style.opacity = turret.style.opacity = ''; }
    else {
      var sr = lens.querySelector('.lens-stage').getBoundingClientRect(), fr = field.getBoundingClientRect();
      var cx = fr.left - sr.left + fr.width / 2, cy = fr.top - sr.top + fr.height / 2;
      var far = Math.max(Math.hypot(cx, cy), Math.hypot(sr.width - cx, cy), Math.hypot(cx, sr.height - cy), Math.hypot(sr.width - cx, sr.height - cy));
      var e = ioC(q), R = e * far * 1.12, rot = e * 0.9;
      var oct = function (r) { var pts = []; for (var i = 0; i < 8; i++) { var a = rot + i / 8 * Math.PI * 2; pts.push((cx + Math.cos(a) * r).toFixed(1) + 'px ' + (cy + Math.sin(a) * r).toFixed(1) + 'px'); } return 'polygon(' + pts.join(',') + ')'; };
      iris.style.clipPath = oct(R);
      // the blades' brass edge, just outside the opening
      rim.style.clipPath = oct(R + 3 + 5 * (1 - e));
      iris.style.visibility = rim.style.visibility = 'visible';
      var fade = (1 - smooth(0.25, 0.6, q)).toFixed(3);
      copy.style.opacity = turret.style.opacity = fade;
    }
  }
  function lensP() { var r = lens.getBoundingClientRect(); return clamp(-r.top / (r.height - innerHeight)); }
  function lensTick() {
    if (still()) {
      if (lensK === 's' + lensStill) return; lensK = 's' + lensStill;
      render(STAGE_Z[lensStill], 0); return;
    }
    var r = lens.getBoundingClientRect();
    if (r.bottom < -50 || r.top > innerHeight + 50) return;
    var p = lensP(), key = p.toFixed(4);
    if (key === lensK) return; lensK = key;
    render(zAt(p), clamp((p - ZOOM_END - 0.02) / 0.16));
  }
  // tap a lens on the turret: with motion on, scroll to where that magnification lives; with motion off, just switch
  function pForZ(z) { var lo = 0, hi = ZOOM_END; for (var i = 0; i < 30; i++) { var m = (lo + hi) / 2; if (zAt(m) < z) lo = m; else hi = m; } return (lo + hi) / 2; }
  function lensGo(i, instant) {
    i = clamp(i, 0, 2);
    if (still()) { lensStill = i; lensK = null; lensTick(); return; }
    var z = i === 0 ? 1 : i === 1 ? 12 : 70, p = i === 0 ? 0.01 : pForZ(z);
    var top = lens.getBoundingClientRect().top + scrollY + p * (lens.offsetHeight - innerHeight);
    scrollTo({ top: top, behavior: instant ? 'auto' : 'smooth' });
  }
  objs.forEach(function (b, i) { b.addEventListener('click', function () { lensGo(i); }); });
  $$('[data-step]').forEach(function (b) { b.addEventListener('click', function () { lensGo((still() ? lensStill : lensStage) + (+b.dataset.step)); }); });
  window.__lens = { render: render, zAt: zAt };

  // ---------------------------------------------------------------- reveals: once per section entrance, and again after leaving
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) e.target.classList.add('in');
      else if (e.boundingClientRect.top > innerHeight) e.target.classList.remove('in');
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(function (el) {
    var sib = el.parentElement ? $$('.rv', el.parentElement).indexOf(el) : 0;
    el.style.setProperty('--rd', Math.min(sib, 5) * 75 + 'ms');
    io.observe(el);
  });
  if (still()) $$('.rv').forEach(function (el) { el.classList.add('in'); });

  // ---------------------------------------------------------------- the tray's small instruments
  // seven-segment digits for the POST-code display: the board counts through its checks and stops at A0, ready
  var SEG = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg', A: 'abcefg', b: 'cdefg', C: 'adef', d: 'bcdeg', E: 'adefg', F: 'aefg' };
  var SP = { a: 'M6 0h22l-4 5H10z', b: 'M29 1l3 4v15l-3 3-3-3V6z', c: 'M29 24l3 3v15l-3 4-3-4V27z', d: 'M6 47h22l-4-5H10z', e: 'M5 24l3 3v15l-3 4-3-4V27z', f: 'M5 1l3 4v15l-3 3-3-3V6z', g: 'M7 23.5l3-3h14l3 3-3 3H10z' };
  $$('.seg').forEach(function (g) { g.innerHTML = 'abcdefg'.split('').map(function (k) { return '<path data-k="' + k + '" d="' + SP[k] + '"/>'; }).join(''); });
  function showCode(c) { $$('.seg').forEach(function (g, i) { var on = SEG[c[i]] || ''; $$('path', g).forEach(function (p) { p.classList.toggle('on', on.indexOf(p.dataset.k) >= 0); }); }); }
  // heat mat: the dots warm from the centre of the mat outwards
  (function () {
    var g = $('.heat'), s = '';
    for (var x = 32; x <= 208; x += 16) for (var y = 26; y <= 124; y += 14) { var d = Math.hypot(x - 120, (y - 75) * 1.4); s += '<circle cx="' + x + '" cy="' + y + '" r="2.4" style="--o:' + Math.max(0.12, 0.85 - d / 130).toFixed(2) + '"/>'; }
    g.innerHTML = s;
  })();
  var cells = $$('.cell[data-live]');
  function cellRun(c) {
    if (still()) return;
    clearTimeout(c._t); (c._ts || []).forEach(clearTimeout); c._ts = [];
    c.classList.remove('ok'); c.classList.add('live');
    var kind = c.dataset.live;
    if (kind === 'post') {
      ['00', '19', '4F', '62', 'A2', 'b4', 'A0'].forEach(function (code, i) { c._ts.push(setTimeout(function () { showCode(code); if (code === 'A0') c.classList.add('ok'); }, 200 + i * 360)); });
    }
    if (kind === 'mat') {
      var deg = $('.deg', c), t0 = performance.now();
      (function f(t) { var k = clamp((t - t0) / 1600); deg.textContent = Math.round(k * 80) + '°'; if (k < 1 && c.classList.contains('live')) c._raf = requestAnimationFrame(f); })(t0);
    }
    if (kind === 'pick') {
      var sel = $('.sel', c), path = [0, 1, 2, 1];
      $$('.opt', c).forEach(function (o) { o.classList.remove('best'); }); $('.tick', c).setAttribute('d', 'M0 0');
      path.forEach(function (k, i) { c._ts.push(setTimeout(function () { sel.style.transform = 'translateX(' + (k * 70) + 'px)'; if (i === path.length - 1) { $$('.opt', c)[1].classList.add('best'); $('.tick', c).setAttribute('d', 'M110 92l7 7 14-15'); } }, 150 + i * 520)); });
    }
  }
  function cellReset(c) { (c._ts || []).forEach(clearTimeout); cancelAnimationFrame(c._raf); c.classList.remove('live', 'ok'); }
  function cellsFinal() {
    showCode('A0');
    cells.forEach(function (c) { (c._ts || []).forEach(clearTimeout); c.classList.add('live'); });
    $('.cell[data-live=post]').classList.add('ok');
    $('.deg').textContent = '80°';
    var p = $('.cell[data-live=pick]'); $('.sel', p).style.transform = 'translateX(70px)'; $$('.opt', p)[1].classList.add('best'); $('.tick', p).setAttribute('d', 'M110 92l7 7 14-15');
  }
  showCode('00');
  var cio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && e.intersectionRatio > 0.5) { if (!e.target._on) { e.target._on = true; cellRun(e.target); } } else if (!e.isIntersecting) { e.target._on = false; if (!still()) cellReset(e.target); } }); }, { threshold: [0, 0.5] });
  cells.forEach(function (c) { cio.observe(c); });
  if (still()) cellsFinal();

  // the multimeter reads the rating
  var meter = $('.meter'), mtxt = $('[data-meter]');
  function meterRun() {
    if (still()) return meterFinal();
    meter.classList.add('lit'); var t0 = performance.now();
    (function f(t) { var k = clamp((t - t0) / 1300); mtxt.textContent = (4.5 * (1 - Math.pow(1 - k, 3))).toFixed(1); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  function meterFinal() { meter.classList.add('lit'); mtxt.textContent = '4.5'; }
  new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) meterRun(); else if (!still()) { meter.classList.remove('lit'); mtxt.textContent = '0.0'; } }); }, { threshold: 0.6 }).observe(meter);
  if (still()) meterFinal();

  // ---------------------------------------------------------------- the lab tag (phones): opens to call / WhatsApp; steps aside over the hero and the composer
  var tag = $('[data-tag]'), face = $('[data-tag-face]');
  face.addEventListener('click', function () { var o = !tag.classList.contains('open'); tag.classList.toggle('open', o); face.setAttribute('aria-expanded', o ? 'true' : 'false'); });
  document.addEventListener('click', function (e) { if (!tag.contains(e.target) && tag.classList.contains('open')) { tag.classList.remove('open'); face.setAttribute('aria-expanded', 'false'); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && tag.classList.contains('open')) { tag.classList.remove('open'); face.setAttribute('aria-expanded', 'false'); face.focus(); } });
  var sendBtn = $('#composer');
  function tagTick() {
    var heroGone = heroEl.getBoundingClientRect().bottom < innerHeight * 0.5;
    var sr = sendBtn.getBoundingClientRect(), overSend = sr.top < innerHeight - 40 && sr.bottom > innerHeight - 140;
    tag.classList.toggle('hide', !heroGone || overSend);
  }

  // ---------------------------------------------------------------- one rAF-throttled scroll loop
  var queued = false;
  function frame() { queued = false; lensTick(); tagTick(); }
  function ask() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', ask, { passive: true });
  addEventListener('resize', function () { lensK = null; trace(); ask(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { trace(); });

  setLang(root.lang === 'en' ? 'en' : 'he');
  helloLinks();
  var _set = setLang; setLang = function (l) { _set(l); helloLinks(); };
  frame();
})();
