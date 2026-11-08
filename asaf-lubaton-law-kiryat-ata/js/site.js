(function () {
  var root = document.documentElement, WA = '972524339395';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 760; };
  var hoverable = matchMedia('(hover: hover)').matches;
  var TITLE = { he: 'עו״ד אסף לובטון · עורך דין · דרך חיפה 16, קריית אתא', en: 'Asaf Lubaton, Adv. · Attorney · 16 Derech Haifa, Kiryat Ata' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור עורך דין אסף לובטון · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Asaf Lubaton, Adv. · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'עורך דין אסף לובטון', 'Asaf Lubaton, Adv.');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-call]', 'התקשרו לאסף, 052-433-9395', 'Call Asaf, 052-433-9395');
    aria('[data-t-words]', 'מקצועי, יסודי, אכפתי', 'Professional, thorough, caring');
    aria('[data-t-topic]', 'נושא', 'Topic');
    aria('[data-t-5]', '5 כוכבים', '5 stars');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: דרך חיפה 16, קריית אתא' : 'Map: 16 Derech Haifa, Kiryat Ata'; });
    $$('[data-decode]').forEach(function (b) { b.textContent = b.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('al-lang', l); } catch (e) {}
    texts(l); split(); hours(); note(true); fitMark(); frame();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('al-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    if (!on) { deal(true); } dust.kick(); note(true); frame();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed, [0,24] = around the clock
  var H = { 0: [0, 24], 1: [0, 24], 2: [0, 24], 3: [0, 24], 4: [0, 24], 5: [8, 15], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  var allDay = function (t) { return t && t[0] === 0 && t[1] === 24; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function opensAt(t, l) { return t[0] === 0 ? (l ? 'בחצות' : 'at midnight') : (l ? 'ב-' : 'at ') + hhmm(t[0]); }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && n.h >= t[0] && n.h < t[1]) {
      open = true;
      var nx = H[(n.d + 1) % 7];
      txt = allDay(t) ? (l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours') : (l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]));
      if (allDay(t) && !(nx && nx[0] === 0)) txt = l ? 'פתוח עכשיו · עד חצות' : 'Open now · until midnight';
    } else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ' + opensAt(t, l) : 'Closed now · opens today ' + opensAt(t, l);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ' + opensAt(H[nd], l) : 'Closed now · opens tomorrow ' + opensAt(H[nd], l))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ' + opensAt(H[nd], l) : 'Closed now · opens ' + dayEn[nd] + ' ' + opensAt(H[nd], l));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
    // the dial: today's open hours as an arc, the hand at the current hour
    var arc = $('[data-arc]'), hand = $('[data-hand]');
    if (arc) {
      arc.setAttribute('stroke-dasharray', t ? ((t[1] - t[0]) / 24 * 100).toFixed(1) + ' 100' : '0 100');
      arc.setAttribute('stroke-dashoffset', t ? (-t[0] / 24 * 100).toFixed(1) : '0');
      hand.style.transform = 'rotate(' + (n.h / 24 * 360).toFixed(1) + 'deg)';
      $('[data-today]').textContent = !t ? (l ? 'היום סגור' : 'Closed today') : allDay(t) ? (l ? 'היום: 24 שעות' : 'Today: 24 hours') : (l ? 'היום: ' : 'Today: ') + hhmm(t[0]) + '–' + hhmm(t[1]);
    }
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : allDay(t) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('[data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); onIn(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : (el.classList.add('in'), onIn(el)); });
  function onIn(el) {
    if (el.classList.contains('sheet')) decode();
    $$('[data-odo]', el).forEach(odo);
    var st = $('[data-fillstars]', el); if (st) $$('svg', st).forEach(function (s, i) { setTimeout(function () { s.classList.add('on'); }, still() ? 0 : 500 + i * 140); });
  }

  // ---------------------------------------------------------------- letters: headline out of a blur, footer name rising
  function split() {
    $$('[data-split] .ln span[lang], [data-mark] span[lang]').forEach(function (sp) {
      if (sp.dataset.done) return; sp.dataset.done = 1;
      var i = sp.closest('.acc') ? 11 : 0;
      sp.innerHTML = sp.textContent.split(' ').map(function (w) {
        return '<span class="w" style="display:inline-block;white-space:nowrap">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  }
  split();

  // ---------------------------------------------------------------- glyph decode: his clients' three words settle out of scrambled letters
  var decoded = false;
  function decode() {
    if (decoded) return; decoded = true;
    if (still()) return;
    var pool = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHIKLMNOPRSTUVWXYZ' };
    $$('[data-decode]').forEach(function (b, k) {
      var t0 = performance.now() + k * 260, dur = 900;
      (function step(nw) {
        var l = root.lang, word = b.dataset[l], p = clamp((nw - t0) / dur, 0, 1), n = Math.floor(p * word.length), s = word.slice(0, n), P = pool[l];
        for (var i = n; i < word.length; i++) s += P[Math.floor(Math.random() * P.length)];
        b.textContent = nw < t0 ? b.textContent : s;
        if (p < 1) requestAnimationFrame(step); else b.textContent = b.dataset[root.lang];
      })(performance.now());
    });
  }

  // ---------------------------------------------------------------- odometer figures
  function odo(el) {
    if (el.dataset.ran) return; el.dataset.ran = 1;
    var end = parseFloat(el.dataset.odo), dec = (el.dataset.odo.split('.')[1] || '').length;
    if (still()) { el.textContent = end.toFixed(dec); return; }
    var t0 = performance.now(), dur = 1400;
    (function step(nw) { var p = clamp((nw - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = (end * e).toFixed(dec); if (p < 1) requestAnimationFrame(step); })(t0);
  }
  $$('.rv-side [data-odo]').forEach(function (el) { watch(el, function (v) { if (v) odo(el); }); });

  // ---------------------------------------------------------------- hero: photos dealt like files, fanned behind the logo plate
  var hero = $('[data-hero]'), stage = $('[data-stage]'), plate = $('[data-plate]'), cards = $$('[data-fan] .card');
  var tx = 0, ty = 0, cx = 0, cy = 0, spread = 0;
  function deal(instant) {
    if (instant || still()) { spread = 1; cards.forEach(function (c) { c.style.setProperty('--dy', '0px'); c.style.opacity = 1; }); stage.style.setProperty('--spread', 1); return; }
    cards.forEach(function (c, i) {
      c.style.setProperty('--dy', '120vh'); c.style.opacity = 0;
      setTimeout(function () {
        var t0 = performance.now(), from = innerHeight * 1.1;
        (function step(nw) { var p = clamp((nw - t0) / 760, 0, 1), e = 1 - Math.pow(1 - p, 3); c.style.setProperty('--dy', ((1 - e) * from).toFixed(1) + 'px'); c.style.opacity = Math.min(1, p * 2.5); if (p < 1) requestAnimationFrame(step); })(t0);
      }, 120 + i * 110);
    });
    var s0 = performance.now() + 900;
    (function sp(nw) { var p = clamp((nw - s0) / 900, 0, 1); spread = smooth(p); stage.style.setProperty('--spread', spread.toFixed(3)); if (p < 1) requestAnimationFrame(sp); })(performance.now());
  }
  stage.style.setProperty('--spread', 0);
  deal(false);
  if (hoverable) hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - .5; ty = (e.clientY - r.top) / r.height - .5; });
  hero.addEventListener('pointerleave', function () { tx = ty = 0; });
  var heroVis = true; watch(hero, function (v) { heroVis = v; if (v) dust.kick(); tilt(); });
  var tiltRaf = 0;
  function tilt() {
    if (tiltRaf) return;
    tiltRaf = requestAnimationFrame(function loop(nw) {
      tiltRaf = 0;
      if (still()) { plate.style.removeProperty('--rx'); plate.style.removeProperty('--ry'); stage.style.setProperty('--turn', 0); plate.style.setProperty('--sx', '-10%'); return; }
      var T = nw / 1000, ax = tx, ay = ty;
      if (!hoverable) { ax = Math.sin(T * .7) * .35; ay = Math.cos(T * .5) * .2; }
      cx += (ax - cx) * .08; cy += (ay - cy) * .08;
      var sc = clamp(-hero.getBoundingClientRect().top / hero.offsetHeight, 0, 1);
      plate.style.setProperty('--ry', (cx * 22).toFixed(2) + 'deg');
      plate.style.setProperty('--rx', (-cy * 16).toFixed(2) + 'deg');
      $('.sheen', plate).style.setProperty('--sx', (cx * 120 - 10).toFixed(1) + '%');
      stage.style.setProperty('--turn', (cx * 10 + sc * 18).toFixed(2));
      if (heroVis) tiltRaf = requestAnimationFrame(loop);
    });
  }
  tilt();

  // ---------------------------------------------------------------- silver dust drifting across the hero, parting around the hand
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, mx = -999, my = -999;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 70 : 150; P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 1.8, vx: -.1 + Math.random() * .2, vy: -.15 - Math.random() * .25, a: .2 + Math.random() * .6, ph: Math.random() * 6.28 });
      draw(0);
    }
    function draw(T) {
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], tw = .55 + .45 * Math.sin(T * 1.6 + p.ph);
        c.globalAlpha = p.a * tw; c.fillStyle = i % 4 ? '#dfe6ef' : '#9fd0f5';
        c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
      }
      c.globalAlpha = 1;
    }
    function frame(nw) {
      raf = 0; if (still() || !heroVis) return;
      for (var i = 0; i < P.length; i++) {
        var p = P[i], dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { var f = (14000 - d2) / 14000 * .9, d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f; }
        p.vx = p.vx * .94 + (-.05 + Math.sin(nw / 3000 + p.ph) * .08) * .06; p.vy = p.vy * .94 - .02;
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; } if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
      }
      draw(nw / 1000); raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- the scales from his logo, weighed by the hand (or by themselves on a phone)
  var scaleTile = $('.t-scale'), beam = $('[data-beam]'), pans = $$('[data-pan]'), sTarget = 0, sNow = 0, sRaf = 0, sVis = false;
  if (hoverable) scaleTile.addEventListener('pointermove', function (e) { var r = scaleTile.getBoundingClientRect(); sTarget = ((e.clientX - r.left) / r.width - .5) * 2; });
  scaleTile.addEventListener('pointerleave', function () { sTarget = 0; });
  scaleTile.addEventListener('click', function () { sTarget = sTarget > 0 ? -1 : 1; setTimeout(function () { sTarget = 0; }, 900); });
  watch(scaleTile, function (v) { sVis = v; sKick(); });
  function sKick() { if (!sRaf) sRaf = requestAnimationFrame(sFrame); }
  function sFrame(nw) {
    sRaf = 0;
    var tgt = still() ? 0 : sTarget + (hoverable ? 0 : Math.sin(nw / 1400) * .5);
    sNow += (tgt - sNow) * .06;
    var a = sNow * 9;
    beam.style.transform = 'rotate(' + a.toFixed(2) + 'deg)';
    pans.forEach(function (p) { var x = p.dataset.pan === 'l' ? 42 : 178; p.style.transformOrigin = x + 'px 44px'; p.style.transform = 'rotate(' + (-a).toFixed(2) + 'deg)'; });
    if (sVis && !still()) sRaf = requestAnimationFrame(sFrame);
  }

  // ---------------------------------------------------------------- bento spotlight under the cursor
  if (hoverable) $$('[data-tile]').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- composer: the note writes itself on his letterhead, then opens WhatsApp
  var form = $('[data-form]'), noteEl = $('[data-note]'), send = $('[data-send]'), topic = 'estate', typed = '', typeTimer = 0;
  var TOP = {
    he: { estate: 'אני פונה בעניין עסקת נדל״ן.', 'case': 'אני פונה בעניין תיק משפטי.', q: 'יש לי שאלה משפטית.' },
    en: { estate: 'I’m writing about a real estate deal.', 'case': 'I’m writing about a legal case.', q: 'I have a legal question.' }
  };
  function message() {
    var l = root.lang, n = form.n.value.trim(), m = form.m.value.trim();
    if (l === 'he') return 'שלום אסף,' + (n ? ' כאן ' + n + '.' : '') + '\n' + TOP.he[topic] + (m ? '\n' + m : '') + '\nאשמח שנדבר.';
    return 'Hi Asaf,' + (n ? ' this is ' + n + '.' : '') + '\n' + TOP.en[topic] + (m ? '\n' + m : '') + '\nI’d be glad to talk.';
  }
  function note(instant) {
    var msg = message();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
    clearTimeout(typeTimer);
    if (instant || still()) { typed = msg; noteEl.textContent = msg; return; }
    var k = 0; while (k < typed.length && typed[k] === msg[k]) k++;
    typed = typed.slice(0, k);
    (function step() { if (typed.length < msg.length) { typed = msg.slice(0, typed.length + 1); noteEl.textContent = typed; typeTimer = setTimeout(step, 22); } })();
  }
  $$('[data-topic]').forEach(function (b) { b.addEventListener('click', function () {
    topic = b.dataset.topic; $$('[data-topic]').forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); note();
  }); });
  $$('[data-in]').forEach(function (i) { i.addEventListener('input', function () { note(); }); });
  var noteShown = false; watch(noteEl, function (v) { if (v && !noteShown) { noteShown = true; typed = ''; note(); } });
  note(true); noteEl.textContent = '';

  // ---------------------------------------------------------------- footer wordmark fitted to its width
  var mark = $('[data-mark]');
  function fitMark() {
    mark.style.fontSize = '100px';
    var w = mark.parentElement.clientWidth, sw = mark.scrollWidth || 1;
    mark.style.fontSize = Math.min(260, Math.floor(100 * w / sw * .98)) + 'px';
  }

  // ---------------------------------------------------------------- the scroll loop: nav, dock, keyway, letters, shrink, curtain
  var nav = $('[data-nav]'), dock = $('[data-dock]'), kw = $('[data-keyway]'), stg = $('.kw-stage', kw), key = $('[data-key]'), kph = $('[data-kwphoto]');
  var letters = $$('.letter'), shrink = $('[data-shrink]'), foot = $('[data-foot]'), raf = 0;
  function frame() {
    raf = 0;
    var vh = innerHeight, y = scrollY;
    nav.classList.toggle('pill', y > 40);
    dock.classList.toggle('on', y > hero.offsetHeight * .7);
    var calm = still();

    // keyway: the key flies in, turns, clicks; the keyhole opens onto Kiryat Ata
    var r = kw.getBoundingClientRect(), p = calm ? 1 : clamp(-r.top / (r.height - vh), 0, 1);
    var a = smooth(seg(p, 0, .34)), t = smooth(seg(p, .36, .52)), o = seg(p, .56, .92), oe = o * o * o;
    var esc = phone() ? 120 : 150;
    stg.style.setProperty('--ks', (3.2 - 2.58 * a).toFixed(3));
    stg.style.setProperty('--kb', ((1 - a) * 10).toFixed(1) + 'px');
    stg.style.setProperty('--ko', (Math.min(1, .45 + a * 1.2) * (1 - seg(p, .6, .7))).toFixed(3));
    var click = p > .52 && p < .56 ? Math.sin(seg(p, .52, .56) * Math.PI) * 4 : 0;
    stg.style.setProperty('--kr', (t * 90 + click).toFixed(2) + 'deg');
    stg.style.setProperty('--ky', (-41 * a).toFixed(1) + 'px');
    stg.style.setProperty('--fade', seg(p, .5, .62).toFixed(3));
    stg.style.setProperty('--eo', (1 - seg(p, .6, .74)).toFixed(3));
    var big = Math.max(innerWidth, vh) * 9;
    kph.style.setProperty('--ms', (o <= 0 ? 0 : esc * 0.8 + oe * big).toFixed(1) + 'px');
    kph.classList.toggle('full', o >= .999);
    stg.style.setProperty('--ps', (1.25 - .25 * o).toFixed(3));
    var co = seg(p, .84, .97);
    stg.style.setProperty('--co', co.toFixed(3));
    stg.style.setProperty('--seam', smooth(co).toFixed(3));

    // letters: each one already landed shrinks back a little as the next lands on it
    if (!calm) letters.forEach(function (L, i) {
      var nx = letters[i + 1], s = 1;
      if (nx) { var d = nx.getBoundingClientRect().top - L.getBoundingClientRect().top; s = 1 - .05 * clamp(1 - (d - 20) / (L.offsetHeight || 1), 0, 1); }
      var lr = L.getBoundingClientRect(), tilt = clamp((lr.top - vh * .55) / vh, 0, 1) * (i % 2 ? 3 : -3);
      L.style.setProperty('--sc', s.toFixed(3)); L.style.setProperty('--tilt', tilt.toFixed(2) + 'deg');
    });

    // the office photo shrinks from full bleed into its frame
    if (!calm) {
      var sr = shrink.getBoundingClientRect(), q = smooth(clamp((vh - sr.top) / (vh * .9), 0, 1));
      var mm = Math.min(Math.max(16, innerWidth * .03), 44);
      shrink.style.setProperty('--cx', (q * (mm + innerWidth * .06)).toFixed(1) + 'px');
      shrink.style.setProperty('--ci', (q * 30).toFixed(1) + 'px');
      shrink.style.setProperty('--cr', (q * 22).toFixed(1) + 'px');
    }

    // curtain: the footer's name rises as the page lifts off it
    var fr = foot.getBoundingClientRect();
    foot.style.setProperty('--fp', calm ? 1 : smooth(clamp((vh - fr.top) / (fr.height * .8), 0, 1)).toFixed(3));
  }
  function req() { if (!raf) raf = requestAnimationFrame(frame); }
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', function () { dust.size(); fitMark(); req(); });

  texts(root.lang); hours(); dust.size(); dust.kick(); fitMark(); frame();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitMark(); });
})();
