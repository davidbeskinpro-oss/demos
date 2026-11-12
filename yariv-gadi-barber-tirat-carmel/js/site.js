(function () {
  var root = document.documentElement, WA = '972509580181';
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
  var TITLE = { he: 'יריב גדי · ספר גברים וילדים · הפלמ״ח 25, טירת כרמל', en: 'Yariv Gadi · Barber for men & kids · 25 HaPalmach, Tirat Carmel' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור יריב גדי מספרת ילדים וגברים · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Yariv Gadi Kids & Men’s Barbershop · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'יריב גדי, ספר גברים וילדים', 'Yariv Gadi, barber for men and kids');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-wa]', 'וואטסאפ ליריב', 'WhatsApp Yariv');
    aria('[data-t-call]', 'להתקשר ליריב, 050-958-0181', 'Call Yariv, 050-958-0181');
    aria('[data-t-day]', 'יום', 'Day');
    $('[data-t-map]').title = l === 'he' ? 'מפה: הפלמ״ח 25, טירת כרמל' : 'Map: 25 HaPalmach, Tirat Carmel';
    $$('[data-decode]').forEach(function (t) { if (t.textContent) t.textContent = t.dataset[l]; });
    $$('.spot').forEach(function (s) { if (s.classList.contains('on')) $('.tag', s).textContent = s.dataset[l]; });
    days();
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('yg-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('yg-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    resetStill(); layout(); clips.kick(); ring.kick(); cape.kick(); write(true); decodeAll();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9, 19], 1: null, 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 15], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
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
      var t = H[r[0]], d = [], k; for (k = r[0]; k <= r[1]; k++) d.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + d.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento,.v-bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 5) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); setTimeout(function () { e.target.classList.add('live'); }, 1300); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter
  $$('[data-split] .ln span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 10 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // labels that decode out of scrambled letters
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHJKLMNPRSTUVWXYZ' };
  function decode(el, txt) {
    clearInterval(el._t);
    if (still()) { el.textContent = txt; return; }
    var g = GL[he() ? 'he' : 'en'], f = 0, n = txt.length;
    el._t = setInterval(function () {
      f++; var done = Math.floor(f / 2);
      el.textContent = txt.split('').map(function (c, i) { return i < done || c === ' ' || c === '·' ? c : g[Math.floor(Math.random() * g.length)]; }).join('');
      if (done >= n) { clearInterval(el._t); el.textContent = txt; }
    }, 32);
  }
  function decodeAll() { $$('[data-decode]').forEach(function (t, i) { setTimeout(function () { decode(t, t.dataset[he() ? 'he' : 'en']); }, still() ? 0 : i * 380); }); }

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- hair clippings in the sign's KIDS colours, falling across the hero
  var clips = (function () {
    var cv = $('[data-clips]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = true, last = 0, mx = -999, my = -999;
    var COL = ['#4fb8ea', '#b296de', '#efe2c4', '#4fb062', '#4fb8ea', '#efe2c4', '#6b4a33', '#3a2a20'];
    function make(x, y, burst) {
      var a = Math.random() * 6.28;
      return { x: x, y: y, vx: burst ? Math.cos(a) * (60 + Math.random() * 120) : 0, vy: burst ? Math.sin(a) * 90 - 40 : 0, fall: 14 + Math.random() * 30, len: 7 + Math.random() * 12, bend: (Math.random() - .5) * 8, rot: Math.random() * 6.28, spin: (Math.random() - .5) * 1.6, ph: Math.random() * 6.28, col: COL[Math.floor(Math.random() * COL.length)], wd: 1.3 + Math.random() * 1.1, al: .45 + Math.random() * .45 };
    }
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var want = phone() ? 46 : 90; P = []; for (var i = 0; i < want; i++) P.push(make(Math.random() * w, Math.random() * h));
    }
    function draw() {
      c.clearRect(0, 0, w, h); c.lineCap = 'round';
      P.forEach(function (p) {
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.globalAlpha = p.al; c.strokeStyle = p.col; c.lineWidth = p.wd;
        c.beginPath(); c.moveTo(-p.len / 2, 0); c.quadraticCurveTo(0, p.bend, p.len / 2, 0); c.stroke(); c.restore();
      });
    }
    function frame(t) {
      raf = 0; var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (still()) { draw(); return; }
      P.forEach(function (p, i) {
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 9000) { var f = (9000 - d2) / 9000 * 900 * dt, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f * 6; p.vy += dy / dd * f * 6; }
        p.vx *= .94; p.vy *= .94;
        p.x += (p.vx + Math.sin(t / 900 + p.ph) * 12) * dt; p.y += (p.fall + p.vy) * dt; p.rot += (p.spin + p.vx * .004) * dt;
        if (p.y > h + 20 || p.x < -30 || p.x > w + 30) { if (i >= (phone() ? 46 : 90)) { P.splice(i, 1); return; } P[i] = make(Math.random() * w, -15); }
      });
      draw(); if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) { if (still()) return; var r = hero.getBoundingClientRect(); for (var k = 0; k < 14; k++) P.push(make(e.clientX - r.left, e.clientY - r.top, true)); kick(); });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { size: function () { size(); draw(); }, kick: kick };
  })();

  // hero photo leans toward the hand (on phones: toward the scroll)
  var hp = $('.h-photo-in');
  hero.addEventListener('pointermove', function (e) {
    if (still() || !fine) return; var r = hp.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    hp.style.setProperty('--ry', ((x - .5) * 10).toFixed(2) + 'deg'); hp.style.setProperty('--rx', ((.5 - y) * 8).toFixed(2) + 'deg');
    hp.style.setProperty('--sx', (x * 100).toFixed(1) + '%'); hp.style.setProperty('--sy', (y * 100).toFixed(1) + '%');
  });
  hero.addEventListener('pointerleave', function () { hp.style.setProperty('--rx', '0deg'); hp.style.setProperty('--ry', '0deg'); });

  // ---------------------------------------------------------------- tiles: spotlight and lean under the hand; on phones a slow parallax
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) {
      if (!fine) return; var r = t.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      t.style.setProperty('--mx', x + 'px'); t.style.setProperty('--my', y + 'px');
      if (!still()) { t.style.setProperty('--ry', ((x / r.width - .5) * 6).toFixed(2) + 'deg'); t.style.setProperty('--rx', ((.5 - y / r.height) * 5).toFixed(2) + 'deg'); }
    });
    t.addEventListener('pointerleave', function () { t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); });
  });
  var kids = $('#kids'); watch(kids, function (v) { kids.classList.toggle('on', v); });
  var tileImgs = $$('.bento .tile img');

  // ---------------------------------------------------------------- the clippers: light runs along the steel
  var mclip = $('[data-sheen]');
  mclip.addEventListener('pointermove', function (e) { if (!fine) return; var r = mclip.getBoundingClientRect(); mclip.style.setProperty('--sh', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); });

  // ---------------------------------------------------------------- the door: the camera walks through it into the jeep
  var door = $('[data-door]'), stage = $('[data-dstage]'), dout = $('[data-dout]'), din = $('[data-din]'), dinImg = $('img', din), caps = $$('[data-cap]'), spots = $$('.spot');
  var GLASS = [.571, .488, .831, .834], IW = 1100, IH = 1713;
  function placeSpots() {
    var W = din.clientWidth, Hh = din.clientHeight, s = Math.max(W / 1200, Hh / 1178), dw = 1200 * s, dh = 1178 * s, ox = (W - dw) * .5, oy = (Hh - dh) * .5;
    spots.forEach(function (sp) {
      var x = ox + dw * +sp.dataset.x, y = oy + dh * +sp.dataset.y;
      sp.style.left = x + 'px'; sp.style.top = y + 'px';
      sp.classList.toggle('flip', x > W * .55);
      sp.hidden = x < 10 || x > W - 10 || y < 60 || y > Hh - 60;
    });
  }
  function spotOn(sp, on) {
    if (on === sp.classList.contains('on')) return;
    sp.classList.toggle('on', on); var tag = $('.tag', sp);
    if (!on) { clearInterval(tag._t); tag.textContent = ''; return; }
    decode(tag, sp.dataset[he() ? 'he' : 'en']);
  }
  function doorFrame(p) {
    var W = stage.clientWidth, Hh = stage.clientHeight, s = Math.max(W / IW, Hh / IH), dw = IW * s, dh = IH * s;
    var ox = (W - dw) * .5, oy = (Hh - dh) * (W > Hh ? .62 : .5);
    $('img', dout).style.cssText = 'position:absolute;left:' + ox.toFixed(1) + 'px;top:' + oy.toFixed(1) + 'px;width:' + dw.toFixed(1) + 'px;height:' + dh.toFixed(1) + 'px;max-width:none;object-fit:fill';
    var x0 = ox + GLASS[0] * dw, y0 = oy + GLASS[1] * dh, x1 = ox + GLASS[2] * dw, y1 = oy + GLASS[3] * dh;
    var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, e = smooth((p - .06) / .5), S1 = clamp(Hh * 1.05 / (y1 - y0), 1, 4.2), S = lerp(1, S1, e);
    var tx = lerp(cx, W / 2, e) - cx * S, ty = lerp(cy, Hh / 2, e) - cy * S;
    // never let the photo's edge come into the frame
    tx = clamp(tx, W - (ox + dw) * S, -ox * S); ty = clamp(ty, Hh - (oy + dh) * S, -oy * S);
    dout.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + S.toFixed(4) + ')';
    // the door's glass, where it now is on screen; the inside opens out of it to the full frame
    var r = smooth((p - .38) / .26), gx0 = x0 * S + tx, gy0 = y0 * S + ty, gx1 = x1 * S + tx, gy1 = y1 * S + ty;
    din.style.setProperty('--cl', lerp(gx0, 0, r).toFixed(1) + 'px'); din.style.setProperty('--ct', lerp(gy0, 0, r).toFixed(1) + 'px');
    din.style.setProperty('--cr', lerp(W - gx1, 0, r).toFixed(1) + 'px'); din.style.setProperty('--cb', lerp(Hh - gy1, 0, r).toFixed(1) + 'px');
    din.style.setProperty('--cr2', lerp(6, 0, r).toFixed(1) + 'px');
    din.style.opacity = smooth((p - .22) / .12).toFixed(3);
    dinImg.style.transform = 'scale(' + lerp(1.18, 1, r).toFixed(4) + ')';
    caps[0].style.opacity = (1 - smooth((p - .1) / .1)).toFixed(3); caps[0].style.transform = 'translateY(' + (-smooth((p - .1) / .1) * 30).toFixed(1) + 'px)';
    var c2 = smooth((p - .66) / .1); caps[1].style.opacity = c2.toFixed(3); caps[1].style.transform = 'translateY(' + ((1 - c2) * 30).toFixed(1) + 'px)';
    spots.forEach(function (sp, i) { spotOn(sp, p > .72 + i * .06); });
  }

  // ---------------------------------------------------------------- the cape: thrown over the seam, flutters, lifts off
  var cape = (function () {
    var el = $('[data-cape]'), cloth = $('[data-cloth]'), raf = 0, vis = false;
    function shape(d, ph) {
      var pts = [], N = 22, amp = 2.2 + d * 3.4, half = d * 50, i, x;
      for (i = 0; i <= N; i++) { x = i / N * 100; pts.push(x.toFixed(2) + '% ' + clamp(50 - half + Math.sin(i * .9 + ph) * amp * d, 0, 100).toFixed(2) + '%'); }
      for (i = N; i >= 0; i--) { x = i / N * 100; pts.push(x.toFixed(2) + '% ' + clamp(50 + half + Math.sin(i * .7 - ph * 1.3) * amp * 1.4 * d + (i % 2 ? 1.2 : -1.2) * d, 0, 100).toFixed(2) + '%'); }
      cloth.style.setProperty('--clip', 'polygon(' + pts.join(',') + ')');
    }
    function frame(t) {
      raf = 0;
      if (still()) { shape(.55, 0); cloth.style.transform = ''; return; }
      var top = el.getBoundingClientRect().top, vh = innerHeight, p = clamp(1 - top / vh, 0, 1), d = Math.sin(Math.PI * clamp(p * 1.2 - .1, 0, 1));
      shape(d, p * 7 + t / 700);
      cloth.style.transform = 'translateY(' + ((p - .5) * -6).toFixed(2) + 'svh)';
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    watch(el, function (v) { vis = v; kick(); }, { rootMargin: '30% 0px 30% 0px' });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- the swivel: a ring of real photos turns like the chair
  var swivel = $('[data-swivel]');
  var ring = (function () {
    var wrap = $('[data-ringwrap]'), el = $('[data-ring]');
    $$('.rc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); el.appendChild(k); });
    var cards = $$('.rc', el), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = true, last = 0;
    function R() { var cw = cards[0].offsetWidth || 160; return cw * 1.08 / (2 * Math.tan(Math.PI / N)); }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; }); el.style.transform = ''; return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (10 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var r = R(), sc = scrollY * .08 * (rtl() ? 1 : -1);
      el.style.transform = 'translateZ(' + (-r * .55).toFixed(1) + 'px) rotateX(-8deg)';
      cards.forEach(function (c, i) {
        var a = rot + sc + i * step, f = Math.cos(a * Math.PI / 180), lift = f > .96 ? (f - .96) * 25 : 0;
        c.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + (r + lift * 30).toFixed(1) + 'px)';
        c.style.filter = 'brightness(' + (.35 + .65 * Math.pow(Math.max(f, 0), 1.5)).toFixed(3) + ')';
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .3; vel = dx * 2 * (rtl() ? 1 : -1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(swivel, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- figures count up (whole text each frame, so digits never misalign)
  function decs(o) { return (o.dataset.odo.split('.')[1] || '').length; }
  function count(o) {
    var to = +o.dataset.odo, dec = decs(o);
    if (still()) { o.textContent = to.toFixed(dec); return; }
    var t0 = performance.now();
    (function st(t) { var u = clamp((t - t0) / 1400, 0, 1), e = 1 - Math.pow(1 - u, 3); o.textContent = (to * e).toFixed(dec); if (u < 1) requestAnimationFrame(st); })(t0);
  }
  $$('[data-odo]').forEach(function (o) {
    o.textContent = still() ? o.dataset.odo : (0).toFixed(decs(o));
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { count(o); ob.disconnect(); } }, { threshold: .4 }).observe(o); else count(o);
  });

  // ---------------------------------------------------------------- booking: who, which day on the comb, and the chat writes itself
  var seats = $$('[data-who]'), range = $('[data-day]'), daysEl = $('[data-days]'), comb = $('[data-comb]'), steps = $$('[data-step]'), msgEl = $('[data-msg]'), send = $('[data-send]');
  var OPEN = [0, 2, 3, 4, 5], guard = document.createElement('span'); guard.className = 'guard'; guard.setAttribute('aria-hidden', 'true'); comb.appendChild(guard);
  var shown = '', typing = 0, chatSeen = false;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function days() {
    var names = he() ? dayHe : dayEn;
    daysEl.innerHTML = OPEN.map(function (d, i) { return '<li' + (i === +range.value ? ' class="on"' : '') + '>' + (phone() && !he() ? names[d].slice(0, 3) : names[d]) + '</li>'; }).join('');
    guard.style.insetInlineStart = 'calc(' + (+range.value * 20) + '% + 3px)';
    guard.textContent = he() ? ['א׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳'][+range.value] : ['Sun', 'Tue', 'Wed', 'Thu', 'Fri'][+range.value];
    range.setAttribute('aria-valuetext', names[OPEN[+range.value]]);
  }
  seats.forEach(function (b) { b.addEventListener('click', function () {
    var on = b.getAttribute('aria-pressed') !== 'true';
    if (!on && seats.filter(function (x) { return x.getAttribute('aria-pressed') === 'true'; }).length < 2) return;   // someone is always having a cut
    b.setAttribute('aria-pressed', on ? 'true' : 'false'); lightStep(0); write();
  }); });
  range.addEventListener('input', function () { days(); lightStep(1); write(); });
  send.addEventListener('pointerenter', function () { lightStep(2); });
  send.addEventListener('focus', function () { lightStep(2); });
  function compose() {
    var l = he(), kid = seats[0].getAttribute('aria-pressed') === 'true', man = seats[1].getAttribute('aria-pressed') === 'true', d = OPEN[+range.value];
    if (l) return 'היי יריב, אשמח לקבוע תור לתספורת ' + (kid && man ? 'לי ולילד' : man ? 'לי' : 'לילד') + ' ביום ' + dayHe[d] + '. מתי נוח לך?';
    return 'Hi Yariv, I’d like to book a haircut for ' + (kid && man ? 'me and my child' : man ? 'me' : 'my child') + ' on ' + dayEn[d] + '. What time suits you?';
  }
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
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
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; lightStep(0); if (!still()) { shown = ''; msgEl.textContent = ''; } write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- reviews land, footer sign lights up
  var revBox = $('#reviews'), rvs = $$('.rv'), RR = [-2.2, 1.6, -1.1, 2, -1.4];
  var page = $('.page'), foot = $('[data-foot]');

  function resetStill() {
    if (!still()) return;
    dout.style.transform = ''; $('img', dout).style.cssText = ''; din.style.opacity = ''; dinImg.style.transform = '';
    caps.forEach(function (c) { c.style.opacity = ''; c.style.transform = ''; });
    rvs.forEach(function (rv) { rv.style.transform = ''; rv.style.filter = ''; });
    tileImgs.forEach(function (i) { i.style.removeProperty('--py'); });
    spots.forEach(function (sp) { spotOn(sp, true); });
  }

  // ---------------------------------------------------------------- one scroll loop
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) {
      doorFrame(prog(door));
      cape.kick();
      // phones: the tiles drift, the clippers' steel catches the light as you scroll
      tileImgs.forEach(function (im) { var r = im.parentNode.getBoundingClientRect(); im.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * -.05).toFixed(1) + 'px'); });
      if (!fine) { var mr = mclip.getBoundingClientRect(); mclip.style.setProperty('--sh', clamp((vh - mr.top) / (vh + mr.height) * 140 - 20, -20, 120).toFixed(1) + '%'); }
      if (!fine) { var hr = hp.getBoundingClientRect(); hp.style.setProperty('--rx', clamp((hr.top + hr.height / 2 - vh / 2) / vh * -10, -6, 6).toFixed(2) + 'deg'); hp.style.setProperty('--sy', clamp(50 - hr.top / vh * 60, 0, 100).toFixed(1) + '%'); }
      var pr = prog(revBox), seg = .85 / (rvs.length - 1);
      rvs.forEach(function (rv, i) {
        var t = i === 0 ? 1 : smooth((pr - .05 - (i - 1) * seg) / (seg * .8)), above = 0;
        for (var j = i + 1; j < rvs.length; j++) above += smooth((pr - .05 - (j - 1) * seg) / (seg * .8));
        rv.style.transform = 'translateY(' + ((1 - t) * 125).toFixed(2) + '%) rotate(' + lerp(9, RR[i], t).toFixed(2) + 'deg) scale(' + (1 - Math.min(above, 3) * .035).toFixed(3) + ')';
        rv.style.filter = above ? 'brightness(' + (1 - Math.min(above, 3) * .16).toFixed(3) + ')' : '';
        rv.style.visibility = t <= 0.001 ? 'hidden' : '';
      });
    }
    var pb = page.getBoundingClientRect().bottom, fp = calm ? 1 : clamp((vh - pb) / Math.max(1, foot.offsetHeight), 0, 1);
    foot.style.setProperty('--lit', smooth(fp).toFixed(3));
  }

  function layout() { clips.size(); placeSpots(); days(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout(); resetStill();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); clips.kick(); setTimeout(decodeAll, still() ? 0 : 1300); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { placeSpots(); tick(); });
})();
