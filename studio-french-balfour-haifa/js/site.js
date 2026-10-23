(function () {
  var root = document.documentElement, WA = '972522885275', MAIL = 'haifa.studiofrench@gmail.com';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'Studio French · סלון ציפורניים · בלפור 2, חיפה', en: 'Studio French · Nail studio · 2 Balfour St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Studio French · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Studio French · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- nail shapes (tip up). unit box: x 0..1, y 0..1.4
  var TOPS = {
    almond: [[0, .62], [0, .3, .3, .02, .5, 0], [.7, .02, 1, .3, 1, .62]],
    oval: [[0, .55], [0, .22, .24, 0, .5, 0], [.76, 0, 1, .22, 1, .55]],
    square: [[0, .14], [0, .04, .04, 0, .14, 0], null, [.96, 0, 1, .04, 1, .14]],
    stiletto: [[0, .8], [0, .46, .36, .17, .5, 0], [.64, .17, 1, .46, 1, .8]]
  };
  function nailPath(shape, x, y, w, closed, hs) {
    hs = hs || 1;
    var t = TOPS[shape], P = function (u, v) { return (x + u * w).toFixed(1) + ' ' + (y + v * w * hs).toFixed(1); };
    var d = 'M' + P(t[0][0], t[0][1]) + ' C' + P(t[1][0], t[1][1]) + ' ' + P(t[1][2], t[1][3]) + ' ' + P(t[1][4], t[1][5]);
    if (shape === 'square') d += ' L' + P(.86, 0) + ' C' + P(t[3][0], t[3][1]) + ' ' + P(t[3][2], t[3][3]) + ' ' + P(t[3][4], t[3][5]);
    else d += ' C' + P(t[2][0], t[2][1]) + ' ' + P(t[2][2], t[2][3]) + ' ' + P(t[2][4], t[2][5]);
    if (closed) d += ' L' + P(1, 1.16) + ' C' + P(1, 1.33) + ' ' + P(.8, 1.4) + ' ' + P(.5, 1.4) + ' C' + P(.2, 1.4) + ' ' + P(0, 1.33) + ' ' + P(0, 1.16) + ' Z';
    return d;
  }
  $$('[data-mini]').forEach(function (p) { p.setAttribute('d', nailPath(p.dataset.mini, 22, 8, 56, true)); });

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('iframe[data-title-he]').forEach(function (i) { i.title = i.dataset[l === 'he' ? 'titleHe' : 'titleEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לסטודיו, 052-288-5275', 'Call the studio, 052-288-5275');
    aria('[data-t-wa]', 'וואטסאפ לסטודיו', 'WhatsApp the studio');
    aria('[data-st-chips]', 'עבודות', 'Work');
    $$('[data-svc] option').forEach(function (o) { o.textContent = o.dataset[l]; if (l === 'en') o.textContent = o.textContent.replace(/^(a |an )/, '').replace(/^./, function (c) { return c.toUpperCase(); }); });
    $$('.colours input').forEach(function (inp) { inp.parentNode.querySelector('[data-cname]').textContent = COL[inp.value][l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('sf190-lang', l); } catch (e) {}
    texts(l); hours(); stepShow(stepI); capShow(capI, true); nailUpdate(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('sf190-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-odo]').forEach(function (o) { roll(o, true); });
    layout(); petals.kick(); wheel.kick(); glitter.kick(); nailUpdate(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time (null = closed)
  var H = { 0: [9, 19], 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 15], 6: null };
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

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
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

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- petals: drift down, part under the hand, burst on a tap
  var petals = (function () {
    var cv = $('[data-petals]'), c = cv.getContext('2d'), P = [], S = [], w, h, raf = 0, vis = true, mx = -999, my = -999, last = 0, grads = {};
    var COLS = ['#f2b8c2', '#e99aab', '#f7d4d6', '#fbe9e6', '#d9677e', '#f4c9c0'];
    function grad(col) {
      if (grads[col]) return grads[col];
      var g = c.createLinearGradient(-1, -1, 1, 1); g.addColorStop(0, '#fff7f5'); g.addColorStop(.45, col); g.addColorStop(1, col);
      return (grads[col] = g);
    }
    function make(x, y, burst) {
      var a = Math.random() * 6.28, sp = burst ? 1.5 + Math.random() * 3 : 0;
      return { x: x, y: y, s: (phone() ? 6 : 8) + Math.random() * (phone() ? 7 : 10), r: Math.random() * 6.28, vr: (Math.random() - .5) * .03,
        vx: Math.cos(a) * sp, vy: burst ? Math.sin(a) * sp - 1 : .3 + Math.random() * .5, ph: Math.random() * 6.28, col: COLS[Math.floor(Math.random() * COLS.length)], life: burst ? 1 : -1, z: .55 + Math.random() * .45 };
    }
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; grads = {};
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 16 : 30; P = [];
      for (var i = 0; i < n; i++) P.push(make(Math.random() * w, Math.random() * h));
      S = []; for (var k = 0; k < (phone() ? 18 : 34); k++) S.push({ x: Math.random() * w, y: h * (.35 + Math.random() * .62), ph: Math.random() * 6.28, sp: .6 + Math.random() * 1.4, s: 2 + Math.random() * 4 });
    }
    function petal(p, T) {
      c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.scale(p.s, p.s * (.45 + .55 * Math.abs(Math.cos(T * 1.6 + p.ph))));
      c.globalAlpha = (p.life > 0 ? p.life : 1) * p.z;
      c.fillStyle = grad(p.col);
      c.beginPath(); c.moveTo(0, -1); c.bezierCurveTo(.95, -.7, .8, .75, 0, 1); c.bezierCurveTo(-.8, .75, -.95, -.7, 0, -1); c.fill();
      c.globalAlpha *= .5; c.strokeStyle = '#fff'; c.lineWidth = .06; c.beginPath(); c.moveTo(0, -.7); c.quadraticCurveTo(.12, 0, 0, .7); c.stroke();
      c.restore();
    }
    function spark(s, T) {
      var a = Math.pow(Math.max(0, Math.sin(T * s.sp + s.ph)), 6); if (a < .02) return;
      c.globalAlpha = a; c.strokeStyle = s.ph > 3 ? '#fffaf6' : '#d9b77e'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(s.x - s.s, s.y); c.lineTo(s.x + s.s, s.y); c.moveTo(s.x, s.y - s.s * 1.4); c.lineTo(s.x, s.y + s.s * 1.4); c.stroke();
    }
    function frame(t) {
      raf = 0; var T = t / 1000, calm = still();
      c.clearRect(0, 0, w, h);
      for (var i = P.length - 1; i >= 0; i--) {
        var p = P[i];
        if (!calm) {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 14000) { var f = (14000 - d2) / 14000 * .9, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
          p.vx = p.vx * .96 + Math.sin(T * .9 + p.ph) * .02; p.vy = p.life > 0 ? p.vy * .97 + .03 : lerp(p.vy, .35 + p.z * .35, .02);
          p.x += p.vx; p.y += p.vy; p.r += p.vr + p.vx * .01;
          if (p.life > 0) { p.life -= .008; if (p.life <= 0) { P.splice(i, 1); continue; } }
          else if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; p.vx = 0; }
          if (p.x < -30) p.x = w + 20; else if (p.x > w + 30) p.x = -20;
        }
        petal(p, calm ? 0 : T);
      }
      if (!calm) S.forEach(function (s) { spark(s, T); });
      c.globalAlpha = 1;
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) {
      if (still() || e.target.closest('a,button')) return;
      var r = hero.getBoundingClientRect(); for (var i = 0; i < 12; i++) P.push(make(e.clientX - r.left, e.clientY - r.top, true));
      kick();
    });
    watch(hero, function (v) { vis = v; kick(); });
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- the tip wheel: turns by itself, with the scroll and with a drag
  var wheel = (function () {
    var wrap = $('[data-wheelwrap]'), el = $('[data-wheel]'), tips = $$('.tip', el), N = tips.length, step = 360 / N;
    var rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = true, last = 0;
    function place() {
      var D = el.offsetWidth, tw = tips[0].offsetWidth, R = D / 2 + tw * .32, sc = still() ? 0 : scrollY * .05, dir = rtl() ? -1 : 1;
      el.style.transform = 'rotate(' + ((rot + sc) * dir).toFixed(2) + 'deg)';
      tips.forEach(function (t, i) {
        var a = (rot + sc) * dir + i * step, f = Math.cos(a * Math.PI / 180), lift = f > .97 ? (f - .97) * 33 : 0;
        t.style.transform = 'rotate(' + (i * step).toFixed(2) + 'deg) translateY(' + (-R - lift * tw * .22).toFixed(1) + 'px) scale(' + (1 + lift * .14).toFixed(3) + ')';
      });
    }
    function frame(t) {
      raf = 0; var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!still() && !drag) { rot += (5 + vel) * dt; vel *= .94; }
      place();
      if (!still() && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .12 * (rtl() ? -1 : 1); vel = dx * 1.5 * (rtl() ? -1 : 1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { kick: kick, place: place };
  })();

  // ---------------------------------------------------------------- the French tip line between the hero and the work
  var tlFill = $('[data-tl-fill]'), tlRim = $('[data-tl-rim]');
  function tipline(hp) {
    var a = lerp(196, 120, hp), b = lerp(150, 6, hp);
    var curve = 'M-10 ' + a.toFixed(1) + ' C 230 ' + b.toFixed(1) + ' 770 ' + b.toFixed(1) + ' 1010 ' + a.toFixed(1);
    tlRim.setAttribute('d', curve);
    tlFill.setAttribute('d', curve + ' L1010 202 L-10 202 Z');
  }

  // ---------------------------------------------------------------- work: nail windows open one inside another
  var run = $('[data-run]'), stage = $('[data-stage]'), layers = $$('.layer', stage), rimP = $('[data-rim-path]'), shine = $('[data-shine]');
  var capName = $('[data-cap-name]'), capLine = $('[data-cap-line]'), capDots = $$('.w-dots i');
  var CAPS = [
    { he: ['קווים דקים על קצה לבן', 'ציפורני שקד בוורוד עדין.'], en: ['Fine lines on a white tip', 'Almond nails in soft pink.'] },
    { he: ['שיש על לבן מט', 'ציפורניים ארוכות ומרובעות.'], en: ['Marble on matte white', 'Long, square nails.'] },
    { he: ['פוקסיה במסגרת שחורה', 'קו דק מקיף כל ציפורן.'], en: ['Fuchsia, framed in black', 'A fine line around every nail.'] },
    { he: ['מתכלת ללבן', 'אומברה מט על ציפורני סטילטו.'], en: ['From sky blue to white', 'A matte ombré on stiletto nails.'] }
  ];
  var GLY = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'abcdefghijklmnopqrstuvwxyz' }, capI = -1, decodeT = 0;
  function capShow(i, instant) {
    var c = CAPS[i < 0 ? 0 : i][he() ? 'he' : 'en']; if (i < 0) i = 0;
    capDots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
    capLine.textContent = c[1];
    clearInterval(decodeT);
    if (instant || still()) { capName.textContent = c[0]; return; }
    var g = GLY[he() ? 'he' : 'en'], n = 0, txt = c[0];
    decodeT = setInterval(function () {
      n += 1; var out = '';
      for (var k = 0; k < txt.length; k++) out += txt[k] === ' ' || k < n - 4 ? txt[k] : k < n ? g[Math.floor(Math.random() * g.length)] : '';
      capName.textContent = out; if (n > txt.length + 4) { clearInterval(decodeT); capName.textContent = txt; }
    }, 28);
  }
  var px0 = .5;
  stage.addEventListener('pointermove', function (e) { if (fine) px0 = e.clientX / innerWidth; });
  function runUpdate(calm) {
    if (calm) { layers.forEach(function (l) { l.style.clipPath = ''; }); rimP.setAttribute('d', ''); return; }
    var p = prog(run), W = stage.clientWidth, Hh = stage.clientHeight, cx = W / 2, cy = Hh * .46;
    var s0 = Math.min(W * .34, Hh * .3), s1 = Math.max(W, Hh) * 2.3, growing = -1, cur = 0;
    layers.forEach(function (l, k) {
      var o = smooth((p - (.03 + k * .235)) / .17), s;
      if (k === 0) s = s0 + (s1 - s0) * Math.pow(o, 2.3); else s = s1 * Math.pow(o, 2.3);
      if (o >= 1) l.style.clipPath = 'none';
      else if (s < 1) l.style.clipPath = 'circle(0)';
      else {
        var d = nailPath(l.dataset.shape, cx - s / 2, cy - s * .7, s, true);
        l.style.clipPath = "path('" + d + "')";
        if (growing < 0 || k > growing) { growing = k; rimP.setAttribute('d', d); }
      }
      if (o > .45) cur = k;
    });
    if (growing < 0) rimP.setAttribute('d', '');
    if (cur !== capI) { capI = cur; capShow(cur); }
    var sx = fine ? (px0 - .5) * W * 1.1 : lerp(-W * .7, W * .7, (p * 3.2) % 1);
    shine.style.setProperty('--sx', sx.toFixed(0) + 'px');
  }
  // animations off: the stepper
  var stepFigs = $$('.st-fig'), stepChips = $$('[data-go]'), stepTitle = $('[data-st-title]'), stepI = 0;
  function stepShow(i) {
    stepI = (i + stepFigs.length) % stepFigs.length;
    stepFigs.forEach(function (f, k) { f.classList.toggle('is-on', k === stepI); });
    stepChips.forEach(function (b, k) { b.setAttribute('aria-pressed', k === stepI ? 'true' : 'false'); });
    var c = CAPS[stepI][he() ? 'he' : 'en']; stepTitle.textContent = c[0] + ' · ' + c[1];
  }
  stepChips.forEach(function (b) { b.addEventListener('click', function () { stepShow(+b.dataset.go); }); });
  $('[data-st-prev]').addEventListener('click', function () { stepShow(stepI - 1); });
  $('[data-st-next]').addEventListener('click', function () { stepShow(stepI + 1); });

  // ---------------------------------------------------------------- treatments: living tiles run only while seen; spotlight; voucher tilts to the hand
  var care = $('#care');
  watch(care, function (v) { care.classList.toggle('on', v); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var gift = $('.t-gift'), gcard = $('.gcard');
  if (fine) {
    gift.addEventListener('pointermove', function (e) { if (still()) return; var r = gift.getBoundingClientRect(); gcard.style.animation = 'none'; gcard.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 30).toFixed(1) + 'deg'); gcard.style.setProperty('--rx', ((.5 - (e.clientY - r.top) / r.height) * 24).toFixed(1) + 'deg'); });
    gift.addEventListener('pointerleave', function () { gcard.style.animation = ''; });
  }

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

  // ---------------------------------------------------------------- studio: camera push into the room, their corners land one by one
  var studio = $('[data-studio]'), sroom = $('[data-sroom] img'), scards = $$('.sc'), SR = [-5, 4, -2], tx = 0, ty = 0;
  if (fine) $('.s-stage').addEventListener('pointermove', function (e) { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; tick(); });
  function studioUpdate(calm) {
    if (calm) { sroom.style.transform = ''; scards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; }); return; }
    var p = prog(studio);
    sroom.style.transform = 'scale(' + lerp(1.24, 1.04, smooth(p)).toFixed(4) + ') translate3d(' + (tx * -14).toFixed(1) + 'px,' + lerp(-2.5, 2, p).toFixed(2) + '%,0)';
    var T = scards.map(function (c, i) { return smooth((p - .04 - i * .24) / .2); });
    scards.forEach(function (c, i) {
      var t = T[i], above = 0; for (var j = i + 1; j < T.length; j++) above += T[j];
      var top = above < .05;
      c.style.transform = 'translate3d(' + (above * (rtl() ? 16 : -16)).toFixed(1) + 'px,' + ((1 - t) * 125).toFixed(2) + '%,0) rotate(' + lerp(14, SR[i], t).toFixed(2) + 'deg) scale(' + (1 - Math.min(above, 2) * .05).toFixed(3) + ')' + (top && fine ? ' perspective(900px) rotateY(' + (tx * 10).toFixed(2) + 'deg) rotateX(' + (ty * -8).toFixed(2) + 'deg)' : '');
      c.style.filter = above > .05 ? 'brightness(' + (1 - Math.min(above, 2) * .18).toFixed(3) + ')' : '';
      c.style.zIndex = i + 1;
    });
  }

  // ---------------------------------------------------------------- reviews: copies so the drift loops without a seam
  $$('[data-row] .track').forEach(function (t) {
    var orig = t.innerHTML; t.innerHTML = orig + orig;
    var kids = $$('.rv', t); kids.forEach(function (k, i) { if (i >= kids.length / 2) k.setAttribute('aria-hidden', 'true'); });
    var all = t.innerHTML; t.insertAdjacentHTML('beforeend', all);
    $$('.rv', t).forEach(function (k, i) { if (i >= kids.length / 2) k.setAttribute('aria-hidden', 'true'); });
  });

  // ---------------------------------------------------------------- book: the live nail and the message that writes itself
  var COL = {
    milk: { he: 'לבן חלבי', en: 'milky white', a: '#f7efec', b: '#e4d3cd' },
    blush: { he: 'ורוד עדין', en: 'soft pink', a: '#f1cfc5', b: '#d8a698' },
    nude: { he: 'ניוד', en: 'nude', a: '#e2bba6', b: '#bf8f78' },
    fuchsia: { he: 'פוקסיה', en: 'fuchsia', a: '#e45aa2', b: '#a52c6a' },
    sky: { he: 'תכלת', en: 'sky blue', a: '#c4e2f0', b: '#8dbcd6' },
    wine: { he: 'בורדו', en: 'burgundy', a: '#b8344f', b: '#7a1d31' }
  };
  var SHAPE = { almond: { he: 'שקד', en: 'almond' }, oval: { he: 'אובלי', en: 'oval' }, square: { he: 'מרובע', en: 'square' }, stiletto: { he: 'סטילטו', en: 'stiletto' } };
  var picks = $('[data-picks]'), nBody = $('[data-n-body]'), nClip = $('[data-n-clip]'), nTip = $('[data-n-tip]'), nName = $('[data-nail-name]'), brush = $('[data-brush]');
  var stops = { a1: $('[data-n1a]'), b1: $('[data-n1b]'), a2: $('[data-n2a]'), b2: $('[data-n2b]') };
  var steps = $$('[data-step]'), msgEl = $('[data-msg]'), shown = '', typing = 0, noteSeen = false, lastTip = true;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function state() { var f = new FormData(picks); return { shape: f.get('shape'), col: f.get('col'), tip: !!f.get('tip'), svc: f.get('svc') }; }
  function compose(st) {
    var l = he(), o = $('[data-svc] option[value="' + st.svc + '"]'), svc = o.dataset[l ? 'he' : 'en'];
    var hands = /gel|ext|art|str|both/.test(st.svc), col = st.svc !== 'lash';
    if (l) {
      var m = 'שלום, אשמח לקבוע תור ל' + svc + '.';
      if (col) m += (hands ? ' צורה: ' + SHAPE[st.shape].he + ',' : '') + ' צבע: ' + COL[st.col].he + (st.tip && hands ? ', עם קצה לבן (פרנץ׳)' : '') + '.';
      return m + ' מתי יש מקום פנוי?';
    }
    var e = 'Hi, I’d like to book ' + svc + '.';
    if (col) e += (hands ? ' Shape: ' + SHAPE[st.shape].en + ',' : '') + ' colour: ' + COL[st.col].en + (st.tip && hands ? ', with a white French tip' : '') + '.';
    return e + ' When do you have a free slot?';
  }
  function nailUpdate(instant) {
    var st = state(), c = COL[st.col], l = he() ? 'he' : 'en';
    var d = nailPath(st.shape, 54, 24, 92, true, 1.45);
    nBody.setAttribute('d', d); nClip.setAttribute('d', d);
    stops.a1.setAttribute('stop-color', c.a); stops.b1.setAttribute('stop-color', c.a); stops.a2.setAttribute('stop-color', c.b); stops.b2.setAttribute('stop-color', c.b);
    var yS = 24 + 92 * 1.45 * (st.shape === 'stiletto' ? .6 : st.shape === 'square' ? .3 : .44);
    nTip.setAttribute('d', 'M0 0 H200 V' + (yS + 14).toFixed(1) + ' C150 ' + (yS - 16).toFixed(1) + ' 50 ' + (yS - 16).toFixed(1) + ' 0 ' + (yS + 14).toFixed(1) + 'Z');
    nTip.style.opacity = st.tip ? 1 : 0;
    nName.textContent = SHAPE[st.shape][l] + ' · ' + COL[st.col][l] + (st.tip ? (l === 'he' ? ' · פרנץ׳' : ' · French') : '');
    if (st.tip && !lastTip && !instant && !still() && brush.animate) {
      nTip.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 640, easing: 'cubic-bezier(.23,1,.32,1)' });
      brush.animate([{ opacity: 0, transform: 'translate(46px,' + (yS + 8) + 'px) rotate(-30deg)' }, { opacity: 1, offset: .15 }, { opacity: 1, offset: .85, transform: 'translate(154px,' + (yS + 8) + 'px) rotate(28deg)' }, { opacity: 0, transform: 'translate(160px,' + (yS + 4) + 'px) rotate(30deg)' }], { duration: 760, easing: 'cubic-bezier(.77,0,.175,1)' });
    }
    lastTip = st.tip;
    write(instant);
  }
  function write(instant) {
    var st = state(), target = compose(st);
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    $('[data-mail]').href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(he() ? 'בקשה לתור' : 'Booking request') + '&body=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !noteSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function stp(t) {
      var n = Math.floor((t - t0) / 14);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(stp);
    })(t0);
  }
  picks.addEventListener('change', function (e) {
    var g = e.target.closest('[data-group]'); if (g) lightStep(+g.dataset.group);
    nailUpdate(false);
  });
  ['pointerenter', 'focus'].forEach(function (ev) { $('[data-send]').addEventListener(ev, function () { lightStep(3); }); });
  watch($('[data-note]'), function (v) { if (v && !noteSeen) { noteSeen = true; lightStep(0); if (!still()) { shown = ''; msgEl.textContent = ''; write(); } } }, { threshold: .4 });

  // ---------------------------------------------------------------- footer: their wordmark gathers out of glitter
  var foot = $('[data-foot]'), fwm = $('[data-fwm]');
  var glitter = (function () {
    var cv = $('[data-glitter]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = false, t0 = 0, mx = -999, my = -999, built = false;
    var COLS = ['#fdf2ee', '#f3b3c0', '#d9b77e', '#ffffff', '#e99aab'];
    function build() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = foot.clientWidth; h = foot.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var fr = foot.getBoundingClientRect(), r = fwm.getBoundingClientRect(), cs = getComputedStyle(fwm);
      var oc = document.createElement('canvas'), ow = Math.ceil(r.width), oh = Math.ceil(r.height); oc.width = ow; oc.height = oh;
      var ox = oc.getContext('2d'); ox.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily; ox.textAlign = 'center'; ox.textBaseline = 'middle'; ox.fillStyle = '#fff';
      ox.fillText(fwm.textContent, ow / 2, oh / 2 + parseFloat(cs.fontSize) * .04);
      var d = ox.getImageData(0, 0, ow, oh).data, st = phone() ? 3 : 4, pts = [];
      for (var y = 0; y < oh; y += st) for (var x = 0; x < ow; x += st) if (d[(y * ow + x) * 4 + 3] > 140) pts.push([x + r.left - fr.left, y + r.top - fr.top]);
      P = pts.map(function (q) { return { hx: q[0], hy: q[1], x: Math.random() * w, y: h + Math.random() * h * .4, vx: 0, vy: 0, dl: Math.random() * .8, ph: Math.random() * 6.28, col: COLS[Math.floor(Math.random() * COLS.length)], s: Math.random() < .12 ? 2.4 : 1.5 }; });
      built = true; t0 = performance.now();
    }
    function frame(t) {
      raf = 0; if (!built || still()) return;
      var T = (t - t0) / 1000, done = T > 2.6;
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], a = smooth((T - p.dl) / 1.5);
        if (a < 1) { p.x = lerp(p.x, p.hx, a * .14 + .02); p.y = lerp(p.y, p.hy, a * .14 + .02); }
        else {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 6000) { var f = (6000 - d2) / 6000 * 2.2, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
          p.vx += (p.hx - p.x) * .05; p.vy += (p.hy - p.y) * .05; p.vx *= .84; p.vy *= .84; p.x += p.vx; p.y += p.vy;
        }
        var tw = .5 + .5 * Math.sin(T * 3 + p.ph);
        c.globalAlpha = done ? .25 + tw * .6 : .5 + tw * .5; c.fillStyle = p.col;
        c.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
      }
      c.globalAlpha = 1;
      if (done && !fwm.classList.contains('done')) fwm.classList.add('done');
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (still()) { c.clearRect(0, 0, w || 0, h || 0); return; } if (!built && vis) { (document.fonts ? document.fonts.load('italic 700 100px "Yanone Kaffeesatz"') : Promise.resolve()).then(function () { if (!built) build(); kick(); }); return; } if (!raf && vis) raf = requestAnimationFrame(frame); }
    foot.addEventListener('pointermove', function (e) { var r = foot.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    foot.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(foot, function (v) { vis = v; kick(); }, { threshold: .25 });
    return { kick: kick, reset: function () { built = false; fwm.classList.remove('done'); if (vis) kick(); } };
  })();
  var fh = $('.f-horizon'), bottle = $('[data-bottle]');

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    bottle.classList.toggle('hide', scrollY < vh * .5);
    if (!calm) { petals.kick(); wheel.kick(); } else wheel.place();
    var hr = hero.getBoundingClientRect();
    tipline(calm ? .5 : clamp(-hr.top / (hr.height * .7), 0, 1));
    runUpdate(calm);
    studioUpdate(calm);
    var fr = fh.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / 300);
    fh.style.setProperty('--rise', ((1 - fp) * 70).toFixed(1) + 'px');
  }

  function layout() { petals.size(); wheel.place(); glitter.reset(); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { if (innerWidth === lw && phone()) { tick(); return; } lw = innerWidth; clearTimeout(rz); rz = setTimeout(layout, 140); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); stepShow(0); capShow(0, true); nailUpdate(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 500);
  addEventListener('load', function () { layout(); });
})();
