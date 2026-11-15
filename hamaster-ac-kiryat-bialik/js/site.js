(function () {
  var root = document.documentElement, WA = '972546840233';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 900; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var TITLE = { he: 'המאסטר למזגנים · התקנה, תיקון, מילוי גז וניקוי · הפרטיזנים 11, קריית ביאליק', en: 'HaMaster Air Con · Installation, repairs, gas & cleaning · 11 Partizanim St, Kiryat Bialik' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור המאסטר למזגנים קריות · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for HaMaster Air Conditioning Krayot · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'המאסטר למזגנים', 'HaMaster Air Con');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו למאסטר, 054-684-0233', 'Call HaMaster, 054-684-0233');
    aria('[data-t-wa]', 'וואטסאפ למאסטר', 'WhatsApp HaMaster');
    $('.v-map iframe').title = l === 'he' ? 'מפה: הפרטיזנים 11, קריית ביאליק' : 'Map: 11 Partizanim St, Kiryat Bialik';
    $('[data-where]').placeholder = l === 'he' ? 'למשל: קריית ביאליק' : 'e.g. Kiryat Bialik';
    $$('.part').forEach(function (p) { $('.tag', p).textContent = p.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ms-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('ms-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-tile],[data-plate]').forEach(function (el) { el.classList.add('in'); });
    $$('.part').forEach(function (p) { p.classList.remove('on'); });
    layout(); dust.kick(); lens.kick(); sight.kick(); fins.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed day
  var H = { 0: [7.5, 16.75], 1: [7.5, 16.75], 2: [7.5, 16.75], 3: [7.5, 16.75], 4: [7.5, 16.75], 5: [6.75, 12.75], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
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
  $$('.bento,.v-bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  // plates are screwed on as they arrive and come off again if you scroll back above them
  $$('[data-plate]').forEach(function (p, i) {
    p.style.setProperty('--d', (phone() ? 0 : (i % 3) * 120) + 'ms');
    if (!io) { p.classList.add('in'); return; }
    new IntersectionObserver(function (es) { var e = es[0]; if (e.isIntersecting) p.classList.add('in'); else if (e.boundingClientRect.top > 0) p.classList.remove('in'); }, { rootMargin: '0px 0px -10% 0px' }).observe(p);
  });
  $$('.tile,.vt').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 7 : 0;
    sp.innerHTML = sp.textContent.split(/\s+/).map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // ---------------------------------------------------------------- the diamond crown of the core bit, round the hole
  (function () {
    var g = $('[data-teeth]'), s = '';
    for (var k = 0; k < 28; k++) s += '<rect x="96" y="-.6" width="8" height="3.4" rx=".8" transform="rotate(' + (k * 360 / 28) + ' 100 100)"/>';
    g.innerHTML = s;
  })();

  var hero = $('[data-hero]'), stage = $('[data-hstage]'), hole = $('[data-hole]'), crown = $('[data-crown]'), drill = $('[data-hdrill]'), ceil = $('[data-hceil]'), hcopy = $('.h-copy'), nav = $('[data-nav]');
  var G = { W: 0, H: 0, r: 0, cx: 0, cy: 0 };
  function geo() {
    var W = stage.clientWidth, Hh = stage.clientHeight, r, cx, cy;
    if (!phone()) { r = Math.min(Hh * .6, W * .36); cx = W - r * .7; cy = Hh * .52; }
    else { r = Math.min(W * .62, Hh * .34); cx = W - r * .86; cy = Math.max(r * .8, 90); }
    if (rtl()) cx = W - cx;
    G = { W: W, H: Hh, r: r, cx: cx, cy: cy };
  }
  function heroFrame(p) {
    var e = smooth(p / .6), W = G.W, Hh = G.H, r = G.r;
    var bx = lerp(G.cx - r, 0, e), by = lerp(G.cy - r, 0, e), bw = lerp(2 * r, W, e), bh = lerp(2 * r, Hh, e);
    var cr = lerp(r, Math.hypot(W, Hh) / 2 + 4, e), ccx = lerp(G.cx, W / 2, e), ccy = lerp(G.cy, Hh / 2, e);
    var st = hole.style;
    st.setProperty('--bx', bx.toFixed(1) + 'px'); st.setProperty('--by', by.toFixed(1) + 'px'); st.setProperty('--bw', bw.toFixed(1) + 'px'); st.setProperty('--bh', bh.toFixed(1) + 'px');
    st.setProperty('--cr', cr.toFixed(1) + 'px'); st.setProperty('--cx', ccx.toFixed(1) + 'px'); st.setProperty('--cy', ccy.toFixed(1) + 'px');
    drill.style.transform = 'scale(' + (1 + .3 * e).toFixed(4) + ')';
    var c = smooth((p - .3) / .45);
    ceil.style.opacity = c.toFixed(3);
    ceil.style.transform = 'scale(' + (1.22 - .22 * smooth((p - .3) / .7)).toFixed(4) + ')';
    var rr = lerp(r, cr, e);
    crown.style.transform = 'translate(' + (ccx - rr).toFixed(1) + 'px,' + (ccy - rr).toFixed(1) + 'px) scale(' + (rr / 100).toFixed(4) + ')';
    crown.style.opacity = (1 - smooth(e / .45)).toFixed(3);
    var o = 1 - smooth(p / .22);
    hcopy.style.opacity = o.toFixed(3); hcopy.style.transform = o < 1 ? 'translateY(' + ((1 - o) * -40).toFixed(1) + 'px)' : '';
    hcopy.style.visibility = o <= 0 ? 'hidden' : '';
    stage.style.setProperty('--lx', (ccx / W * 100).toFixed(1) + '%');
  }

  // ---------------------------------------------------------------- plaster dust: a burst from the cut, then motes drifting in the light; they part round the hand
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), M = [], B = [], w, h, raf = 0, vis = true, px = -999, py = -999, t0 = 0;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = stage.clientWidth; h = stage.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 46 : 90; M = [];
      for (var i = 0; i < n; i++) M.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .25, vy: -Math.random() * .2 - .05, s: Math.random() * 2 + .6, a: Math.random() * .5 + .2, ph: Math.random() * 6.3 });
    }
    function burst() {
      B = [];
      for (var i = 0; i < (phone() ? 90 : 160); i++) {
        var a = Math.random() * Math.PI * 2, sp = Math.random() * 3.2 + .8;
        B.push({ x: G.cx + Math.cos(a) * G.r, y: G.cy + Math.sin(a) * G.r, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1, s: Math.random() * 2.4 + .6, life: 1 });
      }
    }
    function frame(t) {
      raf = 0; c.clearRect(0, 0, w, h);
      if (still() || !vis) return;
      var T = (t - t0) / 1000;
      for (var i = 0; i < M.length; i++) {
        var m = M[i], dx = m.x - px, dy = m.y - py, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { var f = (14000 - d2) / 14000 * .6, d = Math.sqrt(d2) || 1; m.vx += dx / d * f; m.vy += dy / d * f; }
        m.vx *= .96; m.vy = m.vy * .96 - .004; m.x += m.vx + Math.sin(T * .7 + m.ph) * .18; m.y += m.vy;
        if (m.y < -10) { m.y = h + 10; m.x = Math.random() * w; } if (m.x < -10) m.x = w + 10; if (m.x > w + 10) m.x = -10;
        var near = 1 - clamp(Math.hypot(m.x - G.cx, m.y - G.cy) / (G.r * 1.6), 0, 1);
        c.globalAlpha = m.a * (.35 + near * .9); c.fillStyle = '#dfeaf0';
        c.beginPath(); c.arc(m.x, m.y, m.s, 0, 6.283); c.fill();
      }
      for (var k = B.length - 1; k >= 0; k--) {
        var b = B[k]; b.vy += .06; b.vx *= .985; b.x += b.vx; b.y += b.vy; b.life -= .012;
        if (b.life <= 0) { B.splice(k, 1); continue; }
        c.globalAlpha = b.life * .8; c.fillStyle = '#c9d0d3'; c.fillRect(b.x, b.y, b.s, b.s);
      }
      c.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { var r = stage.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { px = py = -999; });
    watch(stage, function (v) { vis = v; kick(); });
    return { size: size, kick: kick, burst: function () { t0 = performance.now(); burst(); kick(); } };
  })();

  // ---------------------------------------------------------------- above the ceiling: scan, parts, lens
  var inside = $('[data-inside]'), istage = $('[data-istage]'), parts = $$('.part'), icopy = $('.i-copy');
  var IMG = { w: 1200, h: 1600, py: .62 };
  function cover(W, Hh) { var s = Math.max(W / IMG.w, Hh / IMG.h), dw = IMG.w * s, dh = IMG.h * s; return { dw: dw, dh: dh, ox: (W - dw) * .5, oy: (Hh - dh) * IMG.py }; }
  function placeParts() {
    var W = istage.clientWidth, Hh = istage.clientHeight, cv = cover(W, Hh), cr = icopy.getBoundingClientRect(), sr = istage.getBoundingClientRect();
    var box = { l: cr.left - sr.left - 10, r: cr.right - sr.left + 10, t: cr.top - sr.top - 24, b: cr.bottom - sr.top + 24 };
    parts.forEach(function (p) {
      var x = cv.ox + cv.dw * +p.dataset.x, y = cv.oy + cv.dh * +p.dataset.y;
      p.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      p._y = y;
      p.classList.toggle('flip', rtl() ? x < W * .42 : x > W * .58);
      p.hidden = x < 20 || x > W - 20 || y < 90 || y > Hh - 20 || (x > box.l && x < box.r && y > box.t && y < box.b);
    });
  }
  var lens = (function () {
    var on = false, raf = 0, vis = false, lx = -1, ly = -1, tx = -1, ty = -1, lastHand = 0;
    function set(x, y) {
      var L = phone() ? 150 : 240, s = inside.style;
      s.setProperty('--lr2', L + 'px');
      s.setProperty('--lxp', (x - L / 2).toFixed(1) + 'px'); s.setProperty('--lyp', (y - L / 2).toFixed(1) + 'px');
      s.setProperty('--lix', (L / 2 - x).toFixed(1) + 'px'); s.setProperty('--liy', (L / 2 - y).toFixed(1) + 'px');
      s.setProperty('--liw', istage.clientWidth + 'px'); s.setProperty('--lih', istage.clientHeight + 'px');
    }
    function home() { var W = istage.clientWidth, Hh = istage.clientHeight, cv = cover(W, Hh); return [cv.ox + cv.dw * .5, clamp(cv.oy + cv.dh * .55, 120, Hh - 120)]; }
    function frame(t) {
      raf = 0; if (!on || !vis) return;
      var W = istage.clientWidth, Hh = istage.clientHeight;
      if (t - lastHand > 2600 || tx < 0) { var T = t / 1000; tx = W * (.5 + .3 * Math.sin(T * .45)); ty = Hh * (.48 + .2 * Math.sin(T * .31 + 1.2)); }
      if (lx < 0) { lx = tx; ly = ty; }
      lx = lerp(lx, tx, .12); ly = lerp(ly, ty, .12); set(lx, ly);
      raf = requestAnimationFrame(frame);
    }
    function kick() {
      if (still()) { var hp = home(); set(hp[0], hp[1]); return; }
      if (on && vis && !raf) raf = requestAnimationFrame(frame);
    }
    function hand(e) { if (!on || still()) return; var r = istage.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; lastHand = performance.now(); }
    istage.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') hand(e); });
    istage.addEventListener('pointerdown', hand);
    watch(istage, function (v) { vis = v; kick(); });
    return { kick: kick, enable: function (v) { if (v === on) return; on = v; inside.classList.toggle('lens', v); if (v) kick(); } };
  })();

  // ---------------------------------------------------------------- on-site folders: each photo opens as a round core-cut iris
  var irises = $$('[data-iris]');

  // ---------------------------------------------------------------- odometer
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 4) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .4 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- services: living tiles
  var svc = $('[data-svc]'), svcOn = false;
  watch(svc, function (v) { svcOn = v; $$('.tile', svc).forEach(function (t) { t.classList.toggle('on', v); }); sight.kick(); fins.kick(); });
  // the indoor unit's display: characters decode into a fault code, then into a set temperature
  (function () {
    var seg = $('[data-seg]'), disp = seg.parentNode, G = 'E1H5P0F3L8C2A7', seq = [['E1', true, 1500], ['24°', false, 2000]], k = 0;
    function decode(to, err, done) {
      var n = 0, it = setInterval(function () {
        n++; seg.textContent = n < 9 ? G[Math.floor(Math.random() * G.length)] + G[Math.floor(Math.random() * G.length)] : to;
        if (n >= 9) { clearInterval(it); disp.classList.toggle('err', err); done(); }
      }, 60);
    }
    function step() {
      if (still()) { seg.textContent = '24°'; disp.classList.remove('err'); setTimeout(step, 1500); return; }
      if (!svcOn) { setTimeout(step, 600); return; }
      var s = seq[k++ % seq.length]; decode(s[0], s[1], function () { setTimeout(step, s[2]); });
    }
    step();
  })();
  // the sight glass: bubbles in the liquid line thin out until the flow runs clear, then a glint
  var sight = (function () {
    var cv = $('[data-sight]'), c = cv.getContext('2d'), raf = 0, b = [], t0 = performance.now();
    for (var i = 0; i < 40; i++) b.push({ x: Math.random() * 220, y: 40 + Math.random() * 140, r: Math.random() * 7 + 2, v: Math.random() * 1.5 + 1.6, k: Math.random() });
    function draw(t) {
      var ph = still() ? 1 : ((t - t0) / 5200) % 1, dens = still() ? 0 : 1 - smooth(ph / .7);
      var g = c.createRadialGradient(90, 80, 10, 110, 110, 120); g.addColorStop(0, '#5f8f86'); g.addColorStop(1, '#173430');
      c.fillStyle = g; c.fillRect(0, 0, 220, 220);
      c.strokeStyle = 'rgba(210,240,230,.12)'; c.lineWidth = 2;
      for (var y = 30; y < 200; y += 18) { var off = still() ? 0 : ((t / 9) % 60); c.beginPath(); c.moveTo(-60 + off, y); c.lineTo(40 + off, y); c.moveTo(80 + off, y + 6); c.lineTo(170 + off, y + 6); c.stroke(); }
      b.forEach(function (p) {
        if (!still()) { p.x += p.v; if (p.x > 240) { p.x = -20; p.y = 40 + Math.random() * 140; p.k = Math.random(); } }
        if (p.k > dens) return;
        c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fillStyle = 'rgba(230,250,245,.18)'; c.fill();
        c.lineWidth = 1.4; c.strokeStyle = 'rgba(240,255,250,.75)'; c.stroke();
        c.beginPath(); c.arc(p.x - p.r * .35, p.y - p.r * .35, p.r * .25, 0, 6.283); c.fillStyle = 'rgba(255,255,255,.9)'; c.fill();
      });
      c.beginPath(); c.arc(110, 110, 22, 0, 6.283); c.fillStyle = '#3fbf6c'; c.fill();
      c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,.35)'; c.stroke();
      if (ph > .74 && ph < .9) { var gx = lerp(-40, 260, (ph - .74) / .16); var lg = c.createLinearGradient(gx - 30, 0, gx + 30, 0); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(.5, 'rgba(255,255,255,.35)'); lg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = lg; c.fillRect(0, 0, 220, 220); }
    }
    function frame(t) { raf = 0; draw(t); if (svcOn && !still()) raf = requestAnimationFrame(frame); }
    return { kick: function () { if (!raf) raf = requestAnimationFrame(frame); } };
  })();
  // the coil's fins: dusty until the hand (or, on phones, a slow sweep) washes a band through them; dust settles back slowly
  var fins = (function () {
    var box = $('[data-fins]'), cv = $('[data-fincv]'), c = cv.getContext('2d'), w, h, clean = [], specks = [], raf = 0, px = -1, lastHand = 0, step = 6;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = box.clientWidth; h = box.clientHeight || 170;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.ceil(w / step); clean = []; specks = [];
      for (var i = 0; i < n; i++) { clean.push(still() ? (i / n > .5 ? 1 : 0) : 0); var s = []; for (var k = 0; k < 7; k++) s.push(Math.random() * h); specks.push(s); }
    }
    function draw() {
      c.fillStyle = '#0e1417'; c.fillRect(0, 0, w, h);
      [h * .25, h * .5, h * .75].forEach(function (y) { var g = c.createLinearGradient(0, y - 7, 0, y + 7); g.addColorStop(0, '#f0b98c'); g.addColorStop(.5, '#b36a3a'); g.addColorStop(1, '#7d4423'); c.fillStyle = g; c.fillRect(0, y - 7, w, 14); });
      for (var i = 0; i < clean.length; i++) {
        var k = clean[i], x = i * step + 2, r = Math.round(lerp(104, 214, k)), g2 = Math.round(lerp(94, 224, k)), b2 = Math.round(lerp(80, 230, k));
        c.fillStyle = 'rgb(' + r + ',' + g2 + ',' + b2 + ')'; c.fillRect(x, 0, 2, h);
        if (k < .9) { c.fillStyle = 'rgba(120,104,82,' + (.8 * (1 - k)).toFixed(2) + ')'; specks[i].forEach(function (y) { c.fillRect(x - 1, y, 4, 3); }); }
      }
    }
    function frame(t) {
      raf = 0;
      if (!still()) {
        var auto = !fine.matches || t - lastHand > 3000, x = auto ? (Math.sin(t / 1400) * .5 + .5) * w : px;
        for (var i = 0; i < clean.length; i++) { var d = Math.abs(i * step - x); if (d < 34) clean[i] = Math.min(1, clean[i] + (1 - d / 34) * .2); else clean[i] = Math.max(0, clean[i] - .0025); }
      }
      draw();
      if (svcOn && !still()) raf = requestAnimationFrame(frame);
    }
    box.addEventListener('pointermove', function (e) { var r = box.getBoundingClientRect(); px = e.clientX - r.left; lastHand = performance.now(); });
    return { size: function () { size(); draw(); }, kick: function () { if (!raf) raf = requestAnimationFrame(frame); } };
  })();

  // ---------------------------------------------------------------- the message: a service sheet; the WhatsApp text writes itself beside it
  var sheet = $('[data-sheet]'), steps = $$('[data-step]', sheet), bubble = $('[data-bubble]'), chat = $('[data-chat]'), whereIn = $('[data-where]'), shown = '', typing = 0, chatSeen = false;
  steps[0].classList.add('on');
  var UNIT = { he: ['במזגן עילי', 'במיני מרכזי', 'בכמה מזגנים'], en: ['a wall split', 'a ducted unit', 'several units'] };
  var NEED = { he: ['התקנה', 'תקלה', 'מילוי גז', 'ניקוי'], en: ['installation', 'a fault', 'a gas top-up', 'cleaning'] };
  function list(a, l) { if (a.length < 2) return a.join(''); return l ? a.slice(0, -1).join(', ') + ' ו' + a[a.length - 1] : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function compose() {
    var l = he() ? 'he' : 'en', u = +($('input[name=unit]:checked', sheet) || { value: 0 }).value;
    var needs = $$('input[name=need]:checked', sheet).map(function (i) { return NEED[l][+i.value]; }), where = whereIn.value.trim();
    var m = l === 'he'
      ? 'שלום, אשמח לעזרה' + (needs.length ? ': ' + list(needs, true) + ', ' : ' ') + UNIT.he[u] + '.'
      : 'Hi, I’d like help ' + (needs.length ? 'with ' + list(needs, false) + ', on ' : 'with ') + UNIT.en[u] + '.';
    if (where) m += l === 'he' ? ' הכתובת: ' + where + '.' : ' Address: ' + where + '.';
    return m;
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; bubble.textContent = target; chat.classList.remove('typing'); return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    chat.classList.add('typing');
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      bubble.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st); else chat.classList.remove('typing');
    })(t0);
  }
  sheet.addEventListener('change', function (e) { var f = e.target.closest('[data-step]'); if (f) f.classList.add('on'); write(); });
  whereIn.addEventListener('input', function () { steps[2].classList.add('on'); write(); });
  watch(chat, function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; bubble.textContent = ''; write(); } }, { threshold: .5 });

  // ---------------------------------------------------------------- one scroll loop
  var foot = $('[data-foot]'), ls = $('[data-ls]'), port = $('[data-port]'), ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    port.classList.toggle('away', scrollY < vh * .5);
    // hero: through the hole
    var hr = hero.getBoundingClientRect(), p = calm ? 0 : clamp(-hr.top / Math.max(1, hr.height - vh), 0, 1);
    heroFrame(p);
    // above the ceiling: takes over the frame at the exact moment the hero lets go
    var ir = inside.getBoundingClientRect();
    inside.classList.toggle('live', calm || ir.top <= 1);
    var p2 = calm ? 1 : clamp(-ir.top / Math.max(1, ir.height - vh), 0, 1), s = calm ? 1 : smooth((p2 - .08) / .55), Hs = istage.clientHeight;
    inside.style.setProperty('--scan', (s * 100).toFixed(2) + '%');
    inside.style.setProperty('--scanop', s > 0 && s < 1 ? '1' : '0');
    inside.style.setProperty('--icop', calm ? '1' : smooth((p2 - .01) / .08).toFixed(3));
    parts.forEach(function (pt, i) { pt.classList.toggle('on', calm || (s * Hs >= pt._y && p2 > .02)); });
    lens.enable(calm || s >= 1);
    // folders: the iris opens as each band arrives
    irises.forEach(function (el) {
      var r = el.getBoundingClientRect(), q = calm ? 1 : smooth((vh - r.top) / (vh * .75));
      el.style.setProperty('--ir', lerp(9, 71, q).toFixed(2) + '%'); el.style.setProperty('--iz', lerp(1.3, 1, q).toFixed(4));
    });
    // footer: the line set slides out of the sealed hole
    var fr = foot.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / (Math.min(fr.height, vh) * .8));
    ls.style.setProperty('--lsx', (-560 * (1 - fp)).toFixed(1) + 'px');
  }

  function layout() { geo(); dust.size(); placeParts(); fins.size(); lens.kick(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () {
    if (once) return; once = true;
    requestAnimationFrame(function () { hero.classList.add('ready'); if (!still()) setTimeout(dust.burst, 650); });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { layout(); });
})();
