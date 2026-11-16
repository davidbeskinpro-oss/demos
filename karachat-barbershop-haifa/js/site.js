(function () {
  var root = document.documentElement, WA = '972529266604';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var TITLE = { he: 'קרחת · מספרה בשוק · סירקין 17, חיפה', en: 'Karachat · The barbershop in the market · 17 Sirkin St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור קרחת · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Karachat · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var GLYPHS = 'קרחתאבגדהוזטיכלמנסעפצשABCDEFGHKMRTXZ0123456789';

  // labels that decode out of scrambled glyphs
  function decode(el, txt) {
    clearInterval(el._dt);
    if (still()) { el.textContent = txt; return; }
    var n = 0, steps = txt.length + 6;
    el._dt = setInterval(function () {
      n++;
      var out = '';
      for (var i = 0; i < txt.length; i++) out += i < n - 6 || txt[i] === ' ' ? txt[i] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      el.textContent = out;
      if (n >= steps) { clearInterval(el._dt); el.textContent = txt; }
    }, 28);
  }

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'קרחת', 'Karachat');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-what]', 'מה צריך', 'What you need');
    aria('[data-t-day]', 'איזה יום', 'Which day');
    aria('[data-t-call]', 'התקשרו לקרחת, 052-926-6604', 'Call Karachat, 052-926-6604');
    aria('[data-t-wa]', 'וואטסאפ לקרחת', 'WhatsApp Karachat');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: סירקין 17, חיפה' : 'Map: 17 Sirkin St, Haifa'; });
    $$('.lbl').forEach(function (b) { b.textContent = b.dataset[l]; });
    $$('.rc figcaption').forEach(function (c) { c.textContent = c.dataset[l]; });
    lastFront = -1;
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('kr-lang', l); } catch (e) {}
    texts(l); hours(); week(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('kr-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-odo]').forEach(function (o) { roll(o, true); });
    layout(); write(true); motes.kick(); clip.kick(); ring.kick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: null, 1: [12, 19], 2: [12, 19], 3: [12, 19], 4: [12, 19], 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, s: +o.second }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, note, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; note = txt; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); note = l ? 'התריס למעלה עד ' + hhmm(t[1]) : 'Shutter up until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); note = l ? 'התריס עולה היום ב-' + hhmm(t[0]) : 'The shutter goes up today at ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      if (!H[nd]) { txt = l ? 'סגור עכשיו' : 'Closed now'; note = txt; }
      else if (nd === (n.d + 1) % 7) { txt = l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]); note = l ? 'התריס עולה מחר ב-' + hhmm(H[nd][0]) : 'The shutter goes up tomorrow at ' + hhmm(H[nd][0]); }
      else { txt = l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]); note = l ? 'התריס עולה ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'The shutter goes up on ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]); }
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $('[data-shnote]').textContent = note;
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // consecutive days with the same hours share a row; the week starts on Sunday
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

  // the wall clock tile: their clock, with the open hours painted on the dial
  var ticks = $('[data-ticks]'), NS = 'http://www.w3.org/2000/svg';
  for (var tk = 0; tk < 60; tk++) { var ln = document.createElementNS(NS, 'line'), a = tk * 6 * Math.PI / 180, r1 = tk % 5 ? 84 : 78; ln.setAttribute('x1', 100 + Math.sin(a) * r1); ln.setAttribute('y1', 100 - Math.cos(a) * r1); ln.setAttribute('x2', 100 + Math.sin(a) * 88); ln.setAttribute('y2', 100 - Math.cos(a) * 88); if (!(tk % 5)) ln.setAttribute('class', 'h'); ticks.appendChild(ln); }
  (function arc() {   // 12:00 to 19:00 on a twelve-hour dial
    var R = 70, p = function (h) { var a = (h % 12) * 30 * Math.PI / 180; return (100 + Math.sin(a) * R).toFixed(2) + ' ' + (100 - Math.cos(a) * R).toFixed(2); };
    $('[data-arc]').setAttribute('d', 'M' + p(12) + ' A' + R + ' ' + R + ' 0 1 1 ' + p(19));
  })();
  var hh = $('[data-hh]'), mh = $('[data-mh]'), sh = $('[data-sh]');
  function clock() {
    var o = nowParts(), H12 = (+o.hour % 12) + (+o.minute) / 60, M = +o.minute + (+o.second) / 60;
    hh.style.transform = 'rotate(' + (H12 * 30) + 'deg)'; mh.style.transform = 'rotate(' + (M * 6) + 'deg)'; sh.style.transform = 'rotate(' + (+o.second * 6) + 'deg)';
  }
  clock(); setInterval(clock, 1000);
  function week() {
    var n = now(), l = he(), ab = l ? ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    $('[data-week]').innerHTML = ab.map(function (d, i) { return '<span class="' + (H[i] ? 'op' : '') + (i === n.d ? ' today' : '') + '" style="--k:' + i + '">' + d + '</span>'; }).join('');
  }

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // headline letter by letter
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 6 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // odometers
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
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), stage = $('[data-hstage]');

  // ---------------------------------------------------------------- hero: warm dust in the lamp light, pushed by the hand
  var motes = (function () {
    var cv = $('[data-motes]'), c = cv.getContext('2d'), P = [], w = 0, h = 0, vis = true, raf = 0, mx = -999, my = -999;
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = stage.clientWidth; h = stage.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      P = []; var n = phone() ? 46 : 90; for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 1.8, vx: (Math.random() - .5) * .12, vy: -.08 - Math.random() * .22, a: .25 + Math.random() * .5, ph: Math.random() * 6 }); }
    function frame(t) {
      raf = 0; if (!vis || still()) { c.clearRect(0, 0, w, h); return; }
      c.clearRect(0, 0, w, h);
      P.forEach(function (p) {
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { var f = (14000 - d2) / 14000 * .9; p.vx += dx / Math.sqrt(d2 + 1) * f; p.vy += dy / Math.sqrt(d2 + 1) * f; }
        p.vx *= .96; p.vy = p.vy * .96 + (-.12 - p.r * .04) * .04;
        p.x += p.vx + Math.sin(t / 1400 + p.ph) * .15; p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; } if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        c.globalAlpha = p.a * (.6 + .4 * Math.sin(t / 900 + p.ph));
        c.fillStyle = '#ffdc9a'; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
      });
      kick();
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    stage.addEventListener('pointermove', function (e) { var r = stage.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; px = (e.clientX / innerWidth - .5) * 2; py = (e.clientY / innerHeight - .5) * 2; tick(); });
    stage.addEventListener('pointerleave', function () { mx = my = -999; px = py = 0; tick(); });
    watch(stage, function (v) { vis = v; kick(); });
    return { size: size, kick: kick };
  })();
  var px = 0, py = 0;

  // ---------------------------------------------------------------- hero: walk through the open door. One cover-fit for both photos
  var front = $('[data-front] img'), inWrap = $('[data-in]'), inImg = $('[data-inimg]'), hcopy = $('[data-hcopy]'), inline = $('[data-inline]'), lbls = $$('.lbl'), hint = $('.h-hint');
  var IW = 1125, IH = 1500, DOOR = { x0: .345, x1: .69, y0: .175, y1: .53 }, FF = { x: .5, y: .3 }, FI = { x: .5, y: .42 };
  function fi() { FI.y = innerWidth / innerHeight > 1 ? .78 : .42; return FI; }
  function cover(W, Hh, f) { var s = Math.max(W / IW, Hh / IH); return { s: s, w: IW * s, h: IH * s, x: (W - IW * s) * f.x, y: (Hh - IH * s) * f.y }; }
  var labelsOn = false;
  function heroScene(p) {
    var W = stage.clientWidth, Hh = stage.clientHeight, c = cover(W, Hh, FF);
    if (still()) { front.style.cssText = ''; return; }
    var e = smooth(p / .62), dcx = (DOOR.x0 + DOOR.x1) / 2 * c.w, dcy = (DOOR.y0 + DOOR.y1) / 2 * c.h, dw = (DOOR.x1 - DOOR.x0) * c.w, dh = (DOOR.y1 - DOOR.y0) * c.h;
    var Z = Math.max(W / dw, Hh / dh) * 1.04, z = Math.pow(Z, e), sx = c.x + dcx, sy = c.y + dcy;
    var tx = lerp(sx, W / 2, e) - px * 10 * (1 - e), ty = lerp(sy, Hh / 2, e) - py * 8 * (1 - e);
    // the photo, scaled about the door's centre, with the door's centre carried to (tx,ty)
    front.style.width = c.w + 'px'; front.style.height = c.h + 'px';
    front.style.transform = 'translate3d(' + (tx - dcx * z).toFixed(2) + 'px,' + (ty - dcy * z).toFixed(2) + 'px,0) scale(' + z.toFixed(4) + ')';
    // the room shows through the door opening, which grows with the push until it is the whole screen
    var rx = tx - dw / 2 * z, ry = ty - dh / 2 * z, rw = dw * z, rh = dh * z;
    inWrap.style.opacity = smooth((p - .1) / .22).toFixed(3);
    inWrap.style.clipPath = 'inset(' + Math.max(0, ry).toFixed(1) + 'px ' + Math.max(0, W - rx - rw).toFixed(1) + 'px ' + Math.max(0, Hh - ry - rh).toFixed(1) + 'px ' + Math.max(0, rx).toFixed(1) + 'px round ' + (6 * (1 - e)).toFixed(1) + 'px)';
    // the room is cover-fitted to the part of the opening that is on screen, so at the end it frames the screen itself
    var vx = Math.max(0, rx), vy = Math.max(0, ry), vw = Math.min(W, rx + rw) - vx, vhh = Math.min(Hh, ry + rh) - vy;
    var full = cover(W, Hh, fi()), si = Math.max(vw / IW, vhh / IH) * (1 + .07 * smooth((p - .6) / .4)), iw = IW * si, ih = IH * si;
    var ix = vx + (vw - iw) * FI.x - px * 14 * e, iy = vy + (vhh - ih) * FI.y - py * 10 * e;
    inImg.style.width = full.w + 'px'; inImg.style.height = full.h + 'px';
    inImg.style.transform = 'translate3d(' + ix.toFixed(2) + 'px,' + iy.toFixed(2) + 'px,0) scale(' + (si / full.s).toFixed(4) + ')';
    var cf = 1 - smooth((p - .02) / .2);
    hcopy.style.opacity = cf.toFixed(3); hcopy.style.transform = 'translateY(' + ((1 - cf) * -40).toFixed(1) + 'px)';
    hcopy.style.visibility = cf < .02 ? 'hidden' : '';
    hint.style.opacity = cf.toFixed(3);
    var on = p > .66;
    if (on !== labelsOn) { labelsOn = on; lbls.forEach(function (b, i) { clearTimeout(b._to); if (on) b._to = setTimeout(function () { b.classList.add('on'); decode(b, b.dataset[root.lang]); }, i * 160); else b.classList.remove('on'); }); }
    inline.classList.toggle('on', p > .74);
    if (on) lbls.forEach(function (b) {   // keep every label inside the screen and clear of the closing line
      b.style.marginLeft = '0px'; var r = b.getBoundingClientRect(), m = 0;
      if (r.left < 10) m = 10 - r.left; else if (r.right > W - 10) m = W - 10 - r.right;
      b.style.marginLeft = m.toFixed(1) + 'px';
      b.style.visibility = r.top < 80 || r.bottom > Hh * .72 ? 'hidden' : '';
    });
  }

  // ---------------------------------------------------------------- the name: hair clippings that sweep into their real stamp
  var clip = (function () {
    var box = $('[data-stampbox]'), cv = $('[data-clip]', box), c = cv.getContext('2d'), logo = $('[data-logo]'), P = [], w = 0, ok = false, vis = false, raf = 0, prog = 0, mx = -999, my = -999;
    function sample() {
      var S = 150, t = document.createElement('canvas'); t.width = S; t.height = Math.round(S * logo.naturalHeight / logo.naturalWidth);
      var x = t.getContext('2d'); x.drawImage(logo, 0, 0, t.width, t.height);
      var d = x.getImageData(0, 0, t.width, t.height).data, pts = [];
      for (var y = 0; y < t.height; y++) for (var i = 0; i < S; i++) if (d[(y * S + i) * 4 + 3] > 120) pts.push([i / S, y / S]);
      P = pts.map(function (q) {
        return { u: q[0], v: q[1] + (1 - t.height / S) / 2, a: Math.random() * Math.PI, sa: Math.random() * Math.PI * 2, su: Math.random(), sv: .55 + Math.random() * .5, dl: Math.random() * .35, len: .6 + Math.random() * .9, ox: 0, oy: 0 };
      });
      ok = true;
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = box.clientWidth; cv.width = w * dpr; cv.height = w * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(t) {
      raf = 0; if (!ok || !vis || still()) return;
      c.clearRect(0, 0, w, w); c.strokeStyle = '#1b1917'; c.lineCap = 'round';
      var pad = w * .06, s = w - pad * 2, L = Math.max(2.2, w / 150 * 1.6), moving = false;
      c.lineWidth = Math.max(1.4, w / 300); c.beginPath();
      for (var i = 0; i < P.length; i++) {
        var p = P[i], e = smooth((prog - p.dl) / .55);
        var x = lerp(pad + p.su * s, pad + p.u * s, e), y = lerp(pad + p.sv * s, pad + p.v * s, e);
        var dx = x + p.ox - mx, dy = y + p.oy - my, d2 = dx * dx + dy * dy;
        if (d2 < 2200) { var f = (2200 - d2) / 2200 * 3; p.ox += dx / Math.sqrt(d2 + 1) * f; p.oy += dy / Math.sqrt(d2 + 1) * f; }
        p.ox *= .93; p.oy *= .93; if (Math.abs(p.ox) + Math.abs(p.oy) > .1) moving = true;
        x += p.ox + Math.sin(t / 700 + p.sa) * (1 - e) * 1.2; y += p.oy;
        var ang = lerp(p.sa, p.a, e) + (p.ox + p.oy) * .05, l = L * p.len * lerp(1.6, 1, e);
        c.moveTo(x - Math.cos(ang) * l, y - Math.sin(ang) * l); c.lineTo(x + Math.cos(ang) * l, y + Math.sin(ang) * l);
      }
      c.stroke();
      if (moving || prog < 1.4 || mx > -999) kick();
    }
    function kick() { if (!raf && ok) raf = requestAnimationFrame(frame); }
    function pt(e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; kick(); }
    box.addEventListener('pointermove', pt); box.addEventListener('pointerdown', pt);
    box.addEventListener('pointerleave', function () { mx = my = -999; kick(); });
    box.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') { mx = my = -999; kick(); } });
    watch(box, function (v) { vis = v; kick(); });
    function start() { size(); sample(); kick(); }
    if (logo.complete && logo.naturalWidth) start(); else logo.addEventListener('load', start);
    return { kick: kick, size: function () { if (ok) { size(); kick(); } }, set: function (v) { if (Math.abs(v - prog) > .001) { prog = v; kick(); } } };
  })();

  // ---------------------------------------------------------------- tour: the ring of real photos, turned by scroll, by drag and by itself
  var ring = (function () {
    var wrap = $('[data-ringwrap]'), el = $('[data-ring]');
    $$('.rc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.classList.add('twin'); el.appendChild(k); });   // sixteen cards make a wide, gentle arc
    var cards = $$('.rc', el), N = cards.length, rot = 0, vel = 0, drag = false, lx = 0, vis = false, raf = 0, last = 0, tag = $('[data-rtag]');
    function R() { var cw = cards[0].offsetWidth || 180; return Math.max(cw * 1.15 / (2 * Math.tan(Math.PI / N)), phone() ? 230 : 0); }
    function frame(t) {
      raf = 0;
      if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; }); return; }
      var dt = last ? Math.min(50, t - last) : 16; last = t;
      if (!drag) { rot += (vel + (rtl() ? -5 : 5)) * dt / 1000; vel *= .95; }
      var r = R(), best = 0, bi = 0, sc = scrollY * .09 * (rtl() ? -1 : 1);
      cards.forEach(function (c, i) {
        var a = (i * 360 / N + rot + sc) % 360, rad = a * Math.PI / 180, cs = Math.cos(rad);
        c.style.transform = 'translate(-50%,-50%) rotateY(' + a.toFixed(2) + 'deg) translateZ(' + r.toFixed(1) + 'px) translateY(' + ((1 - cs) * -14).toFixed(1) + 'px)';
        c.style.filter = 'brightness(' + (.45 + .55 * Math.max(0, cs)).toFixed(3) + ')';
        c.style.zIndex = Math.round(cs * 100) + 100;
        if (cs > best) { best = cs; bi = i; }
      });
      el.style.transform = 'translateZ(' + (-r).toFixed(1) + 'px)';
      if (bi !== lastFront) { lastFront = bi; var cap = $('figcaption', cards[bi]); decode(tag, cap.dataset[root.lang]); }
      if (vis) kick();
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .3; vel = dx * 3; kick(); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(wrap, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();
  var lastFront = -1;

  // ---------------------------------------------------------------- message: tap the tiles, the easel writes
  var steps = $$('[data-step]'), whats = $$('[data-what]'), days = $$('[data-day]'), msgEl = $('[data-msg]'), shown = '', typing = 0, seen = false, easel = $('.board');
  function light(n) { steps.forEach(function (s, i) { s.classList.toggle('on', i <= n); }); }
  function pick(group, b, n) {
    group.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); });
    light(Math.max(n, steps.filter(function (s) { return s.classList.contains('on'); }).length - 1));
    if (!still() && easel.animate) easel.animate([{ transform: 'rotate(-1.5deg)' }, { transform: 'rotate(-2.6deg)' }, { transform: 'rotate(-1.5deg)' }], { duration: 420, easing: 'cubic-bezier(.23,1,.32,1)' });
    write();
  }
  whats.forEach(function (b) { b.addEventListener('click', function () { pick(whats, b, 0); }); });
  days.forEach(function (b) { b.addEventListener('click', function () { pick(days, b, 1); }); });
  // arrow keys inside each tile group, as radios do
  [whats, days].forEach(function (g) { g.forEach(function (b, i) { b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1; b.addEventListener('keydown', function (e) {
    var k = e.key, d = (k === 'ArrowLeft' ? 1 : k === 'ArrowRight' ? -1 : 0) * (rtl() ? 1 : -1) || (k === 'ArrowDown' ? 1 : k === 'ArrowUp' ? -1 : 0); if (!d) return;
    e.preventDefault(); var nb = g[(i + d + g.length) % g.length]; nb.click(); g.forEach(function (x) { x.tabIndex = x === nb ? 0 : -1; }); nb.focus();
  }); }); });
  $('[data-send]').addEventListener('pointerenter', function () { light(2); });
  $('[data-send]').addEventListener('focus', function () { light(2); });
  function compose() {
    var l = he(), w = whats.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], d = days.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0];
    var day = d.dataset[l ? 'he' : 'en'];
    if (w.dataset.what === 'cut') return l ? 'היי קרחת, אשמח לקבוע תור לתספורת ' + day + '. תודה!' : 'Hi Karachat, I’d like to book a haircut ' + day + '. Thanks!';
    if (w.dataset.what === 'product') return l ? 'היי קרחת, יש לי שאלה על מוצר מהמדף. אפשר לקפוץ ' + day + '?' : 'Hi Karachat, I have a question about a product from the shelf. Can I drop by ' + day + '?';
    return l ? 'היי קרחת, יש לי שאלה. אפשר לקפוץ ' + day + '?' : 'Hi Karachat, I have a question. Can I drop by ' + day + '?';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !seen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-easel]'), function (v) { if (v && !seen) { seen = true; light(0); if (!still()) { shown = ''; msgEl.textContent = ''; } write(); } }, { threshold: .35 });

  // ---------------------------------------------------------------- scroll-linked: band, reviews pile, street photo, shutter, nav, dock
  var tour = $('[data-tour]'), bandA = $('[data-band-a]'), bandB = $('[data-band-b]'), bandSvg = $('[data-band]'), name = $('[data-name]');
  var revs = $('[data-revs]'), rvs = $$('.rv'), RR = [-3, 2.4, -1.2];
  var vi = $('[data-vintro]'), vph = $('[data-vphoto]'), vline = $('[data-vline]'), foot = $('[data-foot]'), shutter = $('[data-shutter]'), dock = $('[data-dock]');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el, extra) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight * (extra || 1)), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, W = innerWidth;
    nav.classList.toggle('pill', scrollY > 40);
    // hero scene runs over the first two screens of scroll; the name card then slides over it
    var hr = hero.getBoundingClientRect();
    heroScene(calm ? 0 : clamp(-hr.top / Math.max(1, hr.height - 2 * vh), 0, 1));
    // the clippings gather as the wall comes up
    var nr = name.getBoundingClientRect();
    clip.set(calm ? 1 : clamp((vh - nr.top) / (vh * 1.15), 0, 1) * 1.45);
    // the stamp's band cuts the tour in on a slant, levelling as it rises
    if (!calm) {
      var tr = tour.getBoundingClientRect(), k = 1 - smooth((vh - tr.top) / (vh * .85)), a0 = W * .12;
      var yA = a0 * k, yB = a0 * k * .12;   // the logo's band rises to the right, then levels and lifts away
      tour.style.setProperty('--a', yA.toFixed(1) + 'px'); tour.style.setProperty('--b', yB.toFixed(1) + 'px');
      bandSvg.setAttribute('viewBox', '0 0 ' + W + ' ' + (W * .14).toFixed(0));
      bandA.setAttribute('d', 'M0 ' + yA.toFixed(1) + ' L' + W + ' ' + yB.toFixed(1));
      bandB.setAttribute('d', 'M0 ' + (yA + 9).toFixed(1) + ' L' + W + ' ' + (yB + 9).toFixed(1));
    } else { tour.style.removeProperty('--a'); tour.style.removeProperty('--b'); }
    // reviews land one over another, each gets the stamp as it lands
    var pr = calm ? 1 : prog(revs), seg = .8 / rvs.length;
    rvs.forEach(function (rv, i) {
      if (calm) { rv.style.transform = ''; rv.style.filter = ''; rv.classList.add('st'); return; }
      var t = smooth((pr - .05 - i * seg) / (seg * .8)), above = 0;
      for (var j = i + 1; j < rvs.length; j++) above += smooth((pr - .05 - j * seg) / (seg * .8));
      rv.style.transform = 'translateY(' + ((1 - t) * 130).toFixed(2) + 'vh) rotate(' + lerp(12, RR[i], t).toFixed(2) + 'deg) scale(' + (1 - Math.min(above, 2) * .05).toFixed(3) + ')';
      rv.style.filter = above ? 'brightness(' + (1 - Math.min(above, 2) * .12).toFixed(3) + ')' : '';
      rv.classList.toggle('st', t > .97);
    });
    // the street photo shrinks into its frame
    if (!calm) {
      var vp = smooth(prog(vi) / .8), sm = W <= 700;
      var T = (sm ? vh * .3 : vh * .26) * vp, B = (sm ? vh * .2 : vh * .16) * vp, S = (sm ? 16 : W * .22) * vp;
      vph.style.setProperty('--t', T.toFixed(1) + 'px'); vph.style.setProperty('--b', B.toFixed(1) + 'px');
      vph.style.setProperty('--l', S.toFixed(1) + 'px'); vph.style.setProperty('--r', S.toFixed(1) + 'px'); vph.style.setProperty('--rad', (24 * vp).toFixed(1) + 'px');
      vph.style.setProperty('--z', (1.12 - .12 * vp).toFixed(4));
      vline.style.setProperty('--o', smooth((vp - .55) / .4).toFixed(3));
    }
    // the shutter rolls down as the page ends
    var fr = foot.getBoundingClientRect(), fp = calm ? .82 : clamp((vh - fr.top) / (shutter.clientHeight * 1.05), 0, 1);
    shutter.style.setProperty('--down', (calm ? .82 : .06 + .9 * smooth(fp)).toFixed(4));
    // the dock appears once the hero buttons have gone
    dock.classList.toggle('on', calm ? scrollY > vh * .6 : hr.top < -vh * .3 && fr.top > vh * .55);
  }
  function layout() { motes.size(); clip.size(); update(); }
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', function () { layout(); });

  texts(root.lang); hours(); week(); write(true);
  layout();
  if (still()) hero.classList.add('ready'); else setTimeout(function () { hero.classList.add('ready'); }, 650);
  setTimeout(function () { root.classList.remove('opening'); }, still() ? 0 : 1400);
})();
