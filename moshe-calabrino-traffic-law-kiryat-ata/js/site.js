(function () {
  var root = document.documentElement, WA = '972502780960';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var TITLE = { he: 'עו״ד משה קלברינו · דיני תעבורה · האורן 44, קריית אתא', en: 'Moshe Calabrino, Adv. · Traffic law · 44 HaOren St, Kiryat Ata' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור עו״ד משה קלברינו · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Moshe Calabrino, Adv. · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'עו״ד משה קלברינו', 'Moshe Calabrino, Adv.');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-what]', 'מה קרה', 'What happened');
    aria('[data-t-stage]', 'איפה זה עומד', 'Where it stands');
    aria('[data-t-call]', 'שיחה למשה, 050-278-0960', 'Call Moshe, 050-278-0960');
    aria('[data-t-wa]', 'וואטסאפ למשה', 'WhatsApp Moshe');
    $$('[data-decode]').forEach(function (d) { decode(d, true); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('mk-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
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
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-decode]').forEach(function (d) { decode(d, true); });
    clearStyles(); layout(); trails.kick(); write(true); showSign(cur);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [7.5, 19], 1: [7.5, 19], 2: [7.5, 19], 3: [7.5, 19], 4: [7.5, 19], 5: [7.5, 13.5], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  var tl = $('[data-tl]');
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false, soon = false;
    if (t && n.h >= t[0] && n.h < t[1]) { open = true; soon = t[1] - n.h <= .5; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
    tl.className = 'tl ' + (open ? (soon ? 'st-a' : 'st-g') : 'st-r');
  }
  // consecutive days with the same hours share a row; the week starts on Sunday
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

  // ---------------------------------------------------------------- entrances
  $$('.bento,.cbento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 70 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 10 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // labels that decode out of scrambled glyphs, like a camera's data stamp
  var GL = 'אבגדהוזחטיכלמנסעפצקרשת0123456789';
  function decode(el, instant) {
    var txt = el.dataset[he() ? 'he' : 'en']; clearInterval(el._t);
    if (instant !== false && (instant || still())) { el.textContent = txt; return; }
    var n = 0, steps = 16;
    el._t = setInterval(function () {
      n++; var keep = Math.floor(txt.length * n / steps);
      el.textContent = txt.slice(0, keep) + txt.slice(keep).replace(/[^\s·,]/g, function () { return GL[Math.floor(Math.random() * GL.length)]; });
      if (n >= steps) { clearInterval(el._t); el.textContent = txt; }
    }, 38);
  }
  $$('[data-decode]').forEach(function (d) {
    decode(d, true);
    if (io && !d.closest('[data-hcopy]')) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { if (!still()) decode(d, false); ob.disconnect(); } }, { threshold: .6 }).observe(d);
  });

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

  // ---------------------------------------------------------------- the road
  var road = $('[data-road]'), cam = $('[data-cam]'), camImg = $('.cam-img'), shade = $('[data-shade]'), hcopy = $('[data-hcopy]'), ftag = $('.frame-tag');
  var signsBox = $('[data-signs]'), signs = $$('[data-sign]'), route = $('[data-route]'), stops = $$('[data-stop]'), rdone = $('[data-rdone]');
  var QI = [.14, .38, .62, .86], IW = 1920, IH = 1280, VP = [430, 495];
  var map = { s: 1, ox: 0, oy: 0, w: 0, h: 0, opx: .22 };
  function fit() {
    var r = cam.getBoundingClientRect(), w = cam.offsetWidth, h = cam.offsetHeight;
    map.opx = phone() ? .15 : innerWidth < 1100 ? .2 : .26;
    camImg.style.objectPosition = (map.opx * 100) + '% 50%';
    map.w = w; map.h = h; map.s = Math.max(w / IW, h / IH); map.ox = (w - IW * map.s) * map.opx; map.oy = (h - IH * map.s) * .5;
    var vx = map.ox + VP[0] * map.s, vy = map.oy + VP[1] * map.s;
    cam.style.setProperty('--vx', vx.toFixed(1) + 'px'); cam.style.setProperty('--vy', vy.toFixed(1) + 'px');
    map.vx = vx; map.vy = vy;
  }
  function P(x, y) { return [map.ox + x * map.s, map.oy + y * map.s]; }

  // light trails along the photo's real lanes: oncoming headlights on the near carriageway, tail lights going away on the far one
  var trails = (function () {
    var cv = $('[data-trails]'), c = cv.getContext('2d'), raf = 0, vis = true, last = 0, cars = [], boost = 0;
    // lane centres where each lane meets the bottom of the photo (y = 1280), in photo pixels
    var LANES = [{ x: 820, dir: -1 }, { x: 1190, dir: -1 }, { x: 1640, dir: 1 }, { x: 2040, dir: 1 }];
    function spawn(fresh) {
      var L = LANES[Math.floor(Math.random() * LANES.length)];
      return { lane: L, z: L.dir < 0 ? (fresh ? .8 + Math.random() * 24 : 24 + Math.random() * 4) : (fresh ? .8 + Math.random() * 24 : .55 + Math.random() * .2), v: 1.1 + Math.random() * .8, len: .5 + Math.random() * .5, hue: Math.random() };
    }
    for (var i = 0; i < 16; i++) cars.push(spawn(true));
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); cv.width = map.w * dpr; cv.height = map.h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    // a point on the lane at world distance z (z = 1 is the photo's bottom edge), shifted sideways by `side` photo pixels at z = 1
    function pt(L, z, side) { var f = 1 / z, ex = L.x + side, ey = IH; return P(VP[0] + (ex - VP[0]) * f, VP[1] + (ey - VP[1]) * f); }
    function streak(L, zHead, zTail, side, col, wid, a) {
      var p1 = pt(L, zHead, side), p2 = pt(L, zTail, side);
      var g = c.createLinearGradient(p1[0], p1[1], p2[0], p2[1]);
      g.addColorStop(0, 'rgba(' + col + ',' + a.toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + col + ',0)');
      c.strokeStyle = g; c.lineWidth = Math.max(.6, wid * map.s / Math.min(zHead, zTail)); c.beginPath(); c.moveTo(p1[0], p1[1]); c.lineTo(p2[0], p2[1]); c.stroke();
    }
    function frame(t) {
      raf = 0;
      c.clearRect(0, 0, map.w, map.h);
      if (still() || !vis) return;
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t; boost *= .9;
      c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
      for (var i = 0; i < cars.length; i++) {
        var k = cars[i], L = k.lane, sp = k.v * (1 + boost);
        // equal speed in the world: the distance shrinks by z per second, so cars crawl near the horizon and rush past near the camera
        k.z += L.dir * sp * dt * Math.max(.6, k.z * .35);
        if ((L.dir < 0 && k.z < .5) || (L.dir > 0 && k.z > 28)) { cars[i] = spawn(false); continue; }
        var fade = smooth((28 - k.z) / 10) * smooth((k.z - .45) / .3), tail = Math.max(.32, k.z + (L.dir < 0 ? 1 : -1) * k.len * Math.max(.5, k.z * .45));
        if (L.dir < 0) {   // oncoming: two warm-white headlights, the trail behind them toward the horizon
          var col = k.hue < .7 ? '255,236,200' : '210,225,255';
          streak(L, k.z, tail, -55, col, 9, .85 * fade); streak(L, k.z, tail, 55, col, 9, .85 * fade);
          streak(L, k.z, k.z + .04, 0, '255,245,225', 60, .12 * fade);
        } else {           // going away: two red tail lights, the trail behind them toward the camera
          streak(L, k.z, tail, -60, '255,60,40', 8, .9 * fade); streak(L, k.z, tail, 60, '255,60,40', 8, .9 * fade);
        }
      }
      c.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    watch(road, function (v) { vis = v; kick(); });
    return { size: size, kick: kick, push: function (v) { boost = Math.min(3, boost + v); } };
  })();

  // the stages: a sign's distance from the camera falls as you drive; scale = 1 / distance, from the vanishing point
  var cur = 0;
  function driveRange() { return Math.max(1, road.offsetHeight - innerHeight * 2.7); }
  function anchor() { return phone() ? [map.w / 2, map.h * .44] : [map.w * (rtl() ? .64 : .66), map.h * .5]; }
  function placeSigns(q, gate) {
    var A = anchor();
    signs.forEach(function (sg, i) {
      var d = QI[i] - q, zr = 1 + Math.sign(d) * Math.max(0, Math.abs(d) - .045) * 9;   // the sign holds at reading size for a moment
      if (zr <= .5 || zr >= 7) { sg.style.opacity = 0; sg.style.visibility = 'hidden'; return; }
      var s = 1 / zr, bw = sg.offsetWidth, bh = sg.offsetHeight;
      var ax = clamp(A[0], bw / 2 + 16, map.w - bw / 2 - 16), cx = map.vx + (ax - map.vx) * s, cy = map.vy + (A[1] - map.vy) * s;
      var op = smooth((7 - zr) / 2.6) * smooth((zr - .55) / .3) * gate;
      if (op < .01) { sg.style.opacity = 0; sg.style.visibility = 'hidden'; return; }
      sg.style.visibility = 'visible'; sg.style.opacity = op.toFixed(3); sg.style.zIndex = Math.round(100 / zr);
      sg.style.transform = 'translate3d(' + (cx - bw / 2).toFixed(1) + 'px,' + (cy - bh / 2).toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
      sg.style.setProperty('--kb', (1.12 - .1 * smooth((3 - zr) / 2)).toFixed(3));
      sg.style.pointerEvents = zr < 1.3 && zr > .8 ? 'auto' : 'none';
    });
  }
  function setRoute(rp, onIdx) {
    route.style.setProperty('--rp', rp.toFixed(4));
    stops.forEach(function (s, i) { s.classList.toggle('on', i <= onIdx); s.setAttribute('aria-current', i === onIdx ? 'step' : 'false'); });
  }
  function showSign(i) {
    cur = (i + signs.length) % signs.length;
    signs.forEach(function (s, k) { s.classList.toggle('cur', k === cur); });
    if (still()) setRoute(cur / 3, cur);
  }
  stops.forEach(function (s, i) { s.addEventListener('click', function () {
    if (still()) { showSign(i); return; }
    var top = road.getBoundingClientRect().top + scrollY + innerHeight * .7 + QI[i] * driveRange();
    scrollTo({ top: top, behavior: 'smooth' });
  }); });
  $('[data-sprev]').addEventListener('click', function () { showSign(cur - 1); });
  $('[data-snext]').addEventListener('click', function () { showSign(cur + 1); });
  showSign(0);

  // ---------------------------------------------------------------- the file: a lamp over the desk, the folder opens
  var file = $('[data-file]'), desk = $('[data-desk]'), cover = $('[data-cover]'), lamp = { x: .3, y: .55, tx: .3, ty: .55, user: 0 };
  file.addEventListener('pointermove', function (e) { var r = desk.getBoundingClientRect(); lamp.tx = (e.clientX - r.left) / r.width; lamp.ty = (e.clientY - r.top) / r.height; lamp.user = performance.now(); });
  var fileOn = false, lraf = 0;
  watch(file, function (v) { fileOn = v; if (v) lampKick(); });
  function lampKick() { if (!lraf) lraf = requestAnimationFrame(lampFrame); }
  function lampFrame(t) {
    lraf = 0;
    if (still()) { desk.style.setProperty('--lx', '30%'); desk.style.setProperty('--ly', '55%'); return; }
    if (t - lamp.user > 2500) { lamp.tx = .5 + Math.cos(t / 2600) * .3; lamp.ty = .5 + Math.sin(t / 1900) * .25; }   // no hand: the light wanders by itself
    lamp.x = lerp(lamp.x, lamp.tx, .08); lamp.y = lerp(lamp.y, lamp.ty, .08);
    desk.style.setProperty('--lx', (lamp.x * 100).toFixed(2) + '%'); desk.style.setProperty('--ly', (lamp.y * 100).toFixed(2) + '%');
    if (fileOn) lraf = requestAnimationFrame(lampFrame);
  }

  // ---------------------------------------------------------------- areas: living tiles
  var areas = $('#areas'), areasOn = false;
  watch(areas, function (v) { areasOn = v; areas.classList.toggle('on', v); });
  $$('.tile,.ct').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var court = $('.t-court');
  court.addEventListener('pointerenter', function () { court.style.setProperty('--z', '1.1'); });
  court.addEventListener('pointerleave', function () { court.style.setProperty('--z', '1.02'); });
  // the radar: a reading rolls up just before the camera flashes (the flash is CSS, every 5 s)
  var speedEl = $('[data-speed]'), spT0 = 0;
  // the traffic light runs the Israeli sequence: red, red + amber, green, flashing green, amber
  var lamps = { r: $('.v-light .r'), a: $('.v-light .a'), g: $('.v-light .g') };
  var SEQ = [[3, 'r'], [1, 'ra'], [3, 'g'], [.35, ''], [.35, 'g'], [.35, ''], [.35, 'g'], [.35, ''], [.35, 'g'], [1.2, 'a']], seqLen = SEQ.reduce(function (a, s) { return a + s[0]; }, 0);
  var pts = $$('.v-lic .pts circle');
  setInterval(function () {
    if (!areasOn || still()) return;
    var t = performance.now() / 1000;
    if (!spT0) spT0 = t;
    var ph = (t - spT0) % 5;
    speedEl.textContent = ph < 3.6 ? Math.round(smooth(ph / 3.6) * (88 + Math.floor(t / 5) % 4 * 9)) : speedEl.textContent;
    var u = t % seqLen, on = '';
    for (var i = 0; i < SEQ.length; i++) { if (u < SEQ[i][0]) { on = SEQ[i][1]; break; } u -= SEQ[i][0]; }
    lamps.r.classList.toggle('lit', on.indexOf('r') >= 0); lamps.a.classList.toggle('lit', on.indexOf('a') >= 0); lamps.g.classList.toggle('lit', on.indexOf('g') >= 0);
    var n = Math.floor(t / .7) % 8; pts.forEach(function (p, k) { p.classList.toggle('lit', k < n); });
  }, 60);
  speedEl.textContent = '92';

  // ---------------------------------------------------------------- the ticket (the live thing)
  var what = $$('[data-what]'), stg = $$('[data-stage]'), steps = $$('[data-step]'), msgEl = $('[data-msg]'), slip = $('[data-slip]'), send = $('[data-send]');
  var shown = '', typing = 0, seen = false;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function radio(group, b) { group.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); }
  what.forEach(function (b) { b.addEventListener('click', function () { radio(what, b); lightStep(0); feed(); write(); }); });
  stg.forEach(function (b) { b.addEventListener('click', function () { radio(stg, b); lightStep(1); feed(); write(); }); });
  send.addEventListener('pointerenter', function () { lightStep(2); });
  send.addEventListener('focus', function () { lightStep(2); });
  send.addEventListener('click', function () { lightStep(2); });
  function pick(group) { return group.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0]; }
  function compose() {
    var l = he(), w = pick(what).dataset[l ? 'he' : 'en'], s = +pick(stg).dataset.stage;
    if (l) return 'שלום משה, ' + ['קיבלתי דו״ח', 'קיבלתי הזמנה לדין', 'יש לי דיון קרוב בבית המשפט לתעבורה'][s] + ' בעניין ' + w + '. אשמח לבדוק איתך מה האפשרויות.';
    return 'Hi Moshe, ' + ['I got a ticket for ', 'I was summoned to court over ', 'I have a traffic-court hearing soon about '][s] + w + '. I’d like to go over my options with you.';
  }
  function feed() { if (still()) return; slip.style.transition = 'none'; slip.style.setProperty('--sy', '-14px'); slip.offsetWidth; slip.style.transition = ''; slip.style.setProperty('--sy', '0px'); }
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !seen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var from = shown, t0 = performance.now(), del = from.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 16);
      shown = n < del ? from.slice(0, from.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  // first sight: the slip feeds out of the slot and the message types itself
  if (!still()) slip.style.setProperty('--sy', '-100%');
  watch($('[data-printer]'), function (v) {
    if (!v || seen) return; seen = true;
    if (still()) { write(true); return; }
    slip.style.setProperty('--sy', '0px'); shown = ''; msgEl.textContent = ''; setTimeout(function () { write(); }, 350);
  }, { threshold: .35 });

  // ---------------------------------------------------------------- reviews: signs drift past; a hand on them stops the drift
  var gantry = $('[data-gantry]'), gtrack = $('[data-gtrack]'), gOn = false, gHold = 0, gPos = 0, gLast = 0, graf = 0;
  $$('.gs', gtrack).forEach(function (g) { var k = g.cloneNode(true); k.setAttribute('aria-hidden', 'true'); gtrack.appendChild(k); });
  ['pointerdown', 'wheel', 'touchstart', 'focusin'].forEach(function (ev) { gantry.addEventListener(ev, function () { gHold = performance.now() + 3500; gPos = Math.abs(gantry.scrollLeft); }, { passive: true }); });
  watch(gantry, function (v) { gOn = v; if (v) gKick(); });
  function gKick() { if (!graf) { gLast = 0; graf = requestAnimationFrame(gFrame); } }
  function gFrame(t) {
    graf = 0; if (!gOn || still()) return;
    var dt = gLast ? Math.min(.05, (t - gLast) / 1000) : 0; gLast = t;
    if (t > gHold) {
      var half = gtrack.scrollWidth / 2;
      gPos += 34 * dt; if (gPos >= half) gPos -= half;
      gantry.scrollLeft = rtl() ? -gPos : gPos;
    } else gPos = Math.abs(gantry.scrollLeft);
    graf = requestAnimationFrame(gFrame);
  }

  // ---------------------------------------------------------------- footer: the name rises letter by letter
  var fname = $('[data-fname]'), main = $('#main'), foot = $('[data-foot]');
  $$('span[lang]', fname).forEach(function (sp) { sp.innerHTML = sp.textContent.split('').map(function (c, i) { return '<span class="ch" style="--k:' + i + '">' + (c === ' ' ? '&nbsp;' : c) + '</span>'; }).join(''); });

  // ---------------------------------------------------------------- one scroll loop
  var nav = $('[data-nav]'), plate = $('[data-plate]'), heroActs = $('[data-heroacts]'), sweep = $('[data-sweep]'), tsec = $('[data-ticketsec]');
  var ticking = false, lastY = scrollY;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function clearStyles() {
    [cam, hcopy, ftag].forEach(function (e) { e.style.transform = ''; e.style.opacity = ''; });
    signs.forEach(function (s) { s.style.transform = ''; s.style.opacity = ''; s.style.visibility = ''; s.style.pointerEvents = ''; s.style.zIndex = ''; });
    $$('.f-name .ch').forEach(function (c) { c.style.removeProperty('--ty'); c.style.removeProperty('--op'); });
    ['--fs', '--fr'].forEach(function (p) { file.style.removeProperty(p); });
    cover.style.removeProperty('--cv'); cover.style.removeProperty('--co');
  }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, y = scrollY;
    trails.push(Math.abs(y - lastY) / 400); lastY = y;
    nav.classList.toggle('pill', y > 40);
    var ha = heroActs.getBoundingClientRect();
    plate.classList.toggle('show', ha.bottom < 0 || ha.top > vh || hcopy.style.opacity === '0');
    if (calm) {
      shade.style.setProperty('--dim', '0'); route.style.setProperty('--ro', '1'); route.classList.add('live');
      return;
    }
    // road: hero copy leaves, the camera drives toward the vanishing point, the signs come and pass
    var rr = road.getBoundingClientRect(), sc = -rr.top, hp = clamp(sc / (vh * .7), 0, 1), q = clamp((sc - vh * .7) / driveRange(), 0, 1);
    var fr = file.getBoundingClientRect(), land = clamp(1 - fr.top / vh, 0, 1);
    cam.style.transform = 'scale(' + (1 + hp * .12 + smooth(q) * 1.45).toFixed(4) + ')';
    hcopy.style.transform = 'translate3d(0,' + (-hp * 70).toFixed(1) + 'px,0)'; hcopy.style.opacity = clamp(1 - hp * 1.4, 0, 1).toFixed(3);
    hcopy.style.visibility = hp >= .99 ? 'hidden' : '';
    ftag.style.opacity = clamp(1 - hp * 1.6, 0, 1).toFixed(3);
    signsBox.style.setProperty('--sh', (smooth((hp - .7) / .3) * (1 - smooth((q - (phone() ? .0 : .16)) / .04))).toFixed(3));
    placeSigns(q, smooth((hp - .55) / .45));
    var ro = smooth((hp - .75) / .25) * (1 - land); route.style.setProperty('--ro', ro.toFixed(3)); route.classList.toggle('live', ro > .5);
    var onIdx = -1; QI.forEach(function (qi, i) { if (q >= qi - .1) onIdx = i; });
    setRoute(clamp((q - QI[0] + .1) / (QI[3] - QI[0] + .1), 0, 1), onIdx);
    shade.style.setProperty('--dim', (smooth(q / .12) * .22 + land * .6).toFixed(3));
    // the file lands over the road
    file.style.setProperty('--fs', lerp(.93, 1, smooth(land)).toFixed(4)); file.style.setProperty('--fr', lerp(40, 0, smooth(land)).toFixed(1) + 'px');
    // the folder's cover lifts once the file has landed
    var fo = $('[data-folder]').getBoundingClientRect(), op = smooth((vh * .72 - fo.top) / (vh * .4));
    cover.style.setProperty('--cv', (op * 112).toFixed(2) + 'deg'); cover.style.setProperty('--co', (1 - smooth((op - .7) / .3)).toFixed(3));
    // a headlight sweeps across the ticket section as you arrive
    var tr = tsec.getBoundingClientRect(), bp = clamp((vh - tr.top) / (vh * 1.4), 0, 1);
    sweep.style.setProperty('--bx', ((rtl() ? 1 - bp : bp) * 200 - 100).toFixed(1) + '%');
    // footer: revealed under the page; the name rises, the road's centre line runs
    var mb = main.getBoundingClientRect().bottom, fp = clamp((vh - mb) / vh, 0, 1);
    $$('.f-name .ch').forEach(function (c, i) { var v = smooth((fp * 1.25 - i * .025) / .5); c.style.setProperty('--ty', ((1 - v) * 70).toFixed(1) + 'px'); c.style.setProperty('--op', v.toFixed(3)); });
    foot.style.setProperty('--dash', (-y * .6).toFixed(1));
    foot.style.setProperty('--gl', (.8 + fp * .35).toFixed(3));
    trails.kick();
  }

  function layout() {
    fit(); trails.size();
    $('[data-gantry]').style.setProperty('--gw', gtrack.scrollWidth + 'px');
    tick();
  }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  // opening: the speed camera's flash, then the headline sets letter by letter and the data stamp decodes
  var once = false, go = function () {
    if (once) return; once = true;
    requestAnimationFrame(function () {
      road.classList.add('ready');
      if (still()) return;
      var fl = $('[data-flash]');
      if (fl.animate) fl.animate([{ opacity: .8 }, { opacity: 0 }], { duration: 700, easing: 'cubic-bezier(.23,1,.32,1)' });
      decode($('[data-hcopy] ~ .frame-tag [data-decode]') || $('.frame-tag [data-decode]'), false);
      trails.kick(); gKick();
    });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 400);
  addEventListener('load', function () { layout(); });
})();
