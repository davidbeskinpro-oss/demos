(function () {
  var root = document.documentElement, WA = '972508426958';
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
  var TITLE = { he: 'פיטר סאבא · רואה חשבון · שיבת ציון 6, חיפה', en: 'Peter Saba · CPA · 6 Shivat Zion St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור פיטר סאבא רואה חשבון · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Peter Saba CPA · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-ph-he]').forEach(function (i) { i.placeholder = i.dataset[l === 'he' ? 'phHe' : 'phEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'פיטר סאבא, רואה חשבון', 'Peter Saba, CPA');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לפיטר, 050-842-6958', 'Call Peter, 050-842-6958');
    aria('[data-t-wa]', 'וואטסאפ לפיטר', 'WhatsApp Peter');
    aria('[data-t-prev]', 'השלב הקודם', 'Previous step');
    aria('[data-t-next]', 'השלב הבא', 'Next step');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: שיבת ציון 6, חיפה' : 'Map: 6 Shivat Zion St, Haifa'; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('saba-lang', l); } catch (e) {}
    texts(l); hours(); decode.reset(); write(true); yearUI(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('saba-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $('[data-hero]').classList.add('ready');
    decode.reset(); write(true); layout(); kickAll();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = window.__H || { 0: [8.5, 19.5], 1: [8.5, 19.5], 2: [8.5, 19.5], 3: [8.5, 19.5], 4: [8.5, 19.5], 5: [8, 15.5], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  var isOpen = false;
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] >= 24) { open = true; txt = l ? 'פתוח עכשיו · כל היום' : 'Open now · all day'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      var at = function (x) { return x[0] === 0 ? '' : (l ? ' ב-' : ' at ') + hhmm(x[0]); };
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר' : 'Closed now · opens tomorrow') + at(H[nd])
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] : 'Closed now · opens ' + dayEn[nd]) + at(H[nd]);
    }
    isOpen = open;
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
    var lamp = $('[data-lamp]'); if (lamp) { lamp.classList.toggle('lit', open); $('figcaption', lamp).textContent = l ? (open ? 'המנורה דולקת: המשרד פתוח עכשיו' : 'המנורה כבויה: המשרד סגור עכשיו') + ' · תמונה להמחשה' : (open ? 'The lamp is on: the office is open now' : 'The lamp is off: the office is closed now') + ' · illustrative photo'; }
  }
  // consecutive days with the same hours share a row; the week starts on Sunday
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? (t[0] === 0 && t[1] >= 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>') : (l ? 'סגור' : 'Closed');
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

  // ---------------------------------------------------------------- the name, pressed in letter by letter
  $$('[data-stamp] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 9 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // ---------------------------------------------------------------- the services line decodes out of figures
  var decode = (function () {
    var el = $('[data-decode]'), W = {
      he: ['הנהלת חשבונות', 'דוחות שנתיים', 'החזרי מס לשכירים', 'הצהרות הון', 'ביקורת דוחות כספיים', 'מיסוי חברות ועצמאים', 'פתיחת תיקים'],
      en: ['Bookkeeping', 'Annual reports', 'Tax refunds', 'Capital declarations', 'Audits', 'Company tax', 'Opening tax files']
    }, G = '0123456789₪%', k = 0, timer = 0, raf = 0;
    function show(word, animate) {
      cancelAnimationFrame(raf);
      if (!animate) { el.textContent = word; return; }
      var t0 = performance.now(), dur = 700;
      (function st(t) {
        var p = (t - t0) / dur, out = '';
        for (var i = 0; i < word.length; i++) out += word[i] === ' ' ? ' ' : (i / word.length < p ? word[i] : G[Math.floor(Math.random() * G.length)]);
        el.textContent = out; if (p < 1.05) raf = requestAnimationFrame(st); else el.textContent = word;
      })(t0);
    }
    function next() { var l = he() ? 'he' : 'en'; k = (k + 1) % W[l].length; show(W[l][k], !still()); }
    function reset() {
      clearInterval(timer); var l = he() ? 'he' : 'en';
      if (still()) { show(W[l].slice(0, 2).join(' · '), false); return; }
      k = 0; show(W[l][0], true); timer = setInterval(function () { if (heroVis) next(); }, 2600);
    }
    return { reset: reset };
  })();

  // ---------------------------------------------------------------- HERO: the foil seal, a light under the hand, the camera pushes in and the logo's disc opens
  var hero = $('[data-hero]'), heroRun = $('[data-hero-run]'), cam = $('[data-cam]'), lit = $('.seal-lit'), hcopy = $('[data-hcopy]');
  var plate = $('[data-plate]'), ring = $('[data-ring]'), nav = $('[data-nav]');
  var SX = 662, SY = 386, heroVis = true, hW = 0, hH = 0, base = { s: 1, tx: 0, ty: 0 }, light = { x: SX, y: SY, tx: SX, ty: SY }, lastPointer = -1e9, heroP = 0;
  function heroLayout() {
    hW = hero.clientWidth; hH = hero.clientHeight;
    var tx, ty, s;
    if (phone()) {
      tx = hW * .5; s = Math.max(hW * .96 / 615, hW / 1500 * 1.6); ty = Math.min(hH * .3, SY * s);
      if (ty - SY * s > 0) ty = SY * s;
      cam.style.webkitMaskImage = cam.style.maskImage = 'linear-gradient(to bottom,#000 76%,transparent 99%)'; // taste-skill-ignore: fades the photo edge into the ground
    } else {
      tx = hW * (rtl() ? .3 : .7); ty = hH * .5;
      s = Math.max(hW / 1500, hH / 1000, tx / SX, (hW - tx) / (1500 - SX), ty / SY, (hH - ty) / (1000 - SY)) * 1.02;
      cam.style.webkitMaskImage = cam.style.maskImage = '';
    }
    base = { s: s, tx: tx, ty: ty };
  }
  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch' && !e.isPrimary) return;
    var r = hero.getBoundingClientRect(), z = camState.s;
    light.tx = (e.clientX - r.left - camState.tx) / z + SX; light.ty = (e.clientY - r.top - camState.ty) / z + SY; lastPointer = performance.now();
  });
  var camState = { s: 1, tx: 0, ty: 0 };
  function heroFrame(now) {
    var calm = still();
    var p = calm ? 0 : heroP, e1 = smooth(p / .6), z = 1 + e1 * 1.5;
    var tx = lerp(base.tx, hW / 2, e1), ty = lerp(base.ty, hH * (phone() ? .42 : .5), e1), s = base.s * z;
    camState = { s: s, tx: tx, ty: ty };
    cam.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ') translate(' + (-SX) + 'px,' + (-SY) + 'px)';
    // the light: follows the hand; without one it drifts slowly across the foil
    if (calm) { light.x = SX + 60; light.y = SY - 40; }
    else {
      if (now - lastPointer > 2500) { var T = now / 1000; light.tx = SX + Math.sin(T * .55) * 250; light.ty = SY + Math.sin(T * .41 + 1.2) * 120 - p * 200; }
      light.x = lerp(light.x, light.tx, .08); light.y = lerp(light.y, light.ty, .08);
    }
    lit.style.setProperty('--lx', light.x.toFixed(1) + 'px'); lit.style.setProperty('--ly', light.y.toFixed(1) + 'px');
    // copy leaves, the disc opens out of the seal's centre and becomes the next section's ground
    var out = calm ? 0 : smooth((p - .01) / .19);
    hcopy.style.opacity = (1 - out).toFixed(3); hcopy.style.translate = '0 ' + (-50 * out).toFixed(1) + 'px';
    var q = calm ? 0 : smooth((p - .2) / .52), diag = Math.hypot(Math.max(tx, hW - tx), Math.max(ty, hH - ty)) + 12;
    var r = q * diag; plate.classList.toggle('on', r > 1);
    if (r > 1) {
      plate.style.setProperty('--r', r.toFixed(1) + 'px'); plate.style.setProperty('--px', tx.toFixed(1) + 'px'); plate.style.setProperty('--py', ty.toFixed(1) + 'px');
      plate.style.setProperty('--lo', '1');
      plate.style.setProperty('--ro', (1 - smooth((r - diag * .7) / (diag * .3))).toFixed(3));
    }
  }

  // ---------------------------------------------------------------- foil flakes drifting over the hero, parting around the hand
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), P = [], w = 0, h = 0, mx = -999, my = -999;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 46 : 90; P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, s: .6 + Math.random() * 2.2, ph: Math.random() * 6.28, sp: .15 + Math.random() * .35 });
    }
    function frame(now) {
      c.clearRect(0, 0, w, h); if (still()) return;
      var T = now / 1000;
      for (var i = 0; i < P.length; i++) {
        var p = P[i], dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 14400) { var f = (14400 - d2) / 14400 * .9, d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f; }
        p.vx *= .92; p.vy *= .92; p.x += p.vx + Math.sin(T * .6 + p.ph) * .18; p.y += p.vy - p.sp;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; } if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        var tw = .35 + .65 * Math.pow(Math.max(0, Math.sin(T * 1.6 + p.ph * 3)), 3);
        c.globalAlpha = tw * .75; c.fillStyle = tw > .8 ? '#fff4cc' : '#ecd47e';
        c.save(); c.translate(p.x, p.y); c.rotate(p.ph + T * .4); c.fillRect(-p.s, -p.s * .45, p.s * 2, p.s * .9); c.restore();
      }
      c.globalAlpha = 1;
    }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    return { size: size, frame: frame };
  })();

  // ---------------------------------------------------------------- the office's card file: turns by itself, with the scroll and with a drag
  var file = $('[data-file]'), wheel = $('[data-wheel]'), fcs = $$('.fc', wheel), N = fcs.length, STEP = 360 / N;
  var rot = 0, vel = 0, drag = false, lx = 0, ly = 0, fileVis = false, fileR = 300, lastT = 0, moved = 0;
  function fileLayout() {
    var cw = Math.min(440, file.clientWidth * (phone() ? .8 : .78)); file.style.setProperty('--cw', cw.toFixed(0) + 'px');
    fileR = (cw * 5 / 9) / 2 / Math.tan(Math.PI / N) * 1.03;
    file.style.setProperty('--k', (1300 / (1300 - fileR)).toFixed(3));
    placeCards();
  }
  function placeCards() {
    fcs.forEach(function (c, i) {
      var a = rot + i * STEP, f = Math.cos(a * Math.PI / 180);
      c.style.transform = 'translate(-50%,-50%) rotateX(' + a.toFixed(2) + 'deg) translateZ(' + fileR.toFixed(1) + 'px)';
      c.style.filter = 'brightness(' + (.35 + .65 * Math.pow(Math.max(f, 0), 1.4)).toFixed(3) + ')';
    });
  }
  function fileFrame(t) {
    var dt = lastT ? Math.min(.05, (t - lastT) / 1000) : .016; lastT = t;
    if (!drag) { rot -= (5 + vel) * dt; vel *= .93; }
    placeCards();
  }
  file.addEventListener('pointerdown', function (e) { drag = true; lx = e.clientX; ly = e.clientY; moved = 0; file.classList.add('drag'); });
  addEventListener('pointermove', function (e) {
    if (!drag) return; var dx = e.clientX - lx, dy = e.pointerType === 'mouse' ? e.clientY - ly : 0; lx = e.clientX; ly = e.clientY;
    var d = (dx * (rtl() ? -1 : 1) + dy) * -.35; moved += Math.abs(d); rot += d; vel = -d * 3; if (still()) placeCards();
  });
  addEventListener('pointerup', function () {
    if (!drag) return; drag = false; file.classList.remove('drag');
    if (moved < 2) { rot = Math.round((rot - STEP) / STEP) * STEP; if (still()) placeCards(); }   // a tap turns to the next card
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
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : 0; s.style.transitionDelay = go ? (i * 130) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es) { roll(o, es[0].isIntersecting || still()); }, { threshold: .4 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- services: the spotlight, the ledger read by the camera
  var svc = $('[data-svc]'), svcOn = false, tiles = $$('.tile'), bigImg = $('.t-ledger img'), bigBox = $('.t-ledger'), scan = $('.scan');
  watch(svc, function (v) { svcOn = v; svc.classList.toggle('on', v); kickAll(); }, { rootMargin: '0px 0px -10% 0px' });
  tiles.forEach(function (t) { t.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = t.getBoundingClientRect(); t._hand = performance.now(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  function svcFrame(now) {
    var T = now / 1000;
    var ih = bigImg.offsetHeight, bh = bigBox.clientHeight, span = Math.max(0, ih - bh);
    bigImg.style.setProperty('--pan', ((Math.sin(T * .09 - 1.57) * .5 + .5) * span).toFixed(1));
    scan.style.setProperty('--sy', ((T * .32 % 1) * bh).toFixed(1) + 'px');
    // no mouse: the spotlight travels by itself across the tiles on screen
    tiles.forEach(function (t, i) {
      if (t._hand && now - t._hand < 2500) return;
      var w = t.clientWidth, h = t.clientHeight;
      t.style.setProperty('--mx', ((Math.sin(T * .5 + i * 1.3) * .42 + .5) * w).toFixed(0) + 'px');
      t.style.setProperty('--my', ((Math.cos(T * .37 + i * .9) * .38 + .5) * h).toFixed(0) + 'px');
    });
  }

  // ---------------------------------------------------------------- the stack: the office stays, services lands over it
  var stack = $('[data-stack]'), office = $('[data-office]'), oGrid = $('.o-grid');
  function stackLayout() { office.style.setProperty('--otop', Math.min(0, innerHeight - office.offsetHeight) + 'px'); }

  // ---------------------------------------------------------------- THE YEAR
  var yrun = $('[data-yrun]'), stage = $('.y-stage'), ypan = $('[data-ypan]'), steps = $$('[data-go]'), ynow = $('[data-ynow]'), runtot = $('[data-runtot]');
  var STEPS = { he: ['קבלות', 'הנהלת חשבונות', 'דיווחים', 'דוח שנתי'], en: ['Receipts', 'Bookkeeping', 'Reports', 'Annual report'] };
  var cur = 0, totAnim = 0, TOTAL = 2249.30;
  var fmt = function (v) { return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  function countTo(v) {
    cancelAnimationFrame(totAnim);
    if (still() || v === 0) { runtot.textContent = fmt(v); return; }
    var from = parseFloat(runtot.textContent.replace(/,/g, '')) || 0, t0 = performance.now();
    (function st(t) { var k = smooth((t - t0 - 250) / 1100); runtot.textContent = fmt(lerp(from, v, k)); if (k < 1) totAnim = requestAnimationFrame(st); })(t0);
  }
  function setStage(n) {
    n = clamp(n, 0, 3); if (n === cur && stage.dataset.stage == n) return;
    cur = n; stage.dataset.stage = n; countTo(n >= 1 ? TOTAL : 0); yearUI();
    if (still()) ypan.style.setProperty('--yp', (n / 3 * ypanMax()).toFixed(1));
  }
  function ypanMax() { return Math.max(0, ypan.offsetHeight - stage.clientHeight * .84); }   // ends with the ledger's double-ruled total just above the fade
  function yearUI() {
    ynow.textContent = STEPS[he() ? 'he' : 'en'][cur];
    $('[data-step-by="-1"]').disabled = cur === 0; $('[data-step-by="1"]').disabled = cur === 3;
    steps.forEach(function (b, i) { b.setAttribute('aria-current', i === cur ? 'step' : 'false'); });
  }
  function goStage(n) {
    if (still() || !yrun.offsetHeight || yrun.offsetHeight <= innerHeight * 1.2) { setStage(n); return; }
    var top = yrun.getBoundingClientRect().top + scrollY, span = yrun.offsetHeight - innerHeight;
    scrollTo({ top: top + span * ((n + .5) / 4), behavior: 'smooth' });
  }
  steps.forEach(function (b) { b.addEventListener('click', function () { goStage(+b.dataset.go); }); });
  $$('[data-step-by]').forEach(function (b) { b.addEventListener('click', function () { goStage(cur + +b.dataset.stepBy); }); });
  watch(stage, function (v) { if (v) stage.classList.add('live'); }, { threshold: .25 });

  // ---------------------------------------------------------------- reviews drift; tap holds them on a phone
  var drift = $('[data-drift]');
  $$('[data-lane]').forEach(function (l) {
    $$('.rv', l).forEach(function (r) { var k = r.cloneNode(true); k.setAttribute('aria-hidden', 'true'); l.appendChild(k); });
    var k2 = $$('.rv', l).length; if (k2 < 8) $$('.rv', l).forEach(function (r) { var k = r.cloneNode(true); k.setAttribute('aria-hidden', 'true'); l.appendChild(k); });
  });
  function laneLayout() { $$('[data-lane]').forEach(function (l) { l.style.setProperty('--dur', Math.round(l.scrollWidth / 2 / 34) + 's'); }); }
  drift.addEventListener('click', function () { if (!fine) drift.classList.toggle('hold'); });

  // ---------------------------------------------------------------- write to Peter: ticks write the message, the stamp sends it
  var form = $('[data-form]'), msgEl = $('[data-msg]'), nm = $('#nm'), shown = '', typing = 0, seen = false;
  var WHO = { he: { self: 'יש לי עסק עצמאי.', co: 'יש לי חברה.', emp: 'אני שכיר/ה.' }, en: { self: 'I’m self-employed.', co: 'I have a company.', emp: 'I’m an employee.' } };
  var WHAT = { he: { books: 'הנהלת חשבונות', annual: 'דוח שנתי', refund: 'החזר מס', open: 'פתיחת תיק', capital: 'הצהרת הון', tax: 'מיסוי' }, en: { books: 'bookkeeping', annual: 'an annual report', refund: 'a tax refund', open: 'opening a file', capital: 'a capital declaration', tax: 'tax' } };
  function compose() {
    var l = he() ? 'he' : 'en', w = form.who.value, t = form.what.value, n = nm.value.trim();
    if (l === 'he') return 'שלום פיטר' + (n ? ', כאן ' + n : '') + '.' + (w ? ' ' + WHO.he[w] : '') + ' אשמח לדבר איתך' + (t ? ' על ' + WHAT.he[t] : '') + '.';
    return 'Hi Peter' + (n ? ', this is ' + n : '') + '.' + (w ? ' ' + WHO.en[w] : '') + ' I’d like to talk to you' + (t ? ' about ' + WHAT.en[t] : '') + '.';
  }
  function link() { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(compose()); }
  function write(instant) {
    var target = compose(); cancelAnimationFrame(typing);
    if (instant || still() || !seen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var from = shown, t0 = performance.now(), del = from.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 15);
      shown = n < del ? from.slice(0, from.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown; if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  form.addEventListener('change', function () { write(); });
  nm.addEventListener('input', function () { write(true); });
  form.addEventListener('reset', function () { setTimeout(function () { write(); }, 0); });
  form.addEventListener('submit', function (e) {
    e.preventDefault(); var b = $('[data-send]'); b.classList.remove('press'); void b.offsetWidth; b.classList.add('press');
    setTimeout(function () { b.classList.remove('press'); }, 520);
    window.open(link(), '_blank', 'noopener');
  });
  watch($('.bubble'), function (v) { if (v && !seen) { seen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .5 });

  // ---------------------------------------------------------------- footer: flakes from the real logo's gold gather into the seal
  var foot = $('[data-foot]'), page = $('.page'), flogo = $('[data-flogo]'), fcv = $('[data-flakes]'), fc = fcv.getContext('2d'), FL = [], flOk = false, fw = 0, fh2 = 0, footP = 0;
  var fmx = -999, fmy = -999;
  function flakesSample() {
    try {
      var sc = document.createElement('canvas'), n = 140; sc.width = n; sc.height = n;
      var sx = sc.getContext('2d'); sx.drawImage(flogo, 0, 0, n, n);
      var d = sx.getImageData(0, 0, n, n).data, pts = [];
      for (var y = 0; y < n; y += 2) for (var x = 0; x < n; x += 2) {
        var k = (y * n + x) * 4; if (d[k + 3] > 200 && d[k] > 150 && d[k + 1] > 120 && d[k + 2] < 140) pts.push([x / n, y / n]);
      }
      var want = phone() ? 700 : 1100, stp = Math.max(1, pts.length / want); FL = [];
      for (var f = 0; f < pts.length; f += stp) { var q = pts[Math.floor(f)]; FL.push({ hx: q[0], hy: q[1], ox: Math.random() * 1.6 - .3, oy: Math.random() * 1.6 - .3, ph: Math.random() * 6.28, dl: Math.random() * .35, x: 0, y: 0 }); }
      flOk = FL.length > 50;
    } catch (e) { flOk = false; }
  }
  function flakesSize() { var dpr = Math.min(2, devicePixelRatio || 1); fw = fcv.clientWidth; fh2 = fcv.clientHeight; fcv.width = fw * dpr; fcv.height = fh2 * dpr; fc.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function flakesFrame(now) {
    fc.clearRect(0, 0, fw, fh2);
    var calm = still();
    flogo.style.setProperty('--fl', (calm || !flOk) ? 1 : smooth((footP - .86) / .12).toFixed(3));
    foot.querySelector('.f-ring').style.setProperty('--fr', (calm ? 1 : lerp(1.35, 1, smooth(footP))).toFixed(3));
    if (calm || !flOk || footP >= .99) return;
    var T = now / 1000, pad = fw * .1875, size = fw - 2 * pad;   // the canvas overhangs the logo by 30% on each side
    fc.fillStyle = '#ecd47e';
    for (var i = 0; i < FL.length; i++) {
      var p = FL[i], a = smooth((footP - p.dl * .5) / .75);
      var tx = pad + p.hx * size, ty = pad + p.hy * size, sx = p.ox * fw, sy = p.oy * fh2;
      var x = lerp(sx, tx, a) + Math.sin(T + p.ph) * 3 * (1 - a), y = lerp(sy, ty, a) + Math.cos(T * .8 + p.ph) * 3 * (1 - a);
      var dx = x - fmx, dy = y - fmy, d2 = dx * dx + dy * dy; if (d2 < 2500) { var d = Math.sqrt(d2) || 1; x += dx / d * (50 - d) * .6; y += dy / d * (50 - d) * .6; }
      fc.globalAlpha = (.35 + .65 * a) * (1 - smooth((footP - .9) / .09));
      fc.fillRect(x - 1.2, y - 1.2, 2.4, 2.4);
    }
    fc.globalAlpha = 1;
  }
  fcv.parentNode.addEventListener('pointermove', function (e) { var r = fcv.getBoundingClientRect(); fmx = e.clientX - r.left; fmy = e.clientY - r.top; });
  fcv.parentNode.addEventListener('pointerleave', function () { fmx = fmy = -999; });
  function footLayout() {
    foot.classList.remove('curtain'); page.style.setProperty('--fh', '0px');
    var h = foot.offsetHeight;
    if (!still() && h < innerHeight * .92) { foot.classList.add('curtain'); page.style.setProperty('--fh', h + 'px'); }
    flakesSize();
  }
  if (flogo.complete && flogo.naturalWidth) flakesSample(); else flogo.addEventListener('load', flakesSample, { once: true });

  // ---------------------------------------------------------------- one loop for everything that moves
  var street = $('[data-street] img'), streetBox = $('[data-street]'), bandTab = $('[data-band-tab]'), dock = $('[data-dock]');
  var raf = 0, fileOn = false, footOn = false, yearOn = false;
  watch(hero, function (v) { heroVis = v; kickAll(); });
  watch(file, function (v) { fileOn = v; lastT = 0; kickAll(); });
  watch(foot, function (v) { footOn = v; kickAll(); });
  watch(yrun, function (v) { yearOn = v; });
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function scrollWork() {
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    heroP = calm ? 0 : prog(heroRun);
    // the office shrinks back a little as services lands on it
    var sr = svc.getBoundingClientRect(), cover = calm ? 0 : smooth(1 - sr.top / vh);
    oGrid.style.transform = cover > 0 ? 'scale(' + (1 - cover * .07).toFixed(4) + ')' : '';
    oGrid.style.opacity = cover > 0 ? (1 - cover * .55).toFixed(3) : '';
    // the year
    if (!calm) {
      var yp = prog(yrun); ypan.style.setProperty('--yp', (yp * ypanMax()).toFixed(1));
      setStage(Math.min(3, Math.floor(yp * 4)));
    }
    // the street eases back as it passes
    var str = streetBox.getBoundingClientRect(), sp = clamp(1 - (str.top + str.height) / (vh + str.height), 0, 1);
    street.style.setProperty('--ss', calm ? 1 : lerp(1.14, 1, sp).toFixed(4));
    // footer revealed
    var fhh = foot.offsetHeight, shown = vh - page.getBoundingClientRect().bottom; footP = clamp(shown / Math.max(1, fhh), 0, 1);
    if (foot.classList.contains('curtain')) foot.style.visibility = shown > -40 ? '' : 'hidden'; else foot.style.visibility = '';
    if (bandTab) bandTab.style.setProperty('--ty', ((scrollY / Math.max(1, document.documentElement.scrollHeight - vh)) * (vh - 54)).toFixed(1) + 'px');
    dock.classList.toggle('show', scrollY > vh * .85);
  }
  function loop(now) {
    raf = 0; scrollWork();
    var calm = still(), again = false;
    if (heroVis) { heroFrame(now); dust.frame(now); again = again || !calm; }
    if (fileOn && !calm) { fileFrame(now); again = true; }
    if (svcOn && !calm) { svcFrame(now); again = true; }
    if (footOn && footP > 0) { flakesFrame(now); again = again || (!calm && footP < .99); }
    if (again) raf = requestAnimationFrame(loop);
  }
  function kickAll() { if (!raf) raf = requestAnimationFrame(loop); }
  addEventListener('scroll', kickAll, { passive: true });

  // a long name never runs off the screen: the headline shrinks until its longest word fits
  function fitTitle() {
    var h = $('[data-stamp]'); h.style.fontSize = ''; var box = h.clientWidth, max = 0;
    $$('.w', h).forEach(function (w) { max = Math.max(max, w.offsetWidth); });
    if (box && max > box) h.style.fontSize = (parseFloat(getComputedStyle(h).fontSize) * box / max * .97).toFixed(1) + 'px';
  }
  function layout() { fitTitle(); heroLayout(); dust.size(); fileLayout(); stackLayout(); laneLayout(); footLayout(); if (still()) setStage(cur); kickAll(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (innerWidth !== lw || !phone()) { lw = innerWidth; layout(); } else { stackLayout(); footLayout(); kickAll(); } }, 140); });

  texts(root.lang); hours(); write(true); yearUI(); layout(); decode.reset();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTitle);

  // ---------------------------------------------------------------- the opening: the seal gauge fills, the photos are dealt, the foil seal grows into the hero
  var intro = $('[data-intro]'), ready = function () { hero.classList.add('ready'); };
  if (root.classList.contains('intro')) {
    var n = $('[data-intro-n]'), t0 = performance.now(), ended = false;
    (function st(t) { var k = clamp((t - t0) / 1050, 0, 1); n.textContent = Math.round(smooth(k) * 100); if (k < 1 && !ended) requestAnimationFrame(st); })(t0);
    var card = $('.dc4'), end = function () {
      if (ended) return; ended = true;
      try { sessionStorage.setItem('saba-intro', '1'); } catch (e) {}
      intro.classList.add('done'); ready();
      setTimeout(function () { root.classList.remove('intro'); }, 500);
    };
    setTimeout(function () {
      if (ended) return;
      // the last card lands exactly where the hero shows the same photo, so the hand-off has no jump
      var w = card.offsetWidth || 240, hr = hero.getBoundingClientRect(), k = base.s * 1500 / w;
      var X = hr.left + base.tx - SX * base.s, Y = hr.top + base.ty - SY * base.s;
      intro.style.setProperty('--gt', 'translate(' + (X - innerWidth / 2).toFixed(1) + 'px,' + (Y - innerHeight / 2).toFixed(1) + 'px) scale(' + k.toFixed(3) + ')');
      card.style.webkitMaskImage = card.style.maskImage = cam.style.maskImage;
      intro.classList.add('grow');
    }, 1150);
    setTimeout(end, 1650);
    intro.addEventListener('click', end);
  } else {
    var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(ready); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    setTimeout(go, 900);
  }
  addEventListener('load', function () { layout(); });
})();
