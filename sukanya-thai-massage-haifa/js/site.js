(function () {
  var root = document.documentElement, WA = '972549739237';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: 'סוקניה · עיסוי תאילנדי · בת חן 7, חיפה', en: 'Sukanya · Thai massage · 7 Bat Hen St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור עיסוי תאילנדי סוקניה · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Sukanya Thai Massage · This is not the business’s official website' };
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
    aria('[data-t-call]', 'התקשרו לסוקניה, 054-973-9237', 'Call Sukanya, 054-973-9237');
    aria('[data-t-wa]', 'וואטסאפ לסוקניה', 'WhatsApp Sukanya');
    var nm = $('[name=nm]'); nm.placeholder = nm.dataset[l === 'he' ? 'phHe' : 'phEn'];
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('sk-lang', l); } catch (e) {}
    texts(l); hours(); buildSlip(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(), keep = $('#treat').getBoundingClientRect().top;
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('sk-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    if (!on) resetStage();
    layout();
    // the stage changes height between the two modes: keep the visitor where they were if they were past it
    if (keep < innerHeight) { var now = $('#treat').getBoundingClientRect().top; if (now !== keep) scrollBy(0, now - keep); }
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 19], 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 19], 6: null };
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
    var ts = $('[data-tray-status]'); if (ts) ts.textContent = short;
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

  // ---------------------------------------------------------------- the slip: what, how firm, which day, what time
  // days: the next open days from today (Saturday is closed, so it never appears); times are greyed once they are over today
  var TIMES = [[9, 12, 'בוקר', 'Morning', 'בבוקר', 'in the morning'], [12, 15, 'צהריים', 'Midday', 'בצהריים', 'around midday'], [15, 19, 'אחה״צ', 'Afternoon', 'אחר הצהריים', 'in the afternoon']];
  var days = [], pick = { day: null, time: null };
  function buildSlip() {
    var l = he(), n = window.__now || now(), d0 = n.date || new Date();
    days = [];
    for (var i = 0; i < 8 && days.length < 6; i++) {
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
    $('[data-times]').innerHTML = TIMES.map(function (s, k) {
      var over = d && d.i === 0 && n.h >= s[1] - 0.5;
      if (over && pick.time === k) pick.time = null;
      return '<label><input type="radio" name="time" value="' + k + '"' + (over ? ' disabled' : '') + (pick.time === k ? ' checked' : '') + '><span>' + (l ? s[2] : s[3]) + '<small dir="ltr">' + hhmm(s[0]) + '–' + hhmm(s[1]) + '</small></span></label>';
    }).join('');
  }
  var T = {
    he: { hi: 'שלום, הגעתי דרך האתר של סוקניה. ', svc: { thai: 'אשמח לתאם עיסוי תאילנדי', feet: 'אשמח לתאם עיסוי רגליים', any: 'אשמח לתאם טיפול' }, unsure: ' עוד לא החלטתי איזה טיפול.',
      pr: { soft: ' לחץ עדין, בבקשה.', mid: ' לחץ בינוני, בבקשה.', firm: ' לחץ חזק, בבקשה.' }, today: ' היום', tmrw: ' מחר', on: ' ביום ', name: ' קוראים לי ', ask: ' מתאים לכם?', any: ' מתי יש מקום?' },
    en: { hi: 'Hi, I found Sukanya’s website. ', svc: { thai: 'I’d like to book a Thai massage', feet: 'I’d like to book a foot massage', any: 'I’d like to book a treatment' }, unsure: ' I’m not sure which one yet.',
      pr: { soft: ' Gentle pressure, please.', mid: ' Medium pressure, please.', firm: ' Firm pressure, please.' }, today: ' today', tmrw: ' tomorrow', on: ' on ', name: ' My name is ', ask: ' Does that work for you?', any: ' When do you have a free slot?' }
  };
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]'), nm = $('[name=nm]');
  function message() {
    var l = root.lang === 'en' ? 'en' : 'he', t = T[l], fd = new FormData(form), svc = fd.get('svc') || 'thai', pr = fd.get('pr') || 'mid';
    var name = (nm.value || '').replace(/\s+/g, ' ').trim().slice(0, 40).replace(/[.!?]+$/, '');
    var m = t.hi + t.svc[svc], d = pick.day != null ? days[pick.day] : null, s = pick.time != null ? TIMES[pick.time] : null;
    if (d) m += d.i === 0 ? t.today : d.i === 1 ? t.tmrw : t.on + (l === 'he' ? dayHe[d.dow] : dayEn[d.dow]) + ' ' + d.dd + '.' + d.mm;
    if (s) m += ' ' + (l === 'he' ? s[4] : s[5]);
    m += '.';
    if (svc === 'any') m += t.unsure;
    m += t.pr[pr];
    if (name) m += t.name + name + '.';
    return m + (d || s ? t.ask : t.any);
  }
  function write(instant) {
    var m = message();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    type(m, instant);
  }
  // the message writes itself in, a few letters at a time, from where it changed
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

  // ---------------------------------------------------------------- entrances, once, staggered inside each section
  $$('section, header').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { io && !still() ? io.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- the cards' living things, only while they are on screen
  var run = $('[data-run]'), anims = [];
  function cardsOn() {
    anims.forEach(function (a) { a.cancel(); }); anims = [];
    if (still() || !Element.prototype.animate) return;
    // palms: three slow presses. The towel gives under the hands, warmth gathers, then they ease off
    var img = $('.cv-palms img');
    anims.push(img.animate([{ transform: 'scale(1)' }, { transform: 'scale(.982)', offset: .45 }, { transform: 'scale(.982)', offset: .6 }, { transform: 'scale(1)' }], { duration: 2600, iterations: 3, easing: 'cubic-bezier(.45,0,.25,1)', delay: 300 }));
    $$('.warm').forEach(function (w, k) {
      anims.push(w.animate([{ opacity: 0, transform: 'translate(-50%,-50%) scale(.55)' }, { opacity: .95, transform: 'translate(-50%,-50%) scale(1)', offset: .55 }, { opacity: .5, transform: 'translate(-50%,-50%) scale(1.1)', offset: .75 }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1.2)' }], { duration: 2600, iterations: 3, easing: 'ease-out', delay: 300 + k * 90 }));
    });
    // tray: candlelight from beyond the frame, breathing a few times and resting
    $$('.glow').forEach(function (g, k) {
      anims.push(g.animate([{ opacity: .45 }, { opacity: .9 }, { opacity: .55 }, { opacity: .8 }, { opacity: .5 }], { duration: 3800, iterations: 1, easing: 'ease-in-out', delay: k * 240, fill: 'forwards' }));
    });
  }
  if (run && 'IntersectionObserver' in window) new IntersectionObserver(function (es) {
    es.forEach(function (e) { run.classList.toggle('on', e.isIntersecting); if (e.isIntersecting) cardsOn(); });
  }, { threshold: .25 }).observe(run);

  // ---------------------------------------------------------------- nav: where you are; the pill rises past the concept bar
  var pill = $('[data-pill]'), links = $$('.links a');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['treat', 'room', 'reviews', 'book', 'visit'].forEach(function (id) { var el = document.getElementById(id); if (el) nio.observe(el); });
  }

  // ---------------------------------------------------------------- the tray: on phones, once the page's own buttons are out of sight
  var tray = $('[data-tray]'), seen = new Set();
  if (tray && 'IntersectionObserver' in window) {
    var kio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? seen.add(e.target) : seen.delete(e.target); }); tray.classList.toggle('away', seen.size > 0); }, { threshold: 0 });
    $$('[data-keep-clear]').forEach(function (el) { kio.observe(el); });
  }

  // ---------------------------------------------------------------- the candles: the flames waver when the air moves, then settle
  var flames = $$('[data-flame]'), waving = 0;
  function waver(strength) {
    if (still() || !Element.prototype.animate || performance.now() < waving) return;
    var D = 1700; waving = performance.now() + D - 200;
    flames.forEach(function (f, k) {
      var s = strength || 1, kf = [], i;
      for (i = 0; i <= 8; i++) {
        var a = (1 - i / 8) * s, r = Math.sin(i * 2.1 + k * 1.7);
        kf.push({ opacity: (0.78 + 0.22 * r * a).toFixed(3), transform: 'scale(' + (1 + 0.12 * r * a).toFixed(3) + ',' + (1 + 0.18 * Math.cos(i * 1.6 + k) * a).toFixed(3) + ') rotate(' + (5 * r * a).toFixed(2) + 'deg)' });
      }
      kf[kf.length - 1] = { opacity: .8, transform: 'none' };
      f.animate(kf, { duration: D, easing: 'ease-out' });
    });
  }

  // ---------------------------------------------------------------- THE CAMERA
  // Everything here is their own photographs. The room photo is cut into two depths: the back (wall, Buddha, candles) and
  // the treatment bed in front. Tied to the scroll, both ways, every pass:
  //   the camera moves into the room toward the two candles: both layers grow about the candles, but the bed, being nearer,
  //     grows faster and slides down and out of frame (parallax), uncovering only the dark floor under it;
  //   the candles' light grows until it fills the frame;
  //   out of that light the camera is looking down at the treatment bed, and tilts down it, past the flowers on the tray,
  //     to the Thai cloth at its foot, while the light is lowered to the page's own ground.
  // The pin's background is that same ground, and every layer is sized to cover the screen, so nothing else can show.
  // Only transform and opacity are written while scrolling.
  var stage = $('[data-stage]'), lys = $$('[data-ly]'), back = lys[0], bed = lys[1], bloom = $('[data-bloom]'), tilt = $('[data-tilt]'),
      dusk = $('[data-dusk]'), shade = $('.hero-shade'), copy = $('[data-copy]'), cap = $('[data-cap]'), tcap = $('[data-tcap]');
  var vw = 0, vh = 0, sTop = 0, sH = 0, box = {}, TL = {}, lastKey = '';
  var FX = 0.585, FY = 0.486;                                   // between the two flames, as a share of the photo
  var eio = function (t) { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  function place() {
    var r = 2000 / 2667, W = Math.max(vw, vh * r), Hh = W / r;
    var sx = vw * 0.5, sy = vw < 700 ? vh * 0.36 : vh * 0.78;   // where the candles sit at rest: above the words on phones, under them on wide screens
    var ox = clamp(sx - FX * W, vw - W, 0), oy = clamp(sy - FY * Hh, vh - Hh, 0);
    box = { W: W, H: Hh, cx: ox + FX * W, cy: oy + FY * Hh };
    lys.forEach(function (l) {
      l.style.inset = 'auto'; l.style.left = ox + 'px'; l.style.top = oy + 'px'; l.style.width = W + 'px'; l.style.height = Hh + 'px';
      l.style.transformOrigin = (FX * W).toFixed(1) + 'px ' + (FY * Hh).toFixed(1) + 'px';
    });
    root.classList.add('placed');
    // the bed from above: wide enough that the tilt is a real camera move, and never narrower or shorter than the screen
    var tw = Math.max(vw, vh * 0.62) * 1.12, th = tw * 2666 / 1200;
    TL = { w: tw, h: th, x: (vw - tw) / 2, end: clamp(-(0.64 * th - 0.42 * vh), vh - th, 0) };
    tilt.style.width = tw + 'px'; tilt.style.transformOrigin = '50% 0';
  }
  function resetStage() {
    [back, bed, bloom, tilt, dusk, shade, copy, cap, tcap].forEach(function (e) { e.style.transform = ''; e.style.opacity = ''; });
    lastKey = '';
  }
  function paint(p) {
    var d = eio(p / 0.54);
    var tx = (vw * 0.5 - box.cx) * d, ty = (vh * 0.5 - box.cy) * d;
    back.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + lerp(1, 2.4, d).toFixed(4) + ')';
    bed.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + (ty + vh * 0.2 * d).toFixed(1) + 'px,0) scale(' + lerp(1, 4.4, Math.pow(d, 1.15)).toFixed(4) + ')';
    bed.style.opacity = (1 - smooth((p - 0.34) / 0.12)).toFixed(3);
    var bo = smooth((p - 0.24) / 0.26) * (1 - smooth((p - 0.6) / 0.16)), bs = lerp(0.1, 2.3, smooth((p - 0.2) / 0.38));
    bloom.style.transform = 'translate3d(' + (box.cx + tx).toFixed(1) + 'px,' + (box.cy + ty).toFixed(1) + 'px,0) scale(' + bs.toFixed(4) + ')';
    bloom.style.opacity = bo.toFixed(3);
    var tt = eio((p - 0.5) / 0.4);
    tilt.style.opacity = smooth((p - 0.52) / 0.07).toFixed(3);
    tilt.style.transform = 'translate3d(' + TL.x.toFixed(1) + 'px,' + (TL.end * tt).toFixed(1) + 'px,0) scale(' + lerp(1.06, 1, tt).toFixed(4) + ')';
    tcap.style.opacity = (smooth((p - 0.55) / 0.05) * (1 - smooth((p - 0.62) / 0.04))).toFixed(3);
    dusk.style.opacity = (p >= 1 ? 1 : smooth((p - 0.64) / 0.33)).toFixed(3);
    var o = 1 - smooth(p / 0.1);
    copy.style.opacity = o.toFixed(3);
    copy.style.transform = 'translate3d(0,' + (-28 * (1 - o)).toFixed(1) + 'px,0)';
    shade.style.opacity = (1 - 0.7 * smooth((p - 0.04) / 0.16)).toFixed(3);
    if (cap) cap.style.opacity = (1 - smooth(p / 0.06)).toFixed(3);
  }
  function layout() {
    vw = root.clientWidth; vh = innerHeight;
    sTop = stage.getBoundingClientRect().top + scrollY; sH = stage.offsetHeight;
    place(); lastKey = '';
    tick();
  }
  function tick() {
    var y = scrollY;
    if (pill) pill.classList.toggle('up', y > 24);
    if (still()) return;
    var run = sH - vh, s0 = vh * 0.02;
    var p = clamp((y - sTop - s0) / Math.max(1, run - s0), 0, 1), key = p.toFixed(4);
    if (key !== lastKey) { lastKey = key; paint(p); }
    // the room photo beside the statement drifts a little with the page
    var rp = $('.rp-frame img');
    if (rp) { var r = rp.parentNode.getBoundingClientRect(); if (r.bottom > 0 && r.top < vh) { var t = clamp((vh - r.top) / (vh + r.height), 0, 1); rp.style.transform = 'translate3d(0,' + lerp(-3, 3, t).toFixed(2) + '%,0) scale(1.08)'; } }
  }
  var ticking = false, lastY = scrollY;
  addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); }
    var dy = Math.abs(scrollY - lastY); lastY = scrollY;
    if (dy > 2 && scrollY < vh * 1.2) waver(clamp(dy / 40, 0.5, 1));
  }, { passive: true });
  var rT = 0, lastW = 0;
  addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { if (root.clientWidth !== lastW || Math.abs(innerHeight - vh) > 120) { lastW = root.clientWidth; layout(); } else { vh = innerHeight; tick(); } }, 120); });
  addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  texts(root.lang === 'en' ? 'en' : 'he');
  hours(); buildSlip(); write(true);
  lastW = root.clientWidth;
  layout();
  setTimeout(function () { waver(0.8); }, 500);
  window.__cam = { layout: layout, paint: paint, tick: tick };
})();
