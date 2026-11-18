(function () {
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 821; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'הדס צור · עורכת דין ונוטריון · הנרקיסים 21, קריית ביאליק', en: 'Hadas Tzur · Lawyer & notary · 21 HaNarkisim St, Kiryat Bialik' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור הדס צור- עורכת דין ונוטריון · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Hadas Tzur, lawyer & notary · This is not the business’s official website' };

  // ---------------------------------------------------------------- the colour copy of the mosaic, seen through the beam
  var beam = $('[data-beam]'), mast = $('[data-mast]');
  var copy = $('[data-mosaic]').cloneNode(true);
  copy.removeAttribute('data-mosaic');
  // flat tiles keep their live content underneath: the copy only warms them
  $$('.t-navy,.t-sun,.t-stone', copy).forEach(function (e) { e.innerHTML = ''; });
  $$('img', copy).forEach(function (i) { i.alt = ''; });
  beam.appendChild(copy);

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'הדס צור, משרד עורכי דין', 'Hadas Tzur law office');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו להדס, 04-877-7097', 'Call Hadas, 04-877-7097');
    aria('[data-t-fields]', 'תחומים', 'Fields');
    aria('[data-t-prev]', 'השלב הקודם', 'Previous stage');
    aria('[data-t-next]', 'השלב הבא', 'Next stage');
    aria('[data-t-slot]', 'החליפו נושא', 'Change the topic');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: הנרקיסים 21, קריית ביאליק' : 'Map: 21 HaNarkisim St, Kiryat Bialik'; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('tz-lang', l); } catch (e) {}
    texts(l); status(); track(); slot(false); fit();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('tz-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-mask],[data-row]').forEach(function (el) { el.classList.add('in'); });
    sun.kick(); onScroll();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [8.5, 17], 1: [8.5, 17], 2: [8.5, 14], 3: [8.5, 17], 4: [8.5, 17], 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], shortEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    if (window.__now) return window.__now;
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: shortEn.indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = now(), l = he(), t = H[n.d], txt, open = false;
    if (t === undefined) t = null;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span><span>' + txt + '</span>'; });
    $$('[data-dot]').forEach(function (el) { el.classList.toggle('open', open); });
    dial(n);
  }
  // the dial in the navy tile: the sun's place between opening and closing today
  function dial(n) {
    var g = $('[data-dialticks]'), s = $('[data-dialsun]'), t = H[n.d];
    if (!g.childNodes.length) {
      for (var i = 0; i <= 12; i++) { var a = Math.PI - i / 12 * Math.PI, ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        ln.setAttribute('x1', 60 + Math.cos(a) * 46); ln.setAttribute('y1', 60 - Math.sin(a) * 46); ln.setAttribute('x2', 60 + Math.cos(a) * 52); ln.setAttribute('y2', 60 - Math.sin(a) * 52); g.appendChild(ln); }
    }
    var f = t ? clamp((n.h - t[0]) / (t[1] - t[0]), 0, 1) : 0, a2 = Math.PI - f * Math.PI;
    s.setAttribute('cx', (60 + Math.cos(a2) * 52).toFixed(1)); s.setAttribute('cy', (60 - Math.sin(a2) * 52).toFixed(1));
    s.style.opacity = t && n.h >= t[0] && n.h < t[1] ? 1 : .35;
    $$('line', g).forEach(function (ln, i) { ln.classList.toggle('on', !!t && i / 12 <= f); });
  }
  // the week as strips of daylight on a 7:00–19:00 scale
  function track() {
    var n = now(), l = he(), el = $('[data-track]'), A = 7, B = 19;
    el.innerHTML = [0, 1, 2, 3, 4, 5, 6].map(function (d) {
      var t = H[d], lit = '', mark = '';
      if (t) lit = '<span class="lit" style="left:' + ((t[0] - A) / (B - A) * 100) + '%;width:' + ((t[1] - t[0]) / (B - A) * 100) + '%;--d:' + d * 70 + 'ms"></span>';
      if (d === n.d && n.h >= A && n.h <= B) mark = '<span class="now" style="left:' + ((n.h - A) / (B - A) * 100) + '%"></span>';
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<li class="' + (d === n.d ? 'today' : '') + '"><span>' + (l ? shortHe : shortEn)[d] + '</span><span class="bar">' + lit + mark + '</span><span class="h num">' + val + '</span></li>';
    }).join('');
  }
  setInterval(function () { status(); track(); }, 60000);

  // ---------------------------------------------------------------- entrances
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  $$('[data-reveal],[data-row]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  $$('[data-mask]').forEach(function (el, i) { el.style.setProperty('--d', (200 + i * 160) + 'ms'); requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('in'); }); }); });

  // ---------------------------------------------------------------- the beam of sun across the mosaic
  var sun = (function () {
    var raf = 0, vis = true, x = 62, target = null, t0 = performance.now();
    function frame(t) {
      raf = 0;
      var auto = 50 + Math.sin((t - t0) / 3200) * 38;          // drifts across by itself (phones, idle hand)
      var want = target === null ? auto : target;
      x += (want - x) * .05;
      var sy = clamp(scrollY / (mast.offsetHeight || 1), 0, 1);
      beam.style.setProperty('--x', (x + sy * 22).toFixed(2) + '%');
      beam.style.setProperty('--sx', ((t - t0) / 90 % 100).toFixed(1) + 'px');
      if (vis && !still()) raf = requestAnimationFrame(frame);
    }
    mast.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = mast.getBoundingClientRect(); target = (e.clientX - r.left) / r.width * 100; });
    mast.addEventListener('pointerleave', function () { target = null; });
    watch(mast, function (v) { vis = v; kick(); });
    function kick() { if (still()) { beam.style.setProperty('--x', '58%'); beam.style.setProperty('--sx', '0px'); return; } if (!raf) raf = requestAnimationFrame(frame); }
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- odometer for the rating
  $$('[data-odo]').forEach(function (el) {
    var v = parseFloat(el.dataset.odo);
    watch(el, function (vis) {
      if (!vis || el.dataset.done || still()) return; el.dataset.done = 1;
      var t0 = performance.now();
      (function f(t) { var p = clamp((t - t0) / 1400, 0, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = (v * e).toFixed(1); if (p < 1) requestAnimationFrame(f); })(t0);
    });
  });

  // ---------------------------------------------------------------- portrait and card lean toward the hand
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) $$('[data-lean]').forEach(function (el) {
    el.addEventListener('pointermove', function (e) { if (still()) return; var r = el.getBoundingClientRect(); el.style.setProperty('--rx', (((e.clientX - r.left) / r.width - .5) * 14).toFixed(2) + 'deg'); el.style.setProperty('--ry', (-((e.clientY - r.top) / r.height - .5) * 14).toFixed(2) + 'deg'); });
    el.addEventListener('pointerleave', function () { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });

  // ---------------------------------------------------------------- notary: scroll picks the stage (motion on, wide screens); lines and arrows always work
  var desk = $('[data-desk]'), sts = $$('[data-st]'), stage = 0, manual = false;
  function setStage(s) {
    stage = clamp(s, 0, 3); desk.dataset.stage = stage;
    sts.forEach(function (b, i) { b.classList.toggle('on', i <= stage); b.setAttribute('aria-pressed', i === stage ? 'true' : 'false'); });
    $('[data-stepnum]').textContent = (stage + 1) + ' / 4';
  }
  sts.forEach(function (b, i) { b.addEventListener('click', function () { manual = true; setStage(i); }); });
  $$('[data-step]').forEach(function (b) { b.addEventListener('click', function () { manual = true; setStage(stage + (+b.dataset.step)); }); });
  setStage(0);
  // phones: the paper sits above the lines, so it plays its four stages once when it comes into view
  var played = false;
  watch(desk, function (v) {
    if (!v || played || manual || still() || !phone()) return; played = true;
    [1, 2, 3].forEach(function (s, i) { setTimeout(function () { if (!manual) setStage(s); }, 900 + i * 1500); });
  }, { threshold: .6 });
  function notaryScroll() {
    if (still() || manual || phone()) return;
    var mid = innerHeight * .55, k = 0;
    sts.forEach(function (b, i) { if (b.getBoundingClientRect().top < mid) k = i; });
    if (k !== stage) setStage(k);
  }

  // ---------------------------------------------------------------- the note before the call: tap the topic to change it
  var TOP = {
    he: ['הסכם ממון', 'גירושין', 'ירושה וצוואה', 'גישור בתוך המשפחה', 'הליך פונדקאות', 'קניית דירה', 'מכירת דירה', 'שירותי נוטריון'],
    en: ['a prenuptial agreement', 'a divorce', 'an inheritance or a will', 'family mediation', 'a surrogacy process', 'buying a flat', 'selling a flat', 'notary services']
  };
  var ti = 0, sw = $('[data-slotword]');
  function slot(anim) {
    var w = TOP[root.lang][ti];
    if (!anim || still()) { sw.textContent = w; return; }
    sw.className = 'sw out';
    setTimeout(function () { sw.textContent = w; sw.className = 'sw inn'; }, 200);
  }
  $('[data-slot]').addEventListener('click', function () { ti = (ti + 1) % TOP.he.length; slot(true); });
  $('[data-copy]').addEventListener('click', function () {
    var txt = (he() ? 'שלום הדס, אשמח לקבוע פגישה בנושא ' : 'Hello Hadas, I’d like to book a meeting about ') + TOP[root.lang][ti] + '.';
    var lab = $('[data-copylabel]'), old = lab.innerHTML;
    var done = function () { lab.textContent = he() ? 'הועתק' : 'Copied'; setTimeout(function () { lab.innerHTML = old; }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, function () {}); else done();
  });

  // ---------------------------------------------------------------- footer number fits its width
  var ph = $('[data-fit]');
  function fit() {
    ph.style.fontSize = '';
    var w = ph.parentNode.clientWidth - parseFloat(getComputedStyle(ph.parentNode).paddingLeft) * 2;
    var s = parseFloat(getComputedStyle(ph).fontSize);
    if (ph.scrollWidth > w) ph.style.fontSize = Math.floor(s * w / ph.scrollWidth) + 'px';
  }

  // ---------------------------------------------------------------- scroll: nav pill, axis fill, sticky plate, sunset
  var nav = $('[data-nav]'), axisFill = $('[data-axisfill]'), plate = $('.plate-call'), hero = $('[data-hero]'), foot = $('.foot'), hz = $('.horizon');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = scrollY;
    nav.classList.toggle('pill', y > 40);
    var hr = hero.getBoundingClientRect();
    axisFill.style.setProperty('--p', still() ? 1 : clamp((innerHeight - hr.top - mast.offsetHeight) / (hr.height - mast.offsetHeight + 1), .15, 1).toFixed(3));
    plate.classList.toggle('show', hr.bottom < innerHeight * .6);
    var fr = foot.getBoundingClientRect(), fp = clamp(1 - (fr.top + fr.height * .2) / innerHeight, 0, 1);
    hz.style.setProperty('--hy', (still() ? 0 : (1 - fp) * 30) + '%'); hz.style.setProperty('--ho', still() ? 1 : (.4 + fp * .6).toFixed(2));
    notaryScroll();
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', function () { fit(); onScroll(); });

  texts(root.lang); status(); track(); slot(false); sun.kick(); onScroll();
  if (document.fonts) document.fonts.ready.then(fit); else fit();
})();
