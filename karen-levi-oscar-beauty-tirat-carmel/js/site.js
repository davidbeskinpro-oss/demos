(function () {
  var root = document.documentElement, WA = '972525999549';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 820; };
  var hoverable = matchMedia('(hover: hover)').matches;
  var io = 'IntersectionObserver' in window;
  var TITLE = { he: 'קארן לוי אוסקר · טיפולי גוף ויופי · האנפה 8, טירת כרמל', en: 'Karen Levi Oscar · Body & beauty treatments · 8 HaAnafa St, Tirat Carmel' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור קארן לוי אוסקר טיפולי גוף ויופי · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Karen Levi Oscar Body & Beauty Treatments · This is not the business’s official website' };
  var BLOOMS = ['#e0457f', '#f0963a', '#f2c23f', '#7fa94c', '#3f7fc4', '#c2286f'];   // the flower colours of her logo

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'קארן לוי, לראש העמוד', 'Karen Levi, back to top');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-wa]', 'וואטסאפ לקארן', 'WhatsApp Karen');
    aria('[data-t-call]', 'התקשרו לקארן, 052-599-9549', 'Call Karen, 052-599-9549');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: רחוב האנפה 8, טירת כרמל' : 'Map: 8 HaAnafa St, Tirat Carmel'; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('kl-lang', l); } catch (e) {}
    texts(l); hours(); days(); write(true); fit(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('kl-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-land]').forEach(function (el) { el.classList.add('in'); });
    curtain(); layout(); petals.kick(); lady.kick(); ring.kick(); write(true); odos();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9, 20], 1: [8, 20], 2: [14, 21], 3: [13, 21], 4: [9, 20], 5: [12.5, 16], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function nextOpen(d) { for (var k = 1; k <= 7; k++) { var nd = (d + k) % 7; if (H[nd]) return nd; } return -1; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = nextOpen(n.d);
      txt = nd < 0 ? (l ? 'סגור עכשיו' : 'Closed now')
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
  $$('section').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', (i % 5) * 80 + 'ms'); }); });
  $$('[data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 5) * 70 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-land]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- the name fills in letter by letter, like polish brushed on
  $$('[data-fill] > span[lang]').forEach(function (sp) {
    var i = 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span style="white-space:nowrap">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });
  $$('[data-letters]').forEach(function (sp) {
    sp.innerHTML = sp.textContent.split('').map(function (c, i) { return c === ' ' ? ' ' : '<span class="lt" style="--i:' + i + '">' + c + '</span>'; }).join('');
  });

  // ---------------------------------------------------------------- odometer figures
  var odoDone = false;
  function buildOdo(el) {
    var v = el.dataset.odo;
    el.innerHTML = v.split('').map(function (c) {
      if (!/\d/.test(c)) return '<span>' + c + '</span>';
      return '<span class="col" data-d="' + c + '" aria-hidden="true"></span>';
    }).join('');
    el.setAttribute('aria-label', v);
  }
  $$('.odo').forEach(buildOdo);
  function rollOdo(el) { $$('.col', el).forEach(function (c, i) { c.style.transitionDelay = (i * 120) + 'ms'; c.style.transform = 'translateY(' + (-c.dataset.d) + 'em)'; }); }
  function odos() { if (still()) $$('.odo').forEach(rollOdo); }
  $$('.odo').forEach(function (el) {
    if (still() || !io) { rollOdo(el); return; }
    var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { rollOdo(el); o.disconnect(); } }, { rootMargin: '0px 0px -15% 0px' }); o.observe(el);
  });

  // ---------------------------------------------------------------- nav and dock
  var nav = $('[data-nav]'), dock = $('[data-dock]');

  // ---------------------------------------------------------------- hero: her photos dealt into the heart, which opens to the full picture
  var hero = $('[data-hero]'), stage = $('[data-stage]'), hphoto = $('[data-hphoto]'), anchor = $('[data-anchor]'), hcopy = $('[data-hcopy]'), gloss = $('[data-gloss]');
  var heartP = 0;
  function heroFrame() {
    var sr = stage.getBoundingClientRect(), ar = anchor.getBoundingClientRect(), W = sr.width, Hh = sr.height;
    var p = 0;
    if (!still()) { var hr = hero.getBoundingClientRect(); p = clamp(-hr.top / Math.max(1, hr.height - innerHeight * 1.4), 0, 1); }
    var e = Math.pow(smooth(p), 1.8); heartP = e;
    var s0 = ar.width, l0 = ar.left - sr.left, t0 = ar.top - sr.top;
    var S = Math.max(W, Hh) * 3.4, l1 = W / 2 - S / 2, t1 = Hh / 2 - S * .92 * .38;
    var ms = lerp(s0, S, e);
    hphoto.style.setProperty('--ms', ms.toFixed(1) + 'px');
    hphoto.style.setProperty('--mx', lerp(l0, l1, e).toFixed(1) + 'px');
    hphoto.style.setProperty('--my', lerp(t0, t1, e).toFixed(1) + 'px');
    // inside the heart the photo sits a little closer; as the heart opens the camera settles back
    hphoto.style.setProperty('--zo', ((l0 + s0 / 2) / W * 100).toFixed(1) + '% ' + ((t0 + s0 * .46) / Hh * 100).toFixed(1) + '%');
    hphoto.style.setProperty('--zs', lerp(1.04, 1, e).toFixed(3));
    hphoto.style.setProperty('--dim', (e * .18).toFixed(3));
    hcopy.style.setProperty('--cy', (-e * 90).toFixed(1) + 'px');
    hcopy.style.setProperty('--co', clamp(1 - e * 1.7, 0, 1).toFixed(3));
    anchor.style.setProperty('--co', clamp(1 - e * 3, 0, 1).toFixed(3));
  }
  stage.addEventListener('pointermove', function (ev) {
    if (ev.pointerType !== 'mouse') return;
    var r = stage.getBoundingClientRect();
    gloss.style.setProperty('--gx', ((ev.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    gloss.style.setProperty('--gy', ((ev.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    petals.point(ev.clientX - r.left, ev.clientY - r.top);
  });
  stage.addEventListener('pointerleave', function () { petals.point(-999, -999); });
  stage.addEventListener('pointerdown', function (ev) { var r = stage.getBoundingClientRect(); petals.burst(ev.clientX - r.left, ev.clientY - r.top); });

  // ---------------------------------------------------------------- petals of her logo's flowers drifting over the hero
  function sprite(col) {
    var c = document.createElement('canvas'), s = 48; c.width = c.height = s; var x = c.getContext('2d');
    x.translate(s / 2, s / 2); x.fillStyle = col;
    for (var k = 0; k < 5; k++) { x.save(); x.rotate(k * Math.PI * 2 / 5); x.beginPath(); x.ellipse(0, -9.5, 6.4, 9, 0, 0, Math.PI * 2); x.fill(); x.restore(); }
    x.fillStyle = 'rgba(255,255,255,.35)'; for (k = 0; k < 5; k++) { x.save(); x.rotate(k * Math.PI * 2 / 5); x.beginPath(); x.ellipse(-1.5, -11, 2, 4.5, 0, 0, Math.PI * 2); x.fill(); x.restore(); }
    x.fillStyle = '#fbf1e6'; x.beginPath(); x.arc(0, 0, 4, 0, Math.PI * 2); x.fill();
    return c;
  }
  var SPR = BLOOMS.map(sprite);
  var petals = (function () {
    var cv = $('[data-petals]'), c = cv.getContext('2d'), P = [], w = 0, h = 0, raf = 0, vis = true, mx = -999, my = -999, last = 0;
    function mk(top) { return { x: Math.random() * w, y: top ? -30 - Math.random() * 60 : Math.random() * h, s: 8 + Math.random() * 12, r: Math.random() * 6.28, vr: (Math.random() - .5) * .02, vy: .25 + Math.random() * .45, ph: Math.random() * 6.28, k: Math.floor(Math.random() * SPR.length), ox: 0, oy: 0 }; }
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = stage.clientWidth; h = stage.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 18 : 34; P = []; for (var i = 0; i < n; i++) P.push(mk(false));
    }
    function draw() {
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) { var p = P[i]; c.save(); c.globalAlpha = .82; c.translate(p.x + p.ox, p.y + p.oy); c.rotate(p.r); c.drawImage(SPR[p.k], -p.s, -p.s, p.s * 2, p.s * 2); c.restore(); }
    }
    function frame(t) {
      raf = 0;
      if (still()) { draw(); return; }
      var dt = last ? Math.min(3, (t - last) / 16.7) : 1; last = t;
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        p.y += p.vy * dt * (1 + heartP * 2); p.x += Math.sin(t / 1400 + p.ph) * .35 * dt; p.r += p.vr * dt;
        var dx = p.x - mx, dy = p.y - my, d = Math.sqrt(dx * dx + dy * dy);
        var tx = 0, ty = 0; if (d < 120) { tx = dx / (d || 1) * (120 - d) * .5; ty = dy / (d || 1) * (120 - d) * .5; }
        p.ox += (tx - p.ox) * .12; p.oy += (ty - p.oy) * .12;
        if (p.y > h + 30) { P[i] = mk(true); }
      }
      // on phones the shine on the heart drifts by itself
      if (!hoverable) { gloss.style.setProperty('--gx', (50 + Math.sin(t / 2300) * 30).toFixed(1) + '%'); gloss.style.setProperty('--gy', (35 + Math.cos(t / 3100) * 18).toFixed(1) + '%'); }
      draw();
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { last = 0; if (!raf) raf = requestAnimationFrame(frame); }
    if (io) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; kick(); }).observe(stage);
    return { size: function () { size(); kick(); }, kick: kick, point: function (x, y) { mx = x; my = y; },
      burst: function (x, y) { if (still()) return; for (var i = 0; i < 6; i++) { var p = mk(false); p.x = x; p.y = y; p.ox = (Math.random() - .5) * 80; p.oy = (Math.random() - .5) * 80; P.push(p); } if (P.length > 60) P.splice(0, P.length - 60); } };
  })();

  // ---------------------------------------------------------------- the lady of her logo, gathered out of scattered dots as the card lands
  var meet = $('[data-meet]'), mcard = $('[data-mcard]');
  var lady = (function () {
    var cv = $('[data-lady]'), c = cv.getContext('2d'), img = $('[data-ladysrc]'), D = [], w, h, raf = 0, vis = false, ok = false, mx = -999, my = -999;
    function sample() {
      try {
        var iw = 295, ih = 262, sc = document.createElement('canvas'); sc.width = iw; sc.height = ih;
        var x = sc.getContext('2d'); x.drawImage(img, 0, 0, iw, ih);
        var d = x.getImageData(0, 0, iw, ih).data, pts = [];
        for (var y = 0; y < ih * .9; y += 2) for (var xx = 0; xx < iw * .86; xx += 2) {
          var k = (y * iw + xx) * 4, r = d[k], g = d[k + 1], b = d[k + 2], mx_ = Math.max(r, g, b), mn = Math.min(r, g, b);
          if (b > r + 10 && r + g + b < 330) pts.push([xx / iw, y / ih, 0]);                       // her navy hair and profile
          else if (mx_ - mn > 90 && y < ih * .5 && !(r > 150 && b > 90 && g < 90)) pts.push([xx / iw, y / ih, 1, 'rgb(' + r + ',' + g + ',' + b + ')']);   // the flower crown
        }
        var want = phone() ? 900 : 1500, stp = Math.max(1, pts.length / want);
        D = []; for (var f = 0; f < pts.length; f += stp) { var q = pts[Math.floor(f)]; D.push({ hx: q[0], hy: q[1], fl: q[2], col: q[3], sx: Math.random(), sy: Math.random(), ph: Math.random() * 6.28 }); }
        ok = D.length > 50;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = meet.clientWidth; h = meet.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(t) {
      raf = 0; if (!ok) return;
      var calm = still(), r = meet.getBoundingClientRect(), cr = mcard.getBoundingClientRect();
      var q = calm ? 1 : smooth((innerHeight * .95 - r.top) / (innerHeight * .7));
      // the dots land on the logo's place on her printed card (logo = left 5–47%, top 7–75% of the card)
      var ox = cr.left - r.left + cr.width * .054, oy = cr.top - r.top + cr.height * .067, bw = cr.width * .417, bh = cr.height * .68;
      var show = calm ? 1 : smooth((q - .82) / .16);
      mcard.style.setProperty('--cardo', show.toFixed(3));
      c.clearRect(0, 0, w, h);
      if (show >= 1) { c.globalAlpha = 1; return; }
      var sz = Math.max(1.6, bw / 120);
      for (var i = 0; i < D.length; i++) {
        var p = D[i], a = clamp(q * 1.2 - p.ph / 6.28 * .2, 0, 1);
        var tx = ox + p.hx * bw, ty = oy + p.hy * bh;
        var sw = (1 - a) * 18;
        var x = lerp(p.sx * w, tx, smooth(a)) + Math.sin(t / 900 + p.ph) * sw, y = lerp(p.sy * h, ty, smooth(a)) + Math.cos(t / 1100 + p.ph) * sw;
        var dx = x - mx, dy = y - my, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 90 && a < .98) { x += dx / (d || 1) * (90 - d) * .6; y += dy / (d || 1) * (90 - d) * .6; }
        c.globalAlpha = (p.fl ? .95 : .85) * (1 - show);
        c.fillStyle = p.fl ? p.col : '#2b2046';
        if (p.fl) { c.beginPath(); c.arc(x, y, sz * .8, 0, 6.283); c.fill(); } else c.fillRect(x - sz / 2, y - sz / 2, sz, sz);
      }
      c.globalAlpha = 1;
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    meet.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = meet.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    meet.addEventListener('pointerleave', function () { mx = my = -999; });
    if (io) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; kick(); }).observe(meet); else vis = true;
    function start() { size(); sample(); kick(); }
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // ---------------------------------------------------------------- tilt toward the hand (desktop)
  if (hoverable) $$('[data-tilt]').forEach(function (el) {
    el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); el.style.setProperty('--ty', (((e.clientX - r.left) / r.width - .5) * 10).toFixed(2) + 'deg'); el.style.setProperty('--tx', ((.5 - (e.clientY - r.top) / r.height) * 8).toFixed(2) + 'deg'); });
    el.addEventListener('pointerleave', function () { el.style.setProperty('--tx', '0deg'); el.style.setProperty('--ty', '0deg'); });
  });
  $$('.c-pic').forEach(function (el) {
    if (!hoverable) return;
    el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); el.style.setProperty('--ty', (((e.clientX - r.left) / r.width - .5) * 8).toFixed(2) + 'deg'); el.style.setProperty('--tx', ((.5 - (e.clientY - r.top) / r.height) * 6).toFixed(2) + 'deg'); });
    el.addEventListener('pointerleave', function () { el.style.setProperty('--tx', '0deg'); el.style.setProperty('--ty', '0deg'); });
  });

  // ---------------------------------------------------------------- the strand of hair drawing from toe to head, a blossom riding its tip
  var care = $('[data-care]'), strand = $('[data-strand]'), spath = $('[data-strandpath]'), sbloom = $('[data-strandbloom]'), SL = spath.getTotalLength();
  spath.setAttribute('pathLength', '1'); $('.s-base', strand).setAttribute('pathLength', '1');
  function strandFrame() {
    var r = care.getBoundingClientRect(), pr = still() ? 1 : clamp((innerHeight * .65 - r.top - 220) / Math.max(1, r.height - 340 - innerHeight * .2), 0, 1);
    spath.style.setProperty('--sd', (1 - pr).toFixed(4));
    if (!still()) {
      var pt = spath.getPointAtLength(pr * SL), sr = strand.getBoundingClientRect();
      sbloom.style.setProperty('--bx', (sr.left - r.left + pt.x / 100 * sr.width).toFixed(1) + 'px');
      sbloom.style.setProperty('--by', (sr.top - r.top + pt.y / 1000 * sr.height).toFixed(1) + 'px');
      sbloom.style.setProperty('--br', (pr * 540).toFixed(1) + 'deg');
      sbloom.style.opacity = pr > 0 && pr < 1 ? 1 : pr >= 1 ? 1 : 0;
    }
    $$('.c-pic img', care).forEach(function (im) { var b = im.parentNode.getBoundingClientRect(); im.style.setProperty('--py', still() ? '0px' : (((b.top + b.height / 2) - innerHeight / 2) * -.05).toFixed(1) + 'px'); });
  }

  // ---------------------------------------------------------------- lacquer dripping from the dark gallery into the reviews
  var work = $('[data-work]'), pourPath = $('[data-pourpath]');
  var DR = [[70, 30, 120], [215, 44, 70], [380, 34, 140], [520, 26, 90], [700, 46, 150], [860, 30, 80], [1010, 40, 130], [1140, 28, 60]];
  function pourFrame() {
    var r = work.getBoundingClientRect(), q = still() ? .55 : clamp((innerHeight - r.bottom) / (innerHeight * .7), 0, 1);
    var b = 16, d = 'M0 0H1200V' + b;
    DR.slice().reverse().forEach(function (k, i) {
      var x = k[0], hw = k[1] / 2, len = 6 + k[2] * smooth(q * 1.3 - i * .04);
      d += 'L' + (x + hw) + ' ' + b + 'C' + (x + hw) + ' ' + (b + len * .55) + ' ' + (x + hw * .8) + ' ' + (b + len) + ' ' + x + ' ' + (b + len) +
           'C' + (x - hw * .8) + ' ' + (b + len) + ' ' + (x - hw) + ' ' + (b + len * .55) + ' ' + (x - hw) + ' ' + b;
    });
    pourPath.setAttribute('d', d + 'L0 ' + b + 'Z');
  }

  // ---------------------------------------------------------------- a ring of her photos: turns by itself, with the scroll and with a drag
  var ring = (function () {
    var wrap = $('[data-ringwrap]'), el = $('[data-ring]');
    $$('.rc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $('img', k).alt = ''; el.appendChild(k); });
    var cards = $$('.rc', el), n = cards.length, step = 360 / n, drag = 0, auto = 0, raf = 0, vis = false, last = 0, down = null, R = 500;
    cards.forEach(function (c, i) { c.style.setProperty('--ca', (i * step) + 'deg'); });
    function size() {
      var cw = clamp(innerWidth * (phone() ? .44 : .2), 150, 300); R = cw * n / (2 * Math.PI) * 1.02;
      el.style.setProperty('--R', R.toFixed(0) + 'px'); el.style.setProperty('--cw', cw.toFixed(0) + 'px');
    }
    function frame(t) {
      raf = 0; if (still()) return;
      var dt = last ? Math.min(50, t - last) : 16; last = t;
      if (!down) auto += dt * .006;
      var a = -(auto + drag + work.getBoundingClientRect().top * .06);
      el.style.setProperty('--a', a.toFixed(2) + 'deg');
      cards.forEach(function (c, i) {
        var rel = ((i * step + a) % 360 + 540) % 360 - 180, cs = Math.cos(rel * Math.PI / 180);
        c.style.setProperty('--o', (.3 + .7 * Math.max(0, cs)).toFixed(3));
        c.style.setProperty('--sh', (rel * 2.2).toFixed(1) + '%');
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { last = 0; if (!raf && !still()) raf = requestAnimationFrame(frame); }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; down = { x: e.clientX, d: drag }; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (down) drag = down.d + (e.clientX - down.x) * -.25 * (root.dir === 'rtl' ? -1 : 1); });
    addEventListener('pointerup', function () { down = null; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { down = null; wrap.classList.remove('drag'); });
    if (io) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; kick(); }).observe(wrap); else vis = true;
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- reviews drift: a second copy makes the loop seamless
  var track = $('[data-track]');
  $$('.rv', track).forEach(function (r) { var k = r.cloneNode(true); k.setAttribute('aria-hidden', 'true'); track.appendChild(k); });

  // ---------------------------------------------------------------- the card that writes the WhatsApp message to Karen
  var T = {
    he: { book: ['לבניית ציפורניים', 'לפדיקור רפואי', 'לעיסוי', 'לספא ראש תאילנדי'], gift: ['בניית ציפורניים', 'פדיקור רפואי', 'עיסוי', 'ספא ראש תאילנדי'], soon: 'הכי קרוב', soonTxt: 'בזמן הקרוב' },
    en: { book: ['a nail building session', 'a medical pedicure', 'a massage', 'a Thai head spa'], gift: ['a nail building session', 'a medical pedicure', 'a massage', 'a Thai head spa'], soon: 'Soonest', soonTxt: 'soon' }
  };
  var daysEl = $('[data-days]'), msgEl = $('[data-msg]'), send = $('[data-send]'), giftEl = $('[data-gift]'), typing = 0, chosenDay = null;
  function days() {
    var l = he() ? 'he' : 'en', names = l === 'he' ? dayHe : dayEn, n = now(), html = '';
    var opts = [-1]; for (var d = 0; d < 7; d++) if (H[d]) opts.push(d);
    if (chosenDay === null) chosenDay = -1;
    opts.forEach(function (d) {
      var lab = d < 0 ? T[l].soon : (l === 'he' ? names[d] : names[d].slice(0, 3)), sub = d < 0 ? '' : hhmm(H[d][0]) + '–' + hhmm(H[d][1]);
      html += '<label class="day"><input type="radio" name="d" value="' + d + '"' + (d === chosenDay ? ' checked' : '') + '><span>' + lab + (sub ? '<small>' + sub + '</small>' : '') + '</span></label>';
    });
    daysEl.innerHTML = html;
    $$('input', daysEl).forEach(function (i) { i.addEventListener('change', function () { chosenDay = +i.value; write(); }); });
  }
  function message() {
    var l = he() ? 'he' : 'en', t = +($('input[name="t"]:checked') || { value: 0 }).value, gift = giftEl.checked, d = chosenDay;
    if (l === 'he') {
      if (gift) return 'היי קארן, אני רוצה לתת ' + T.he.gift[t] + ' במתנה. אפשר לסדר שובר מתנה?';
      return 'היי קארן, אשמח לקבוע תור ' + T.he.book[t] + (d < 0 ? ' בזמן הקרוב' : ' ביום ' + dayHe[d]) + '. מתי נוח לך?';
    }
    if (gift) return 'Hi Karen, I’d like to give ' + T.en.gift[t] + ' as a gift. Could we arrange a gift voucher?';
    return 'Hi Karen, I’d like to book ' + T.en.book[t] + (d < 0 ? ' soon' : ' on ' + dayEn[d]) + '. When suits you?';
  }
  function write(instant) {
    var m = message(); send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    $$('.week', document).forEach(function (f) { f.style.opacity = giftEl.checked ? .45 : 1; });
    cancelAnimationFrame(typing);
    if (instant || still()) { msgEl.innerHTML = ''; msgEl.textContent = m; return; }
    var i = 0, t0 = 0;
    (function step(t) { if (!t0) t0 = t; i = Math.min(m.length, Math.floor((t - t0) / 18)); msgEl.textContent = m.slice(0, i); var c = document.createElement('span'); c.className = 'caret'; msgEl.appendChild(c); if (i < m.length) typing = requestAnimationFrame(step); })(performance.now());
  }
  $$('input[name="t"]').forEach(function (i) { i.addEventListener('change', function () { write(); }); });
  giftEl.addEventListener('change', function () { write(); });
  if (io) { var bo = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { write(); bo.disconnect(); } }, { rootMargin: '0px 0px -25% 0px' }); bo.observe(msgEl); }

  // ---------------------------------------------------------------- bento spotlight under the hand
  $$('[data-tile]').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--sx', (e.clientX - r.left) + 'px'); t.style.setProperty('--sy', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- footer: curtain, name fitted to the width, letters rising
  var foot = $('[data-foot]'), fname = $('[data-fit]');
  var work2 = $('[data-work]');
  function fit() {
    if (!fname) return;
    var sp = $$('span[lang]', fname).filter(function (s) { return s.offsetParent !== null || getComputedStyle(s).display !== 'none'; })[0]; if (!sp) return;
    fname.style.fontSize = '100px'; var wv = sp.getBoundingClientRect().width, avail = fname.clientWidth;
    if (wv > 0) fname.style.fontSize = clamp(100 * avail / wv * .98, 40, 340).toFixed(1) + 'px';
  }
  function curtain() {
    var on = !still() && foot.offsetHeight < innerHeight - 60;
    root.classList.toggle('curtain', on);
    root.style.setProperty('--fh', foot.offsetHeight + 'px');
  }
  function footFrame() {
    var left = document.documentElement.scrollHeight - scrollY - innerHeight;
    if (left < foot.offsetHeight * .55) foot.classList.add('in'); else if (left > foot.offsetHeight) foot.classList.remove('in');
  }

  // ---------------------------------------------------------------- one scroll loop
  var ticking = false;
  function layout() {
    nav.classList.toggle('pill', scrollY > 40);
    dock.classList.toggle('show', scrollY > innerHeight * .55);
    heroFrame(); strandFrame(); pourFrame(); footFrame();
    var wr = work2.getBoundingClientRect(); work2.style.setProperty('--hz', still() ? 1 : (.75 + .25 * smooth((innerHeight - wr.top) / (innerHeight * .8))).toFixed(3));
    ring.kick(); lady.kick();
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; layout(); }); } }, { passive: true });
  var rw = 0;
  addEventListener('resize', function () { if (rw === innerWidth && phone()) { layout(); return; } rw = innerWidth; petals.size(); lady.size(); ring.size(); fit(); curtain(); layout(); });
  window.__layout = layout;

  // ---------------------------------------------------------------- start
  texts(root.lang); hours(); days(); write(true);
  rw = innerWidth; petals.size(); ring.size(); curtain(); layout();
  requestAnimationFrame(function () { hero.classList.add('ready'); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(); curtain(); layout(); });
  addEventListener('load', function () { fit(); curtain(); layout(); });
})();
