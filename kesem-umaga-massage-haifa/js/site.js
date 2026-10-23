(function () {
  var root = document.documentElement, WA = '972509028400';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var eio = function (t) { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'קסם ומגע · עיסויים וטיפולים מכל העולם · אחד העם 3, חיפה', en: 'Kesem uMaga · massage and treatments from around the world · 3 Ahad Ha’am St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור קסם ומגע · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Kesem uMaga · This is not the business’s official website' };
  var STAR = '<svg viewBox="0 0 92 16" aria-hidden="true">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; }).join('') + '</svg>';
  $$('[data-stars]').forEach(function (s) { s.innerHTML = STAR; s.setAttribute('role', 'img'); });

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-stars]').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-pill]', 'ראשי', 'Main');
    aria('[data-motion-toggle]', 'אנימציות', 'Animations');
    aria('[data-stage]', 'קסם ומגע', 'Kesem uMaga');
    aria('[data-words-sec]', 'מתוך דבר המנהלת', 'From the manager’s words');
    aria('[data-t-call]', 'התקשרו לקסם ומגע, 050-902-8400', 'Call Kesem uMaga, 050-902-8400');
    aria('[data-t-wa]', 'וואטסאפ לקסם ומגע', 'WhatsApp Kesem uMaga');
    var nm = $('[name=nm]'); nm.placeholder = nm.dataset[l === 'he' ? 'phHe' : 'phEn'];
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('km-lang', l); } catch (e) {}
    texts(l); hours(); buildComposer(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(), keep = $('#house').getBoundingClientRect().top;
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('km-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    resetStage(); layout();
    if (!on) setK(cur); else sparksStart();
    if (keep < innerHeight) { var now = $('#house').getBoundingClientRect().top; if (now !== keep) scrollBy(0, now - keep); }
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [10, 22], 1: [10, 22], 2: [10, 22], 3: [10, 22], 4: [10, 22], 5: [10, 21], 6: [15.5, 22] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], shortEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'numeric', year: 'numeric', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, date: new Date(Date.UTC(+o.year, +o.month - 1, +o.day)) };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); }
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
      var two = r[1] - r[0] === 1;
      var label = r[0] === r[1] ? names[r[0]] : names[r[0]] + (two ? (l ? ' ו' : ' and ') : '–') + names[r[1]];
      var time = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + label + '</td><td>' + time + '</td></tr>';
    }).join('');
    status();
  }
  window.__status = status; window.__H = H; window.__hours = hours;
  setInterval(status, 60000);

  // ---------------------------------------------------------------- THE STAGE
  // Scroll units are screen heights from the top of the stage, both ways, every pass:
  //   0 – .3   the candle photo, sparks settled into the lotus of their logo
  //   .3 – .8  the circle closes in on the lotus's place (the photo itself stays put and covers the screen, so nothing shows)
  //   .8 – 1.3 the photo shrinks and slides into the window while the circle reaches it; the petals open around it.
  //            The photo is always scaled to cover the circle, so no ground ever shows inside the circle.
  //   1.3 –    six traditions, .65 each: the lotus turns one petal, the window crossfades to where that touch comes from.
  var stage = $('[data-stage]'), pin = $('[data-pin]'), hph = $('[data-hph]'), hbox = $('[data-hbox]'), hshade = $('[data-hshade]'), hcopy = $('[data-hcopy]'), hcap = $('[data-hcap]');
  var world = $('[data-world]'), lotus = $('[data-lotus]'), petals = $('[data-petals]'), win = $('[data-window]'), wimgs = $$('[data-w]'), wbs = $$('[data-wb]'), wbg = $('.wbg'), wts = $$('[data-wt]'), taps = $$('[data-taps] button'),
      fronts = $$('[data-front] use'), backs = $('[data-back]'), wpanel = $('[data-wpanel]'), wh = $('.w-h'), wmore = $('.w-more');
  var A0 = .3, A1 = .8, B1 = 1.3, SEG = .65, N = 6, HOLD = .32;
  var vw = 0, vh = 0, sTop = 0, G = {}, lastKey = '', cur = 0;
  function geo() {
    vw = root.clientWidth; vh = pin.clientHeight || innerHeight;
    var S, cx, cy;
    if (vw < 900) { S = Math.min(vw * .9, vh * .48); cx = vw / 2; cy = 74 + S / 2; }
    else { S = Math.min(vh * .78, vw * .42); cx = he() ? vw * .27 : vw * .73; cy = vh * .53; }
    var Bw = Math.max(vw, vh * 1600 / 918), Bh = Bw * 918 / 1600, r = S * .22;
    G = { S: S, cx: cx, cy: cy, r: r, Bw: Bw, Bh: Bh, Rmax: Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy)) + 2, R1: Math.min(r * 2.6, Math.min(Bh, Bw) * .45) };
  }
  function layout() {
    geo();
    stage.style.height = still() ? '' : ((B1 + N * SEG - .1 + HOLD + 1) * vh) + 'px';
    $('.anchor').style.top = ((B1 + .3) * vh) + 'px';
    wpanel.style.setProperty('--pt', (G.cy + G.S / 2 + 14) + 'px');
    if (!still()) { lotus.style.setProperty('--lx', G.cx + 'px'); lotus.style.setProperty('--ly', G.cy + 'px'); lotus.style.setProperty('--ls', G.S + 'px'); }
    else { lotus.style.removeProperty('--lx'); lotus.style.removeProperty('--ly'); lotus.style.removeProperty('--ls'); }
    sTop = stage.getBoundingClientRect().top + scrollY;
    // the tradition texts are stacked; the box takes the tallest of them in this language and width
    var box = $('.w-texts'); box.style.minHeight = '';
    if (!still()) box.style.minHeight = Math.max.apply(null, wts.map(function (t) { return t.scrollHeight; })) + 'px';
    lastKey = ''; sparksLayout(); tick();
  }
  function resetStage() {
    [hph, hbox, hshade, hcopy, hcap, petals, backs, win, wh, wmore, world, wbg].forEach(function (e) { e.style.clipPath = ''; e.style.transform = ''; e.style.opacity = ''; e.style.visibility = ''; });
    wimgs.concat(wts, wbs).forEach(function (e) { e.style.opacity = ''; e.style.transform = ''; e.style.visibility = ''; });
    fronts.forEach(function (f) { f.style.opacity = ''; });
    taps.forEach(function (t) { t.style.opacity = ''; });
    lotus.style.removeProperty('--R'); lastKey = '';
  }
  function mark(k) {
    if (k === cur && fronts[k].classList.contains('on')) return;
    cur = k;
    fronts.forEach(function (f, i) { f.classList.toggle('on', i === k); });
    taps.forEach(function (t, i) { t.classList.toggle('on', i === k); t.setAttribute('aria-pressed', i === k ? 'true' : 'false'); });
    wimgs.forEach(function (im, i) { im.classList.toggle('on', i === k); wbs[i].classList.toggle('on', i === k); });
    wts.forEach(function (t, i) { t.classList.toggle('on', i === k); });
  }
  function paint(s) {
    var G_ = G, a = smooth((s - A0) / (A1 - A0)), u = eio((s - A1) / (B1 - A1));
    // circle
    var R = s < A1 ? lerp(G_.Rmax, G_.R1, eio((s - A0) / (A1 - A0))) : lerp(G_.R1, G_.r, u);
    var pcx = lerp(vw / 2, G_.cx, u), pcy = lerp(vh / 2, G_.cy, u);
    var sEnd = G_.r * 2.5 / G_.Bh, need = 2.06 * Math.max((R + Math.abs(G_.cy - pcy)) / G_.Bh, (R + Math.abs(G_.cx - pcx)) / G_.Bw);
    var sc = s < A1 ? 1 : Math.max(lerp(1, sEnd, u), need);
    hph.style.clipPath = s <= A0 ? '' : 'circle(' + R.toFixed(1) + 'px at ' + G_.cx.toFixed(1) + 'px ' + G_.cy.toFixed(1) + 'px)';
    hbox.style.transform = 'translate(-50%,-50%) translate3d(' + (pcx - vw / 2).toFixed(1) + 'px,' + (pcy - vh / 2).toFixed(1) + 'px,0) scale(' + sc.toFixed(4) + ')';
    hshade.style.opacity = (1 - smooth((s - A1) / (B1 - A1) * 1.4)).toFixed(3);
    var co = 1 - smooth((s - .08) / .34);
    hcopy.style.opacity = co.toFixed(3); hcopy.style.transform = 'translate3d(0,' + (-30 * (1 - co)).toFixed(1) + 'px,0)';
    hcopy.style.visibility = co < .01 ? 'hidden' : '';
    hcap.style.opacity = (1 - smooth((s - .05) / .2)).toFixed(3);
    sparkAlpha = 1 - smooth((s - .12) / .5);
    var sl = $('.still-logo'); sl.style.setProperty('--slo', sparkAlpha.toFixed(3)); sl.style.setProperty('--slx', G_.cx + 'px'); sl.style.setProperty('--sly', G_.cy + 'px'); sl.style.setProperty('--ls', G_.S + 'px');
    // petals open around the window
    var po = smooth((u - .25) / .75);
    petals.style.opacity = po.toFixed(3);
    var f = (s - B1) / SEG, pos = clamp(f, 0, N - 1), k = Math.floor(pos), fr = pos - k, tt = k >= N - 1 ? 0 : smooth((fr - .62) / .38), P = k + tt;
    if (f >= N - 1) P = N - 1;
    var rot = -60 * P;
    lotus.style.setProperty('--R', rot.toFixed(2) + 'deg');
    petals.style.transform = 'rotate(' + rot.toFixed(2) + 'deg) scale(' + lerp(.55, 1, po).toFixed(4) + ')';
    backs.style.transform = 'rotate(' + (8 * (1 - po)).toFixed(2) + 'deg) scale(' + lerp(.8, 1, smooth((u - .4) / .6)).toFixed(4) + ')';
    backs.style.transformOrigin = '0 0';
    var a0 = smooth(f / .3), wo = smooth((u - .92) / .08);
    wbg.style.opacity = a0.toFixed(3);
    win.style.opacity = wo.toFixed(3);
    wimgs.forEach(function (im, i) {
      var o = clamp(1 - Math.abs(P - i), 0, 1) * (i === 0 ? a0 : 1);
      im.style.opacity = o.toFixed(3);
      im.style.visibility = o < .002 ? 'hidden' : '';
      im.style.transform = 'scale(' + lerp(1.14, 1, clamp((f - i + .5) / 1.6, 0, 1)).toFixed(4) + ')';
      var b = wbs[i]; b.style.opacity = (o * .6).toFixed(3); b.style.visibility = o < .002 ? 'hidden' : '';
      b.style.transform = 'scale(' + lerp(1.16, 1.04, clamp((f - i + .5) / 1.6, 0, 1)).toFixed(4) + ')';
    });
    var to = smooth((u - .7) / .3);
    wh.style.opacity = to.toFixed(3); wmore.style.opacity = to.toFixed(3);
    wts.forEach(function (t, i) {
      var o = clamp(1 - Math.abs(P - i) * 2.2, 0, 1) * (i === 0 ? smooth(f / .25) : 1);
      t.style.opacity = o.toFixed(3); t.style.visibility = o < .002 ? 'hidden' : '';
      t.style.transform = 'translate3d(0,' + ((P - i) * -18).toFixed(1) + 'px,0)';
    });
    var tapO = smooth((u - .85) / .15);
    taps.forEach(function (t) { t.style.opacity = tapO.toFixed(3); });
    world.classList.toggle('live', s > B1 - .1);
    world.style.visibility = s < A1 ? 'hidden' : '';
    mark(Math.round(P));
  }
  function setK(k) {
    k = (k + N) % N; mark(k);
    if (still()) { lotus.style.setProperty('--R', (-60 * k) + 'deg'); petals.style.transform = 'rotate(' + (-60 * k) + 'deg)'; }
  }
  function goK(k) {
    if (still()) { setK(k); return; }
    scrollTo({ top: sTop + (B1 + k * SEG + .3) * vh, behavior: 'smooth' });
  }
  taps.forEach(function (t) { t.addEventListener('click', function () { goK(+t.dataset.k); }); });
  $$('[data-step]').forEach(function (b) { b.addEventListener('click', function () { goK((cur + +b.dataset.step + N) % N); }); });
  $$('[data-go-world]').forEach(function (a) { a.addEventListener('click', function (e) {
    e.preventDefault();
    if (still()) world.scrollIntoView({ behavior: 'smooth', block: 'start' }); else goK(0);
  }); });

  // ---------------------------------------------------------------- sparks: the lotus of their logo, sampled from the real logo file
  var cv = $('[data-sparks]'), cx2 = cv.getContext('2d'), parts = [], pts = [], sparkAlpha = 1, sparkT0 = 0, rafS = 0, dpr = 1, ptr = { x: -999, y: -999, t: 0 };
  var logoImg = new Image();
  logoImg.onload = function () {
    var c = document.createElement('canvas'), W = 200; c.width = W; c.height = W;
    var x = c.getContext('2d'); x.drawImage(logoImg, 0, 0, W, W);
    var d; try { d = x.getImageData(0, 0, W, W).data; } catch (e) { root.classList.add('nosparks'); return; }
    for (var yy = 0; yy < W * .6; yy += 2) for (var xx = 0; xx < W; xx += 2) { if (d[(yy * W + xx) * 4 + 3] > 140) pts.push([xx / W - .5, yy / W - .31]); }
    sparksLayout(); sparksStart();
  };
  logoImg.src = 'img/logo.png';
  function sparksLayout() {
    if (!pts.length || still()) return;
    dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);
    var n = vw < 700 ? 700 : 1200, step = Math.max(1, pts.length / n), scale = G.S * 1.02;
    var flames = $$('.flame').map(function (f) { var r = f.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    var old = parts; parts = [];
    for (var i = 0; i < pts.length && parts.length < n; i += step) {
      var p = pts[Math.floor(i)], fl = flames[parts.length % flames.length] || [vw / 2, vh];
      var o = old[parts.length];
      parts.push({ tx: G.cx + p[0] * scale, ty: G.cy + p[1] * scale, sx: o ? o.sx : fl[0] + (Math.random() - .5) * 30, sy: o ? o.sy : fl[1] + (Math.random() - .5) * 20,
        dl: Math.random() * 900, ph: Math.random() * 6.28, r: 1 + Math.random() * 1.5, hue: Math.random() < .72 ? 0 : 1, ox: 0, oy: 0 });
    }
  }
  function sparksStart() { if (still() || !pts.length) return; if (!sparkT0) sparkT0 = performance.now(); if (!rafS) rafS = requestAnimationFrame(drawSparks); }
  function drawSparks(t) {
    rafS = 0;
    if (still()) { cx2.clearRect(0, 0, cv.width, cv.height); return; }
    var al = sparkAlpha;
    cx2.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx2.clearRect(0, 0, vw, vh);
    if (al > .01 && scrollY < sTop + vh * 1.2) {
      cx2.globalCompositeOperation = 'lighter';
      var e = t - sparkT0, near = t - ptr.t < 1200;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], k = clamp((e - p.dl) / 1500, 0, 1), q = 1 - Math.pow(1 - k, 3);
        var x = lerp(p.sx, p.tx, q) + Math.sin(q * 3.14) * 40 * Math.sin(p.ph), y = lerp(p.sy, p.ty, q);
        x += Math.sin(t * .0011 + p.ph) * 1.6 * k; y += Math.cos(t * .0009 + p.ph * 1.3) * 1.6 * k;
        if (near) { var dx = x - ptr.x, dy = y - ptr.y, dd = dx * dx + dy * dy; if (dd < 8100) { var f = (1 - Math.sqrt(dd) / 90) * 26; var m = Math.sqrt(dd) || 1; p.ox = lerp(p.ox, dx / m * f, .2); p.oy = lerp(p.oy, dy / m * f, .2); } }
        p.ox *= .93; p.oy *= .93; x += p.ox; y += p.oy;
        var tw = .55 + .45 * Math.sin(t * .003 + p.ph * 3);
        cx2.fillStyle = p.hue ? 'rgba(255,206,130,' + (al * (.5 + .5 * tw) * (.5 + .5 * k)).toFixed(3) + ')' : 'rgba(200,145,255,' + (al * (.55 + .45 * tw) * (.55 + .45 * k)).toFixed(3) + ')';
        cx2.beginPath(); cx2.arc(x, y, p.r * (1.6 - .6 * k), 0, 6.283); cx2.fill();
      }
      cx2.globalCompositeOperation = 'source-over';
    }
    rafS = requestAnimationFrame(drawSparks);
  }
  addEventListener('pointermove', function (e) { ptr.x = e.clientX; ptr.y = e.clientY; ptr.t = performance.now(); }, { passive: true });
  addEventListener('pointerdown', function (e) { ptr.x = e.clientX; ptr.y = e.clientY; ptr.t = performance.now(); }, { passive: true });

  // ---------------------------------------------------------------- entrances, once, staggered inside each section
  $$('section').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 6) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { io && !still() ? io.observe(el) : el.classList.add('in'); });

  // the bento's small living things run only while it is on screen
  var bento = $('[data-bento]');
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { bento.classList.toggle('on-screen', e.isIntersecting); }); }, { threshold: .05 }).observe(bento);
  else bento.classList.add('on-screen');
  // a warm spotlight follows the pointer over the tiles; on phones it travels with the scroll
  $$('[data-spot]').forEach(function (t) {
    if (!canHover) return;
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); t.style.setProperty('--spot', 1); });
    t.addEventListener('pointerleave', function () { t.style.setProperty('--spot', 0); });
  });

  // ---------------------------------------------------------------- the manager's words fill in, letter by letter, with the scroll
  var chars = {};
  $$('[data-fill]').forEach(function (el) {
    var l = el.getAttribute('lang'), words = el.textContent.split(' ');
    el.innerHTML = words.map(function (w) { return '<span class="w">' + w.split('').map(function (c) { return '<span class="c">' + c + '</span>'; }).join('') + '</span>'; }).join(' ');
    chars[l] = $$('.c', el);
  });
  var say = $('[data-say]'), wl = $('.w-lotus'), lastLit = -1;

  // ---------------------------------------------------------------- reviews: the score counts up once; the ring turns and the row drifts with the scroll
  var odo = $('[data-odo]'), drift = $('[data-drift]'), track = $('[data-track]'), ring = $('.ring'), revSec = $('#reviews'), counted = false;
  function count() {
    if (counted) return; counted = true;
    if (still()) return;
    var t0 = performance.now();
    (function step(t) { var k = clamp((t - t0) / 1300, 0, 1), v = 4.8 * (1 - Math.pow(1 - k, 3)); odo.textContent = v.toFixed(1); if (k < 1) requestAnimationFrame(step); })(t0);
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) count(); }); }, { threshold: .4 }).observe(odo);

  // ---------------------------------------------------------------- the composer
  var SVC = [
    ['turkish', 'עיסוי טורקי', 'Turkish massage', 'עיסוי טורקי', 'a Turkish massage'],
    ['ayurveda', 'איורוודה', 'Ayurveda', 'עיסוי איורוודה', 'an Ayurvedic massage'],
    ['lomi', 'לומי לומי', 'Lomi Lomi', 'עיסוי לומי לומי', 'a Lomi Lomi massage'],
    ['egypt', 'עיסוי מצרי', 'Egyptian', 'עיסוי מצרי', 'an Egyptian massage'],
    ['georgia', 'טיפול גרוזיני', 'Georgian', 'טיפול גרוזיני', 'the Georgian treatment'],
    ['russian', 'עיסוי רוסי', 'Russian', 'עיסוי רוסי', 'a Russian massage'],
    ['spa2', 'ספא לשניים', 'Spa for two', 'ספא לשניים', 'the spa for two'],
    ['unsure', 'עוד לא החלטתי', 'Not sure yet', 'טיפול', 'a treatment']
  ];
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]'), nm = $('[name=nm]'), range = $('[data-time]'), tout = $('[data-tout]'), two = $('[data-two]');
  var days = [], pick = { svc: 'turkish', day: 0, time: 18 };
  function buildComposer() {
    var l = he();
    $('[data-leaves]').innerHTML = SVC.map(function (s) { return '<label><input type="radio" name="svc" value="' + s[0] + '"' + (pick.svc === s[0] ? ' checked' : '') + '><span class="l">' + (l ? s[1] : s[2]) + '</span></label>'; }).join('');
    var n = window.__now || now(), d0 = n.date || new Date();
    days = [];
    for (var i = 0; i < 7; i++) {
      var dow = (n.d + i) % 7, t = H[dow]; if (!t) continue;
      var dt = new Date(d0.getTime() + i * 864e5);
      days.push({ dow: dow, dd: dt.getUTCDate(), mm: dt.getUTCMonth() + 1, i: i, over: i === 0 && n.h >= t[1] - 1.25 });
    }
    if (days[pick.day] && days[pick.day].over) pick.day = 1;
    $('[data-days]').innerHTML = days.map(function (d, k) {
      var name = d.i === 0 ? (l ? 'היום' : 'Today') : d.i === 1 ? (l ? 'מחר' : 'Tmrw') : (l ? shortHe[d.dow] : shortEn[d.dow]);
      var lab = (d.i === 0 ? (l ? 'היום' : 'Today') : d.i === 1 ? (l ? 'מחר' : 'Tomorrow') : (l ? 'יום ' + dayHe[d.dow] : dayEn[d.dow])) + ' ' + d.dd + '.' + d.mm;
      return '<label><input type="radio" name="day" value="' + k + '"' + (d.over ? ' disabled' : '') + (pick.day === k ? ' checked' : '') + ' aria-label="' + lab + '"><span>' + name + '<small>' + d.dd + '.' + d.mm + '</small></span></label>';
    }).join('');
    buildTime();
  }
  // the candle is the open hours of the chosen day, in half hours; the last start is an hour before closing
  function buildTime() {
    var d = days[pick.day], t = H[d.dow], n = window.__now || now();
    var first = t[0], last = t[1] - 1;
    if (d.i === 0) first = Math.max(first, Math.ceil((n.h + 1) * 2) / 2);
    first = Math.min(first, last);
    range.min = 0; range.max = Math.round((last - first) * 2); range.dataset.first = first;
    pick.time = clamp(pick.time, first, last);
    range.value = Math.round((pick.time - first) * 2);
    $('[data-t0]').textContent = hhmm(first); $('[data-t1]').textContent = hhmm(last);
    showTime();
  }
  function showTime() {
    var first = +range.dataset.first; pick.time = first + range.value / 2;
    tout.textContent = hhmm(pick.time); range.setAttribute('aria-valuetext', hhmm(pick.time));
  }
  var T = {
    he: { hi: 'שלום, הגעתי דרך האתר של קסם ומגע. ', want: 'אשמח לתאם ', today: ' היום', tmrw: ' מחר', on: ' ביום ', at: ' בשעה ', two: ', לשניים', unsure: ' עוד לא החלטתי איזה, אשמח להמלצה.', name: ' קוראים לי ', ask: ' יש מקום?' },
    en: { hi: 'Hi, I found Kesem uMaga’s website. ', want: 'I’d like to book ', today: ' today', tmrw: ' tomorrow', on: ' on ', at: ' at ', two: ', for two', unsure: ' I haven’t decided which one yet and would love a suggestion.', name: ' My name is ', ask: ' Do you have a slot?' }
  };
  function message() {
    var l = he() ? 'he' : 'en', t = T[l], s = SVC.filter(function (x) { return x[0] === pick.svc; })[0] || SVC[0], d = days[pick.day];
    var name = (nm.value || '').replace(/\s+/g, ' ').trim().slice(0, 40).replace(/[.!?]+$/, '');
    var m = t.hi + t.want + (l === 'he' ? s[3] : s[4]);
    if (d) m += d.i === 0 ? t.today : d.i === 1 ? t.tmrw : t.on + (l === 'he' ? dayHe[d.dow] : dayEn[d.dow]) + ' ' + d.dd + '.' + d.mm;
    m += t.at + hhmm(pick.time);
    if (two.checked && pick.svc !== 'spa2') m += t.two;
    m += '.';
    if (pick.svc === 'unsure') m += t.unsure;
    if (name) m += t.name + name + '.';
    return m + t.ask;
  }
  var typeT = 0, lastM = '';
  function write(instant) {
    var m = message();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    clearInterval(typeT);
    if (instant || still() || !lastM) { preview.textContent = m; lastM = m; return; }
    var keep = 0; while (keep < m.length && keep < lastM.length && m[keep] === lastM[keep]) keep++;
    lastM = m;
    var i = keep;
    typeT = setInterval(function () {
      i = Math.min(m.length, i + 2);
      preview.textContent = m.slice(0, i);
      if (i < m.length) preview.insertAdjacentHTML('beforeend', '<span class="caret"></span>'); else clearInterval(typeT);
    }, 16);
  }
  form.addEventListener('change', function (e) {
    if (e.target.name === 'svc') { pick.svc = e.target.value; if (pick.svc === 'spa2') two.checked = true; }
    if (e.target.name === 'day') { pick.day = +e.target.value; buildTime(); }
    write();
  });
  range.addEventListener('input', function () { showTime(); write(true); });
  range.addEventListener('change', function () { write(); });
  nm.addEventListener('input', function () { write(true); });

  // ---------------------------------------------------------------- nav, stones, footer
  var pill = $('[data-pill]'), links = $$('.links a'), fab = $('[data-fab]'), seen = new Set(), foot = $('.foot'), flogo = $('[data-flogo]');
  if ('IntersectionObserver' in window) {
    var kio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? seen.add(e.target) : seen.delete(e.target); }); fab.classList.toggle('away', seen.size > 0); }, { threshold: 0 });
    $$('[data-keep-clear]').forEach(function (el) { kio.observe(el); });
  }
  function navCurrent(id) { links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + id ? 'true' : 'false'); }); }

  // ---------------------------------------------------------------- one scroll loop
  function tick() {
    var y = scrollY;
    pill.classList.toggle('up', y > 24);
    var s = (y - sTop) / vh;
    if (!still()) {
      var key = clamp(s, -.01, B1 + N * SEG + 1).toFixed(4);
      if (key !== lastKey && s < B1 + N * SEG + HOLD + 1.2) { lastKey = key; paint(clamp(s, 0, 99)); }
      if (sparkAlpha > .01) sparksStart();
    }
    // section in view for the nav
    var id = '';
    ['house', 'reviews', 'book', 'visit'].forEach(function (k) { var r = document.getElementById(k).getBoundingClientRect(); if (r.top < vh * .5) id = k; });
    if (!id && s > B1 - .2) id = 'world';
    navCurrent(id);
    // words
    var r = say.getBoundingClientRect();
    if (r.top < vh && r.bottom > 0) {
      var p = clamp((vh * .82 - r.top) / (r.height + vh * .3), 0, 1), arr = chars[root.lang] || [], lit = Math.round(p * arr.length);
      if (lit !== lastLit) { lastLit = lit; arr.forEach(function (c, i) { c.classList.toggle('lit', i < lit); }); }
      if (!still()) wl.style.setProperty('--ws', lerp(1.18, 1, p).toFixed(4));
    }
    // reviews
    var rr = revSec.getBoundingClientRect();
    if (rr.top < vh && rr.bottom > 0) {
      var rp = clamp((vh - rr.top) / (vh + rr.height), 0, 1);
      if (!still()) ring.style.setProperty('--rr', (rp * 90).toFixed(2) + 'deg');
      if (!still() && canHover && vw >= 900) {
        var over = Math.max(0, track.scrollWidth - vw);
        track.style.transform = 'translate3d(' + ((he() ? 1 : -1) * over * smooth((rp - .15) / .7)).toFixed(1) + 'px,0,0)';
      } else track.style.transform = '';
    }
    // tiles on touch screens: the spotlight travels with the scroll
    if (!canHover && !still()) $$('[data-spot]').forEach(function (t, i) {
      var b = t.getBoundingClientRect(); if (b.bottom < 0 || b.top > vh) return;
      var q = clamp((vh - b.top) / (vh + b.height), 0, 1);
      t.style.setProperty('--spot', (Math.sin(q * 3.14) * .9).toFixed(3));
      t.style.setProperty('--mx', (i % 2 ? 100 - q * 100 : q * 100).toFixed(1) + '%');
      t.style.setProperty('--my', (20 + q * 50).toFixed(1) + '%');
    });
    // footer: their logo rises as the curtain opens
    var fr = foot.getBoundingClientRect();
    if (fr.top < vh && !still()) { var fp = clamp((vh - fr.top) / Math.min(fr.height, vh * .6), 0, 1); flogo.style.setProperty('--fy', ((1 - smooth(fp)) * 50).toFixed(1) + 'px'); flogo.style.setProperty('--fo', (.2 + .8 * smooth(fp)).toFixed(3)); }
    else if (still()) { flogo.style.removeProperty('--fy'); flogo.style.removeProperty('--fo'); }
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); } }, { passive: true });
  var rT = 0, lastW = 0;
  addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { if (root.clientWidth !== lastW || Math.abs((pin.clientHeight || innerHeight) - vh) > 120) { lastW = root.clientWidth; layout(); } else tick(); }, 120); });
  addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  texts(he() ? 'he' : 'en');
  hours(); buildComposer(); write(true);
  lastW = root.clientWidth;
  layout();
  setK(0);
  if (still()) setK(0);
  window.__stage = { layout: layout, paint: paint, G: function () { return G; }, sTop: function () { return sTop; }, vh: function () { return vh; } };
})();
