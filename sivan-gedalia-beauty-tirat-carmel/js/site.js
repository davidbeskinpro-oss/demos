(function () {
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var span = function (p, a, b) { return smooth((p - a) / (b - a)); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 760; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }).observe(el); };
  var WA = '972546537748';
  var TITLE = { he: 'הקליניקה של סיון · Sivan Beauty · אצ״ל 5, טירת כרמל', en: 'Sivan’s clinic · Sivan Beauty · 5 Etzel St, Tirat Carmel' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Sivan Beauty- הקליניקה של סיון גדליה · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Sivan Beauty – Sivan Gedalia’s clinic · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לסיון, 054-653-7748', 'Call Sivan, 054-653-7748');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-stages]', 'שלבים', 'Stages');
    aria('[data-t-prev]', 'הקודם', 'Previous');
    aria('[data-t-next]', 'הבא', 'Next');
    $$('[data-t-name]').forEach(function (i) { i.placeholder = l === 'he' ? 'למשל: נועה' : 'e.g. Noa'; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('sv-lang', l); } catch (e) {}
    texts(l); hours(); fillComposer(); write(true); split(); callout(true); pins(true); tick();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('sv-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-split]').forEach(function (el) { el.classList.add('in'); });
    $('[data-hero]').classList.add('lit');
    clearStyles(); tick(); kick(); write(true); callout(true); pins(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9, 20], 1: [9, 20], 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [9, 13], 6: null };
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
    $$('.tile.hours').forEach(function (el) { el.classList.toggle('open', open); });
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

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-split]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headlines: letter by letter, out of a blur
  function split() {
    $$('[data-split] .ln > span[lang]').forEach(function (sp) {
      if (sp.dataset.done) return; sp.dataset.done = 1;
      var i = 0;
      sp.innerHTML = sp.textContent.split(' ').map(function (w) {
        return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  }
  split();
  $('.h-title').classList.add('in');   // the hero headline never waits for an observer

  // ---------------------------------------------------------------- glyph decode for labels
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'abcdefghijklmnopqrstuvwxyz' };
  function decode(el, text) {
    if (el._t) cancelAnimationFrame(el._t);
    if (still()) { el.textContent = text; return; }
    var set = he() ? GL.he : GL.en, t0 = performance.now(), D = 650;
    (function f(t) {
      var k = clamp((t - t0) / D, 0, 1), n = Math.floor(text.length * k), s = text.slice(0, n);
      for (var i = n; i < text.length; i++) s += text[i] === ' ' ? ' ' : set[(Math.random() * set.length) | 0];
      el.textContent = s; if (k < 1) el._t = requestAnimationFrame(f);
    })(t0);
  }

  // ---------------------------------------------------------------- hero: the mirror lights up, breathes, follows the hand
  var hero = $('[data-hero]'), art = $('[data-art]');
  requestAnimationFrame(function () { setTimeout(function () { hero.classList.add('lit'); }, 120); setTimeout(function () { hero.classList.add('done'); }, 1600); });
  var A = [.42, .02, .62, 0, .7, .1, .72, .2, .74, .3, .97, .36, .98, .55, 1, .75, .96, .97, .62, .99, .3, 1, .05, .96, .03, .72, .01, .52, .14, .44, .16, .3, .18, .14, .24, .04, .42, .02];
  var B = [.44, .01, .64, .01, .69, .12, .7, .22, .72, .33, .96, .38, .97, .57, .99, .78, .93, .98, .6, .99, .28, 1, .04, .95, .02, .7, 0, .5, .12, .45, .15, .31, .17, .15, .26, .03, .44, .01];
  var blobs = $$('[data-blob]');
  function blobD(t) {
    var v = A.map(function (a, i) { return (a + (B[i] - a) * t).toFixed(4); }), k = 0, d = 'M' + v[k++] + ' ' + v[k++];
    for (var c = 0; c < 6; c++) d += 'C' + v[k++] + ' ' + v[k++] + ' ' + v[k++] + ' ' + v[k++] + ' ' + v[k++] + ' ' + v[k++];
    return d + 'Z';
  }
  var heroVis = true, mx = 0, my = 0, tmx = 0, tmy = 0, pointerAt = 0;
  art.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = art.getBoundingClientRect(); tmx = (e.clientX - r.left) / r.width * 2 - 1; tmy = (e.clientY - r.top) / r.height * 2 - 1; pointerAt = performance.now(); });
  art.addEventListener('pointerleave', function () { tmx = tmy = 0; });
  watch(hero, function (v) { heroVis = v; kick(); });

  // motes: warm dust floating up in the mirror's light
  var cv = $('[data-motes]'), cx = cv.getContext('2d'), M = [], cw = 0, ch = 0;
  function sizeMotes() {
    var dpr = Math.min(2, devicePixelRatio || 1); cw = hero.clientWidth; ch = hero.clientHeight;
    cv.width = cw * dpr; cv.height = ch * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    M = []; var n = phone() ? 26 : 48;
    for (var i = 0; i < n; i++) M.push({ x: Math.random() * cw, y: Math.random() * ch, r: .6 + Math.random() * 1.8, s: .12 + Math.random() * .35, o: Math.random() * 6.28 });
  }
  sizeMotes();
  var raf = 0;
  function frame(t) {
    raf = 0; if (still() || !heroVis) return;
    var auto = performance.now() - pointerAt > 2500;
    if (auto) { tmx = Math.sin(t / 2300) * .55; tmy = Math.cos(t / 3100) * .35; }   // phones and idle: the reflection drifts by itself
    mx = lerp(mx, tmx, .06); my = lerp(my, tmy, .06);
    art.style.setProperty('--mx', mx.toFixed(3)); art.style.setProperty('--my', my.toFixed(3));
    var d = blobD((Math.sin(t / 1800) + 1) / 2); blobs.forEach(function (p) { p.setAttribute('d', d); });
    cx.clearRect(0, 0, cw, ch);
    M.forEach(function (m) {
      m.y -= m.s; m.x += Math.sin(t / 1400 + m.o) * .18; if (m.y < -10) { m.y = ch + 10; m.x = Math.random() * cw; }
      var a = .25 + .35 * (Math.sin(t / 900 + m.o) + 1) / 2;
      cx.fillStyle = 'rgba(255,222,160,' + a.toFixed(3) + ')'; cx.beginPath(); cx.arc(m.x, m.y, m.r, 0, 6.283); cx.fill();
    });
    kick();
  }
  function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); }
  kick();

  // ---------------------------------------------------------------- the line: stages
  var lift = $('[data-lift]'), lframe = $('.lift-frame', lift), camL = $('.cam-lash', lift), camB = $('.cam-brow', lift), tL = $('.t-lash', lift), tB = $('.t-brow', lift), cal = $('.callout', lift);
  var CALL = [['המבט, מקרוב', 'The look, close up'], ['הריסים הטבעיים, מורמים', 'Natural lashes, lifted'], ['הגבה, מוברשת למעלה', 'The brow, brushed up']];
  var STAGE_AT = [0.06, 0.4, 0.86], stage = -1;
  function setStage(s, force) {
    if (s === stage && !force) return; stage = s;
    lframe.dataset.s = s;
    $$('.stage', lift).forEach(function (b, i) { b.classList.toggle('on', i === s); b.setAttribute('aria-pressed', i === s ? 'true' : 'false'); });
    callout(true);
  }
  function callout() { if (stage < 0) return; decode(cal, CALL[stage][he() ? 0 : 1]); }
  function scrollToStage(i) {
    var top = lift.getBoundingClientRect().top + scrollY, range = lift.offsetHeight - innerHeight;
    scrollTo({ top: top + range * STAGE_AT[i], behavior: 'smooth' });
  }
  $$('.stage', lift).forEach(function (b, i) { b.addEventListener('click', function () { if (still()) setStage(i); else scrollToStage(i); }); });
  $$('[data-step]', lift).forEach(function (b) { b.addEventListener('click', function () { setStage((Math.max(stage, 0) + +b.dataset.step + 3) % 3); }); });
  setStage(0, true);

  // living layers on the treatment cards: lashes along a lid, hairs along a brow
  var NS = 'http://www.w3.org/2000/svg';
  (function () {
    var g = $('.lashes .hairs'), i, t, x, y;
    for (i = 0; i <= 16; i++) {
      t = i / 16; x = (1 - t) * (1 - t) * 10 + 2 * (1 - t) * t * 120 + t * t * 230; y = (1 - t) * (1 - t) * 80 + 2 * (1 - t) * t * 40 + t * t * 80;
      var ang = (t - .5) * 70, len = 16 + Math.sin(t * Math.PI) * 14, rad = (ang - 90) * Math.PI / 180;
      var l = document.createElementNS(NS, 'line'); l.setAttribute('x1', x.toFixed(1)); l.setAttribute('y1', y.toFixed(1));
      l.setAttribute('x2', (x + Math.cos(rad) * len).toFixed(1)); l.setAttribute('y2', (y + Math.sin(rad) * len).toFixed(1));
      l.style.setProperty('--b', (t < .5 ? -1 : 1) * -55 + 'deg'); g.appendChild(l);
    }
    g = $('.brows .hairs');
    for (i = 0; i < 34; i++) {
      t = i / 33; x = 14 + t * 210; y = 70 - Math.sin(t * Math.PI * .85) * 40 + (i % 3) * 4;
      var len2 = 14 + Math.sin(t * Math.PI) * 10, a2 = (-62 + t * 40) * Math.PI / 180;
      var b = document.createElementNS(NS, 'line'); b.setAttribute('x1', x.toFixed(1)); b.setAttribute('y1', y.toFixed(1));
      b.setAttribute('x2', (x + Math.cos(a2) * len2).toFixed(1)); b.setAttribute('y2', (y + Math.sin(a2) * len2).toFixed(1));
      b.style.setProperty('--b', (30 + (i % 4) * 8) + 'deg'); g.appendChild(b);
    }
  })();
  var cards = $$('[data-card]'); cards.forEach(function (c, i) { c.style.setProperty('--i', i); });

  // ---------------------------------------------------------------- the room
  var open = $('[data-open]'), pinEls = $$('.pin', open), pinsShown = false;
  function pins(force) {
    if (force && !pinsShown && !still()) return;
    pinEls.forEach(function (p, i) { var t = p.dataset[he() ? 'decodeHe' : 'decodeEn']; if (still()) p.textContent = t; else setTimeout(function () { decode(p, t); }, i * 160); });
  }
  var tilt = $('[data-tilt]');
  open.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse' || still()) return; var r = open.getBoundingClientRect(); tilt.style.setProperty('--tx', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3)); tilt.style.setProperty('--ty', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3)); });
  open.addEventListener('pointerleave', function () { tilt.style.setProperty('--tx', 0); tilt.style.setProperty('--ty', 0); });

  // ---------------------------------------------------------------- reviews fan
  var fan = $('[data-fan]'), arms = $$('.arm', fan), fanCount = $('[data-fan-count]'), fanF = 0;
  function fanTo(i) { var top = fan.getBoundingClientRect().top + scrollY, range = fan.offsetHeight - innerHeight; scrollTo({ top: top + range * (i / (arms.length - 1)), behavior: 'smooth' }); }
  $$('[data-fan-step]', fan).forEach(function (b) { b.addEventListener('click', function () { fanTo(clamp(Math.round(fanF) + +b.dataset.fanStep, 0, arms.length - 1)); }); });

  // ---------------------------------------------------------------- odometer
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (c) {
      if (!/\d/.test(c)) return '<span class="d" aria-hidden="true"><span><b data-n="' + c + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + c + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join(''); o.setAttribute('role', 'img');
    var roll = function () { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild; s.style.transitionDelay = (i * 140) + 'ms'; s.style.transform = 'translateY(' + (-d.dataset.to * 10) + '%)'; }); };
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll();
  });

  // ---------------------------------------------------------------- scroll loop
  var nav = $('[data-nav]');
  function prog(el) { var r = el.getBoundingClientRect(), range = el.offsetHeight - innerHeight; return range > 0 ? clamp(-r.top / range, 0, 1) : 0; }
  function clearStyles() {
    [camL, camB, tL, tB].forEach(function (e) { e.style.removeProperty('--z'); e.style.removeProperty('--t'); e.style.removeProperty('--w'); });
    cards.forEach(function (c) { c.style.removeProperty('--k'); c.style.removeProperty('--a'); $$('.t-live', c).forEach(function (s) { s.style.removeProperty('--a'); }); $('.t-photo img', c).style.removeProperty('--a'); });
    open.style.removeProperty('--o'); pinEls.forEach(function (p) { p.style.removeProperty('--pv'); });
    arms.forEach(function (a) { a.style.removeProperty('--a'); a.firstElementChild.style.removeProperty('--v'); });
  }
  function tick() {
    var y = scrollY;
    nav.classList.toggle('gathered', y > 40);
    if (still()) { cards.forEach(function (c) { $$('.t-live', c).forEach(function (s) { s.style.setProperty('--a', 1); }); }); return; }
    hero.style.setProperty('--sp', clamp(y / (hero.offsetHeight * .7), 0, 1).toFixed(3));
    // the line
    var p = prog(lift);
    camL.style.setProperty('--z', (1 + .7 * span(p, .12, .42)).toFixed(3));
    tL.style.setProperty('--t', (1 - span(p, .2, .45)).toFixed(3));
    camB.style.setProperty('--w', (1 - span(p, .55, .78)).toFixed(3));
    camB.style.setProperty('--z', (1.3 - .15 * span(p, .55, .85)).toFixed(3));
    tB.style.setProperty('--t', (1 - span(p, .7, .95)).toFixed(3));
    setStage(p < .2 ? 0 : p < .58 ? 1 : 2);
    // cards land on each other; each card's lashes lift as it arrives
    cards.forEach(function (c, i) {
      var r = c.getBoundingClientRect(), a = clamp(1 - (r.top - 90) / (innerHeight * .55), 0, 1), k = 0;
      if (cards[i + 1]) { var d = cards[i + 1].getBoundingClientRect().top - r.top; k = clamp(1 - d / r.height, 0, 1); }
      c.style.setProperty('--k', k.toFixed(3));
      $('.t-photo img', c).style.setProperty('--a', a.toFixed(3)); $$('.t-live', c).forEach(function (s) { s.style.setProperty('--a', a.toFixed(3)); });
    });
    // the room opens out of the mirror
    var ro = open.getBoundingClientRect(), o = clamp((innerHeight - ro.top) / (innerHeight * .95), 0, 1), oe = smooth(o);
    open.style.setProperty('--o', oe.toFixed(3));
    var show = oe > .9; pinEls.forEach(function (pp) { pp.style.setProperty('--pv', show ? 1 : 0); });
    if (show && !pinsShown) { pinsShown = true; pins(); } else if (!show && oe < .5) pinsShown = false;
    // the fan
    var fx = prog(fan) * (arms.length - 1), fi = Math.min(Math.floor(fx), arms.length - 2);
    fanF = fi + smooth((fx - fi - .3) / .4);   // each review rests at the top for a while before the fan turns on
    var step = phone() ? 24 : 26, sign = he() ? 1 : -1;
    arms.forEach(function (a, i) {
      var dd = i - fanF; a.style.setProperty('--a', (dd * step * sign).toFixed(2) + 'deg');
      a.firstElementChild.style.setProperty('--v', clamp(1 - Math.abs(dd) * .55, .12, 1).toFixed(3));
    });
    fanCount.textContent = (Math.round(fanF) + 1) + ' / ' + arms.length;
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); } }, { passive: true });
  addEventListener('resize', function () { sizeMotes(); sizeDust(); tick(); });

  // ---------------------------------------------------------------- the note to Sivan
  var form = $('[data-composer]'), selD = $('[data-day]'), selT = $('[data-time]'), bubble = $('[data-bubble]'), send = $('[data-send]');
  var TREAT = { he: ['הרמת ריסים', 'עיצוב גבות', 'הרמת ריסים ועיצוב גבות', 'טיפול פנים', ''], en: ['a lash lift', 'brow shaping', 'a lash lift and brow shaping', 'a facial', ''] };
  var TIMES = { he: ['בבוקר', 'בצהריים', 'אחר הצהריים'], en: ['in the morning', 'around noon', 'in the afternoon'] };
  var TLAB = { he: ['בוקר', 'צהריים', 'אחר הצהריים'], en: ['Morning', 'Noon', 'Afternoon'] };
  function fillComposer() {
    var l = he() ? 'he' : 'en', d = selD.value || '0', t = selT.value || '0';
    selD.innerHTML = [0, 1, 2, 3, 4, 5].map(function (i) { return '<option value="' + i + '">' + (l === 'he' ? 'יום ' + dayHe[i] : dayEn[i]) + '</option>'; }).join('');
    selD.value = d; fillTimes(t);
  }
  function fillTimes(t) {
    var l = he() ? 'he' : 'en', n = selD.value === '5' ? 1 : 3;   // Friday: mornings only, she closes at 13:00
    selT.innerHTML = TLAB[l].slice(0, n).map(function (x, i) { return '<option value="' + i + '">' + x + '</option>'; }).join('');
    selT.value = +t < n ? t : '0';
  }
  function message() {
    var l = he(), t = +(form.querySelector('input[name="t"]:checked') || { value: 0 }).value, d = +selD.value, h = +selT.value, n = form.n.value.trim();
    if (l) {
      var hi = 'היי סיון' + (n ? ', כאן ' + n : '') + '. ', when = 'ביום ' + dayHe[d] + ' ' + TIMES.he[h];
      return t === 4 ? hi + 'אשמח לקבוע תור ' + when + ', ועוד לא החלטתי על איזה טיפול. אפשר להתייעץ איתך?' : hi + 'אשמח לקבוע ' + TREAT.he[t] + ' ' + when + '. מתי יש לך מקום?';
    }
    var hiE = 'Hi Sivan' + (n ? ', this is ' + n : '') + '. ', whenE = 'on ' + dayEn[d] + ' ' + TIMES.en[h];
    return t === 4 ? hiE + 'I’d like to book a visit ' + whenE + ', and I haven’t decided on a treatment yet. Could you help me choose?' : hiE + 'I’d like to book ' + TREAT.en[t] + ' ' + whenE + '. When do you have a spot?';
  }
  var typing = 0;
  function write(instant) {
    var m = message(); send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    clearInterval(typing);
    if (instant || still()) { bubble.textContent = m; return; }
    var i = 0; bubble.textContent = '';
    typing = setInterval(function () { i += 2; bubble.textContent = m.slice(0, i); if (i >= m.length) clearInterval(typing); }, 16);
  }
  selD.addEventListener('change', function () { fillTimes(selT.value); write(); });
  form.addEventListener('change', function (e) { if (e.target !== selD) write(); });
  form.n.addEventListener('input', function () { write(true); });
  fillComposer();
  var wrote = false; watch(bubble, function (v) { if (v && !wrote) { wrote = true; write(); } });
  write(true);

  // ---------------------------------------------------------------- visit bento: the light follows the hand
  var bento = $('[data-spot]');
  bento.addEventListener('pointermove', function (e) { $$('.tile', bento).forEach(function (t) { var r = t.getBoundingClientRect(); t.style.setProperty('--x', (e.clientX - r.left) + 'px'); t.style.setProperty('--y', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- footer: LED dust taken from the logo's own pixels
  var dust = $('[data-dust]'), dx = dust.getContext('2d'), foot = $('.foot'), P = [], dw = 0, dh = 0, dpx = -999, dpy = -999, dVis = false, draf = 0, mark = new Image();
  mark.src = 'img/logo-mark.png';
  function sizeDust() {
    if (!mark.naturalWidth) return;
    var dpr = Math.min(2, devicePixelRatio || 1); dw = foot.clientWidth; dh = foot.clientHeight;
    dust.width = dw * dpr; dust.height = dh * dpr; dx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var c = document.createElement('canvas'), W = 90, Hh = Math.round(W * mark.naturalHeight / mark.naturalWidth); c.width = W; c.height = Hh;
    var g = c.getContext('2d'); g.drawImage(mark, 0, 0, W, Hh); var data = g.getImageData(0, 0, W, Hh).data;
    var size = Math.min(dw * (phone() ? .8 : .42), dh * .78), sc = size / Hh, ox = phone() ? dw / 2 - W * sc / 2 : (he() ? dw * .08 : dw * .92 - W * sc), oy = dh * .08;
    P = [];
    for (var y = 0; y < Hh; y += 2) for (var x = 0; x < W; x += 2) if (data[(y * W + x) * 4 + 3] > 120) P.push({ hx: ox + x * sc, hy: oy + y * sc, x: ox + x * sc, y: oy + y * sc, vx: 0, vy: 0 });
    dframe(performance.now());
  }
  mark.onload = sizeDust;
  foot.addEventListener('pointermove', function (e) { var r = foot.getBoundingClientRect(); dpx = e.clientX - r.left; dpy = e.clientY - r.top; });
  foot.addEventListener('pointerleave', function () { dpx = dpy = -999; });
  foot.addEventListener('pointerdown', function (e) { var r = foot.getBoundingClientRect(); dpx = e.clientX - r.left; dpy = e.clientY - r.top; setTimeout(function () { dpx = dpy = -999; }, 600); });
  watch(foot, function (v) { dVis = v; if (v && !draf) draf = requestAnimationFrame(dframe); });
  function dframe(t) {
    draf = 0; dx.clearRect(0, 0, dw, dh);
    var R = phone() ? 60 : 110, wave = phone() && dpx < -100;   // phones: a slow wave of light passes through instead of the hand
    var wy = (t / 14) % (dh + 200) - 100;
    dx.fillStyle = 'rgba(255,220,160,.55)';
    P.forEach(function (p) {
      var ax = 0, ay = 0, ddx = p.x - dpx, ddy = p.y - dpy, d2 = ddx * ddx + ddy * ddy;
      if (d2 < R * R) { var f = (1 - Math.sqrt(d2) / R) * 2.2; ax += ddx * f / R * 6; ay += ddy * f / R * 6; }
      if (wave && Math.abs(p.hy - wy) < 24) ay -= .6;
      p.vx = (p.vx + ax + (p.hx - p.x) * .06) * .82; p.vy = (p.vy + ay + (p.hy - p.y) * .06) * .82;
      p.x += p.vx; p.y += p.vy; dx.fillRect(p.x, p.y, 1.6, 1.6);
    });
    if (dVis && !still()) draf = requestAnimationFrame(dframe);
  }

  // phones: the corner dock waits until the hero's own buttons have left the screen
  var dock = $('.dock'), cta = $('.h-cta');
  if (io) { dock.classList.add('away'); new IntersectionObserver(function (es) { dock.classList.toggle('away', es[0].isIntersecting); }).observe(cta); }
  texts(root.lang); hours(); tick();
  if (still()) { $$('[data-split],[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); }); hero.classList.add('lit'); }
})();
