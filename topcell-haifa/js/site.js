(function () {
  var root = document.documentElement, TEL = '+97249594940';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'TopCell · חנות סלולר ומעבדת תיקונים · דרך משה פלימן 4, חיפה', en: 'TopCell · Phone shop and repair lab · 4 Moshe Flimann Rd, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור TopCell – טופסל · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for TopCell · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var GLYPHS = '#%&*+=<>/\\|01';

  // ---------------------------------------------------------------- glyph decode for labels
  function decode(el, txt) {
    clearInterval(el._d);
    if (still()) { el.textContent = txt; return; }
    var n = 0, len = txt.length;
    el._d = setInterval(function () {
      n += Math.max(1, len / 12);
      var out = '';
      for (var i = 0; i < len; i++) out += i < n || txt[i] === ' ' ? txt[i] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      el.textContent = out;
      if (n >= len) clearInterval(el._d);
    }, 40);
  }

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { if (i.alt !== '' || i.hasAttribute('data-logo')) i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו ל-TopCell, 04-959-4940', 'Call TopCell, 04-959-4940');
    aria('[data-t-keys]', 'מה קורה למכשיר', 'What’s going on with the phone');
    aria('[data-t-clear]', 'ניקוי', 'Clear');
    $$('.call-out').forEach(function (c) { c.setAttribute('aria-label', c.dataset[l]); if (c.classList.contains('on')) $('.tag', c).textContent = c.dataset[l]; });
    $$('.rl,.pl').forEach(function (s) { if (s.classList.contains('on')) s.textContent = s.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('tc99-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('tc99-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    clearStyles(); layout(); waves.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [10, 18], 1: [10, 18], 2: [10, 18], 3: [10, 18], 4: [10, 18], 5: [10, 13], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, t: ((+o.hour) % 24 < 10 ? '0' : '') + ((+o.hour) % 24) + ':' + o.minute }; }
  var isOpen = false, statusTxt = '';
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
    isOpen = open; statusTxt = txt;
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
    $('[data-lstat]').textContent = open ? (l ? 'פתוח' : 'Open') : (l ? 'סגור' : 'Closed');
    $('[data-lclock]').textContent = n.t || '--:--';
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
  setInterval(status, 30000);

  // ---------------------------------------------------------------- entrances
  $$('.bento,.cbento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  // cursor spotlight on every tile
  $$('.tile,.cb').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- headline letters
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = 0;
    sp.innerHTML = '<span class="w">' + sp.textContent.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), plate = $('[data-plate]'), logo = $('[data-logo]');

  // ---------------------------------------------------------------- signal waves out of the real logo's antenna
  var waves = (function () {
    var cv = $('[data-waves]'), c = cv.getContext('2d'), w, h, raf = 0, vis = true, rings = [], last = 0, src = [0, 0], mx = -1, my = -1;
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); antenna(); }
    function antenna() {   // tip of the antenna in the logo file: x 832 of 1491, y 8 of 1065
      var r = logo.getBoundingClientRect(), hr = hero.getBoundingClientRect();
      src = [r.left - hr.left + r.width * 832 / 1491, r.top - hr.top + r.height * 8 / 1065];
    }
    function draw(t) {
      c.clearRect(0, 0, w, h);
      var maxR = Math.hypot(w, h);
      for (var i = 0; i < rings.length; i++) {
        var g = rings[i], age = (t - g.t) / 1000, r = age * (phone() ? 150 : 230), a = 1 - r / maxR;
        if (a <= 0) continue;
        // arcs open upward and sideways, like the bars in a signal icon; brighter where the hand is
        c.lineWidth = 2;
        c.strokeStyle = 'rgba(90,195,240,' + (a * .55).toFixed(3) + ')';
        c.beginPath(); c.arc(src[0], src[1], r, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
        c.strokeStyle = 'rgba(90,195,240,' + (a * .16).toFixed(3) + ')';
        c.beginPath(); c.arc(src[0], src[1], r, Math.PI * .02, Math.PI * .98); c.stroke();
        if (mx >= 0) {
          var d = Math.abs(Math.hypot(mx - src[0], my - src[1]) - r);
          if (d < 40) { var gl = c.createRadialGradient(mx, my, 0, mx, my, 120); gl.addColorStop(0, 'rgba(160,225,250,' + ((1 - d / 40) * a * .5).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(160,225,250,0)'); c.strokeStyle = gl; c.lineWidth = 4; c.beginPath(); c.arc(src[0], src[1], r, 0, Math.PI * 2); c.stroke(); }
        }
      }
      rings = rings.filter(function (g) { return (t - g.t) / 1000 * 230 < maxR; });
    }
    function frame(t) {
      raf = 0;
      if (still()) { c.clearRect(0, 0, w, h); return; }
      if (t - last > 900) { last = t; antenna(); rings.push({ t: t }); }
      draw(t);
      if (vis) raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = -1; });
    hero.addEventListener('pointerdown', function () { if (!still()) rings.push({ t: performance.now() }); });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: size, antenna: antenna, kick: kick };
  })();

  // ---------------------------------------------------------------- the sign tilts toward the hand; on phones it sways by itself
  var tiltX = 0, tiltY = 0, tAuto = true;
  hero.addEventListener('pointermove', function (e) {
    if (still() || !fine) return;
    var r = plate.getBoundingClientRect();
    tiltY = clamp((e.clientX - (r.left + r.width / 2)) / r.width, -1, 1) * 12;
    tiltX = clamp(-(e.clientY - (r.top + r.height / 2)) / r.height, -1, 1) * 10;
    tAuto = false; hero.classList.add('tilting'); applyTilt();
  });
  hero.addEventListener('pointerleave', function () { tAuto = true; tiltX = tiltY = 0; hero.classList.remove('tilting'); applyTilt(); });
  function applyTilt() {
    plate.style.setProperty('--rx', tiltX.toFixed(2) + 'deg'); plate.style.setProperty('--ry', tiltY.toFixed(2) + 'deg');
    plate.style.setProperty('--sx', (tiltY * 6 - 10).toFixed(1) + '%');
    $$('[data-fan]').forEach(function (f, i) { f.style.translate = (tiltY * (i + 1) * -.9).toFixed(1) + 'px ' + (tiltX * (i + 1) * .9).toFixed(1) + 'px'; });
  }
  (function sway(t) {   // a slow sway on touch screens so the sign is never still; scroll adds a lean
    if (!still() && tAuto && heroVis) {
      tiltY = Math.sin(t / 1600) * 7; tiltX = Math.cos(t / 2100) * 4 + clamp(scrollY / 40, 0, 8);
      plate.style.setProperty('--rx', tiltX.toFixed(2) + 'deg'); plate.style.setProperty('--ry', tiltY.toFixed(2) + 'deg');
      plate.style.setProperty('--sx', (Math.sin(t / 1600) * 50).toFixed(1) + '%');
    }
    requestAnimationFrame(sway);
  })(0);
  var heroVis = true; watch(hero, function (v) { heroVis = v; });

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : 0; s.style.transitionDelay = go ? (150 + i * 120) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- iris: callouts placed on the cover-cropped photo
  var iris = $('[data-iris]'), lens = $('[data-lens]'), lensImg = $('[data-lensimg]'), ring = $('[data-ring]'), outs = $$('.call-out');
  function placeOuts() {
    var W = lens.clientWidth, Hh = lens.clientHeight, iw = 1000, ih = 1776, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s, ox = (W - dw) * .5, oy = (Hh - dh) * .28;
    outs.forEach(function (o) {
      var x = ox + dw * +o.dataset.x, y = oy + dh * +o.dataset.y;
      o.style.left = x + 'px'; o.style.top = y + 'px';
      o.classList.toggle('flip', x > W * .55);
      o.hidden = x < 12 || x > W - 12 || y < (innerWidth >= 900 ? 20 : 80) || y > Hh - 30;
    });
  }
  function showOut(o, on) {
    if (on === o.classList.contains('on')) return;
    o.classList.toggle('on', on);
    var tag = $('.tag', o);
    if (on) decode(tag, o.dataset[root.lang]); else tag.textContent = '';
  }
  outs.forEach(function (o) { o.addEventListener('click', function () { o._pin = !o.classList.contains('on'); showOut(o, o._pin); }); });

  // ---------------------------------------------------------------- the room: a beam that roams the real shop and names what it lights
  var room = $('[data-roomstage]'), beam = $('[data-beam]'), rls = $$('.rl', room), roomOn = false, bx = .5, by = .5, hand = false;
  function placeRls() {
    var W = room.clientWidth, Hh = room.clientHeight, iw = 1600, ih = 813, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s, ox = (W - dw) / 2, oy = (Hh - dh) / 2;
    rls.forEach(function (l) { var x = ox + dw * +l.dataset.x, y = oy + dh * +l.dataset.y; l._x = x; l._y = y; l.style.left = clamp(x, 70, W - 70) + 'px'; l.style.top = y + 'px'; l.hidden = x < 0 || x > W || y < 10 || y > Hh - 10; });
  }
  function beamAt(px, py) {
    beam.style.setProperty('--bx', px + 'px'); beam.style.setProperty('--by', py + 'px');
    rls.forEach(function (l) { var on = Math.hypot(l._x - px, l._y - py) < 120; if (on !== l.classList.contains('on')) { l.classList.toggle('on', on); if (on) decode(l, l.dataset[root.lang]); } });
  }
  room.addEventListener('pointermove', function (e) { if (still()) return; hand = true; var r = room.getBoundingClientRect(); beamAt(e.clientX - r.left, e.clientY - r.top); });
  room.addEventListener('pointerleave', function () { hand = false; });
  watch(room, function (v) { roomOn = v; });
  (function roam(t) {
    if (roomOn && !hand && !still()) { var W = room.clientWidth, Hh = room.clientHeight; beamAt(W * (.5 + .42 * Math.sin(t / 2300)), Hh * (.55 + .32 * Math.sin(t / 1500 + 1))); }
    requestAnimationFrame(roam);
  })(0);
  function roomStill() { rls.forEach(function (l) { l.classList.add('on'); l.textContent = l.dataset[root.lang]; }); }

  // services: living tiles run only while seen
  var svc = $('[data-svc]');
  watch(svc, function (v) { svc.classList.toggle('on', v); });
  $$('.tile .viz').forEach(function (v) { watch(v, function (s) { v.parentNode.classList.toggle('on', s); }); });
  // data transfer: dots run from the old phone to the new one while its screen fills and the counter climbs
  (function () {
    var svg = $('.v-xfer svg'), dots = $$('.flow circle', svg), fill = $('.fill', svg), pct = $('[data-pct]'), t0 = 0;
    (function st(t) {
      if (!still() && svg.closest('.tile').classList.contains('on')) {
        if (!t0) t0 = t;
        var cyc = ((t - t0) / 4200) % 1, p = smooth(cyc / .8);
        dots.forEach(function (d, i) { var u = (cyc * 3 + i / dots.length) % 1, x = lerp(78, 162, u), y = 65 - Math.sin(u * Math.PI) * 26; d.setAttribute('cx', x); d.setAttribute('cy', y); d.style.opacity = cyc < .82 ? Math.sin(u * Math.PI) : 0; });
        fill.style.setProperty('--fl', p.toFixed(3)); pct.textContent = Math.round(p * 100);
      }
      requestAnimationFrame(st);
    })(0);
  })();
  // charging port: lint lifts out, the bolt lights, the battery fills
  (function () {
    var svg = $('.v-port svg'), lint = $('.lint', svg), t0 = 0;
    (function st(t) {
      if (!still() && svg.closest('.tile').classList.contains('on')) {
        if (!t0) t0 = t;
        var cyc = ((t - t0) / 5200) % 1, out = smooth((cyc - .1) / .25), lit = smooth((cyc - .4) / .08), fillp = smooth((cyc - .45) / .45);
        lint.style.transform = 'translateY(' + (-out * 34).toFixed(1) + 'px)'; lint.style.opacity = (1 - out).toFixed(2);
        svg.style.setProperty('--bo', (lit * (cyc > .95 ? 0 : 1)).toFixed(2));
        svg.style.setProperty('--bl', (.06 + fillp * .94).toFixed(3));
      }
      requestAnimationFrame(st);
    })(0);
  })();

  // ---------------------------------------------------------------- teardown: the scan names each part as it passes
  var parts = $('[data-parts]'), td = $('[data-tdtilt]'), pls = $$('.pl', td);
  td.addEventListener('pointermove', function (e) { if (still() || !fine) return; var r = td.getBoundingClientRect(); td.style.setProperty('--ty', ((e.clientX - r.left) / r.width - .5) * 8 + 'deg'); td.style.setProperty('--tx', -((e.clientY - r.top) / r.height - .5) * 6 + 'deg'); });
  td.addEventListener('pointerleave', function () { td.style.setProperty('--tx', '0deg'); td.style.setProperty('--ty', '0deg'); });
  function placePls() {
    var W = td.clientWidth, Hh = td.clientHeight, iw = 1600, ih = 1200, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s;
    var cs = getComputedStyle($('img', td)).objectPosition.split(' '), px = parseFloat(cs[0]) / 100 || .5;
    var ox = (W - dw) * px, oy = (Hh - dh) / 2;
    pls.forEach(function (l) { var x = ox + dw * +l.dataset.x, y = oy + dh * +l.dataset.y; l._f = x / W; l.style.left = clamp(x, 60, W - 60) + 'px'; l.style.top = (y - 18) + 'px'; l.hidden = x < 0 || x > W; });
  }

  // ---------------------------------------------------------------- the dialer: keys write what to say, the green key calls
  var keys = $$('.key[aria-pressed]'), msgEl = $('[data-msg]'), model = $('[data-model]'), steps = $$('[data-step]'), shown = '', typing = 0, seen = false;
  function lightStep(n) { steps.forEach(function (s, i) { s.classList.toggle('on', i <= n); }); }
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = keys.filter(function (k) { return k.getAttribute('aria-pressed') === 'true'; }).map(function (k) { return k.dataset[l ? 'he' : 'en']; });
    var m = model.value.trim().slice(0, 40);
    if (!picked.length && !m) return l ? 'בחרו במקשים מה קורה למכשיר.' : 'Pick on the keys what’s going on.';
    var s = l ? 'שלום, רציתי לשאול על ' + (picked.length ? list(picked, true) : 'המכשיר') + '.' : 'Hi, I wanted to ask about ' + (picked.length ? list(picked, false) : 'my phone') + '.';
    if (m) s += l ? ' הדגם: ' + m + '.' : ' Model: ' + m + '.';
    return s;
  }
  function write(instant) {
    var target = compose();
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
  keys.forEach(function (k) { k.addEventListener('click', function () { k.setAttribute('aria-pressed', k.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); lightStep(1); write(); $('[data-dialgo]').classList.remove('ready'); void $('[data-dialgo]').offsetWidth; $('[data-dialgo]').classList.add('ready'); }); });
  model.addEventListener('input', function () { lightStep(1); write(); });
  $('[data-clear]').addEventListener('click', function () { keys.forEach(function (k) { k.setAttribute('aria-pressed', 'false'); }); model.value = ''; lightStep(0); write(); });
  $('[data-dialgo]').addEventListener('pointerenter', function () { lightStep(2); });
  $('[data-dialgo]').addEventListener('focus', function () { lightStep(2); });
  watch($('[data-lcd]'), function (v) { if (v && !seen) { seen = true; lightStep(0); shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .5 });

  // ---------------------------------------------------------------- reviews: two copies so the drift loops
  var drow = $('[data-drow]'); drow.innerHTML += drow.innerHTML.replace(/<blockquote class="rv"/g, '<blockquote class="rv" aria-hidden="true"');

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var stickyEl = $('.sticky'), seam = $('[data-sigseam]'), bars = $$('i', seam), navbars = $$('[data-navbars] i'), dialCard = $('[data-dialcard]'), revs = $('[data-revs]'), fh = $('.foot-horizon i');
  var secs = ['#shop', '#services', '#parts', '#dial', '#reviews'].map(function (s) { return $(s); });
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    stickyEl.classList.toggle('away', scrollY < hero.offsetHeight * .55);
    // signal meter in the nav: one bar per section reached
    var lit = 0; secs.forEach(function (s) { if (s.getBoundingClientRect().top < vh * .5) lit++; });
    navbars.forEach(function (b, i) { b.classList.toggle('on', i < lit); });
    // seam 1: the bars rise one after another, like a signal coming in
    if (!calm) {
      var sr = seam.getBoundingClientRect(), sp = clamp((vh - sr.top) / (sr.height + vh * .35), 0, 1);
      bars.forEach(function (b, i) { b.style.setProperty('--p', (1 - smooth((sp - i * .09) / .55)).toFixed(4)); });
    }
    // iris: the logo's ring opens over the shop's front
    if (!calm) {
      var ip = prog(iris), W = lens.clientWidth, Hh = lens.clientHeight, wide = innerWidth >= 900, cx = W / 2, cy = Hh * (wide ? .45 : .62);
      var r0 = Math.min(W, Hh) * .3, rMax = Math.hypot(Math.max(cx, W - cx), Math.max(cy, Hh - cy)) + 4, e = smooth((ip - .06) / .5);
      var cr = lerp(r0, rMax, e);
      lensImg.style.setProperty('--cr', cr.toFixed(1) + 'px'); lensImg.style.setProperty('--cx', cx + 'px'); lensImg.style.setProperty('--cy', cy + 'px');
      lensImg.style.setProperty('--ks', lerp(1.25, 1, e).toFixed(4));
      ring.style.setProperty('--cr', cr.toFixed(1) + 'px'); ring.style.setProperty('--cx', cx + 'px'); ring.style.setProperty('--cy', cy + 'px');
      ring.style.setProperty('--ro', (1 - smooth((e - .55) / .3)).toFixed(3));
      $('.iris-head').style.opacity = wide ? '' : (1 - smooth((e - .45) / .3)).toFixed(3);
      outs.forEach(function (o, i) { if (!o._pin) showOut(o, ip > .6 + i * .06); });
    }
    // teardown scan
    if (!calm) {
      var pp = prog(parts), s = smooth((pp - .05) / .8);
      td.style.setProperty('--sp', s.toFixed(4)); td.style.setProperty('--so', s > 0 && s < 1 ? 1 : 0);
      pls.forEach(function (l) { var on = s > l._f - .01; if (on !== l.classList.contains('on')) { l.classList.toggle('on', on); if (on) decode(l, l.dataset[root.lang]); else l.textContent = ''; } });
    }
    // reviews land over the phone like the next card on a stack: the phone sinks back
    if (!calm) {
      var rt = revs.getBoundingClientRect().top, k = smooth((vh - rt) / (vh * .9));
      dialCard.style.transform = 'scale(' + (1 - k * .06).toFixed(4) + ')';
      dialCard.style.filter = k > .01 ? 'brightness(' + (1 - k * .45).toFixed(3) + ')' : '';
    }
    // footer horizon rises as you arrive
    var fr = fh.parentNode.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / fr.height);
    fh.style.setProperty('--rise', ((1 - fp) * 120).toFixed(1) + 'px');
  }
  function clearStyles() {
    if (!still()) return;
    bars.forEach(function (b) { b.style.removeProperty('--p'); });
    lensImg.removeAttribute('style'); ring.removeAttribute('style'); $('.iris-head').style.opacity = '';
    dialCard.style.transform = ''; dialCard.style.filter = '';
    td.style.setProperty('--sp', 1); td.style.setProperty('--so', 0);
    outs.forEach(function (o) { showOut(o, true); });
    pls.forEach(function (l) { l.classList.add('on'); l.textContent = l.dataset[root.lang]; });
    roomStill();
    plate.style.removeProperty('--rx'); plate.style.removeProperty('--ry');
  }

  function layout() { waves.size(); placeOuts(); placeRls(); placePls(); if (still()) clearStyles(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); setTimeout(waves.antenna, 1000); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { layout(); });
})();
