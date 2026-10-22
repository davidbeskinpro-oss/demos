(function () {
  var root = document.documentElement, WA = '972549027671';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var eio = function (t) { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: 'פדיקור רפואי · נטליה גונצ\'רוב, פודולוגית · בלפור 3, חיפה', en: 'Medical pedicure · Natalia Goncharova, podologist · 3 Balfour St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור פדיקור רפואי, נטליה גונצ\'רוב · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Medical Pedicure, Natalia Goncharova · This is not the business’s official website' };

  // stars: 4.7 of 5, the last star filled to 70%
  var STAR = 'M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z';
  var starSvg = '<svg viewBox="0 0 92 16" aria-hidden="true"><defs><clipPath id="SC"><rect x="0" y="0" width="' + (76 + 16 * 0.7) + '" height="16"/></clipPath></defs>' +
    [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="' + STAR + '" fill="rgba(231,201,143,.28)"/>'; }).join('') +
    '<g clip-path="url(#SC)">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="' + STAR + '" fill="#e7c98f"/>'; }).join('') + '</g></svg>';
  $$('[data-stars]').forEach(function (s, i) { s.innerHTML = starSvg.replace(/SC/g, 'sc' + i); s.setAttribute('role', 'img'); });

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-stars]').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '4.7 מתוך 5 כוכבים' : '4.7 out of 5 stars'); });
    var aria = function (sel, h, e) { var el = $(sel); if (el) el.setAttribute('aria-label', l === 'he' ? h : e); };
    aria('[data-pill]', 'ראשי', 'Main');
    aria('[data-p-call]', 'התקשרו לנטליה, 054-902-7671', 'Call Natalia, 054-902-7671');
    aria('[data-p-wa]', 'וואטסאפ לנטליה', 'WhatsApp Natalia');
    aria('[data-side-group]', 'איזו רגל', 'Which foot');
    var nm = $('[name=nm]'); nm.placeholder = nm.dataset[l === 'he' ? 'phHe' : 'phEn'];
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('fc-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(), keep = $('#care').getBoundingClientRect().top;
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('fc-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    if (!on) { frame = 0; }
    layout();
    // the stage changes height between the two modes: keep the visitor where they were if they were past it
    if (keep < innerHeight) { var now = $('#care').getBoundingClientRect().top; if (now !== keep) scrollBy(0, now - keep); }
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [10, 18], 1: [10, 18], 2: [10, 18], 3: null, 4: [10, 18], 5: [9, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
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

  // ---------------------------------------------------------------- the intake chart: which foot, where, what
  var T = {
    he: { hi: 'שלום נטליה, הגעתי דרך האתר. ',
      what: { ped: 'אשמח לקבוע תור לפדיקור רפואי.', ingrown: 'אשמח לקבוע תור בגלל ציפורן חודרנית.', corns: 'אשמח לקבוע תור בגלל יבלת.', fungus: 'אשמח לקבוע תור בגלל פטרייה.', diab: 'אשמח לקבוע תור לטיפול בכף רגל סכרתית.', check: 'אשמח לקבוע תור לבדיקה.' },
      zone: { toe: 'בבוהן', toes: 'באצבעות', ball: 'בכרית כף הרגל', arch: 'בקשת כף הרגל', heel: 'בעקב' },
      side: { r: 'ברגל ימין', l: 'ברגל שמאל', b: 'בשתי הרגליים' }, it: ' זה ', name: ' קוראים לי ', ask: ' מתי יש מקום?' },
    en: { hi: 'Hi Natalia, I found your website. ',
      what: { ped: 'I’d like to book a medical pedicure.', ingrown: 'I’d like to book an appointment for an ingrown nail.', corns: 'I’d like to book an appointment for a corn.', fungus: 'I’d like to book an appointment for fungus.', diab: 'I’d like to book diabetic foot care.', check: 'I’d like to book a check-up.' },
      zone: { toe: 'on the big toe', toes: 'on the toes', ball: 'on the ball of the foot', arch: 'on the arch', heel: 'on the heel' },
      side: { r: 'right foot', l: 'left foot', b: 'both feet' }, it: ' It’s ', name: ' My name is ', ask: ' When do you have a free slot?' }
  };
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]'), nm = $('[name=nm]'), sole = $('[data-sole]');
  function message() {
    var l = root.lang === 'en' ? 'en' : 'he', t = T[l], fd = new FormData(form), what = fd.get('what') || 'check', zone = fd.get('zone'), side = fd.get('side') || 'r';
    var name = (nm.value || '').replace(/\s+/g, ' ').trim().slice(0, 40).replace(/[.!?]+$/, '');
    var m = t.hi + t.what[what];
    if (zone) m += t.it + t.zone[zone] + ', ' + t.side[side] + '.';
    if (name) m += t.name + name + '.';
    return m + t.ask;
  }
  function write(instant) {
    var m = message();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    type(m, instant);
  }
  // the note writes itself in, a few letters at a time, from where it changed
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
    if (e.target.name === 'side') { sole.classList.toggle('left', e.target.value === 'l'); sole.classList.toggle('both', e.target.value === 'b'); }
    write();
  });
  nm.addEventListener('input', function () { write(true); });
  // "book this" under a pouch ticks that treatment on the chart
  $$('[data-pick]').forEach(function (a) { a.addEventListener('click', function () {
    var r = form.querySelector('input[name=what][value="' + a.dataset.pick + '"]'); if (r) { r.checked = true; write(true); }
  }); });

  // ---------------------------------------------------------------- entrances, once, staggered inside each section
  $$('section, header').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { io && !still() ? io.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- the pouches: indicator ink turns, one after another, when the run comes into view
  var run = $('[data-run]');
  $$('.ink', run).forEach(function (k, i) { k.style.setProperty('--d', i * 140 + 'ms'); });
  if (run && 'IntersectionObserver' in window) {
    var rio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { run.classList.add('on'); rio.disconnect(); } }); }, { threshold: .3 });
    rio.observe(run);
  } else if (run) run.classList.add('on');

  // ---------------------------------------------------------------- nav: where you are; the pill rises past the concept bar
  var pill = $('[data-pill]'), links = $$('.links a');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['care', 'room', 'reviews', 'book', 'visit'].forEach(function (id) { var el = document.getElementById(id); if (el) nio.observe(el); });
  }

  // ---------------------------------------------------------------- the pull plate: on phones, once the page's own buttons are out of sight
  var plate = $('[data-plate]'), seen = new Set();
  if (plate && 'IntersectionObserver' in window) {
    var kio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? seen.add(e.target) : seen.delete(e.target); }); plate.classList.toggle('away', seen.size > 0 || scrollY < innerHeight * 0.5); }, { threshold: 0 });
    $$('[data-keep-clear]').forEach(function (el) { kio.observe(el); });
  }

  // ---------------------------------------------------------------- THE WALK IN
  // Three of the clinic's own photographs, each moved like a camera: a point of the photo held at the centre of the frame,
  // and a scale, always at least enough to cover the frame (so no gap can ever open), keyed along the scroll, both ways.
  //   the shop front from across the street; the camera walks to the glass door, the sign on it growing;
  //   the lens loses focus; the close photo of the door fades in over it, matched so its sign sits where the far one was,
  //   and comes back into focus: Natalia's name;
  //   the camera moves on, through the window glass, out of focus again; the treatment room fades in, and settles on
  //   Natalia at work.
  var stage = $('[data-stage]'), pin = $('[data-pin]'), copy = $('[data-copy]'), capD = $('[data-cap-door]'), meet = $('[data-meet]');
  var L = {};
  $$('[data-ph]').forEach(function (el) { L[el.dataset.ph] = { el: el, sh: $('.sh', el), W: +el.dataset.w, H: +el.dataset.h, keys: [] }; });
  var vw = 0, vh = 0, sTop = 0, sH = 0, lastKey = '';
  // where the photographs line up: the middle of the door sign in the far photo and in the close one, the sign's width in
  // each (as a share of the photo's width), a point of window glass in the close photo, and Natalia's face
  var SIGN_SHOP = [0.735, 0.433], SIGN_W_SHOP = 0.1667, SIGN_DOOR = [0.746, 0.4125], SIGN_W_DOOR = 0.378, GLASS = [0.2, 0.52];

  function cover(o) { return Math.max(vw / o.W, vh / o.H); }
  // a camera: the image point (px) at the frame's centre, and the scale; clamped so the photo covers the frame
  function put(o, c, s) {
    s = Math.max(s, cover(o));
    var x = clamp(vw / 2 - c[0] * s, vw - o.W * s, 0), y = clamp(vh / 2 - c[1] * s, vh - o.H * s, 0);
    return { x: x, y: y, s: s };
  }
  // the centre point that puts image point a (fractions) at screen point P with scale s
  function centreFor(o, a, P, s) { return [a[0] * o.W + (vw / 2 - P[0]) / s, a[1] * o.H + (vh / 2 - P[1]) / s]; }
  function screenOf(o, a, tr) { return [tr.x + a[0] * o.W * tr.s, tr.y + a[1] * o.H * tr.s]; }
  // the centre that a clamped transform really shows
  function realCentre(o, tr) { return [(vw / 2 - tr.x) / tr.s, (vh / 2 - tr.y) / tr.s]; }

  function plan() {
    var S = L.shop, D = L.door, N = L.nat, phone = vw < 700;
    // the close door photo, slightly larger than covering, its sign a little above the middle
    var sD = cover(D) * 1.06;
    var trD = put(D, centreFor(D, SIGN_DOOR, [vw / 2, vh * 0.44], sD), sD), P = screenOf(D, SIGN_DOOR, trD);
    // the far photo at the moment of the handover: its sign exactly as big, exactly there
    var sS1 = sD * (SIGN_W_DOOR * D.W) / (SIGN_W_SHOP * S.W);
    var cS1 = centreFor(S, SIGN_SHOP, P, sS1);
    var trS0 = put(S, [(phone ? 0.62 : 0.5) * S.W, (phone ? 0.5 : 0.56) * S.H], cover(S));
    S.keys = [[0, realCentre(S, trS0), trS0.s], [0.40, cS1, sS1], [0.47, centreFor(S, SIGN_SHOP, P, sS1 * 1.14), sS1 * 1.14]];
    var cD = realCentre(D, trD);
    var sD2 = sD * 1.08, trD2 = put(D, [cD[0], 0], sD2);
    var sD3 = sD * 3.1;
    D.keys = [[0.33, centreFor(D, SIGN_DOOR, P, sD / 1.14), sD / 1.14], [0.40, cD, sD], [0.62, realCentre(D, trD2), sD2], [0.84, [GLASS[0] * D.W, GLASS[1] * D.H], sD3]];
    var sN0 = cover(N) * 1.55, sN1 = cover(N) * 1.02;
    N.keys = [[0.76, [0.34 * N.W, 0.36 * N.H], sN0], [1, [(phone ? 0.6 : 0.56) * N.W, (phone ? 0.5 : 0.46) * N.H], sN1]];
  }
  function cam(o, p) {
    var k = o.keys, i = 0;
    if (p <= k[0][0]) return put(o, k[0][1], k[0][2]);
    if (p >= k[k.length - 1][0]) { var z = k[k.length - 1]; return put(o, z[1], z[2]); }
    while (i < k.length - 2 && p > k[i + 1][0]) i++;
    var a = k[i], b = k[i + 1], t = eio((p - a[0]) / (b[0] - a[0]));
    var s = a[2] * Math.pow(b[2] / a[2], t);
    return put(o, [lerp(a[1][0], b[1][0], t), lerp(a[1][1], b[1][1], t)], s);
  }
  function apply(o, tr) { o.el.style.transform = 'translate3d(' + tr.x.toFixed(2) + 'px,' + tr.y.toFixed(2) + 'px,0) scale(' + tr.s.toFixed(5) + ')'; }
  function paint(p) {
    apply(L.shop, cam(L.shop, p)); apply(L.door, cam(L.door, p)); apply(L.nat, cam(L.nat, p));
    // focus: sharp over its own blurred copy; each next photo fades in on top of the last, which stays opaque beneath
    L.shop.sh.style.opacity = (1 - smooth((p - 0.32) / 0.06)).toFixed(3);
    L.door.el.style.opacity = smooth((p - 0.365) / 0.035).toFixed(3);
    L.door.sh.style.opacity = (smooth((p - 0.4) / 0.05) * (1 - smooth((p - 0.72) / 0.05))).toFixed(3);
    L.nat.el.style.opacity = smooth((p - 0.76) / 0.03).toFixed(3);
    L.nat.sh.style.opacity = smooth((p - 0.785) / 0.05).toFixed(3);
    L.shop.el.style.visibility = p > 0.43 ? 'hidden' : '';
    L.door.el.style.visibility = p > 0.8 || p < 0.36 ? 'hidden' : '';
    L.nat.el.style.visibility = p < 0.755 ? 'hidden' : '';
    var o = 1 - smooth(p / 0.07);
    copy.style.opacity = o.toFixed(3);
    copy.style.transform = 'translate3d(0,' + (-28 * (1 - o)).toFixed(1) + 'px,0)';
    copy.style.visibility = o < 0.01 ? 'hidden' : '';
    capD.style.opacity = (smooth((p - 0.45) / 0.04) * (1 - smooth((p - 0.64) / 0.04))).toFixed(3);
    var m = smooth((p - 0.87) / 0.08);
    meet.style.opacity = m.toFixed(3);
    meet.style.transform = 'translate3d(0,' + (24 * (1 - m)).toFixed(1) + 'px,0)';
    meet.style.visibility = m < 0.01 ? 'hidden' : '';
    capD.style.visibility = +capD.style.opacity < 0.01 ? 'hidden' : '';
  }

  // motion off: the same three frames, stepped with the arrows
  var FR = [0, 0.55, 1], frame = 0, dots = $$('[data-dots] i');
  function stepUI() {
    dots.forEach(function (d, i) { d.classList.toggle('on', i === frame); });
    $$('[data-step]').forEach(function (b) { b.disabled = (+b.dataset.step < 0 && frame === 0) || (+b.dataset.step > 0 && frame === FR.length - 1); });
  }
  $$('[data-step]').forEach(function (b) { b.addEventListener('click', function () { frame = clamp(frame + (+b.dataset.step), 0, FR.length - 1); paint(FR[frame]); stepUI(); }); });

  function layout() {
    vw = root.clientWidth; vh = pin.clientHeight || innerHeight;
    $$('[data-ph]').forEach(function (el) { el.style.width = el.dataset.w + 'px'; el.style.height = el.dataset.h + 'px'; });
    root.classList.add('placed');
    sTop = stage.getBoundingClientRect().top + scrollY; sH = stage.offsetHeight;
    plan(); lastKey = '';
    if (still()) { paint(FR[frame]); stepUI(); } else tick();
  }
  var room = $('[data-focus]'), roomSh = room && $('.sh', room);
  function tick() {
    var y = scrollY;
    if (pill) pill.classList.toggle('up', y > 24);
    if (plate && y < innerHeight * 0.5) plate.classList.add('away');
    if (still()) { if (roomSh) { roomSh.style.opacity = ''; roomSh.style.transform = ''; } return; }
    var span = sH - vh, p = clamp((y - sTop) / Math.max(1, span), 0, 1), key = p.toFixed(4);
    if (key !== lastKey) { lastKey = key; paint(p); }
    // the room photo: out of focus as it rises into view, sharp by the time it reaches the middle (and back again going up)
    if (roomSh) {
      var r = room.getBoundingClientRect();
      if (r.bottom > -50 && r.top < vh + 50) {
        var f = smooth((vh - r.top) / (vh * 0.55));
        roomSh.style.opacity = f.toFixed(3);
        roomSh.style.transform = 'scale(' + lerp(1.07, 1, f).toFixed(4) + ')';
      }
    }
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); } }, { passive: true });
  var rT = 0, lastW = 0;
  addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { if (root.clientWidth !== lastW || Math.abs(innerHeight - vh) > 120) { lastW = root.clientWidth; layout(); } else { tick(); } }, 120); });
  addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  texts(root.lang === 'en' ? 'en' : 'he');
  hours(); write(true);
  lastW = root.clientWidth;
  layout();
  window.__cam = { layout: layout, paint: paint, tick: tick };
})();
