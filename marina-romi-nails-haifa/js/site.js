(function () {
  var root = document.documentElement, WA = '972548105171';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 861; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'Nail\'s by Marina Romi · מניקור ופדיקור · יצחק אלחנן 3, חיפה', en: 'Nail\'s by Marina Romi · Manicure & pedicure · 3 Yitzhak Elhanan St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Nail\'s by Marina Romi · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Nail\'s by Marina Romi · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-works]', 'עבודות', 'Work');
    aria('[data-t-prev]', 'העבודה הקודמת', 'Previous piece');
    aria('[data-t-next]', 'העבודה הבאה', 'Next piece');
    aria('[data-t-what]', 'מה עושים', 'What for');
    aria('[data-t-style]', 'איזה סגנון', 'Which look');
    aria('[data-t-when]', 'מתי נוח', 'When suits you');
    aria('[data-t-visit]', 'הגעה', 'Visit');
    aria('[data-t-call]', 'התקשרו למרינה, 054-810-5171', 'Call Marina, 054-810-5171');
    aria('[data-t-wa]', 'וואטסאפ למרינה', 'WhatsApp Marina');
    $$('.call').forEach(function (c) { if (c._done) $('b', c).textContent = c.dataset[l]; });
    $$('[data-decode]').forEach(function (d) { d.textContent = d.dataset[l]; });
    lampLabel(true);
    $$('[data-wa]').forEach(function (a) {
      var t = a.dataset.wa === 'mani' ? (l === 'he' ? 'היי מרינה, אשמח לקבוע תור למניקור.' : 'Hi Marina, I’d like to book a manicure.') : (l === 'he' ? 'היי מרינה, אשמח לקבוע תור לפדיקור.' : 'Hi Marina, I’d like to book a pedicure.');
      a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t);
    });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('mr-lang', l); } catch (e) {}
    texts(l); hours(); write(true); splitCoats(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('mr-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI(); revealAll(); calls(true); week(true);
    layout(); fan.kick(); glitter.kick(); frost.reset(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 19], 1: [9, 19], 2: [9, 19.5], 3: [9, 16], 4: [9, 16], 5: [8, 15], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], shortEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function is247() { for (var d = 0; d < 7; d++) if (!H[d] || H[d][0] !== 0 || H[d][1] !== 24) return false; return true; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (is247()) { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
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
    $$('.wk').forEach(function (w, i) { w.classList.toggle('today', i === n.d); });
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
    // the week as seven nails, each coated as far as that day's hours reach (the longest day is a full coat)
    var sh = l ? shortHe : shortEn, max = 0; for (var d = 0; d < 7; d++) if (H[d]) max = Math.max(max, H[d][1] - H[d][0]);
    $('[data-week]').innerHTML = sh.map(function (s, d) {
      var t = H[d], f = t ? (t[1] - t[0]) / max : 0;
      return '<div class="wk" style="--f:' + f.toFixed(3) + ';--d:' + d * 90 + 'ms"><span class="nail"><i class="coat"></i></span><small>' + s + '</small><span class="t" dir="ltr">' + (t ? hhmm(t[0]) + '–' + hhmm(t[1]) : (l ? 'סגור' : 'Closed')) + '</span></div>';
    }).join('');
    week(weekShown || still());
    status();
  }
  var weekShown = false;
  function week(on) { $$('.wk .coat').forEach(function (c) { var f = +getComputedStyle(c.closest('.wk')).getPropertyValue('--f'); c.style.height = on ? (f * 100) + '%' : '0%'; }); }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  function revealAll() { $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); }); }

  // headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 10 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- the colour chart: her photos as nail tips on a pearl pin
  var fan = (function () {
    var wrap = $('[data-fanwrap]'), tips = $$('.tip', wrap), N = tips.length, cap = $('[data-fancap]');
    var t0 = 0, raf = 0, vis = true, px = 0, tpx = 0, hot = -1, deal = 0, last = 0;
    function frame(t) {
      raf = 0;
      if (!t0) t0 = t;
      var calm = still(), T = (t - t0) / 1000;
      deal = calm ? 1 : smooth((T - .15) / 1.2);
      var hr = hero.getBoundingClientRect(), sp = calm ? 0 : clamp(-hr.top / (hr.height * .8), 0, 1);
      px += (tpx - px) * .08;
      var spread = (phone() ? 10.5 : 11) * (calm ? 1 : deal) * (1 + .03 * Math.sin(T * .9)) * (1 + sp * .35);
      var turn = calm ? 0 : px * 10 + sp * 26 * (rtl() ? -1 : 1);
      var best = 0, bi = -1;
      tips.forEach(function (el, i) {
        var a = (i - (N - 1) / 2) * spread + turn, f = Math.cos(a * Math.PI / 180);
        var lift = i === hot ? 22 : 0;
        if (f > best) { best = f; bi = i; }
        el.style.transform = 'rotate(' + a.toFixed(2) + 'deg) translateY(' + (-lift - (calm ? 0 : Math.sin(T * 1.4 + i) * 2)).toFixed(1) + 'px)';
        el.style.zIndex = Math.round(f * 20) + (i === hot ? 20 : 0);
        el.style.setProperty('--g', (20 + (px + 1) * 30 + Math.sin(T * .8 + i * .6) * 8).toFixed(1) + '%');
      });
      var show = hot >= 0 ? hot : -1;
      var txt = show >= 0 ? $('img', tips[show]).alt : '';
      if (cap.textContent !== txt) cap.textContent = txt;
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    wrap.addEventListener('pointermove', function (e) {
      var r = wrap.getBoundingClientRect(); tpx = clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1);
      if (e.pointerType === 'mouse') { var el = document.elementFromPoint(e.clientX, e.clientY), tp = el && el.closest('.tip'); hot = tp ? tips.indexOf(tp) : -1; }
      kick();
    });
    wrap.addEventListener('pointerleave', function () { tpx = 0; hot = -1; kick(); });
    wrap.addEventListener('click', function (e) { var tp = e.target.closest('.tip'); hot = tp ? (tips.indexOf(tp) === hot ? -1 : tips.indexOf(tp)) : -1; kick(); });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    // on phones nobody points: the chart turns a little by itself every few seconds and lifts one tip
    setInterval(function () { if (fine || still() || !vis) return; tpx = Math.random() * 1.6 - .8; hot = Math.floor(Math.random() * N); kick(); }, 2600);
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- her logo as glitter behind the chart, parting under the hand
  var glitter = (function () {
    var cv = $('[data-glitter]'), c = cv.getContext('2d'), img = new Image(), P = [], w = 0, h = 0, raf = 0, vis = true, mx = -999, my = -999, ok = false, t0 = 0;
    var COL = ['#ffffff', '#f7d6e4', '#e9b8c8', '#d7c9f2', '#c9a46a'];
    img.src = 'img/logo.png';
    function sample() {
      try {
        var sc = document.createElement('canvas'), iw = 387, ih = 185; sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data, pts = [];
        for (var y = 0; y < ih; y += 2) for (var x = 0; x < iw; x += 2) if (d[(y * iw + x) * 4 + 3] > 120) pts.push([x / iw, y / ih]);
        var want = phone() ? 900 : 1800, st = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += st) { var q = pts[Math.floor(f)]; P.push({ hx: q[0], hy: q[1], x: Math.random(), y: Math.random(), vx: 0, vy: 0, ph: Math.random() * 6.28, sp: .6 + Math.random() * 1.6, col: COL[Math.floor(Math.random() * COL.length)], s: Math.random() < .14 ? 3.2 : 2.1 }); }
        ok = true;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); P.forEach(function (p) { p.sx = undefined; }); }
    function frame(t) {
      raf = 0; if (!ok || !w) return;
      if (!t0) t0 = t;
      var calm = still(), T = (t - t0) / 1000;
      var bw = Math.min(w * .92, 760), bh = bw * 370 / 774, ox = (w - bw) / 2, oy = h * .1;
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], tx = ox + p.hx * bw, ty = oy + p.hy * bh, a = calm ? 1 : smooth((T - p.ph * .1) / 1.6);
        if (calm) { p.x = tx; p.y = ty; }
        else if (a < 1) { if (p.sx === undefined) { p.sx = p.x * w; p.sy = p.y * h; } p.x = lerp(p.sx, tx, a); p.y = lerp(p.sy, ty, a); }
        else {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 9000) { var fz = (9000 - d2) / 9000 * 2.2, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * fz; p.vy += dy / dd * fz; }
          p.vx += (tx - p.x) * .05; p.vy += (ty - p.y) * .05; p.vx *= .84; p.vy *= .84; p.x += p.vx; p.y += p.vy;
        }
        var tw = calm ? .55 : .35 + .65 * Math.pow(.5 + .5 * Math.sin(T * p.sp * 2 + p.ph), 3);
        c.globalAlpha = tw; c.fillStyle = p.col;
        c.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
      }
      c.globalAlpha = 1;
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    img.onload = function () { size(); sample(); kick(); };
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // ---------------------------------------------------------------- the door: fogged glass that your hand wipes clear; it fogs back slowly
  var frost = (function () {
    var fig = $('[data-glass]'), cv = $('[data-frost]'), c = cv.getContext('2d'), img = $('[data-doorimg]');
    var fog = document.createElement('canvas'), mask = document.createElement('canvas'), mc = mask.getContext('2d'), w = 0, h = 0, ready = false, raf = 0, vis = false, lastP = -1, prog = 0;
    function build() {
      w = fig.clientWidth; h = fig.clientHeight; if (!w || !img.naturalWidth) return;
      var dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      fog.width = Math.round(w / 2); fog.height = Math.round(h / 2);
      var f = fog.getContext('2d'), s = Math.max(fog.width / img.naturalWidth, fog.height / img.naturalHeight), dw = img.naturalWidth * s, dh = img.naturalHeight * s;
      f.filter = 'blur(9px)'; f.drawImage(img, (fog.width - dw) / 2, (fog.height - dh) / 2, dw, dh); f.filter = 'none';
      f.fillStyle = 'rgba(236,226,238,.55)'; f.fillRect(0, 0, fog.width, fog.height);
      for (var k = 0; k < 900; k++) { f.fillStyle = 'rgba(255,255,255,' + (Math.random() * .35).toFixed(2) + ')'; f.fillRect(Math.random() * fog.width, Math.random() * fog.height, 1.2, 1.2); }
      mask.width = fog.width; mask.height = fog.height;
      ready = true; draw();
    }
    function wipe(x, y, r) {
      var g = mc.createRadialGradient(x / 2, y / 2, 0, x / 2, y / 2, r / 2);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.6, 'rgba(0,0,0,.85)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      mc.fillStyle = g; mc.beginPath(); mc.arc(x / 2, y / 2, r / 2, 0, 6.29); mc.fill();
    }
    function draw() {
      if (!ready) return;
      c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, w, h);
      c.globalAlpha = 1 - smooth((prog - .62) / .2);
      c.drawImage(fog, 0, 0, w, h);
      c.globalCompositeOperation = 'destination-out'; c.globalAlpha = 1; c.drawImage(mask, 0, 0, w, h);
      c.globalCompositeOperation = 'source-over';
    }
    function frame() {
      raf = 0; if (!ready || still()) return;
      // it fogs back up, slowly
      mc.globalCompositeOperation = 'destination-out'; mc.fillStyle = 'rgba(0,0,0,.012)'; mc.fillRect(0, 0, mask.width, mask.height); mc.globalCompositeOperation = 'source-over';
      draw(); if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && vis) raf = requestAnimationFrame(frame); }
    var lx = null, ly = null;
    fig.addEventListener('pointermove', function (e) {
      if (still() || !ready) return; var r = fig.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (lx !== null) { var dx = x - lx, dy = y - ly, n = Math.ceil(Math.hypot(dx, dy) / 12); for (var i = 1; i <= n; i++) wipe(lx + dx * i / n, ly + dy * i / n, 90); } else wipe(x, y, 90);
      lx = x; ly = y; kick();
    });
    fig.addEventListener('pointerleave', function () { lx = ly = null; });
    fig.addEventListener('pointerdown', function (e) { if (still() || !ready) return; var r = fig.getBoundingClientRect(); wipe(e.clientX - r.left, e.clientY - r.top, 130); kick(); });
    // the scroll wipes a path across the sign: left and right like a hand on a mirror
    function scroll(p) {
      prog = p; if (!ready || still()) return;
      var from = Math.max(0, lastP), to = p;
      if (to > from) { for (var q = from; q <= to; q += .004) { if (q < .18) continue; var k = clamp((q - .18) / .42, 0, 1), x = w * (.5 + .36 * Math.sin(k * Math.PI * 3.2)), y = h * (.18 + .5 * k); wipe(x, y, 100); } }
      lastP = Math.max(lastP, p); draw(); kick();
    }
    watch(fig, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) build(); else img.addEventListener('load', build, { once: true });
    return { build: build, scroll: scroll, reset: function () { lastP = -1; if (ready) { mc.clearRect(0, 0, mask.width, mask.height); draw(); } } };
  })();

  // glyph decode for the two names
  var GLH = 'אבגדהוזחטיכלמנסעפצקרשת', GLE = 'abcdefghijklmnopqrstuvwxyz';
  function gl() { var a = he() ? GLH : GLE; return a[Math.floor(Math.random() * a.length)]; }
  function decode(el) {
    var tgt = el.dataset[he() ? 'he' : 'en'], n = 0;
    if (still()) { el.textContent = tgt; return; }
    clearInterval(el._t);
    el._t = setInterval(function () {
      n++; var out = '';
      for (var i = 0; i < tgt.length; i++) out += i < n / 2 ? tgt[i] : gl();
      el.textContent = out; if (n / 2 >= tgt.length) { clearInterval(el._t); el.textContent = tgt; }
    }, 40);
  }
  $$('[data-decode]').forEach(function (d) { watch(d, function (v) { if (v && !d._seen) { d._seen = true; decode(d); } }, { threshold: .6 }); });

  // ---------------------------------------------------------------- under the lamp
  var lamp = $('[data-lamp]'), lcards = $$('.lcard', lamp), lchips = $$('.lc', lamp), secs = $('[data-secs]'), llabel = $('[data-llabel]'), cur = 0, labelCur = -1;
  var LAB = { he: ['פרנץ\' לבן קלאסי', 'לילך בגימור מט', 'ורוד עם נצנצים', 'פרנץ\' כחול על שקד'], en: ['Classic white French', 'Lilac, matte finish', 'Pink with glitter', 'Blue French on almond'] };
  function lampLabel(force) {
    if (!llabel) return; if (!force && labelCur === cur) return; labelCur = cur;
    var t = LAB[he() ? 'he' : 'en'][cur];
    if (still() || force) { llabel.textContent = t; return; }
    var n = 0; clearInterval(llabel._t);
    llabel._t = setInterval(function () { n++; var o = ''; for (var i = 0; i < t.length; i++) o += t[i] === ' ' ? ' ' : i < n ? t[i] : gl(); llabel.textContent = o; if (n >= t.length) { clearInterval(llabel._t); llabel.textContent = t; } }, 28);
  }
  function chipsUI() { lchips.forEach(function (c, i) { c.setAttribute('aria-pressed', i === cur ? 'true' : 'false'); }); }
  function stillShow() { lcards.forEach(function (c, i) { c.classList.toggle('cur', i === cur); c.style.transform = ''; c.style.filter = ''; c.style.opacity = ''; c.style.zIndex = ''; c.style.setProperty('--uv', 0); c.style.setProperty('--sh', '130%'); }); lamp.style.setProperty('--lit', .45); secs.textContent = '0'; chipsUI(); lampLabel(); }
  function go(i) {
    i = (i + lcards.length) % lcards.length;
    if (still()) { cur = i; stillShow(); return; }
    var r = lamp.getBoundingClientRect(), top = scrollY + r.top, span = lamp.offsetHeight - innerHeight;
    scrollTo({ top: top + span * ((i + .55) / lcards.length), behavior: 'smooth' });
  }
  lchips.forEach(function (c) { c.addEventListener('click', function () { go(+c.dataset.go); }); });
  $$('.arw', lamp).forEach(function (b) { b.addEventListener('click', function () { go(cur + +b.dataset.step); }); });
  function lampScroll(p) {
    var n = lcards.length, seg = 1 / n, side = rtl() ? -1 : 1, litMax = 0;
    cur = clamp(Math.floor(p / seg), 0, n - 1);
    lcards.forEach(function (c, i) {
      var q = (p - i * seg) / seg;       // 0..1 while this card is the one under the lamp
      var enter = smooth(q / .22), cure = smooth((q - .16) / .36), leave = smooth((q - .8) / .2);
      if (i === 0) enter = 1;
      if (i === n - 1) leave = 0;
      // waiting cards sit on the end side, soft and matte; set ones land on a pile on the start side
      var wait = 1 - enter, done = leave, sc = 1 - wait * .38 - done * .4;
      var x = (wait * 128 - done * 128) * side + (q < 0 ? Math.min(-q, 2) * 12 * side : 0) - (q > 1 ? Math.min(q - 1, 2) * 10 * side : 0);
      var y = wait * 26 + done * 26;
      c.style.opacity = q > -2.2 ? 1 : 0;
      c.style.zIndex = i === cur ? 5 : 1;
      c.style.transform = 'translate3d(' + x.toFixed(2) + '%,' + y.toFixed(2) + '%,0) scale(' + sc.toFixed(3) + ') rotate(' + (wait * 8 * side - done * (6 + i * 2) * side).toFixed(2) + 'deg)';
      var set = Math.max(cure, done);
      c.style.filter = 'blur(' + ((1 - set) * 6).toFixed(2) + 'px) saturate(' + (.45 + set * .6).toFixed(3) + ') brightness(' + (.78 + set * .22).toFixed(3) + ')';
      var uv = q > 0 && q < 1 ? Math.sin(clamp((q - .1) / .6, 0, 1) * Math.PI) : 0;
      c.style.setProperty('--uv', (uv * .7).toFixed(3));
      c.style.setProperty('--sh', lerp(-130, 130, smooth((q - .5) / .22)).toFixed(1) + '%');
      if (i === cur) { litMax = uv; secs.textContent = String(Math.max(0, Math.round(60 * (1 - clamp((q - .16) / .36, 0, 1))))); }
    });
    lamp.style.setProperty('--lit', (.3 + litMax * .7).toFixed(3));
    chipsUI(); lampLabel();
  }

  // ---------------------------------------------------------------- the pair: labels type themselves onto the photos, shine under the hand
  function typeCall(c) {
    if (c._done) return; c._done = true;
    var b = $('b', c), t = c.dataset[he() ? 'he' : 'en'];
    if (still()) { b.textContent = t; return; }
    var i = 0; c._t = setInterval(function () { b.textContent = t.slice(0, ++i); if (i >= t.length) clearInterval(c._t); }, 38);
  }
  function calls(all) { $$('.call').forEach(function (c) { if (all) { c._done = false; clearInterval(c._t); typeCall(c); } }); }
  $$('.p-photo').forEach(function (f) {
    var cs = $$('.call', f);
    watch(f, function (v) { if (v) cs.forEach(function (c, i) { setTimeout(function () { typeCall(c); }, 400 + i * 520); }); }, { threshold: .35 });
    f.addEventListener('pointermove', function (e) {
      if (still()) return; var r = f.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      f.style.setProperty('--mx', x * 100 + '%'); f.style.setProperty('--my', y * 100 + '%');
      f.style.setProperty('--tx', ((x - .5) * -14).toFixed(1) + 'px'); f.style.setProperty('--ty', ((y - .5) * -14).toFixed(1) + 'px');
    });
    f.addEventListener('pointerleave', function () { f.style.setProperty('--tx', '0px'); f.style.setProperty('--ty', '0px'); });
  });
  var pair = $('[data-pair]'), photos = $$('.p-photo');

  // ---------------------------------------------------------------- book: the compact opens, the pearls choose, the message writes itself on the glass
  var book = $('[data-book]'), compact = $('[data-compact]'), lid = $('.lid', compact), mirror = $('.mirror', compact), msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
  $$('.strand').forEach(function (s) {
    var bs = $$('.pearl', s);
    bs.forEach(function (b) { b.addEventListener('click', function () { bs.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write(); }); });
  });
  function pick(g) { var b = $('[data-group="' + g + '"] [aria-checked="true"]'); return b ? b.dataset[he() ? 'he' : 'en'] : ''; }
  function compose() {
    var l = he(), w = pick('what'), s = pick('style'), t = pick('when');
    return l ? 'היי מרינה, אשמח לקבוע תור ל' + w + '.' + (s ? ' חשבתי על ' + s + '.' : '') + ' הכי נוח לי ' + t + '. תודה!'
             : 'Hi Marina, I’d like to book ' + w + '.' + (s ? ' I was thinking of ' + s + '.' : '') + ' ' + t.charAt(0).toUpperCase() + t.slice(1) + ' suits me best. Thank you!';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur0 = shown, t0 = performance.now(), del = cur0.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 16);
      shown = n < del ? cur0.slice(0, cur0.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch(mirror, function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; setTimeout(function () { write(); }, still() ? 0 : 500); } }, { threshold: .5 });

  // ---------------------------------------------------------------- reviews: each quote laid on word by word
  var coats = [];
  function splitCoats() {
    coats = [];
    $$('[data-coat]').forEach(function (q) {
      var p = $('p[lang="' + root.lang + '"]', q); if (!p) return;
      if (!p._split) { p.innerHTML = p.textContent.split(' ').map(function (w) { return '<span class="wd">' + w + '</span>'; }).join(' '); p._split = true; }
      coats.push({ q: q, ws: $$('.wd', p) });
    });
  }
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) { roll(o, still()); watch(o, function (v) { if (v) roll(o, true); }, { threshold: .4 }); });

  // ---------------------------------------------------------------- chapter colour on the nav's little nail
  var chap = $('[data-chap]'), chapters = $$('[data-chapter]');

  // ---------------------------------------------------------------- one scroll loop
  var ticking = false, plaque = $('[data-plaque]'), stitch = $('[data-stitch]'), door = $('[data-door]'), stitchLen = 0;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function through(el) { var r = el.getBoundingClientRect(); return clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) { fan.kick(); glitter.kick(); }
    // chapter
    var mid = vh * .35, col = chapters[0].dataset.chapter;
    chapters.forEach(function (c) { var r = c.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) col = c.dataset.chapter; });
    chap.style.setProperty('--chapc', col);
    // door
    frost.scroll(calm ? 1 : through($('[data-glass]')));
    // lamp: the pearl chapter's light seeps in only as the lamp turns on
    if (calm) stillShow();
    else lampScroll(prog(lamp));
    // pair: stays put (its bottom on the screen's bottom) while the booking chapter lands over it
    if (!calm) {
      pair.style.top = Math.min(0, vh - pair.offsetHeight) + 'px';
      var br = book.getBoundingClientRect(), cover = clamp(1 - br.top / vh, 0, 1);
      photos.forEach(function (f) { f.style.filter = cover > 0 ? 'brightness(' + (1 - cover * .25).toFixed(3) + ')' : ''; });
      // the compact's lid opens as it arrives
      var cr = compact.getBoundingClientRect(), op = smooth((vh - cr.top) / (vh * .7));
      lid.style.setProperty('--lid', (-op * 118).toFixed(1) + 'deg');
      lid.style.opacity = op > .97 ? 0 : 1;
      mirror.style.setProperty('--ref', ((op - .5) * 60).toFixed(1) + '%');
    } else { pair.style.top = ''; photos.forEach(function (f) { f.style.filter = ''; }); }
    // reviews
    coats.forEach(function (c) {
      var r = c.q.getBoundingClientRect(), f = calm ? 1 : clamp((vh * .88 - r.top) / (vh * .5), 0, 1), n = Math.round(f * c.ws.length);
      c.ws.forEach(function (w, i) { var o = i < n ? '1' : '.18'; if (w._o !== o) { w._o = o; w.style.setProperty('--o', o); } });
    });
    // week nails, once seen
    if (!weekShown) { var wr = $('[data-week]').getBoundingClientRect(); if (wr.top < vh * .85) { weekShown = true; week(true); } }
    // footer: the lace stitches itself, the plaque rises
    var ft = through($('.foot'));
    if (stitch) { if (!stitchLen) stitchLen = 1; stitch.style.strokeDashoffset = calm ? 0 : ((1 - smooth(ft / .5)) * 400).toFixed(1); }
    if (!calm) { var pp = smooth((ft - .1) / .45); plaque.style.setProperty('--py', ((1 - pp) * 50).toFixed(1) + 'px'); plaque.style.setProperty('--ps', (.92 + pp * .08).toFixed(3)); plaque.style.setProperty('--po', pp.toFixed(3)); }
  }

  function layout() { glitter.size(); frost.build(); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (innerWidth !== lw) { lw = innerWidth; layout(); } else tick(); }, 140); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); splitCoats();
  $$('[data-reveal]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  layout();
  var once = false, start = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); fan.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  setTimeout(start, 900);
  addEventListener('load', function () { frost.build(); tick(); });
})();
