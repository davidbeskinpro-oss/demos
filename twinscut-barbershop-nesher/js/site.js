(function () {
  var root = document.documentElement;
  var NUM = { or: '972547324831', dor: '972547324830' };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 760; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'Twinscut · מספרת גברים של האחים אור ודור · הסחלב 17, נשר', en: 'Twinscut · Men’s barbershop of brothers Or and Dor · 17 HaSahlav St, Nesher' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Twinscut מספרת גברים · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Twinscut men’s barbershop · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-dock]', 'יצירת קשר', 'Contact');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: הסחלב 17, נשר' : 'Map: 17 HaSahlav St, Nesher'; });
    $$('[data-decode]').forEach(function (n) { n.textContent = n.dataset[l]; });
    $$('.stars[aria-label]').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('tc-lang', l); } catch (e) {}
    texts(l); hours(); fade.label(true); slip.render(true); onScroll();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('tc-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    clippings.kick(); fade.render(); slip.render(true); onScroll();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [10, 19], 1: [10, 19], 2: null, 3: [10, 20], 4: [10, 20], 5: [8, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function allDay(t) { return t && t[0] === 0 && t[1] === 24; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (allDay(t)) { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
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
      var val = allDay(t) ? (l ? '24 שעות' : '24 hours') : t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances, staggered within their row
  $$('.bento,.cbento,.bros-row,.qa-list').forEach(function (g) { $$('[data-tile],[data-reveal]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); onIn(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : (el.classList.add('in'), onIn(el)); });
  function onIn(el) {
    $$('[data-decode]', el).forEach(decode);
    $$('[data-odo]', el).forEach(odo);
  }

  // ---------------------------------------------------------------- name labels decode out of scrambled letters
  var GLYPH = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHJKLMNOPRSTUVWXYZ' };
  function decode(el) {
    var l = root.lang, target = el.dataset[l] || el.textContent;
    if (still()) { el.textContent = target; return; }
    var t0 = performance.now(), g = GLYPH[l];
    (function step(t) {
      var p = clamp((t - t0) / 900, 0, 1), fixed = Math.floor(p * target.length + .0001), out = '';
      for (var i = 0; i < target.length; i++) out += i < fixed ? target[i] : g[Math.floor(Math.random() * g.length)];
      el.textContent = p >= 1 ? target : out;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  // ---------------------------------------------------------------- odometer figures
  function odo(el) {
    var end = parseFloat(el.dataset.odo), dec = (el.dataset.odo.split('.')[1] || '').length;
    if (still()) { el.textContent = end.toFixed(dec); return; }
    var t0 = performance.now();
    (function step(t) { var p = clamp((t - t0) / 1100, 0, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = (end * e).toFixed(dec); if (p < 1) requestAnimationFrame(step); })(t0);
  }

  // ---------------------------------------------------------------- headline letters
  $$('[data-split] > span > span[lang]').forEach(function (sp) {
    var i = sp.parentNode.classList.contains('acc') ? 9 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span style="display:inline-block;white-space:nowrap">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // ---------------------------------------------------------------- opening: the logo's own ink gathers out of loose clippings
  var intro = $('[data-intro]'), introDone = false;
  var played = false; try { played = sessionStorage.getItem('tc-intro') === '1'; } catch (e) {}
  function endIntro() {
    if (introDone) return; introDone = true;
    intro.classList.add('lift'); heroSweep();
    setTimeout(function () { intro.classList.add('gone'); }, 750);
    try { sessionStorage.setItem('tc-intro', '1'); } catch (e) {}
  }
  if (still() || played) { intro.classList.add('gone'); introDone = true; }
  else {
    intro.addEventListener('click', endIntro);
    addEventListener('keydown', endIntro, { once: true });
    setTimeout(endIntro, 1600); // hard cap, whatever happens
    var logo = $('[data-intro-logo]'), src = new Image();
    src.onload = function () {
      var cv = $('[data-intro-cv]'), c = cv.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1);
      var W = innerWidth, Hh = innerHeight; cv.width = W * dpr; cv.height = Hh * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var r = logo.getBoundingClientRect(), off = document.createElement('canvas'), sw = 140, sh = Math.round(sw * src.height / src.width);
      off.width = sw; off.height = sh; var oc = off.getContext('2d'); oc.drawImage(src, 0, 0, sw, sh);
      var d = oc.getImageData(0, 0, sw, sh).data, pts = [];
      for (var y = 0; y < sh; y += 2) for (var x = 0; x < sw; x += 2) { var k = (y * sw + x) * 4; if (d[k] + d[k + 1] + d[k + 2] < 240) pts.push([r.left + x / sw * r.width, r.top + y / sh * r.height]); }
      var ps = pts.map(function (p) { var a = Math.random() * 6.283, R = Math.max(W, Hh) * (.35 + Math.random() * .4); return { x: W / 2 + Math.cos(a) * R, y: Hh / 2 + Math.sin(a) * R, tx: p[0], ty: p[1], rot: Math.random() * 3, dl: Math.random() * 180 }; });
      var t0 = performance.now();
      (function frame(t) {
        if (introDone) return;
        c.clearRect(0, 0, W, Hh); c.strokeStyle = 'rgba(228,222,210,.9)'; c.lineWidth = 1.3; c.beginPath();
        var all = 1;
        ps.forEach(function (p) {
          var q = clamp((t - t0 - p.dl) / 700, 0, 1), e = 1 - Math.pow(1 - q, 3), x = p.x + (p.tx - p.x) * e, y = p.y + (p.ty - p.y) * e, len = 4 * (1 - e) + 1.4, a = p.rot * (1 - e);
          c.moveTo(x - Math.cos(a) * len, y - Math.sin(a) * len); c.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); if (q < 1) all = 0;
        });
        c.stroke();
        if (all && !intro.classList.contains('show-logo')) { intro.classList.add('show-logo'); setTimeout(endIntro, 380); }
        requestAnimationFrame(frame);
      })(t0);
    };
    src.onerror = endIntro;
    src.src = logo.src;
  }

  // ---------------------------------------------------------------- hero: the clipper line, and snipped hair drifting down past it
  var hero = $('[data-hero]'), media = $('.hero-media', hero), guardEl = $('[data-guard]');
  var F = { v: still() ? 100 : 0, target: 100, pointer: null, swept: still() };
  function guardTxt(f) { var g = Math.round((3 - clamp(f, 0, 100) / 100 * 3) * 2) / 2; return (he() ? 'מספר ' : '#') + (g % 1 ? g.toFixed(1) : g); }
  function heroSweep() { F.swept = true; F.sweep0 = performance.now(); }
  if (introDone) heroSweep();
  hero.addEventListener('pointermove', function (e) { if (!fine) return; var r = hero.getBoundingClientRect(); F.pointer = clamp(100 - (e.clientY - r.top) / r.height * 100, 4, 100); });
  hero.addEventListener('pointerleave', function () { F.pointer = null; });
  var clippings = (function () {
    var cv = $('[data-clippings]'), c = cv.getContext('2d'), w, h, raf = 0, vis = true, hs = [], mx = -999, my = -999;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = media.clientWidth; h = media.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 34 : 70; hs = [];
      for (var i = 0; i < n; i++) hs.push(make(true));
    }
    function make(any) { return { x: Math.random() * w, y: any ? Math.random() * h : -10, vy: .25 + Math.random() * .55, vx: (Math.random() - .5) * .25, a: Math.random() * 6.28, va: (Math.random() - .5) * .03, l: 3 + Math.random() * 7, o: .25 + Math.random() * .45 }; }
    function frame() {
      raf = 0; c.clearRect(0, 0, w, h);
      if (!vis || still()) { tickLine(); return; }
      tickLine();
      c.lineCap = 'round'; c.lineWidth = 1.2;
      hs.forEach(function (p, i) {
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 9000) { var f = (9000 - d2) / 9000 * .9; p.vx += dx / 95 * f * .2; p.vy += dy / 95 * f * .1; }
        p.vx *= .985; p.vy = p.vy * .985 + .012; p.x += p.vx; p.y += p.vy; p.a += p.va;
        if (p.y > h + 10 || p.x < -20 || p.x > w + 20) hs[i] = make(false);
        c.strokeStyle = 'rgba(232,224,208,' + p.o + ')'; c.beginPath();
        c.moveTo(p.x - Math.cos(p.a) * p.l / 2, p.y - Math.sin(p.a) * p.l / 2); c.lineTo(p.x + Math.cos(p.a) * p.l / 2, p.y + Math.sin(p.a) * p.l / 2); c.stroke();
      });
      raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { var r = media.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: function () { size(); kick(); }, kick: kick };
  })();
  // the line: sweeps up once after the opening, then follows the hand (desktop) and sinks as the hero scrolls away
  function tickLine() {
    var r = hero.getBoundingClientRect(), out = clamp(-r.top / (r.height * .9), 0, 1), base;
    if (still()) { F.v = 100; }
    else {
      if (!F.swept) base = 0;
      else { var s = clamp((performance.now() - F.sweep0) / 1600, 0, 1); base = 100 * (1 - Math.pow(1 - s, 3)); if (s >= 1 && F.pointer != null) base = F.pointer; }
      var target = base * (1 - out * .85);
      F.v += (target - F.v) * .12;
    }
    media.style.setProperty('--f', F.v.toFixed(2));
    media.style.setProperty('--lo', still() ? 0 : (F.v > 99.3 ? .0 : 1));
    var g = guardTxt(F.v); if (guardEl.textContent !== g) guardEl.textContent = g;
  }

  // ---------------------------------------------------------------- brothers: the card leans toward the hand; the plates catch a spotlight
  var tilt = $('[data-tilt]');
  if (fine) {
    tilt.addEventListener('pointermove', function (e) { if (still()) return; var r = tilt.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; tilt.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg'); tilt.style.setProperty('--rx', (-y * 12).toFixed(2) + 'deg'); });
    tilt.addEventListener('pointerleave', function () { tilt.style.setProperty('--ry', '0deg'); tilt.style.setProperty('--rx', '0deg'); });
  }
  $$('[data-plate]').forEach(function (p) {
    p.addEventListener('pointermove', function (e) { var r = p.getBoundingClientRect(); p.style.setProperty('--mx', (e.clientX - r.left) + 'px'); p.style.setProperty('--my', (e.clientY - r.top) + 'px'); p.classList.add('lit'); });
    p.addEventListener('pointerleave', function () { p.classList.remove('lit'); });
  });

  // ---------------------------------------------------------------- bento spotlight + photo drift under the hand
  $$('[data-spot]').forEach(function (t) {
    var img = $('img', t);
    t.addEventListener('pointermove', function (e) {
      if (still()) return;
      var r = t.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      t.style.setProperty('--mx', x + 'px'); t.style.setProperty('--my', y + 'px'); t.style.setProperty('--so', 1);
      if (img) { t.style.setProperty('--px', ((x / r.width - .5) * -14).toFixed(1) + 'px'); t.style.setProperty('--py', ((y / r.height - .5) * -14).toFixed(1) + 'px'); }
    });
    t.addEventListener('pointerleave', function () { t.style.setProperty('--so', 0); t.style.setProperty('--px', '0px'); t.style.setProperty('--py', '0px'); });
  });

  // ---------------------------------------------------------------- the fade scene: the line climbs each photo and hands over to the next
  var fade = (function () {
    var sec = $('[data-fade]'), imgs = $$('[data-frame] img'), line = $('[data-fline]'), cap = $('[data-cap]'), rnum = $('[data-rnum]'), rbar = $('[data-rbar]'), thumbs = $('[data-thumbs]');
    var N = imgs.length, p = 0, idx = 0, shown = -1, manual = 0;
    imgs.forEach(function (im, i) {
      var b = document.createElement('button'); b.type = 'button';
      b.innerHTML = '<img src="' + im.getAttribute('src') + '" alt="" loading="lazy" width="44" height="52">';
      b.addEventListener('click', function () { go(i); });
      thumbs.appendChild(b);
    });
    var tb = $$('button', thumbs);
    function progress() {
      if (still()) return manual / (N - 1);
      var r = sec.getBoundingClientRect(), span = sec.offsetHeight - innerHeight;
      return clamp(-r.top / span, 0, 1);
    }
    function render() {
      p = progress();
      var seg = p * (N - 1) * 1.08 - .04, lineY = 0, lineOn = 0, gval = 0, top = 0;
      imgs.forEach(function (im, i) {
        var rv = i === 0 ? 1 : smooth((seg - (i - 1) - .15) / .7);
        if (still()) rv = i <= manual ? 1 : 0;
        im.style.setProperty('--r', rv.toFixed(4));
        if (rv > 0 && rv < 1) { lineOn = 1; lineY = rv; gval = rv; }
        if (rv >= .5) top = i;
      });
      var fh = line.parentNode.clientHeight;
      line.style.opacity = lineOn && !still() ? 1 : 0;
      line.style.setProperty('--y', (lineY * 1.18 * fh - .09 * fh).toFixed(1));
      var g = lineOn ? Math.round(gval * 3 * 2) / 2 : 3;
      rnum.textContent = g % 1 ? g.toFixed(1) : String(g);
      rbar.style.setProperty('--g', (lineOn ? gval : 1).toFixed(3));
      idx = top; label(false);
    }
    function label(force) {
      if (idx === shown && !force) return; shown = idx;
      var t = imgs[idx].dataset[root.lang];
      cap.dataset.he = imgs[idx].dataset.he; cap.dataset.en = imgs[idx].dataset.en;
      if (force) cap.textContent = t; else decode(cap);
      tb.forEach(function (b, i) { b.setAttribute('aria-current', i === idx ? 'true' : 'false'); b.setAttribute('aria-label', (he() ? 'תמונה: ' : 'Photo: ') + imgs[i].dataset[root.lang]); });
    }
    function go(i) {
      i = (i + N) % N;
      if (still()) { manual = i; render(); return; }
      var span = sec.offsetHeight - innerHeight, pp = (Math.max(0, i - .1) + .04) / ((N - 1) * 1.08), y = sec.getBoundingClientRect().top + scrollY + span * pp;
      scrollTo({ top: clamp(y, 0, document.body.scrollHeight), behavior: 'smooth' });
    }
    $$('[data-step]').forEach(function (b) { b.addEventListener('click', function () { go(idx + (+b.dataset.step)); }); });
    return { render: render, label: label };
  })();

  // ---------------------------------------------------------------- the booking slip: tap a blank to change it; the message types itself
  var slip = (function () {
    var box = $('[data-slip]'), send = $('[data-send]'), sendL = $('[data-send-l]'), typed = $('[data-typed]'), who = $('[data-chat-who]');
    var O = {
      b: [{ he: 'אור', en: 'Or', k: 'or' }, { he: 'דור', en: 'Dor', k: 'dor' }],
      w: [{ he: 'לתספורת', en: 'a haircut' }, { he: 'לתספורת וזקן', en: 'a haircut and beard' }, { he: 'לתספורת לילד', en: 'a kid’s haircut' }],
      d: [3, 4, 5, 0, 1],
      t: [{ he: 'בבוקר', en: 'in the morning' }, { he: 'בצהריים', en: 'around noon' }, { he: 'אחר הצהריים', en: 'in the afternoon' }, { he: 'בערב', en: 'in the evening' }]
    };
    var S = { b: 0, w: 0, d: 0, t: 2 }, timer = 0;
    function times() { return O.d[S.d] === 5 ? 2 : 4; } // Friday closes at 14:00: morning or noon only
    function val(k) {
      var l = root.lang;
      if (k === 'd') { var d = O.d[S.d]; return l === 'he' ? 'ביום ' + dayHe[d] : 'on ' + dayEn[d]; }
      return O[k][S[k]][l];
    }
    function blank(k) { return '<button type="button" class="blank" data-k="' + k + '" aria-label="' + (he() ? 'לשנות: ' : 'Change: ') + val(k) + '">' + val(k) + '<span class="cyc" aria-hidden="true">↻</span></button>'; }
    function message() {
      return he() ? 'היי ' + val('b') + ', אפשר לקבוע תור ' + val('w') + ' ' + val('d') + ' ' + val('t') + '?'
        : 'Hi ' + val('b') + ', could I book ' + val('w') + ' ' + val('d') + ' ' + val('t') + '?';
    }
    function render(instant, flipped) {
      if (S.t >= times()) S.t = times() - 1;
      box.innerHTML = he() ? 'היי ' + blank('b') + ', אפשר לקבוע תור ' + blank('w') + ' ' + blank('d') + ' <span class="nw">' + blank('t') + '?</span>'
        : 'Hi ' + blank('b') + ', could I book ' + blank('w') + ' ' + blank('d') + ' <span class="nw">' + blank('t') + '?</span>';
      if (flipped) { var f = $('[data-k="' + flipped + '"]', box); if (f) { f.classList.add('flip'); f.focus({ preventScroll: true }); } }
      var b = O.b[S.b], msg = message();
      send.href = 'https://wa.me/' + NUM[b.k] + '?text=' + encodeURIComponent(msg);
      sendL.textContent = he() ? 'שליחה לוואטסאפ של ' + b.he : 'Send on WhatsApp to ' + b.en;
      who.textContent = b[root.lang] + ' · Twinscut';
      type(msg, instant || still());
    }
    function type(msg, instant) {
      clearTimeout(timer);
      if (instant) { typed.textContent = msg; return; }
      var i = 0; (function step() { typed.textContent = msg.slice(0, i); if (i++ < msg.length) timer = setTimeout(step, 22); })();
    }
    box.addEventListener('click', function (e) {
      var b = e.target.closest('.blank'); if (!b) return;
      var k = b.dataset.k, n = k === 't' ? times() : O[k].length;
      S[k] = (S[k] + 1) % n; render(false, k);
    });
    var started = false;
    watch(box, function (v) { if (v && !started) { started = true; render(false); } }, { rootMargin: '0px 0px -10% 0px' });
    render(true);
    return { render: render };
  })();

  // ---------------------------------------------------------------- footer wordmark: letters climb into place as the curtain opens
  var fwm = $('[data-fwm]'), foot = $('[data-foot]');
  fwm.innerHTML = fwm.textContent.split('').map(function (c, i) { return '<span class="fl" aria-hidden="true" style="--j:' + (1 + (i % 3) * .6) + '">' + c + '</span>'; }).join('');

  // ---------------------------------------------------------------- one scroll loop
  var page = $('#main'), nav = $('[data-nav]'), poleI = $('.pole i'), dock = $('.dock'), ticking = false;
  function onScroll() {
    ticking = false;
    var y = scrollY;
    nav.classList.toggle('gathered', y > 40);
    poleI.style.setProperty('--p', still() ? 0 : (y * .35 % 48.83).toFixed(1));
    fade.render();
    var mb = page.getBoundingClientRect().bottom, fh = foot.offsetHeight, fp = still() ? 1 : clamp((innerHeight - mb) / (Math.min(fh, innerHeight) * .8), 0, 1);
    fwm.style.setProperty('--fp', fp.toFixed(3));
    dock.classList.toggle('away', mb < innerHeight - 40);
    foot.style.visibility = mb > innerHeight + 40 ? 'hidden' : '';
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  var rw = 0; addEventListener('resize', function () { clearTimeout(rw); rw = setTimeout(function () { clippings.size(); onScroll(); }, 150); });

  texts(root.lang); hours(); clippings.size(); fade.label(true); onScroll();
})();
