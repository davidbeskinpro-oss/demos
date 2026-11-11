(function () {
  var root = document.documentElement, WA = '972544984822';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var coarse = matchMedia('(hover: none)').matches;
  var TITLE = { he: 'יאנה קוסמטיקאית · טיפולי פנים, גבות והסרת שיער · שלום עליכם 1, חיפה', en: 'Yana Cosmetologist · Facials, brows and hair removal · 1 Shalom Aleichem St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור יאנה קוסמטיקאית · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Yana Cosmetologist · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'יאנה קוסמטיקאית', 'Yana Cosmetologist');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-visit]', 'ביקור', 'Visit');
    aria('[data-t-flower]', 'טיפולים', 'Treatments');
    aria('[data-t-days]', 'יום', 'Day');
    aria('[data-t-call]', 'להתקשר ליאנה, 054-498-4822', 'Call Yana, 054-498-4822');
    aria('[data-t-wa]', 'וואטסאפ ליאנה', 'WhatsApp Yana');
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('yana-lang', l); } catch (e) {}
    texts(l); hours(); days(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('yana-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    clearStyles(); layout(); petals.kick(); logo.finish(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 19], 1: null, 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [8, 13], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
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
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // consecutive days with the same hours share a row; the week starts on Sunday
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
  $$('[data-bento]').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 7 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
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

  // ---------------------------------------------------------------- petals: her logo's blossoms drift down the whole page
  var petals = (function () {
    var cv = $('[data-petals]'), c = cv.getContext('2d'), P = [], raf = 0, last = 0, wind = 0, mx = -999, my = -999, W = 0, Hh = 0;
    var COL = ['#f9dde5', '#f4c3d1', '#fbeef0', '#eeb0c2', '#f7d2dc'];
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; Hh = innerHeight; cv.width = W * dpr; cv.height = Hh * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function make(x, y, vx, vy) { return { x: x, y: y, vx: vx || 0, vy: vy || (.35 + Math.random() * .5), s: 6 + Math.random() * 7, r: Math.random() * 6.28, vr: (Math.random() - .5) * .04, f: Math.random() * 6.28, vf: .03 + Math.random() * .04, sw: 6 + Math.random() * 16, ph: Math.random() * 6.28, col: COL[(Math.random() * COL.length) | 0], life: 1 }; }
    function fill() { var n = phone() ? 12 : 20; while (P.length < n) P.push(make(Math.random() * W, Math.random() * Hh)); }
    function shape(p) {
      // one notched cherry petal, tumbling in 3D (scaleY follows its flip)
      c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.scale(1, Math.cos(p.f) * .8 + .2);
      var s = p.s; c.beginPath(); c.moveTo(0, s * .55);
      c.bezierCurveTo(-s * .75, 0, -s * .55, -s * .75, -s * .18, -s * .82);
      c.lineTo(0, -s * .62); c.lineTo(s * .18, -s * .82);
      c.bezierCurveTo(s * .55, -s * .75, s * .75, 0, 0, s * .55);
      c.fillStyle = p.col; c.globalAlpha = .88 * p.life; c.fill();
      c.globalAlpha = .35 * p.life; c.fillStyle = '#d47f98'; c.beginPath(); c.ellipse(0, s * .3, s * .12, s * .22, 0, 0, 6.28); c.fill();
      c.restore();
    }
    function frame(t) {
      raf = 0; if (still() || document.hidden) { c.clearRect(0, 0, W, Hh); return; }
      var dt = last ? Math.min(3, (t - last) / 16.67) : 1; last = t; wind *= .94;
      c.clearRect(0, 0, W, Hh);
      for (var i = P.length - 1; i >= 0; i--) {
        var p = P[i];
        p.ph += .018 * dt; p.f += p.vf * dt; p.r += p.vr * dt;
        var sx = Math.sin(p.ph) * p.sw * .03;
        p.vx = lerp(p.vx, sx + wind * (rtl() ? -1 : 1) * .6, .05);
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 9000) { var k = (1 - d2 / 9000) * 1.6; p.vx += dx / 95 * k; p.vy += dy / 95 * k * .4; }
        p.vy = lerp(p.vy, .45 + p.s * .04, .03);
        p.x += p.vx * dt; p.y += (p.vy + Math.abs(wind) * .25) * dt;
        if (p.extra) { p.life -= .003 * dt; }
        if (p.y > Hh + 20 || p.x < -30 || p.x > W + 30 || p.life <= 0) {
          if (p.extra) { P.splice(i, 1); continue; }
          P[i] = make(Math.random() * W, -20);
        }
        shape(P[i]);
      }
      kick();
    }
    function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); }
    addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') { mx = e.clientX; my = e.clientY; } }, { passive: true });
    document.addEventListener('visibilitychange', function () { last = 0; kick(); });
    return {
      size: function () { size(); fill(); kick(); }, kick: function () { last = 0; kick(); },
      gust: function (v) { wind = clamp(wind + v, -6, 6); },
      drop: function (x, y) { if (still() || P.length > 46) return; var p = make(x, y, (Math.random() - .5) * 1.4, .2 + Math.random() * .4); p.extra = true; p.s = 8 + Math.random() * 5; P.push(p); kick(); }
    };
  })();

  // ---------------------------------------------------------------- the hero logo, assembled from its own pixels, then shaking off petals
  var hero = $('[data-hero]'), logoBox = $('[data-logo]'), logoImg = $('img', logoBox);
  var logo = (function () {
    var cv = $('[data-logo-cv]'), c = cv.getContext('2d'), pts = [], t0 = 0, raf = 0, ok = false, done = false;
    function start() {
      if (still()) { finish(); return; }
      var bw = logoBox.clientWidth, bh = logoBox.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
      var CW = cv.clientWidth, CH = cv.clientHeight, ox = (CW - bw) / 2, oy = (CH - bh) / 2;
      cv.width = CW * dpr; cv.height = CH * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var off = document.createElement('canvas'), step = Math.max(3, Math.round(bw / 95)); off.width = bw; off.height = bh;
      var oc = off.getContext('2d'); oc.drawImage(logoImg, 0, 0, bw, bh);
      var d; try { d = oc.getImageData(0, 0, bw, bh).data; } catch (e) { finish(); return; }
      pts = [];
      for (var y = 0; y < bh; y += step) for (var x = 0; x < bw; x += step) {
        var k = (y * bw + x) * 4; if (d[k + 3] < 140) continue;
        var a = Math.random() * 6.28, rr = (.55 + Math.random() * .6) * Math.max(CW, CH) * .5;
        pts.push({ tx: ox + x, ty: oy + y, sx: CW / 2 + Math.cos(a) * rr, sy: CH / 2 + Math.sin(a) * rr - CH * .2, col: 'rgb(' + d[k] + ',' + d[k + 1] + ',' + d[k + 2] + ')', dl: Math.random() * 380, s: step * .95 });
      }
      ok = true; t0 = performance.now(); raf = requestAnimationFrame(frame);
    }
    function frame(t) {
      raf = 0; var e = t - t0, W = cv.clientWidth, Hh = cv.clientHeight; c.clearRect(0, 0, W, Hh);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i], k = clamp((e - p.dl) / 1050, 0, 1), q = 1 - Math.pow(1 - k, 3);
        var x = lerp(p.sx, p.tx, q), y = lerp(p.sy, p.ty, q) + Math.sin(k * 3.14) * -24;
        c.globalAlpha = Math.min(1, k * 3); c.fillStyle = k < .6 ? '#f2bccb' : p.col;
        c.beginPath(); c.arc(x, y, p.s * (1.5 - k * .9) * .5, 0, 6.28); c.fill();
      }
      if (e > 1480) { finish(); return; }
      raf = requestAnimationFrame(frame);
    }
    function finish() {
      if (raf) cancelAnimationFrame(raf); raf = 0;
      logoBox.classList.add('done'); done = true;
      cv.style.transition = 'opacity .7s ease'; cv.style.opacity = '0';
      setTimeout(function () { c.clearRect(0, 0, cv.width, cv.height); }, 800);
    }
    // the logo's own white blossoms (measured on the image: two at the tips of the Y)
    var BL = [[.09, .05], [.46, .14]], lastDrop = 0;
    function shed(n) {
      var r = logoImg.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      for (var i = 0; i < n; i++) { var b = BL[(Math.random() * 2) | 0], x = rtl() ? b[0] : b[0]; petals.drop(r.left + x * r.width + (Math.random() - .5) * 18, r.top + b[1] * r.height); }
    }
    logoBox.addEventListener('pointermove', function () { var t = performance.now(); if (t - lastDrop > 140) { lastDrop = t; shed(1); } });
    logoBox.addEventListener('pointerdown', function () { shed(5); });
    setInterval(function () { if (!still() && done && !document.hidden) shed(1); }, 2600);
    return { start: start, finish: finish };
  })();

  // hero photos follow the hand (desktop) or the scroll (phone)
  var layers = $$('[data-depth]', hero), hx = 0, hy = 0, tx = 0, ty = 0, hraf = 0;
  hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; if (!hraf) hraf = requestAnimationFrame(par); });
  function par() {
    hraf = 0; if (still()) return;
    hx = lerp(hx, tx, .08); hy = lerp(hy, ty, .08);
    var sy = Math.min(scrollY, innerHeight);
    layers.forEach(function (l) { var d = +l.dataset.depth; l.style.transform = 'translate3d(' + (hx * d).toFixed(1) + 'px,' + (hy * d + sy * (d > 0 ? .22 : -.12)).toFixed(1) + 'px,0)'; });
    if (Math.abs(hx - tx) > .001 || Math.abs(hy - ty) > .001) hraf = requestAnimationFrame(par);
  }

  // ---------------------------------------------------------------- hands: the blossom opens into the photo
  var hands = $('[data-hands]'), mask = $('[data-mask]'), mimg = $('img', mask), seam = $('[data-seam]'), hcopy = $$('.hd-copy > *'), htag = $('.tag', mask);

  // ---------------------------------------------------------------- care: the branch
  var care = $('[data-care]'), track = $('[data-track]'), trs = $$('[data-tr]'), br = $('[data-branch]'), bpaths = $$('path', br), twigs = $('.twigs', br), blen = 1, centers = [], dist = 0;
  var NS = 'http://www.w3.org/2000/svg';
  function buildBranch() {
    var W = track.scrollWidth; br.setAttribute('width', W); br.style.width = W + 'px';
    var R = rtl(), y0 = 34;
    centers = trs.map(function (t) { return t.offsetLeft + t.offsetWidth / 2; });
    var xs = centers.slice(); if (R) xs.reverse();
    // a main branch that waves gently from the start side to the end side, a little twig down to every blossom
    var start = R ? W : 0, endX = R ? 0 : W, d = 'M' + start + ' ' + (y0 + 14), prevX = start, prevY = y0 + 14;
    var order = R ? centers.slice().sort(function (a, b) { return b - a; }) : centers.slice().sort(function (a, b) { return a - b; });
    order.forEach(function (cx, i) {
      var y = y0 + (i % 2 ? -14 : 12), mx = (prevX + cx) / 2;
      d += ' C' + mx + ' ' + prevY + ' ' + mx + ' ' + y + ' ' + cx + ' ' + y; prevX = cx; prevY = y;
    });
    d += ' C' + ((prevX + endX) / 2) + ' ' + prevY + ' ' + ((prevX + endX) / 2) + ' ' + (y0 + 6) + ' ' + endX + ' ' + (y0 - 4);
    bpaths.forEach(function (p) { p.setAttribute('d', d); });
    blen = bpaths[0].getTotalLength();
    bpaths.forEach(function (p) { p.style.strokeDasharray = blen + ' ' + blen; });
    twigs.innerHTML = '';
    var top = track.querySelector('.tr').offsetTop;
    trs.forEach(function (t, i) {
      var cx = t.offsetLeft + t.offsetWidth / 2, by = top - 92 + 38, k = i % 2 ? -14 : 12, s = R ? 1 : -1;
      var tw = document.createElementNS(NS, 'path');
      tw.setAttribute('d', 'M' + (cx + s * 40) + ' ' + (y0 + k + 2) + ' Q' + (cx + s * 6) + ' ' + (y0 + k + 6) + ' ' + cx + ' ' + (by - 18));
      tw.style.transition = 'opacity .5s ease'; twigs.appendChild(tw); t._tw = tw;
    });
  }
  function decode(h) {
    var sp = $('span[lang="' + root.lang + '"]', h); if (!sp || sp._busy) return;
    var fin = sp.dataset.t || sp.textContent; sp.dataset.t = fin; sp._busy = true;
    var pool = he() ? 'אבגדהוזחטיכלמנסעפצקרשת' : 'abcdefghijklmnopqrstuvwxyz', t0 = performance.now();
    (function step(t) {
      var k = clamp((t - t0) / 520, 0, 1), n = Math.floor(fin.length * k);
      sp.textContent = fin.slice(0, n) + fin.slice(n).replace(/[^\s־'-]/g, function () { return pool[(Math.random() * pool.length) | 0]; });
      if (k < 1) requestAnimationFrame(step); else { sp.textContent = fin; sp._busy = false; }
    })(t0);
  }

  // ---------------------------------------------------------------- words: reviews fall like petals and open into a flower
  var words = $('[data-words]'), rvs = $$('[data-rv]'), order = rvs.map(function (_, i) { return i; }), JIT = [-3, 2.5, -1.5, 1];
  rvs.forEach(function (rv, i) {
    rv.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      order.splice(order.indexOf(i), 1); order.push(i);
      rvs.forEach(function (r) { r.classList.add('swap'); r.style.transition = 'transform .55s cubic-bezier(.23,1,.32,1)'; });
      setTimeout(function () { rvs.forEach(function (r) { r.style.transition = ''; }); }, 600);
      tick();
    });
  });

  // ---------------------------------------------------------------- write: the blossom composer and the message that writes itself
  var picks = $$('[data-pick]'), chosen = [], day = null, typed = $('[data-typed]'), send = $('[data-send]'), heart = $('.heart'), shown = '', typer = 0;
  picks.forEach(function (b) {
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () {
      var on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on);
      var k = picks.indexOf(b); if (on) chosen.push(k); else chosen.splice(chosen.indexOf(k), 1);
      $('[data-count]').textContent = chosen.length; heart.classList.remove('pop'); void heart.offsetWidth; heart.classList.add('pop');
      if (on && !still()) { var r = b.getBoundingClientRect(); for (var i = 0; i < 3; i++) petals.drop(r.left + r.width / 2, r.top + r.height / 2); }
      write();
    });
  });
  var SH = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], SE = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  function days() {
    var box = $('[data-days]'), l = he();
    box.innerHTML = [0, 1, 2, 3, 4, 5, 6].map(function (d) {
      var name = (l ? dayHe : dayEn)[d], closed = !H[d];
      return '<button type="button" class="day" data-day="' + d + '" aria-pressed="' + (day === d) + '"' + (closed ? ' disabled' : '') + ' aria-label="' + name + (closed ? (l ? ' · סגור' : ' · closed') : '') + '">' + (l ? SH : SE)[d] + '</button>';
    }).join('');
    $$('.day', box).forEach(function (b) { b.addEventListener('click', function () { var d = +b.dataset.day; day = day === d ? null : d; days(); write(); }); });
  }
  function message() {
    var l = he(), list = chosen.map(function (k) { return picks[k].dataset[l ? 'he' : 'en']; });
    if (l) return 'היי יאנה, אשמח לקבוע תור.' + (list.length ? '\nמה מעניין אותי: ' + list.join(', ') + '.' : '') + (day !== null ? '\nמתאים לי ביום ' + dayHe[day] + '.' : '') + '\nתודה!';
    return 'Hi Yana, I’d like to book an appointment.' + (list.length ? '\nI’m interested in: ' + list.join(', ') + '.' : '') + (day !== null ? '\n' + dayEn[day] + ' works for me.' : '') + '\nThank you!';
  }
  function write(instant) {
    var m = message(); send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    clearInterval(typer);
    if (instant || still()) { shown = m; typed.textContent = m; return; }
    var p = 0; while (p < shown.length && p < m.length && shown[p] === m[p]) p++;
    shown = shown.slice(0, p);
    typer = setInterval(function () { if (shown.length >= m.length) { clearInterval(typer); return; } shown = m.slice(0, shown.length + 2); typed.textContent = shown; }, 22);
    typed.textContent = shown;
  }

  // ---------------------------------------------------------------- bento: a soft light that follows the hand, or wanders by itself on phones
  var bento = $('[data-bento]'), tiles = $$('.tile', bento);
  bento.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    tiles.forEach(function (t) { var r = t.getBoundingClientRect(); t.style.setProperty('--x', (e.clientX - r.left) + 'px'); t.style.setProperty('--y', (e.clientY - r.top) + 'px'); t.classList.add('lit'); });
  });
  bento.addEventListener('pointerleave', function () { tiles.forEach(function (t) { t.classList.remove('lit'); }); });
  var wander = 0, bvis = false;
  watch(bento, function (v) { bvis = v; if (coarse && v && !wander) wander = requestAnimationFrame(walk); });
  function walk(t) {
    wander = 0; if (!bvis || still()) { tiles.forEach(function (x) { x.classList.remove('lit'); }); return; }
    tiles.forEach(function (x, i) { var a = t / 1400 + i * 1.3; x.style.setProperty('--x', (50 + Math.cos(a) * 40) + '%'); x.style.setProperty('--y', (50 + Math.sin(a * 1.3) * 40) + '%'); x.classList.add('lit'); });
    wander = requestAnimationFrame(walk);
  }

  // the leaflet leans toward the hand
  $$('[data-tilt]').forEach(function (el) {
    el.addEventListener('pointermove', function (e) { if (still() || e.pointerType !== 'mouse') return; var r = el.getBoundingClientRect(); el.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 14 + 'deg'); el.style.setProperty('--rx', -((e.clientY - r.top) / r.height - .5) * 12 + 'deg'); });
    el.addEventListener('pointerleave', function () { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var nav = $('[data-nav]'), foot = $('[data-foot]'), page = $('.page'), twig = $('[data-twig]'), fname = $('[data-ftname]');
  var ticking = false, lastY = scrollY;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function clearStyles() {
    [mask, mimg, seam.children[0], seam.children[1], track].concat(hcopy, rvs, trs).forEach(function (el) { el.style.transform = ''; el.style.opacity = ''; });
    mask.style.removeProperty('--ms'); hcopy.forEach(function (el) { el.style.removeProperty('--o'); });
    care.style.height = ''; layers.forEach(function (l) { l.style.transform = ''; });
  }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, dy = scrollY - lastY; lastY = scrollY;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) { petals.gust(clamp(dy * .05, -1.5, 1.5)); if (!hraf) hraf = requestAnimationFrame(par); }

    // hands: blossom mask from a bud to the full screen, the camera settles, the headline seam shuts
    if (!calm) {
      var hp = prog(hands), m = smooth(hp / .55), ms = lerp(26, 640, m * m);
      mask.style.setProperty('--ms', ms.toFixed(1) + 'vmax'); mask.classList.toggle('full', ms > 620);
      mimg.style.transform = 'scale(' + lerp(1.35, 1, smooth(hp / .7)).toFixed(4) + ') rotate(' + lerp(-6, 0, m).toFixed(2) + 'deg)';
      var q = smooth((hp - .42) / .22), off = (1 - q) * Math.min(220, innerWidth * .16);
      seam.children[0].style.transform = 'translateX(' + (-off).toFixed(1) + 'px)'; seam.children[1].style.transform = 'translateX(' + off.toFixed(1) + 'px)';
      seam.children[0].style.opacity = seam.children[1].style.opacity = q.toFixed(3); seam.classList.toggle('shut', q > .995);
      hcopy[1].style.setProperty('--o', smooth((hp - .6) / .14).toFixed(3));
      hcopy[2].style.setProperty('--o', smooth((hp - .7) / .14).toFixed(3));
      htag.style.opacity = smooth((hp - .5) / .1).toFixed(3);
    }

    // care: the track slides sideways, the branch grows ahead of it, blossoms open where it reaches
    var W = track.scrollWidth, cp = calm ? 1 : prog(care);
    if (!calm) track.style.transform = 'translate3d(' + ((rtl() ? 1 : -1) * dist * cp).toFixed(1) + 'px,0,0)';
    var reach = calm ? 1 : clamp((dist * cp + innerWidth * .78) / W, 0, 1);
    bpaths.forEach(function (p) { p.style.strokeDashoffset = (blen * (1 - reach)).toFixed(1); });
    trs.forEach(function (t, i) {
      var from = rtl() ? (W - centers[i]) / W : centers[i] / W, on = calm || from < reach - .015;
      if (on && !t.classList.contains('on') && !calm) decode($('h3', t));
      t.classList.toggle('on', on); if (t._tw) t._tw.style.opacity = on ? 1 : 0;
    });

    // words: each review falls along a swaying path, lands on the pile, then the pile opens like a flower
    if (!calm) {
      var wp = prog(words), N = rvs.length, f = smooth((wp - .58) / .28), spread = phone() ? 8 : 14;
      rvs.forEach(function (rv, i) {
        var t = smooth((wp - .02 - i * .11) / .2), pos = order.indexOf(i), rank = N - 1 - pos;           // rank 0 = the front card
        var side = rank === 0 ? 0 : (rank % 2 ? -1 : 1) * Math.ceil(rank / 2) * (rank === 3 ? 1.5 : 1);
        var ang = lerp(JIT[i], side * spread, f) + (1 - t) * (i % 2 ? 46 : -38);
        var x = Math.sin(t * 4.2 + i) * (1 - t) * 90, y = (1 - t) * -(vh * 1.1);
        rv.style.transform = 'translate3d(' + x.toFixed(1) + 'px,calc(-50% + ' + y.toFixed(1) + 'px),0) rotate(' + ang.toFixed(2) + 'deg)';
        rv.style.zIndex = 10 + pos; rv.style.opacity = t > 0 ? 1 : 0;
      });
    }

    // footer curtain: the name rises letter by letter as the page lifts off it
    var docH = document.documentElement.scrollHeight, fh = foot.offsetHeight, fp = calm ? 1 : smooth((scrollY + vh - (docH - fh)) / fh);
    fname.style.transform = calm ? '' : 'translateY(' + ((1 - fp) * 40).toFixed(1) + 'px)'; fname.style.opacity = calm ? '' : (.3 + fp * .7).toFixed(3);
    twig.classList.toggle('hide', scrollY + vh > docH - fh * .5);
  }

  function layout() {
    petals.size();
    if (!still()) {
      care.style.height = '';
      dist = Math.max(0, track.scrollWidth - innerWidth);
      care.style.height = (innerHeight + dist * 1.15) + 'px';
      page.style.setProperty('--fh', foot.offsetHeight + 'px');
    } else { dist = 0; }
    buildBranch(); tick();
  }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (innerWidth !== lw || !coarse) { lw = innerWidth; layout(); } else tick(); }, 140); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); days(); write(true); layout();
  var once = false, go = function () {
    if (once) return; once = true;
    requestAnimationFrame(function () { hero.classList.add('ready'); layout(); });
    if (logoImg.complete) logo.start(); else logoImg.addEventListener('load', logo.start);
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { layout(); });
})();
