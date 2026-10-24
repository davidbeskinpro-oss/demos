(function () {
  var root = document.documentElement, WA = '972524653933';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth <= 860; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'יואב איצקוביץ · סוכן ביטוח ופנסיה · איצקו סוכנות לביטוח, חיפה', en: 'Yoav Itzkovitz · Insurance & pension agent · Itzko Insurance Agency, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור יואב איצקוביץ, סוכן ביטוח · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Yoav Itzkovitz, insurance agent · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'abcdefghijklmnopqrstuvwxyz' };
  function scramble(s, keep, l) { var pool = GL[l], out = s.slice(0, keep); for (var i = keep; i < s.length; i++) out += s[i] === ' ' ? ' ' : pool[Math.floor(Math.random() * pool.length)]; return out; }

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-ph-he]').forEach(function (i) { i.placeholder = i.dataset[l === 'he' ? 'phHe' : 'phEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'איצקו סוכנות לביטוח, יואב איצקוביץ', 'Itzko Insurance Agency, Yoav Itzkovitz');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'המשרד', 'The office');
    aria('[data-t-prev]', 'הקודם', 'Previous');
    aria('[data-t-next]', 'הבא', 'Next');
    aria('[data-t-stages]', 'שלבים', 'Stages');
    aria('[data-t-call]', 'התקשרו ליואב, 052-465-3933', 'Call Yoav, 052-465-3933');
    aria('[data-t-wa]', 'וואטסאפ ליואב', 'WhatsApp Yoav');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: ההסתדרות 251, חיפה' : 'Map: 251 HaHistadrut, Haifa'; });
    $$('[data-decode]').forEach(function (d) { d.textContent = d.dataset[l]; });
    buildPapers();
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('itzko-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('itzko-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    hero.classList.add('ready', 'dealt');
    $$('[data-odo]').forEach(function (o) { roll(o, true); });
    layout(); rosette.kick(); frosette.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = window.__H || { 0: [9, 20], 1: [9, 20], 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [9, 12], 6: null };   // window.__H: stress.html only
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'המשרד פתוח עכשיו · עד ' + hhmm(t[1]) : 'Office open now · until ' + hhmm(t[1]); }
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
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); if (e.target.hasAttribute('data-sched')) decodeSched(); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline and footer slogan: letter by letter
  function split(sp, start) {
    var i = start || 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  }
  $$('[data-split] .ln > span[lang]').forEach(function (sp) { split(sp, sp.closest('.ln').previousElementSibling ? 12 : 0); });
  $$('[data-fslogan] > span[lang]').forEach(function (sp) { split(sp); });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), hin = $('[data-hin]');

  // ---------------------------------------------------------------- guilloche rosette: two families of waved rings, as on a policy or a banknote.
  // It turns slowly; the lines bend away from the hand (on phones a slow invisible hand drifts by itself; a tap sends a ripple)
  function makeRosette(cv, host, opt) {
    var c = cv.getContext('2d'), w, h, cx, cy, raf = 0, vis = true, mx = -9999, my = -9999, lastMove = 0, pulses = [], t0 = performance.now();
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = host.clientWidth; h = host.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var p = opt.center(); cx = p[0]; cy = p[1];
    }
    function paint(T) {
      c.clearRect(0, 0, w, h);
      c.globalCompositeOperation = 'lighter'; c.lineWidth = 1;
      var small = phone(), N = small ? opt.n * .65 | 0 : opt.n, S = small ? 170 : 260, base = opt.r0(), gap = opt.gap(), now = performance.now();
      var auto = !fine || now - lastMove > 2500, px = mx, py = my;
      if (auto && !still()) { px = cx + Math.cos(T * .35) * base * 1.25; py = cy + Math.sin(T * .5) * base * .9; }
      var rad = small ? 120 : 190, rad2 = rad * rad;
      pulses = pulses.filter(function (q) { return now - q.t < 2200; });
      for (var fam = 0; fam < 2; fam++) for (var i = 0; i < N; i++) {
        var R = base + i * gap, ph = (fam ? -1 : 1) * (T * .12) + i * .21, A = 7 + i * .35, m = opt.m, a = (.09 + .14 * (1 - i / N)) * opt.alpha;
        c.strokeStyle = fam ? 'rgba(141,198,63,' + a.toFixed(3) + ')' : 'rgba(63,165,53,' + (a * 1.15).toFixed(3) + ')';
        c.beginPath();
        for (var k = 0; k <= S; k++) {
          var th = k / S * 6.2832, r = R + A * Math.sin(m * th + ph * 3) + A * .55 * Math.sin((m + 5) * th - ph * 2);
          var x = cx + r * Math.cos(th), y = cy + r * Math.sin(th) * opt.squash;
          if (!still()) {
            var dx = x - px, dy = y - py, d2 = dx * dx + dy * dy;
            if (d2 < rad2) { var d = Math.sqrt(d2) || 1, f = (1 - d / rad); f = f * f * 34; x += dx / d * f; y += dy / d * f; }
            for (var q = 0; q < pulses.length; q++) {
              var P = pulses[q], age = (now - P.t) / 1000, ex = x - P.x, ey = y - P.y, dd = Math.sqrt(ex * ex + ey * ey) || 1, wave = age * 420 - dd;
              if (wave > 0 && wave < 160) { var s = Math.sin(wave / 160 * 3.1416) * 14 * (1 - age / 2.2); x += ex / dd * s; y += ey / dd * s; }
            }
          }
          k ? c.lineTo(x, y) : c.moveTo(x, y);
        }
        c.stroke();
      }
      c.globalCompositeOperation = 'source-over';
    }
    var lastPaint = 0;
    function frame(t) { raf = 0; if (t - lastPaint > 30 || still()) { lastPaint = t; paint((t - t0) / 1000); } if (!still() && vis) raf = requestAnimationFrame(frame); }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    host.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = host.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; lastMove = performance.now(); });
    host.addEventListener('pointerleave', function () { mx = my = -9999; });
    host.addEventListener('pointerdown', function (e) { var r = host.getBoundingClientRect(); pulses.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }); kick(); });
    watch(host, function (v) { vis = v; kick(); });
    return { size: function () { size(); kick(); }, kick: kick, center: function () { return [cx, cy]; } };
  }
  var fan = $('[data-fan]');
  function photoCenter() { var hr = hero.getBoundingClientRect(), pr = fan.getBoundingClientRect(); return [pr.left - hr.left + pr.width / 2, pr.top - hr.top + pr.height / 2 - (parseFloat(getComputedStyle(hin).transform.split(',')[5]) || 0)]; }
  var rosette = makeRosette($('[data-rosette]'), hero, {
    n: 22, m: 18, squash: 1, alpha: 1,
    center: photoCenter,
    r0: function () { return Math.max(110, fan.offsetWidth * .52); },
    gap: function () { return phone() ? 11 : 15; }
  });
  var foot = $('[data-foot]');
  var frosette = makeRosette($('[data-frosette]'), foot, {
    n: 20, m: 24, squash: .55, alpha: .8,
    center: function () { return [foot.clientWidth / 2, foot.clientHeight * 1.02]; },
    r0: function () { return Math.min(foot.clientWidth * .3, 420); },
    gap: function () { return phone() ? 10 : 16; }
  });

  // ---------------------------------------------------------------- the portrait leans toward the hand; the foil sheen follows it
  var card = $('[data-card]'), tl = { rx: 0, ry: 0, fx: 80, trx: 0, try_: 0, tfx: 80 }, tiltRaf = 0, heroVis = true, tStart = performance.now();
  if (fine) {
    hero.addEventListener('pointermove', function (e) {
      if (still()) return; var r = fan.getBoundingClientRect(), x = clamp((e.clientX - r.left) / r.width, -.5, 1.5), y = clamp((e.clientY - r.top) / r.height, -.5, 1.5);
      tl.try_ = (x - .5) * 12; tl.trx = -(y - .5) * 9; tl.tfx = 100 - x * 100; kickTilt();
    });
    hero.addEventListener('pointerleave', function () { tl.try_ = 0; tl.trx = 0; tl.tfx = 80; kickTilt(); });
  }
  function tiltFrame(t) {
    tiltRaf = 0; if (still()) { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); return; }
    if (!fine) { var T = (t - tStart) / 1000; tl.try_ = Math.sin(T * .7) * 6; tl.trx = Math.cos(T * .5) * 3; tl.tfx = 50 + Math.sin(T * .6) * 45 - scrollY * .05; }
    tl.rx += (tl.trx - tl.rx) * .1; tl.ry += (tl.try_ - tl.ry) * .1; tl.fx += (tl.tfx - tl.fx) * .1;
    card.style.setProperty('--rx', tl.rx.toFixed(2) + 'deg'); card.style.setProperty('--ry', tl.ry.toFixed(2) + 'deg');
    card.querySelector('.foil').style.setProperty('--fx', tl.fx.toFixed(1) + '%');
    if (heroVis && (!fine || Math.abs(tl.trx - tl.rx) + Math.abs(tl.try_ - tl.ry) + Math.abs(tl.tfx - tl.fx) > .05)) tiltRaf = requestAnimationFrame(tiltFrame);
  }
  function kickTilt() { if (!tiltRaf) tiltRaf = requestAnimationFrame(tiltFrame); }
  watch(hero, function (v) { heroVis = v; if (v) kickTilt(); });

  // microprint: two copies for a seamless loop
  var mt = $('[data-micro]'); mt.innerHTML += mt.innerHTML;

  // ---------------------------------------------------------------- the opening: the logo's own pixels gather into the logo
  var intro = $('[data-intro]'), introOn = false;
  function runIntro(done) {
    var seen = false; try { seen = sessionStorage.getItem('itzko-intro') === '1'; } catch (e) {}
    if (still() || seen || !intro) { if (intro) intro.remove(); done(); return; }
    try { sessionStorage.setItem('itzko-intro', '1'); } catch (e) {}
    introOn = true;
    var img = $('[data-logo-src]'), cv = $('[data-intro-cv]'), c = cv.getContext('2d'), P = [], finished = false, t0;
    function finish() { if (finished) return; finished = true; intro.classList.add('done'); done(); setTimeout(function () { intro.remove(); }, 700); }
    intro.addEventListener('click', finish);
    function start() {
      var dpr = Math.min(2, devicePixelRatio || 1), W = innerWidth, Hh = innerHeight; cv.width = W * dpr; cv.height = Hh * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var lw = Math.min(W * .84, 760), lh = lw * 272 / 1531, ox = (W - lw) / 2, oy = (Hh - lh) / 2;
      try {
        var sc = document.createElement('canvas'), iw = 380, ih = Math.round(380 * 272 / 1531); sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data, stp = W < 600 ? 2 : 1.5;
        for (var y = 0; y < ih; y += stp) for (var x = 0; x < iw; x += stp) {
          var k = ((y | 0) * iw + (x | 0)) * 4; if (d[k + 3] < 140) continue;
          var r = d[k], g = d[k + 1], b = d[k + 2], lum = .3 * r + .59 * g + .11 * b;
          var col = lum < 95 ? 'rgb(' + (150 + r * .3 | 0) + ',' + (158 + g * .3 | 0) + ',' + (154 + b * .3 | 0) + ')' : 'rgb(' + r + ',' + g + ',' + b + ')';
          P.push({ tx: ox + x / iw * lw, ty: oy + y / ih * lh, sx: Math.random() * W, sy: Math.random() * Hh, col: col, dl: Math.random() * .25, vx: (Math.random() - .5), vy: (Math.random() - .5) });
        }
      } catch (e) { finish(); return; }
      var dot = Math.max(1.6, lw / iw * stp * .9);
      t0 = performance.now();
      (function fr(t) {
        var T = (t - t0) / 1000; c.clearRect(0, 0, W, Hh);
        for (var i = 0; i < P.length; i++) {
          var p = P[i], a = smooth((T - p.dl) / .7), out = smooth((T - 1.25) / .4), x = lerp(p.sx, p.tx, a) + p.vx * out * W * .5, y = lerp(p.sy, p.ty, a) + p.vy * out * Hh * .5;
          c.globalAlpha = (.35 + .65 * a) * (1 - out); c.fillStyle = p.col; c.fillRect(x, y, dot, dot);
        }
        if (T > 1.3) finish();
        if (T < 1.9) requestAnimationFrame(fr);
      })(t0);
    }
    if (img.complete && img.naturalWidth) start(); else { img.addEventListener('load', start, { once: true }); setTimeout(finish, 1500); }
  }

  // ---------------------------------------------------------------- the file: papers, decode, stack, cover, clip, brackets
  var file = $('[data-file]'), desk = $('[data-desk]'), papers = $$('[data-paper]'), fback = $('[data-fback]'), ffront = $('[data-ffront]'), fclip = $('[data-fclip]'), fbra = $('[data-fbra]'), fbrb = $('[data-fbrb]'), fmark = $('[data-fmark]');
  var beats = $$('[data-beat]'), fchips = $$('[data-fchip]'), fileOn = false, stillStage = 0, G = {};
  var SCAT = [[.04, .06, -14], [.56, 0, 9], [.28, .42, -6], [.98, .3, 15], [0, .8, 8], [.52, .98, -17], [1, .9, 5]];
  function buildPapers() {
    var l = root.lang;
    papers.forEach(function (p, i) {
      var rows = ''; for (var r = 0; r < 9; r++) rows += '<span data-pr data-t="' + scramble(new Array(40 + (r * 7) % 13).join('x').replace(/x/g, function () { return Math.random() < .18 ? ' ' : 'x'; }), 0, l) + '"></span>';
      p.innerHTML = '<b class="p-title" data-t="' + p.dataset[l] + '"></b><div class="p-plain"><span data-pl="1" data-t=""></span><span data-pl="2" data-t=""></span></div><div class="p-print">' + rows + '</div><i class="p-seal"></i><i class="p-sign"></i>';
      p._l = [p.dataset[l === 'he' ? 'l1he' : 'l1en'], p.dataset[l === 'he' ? 'l2he' : 'l2en']];
      p._dec = -1;
    });
  }
  function decodePaper(p, d, force) {
    var l = root.lang, sp = $$('[data-pl]', p);
    var q = Math.round(d * 20) / 20; if (q === p._dec && !force) return; p._dec = q;
    p.classList.toggle('dec', d >= 1);
    sp.forEach(function (s, j) { var t = p._l[j], n = Math.floor(clamp(d * 1.25 - j * .25, 0, 1) * t.length); s.dataset.t = n >= t.length ? t : scramble(t, n, l); });
  }
  function fileLayout() {
    var W = desk.clientWidth, Hd = desk.clientHeight, sm = phone();
    var pw = sm ? clamp(W * .4, 120, 160) : clamp(Math.min(W * .225, (Hd - 30) / 2.75), 140, 240), ph = pw * 1.33;
    papers.forEach(function (p) { p.style.setProperty('--pw', pw + 'px'); p.style.setProperty('--ph', ph + 'px'); });
    G = { W: W, H: Hd, pw: pw, ph: ph, scat: [], grid: [], stack: [] };
    papers.forEach(function (p, i) { var s = SCAT[i]; G.scat.push([s[0] * (W - pw), s[1] * (Hd - ph), s[2], 1]); });
    if (!sm) {
      var gap = 22, cols = 4, gw = cols * pw + (cols - 1) * gap, gh = 2 * ph + gap, sg = Math.min(1, W / gw, Hd / gh), x0 = (W - gw * sg) / 2, y0 = (Hd - gh * sg) / 2;
      papers.forEach(function (p, i) {
        var row = i < 4 ? 0 : 1, col = row ? i - 4 : i, n = row ? 3 : 4, off = (cols - n) * (pw + gap) / 2, cc = rtl() ? n - 1 - col : col;
        G.grid.push([x0 + (off + cc * (pw + gap)) * sg + (pw * sg - pw) / 2, y0 + row * (ph + gap) * sg + (ph * sg - ph) / 2, (i % 2 ? .6 : -.6), sg]);
      });
    } else {
      var sc = clamp(Hd / (ph * 1 + 6 * pw * .27), .7, 1.5), pe = pw * sc, he_ = ph * sc, step = Math.min(pw * .27 * sc, (Hd - he_) / 6);
      papers.forEach(function (p, i) { G.grid.push([(W - pe) / 2 + (i % 2 ? 8 : -8) + (pe - pw) / 2, (Hd - (he_ + step * 6)) / 2 + i * step + (he_ - ph) / 2, i % 2 ? 1 : -1, sc]); });
    }
    var fw = sm ? Math.min(W * .58, 230) : Math.min(W * .5, (Hd - 110) / 1.28, 460), fh = fw * 1.28, fx = (W - fw) / 2, fy = (Hd - fh) / 2 + (sm ? 6 : 0), sF = fw * .9 / pw;
    G.f = { x: fx, y: fy, w: fw, h: fh };
    papers.forEach(function (p, i) { G.stack.push([fx + (fw - pw) / 2 + (i - 3) * 1.2, fy + (fh - ph) / 2 + 6 - i * 1.4, (i % 2 ? 1 : -1) * .8, sF * (fh * .92 / (ph * sF) < 1 ? fh * .92 / (ph * sF) : 1)]); });
    [fback, ffront].forEach(function (e) { e.style.setProperty('--fw', fw + 'px'); e.style.setProperty('--fh', fh + 'px'); });
    fclip.style.setProperty('--cw', Math.round(fw * .42) + 'px');
    [fbra, fbrb].forEach(function (e) { e.style.setProperty('--bw', (fw + 44) + 'px'); e.style.setProperty('--bh', (fh + 44) + 'px'); });
    fmark.style.setProperty('--mw', Math.round(fw * .3) + 'px');
  }
  function fileRender(p) {
    if (!G.W) return;
    var T = performance.now() / 1000, calm = still();
    var s1 = smooth((p - .12) / .28), dd = smooth((p - .22) / .22), s2 = smooth((p - .56) / .2), fc = smooth((p - .72) / .12), cl = smooth((p - .8) / .1), bk = smooth((p - .86) / .1);
    papers.forEach(function (el, i) {
      var a = G.scat[i], b = G.grid[i], c = G.stack[i], bob = (!calm && p < .4) ? (1 - s1) : 0;
      var x = lerp(lerp(a[0], b[0], s1), c[0], s2), y = lerp(lerp(a[1], b[1], s1), c[1], s2) + Math.sin(T * .9 + i * 1.7) * 6 * bob;
      var r = lerp(lerp(a[2], b[2], s1), c[2], s2) + Math.sin(T * .7 + i) * 1.4 * bob, s = lerp(lerp(a[3], b[3], s1), c[3], s2);
      el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + r.toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')';
      el.style.zIndex = 2 + i;
      decodePaper(el, clamp(dd * 1.15 - i * .02, 0, 1));
    });
    var F = G.f, side = rtl() ? 1 : -1;
    fback.style.opacity = s2.toFixed(3);
    fback.style.transform = 'translate3d(' + F.x + 'px,' + (F.y + (1 - s2) * 40).toFixed(1) + 'px,0)';
    ffront.style.opacity = fc > 0 ? 1 : 0;
    ffront.style.transform = 'translate3d(' + F.x + 'px,' + F.y + 'px,0) perspective(1400px) rotateY(' + (side * lerp(178, 0, fc)).toFixed(2) + 'deg)';
    var cw = F.w * .42, cxp = rtl() ? F.x + 10 : F.x + F.w - cw - 10;
    fclip.style.opacity = cl.toFixed(3);
    fclip.style.transform = 'translate3d(' + cxp.toFixed(1) + 'px,' + (F.y - 18 - (1 - cl) * 120).toFixed(1) + 'px,0) rotate(' + lerp(12, -3, cl).toFixed(2) + 'deg)';
    fbra.style.opacity = bk.toFixed(3); fbrb.style.opacity = bk.toFixed(3);
    fbra.style.transform = 'translate3d(' + (F.x - 22 - (1 - bk) * 60).toFixed(1) + 'px,' + (F.y - 22 - (1 - bk) * 60).toFixed(1) + 'px,0)';
    var bw = F.w + 44, bh = F.h + 44;
    fbrb.style.transform = 'translate3d(' + (F.x - 22 + (1 - bk) * 60).toFixed(1) + 'px,' + (F.y + F.h + 22 - bh * .68 + (1 - bk) * 60).toFixed(1) + 'px,0)';
    var mk = smooth((p - .9) / .08), mw = F.w * .3;
    fmark.style.opacity = mk.toFixed(3);
    fmark.style.transform = 'translate3d(' + (rtl() ? F.x + F.w - mw * .7 : F.x - mw * .3).toFixed(1) + 'px,' + (F.y + F.h - mw * .8).toFixed(1) + 'px,0) scale(' + lerp(1.8, 1, mk).toFixed(3) + ') rotate(' + lerp(-20, -6, mk).toFixed(2) + 'deg)';
    var k = p < .36 ? 0 : p < .68 ? 1 : 2;
    beats.forEach(function (b, i) { b.classList.toggle('on', i === k); });
    fchips.forEach(function (c, i) { c.setAttribute('aria-selected', i === k ? 'true' : 'false'); });
  }
  var STAGE_P = [0, .5, 1];
  function goStage(k) {
    k = clamp(k, 0, 2);
    if (still()) { stillStage = k; fileRender(STAGE_P[k]); return; }
    var top = file.getBoundingClientRect().top + scrollY, span = file.offsetHeight - innerHeight;
    scrollTo({ top: top + span * [.04, .5, .97][k], behavior: 'smooth' });
  }
  fchips.forEach(function (c, i) { c.addEventListener('click', function () { goStage(i); }); });
  function curStage() { var k = 0; fchips.forEach(function (c, i) { if (c.getAttribute('aria-selected') === 'true') k = i; }); return k; }
  $('[data-fprev]').addEventListener('click', function () { goStage(curStage() - 1); });
  $('[data-fnext]').addEventListener('click', function () { goStage(curStage() + 1); });
  watch(file, function (v) { fileOn = v; if (v) kickFile(); });
  var fileRaf = 0, lastScr = 0;
  function fileLoop(t) {
    fileRaf = 0; if (!fileOn || still()) return;
    var p = prog(file);
    if (p < .45) fileRender(p);                                    // papers breathe while they lie scattered
    if (p < .3 && t - lastScr > 110) { lastScr = t; $$('[data-pr]', desk).forEach(function (s, i) { if (Math.random() < .3) s.dataset.t = scramble(s.dataset.t, 0, root.lang); }); }
    fileRaf = requestAnimationFrame(fileLoop);
  }
  function kickFile() { if (!fileRaf) fileRaf = requestAnimationFrame(fileLoop); }

  // ---------------------------------------------------------------- Yoav: the particulars decode out of scrambled glyphs
  var schedDone = false;
  function decodeSched() {
    if (schedDone) return; schedDone = true;
    var dds = $$('[data-decode]'), l = root.lang;
    if (still()) { dds.forEach(function (d) { d.textContent = d.dataset[l]; }); return; }
    var t0 = performance.now();
    (function st(t) {
      var all = true;
      dds.forEach(function (d, i) { var s = d.dataset[root.lang], q = clamp((t - t0 - i * 180) / 700, 0, 1), n = Math.floor(q * s.length); d.textContent = n >= s.length ? s : scramble(s, n, root.lang); if (q < 1) all = false; });
      if (!all) requestAnimationFrame(st);
    })(t0);
  }
  var yoav = $('[data-yoav]'), yphoto = $('[data-yphoto]');

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { setTimeout(function () { roll(o, true); }, 60); ob.disconnect(); } }, { threshold: .4 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- the guilloche line that draws itself before the reviews
  var gline = $('[data-gline]'), gp = $$('path', gline), glen = [];
  (function () {
    gp.forEach(function (p, j) {
      var d = 'M0 30'; for (var x = 0; x <= 1200; x += 6) d += ' L' + x + ' ' + (30 + 20 * Math.sin(x / 1200 * 6.2832 * 9 + j * 3.1416) * Math.sin(x / 1200 * 3.1416)).toFixed(2);
      p.setAttribute('d', d); p.setAttribute('vector-effect', 'non-scaling-stroke');
      var L = p.getTotalLength(); glen.push(L); p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
    });
  })();

  // reviews: two copies of each row for a seamless drift
  $$('[data-row] .track').forEach(function (t) { $$('.rv', t).forEach(function (r) { var k = r.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.setAttribute('data-clone', ''); t.appendChild(k); }); });

  // ---------------------------------------------------------------- the note to Yoav (the live thing)
  var topics = $$('[data-topic]'), whens = $$('[data-when]'), nameEl = $('[data-name]'), msgEl = $('[data-msg]'), send = $('[data-send]'), steps = $$('[data-step]'), shown = '', typing = 0, chatSeen = false;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), nm = nameEl.value.trim().replace(/\s+/g, ' ').slice(0, 40);
    var picked = topics.filter(function (t) { return t.checked && t.value !== 'q'; }).map(function (t) { return t.dataset[l ? 'he' : 'en']; });
    var q = topics.filter(function (t) { return t.value === 'q'; })[0].checked;
    var w = whens.filter(function (x) { return x.checked; })[0], when = w ? w.dataset[l ? 'he' : 'en'] : '';
    if (l) return 'שלום יואב' + (nm ? ', כאן ' + nm : '') + '. ' + (picked.length ? 'אשמח לדבר על ' + list(picked, true) + '. ' : '') + (q ? 'יש לי שאלה קצרה. ' : '') + (!picked.length && !q ? 'אשמח לדבר איתך. ' : '') + 'נוח לי לדבר ' + when + '.';
    return 'Hi Yoav' + (nm ? ', this is ' + nm : '') + '. ' + (picked.length ? 'I’d like to talk about ' + list(picked, false) + '. ' : '') + (q ? 'I have a short question. ' : '') + (!picked.length && !q ? 'I’d like to talk with you. ' : '') + 'The best time for me is ' + when + '.';
  }
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 14);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  topics.forEach(function (t) { t.addEventListener('change', function () { lightStep(0); write(); }); });
  whens.forEach(function (t) { t.addEventListener('change', function () { write(); }); });
  nameEl.addEventListener('input', function () { if (nameEl.value.trim()) lightStep(1); write(); });
  ['pointerenter', 'focus', 'click'].forEach(function (ev) { send.addEventListener(ev, function () { lightStep(2); }); });
  $('[data-sheet]').addEventListener('submit', function (e) { e.preventDefault(); });
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; lightStep(0); shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .5 });

  // ---------------------------------------------------------------- the office: spotlight under the hand, a live Haifa clock
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var clock = $('[data-clock]'), offOn = false;
  watch($('#office'), function (v) { offOn = v; tickClock(); });
  function tickClock() { var o = nowParts(), h = (+o.hour) % 24; clock.textContent = (h < 10 ? '0' : '') + h + ':' + o.minute + (still() ? '' : ':' + o.second); }
  setInterval(function () { if (offOn) tickClock(); }, 1000);

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var dock = $('[data-dock]'), slogan = $$('[data-fslogan] .ch'), ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    dock.classList.toggle('hide', scrollY < 260);
    // hero sinks back under the landing file
    var hp = calm ? 0 : clamp(scrollY / Math.max(1, hero.offsetHeight), 0, 1);
    hin.style.transform = calm ? '' : 'translate3d(0,' + (hp * 90).toFixed(1) + 'px,0) scale(' + (1 - hp * .06).toFixed(4) + ')';
    hin.style.opacity = calm ? '' : (1 - hp * .7).toFixed(3);
    // the file
    fileRender(calm ? STAGE_P[stillStage] : prog(file));
    // Yoav's photo opens out of its frame and the camera moves in toward him
    var yr = yphoto.getBoundingClientRect(), e = calm ? 1 : smooth((vh - yr.top) / (vh * .7)), pp = calm ? .5 : clamp((vh - yr.top) / (vh + yr.height), 0, 1);
    yphoto.style.setProperty('--ci', (lerp(9, 0, e)).toFixed(2) + '%');
    yphoto.style.setProperty('--zs', calm ? '1.04' : lerp(1.16, 1.0, e) + smooth((pp - .45) / .5) * .16 + '');
    yphoto.style.setProperty('--zy', (calm ? 0 : smooth((pp - .45) / .5) * 6).toFixed(2) + '%');
    yphoto.style.setProperty('--sw', (calm ? 60 : lerp(140, -40, pp)).toFixed(1) + '%');
    // the guilloche line draws itself as you arrive (and undraws going back up)
    var gr = gline.getBoundingClientRect(), gpg = calm ? 1 : smooth((vh - gr.top) / (vh * .7));
    gp.forEach(function (p, j) { p.style.strokeDashoffset = (glen[j] * (1 - clamp(gpg * 1.1 - j * .1, 0, 1))).toFixed(1); });
    // the footer: the rosette rises, the slogan sets letter by letter
    var fr = foot.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / Math.min(fr.height, vh));
    foot.style.setProperty('--rise', ((1 - fp) * 140).toFixed(1) + 'px');
    slogan.forEach(function (c, i) { var v = calm ? 1 : smooth(fp * 1.7 - i * .035); c.style.opacity = calm ? '' : (.08 + .92 * v).toFixed(3); c.style.transform = calm || v >= 1 ? '' : 'translateY(' + ((1 - v) * .5).toFixed(3) + 'em)'; });
  }

  function layout() {
    rosette.size(); frosette.size(); fileLayout();
    foot.classList.toggle('tall', foot.offsetHeight > innerHeight - 20);
    var c = rosette.center(); hero.style.setProperty('--gx', c[0] + 'px'); hero.style.setProperty('--gy', c[1] + 'px');
    tick();
  }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); }, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout(); tickClock();
  var once = false, go = function () {
    if (once) return; once = true;
    runIntro(function () { requestAnimationFrame(function () { hero.classList.add('ready'); rosette.kick(); kickTilt(); setTimeout(function () { hero.classList.add('dealt'); }, 2300); }); });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 350);              // never hold the hero back for web fonts
  addEventListener('load', function () { layout(); });
})();
