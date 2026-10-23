(function () {
  window.__yl = true;
  var root = document.documentElement, WA = '972509998105', MAIL = 'office@yuvallevy-adv.com';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var easeOut = function (t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 700; };
  var hoverDev = matchMedia('(hover: hover)').matches;
  var TITLE = { he: 'עו״ד יובל לוי · משפט פלילי · שדרות פלי״ם 2, חיפה', en: 'Attorney Yuval Levy · Criminal law · 2 Palyam Ave, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור עו״ד יובל לוי · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for attorney Yuval Levy · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  // the YL monogram from her card, as a data URI so the canvas can read it from any origin
  var MASK = 'data:image/png;base64,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';

  // ---------------------------------------------------------------- language
  function texts(l) {
    var H = l === 'he';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[H ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', H ? h : e); }); };
    aria('[data-t-brand]', 'עו״ד יובל לוי, משרד עורכי דין', 'Attorney Yuval Levy, law office');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו ליובל, 050-999-8105', 'Call Yuval, 050-999-8105');
    aria('[data-t-wa]', 'וואטסאפ ליובל', 'WhatsApp Yuval');
    aria('[data-t-card]', 'הכרטיס של יובל, לחצו להפוך', 'Yuval’s card, press to flip');
    $$('[data-t-map]').forEach(function (f) { f.title = H ? 'מפה: שדרות פלי״ם 2, חיפה' : 'Map: 2 Palyam Ave, Haifa'; });
    $$('.back-cap').forEach(function (c) { c.textContent = H ? 'סריקה לשמירת הפרטים' : 'Scan to save the details'; });
    $$('[data-decode]').forEach(function (b) { b.textContent = b.dataset.decode.split('|')[H ? 0 : 1]; b.dataset.done = ''; });
    rowCap();
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('yl-lang', l); } catch (e) {}
    texts(l); hours(); draft(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('yl-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-r],[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    layout(); dust.kick(); draft(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed, [0,24] = all day
  var H = { 0: [0, 24], 1: [0, 24], 2: [0, 24], 3: [0, 24], 4: [0, 24], 5: [0, 24], 6: [0, 24] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return (h === 24 ? '24' : h) + ':' + (m < 10 ? '0' : '') + m; };
  var allDay = function (r) { return r && r[0] === 0 && r[1] === 24; };
  function now() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function span(r) { var L = he(); if (!r) return L ? 'סגור' : 'Closed'; if (allDay(r)) return L ? '24 שעות' : '24 hours'; return hhmm(r[0]) + '–' + hhmm(r[1]); }
  function hours() {
    var L = he(), t = now(), r = H[t.d], open = !!r && (allDay(r) || (t.h >= r[0] && t.h < r[1]));
    var every = [0, 1, 2, 3, 4, 5, 6].every(function (d) { return allDay(H[d]); });
    var msg;
    if (every) msg = L ? 'פתוח עכשיו · 24 שעות, כל השבוע' : 'Open now · 24 hours, every day';
    else if (open) msg = (L ? 'פתוח עכשיו · עד ' : 'Open now · until ') + hhmm(r[1]);
    else {
      var nd = null;
      for (var i = 0; i < 8; i++) { var d = (t.d + i) % 7, rr = H[d]; if (rr && (i > 0 || t.h < rr[0])) { nd = [d, rr[0]]; break; } }
      msg = nd ? (L ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd[0]] + ' ב-' + hhmm(nd[1]) : 'Closed now · opens ' + dayEn[nd[0]] + ' at ' + hhmm(nd[1])) : (L ? 'סגור עכשיו' : 'Closed now');
    }
    $$('[data-status]').forEach(function (s) { s.classList.toggle('open', open); $('[data-status-text]', s).textContent = msg; });
    // the table: consecutive days with the same hours are grouped
    var dl = $('[data-hours]'); if (!dl) return;
    dl.innerHTML = '';
    var names = L ? dayHe : dayEn, i0 = 0;
    for (var d = 0; d < 7; d++) {
      var same = d < 6 && JSON.stringify(H[d + 1]) === JSON.stringify(H[i0]);
      if (!same) {
        var dt = document.createElement('dt'), dd = document.createElement('dd');
        dt.textContent = i0 === d ? names[d] : names[i0] + '–' + names[d];
        dd.textContent = span(H[i0]);
        if (t.d >= i0 && t.d <= d && open) dd.classList.add('now');
        dl.appendChild(dt); dl.appendChild(dd); i0 = d + 1;
      }
    }
  }
  hours(); setInterval(hours, 60000);

  // ---------------------------------------------------------------- nav: bar -> pill, current section
  var nav = $('[data-nav]'), dock = $('[data-dock]'), hero = $('[data-hero]');
  var secs = ['yuval', 'office', 'process', 'reviews', 'contact'].map(function (id) { return document.getElementById(id); });
  function navState() {
    nav.classList.toggle('pill', scrollY > 30);
    var y = innerHeight * .4, cur = null;
    secs.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top < y && r.bottom > y) cur = s.id; });
    $$('.links a').forEach(function (a) { a.classList.toggle('here', a.getAttribute('href') === '#' + cur); });
    if (dock) dock.classList.toggle('on', scrollY > innerHeight * .9);
  }

  // ---------------------------------------------------------------- hero: the print grows out of the folder into the screen
  var pin = $('.hero-pin'), print = $('[data-print]');
  var geo = null;
  function heroGeo() {
    var W = pin.clientWidth, Hh = pin.clientHeight, top, bottom, w, h;
    if (W < 700) {
      var fs = clamp(W * .17, 56, 84);
      var front = Hh * .58 + 136;
      top = 76 + Hh * .04 + fs * 1.02 + 26 + 46;
      bottom = front + 34;
    } else {
      var fold = Hh * .60 + 176;
      top = 76 + Hh * .06;
      bottom = fold + 50;
    }
    var portrait = W >= 700 && W / Hh < 1.1;
    if (portrait) top = Math.max(top, 76 + Hh * .06 + clamp(W * .116, 64, 190) * 1.02 + 70);
    h = bottom - top; w = h * .75;
    var maxW = W < 700 ? W * .58 : portrait ? W * .5 : W * .3;
    if (w > maxW) { w = maxW; h = w / .75; top = bottom - h; }
    geo = { W: W, H: Hh, t: top, l: (W - w) / 2, w: w, h: h };
  }
  function heroFrame() {
    if (!geo) heroGeo();
    if (still()) { pin.style.cssText = ''; pin.classList.remove('gone'); return; }
    var r = hero.getBoundingClientRect();
    var span = hero.offsetHeight - innerHeight;
    var p = clamp(-r.top / Math.max(1, span), 0, 1);
    var e = smooth(p / .9);
    var g = geo, s = pin.style;
    s.setProperty('--p', e.toFixed(4));
    s.setProperty('--pt', lerp(g.t, 0, e).toFixed(1) + 'px');
    s.setProperty('--pl', lerp(g.l, 0, e).toFixed(1) + 'px');
    s.setProperty('--pw', lerp(g.w, g.W, e).toFixed(1) + 'px');
    s.setProperty('--ph', lerp(g.h, g.H, e).toFixed(1) + 'px');
    s.setProperty('--pr', lerp(10, 0, e).toFixed(1) + 'px');
    s.setProperty('--py', lerp(50, phone() ? 50 : 66, e).toFixed(1) + '%');
    s.setProperty('--capo', smooth((p - .78) / .2).toFixed(3));
    dust.fade = 1 - smooth(p / .5);
    pin.classList.toggle('gone', e > .26);
  }

  // ---------------------------------------------------------------- dust + logo particles (the opening: the YL gathers, then breaks into the light)
  var dust = (function () {
    var cv = $('[data-dust]'), cx = cv.getContext('2d'), pts = [], home = [], W = 0, Hc = 0, dpr = 1, t0 = 0, raf = 0, vis = true, mx = -999, my = -999, ready = false;
    var api = { fade: 1, kick: function () { if (!raf) raf = requestAnimationFrame(tick); } };
    var img = new Image();
    img.onload = function () {
      var c = document.createElement('canvas'), w = img.width, h = img.height; c.width = w; c.height = h;
      var g = c.getContext('2d'); g.drawImage(img, 0, 0);
      var d = g.getImageData(0, 0, w, h).data, step = 4;
      for (var y = 0; y < h; y += step) for (var x = 0; x < w; x += step) if (d[(y * w + x) * 4 + 3] > 120) home.push([x / w, y / h]);
      build(); ready = true; api.kick();
    };
    img.src = MASK;
    function size() { dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; Hc = cv.clientHeight; cv.width = W * dpr; cv.height = Hc * dpr; }
    function build() {
      size(); pts = [];
      var n = Math.min(home.length, phone() ? 420 : 760);
      var stride = home.length / n;
      var lw = Math.min(W * .5, 520), lh = lw * (200 / 240), lx = (W - lw) / 2, ly = Hc * .5 - lh * .5;
      for (var i = 0; i < n; i++) {
        var hp = home[Math.floor(i * stride)];
        pts.push({ hx: lx + hp[0] * lw, hy: ly + hp[1] * lh, sx: Math.random() * W, sy: Math.random() * Hc, dx: Math.random() * W, dy: Math.random() * Hc,
          vx: (Math.random() - .5) * .15, vy: -.05 - Math.random() * .18, r: .6 + Math.random() * 1.3, a: .25 + Math.random() * .5, ox: 0, oy: 0 });
      }
      t0 = performance.now();
    }
    function tick(now) {
      raf = 0;
      if (!ready) return;
      var t = now - t0, calm = still();
      cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, Hc);
      var gather = calm ? 1 : easeOut(t / 1100), burst = calm ? 1 : easeOut((t - 1500) / 1400);
      var autoX = -999, autoY = -999;
      if (!hoverDev && !calm) { autoX = W * (.5 + .38 * Math.sin(now / 2300)); autoY = Hc * (.42 + .25 * Math.sin(now / 1700)); }
      var px = mx > -999 ? mx : autoX, py = mx > -999 ? my : autoY;
      cx.fillStyle = '#D8D3C2';
      for (var i = 0; i < pts.length; i++) {
        var q = pts[i];
        if (!calm && burst >= 1) { q.dx += q.vx; q.dy += q.vy; if (q.dy < -10) { q.dy = Hc + 10; q.dx = Math.random() * W; } if (q.dx < -10) q.dx = W + 10; if (q.dx > W + 10) q.dx = -10; }
        var x, y;
        if (calm) { x = q.dx; y = q.dy; }
        else if (burst <= 0) { x = lerp(q.sx, q.hx, gather); y = lerp(q.sy, q.hy, gather); }
        else { x = lerp(q.hx, q.dx, burst); y = lerp(q.hy, q.dy, burst); }
        if (px > -999 && burst >= 1) {
          var ddx = x + q.ox - px, ddy = y + q.oy - py, dd = ddx * ddx + ddy * ddy;
          if (dd < 16000) { var f = (1 - dd / 16000) * 3; q.ox += ddx / Math.sqrt(dd + 1) * f; q.oy += ddy / Math.sqrt(dd + 1) * f; }
        }
        q.ox *= .94; q.oy *= .94;
        cx.globalAlpha = q.a * api.fade * (burst <= 0 ? .9 : lerp(.9, 1, burst));
        cx.beginPath(); cx.arc(x + q.ox, y + q.oy, q.r, 0, 6.283); cx.fill();
      }
      if (!calm && vis && api.fade > 0.01) raf = requestAnimationFrame(tick);
    }
    if (io) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) api.kick(); }).observe(cv);
    if (hoverDev) {
      $('.hero-pin').addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
      $('.hero-pin').addEventListener('pointerleave', function () { mx = my = -999; });
    }
    api.resize = function () { if (ready) { var old = t0; build(); t0 = old - 99999; api.kick(); } };
    var lastFade = 1;
    api.check = function () { if (api.fade > .01 && lastFade <= .01) api.kick(); lastFade = api.fade; };
    return api;
  })();

  // ---------------------------------------------------------------- the card: tilt toward the hand, tap to flip, save the contact
  var card = $('[data-card]'), flipped = false;
  function flip() { flipped = !flipped; card.style.setProperty('--flip', flipped ? '180deg' : '0deg'); card.setAttribute('aria-pressed', flipped); }
  card.addEventListener('click', flip);
  card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
  $('[data-flip]').addEventListener('click', flip);
  if (hoverDev) {
    var zone = $('.cardzone');
    zone.addEventListener('pointermove', function (e) {
      if (still()) return;
      var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.classList.add('drag');
      card.style.setProperty('--ry', ((x - .5) * 16).toFixed(2) + 'deg'); card.style.setProperty('--rx', ((.5 - y) * 12).toFixed(2) + 'deg');
      $$('.sheen', card).forEach(function (s) { s.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); s.style.setProperty('--my', (y * 100).toFixed(1) + '%'); });
    });
    zone.addEventListener('pointerleave', function () { card.classList.remove('drag'); card.style.setProperty('--ry', '0deg'); card.style.setProperty('--rx', '0deg'); });
  }
  function cardScroll() { // phones: the card tilts and the light moves as it passes
    if (hoverDev || still()) return;
    var r = card.getBoundingClientRect(), k = clamp((r.top + r.height / 2) / innerHeight, 0, 1) - .5;
    card.style.setProperty('--rx', (k * 18).toFixed(2) + 'deg'); card.style.setProperty('--ry', (k * -10).toFixed(2) + 'deg');
    $$('.sheen', card).forEach(function (s) { s.style.setProperty('--mx', (50 - k * 120).toFixed(1) + '%'); s.style.setProperty('--my', (40 + k * 60).toFixed(1) + '%'); });
  }
  $('[data-vcard]').addEventListener('click', function () {
    var v = ['BEGIN:VCARD', 'VERSION:3.0', 'N:לוי;יובל;;עו״ד;', 'FN:עו״ד יובל לוי', 'ORG:יובל לוי - משרד עורכי דין', 'TITLE:עורכת דין, משפט פלילי',
      'TEL;TYPE=CELL,VOICE:+972509998105', 'EMAIL;TYPE=WORK:' + MAIL, 'ADR;TYPE=WORK:;קומה 2, בניין אשל;שדרות פלי״ם 2;חיפה;;3309502;ישראל',
      'URL:https://yuvallevy-attorney.netlify.app/', 'END:VCARD'].join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([v], { type: 'text/vcard;charset=utf-8' }));
    a.download = 'yuval-levy.vcf'; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  });

  // ---------------------------------------------------------------- office: walk into the real photo
  var office = $('[data-office]'), opin = $('.office-pin'), room = $('[data-room]');
  var lbg = $('.l-bg'), la = $('.l-a'), lb = $('.l-b'), oend = $('[data-office-end]');
  var callouts = $$('[data-callout]'), ocopy = $('.office-copy');
  var odots = (function () {
    var cv = $('[data-office-dots]'), cx = cv.getContext('2d'), pts = [], home = [], W = 0, Hc = 0, dpr = 1;
    var im = new Image(); im.onload = function () {
      var c = document.createElement('canvas'); c.width = im.width; c.height = im.height; var g = c.getContext('2d'); g.drawImage(im, 0, 0);
      var d = g.getImageData(0, 0, im.width, im.height).data;
      for (var y = 0; y < im.height; y += 3) for (var x = 0; x < im.width; x += 3) if (d[(y * im.width + x) * 4 + 3] > 120) home.push([x / im.width, y / im.height]);
      size(); officeFrame();
    }; im.src = MASK;
    function size() {
      dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; Hc = cv.clientHeight; cv.width = W * dpr; cv.height = Hc * dpr; pts = [];
      var n = Math.min(home.length, phone() ? 700 : 1300), st = home.length / n;
      for (var i = 0; i < n; i++) {
        var a = Math.random() * 6.283, rr = Math.pow(Math.random(), .6);
        pts.push({ h: home[Math.floor(i * st)], ax: .5 + Math.cos(a) * rr * .55, ay: .44 + Math.sin(a) * rr * .5, r: .7 + Math.random() * 1.2, al: .45 + Math.random() * .5 });
      }
    }
    return {
      size: size,
      draw: function (k) {
        cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, Hc);
        if (k <= 0.001 || !pts.length) return;
        var lw = Math.min(W * .62, 360), lh = lw * (200 / 240), lx = (W - lw) / 2, ly = Hc * .42 - lh / 2;
        cx.fillStyle = '#C9C6BB';
        for (var i = 0; i < pts.length; i++) {
          var q = pts[i], e = smooth(k * 1.15 - (i % 17) / 17 * .15);
          var x = lerp(q.ax * W, lx + q.h[0] * lw, e), y = lerp(q.ay * Hc, ly + q.h[1] * lh, e);
          cx.globalAlpha = q.al * Math.min(1, k * 3);
          cx.beginPath(); cx.arc(x, y, q.r, 0, 6.283); cx.fill();
        }
      }
    };
  })();
  var decodeChars = 'אבגדהוזחטיכלמנסעפצקרשתABCDEFGHKLMNPRSTXYZ';
  function decode(b) {
    if (b.dataset.done) return; b.dataset.done = '1';
    var final = b.dataset.decode.split('|')[he() ? 0 : 1], t0 = performance.now();
    if (still()) { b.textContent = final; return; }
    (function step(now) {
      var k = clamp((now - t0) / 650, 0, 1), n = Math.floor(final.length * k), s = final.slice(0, n);
      for (var i = n; i < final.length; i++) s += final[i] === ' ' ? ' ' : decodeChars[(Math.random() * decodeChars.length) | 0];
      b.textContent = s; if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  function officeFrame() {
    if (still()) { [lbg, la, lb].forEach(function (l) { l.style.transform = ''; }); room.style.opacity = ''; ocopy.style.opacity = ''; ocopy.style.visibility = ''; return; }
    var r = office.getBoundingClientRect(), span = office.offsetHeight - innerHeight;
    var q = clamp(-r.top / Math.max(1, span), 0, 1);
    var e = smooth(q / .8);
    lbg.style.transform = 'scale(' + (1 + e * 1.5).toFixed(4) + ')';
    var ss = 1 + e * 2.6, tx = e * 38;
    la.style.transform = 'translateX(' + (-tx).toFixed(2) + '%) scale(' + ss.toFixed(4) + ')';
    lb.style.transform = 'translateX(' + tx.toFixed(2) + '%) scale(' + ss.toFixed(4) + ')';
    la.style.opacity = lb.style.opacity = (1 - smooth((q - .4) / .3)).toFixed(3);
    opin.style.setProperty('--glow', (smooth((q - .25) / .35) * .9).toFixed(3));
    room.style.opacity = (1 - smooth((q - .7) / .2) * .82).toFixed(3);
    opin.style.setProperty('--endo', smooth((q - .86) / .1).toFixed(3));
    ocopy.style.opacity = (1 - smooth((q - .4) / .15)).toFixed(3); ocopy.style.visibility = q > .56 ? 'hidden' : '';
    odots.draw(smooth((q - .66) / .26));
    // callouts ride on their layer
    var pr = opin.getBoundingClientRect(), rr = { left: pr.left + lbg.offsetLeft, top: pr.top + lbg.offsetTop, width: lbg.offsetWidth, height: lbg.offsetHeight };
    callouts.forEach(function (c) {
      var fx = +c.dataset.x, fy = +c.dataset.y, ox = rr.left + .507 * rr.width, oy = rr.top + .439 * rr.height;
      var lx = rr.left + fx * rr.width, ly = rr.top + fy * rr.height, sgn = c.dataset.callout === 'a' ? -1 : 1;
      var x = ox + (lx - ox) * ss + sgn * tx / 100 * rr.width, y = oy + (ly - oy) * ss;
      var vis = smooth((q - .04) / .08) * (1 - smooth((q - .3) / .1));
      c.style.setProperty('--cx', (x - pr.left - 6).toFixed(1) + 'px'); c.style.setProperty('--cy', (y - pr.top - 6).toFixed(1) + 'px');
      c.style.opacity = vis.toFixed(3);
      var b = $('b', c);
      if (vis > .3) decode(b); else if (q < .02) b.dataset.done = '';
    });
  }

  // ---------------------------------------------------------------- process: rows light up as you scroll; point at one to see its place
  var rows = $$('[data-row]'), prevImgs = $$('[data-preview] img'), cap = $('[data-preview-cap]'), slot = $('[data-slot]'), slip = $('[data-slip]');
  var manual = 0, curRow = 0;
  function setRow(i) {
    curRow = i;
    rows.forEach(function (r, k) { r.classList.toggle('on', k === i); });
    prevImgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
    rowCap();
  }
  function rowCap() { var r = rows[curRow]; if (r && cap) cap.textContent = r.dataset[he() ? 'capHe' : 'capEn']; }
  rows.forEach(function (r, i) {
    if (hoverDev) r.addEventListener('pointerenter', function () { manual = performance.now(); setRow(i); });
    r.addEventListener('focus', function () { manual = performance.now(); setRow(i); });
    r.addEventListener('click', function () { manual = performance.now(); setRow(i); });
  });
  function processFrame() {
    var r = slot.getBoundingClientRect();
    slip.style.setProperty('--print', still() ? 1 : smooth((innerHeight - r.top) / (innerHeight * .55)).toFixed(3));
    if (performance.now() - manual < 2500) return;
    var mid = innerHeight * .55, best = curRow, bd = 1e9;
    rows.forEach(function (row, i) { var b = row.getBoundingClientRect(), d = Math.abs(b.top + b.height / 2 - mid); if (d < bd) { bd = d; best = i; } });
    if (r.top < innerHeight && r.bottom > 0 && best !== curRow) setRow(best);
  }

  // ---------------------------------------------------------------- reviews: slips drift with the scroll, the seal counts up
  var slipsEl = $('[data-slips]'), slipqs = $$('.slipq'), drift = [-40, 30, -20, 50];
  function reviewsFrame() {
    if (still()) { slipqs.forEach(function (s) { s.style.removeProperty('--dy'); }); return; }
    var r = slipsEl.getBoundingClientRect(), k = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1) - .5;
    slipqs.forEach(function (s, i) { s.style.setProperty('--dy', (k * drift[i % 4] * (phone() ? .4 : 1)).toFixed(1) + 'px'); });
  }
  var seal = $('.seal');
  function countUp() {
    var o = $('[data-odo]'), n = $('[data-count]');
    if (still()) { o.textContent = '5.0'; n.textContent = '62'; return; }
    var t0 = performance.now();
    (function step(now) { var k = easeOut((now - t0) / 1300); o.textContent = (5 * k).toFixed(1); n.textContent = Math.round(62 * k); if (k < 1) requestAnimationFrame(step); })(t0);
  }
  if (io) new IntersectionObserver(function (es) { if (es[0].isIntersecting) countUp(); }, { threshold: .6 }).observe(seal);

  // ---------------------------------------------------------------- contact: the photo shrinks into its frame as the card arrives
  var visit = $('[data-visit]'), vphoto = $('[data-visit-photo]');
  function visitFrame() {
    if (still()) { vphoto.style.cssText = ''; return; }
    var r = visit.getBoundingClientRect(), k = smooth(-r.top / (innerHeight * .7));
    vphoto.style.setProperty('--vi', (k * (phone() ? 12 : Math.min(48, innerWidth * .035))).toFixed(1) + 'px');
    vphoto.style.setProperty('--vr', (k * 24).toFixed(1) + 'px');
    vphoto.style.setProperty('--vs', k.toFixed(3));
  }

  // ---------------------------------------------------------------- intake: tick a box, the message writes itself
  var form = $('[data-intake]'), draftEl = $('[data-draft]'), nameIn = $('[data-name-in]'), sendWa = $('[data-send-wa]'), sendMail = $('[data-send-mail]');
  var TOP = {
    he: ['זימון לחקירה', 'מעצר', 'שימוע לפני כתב אישום', 'כתב אישום', 'ערעור'],
    en: ['a summons for questioning', 'an arrest or detention', 'a pre-indictment hearing', 'an indictment', 'an appeal']
  };
  var typing = 0;
  function message() {
    var i = +(form.querySelector('input[name="topic"]:checked') || { value: 0 }).value, n = nameIn.value.trim().replace(/\s+/g, ' ');
    if (he()) return 'שלום יובל, ' + (n ? 'שמי ' + n + '. ' : '') + (i < 5 ? 'אני פונה בעניין ' + TOP.he[i] + '. ' : 'אני רוצה להתייעץ בעניין פלילי. ') + 'אשמח לדבר.';
    return 'Hello Yuval, ' + (n ? 'my name is ' + n + '. ' : '') + (i < 5 ? 'I’m writing about ' + TOP.en[i] + '. ' : 'I’d like to consult about a criminal matter. ') + 'I’d be glad to talk.';
  }
  function draft(instant) {
    var m = message();
    sendWa.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    sendMail.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(he() ? 'פנייה מהאתר' : 'A message from the website') + '&body=' + encodeURIComponent(m);
    cancelAnimationFrame(typing);
    if (instant || still()) { draftEl.textContent = m; return; }
    var t0 = performance.now();
    (function step(now) {
      var n = Math.min(m.length, Math.floor((now - t0) / 14));
      draftEl.textContent = m.slice(0, n);
      var c = document.createElement('span'); c.className = 'caret'; draftEl.appendChild(c);
      if (n < m.length) typing = requestAnimationFrame(step);
    })(t0);
  }
  form.addEventListener('change', function () { draft(false); });
  nameIn.addEventListener('input', function () { draft(true); });
  draft(true);

  // ---------------------------------------------------------------- reveals: heading, then line, then picture
  if (io && !still()) {
    var ob = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); ob.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('section').forEach(function (sec) { $$('[data-r],[data-reveal]', sec).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 6) * 80 + 'ms'); ob.observe(el); }); });
  } else $$('[data-r],[data-reveal]').forEach(function (el) { el.classList.add('in'); });

  // ---------------------------------------------------------------- footer curtain
  var back = $('[data-back]'), main = $('main');
  function curtain() {
    var fits = false; // the footer stays in the flow: simpler and never hides content
    back.classList.toggle('curtain', fits);
    main.style.marginBottom = fits ? back.offsetHeight + 'px' : '';
  }

  // ---------------------------------------------------------------- frame loop
  var ticking = false;
  function frame() { ticking = false; navState(); heroFrame(); dust.check(); cardScroll(); officeFrame(); processFrame(); reviewsFrame(); visitFrame(); }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  // long names: shrink the display line until each word fits beside the print (desktop) or across the screen (phone)
  function fitName() {
    var n = $('[data-name]'); n.style.fontSize = '';
    if (still()) return;
    var ws = $$('[lang="' + root.lang + '"] > .w', n), W = pin.clientWidth, gut = parseFloat(getComputedStyle(n).left) || 16;
    if (!ws.length) return;
    var need = phone() ? ws.reduce(function (a, w) { return a + w.offsetWidth; }, 0) * 1.25 : Math.max.apply(null, ws.map(function (w) { return w.offsetWidth; }));
    var avail = phone() ? W - gut * 2 : W * .5 - (geo ? geo.w / 2 : W * .15) - gut - 24;
    if (need > avail) n.style.fontSize = (parseFloat(getComputedStyle(n).fontSize) * avail / need).toFixed(1) + 'px';
  }
  function layout() { geo = null; heroGeo(); fitName(); odots.size(); dust.resize(); curtain(); frame(); }
  addEventListener('scroll', onScroll, { passive: true });
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 120); });
  texts(root.lang);
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { curtain(); });
})();
