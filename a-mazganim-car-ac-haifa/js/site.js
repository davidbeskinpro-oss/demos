(function () {
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 760; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';
  var WA = '972528924016';
  var TITLE = { he: 'א. מזגנים · מיזוג אוויר לרכב · חלוצי התעשייה 14, חיפה', en: 'A. Mazganim · Car air-conditioning · 14 Halutzei HaTaasiya St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור א. מזגנים · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for A. Mazganim · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'א. מזגנים', 'A. Mazganim');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-call2]', 'התקשרו, 052-892-4016', 'Call, 052-892-4016');
    aria('[data-t-circuit]', 'מעגל מיזוג האוויר ברכב: מדחס, מעבה, שסתום התפשטות ומאייד', 'The car A/C loop: compressor, condenser, expansion valve and evaporator');
    aria('[data-t-gauge]', 'סט שעוני לחץ, ערכים להמחשה', 'A manifold gauge set, illustrative values');
    aria('[data-t-steps]', 'שלבי הבדיקה', 'Steps of the check');
    aria('.arw.prev', 'השלב הקודם', 'Previous step');
    aria('.arw.next', 'השלב הבא', 'Next step');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: חלוצי התעשייה 14, חיפה' : 'Map: 14 Halutzei HaTaasiya St, Haifa'; });
    $$('[data-decode],.gname').forEach(function (t) { t.textContent = t.dataset[l]; });
    var car = $('[data-car]'); if (car) car.placeholder = l === 'he' ? 'למשל: מאזדה 3, 2016' : 'e.g. Mazda 3, 2016';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('am-lang', l); } catch (e) {}
    texts(l); hours(); setStep(cur, true); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('am-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-wordmark]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-odo]').forEach(function (o) { roll(o, true); });
    layout(); air.kick(); breath.kick(); write(true); setStep(cur, true); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8, 16], 1: [8, 16], 2: [8, 16], 3: [8, 16], 4: [8, 16], 5: [8, 13], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח 24 שעות' : 'Open 24 hours'; }
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
  $$('.bento,.v-bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  $$('.r-cards .rc').forEach(function (c, i) { c.style.setProperty('--d', i * 160 + 'ms'); });
  $$('.sec-head [data-reveal]').forEach(function (c) { c.style.setProperty('--d', '0ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- letters: hero name falls in, footer name rises
  function split(sp, gap) {
    var i = 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(gap);
  }
  $$('[data-split] .ln > span[lang]').forEach(function (sp) { split(sp, ' '); });
  $$('[data-wordmark] > span[lang]').forEach(function (sp) { split(sp, '<span class="ch">&nbsp;</span>'); });
  var wm = $('[data-wordmark]');
  watch(wm, function (v) { if (v) wm.classList.add('in'); }, { threshold: .2 });
  function fitWordmark() {
    var sp = $('span[lang="' + root.lang + '"]', wm); if (!sp) return;
    wm.style.fontSize = '100px';
    var w = sp.getBoundingClientRect().width || 1, avail = wm.clientWidth;
    wm.style.fontSize = Math.min(260, Math.max(40, 100 * avail / w * .98)) + 'px';
  }

  // ---------------------------------------------------------------- glyph-decode labels on the loop diagram
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHKLMNPRSTVWXZ' };
  function decode(el, delay) {
    var fin = el.dataset[root.lang] || el.textContent, set = GL[root.lang], t0 = 0;
    if (still()) { el.textContent = fin; return; }
    function f(t) {
      if (!t0) t0 = t + delay;
      var k = clamp((t - t0) / 700, 0, 1), n = Math.floor(k * fin.length);
      el.textContent = fin.slice(0, n) + fin.slice(n).replace(/[^\s·]/g, function () { return set[Math.floor(Math.random() * set.length)]; });
      if (k < 1) requestAnimationFrame(f); else el.textContent = fin;
    }
    requestAnimationFrame(f);
  }
  var circ = $('.circuit');
  watch(circ, function (v) { if (v && !circ.dataset.done) { circ.dataset.done = 1; $$('[data-decode]', circ).forEach(function (e, i) { decode(e, 200 + i * 120); }); } }, { threshold: .3 });

  // ---------------------------------------------------------------- climate knob scale (18–32, like the knob in their photo)
  (function () {
    var g = $('[data-kscale]'); if (!g) return;
    for (var t = 18; t <= 32; t++) {
      var a = (-120 + (t - 18) / 14 * 240) * Math.PI / 180, r1 = 80, r2 = t % 2 ? 74 : 70;
      var ln = document.createElementNS(NS, 'line');
      ln.setAttribute('x1', 100 + Math.sin(a) * r1); ln.setAttribute('y1', 100 - Math.cos(a) * r1);
      ln.setAttribute('x2', 100 + Math.sin(a) * r2); ln.setAttribute('y2', 100 - Math.cos(a) * r2);
      ln.setAttribute('class', t < 22 ? 'c' : t > 28 ? 'h' : '');
      g.appendChild(ln);
      if (t === 18 || t === 25 || t === 32) {
        var tx = document.createElementNS(NS, 'text');
        tx.setAttribute('x', 100 + Math.sin(a) * 60); tx.setAttribute('y', 104 - Math.cos(a) * 60); tx.setAttribute('text-anchor', 'middle');
        tx.textContent = t; g.appendChild(tx);
      }
    }
  })();

  // ---------------------------------------------------------------- manifold gauges
  var SC = { lo: [-1, 10, 1, 2], hi: [-1, 35, 1, 5] };   // min, max, minor step, labelled step (bar)
  var ang = function (k, v) { var s = SC[k]; return -135 + (v - s[0]) / (s[1] - s[0]) * 270; };
  Object.keys(SC).forEach(function (k) {
    var g = $('[data-ticks="' + k + '"]'), s = SC[k];
    for (var v = s[0]; v <= s[1]; v += s[2]) {
      var a = ang(k, v) * Math.PI / 180, mj = v % s[3] === 0 || v === s[0];
      var ln = document.createElementNS(NS, 'line'), r1 = 124, r2 = mj ? 104 : 114;
      ln.setAttribute('x1', Math.sin(a) * r1); ln.setAttribute('y1', -Math.cos(a) * r1);
      ln.setAttribute('x2', Math.sin(a) * r2); ln.setAttribute('y2', -Math.cos(a) * r2);
      ln.setAttribute('class', (mj ? 'mj ' : '') + (v < 0 ? 'vac' : ''));
      g.appendChild(ln);
      if (mj) {
        var tx = document.createElementNS(NS, 'text');
        tx.setAttribute('x', Math.sin(a) * 88); tx.setAttribute('y', 5 - Math.cos(a) * 88); tx.setAttribute('text-anchor', 'middle');
        tx.textContent = v; g.appendChild(tx);
      }
    }
  });
  // illustrative readings (R134a): at rest both sides equalise; low charge reads low on both; vacuum below zero; charged and running
  var STEPS = [
    { lo: 4.8, hi: 4.8, vt: null },
    { lo: 1.0, hi: 8.5, vt: 21 },
    { lo: -0.95, hi: -0.95, vt: null },
    { lo: 2.2, hi: 14.5, vt: 6 }
  ];
  var cur = 0, shown = { lo: 0, hi: 0, vt: null }, tw = 0;
  var stepBtns = $$('[data-step]');
  function fmt(v) { return (Math.round(v * 10) / 10).toFixed(1); }
  function setStep(i, force) {
    i = clamp(i, 0, 3); if (i === cur && !force) return; cur = i;
    var s = STEPS[i];
    stepBtns.forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.step === i ? 'true' : 'false'); });
    var sdm = $('[data-sdm]'); if (sdm) sdm.textContent = $('.sd > span[lang="' + root.lang + '"]', stepBtns[i]).textContent;
    ['lo', 'hi'].forEach(function (k) { $('[data-needle="' + k + '"]').style.transform = 'rotate(' + ang(k, s[k]) + 'deg)'; });
    var from = { lo: shown.lo, hi: shown.hi }, t0 = performance.now(), my = ++tw;
    $('[data-ro="vt"]').textContent = s.vt == null ? '--' : s.vt + '°';
    if (still()) { $('[data-ro="lo"]').textContent = fmt(s.lo); $('[data-ro="hi"]').textContent = fmt(s.hi); shown.lo = s.lo; shown.hi = s.hi; return; }
    (function f(t) {
      if (my !== tw) return;
      var k = smooth((t - t0) / 1000);
      shown.lo = lerp(from.lo, s.lo, k); shown.hi = lerp(from.hi, s.hi, k);
      $('[data-ro="lo"]').textContent = fmt(shown.lo); $('[data-ro="hi"]').textContent = fmt(shown.hi);
      if (k < 1) requestAnimationFrame(f);
    })(t0);
  }
  var gsec = $('[data-gauges]');
  function pinned() { return !still(); }
  function goStep(i) {
    i = clamp(i, 0, 3);
    if (pinned()) {
      var top = gsec.getBoundingClientRect().top + scrollY, span = gsec.offsetHeight - innerHeight;
      scrollTo({ top: top + span * (i + .5) / 4, behavior: 'smooth' });
    }
    setStep(i);
  }
  stepBtns.forEach(function (b) { b.addEventListener('click', function () { goStep(+b.dataset.step); }); });
  $$('[data-gstep]').forEach(function (b) { b.addEventListener('click', function () { goStep(cur + +b.dataset.gstep); }); });

  // ---------------------------------------------------------------- odometer (4.7)
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span>' + ch + '</span>';
      var col = ''; for (var d = 0; d < 10; d++) col += '<i data-n="' + d + '"></i>';
      return '<span class="d" data-to="' + ch + '"><span>' + col + '</span></span>';
    }).join('');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : 0; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    if (still()) { roll(o, true); return; }
    watch(o, function (v) { if (v) roll(o, true); }, { threshold: .4 });
  });

  // ---------------------------------------------------------------- cold air: soft plumes from real vents, pushed by the cursor or a tap
  function airField(cv, host, emitters, opt) {
    var c = cv.getContext('2d'), P = [], w = 0, h = 0, vis = false, raf = 0, mx = -999, my = -999, gust = 0, last = 0;
    var spr = document.createElement('canvas'); spr.width = spr.height = 64;
    var sc = spr.getContext('2d'), gr = sc.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(214,244,255,1)'); gr.addColorStop(.45, 'rgba(170,226,255,.45)'); gr.addColorStop(1, 'rgba(160,220,255,0)');
    sc.fillStyle = gr; sc.fillRect(0, 0, 64, 64);
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(t) {
      raf = 0;
      if (still() || !vis) { c.clearRect(0, 0, w, h); return; }
      var dt = Math.min(50, last ? t - last : 16) / 16; last = t;
      var E = emitters(w, h), rate = (opt.rate() + gust) * dt;
      gust *= .94;
      E.forEach(function (e) {
        for (var n = 0; n < rate; n++) {
          if (Math.random() > rate - n) break;
          var x = e.x + (Math.random() - .5) * e.w, y = e.y + (Math.random() - .5) * e.h;
          P.push({ x: x, y: y, vx: e.vx * (0.6 + Math.random() * .8) + (x - e.cx) * .012, vy: e.vy * (0.6 + Math.random() * .8), r: 3 + Math.random() * 5, a: 0, life: 0, max: 70 + Math.random() * 60 });
        }
      });
      c.clearRect(0, 0, w, h);
      c.globalCompositeOperation = 'lighter';
      for (var i = P.length - 1; i >= 0; i--) {
        var p = P[i]; p.life += dt;
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { var f = (1 - d2 / 14000) * .9; p.vx += dx / Math.sqrt(d2 + 1) * f; p.vy += dy / Math.sqrt(d2 + 1) * f; }
        p.vx *= .985; p.vy = p.vy * .985 - .004;   // cold air sinks a little less as it warms
        p.x += p.vx * dt; p.y += p.vy * dt; p.r += .32 * dt;
        var k = p.life / p.max;
        if (k >= 1) { P.splice(i, 1); continue; }
        c.globalAlpha = opt.alpha * Math.sin(Math.PI * k);
        c.drawImage(spr, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      if (P.length > 900) P.splice(0, P.length - 900);
      kick();
    }
    function kick() { if (!raf && vis && !still()) { raf = requestAnimationFrame(frame); } else if (still()) c.clearRect(0, 0, w, h); }
    host.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    host.addEventListener('pointerleave', function () { mx = my = -999; });
    host.addEventListener('pointerdown', function () { gust = 6; });
    watch(host, function (v) { vis = v; last = 0; kick(); });
    return { size: function () { size(); }, kick: kick };
  }
  // the vents in their own photo (natural 702×933, object-position 50% 70%)
  var own = $('.deal.own'), ownImg = $('img', own);
  var air = airField($('[data-air]'), own, function (w, h) {
    var s = Math.max(w / 702, h / 933), ox = (w - 702 * s) * .5, oy = (h - 933 * s) * .7;
    var m = function (x, y) { return [ox + x * s, oy + y * s]; };
    var L = m(248, 690), R = m(452, 690), C = m(351, 690);
    return [
      { x: L[0], y: L[1], w: 170 * s, h: 60 * s, cx: C[0], vx: -0.4, vy: -1.5 },
      { x: R[0], y: R[1], w: 170 * s, h: 60 * s, cx: C[0], vx: 0.4, vy: -1.5 }
    ];
  }, { rate: function () { return .6 + 1.1 * heroCool; }, alpha: .12 });
  var ventTile = $('.tile.vent');
  var breath = airField($('[data-breath]'), ventTile, function (w, h) {
    return [{ x: w * .5, y: h * .45, w: w * .36, h: h * .3, cx: w * .5, vx: 0, vy: .9 }];
  }, { rate: function () { return 2.2; }, alpha: .08 });

  // ---------------------------------------------------------------- hero tilt (cursor on desktop, scroll on touch)
  var hv = $('[data-tilt]');
  if (matchMedia('(hover: hover)').matches) {
    hv.addEventListener('pointermove', function (e) { if (still()) return; var r = hv.getBoundingClientRect(); hv.style.setProperty('--tx', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3)); hv.style.setProperty('--ty', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3)); });
    hv.addEventListener('pointerleave', function () { hv.style.setProperty('--tx', 0); hv.style.setProperty('--ty', 0); });
  }

  // ---------------------------------------------------------------- spotlight on bento tiles
  $$('[data-spot]').forEach(function (g) {
    g.addEventListener('pointermove', function (e) {
      $$('[data-tile]', g).forEach(function (t) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
    });
  });

  // ---------------------------------------------------------------- composer: climate keys → WhatsApp message that types itself
  var SYM = {
    he: ['לא מקרר', 'מקרר חלש', 'יש רעש כשמדליקים אותו', 'יש ריח מהפתחים', 'יש מים בתוך הרכב', 'קר רק בצד אחד'],
    en: ['not cooling', 'cooling weakly', 'noisy when switched on', 'a smell from the vents', 'water inside the car', 'cold on one side only']
  };
  var keys = $$('[data-sym]'), carIn = $('[data-car]'), bubble = $('[data-bubble]'), typed = '', twT = 0;
  function compose() {
    var l = root.lang, on = keys.filter(function (k) { return k.getAttribute('aria-pressed') === 'true'; }).map(function (k) { return SYM[l][+k.dataset.sym]; });
    var car = (carIn.value || '').trim().slice(0, 60), out;
    if (l === 'he') {
      out = 'שלום, הגעתי מהאתר.';
      out += on.length ? ' לגבי המזגן ברכב: ' + on.join(', ') + '.' : ' יש לי שאלה לגבי המזגן ברכב.';
      if (car) out += '\nהרכב: ' + car + '.';
      out += '\nמתי אפשר להגיע לבדיקה?';
    } else {
      out = 'Hi, I found you through the website.';
      out += on.length ? ' About my car’s A/C: ' + on.join(', ') + '.' : ' I have a question about my car’s A/C.';
      if (car) out += '\nThe car: ' + car + '.';
      out += '\nWhen could I bring it in for a check?';
    }
    return out;
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    clearTimeout(twT);
    if (instant || still()) { typed = target; bubble.textContent = target; return; }
    var i = 0; while (i < typed.length && i < target.length && typed[i] === target[i]) i++;   // keep the common start, type the rest
    (function step() {
      typed = target.slice(0, i);
      bubble.innerHTML = '';
      bubble.appendChild(document.createTextNode(typed));
      var c = document.createElement('span'); c.className = 'cur'; bubble.appendChild(c);
      if (i < target.length) { i += Math.max(1, Math.round((target.length - i) / 40)); twT = setTimeout(step, 16); }
      else { bubble.textContent = target; }
    })();
  }
  keys.forEach(function (k) { k.addEventListener('click', function () { k.setAttribute('aria-pressed', k.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); write(); }); });
  carIn.addEventListener('input', function () { write(); });
  var msgSec = $('#message'), msgDone = false;
  watch(msgSec, function (v) { if (v && !msgDone) { msgDone = true; typed = ''; write(); } }, { threshold: .25 });

  // ---------------------------------------------------------------- scroll: the cabin cools, seams and stages follow the scroll both ways
  var HOT = [42, 26, 17], COLD = [11, 24, 34];
  var nav = $('[data-nav]'), cab = $('[data-cabin]'), hero = $('.hero'), frost = $('[data-frost]'), rev = $('[data-defog]'), shr = $('[data-shrink]');
  var heroCool = 0, ticking = 0;
  function prog(el, a, b) { var r = el.getBoundingClientRect(); return clamp((innerHeight * a - r.top) / (innerHeight * b), 0, 1); }
  function tick() {
    ticking = 0;
    var y = scrollY, max = Math.max(1, root.scrollHeight - innerHeight), p = clamp(y / max, 0, 1);
    var c = smooth(p * 1.5), rgb = HOT.map(function (v, i) { return Math.round(lerp(v, COLD[i], c)); });
    root.style.setProperty('--bg', 'rgb(' + rgb.join(',') + ')');
    cab.textContent = Math.round(lerp(34, 6, smooth(p * 1.25)));
    nav.classList.toggle('gathered', y > 40);
    heroCool = still() ? .55 : smooth(y / Math.max(1, hero.offsetHeight * .8) + .12);
    hero.style.setProperty('--cool', heroCool.toFixed(3));
    var kt = lerp(32, 18, heroCool), kr = (-120 + (kt - 18) / 14 * 240);
    root.style.setProperty('--kr', kr.toFixed(1) + 'deg');
    var kread = $('[data-kread]'); if (kread) kread.textContent = Math.round(kt);
    if (!still()) {
      frost.style.setProperty('--f', smooth(prog(frost, 1, .75)).toFixed(3));
      $$('.ph').forEach(function (t) { var r = t.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) t.style.setProperty('--py', ((r.top + r.height / 2 - innerHeight / 2) * -.06).toFixed(1) + 'px'); });
      var gr = gsec.getBoundingClientRect(), span = gsec.offsetHeight - innerHeight, gp = clamp(-gr.top / Math.max(1, span), 0, 1);
      gsec.style.setProperty('--gp', gp.toFixed(3));
      if (gr.top < innerHeight && gr.bottom > 0) setStep(Math.min(3, Math.floor(gp * 4)));
      rev.style.setProperty('--fog', (1 - smooth(prog(rev, 1, .75))).toFixed(3));
      shr.style.setProperty('--s', smooth(prog(shr, .95, .6)).toFixed(3));
    }
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = 1; requestAnimationFrame(tick); } }, { passive: true });

  // ---------------------------------------------------------------- layout
  function layout() { air.size(); breath.size(); fitWordmark(); tick(); }
  var rt = 0; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 120); });

  texts(root.lang); hours(); setStep(0, true); write(true);
  if (still()) { $$('[data-wordmark]').forEach(function (el) { el.classList.add('in'); }); }
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWordmark);
  air.kick(); breath.kick();
})();
