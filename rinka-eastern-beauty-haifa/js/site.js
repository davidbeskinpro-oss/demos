(function () {
  var root = document.documentElement, WA = '972549670331';
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
  var TITLE = { he: 'רינקה · טיפוח פנים, ארומתרפיה, מניקור ופדיקור · דרך הים 75, חיפה', en: 'Rinka · Facials, aromatherapy, manicure & pedicure · 75 Derech HaYam, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Rinka Eastern Beauty · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Rinka Eastern Beauty · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לרינקה, 054-967-0331', 'Call Rinka, 054-967-0331');
    aria('[data-t-what]', 'טיפול', 'Treatment');
    aria('[data-t-when]', 'מתי נוח', 'Time of day');
    aria('[data-lb]', 'תמונה', 'Photo');
    $$('[data-decode]').forEach(function (b) { b.textContent = b.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('rk-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout(); tick();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('rk-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI(); clearInline();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    hero.classList.add('open', 'lit'); words.classList.add('in');
    layout(); petals.kick(); smoke.kick(); write(true); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8, 18.5], 1: [8, 18.5], 2: [8, 18.5], 3: [8, 18.5], 4: [8, 18.5], 5: [8, 15.5], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
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
  $$('[data-bento] [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 6 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // cursor spotlight on the tiles
  $$('[data-tile]').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // odometers: figures roll up once seen
  $$('[data-odo]').forEach(function (el) {
    var target = el.dataset.odo, dec = (target.split('.')[1] || '').length, v = parseFloat(target), done = false;
    watch(el, function (vis) {
      if (!vis || done) return; done = true; if (still()) return;
      var t0 = performance.now();
      (function st(t) { var k = smooth((t - t0) / 1300); el.textContent = (v * k).toFixed(dec); if (k < 1) requestAnimationFrame(st); else el.textContent = target; })(t0);
    });
  });

  // glyph-decode: a label settles out of scrambled letters
  function decode(el) {
    var target = el.dataset[he() ? 'he' : 'en'], set = he() ? 'אבגדהוזחטיכלמנסעפצקרשת' : 'abcdefghijklmnopqrstuvwxyz', t0 = performance.now();
    if (still()) { el.textContent = target; return; }
    (function st(t) {
      var k = (t - t0) / 520, n = Math.floor(k * target.length), s = '';
      for (var i = 0; i < target.length; i++) s += i < n || target[i] === ' ' ? target[i] : set[Math.floor(Math.random() * set.length)];
      el.textContent = s; if (k < 1) requestAnimationFrame(st); else el.textContent = target;
    })(t0);
  }

  var hero = $('[data-hero]'), nav = $('[data-nav]'), words = $('[data-words]');
  // phone dock: hidden while the hero's own call/WhatsApp buttons are on screen
  var dock = $('[data-dock]'); dock.classList.add('away');
  watch($('.h-cta'), function (v) { dock.classList.toggle('away', v); });

  // ---------------------------------------------------------------- opening: the ink of her real logo gathers, the screen opens
  (function () {
    var op = $('[data-opening]'), logo = $('[data-logo]', op), cv = $('[data-opcanvas]', op), done = false;
    function finish() { if (done) return; done = true; op.classList.add('gone'); hero.classList.add('open', 'lit'); }
    if (still()) { finish(); return; }
    op.addEventListener('click', finish);
    setTimeout(finish, 2200);   // never blocks longer than this
    function run() {
      try {
        var c = cv.getContext('2d'), w = cv.clientWidth, h = cv.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
        cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
        var sc = document.createElement('canvas'), iw = 185, ih = 146; sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(logo, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data, P = [];
        for (var y = 0; y < ih; y += 2) for (var x = 0; x < iw; x += 2) if (d[(y * iw + x) * 4 + 3] > 120) P.push({ hx: x / iw * w, hy: y / ih * h, x: Math.random() * w, y: Math.random() * h, dl: Math.random() * .35 });
        var t0 = performance.now();
        (function fr(t) {
          var T = (t - t0) / 1000; c.clearRect(0, 0, w, h);
          for (var i = 0; i < P.length; i++) { var p = P[i], k = smooth((T - p.dl) / .75); c.fillStyle = k < 1 ? 'rgba(180,86,106,' + (.4 + k * .5) + ')' : '#2a1a1f'; c.fillRect(lerp(p.x, p.hx, k), lerp(p.y, p.hy, k), 1.8, 1.8); }
          if (T < 1.15) requestAnimationFrame(fr); else { op.classList.add('ink'); setTimeout(finish, 380); }
        })(t0);
      } catch (e) { finish(); }
    }
    if (logo.complete && logo.naturalWidth) run(); else { logo.addEventListener('load', run, { once: true }); logo.addEventListener('error', finish, { once: true }); }
  })();

  // ---------------------------------------------------------------- sakura petals over the hero: drift, part around the hand, a tap sends a gust
  var petals = (function () {
    var cv = $('[data-petals]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = true, mx = -999, my = -999, gust = 0;
    var COL = ['#f2bfc4', '#f7d9d6', '#e9a3ad', '#fbe6e1'];
    function mk(any) { return { x: Math.random() * w, y: any ? Math.random() * h : -20, s: 6 + Math.random() * 9, r: Math.random() * 6.3, vr: (Math.random() - .5) * .04, vx: .2 + Math.random() * .5, vy: .35 + Math.random() * .6, ph: Math.random() * 6.3, col: COL[Math.floor(Math.random() * COL.length)], px: 0 }; }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); var n = phone() ? 18 : 34; P = []; for (var i = 0; i < n; i++) P.push(mk(true)); }
    function petal(p, flip) {
      c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.scale(Math.cos(p.ph) * .9 + .1 * (flip ? -1 : 1), 1);
      c.fillStyle = p.col; c.globalAlpha = .85;
      c.beginPath(); c.moveTo(0, p.s); c.bezierCurveTo(-p.s * .9, p.s * .2, -p.s * .5, -p.s, 0, -p.s * .7); c.bezierCurveTo(p.s * .5, -p.s, p.s * .9, p.s * .2, 0, p.s); c.fill();
      c.restore();
    }
    function frame() {
      raf = 0; c.clearRect(0, 0, w, h);
      var calm = still(), dir = rtl() ? -1 : 1;
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        if (!calm) {
          p.ph += .03; p.r += p.vr; p.x += (p.vx * dir + Math.sin(p.ph) * .4) * (1 + gust); p.y += p.vy * (1 + gust * .4);
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 14000) { var f = (14000 - d2) / 14000 * 3, dd = Math.sqrt(d2) || 1; p.x += dx / dd * f; p.y += dy / dd * f; }
          if (p.y > h + 20 || p.x > w + 30 || p.x < -30) { var q = mk(false); q.x = Math.random() * w; P[i] = q; }
        }
        petal(p, i % 2);
      }
      gust *= .96;
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function () { gust = 3; });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    size();
    return { kick: kick, size: function () { size(); kick(); } };
  })();

  // hero photo leans to the hand (desktop) and drifts with the scroll (phones)
  var hw = $('[data-tilt]');
  hero.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    hw.style.transform = 'translate3d(' + (x * -18).toFixed(1) + 'px,' + (y * -14).toFixed(1) + 'px,0) scale(1.03)';
  });

  // ---------------------------------------------------------------- the real wisp of smoke from her warming stick
  $$('[data-fill] > span[lang]').forEach(function (sp) { sp.innerHTML = sp.innerHTML.split(/(<em>.*?<\/em>|\s+)/).map(function (w) { return !w || /^\s+$/.test(w) ? w : '<span class="fw">' + w + '</span>'; }).join(''); });
  var fws = $$('[data-fill] .fw');
  var ritual = $('[data-ritual]'), rtPhoto = $('[data-rtphoto]'), rtImg = $('img', rtPhoto), haze = $('[data-haze]'), rtSteps = $$('[data-rtsteps] li'), fillH = $('[data-fill]');
  var TIP = [.356, .078], IW = 1210, IH = 1500, OPY = .3;
  function tipPos() {   // where the glowing tip is, with object-fit: cover
    var st = rtPhoto.parentNode, W = st.clientWidth, Hh = st.clientHeight, s = Math.max(W / IW, Hh / IH), dw = IW * s, dh = IH * s, L = (W - dw) * .35, T = (Hh - dh) * OPY;
    return { x: L + TIP[0] * dw, y: T + TIP[1] * dh, top: T, L: L, dw: dw, dh: dh, ox: TIP[0] * dw, oy: TIP[1] * dh };
  }
  var smoke = (function () {
    var cv = $('[data-smoke]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = false, rate = .5, mx = -999, ex = 0, ey = 0, lastT = 0;
    function size() { var dpr = Math.min(1.5, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function emit(n) { for (var i = 0; i < n; i++) P.push({ x: ex + (Math.random() - .5) * 3, y: ey, vx: (Math.random() - .5) * .25, vy: -(.7 + Math.random() * .6), r: 2 + Math.random() * 2, a: .5, life: 0, ph: Math.random() * 6.3 }); }
    function draw(t) {
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, 'rgba(244,222,220,' + (p.a * .85).toFixed(3) + ')'); g.addColorStop(1, 'rgba(244,222,220,0)');
        c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
      }
    }
    function step(dt, T) {
      for (var i = P.length - 1; i >= 0; i--) {
        var p = P[i]; p.life += dt;
        p.vx += Math.sin(T * 1.3 + p.ph + p.y * .012) * .02; p.x += p.vx * dt * 60; p.y += p.vy * dt * 60;
        if (mx > -999) { var dx = p.x - mx; if (Math.abs(dx) < 90 && Math.abs(p.y - my) < 120) p.vx += (dx > 0 ? 1 : -1) * .06; }
        p.r += dt * (8 + p.life * 14); p.a = Math.max(0, .5 - p.life * .11);
        if (p.a <= 0 || p.y < -p.r) P.splice(i, 1);
      }
    }
    function frame(t) {
      raf = 0; var dt = Math.min(.05, (t - (lastT || t)) / 1000); lastT = t;
      emit(Math.random() < rate ? Math.ceil(rate * 2) : 0); step(dt, t / 1000); draw();
      if (vis && !still()) raf = requestAnimationFrame(frame); else lastT = 0;
    }
    function stillFrame() {   // a finished wisp for animations-off
      P = []; for (var k = 0; k < 140; k++) { emit(1); step(1 / 30, k / 30); } draw();
    }
    ritual.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    ritual.addEventListener('pointerleave', function () { mx = -999; });
    watch(ritual, function (v) { vis = v; kick(); });
    function kick() { if (still()) { stillFrame(); return; } if (vis && !raf) raf = requestAnimationFrame(frame); }
    size();
    return { kick: kick, size: size, at: function (x, y, r) { ex = x; ey = y; rate = r; } };
  })();
  
  // ---------------------------------------------------------------- the folding screen of her photos
  var byobu = $('[data-byobu]'), pns = $$('[data-pn]', byobu), bAim = 0;
  function byobuLayout(e) {
    var W = byobu.clientWidth, Hh = byobu.clientHeight, ph = phone(), per = ph ? 3 : pns.length, rows = ph ? 2 : 1, gap = ph ? 14 : 0;
    var A = lerp(76, ph ? 26 : 22, e) * Math.PI / 180, pw = (W - 24) / (per * Math.cos(A * 0 + (ph ? 26 : 22) * Math.PI / 180)), rh = (Hh - gap * (rows - 1)) / rows;
    pw = Math.min(pw, rh * .85);
    for (var r = 0; r < rows; r++) {
      var xs = [], zs = [], x = 0, z = 0, k;
      for (k = 0; k < per; k++) { var th = (k % 2 ? -A : A); xs.push(x); zs.push(z); x += pw * Math.cos(th); z -= pw * Math.sin(th); }
      var off = (W - x) / 2;
      for (k = 0; k < per; k++) {
        var p = pns[r * per + k]; if (!p) continue;
        var th2 = (k % 2 ? -A : A), deg = th2 * 180 / Math.PI;
        p.style.width = pw + 'px'; p.style.height = rh + 'px';
        p.style.transform = 'translate3d(' + (off + xs[k]).toFixed(1) + 'px,' + (r * (rh + gap)).toFixed(1) + 'px,' + (zs[k] + (ph ? 0 : 60)).toFixed(1) + 'px) rotateY(' + (deg + bAim).toFixed(2) + 'deg)';
        p.style.setProperty('--b', (k % 2 ? .78 + .22 * e : 1).toFixed(3));
      }
    }
  }
  byobu.addEventListener('pointermove', function (ev) { if (still() || ev.pointerType !== 'mouse') return; var r = byobu.getBoundingClientRect(); bAim = ((ev.clientX - r.left) / r.width - .5) * 8; tick(); });
  byobu.addEventListener('pointerleave', function () { bAim = 0; tick(); });
  var lb = $('[data-lb]'), lbImg = $('[data-lbimg]');
  pns.forEach(function (p) { p.addEventListener('click', function () {
    var im = $('img', p); lbImg.src = im.src; lbImg.alt = im.alt;
    if (lb.showModal) { lb.showModal(); if (!still() && lb.animate) { var r = p.getBoundingClientRect(), d = lb.getBoundingClientRect(); lb.animate([{ transform: 'translate(' + (r.left + r.width / 2 - d.left - d.width / 2) + 'px,' + (r.top + r.height / 2 - d.top - d.height / 2) + 'px) scale(' + (r.width / d.width).toFixed(3) + ',' + (r.height / d.height).toFixed(3) + ')', opacity: .4 }, { transform: 'none', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.23,1,.32,1)' }); } }
  }); });
  $('[data-lbx]').addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });

  // reviews: slips land on the cord, then sway with the scroll's speed
  watch(words, function (v) { if (v) words.classList.add('in'); }, { threshold: .2 });
  var slips = $$('.slip'), sway = 0, lastY = scrollY;

  // ---------------------------------------------------------------- the note to Rinka, writing itself
  var whats = $$('[data-what]'), whens = $$('[data-when]'), nsteps = $$('[data-nsteps] li'), bead = $('.bead'), msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
  function lightStep(i) { nsteps.forEach(function (s, k) { s.classList.toggle('on', k <= i); }); }
  whats.forEach(function (b) { b.addEventListener('click', function () { whats.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); lightStep(0); write(); }); });
  whens.forEach(function (b, i) { b.addEventListener('click', function () { whens.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lightStep(1); placeBead(); write(); }); });
  function placeBead() { var i = whens.findIndex(function (x) { return x.getAttribute('aria-checked') === 'true'; }); bead.style.transform = 'translateX(' + (i * 100 * (rtl() ? -1 : 1)) + '%)'; }
  $('[data-send]').addEventListener('pointerenter', function () { lightStep(2); });
  $('[data-send]').addEventListener('focus', function () { lightStep(2); });
  function compose() {
    var l = he(), w = whats.filter(function (x) { return x.getAttribute('aria-pressed') === 'true'; })[0], t = whens.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0];
    return l ? 'שלום רינקה, אשמח לקבוע ' + w.dataset.he + '. הכי נוח לי ' + t.dataset.he + '.'
             : 'Hi Rinka, I’d like to book ' + w.dataset.en + '. The best time for me is ' + t.dataset.en + '.';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var visit = $('[data-visit]'), vphoto = $('[data-vphoto]'), vcards = $$('[data-vcards] > *'), foot = $('[data-foot]'), fscreen = $('[data-fscreen]'), mainEl = $('main');
  var ticking = false, stepOn = -1;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function clearInline() {
    [rtPhoto, haze, $('.rt-copy'), vphoto, hw].forEach(function (el) { el.style.transform = ''; el.style.opacity = ''; });
    vcards.forEach(function (c) { c.style.opacity = ''; c.style.transform = ''; });
  }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // ritual: the camera climbs the stick to the glowing tip, the haze thickens into the next section's ground
    var tp = tipPos();
    rtPhoto.style.cssText += ';left:' + tp.L.toFixed(1) + 'px;top:' + tp.top.toFixed(1) + 'px;width:' + tp.dw.toFixed(1) + 'px;height:' + tp.dh.toFixed(1) + 'px';
    if (!calm) {
      var p = prog(ritual), e = smooth(p / .5), sc = lerp(1, phone() ? 2.2 : 1.6, e);
      var tyMax = (tp.y - tp.top) * sc - tp.y, ty = Math.min(lerp(0, vh * .38 - tp.y, e), tyMax);
      rtPhoto.style.setProperty('--ox', tp.ox + 'px'); rtPhoto.style.setProperty('--oy', tp.oy + 'px');
      rtPhoto.style.transform = 'translate3d(0,' + Math.max(0, ty).toFixed(1) + 'px,0) scale(' + sc.toFixed(4) + ')';
      smoke.at(tp.x, tp.y + Math.max(0, ty), lerp(.55, 2.4, e));
      var hz = smooth((p - .45) / .4) * .62; haze.style.opacity = hz.toFixed(3);
      $('.rt-copy').style.opacity = (1 - smooth((p - .42) / .14)).toFixed(3);
      var fk = smooth(p / .16); fws.forEach(function (w, i) { var n = fws.length / 2; w.classList.toggle('on', fk >= ((i % n) + 1) / n - .001); });
      var on = p < .05 ? -1 : p < .15 ? 0 : p < .27 ? 1 : 2;
      if (on !== stepOn) { rtSteps.forEach(function (li, i) { var was = li.classList.contains('on'); li.classList.toggle('on', i <= on); if (i <= on && !was) decode($('b', li)); }); stepOn = on; }
    } else smoke.at(tp.x, tp.y, .5);
    // folding screen unfolds as it rises into view
    var br = byobu.getBoundingClientRect(), be = calm ? 1 : smooth((vh - br.top) / (vh * .75));
    byobuLayout(be);
    // slips sway with the scroll's speed
    var dy = scrollY - lastY; lastY = scrollY;
    if (!calm) { sway = clamp(lerp(sway, dy * .25, .3), -7, 7); slips.forEach(function (s, i) { s.style.setProperty('--sw', (sway * (i % 2 ? -1 : 1) * (.7 + (i % 3) * .15)).toFixed(2) + 'deg'); }); if (Math.abs(sway) > .05) tick(); }
    // visit: the full-screen photo shrinks into its frame, the cards rise beside it (wide screens)
    if (!calm && innerWidth > 860) {
      var kp = prog(visit), s2 = smooth(kp / .55), W = visit.clientWidth, side = W * .53, pad = W * .04;
      vphoto.style.setProperty('--pt', (vh * .11 * s2).toFixed(1) + 'px'); vphoto.style.setProperty('--pb', (vh * .11 * s2).toFixed(1) + 'px');
      vphoto.style.setProperty('--pl', ((rtl() ? side : pad) * s2).toFixed(1) + 'px'); vphoto.style.setProperty('--pr', ((rtl() ? pad : side) * s2).toFixed(1) + 'px');
      vphoto.style.setProperty('--rr', (24 * s2).toFixed(1) + 'px');
      vcards.forEach(function (c, i) { var v = smooth((s2 - .55 - i * .07) / .25); c.style.opacity = v.toFixed(3); c.style.transform = v >= 1 ? '' : 'translateY(' + ((1 - v) * 30).toFixed(1) + 'px)'; });
    } else { ['--pt', '--pb', '--pl', '--pr', '--rr'].forEach(function (k) { vphoto.style.removeProperty(k); }); vcards.forEach(function (c) { c.style.opacity = ''; c.style.transform = ''; }); }
    // footer curtain: the paper screens slide open on her logo as the footer is uncovered
    var fo = calm ? 1 : smooth((vh - mainEl.getBoundingClientRect().bottom) / (foot.offsetHeight * .8));
    fscreen.style.setProperty('--fo', fo.toFixed(3));
    // phones: the hero photo drifts with the scroll
    if (!calm && phone()) hw.style.transform = 'translate3d(0,' + (Math.min(scrollY, vh) * .06).toFixed(1) + 'px,0) scale(1.04)';
  }
  function layout() { petals.size(); smoke.size(); placeBead(); tick(); }
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', layout);

  texts(root.lang === 'en' ? 'en' : 'he'); hours(); write(true); layout();
  if (still()) { words.classList.add('in'); }
})();
