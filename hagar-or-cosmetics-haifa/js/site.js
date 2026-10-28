(function () {
  var root = document.documentElement, WA = '972528946017';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var TITLE = { he: 'הגר אור · קוסמטיקה הוליסטית · איינשטיין 45א, חיפה', en: 'Hagar Or · Holistic cosmetics · 45A Einstein St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור הגר אור קוסמטיקה הוליסטית · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Hagar Or Holistic Cosmetics · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'הגר אור קוסמטיקה הוליסטית', 'Hagar Or Holistic Cosmetics');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-call]', 'התקשרו להגר, 052-894-6017', 'Call Hagar, 052-894-6017');
    aria('[data-t-candles]', 'ארבעת האורות', 'The four lights');
    aria('[data-t-tabs]', 'ביקורות', 'Reviews');
    aria('[data-t-topic]', 'על מה', 'What about');
    aria('[data-t-days]', 'איזה יום', 'Which day');
    $('[data-t-map]').title = l === 'he' ? 'מפה: איינשטיין 45א, חיפה' : 'Map: 45A Einstein St, Haifa';
    $$('.co').forEach(function (c) { if (c.classList.contains('on') || still()) $('b', c).textContent = c.dataset[l]; });
    days();
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ho-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('ho-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('.co').forEach(function (c) { c.classList.add('on'); $('b', c).textContent = c.dataset[root.lang]; });
    $('[data-word]').classList.add('in');
    layout(); hero.kick(); room.kick(); fog.reset(true); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 18.5], 1: [9, 17], 2: [11, 18.5], 3: [9, 17], 4: [9, 17], 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], shortEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: shortEn.indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
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
    $('.t-hours').classList.toggle('open', open);
    $('[data-dkflame]').classList.toggle('open', open);
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // consecutive days with the same hours share a row; the week starts on Sunday
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], ds = [], k; for (k = r[0]; k <= r[1]; k++) ds.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + ds.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 70 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- letters: the name fills in out of a blur
  function split(sp, start) {
    var i = start || 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  }
  $$('[data-split] .ln > span[lang]').forEach(function (sp) { split(sp, sp.closest('.ln').previousElementSibling ? 4 : 0); });
  $$('[data-word] > span[lang]').forEach(function (sp) { split(sp, 0); });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), dock = $('[data-dock]');

  // ---------------------------------------------------------------- hero: gold motes, the logo's drops out of its own pixels, the steam seam
  hero = (function (el) {
    var cv = $('[data-motes]'), c = cv.getContext('2d'), sv = $('[data-steam]'), s = sv.getContext('2d');
    var img = $('[data-marksrc]'), slot = $('[data-markslot]'), vis = $('[data-tilt]'), bg = $('[data-hbg] img');
    var lastW = 0, w, h, sw, sh, M = [], P = [], S = [], raf = 0, on = true, t0 = performance.now(), px = -999, py = -999, tx = 0, ty = 0, ax = 0, ay = 0, ok = false;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1);
      w = el.clientWidth; h = el.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      sw = el.clientWidth; sh = sv.clientHeight; sv.width = sw; sv.height = sh;   // steam is soft; 1x is plenty
      if (w === lastW && M.length) { target(); return; } lastW = w;
      var n = phone() ? 38 : 70; M = [];
      for (var i = 0; i < n; i++) M.push({ x: Math.random() * w, y: Math.random() * h, r: 1.2 + Math.random() * Math.random() * 4.5, v: 6 + Math.random() * 16, ph: Math.random() * 6.28, a: .25 + Math.random() * .55, g: 0 });
      var m = phone() ? 16 : 26; S = [];
      for (var k = 0; k < m; k++) S.push({ x: Math.random() * sw, y: sh * (.45 + Math.random() * .7), r: sh * (.22 + Math.random() * .3), v: 8 + Math.random() * 14, ph: Math.random() * 6.28, dx: 0 });
      target();
    }
    function sample() {
      try {
        var iw = 140, ih = 80, sc = document.createElement('canvas'); sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data; P = [];
        var stp = phone() ? 2 : 1.5;
        for (var y = 0; y < ih; y += stp) for (var x = 0; x < iw; x += stp) {
          var k = (Math.round(y) * iw + Math.round(x)) * 4, r = d[k], g = d[k + 1], b = d[k + 2];
          var dk = (d[0] + d[1] + d[2]) - (r + g + b);   // darker than the label's paper = ink of the logo
          if (dk > 110) P.push({ u: x / iw, v: y / ih, col: 'rgba(' + (g - r > 20 ? '120,212,200' : '170,226,216') + ',' + clamp(dk / 220, .6, 1).toFixed(2) + ')', x: Math.random() * w, y: h * (.4 + Math.random() * .6), vx: 0, vy: 0, dl: Math.random() * .5 });
        }
        ok = P.length > 20; target();
      } catch (e) { ok = false; }
    }
    var T = { x: 0, y: 0, s: 1 };
    function target() {
      var hr = el.getBoundingClientRect(), r = slot.getBoundingClientRect();
      T.s = r.width / 140; T.x = r.left - hr.left; T.y = r.top - hr.top + (r.height - 80 * T.s) / 2;
    }
    function frame(now) {
      raf = 0; var calm = still(), t = (now - t0) / 1000;
      c.clearRect(0, 0, w, h);
      // motes of forest light: drift up and sway; near the hand they gather and brighten
      c.globalCompositeOperation = 'lighter';
      for (var i = 0; i < M.length; i++) {
        var m = M[i];
        if (!calm) {
          m.y -= m.v * .016; m.x += Math.sin(t * .6 + m.ph) * .25;
          if (m.y < -10) { m.y = h + 10; m.x = Math.random() * w; }
          var dx = px - m.x, dy = py - m.y, d2 = dx * dx + dy * dy;
          if (d2 < 26000) { m.x += dx * .012; m.y += dy * .012; m.g = Math.min(1, m.g + .08); } else m.g *= .96;
        }
        var rr = m.r * (1 + m.g * 1.2), a = m.a * (.7 + .3 * Math.sin(t * 1.4 + m.ph)) + m.g * .4;
        var gr = c.createRadialGradient(m.x, m.y, 0, m.x, m.y, rr * 3);
        gr.addColorStop(0, 'rgba(255,222,165,' + clamp(a, 0, 1).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,190,120,0)');
        c.fillStyle = gr; c.beginPath(); c.arc(m.x, m.y, rr * 3, 0, 6.283); c.fill();
      }
      c.globalCompositeOperation = 'source-over';
      // the logo's three drops gather out of their own teal pixels
      if (ok) {
        var sz = Math.max(1.8, T.s * (phone() ? 1.9 : 1.45));
        for (var j = 0; j < P.length; j++) {
          var p = P[j], gx = T.x + p.u * 140 * T.s, gy = T.y + p.v * 80 * T.s;
          if (calm) { p.x = gx; p.y = gy; }
          else {
            var e = smooth((t - .1 - p.dl) / 1.1);
            if (e < 1) { if (p.sx === undefined) { p.sx = p.x; p.sy = p.y; } p.x = lerp(p.sx, gx, e); p.y = lerp(p.sy, gy, e) - Math.sin(e * Math.PI) * 30; }
            else {
              gx += Math.sin(t * 1.2 + j) * .35; gy += Math.cos(t + j) * .35;
              var ddx = p.x - px, ddy = p.y - py, dd = ddx * ddx + ddy * ddy;
              if (dd < 4000) { var f = (4000 - dd) / 4000 * 2.2, q = Math.sqrt(dd) || 1; p.vx += ddx / q * f; p.vy += ddy / q * f; }
              p.vx += (gx - p.x) * .07; p.vy += (gy - p.y) * .07; p.vx *= .8; p.vy *= .8; p.x += p.vx; p.y += p.vy;
            }
          }
          c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, sz / 2, 0, 6.283); c.fill();
        }
        c.globalAlpha = 1;
      }
      // steam rising off the bottom of the hero; leaving the hero it thickens into the clay of the next section
      var hr = el.getBoundingClientRect(), leave = clamp(-hr.top / (hr.height * .5), 0, 1);
      s.clearRect(0, 0, sw, sh);
      if (!calm) {
        for (var k = 0; k < S.length; k++) {
          var q2 = S[k]; q2.y -= q2.v * .016; q2.x += Math.sin(t * .3 + q2.ph) * .3;
          var ex = q2.x - px, ey = (q2.y + (h - sh)) - py; if (ex * ex + ey * ey < 30000) q2.dx += (ex > 0 ? 1 : -1) * .6; q2.dx *= .95;
          if (q2.y < -q2.r * .6) { q2.y = sh + q2.r * .4; q2.x = Math.random() * sw; }
          var life = clamp((sh + q2.r * .4 - q2.y) / (sh * .9), 0, 1), al = Math.sin(life * Math.PI) * (.16 + leave * .28);
          var g2 = s.createRadialGradient(q2.x + q2.dx, q2.y, 0, q2.x + q2.dx, q2.y, q2.r);
          g2.addColorStop(0, 'rgba(240,222,214,' + al.toFixed(3) + ')'); g2.addColorStop(1, 'rgba(240,222,214,0)');
          s.fillStyle = g2; s.fillRect(q2.x + q2.dx - q2.r, q2.y - q2.r, q2.r * 2, q2.r * 2);
        }
        var g3 = s.createLinearGradient(0, sh * (1 - .25 - leave * .45), 0, sh);
        g3.addColorStop(0, 'rgba(214,180,168,0)'); g3.addColorStop(.72, 'rgba(214,180,168,' + (.08 + leave * .8).toFixed(3) + ')'); g3.addColorStop(1, 'rgba(214,180,168,1)');
        s.fillStyle = g3; s.fillRect(0, 0, sw, sh);
      }
      // her portrait leans toward the hand; on touch it sways by itself
      if (!calm) {
        var auto = !fine.matches || px < -900;
        var gxv = auto ? Math.sin(t * .5) * .5 : tx, gyv = auto ? Math.cos(t * .4) * .35 : ty;
        ax = lerp(ax, gxv, .06); ay = lerp(ay, gyv, .06);
        vis.style.transform = 'perspective(900px) rotateY(' + (ax * 8).toFixed(2) + 'deg) rotateX(' + (-ay * 6).toFixed(2) + 'deg)';
        bg.style.transform = 'translate3d(' + (-ax * 14).toFixed(1) + 'px,' + (-ay * 10 + (-hr.top) * .25).toFixed(1) + 'px,0)';
      } else { vis.style.transform = ''; bg.style.transform = ''; }
      if (!calm && on) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; tx = (e.clientX / innerWidth - .5) * 2; ty = (e.clientY / innerHeight - .5) * 2; });
    el.addEventListener('pointerleave', function () { px = py = -999; tx = ty = 0; });
    el.addEventListener('pointerdown', function (e) { var r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; M.forEach(function (m) { var d = Math.hypot(m.x - x, m.y - y); if (d < 200) m.g = 1; }); });
    watch(el, function (v) { on = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(sample, 0); else img.addEventListener('load', sample, { once: true });
    return { size: function () { size(); kick(); }, kick: kick, el: el };
  })(hero);

  // ---------------------------------------------------------------- callouts: labels decode onto the photographs
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'abcdefghijklmnopqrstuvwxyz' };
  function decode(co) {
    var b = $('b', co), l = root.lang, txt = co.dataset[l];
    co.classList.add('on');
    if (still()) { b.textContent = txt; return; }
    var t0 = performance.now(), g = GL[l];
    (function st(t) {
      var k = clamp((t - t0) / 650, 0, 1), n = Math.floor(k * txt.length), out = txt.slice(0, n);
      for (var i = n; i < txt.length; i++) out += txt[i] === ' ' ? ' ' : g[Math.floor(Math.random() * g.length)];
      b.textContent = k < 1 ? out : txt; if (k < 1 && root.lang === l) requestAnimationFrame(st); else b.textContent = co.dataset[root.lang];
    })(t0);
  }
  $$('[data-callouts]').forEach(function (f) {
    var cos = $$('.co', f);
    cos.forEach(function (co) { co.classList.toggle('flip', parseFloat(co.style.getPropertyValue('--x')) > 56); });
    if (still() || !io) { cos.forEach(function (co) { co.classList.add('on'); $('b', co).textContent = co.dataset[root.lang]; }); return; }
    new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { ob.disconnect(); cos.forEach(function (co, i) { setTimeout(function () { decode(co); }, 500 + i * 380); }); } }, { threshold: .45 }).observe(f);
  });

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
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- the room: four lights catch one by one and spread over the real photograph
  var room = (function () {
    var sec = $('[data-room]'), box = $('[data-rphoto]'), lit = $('[data-rlit]'), gl = $('[data-rglows]'), notes = $$('.note'), cds = $$('.cd');
    // where the lights are in her photo (fractions of 1280×960): small candle, the jar, the pillar candle, the teal lamp
    var L = [[.474, .41, 0], [.523, .40, 0], [.691, .37, 0], [.63, .26, 1]];
    var G = L.map(function (c) { var i = document.createElement('i'); if (c[2]) i.className = 'teal'; gl.appendChild(i); return i; });
    var raf = 0, on = false, pos = [];
    function place() {
      var W = box.clientWidth, Hh = box.clientHeight, sc = Math.max(W / 1280, Hh / 960), dw = 1280 * sc, dh = 960 * sc, ox = (W - dw) * .58, oy = (Hh - dh) * .5;
      pos = L.map(function (c) { return [ox + c[0] * dw, oy + c[1] * dh]; });
      G.forEach(function (g, i) { g.style.left = pos[i][0] + 'px'; g.style.top = pos[i][1] + 'px'; });
    }
    function k(p, i) { return smooth((p - .05 - i * .2) / .12); }
    function draw(t) {
      var calm = still(), p = calm ? 1 : prog(sec), W = box.clientWidth, Hh = box.clientHeight, big = Math.max(W, Hh);
      var fill = smooth((p - .86) / .12), masks = [], act = -1;
      L.forEach(function (c, i) {
        var ki = k(p, i); if (ki > .5) act = i;
        var fl = 1 + Math.sin(t * .011 + i * 2.1) * .03 + Math.sin(t * .027 + i) * .02;
        var r = (ki * big * (.16 + i * .02) + fill * big * .9) * fl;
        masks.push('radial-gradient(circle ' + Math.max(1, r).toFixed(1) + 'px at ' + pos[i][0].toFixed(1) + 'px ' + pos[i][1].toFixed(1) + 'px,#000 0,rgba(0,0,0,.85) 35%,transparent 100%)'); // taste-skill-ignore: candle/forest light (owner references)
        G[i].style.setProperty('--s', (big * (c[2] ? .5 : .3)).toFixed(0) + 'px');
        G[i].style.opacity = (ki * fl * (c[2] ? .7 : .9)).toFixed(3);
        cds[i].classList.toggle('lit', ki > .5);
      });
      if (!calm) { lit.style.webkitMaskImage = lit.style.maskImage = masks.join(','); }
      notes.forEach(function (n, i) { n.classList.toggle('on', calm || i === act); });
    }
    function frame(t) { raf = 0; draw(t); if (on && !still()) raf = requestAnimationFrame(frame); }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    watch(sec, function (v) { on = v; kick(); });
    cds.forEach(function (b, i) { b.addEventListener('click', function () {
      if (still()) return;
      var p = .05 + i * .2 + .13, y = sec.getBoundingClientRect().top + scrollY + p * (sec.offsetHeight - innerHeight);
      scrollTo({ top: y, behavior: 'smooth' });
    }); });
    return { place: function () { place(); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- products: the photo leans to the hand, the sun follows it, the gel bubbles
  var pst = $('[data-pstage]'), pph = $('[data-pphoto]'), bub = $('[data-bubbles]');
  for (var bi = 0; bi < 26; bi++) {
    var b = document.createElement('i'), big = Math.random() < .25;
    b.style.cssText = '--b:' + (big ? 7 + Math.random() * 5 : 3 + Math.random() * 3.5).toFixed(1) + 'px;--t:' + (3.5 + Math.random() * 4).toFixed(2) + 's;--dl:-' + (Math.random() * 7).toFixed(2) + 's;--w:' + ((Math.random() - .5) * 10).toFixed(1) + 'px;left:' + (8 + Math.random() * 80).toFixed(1) + '%';
    bub.appendChild(b);
  }
  pst.addEventListener('pointermove', function (e) {
    if (still() || !fine.matches) return;
    var r = pph.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    pph.style.transform = 'rotateY(' + ((x - .5) * 10).toFixed(2) + 'deg) rotateX(' + (-(y - .5) * 8).toFixed(2) + 'deg)';
    pph.style.setProperty('--sx', (x * 100).toFixed(1) + '%'); pph.style.setProperty('--sy', (y * 100).toFixed(1) + '%');
  });
  pst.addEventListener('pointerleave', function () { pph.style.transform = ''; });

  // ---------------------------------------------------------------- reviews: steam on the mirror, wiped to show each quote
  var fog = (function () {
    var mir = $('[data-mirror]'), cv = $('[data-fog]'), c = cv.getContext('2d'), tabs = $$('[data-tab]'), rvs = $$('.rv'), W, Hh, seen = false, anim = 0, cur = 0, down = false;
    function paint() {
      W = mir.clientWidth; Hh = mir.clientHeight; cv.width = W; cv.height = Hh;
      c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, W, Hh);
      c.fillStyle = 'rgba(226,204,198,.9)'; c.fillRect(0, 0, W, Hh);
      for (var i = 0; i < 60; i++) {   // a little unevenness, like breath on glass
        var x = Math.random() * W, y = Math.random() * Hh, r = 30 + Math.random() * 120, g = c.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, Math.random() < .5 ? 'rgba(255,245,240,.35)' : 'rgba(190,160,160,.22)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
      }
      for (var d = 0; d < 26; d++) { c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(Math.random() * W, Math.random() * Hh, 1 + Math.random() * 2.5, 0, 6.283); c.fill(); }
    }
    function wipe(x, y, r) {
      c.globalCompositeOperation = 'destination-out';
      var g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.6, 'rgba(0,0,0,.9)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
    }
    function sweep() {   // a hand wipes the mirror in three wide passes
      cancelAnimationFrame(anim);
      var t0 = performance.now(), dur = 1300, r = Math.max(90, Hh / 3), last = 0;
      (function st(t) {
        var u = clamp((t - t0) / dur, 0, 1);
        for (var s = last; s <= u; s += .004) {
          var row = Math.min(2, Math.floor(s * 3)), f = s * 3 - row, dir = row % 2 ? -1 : 1;
          if (rtl()) dir = -dir;
          var x = dir > 0 ? lerp(-r * .3, W + r * .3, f) : lerp(W + r * .3, -r * .3, f);
          wipe(x, (row + .5) * Hh / 3 + Math.sin(f * 6) * 14, r * 1.05);
        }
        last = u;
        if (u < 1) anim = requestAnimationFrame(st); else { c.clearRect(0, 0, W, Hh); }
      })(t0);
    }
    function show(i) {
      cur = i;
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
      if (still()) { rvs.forEach(function (r, k) { r.classList.toggle('on', k === i); }); return; }
      cancelAnimationFrame(anim); paint(); cv.style.opacity = 0;
      cv.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: 'ease-out' }).onfinish = function () {
        cv.style.opacity = 1; rvs.forEach(function (r, k) { r.classList.toggle('on', k === i); }); setTimeout(sweep, 120);
      };
    }
    tabs.forEach(function (t, i) { t.addEventListener('click', function () { show(i); }); });
    cv.addEventListener('pointerdown', function (e) { down = true; var r = cv.getBoundingClientRect(); wipe(e.clientX - r.left, e.clientY - r.top, 60); });
    cv.addEventListener('pointermove', function (e) { if (!down && e.pointerType !== 'mouse') return; var r = cv.getBoundingClientRect(); wipe(e.clientX - r.left, e.clientY - r.top, down ? 60 : 40); });
    addEventListener('pointerup', function () { down = false; });
    watch(mir, function (v) { if (v && !seen && !still()) { seen = true; setTimeout(sweep, 350); } }, { threshold: .5 });
    function reset(clear) { cancelAnimationFrame(anim); if (still() || clear && seen) { c.clearRect(0, 0, cv.width, cv.height); return; } if (!seen) paint(); }
    return { reset: reset, size: function () { if (!seen && !still()) paint(); else { cv.width = mir.clientWidth; cv.height = mir.clientHeight; } } };
  })();

  // ---------------------------------------------------------------- write: a drop for the topic, a day on the candle ring, the note writes itself
  var ring = $('[data-days]'), drops = $$('[data-topic]'), msgEl = $('[data-msg]'), chat = $('[data-chat]'), steps = $$('[data-step]'), day = -1, shown = '', typing = 0, chatSeen = false;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function days() {
    $$('.dayb', ring).forEach(function (b) { b.remove(); });
    var l = he();
    for (var i = 0; i < 7; i++) {
      var a = -Math.PI / 2 + i * Math.PI * 2 / 7 , x = 50 + Math.cos(a) * 40, y = 50 + Math.sin(a) * 40, open = !!H[i];
      var b = document.createElement('button'); b.type = 'button'; b.className = 'dayb'; b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', i === day ? 'true' : 'false'); b.style.setProperty('--x', x + '%'); b.style.setProperty('--y', y + '%');
      b.innerHTML = '<svg aria-hidden="true"><use href="#i-flame"/></svg><span>' + (l ? shortHe : shortEn)[i] + '</span>' + (open ? '' : '<small>' + (l ? 'סגור' : 'closed') + '</small>');
      b.setAttribute('aria-label', (l ? dayHe : dayEn)[i] + (open ? '' : l ? ', סגור' : ', closed'));
      if (!open) b.disabled = true;
      (function (k) { b.addEventListener('click', function () { day = day === k ? -1 : k; $$('.dayb', ring).forEach(function (x, j) { x.setAttribute('aria-checked', j === day ? 'true' : 'false'); }); lightStep(1); write(); }); })(i);
      ring.appendChild(b);
    }
  }
  drops.forEach(function (d) { d.addEventListener('click', function () { drops.forEach(function (x) { x.setAttribute('aria-checked', x === d ? 'true' : 'false'); }); lightStep(0); write(); }); });
  $('[data-send]').addEventListener('pointerenter', function () { lightStep(2); });
  $('[data-send]').addEventListener('focus', function () { lightStep(2); });
  function compose() {
    var l = he(), t = drops.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0].dataset.topic, d = day >= 0 ? (l ? dayHe : dayEn)[day] : '';
    if (l) {
      if (t === 'face') return 'היי הגר, אשמח לקבוע טיפול פנים. ' + (d ? 'יום ' + d + ' נוח לי, יש לך מקום?' : 'מתי יש לך מקום?');
      return (t === 'prod' ? 'היי הגר, אשמח לשמוע על המוצרים שאת מייצרת.' : 'היי הגר, יש לי שאלה על העור שלי.') + (d ? ' אפשר לדבר ביום ' + d + '?' : '');
    }
    if (t === 'face') return 'Hi Hagar, I’d like to book a facial. ' + (d ? d + ' works for me, do you have a slot?' : 'When do you have a slot?');
    return (t === 'prod' ? 'Hi Hagar, I’d love to hear about the products you make.' : 'Hi Hagar, I have a question about my skin.') + (d ? ' Could we talk on ' + d + '?' : '');
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    chat.classList.add('typing');
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st); else chat.classList.remove('typing');
    })(t0);
  }
  watch(chat, function (v) { if (v && !chatSeen) { chatSeen = true; lightStep(0); if (!still()) { shown = ''; msgEl.textContent = ''; } write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- bento spotlight
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- footer: a curtain under the page, the name rises
  var foot = $('[data-foot]'), page = $('.page'), word = $('[data-word]');
  function curtain() {
    foot.classList.remove('curtain'); page.style.marginBottom = '';
    var fh = foot.offsetHeight;
    if (fh < innerHeight * .85) { foot.classList.add('curtain'); page.style.marginBottom = fh + 'px'; }
  }

  // ---------------------------------------------------------------- one scroll loop
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), y = scrollY, vh = innerHeight;
    nav.classList.toggle('pill', y > 40);
    var nearEnd = y + vh > document.documentElement.scrollHeight - foot.offsetHeight * .6;
    dock.classList.toggle('show', y > hero.el.offsetHeight * .55);
    if (nearEnd) word.classList.add('in'); else if (!calm && y + vh < document.documentElement.scrollHeight - foot.offsetHeight * 1.2) word.classList.remove('in');
    if (!calm) { hero.kick(); room.kick(); }
    if (!fine.matches && !calm) {   // touch: the sun crosses her bottles with the scroll
      var r = pph.getBoundingClientRect(), u = clamp((vh - r.top) / (vh + r.height), 0, 1);
      pph.style.setProperty('--sx', (lerp(85, 15, u)).toFixed(1) + '%'); pph.style.setProperty('--sy', (lerp(10, 45, u)).toFixed(1) + '%');
    }
  }

  function layout() { hero.size(); room.place(); fog.size(); curtain(); var bh = bub.clientHeight; bub.style.setProperty('--h', bh + 'px'); $$('i', bub).forEach(function (i) { i.style.setProperty('--h', bh + 'px'); }); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (innerWidth !== lw || !phone()) { lw = innerWidth; layout(); } }, 150); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  if (still()) word.classList.add('in');
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.el.classList.add('ready'); layout(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 250);
  addEventListener('load', function () { layout(); });
})();
