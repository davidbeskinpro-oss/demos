(function () {
  var root = document.documentElement, WA = '972545941196';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth <= 760; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'Naftali’s · מספרת גברים וילדים · שדרות ירושלים 13, קריית ביאליק', en: 'Naftali’s · Barbershop for men and kids · 13 Sderot Yerushalayim, Kiryat Bialik' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Barbershop Naftali’s · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Barbershop Naftali’s · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-visit]', 'הגעה ויצירת קשר', 'Visit and contact');
    aria('[data-t-who]', 'בשביל מי', 'Who is it for');
    aria('[data-t-guard]', 'מספר בצדדים', 'Guard on the sides');
    aria('[data-t-day]', 'יום', 'Day');
    aria('[data-t-call]', 'התקשרו למספרה, 054-594-1196', 'Call the shop, 054-594-1196');
    aria('[data-t-wa]', 'וואטסאפ למספרה', 'WhatsApp the shop');
    $('.map').title = l === 'he' ? 'Google Maps: שדרות ירושלים 13, קריית ביאליק' : 'Google Maps: 13 Sderot Yerushalayim, Kiryat Bialik';
    calls.forEach(function (c) { if (c.classList.contains('on')) $('b', c).textContent = c.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('nf-lang', l); } catch (e) {}
    texts(l); hours(); buildDays(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('nf-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-frame]').forEach(function (el) { el.classList.add('in'); });
    clearStyles(); layout(); light.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [10, 20], 1: [10, 20], 2: [10, 20], 3: [10, 20], 4: [10, 20], 5: [10, 15], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function isOpen(n) { var t = H[n.d]; return !!(t && (t[0] === 0 && t[1] === 24 || n.h >= t[0] && n.h < t[1])); }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = isOpen(n);
    if (open) txt = t[0] === 0 && t[1] === 24 ? (l ? 'פתוח עכשיו' : 'Open now') : (l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]));
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
    $('.visit').classList.toggle('open', open);
    $('[data-led]').classList.toggle('open', open);
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

  // ---------------------------------------------------------------- entrances
  $$('.frames').forEach(function (g) { $$('[data-frame]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 110 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-frame]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 10 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), stage = $('[data-hstage]'), room = $('[data-room]'), nav = $('[data-nav]'), poster = $('[data-poster]'), glow = $('[data-glow]');
  var calls = $$('.call'), IW = 1600, IH = 900, SIGN = [.874, .345], LOGO = [1282 / 1600, 208 / 900, 1516 / 1600], hlogo = $('[data-hlogo]');

  // object-fit: cover mapping of the room photo inside the stage
  var map = { s: 1, ox: 0, oy: 0, W: 0, H: 0 };
  function cover() {
    var W = stage.clientWidth, Hh = stage.clientHeight, s = Math.max(W / IW, Hh / IH), dw = IW * s, dh = IH * s;
    var px = phone() ? .42 : .5;
    map = { s: s, ox: (W - dw) * px, oy: (Hh - dh) * .5, W: W, H: Hh, dw: dw, dh: dh };
    // the room is the whole picture, uncropped, so the camera can travel across all of it
    room.style.width = dw + 'px'; room.style.height = dh + 'px'; room.style.left = map.ox + 'px'; room.style.top = map.oy + 'px';
  }
  function loc(x, y) { return [map.dw * x, map.dh * y]; }
  function pt(x, y) { return [map.ox + map.dw * x, map.oy + map.dh * y]; }

  // ---------------------------------------------------------------- the light in the room: follows the hand, drifts by itself on phones
  var light = (function () {
    var x = .5, y = .5, tx = .55, ty = .5, raf = 0, vis = true, user = 0, k = 0, t0 = performance.now();
    var path = [[.21, .62], [.44, .42], [.43, .62], [.76, .62], [.865, .32], [.37, .22]];
    function frame(t) {
      raf = 0;
      if (still()) { room.style.removeProperty('--sx'); return; }
      if (t - user > 3200) { var p = path[Math.floor((t - t0) / 2300) % path.length]; tx = p[0]; ty = p[1]; }
      x += (tx - x) * .06; y += (ty - y) * .06;
      var P = loc(x, y), r = Math.max(170, Math.min(map.W, map.H) * .34);
      room.style.setProperty('--sx', P[0].toFixed(1) + 'px'); room.style.setProperty('--sy', P[1].toFixed(1) + 'px'); room.style.setProperty('--sr', r.toFixed(0) + 'px');
      poster.style.setProperty('--glare', ((x - .5) * 60).toFixed(1) + '%');
      // labels type themselves where the light falls
      calls.forEach(function (c) { var d = Math.hypot(P[0] - c._x, P[1] - c._y); label(c, !c.hidden && d < r * .75); });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function aim(e) { var b = stage.getBoundingClientRect(); tx = ((e.clientX - b.left) - map.ox) / map.dw; ty = ((e.clientY - b.top) - map.oy) / map.dh; user = performance.now(); }
    stage.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') aim(e); });
    stage.addEventListener('pointerdown', aim);
    watch(stage, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { kick: kick };
  })();
  function label(c, on) {
    if (still()) on = true;
    if (on === c.classList.contains('on')) return;
    var b = $('b', c), txt = c.dataset[he() ? 'he' : 'en'];
    c.classList.toggle('on', on); clearInterval(c._t);
    if (!on) { c._t = setTimeout(function () { b.textContent = ''; }, 350); return; }
    if (still()) { b.textContent = txt; return; }
    var i = 0; b.textContent = '';
    c._t = setInterval(function () { b.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(c._t); }, 38);
  }
  function placeCalls() {
    var pr = poster.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    calls.forEach(function (c) {
      var Q = loc(+c.dataset.x, +c.dataset.y), P = pt(+c.dataset.x, +c.dataset.y); c._x = Q[0]; c._y = Q[1];
      c.style.left = Q[0] + 'px'; c.style.top = Q[1] + 'px';
      c.classList.toggle('flip', P[0] > map.W * .62);
      var ax = P[0] + sr.left, ay = P[1] + sr.top;
      c.hidden = P[0] < 12 || P[0] > map.W - 12 || P[1] < 80 || P[1] > map.H - 12 || (ax > pr.left - 20 && ax < pr.right + 20 && ay > pr.top - 20 && ay < pr.bottom + 20);
      if (still() && !c.hidden) label(c, true);
    });
  }

  // ---------------------------------------------------------------- opening: cut hair settles into the real N, the sign lights up
  (function opening() {
    var op = $('[data-opener]');
    if (!root.classList.contains('opening')) { op.remove(); return; }
    try { sessionStorage.setItem('nf-open', '1'); } catch (e) {}
    var cv = $('[data-opcv]', op), c = cv.getContext('2d'), img = $('[data-logo]', op), P = [], w, h, t0, done = false;
    function end() { if (done) return; done = true; op.classList.add('done'); setTimeout(function () { root.classList.remove('opening'); op.remove(); }, 600); go(); }
    op.addEventListener('pointerdown', end);
    setTimeout(end, 1700);
    function start() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = innerWidth; h = innerHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var r = img.getBoundingClientRect(), pts = [];
      try {
        var sc = document.createElement('canvas'), iw = 117, ih = 103; sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data;
        for (var y = 0; y < ih; y++) for (var x = 0; x < iw; x++) { var k = (y * iw + x) * 4; if (d[k] + d[k + 1] + d[k + 2] > 330) pts.push([r.left + x / iw * r.width, r.top + y / ih * r.height]); }
      } catch (e) { end(); return; }
      var stp = Math.max(1, pts.length / (phone() ? 700 : 1100));
      for (var f = 0; f < pts.length; f += stp) { var q = pts[Math.floor(f)]; P.push({ x: q[0], y: q[1], sx: Math.random() * w, sy: -40 - Math.random() * h * .6, a: Math.random() * 6.28, l: 4 + Math.random() * 6, dl: Math.random() * .22 }); }
      t0 = performance.now(); requestAnimationFrame(frame);
    }
    function frame(t) {
      if (done) return;
      var T = (t - t0) / 1000; c.clearRect(0, 0, w, h); c.lineWidth = 1.4; c.lineCap = 'round';
      for (var i = 0; i < P.length; i++) {
        var p = P[i], e = smooth((T - p.dl) / .6), x = lerp(p.sx, p.x, e), y = lerp(p.sy, p.y, e) + Math.sin(T * 6 + p.a) * (1 - e) * 10, a = p.a + (1 - e) * T * 4;
        var ca = Math.cos(a) * p.l * .5, sa = Math.sin(a) * p.l * .5;
        c.strokeStyle = e > .96 ? 'rgba(169,222,245,' + (1 - smooth((T - .95) / .3)) + ')' : 'rgba(205,214,222,.85)';
        c.beginPath(); c.moveTo(x - ca, y - sa); c.lineTo(x + ca, y + sa); c.stroke();
      }
      if (T > .78 && !op.classList.contains('lit')) op.classList.add('lit');
      if (T > 1.3) { end(); return; }
      requestAnimationFrame(frame);
    }
    if (img.complete && img.naturalWidth) start(); else img.addEventListener('load', start, { once: true });
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
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 4) % 10; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- the fade: guard labels decode as the line passes them
  var fade = $('[data-fade]'), fphoto = $('[data-fphoto]'), fsec = $('[data-fsecond]'), guards = $$('.g');
  var GLY = '0123456789#½';
  function decode(g, on) {
    var b = $('b', g), txt = '#' + (g.dataset.t === '0.5' ? '½' : g.dataset.t);
    if (on === g.classList.contains('on') && b.textContent) return;
    g.classList.toggle('on', on); clearInterval(g._t);
    if (!on || still()) { b.textContent = txt; return; }
    var n = 0;
    g._t = setInterval(function () { n++; b.textContent = n > 7 ? txt : txt.split('').map(function () { return GLY[Math.floor(Math.random() * GLY.length)]; }).join(''); if (n > 7) clearInterval(g._t); }, 40);
  }
  guards.forEach(function (g) { g.style.top = (+g.dataset.y * 100) + '%'; decode(g, still()); });

  // ---------------------------------------------------------------- the wall: glare follows the hand (and the scroll on phones), frames lean in
  var frames = $$('[data-frame]');
  frames.forEach(function (f) {
    f.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || still()) return;
      var r = f.getBoundingClientRect(), u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height;
      f.style.setProperty('--ry', ((u - .5) * 8).toFixed(2) + 'deg'); f.style.setProperty('--rx', ((.5 - v) * 6).toFixed(2) + 'deg');
      var g = $('.glass', f); if (g) g.style.setProperty('--gx', ((u - .5) * 70).toFixed(1) + '%');
    });
    f.addEventListener('pointerleave', function () { f.style.removeProperty('--ry'); f.style.removeProperty('--rx'); });
  });
  var wsteps = $$('[data-wsteps] i'), wall = $('#wall');

  // ---------------------------------------------------------------- book: who, guard, beard, day; the poster writes the message
  var who = $$('[data-who]'), gds = $$('[data-guard]'), beard = $('[data-beard]'), daysBox = $('[data-days]'), steps = $$('[data-step]');
  var msgEl = $('[data-msg]'), shown = '', typing = 0, noteSeen = false, day = -1;
  function radio(list, b) { list.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); }
  function lightStep(n) { steps[n].classList.add('on'); }
  who.forEach(function (b) { b.addEventListener('click', function () { radio(who, b); lightStep(0); write(); }); });
  gds.forEach(function (b) { b.addEventListener('click', function () { radio(gds, b); lightStep(1); write(); }); });
  beard.addEventListener('change', function () { lightStep(1); write(); });
  function buildDays() {
    var l = he(), short = l ? ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysBox.innerHTML = '';
    var any = document.createElement('button'); any.type = 'button'; any.setAttribute('role', 'radio'); any.dataset.d = '-1'; any.textContent = l ? 'הכי קרוב' : 'Soonest';
    daysBox.appendChild(any);
    for (var d = 0; d < 7; d++) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'radio'); b.dataset.d = d; b.textContent = short[d];
      b.setAttribute('aria-label', (l ? 'יום ' : '') + (l ? dayHe : dayEn)[d] + (H[d] ? '' : (l ? ', סגור' : ', closed')));
      if (!H[d]) b.disabled = true;
      daysBox.appendChild(b);
    }
    $$('button', daysBox).forEach(function (b) {
      b.setAttribute('aria-checked', +b.dataset.d === day ? 'true' : 'false');
      b.addEventListener('click', function () { day = +b.dataset.d; radio($$('button', daysBox), b); lightStep(2); write(); });
    });
  }
  function compose() {
    var l = he(), w = who.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0];
    var g = gds.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], gv = g ? g.dataset.guard : '?';
    var gtxt = gv === '?' ? (l ? 'את המספר בצדדים נחליט במקום' : 'we’ll decide the guard for the sides there') : (l ? 'מספר ' + (gv === '0.5' ? 'חצי' : gv) + ' בצדדים' : 'a #' + (gv === '0.5' ? '½' : gv) + ' on the sides');
    var dtxt = day < 0 ? (l ? 'במועד הכי קרוב שיש' : 'at the soonest free slot') : (l ? 'ביום ' + dayHe[day] + ', אם אפשר' : 'on ' + dayEn[day] + ', if possible');
    var b = beard.checked;
    return l ? 'היי, אשמח לתור לתספורת ' + w.dataset.he + ', ' + gtxt + (b ? ', וגם זקן' : '') + '. ' + dtxt + '. תודה!'
             : 'Hi, I’d like a haircut appointment ' + w.dataset.en + ', ' + gtxt + (b ? ', and a beard trim too' : '') + '. ' + dtxt.replace(/^./, function (c) { return c.toUpperCase(); }) + '. Thanks!';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !noteSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 15);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-np]'), function (v) { if (v && !noteSeen) { noteSeen = true; if (still()) return; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- reviews: the clipper's line passes, a few hairs fall
  var quotes = $$('[data-trim]');
  function hair(q, t) {
    var h = document.createElement('i'); h.className = 'hair';
    var W = q.clientWidth, x = rtl() ? W * (1 - t) : W * t;
    h.style.left = x + 'px'; h.style.top = (20 + Math.random() * (q.clientHeight - 60)) + 'px'; q.appendChild(h);
    var a = h.animate([{ transform: 'translate(0,0) rotate(' + (Math.random() * 180) + 'deg)', opacity: .9 }, { transform: 'translate(' + ((Math.random() - .5) * 30) + 'px,' + (40 + Math.random() * 50) + 'px) rotate(' + (200 + Math.random() * 200) + 'deg)', opacity: 0 }], { duration: 700 + Math.random() * 400, easing: 'cubic-bezier(.4,0,.7,1)' });
    a.onfinish = function () { h.remove(); };
  }

  // ---------------------------------------------------------------- footer
  var foot = $('[data-foot]'), flip = $('[data-flip]'), clipper = $('[data-clipper]');

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function clearStyles() {
    room.style.transform = ''; hlogo.style.transform = ''; hlogo.style.opacity = ''; poster.style.opacity = ''; poster.style.transform = ''; glow.style.removeProperty('--go');
    fphoto.style.removeProperty('--cut'); fsec.style.opacity = ''; fsec.style.transform = '';
    wsteps.forEach(function (s) { s.style.transform = ''; });
    quotes.forEach(function (q) { q.style.removeProperty('--t'); q.classList.remove('cutting'); });
    flip.style.removeProperty('--fr'); stage.style.removeProperty('--seam');
    var sm = $('.seam', stage); if (sm) sm.style.opacity = '';
  }
  var seam = document.createElement('i'); seam.className = 'seam'; stage.appendChild(seam);
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) light.kick();
    // the camera flies into the lit N sign; its dark panel becomes the next section's ground
    if (!calm) {
      // the sign travels to the centre of the screen while the camera closes in; screen(P) = t + P * sc
      var p = prog(hero), e = smooth((p - .06) / .8), cw = map.dw * (LOGO[2] - LOGO[0]);
      var S = Math.max(1.3, (phone() ? Math.min(map.W * .8, 440) : Math.min(map.W * .42, 500)) / cw);
      var sc = lerp(1, S, e), P = pt(SIGN[0], SIGN[1]), q = loc(SIGN[0], SIGN[1]);
      var tx = lerp(P[0], map.W / 2, e) - map.ox - q[0] * sc, ty = lerp(P[1], map.H * .46, e) - map.oy - q[1] * sc;
      room.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + sc.toFixed(4) + ')';
      var L = loc(LOGO[0], LOGO[1]), lw = cw * sc;
      hlogo.style.transform = 'translate3d(' + (map.ox + tx + L[0] * sc).toFixed(1) + 'px,' + (map.oy + ty + L[1] * sc).toFixed(1) + 'px,0) scale(' + (lw / 234).toFixed(4) + ')';
      hlogo.style.opacity = smooth((e - .25) / .4).toFixed(3);
      var po = 1 - smooth(p / .3); poster.style.opacity = po.toFixed(3);
      poster.style.transform = (phone() ? '' : 'translateY(-44%) ') + 'translateY(' + ((1 - po) * -40).toFixed(1) + 'px) scale(' + (1 - (1 - po) * .05).toFixed(3) + ')';
      glow.style.setProperty('--go', (.45 + e * .5).toFixed(3));
      seam.style.opacity = smooth((e - .55) / .4).toFixed(3);
      $('.calls', stage).style.opacity = (1 - smooth(e / .12)).toFixed(3);
    }
    // the fade
    var fp = calm ? 1 : prog(fade);
    if (!calm) {
      var cut = lerp(72, 40, smooth((fp - .04) / .56));
      fphoto.style.setProperty('--cut', cut.toFixed(2) + '%');
      guards.forEach(function (g) { decode(g, cut / 100 < +g.dataset.y + .004); });
      var d = smooth((fp - .62) / .26);
      fsec.style.opacity = d.toFixed(3);
      fsec.style.transform = 'translateY(' + ((1 - d) * 40).toFixed(2) + 'svh) rotate(' + lerp(9, -3, d).toFixed(2) + 'deg)';
    }
    // the stepped seam into the wall, stroke by stroke
    var wr = wall.getBoundingClientRect(), wq = calm ? 1 : clamp((vh - wr.top) / (vh * .7), 0, 1);
    wsteps.forEach(function (s, i) { s.style.transform = calm ? '' : 'scaleX(' + smooth((wq - i * .1) / .45).toFixed(3) + ')'; });
    // glare on phones follows the scroll
    if (!fine && !calm) frames.forEach(function (f) { var r = f.getBoundingClientRect(); var g = $('.glass', f); if (!g || r.bottom < 0 || r.top > vh) return; g.style.setProperty('--gx', ((r.top / vh - .5) * -80).toFixed(1) + '%'); });
    // quotes trimmed sharp as they pass the middle of the screen
    quotes.forEach(function (q) {
      if (calm) return;
      var r = q.getBoundingClientRect(), t = clamp((vh * .9 - r.top) / (vh * .5), 0, 1), old = q._t || 0;
      q.style.setProperty('--t', t.toFixed(3)); q.classList.toggle('cutting', t > 0 && t < 1);
      if (t > old + .04 && t < 1 && q.querySelectorAll('.hair').length < 14) { hair(q, t); q._t = t; } else if (t < old) q._t = t;
    });
    // the footer poster turns over as you arrive
    if (!calm) {
      var fr = foot.getBoundingClientRect(), ff = smooth((vh - fr.top - 120) / Math.min(fr.height * .7, vh * .6));
      flip.style.setProperty('--fr', (ff * 180).toFixed(1) + 'deg');
    }
    // the clipper steps aside while the hero's own buttons are on screen
    clipper.classList.toggle('away', scrollY < vh * .5);
  }

  function layout() { cover(); placeCalls(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); buildDays(); write(true); layout();
  var once = false;
  function go() { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); light.kick(); }); }
  if (!root.classList.contains('opening')) { if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); setTimeout(go, 1200); }
  addEventListener('load', layout);
})();
