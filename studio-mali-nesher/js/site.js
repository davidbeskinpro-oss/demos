(function () {
  var root = document.documentElement, WA = '972544585818';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth <= 860; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, m) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, { rootMargin: m || '0px' }).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';
  var TITLE = { he: 'סטודיו מלי · טיפולי פנים · עמוס 22, נשר', en: 'Studio Mali · Facial treatments · 22 Amos St, Nesher' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור סטודיו מלי · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Studio Mali · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-ph-he]').forEach(function (i) { i.placeholder = i.dataset[l === 'he' ? 'phHe' : 'phEn']; });
    $$('option[data-he]').forEach(function (o) { o.textContent = o.dataset[l]; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'סטודיו מלי', 'Studio Mali');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-wa]', 'וואטסאפ למלי', 'WhatsApp Mali');
    aria('[data-t-call]', 'התקשרו למלי, 054-458-5818', 'Call Mali, 054-458-5818');
    aria('[data-t-prev]', 'התמונה הקודמת', 'Previous photo');
    aria('[data-t-next]', 'התמונה הבאה', 'Next photo');
    aria('[data-t-5]', '5 כוכבים', '5 stars');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: עמוס 22, נשר' : 'Map: 22 Amos St, Nesher'; });
    $$('[data-tag]').forEach(function (t) { t.textContent = t.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('mali-lang', l); } catch (e) {}
    texts(l); hours(); buildDays(); write(true); room.show(room.i, true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('mali-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $('[data-foot]').classList.add('up');
    steam.kick(); room.show(room.i, true); write(true); layout();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9, 19], 1: [16, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 13], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var dayShort = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], dayShortEn = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
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
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
    var hand = $('[data-hand]'); if (hand) hand.style.transform = 'rotate(' + ((n.h % 12) / 12 * 360).toFixed(1) + 'deg)';
  }
  // consecutive days with the same hours share a row; the week starts on Sunday
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
  setInterval(status, 60000);
  // her week on the clock tile: one gold arc per open day, around the dial
  (function () {
    var g = $('[data-arcs]'); if (!g) return;
    for (var d = 0; d < 7; d++) {
      if (!H[d]) continue;
      var a0 = (d / 7) * Math.PI * 2 - Math.PI / 2 + .08, a1 = a0 + ((H[d][1] - H[d][0]) / 10) * (Math.PI * 2 / 7 - .16);
      var p = document.createElementNS(NS, 'path'), r = 52;
      p.setAttribute('d', 'M' + (60 + r * Math.cos(a0)).toFixed(2) + ' ' + (60 + r * Math.sin(a0)).toFixed(2) + ' A' + r + ' ' + r + ' 0 0 1 ' + (60 + r * Math.cos(a1)).toFixed(2) + ' ' + (60 + r * Math.sin(a1)).toFixed(2));
      g.appendChild(p);
    }
  })();

  // ---------------------------------------------------------------- entrances
  $$('.bento,.cb').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline and footer name: letter by letter
  function split(sp, start) {
    var i = start || 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  }
  $$('[data-split] .ln > span[lang]').forEach(function (sp) { split(sp, sp.closest('.ln').previousElementSibling ? 11 : 0); });
  $$('[data-fname] > span[lang]').forEach(function (sp) { split(sp, 0); });

  // ---------------------------------------------------------------- glyph decode: labels settle out of scrambled letters
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'abcdefghijklmnopqrstuvwxyz' };
  function decode(el, text, ms) {
    if (still() || !text) { el.textContent = text; return; }
    var set = /[֐-׿]/.test(text) ? GL.he : GL.en, t0 = performance.now(), dur = ms || 520;
    cancelAnimationFrame(el._raf);
    (function f(t) {
      var p = clamp((t - t0) / dur, 0, 1), n = Math.floor(text.length * p);
      el.textContent = text.slice(0, n) + text.slice(n).replace(/[^\s.,·:]/g, function () { return set[Math.floor(Math.random() * set.length)]; }).slice(0, Math.max(0, Math.min(text.length - n, 8)));
      if (p < 1) el._raf = requestAnimationFrame(f); else el.textContent = text;
    })(t0);
  }

  var hero = $('[data-hero]'), nav = $('[data-nav]'), lens = $('[data-lens]');

  // ---------------------------------------------------------------- the loupe: magnifies the room where it passes
  var loupe = (function () {
    var el = $('[data-loupe]'), inn = $('[data-loupein]'), M = 1.8, L, px = .3, py = .55, tx = .3, ty = .55, user = 0, raf = 0, vis = true;
    function place() {
      // the room photo is zoomed (S) about (OX, OY) by CSS; map the lens point back onto the photo
      L = lens.clientWidth; var lw = el.clientWidth, S = 1.04, OX = .5 * L, OY = .5 * L, k = S * M;
      inn.style.backgroundSize = (L * k).toFixed(0) + 'px ' + (L * k).toFixed(0) + 'px';
      var x = px * L, y = py * L, u = OX + (x - OX) / S, v = OY + (y - OY) / S;
      el.style.transform = 'translate3d(' + (x - lw / 2).toFixed(1) + 'px,' + (y - lw / 2).toFixed(1) + 'px,0)';
      inn.style.backgroundPosition = (-(u * k - lw / 2)).toFixed(1) + 'px ' + (-(v * k - lw / 2)).toFixed(1) + 'px';
    }
    function frame(t) {
      raf = 0; if (!vis || still()) { px = .68; py = .3; place(); return; }
      if (performance.now() - user > 2200) { // wander slowly round the room on its own
        var s = t / 1000; tx = .5 + .24 * Math.sin(s * .37); ty = .48 + .22 * Math.sin(s * .53 + 1.2);
      }
      px += (tx - px) * .06; py += (ty - py) * .06; place();
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    lens.addEventListener('pointermove', function (e) {
      var r = lens.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; user = performance.now(); kick();
    });
    lens.addEventListener('pointerdown', function (e) { var r = lens.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; user = performance.now(); kick(); });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { kick: kick, place: place };
  })();

  // ---------------------------------------------------------------- steam: soft puffs rising from the foot of the hero, parting round the hand
  var steam = (function () {
    var cv = $('[data-steam]'), c = cv.getContext('2d'), w, h, P = [], raf = 0, vis = true, mx = -999, my = -999, sprite;
    function mk() {
      sprite = document.createElement('canvas'); sprite.width = sprite.height = 128;
      var g = sprite.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, 'rgba(255,244,238,.55)'); gr.addColorStop(.5, 'rgba(255,236,228,.2)'); gr.addColorStop(1, 'rgba(255,236,228,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    }
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = innerWidth < 700 ? 26 : 46; P = [];
      for (var i = 0; i < n; i++) P.push(puff(true));
    }
    function puff(any) {
      return { x: Math.random() * w, y: any ? h * (.35 + Math.random() * .7) : h + 60, r: 60 + Math.random() * 120, vy: .25 + Math.random() * .45, ph: Math.random() * 6.3, a: 0, life: 0 };
    }
    function frame(t) {
      raf = 0; if (!vis || still()) { c.clearRect(0, 0, w, h); return; }
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i]; p.life++;
        p.y -= p.vy; p.x += Math.sin(t / 1600 + p.ph) * .35; p.r += .08;
        var dx = p.x - mx, dy = p.y - my, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 180) { p.x += dx / d * 2.2; p.y += dy / d * 1.2; }
        var top = clamp((p.y - h * .45) / (h * .4), 0, 1);
        p.a = Math.min(1, p.life / 90) * top;
        if (p.y < h * .12 || p.a <= 0 && p.life > 200) P[i] = puff(false);
        c.globalAlpha = p.a * .3; c.drawImage(sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      c.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    mk();
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- Mali: the curtain's daisies round her portrait, counters, a lean toward the hand
  (function () {
    var g = $('[data-wreath] .dots'), n = 9;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2 + .3, s = i % 3 === 0 ? 46 : i % 3 === 1 ? 30 : 20;
      var u = document.createElementNS(NS, 'use'); u.setAttribute('href', '#daisy');
      u.setAttribute('x', (200 + 190 * Math.cos(a) - s / 2).toFixed(1)); u.setAttribute('y', (200 + 190 * Math.sin(a) - s / 2).toFixed(1));
      u.setAttribute('width', s); u.setAttribute('height', s); g.appendChild(u);
    }
    var fig = $('[data-tilt]'), disc = $('.disc', fig), sh = $('.sheen', fig);
    if (fine) {
      fig.addEventListener('pointermove', function (e) {
        if (still()) return;
        var r = fig.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        disc.style.transform = 'rotateY(' + (x * 12).toFixed(2) + 'deg) rotateX(' + (-y * 12).toFixed(2) + 'deg)';
        sh.style.setProperty('--sx', ((x + .5) * 100).toFixed(1) + '%'); sh.style.setProperty('--sy', ((y + .5) * 100).toFixed(1) + '%');
      });
      fig.addEventListener('pointerleave', function () { disc.style.transform = ''; });
    }
    // odometers: roll up once when they come into view
    $$('[data-odo]').forEach(function (b) {
      var target = b.dataset.odo, dec = target.indexOf('.') > 0, v = parseFloat(target), done = false;
      watch(b, function (vis) {
        if (!vis || done) return; done = true; if (still()) return;
        var t0 = performance.now();
        (function f(t) { var p = smooth((t - t0) / 1400); b.textContent = dec ? (v * p).toFixed(1) : Math.round(v * p); if (p < 1) requestAnimationFrame(f); else b.textContent = target; })(t0);
      });
    });
  })();

  // ---------------------------------------------------------------- bento: a soft light follows the hand
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); t.style.setProperty('--spot', 1); });
    t.addEventListener('pointerleave', function () { t.style.setProperty('--spot', 0); });
  });

  // ---------------------------------------------------------------- THE ROOM: steam fogs the lens, the next photo comes into focus beneath it
  var room = (function () {
    var sec = $('[data-roomsec]'), imgs = $$('[data-rglass] img'), btns = $$('[data-ri]'), fact = $('[data-rfact]'), ring = $('[data-rring]'), cv = $('[data-fog]'), c = cv.getContext('2d');
    var FACT = {
      he: ['נרות וסחלב על המדף בחדר הטיפולים.', 'התכשירים שמלי עובדת איתם, על העגלה ליד המיטה.', 'שמיכה לבנה ורכה על מיטת הטיפולים.', 'סרט מגבת רך אוסף את השיער לפני הטיפול.'],
      en: ['Candles and an orchid on the treatment-room shelf.', 'The products Mali works with, on the trolley by the bed.', 'A soft white blanket on the treatment bed.', 'A soft towel headband holds the hair back before the treatment.']
    };
    var ticks = $('[data-ticks]');
    for (var k = 0; k < 60; k++) { var a = k / 60 * Math.PI * 2, r0 = k % 12 === 0 ? 86 : 91, ln = document.createElementNS(NS, 'line'); ln.setAttribute('x1', (100 + r0 * Math.cos(a)).toFixed(2)); ln.setAttribute('y1', (100 + r0 * Math.sin(a)).toFixed(2)); ln.setAttribute('x2', (100 + 95 * Math.cos(a)).toFixed(2)); ln.setAttribute('y2', (100 + 95 * Math.sin(a)).toFixed(2)); ticks.appendChild(ln); }
    var i = -1, fogA = 0, raf = 0, W = 0, puffs = [], vis = false, sprite = document.createElement('canvas');
    sprite.width = sprite.height = 128;
    (function () { var g = sprite.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(250,236,232,.9)'); gr.addColorStop(.6, 'rgba(244,222,216,.35)'); gr.addColorStop(1, 'rgba(244,222,216,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); })();
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; cv.width = W * dpr; cv.height = W * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); puffs = []; for (var q = 0; q < 22; q++) puffs.push({ x: Math.random(), y: Math.random(), r: .25 + Math.random() * .3, vx: (Math.random() - .5) * .002, vy: -.001 - Math.random() * .002 }); }
    function frame() {
      raf = 0; c.clearRect(0, 0, W, W);
      if (still() || !vis) return;
      fogA *= .93; var base = .06 + fogA;
      puffs.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; if (p.y < -.3) { p.y = 1.3; p.x = Math.random(); }
        c.globalAlpha = Math.min(1, base) * .8; c.drawImage(sprite, (p.x - p.r) * W, (p.y - p.r) * W, p.r * 2 * W, p.r * 2 * W);
      });
      c.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    function show(n, quiet) {
      n = (n + imgs.length) % imgs.length;
      var changed = n !== i; i = n;
      imgs.forEach(function (im, k) { im.classList.toggle('on', k === n); });
      btns.forEach(function (b, k) { b.setAttribute('aria-current', k === n ? 'true' : 'false'); });
      if (changed && !quiet) { fogA = .3; kick(); }
      decode(fact, FACT[he() ? 'he' : 'en'][n], 700);
      ring.style.transform = 'rotate(' + (n * 90) + 'deg)';
    }
    btns.forEach(function (b) { b.addEventListener('click', function () {
      var n = +b.dataset.ri;
      if (still()) { show(n); return; }
      var top = sec.getBoundingClientRect().top + scrollY, span = sec.offsetHeight - innerHeight;
      scrollTo({ top: top + span * ((n + .5) / imgs.length), behavior: 'auto' });
    }); });
    $$('[data-rstep]').forEach(function (b) { b.addEventListener('click', function () { show(i + +b.dataset.rstep); }); });
    watch(sec, function (v) { vis = v; if (v) kick(); });
    function scroll() {
      if (still()) return;
      var r = sec.getBoundingClientRect(), p = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, .999);
      var n = Math.floor(p * imgs.length); if (n !== i) show(n);
    }
    return { show: show, size: size, scroll: scroll, get i() { return i < 0 ? 0 : i; } };
  })();

  // ---------------------------------------------------------------- reviews: a second copy so the slow rise loops seamlessly
  (function () { var tr = $('[data-rtrack]'); $$('.q', tr).forEach(function (q) { var c = q.cloneNode(true); c.setAttribute('aria-hidden', 'true'); tr.appendChild(c); }); })();

  // ---------------------------------------------------------------- BOOK: the coupon writes the WhatsApp message to Mali
  var day = null, part = null, PARTS = [[9, 12], [12, 16], [16, 19]];
  var PN = { he: ['בוקר', 'צהריים', 'אחה״צ'], en: ['Morning', 'Midday', 'Afternoon'] };
  var PIN = { he: [' בבוקר', ' בצהריים', ' אחר הצהריים'], en: [' in the morning', ' at midday', ' in the afternoon'] };
  function okPart(d, k) { var t = H[d]; return t && t[0] < PARTS[k][1] && t[1] > PARTS[k][0]; }
  function buildDays() {
    var l = he() ? 'he' : 'en', dd = $('[data-days]'), pp = $('[data-parts]');
    dd.innerHTML = ''; for (var d = 0; d < 7; d++) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'disc-btn'; b.dataset.d = d;
      b.textContent = l === 'he' ? dayShort[d] : dayShortEn[d]; b.setAttribute('aria-label', (l === 'he' ? 'יום ' + dayHe[d] : dayEn[d]) + (H[d] ? '' : (l === 'he' ? ', סגור' : ', closed')));
      b.disabled = !H[d]; b.setAttribute('aria-pressed', day === d ? 'true' : 'false'); dd.appendChild(b);
    }
    pp.innerHTML = ''; for (var k = 0; k < 3; k++) {
      var c = document.createElement('button'); c.type = 'button'; c.className = 'disc-btn'; c.dataset.p = k; c.textContent = PN[l][k];
      c.disabled = day !== null && !okPart(day, k); c.setAttribute('aria-pressed', part === k ? 'true' : 'false'); pp.appendChild(c);
    }
    var note = '';
    if (day === 1) note = l === 'he' ? 'ביום שני מלי עובדת מ-16:00 עד 19:00.' : 'On Monday Mali works 16:00–19:00.';
    if (day === 5) note = l === 'he' ? 'ביום שישי עד 13:00.' : 'On Friday until 13:00.';
    $('[data-daynote]').textContent = note;
  }
  $('[data-days]').addEventListener('click', function (e) { var b = e.target.closest('[data-d]'); if (!b || b.disabled) return; day = +b.dataset.d; if (part !== null && !okPart(day, part)) part = null; buildDays(); write(); });
  $('[data-parts]').addEventListener('click', function (e) { var b = e.target.closest('[data-p]'); if (!b || b.disabled) return; part = +b.dataset.p; buildDays(); write(); });
  var form = $('[data-form]'), prev = $('[data-preview]'), send = $('[data-send]'), typing = 0;
  form.addEventListener('input', function () { write(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); send.click(); });
  function message() {
    var l = he(), name = (form.name.value || '').trim().slice(0, 40), w = +form.what.value, msg;
    if (l) {
      msg = 'היי מלי' + (name ? ', כאן ' + name : '') + '. ';
      msg += ['אשמח לקבוע טיפול פנים', 'אשמח לקבוע תור ולהתייעץ איתך מה מתאים לי', 'יש לי שאלה על טיפול מסוים, ואשמח לקבוע תור'][w];
      if (day !== null) msg += ' ביום ' + dayHe[day]; if (part !== null) msg += PIN.he[part];
      msg += '. תודה!';
    } else {
      msg = 'Hi Mali' + (name ? ', this is ' + name : '') + '. ';
      msg += ['I’d like to book a facial treatment', 'I’d like to book and ask your advice on what suits me', 'I have a question about a specific treatment and I’d like to book'][w];
      if (day !== null) msg += ' on ' + dayEn[day]; if (part !== null) msg += PIN.en[part];
      msg += '. Thank you!';
    }
    return msg;
  }
  function write(instant) {
    var m = message(); send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    clearInterval(typing);
    if (instant || still()) { prev.textContent = m; return; }
    var cur = prev.textContent, k = 0; while (k < cur.length && cur[k] === m[k]) k++;
    typing = setInterval(function () { k++; prev.textContent = m.slice(0, k); if (k >= m.length) clearInterval(typing); }, 22);
  }

  // ---------------------------------------------------------------- footer: the page lifts like a curtain, the name rises
  var foot = $('[data-foot]'), main = $('#main'), dock = $('[data-dock]'), care = $('[data-care]'), iris = $('[data-iris]');
  function curtain() {
    var ok = !still() && foot.offsetHeight < innerHeight - 60;
    document.body.classList.toggle('curtain', ok);
    main.style.marginBottom = ok ? foot.offsetHeight + 'px' : '';
  }

  // ---------------------------------------------------------------- one scroll loop
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, y = scrollY, end = document.documentElement.scrollHeight - vh;
    nav.classList.toggle('pill', y > 40);
    // the iris: the portrait's circle opens into the blush field
    if (!calm) { var cr = care.getBoundingClientRect(), ip = smooth((vh - cr.top) / (vh * .9)); iris.style.setProperty('--iris', (8 + ip * 142).toFixed(1) + '%'); }
    else iris.style.removeProperty('--iris');
    room.scroll();
    // tags type themselves onto the room once the lens is open
    if (y > end - 4 || end - y < foot.offsetHeight * .6) foot.classList.add('up');
    dock.classList.toggle('hide', end - y < 140 || y < hero.offsetHeight * .55);
  }
  var coupon = $('.coupon'), cside = $('.c-side');
  function layout() { steam.size(); loupe.place(); room.size(); curtain(); coupon.style.setProperty('--cut', cside.offsetHeight + 'px'); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); buildDays(); write(true); room.show(0, true); layout();
  if (still()) foot.classList.add('up');
  var once = false, go = function () {
    if (once) return; once = true;
    requestAnimationFrame(function () {
      hero.classList.add('ready'); steam.kick(); loupe.kick();
      $$('[data-tag]').forEach(function (t, k) { setTimeout(function () { t.classList.add('on'); decode(t, t.dataset[root.lang], 600); }, still() ? 0 : 1700 + k * 260); });
    });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 900);
  addEventListener('load', layout);
})();
