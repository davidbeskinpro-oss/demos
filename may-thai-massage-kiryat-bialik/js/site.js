(function () {
  var root = document.documentElement, WA = '972587906419';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 760; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'מאי עיסוי תאילנדי · בן גוריון 63, קריית ביאליק', en: 'May Thai Massage · 63 Ben Gurion St, Kiryat Bialik' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור מאי עיסוי תאילנדי · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for May Thai Massage · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- headline + wordmark: split into letters (keeps <em>)
  function split(el, start) {
    var i = start || 0;
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
            var ws = document.createElement('span'); ws.className = 'w'; ws.style.whiteSpace = 'nowrap';
            w.split('').forEach(function (c) { var s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = c; ws.appendChild(s); });
            frag.appendChild(ws);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
  }
  $$('[data-split] .ln > span[lang]').forEach(function (sp) { split(sp, sp.closest('.ln').previousElementSibling ? 12 : 0); });
  var word = $('[data-word]'); split(word);

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'מאי עיסוי תאילנדי', 'May Thai Massage');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-area]', 'איפה', 'Where');
    aria('[data-t-when]', 'מתי', 'When');
    aria('[data-t-call]', 'להתקשר למאי', 'Call May');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: בן גוריון 63, קריית ביאליק' : 'Map: 63 Ben Gurion St, Kiryat Bialik'; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('may-lang', l); } catch (e) {}
    texts(l); hours(); compose(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('may-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    $('[data-foot]').classList.add('in');
    layout(); dust.kick(); figure.kick(); ring.kick(); compose(true); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9, 18], 1: [9, 18], 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    var all = [0, 1, 2, 3, 4, 5, 6].every(function (d) { return H[d] && H[d][0] === 0 && H[d][1] === 24; });
    if (all) { open = true; txt = l ? 'פתוח 24/7' : 'Open 24/7'; }
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
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el, i) { el.style.setProperty('--d', (i % 3) * 80 + 'ms'); rio ? rio.observe(el) : el.classList.add('in'); });
  var foot = $('[data-foot]');
  watch(foot, function (v) { if (v) foot.classList.add('in'); }, { rootMargin: '0px 0px -15% 0px' });

  // ---------------------------------------------------------------- opening: the logo card, then away (never more than ~1.3 s)
  var op = $('[data-opening]');
  if (op) {
    if (still()) op.remove();
    else { setTimeout(function () { op.classList.add('done'); }, 1000); setTimeout(function () { op.remove(); }, 1700); }
  }

  // ---------------------------------------------------------------- the room board: one photo cut across tiles
  var board = $('[data-board]'), boardTiles = [];
  function buildBoard() {
    var ph = phone(), cols = ph ? 3 : 6, rows = ph ? 6 : 4;
    var place = ph ? { head: [0, 0], f1: [1, 2], f2: [3, 0], act: [5, 1] } : { head: [0, 0], f1: [1, 2], f2: [2, 4], f3: [3, 1], act: [3, 5] };
    $$('.tile.pic', board).forEach(function (t) { t.remove(); });
    var taken = {};
    [['head', '.t-head'], ['f1', '.t-f1'], ['f2', '.t-f2'], ['f3', '.t-f3'], ['act', '.t-act']].forEach(function (p) {
      var el = $(p[1], board), at = place[p[0]];
      if (!at) { el.style.gridRow = el.style.gridColumn = ''; return; }
      el.style.gridRow = at[0] + 1; el.style.gridColumn = (at[1] + 1) + (p[0] === 'head' && ph ? ' / span 2' : '');
      taken[at[0] + ',' + at[1]] = 1; if (p[0] === 'head' && ph) taken[at[0] + ',' + (at[1] + 1)] = 1;
    });
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      if (taken[r + ',' + c]) continue;
      var t = document.createElement('div'); t.className = 'tile pic'; t.setAttribute('aria-hidden', 'true');
      t.style.gridRow = r + 1; t.style.gridColumn = c + 1; t.dataset.o = r + c;
      var i = document.createElement('i'); i.style.backgroundPosition = (c / (cols - 1) * 100) + '% ' + (r / (rows - 1) * 100) + '%';
      t.appendChild(i); board.appendChild(t);
    }
    boardTiles = $$('.tile', board);
    boardTiles.forEach(function (t) { var r = parseInt(t.style.gridRow, 10) || 0, c = parseInt(t.style.gridColumn, 10) || 0; t.dataset.o = r + c; });
  }
  var spot = { x: -999, y: -999, on: false };
  board.addEventListener('pointermove', function (e) { spot.on = true; spot.x = e.clientX; spot.y = e.clientY; });
  board.addEventListener('pointerleave', function () { spot.on = false; });

  // ---------------------------------------------------------------- hero: the seam, the dust, the tilting frame
  var hero = $('[data-hero]'), nav = $('[data-nav]'), seam0 = 0.5;
  function measureSeam() {
    var ln = $$('.hw-a .ln')[1]; if (!ln) return;
    var r = ln.getBoundingClientRect(), h = hero.getBoundingClientRect();
    seam0 = (r.top - h.top + r.height * 0.55) / hero.clientHeight;
    // the sub line and buttons follow the headline, so no empty field opens between them
    var f = $('.hero-foot'), hb = r.bottom - h.top, hh = hero.clientHeight;
    f.style.top = Math.max(0, Math.min(hb + hh * .09, hh - f.offsetHeight - 30)).toFixed(0) + 'px'; f.classList.add('placed');
  }
  var frame = $('[data-tilt]');
  if (fine) {
    hero.addEventListener('pointermove', function (e) {
      if (still()) return;
      var x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      frame.style.setProperty('--ty', (x * 10).toFixed(2) + 'deg'); frame.style.setProperty('--tx', (-y * 8).toFixed(2) + 'deg');
      frame.style.setProperty('--px', (-x * 14).toFixed(1) + 'px'); frame.style.setProperty('--py', (-y * 14).toFixed(1) + 'px');
    });
  }

  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = true, mx = -1e4, my = -1e4;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 40 : 80; P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 2.2, v: .15 + Math.random() * .45, ph: Math.random() * 6.3 });
    }
    function frameFn(t) {
      raf = 0; c.clearRect(0, 0, w, h); if (!vis || still()) return;
      var sea = parseFloat(hero.style.getPropertyValue('--sea-px')) || h * .5;
      for (var i = 0; i < P.length; i++) {
        var p = P[i]; p.y -= p.v; p.x += Math.sin(t / 1800 + p.ph) * .3;
        var dx = p.x - mx, dy = p.y - my, d = dx * dx + dy * dy;
        if (d < 12000) { p.x += dx / 40; p.y += dy / 40; }
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        var a = .35 + .35 * Math.sin(t / 700 + p.ph);
        c.fillStyle = p.y > sea ? 'rgba(240,220,160,' + a.toFixed(2) + ')' : 'rgba(255,248,226,' + (a * .9).toFixed(2) + ')';
        c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
      }
      raf = requestAnimationFrame(frameFn);
    }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -1e4; });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frameFn); }
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- the logo's figure rebuilt from its own pixels, in gold dust
  var figure = (function () {
    var cv = $('[data-figure]'), c = cv.getContext('2d'), img = $('[data-figsrc]'), P = [], w = 0, h = 0, raf = 0, vis = false, mx = -1e4, my = -1e4, born = 0, ready = false;
    function sample() {
      var s = 200, o = document.createElement('canvas'); o.width = o.height = s;
      var oc = o.getContext('2d');
      // the drawing sits in the logo's upper middle: x 38–62 %, y 29–50 %
      var sx = img.naturalWidth * .385, sy = img.naturalHeight * .295, sw = img.naturalWidth * .245, sh = img.naturalHeight * .21;
      oc.drawImage(img, sx, sy, sw, sh, 0, 0, s, s * sh / sw);
      var d = oc.getImageData(0, 0, s, s).data, pts = [];
      for (var y = 0; y < s; y += 2) for (var x = 0; x < s; x += 2) { var k = (y * s + x) * 4; if (d[k] + d[k + 1] + d[k + 2] < 260) pts.push([x / s, y / s * sw / sh]); }
      return pts;
    }
    function size() {
      if (!ready) return;
      var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; if (!w) return;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var pts = sample(), aspect = 0.21 / 0.245, fw = Math.min(w, h / aspect) * .96, ox = (w - fw) / 2, oy = (h - fw * aspect) / 2;
      P = pts.map(function (p) { var tx = ox + p[0] * fw, ty = oy + p[1] * fw; return { tx: tx, ty: ty, x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, ph: Math.random() * 6.3 }; });
      draw(still() ? 1 : 0);
    }
    function draw(settle, t) {
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        if (settle) { p.x = p.tx; p.y = p.ty; }
        var a = .7 + .3 * Math.sin((t || 0) / 600 + p.ph);
        c.fillStyle = 'rgba(240,220,160,' + a.toFixed(2) + ')';
        c.fillRect(p.x - .9, p.y - .9, 1.8, 1.8);
      }
    }
    function step(t) {
      raf = 0; if (!vis || still()) { draw(1); return; }
      if (!born) born = t;
      var auto = !fine ? { x: w * (.5 + .4 * Math.sin(t / 1400)), y: h * (.5 + .35 * Math.cos(t / 1100)) } : null;
      for (var i = 0; i < P.length; i++) {
        var p = P[i], ax = (p.tx - p.x) * .045, ay = (p.ty - p.y) * .045;
        var qx = auto ? auto.x : mx, qy = auto ? auto.y : my, dx = p.x - qx, dy = p.y - qy, d = dx * dx + dy * dy, R = auto ? 900 : 2200;
        if (d < R) { var f = (R - d) / R * 3; ax += dx / Math.sqrt(d + 1) * f; ay += dy / Math.sqrt(d + 1) * f; }
        p.vx = (p.vx + ax) * .82; p.vy = (p.vy + ay) * .82; p.x += p.vx + Math.sin(t / 900 + p.ph) * .08; p.y += p.vy;
      }
      draw(0, t); raf = requestAnimationFrame(step);
    }
    cv.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    cv.addEventListener('pointerleave', function () { mx = my = -1e4; });
    cv.addEventListener('pointerdown', function () { P.forEach(function (p) { p.vx += (Math.random() - .5) * 14; p.vy += (Math.random() - .5) * 14; }); kick(); });
    function go() { ready = true; size(); }
    if (img.complete && img.naturalWidth) go(); else img.addEventListener('load', go);
    watch(cv, function (v) { vis = v; kick(); });
    function kick() { if (!raf && ready) raf = requestAnimationFrame(step); }
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- reviews: a ring of photos and reviews
  var ring = (function () {
    var stage = $('[data-ring-stage]'), el = $('[data-ring]'), cards = $$('.card', el), n = cards.length, rot = 0, vel = 0, drag = null, raf = 0, vis = false, lastY = scrollY;
    function radius() { return (phone() ? 220 : 270) / (2 * Math.tan(Math.PI / n)) * 1.12; }
    function place() {
      var R = radius();
      cards.forEach(function (cd, i) {
        var a = i * 360 / n + rot, rad = a * Math.PI / 180, front = (Math.cos(rad) + 1) / 2;
        cd.style.transform = 'rotateY(' + a + 'deg) translateZ(' + R.toFixed(0) + 'px)';
        cd.style.filter = 'brightness(' + (.45 + .55 * front).toFixed(2) + ')';
        cd.style.zIndex = Math.round(front * 100);
      });
      el.style.transform = 'translateZ(' + (-R).toFixed(0) + 'px)';
    }
    function step() {
      raf = 0; if (still()) { cards.forEach(function (cd) { cd.style.transform = ''; cd.style.filter = ''; }); return; }
      if (!drag) { vel *= .94; rot += vel + .06; var dy = scrollY - lastY; rot += dy * .04; }
      lastY = scrollY; place();
      if (vis) raf = requestAnimationFrame(step);
    }
    stage.addEventListener('pointerdown', function (e) { if (still()) return; drag = { x: e.clientX, r: rot, t: e.timeStamp }; stage.classList.add('drag'); stage.setPointerCapture(e.pointerId); });
    stage.addEventListener('pointermove', function (e) { if (!drag) return; var nr = drag.r + (e.clientX - drag.x) * .25; vel = nr - rot; rot = nr; });
    var end = function () { drag = null; stage.classList.remove('drag'); };
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
    watch(stage, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(step); }
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    var target = o.dataset.odo, dec = target.indexOf('.') >= 0, to = parseFloat(target);
    watch(o, function (v) {
      if (!v || o.dataset.done) return; o.dataset.done = 1;
      if (still()) return;
      var t0 = performance.now();
      (function f(t) { var k = smooth((t - t0) / 1100), from = dec ? to - 1 : 0, val = from + (to - from) * k; o.textContent = dec ? val.toFixed(1) : Math.round(val); if (k < 1) requestAnimationFrame(f); else o.textContent = target; })(t0);
    });
  });

  // ---------------------------------------------------------------- the live thing: petals + hours ribbon -> WhatsApp
  var AREA = { he: ['הצוואר והכתפיים', 'הגב', 'הרגליים וכפות הרגליים', 'כל הגוף'], en: ['the neck and shoulders', 'the back', 'the legs and feet', 'the whole body'] };
  var WHEN = { he: ['בשעות הבוקר', 'בצהריים', 'אחר הצהריים', 'ביום שישי'], en: ['in the morning', 'around midday', 'in the afternoon', 'on Friday'] };
  var sel = { a: 0, w: 0 }, bubble = $('[data-bubble]'), typer = 0;
  function msg() {
    var l = he() ? 'he' : 'en';
    return l === 'he'
      ? 'היי מאי, הגעתי דרך האתר. אשמח לקבוע עיסוי תאילנדי עם דגש על ' + AREA.he[sel.a] + ', ' + WHEN.he[sel.w] + '. מתי יש מקום?'
      : 'Hi May, I found you through the website. I’d like to book a Thai massage focusing on ' + AREA.en[sel.a] + ', ' + WHEN.en[sel.w] + '. When do you have a free slot?';
  }
  function compose(instant) {
    var text = msg(), url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);
    $('[data-send]').href = url;
    $$('[data-wa]').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(he() ? 'היי מאי, הגעתי דרך האתר. אשמח לקבוע עיסוי.' : 'Hi May, I found you through the website. I’d like to book a massage.'); });
    clearInterval(typer);
    if (instant || still()) { bubble.textContent = text; return; }
    var i = 0; bubble.textContent = '';
    typer = setInterval(function () { i += 2; bubble.textContent = text.slice(0, i); if (i >= text.length) clearInterval(typer); }, 22);
  }
  function radio(group, attr, key) {
    $$(group).forEach(function (b) { b.addEventListener('click', function () {
      $$(group).forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); });
      sel[key] = +b.dataset[attr]; compose();
    }); });
  }
  radio('.petal', 'area', 'a'); radio('.seg', 'when', 'w');
  var wrote = false;
  watch($('[data-write]'), function (v) { if (v && !wrote) { wrote = true; compose(); } }, { rootMargin: '0px 0px -30% 0px' });

  // ---------------------------------------------------------------- scroll-linked scenes (all reversible)
  var touchFrame = $('[data-align]'), relax = $('[data-relax]'), quote = $('[data-quote]'), dock = $('[data-dock]');
  var words = [];
  function tick() {
    var y = scrollY, vh = innerHeight, st = still();
    nav.classList.toggle('gathered', y > 40);

    // hero: the blue field rises as you leave, the headline letters change colour as it passes them
    var hh = hero.clientHeight, p = clamp(y / (hh * .85), 0, 1);
    var breathe = st ? 0 : Math.sin(performance.now() / 1600) * 4;
    var sea = st ? seam0 * hh : lerp(seam0 * hh, -30, smooth(p)) + breathe * (1 - p);
    hero.style.setProperty('--sea-px', sea.toFixed(1) + 'px');

    // the touch: the two tilted frames straighten as the photo comes into view
    var r = touchFrame.getBoundingClientRect(), a = st ? 0 : clamp((r.top + r.height * .5 - vh * .45) / (vh * .6), 0, 1);
    touchFrame.style.setProperty('--al', a.toFixed(3));

    // relax time: the photo opens out of the tilted frame to the full screen
    if (!st) {
      var rr = relax.getBoundingClientRect(), q = clamp(-rr.top / (rr.height - vh), 0, 1), o = smooth(q / .7);
      relax.style.setProperty('--ii', lerp(phone() ? 22 : 16, 0, o).toFixed(2) + '%');
      relax.style.setProperty('--ij', lerp(phone() ? 10 : 24, 0, o).toFixed(2) + '%');
      relax.style.setProperty('--rr', lerp(-4, 0, o).toFixed(2) + 'deg');
      relax.style.setProperty('--rs', lerp(1.18, 1, o).toFixed(3));
      relax.style.setProperty('--rfo', (1 - o).toFixed(3));
      relax.style.setProperty('--rd', (smooth((q - .55) / .3) * .5).toFixed(3));
      relax.style.setProperty('--rc', smooth((q - .6) / .25).toFixed(3));
    }

    // quote: words fill in as the band crosses the screen
    var qb = quote.getBoundingClientRect(), qp = st ? 1 : clamp((vh * .85 - qb.top) / (qb.height * .9), 0, 1);
    words = $$('.qs:not([style*="none"]) .qr > span', quote).filter(function (s) { return s.offsetParent; });
    words.forEach(function (w, i) { w.style.setProperty('--o', (qp * (words.length + 2) > i + 1 ? 1 : .2)); });

    // room board: tiles land one by one, warm spotlight under the hand (drifting by itself on phones)
    var bb = board.getBoundingClientRect(), bp = st ? 1 : clamp((vh - bb.top) / (vh * .75), 0, 1);
    var t = performance.now(), auto = !fine && !st ? { x: bb.left + bb.width * (.5 + .45 * Math.sin(t / 2200)), y: bb.top + bb.height * (.5 + .4 * Math.cos(t / 1700)) } : null;
    boardTiles.forEach(function (tl) {
      var k = smooth(bp * 2.2 - tl.dataset.o * .12);
      tl.style.transform = k >= 1 ? '' : 'translateY(' + ((1 - k) * 40).toFixed(1) + 'px) rotate(' + ((1 - k) * (tl.dataset.o % 2 ? 3 : -3)).toFixed(2) + 'deg)';
      tl.style.opacity = k >= 1 ? '' : (.0 + k).toFixed(3);
      if (tl.classList.contains('pic')) {
        var tr = tl.getBoundingClientRect(), sx = (auto ? auto.x : spot.on ? spot.x : -999) - tr.left, sy = (auto ? auto.y : spot.on ? spot.y : -999) - tr.top;
        tl.style.setProperty('--sx', sx.toFixed(0) + 'px'); tl.style.setProperty('--sy', sy.toFixed(0) + 'px');
      }
    });

    // footer: the horizon rises, the logo straightens
    var fr = foot.getBoundingClientRect(), fp = st ? 1 : clamp((vh - fr.top) / (vh * .8), 0, 1);
    foot.style.setProperty('--gl', lerp(160, 0, smooth(fp)).toFixed(1) + 'px');
    foot.style.setProperty('--fr', lerp(-5, 0, smooth(fp)).toFixed(2) + 'deg');
    foot.style.setProperty('--fy', lerp(30, 0, smooth(fp)).toFixed(1) + 'px');

    // dock: hidden over the hero buttons and at the footer
    if (dock) dock.classList.toggle('away', y < hh * .55 || fr.top < vh * .6);
  }
  var loopOn = false;
  function loop() { tick(); if (!still()) requestAnimationFrame(loop); else loopOn = false; }
  function startLoop() { if (!loopOn && !still()) { loopOn = true; requestAnimationFrame(loop); } }
  addEventListener('scroll', function () { if (still()) tick(); else startLoop(); }, { passive: true });
  board.addEventListener('pointermove', function () { if (still()) tick(); });

  // ---------------------------------------------------------------- layout
  var lastW = 0, lastPh = null;
  function layout() {
    if (lastPh !== phone()) { lastPh = phone(); buildBoard(); }
    measureSeam(); dust.size(); figure.size(); tick(); startLoop();
  }
  addEventListener('resize', function () { if (innerWidth === lastW && phone()) { measureSeam(); tick(); return; } lastW = innerWidth; layout(); });
  // switch toggles re-start the loop
  switches.forEach(function (b) { b.addEventListener('click', startLoop); });

  texts(root.lang); hours(); compose(true);
  lastW = innerWidth; layout(); dust.kick(); figure.kick(); ring.kick();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measureSeam(); tick(); });
})();
