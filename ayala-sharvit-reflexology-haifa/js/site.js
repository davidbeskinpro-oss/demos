(function () {
  var root = document.documentElement, WA = '972503871393';
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
  var TITLE = { he: 'איילה שרביט · רפלקסולוגיה, טיפולי מגע ורוקחות טבעית · רש״י 14, חיפה', en: 'Ayala Sharvit · Reflexology, touch therapy & natural cosmetics · 14 Rashi St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור איילה ענת שרביט · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Ayala Anat Sharvit · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'איילה שרביט', 'Ayala Sharvit');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-pick]', 'איזה טיפול', 'Which treatment');
    aria('[data-t-call]', 'התקשרו לאיילה, 050-387-1393', 'Call Ayala, 050-387-1393');
    aria('[data-t-wa]', 'וואטסאפ לאיילה', 'WhatsApp Ayala');
    aria('[data-t-prev]', 'הביקורת הקודמת', 'Previous review');
    aria('[data-t-next]', 'הביקורת הבאה', 'Next review');
    $('.cb.map iframe').title = l === 'he' ? 'מפה: רש״י 14, חיפה' : 'Map: 14 Rashi St, Haifa';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ay-lang', l); } catch (e) {}
    texts(l); hours(); jarNote(); write(true); fitWord(); decodeAll(true); footPad();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); root.classList.remove('opening'); delete root.dataset.motionAuto;
    try { localStorage.setItem('ay-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    leaves.kick(); grain.kick(); ring.kick(); write(true); footPad(); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 15.5], 1: [9, 19], 2: [9, 15.5], 3: [9, 20.5], 4: [8, 14], 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
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
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : 'Open 24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento,.cbento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // name letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });
  $$('[data-rise] > span[lang]').forEach(function (sp) {
    var i = 0; sp.innerHTML = sp.textContent.split('').map(function (c) { return c === ' ' ? ' ' : '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('');
  });

  // ---------------------------------------------------------------- opening: logo + photos dealt, then the portrait is the hero
  if (root.classList.contains('opening')) {
    var layer = $('[data-opening]'), done = false;
    var finish = function () { if (done) return; done = true; layer.classList.add('out'); try { sessionStorage.setItem('ay-opened', '1'); } catch (e) {} setTimeout(function () { root.classList.remove('opening'); }, 520); };
    setTimeout(finish, 1450); layer.addEventListener('click', finish); addEventListener('keydown', finish, { once: true });
  }

  // ---------------------------------------------------------------- hero: the logo's own colours as drifting leaves that gather into the logo's arc
  var hero = $('[data-hero]');
  var leaves = (function () {
    var cv = $('[data-leaves]'), c = cv.getContext('2d'), P = [], w = 0, h = 0, raf = 0, vis = true, mx = -999, my = -999, pulses = [], t0 = performance.now(), pts = null;
    var img = new Image(); img.src = 'img/logo.png';
    function sample() {
      pts = [];
      try {
        var oc = document.createElement('canvas'), W = 216, Hh = Math.round(W * img.naturalHeight / img.naturalWidth); oc.width = W; oc.height = Hh;
        var ox = oc.getContext('2d'); ox.drawImage(img, 0, 0, W, Hh); var d = ox.getImageData(0, 0, W, Hh).data;
        for (var y = 0; y < Hh; y += 3) for (var x = 0; x < W; x += 3) { var k = (y * W + x) * 4; if (d[k + 3] > 140) pts.push({ u: x / W, v: y / Hh, col: 'rgb(' + d[k] + ',' + d[k + 1] + ',' + d[k + 2] + ')', ar: Hh / W }); }
      } catch (e) { pts = []; }
      if (!pts.length) for (var i = 0; i < 520; i++) { var a = Math.PI * (i / 520); pts.push({ u: .5 - Math.cos(a) * .5, v: .5 + Math.sin(a) * .45, col: i % 3 ? '#5cc0cc' : '#3d8fd1', ar: .5 }); }
    }
    function layout() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!pts) return;
      // the logo's arc of hands gathers around the arched portrait, as if holding it
      var hr = hero.getBoundingClientRect(), ar = $('[data-tilt]').getBoundingClientRect();
      var LW = Math.min(ar.width * 2.05, w * 1.02), LH = LW * pts[0].ar, X0 = ar.left - hr.left + ar.width / 2 - LW / 2, Y0 = ar.bottom - hr.top - LH * .93;
      var fresh = !P.length;
      if (fresh) P = pts.map(function (p) { return { tx: 0, ty: 0, x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, col: p.col, s: 2 + Math.random() * 2.6, r: Math.random() * 6.28, ph: Math.random() * 6.28, u: p.u, v: p.v }; });
      // a few free leaves drifting across the whole hero
      P.forEach(function (p) { p.tx = X0 + p.u * LW; p.ty = Y0 + p.v * LH; if (still()) { p.x = p.tx; p.y = p.ty; } });
    }
    function leaf(p, a) {
      c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.globalAlpha = a; c.fillStyle = p.col;
      c.beginPath(); c.ellipse(0, 0, p.s * 1.7, p.s * .75, 0, 0, 6.283); c.fill(); c.restore();
    }
    function frame(t) {
      raf = 0; c.clearRect(0, 0, w, h);
      var T = (t - t0) / 1000, s = still();
      pulses = pulses.filter(function (q) { return t - q.t < 1200; });
      P.forEach(function (p, i) {
        if (!s) {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy, R = 110;
          if (d2 < R * R) { var f = (1 - Math.sqrt(d2) / R) * 2.4; p.vx += dx / (Math.sqrt(d2) + 1) * f; p.vy += dy / (Math.sqrt(d2) + 1) * f; }
          pulses.forEach(function (q) { var ex = p.x - q.x, ey = p.y - q.y, dd = Math.sqrt(ex * ex + ey * ey) + 1, age = (t - q.t) / 1200, ring = age * 380; if (Math.abs(dd - ring) < 40) { p.vx += ex / dd * 3 * (1 - age); p.vy += ey / dd * 3 * (1 - age); } });
          var gx = p.tx + Math.sin(T * .7 + p.ph) * 4, gy = p.ty + Math.cos(T * .6 + p.ph) * 4;
          p.vx += (gx - p.x) * .012; p.vy += (gy - p.y) * .012; p.vx *= .9; p.vy *= .9; p.x += p.vx; p.y += p.vy; p.r += .004 + p.vx * .01;
        }
        leaf(p, .55);
      });
      if (!s && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && pts) { layout(); raf = requestAnimationFrame(frame); } }
    img.onload = function () { sample(); layout(); kick(); };
    if (fine) {
      hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
      hero.addEventListener('pointerleave', function () { mx = my = -999; });
    }
    hero.addEventListener('pointerdown', function (e) { var r = hero.getBoundingClientRect(); pulses.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }); });
    watch(hero, function (v) { vis = v; kick(); });
    return { kick: kick, layout: function () { if (pts) { layout(); kick(); } } };
  })();

  // the portrait leans toward the hand and a warm lamp follows it; on phones the lamp drifts with the scroll
  var arch = $('[data-tilt]');
  if (fine) {
    hero.addEventListener('pointermove', function (e) {
      if (still()) return; var r = arch.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      arch.style.transform = 'perspective(900px) rotateY(' + ((x - .5) * 7).toFixed(2) + 'deg) rotateX(' + ((.5 - y) * 5).toFixed(2) + 'deg)';
      arch.style.setProperty('--lx', (x * 100).toFixed(1) + '%'); arch.style.setProperty('--ly', (y * 100).toFixed(1) + '%');
    });
    hero.addEventListener('pointerleave', function () { arch.style.transform = ''; });
  }

  // ---------------------------------------------------------------- treatments: spotlight under the hand, living tiles
  var care = $('#care');
  watch(care, function (v) { care.classList.toggle('on', v); grain.vis(v); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  // body peeling: grains swirling as if rubbed in slow circles; a touch stirs them
  var grain = (function () {
    var cv = $('[data-grain]'), c = cv.getContext('2d'), G = [], w, h, raf = 0, on = false, stir = 0;
    function size() { var d = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * d; cv.height = h * d; c.setTransform(d, 0, 0, d, 0, 0);
      G = []; for (var i = 0; i < 160; i++) G.push({ a: Math.random() * 6.28, r: .15 + Math.random() * .8, s: .6 + Math.random() * 1.8, sp: .2 + Math.random() * .5, col: ['#efe2cc', '#e3a95e', '#ecbcaa', '#a9c2a6'][i % 4] }); }
    function draw(dt) {
      c.clearRect(0, 0, w, h); var cx = w * .5, cy = h * .36, rx = w * .42, ry = h * .26;
      G.forEach(function (g) { if (dt) g.a += dt * g.sp * (1 + stir * 3); c.globalAlpha = .75; c.fillStyle = g.col; c.beginPath(); c.arc(cx + Math.cos(g.a) * rx * g.r, cy + Math.sin(g.a) * ry * g.r, g.s, 0, 6.283); c.fill(); });
      stir *= .96;
    }
    var last = 0;
    function frame(t) { raf = 0; var dt = last ? Math.min(.05, (t - last) / 1000) : 0; last = t; draw(still() ? 0 : dt); if (on && !still()) raf = requestAnimationFrame(frame); }
    cv.parentNode.addEventListener('pointermove', function () { stir = Math.min(1, stir + .08); });
    cv.parentNode.addEventListener('pointerdown', function () { stir = 1; });
    return { size: function () { size(); draw(0); }, vis: function (v) { on = v; if (v && !raf) { last = 0; raf = requestAnimationFrame(frame); } }, kick: function () { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } } };
  })();

  // ---------------------------------------------------------------- the apothecary: jars lean to the hand, labels decode, a tap adds one to the note
  var chosen = {};
  var jars = $$('[data-jar]'), minis = $$('[data-mj]');
  function syncJars() {
    jars.forEach(function (j) { j.setAttribute('aria-pressed', chosen[j.dataset.jar] ? 'true' : 'false'); });
    minis.forEach(function (m) { m.setAttribute('aria-pressed', chosen[m.dataset.mj] ? 'true' : 'false'); });
    jarNote(); if (Object.keys(chosen).some(function (k) { return chosen[k]; })) lightStep(1); write();
  }
  jars.forEach(function (j) { j.addEventListener('click', function () { chosen[j.dataset.jar] = !chosen[j.dataset.jar]; syncJars(); }); });
  minis.forEach(function (m) { m.addEventListener('click', function () { chosen[m.dataset.mj] = !chosen[m.dataset.mj]; syncJars(); }); });
  function picked(l) { return jars.filter(function (j) { return chosen[j.dataset.jar]; }).map(function (j) { return j.dataset[l ? 'he' : 'en']; }); }
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function jarNote() {
    var l = he(), p = picked(l), el = $('[data-jarnote]');
    el.innerHTML = !p.length ? '' : (l ? 'נוסף לפתק לאיילה: ' + list(p, true) + '. ' : 'Added to your note to Ayala: ' + list(p, false) + '. ') + '<a href="#visit">' + (l ? 'לפתק' : 'To the note') + '</a>';
  }
  var jarBox = $('[data-jars]');
  if (fine) {
    jarBox.addEventListener('pointermove', function (e) { if (still()) return; jars.forEach(function (j) { var r = j.getBoundingClientRect(), dx = (e.clientX - (r.left + r.width / 2)) / innerWidth, dy = (e.clientY - (r.top + r.height / 2)) / innerHeight; $('svg', j).style.transform = 'rotateY(' + (dx * 40).toFixed(1) + 'deg) rotateX(' + (-dy * 24).toFixed(1) + 'deg) translateY(-4px)'; }); });
    jarBox.addEventListener('pointerleave', function () { jars.forEach(function (j) { $('svg', j).style.transform = ''; }); });
  }
  // labels decode out of scrambled letters
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'abcdefghijklmnopqrstuvwxyz' };
  $$('[data-decode] > span[lang]').forEach(function (s) { s.dataset.txt = s.textContent; });
  function decode(s, instant) {
    var txt = s.dataset.txt, g = GL[s.lang], n = 0;
    if (instant || still()) { s.textContent = txt; return; }
    var id = setInterval(function () {
      n++; s.textContent = txt.split('').map(function (ch, i) { return ch === ' ' || i < n / 2 ? ch : g[Math.floor(Math.random() * g.length)]; }).join('');
      if (n / 2 >= txt.length) { clearInterval(id); s.textContent = txt; }
    }, 34);
  }
  function decodeAll(instant) { $$('[data-decode] > span[lang]').forEach(function (s, i) { if (s.lang === root.lang) setTimeout(function () { decode(s, instant); }, instant ? 0 : i * 90); }); }
  var decoded = false;
  watch($('[data-jars]'), function (v) { if (v && !decoded) { decoded = true; decodeAll(false); } }, { threshold: .4 });

  // ---------------------------------------------------------------- the clinic: an arc of her photos, turning with time, scroll and a drag
  var ring = (function () {
    var wrap = $('[data-ringwrap]'), el = $('[data-ring]');
    $$('.rc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $$('img', k).forEach(function (i) { i.alt = ''; i.removeAttribute('data-alt-he'); }); el.appendChild(k); });
    var cards = $$('.rc', el), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = false, last = 0;
    function R() { var cw = cards[0].offsetWidth || 180; return Math.max(cw * 1.1 / (2 * Math.tan(Math.PI / N)), phone() ? 300 : innerWidth * .4); }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (6 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var r = R(), sc = scrollY * .05 * (rtl() ? 1 : -1);
      cards.forEach(function (c, i) {
        var a = rot + sc + i * step, f = Math.cos(a * Math.PI / 180), lift = f > .95 ? (f - .95) * 20 : 0;
        c.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + (r + lift * 40).toFixed(1) + 'px) scale(' + (1 + lift * .06).toFixed(3) + ')';
        c.style.filter = 'brightness(' + (.28 + .72 * Math.pow(Math.max(f, 0), 1.6)).toFixed(3) + ')';
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    el.style.transform = 'rotateX(-6deg)';
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .25; vel = dx * 2 * (rtl() ? 1 : -1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    watch($('[data-clinic]'), function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- the note to Ayala: steps light up beside a label that writes itself
  var steps = $$('[data-steps] li'), picks = $$('[data-pick]'), msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
  function lightStep(i) { steps.forEach(function (s, k) { s.classList.toggle('on', k <= i); }); }
  picks.forEach(function (b) { b.addEventListener('click', function () { picks.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write(); }); });
  ['pointerenter', 'focus'].forEach(function (ev) { $('[data-send]').addEventListener(ev, function () { lightStep(2); }); });
  function compose() {
    var l = he(), p = picks.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], tr = p.dataset[l ? 'he' : 'en'], items = picked(l);
    if (l) {
      if (!tr) return 'שלום איילה, אשמח לשאול על ' + (items.length ? list(items, true) : 'המוצרים הטבעיים שאת רוקחת') + '.';
      return 'שלום איילה, אשמח לתאם ' + tr + '.' + (items.length ? ' אשמח גם לשאול על ' + list(items, true) + '.' : '');
    }
    if (!tr) return 'Hi Ayala, I’d like to ask about ' + (items.length ? list(items, false) : 'the natural products you make') + '.';
    return 'Hi Ayala, I’d like to book ' + tr + '.' + (items.length ? ' I’d also like to ask about ' + list(items, false) + '.' : '');
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
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
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- reviews: labels land one over another
  var rvs = $$('.rv'), ri = 0, RR = [-1.6, 1.4, -.8];
  rvs.forEach(function (r, i) { r.style.setProperty('--rot', RR[i % 3] + 'deg'); });
  function showRv() { rvs.forEach(function (r, i) { r.classList.toggle('top', i === ri); r.classList.toggle('under', i === (ri + 1) % rvs.length); r.style.setProperty('--ux', (rtl() ? -18 : 18) + 'px'); r.setAttribute('aria-hidden', i === ri ? 'false' : 'true'); }); }
  $('[data-rnext]').addEventListener('click', function () { ri = (ri + 1) % rvs.length; showRv(); });
  $('[data-rprev]').addEventListener('click', function () { ri = (ri + rvs.length - 1) % rvs.length; showRv(); });
  showRv();
  var autoN = 0; watch($('[data-revs]'), function (v) { if (v && autoN === 0 && !still()) { autoN = 1; var id = setInterval(function () { if (still() || autoN++ > 2) { clearInterval(id); return; } ri = (ri + 1) % rvs.length; showRv(); }, 3800); } }, { threshold: .5 });

  // ---------------------------------------------------------------- odometer
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 4) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- footer: curtain, fitted name rising
  var foot = $('[data-foot]'), word = $('[data-fit]');
  function fitWord() { word.style.fontSize = ''; var max = foot.clientWidth - 32, w = word.scrollWidth; if (w > max) word.style.fontSize = (parseFloat(getComputedStyle(word).fontSize) * max / w).toFixed(1) + 'px'; }
  function footPad() { document.body.style.paddingBottom = still() ? '' : foot.offsetHeight + 'px'; }

  // ---------------------------------------------------------------- one scroll loop: nav pill, oil level, plate drift, the door, footer
  var nav = $('[data-nav]'), shelf = $('[data-shelf]'), fill = $('[data-fill]'), wave = $('[data-wave]'), plate = $('.shelf-plate'), stage = $('[data-doorstage]'), door = $('[data-door]');
  var pend = 0;
  function tick() {
    pend = 0; var vh = innerHeight, s = still();
    nav.classList.toggle('pill', scrollY > 60);
    var r = shelf.getBoundingClientRect();
    var lvl = s ? 1 : smooth((vh - r.top) / (vh * .85));
    fill.style.setProperty('--lvl', lvl.toFixed(4));
    var amp = s ? 0 : (1 - lvl) * 26 + 4, ph = scrollY * .02;
    wave.setAttribute('d', 'M0 40 ' + [0, 1, 2, 3, 4, 5, 6, 7].map(function (k) { var x0 = k * 150 + 75, x1 = (k + 1) * 150; return 'Q ' + x0 + ' ' + (40 + Math.sin(ph + k) * amp).toFixed(1) + ' ' + x1 + ' 40'; }).join(' ') + ' V80 H0z');
    plate.style.setProperty('--py', (s ? 0 : (r.top * -.12)).toFixed(1) + 'px');
    if (!s && stage.offsetParent) {
      var sr = stage.getBoundingClientRect(), p = smooth(-sr.top / (stage.offsetHeight - vh)), W = innerWidth, tw = Math.min(380, W * .72), th = Math.min(vh * .72, tw * 1.55);
      door.style.setProperty('--dw', lerp(W, tw, p).toFixed(1) + 'px');
      door.style.setProperty('--dh', lerp(vh, th, p).toFixed(1) + 'px');
      door.style.setProperty('--cr', lerp(0, tw / 2, p).toFixed(1) + 'px');
      door.style.setProperty('--cs', lerp(1.12, 1, p).toFixed(4));
    }
    var dh = document.documentElement.scrollHeight;
    foot.classList.toggle('show', s || scrollY + vh > dh - foot.offsetHeight - vh * .3);
    if (!s && scrollY + vh > dh - foot.offsetHeight * .55) word.classList.add('in');
  }
  addEventListener('scroll', function () { if (!pend) pend = requestAnimationFrame(tick); }, { passive: true });
  addEventListener('resize', function () { leaves.layout(); grain.size(); fitWord(); footPad(); tick(); });

  // the phone dock steps aside while the hero's own buttons are on screen
  var dock = $('[data-dock]'); watch($('.hero .cta'), function (v) { dock.classList.toggle('hide', v); });

  texts(root.lang); hours(); jarNote(); write(true); grain.size(); fitWord(); footPad(); tick();
  if (document.fonts) document.fonts.ready.then(function () { fitWord(); footPad(); });
})();
