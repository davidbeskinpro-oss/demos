/* Gili & Miki concept: language, the motion switch, live hours, the hero spotlights, the two chairs turning,
   the rating clock, the hooks-chairs-LED composer, and the signature move: the cutting cape whipped off "the work",
   tied to the scroll both ways. */
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang !== 'en'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var store = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };
  var PHONE = '972545451664';

  // ---------------------------------------------------------------- hours from the Google listing (0 = Sunday); Monday and Saturday closed
  var HOURS = window.GM_HOURS || { 0: [540, 1140], 1: null, 2: [540, 1140], 3: [540, 1140], 4: [540, 1140], 5: [540, 780], 6: null };
  var DAY_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  var DAY_HE_S = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
  var DAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var DAY_EN_S = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (m) { return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2); };
  var hShort = function (m) { return m % 60 ? hhmm(m) : String(m / 60); };
  var allDay = function (h) { return h && h[0] === 0 && h[1] >= 1440; };
  function nowIL() {
    var p = {};
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
        .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      return { d: DAY_EN_S.indexOf(p.weekday), m: (+p.hour % 24) * 60 + (+p.minute) };
    } catch (e) { var n = new Date(); return { d: n.getDay(), m: n.getHours() * 60 + n.getMinutes() }; }
  }
  function state() {
    var n = nowIL(), h = HOURS[n.d];
    if (h && n.m >= h[0] && n.m < h[1]) {
      // open past midnight into a 24-hour next day: report it as open all day
      var nx = HOURS[(n.d + 1) % 7];
      return { open: true, until: h[1] >= 1440 && allDay(nx) ? 1440 : h[1], d: n.d, left: h[1] - n.m };
    }
    if (h && n.m < h[0]) return { open: false, inDays: 0, at: h[0], d: n.d, nd: n.d };
    for (var i = 1; i <= 7; i++) { var d = (n.d + i) % 7; if (HOURS[d]) return { open: false, inDays: i, at: HOURS[d][0], d: n.d, nd: d }; }
    return { open: false, d: n.d, none: true };
  }
  function statusText(s) {
    if (s.none) return he() ? 'השעות יתעדכנו בקרוב' : 'Hours to be updated';
    if (s.open && s.until >= 1440) return he() ? 'פתוח עכשיו · כל היום' : 'Open now · all day';
    if (s.open) return he() ? 'פתוח עכשיו · עד ' + hhmm(s.until) : 'Open now · until ' + hhmm(s.until);
    if (s.inDays === 0) return he() ? 'סגור עכשיו · נפתח היום ב-' + hhmm(s.at) : 'Closed now · opens today at ' + hhmm(s.at);
    if (s.inDays === 1) return he() ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(s.at) : 'Closed now · opens tomorrow at ' + hhmm(s.at);
    return he() ? 'סגור עכשיו · נפתח ביום ' + DAY_HE[s.nd] + ' ב-' + hhmm(s.at) : 'Closed now · opens ' + DAY_EN[s.nd] + ' at ' + hhmm(s.at);
  }
  function renderHours() {
    var s = state();
    $$('[data-status]').forEach(function (el) { el.textContent = statusText(s); el.classList.toggle('is-open', s.open); el.classList.toggle('is-closed', !s.open); });
    $$('[data-status-short]').forEach(function (el) { el.textContent = s.open ? (he() ? 'פתוח' + (s.until < 1440 ? ' עד ' + hhmm(s.until) : '') : 'Open' + (s.until < 1440 ? ' until ' + hhmm(s.until) : '')) : (he() ? 'סגור כרגע' : 'Closed now'); });
    var dot = $('[data-dot]'); if (dot) dot.classList.toggle('open', s.open);
    var tb = $('[data-hours]'); if (!tb) return;
    tb.innerHTML = '';
    for (var k = 0; k < 7; k++) {
      var h = HOURS[k], tr = document.createElement('tr'), a = document.createElement('td'), b = document.createElement('td');
      a.textContent = he() ? 'יום ' + DAY_HE[k] : DAY_EN[k];
      b.textContent = !h ? (he() ? 'סגור' : 'Closed') : allDay(h) ? (he() ? '24 שעות' : '24 hours') : hhmm(h[0]) + '–' + hhmm(h[1]);
      b.dir = 'ltr';
      if (!h) tr.className = 'closed';
      if (k === s.d) tr.classList.add('today');
      tr.appendChild(a); tr.appendChild(b); tb.appendChild(tr);
    }
  }

  // ---------------------------------------------------------------- language
  var ARIA = [
    ['[data-nav]', 'ראשי', 'Main'],
    ['[data-strap]', 'יצירת קשר מהירה', 'Quick contact'],
    ['[data-for]', 'לגברים, לנשים ולילדים', 'For men, women and kids'],
    ['.five', '5 כוכבים', '5 stars']
  ];
  function applyLang() {
    var e = !he();
    $$('[data-alt-he]').forEach(function (img) { img.alt = img.getAttribute(e ? 'data-alt-en' : 'data-alt-he'); });
    $$('[data-ph-he]').forEach(function (i) { i.placeholder = i.getAttribute(e ? 'data-ph-en' : 'data-ph-he'); });
    ARIA.forEach(function (a) { $$(a[0]).forEach(function (el) { el.setAttribute('aria-label', e ? a[2] : a[1]); }); });
    var mf = $('.map iframe'); if (mf) mf.title = e ? 'Map: Gili & Miki, 17 Jabotinsky St, Haifa' : 'מפה: גילי ומיקי, ז\'בוטינסקי 17, חיפה';
    document.title = e ? 'Gili & Miki · Hair designers · 17 Jabotinsky St, Haifa' : 'גילי ומיקי · מעצבי שיער · ז\'בוטינסקי 17, חיפה';
    renderHours(); buildDays(); writeMsg(true);
  }
  $$('[data-set-lang]').forEach(function (b) {
    b.addEventListener('click', function () {
      var l = he() ? 'en' : 'he';
      root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr'; store('gm-lang', l);
      var u = new URL(location.href); if (l === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang');
      try { history.replaceState(null, '', u); } catch (err) {}
      applyLang(); layout();
    });
  });

  // ---------------------------------------------------------------- the composer: capes on hooks, chairs, the LED day strip
  var form = $('[data-composer]'), preview = $('[data-preview]'), send = $('[data-send]'), sendLabel = $('[data-send-label]'), daysBox = $('[data-days]');
  function defaultDay() {
    var s = state();
    if (s.open && s.left > 90) return s.d;
    if (s.nd != null) return s.nd;
    for (var i = 1; i <= 7; i++) { var d = (s.d + i) % 7; if (HOURS[d]) return d; }
    return 0;
  }
  function buildDays() {
    if (!daysBox) return;
    var cur = form.querySelector('input[name="day"]:checked'), pick = cur && HOURS[+cur.value] ? +cur.value : defaultDay();
    daysBox.innerHTML = '';
    for (var d = 0; d < 7; d++) {
      var h = HOURS[d], lab = document.createElement('label'), inp = document.createElement('input'), sp = document.createElement('span'), sm = document.createElement('small');
      lab.className = 'led';
      inp.type = 'radio'; inp.name = 'day'; inp.value = d; inp.disabled = !h; inp.checked = d === pick && !!h;
      inp.setAttribute('aria-label', (he() ? 'יום ' + DAY_HE[d] : DAY_EN[d]) + (h ? '' : (he() ? ', סגור' : ', closed')));
      sp.textContent = he() ? DAY_HE_S[d] : DAY_EN_S[d];
      sm.textContent = !h ? (he() ? 'סגור' : 'closed') : allDay(h) ? '24h' : hShort(h[0]) + '–' + hShort(h[1]);
      sm.dir = 'ltr';
      sp.appendChild(sm); lab.appendChild(inp); lab.appendChild(sp); daysBox.appendChild(lab);
    }
  }
  var WHO_HE = { me: 'אשמח לקבוע לעצמי תור לתספורת', son: 'אשמח לקבוע תור לתספורת לבן שלי', daughter: 'אשמח לקבוע תור לתספורת לבת שלי' };
  var WHO_EN = { me: 'I’d like to book a haircut for myself', son: 'I’d like to book a haircut for my son', daughter: 'I’d like to book a haircut for my daughter' };
  function msg() {
    var f = new FormData(form), w = f.get('who') || 'me', p = f.get('with') || 'any', d = f.get('day'), n = (f.get('name') || '').trim().slice(0, 40);
    var day = d == null ? '' : +d;
    if (he()) {
      var hi = p === 'gili' ? 'היי גילי' : p === 'miki' ? 'היי מיקי' : 'היי גילי ומיקי';
      var q = p === 'any' ? ' אצל מי שפנוי. מתי יש לכם מקום?' : '. מתי יש לך מקום?';
      return hi + ', ' + WHO_HE[w] + (day === '' ? '' : ' ביום ' + DAY_HE[day]) + q + (n ? '\nתודה, ' + n : '');
    }
    var hiE = p === 'gili' ? 'Hi Gili' : p === 'miki' ? 'Hi Miki' : 'Hi Gili & Miki';
    var qE = p === 'any' ? ' with whoever’s free. When do you have a slot?' : '. When do you have a slot?';
    return hiE + ', ' + WHO_EN[w] + (day === '' ? '' : ' on ' + DAY_EN[day]) + qE + (n ? '\nThanks, ' + n : '');
  }
  function writeMsg(quiet) {
    if (!form) return;
    var m = msg(), p = new FormData(form).get('with') || 'any';
    preview.textContent = m;
    send.href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(m);
    sendLabel.textContent = he() ? (p === 'gili' ? 'שליחה לגילי בוואטסאפ' : p === 'miki' ? 'שליחה למיקי בוואטסאפ' : 'שליחה לגילי ומיקי בוואטסאפ')
      : (p === 'gili' ? 'Send to Gili on WhatsApp' : p === 'miki' ? 'Send to Miki on WhatsApp' : 'Send to Gili & Miki on WhatsApp');
    if (!quiet && !still()) { preview.classList.remove('write'); void preview.offsetWidth; preview.classList.add('write'); }
  }
  if (form) {
    buildDays();
    form.addEventListener('change', function () { writeMsg(false); });
    form.addEventListener('input', function (e) { if (e.target.name === 'name') writeMsg(true); });
  }

  // ---------------------------------------------------------------- the rating clock: five hours on the dial, the hand goes to 4.8
  var clock = $('[data-clock]');
  if (clock) {
    var g = $('.ck-nums', clock), ns = 'http://www.w3.org/2000/svg';
    for (var i = 0; i < 20; i++) {
      var a = i / 20 * Math.PI * 2, big = i % 4 === 0, r1 = big ? 70 : 74, ln = document.createElementNS(ns, 'line');
      ln.setAttribute('x1', 100 + Math.sin(a) * r1); ln.setAttribute('y1', 100 - Math.cos(a) * r1);
      ln.setAttribute('x2', 100 + Math.sin(a) * 80); ln.setAttribute('y2', 100 - Math.cos(a) * 80);
      if (!big) ln.setAttribute('opacity', '0.35');
      g.appendChild(ln);
    }
    for (var k = 1; k <= 5; k++) {
      var b = k / 5 * Math.PI * 2, t = document.createElementNS(ns, 'text');
      t.setAttribute('x', 100 + Math.sin(b) * 56); t.setAttribute('y', 100 - Math.cos(b) * 56 + 6); t.setAttribute('text-anchor', 'middle');
      t.textContent = k; g.appendChild(t);
    }
  }
  var hand = $('[data-hand]');
  function setHand(v, animate) {
    if (!hand) return;
    hand.style.transition = animate ? 'transform 1500ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
    hand.style.transform = 'rotate(' + (v * 345.6).toFixed(1) + 'deg)';
  }

  // ---------------------------------------------------------------- hero: the three spotlights switch on in turn, each lights its print and one word
  var spots = $$('.spot'), prints = [$('.p-sign'), $('.p-tall'), $('.p-wide')];
  function wordsFor() { return $$('[data-for] > span:not([hidden]) b').filter(function (b) { return b.offsetParent !== null; }); }
  var lightTimers = [];
  function lightAll(on) {
    var words = wordsFor();
    spots.forEach(function (s, i) { s.classList.toggle('on', on); prints[i] && prints[i].classList.toggle('lit', on); });
    $$('[data-for] b').forEach(function (b) { b.classList.toggle('lit', on); });
    void words;
  }
  function lightSequence() {
    lightTimers.forEach(clearTimeout); lightTimers = [];
    if (still()) { lightAll(true); return; }
    // order follows the reading direction: the print nearest the start of the line first
    [0, 1, 2].forEach(function (i) {
      lightTimers.push(setTimeout(function () {
        spots[i].classList.add('on'); prints[i].classList.add('lit');
        $$('[data-for] > span').forEach(function (sp) { var w = $$('b', sp)[i]; if (w) w.classList.add('lit'); });
      }, 260 + i * 520));
    });
  }
  function placeSpots() {
    // each spotlight hangs right above the middle of its print
    var hr = $('.hero').getBoundingClientRect();
    spots.forEach(function (s, i) {
      var r = prints[i].getBoundingClientRect();
      s.style.left = (r.left - hr.left + Math.min(r.width, hr.right - r.left) / 2 - 11).toFixed(0) + 'px';
      $('.cone', s).style.width = Math.max(160, Math.min(r.width, hr.right - r.left) * 1.25).toFixed(0) + 'px';
    });
  }

  // ---------------------------------------------------------------- the signature: the cape over "the work"
  var capeSec = $('[data-cape]'), cape = null;
  if (capeSec) {
    cape = document.createElement('div'); cape.className = 'cape'; cape.setAttribute('aria-hidden', 'true');
    cape.innerHTML = '<div class="cape-shadow"></div><div class="cape-cloth"><div class="cape-tex"></div><div class="cape-collar"><i></i><i></i><i></i></div>' +
      '<p class="cape-print"><span lang="he">גילי <em>ו</em>מיקי</span><span lang="en" translate="no">Gili <em>&amp;</em> Miki</span></p></div>';
    capeSec.appendChild(cape);
    cape._s = $('.cape-shadow', cape); cape._c = $('.cape-cloth', cape); cape._t = $('.cape-tex', cape); cape._k = '';
  }
  var smooth = function (t) { return t * t * (3 - 2 * t); };
  function capeAt(p) {
    if (!cape) return;
    var key = p.toFixed(4) + (rtl() ? 'r' : 'l');
    if (key === cape._k) return; cape._k = key;
    var q = clamp((p - 0.08) / 0.92, 0, 1), e = smooth(q);
    if (q >= 1) { cape.style.visibility = 'hidden'; return; }
    cape.style.visibility = '';
    var W = cape.clientWidth, H = cape.clientHeight, dir = rtl() ? -1 : 1, PI = Math.PI;
    var swing = Math.sin(PI * e), A = 0.06 * W * swing;
    // the free hem rises most near the corner that is pulled; a small wave runs along it
    function hemY(xn) { var lift = 0.55 * Math.pow(e, 1.4) * (0.25 + 0.75 * xn) + 0.03 * swing * Math.sin(2 * PI * (2.2 * xn - 2.6 * e)); return H * clamp(1 - lift, 0.04, 1); }
    // the trailing edge: the top leaves first, the bottom lags, a wave of cloth runs down it
    function edgeX(yn) { return W * (1.32 * e - 0.42 * yn * Math.sin(PI * Math.min(1, e * 1.1))) + A * Math.sin(2 * PI * (1.4 * yn - 1.8 * e)); }
    var pts = [], N = 18, X = function (x) { return dir > 0 ? x : W - x; };
    pts.push([X(edgeX(0)), 0], [X(W + 80), 0], [X(W + 80), hemY(1)]);
    var xb = edgeX(1), x0 = clamp(xb / W, -0.2, 1);
    for (var i = 0; i <= N; i++) { var xn = 1 - (1 - x0) * i / N; pts.push([X(xn * W), hemY(clamp(xn, 0, 1))]); }
    for (var j = N; j >= 0; j--) { var yn = j / N, x = edgeX(yn); pts.push([X(x), yn * hemY(clamp(x / W, 0, 1))]); }
    var poly = 'polygon(' + pts.map(function (pt) { return pt[0].toFixed(1) + 'px ' + pt[1].toFixed(1) + 'px'; }).join(',') + ')';
    var tx = dir * e * e * W * 0.08, ty = -e * e * H * 0.12, rot = -dir * e * 3;
    cape._c.style.clipPath = poly; cape._s.style.clipPath = poly;
    cape._c.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) rotate(' + rot.toFixed(2) + 'deg)';
    // the cast shadow falls toward the start side and down, away from the lamps (taste-skill-ignore: the moving cape casts it)
    cape._s.style.transform = 'translate3d(' + (tx - dir * 18).toFixed(1) + 'px,' + (ty + 24).toFixed(1) + 'px,0) rotate(' + rot.toFixed(2) + 'deg)';
    cape._s.style.opacity = Math.min(1, e * 6).toFixed(3);
    // the folds bunch up toward the hand pulling the cape
    cape._t.style.transformOrigin = dir > 0 ? '100% 0' : '0 0';
    cape._t.style.transform = 'translate3d(' + (dir * e * W * 0.06).toFixed(1) + 'px,0,0) scaleX(' + (1 - 0.2 * e).toFixed(3) + ')';
  }

  // ---------------------------------------------------------------- scroll-linked: the cape, the two chairs turning, a slow drift on the hero prints
  var chairsBox = $('[data-chairs]'), chairEls = $$('.chair', chairsBox || document);
  function tick() {
    if (still()) return;
    var vh = innerHeight;
    if (capeSec) {
      var r = capeSec.getBoundingClientRect();
      if (r.top < vh * 1.2 && r.bottom > -vh) capeAt(clamp((vh * 0.92 - r.top) / (vh * 0.74), 0, 1));
    }
    if (chairsBox) {
      var c = chairsBox.getBoundingClientRect();
      if (c.top < vh && c.bottom > 0) {
        var t = smooth(clamp((vh * 0.95 - c.top) / (vh * 0.6), 0, 1));
        // side-on at first (the backs turned toward each other), then both swivel round to face you
        chairEls.forEach(function (ch, i) {
          // the back and seat turn on the column; the chrome foot stays where it is
          ch.style.setProperty('--turn', ((i ? -1 : 1) * (0.18 + 0.82 * t)).toFixed(3));
        });
      }
    }
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); } }, { passive: true });
  function layout() { placeSpots(); if (cape) cape._k = ''; tick(); }
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 120); });

  // ---------------------------------------------------------------- entrances, staggered per section
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      if (en.target === clock) setHand(0.96, !still());
      io.unobserve(en.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' }) : null;
  $$('section').forEach(function (s) { $$('.rv', s).forEach(function (el, i) { el.style.setProperty('--rd', Math.min(i, 5) * 80 + 'ms'); }); });
  function arm() {
    if (still() || !io) { $$('.rv').forEach(function (el) { el.classList.add('in'); }); setHand(0.96, false); return; }
    $$('.rv:not(.in)').forEach(function (el) { io.observe(el); });
    if (clock && !clock.classList.contains('in')) setHand(0, false);
  }

  // ---------------------------------------------------------------- the motion switch
  var mt = $('[data-motion-toggle]');
  function setMotion(on, save) {
    root.classList.toggle('still', !on);
    mt.setAttribute('aria-checked', on ? 'true' : 'false');
    if (save) { store('gm-motion', on ? 'on' : 'off'); delete root.dataset.motionAuto; }
    if (!on) {
      lightAll(true);
      $$('.rv').forEach(function (el) { el.classList.add('in'); });
      chairEls.forEach(function (ch) { ch.style.removeProperty('--turn'); });
      setHand(0.96, false);
    } else { arm(); layout(); }
  }
  mt.addEventListener('click', function () { setMotion(still(), true); });
  mt.setAttribute('aria-checked', still() ? 'false' : 'true');

  // ---------------------------------------------------------------- the strap steps aside while typing a name (the keyboard is up)
  var strap = $('[data-strap]'), nameIn = form && form.querySelector('input[name="name"]');
  if (strap && nameIn) {
    nameIn.addEventListener('focus', function () { strap.classList.add('away'); });
    nameIn.addEventListener('blur', function () { strap.classList.remove('away'); });
  }

  applyLang();
  arm();
  placeSpots();
  lightSequence();
  tick();
  setInterval(renderHours, 60000);
  window.__gm = { capeAt: capeAt, tick: tick };
})();
