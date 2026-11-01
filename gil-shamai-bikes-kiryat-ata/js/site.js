(function () {
  var root = document.documentElement, WA = '972586210078';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'גיל שמאי · מכירה ומכונאות אופניים · מרדכי הגטאות 12, קריית אתא', en: 'Gil Shamai · Bicycle sales & mechanics · 12 Mordei HaGeta’ot St, Kiryat Ata' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור גיל שמאי – מכירת ומכונאות אופניים · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Gil Shamai – Bicycle Sales & Mechanics · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-ph-he]').forEach(function (i) { i.placeholder = i.dataset[l === 'he' ? 'phHe' : 'phEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'גיל שמאי', 'Gil Shamai');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-call]', 'התקשרו לגיל, 058-621-0078', 'Call Gil, 058-621-0078');
    aria('[data-t-wa]', 'וואטסאפ לגיל', 'WhatsApp Gil');
    aria('[data-t-rail]', 'ביקורות', 'Reviews');
    $('[data-t-map]').title = l === 'he' ? 'מפה: מרדכי הגטאות 12, קריית אתא' : 'Map: 12 Mordei HaGeta’ot St, Kiryat Ata';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('gil-lang', l); } catch (e) {}
    texts(l); hours(); status(); split(); labels(true); write(true); gearUI();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('gil-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-word]').forEach(function (el) { el.classList.add('in'); });
    labels(true); write(true); odoAll(); frame();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [8, 18], 1: [8, 18], 2: [8, 18], 3: [8, 18], 4: [8, 18], 5: [8, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t === 'all') { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t === 'all' ? (l ? '24 שעות' : '24 hours') : t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
  }
  hours(); status(); setInterval(status, 60000);

  // ---------------------------------------------------------------- letters: the name and the footer wordmark arrive letter by letter
  function split() {
    $$('[data-letters] > span, [data-word] > span').forEach(function (s) {
      var t = s.dataset.txt || s.textContent; s.dataset.txt = t;
      s.innerHTML = t.split('').map(function (c, i) { return c === ' ' ? ' ' : '<span class="ch" style="--i:' + i + '">' + c + '</span>'; }).join('');
    });
  }
  split();

  // ---------------------------------------------------------------- reveals
  $$('[data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 90 + 'ms'); });
  $$('[data-reveal],[data-tile],[data-word]').forEach(function (el) {
    if (!io) { el.classList.add('in'); return; }
    var ob = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { el.classList.add('in'); ob.disconnect(); } }, { rootMargin: '0px 0px -8% 0px' });
    ob.observe(el);
  });

  // ---------------------------------------------------------------- hero: the ring turns toward the hand, the photo inside shifts
  var tilt = $('[data-tilt]'), hero = $('[data-hero]');
  if (fine) hero.addEventListener('pointermove', function (e) {
    if (still()) return;
    var x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    tilt.style.setProperty('--ty', (x * 14).toFixed(2) + 'deg'); tilt.style.setProperty('--tx', (-y * 10).toFixed(2) + 'deg');
    tilt.style.setProperty('--wx', (-x * 30).toFixed(1) + 'px'); tilt.style.setProperty('--wy', (-y * 24).toFixed(1) + 'px');
  });

  // ---------------------------------------------------------------- the stand: three of his photos, labels decode onto the parts
  var LAB = [
    [[.31, .42, 'פריוויל', 'Freehub body'], [.73, .17, 'חישורים', 'Spokes'], [.5, .68, 'צמיג', 'Tyre'], [.2, .82, 'סמרטוט ושומן', 'Rag and grease']],
    [[.62, .28, 'מזלג FOX', 'FOX fork'], [.19, .5, 'בולם אחורי', 'Rear shock'], [.8, .5, 'רגלי המזלג', 'Stanchions']],
    [[.24, .36, 'מעמד התיקון', 'Repair stand'], [.12, .12, 'השלט של גיל', 'Gil’s sign'], [.7, .27, 'קסדות', 'Helmets'], [.76, .8, 'אופניים חדשים', 'New bikes']]
  ];
  var tab = 0, labBox = $('[data-labels]'), photos = $$('[data-stand-photo] .sp'), tabs = $$('[data-tab]'), touched = false;
  var GLYPH = 'אבגדהוזחטיכלמנסעפצקרשתABCDEFGHKMNRSTXZ0123456789';
  function decode(el, txt) {
    if (still()) { el.textContent = txt; return; }
    var n = 0, steps = 14;
    (function tick() {
      n++; el.textContent = txt.split('').map(function (c, i) { return c === ' ' || i < (n / steps) * txt.length ? c : GLYPH[(Math.random() * GLYPH.length) | 0]; }).join('');
      if (n < steps) setTimeout(tick, 40); else el.textContent = txt;
    })();
  }
  function labels() {
    var l = he() ? 2 : 3;
    labBox.innerHTML = '';
    LAB[tab].forEach(function (a, i) {
      var d = document.createElement('div'); d.className = 'lab' + (a[0] > .55 ? ' flip' : '');
      d.style.setProperty('--x', a[0] * 100 + '%'); d.style.setProperty('--y', a[1] * 100 + '%'); d.style.setProperty('--dl', 300 + i * 160 + 'ms');
      d.innerHTML = '<i></i><span></span>'; labBox.appendChild(d);
      setTimeout(function () { decode(d.querySelector('span'), a[l]); }, still() ? 0 : 300 + i * 160);
    });
  }
  function show(i) {
    tab = i;
    photos.forEach(function (p, k) { p.classList.toggle('on', k === i); });
    tabs.forEach(function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    labels();
  }
  tabs.forEach(function (b, k) { b.addEventListener('click', function () { touched = true; show(k); }); });
  labels();
  var standOn = false; watch($('#stand'), function (v) { standOn = v; }, { threshold: .35 });
  setInterval(function () { if (standOn && !touched && !still() && !document.hidden) show((tab + 1) % 3); }, 5200);

  // ---------------------------------------------------------------- the tread: a wheel of photos rolling with the scroll and a drag
  var wheel = $('[data-wheel]'), wwrap = $('[data-wheelwrap]'), drag = 0, dragging = null;
  wwrap.addEventListener('pointerdown', function (e) { if (still()) return; dragging = { x: e.clientX, y: e.clientY, d: drag }; });
  addEventListener('pointermove', function (e) { if (!dragging) return; drag = dragging.d + (e.clientX - dragging.x) * .35 * (he() ? -1 : 1) - (e.clientY - dragging.y) * .15; frame(); });
  addEventListener('pointerup', function () { dragging = null; });
  addEventListener('pointercancel', function () { dragging = null; });

  // ---------------------------------------------------------------- bento: spotlight under the hand
  $$('[data-tile]').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', e.clientX - r.left + 'px'); t.style.setProperty('--my', e.clientY - r.top + 'px'); t.style.setProperty('--spot', 1); });
    t.addEventListener('pointerleave', function () { t.style.setProperty('--spot', 0); });
  });

  // ---------------------------------------------------------------- the tag: ticked boxes write the WhatsApp message
  var NEED = [['טיפול או תיקון', 'a service or repair'], ['טיפול בבולמים', 'suspension service'], ['פנצ\'ר או צמיג', 'a flat or tyre'], ['אופניים חדשים', 'a new bike'], ['אופניים לילד', 'a bike for a child'], ['אופני יד או ציוד מותאם', 'a hand-cycle or adaptive gear']];
  var form = $('[data-tag]'), msgEl = $('[data-msg]'), send = $('[data-send]'), typer = null, shown = '';
  function message() {
    var l = he(), picked = $$('input[type=checkbox]', form).filter(function (c) { return c.checked; }).map(function (c) { return NEED[+c.value][l ? 0 : 1]; });
    var note = $('[data-note]').value.trim(), name = $('[data-name]').value.trim(), m;
    if (l) {
      m = 'היי גיל, הגעתי דרך האתר.';
      if (picked.length) m += '\nרציתי לשאול לגבי: ' + picked.join(', ') + '.';
      if (note) m += '\nעל האופניים: ' + note;
      if (name) m += '\n' + name;
    } else {
      m = 'Hi Gil, I found you through the website.';
      if (picked.length) m += '\nI’d like to ask about: ' + picked.join(', ') + '.';
      if (note) m += '\nAbout the bike: ' + note;
      if (name) m += '\n' + name;
    }
    return m;
  }
  function write(instant) {
    var m = message();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    clearTimeout(typer);
    if (instant || still()) { msgEl.textContent = m; msgEl.classList.remove('typing'); shown = m; return; }
    var keep = 0; while (keep < shown.length && shown[keep] === m[keep]) keep++;
    var i = keep; msgEl.classList.add('typing');
    (function t() { msgEl.textContent = m.slice(0, i); if (i++ < m.length) typer = setTimeout(t, 16); else { msgEl.classList.remove('typing'); shown = m; } })();
  }
  form.addEventListener('input', function () { write(false); });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  write(true);
  var typedOnce = false;
  watch(form, function (v) { if (v && !typedOnce && !still()) { typedOnce = true; shown = ''; write(false); } }, { threshold: .4 });

  // ---------------------------------------------------------------- odometers
  function odo(el, go) {
    var t = el.dataset.odo;
    if (!el.dataset.built) {
      el.dataset.built = 1;
      el.innerHTML = t.split('').map(function (c) { return /\d/.test(c) ? '<span class="col" aria-hidden="true" data-to="' + c + '">' + '0123456789'.split('').map(function (d) { return '<span data-d="' + d + '"></span>'; }).join('') + '</span>' : '<span aria-hidden="true" data-d="' + c + '"></span>'; }).join('') + '<span class="sr">' + t + '</span>';
    }
    $$('.col', el).forEach(function (c, i) { c.style.transitionDelay = i * 120 + 'ms'; c.style.transform = 'translateY(' + (go ? -1.08 * c.dataset.to : 0) + 'em)'; });
  }
  function odoAll() { $$('[data-odo]').forEach(function (el) { odo(el, true); }); }
  $$('[data-odo]').forEach(function (el) {
    if (still() || !io) { odo(el, true); return; }
    odo(el, false);
    var ob = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { requestAnimationFrame(function () { odo(el, true); }); ob.disconnect(); } }, { threshold: .6 });
    ob.observe(el);
  });

  // ---------------------------------------------------------------- reviews rail: drifts by itself until touched
  var rail = $('[data-rail]'), railTouched = 0, railOn = false;
  ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(function (ev) { rail.addEventListener(ev, function () { railTouched = Date.now(); }, { passive: true }); });
  watch(rail, function (v) { railOn = v; });
  var driftDir = 1;
  setInterval(function () {
    if (!railOn || still() || Date.now() - railTouched < 4000 || document.hidden) return;
    var max = rail.scrollWidth - rail.clientWidth, pos = Math.abs(rail.scrollLeft);
    if (pos >= max - 2) driftDir = -1; else if (pos <= 1) driftDir = 1;
    rail.scrollLeft += (he() ? -1 : 1) * driftDir;
  }, 24);

  // ---------------------------------------------------------------- footer spokes
  var spk = $('[data-spk]'), s = '';
  for (var k = 0; k < 36; k++) { var a = k / 36 * Math.PI * 2; s += '<line x1="800" y1="1500" x2="' + (800 + 1262 * Math.cos(a)).toFixed(0) + '" y2="' + (1500 + 1262 * Math.sin(a)).toFixed(0) + '"/>'; }
  spk.innerHTML = s;

  // ---------------------------------------------------------------- nav pill + gear indicator
  var nav = $('[data-nav]'), gearsEl = $$('[data-gears] i'), jockey = $('[data-jockey]'), secs = $$('[data-gear]'), links = $$('.links a'), gear = -1;
  function gearUI() {
    gearsEl.forEach(function (g, i) { g.classList.toggle('on', i === gear); });
    var i = Math.max(gear, 0), w = 7; jockey.style.setProperty('--jx', (he() ? -1 : 1) * i * w + 'px');
    links.forEach(function (a) { a.classList.toggle('on', gear >= 0 && a.getAttribute('href') === '#' + (secs[gear] && secs[gear].id)); });
  }

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var t0 = performance.now(), ring = $('[data-ring]'), chain1 = $('[data-chain="1"]'), chain2 = $('[data-chain="2"]');
  var tread = $('.tread'), vphoto = $('[data-vphoto]'), visit = $('[data-visit]'), steps = $$('[data-step]'), stepsBox = $('[data-steps]'), foot = $('.foot'), rim = $('.rim');
  function prog(el, a, b) { var r = el.getBoundingClientRect(), vh = innerHeight; return clamp((vh * a - r.top) / (r.height + vh * (a - b)), 0, 1); }
  function frame() {
    var y = scrollY, vh = innerHeight, st = still(), t = (performance.now() - t0) / 1000;
    nav.classList.toggle('pill', y > 40);
    // ring: turns with the scroll, and slowly by itself
    ring.style.setProperty('--rot', (st ? 0 : (y * .12 + t * 4) % 360).toFixed(2) + 'deg');
    // chain: moves the way the page goes (a link pitch is 24px, the pattern repeats every 48px)
    var c = st ? 0 : -((y * .8 + t * 18) % 48);
    chain1.style.setProperty('--cx', (he() ? -c : c).toFixed(1) + 'px');
    var rc = st ? 0 : -(Math.abs(rail.scrollLeft) % 48);
    chain2.style.setProperty('--cx', (he() ? -rc : rc).toFixed(1) + 'px');
    // tread: the wheel rolls with the scroll through the section
    var tp = prog(tread, 1, 0);
    wheel.style.setProperty('--wr', (st ? 0 : (tp * -270 + drag)).toFixed(2) + 'deg');
    // steps light up in turn
    var sp = prog(stepsBox, .85, .35), on = st ? -1 : Math.min(steps.length - 1, Math.floor(sp * steps.length));
    steps.forEach(function (li, i) { li.classList.toggle('on', i === on); });
    // the shop front opens wide and shrinks into its frame
    var vp = clamp((innerHeight - visit.getBoundingClientRect().top) / (innerHeight * .8), 0, 1), w = vphoto.offsetWidth || 1, big = Math.max(1, Math.min(innerWidth / w, 2.4));
    vphoto.style.setProperty('--vs', st ? 1 : (1 + (big - 1) * (1 - vp) * (1 - vp)).toFixed(4));
    // footer: the rim rises and its spokes turn
    var fr = foot.getBoundingClientRect(), fp = clamp((vh - fr.top) / fr.height, 0, 1);
    rim.style.setProperty('--ry', (st ? 0 : (1 - fp) * 40).toFixed(1) + '%');
    rim.style.setProperty('--sr', (st ? 0 : y * .03).toFixed(2) + 'deg');
    // which gear: the section crossing the middle of the screen
    var g = -1; secs.forEach(function (s, i) { var r = s.getBoundingClientRect(); if (r.top < vh * .5 && r.bottom > vh * .5) g = i; });
    if (g !== gear) { gear = g; gearUI(); }
  }
  (function loop() { if (!document.hidden && (!still() || dragging)) frame(); requestAnimationFrame(loop); })();
  addEventListener('scroll', function () { if (still()) frame(); }, { passive: true });
  addEventListener('resize', frame);
  rail.addEventListener('scroll', function () { if (still()) frame(); }, { passive: true });
  texts(root.lang); frame(); gearUI();
})();
