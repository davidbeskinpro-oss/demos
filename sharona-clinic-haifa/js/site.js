(function () {
  var root = document.documentElement, WA = '972549108008', MAIL = 'sharona@sharonaclinic.com';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var TITLE = { he: 'שרונה · כוחו של הטבע · קוסמטיקה מתקדמת ורפואה משלימה · הגליל 36א, חיפה', en: 'Sharona · The Power of Nature · Advanced cosmetics & complementary medicine · 36A HaGalil St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור שרונה - קליניקה לקוסמטיקה מתקדמת ורפואה משלימה בחיפה · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Sharona – Advanced Cosmetics & Complementary Medicine Clinic, Haifa · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'כוחו של הטבע, הקליניקה של שרונה', 'The Power of Nature, Sharona’s clinic');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לשרונה, 054-910-8008', 'Call Sharona, 054-910-8008');
    aria('[data-t-wa]', 'וואטסאפ לשרונה', 'WhatsApp Sharona');
    aria('[data-t-shelf]', 'מה מעניין אותך', 'What interests you');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: הגליל 36א, חיפה' : 'Map: 36A HaGalil St, Haifa'; });
    $$('.spot').forEach(function (s) { var t = s.dataset[l]; s.setAttribute('aria-label', t); if (s.classList.contains('on')) $('.tag', s).textContent = t; });
    $$('[data-labels] li').forEach(function (li) { $('.t', li).textContent = li.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('sharona-lang', l); } catch (e) {}
    texts(l); splitTitle(); hours(); write(true); layout();
    hero.classList.add('ready');
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('sharona-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-labels] li').forEach(function (el) { el.classList.add('in'); });
    $$('[data-labels] li').forEach(function (li) { $('.t', li).textContent = li.dataset[he() ? 'he' : 'en']; });
    layout(); flower.kick(); pollen.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [10, 19], 1: [10, 19], 2: [10, 19], 3: [10, 19], 4: [10, 19], 5: [9.5, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
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

  // ---------------------------------------------------------------- entrances
  $$('.bento,.cbento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline: English letter by letter, Hebrew word by word (letters keep their joins)
  var titleSrc = $$('[data-split] .ln > span[lang]').map(function (sp) { return [sp, sp.textContent]; });
  function splitTitle() {
    var i = 0, wi = 0;
    titleSrc.forEach(function (p) {
      var sp = p[0];
      sp.innerHTML = p[1].split(' ').map(function (w) {
        return '<span class="w" style="--wi:' + (wi++) + '">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  }
  splitTitle();

  var hero = $('[data-hero]'), nav = $('[data-nav]'), stack = $('[data-stack]');

  // ---------------------------------------------------------------- the logo's gold, sampled from the real file: pollen in the hero, the wordmark in the footer
  var logoImg = $('[data-logosrc]'), GOLD = ['#e8c058', '#d2a84a', '#b98a36', '#9a6626', '#ecd08a'], logoPts = [];
  function sampleLogo() {
    try {
      var c = document.createElement('canvas'), w = 300, h = 86; c.width = w; c.height = h;
      var x = c.getContext('2d'); x.drawImage(logoImg, 0, 0, w, h);
      var d = x.getImageData(0, 0, w, h).data, cols = {}, pts = [];
      for (var yy = 0; yy < h; yy += 1) for (var xx = 0; xx < w; xx += 1) {
        var k = (yy * w + xx) * 4, r = d[k], g = d[k + 1], b = d[k + 2];
        if (r + g + b < 640) { pts.push([xx / w, yy / h, 'rgb(' + r + ',' + g + ',' + b + ')']); if (r > g + 30 && g > b + 20) cols['rgb(' + r + ',' + g + ',' + b + ')'] = 1; }
      }
      var gs = Object.keys(cols); if (gs.length > 8) GOLD = gs.filter(function (_, i) { return i % Math.ceil(gs.length / 24) === 0; });
      logoPts = pts;
    } catch (e) { logoPts = []; }
  }

  var pollen = (function () {
    var cv = $('[data-pollen]'), c = cv.getContext('2d'), P = [], w = 0, h = 0, raf = 0, vis = true, mx = -999, my = -999, last = 0;
    function make(burst, x, y) {
      return { x: burst ? x : Math.random() * w, y: burst ? y : Math.random() * h, r: .8 + Math.random() * 2.4, vx: burst ? (Math.random() - .5) * 3 : 0, vy: burst ? (Math.random() - .5) * 3 : 0,
        s: .15 + Math.random() * .4, ph: Math.random() * 6.28, col: GOLD[Math.floor(Math.random() * GOLD.length)], life: burst ? 1 : -1, a: .35 + Math.random() * .5 };
    }
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 46 : 90; P = []; for (var i = 0; i < n; i++) P.push(make());
    }
    function draw(t) {
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i]; c.globalAlpha = p.life > 0 ? p.a * p.life : p.a;
        c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
        if (p.r > 2) { c.globalAlpha *= .25; c.beginPath(); c.arc(p.x, p.y, p.r * 3, 0, 6.283); c.fill(); }
      }
      c.globalAlpha = 1;
    }
    function frame(t) {
      raf = 0; if (still()) { draw(t); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      for (var i = P.length - 1; i >= 0; i--) {
        var p = P[i];
        p.ph += dt; p.vy += (-p.s * 14 - p.vy) * dt * .8; p.vx += (Math.sin(p.ph * .9) * 6 - p.vx) * dt * .6;
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 14400) { var f = (14400 - d2) / 14400 * 160 * dt, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
        p.x += p.vx * dt * 2; p.y += p.vy * dt * 2;
        if (p.life > 0) { p.life -= dt * .4; if (p.life <= 0) { P.splice(i, 1); continue; } }
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
      }
      draw(t);
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) { if (still()) return; var r = hero.getBoundingClientRect(); for (var i = 0; i < 18; i++) P.push(make(true, e.clientX - r.left, e.clientY - r.top)); kick(); });
    return { size: function () { size(); draw(0); }, kick: kick, vis: function (v) { vis = v; if (v) kick(); } };
  })();

  // ---------------------------------------------------------------- the flower: her real photos as petals, opening at the start, turning slowly, closing as the page lifts
  var flower = (function () {
    var bloom = $('[data-bloom]'), petals = $$('.petal', bloom), N = petals.length, spin = -90, vel = 0, drag = false, lx = 0, raf = 0, vis = true, last = 0, t0 = 0, close = 0;
    function place(open) {
      var W = bloom.clientWidth, Hh = bloom.clientHeight, R = W * .32 * (.25 + .75 * open), ry = .7;
      petals.forEach(function (p, i) {
        var a = (spin + i * 360 / N) * Math.PI / 180, x = Math.cos(a) * R, y = Math.sin(a) * R * ry, depth = (Math.sin(a) + 1) / 2;
        var rot = a * 180 / Math.PI + 90, s = (.62 + .42 * depth) * (.55 + .45 * open);
        p.style.transform = 'translate(-50%,-50%) translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + rot.toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')';
        p.style.zIndex = Math.round(depth * 100);
        p.style.filter = 'brightness(' + (.62 + .42 * depth).toFixed(3) + ')';
        p.style.opacity = open.toFixed(3);
        p.firstElementChild.style.transform = 'translate(-50%,-50%) rotate(' + (-rot).toFixed(2) + 'deg)';
      });
    }
    function frame(t) {
      raf = 0;
      if (still()) { spin = -90; place(1); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t; if (!t0) t0 = t;
      if (!drag) { spin += (7 + vel) * dt * (rtl() ? -1 : 1); vel *= .95; }
      var intro = smooth((t - t0) / 1300), open = intro * (1 - close * .75);
      place(Math.max(.02, open));
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    bloom.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; bloom.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; spin += dx * .3; vel = dx * 3; });
    addEventListener('pointerup', function () { drag = false; bloom.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; bloom.classList.remove('drag'); });
    return { kick: kick, vis: function (v) { vis = v; if (v) kick(); }, close: function (c) { close = c; }, place: function () { if (still()) place(1); } };
  })();

  // ---------------------------------------------------------------- Sharona's portrait leans toward the hand (on phones, with the scroll)
  var portrait = $('[data-portrait]'), arch = $('.arch', portrait), sheen = $('.sheen', portrait);
  portrait.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var r = arch.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    arch.style.transform = 'rotateY(' + ((x - .5) * 10).toFixed(2) + 'deg) rotateX(' + ((.5 - y) * 8).toFixed(2) + 'deg)';
    sheen.style.setProperty('--sx', (x * 100).toFixed(1) + '%'); sheen.style.setProperty('--sy', (y * 100).toFixed(1) + '%');
  });
  portrait.addEventListener('pointerleave', function () { arch.style.transform = ''; });

  // ---------------------------------------------------------------- her credentials decode out of scattered letters
  var GLY = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'abcdefghijklmnopqrstuvwxyz' };
  function decode(li, delay) {
    var el = $('.t', li), target = li.dataset[he() ? 'he' : 'en'], set = GLY[he() ? 'he' : 'en'];
    if (still()) { el.textContent = target; li.classList.add('in'); return; }
    setTimeout(function () {
      li.classList.add('in'); var t0 = performance.now(), dur = 900;
      (function st(t) {
        var u = clamp((t - t0) / dur, 0, 1), n = Math.floor(u * target.length), s = target.slice(0, n);
        for (var i = n; i < target.length; i++) s += target[i] === ' ' || target[i] === '·' ? target[i] : set[Math.floor(Math.random() * set.length)];
        el.textContent = s; if (u < 1) requestAnimationFrame(st); else el.textContent = target;
      })(t0);
    }, delay);
  }
  var labels = $$('[data-labels] li'), labelsDone = false;
  labels.forEach(function (li) { $('.t', li).textContent = li.dataset[he() ? 'he' : 'en']; });
  watch($('[data-labels]'), function (v) { if (v && !labelsDone) { labelsDone = true; labels.forEach(function (li, i) { decode(li, i * 160); }); } }, { threshold: .3 });

  // ---------------------------------------------------------------- treatments: spotlight, rosette of 38 essences, microneedling shimmer
  var treat = $('[data-treat]'), treatOn = false, tiles = $$('.tile');
  watch(treat, function (v) { treatOn = v; treat.classList.toggle('on', v); if (v) micro.kick(); });
  tiles.forEach(function (t) { t.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; t._hand = performance.now(); var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var ros = $('[data-rosette]'), golden = Math.PI * (3 - Math.sqrt(5));
  for (var k = 0; k < 38; k++) {
    var rr = Math.sqrt((k + .5) / 38) * 46, aa = k * golden, s = document.createElementNS(NS, 'svg'), u = document.createElementNS(NS, 'use');
    u.setAttribute('href', '#i-blossom'); s.appendChild(u); s.setAttribute('viewBox', '0 0 40 40');
    s.style.left = (50 + Math.cos(aa) * rr) + '%'; s.style.top = (50 + Math.sin(aa) * rr) + '%';
    s.style.setProperty('--s', (.55 + (k / 38) * .6).toFixed(2)); s.style.transitionDelay = (k * 40) + 'ms';
    ros.appendChild(s);
  }
  var rosKids = $$('svg', ros);
  setInterval(function () {
    if (!treatOn || still() || !rosKids[0].animate) return;
    var el = rosKids[Math.floor(Math.random() * rosKids.length)];
    el.animate([{ transform: 'scale(' + el.style.getPropertyValue('--s') + ') rotate(0deg)' }, { transform: 'scale(1.5) rotate(36deg)' }, { transform: 'scale(' + el.style.getPropertyValue('--s') + ') rotate(72deg)' }], { duration: 900, easing: 'ease-out' });
  }, 260);
  var micro = (function () {
    var cv = $('[data-micro]'), c = cv.getContext('2d'), raf = 0, w, h;
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(t) {
      raf = 0; c.clearRect(0, 0, w, h); if (still()) return;
      var gap = 16, wave = ((t / 2600) % 1.4) * (w + h) - h * .2;
      for (var y = gap / 2; y < h * .62; y += gap) for (var x = gap / 2; x < w; x += gap) {
        var d = Math.abs(x + y - wave), a = d < 60 ? (1 - d / 60) : 0;
        if (a > 0) { c.globalAlpha = a * .8; c.fillStyle = '#ecd08a'; c.beginPath(); c.arc(x, y, 1.1 + a * 1.4, 0, 6.283); c.fill(); }
      }
      c.globalAlpha = 1;
      if (treatOn) raf = requestAnimationFrame(frame);
    }
    return { size: size, kick: function () { if (!raf && !still()) raf = requestAnimationFrame(frame); } };
  })();
  // phones have no hand over the tiles: the spotlight walks across them by itself
  setInterval(function () {
    if (!treatOn || still()) return;
    var t = performance.now() / 1000;
    tiles.forEach(function (tile, i) {
      if (tile._hand && performance.now() - tile._hand < 2500) return;
      var r = tile.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      tile.style.setProperty('--mx', (r.width * (.5 + .42 * Math.cos(t * .7 + i))).toFixed(0) + 'px');
      tile.style.setProperty('--my', (r.height * (.45 + .35 * Math.sin(t * .9 + i * 1.7))).toFixed(0) + 'px');
    });
  }, 50);

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- the room: spots on her real photo, labels typing themselves
  var room = $('[data-room]'), win = $('[data-window]'), bulb = $('[data-bulb]'), spots = $$('.spot'), rimg = $('img', win);
  function cover() {
    var W = win.clientWidth, Hh = win.clientHeight, iw = 1200, ih = 1600, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s;
    return { W: W, H: Hh, dw: dw, dh: dh, ox: (W - dw) * .5, oy: (Hh - dh) * .46 };
  }
  function placeSpots() {
    var c = cover();
    spots.forEach(function (sp) {
      var x = c.ox + c.dw * +sp.dataset.x, y = c.oy + c.dh * +sp.dataset.y;
      sp.style.left = x + 'px'; sp.style.top = y + 'px';
      sp.classList.toggle('flip', x > c.W / 2);
      sp.hidden = x < 30 || x > c.W - 40 || y < 80 || y > c.H * (phone() ? .6 : .52);
    });
    var bx = c.ox + c.dw * .54, by = c.oy + c.dh * .355; bulb.style.left = bx + 'px'; bulb.style.top = by + 'px';
  }
  function typeTag(sp, on) {
    var tag = $('.tag', sp), txt = sp.dataset[he() ? 'he' : 'en'];
    if (on === sp.classList.contains('on')) return;
    sp.classList.toggle('on', on); clearInterval(sp._t);
    if (!on) { tag.textContent = ''; return; }
    if (still()) { tag.textContent = txt; return; }
    var i = 0; tag.textContent = '';
    sp._t = setInterval(function () { tag.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(sp._t); }, 36);
  }
  spots.forEach(function (sp) { sp.addEventListener('click', function () { sp._pinned = !sp.classList.contains('on'); typeTag(sp, sp._pinned); }); });

  // ---------------------------------------------------------------- visit: vials pour into the bottle, the note writes the message
  var vials = $$('[data-vial]'), layersG = $('[data-layers]'), msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false, steps = $$('[data-step]');
  var BODY_TOP = 112, BODY_BOT = 322, SLOT = (BODY_BOT - 150) / 6;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function drawLayers(addIdx) {
    var picked = vials.filter(function (v) { return v.getAttribute('aria-pressed') === 'true'; });
    var old = {}; $$('.layer', layersG).forEach(function (r) { old[r.dataset.k] = r; });
    var y = BODY_BOT;
    var base = old.base || document.createElementNS(NS, 'rect');
    base.setAttribute('class', 'layer'); base.dataset.k = 'base'; base.setAttribute('x', 40); base.setAttribute('width', 140); base.setAttribute('fill', 'rgba(210,168,74,.55)');
    base.setAttribute('y', y - 22); base.setAttribute('height', 22); layersG.appendChild(base); y -= 22;
    var keep = { base: 1 };
    picked.forEach(function (v) {
      var k = v.dataset.en, r = old[k], fresh = !r;
      if (fresh) { r = document.createElementNS(NS, 'rect'); r.setAttribute('class', 'layer' + (still() ? '' : ' new')); r.dataset.k = k; r.setAttribute('x', 40); r.setAttribute('width', 140); r.setAttribute('fill', v.dataset.c); }
      r.setAttribute('y', (y - SLOT).toFixed(1)); r.setAttribute('height', (SLOT + 1).toFixed(1)); layersG.appendChild(r); y -= SLOT; keep[k] = 1;
      if (fresh && !still()) { requestAnimationFrame(function () { requestAnimationFrame(function () { r.classList.remove('new'); }); }); dropFall(); }
    });
    Object.keys(old).forEach(function (k) { if (!keep[k]) old[k].remove(); });
  }
  function dropFall() {
    var svg = layersG.ownerSVGElement, d = document.createElementNS(NS, 'circle'); d.setAttribute('class', 'drop'); d.setAttribute('cx', 110); d.setAttribute('cy', 56); d.setAttribute('r', 5); svg.appendChild(d);
    if (!d.animate) { d.remove(); return; }
    d.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(170px)', opacity: .9 }], { duration: 650, easing: 'cubic-bezier(.5,0,.9,.6)' }).onfinish = function () { d.remove(); };
  }
  vials.forEach(function (v) { v.style.setProperty('--c', v.dataset.c); });
  vials.forEach(function (v) {
    v.addEventListener('click', function () {
      v.setAttribute('aria-pressed', v.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      lightStep(1); drawLayers(); write();
    });
  });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = vials.filter(function (n) { return n.getAttribute('aria-pressed') === 'true'; }).map(function (n) { return n.dataset[l ? 'he' : 'en']; });
    return l ? 'שלום שרונה, אשמח לשמוע על ' + (picked.length ? list(picked, true) : 'הטיפולים בקליניקה') + '. מתי אפשר לקבוע?'
             : 'Hi Sharona, I’d like to hear about ' + (picked.length ? list(picked, false) : 'the treatments at your clinic') + '. When could we book?';
  }
  function write(instant) {
    var target = compose(), l = he();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    $('[data-mail]').href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(l ? 'תיאום טיפול בקליניקה' : 'Booking a treatment') + '&body=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 16);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; if (still()) return; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .5 });
  $('[data-send]').addEventListener('pointerenter', function () { lightStep(2); });
  $('[data-send]').addEventListener('focus', function () { lightStep(2); });
  $('[data-mail]').addEventListener('focus', function () { lightStep(2); });

  // ---------------------------------------------------------------- footer: the logo's gold letters gathered out of pollen
  var foot = $('[data-foot]'), flogo = $('[data-flogo]'), fcv = $('[data-fpollen]'), fc = fcv.getContext('2d'), fP = [], fraf = 0, fStart = 0, fDone = false;
  function footBuild() {
    var dpr = Math.min(2, devicePixelRatio || 1), W = flogo.clientWidth, Hh = flogo.clientHeight;
    fcv.width = W * dpr; fcv.height = Hh * dpr; fc.setTransform(dpr, 0, 0, dpr, 0, 0);
    var img = $('img', flogo), ir = img.getBoundingClientRect(), fr = flogo.getBoundingClientRect(), ox = ir.left - fr.left, oy = ir.top - fr.top;
    var want = phone() ? 700 : 1500, stp = Math.max(1, logoPts.length / want); fP = [];
    for (var f = 0; f < logoPts.length; f += stp) { var q = logoPts[Math.floor(f)]; fP.push({ tx: ox + q[0] * ir.width, ty: oy + q[1] * ir.height, col: q[2], sx: Math.random() * W, sy: Hh + Math.random() * Hh * .6, dl: Math.random() * .5 }); }
    return { W: W, H: Hh };
  }
  function footFrame(t) {
    fraf = 0; var W = fcv.width, sz = phone() ? 1.6 : 2;
    if (!fStart) fStart = t;
    var T = (t - fStart) / 1000, dims = { W: flogo.clientWidth, H: flogo.clientHeight };
    fc.clearRect(0, 0, dims.W, dims.H);
    var fade = clamp((T - 2) / .8, 0, 1);
    fP.forEach(function (p) {
      var u = smooth((T - p.dl) / 1.5), x = lerp(p.sx, p.tx, u) + Math.sin(T * 3 + p.sx) * (1 - u) * 14, y = lerp(p.sy, p.ty, u);
      fc.globalAlpha = (1 - fade) * .9; fc.fillStyle = p.col; fc.fillRect(x - sz / 2, y - sz / 2, sz, sz);
    });
    fc.globalAlpha = 1;
    if (T > 1.7) flogo.classList.add('on');
    if (T < 2.9) fraf = requestAnimationFrame(footFrame); else { fc.clearRect(0, 0, dims.W, dims.H); fDone = true; }
  }
  watch(flogo, function (v) {
    if (!v || fDone) return;
    if (still() || !logoPts.length) { flogo.classList.add('on'); fDone = true; return; }
    footBuild(); fStart = 0; if (!fraf) fraf = requestAnimationFrame(footFrame);
  }, { threshold: .6 });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false, edge = $('[data-edge]'), slips = $('[data-slips]'), slipWrap = $('[data-slipwrap]'), pearls = $('[data-pearls]'), page = $('.page');
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // the petal sheet rides over the hero; the flower closes as it goes
    var who = $('[data-who]').getBoundingClientRect(), cover01 = clamp(1 - (who.top - 60) / Math.max(1, hero.offsetHeight), 0, 1);
    flower.close(calm ? 0 : smooth(cover01));
    var heroVis = who.top > 40; flower.vis(heroVis); pollen.vis(heroVis);
    // the leaf edge sways open as the treatments arrive
    var tr = treat.getBoundingClientRect(), e = calm ? .5 : clamp(1 - tr.top / vh, 0, 1);
    var c1 = lerp(10, 70, e), c2 = lerp(90, 20, e), c3 = lerp(40, 70, e);
    edge.setAttribute('d', 'M0 120 L0 ' + lerp(60, 40, e).toFixed(1) + ' C240 ' + c1.toFixed(1) + ' 480 ' + c1.toFixed(1) + ' 720 ' + lerp(50, 60, e).toFixed(1) + ' C960 ' + c2.toFixed(1) + ' 1200 ' + c2.toFixed(1) + ' 1440 ' + c3.toFixed(1) + ' L1440 120 Z');
    // the room: arched window opens to full screen, the sheer slides aside, the light comes on
    var rp = calm ? 1 : prog(room);
    if (!calm) {
      var W = win.clientWidth, Hh = win.clientHeight, o = smooth(rp / .5), aw = Math.min(W * (phone() ? .62 : .4), 520), ah = Math.min(Hh * .7, aw * 1.45);
      var cl = lerp((W - aw) / 2, 0, o), ct = lerp((Hh - ah) / 2 - Hh * .06, 0, o), cb = lerp(Hh - ct - ah, 0, o);
      win.style.setProperty('--cl', cl.toFixed(1) + 'px'); win.style.setProperty('--cr', cl.toFixed(1) + 'px');
      win.style.setProperty('--ct', ct.toFixed(1) + 'px'); win.style.setProperty('--cb', Math.max(0, cb).toFixed(1) + 'px');
      win.style.setProperty('--rt', lerp(aw / 2, 0, o).toFixed(1) + 'px'); win.style.setProperty('--rb', lerp(24, 0, o).toFixed(1) + 'px');
      win.style.setProperty('--zs', lerp(1.18, 1, smooth(rp / .8)).toFixed(4));
      var shp = smooth((rp - .1) / .35); win.style.setProperty('--sh', (shp * (rtl() ? -105 : 105)).toFixed(1) + '%'); win.style.setProperty('--sho', (1 - shp * .3).toFixed(3));
      win.style.setProperty('--glow', lerp(.25, 1, smooth((rp - .35) / .3)).toFixed(3));
    } else { ['--cl', '--cr', '--ct', '--cb', '--rt', '--rb', '--zs', '--glow'].forEach(function (k) { win.style.removeProperty(k); }); }
    spots.forEach(function (sp, i) { var on = calm || rp > .56 + i * .06; sp.classList.toggle('vis', on); if (!sp._pinned) typeTag(sp, on); });
    // stairs light up as each line passes the middle
    if (!calm) steps.forEach(function (s, i) { var r = s.getBoundingClientRect(); if (r.top < vh * .62) s.classList.add('on'); });
    // slips drift sideways with the scroll (phones swipe them)
    if (!calm && innerWidth > 700) {
      var sr = slipWrap.getBoundingClientRect(), sp01 = clamp((vh - sr.top) / (vh + sr.height), 0, 1), over = Math.max(0, slips.scrollWidth - slipWrap.clientWidth);
      slips.style.transform = 'translateX(' + ((rtl() ? 1 : -1) * over * sp01).toFixed(1) + 'px)';
    } else slips.style.transform = '';
    // pearls step aside once the contact section itself is on screen
    var ct2 = $('[data-contact]').getBoundingClientRect(); pearls.classList.toggle('hide', ct2.top < vh * .5);
    foot.classList.toggle('near', ct2.bottom < vh * 1.5);
  }

  // the hero pins only while the petal sheet slides over it; a hero taller than the screen pins at its foot
  function stickHero() { hero.style.top = Math.min(0, innerHeight - hero.offsetHeight) + 'px'; }
  // curtain footer only when it fits on the screen
  function curtain() {
    var ok = !still() && foot.offsetHeight <= innerHeight;
    root.classList.toggle('curtain', ok);
    page.style.marginBottom = ok ? foot.offsetHeight + 'px' : '';
  }
  function layout() { pollen.size(); micro.size(); stickHero(); placeSpots(); flower.place(); curtain(); tick(); flower.kick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); lw = innerWidth; }, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); drawLayers(); write(true); layout();
  if (logoImg.complete && logoImg.naturalWidth) sampleLogo(); else logoImg.addEventListener('load', sampleLogo, { once: true });
  logoImg.loading = 'eager';
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); flower.kick(); pollen.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 900);
  addEventListener('load', function () { placeSpots(); curtain(); stickHero(); tick(); });
})();
