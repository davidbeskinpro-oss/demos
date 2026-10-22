(function () {
  var root = document.documentElement, WA = '972525329595';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var eio = function (t) { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: 'אדיב ידי זהב · חגי, הנדימן · שדרות מוריה 117א, חיפה', en: 'Adiv Golden Hands · Hagai, handyman · 117A Moriah Blvd, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור אדיב ידי זהב · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Adiv Yedei Zahav · This is not the business’s official website' };
  var STAR = '<svg viewBox="0 0 92 16" aria-hidden="true">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; }).join('') + '</svg>';
  $$('[data-stars]').forEach(function (s) { s.innerHTML = STAR; });

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-l-he]').forEach(function (i) { i.setAttribute('aria-label', i.dataset[l === 'he' ? 'lHe' : 'lEn']); });
    $$('[data-t-call]').forEach(function (a) { a.setAttribute('aria-label', l === 'he' ? 'להתקשר לחגי, 052-532-9595' : 'Call Hagai, 052-532-9595'); });
    $$('[data-t-wa]').forEach(function (a) { a.setAttribute('aria-label', l === 'he' ? 'וואטסאפ לחגי' : 'WhatsApp Hagai'); });
    $('[data-pill]').setAttribute('aria-label', l === 'he' ? 'ראשי' : 'Main');
    $('[data-tabs]').setAttribute('aria-label', l === 'he' ? 'ביקורות' : 'Reviews');
    $('.map iframe').title = l === 'he' ? 'Google Maps: שדרות מוריה 117א, חיפה' : 'Google Maps: 117A Moriah Blvd, Haifa';
    var ar = $('[data-area]'); ar.placeholder = ar.dataset[l === 'he' ? 'phHe' : 'phEn'];
    $$('[data-job] option').forEach(function (o) { o.textContent = o.dataset[l]; });
    $$('[data-stars]').forEach(function (s) { s.setAttribute('role', 'img'); s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('adiv-lang', l); } catch (e) {}
    texts(l); hours(); write(); baAll(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(), anchor = $('#fix'), keep = anchor.getBoundingClientRect().top;
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('adiv-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    resetDrawer(); layout();
    if (keep < innerHeight * 1.5) { var now = anchor.getBoundingClientRect().top; if (now !== keep) scrollBy(0, now - keep); }
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [7, 17], 1: [7, 17], 2: [7, 17], 3: [7, 17], 4: [7, 17], 5: [7, 17], 6: null };
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
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span><span>' + txt + '</span>'; });
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
  window.__H = H; window.__hours = hours;
  setInterval(status, 60000);

  // ---------------------------------------------------------------- the job note: what, where -> WhatsApp
  var T = {
    he: { hi: 'שלום חגי, הגעתי דרך האתר. ', job: { shutter: 'יש לי תריס שצריך תיקון.', plumb: 'יש לי נזילה או סתימה.', boiler: 'יש לי בעיה בדוד.', hang: 'צריך לתלות משהו בבית.', light: 'צריך להתקין גוף תאורה.', furn: 'צריך להרכיב רהיט.', screen: 'צריך רשת נגד יתושים או חבל כביסה.', grab: 'צריך להתקין ידית אחיזה.', other: 'יש לי עבודה קטנה בבית.' }, area: ' האזור: ', ask: ' אפשר לתאם?' },
    en: { hi: 'Hi Hagai, I found your website. ', job: { shutter: 'I have a shutter that needs fixing.', plumb: 'I have a leak or a blockage.', boiler: 'I have a problem with my water heater.', hang: 'I need something hung at home.', light: 'I need a light fitted.', furn: 'I need some furniture assembled.', screen: 'I need an insect screen or a washing line.', grab: 'I need a grab bar fitted.', other: 'I have a small job at home.' }, area: ' Area: ', ask: ' Could we set a time?' }
  };
  var job = $('[data-job]'), area = $('[data-area]'), send = $('[data-send]'), preview = $('[data-preview]');
  function message() {
    var t = T[he() ? 'he' : 'en'], a = (area.value || '').replace(/\s+/g, ' ').trim().slice(0, 40).replace(/[.!?]+$/, '');
    return t.hi + t.job[job.value] + (a ? t.area + a + '.' : '') + t.ask;
  }
  function write() {
    var m = message();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    preview.textContent = m;
    $$('[data-wa]').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(he() ? 'שלום חגי, הגעתי דרך האתר.' : 'Hi Hagai, I found your website.'); });
  }
  job.addEventListener('change', write); area.addEventListener('input', write);

  // ---------------------------------------------------------------- entrances, once, staggered inside each section
  $$('section, .board').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal], [data-level]').forEach(function (el) { io && !still() ? io.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- nav: where you are; the pill rises past the concept bar
  var pill = $('[data-pill]'), links = $$('.links a');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['jobs', 'fix', 'reviews', 'visit'].forEach(function (id) { var el = document.getElementById(id); if (el) nio.observe(el); });
  }

  // ---------------------------------------------------------------- knobs: on phones, once the page's own buttons are out of sight
  var knobs = $('[data-knobs]'), seen = new Set();
  if (knobs && 'IntersectionObserver' in window) {
    var kio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? seen.add(e.target) : seen.delete(e.target); }); knobs.classList.toggle('away', seen.size > 0); }, { threshold: 0 });
    $$('[data-keep-clear]').forEach(function (el) { kio.observe(el); });
  }

  // ---------------------------------------------------------------- reviews: three names, one quote
  var tabs = $$('[data-t]'), qs = $$('[data-q]');
  function showQ(i, focus) {
    tabs.forEach(function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); b.tabIndex = k === i ? 0 : -1; if (k === i && focus) b.focus(); });
    qs.forEach(function (q, k) { q.hidden = k !== i; q.classList.remove('swap'); if (k === i) { void q.offsetWidth; q.classList.add('swap'); } });
  }
  tabs.forEach(function (b, k) {
    b.addEventListener('click', function () { showQ(k); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowDown' || e.key === (he() ? 'ArrowLeft' : 'ArrowRight') ? 1 : e.key === 'ArrowUp' || e.key === (he() ? 'ArrowRight' : 'ArrowLeft') ? -1 : 0;
      if (d) { e.preventDefault(); showQ((k + d + tabs.length) % tabs.length, true); }
    });
  });
  tabs.forEach(function (b, k) { b.tabIndex = k === 0 ? 0 : -1; });

  // ---------------------------------------------------------------- BEFORE / AFTER: the brass rule
  // f = how much of the after photo is uncovered (0 = all before, 1 = all after). The rule sweeps in reading direction.
  // With motion on it is tied to the scroll (the valve to the drawer opening) until the visitor takes the rule by hand.
  var bas = $$('[data-ba]').map(function (el) { return { el: el, f: 0.5, hand: false, rng: $('.rng', el), valve: el.classList.contains('t-valve') }; });
  function baSet(b, f) {
    b.f = clamp(f, 0, 1);
    var x = he() ? (1 - b.f) * 100 : b.f * 100;
    b.el.style.setProperty('--x', x.toFixed(2) + '%');
    b.el.style.setProperty('--sh', (still() ? 0 : Math.min(1, 4 * b.f * (1 - b.f))).toFixed(3));
    b.rng.value = Math.round(b.f * 100);
  }
  function baAll(force) {
    bas.forEach(function (b) { b.el.dataset.side = he() ? '' : 'r'; if (force) baSet(b, b.f); });
  }
  bas.forEach(function (b) {
    var down = false, sx = 0, sy = 0, moved = false;
    function at(e) { var r = b.el.getBoundingClientRect(), pos = (e.clientX - r.left) / r.width; return he() ? 1 - pos : pos; }
    b.el.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      down = true; moved = false; sx = e.clientX; sy = e.clientY;
      if (e.pointerType === 'mouse') { b.hand = true; baSet(b, at(e)); b.el.setPointerCapture(e.pointerId); }
    });
    b.el.addEventListener('pointermove', function (e) {
      if (!down) return;
      if (!moved && e.pointerType !== 'mouse') {
        if (Math.abs(e.clientX - sx) < 6 || Math.abs(e.clientX - sx) < Math.abs(e.clientY - sy)) return;
        moved = true; try { b.el.setPointerCapture(e.pointerId); } catch (x) {}
      }
      b.hand = true; baSet(b, at(e));
    });
    var up = function () { down = false; };
    b.el.addEventListener('pointerup', up); b.el.addEventListener('pointercancel', up);
    b.rng.addEventListener('input', function () { b.hand = true; baSet(b, b.rng.value / 100); });
  });

  // ---------------------------------------------------------------- THE DRAWER
  // The front stands a finger's width open on arrival. Scrolling pulls the drawer: the front comes toward you and drops out
  // of the frame below, light grows over the compartments inside, and the board, until then sitting a little deeper in the
  // drawer, comes up to full size. While it opens, the valve in the first compartment turns from rust to new brass.
  // The board stays put on screen while the front moves (it is offset by exactly the scroll), so nothing behind it ever
  // shows except the walnut sides of the drawer. Back up, it all closes again. Only transform and opacity change.
  var cab = $('[data-cab]'), front = $('[data-front]'), board = $('[data-board]'), wood = null;
  var vh = 0, vw = 0, cTop = 0, L = 0, crack = 0, crackK = 0, lastKey = '';
  function resetDrawer() {
    [front, board].forEach(function (e) { e.style.transform = ''; e.style.opacity = ''; e.style.visibility = ''; e.style.display = ''; });
    board.style.removeProperty('--lit');
    lastKey = '';
  }
  function paint(y) {
    var p = clamp(y / L, 0, 1), e = eio(p);
    var fy = crack * crackK + (vh - crack * crackK + 30) * e;
    front.style.transform = 'translate3d(0,' + fy.toFixed(1) + 'px,0) scale(' + (1 + 0.07 * e).toFixed(4) + ')';
    front.style.visibility = p >= 1 ? 'hidden' : '';
    var T = Math.min(Math.max(y, 0), L) - L;
    board.style.transform = 'translate3d(0,' + T.toFixed(1) + 'px,0) scale(' + (0.94 + 0.06 * smooth(p / 0.9)).toFixed(4) + ')';
    board.style.opacity = (0.6 + 0.4 * smooth(p / 0.8)).toFixed(3);
    board.style.setProperty('--lit', smooth((p - 0.72) / 0.26).toFixed(3));
    var v = bas[0]; if (v && !v.hand) baSet(v, smooth((p - 0.42) / 0.5));
  }
  function baScroll() {
    bas.forEach(function (b, i) {
      if (b.hand || (i === 0 && !still())) return;
      if (still()) return;
      var r = b.el.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) return;
      baSet(b, smooth((vh * 0.9 - r.top) / (vh * 0.45 + r.height * 0.35)));
    });
  }
  // the name fits its brass card: shrink a long name to the width, and let it wrap only below a readable size
  function fitName() {
    var h1 = $('h1'), card = $('.card'), front = $('.front-in');
    h1.style.fontSize = ''; h1.style.whiteSpace = '';
    var cs = getComputedStyle(card), room = front.clientWidth - parseFloat(getComputedStyle(front).paddingLeft) * 2 - 44 - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var span = $$('span', h1).filter(function (x) { return x.offsetParent; })[0] || h1, need = span.scrollWidth || h1.scrollWidth;
    if (getComputedStyle(h1).whiteSpace === 'nowrap' && need > room) {
      var size = parseFloat(getComputedStyle(h1).fontSize), fit = Math.floor(size * room / need);
      if (fit >= 48) h1.style.fontSize = fit + 'px'; else { h1.style.fontSize = '48px'; h1.style.whiteSpace = 'normal'; }
    }
  }
  function layout() {
    fitName();
    vw = root.clientWidth; vh = innerHeight;
    cTop = cab.getBoundingClientRect().top + scrollY;
    L = Math.round(vh * 0.9);
    crack = clamp(vh * 0.19, 110, 250);
    lastKey = '';
    if (still()) { resetDrawer(); bas.forEach(function (b) { if (!b.hand) baSet(b, 0.5); }); }
    tick();
  }
  // the strip of his work drifts sideways with the page on wide screens; on phones it is swiped
  var strip = $('[data-strip]'), stripIn = $('[data-strip-in]');
  function tick() {
    var y = scrollY;
    pill.classList.toggle('up', y > 24);
    if (still()) return;
    var key = (y - cTop).toFixed(1) + '|' + crackK.toFixed(3);
    if (key !== lastKey) { lastKey = key; paint(y - cTop); }
    baScroll();
    {
      var r = strip.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        var t = clamp((vh - r.top) / (vh + r.height), 0, 1), over = Math.max(0, stripIn.scrollWidth - vw);
        stripIn.style.transform = 'translate3d(' + ((he() ? 1 : -1) * over * t).toFixed(1) + 'px,0,0)';
      }
    }
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); } }, { passive: true });
  var rT = 0, lastW = 0;
  addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { if (root.clientWidth !== lastW || Math.abs(innerHeight - vh) > 120) { lastW = root.clientWidth; layout(); } else { vh = innerHeight; tick(); } }, 120); });
  addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  // the drawer eases a finger's width open on arrival (a fresh visit at the top only)
  function openCrack() {
    if (still() || scrollY > 4) { crackK = 1; tick(); return; }
    var t0 = performance.now(), D = 1100;
    (function f(t) { var k = clamp((t - t0) / D, 0, 1); crackK = 1 - Math.pow(1 - k, 3); tick(); if (k < 1) requestAnimationFrame(f); })(t0);
  }

  texts(root.lang === 'en' ? 'en' : 'he');
  hours(); write(); baAll(true);
  lastW = root.clientWidth;
  layout();
  setTimeout(openCrack, 250);
  window.__drawer = { layout: layout, paint: paint, tick: tick, bas: bas };
})();
