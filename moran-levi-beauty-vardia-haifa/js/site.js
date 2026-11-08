(function () {
  var root = document.documentElement, WA = '972528856605';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var TITLE = { he: 'מורן לוי · מכון יופי · ורדיה 8, חיפה', en: 'Moran Levi · Beauty studio · 8 Vardia St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור מורן לוי מכון יופי · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Moran Levi Beauty · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'מורן לוי מכון יופי', 'Moran Levi Beauty');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-wa]', 'וואטסאפ למורן', 'WhatsApp Moran');
    aria('[data-t-call]', 'התקשרו למורן, 052-885-6605', 'Call Moran, 052-885-6605');
    aria('[data-t-prev]', 'הקודם', 'Previous');
    aria('[data-t-next]', 'הבא', 'Next');
    aria('[data-hours]', 'שעות פתיחה', 'Opening hours');
    $('[data-t-map]').title = l === 'he' ? 'מפה: ורדיה 8, חיפה' : 'Map: 8 Vardia St, Haifa';
    $$('.tag').forEach(function (t) { t.setAttribute('aria-label', t.dataset[l]); if (t.classList.contains('on')) $('span', t).textContent = t.dataset[l]; });
    $$('[data-decode]').forEach(function (d) { decode(d, true); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ml-lang', l); } catch (e) {}
    texts(l); hours(); days(); write(true); layout(); fname.build();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- glyph decode (specimen labels)
  var POOL = 'אבגדהוזחטיכלמנסעפצקרשתabcdefghiklmnoprstuvy';
  function decode(el, instant) {
    var txt = el.dataset[he() ? 'he' : 'en'];
    clearInterval(el._t);
    if (instant || still()) { el.textContent = txt; return; }
    var n = 0, steps = txt.length + 8;
    el._t = setInterval(function () {
      n++;
      el.textContent = txt.split('').map(function (c, i) { return c === ' ' || c === '·' || i < n - 6 ? c : POOL[Math.floor(Math.random() * POOL.length)]; }).join('');
      if (n >= steps) { clearInterval(el._t); el.textContent = txt; }
    }, 40);
  }
  $$('[data-decode]').forEach(function (d) {
    watch(d, function (v) { if (v && !d._seen) { d._seen = true; decode(d); } }, { threshold: .6 });
  });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('ml-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('.rv-up,.bud,[data-vmap]').forEach(function (el) { el.classList.add('in'); });
    hero.classList.add('ready', 'dealt');
    layout(); drift.kick(); flowerKick(); fname.kick(); write(true); gauge(true); bstage(bst);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8.5, 19], 1: null, 2: [8.5, 19], 3: [8.5, 19], 4: [8.5, 19], 5: [8.5, 13 + 55 / 60], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x + 1e-9), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return window.__now || { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = now(), l = he(), t = H[n.d], txt, open = false;
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
  }
  // consecutive days with the same hours share a row; the week starts on Sunday
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
  $$('.rv-up,[data-vmap]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  // reviews open like buds, one after another
  var bio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { var i = $$('.bud').indexOf(e.target); e.target.style.transitionDelay = (i % 3) * 110 + 'ms'; e.target.classList.add('in'); bio.unobserve(e.target); setTimeout(function () { e.target.style.transitionDelay = ''; }, 1600); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  $$('.bud').forEach(function (el) { bio ? bio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 9 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- petals drifting over the light, parting around the hand
  function petalSprite(c1, c2, size) {
    var cv = document.createElement('canvas'), w = size, h = size * 1.3; cv.width = w; cv.height = h;
    var c = cv.getContext('2d'), g = c.createRadialGradient(w * .42, h * .3, 1, w * .5, h * .5, h * .62);
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    c.fillStyle = g; c.beginPath();
    c.moveTo(w / 2, h * .98);
    c.bezierCurveTo(w * .02, h * .7, w * .02, h * .08, w * .38, h * .04);
    c.quadraticCurveTo(w * .5, h * .14, w * .62, h * .04);
    c.bezierCurveTo(w * .98, h * .08, w * .98, h * .7, w / 2, h * .98);
    c.fill();
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = Math.max(1, size / 30); c.beginPath(); c.moveTo(w / 2, h * .9); c.quadraticCurveTo(w * .46, h * .5, w * .5, h * .18); c.stroke();
    return cv;
  }
  var SPR = [petalSprite('#fde6ea', '#e59aac', 60), petalSprite('#fffaf6', '#ecc8c4', 60), petalSprite('#f6b9c6', '#c4607a', 60)];
  var drift = (function () {
    var cv = $('[data-drift]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = true, mx = -999, my = -999, last = 0;
    function seed() {
      var n = phone() ? 14 : 28; P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, s: 12 + Math.random() * 20, r: Math.random() * 6.28, vr: (Math.random() - .5) * 1.2, ph: Math.random() * 6.28, sp: .5 + Math.random() * .8, k: i % 3, vx: 0, vy: 0 });
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); seed(); draw(0); }
    function draw(T) {
      c.clearRect(0, 0, w, h);
      P.forEach(function (p) {
        var flip = Math.cos(T * p.sp * 1.6 + p.ph);
        c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.scale(1, .35 + .65 * Math.abs(flip));
        c.globalAlpha = .75; c.drawImage(SPR[p.k], -p.s / 2, -p.s * .65, p.s, p.s * 1.3); c.restore();
      });
    }
    function frame(t) {
      raf = 0; if (still() || !vis) { draw(t / 1000); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t; var T = t / 1000, dir = rtl() ? -1 : 1;
      P.forEach(function (p) {
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 16000) { var f = (16000 - d2) / 16000 * 260, d = Math.sqrt(d2) || 1; p.vx += dx / d * f * dt; p.vy += dy / d * f * dt; }
        p.vx *= .94; p.vy *= .94;
        p.x += (dir * 22 * p.sp + Math.sin(T * .8 + p.ph) * 18 + p.vx) * dt;
        p.y += (28 * p.sp + Math.cos(T * .6 + p.ph) * 8 + p.vy) * dt;
        p.r += p.vr * dt;
        if (p.y > h + 30) { p.y = -30; p.x = Math.random() * w; }
        if (p.x > w + 30) p.x = -30; if (p.x < -30) p.x = w + 30;
      });
      draw(T); raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- the flower of her photos: turns slowly, opens with the scroll, leans to the hand
  var flin = $('[data-flin]'), heart = $('[data-heart]'), shine = $('.shine', heart), fraf = 0, fvis = true, tx = 0, ty = 0, cx = 0, cy = 0, hasPtr = false, spin0 = 0, flast = 0;
  function flowerFrame(t) {
    fraf = 0;
    if (still()) { flin.style.transform = ''; flin.style.removeProperty('--spin'); flin.style.removeProperty('--open'); return; }
    var dt = flast ? Math.min(.05, (t - flast) / 1000) : .016; flast = t;
    spin0 += dt * 3 * (rtl() ? -1 : 1);
    var hr = hero.getBoundingClientRect(), sp = clamp(-hr.top / Math.max(1, hr.height), 0, 1);
    if (!hasPtr) { tx = Math.sin(t / 1600) * .5; ty = Math.cos(t / 2100) * .4; }
    cx = lerp(cx, tx, .08); cy = lerp(cy, ty, .08);
    flin.style.transform = 'rotateY(' + (cx * 12).toFixed(2) + 'deg) rotateX(' + (-cy * 10).toFixed(2) + 'deg)';
    flin.style.setProperty('--spin', (spin0 + sp * 50).toFixed(2) + 'deg');
    flin.style.setProperty('--open', (-6 - sp * 16).toFixed(2) + '%');
    shine.style.setProperty('--sx', (35 + cx * 30).toFixed(1) + '%'); shine.style.setProperty('--sy', (30 + cy * 30).toFixed(1) + '%');
    if (fvis) fraf = requestAnimationFrame(flowerFrame);
  }
  function flowerKick() { if (!fraf) { flast = 0; fraf = requestAnimationFrame(flowerFrame); } }
  hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; hasPtr = true; var r = $('[data-flower]').getBoundingClientRect(); tx = clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1); ty = clamp((e.clientY - r.top) / r.height * 2 - 1, -1, 1); });
  hero.addEventListener('pointerleave', function () { hasPtr = false; });
  watch(hero, function (v) { fvis = v; if (v) flowerKick(); });

  // ---------------------------------------------------------------- bloom: wide shrub → one cluster → the cluster opens onto her gel
  var bloom = $('[data-bloom]'), bwide = $('[data-bwide]'), bclose = $('[data-bclose]'), bnails = $('[data-bnails]'), bc1 = $('[data-bc1]'), bc2 = $('[data-bc2]'), tags = $$('.tag'), bstick = $('.b-stick'), veil = $('.b-veil');
  var bmx = 0, bmy = 0, bst = 0;
  bloom.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; bmx = e.clientX / innerWidth - .5; bmy = e.clientY / innerHeight - .5; tick(); });
  function placeTags() {
    var W = bstick.clientWidth, Hh = bstick.clientHeight, iw = 828, ih = 607, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s, ox = (W - dw) / 2, oy = (Hh - dh) / 2;
    tags.forEach(function (t) {
      var x = ox + dw * +getComputedStyle(t).getPropertyValue('--x'), y = oy + dh * +getComputedStyle(t).getPropertyValue('--y');
      t.style.left = x + 'px'; t.style.top = y + 'px';
      t.classList.toggle('flip', x > W - 190);
      t.hidden = x < 14 || x > W - 14 || y < 90 || y > Hh * (phone() ? .56 : .9) || (!phone() && y > Hh * .55 && (rtl() ? x > W * .4 : x < W * .6));
    });
  }
  function typeTag(t, on) {
    var sp = $('span', t), txt = t.dataset[he() ? 'he' : 'en'];
    if (on === t.classList.contains('on')) return;
    t.classList.toggle('on', on); clearInterval(t._t);
    if (!on) { sp.textContent = ''; return; }
    if (still()) { sp.textContent = txt; return; }
    var i = 0; sp.textContent = '';
    t._t = setInterval(function () { sp.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(t._t); }, 45);
  }
  tags.forEach(function (t) { t.addEventListener('click', function () { t._pin = !t.classList.contains('on'); typeTag(t, t._pin); }); });
  function bstage(n) {
    bst = n; bloom.dataset.stage = n;
    $$('[data-bgo]').forEach(function (b) { b.setAttribute('aria-current', +b.dataset.bgo === n ? 'true' : 'false'); });
    if (still()) tags.forEach(function (t) { typeTag(t, true); });
  }
  $$('[data-bgo]').forEach(function (b) { b.addEventListener('click', function () { bstage(+b.dataset.bgo); }); });
  $('[data-bprev]').addEventListener('click', function () { bstage((bst + 1) % 2); });
  $('[data-bnext]').addEventListener('click', function () { bstage((bst + 1) % 2); });
  function bloomUpdate() {
    if (still()) {
      [bwide, bclose, bc1, bc2].forEach(function (el) { el.style.transform = ''; el.style.opacity = ''; });
      bnails.style.removeProperty('--ms'); bnails.style.removeProperty('--ns'); bnails.classList.remove('full', 'show'); veil.style.removeProperty('--vt');
      return;
    }
    var r = bloom.getBoundingClientRect(), vh = innerHeight, p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1), enter = clamp(1 - r.top / vh, 0, 1);
    var push = smooth(p / .4), close = smooth((p - .3) / .1), m = smooth((p - .42) / .38), out1 = smooth((p - .27) / .08);
    bwide.style.transform = 'translate3d(' + (-bmx * 18).toFixed(1) + 'px,' + (-bmy * 14).toFixed(1) + 'px,0) scale(' + lerp(1.04, 1.7, push).toFixed(4) + ')';
    bclose.style.opacity = close.toFixed(3);
    bclose.style.transform = 'translate3d(' + (-bmx * 26).toFixed(1) + 'px,' + (-bmy * 20).toFixed(1) + 'px,0) scale(' + (lerp(1.3, 1.06, close) * lerp(1, 1.35, m)).toFixed(4) + ')';
    veil.style.setProperty('--vt', (1 - smooth(enter * 1.25)).toFixed(3));
    var W = bstick.clientWidth, Hh = bstick.clientHeight, diag = Math.sqrt(W * W + Hh * Hh);
    bnails.style.setProperty('--ms', (m * diag / .4).toFixed(1) + 'px');
    bnails.style.setProperty('--ns', lerp(1.4, 1, m).toFixed(4));
    bnails.classList.toggle('full', m >= .999);
    bc1.style.opacity = (1 - out1).toFixed(3); bc1.style.transform = 'translateY(' + (-out1 * 40).toFixed(1) + 'px)';
    var in2 = smooth((p - .8) / .1);
    bc2.style.opacity = in2.toFixed(3); bc2.style.transform = 'translateY(' + ((1 - in2) * 30).toFixed(1) + 'px)';
    bnails.classList.toggle('show', p > .82);
    tags.forEach(function (t, i) { if (!t._pin) typeTag(t, p > .84 + i * .04); });
  }

  // ---------------------------------------------------------------- treatments: living tiles, a spotlight under the hand
  var svc = $('[data-svc]');
  watch(svc, function (v) { svc.classList.toggle('on', v); });
  $$('.petal,.vt').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  // on touch the light visits each petal in turn
  var petals = $$('.petal'), lp = 0;
  setInterval(function () {
    if (still() || !svc.classList.contains('on') || matchMedia('(hover:hover)').matches) return;
    petals.forEach(function (p) { p.classList.remove('lit'); }); var p = petals[lp++ % petals.length]; p.style.setProperty('--mx', '50%'); p.style.setProperty('--my', '50%'); p.classList.add('lit');
  }, 1400);

  // ---------------------------------------------------------------- Vardia 8: the plate leans to the hand; odometers
  var place = $('[data-place]'), pf = $('[data-tilt]'), sheen = $('.sheen', pf);
  pf.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return; var r = pf.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    pf.style.transform = 'rotateY(' + (x * 10).toFixed(2) + 'deg) rotateX(' + (-y * 8).toFixed(2) + 'deg)';
    sheen.style.setProperty('--sx', (50 + x * 80) + '%'); sheen.style.setProperty('--sy', (50 + y * 80) + '%');
  });
  pf.addEventListener('pointerleave', function () { pf.style.transform = ''; });
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 150) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .4 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- the rating as one moran flower: five petals fill with pink, the last one to 80%
  var gp = $('[data-gpetals]'), gfills = [], RATE = 4.8;
  for (var gi = 0; gi < 5; gi++) {
    var g = document.createElementNS(NS, 'g'); g.setAttribute('transform', 'rotate(' + gi * 72 + ')');
    g.innerHTML = '<clipPath id="gc' + gi + '"><rect x="-20" width="40" y="-1" height="0"/></clipPath><ellipse class="pe" cy="-25" rx="16" ry="24"/><ellipse class="pf2" cy="-25" rx="16" ry="24" clip-path="url(#gc' + gi + ')"/>';
    gp.appendChild(g); gfills.push($('rect', g));
  }
  var gaugeDone = false;
  function gauge(instant) {
    gfills.forEach(function (r, i) {
      var f = clamp(RATE - i, 0, 1), hgt = 49 * f, apply = function () { r.setAttribute('y', (-1 - hgt).toFixed(2)); r.setAttribute('height', hgt.toFixed(2)); };
      if (instant || still()) { apply(); return; }
      setTimeout(function () {
        var t0 = performance.now();
        (function st(t) { var u = smooth((t - t0) / 700), hh = hgt * u; r.setAttribute('y', (-1 - hh).toFixed(2)); r.setAttribute('height', hh.toFixed(2)); if (u < 1) requestAnimationFrame(st); })(t0);
      }, i * 220);
    });
  }
  watch($('[data-gauge]'), function (v) { if (v && !gaugeDone) { gaugeDone = true; gauge(); } }, { threshold: .5 });
  if (still()) { gaugeDone = true; gauge(true); }

  // ---------------------------------------------------------------- book: choices grow a bouquet and write the message to Moran
  var trs = $$('[data-tr]'), times = $$('[data-time]'), dayBox = $('[data-days]'), stems = $('[data-stems]'), msgEl = $('[data-msg]'), sendBtn = $('[data-send]');
  var OPEN = [0, 2, 3, 4, 5], pickedDay = null, grpOn = [false, false, false];
  function firstDay() { var n = now(); for (var k = 0; k < 7; k++) { var d = (n.d + k) % 7; if (H[d] && (k > 0 || n.h < H[d][1] - .5)) return d; } return 0; }
  function days() {
    if (pickedDay === null) pickedDay = firstDay();
    dayBox.innerHTML = OPEN.map(function (d) { return '<button type="button" class="opt" role="radio" aria-checked="' + (d === pickedDay) + '" data-day="' + d + '">' + (he() ? dayHe[d] : dayEn[d]) + '</button>'; }).join('');
    $$('[data-day]', dayBox).forEach(function (b) { b.addEventListener('click', function () { pickedDay = +b.dataset.day; days(); lit(1); timesFor(); write(); }); });
  }
  function timesFor() {
    var fri = pickedDay === 5, pm = times[2];
    pm.disabled = fri;
    if (fri && pm.getAttribute('aria-checked') === 'true') { pm.setAttribute('aria-checked', 'false'); times[1].setAttribute('aria-checked', 'true'); }
  }
  function lit(i) { grpOn[i] = true; $$('[data-grp]').forEach(function (g) { g.classList.toggle('on', grpOn[+g.dataset.grp]); }); }
  trs.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); lit(0); bouquet(b.dataset.tr); write(); }); });
  times.forEach(function (b) { b.addEventListener('click', function () { if (b.disabled) return; times.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lit(2); write(); }); });
  // the bouquet: moran buds are always there; each chosen treatment opens one stem
  var FL = {
    gel: { d: 'M150 236 C 140 196, 118 168, 100 136', x: 100, y: 132, s: 54, fill: 'url(#gPink)', leaf: 'M132 186 C 112 180, 100 166, 98 152 C 116 156, 128 168, 132 186 Z' },
    mani: { d: 'M152 236 C 162 196, 186 160, 204 130', x: 204, y: 126, s: 48, fill: 'url(#gCream)', leaf: 'M170 178 C 190 176, 204 164, 208 150 C 190 152, 176 162, 170 178 Z' },
    french: { d: 'M150 238 C 148 186, 152 136, 150 96', x: 150, y: 92, s: 50, fill: 'url(#gCream)', leaf: 'M150 150 C 134 140, 128 124, 130 110 C 144 118, 150 132, 150 150 Z' },
    pedi: { d: 'M154 236 C 182 214, 212 192, 236 172', x: 236, y: 168, s: 52, fill: 'url(#gRose)', leaf: 'M196 200 C 214 204, 230 198, 238 186 C 220 182, 204 188, 196 200 Z' }
  };
  function bloomSVG(f) { return '<use href="#i-bloom" x="' + (f.x - f.s / 2) + '" y="' + (f.y - f.s / 2) + '" width="' + f.s + '" height="' + f.s + '" style="fill:' + f.fill + '"/>'; }
  function cluster(cx, cy, n, r, open) {
    var b = '', k;
    for (k = 0; k < n; k++) { var a = k * 2.4, d = r * Math.sqrt((k + .5) / n), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .7; b += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (3.2 + (k % 3) * .8) + '" fill="url(#gPink)"/>'; }
    for (k = 0; k < open; k++) { var a2 = k * 2.1 + 1, x2 = cx + Math.cos(a2) * r * .55, y2 = cy + Math.sin(a2) * r * .4; b += '<use href="#i-bloom" x="' + (x2 - 7).toFixed(1) + '" y="' + (y2 - 7).toFixed(1) + '" width="14" height="14" style="fill:url(#gCream)"/>'; }
    return b;
  }
  function buds() {
    var st = '#7d4a3e', b = '';
    [['M150 240 C 130 190, 96 150, 70 96', 'M104 168 C 84 166, 70 154, 66 140 C 84 142, 98 152, 104 168 Z', 'M88 128 C 104 118, 108 104, 104 92 C 92 102, 86 114, 88 128 Z', 70, 90],
     ['M150 240 C 172 196, 206 150, 236 104', 'M196 166 C 214 168, 230 158, 236 144 C 218 142, 202 150, 196 166 Z', 'M222 130 C 206 118, 204 104, 208 92 C 220 102, 224 116, 222 130 Z', 236, 98],
     ['M150 240 C 146 180, 156 110, 146 36', 'M150 120 C 166 110, 172 94, 170 80 C 156 88, 150 104, 150 120 Z', 'M148 176 C 132 168, 124 152, 126 138 C 140 146, 148 160, 148 176 Z', 146, 34]
    ].forEach(function (br) { b += '<path d="' + br[0] + '" stroke="' + st + '" stroke-width="3" fill="none"/><path d="' + br[1] + '" fill="url(#gLeaf)"/><path d="' + br[2] + '" fill="url(#gLeaf)"/>' + cluster(br[3], br[4], 13, 20, 2); });
    return '<g>' + b + '</g>';
  }
  function bouquet(fresh) {
    var html = buds();
    trs.forEach(function (b) {
      if (b.getAttribute('aria-pressed') !== 'true') return; var f = FL[b.dataset.tr];
      html += '<g class="fl' + (b.dataset.tr === fresh ? ' new' : '') + '"><path d="' + f.d + '" stroke="#7d4a3e" stroke-width="3" fill="none"/><path d="' + f.leaf + '" fill="url(#gLeaf)"/>' + bloomSVG(f) + '</g>';
    });
    stems.innerHTML = html;
  }
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = trs.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.dataset[l ? 'he' : 'en']; });
    var t = times.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0] || times[0], tt = t.dataset[l ? 'he' : 'en'];
    return l ? 'היי מורן, אשמח לקבוע תור ' + (picked.length ? list(picked, true) : 'לטיפול') + ' ביום ' + dayHe[pickedDay] + ' ' + tt + '. תודה!'
             : 'Hi Moran, I’d like to book ' + (picked.length ? list(picked, false) : 'a treatment') + ' on ' + dayEn[pickedDay] + ' ' + tt + '. Thanks!';
  }
  var shown = '', typing = 0, chatSeen = false;
  function write(instant) {
    var target = compose();
    sendBtn.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
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
  sendBtn.addEventListener('pointerenter', function () { lit(2); });
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; if (!still()) { shown = ''; msgEl.textContent = ''; } write(); } }, { threshold: .5 });

  // ---------------------------------------------------------------- footer: petals gather into the name, scatter under the hand
  var fname = (function () {
    var foot = $('[data-foot]'), cv = $('[data-fname]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = false, mx = -999, my = -999;
    function build() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; if (!w || !h) return;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var txt = he() ? 'מורן לוי' : 'Moran Levi', sc = document.createElement('canvas'), sx = sc.getContext('2d');
      sc.width = w; sc.height = h; var fs = h * .9;
      sx.font = '600 ' + fs + 'px "Cormorant Garamond","Noto Serif Hebrew",serif';
      var tw = sx.measureText(txt).width; if (tw > w * .94) { fs *= w * .94 / tw; sx.font = '600 ' + fs + 'px "Cormorant Garamond","Noto Serif Hebrew",serif'; }
      sx.textAlign = 'center'; sx.textBaseline = 'middle'; sx.direction = he() ? 'rtl' : 'ltr'; sx.fillStyle = '#000'; sx.fillText(txt, w / 2, h * .54);
      var d = sx.getImageData(0, 0, w, h).data, gap = phone() ? 4 : 5, old = P; P = [];
      for (var y = 0; y < h; y += gap) for (var x = 0; x < w; x += gap) if (d[(y * w + x) * 4 + 3] > 128) {
        var o = old[P.length]; P.push({ hx: x, hy: y, x: o ? o.x : Math.random() * w, y: o ? o.y : -Math.random() * h, r: Math.random() * 6.28, k: Math.floor(Math.random() * 3), s: gap * (1.3 + Math.random() * .7), vx: 0, vy: 0 });
      }
      if (still()) P.forEach(function (p) { p.x = p.hx; p.y = p.hy; });
      draw();
    }
    function draw() { c.clearRect(0, 0, w, h); P.forEach(function (p) { c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.drawImage(SPR[p.k], -p.s / 2, -p.s * .65, p.s, p.s * 1.3); c.restore(); }); }
    function frame() {
      raf = 0; if (still()) { P.forEach(function (p) { p.x = p.hx; p.y = p.hy; }); draw(); return; }
      var r = foot.getBoundingClientRect(), g = smooth((innerHeight - r.top) / (Math.min(r.height, innerHeight) * .8));
      P.forEach(function (p, i) {
        var tx = lerp(p.hx + ((i * 37) % 200 - 100), p.hx, g), ty = lerp(p.hy - h * (.6 + (i % 7) / 7), p.hy, g);
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 3600) { var f = (3600 - d2) / 3600 * 3, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
        p.vx += (tx - p.x) * .05; p.vy += (ty - p.y) * .05; p.vx *= .82; p.vy *= .82; p.x += p.vx; p.y += p.vy; p.r += .01;
      });
      draw(); if (vis) raf = requestAnimationFrame(frame);
    }
    cv.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    cv.addEventListener('pointerleave', function () { mx = my = -999; });
    cv.addEventListener('pointerdown', function (e) { var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; P.forEach(function (p) { var dx = p.x - x, dy = p.y - y, d = Math.sqrt(dx * dx + dy * dy) || 1; if (d < 140) { p.vx += dx / d * 14; p.vy += dy / d * 14; } }); kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    watch(foot, function (v) { vis = v; kick(); });
    return { build: build, kick: kick };
  })();

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false, scallop = $('.scallop');
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // the scallop edge rises out of the hero into the bloom
    scallop.style.setProperty('--sc', calm ? '0px' : (-clamp(scrollY / vh, 0, 1) * 40).toFixed(1) + 'px');
    bloomUpdate();
    // the Vardia card lands over the treatments
    if (!calm) { var pr = place.getBoundingClientRect(), e = smooth((vh - pr.top) / (vh * .85)); place.style.transform = 'translateY(' + ((1 - e) * 60).toFixed(1) + 'px) scale(' + lerp(.92, 1, e).toFixed(4) + ')'; }
    else place.style.transform = '';
  }

  function layout() { drift.size(); placeTags(); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); if (innerWidth !== lw) { lw = innerWidth; fname.build(); } }, 140); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); days(); timesFor(); bouquet(); write(true); bstage(0); layout();
  var once = false, go = function () {
    if (once) return; once = true;
    requestAnimationFrame(function () { hero.classList.add('ready'); setTimeout(function () { hero.classList.add('dealt'); }, 1300); drift.kick(); flowerKick(); fname.build(); });
  };
  if (still()) hero.classList.add('ready', 'dealt');
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { placeTags(); fname.build(); tick(); });
})();
