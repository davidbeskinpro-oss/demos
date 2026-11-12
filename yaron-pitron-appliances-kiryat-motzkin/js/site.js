(function () {
  var root = document.documentElement, WA = '972533351563';
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
  var TITLE = { he: 'ירון פתרון · שירות למוצרי חשמל · דקר 34, קריית מוצקין', en: 'Yaron Pitron · Appliance service · 34 Decker St, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור ירון פתרון - שירות למוצרי חשמל · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Yaron Pitron Appliance Service · This is not the business’s official website' };

  // ---------------------------------------------------------------- glyph decode: letters settle out of scrambled ones
  var POOL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHKLMNPRSTUVWXYZ' };
  function decode(el, txt, l) {
    clearInterval(el._dec);
    if (still()) { el.textContent = txt; return; }
    var pool = POOL[l] || POOL.en, n = 0, steps = 14;
    el._dec = setInterval(function () {
      n++;
      var k = Math.floor(txt.length * n / steps);
      el.textContent = txt.slice(0, k) + txt.slice(k).replace(/\S/g, function () { return pool[Math.floor(Math.random() * pool.length)]; });
      if (n >= steps) { clearInterval(el._dec); el.textContent = txt; }
    }, 30);
  }

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'ירון פתרון', 'Yaron Pitron');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-prog]', 'תוכנית', 'Programme');
    aria('[data-t-sheet]', 'שלבי הבדיקה', 'Test steps');
    aria('[data-t-prev]', 'השלב הקודם', 'Previous step');
    aria('[data-t-next]', 'השלב הבא', 'Next step');
    aria('[data-t-bench]', 'המחשה: מולטימטר מודד גוף חימום של תנור', 'Illustration: a multimeter testing an oven heating element');
    aria('[data-t-devs]', 'מכשיר', 'Appliance');
    aria('[data-t-syms]', 'התקלה', 'The fault');
    aria('[data-t-contact]', 'יצירת קשר', 'Contact');
    aria('[data-t-pdial]', 'למקטע הבא', 'Next section');
    aria('[data-t-call]', 'התקשרו לירון, 053-335-1563', 'Call Yaron, 053-335-1563');
    aria('[data-t-wa]', 'וואטסאפ לירון', 'WhatsApp Yaron');
    $$('.tagpin').forEach(function (t) { t.setAttribute('aria-label', t.dataset[l]); if (t.classList.contains('on')) $('.tx', t).textContent = t.dataset[l]; });
    markT.textContent = l === 'he' ? 'קרע' : 'Break';
    week();
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('yp-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout(); bench.say(true); pd.label(true);
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('yp-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    hero.classList.add('ready');
    layout(); drum.kick(); line.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9, 17], 1: [9, 17], 2: [9, 17], 3: [9, 17], 4: [9, 17], 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  var all247 = Object.keys(H).every(function (k) { return H[k] && H[k][0] === 0 && H[k][1] === 24; });
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (all247) { open = true; txt = l ? 'פתוח 24/7' : 'Open 24/7'; }
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
    $$('[data-week] span').forEach(function (s, i) { s.classList.toggle('today', i === n.d); });
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
  function week() {
    var lab = he() ? ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    $('[data-week]').innerHTML = lab.map(function (d, i) { return '<span class="' + (H[i] ? 'work' : '') + '"><i></i>' + d + '</span>'; }).join('');
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter out of a blur
  $$('[data-split] .ln span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 10 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- HERO: drum, water and suds behind the glass, light on the glass
  var porthole = $('[data-porthole]'), drumImg = $('[data-drum]'), wcv = $('[data-water]'), wc = wcv.getContext('2d');
  var scenes = $$('[data-scene]'), progBtns = $$('[data-progbtn]'), progKnob = $('[data-progknob]'), scene = 0, userPicked = false;
  var LEVEL = [.4, 0, 0];
  var drum = (function () {
    var raf = 0, vis = true, last = 0, rot = 0, level = .4, t = 0, W = 0, Hh = 0, gx = 32, gy = 26, tx = 32, ty = 26, hand = false, bub = [], foam = [], spin = 0, drain = 0;
    function size() { var d = Math.min(2, devicePixelRatio || 1); W = wcv.clientWidth; Hh = wcv.clientHeight; wcv.width = W * d; wcv.height = Hh * d; wc.setTransform(d, 0, 0, d, 0, 0); foam = []; for (var i = 0; i < 26; i++) foam.push({ x: Math.random(), r: 2 + Math.random() * 5, ph: Math.random() * 6 }); }
    function draw() {
      wc.clearRect(0, 0, W, Hh);
      var L = level * (1 - drain); if (L < .005) return;
      var base = Hh * (1 - L), slope = -clamp(spin / 900, 0, .45) * (rtl() ? -1 : 1), amp = 5 + clamp(spin / 60, 0, 10);
      var ys = [];
      wc.beginPath(); wc.moveTo(0, Hh);
      for (var x = 0; x <= W + 8; x += 8) {
        var y = base + (x - W / 2) * slope + amp * Math.sin(x * .021 + t * 2.3) + amp * .55 * Math.sin(x * .047 - t * 3.2);
        ys.push(y); wc.lineTo(x, y);
      }
      wc.lineTo(W, Hh); wc.closePath();
      wc.fillStyle = 'rgba(127,208,212,.30)'; wc.fill();
      wc.beginPath(); ys.forEach(function (y, i) { i ? wc.lineTo(i * 8, y) : wc.moveTo(0, y); });
      wc.strokeStyle = 'rgba(225,250,250,.6)'; wc.lineWidth = 2.2; wc.stroke();
      // suds riding the surface
      wc.fillStyle = 'rgba(245,252,252,.55)';
      foam.forEach(function (f) { var x = f.x * W, y = ys[Math.round(x / 8)] || base; wc.beginPath(); wc.arc(x + Math.sin(t + f.ph) * 3, y - f.r * .4, f.r * (.8 + .2 * Math.sin(t * 2 + f.ph)), 0, 6.283); wc.fill(); });
      // bubbles rising through the water, wobbling, popping at the surface
      wc.strokeStyle = 'rgba(235,252,252,.7)'; wc.lineWidth = 1.2;
      bub.forEach(function (b) { wc.beginPath(); wc.arc(b.x * W + Math.sin(b.ph) * 4, b.y, b.r, 0, 6.283); wc.stroke(); });
    }
    function frame(ts) {
      raf = 0;
      var dt = last ? Math.min(.05, (ts - last) / 1000) : .016; last = ts; t += dt;
      var hr = hero.getBoundingClientRect();
      drain = clamp(-hr.top / (hr.height * .55), 0, 1);
      spin = 16 + drain * 520;                                   // the spin cycle winds up as the page drains
      rot += spin * dt * (rtl() ? -1 : 1);
      drumImg.style.transform = 'scale(1.18) rotate(' + rot.toFixed(2) + 'deg)';
      level = lerp(level, LEVEL[scene], .06);
      if (level * (1 - drain) > .05 && Math.random() < .35) bub.push({ x: .15 + Math.random() * .7, y: Hh + 4, r: 1.5 + Math.random() * 3.5, vy: 26 + Math.random() * 40, ph: Math.random() * 6 });
      var surf = Hh * (1 - level * (1 - drain));
      bub = bub.filter(function (b) { b.y -= b.vy * dt; b.ph += dt * 5; return b.y > surf + 2; });
      if (!hand) { tx = 30 + Math.sin(t * .4) * 6; ty = 24 + Math.cos(t * .33) * 4; }
      gx = lerp(gx, tx, .12); gy = lerp(gy, ty, .12);
      porthole.style.setProperty('--gx', gx.toFixed(1) + '%'); porthole.style.setProperty('--gy', gy.toFixed(1) + '%');
      draw();
      if (vis && !still()) raf = requestAnimationFrame(frame);
    }
    porthole.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = porthole.getBoundingClientRect(); hand = true; tx = (e.clientX - r.left) / r.width * 100; ty = (e.clientY - r.top) / r.height * 100; });
    porthole.addEventListener('pointerleave', function () { hand = false; });
    porthole.addEventListener('pointerdown', function () { if (still()) return; for (var i = 0; i < 14; i++) bub.push({ x: .3 + Math.random() * .4, y: Hh - Math.random() * 30, r: 2 + Math.random() * 4, vy: 60 + Math.random() * 60, ph: Math.random() * 6 }); });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (still()) { drumImg.style.transform = ''; level = LEVEL[scene]; drain = 0; spin = 0; size(); draw(); return; } if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    return { size: function () { size(); draw(); }, kick: kick };
  })();

  function pick(i, user) {
    if (user) userPicked = true;
    if (i === scene) return;
    progBtns.forEach(function (b, k) { b.setAttribute('aria-checked', k === i ? 'true' : 'false'); });
    progKnob.style.setProperty('--a', [-40, 0, 40][i] + 'deg');
    var nxt = scenes[i], prev = scenes[scene]; scene = i;
    if (still()) { scenes.forEach(function (s) { s.classList.remove('in'); s.classList.toggle('on', s === nxt); }); drum.kick(); return; }
    scenes.forEach(function (s) { s.classList.remove('in'); });
    nxt.classList.add('in');
    clearTimeout(pick._t);
    pick._t = setTimeout(function () { scenes.forEach(function (s) { s.classList.toggle('on', s === nxt); }); nxt.classList.remove('in'); }, 820);
    if (prev) prev.classList.add('on');
  }
  progBtns.forEach(function (b, i) { b.addEventListener('click', function () { pick(i, true); }); });
  // the knob steps through the three programmes once by itself, then waits for the visitor
  var autoN = 0, heroVis = true;
  watch(hero, function (v) { heroVis = v; });
  var autoT = setInterval(function () { if (userPicked || still() || !heroVis) return; autoN++; pick(autoN % 3); if (autoN >= 3) clearInterval(autoT); }, 4200);

  // ---------------------------------------------------------------- MACHINES: the water line, then the sideways rail
  var mach = $('[data-rail]'), track = $('[data-track]'), railbar = $('[data-railbar]'), mcs = $$('[data-mc]'), waveP = $('[data-waveedge]'), travel = 0, machOn = false;
  watch(mach, function (v) { machOn = v; mach.classList.toggle('on', v); if (v) waveKick(); });
  var waveRaf = 0, wt = 0, wvel = 0, lastY = scrollY;
  function wave(ts) {
    waveRaf = 0; wt = ts / 1000;
    var d = scrollY - lastY; lastY = scrollY; wvel = lerp(wvel, clamp(Math.abs(d), 0, 60), .08);
    var A = 10 + wvel * .5, pts = 'M0 ', i;
    for (i = 0; i <= 24; i++) { var x = i * 60, y = 60 + A * Math.sin(i * .55 + wt * 1.6) + A * .5 * Math.sin(i * 1.3 - wt * 2.4); pts += (i ? 'L' + x + ' ' : '') + y.toFixed(1) + ' '; }
    waveP.setAttribute('d', pts + 'V120 H0Z');
    var r = mach.getBoundingClientRect();
    if (!still() && r.top > -200 && r.top < innerHeight + 200) waveRaf = requestAnimationFrame(wave);
  }
  function waveKick() { if (!waveRaf && !still()) waveRaf = requestAnimationFrame(wave); }
  function railLayout() {
    var pin = !still();
    mach.classList.toggle('pin', pin);
    track.style.transform = '';
    if (!pin) { mach.style.height = ''; return; }
    var view = track.parentNode.clientWidth;
    travel = Math.max(0, track.scrollWidth - view + parseFloat(getComputedStyle(track).paddingLeft) * 0);
    mach.style.height = (innerHeight + travel + innerHeight * .32) + 'px';
  }
  mcs.forEach(function (c) {
    var ph = $('.mc-ph', c);
    ph.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse' || still()) return; var r = ph.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; ph.querySelector('img').style.setProperty('--tx', (-x * 22).toFixed(1) + 'px'); ph.querySelector('img').style.setProperty('--ty', (-y * 18).toFixed(1) + 'px'); });
    ph.addEventListener('pointerleave', function () { var im = ph.querySelector('img'); im.style.setProperty('--tx', '0px'); im.style.setProperty('--ty', '0px'); });
  });
  var pins = $$('.tagpin');
  pins.forEach(function (p) {
    if (parseFloat(p.style.getPropertyValue('--x')) > .6) p.classList.add('flip');
    p.addEventListener('mouseenter', function () { p._hold = true; tag(p, true); });
    p.addEventListener('mouseleave', function () { p._hold = false; });
    p.addEventListener('click', function () { p._hold = !p.classList.contains('on'); tag(p, p._hold); });
  });
  function tag(p, on) {
    if (on === p.classList.contains('on')) return;
    p.classList.toggle('on', on);
    var tx = $('.tx', p), l = root.lang;
    if (!on) { clearInterval(tx._dec); tx.textContent = ''; return; }
    decode(tx, p.dataset[l], l);
  }

  // ---------------------------------------------------------------- THE TEST: the bench, driven by s in [0,4)
  var check = $('[data-check]'), ckTrack = $('[data-cktrack]'), sheetLis = $$('[data-sheet] li'), say = $('[data-cksay]');
  var knob = $('[data-knob]'), lcdG = $('[data-lcd]'), lcdU = $('[data-lcdu]'), plug = $('[data-plug]'), cord = $('[data-cord]'), lugs = $('[data-lugs]');
  var oldEl = $('[data-old]'), newEl = $('[data-new]'), spark = $('[data-spark]'), prR = $('[data-prober]'), prB = $('[data-probeb]'), leadR = $('[data-leadr]'), leadB = $('[data-leadb]');
  var NS = 'http://www.w3.org/2000/svg';
  // mark the break: a dashed ring and a word, drawn over the old element
  var markC = document.createElementNS(NS, 'circle'); markC.setAttribute('cx', 826); markC.setAttribute('cy', 440); markC.setAttribute('r', 46);
  markC.setAttribute('style', 'fill:none;stroke:#ff7a1f;stroke-width:4;stroke-dasharray:10 8;opacity:0');
  var markT = document.createElementNS(NS, 'text'); markT.setAttribute('x', 826); markT.setAttribute('y', 378);
  markT.setAttribute('style', 'font:600 26px "IBM Plex Sans Hebrew",sans-serif;fill:#ff7a1f;text-anchor:middle;opacity:0');
  oldEl.appendChild(markC); oldEl.appendChild(markT);
  // seven-segment digits on the meter's own screen
  var SEG = { '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc', '5': 'afgcd', '6': 'afgedc', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg', 'O': 'abcdef', 'L': 'def', ' ': '', '-': 'g' };
  var digits = [], dps = [];
  (function () {
    var w = 34, h = 64, t = 7, y = 128;
    [110, 150, 190, 230].forEach(function (x) {
      var g = {}, geo = { a: [x + 4, y, w - 8, t], b: [x + w - t, y + 4, t, h / 2 - 6], c: [x + w - t, y + h / 2 + 2, t, h / 2 - 6], d: [x + 4, y + h - t, w - 8, t], e: [x, y + h / 2 + 2, t, h / 2 - 6], f: [x, y + 4, t, h / 2 - 6], g: [x + 4, y + h / 2 - t / 2, w - 8, t] };
      Object.keys(geo).forEach(function (k) { var r = document.createElementNS(NS, 'rect'), q = geo[k]; r.setAttribute('x', q[0]); r.setAttribute('y', q[1]); r.setAttribute('width', q[2]); r.setAttribute('height', q[3]); r.setAttribute('rx', 2.5); r.setAttribute('class', 'lcd-seg'); r.setAttribute('transform', 'skewX(-6)'); lcdG.appendChild(r); g[k] = r; });
      digits.push(g);
      var dp = document.createElementNS(NS, 'rect'); dp.setAttribute('x', x + w + 1); dp.setAttribute('y', y + h - t); dp.setAttribute('width', t); dp.setAttribute('height', t); dp.setAttribute('rx', 2); dp.setAttribute('class', 'lcd-seg'); dp.setAttribute('transform', 'skewX(-6)'); lcdG.appendChild(dp); dps.push(dp);
    });
  })();
  function lcdShow(str, dpAt, unit) {     // str: 4 chars, dpAt: index of digit followed by the point, or -1
    for (var i = 0; i < 4; i++) { var on = SEG[str[i]] || ''; 'abcdefg'.split('').forEach(function (k) { digits[i][k].classList.toggle('on', on.indexOf(k) >= 0); }); dps[i].classList.toggle('on', i === dpAt); }
    lcdU.textContent = unit || '';
  }
  var POSE = { restR: [420, 735, 62], restB: [455, 748, 70], togR: [468, 215, -20], togB: [474, 217, 20], termR: [524, 297, -32], termB: [524, 517, -48] };
  function mixPose(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
  function setProbe(g, p) { g.setAttribute('transform', 'translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ') rotate(' + p[2].toFixed(2) + ')'); }
  function topOf(p) { var a = p[2] * Math.PI / 180; return [p[0] + 150 * Math.sin(a), p[1] - 150 * Math.cos(a)]; }
  function leadPath(a, b) { var sag = 90 + Math.abs(a[0] - b[0]) * .15; return 'M' + a[0] + ' ' + a[1] + ' C ' + a[0] + ' ' + (a[1] + sag) + ', ' + b[0] + ' ' + (b[1] + sag * .8) + ', ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1); }
  var SAY = [
    { he: 'לפני כל בדיקה מנתקים את המכשיר מהחשמל.', en: 'Before any test, the appliance is unplugged.' },
    { he: 'מצמידים את חודי המדידה: 0.2 אוהם, המולטימטר תקין.', en: 'Probes touched together: 0.2 Ω, the meter is fine.' },
    { he: 'OL על גוף החימום: אין רציפות, יש בו קרע.', en: 'OL across the element: no continuity, it has a break.' },
    { he: 'גוף חימום חדש נכנס במקום הישן.', en: 'A new element goes in where the old one was.' },
    { he: '26.4 אוהם: בדיוק מה שגוף חימום של 2,000 וואט אמור להראות.', en: '26.4 Ω: just what a 2,000 W element should read.' }
  ];
  var STILL_S = [0.9, 2.05, 2.95, 3.95];
  var bench = (function () {
    var s = 0, sayIdx = -1;
    function render(v) {
      s = clamp(v, 0, 3.999);
      // 1 · unplug: the plug leaves the socket, the cord goes slack
      var out = smooth((s - .15) / .5), px = -70 * out;
      plug.setAttribute('transform', 'translate(' + px.toFixed(1) + ' ' + (8 * out).toFixed(1) + ')');
      cord.setAttribute('d', 'M470 610 C 560 ' + (690 + 30 * out).toFixed(0) + ', ' + (700 + px * .5).toFixed(0) + ' ' + (650 + 30 * out).toFixed(0) + ', ' + (770 + px).toFixed(1) + ' ' + (626 + 8 * out).toFixed(1));
      // 2 · the wires come off the terminals, the knob turns from OFF to ohms
      var lo = smooth((s - 1) / .25) * (1 - smooth((s - 3.92) / .07) * 0);
      lugs.setAttribute('transform', 'translate(' + (-34 * lo).toFixed(1) + ' 0)');
      var ka = lerp(147, 266, smooth((s - 1.05) / .25));
      knob.setAttribute('transform', 'rotate(' + ka.toFixed(2) + ' 193.15 396.25)');
      // probes: rest → touched together → on the old terminals → away → on the new terminals
      var pr, pb, tTog = smooth((s - 1.3) / .2), tTerm = smooth((s - 1.62) / .23), tAway = smooth((s - 2.1) / .2), tBack = smooth((s - 3) / .25);
      if (s < 1.62) { pr = mixPose(POSE.restR, POSE.togR, tTog); pb = mixPose(POSE.restB, POSE.togB, tTog); }
      else if (s < 2.1) { pr = mixPose(POSE.togR, POSE.termR, tTerm); pb = mixPose(POSE.togB, POSE.termB, tTerm); }
      else if (s < 3) { pr = mixPose(POSE.termR, POSE.restR, tAway); pb = mixPose(POSE.termB, POSE.restB, tAway); }
      else { pr = mixPose(POSE.restR, POSE.termR, tBack); pb = mixPose(POSE.restB, POSE.termB, tBack); }
      setProbe(prR, pr); setProbe(prB, pb);
      leadR.setAttribute('d', leadPath([287.5, 594.3], topOf(pr))); leadB.setAttribute('d', leadPath([250, 646], topOf(pb)));
      // 3 · the broken element slides out, a new one slides in
      var o = smooth((s - 2.3) / .35), n = smooth((s - 2.65) / .35);
      oldEl.setAttribute('transform', 'translate(' + (520 * o).toFixed(1) + ' 0)'); oldEl.style.opacity = (1 - o).toFixed(3);
      newEl.setAttribute('transform', 'translate(' + (520 * (1 - n)).toFixed(1) + ' 0)'); newEl.style.opacity = n.toFixed(3);
      // the break is marked once the meter has said OL on it
      var mk = smooth((s - 1.85) / .12);
      markC.style.opacity = mk.toFixed(3); markT.style.opacity = mk.toFixed(3); spark.style.opacity = (mk * .45).toFixed(3);
      // the screen
      if (s < 1.25) lcdShow('    ', -1, '');
      else if (s < 1.62 && tTog > .96) lcdShow('  02', 2, 'Ω'); // taste-skill-ignore: the meter's own LCD digits
      else if (s >= 3 && tBack > .96) { var r = 26.4 * smooth((s - 3.25) / .35), d = Math.round(r * 10), str = ('   ' + d).slice(-3); lcdShow(' ' + (str[0] === ' ' ? ' ' : str[0]) + (str[1] === ' ' ? '0' : str[1]) + str[2], 2, 'Ω'); }
      else lcdShow('  OL', -1, 'MΩ');
      // the steps sheet
      var st = s < 1 ? 0 : s < 2.2 ? 1 : s < 3 ? 2 : 3;
      sheetLis.forEach(function (li, i) { li.classList.toggle('done', i < st || (i === 3 && s > 3.6)); li.classList.toggle('now', i === st); });
      var si = s < 1.3 ? 0 : s < 1.75 ? 1 : s < 2.25 ? 2 : s < 3.2 ? 3 : 4;
      if (si !== sayIdx) { sayIdx = si; sayIt(); }
    }
    function sayIt(instant) { var l = root.lang, t = SAY[sayIdx][l]; if (instant) { say.textContent = t; return; } decode(say, t, l); }
    return { render: render, get: function () { return s; }, say: function (i) { if (sayIdx >= 0) sayIt(i); } };
  })();
  var tw = 0;
  function tweenTo(target) {
    cancelAnimationFrame(tw);
    if (still()) { bench.render(target); return; }
    var from = bench.get(), t0 = performance.now(), dur = 900 + Math.abs(target - from) * 350;
    (function st(t) { var u = clamp((t - t0) / dur, 0, 1), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; bench.render(lerp(from, target, e)); if (u < 1) tw = requestAnimationFrame(st); })(t0);
  }
  function goStep(i) {
    i = clamp(i, 0, 3);
    if (check.classList.contains('pin')) {
      var top = ckTrack.getBoundingClientRect().top + scrollY, len = ckTrack.offsetHeight - innerHeight;
      scrollTo({ top: top + len * (STILL_S[i] / 4), behavior: 'smooth' });
    } else tweenTo(STILL_S[i]);
  }
  $$('[data-ckstep]').forEach(function (b) { b.addEventListener('click', function () { goStep(+b.dataset.ckstep); }); });
  function curStep() { var s = bench.get(); return s < 1 ? 0 : s < 2.2 ? 1 : s < 3 ? 2 : 3; }
  $('[data-ckprev]').addEventListener('click', function () { goStep(curStep() - 1); });
  $('[data-cknext]').addEventListener('click', function () { goStep(curStep() + 1); });
  function checkLayout() {
    var pin = !still();
    check.classList.toggle('pin', pin);
    ckTrack.style.height = pin ? (innerHeight * 3.6) + 'px' : '';
    if (!pin) bench.render(STILL_S[curStep()]);
  }

  // ---------------------------------------------------------------- REVIEWS: the pulley line
  var revs = $('[data-revs]'), lineEl = $('[data-line]'), cards = $$('.rv', lineEl), rope = $('[data-ropepath]'), rope2 = $('[data-ropepath2]'), pulleys = $$('[data-pulley]');
  var line = (function () {
    var W = 0, cw = 0, gap = 0, sag = 0, off = 0, lastOff = 0, ang = cards.map(function () { return 0; }), av = cards.map(function () { return 0; }), raf = 0, vis = false, range = 0;
    function y(x) { var u = clamp(x / W, 0, 1); return 18 + sag * 4 * u * (1 - u); }
    function size() {
      W = lineEl.clientWidth; cw = cards[0].offsetWidth; gap = cw + (phone() ? 34 : 56); sag = Math.min(80, W * .06);
      range = Math.max(0, cards.length * gap - W * .7);
      var mh = 0; cards.forEach(function (c) { mh = Math.max(mh, c.offsetHeight); });
      lineEl.style.setProperty('--lh', (still() ? mh + 90 : mh + sag + 44) + 'px');
      var d = 'M0 18 Q ' + (W / 2) + ' ' + (18 + sag * 2) + ' ' + W + ' 18';
      rope.setAttribute('d', d); rope2.setAttribute('d', d);
    }
    function place() {
      var free = still();
      revs.classList.toggle('free', free);
      if (free) return;
      cards.forEach(function (c, i) {
        var cx = W * .18 + cw / 2 + i * gap - off; if (rtl()) cx = W - cx;
        c.style.transform = 'translate(' + (cx - cw / 2).toFixed(1) + 'px,' + (y(cx) + 4).toFixed(1) + 'px) rotate(' + ang[i].toFixed(2) + 'deg)';
      });
      rope2.style.strokeDashoffset = ((rtl() ? off : -off)).toFixed(1);
      pulleys.forEach(function (p) { p.style.transform = 'rotate(' + ((rtl() ? -off : off) / 27 * 57.3).toFixed(1) + 'deg)'; });
    }
    function target() { var r = revs.getBoundingClientRect(), p = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1); return range * smooth((p - .2) / .62); }
    function frame() {
      raf = 0;
      off = lerp(off, target(), .14);
      var v = off - lastOff; lastOff = off;
      cards.forEach(function (c, i) { var tg = clamp(v * (rtl() ? .5 : -.5) * (1 + i * .07), -14, 14); av[i] += (tg - ang[i]) * .08; av[i] *= .88; ang[i] += av[i]; });
      place();
      if (vis && !still()) raf = requestAnimationFrame(frame);
    }
    watch(revs, function (v) { vis = v; kick(); });
    function kick() { if (still()) { place(); return; } if (!raf) raf = requestAnimationFrame(frame); }
    return { size: function () { size(); off = lastOff = target(); place(); }, kick: kick };
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
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 4) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- MESSAGE: the control panel writes to Yaron
  var DEV = { washer: { he: 'מכונת הכביסה', en: 'washing machine', f: true }, dryer: { he: 'מייבש הכביסה', en: 'tumble dryer' }, oven: { he: 'התנור', en: 'oven' }, other: { he: 'מוצר החשמל', en: 'appliance' } };
  var SYM = {
    off: { m: 'לא נדלק', f: 'לא נדלקת', en: 'won’t turn on' },
    leak: { m: 'דולף מים', f: 'דולפת מים', en: 'is leaking water' },
    heat: { m: 'לא מחמם', f: 'לא מחממת', en: 'isn’t heating' },
    trip: { m: 'מקפיץ את הפחת', f: 'מקפיצה את הפחת', en: 'keeps tripping the power' },
    noise: { m: 'עושה רעש חזק', f: 'עושה רעש חזק', en: 'is making a loud noise' },
    door: { door: true },
    other: { m: 'לא עובד כמו שצריך', f: 'לא עובדת כמו שצריך', en: 'isn’t working right' }
  };
  var devBtns = $$('[data-dev]'), symBtns = $$('[data-sym]'), steps = $$('[data-step]'), msgEl = $('[data-msg]'), sendA = $('[data-send]');
  var dial = $('[data-dial]'), dialCap = $('[data-dialcap]'), shown = '', typing = 0, chatSeen = false;
  var panel = $('#panel');
  watch(panel, function (v) { panel.classList.toggle('on', v); });
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function sel(list, attr) { var b = list.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0]; return b.dataset[attr]; }
  function compose() {
    var l = he(), d = DEV[sel(devBtns, 'dev')], s = SYM[sel(symBtns, 'sym')];
    if (l) return s.door ? 'שלום ירון, הדלת של ' + d.he + ' שלי לא נסגרת. אשמח לתאם בדיקה.' : 'שלום ירון, ' + d.he + ' שלי ' + (d.f ? s.f : s.m) + '. אשמח לתאם בדיקה.';
    return s.door ? 'Hi Yaron, the door of my ' + d.en + ' won’t close. Could we set up a visit?' : 'Hi Yaron, my ' + d.en + ' ' + s.en + '. Could we set up a visit?';
  }
  function write(instant) {
    var target = compose();
    sendA.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
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
  watch($('[data-console]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });
  function radio(list, b) { list.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); }
  devBtns.forEach(function (b) { b.addEventListener('click', function () { radio(devBtns, b); lightStep(0); write(); }); });
  function symAngle(i) { return -135 + i * 45; }
  function setSym(i) { i = clamp(i, 0, symBtns.length - 1); radio(symBtns, symBtns[i]); dialCap.style.setProperty('--a', symAngle(i) + 'deg'); lightStep(1); write(); }
  symBtns.forEach(function (b, i) { b.addEventListener('click', function () { setSym(i); }); });
  dialCap.style.setProperty('--a', symAngle(1) + 'deg');
  (function () {   // drag the knob round; it snaps to the nearest fault
    var drag = false, moved = false;
    function ang(e) { var r = dial.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); return Math.atan2(dx, -dy) * 180 / Math.PI; }
    dial.addEventListener('pointerdown', function (e) { drag = true; moved = false; dial.classList.add('drag'); dial.setPointerCapture(e.pointerId); });
    dial.addEventListener('pointermove', function (e) { if (!drag) return; moved = true; dialCap.style.setProperty('--a', clamp(ang(e), -135, 135).toFixed(1) + 'deg'); });
    dial.addEventListener('pointerup', function (e) {
      if (!drag) return; drag = false; dial.classList.remove('drag');
      if (moved) setSym(Math.round((clamp(ang(e), -135, 135) + 135) / 45));
      else { var cur = symBtns.indexOf(symBtns.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0]); setSym((cur + 1) % symBtns.length); }
    });
    dial.addEventListener('pointercancel', function () { drag = false; dial.classList.remove('drag'); });
  })();
  sendA.addEventListener('pointerenter', function () { lightStep(2); });
  sendA.addEventListener('focus', function () { lightStep(2); });
  sendA.addEventListener('click', function () { lightStep(2); });

  // ---------------------------------------------------------------- bento spotlight
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- footer: the name fits its width; the drum inside it turns as you arrive
  var foot = $('[data-foot]'), fword = $('[data-fword]');
  function fitWord() { fword.style.fontSize = '100px'; var w = fword.scrollWidth, avail = foot.clientWidth - 2 * parseFloat(getComputedStyle(foot).paddingLeft); fword.style.fontSize = Math.min(260, Math.max(40, 100 * avail * .96 / w)).toFixed(1) + 'px'; }

  // ---------------------------------------------------------------- the programme dial (desktop) and the two keys (phone)
  var pdial = $('[data-pdial]'), pdKnob = $('[data-pdknob]'), pdLab = $('[data-pdlab]'), keys = $('[data-keys]');
  var SECT = [['top', 'פתיחה', 'Start'], ['machines', 'מכשירים', 'Appliances'], ['check', 'הבדיקה', 'The test'], ['reviews', 'ביקורות', 'Reviews'], ['panel', 'הודעה', 'Message'], ['faq', 'שאלות', 'Questions'], ['contact', 'קשר', 'Contact']];
  var pd = (function () {
    var cur = -1;
    function update() {
      var i = 0; SECT.forEach(function (s, k) { var el = document.getElementById(s[0]); if (el && el.getBoundingClientRect().top < innerHeight * .45) i = k; });
      if (i !== cur) { cur = i; pdKnob.style.setProperty('--a', (-150 + i * 50) + 'deg'); label(); }
    }
    function label(instant) { if (cur < 0) return; var l = root.lang, t = SECT[cur][l === 'he' ? 1 : 2]; instant ? (pdLab.textContent = t) : decode(pdLab, t, l); }
    pdial.addEventListener('click', function () { var n = SECT[(cur + 1) % SECT.length][0]; document.getElementById(n).scrollIntoView({ behavior: still() ? 'auto' : 'smooth' }); });
    return { update: update, label: label };
  })();

  // ---------------------------------------------------------------- one scroll loop
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    pdial.classList.toggle('show', scrollY > vh * .6);
    keys.classList.toggle('show', scrollY > 260);
    pd.update();
    if (!calm) { drum.kick(); waveKick(); line.kick(); }
    // rail: sideways with the scroll; the labels decode on the card in front
    if (!calm && mach.classList.contains('pin')) {
      var r = mach.getBoundingClientRect(), p = clamp(-r.top / Math.max(1, travel), 0, 1);
      track.style.transform = 'translate3d(' + ((rtl() ? 1 : -1) * travel * p).toFixed(1) + 'px,0,0)';
      railbar.parentNode.style.setProperty('--p', p.toFixed(3)); railbar.style.setProperty('--p', p.toFixed(3));
      // the rail settles back and dims as the next card lands over it
      var cr = check.getBoundingClientRect(), k = clamp(1 - cr.top / vh, 0, 1);
      $('.rail-stick', mach).style.transform = k > 0 ? 'scale(' + (1 - k * .05).toFixed(4) + ')' : '';
      $('.rail-stick', mach).style.filter = k > 0 ? 'brightness(' + (1 - k * .35).toFixed(3) + ')' : '';
      var cx = innerWidth / 2;
      mcs.forEach(function (c) { var b = c.getBoundingClientRect(), front = Math.abs(b.left + b.width / 2 - cx) < b.width * .55 && r.top < vh * .5 && r.bottom > vh * .5; $$('.tagpin', c).forEach(function (t, j) { if (!t._hold) { clearTimeout(t._tm); if (front) t._tm = setTimeout(function () { tag(t, true); }, j * 160); else tag(t, false); } }); });
    } else if (calm) {
      $('.rail-stick', mach).style.transform = ''; $('.rail-stick', mach).style.filter = '';
      pins.forEach(function (t) { tag(t, true); });
    }
    // the bench follows the scroll while pinned
    if (!calm && check.classList.contains('pin')) { cancelAnimationFrame(tw); var len = ckTrack.offsetHeight - vh; bench.render(clamp(-ckTrack.getBoundingClientRect().top / Math.max(1, len), 0, 1) * 4); }
    // footer: the drum texture turns
    var fr = foot.getBoundingClientRect(), fp = clamp((vh - fr.top) / (vh + fr.height), 0, 1);
    fword.style.setProperty('--bx', (calm ? 50 : 20 + fp * 60).toFixed(1) + '%');
  }

  function layout() { drum.size(); railLayout(); checkLayout(); line.size(); fitWord(); tick(); }
  var rz, lastW = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (Math.abs(innerWidth - lastW) < 2 && phone()) { tick(); return; } lastW = innerWidth; layout(); }, 140); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); bench.render(still() ? STILL_S[0] : 0); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); drum.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { go(); fitWord(); line.size(); railLayout(); tick(); });
  setTimeout(go, 400);
  addEventListener('load', function () { layout(); });
})();
