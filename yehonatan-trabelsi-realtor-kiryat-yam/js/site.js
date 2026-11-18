(function () {
  var root = document.documentElement, WA = '972526584854';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var TITLE = { he: 'יהונתן טרבלסי · תיווך בקריות · מרטין בובר 4, קריית ים', en: 'Yehonatan Trabelsi · Krayot Real Estate · 4 Martin Buber St, Kiryat Yam' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור תיווך בקריות יהונתן טרבלסי · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Yehonatan Trabelsi Krayot Real Estate · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- colour helpers: the sky of one day, morning to night
  function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function mix(a, b, t) { a = hex(a); b = hex(b); return 'rgb(' + Math.round(lerp(a[0], b[0], t)) + ',' + Math.round(lerp(a[1], b[1], t)) + ',' + Math.round(lerp(a[2], b[2], t)) + ')'; }
  // [position in the day, sky top, sky bottom, sun colour, sun x, sun y]
  var DAY = [
    [0, '#122a3d', '#2d5064', '#f7c98c', .16, .8],
    [.3, '#163650', '#2a5a73', '#ffe2ad', .42, .14],
    [.62, '#2a2338', '#6a3b45', '#f39a5f', .74, .56],
    [.84, '#0e1724', '#1c2a3c', '#e7cfae', .86, .92],
    [1, '#0a121c', '#101c2a', '#cfd9e2', .92, 1.15]
  ];
  function sky(t) {
    t = clamp(t, 0, 1); var i = 0; while (i < DAY.length - 2 && t > DAY[i + 1][0]) i++;
    var a = DAY[i], b = DAY[i + 1], u = smooth((t - a[0]) / (b[0] - a[0]));
    return { top: mix(a[1], b[1], u), bot: mix(a[2], b[2], u), sun: mix(a[3], b[3], u), x: lerp(a[4], b[4], u), y: lerp(a[5], b[5], u) };
  }

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'יהונתן טרבלסי, תיווך בקריות', 'Yehonatan Trabelsi, Krayot Real Estate');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-do]', 'מה אתם רוצים לעשות', 'What you’d like to do');
    aria('[data-t-where]', 'באיזו קריה', 'Which of the Krayot');
    aria('[data-sunrange]', 'שעה נוחה לשיחה', 'A good time to talk');
    aria('[data-t-call]', 'התקשרו ליהונתן, 052-658-4854', 'Call Yehonatan, 052-658-4854');
    aria('[data-t-wa]', 'וואטסאפ ליהונתן', 'WhatsApp Yehonatan');
    aria('[data-fname]', 'יהונתן טרבלסי', 'Yehonatan Trabelsi');
    $$('[data-decode]').forEach(function (el) { decode(el, el.dataset[l]); });
    front = -1;
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('yt-lang', l); } catch (e) {}
    texts(l); hours(); write(true); splitName(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- labels that decode out of scrambled glyphs
  var GLYPHS = 'אבגדהוזחטיכלמנסעפצקרשת0123456789ABCDEFGHKLMNRSTXZ';
  function decode(el, text) {
    cancelAnimationFrame(el._raf || 0);
    if (still() || !text) { el.textContent = text || ''; return; }
    var t0 = performance.now(), dur = 700;
    (function st(t) {
      var u = clamp((t - t0) / dur, 0, 1), n = Math.floor(u * text.length), out = text.slice(0, n);
      for (var i = n; i < text.length; i++) out += text[i] === ' ' || text[i] === '·' ? text[i] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      el.textContent = out;
      if (u < 1) el._raf = requestAnimationFrame(st);
    })(t0);
  }

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('yt-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    resetStill(); layout(); ribs.kick(); glit.kick(); rot.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [8, 22], 1: [8, 22], 2: [8, 22], 3: [8, 22], 4: [8, 22], 5: [8, 12], 6: null };
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
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
    dial(n.h);
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
  // the sun dial in the hours tile: where the sun is over Kiryat Yam right now (rises ~6, sets ~19 into the sea)
  function dial(h) {
    var s = $('[data-dsun]'), on = $('[data-arcon]'); if (!s) return;
    var t = clamp((h - 6) / 13, 0, 1), a = Math.PI * (1 - t), len = Math.PI * 86;
    s.setAttribute('cx', (100 + 86 * Math.cos(a) * (rtl() ? -1 : 1)).toFixed(1)); s.setAttribute('cy', (100 - 86 * Math.sin(a)).toFixed(1));
    s.style.fill = h < 6 || h > 19 ? '#cfd9e2' : '';
    on.style.strokeDasharray = (len * t).toFixed(1) + ' ' + len.toFixed(1);
    on.style.transform = rtl() ? 'scaleX(-1)' : ''; on.style.transformOrigin = '100px 0';
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 70 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter, out of a blur
  $$('[data-split] .ln span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 13 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });
  // a customer's sentence fills in letter by letter with the scroll
  var fillq = $('[data-fill]'), fillCh = {};
  $$('p[lang]', fillq).forEach(function (p) {
    p.innerHTML = p.textContent.split(' ').map(function (w) { return '<span class="w" style="white-space:nowrap">' + w.split('').map(function (c) { return '<span class="fc">' + c + '</span>'; }).join('') + '</span>'; }).join(' ');
    fillCh[p.lang] = $$('.fc', p);
  });
  // odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 4) % 10; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- HERO: reeded glass over his portrait
  var ribs = (function () {
    var win = $('[data-win]'), box = $('[data-ribs]'), src = $('[data-winsrc]'), R = [], N = 0, W = 0, Hh = 0, base = null, raf = 0, vis = true, mx = .5, my = .5, tmx = .5, sp = 0;
    function build() {
      N = phone() ? 5 : 7; box.innerHTML = ''; R = [];
      for (var k = 0; k < N; k++) { var r = document.createElement('div'); r.className = 'rib'; var i = document.createElement('i'); i.style.setProperty('--k', k); i.style.setProperty('--dir', k % 2 ? 1 : -1); i.style.backgroundImage = 'url(' + src.currentSrc + ')'; r.appendChild(i); box.appendChild(r); R.push(r); }
      win.classList.add('ribbed'); size();
    }
    function size() {
      W = win.clientWidth; Hh = win.clientHeight; if (!W) return;
      var s = Math.max(W / 1600, Hh / 1066) * 1.07, iw = 1600 * s, ih = 1066 * s;
      base = { iw: iw, ih: ih, x: (W - iw) * .58, y: (Hh - ih) * .3 };
      R.forEach(function (r, k) { var l = Math.floor(k * W / N); r.style.left = l + 'px'; r.style.width = (Math.ceil(W / N) + 1) + 'px'; r.firstChild.style.backgroundSize = iw.toFixed(1) + 'px ' + ih.toFixed(1) + 'px'; r._l = l; });
      draw(performance.now());
    }
    function draw(t) {
      if (!base) return;
      var T = t / 1000, c = (N - 1) / 2, calm = still();
      R.forEach(function (r, k) {
        var sh = calm ? 0 : Math.sin(T * .7 + k * 1.15) * (phone() ? 4 : 6) + (mx - .5) * (k - c) * 16;
        r.firstChild.style.backgroundPosition = (base.x - r._l + sh).toFixed(1) + 'px ' + (base.y + (calm ? 0 : (my - .5) * 8)).toFixed(1) + 'px';
        r.style.transform = calm || sp <= 0 ? '' : 'translate3d(' + ((k - c) * sp * 12).toFixed(1) + 'px,' + ((k % 2 ? 1 : -1) * sp * 26).toFixed(1) + 'px,0)';
      });
    }
    function frame(t) {
      raf = 0; mx = lerp(mx, phone() ? .5 + Math.sin(t / 2400) * .45 : tmx, .08);
      draw(t); if (vis && !still()) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = win.getBoundingClientRect(); tmx = clamp((e.clientX - r.left) / r.width, -.2, 1.2); my = clamp((e.clientY - r.top) / r.height, 0, 1); });
    watch(hero, function (v) { vis = v; kick(); });
    if (src.complete && src.naturalWidth) build(); else src.addEventListener('load', build, { once: true });
    return { size: function () { if (R.length && (N !== (phone() ? 5 : 7))) build(); else size(); }, kick: kick, spread: function (v) { sp = v; if (still() || !vis) draw(performance.now()); } };
  })();

  // ---------------------------------------------------------------- the sea glitters under the horizon, brighter near the hand
  var glit = (function () {
    var cv = $('[data-glitter]'), c = cv.getContext('2d'), P = [], w = 0, h = 0, raf = 0, vis = true, px = -999, py = -999;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 140 : 300; P = [];
      for (var i = 0; i < n; i++) { var yn = Math.pow(Math.random(), 1.7); P.push({ x: Math.random(), y: yn, s: .8 + yn * 2.6, ph: Math.random() * 6.28, sp: .8 + Math.random() * 2.2, l: 4 + yn * 22 }); }
      draw(performance.now());
    }
    function draw(t) {
      c.clearRect(0, 0, w, h); var T = t / 1000, calm = still();
      for (var i = 0; i < P.length; i++) {
        var p = P[i], x = p.x * w, y = p.y * h, a = calm ? .35 : Math.pow(Math.max(0, Math.sin(T * p.sp + p.ph)), 5);
        var dx = x - px, dy = y - py; if (dx * dx + dy * dy < 22000) a = Math.min(1, a + .6);
        if (a < .03) continue;
        c.globalAlpha = a * (1 - p.y * .55); c.fillStyle = p.y < .35 ? '#fff1d6' : '#f3c58a';
        c.fillRect(x - p.l / 2, y, p.l, p.s * .6);
      }
      c.globalAlpha = 1;
    }
    function frame(t) { raf = 0; draw(t); if (vis && !still()) raf = requestAnimationFrame(frame); }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { px = py = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- HOMES: a round glass room seen from inside
  var rot = (function () {
    var wrap = $('[data-rotwrap]'), el = $('[data-rot]'), cap = $('[data-rotcap]');
    $$('.pane', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $$('img', k).forEach(function (i) { i.removeAttribute('data-alt-he'); i.alt = ''; }); el.appendChild(k); });
    var cards = $$('.pane', el), N = cards.length, step = 360 / N, a0 = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = false, last = 0, R = 1000;
    function size() { var pw = cards[0].offsetWidth || 300; R = pw * 2.5; wrap.style.perspective = R.toFixed(0) + 'px'; }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; c.style.visibility = ''; }); el.style.transform = ''; return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { a0 += (5 + vel) * dt * (rtl() ? -1 : 1); vel *= .94; }
      var sc = scrollY * .045 * (rtl() ? -1 : 1), best = 1e9, bi = 0;
      el.style.transform = 'translateZ(' + (R * .78).toFixed(1) + 'px)';
      cards.forEach(function (c, i) {
        var a = ((a0 + sc + i * step) % 360 + 540) % 360 - 180, f = Math.cos(a * Math.PI / 180);
        if (Math.abs(a) > 70) { c.style.visibility = 'hidden'; return; }
        c.style.visibility = '';
        c.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + (-R).toFixed(1) + 'px)';
        c.style.filter = 'brightness(' + (.45 + .55 * Math.pow(f, 5)).toFixed(3) + ')';
        if (Math.abs(a) < best) { best = Math.abs(a); bi = i % (N / 2); }
      });
      if (bi !== front) { front = bi; var fc = $('figcaption', cards[bi]); decode(cap, fc.dataset[he() ? 'he' : 'en']); }
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; a0 += dx * .12; vel = dx * 1.2; });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(wrap, function (v) { vis = v; if (v) kick(); }, { rootMargin: '100px 0px' });
    return { kick: kick, size: size };
  })();
  var front = -1;

  // ---------------------------------------------------------------- DOORS: the glass wall slides open onto the sea
  var doors = (function () {
    var sec = $('[data-doors]'), stage = $('.d-stage', sec), box = $('[data-front]'), src = $('[data-doorsrc]'), S = [], N = 0, W = 0, Hh = 0, base = null, ready = false;
    function build() {
      N = phone() ? 4 : 6; box.innerHTML = ''; S = [];
      for (var k = 0; k < N; k++) { var s = document.createElement('div'); s.className = 'slice'; var i = document.createElement('i'); i.style.backgroundImage = 'url(' + (src.currentSrc || src.src) + ')'; s.appendChild(i); box.appendChild(s); S.push(s); }
      ready = true; size();
    }
    function size() {
      if (!ready) return; W = stage.clientWidth; Hh = stage.clientHeight; if (!W) return;
      var s = Math.max(W / 1600, Hh / 900), iw = 1600 * s, ih = 900 * s;
      base = { iw: iw, ih: ih, x: (W - iw) * .42, y: (Hh - ih) * .5 };
      S.forEach(function (sl, k) {
        var l = Math.floor(k * W / N); sl._l = l; sl._k = k;
        sl.style.left = l + 'px'; sl.style.width = (Math.ceil(W / N) + 1) + 'px';
        sl.style.zIndex = k < N / 2 ? k + 1 : N - k;   // the inner doors travel over the outer ones
      });
    }
    function set(p) {
      if (!base) return;
      var z = 1 + .32 * smooth(p / .42), o = smooth((p - .34) / .44), ox = W * .4, oy = Hh * .46;
      var iw = base.iw * z, ih = base.ih * z, x = ox + (base.x - ox) * z, y = oy + (base.y - oy) * z, half = N / 2;
      S.forEach(function (sl) {
        var k = sl._k, left = k < half, rank = left ? k + 1 : N - k;
        var dist = o * (W / 2 + 60) * rank / half * (left ? -1 : 1);
        sl.style.transform = o > 0 ? 'translate3d(' + dist.toFixed(1) + 'px,0,0)' : '';
        sl.style.setProperty('--fe', o > .01 ? 1 : 0);
        sl.firstChild.style.width = W + 'px'; sl.firstChild.style.left = '0';
        sl.firstChild.style.backgroundSize = iw.toFixed(1) + 'px ' + ih.toFixed(1) + 'px';
        sl.firstChild.style.backgroundPosition = (x - sl._l).toFixed(1) + 'px ' + y.toFixed(1) + 'px';
      });
      var fo = 1 - smooth((p - .22) / .14), bo = smooth((p - .56) / .24);
      stage.style.setProperty('--fo', fo.toFixed(3)); stage.style.setProperty('--fy', ((1 - fo) * -30).toFixed(1) + 'px');
      stage.style.setProperty('--bo', bo.toFixed(3)); stage.style.setProperty('--by', ((1 - bo) * 34).toFixed(1) + 'px');
      stage.style.setProperty('--bs', (1.14 - .14 * o).toFixed(4));
    }
    if (src.complete && src.naturalWidth) build(); else { src.loading = 'eager'; src.addEventListener('load', build, { once: true }); }
    return { size: function () { if (ready && N !== (phone() ? 4 : 6)) build(); else size(); }, set: set, sec: sec };
  })();

  // ---------------------------------------------------------------- WRITE: the live message, the sun you drag
  var steps = $$('[data-step]');
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  var groups = {};
  $$('[data-group]').forEach(function (g, gi) {
    var bs = $$('button', g); groups[g.dataset.group] = bs;
    bs.forEach(function (b) { b.addEventListener('click', function () { bs.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lightStep(gi); write(); }); });
    g.addEventListener('keydown', function (e) {
      var i = bs.indexOf(document.activeElement); if (i < 0) return;
      var d = e.key === 'ArrowDown' || e.key === (rtl() ? 'ArrowLeft' : 'ArrowRight') ? 1 : e.key === 'ArrowUp' || e.key === (rtl() ? 'ArrowRight' : 'ArrowLeft') ? -1 : 0;
      if (!d) return; e.preventDefault(); var n = bs[(i + d + bs.length) % bs.length]; n.focus(); n.click();
    });
  });
  var range = $('[data-sunrange]'), view = $('[data-view]'), hourEl = $('[data-hour]');
  function sunView() {
    var h = +range.value, t = (h - 8) / 13.5, s = sky(.08 + t * .8);
    view.style.setProperty('--va', s.top); view.style.setProperty('--vb', s.bot); view.style.setProperty('--vc', s.sun);
    var x = rtl() ? 85 - t * 70 : 15 + t * 70;
    view.style.setProperty('--vx', x.toFixed(1) + '%'); view.style.setProperty('--vy', (72 - Math.sin(Math.PI * Math.min(1, t * 1.15)) * 56).toFixed(1) + '%');
    hourEl.textContent = hhmm(h);
  }
  range.addEventListener('input', function () { sunView(); lightStep(2); write(); });
  var msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
  function pick(g) { return groups[g].filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0]; }
  function compose() {
    var l = he(), d = pick('do').dataset[l ? 'he' : 'en'], w = pick('where').dataset[l ? 'he' : 'en'], h = hhmm(+range.value);
    return l ? 'שלום יהונתן, אני רוצה ' + d + ' דירה ' + w + '. נוח לי לדבר בסביבות ' + h + '.'
             : 'Hi Yehonatan, I’d like to ' + d + ' an apartment ' + w + '. A good time to talk is around ' + h + '.';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
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
  watch(view, function (v) { if (v && !chatSeen) { chatSeen = true; lightStep(0); shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- bento spotlight
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- footer name, letter by letter
  var foot = $('[data-foot]'), fname = $('[data-fname]'), fch = [];
  function splitName() {
    $$('span[lang]', fname).forEach(function (sp) { if (sp.dataset.done) return; sp.dataset.done = 1; sp.innerHTML = sp.textContent.split('').map(function (c) { return '<span class="ch">' + (c === ' ' ? '&nbsp;' : c) + '</span>'; }).join(''); });
    fch = $$('span[lang="' + root.lang + '"] .ch', fname);
  }
  splitName();
  // on phones the sun and moon step aside while the hero's own buttons are on screen
  watch($('.h-acts'), function (v) { $('[data-sunmoon]').classList.toggle('hide', v); });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var skyEl = $('[data-sky]'), sunEl = $('[data-sun]'), tower = $('[data-tower] img'), revs = $$('.rv'), room = $('[data-room]'), sunmoon = $('[data-sunmoon]'), footH = 0;
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function resetStill() {
    if (!still()) return;
    revs.forEach(function (r) { r.style.removeProperty('--rx'); r.style.opacity = ''; });
    ribs.spread(0);
  }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, max = Math.max(1, document.documentElement.scrollHeight - vh), p = clamp(scrollY / max, 0, 1);
    nav.classList.toggle('pill', scrollY > 40);
    var s = sky(p);
    skyEl.style.setProperty('--sky-a', s.top); skyEl.style.setProperty('--sky-b', s.bot); skyEl.style.setProperty('--sun-c', s.sun);
    sunEl.style.setProperty('--sx', (rtl() ? 1 - s.x : s.x) * innerWidth + 'px'); sunEl.style.setProperty('--sy', s.y * vh + 'px');
    // hero ribs open apart on the way out
    var hr = hero.getBoundingClientRect();
    ribs.spread(calm ? 0 : clamp(-hr.top / (hr.height * .8), 0, 1));
    // the camera tilts up the tower
    var tr = tower.parentNode.getBoundingClientRect(), tp = clamp((vh - tr.top) / (vh + tr.height), 0, 1);
    tower.style.setProperty('--ty', calm ? '-7.5%' : (lerp(-15, 0, tp)).toFixed(2) + '%');
    // the quote fills in
    var fr = fillq.getBoundingClientRect(), fp = calm ? 1 : clamp((vh * .9 - fr.top) / (vh * .55), 0, 1), chs = fillCh[root.lang] || [];
    var nOn = Math.round(fp * chs.length); chs.forEach(function (c, i) { c.classList.toggle('on', i < nOn); });
    // the doors
    if (!calm) { var dr = doors.sec.getBoundingClientRect(); doors.set(clamp(-dr.top / Math.max(1, dr.height - vh), 0, 1)); }
    // reviews: panes slide along their tracks
    revs.forEach(function (r, i) {
      if (calm) return;
      var rr = r.parentNode.getBoundingClientRect(), single = innerWidth <= 560, base = single ? r.getBoundingClientRect().top : rr.top;
      var v = single ? smooth((vh * 1.02 - base) / (vh * .42)) : smooth((vh * 1.05 - rr.top) / (vh * .6) - i * .16);
      var dir = rtl() ? -1 : 1;
      r.style.setProperty('--rx', ((1 - v) * dir * (single ? 70 : 220 + i * 60)).toFixed(1) + 'px');
      r.style.opacity = (.15 + .85 * v).toFixed(3);
    });
    // the day's light crosses the room
    var rm = room.getBoundingClientRect(), rp = clamp((vh - rm.top) / (vh + rm.height), 0, 1);
    room.style.setProperty('--bx', calm ? '30%' : lerp(-50, 100, rp).toFixed(1) + '%');
    room.style.setProperty('--rb', calm ? '.8' : (.55 + .4 * Math.sin(Math.PI * rp)).toFixed(3));
    // the footer curtain
    var reveal = clamp((scrollY + vh - (max + vh - footH)) / Math.max(1, footH), 0, 1);
    foot.style.visibility = reveal > 0 || scrollY > max - footH - 40 ? 'visible' : 'hidden';
    foot.style.setProperty('--fb', (.35 + .45 * reveal).toFixed(3));
    $('.f-horizon', foot).style.setProperty('--rise', calm ? '0px' : ((1 - reveal) * 90).toFixed(1) + 'px');
    fch.forEach(function (c, i) { var u = calm ? 1 : smooth(reveal * 1.6 - i * .05); c.style.setProperty('--cy', ((1 - u) * .7).toFixed(3) + 'em'); c.style.setProperty('--co', (.1 + .9 * u).toFixed(3)); });
  }

  function layout() {
    footH = foot.offsetHeight; root.style.setProperty('--foot-h', footH + 'px');
    ribs.size(); glit.size(); rot.size(); doors.size(); sunView(); status(); tick();
  }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); lw = innerWidth; }, 140); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); ribs.kick(); glit.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { go(); layout(); });
  setTimeout(go, 1200);
  addEventListener('load', function () { layout(); });
})();
