(function () {
  'use strict';
  var root = document.documentElement, WA = '972524656699';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth <= 900; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('option[data-he]').forEach(function (o) { o.textContent = o.dataset[l]; });
    $$('[data-ph-he]').forEach(function (i) { i.placeholder = i.dataset[l === 'he' ? 'phHe' : 'phEn']; });
    $$('[data-aria-he]').forEach(function (a) { a.setAttribute('aria-label', a.dataset[l === 'he' ? 'ariaHe' : 'ariaEn']); });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-step="-1"]', 'הסעיף הקודם', 'Previous clause'); aria('[data-step="1"]', 'הסעיף הבא', 'Next clause');
    aria('[data-flags]', 'סעיפים', 'Clauses'); aria('[data-t-nav]', 'ראשי', 'Main');
    document.title = l === 'he' ? 'עו״ד אילנית מויאל בנימין · הרצל 10, טירת כרמל' : 'Adv. Ilanit Moyal Binyamin · 10 Herzl St, Tirat Carmel';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('imb-lang', l); } catch (e) {}
    try { var u = new URL(location.href); if (l === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang'); history.replaceState(null, '', u); } catch (e) {}
    texts(l); hours(); plainShow(cur, true); flaps.reset(); write(); layout(); tick();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(); root.classList.toggle('still', !on);
    try { localStorage.setItem('imb-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('.rv').forEach(function (r) { r.classList.add('lit'); });
    flaps.reset(); layout(); tick(); lamp.kick(); dust.kick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours + live status (Asia/Jerusalem); null = closed
  var H = { 0: [9, 18], 1: [9, 18], 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [8, 12], 6: null };
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
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('.t-now').forEach(function (el) { el.classList.toggle('open', open); });
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
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  $$('.rv').forEach(function (r) { watch(r, function (v) { if (v) r.classList.add('lit'); }, { threshold: .55 }); });

  // ---------------------------------------------------------------- the name, letter by letter
  function split(sel) {
    $$(sel).forEach(function (sp) {
      var i = 0;
      sp.innerHTML = sp.textContent.split(' ').map(function (w) {
        return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  }
  split('[data-split] .ln > span[lang]');
  split('[data-fit] > span[lang]');
  var hero = $('[data-hero]');
  requestAnimationFrame(function () { setTimeout(function () { hero.classList.add('ready'); }, 60); });

  // ---------------------------------------------------------------- hero: the lamp follows the hand; drifts by itself on phones
  var lamp = (function () {
    var x = .62, y = .42, tx = .62, ty = .42, hand = 0, vis = true, raf = 0, t0 = performance.now();
    function frame(t) {
      raf = 0; if (still() || !vis) return;
      if (performance.now() - hand > 2500) { var s = (t - t0) / 1000; tx = .55 + Math.sin(s * .42) * .26; ty = .42 + Math.sin(s * .67 + 1) * .16; }
      x = lerp(x, tx, .06); y = lerp(y, ty, .06);
      hero.style.setProperty('--lx', (x * 100).toFixed(2) + '%'); hero.style.setProperty('--ly', (y * 100).toFixed(2) + '%');
      dust.light(x, y);
      raf = requestAnimationFrame(frame);
    }
    function point(e) { var r = hero.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; hand = performance.now(); }
    hero.addEventListener('pointermove', point);
    hero.addEventListener('pointerdown', point);
    function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); }
    watch(hero, function (v) { vis = v; kick(); });
    return { kick: kick };
  })();

  // dust in the lamp's light
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), P = [], w = 0, h = 0, lx = .6, ly = .4, vis = true, raf = 0;
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    for (var i = 0; i < 90; i++) P.push({ x: Math.random(), y: Math.random(), r: .5 + Math.random() * 1.8, v: .00006 + Math.random() * .00018, p: Math.random() * 6.3 });
    function frame(t) {
      raf = 0; c.clearRect(0, 0, w, h); if (still() || !vis) return;
      var R = Math.min(w * .46, 520);
      P.forEach(function (p) {
        p.y -= p.v * 16; if (p.y < -.02) { p.y = 1.02; p.x = Math.random(); }
        var px = (p.x + Math.sin(t / 2400 + p.p) * .01) * w, py = p.y * h;
        var d = Math.hypot(px - lx * w, py - ly * h) / R, a = clamp(1 - d, 0, 1);
        if (a <= .02) return;
        c.globalAlpha = a * .85; c.fillStyle = '#f3dfb0';
        c.beginPath(); c.arc(px, py, p.r, 0, 6.283); c.fill();
      });
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); else if (still()) c.clearRect(0, 0, w, h); }
    watch(hero, function (v) { vis = v; kick(); });
    return { size: size, kick: kick, light: function (x, y) { lx = x; ly = y; } };
  })();

  // ---------------------------------------------------------------- the fine print: loupe, flags, plain words
  var plain = $('[data-plain]'), sheet = $('[data-sheet]'), sheetIn = $('[data-sheetin]'), loupe = $('[data-loupe]'), glass = $('[data-glass]');
  var clauses = $$('.cl', sheetIn), flagsEls = $$('[data-flag]'), dots = $$('[data-dots] i');
  var clone = sheetIn.cloneNode(true); clone.removeAttribute('data-sheetin'); clone.setAttribute('aria-hidden', 'true'); glass.appendChild(clone);
  var cloneCl = $$('.cl', clone), Z = 1.75, L = 150, cur = 0, geo = [];
  var PLAIN = [
    { he: ['ירושה', 'יש עיזבון, יש יורשים, ויש כספים שעוד לא נמצאו.'], en: ['Inheritance', 'There is an estate, there are heirs, and money not yet found.'] },
    { he: ['רכישת דירה', 'הדירה נקייה מחובות, והמפתח עובר אליכם עם התשלום המלא.'], en: ['Buying a home', 'The apartment is free of debts, and the key is yours with the full payment.'] },
    { he: ['ייצוג', 'מבקשים מבית המשפט לקבל את התביעה ולחייב את הצד השני בהוצאות.'], en: ['Representation', 'Asking the court to accept the claim and make the other side pay the costs.'] }
  ];
  var pok = $('[data-pok]'), pov = $('[data-pov]'), decodeT = 0;
  function decode(el, txt, instant) {
    if (instant || still()) { el.textContent = txt; return; }
    var pool = he() ? 'אבגדהוזחטיכלמנסעפצקרשת' : 'abcdefghijklmnopqrstuvwxyz', t0 = performance.now(), dur = 520;
    (function st(t) {
      var k = clamp((t - t0) / dur, 0, 1), n = Math.floor(txt.length * k);
      el.textContent = txt.slice(0, n) + txt.slice(n).replace(/\S/g, function () { return pool[Math.floor(Math.random() * pool.length)]; });
      if (k < 1) decodeT = requestAnimationFrame(st);
    })(t0);
  }
  function plainShow(i, instant) {
    var d = PLAIN[i][he() ? 'he' : 'en'];
    cancelAnimationFrame(decodeT); decode(pok, d[0], instant); setTimeout(function () { decode(pov, d[1], instant); }, instant ? 0 : 90);
    flagsEls.forEach(function (f, k) { f.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
  }
  function setStage(i, instant) {
    i = clamp(i, 0, 2);
    clauses.forEach(function (c, k) { c.classList.toggle('on', k === i); });
    cloneCl.forEach(function (c, k) { c.classList.toggle('on', k === i); });
    if (i !== cur || instant) { cur = i; plainShow(i, instant); }
  }
  function lensGeo() {
    L = phone() ? 112 : 150; loupe.style.setProperty('--L', L + 'px');
    clone.style.width = sheetIn.offsetWidth + 'px';
    geo = clauses.map(function (c) { return { top: c.offsetTop, h: c.offsetHeight }; });
  }
  function lensAt(i, t) {
    var g = geo[i], W = sheetIn.offsetWidth, SH = sheet.clientHeight, CH = sheetIn.offsetHeight;
    var y = g.top + 14 + (g.h - 28) * t, pad = L * .55, amp = Math.max(0, W / 2 - pad);
    var x = W / 2 + amp * Math.cos(t * Math.PI * 2) * (rtl() ? 1 : -1);
    var off = clamp(y - SH / 2, 0, Math.max(0, CH - SH));
    sheetIn.style.transform = off ? 'translate3d(0,' + (-off).toFixed(1) + 'px,0)' : '';
    loupe.style.transform = 'translate3d(' + (x - L / 2).toFixed(1) + 'px,' + (y - off - L / 2).toFixed(1) + 'px,0)';
    clone.style.transform = 'translate3d(' + (L / 2 - x * Z).toFixed(1) + 'px,' + (L / 2 - y * Z).toFixed(1) + 'px,0) scale(' + Z + ')';
  }
  function goStage(i) {
    i = clamp(i, 0, 2);
    if (still()) { setStage(i); lensAt(i, .5); return; }
    var r = plain.getBoundingClientRect(), span = plain.offsetHeight - innerHeight;
    scrollTo({ top: scrollY + r.top + span * ((i + .12) / 3) + 2, behavior: 'smooth' });
  }
  flagsEls.forEach(function (f) { f.addEventListener('click', function () { goStage(+f.dataset.flag); }); });
  $$('[data-step]').forEach(function (b) { b.addEventListener('click', function () { goStage(cur + (+b.dataset.step)); }); });

  // ---------------------------------------------------------------- tiles: lamp under the hand, the key tilts toward it
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  $$('[data-tilt]').forEach(function (el) {
    var host = el.closest('.tile') || el;
    host.addEventListener('pointermove', function (e) { if (still() || e.pointerType !== 'mouse') return; var r = host.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5; $('img', el).style.transform = 'scale(1.08) translate(' + (dx * -14).toFixed(1) + 'px,' + (dy * -10).toFixed(1) + 'px) rotate(' + (dx * 2).toFixed(2) + 'deg)'; });
    host.addEventListener('pointerleave', function () { $('img', el).style.transform = ''; });
  });

  // odometer figures
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="sep">' + ch + '</span>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span></span></span>';
    }).join('');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    if (still() || !io) { roll(o, true); return; }
    roll(o, false);
    new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .4 }).observe(o);
  });

  // ---------------------------------------------------------------- the door plate catches the light; clients' words flip
  var plateW = $('[data-plate]'), plate = $('.plate', plateW);
  plateW.addEventListener('pointermove', function (e) { if (still() || e.pointerType !== 'mouse') return; var r = plateW.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5; plate.style.setProperty('--ry', (dx * 10).toFixed(2) + 'deg'); plate.style.setProperty('--rx', (dy * -8).toFixed(2) + 'deg'); });
  plateW.addEventListener('pointerleave', function () { plate.style.setProperty('--ry', '0deg'); plate.style.setProperty('--rx', '0deg'); });
  watch(plateW, function (v) { plate.classList.toggle('sweep', v); });
  var flaps = (function () {
    var W = {
      he: ['מקצוענית', 'אנושיות', 'מסירות', 'אמינות', 'בנועם', 'בסבלנות', 'בשקיפות', 'באדיבות', 'בגובה העיניים', 'הוגנת', 'ליווי אישי', 'ידע נרחב'],
      en: ['professional', 'humane', 'dedicated', 'reliable', 'kindly', 'patiently', 'transparently', 'courteously', 'at eye level', 'fair', 'personal guidance', 'broad knowledge']
    };
    var line = $('.flapline'), slots = $$('[data-flap]'), k = 0, timer = 0, vis = false;
    function list() { return W[he() ? 'he' : 'en']; }
    function reset() {
      clearInterval(timer);
      if (still()) { line.innerHTML = list().map(function (w) { return '<span class="flap">' + w + '</span>'; }).join(''); return; }
      if ($$('.flap', line).length !== 3) line.innerHTML = '<span class="flap" data-flap="0"></span><span class="flap" data-flap="1"></span><span class="flap" data-flap="2"></span>';
      slots = $$('[data-flap]'); k = 3;
      slots.forEach(function (s, i) { s.textContent = list()[i]; });
      timer = setInterval(function () { if (!vis || still()) return; var s = slots[k % 3]; decode(s, list()[k % list().length]); k++; }, 1700);
    }
    watch(line, function (v) { vis = v; });
    return { reset: reset };
  })();

  // ---------------------------------------------------------------- write: the blanks are the message
  var form = $('[data-form]'), marks = $$('[data-marks] li'), send = $('[data-send]');
  var q = function (n) { return $('[data-q="' + n + '"]', form); };
  function pick(n) { var s = q(n); return s.options[s.selectedIndex].dataset[he() ? 'he' : 'en']; }
  function lightStep(n) { marks.forEach(function (m, i) { if (i <= n) m.classList.add('on'); }); }
  function write() {
    var name = q('name').value.trim(), l = he(), stage = pick('stage');
    var msg = l ? 'שלום אילנית, אני פונה אלייך לגבי ' + pick('topic') + '. ' + stage + '. אשמח ' + pick('ask') + '.' + (name ? ' שמי ' + name + '.' : '')
                : 'Hello Ilanit, I’m writing about ' + pick('topic') + '. ' + stage + '. I’d like ' + pick('ask') + '.' + (name ? ' My name is ' + name + '.' : '');
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
  }
  $$('select,input', form).forEach(function (el) {
    el.addEventListener('change', function () { var b = el.closest('.blank'); b.classList.remove('inked'); void b.offsetWidth; b.classList.add('inked'); lightStep(el.dataset.q === 'topic' ? 0 : 1); write(); });
    el.addEventListener('input', write);
  });
  q('name').addEventListener('input', function () { lightStep(1); });
  ['pointerenter', 'focus'].forEach(function (ev) { send.addEventListener(ev, function () { lightStep(2); }); });

  // ---------------------------------------------------------------- reviews rail runs sideways with the scroll (wide screens)
  var revs = $('[data-revs]'), rail = $('[data-rail]'), travel = 0;
  // ---------------------------------------------------------------- office, footer, nav, dock
  var owrap = $('[data-owrap]'), ostage = $('.o-stage', owrap), ophoto = $('[data-ophoto]'), ocap = $('[data-ocap]'), orim = $('[data-orim]');
  var foot = $('[data-foot]'), fname = $('[data-fit]'), fh = $('.f-horizon'), nav = $('[data-nav]'), dock = $('[data-dock]');
  dock.classList.add('hide');
  watch($('[data-hacts]'), function (v) { dock.classList.toggle('hide', v); });
  watch(fname, function (v) { if (v) fname.classList.add('up'); }, { threshold: .3 });
  function fit() {
    fname.style.fontSize = '80px';
    var w = fname.scrollWidth || 1, avail = foot.clientWidth - 2 * parseFloat(getComputedStyle(foot).paddingLeft);
    fname.style.fontSize = Math.min(240, 80 * avail / w * .98).toFixed(1) + 'px';
  }

  function layout() {
    dust.size(); lensGeo(); fit();
    var scrub = !still() && innerWidth > 760;
    revs.classList.toggle('scrub', scrub);
    rail.style.transform = '';
    travel = scrub ? Math.max(0, rail.scrollWidth - rail.clientWidth) : 0;
    revs.style.height = scrub ? (innerHeight + travel) + 'px' : '';
    owrap.style.height = still() ? '' : (innerHeight * 2.2) + 'px';
    if (still()) { sheetIn.style.transform = ''; ophoto.style.clipPath = ''; }
    setStage(cur, true); if (still()) lensAt(cur, .5);
  }

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // the loupe reads down the sheet
    if (!calm) {
      var p = prog(plain) * 3, i = Math.min(2, Math.floor(p)), t = smooth(p - i);
      if (p >= 3) { i = 2; t = 1; }
      setStage(i); lensAt(i, t);
    }
    // reviews rail
    if (travel) rail.style.transform = 'translate3d(' + ((rtl() ? 1 : -1) * prog(revs) * travel).toFixed(1) + 'px,0,0)';
    // the Carmel opens out of the loupe's circle
    if (!calm) {
      var op = prog(owrap), e = smooth(op / .62), full = Math.hypot(ostage.clientWidth, ostage.clientHeight) / 2;
      var cr = lerp(Math.min(ostage.clientWidth, ostage.clientHeight) * .3, full, e);
      ophoto.style.setProperty('--cr', cr.toFixed(1) + 'px'); orim.style.setProperty('--cr', cr.toFixed(1) + 'px'); orim.style.setProperty('--rimo', (1 - smooth((e - .5) / .4)).toFixed(3));
      ophoto.style.setProperty('--os', lerp(1.25, 1, e).toFixed(3));
      ocap.style.setProperty('--cap', smooth((op - .5) / .3).toFixed(3));
    }
    // the footer horizon rises as you arrive
    var fr = fh.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / fr.height);
    fh.style.setProperty('--rise', ((1 - fp) * 90).toFixed(1) + 'px');
  }
  addEventListener('scroll', tick, { passive: true });
  var rz = 0; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); tick(); }, 120); });

  texts(root.lang); hours(); flaps.reset(); write(); layout(); tick();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); tick(); });
  addEventListener('load', function () { layout(); tick(); });
})();
