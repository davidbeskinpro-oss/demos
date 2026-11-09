(function () {
  var root = document.documentElement, WA = '972547638645';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth <= 760; };
  var TITLE = { he: 'לילי · עיצוב שיער · טרומפלדור 53, חיפה', en: 'Lili · Hair design · 53 Trumpeldor St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור עיצוב שיער לילי · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Lili Hair Design · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'עיצוב שיער לילי', 'Lili Hair Design');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'להתקשר ללילי, 054-763-8645', 'Call Lili, 054-763-8645');
    $('.map iframe').title = l === 'he' ? 'מפה: טרומפלדור 53, חיפה' : 'Map: 53 Trumpeldor St, Haifa';
    $$('[data-dec]').forEach(function (f) { f.textContent = label(f); });
  }
  function label(f) { var o = {}; f.dataset.dec.split('|').forEach(function (p) { var k = p.split(':'); o[k[0]] = k[1]; }); return o[root.lang]; }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('lili-lang', l); } catch (e) {}
    texts(l); hours(); buildComb(); write(true); caption(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('lili-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    layout(); ring.kick(); glints.kick(); write(true); caption(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 17], 1: [9, 17], 2: [9, 17], 3: [9, 17], 4: [9, 17], 5: [9, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var dayHeS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], dayEnS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: dayEnS.indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
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
  function hours() {   // consecutive days with the same hours share a row
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
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter, out of a blur
  $$('[data-split] span[lang]').forEach(function (sp) {
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });
  // each language counts its letters in reading order across both halves
  ['he', 'en'].forEach(function (l) { var n = 0; $$('[data-split] span[lang="' + l + '"] .ch').forEach(function (c) { c.style.setProperty('--i', n++); }); });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), mirror = $('[data-mirror]'), reel = $('[data-reel]'), cap = $('[data-cap]');

  // ---------------------------------------------------------------- glyph decode, for the mirror's caption and the cards
  var GLYPH = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'abcdefghijklmnopqrstuvwxyz' };
  function decode(el, txt) {
    clearInterval(el._t);
    if (still()) { el.textContent = txt; return; }
    var f = 0, n = txt.length, G = GLYPH[root.lang];
    el._t = setInterval(function () {
      f++; var out = '';
      for (var k = 0; k < n; k++) out += txt[k] === ' ' || k < f / 1.6 ? txt[k] : G[Math.floor(Math.random() * G.length)];
      el.textContent = out;
      if (f / 1.6 >= n) { clearInterval(el._t); el.textContent = txt; }
    }, 28);
  }
  var CAPS = [{ he: 'פלטינה, חלק', en: 'Platinum, sleek' }, { he: 'בלונד בגלים', en: 'Blonde waves' }, { he: 'קצר, נחושת', en: 'Short, copper' }, { he: 'גלים רכים', en: 'Soft waves' }];
  var frameNow = -1;
  function caption(force, idx) {
    if (idx === undefined) idx = Math.max(0, frameNow);
    if (!force && idx === frameNow) return;
    frameNow = idx; decode(cap, CAPS[idx][root.lang]);
  }

  // ---------------------------------------------------------------- the mirror: tilts toward the hand, the light follows it
  mirror.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var r = mirror.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    mirror.classList.add('hand');
    mirror.style.setProperty('--ty', (x * 9).toFixed(2) + 'deg'); mirror.style.setProperty('--tx', (-y * 7).toFixed(2) + 'deg');
    mirror.style.setProperty('--sx', (x * 120).toFixed(1) + '%');
  });
  mirror.addEventListener('pointerleave', function () { mirror.classList.remove('hand'); mirror.style.setProperty('--tx', '0deg'); mirror.style.setProperty('--ty', '0deg'); });
  // on phones the reel turns by itself (and by tap); on wide screens the scroll turns it
  var autoIdx = 0, autoOn = false;
  function autoStep(i) { autoIdx = (i + 4) % 4; reel.style.setProperty('--ry', (-autoIdx * 25) + '%'); caption(false, autoIdx); }
  mirror.addEventListener('click', function () { if (phone() || still()) autoStep(autoIdx + 1); });
  setInterval(function () { if (autoOn && phone() && !still() && !document.hidden) autoStep(autoIdx + 1); }, 3400);
  watch(hero, function (v) { autoOn = v; glints.vis(v); });

  // ---------------------------------------------------------------- glints: soft sparkles drifting up around the mirror, shying from the hand
  var glints = (function () {
    var cv = $('[data-glints]'), c = cv.getContext('2d'), P = [], w = 0, h = 0, raf = 0, vis = true, mx = -999, my = -999;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1), st = cv.parentNode; w = st.clientWidth; h = st.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 26 : 54; P = [];
      for (var i = 0; i < n; i++) P.push(spawn(true));
      draw();
    }
    function spawn(any) { return { x: w * (.2 + Math.random() * .6), y: any ? Math.random() * h : h + 10, v: .2 + Math.random() * .45, s: 1.4 + Math.random() * 2.8, ph: Math.random() * 6.28, g: Math.random() < .5, dx: 0 }; }
    function star(p, a) {
      c.globalAlpha = a; c.fillStyle = p.g ? '#d9b77c' : '#c76bb0';
      c.beginPath(); var s = p.s;
      c.moveTo(p.x, p.y - s * 2.2); c.quadraticCurveTo(p.x, p.y, p.x + s * 2.2, p.y); c.quadraticCurveTo(p.x, p.y, p.x, p.y + s * 2.2); c.quadraticCurveTo(p.x, p.y, p.x - s * 2.2, p.y); c.quadraticCurveTo(p.x, p.y, p.x, p.y - s * 2.2);
      c.fill();
    }
    function draw(t) {
      c.clearRect(0, 0, w, h); t = t || 0;
      P.forEach(function (p) { star(p, .25 + .45 * (.5 + .5 * Math.sin(t / 600 + p.ph))); });
      c.globalAlpha = 1;
    }
    function frame(t) {
      raf = 0; if (!vis || still()) { draw(0); return; }
      P.forEach(function (p, i) {
        p.y -= p.v; p.x += Math.sin(t / 1400 + p.ph) * .25 + p.dx; p.dx *= .92;
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 9000) { p.dx += dx / Math.sqrt(d2 + 1) * .8; }
        if (p.y < -10) P[i] = spawn(false);
      });
      draw(t); raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: size, kick: kick, vis: function (v) { vis = v; kick(); } };
  })();

  // ---------------------------------------------------------------- the swatch ring: turns by itself, with the scroll and with a drag
  var colour = $('[data-colour]');
  var ring = (function () {
    var wrap = $('[data-ringwrap]'), el = $('[data-ring]');
    $$('.rc', el).forEach(function (cd) { var k = cd.cloneNode(true); k.setAttribute('aria-hidden', 'true'); el.appendChild(k); });
    var cards = $$('.rc', el), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = false, last = 0;
    function R() { var cw = cards[0].offsetWidth || 150; return Math.max(cw * 1.05 / (2 * Math.tan(Math.PI / N)), phone() ? 300 : Math.min(innerWidth * .4, 620)); }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (cd) { cd.style.transform = ''; cd.style.filter = ''; }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (7 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var r = R(), sc = scrollY * .05 * (rtl() ? 1 : -1);
      cards.forEach(function (cd, i) {
        var a = rot + sc + i * step, f = Math.cos(a * Math.PI / 180), lift = f > .94 ? (f - .94) * 16 : 0;
        cd.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + (r + lift * 40).toFixed(1) + 'px) translateY(' + (-lift * 14).toFixed(1) + 'px)';
        cd.style.filter = 'brightness(' + (.35 + .65 * Math.pow(Math.max(f, 0), 1.5)).toFixed(3) + ')';
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    el.style.transform = 'rotateX(-6deg)';
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .22; vel = dx * 2 * (rtl() ? 1 : -1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(colour, function (v) { vis = v; colour.classList.toggle('on', v); if (v) kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- services: living tiles, spotlight under the hand, the salon photo leans to it
  var menu = $('[data-menu]');
  watch(menu, function (v) { menu.classList.toggle('on', v); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var tp = $('.t-photo');
  tp.addEventListener('pointermove', function (e) { if (still()) return; var r = tp.getBoundingClientRect(); tp.style.setProperty('--px', (((e.clientX - r.left) / r.width - .5) * -18).toFixed(1) + 'px'); tp.style.setProperty('--py', (((e.clientY - r.top) / r.height - .5) * -14).toFixed(1) + 'px'); });
  tp.addEventListener('pointerleave', function () { tp.style.setProperty('--px', '0px'); tp.style.setProperty('--py', '0px'); });

  // ---------------------------------------------------------------- work: the deck is dealt onto the counter
  var work = $('[data-work]'), deck = $('[data-deck]'), cards = $$('.card', deck), ROT = [-8, 6, -3, 4], tilt = { x: 0, y: 0 };
  var decoded = false;
  function dealDeck(p) {
    var W = deck.clientWidth, Hh = deck.clientHeight, ph = phone();
    var cw = ph ? Math.min(W * .44, Hh * .45 * .8) : Math.min(W * .21, Hh * .86 * .8, 330);
    deck.style.setProperty('--cw', cw.toFixed(0) + 'px');
    var e = still() ? 1 : smooth((p - .08) / .55), side = rtl() ? -1 : 1, ch = cw * 1.25;
    cards.forEach(function (cd, i) {
      var tx, ty, tr;
      if (ph) { tx = ((i % 2) - .5) * cw * 1.08 * side; ty = (Math.floor(i / 2) - .5) * ch * 1.05; tr = (i % 2 ? 2 : -2); }
      else { tx = (i - 1.5) * cw * 1.1 * side; ty = Math.abs(i - 1.5) * 16 - 8; tr = (i - 1.5) * 3.5; }
      var x = lerp(0, tx, e), y = lerp(-i * 4, ty, e), r = lerp(ROT[i], tr, e);
      cd.style.transform = 'translate(-50%,-50%) translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + r.toFixed(2) + 'deg) perspective(900px) rotateY(' + (tilt.x * e).toFixed(2) + 'deg) rotateX(' + (tilt.y * e).toFixed(2) + 'deg)';
      cd.style.zIndex = 10 - i;
    });
    if ((e > .85 || still()) && !decoded) { decoded = true; $$('[data-dec]', deck).forEach(function (f, i) { setTimeout(function () { decode(f, label(f)); }, i * 120); }); }
    if (e < .4 && decoded && !still()) { decoded = false; $$('[data-dec]', deck).forEach(function (f) { f.textContent = ''; }); }
  }
  deck.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = deck.getBoundingClientRect(); tilt.x = ((e.clientX - r.left) / r.width - .5) * 14; tilt.y = -((e.clientY - r.top) / r.height - .5) * 10; tick(); });
  deck.addEventListener('pointerleave', function () { tilt.x = tilt.y = 0; tick(); });

  // ---------------------------------------------------------------- booking: swatches, the comb of days, the sun, the message that writes itself
  var svcs = $$('[data-svc]'), whens = $$('[data-when]'), comb = $('[data-comb]'), steps = $$('[data-step]'), msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false, dayPick = null;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  svcs.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); lightStep(0); write(); }); });
  whens.forEach(function (b) { b.addEventListener('click', function () { whens.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lightStep(1); write(); }); });
  function buildComb() {
    var l = he(), n = (window.__now || now()).d;
    if (dayPick === null) { dayPick = n; var k = 0; while (!H[dayPick] && k++ < 7) dayPick = (dayPick + 1) % 7; }
    comb.setAttribute('role', 'radiogroup');
    comb.innerHTML = [0, 1, 2, 3, 4, 5, 6].map(function (d) {
      var closed = !H[d];
      return '<button type="button" role="radio" data-day="' + d + '" aria-checked="' + (d === dayPick) + '"' + (closed ? ' disabled' : '') + ' aria-label="' + (l ? dayHe[d] : dayEn[d]) + (closed ? (l ? ', סגור' : ', closed') : '') + '">' + (l ? dayHeS[d] : dayEnS[d]) + (closed ? '<small>' + (l ? 'סגור' : 'closed') + '</small>' : '') + '</button>';
    }).join('');
    $$('button', comb).forEach(function (b) { b.addEventListener('click', function () { dayPick = +b.dataset.day; $$('button', comb).forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lightStep(1); write(); }); });
  }
  $('[data-send]').addEventListener('pointerenter', function () { lightStep(2); });
  $('[data-send]').addEventListener('focus', function () { lightStep(2); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = svcs.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.dataset[l ? 'he' : 'en']; });
    var w = whens.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0].dataset[l ? 'he' : 'en'];
    var day = l ? 'ביום ' + dayHe[dayPick] : 'on ' + dayEn[dayPick];
    return l ? 'היי לילי, אשמח לקבוע תור ל' + (picked.length ? list(picked, true) : 'תספורת') + ', ' + day + ' ' + w + '. תודה.'
             : 'Hi Lili, I’d like to book ' + (picked.length ? list(picked, false) : 'a haircut') + ', ' + day + ' ' + w + '. Thank you.';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; lightStep(0); shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (300 + i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { requestAnimationFrame(function () { roll(o, true); }); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- reviews drift, visit photo closes into its frame, footer curtain
  var revs = $('[data-reviews]'), drift = $('[data-drift]');
  var visit = $('[data-visit]'), vphoto = $('[data-vphoto]'), vwrap = $('.v-wrap'), rows = $$('[data-rows] > *');
  var foot = $('[data-foot]'), fglow = $('.f-glow'), halo = $('.halo span'), strand = $('[data-strand]'), dock = $('[data-dock]');
  var wm = $('[data-wordmark]');
  $$('span[lang]', wm).forEach(function (sp) { sp.innerHTML = sp.textContent.split('').map(function (c, i) { return '<span class="ch" style="--i:' + i + '">' + c + '</span>'; }).join(''); });
  watch(foot, function (v) { if (v) foot.classList.add('in'); }, { threshold: .25 });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // hero reel: on wide screens the scroll carries her work through the mirror
    if (!phone() && !calm) {
      var hp = prog(hero), f = clamp(hp * 1.12, 0, 1) * 3;
      reel.classList.remove('auto'); reel.style.setProperty('--ry', (-f * 25).toFixed(3) + '%');
      caption(false, Math.min(3, Math.round(f)));
    } else { reel.classList.add('auto'); if (calm) { reel.style.setProperty('--ry', (-autoIdx * 25) + '%'); } }
    // colour halo rises
    var cr = colour.getBoundingClientRect(), cp = calm ? 1 : smooth((vh - cr.top) / (vh * 1.1));
    halo.style.setProperty('--rise', ((1 - cp) * 120).toFixed(1) + 'px');
    // the strand draws itself across the seam; the gloss slides along it
    var sr = strand.getBoundingClientRect(), sp = calm ? 1 : clamp((vh - sr.top) / (vh * .75), 0, 1);
    strand.style.setProperty('--draw', (1 - smooth(sp)).toFixed(4));
    strand.style.setProperty('--glide', (calm ? -.5 : -sp * 1.2 + .1).toFixed(4));
    // deck
    dealDeck(calm ? 1 : prog(work));
    // reviews drift
    if (!calm) {
      var rr = revs.getBoundingClientRect(), rp = clamp((vh - rr.top) / (vh + rr.height), 0, 1), span = Math.max(0, drift.scrollWidth - innerWidth);
      var dx = lerp(0, span, smooth(rp * 1.15 - .05)) * (rtl() ? 1 : -1);
      drift.style.setProperty('--dx', dx.toFixed(1) + 'px');
    } else drift.style.setProperty('--dx', '0px');
    // visit: the alley photo starts full-width and closes into its frame
    if (!calm) {
      var vr = vwrap.getBoundingClientRect(), vp = smooth((vh - vr.top) / (vh * .85)), W = vwrap.clientWidth;
      var pw = vphoto.offsetWidth, grow = (1 - vp);
      // the photo reaches outward toward the far edge, then gathers back into its column
      var reach = (W - pw) * grow;
      vphoto.style.marginInlineEnd = (-reach).toFixed(1) + 'px';
      vphoto.style.zIndex = grow > .02 ? 3 : '';
      rows.forEach(function (r, i) { var v = smooth((vp - .55 - i * .06) / .3); r.style.setProperty('--o', v.toFixed(3)); r.style.setProperty('--oy', ((1 - v) * 26).toFixed(1) + 'px'); });
    } else { vphoto.style.marginInlineEnd = ''; vphoto.style.zIndex = ''; rows.forEach(function (r) { r.style.removeProperty('--o'); r.style.removeProperty('--oy'); }); }
    // footer horizon
    var mb = $('main').getBoundingClientRect().bottom, fp = calm ? 1 : smooth((vh - mb) / foot.offsetHeight);
    fglow.style.setProperty('--rise', ((1 - fp) * 120).toFixed(1) + 'px');
    // the phone dock steps aside over the footer, where the same buttons are
    dock.classList.toggle('hide', mb < vh * .55);
  }

  function layout() {
    glints.size();
    foot.classList.toggle('curtain', foot.offsetHeight < innerHeight * .92);
    tick();
  }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); buildComb(); write(true); caption(true, 0); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); glints.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 900);
  addEventListener('load', function () { layout(); });
})();
