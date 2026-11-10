(function () {
  var root = document.documentElement, WA = '972543989949';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine) root.classList.add('has-hover');
  var io = 'IntersectionObserver' in window;
  var TITLE = { he: 'קמילה דוכס · עיצוב שיער, איפור וציפורניים · קדיש לוז 11, קריית מוצקין', en: 'Kamila Ducas · Hair, makeup & nails · 11 Kadish Luz St, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור קמילה דוכס - מעצבת שיער ומאפרת · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Kamila Ducas, hair designer & makeup artist · This is not the business’s official website' };
  var MSG = {
    he: { def: 'היי קמילה, הגעתי מהאתר ואשמח לקבוע תור', smooth: 'היי קמילה, הגעתי מהאתר ואשמח לשמוע על החלקה', nails: 'היי קמילה, הגעתי מהאתר ואשמח לקבוע תור לציפורניים' },
    en: { def: 'Hi Kamila, I found you on the website and would like to book an appointment', smooth: 'Hi Kamila, I found you on the website and would like to hear about smoothing', nails: 'Hi Kamila, I found you on the website and would like to book a nail appointment' }
  };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'קמילה דוכס', 'Kamila Ducas');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לקמילה, 054-398-9949', 'Call Kamila, 054-398-9949');
    aria('[data-t-wa]', 'וואטסאפ לקמילה', 'WhatsApp Kamila');
    aria('[data-rail="-1"]', 'הקודם', 'Previous');
    aria('[data-rail="1"]', 'הבא', 'Next');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: קדיש לוז 11, קריית מוצקין' : 'Map: 11 Kadish Luz St, Kiryat Motzkin'; });
    $$('[data-wa]').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(MSG[l][a.dataset.waTopic || 'def']); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('kd-lang', l); } catch (e) {}
    texts(l); hours(); split(); bulbs.build(); onScroll();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('kd-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    glints.kick(); onScroll();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours + live status (Israel time). null = closed
  var H = { 0: [10, 18], 1: [10, 18], 2: [10, 18], 3: [10, 18], 4: [10, 18], 5: [10, 15], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
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
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- headline: letters arrive out of a blur
  function split() {
    $$('[data-split] .ln > span[lang]').forEach(function (sp) {
      if (!sp.dataset.raw) sp.dataset.raw = sp.textContent;
      var i = sp.closest('.ln').classList.contains('acc') ? 10 : 0;
      sp.innerHTML = sp.dataset.raw.split(' ').map(function (w) {
        return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
      sp.setAttribute('aria-label', sp.dataset.raw);
    });
  }

  // ---------------------------------------------------------------- reveals (staggered within each block)
  $$('section').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', i * 80 + 'ms'); }); });
  $$('[data-railbox],[data-bento]').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 6) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- glints: little triangles from her door and nail art, drifting up through the hero
  var hero = $('[data-hero]'), nav = $('[data-nav]');
  var glints = (function () {
    var cv = $('[data-glints]'), c = cv.getContext('2d'), w, h, ps = [], raf = 0, vis = true, mx = -999, my = -999;
    var cols = ['234,166,172', '60,182,168', '247,237,233', '217,169,141'];
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(clamp(w * h / 16000, 26, 90)); ps = [];
      for (var i = 0; i < n; i++) ps.push(mk(Math.random() * h));
      draw(0);
    }
    function mk(y) { return { x: Math.random() * w, y: y, s: 3 + Math.random() * 9, v: .15 + Math.random() * .45, r: Math.random() * 6.28, vr: (Math.random() - .5) * .02, c: cols[(Math.random() * 4) | 0], a: .15 + Math.random() * .5, ph: Math.random() * 6.28, tri: Math.random() < .7 }; }
    function draw(t) {
      c.clearRect(0, 0, w, h);
      ps.forEach(function (p) {
        var tw = .5 + .5 * Math.sin(t / 700 + p.ph);
        c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.globalAlpha = p.a * (.35 + .65 * tw);
        c.fillStyle = 'rgb(' + p.c + ')';
        if (p.tri) { c.beginPath(); c.moveTo(0, -p.s); c.lineTo(p.s * .87, p.s * .5); c.lineTo(-p.s * .87, p.s * .5); c.closePath(); c.fill(); }
        else { c.beginPath(); c.arc(0, 0, p.s * .28, 0, 6.28); c.fill(); c.globalAlpha *= .35; c.beginPath(); c.arc(0, 0, p.s * .9, 0, 6.28); c.fill(); }
        c.restore();
      });
    }
    function frame(t) {
      raf = 0; if (!vis || still()) { draw(0); return; }
      ps.forEach(function (p) {
        p.y -= p.v; p.r += p.vr; p.x += Math.sin(t / 2000 + p.ph) * .15;
        var dx = p.x - mx, dy = p.y - my, d = dx * dx + dy * dy;
        if (d < 14400) { var f = (14400 - d) / 14400 * 2.4; d = Math.sqrt(d) || 1; p.x += dx / d * f; p.y += dy / d * f; }
        if (p.y < -20) { var q = mk(h + 20); for (var k in q) p[k] = q[k]; }
      });
      draw(t); raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    if (io) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) kick(); }).observe(hero);
    addEventListener('resize', size); size(); kick();
    return { kick: kick };
  })();

  // hero photo: light and a slight drift follow the hand (desktop); the sheen drifts by itself on phones
  var media = $('[data-hero-media]'), pane = $('.pane', media), himg = $('.h-img', media), sheen = $('.sheen', media);
  if (fine) media.addEventListener('pointermove', function (e) {
    if (still()) return;
    var r = media.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    sheen.style.setProperty('--sx', (x * 100).toFixed(1) + '%'); sheen.style.setProperty('--sy', (y * 100).toFixed(1) + '%');
    himg.style.setProperty('--px', ((x - .5) * -14).toFixed(1) + 'px'); himg.style.setProperty('--py', ((y - .5) * -14).toFixed(1) + 'px');
  });

  // ---------------------------------------------------------------- the iron: scroll (or drag) the flat iron down the real before photo
  var ba = $('[data-ba]'), flat = $('[data-flat]'), range = $('[data-range]'), pctEl = $('[data-pct]'), bar = $('[data-bar]'), ironSec = $('[data-iron]');
  var P = 0, lastSteam = 0;
  function setP(p, fromScroll) {
    P = clamp(p, 0, 1);
    ba.style.setProperty('--p', P.toFixed(4));
    bar.style.setProperty('--p', P.toFixed(4));
    pctEl.textContent = Math.round(P * 100);
    if (!fromScroll || range.value != Math.round(P * 100)) range.value = Math.round(P * 100);
    flat.style.setProperty('--steam', P > .02 && P < .98 ? 1 : 0);
  }
  range.addEventListener('input', function () { setP(range.value / 100); });
  var dragging = false;
  flat.addEventListener('pointerdown', function (e) { dragging = true; flat.setPointerCapture(e.pointerId); e.preventDefault(); });
  flat.addEventListener('pointermove', function (e) { if (!dragging) return; var r = ba.getBoundingClientRect(); setP((e.clientY - r.top) / r.height); });
  flat.addEventListener('pointerup', function () { dragging = false; });
  flat.addEventListener('pointercancel', function () { dragging = false; });
  ba.addEventListener('click', function (e) { if (e.target === range || e.target.closest('[data-flat]')) return; var r = ba.getBoundingClientRect(); setP((e.clientY - r.top) / r.height); });

  // ---------------------------------------------------------------- the lit mirror: bulbs come on one by one as you arrive
  var mirror = $('[data-mirror]'), frameEl = $('[data-frame]');
  var bulbs = (function () {
    var box = $('[data-bulbs]'), list = [];
    function build() {
      var w = frameEl.clientWidth, h = frameEl.clientHeight, inset = w < 500 ? 12 : 17, gap = w < 500 ? 46 : 60;
      var nx = Math.max(3, Math.round((w - 2 * inset) / gap)), ny = Math.max(3, Math.round((h - 2 * inset) / gap)), pts = [], i;
      for (i = 0; i < nx; i++) pts.push([inset + (w - 2 * inset) * i / nx, inset]);
      for (i = 0; i < ny; i++) pts.push([w - inset, inset + (h - 2 * inset) * i / ny]);
      for (i = 0; i < nx; i++) pts.push([w - inset - (w - 2 * inset) * i / nx, h - inset]);
      for (i = 0; i < ny; i++) pts.push([inset, h - inset - (h - 2 * inset) * i / ny]);
      box.innerHTML = pts.map(function (p) { return '<i style="left:' + p[0].toFixed(1) + 'px;top:' + p[1].toFixed(1) + 'px"></i>'; }).join('');
      list = $$('i', box);
    }
    function light(f) { var n = Math.round(f * list.length); list.forEach(function (b, i) { b.classList.toggle('on', i < n); }); }
    return { build: build, light: light };
  })();
  var lamp = $('.lamp', mirror);
  if (fine) frameEl.addEventListener('pointermove', function (e) {
    var r = frameEl.getBoundingClientRect();
    lamp.style.setProperty('--lx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    lamp.style.setProperty('--ly', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  });

  // ---------------------------------------------------------------- nails bento: tiles lean toward the hand, spotlight follows
  if (fine) $$('.bento .tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) {
      if (still()) return;
      var r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      t.style.setProperty('--mx', x * 100 + '%'); t.style.setProperty('--my', y * 100 + '%');
      t.style.setProperty('--rx', ((x - .5) * 8).toFixed(2) + 'deg'); t.style.setProperty('--ry', ((.5 - y) * 8).toFixed(2) + 'deg');
      t.classList.add('lit');
    });
    t.addEventListener('pointerleave', function () { t.classList.remove('lit'); t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); });
  });

  // ---------------------------------------------------------------- services rail arrows
  var rail = $('[data-railbox]');
  $$('[data-rail]').forEach(function (b) { b.addEventListener('click', function () {
    var card = $('.sc', rail), step = card ? card.getBoundingClientRect().width + 18 : 300, dir = +b.dataset.rail * (he() ? -1 : 1);
    rail.scrollBy({ left: dir * step, behavior: still() ? 'auto' : 'smooth' });
  }); });

  // ---------------------------------------------------------------- reviews: 5.0 rolls in like an odometer; drifting track doubled for a seamless loop
  var track = $('.track'); track.innerHTML += track.innerHTML.replace(/<li class="rv"/g, '<li class="rv" aria-hidden="true"');
  var odo = $('[data-odo]');
  function roll() {
    var t0 = performance.now();
    (function step(t) { var k = clamp((t - t0) / 1400, 0, 1), e = 1 - Math.pow(1 - k, 3); odo.textContent = (5 * e).toFixed(1); if (k < 1) requestAnimationFrame(step); })(t0);
  }
  if (io && !still()) { odo.textContent = '0.0'; new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(); ob.disconnect(); } }, { threshold: .6 }).observe(odo); }

  // ---------------------------------------------------------------- scroll-linked: nav pill, hero band, iron, peony, mirror bulbs, door frame
  var band = $('[data-band]'), peony = $('[data-peony]'), door = $('[data-door]'), visit = $('[data-visit]'), dock = $('[data-dock]');
  var ticking = false;
  function prog(el, a, b) { var r = el.getBoundingClientRect(), vh = innerHeight; return clamp((vh * a - r.top) / (vh * (a - b) + r.height * 0 + 1e-6), 0, 1); }
  function onScroll() {
    ticking = false;
    var y = scrollY, vh = innerHeight, s = still();
    nav.classList.toggle('gathered', y > 40);
    dock.classList.toggle('show', y > vh * .7);
    band.style.setProperty('--t', s ? 1 : clamp(y / vh, 0, 1).toFixed(3));
    // iron: progress through the tall section (motion on) — off: the visitor drags
    if (!s) {
      var r = ironSec.getBoundingClientRect(), span = r.height - vh;
      if (span > 0 && !dragging) setP(clamp((-r.top - vh * .1) / (span * .8), 0, 1), true);
    }
    // the peony grows up behind the services title
    if (peony) peony.style.setProperty('--g', s ? 1 : prog(peony.parentNode, 1, .35).toFixed(3));
    // mirror bulbs light up as the mirror arrives
    bulbs.light(s ? 1 : prog(frameEl, .95, .45));
    mirror.style.setProperty('--lit', s ? 1 : prog(frameEl, .95, .45).toFixed(3));
    // the door photo starts wide and settles into its frame
    if (!s && innerWidth >= 900) {
      var vr = visit.getBoundingClientRect(), t = clamp((vh - (vr.top + door.offsetTop)) / (vh * .7), 0, 1), e = 1 - Math.pow(1 - t, 3);
      var dw = door.offsetWidth, full = Math.min(visit.clientWidth - 2 * parseFloat(getComputedStyle(visit).paddingLeft), 1400) / dw, sc = full + (1 - full) * e;
      var dx = (visit.clientWidth / 2 - (door.offsetLeft + dw / 2)) * (1 - e);
      door.style.transform = 'translateX(' + dx.toFixed(1) + 'px) scale(' + sc.toFixed(4) + ')';
      door.style.transformOrigin = 'center top';
    } else door.style.transform = '';
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', function () { bulbs.build(); onScroll(); });

  // ---------------------------------------------------------------- boot
  texts(root.lang); hours(); split(); bulbs.build(); setP(still() ? .5 : 0); onScroll();
  if (still()) setP(.5);
  requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('ready'); }); });
})();
