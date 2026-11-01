(function () {
  var root = document.documentElement, WA = '972542035688';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 900; };
  var TITLE = { he: 'מוטי מדינה · מספרה לנשים ולגברים · שדרות משה גושן 29, קריית מוצקין', en: 'Moti Medina · Hair salon for women and men · 29 Moshe Goshen Blvd, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Moti medina מספרה · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Moti medina hair salon · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  // where a point of a photo lands inside an object-fit:cover box
  function cover(W, H, iw, ih, px, py) { var s = Math.max(W / iw, H / ih), dw = iw * s, dh = ih * s; return { s: s, dw: dw, dh: dh, x: (W - dw) * px, y: (H - dh) * py }; }

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'מוטי מדינה, מספרה', 'Moti Medina hair salon');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו למוטי, 054-203-5688', 'Call Moti, 054-203-5688');
    aria('[data-t-wa]', 'וואטסאפ למוטי', 'WhatsApp Moti');
    aria('[data-t-flip]', 'תלתלים או החלקה', 'Curls or smoothing');
    aria('[data-t-treat]', 'טיפול', 'Treatment');
    aria('[data-t-day]', 'יום', 'Day');
    aria('[data-t-part]', 'שעה ביום', 'Time of day');
    aria('[data-t-visit]', 'הגעה ויצירת קשר', 'Visit and contact');
    $('.v-map iframe').title = l === 'he' ? 'Google Maps: שדרות משה גושן 29, קריית מוצקין' : 'Google Maps: 29 Moshe Goshen Blvd, Kiryat Motzkin';
    $$('.sw').forEach(function (s) { s.setAttribute('aria-label', s.dataset[l]); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('mm-lang', l); } catch (e) {}
    texts(l); hours(); buildWeek(); write(true); fan.label(true); walk.layout(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('mm-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $('[data-seam]').classList.add('done');
    layout(); silk.kick(); lock.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9.5, 19], 1: [9.5, 14], 2: [9.5, 19], 3: [9.5, 19], 4: [9.5, 19], 5: [9, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
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
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- reveals
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  var hero = $('[data-hero]'), stage = $('[data-stage]'), nav = $('[data-nav]'), heroVis = true;
  watch(hero, function (v) { heroVis = v; if (v) { silk.kick(); hand.kick(); } });

  // ---------------------------------------------------------------- the name is cut shut by the logo's scissors
  var seam = $('[data-seam]');
  seam.style.setProperty('--dir', rtl() ? -1 : 1);
  
  // ---------------------------------------------------------------- the real logo arrives as dust and settles into itself
  (function () {
    var cv = $('[data-dust]'), img = $('[data-dustsrc]'), c = cv.getContext('2d'), P = [], t0 = 0, w, h;
    function start() {
      if (still() || !cv.offsetWidth) return;
      var dpr = Math.min(2, devicePixelRatio || 1); w = cv.offsetWidth; h = cv.offsetHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      try {
        var sc = document.createElement('canvas'), iw = 176, ih = 104; sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data, ox = w * (.2 / 1.4), oy = h * (.3 / 1.6), bw = w / 1.4, bh = h / 1.6;
        for (var y = 0; y < ih; y += 2) for (var x = 0; x < iw; x += 2) if (d[(y * iw + x) * 4 + 3] > 110) P.push({ tx: ox + x / iw * bw, ty: oy + y / ih * bh, sx: Math.random() * w, sy: Math.random() * h, dl: Math.random() * .5 });
      } catch (e) { return; }
      t0 = performance.now(); requestAnimationFrame(frame);
    }
    function frame(t) {
      var T = (t - t0) / 1000; c.clearRect(0, 0, w, h);
      var fade = 1 - smooth((T - 1.5) / .6);
      c.fillStyle = 'rgba(243,226,187,' + (.85 * fade).toFixed(3) + ')';
      P.forEach(function (p) { var a = smooth((T - p.dl) / 1.1), e = 1 - Math.pow(1 - a, 3); c.fillRect(lerp(p.sx, p.tx, e) - 1, lerp(p.sy, p.ty, e) - 1, 2, 2); });
      if (T < 2.2) requestAnimationFrame(frame); else c.clearRect(0, 0, w, h);
    }
    if (img.complete && img.naturalWidth) setTimeout(start, 60); else img.addEventListener('load', start, { once: true });
  })();

  // ---------------------------------------------------------------- silk: strands of hair drifting behind the name, parting around the hand
  var silk = (function () {
    var cv = $('[data-silk]'), c = cv.getContext('2d'), w, h, raf = 0, mx = -999, my = -999, S = [], t0 = performance.now();
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = stage.clientWidth; h = stage.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 16 : 28; S = [];
      for (var i = 0; i < n; i++) S.push({ y: h * (.48 + i / n * .5), a: 14 + Math.random() * 30, k: .002 + Math.random() * .003, sp: .25 + Math.random() * .35, ph: Math.random() * 6.28, col: i % 3 ? '220,194,144' : '233,189,180', al: .1 + Math.random() * .16 });
      draw(0);
    }
    function draw(T) {
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < S.length; i++) {
        var s = S[i]; c.beginPath();
        for (var x = -20; x <= w + 20; x += 18) {
          var y = s.y + Math.sin(x * s.k + T * s.sp + s.ph) * s.a + Math.sin(x * s.k * 2.3 - T * s.sp * .7) * s.a * .3;
          var dx = x - mx, dy = y - my, d2 = dx * dx + dy * dy;
          if (d2 < 22000) y += (dy >= 0 ? 1 : -1) * (22000 - d2) / 22000 * 46;
          x === -20 ? c.moveTo(x, y) : c.lineTo(x, y);
        }
        c.strokeStyle = 'rgba(' + s.col + ',' + s.al.toFixed(3) + ')'; c.lineWidth = 1.2; c.stroke();
      }
    }
    function frame(t) { raf = 0; if (still() || !heroVis) { draw(0); return; } draw((t - t0) / 1000); raf = requestAnimationFrame(frame); }
    stage.addEventListener('pointermove', function (e) { var r = stage.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    stage.addEventListener('pointerleave', function () { mx = my = -999; });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- the room: lamps and mirror rings placed on the real photo
  var room = $('[data-room]'), roomIn = $('[data-roomin]'), lampBox = $('[data-lamps]');
  var IW = 864, IH = 1083, POS = [.28, .42];
  var LAMPS = [[120, 210, 8], [233, 245, 6], [348, 275, 4], [411, 293, 2], [495, 18, -14], [551, 55, -12], [572, 83, -10], [613, 100, -8], [648, 132, -6], [684, 160, -4], [706, 185, -2], [723, 207, 0]];
  var MIRRORS = [[131, 437, 92, 113], [350, 445, 53, 85], [481, 415, 40, 40]];
  function placeRoom() {
    var W = roomIn.clientWidth, Hh = roomIn.clientHeight, m = cover(W, Hh, IW, IH, POS[0], POS[1]);
    lampBox.innerHTML = '';
    LAMPS.forEach(function (l, i) { var e = document.createElement('i'); e.className = 'lamp'; e.style.cssText = 'left:' + (m.x + l[0] * m.s) + 'px;top:' + (m.y + l[1] * m.s) + 'px;--i:' + i + ';--tilt:' + l[2] + 'deg'; lampBox.appendChild(e); });
    MIRRORS.forEach(function (r) { var e = document.createElement('i'); e.className = 'mring'; e.style.cssText = 'left:' + (m.x + (r[0] - r[2]) * m.s) + 'px;top:' + (m.y + (r[1] - r[3]) * m.s) + 'px;width:' + (2 * r[2] * m.s) + 'px;height:' + (2 * r[3] * m.s) + 'px'; lampBox.appendChild(e); });
    var M = MIRRORS[0];
    portal.mx = m.x + M[0] * m.s; portal.my = m.y + M[1] * m.s; portal.rx = M[2] * m.s; portal.ry = M[3] * m.s;
  }

  // the hand is a ring light on the photo; on a phone the light wanders by itself
  var hand = (function () {
    var el = $('[data-handlight]'), x = -400, y = -400, tx = 0, ty = 0, user = false, raf = 0, t0 = performance.now();
    room.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = roomIn.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; user = true; });
    room.addEventListener('pointerleave', function () { user = false; });
    function frame(t) {
      raf = 0; if (still() || !heroVis) return;
      var W = roomIn.clientWidth, Hh = roomIn.clientHeight, T = (t - t0) / 1000;
      if (!user) { tx = W * (.42 + .3 * Math.sin(T * .45)); ty = Hh * (.45 + .2 * Math.sin(T * .7 + 1)); }
      x += (tx - x) * .12; y += (ty - y) * .12;
      el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); }
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- through the mirror
  var portal = { el: $('[data-portal]'), mx: 0, my: 0, rx: 1, ry: 1 }, hcopy = $('[data-hcopy]');
  function portalUpdate(calm, vh) {
    if (calm) { room.style.transform = ''; room.style.transformOrigin = ''; room.style.visibility = ''; hcopy.style.opacity = ''; hcopy.style.transform = ''; return; }
    var hr = hero.getBoundingClientRect(), p = clamp((70 - hr.top) / Math.max(1, hero.offsetHeight + 70 - vh), 0, 1);
    var e = smooth((p - .06) / .82), ox = room.offsetLeft, oy = room.offsetTop, Mx = ox + portal.mx, My = oy + portal.my, W = stage.clientWidth, Hh = stage.clientHeight;
    var need = 1;
    [[0, 0], [W, 0], [0, Hh], [W, Hh]].forEach(function (k) { var dx = (k[0] - Mx) / portal.rx, dy = (k[1] - My) / portal.ry; need = Math.max(need, Math.sqrt(dx * dx + dy * dy)); });
    var S = Math.exp(Math.log(need * 1.08) * e);
    room.style.transformOrigin = portal.mx + 'px ' + portal.my + 'px';
    room.style.transform = e > 0 ? 'scale(' + S.toFixed(4) + ')' : '';
    var po = smooth((p - .08) / .22);
    portal.el.style.opacity = po.toFixed(3);
    portal.el.style.clipPath = 'ellipse(' + (portal.rx * S * .97).toFixed(1) + 'px ' + (portal.ry * S * .97).toFixed(1) + 'px at ' + Mx.toFixed(1) + 'px ' + My.toFixed(1) + 'px)';
    room.style.visibility = e > .98 ? 'hidden' : '';
    var co = 1 - smooth(p / .28);
    hcopy.style.opacity = co.toFixed(3); hcopy.style.transform = co < 1 ? 'translateY(' + (-(1 - co) * 40).toFixed(1) + 'px)' : '';
    room.classList.toggle('lit', p < .05);
  }

  // ---------------------------------------------------------------- the three words fill in, letter by letter
  var fillEl = $('[data-fill]'), chars = [];
  (function split(n) {
    [].slice.call(n.childNodes).forEach(function (k) {
      if (k.nodeType === 3) {
        var f = document.createDocumentFragment();
        k.textContent.split('').forEach(function (ch) { if (ch === ' ') { f.appendChild(document.createTextNode(' ')); return; } var s = document.createElement('span'); s.className = 'c'; s.textContent = ch; f.appendChild(s); });
        k.parentNode.replaceChild(f, k);
      } else if (k.nodeType === 1) split(k);
    });
  })(fillEl);
  var heChars = $$('[lang="he"] .c', fillEl), enChars = $$('[lang="en"] .c', fillEl);

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 150) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- bento: a soft light follows the hand
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // glyph decode: a label settles out of scrambled letters
  function decode(el, txt) {
    clearInterval(el._t);
    if (still()) { el.textContent = txt; return; }
    var pool = he() ? 'אבגדהוזחטיכלמנסעפצקרשת' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', n = 0, steps = 14;
    el._t = setInterval(function () {
      n++; var k = Math.floor(txt.length * n / steps);
      el.textContent = txt.slice(0, k) + txt.slice(k).replace(/[^\s]/g, function () { return pool[Math.floor(Math.random() * pool.length)]; });
      if (n >= steps) { clearInterval(el._t); el.textContent = txt; }
    }, 36);
  }

  // ---------------------------------------------------------------- the colour fan opens with the scroll; a touched shade lifts out
  var fan = (function () {
    var box = $('[data-fanbox]'), sws = $$('.sw', box), shade = $('[data-shade]'), sel = 1, open = 1;
    sws.forEach(function (s, i) { s.addEventListener('click', function () { sel = i; label(); place(); }); });
    function label(instant) { sws.forEach(function (s, i) { s.setAttribute('aria-pressed', i === sel ? 'true' : 'false'); }); var t = sws[sel].dataset[he() ? 'he' : 'en']; instant ? (shade.textContent = t) : decode(shade, t); }
    function place() {
      var n = sws.length, spread = phone() ? 10 : 12, dir = rtl() ? -1 : 1;
      sws.forEach(function (s, i) {
        var a = (i - (n - 1) / 2) * spread * open * dir, lift = i === sel ? 26 * open : 0;
        s.style.transform = 'rotate(' + a.toFixed(2) + 'deg) translateY(' + (-lift).toFixed(1) + 'px)';
        s.style.zIndex = i === sel ? 15 : i;
      });
    }
    function update(calm, vh) { var r = box.getBoundingClientRect(); open = calm ? 1 : .08 + .92 * smooth((vh - r.top) / (vh * .75)); place(); }
    label(true);
    return { update: update, label: label };
  })();

  // ---------------------------------------------------------------- one lock of hair, curled or smoothed
  var lock = (function () {
    var cv = $('[data-lock]'), c = cv.getContext('2d'), w, h, m = 1, target = 1, raf = 0, vis = false, t0 = performance.now(), btns = $$('[data-curl]'), played = false, mx = -999, my = -999;
    var N = 18, seeds = []; for (var i = 0; i < N; i++) seeds.push({ ph: Math.random() * 6.28, r: .7 + Math.random() * .5, len: .82 + Math.random() * .16, off: Math.random() });
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); draw(0); }
    function draw(T) {
      c.clearRect(0, 0, w, h);
      var top = 14, band = Math.min(w * .5, 190), cx = w / 2, R = Math.min(18, w * .05), L = h - top - 10;
      for (var i = 0; i < N; i++) {
        var s = seeds[i], x0 = cx - band / 2 + band * (i + .5) / N, len = L * s.len * lerp(1, .78, m), turns = 4.2 * s.r;
        var g = c.createLinearGradient(0, top, 0, top + len); g.addColorStop(0, '#47220f'); g.addColorStop(.5, '#9c7032'); g.addColorStop(1, '#e9c98b');
        c.beginPath();
        for (var k = 0; k <= 60; k++) {
          var t = k / 60, env = smooth(t / .18), sway = Math.sin(T * .9 + s.ph + t * 3) * 4 * t;
          var spread = (x0 - cx) * t * .5 * (1 - m);
          var x = x0 + spread + sway + m * R * s.r * env * Math.sin(t * turns * 6.283 + s.ph), y = top + t * len + m * R * .35 * env * Math.cos(t * turns * 6.283 + s.ph);
          var dx = x - mx, dy = y - my, d2 = dx * dx + dy * dy; if (d2 < 3600) x += (dx >= 0 ? 1 : -1) * (3600 - d2) / 3600 * 18 * t;
          k ? c.lineTo(x, y) : c.moveTo(x, y);
        }
        c.strokeStyle = g; c.lineWidth = 2.6; c.lineCap = 'round'; c.globalAlpha = .95; c.stroke();
        c.strokeStyle = 'rgba(255,240,210,.32)'; c.lineWidth = .9; c.stroke();
      }
      c.globalAlpha = 1;
    }
    function frame(t) {
      raf = 0; if (!vis) return;
      if (still()) { m = target; draw(0); return; }
      m += (target - m) * .06; draw((t - t0) / 1000);
      raf = requestAnimationFrame(frame);
    }
    function set(v) { target = v; btns.forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.curl === v ? 'true' : 'false'); }); kick(); }
    btns.forEach(function (b) { b.addEventListener('click', function () { played = true; set(+b.dataset.curl); }); });
    cv.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    cv.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(cv, function (v) {
      vis = v; kick();
      if (v && !played && !still()) { played = true; setTimeout(function () { set(0); setTimeout(function () { set(1); }, 2200); }, 900); }
    });
    function kick() { if (!raf && vis) raf = requestAnimationFrame(frame); }
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- the logo's scissors snip a lock; it falls and grows back
  (function () {
    var tile = $('[data-cuttile]'), snip = $('[data-snip]'), fall = $('[data-fall]'), busy = false;
    function go() {
      if (busy || still() || !snip.animate) return; busy = true;
      var f = rtl() ? -1 : 1;
      snip.animate([{ transform: 'translateX(' + (-70 * f) + 'px) scaleX(' + f + ')', opacity: 0 }, { transform: 'translateX(0) scaleX(' + f + ')', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'both' });
      setTimeout(function () {
        snip.animate([{ transform: 'scaleX(' + f + ') rotate(0)' }, { transform: 'scaleX(' + f + ') rotate(-12deg)' }, { transform: 'scaleX(' + f + ') rotate(0)' }], { duration: 160, easing: 'ease-out' });
        fall.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: 'translate(14px,90px) rotate(16deg)', opacity: 0 }], { duration: 900, easing: 'cubic-bezier(.55,0,1,.45)', fill: 'forwards' });
      }, 560);
      setTimeout(function () { fall.animate([{ opacity: 0, transform: 'translate(-30px,0) scaleX(.2)' }, { opacity: 1, transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'forwards' }); busy = false; }, 1800);
    }
    tile.addEventListener('click', go);
    watch(tile, function (v) { if (v) setTimeout(go, 500); }, { threshold: .6 });
  })();

  // ---------------------------------------------------------------- the salon: a camera walk through his photo
  var walk = (function () {
    var sec = $('[data-walk]'), frame = $('[data-wframe]'), img = $('[data-wimg]'), tags = $$('.tag', frame), dots = $$('[data-wsteps] li'), WI = 880, WH = 1058, cur = -2, geo = null;
    function layout() { geo = null; cur = -2; }
    function g() { if (!geo) { var W = frame.clientWidth, Hh = frame.clientHeight; geo = { W: W, H: Hh, m: cover(W, Hh, WI, WH, .5, .5) }; } return geo; }
    function placeTags(tx, ty, dw, dh, active) {
      var G = g();
      tags.forEach(function (t, i) {
        var x = tx + (+t.dataset.x) * dw, y = ty + (+t.dataset.y) * dh, show = active === -1 || active === i;
        var out = x < 8 || x > G.W - 8 || y < 8 || y > G.H - 8;
        t.style.left = x.toFixed(1) + 'px'; t.style.top = y.toFixed(1) + 'px';
        t.classList.toggle('flip', x > G.W * .55);
        t.classList.toggle('off', out || !show);
        var b = $('b', t), txt = t.dataset[he() ? 'he' : 'en'];
        if (show && !out) { if (b.dataset.txt !== txt) { b.dataset.txt = txt; active === -1 ? (b.textContent = txt) : decode(b, txt); } }
        else { b.dataset.txt = ''; b.textContent = ''; }
      });
    }
    function update(calm, vh) {
      var G = g(), m = G.m;
      if (calm) { img.style.width = img.style.height = img.style.transform = ''; placeTags(m.x, m.y, m.dw, m.dh, -1); return; }
      img.style.width = m.dw.toFixed(1) + 'px'; img.style.height = m.dh.toFixed(1) + 'px';
      var r = sec.getBoundingClientRect(), p = clamp(-r.top / Math.max(1, sec.offsetHeight - vh), 0, 1);
      var Z = phone() ? 1.9 : 1.75;
      var K = [{ z: 1, x: m.x, y: m.y }].concat(tags.map(function (t) {
        var z = Z, x = G.W / 2 - (+t.dataset.x) * m.dw * z, y = G.H / 2 - (+t.dataset.y) * m.dh * z;
        return { z: z, x: clamp(x, G.W - m.dw * z, 0), y: clamp(y, G.H - m.dh * z, 0) };
      }));
      var u = clamp(p * 1.12 - .04, 0, 1) * (K.length - 1), i = Math.min(K.length - 2, Math.floor(u)), f = smooth((u - i - .4) / .6), a = K[i], b = K[i + 1];
      var z = lerp(a.z, b.z, f), x = lerp(a.x, b.x, f), y = lerp(a.y, b.y, f);
      img.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + z.toFixed(4) + ')';
      var act = f < .02 ? i - 1 : f > .98 ? i : -2;
      if (u >= K.length - 1) act = K.length - 2;
      placeTags(x, y, m.dw * z, m.dh * z, act < 0 ? -2 : act);
      dots.forEach(function (d, k) { d.classList.toggle('on', k === act); });
    }
    return { update: update, layout: layout };
  })();

  // ---------------------------------------------------------------- the composer: a treatment, a day from his week, the time of day
  var treats = $$('[data-treats] button'), weekEl = $('[data-week]'), parts = $$('[data-part] button'), msgEl = $('[data-msg]'), steps = $$('[data-step]'), day = null, shown = '', typing = 0, seen = false;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function radio(list, b) { list.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); }
  treats.forEach(function (b) { b.addEventListener('click', function () { radio(treats, b); lightStep(0); write(); }); });
  parts.forEach(function (b) { b.addEventListener('click', function () { if (b.disabled) return; radio(parts, b); lightStep(2); write(); }); });
  function buildWeek() {
    var l = he(), n = window.__now || now();
    if (day === null) { day = n.d; var k = 0; while ((!H[day] || (day === n.d && n.h >= H[day][1] - .5)) && k++ < 8) day = (day + 1) % 7; }
    weekEl.innerHTML = '';
    for (var d = 0; d < 7; d++) {
      var b = document.createElement('button'), t = H[d];
      b.type = 'button'; b.setAttribute('role', 'radio'); b.dataset.d = d; b.disabled = !t;
      b.setAttribute('aria-checked', d === day ? 'true' : 'false');
      b.innerHTML = '<span>' + (l ? dayHe[d] : dayEn[d].slice(0, 3)) + '</span><small dir="ltr">' + (t ? (l ? 'עד ' : 'to ') + hhmm(t[1]) : (l ? 'סגור' : 'closed')) + '</small>';
      if (l && t) b.lastChild.dir = 'rtl';
      b.setAttribute('aria-label', (l ? dayHe[d] : dayEn[d]) + (t ? '' : (l ? ', סגור' : ', closed')));
      b.addEventListener('click', function () { day = +this.dataset.d; $$('button', weekEl).forEach(function (x) { x.setAttribute('aria-checked', +x.dataset.d === day ? 'true' : 'false'); }); partsFor(); lightStep(1); write(); });
      weekEl.appendChild(b);
    }
    partsFor();
  }
  function partsFor() {
    var short = H[day] && H[day][1] <= 14, pm = parts[1];
    pm.disabled = short;
    if (short && pm.getAttribute('aria-checked') === 'true') radio(parts, parts[0]);
  }
  function compose() {
    var l = he(), tb = treats.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], am = parts[0].getAttribute('aria-checked') === 'true';
    return l ? 'שלום מוטי, אשמח לקבוע תור ל' + tb.dataset.he + ' ביום ' + dayHe[day] + (am ? ' בבוקר' : ' אחר הצהריים') + '. תודה!'
             : 'Hi Moti, I’d like to book an appointment for ' + tb.dataset.en + ' on ' + dayEn[day] + (am ? ' morning' : ' afternoon') + '. Thanks!';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !seen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 16);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  $('[data-send]').addEventListener('pointerenter', function () { lightStep(2); });
  watch($('[data-card]'), function (v) { if (v && !seen) { seen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .5 });

  // ---------------------------------------------------------------- reviews drift, visit mirror, footer ring
  var rvRow = $('[data-rvrow]'), rvs = $$('.rv', rvRow), DRIFT = [-36, 28, -14];
  var vpin = $('[data-vpin]'), vphoto = $('[data-vphoto]'), vring = $('[data-vring]'), vtitle = $('[data-vtitle]');
  var fring = $('.f-ring'), dock = $('[data-dock]'), foot = $('.foot');

  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    portalUpdate(calm, vh);
    // letters fill as the heading rises
    var fr = fillEl.getBoundingClientRect(), q = calm ? 1 : smooth((vh * .9 - fr.top) / (vh * .5)), list = he() ? heChars : enChars, on = Math.round(q * list.length);
    list.forEach(function (c, i) { c.classList.toggle('on', i < on); });
    fan.update(calm, vh);
    walk.update(calm, vh);
    // reviews drift at different speeds (desktop)
    var rr = rvRow.getBoundingClientRect(), rp = clamp((vh - rr.top) / (vh + rr.height), 0, 1);
    rvs.forEach(function (r, i) { r.style.transform = calm || phone() ? '' : 'translateY(' + ((.5 - rp) * DRIFT[i] * 2).toFixed(1) + 'px)'; });
    // the closing photo shrinks into a round mirror
    if (!calm) {
      var pr = vpin.getBoundingClientRect(), vp = clamp(-pr.top / Math.max(1, vpin.offsetHeight - vh), 0, 1), W = vphoto.clientWidth, Hh = vphoto.clientHeight;
      var rf = Math.min(innerWidth * .64, 440) / 2, cy = phone() ? 44 : 45, rMax = Math.hypot(W, Hh) / 2 + 20, s = smooth(vp / .78);
      vphoto.style.setProperty('--cr', lerp(rMax, rf, s).toFixed(1) + 'px'); vphoto.style.setProperty('--cy', lerp(50, cy, s).toFixed(2) + '%');
      vring.style.setProperty('--ry', cy + '%'); vring.style.setProperty('--ro', smooth((vp - .66) / .2).toFixed(3));
      vtitle.style.setProperty('--to', smooth((vp - .62) / .25).toFixed(3));
    } else { vphoto.style.removeProperty('--cr'); }
    // the footer's lit ring rises as you arrive
    var fb = fring.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fb.top) / fb.height);
    fring.style.setProperty('--rise', ((1 - fp) * 90).toFixed(1) + 'px');
    dock.classList.toggle('hide', foot.getBoundingClientRect().top < vh * .55 && scrollY > vh);
  }

  function layout() { silk.size(); placeRoom(); lock.size(); walk.layout(); seam.style.setProperty('--dir', rtl() ? -1 : 1); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); lw = innerWidth; }, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); buildWeek(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); silk.kick(); hand.kick(); setTimeout(function () { seam.classList.add('done'); }, 1700); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1000);
  addEventListener('load', function () { layout(); });
})();
