(function () {
  var root = document.documentElement, WA = '972546893134';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 860; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'ברבר שופ רמי · שדרות הציונות 11, חיפה', en: 'Barbershop Rami · 11 Hatziyonut Blvd, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Barber Shop Rami · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Barber Shop Rami · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'ברבר שופ רמי', 'Barbershop Rami');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-call]', 'התקשרו לרמי, 054-689-3134', 'Call Rami, 054-689-3134');
    aria('[data-t-wa]', 'וואטסאפ לרמי', 'WhatsApp Rami');
    $('.map').title = l === 'he' ? 'מפה: שדרות הציונות 11, חיפה' : 'Map: 11 Hatziyonut Blvd, Haifa';
    $$('[data-word]').forEach(function (w) { w.setAttribute('aria-label', l === 'he' ? 'רמי' : 'Rami'); });
    $$('.ladder li').forEach(function (li) { if (li.classList.contains('on')) $('.gl', li).textContent = li.dataset.g.split('|')[l === 'he' ? 0 : 1]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('rami156-lang', l); } catch (e) {}
    texts(l); hours(); days(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('rami156-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-hang],[data-word]').forEach(function (el) { el.classList.add('in'); });
    layout(); dust.kick(); arc.kick(); fog.reset();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [10, 19], 1: [10, 19], 2: [10, 19], 3: [10, 19], 4: [10, 19], 5: [10, 19], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; };
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
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], ds = [], k; for (k = r[0]; k <= r[1]; k++) ds.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + ds.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); });
  $$('[data-hang]').forEach(function (t, i) { t.style.setProperty('--d', i * 160 + 'ms'); t.style.setProperty('--tilt', [-1.2, .8, -.6, 1.1][i % 4] + 'deg'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-hang],[data-word]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline + footer word: letter by letter
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 9 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });
  $$('[data-word] > span').forEach(function (sp) { sp.innerHTML = sp.textContent.split('').map(function (c, i) { return '<span class="lt" style="--i:' + i + '" aria-hidden="true">' + c + '</span>'; }).join(''); });

  // ---------------------------------------------------------------- odometers
  $$('.odo').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><b data-n="' + ch + '"></b></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d roll" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  var odoCss = document.createElement('style');
  odoCss.textContent = '.odo{display:inline-flex;direction:ltr}.odo .roll{display:inline-block;height:1.1em;line-height:1.1em;overflow:hidden;vertical-align:bottom}.odo .roll>span{display:flex;flex-direction:column;transition:transform 1.4s cubic-bezier(.23,1,.32,1)}.odo b{font-weight:inherit}.odo b::before{content:attr(data-n)}.odo .roll b{display:block;height:1.1em}';
  document.head.appendChild(odoCss);
  function roll(o, go) { $$('.roll', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : 0; s.style.transitionDelay = go ? (i * 180) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('.odo').forEach(function (o) {
    roll(o, still());
    watch(o, function (v) { if (v) roll(o, true); }, { threshold: .4 });
  });

  var hero = $('[data-hero]'), heroIn = $('.hero-in'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- hair dust, made of the logo's own ink: it gathers into the badge, then drifts; the hand pushes it
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), img = new Image(), P = [], w, h, raf = 0, vis = true, t0 = 0, mx = -999, my = -999, ok = false;
    img.src = 'img/logo.jpg';
    function sample() {
      try {
        var s = document.createElement('canvas'), n = 120; s.width = n; s.height = n;
        var x = s.getContext('2d'); x.drawImage(img, 0, 0, n, n);
        var d = x.getImageData(0, 0, n, n).data, pts = [];
        for (var y = 0; y < n; y++) for (var k = 0; k < n; k++) { var i = (y * n + k) * 4; if (d[i] + d[i + 1] + d[i + 2] < 210) pts.push([k / n, y / n]); }
        var want = phone() ? 600 : 1100, st = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += st) { var q = pts[Math.floor(f)]; P.push({ hx: q[0], hy: q[1], x: Math.random(), y: Math.random(), vx: 0, vy: 0, ph: Math.random() * 6.28, dl: Math.random() * .5, dr: Math.random() }); }
        ok = true;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); P.forEach(function (p) { p.sx = undefined; }); }
    function frame(t) {
      raf = 0; if (!ok) return;
      var calm = still(), T = (t - t0) / 1000;
      c.clearRect(0, 0, w, h); if (calm) return;
      // the badge forms at the copy side, then lets go and drifts like clippings in the light
      var bw = Math.min(w * (phone() ? .7 : .34), 420), ox = phone() ? (w - bw) / 2 : (rtl() ? w * .62 - bw / 2 : w * .38 - bw / 2), oy = phone() ? h * .55 : h * .2;
      var hold = smooth((T - .2) / 1) * (1 - smooth((T - 2.6) / 1.6));
      c.fillStyle = 'rgba(241,231,221,.55)';
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        if (p.sx === undefined) { p.sx = p.x * w; p.sy = p.y * h; p.x = p.sx; p.y = p.sy; }
        var fx = (p.sx + Math.sin(T * .3 + p.ph) * 40 + T * 6 * (p.dr - .5)) , fy = (p.sy + T * (4 + p.dr * 8)) % (h + 20);
        var tx = lerp(fx, ox + p.hx * bw, hold), ty = lerp(fy, oy + p.hy * bw, hold);
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 9000) { var fo = (9000 - d2) / 9000 * 3, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * fo; p.vy += dy / dd * fo; }
        p.vx += (tx - p.x) * .05; p.vy += (ty - p.y) * .05; p.vx *= .8; p.vy *= .8; p.x += p.vx; p.y += p.vy;
        c.globalAlpha = .25 + .45 * hold + .2 * Math.sin(T * 2 + p.ph) * (1 - hold);
        c.fillRect(p.x, p.y, 1.8, 1.8);
      }
      c.globalAlpha = 1;
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() { size(); sample(); t0 = performance.now(); kick(); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // the ring photo leans toward the hand (on phones it drifts by itself)
  var ringPh = $('[data-tilt]');
  function tilt(x, y) { ringPh.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg'); ringPh.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg'); ringPh.style.setProperty('--tx', (-x * 10).toFixed(1) + 'px'); ringPh.style.setProperty('--ty', (-y * 10).toFixed(1) + 'px'); ringPh.style.setProperty('--px', (50 + x * 40) + '%'); ringPh.style.setProperty('--py', (40 + y * 40) + '%'); }
  hero.addEventListener('pointermove', function (e) { if (still() || e.pointerType !== 'mouse') return; var r = ringPh.getBoundingClientRect(); tilt(clamp((e.clientX - r.left) / r.width - .5, -.8, .8), clamp((e.clientY - r.top) / r.height - .5, -.8, .8)); });
  hero.addEventListener('pointerleave', function () { tilt(0, 0); });
  (function drift() { if (!matchMedia('(hover: hover)').matches && !still()) { var t = performance.now() / 1000; tilt(Math.sin(t * .5) * .35, Math.cos(t * .4) * .25); } setTimeout(drift, 120); })();

  // ---------------------------------------------------------------- the arc of his photos: turns by itself, with the scroll and with a drag
  var arc = (function () {
    var wrap = $('[data-arcwrap]'), el = $('[data-arc]');
    $$('.ac', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $('img', k).alt = ''; el.appendChild(k); });
    var cards = $$('.ac', el), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = false, last = 0;
    function R() { var cw = cards[0].offsetWidth || 200; return Math.max(cw * 1.1 / (2 * Math.tan(Math.PI / N)), phone() ? 300 : innerWidth * .36); }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (7 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var r = R(), sc = scrollY * .05 * (rtl() ? 1 : -1);
      el.style.transform = 'translateZ(' + (-r).toFixed(0) + 'px) rotateX(-6deg)';
      cards.forEach(function (c, i) {
        var a = rot + sc + i * step, f = Math.cos(a * Math.PI / 180), lift = f > .94 ? (f - .94) * 16 : 0;
        c.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + (r + lift * 50).toFixed(1) + 'px) scale(' + (1 + lift * .05).toFixed(3) + ')';
        c.style.filter = 'brightness(' + (.28 + .72 * Math.pow(Math.max(f, 0), 1.5)).toFixed(3) + ')';
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .25; vel = dx * 2 * (rtl() ? 1 : -1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(wrap, function (v) { vis = v; if (v) kick(); }, { rootMargin: '100px' });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- the fade: guard by guard, labels decode as the clipper passes
  var fadeSec = $('[data-fade]'), stage = $('.fade-stage'), rungs = $$('.ladder li');
  var GLY = '#*+-=/<>0123456789';
  function decode(li, on) {
    var gl = $('.gl', li), txt = li.dataset.g.split('|')[he() ? 0 : 1];
    if (on === li.classList.contains('on')) return;
    li.classList.toggle('on', on); clearInterval(li._t);
    if (!on) { gl.textContent = ''; return; }
    if (still()) { gl.textContent = txt; return; }
    var n = 0;
    li._t = setInterval(function () {
      n++; gl.textContent = txt.split('').map(function (ch, i) { return i < n / 2 ? ch : ch === ' ' ? ' ' : GLY[Math.floor(Math.random() * GLY.length)]; }).join('');
      if (n / 2 >= txt.length) { clearInterval(li._t); gl.textContent = txt; }
    }, 34);
  }

  // ---------------------------------------------------------------- the mirror fog
  var fog = (function () {
    var frame = $('[data-mirror]'), cv = $('[data-fog]'), c = cv.getContext('2d'), w, h, auto = false, down = false, last = null, done = false;
    function paint() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; if (!w) return;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.globalCompositeOperation = 'source-over';
      var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(226,216,210,.8)'); g.addColorStop(1, 'rgba(196,182,178,.86)');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      for (var i = 0; i < 260; i++) { c.fillStyle = 'rgba(255,255,255,' + (Math.random() * .12).toFixed(3) + ')'; c.beginPath(); c.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 0, 6.28); c.fill(); }
      done = false;
    }
    function wipe(a, b, r) {
      c.globalCompositeOperation = 'destination-out'; c.lineCap = 'round'; c.lineJoin = 'round';
      c.strokeStyle = 'rgba(0,0,0,1)'; c.lineWidth = r; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = r * 1.5; c.stroke();
    }
    // the squeegee: wide S-strokes from top to bottom, played once when the mirror arrives
    function autoWipe() {
      if (auto || still()) return; auto = true;
      var t0 = performance.now(), dur = 1700, rows = 5, prev = null;
      (function st(t) {
        var u = clamp((t - t0) / dur, 0, 1), k = u * rows, row = Math.floor(Math.min(k, rows - .001)), f = k - row;
        var x = (row % 2 ? 1 - f : f) * (w + 40) - 20, y = (row + .5) / rows * h + Math.sin(f * 3.14) * 10;
        var p = [x, y]; if (prev && Math.abs(prev[0] - x) < w * .6) wipe(prev, p, h / rows * 1.15); prev = p;
        if (u < 1) requestAnimationFrame(st); else done = true;
      })(t0);
    }
    function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    cv.addEventListener('pointerdown', function (e) { down = true; last = pos(e); });
    cv.addEventListener('pointermove', function (e) { if (!down && e.pointerType !== 'mouse') return; var p = pos(e); if (last) wipe(last, p, 54); last = p; });
    cv.addEventListener('pointerleave', function () { last = null; down = false; });
    addEventListener('pointerup', function () { down = false; });
    watch(frame, function (v) { if (v) setTimeout(autoWipe, 200); }, { threshold: .35 });
    return { paint: paint, reset: function () { auto = false; paint(); } };
  })();

  // ---------------------------------------------------------------- tray: spotlight under the hand
  var tray = $('#tray');
  watch(tray, function (v) { tray.classList.toggle('on', v); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // frames lean toward the hand
  $$('[data-hang]').forEach(function (f) {
    f.addEventListener('pointermove', function (e) { if (still() || e.pointerType !== 'mouse' || !f.classList.contains('in')) return; var r = f.getBoundingClientRect(); f.style.animation = 'none'; f.style.opacity = '1'; f.style.transition = 'transform .4s cubic-bezier(.23,1,.32,1)'; f.style.transform = 'rotate(' + (((e.clientX - r.left) / r.width - .5) * 5).toFixed(2) + 'deg)'; });
    f.addEventListener('pointerleave', function () { if (f.style.animation === 'none') f.style.transform = 'rotate(' + f.style.getPropertyValue('--tilt') + ')'; });
  });

  // ---------------------------------------------------------------- the booking card
  var picks = { svc: 0, day: -1, when: 0 };
  var dayBox = $('[data-pick="day"]');
  function days() {
    var l = he(), short = l ? ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (picks.day < 0) { var d = now().d; picks.day = H[d] ? d : 0; }
    dayBox.innerHTML = short.map(function (s, i) {
      return '<button type="button" role="radio" aria-checked="' + (i === picks.day) + '"' + (H[i] ? '' : ' disabled') + ' aria-label="' + (l ? 'יום ' + dayHe[i] : dayEn[i]) + (H[i] ? '' : (l ? ', סגור' : ', closed')) + '" data-i="' + i + '">' + s + '</button>';
    }).join('');
  }
  dayBox.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b || b.disabled) return; picks.day = +b.dataset.i; $$('button', dayBox).forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); light(1); write(); });
  $$('.opts').forEach(function (g) {
    var key = g.dataset.pick, bs = $$('button', g);
    bs.forEach(function (b, i) { b.addEventListener('click', function () { picks[key] = i; bs.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); light(key === 'svc' ? 0 : 2); write(); }); });
  });
  var stepEls = $$('[data-step]');
  function light(n) { stepEls[n].classList.add('on'); }
  function compose() {
    var l = he(), s = $$('[data-pick="svc"] button')[picks.svc].dataset[l ? 'he' : 'en'], w = $$('[data-pick="when"] button')[picks.when].dataset[l ? 'he' : 'en'];
    return l ? 'היי רמי, אשמח לתאם ' + s + ' ביום ' + dayHe[picks.day] + ', ' + w + '. מתי מתאים לך?'
             : 'Hi Rami, I’d like to book ' + s + ' on ' + dayEn[picks.day] + ', ' + w + '. What time works for you?';
  }
  var ticket = $('[data-ticket]'), msg = $('[data-msg]'), seen = false;
  function write(instant) {
    var m = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    msg.textContent = m;
    if (instant || still() || !seen) return;
    ticket.classList.remove('print'); void ticket.offsetWidth; ticket.classList.add('print');
  }
  watch($('.printer'), function (v) { if (v && !seen) { seen = true; if (!still()) { ticket.classList.add('print'); } } }, { threshold: .5 });

  // ---------------------------------------------------------------- one scroll loop
  var ticking = false, stripes = $('[data-stripes]'), cape = $('.cape-edge'), vphoto = $('[data-vphoto]');
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 60);
    // the hero stays under the cape: it settles back and dims as the next section rides over it
    var hh = hero.offsetHeight; hero.style.top = calm ? '' : Math.min(0, vh - hh) + 'px';
    if (!calm) {
      var hp = clamp((scrollY - Math.max(0, hh - vh)) / vh, 0, 1);
      heroIn.style.transform = 'scale(' + (1 - hp * .06).toFixed(4) + ')'; heroIn.style.opacity = (1 - hp * .7).toFixed(3);
      cape.style.setProperty('--cx', (-scrollY * .25).toFixed(1) + 'px');
      arc.kick();
    } else { heroIn.style.transform = ''; heroIn.style.opacity = ''; }
    // the fade: the cut line climbs from the neck to the top
    var fp = calm ? 1 : smooth((prog(fadeSec) - .05) / .8), cut = 100 - fp * 100;
    stage.style.setProperty('--cut', cut.toFixed(2) + '%');
    rungs.forEach(function (li, i) { var y = (i + .5) / rungs.length * 100; decode(li, calm || (y >= cut && fp > .02)); });
    // stripes travel with the scroll
    if (!calm) stripes.style.setProperty('--sx', ((scrollY * .35) % 120 * (rtl() ? 1 : -1)).toFixed(1) + 'px');
    // the storefront shrinks from full bleed into its frame
    var vr = vphoto.getBoundingClientRect(), vp = calm ? 1 : smooth((vh - vr.top) / (vh * .9));
    vphoto.style.setProperty('--ci', (vp * 14).toFixed(1) + 'px');
    vphoto.style.setProperty('--cr', (lerp(0, 26, vp)).toFixed(1) + 'px');
    vphoto.style.setProperty('--cs', (lerp(1.25, 1, vp)).toFixed(4));
  }
  function layout() { dust.size(); fog.paint(); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (innerWidth !== lw) { lw = innerWidth; layout(); } else tick(); }, 150); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); days(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); $$('.odo', hero).forEach(function (o) { roll(o, true); }); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 300);
  addEventListener('load', function () { fog.paint(); tick(); });
})();
