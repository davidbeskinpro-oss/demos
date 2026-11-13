(function () {
  var root = document.documentElement, WA = '972522664218';
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
  var TITLE = { he: 'ליאור משה · שמאי מקרקעין · השחף 1, טירת כרמל', en: 'Lior Moshe · Real estate appraiser · 1 HaShahaf St, Tirat Carmel' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור ליאור משה שמאי מקרקעין · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Lior Moshe, Real Estate Appraiser · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'ליאור משה שמאי מקרקעין', 'Lior Moshe, Real Estate Appraiser');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לליאור, 052-266-4218', 'Call Lior, 052-266-4218');
    aria('[data-t-wa]', 'וואטסאפ לליאור', 'WhatsApp Lior');
    aria('[data-t-prev]', 'השלב הקודם', 'Previous step');
    aria('[data-t-next]', 'השלב הבא', 'Next step');
    aria('[data-t-types]', 'סוג הנכס', 'Kind of property');
    aria('[data-t-needs]', 'מה צריך', 'What you need');
    var w = $('[data-where]'); w.placeholder = w.dataset[l === 'he' ? 'phHe' : 'phEn'];
    $$('[data-decode]').forEach(function (d) { d.textContent = d.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('lm-lang', l); } catch (e) {}
    texts(l); hours(); write(true); measure.render(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('lm-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],.qa details').forEach(function (el) { el.classList.add('in'); });
    measure.reset(); layout(); contours.kick(); ring.kick(); dots.kick(); write(true); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [8, 17], 1: [8, 17], 2: [8, 17], 3: [8, 17], 4: [8, 17], 5: [8, 12], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && (t[0] === 0 && t[1] === 24)) { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) {
      el.classList.toggle('open', open);
      var short = el.classList.contains('mt-screen') ? txt.split(' · ')[0] : txt;
      el.innerHTML = '<span class="dot"></span>' + short;
    });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); if (e.target._in) e.target._in(); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  function onIn(el, fn) { el._in = fn; }

  // ---------------------------------------------------------------- headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 10 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- glyph decode (labels settle out of scrambled letters)
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHKLMNPRSTUVWXYZ', n: '0123456789' };
  function decode(el, txt, set) {
    clearInterval(el._dt);
    if (still()) { el.textContent = txt; return; }
    var f = 0, n = 16;
    el._dt = setInterval(function () {
      f++;
      el.textContent = txt.split('').map(function (c, i) {
        if (c === ' ' || c === '.' || i < (f / n) * txt.length) return c;
        var s = /\d/.test(c) ? GL.n : set; return s[Math.floor(Math.random() * s.length)];
      }).join('');
      if (f >= n) { clearInterval(el._dt); el.textContent = txt; }
    }, 40);
  }

  // ---------------------------------------------------------------- the Carmel's contour lines: drifting by themselves, a hill rises under the hand
  var contours = (function () {
    var cv = $('[data-contours]'), c = cv.getContext('2d'), w, h, cell, cols, rows, F, raf = 0, vis = true, last = 0;
    var tx = -1, ty = -1, hx = 0, hy = 0, hs = 0, t0 = performance.now();
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); cell = phone() ? 22 : 18; cols = Math.ceil(w / cell) + 1; rows = Math.ceil(h / cell) + 1; F = new Float32Array(cols * rows); hx = w * .3; hy = h * .5; }
    function field(T) {
      var sig = Math.max(110, Math.min(w, h) * .2), s2 = 2 * sig * sig;
      for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
        var x = i * cell, y = j * cell, nx = x / 900, ny = y / 900, dx = x - hx, dy = y - hy;
        F[j * cols + i] = Math.sin(nx * 3.1 + T * .11) * .55 + Math.sin(ny * 4.3 - T * .08 + nx * 1.7) * .5 + Math.sin((nx + ny) * 5.6 + T * .06) * .28 + hs * 1.5 * Math.exp(-(dx * dx + dy * dy) / s2);
      }
    }
    function draw() {
      c.clearRect(0, 0, w, h); c.lineWidth = 1;
      for (var L = -1.2; L < 2.4; L += .2) {
        var hi = L > 1.3; c.strokeStyle = hi ? 'rgba(228,150,120,.30)' : 'rgba(205,181,155,.2)';
        c.beginPath();
        for (var j = 0; j < rows - 1; j++) for (var i = 0; i < cols - 1; i++) {
          var a = F[j * cols + i], b = F[j * cols + i + 1], d = F[(j + 1) * cols + i], e = F[(j + 1) * cols + i + 1];
          var k = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (e > L ? 2 : 0) | (d > L ? 1 : 0);
          if (k === 0 || k === 15) continue;
          var x = i * cell, y = j * cell, p = [];
          if ((a > L) !== (b > L)) p.push([x + cell * (L - a) / (b - a), y]);
          if ((b > L) !== (e > L)) p.push([x + cell, y + cell * (L - b) / (e - b)]);
          if ((d > L) !== (e > L)) p.push([x + cell * (L - d) / (e - d), y + cell]);
          if ((a > L) !== (d > L)) p.push([x, y + cell * (L - a) / (d - a)]);
          if (p.length >= 2) { c.moveTo(p[0][0], p[0][1]); c.lineTo(p[1][0], p[1][1]); }
          if (p.length === 4) { c.moveTo(p[2][0], p[2][1]); c.lineTo(p[3][0], p[3][1]); }
        }
        c.stroke();
      }
    }
    function frame(t) {
      raf = 0;
      var T = (t - t0) / 1000;
      if (still()) { hs = 0; field(8); draw(); return; }
      if (t - last > 33) {
        last = t;
        var gx = tx, gy = ty;
        if (gx < 0) { gx = w * (.32 + .18 * Math.sin(T * .23)); gy = h * (.5 + .25 * Math.sin(T * .31)); }
        hx = lerp(hx, gx, .06); hy = lerp(hy, gy, .06); hs = lerp(hs, 1, .03);
        field(T); draw(); laser.set(tx < 0 ? null : hy, T);
      }
      if (vis) raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { tx = ty = -1; });
    hero.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') { var r = hero.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; setTimeout(function () { tx = ty = -1; }, 2500); } });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- the levelling staff and the laser level line that reads it
  var laser = (function () {
    var el = $('[data-laser]'), rd = $('[data-read]'), staff = $('[data-staff]');
    return { set: function (y, T) {
      var hr = hero.getBoundingClientRect(), sr = staff.getBoundingClientRect();
      if (y === null) y = sr.top - hr.top + sr.height * (.5 + .38 * Math.sin(T * .35));   // no pointer: the laser sweeps the staff by itself
      var yy = clamp(y, sr.top - hr.top + 4, sr.bottom - hr.top - 4);
      el.style.setProperty('--ly', yy.toFixed(1) + 'px');
      rd.textContent = ((sr.bottom - hr.top - yy) / 480).toFixed(2);   // the staff's pattern: 48 px = 10 cm
    } };
  })();

  // ---------------------------------------------------------------- the arc: turns by itself, with the scroll and with a drag
  var area = $('[data-area]');
  var ring = (function () {
    var wrap = $('[data-ringwrap]'), el = $('[data-ring]');
    $$('.rc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $$('img', k).forEach(function (i) { i.alt = ''; i.removeAttribute('data-alt-he'); }); el.appendChild(k); });
    var cards = $$('.rc', el), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = true, last = 0;
    function R() { var cw = cards[0].offsetWidth || 200; return Math.max(cw * 1.1 / (2 * Math.tan(Math.PI / N)), phone() ? 300 : innerWidth * .4); }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (7 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var r = R(), sc = scrollY * .05 * (rtl() ? 1 : -1);
      cards.forEach(function (c, i) {
        var a = rot + sc + i * step, f = Math.cos(a * Math.PI / 180), lift = f > .95 ? (f - .95) * 20 : 0;
        c.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + (r + lift * 40).toFixed(1) + 'px) scale(' + (1 + lift * .07).toFixed(3) + ')';
        c.style.filter = 'brightness(' + (.28 + .72 * Math.pow(Math.max(f, 0), 1.6)).toFixed(3) + ')';
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    el.style.transform = 'rotateX(-6deg)';
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .25; vel = dx * 2 * (rtl() ? 1 : -1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    watch(area, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- Lior: the laser scans his portrait into colour; his labels decode
  var who = $('[data-who]'), scan = $('[data-scan]');
  var facts = $('.facts');
  onIn(facts, function () { $$('[data-decode]').forEach(function (d, i) { setTimeout(function () { decode(d, d.dataset[root.lang], GL[root.lang]); }, i * 160); }); });

  // ---------------------------------------------------------------- the measured room (signature)
  var measure = (function () {
    var sec = $('[data-measure]'), stage = $('[data-mstage]'), photo = $('.m-photo', stage), runs = $$('[data-run]'), tags = $$('[data-tag]'), floor = $('[data-floor]');
    var plan = $('[data-plan]'), areaN = $('[data-parea]', plan), cap = $('[data-mcap]'), chips = $$('[data-mchip]'), cur = -1, sp = 0;
    var START = [[1530, 964], [70, 999]], END = [812, 767], VAL = [4.10, 3.20], DIM = [[[812, 812], [1600, 1028]], [[0, 1066], [812, 812]]];
    var CAP = { he: ['אורך הקיר, לאורך הפאנל.', 'ועכשיו הקיר השני.', 'הרצפה הופכת לתוכנית, והשטח מחושב.'], en: ['The wall’s length, along the skirting.', 'Then the other wall.', 'The floor becomes a plan, and the area is worked out.'] };
    var STILL = [.37, .67, 1];
    runs.forEach(function (g) { $$('path', g).forEach(function (p) { p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1'; }); });
    function place() {
      var W = photo.clientWidth, Hh = photo.clientHeight, s = Math.max(W / 1600, Hh / 1200), ox = (W - 1600 * s) / 2, oy = (Hh - 1200 * s) / 2;
      var vx0 = -ox / s + 40, vx1 = (W - ox) / s - 40;
      DIM.forEach(function (d, i) {
        var a = Math.max(Math.min(d[0][0], d[1][0]), vx0), b = Math.min(Math.max(d[0][0], d[1][0]), vx1), x = (a + b) / 2, y = d[0][1] + (d[1][1] - d[0][1]) * (x - d[0][0]) / (d[1][0] - d[0][0]);
        tags[i].style.left = (ox + x * s) + 'px'; tags[i].style.top = (oy + y * s + 30) + 'px';
      });
    }
    function progress() { if (still()) return STILL[sp]; var r = sec.getBoundingClientRect(), span = sec.offsetHeight - innerHeight; return clamp(-r.top / span, 0, 1); }
    function draw(p) {
      var bases = [.06, .38];
      runs.forEach(function (g, i) {
        var b0 = bases[i], beam = smooth((p - b0) / .12), dim = smooth((p - b0 - .13) / .13), roll = smooth((p - b0 - .1) / .12);
        var ln = $('.m-beam', g), dot = $('.m-dot', g), dev = $('.m-dev', g);
        ln.setAttribute('x2', lerp(START[i][0], END[0], beam).toFixed(1)); ln.setAttribute('y2', lerp(START[i][1], END[1], beam).toFixed(1));
        var beamOn = p > b0 && p < b0 + .3;
        ln.style.opacity = beamOn ? 1 : 0; dot.style.opacity = beamOn && beam >= .99 ? 1 : 0;
        dev.style.opacity = smooth((p - b0 + .05) / .05) * (p > b0 + .32 ? .0 : 1);
        $$('path', g).forEach(function (pa) { pa.style.strokeDashoffset = (1 - dim).toFixed(3); });
        tags[i].style.opacity = beam >= .99 ? 1 : 0;
        tags[i].textContent = beam >= .99 ? (VAL[i] * roll).toFixed(2) + (he() ? ' מ׳' : ' m') : '';
      });
      floor.style.setProperty('--fl', smooth((p - .68) / .1).toFixed(3));
      plan.style.setProperty('--po', smooth((p - .74) / .08).toFixed(3));
      plan.style.setProperty('--pd', smooth((p - .78) / .12).toFixed(3));
      areaN.textContent = (VAL[0] * VAL[1] * smooth((p - .84) / .1)).toFixed(2);
      photo.style.setProperty('--mz', still() ? 1 : (1 + p * .07).toFixed(4));
      var k = p < .38 ? 0 : p < .68 ? 1 : 2;
      if (k !== cur) {
        cur = k; chips.forEach(function (c, i) { c.setAttribute('aria-selected', i === k ? 'true' : 'false'); });
      }
      cap.innerHTML = '<span>' + CAP[root.lang][k] + '</span>';
    }
    function go(k) {
      k = clamp(k, 0, 2);
      if (still()) { sp = k; draw(STILL[k]); return; }
      var top = sec.getBoundingClientRect().top + scrollY, span = sec.offsetHeight - innerHeight;
      scrollTo({ top: top + span * [.34, .64, .97][k], behavior: 'smooth' });
    }
    chips.forEach(function (c, i) { c.addEventListener('click', function () { go(i); }); });
    $('[data-mprev]').addEventListener('click', function () { go(sp - 1); });
    $('[data-mnext]').addEventListener('click', function () { go(sp + 1); });
    return { tick: function () { var p = progress(); if (!still()) sp = p < .38 ? 0 : p < .68 ? 1 : 2; draw(p); }, place: place, render: function () { cur = -1; draw(progress()); }, reset: function () { sp = 0; cur = -1; } };
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
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 4) % 10; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- bento: spotlight, the extract decodes, the map leans, the instrument tilts, the tape runs out
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var tabu = $('.t-tabu'), glyphs = $$('[data-glyph]');
  function deedDecode() { glyphs.forEach(function (g, i) { setTimeout(function () { decode(g, g.dataset.glyph, GL.n); }, i * 180); }); }
  onIn(tabu, deedDecode);
  tabu.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') deedDecode(); });
  var mapT = $('.t-map');
  mapT.addEventListener('pointermove', function (e) { var r = mapT.getBoundingClientRect(); mapT.style.setProperty('--mpx', (((e.clientX - r.left) / r.width - .5) * -24).toFixed(1) + 'px'); });
  var theo = $('[data-tilt]');
  theo.addEventListener('pointermove', function (e) { if (still()) return; var r = theo.getBoundingClientRect(); theo.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 14).toFixed(1) + 'deg'); theo.style.setProperty('--rx', (((e.clientY - r.top) / r.height - .5) * -10).toFixed(1) + 'deg'); });
  theo.addEventListener('pointerleave', function () { theo.style.setProperty('--ry', '0deg'); theo.style.setProperty('--rx', '0deg'); });
  var tapeT = $('.t-tape'), blade = $('[data-blade]'), tread = $('[data-tread]'), tapeHover = -1;
  tapeT.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse' || still()) return; var r = tapeT.getBoundingClientRect(), x = (e.clientX - r.left) / r.width; tapeHover = clamp(rtl() ? 1 - x : x, .05, 1); });
  tapeT.addEventListener('pointerleave', function () { tapeHover = -1; });
  function tapeSet(f) { tapeT.style.setProperty('--tape', f.toFixed(3)); tread.textContent = (blade.offsetWidth / 200).toFixed(2); }   // blade ticks: 20 px = 10 cm

  // ---------------------------------------------------------------- the property file (live thing)
  var types = $$('[data-type]'), needs = $$('[data-need]'), whereI = $('[data-where]'), msgEl = $('[data-msg]'), send = $('[data-send]'), fdplan = $('[data-fdplan]');
  var state = { type: 'apt', need: 'sell' }, typed = '', typeT = 0;
  var TY = { he: { apt: 'דירה', house: 'בית', plot: 'מגרש', shop: 'נכס מסחרי', other: 'נכס' }, en: { apt: 'an apartment', house: 'a house', plot: 'a plot', shop: 'a commercial property', other: 'a property' } };
  var NE = { he: { sell: 'יש כוונה למכור, ורציתי להבין מה שווי הנכס.', buy: 'יש כוונה לקנות, ורציתי להבין מה שווי הנכס.', q: 'יש לי שאלה בנוגע להערכת שווי.' }, en: { sell: 'We’re thinking of selling and would like to understand its value.', buy: 'We’re thinking of buying and would like to understand its value.', q: 'I have a question about a valuation.' } };
  function message() {
    var l = root.lang, w = whereI.value.trim() || whereI.dataset[l === 'he' ? 'phHe' : 'phEn'];
    return l === 'he'
      ? 'שלום ליאור,\nאני פונה לגבי ' + TY.he[state.type] + ' ב' + w + '.\n' + NE.he[state.need] + '\nאשמח לשמוע ממך.'
      : 'Hi Lior,\nI’m writing about ' + TY.en[state.type] + ' in ' + w + '.\n' + NE.en[state.need] + '\nI’d be glad to hear from you.';
  }
  function write(instant) {
    var m = message();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    fdplan.innerHTML = $('[data-type="' + state.type + '"] svg').innerHTML;
    clearInterval(typeT);
    if (instant || still()) { typed = m; msgEl.textContent = m; msgEl.classList.remove('typing'); return; }
    var keep = 0; while (keep < typed.length && keep < m.length && typed[keep] === m[keep]) keep++;
    var i = keep; msgEl.classList.add('typing');
    typeT = setInterval(function () { i = Math.min(m.length, i + 2); msgEl.textContent = m.slice(0, i); typed = m.slice(0, i); if (i >= m.length) { clearInterval(typeT); msgEl.classList.remove('typing'); } }, 18);
  }
  var steps = $$('[data-step]');
  function pick(list, btn, key) { list.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); }); state[key] = btn.dataset[key]; write(); }
  types.forEach(function (b) { b.addEventListener('click', function () { pick(types, b, 'type'); steps[0].classList.add('on'); }); });
  needs.forEach(function (b) { b.addEventListener('click', function () { pick(needs, b, 'need'); steps[1].classList.add('on'); }); });
  whereI.addEventListener('input', function () { steps[2].classList.add('on'); write(); });
  if (io) { var sio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); sio.unobserve(e.target); } }); }, { rootMargin: '0px 0px -35% 0px' }); steps.forEach(function (s) { sio.observe(s); }); }
  else steps.forEach(function (s) { s.classList.add('on'); });

  // ---------------------------------------------------------------- the footer: the logo re-drawn from its own pixels; dots part under the hand
  var foot = $('[data-foot]'), fstage = $('[data-fstage]');
  var dots = (function () {
    var cv = $('[data-fdots]'), c = cv.getContext('2d'), img = $('[data-fsrc]'), P = [], w, h, raf = 0, vis = false, mx = -999, my = -999, ok = false, t0 = 0;
    function sample() {
      try {
        var iw = 568, ih = 330, sc = document.createElement('canvas'); sc.width = iw; sc.height = ih;
        var x = sc.getContext('2d'); x.drawImage(img, 0, 0, iw, ih);
        var d = x.getImageData(0, 0, iw, ih).data, pts = [], st = phone() ? 3 : 2;
        for (var y = 0; y < ih; y += st) for (var xx = 0; xx < iw; xx += st) { var k = (y * iw + xx) * 4; if (d[k] < 170) pts.push([xx / iw, y / ih, Math.abs(xx / iw - .4825) < .006]); }
        P = pts.map(function (q) { return { hx: q[0], hy: q[1], rule: q[2], x: Math.random(), y: Math.random(), vx: 0, vy: 0, init: false }; });
        ok = P.length > 50;
      } catch (e) { ok = false; }
      fstage.classList.toggle('fallback', !ok);
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = fstage.clientWidth; h = fstage.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(t) {
      raf = 0; if (!ok) return;
      var calm = still(), T = (t - t0) / 1000, bw = Math.min(w, h * 1136 / 660), bh = bw * 660 / 1136, ox = (w - bw) / 2, oy = (h - bh) / 2, pulse = (T * .5) % 1.4;
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], tx = ox + p.hx * bw, ty = oy + p.hy * bh;
        if (calm || !p.init) { if (calm) { p.x = tx; p.y = ty; } else { p.x = ox + Math.random() * bw; p.y = oy + bh + 40 + Math.random() * 80; } p.init = true; }
        if (!calm) {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 6400) { var f = (6400 - d2) / 6400 * 3, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
          p.vx += (tx - p.x) * .05; p.vy += (ty - p.y) * .05; p.vx *= .8; p.vy *= .8; p.x += p.vx; p.y += p.vy;
        }
        var lit = p.rule && !calm && Math.abs(p.hy - pulse) < .08;
        c.fillStyle = p.rule ? (lit ? '#ff7a6c' : '#e4483b') : '#cdb59b';
        c.globalAlpha = p.rule ? .95 : .78;
        c.fillRect(p.x - 1, p.y - 1, 2.2, 2.2);
      }
      c.globalAlpha = 1;
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    fstage.addEventListener('pointermove', function (e) { var r = fstage.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    fstage.addEventListener('pointerleave', function () { mx = my = -999; });
    fstage.addEventListener('pointerdown', function (e) { var r = fstage.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; setTimeout(function () { mx = my = -999; }, 600); });
    watch(foot, function (v) { vis = v; if (v) { t0 = performance.now(); kick(); } });
    function start() { size(); sample(); kick(); }
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { size(); kick(); } };
  })();

  // ---------------------------------------------------------------- scroll loop
  var band = $('[data-band]'), bandIn = $('[data-bandin]'), rv = $('[data-reviews]'), rtrack = $('[data-rtrack]'), rrow = $('[data-rrow]'), staffT = $('[data-ticks]'), hphoto = $('[data-hphoto]');
  var ticking = false;
  function tick() {
    ticking = false;
    var vh = innerHeight, calm = still(), y = scrollY;
    nav.classList.toggle('pill', y > 40);
    staffT.style.setProperty('--sy', calm ? '0px' : ((y * .3) % 48).toFixed(1) + 'px');
    // the scan
    var wr = scan.getBoundingClientRect(), q = calm ? 1 : smooth((vh * .92 - wr.top) / (wr.height * .95));
    scan.style.setProperty('--scan', (q * 100).toFixed(2) + '%'); scan.style.setProperty('--scanop', q > 0 && q < 1 ? 1 : 0);
    // the arc fades back as Lior's sheet lands over it
    if (!calm && !phone()) { var ar = who.getBoundingClientRect(), u = clamp(1 - ar.top / vh, 0, 1); area.style.opacity = (1 - u * .6).toFixed(3); area.style.transform = 'scale(' + (1 - u * .05).toFixed(4) + ')'; }
    else { area.style.opacity = ''; area.style.transform = ''; }
    measure.tick();
    // tape band and the tape tile
    bandIn.style.setProperty('--bx', calm ? '0px' : (-(y * .6) % 200).toFixed(1) + 'px');
    var tr = tapeT.getBoundingClientRect();
    tapeSet(tapeHover >= 0 ? tapeHover : calm ? .72 : clamp(.08 + (vh - tr.top) / (vh * .9), .08, .92));
    // reviews slide along the tape
    var swipe = calm || innerWidth < 900; rtrack.classList.toggle('swipe', swipe);
    if (!swipe) {
      var rr = rv.getBoundingClientRect(), pr = clamp((vh - rr.top) / (vh + rr.height), 0, 1), extra = Math.max(0, rrow.scrollWidth - rtrack.clientWidth + 40);
      rrow.style.setProperty('--rx', ((rtl() ? 1 : -1) * extra * pr).toFixed(1) + 'px'); rtrack.style.setProperty('--tx', ((rtl() ? 1 : -1) * extra * pr).toFixed(1) + 'px');
    }
    // the hero portrait drifts gently with scroll
    hphoto.style.setProperty('--py', calm ? '0px' : (y * .08).toFixed(1) + 'px');
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }, { passive: true });
  if (fine) hero.addEventListener('pointermove', function (e) { if (still()) return; var r = hero.getBoundingClientRect(); hphoto.style.setProperty('--px', (((e.clientX - r.left) / r.width - .5) * -14).toFixed(1) + 'px'); });

  function layout() { contours.size(); measure.place(); dots.size(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });

  $$('[data-reveal],[data-tile],.qa details').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  texts(root.lang); hours(); write(true); layout();

  // ---------------------------------------------------------------- opening, then the headline settles
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); }); };
  if (root.classList.contains('opening')) {
    var op = $('[data-open]'), done = function () { root.classList.remove('opening', 'op-go', 'op-split'); try { sessionStorage.setItem('lm-open', '1'); } catch (e) {} go(); };
    var skip = function () { clearTimeout(t1); clearTimeout(t2); root.classList.add('op-split'); go(); setTimeout(done, 500); };
    setTimeout(function () { root.classList.add('op-go'); }, 80);
    var t1 = setTimeout(function () { root.classList.add('op-split'); go(); }, 780);
    var t2 = setTimeout(done, 1500);
    op.addEventListener('click', skip);
  } else {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    setTimeout(go, 1000);
  }
  addEventListener('load', function () { layout(); });
})();
