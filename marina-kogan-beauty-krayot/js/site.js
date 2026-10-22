(function () {
  var root = document.documentElement, WA = '972527863873';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: 'מרינה קוגן · מכון יופי · חניתה 10, קריית ביאליק', en: 'Marina Kogan · Beauty salon · 10 Hanita St, Kiryat Bialik' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור מרינה קוגן · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Marina Kogan · This is not the business’s official website' };
  var STAR = '<svg viewBox="0 0 92 16" aria-hidden="true">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; }).join('') + '</svg>';
  $$('[data-stars]').forEach(function (s) { s.innerHTML = STAR; s.setAttribute('role', 'img'); });

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-stars]').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
    var aria = function (sel, h, e) { var el = $(sel); if (el) el.setAttribute('aria-label', l === 'he' ? h : e); };
    aria('[data-pill]', 'ראשי', 'Main');
    aria('[data-p-call]', 'התקשרו למרינה קוגן, 052-786-3873', 'Call Marina Kogan, 052-786-3873');
    aria('[data-p-wa]', 'וואטסאפ למרינה קוגן', 'WhatsApp Marina Kogan');
    $$('.leaf').forEach(function (b, k) { b.setAttribute('aria-label', (l === 'he' ? 'עבודת ריסים ' : 'Lash work ') + (k + 1) + (l === 'he' ? ' מתוך 7' : ' of 7')); });
    var nm = $('[name=nm]'); nm.placeholder = nm.dataset[l === 'he' ? 'phHe' : 'phEn'];
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('mk-lang', l); } catch (e) {}
    texts(l); hours(); buildDays(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(), anchor = $('#lashes'), keep = anchor.getBoundingClientRect().top;
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('mk-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    if (!on) resetAll();
    fan.classList.add('open');
    layout();
    // the stage changes height between the two modes: keep the visitor where they were if they were past it
    if (keep < innerHeight) { var now = anchor.getBoundingClientRect().top; if (now !== keep) scrollBy(0, now - keep); }
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9, 19], 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 15], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], shortEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'numeric', year: 'numeric', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, date: new Date(Date.UTC(+o.year, +o.month - 1, +o.day)) };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false, short;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; short = l ? 'פתוח עכשיו' : 'Open now'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); short = l ? 'פתוח עד ' + hhmm(t[1]) : 'Open till ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); short = l ? 'נפתח ב-' + hhmm(t[0]) : 'Opens ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
      short = !H[nd] ? (l ? 'סגור' : 'Closed') : nd === (n.d + 1) % 7 ? (l ? 'נפתח מחר ב-' + hhmm(H[nd][0]) : 'Opens tomorrow ' + hhmm(H[nd][0])) : (l ? 'נפתח ביום ' + shortHe[nd] + ' ' + hhmm(H[nd][0]) : 'Opens ' + shortEn[nd] + ' ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    var ps = $('[data-pad-status]'); if (ps) ps.textContent = short;
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // consecutive days with the same hours share a row; the week starts on Sunday
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var two = r[1] - r[0] === 1;
      var label = r[0] === r[1] ? names[r[0]] : names[r[0]] + (two ? (l ? ' ו' : ' and ') : '–') + names[r[1]];
      var time = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + label + '</td><td>' + time + '</td></tr>';
    }).join('');
    status();
  }
  window.__status = status; window.__H = H; window.__hours = hours;
  setInterval(status, 60000);

  // ---------------------------------------------------------------- the tray: treatment, day, part of the day, name
  // days: the next open days from today (Saturday is closed, so it never appears); parts of the day grey out once over, or
  // when the salon closes before them (Friday ends at 15:00)
  var PARTS = [[9, 12, 'בוקר', 'Morning', 'בבוקר', 'in the morning'], [12, 15, 'צהריים', 'Midday', 'בצהריים', 'around midday'], [15, 19, 'אחה״צ', 'Afternoon', 'אחר הצהריים', 'in the afternoon']];
  var days = [], pick = { day: null, time: null };
  function buildDays() {
    var l = he(), n = window.__now || now(), d0 = n.date || new Date();
    days = [];
    for (var i = 0; i < 9 && days.length < 6; i++) {
      var dow = (n.d + i) % 7, t = H[dow]; if (!t) continue;
      var dt = new Date(d0.getTime() + i * 864e5);
      days.push({ dow: dow, dd: dt.getUTCDate(), mm: dt.getUTCMonth() + 1, i: i, over: i === 0 && n.h >= t[1] - 0.75 });
    }
    $('[data-days]').innerHTML = days.map(function (d, k) {
      var name = d.i === 0 ? (l ? 'היום' : 'Today') : d.i === 1 ? (l ? 'מחר' : 'Tmrw') : (l ? shortHe[d.dow] : shortEn[d.dow]);
      var lab = (d.i === 0 ? (l ? 'היום' : 'Today') : d.i === 1 ? (l ? 'מחר' : 'Tomorrow') : (l ? 'יום ' + dayHe[d.dow] : dayEn[d.dow])) + ' ' + d.dd + '.' + d.mm;
      return '<label><input type="radio" name="day" value="' + k + '"' + (d.over ? ' disabled' : '') + (pick.day === k && !d.over ? ' checked' : '') + ' aria-label="' + lab + '"><span>' + name + '<small>' + d.dd + '.' + d.mm + '</small></span></label>';
    }).join('');
    if (pick.day != null && (!days[pick.day] || days[pick.day].over)) pick.day = null;
    buildTimes();
  }
  function buildTimes() {
    var l = he(), n = window.__now || now(), d = pick.day != null ? days[pick.day] : null;
    $('[data-times]').innerHTML = PARTS.map(function (s, k) {
      var t = d ? H[d.dow] : null;
      var off = (d && d.i === 0 && n.h >= s[1] - 0.5) || (t && s[0] >= t[1]);
      if (off && pick.time === k) pick.time = null;
      var end = t ? Math.min(s[1], t[1]) : s[1];
      return '<label><input type="radio" name="time" value="' + k + '"' + (off ? ' disabled' : '') + (pick.time === k ? ' checked' : '') + '><span>' + (l ? s[2] : s[3]) + '<small dir="ltr">' + hhmm(s[0]) + '–' + hhmm(end) + '</small></span></label>';
    }).join('');
  }
  var T = {
    he: { hi: 'שלום מרינה, הגעתי דרך האתר. ', svc: { ext: 'אשמח לקבוע תור להלחמת ריסים', lift: 'אשמח לקבוע תור להרמת ריסים', brows: 'אשמח לקבוע תור לגבות', pmu: 'אשמח לקבוע תור לאיפור קבוע', face: 'אשמח לקבוע תור לטיפול פנים', other: 'אשמח לקבוע תור' },
      other: ' אפשר לדבר על הטיפול בטלפון?', today: ' היום', tmrw: ' מחר', on: ' ביום ', name: ' קוראים לי ', ask: ' זה מתאים?', any: ' מתי יש מקום?' },
    en: { hi: 'Hi Marina, I found you through the website. ', svc: { ext: 'I’d like to book lash extensions', lift: 'I’d like to book a lash lift', brows: 'I’d like to book a brow appointment', pmu: 'I’d like to book permanent makeup', face: 'I’d like to book a facial', other: 'I’d like to book an appointment' },
      other: ' Could we talk about the treatment by phone?', today: ' today', tmrw: ' tomorrow', on: ' on ', name: ' My name is ', ask: ' Does that work for you?', any: ' When do you have a free slot?' }
  };
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]'), nm = $('[name=nm]');
  function message() {
    var l = root.lang === 'en' ? 'en' : 'he', t = T[l], fd = new FormData(form), svc = fd.get('svc') || 'ext';
    var name = (nm.value || '').replace(/\s+/g, ' ').trim().slice(0, 40).replace(/[.!?]+$/, '');
    var m = t.hi + t.svc[svc], d = pick.day != null ? days[pick.day] : null, s = pick.time != null ? PARTS[pick.time] : null;
    if (d) m += d.i === 0 ? t.today : d.i === 1 ? t.tmrw : t.on + (l === 'he' ? dayHe[d.dow] : dayEn[d.dow]) + ' ' + d.dd + '.' + d.mm;
    if (s) m += ' ' + (l === 'he' ? s[4] : s[5]);
    m += '.';
    if (svc === 'other') m += t.other;
    if (name) m += t.name + name + '.';
    return m + (d || s ? t.ask : t.any);
  }
  function write(instant) {
    var m = message();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    type(m, instant);
  }
  // the message writes itself in from where it changed
  var typeT = 0, lastM = '';
  function type(m, instant) {
    clearInterval(typeT);
    if (instant || still() || !lastM) { preview.textContent = m; lastM = m; return; }
    var keep = 0; while (keep < m.length && keep < lastM.length && m[keep] === lastM[keep]) keep++;
    lastM = m;
    var i = keep, caret = '<span class="caret"></span>';
    typeT = setInterval(function () {
      i = Math.min(m.length, i + 2);
      preview.textContent = m.slice(0, i);
      if (i < m.length) preview.insertAdjacentHTML('beforeend', caret); else clearInterval(typeT);
    }, 16);
  }
  form.addEventListener('change', function (e) {
    if (e.target.name === 'day') { pick.day = +e.target.value; buildTimes(); }
    if (e.target.name === 'time') pick.time = +e.target.value;
    write();
  });
  nm.addEventListener('input', function () { write(true); });
  window.__message = message;

  // ---------------------------------------------------------------- entrances, once, staggered inside each section
  $$('section, header').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { io && !still() ? io.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- the volume fan: opens as it comes in, closes when it has
  // left the screen so it opens again next time; tap or Enter lifts one photo (and lowers the one before)
  var fan = $('[data-fan]');
  if ('IntersectionObserver' in window && !still()) new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.intersectionRatio > 0.35) fan.classList.add('open'); else if (!e.isIntersecting && !still()) fan.classList.remove('open'); });
  }, { threshold: [0, 0.35] }).observe(fan);
  else fan.classList.add('open');
  $$('.leaf').forEach(function (b) { b.addEventListener('click', function () {
    var on = b.getAttribute('aria-pressed') === 'true';
    $$('.leaf').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
    b.setAttribute('aria-pressed', on ? 'false' : 'true');
  }); });
  fan.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Escape') return;
    var ls = $$('.leaf'), k = ls.indexOf(document.activeElement);
    if (e.key === 'Escape') { ls.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); return; }
    if (k < 0) return;
    var fwd = (e.key === 'ArrowRight') !== he() ? 1 : -1;
    ls[clamp(k + fwd, 0, ls.length - 1)].focus(); e.preventDefault();
  });

  // ---------------------------------------------------------------- nav: where you are; the pill rises past the concept bar
  var pill = $('[data-pill]'), links = $$('.links a');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['lashes', 'place', 'reviews', 'book', 'visit'].forEach(function (id) { var el = document.getElementById(id); if (el) nio.observe(el); });
  }

  // ---------------------------------------------------------------- the gel pad: on phones, once the page's own buttons are out of sight
  var pad = $('[data-pad]'), seen = new Set();
  if (pad && 'IntersectionObserver' in window) {
    var kio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? seen.add(e.target) : seen.delete(e.target); }); pad.classList.toggle('away', seen.size > 0); }, { threshold: 0 });
    $$('[data-keep-clear]').forEach(function (el) { kio.observe(el); });
  }

  // ---------------------------------------------------------------- THE CAMERA AND THE BLINK
  // The world is her wide photograph of the treatment room. The camera moves in on the work, the room dims around it and a
  // soft light gathers on her hands. Then the eye blinks: the upper lid comes down with its lash line, meets the lower lid, the
  // words sit under the lashes; behind the closed lids the wide shot is swapped for her closer photograph of the same moment,
  // in which Marina has looked up at the camera, and the eye opens on it. A cut, the way a blink is one.
  // Scroll-linked both ways; only transform and opacity change while scrolling.
  var camEl = $('[data-cam]'), stage = $('[data-stage]'), world = $('[data-world]'), light = $('[data-light]'), dim = $('[data-dim]'),
      copy = $('[data-copy]'), shade = $('[data-shade]'), capC = $('[data-cap-close]'), lidU = $('[data-lid-up]'), lidD = $('[data-lid-down]'),
      lidword = $('[data-lidword]'), marina = $('[data-marina]'), mimg = $('[data-marina] img'), mcopy = $('[data-mcopy]');
  var R9 = 2000 / 1333;
  var P = { x: 0.575, y: 0.56 };                               // the work: her gloved hands and the pen at the brow
  var F = { x: 0.58, y: 0.52 };                                // what the first frame is centred on
  var vw = 0, vh = 0, sTop = 0, sH = 0, G = {}, LID = {}, lastKey = '';
  var curve = function (p) { var u = clamp((p - 0.03) / 0.6, 0, 1); return 1 - (1 - u) * (1 - u); };
  var ZMAX = 2.05;
  function cam(p) {
    var c = curve(p), z = 1 + (ZMAX - 1) * c;
    var tx = (G.cx - G.px) * c, ty = (G.cy - G.py) * c;
    return { z: z, tx: tx, ty: ty, sx: G.px + tx, sy: G.py + ty };
  }
  function place() {
    var W = Math.max(vw, vh * R9), Hh = W / R9;
    var ox = clamp(vw / 2 - F.x * W, vw - W, 0), oy = clamp(vh / 2 - F.y * Hh, vh - Hh, 0);
    G = { W: W, H: Hh, ox: ox, oy: oy, px: ox + P.x * W, py: oy + P.y * Hh, cx: vw / 2, cy: vh * (vw < 700 ? 0.5 : 0.46) };
    world.style.left = ox + 'px'; world.style.top = oy + 'px'; world.style.width = W + 'px'; world.style.height = Hh + 'px';
    world.style.transformOrigin = (P.x * W).toFixed(1) + 'px ' + (P.y * Hh).toFixed(1) + 'px';
    paintLids();
    root.classList.add('placed');
  }

  // the lids, painted once per size. Upper: the lid down to a lash line that sags a little in the middle (a closed eye),
  // the lashes hanging from it in volume fans, longer toward the outer thirds (a lash map), each one tapered and curled at
  // the tip, with a faint sheen on one side. Lower: a lighter lid with short, sparse lashes.
  function lashesAlong(ctx, n, edge, len, dpr, up) {
    for (var i = 0; i <= n; i++) {
      var t = i / n, x = t * vw, base = edge(x);
      var L = len(t), spread = up ? 4 : 2;
      for (var k = 0; k < spread; k++) {
        var j = (Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1; j = j < 0 ? j + 1 : j;
        var a = ((t - 0.5) * (up ? 0.9 : 0.6)) + (k - (spread - 1) / 2) * (up ? 0.11 : 0.3) + (j - 0.5) * (up ? 0.08 : 0.5);
        var l = L * (up ? 0.82 + 0.3 * j : 0.5 + 0.8 * j), w = (up ? 1.25 : 0.65) * (0.85 + 0.3 * j);
        var dx = Math.sin(a), dy = Math.cos(a), out = t < 0.5 ? -1 : 1;
        var x0 = x + (j - 0.5) * 3, y0 = base - 1;
        var x1 = x0 + dx * l * 0.45, y1 = y0 + dy * l * 0.95;
        var x2 = x0 + dx * l * 1.05 + out * l * 0.14, y2 = y0 + dy * l * 0.86;
        var pts = [], N = 9;
        for (var s = 0; s <= N; s++) {
          var u = s / N, iu = 1 - u;
          var bx = iu * iu * x0 + 2 * iu * u * x1 + u * u * x2, by = iu * iu * y0 + 2 * iu * u * y1 + u * u * y2;
          var gx = 2 * iu * (x1 - x0) + 2 * u * (x2 - x1), gy = 2 * iu * (y1 - y0) + 2 * u * (y2 - y1), gl = Math.hypot(gx, gy) || 1;
          var ww = w * Math.pow(1 - u, 0.85) + 0.08;
          pts.push([bx, by, -gy / gl * ww, gx / gl * ww]);
        }
        ctx.beginPath();
        pts.forEach(function (q, s) { s ? ctx.lineTo((q[0] + q[2]) * dpr, (q[1] + q[3]) * dpr) : ctx.moveTo((q[0] + q[2]) * dpr, (q[1] + q[3]) * dpr); });
        for (var r = pts.length - 1; r >= 0; r--) ctx.lineTo((pts[r][0] - pts[r][2]) * dpr, (pts[r][1] - pts[r][3]) * dpr);
        ctx.closePath();
        ctx.fillStyle = up ? 'rgba(9,6,8,.96)' : 'rgba(12,8,10,.85)'; ctx.fill();
        if (up && j > 0.35) {
          ctx.beginPath();
          pts.forEach(function (q, s) { if (s < N - 1) { s ? ctx.lineTo((q[0] + q[2] * .6) * dpr, (q[1] + q[3] * .6) * dpr) : ctx.moveTo((q[0] + q[2] * .6) * dpr, (q[1] + q[3] * .6) * dpr); } });
          ctx.strokeStyle = 'rgba(255,226,214,' + (0.1 + 0.16 * j).toFixed(3) + ')'; ctx.lineWidth = 0.6 * dpr; ctx.stroke();
        }
      }
    }
  }
  function grain(c, w, h) {
    // skin grain: a few thousand faint specks, lighter and darker, seeded so every paint is the same
    var n = Math.round(w * h / 900), sd = 7;
    var rnd = function () { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
    for (var i = 0; i < n; i++) { var lt = rnd() > 0.5; c.fillStyle = lt ? 'rgba(255,230,222,.05)' : 'rgba(10,5,8,.07)'; c.fillRect(rnd() * w, rnd() * h, 1.6, 1.6); }
  }
  function paintLids() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var sag = Math.min(70, vw * 0.06), Lmax = clamp(vh * 0.11, 46, 104), e0 = vh * 0.5 - sag * 0.7;
    var bow = function (x) { var q = 2 * x / vw - 1; return sag * (1 - q * q); };
    // upper lid
    var hu = Math.ceil(e0 + sag + Lmax * 1.2 + 6);
    lidU.width = Math.round(vw * dpr); lidU.height = Math.round(hu * dpr); lidU.style.height = hu + 'px';
    var c = lidU.getContext('2d'); c.clearRect(0, 0, lidU.width, lidU.height);
    c.beginPath(); c.moveTo(0, 0); c.lineTo(vw * dpr, 0);
    for (var x = vw; x >= 0; x -= 8) c.lineTo(x * dpr, (e0 + bow(x)) * dpr);
    c.closePath();
    var g = c.createLinearGradient(0, 0, 0, (e0 + sag) * dpr);
    g.addColorStop(0, '#191217'); g.addColorStop(0.55, '#3a2830'); g.addColorStop(0.9, '#6a4950'); g.addColorStop(1, '#7c565c');
    c.fillStyle = g; c.fill();
    // the lid itself: the crease above, a soft sheen on the lid, a fine grain of skin
    c.save(); c.clip();
    c.beginPath(); for (x = -20; x <= vw + 20; x += 8) { var yc = (e0 - Math.min(vh * 0.16, 130) + bow(x) * 1.35) * dpr; x > -20 ? c.lineTo(x * dpr, yc) : c.moveTo(x * dpr, yc); }
    c.strokeStyle = 'rgba(22,12,17,.22)'; c.lineWidth = 24 * dpr; c.shadowColor = 'rgba(22,12,17,.5)'; c.shadowBlur = 44 * dpr; c.stroke(); c.shadowBlur = 0;
    grain(c, lidU.width, lidU.height);
    c.restore();
    // the lash line: a dense dark band along the margin, then the lashes
    c.beginPath(); for (x = 0; x <= vw; x += 8) { var yy = (e0 + bow(x) - 1.5) * dpr; x ? c.lineTo(x * dpr, yy) : c.moveTo(0, yy); }
    c.strokeStyle = 'rgba(8,5,7,.95)'; c.lineWidth = 3.2 * dpr; c.stroke();
    lashesAlong(c, Math.round(vw / 6.5), function (x) { return e0 + bow(x); }, function (t) { return Lmax * (0.62 + 0.42 * Math.pow(Math.sin(Math.PI * clamp(t * 1.08 - 0.04, 0, 1)), 0.7)); }, dpr, true);
    // lower lid: its top edge sits a few pixels above the upper lid's edge when closed, so the two never leave a gap
    var top = e0 - 10, hd = Math.ceil(vh - top + 40);
    lidD.width = Math.round(vw * dpr); lidD.height = Math.round(hd * dpr); lidD.style.height = hd + 'px';
    c = lidD.getContext('2d'); c.clearRect(0, 0, lidD.width, lidD.height);
    c.beginPath(); c.moveTo(0, hd * dpr); c.lineTo(vw * dpr, hd * dpr);
    for (x = vw; x >= 0; x -= 8) c.lineTo(x * dpr, (bow(x)) * dpr);
    c.closePath();
    g = c.createLinearGradient(0, 0, 0, hd * dpr);
    g.addColorStop(0, '#8a6266'); g.addColorStop(0.1, '#71525a'); g.addColorStop(0.45, '#3b2a32'); g.addColorStop(1, '#161015');
    c.fillStyle = g; c.fill();
    c.save(); c.clip(); grain(c, lidD.width, lidD.height); c.restore();
    lashesAlong(c, Math.round(vw / 16), function (x) { return bow(x) + 3; }, function (t) { return Lmax * 0.22 * (0.6 + 0.6 * Math.sin(Math.PI * t)); }, dpr, false);
    LID = { hu: hu, top: top, hd: hd, e0: e0, sag: sag, Lmax: Lmax };
    lidword.style.top = (e0 + sag + Lmax * 1.15 + 18) + 'px';
  }
  function resetAll() {
    [camEl, world, light, dim, copy, shade, capC, lidU, lidD, lidword, marina, mimg, mcopy].forEach(function (e) { e.style.transform = ''; e.style.opacity = ''; e.style.visibility = ''; });
    $$('.band img').forEach(function (i) { i.style.transform = ''; });
    $$('[data-far]').forEach(function (i) { i.style.opacity = ''; });
    $$('.d-near').forEach(function (i) { i.style.transform = ''; });
    lastKey = '';
  }
  // the blink, on the stage's run: close fast, a short hold, open a little slower (as eyes do)
  var B = { c0: 0.62, c1: 0.71, o0: 0.77, o1: 0.9 };
  function paint(p) {
    var c = cam(p);
    world.style.transform = 'translate3d(' + c.tx.toFixed(1) + 'px,' + c.ty.toFixed(1) + 'px,0) scale(' + c.z.toFixed(4) + ')';
    var lo = smooth((p - 0.1) / 0.3) * (1 - smooth((p - 0.7) / 0.06));
    light.style.transform = 'translate3d(' + c.sx.toFixed(1) + 'px,' + c.sy.toFixed(1) + 'px,0) scale(' + lerp(0.6, 1, smooth((p - 0.1) / 0.4)).toFixed(3) + ')';
    light.style.opacity = (0.95 * lo).toFixed(3);
    dim.style.transform = 'translate3d(' + c.sx.toFixed(1) + 'px,' + c.sy.toFixed(1) + 'px,0) scale(' + lerp(1.6, 1, smooth((p - 0.12) / 0.45)).toFixed(3) + ')';
    dim.style.opacity = (0.9 * smooth((p - 0.12) / 0.32)).toFixed(3);
    var o = 1 - smooth(p / 0.08);
    copy.style.opacity = o.toFixed(3); copy.style.transform = 'translate3d(0,' + (-30 * (1 - o)).toFixed(1) + 'px,0)';
    copy.style.visibility = o < 0.01 ? 'hidden' : '';
    shade.style.opacity = (1 - smooth((p - 0.04) / 0.14) + smooth((p - 0.86) / 0.08)).toFixed(3);
    var co = smooth((p - 0.22) / 0.05) * (1 - smooth((p - 0.56) / 0.05));
    capC.style.opacity = co.toFixed(3); capC.style.visibility = co > 0.01 ? 'visible' : 'hidden';
    // lids: 0 = open, 1 = shut
    var shut = p < B.o0 ? smooth((p - B.c0) / (B.c1 - B.c0)) : 1 - smooth((p - B.o0) / (B.o1 - B.o0));
    var eC = shut * shut * (3 - 2 * shut);
    lidU.style.transform = 'translate3d(0,' + (-(LID.hu + 8) * (1 - eC)).toFixed(1) + 'px,0)';
    lidD.style.transform = 'translate3d(0,' + (LID.top + (vh - LID.top + 12) * (1 - eC)).toFixed(1) + 'px,0)';
    var lw = smooth((p - B.c1 + 0.01) / 0.025) * (1 - smooth((p - B.o0 + 0.005) / 0.02));
    lidword.style.opacity = lw.toFixed(3); lidword.style.visibility = lw > 0.01 ? 'visible' : 'hidden';
    // behind closed lids the room is swapped for Marina
    var swap = p >= (B.c1 + B.o0) / 2;
    camEl.style.opacity = swap ? '0' : '1';
    marina.style.opacity = swap ? '1' : '0';
    mimg.style.transform = 'scale(' + lerp(1.08, 1, smooth((p - B.o0) / 0.2)).toFixed(4) + ')';
    var mo = smooth((p - 0.9) / 0.06);
    mcopy.style.opacity = mo.toFixed(3); mcopy.style.visibility = mo < 0.01 ? 'hidden' : ''; mcopy.style.transform = 'translate3d(0,' + (24 * (1 - mo)).toFixed(1) + 'px,0)';
  }
  window.__paint = function (p) { paint(p); };

  // the band of rooms: as it passes, each photo drifts sideways at its own speed, the nearer ones faster (a slow pan)
  var band = $('[data-band]'), bandImgs = $$('.band img'), K = [1, 0.5, 0.8, 0.35];
  // the entrance: focus pulls from the gate and the tree to the door as the photo rises to the middle of the screen
  var door = $('[data-door]'), far = $('[data-far]'), near = $('.d-near');
  function tick() {
    var y = scrollY;
    if (pill) pill.classList.toggle('up', y > 24);
    if (still()) return;
    var run = sH - vh;
    var p = clamp((y - sTop) / Math.max(1, run), 0, 1), key = p.toFixed(4);
    if (key !== lastKey) { lastKey = key; paint(p); }
    var r = band.getBoundingClientRect();
    if (r.bottom > 0 && r.top < vh) {
      var t = clamp((vh - r.top) / (vh + r.height), 0, 1) * 2 - 1, dir = he() ? -1 : 1;
      bandImgs.forEach(function (im, k) { im.style.transform = 'translate3d(' + (dir * t * K[k] * 7).toFixed(2) + '%,0,0)'; });
    }
    var d = door.getBoundingClientRect();
    if (d.bottom > 0 && d.top < vh) {
      var f = smooth(((vh - d.top) / (vh * 0.9) - 0.42) / 0.4);
      far.style.opacity = f.toFixed(3);
      near.style.transform = far.style.transform = 'scale(' + lerp(1.05, 1, f).toFixed(4) + ')';
    }
  }
  function layout() {
    vw = root.clientWidth; vh = innerHeight;
    root.style.setProperty('--ct', $('.concept').offsetHeight + 'px');
    sTop = stage.getBoundingClientRect().top + scrollY; sH = stage.offsetHeight;
    if (!still()) place();
    lastKey = '';
    tick();
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); } }, { passive: true });
  var rT = 0, lastW = 0;
  addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { if (root.clientWidth !== lastW || Math.abs(innerHeight - vh) > 120) { lastW = root.clientWidth; layout(); } else { vh = innerHeight; tick(); } }, 120); });
  addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  texts(root.lang === 'en' ? 'en' : 'he');
  hours(); buildDays(); write(true);
  lastW = root.clientWidth;
  layout();
  window.__cam = { layout: layout, tick: tick, run: function () { return { top: sTop, h: sH, vh: vh }; } };
})();
