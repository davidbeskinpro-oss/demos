(function () {
  var root = document.documentElement, PHONE = '972523319055', MAIL = 'takearestcl@gmail.com';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var eout = function (t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  var TITLE = { he: 'חלי לוי · לדעת לגעת · רפלקסולוגיה ועיסוי לנשים · הגליל 138, חיפה', en: 'Chelli Levi · Reflexology & massage for women · 138 HaGalil St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור חלי לוי · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Chelli Levi · This is not the business’s official website' };
  var ZONES = {
    head: { he: 'ראש', en: 'head', lhe: 'במפה, אצבעות הרגליים משויכות לראש.', len: 'On the map, the toes correspond to the head.' },
    neck: { he: 'צוואר וכתפיים', en: 'neck & shoulders', lhe: 'בסיס האצבעות משויך לצוואר ולכתפיים.', len: 'The base of the toes corresponds to the neck and shoulders.' },
    chest: { he: 'חזה ונשימה', en: 'chest & breath', lhe: 'כרית כף הרגל משויכת לחזה ולנשימה.', len: 'The ball of the foot corresponds to the chest and breathing.' },
    gut: { he: 'עיכול', en: 'digestion', lhe: 'קשת כף הרגל משויכת למערכת העיכול.', len: 'The arch corresponds to digestion.' },
    spine: { he: 'גב ועמוד השדרה', en: 'back & spine', lhe: 'הצד הפנימי של כף הרגל משויך לעמוד השדרה ולגב.', len: 'The inner edge of the foot corresponds to the spine and back.' },
    heel: { he: 'אגן ועקב', en: 'pelvis & heel', lhe: 'העקב משויך לאגן ולגב התחתון, ושם גם יושב הדורבן.', len: 'The heel corresponds to the pelvis and lower back, and it is where a heel spur sits.' }
  };
  var ORDER = ['head', 'neck', 'chest', 'gut', 'spine', 'heel'];

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { if (i.alt !== '' || i.closest('.card.main') || i.dataset.altHe) i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'חלי לוי, לדעת לגעת', 'Chelli Levi, Lada’at Laga’at');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-deck]', 'תמונות של חלי והקליניקה', 'Photos of Chelli and the clinic');
    aria('[data-t-foot]', 'מפת כף הרגל', 'Map of the foot');
    aria('[data-t-wa],[data-t-wa2],[data-t-wa3]', 'וואטסאפ לחלי', 'WhatsApp Chelli');
    aria('[data-t-call]', 'התקשרו לחלי, 052-331-9055', 'Call Chelli, 052-331-9055');
    aria('[data-set-lang]', 'English', 'עברית');
    $('[data-t-map]').title = l === 'he' ? 'מפה: הגליל 138, חיפה' : 'Map: 138 HaGalil St, Haifa';
    $('[data-name]').placeholder = l === 'he' ? 'למשל: מיכל' : 'e.g. Michal';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('cl-lang', l); } catch (e) {}
    texts(l); card(); zline(lastZone); placeTags(); fitDrift();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) {
    b.addEventListener('click', function () {
      var on = still();
      root.classList.toggle('still', !on); delete root.dataset.motionAuto;
      try { localStorage.setItem('cl-motion', on ? 'on' : 'off'); } catch (e) {}
      motionUI(); onMotionChange();
    });
  });
  motionUI();

  // ---------------------------------------------------------------- nav: pill + chapter colour
  var nav = $('[data-nav]'), navIn = $('.nav-in', nav);
  var TONES = { night: ['#24102a', '#f4ebe3'], lav: ['#b9a3d3', '#2a0f33'], sage: ['#1e3a32', '#f4ebe3'], amber: ['#1b120e', '#f6e6d2'], blush: ['#dcaca7', '#2a0f33'], plum: ['#5c226f', '#f4ebe3'], sage2: ['#2c5a4c', '#f4ebe3'], lav2: ['#cfc0e2', '#2a0f33'] };
  var chapters = $$('[data-tone]');
  var curTone = '';
  function navTone() {
    var y = 40, t = 'night';
    for (var i = 0; i < chapters.length; i++) { var r = chapters[i].getBoundingClientRect(); if (r.top <= y && r.bottom > y) { t = chapters[i].dataset.tone; break; } }
    if (t !== curTone) { curTone = t; navIn.style.setProperty('--navbg', TONES[t][0]); navIn.style.setProperty('--navink', TONES[t][1]); }
    nav.classList.toggle('pill', scrollY > 60);
  }

  // ---------------------------------------------------------------- entrances
  $$('.rv').forEach(function (el, i) {
    watch(el, function (v) { if (v) el.classList.add('in'); }, { rootMargin: '0px 0px -8% 0px' });
  });
  // stagger rows inside lists
  $$('.rows .row, .tiles .tile').forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 70 + 'ms'; });
  var spread = $('[data-spread]');
  watch(spread, function (v) { if (v) spread.classList.add('in'); }, { threshold: .3 });

  // ---------------------------------------------------------------- opening: her photos are dealt, the last becomes the hero
  (function deal() {
    if (still() || !document.body.animate) return;
    var cards = $$('.deck .card, .deck .logo-tile');
    cards.forEach(function (c, i) {
      var final = getComputedStyle(c).transform; if (final === 'none') final = 'none';
      var deck = c.parentNode.getBoundingClientRect(), r = c.getBoundingClientRect();
      var dx = deck.left + deck.width / 2 - (r.left + r.width / 2), dy = deck.top + deck.height * .55 - (r.top + r.height / 2);
      c.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + (i % 2 ? 9 : -9) + 'deg) scale(.55)', opacity: 0 }, { transform: final, opacity: 1 }],
        { duration: 820, delay: 120 + i * 110, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' });
    });
    var copy = $$('.hero-copy > *');
    copy.forEach(function (el, i) { el.animate([{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 40 + i * 80, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' }); });
  })();

  // ---------------------------------------------------------------- particles: the logo's heart, then the sole of the foot
  var cv = $('[data-morph]'), ctx = cv.getContext('2d'), spot = $('[data-heart-spot]'), hero = $('.hero'), mapSec = $('#map'), footSvg = $('[data-foot]');
  var P = [], N = 0, cw = 0, ch = 0, mouse = { x: -9999, y: -9999 };
  function sizeCanvas() { cw = innerWidth; ch = innerHeight; cv.width = cw * DPR; cv.height = ch * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }
  function footTargets(n) {
    var shapes = $$('.sole, .toes ellipse, .lines path', footSvg), lens = shapes.map(function (s) { return s.getTotalLength(); });
    var total = lens.reduce(function (a, b) { return a + b; }, 0), pts = [];
    shapes.forEach(function (s, k) {
      var m = Math.round(n * lens[k] / total), t = s.getAttribute('transform'), ang = 0, cx = 0, cy = 0;
      if (t) { var mm = t.match(/rotate\(([-\d.]+) ([\d.]+) ([\d.]+)\)/); if (mm) { ang = +mm[1] * Math.PI / 180; cx = +mm[2]; cy = +mm[3]; } }
      for (var i = 0; i < m; i++) {
        var p = s.getPointAtLength(lens[k] * i / m), x = p.x, y = p.y;
        if (ang) { var dx = x - cx, dy = y - cy; x = cx + dx * Math.cos(ang) - dy * Math.sin(ang); y = cy + dx * Math.sin(ang) + dy * Math.cos(ang); }
        pts.push([x, y]);
      }
    });
    while (pts.length < n) pts.push(pts[Math.floor(Math.random() * pts.length)]);
    return pts.slice(0, n);
  }
  function buildParticles() {
    var H = window.HEART || [];
    N = phone() ? 420 : 640;
    var ft = footTargets(N);
    P = [];
    for (var i = 0; i < N; i++) {
      var h = H[Math.floor(Math.random() * H.length)] || [0, 0];
      P.push({ hx: h[0] + (Math.random() - .5) * .012, hy: h[1] + (Math.random() - .5) * .012, fx: ft[i][0], fy: ft[i][1], d: Math.random(), ox: 0, oy: 0, vx: 0, vy: 0, ph: Math.random() * 6.28, r: .7 + Math.random() * .9, bend: (Math.random() - .5) * 2 });
    }
    // loose dust around the hero
    for (var j = 0; j < (phone() ? 50 : 110); j++) P.push({ dust: 1, x: Math.random(), y: Math.random(), s: .2 + Math.random() * .8, ph: Math.random() * 6.28, r: .6 + Math.random() * 1.4, ox: 0, oy: 0, vx: 0, vy: 0 });
  }
  var morphOn = false, mraf = 0, t0 = performance.now();
  function morphProgress() { var r = mapSec.getBoundingClientRect(); return clamp((innerHeight - r.top) / (innerHeight * .78), 0, 1); }
  function footShow(v) { footSvg.classList.toggle('pre', !v); }
  function drawMorph(now) {
    mraf = 0;
    if (still()) { cv.style.display = 'none'; footShow(true); return; }
    var T = (now - t0) / 1000, p = morphProgress(), hr = hero.getBoundingClientRect(), mr = mapSec.getBoundingClientRect();
    var visible = hr.bottom > -50 || (mr.top < innerHeight && mr.bottom > 0 && p < 1);
    ctx.clearRect(0, 0, cw, ch);
    var land = p >= .995;
    footShow(land || p <= 0);
    if (!visible || land) { cv.style.opacity = '0'; return; }
    cv.style.opacity = '1';
    var s = spot.getBoundingClientRect(), hs = s.width, hcx = s.left + s.width / 2, hcy = s.top + s.height / 2;
    var fb = footSvg.getBoundingClientRect(), vb = footSvg.viewBox.baseVal, k = fb.width / vb.width;
    var beat = 1 + .045 * Math.sin(T * 2.2) * Math.max(0, Math.sin(T * 1.1));
    var colA = [240, 217, 255], colB = [92, 34, 111];
    for (var i = 0; i < P.length; i++) {
      var q = P[i], x, y, a;
      if (q.dust) {
        x = (q.x * cw + Math.sin(T * .2 * q.s + q.ph) * 30); y = ((q.y - T * .012 * q.s) % 1 + 1) % 1 * hr.height + hr.top;
        a = .35 * (1 - p) * (.5 + .5 * Math.sin(T + q.ph));
      } else {
        var e = smooth((p - q.d * .25) / .75);
        var hx = hcx + q.hx * hs * beat + Math.sin(T * 1.3 + q.ph) * .7, hy = hcy + q.hy * hs * beat + Math.cos(T * 1.1 + q.ph) * .7;
        var fx = fb.left + (q.fx - vb.x) * k, fy = fb.top + (q.fy - vb.y) * k;
        x = lerp(hx, fx, e) + Math.sin(e * Math.PI) * q.bend * 90; y = lerp(hy, fy, e);
        a = .9;
      }
      // the hand parts the dust
      var dx = x + q.ox - mouse.x, dy = y + q.oy - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 9000) { var f = (9000 - d2) / 9000 * 1.6, dd = Math.sqrt(d2) || 1; q.vx += dx / dd * f; q.vy += dy / dd * f; }
      q.vx += -q.ox * .06; q.vy += -q.oy * .06; q.vx *= .82; q.vy *= .82; q.ox += q.vx; q.oy += q.vy;
      var cmix = q.dust ? 0 : smooth((p - .35) / .5);
      ctx.fillStyle = 'rgba(' + Math.round(lerp(colA[0], colB[0], cmix)) + ',' + Math.round(lerp(colA[1], colB[1], cmix)) + ',' + Math.round(lerp(colA[2], colB[2], cmix)) + ',' + a + ')';
      ctx.beginPath(); ctx.arc(x + q.ox, y + q.oy, q.dust ? q.r : q.r * (1 + .3 * p), 0, 6.283); ctx.fill();
    }
    if (morphOn) mraf = requestAnimationFrame(drawMorph);
  }
  function startMorph() { if (!mraf) mraf = requestAnimationFrame(drawMorph); }
  addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') { mouse.x = e.clientX; mouse.y = e.clientY; } }, { passive: true });
  addEventListener('pointerdown', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; setTimeout(function () { mouse.x = mouse.y = -9999; }, 500); }, { passive: true });

  // ---------------------------------------------------------------- the map: zones, chips, the treatment card
  var sel = {}, lastZone = null;
  var zl = $('[data-zline]');
  function zline(z) { zl.textContent = z ? ZONES[z][he() ? 'lhe' : 'len'] : (he() ? 'געי באזור במפה או ברשימה.' : 'Tap an area on the map or in the list.'); }
  function setZone(z, on, ev) {
    if (on) sel[z] = 1; else delete sel[z];
    $$('.z[data-z="' + z + '"]', footSvg).forEach(function (p) { p.classList.toggle('on', on); });
    $$('.lab[data-z="' + z + '"]').forEach(function (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    $$('.ld[data-ld="' + z + '"]', footSvg).forEach(function (g) { g.classList.toggle('on', on); });
    $$('.z[data-z="' + z + '"]', footSvg).forEach(function (p) { if (on) p.setAttribute('filter', 'url(#zglow)'); else p.removeAttribute('filter'); });
    lastZone = on ? z : (Object.keys(sel).pop() || null); zline(lastZone); card(true);
    if (on && ev && !still()) ripple(ev);
  }
  function ripple(ev) {
    var pt = footSvg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    var m = footSvg.getScreenCTM(); if (!m) return; var sp = pt.matrixTransform(m.inverse());
    var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', sp.x); c.setAttribute('cy', sp.y); c.setAttribute('r', 10);
    c.setAttribute('fill', 'none'); c.setAttribute('stroke', '#5c226f'); c.setAttribute('stroke-width', '2');
    c.style.transformOrigin = sp.x + 'px ' + sp.y + 'px'; c.style.transformBox = 'view-box';
    $('.zones', footSvg).appendChild(c);
    var a = c.animate([{ transform: 'scale(.3)', opacity: .9 }, { transform: 'scale(5)', opacity: 0 }], { duration: 700, easing: 'cubic-bezier(.23,1,.32,1)' });
    a.onfinish = function () { c.remove(); };
  }
  $$('.z', footSvg).forEach(function (p) { p.addEventListener('click', function (e) { var z = p.dataset.z; setZone(z, !sel[z], e); }); });
  $$('.lab').forEach(function (b) { b.addEventListener('click', function (e) { var z = b.dataset.z; setZone(z, !sel[z], null); }); });

  var nameIn = $('[data-name]'), preg = $('[data-preg]'), tcard = $('[data-tcard]');
  function card(bump) {
    var name = (nameIn.value || '').trim().replace(/\s+/g, ' ');
    $('[data-tname]').textContent = he() ? (name || 'שלך') : (name ? name + '’s' : 'Your');
    var zs = ORDER.filter(function (z) { return sel[z]; }).map(function (z) { return ZONES[z][he() ? 'he' : 'en']; });
    $('[data-tzones]').textContent = zs.length ? zs.join(he() ? ', ' : ', ') : (he() ? 'עדיין לא נבחר אזור' : 'no area chosen yet');
    var msg;
    if (he()) msg = 'היי חלי' + (name ? ', כאן ' + name : '') + '. הגעתי מהאתר.' + (zs.length ? ' האזורים שמבקשים מגע: ' + zs.join(', ') + '.' : '') + (preg.checked ? ' אני בהריון.' : '') + ' אשמח לתאם טיפול.';
    else msg = 'Hi Chelli' + (name ? ', this is ' + name : '') + '. I found you on the website.' + (zs.length ? ' The areas asking for touch: ' + zs.join(', ') + '.' : '') + (preg.checked ? ' I am pregnant.' : '') + ' I would like to book a treatment.';
    $('[data-send-wa]').href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg);
    $('[data-send-mail]').href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(he() ? 'תיאום טיפול' + (name ? ' · ' + name : '') : 'Booking a treatment' + (name ? ' · ' + name : '')) + '&body=' + encodeURIComponent(msg);
    var hm = he() ? 'היי חלי, הגעתי מהאתר ואשמח לתאם טיפול.' : 'Hi Chelli, I found you on the website and would like to book a treatment.';
    $$('[data-wa-main],[data-t-wa],[data-t-wa2],[data-t-wa3]').forEach(function (a) { a.href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(hm); });
    $('[data-gift-wa]').href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(he() ? 'היי חלי, אשמח להזמין שובר מתנה.' : 'Hi Chelli, I would like to order a gift voucher.');
    if (bump && !still() && tcard.animate) tcard.animate([{ transform: 'none' }, { transform: 'translateY(-4px) rotate(-.5deg)' }, { transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.23,1,.32,1)' });
  }
  nameIn.addEventListener('input', function () { card(false); });
  preg.addEventListener('change', function () { card(true); });
  tcard.addEventListener('submit', function (e) { e.preventDefault(); });

  // ---------------------------------------------------------------- her stipple drawings gather out of drifting dots
  var drawings = $$('[data-dots]').map(function (box) {
    var D = (window.DOTS || {})[box.dataset.dots], c = $('canvas', box), g = c.getContext('2d');
    var o = { box: box, c: c, g: g, D: D, born: 0, vis: false, pts: [], m: { x: -999, y: -999 } };
    if (D) for (var i = 0; i < D.p.length; i += 3) o.pts.push({ x: D.p[i], y: D.p[i + 1], v: D.p[i + 2], sx: (Math.random() - .5) * 2, sy: (Math.random() - .5) * 2, d: Math.random(), ox: 0, oy: 0, vx: 0, vy: 0, ph: Math.random() * 6.28 });
    box.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); o.m.x = e.clientX - r.left; o.m.y = e.clientY - r.top; if (!still() && o.solid) { o.touch = true; box.classList.add('touch'); startDots(); } });
    box.addEventListener('pointerleave', function () { o.m.x = o.m.y = -999; o.touch = false; box.classList.remove('touch'); });
    box.addEventListener('pointerdown', function (e) { var r = c.getBoundingClientRect(); o.m.x = e.clientX - r.left; o.m.y = e.clientY - r.top; if (!still() && o.solid) { o.touch = true; box.classList.add('touch'); startDots(); } setTimeout(function () { o.m.x = o.m.y = -999; if (e.pointerType !== 'mouse') { o.touch = false; box.classList.remove('touch'); } }, 900); });
    watch(box, function (v) { o.vis = v; if (v && !o.born && !still() && innerHeight < 2000) { o.born = performance.now(); box.classList.add('gather'); setTimeout(function () { o.solid = true; box.classList.add('solid'); setTimeout(function () { if (!o.touch && o.w) o.g.clearRect(0, 0, o.w, o.h); }, 1300); }, 1500); } if (v) startDots(); }, { rootMargin: '0px' });
    return o;
  });
  function sizeDrawings() { drawings.forEach(function (o) { var r = o.box.getBoundingClientRect(); o.w = r.width; o.h = r.height; o.c.width = o.w * DPR; o.c.height = o.h * DPR; o.g.setTransform(DPR, 0, 0, DPR, 0, 0); }); }
  function paintDrawing(o, now, calm) {
    var g = o.g, D = o.D; if (!D || !o.w) return;
    var sc = Math.max(o.w / D.w, o.h / D.h), ox = (o.w - D.w * sc) / 2, oy = (o.h - D.h * sc) / 2;
    var age = calm || !o.born ? 99 : (now - o.born) / 1000, T = now / 1000;
    if (!calm && o.born && !o.solid && age > 1.5) { o.solid = true; o.box.classList.add('solid'); }
    var fade = calm ? 0 : o.touch ? 1 : o.born ? clamp((2.6 - age) / 1.1, 0, 1) : 0;
    if (fade <= 0) { if (!o.drawnEmpty) { g.clearRect(0, 0, o.w, o.h); o.drawnEmpty = true; } return; }
    o.drawnEmpty = false;
    g.clearRect(0, 0, o.w, o.h);
    g.fillStyle = '#dcb47e';
    for (var i = 0; i < o.pts.length; i++) {
      var q = o.pts[i], e = eout((age - q.d * .6) / 1.3);
      var tx = ox + q.x * sc, ty = oy + q.y * sc;
      var x = lerp(tx + q.sx * o.w * .6, tx, e), y = lerp(ty + q.sy * o.h * .6, ty, e);
      if (!calm) {
        x += Math.sin(T * .9 + q.ph) * .5; y += Math.cos(T * .8 + q.ph) * .5;
        var dx = x + q.ox - o.m.x, dy = y + q.oy - o.m.y, d2 = dx * dx + dy * dy;
        if (d2 < 2200) { var f = (2200 - d2) / 2200 * 1.4, dd = Math.sqrt(d2) || 1; q.vx += dx / dd * f; q.vy += dy / dd * f; }
        q.vx += -q.ox * .07; q.vy += -q.oy * .07; q.vx *= .8; q.vy *= .8; q.ox += q.vx; q.oy += q.vy;
        x += q.ox; y += q.oy;
      }
      g.globalAlpha = (.38 + q.v * .065) * (.35 + .65 * clamp(e * 1.4, 0, 1)) * fade;
      g.fillRect(x, y, sc * .85, sc * .85);
    }
    g.globalAlpha = 1;
  }
  var draf = 0;
  function dotsLoop(now) {
    draf = 0; var any = false;
    drawings.forEach(function (o) { if (o.vis) { paintDrawing(o, now, still()); if (o.touch || (o.born && (now - o.born) < 2700)) any = true; } });
    if (any && !still()) draf = requestAnimationFrame(dotsLoop);
  }
  function startDots() { if (!draf) draf = requestAnimationFrame(dotsLoop); }

  // ---------------------------------------------------------------- the room: a frame grows into the room, a lamp-light follows the hand
  var room = $('[data-room]'), frame = $('[data-room-frame]'), tags = $$('.tag', room);
  var TAGPOS = [[0.40, 0.40], [0.70, 0.52], [0.64, 0.27]]; // salt lamp, table, shelf (fractions of the photo)
  var light = { x: .41, y: .45, tx: .41, ty: .45 }, roomVis = false, rraf = 0, scrambled = false;
  function coverMap(fx, fy) {
    var W = frame.clientWidth, H = frame.clientHeight, iw = 1100, ih = 1467, s = Math.max(W / iw, H / ih);
    var dw = iw * s, dh = ih * s, ox = (W - dw) * .5, oy = (H - dh) * .45;
    return [ox + fx * dw, oy + fy * dh];
  }
  function placeTags() {
    tags.forEach(function (t, i) {
      var p = coverMap(TAGPOS[i][0], TAGPOS[i][1]), W = frame.clientWidth, w = t.offsetWidth / 2 + 12;
      t.style.left = clamp(p[0], w, W - w) + 'px'; t.style.top = clamp(p[1], 96, frame.clientHeight - 40) + 'px';
    });
  }
  function roomTick() {
    rraf = 0;
    var r = room.getBoundingClientRect(), vh = innerHeight;
    var p = clamp((vh - r.top) / (vh + r.height), 0, 1), grow = still() ? 1 : smooth((vh - r.top) / Math.min(vh, r.height) * 1.08 - .04);
    if (!still()) {
      frame.style.setProperty('--ci', lerp(18, 0, grow) + '%');
      frame.style.setProperty('--cx', lerp(phone() ? 8 : 26, 0, grow) + '%');
      frame.style.setProperty('--cr', lerp(28, 0, grow) + 'px');
    }
    room.classList.toggle('tags-on', grow > .9 || still());
    if ((grow > .9 || still()) && !scrambled) { scrambled = true; scrambleAll(); }
    // lamp-light: follows the pointer on desktop, travels with the scroll on touch
    if (!fine || still()) {
      var a = p * Math.PI * 1.2;
      light.tx = still() ? .41 : .5 + .14 * Math.cos(a + 3.3); light.ty = still() ? .45 : .42 + .14 * Math.sin(a + 1.2);
    }
    light.x += (light.tx - light.x) * (still() ? 1 : .12); light.y += (light.ty - light.y) * (still() ? 1 : .12);
    var lp = coverMap(light.x, light.y);
    frame.style.setProperty('--lx', lp[0] + 'px'); frame.style.setProperty('--ly', lp[1] + 'px');
    if (roomVis && !still() && (Math.abs(light.tx - light.x) > .001 || Math.abs(light.ty - light.y) > .001)) rraf = requestAnimationFrame(roomTick);
  }
  frame.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || still()) return;
    var r = frame.getBoundingClientRect(), W = r.width, H = r.height, iw = 1100, ih = 1467, s = Math.max(W / iw, H / ih), dw = iw * s, dh = ih * s;
    light.tx = (e.clientX - r.left - (W - dw) * .5) / dw; light.ty = (e.clientY - r.top - (H - dh) * .45) / dh;
    if (!rraf) rraf = requestAnimationFrame(roomTick);
  });
  watch(room, function (v) { roomVis = v; if (v && !rraf) rraf = requestAnimationFrame(roomTick); });
  var GLYPHS = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'abcdefghijklmnopqrstuvwxyz' };
  function scrambleAll() {
    if (still()) return;
    $$('[data-scramble] > span').forEach(function (s) {
      var fin = s.textContent, L = s.lang === 'he' ? GLYPHS.he : GLYPHS.en, t0 = performance.now(), dur = 900;
      (function step(now) {
        var k = clamp((now - t0) / dur, 0, 1), n = Math.floor(fin.length * k), out = fin.slice(0, n);
        for (var i = n; i < fin.length; i++) out += fin[i] === ' ' ? ' ' : L[Math.floor(Math.random() * L.length)];
        s.textContent = out; if (k < 1) requestAnimationFrame(step); else s.textContent = fin;
      })(t0);
    });
  }

  // ---------------------------------------------------------------- reviews: the score rolls, the reviews drift
  $$('[data-odo]').forEach(function (b) {
    var fin = b.dataset.odo, dec = fin.indexOf('.') > -1, num = parseFloat(fin), done = false;
    watch(b, function (v) {
      if (!v || done) return; done = true; if (still()) return;
      var t0 = performance.now();
      (function step(now) { var k = eout((now - t0) / 1400); b.textContent = dec ? (num * k).toFixed(1) : Math.round(num * k); if (k < 1) requestAnimationFrame(step); else b.textContent = fin; })(t0);
    });
  });
  var drift = $('[data-drift]'), track = $('.drift-track', drift), dx = 0, half = 0, dvis = false, dhover = false, dlast = 0, rafD = 0;
  (function cloneSet() { $$('.rev', track).forEach(function (r) { var c = r.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.classList.add('clone'); track.appendChild(c); }); })();
  function fitDrift() { var rs = $$('.rev', track); half = rs.length ? (rs[rs.length / 2].offsetLeft - rs[0].offsetLeft) : 0; if (he()) half = Math.abs(half); }
  function driftTick(now) {
    rafD = 0; var dt = dlast ? Math.min(50, now - dlast) : 16; dlast = now;
    if (still()) { track.style.transform = ''; $$('.clone', track).forEach(function (c) { c.hidden = true; }); return; }
    $$('.clone', track).forEach(function (c) { c.hidden = false; });
    if (!dhover) dx += dt * .028;
    if (half) dx = dx % Math.abs(half);
    track.style.transform = 'translateX(' + (he() ? dx : -dx) + 'px)';
    if (dvis) rafD = requestAnimationFrame(driftTick);
  }
  drift.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') dhover = true; });
  drift.addEventListener('pointerleave', function () { dhover = false; });
  watch(drift, function (v) { dvis = v; dlast = 0; if (v && !rafD) rafD = requestAnimationFrame(driftTick); });

  // ---------------------------------------------------------------- the voucher leans toward the hand
  var tilt = $('[data-tilt]'), vimg = $('img', tilt);
  tilt.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || still()) return;
    var r = tilt.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    vimg.style.setProperty('--ty', (x * 12) + 'deg'); vimg.style.setProperty('--tx', (-y * 10) + 'deg');
  });
  tilt.addEventListener('pointerleave', function () { vimg.style.setProperty('--ty', '0deg'); vimg.style.setProperty('--tx', '0deg'); });
  function tiltScroll() {
    if (fine || still()) return;
    var r = tilt.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    var k = (r.top + r.height / 2) / innerHeight - .5;
    vimg.style.setProperty('--tx', (k * 14) + 'deg'); vimg.style.setProperty('--ty', (k * -8) + 'deg');
  }

  // ---------------------------------------------------------------- stones dock
  var stones = $('[data-stones]');
  function dock() { stones.classList.toggle('show', hero.getBoundingClientRect().bottom < innerHeight * .5); }

  // ---------------------------------------------------------------- wiring
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false; navTone(); dock(); tiltScroll();
      if (!still()) startMorph(); else footShow(true);
      if (roomVis && !rraf) rraf = requestAnimationFrame(roomTick);
    });
  }
  function layout() { sizeCanvas(); sizeDrawings(); placeTags(); fitDrift(); }
  function onMotionChange() {
    if (still()) {
      morphOn = false; footShow(true); cv.style.display = 'none';
      frame.style.removeProperty('--ci'); frame.style.removeProperty('--cx'); frame.style.removeProperty('--cr');
      $$('.rv').forEach(function (el) { el.classList.add('in'); }); spread.classList.add('in');
      drawings.forEach(function (o) { o.touch = false; o.box.classList.remove('gather', 'touch'); o.box.classList.add('solid'); if (o.w) o.g.clearRect(0, 0, o.w, o.h); });
      track.style.transform = ''; $$('.clone', track).forEach(function (c) { c.hidden = true; });
      roomTick();
    } else {
      cv.style.display = ''; morphOn = true; startMorph(); startDots(); fitDrift(); if (dvis && !rafD) rafD = requestAnimationFrame(driftTick); roomTick();
    }
  }
  addEventListener('scroll', onScroll, { passive: true });
  var rz = 0; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); buildParticles(); onScroll(); }, 120); });

  texts(root.lang === 'en' ? 'en' : 'he');
  zline(null); card(false);
  sizeCanvas(); sizeDrawings(); buildParticles();
  if (!still()) { morphOn = true; startMorph(); } else { cv.style.display = 'none'; footShow(true); }
  if (still()) { $$('.clone', track).forEach(function (c) { c.hidden = true; }); }
  navTone(); dock(); placeTags(); roomTick();
  addEventListener('load', function () { layout(); onScroll(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placeTags(); fitDrift(); });
})();
