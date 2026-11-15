(function () {
  var root = document.documentElement, WA = '972546222669';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'לירז ליבוביץ\' · בניית ציפורניים, מניקור ופדיקור · אלמוג 4, טירת כרמל', en: 'Liraz Leibovich · Nail building, manicure & pedicure · 4 Almog St, Tirat Carmel' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Liraz Leibovich Nails · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Liraz Leibovich Nails · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'לירז ליבוביץ\' – ציפורניים', 'Liraz Leibovich Nails');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-set-lang]', 'English', 'עברית');
    aria('[data-t-wa]', 'וואטסאפ ללירז', 'WhatsApp Liraz');
    aria('[data-t-call]', 'התקשרו ללירז, 054-622-2669', 'Call Liraz, 054-622-2669');
    aria('[data-t-call2]', 'התקשרו ללירז', 'Call Liraz');
    aria('[data-t-tide]', 'עבודות של לירז', 'Liraz’s work');
    aria('[data-t-prev]', 'שלב קודם', 'Previous step');
    aria('[data-t-next]', 'שלב הבא', 'Next step');
    aria('[data-t-what]', 'מה לעשות', 'What to book');
    aria('[data-t-day]', 'איזה יום', 'Which day');
    $$('.rv .stars').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
    $('[data-t-map]').title = l === 'he' ? 'מפה: אלמוג 4, טירת כרמל' : 'Map: 4 Almog St, Tirat Carmel';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('lz-lang', l); } catch (e) {}
    texts(l); hours(); write(true); split(); drawBranch(); fitWord(); decodeAll(true); label(true); tick();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('lz-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $('[data-foot]').classList.add('up');
    caustics.kick(); tide.kick(); drift.kick(); write(true); fitWord(); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [8, 16], 1: [8, 16], 2: [8, 16], 3: [8, 16], 4: null, 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
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
  // consecutive days with the same hours share a row; the week starts on Sunday
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- letters: hero name and footer wordmark
  function split() {
    $$('h1 .ln > span[lang], [data-fword] > span[lang]').forEach(function (sp) {
      if (sp.dataset.raw === undefined) sp.dataset.raw = sp.textContent;
      var i = 0;
      sp.innerHTML = sp.dataset.raw.split(' ').map(function (w) {
        return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  }
  var fword = $('[data-fword]');
  function fitWord() {
    fword.style.fontSize = '';
    var w = fword.parentNode.clientWidth - 8, s = fword.scrollWidth;
    if (s > w) fword.style.fontSize = (parseFloat(getComputedStyle(fword).fontSize) * w / s).toFixed(1) + 'px';
  }

  // ---------------------------------------------------------------- glyph decode: labels settle out of scrambled letters
  var POOL = 'אבגדהוזחטיכלמנסעפצקרשתABCDEFGHKLMNPRSTVXZ0123456789';
  function decode(el, txt, instant) {
    cancelAnimationFrame(el._raf);
    if (instant || still()) { el.textContent = txt; return; }
    var t0 = performance.now(), dur = 520 + txt.length * 18;
    (function st(t) {
      var k = clamp((t - t0) / dur, 0, 1), done = Math.floor(k * txt.length), out = '';
      for (var i = 0; i < txt.length; i++) out += i < done || txt[i] === ' ' ? txt[i] : POOL[Math.floor(Math.random() * POOL.length)];
      el.textContent = out;
      if (k < 1) el._raf = requestAnimationFrame(st);
    })(t0);
  }
  var decs = $$('[data-decode]');
  function decodeAll(instant) { decs.forEach(function (d) { if (d._seen || instant) decode(d, d.dataset[he() ? 'he' : 'en'], instant && !d._seen ? true : instant); }); }
  decs.forEach(function (d) {
    d.textContent = d.dataset[he() ? 'he' : 'en'];
    watch(d, function (v) { if (v && !d._seen) { d._seen = true; decode(d, d.dataset[he() ? 'he' : 'en']); } }, { threshold: 1 });
  });

  // ---------------------------------------------------------------- entrances
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('.bento, .vb').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  $$('[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- caustics: light through water, bent toward the hand
  var caustics = (function () {
    var cv = $('[data-caustics]'), c = cv.getContext('2d'), W = 0, Hh = 0, img, raf = 0, vis = true, mx = -1, my = -1, t0 = performance.now();
    function size() {
      var r = hero.getBoundingClientRect(), k = phone() ? 6 : 7;
      W = Math.max(40, Math.round(r.width / k)); Hh = Math.max(30, Math.round(r.height / k));
      cv.width = W; cv.height = Hh; img = c.createImageData(W, Hh);
    }
    function draw(T) {
      var d = img.data, i = 0, ax = mx / hero.clientWidth * W, ay = my / hero.clientHeight * Hh;
      for (var y = 0; y < Hh; y++) for (var x = 0; x < W; x++) {
        var u = x * .15, v = y * .15;
        var a = Math.sin(u + T * .7 + Math.sin(v * .8 + T * .5) * 1.6) + Math.sin(v * 1.1 - T * .6 + Math.sin(u * .7 - T * .4) * 1.4) + Math.sin((u + v) * .6 + T * .45);
        if (mx >= 0) { var dx = x - ax, dy = y - ay, dd = Math.sqrt(dx * dx + dy * dy); a += Math.sin(dd * .55 - T * 4) * 1.4 * Math.exp(-dd * .06); }
        var e = 1 - Math.abs(a) / 1.05; e = e < 0 ? 0 : e * e * e * e;
        var fade = 1 - y / Hh * .55;
        d[i++] = 255 * e * .95 * fade; d[i++] = 170 * e * .9 * fade; d[i++] = 160 * e * .9 * fade; d[i++] = 255 * e * .55 * fade;
      }
      c.putImageData(img, 0, 0);
    }
    function frame(t) {
      raf = 0; draw((t - t0) / 1000);
      if (!still() && vis) raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = -1; });
    hero.addEventListener('pointerdown', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // pearly bubbles rising
  (function () {
    var box = $('[data-motes]'), n = phone() ? 9 : 16, h = '';
    for (var i = 0; i < n; i++) h += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;--s:' + (4 + Math.random() * 9).toFixed(1) + 'px;--t:' + (9 + Math.random() * 10).toFixed(1) + 's;--dl:-' + (Math.random() * 14).toFixed(1) + 's;--x:' + (Math.random() * 80 - 40).toFixed(0) + 'px"></i>';
    box.innerHTML = h;
  })();

  // ---------------------------------------------------------------- the tide: cards dealt from one pile onto a slow swell
  var tide = (function () {
    var wrap = $('[data-tide]'), track = $('[data-track]');
    $$('.tc', track).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $$('img', k).forEach(function (i) { i.alt = ''; delete i.dataset.altHe; delete i.dataset.altEn; }); track.appendChild(k); });   // two sets, so the swell never shows a card jumping
    var cards = $$('.tc', wrap), N = cards.length, off = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = true, last = 0, deal0 = 0;
    var ROT = [-9, 6, -3, 8, -6, 4, -2];
    function frame(t) {
      raf = 0;
      if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; c.style.opacity = ''; }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { off += (26 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var W = wrap.clientWidth, cw = cards[0].offsetWidth, gap = cw * (phone() ? 1.08 : 1.18), L = gap * N, T = t / 1000;
      var sc = scrollY * .35 * (rtl() ? 1 : -1), dk = deal0 ? smooth((t - deal0) / 1400) : 0;
      cards.forEach(function (c, i) {
        var s = ((i * gap + off + sc) % L + L) % L - L / 2, n = s / (W * .5 + cw);   // -1..1 across the view
        var y = Math.sin(s / (cw * 1.6) + T * .9) * (phone() ? 12 : 18), z = -Math.abs(n) * (phone() ? 120 : 260);
        var ry = -n * 26, rz = Math.cos(s / (cw * 1.6) + T * .9) * 4;
        var k = smooth((dk * 1.6) - (i % 7) * .09);                                               // dealt one after another
        var x = lerp(0, s, k), yy = lerp(-30 - (i % 7) * 3, y, k), zz = lerp(80, z, k), r = lerp(ROT[i % 7], rz, k);
        c.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + yy.toFixed(1) + 'px,' + zz.toFixed(1) + 'px) rotateY(' + (ry * k).toFixed(2) + 'deg) rotateZ(' + r.toFixed(2) + 'deg)';
        c.style.zIndex = k < 1 ? i : 100 - Math.round(Math.abs(n) * 50);
        c.style.filter = 'brightness(' + (1 - Math.min(1, Math.abs(n)) * .45).toFixed(3) + ')';
        c.style.setProperty('--sh', (n * -140).toFixed(1) + '%');
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; off += dx; vel = Math.abs(dx) * 3; });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { kick: kick, deal: function () { deal0 = performance.now(); kick(); } };
  })();

  // the swell at the foot of the hero keeps moving
  var swell = $('[data-swell]');
  function swellPath(T) {
    var a = Math.sin(T * .8) * 26, b = Math.cos(T * .6) * 22;
    return 'M0 ' + (60 + b * .4).toFixed(1) + ' C240 ' + (30 + a).toFixed(1) + ' 480 ' + (90 - a).toFixed(1) + ' 720 ' + (60 + b * .3).toFixed(1) + ' S1200 ' + (30 - b).toFixed(1) + ' 1440 ' + (60 + a * .3).toFixed(1) + ' V120 H0Z';
  }

  // ---------------------------------------------------------------- layers: shape, colour, shine on one real photo
  var layers = $('[data-layers]'), lphoto = $('[data-lphoto]'), steps = $$('[data-step]'), plabel = $('[data-plabel]'), stillStage = 2, curStage = -1;
  var LBL = { he: ['01 · מבנה', '02 · צבע', '03 · ברק'], en: ['01 · Shape', '02 · Colour', '03 · Shine'] };
  function label(instant) { if (curStage >= 0) decode(plabel, LBL[root.lang][curStage], instant); }
  function paint(p) {
    var c = smooth((p - .3) / .3), g = smooth((p - .64) / .3);
    var st = lphoto.style;
    st.setProperty('--cl', ((1 - c) * 100).toFixed(2) + '%');
    st.setProperty('--na', (g * .5).toFixed(3)); st.setProperty('--so', (g * .85).toFixed(3)); st.setProperty('--sx', lerp(-75, 30, g).toFixed(1) + '%');
    st.setProperty('--po', (106.8 * (1 - p)).toFixed(2));
    var s = p < .3 ? 0 : p < .64 ? 1 : 2;
    steps.forEach(function (b, i) { b.classList.toggle('on', i === s); b.setAttribute('aria-current', i === s ? 'step' : 'false'); });
    if (s !== curStage) { curStage = s; label(); }
  }
  var STAGE_P = [.22, .58, 1];
  function goStage(i) {
    i = clamp(i, 0, 2);
    if (still()) { stillStage = i; paint(STAGE_P[i]); return; }
    var top = layers.getBoundingClientRect().top + scrollY, span = layers.offsetHeight - innerHeight;
    scrollTo({ top: top + span * STAGE_P[i] * .98, behavior: 'smooth' });
  }
  steps.forEach(function (b) { b.addEventListener('click', function () { goStage(+b.dataset.step); }); });
  $('[data-lprev]').addEventListener('click', function () { goStage(stillStage - 1); });
  $('[data-lnext]').addEventListener('click', function () { goStage(stillStage + 1); });

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
    var roll = function (go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); };
    roll(still());
    watch(o, function (v) { if (v) roll(true); else if (!still()) roll(false); });
  });

  // ---------------------------------------------------------------- reviews drift on two tides
  var drift = (function () {
    var rows = $$('[data-row]'), box = $('[data-drift]'), raf = 0, vis = false, hold = false, last = 0, x = [0, 0];
    rows.forEach(function (r) { $$('.rv', r).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); r.appendChild(k); }); $$('.rv', r).forEach(function (c) { if (!c.hasAttribute('aria-hidden')) return; var k = c.cloneNode(true); r.appendChild(k); }); });
    function frame(t) {
      raf = 0; if (still()) { rows.forEach(function (r) { r.style.transform = ''; }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      rows.forEach(function (r, i) {
        var half = r.scrollWidth / 3;
        if (!hold) x[i] += (i ? 22 : -22) * dt;
        var v = ((x[i] + scrollY * (i ? .12 : -.12)) % half + half) % half;
        r.style.transform = 'translate3d(' + (rtl() ? v : -v).toFixed(1) + 'px,0,0)';
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    if (fine) { box.addEventListener('pointerenter', function () { hold = true; }); box.addEventListener('pointerleave', function () { hold = false; }); }
    watch(box, function (v) { vis = v; kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- bento spotlight: the hand on desktop, the scroll on phones
  var tiles = $$('.tile');
  if (fine) tiles.forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); t.classList.add('lit'); });
    t.addEventListener('pointerleave', function () { t.classList.remove('lit'); });
  });

  // ---------------------------------------------------------------- composer
  var svcs = $$('[data-svc]'), days = $$('[data-day]'), msgEl = $('[data-msg]'), note = $('[data-note]'), shown = '', typing = 0, seen = false;
  svcs.forEach(function (b) { b.addEventListener('click', function () {
    var on = b.getAttribute('aria-pressed') !== 'true';
    if (!on && svcs.filter(function (x) { return x.getAttribute('aria-pressed') === 'true'; }).length === 1) return;   // keep one picked
    b.setAttribute('aria-pressed', on ? 'true' : 'false'); write();
  }); });
  days.forEach(function (b) { b.addEventListener('click', function () { days.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write(); }); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = svcs.filter(function (n) { return n.getAttribute('aria-pressed') === 'true'; }).map(function (n) { return n.dataset[l ? 'he' : 'en']; });
    var d = days.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], day = d ? d.dataset[l ? 'he' : 'en'] : '';
    return l ? 'היי לירז, אשמח לקבוע תור ל' + list(picked, true) + (day ? ' ' + day : '') + '.' + (day ? '' : ' הימים גמישים אצלי.') + ' מתי יש לך מקום?'
             : 'Hi Liraz, I’d like to book ' + list(picked, false) + (day ? ' ' + day : '') + '.' + (day ? '' : ' My days are flexible.') + ' When do you have a spot?';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing); note.classList.remove('typing');
    if (instant || still() || !seen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    note.classList.add('typing');
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st); else note.classList.remove('typing');
    })(t0);
  }
  var branch = $('.branch'), brSvg = $('.br-line');
  // the coral branch is drawn through the buds wherever the layout puts them, with a small twig off every other bud
  function drawBranch() {
    var b = branch.getBoundingClientRect(), pts = days.map(function (d) { var r = d.getBoundingClientRect(); return [r.left + r.width / 2 - b.left, r.top + r.height / 2 - b.top]; });
    if (rtl()) pts.reverse();
    pts.unshift([0, pts[0][1] + 26]); pts.push([b.width, pts[pts.length - 1][1] - 16]);
    var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      d += ' C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    var tw = '';
    for (var k = 1; k < pts.length - 1; k += 2) { var q = pts[k], up = q[1] > b.height / 2 ? -1 : 1; tw += ' M' + q[0].toFixed(1) + ' ' + q[1].toFixed(1) + ' q14 ' + (up * 26) + ' 34 ' + (up * 40); }
    brSvg.setAttribute('viewBox', '0 0 ' + b.width.toFixed(0) + ' ' + b.height.toFixed(0));
    brSvg.innerHTML = '<path d="' + d + '"/><path class="tw" d="' + tw + '"/>';
  }
  watch(note, function (v) { if (v && !seen) { seen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .5 });
  if (!still()) branch.style.setProperty('--bd', '900');
  watch(branch, function (v) { if (v) branch.style.setProperty('--bd', '0'); }, { threshold: .4 });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var opening = $('[data-opening]'), opStage = $('.op-stage'), work = $('[data-work]'), revs = $('[data-revs]'), page = $('.page'), foot = $('[data-foot]'), fphoto = $('[data-fphoto]'), coral = $('[data-coral]');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) { tide.kick(); }
    swell.setAttribute('d', swellPath(calm ? 0 : performance.now() / 1000 + scrollY * .004));
    // layers
    paint(calm ? STAGE_P[stillStage] : prog(layers));
    // the shell opens
    var orr = opening.getBoundingClientRect(), op = calm ? 1 : prog(opening), o = calm ? 1 : smooth((vh * .9 - orr.top) / (vh * 1.3)), s = opStage.style;
    s.setProperty('--vt', (-o * 112).toFixed(2) + '%'); s.setProperty('--vb', (o * 112).toFixed(2) + '%');
    s.setProperty('--oz', (1.15 - .15 * o).toFixed(4));
    var oc = calm ? 1 : smooth((o - .55) / .35); s.setProperty('--oc', oc.toFixed(3)); s.setProperty('--oy', ((1 - oc) * 30).toFixed(1) + 'px');
    // reviews land over the work like the next card
    var rt = revs.getBoundingClientRect().top, k = calm ? 0 : clamp(1 - rt / vh, 0, 1);
    work.style.transform = k > 0 ? 'scale(' + (1 - k * .05).toFixed(4) + ')' : '';
    work.style.opacity = k > 0 ? (1 - k * .35).toFixed(3) : '';
    // phones: the spotlight rides the scroll
    if (!fine && !calm) tiles.forEach(function (t) { var r = t.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return; t.classList.add('lit'); t.style.setProperty('--mx', (r.width * (.5 + .45 * Math.sin(r.top / 160))).toFixed(0) + 'px'); t.style.setProperty('--my', (r.height * clamp(1 - (r.top + r.height) / vh, 0, 1)).toFixed(0) + 'px'); });
    // curtain footer: the closing photo settles, coral draws, the name rises
    var mb = page.getBoundingClientRect().bottom, fh = foot.offsetHeight, fp = calm ? 1 : smooth((vh - mb) / fh);
    fphoto.style.setProperty('--fz', (1.35 - .35 * fp).toFixed(4)); fphoto.style.setProperty('--fi', ((1 - fp) * 14).toFixed(1) + '%');
    coral.style.setProperty('--cd', (420 * (1 - fp)).toFixed(1));
    foot.classList.toggle('up', calm || fp > .35);
  }
  // the footer can only be a curtain when it fits the screen
  function footFit() { foot.classList.toggle('tall', foot.offsetHeight > innerHeight - 20); foot.style.position = foot.classList.contains('tall') ? 'relative' : ''; }

  // the swell and the stage keep moving while the hero is in view
  (function loop() { if (!still() && hero.getBoundingClientRect().bottom > 0) swell.setAttribute('d', swellPath(performance.now() / 1000 + scrollY * .004)); requestAnimationFrame(loop); })();

  function layout() { drawBranch(); caustics.size(); fitWord(); footFit(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  split(); texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); tide.deal(); fitWord(); footFit(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { fitWord(); footFit(); tick(); });
})();
