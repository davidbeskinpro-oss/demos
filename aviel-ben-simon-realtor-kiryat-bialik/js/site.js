(function () {
  var root = document.documentElement, WA = '972543144386';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth <= 860; };
  var hoverOK = matchMedia('(hover: hover)').matches;
  var TITLE = { he: 'אביאל בן סימון · תיווך בקריות · קרן היסוד 45, קריית ביאליק', en: 'Aviel Ben Simon · Real estate in the Krayot · 45 Keren HaYesod, Kiryat Bialik' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור תיווך בקריות - אביאל בן סימון יעוץ ושיווק נדל״ן · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Aviel Ben Simon Real Estate, the Krayot · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true, null); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting, es[0]); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'אביאל בן סימון', 'Aviel Ben Simon');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-foot]', 'תחתון', 'Footer');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-call]', 'התקשרו לאביאל, 054-314-4386', 'Call Aviel, 054-314-4386');
    aria('[data-t-wa]', 'וואטסאפ לאביאל', 'WhatsApp Aviel');
    aria('[data-rooms="-1"]', 'פחות חדרים', 'Fewer rooms');
    aria('[data-rooms="1"]', 'יותר חדרים', 'More rooms');
    $('[data-t-map]').title = l === 'he' ? 'מפה: קרן היסוד 45, קריית ביאליק' : 'Map: 45 Keren HaYesod, Kiryat Bialik';
    $('#fp-t').textContent = l === 'he' ? 'תוכנית דירה להמחשה' : 'Illustrative flat plan';
    $$('.fp .rn').forEach(function (t) { t.textContent = t.dataset[l]; });
    $$('[data-area] option').forEach(function (o) { o.textContent = o.dataset[l]; });
    $$('[data-decode]').forEach(function (c) { if (c._done || still()) c.textContent = c.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('abs-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('abs-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-decode]').forEach(function (c) { c._done = true; c.textContent = c.dataset[root.lang]; });
    $$('[data-odo]').forEach(function (o) { roll(o, true); });
    layout(); bp.kick(); loupe.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [7.5, 21], 1: [7.5, 21], 2: [7.5, 21], 3: [7.5, 21], 4: [7.5, 21], 5: [8, 13], 6: [19, 22] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
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
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $('[data-sign]').classList.toggle('closed', !open);
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

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  // the reviews land on the rail, and lift off again when you scroll back above them
  var rail = $('[data-rail]');
  watch(rail, function (v, e) { if (v) rail.classList.add('in'); else if (e && e.boundingClientRect.top > 0) rail.classList.remove('in'); }, { threshold: .12 });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- headline and skyline fit their width
  var title = $('[data-fit]'), sky = $('[data-fit-sky]');
  function fit() {
    title.style.fontSize = '';
    var W = title.clientWidth, worst = 1;
    $$('.ln > .in', title).forEach(function (s) { var w = s.scrollWidth; if (w > W) worst = Math.min(worst, W / w); });
    if (worst < 1) title.style.fontSize = (parseFloat(getComputedStyle(title).fontSize) * worst * .97) + 'px';
    var bl = $$('.blocks:not([hidden]) b', sky).filter(function (b) { return b.offsetWidth; });
    if (bl.length) {
      var mw = Math.min.apply(null, bl.map(function (b) { return b.clientWidth; })), mh = Math.min.apply(null, bl.map(function (b) { return b.clientHeight; }));
      sky.style.setProperty('--fs', Math.min(mw * (he() ? 1.25 : .95), mh * .62).toFixed(1) + 'px');
    }
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
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  var hero = $('[data-hero]'), heroRun = $('[data-herorun]'), nav = $('[data-nav]'), door = $('[data-door]'), dusk = $('[data-dusk]'), room = $('[data-room] img');

  // ---------------------------------------------------------------- the drawing table behind the door: grid paper, drifting plan fragments, dust in the door's light
  var bp = (function () {
    var cv = $('[data-bp]'), c = cv.getContext('2d'), w, h, raf = 0, vis = true, frags = [], motes = [], px = -1, py = -1, t0 = performance.now();
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      frags = []; var n = phone() ? 6 : 11;
      for (var i = 0; i < n; i++) frags.push({ x: Math.random() * w, y: Math.random() * h, k: i % 4, s: 50 + Math.random() * 70, r: Math.floor(Math.random() * 4) * Math.PI / 2, vx: (Math.random() - .5) * 6, vy: -3 - Math.random() * 5 });
      motes = []; for (var m = 0; m < (phone() ? 28 : 46); m++) motes.push({ x: Math.random(), y: Math.random(), v: .02 + Math.random() * .05, ph: Math.random() * 6.28, r: .6 + Math.random() * 1.6 });
    }
    function frag(f) {
      c.save(); c.translate(f.x, f.y); c.rotate(f.r); c.beginPath(); var s = f.s;
      if (f.k === 0) { c.moveTo(0, 0); c.lineTo(s, 0); c.moveTo(0, 0); c.arc(0, 0, s, 0, Math.PI / 2); c.lineTo(0, 0); }          // a door swing
      else if (f.k === 1) { c.moveTo(0, 0); c.lineTo(s * 1.6, 0); c.moveTo(0, -6); c.lineTo(0, 6); c.moveTo(s * 1.6, -6); c.lineTo(s * 1.6, 6); }  // a dimension line
      else if (f.k === 2) { c.moveTo(0, -4); c.lineTo(s, -4); c.moveTo(0, 0); c.lineTo(s, 0); c.moveTo(0, 4); c.lineTo(s, 4); }    // a window
      else { c.moveTo(s, 0); c.lineTo(0, 0); c.lineTo(0, s * .8); }                                                                 // a wall corner
      c.stroke(); c.restore();
    }
    function draw(T) {
      c.clearRect(0, 0, w, h);
      c.lineWidth = 1; c.strokeStyle = 'rgba(174,195,147,.05)'; c.beginPath();
      for (var x = (w / 2) % 28; x <= w; x += 28) { c.moveTo(x + .5, 0); c.lineTo(x + .5, h); }
      for (var y = 0; y <= h; y += 28) { c.moveTo(0, y + .5); c.lineTo(w, y + .5); }
      c.stroke();
      c.strokeStyle = 'rgba(174,195,147,.1)'; c.beginPath();
      for (x = (w / 2) % 140; x <= w; x += 140) { c.moveTo(x + .5, 0); c.lineTo(x + .5, h); }
      for (y = 0; y <= h; y += 140) { c.moveTo(0, y + .5); c.lineTo(w, y + .5); }
      c.stroke();
      // the hand's lamp over the drawing (drifts by itself on touch screens)
      var lx = px, ly = py;
      if (lx < 0) { lx = w * (.5 + .32 * Math.sin(T * .00021)); ly = h * (.42 + .16 * Math.sin(T * .00033)); }
      var g = c.createRadialGradient(lx, ly, 0, lx, ly, Math.max(w, h) * .32);
      g.addColorStop(0, 'rgba(255,214,150,.11)'); g.addColorStop(1, 'rgba(255,214,150,0)');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.lineWidth = 1.3;
      frags.forEach(function (f) { var d = Math.hypot(f.x - lx, f.y - ly), a = .12 + .3 * Math.max(0, 1 - d / 380); c.strokeStyle = 'rgba(174,195,147,' + a.toFixed(3) + ')'; frag(f); });
      // dust in the light falling out of the open door
      var dr = door.getBoundingClientRect(), hr = hero.getBoundingClientRect(), cx = dr.left - hr.left + dr.width / 2, top = dr.top - hr.top;
      c.fillStyle = 'rgba(255,222,170,.7)';
      motes.forEach(function (m) {
        var mx = cx + (m.x - .5) * dr.width * 2.2 + Math.sin(T * .0006 + m.ph) * 14, my = top + dr.height * .9 - m.y * dr.height * 1.3;
        c.globalAlpha = .25 + .35 * Math.sin(T * .002 + m.ph) ** 2; c.beginPath(); c.arc(mx, my, m.r, 0, 6.283); c.fill();
      });
      c.globalAlpha = 1;
    }
    function frame(T) {
      raf = 0;
      if (still()) { draw(0); return; }
      var dt = 1 / 60;
      frags.forEach(function (f) { f.x += f.vx * dt; f.y += f.vy * dt; if (f.y < -160) { f.y = h + 120; f.x = Math.random() * w; } if (f.x < -200) f.x = w + 100; if (f.x > w + 200) f.x = -100; });
      motes.forEach(function (m) { m.y += m.v * dt; if (m.y > 1) { m.y = 0; m.x = Math.random(); } });
      draw(T); if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = hero.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; var nx = px / r.width - .5, ny = py / r.height - .5; if (!still()) room.style.transform = 'scale(1.07) translate(' + (nx * -14).toFixed(1) + 'px,' + (ny * -10).toFixed(1) + 'px)'; });
    hero.addEventListener('pointerleave', function () { px = -1; room.style.transform = ''; });
    watch(hero, function (v) { vis = v; kick(); });
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- the office photo leans toward the hand; its labels decode out of scrambled letters
  var office = $('[data-tilt]'), oimg = $('.o-img', office);
  office.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var r = office.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
    oimg.style.transform = 'rotateY(' + (nx * 9).toFixed(2) + 'deg) rotateX(' + (ny * -7).toFixed(2) + 'deg)';
  });
  office.addEventListener('pointerleave', function () { oimg.style.transform = ''; });
  var GLY = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHKLMNPRSTVXZ' };
  function decode(el, delay) {
    var l = root.lang, txt = el.dataset[l];
    if (still()) { el.textContent = txt; el._done = true; return; }
    setTimeout(function () {
      var t0 = performance.now(), dur = 900, set = GLY[l];
      (function st(t) {
        var p = clamp((t - t0) / dur, 0, 1), n = Math.floor(p * txt.length), out = txt.slice(0, n);
        for (var i = n; i < txt.length; i++) out += txt[i] === ' ' ? ' ' : set[Math.floor(Math.random() * set.length)];
        el.textContent = out;
        if (p < 1) requestAnimationFrame(st); else { el.textContent = el.dataset[root.lang]; el._done = true; }
      })(t0);
    }, delay);
  }
  watch(office, function (v) { if (v && !office._seen) { office._seen = true; $$('[data-decode]', office).forEach(function (c, i) { decode(c, 300 + i * 320); }); } }, { threshold: .35 });

  // ---------------------------------------------------------------- the plan: it draws itself, then a room lights for each part of the work
  var plot = $('[data-plot]'), scan = $('[data-scan]'), plan = $('[data-plan]'), fp = $('[data-fp]'), kg = $('[data-kg]'), rms = $$('.rm', fp), steps = $$('[data-step]');
  var KEY = [[240, 258], [140, 84], [340, 70], [520, 336]], cur = -2;
  function setStep(n) {
    if (n === cur) return; cur = n;
    rms.forEach(function (r, i) { r.classList.toggle('on', i === n); });
    steps.forEach(function (s, i) { s.classList.toggle('on', i === n); s.classList.toggle('cur', i === Math.max(0, n)); $('button', s).setAttribute('aria-pressed', i === n ? 'true' : 'false'); });
    var k = n < 0 ? [574, 222] : KEY[n];
    kg.setAttribute('transform', 'translate(' + k[0] + ' ' + k[1] + ')');
    kg.style.opacity = n < 0 ? .5 : 1;
  }
  steps.forEach(function (s, i) { $('button', s).addEventListener('click', function () {
    if (still()) { setStep(i); return; }
    var top = plan.getBoundingClientRect().top + scrollY, span = plan.offsetHeight - innerHeight;
    scrollTo({ top: top + span * (.3 + (i + .5) / 4 * .7), behavior: 'smooth' });
  }); });

  // ---------------------------------------------------------------- the rooftops: a loupe that reads the streets (follows the mouse, drifts by itself on phones)
  var aerial = $('[data-aerial]'), aclip = $('[data-aclip]'), aimg = $('[data-aimg]'), lp = $('[data-loupe]');
  var loupe = (function () {
    var raf = 0, vis = false, mx = -1, my = -1, az = 1.06;
    function place(x, y) {
      var W = aclip.clientWidth, Hh = aclip.clientHeight, s = Math.max(W / 1600, Hh / 1060) * az, dw = 1600 * s, dh = 1060 * s;
      var ox = W * .5 - dw * .5, oy = Hh * .6 - dh * .6, Z = 2.4, lw = lp.offsetWidth;
      lp.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      lp.style.backgroundImage = 'url(' + aimg.currentSrc + ')';
      lp.style.backgroundSize = (dw * Z).toFixed(0) + 'px ' + (dh * Z).toFixed(0) + 'px';
      lp.style.backgroundPosition = (-((x - ox) * Z - lw / 2)).toFixed(1) + 'px ' + (-((y - oy) * Z - lw / 2)).toFixed(1) + 'px';
    }
    function frame(T) {
      raf = 0; if (still() || !vis || !aimg.complete) return;
      var W = aclip.clientWidth, Hh = aclip.clientHeight;
      if (mx < 0) place(W * (.5 + .3 * Math.sin(T * .00028)), Hh * (.42 + .17 * Math.sin(T * .00047 + 1)));
      else place(mx, my);
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    aclip.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = aclip.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    aclip.addEventListener('pointerleave', function () { mx = -1; });
    watch(aerial, function (v) { vis = v; if (v) { aerial.classList.add('on'); kick(); } });
    return { kick: kick, zoom: function (z) { az = z; } };
  })();

  // ---------------------------------------------------------------- the message to Aviel writes itself
  var goal = $$('[data-goal] input'), roomsOut = $('[data-roomsout]'), area = $('[data-area]'), msgEl = $('[data-msg]'), rooms = 4, shown = '', typing = 0, chatSeen = false;
  $$('[data-rooms]').forEach(function (b) { b.addEventListener('click', function () { rooms = clamp(rooms + (+b.dataset.rooms), 2, 6); roomsOut.textContent = rooms === 6 ? '6+' : rooms; write(); }); });
  goal.forEach(function (g) { g.addEventListener('change', function () { write(); }); });
  area.addEventListener('change', function () { write(); });
  function compose() {
    var l = he(), g = goal.filter(function (x) { return x.checked; })[0].value, o = area.options[area.selectedIndex], any = o.value === 'any';
    if (l) {
      var R = rooms < 6 ? 'דירת ' + rooms + ' חדרים' : 'דירה של 6 חדרים ומעלה', W = any ? 'באחת הקריות' : 'ב' + o.dataset.he;
      if (g === 'buy') return 'שלום אביאל, אשמח לעזרה בקניית ' + R + ' ' + W + '. אפשר לדבר?';
      if (g === 'sell') return 'שלום אביאל, יש לי ' + R + ' ' + W + ' ואשמח לעזרה במכירה שלה. אפשר לדבר?';
      return 'שלום אביאל, אשמח לעזרה במציאת ' + R + ' להשקעה ' + W + '. אפשר לדבר?';
    }
    var r = rooms < 6 ? 'a ' + rooms + '-room flat' : 'a flat with 6 rooms or more', w = any ? 'somewhere in the Krayot' : 'in ' + o.dataset.en;
    if (g === 'buy') return 'Hi Aviel, I’d like help buying ' + r + ' ' + w + '. Can we talk?';
    if (g === 'sell') return 'Hi Aviel, I have ' + r + ' ' + w + ' and I’d like help selling it. Can we talk?';
    return 'Hi Aviel, I’d like help finding ' + r + ' ' + w + ' as an investment. Can we talk?';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing); msgEl.classList.remove('typing');
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var from = shown, t0 = performance.now(), del = from.length - keep;
    msgEl.classList.add('typing');
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? from.slice(0, from.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st); else msgEl.classList.remove('typing');
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; if (!still()) { shown = ''; msgEl.textContent = ''; write(); } } }, { threshold: .4 });

  // ---------------------------------------------------------------- footer: lit windows in the skyline
  var foot = $('[data-foot]'), footOn = false, blocks = [];
  watch(foot, function (v) { footOn = v; });
  setInterval(function () {
    if (!footOn || still()) return;
    blocks = $$('.blocks b', sky); var b = blocks[Math.floor(Math.random() * blocks.length)];
    if (b) b.style.setProperty('--win', (.2 + Math.random() * .8).toFixed(2));
  }, 700);

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var fob = $('[data-fob]'), mbg = $('[data-mbg]'), msg = $('#msg'), glow = $('[data-glow]'), lines = $$('.h-title .ln'), sides = $$('.h-side');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, W = innerWidth;
    nav.classList.toggle('pill', scrollY > 40);
    fob.classList.toggle('show', scrollY > vh * .6);

    // walking through the door: it grows until its room fills the screen, then dusk falls into the next section
    if (!calm) {
      var p = prog(heroRun), e = smooth((p - .03) / .55);
      var dx = door.offsetLeft + door.offsetWidth / 2, dy = door.offsetTop + door.offsetHeight * .42, Hh = hero.clientHeight;
      var S = Math.max(W / door.offsetWidth, Hh / door.offsetHeight) * 1.12;
      var sc = lerp(1, S, e * e);
      door.style.transformOrigin = '50% 42%';
      door.style.transform = 'translate3d(' + lerp(0, W / 2 - dx, e).toFixed(1) + 'px,' + lerp(0, Hh / 2 - dy, e).toFixed(1) + 'px,0) scale(' + sc.toFixed(4) + ')';
      dusk.style.opacity = (smooth((p - .25) / .45) * .62).toFixed(3);
      var f = 1 - smooth(p / .22);
      lines.forEach(function (l, i) { l.style.transform = p > 0 ? 'translateY(' + ((i ? 1 : -1) * p * 120).toFixed(1) + 'px)' : ''; l.style.opacity = f.toFixed(3); });
      sides.forEach(function (s) { s.style.opacity = f.toFixed(3); s.style.visibility = f < .02 ? 'hidden' : ''; });
    } else {
      door.style.transform = ''; dusk.style.opacity = '';
      lines.forEach(function (l) { l.style.transform = ''; l.style.opacity = ''; });
      sides.forEach(function (s) { s.style.opacity = ''; s.style.visibility = ''; });
    }

    // the plan
    var pp = calm ? 1 : prog(plan);
    var dr2 = calm ? 1 : smooth(pp / .28), px2 = 640 * dr2;
    if (root.dir === 'rtl') { plot.setAttribute('x', (660 - px2 - 20).toFixed(1)); } else plot.setAttribute('x', -20);
    plot.setAttribute('width', (px2 + 20).toFixed(1));
    var sx = root.dir === 'rtl' ? 640 - px2 : px2; scan.setAttribute('x1', sx.toFixed(1)); scan.setAttribute('x2', sx.toFixed(1));
    fp.style.setProperty('--scan', dr2 > 0 && dr2 < 1 ? 1 : 0);
    fp.style.setProperty('--lbl', calm ? 1 : smooth((pp - .2) / .1).toFixed(3));
    if (!calm) setStep(pp < .3 ? -1 : Math.min(3, Math.floor((pp - .3) / .7 * 4)));
    else if (cur === -2 || cur === -1) setStep(-1);

    // the rooftops open out of a door-sized window
    var ar = aerial.getBoundingClientRect(), o = calm ? 1 : smooth((vh - ar.top) / (vh * .95));
    aclip.style.setProperty('--cx', ((1 - o) * (W < 700 ? 12 : 24)).toFixed(2) + '%');
    aclip.style.setProperty('--ct', ((1 - o) * 10).toFixed(2) + '%');
    aclip.style.setProperty('--cr', ((1 - o) * 220).toFixed(1) + 'px');
    var az = calm ? 1.04 : lerp(1.28, 1.04, o); aclip.style.setProperty('--az', az.toFixed(4)); loupe.zoom(az);

    // the window behind the message drifts slower than the page
    var mr = msg.getBoundingClientRect();
    mbg.style.setProperty('--my2', calm ? '0px' : ((mr.top - vh / 2) * -.12).toFixed(1) + 'px');

    // the dusk rises over the bay as the footer is uncovered
    var fr = foot.getBoundingClientRect(), fp2 = calm ? 1 : smooth((vh - fr.top) / Math.min(fr.height, vh));
    glow.style.setProperty('--rise', ((1 - fp2) * 140).toFixed(1) + 'px');
  }

  function layout() { fit(); bp.size(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); setStep(-1); layout();
  var once = false, go = function () { if (once) return; once = true; fit(); requestAnimationFrame(function () { hero.classList.add('ready'); bp.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { fit(); tick(); });
})();
