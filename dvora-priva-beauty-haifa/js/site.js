(function () {
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var hover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var WA = '972548035466';
  var TITLE = { he: 'דבורה פריווה · סלון היופי שלך בחיפה · טרומפלדור', en: 'Dvora Priva · Your Beauty Salon in Haifa · Trumpeldor St' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור דבורה פריווה סלון היופי שלך בחיפה · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Dvora Priva, Your Beauty Salon in Haifa · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'דבורה פריווה', 'Dvora Priva');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-wa]', 'וואטסאפ לדבורה', 'WhatsApp Dvora');
    aria('[data-t-call]', 'התקשרו לדבורה, 054-803-5466', 'Call Dvora, 054-803-5466');
    $('[data-t-name]').placeholder = l === 'he' ? 'למשל: מיכל' : 'e.g. Michal';
    $$('[data-decode]').forEach(function (el) { decode(el); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('dp-lang', l); } catch (e) {}
    texts(l); hours(); days(); write(true); bulbs(); lamp.size(); lamp.show(); onScroll();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); root.classList.remove('opening'); delete root.dataset.motionAuto;
    try { localStorage.setItem('dp-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    $$('.dc').forEach(function (c) { c.style.removeProperty('--dx'); c.style.removeProperty('--dy'); c.style.removeProperty('--dr'); });
    deck.show(); bulbs(); leaves.kick(); lamp.kick(); specks.kick(); onScroll(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8, 16], 1: [8, 16], 2: [8, 16], 3: [8, 16], 4: [8, 16], 5: [8, 11], 6: null };
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
      var t = H[r[0]], ds = [], k; for (k = r[0]; k <= r[1]; k++) ds.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + ds.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el, i) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letters arrive in blush and settle into ink
  $$('[data-split] > span[lang]').forEach(function (sp) {
    var i = 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // ---------------------------------------------------------------- opening: the sheet peels off (skippable, never more than ~1.6 s)
  (function () {
    if (!root.classList.contains('opening')) return;
    var p = $('[data-peel]'), done = function () { root.classList.remove('opening'); try { sessionStorage.setItem('dp-opened', '1'); } catch (e) {} };
    p.addEventListener('animationend', function (e) { if (e.animationName === 'peel') done(); });
    p.addEventListener('click', done);
    setTimeout(done, 2200);
  })();

  // ---------------------------------------------------------------- nav gathers into a pill
  var nav = $('[data-nav]');

  // ---------------------------------------------------------------- glyph decode
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'abcdefghijklmnopqrstuvwxyz' };
  function decode(el) {
    var l = he() ? 'he' : 'en', txt = el.dataset[l];
    if (still() || !el.dataset.seen) { el.textContent = txt; return; }
    var t0 = performance.now(), set = GL[l];
    (function f(t) {
      var k = clamp((t - t0) / 700, 0, 1), n = Math.floor(k * txt.length);
      el.textContent = txt.slice(0, n) + txt.slice(n).replace(/[^\s·]/g, function () { return set[Math.floor(Math.random() * set.length)]; });
      if (k < 1) requestAnimationFrame(f);
    })(t0);
  }
  $$('[data-decode]').forEach(function (el) {
    watch(el, function (v) { if (v && !el.dataset.seen) { el.dataset.seen = 1; setTimeout(function () { decode(el); }, root.classList.contains('opening') ? 1500 : 300); } });
  });

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.setAttribute('aria-label', o.dataset.odo);
    o.innerHTML = '<span class="odo" aria-hidden="true">' + o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span>' + ch + '</span>';
      var s = ''; for (var k = 0; k < 10; k++) s += '<i data-n="' + k + '"></i>';
      return '<span class="d" data-to="' + ch + '"><span>' + s + '</span></span>';
    }).join('') + '</span>';
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    if (still()) { o.textContent = o.dataset.odo; return; }
    roll(o, false);
    watch(o, function (v) { if (v && !o.dataset.done) { o.dataset.done = 1; roll(o, true); setTimeout(function () { o.textContent = o.dataset.odo; }, 2100); } }, { threshold: .4 });
  });

  // ---------------------------------------------------------------- vanity bulbs around the arched mirror
  var bulbBox = $('[data-bulbs]');
  function bulbs() {
    var g = $('.glass'), W = g.offsetWidth, Hh = g.offsetHeight, pad = 26, r = W / 2 + 12, cx = W / 2 + pad, cy = r - 12 + pad;
    var side = Hh - (r - 12), pts = [], step = phoneW() ? 34 : 40, k;
    var arc = Math.PI * r, nArc = Math.max(8, Math.round(arc / step)), nSide = Math.max(2, Math.round(side / step));
    for (k = nSide; k >= 1; k--) pts.push([pad - 12, cy + side * k / nSide - 8]);
    for (k = 0; k <= nArc; k++) { var a = Math.PI + Math.PI * k / nArc; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    for (k = 1; k <= nSide; k++) pts.push([pad + W + 12, cy + side * k / nSide - 8]);
    bulbBox.innerHTML = pts.map(function (p, i) { return '<span class="bulb" style="left:' + p[0].toFixed(1) + 'px;top:' + p[1].toFixed(1) + 'px;--tw:' + (i % 7 * .45).toFixed(2) + 's"></span>'; }).join('');
    var bs = $$('.bulb', bulbBox);
    if (still()) { bs.forEach(function (b) { b.classList.add('on'); }); return; }
    var delay = root.classList.contains('opening') ? 1300 : 250;
    bs.forEach(function (b, i) { setTimeout(function () { b.classList.add('on'); setTimeout(function () { b.classList.add('tw'); }, 600); }, delay + i * 45); });
  }
  function phoneW() { return innerWidth < 700; }

  // ---------------------------------------------------------------- mirror glass leans toward the hand; light slides across it
  var hero = $('.hero'), glass = $('.glass');
  if (hover) {
    hero.addEventListener('pointermove', function (e) {
      if (still()) return;
      var r = glass.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      glass.style.transform = 'rotateY(' + ((x - .5) * 10).toFixed(2) + 'deg) rotateX(' + ((.5 - y) * 8).toFixed(2) + 'deg)';
      glass.style.setProperty('--sx', (x * 100).toFixed(1) + '%'); glass.style.setProperty('--sy', (y * 100).toFixed(1) + '%');
    });
    hero.addEventListener('pointerleave', function () { glass.style.transform = ''; });
  }

  // ---------------------------------------------------------------- eucalyptus leaves from her card, drifting; the hand pushes them aside
  var leaves = (function () {
    var cv = $('[data-leaves]'), c = cv.getContext('2d'), L = [], w, h, raf = 0, vis = true, mx = -999, my = -999, last = 0;
    var path = new Path2D('M0 -20C-7 -10 -8 6 0 20 8 6 7 -10 0 -20z'), vein = new Path2D('M0 -17L0 18');
    function size() {
      var d = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * d; cv.height = h * d; c.setTransform(d, 0, 0, d, 0, 0);
      var n = phoneW() ? 9 : 16; L = [];
      for (var i = 0; i < n; i++) L.push({ x: Math.random() * w, y: Math.random() * h, s: .7 + Math.random() * .9, a: Math.random() * 6.28, va: (Math.random() - .5) * .01, vy: .15 + Math.random() * .25, ph: Math.random() * 6.28, col: i % 3 === 0 ? 'rgba(231,195,193,.75)' : 'rgba(143,154,148,.38)', ox: 0, oy: 0 });
      draw(0);
    }
    function draw(dt) {
      c.clearRect(0, 0, w, h);
      L.forEach(function (p) {
        if (dt) {
          p.y += p.vy * dt * .06; p.ph += .0009 * dt; p.x += Math.sin(p.ph) * .25; p.a += p.va * dt * .06;
          var dx = p.x + p.ox - mx, dy = p.y + p.oy - my, d2 = dx * dx + dy * dy;
          if (d2 < 14000) { var f = (1 - d2 / 14000) * 3; p.ox += dx / Math.sqrt(d2 + 1) * f; p.oy += dy / Math.sqrt(d2 + 1) * f; }
          p.ox *= .96; p.oy *= .96;
          if (p.y > h + 30) { p.y = -30; p.x = Math.random() * w; }
        }
        c.save(); c.translate(p.x + p.ox, p.y + p.oy); c.rotate(p.a); c.scale(p.s, p.s);
        c.fillStyle = p.col; c.fill(path); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1; c.stroke(vein); c.restore();
      });
    }
    function frame(t) { raf = 0; if (still() || !vis) return; var dt = last ? Math.min(50, t - last) : 16; last = t; draw(dt); raf = requestAnimationFrame(frame); }
    function kick() { if (!raf && !still() && vis) { last = 0; raf = requestAnimationFrame(frame); } }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- the magnifying lamp over her room
  var lamp = (function () {
    var box = $('[data-room-photo]'), lp = $('[data-lamp]'), li = $('.lens img', lp), tag = $('[data-lamp-tag]');
    var IW = 1100, IH = 1954, Z = 2.1, W, Hh, dw, dh, ox, oy, Ls, x = 0, y = 0, tx = 0, ty = 0, raf = 0, vis = false, inside = false, poi = 0, timer = 0, shown = -1;
    var P = [
      { x: .12, y: .6, he: 'המוצרים על המדף', en: 'Products on the shelf' },
      { x: .86, y: .24, he: 'הקיר של דבורה', en: 'Dvora’s wall' },
      { x: .66, y: .86, he: 'מיטת הטיפולים', en: 'The treatment bed' },
      { x: .3, y: .26, he: 'הבלונים מהחגיגה', en: 'The celebration balloons' }
    ];
    function size() {
      W = box.clientWidth; Hh = box.clientHeight; Ls = phoneW() ? 150 : 230; lp.style.setProperty('--L', Ls + 'px');
      var s = Math.max(W / IW, Hh / IH); dw = IW * s; dh = IH * s; ox = (W - dw) / 2; oy = (Hh - dh) * .52;
      li.style.width = dw * Z + 'px'; li.style.height = dh * Z + 'px';
      P.forEach(function (p) { p.bx = clamp(ox + p.x * dw, Ls * .4, W - Ls * .4); p.by = clamp(oy + p.y * dh, Ls * .4, Hh - Ls * .4); });
      if (!x) { x = tx = P[0].bx; y = ty = P[0].by; }
      place();
    }
    function place() {
      lp.style.setProperty('--lx', x + 'px'); lp.style.setProperty('--ly', y + 'px');
      li.style.transform = 'translate(' + (Ls / 2 - (x - ox) * Z) + 'px,' + (Ls / 2 - (y - oy) * Z) + 'px)';
    }
    function show() {
      var best = -1, bd = 1e9; P.forEach(function (p, i) { var d = Math.hypot(p.bx - x, p.by - y); if (d < bd) { bd = d; best = i; } });
      if (bd > Ls * .6) best = -1;
      if (best === shown && tag.dataset.l === root.lang) return;
      shown = best; tag.dataset.l = root.lang;
      tag.classList.toggle('on', best >= 0);
      if (best >= 0) tag.textContent = P[best][he() ? 'he' : 'en'];
    }
    function frame() {
      raf = 0; if (still()) return;
      x = lerp(x, tx, .09); y = lerp(y, ty, .09); place(); show();
      if (Math.abs(x - tx) > .3 || Math.abs(y - ty) > .3) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); }
    function glide() { if (inside || !vis || still()) return; poi = (poi + 1) % P.length; tx = P[poi].bx; ty = P[poi].by; kick(); }
    box.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; inside = true; var r = box.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; kick(); });
    box.addEventListener('pointerleave', function () { inside = false; });
    box.addEventListener('click', function (e) { var r = box.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; kick(); clearInterval(timer); timer = setInterval(glide, 3000); });
    watch(box, function (v) { vis = v; clearInterval(timer); if (v) { glide(); timer = setInterval(glide, 3000); } });
    return { size: size, kick: kick, show: function () { shown = -2; show(); } };
  })();

  // ---------------------------------------------------------------- her photos dealt off a stack
  var dealEl = $('[data-deal]'), cards = $$('.dc', dealEl);
  function stack() {
    if (still()) return;
    var r0 = cards[0].getBoundingClientRect();
    cards.forEach(function (c, i) {
      var r = c.getBoundingClientRect();
      c.style.transitionDelay = (i * 110) + 'ms';
      c.style.setProperty('--dx', (r0.left - r.left + (i * 6)) + 'px');
      c.style.setProperty('--dy', (i * 8) + 'px');
      c.style.setProperty('--dr', ((i % 2 ? 1 : -1) * (3 + i * 2)) + 'deg');
    });
  }
  stack();
  watch(dealEl, function (v) {
    if (!v || dealEl.classList.contains('dealt')) return;
    dealEl.classList.add('dealt');
    cards.forEach(function (c) { c.style.removeProperty('--dx'); c.style.removeProperty('--dy'); c.style.removeProperty('--dr'); });
    setTimeout(function () { cards.forEach(function (c) { c.style.transitionDelay = '0ms'; c.style.transition = 'transform .35s var(--out)'; }); }, 1500);
  }, { threshold: .35 });
  if (hover) cards.forEach(function (c) {
    c.addEventListener('pointermove', function (e) { if (still()) return; var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5; c.style.setProperty('--ty', (px * 10).toFixed(2) + 'deg'); c.style.setProperty('--tx', (-py * 8).toFixed(2) + 'deg'); });
    c.addEventListener('pointerleave', function () { c.style.removeProperty('--tx'); c.style.removeProperty('--ty'); });
  });

  // ---------------------------------------------------------------- the review stack
  var deck = (function () {
    var el = $('[data-deck]'), rc = $$('.rc', el), order = rc.map(function (_, i) { return i; }), cnt = $('[data-cnt]'), busy = false, arrived = still();
    function show() {
      arrived = arrived || still();
      order.forEach(function (ix, k) { rc[ix].dataset.k = arrived ? k : 3; rc[ix].setAttribute('aria-hidden', k ? 'true' : 'false'); });
      cnt.textContent = (order[0] + 1) + ' / ' + rc.length;
    }
    function next(dir) {
      if (busy) return; var top = rc[order[0]];
      var go = function () { order.push(order.shift()); top.classList.remove('fly'); show(); busy = false; };
      if (still()) { go(); return; }
      busy = true; top.style.setProperty('--fx', dir || (he() ? -1 : 1)); top.classList.add('fly'); setTimeout(go, 420);
    }
    $('[data-next]').addEventListener('click', function () { next(); });
    var sx = null;
    el.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    el.addEventListener('pointerup', function (e) { if (sx === null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) next(dx > 0 ? 1 : -1); });
    show();
    watch(el, function (v) { if (v && !arrived) { arrived = true; setTimeout(show, 150); } }, { threshold: .3 });
    return { show: function () { arrived = true; show(); } };
  })();

  // ---------------------------------------------------------------- the appointment card writes the WhatsApp message
  var form = $('[data-appt]'), msg = $('[data-msg]'), send = $('[data-send]'), typing = 0, shownMsg = '';
  var dayShortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳'], dayShortEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  function days() {
    var box = $('[data-days]'), cur = (form.querySelector('[name=d]:checked') || {}).value;
    box.innerHTML = (he() ? dayShortHe : dayShortEn).map(function (d, i) {
      return '<label><input type="radio" name="d" value="' + i + '"' + (String(i) === cur ? ' checked' : '') + ' aria-label="' + (he() ? 'יום ' + dayHe[i] : dayEn[i]) + '"><span aria-hidden="true">' + d + '</span></label>';
    }).join('');
  }
  function compose() {
    var l = he(), f = new FormData(form), n = (f.get('n') || '').trim().slice(0, 40), w = f.get('w'), d = f.get('d'), t = f.get('t');
    var noon = $('[data-noon] input'); noon.disabled = d === '5';
    if (d === '5' && t === '1') { form.querySelector('[name=t][value="0"]').checked = true; t = '0'; }
    if (l) {
      var hi = 'שלום דבורה' + (n ? ', כאן ' + n : '') + '.';
      if (w === '1') return hi + ' יש לי שאלה לפני טיפול פנים:';
      return hi + ' אשמח לתאם טיפול פנים' + (d != null ? ', אם אפשר ביום ' + dayHe[+d] + (t === '1' ? ' בצהריים' : ' בבוקר') : '') + '.';
    }
    var hiE = 'Hello Dvora' + (n ? ', this is ' + n : '') + '.';
    if (w === '1') return hiE + ' I have a question before a facial:';
    return hiE + ' I’d like to book a facial' + (d != null ? ', on ' + dayEn[+d] + (t === '1' ? ' around midday' : ' morning') + ' if possible' : '') + '.';
  }
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    if (target === shownMsg && !instant) return;
    cancelAnimationFrame(typing);
    if (instant || still()) { msg.textContent = shownMsg = target; return; }
    var keep = 0; while (keep < shownMsg.length && shownMsg[keep] === target[keep]) keep++;
    var i = keep, last = 0;
    (function f(ts) {
      if (ts - last > 16) { i += 2; last = ts; msg.textContent = target.slice(0, i); }
      if (i < target.length) typing = requestAnimationFrame(f); else { msg.textContent = target; }
    })(0);
    shownMsg = target;
  }
  form.addEventListener('input', function () { write(); });
  form.addEventListener('change', function () { write(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  // ---------------------------------------------------------------- footer: specks gather into her logo, the hand scatters them
  var specks = (function () {
    var stage = $('[data-logo-stage]'), cv = $('[data-specks]'), c = cv.getContext('2d'), img = new Image(), S = [], w, h, ready = false, raf = 0, vis = false, p = 0, mx = -999, my = -999;
    img.src = 'img/logo.png';
    function build() {
      var d = Math.min(2, devicePixelRatio || 1); w = stage.clientWidth; h = stage.clientHeight; if (!w) return;
      cv.width = w * d; cv.height = h * d; c.setTransform(d, 0, 0, d, 0, 0);
      var o = document.createElement('canvas'), ow = Math.round(w * .88), oh = Math.round(h * .88); o.width = ow; o.height = oh;
      var oc = o.getContext('2d'); oc.drawImage(img, 0, 0, ow, oh);
      var data; try { data = oc.getImageData(0, 0, ow, oh).data; } catch (e) { return; }
      var step = phoneW() ? 5 : 6; S = [];
      for (var yy = 0; yy < oh; yy += step) for (var xx = 0; xx < ow; xx += step) {
        var k = (yy * ow + xx) * 4, r = data[k], g = data[k + 1], b = data[k + 2];
        if (Math.min(r, g, b) < 225) S.push({ tx: xx + w * .06, ty: yy + h * .06, sx: Math.random() * w, sy: Math.random() * h - h * .4, col: 'rgb(' + r + ',' + g + ',' + b + ')', ph: Math.random() * 6.28, ox: 0, oy: 0 });
      }
      ready = true; draw();
    }
    function draw() {
      c.clearRect(0, 0, w, h); var e = smooth(p), sz = phoneW() ? 3.4 : 4;
      S.forEach(function (s) {
        var x = lerp(s.sx, s.tx, e) + Math.sin(s.ph + p * 6) * (1 - e) * 10, y = lerp(s.sy, s.ty, e);
        var dx = x + s.ox - mx, dy = y + s.oy - my, d2 = dx * dx + dy * dy;
        if (d2 < 3600) { var f = (1 - d2 / 3600) * 4; s.ox += dx / Math.sqrt(d2 + 1) * f; s.oy += dy / Math.sqrt(d2 + 1) * f; }
        s.ox *= .9; s.oy *= .9;
        c.fillStyle = s.col; c.fillRect(x + s.ox - sz / 2, y + s.oy - sz / 2, sz, sz);
      });
      stage.style.setProperty('--lo', smooth((p - .82) / .16).toFixed(3));
      cv.style.opacity = (1 - smooth((p - .9) / .1)).toFixed(3);
    }
    function frame() {
      raf = 0; if (still() || !vis || !ready) return;
      var r = stage.getBoundingClientRect(); p = clamp((innerHeight - r.top) / (innerHeight * .5), 0, 1); if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) p = 1;
      draw(); raf = requestAnimationFrame(frame);
    }
    function kick() {
      if (still()) { stage.style.setProperty('--lo', '1'); cv.style.opacity = 0; return; }
      if (!raf && vis && ready) raf = requestAnimationFrame(frame);
    }
    stage.addEventListener('pointermove', function (e) { var r = stage.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    stage.addEventListener('pointerleave', function () { mx = my = -999; });
    img.onload = function () { build(); kick(); };
    watch(stage, function (v) { vis = v; if (v && !ready && img.complete) build(); kick(); });
    if (still()) kick();
    return { kick: kick, build: function () { if (img.complete) build(); } };
  })();

  // ---------------------------------------------------------------- scroll-linked: the arch opens into the room, colour returns to Dvora, the aqua arch flattens
  var roomPhoto = $('[data-room-photo]'), wash = $('[data-wash]'), arch = $('[data-arch]'), ticking = false;
  function onScroll() {
    ticking = false;
    nav.classList.toggle('gather', scrollY > 40);
    var vh = innerHeight;
    if (still()) return;
    var r = roomPhoto.getBoundingClientRect();
    roomPhoto.style.setProperty('--o', (1 - smooth((vh - r.top) / (vh * .75))).toFixed(3));
    var wr = wash.getBoundingClientRect();
    wash.style.setProperty('--w', (.12 + .88 * smooth((vh - wr.top) / (vh * .9))).toFixed(3));
    var ar = arch.getBoundingClientRect();
    arch.style.setProperty('--a', (1 - smooth((vh - ar.top) / (vh * .8))).toFixed(3));
    if (!hover) { var g = glass.getBoundingClientRect(); glass.style.setProperty('--sx', (30 + 40 * clamp(-g.top / vh + .3, 0, 1)) + '%'); }
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  function layout() { leaves.size(); lamp.size(); bulbs(); onScroll(); }
  var rw = innerWidth;
  addEventListener('resize', function () { if (innerWidth === rw) return; rw = innerWidth; leaves.size(); lamp.size(); bulbs(); specks.build(); onScroll(); });

  texts(root.lang); hours(); days(); write(true); layout(); leaves.kick();
})();
