(function () {
  var root = document.documentElement, WA = '972544432229';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { a = a == null ? 0 : a; b = b == null ? 1 : b; return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang !== 'en'; };
  var easeIO = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  var TITLE = { he: 'עידן אבוחצירה · מורה נהיגה בחיפה · אוטומט וידני', en: 'Idan Abuhatzira · Driving teacher in Haifa · Automatic and manual' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור עידן אבוחצירה מורה נהיגה · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Idan Abuhatzira, driving teacher · This is not the business’s official website' };
  var ARIA = {
    '.links': ['ניווט', 'Navigation'], '.brand': ['עידן אבוחצירה, לראש העמוד', 'Idan Abuhatzira, back to top'],
    '[data-tabs]': ['תיבת הילוכים', 'Transmission'], '[data-run]': ['ארבעה דברים שתלמידים כתבו', 'Four things students wrote']
  };
  var DAYS = {
    he: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'],
    heShort: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    enShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  };
  // opening hours from the Google listing. null = closed that day; [0, 24] = around the clock
  var H = { 0: [7, 22], 1: [7, 22], 2: [7, 22], 3: [7, 22], 4: [7, 22], 5: [7, 16], 6: null };

  function fmt(h) { var m = Math.round((h % 1) * 60); return Math.floor(h) + ':' + (m < 10 ? '0' : '') + m; }
  function nowHaifa() {
    var p = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
    return { day: DAYS.enShort.indexOf(o.weekday), h: (+o.hour % 24) + (+o.minute) / 60 };
  }
  function isOpen(d, h) { var x = H[d]; return !!x && h >= x[0] && h < x[1]; }
  function nextOpen(d, h) {
    for (var i = 0; i < 8; i++) {
      var dd = (d + i) % 7, x = H[dd];
      if (x && (i > 0 || h < x[0])) return { i: i, day: dd, at: x[0] };
    }
    return null;
  }

  // ---------------------------------------------------------------- status + hours table
  function status() {
    var n = nowHaifa(), el = $('[data-status]'), t;
    if (!el) return;
    var x = H[n.day];
    if (x && x[0] === 0 && x[1] === 24) t = he() ? 'פתוח עכשיו · מסביב לשעון' : 'Open now · around the clock';
    else if (isOpen(n.day, n.h)) t = he() ? 'פתוח עכשיו · עד ' + fmt(x[1]) : 'Open now · until ' + fmt(x[1]);
    else {
      var o = nextOpen(n.day, n.h);
      if (!o) t = he() ? 'סגור כרגע' : 'Closed now';
      else {
        var when = o.i === 0 ? (he() ? 'היום' : 'today') : o.i === 1 ? (he() ? 'מחר' : 'tomorrow') : (he() ? 'ביום ' + DAYS.he[o.day] : 'on ' + DAYS.en[o.day]);
        t = he() ? 'סגור עכשיו · נפתח ' + when + ' ב־' + fmt(o.at) : 'Closed now · opens ' + when + ' at ' + fmt(o.at);
      }
    }
    el.textContent = t; el.classList.toggle('open', isOpen(n.day, n.h));
  }
  function hoursTable() {
    var tb = $('[data-hours] tbody'), today = nowHaifa().day, l = he() ? 'he' : 'en';
    if (!tb) return;
    tb.innerHTML = '';
    for (var d = 0; d < 7; d++) {
      var x = H[d], tr = document.createElement('tr');
      if (d === today) tr.className = 'today';
      var a = document.createElement('td'), b = document.createElement('td');
      a.textContent = DAYS[l][d] + (d === today ? (l === 'he' ? ' · היום' : ' · today') : '');
      b.textContent = !x ? (l === 'he' ? 'סגור' : 'Closed') : (x[0] === 0 && x[1] === 24 ? (l === 'he' ? '24 שעות' : '24 hours') : fmt(x[0]) + '–' + fmt(x[1]));
      b.dir = 'ltr'; if (!x) b.dir = 'auto';
      tr.appendChild(a); tr.appendChild(b); tb.appendChild(tr);
    }
  }

  // ---------------------------------------------------------------- WhatsApp text
  function waHref(text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); }
  function genericWa() {
    var t = he() ? 'היי עידן, אשמח לשמוע על שיעורי נהיגה.' : 'Hi Idan, I’d like to hear about driving lessons.';
    $$('[data-wa]').forEach(function (a) { a.href = waHref(t); });
  }

  // ---------------------------------------------------------------- the lesson composer
  var form = $('[data-composer]'), keys = $('[data-days]'), range = $('#hour'), out = $('[data-hour-out]');
  var pickedDay = null;
  function buildDays() {
    var l = he() ? 'heShort' : 'enShort', full = he() ? 'he' : 'en';
    keys.innerHTML = '';
    for (var d = 0; d < 7; d++) {
      var lab = document.createElement('label'), inp = document.createElement('input'), sp = document.createElement('span');
      inp.type = 'radio'; inp.name = 'day'; inp.value = d; inp.disabled = !H[d];
      inp.setAttribute('aria-label', DAYS[full][d] + (!H[d] ? (he() ? ', סגור' : ', closed') : ''));
      if (d === pickedDay) inp.checked = true;
      sp.textContent = DAYS[l][d]; sp.setAttribute('aria-hidden', 'true');
      lab.appendChild(inp); lab.appendChild(sp); keys.appendChild(lab);
    }
  }
  function compose() {
    var x = H[pickedDay] || [7, 22];
    var max = x[0] === 0 && x[1] === 24 ? 23 : x[1] - 1, min = x[0];
    range.min = min; range.max = max;
    if (+range.value > max) range.value = max;
    if (+range.value < min) range.value = min;
    var t = fmt(+range.value); out.textContent = t;
    range.setAttribute('aria-valuetext', t);
    var gear = (form.querySelector('[name=gear]:checked') || {}).value || 'a';
    var msg = he()
      ? 'היי עידן, אשמח לקבוע שיעור נהיגה ברכב ' + (gear === 'a' ? 'אוטומטי' : 'ידני') + ', ביום ' + DAYS.he[pickedDay] + ' בסביבות ' + t + '.'
      : 'Hi Idan, I’d like to book a driving lesson in ' + (gear === 'a' ? 'an automatic' : 'a manual') + ' car, on ' + DAYS.en[pickedDay] + ' around ' + t + '.';
    $('[data-preview]').textContent = (he() ? '״' : '“') + msg + (he() ? '״' : '”');
    $('[data-send]').href = waHref(msg);
  }
  (function initComposer() {
    var n = nowHaifa(), o = isOpen(n.day, n.h + 1) ? { day: n.day } : nextOpen(n.day, n.h);
    pickedDay = o ? o.day : 0;
    if (!H[pickedDay]) pickedDay = 0;
    form.addEventListener('change', function (e) {
      if (e.target.name === 'day') pickedDay = +e.target.value;
      compose();
    });
    range.addEventListener('input', compose);
  })();

  // ---------------------------------------------------------------- car tabs (automatic / manual)
  var tabs = $$('[data-tab]');
  function selectTab(k, focus) {
    tabs.forEach(function (b) {
      var on = b.dataset.tab === k; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    $$('[data-pane]').forEach(function (p) { p.hidden = p.dataset.pane !== k; });
  }
  tabs.forEach(function (b, i) {
    b.addEventListener('click', function () { selectTab(b.dataset.tab); });
    b.addEventListener('keydown', function (e) {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(e.key) < 0) return;
      e.preventDefault(); selectTab(tabs[(i + 1) % tabs.length].dataset.tab, true);
    });
  });

  // ---------------------------------------------------------------- language
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    try { localStorage.setItem('lang', l); } catch (e) {}
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-aria-he]').forEach(function (i) { i.setAttribute('aria-label', i.dataset[l === 'he' ? 'ariaHe' : 'ariaEn']); });
    Object.keys(ARIA).forEach(function (k) { var el = $(k); if (el) el.setAttribute('aria-label', ARIA[k][l === 'he' ? 0 : 1]); });
    $('.map iframe').title = l === 'he' ? 'מפת Google: משה גוט לוין 18, חיפה' : 'Google Maps: 18 Moshe Goth Levin St, Haifa';
    genericWa(); status(); hoursTable(); buildDays(); compose(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- animations switch, remembered
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    if (!on) { clearMotion(); if (vid) { vid.pause(); } $$('.rv').forEach(function (el) { el.classList.add('in'); }); }
    layout(); frame();
  }); });
  motionUI();

  // ---------------------------------------------------------------- entrances
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('.rv').forEach(function (el) {
    var sib = el.parentElement ? [].slice.call(el.parentElement.children).filter(function (c) { return c.classList.contains('rv'); }) : [];
    el.style.setProperty('--d', (Math.max(0, sib.indexOf(el)) * 80) + 'ms');
    if (io && !still()) io.observe(el); else el.classList.add('in');
  });

  // ---------------------------------------------------------------- turn signal, a few blinks when seen (WAAPI, never an endless loop)
  function blinkOnce(el, n, cb) {
    if (!el.animate) return;
    var a = el.animate([{ opacity: 0 }, { opacity: 1, offset: 0.12 }, { opacity: 1, offset: 0.5 }, { opacity: 0, offset: 0.62 }, { opacity: 0 }], { duration: 760, iterations: n, easing: 'linear' });
    if (cb) a.onfinish = cb;
  }
  var sig = $('[data-signal]');
  if (sig && io) {
    new IntersectionObserver(function (es, ob) {
      es.forEach(function (e) {
        if (!e.isIntersecting || still()) return;
        var lamps = $$('.lamp', sig);
        var first = root.dir === 'rtl' ? lamps[0] : lamps[1], second = root.dir === 'rtl' ? lamps[1] : lamps[0];
        blinkOnce(first, 4, function () { setTimeout(function () { blinkOnce(second, 4); }, 300); });
      });
    }, { threshold: 0.6 }).observe(sig);
  }
  // the word "signal" in the mirror heading blinks amber three times when the stage arrives
  var blinkWords = $$('[data-blink]'), blinked = false;
  function blinkWord() {
    if (blinked || still()) return; blinked = true;
    var w = $('[lang="' + root.lang + '"] [data-blink]') || blinkWords[0], i = 0;
    (function step() { w.classList.toggle('lit', i % 2 === 0); if (++i < 6) setTimeout(step, 380); else w.classList.remove('lit'); })();
  }

  // ---------------------------------------------------------------- the night-drive clip plays once each time it comes into view (no endless loop)
  var vid = $('[data-video]');
  if (vid && io) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (still()) return;
        if (e.isIntersecting) { try { if (vid.ended || vid.currentTime > 0.1) vid.currentTime = 0; vid.play().catch(function () {}); } catch (x) {} }
        else vid.pause();
      });
    }, { threshold: 0.5 }).observe(vid);
  }

  // ---------------------------------------------------------------- the rear-view mirror
  var run = $('[data-mirror]'), stage = $('[data-stage]'), mImg = $('[data-m-photo] img'), head = $('[data-m-head]');
  var car = $('[data-car]'), carImg = $('[data-car-img]'), carText = $('.car-text'), carFig = $('.car-photo');
  // the glass of the mirror inside mirror.jpg (1600 × 1065)
  var G = { x: 224, y: 470, w: 852, h: 286, r: 60, iw: 1600, ih: 1065 };
  var M = null;
  function layout() {
    if (still()) { M = null; head.style.cssText = ''; return; }
    var W = stage.clientWidth, Hh = stage.clientHeight;
    car.style.clipPath = 'none';
    var sr = stage.getBoundingClientRect(), fr = carFig.getBoundingClientRect(), tr = carText.getBoundingClientRect();
    var cx = fr.left - sr.left + fr.width / 2, cy = fr.top - sr.top + fr.height / 2;
    var cover = Math.max(W / G.iw, Hh / G.ih);
    var fitW = 2 * Math.min(cx, W - cx) * (W < 821 ? 0.94 : 0.84) / G.w, fitH = fr.height * 0.62 / G.h;
    var s = Math.min(cover, fitW, fitH);
    if (W < 821) cy = Math.max(cy, Math.min(fr.bottom - sr.top - G.h * s / 2 - 16, Hh * 0.42));
    var mx = (G.x + G.w / 2) * s, my = (G.y + G.h / 2) * s;
    mImg.style.width = (G.iw * s) + 'px'; mImg.style.height = (G.ih * s) + 'px';
    mImg.style.left = (cx - mx) + 'px'; mImg.style.top = (cy - my) + 'px';
    mImg.style.transformOrigin = mx + 'px ' + my + 'px';
    var kEnd = Math.max(2 * Math.max(cx, W - cx) / (G.w * s), 2 * Math.max(cy, Hh - cy) / (G.h * s)) * 1.04;
    // the heading sits where the car's text will appear (beside the mirror on wide screens, under it on phones)
    var top = tr.top - sr.top, left = tr.left - sr.left;
    if (W < 821) { // phones: the line sits just under the mirror
      head.style.top = (cy + G.h * s / 2 + 36) + 'px'; head.style.left = '0px'; head.style.width = W + 'px'; head.style.height = 'auto';
    } else { head.style.top = top + 'px'; head.style.left = left + 'px'; head.style.width = tr.width + 'px'; head.style.height = Math.min(tr.height, Hh - top) + 'px'; }
    M = { W: W, H: Hh, cx: cx, cy: cy, s: s, kEnd: kEnd };
  }
  function clearMotion() {
    [mImg, head, carText, carImg, car].forEach(function (el) { el.style.transform = ''; el.style.opacity = ''; el.style.visibility = ''; });
    car.style.clipPath = ''; head.style.cssText = '';
    $$('[data-par]').forEach(function (i) { i.style.transform = ''; });
    var hp = $('[data-hero-photo] img'), sg = $('[data-sign]'), ln = $('[data-lane]');
    [hp, sg, ln].forEach(function (el) { el.style.transform = ''; el.style.opacity = ''; });
  }
  function mirrorFrame() {
    if (!M) return;
    var r = run.getBoundingClientRect(), span = r.height - M.H;
    var p = clamp(-r.top / span);
    if (r.top < M.H * 0.4 && r.bottom > 0) blinkWord();
    if (r.top > M.H) blinked = false;
    var t = easeIO(clamp((p - 0.14) / 0.66));
    var k = Math.pow(M.kEnd, t);
    mImg.style.transform = 'scale(' + k + ')';
    // heading: present at first, leaves as the zoom starts
    var hq = clamp((p - 0.16) / 0.16);
    head.style.opacity = 1 - hq; head.style.transform = 'translateY(' + (-hq * 30) + 'px)'; head.style.visibility = hq >= 1 ? 'hidden' : '';
    // the car shows up inside the glass first, then the glass grows to become the whole screen
    var gw = G.w * M.s * k, gh = G.h * M.s * k;
    var x0 = M.cx - gw / 2, y0 = M.cy - gh / 2;
    var rad = Math.min(G.r * M.s * k, 80) * Math.pow(1 - t, 1.5);
    var it = Math.max(0, y0), il = Math.max(0, x0), ib = Math.max(0, M.H - (y0 + gh)), ir = Math.max(0, M.W - (x0 + gw));
    car.style.clipPath = 'inset(' + it + 'px ' + ir + 'px ' + ib + 'px ' + il + 'px round ' + rad + 'px)';
    car.style.opacity = clamp((p - 0.03) / 0.16);
    carImg.style.transform = 'scale(' + (1.18 - 0.18 * t) + ')';
    var tq = clamp((t - 0.62) / 0.33);
    carText.style.opacity = tq; carText.style.transform = 'translateY(' + ((1 - tq) * 24) + 'px)'; carText.style.visibility = tq <= 0 ? 'hidden' : '';
  }

  // ---------------------------------------------------------------- hero push-in, lane, card parallax, plate bar
  var heroImg = $('[data-hero-photo] img'), sign = $('[data-sign]'), lane = $('[data-lane]'), bar = $('[data-platebar]'), hero = $('.hero');
  var pars = $$('[data-par]');
  function frame() {
    var vh = window.innerHeight, y = window.scrollY;
    bar.classList.toggle('show', y > hero.offsetHeight * 0.55);
    if (still()) return;
    var hp = clamp(y / vh);
    heroImg.style.transform = 'scale(' + (1 + hp * 0.14) + ') translateY(' + (hp * 30) + 'px)';
    sign.style.transform = 'translateY(' + (-hp * 70) + 'px)'; sign.style.opacity = 1 - hp * 0.7;
    lane.style.transform = 'translateX(' + (((y * 0.9) % 100) * (root.dir === 'rtl' ? 1 : -1)) + 'px)';
    mirrorFrame();
    pars.forEach(function (im) {
      var b = im.parentElement.getBoundingClientRect();
      if (b.bottom < -50 || b.top > vh + 50) return;
      var d = (b.top + b.height / 2 - vh / 2) / vh;
      im.style.transform = 'scale(1.16) translateY(' + (d * -32) + 'px)';
    });
  }
  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; frame(); }); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); frame(); }, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); frame(); });
  if (!carImg.complete) carImg.addEventListener('load', function () { layout(); frame(); });

  window.__mirror = function () { return M; };
  setLang(root.lang === 'en' ? 'en' : 'he');
  frame();
  setInterval(status, 60000);
})();
