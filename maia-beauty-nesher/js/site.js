(function () {
  var root = document.documentElement, WA = '972558818946';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var TITLE = { he: 'Maia Beauty · קוסמטיקה מתקדמת · חבצלת, נשר', en: 'Maia Beauty · Advanced cosmetics · Havatzelet St, Nesher' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Maia Beauty - קוסמטיקה מתקדמת · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Maia Beauty – Advanced Cosmetics · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו למאיה, 055-881-8946', 'Call Maia, 055-881-8946');
    aria('[data-t-wa]', 'וואטסאפ למאיה', 'WhatsApp Maia');
    aria('[data-dial]', 'יום', 'Day');
    $$('.tag').forEach(function (t) { $('b', t).textContent = t.classList.contains('on') ? t.dataset[l] : ''; });
    $$('[data-decode]').forEach(function (d) { d.textContent = d.dataset.decode.split('|')[0]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('mb1388-lang', l); } catch (e) {}
    texts(l); hours(); buildDial(); write(true); tick();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('mb1388-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    hero.classList.add('ready');
    clearFacial(); light.kick(); ring.kick(); field.kick(); write(true); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [10, 18], 1: [10, 18], 2: [10, 18], 3: [10, 18], 4: [10, 18], 5: [10, 14], 6: null };
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

  // ---------------------------------------------------------------- entrances
  $$('.bento,.cbento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline letter by letter (one string, both languages)
  $$('[data-split]').forEach(function (h) {
    var i = 0; h.setAttribute('aria-label', h.textContent);
    h.innerHTML = h.textContent.split(' ').map(function (w) { return '<span class="w" aria-hidden="true">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>'; }).join(' ');
  });

  // glyph decode: the word passes through scrambled letters before it settles
  var GLYPH = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'abcdefghijklmnopqrstuvwxyz' };
  function decode(el, target, done) {
    if (still()) { el.textContent = target; if (done) done(); return; }
    var pool = /[א-ת]/.test(target) ? GLYPH.he : GLYPH.en, t0 = performance.now(), dur = 520;
    (function st(t) {
      var k = (t - t0) / dur, out = '';
      for (var i = 0; i < target.length; i++) out += (k * target.length > i + .5 || target[i] === ' ') ? target[i] : pool[Math.floor(Math.random() * pool.length)];
      el.textContent = out;
      if (k < 1) requestAnimationFrame(st); else { el.textContent = target; if (done) done(); }
    })(t0);
  }

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- the ring light: follows the hand; drifts by itself on phones and when idle
  var light = (function () {
    var x = .62, y = .4, tx = .62, ty = .4, lastMove = -1e9, raf = 0, vis = true, t0 = performance.now();
    function frame(t) {
      raf = 0; if (still()) return;
      if (t - lastMove > 2200) { var s = (t - t0) / 1000; tx = .5 + Math.sin(s * .45) * (phone() ? .26 : .3); ty = .42 + Math.sin(s * .7 + 1) * .14; }
      x = lerp(x, tx, .07); y = lerp(y, ty, .07);
      hero.style.setProperty('--x', (x * 100).toFixed(2) + '%'); hero.style.setProperty('--y', (y * 100).toFixed(2) + '%');
      if (vis) raf = requestAnimationFrame(frame);
    }
    function point(e) { var r = hero.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; lastMove = performance.now(); kick(); }
    hero.addEventListener('pointermove', point);
    hero.addEventListener('pointerdown', point);
    function size() { hero.style.setProperty('--rr', Math.round(clamp(Math.min(innerWidth, innerHeight) * .26, 110, 230)) + 'px'); }
    function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); }
    watch(hero, function (v) { vis = v; kick(); });
    return { kick: kick, size: size };
  })();

  // ---------------------------------------------------------------- the facial: the light's circle opens into the photo, which then settles in its frame
  var apring = $('[data-apring]'), facial = $('[data-facial]'), fphoto = $('[data-fphoto]'), fimg = $('img', fphoto), tags = $$('.tag', fphoto), fcopy = $('.f-copy');
  function clearFacial() { ['--pt', '--pr', '--pb', '--pl', '--prad', '--ap', '--cp'].forEach(function (v) { fphoto.style.removeProperty(v); fcopy.style.removeProperty(v); }); placeTags(); }
  function placeTags() {
    var W = fphoto.clientWidth, Hh = fphoto.clientHeight, iw = 1100, ih = 1650, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s, ox = (W - dw) / 2, oy = (Hh - dh) / 2;
    tags.forEach(function (t) {
      var px = ox + dw * parseFloat(t.style.getPropertyValue('--x')), py = oy + dh * parseFloat(t.style.getPropertyValue('--y'));
      t.style.setProperty('--tx', px.toFixed(1) + 'px'); t.style.setProperty('--ty', py.toFixed(1) + 'px');
      t.classList.toggle('flip', px > W * .55);
      t.hidden = px < 8 || px > W - 8 || py < 8 || py > Hh - 8;
    });
  }
  function tagOn(t, on) {
    if (on === t.classList.contains('on')) return;
    t.classList.toggle('on', on);
    var b = $('b', t); if (on) decode(b, t.dataset[he() ? 'he' : 'en']); else b.textContent = '';
  }
  function facialFrame(vh) {
    var W = facial.clientWidth, p = prog(facial);
    var a = smooth(p / .3), b = smooth((p - .34) / .3), c = smooth((p - .62) / .16);
    var apv = 24 + a * 126, Hs = facial.querySelector('.f-stage').clientHeight, rpx = apv / 100 * Math.sqrt(W * W + Hs * Hs) / Math.SQRT2;
    fphoto.style.setProperty('--ap', apv.toFixed(2) + '%');
    apring.style.width = apring.style.height = (rpx * 2).toFixed(1) + 'px'; apring.style.opacity = (1 - smooth((a - .55) / .4)).toFixed(3);
    var t1, r1, b1, l1;
    if (innerWidth <= 860) { t1 = 74; b1 = vh * .4; l1 = 16; r1 = 16; }
    else { t1 = vh * .14; b1 = vh * .08; var near = W * .06, far = W * .5; r1 = rtl() ? near : far; l1 = rtl() ? far : near; }
    fphoto.style.setProperty('--pt', (t1 * b).toFixed(1) + 'px'); fphoto.style.setProperty('--pb', (b1 * b).toFixed(1) + 'px');
    fphoto.style.setProperty('--pl', (l1 * b).toFixed(1) + 'px'); fphoto.style.setProperty('--pr', (r1 * b).toFixed(1) + 'px');
    fphoto.style.setProperty('--prad', (26 * b).toFixed(1) + 'px');
    fcopy.style.setProperty('--cp', c.toFixed(3));
    fimg.style.transform = 'scale(' + lerp(1.18, 1, a * .5 + b * .5).toFixed(4) + ')';
    placeTags();
    tags.forEach(function (t, i) { tagOn(t, p > .7 + i * .05); });
  }

  // honey drips grow as the golden section leaves
  var drops = $$('[data-drip] .drops path'), DL = [1, 1.25, .8, 1.1];

  // ---------------------------------------------------------------- bento: spotlight, the jar leans to the hand, the D°COOL dial swings cold / hot
  $$('.tile,.c-card').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var jar = $('[data-tilt]'), jt = jar.parentNode;
  jt.addEventListener('pointermove', function (e) { if (still() || e.pointerType !== 'mouse') return; var r = jt.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5; jar.style.transform = 'scale(1.06) translate(' + (-dx * 18).toFixed(1) + 'px,' + (-dy * 14).toFixed(1) + 'px)'; });
  jt.addEventListener('pointerleave', function () { jar.style.transform = ''; });
  var cool = $('.t-cool'), coolOn = false, hot = false;
  watch(cool, function (v) { coolOn = v; });
  setInterval(function () {
    if (!coolOn || still()) return; hot = !hot; cool.classList.toggle('hot', hot);
    $$('[data-decode]', cool).forEach(function (d) { var w = d.dataset.decode.split('|'); decode(d, w[hot ? 1 : 0]); });
  }, 2600);

  // ---------------------------------------------------------------- odometers
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
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- the ring of her photos: turns by itself, with the scroll and with a drag
  var turn = $('[data-turn]'), glow = $('.glow', turn);
  var ring = (function () {
    var wrap = $('[data-ringwrap]'), el = $('[data-ring]');
    $$('.rc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $('img', k).alt = ''; el.appendChild(k); });
    var cards = $$('.rc', el), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = false, last = 0;
    function R() { var cw = cards[0].offsetWidth || 180; return Math.max(cw * 1.1 / (2 * Math.tan(Math.PI / N)), phone() ? 250 : innerWidth * .36); }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (7 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var r = R(), sc = scrollY * .05 * (rtl() ? 1 : -1);
      cards.forEach(function (c, i) {
        var a = rot + sc + i * step, f = Math.cos(a * Math.PI / 180), lift = f > .95 ? (f - .95) * 20 : 0;
        c.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + (r + lift * 40).toFixed(1) + 'px) scale(' + (1 + lift * .07).toFixed(3) + ')';
        c.style.filter = 'brightness(' + (.35 + .65 * Math.pow(Math.max(f, 0), 1.5)).toFixed(3) + ')';
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    el.style.transform = 'rotateX(-6deg)';
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .25; vel = dx * 2 * (rtl() ? 1 : -1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(turn, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- the real logo, gathered out of honey and plum particles, then shown as-is
  var maia = $('[data-maia]');
  var field = (function () {
    var cv = $('[data-field]'), c = cv.getContext('2d'), img = $('[data-logosrc]'), box = img.parentNode;
    var P = [], w, h, raf = 0, vis = false, t0 = 0, started = false, mx = -999, my = -999, ok = false, pad = 30;
    function sample() {
      try {
        var sc = document.createElement('canvas'), iw = 211, ih = 203; sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data, pts = [];
        for (var y = 0; y < ih; y += 1) for (var x = 0; x < iw; x += 1) if (d[(y * iw + x) * 4 + 3] > 120) pts.push([x / iw, y / ih]);
        var want = phone() ? 900 : 1500, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) { var q = pts[Math.floor(f)]; P.push({ hx: q[0], hy: q[1], x: Math.random(), y: Math.random(), vx: 0, vy: 0, ph: Math.random() * 6.28, dl: Math.random() * .6, gold: Math.random() < .45 }); }
        ok = P.length > 0;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = box.clientWidth + pad * 2; h = box.clientHeight + pad * 2; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); P.forEach(function (p) { p.sx = undefined; }); }
    function frame(now) {
      raf = 0; if (!ok || still()) return;
      var T = (now - t0) / 1000, bw = w - pad * 2, bh = h - pad * 2, settled = T > 2.4;
      box.style.setProperty('--lo', settled ? '1' : '0');
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], a = smooth((T - p.dl) / 1.5);
        var tx = pad + p.hx * bw + Math.sin(T * 1.2 + p.ph) * 1.2, ty = pad + p.hy * bh + Math.cos(T + p.ph) * 1.2;
        if (a < 1) { if (p.sx === undefined) { p.sx = p.x * w; p.sy = p.y * h; } p.x = lerp(p.sx, tx, a); p.y = lerp(p.sy, ty, a); }
        else {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 3600) { var fo = (3600 - d2) / 3600 * 2.2, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * fo; p.vy += dy / dd * fo; }
          p.vx += (tx - p.x) * .05; p.vy += (ty - p.y) * .05; p.vx *= .84; p.vy *= .84; p.x += p.vx; p.y += p.vy;
        }
        c.globalAlpha = settled ? .5 : .9;
        c.fillStyle = p.gold ? '#c27f1c' : '#8e2640';
        c.fillRect(p.x - 1.1, p.y - 1.1, 2.2, 2.2);
      }
      c.globalAlpha = 1;
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && vis && !raf && !still()) raf = requestAnimationFrame(frame); }
    box.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    box.addEventListener('pointerleave', function () { mx = my = -999; });
    function start() { size(); sample(); }
    watch(maia, function (v) { vis = v; if (v && !started && ok) { started = true; t0 = performance.now(); } kick(); }, { threshold: .2 });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();
  // her photo leans to the hand (desktop) or drifts with the scroll (phones)
  var mphoto = $('[data-follow]');
  maia.addEventListener('pointermove', function (e) { if (still() || e.pointerType !== 'mouse') return; var r = maia.getBoundingClientRect(); mphoto.style.setProperty('--fx', (((e.clientX - r.left) / r.width - .5) * -16).toFixed(1) + 'px'); mphoto.style.setProperty('--fy', (((e.clientY - r.top) / r.height - .5) * -40 - 40).toFixed(1) + 'px'); });

  // ---------------------------------------------------------------- reviews: a doubled track so the drift loops without a seam
  var track = $('[data-track]');
  $$('.rv', track).forEach(function (r) { var k = r.cloneNode(true); k.setAttribute('aria-hidden', 'true'); track.appendChild(k); });

  // ---------------------------------------------------------------- the message: subject, a day on the ring, and the WhatsApp text writing itself
  var topics = $$('[data-topics] button'), dial = $('[data-dial]'), day = 0, msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
  var arc = document.createElement('i'); arc.className = 'arc'; arc.setAttribute('aria-hidden', 'true'); dial.insertBefore(arc, dial.firstChild);
  var openDays = [0, 1, 2, 3, 4, 5].filter(function (d) { return H[d]; });
  (function () { var n = now(); day = H[n.d] ? n.d : openDays[0]; })();
  function dayLabel(d) { return he() ? ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'][d] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d]; }
  function buildDial() {
    $$('.dd', dial).forEach(function (b) { b.remove(); });
    var R = dial.clientWidth / 2 - 30;
    openDays.forEach(function (d, i) {
      var ang = (i / openDays.length) * 360 * (rtl() ? -1 : 1), rad = ang * Math.PI / 180;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'dd'; b.setAttribute('role', 'radio');
      b.textContent = dayLabel(d); b.setAttribute('aria-label', he() ? 'יום ' + dayHe[d] : dayEn[d]);
      b.style.transform = 'translate(' + (Math.sin(rad) * R).toFixed(1) + 'px,' + (-Math.cos(rad) * R).toFixed(1) + 'px)';
      b.dataset.d = d; b.dataset.ang = ang;
      b.addEventListener('click', function () { day = d; pickDay(); write(); });
      dial.appendChild(b);
    });
    pickDay();
  }
  function pickDay() {
    $$('.dd', dial).forEach(function (b) { var on = +b.dataset.d === day; b.setAttribute('aria-checked', on ? 'true' : 'false'); if (on) arc.style.setProperty('--ang', b.dataset.ang + 'deg'); });
    $('[data-dayname]').textContent = he() ? 'יום ' + dayHe[day] : dayEn[day];
    $('[data-dayhours]').textContent = hhmm(H[day][0]) + '–' + hhmm(H[day][1]);
  }
  topics.forEach(function (b) { b.addEventListener('click', function () { topics.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write(); }); });
  function compose() {
    var t = topics.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0];
    return he() ? 'היי מאיה, אשמח ' + t.dataset.he + '. נוח לי ביום ' + dayHe[day] + '. תודה!'
                : 'Hi Maia, I’d like to ' + t.dataset.en + '. ' + dayEn[day] + ' works for me. Thank you!';
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
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; if (still()) return; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var foot = $('[data-foot]');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) { light.kick(); ring.kick(); facialFrame(vh); }
    // drips stretch as the golden section scrolls away, and shorten again on the way back
    var fb = facial.getBoundingClientRect().bottom, q = calm ? 1 : smooth((vh - fb) / (vh * .7) + .2);
    drops.forEach(function (d, i) { d.style.setProperty('--dl', (lerp(.25, 1, q) * DL[i]).toFixed(3)); });
    // the horizon glow rises as the ring arrives
    var tr = turn.getBoundingClientRect(), gp = calm ? 1 : smooth((vh - tr.top) / (vh * 1.1));
    glow.style.setProperty('--rise', ((1 - gp) * 160).toFixed(1) + 'px');
    // phones: her photo drifts with the scroll
    if (!calm && phone()) { var mr = maia.getBoundingClientRect(), mp = clamp((vh - mr.top) / (vh + mr.height), 0, 1); mphoto.style.setProperty('--fy', (lerp(0, -90, mp)).toFixed(1) + 'px'); }
    // the curtain draws aside as the footer arrives
    var fr = foot.getBoundingClientRect(), op = calm ? 1 : smooth((vh - fr.top) / (Math.min(fr.height, vh) * .85));
    foot.style.setProperty('--open', op.toFixed(3));
  }

  function layout() { light.size(); field.size(); buildDial(); if (still()) clearFacial(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); layout(); write(true);
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); light.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 250);
  addEventListener('load', function () { field.size(); tick(); });
})();
