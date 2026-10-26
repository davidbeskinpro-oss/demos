(function () {
  var root = document.documentElement, PHONE = '+97248745541', MAIL = 'support@fenix.co.il';
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
  var TITLE = { he: 'פניקס שירות ותיקון · מזגנים ומוצרי חשמל לבית · קריית ים', en: 'Fenix Service & Repair · Air conditioners & home appliances · Kiryat Yam' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור פניקס שירות ותיקון · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Fenix Service & Repair · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'פניקס שירות ותיקון', 'Fenix Service & Repair');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'חיוג לפניקס, 04-874-5541', 'Call Fenix, 04-874-5541');
    aria('[data-t-mail]', 'וואטסאפ לפניקס', 'WhatsApp Fenix');
    aria('[data-t-remote]', 'שלט מזגן לדוגמה', 'A sample AC remote');
    aria('[data-t-down]', 'הורדת מעלה', 'One degree down');
    aria('[data-t-up]', 'הוספת מעלה', 'One degree up');
    aria('[data-t-machines]', 'מכשיר', 'Appliance');
    aria('[data-t-syms]', 'מה קרה', 'What happened');
    aria('[data-t-areas]', 'אזור', 'Area');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: יסמין 5, קריית ים' : 'Map: 5 Yasmin St, Kiryat Yam'; });
    $$('.mag .stars').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('fx-lang', l); } catch (e) {}
    texts(l); hours(); decodeAll(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('fx-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-mag]').forEach(function (el) { el.classList.add('in'); });
    ticket.classList.add('out'); flogo.classList.add('on');
    $$('[data-odo]').forEach(function (o) { roll(o, true); });
    decodeAll(); write(true);
    if (still()) { $$('[data-mag]').forEach(function (m) { m.style.removeProperty('--dx'); m.style.removeProperty('--dy'); }); }
    layout(); field.kick(); mist.kick(); embers.kick(); foot.kick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed; [0,24] = all day
  var H = { 0: [0, 24], 1: [0, 24], 2: [0, 24], 3: [0, 24], 4: [0, 24], 5: [0, 24], 6: [0, 24] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  var allDay = function (t) { return t && t[0] === 0 && t[1] === 24; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false, day: '2-digit', month: '2-digit', year: 'numeric' }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, o: o }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false, k;
    var always = true; for (k = 0; k < 7; k++) if (!allDay(H[k])) always = false;
    if (always) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות, כל השבוע' : 'Open now · 24 hours, all week'; }
    else if (allDay(t)) { open = true; txt = l ? 'פתוח עכשיו · כל היום' : 'Open now · all day'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, c = 0; while (!H[nd] && c++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
    dial(n);
  }
  // consecutive days with the same hours share a row; the week starts on Sunday
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : allDay(t) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  // the 24-hour dial: every hour it is open is lit, the hour it is now glows, the hand shows the time
  var dialEl = $('[data-dial]');
  function dial(n) {
    var h = n.h, s = '';
    for (var k = 0; k < 24; k++) {
      var a = (k / 24) * Math.PI * 2 - Math.PI / 2, r1 = 50, r2 = k % 6 ? 44 : 40, open = H[n.d] && k >= H[n.d][0] && k < H[n.d][1];
      s += '<line class="tk' + (k === Math.floor(h) ? ' now' : '') + '" x1="' + (60 + Math.cos(a) * r1).toFixed(1) + '" y1="' + (60 + Math.sin(a) * r1).toFixed(1) + '" x2="' + (60 + Math.cos(a) * r2).toFixed(1) + '" y2="' + (60 + Math.sin(a) * r2).toFixed(1) + '"' + (open ? '' : ' style="stroke:#3a3f55"') + '/>';
    }
    s += '<line class="hand" x1="60" y1="60" x2="60" y2="28" style="transform-origin:60px 60px;transform:rotate(' + (h / 24 * 360).toFixed(1) + 'deg)"/>';
    s += '<circle cx="60" cy="60" r="4" fill="#fccc00"/>';
    s += '<text x="60" y="88" text-anchor="middle">24</text><text class="sm" x="60" y="101" text-anchor="middle">' + (he() ? 'שעות' : 'hours') + '</text>';
    dialEl.innerHTML = s;
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline: letter by letter, out of a blur
  $$('[data-split] .ln span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 14 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), heroWrap = $('[data-herowrap]'), nav = $('[data-nav]'), zone = $('[data-seamzone]');
  var hot = $('[data-hot]'), seam = $('[data-seam]'), tagC = $('[data-tagcold]'), tagH = $('[data-taghot]');

  // ---------------------------------------------------------------- the seam between cold and hot follows the hand; on phones it drifts by itself
  var seamTimer = 0, seamT = .5, seamS = .5, seamPx = 0, seamAuto = !fine, heroVis = true, seamRaf = 0, seamT0 = performance.now(), W0 = 0, H0 = 0;
  function seamApply() {
    var W = W0, Hh = H0, tilt = Math.min(Hh * .16, W * .22), c = seamS * W, a = c + tilt / 2, b = c - tilt / 2;
    hot.style.setProperty('--a', a.toFixed(1) + 'px'); hot.style.setProperty('--b', b.toFixed(1) + 'px');
    var L = Math.sqrt(Hh * Hh + (a - b) * (a - b)), th = Math.asin((a - b) / L);
    seam.style.height = L.toFixed(1) + 'px';
    seam.style.transform = 'translateX(' + (a - 1.5).toFixed(1) + 'px) rotate(' + th.toFixed(4) + 'rad)';
    seamPx = c;
    // the labels sit in the middle of their own side
    var coldMid = rtl() ? (c + W) / 2 : c / 2, hotMid = rtl() ? c / 2 : (c + W) / 2;
    tagC.style.left = clamp(coldMid - tagC.offsetWidth / 2, 10, W - tagC.offsetWidth - 10) + 'px';
    tagH.style.left = clamp(hotMid - tagH.offsetWidth / 2, 10, W - tagH.offsetWidth - 10) + 'px';
    tagC.style.opacity = (rtl() ? W - c : c) < tagC.offsetWidth + 24 ? 0 : 1;
    tagH.style.opacity = (rtl() ? c : W - c) < tagH.offsetWidth + 24 ? 0 : 1;
  }
  function seamFrame(t) {
    seamRaf = 0;
    if (still()) { seamS = seamT = .5; seamApply(); return; }
    if (seamAuto) seamT = .5 + Math.sin((t - seamT0) / 1000 * .55) * .17;
    seamS += (seamT - seamS) * .08; seamApply();
    if (heroVis) seamRaf = requestAnimationFrame(seamFrame);
  }
  function seamKick() { if (!seamRaf) seamRaf = requestAnimationFrame(seamFrame); }
  zone.addEventListener('pointermove', function (e) {
    var r = zone.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    if (e.pointerType === 'mouse') { seamAuto = false; seamT = clamp(x, .16, .84); }
    $('.h-cold img').style.setProperty('--px', ((x - .5) * -18).toFixed(1) + 'px'); $('.h-cold img').style.setProperty('--py', ((y - .5) * -12).toFixed(1) + 'px');
    $('.h-hot img').style.setProperty('--px2', ((x - .5) * 22).toFixed(1) + 'px'); $('.h-hot img').style.setProperty('--py2', ((y - .5) * 14).toFixed(1) + 'px');
    field.point(e.clientX - r.left, e.clientY - r.top);
    seamKick();
  });
  hero.addEventListener('pointerleave', function () { field.point(-999, -999); });
  hero.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse') return;
    var r = zone.getBoundingClientRect(); seamAuto = false; seamT = clamp((e.clientX - r.left) / r.width, .16, .84); seamKick();
    clearTimeout(seamTimer); seamTimer = setTimeout(function () { seamAuto = true; seamT0 = performance.now() - Math.asin(clamp((seamS - .5) / .17, -1, 1)) / .55 * 1000; }, 2600);
  });
  watch(hero, function (v) { heroVis = v; if (v) { seamKick(); field.kick(); } });

  // ---------------------------------------------------------------- hero field: the real logo's own pixels gather into the logo,
  // then its blue becomes frost falling on the cold side and its red becomes embers rising on the hot side
  var field = (function () {
    var cv = $('[data-field]'), c = cv.getContext('2d'), img = $('[data-logosrc]');
    var P = [], w = 1, h = 1, raf = 0, t0 = 0, mx = -999, my = -999, ok = false, opened = false;
    function sample() {
      try {
        var sc = document.createElement('canvas'), s = 120; sc.width = s; sc.height = s;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, s, s);
        var d = sx.getImageData(0, 0, s, s).data, pts = [];
        for (var y = 0; y < s; y++) for (var x = 0; x < s; x++) {
          var k = (y * s + x) * 4; if (d[k + 3] < 200) continue;
          var r = d[k], g = d[k + 1], b = d[k + 2];
          if (b > 120 && r < 80) pts.push([x / s, y / s, 0]);          // the blue wedge and frame
          else if (r > 200 && g < 70 && b < 70) pts.push([x / s, y / s, 1]); // the red base
        }
        var want = phone() ? 520 : 1000, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) { var q = pts[Math.floor(f)]; P.push(make(q)); }
        ok = P.length > 0;
      } catch (e) { ok = false; }
    }
    function make(q) { return { hx: q[0], hy: q[1], hot: q[2], x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, sz: q[2] ? 1.4 + Math.random() * 2 : 1.2 + Math.random() * 1.8, ph: Math.random() * 6.28, life: 0, dl: Math.random() * .35, sx: 0, sy: 0 }; }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function coldSide(x) { return rtl() ? x > seamPx : x < seamPx; }
    function respawn(p) {
      var W = w, side;
      if (p.hot) { side = rtl() ? [0, seamPx] : [seamPx, W]; p.x = lerp(side[0], side[1], Math.random()); p.y = h + 10; p.vx = (Math.random() - .5) * .3; p.vy = -(.5 + Math.random() * 1.1); }
      else { side = rtl() ? [seamPx, W] : [0, seamPx]; p.x = lerp(side[0], side[1], Math.random()); p.y = -10; p.vx = (Math.random() - .5) * .2; p.vy = .25 + Math.random() * .5; }
      p.life = 1;
    }
    function frame(now) {
      raf = 0; if (!ok) return;
      if (still()) { c.clearRect(0, 0, w, h); return; }
      var T = (now - t0) / 1000;
      var lw = Math.min(w, h) * (phone() ? .5 : .34), ox = w / 2 - lw / 2, oy = h * (phone() ? .2 : .14);
      c.clearRect(0, 0, w, h); c.globalCompositeOperation = 'lighter';
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        if (!opened) {
          // the opening: gather into the logo, hold, then let go
          var a = smooth((T - p.dl) / .8), tx = ox + p.hx * lw, ty = oy + p.hy * lw;
          if (p.sx === 0 && p.sy === 0) { p.sx = p.x; p.sy = p.y; }
          p.x = lerp(p.sx, tx, a); p.y = lerp(p.sy, ty, a);
          if (T > 1.35) { p.vx = (Math.random() - .5) * 2.4; p.vy = p.hot ? -(1 + Math.random() * 2) : (.4 + Math.random()); p.life = 1; }
        } else {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 9000) { var f = (9000 - d2) / 9000 * .9, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
          if (p.hot) { p.vy += (-(.7) - p.vy) * .02; p.vx += Math.sin(T * 2 + p.ph) * .03; }
          else { p.vy += (.45 - p.vy) * .02; p.vx += Math.sin(T * 1.1 + p.ph) * .02; }
          p.vx *= .97; p.x += p.vx; p.y += p.vy;
          // frost melts on the hot side, embers die on the cold side
          var wrong = p.hot ? coldSide(p.x) : !coldSide(p.x);
          p.life -= wrong ? .035 : .0016;
          if (p.life <= 0 || p.y < -20 || p.y > h + 20 || p.x < -20 || p.x > w + 20) respawn(p);
        }
        var al = opened ? clamp(p.life, 0, 1) : 1;
        if (p.hot) {
          var fl = .55 + .45 * Math.sin(T * 9 + p.ph);
          c.fillStyle = 'rgba(255,' + (90 + Math.round(90 * fl)) + ',40,' + (al * (.5 + .4 * fl)).toFixed(3) + ')';
          c.beginPath(); c.arc(p.x, p.y, p.sz, 0, 6.283); c.fill();
        } else {
          c.fillStyle = 'rgba(205,224,255,' + (al * .75).toFixed(3) + ')';
          c.fillRect(p.x - p.sz / 2, p.y - p.sz / 2, p.sz, p.sz);
        }
      }
      if (!opened && T > 1.35) opened = true;
      c.globalCompositeOperation = 'source-over';
      if (heroVis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf && !still()) raf = requestAnimationFrame(frame); }
    function start() { size(); sample(); t0 = performance.now(); kick(); }
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { size(); kick(); }, point: function (x, y) { mx = x; my = y; } };
  })();

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- glyph decode: plate values settle out of static
  var GL = '0123456789#%&+=אבגדהוזחטכלמנסעפצקרשתABCDEFGHKMNRSTXZ';
  function visibleNode(el) { var s = $$('span[lang]', el).filter(function (x) { return x.getAttribute('lang') === root.lang; })[0]; return s || el; }
  function decode(el, instant) {
    var tgt = visibleNode(el); if (!tgt.dataset.orig) tgt.dataset.orig = tgt.textContent;
    var txt = tgt.dataset.orig; clearInterval(el._t);
    if (instant || still()) { tgt.textContent = txt; return; }
    var n = 0, steps = 18;
    el._t = setInterval(function () {
      n++; var keep = Math.floor(txt.length * n / steps);
      tgt.textContent = txt.split('').map(function (ch, i) { return i < keep || ch === ' ' ? ch : GL[Math.floor(Math.random() * GL.length)]; }).join('');
      if (n >= steps) { clearInterval(el._t); tgt.textContent = txt; }
    }, 40);
  }
  var decoded = false;
  function decodeAll() { $$('[data-decode]').forEach(function (el) { decode(el, true); }); }
  watch($('[data-plate]'), function (v) { if (v && !decoded) { decoded = true; $$('[data-decode]').forEach(function (el, i) { setTimeout(function () { decode(el); }, i * 120); }); } }, { threshold: .35 });

  // ---------------------------------------------------------------- cool: the spotlight, the pointer-panned photos, the remote, the cold air from the fridge
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  $$('[data-pan]').forEach(function (t) {
    var im = $('img', t);
    t.addEventListener('pointermove', function (e) { if (still()) return; var r = t.getBoundingClientRect(); im.style.setProperty('--tx', (((e.clientX - r.left) / r.width - .5) * -6).toFixed(2) + '%'); im.style.setProperty('--ty', (((e.clientY - r.top) / r.height - .5) * -6).toFixed(2) + '%'); });
    t.addEventListener('pointerleave', function () { im.style.setProperty('--tx', '0%'); im.style.setProperty('--ty', '0%'); });
  });
  var cool = $('[data-cool]');
  watch(cool, function (v) { cool.classList.toggle('on', v); });
  var ac = $('[data-ac]'), acT = 24, acEl = $('[data-actemp]'), acMode = $('[data-acmode]');
  function acShow() { acEl.textContent = acT + '°'; ac.classList.toggle('heat', acMode.getAttribute('aria-pressed') === 'true'); }
  $$('[data-acstep]').forEach(function (b) { b.addEventListener('click', function () { acT = clamp(acT + +b.dataset.acstep, 16, 30); acShow(); if (!still() && acEl.animate) acEl.animate([{ transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 160, easing: 'ease-out' }); }); });
  acMode.addEventListener('click', function () { var on = acMode.getAttribute('aria-pressed') !== 'true'; acMode.setAttribute('aria-pressed', on ? 'true' : 'false'); acT = on ? 26 : 22; acShow(); });

  var mist = (function () {
    var box = $('[data-mistbox]'), cv = $('[data-mist]'), c = cv.getContext('2d'), P = [], w = 1, h = 1, raf = 0, vis = false, mx = -999, my = -999;
    // one soft puff, drawn once and stamped many times
    var puff = document.createElement('canvas'); puff.width = puff.height = 128;
    (function () { var g = puff.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(220,234,255,1)'); gr.addColorStop(1, 'rgba(220,234,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); })();
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = box.clientWidth; h = box.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function spawn() {
      // cold air spills over the lower shelves and the door seal, sinks, and spreads along the floor
      P.push({ x: w * (.42 + Math.random() * .5), y: h * (.5 + Math.random() * .16), vx: (Math.random() - .6) * .5, vy: .15 + Math.random() * .25, r: 14 + Math.random() * 26, a: 0, life: 1 });
    }
    function frame() {
      raf = 0; if (still() || !vis) { c.clearRect(0, 0, w, h); return; }
      if (P.length < (phone() ? 46 : 80)) { spawn(); spawn(); }
      c.clearRect(0, 0, w, h);
      for (var i = P.length - 1; i >= 0; i--) {
        var p = P[i];
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 12000) { var f = (12000 - d2) / 12000 * .6, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f * .5; }
        p.vy += .006;                                     // cold air is heavy: it sinks
        if (p.y > h * .9) { p.vy *= .7; p.vx += (p.vx >= 0 ? .02 : -.02); } // and spreads along the floor
        p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += .18; p.life -= .0045; p.a = Math.min(1, p.a + .03);
        if (p.life <= 0 || p.x < -80 || p.x > w + 80) { P.splice(i, 1); continue; }
        c.globalAlpha = p.a * p.life * .16; c.drawImage(puff, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      c.globalAlpha = 1; raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && vis && !still()) raf = requestAnimationFrame(frame); }
    box.addEventListener('pointermove', function (e) { var r = box.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    box.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(box, function (v) { vis = v; kick(); });
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- spin: the drum's speed over the scroll, integrated so it turns both ways
  var spin = $('[data-spin]'), drum = $('[data-drum]'), door = $('[data-spdoor]'), machine = $('[data-spmachine]'), spcopy = $('[data-spcopy]'), spheat = $('[data-spheat]'), rpmEl = $('[data-rpm]');
  function speed(p) { return p < .26 ? lerp(1.5, 14, smooth(p / .26)) : p < .38 ? lerp(14, .4, smooth((p - .26) / .12)) : .4; }
  var TURN = [0], NS_ = 400; for (var q = 1; q <= NS_; q++) TURN.push(TURN[q - 1] + speed((q - .5) / NS_) / NS_);
  function turns(p) { var f = clamp(p, 0, 1) * NS_, i = Math.floor(f); return i >= NS_ ? TURN[NS_] : lerp(TURN[i], TURN[i + 1], f - i); }
  var idle = 0, lastT = performance.now(), spinVis = false;
  watch(spin, function (v) { spinVis = v; if (v) tick(); });
  function spinUpdate(calm) {
    if (calm) { drum.style.transform = ''; drum.style.filter = ''; door.style.transform = ''; door.style.opacity = ''; machine.style.transform = ''; machine.style.backgroundColor = ''; machine.style.boxShadow = ''; spcopy.style.opacity = ''; spcopy.style.transform = ''; spheat.style.opacity = ''; rpmEl.textContent = '0'; return; }
    var p = prog(spin), v = speed(p);
    drum.style.transform = 'rotate(' + ((turns(p) * 360 * (rtl() ? -1 : 1)) + idle).toFixed(2) + 'deg)';
    drum.style.filter = v > 5 ? 'blur(' + Math.min(2.2, (v - 5) * .25).toFixed(2) + 'px)' : '';
    rpmEl.textContent = (Math.round(v / 14 * 120) * 10).toLocaleString('en-US');
    var d = smooth((p - .37) / .12);
    door.style.transform = 'perspective(1400px) rotateY(' + (-108 * d).toFixed(2) + 'deg)';
    door.style.opacity = (1 - smooth((p - .5) / .07)).toFixed(3);
    var e = smooth((p - .48) / .2), r = machine.getBoundingClientRect();
    // the scale that lets the drum's circle cover the farthest corner of the screen
    var mw = machine.offsetWidth, cx = r.left + r.width / 2, cy = r.top + r.height / 2, rad = mw * .36;
    var far = Math.max(Math.hypot(cx, cy), Math.hypot(innerWidth - cx, cy), Math.hypot(cx, innerHeight - cy), Math.hypot(innerWidth - cx, innerHeight - cy));
    var base = far / rad * 1.04;
    machine.style.transform = 'scale(' + lerp(1, base, e).toFixed(4) + ')';
    machine.style.backgroundColor = 'rgba(35,40,52,' + (1 - smooth(e * 2.2)).toFixed(3) + ')'; machine.style.boxShadow = e > .02 ? 'none' : '';
    spcopy.style.opacity = (1 - smooth((p - .44) / .08)).toFixed(3);
    spcopy.style.transform = 'translateY(' + (-30 * smooth((p - .44) / .08)).toFixed(1) + 'px)';
    spheat.style.opacity = smooth((p - .58) / .12).toFixed(3);
  }
  // a slow idle turn keeps the drum alive while you read
  setInterval(function () { if (spinVis && !still()) { idle += .9; tick(); } }, 50);

  // ---------------------------------------------------------------- heat: the band warms with the scroll; embers rise off the coil
  var band = $('[data-band]'), degEl = $('[data-deg]'), heatH = 1;
  var embers = (function () {
    var cv = $('[data-embers]'), c = cv.getContext('2d'), P = [], w = 1, h = 1, raf = 0, vis = false, t0 = performance.now();
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = band.clientWidth; h = band.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(t) {
      raf = 0; if (still() || !vis) { c.clearRect(0, 0, w, h); return; }
      var T = (t - t0) / 1000, want = Math.round((phone() ? 50 : 110) * heatH);
      while (P.length < want) P.push({ x: Math.random() * w, y: h * (.42 + Math.random() * .2), vx: (Math.random() - .5) * .4, vy: -(.4 + Math.random() * 1.2), s: .8 + Math.random() * 2, ph: Math.random() * 6.28, life: 1 });
      c.clearRect(0, 0, w, h); c.globalCompositeOperation = 'lighter';
      for (var i = P.length - 1; i >= 0; i--) {
        var p = P[i]; p.vx += Math.sin(T * 3 + p.ph) * .02; p.x += p.vx; p.y += p.vy; p.vy *= .995; p.life -= .008;
        if (p.life <= 0 || p.y < -10 || P.length > want + 10) { P.splice(i, 1); continue; }
        var fl = .5 + .5 * Math.sin(T * 10 + p.ph);
        c.fillStyle = 'rgba(255,' + (120 + Math.round(80 * fl)) + ',50,' + (p.life * (.45 + .45 * fl) * heatH).toFixed(3) + ')';
        c.beginPath(); c.arc(p.x, p.y, p.s, 0, 6.283); c.fill();
      }
      c.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && vis && !still()) raf = requestAnimationFrame(frame); }
    watch(band, function (v) { vis = v; kick(); });
    return { size: size, kick: kick };
  })();
  // the cards lean toward the hand
  $$('[data-tilt]').forEach(function (cd) {
    cd.addEventListener('pointermove', function (e) { if (!fine || still()) return; var r = cd.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; cd.style.transform = 'rotateY(' + (x * 9).toFixed(2) + 'deg) rotateX(' + (-y * 7).toFixed(2) + 'deg) translateZ(6px)'; });
    cd.addEventListener('pointerleave', function () { cd.style.transform = ''; });
  });

  // ---------------------------------------------------------------- the plate leans toward the hand (on phones it leans with the scroll)
  var plate = $('[data-plate]'), pwrap = $('[data-platewrap]');
  function plateTilt(x, y) { plate.style.transform = 'rotateY(' + (x * 12).toFixed(2) + 'deg) rotateX(' + (-y * 9).toFixed(2) + 'deg)'; plate.style.setProperty('--sh', (x * 60 - 10).toFixed(1) + '%'); }
  pwrap.addEventListener('pointermove', function (e) { if (!fine || still()) return; var r = pwrap.getBoundingClientRect(); plateTilt((e.clientX - r.left) / r.width - .5, (e.clientY - r.top) / r.height - .5); });
  pwrap.addEventListener('pointerleave', function () { if (fine) { plate.style.transform = ''; plate.style.setProperty('--sh', '-30%'); } });

  // the brands belt: two copies so the loop is seamless
  var belt = $('[data-belt]'); belt.innerHTML += belt.innerHTML.replace(/<span/g, '<span aria-hidden="true"');

  // ---------------------------------------------------------------- reviews: magnets land as the door comes in, lift away when it leaves
  var mags = $$('[data-mag]');
  if (io) {
    var mio = new IntersectionObserver(function (es) {
      var k = 0;
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.style.setProperty('--d', (k++ * 110) + 'ms'); e.target.classList.add('in'); }
        else if (e.boundingClientRect.top > innerHeight) e.target.classList.remove('in');
      });
    }, { threshold: .12 });
    mags.forEach(function (m) { mio.observe(m); });
  } else mags.forEach(function (m) { m.classList.add('in'); });
  if (fine) mags.forEach(function (m) {
    var sx, sy, ox, oy, on = false;
    m.addEventListener('pointerdown', function (e) { if (still() || e.button) return; on = true; sx = e.clientX; sy = e.clientY; ox = parseFloat(m.style.getPropertyValue('--dx')) || 0; oy = parseFloat(m.style.getPropertyValue('--dy')) || 0; m.classList.add('drag'); m.setPointerCapture(e.pointerId); e.preventDefault(); });
    m.addEventListener('pointermove', function (e) { if (!on) return; m.style.setProperty('--dx', (ox + e.clientX - sx) + 'px'); m.style.setProperty('--dy', (oy + e.clientY - sy) + 'px'); });
    var up = function () { if (!on) return; on = false; m.classList.remove('drag'); };
    m.addEventListener('pointerup', up); m.addEventListener('pointercancel', up);
  });

  // ---------------------------------------------------------------- service call (the live thing)
  var MACH = [
    { he: 'מזגן', en: 'Air conditioner', fhe: 'למזגן', fen: 'air conditioner', s: [['לא מקרר', 'not cooling'], ['לא מחמם', 'not heating'], ['מטפטף מים', 'dripping water'], ['ריח רע', 'a bad smell'], ['התריס לא נסגר עד הסוף', 'the flap doesn’t close all the way'], ['נדלק ונכבה לבד', 'turns on and off by itself'], ['לא נכבה', 'won’t turn off'], ['נכנס להשהייה כל הזמן', 'keeps going into standby']] },
    { he: 'מקרר', en: 'Fridge', fhe: 'למקרר', fen: 'fridge', s: [['לא מקרר', 'not cooling'], ['המקפיא לא מקפיא', 'the freezer isn’t freezing'], ['הצטברות קרח', 'ice building up'], ['מים מתחת למקרר', 'water under the fridge'], ['רעש חריג', 'an unusual noise']] },
    { he: 'מכונת כביסה', en: 'Washing machine', fhe: 'למכונת כביסה', fen: 'washing machine', s: [['לא מתרוקנת ממים', 'won’t drain'], ['לא סוחטת', 'won’t spin'], ['רועשת ורועדת', 'loud and shaking'], ['לא נדלקת', 'won’t turn on'], ['יש נזילת מים', 'leaking water']] },
    { he: 'מייבש כביסה', en: 'Tumble dryer', fhe: 'למייבש כביסה', fen: 'tumble dryer', s: [['לא מחמם', 'not heating'], ['התוף לא מסתובב', 'the drum won’t turn'], ['לא נדלק', 'won’t turn on'], ['רעש חריג', 'an unusual noise']] },
    { he: 'תנור', en: 'Oven', fhe: 'לתנור', fen: 'oven', s: [['לא מחמם', 'not heating'], ['מחמם רק מלמעלה או רק מלמטה', 'heats only from the top or the bottom'], ['לא נדלק', 'won’t turn on'], ['החשמל קופץ', 'it trips the electricity']] },
    { he: 'ניקוי מזגן', en: 'AC cleaning', clean: true, s: [['מזגן בחדר שינה', 'a bedroom unit'], ['מזגן בסלון', 'a living-room unit'], ['מיני מרכזי', 'a mini-central unit']] }
  ];
  var AREAS = [['קריית ים', 'Kiryat Yam'], ['קריית מוצקין', 'Kiryat Motzkin'], ['קריית ביאליק', 'Kiryat Bialik'], ['קריית אתא', 'Kiryat Ata'], ['קריית חיים', 'Kiryat Haim'], ['חיפה', 'Haifa'], ['עכו', 'Acre'], ['נהריה', 'Nahariya']];
  var st = { m: 0, s: 0, a: 0 }, mBox = $('[data-machines]'), sBox = $('[data-syms]'), aBox = $('[data-areas]');
  function key(he_, en_, on, i) { return '<button type="button" class="key" role="radio" aria-checked="' + (on ? 'true' : 'false') + '" data-i="' + i + '"><i aria-hidden="true"></i><span lang="he">' + he_ + '</span><span lang="en">' + en_ + '</span></button>'; }
  function render(box, list, cur) { box.innerHTML = list.map(function (x, i) { return key(x.he || x[0], x.en || x[1], i === cur, i); }).join(''); }
  function renderAll() { render(mBox, MACH, st.m); render(sBox, MACH[st.m].s, st.s); render(aBox, AREAS, st.a); }
  function pick(box, k) {
    box.addEventListener('click', function (e) {
      var b = e.target.closest('.key'); if (!b) return;
      st[k] = +b.dataset.i; if (k === 'm') st.s = 0;
      renderAll(); lightStep(k === 'm' ? 0 : 1); write();
      var nb = $('.key[data-i="' + b.dataset.i + '"]', box); if (nb) nb.focus({ preventScroll: true });
    });
    box.addEventListener('keydown', function (e) {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.key) < 0) return;
      var ks = $$('.key', box), i = ks.indexOf(document.activeElement); if (i < 0) return;
      var dir = (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 1; if (rtl() && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) dir = -dir;
      ks[(i + dir + ks.length) % ks.length].click(); e.preventDefault();
    });
  }
  pick(mBox, 'm'); pick(sBox, 's'); pick(aBox, 'a');
  var steps = $$('[data-step]');
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  var send = $('[data-send]'), wasend = $('[data-wasend]');
  send.addEventListener('pointerenter', function () { lightStep(2); });
  wasend.addEventListener('pointerenter', function () { lightStep(2); }); wasend.addEventListener('focus', function () { lightStep(2); });
  send.addEventListener('focus', function () { lightStep(2); });
  $('[data-callbtn]').addEventListener('focus', function () { lightStep(2); });
  function compose() {
    var l = he(), m = MACH[st.m], s = m.s[st.s][l ? 0 : 1], a = AREAS[st.a][l ? 0 : 1];
    if (m.clean) return l ? 'שלום, אשמח לתאם ניקוי מזגן.\nסוג: ' + s + '.\nאזור: ' + a + '.\nטלפון לחזרה: ' : 'Hello, I’d like to book an AC cleaning.\nType: ' + s + '.\nArea: ' + a + '.\nPhone to call back: ';
    return l ? 'שלום, אשמח לתאם טכנאי ' + m.fhe + '.\nהתקלה: ' + s + '.\nאזור: ' + a + '.\nטלפון לחזרה: '
             : 'Hello, I’d like to book a technician for my ' + m.fen + '.\nThe problem: ' + s + '.\nArea: ' + a + '.\nPhone to call back: ';
  }
  function subject() { var l = he(), m = MACH[st.m]; return (l ? 'קריאת שירות: ' + m.he : 'Service call: ' + m.en) + ' · ' + AREAS[st.a][l ? 0 : 1]; }
  var msgEl = $('[data-msg]'), ticket = $('[data-ticket]'), shown = '', typing = 0, seen = false;
  function stamp() { var o = nowParts(); $('[data-tkdate]').textContent = o.day + '.' + o.month + '.' + o.year + ' · ' + ((+o.hour) % 24 < 10 ? '0' : '') + ((+o.hour) % 24) + ':' + o.minute; }
  function write(instant) {
    var target = compose();
    wasend.href = 'https://wa.me/972544663449?text=' + encodeURIComponent(target);
    send.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subject()) + '&body=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !seen) { shown = target; msgEl.textContent = target; ticket.classList.remove('typing'); return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    ticket.classList.add('typing');
    if (ticket.animate) ticket.animate([{ transform: 'translateY(-10px)' }, { transform: 'translateY(0)' }], { duration: 260, easing: 'cubic-bezier(.23,1,.32,1)' });
    (function stp(t) {
      var n = Math.floor((t - t0) / 14);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(stp); else ticket.classList.remove('typing');
    })(t0);
  }
  watch($('[data-panel]'), function (v) {
    if (v && !seen) { seen = true; stamp(); ticket.classList.add('out'); lightStep(0); shown = ''; msgEl.textContent = ''; setTimeout(function () { write(); }, still() ? 0 : 450); }
  }, { threshold: .3 });

  // ---------------------------------------------------------------- service areas light one after another
  var towns = $$('[data-towns] li'), townI = 0, townVis = false;
  watch($('[data-contact]'), function (v) { townVis = v; });
  setInterval(function () { if (!townVis || still()) { towns.forEach(function (t) { t.classList.remove('lit'); }); return; } towns.forEach(function (t, i) { t.classList.toggle('lit', i === townI); }); townI = (townI + 1) % towns.length; }, 1500);

  // ---------------------------------------------------------------- footer: the curtain, the logo out of its own pixels, embers off the red base
  var footEl = $('[data-foot]'), mainEl = $('#main'), dock = $('[data-dock]'), flogo = $('[data-flogo]');
  var foot = (function () {
    var cv = $('[data-ffield]'), c = cv.getContext('2d'), P = [], E = [], w = 1, h = 1, raf = 0, vis = false, t0 = 0, started = false, ok = false, lr = null;
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = footEl.clientWidth; h = footEl.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function logoRect() { var fr = footEl.getBoundingClientRect(), r = flogo.getBoundingClientRect(); return { x: r.left - fr.left, y: r.top - fr.top, w: r.width, h: r.height }; }
    function sample() {
      try {
        var s = 90, sh = Math.round(s * 450 / 400), sc = document.createElement('canvas'); sc.width = s; sc.height = sh;
        var sx = sc.getContext('2d'); sx.drawImage(flogo, 0, 0, s, sh);
        var d = sx.getImageData(0, 0, s, sh).data; P = [];
        for (var y = 0; y < sh; y++) for (var x = 0; x < s; x++) { var k = (y * s + x) * 4; if (d[k + 3] < 160) continue; P.push({ hx: x / s, hy: y / sh, col: 'rgb(' + d[k] + ',' + d[k + 1] + ',' + d[k + 2] + ')', x: Math.random() * w, y: h + Math.random() * 80, dl: Math.random() * .5 }); }
        if (P.length > 1600) P = P.filter(function (_, i) { return i % Math.ceil(P.length / 1600) === 0; });
        ok = true;
      } catch (e) { ok = false; }
    }
    function frame(t) {
      raf = 0; if (still() || !vis) { c.clearRect(0, 0, w, h); return; }
      var T = (t - t0) / 1000; lr = logoRect();
      c.clearRect(0, 0, w, h);
      if (ok && T < 2.2) {
        var fade = 1 - smooth((T - 1.5) / .7);
        for (var i = 0; i < P.length; i++) { var p = P[i], a = smooth((T - p.dl) / 1.1); c.globalAlpha = fade; c.fillStyle = p.col; c.fillRect(lerp(p.x, lr.x + p.hx * lr.w, a) - 1, lerp(p.y, lr.y + p.hy * lr.h, a) - 1, 2.2, 2.2); }
        c.globalAlpha = 1;
        if (T > 1.2) flogo.classList.add('on');
      } else flogo.classList.add('on');
      // embers rise off the two slopes of the red base, as in the name
      if (T > 1) {
        if (E.length < (phone() ? 40 : 70)) { var u = Math.random(), side = Math.random() < .5 ? -1 : 1, bx = .5 + side * u * .325, by = .533 + u * .1; E.push({ x: lr.x + bx * lr.w, y: lr.y + by * lr.h, vx: side * (.1 + Math.random() * .3), vy: -(.5 + Math.random() * 1), s: .8 + Math.random() * 1.8, ph: Math.random() * 6.28, life: 1 }); }
        c.globalCompositeOperation = 'lighter';
        for (var j = E.length - 1; j >= 0; j--) {
          var e = E[j]; e.vx += Math.sin(T * 3 + e.ph) * .02; e.x += e.vx; e.y += e.vy; e.life -= .009;
          if (e.life <= 0) { E.splice(j, 1); continue; }
          var fl = .5 + .5 * Math.sin(T * 9 + e.ph);
          c.fillStyle = 'rgba(255,' + (90 + Math.round(90 * fl)) + ',40,' + (e.life * (.5 + .4 * fl)).toFixed(3) + ')';
          c.beginPath(); c.arc(e.x, e.y, e.s, 0, 6.283); c.fill();
        }
        c.globalCompositeOperation = 'source-over';
      }
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && vis && !still()) { if (!started) { started = true; size(); sample(); t0 = performance.now(); } raf = requestAnimationFrame(frame); } }
    watch(footEl, function (v) { vis = v; if (v) kick(); });
    return { size: function () { size(); }, kick: kick };
  })();
  function curtain() {
    footEl.classList.remove('curtain'); mainEl.style.marginBottom = '';
    var fh = footEl.offsetHeight;
    if (!still() && fh < innerHeight * .9) { footEl.classList.add('curtain'); mainEl.style.marginBottom = fh + 'px'; }
  }

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // the hero dims and settles back as the cold side lands over it
    var cv = calm ? 0 : clamp(scrollY / (vh * .56), 0, 1);
    zone.style.transform = calm ? '' : 'scale(' + (1 - cv * .06).toFixed(4) + ')';
    zone.style.opacity = calm ? '' : (1 - cv * .45).toFixed(3);
    spinUpdate(calm);
    // the element heats as it comes up the screen
    var br = band.getBoundingClientRect();
    heatH = calm ? 1 : smooth((vh - br.top) / (vh * .85));
    band.style.setProperty('--h', heatH.toFixed(3));
    degEl.textContent = Math.round(20 + 230 * heatH) + '°';
    if (heatH > .05) embers.kick();
    // on phones the plate leans with the scroll
    if (!fine && !calm) { var pr = pwrap.getBoundingClientRect(), y = clamp((pr.top + pr.height / 2 - vh / 2) / vh, -.6, .6); plateTilt(0, y * .8); plate.style.setProperty('--sh', (-30 - y * 80).toFixed(1) + '%'); }
    else if (calm) { plate.style.transform = ''; }
    // the footer horizon rises as the page lifts
    var mb = mainEl.getBoundingClientRect().bottom, fh = footEl.offsetHeight, fp = calm ? 1 : clamp((vh - mb) / Math.max(1, fh), 0, 1);
    footEl.style.setProperty('--rise', ((1 - fp) * 90).toFixed(1) + 'px');
    dock.classList.toggle('away', footEl.getBoundingClientRect().top < vh * .45);
  }

  function layout() {
    W0 = zone.clientWidth; H0 = zone.clientHeight;
    seamApply(); field.size(); mist.size(); embers.size(); foot.size(); curtain(); tick();
  }
  var rz, lastW = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); lastW = innerWidth; }, 140); });
  addEventListener('scroll', tick, { passive: true });

  renderAll(); texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); seamKick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 300);
  addEventListener('load', function () { layout(); });
})();
