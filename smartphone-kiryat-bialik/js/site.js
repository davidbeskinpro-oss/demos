(function () {
  var root = document.documentElement, WA = '972515400866';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth <= 900; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'Smartphone · מעבדה וחנות סלולר · שדרות וייצמן 24, קריית ביאליק', en: 'Smartphone · Phone repair lab & shop · 24 Weizmann Blvd, Kiryat Bialik' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Smartphone · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Smartphone · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';

  // ---------------------------------------------------------------- language
  function texts(l) {
    var H = l === 'he';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[H ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', H ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-wa],[data-t-wa2]', 'וואטסאפ ל-Smartphone', 'WhatsApp Smartphone');
    aria('[data-t-call]', 'התקשרו ל-Smartphone, 051-540-0866', 'Call Smartphone, 051-540-0866');
    aria('[data-t-call2]', 'התקשרו ל-Smartphone', 'Call Smartphone');
    aria('[data-prev]', 'החלק הקודם', 'Previous part');
    aria('[data-next]', 'החלק הבא', 'Next part');
    aria('[data-t-brands]', 'איזה טלפון', 'Which phone');
    aria('[data-t-visit]', 'הגעה ויצירת קשר', 'Visit and contact');
    aria('.st', '5 כוכבים', '5 stars');
    $('.v-map iframe').title = H ? 'Google Maps: שדרות וייצמן 24, קריית ביאליק' : 'Google Maps: 24 Weizmann Blvd, Kiryat Bialik';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('sp884-lang', l); } catch (e) {}
    texts(l); hours(); lab.lang(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('sp884-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-note]').forEach(function (el) { el.classList.add('in'); });
    resetStyles(); layout(); dots.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status (Israel time). null = closed
  var H = { 0: [9.5, 19], 1: [9.5, 19], 2: [10, 14.5], 3: [9.5, 19], 4: [9.5, 19], 5: [10, 14.5], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, hh: (+o.hour) % 24, mm: o.minute }; }
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
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $('[data-isledot]').classList.toggle('open', open);
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
    $('[data-clock]').textContent = (n.hh !== undefined ? n.hh : Math.floor(n.h)) + ':' + (n.mm !== undefined ? n.mm : '00');
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? (t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>') : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 30000);

  // ---------------------------------------------------------------- entrances
  $$('.bento,.vb').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-note]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline letter by letter
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), slab = $('[data-slab]'), fan = $('.fan');

  // ---------------------------------------------------------------- the logo's four coloured squares, drifting up through the hero
  var dots = (function () {
    var cv = $('[data-dots]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = true, mx = -999, my = -999, last = 0;
    var COL = ['#1b94f0', '#66c08e', '#f08a7e', '#d0698a'];
    function rr(x, y, s, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + s, y, x + s, y + s, r); c.arcTo(x + s, y + s, x, y + s, r); c.arcTo(x, y + s, x, y, r); c.arcTo(x, y, x + s, y, r); c.closePath(); }
    function mk(x, y, burst) {
      var s = 5 + Math.random() * (phone() ? 9 : 13);
      return { x: x, y: y, s: s, col: COL[Math.floor(Math.random() * 4)], a: .18 + Math.random() * .42, vy: -(8 + Math.random() * 18) * (s / 12), vx: 0, ph: Math.random() * 6.28, life: burst ? 1 : -1,
        bx: burst ? (Math.random() - .5) * 260 : 0, by: burst ? (Math.random() - .5) * 260 : 0 };
    }
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 26 : 46; P = []; for (var i = 0; i < n; i++) P.push(mk(Math.random() * w, Math.random() * h));
    }
    function draw() {
      c.clearRect(0, 0, w, h);
      P.forEach(function (p) { c.globalAlpha = p.life >= 0 ? p.a * p.life : p.a; c.fillStyle = p.col; rr(p.x, p.y, p.s, p.s * .28); c.fill(); });
      c.globalAlpha = 1;
    }
    function frame(t) {
      raf = 0; if (!vis || still()) { draw(); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      for (var i = P.length - 1; i >= 0; i--) {
        var p = P[i];
        if (p.life >= 0) { p.x += p.bx * dt; p.y += p.by * dt; p.bx *= .95; p.by *= .95; p.life -= dt * .7; if (p.life <= 0) { P.splice(i, 1); continue; } }
        else {
          p.ph += dt; p.y += p.vy * dt; p.x += Math.sin(p.ph) * 6 * dt + p.vx * dt; p.vx *= .92;
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 16000) { var d = Math.sqrt(d2) || 1, f = (16000 - d2) / 16000 * 900 * dt; p.x += dx / d * f * dt * 8; p.y += dy / d * f * dt * 8; }
          if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w; }
        }
      }
      draw(); raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) { if (still()) return; var r = hero.getBoundingClientRect(); for (var i = 0; i < 10; i++) P.push(mk(e.clientX - r.left, e.clientY - r.top, true)); kick(); });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    return { size: function () { size(); draw(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- the cracked glass: drawn once, healed by the scroll
  var crack = (function () {
    var svg = $('[data-crack]'), seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    svg.setAttribute('viewBox', '0 0 100 200');
    var ix = 66, iy = 124, rays = [], N = 12, out = '';
    for (var k = 0; k < N; k++) {
      var a = k / N * Math.PI * 2 + rnd() * .35, x = ix, y = iy, pts = [[x, y]];
      while (x > -2 && x < 102 && y > -2 && y < 202 && pts.length < 40) { a += (rnd() - .5) * .5; var st = 5 + rnd() * 9; x += Math.cos(a) * st; y += Math.sin(a) * st * 1.1; pts.push([x, y]); }
      rays.push(pts);
      out += '<path pathLength="1" d="M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L') + '"/>';
    }
    [2, 4, 7].forEach(function (ring) {
      for (var k2 = 0; k2 < N; k2++) {
        if (rnd() < .3) continue;
        var A = rays[k2][Math.min(ring, rays[k2].length - 1)], B = rays[(k2 + 1) % N][Math.min(ring, rays[(k2 + 1) % N].length - 1)];
        var mxp = (A[0] + B[0]) / 2 + (rnd() - .5) * 4, myp = (A[1] + B[1]) / 2 + (rnd() - .5) * 4;
        out += '<path class="thin" pathLength="1" d="M' + A[0].toFixed(1) + ' ' + A[1].toFixed(1) + 'L' + mxp.toFixed(1) + ' ' + myp.toFixed(1) + 'L' + B[0].toFixed(1) + ' ' + B[1].toFixed(1) + '"/>';
      }
    });
    out += '<circle cx="' + ix + '" cy="' + iy + '" r="2.6"/>';
    svg.innerHTML = out;
    var paths = $$('path', svg), dot = $('circle', svg);
    paths.forEach(function (p) { p.style.strokeDasharray = '1 2'; });
    return function (hp) {
      paths.forEach(function (p, i) { var thin = p.classList.contains('thin'), v = thin ? smooth(hp / .5) : smooth((hp - .1) / .75); p.style.strokeDashoffset = v.toFixed(4); });
      dot.style.opacity = (1 - smooth((hp - .7) / .2)).toFixed(3);
    };
  })();
  var glare = $('.glare');
  var tilt = { x: 0, y: 0 };
  if (fine) hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); tilt.x = (e.clientX - r.left) / r.width - .5; tilt.y = (e.clientY - r.top) / r.height - .5; tick(); });

  // ---------------------------------------------------------------- services: spotlight under the hand, the cases photo pans with it
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var acc = $('.t-acc');
  acc.addEventListener('pointermove', function (e) { if (still()) return; var r = acc.getBoundingClientRect(); acc.style.setProperty('--px', (10 + 80 * (e.clientX - r.left) / r.width).toFixed(1) + '%'); });

  // ---------------------------------------------------------------- lab: the cover comes off, a lamp walks across the open phone
  var lab = (function () {
    var sec = $('[data-lab]'), pin = $('.lab-pin'), img = $('[data-labcam] img'), cover = $('[data-cover]'), screws = $$('.scr'), tag = $('[data-tag]'), tagTxt = $('[data-tagtxt]'), line = $('[data-stopline]'), chipBox = $('[data-chips]');
    var IW = 1600, IH = 1064, cur = -1, stillStop = 0, decodeT = 0;
    var S = [
      { x: .45, y: .5, z: 1, he: ['', 'טלפון פתוח על השולחן, חלק אחרי חלק.'], en: ['', 'An opened phone on the table, part by part.'] },
      { x: .655, y: .19, z: 2.3, he: ['ברגים זעירים', 'קטנים מגרגר אורז.'], en: ['Tiny screws', 'Smaller than a grain of rice.'] },
      { x: .43, y: .36, z: 2, he: ['לוח האם', 'הלב של הטלפון.'], en: ['The logic board', 'The heart of the phone.'] },
      { x: .15, y: .36, z: 1.9, he: ['סוללה', 'כשהיא כבר לא מחזיקה יום.'], en: ['Battery', 'When it no longer lasts the day.'] },
      { x: .235, y: .72, z: 1.7, he: ['מסך', 'זכוכית, מגע ותצוגה.'], en: ['Screen', 'Glass, touch and display.'] }
    ];
    var N = S.length, chips = [];
    S.forEach(function (s, i) { var b = document.createElement('button'); b.type = 'button'; chipBox.appendChild(b); chips.push(b); b.addEventListener('click', function () { go(i); }); });
    function names() { var l = he() ? 'he' : 'en'; chips.forEach(function (b, i) { b.setAttribute('aria-label', S[i][l][0] || (he() ? 'מבט כללי' : 'Overview')); }); }
    var GLYPH = 'אבגדהוזחטיכלמנסעפצקרשת0123456789#%&';
    function decode(txt) {
      clearInterval(decodeT);
      if (!txt) { tagTxt.textContent = ''; tag.style.opacity = 0; return; }
      tag.style.opacity = 1;
      if (still()) { tagTxt.textContent = txt; return; }
      var n = 0;
      decodeT = setInterval(function () {
        n++; var shown = '';
        for (var i = 0; i < txt.length; i++) shown += txt[i] === ' ' ? ' ' : i < n / 2 ? txt[i] : GLYPH[Math.floor(Math.random() * GLYPH.length)];
        tagTxt.textContent = shown; if (n / 2 >= txt.length) { clearInterval(decodeT); tagTxt.textContent = txt; }
      }, 30);
    }
    function setStop(k) {
      if (k === cur) return; cur = k;
      var l = he() ? 'he' : 'en', s = S[k][l];
      line.innerHTML = s[0] ? '<b>' + s[0] + '</b> · ' + s[1] : s[1];
      decode(s[0]);
      chips.forEach(function (b, i) { b.setAttribute('aria-current', i === k ? 'true' : 'false'); });
    }
    function cam(px, py, z) {
      var W = pin.clientWidth, Hh = pin.clientHeight, s0 = Math.max(W / IW, Hh / IH), s = s0 * z;
      var fx = phone() ? .5 : (rtl() ? .36 : .64), fy = phone() ? .34 : .46;
      var tx = clamp(fx * W - px * IW * s, W - IW * s, 0), ty = clamp(fy * Hh - py * IH * s, Hh - IH * s, 0);
      img.style.width = IW + 'px'; img.style.height = IH + 'px';
      img.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
      var lx = tx + px * IW * s, ly = ty + py * IH * s;
      pin.style.setProperty('--lx', lx.toFixed(0) + 'px'); pin.style.setProperty('--ly', ly.toFixed(0) + 'px');
      tag.style.setProperty('--tx', lx.toFixed(0) + 'px'); tag.style.setProperty('--ty', ly.toFixed(0) + 'px');
    }
    function update(p) {
      if (still()) { var s = S[stillStop]; cam(s.x, s.y, s.z); setStop(stillStop); cover.style.transform = ''; return; }
      // cover: the screws turn out, then the plate lifts away
      var c = clamp(p / .16, 0, 1), sc = smooth(c / .5), lift = smooth((c - .45) / .55);
      screws.forEach(function (el, i) { var d = smooth((c - i * .04) / .4); el.style.setProperty('--sr', (-720 * d).toFixed(0) + 'deg'); el.style.setProperty('--sy', (-14 * d).toFixed(1) + 'px'); el.style.setProperty('--so', (1 - smooth((c - .35 - i * .03) / .15)).toFixed(3)); });
      cover.style.transform = lift > 0 ? 'perspective(1400px) translateY(' + (-108 * lift).toFixed(2) + '%) rotateX(' + (28 * lift).toFixed(2) + 'deg)' : '';
      cover.style.visibility = lift >= 1 ? 'hidden' : '';
      var t = clamp((p - .16) / .8, 0, 1) * (N - 1), k = Math.min(N - 2, Math.floor(t)), f = smooth(((t - k) - .3) / .45);
      var A = S[k], B = S[k + 1];
      cam(lerp(A.x, B.x, f), lerp(A.y, B.y, f), lerp(A.z, B.z, f));
      setStop(Math.round(k + f));
    }
    function go(k) {
      if (still()) { stillStop = (k + N) % N; tick(); return; }
      k = clamp(k, 0, N - 1);
      var top = sec.getBoundingClientRect().top + scrollY, p = .16 + (k / (N - 1)) * .8 + (k ? .01 : -.02);
      scrollTo({ top: top + p * (sec.offsetHeight - innerHeight), behavior: 'smooth' });
    }
    $('[data-prev]').addEventListener('click', function () { go((still() ? stillStop : Math.max(cur, 0)) - 1); });
    $('[data-next]').addEventListener('click', function () { go((still() ? stillStop : Math.max(cur, 0)) + 1); });
    names();
    return { update: update, lang: function () { names(); var k = cur; cur = -1; setStop(Math.max(k, 0)); }, reset: function () { screws.forEach(function (el) { el.style.removeProperty('--sr'); el.style.removeProperty('--sy'); el.style.removeProperty('--so'); }); cover.style.transform = ''; cover.style.visibility = ''; } };
  })();

  // ---------------------------------------------------------------- shop: photos dealt onto the marble; the last opens into the lock screen
  var shop = (function () {
    var sec = $('[data-shop]'), pin = $('.shop-pin'), head = $('.shop-head'), cards = $$('.pc'), last = $('[data-last]');
    var AR = [2.2, 1, 2, 1, .75], R = cards.map(function (c) { return parseFloat(c.style.getPropertyValue('--r')) || 0; }), rect = [];
    var dim = document.createElement('i'); dim.className = 'dim'; last.appendChild(dim);
    var mx = 0, my = 0;
    if (fine) sec.addEventListener('pointermove', function (e) { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; tick(); });
    function layoutCards() {
      var W = pin.clientWidth, Hh = pin.clientHeight, P;
      if (W > 900) {
        var base = Math.min(W * .21, Hh * .38);
        P = [[.18, .5], [.4, .7], [.6, .48], [.8, .72], [.86, .38]];
        rect = P.map(function (p, i) { var w = base * (AR[i] > 1.5 ? 1.45 : AR[i] < .9 ? .9 : 1), h = w / AR[i]; return [p[0] * W - w / 2, p[1] * Hh - h / 2, w, h]; });
      } else {
        var bw = W * .5;
        P = [[.3, .46], [.72, .52], [.3, .66], [.7, .76], [.36, .86]];
        rect = P.map(function (p, i) { var w = bw * (AR[i] > 1.5 ? 1.25 : AR[i] < .9 ? .82 : 1), h = w / AR[i]; return [p[0] * W - w / 2, p[1] * Hh - h / 2, w, h]; });
      }
      if (rtl()) rect = rect.map(function (r) { return [W - r[0] - r[2], r[1], r[2], r[3]]; });
    }
    function update(p) {
      if (still()) return;
      var W = pin.clientWidth, Hh = pin.clientHeight;
      var ex = smooth((p - .66) / .3);
      cards.forEach(function (c, i) {
        var r = rect[i], d = smooth((p + .14 - i * .1) / .16), isLast = c === last;
        var x = r[0], y = r[1] + (1 - d) * Hh * 1.1, w = r[2], h = r[3], rot = R[i] + (1 - d) * (i % 2 ? 16 : -16);
        x += mx * (8 + i * 5); y += my * (6 + i * 4);
        if (isLast && ex > 0) { x = lerp(x, 0, ex); y = lerp(y, 0, ex); w = lerp(w, W, ex); h = lerp(h, Hh, ex); rot = lerp(rot, 0, ex); }
        c.style.width = w.toFixed(1) + 'px'; c.style.height = h.toFixed(1) + 'px';
        c.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + rot.toFixed(2) + 'deg)';
        c.style.borderRadius = isLast ? (16 * (1 - ex)).toFixed(1) + 'px' : '';
        c.style.zIndex = isLast ? 9 : i;
        if (!isLast) c.style.opacity = (1 - ex * .6).toFixed(3);
      });
      dim.style.opacity = ex.toFixed(3);
      $('figcaption', last).style.opacity = (1 - ex * 3).toFixed(3);
      head.style.opacity = (1 - smooth((p - .62) / .14)).toFixed(3);
      pin.style.visibility = p >= .999 ? 'hidden' : '';
    }
    function reset() { cards.forEach(function (c) { c.removeAttribute('style'); c.style.setProperty('--r', R[cards.indexOf(c)] + 'deg'); }); dim.style.opacity = 0; head.style.opacity = ''; pin.style.visibility = ''; $('figcaption', last).style.opacity = ''; }
    return { layout: layoutCards, update: update, reset: reset };
  })();

  // ---------------------------------------------------------------- odometer
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 180) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .4 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- composer
  var parts = $$('[data-part]'), brands = $$('[data-brand]'), msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
  parts.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); write(); }); });
  brands.forEach(function (b) { b.addEventListener('click', function () { brands.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write(); }); });
  function list(items, l) { if (items.length < 2) return items.join(''); return items.slice(0, -1).join(', ') + (l ? ' ו' : ' and ') + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = parts.filter(function (n) { return n.getAttribute('aria-pressed') === 'true'; }).map(function (n) { return n.dataset[l ? 'he' : 'en']; });
    var b = brands.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], br = b.dataset[l ? 'he' : 'en'];
    if (l) return picked.length ? 'שלום, יש לי ' + br + ' ויש בעיה ' + list(picked.map(function (x) { return 'ב' + x; }), true) + '. אפשר לבדוק אותו?' : 'שלום, יש לי ' + br + ' ואשמח שתבדקו אותו. מתי אפשר לקפוץ?';
    return picked.length ? 'Hi, I have ' + br + ' with a problem in the ' + list(picked, false) + '. Could you take a look?' : 'Hi, I have ' + br + ' and I’d like you to take a look at it. When can I drop by?';
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
  watch($('[data-chat]'), function (v) { if (v && !chatSeen && !still()) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .5 });

  // ---------------------------------------------------------------- one scroll loop
  var isle = $('[data-isle]'), revs = $('[data-revs]'), lock = $('.lock'), ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  var healStart = 0;
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    isle.classList.toggle('on', scrollY > hero.offsetHeight * .6);
    // hero: the glass heals, light runs across it, the phone turns a little
    var hp = calm ? 1 : clamp((scrollY - healStart) / (vh * .45), 0, 1);
    crack(hp);
    glare.style.setProperty('--gx', lerp(-120, 120, smooth((hp - .72) / .28)).toFixed(1) + '%');
    if (!calm) {
      slab.style.setProperty('--ry', (tilt.x * 18 + (rtl() ? 1 : -1) * hp * 10).toFixed(2) + 'deg');
      slab.style.setProperty('--rx', (-tilt.y * 10 + hp * 4).toFixed(2) + 'deg');
      fan.style.transform = 'translate(' + (-tilt.x * 22).toFixed(1) + 'px,' + (-tilt.y * 16 - hp * 30).toFixed(1) + 'px)';
    }
    lab.update(prog($('[data-lab]')));
    shop.update(prog($('[data-shop]')));
    var rr = revs.getBoundingClientRect();
    lock.style.opacity = calm ? '' : smooth(-rr.top / (vh * .22)).toFixed(3);
  }
  function resetStyles() {
    slab.style.removeProperty('--ry'); slab.style.removeProperty('--rx'); fan.style.transform = '';
    lab.reset(); shop.reset(); lock.style.opacity = '';
  }

  function layout() {
    var r = slab.getBoundingClientRect();
    healStart = Math.max(0, r.top + scrollY + r.height / 2 - innerHeight * .8);
    dots.size(); shop.layout(); tick();
  }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (innerWidth !== lw || !phone()) { lw = innerWidth; layout(); } else tick(); }, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); lab.lang(); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); dots.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1000);
  addEventListener('load', layout);
})();
