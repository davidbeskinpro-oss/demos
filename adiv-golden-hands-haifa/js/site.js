(function () {
  var root = document.documentElement, WA = '972525329595';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var TITLE = { he: 'אדיב ידי זהב · חגי, הנדימן בחיפה · שדרות מוריה 117א', en: 'Adiv Golden Hands · Hagai, handyman in Haifa · 117A Moriah Blvd' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור אדיב ידי זהב · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Adiv Yedei Zahav · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-l-he]').forEach(function (i) { i.setAttribute('aria-label', i.dataset[l === 'he' ? 'lHe' : 'lEn']); });
    $$('[data-ph-he]').forEach(function (i) { i.placeholder = i.dataset[l === 'he' ? 'phHe' : 'phEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'אדיב ידי זהב', 'Adiv Golden Hands');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-jobs]', 'מה צריך?', 'What’s needed?');
    aria('[data-t-call]', 'להתקשר לחגי, 052-532-9595', 'Call Hagai, 052-532-9595');
    aria('[data-t-wa]', 'וואטסאפ לחגי', 'WhatsApp Hagai');
    $$('[data-lbl]').forEach(function (b) { b.textContent = labelText(b, b.classList.contains('after')); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('adiv-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('adiv-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    if (!on) $$('[data-pair]').forEach(function (p, i) { p.style.setProperty('--w', $('[data-rng]', p).value / 100); });
    layout(); drum.kick(); bubbles.kick(); tapeKick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = window.__hours || { 0: [7, 17], 1: [7, 17], 2: [7, 17], 3: [7, 17], 4: [7, 17], 5: [7, 17], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    var allDay = function (x) { return x && x[0] === 0 && x[1] === 24; };
    if (allDay(t)) { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : allDay(H[nd]) ? (l ? 'סגור עכשיו · פתוח ביום ' + dayHe[nd] + ' 24 שעות' : 'Closed now · open 24 hours on ' + dayEn[nd])
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
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
  $$('.bento,.cbento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 70 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  // living drawings only run while their section is on screen
  $$('[data-svc],.reach').forEach(function (s) { watch(s, function (v) { s.classList.toggle('on', v); }); });

  // headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 10 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]');
  var logoImg = new Image(); logoImg.src = $('.brand .badge img').src;
  // a long name never pushes the headline past its column: shrink it to fit (words stay whole)
  function fitTitle() {
    var t = $('.h-title'); if (!t) return; t.style.fontSize = '';
    var cw = t.clientWidth, sw = t.scrollWidth;
    if (sw > cw + 1) t.style.fontSize = Math.floor(parseFloat(getComputedStyle(t).fontSize) * cw / sw) + 'px';
  }
  fitTitle(); addEventListener('resize', fitTitle); if (document.fonts) document.fonts.ready.then(fitTitle);
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', fitTitle); });

  // ---------------------------------------------------------------- intro: his logo assembles from its own pixels while the green arc fills
  var intro = $('[data-intro]');
  function heroReady() { requestAnimationFrame(function () { hero.classList.add('ready'); drum.deal(); }); }
  (function () {
    var seen = false; try { seen = sessionStorage.getItem('adiv-intro') === '1'; } catch (e) {}
    if (still() || seen || !intro) { if (intro) intro.hidden = true; return; }
    try { sessionStorage.setItem('adiv-intro', '1'); } catch (e) {}
    var cv = $('[data-introcv]'), c = cv.getContext('2d'), gauge = $('[data-gauge]'), pct = $('[data-pct]'), P = [], t0 = 0, done = false, introBg, W, Hh, S, ox, oy;
    function finish() { if (done) return; done = true; intro.classList.add('done'); heroReady(); setTimeout(function () { intro.hidden = true; }, 900); }
    intro.addEventListener('click', finish);
    setTimeout(finish, 1700);   // never holds the page longer than this
    function start() {
      var dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; Hh = innerHeight; cv.width = W * dpr; cv.height = Hh * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = $('.gauge', intro).getBoundingClientRect().width * .8; ox = (W - S) / 2; oy = (Hh - S) / 2;
      try {
        var n = 160, sc = document.createElement('canvas'); sc.width = sc.height = n; var sx = sc.getContext('2d'); sx.drawImage(logoImg, 0, 0, n, n);
        var d = sx.getImageData(0, 0, n, n).data;
        for (var y = 0; y < n; y += 1) for (var x = 0; x < n; x += 1) {
          var k = (y * n + x) * 4; if (d[k] > 200 && d[k + 1] > 200 && d[k + 2] > 200) continue;   // the light background and highlights sit on the white disc anyway
          if (Math.random() > (phone() ? .35 : .55)) continue;
          var a = Math.random() * 6.28, rr = Math.max(W, Hh) * (.4 + Math.random() * .4);
          P.push({ hx: x / n, hy: y / n, col: 'rgb(' + d[k] + ',' + d[k + 1] + ',' + d[k + 2] + ')', sx: W / 2 + Math.cos(a) * rr, sy: Hh / 2 + Math.sin(a) * rr, dl: Math.random() * .35 });
        }
      } catch (e) { P = []; }
      introBg = getComputedStyle(intro).backgroundColor || '#18213b'; t0 = performance.now(); requestAnimationFrame(frame);
    }
    function frame(t) {
      if (done) return;
      var T = (t - t0) / 1000, g = clamp(T / 1.1, 0, 1);
      gauge.style.strokeDashoffset = (578 * (1 - smooth(g))).toFixed(1);
      pct.textContent = Math.round(smooth(g) * 100);
      c.globalAlpha = 1; c.fillStyle = introBg; c.fillRect(0, 0, W, Hh);   // an opaque ground, so the multiplied logo has something to melt into
      var disc = smooth((T - .5) / .5);
      if (disc > 0) { c.globalAlpha = disc; c.fillStyle = '#fff'; c.beginPath(); c.arc(W / 2, Hh / 2, S / 2 * 1.06, 0, 6.29); c.fill(); }
      var px = Math.max(1.6, S / 160 * 1.25);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], e = smooth((T - p.dl) / .75), x = lerp(p.sx, ox + p.hx * S, e), y = lerp(p.sy, oy + p.hy * S, e);
        c.globalAlpha = .35 + .65 * e; c.fillStyle = e < .98 ? (i % 3 ? p.col : '#ffe39a') : p.col; c.fillRect(x, y, px, px);
      }
      var crisp = smooth((T - 1.05) / .25);
      if (crisp > 0 && logoImg.complete) { c.save(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = crisp; c.drawImage(logoImg, ox, oy, S, S); c.restore(); }   // multiply: the jpg's white square melts into the dark, the logo itself is untouched on its white disc
      c.globalAlpha = 1;
      if (T > 1.4) { finish(); return; }
      requestAnimationFrame(frame);
    }
    if (logoImg.complete && logoImg.naturalWidth) start(); else { logoImg.addEventListener('load', start, { once: true }); logoImg.addEventListener('error', finish, { once: true }); }
  })();

  // ---------------------------------------------------------------- the sign's bubbles drift up and part under the hand; a tap blows new ones
  var bubbles = (function () {
    var cv = $('[data-bubbles]'), c = cv.getContext('2d'), B = [], w, h, raf = 0, vis = true, mx = -999, my = -999, last = 0;
    var spr = document.createElement('canvas'); spr.width = spr.height = 64;
    // a glass water bubble like the ones printed on his sign: clear middle, bright rim, a window highlight
    (function () {
      var s = spr.getContext('2d'), g = s.createRadialGradient(32, 32, 4, 32, 32, 31);
      g.addColorStop(0, 'rgba(90,140,240,.06)'); g.addColorStop(.7, 'rgba(110,160,255,.22)'); g.addColorStop(.95, 'rgba(170,205,255,.6)'); g.addColorStop(1, 'rgba(170,205,255,0)');
      s.fillStyle = g; s.beginPath(); s.arc(32, 32, 31, 0, 6.29); s.fill();
      s.strokeStyle = 'rgba(225,238,255,.7)'; s.lineWidth = 1.4; s.beginPath(); s.arc(32, 32, 29.5, 0, 6.29); s.stroke();
      s.fillStyle = 'rgba(255,255,255,.9)'; s.beginPath(); s.ellipse(22, 19, 7, 4, -.6, 0, 6.29); s.fill();
      s.fillStyle = 'rgba(255,255,255,.45)'; s.beginPath(); s.arc(42, 44, 2.6, 0, 6.29); s.fill();
    })();
    function make(x, y, r, burst) { return { x: x, y: y, r: r, vx: burst ? (Math.random() - .5) * 3 : 0, vy: -(burst ? 1.2 + Math.random() : .25 + Math.random() * .45), ph: Math.random() * 6.28, gold: !burst && Math.random() < .28 }; }
    function seed() { B = []; var n = phone() ? 22 : 40; for (var i = 0; i < n; i++) B.push(make(Math.random() * w, Math.random() * h, 3 + Math.random() * Math.random() * 22)); }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); seed(); draw(); }
    function draw() {
      c.clearRect(0, 0, w, h);
      B.forEach(function (b) {
        if (b.gold) { c.globalAlpha = .55 + .45 * Math.sin(b.ph * 3); c.fillStyle = '#ffe39a'; c.beginPath(); c.arc(b.x, b.y, Math.max(1.2, b.r * .12), 0, 6.29); c.fill(); }
        else { c.globalAlpha = .8; c.drawImage(spr, b.x - b.r, b.y - b.r, b.r * 2, b.r * 2); }
      });
      c.globalAlpha = 1;
    }
    function frame(t) {
      raf = 0; if (!vis || still()) { draw(); return; }
      var dt = last ? Math.min(3, (t - last) / 16.7) : 1; last = t;
      for (var i = B.length - 1; i >= 0; i--) {
        var b = B[i]; b.ph += .02 * dt;
        var dx = b.x - mx, dy = b.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 16000) { var f = (16000 - d2) / 16000 * .9, dd = Math.sqrt(d2) || 1; b.vx += dx / dd * f; b.vy += dy / dd * f * .5; }
        b.vx *= .94; b.x += (b.vx + Math.sin(b.ph) * .35) * dt; b.y += b.vy * dt; if (b.vy < -.25 && !b.burst) b.vy += (-.4 - b.vy) * .02;
        if (b.y < -30) { if (b.tmp) { B.splice(i, 1); continue; } b.y = h + 30; b.x = Math.random() * w; b.vy = -(.25 + Math.random() * .45); }
      }
      draw(); raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) {
      if (still() || e.target.closest('a,button,[data-drumwrap]')) return;
      var r = hero.getBoundingClientRect();
      for (var i = 0; i < 9; i++) { var b = make(e.clientX - r.left, e.clientY - r.top, 3 + Math.random() * 12, true); b.tmp = true; B.push(b); }
    });
    watch(hero, function (v) { vis = v; kick(); });
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- the drum: his photos turn like slats on a shutter roll
  var drum = (function () {
    var wrap = $('[data-drumwrap]'), el = $('[data-drum]'), cards = $$('.dc', el), N = cards.length, step = 360 / N;
    var rot = 0, vel = 0, drag = false, ly = 0, moved = 0, raf = 0, vis = true, last = 0, dealT = -1;
    function R() { var ch = cards[0].offsetHeight || 200; return ch * 1.08 / (2 * Math.tan(Math.PI / N)); }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; c.style.opacity = ''; }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (9 + vel) * dt; vel *= .95; }
      var r = R(), e = dealT < 0 ? 0 : smooth((t - dealT) / 1100), sc = scrollY * .09;
      cards.forEach(function (c, i) {
        var a = ((rot + sc) * e + i * step * e) % 360, f = Math.cos(a * Math.PI / 180), lift = f > .96 ? (f - .96) * 25 : 0;
        c.style.transform = 'rotateX(' + a.toFixed(2) + 'deg) translateZ(' + (r * lerp(.55, 1, e) + lift * 30).toFixed(1) + 'px) scale(' + (lerp(.82, 1, e) + lift * .05).toFixed(3) + ')';
        c.style.filter = 'brightness(' + (.28 + .72 * Math.pow(Math.max(f, 0), 1.8)).toFixed(3) + ')';
        c.style.zIndex = Math.round(f * 100) + 100;
        c.style.opacity = (phone() ? smooth((f - .3) / .45) : smooth((f + .15) / .5)).toFixed(3);   // the roll fades where it turns away
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    el.style.transform = 'rotateY(' + (rtl() ? 8 : -8) + 'deg)';
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = e.pointerType === 'mouse'; ly = e.clientY; moved = 0; if (drag) wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dy = e.clientY - ly; ly = e.clientY; moved += Math.abs(dy); rot -= dy * .3; vel = -dy * 3; });
    addEventListener('pointerup', function (e) { if (drag) { drag = false; wrap.classList.remove('drag'); } });
    wrap.addEventListener('click', function () { if (!still() && moved < 6) vel += 160; });   // a tap gives the roll a turn
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { kick: kick, deal: function () { if (dealT < 0) dealT = performance.now(); kick(); } };
  })();

  // ---------------------------------------------------------------- the tape measure: marks, numbers and his services, running with the scroll
  var tape = $('[data-tape]'), blade = $('[data-blade]'), tapeW = 0, tapeVis = false, tapeRaf = 0, tapeT0 = performance.now();
  var JOBS = { he: ['תריסים', 'אינסטלציה', 'ניאגרות סמויות', 'דוודים', 'תלייה', 'תאורה', 'הרכבת רהיטים', 'ידיות אחיזה', 'רשתות נגד יתושים', 'חבלי כביסה'], en: ['Shutters', 'Plumbing', 'Concealed cisterns', 'Water heaters', 'Hanging', 'Lighting', 'Furniture assembly', 'Grab bars', 'Insect screens', 'Washing lines'] };
  function buildTape() {
    var list = JOBS[he() ? 'he' : 'en'], html = '';
    for (var k = 0; k < 2; k++) for (var i = 0; i < list.length; i++) {
      var cm = (i + 1) * 10;
      html += '<div class="seg" style="width:' + (Math.max(220, list[i].length * 11 + 90)) + 'px"><b' + (i % 2 ? '' : ' class="red"') + '>' + cm + '</b><span>' + list[i] + '</span></div>';
    }
    blade.innerHTML = html; tapeW = blade.scrollWidth / 2;
  }
  function placeTape(t) {
    if (still()) { blade.style.transform = ''; return; }
    var x = (scrollY * .6 + (t - tapeT0) * .02) % tapeW;
    blade.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,0,0)';
  }
  function tapeLoop(t) { tapeRaf = 0; placeTape(t); if (tapeVis && !still()) tapeRaf = requestAnimationFrame(tapeLoop); }
  function tapeKick() { if (!tapeRaf) tapeRaf = requestAnimationFrame(tapeLoop); }
  watch(tape, function (v) { tapeVis = v; if (v) tapeKick(); });

  // ---------------------------------------------------------------- before / after: golden seam, landing cards, a lens to peek at the before
  var ba = $('[data-ba]'), pairs = $$('[data-pair]'), idx = $$('[data-baindex] li');
  var GLYPH = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHJKLMNPRSTUVWXYZ' };
  function labelText(b, after) { return b.dataset[he() ? 'he' : 'en'].split('|')[after ? 1 : 0]; }
  function decode(b, after) {
    if (b.classList.contains('after') === after && b._done) return;
    b._done = true; b.classList.toggle('after', after);
    var target = labelText(b, after); clearInterval(b._t);
    if (still()) { b.textContent = target; return; }
    var n = 0, g = GLYPH[he() ? 'he' : 'en'];
    b._t = setInterval(function () {
      n++; b.textContent = target.split('').map(function (ch, i) { return i < n - 3 ? ch : g[Math.floor(Math.random() * g.length)]; }).join('');
      if (n - 3 >= target.length) { clearInterval(b._t); b.textContent = target; }
    }, 40);
  }
  pairs.forEach(function (p) {
    var rng = $('[data-rng]', p), lbl = $('[data-lbl]', p), hold = 0, sx = 0, sy = 0;
    p.style.setProperty('--w', still() ? .5 : 0);
    rng.addEventListener('input', function () { p.style.setProperty('--w', rng.value / 100); decode(lbl, rng.value > 50); });
    function lens(e) { var r = p.getBoundingClientRect(); p.style.setProperty('--lx', (e.clientX - r.left) + 'px'); p.style.setProperty('--ly', (e.clientY - r.top) + 'px'); }
    p.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'mouse') { if (still()) return; p.classList.add('peek'); lens(e); return; }
      if (hold && (Math.abs(e.clientX - sx) > 12 || Math.abs(e.clientY - sy) > 12)) { clearTimeout(hold); hold = 0; }
      if (p.classList.contains('peek')) lens(e);
    });
    p.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') p.classList.remove('peek'); });
    p.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' || still()) return;
      sx = e.clientX; sy = e.clientY; lens(e);
      hold = setTimeout(function () { hold = 0; p.classList.add('peek'); }, 220);
    });
    ['pointerup', 'pointercancel'].forEach(function (ev) { p.addEventListener(ev, function (e) { if (e.pointerType === 'mouse') return; clearTimeout(hold); hold = 0; p.classList.remove('peek'); }); });
    p.addEventListener('contextmenu', function (e) { if (p.classList.contains('peek')) e.preventDefault(); });
  });
  function paintBA(p) {
    var N = pairs.length, seg = 1 / N, lands = [];
    pairs.forEach(function (pr, k) { lands[k] = k === 0 ? 1 : smooth((p - (k * seg - .05)) / .12); });
    var cur = 0;
    pairs.forEach(function (pr, k) {
      var w = smooth((p - (k * seg + (k ? .07 : .02))) / (seg - (k ? .13 : .08))), above = 0;
      for (var j = k + 1; j < N; j++) above += lands[j];
      if (lands[k] > .5) cur = k;
      pr.style.setProperty('--w', w.toFixed(4));
      pr.style.transform = 'translate3d(0,' + ((1 - lands[k]) * innerHeight * .95 - Math.min(above, 3) * 10).toFixed(1) + 'px,0) rotate(' + ((1 - lands[k]) * (k % 2 ? -5 : 5)).toFixed(2) + 'deg) scale(' + (1 - Math.min(above, 3) * .045).toFixed(3) + ')';
      pr.style.filter = above > .01 ? 'brightness(' + (1 - Math.min(above, 3) * .2).toFixed(3) + ')' : '';
      pr.style.zIndex = k + 1;
      decode($('[data-lbl]', pr), w > .5);
    });
    idx.forEach(function (li, k) { li.classList.toggle('on', k === cur); li.style.setProperty('--f', smooth((p - (k * seg + (k ? .07 : .02))) / (seg - (k ? .13 : .08))).toFixed(3)); });
  }

  // ---------------------------------------------------------------- the shutter and Hagai's gate
  var shutter = $('[data-shutter]'), curtain = $('[data-curtain]'), who = $('[data-who]'), wphoto = $('[data-wphoto]'), wimg = $('[data-wimg]'), wcopy = $('[data-wcopy]');
  function focusOrigin(z) {
    var W = wphoto.clientWidth, Hh = wphoto.clientHeight, iw = 1600, ih = 900, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s;
    var pos = phone() ? .66 : .62, ox = (W - dw) * pos, oy = (Hh - dh) * .5;
    wimg.style.objectPosition = (pos * 100) + '% 50%';
    wimg.style.transformOrigin = (ox + dw * .705).toFixed(1) + 'px ' + (oy + dh * .45).toFixed(1) + 'px';
    wimg.style.transform = 'scale(' + z.toFixed(4) + ')';
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
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- bento spotlight
  $$('.tile,.ct').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- the toolbox: trays open as it arrives, the note writes itself
  var box = $('[data-box]'), trays = $$('[data-tray]'), jobs = $$('[data-job]'), area = $('[data-area]'), msgEl = $('[data-msg]'), steps = $$('[data-step]'), send = $('[data-send]');
  var shown = '', typing = 0, noteSeen = false;
  function lightStep(n) { steps.forEach(function (s, i) { s.classList.toggle('on', i <= n); }); }
  jobs.forEach(function (j) { j.addEventListener('click', function () { j.setAttribute('aria-pressed', j.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); lightStep(area.value.trim() ? 1 : 0); write(); }); });
  area.addEventListener('input', function () { lightStep(1); write(); });
  ['pointerenter', 'focus', 'click'].forEach(function (ev) { send.addEventListener(ev, function () { lightStep(2); }); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = jobs.filter(function (j) { return j.getAttribute('aria-pressed') === 'true'; }).map(function (j) { return j.dataset[l ? 'he' : 'en']; });
    var where = area.value.trim().replace(/\s+/g, ' ');
    var a = l ? (picked.length ? 'שלום חגי, אשמח לעזרה עם ' + list(picked, true) + '.' : 'שלום חגי, אשמח לעזרה בבית.')
              : (picked.length ? 'Hi Hagai, I’d like help with ' + list(picked, false) + '.' : 'Hi Hagai, I’d like some help at home.');
    if (where) a += l ? ' איפה: ' + where + '.' : ' Where: ' + where + '.';
    return a;
  }
  function write(instant) {
    var target = compose();
    var href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    send.href = href;
    cancelAnimationFrame(typing);
    if (instant || still() || !noteSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch(box, function (v) { if (v && !noteSeen) { noteSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .35 });

  // reviews: a second copy of each row so the drift loops without a seam
  $$('[data-run]').forEach(function (r) { var run = $('.run', r), orig = $$('.rv', run), n = 0;
    while ($$('.rv', run).length < 6) { var d = orig[n++ % orig.length].cloneNode(true); d.classList.add('dup'); d.setAttribute('aria-hidden', 'true'); run.appendChild(d); }   // enough cards to fill a wide screen
    var k = run.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $$('a,button', k).forEach(function (x) { x.tabIndex = -1; }); r.appendChild(k); });

  var farc = $('[data-farc]');

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    hero.style.setProperty('--ar', calm ? '0deg' : (-scrollY * .03).toFixed(2) + 'deg');
    if (!calm) { drum.kick(); bubbles.kick(); placeTape(performance.now()); }
    // before / after
    if (!calm) paintBA(prog(ba));
    else pairs.forEach(function (pr) { pr.style.transform = ''; pr.style.filter = ''; });
    // the shutter comes down as Hagai's section arrives, holds a beat, and rolls back up into its box
    var wr = who.getBoundingClientRect(), c = 0, pw = calm ? 1 : prog(who);
    if (!calm) {
      if (wr.top > 0) c = smooth(1 - wr.top / vh);
      else c = pw < .05 ? 1 : 1 - smooth((pw - .05) / .17);
      if (wr.bottom < 0) c = 0;
    }
    shutter.classList.toggle('on', c > .001);
    curtain.style.transform = 'translate3d(0,' + ((c - 1) * 100).toFixed(3) + '%,0)';
    // the framed photo opens to the whole screen while the camera walks up to the sign
    if (!calm) {
      var o = smooth((pw - .2) / .42), z = lerp(1, phone() ? 1.45 : 1.5, smooth((pw - .26) / .6));
      var f = phone() ? [9, 5, 47, 5] : (rtl() ? [12, 48, 12, 5] : [12, 5, 12, 48]);
      wphoto.style.setProperty('--pt', (f[0] * (1 - o)).toFixed(2) + '%'); wphoto.style.setProperty('--pr', (f[1] * (1 - o)).toFixed(2) + '%');
      wphoto.style.setProperty('--pb', (f[2] * (1 - o)).toFixed(2) + '%'); wphoto.style.setProperty('--pl', (f[3] * (1 - o)).toFixed(2) + '%');
      wphoto.style.setProperty('--pr2', (28 * (1 - o)).toFixed(1) + 'px');
      wphoto.style.setProperty('--sx', lerp(10, 90, pw).toFixed(1) + '%');
      wcopy.style.setProperty('--glass', smooth((o - .45) / .4).toFixed(3));
      focusOrigin(z);
    } else { wimg.style.transform = ''; wcopy.style.removeProperty('--glass'); }
    // toolbox trays open as the box arrives
    var br = box.getBoundingClientRect(), bt = calm ? 1 : smooth((vh - br.top) / (vh * .65));
    trays.forEach(function (tr, i) {
      if (calm) { tr.style.transform = ''; tr.style.opacity = ''; return; }
      var k = smooth((bt - i * .22) / .62);
      tr.style.transform = k >= 1 ? '' : 'rotateX(' + ((1 - k) * 72).toFixed(2) + 'deg) translateY(' + ((1 - k) * -18).toFixed(1) + 'px)';
      tr.style.opacity = (.25 + .75 * k).toFixed(3);
    });
    // the footer arc rises as you arrive
    var fr = farc.parentNode.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / fr.height);
    farc.style.setProperty('--rise', ((1 - fp) * 140).toFixed(1) + 'px');
  }

  function layout() { bubbles.size(); buildTape(); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { if (innerWidth === lw && phone()) { tick(); return; } lw = innerWidth; clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  if (intro && intro.hidden) {
    var once = false, go = function () { if (once) return; once = true; heroReady(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    setTimeout(go, 600);
  }
  addEventListener('load', tick);
})();
