(function () {
  var root = document.documentElement, WA = '972529526252';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 900; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'la petite Madeleine · סטודיו שיער · שדרות מוריה 123, חיפה', en: 'la petite Madeleine · Hair studio · 123 Sderot Moriya, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Elen Elihanova by la petite Madeleine · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Elen Elihanova by la petite Madeleine · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-call]', 'שיחה לסטודיו, 052-952-6252', 'Call the studio, 052-952-6252');
    aria('[data-t-stages]', 'פינות בסטודיו', 'Corners of the studio');
    aria('[data-st-prev]', 'הקודם', 'Previous');
    aria('[data-st-next]', 'הבא', 'Next');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: שדרות מוריה 123, חיפה' : 'Map: 123 Sderot Moriya, Haifa'; });
    $$('.spot').forEach(function (s) { $('.tag', s).textContent = s.dataset[l]; });
    $$('[data-decode]').forEach(function (el) { el.textContent = el.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('pm-lang', l); } catch (e) {}
    texts(l); hours(); days(); write(true); fitMark(); scene();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('pm-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $('[data-foot]').classList.add('in');
    ring.kick(); petals.forEach(function (p) { p.kick(); }); lamps.kick(); write(true); scene(); studioGo(stage, true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 19], 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 15], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function is247() { for (var d = 0; d < 7; d++) if (!H[d] || H[d][0] !== 0 || H[d][1] !== 24) return false; return true; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (is247()) { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
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
      var t = H[r[0]], ds = [], k; for (k = r[0]; k <= r[1]; k++) ds.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + ds.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- glyph decode (labels settle out of scrambled letters)
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'abcdefghijklmnopqrstuvwxyz' };
  function decode(el, txt) {
    if (still()) { el.textContent = txt; return; }
    var set = GL[he() ? 'he' : 'en'], n = 0, total = 14, id = el.__dec;
    if (id) clearInterval(id);
    el.__dec = setInterval(function () {
      n++;
      var k = Math.floor(txt.length * n / total);
      el.textContent = txt.slice(0, k) + txt.slice(k).replace(/[^\s·]/g, function () { return set[Math.floor(Math.random() * set.length)]; });
      if (n >= total) { clearInterval(el.__dec); el.__dec = 0; el.textContent = txt; }
    }, 45);
  }

  // ---------------------------------------------------------------- entrances
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); });
  $$('.v-grid [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', i * 70 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in'); rio.unobserve(e.target);
      var c = $('[data-decode]', e.target); if (c) setTimeout(function () { decode(c, c.dataset[root.lang]); }, 400);
      $$('[data-odo]', e.target).forEach(odo);
    });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  setTimeout(function () { var d = $('.h-decode'); decode(d, d.dataset[root.lang]); }, 300);

  // headline letters
  $$('[data-split] .ln > span').forEach(function (sp, li) {
    var i = li * 9;
    sp.innerHTML = sp.textContent.split('').map(function (c) { return c === ' ' ? ' ' : '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('');
  });

  // odometer: each digit rolls on its own column
  function odo(el) {
    if (el.__done) return; el.__done = 1;
    var v = el.dataset.odo; el.setAttribute('aria-label', v);
    el.innerHTML = v.split('').map(function (c) {
      if (!/\d/.test(c)) return '<span>' + c + '</span>';
      return '<span class="odo-col" aria-hidden="true"><span class="strip" data-d="' + c + '"></span></span>';
    }).join('');
    var go = function () { $$('[data-d]', el).forEach(function (s, i) { s.style.transitionDelay = i * 120 + 'ms'; s.style.transform = 'translateY(-' + s.dataset.d + 'em)'; }); };
    if (still()) { $$('[data-d]', el).forEach(function (s) { s.style.transition = 'none'; }); go(); } else requestAnimationFrame(function () { requestAnimationFrame(go); });
  }

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- crystal pendants: rods drawn, sway toward the hand
  var lamps = (function () {
    var svg = $('[data-lamps]'), g = $$('[data-lamp]', svg), tx = 0, cur = 0, raf = 0, t0 = performance.now(), vis = true;
    $$('[data-rods]', svg).forEach(function (r, j) {
      var cx = +r.dataset.rods, top = j ? 48 : 68, html = '';
      for (var k = 0; k < 11; k++) { var x = cx - 20 + k * 4, len = 52 + Math.sin(k * 1.3) * 10 + (k % 2) * 8; html += '<line class="rod" x1="' + x + '" y1="' + top + '" x2="' + x + '" y2="' + (top + len) + '"/>'; }
      r.innerHTML = html;
    });
    function frame(t) {
      raf = 0; var s = (t - t0) / 1000;
      cur = lerp(cur, tx, .05);
      g.forEach(function (el, i) { var cx = i ? 330 : 70, a = still() ? 0 : Math.sin(s * .9 + i * 1.7) * 1.6 + cur * (i ? 1 : .8); el.setAttribute('transform', 'rotate(' + a.toFixed(2) + ' ' + cx + ' 0)'); });
      if (!still() && vis) raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { tx = (e.clientX / innerWidth - .5) * 10; });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { kick: kick, tilt: function (v) { tx = v; } };
  })();

  // ---------------------------------------------------------------- rose petals drifting, parting around the hand
  var petals = $$('[data-petals]').map(function (cv) {
    var host = cv.parentElement, c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = false, mx = -999, my = -999, last = 0;
    var COLS = ['#f0c3c8', '#e09aa9', '#f6ddd8', '#d9879a'];
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = host.clientWidth; h = host.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function seed() { var n = phone() ? 12 : 22; P = []; for (var i = 0; i < n; i++) P.push(make(Math.random() * h)); }
    function make(y) { return { x: Math.random() * w, y: y, s: 7 + Math.random() * 10, r: Math.random() * 6.28, vr: (Math.random() - .5) * .02, vy: .25 + Math.random() * .45, ph: Math.random() * 6.28, col: COLS[Math.floor(Math.random() * 4)], f: .5 + Math.random() * .5 }; }
    function petal(p) {
      c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.scale(1, .55 + .45 * Math.abs(Math.sin(p.ph)));
      c.globalAlpha = .55 * p.f; c.fillStyle = p.col; c.beginPath();
      c.moveTo(0, -p.s); c.bezierCurveTo(p.s * .9, -p.s * .7, p.s * .8, p.s * .6, 0, p.s); c.bezierCurveTo(-p.s * .7, p.s * .5, -p.s * .9, -p.s * .5, 0, -p.s);
      c.fill(); c.restore();
    }
    function frame(t) {
      raf = 0; var dt = last ? Math.min(3, (t - last) / 16.7) : 1; last = t;
      c.clearRect(0, 0, w, h);
      P.forEach(function (p, i) {
        p.ph += .02 * dt; p.y += p.vy * dt; p.x += Math.sin(p.ph) * .6 * dt; p.r += p.vr * dt;
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 9000) { var f = (9000 - d2) / 9000 * 3; p.x += dx / Math.sqrt(d2 + 1) * f; p.y += dy / Math.sqrt(d2 + 1) * f; }
        if (p.y > h + 20) P[i] = make(-20);
        petal(p);
      });
      if (vis && !still()) raf = requestAnimationFrame(frame);
    }
    host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    host.addEventListener('pointerleave', function () { mx = my = -999; });
    function kick() { if (!raf && vis && !still()) { last = 0; raf = requestAnimationFrame(frame); } if (still()) c.clearRect(0, 0, w, h); }
    watch(host, function (v) { vis = v; kick(); });
    size(); seed();
    return { kick: kick, size: function () { size(); seed(); } };
  });

  // ---------------------------------------------------------------- the mirror leans toward the hand, its glass catches the light
  var mirror = $('[data-mirror]'), glass = $('[data-glass]');
  hero.addEventListener('pointermove', function (e) {
    if (still() || !fine) return;
    var r = mirror.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    mirror.style.setProperty('--ry', clamp(x * 14, -10, 10).toFixed(2) + 'deg');
    mirror.style.setProperty('--rx', clamp(-y * 10, -8, 8).toFixed(2) + 'deg');
    glass.style.setProperty('--sx', (x * 80).toFixed(1) + '%');
  });
  hero.addEventListener('pointerleave', function () { mirror.style.setProperty('--ry', '0deg'); mirror.style.setProperty('--rx', '0deg'); });

  // ---------------------------------------------------------------- the ring of smaller mirrors: turns by itself, with the scroll and with a drag
  var ring = (function () {
    var wrap = $('[data-ringwrap]'), el = $('[data-ring]');
    $$('.rc', el).forEach(function (cd) { var k = cd.cloneNode(true); el.appendChild(k); });
    var cards = $$('.rc', el), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = true, last = 0;
    function R() { var st = $('[data-stage]'); return Math.min(st.clientWidth * .5, phone() ? innerWidth * .44 : 420); }
    function place(a0) {
      var r = R();
      cards.forEach(function (cd, i) {
        var a = a0 + i * step, f = Math.cos(a * Math.PI / 180);
        cd.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + r.toFixed(1) + 'px)';
        cd.style.opacity = (.25 + .75 * Math.max(0, f) * Math.max(0, f)).toFixed(3);
      });
    }
    function frame(t) {
      raf = 0;
      if (still()) { place(15); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (7 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      place(rot + scrollY * .05 * (rtl() ? 1 : -1));
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    el.style.transform = 'rotateX(-8deg)';
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .3; vel = Math.abs(dx) * 2; });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- STUDIO: the mirror opens into the room, each corner opens out of an arch
  var studio = $('[data-studio]'), frameEl = $('[data-frame]'), shots = $$('[data-shot]'), amb = $$('.st-amb img'), stage = 0;
  var FOCI = [[60, 55], [35, 45], [45, 60]];
  function archPath(W, Hh, x0, x1, yt, yb, r) {
    r = Math.min(r, (x1 - x0) / 2);
    return 'path("M' + x0.toFixed(1) + ' ' + yb.toFixed(1) + 'V' + (yt + r).toFixed(1) + 'A' + r.toFixed(1) + ' ' + r.toFixed(1) + ' 0 0 1 ' + (x0 + r).toFixed(1) + ' ' + yt.toFixed(1) +
      'H' + (x1 - r).toFixed(1) + 'A' + r.toFixed(1) + ' ' + r.toFixed(1) + ' 0 0 1 ' + x1.toFixed(1) + ' ' + (yt + r).toFixed(1) + 'V' + yb.toFixed(1) + 'Z")';
  }
  function setStage(s) {
    if (s === stage && shots[s].__on) return;
    stage = s;
    $$('[data-st-go]').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.stGo === s ? 'true' : 'false'); });
    amb.forEach(function (im, i) { im.classList.toggle('on', i === s); });
    shots.forEach(function (sh, i) {
      var on = i === s; sh.__on = on; sh.classList.toggle('on', on);
      $$('.spot', sh).forEach(function (sp, k) {
        sp.classList.toggle('on', on); sp.classList.toggle('on-st', on);
        if (on) setTimeout(function () { decode($('.tag', sp), sp.dataset[root.lang]); }, 250 + k * 220);
      });
    });
  }
  function studioScene() {
    var W = frameEl.clientWidth, Hh = frameEl.clientHeight;
    if (still()) { shots.forEach(function (sh) { sh.style.clipPath = ''; }); frameEl.style.clipPath = ''; frameEl.style.setProperty('--rimo', 1); return; }
    var r = studio.getBoundingClientRect(), span = studio.offsetHeight - innerHeight, p = clamp(-r.top / span, 0, 1);
    // the frame opens from a small arch (the hero's mirror) to the full window
    var g = smooth(p / .14), aw = lerp(W * .66, W, g), ah = lerp(aw * 1.53, Hh, g), x0 = (W - aw) / 2;
    frameEl.style.clipPath = g >= 1 ? '' : archPath(W, Hh, x0 - 6, x0 + aw + 6, Hh - ah - 6, Hh + 6, lerp(aw / 2 + 6, 26, g));
    frameEl.style.setProperty('--rimo', (1 - g * .0).toFixed(2));
    // each next shot opens out of the previous one through a growing arch; nothing underneath can show
    var ir = [[.26, .44], [.6, .78]];
    shots.forEach(function (sh, i) {
      if (!i) return;
      var q = smooth((p - ir[i - 1][0]) / (ir[i - 1][1] - ir[i - 1][0]));
      if (q <= 0) { sh.style.clipPath = 'path("M0 0Z")'; return; }
      if (q >= 1) { sh.style.clipPath = 'none'; return; }
      var w2 = lerp(0, Math.max(W, Hh) * 2.6, q), cx = W / 2, yt = lerp(Hh * .7, -Hh * 1.4, q);
      sh.style.clipPath = archPath(W, Hh, cx - w2 / 2, cx + w2 / 2, yt, Hh + 10, w2 / 2);
    });
    // a slow camera move into each shot
    shots.forEach(function (sh, i) {
      var a = i === 0 ? 0 : ir[i - 1][0], b = i === 2 ? 1 : ir[i][1];
      var z = 1 + .14 * smooth((p - a) / (b - a)), fg = $('.fg', sh);
      fg.style.setProperty('--z', z.toFixed(4)); fg.style.setProperty('--ox', FOCI[i][0] + '%'); fg.style.setProperty('--oy', FOCI[i][1] + '%');
    });
    setStage(p < .36 ? 0 : p < .7 ? 1 : 2);
  }
  function studioGo(s, quiet) {
    if (still()) { shots.forEach(function (sh) { sh.style.clipPath = ''; }); setStage(s); return; }
    if (quiet) return;
    var targets = [.2, .52, .9], span = studio.offsetHeight - innerHeight;
    scrollTo({ top: studio.offsetTop + targets[s] * span, behavior: 'smooth' });
  }
  $$('[data-st-go]').forEach(function (b) { b.addEventListener('click', function () { studioGo(+b.dataset.stGo); }); });
  $('[data-st-prev]').addEventListener('click', function () { studioGo((stage + 2) % 3); });
  $('[data-st-next]').addEventListener('click', function () { studioGo((stage + 1) % 3); });

  $$('.spot').forEach(function (sp) { sp.classList.toggle('r', parseFloat(sp.style.getPropertyValue('--x')) > 50); });

  // ---------------------------------------------------------------- tiles: colour returns under the hand (on phones the light walks by itself)
  var litTiles = $$('[data-lit]');
  litTiles.forEach(function (t) {
    var im = $('img', t), col = im.cloneNode(); col.className = 'col'; col.alt = ''; col.removeAttribute('data-alt-he'); col.removeAttribute('data-alt-en'); col.setAttribute('aria-hidden', 'true'); t.insertBefore(col, im.nextSibling);
    t.__col = col; t.__rad = 0; t.__tr = 0;
    t.addEventListener('pointermove', function (e) { if (!fine) return; var r = t.getBoundingClientRect(); col.style.setProperty('--mx', (e.clientX - r.left) + 'px'); col.style.setProperty('--my', (e.clientY - r.top) + 'px'); t.__tr = Math.max(r.width, r.height) * .55; t.__hand = 1; });
    t.addEventListener('pointerleave', function () { t.__tr = 0; t.__hand = 0; });
  });
  var tileRaf = 0, tileVis = false;
  function tiles(t) {
    tileRaf = 0; var s = t / 1000;
    litTiles.forEach(function (tl, i) {
      if (!tl.__hand) {
        var r = tl.getBoundingClientRect(), cy = (r.top + r.height / 2) / innerHeight;
        // without a mouse: a soft light walks over the photos as they pass the middle of the screen
        tl.__tr = Math.max(r.width, r.height) * .55 * clamp(1 - Math.abs(cy - .5) * 2, 0, 1);
        tl.__col.style.setProperty('--mx', (50 + Math.sin(s * .7 + i) * 28) + '%');
        tl.__col.style.setProperty('--my', (50 + Math.cos(s * .5 + i * 2) * 28) + '%');
      }
      tl.__rad = lerp(tl.__rad, tl.__tr, .12);
      tl.__col.style.setProperty('--rad', tl.__rad.toFixed(1) + 'px');
    });
    if (tileVis && !still()) tileRaf = requestAnimationFrame(tiles);
  }
  watch($('[data-work]'), function (v) { tileVis = v; if (v && !tileRaf) tileRaf = requestAnimationFrame(tiles); });

  // ---------------------------------------------------------------- reviews: they land one by one (desktop row, phone deck)
  var deck = $('[data-deck]'), rvs = $$('[data-rv]', deck), top = 0;
  function deckPhone() {
    rvs.forEach(function (c, i) {
      var k = (i - top + rvs.length) % rvs.length;
      c.style.zIndex = 10 - k; c.style.setProperty('--tx', (k * (rtl() ? -10 : 10)) + 'px'); c.style.setProperty('--ty', (k * 14) + 'px');
      c.style.setProperty('--rot', (k ? (k % 2 ? 3 : -3) : 0) + 'deg'); c.style.opacity = k > 2 ? 0 : 1;
    });
  }
  $('[data-deck-next]').addEventListener('click', function () { top = (top + 1) % rvs.length; deckPhone(); });

  // ---------------------------------------------------------------- composer: the message writes itself on the mirror
  var form = $('[data-form]'), bubble = $('[data-bubble]'), send = $('[data-send]'), dayBox = $('[data-days]'), typing = 0, shown = '';
  function nextOpen() { var n = now(), d = n.d; if (H[d] && n.h < H[d][1] - 1) return d; for (var k = 1; k < 8; k++) { var x = (d + k) % 7; if (H[x]) return x; } return 0; }
  function days() {
    var cur = form.day ? form.day.value : String(nextOpen()), l = he(), html = '';
    for (var d = 0; d < 7; d++) if (H[d]) html += '<label><input type="radio" name="day" value="' + d + '"' + (String(d) === cur ? ' checked' : '') + '><span>' + (l ? 'יום ' + dayHe[d] : dayEn[d]) + '</span></label>';
    dayBox.innerHTML = html;
  }
  function msg() {
    var l = he(), w = form.what.value, d = +form.day.value, p = form.part.value, nm = ($('[data-name]').value || '').trim();
    if (l) {
      var hi = nm ? 'שלום, כאן ' + nm + '.' : 'שלום!';
      if (w === 'ask') return hi + ' יש לי שאלה:';
      var what = { cut: 'תור לתספורת', blow: 'תור לפן', color: 'תור לצבע' }[w], part = { m: 'בבוקר', n: 'בצהריים', a: 'אחר הצהריים' }[p];
      return hi + ' אשמח לקבוע ' + what + ' ביום ' + dayHe[d] + ' ' + part + '. מתי נוח לך?';
    }
    var hiE = nm ? 'Hi, this is ' + nm + '.' : 'Hi!';
    if (w === 'ask') return hiE + ' I have a question:';
    var whatE = { cut: 'a haircut', blow: 'a blow-dry', color: 'a colour appointment' }[w], partE = { m: 'morning', n: 'around midday', a: 'afternoon' }[p];
    return hiE + ' I’d like to book ' + whatE + ' on ' + dayEn[d] + ' ' + partE + '. When would suit you?';
  }
  function write(instant) {
    if (!form.day) days();
    var fri = form.day && form.day.value === '5', late = $('[data-late]');
    late.classList.toggle('off', fri); if (fri && form.part.value === 'a') form.part.value = 'n';
    var ask = form.what.value === 'ask';
    $$('[data-step]', form).slice(1, 3).forEach(function (s) { s.style.opacity = ask ? .45 : ''; });
    var m = msg();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    clearInterval(typing);
    if (instant || still()) { bubble.textContent = m; bubble.classList.remove('typing'); shown = m; return; }
    var keep = 0; while (keep < shown.length && shown[keep] === m[keep]) keep++;
    var i = keep; bubble.classList.add('typing');
    typing = setInterval(function () { i += 2; bubble.textContent = m.slice(0, i); if (i >= m.length) { clearInterval(typing); bubble.classList.remove('typing'); } }, 22);
    shown = m;
  }
  function light(step) { $$('[data-step]', form).forEach(function (s) { s.classList.toggle('lit', s === step); }); }
  form.addEventListener('change', function (e) { light(e.target.closest('[data-step]')); write(); });
  form.addEventListener('input', function (e) { if (e.target.matches('[data-name]')) { light(e.target.closest('[data-step]')); write(); } });
  form.addEventListener('focusin', function (e) { light(e.target.closest('[data-step]')); });
  days(); light($('[data-step]', form));
  var wroteOnce = false;
  watch($('[data-write]'), function (v) { if (v && !wroteOnce) { wroteOnce = true; shown = ''; write(); } }, { threshold: .3 });

  // ---------------------------------------------------------------- footer: the name rises, fitted to the width
  var mark = $('[data-fit]'), ml = $('[data-rise-letters]');
  ml.innerHTML = ml.textContent.split('').map(function (c, i) { return c === ' ' ? ' ' : '<span class="ch" style="--i:' + i + '">' + c + '</span>'; }).join('');
  function fitMark() { mark.style.fontSize = '100px'; var w = mark.parentElement.clientWidth, sw = mark.scrollWidth; mark.style.fontSize = Math.min(220, Math.floor(100 * w / sw * .96)) + 'px'; }
  watch($('[data-foot]'), function (v) { if (v) $('[data-foot]').classList.add('in'); }, { threshold: .25 });

  // ---------------------------------------------------------------- one scroll loop: nav pill, seams, the visit photo
  var work = $('[data-work]'), scal = $('[data-scallop]'), reviews = $('[data-reviews]'), visit = $('[data-visit]'), vph = $('[data-vphoto]'), vimg = $('img', vph);
  function scene() {
    nav.classList.toggle('pill', scrollY > 40);
    studioScene();
    var calm = still();
    // awning seam: the scallops unroll as the blue rises over the studio
    var wr = work.getBoundingClientRect(), sp = clamp((innerHeight - wr.top) / (innerHeight * .5), 0, 1);
    scal.style.setProperty('--sc', calm ? 1 : (.15 + .85 * smooth(sp)).toFixed(3));
    scal.style.setProperty('--sx', calm ? '0px' : ((1 - sp) * 28).toFixed(1) + 'px');
    // stacked seam: the blush plate slides over the work, which settles back under it
    var rr = reviews.getBoundingClientRect(), k = calm ? 0 : clamp((innerHeight - rr.top) / innerHeight, 0, 1);
    work.style.setProperty('--ws', (1 - .05 * k).toFixed(4)); work.style.setProperty('--wb', (1 - .35 * k).toFixed(3));
    // reviews land: desktop row, one after another
    if (!phone()) {
      var lp = calm ? 1 : clamp((innerHeight - rr.top) / (innerHeight * .9), 0, 1);
      rvs.forEach(function (c, i) {
        var q = smooth((lp - .25 - i * .14) / .4);
        c.style.zIndex = ''; c.style.opacity = '';
        c.style.setProperty('--tx', '0px'); c.style.setProperty('--ty', ((1 - q) * 70).toFixed(1) + 'vh');
        c.style.setProperty('--rot', lerp((i - 1) * 14, parseFloat(getComputedStyle(c).getPropertyValue('--rest')) || 0, q).toFixed(2) + 'deg');
      });
    } else deckPhone();
    // visit: the photo fills the screen, then settles into its arched frame
    var vr = visit.getBoundingClientRect(), slot = $('.v-grid'), W = vph.clientWidth, Hh = vph.clientHeight;
    if (calm) { vph.style.removeProperty('--clip'); visit.style.setProperty('--vo', 1); return; }
    var cs = getComputedStyle(slot), gx = slot.getBoundingClientRect(), pad = parseFloat(cs.paddingTop);
    var cols = cs.gridTemplateColumns.split(' ').map(parseFloat), colW = phone() ? gx.width : cols[0];
    var sx0 = rtl() && !phone() ? gx.right - vr.left - colW : gx.left - vr.left, sy0 = gx.top - vr.top + pad, sh = phone() ? innerHeight * .62 : Math.min(innerHeight * .8, 720);
    var vp = clamp((innerHeight - vr.top) / (innerHeight * 1.05), 0, 1), q2 = smooth((vp - .15) / .75);
    var x0 = lerp(0, sx0, q2), x1 = lerp(W, sx0 + colW, q2), yt = lerp(0, sy0, q2), yb = lerp(Hh, sy0 + sh, q2);
    vph.style.setProperty('--clip', archPath(W, Hh, x0, x1, yt, yb, lerp(0, (x1 - x0) / 2, q2)));
    vimg.style.setProperty('--vz', (1.12 - .12 * q2).toFixed(4));
    visit.style.setProperty('--vo', smooth((q2 - .55) / .4).toFixed(3));
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; scene(); }); } }, { passive: true });
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { petals.forEach(function (p) { p.size(); p.kick(); }); fitMark(); scene(); }, 120); });

  // ---------------------------------------------------------------- start
  texts(root.lang); hours(); write(true); setStage(0); fitMark(); scene();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitMark);
  if (!io) $('[data-foot]').classList.add('in');
  window.__pm = true;
})();
