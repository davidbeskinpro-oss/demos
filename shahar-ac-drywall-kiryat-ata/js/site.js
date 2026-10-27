(function () {
  var root = document.documentElement, WA = '972526658003';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'שחר שירות מיזוג וגבס · הרב שבזי 13, קריית אתא', en: 'Shahar AC & Drywall Service · 13 HaRav Shabazi St, Kiryat Ata' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור שחר שירות מיזוג וגבס · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Shahar AC & Drywall Service · This is not the business’s official website' };
  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // object-fit: cover mapping from image-normalised points to box pixels
  function cover(W, H, iw, ih, px, py) { var s = Math.max(W / iw, H / ih), dw = iw * s, dh = ih * s; return { s: s, dw: dw, dh: dh, ox: (W - dw) * (px == null ? .5 : px), oy: (H - dh) * (py == null ? .5 : py) }; }

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'שחר שירות מיזוג וגבס', 'Shahar AC & Drywall Service');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-modes]', 'מה צריך', 'What you need');
    aria('[data-t-where]', 'איפה', 'Where');
    aria('[data-t-stud]', 'שלבים', 'Stages');
    aria('[data-t-call]', 'התקשרו לשחר, 052-665-8003', 'Call Shahar, 052-665-8003');
    aria('[data-t-wa]', 'וואטסאפ לשחר', 'WhatsApp Shahar');
    aria('[data-cprev]', 'השלב הקודם', 'Previous stage');
    aria('[data-cnext]', 'השלב הבא', 'Next stage');
    aria('[data-rminus]', 'פחות חדרים', 'Fewer rooms');
    aria('[data-rplus]', 'יותר חדרים', 'More rooms');
    aria('[data-lbx]', 'סגירה', 'Close');
    var sn = l === 'he' ? ['השלד', 'הלוחות', 'הגימור', 'האור'] : ['The frame', 'The boards', 'The finish', 'The light'];
    $$('[data-screw]').forEach(function (b, i) { b.setAttribute('aria-label', sn[i]); });
    $('iframe').title = l === 'he' ? 'Google Maps: הרב שבזי 13, קריית אתא' : 'Google Maps: 13 HaRav Shabazi St, Kiryat Ata';
    labelsText();
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('shahar-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('shahar-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    clearStyles(); layout(); airs.forEach(function (a) { a.kick(); }); petals.kick(); hatch.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [8.5, 21.5], 1: [8.5, 21.5], 2: [8.5, 21.5], 3: [8.5, 21.5], 4: [8.5, 21], 5: [8.5, 13.5], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, t: ((+o.hour) % 24) + ':' + o.minute }; }
  var isOpen = false;
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
    isOpen = open;
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
    $('[data-thdot]').classList.toggle('open', open);
    if (!tempC) $('[data-thtemp]').textContent = n.t;
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
  setInterval(status, 30000);

  // outside temperature in Kiryat Ata, live from Open-Meteo (hidden if it can't be fetched)
  var tempC = null;
  try {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=32.81&longitude=35.11&current=temperature_2m&timezone=Asia%2FJerusalem')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.current || typeof j.current.temperature_2m !== 'number') return;
        tempC = Math.round(j.current.temperature_2m);
        var chip = $('[data-temp]'), v = $('[data-tempv]'); chip.hidden = false;
        $('[data-thtemp]').textContent = tempC + '°';
        if (still()) { v.textContent = tempC + '°'; return; }
        var t0 = performance.now(), from = tempC + 9;
        (function st(t) { var u = smooth((t - t0) / 1400); v.textContent = Math.round(lerp(from, tempC, u)) + '°'; if (u < 1) requestAnimationFrame(st); })(t0);
      }).catch(function () {});
  } catch (e) {}

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline: two halves of each line slide shut like a board joint
  $$('[data-seam] .ln > span[lang]').forEach(function (sp) {
    var t = sp.textContent;
    sp.innerHTML = '<span class="seam-a">' + t + '</span><span class="seam-b" aria-hidden="true">' + t + '</span>';
  });

  // ---------------------------------------------------------------- air leaving the linear diffusers, on his real photos
  function makeAir(cv, img, iw, ih, segs, opt) {
    var c = cv.getContext('2d'), P = [], W = 0, Hh = 0, raf = 0, vis = false, last = 0, host = cv.parentNode, map, extra = opt.extra || function () { return true; };
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); W = host.clientWidth; Hh = host.clientHeight; cv.width = W * dpr; cv.height = Hh * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); map = cover(W, Hh, iw, ih, opt.px, opt.py); }
    function pt(x, y) { return [map.ox + x * map.dw, map.oy + y * map.dh]; }
    function spawn() {
      var s = segs[Math.floor(Math.random() * segs.length)], u = Math.random(), a = pt(s[0], s[1]), b = pt(s[2], s[3]);
      var x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) + 3, sc = map.s * (opt.k || 1);
      P.push({ x: x, y: y, vx: (Math.random() - .5) * 36 * sc + (opt.dx || 0) * sc, vy: (30 + Math.random() * 60) * sc, life: 0, max: 1.6 + Math.random() * 1.8, w: 2 + Math.random() * 3.5 });
    }
    function frame(t) {
      raf = 0;
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      c.clearRect(0, 0, W, Hh);
      if (still() || !vis || !extra()) { P.length = 0; last = 0; return; }
      var want = (phone() ? .55 : 1) * (opt.n || 90);
      for (var k = 0; k < 4 && P.length < want; k++) spawn();
      c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
      for (var i = P.length - 1; i >= 0; i--) {
        var p = P[i]; p.life += dt;
        if (p.life > p.max) { P.splice(i, 1); continue; }
        p.vy *= .992; p.vx *= .99; p.x += p.vx * dt; p.y += p.vy * dt;
        var f = p.life / p.max, a = Math.sin(f * Math.PI) * (opt.alpha || .26) * (1 - f * .4);
        c.strokeStyle = 'rgba(205,240,236,' + a.toFixed(3) + ')'; c.lineWidth = p.w;
        c.beginPath(); c.moveTo(p.x, p.y); c.quadraticCurveTo(p.x - p.vx * .2 + Math.sin(p.life * 2 + p.w) * 2, p.y - p.vy * .25, p.x - p.vx * .45, p.y - p.vy * .5); c.stroke();
      }
      c.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && vis && !still()) { last = 0; raf = requestAnimationFrame(frame); } }
    watch(host, function (v) { vis = v; kick(); });
    return { size: function () { size(); kick(); }, kick: kick };
  }
  var KSEG = [[.203, .390, .373, .434], [.203, .398, .373, .442], [.454, .428, .86, .344], [.454, .436, .86, .352]];
  var airs = [
    makeAir($('[data-air]'), null, 1600, 1200, KSEG, { px: .5, py: .4, n: 110 }),
    makeAir($('[data-air2]'), null, 1600, 1200, KSEG, { n: 90, extra: function () { return ceilP > .5 && ceilP < .86; } }),
    makeAir($('[data-air3]'), null, 1100, 495, [[.392, .33, .562, .33], [.392, .345, .562, .345]], { n: 60, k: 1.2, alpha: .4 })
  ];

  // ---------------------------------------------------------------- the access hatch: look above the ceiling
  var hatch = (function () {
    var el = $('[data-hatch]'), inn = $('[data-hatchin]'), copy = $('.h-copy'), hs = 210, x = 0, y = 0, tx = -1, ty = -1, raf = 0, vis = true, zone = null, ptr = false, t0 = performance.now(), drag = false;
    function size() {
      var W = hero.clientWidth, Hh = hero.clientHeight;
      hs = phone() ? 132 : innerWidth < 1100 ? 170 : 220; el.style.setProperty('--hs', hs + 'px');
      inn.style.width = W + 'px'; inn.style.height = Hh + 'px';
      var hr = hero.getBoundingClientRect(), top = (nav.getBoundingClientRect().bottom - hr.top) + 18, bottom = copy.offsetTop + (phone() ? 6 : 30) - hs - 18;
      // on wide screens the copy holds one side; the hatch roams the free side, top to bottom
      var minL = W, maxR = 0, rg = document.createRange();
      $$('.h-title .seam-a, .h-lead', copy).forEach(function (el) { if (!el.offsetParent) return; rg.selectNodeContents(el); var b = rg.getBoundingClientRect(); minL = Math.min(minL, b.left - hr.left); maxR = Math.max(maxR, b.right - hr.left); });
      $$('.h-acts > *, .h-chips > *', copy).forEach(function (el) { if (el.hidden) return; var b = el.getBoundingClientRect(); minL = Math.min(minL, b.left - hr.left); maxR = Math.max(maxR, b.right - hr.left); });
      var side = rtl() ? { x0: 24, x1: minL - hs - 40 } : { x0: maxR + 40, x1: W - hs - 24 };
      if (!phone() && side.x1 - side.x0 > 40) zone = { x0: side.x0, x1: side.x1, y0: top, y1: Hh - hs - 60 };
      else zone = bottom - top > 20 ? { x0: 24, x1: W - hs - 24, y0: top, y1: bottom } : null;
      el.style.display = zone ? '' : 'none';
      if (zone && x === 0) { x = lerp(zone.x0, zone.x1, rtl() ? .2 : .8); y = lerp(zone.y0, zone.y1, .5); }
      place();
    }
    function place() {
      if (!zone) return;
      x = clamp(x, zone.x0, zone.x1); y = clamp(y, zone.y0, zone.y1);
      el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      inn.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,' + (-y).toFixed(1) + 'px,0)';
    }
    function frame(t) {
      raf = 0; if (!zone) return;
      var gx, gy;
      if (ptr && tx >= 0) { gx = tx - hs / 2; gy = ty - hs / 2; }
      else { var T = (t - t0) / 1000; gx = lerp(zone.x0, zone.x1, .5 + .45 * Math.sin(T * .23)); gy = lerp(zone.y0, zone.y1, .5 + .5 * Math.sin(T * .41 + 1)); }
      x = lerp(x, gx, still() ? 1 : .07); y = lerp(y, gy, still() ? 1 : .07); place();
      if (vis && !still()) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'mouse' || drag) { var r = hero.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; ptr = true; kick(); }
    });
    hero.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') ptr = false; });
    hero.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' && !e.target.closest('a,button')) { var r = hero.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; ptr = true; drag = true; kick(); } });
    addEventListener('pointerup', function () { if (drag) { drag = false; setTimeout(function () { if (!drag) ptr = false; }, 2400); } });
    watch(hero, function (v) { vis = v; kick(); });
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- boards closing the hero
  var boardsBox = $('[data-boards]'), boardEls = [];
  function buildBoards() {
    boardsBox.innerHTML = ''; boardEls = [];
    var W = hero.clientWidth, n = phone() ? 4 : 7, w = W / n;
    for (var i = 0; i < n; i++) {
      var b = document.createElement('i'); b.style.left = (i * w - .5) + 'px'; b.style.width = (w + 1) + 'px';
      var ord = rtl() ? n - 1 - i : i; b.dataset.th = (ord / n * .55 + .05).toFixed(3); boardsBox.appendChild(b); boardEls.push(b);
    }
  }

  // ---------------------------------------------------------------- the ceiling: frame -> boards -> finish -> light
  var ceil = $('[data-ceil]'), stage = $('[data-cstage]'), tilesBox = $('[data-tiles]'), tape = $('[data-tape]'), lyK = $('.ly-kitchen'), lyN = $('.ly-night'), trowel = $('.trowel');
  var kImg = $('.ly-kitchen img'), steps = $$('.cs'), screws = $$('[data-screw]'), fill = $('[data-cfill]'), labelsBox = $('[data-labels]');
  var tiles = [], ceilP = 0, stillStage = 0, curStage = -1;
  var STOPS = [.1, .4, .66, .95];
  var LBL = [
    { img: [1400, 1050], items: [[.72, .24, 'פרופיל מתכת', 'Metal stud'], [.35, .14, 'תעלות אוויר מבודדות', 'Insulated air ducts'], [.81, .47, 'מזגן מיני מרכזי', 'Ducted AC unit']] },
    { img: [1400, 1050], items: [[.5, .2, 'לוחות גבס', 'Drywall boards'], [.29, .45, 'פתחים למפזרים', 'Diffuser openings']] },
    { img: [1600, 1200], items: [[.656, .39, 'מפזר קווי', 'Linear diffuser'], [.346, .443, 'ספוט שקוע', 'Recessed spot']] },
    { img: [1600, 721], items: [[.34, .32, 'מזגן עילי', 'Wall unit'], [.52, .575, 'תאורה נסתרת', 'Hidden lighting']] }
  ];
  LBL.forEach(function (s, si) { s.els = s.items.map(function (it) { var d = document.createElement('div'); d.className = 'lbl'; d.innerHTML = '<i></i><span></span>'; labelsBox.appendChild(d); return d; }); });
  function labelsText() { LBL.forEach(function (s) { s.els.forEach(function (d, i) { if (d.classList.contains('on')) $('span', d).textContent = s.items[i][he() ? 2 : 3]; }); }); }
  var GLY_HE = 'אבגדהוזחטיכלמנסעפצקרשת', GLY_EN = 'ABCDEFGHKLMNPRSTUVWXYZ';
  function decode(d, txt) {
    var sp = $('span', d); clearInterval(d._t);
    if (still()) { sp.textContent = txt; return; }
    var i = 0, GLY = he() ? GLY_HE : GLY_EN; d._t = setInterval(function () {
      i++; var out = ''; for (var k = 0; k < txt.length; k++) out += k < i / 2 ? txt[k] : txt[k] === ' ' ? ' ' : GLY[Math.floor(Math.random() * GLY.length)];
      sp.textContent = out; if (i / 2 >= txt.length) { clearInterval(d._t); sp.textContent = txt; }
    }, 28);
  }
  function placeLabels() {
    var W = stage.clientWidth, Hh = stage.clientHeight;
    LBL.forEach(function (s) {
      var m = cover(W, Hh, s.img[0], s.img[1]);
      s.els.forEach(function (d, i) {
        var x = m.ox + s.items[i][0] * m.dw, y = m.oy + s.items[i][1] * m.dh;
        d.style.left = x + 'px'; d.style.top = y + 'px'; d.classList.toggle('flip', x > W * .55);
        d.hidden = x < 24 || x > W - 24 || y < 16 || y > Hh - 16;
      });
    });
    // the cove glow and the unit's lamp sit on the night photo's real spots
    var n = cover(W, Hh, 1600, 721), cv = $('.cove'), led = $('.led');
    cv.style.left = (n.ox + .31 * n.dw) + 'px'; cv.style.width = (.43 * n.dw) + 'px'; cv.style.top = (n.oy + .545 * n.dh) + 'px'; cv.style.height = (.07 * n.dh) + 'px';
    led.style.left = (n.ox + .504 * n.dw - 5) + 'px'; led.style.top = (n.oy + .25 * n.dh - 5) + 'px';
  }
  function showLabels(si) {
    LBL.forEach(function (s, k) {
      s.els.forEach(function (d, i) {
        var on = k === si; if (on === d.classList.contains('show')) return;
        d.classList.toggle('show', on); d.classList.toggle('on', on);
        clearTimeout(d._w);
        if (on) d._w = setTimeout(function () { decode(d, s.items[i][he() ? 2 : 3]); }, 240 + i * 260); else { clearInterval(d._t); $('span', d).textContent = ''; }
      });
    });
  }
  function buildTiles() {
    tilesBox.innerHTML = ''; tiles = []; tape.innerHTML = '';
    var W = stage.clientWidth, Hh = stage.clientHeight, m = cover(W, Hh, 1400, 1050), rows = 3, cols = phone() ? 2 : 3, rh = Hh / rows, cw = W / cols, joints = [];
    for (var r = 0; r < rows; r++) {
      var off = r % 2 ? cw / 2 : 0, xs = [0]; for (var c = 1; c <= cols; c++) { var x = c * cw - off; if (x > 0 && x < W) xs.push(x); } xs.push(W);
      for (var k = 0; k < xs.length - 1; k++) {
        var t = document.createElement('i'), x0 = xs[k], x1 = xs[k + 1], y0 = r * rh;
        t.style.cssText = 'left:' + (x0 - .5) + 'px;top:' + (y0 - .5) + 'px;width:' + (x1 - x0 + 1) + 'px;height:' + (rh + 1) + 'px;background-size:' + m.dw + 'px ' + m.dh + 'px;background-position:' + (m.ox - x0 + .5) + 'px ' + (m.oy - y0 + .5) + 'px';
        var ord = (rtl() ? (xs.length - 2 - k) : k) + r * (cols + 1);
        t.dataset.o = ord; tilesBox.appendChild(t); tiles.push(t);
        if (k > 0) joints.push([x0, y0, x0, y0 + rh]);
      }
      if (r > 0) joints.push([0, y0, W, y0]);
    }
    var max = tiles.reduce(function (a, t) { return Math.max(a, +t.dataset.o); }, 0);
    tiles.forEach(function (t) { t.dataset.th = (+t.dataset.o / (max + 1)).toFixed(3); });
    joints.forEach(function (j) { var l = document.createElementNS('http://www.w3.org/2000/svg', 'line'); l.setAttribute('x1', j[0]); l.setAttribute('y1', j[1]); l.setAttribute('x2', j[2]); l.setAttribute('y2', j[3]); var len = Math.hypot(j[2] - j[0], j[3] - j[1]); l.style.strokeDasharray = len; l.style.strokeDashoffset = len; l.dataset.len = len; tape.appendChild(l); });
  }
  function ceilRender(p) {
    // p in [0,1]: .08–.30 boards, .30–.40 tape, .44–.62 trowel, .70–.84 dimmer
    ceilP = p;
    var bp = (p - .08) / .22;
    tiles.forEach(function (t) { var u = smooth((bp - +t.dataset.th * .75) / .25); t.style.opacity = u > 0 ? Math.min(1, u * 1.6).toFixed(3) : '0'; t.style.transform = u < 1 ? 'translateY(' + ((1 - u) * 26).toFixed(1) + 'px) scale(' + (1 + (1 - u) * .04).toFixed(3) + ')' : ''; });
    var tp = smooth((p - .30) / .1), tf = 1 - smooth((p - .5) / .08);
    $$('line', tape).forEach(function (l) { l.style.strokeDashoffset = (+l.dataset.len * (1 - tp)).toFixed(1); l.style.opacity = (tf * .85).toFixed(3); });
    var w = smooth((p - .44) / .18), W = stage.clientWidth;
    lyK.style.clipPath = rtl() ? 'inset(0 0 0 ' + ((1 - w) * 100).toFixed(2) + '%)' : 'inset(0 ' + ((1 - w) * 100).toFixed(2) + '% 0 0)';
    var edge = rtl() ? (1 - w) * W : w * W;
    trowel.style.opacity = w > 0 && w < 1 ? '1' : '0';
    trowel.style.transform = 'translateX(' + (edge - trowel.offsetWidth / 2).toFixed(1) + 'px)';
    var dim = smooth((p - .7) / .14);
    kImg.style.filter = dim > 0 ? 'brightness(' + (1 - dim * .55).toFixed(3) + ')' : '';
    lyN.style.opacity = smooth((p - .76) / .08).toFixed(3);
    ceil.classList.toggle('lit', p > .8);
    var si = p < .27 ? 0 : p < .53 ? 1 : p < .8 ? 2 : 3;
    setStage(si);
    fill.style.setProperty('--cp', clamp(p / .95, 0, 1).toFixed(3));
  }
  function setStage(si) {
    if (si === curStage) return; curStage = si;
    steps.forEach(function (s, i) { s.classList.toggle('on', i === si); });
    screws.forEach(function (s, i) { s.classList.toggle('on', i <= si); s.setAttribute('aria-current', i === si ? 'step' : 'false'); });
    showLabels(si);
  }
  function stillRender() { ceilRender(STOPS[stillStage]); }
  function goStage(i) {
    i = clamp(i, 0, 3);
    if (still()) { stillStage = i; stillRender(); return; }
    var r = ceil.getBoundingClientRect(), top = scrollY + r.top, span = ceil.offsetHeight - innerHeight;
    scrollTo({ top: top + span * STOPS[i], behavior: 'smooth' });
  }
  screws.forEach(function (b, i) { b.addEventListener('click', function () { goStage(i); }); });
  $('[data-cprev]').addEventListener('click', function () { goStage(curStage - 1); });
  $('[data-cnext]').addEventListener('click', function () { goStage(curStage + 1); });

  // ---------------------------------------------------------------- bento: spotlight, kelvin slider
  var svc = $('#services');
  watch(svc, function (v) { svc.classList.toggle('on', v); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  function kelvin(k) { // Tanner Helland approximation
    var t = k / 100, r, g, b;
    r = t <= 66 ? 255 : 329.7 * Math.pow(t - 60, -.1332);
    g = t <= 66 ? 99.47 * Math.log(t) - 161.12 : 288.12 * Math.pow(t - 60, -.0755);
    b = t >= 66 ? 255 : t <= 19 ? 0 : 138.52 * Math.log(t - 10) - 305.04;
    return 'rgb(' + [r, g, b].map(function (v) { return Math.round(clamp(v, 0, 255)); }).join(',') + ')';
  }
  var kin = $('[data-kelin]'), kv = $('[data-kelv]'), kroom = $('[data-kelroom]');
  function kel() { kv.textContent = kin.value + 'K'; kroom.style.setProperty('--k', kelvin(+kin.value)); }
  kin.addEventListener('input', function () { kin._touched = true; kel(); }); kel();
  // until someone touches it, the slider sweeps slowly through warm and cool while the tile is in view
  var kelOn = false; watch(kroom, function (v) { kelOn = v; });
  setInterval(function () { if (!kelOn || still() || kin._touched) return; var t = performance.now() / 1000; kin.value = Math.round((4600 + 1900 * Math.sin(t * .5)) / 100) * 100; kel(); }, 120);

  // ---------------------------------------------------------------- work: prints dealt from a stack, then opened full screen
  var work = $('[data-work]'), prBox = $('[data-prints]'), prints = $$('[data-print]'), ROT = [-6, 4, -3, 5, -4, 3];
  function dealPrints(e) {
    var bw = prBox.clientWidth, bh = prBox.clientHeight;
    prints.forEach(function (p, i) {
      if (e >= 1) { p.style.transform = ''; return; }
      var cx = p.offsetLeft + p.offsetWidth / 2, cy = p.offsetTop + p.offsetHeight / 2;
      var u = smooth((e - i * .07) / .6), dx = (bw / 2 - cx) * (1 - u), dy = (bh * .3 - cy) * (1 - u);
      p.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) rotate(' + (ROT[i] * (1 - u)).toFixed(2) + 'deg) scale(' + lerp(.8, 1, u).toFixed(3) + ')';
      p.style.zIndex = u < 1 ? 10 - i : '';
    });
  }
  var lb = $('[data-lb]'), lbImg = $('[data-lbimg]'), lbCap = $('[data-lbcap]');
  prints.forEach(function (p) {
    p.addEventListener('click', function () {
      var im = $('img', p); lbImg.src = im.src; lbImg.alt = im.alt; lbCap.textContent = $('.pc span[lang="' + root.lang + '"]', p).textContent;
      if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
      if (!still() && lbImg.animate) {
        var r = p.getBoundingClientRect(), r2 = lbImg.getBoundingClientRect();
        if (r2.width) lbImg.animate([{ transform: 'translate(' + (r.left + r.width / 2 - r2.left - r2.width / 2) + 'px,' + (r.top + r.height / 2 - r2.top - r2.height / 2) + 'px) scale(' + (r.width / r2.width) + ')', opacity: .6 }, { transform: 'none', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.23,1,.32,1)' });
      }
    });
  });
  function closeLb() { if (lb.close) lb.close(); else lb.removeAttribute('open'); }
  $('[data-lbx]').addEventListener('click', closeLb);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });

  // ---------------------------------------------------------------- remote: the live message to Shahar
  var modes = $$('[data-mode]'), wheres = $$('[data-where]'), roomsEl = $('[data-rooms]'), msgEl = $('[data-msg]'), send = $('[data-send]'), stepsEl = $$('[data-step]');
  var rooms = 2, shown = '', typing = 0, chatSeen = false;
  function lightStep(n) { stepsEl.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  modes.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); lightStep(0); write(); }); });
  wheres.forEach(function (b) { b.addEventListener('click', function () { wheres.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lightStep(1); write(); }); });
  $('[data-rminus]').addEventListener('click', function () { rooms = Math.max(1, rooms - 1); roomsEl.textContent = rooms; lightStep(1); write(); });
  $('[data-rplus]').addEventListener('click', function () { rooms = Math.min(9, rooms + 1); roomsEl.textContent = rooms; lightStep(1); write(); });
  send.addEventListener('pointerenter', function () { lightStep(2); }); send.addEventListener('focus', function () { lightStep(2); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = modes.filter(function (n) { return n.getAttribute('aria-pressed') === 'true'; }).map(function (n) { return n.dataset[l ? 'he' : 'en']; });
    var w = wheres.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], place = w.dataset[l ? 'he' : 'en'];
    var rm = l ? (rooms === 1 ? 'בחדר אחד' : 'ב-' + rooms + ' חדרים') : (rooms === 1 ? 'one room' : rooms + ' rooms');
    return l ? 'שלום שחר, אשמח לפרטים על ' + (picked.length ? list(picked, true) : 'מיזוג וגבס') + '. מדובר ' + rm + ', ' + place + '.'
             : 'Hi Shahar, I’d like details about ' + (picked.length ? list(picked, false) : 'AC and drywall work') + '. It’s ' + rm + ', ' + place + '.';
  }
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 16);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-rc]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- odometer
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 6) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- footer petals in the logo's colours, rising like warm air
  var foot = $('[data-foot]');
  var petals = (function () {
    var cv = $('[data-petals]'), c = cv.getContext('2d'), P = [], W, Hh, raf = 0, vis = false, last = 0;
    var COL = ['#d9473f', '#e98a6c', '#e57a3c', '#e7a7a3', '#8a3446', '#7fb8b4', '#efc49a'];
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); W = foot.clientWidth; Hh = foot.clientHeight; cv.width = W * dpr; cv.height = Hh * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function add(y) { P.push({ x: Math.random() * W, y: y == null ? Hh + 20 : y, r: 6 + Math.random() * 12, a: Math.random() * 6.28, va: (Math.random() - .5) * .8, vy: 14 + Math.random() * 24, sw: Math.random() * 6.28, col: COL[Math.floor(Math.random() * COL.length)] }); }
    function draw(p) { c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.globalAlpha = .32 * clamp(p.y / Hh * 1.6, 0, 1); c.fillStyle = p.col; c.beginPath(); c.ellipse(0, 0, p.r * .45, p.r, 0, 0, 6.283); c.fill(); c.restore(); }
    function frame(t) {
      raf = 0; var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      c.clearRect(0, 0, W, Hh);
      var want = phone() ? 22 : 44;
      if (still()) { if (!P.length) for (var k = 0; k < want; k++) add(Math.random() * Hh); P.forEach(draw); last = 0; return; }
      while (P.length < want) add(P.length < want / 2 && !t ? Math.random() * Hh : null);
      for (var i = P.length - 1; i >= 0; i--) { var p = P[i]; p.y -= p.vy * dt; p.sw += dt; p.x += Math.sin(p.sw) * 10 * dt; p.a += p.va * dt; if (p.y < -30) P.splice(i, 1); else draw(p); }
      if (vis) raf = requestAnimationFrame(frame); else last = 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    watch(foot, function (v) { vis = v; if (v) { if (!P.length) for (var k = 0; k < (phone() ? 22 : 44); k++) add(Math.random() * Hh); kick(); } });
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var revs = $('[data-revs]'), rvs = $$('.rv', revs), kwrap = $('.k-wrap'), kph = $('[data-kphoto]'), rowsEl = $$('[data-rows] > *'), cove = $('.f-cove'), thermo = $('[data-thermo]');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function clearStyles() {
    boardEls.forEach(function (b) { b.style.transform = ''; });
    prints.forEach(function (p) { p.style.transform = ''; p.style.zIndex = ''; });
    rvs.forEach(function (r) { r.style.transform = ''; r.style.opacity = ''; });
    rowsEl.forEach(function (r) { r.style.opacity = ''; r.style.transform = ''; });
    ['--pt', '--pb', '--pl', '--pr', '--prr', '--fr'].forEach(function (k) { kph.style.removeProperty(k); });
    curStage = -1;
  }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // boards close the hero
    if (!calm) {
      var hr = hero.getBoundingClientRect(), pp = clamp(-hr.top / (hr.height * .7), 0, 1);
      boardEls.forEach(function (b) { var u = smooth((pp - +b.dataset.th) / .3); b.style.transform = 'translateY(' + ((1 - u) * 102).toFixed(2) + '%)'; });
    }
    // ceiling stages
    if (calm) stillRender(); else ceilRender(prog(ceil));
    // prints
    if (calm) dealPrints(1); else { var wr = work.getBoundingClientRect(); dealPrints(clamp((vh - wr.top) / (vh * 1.05), 0, 1)); }
    // reviews slide out of the diffuser
    var rr = revs.getBoundingClientRect(), rp = calm ? 1 : clamp((vh * .95 - rr.top) / (vh * .9), 0, 1);
    rvs.forEach(function (rv, i) {
      if (calm) return;
      var u = smooth((rp - .25 - i * .1) / .35);
      rv.style.transform = u < 1 ? 'translateY(' + (-(1 - u) * 104).toFixed(2) + '%)' : '';
      rv.style.opacity = u > 0 ? '1' : '0';
    });
    // contact: the photo shrinks into a hatch frame, the rows rise
    if (!calm) {
      var kp = prog(kwrap), s2 = smooth(kp / .5), PW = kph.parentNode.clientWidth, PH = kph.parentNode.clientHeight, t1, b1, st, en;
      if (innerWidth <= 860) { t1 = 84; b1 = PH * .56; st = 16; en = 16; } else { t1 = PH * .16; b1 = PH * .16; st = Math.max(PW * .52, 560); en = PW * .05; }
      var L = rtl() ? en : st, R = rtl() ? st : en;
      kph.style.setProperty('--pt', (t1 * s2).toFixed(1) + 'px'); kph.style.setProperty('--pb', (b1 * s2).toFixed(1) + 'px');
      kph.style.setProperty('--pl', (L * s2).toFixed(1) + 'px'); kph.style.setProperty('--pr', (R * s2).toFixed(1) + 'px');
      kph.style.setProperty('--prr', (14 * s2).toFixed(1) + 'px'); kph.style.setProperty('--fr', s2.toFixed(3));
      rowsEl.forEach(function (r, i) { var v = smooth((s2 - .55 - i * .06) / .16); r.style.opacity = v.toFixed(3); r.style.transform = v >= 1 ? '' : 'translateY(' + ((1 - v) * 26).toFixed(1) + 'px)'; });
    }
    // footer cove light rises
    var fr = foot.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / Math.max(1, fr.height));
    cove.style.setProperty('--rise', ((1 - fp) * 60).toFixed(1) + 'px');
    // the thermostat steps aside on the contact rows, where the same buttons are
    var kr = kwrap.getBoundingClientRect();
    thermo.classList.toggle('hide', kr.top < vh * .2 && kr.bottom > vh * .9);
  }

  var spotTile = $('.t-spot .t-ph'), cones = $$('.cone'), SPOTS = [[.648, .44], [.777, .457], [.867, .47], [.966, .486]];
  function placeCones() { var W = spotTile.clientWidth, Hh = spotTile.clientHeight, m = cover(W, Hh, 1100, 825); cones.forEach(function (c, i) { c.style.left = (m.ox + SPOTS[i][0] * m.dw) + 'px'; c.style.top = (m.oy + SPOTS[i][1] * m.dh) + 'px'; c.style.width = (m.dw * .12) + 'px'; c.style.height = (Hh * .9) + 'px'; }); }
  function layout() { placeCones(); hatch.size(); buildBoards(); buildTiles(); placeLabels(); airs.forEach(function (a) { a.size(); }); petals.size(); curStage = -1; tick(); }
  var rz, lastW = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); lastW = innerWidth; }, 140); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); hatch.size(); hatch.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1000);
  addEventListener('load', function () { layout(); });
})();
