(function () {
  var root = document.documentElement, WA = '972522983263', MAIL = 'rachelbe60@gmail.com';
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
  var TITLE = { he: "רוחל'ה · קוסמטיקה פרא־רפואית · קאודרס 10, חיפה", en: 'Ruhale · Paramedical skin care · 10 Kauders St, Haifa' };
  var CONCEPT = { he: "קונספט לדוגמה שנבנה עבור רוחל'ה קוסמטיקה · זה אינו האתר הרשמי של העסק", en: 'A sample concept built for Ruhale Cosmetics · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    var H = l === 'he';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[H ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', H ? h : e); }); };
    aria('[data-t-brand]', "רוחל'ה – אסתטיקה וקוסמטיקה פרא רפואית", 'Ruhale – paramedical aesthetics and cosmetics');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-open]', 'הקליניקה', 'The clinic');
    aria('[data-t-call]', 'התקשרו לרחל, 052-298-3263', 'Call Rachel, 052-298-3263');
    aria('[data-t-wa]', 'וואטסאפ לרחל', 'WhatsApp Rachel');
    aria('[data-t-wipe]', 'לפני ואחרי: גררו כדי להשוות', 'Before and after: drag to compare');
    aria('[data-t-cases]', 'סוג הטיפול', 'Type of treatment');
    aria('[data-t-rail]', 'ביקורות מגוגל', 'Google reviews');
    $$('[data-t-map]').forEach(function (f) { f.title = H ? 'מפת Google: קאודרס 10, חיפה' : 'Google Maps: 10 Kauders St, Haifa'; });
    $('[data-lb]').textContent = H ? 'לפני' : 'Before';
    $('[data-la]').textContent = H ? 'אחרי' : 'After';
    $$('.dec').forEach(function (d) { d.textContent = d.dataset[l]; });
    days();
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('rc242-lang', l); } catch (e) {}
    texts(l); hours(); split(); write(true); wipeTo(wipeV); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('rc242-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $('.revs').classList.add('in');
    $('[data-hero]').classList.add('ready');
    clearStyles(); layout(); petals.kick(); arc.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 18], 1: [9, 18], 2: null, 3: [9, 18], 4: [9, 18], 5: [8.5, 13], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    var always = Object.keys(H).every(function (k) { return H[k] && H[k][0] === 0 && H[k][1] === 24; });
    if (always) { open = true; txt = l ? 'פתוח 24/7' : 'Open 24/7'; }
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
      var t = H[r[0]], ds = [], k; for (k = r[0]; k <= r[1]; k++) ds.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + ds.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- headline split letter by letter; last word of the accent line is the serif word
  function split() {
    var i = 0;
    $$('[data-split] .ln > span[lang]').forEach(function (sp) {
      if (!sp.dataset.src) sp.dataset.src = sp.textContent;
      var words = sp.dataset.src.split(' '), acc = sp.parentNode.classList.contains('acc');
      if (sp.lang !== root.lang) return;
      sp.innerHTML = words.map(function (w, wi) {
        var inner = w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('');
        return '<span class="w' + (acc && wi === words.length - 1 ? ' em' : '') + '">' + inner + '</span>';
      }).join(' ');
    });
    // the seam line fills letter by letter as the lens opens
    $$('[data-fill] > span[lang]').forEach(function (sp) {
      if (sp.lang !== root.lang || sp.dataset.done) return; sp.dataset.done = 1;
      var k = 0;
      (function walk(node) {
        [].slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var f = document.createDocumentFragment();
            n.textContent.split('').forEach(function (c) { if (c === ' ') { f.appendChild(document.createTextNode(' ')); return; } var s = document.createElement('span'); s.className = 'ch'; s.dataset.k = k++; s.textContent = c; f.appendChild(s); });
            n.parentNode.replaceChild(f, n);
          } else walk(n);
        });
      })(sp);
      sp.dataset.n = k;
    });
  }

  var hero = $('[data-hero]'), nav = $('[data-nav]'), stage = $('[data-stage]');

  // ---------------------------------------------------------------- the ring lamp's LEDs
  function beads(box, n, attr) { box.innerHTML = ''; for (var k = 0; k < n; k++) { var i = document.createElement('i'); i.style.setProperty('--a', (k * 360 / n) + 'deg'); i.style.setProperty('--k', k); box.appendChild(i); } }
  beads($('[data-leds]'), 44);
  var lampLeds = $('[data-lampleds]'); beads(lampLeds, 56);
  function lampR() { var lp = $('[data-lamp]'); lampLeds.style.setProperty('--rr', (-(lp.clientWidth / 2) + 9) + 'px'); $$('i', lampLeds).forEach(function (i) { i.style.transform = 'rotate(' + i.style.getPropertyValue('--a') + ') translateY(' + (-(lp.clientWidth / 2) + 9) + 'px)'; }); }

  // light on the glass follows the hand (or drifts by itself on touch)
  var glint = $('[data-glint]'), lensBox = $('.lens');
  hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = lensBox.getBoundingClientRect(); glint.style.setProperty('--gx', clamp((e.clientX - r.left) / r.width * 100, -20, 120) + '%'); glint.style.setProperty('--gy', clamp((e.clientY - r.top) / r.height * 100, -20, 120) + '%'); });

  // ---------------------------------------------------------------- petals that gather into the logo's own R
  var petals = (function () {
    var cv = $('[data-petals]'), c = cv.getContext('2d'), img = $('[data-rsrc]');
    var P = [], F = [], w, h, raf = 0, vis = true, t0 = 0, mx = -999, my = -999, ok = false, box = { x: 0, y: 0, s: 0 };
    var COLS = ['#da4620', '#e8714d', '#f0a184', '#c69a5c', '#e3593a'], RC = ['#da4620', '#da4620', '#e3593a', '#c8401c', '#ea6c45'];
    function sample() {
      try {
        var sc = document.createElement('canvas'), S = 200; sc.width = S; sc.height = S;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, S, S);
        var d = sx.getImageData(0, 0, S, S).data, pts = [];
        for (var y = 0; y < S; y += 2) for (var x = 0; x < S; x += 2) { var k = (y * S + x) * 4; if (d[k] > 150 && d[k + 1] < 140 && d[k + 2] < 120) pts.push([x / S, y / S]); }
        var want = phone() ? 520 : 1100, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) { var q = pts[Math.floor(f)]; P.push({ hx: q[0], hy: q[1], x: Math.random(), y: Math.random() * .3 - .3, vx: 0, vy: 0, ph: Math.random() * 6.28, dl: Math.random() * .6, rot: Math.random() * 6.28, sz: 1.8 + Math.random() * 2.4, col: RC[Math.floor(Math.random() * RC.length)], rx: Math.random() - .5, ry: Math.random() }); }
        F = []; for (var j = 0; j < (phone() ? 14 : 26); j++) F.push({ x: Math.random(), y: Math.random(), s: .2 + Math.random() * .5, ph: Math.random() * 6.28, sz: 4 + Math.random() * 5, col: COLS[j % COLS.length] });
        ok = true;
      } catch (e) { ok = false; }
    }
    function size() {
      dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      var hr = hero.getBoundingClientRect(), sr = stage.getBoundingClientRect(), L = $('.loupe').offsetWidth;
      box.s = L * (phone() ? .5 : .66);
      var outer = rtl() ? -1 : 1;   // the R floats at the stage's outer upper corner, overlapping the lamp's rim
      var cx = sr.left - hr.left + sr.width / 2, cy = sr.top - hr.top + sr.height / 2;
      if (phone()) { box.x = cx + (rtl() ? -1 : 1) * L * .42 - box.s / 2; box.y = cy - L * .78; }
      else { box.x = cx - outer * L * .62 - box.s / 2; box.y = cy - L * .78; }   // desktop: in the light between the lamp and the name
    }
    var dpr = 1;
    function petal(x, y, s, r, col, a) {
      var co = Math.cos(r) * dpr, si = Math.sin(r) * dpr;
      c.setTransform(co, si, -si, co, x * dpr, y * dpr); c.globalAlpha = a; c.fillStyle = col;
      c.beginPath(); c.moveTo(0, -s); c.quadraticCurveTo(s * 1.1, 0, 0, s); c.quadraticCurveTo(-s * 1.1, 0, 0, -s); c.fill();
    }
    function frame(now) {
      raf = 0; if (!ok) return;
      var calm = still(), T = (now - t0) / 1000;
      var hr = hero.getBoundingClientRect(), burst = calm ? 0 : clamp(-hr.top / (hr.height * .6), 0, 1.3);
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
      // loose petals drifting through the light
      for (var j = 0; j < F.length; j++) {
        var f = F[j], fx = ((f.x * w + T * 14 * f.s * (rtl() ? -1 : 1)) % w + w) % w, fy = ((f.y * h + T * 22 * f.s) % h + h) % h;
        petal(fx + Math.sin(T * .8 + f.ph) * 18, fy, f.sz, T * .6 + f.ph, f.col, calm ? .35 : .45);
      }
      for (var i = 0; i < P.length; i++) {
        var p = P[i], a = calm ? 1 : smooth((T - .2 - p.dl) / 1.2);
        var tx = box.x + p.hx * box.s + Math.sin(T * 1.1 + p.ph) * 1.6, ty = box.y + p.hy * box.s + Math.cos(T * .9 + p.ph) * 1.6;
        if (burst > 0) { tx += p.rx * burst * w * .7; ty += p.ry * burst * h * 1.2; }
        if (calm) { p.x = tx; p.y = ty; }
        else if (a < 1) { if (p.sx === undefined) { p.sx = p.x * w; p.sy = p.y * h; } p.x = lerp(p.sx, tx, a); p.y = lerp(p.sy, ty, a); }
        else {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 6400) { var fo = (6400 - d2) / 6400 * 2.4, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * fo; p.vy += dy / dd * fo; }
          p.vx += (tx - p.x) * .05; p.vy += (ty - p.y) * .05; p.vx *= .84; p.vy *= .84; p.x += p.vx; p.y += p.vy;
        }
        petal(p.x, p.y, p.sz * (phone() ? .75 : 1), p.rot + (calm ? 0 : T * .3), p.col, .85 * (1 - clamp(burst, 0, 1) * .6));
      }
      c.globalAlpha = 1;
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() { sample(); size(); t0 = performance.now(); kick(); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; setTimeout(function () { mx = my = -999; }, 500); });
    watch(hero, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // ---------------------------------------------------------------- her photos on an arc around the lamp: turns by itself, with the scroll, with a drag
  var arc = (function () {
    var wrap = $('[data-arcwrap]'), el = $('[data-arc]'), cards = $$('.ac', el), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = true, last = 0;
    function R() { return $('.loupe').offsetWidth * (phone() ? .8 : .9); }
    function frame(t) {
      raf = 0; if (still()) { el.style.transform = ''; return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (9 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var r = R(), sc = scrollY * .08 * (rtl() ? 1 : -1);
      el.style.transform = 'rotateX(-9deg)';
      cards.forEach(function (c, i) {
        var a = rot + sc + i * step, rad = a * Math.PI / 180, f = Math.cos(rad);
        c.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + r.toFixed(1) + 'px) rotateY(' + (-a * .35).toFixed(2) + 'deg)';
        c.style.opacity = (.35 + .65 * (f * .5 + .5)).toFixed(3);
        c.style.zIndex = Math.round(f * 100) + 100;
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .3; vel = dx * 2 * (rtl() ? 1 : -1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- entrances
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); if (e.target.classList.contains('dec')) decode(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile],.revs').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var care = $('#care'); watch(care, function (v) { care.classList.toggle('on', v); });
  var ba = $('[data-ba]'); watch(ba, function (v) { ba.classList.toggle('on', v); });

  // glyph-decode labels on Rachel's path
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת◦·', en: 'abcdefghijklmnopqrstuvwxyz◦·' };
  function decode(el) {
    var txt = el.dataset[root.lang]; if (still()) { el.textContent = txt; return; }
    var t0 = performance.now(), dur = 900;
    (function st(t) {
      var u = clamp((t - t0) / dur, 0, 1), n = Math.floor(u * txt.length);
      el.textContent = txt.slice(0, n) + txt.slice(n).split('').map(function (c) { var g = GL[root.lang]; return c === ' ' ? ' ' : g[Math.floor(Math.random() * g.length)]; }).join('');
      if (u < 1) requestAnimationFrame(st); else el.textContent = txt;
    })(t0);
  }
  $$('.dec').forEach(function (d) { rio ? rio.observe(d) : null; });

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

  // ---------------------------------------------------------------- story photo leans toward the hand
  var tilt = $('[data-tilt]');
  tilt.addEventListener('pointermove', function (e) { if (still() || e.pointerType !== 'mouse') return; var r = tilt.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; tilt.style.setProperty('--ty', (x * 8).toFixed(2) + 'deg'); tilt.style.setProperty('--tx', (-y * 6).toFixed(2) + 'deg'); });
  tilt.addEventListener('pointerleave', function () { tilt.style.setProperty('--ty', '0deg'); tilt.style.setProperty('--tx', '0deg'); });

  // ---------------------------------------------------------------- before / after inside the lamp
  var cmp = $('[data-cmp]'), wipe = $('[data-wipe]'), imgB = $('[data-b]'), imgA = $('[data-a]'), wipeV = 50, touched = false;
  function wipeTo(v) { wipeV = v; wipe.value = v; cmp.style.setProperty('--p', v + '%'); }
  wipe.addEventListener('input', function () { touched = true; wipeTo(+wipe.value); });
  var caseBtns = $$('[data-case]');
  caseBtns.forEach(function (b) { b.addEventListener('click', function () {
    if (b.getAttribute('aria-checked') === 'true') return;
    caseBtns.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); });
    var k = b.dataset.case, swap = function () { imgB.src = 'img/ba-' + k + '-before.jpg'; imgA.src = 'img/ba-' + k + '-after.jpg'; };
    if (still()) { swap(); return; }
    // the lens closes like an iris over its own dark glass, the photos change, it opens again: nothing else ever shows through
    cmp.style.setProperty('--iris', '0%');
    setTimeout(function () {
      swap();
      var done = 0, open = function () { if (++done === 2) requestAnimationFrame(function () { cmp.style.setProperty('--iris', '50%'); }); };
      [imgB, imgA].forEach(function (im) { if (im.complete) open(); else { im.addEventListener('load', open, { once: true }); im.addEventListener('error', open, { once: true }); } });
    }, 460);
  }); });
  // arrow keys on the radio group
  $('[data-cases]').addEventListener('keydown', function (e) {
    var i = caseBtns.indexOf(document.activeElement); if (i < 0) return;
    var fwd = (e.key === 'ArrowLeft' && rtl()) || (e.key === 'ArrowRight' && !rtl()) || e.key === 'ArrowDown', back = (e.key === 'ArrowRight' && rtl()) || (e.key === 'ArrowLeft' && !rtl()) || e.key === 'ArrowUp';
    if (!fwd && !back) return; e.preventDefault();
    var n = caseBtns[(i + (fwd ? 1 : -1) + caseBtns.length) % caseBtns.length]; n.focus(); n.click();
  });
  caseBtns.forEach(function (b) { b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1; b.addEventListener('click', function () { caseBtns.forEach(function (x) { x.tabIndex = x === b ? 0 : -1; }); }); });

  // ---------------------------------------------------------------- reviews drift with the scroll on desktop
  var rail = $('[data-rail]'), track = $('[data-track]');

  // ---------------------------------------------------------------- the enquiry card writes the message
  function days() {
    var box = $('[data-days]'), l = he(), names = l ? dayHe : dayEn, picked = $$('input:checked', box).map(function (i) { return i.value; });
    var opts = Object.keys(H).filter(function (k) { return H[k]; }).map(function (k) { return { v: k, he: dayHe[k], en: dayEn[k] }; });
    opts.push({ v: 'any', he: 'גמיש', en: 'Flexible' });
    box.innerHTML = opts.map(function (o) { return '<label><input type="radio" name="day" value="' + o.v + '" data-he="' + o.he + '" data-en="' + o.en + '"' + (picked.indexOf(o.v) >= 0 ? ' checked' : '') + '><i></i><span>' + (l ? o.he : o.en) + '</span></label>'; }).join('');
  }
  var msgEl = $('[data-msg]'), chat = $('[data-chat]'), shown = '', typing = 0, chatSeen = false, steps = $$('[data-step]');
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), c = $$('[data-concerns] input:checked').map(function (i) { return i.dataset[l ? 'he' : 'en']; }), d = $('[data-days] input:checked');
    var s = l ? 'שלום רחל, אשמח לתאם אבחון.' : 'Hi Rachel, I’d like to book a skin consultation.';
    if (c.length) s += l ? ' מה מטריד אותי: ' + list(c, true) + '.' : ' What bothers me: ' + list(c, false) + '.';
    if (d) s += d.value === 'any' ? (l ? ' הימים גמישים מבחינתי.' : ' I’m flexible on days.') : (l ? ' יום נוח לי: ' + d.dataset.he + '.' : ' A good day for me: ' + d.dataset.en + '.');
    return s;
  }
  function write(instant) {
    var target = compose();
    $('[data-send-wa]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    $('[data-send-mail]').href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(he() ? 'תיאום אבחון' : 'Booking a consultation') + '&body=' + encodeURIComponent(target);
    cancelAnimationFrame(typing); chat.classList.remove('typing');
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
  $('[data-intake]').addEventListener('change', function (e) {
    var fs = e.target.closest('fieldset'); if (fs) fs.classList.add('on');
    write();
  });
  $$('[data-send-wa],[data-send-mail]').forEach(function (a) { a.addEventListener('pointerenter', function () { steps[2].classList.add('on'); }); a.addEventListener('focus', function () { steps[2].classList.add('on'); }); });
  watch(chat, function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var open = $('[data-open]'), ophoto = $('[data-ophoto]'), opin = $('.o-pin'), fillSpans = function () { return $$('[data-fill] > span[lang="' + root.lang + '"] .ch'); };
  var room = $('[data-room]'), shots = $$('[data-shot]'), rsteps = $$('[data-rsteps] li'), rlight = $('[data-rlight]'), rquote = $('[data-rquote]');
  var visit = $('[data-visit]'), vphoto = $('[data-vphoto]'), vcards = $('[data-vcards]'), fring = $('.f-ring'), sheen = $('.sheen');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function clearStyles() {
    [ophoto, opin, rlight, rquote, vphoto, vcards, track, cmp].forEach(function (e) { e.removeAttribute('style'); });
    cmp.style.setProperty('--p', wipeV + '%');
    shots.forEach(function (s) { s.removeAttribute('style'); });
    fillSpans().forEach(function (s) { s.style.opacity = ''; });
  }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, vw = innerWidth;
    nav.classList.toggle('pill', scrollY > 40);
    if (calm) return;
    petals.kick(); arc.kick();
    // seam 1: the lens opens to the room
    var op = prog(open), big = Math.hypot(vw, vh) / 2 + 20, small = Math.min(vw, vh) * .36;
    var e1 = smooth(op / .62);
    opin.style.setProperty('--or', lerp(small, big, e1).toFixed(1) + 'px');
    opin.style.setProperty('--oo', (1 - smooth((e1 - .75) / .25)).toFixed(3));
    opin.style.setProperty('--os', lerp(1.25, 1, e1).toFixed(3));
    var fs = fillSpans(), n = fs.length, lit = smooth((op - .35) / .5) * n;
    fs.forEach(function (s, i) { s.style.opacity = clamp(lit - i, .35, 1).toFixed(2); });
    // story photo: lamp light passes over as it crosses the screen
    var sr = tilt.getBoundingClientRect(), sp = clamp(1 - (sr.top + sr.height) / (vh + sr.height), 0, 1);
    sheen.style.setProperty('--sh', lerp(-100, 100, sp).toFixed(1) + '%');
    // before/after: the wipe sweeps from before to after as you arrive, until you take it
    if (!touched) { var br = ba.getBoundingClientRect(), bp = clamp((vh - br.top) / (vh * 1.1), 0, 1); wipeTo(+lerp(90, 14, smooth((bp - .25) / .6)).toFixed(1)); }
    // the room: a slow camera move through three real photos
    var rp = prog(room), seg = 1 / shots.length;
    shots.forEach(function (s, i) {
      var a = (rp - i * seg) / seg, o = i === 0 ? 1 : smooth((a + .12) / .3),   // each new room fades in over the last one, which stays lit beneath it: no dark gap
      z = 1.18 - .14 * clamp(a, 0, 1.2), x = (i % 2 ? 1 : -1) * lerp(2.5, -2.5, clamp(a, 0, 1));
      s.style.opacity = o.toFixed(3);
      s.style.transform = 'translate3d(' + x.toFixed(2) + '%,' + lerp(1.5, -1.5, clamp(a, 0, 1)).toFixed(2) + '%,0) scale(' + z.toFixed(4) + ')';
    });
    var cur = Math.min(shots.length - 1, Math.floor(rp / seg));
    rsteps.forEach(function (l, i) { l.classList.toggle('on', i === cur); });
    rlight.style.setProperty('--lx', lerp(20, 80, rp).toFixed(1) + '%');
    rquote.style.setProperty('--qo', smooth((rp - .62) / .2).toFixed(3));
    // reviews drift sideways with the scroll on wide screens with a mouse
    if (fine.matches && vw > 860) { var rr = rail.getBoundingClientRect(), dp = clamp((vh - rr.top) / (vh + rr.height), 0, 1), max = Math.max(0, track.scrollWidth - rail.clientWidth); track.style.setProperty('--dx', ((rtl() ? 1 : -1) * lerp(0, max, dp)).toFixed(1) + 'px'); }
    // visit: the logo wall shrinks from full width into its frame; the cards land beside it
    if (vw > 860) {
      var vr = visit.getBoundingClientRect(), vp = smooth((vh * .9 - vr.top) / (vh * .7)), W = vphoto.parentNode.clientWidth, half = W / 2 + 10;
      // RTL: cards sit on the right (column 1) so the photo shrinks to the left half
      vphoto.style.setProperty('--pl', (rtl() ? 0 : half * vp).toFixed(1) + 'px');
      vphoto.style.setProperty('--pr', (rtl() ? half * vp : 0).toFixed(1) + 'px');
      vphoto.style.setProperty('--pr2', (26 * vp).toFixed(1) + 'px');
      vcards.style.setProperty('--vo', smooth((vp - .55) / .4).toFixed(3));
    }
    // the footer ring rises as you arrive
    var fr = $('[data-foot]').getBoundingClientRect(), fp = smooth((vh - fr.top) / fr.height);
    fring.style.setProperty('--rise', ((1 - fp) * 120).toFixed(1) + 'px');
  }

  function layout() { petals.size(); lampR(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); split(); write(true); wipeTo(50); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 900);
  addEventListener('load', function () { layout(); });
})();
