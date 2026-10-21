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
  var STAR = '<svg viewBox="0 0 92 16" aria-hidden="true">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; }).join('') + '</svg>';
  $$('[data-stars]').forEach(function (s) { s.innerHTML = STAR; s.setAttribute('role', 'img'); });

  // ---------------------------------------------------------------- language
  var TOPICS = [
    ['any', 'על מה נדבר?', 'What about?'], ['home', 'הבית', 'Home'], ['car', 'הרכב', 'Car'],
    ['family', 'המשפחה', 'Family'], ['pension', 'חיסכון ופנסיה', 'Savings & pension'], ['other', 'משהו אחר', 'Something else']
  ];
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
    set('[data-t-sky]', 'aria-label', 'פתיחה', 'Opening');
    set('[data-t-map]', 'title', 'מפה: ההסתדרות 251, חיפה', 'Map: 251 HaHistadrut Blvd, Haifa');
    set('[data-prev]', 'aria-label', 'הקודם', 'Previous');
    set('[data-next]', 'aria-label', 'הבא', 'Next');
    set('[data-baro]', 'aria-label', '4.9 מתוך 5 בגוגל, 43 ביקורות', '4.9 out of 5 on Google, 43 reviews');
    var nm = $('[name=nm]'); nm.placeholder = nm.dataset[h ? 'phHe' : 'phEn'];
    var sel = $('[data-topic]'), v = sel.value;
    sel.innerHTML = TOPICS.map(function (t) { return '<option value="' + t[0] + '">' + (h ? t[1] : t[2]) + '</option>'; }).join('');
    sel.value = v || 'any';
    baroWords();
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('yi-lang', l); } catch (e) {}
    texts(l); hours(); waLinks(); tiles(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- WhatsApp: a short, honest first message
  var TOPIC_MSG = {
    he: { any: 'הביטוח שלי', home: 'ביטוח לבית', car: 'ביטוח לרכב', family: 'ביטוח למשפחה', pension: 'חיסכון ופנסיה', other: 'משהו אחר' },
    en: { any: 'my insurance', home: 'home insurance', car: 'car insurance', family: 'insurance for my family', pension: 'savings and pension', other: 'something else' }
  };
  function waText(name, topic) {
    var l = he() ? 'he' : 'en', t = TOPIC_MSG[l][topic || 'any'] || TOPIC_MSG[l].any, n = (name || '').trim();
    if (l === 'he') return 'שלום יואב, הגעתי דרך האתר. אשמח לדבר על ' + t + '.' + (n ? ' שמי ' + n + '.' : '');
    return 'Hi Yoav, I found you through the website. I’d like to talk about ' + t + '.' + (n ? ' My name is ' + n + '.' : '');
  }
  function waLinks() { $$('a[data-wa]').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(waText('', 'any')); }); }
  $('[data-composer]').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.currentTarget;
    var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(waText(f.nm.value, f.tp.value));
    var w = window.open(url, '_blank', 'noopener'); if (!w) location.href = url;
  });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var wasOff = still(), anchor = $('#cover'), keep = anchor.getBoundingClientRect().top, past = keep < innerHeight;
    root.classList.toggle('still', !wasOff); delete root.dataset.motionAuto;
    try { localStorage.setItem('yi-motion', wasOff ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-rv]').forEach(function (el) { el.classList.add('in'); });
    if (wasOff) startSky(); else stopSky();
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

  // ---------------------------------------------------------------- the sky: storm → rain → clear, scroll-linked both ways
  var sky = $('[data-sky]'), stage = $('[data-stage]'), beats = $$('[data-beat]'), glApi = null, glLoading = false, skyP = 0, stillIdx = 0;
  var stormImg = $('[data-storm]'), clearImg = $('[data-clear]'), stillImg = $('[data-still]');
  function beatAlpha(p) {
    return [1 - smooth((p - .16) / .12), smooth((p - .30) / .10) * (1 - smooth((p - .56) / .10)), smooth((p - .68) / .10)];
  }
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
    stage.style.setProperty('--clear', smooth((skyP - .3) / .5).toFixed(3));
    if (glApi) glApi.setP(skyP);
  }
  function startSky() {
    beats.forEach(function (b) { b.classList.remove('on'); });
    skyScroll();
    if (glApi) { glApi.start(); return; }
    if (glLoading) return;
    glLoading = true;
    import('./sky.js').then(function (m) {
      var big = innerWidth * Math.min(devicePixelRatio || 1, 1.5) > 1100;
      return m.createSky($('[data-gl]'), { storm: 'img/bay-storm-' + (big ? 1600 : 1000) + '.jpg', clear: 'img/bay-clear-' + (big ? 1600 : 1000) + '.jpg' });
    }).then(function (api) {
      if (!api) return;
      glApi = api; window.__skyApi = api;
      api.setP(skyP);
      if (!still()) { api.start(); stage.classList.add('gl-on'); }
    }).catch(function () {});
  }
  function stopSky() {
    if (glApi) glApi.stop();
    stage.classList.remove('gl-on');
    beats.forEach(function (b) { b.style.opacity = ''; b.style.visibility = ''; b.style.transform = ''; });
    setStill(0);
  }
  // animations off: a normal-height block; arrows and stage names step through three stills
  function setStill(i) {
    stillIdx = clamp(i, 0, 2);
    beats.forEach(function (b, k) { b.classList.toggle('on', k === stillIdx); });
    stillImg.src = 'img/still-' + (stillIdx + 1) + '.jpg';
    $$('[data-dot]').forEach(function (d) { d.setAttribute('aria-selected', +d.dataset.dot === stillIdx ? 'true' : 'false'); });
    $('[data-prev]').disabled = stillIdx === 0; $('[data-next]').disabled = stillIdx === 2;
  }
  $('[data-prev]').addEventListener('click', function () { setStill(stillIdx - 1); });
  $('[data-next]').addEventListener('click', function () { setStill(stillIdx + 1); });
  $$('[data-dot]').forEach(function (d) { d.addEventListener('click', function () { setStill(+d.dataset.dot); }); });
  if (still()) setStill(0);

  // ---------------------------------------------------------------- the squall drifts in slowly as it passes
  var squall = $('[data-squall]');
  function tiles() {
    if (still()) { squall.style.setProperty('--sq', '1'); return; }
    var r = squall.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    var p = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1);
    squall.style.setProperty('--sq', (1.12 - p * .1).toFixed(4));
  }

  // ---------------------------------------------------------------- the barometer
  var baro = $('[data-baro]'), needle = $('[data-needle]'), fc = $('[data-fc]');
  var ang = function (v) { return -135 + (v - 1) * 67.5; };
  var polar = function (a, r) { var t = (a - 90) * Math.PI / 180; return [r * Math.cos(t), r * Math.sin(t)]; };
  function arcPath(a0, a1, r) { var p0 = polar(a0, r), p1 = polar(a1, r); return 'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2); }
  (function drawDial() {
    var g = $('[data-ticks]'), s = '';
    for (var v = 1; v <= 5.0001; v += 0.1) {
      var major = Math.abs(v - Math.round(v)) < .001, half = Math.abs(v * 2 - Math.round(v * 2)) < .001;
      var a = ang(v), p0 = polar(a, 160), p1 = polar(a, major ? 138 : half ? 146 : 151);
      s += '<line x1="' + p0[0].toFixed(2) + '" y1="' + p0[1].toFixed(2) + '" x2="' + p1[0].toFixed(2) + '" y2="' + p1[1].toFixed(2) + '" stroke-width="' + (major ? 3 : 1.4) + '"/>';
    }
    g.innerHTML = s;
    $('[data-arc=storm]').setAttribute('d', arcPath(ang(1), ang(3), 128));
    $('[data-arc=fair]').setAttribute('d', arcPath(ang(4), ang(5), 128));
  })();
  function baroWords() {
    var W = he() ? ['סערה', 'גשם', 'משתנה', 'נאה', 'בהיר'] : ['Stormy', 'Rain', 'Change', 'Fair', 'Clear'], s = '';
    W.forEach(function (w, i) {
      var a = ang(i + 1), p = polar(a, 104), pn = polar(a, 172);
      s += '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 5).toFixed(1) + '" text-anchor="middle">' + w + '</text>';
    });
    $('[data-words]').innerHTML = s;
  }
  var needleA = ang(4.9), needleShown = null;
  function setNeedle(a) { if (needleShown !== null && Math.abs(a - needleShown) < .05) return; needleShown = a; needle.setAttribute('transform', 'rotate(' + a.toFixed(2) + ')'); }
  var quotes = $$('[data-q]');
  function fcScroll() {
    if (still()) { setNeedle(needleA); quotes.forEach(function (q) { q.classList.add('on'); }); return; }
    var r = fc.getBoundingClientRect(), pinned = innerWidth >= 1000;
    var p = pinned ? clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1) : clamp((innerHeight - r.top) / (innerHeight * 1.1), 0, 1);
    // the needle swings from storm to 4.9 as the section arrives, overshoots a touch and settles
    var k = pinned ? clamp((innerHeight - r.top) / (innerHeight * 1.2), 0, 1) : p;
    var e = smooth(k), over = Math.sin(clamp((k - .55) / .45, 0, 1) * Math.PI) * 6;
    setNeedle(ang(1.5) + (needleA - ang(1.5)) * e + over);
    if (pinned) {
      var step = p < .36 ? 0 : p < .68 ? 1 : 2;
      quotes.forEach(function (q, i) { q.classList.toggle('on', i === step); });
    } else quotes.forEach(function (q) { q.classList.add('on'); });
  }

  // ---------------------------------------------------------------- the strip of Haifa drifts with the scroll
  var strip = $('[data-strip]'), row = $('[data-strip-row]');
  function stripScroll() {
    if (still()) { row.style.transform = ''; return; }
    var r = strip.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    var p = (innerHeight - r.top) / (innerHeight + r.height), max = Math.max(0, row.scrollWidth - strip.clientWidth);
    var x = -max * .15 - p * max * .5;
    row.style.transform = 'translateX(' + (he() ? -x : x).toFixed(1) + 'px)';
  }

  // ---------------------------------------------------------------- nav position under the concept bar, the round buttons
  var concept = $('.concept'), fab = $('[data-fab]');
  function chrome() {
    var cb = concept.getBoundingClientRect().bottom;
    root.style.setProperty('--navTop', Math.max(10, cb + 10).toFixed(0) + 'px');
    fab.classList.toggle('show', sky.getBoundingClientRect().bottom < innerHeight * .6);
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

  // ---------------------------------------------------------------- frame loop for scroll work
  var ticking = false;
  function frame() { ticking = false; chrome(); skyScroll(); fcScroll(); stripScroll(); tiles(); }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  function layout() { tiles(); frame(); }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', function () { layout(); if (glApi) glApi.resize(); });
  window.__layout = layout;

  texts(he() ? 'he' : 'en'); hours(); waLinks();
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  addEventListener('load', layout);
  if (!still()) startSky();
})();
