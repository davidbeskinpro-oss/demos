(function () {
  var root = document.documentElement, WA = '972525320032';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var range = function (p, a, b) { return smooth((p - a) / (b - a)); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover:hover) and (pointer:fine)');
  var TITLE = { he: 'עו״ד דנה נוימן-רייף · עורכת דין, נוטריון ומגשרת · חיפה', en: 'Adv. Dana Neuman-Reif · Attorney, notary and mediator · Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור עו"ד דנה נוימן - רייף · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Adv. Dana Neuman-Reif · This is not the business’s official website' };
  var HELLO = { he: 'שלום דנה, הגעתי דרך האתר.', en: 'Hi Dana, I found you through the website.' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'עו״ד דנה נוימן-רייף', 'Adv. Dana Neuman-Reif');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-callnav]', 'להתקשר לדנה', 'Call Dana');
    aria('[data-t-tabs]', 'תחומי העיסוק', 'Areas of practice');
    aria('[data-t-subject]', 'נושא', 'Subject');
    aria('[data-t-prev]', 'התיק הקודם', 'Previous file');
    aria('[data-t-next]', 'התיק הבא', 'Next file');
    aria('[data-t-call]', 'להתקשר לדנה, 052-532-0032', 'Call Dana, 052-532-0032');
    aria('[data-t-wa]', 'וואטסאפ לדנה', 'WhatsApp Dana');
    $$('[data-wa-hello]').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(HELLO[l]); });
    $$('[data-ph-he]').forEach(function (i) { i.placeholder = i.dataset[l === 'he' ? 'phHe' : 'phEn']; });
    $$('.f-tab').forEach(function (t) { t.textContent = t.dataset[l]; });
    tabBtns.forEach(function (b, i) { b.textContent = files[i] ? $('.f-tab', files[i]).dataset[l] : ''; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('dnr-lang', l); } catch (e) {}
    splitTitle(); splitFill(); texts(l); hours(); write(true); layout();
    $$('[data-odo]').forEach(function (o) { roll(o, true); });
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('dnr-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    clearStyles(); layout(); ink.kick(); motes.kick(); light.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8, 18], 1: [8, 18], 2: [8, 18], 3: [8, 18], 4: [8, 18], 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span><span>' + txt + '</span>'; });
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

  // ---------------------------------------------------------------- entrances (tiles staggered by their place in the grid)
  $$('.bento,.cbento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline: letter by letter, out of a blur
  var titleSrc = $$('[data-split] .ln > span[lang]').map(function (sp) { return sp.textContent; });
  function splitTitle() {
    var i = 0;
    $$('[data-split] .ln > span[lang]').forEach(function (sp, k) {
      if (sp.lang !== root.lang) { sp.textContent = titleSrc[k]; return; }
      sp.innerHTML = titleSrc[k].split(' ').map(function (w) {
        return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  }

  // the statement on her site fills in letter by letter as it scrolls through
  var fillEl = $('[data-fill]'), fillSrc = $$('span[lang]', fillEl).map(function (s) { return s.textContent; }), fillChars = [];
  function splitFill() {
    fillChars = [];
    $$('span[lang]', fillEl).forEach(function (sp, k) {
      if (sp.lang !== root.lang) { sp.textContent = fillSrc[k]; return; }
      sp.innerHTML = fillSrc[k].split(' ').map(function (w) { return '<span class="c">' + w + '</span>'; }).join(' ');
      fillChars = $$('.c', sp);
    });
  }

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- the light on the marble: follows the hand, drifts by itself
  var lit = $('[data-lit]'), litIn = $('[data-litin]'), portrait = $('[data-portrait]');
  var light = (function () {
    var tx = .3, ty = .4, x = .3, y = .4, last = 0, raf = 0, vis = true, t0 = performance.now(), HW = 0, HH = 0, D = 640;
    function size() {
      HW = hero.clientWidth; HH = hero.clientHeight; D = phone() ? 460 : 680;
      lit.style.setProperty('--ld', D + 'px'); litIn.style.width = HW + 'px'; litIn.style.height = HH + 'px';
    }
    function frame(t) {
      raf = 0; if (!vis || still()) return;
      var idle = t - last > 2200, T = (t - t0) / 1000;
      if (idle || !fine.matches) { tx = .5 + Math.sin(T * .23) * .32; ty = .45 + Math.sin(T * .31 + 1) * .25; }
      x += (tx - x) * .06; y += (ty - y) * .06;
      var px = x * HW - D / 2, py = y * HH - D / 2;
      lit.style.transform = 'translate3d(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px,0)';
      litIn.style.transform = 'translate3d(' + (-px).toFixed(1) + 'px,' + (-py).toFixed(1) + 'px,0)';
      raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = hero.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; last = performance.now();
      if (!still()) { portrait.style.setProperty('--px', ((tx - .5) * -18).toFixed(1) + 'px'); portrait.style.setProperty('--py', ((ty - .5) * -10).toFixed(1) + 'px'); }
      kick();
    });
    hero.addEventListener('pointerleave', function () { last = 0; portrait.style.setProperty('--px', '0px'); portrait.style.setProperty('--py', '0px'); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    watch(hero, function (v) { vis = v; kick(); });
    return { kick: kick, size: size };
  })();

  // ---------------------------------------------------------------- motes of dust in the ribbon's light
  var motes = (function () {
    var cv = $('[data-motes]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = true;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 34 : 70; P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 1.8, v: .08 + Math.random() * .25, ph: Math.random() * 6.28, a: .2 + Math.random() * .5 });
      draw(0);
    }
    function draw(T) {
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], a = p.a * (.6 + .4 * Math.sin(T * 1.3 + p.ph));
        c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fillStyle = 'rgba(214,218,255,' + a.toFixed(3) + ')'; c.fill();
      }
    }
    function frame(t) {
      raf = 0; if (!vis || still()) return;
      var T = t / 1000;
      P.forEach(function (p) { p.y -= p.v; p.x += Math.sin(T * .5 + p.ph) * .18; if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; } });
      draw(T); raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); }
    watch(hero, function (v) { vis = v; kick(); });
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- her real logo, gathered out of ink particles; parts under the hand
  var ink = (function () {
    var box = $('[data-inklogo]'), cv = $('[data-inkcv]'), c = cv.getContext('2d'), img = $('[data-inksrc]');
    var P = [], w, h, ox, oy, lw, lh, raf = 0, vis = true, t0 = 0, mx = -999, my = -999, ok = false, ripples = [];
    function sample() {
      try {
        // one particle per pixel of the logo as it is shown, so the settled logo is as sharp as the real file
        var iw = Math.max(120, Math.round(lw)), ih = Math.round(iw * 195 / 502), sc = document.createElement('canvas'); sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data; P = [];
        for (var y = 0; y < ih; y++) for (var x = 0; x < iw; x++) { var a = d[(y * iw + x) * 4 + 3]; if (a > 40) P.push({ hx: (x + .5) / iw, hy: (y + .5) / ih, a: a / 255, x: 0, y: 0, vx: 0, vy: 0, sx: Math.random(), sy: 1 + Math.random() * .6, dl: Math.random() * .55, ph: Math.random() * 6.28 }); }
        ok = P.length > 50; box.classList.toggle('fallback', !ok);
      } catch (e) { ok = false; box.classList.add('fallback'); }
    }
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1), r = cv.getBoundingClientRect(); w = r.width; h = r.height;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var br = box.getBoundingClientRect(); lw = br.width; lh = br.height; ox = br.left - r.left; oy = br.top - r.top;
    }
    // three states: the ink gathering (time-based), the settled real logo with a band of light passing over it,
    // and loose particles while the hand stirs them (they drift home, then the real logo is drawn again)
    var loose = false;
    function near() { return mx > ox - 70 && mx < ox + lw + 70 && my > oy - 70 && my < oy + lh + 70; }
    function frame(now) {
      raf = 0; if (!ok) return;
      var calm = still(), T = (now - t0) / 1000, i, p;
      c.clearRect(0, 0, w, h);
      ripples = ripples.filter(function (rp) { return now - rp.t < 1200; });
      if (!calm && (near() || ripples.length) && T > 1.9) loose = true;
      if (calm || (T > 1.9 && !loose)) {
        c.globalAlpha = .94; c.drawImage(img, ox, oy, lw, lh); c.globalAlpha = 1;
        if (!calm) {
          var sx = ((T * .3) % 1.7 - .35) * w, gr = c.createLinearGradient(sx - 60, 0, sx + 60, 0);
          gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
          c.globalCompositeOperation = 'source-atop'; c.fillStyle = gr; c.fillRect(sx - 60, 0, 120, h); c.globalCompositeOperation = 'source-over';
        }
        for (i = 0; i < P.length; i++) { p = P[i]; p.x = ox + p.hx * lw; p.y = oy + p.hy * lh; p.vx = p.vy = 0; }
      } else {
        var e = 0; c.fillStyle = '#e8e7f3';
        for (i = 0; i < P.length; i++) {
          p = P[i]; var hx = ox + p.hx * lw, hy = oy + p.hy * lh;
          if (!loose) { var a = smooth((T - p.dl) / 1.25); p.x = lerp(p.sx * w, hx, a); p.y = lerp(p.sy * h, hy, a) + Math.sin(T * 3 + p.ph) * (1 - a) * 12; }
          else {
            var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
            if (d2 < 3600) { var f = (3600 - d2) / 3600 * 2.4, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
            for (var k = 0; k < ripples.length; k++) { var rp = ripples[k], rr = (now - rp.t) * .25, ex = p.x - rp.x, ey = p.y - rp.y, de = Math.sqrt(ex * ex + ey * ey) || 1; if (Math.abs(de - rr) < 8) { p.vx += ex / de * 1.6; p.vy += ey / de * 1.6; } }
            p.vx += (hx - p.x) * .07; p.vy += (hy - p.y) * .07; p.vx *= .8; p.vy *= .8; p.x += p.vx; p.y += p.vy;
            e += Math.abs(p.x - hx) + Math.abs(p.y - hy);
          }
          c.globalAlpha = p.a; c.fillRect(p.x - .6, p.y - .6, 1.2, 1.2);
        }
        c.globalAlpha = 1;
        if (loose && !near() && !ripples.length && e / P.length < .15) loose = false;
      }
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() { size(); sample(); t0 = performance.now(); kick(); }
    hero.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) { var r = cv.getBoundingClientRect(); ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }); });
    watch(hero, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { var old = lw; size(); if (Math.abs(lw - old) > 2) sample(); kick(); } } };
  })();

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');    // numerals come from CSS so only the real number is text (aria-label on the wrapper)
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (300 + i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- tiles: spotlight under the hand, photos lean toward it
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) {
      var r = t.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      t.style.setProperty('--mx', x + 'px'); t.style.setProperty('--my', y + 'px');
      if (t.hasAttribute('data-tilt') && !still()) { var im = $('img', t); im.style.setProperty('--tx', ((x / r.width - .5) * -16).toFixed(1) + 'px'); im.style.setProperty('--ty', ((y / r.height - .5) * -12).toFixed(1) + 'px'); }
    });
    t.addEventListener('pointerleave', function () { var im = $('img', t); if (im) { im.style.setProperty('--tx', '0px'); im.style.setProperty('--ty', '0px'); } });
  });
  // the notary seal presses when tapped
  var seal = $('[data-seal]');
  seal.addEventListener('click', function () {
    if (still() || !seal.animate) return;
    $('.sealsvg', seal).animate([{ transform: 'scale(1)' }, { transform: 'scale(.9)', offset: .35 }, { transform: 'scale(1.02)', offset: .7 }, { transform: 'scale(1)' }], { duration: 420, easing: 'cubic-bezier(.23,1,.32,1)' });
  });

  // ---------------------------------------------------------------- the file drawer
  var areas = $('[data-areas]'), files = $$('[data-file]'), N = files.length, tabs = $('[data-tabs]'), tabBtns = [], count = $('[data-count]'), cur = 0;
  files.forEach(function (f, i) {
    f.style.setProperty('--tab', (3 + (i % 4) * 22) + '%');
    var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', i ? 'false' : 'true');
    b.addEventListener('click', function () { goFile(i); }); tabs.appendChild(b); tabBtns.push(b);
  });
  function fileY(i) { var r = areas.getBoundingClientRect(), top = scrollY + r.top, span = areas.offsetHeight - innerHeight; return top + span * (i + .5) / N; }
  function goFile(i) {
    i = clamp(i, 0, N - 1);
    if (still()) { files[i].scrollIntoView({ block: 'center' }); return; }
    scrollTo({ top: fileY(i), behavior: 'smooth' });
  }
  $('[data-prev]').addEventListener('click', function () { goFile(Math.round(cur) - 1); });
  $('[data-next]').addEventListener('click', function () { goFile(Math.round(cur) + 1); });
  // swipe sideways on the drawer to step through the files
  (function () { var sx = null, sy = 0; var d = $('[data-drawer]');
    d.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    d.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) goFile(Math.round(cur) + ((dx < 0) === rtl() ? -1 : 1)); }, { passive: true });
  })();
  // a label decodes out of scrambled letters when its folder comes to the front
  var GLY = 'אבגדהוזחטיכלמנסעפצקרשת§0123456789';
  function decode(el, txt) {
    if (still()) { el.textContent = txt; return; }
    var t0 = performance.now(); cancelAnimationFrame(el._d);
    (function st(t) { var k = Math.floor((t - t0) / 28); el.textContent = txt.split('').map(function (ch, i) { return i < k || ch === ' ' ? ch : GLY[Math.floor(Math.random() * GLY.length)]; }).join(''); if (k <= txt.length) el._d = requestAnimationFrame(st); })(t0);
  }
  var lastFront = -1;
  function drawer(p) {
    var calm = still();
    cur = calm ? 0 : clamp(p * N - .5, 0, N - 1);
    var front = Math.round(cur);
    files.forEach(function (f, i) {
      if (calm) { f.style.transform = ''; f.style.opacity = ''; f.style.zIndex = ''; f.style.removeProperty('--dim'); f.classList.add('front'); return; }
      var d = i - cur, tr, op = 1, dim = 0;
      // a file that has been read is drawn out of the drawer and laid aside, toward the reading direction's end
      if (d < 0) { var a = clamp(-d, 0, 1), sd = rtl() ? -1 : 1, e2 = a * a * (3 - 2 * a); tr = 'translate3d(' + (sd * e2 * 112).toFixed(1) + '%,' + (-Math.sin(a * Math.PI) * 6).toFixed(1) + '%,' + (a * 20).toFixed(1) + 'px) rotate(' + (sd * e2 * 7).toFixed(2) + 'deg)'; op = 1 - smooth((a - .5) / .5); }
      else { tr = 'translate3d(0,' + (-d * 4.6).toFixed(2) + '%,' + (-d * 60).toFixed(1) + 'px)'; dim = clamp(d * .24, 0, .8); op = d > 3 ? 0 : d > 2 ? 3 - d : 1; }
      f.style.transform = tr; f.style.opacity = op.toFixed(3); f.style.zIndex = String(N - i); f.style.setProperty('--dim', dim.toFixed(3));
      f.classList.toggle('front', i === front);
    });
    if (front !== lastFront) {
      lastFront = front;
      tabBtns.forEach(function (b, i) { b.setAttribute('aria-selected', i === front ? 'true' : 'false'); });
      count.textContent = (front + 1) + ' / ' + N;
      if (!calm) { var tab = $('.f-tab', files[front]); decode(tab, tab.dataset[root.lang]); }
    }
  }

  // ---------------------------------------------------------------- the deal: camera, signature, seal, frame
  var signSec = $('[data-signsec]'), sphoto = $('[data-sphoto]'), scam = $('[data-scam]'), sig = $('[data-sig]'), imp = $('[data-impress]'), stamp = $('[data-stamp]'), scopy = $('[data-scopy]');
  var sParts = [$('h2', scopy), $('.s-line', scopy)].concat($$('.s-steps li', scopy));
  var IW = 2400, IH = 1800;
  function sign(p) {
    var calm = still();
    if (calm) { sig.style.setProperty('--sig', '0'); imp.style.setProperty('--imp', '1'); return; }
    var W = sphoto.parentNode.clientWidth, Hh = sphoto.parentNode.clientHeight, ph = W < 800;
    var s = Math.max(W / IW, Hh / IH), bw = IW * s, bh = IH * s;
    scam.style.width = bw + 'px'; scam.style.height = bh + 'px';
    // camera: wide → in on the signature line → the seal → pull back
    var zIn = ph ? 1.6 : 1.9, f1 = [1200, 900], f2 = [1500, 1000], f3 = [1560, 1300], fx, fy, z;
    var a = range(p, .1, .3), b = range(p, .5, .6), c2 = range(p, .66, .84);
    fx = lerp(lerp(lerp(f1[0], f2[0], a), f3[0], b), 1300, c2); fy = lerp(lerp(lerp(f1[1], f2[1], a), f3[1], b), 1050, c2);
    z = lerp(lerp(1.02, zIn, a), 1.05, c2);
    var ax = .5, ay = .5;
    var tx = W * ax - z * fx * s, ty = Hh * ay - z * fy * s;
    tx = clamp(tx, W - bw * z, 0); ty = clamp(ty, Hh - bh * z, 0);
    scam.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + z.toFixed(4) + ')';
    // the signature writes itself
    sig.style.setProperty('--sig', (1 - range(p, .26, .5)).toFixed(4));
    // the seal: descends, presses, lifts; the impression appears at the press
    var ix = tx + z * 1560 * s, iy = ty + z * 1390 * s, sw = 200 * 1.55 * s * z;
    var down = range(p, .52, .61), press = range(p, .6, .63), up = range(p, .64, .72);
    stamp.style.setProperty('--sw', sw.toFixed(1) + 'px');
    var lift = (1 - down) * Hh * .35 + up * Hh * .4, sc = lerp(1.35, 1, down) * (1 - press * .04 + up * .04);
    stamp.style.transform = 'translate3d(' + (ix - sw / 2).toFixed(1) + 'px,' + (iy - sw / 2 - lift).toFixed(1) + 'px,0) rotate(-14deg) scale(' + sc.toFixed(3) + ')';
    stamp.style.opacity = (down * (1 - up)).toFixed(3);
    imp.style.setProperty('--imp', (range(p, .6, .64) * .92).toFixed(3));
    // opening: the photo opens from a frame to full screen; closing: it shrinks back into a frame at the far side
    var open = range(p, 0, .08), shut = c2;
    var t, r, bt, l, rad;
    if (ph) { t = lerp(lerp(Hh * .12, 0, open), 70, shut); bt = lerp(lerp(Hh * .12, 0, open), Hh * .55, shut); l = lerp(lerp(W * .06, 0, open), 16, shut); r = l; }
    else {
      var far = W * .5, near = W * .04;
      t = lerp(lerp(Hh * .1, 0, open), Hh * .14, shut); bt = lerp(lerp(Hh * .1, 0, open), Hh * .1, shut);
      var st = lerp(lerp(W * .18, 0, open), far, shut), en = lerp(lerp(W * .18, 0, open), near, shut);
      l = rtl() ? en : st; r = rtl() ? st : en;
    }
    rad = Math.max(1 - open, shut) * 24;
    sphoto.style.setProperty('--ct', t.toFixed(1) + 'px'); sphoto.style.setProperty('--cb', bt.toFixed(1) + 'px');
    sphoto.style.setProperty('--cl', l.toFixed(1) + 'px'); sphoto.style.setProperty('--cr', r.toFixed(1) + 'px'); sphoto.style.setProperty('--cround', rad.toFixed(1) + 'px');
    sParts.forEach(function (el, i) { el.style.setProperty('--o', range(p, .8 + i * .02, .88 + i * .02).toFixed(3)); });
  }

  // ---------------------------------------------------------------- the letter to Dana: tabs, tick boxes, a letter that writes itself
  var subBtns = $$('[data-sub]'), boxes = $('[data-boxes]'), radios = $$('input[name="st"]', boxes), bodyEl = $('[data-body]'), nameIn = $('[data-name]'), send = $('[data-send]');
  var wsteps = $$('[data-wstep]'), shown = '', typing = 0, seen = false;
  function wstep(n) { wsteps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  subBtns.forEach(function (b) { b.addEventListener('click', function () { subBtns.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); wstep(0); write(); }); });
  radios.forEach(function (r) { r.addEventListener('change', function () { wstep(1); write(); }); });
  nameIn.addEventListener('input', function () { write(true); });
  send.addEventListener('pointerenter', function () { wstep(2); });
  send.addEventListener('focus', function () { wstep(2); });
  function compose() {
    var l = he(), b = subBtns.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], deal = b.hasAttribute('data-deal');
    boxes.hidden = !deal;
    var r = radios.filter(function (x) { return x.checked; })[0], nm = nameIn.value.trim();
    var txt = l ? 'שלום דנה,\nאשמח להתייעץ איתך לגבי ' + b.dataset.he + '.' : 'Hi Dana,\nI’d like to consult you about ' + b.dataset.en + '.';
    if (deal) txt += ' ' + r.dataset[l ? 'he' : 'en'];
    if (nm) txt += '\n' + nm;
    return txt;
  }
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !seen) { shown = target; bodyEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var from = shown, t0 = performance.now(), del = from.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 15);
      shown = n < del ? from.slice(0, from.length - n) : target.slice(0, keep + (n - del));
      bodyEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-letter]'), function (v) { if (v && !seen) { seen = true; if (!still()) { shown = ''; bodyEl.textContent = ''; } write(); } }, { threshold: .35 });
  if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { wstep(0); ob.disconnect(); } }, { rootMargin: '-30% 0px -30% 0px' }).observe($('[data-wsteps]'));

  // ---------------------------------------------------------------- reviews: two copies per row so the drift loops seamlessly
  $$('[data-track]').forEach(function (t) { $$('.rv', t).forEach(function (rv) { var k = rv.cloneNode(true); k.setAttribute('aria-hidden', 'true'); t.appendChild(k); }); if (t.children.length < 6) $$('.rv:not([aria-hidden])', t).forEach(function (rv) { var k = rv.cloneNode(true); k.setAttribute('aria-hidden', 'true'); t.appendChild(k); var k2 = rv.cloneNode(true); k2.setAttribute('aria-hidden', 'true'); t.appendChild(k2); }); });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var leadin = $('[data-leadin]'), who = $('[data-who]'), whoIn = $('[data-whoin]'), sweep = $('[data-sweep]'), sweepI = $('i', sweep);
  var acts = $('[data-acts]'), slip = $('[data-slip]'), flogo = $('[data-flogo]'), fhor = $('[data-fhor] i'), foot = $('[data-foot]');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function clearStyles() {
    who.style.clipPath = ''; whoIn.style.transform = ''; whoIn.style.filter = ''; sweep.classList.remove('on');
    files.forEach(function (f) { f.style.transform = ''; f.style.opacity = ''; f.style.zIndex = ''; });
    scam.style.transform = ''; scam.style.width = ''; scam.style.height = ''; stamp.style.opacity = '';
    ['--ct', '--cb', '--cl', '--cr', '--cround'].forEach(function (k) { sphoto.style.removeProperty(k); });
    sParts.forEach(function (el) { el.style.removeProperty('--o'); });
    portrait.style.setProperty('--px', '0px'); portrait.style.setProperty('--py', '0px');
    flogo.style.removeProperty('--rise'); flogo.style.removeProperty('--fo'); fhor.style.removeProperty('--hr');
    lastFront = -1;
  }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, vw = innerWidth;
    nav.classList.toggle('pill', scrollY > 40);
    var ar = acts.getBoundingClientRect(); slip.classList.toggle('away', ar.bottom > 0 && ar.top < vh && scrollY < hero.offsetHeight);
    if (!calm) {
      // the ribbon sweep: who slides in over the sticky hero behind a diagonal front edge, her ribbon riding that edge
      var wr = who.getBoundingClientRect(), q = clamp((vh - wr.top) / vh, 0, 1), tn = phone() ? .55 : .34, k = vw * tn;
      var L = -q * k * 1.1 - q * vh * .12;
      who.style.clipPath = q >= 1 ? '' : 'polygon(0 ' + (rtl() ? L + k : L).toFixed(1) + 'px,100% ' + (rtl() ? L : L + k).toFixed(1) + 'px,100% 100%,0 100%)';
      var on = q > 0 && q < 1; sweep.classList.toggle('on', on);
      if (on) {
        var y0 = wr.top + (rtl() ? L + k : L), ang = Math.atan2(rtl() ? -k : k, vw) * 180 / Math.PI;
        sweepI.style.transform = 'translate3d(' + (-vw * .1).toFixed(0) + 'px,' + (y0 + (rtl() ? k * .1 : -k * .1)).toFixed(1) + 'px,0) rotate(' + ang.toFixed(3) + 'deg)';
      }
      // the bento sinks a little as the drawer lands over it like a card on a stack
      var arr = areas.getBoundingClientRect(), s2 = clamp((vh - arr.top) / vh, 0, 1);
      whoIn.style.transform = s2 > 0 ? 'scale(' + (1 - s2 * .06).toFixed(4) + ')' : '';
      whoIn.style.filter = s2 > 0 ? 'brightness(' + (1 - s2 * .35).toFixed(3) + ')' : '';
      // the statement fills in
      var fr = fillEl.getBoundingClientRect(), fp = clamp((vh * .92 - fr.top) / (vh * .55), 0, 1);
      fillChars.forEach(function (c, i) { c.classList.toggle('on', fp * fillChars.length > i); });
    }
    drawer(calm ? 0 : prog(areas));
    sign(calm ? 1 : prog(signSec));
    // the footer: logo rises out of the curtain, the horizon lifts
    var ftr = foot.getBoundingClientRect(), fpp = calm ? 1 : clamp((vh - ftr.top) / Math.max(1, Math.min(ftr.height, vh)), 0, 1);
    if (!calm) { flogo.style.setProperty('--rise', ((1 - smooth(fpp)) * 60).toFixed(1) + 'px'); flogo.style.setProperty('--fo', smooth(fpp * 1.4).toFixed(3)); fhor.style.setProperty('--hr', ((1 - smooth(fpp)) * 80).toFixed(1) + 'px'); }
  }

  function layout() {
    // a hero taller than the screen sticks by its bottom edge
    hero.style.setProperty('--stick', Math.min(0, innerHeight - hero.offsetHeight) + 'px');
    light.size(); motes.size(); ink.size(); tick();
  }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (innerWidth !== lw || !phone()) { lw = innerWidth; layout(); } else tick(); }, 140); });
  addEventListener('scroll', tick, { passive: true });

  splitTitle(); splitFill(); texts(root.lang); hours(); write(true); layout(); light.kick();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 900);
  addEventListener('load', function () { ink.size(); tick(); });
})();
