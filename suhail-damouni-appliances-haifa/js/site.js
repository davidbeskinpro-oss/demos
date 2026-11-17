(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 761; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  var TITLE = { he: 'סוהייל דאמוני · מוצרי חשמל לבית · עבאס 14, חיפה', en: 'Suhail Damouni · Home appliances · 14 Abbas St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור סוהייל דאמוני · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Suhail Damouni · This is not the business’s official website' };

  // ---------------------------------------------------------------- glyph decode (labels settle out of scrambled letters)
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHKLMNPRSTUVWXYZ' };
  function decode(el, text, lang) {
    if (el._dec) cancelAnimationFrame(el._dec);
    if (still()) { el.textContent = text; return; }
    var set = GL[lang] || GL.en, t0 = performance.now(), dur = 380 + text.length * 14;
    (function step(now) {
      var k = (now - t0) / dur, n = Math.floor(k * text.length), out = '';
      for (var i = 0; i < text.length; i++) out += i < n || text[i] === ' ' ? text[i] : set[(Math.random() * set.length) | 0];
      el.textContent = out;
      el._dec = k < 1 ? requestAnimationFrame(step) : (el.textContent = text, 0);
    })(t0);
  }

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'סוהייל דאמוני', 'Suhail Damouni');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-call]', 'התקשרו לחנות, 04-853-3230', 'Call the store, 04-853-3230');
    aria('[data-t-dial]', 'בחירת מכשיר', 'Choose an appliance');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: עבאס 14, חיפה' : 'Map: 14 Abbas St, Haifa'; });
    $$('[data-decode]').forEach(function (c) { c.textContent = c.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('sd75-lang', l); } catch (e) {}
    texts(l); hours(); dialUI(false); fitMark(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('sd75-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],.elabel,[data-wordmark]').forEach(function (el) { el.classList.add('in'); });
    layout(); kickSpin(); kickRail(); kickFire();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours, live status and the oven clock (Haifa time). null = closed
  var H = { 0: [8, 16], 1: [8, 16], 2: [8, 14], 3: [8, 16], 4: [8, 16], 5: [8, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, hh: ('0' + ((+o.hour) % 24)).slice(-2), mm: o.minute }; }
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
    var c = $('[data-clock]'); if (c) c.textContent = n.hh + ':' + n.mm;
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
  setInterval(status, 20000);

  // ---------------------------------------------------------------- split headline letters
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // ---------------------------------------------------------------- entrances
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px' }) : null;
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', i * 80 + 'ms'); });
  $$('[data-reveal],[data-tile],.elabel,[data-wordmark]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- nav gathers into a pill; phone call knob appears after the hero
  var nav = $('[data-nav]'), fab = $('.fab');

  // ---------------------------------------------------------------- HERO: the porthole
  var wrap = $('[data-stage]'), stage = $('.stage', wrap), img = $('[data-drum]'), port = $('[data-port]'), door = $('[data-door]');
  var copy = $('[data-hero-copy]'), cap = $('[data-port-cap]');
  var G = { cx: 0, cy: 0, R: 0, W: 0, H: 0 }, spin = 0, vel = 0, drag = false, lx = 0, heroVis = true, spinRaf = 0, lastT = 0;
  var SPOTS = [
    [.27, .80, 'מכונות כביסה', 'Washing machines'], [.73, .76, 'כיריים', 'Hobs'], [.84, .53, 'מקררים', 'Fridges'],
    [.535, .59, 'מוצרים קטנים', 'Small appliances'], [.69, .55, 'מדיח שולחני', 'Compact dishwasher'], [.2, .47, 'בילט-אין', 'Built-in']
  ];
  function geom() {
    var s = stage.getBoundingClientRect(), r = port.getBoundingClientRect();
    G.W = s.width; G.H = s.height; G.cx = r.left - s.left + r.width / 2; G.cy = r.top - s.top + r.height / 2; G.R = r.width * .46;
    stage.style.setProperty('--cx', G.cx + 'px'); stage.style.setProperty('--cy', G.cy + 'px'); stage.style.setProperty('--R', G.R + 'px');
    door.style.setProperty('--hinge', rtl() ? '0%' : '100%');
  }
  function heroP() { if (still()) return 0; var r = wrap.getBoundingClientRect(), span = wrap.offsetHeight - innerHeight; return span > 0 ? clamp(-r.top / span, 0, 1) : 0; }
  function stageUpdate() {
    var p = heroP(), a = smooth(p / .32), b = smooth((p - .3) / .4), c = smooth((p - .72) / .16);
    var far = Math.max(Math.hypot(G.cx, G.cy), Math.hypot(G.W - G.cx, G.cy), Math.hypot(G.cx, G.H - G.cy), Math.hypot(G.W - G.cx, G.H - G.cy));
    // rotation is about the circle's centre, so the photo edge can only show once the circle outgrows it:
    // the spin settles to 0 by b = .4 while the radius grows slowly (b squared) until then
    var sn = ((spin % 360) + 540) % 360 - 180;
    var s = 1.25 - .25 * b, Rn = G.R + (far - G.R) * b * b, ang = still() ? 0 : sn * (1 - smooth(b / .4));
    img.style.transform = 'rotate(' + ang + 'deg) scale(' + s + ')';
    stage.style.setProperty('--cr', (Rn / s + 2) + 'px');
    stage.style.setProperty('--co', (1 - smooth((p - .03) / .18)).toFixed(3));
    stage.style.setProperty('--ho', (a * (1 - b)).toFixed(3));
    stage.style.setProperty('--hs', (1 + b * .6).toFixed(3));
    stage.style.setProperty('--ha', (spin * .5) + 'deg');
    stage.style.setProperty('--ho2', c.toFixed(3));
    door.style.setProperty('--da', (a * 82 * (rtl() ? -1 : 1)) + 'deg');
    door.style.opacity = (1 - smooth((p - .34) / .12)).toFixed(3);
    port.style.pointerEvents = p > .2 ? 'none' : '';
  }
  function spinFrame(t) {
    spinRaf = 0;
    var dt = lastT ? Math.min(50, t - lastT) : 16; lastT = t;
    if (still() || !heroVis || heroP() > .7) { lastT = 0; return; }
    if (!drag) { vel += (14 - vel) * .02; }
    spin += vel * dt / 1000;
    stageUpdate();
    spinRaf = requestAnimationFrame(spinFrame);
  }
  function kickSpin() { if (!spinRaf && !still()) { lastT = 0; spinRaf = requestAnimationFrame(spinFrame); } stageUpdate(); }
  port.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; port.classList.add('drag'); });
  addEventListener('pointermove', function (e) {
    if (drag) { var dx = e.clientX - lx; lx = e.clientX; spin += dx * .5; vel = dx * 6; }
    if (fine && heroVis && !still()) {
      var nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      door.style.setProperty('--ty', (nx * 10) + 'deg'); door.style.setProperty('--tx', (-ny * 8) + 'deg');
      door.style.setProperty('--sh', (nx * 40) + 'deg');
    }
  });
  addEventListener('pointerup', function () { drag = false; port.classList.remove('drag'); });
  addEventListener('pointercancel', function () { drag = false; port.classList.remove('drag'); });
  watch(wrap, function (v) { heroVis = v; kickSpin(); });

  // callouts on the showroom photo: object-fit: cover maths, so they sit on the right objects at any size
  function placeSpots(layer, W, H) {
    var sc = Math.max(W / 1600, H / 1200), dw = 1600 * sc, dh = 1200 * sc, ox = (W - dw) / 2, oy = (H - dh) / 2, l = he();
    if (!layer.children.length) layer.innerHTML = SPOTS.map(function () { return '<span class="spot"><i></i><b></b></span>'; }).join('');
    [].forEach.call(layer.children, function (el, i) {
      var x = ox + SPOTS[i][0] * dw, y = oy + SPOTS[i][1] * dh, lab = $('b', el), t = SPOTS[i][l ? 2 : 3];
      el.style.left = x + 'px'; el.style.top = y + 'px';
      el.style.display = x < 56 || x > W - 56 || y < 90 || y > H - 40 ? 'none' : '';
      if (lab.dataset.t !== t) { lab.dataset.t = t; lab.textContent = t; }
    });
  }
  var spotsDecoded = false;
  function spotsDecode(layer) { $$('.spot b', layer).forEach(function (b, i) { setTimeout(function () { decode(b, b.dataset.t, root.lang); }, i * 120); }); }

  // ---------------------------------------------------------------- DEPARTMENTS: cards riding round inside the drum
  var drumEl = $('[data-drum-rail]'), cards = $$('.rc', drumEl), N = cards.length;
  var off = 0, uVel = 0, rDrag = false, rlx = 0, railVis = false, railRaf = 0, rLast = 0, centre = -1;
  function railP() { var r = drumEl.getBoundingClientRect(); return clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1); }
  function railUpdate() {
    if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.opacity = ''; c.style.zIndex = ''; }); return; }
    var cw = cards[0].offsetWidth, R = cw * (phone() ? 1.15 : 1.7), step = phone() ? 38 : 30, o = railP() * 3 + off, best = 99, bi = 0;
    var dirS = rtl() ? -1 : 1;
    cards.forEach(function (c, i) {
      var d = ((i - o) % N + N) % N; if (d > N / 2) d -= N;
      var th = d * step * Math.PI / 180, x = Math.sin(th) * R * dirS, z = (1 - Math.cos(th)) * R * .55, deg = d * step;
      c.style.transform = 'translate(-50%,-50%) translateX(' + x.toFixed(1) + 'px) translateZ(' + z.toFixed(1) + 'px) rotateY(' + (-deg * dirS).toFixed(1) + 'deg)';
      c.style.opacity = (1 - smooth((Math.abs(deg) - 55) / 30)).toFixed(3);
      c.style.zIndex = 100 - Math.round(Math.abs(d) * 10);
      if (Math.abs(d) < best) { best = Math.abs(d); bi = i; }
    });
    if (bi !== centre) { centre = bi; var cp = $('figcaption', cards[bi]); decode(cp, cp.dataset[root.lang], root.lang); }
  }
  function railFrame(t) {
    railRaf = 0; var dt = rLast ? Math.min(50, t - rLast) : 16; rLast = t;
    if (still() || !railVis) { rLast = 0; return; }
    if (!rDrag) { off += uVel * dt / 1000; uVel *= .94; off += .06 * dt / 1000; }
    railUpdate(); railRaf = requestAnimationFrame(railFrame);
  }
  function kickRail() { if (!railRaf && !still()) { rLast = 0; railRaf = requestAnimationFrame(railFrame); } railUpdate(); }
  drumEl.addEventListener('pointerdown', function (e) { if (still()) return; rDrag = true; rlx = e.clientX; drumEl.classList.add('drag'); });
  addEventListener('pointermove', function (e) { if (!rDrag) return; var dx = e.clientX - rlx, cw = cards[0].offsetWidth; rlx = e.clientX; var k = (rtl() ? 1 : -1) * dx / cw; off += k; uVel = k * 60; });
  addEventListener('pointerup', function () { rDrag = false; drumEl.classList.remove('drag'); });
  watch(drumEl, function (v) { railVis = v; kickRail(); });
  // brand names decode once as they arrive
  var brands = $('.brands');
  watch(brands, function (v) { if (v && !brands._done) { brands._done = 1; $$('[data-decode-plain]', brands).forEach(function (b, i) { var t = b.textContent; setTimeout(function () { decode(b, t, 'en'); }, i * 40); }); } });

  // ---------------------------------------------------------------- HOBS: blue flame drawn onto the burners of the real photo
  var fire = $('[data-fire]'), fbox = $('[data-flame-box]'), cv = $('[data-flames]'), cx2 = cv.getContext('2d');
  // burner centres and radius as fractions of the photo (1600 x 1200), measured on the photo
  var B = [[.525, .80, .060], [.388, .925, .066], [.65, .868, .060], [.747, .614, .042], [.683, .676, .040], [.86, .668, .042], [.815, .744, .045]];
  var lvl = B.map(function () { return 0; }), tgt = B.map(function () { return 0; }), mem = B.map(function () { return 0; });
  var fVis = false, fRaf = 0, fw = 0, fh = 0, ptr = null;
  function fSize() { var dpr = Math.min(2, devicePixelRatio || 1); fw = fbox.clientWidth; fh = fbox.clientHeight; cv.width = fw * dpr; cv.height = fh * dpr; cx2.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function drawFlames(t) {
    cx2.clearRect(0, 0, fw, fh); cx2.globalCompositeOperation = 'lighter';
    var sum = 0;
    B.forEach(function (b, i) {
      var L = lvl[i]; sum += L; if (L < .02) return;
      var x = b[0] * fw, y = b[1] * fh, rx = b[2] * fw * .62, ry = rx * .42, n = 26;
      var g = cx2.createRadialGradient(x, y, 0, x, y, rx * 1.8);
      g.addColorStop(0, 'rgba(90,140,255,' + (.28 * L) + ')'); g.addColorStop(1, 'rgba(90,140,255,0)');
      cx2.fillStyle = g; cx2.beginPath(); cx2.ellipse(x, y, rx * 1.8, ry * 1.8, 0, 0, 7); cx2.fill();
      for (var k = 0; k < n; k++) {
        var a = k / n * Math.PI * 2, px = x + Math.cos(a) * rx, py = y + Math.sin(a) * ry;
        var fl = .7 + .3 * Math.sin(t / 90 + k * 1.7 + i) * Math.sin(t / 53 + k), h = rx * .34 * L * fl;
        var ox = Math.cos(a) * h * .55, oy = Math.sin(a) * h * .25 - h;  // tongues lean outward and rise
        cx2.beginPath(); cx2.moveTo(px - 2.6, py); cx2.quadraticCurveTo(px + ox * .4 - 1, py + oy * .55, px + ox, py + oy); cx2.quadraticCurveTo(px + ox * .4 + 1, py + oy * .55, px + 2.6, py); cx2.closePath();
        cx2.fillStyle = 'rgba(80,130,255,' + (.55 * L) + ')'; cx2.fill();
        cx2.beginPath(); cx2.moveTo(px - 1.2, py); cx2.lineTo(px + ox * .35, py + oy * .45); cx2.lineTo(px + 1.2, py); cx2.closePath();
        cx2.fillStyle = 'rgba(200,225,255,' + (.6 * L) + ')'; cx2.fill();
      }
    });
    cx2.globalCompositeOperation = 'source-over';
    fbox.style.setProperty('--fb', (.6 + .14 * sum / B.length).toFixed(3));
  }
  function fireTargets() {
    var r = fbox.getBoundingClientRect(), p = clamp((innerHeight * .9 - r.top) / (r.height * .9), 0, 1);
    B.forEach(function (b, i) {
      var near = 0;
      if (ptr) { var dx = ptr.x - b[0] * fw, dy = (ptr.y - b[1] * fh) * 2.2, d = Math.hypot(dx, dy); near = clamp(1.4 - d / (b[2] * fw * 1.6), 0, 1); }
      if (near > .5) mem[i] = 1;
      var scroll = fine ? 0 : (p > (i + 1) / (B.length + 1) ? .85 : 0);
      tgt[i] = Math.max(near, mem[i] * .55, scroll);
    });
  }
  function fireFrame(t) {
    fRaf = 0;
    if (still()) { B.forEach(function (b, i) { lvl[i] = .8; }); drawFlames(0); return; }
    if (!fVis) return;
    fireTargets();
    B.forEach(function (b, i) { lvl[i] += (tgt[i] - lvl[i]) * .08; });
    drawFlames(t); fRaf = requestAnimationFrame(fireFrame);
  }
  function kickFire() { if (!fRaf) fRaf = requestAnimationFrame(fireFrame); }
  fbox.addEventListener('pointermove', function (e) { var r = fbox.getBoundingClientRect(); ptr = { x: e.clientX - r.left, y: e.clientY - r.top }; });
  fbox.addEventListener('pointerleave', function () { ptr = null; });
  fbox.addEventListener('pointerdown', function (e) { var r = fbox.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; B.forEach(function (b, i) { if (Math.hypot(x - b[0] * fw, (y - b[1] * fh) * 2) < b[2] * fw * 1.8) mem[i] = mem[i] ? 0 : 1.6; }); });
  watch(fire, function (v) { fVis = v; kickFire(); });

  // ---------------------------------------------------------------- energy-label odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span>' + ch + '</span>';
      var col = ''; for (var k = 0; k < 10; k++) col += '<span>' + k + '</span>';
      return '<span class="d" data-to="' + ch + '"><span>' + col + '</span></span>';
    }).join('');
  });
  function roll(o, go) { $$('.d', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : 0; s.style.transitionDelay = go ? (300 + i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  var label = $('[data-label]');
  if (still()) $$('[data-odo]').forEach(function (o) { roll(o, true); });
  else watch(label, function (v) { if (v) $$('[data-odo]').forEach(function (o) { roll(o, true); }); }, { threshold: .4 });

  // ---------------------------------------------------------------- reviews: a deck that lands card over card
  var stack = $('[data-stack]'), rvs = $$('.rv', stack), cur = 0, rvTimer = 0, rvVis = false, rvHover = false;
  function deck() {
    var n = rvs.length, h = 0;
    rvs.forEach(function (c, j) {
      var r = (j - cur + n) % n;
      c.style.transform = 'translateY(' + (r * 14) + 'px) scale(' + (1 - r * .045) + ')';
      c.style.opacity = r > 2 ? 0 : (1 - r * .3);
      c.style.zIndex = n - r; c.setAttribute('aria-hidden', r ? 'true' : 'false');
      h = Math.max(h, c.offsetHeight);
    });
    stack.style.height = (h + 32) + 'px';
    $('[data-rv-count]').textContent = (cur + 1) + ' / ' + n;
  }
  function nextRv() { var top = rvs[cur]; cur = (cur + 1) % rvs.length; deck(); if (!still()) top.animate([{ transform: 'translateY(-40px) scale(1.02)', opacity: 0 }, { transform: top.style.transform, opacity: top.style.opacity }], { duration: 650, easing: 'cubic-bezier(.23,1,.32,1)' }); }
  $('[data-rv-next]').addEventListener('click', nextRv);
  stack.addEventListener('pointerenter', function () { rvHover = true; }); stack.addEventListener('pointerleave', function () { rvHover = false; });
  watch(stack, function (v) { rvVis = v; });
  rvTimer = setInterval(function () { if (rvVis && !rvHover && !still() && !document.hidden) nextRv(); }, 7000);

  // ---------------------------------------------------------------- STORE NOTE: program dial -> printed slip
  var ITEMS = {
    he: ['מכונת כביסה', 'מייבש כביסה', 'מדיח כלים', 'תנור', 'כיריים', 'מקרר', 'מוצר קטן למטבח', 'שואב אבק'],
    en: ['washing machine', 'tumble dryer', 'dishwasher', 'oven', 'hob', 'fridge', 'small kitchen appliance', 'vacuum cleaner']
  };
  var dial = $('[data-dial]'), dLabels = $('[data-dial-labels]'), lcd = $('[data-lcd]'), extra = $('[data-extra]'), slip = $('[data-slip]'), slipTx = $('[data-slip-text]');
  var SHORT = { he: ['כביסה', 'מייבש', 'מדיח', 'תנור', 'כיריים', 'מקרר', 'מוצר קטן', 'שואב אבק'], en: ['washer', 'dryer', 'dishwasher', 'oven', 'hob', 'fridge', 'small item', 'vacuum'] };
  var sel = 0, M = ITEMS.he.length, A0 = -135, AS = 270 / (M - 1);
  function noteText() {
    var l = he(), it = ITEMS[l ? 'he' : 'en'][sel], x = extra.value.trim();
    if (l) return 'שלום, רציתי לשאול על ' + it + (x ? ' (' + x + ')' : '') + '. מה יש אצלכם באולם?';
    return 'Hello, I’d like to ask about ' + (/^[aeiou]/.test(it) ? 'an ' : 'a ') + it + (x ? ' (' + x + ')' : '') + '. What do you have in the showroom?';
  }
  function dialUI(feed) {
    var l = he(), list = ITEMS[l ? 'he' : 'en'], r = 128;
    dLabels.innerHTML = SHORT[l ? 'he' : 'en'].map(function (t, i) {
      var a = (A0 + i * AS) * Math.PI / 180, x = 50 + Math.sin(a) * r / 2.6, y = 50 - Math.cos(a) * r / 2.6;
      return '<li data-i="' + i + '" class="' + (i === sel ? 'on' : '') + '" style="left:' + x.toFixed(1) + '%;top:' + y.toFixed(1) + '%">' + t + '</li>';
    }).join('');
    dial.style.setProperty('--rot', (A0 + sel * AS) + 'deg');
    lcd.textContent = list[sel].replace(/^./, function (c) { return c.toUpperCase(); });
    slipTx.textContent = noteText();
    if (feed && !still()) { slip.classList.remove('feed'); void slip.offsetWidth; slip.classList.add('feed'); }
  }
  dial.addEventListener('click', function () { sel = (sel + 1) % M; dialUI(true); });
  dial.addEventListener('keydown', function (e) {
    var k = e.key, d = k === 'ArrowRight' || k === 'ArrowUp' ? 1 : k === 'ArrowLeft' || k === 'ArrowDown' ? -1 : 0;
    if (d) { e.preventDefault(); sel = (sel + d + M) % M; dialUI(true); }
  });
  dLabels.addEventListener('click', function (e) { var li = e.target.closest('li'); if (li) { sel = +li.dataset.i; dialUI(true); } });
  extra.addEventListener('input', function () { slipTx.textContent = noteText(); });
  $('[data-copy]').addEventListener('click', function () {
    var b = this, t = noteText(), done = function () { var s = $('span[lang="' + root.lang + '"]', b), o = s.textContent; s.textContent = he() ? 'הועתק' : 'Copied'; setTimeout(function () { s.textContent = o; }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, done); else done();
  });
  // steps light up one by one as the section passes
  var steps = $$('[data-steps] li'), note = $('[data-note]');
  function stepsUpdate() { var r = note.getBoundingClientRect(), p = clamp((innerHeight * .85 - r.top) / (r.height * .6), 0, 1); steps.forEach(function (s, i) { s.classList.toggle('lit', still() || p > (i + .5) / steps.length); }); }

  // ---------------------------------------------------------------- closing photo shrinks into its frame
  var cl = $('[data-cl-frame]');
  function closeUpdate() { if (still()) { cl.style.setProperty('--cp', 1); return; } var r = cl.getBoundingClientRect(), p = smooth((innerHeight - r.top) / (innerHeight * .9)); cl.style.setProperty('--cp', (p).toFixed(3)); }

  // ---------------------------------------------------------------- footer wordmark: letters, fitted to width
  var mark = $('[data-wordmark]');
  $$('span[lang]', mark).forEach(function (sp) { sp.innerHTML = sp.textContent.split('').map(function (c, i) { return c === ' ' ? ' ' : '<span class="ch" style="--i:' + i + '">' + c + '</span>'; }).join(''); });
  function fitMark() { mark.style.fontSize = '100px'; var w = mark.parentNode.clientWidth - parseFloat(getComputedStyle(mark.parentNode).paddingLeft) * 2, s = mark.scrollWidth; mark.style.fontSize = Math.min(220, 100 * w / s * .98) + 'px'; }

  // bento spotlight follows the cursor
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', e.clientX - r.left + 'px'); t.style.setProperty('--my', e.clientY - r.top + 'px'); }); });

  // ---------------------------------------------------------------- scroll + layout
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = scrollY;
    nav.classList.toggle('pill', y > 60);
    fab.classList.toggle('show', y > innerHeight * .7);
    if (!spinRaf) stageUpdate();
    var hp = heroP();
    if (hp > .75 && !spotsDecoded) { spotsDecoded = true; spotsDecode($('[data-spots="stage"]')); }
    if (!railRaf) railUpdate();
    var fr = fire.getBoundingClientRect(); fire.style.setProperty('--hz', (.4 + .9 * smooth((innerHeight - fr.top) / innerHeight)).toFixed(3));
    stepsUpdate(); closeUpdate();
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  function layout() {
    geom(); stageUpdate();
    placeSpots($('[data-spots="stage"]'), G.W, G.H);
    var hs = $('.hs-photo'); placeSpots($('[data-spots="still"]'), hs.clientWidth, hs.clientHeight);
    fSize(); if (still()) fireFrame(0); else kickFire();
    railUpdate(); deck(); onScroll();
  }
  var rt = 0; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { fitMark(); layout(); }, 120); });

  texts(root.lang); hours(); dialUI(false);
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitMark(); layout(); }); else fitMark();
  fitMark();
  requestAnimationFrame(function () { stage.classList.add('ready'); });
  // the still showroom block decodes its labels when seen
  watch($('.hs-photo'), function (v) { if (v) placeSpots($('[data-spots="still"]'), $('.hs-photo').clientWidth, $('.hs-photo').clientHeight); });
})();
