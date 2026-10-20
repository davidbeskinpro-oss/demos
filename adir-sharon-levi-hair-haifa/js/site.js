(function () {
  var root = document.documentElement, WA = '972544851412';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: 'אדיר לוי & שרון לוי · בוטיק שיער · שדרות מוריה 118, חיפה', en: 'Adir Levi & Sharon Levi · Hair boutique · 118 Moriah Blvd, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור אדיר לוי & שרון לוי - בוטיק שיער · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Adir Levi & Sharon Levi Hair Boutique · This is not the business’s official website' };
  var STAR = '<svg viewBox="0 0 92 16" aria-hidden="true">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; }).join('') + '</svg>';
  $$('[data-stars]').forEach(function (s) { s.innerHTML = STAR; s.setAttribute('role', 'img'); });

  // ---------------------------------------------------------------- language
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    try { localStorage.setItem('al-lang', l); } catch (e) {}
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-stars]').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
    var aria = function (sel, h, e) { var el = $(sel); if (el) el.setAttribute('aria-label', l === 'he' ? h : e); };
    aria('[data-pill]', 'ראשי', 'Main');
    aria('[data-sh-call]', 'התקשרו לאדיר ושרון, 054-485-1412', 'Call Adir and Sharon, 054-485-1412');
    aria('[data-sh-wa]', 'וואטסאפ לאדיר ושרון', 'WhatsApp Adir and Sharon');
    var note = $('[name=note]'); note.placeholder = note.dataset[l === 'he' ? 'phHe' : 'phEn'];
    hours(); buildBook(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('al-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    layout();
    if (on) intro(); else resetMirrors();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed that day
  var H = { 0: [9, 17], 1: null, 2: [9, 17], 3: [9, 17], 4: [9, 17], 5: [8, 13], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], shortEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'numeric', year: 'numeric', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, date: new Date(Date.UTC(+o.year, +o.month - 1, +o.day)) };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false, short;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; short = l ? 'פתוח עכשיו' : 'OPEN NOW'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); short = l ? 'פתוח עד ' + hhmm(t[1]) : 'OPEN TILL ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); short = l ? 'נפתח ב-' + hhmm(t[0]) : 'OPENS ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
      short = !H[nd] ? (l ? 'סגור' : 'CLOSED') : (l ? 'נפתח ' + shortHe[nd] + ' ' + hhmm(H[nd][0]) : 'OPENS ' + shortEn[nd].toUpperCase() + ' ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    var ss = $('[data-shear-status]'); if (ss) ss.textContent = short;
    var sh = $('[data-shears]'); if (sh) sh.classList.toggle('open', open);
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

  // ---------------------------------------------------------------- the appointment book: the next seven days, from today
  // morning / midday / afternoon, each a slot only where it overlaps that day's hours; slots already over today are greyed
  var SLOTS = [[0, 12, 'בוקר', 'Morning', 'בבוקר', 'in the morning'], [12, 14, 'צהריים', 'Midday', 'בצהריים', 'around midday'], [14, 24, 'אחה״צ', 'Afternoon', 'אחר הצהריים', 'in the afternoon']];
  var days = [], picked = null;
  function buildBook() {
    var l = he(), n = window.__now || now(), d0 = n.date || new Date();
    days = [];
    for (var i = 0; i < 7; i++) { var dt = new Date(d0.getTime() + i * 864e5); days.push({ dow: (n.d + i) % 7, dd: dt.getUTCDate(), mm: dt.getUTCMonth() + 1, i: i }); }
    var fmt = function (d) { return d.dd + '.' + d.mm; };
    $('[data-week]').textContent = fmt(days[0]) + ' – ' + fmt(days[6]);
    var head = '<th scope="col"><span class="vh">' + (l ? 'שעה' : 'Time') + '</span></th>' + days.map(function (d) {
      var closed = !H[d.dow], name = d.i === 0 ? (l ? 'היום' : 'Today') : d.i === 1 ? (l ? 'מחר' : 'Tmrw') : (l ? shortHe[d.dow] : shortEn[d.dow]);
      return '<th scope="col" class="' + (closed ? 'closed' : '') + (d.i === 0 ? ' today' : '') + '">' + (closed ? '<span class="vh">' + (l ? dayHe[d.dow] : dayEn[d.dow]) + '</span>' : name + '<small>' + fmt(d) + '</small>') + '</th>';
    }).join('');
    $('[data-days]').innerHTML = head;
    var body = SLOTS.map(function (s, si) {
      return '<tr><th scope="row">' + (l ? s[2] : s[3]) + '</th>' + days.map(function (d) {
        var t = H[d.dow];
        if (!t) return si === 1 ? '<td class="closed" rowspan="1"><span>' + (l ? 'סגור' : 'Closed') + '</span></td>' : '<td class="closed"></td>';
        var a = Math.max(t[0], s[0]), b = Math.min(t[1], s[1]);
        if (b <= a) return '<td class="past"></td>';
        var past = d.i === 0 && n.h >= b - 0.5;
        var id = d.i + '-' + si, chk = picked === id && !past;
        var lab = (l ? (d.i === 0 ? 'היום' : 'יום ' + dayHe[d.dow]) : (d.i === 0 ? 'Today' : dayEn[d.dow])) + ' ' + d.dd + '.' + d.mm + ', ' + (l ? s[4] : s[5]);
        return '<td' + (past ? ' class="past"' : '') + '><label class="slot"><input type="radio" name="slot" value="' + id + '"' + (past ? ' disabled' : '') + (chk ? ' checked' : '') + ' aria-label="' + lab + '"><svg viewBox="0 0 40 30" aria-hidden="true"><path class="ring" d="M30.5 4.5C26 1.8 13 2 7 6.5 1.5 10.6 2.6 21.2 9.6 25c7.1 3.9 19.1 2.9 24-2.4 4.7-5.1 2.3-13.4-5.2-16.6"/><path class="tick" d="M14 15.6l4.2 4.3 8.4-9.2-1.3-1.2-7.1 7.7-2.9-3z"/></svg></label></td>';
      }).join('') + '</tr>';
    }).join('');
    $('[data-grid]').innerHTML = body;
  }
  var T = {
    he: { hi: 'היי אדיר ושרון, הגעתי דרך האתר. ', svc: { cut: 'לתספורת', colour: 'לגוונים', ext: 'לתוספות שיער', blow: 'לפן' }, want: 'אשמח לקבוע תור ', on: ' ביום ', today: ' היום', note: '. הערה: ', ask: '. מתי מתאים לכם?', any: '. מתי יש מקום?' },
    en: { hi: 'Hi Adir and Sharon, I found you through your website. ', svc: { cut: 'a haircut', colour: 'highlights', ext: 'hair extensions', blow: 'a blowout' }, want: 'I’d like to book ', on: ' on ', today: ' today', note: '. A note: ', ask: '. Does that work for you?', any: '. When do you have a slot?' }
  };
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]'), note = $('[name=note]');
  function message() {
    var l = root.lang, t = T[l] || T.he, fd = new FormData(form), svc = fd.get('svc') || 'cut', slot = fd.get('slot'), nt = (note.value || '').trim().slice(0, 90);
    var m = t.hi + t.want + t.svc[svc];
    if (slot) {
      var p = slot.split('-'), d = days[+p[0]], s = SLOTS[+p[1]];
      if (d) m += (d.i === 0 ? t.today : t.on + (l === 'he' ? dayHe[d.dow] : dayEn[d.dow]) + ' ' + d.dd + '.' + d.mm) + ', ' + (l === 'he' ? s[4] : s[5]);
    }
    if (nt) m += t.note + nt.replace(/[.!?]+$/, '');
    return m + (slot ? t.ask : t.any);
  }
  function write(instant) {
    var m = message();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    type(m, instant);
  }
  // the note writes itself in, a few letters at a time; typing in the field just follows along
  var typeT = 0, lastM = '';
  function type(m, instant) {
    clearInterval(typeT);
    if (instant || still() || (lastM && m.indexOf(lastM.slice(0, -2)) === 0 && Math.abs(m.length - lastM.length) < 4)) { preview.textContent = m; lastM = m; return; }
    var keep = 0; while (keep < m.length && keep < lastM.length && m[keep] === lastM[keep]) keep++;
    lastM = m;
    var i = keep, caret = '<span class="caret"></span>';
    typeT = setInterval(function () {
      i = Math.min(m.length, i + 2);
      preview.textContent = m.slice(0, i);
      if (i < m.length) preview.insertAdjacentHTML('beforeend', caret); else clearInterval(typeT);
    }, 16);
  }
  form.addEventListener('change', function (e) { if (e.target.name === 'slot') picked = e.target.value; write(); });
  note.addEventListener('input', function () { write(); });

  // ---------------------------------------------------------------- entrances, once, staggered inside each section
  $$('section, header, .panel').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { io && !still() ? io.observe(el) : el.classList.add('in'); });

  // the cards' small lights only run while the cards are on screen
  var run = $('[data-run]');
  if (run && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { run.classList.toggle('on', e.isIntersecting); }); }).observe(run);
  else if (run) run.classList.add('on');

  // ---------------------------------------------------------------- nav: where you are; the pill rises past the concept bar
  var pill = $('[data-pill]'), links = $$('.links a');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['craft', 'two', 'reviews', 'book', 'visit'].forEach(function (id) { var el = document.getElementById(id); if (el) nio.observe(el); });
  }

  // ---------------------------------------------------------------- the shears: shown on phones once the page's own buttons are out of sight
  var shears = $('[data-shears]'), seen = new Set();
  if (shears && 'IntersectionObserver' in window) {
    var kio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? seen.add(e.target) : seen.delete(e.target); }); shears.classList.toggle('away', seen.size > 0); }, { threshold: 0 });
    $$('[data-keep-clear]').forEach(function (el) { kio.observe(el); });
  }
  // a tap closes the blades once: a snip (WAAPI, so a second tap starts from where the blades are)
  var up = $('.sh-up'), low = $('.sh-low');
  $$('.shears a').forEach(function (a) { a.addEventListener('pointerdown', function () {
    if (still() || !up.animate) return;
    up.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(5.5deg)' }, { transform: 'rotate(0deg)' }], { duration: 220, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
    low.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-5.5deg)' }, { transform: 'rotate(0deg)' }], { duration: 220, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
  }); });

  // ---------------------------------------------------------------- THE BACK MIRROR
  // Every photo Adir and Sharon post is the back of a head: the moment the hand mirror goes behind you.
  // So the page moves from part to part through that mirror. Tied to the scroll, both ways, every pass:
  //   it rises out of the dark tilted back, the way a mirror is lifted from below, and straightens to face you
  //     (the light slides across the glass as it turns);
  //   then it is brought close: it grows until the glass is the whole screen, the frame passing out past the edges,
  //     while the photo in it settles to its true size (it is scaled the other way, so it never blows up);
  //   the photo dims into the next part's ground, and the page carries on in it.
  // Scroll back up and it shrinks back into the mirror and sinks away. Only transform and opacity are written.
  var seams = $$('[data-seam]').map(function (el) {
    return { el: el, mir: $('[data-mirror]', el), ph: $('.m-photo', el), shade: $('.m-shade', el), sheen: $('.m-sheen', el), cap: $('.m-cap', el), fade: $('.seam-fade', el), hero: el.classList.contains('seam-hero'), fy: parseFloat(el.dataset.focus || 0), copy: $('.hero-copy', el), k: null };
  });
  var vw = 0, vh = 0, heroIn = 1, introRun = 0;
  var eo = function (t) { return 1 - Math.pow(1 - t, 3); };
  var eio = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  function layout() {
    vw = root.clientWidth; vh = innerHeight;
    root.style.setProperty('--vwpx', vw + 'px'); root.style.setProperty('--vhpx', vh + 'px');
    seams.forEach(function (s) {
      s.mir.style.transform = ''; s.ph.style.transform = '';
      var top = s.el.getBoundingClientRect().top + scrollY;
      s.top = top; s.h = s.el.offsetHeight;
      var mw = s.mir.offsetWidth; s.gw = mw * 202 / 232; s.gh = s.gw * 1.297;
      s.cx = s.mir.offsetLeft + mw / 2; s.cy = s.mir.offsetTop + mw * 146 / 232;    // the glass centre at rest, in the seam
      s.S = 1.08 * Math.sqrt(Math.pow(vw / s.gw, 2) + Math.pow(vh / s.gh, 2));      // big enough for the oval to cover the screen's corners
      s.n0 = 1.04 * Math.max(s.gw / vw, s.gh / vh);                                 // the photo just fills the glass at rest
      s.fyE = Math.min(s.fy, Math.max(0, (1 - s.gh / (vh * s.n0)) / 2 - 0.01));   // never so far that the glass shows past the photo
      s.k = null;
    });
    tick();
  }
  function resetMirrors() {
    seams.forEach(function (s) { [s.mir, s.ph, s.shade, s.sheen, s.cap, s.fade, s.copy].forEach(function (e) { if (e) { e.style.transform = ''; e.style.opacity = ''; } }); });
  }
  function paint(s, v) {
    // v: where the seam's top is, in screens (1 = at the bottom edge, 0 = at the top, negative = above)
    var vf = (vh - s.h) / vh;                         // the seam's bottom meets the screen's bottom here: the glass must cover by then
    var x, y, rx = 0, rz = 0, sc = 1, net = s.n0, near = 0, sheen = -45, sheenO = .9, shade = 0, cap = 0, fade = 0, top = v * vh;
    if (s.hero) {
      var m = clamp(-v / 0.3, 0, 1), em = eio(m);
      var g = clamp((-v - 0.16) / (-vf - 0.16), 0, 1), eg = eio(g);
      var lift = 1 - eo(heroIn);                      // the opening: the mirror is lifted into the light once, by time
      x = lerp(s.cx, vw / 2, em);
      y = lerp(top + s.cy + lift * vh * 0.45, vh / 2, em);
      rx = 34 * lift; rz = lerp(-3.5, 0, em) - 4 * lift;
      sc = lerp(1, 1.1, em) * lerp(1, s.S / 1.1, eg);
      net = lerp(s.n0, 1, eg); near = eg;
      sheen = lerp(-45, 45, Math.max(heroIn * 0.6, em));
      sheenO = 0.9 * (1 - eg);
      if (v < vf) y = vh / 2 + (top - vf * vh);       // after it covers, the photo travels up with the page
      shade = 0.6 * clamp((-v + vf + 0.2) / 0.2, 0, 1);
      cap = clamp((g - 0.9) / 0.1, 0, 1) * (1 - clamp((-v + vf + 0.08) / 0.12, 0, 1));
      fade = clamp((-v + vf + 0.1) / 0.12, 0, 1);
    } else {
      var r = clamp(1 - v, 0, 1), er = eo(r);
      var gg = clamp(-v / -vf, 0, 1), egg = eio(gg);
      x = s.cx;
      y = top + s.cy + 0.12 * vh * Math.max(v, 0);    // rising a little slower than the page, so it is lifted rather than carried
      if (v < 0) y = lerp(s.cy, vh / 2, egg);         // held still on screen while it comes close
      if (v < vf) y = vh / 2 + (top - vf * vh);
      rx = 40 * (1 - er); rz = -7 * (1 - er);
      sc = lerp(0.86, 1, er) * lerp(1, s.S, egg);
      net = lerp(s.n0, 1, egg); near = egg;
      sheen = lerp(-55, 45, er);
      sheenO = 0.9 * (1 - egg);
      shade = 0.6 * clamp((-v + vf + 0.18) / 0.18, 0, 1);
      cap = clamp((gg - 0.9) / 0.1, 0, 1) * (1 - clamp((-v + vf + 0.06) / 0.12, 0, 1));
      fade = clamp((-v + vf + 0.1) / 0.12, 0, 1);
    }
    // the photo always covers whatever part of the glass is on screen
    net = Math.max(net, Math.min(1, 1.04 * Math.max(s.gw * sc / vw, s.gh * sc / vh)));
    if (s.copy) { var cm = clamp(-v / 0.3, 0, 1); s.copy.style.opacity = (1 - cm).toFixed(3); s.copy.style.transform = 'translateY(' + (-40 * cm).toFixed(1) + 'px)'; }
    var dx = x - s.cx, dy = (y - top) - s.cy;
    s.mir.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0) perspective(1100px) rotateX(' + rx.toFixed(2) + 'deg) rotateZ(' + rz.toFixed(2) + 'deg) scale(' + sc.toFixed(4) + ')';
    // the photo: scaled the other way, plus a little parallax while the mirror tilts
    s.ph.style.transform = 'translateY(' + (rx * -0.8 + Math.min(s.fyE * vh * net * (1 - near), Math.max(0, (vh * net - s.gh * sc) / 2 - 2))).toFixed(1) + 'px) scale(' + (net / sc).toFixed(4) + ')';
    s.sheen.style.transform = 'translateX(' + sheen.toFixed(1) + '%)';
    s.sheen.style.opacity = sheenO.toFixed(3);
    s.shade.style.opacity = shade.toFixed(3);
    if (s.cap) s.cap.style.opacity = cap.toFixed(3);
    if (s.fade) s.fade.style.opacity = fade.toFixed(3);
  }
  function tick() {
    var y = scrollY;
    if (pill) pill.classList.toggle('up', y > 24);
    if (still()) return;
    seams.forEach(function (s) {
      var v = (s.top - y) / vh;
      if (v > 1.05 || v < (vh - s.h) / vh - 1.05) { if (s.k !== 'off') { paint(s, v > 0 ? 1.05 : (vh - s.h) / vh - 1.05); s.k = 'off'; } return; }
      var key = v.toFixed(4) + (s.hero ? heroIn.toFixed(3) : '');
      if (key === s.k) return; s.k = key;
      paint(s, v);
    });
  }
  function intro() {
    cancelAnimationFrame(introRun);
    if (still()) { heroIn = 1; return; }
    var t0 = performance.now() + 120, D = 1500; heroIn = 0;
    introRun = requestAnimationFrame(function f(t) {
      heroIn = clamp((t - t0) / D, 0, 1); seams[0].k = null; tick();
      if (heroIn < 1) introRun = requestAnimationFrame(f);
    });
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); } }, { passive: true });
  var rT = 0, lastW = 0;
  addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { if (root.clientWidth !== lastW || Math.abs(innerHeight - vh) > 120) { lastW = root.clientWidth; layout(); } else { vh = innerHeight; tick(); } }, 120); });
  addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  var note0 = $('[name=note]'); note0.placeholder = note0.dataset[he() ? 'phHe' : 'phEn'];
  $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[he() ? 'altHe' : 'altEn']; });
  $$('[data-stars]').forEach(function (s) { s.setAttribute('aria-label', he() ? '5 כוכבים' : '5 stars'); });
  document.title = TITLE[root.lang] || TITLE.he;
  if (root.lang === 'en') setLang('en'); else { hours(); buildBook(); write(true); }
  lastW = root.clientWidth;
  layout(); intro();
  window.__mirror = { layout: layout, tick: tick, seams: seams };
})();
