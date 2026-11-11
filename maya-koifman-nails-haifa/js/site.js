(function () {
  var root = document.documentElement, WA = '972538979324';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 760; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'מאיה קויפמן · מניקור ופדיקור · שבטי ישראל 17, חיפה', en: 'Maya Koifman · Manicure & pedicure · 17 Shivtei Israel St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור מאיה קויפמן · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Maya Koifman · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'מאיה קויפמן', 'Maya Koifman');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו למאיה, 053-897-9324', 'Call Maya, 053-897-9324');
    aria('[data-t-wa]', 'וואטסאפ למאיה', 'WhatsApp Maya');
    aria('[data-t-file]', 'השוואה לפני ואחרי', 'Before and after comparison');
    aria('[data-t-treat]', 'טיפול', 'Treatment');
    aria('[data-t-day]', 'יום', 'Day');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: שבטי ישראל 17, חיפה' : 'Map: 17 Shivtei Israel St, Haifa'; });
    $$('.dec').forEach(function (d) { d.textContent = d.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('mk-lang', l); } catch (e) {}
    texts(l); hours(); week(); write(true); splitAll(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('mk-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-rise]').forEach(function (el) { el.classList.add('in'); });
    $$('.odo').forEach(function (o) { o.textContent = o.dataset.odo; });
    write(true); layout(); towel.kick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8.5, 17.5], 1: [8.5, 17.5], 2: [8.5, 17.5], 3: [8.5, 17.5], 4: [8.5, 17.5], 5: [9, 13.5], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], shortEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: shortEn.indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
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
    // the day as a half-moon arc: how much of today's hours has passed
    var f = !t ? 0 : clamp((n.h - t[0]) / (t[1] - t[0]), 0, 1), arc = $('[data-arc]'), dot = $('[data-arcdot]');
    $('.t-day').style.setProperty('--day', f.toFixed(3));
    if (arc && arc.getTotalLength) { var L = arc.getTotalLength(), p = arc.getPointAtLength(L * f); dot.setAttribute('cx', p.x.toFixed(1)); dot.setAttribute('cy', p.y.toFixed(1)); }
    $('[data-today]').innerHTML = t ? (l ? 'היום: ' : 'Today: ') + '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'היום סגור' : 'Closed today');
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? (t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>') : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances, odometers, decoding labels
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', i * 90 + 'ms'); }); });
  function odo(el) {
    var to = parseFloat(el.dataset.odo), dec = (el.dataset.odo.split('.')[1] || '').length, t0 = performance.now();
    (function f(t) { var k = clamp((t - t0) / 1300, 0, 1), e = 1 - Math.pow(1 - k, 3); el.textContent = (to * e).toFixed(dec); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  var GL = 'אבגדהוזחטיכלמנסעפצקרשת', GLe = 'abcdefghiklmnoprstuvwz';
  function decode(el) {
    var final = el.dataset[root.lang], n = final.length, t0 = performance.now(), set = he() ? GL : GLe;
    (function f(t) {
      var k = clamp((t - t0) / 800, 0, 1), done = Math.floor(k * n), s = '';
      for (var i = 0; i < n; i++) s += i < done || final[i] === ' ' ? final[i] : set[Math.floor(Math.random() * set.length)];
      el.textContent = s; if (k < 1 && !still()) requestAnimationFrame(f); else el.textContent = final;
    })(t0);
  }
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; el.classList.add('in'); rio.unobserve(el);
      if (!still()) { $$('.odo', el).forEach(odo); $$('.dec', el).forEach(decode); }
    });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- letters: the name out of a blur, the footer word rising
  function split(sp, start) {
    var i = start || 0, txt = sp.dataset.txt || sp.textContent; sp.dataset.txt = txt;
    sp.innerHTML = txt.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  }
  function splitAll() { $$('[data-split] .ln > span[lang]').forEach(function (s) { split(s); }); $$('[data-word] > span[lang]').forEach(function (s) { split(s); }); }
  splitAll();

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- the towel: her paper towel's embossed rosettes, lit where you point, petals drifting over it
  var towel = (function () {
    var cv = $('[data-towel]'), c = cv.getContext('2d'), off = document.createElement('canvas'), oc = off.getContext('2d');
    var w, h, dpr, raf = 0, vis = true, mx = -1, my = -1, lx = 0, ly = 0, t0 = performance.now(), dots = [], petals = [], taps = [];
    var G = 17;
    function size() {
      dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      [cv, off].forEach(function (k) { k.width = w * dpr; k.height = h * dpr; });
      c.setTransform(dpr, 0, 0, dpr, 0, 0); oc.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      var R = 120;   // rosettes like the swirls pressed into the towel in her photos
      for (var y = G / 2; y < h; y += G) for (var x = G / 2 + ((y / G) % 2 ? G / 2 : 0); x < w; x += G) {
        var cx = Math.round(x / (R * 2)) * R * 2, cy = Math.round(y / (R * 2)) * R * 2, dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
        var edge = R * (.62 + .2 * Math.cos(a * 6)), deep = r < edge && (r % 30 < 15 || r < 22) ? 1 : 0;
        dots.push({ x: x, y: y, s: deep ? 2.3 : 1.25, d: deep });
      }
      oc.clearRect(0, 0, w, h);
      dots.forEach(function (p) {
        oc.fillStyle = 'rgba(160,96,100,' + (p.d ? .22 : .12) + ')'; oc.beginPath(); oc.arc(p.x + .9, p.y + 1, p.s, 0, 6.283); oc.fill();
        oc.fillStyle = 'rgba(255,250,248,' + (p.d ? .8 : .55) + ')'; oc.beginPath(); oc.arc(p.x - .5, p.y - .6, p.s * .85, 0, 6.283); oc.fill();
      });
      if (!petals.length) for (var k = 0; k < (w < 700 ? 7 : 12); k++) petals.push(newPetal(true));
      lx = w * .7; ly = h * .35;
    }
    function newPetal(any) { return { x: Math.random() * w, y: any ? Math.random() * h : -30, vx: (Math.random() - .5) * .3, vy: .25 + Math.random() * .35, r: Math.random() * 6.28, vr: (Math.random() - .5) * .02, s: 9 + Math.random() * 10, c: Math.random() < .5 ? '232,163,176' : '212,96,126' }; }
    function petal(p) {
      c.save(); c.translate(p.x, p.y); c.rotate(p.r);
      var g = c.createLinearGradient(0, -p.s, 0, p.s); g.addColorStop(0, 'rgba(' + p.c + ',.85)'); g.addColorStop(1, 'rgba(' + p.c + ',.35)');
      c.fillStyle = g; c.beginPath(); c.moveTo(0, p.s); c.bezierCurveTo(p.s * .9, p.s * .3, p.s * .7, -p.s, 0, -p.s * .7); c.bezierCurveTo(-p.s * .7, -p.s, -p.s * .9, p.s * .3, 0, p.s); c.fill();
      c.restore();
    }
    function draw(t) {
      c.clearRect(0, 0, w, h);
      c.drawImage(off, 0, 0, w, h);
      // soft light across the relief, a peony glint where the light is
      var g = c.createRadialGradient(lx, ly, 0, lx, ly, 260); g.addColorStop(0, 'rgba(255,246,243,.55)'); g.addColorStop(1, 'rgba(255,246,243,0)');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      for (var i = 0; i < dots.length; i++) {
        var p = dots[i], dx = p.x - lx, dy = p.y - ly, d2 = dx * dx + dy * dy;
        if (d2 > 160 * 160) continue;
        var k = 1 - Math.sqrt(d2) / 160;
        c.fillStyle = 'rgba(212,96,126,' + (k * (p.d ? .55 : .3)).toFixed(3) + ')';
        c.beginPath(); c.arc(p.x - dx * k * .08, p.y - dy * k * .08, p.s * (1 + k * .5), 0, 6.283); c.fill();
      }
      taps = taps.filter(function (q) { return t - q.t < 1200; });
      taps.forEach(function (q) { var e = (t - q.t) / 1200; c.strokeStyle = 'rgba(212,96,126,' + (.5 * (1 - e)).toFixed(3) + ')'; c.lineWidth = 2; c.beginPath(); c.arc(q.x, q.y, 20 + e * 140, 0, 6.283); c.stroke(); });
      petals.forEach(petal);
    }
    function frame(t) {
      raf = 0; if (!vis || still()) { draw(t); return; }
      var tx, ty, s = (t - t0) / 1000;
      if (mx >= 0) { tx = mx; ty = my; } else { tx = w * (.5 + .38 * Math.sin(s * .35)); ty = h * (.45 + .3 * Math.sin(s * .52 + 1)); }
      lx += (tx - lx) * .08; ly += (ty - ly) * .08;
      petals.forEach(function (p, i) {
        p.x += p.vx + Math.sin(s + i) * .25; p.y += p.vy; p.r += p.vr;
        if (mx >= 0) { var dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy); if (d < 120) { p.x += dx / d * 2.2; p.y += dy / d * 1.2; } }
        if (p.y > h + 30 || p.x < -40 || p.x > w + 40) petals[i] = newPetal(false);
      });
      draw(t); raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -1; });
    hero.addEventListener('pointerdown', function (e) { var r = hero.getBoundingClientRect(); taps.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }); lx = e.clientX - r.left; ly = e.clientY - r.top; kick(); });
    watch(hero, function (v) { vis = v; kick(); });
    return { size: function () { size(); draw(performance.now()); }, kick: kick };
  })();

  // ---------------------------------------------------------------- lacquer that catches the light where you point (scroll moves it on phones)
  var deck = $('[data-deck]');
  function shine(fig, x, y) { fig.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); fig.style.setProperty('--gy', (y * 100).toFixed(1) + '%'); }
  if (fine) {
    hero.addEventListener('pointermove', function (e) {
      if (still()) return;
      var r = deck.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      deck.style.transform = 'perspective(1100px) rotateY(' + (x * 8).toFixed(2) + 'deg) rotateX(' + (-y * 8).toFixed(2) + 'deg)';
      $$('.card', deck).forEach(function (f) { var q = f.getBoundingClientRect(); shine(f, (e.clientX - q.left) / q.width, (e.clientY - q.top) / q.height); });
    });
    hero.addEventListener('pointerleave', function () { deck.style.transform = ''; });
    $$('.sp').forEach(function (f) {
      f.addEventListener('pointermove', function (e) {
        if (still()) return;
        var q = f.getBoundingClientRect(), x = (e.clientX - q.left) / q.width, y = (e.clientY - q.top) / q.height;
        shine(f, x, y); f.style.setProperty('--ry', ((x - .5) * 10).toFixed(2) + 'deg'); f.style.setProperty('--rx', (-(y - .5) * 10).toFixed(2) + 'deg');
      });
      f.addEventListener('pointerleave', function () { f.style.setProperty('--ry', '0deg'); f.style.setProperty('--rx', '0deg'); });
    });
  }

  if (fine) $('.peel-stage').addEventListener('pointermove', function (e) {
    if (still()) return;
    var x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5, c = $('[data-care]');
    c.style.setProperty('--px', (x * -14).toFixed(1) + 'px'); c.style.setProperty('--py', (y * -10).toFixed(1) + 'px');
  });

  // ---------------------------------------------------------------- the before/after file
  var cmp = $('[data-compare]'), file = $('[data-file]'), touched = false;
  function setPos(v) { v = clamp(v, 3, 97); cmp.style.setProperty('--pos', v.toFixed(1) + '%'); file.setAttribute('aria-valuenow', Math.round(v)); }
  function fromEvent(e) { var r = cmp.getBoundingClientRect(); setPos((e.clientX - r.left) / r.width * 100); }
  var drag = false;
  cmp.addEventListener('pointerdown', function (e) { drag = true; touched = true; cmp.setPointerCapture(e.pointerId); fromEvent(e); });
  cmp.addEventListener('pointermove', function (e) { if (drag) fromEvent(e); });
  cmp.addEventListener('pointerup', function () { drag = false; });
  cmp.addEventListener('pointercancel', function () { drag = false; });
  file.addEventListener('keydown', function (e) {
    var v = parseFloat(cmp.style.getPropertyValue('--pos')) || 50, s = e.shiftKey ? 10 : 3;
    if (e.key === 'ArrowLeft') { touched = true; setPos(v - s); e.preventDefault(); }
    if (e.key === 'ArrowRight') { touched = true; setPos(v + s); e.preventDefault(); }
    if (e.key === 'Home') { touched = true; setPos(3); e.preventDefault(); }
    if (e.key === 'End') { touched = true; setPos(97); e.preventDefault(); }
  });

  // ---------------------------------------------------------------- the message to Maya
  var state = { treat: null, day: null }, typing = 0;
  var T = {
    he: { mani: 'תור למניקור', pedi: 'תור לפדיקור', ingrown: 'טיפול בציפורן חודרנית' },
    en: { mani: 'a manicure', pedi: 'a pedicure', ingrown: 'an ingrown nail treatment' }
  };
  function message() {
    var l = he() ? 'he' : 'en', d = state.day === null ? '' : (l === 'he' ? ' ביום ' + dayHe[state.day] : ' on ' + dayEn[state.day]);
    if (l === 'he') {
      if (!state.treat) return 'היי מאיה, אשמח לקבוע תור' + d + '.';
      if (state.treat === 'home') return 'היי מאיה, רציתי לשאול אם אפשר טיפול בבית' + d + '.';
      return 'היי מאיה, אשמח לקבוע ' + T.he[state.treat] + d + '. מתי נוח לך?';
    }
    if (!state.treat) return 'Hi Maya, I’d like to book an appointment' + d + '.';
    if (state.treat === 'home') return 'Hi Maya, I wanted to ask whether a treatment at home is possible' + d + '.';
    return 'Hi Maya, I’d like to book ' + T.en[state.treat] + d + '. When suits you?';
  }
  var bubble = $('[data-bubble]'), send = $('[data-send]');
  function write(instant) {
    var msg = message();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
    $$('.step').forEach(function (s) { var n = +s.dataset.step; s.classList.toggle('lit', n === 1 || (n === 2 && !!state.treat) || (n === 3 && !!state.treat && state.day !== null)); });
    clearInterval(typing);
    if (instant || still()) { bubble.textContent = msg; return; }
    var i = 0; bubble.innerHTML = '<span class="caret"></span>';
    typing = setInterval(function () { i += 2; bubble.innerHTML = ''; bubble.appendChild(document.createTextNode(msg.slice(0, i))); var k = document.createElement('span'); k.className = 'caret'; bubble.appendChild(k); if (i >= msg.length) { clearInterval(typing); bubble.textContent = msg; } }, 22);
  }
  $$('[data-treat]').forEach(function (b) { b.addEventListener('click', function () {
    state.treat = b.dataset.treat; $$('[data-treat]').forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write();
  }); });
  function week() {
    var l = he();
    $('[data-week]').innerHTML = [0, 1, 2, 3, 4, 5, 6].map(function (d) {
      var t = H[d], sub = t ? hhmm(t[0]) + '<br>' + hhmm(t[1]) : (l ? 'סגור' : 'Closed');
      return '<button type="button" class="day" role="radio" aria-checked="' + (state.day === d) + '" data-day="' + d + '"' + (t ? '' : ' disabled') + ' aria-label="' + (l ? dayHe[d] : dayEn[d]) + '">' + (l ? shortHe[d] : shortEn[d]) + '<small dir="ltr">' + sub + '</small></button>';
    }).join('');
    $$('[data-day]').forEach(function (b) { b.addEventListener('click', function () {
      state.day = +b.dataset.day; $$('[data-day]').forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write();
    }); });
  }

  // a live demo the first time the section comes into view: a treatment, then a day, picked by themselves
  var demoed = false;
  watch($('#book'), function (v) {
    if (!v || demoed || still()) return; demoed = true;
    setTimeout(function () { if (!state.treat) $('[data-treat="mani"]').click(); }, 700);
    setTimeout(function () { if (state.day === null) { var d = $('[data-day="0"]'); d && d.click(); } }, 2300);
  }, { threshold: .45 });

  // ---------------------------------------------------------------- the review that fills in as you read
  var hq = $('[data-fill]'), chars = [];
  function fillSplit() {
    $$('p[lang]', hq).forEach(function (p) {
      var t = p.dataset.txt || p.textContent; p.dataset.txt = t;
      p.innerHTML = t.split(' ').map(function (w) { return '<span style="white-space:nowrap">' + w.split('').map(function (c) { return '<span class="c">' + c + '</span>'; }).join('') + '</span>'; }).join(' ');
    });
  }
  fillSplit();

  // ---------------------------------------------------------------- scroll loop
  var peel = $('[data-peel]'), stage = $('.peel-stage', peel), sheet = $('[data-sheet]'), flap = $('[data-flap]'), care = $('[data-care]'), copy = $('.care-copy');
  var work = $('[data-work]'), sps = $$('.sp'), p3 = $('.p3'), basec = $('[data-basec]'), stroke = $('[data-stroke]');
  var words = $('[data-words]'), drift = $('[data-drift]'), visit = $('[data-visit]'), vphoto = $('[data-vphoto]'), rises = $$('[data-rise]');
  var dock = $('[data-dock]'), cta = $('.hero .cta'), foot = $('[data-foot]'), page = $('.page'), vgrid = $('.vgrid'), vHome = null;
  var FIN = [-3, 2.5, -1.5, 3], spHome = [];
  var prog = function (el, a, b) { var r = el.getBoundingClientRect(), vh = innerHeight; return clamp((vh * a - r.top) / (vh * (a - b)), 0, 1); };

  // half-plane clip of the stage rectangle: keep points where x - y >= c (or < c)
  function clipRect(W, Hh, c, keep) {
    var pts = [[0, 0], [W, 0], [W, Hh], [0, Hh]], out = [], f = function (p) { return (p[0] - p[1] - c) * keep; };
    for (var i = 0; i < 4; i++) {
      var a = pts[i], b = pts[(i + 1) % 4], fa = f(a), fb = f(b);
      if (fa >= 0) out.push(a);
      if ((fa >= 0) !== (fb >= 0)) { var t = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    return out;
  }
  function poly(pts, W) {
    if (pts.length < 3) return 'polygon(0 0,0 0,0 0)';
    return 'polygon(' + pts.map(function (p) { return (rtl() ? W - p[0] : p[0]).toFixed(1) + 'px ' + p[1].toFixed(1) + 'px'; }).join(',') + ')';
  }

  function tick() {
    var vh = innerHeight, calm = still();
    nav.classList.toggle('pill', scrollY > 40);
    dock.classList.toggle('show', cta.getBoundingClientRect().bottom < 0);

    // the towel is lifted by its lower corner and the shelf photo comes up from under it
    if (!calm) {
      var pr = peel.getBoundingClientRect(), pp = clamp((vh - pr.top) / pr.height, 0, 1), W = stage.clientWidth, Hh = stage.clientHeight;
      var d = smooth((pp - .08) / .7) * (W + Hh) * 1.02, c = d - Hh;
      sheet.style.clipPath = poly(clipRect(W, Hh, c, 1), W);
      var fl = clipRect(W, Hh, c, -1).map(function (p) { return [p[1] + c, p[0] - c]; });
      flap.style.clipPath = poly(fl, W);
      care.style.setProperty('--z', lerp(1.1, 1, smooth(pp)).toFixed(4));
      var co = smooth((pp - .42) / .22); copy.style.setProperty('--co', co.toFixed(3)); copy.style.setProperty('--cy', ((1 - co) * 30).toFixed(1) + 'px');
    } else { sheet.style.clipPath = flap.style.clipPath = ''; care.style.removeProperty('--z'); copy.style.removeProperty('--co'); copy.style.removeProperty('--cy'); }

    // the four prints spread out of one stack on the velvet
    var wp = calm ? 1 : prog(work, 1, .15);
    p3.style.setProperty('--draw', (1 - smooth(wp)).toFixed(3));
    sps.forEach(function (s, i) {
      if (calm) { s.style.removeProperty('--x'); s.style.removeProperty('--y'); s.style.setProperty('--r', FIN[i] + 'deg'); return; }
      var e, x = 0, y = 0, r;
      if (phone()) {
        var q = s.getBoundingClientRect(); e = smooth((vh - q.top) / (vh * .55));
        x = (1 - e) * (i % 2 ? 40 : -40) * (rtl() ? -1 : 1); r = lerp(i % 2 ? 9 : -9, FIN[i], e); y = (1 - e) * 40;
        s.style.setProperty('--x', x.toFixed(1) + '%'); s.style.setProperty('--y', y.toFixed(1) + 'px');
        shine(s, .2 + e * .6, .2 + (1 - e) * .5);
      } else {
        e = smooth((wp - i * .07) / .62); var h0 = spHome[i] || [0, 0];
        x = h0[0] * (1 - e); y = h0[1] * (1 - e); r = lerp(-8 + i * 5, FIN[i], e);
        s.style.setProperty('--x', x.toFixed(1) + 'px'); s.style.setProperty('--y', y.toFixed(1) + 'px');
      }
      s.style.setProperty('--r', r.toFixed(2) + 'deg');
    });

    // one coat of lacquer brushed across the seam
    stroke.style.setProperty('--s', calm ? 1 : smooth(prog(basec, 1, .45)).toFixed(3));
    if (!touched) setPos(calm ? 50 : lerp(84, 18, smooth(prog(cmp, .95, .25))));

    // the quote fills in as it is read; the other reviews drift sideways
    var hp = calm ? 1 : prog(hq, .95, .35), cs = $$('.c', hq), n = cs.length;
    for (var k = 0; k < n; k++) { var o = calm ? 1 : .2 + .8 * clamp((hp * (n + 24) - k) / 24, 0, 1); cs[k].style.opacity = o === 1 ? '' : o.toFixed(2); }
    if (!calm) { var over = Math.max(0, drift.scrollWidth - words.clientWidth + 40), dp = prog(drift, 1.05, -.1); drift.style.setProperty('--dx', ((rtl() ? 1 : -1) * over * dp).toFixed(1) + 'px'); }

    // the last photo shrinks from the whole width into its frame; the cards rise beside it
    var vp = calm ? 1 : smooth(prog(vgrid, 1, .4));
    if (!calm && vHome) {
      var S = Math.max(1, Math.min(innerWidth / vHome[1], vh * .8 / vHome[2])), ox = innerWidth / 2 - vHome[0];
      vphoto.style.transform = 'translate3d(' + (ox * (1 - vp)).toFixed(1) + 'px,0,0) scale(' + lerp(S, 1, vp).toFixed(4) + ')';
      vphoto.style.zIndex = vp < 1 ? 3 : '';
    } else { vphoto.style.transform = ''; vphoto.style.zIndex = ''; }
    rises.forEach(function (r, i) { r.classList.toggle('in', calm || vp > .55 + i * .1); });

    // the curtain: the footer word rises letter by letter as the page lifts off it
    var mb = page.getBoundingClientRect().bottom, fh = foot.offsetHeight, fp = calm ? 1 : clamp((vh - mb) / fh, 0, 1);
    foot.style.setProperty('--rise', ((1 - fp) * 120).toFixed(1) + 'px');
    $$('.word .ch', foot).forEach(function (ch, i, all) { var e = calm ? 1 : smooth(fp * 1.6 - i / all.length * .6); ch.style.setProperty('--ty', ((1 - e) * 70).toFixed(1) + '%'); ch.style.setProperty('--op', e.toFixed(3)); });
  }

  function layout() {
    towel.size();
    // where each print sits relative to the centre of the spread (the stack they start from)
    var sr = $('[data-spread]').getBoundingClientRect();
    sps.forEach(function (s, i) {
      s.style.setProperty('--x', '0px'); s.style.setProperty('--y', '0px');
      var q = s.getBoundingClientRect();
      spHome[i] = [sr.left + sr.width / 2 - (q.left + q.width / 2), sr.top + sr.height / 2 - (q.top + q.height / 2)];
    });
    vphoto.style.transform = ''; var vq = vphoto.getBoundingClientRect(); vHome = [vq.left + vq.width / 2, vq.width, vq.height];
    tick();
  }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); week(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); towel.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', layout);
})();
