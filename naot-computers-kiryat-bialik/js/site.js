(function () {
  var root = document.documentElement, WA = '972508227687';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 900; };
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'נאות מחשבים · מעבדה וחנות מחשבים · קרן היסוד 33, קריית ביאליק', en: 'Naot Computers · Computer lab and shop · 33 Keren HaYesod St, Kiryat Bialik' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור נאות מחשבים · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Naot Computers · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'נאות מחשבים', 'Naot Computers');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-work]', 'מה יש בחנות', 'What the shop does');
    aria('[data-t-call]', 'התקשרו לנאות מחשבים, 050-822-7687', 'Call Naot Computers, 050-822-7687');
    aria('[data-t-wa]', 'וואטסאפ לנאות מחשבים', 'WhatsApp Naot Computers');
    aria('[data-t-mark]', 'נאות מחשבים', 'Naot Computers');
    $$('.stars[aria-label]').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
    var map = $('[data-t-map]'); if (map) map.title = l === 'he' ? 'מפה: קרן היסוד 33, קריית ביאליק' : 'Map: 33 Keren HaYesod St, Kiryat Bialik';
    $$('[data-ph-he]').forEach(function (t) { t.placeholder = t.dataset[l === 'he' ? 'phHe' : 'phEn']; });
    $$('[data-decode]').forEach(function (d) { d.textContent = d.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('naot-lang', l); } catch (e) {}
    texts(l); hours(); compose(true); markFit(); footH(); splitMark();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('naot-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    clearStyles(); tick(); streaks.kick(); ink.kick(); logo.kick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9, 18], 1: [9, 18], 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 11.5], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function parts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = parts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, o: o }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, short, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; short = txt; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); short = l ? 'פתוח עד ' + hhmm(t[1]) : 'Open until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); short = l ? 'נפתח ב-' + hhmm(t[0]) : 'Opens ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      if (!H[nd]) { txt = l ? 'סגור עכשיו' : 'Closed now'; short = txt; }
      else if (nd === (n.d + 1) % 7) { txt = l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]); short = l ? 'נפתח מחר ב-' + hhmm(H[nd][0]) : 'Opens tomorrow ' + hhmm(H[nd][0]); }
      else { txt = l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]); short = l ? 'נפתח ביום ' + dayHe[nd] : 'Opens ' + dayEn[nd]; }
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span><span>' + txt + '</span>'; });
    $$('[data-status-short]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + short; });
    var td = $('[data-today]'); if (td) td.textContent = t ? (l ? 'היום: ' : 'Today: ') + hhmm(t[0]) + '–' + hhmm(t[1]) : (l ? 'היום סגור' : 'Closed today');
    var g = $('[data-gate-tile]'); if (g) g.classList.toggle('closed', !open);
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
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
  // the camera's clock
  var clock = $('[data-clock]');
  function clockTick() { var o = parts(); if (clock) clock.textContent = (o.hour % 24 < 10 ? '0' : '') + (o.hour % 24) + ':' + o.minute + ':' + o.second; }
  clockTick(); setInterval(clockTick, 1000);

  // ---------------------------------------------------------------- headline letters
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // ---------------------------------------------------------------- labels decode out of scrambled glyphs
  var GLY = { he: 'אבגדהוזחטיכלמנסעפצקרשת0123456789', en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' };
  function decode(el) {
    var l = he() ? 'he' : 'en', target = el.dataset[l], t0 = performance.now(), dur = 900;
    if (still()) { el.textContent = target; return; }
    (function step(now) {
      var p = clamp((now - t0) / dur, 0, 1), n = Math.floor(p * target.length), s = target.slice(0, n);
      for (var i = n; i < target.length; i++) s += target[i] === ' ' || target[i] === '·' ? target[i] : GLY[l][Math.floor(Math.random() * GLY[l].length)];
      el.textContent = s; if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  // ---------------------------------------------------------------- odometers: digits roll into place
  function odo(el) {
    var v = el.dataset.odo, dec = v.indexOf('.') >= 0 ? 1 : 0, target = parseFloat(v), t0 = performance.now(), dur = 1300;
    if (still()) { el.textContent = v; return; }
    (function step(now) { var p = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = (target * e).toFixed(dec); if (p < 1) requestAnimationFrame(step); else el.textContent = v; })(t0);
  }

  // ---------------------------------------------------------------- entrances; the hero's tiles are dealt from a stack in the middle
  $$('[data-board]').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  function onIn(el) {
    $$('[data-decode]', el).forEach(decode);
    $$('[data-odo]', el).forEach(odo);
  }
  var deal = $('[data-deal]');
  if (deal && !still()) {
    var br = deal.getBoundingClientRect(), cx = br.left + br.width / 2, cy = br.top + br.height / 2;
    $$('[data-tile]', deal).forEach(function (t, i, all) {
      var r = t.getBoundingClientRect();
      t.style.setProperty('--dx', (cx - (r.left + r.width / 2)) * .8 + 'px');
      t.style.setProperty('--dy', (cy - (r.top + r.height / 2)) * .8 + 'px');
      t.style.setProperty('--dr', ((i % 2 ? 1 : -1) * (3 + i)) + 'deg');
      t.style.setProperty('--d', (all.length - 1 - i) * 110 + 'ms');   // the camera on the shop lands last
    });
    $('.t-cam', deal).style.setProperty('--d', '520ms');
    $('.t-name', deal).style.setProperty('--d', '0ms');
    requestAnimationFrame(function () { requestAnimationFrame(function () { deal.classList.add('dealt'); $$('[data-tile]', deal).forEach(function (t) { t.classList.add('in'); onIn(t); }); }); });
  } else if (deal) { $$('[data-tile]', deal).forEach(function (t) { t.classList.add('in'); onIn(t); }); }
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); onIn(e.target); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile],.revs-side').forEach(function (el) { if (el.closest('[data-deal]')) return; rio ? rio.observe(el) : (el.classList.add('in'), onIn(el)); });

  // ---------------------------------------------------------------- spotlight under the hand
  $$('[data-board]').forEach(function (b) {
    b.addEventListener('pointermove', function (e) {
      var t = e.target.closest('.tile'); if (!t) return;
      var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // ---------------------------------------------------------------- cameras: the picture pans toward the hand, and patrols by itself on phones
  function ptz(tile, amp) {
    var pan = $('[data-pan]', tile), last = 0, vis = false, k = 0;
    var set = function (x, y) { if (still()) { pan.style.removeProperty('--px'); pan.style.removeProperty('--py'); return; } pan.style.setProperty('--px', (x * amp).toFixed(1) + 'px'); pan.style.setProperty('--py', (y * amp).toFixed(1) + 'px'); };
    tile.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; last = Date.now(); var r = tile.getBoundingClientRect(); set(-((e.clientX - r.left) / r.width - .5) * 2, -((e.clientY - r.top) / r.height - .5) * 2); });
    var pts = [[.8, -.4], [-.7, -.2], [-.3, .7], [.6, .5], [0, 0]];
    watch(tile, function (v) { vis = v; });
    setInterval(function () { if (!vis || Date.now() - last < 3000) return; var p = pts[k++ % pts.length]; set(p[0], p[1]); }, 2200);
  }
  ptz($('[data-cam]'), 26); ptz($('[data-cam2]'), 18);

  // ---------------------------------------------------------------- the real logo becomes its own pixels, and gathers back
  var logo = (function () {
    var tile = $('[data-logo]'), img = $('img', tile), cv = $('canvas', tile), c = cv.getContext('2d'), P = [], w, h, raf = 0, mx = -999, my = -999, t0 = 0, vis = true, ok = false, scatter = 0;
    function sample() {
      var s = 64, o = document.createElement('canvas'); o.width = s; o.height = s; var oc = o.getContext('2d');
      try { oc.drawImage(img, 0, 0, s, s); var d = oc.getImageData(0, 0, s, s).data; } catch (e) { return false; }
      P = [];
      for (var y = 0; y < s; y++) for (var x = 0; x < s; x++) {
        var k = (y * s + x) * 4, r = d[k], g = d[k + 1], b = d[k + 2], lum = (r + g + b) / 3;
        if (lum > 70 || b > 150) P.push({ u: x / s, v: y / s, col: 'rgb(' + r + ',' + g + ',' + b + ')', a: Math.random() * 6.28, rad: 40 + Math.random() * 120, x: 0, y: 0, sz: lum > 170 ? 1.2 : 1 });
      }
      return P.length > 0;
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = tile.clientWidth; h = tile.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(now) {
      raf = 0; if (!ok) return;
      var side = Math.min(w, h), ox = (w - side) / 2, oy = (h - side) / 2, cell = side / 64, t = (now - t0) / 1000;
      var gather = still() ? 1 : smooth((t - .2) / 1.1);
      scatter += ((mx > -900 ? 1 : 0) - scatter) * .08;
      c.fillStyle = '#0b1d57'; c.fillRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], hx = ox + p.u * side, hy = oy + p.v * side;
        var sx = hx + Math.cos(p.a + t * .6) * p.rad * (1 - gather), sy = hy + Math.sin(p.a + t * .6) * p.rad * (1 - gather);
        if (scatter > .01) { var dx = hx - mx, dy = hy - my, dd = Math.sqrt(dx * dx + dy * dy) + .1, f = Math.max(0, 1 - dd / (side * .45)) * scatter; sx += dx / dd * f * 34 + Math.cos(p.a + t * 2) * f * 6; sy += dy / dd * f * 34 + Math.sin(p.a + t * 2) * f * 6; }
        c.fillStyle = p.col; c.fillRect(sx, sy, cell * p.sz, cell * p.sz);
      }
      var settled = gather >= 1 && scatter < .02;
      tile.classList.toggle('parts', !settled);
      if (!settled && vis && !still()) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() {
      var go = function () { size(); ok = sample(); if (!ok) return; t0 = performance.now(); if (still()) { tile.classList.remove('parts'); return; } tile.classList.add('parts'); kick(); };
      img.complete ? go() : img.addEventListener('load', go);
    }
    tile.addEventListener('pointermove', function (e) { var r = tile.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; kick(); });
    tile.addEventListener('pointerleave', function () { mx = my = -999; kick(); });
    tile.addEventListener('pointerdown', function (e) { var r = tile.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; kick(); setTimeout(function () { mx = my = -999; kick(); }, 700); });
    var started = false;
    watch(tile, function (v) { vis = v; if (v && !started) { started = true; start(); } kick(); }, { threshold: .5 });
    return { start: start, kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // ---------------------------------------------------------------- the logo's sweeps of light behind the page
  var streaks = (function () {
    var cv = $('[data-streaks]'), c = cv.getContext('2d'), w, h, raf = 0, last = 0;
    function size() { var dpr = Math.min(1.5, devicePixelRatio || 1); w = innerWidth; h = innerHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function sweep(t, k, sy) {
      var y0 = h * (.25 + k * .22) - sy * (.08 + k * .04) % (h * 1.4), a = Math.sin(t * .25 + k * 1.7);
      c.beginPath(); c.moveTo(-w * .1, y0 + h * .3);
      c.bezierCurveTo(w * .3, y0 - h * (.25 + a * .08), w * .65, y0 + h * (.1 + a * .06), w * 1.1, y0 - h * .2);
      return c;
    }
    function frame(now) {
      raf = 0; if (now - last < 33 && !still()) { raf = requestAnimationFrame(frame); return; } last = now;
      var t = still() ? 0 : now / 1000, sy = scrollY;
      c.clearRect(0, 0, w, h); c.lineCap = 'round';
      for (var k = 0; k < 3; k++) {
        var layers = [[46, .025], [18, .05], [5, .14], [1.6, .5]];
        for (var j = 0; j < layers.length; j++) { sweep(t, k, sy); c.strokeStyle = 'rgba(' + (k === 1 ? '159,212,255' : '91,134,255') + ',' + layers[j][1] * (k === 1 ? 1 : .8) + ')'; c.lineWidth = layers[j][0]; c.stroke(); }
      }
      if (!still()) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    size(); kick();
    return { kick: kick, size: function () { size(); kick(); } };
  })();

  // ---------------------------------------------------------------- lab: the work lamp follows the hand; drifts over the bench on its own
  (function () {
    var t = $('[data-lens]'), lens = $('.lens', t), vis = false, last = 0, raf = 0;
    t.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; last = Date.now(); var r = t.getBoundingClientRect(); lens.style.setProperty('--lx', (e.clientX - r.left) + 'px'); lens.style.setProperty('--ly', (e.clientY - r.top) + 'px'); });
    function frame(now) {
      raf = 0; if (!vis || still()) return;
      if (Date.now() - last > 2500) { var s = now / 1000; lens.style.setProperty('--lx', (50 + Math.sin(s * .55) * 26) + '%'); lens.style.setProperty('--ly', (42 + Math.sin(s * .9 + 1) * 18) + '%'); }
      raf = requestAnimationFrame(frame);
    }
    watch(t, function (v) { vis = v; if (v && !raf) raf = requestAnimationFrame(frame); });
  })();

  // ---------------------------------------------------------------- apart: drag the line (or let the scroll move it)
  var wipe = $('[data-wipe]'), dragged = 0;
  (function () {
    var down = false;
    function set(e) { var r = wipe.getBoundingClientRect(); wipe.style.setProperty('--wp', clamp((e.clientX - r.left) / r.width * 100, 4, 96) + '%'); }
    wipe.addEventListener('pointerdown', function (e) { down = true; dragged = Date.now(); set(e); });
    addEventListener('pointermove', function (e) { if (down) { dragged = Date.now(); set(e); } });
    addEventListener('pointerup', function () { down = false; });
  })();

  // ---------------------------------------------------------------- ink: drops of the four inks bloom and spread
  var ink = (function () {
    var t = $('[data-ink]'), cv = $('canvas', t), c = cv.getContext('2d'), D = [], w, h, raf = 0, vis = false, lastDrop = 0;
    var COL = ['42,183,230', '229,72,154', '241,194,50', '120,140,190'];
    function size() { var dpr = Math.min(1.5, devicePixelRatio || 1); w = t.clientWidth; h = t.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function drop(x, y) {
      var col = COL[D.length % 4], blobs = [];
      for (var i = 0; i < 7; i++) blobs.push({ a: Math.random() * 6.28, d: Math.random() * .6, r: .35 + Math.random() * .5 });
      D.push({ x: x, y: y, t: performance.now(), col: col, b: blobs }); if (D.length > 14) D.shift();
    }
    function frame(now) {
      raf = 0; if (!vis || still()) return;
      if (now - lastDrop > 1400) { lastDrop = now; drop(w * (.2 + Math.random() * .6), h * (.15 + Math.random() * .55)); }
      c.clearRect(0, 0, w, h);
      D.forEach(function (d) {
        var age = Math.max(0, (now - d.t) / 1000), R = Math.min(w, h) * .32 * (1 - Math.exp(-age * .7)), fade = Math.max(0, 1 - age / 7);
        d.b.forEach(function (b) {
          var bx = d.x + Math.cos(b.a + age * .15) * R * b.d, by = d.y + Math.sin(b.a + age * .15) * R * b.d + age * 6;
          var g = c.createRadialGradient(bx, by, 0, bx, by, R * b.r + 2);
          g.addColorStop(0, 'rgba(' + d.col + ',' + .38 * fade + ')'); g.addColorStop(1, 'rgba(' + d.col + ',0)');
          c.fillStyle = g; c.beginPath(); c.arc(bx, by, R * b.r + 2, 0, 6.29); c.fill();
        });
      });
      raf = requestAnimationFrame(frame);
    }
    t.addEventListener('pointerdown', function (e) { var r = t.getBoundingClientRect(); drop(e.clientX - r.left, e.clientY - r.top); });
    watch(t, function (v) { vis = v; if (v) { size(); kick(); } });
    function kick() { if (!raf && vis && !still()) raf = requestAnimationFrame(frame); if (still()) c.clearRect(0, 0, w || 0, h || 0); }
    return { kick: kick, size: function () { if (vis) size(); } };
  })();

  // ---------------------------------------------------------------- the business card tilts toward the hand
  (function () {
    var t = $('[data-tilt]'), card = $('.card3d', t);
    t.addEventListener('pointermove', function (e) {
      if (still()) return; var r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.setProperty('--rx', (x * 22).toFixed(1) + 'deg'); card.style.setProperty('--ry', (-y * 16).toFixed(1) + 'deg'); card.style.setProperty('--sh', (x * 120).toFixed(0) + '%');
    });
    t.addEventListener('pointerleave', function () { card.style.removeProperty('--rx'); card.style.removeProperty('--ry'); card.style.removeProperty('--sh'); });
  })();

  // ---------------------------------------------------------------- the composer: the note prints in the chosen ink and goes out on WhatsApp
  var DEV = { he: ['מחשב נייד', 'מחשב נייח', 'מדפסת', 'רשת ומצלמות'], en: ['Laptop', 'Desktop', 'Printer', 'Network and cameras'] };
  var INK = ['#1a8fbd', '#c42f7e', '#b58a0c', '#1b2030'];
  var out = $('[data-out]'), head = $('[data-head]'), paper = $('[data-paper]'), printer = $('[data-printer]'), send = $('[data-send]'), typing = 0;
  function message() {
    var l = he() ? 'he' : 'en', d = +($('input[name="dev"]:checked') || { value: 0 }).value, name = $('[data-name]').value.trim(), issue = $('[data-issue]').value.trim().replace(/\s+/g, ' ');
    var lines = l === 'he'
      ? ['שלום נאות מחשבים,', name ? 'כאן ' + name + '.' : '', DEV.he[d] + ': ' + (issue || 'אשמח לעזרה.'), 'מתי נוח שאגיע לחנות?']
      : ['Hi Naot Computers,', name ? 'This is ' + name + '.' : '', DEV.en[d] + ': ' + (issue || 'I’d like some help.'), 'When would be a good time to come by the shop?'];
    return { text: lines.filter(Boolean).join('\n'), ink: INK[d] };
  }
  function compose(instant) {
    var m = message();
    printer.style.setProperty('--ink-now', m.ink);
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m.text);
    $$('[data-wa-link]').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(he() ? 'שלום נאות מחשבים, אשמח לעזרה.' : 'Hi Naot Computers, I’d like some help.'); });
    cancelAnimationFrame(typing);
    if (instant || still()) { out.textContent = m.text; head.style.setProperty('--hx', '0px'); return; }
    var shown = out.textContent, common = 0; while (common < shown.length && shown[common] === m.text[common]) common++;
    var i = common, railW = head.parentNode.clientWidth - head.offsetWidth;
    (function step() {
      i = Math.min(m.text.length, i + 2); out.textContent = m.text.slice(0, i);
      var lineStart = m.text.lastIndexOf('\n', i - 1) + 1, col = (i - lineStart) % 28;
      head.style.setProperty('--hx', ((he() ? 1 - col / 28 : col / 28) * railW).toFixed(0) + 'px');
      paper.style.setProperty('--pf', ((i % 6) - 3) * .3 + 'px');
      if (i < m.text.length) typing = requestAnimationFrame(step);
    })();
  }
  $$('input[name="dev"]').forEach(function (r) { r.addEventListener('change', function () { out.textContent = ''; compose(); }); });
  $('[data-issue]').addEventListener('input', function () { compose(); });
  $('[data-name]').addEventListener('input', function () { compose(); });
  watch(printer, function (v) { if (v && !printer.dataset.done) { printer.dataset.done = 1; out.textContent = ''; compose(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- the footer's wordmark: letters, fitted to the width
  var mark = $('[data-mark]');
  function splitMark() {
    $$('span[lang]', mark).forEach(function (sp) {
      if (sp.dataset.split) return; sp.dataset.split = 1; var i = 0;
      sp.innerHTML = sp.textContent.split('').map(function (ch) { return ch === ' ' ? ' ' : '<span class="l" style="--i:' + (i++) + '">' + ch + '</span>'; }).join('');
    });
  }
  function markFit() {
    mark.style.setProperty('--mark-s', '100px');
    var sp = $('span[lang="' + root.lang + '"]', mark), avail = mark.parentNode.clientWidth;
    if (!sp) return; var wd = sp.getBoundingClientRect().width || 1;
    mark.style.setProperty('--mark-s', Math.min(240, 100 * avail / wd * .98).toFixed(1) + 'px');
  }
  var foot = $('[data-foot]'), page = $('.page');
  function footH() { page.style.setProperty('--foot-h', foot.offsetHeight + 'px'); }

  // ---------------------------------------------------------------- one scroll loop for every scroll-linked scene
  var nav = $('[data-nav]'), dock = $('[data-dock]'), door = $('[data-door]'), stage = $('.door-stage', door), shrink = $('[data-shrink]'), sheet = $('.sheet'), feedT = $('[data-feed]'), rvs = $$('.rv'), hero = $('.hero');
  rvs.forEach(function (r, i) { r.style.setProperty('--k', i); r.style.setProperty('--tw', (i % 2 ? -1.6 : 1.4) + 'deg'); });
  var prog = function (el, a, b) { var r = el.getBoundingClientRect(), vh = innerHeight; return clamp((vh * a - r.top) / (r.height + vh * (b - a)), 0, 1); };
  function clearStyles() {
    ['--zoom', '--gate', '--fill', '--intro', '--outro', '--dim'].forEach(function (p) { stage.style.removeProperty(p); });
    shrink.style.removeProperty('--sk'); sheet.style.removeProperty('--feed'); sheet.style.removeProperty('--ln');
    rvs.forEach(function (r) { r.style.removeProperty('--land'); }); mark.style.removeProperty('--rise');
  }
  function tick() {
    var y = scrollY, vh = innerHeight;
    nav.classList.toggle('pill', y > 40);
    dock.classList.toggle('on', y > vh * .6 && (innerHeight + y) < document.documentElement.scrollHeight - foot.offsetHeight * .6);
    var footShow = clamp((y + vh - (document.documentElement.scrollHeight - foot.offsetHeight)) / foot.offsetHeight, 0, 1);
    $('[data-streaks]').style.opacity = (.9 * (1 - footShow)).toFixed(2);
    foot.style.visibility = (y + vh * 2 > document.documentElement.scrollHeight - foot.offsetHeight) ? 'visible' : 'hidden';
    if (still()) return;
    // the door: gate folds open, the camera walks in, the ground closes over it seamlessly
    var r = door.getBoundingClientRect(), p = clamp(-r.top / (r.height - vh), 0, 1);
    stage.style.setProperty('--intro', (1 - smooth(p / .22)).toFixed(3));
    stage.style.setProperty('--gate', (1 - .9 * smooth((p - .08) / .34)).toFixed(3));
    stage.style.setProperty('--zoom', (1 + 2.6 * Math.pow(smooth((p - .25) / .55), 1.4)).toFixed(3));
    stage.style.setProperty('--dim', smooth((p - .5) / .3).toFixed(3));
    stage.style.setProperty('--fill', (smooth((p - .62) / .2) * .9 + smooth((p - .86) / .12) * .1).toFixed(3));
    stage.style.setProperty('--outro', smooth((p - .74) / .16).toFixed(3));
    // apart: the scroll moves the line unless a hand just did
    if (Date.now() - dragged > 4000) wipe.style.setProperty('--wp', (92 - 84 * smooth(prog(wipe, 1, .2))).toFixed(1) + '%');
    // printer: the page feeds out while the tile crosses the screen
    var fp = prog(feedT, 1, .1);
    sheet.style.setProperty('--feed', (100 - 62 * smooth(fp / .7)).toFixed(1) + '%'); sheet.style.setProperty('--ln', (100 * smooth((fp - .3) / .5)).toFixed(0) + '%');
    // reviews: each card lands on the stack as it arrives
    rvs.forEach(function (c) { var cr = c.getBoundingClientRect(); c.style.setProperty('--land', clamp((cr.top - vh * .55) / (vh * .45), 0, 1).toFixed(3)); });
    // visit: the shop photo comes in large and shrinks into its frame
    var sr = shrink.getBoundingClientRect(); shrink.style.setProperty('--sk', (1 + .22 * clamp((sr.top - vh * .25) / (vh * .6), 0, 1)).toFixed(3));
    // footer letters rise as the curtain opens
    mark.style.setProperty('--rise', smooth(footShow * 1.3).toFixed(3));
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); } }, { passive: true });
  addEventListener('resize', function () { streaks.size(); logo.size(); ink.size(); markFit(); footH(); tick(); });

  // ---------------------------------------------------------------- start
  texts(root.lang); hours(); compose(true); splitMark(); markFit(); footH(); tick();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { markFit(); footH(); });
})();
