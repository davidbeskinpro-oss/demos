(function () {
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var ease = function (t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 760; };
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var WA = '972525683497';

  // ---------------------------------------------------------------- language
  function texts(l) {
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-aria-he]').forEach(function (a) { a.setAttribute('aria-label', a.dataset[l === 'he' ? 'ariaHe' : 'ariaEn']); });
    $('.concept').dataset.concept = l === 'he' ? 'קונספט לדוגמה שנבנה עבור Rt cosmetology מכון יופי · זה אינו האתר הרשמי של העסק' : 'A sample concept built for Rt cosmetology beauty institute · This is not the business’s official website';
    $('.h-rate').setAttribute('aria-label', l === 'he' ? '5.0 מתוך 5 בגוגל, 38 ביקורות' : '5.0 out of 5 on Google, 38 reviews');
    $('.links').setAttribute('aria-label', l === 'he' ? 'ראשי' : 'Main');
    $('.peel').setAttribute('aria-label', l === 'he' ? 'טיפולי פנים ולייזר' : 'Facials and laser');
    $('.vt-map iframe').title = l === 'he' ? 'מפה: פבזנר 2, חיפה' : 'Map: 2 Pevzner St, Haifa';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('rt231-lang', l); } catch (e) {}
    texts(l); split(); hours(); composer.render(true); decode.reset(); deckSize(); onScroll();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]'), hooks = [];
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('rt231-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI(); hooks.forEach(function (f) { f(); }); onScroll();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed; [0,24] = all day
  var H = { 0: [9, 18], 1: [9, 18], 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · כל היום' : 'Open now · all day'; }
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
      var val = !t ? (l ? 'סגור' : 'Closed') : t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- headline: letter by letter, out of a blur
  function split() {
    $$('[data-split] .ln > span[lang]').forEach(function (sp) {
      if (!sp.dataset.raw) sp.dataset.raw = sp.textContent;
      var i = 0;
      sp.innerHTML = sp.dataset.raw.split(' ').map(function (w) {
        return '<span class="w"' + (/[A-Za-z]/.test(w) ? ' dir="ltr"' : '') + '>' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
      sp.setAttribute('aria-label', sp.dataset.raw);
    });
  }

  // ---------------------------------------------------------------- odometers: digits roll up into place
  function odo(el) {
    var v = el.dataset.odo; if (el.dataset.done) return; el.dataset.done = 1;
    el.innerHTML = v.split('').map(function (c) {
      if (!/\d/.test(c)) return '<span aria-hidden="true">' + c + '</span>';
      var col = []; for (var k = 0; k <= 10; k++) col.push((+c + k) % 10);
      return '<span class="dg" aria-hidden="true"><span style="transform:translateY(-90.909%)" data-col="' + col.join('&#10;') + '"></span></span>';
    }).join('');
    el.setAttribute('aria-label', v);
    requestAnimationFrame(function () { requestAnimationFrame(function () { $$('.dg > span', el).forEach(function (s) { s.style.transform = 'translateY(0)'; }); }); });
  }
  // the column shows c+10 at the top: start there and roll down to c (reads as counting up through the digits)
  $$('[data-odo]').forEach(function (el) { watch(el, function (v) { if (v && !still()) odo(el); }); });

  // ---------------------------------------------------------------- nav gathers into a pill
  var nav = $('[data-nav]');

  // ---------------------------------------------------------------- opening
  var intro = $('[data-intro]');
  (function () {
    var seen = false; try { seen = sessionStorage.getItem('rt231-intro'); } catch (e) {}
    if (still() || seen || location.hash) return;
    try { sessionStorage.setItem('rt231-intro', 1); } catch (e) {}
    intro.classList.add('run');
    var cv = $('[data-intro-cv]'), c = cv.getContext('2d'), img = new Image(), P = [], t0 = 0, done = false, dpr = Math.min(2, devicePixelRatio || 1);
    var W = innerWidth, Hh = innerHeight; cv.width = W * dpr; cv.height = Hh * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
    var lw = Math.min(W * .5, 260), lh = lw * 343 / 403, lx = (W - lw) / 2, ly = Hh * .26 - lh / 2;
    function end() { if (done) return; done = true; intro.classList.add('out'); setTimeout(function () { intro.classList.remove('run'); intro.remove(); }, 460); }
    intro.addEventListener('click', end);
    setTimeout(end, 1500);
    img.onload = function () {
      var o = document.createElement('canvas'), ox = o.getContext('2d'), sw = 90, sh = Math.round(90 * 343 / 403);
      o.width = sw; o.height = sh; ox.drawImage(img, 0, 0, sw, sh);
      var d = ox.getImageData(0, 0, sw, sh).data;
      for (var y = 0; y < sh; y += 2) for (var x = 0; x < sw; x += 2) {
        var k = (y * sw + x) * 4; if (d[k + 3] < 160) continue;
        P.push({ tx: lx + x / sw * lw, ty: ly + y / sh * lh, x: Math.random() * W, y: Hh + Math.random() * Hh * .4, col: 'rgb(' + d[k] + ',' + d[k + 1] + ',' + d[k + 2] + ')', dl: Math.random() * .25 });
      }
      t0 = performance.now(); requestAnimationFrame(frame);
      setTimeout(function () { intro.classList.add('deal-on'); }, 650);
    };
    img.src = 'img/logo.webp';
    function frame(n) {
      if (done) return;
      var t = (n - t0) / 1000; c.clearRect(0, 0, W, Hh);
      P.forEach(function (p) { var e = ease((t - p.dl) / .7); c.fillStyle = p.col; c.fillRect(lerp(p.x, p.tx, e), lerp(p.y, p.ty, e), 2.2, 2.2); });
      if (t > .7) { c.globalAlpha = clamp((t - .7) / .2, 0, 1); c.drawImage(img, lx, ly, lw, lh); c.globalAlpha = 1; }
      requestAnimationFrame(frame);
    }
  })();

  // ---------------------------------------------------------------- hero: bulbs round the arched mirror
  var mirror = $('[data-mirror]'), bulbsEl = $('[data-bulbs]'), bulbs = [];
  function placeBulbs() {
    var w = mirror.clientWidth, h = mirror.clientHeight, r = w / 2, inset = 8, R = r - inset, gap = phone() ? 30 : 36, pts = [];
    var side = h - r - 22, arc = Math.PI * R, n;
    for (n = Math.floor(side / gap); n >= 0; n--) pts.push([inset, r + n * gap]);
    var na = Math.round(arc / gap); for (n = 1; n < na; n++) { var a = Math.PI - n / na * Math.PI; pts.push([r + Math.cos(a) * R, r - Math.sin(a) * R]); }
    for (n = 0; n <= Math.floor(side / gap); n++) pts.push([w - inset, r + n * gap]);
    bulbsEl.innerHTML = pts.map(function (p) { return '<span class="bulb" style="left:' + p[0].toFixed(1) + 'px;top:' + p[1].toFixed(1) + 'px"></span>'; }).join('');
    bulbs = $$('.bulb', bulbsEl).map(function (b, i) { return { el: b, x: pts[i][0], y: pts[i][1] }; });
    if (still()) bulbs.forEach(function (b) { b.el.classList.add('on'); });
    else bulbs.forEach(function (b, i) { setTimeout(function () { b.el.classList.add('on'); }, 500 + i * 45); });
  }
  // one bulb dims and comes back now and then; the ones near the hand burn brighter
  setInterval(function () {
    if (still() || !bulbs.length || !heroVis) return;
    var b = bulbs[Math.floor(Math.random() * bulbs.length)].el;
    if (b.animate) b.animate([{ opacity: 1 }, { opacity: .3 }, { opacity: 1 }], { duration: 700, easing: 'ease-in-out' });
  }, 520);
  var hero = $('[data-hero]'), heroVis = true, sheen = $('.sheen'), mphoto = $('.mirror-photo');
  hero.addEventListener('pointermove', function (e) {
    if (still()) return;
    var r = mirror.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    sheen.style.setProperty('--sx', (x * 100 - 30) + '%'); sheen.style.setProperty('--sy', (y * 100 - 30) + '%');
    mphoto.style.transform = 'scale(1.1) translate(' + ((.5 - x) * 3).toFixed(2) + '%,' + ((.5 - y) * 3).toFixed(2) + '%)';
    bulbs.forEach(function (b) { var dx = r.left + b.x - e.clientX, dy = r.top + b.y - e.clientY, d = Math.sqrt(dx * dx + dy * dy); b.el.style.boxShadow = d < 160 ? '0 0 ' + (22 - d / 10).toFixed(0) + 'px ' + (8 - d / 25).toFixed(0) + 'px rgba(255,226,190,.75)' : ''; });
  });
  hero.addEventListener('pointerleave', function () { mphoto.style.transform = ''; bulbs.forEach(function (b) { b.el.style.boxShadow = ''; }); });

  // ---------------------------------------------------------------- glitter from the logo's own colours, drifting; it parts around the hand
  var glitter = (function () {
    var cv = $('[data-glitter]'), c = cv.getContext('2d'), P = [], w, h, mx = -999, my = -999, raf = 0, cols = ['#bcc463', '#dcc58a', '#f3ead0', '#9fae48', '#eaa3ad'];
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 46 : 90; P = []; for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, s: .8 + Math.random() * 2.2, v: .15 + Math.random() * .35, ph: Math.random() * 6.28, col: cols[i % cols.length], ox: 0, oy: 0 }); }
    function frame(t) {
      raf = 0; c.clearRect(0, 0, w, h); if (still() || !heroVis) return;
      P.forEach(function (p) {
        p.y -= p.v; p.x += Math.sin(t / 1600 + p.ph) * .2; if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { var f = (1 - d2 / 14000) * 3; p.ox += dx / Math.sqrt(d2 + 1) * f; p.oy += dy / Math.sqrt(d2 + 1) * f; }
        p.ox *= .93; p.oy *= .93;
        var tw = .5 + .5 * Math.sin(t / 300 + p.ph * 3), s = p.s * (.6 + tw * .6);
        c.globalAlpha = .35 + tw * .65; c.fillStyle = p.col;
        c.beginPath(); c.moveTo(p.x + p.ox, p.y + p.oy - s * 1.6); c.lineTo(p.x + p.ox + s * .5, p.y + p.oy); c.lineTo(p.x + p.ox, p.y + p.oy + s * 1.6); c.lineTo(p.x + p.ox - s * .5, p.y + p.oy); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(p.x + p.ox - s * 1.6, p.y + p.oy); c.lineTo(p.x + p.ox, p.y + p.oy - s * .5); c.lineTo(p.x + p.ox + s * 1.6, p.y + p.oy); c.lineTo(p.x + p.ox, p.y + p.oy + s * .5); c.closePath(); c.fill();
      });
      c.globalAlpha = 1; raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; setTimeout(function () { mx = my = -999; }, 500); });
    watch(hero, function (v) { heroVis = v; kick(); });
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- the peel: the mask lifts from the top corner and folds back over itself
  var peel = $('[data-peel]'), sheet = $('[data-sheet]'), flap = $('[data-flap]'), pulse = $('[data-pulse]'), lastPulse = -1;
  function clipHalf(poly, ok) {           // keep the part of a polygon where ok(point) >= 0 (Sutherland–Hodgman, one edge)
    var out = [];
    for (var i = 0; i < poly.length; i++) {
      var a = poly[i], b = poly[(i + 1) % poly.length], fa = ok(a), fb = ok(b);
      if (fa >= 0) out.push(a);
      if ((fa >= 0) !== (fb >= 0)) { var t = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    return out;
  }
  var poly = function (pts) { return pts.length < 3 ? 'polygon(0 0,0 0,0 0)' : 'polygon(' + pts.map(function (p) { return p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px'; }).join(',') + ')'; };
  function peelFrame() {
    if (still()) { sheet.style.clipPath = ''; flap.style.clipPath = ''; $('.sheet-copy').style.opacity = ''; peel.style.removeProperty('--uo'); return; }
    var r = peel.getBoundingClientRect(), vh = innerHeight, span = r.height - vh;
    if (r.bottom < 0 || r.top > vh) return;
    var p = clamp(-r.top / (span * .72), 0, 1), W = innerWidth, Hh = vh;
    var cx = he() ? 0 : W, C = [cx, 0], len = Math.sqrt(W * W + Hh * Hh), u = [(he() ? W : -W) / len, Hh / len];
    var s = smooth(p) * len * 1.02;
    var t = function (X) { return (X[0] - C[0]) * u[0] + (X[1] - C[1]) * u[1]; };
    var rect = [[0, 0], [W, 0], [W, Hh], [0, Hh]];
    var keep = clipHalf(rect, function (X) { return t(X) - s; });
    var lift = clipHalf(rect, function (X) { return s - t(X); });
    var refl = lift.map(function (X) { var k = 2 * (s - t(X)); return [X[0] + k * u[0], X[1] + k * u[1]]; });
    sheet.style.clipPath = poly(keep);
    flap.style.clipPath = poly(refl);
    // shading on the backing: darkest at the fold, lighter where it curls
    var ang = Math.atan2(u[0], -u[1]) * 180 / Math.PI, L = Math.abs(W * Math.sin(ang * Math.PI / 180)) + Math.abs(Hh * Math.cos(ang * Math.PI / 180));
    var fold = s - ((W / 2 - C[0]) * u[0] + (Hh / 2 - C[1]) * u[1]) + L / 2;
    flap.style.background = 'linear-gradient(' + // taste-skill-ignore: shading along the mask's fold
      '' + ang.toFixed(1) + 'deg, transparent ' + (fold - 2).toFixed(0) + 'px, #c99a91 ' + fold.toFixed(0) + 'px, #f6e8e1 ' + (fold + s * .45).toFixed(0) + 'px, #e8cfc6 ' + (fold + s).toFixed(0) + 'px)';
    $('.sheet-copy').style.opacity = clamp(1 - p * 4, 0, 1);
    peel.style.setProperty('--uo', smooth((p - .5) / .35).toFixed(3));
    // the laser fires as the room is uncovered: a flash at the handpiece tip, one per step of the scroll
    var step = Math.floor(p * 9);
    if (step !== lastPulse && p > .35 && pulse.animate) { pulse.animate([{ opacity: 0, transform: 'scale(.3)' }, { opacity: 1, transform: 'scale(1)', offset: .15 }, { opacity: 0, transform: 'scale(1.6)' }], { duration: 650, easing: 'ease-out' }); }
    lastPulse = step;
    if (p > .7) decode.run();
  }
  function tipPos() { // the handpiece tip in the photo sits at 39% / 70% of the image; follow object-fit: cover
    var img = $('.under-photo'), W = img.clientWidth, Hh = img.clientHeight, iw = 1000, ih = 1501, sc = Math.max(W / iw, Hh / ih), ox = (W - iw * sc) * .6, oy = (Hh - ih * sc) * .3;
    pulse.style.setProperty('--px', (ox + iw * sc * .39) + 'px'); pulse.style.setProperty('--py', (oy + ih * sc * .70) + 'px');
  }

  // ---------------------------------------------------------------- labels that decode out of scrambled glyphs
  var decode = (function () {
    var el = $('.decode'), ran = false, G = 'אבגדהוזחטיכלמנסעפצקרשתABCDEFGHKLMNPRSTVXZ·';
    function txt() { return el.dataset[he() ? 'decodeHe' : 'decodeEn']; }
    function run() {
      if (ran) return; ran = true; var target = txt(), t0 = performance.now();
      if (still()) { el.textContent = target; return; }
      (function f(n) { var k = (n - t0) / 900; el.textContent = target.split('').map(function (ch, i) { return ch === ' ' || i / target.length < k ? ch : G[Math.floor(Math.random() * G.length)]; }).join(''); if (k < 1) requestAnimationFrame(f); else el.textContent = target; })(t0);
    }
    return { run: run, reset: function () { el.textContent = ran || still() ? txt() : ''; } };
  })();
  watch($('.under'), function (v) { if (v && still()) decode.run(); });

  // ---------------------------------------------------------------- the shelf: boxes land one by one and lean toward the hand
  var shelf = $('[data-shelf]'), boxesEl = $('[data-boxes]'), boxes = $$('.box', boxesEl);
  boxes.forEach(function (b, i) { b.style.setProperty('--d', i * 90 + 'ms'); });
  watch(boxesEl, function (v) { if (v) { boxesEl.classList.add('in'); setTimeout(function () { boxesEl.classList.add('ready'); }, 1400); } }, { threshold: .2 });
  shelf.addEventListener('pointermove', function (e) {
    var r = shelf.getBoundingClientRect();
    shelf.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); shelf.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    if (still() || !finePointer) return;
    boxes.forEach(function (b) { var q = b.getBoundingClientRect(), dx = (e.clientX - q.left - q.width / 2) / innerWidth, dy = (e.clientY - q.top - q.height / 2) / innerHeight; b.style.setProperty('--ry', clamp(dx * 40, -14, 14).toFixed(1) + 'deg'); b.style.setProperty('--rx', clamp(-dy * 30, -10, 10).toFixed(1) + 'deg'); });
  });
  shelf.addEventListener('pointerleave', function () { boxes.forEach(function (b) { b.style.setProperty('--ry', '0deg'); b.style.setProperty('--rx', '0deg'); }); });
  boxes.forEach(function (b) { b.addEventListener('click', function () { composer.toggle(b.dataset.t); }); });

  // ---------------------------------------------------------------- the place: their photos ride round the ring light
  var ring = (function () {
    var wrap = $('[data-ring-wrap]'), el = $('[data-ring]');
    $$('.rc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $$('img', k).forEach(function (i) { i.alt = ''; }); el.appendChild(k); });
    var cards = $$('.rc', el), N = cards.length, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = false, last = 0;
    function R() { var cw = cards[0].offsetWidth || 200; return Math.max(cw * 1.08 / (2 * Math.tan(Math.PI / N)), phone() ? 300 : innerWidth * .5); }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.opacity = ''; c.style.filter = ''; }); return; }
      var dt = last ? Math.min(50, t - last) : 16; last = t;
      if (!drag) { rot += (.006 * dt) + vel * .05; vel *= .94; }
      var rr = R(), sc = scrollY * .04, cw = cards[0].offsetWidth, ch = cards[0].offsetHeight;
      cards.forEach(function (c, i) {
        var a = ((i / N) * 360 + rot + sc) * Math.PI / 180, x = Math.sin(a) * rr, z = Math.cos(a) * rr - rr, f = (Math.cos(a) + 1) / 2;
        c.style.transform = 'translate3d(' + (x - cw / 2).toFixed(1) + 'px,' + (-ch / 2 + (1 - f) * -30).toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotateY(' + (a * 180 / Math.PI).toFixed(1) + 'deg)';
        c.style.opacity = (f < .12 ? 0 : .35 + f * .65).toFixed(2); c.style.filter = 'brightness(' + (.55 + f * .45).toFixed(2) + ')';
        c.style.zIndex = Math.round(f * 100);
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .2; vel = dx * .8; });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch($('[data-place]'), function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();
  var ringlight = $('.ringlight');

  // ---------------------------------------------------------------- reviews: set down one over the other with the scroll
  var rvSec = $('[data-reviews]'), deck = $('[data-deck]'), rvs = $$('.rv', deck), rots = [-1.6, 1.2, -.8, 1.8, -1.2];
  function deckSize() {
    rvSec.classList.remove('flat'); rvs.forEach(function (c) { c.style.minHeight = ''; });
    if (still()) { rvs.forEach(function (c) { c.style.transform = ''; c.style.opacity = ''; c.style.zIndex = ''; $('blockquote', c).style.opacity = ''; $('figcaption', c).style.opacity = ''; }); return; }
    var mh = 0; rvs.forEach(function (c) { mh = Math.max(mh, c.offsetHeight); });
    deck.style.setProperty('--dh', (mh + 24) + 'px');
    var need = $('.rv-score').offsetHeight + mh + (innerWidth < 900 ? 170 : 120);
    if (need > innerHeight) { rvSec.classList.add('flat'); rvs.forEach(function (c) { c.style.minHeight = ''; c.style.transform = ''; c.style.opacity = ''; $('blockquote', c).style.opacity = ''; $('figcaption', c).style.opacity = ''; }); }
  }
  function deckFrame() {
    if (still() || rvSec.classList.contains('flat')) return;
    var r = rvSec.getBoundingClientRect(), span = r.height - innerHeight; if (r.bottom < 0 || r.top > innerHeight) return;
    var q = clamp(-r.top / span, 0, 1), N = rvs.length, k = q * (N - .4), P = rvs.map(function (c, i) { return i === 0 ? 1 : clamp(k - i + 1, 0, 1); });
    rvs.forEach(function (c, i) {
      var e = ease(P[i]), cover = 0; for (var j = i + 1; j < N; j++) cover += ease(P[j]);
      c.style.transform = 'translateY(' + ((1 - e) * 110 - cover * 14).toFixed(1) + '%) rotate(' + (rots[i] * (1 - e * .5)).toFixed(2) + 'deg) scale(' + (1 - cover * .035).toFixed(3) + ')';
      c.style.opacity = (P[i] > 0 ? Math.min(1, e * 1.4) : 0).toFixed(2);
      c.style.zIndex = i;
      var co = clamp(1 - cover * 2, 0, 1).toFixed(2); $('blockquote', c).style.opacity = co; $('figcaption', c).style.opacity = co;
    });
  }

  // ---------------------------------------------------------------- the client card (the live thing)
  var T = {
    laser: ['הסרת שיער בלייזר', 'laser hair removal', 'Laser hair removal'],
    facial: ['טיפול פנים עמוק', 'a deep facial', 'Deep facial'],
    meso: ['מזותרפיה', 'mesotherapy', 'Mesotherapy'],
    brows: ['עיצוב גבות', 'brow shaping', 'Brow shaping'],
    nails: ['מניקור ופדיקור', 'a manicure and pedicure', 'Manicure & pedicure'],
    makeup: ['איפור', 'make-up', 'Make-up']
  };
  var DAYS = [['א׳', 'ראשון', 'Sun', 'Sunday'], ['ב׳', 'שני', 'Mon', 'Monday'], ['ג׳', 'שלישי', 'Tue', 'Tuesday'], ['ד׳', 'רביעי', 'Wed', 'Wednesday'], ['ה׳', 'חמישי', 'Thu', 'Thursday'], ['ו׳', 'שישי', 'Fri', 'Friday']];
  var TIMES = [['בוקר', 'בבוקר', 'Morning', 'morning'], ['צהריים', 'בצהריים', 'Midday', 'around midday'], ['אחר הצהריים', 'אחר הצהריים', 'Afternoon', 'afternoon']];
  var composer = (function () {
    var form = $('[data-form]'), ticks = $('[data-ticks]'), days = $('[data-days]'), times = $('[data-times]'), name = $('[data-name]'), bubble = $('[data-bubble]'), send = $('[data-send]'), steps = $$('[data-steps] li');
    var sel = {}, day = null, time = null, shown = '', typing = 0;
    function opt(type, nameAttr, val, label, checked) { return '<label class="opt"><input type="' + type + '" name="' + nameAttr + '" value="' + val + '"' + (checked ? ' checked' : '') + '><span class="mk" aria-hidden="true"></span><span>' + label + '</span></label>'; }
    function build() {
      var l = he();
      ticks.innerHTML = Object.keys(T).map(function (k) { return opt('checkbox', 't', k, l ? T[k][0] : T[k][2], sel[k]); }).join('');
      days.innerHTML = DAYS.map(function (d, i) { return opt('radio', 'd', i, '<span aria-hidden="true">' + (l ? d[0] : d[2]) + '</span><span class="vh">' + (l ? d[1] : d[3]) + '</span>', day === i); }).join('');
      times.innerHTML = TIMES.map(function (t, i) { return opt('radio', 'tm', i, l ? t[0] : t[2], time === i); }).join('');
      friday();
    }
    function friday() { // Friday closes at 14:00: no afternoon
      var inp = $('input[name=tm][value="2"]', times); if (!inp) return;
      inp.disabled = day === 5; inp.parentNode.style.opacity = day === 5 ? .4 : '';
      if (day === 5 && time === 2) { time = null; inp.checked = false; }
    }
    function join(a, l) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + (l ? ' ו' : ' and ') + a[a.length - 1]; }
    function msg() {
      var l = he(), ks = Object.keys(T).filter(function (k) { return sel[k]; }), lines = [];
      if (l) {
        lines.push('היי, הגעתי דרך האתר.');
        lines.push(ks.length ? 'אשמח לקבוע תור ל' + join(ks.map(function (k) { return T[k][0]; }), true) + '.' : 'אשמח לקבוע תור.');
        if (day !== null || time !== null) lines.push('הכי נוח לי' + (day !== null ? ' ביום ' + DAYS[day][1] : '') + (time !== null ? ' ' + TIMES[time][1] : '') + '.');
        lines.push(name.value.trim() ? 'תודה, ' + name.value.trim() : 'תודה');
      } else {
        lines.push('Hi, I found you through your website.');
        lines.push(ks.length ? 'I’d like to book ' + join(ks.map(function (k) { return T[k][1]; }), false) + '.' : 'I’d like to book an appointment.');
        if (day !== null || time !== null) lines.push((day !== null ? DAYS[day][3] + (time !== null ? ' ' + TIMES[time][3] : '') : (TIMES[time][2])) + ' would suit me best.');
        lines.push(name.value.trim() ? 'Thanks, ' + name.value.trim() : 'Thanks');
      }
      return lines.join('\n');
    }
    function render(instant) {
      var m = msg(), l = he();
      send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
      var ks = Object.keys(sel).some(function (k) { return sel[k]; });
      steps[0].classList.toggle('on', ks); steps[1].classList.toggle('on', day !== null || time !== null); steps[2].classList.toggle('on', ks && (day !== null || time !== null));
      boxes.forEach(function (b) { b.setAttribute('aria-pressed', sel[b.dataset.t] ? 'true' : 'false'); });
      cancelAnimationFrame(typing);
      if (instant || still()) { bubble.textContent = m; shown = m; return; }
      var i = 0; while (i < shown.length && i < m.length && shown[i] === m[i]) i++;
      var cut = i, t0 = 0;
      (function f(n) {
        if (!t0) t0 = n; var add = Math.floor((n - t0) / 16);
        var cur = m.slice(0, Math.min(m.length, cut + add));
        bubble.innerHTML = ''; bubble.appendChild(document.createTextNode(cur)); var c = document.createElement('span'); c.className = 'cur'; bubble.appendChild(c);
        shown = cur;
        if (cur.length < m.length) typing = requestAnimationFrame(f); else { bubble.textContent = m; shown = m; }
      })(performance.now());
    }
    form.addEventListener('change', function (e) {
      var t = e.target;
      if (t.name === 't') sel[t.value] = t.checked;
      if (t.name === 'd') { day = +t.value; friday(); }
      if (t.name === 'tm') time = +t.value;
      render();
    });
    name.addEventListener('input', function () { render(); });
    build(); render(true);
    return {
      render: function (rebuild) { if (rebuild) build(); render(true); },
      toggle: function (k) { sel[k] = !sel[k]; var inp = $('input[name=t][value="' + k + '"]', ticks); if (inp) inp.checked = !!sel[k]; render(); }
    };
  })();

  // ---------------------------------------------------------------- visit: the shopfront fills the screen, then settles back into its arch
  var visit = $('[data-visit]'), vframe = $('[data-vframe]'), vtiles = $$('.vt', visit);
  function visitFrame() {
    if (still()) { vframe.style.transform = ''; vframe.style.borderRadius = ''; vtiles.forEach(function (t) { t.style.opacity = ''; t.style.transform = ''; }); return; }
    var r = visit.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    var q = clamp((innerHeight * .9 - r.top) / (innerHeight * .8), 0, 1), e = ease(q / .8), w = vframe.offsetWidth, left = vframe.offsetLeft;
    var s0 = innerWidth / w, dx = innerWidth / 2 - (left + w / 2) - (vframe.offsetParent ? vframe.offsetParent.getBoundingClientRect().left : 0) * 0;
    var s = lerp(s0, 1, e), x = lerp(dx, 0, e), rad = lerp(0, 1, e);
    vframe.style.transform = 'translateX(' + x.toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
    vframe.style.borderRadius = (rad * 999).toFixed(0) + 'px ' + (rad * 999).toFixed(0) + 'px ' + (rad * 22).toFixed(0) + 'px ' + (rad * 22).toFixed(0) + 'px';
    vtiles.forEach(function (t, i) { var k = smooth((q - .6 - i * .06) / .25); t.style.opacity = k.toFixed(2); t.style.transform = 'translateY(' + ((1 - k) * 40).toFixed(1) + 'px)'; });
  }

  // ---------------------------------------------------------------- lipstick: out of the way while the visit card shows the same buttons
  var lip = $('[data-lipstick]');
  var lipHide = {};
  [$('.vt-act'), $('.foot')].forEach(function (el, i) { watch(el, function (v) { lipHide[i] = v; lip.classList.toggle('hide', !!(lipHide[0] || lipHide[1])); }); });

  // ---------------------------------------------------------------- entrances
  $$('.big, .lead, .pq, .faq .qa details, .h-act').forEach(function (el, i) { el.setAttribute('data-reveal', ''); });
  $$('.qa details').forEach(function (d, i) { d.style.setProperty('--d', i * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  // peel copy is driven by the peel itself
  $$('.peel [data-reveal]').forEach(function (el) { el.classList.add('in'); });

  // ---------------------------------------------------------------- scroll loop
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      nav.classList.toggle('pill', scrollY > 40);
      peelFrame(); deckFrame(); visitFrame();
      if (ringlight) { var r = ringlight.parentNode.getBoundingClientRect(); ringlight.style.setProperty('--rs', (.8 + clamp(1 - r.top / innerHeight, 0, 1.4) * .15).toFixed(3)); }
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  var rt = 0;
  function layout() { placeBulbs(); glitter.size(); tipPos(); deckSize(); onScroll(); }
  addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 150); });
  hooks.push(function () { layout(); ring.kick(); glitter.kick(); decode.reset(); composer.render(false); boxesEl.classList.add('in', 'ready'); $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); }); $$('[data-odo]').forEach(function (el) { if (!still()) odo(el); }); });

  texts(root.lang); split(); hours();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  addEventListener('load', layout);
  layout(); decode.reset();
})();
