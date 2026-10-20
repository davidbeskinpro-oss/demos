(function () {
  var root = document.documentElement, WA = '972537777942';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: 'MT Beauty · מושיקו טל · בישום וטיפוח · צבעוני 11 א, חיפה', en: 'MT Beauty · Moshiko Tal · Perfume & grooming · 11A Tzivoni St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור MT Beauty · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for MT Beauty · This is not the business’s official website' };
  var STAR = '<svg viewBox="0 0 92 16" aria-hidden="true">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; }).join('') + '</svg>';
  $$('[data-stars]').forEach(function (s) { s.innerHTML = STAR; });

  // ---------------------------------------------------------------- language
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    try { localStorage.setItem('mt-lang', l); } catch (e) {}
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { var el = $(sel); if (el) el.setAttribute('aria-label', l === 'he' ? h : e); };
    aria('[data-pill]', 'ראשי', 'Main');
    aria('[data-cap]', 'וואטסאפ למושיקו', 'WhatsApp Moshiko');
    aria('[data-bottle]', 'התקשרו למושיקו, 053-777-7942', 'Call Moshiko, 053-777-7942');
    hours(); write(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('mt-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI(); write();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    secs.forEach(function (s) { s._k = null; });
    if (on) heroSpray(true); else mistAll();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed that day
  var H = { 0: [9, 18], 1: [9, 18], 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 14], 6: null };
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
    var b = $('[data-bottle]'); if (b) b.classList.toggle('open', open);   // the bottle's liquid glows a little while the shop is open
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // consecutive days with the same hours share a row
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var two = r[1] - r[0] === 1;
      var label = r[0] === r[1] ? names[r[0]] : names[r[0]] + (two ? (l ? ' ו' : ' and ') : (l ? '–' : '–')) + names[r[1]];
      var time = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + label + '</td><td>' + time + '</td></tr>';
    }).join('');
    status();
  }
  window.__status = status; window.__H = H; window.__hours = hours;
  setInterval(status, 60000);

  // ---------------------------------------------------------------- the message: lift a vial, the flacon fills with its colour, the label writes itself
  var T = {
    he: { fam: { fresh: 'בושם רענן', woody: 'בושם עצי', sweet: 'בושם מתוק', floral: 'בושם פרחוני' },
          hi: 'היי מושיקו, הגעתי דרך האתר. ', p: 'אשמח להמלצה על ', pd: '. משהו בסגנון: ', pe: '. אפשר לאסוף בצבעוני או לקבל במשלוח?',
          cut: 'אשמח לקבוע תספורת', beard: 'אשמח לקבוע עיצוב זקן', cd: '. נוח לי: ', ce: '. מתי יש מקום?',
          lp: 'בסגנון של איזה ריח? (לא חובה)', php: 'למשל: משהו קליל ליום…', lc: 'מתי נוח לכם? (לא חובה)', phc: 'למשל: שלישי אחר הצהריים…' },
    en: { fam: { fresh: 'a fresh scent', woody: 'a woody scent', sweet: 'a sweet scent', floral: 'a floral scent' },
          hi: 'Hi Moshiko, I found you through your website. ', p: 'I’d love a recommendation for ', pd: '. Something like: ', pe: '. Can I pick it up on Tzivoni St or get it delivered?',
          cut: 'I’d like to book a haircut', beard: 'I’d like to book a beard styling', cd: '. A good time for me: ', ce: '. When do you have a slot?',
          lp: 'In the style of which scent? (optional)', php: 'E.g. something light for the day…', lc: 'When suits you? (optional)', phc: 'E.g. Tuesday afternoon…' }
  };
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]'), detail = $('[name=detail]'), dlab = $('[data-detail-label]'), flacon = $('.flacon');
  function write() {
    var t = T[root.lang] || T.he, need = new FormData(form).get('need') || 'fresh', det = (detail.value || '').trim().slice(0, 80);
    var perfume = !!t.fam[need], m;
    if (perfume) m = t.hi + t.p + t.fam[need] + (det ? t.pd + det : '') + t.pe;
    else m = t.hi + t[need] + (det ? t.cd + det : '') + t.ce;
    dlab.textContent = perfume ? t.lp : t.lc;
    detail.placeholder = perfume ? t.php : t.phc;
    var v = form.querySelector('input[name=need]:checked'); if (v) flacon.style.setProperty('--liq', getComputedStyle(v.closest('.vial')).getPropertyValue('--c').trim());
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    type(m);
  }
  var typeT = 0, lastM = '';
  function type(m) {
    clearInterval(typeT);
    if (still() || m.indexOf(lastM) === 0 && lastM && m.length - lastM.length < 3) { preview.textContent = m; lastM = m; return; }
    lastM = m;
    var i = 0, caret = '<span class="caret"></span>';
    preview.innerHTML = caret;
    typeT = setInterval(function () {
      i = Math.min(m.length, i + 2);
      preview.textContent = m.slice(0, i);
      if (i < m.length) preview.insertAdjacentHTML('beforeend', caret); else clearInterval(typeT);
    }, 18);
  }
  form.addEventListener('change', write);
  detail.addEventListener('input', write);

  // ---------------------------------------------------------------- entrances, once, staggered inside each section
  $$('section, header').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { io && !still() ? io.observe(el) : el.classList.add('in'); });

  var notes = $('[data-notes]');
  if (notes && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { notes.classList.toggle('off', !e.isIntersecting); }); }).observe(notes);

  // ---------------------------------------------------------------- nav: where you are, and the pill rises past the concept bar
  var pill = $('[data-pill]'), links = $$('.links a');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['scents', 'chair', 'reviews', 'order', 'visit'].forEach(function (id) { var el = document.getElementById(id); if (el) nio.observe(el); });
  }

  // ---------------------------------------------------------------- THE ATOMISER
  // The bottle in the corner never moves. Every section is sprayed in as its top edge rises past the nozzle,
  // all of it tied to the scroll, both ways:
  //   the pump goes down and comes back up; droplets leave the nozzle fast in a narrow cone, slow down in the air
  //   (drag), the fine ones lift and evaporate, the heavier ones sink; behind them the mist spreads like a cloud
  //   (its size grows with the square root of time, so it thins as it spreads) and drifts up, carrying the section's
  //   own colour, which settles into the ground as the cloud clears. Each spray also lowers the liquid in the bottle.
  // Scroll back up and everything runs backwards into the nozzle, so the next pass plays it again.
  // Only transform and opacity are written, only for the sections near the screen.
  var bottle = $('[data-bottle]'), act = $('[data-act]'), liq = $('[data-liq]');
  var Q0 = 0.14, W = 0.1, FLY = 0.34, CLOUD = 0.62, ND = 34, NC = 10;
  var noz = { x: 0, y: 0 }, dir = 1, L = 300, vw = 0, vh = 0;
  function rng(seed) { return function () { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; }; }
  var secs = $$('.sec[data-mist]');
  secs.forEach(function (s, si) {
    var r = rng(97 + si * 131);
    if (!s.classList.contains('hero')) { var t = document.createElement('div'); t.className = 'tint'; t.setAttribute('aria-hidden', 'true'); s.insertBefore(t, s.firstChild); s._tint = t; }
    var m = document.createElement('div'); m.className = 'mist'; m.setAttribute('aria-hidden', 'true'); m.style.setProperty('--mc', s.dataset.mist);
    s._d = []; s._c = [];
    for (var i = 0; i < ND; i++) {
      var d = document.createElement('i'); m.appendChild(d);
      s._d.push({ el: d, e: Math.pow(r(), 0.8), sp: 0.5 + r() * 0.7, ang: -0.22 + r() * 0.32, sz: 1.4 + r() * 2.6, dr: r() * 2 - 1, life: 0.55 + r() * 0.45, on: false });
    }
    var F = [0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84, 0.96, 0.42, 0.7];
    for (var j = 0; j < NC; j++) {
      var c = document.createElement('b'); m.appendChild(c);
      s._c.push({ el: c, f: F[j], oy: (r() * 2 - 1) * 40 - (j >= 8 ? 80 : 0), k: 0.45 + r() * 0.55 + F[j] * 0.35, rise: 60 + r() * 90, sx: 1.15 + r() * 0.4, on: false });
    }
    s.insertBefore(m, s.firstChild); s._m = m; s._k = null; s._q = s.classList.contains('hero') ? -1 : 0;
  });
  var hero = secs[0];

  function layout() {
    vw = innerWidth; vh = innerHeight;
    var r = bottle.getBoundingClientRect(), rtl = root.dir === 'rtl';
    dir = rtl ? 1 : -1;
    noz.x = r.left + (rtl ? 0.635 : 0.365) * r.width;
    noz.y = r.top + (45 / 200) * r.height;
    L = clamp(vw * 0.72, 240, 760);
    secs.forEach(function (s) { s._k = null; });
    tick();
  }
  var ease3 = function (t) { return 1 - Math.pow(1 - t, 3); };
  var smooth = function (a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  function originY(s, qe) { return s === hero ? noz.y - s._top0 : noz.y - vh * (1 - qe); }
  function paint(s, q) {
    var hide = function (o) { if (o.on) { o.el.style.opacity = 0; o.on = false; } };
    s._d.forEach(function (p) {
      var qe = Q0 + p.e * W, tau = (q - qe) / FLY;
      if (tau <= 0 || tau >= 1) return hide(p);
      var s0 = p.sp * L * (1 - Math.exp(-4.2 * tau)) / (1 - Math.exp(-4.2));
      var vx = Math.cos(p.ang), vy = Math.sin(p.ang);
      var x = noz.x + dir * s0 * vx;
      var y = originY(s, qe) + s0 * vy + (p.sz > 3.2 ? 46 * tau * tau : -20 * tau) + p.dr * 26 * tau;
      var speed = Math.exp(-4.2 * tau);                      // how fast it still moves: long streaks at the nozzle, round dots once it hangs in the air
      var stretch = 1 + 5 * speed * speed;
      var fade = 1 - smooth(p.life * 0.5, p.life, tau);
      var sc = (p.sz / 4) * (1 - 0.45 * tau);
      p.el.style.opacity = (Math.min(1, tau / 0.025) * fade * 0.95).toFixed(3);
      p.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + Math.atan2(vy, dir * vx).toFixed(3) + 'rad) scale(' + (stretch * sc).toFixed(3) + ',' + sc.toFixed(3) + ')';
      p.on = true;
    });
    s._c.forEach(function (c) {
      var qc = Q0 + 0.025 + c.f * 0.06, tc = (q - qc) / CLOUD;
      if (tc <= 0 || (tc >= 1 && s !== hero)) return hide(c);
      tc = Math.min(tc, 1);
      var x = noz.x + dir * (c.f * L * 0.92 + 70 * tc);
      var y = originY(s, qc) + c.oy - c.rise * tc;
      var sc = (0.14 + 1.3 * Math.sqrt(tc)) * c.k;
      // a plume first (long along the spray), rounding out as it slows and spreads
      var sx = sc * (1 + (c.sx - 1) * (1 - tc)), sy = sc * (1 - 0.25 * (1 - tc));
      var op = 0.46 * Math.min(1, tc / 0.05) * Math.pow(1 - tc, 1.35) / Math.max(0.55, sc);
      c.el.style.opacity = op.toFixed(3);
      c.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')';
      c.on = true;
    });
    if (s._tint) s._tint.style.opacity = smooth(Q0 + 0.05, 0.78, q).toFixed(3);
  }
  function mistAll() { secs.forEach(function (s) { if (s._tint) s._tint.style.opacity = 1; }); act.style.transform = ''; liq.style.transform = ''; }
  var heroQ = 0, heroRun = 0;
  function tick() {
    if (still()) return mistAll();
    var tops = secs.map(function (s) { return s.getBoundingClientRect().top; });   // read everything, then write
    var press = 0, used = 0;
    for (var i = 0; i < secs.length; i++) {
      var s = secs[i], q = s === hero ? heroQ : (vh - tops[i]) / vh;
      used += clamp((q - Q0) / W, 0, 1);
      press = Math.max(press, Math.sin(Math.PI * clamp((q - Q0 + 0.012) / (W + 0.02), 0, 1)));
      if (s !== hero && (q < -0.05 || q > 1.6)) { if (s._k !== 'off') { paint(s, q < 0 ? -1 : 9); s._k = 'off'; } continue; }
      var key = q.toFixed(4); if (key === s._k) continue; s._k = key;
      paint(s, q);
    }
    act.style.transform = 'translateY(' + (press * 4.5).toFixed(2) + 'px)';
    liq.style.transform = 'translateY(' + (used * 3.2).toFixed(2) + 'px)';
    // hero photo drifts a little slower than the page
    if (tops[0] > -vh) heroImg.style.transform = 'translateY(' + (-tops[0] * 0.22).toFixed(1) + 'px) scale(1.06)';
    pill.classList.toggle('up', scrollY > 24);
  }
  var heroImg = $('.hero-pic img');
  // the hero is sprayed once, by time, when the page opens; its mist stays hanging there
  function heroSpray(again) {
    cancelAnimationFrame(heroRun);
    hero._top0 = hero.getBoundingClientRect().top + scrollY - scrollY;
    if (still()) { heroQ = 0; return; }
    var t0 = performance.now() + (again ? 0 : 450), DUR = 2600, from = Q0 - 0.02, to = Q0 + 0.42;
    heroQ = from; hero._k = null;
    heroRun = requestAnimationFrame(function f(t) {
      var k = clamp((t - t0) / DUR, 0, 1);
      heroQ = from + (to - from) * k; hero._top0 = hero.getBoundingClientRect().top; hero._k = null;
      tick();
      if (k < 1) heroRun = requestAnimationFrame(f);
    });
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); } }, { passive: true });
  var rT = 0; addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(layout, 120); });

  hours(); write();
  layout(); heroSpray(false);
  window.__mist = { tick: tick, layout: layout, secs: secs };
})();
