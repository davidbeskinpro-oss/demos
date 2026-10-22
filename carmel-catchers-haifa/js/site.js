(function () {
  var root = document.documentElement, WA = '972545878710';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: 'לוכדי הכרמל · הדברה ולכידת נחשים · נוגה 7, חיפה', en: 'Carmel Catchers · pest control & snake catching · 7 Noga St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור לוכדי הכרמל · זה אינו האתר הרשמי של העסק', en: 'Concept demo made for Carmel Catchers · not the business’s official website' };

  var STAR = '<svg viewBox="0 0 92 16" aria-hidden="true">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; }).join('') + '</svg>';
  $$('[data-stars]').forEach(function (s) { s.innerHTML = STAR; });

  // ================================================================ language
  var hood = $('[data-hood]');
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    try { localStorage.setItem('lk-lang', l); } catch (e) {}
    $$('img[data-alt-he]').forEach(function (im) { im.alt = im.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('iframe[data-title-he]').forEach(function (f) { f.title = f.dataset[l === 'he' ? 'titleHe' : 'titleEn']; });
    $$('[data-aria-he]').forEach(function (el) { el.setAttribute('aria-label', el.dataset[l === 'he' ? 'ariaHe' : 'ariaEn']); });
    $$('[data-motion-toggle]').forEach(function (b) { b.setAttribute('aria-label', l === 'he' ? 'אנימציות' : 'Animations'); });
    $$('[data-set-lang]').forEach(function (b) { b.setAttribute('aria-label', l === 'he' ? 'English' : 'עברית'); b.setAttribute('lang', l === 'he' ? 'en' : 'he'); });
    var nav = $('[data-nav]'); if (nav) nav.setAttribute('aria-label', l === 'he' ? 'ראשי' : 'Main');
    hood.placeholder = l === 'he' ? 'למשל: נווה שאנן…' : 'E.g. Neve Sha’anan…';
    hours(); write(); trailLayout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ================================================================ motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('lk-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    resetMotion(); trailLayout(); frame();
  }); });
  motionUI();

  // ================================================================ hours and live status, Israel time. null = closed that day, [0, 24] = all day
  var H = { 0: [9, 17], 1: [9, 17], 2: [9, 17], 3: [9, 17], 4: [9, 17], 5: [7.5, 20], 6: [9, 17] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; };
  var all = function (t) { return t && t[0] === 0 && t[1] === 24; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (all(t)) { open = true; txt = l ? 'זמינים עכשיו · 24 שעות' : 'Available now · 24 hours'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'זמינים עכשיו · עד ' + hhmm(t[1]) : 'Available now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) { txt = l ? 'מחוץ לשעות · היום מ-' + hhmm(t[0]) : 'Outside hours · today from ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      var from = H[nd] ? hhmm(H[nd][0]) : '', allNext = all(H[nd]);
      txt = !H[nd] ? (l ? 'מחוץ לשעות' : 'Outside hours')
        : nd === (n.d + 1) % 7 ? (l ? 'מחוץ לשעות · מחר ' + (allNext ? 'כל היום' : 'מ-' + from) : 'Outside hours · tomorrow ' + (allNext ? 'all day' : 'from ' + from))
        : (l ? 'מחוץ לשעות · ביום ' + dayHe[nd] + ' ' + (allNext ? 'כל היום' : 'מ-' + from) : 'Outside hours · ' + dayEn[nd] + (allNext ? ', all day' : ' from ' + from));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // consecutive days with the same hours share a row
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = '<caption class="sr">' + (l ? 'שעות פעילות' : 'Opening hours') + '</caption>' + rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var label = r[0] === r[1] ? names[r[0]] : names[r[0]] + (r[1] - r[0] === 1 ? (l ? ' ו' : ' and ') : '–') + names[r[1]];
      var time = !t ? (l ? 'סגור' : 'Closed') : all(t) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + label + '</td><td>' + time + '</td></tr>';
    }).join('');
    status();
  }
  window.__status = status; window.__H = H; window.__hours = hours;
  setInterval(status, 30000);

  // ================================================================ composer: what was found, where, which street
  var WHAT = {
    snake: ['נחש', 'a snake'], rats: ['חולדות או עכברים', 'rats or mice'], roaches: ['תיקנים', 'cockroaches'], ants: ['נמלים', 'ants'],
    wasps: ['צרעות', 'wasps'], fleas: ['פרעושים', 'fleas'], scorp: ['עקרבים או נדלים', 'scorpions or centipedes'], bedbugs: ['פשפש המיטה', 'bedbugs']
  };
  var WHERE = { home: ['בבית', 'at home'], garden: ['בגינה', 'in the garden'], stairs: ['בבניין', 'in the building'], biz: ['בעסק', 'at my business'] };
  var note = $('[data-note]'), send = $('[data-send]');
  function list(arr, l) {
    if (arr.length < 2) return arr.join('');
    return arr.slice(0, -1).join(', ') + (l ? ' ו' : ' and ') + arr[arr.length - 1];
  }
  function write() {
    var l = he(), k = l ? 0 : 1;
    var what = $$('[data-what] input:checked').map(function (i) { return WHAT[i.value][k]; });
    var w = $('[data-where] input:checked'), where = w ? WHERE[w.value][k] : '';
    var place = (hood.value || '').trim().replace(/\s+/g, ' ');
    var msg;
    if (l) {
      msg = 'שלום תומר, ' + (what.length ? 'מצאתי ' + list(what, true) : 'יש לי שאלה על הדברה') + (where ? ' ' + where : '') + (place ? ', באזור ' + place : '') + '. אפשר לתאם ביקור?';
    } else {
      msg = 'Hi Tomer, ' + (what.length ? 'I found ' + list(what, false) : 'I have a pest control question') + (where ? ' ' + where : '') + (place ? ', around ' + place : '') + '. Could we arrange a visit?';
    }
    note.textContent = msg;
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
  }
  $$('[data-what] input, [data-where] input').forEach(function (i) { i.addEventListener('change', write); });
  hood.addEventListener('input', write);

  // ================================================================ reveals
  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    $$('[data-reveal]').forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 75 + 'ms'; io.observe(el); });
  } else { $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); }); }

  // ================================================================ header and dock
  var bar = $('[data-bar]'), dock = $('[data-dock]'), hero = $('[data-hero]'), end = $('.end');

  // ================================================================ HERO: slow push into the valley, the near rock comes towards you
  var hBase = $('[data-h-base]'), hRock = $('[data-h-rock]'), hLight = $('[data-h-light]'), who = $('[data-terrace]');

  // ================================================================ THE TRAIL (signature)
  // Four real photographs, stacked. Each layer always covers the whole stage (object-fit: cover, scale >= 1),
  // and a new layer fades in ON TOP of the one below while the lower one stays fully opaque, so no gap can ever show.
  // p runs 0..3.6 over the pinned scroll:
  //   0      street photo, the camera pushes in on the roof box
  //   .62–1  the trail fades in on top, and keeps walking forward along the path (dolly)
  //   1.62–2 the stones fade in, first out of focus; the focus pulls in until the snake is seen (2–2.55)
  //   2.62–3 the valley fades in close, then the camera pulls back to the sea (3–3.6)
  var trail = $('[data-trail]'), stage = $('[data-stage]');
  var L = $$('[data-ly]').sort(function (a, b) { return a.dataset.ly - b.dataset.ly; }), soft = $('[data-soft]'), sun = $('[data-sun]'), motesBox = $('[data-motes]');
  var caps = $$('[data-cap]'), marks = $$('[data-go]');
  var T = { top: 0, h: 0, vh: 0 }, PMAX = 3.6, cur = 0;
  // dust in the light: a few motes that drift with the scroll, no endless loops
  var motes = [];
  (function () {
    var seed = 11, rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (var i = 0; i < 16; i++) {
      var m = document.createElement('i'), s = 2 + rnd() * 4;
      m.style.setProperty('--s', s.toFixed(1) + 'px');
      m.style.left = (rnd() * 100).toFixed(1) + '%'; m.style.top = (10 + rnd() * 70).toFixed(1) + '%';
      motesBox.appendChild(m); motes.push({ el: m, dx: (rnd() - .5) * 90, dy: -30 - rnd() * 120, ph: rnd() * 6.28, o: .25 + rnd() * .55 });
    }
  })();
  function trailLayout() {
    var r = trail.getBoundingClientRect();
    T.top = r.top + window.scrollY; T.h = trail.offsetHeight; T.vh = window.innerHeight; T.w = window.innerWidth;
  }
  function setCap(i) {
    caps.forEach(function (c, k) { c.style.visibility = ''; c.classList.toggle('cur', k === i); c.style.opacity = k === i ? 1 : 0; c.style.transform = 'none'; c.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
    marks.forEach(function (m, k) { m.classList.toggle('on', k === i); m.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
  }
  function scene(p) {
    // layer 0: push in on the roof box
    L[0].style.opacity = 1;
    var wide = T.w > 760;
    L[0].style.transform = 'scale(' + ((wide ? 1.0 : 1.3) + (wide ? 0.14 : 0.16) * smooth(p / 1.0)).toFixed(4) + ')';
    // layer 1: fades in already moving forward, then walks the path
    var a1 = smooth((p - 0.62) / 0.38);
    L[1].style.opacity = a1.toFixed(3);
    L[1].style.transform = 'scale(' + (1.04 + 0.34 * clamp((p - 0.62) / 1.4, 0, 1)).toFixed(4) + ')';
    // layer 2: the stones; out of focus first, then sharp, with a slow settle
    var a2 = smooth((p - 1.62) / 0.38);
    var s2 = 'scale(' + (1.14 - 0.12 * clamp((p - 1.62) / 1.2, 0, 1)).toFixed(4) + ')';
    L[2].style.opacity = a2.toFixed(3); L[2].style.transform = s2;
    soft.style.opacity = (a2 * (1 - smooth((p - 2.0) / 0.55))).toFixed(3); soft.style.transform = s2;
    // layer 3: the valley arrives close and pulls back to the sea
    var a3 = smooth((p - 2.62) / 0.38);
    L[3].style.opacity = a3.toFixed(3);
    L[3].style.transform = 'scale(' + (1.3 - 0.3 * smooth((p - 2.62) / 0.98)).toFixed(4) + ')';
    // light: warms in on the trail, fades in the stones, opens wide over the valley
    var sunO = 0.55 * smooth((p - 0.7) / 0.6) * (1 - smooth((p - 1.7) / 0.4)) + 0.85 * smooth((p - 2.8) / 0.6);
    sun.style.opacity = sunO.toFixed(3);
    sun.style.transform = 'translate3d(' + (-4 + p * 2.2).toFixed(2) + '%,' + (p * 1.2).toFixed(2) + '%,0)';
    motes.forEach(function (m) {
      var k = p / PMAX;
      m.el.style.transform = 'translate3d(' + (m.dx * k + Math.sin(m.ph + p * 2.4) * 8).toFixed(1) + 'px,' + (m.dy * k).toFixed(1) + 'px,0)';
      m.el.style.opacity = (m.o * (0.35 + 0.65 * sunO)).toFixed(3);
    });
    // captions: each holds the screen for its part of the walk
    var C = [[-1, 0.55], [0.7, 1.55], [1.75, 2.55], [2.75, 9]];
    caps.forEach(function (c, i) {
      var inn = smooth((p - C[i][0]) / 0.15), out = 1 - smooth((p - C[i][1]) / 0.15), o = Math.min(inn, out);
      c.style.opacity = o.toFixed(3);
      c.style.transform = 'translateY(' + ((1 - inn) * 18 - (1 - out) * 18).toFixed(1) + 'px)';
      c.setAttribute('aria-hidden', o > .5 ? 'false' : 'true');
      c.style.visibility = o < 0.01 ? 'hidden' : 'visible';
    });
    var idx = p < 0.62 ? 0 : p < 1.62 ? 1 : p < 2.62 ? 2 : 3;
    if (idx !== cur) { cur = idx; }
    marks.forEach(function (m, k) { m.classList.toggle('on', k === idx); m.setAttribute('aria-pressed', k === idx ? 'true' : 'false'); });
  }
  // still mode: one photograph per stop, stepped by the markers and the arrows; scrolling never changes it
  function showStill(i) {
    cur = clamp(i, 0, 3);
    L.forEach(function (ly, k) { ly.style.opacity = k <= cur ? 1 : 0; ly.style.transform = 'none'; });
    soft.style.opacity = 0;
    sun.style.opacity = cur === 3 ? .6 : 0;
    setCap(cur);
  }
  function go(i) {
    i = clamp(i, 0, 3);
    if (still()) { showStill(i); return; }
    var target = [0.1, 1.15, 2.3, 3.4][i];
    var y = T.top + (target / PMAX) * (T.h - T.vh);
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
  marks.forEach(function (m) { m.addEventListener('click', function () { go(+m.dataset.go); }); });
  $$('[data-step]').forEach(function (b) { b.addEventListener('click', function () { go(cur + (+b.dataset.step)); }); });

  function resetMotion() {
    if (still()) {
      hBase.style.transform = hRock.style.transform = ''; hLight.style.transform = ''; who.style.removeProperty('--tr');
      showStill(cur);
    }
  }

  // ================================================================ the frame loop: only while scrolling
  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    bar.classList.toggle('solid', y > 40);
    if (dock) {
      var e = end.getBoundingClientRect().top;
      dock.classList.toggle('away', y < vh * 0.35 || e < vh - 40);
    }
    if (still()) return;
    // hero
    var hp = clamp(y / vh, 0, 1.2);
    hBase.style.transform = 'scale(' + (1.02 + 0.08 * hp).toFixed(4) + ') translate3d(0,' + (hp * 4).toFixed(2) + '%,0)';
    hRock.style.transform = 'scale(' + (1 + 0.16 * hp).toFixed(4) + ')';
    hLight.style.transform = 'translate3d(' + (-hp * 6).toFixed(2) + '%,' + (hp * 3).toFixed(2) + '%,0)';
    who.style.setProperty('--tr', (hp * -14).toFixed(1) + 'px');
    // trail
    var p = clamp((y - T.top) / Math.max(1, T.h - vh), 0, 1) * PMAX;
    if (y + vh > T.top - vh && y < T.top + T.h + vh) scene(p);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { trailLayout(); onScroll(); });
  window.addEventListener('load', function () { trailLayout(); onScroll(); });

  // start
  setLang(root.lang === 'en' ? 'en' : 'he');
  trailLayout();
  if (still()) showStill(0); else scene(0);
  frame();
  window.__scene = scene; window.__go = go;
})();
