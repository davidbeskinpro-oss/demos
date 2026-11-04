(function () {
  var root = document.documentElement, WA = '972547372099';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var TITLE = { he: "תמר ישראל · לק ג'ל, מניקור ופדיקור · שדרות מוריה 118, חיפה", en: 'Tamar Israel · Gel polish, manicure & pedicure · 118 Sderot Moriya, Haifa' };
  var CONCEPT = { he: "קונספט לדוגמה שנבנה עבור תמר ישראל לק ג'ל חיפה · זה אינו האתר הרשמי של העסק", en: 'A sample concept built for Tamar Israel Gel Nails Haifa · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', "תמר ישראל, לק ג'ל", 'Tamar Israel, gel nails');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לתמר, 054-737-2099', 'Call Tamar, 054-737-2099');
    aria('[data-hours]', 'שעות פתיחה', 'Opening hours');
    $$('[data-t-map]').forEach(function (m) { m.title = l === 'he' ? 'מפה: שדרות מוריה 118, חיפה' : 'Map: 118 Sderot Moriya, Haifa'; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('tm-lang', l); } catch (e) {}
    texts(l); split(); hours(); days(); write(true); layout();
    hero.classList.add('ready'); $$('.foot').forEach(function (f) { if (f._seen) f.classList.add('in'); });
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('tm-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    clearFx(); layout(); dust.kick(); ring.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 18], 1: null, 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [8.5, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    if (window.__now) return window.__now;
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = now(), l = he(), t = H[n.d], txt, open = false;
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
    var td = $('[data-today]'); if (td) td.textContent = t ? hhmm(t[0]) + '–' + hhmm(t[1]) : (l ? 'סגור' : 'Closed');
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

  // ---------------------------------------------------------------- entrances
  $$('[data-bento]').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); if (e.target.matches('.t-bio')) decode(); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- letters: the name settles out of a blur, the line fills in, the footer name rises
  function split() {
    $$('[data-split] > span[lang], [data-fill] > span[lang], [data-rise] > span[lang]').forEach(function (sp) {
      if (sp._done) return; sp._done = true;
      var i = 0;
      (function walk(node) {
        [].slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var f = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach(function (w) {
              if (!w) return;
              if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(w)); return; }
              var ws = document.createElement('span'); ws.className = 'w'; ws.style.whiteSpace = 'nowrap'; ws.style.display = 'inline-block';
              w.split('').forEach(function (ch) { var s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = ch; ws.appendChild(s); });
              f.appendChild(ws);
            });
            node.replaceChild(f, c);
          } else if (c.nodeType === 1) walk(c);
        });
      })(sp);
      sp.setAttribute('aria-label', sp.textContent);
    });
  }
  split();

  // glyph decode for the gel's name
  function decode() {
    var el = $('[data-decode]'), target = el.dataset.decode, G = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    if (still()) { el.textContent = target; return; }
    var t0 = performance.now();
    (function st(t) {
      var k = (t - t0) / 900, out = '';
      for (var i = 0; i < target.length; i++) out += target[i] === ' ' || i / target.length < k ? target[i] : G[Math.floor(Math.random() * G.length)];
      el.textContent = out; if (k < 1.05) requestAnimationFrame(st); else el.textContent = target;
    })(t0);
  }

  // odometer figures
  $$('[data-odo]').forEach(function (o) {
    o.setAttribute('aria-label', o.dataset.odo); o.classList.add('odo');
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      return /\d/.test(ch) ? '<span class="d" aria-hidden="true" data-to="' + ch + '"></span>' : '<span aria-hidden="true">' + ch + '</span>';
    }).join('');   // the digit columns are drawn by CSS, so the page text stays "5.0"
    var roll = function () { $$('.d', o).forEach(function (d, i) { d.style.setProperty('--dl', (i * 160 + 300) + 'ms'); d.style.setProperty('--to', (-d.dataset.to) + 'em'); }); };
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll();
  });

  // ---------------------------------------------------------------- the lamp's arch: a glow line and its LED dots
  (function () {
    var svg = $('[data-leds]'), NS = 'http://www.w3.org/2000/svg', d = 'M30 520 V300 A470 280 0 0 1 970 300 V520';
    [['glow', d], ['dots', 'M70 520 V306 A430 250 0 0 1 930 306 V520']].forEach(function (p) {
      var e = document.createElementNS(NS, 'path'); e.setAttribute('d', p[1]); e.setAttribute('class', p[0]); e.setAttribute('pathLength', '100'); e.setAttribute('vector-effect', 'non-scaling-stroke'); svg.appendChild(e);
    });
  })();

  // ---------------------------------------------------------------- gold dust in the lamp light; parts around the cursor (or a finger)
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), P = [], w = 0, h = 0, raf = 0, vis = true, mx = -999, my = -999;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 46 : 110; P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 1.8, v: .15 + Math.random() * .45, ph: Math.random() * 6.28, vx: 0, vy: 0 });
    }
    function frame(t) {
      raf = 0; if (still() || !vis) { c.clearRect(0, 0, w, h); return; }
      c.clearRect(0, 0, w, h);
      var ax = phone() ? w / 2 + Math.sin(t / 1800) * w * .3 : mx, ay = phone() ? h * .55 + Math.cos(t / 2300) * h * .2 : my;
      P.forEach(function (p) {
        var dx = p.x - ax, dy = p.y - ay, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { var f = (14000 - d2) / 14000 * .6; p.vx += dx / Math.sqrt(d2 + 1) * f; p.vy += dy / Math.sqrt(d2 + 1) * f; }
        p.vx *= .92; p.vy *= .92;
        p.x += p.vx + Math.sin(t / 1400 + p.ph) * .18; p.y += p.vy - p.v;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        // brighter near the arch's centre, where the lamp's light is
        var light = .25 + .75 * Math.max(0, 1 - Math.hypot((p.x - w / 2) / (w * .55), (p.y - h) / (h * .8)));
        c.globalAlpha = light * (.55 + .45 * Math.sin(t / 600 + p.ph));
        c.fillStyle = p.r > 1.6 ? '#ffe3cf' : '#f6b9c6';
        c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
      });
      c.globalAlpha = 1; kick();
    }
    function kick() { if (!raf && !still() && vis) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- the ring of photographs: dealt from a stack, then turning under the lamp
  var ring = (function () {
    var wrap = $('[data-ringwrap]'), el = $('[data-ring]'), cards = $$('.rc', el), N = cards.length, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = true, last = 0, deal = 0, t0 = 0, scrollRot = 0;
    function R() { var cw = cards[0].offsetWidth || 160; return Math.max(cw * 1.08 / (2 * Math.tan(Math.PI / N)), phone() ? 200 : Math.min(innerWidth * .34, 560)); }
    function frame(t) {
      raf = 0;
      if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; c.style.zIndex = ''; c.style.opacity = ''; }); return; }
      var dt = last ? Math.min(64, t - last) : 16; last = t;
      if (!t0) t0 = t;
      deal = smooth((t - t0 - 200) / 1500);
      if (!drag) { rot += (vel + (rtl() ? -.012 : .012)) * dt; vel *= .94; }
      var r = R(), step = 360 / N, a0 = rot + scrollRot;
      cards.forEach(function (c, i) {
        var a = (a0 + i * step) * deal, rad = a * Math.PI / 180, cz = Math.cos(rad);
        var lift = Math.max(0, cz - .85) / .15;   // the front card lifts out of the ring
        c.style.transform = 'rotateX(-6deg) rotateY(' + a.toFixed(2) + 'deg) translateZ(' + (r * deal).toFixed(1) + 'px) translateY(' + (-14 * lift + (1 - deal) * 40).toFixed(1) + 'px) scale(' + (1 + .06 * lift).toFixed(3) + ')';
        c.style.filter = 'brightness(' + (.45 + .55 * (cz * .5 + .5)).toFixed(3) + ')';
        c.style.zIndex = Math.round(cz * 100) + 100; c.style.opacity = smooth((cz + .55) / .5).toFixed(3);
        c.style.setProperty('--sh', (lift > 0 ? lerp(-120, 120, (Math.sin(rad * 3) + 1) / 2) : -120).toFixed(0) + '%');
      });
      if (vis) kick();
    }
    function kick() { if (!raf && !still()) { last = 0; raf = requestAnimationFrame(frame); } }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .3; vel = dx * .02; });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(hero, function (v) { vis = v; kick(); });
    function fit() { wrap.style.setProperty('--aw', (2 * R() + cards[0].offsetWidth + 140).toFixed(0) + 'px'); }
    return { kick: kick, fit: fit, scroll: function (s) { scrollRot = s; } };
  })();

  // ---------------------------------------------------------------- composer: the message writes itself inside the lamp
  var trs = $$('[data-tr]'), daysEl = $('[data-days]'), msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false, pickedDay = -1;
  function days() {
    var l = he(), list = [-1]; for (var d = 0; d < 7; d++) if (H[d]) list.push(d);
    daysEl.innerHTML = list.map(function (d) {
      var name = d < 0 ? (l ? 'הכי מוקדם' : 'Soonest') : (l ? dayHe[d] : dayEn[d].slice(0, 3));
      return '<button type="button" class="day" role="radio" aria-checked="' + (d === pickedDay) + '" data-day="' + d + '">' + name + '</button>';
    }).join('');
    $$('.day', daysEl).forEach(function (b) { b.addEventListener('click', function () { pickedDay = +b.dataset.day; $$('.day', daysEl).forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write(); }); });
  }
  trs.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); write(); }); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = trs.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.dataset[l ? 'he' : 'en']; });
    var what = picked.length ? list(picked, l) : (l ? 'טיפול' : 'an appointment');
    var when = pickedDay < 0 ? (l ? 'בהקדם' : 'as soon as you can') : (l ? 'ביום ' + dayHe[pickedDay] : 'on ' + dayEn[pickedDay]);
    return l ? 'היי תמר, אשמח לקבוע תור ל' + what + ' ' + when + '. מתי נוח לך?'
             : 'Hi Tamar, I’d like to book ' + what + ' ' + when + '. What time works for you?';
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

  // ---------------------------------------------------------------- tiles: lamp-light spotlight and a gloss that follows the hand
  var tiles = $$('.tile');
  tiles.forEach(function (t) {
    t.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      t.classList.add('lit'); t.style.setProperty('--mx', (x * 100) + '%'); t.style.setProperty('--my', (y * 100) + '%');
      t.style.setProperty('--px', (x - .5).toFixed(3)); t.style.setProperty('--py', (y - .5).toFixed(3)); t.style.setProperty('--shx', ((x - .5) * 200).toFixed(0) + '%');
    });
    t.addEventListener('pointerleave', function () { t.classList.remove('lit'); t.style.setProperty('--px', 0); t.style.setProperty('--py', 0); });
  });
  var touch = !matchMedia('(hover: hover)').matches;

  // ---------------------------------------------------------------- footer curtain + rising name
  var foot = $('[data-foot]'), fArch = $('.f-arch', foot);
  watch(foot, function (v) { if (v) { foot._seen = true; foot.classList.add('in'); } }, { threshold: .25 });

  // ---------------------------------------------------------------- one scroll loop
  var gloss = $('[data-gloss]'), stage = $('.g-stage', gloss), frameEl = $('[data-gframe]'), cured = $('[data-gcured]'), bar = $('[data-gbar]'), sheen = $('[data-gsheen]'), gend = $('[data-gend]'), gcopy = $('.g-copy', gloss);
  var care = $('#care'), words = $('[data-words]'), rows = $$('[data-row]'), roses = $$('[data-rose]'), bioRose = $('.bio-rose');
  function clearFx() {
    [frameEl, cured, bar, sheen, gend, stage].forEach(function (e) { e.removeAttribute('style'); });
    gcopy.removeAttribute('style'); rows.forEach(function (r) { r.style.removeProperty('--tx'); });
  }
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    if (calm) return;
    // hero: the ring also turns with the scroll
    ring.scroll(scrollY * .08 * (rtl() ? -1 : 1)); ring.kick();
    // gloss: open the arch to full screen, pass the bar of light, then the shine
    var r = gloss.getBoundingClientRect(), sc = clamp(-r.top / vh, 0, 3.5), W = innerWidth, Hs = stage.clientHeight;
    var o = smooth(sc / 1);
    var aw = phone() ? .84 : Math.min(.46, 640 / W), ah = phone() ? .5 : .58;   // the arch at rest, as a share of the screen
    var cx = (1 - aw) / 2 * 100, cb = 5, ct = 100 - cb - ah * 100, rx = aw * W / 2, ry = Math.min(rx * 1.05, ah * Hs * .6);
    frameEl.style.setProperty('--cx', lerp(cx, 0, o).toFixed(2) + '%');
    frameEl.style.setProperty('--ct', lerp(ct, 0, o).toFixed(2) + '%');
    frameEl.style.setProperty('--cb', lerp(cb, 0, o).toFixed(2) + '%');
    frameEl.style.setProperty('--cr', lerp(rx, 0, o).toFixed(1) + 'px');
    frameEl.style.setProperty('--cry', lerp(ry, 0, o).toFixed(1) + 'px');
    frameEl.style.setProperty('--cr2', lerp(28, 0, o).toFixed(1) + 'px');
    frameEl.style.setProperty('--gs', lerp(1.14, 1, o).toFixed(4));
    var b = smooth((sc - .9) / .9);
    bar.style.setProperty('--by', (b * 100).toFixed(2) + '%');
    bar.style.setProperty('--bo', (sc > .86 && b < .995 ? 1 : 0));
    cured.style.setProperty('--gc', ((1 - b) * 100).toFixed(2) + '%');
    sheen.style.setProperty('--sx', lerp(-110, 110, smooth((sc - 1.75) / .45)).toFixed(1) + '%');
    var co = smooth((sc - .05) / .3);
    gcopy.style.opacity = (1 - co).toFixed(3);
    gcopy.style.transform = 'translateY(' + (-co * 40).toFixed(1) + 'px)';
    var eo = smooth((sc - 1.9) / .4).toFixed(3); gend.style.setProperty('--eo', eo); frameEl.style.setProperty('--eo', eo);
    // stacked seam: as the care card lands, the stage sinks back
    var cr = care.getBoundingClientRect(), land = smooth(1 - cr.top / vh);
    stage.style.transform = land > 0 ? 'scale(' + (1 - land * .06).toFixed(4) + ')' : '';
    stage.style.filter = land > 0 ? 'brightness(' + (1 - land * .45).toFixed(3) + ')' : '';
    // tile photos breathe with the scroll on touch screens (the cursor does it on desktop)
    if (touch) tiles.forEach(function (t) { var tr = t.getBoundingClientRect(); if (tr.bottom < 0 || tr.top > vh) return; var k = clamp((tr.top + tr.height / 2) / vh, 0, 1); t.style.setProperty('--py', (k - .5).toFixed(3)); t.style.setProperty('--shx', lerp(120, -120, k).toFixed(0) + '%'); });
    if (bioRose) { var br = bioRose.getBoundingClientRect(); bioRose.style.setProperty('--rr', lerp(-18, 4, clamp(1 - br.top / vh, 0, 1)).toFixed(2) + 'deg'); }
    // words: two rows drift in opposite directions, the roses open
    var wr = words.getBoundingClientRect(), wp = clamp((vh - wr.top) / (vh + wr.height), 0, 1);
    rows.forEach(function (row) {
      var dir = +row.dataset.row * (rtl() ? 1 : -1), extra = Math.max(0, row.scrollWidth - W);
      row.style.setProperty('--tx', (dir * lerp(-.15, 1, wp) * Math.min(extra, W * .6) * .5 + (dir > 0 ? 0 : 0)).toFixed(1) + 'px');
    });
    roses.forEach(function (ro, i) { ro.style.setProperty('--rr', lerp(i ? 14 : -14, i ? -4 : 6, wp).toFixed(2) + 'deg'); ro.style.setProperty('--rs', lerp(.82, 1.06, smooth(wp * 1.6)).toFixed(3)); });
    // footer: the lamp rises as you arrive
    var fr = foot.getBoundingClientRect(), fp = smooth((vh - fr.top) / fr.height);
    fArch.style.setProperty('--rise', ((1 - fp) * 120).toFixed(1) + 'px');
  }

  function layout() {
    dust.size(); ring.fit(); foot.classList.toggle('curtain', foot.offsetHeight < innerHeight * .9);
    if (still()) clearFx(); tick();
  }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); days(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); dust.kick(); ring.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', tick);
})();
