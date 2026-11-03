(function () {
  var root = document.documentElement, WA = '972524496396';
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
  var TITLE = { he: 'מכון דוד לפיזיותרפיה · הרב בר אילן 13, קריית מוצקין', en: 'David Physiotherapy Clinic · 13 HaRav Bar Ilan St, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור מכון דוד לפיזיותרפיה · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for David Physiotherapy Clinic · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'מכון דוד לפיזיותרפיה', 'David Physiotherapy Clinic');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-spots]', 'איפה כואב', 'Where it hurts');
    aria('[data-t-since]', 'ממתי', 'Since when');
    aria('[data-t-call]', 'התקשרו למכון דוד, 052-449-6396', 'Call David Physiotherapy, 052-449-6396');
    aria('[data-t-wa]', 'וואטסאפ למכון דוד', 'WhatsApp David Physiotherapy');
    $$('.rv .stars').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
    $$('.fc figcaption').forEach(function (f) { f.textContent = f.dataset[l]; });
    $$('.spot').forEach(function (s) { var t = s.dataset[l === 'he' ? 'lhe' : 'len']; $('b', s).textContent = t; s.setAttribute('aria-label', t); });
    var ifr = $('.v-map iframe'); if (ifr) ifr.title = l === 'he' ? 'Google Maps: הרב בר אילן 13, קריית מוצקין' : 'Google Maps: 13 HaRav Bar Ilan St, Kiryat Motzkin';
    tapeText();
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('md-lang', l); } catch (e) {}
    texts(l); hours(); picked(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('md-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-odo]').forEach(function (o) { roll(o, true); });
    layout(); fan.kick(); fibres.kick(); band.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [8, 18], 1: [8, 16], 2: [8, 16], 3: [8, 18], 4: [8, 16], 5: [8, 11], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function isAllDay(t) { return t && t[0] === 0 && t[1] === 24; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (isAllDay(t)) { open = true; txt = l ? 'פתוח עכשיו · כל היום' : 'Open now · all day'; }
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
    // the day as an arc from 6:00 to 20:00; green = today's open hours, the coral hand = now
    var pt = function (h) { var a = Math.PI * (1 - (clamp(h, 6, 20) - 6) / 14); return [100 + 80 * Math.cos(a), 110 - 80 * Math.sin(a)]; };
    var arc = $('[data-openarc]'), hand = $('[data-nowhand]');
    if (t) { var a0 = pt(t[0]), a1 = pt(t[1]); arc.setAttribute('d', 'M' + a0[0].toFixed(1) + ' ' + a0[1].toFixed(1) + 'A80 80 0 0 1 ' + a1[0].toFixed(1) + ' ' + a1[1].toFixed(1)); } else arc.setAttribute('d', '');
    var p = pt(n.h), dx = p[0] - 100, dy = p[1] - 110, s = 66 / 80;
    hand.setAttribute('x2', (100 + dx * s).toFixed(1)); hand.setAttribute('y2', (110 + dy * s).toFixed(1));
    hand.style.opacity = n.h < 6 || n.h > 20 ? .35 : 1;
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = isAllDay(t) ? (l ? '24 שעות' : '24 hours') : t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 14 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), heroVis = true;
  watch(hero, function (v) { heroVis = v; if (v) { fan.kick(); fibres.kick(); } });

  // ---------------------------------------------------------------- fibres: fine lines like the hatching of an anatomy engraving,
  // flowing slowly and parting around the hand (on phones a slow invisible hand drifts through them)
  var fibres = (function () {
    var cv = $('[data-fibres]'), c = cv.getContext('2d'), w = 0, h = 0, raf = 0, mx = -999, my = -999, t0 = performance.now(), L = [];
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 34 : 64; L = [];
      for (var i = 0; i < n; i++) L.push({ y: (i + .5) / n, a: 10 + Math.random() * 26, f: .0025 + Math.random() * .004, s: .2 + Math.random() * .35, ph: Math.random() * 6.28, hot: Math.random() < .14 });
    }
    function draw(T) {
      c.clearRect(0, 0, w, h);
      var hx = mx, hy = my;
      if (!fine && !still()) { hx = w * (.5 + .38 * Math.sin(T * .23)); hy = h * (.45 + .3 * Math.sin(T * .31 + 1)); }
      var step = phone() ? 22 : 18;
      for (var i = 0; i < L.length; i++) {
        var l = L[i], y0 = l.y * h;
        c.beginPath();
        for (var x = -20; x <= w + 20; x += step) {
          var y = y0 + Math.sin(x * l.f + T * l.s + l.ph) * l.a + Math.sin(x * .0011 + T * .12) * 18;
          var dx = x - hx, dy = y - hy, d2 = dx * dx + dy * dy;
          if (d2 < 22500) { var k = (22500 - d2) / 22500; y += (dy >= 0 ? 1 : -1) * k * k * 70; }
          x === -20 ? c.moveTo(x, y) : c.lineTo(x, y);
        }
        c.strokeStyle = l.hot ? 'rgba(255,125,102,.16)' : 'rgba(243,235,223,.065)';
        c.lineWidth = l.hot ? 1.4 : 1; c.stroke();
      }
    }
    function frame(t) {
      raf = 0; draw((t - t0) / 1000);
      if (!still() && heroVis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    return { size: function () { size(); draw((performance.now() - t0) / 1000); }, kick: kick };
  })();

  // ---------------------------------------------------------------- the goniometer fan
  var fan = (function () {
    var el = $('[data-fan]'), cards = $$('.fc', el), N = cards.length, proto = $('[data-proto]'), arm = $('[data-arm]'), degEl = $('[data-deg]');
    var R = 300, step = 25, period = 175, cw = 180, ch = 230, base = 0, vel = 0, drag = false, lx = 0, raf = 0, last = 0, opened = 0, openT = -1, front = -1;
    var tx = 0, ty = 0, ptx = 0, pty = 0, shownDeg = -1;
    function build() {
      var W = el.clientWidth, ph = phone();
      cw = ph ? 112 : clamp(W * .12, 150, 205); ch = Math.round(cw * 1.3);
      var fh = ph ? Math.round(ch / 2 + 245) : Math.round(clamp(innerHeight * .58, 420, 600));
      R = fh - ch / 2 - 14; step = ph ? 31 : 25; period = N * step;
      el.style.setProperty('--cw', cw + 'px'); el.style.setProperty('--ch', ch + 'px'); el.style.setProperty('--fh', fh + 'px');
      var Rp = Math.max(70, R - ch / 2 - 22), cx = W / 2, cy = fh;
      el.style.setProperty('--armh', (Rp + 6) + 'px');
      var s = '<path class="face" d="M' + (cx - Rp) + ' ' + cy + 'A' + Rp + ' ' + Rp + ' 0 0 1 ' + (cx + Rp) + ' ' + cy + 'Z"/>';
      for (var a = 0; a <= 180; a += 2) {
        var mj = a % 10 === 0, r0 = Rp - (mj ? 14 : 7), rad = Math.PI * (1 - a / 180), co = Math.cos(rad), si = Math.sin(rad);
        s += '<line class="tk' + (mj ? ' mj' : '') + '" x1="' + (cx + co * r0).toFixed(1) + '" y1="' + (cy - si * r0).toFixed(1) + '" x2="' + (cx + co * Rp).toFixed(1) + '" y2="' + (cy - si * Rp).toFixed(1) + '"/>';
        if (a % 30 === 0 && a > 0 && a < 180) s += '<text x="' + (cx + co * (Rp - 30)).toFixed(1) + '" y="' + (cy - si * (Rp - 30)).toFixed(1) + '">' + a + '</text>';
      }
      s += '<path class="rim" d="M' + (cx - Rp) + ' ' + cy + 'A' + Rp + ' ' + Rp + ' 0 0 1 ' + (cx + Rp) + ' ' + cy + '"/>';
      proto.setAttribute('viewBox', '0 0 ' + W + ' ' + fh); proto.innerHTML = s;
    }
    var GL = 'אבגדהוזחטיכלמנסעפצקרשת0123456789°';
    function decode(fc) {
      var cap = $('figcaption', fc); if (!cap) return; var txt = cap.dataset[root.lang], t0 = performance.now();
      clearInterval(fc._d);
      if (still()) { cap.textContent = txt; return; }
      fc._d = setInterval(function () {
        var k = (performance.now() - t0) / 420, n = Math.floor(k * txt.length);
        cap.textContent = txt.split('').map(function (c, i) { return i < n || c === ' ' ? c : GL[Math.floor(Math.random() * GL.length)]; }).join('');
        if (k >= 1) { clearInterval(fc._d); cap.textContent = txt; }
      }, 40);
    }
    function frame(t) {
      raf = 0;
      var calm = still(), dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (openT < 0) openT = t;
      opened = calm ? 1 : smooth((t - openT - 250) / 1300);
      if (!calm && !drag) { base += (4 + vel) * dt * (rtl() ? -1 : 1); vel *= .93; }
      var T = t / 1000, hr = hero.getBoundingClientRect();
      var sp = calm ? .5 : clamp(-hr.top / Math.max(1, hr.height * .55), 0, 1);
      var phi = calm ? 0 : lerp(-48, 48, sp) + Math.sin(T * .6) * 7 * opened;
      phi = lerp(-90, phi, opened);
      var total = calm ? 0 : base + scrollY * .04 * (rtl() ? -1 : 1);
      if (!fine && !calm) { tx = Math.sin(T * .8) * 7; ty = Math.cos(T * .6) * 5; } else { tx += (ptx - tx) * .08; ty += (pty - ty) * .08; }
      var best = 1e9, bi = 0, th = [];
      for (var i = 0; i < N; i++) {
        var a = ((total + i * step) % period + period) % period; if (a >= period / 2) a -= period;
        th.push(a); var dd = Math.abs(a - phi); if (dd < best) { best = dd; bi = i; }
      }
      if (bi !== front) { front = bi; decode(cards[bi]); }
      for (var j = 0; j < N; j++) {
        var c = cards[j], a2 = lerp(phi, th[j], opened), near = Math.max(0, 1 - Math.abs(a2 - phi) / step), isF = j === bi;
        var vis = clamp((period / 2 - Math.abs(th[j])) / (step * .9), 0, 1);
        var lift = isF ? near : 0, r = R + lift * 18;
        var tf = 'rotate(' + a2.toFixed(2) + 'deg) translateY(' + (-r).toFixed(1) + 'px)';
        if (isF) tf += ' perspective(700px) rotateY(' + (tx * near).toFixed(2) + 'deg) rotateX(' + (-ty * near).toFixed(2) + 'deg)';
        tf += ' scale(' + (1 + lift * .1).toFixed(3) + ')';
        c.style.transform = tf; c.style.opacity = vis.toFixed(3); c.style.zIndex = isF ? 20 : 10 - Math.round(Math.abs(th[j]) / step);
        c.style.filter = 'brightness(' + (.5 + .5 * Math.max(near, isF ? near : 0) + (isF ? 0 : .08)).toFixed(3) + ')';
      }
      arm.style.transform = 'rotate(' + phi.toFixed(2) + 'deg)';
      var deg = Math.round(90 + phi); if (deg !== shownDeg) { shownDeg = deg; degEl.textContent = deg; }
      if (!calm && heroVis && !document.hidden) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    el.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; el.classList.add('drag'); });
    addEventListener('pointermove', function (e) {
      if (drag) { var dx = e.clientX - lx; lx = e.clientX; base += dx * .18; vel = dx * 1.6 * (rtl() ? -1 : 1); return; }
      if (e.pointerType !== 'mouse') return;
      var r = el.getBoundingClientRect(); ptx = clamp(((e.clientX - r.left) / r.width - .5) * 2, -1, 1) * 12; pty = clamp(((e.clientY - r.top) / r.height - .5) * 2, -1, 1) * 9;
    });
    addEventListener('pointerup', function () { drag = false; el.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; el.classList.remove('drag'); });
    return { build: build, kick: kick };
  })();

  // ---------------------------------------------------------------- the band across the seam: the scroll pulls its middle down;
  // past the end it lets go and snaps back, ringing out; scrolling back up hooks it again
  var band = (function () {
    var box = $('[data-band]'), svg = $('[data-bandsvg]'), body = $('.b-body', svg), shine = $('.b-shine', svg), shadow = $('.b-shadow', svg), grip = $('.b-grip', svg), ends = $$('.b-end', svg); // taste-skill-ignore: the band casts a soft shadow on the page
    var W = 1000, Y = 120, d = 0, v = 0, hooked = true, target = 0, raf = 0, last = 0, maxD = 160, gripA = 0;
    function size() {
      W = box.clientWidth; Y = box.clientHeight / 2; maxD = Math.min(190, innerHeight * .22);
      ends[0].setAttribute('x', 4); ends[1].setAttribute('x', W - 32);
      ends.forEach(function (e) { e.setAttribute('y', Y - 14); e.setAttribute('width', 28); e.setAttribute('height', 28); });
      draw();
    }
    function draw() {
      var x0 = 30, x1 = W - 30, L0 = x1 - x0, L = 2 * Math.sqrt(L0 * L0 / 4 + d * d), sw = clamp(17 * Math.pow(L0 / L, 3), 6, 17);
      var path = function (o) { return 'M' + x0 + ' ' + (Y + o) + 'Q' + (W / 2) + ' ' + (Y + 2 * d + o) + ' ' + x1 + ' ' + (Y + o); };
      body.setAttribute('d', path(0)); body.setAttribute('stroke-width', sw.toFixed(2));
      shine.setAttribute('d', path(-sw * .22)); shine.setAttribute('stroke-width', (sw * .22).toFixed(2));
      shadow.setAttribute('d', path(8)); shadow.setAttribute('stroke-width', sw.toFixed(2));
      grip.setAttribute('cx', W / 2); grip.setAttribute('cy', Y + d); grip.style.opacity = gripA.toFixed(3);
    }
    function frame(t) {
      raf = 0; var dt = last ? Math.min(.033, (t - last) / 1000) : .016; last = t;
      var k = hooked ? 420 : 300, damp = hooked ? 34 : 5.5;
      v += (-(d - target) * k - v * damp) * dt; d += v * dt;
      gripA += ((hooked && target > 2 ? 1 : 0) - gripA) * .2;
      draw();
      if (Math.abs(v) > .05 || Math.abs(d - target) > .05 || Math.abs(gripA - (hooked && target > 2 ? 1 : 0)) > .01) raf = requestAnimationFrame(frame);
      else { last = 0; }
    }
    function update(vh) {
      if (still()) { d = 0; v = 0; target = 0; gripA = 0; draw(); return; }
      var r = box.getBoundingClientRect(), p = clamp((vh * .82 - (r.top + r.height / 2)) / (vh * .42), 0, 1.2);
      if (hooked && p >= 1) { hooked = false; v = 0; }
      else if (!hooked && p < .9) hooked = true;
      target = hooked ? Math.min(p, 1) * maxD : 0;
      kick();
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    return { size: size, update: update, kick: kick };
  })();

  // ---------------------------------------------------------------- body chart: tap a joint, tape goes on, the message writes itself
  var spots = $$('.spot'), steps = $$('[data-step]'), pain = $('[data-pain]'), painOut = $('[data-painout]'), sinceB = $$('[data-since]'), msgEl = $('[data-msg]');
  spots.forEach(function (s) {
    var x = +s.dataset.x, y = +s.dataset.y;
    s.style.left = (x * 100) + '%'; s.style.top = (y * 100) + '%'; s.style.setProperty('--r', s.dataset.r + 'deg');
    if (x > .72) s.dataset.edge = 's'; else if (x < .28) s.dataset.edge = 'e';
    s.addEventListener('click', function () { s.setAttribute('aria-pressed', s.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); light(0); picked(); write(); });
  });
  function light(i) { steps[i].classList.add('on'); }
  function chosen() { return spots.filter(function (s) { return s.getAttribute('aria-pressed') === 'true'; }); }
  function picked() { $('[data-picked]').textContent = chosen().map(function (s) { return s.dataset[he() ? 'lhe' : 'len']; }).join(' · '); }
  pain.addEventListener('input', function () { painOut.textContent = pain.value; light(1); write(); });
  sinceB.forEach(function (b) { b.addEventListener('click', function () { sinceB.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); light(2); write(); }); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), areas = chosen().map(function (s) { return s.dataset[l ? 'he' : 'en']; }), since = sinceB.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0].dataset[l ? 'he' : 'en'];
    var touchedPain = steps[1].classList.contains('on'), n = pain.value, m;
    if (l) {
      m = 'שלום, אשמח לקבוע תור לפיזיותרפיה.';
      if (areas.length) m += ' כואב לי ' + list(areas, true) + ', כבר ' + since + '.';
      if (touchedPain || areas.length) m += ' עוצמת הכאב: ' + n + ' מתוך 10.';
    } else {
      m = 'Hi, I’d like to book a physiotherapy appointment.';
      if (areas.length) m += ' My ' + list(areas, false) + (areas.length > 1 ? ' have' : ' has') + ' been hurting for ' + since + '.';
      if (touchedPain || areas.length) m += ' Pain level: ' + n + ' out of 10.';
    }
    return m;
  }
  var shown = '', typing = 0, noteSeen = false;
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !noteSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var k = Math.floor((t - t0) / 15);
      shown = k < del ? cur.slice(0, cur.length - k) : target.slice(0, keep + (k - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-note]'), function (v) { if (v && !noteSeen) { noteSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .5 });

  // ---------------------------------------------------------------- the tape seam: the clinic's address printed on a strip of tape
  var tape = $('[data-tape]'), tapes = $$('.tape', tape);
  function tapeText() {
    var s = he() ? 'מכון דוד לפיזיותרפיה · הרב בר אילן 13 · קריית מוצקין · ' : 'David Physiotherapy Clinic · 13 HaRav Bar Ilan St · Kiryat Motzkin · ';
    $$('[data-tapetext]').forEach(function (p) { p.textContent = new Array(7).join(s); });
  }

  // ---------------------------------------------------------------- bento: spotlight under the hand, photos lean toward it
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var tilts = $$('[data-tilt]');
  tilts.forEach(function (t) {
    var img = $('img', t);
    t.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || still()) return;
      var r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      img.style.transform = 'scale(1.06) translate(' + (-x * 18).toFixed(1) + 'px,' + (-y * 14).toFixed(1) + 'px)';
    });
    t.addEventListener('pointerleave', function () { img.style.transform = ''; });
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
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 6) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- reviews rail, visit sweep, footer
  var revs = $('[data-revs]'), rail = $('[data-rail]'), rvs = $$('.rv', rail), rfill = $('[data-rfill]'), rknob = $('[data-rknob]'), extra = 0;
  function railLayout() {
    rail.style.transform = '';
    if (still()) { revs.style.removeProperty('--rh'); return; }
    extra = Math.max(0, rail.scrollWidth - innerWidth);
    revs.style.setProperty('--rh', Math.round(innerHeight + extra + innerHeight * .35) + 'px');
  }
  var sweep = $('[data-sweep]'), sweepImg = $('img', sweep), varm = $('[data-varm]');
  function sweepClip(A) {
    if (A >= 359.5) return 'none';
    var pts = ['50% 50%'];
    for (var a = 0; a <= A; a += 6) pts.push(pos(a));
    pts.push(pos(A));
    function pos(deg) { var r = (deg - 90) * Math.PI / 180, s = rtl() ? -1 : 1; return (50 + s * 150 * Math.cos(r)).toFixed(2) + '% ' + (50 + 150 * Math.sin(r)).toFixed(2) + '%'; }
    return 'polygon(' + pts.join(',') + ')';
  }
  var fword = $('[data-fword]'), foot = $('[data-foot]'), fglow = $('.f-glow');
  function fitWord() {
    fword.style.setProperty('--fw', '100px'); var tf = fword.style.transform; fword.style.transform = 'none';
    var w = $('span[lang="' + root.lang + '"]', fword).offsetWidth; fword.style.transform = tf;
    var avail = foot.clientWidth - 2 * parseFloat(getComputedStyle(foot).paddingLeft);
    fword.style.setProperty('--fw', Math.max(48, Math.min(260, 100 * avail * .96 / w)).toFixed(1) + 'px');
  }

  // phone dock: the band between the grips quivers with the scroll
  var dock = $('[data-dockband]'), wob = 0, wv = 0, wraf = 0, lastY = scrollY;
  function wobble() {
    wraf = 0; wv += -wob * .18; wv *= .82; wob += wv;
    dock.style.setProperty('--wob', wob.toFixed(2) + 'px'); dock.style.setProperty('--sq', (1 - Math.min(.12, Math.abs(wob) * .012)).toFixed(3));
    if (Math.abs(wob) > .05 || Math.abs(wv) > .05) wraf = requestAnimationFrame(wobble);
  }

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) fan.kick();
    band.update(vh);
    // tape unrolls across the seam
    // two strips, laid from opposite sides like a cross taping
    var tr = tape.getBoundingClientRect(), tp = (vh - tr.top) / (vh * .75);
    tapes.forEach(function (t, k) {
      var u = calm ? 1 : smooth(k ? tp * 1.2 - .2 : tp), cut = ((1 - u) * 100).toFixed(2) + '%', fromStart = (k === 0) !== rtl();
      t.style.setProperty('--ce', fromStart ? cut : '0%'); t.style.setProperty('--cs', fromStart ? '0%' : cut);
    });
    // reviews slide sideways
    var rp = calm ? 0 : prog(revs);
    rail.style.transform = calm ? '' : 'translate3d(' + ((rtl() ? 1 : -1) * extra * rp).toFixed(1) + 'px,0,0)';
    // the cards ride a gentle arc, like the scale of a goniometer
    rvs.forEach(function (c) {
      if (calm) { c.style.transform = ''; return; }
      var r = c.getBoundingClientRect(), k = clamp((r.left + r.width / 2 - innerWidth / 2) / innerWidth, -1.2, 1.2);
      var ay = phone() ? 30 : 90, ar = phone() ? 3 : 7; c.style.transform = 'translateY(' + (k * k * ay).toFixed(1) + 'px) rotate(' + (k * ar).toFixed(2) + 'deg)';
    });
    rfill.style.setProperty('--off', (220 * (1 - rp)).toFixed(1)); rknob.setAttribute('cx', (10 + 220 * rp).toFixed(1));
    // phone photos drift with the scroll instead of the hand
    if (!fine && !calm) tilts.forEach(function (t) { var r = t.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return; var k = (r.top + r.height / 2 - vh / 2) / vh; $('img', t).style.transform = 'scale(1.06) translateY(' + (k * -22).toFixed(1) + 'px)'; });
    // Kiryat Motzkin opens like a goniometer arm sweeping round
    var sr = sweep.getBoundingClientRect(), A = calm ? 360 : 360 * smooth((vh * .92 - sr.top) / (vh * .7));
    sweepImg.style.clipPath = sweepClip(A); varm.style.transform = 'rotate(' + ((rtl() ? -1 : 1) * A).toFixed(1) + 'deg)';
    // footer: the name arrives stretched like a band and settles; the glow rises
    var fr = foot.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / (vh * .65));
    fword.style.transform = calm ? '' : 'scale(' + lerp(1.45, 1, fp).toFixed(3) + ',' + lerp(.62, 1, fp).toFixed(3) + ')';
    fglow.style.setProperty('--rise', lerp(80, 30, fp).toFixed(1) + '%');
    // dock
    var dy = scrollY - lastY; lastY = scrollY;
    if (!calm && innerWidth <= 760 && Math.abs(dy) > 1) { wv += clamp(dy, -40, 40) * .06; if (!wraf) wraf = requestAnimationFrame(wobble); }
  }

  function layout() { fan.build(); fibres.size(); band.size(); railLayout(); fitWord(); tick(); fan.kick(); fibres.kick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); lw = innerWidth; }, 140); });
  addEventListener('scroll', tick, { passive: true });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { fan.kick(); fibres.kick(); } });

  texts(root.lang); hours(); picked(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); }); fitWord(); railLayout(); tick(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { railLayout(); fitWord(); tick(); });
})();
