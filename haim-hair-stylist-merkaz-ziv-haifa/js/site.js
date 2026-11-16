(function () {
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';
  var TITLE = { he: 'חיים · עיצוב שיער · דרך חנקין 2, מרכז זיו, חיפה', en: 'Haim · Hair stylist · 2 Derech Hankin, Merkaz Ziv, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור עיצוב שיער - חיים · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Haim Hair Stylist · This is not the business’s official website' };

  // ---------------------------------------------------------------- hours, Haifa time. null = closed
  var H = { 0: [9, 19], 1: null, 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [7.5, 15], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], shortEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: shortEn.indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, s: +o.second, hr: (+o.hour) % 24, mi: +o.minute };
  }
  function statusText(short) {
    var n = window.__now || now(), l = he(), t = H[n.d], open = false, txt;
    if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    return { open: open, txt: txt, d: n.d };
  }
  function status() {
    var s = statusText();
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', s.open); el.innerHTML = '<span class="dot"></span>' + s.txt; });
    $$('[data-status-short]').forEach(function (el) { el.textContent = s.txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(s.d)) >= 0); });
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

  // ---------------------------------------------------------------- clocks, drawn after the salon's white Roman-numeral clock
  var ROM = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  var clocks = $$('[data-clock],[data-planclock]');
  clocks.forEach(function (svg) {
    var g = $('[data-romans]', svg), tk = $('[data-ticks]', svg), k, a;
    for (k = 0; k < 12; k++) {
      a = k / 12 * Math.PI * 2;
      var t = document.createElementNS(NS, 'text'); t.setAttribute('x', (110 + Math.sin(a) * 70).toFixed(1)); t.setAttribute('y', (132 - Math.cos(a) * 70).toFixed(1));
      t.setAttribute('transform', 'rotate(' + (k * 30) + ' ' + (110 + Math.sin(a) * 70).toFixed(1) + ' ' + (132 - Math.cos(a) * 70).toFixed(1) + ')');
      t.textContent = ROM[k]; g.appendChild(t);
    }
    for (k = 0; k < 60; k++) {
      a = k / 60 * Math.PI * 2; var r0 = k % 5 ? 85 : 81, ln = document.createElementNS(NS, 'line');
      ln.setAttribute('x1', (110 + Math.sin(a) * r0).toFixed(1)); ln.setAttribute('y1', (132 - Math.cos(a) * r0).toFixed(1));
      ln.setAttribute('x2', (110 + Math.sin(a) * 88).toFixed(1)); ln.setAttribute('y2', (132 - Math.cos(a) * 88).toFixed(1)); tk.appendChild(ln);
    }
  });
  // the brass arc on the rim: the opening hours of a day on the 12-hour dial
  function arcPath(t) {
    if (!t) return '';
    var R = 97, span = t[1] - t[0];
    if (span >= 12) return 'M110 ' + (132 - R) + 'a' + R + ' ' + R + ' 0 1 1 -.01 0';
    var a0 = (t[0] % 12) / 12 * Math.PI * 2, a1 = (t[1] % 12) / 12 * Math.PI * 2;
    var p = function (a) { return (110 + Math.sin(a) * R).toFixed(2) + ' ' + (132 - Math.cos(a) * R).toFixed(2); };
    return 'M' + p(a0) + 'A' + R + ' ' + R + ' 0 ' + (span > 6 ? 1 : 0) + ' 1 ' + p(a1);
  }
  function tick() {
    var n = now(), sec = n.s, min = n.mi + sec / 60, hr = (n.hr % 12) + min / 60;
    clocks.forEach(function (svg) {
      $('[data-hh]', svg).style.transform = 'rotate(' + (hr * 30) + 'deg)';
      $('[data-mh]', svg).style.transform = 'rotate(' + (min * 6) + 'deg)';
      var s = $('[data-sh]', svg); if (s) s.style.transform = 'rotate(' + (sec * 6) + 'deg)';
    });
    var hero = $('[data-clock] [data-arc]'); hero.setAttribute('d', arcPath(H[n.d]));
    $('[data-clock]').setAttribute('aria-label', (he() ? 'השעה בחיפה ' : 'Haifa time ') + n.hr + ':' + (n.mi < 10 ? '0' : '') + n.mi);
  }
  tick(); setInterval(tick, 1000);
  setInterval(status, 30000);

  // ---------------------------------------------------------------- planner: tap a day, the brass arc shows its hours
  var plan = { d: now().d };
  var daysEl = $('[data-days]');
  function planUI() {
    var l = he(), td = now().d;
    daysEl.innerHTML = [0, 1, 2, 3, 4, 5, 6].map(function (d) {
      return '<button type="button" role="radio" class="day' + (H[d] ? '' : ' closed') + '" aria-checked="' + (d === plan.d) + '" aria-label="' + (l ? 'יום ' + dayHe[d] : dayEn[d]) + '" data-d="' + d + '">' + (l ? shortHe[d] : shortEn[d]) + '</button>';
    }).join('');
    var t = H[plan.d], name = l ? 'יום ' + dayHe[plan.d] : dayEn[plan.d], pre = plan.d === td ? (l ? 'היום, ' : 'Today, ') : '';
    $('[data-planout]').innerHTML = t ? pre + name + ': <b dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</b>' : pre + name + ': <b>' + (l ? 'סגור' : 'closed') + '</b>';
    $('[data-planclock] [data-arc]').setAttribute('d', arcPath(t));
  }
  daysEl.addEventListener('click', function (e) { var b = e.target.closest('[data-d]'); if (!b) return; plan.d = +b.dataset.d; planUI(); daysEl.querySelector('[aria-checked="true"]').focus(); });
  daysEl.addEventListener('keydown', function (e) {
    var k = e.key, dir = (k === 'ArrowLeft') === rtl() ? 1 : -1;
    if (k !== 'ArrowLeft' && k !== 'ArrowRight') return; e.preventDefault(); plan.d = (plan.d + dir + 7) % 7; planUI(); daysEl.querySelector('[aria-checked="true"]').focus();
  });

  // ---------------------------------------------------------------- glyph decode for museum labels
  var GLY = 'אבגדהוזחטיכלמנסעפצקרשת0123456789#/·';
  function decode(el, txt) {
    if (still()) { el.textContent = txt; return; }
    var t0 = performance.now(), dur = 520 + txt.length * 14;
    if (el._dec) cancelAnimationFrame(el._dec);
    (function f(t) {
      var u = clamp((t - t0) / dur, 0, 1), n = Math.floor(u * txt.length), s = txt.slice(0, n);
      for (var i = n; i < txt.length; i++) s += txt[i] === ' ' ? ' ' : GLY[(Math.random() * GLY.length) | 0];
      el.textContent = s; if (u < 1) el._dec = requestAnimationFrame(f); else el._dec = 0;
    })(t0);
  }

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'עיצוב שיער - חיים', 'Haim Hair Stylist');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לחיים, 04-823-5538', 'Call Haim, 04-823-5538');
    aria('[data-t-prev]', 'הקודם', 'Previous');
    aria('[data-t-next]', 'הבא', 'Next');
    aria('[data-t-days]', 'בחרו יום', 'Pick a day');
    $$('[data-decode]').forEach(function (el) { el.textContent = el.dataset[l]; });
    var map = $('.t-map iframe'); if (map) map.title = l === 'he' ? 'Google Maps: דרך חנקין 2, מרכז זיו, חיפה' : 'Google Maps: 2 Derech Hankin, Merkaz Ziv, Haifa';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('haim123-lang', l); } catch (e) {}
    texts(l); hours(); planUI(); tick(); layout(); onScroll();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('haim123-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-box]').forEach(function (el) { el.classList.add('in'); });
    $$('.hang').forEach(function (h) { h.getAnimations().forEach(function (a) { if (a.id === 'drop') a.finish(); }); });
    layout(); onScroll(); stars.kick(); lamp.kick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- headline letters
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 6 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // ---------------------------------------------------------------- opening: short, skippable, never on still
  var op = $('[data-opening]');
  if (op) {
    if (still()) op.remove();
    else {
      op.classList.add('go');
      var close = function () { op.classList.add('done'); setTimeout(function () { op.remove(); }, 750); };
      var tm = setTimeout(close, 560);
      addEventListener('pointerdown', function () { clearTimeout(tm); close(); }, { once: true });
    }
  }

  // ---------------------------------------------------------------- entrances
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-boxes] [data-box]').forEach(function (t, i) { t.style.setProperty('--d', (i * 90) + 'ms'); });
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); });
  $$('[data-reveal],[data-tile],[data-box]').forEach(function (el) { if (still() || !rio) el.classList.add('in'); else rio.observe(el); });

  // ---------------------------------------------------------------- the wall: objects dropped onto their nails, a lamp that follows the hand
  var hero = $('[data-hero]'), wall = $('[data-wallhang]'), hangs = $$('.hang', wall);
  if (!still() && hangs[0].animate) hangs.forEach(function (h, i) {
    var a = h.animate([{ transform: 'translateY(-46px) rotate(' + (i % 2 ? 7 : -7) + 'deg)', opacity: 0 }, { transform: 'translateY(4px) rotate(' + (i % 2 ? -1.5 : 1.5) + 'deg)', opacity: 1, offset: .7 }, { transform: 'none', opacity: 1 }],
      { duration: 820, delay: 260 + i * 55, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' }); a.id = 'drop';
  });
  var lamp = (function () {
    var tx = .52, ty = .4, x = .52, y = .4, raf = 0, vis = true, user = 0, t0 = performance.now();
    wall.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = wall.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; user = performance.now(); });
    function frame(t) {
      raf = 0; if (!vis || still()) { apply(.52, .4, 0); return; }
      if (t - user > 2500) { var k = (t - t0) / 1000; tx = .5 + Math.sin(k * .55) * .3; ty = .42 + Math.sin(k * .9 + 1) * .2; }   // drifts by itself on phones
      x += (tx - x) * .06; y += (ty - y) * .06; apply(x, y, 1); raf = requestAnimationFrame(frame);
    }
    function apply(x, y, on) {
      wall.style.setProperty('--lx', (x * 100).toFixed(1) + '%'); wall.style.setProperty('--ly', (y * 100).toFixed(1) + '%');
      var dx = on ? (x - .5) * -14 : 0, dy = on ? (y - .5) * -10 : 0;
      wall.style.setProperty('--px', dx.toFixed(2)); wall.style.setProperty('--py', dy.toFixed(2));
    }
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- the sign's stars drift in the hero, parting around the hand
  var stars = (function () {
    var cv = $('[data-stars]'), c = cv.getContext('2d'), w, h, S = [], raf = 0, vis = true, px = -999, py = -999;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 22 : 46; S = []; for (var i = 0; i < n; i++) S.push({ x: Math.random() * w, y: Math.random() * h, r: 2.5 + Math.random() * 5, v: .12 + Math.random() * .3, p: Math.random() * 6.28, ox: 0, oy: 0 });
    }
    function star(x, y, r) { c.beginPath(); for (var k = 0; k < 10; k++) { var a = k * Math.PI / 5 - Math.PI / 2, rr = k % 2 ? r * .42 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); }
    function draw(t) {
      c.clearRect(0, 0, w, h);
      S.forEach(function (s) {
        var dx = s.x - px, dy = s.y - py, d = Math.hypot(dx, dy), push = d < 120 ? (120 - d) / 120 * 26 : 0;
        s.ox += ((d ? dx / d : 0) * push - s.ox) * .08; s.oy += ((d ? dy / d : 0) * push - s.oy) * .08;
        c.fillStyle = 'rgba(150,166,226,' + (.18 + .22 * (.5 + .5 * Math.sin(t / 900 + s.p))).toFixed(3) + ')';
        star(s.x + s.ox, s.y + s.oy, s.r);
      });
    }
    function frame(t) {
      raf = 0; if (!vis) return; if (still()) { draw(0); return; }
      S.forEach(function (s) { s.y -= s.v; s.x += Math.sin(t / 2000 + s.p) * .12; if (s.y < -10) { s.y = h + 10; s.x = Math.random() * w; } });
      draw(t); raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { px = py = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: function () { size(); draw(0); }, kick: kick };
  })();

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { requestAnimationFrame(function () { roll(o, true); }); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- walnut boxes and tiles: glare and tilt under the hand
  $$('[data-box]').forEach(function (b) {
    var g = $('.glass', b);
    b.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = b.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      b.style.setProperty('--mx', (x * 100) + '%'); b.style.setProperty('--my', (y * 100) + '%');
      if (!still()) { b.style.setProperty('--ty', ((x - .5) * 6).toFixed(2) + 'deg'); b.style.setProperty('--tx', ((.5 - y) * 5).toFixed(2) + 'deg'); }
    });
    b.addEventListener('pointerleave', function () { b.style.setProperty('--tx', '0deg'); b.style.setProperty('--ty', '0deg'); });
  });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- reviews: hung on a wire, swing to rest when they arrive
  $$('[data-rv]').forEach(function (c, i) {
    if (!io || !c.animate) return;
    var r = parseFloat(c.style.getPropertyValue('--r')) || 0;
    new IntersectionObserver(function (es, ob) {
      if (!es[0].isIntersecting) return; ob.disconnect(); if (still()) return;
      c.animate([{ rotate: (r - 12) + 'deg', translate: '0 -30px', opacity: 0 }, { rotate: (r + 7) + 'deg', translate: '0 0', opacity: 1, offset: .3 }, { rotate: (r - 3.5) + 'deg', offset: .55 }, { rotate: (r + 1.4) + 'deg', offset: .78 }, { rotate: r + 'deg', translate: '0 0', opacity: 1 }],
        { duration: 1500, delay: i * 120, easing: 'ease-out', fill: 'backwards' });
    }, { threshold: .25 }).observe(c);
  });

  // ---------------------------------------------------------------- footer: stars of the sign's arc, then the name letter by letter
  var arc = $('[data-farc]'), fw = $('[data-fword]');
  for (var k = 0; k < 11; k++) {
    var a = Math.PI * (k / 10), st = document.createElement('i');
    st.style.left = (50 - Math.cos(a) * 46) + '%'; st.style.top = (88 - Math.sin(a) * 80) + '%'; st.style.setProperty('--d', (k * 60) + 'ms'); st.style.marginLeft = '-10px'; arc.appendChild(st);
  }
  fw.innerHTML = fw.textContent.split('').map(function (c, i) { return '<span style="--d:' + (300 + i * 90) + 'ms">' + c + '</span>'; }).join('');
  watch($('.foot'), function (v) { if (v) $('.foot').classList.add('in'); }, { threshold: .2 });

  // ---------------------------------------------------------------- the wall walk
  var walk = $('[data-walk]'), wst = $('[data-walkstage]'), cam = $('[data-cam]'), camImg = $('img', cam), dim = $('[data-dim]'), labels = $$('[data-labels] li');
  var STOPS = [{ x: .5, y: .42, z: 1, sr: 4000 }].concat(labels.map(function (li) { return { x: +li.dataset.x, y: +li.dataset.y, z: +li.dataset.z, sr: 0 }; }));
  var IW = 1600, IHh = 2138, base = { w: 0, h: 0 }, active = -1, stepIdx = 1;
  function camAt(s) {
    var W = wst.clientWidth, Hh = wst.clientHeight, ph = phone(), fx = ph ? .5 : (rtl() ? .36 : .64), fy = ph ? .36 : .46;
    var z = 1 + (s.z - 1) * (ph ? 1 : innerWidth > 1500 ? .55 : .7);
    var bw = base.w * z, bh = base.h * z, tx = fx * W - s.x * bw, ty = fy * Hh - s.y * bh;
    tx = clamp(tx, W - bw, 0); ty = clamp(ty, Hh - bh, 0);
    return { tx: tx, ty: ty, z: z, sx: tx + s.x * bw, sy: ty + s.y * bh, sr: s.sr || clamp(.06 * bw, 70, 240) };
  }
  function mix(a, b, f) { return { tx: lerp(a.tx, b.tx, f), ty: lerp(a.ty, b.ty, f), z: lerp(a.z, b.z, f), sx: lerp(a.sx, b.sx, f), sy: lerp(a.sy, b.sy, f), sr: lerp(a.sr, b.sr, f) }; }
  function renderWalk(pos) {   // pos: 0 .. STOPS.length-1, fractional between stops
    var k = clamp(Math.floor(pos), 0, STOPS.length - 1), f = pos - k, g = smooth((f - .3) / .4);
    var c = k >= STOPS.length - 1 ? camAt(STOPS[k]) : mix(camAt(STOPS[k]), camAt(STOPS[k + 1]), g);
    cam.style.transform = 'translate3d(' + c.tx.toFixed(1) + 'px,' + c.ty.toFixed(1) + 'px,0) scale(' + c.z.toFixed(4) + ')';
    dim.style.setProperty('--sx', c.sx.toFixed(1) + 'px'); dim.style.setProperty('--sy', c.sy.toFixed(1) + 'px'); dim.style.setProperty('--sr', c.sr.toFixed(1) + 'px');
    var on = Math.round(pos); if (on < 1 && pos > .55) on = 1;
    if (on !== active) {
      active = on;
      labels.forEach(function (li, i) {
        var is = i + 1 === on; li.classList.toggle('on', is);
        if (is) { var sp = $('span[lang="' + root.lang + '"]', li); if (!sp._t) sp._t = sp.textContent; decode(sp, sp._t); }
      });
      $('[data-walkn]').innerHTML = labels.map(function (l, i) { return '<i' + (i + 1 === on ? ' class="on"' : '') + '></i>'; }).join('');
    }
  }
  $$('[data-walkctl] [data-step]').forEach(function (b) { b.addEventListener('click', function () {
    var n = clamp((active < 1 ? 0 : active) + +b.dataset.step, 1, labels.length);
    if (still()) { stepIdx = n; active = -1; renderWalk(n); return; }
    var r = walk.getBoundingClientRect(), range = walk.offsetHeight - innerHeight, y = scrollY + r.top + range * (n / (STOPS.length - 1)) * .92;
    scrollTo({ top: y, behavior: 'smooth' });
  }); });

  // ---------------------------------------------------------------- then & now
  var cut = $('[data-cut]'), cst = $('[data-cutstage]'), ca = $('[data-cuta]'), cb = $('[data-cutb]'), edge = $('[data-edge]'), capB = $('[data-capb] [data-decode]'), capA = $('[data-capa] [data-decode]'), capBShown = false, capAShown = false, edgeAng = 11;
  function renderCut(p) {
    var ph = phone(), o = smooth(p / .3), w = smooth((p - .34) / .42), t = w * 122;
    cst.style.setProperty('--ci', ((1 - o) * (ph ? 10 : 13)).toFixed(2) + '%');
    cst.style.setProperty('--cx', ((1 - o) * (ph ? 7 : 30)).toFixed(2) + '%');
    cst.style.setProperty('--cr', ((1 - o) * 22).toFixed(1) + 'px');
    cst.style.setProperty('--as', (1.06 - o * .06 + w * .04).toFixed(3));
    cst.style.setProperty('--bt', t.toFixed(2) + '%'); cst.style.setProperty('--bb', (t - 22).toFixed(2) + '%');
    cst.style.setProperty('--bs', (1.12 - smooth((p - .34) / .66) * .12).toFixed(3));
    cst.style.setProperty('--el', (t - 11).toFixed(2) + '%'); cst.style.setProperty('--ea', edgeAng.toFixed(2) + 'deg');
    cst.style.setProperty('--eo', (w > 0 && w < 1 ? 1 : 0));
    cst.style.setProperty('--cao', (1 - smooth((p - .3) / .14)).toFixed(3));
    var bo = smooth((p - .72) / .12); cst.style.setProperty('--cbo', bo.toFixed(3));
    if (bo > .2 && !capBShown) { capBShown = true; decode(capB, capB.dataset[root.lang]); } if (bo === 0) capBShown = false;
    if (p > -.2 && !capAShown) { capAShown = true; decode(capA, capA.dataset[root.lang]); }
  }

  // ---------------------------------------------------------------- scroll loop
  var nav = $('[data-nav]'), dock = $('[data-dock]'), vph = $('[data-shrink]'), vimg = $('img', vph), ticking = false;
  function prog(sec) { var r = sec.getBoundingClientRect(), range = sec.offsetHeight - innerHeight; return range > 0 ? clamp(-r.top / range, 0, 1) : 0; }
  function onScroll() {
    ticking = false;
    nav.classList.toggle('pill', scrollY > 40);
    dock.classList.toggle('show', scrollY > innerHeight * .55);
    if (still()) {
      renderWalk(stepIdx); vph.style.setProperty('--vi', 1);
      cst.removeAttribute('style'); return;
    }
    var cr = cut.getBoundingClientRect(); if (cr.bottom > 0 && cr.top < innerHeight) renderCut(prog(cut));
    var wr = walk.getBoundingClientRect(); if (wr.bottom > 0 && wr.top < innerHeight) renderWalk(prog(walk) * (STOPS.length - 1) * 1.0);
    var vr = vph.getBoundingClientRect(); if (vr.bottom > 0 && vr.top < innerHeight) vph.style.setProperty('--vi', smooth((innerHeight * .25 - vr.top) / (innerHeight * .7)).toFixed(3));
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  function layout() {
    stars.size();
    var W = wst.clientWidth, Hh = wst.clientHeight, cover = Math.max(W / IW, Hh / IHh);
    base.w = IW * cover; base.h = IHh * cover; camImg.style.width = base.w + 'px';
    edgeAng = Math.atan2(.22 * cst.clientWidth, cst.clientHeight) * 180 / Math.PI;
    vph.style.setProperty('--vx', phone() ? '8%' : '28%');
    active = -1;
  }
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { layout(); onScroll(); }, 120); });

  texts(root.lang); hours(); planUI(); layout(); onScroll();
})();
