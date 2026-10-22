(function () {
  var root = document.documentElement, WA = '972524653933';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: 'יואב איצקוביץ · סוכן ביטוח ופנסיה · ההסתדרות 251, חיפה', en: 'Yoav Itzkovitz · Insurance & pension agent · 251 HaHistadrut Blvd, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור יואב איצקוביץ, סוכן ביטוח · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Yoav Itzkovitz, insurance agent · This is not the business’s official website' };
  var SEAL = {
    he: { t: 'איצקו סוכנות לביטוח', bt: 'ההסתדרות 251 · חיפה', ts: 16, bs: 14, a: 'מעכשיו', b: 'זה ביחד', m: 19 },
    en: { t: 'ITZKO INSURANCE AGENCY', bt: '251 HAHISTADRUT · HAIFA', ts: 13, bs: 12, a: 'From now on', b: 'together', m: 15 }
  };
  // Chrome lays text on a path left to right, so Hebrew is given in visual order (numbers kept as they read)
  var visual = function (str) { return str.split('').reverse().join('').replace(/\d+/g, function (n) { return n.split('').reverse().join(''); }); };
  var STAR = '<svg viewBox="0 0 92 16" aria-hidden="true">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; }).join('') + '</svg>';
  $$('[data-stars]').forEach(function (s) { s.innerHTML = STAR; s.setAttribute('role', 'img'); });

  // ---------------------------------------------------------------- language
  function texts(l) {
    var h = l === 'he';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[h ? 'altHe' : 'altEn']; });
    $$('[data-stars]').forEach(function (s) { s.setAttribute('aria-label', h ? '5 כוכבים' : '5 stars'); });
    $$('[data-t-call]').forEach(function (a) { if (!a.textContent.trim() || a.classList.contains('fab-b')) a.setAttribute('aria-label', h ? 'התקשרו ליואב, 052-465-3933' : 'Call Yoav, 052-465-3933'); });
    $$('[data-t-wa]').forEach(function (a) { a.setAttribute('aria-label', h ? 'וואטסאפ ליואב' : 'WhatsApp Yoav'); });
    var set = function (sel, attr, a, b) { var el = $(sel); if (el) el.setAttribute(attr, h ? a : b); };
    set('[data-t-nav]', 'aria-label', 'ראשי', 'Main');
    set('[data-t-sky]', 'aria-label', 'מעכשיו זה ביחד', 'From now on, together');
    set('[data-t-map]', 'title', 'מפה: ההסתדרות 251, חיפה', 'Map: 251 HaHistadrut Blvd, Haifa');
    set('[data-prev]', 'aria-label', 'הקודם', 'Previous');
    set('[data-next]', 'aria-label', 'הבא', 'Next');
    var nm = $('[data-name]'); nm.placeholder = nm.dataset[h ? 'phHe' : 'phEn'];
    var S = SEAL[l], vis = h ? visual : function (x) { return x; };
    $$('[data-seal-t]').forEach(function (t) { t.textContent = vis(S.t); t.parentNode.setAttribute('font-size', S.ts); });
    $$('[data-seal-bt]').forEach(function (t) { t.textContent = vis(S.bt); t.parentNode.setAttribute('font-size', S.bs); });
    $$('[data-seal-a]').forEach(function (t) { t.textContent = S.a; t.setAttribute('font-size', S.m); });
    $$('[data-seal-b]').forEach(function (t) { t.textContent = S.b; t.setAttribute('font-size', S.m); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('yi-lang', l); } catch (e) {}
    texts(l); hours(); waLinks(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- WhatsApp: a short, honest first message
  var TOPIC_MSG = {
    he: { any: 'ביטוח', ins: 'ביטוח', pension: 'פנסיה', other: 'משהו אחר' },
    en: { any: 'insurance', ins: 'insurance', pension: 'my pension', other: 'something else' }
  };
  function waText(name, topic) {
    var l = he() ? 'he' : 'en', t = TOPIC_MSG[l][topic || 'any'] || TOPIC_MSG[l].any, n = (name || '').trim();
    if (l === 'he') return 'שלום יואב, הגעתי דרך האתר. אשמח לדבר איתך על ' + t + '.' + (n ? ' שמי ' + n + '.' : '');
    return 'Hi Yoav, I found you through the website. I’d like to talk to you about ' + t + '.' + (n ? ' My name is ' + n + '.' : '');
  }
  function waLinks() { $$('a[data-wa]').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(waText('', 'any')); }); }
  $('[data-composer]').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.currentTarget, tp = (f.querySelector('[name=tp]:checked') || {}).value;
    var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(waText(f.nm.value, tp));
    stamp(seal2, -12, 0);
    var w = window.open(url, '_blank', 'noopener'); if (!w) location.href = url;
  });

  // ---------------------------------------------------------------- the rubber stamp: lifted, pressed, a little bounce of the rubber
  var seal1 = $('[data-seal]'), seal2 = $('[data-seal2]');
  function stamp(el, rot, delay) {
    if (still() || !el.animate) { el.style.opacity = ''; return; }
    var r = 'rotate(' + rot + 'deg) ';
    el.animate([
      { opacity: 0, transform: r + 'translateY(-26px) scale(1.5)' },
      { opacity: .25, transform: r + 'translateY(-8px) scale(1.12)', offset: .55 },
      { opacity: .95, transform: r + 'scale(.95)', offset: .78 },
      { opacity: .9, transform: r + 'scale(1)' }
    ], { duration: 560, delay: delay || 0, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'backwards' });
  }
  // the sheet's seal is pressed each time the form arrives on screen, and lifted again when it leaves
  var sheet = $('[data-sheet]'), sheetStamped = false;
  function sheetSeal() {
    var r = sheet.getBoundingClientRect(), inView = r.top < innerHeight * .55 && r.bottom > innerHeight * .3;
    if (still()) { seal2.style.opacity = ''; sheetStamped = true; return; }
    if (inView && !sheetStamped) { sheetStamped = true; seal2.style.opacity = ''; stamp(seal2, -12, 120); }
    else if (!inView && (r.top > innerHeight || r.bottom < 0) && sheetStamped) { sheetStamped = false; seal2.style.opacity = '0'; }
  }

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var wasOff = still(), anchor = $('#yoav'), keep = anchor.getBoundingClientRect().top, past = keep < innerHeight;
    root.classList.toggle('still', !wasOff); delete root.dataset.motionAuto;
    try { localStorage.setItem('yi-motion', wasOff ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-rv]').forEach(function (el) { el.classList.add('in'); });
    if (wasOff) { if (skyNear) startSky(); } else stopSky();
    resetMotion();
    layout();
    if (past) { var now = anchor.getBoundingClientRect().top; if (now !== keep) scrollBy(0, now - keep); }
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 20], 1: [9, 20], 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [9, 12], 6: null };
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

  // ---------------------------------------------------------------- the window: rain → clear, scroll-linked both ways
  var sky = $('[data-sky]'), stage = $('[data-stage]'), beats = $$('[data-beat]'), glApi = null, glLoading = false, skyP = 0, stillIdx = 0, skyNear = false;
  var stillImg = $('[data-still]'), STILLS = ['img/still-1.jpg', 'img/still-3.jpg'];
  function beatAlpha(p) { return [1 - smooth((p - .34) / .14), smooth((p - .52) / .14)]; }
  function showBeats(a) {
    beats.forEach(function (b, i) {
      b.style.opacity = a[i].toFixed(3);
      b.style.visibility = a[i] < .02 ? 'hidden' : 'visible';
      b.style.transform = 'translateY(' + ((1 - a[i]) * 18).toFixed(1) + 'px)';
    });
  }
  function skyScroll() {
    if (still()) return;
    var r = sky.getBoundingClientRect(), span = r.height - innerHeight;
    skyP = clamp(-r.top / Math.max(1, span), 0, 1);
    showBeats(beatAlpha(skyP));
    // without WebGL the clear photo simply comes through
    stage.style.setProperty('--clear', smooth((skyP - .25) / .45).toFixed(3));
    if (glApi) glApi.setP(clamp(skyP * 1.15, 0, 1));
  }
  function startSky() {
    beats.forEach(function (b) { b.classList.remove('on'); });
    skyScroll();
    if (glApi) { glApi.start(); stage.classList.add('gl-on'); return; }
    if (glLoading) return;
    glLoading = true;
    import('./sky.js').then(function (m) {
      var big = innerWidth * Math.min(devicePixelRatio || 1, 1.5) > 1100;
      return m.createSky($('[data-gl]'), { storm: 'img/bay-storm-' + (big ? 1600 : 1000) + '.jpg', clear: 'img/bay-clear-' + (big ? 1600 : 1000) + '.jpg' });
    }).then(function (api) {
      if (!api) return;
      glApi = api; window.__skyApi = api;
      api.setP(clamp(skyP * 1.15, 0, 1));
      if (!still()) { api.start(); stage.classList.add('gl-on'); }
    }).catch(function () {});
  }
  function stopSky() {
    if (glApi) glApi.stop();
    stage.classList.remove('gl-on');
    beats.forEach(function (b) { b.style.opacity = ''; b.style.visibility = ''; b.style.transform = ''; });
    setStill(0);
  }
  // the WebGL rain only loads when the window is about to come on screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { if (es[0].isIntersecting && !skyNear) { skyNear = true; if (!still()) startSky(); } }, { rootMargin: '600px 0px' }).observe(sky);
  } else { skyNear = true; }
  // animations off: a normal-height block; arrows and stage names step through two stills
  function setStill(i) {
    stillIdx = clamp(i, 0, 1);
    beats.forEach(function (b, k) { b.classList.toggle('on', k === stillIdx); });
    stillImg.src = STILLS[stillIdx];
    $$('[data-dot]').forEach(function (d) { d.setAttribute('aria-selected', +d.dataset.dot === stillIdx ? 'true' : 'false'); });
    $('[data-prev]').disabled = stillIdx === 0; $('[data-next]').disabled = stillIdx === 1;
  }
  $('[data-prev]').addEventListener('click', function () { setStill(stillIdx - 1); });
  $('[data-next]').addEventListener('click', function () { setStill(stillIdx + 1); });
  $$('[data-dot]').forEach(function (d) { d.addEventListener('click', function () { setStill(+d.dataset.dot); }); });
  if (still()) setStill(0);

  // ---------------------------------------------------------------- the armchair portrait settles as it passes
  var whoImg = $('[data-who-img]');
  function whoScroll() {
    if (still()) { whoImg.style.removeProperty('--wz'); return; }
    var r = whoImg.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    var p = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1);
    whoImg.style.setProperty('--wz', (1.1 - smooth(p * 1.4) * .1).toFixed(4));
  }

  // ---------------------------------------------------------------- letters: a pile on the desk that spreads into a row (wide screens)
  var desk = $('[data-desk]'), letters = $$('[data-letter]'), ROT = [-5, 3.5, -2.2], REST = [-1.1, .7, -.6];
  function lettersScroll() {
    var wide = innerWidth > 980;
    if (still() || !wide) {
      letters.forEach(function (el, i) { el.style.setProperty('--lx', '0px'); el.style.setProperty('--ly', '0px'); el.style.setProperty('--lr', (wide ? REST[i] : 0) + 'deg'); });
      return;
    }
    var r = desk.getBoundingClientRect(); if (r.bottom < -200 || r.top > innerHeight + 200) return;
    var e = smooth((innerHeight - r.top) / (innerHeight * .75)), mid = desk.clientWidth / 2;
    letters.forEach(function (el, i) {
      var dx = mid - (el.offsetLeft + el.offsetWidth / 2);
      el.style.setProperty('--lx', (dx * (1 - e) * .62).toFixed(1) + 'px');
      el.style.setProperty('--ly', ((1 - e) * (i * 14 - 14)).toFixed(1) + 'px');
      el.style.setProperty('--lr', (ROT[i] * (1 - e) + REST[i] * e).toFixed(2) + 'deg');
    });
  }

  // ---------------------------------------------------------------- nav position under the concept bar, the round buttons
  var concept = $('.concept'), fab = $('[data-fab]'), head = $('.head'), reqSec = $('[data-req]');
  function chrome() {
    var cb = concept.getBoundingClientRect().bottom;
    root.style.setProperty('--navTop', Math.max(10, cb + 10).toFixed(0) + 'px');
    // hidden while the hero's own buttons are on screen, and from the form on (it has its own send, call and directions buttons)
    var show = head.getBoundingClientRect().bottom < innerHeight * .35 && reqSec.getBoundingClientRect().top > innerHeight * .92;
    fab.classList.toggle('show', show);
  }

  // ---------------------------------------------------------------- entrances: heading, text, picture, staggered
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var sib = $$('[data-rv]', e.target.closest('section') || document.body), i = Math.max(0, sib.indexOf(e.target));
        e.target.style.setProperty('--d', Math.min(i, 5) * 70 + 'ms');
        e.target.classList.add('in'); io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('[data-rv]').forEach(function (el) { io.observe(el); });
  } else $$('[data-rv]').forEach(function (el) { el.classList.add('in'); });

  function resetMotion() {
    if (still()) { seal1.style.opacity = ''; seal2.style.opacity = ''; sheetStamped = true; }
    else { sheetStamped = false; }
  }

  // ---------------------------------------------------------------- frame loop for scroll work
  var ticking = false;
  function frame() { ticking = false; chrome(); skyScroll(); whoScroll(); lettersScroll(); sheetSeal(); }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  function layout() { frame(); }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', function () { layout(); if (glApi) glApi.resize(); });
  window.__layout = layout;

  texts(he() ? 'he' : 'en'); hours(); waLinks();
  if (!still()) { seal2.style.opacity = '0'; stamp(seal1, -14, 650); }
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  addEventListener('load', layout);
})();
