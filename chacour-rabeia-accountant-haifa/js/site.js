(function () {
  var root = document.documentElement, WA = '972527742312';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 700; };
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'שקור רביע · משרד רואה חשבון · סירקין 15, חיפה', en: 'Chacour Rabeia · Accountant’s Office · 15 Sirkin St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור שקור רביע - משרד רואה חשבון · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Chacour Rabeia, Accountant’s Office · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'שקור רביע - משרד רואה חשבון', 'Chacour Rabeia, Accountant’s Office');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-row]', 'תחומים', 'Areas of work');
    aria('[data-t-topics]', 'על מה מדברים', 'What it’s about');
    aria('[data-t-kind]', 'סוג העסק', 'Type of business');
    aria('[data-t-call]', 'חיוג למשרד, 052-774-2312', 'Call the office, 052-774-2312');
    aria('[data-t-wa]', 'וואטסאפ למשרד', 'WhatsApp the office');
    aria('.q .stars', '5 כוכבים', '5 stars');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: סירקין 15, חיפה' : 'Map: 15 Sirkin St, Haifa'; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('cr-lang', l); } catch (e) {}
    texts(l); hours(); inkWords(); tape.reset(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('cr-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    facets.kick(); gold.kick(); mosaic.kick(); write(true); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8.5, 17], 1: [8.5, 17], 2: [8.5, 17], 3: [8.5, 17], 4: [8.5, 17], 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', day: '2-digit', month: '2-digit', year: '2-digit', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
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
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 10 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // glyph decode: figures scramble and settle on the real value
  function decode(el, to, dur) {
    if (still()) { el.textContent = to; return; }
    var t0 = performance.now(), G = '0123456789';
    (function st(t) {
      var u = (t - t0) / dur, out = '';
      for (var i = 0; i < to.length; i++) out += /\d/.test(to[i]) && u < (i + 1) / (to.length + 1) + .35 ? G[Math.floor(Math.random() * 10)] : to[i];
      el.textContent = out;
      if (u < 1) requestAnimationFrame(st); else el.textContent = to;
    })(t0);
  }

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- the brand's facets: a field of tilted black triangles that catch gold light
  var facets = (function () {
    var cv = $('[data-facets]'), c = cv.getContext('2d'), T = [], w, h, raf = 0, vis = true, px = -1, py = -1, t0 = performance.now();
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var s = phone() ? 74 : 112, hh = s * .866, cols = Math.ceil(w / (s / 2)) + 2, rows = Math.ceil(h / hh) + 1; T = [];
      for (var r = 0; r < rows; r++) for (var k = 0; k < cols; k++) {
        var x = k * s / 2 - s / 2, y = r * hh, up = (k + r) % 2 === 0;
        var p = up ? [[x, y + hh], [x + s / 2, y], [x + s, y + hh]] : [[x, y], [x + s, y], [x + s / 2, y + hh]];
        var nx = Math.random() * 2 - 1, ny = Math.random() * 2 - 1;     // each facet leans its own way, like the banner's
        T.push({ p: p, cx: x + s / 2, cy: y + hh / 2, nx: nx, ny: ny, b: .05 + Math.random() * .05 });
      }
    }
    function draw(now) {
      var calm = still(), tt = (now - t0) / 1000;
      // the light: the hand on desktop; otherwise a lamp drifting slowly across the field
      var lx = px >= 0 ? px : w * (.5 + .38 * Math.sin(tt * .23)), ly = py >= 0 ? py : h * (.35 + .25 * Math.cos(tt * .17));
      if (calm) { lx = w * .78; ly = h * .25; }
      var sweep = calm ? -9 : ((tt * .16) % 1.6) - .3;                   // a glint crossing the field now and then
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < T.length; i++) {
        var f = T[i], dx = (lx - f.cx) / w, dy = (ly - f.cy) / h, d = Math.sqrt(dx * dx + dy * dy) + .001;
        var face = clamp((f.nx * dx + f.ny * dy) / d, -1, 1), near = Math.max(0, 1 - d * 2.4);
        var band = Math.max(0, 1 - Math.abs((f.cx / w + f.cy / h * .5) - sweep * 1.5) * 9) * (f.nx > .3 ? 1 : .2);
        var L = f.b + Math.max(0, face) * near * .5 + band * .35, g = clamp(near * Math.max(0, face) * 1.4 + band, 0, 1);
        var R = Math.round(lerp(22, 217, g * .55) * (.6 + L)), Gc = Math.round(lerp(22, 173, g * .55) * (.6 + L)), B = Math.round(lerp(26, 75, g * .55) * (.6 + L));
        c.fillStyle = 'rgb(' + R + ',' + Gc + ',' + B + ')';
        c.beginPath(); c.moveTo(f.p[0][0], f.p[0][1]); c.lineTo(f.p[1][0], f.p[1][1]); c.lineTo(f.p[2][0], f.p[2][1]); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(243,213,138,' + (.03 + g * .22).toFixed(3) + ')'; c.lineWidth = 1; c.stroke();
      }
    }
    function frame(now) { raf = 0; draw(now); if (vis && !still()) raf = requestAnimationFrame(frame); }
    if (finePointer) {
      hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
      hero.addEventListener('pointerleave', function () { px = py = -1; });
    }
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- his real logo, assembled from its own gold pixels; then the real file settles in
  var gold = (function () {
    var box = $('.h-logo'), cv = $('[data-gold]'), c = cv.getContext('2d'), img = $('[data-logo]');
    var P = [], w, h, raf = 0, vis = true, t0 = 0, ok = false, mx = -999, my = -999;
    function sample() {
      try {
        var iw = 280, ih = Math.round(280 * 345 / 560), sc = document.createElement('canvas'); sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data, pts = [];
        for (var y = 0; y < ih; y += 2) for (var x = 0; x < iw; x += 2) { var k = (y * iw + x) * 4; if (d[k + 3] > 150) pts.push([x / iw, y / ih, d[k], d[k + 1], d[k + 2]]); }
        var want = phone() ? 900 : 1800, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) { var q = pts[Math.floor(f)]; P.push({ hx: q[0], hy: q[1], col: 'rgb(' + q[2] + ',' + q[3] + ',' + q[4] + ')', a0: Math.random() * 6.28, r0: .6 + Math.random() * .8, dl: Math.random() * .6, ph: Math.random() * 6.28, x: 0, y: 0 }); }
        ok = P.length > 0;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(now) {
      raf = 0; if (!ok) return;
      var T = (now - t0) / 1000, ir = img.getBoundingClientRect(), cr = cv.getBoundingClientRect();
      var ox = ir.left - cr.left, oy = ir.top - cr.top, bw = ir.width, bh = ir.height;
      var settled = T > 2.3; box.classList.toggle('settled', settled || still());
      c.clearRect(0, 0, w, h); c.globalCompositeOperation = 'lighter';
      for (var i = 0; i < P.length; i++) {
        var p = P[i], a = smooth((T - p.dl) / 1.5), tx = ox + p.hx * bw, ty = oy + p.hy * bh;
        var sxp = w / 2 + Math.cos(p.a0) * w * p.r0, syp = h / 2 + Math.sin(p.a0) * h * p.r0;
        var x = lerp(sxp, tx, a), y = lerp(syp, ty, a);
        var dx = x - mx, dy = y - my, d2 = dx * dx + dy * dy; if (d2 < 3600) { var f = (3600 - d2) / 3600 * 14, dd = Math.sqrt(d2) || 1; x += dx / dd * f; y += dy / dd * f; }
        var tw = .5 + .5 * Math.sin(T * 2.2 + p.ph);
        c.globalAlpha = settled ? (tw > .93 ? .9 : 0) + (d2 < 3600 ? .5 : 0) : .75 * a + .2;   // after settling only glints remain over the real logo
        c.fillStyle = settled && tw > .93 ? '#fff4d0' : p.col; c.fillRect(x - 1, y - 1, 2.2, 2.2);
      }
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      if (vis && !still()) raf = requestAnimationFrame(frame);
    }
    function kick() { if (still()) { box.classList.add('settled'); c.clearRect(0, 0, w || 0, h || 0); return; } if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() { size(); sample(); t0 = performance.now(); kick(); }
    if (finePointer) {
      box.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
      box.addEventListener('pointerleave', function () { mx = my = -999; });
    }
    watch(box, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // ---------------------------------------------------------------- the office: his real photo laid in the brand's facets
  var mosaic = (function () {
    var box = $('[data-mosaic]'), cv = $('[data-mosaic-cv]'), c = cv.getContext('2d'), img = $('[data-mosaic-img]');
    var T = [], w, h, raf = 0, vis = false, ok = false, lx = -999, ly = -999, p = 0;
    function build() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = box.clientWidth; h = box.clientHeight; if (!w) return;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var sc = document.createElement('canvas'); sc.width = Math.ceil(w); sc.height = Math.ceil(h);
      var sx = sc.getContext('2d'), s = Math.max(w, h) / 3.4 / (phone() ? 2.6 : 3.2), hh = s * .866;
      var ir = img.naturalWidth / img.naturalHeight, br = w / h, dw = w, dh = h, dx0 = 0, dy0 = 0;
      if (ir > br) { dw = h * ir; dx0 = (w - dw) / 2; } else { dh = w / ir; dy0 = (h - dh) / 2; }
      try { sx.drawImage(img, dx0, dy0, dw, dh); var d = sx.getImageData(0, 0, sc.width, sc.height).data; } catch (e) { ok = false; return; }
      var cols = Math.ceil(w / (s / 2)) + 2, rows = Math.ceil(h / hh) + 1; T = [];
      for (var r = 0; r < rows; r++) for (var k = 0; k < cols; k++) {
        var x = k * s / 2 - s / 2, y = r * hh, up = (k + r) % 2 === 0;
        var pt = up ? [[x, y + hh], [x + s / 2, y], [x + s, y + hh]] : [[x, y], [x + s, y], [x + s / 2, y + hh]];
        var cx = x + s / 2, cy = y + hh * (up ? .62 : .38), ix = clamp(Math.round(cx), 0, sc.width - 1), iy = clamp(Math.round(cy), 0, sc.height - 1), q = (iy * sc.width + ix) * 4;
        T.push({ p: pt, cx: cx, cy: cy, col: [d[q], d[q + 1], d[q + 2]], th: (cy / h) * .55 + Math.random() * .25, lens: 0, g: Math.random() });
      }
      ok = true;
    }
    function draw() {
      var calm = still(), R = smooth((p - .78) / .2);
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < T.length; i++) {
        var t = T[i], dx = t.cx - lx, dy = t.cy - ly;
        if (dx * dx + dy * dy < 9000) t.lens = 1; else t.lens *= .94;
        var v = smooth((p - t.th) / .18) * (1 - t.lens), a = 1 - R * v;
        if (a < .01) continue;
        var gl = .5 + .5 * t.g, fr = 24 + 60 * gl * (1 - v) * (t.lens > .1 ? 2.2 : .5), fg = 22 + 48 * gl * (1 - v) * (t.lens > .1 ? 2 : .4), fb = 26 + 14 * gl * (1 - v);
        c.globalAlpha = a;
        c.fillStyle = 'rgb(' + Math.round(lerp(fr, t.col[0], v)) + ',' + Math.round(lerp(fg, t.col[1], v)) + ',' + Math.round(lerp(fb, t.col[2], v)) + ')';
        c.beginPath(); c.moveTo(t.p[0][0], t.p[0][1]); c.lineTo(t.p[1][0], t.p[1][1]); c.lineTo(t.p[2][0], t.p[2][1]); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(243,213,138,' + (.08 + .3 * (1 - v)).toFixed(3) + ')'; c.lineWidth = 1; c.stroke();
      }
      c.globalAlpha = 1;
    }
    function frame() { raf = 0; if (!ok || still()) return; draw(); if (vis) raf = requestAnimationFrame(frame); }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    box.addEventListener('pointermove', function (e) { var r = box.getBoundingClientRect(); lx = e.clientX - r.left; ly = e.clientY - r.top; });
    box.addEventListener('pointerleave', function () { lx = ly = -999; });
    box.addEventListener('pointerdown', function (e) { var r = box.getBoundingClientRect(); lx = e.clientX - r.left; ly = e.clientY - r.top; setTimeout(function () { lx = ly = -999; }, 500); });
    watch(box, function (v) { vis = v; if (v) kick(); });
    function start() { build(); kick(); }
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { build(); kick(); }, set: function (v) { p = v; } };
  })();

  // ---------------------------------------------------------------- the office card leans toward the hand
  $$('[data-tilt]').forEach(function (el) {
    if (!finePointer) return;
    el.addEventListener('pointermove', function (e) { if (still()) return; var r = el.getBoundingClientRect(); el.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 18).toFixed(1) + 'deg'); el.style.setProperty('--rx', ((.5 - (e.clientY - r.top) / r.height) * 14).toFixed(1) + 'deg'); });
    el.addEventListener('pointerleave', function () { el.style.removeProperty('--ry'); el.style.removeProperty('--rx'); });
  });

  // ---------------------------------------------------------------- work: living documents
  var work = $('#work'), workOn = false, docs = $$('[data-doc]'), row = $('[data-row]');
  watch(work, function (v) { workOn = v; });
  docs.forEach(function (d) { d.addEventListener('pointermove', function (e) { var r = d.getBoundingClientRect(); d.style.setProperty('--mx', (e.clientX - r.left) + 'px'); d.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  // drag the row with a mouse too
  (function () { var down = false, sx = 0, sl = 0; row.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = row.scrollLeft; }); addEventListener('pointermove', function (e) { if (down) row.scrollLeft = sl - (e.clientX - sx); }); addEventListener('pointerup', function () { down = false; }); })();
  // the ledger: the same figures in both columns, so the totals always balance; one settles at a time
  var ledger = $('[data-ledger]'), V = [1240, 385, 2160, 940, 615], perm = [2, 0, 4, 1, 3];
  var fmt = function (n) { return n.toLocaleString('en-US') + '.00'; };
  function ledgerHTML() {
    var l = he(), out = '<div class="lh">' + (l ? 'חובה' : 'Debit') + '</div><div class="lh">' + (l ? 'זכות' : 'Credit') + '</div>';
    for (var i = 0; i < V.length; i++) out += '<div class="lc" data-c="d' + i + '">' + fmt(V[i]) + '</div><div class="lc" data-c="c' + i + '">' + fmt(V[perm[i]]) + '</div>';
    var s = V.reduce(function (a, b) { return a + b; }, 0);
    ledger.innerHTML = out + '<div class="lt" data-t="d">' + fmt(s) + '</div><div class="lt" data-t="c">' + fmt(s) + '</div>';
  }
  ledgerHTML();
  setInterval(function () {
    if (!workOn || still()) return;
    var i = Math.floor(Math.random() * V.length); V[i] = Math.round((200 + Math.random() * 2400) / 5) * 5;
    var s = V.reduce(function (a, b) { return a + b; }, 0), j = perm.indexOf(i);
    [['d' + i, fmt(V[i])], ['c' + j, fmt(V[i])]].forEach(function (x, n) { var el = $('[data-c="' + x[0] + '"]', ledger); setTimeout(function () { el.classList.remove('set'); void el.offsetWidth; el.classList.add('set'); decode(el, x[1], 520); }, n * 380); });
    setTimeout(function () { $$('.lt', ledger).forEach(function (el) { decode(el, fmt(s), 600); }); }, 800);
  }, 2600);
  // the payslip: this month's, amounts masked
  var slip = $('[data-payslip]');
  function slipHTML() {
    var l = he(), m = new Intl.DateTimeFormat(l ? 'he-IL' : 'en-GB', { month: 'long', year: 'numeric', timeZone: 'Asia/Jerusalem' }).format(new Date());
    var r = function (a, b, cls) { return '<div class="pr' + (cls ? ' ' + cls : '') + '"><span>' + a + '</span><span>' + b + '</span></div>'; };
    slip.innerHTML = '<div class="pt">' + (l ? 'תלוש שכר' : 'Payslip') + '<br>' + m + '</div>' + r(l ? 'ברוטו' : 'Gross', '₪ ••••') + r(l ? 'ניכויים' : 'Deductions', '₪ •••') + r(l ? 'הפרשות' : 'Contributions', '₪ •••') + r(l ? 'נטו' : 'Net', '₪ ••••', 'net');
  }
  slipHTML();
  var sign = $('[data-sign]'), sheet1 = $('.report .s1'), machine = $('.machine img');

  // ---------------------------------------------------------------- reviews: words fill with ink as you read down
  var quotes = $$('[data-ink]');
  function inkWords() {
    quotes.forEach(function (q) { $$('p > span[lang]', q).forEach(function (sp) { if (sp.dataset.done) return; sp.dataset.done = 1; sp.innerHTML = sp.textContent.split(' ').map(function (w) { return '<span class="wd">' + w + '</span>'; }).join(' '); }); });
  }
  inkWords();
  var score = $('[data-decode]');
  if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { ob.disconnect(); if (still()) return; var t0 = performance.now(); (function st(t) { var u = smooth((t - t0) / 1200); score.textContent = (5 * u).toFixed(1); if (u < 1) requestAnimationFrame(st); })(t0); } }, { threshold: .5 }).observe(score);

  // ---------------------------------------------------------------- the adding machine: keys compose, the roll prints, the plus key sends
  var topics = $$('[data-topic]'), kinds = $$('[data-kind]'), steps = $$('[data-step]'), msgEl = $('[data-msg]'), send = $('[data-send]'), shown = '', typing = 0, chatSeen = false;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  topics.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); lightStep(0); write(); }); });
  kinds.forEach(function (b) { b.addEventListener('click', function () { kinds.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lightStep(1); write(); }); });
  send.addEventListener('pointerenter', function () { lightStep(2); });
  send.addEventListener('focus', function () { lightStep(2); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = topics.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.dataset[l ? 'he' : 'en']; });
    var k = kinds.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], kind = k.dataset[l ? 'he' : 'en'];
    return l ? (picked.length ? 'שלום, אשמח לדבר על ' + list(picked, true) + '.' : 'שלום, יש לי שאלה לגבי העסק שלי.') + '\nסוג העסק: ' + kind + '.'
             : (picked.length ? 'Hello, I’d like to talk about ' + list(picked, false) + '.' : 'Hello, I have a question about my business.') + '\nBusiness type: ' + kind + '.';
  }
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- THE TAPE: each section you reach is printed on the roll
  var tape = (function () {
    var paper = $('[data-paper]'), secs = $$('[data-entries]'), printed = 0;
    function stamp() { var o = nowParts(); return o.day + '.' + o.month + '.' + o.year + ' · ' + ((+o.hour) % 24) + ':' + o.minute; }
    // [hebrew, english, figure, class]
    var E = {
      top: function () { return [['שקור רביע', 'C. Rabeia', '', 'b'], [stamp(), stamp(), '', 'dt']]; },
      office: function () { return [['סירקין', 'Sirkin', '15']]; },
      work: function () { return [['הנה״ח', 'Books', '+'], ['שכר', 'Payroll', '+'], ['דוחות', 'Reports', '+'], ['ליווי', 'Guidance', '+']]; },
      reviews: function () { return [['ביקורות', 'Reviews', '16'], ['דירוג', 'Rating', '5.0', 'tot']]; },
      write: function () { return [['הודעה', 'Message', '+']]; },
      visit: function () { return [['א׳–ה׳', 'Sun–Thu', '8:30–17']]; },
      foot: function () { return [['סה״כ', 'Total', '5.0', 'tot']]; }
    };
    function line(e, cls) { var l = he(); return '<div class="tl' + (e[3] ? ' ' + e[3] : '') + (cls || '') + '"><span>' + (l ? e[0] : e[1]) + '</span><b dir="ltr">' + e[2] + '</b></div>'; }
    // the slips (narrow screens) hold their own section's lines
    function slips() { secs.forEach(function (s) { var sl = $('[data-slip]', s); if (sl) sl.innerHTML = '<div class="sp"><div class="sp-in">' + E[s.dataset.entries]().map(function (e) { return line(e); }).join('') + '</div></div>'; }); }
    function update(vh) {
      if (!paper || !paper.offsetParent) return;
      var n = 0; secs.forEach(function (s, i) { if (s.getBoundingClientRect().top < vh * .62) n = i + 1; });
      if (n === printed) return;
      if (n < printed) { var keep = 0; for (var i = 0; i < n; i++) keep += E[secs[i].dataset.entries]().length; while (paper.children.length > keep) paper.lastChild.remove(); }
      else secs.slice(printed, n).forEach(function (s, o) {
        var k = printed + o;
        E[s.dataset.entries]().forEach(function (e, j) {
          var calm = still(), html = line(e, calm ? '' : ' new');
          if (calm) paper.insertAdjacentHTML('beforeend', html);
          else setTimeout(function () { var want = j + 1; for (var q = 0; q < k; q++) want += E[secs[q].dataset.entries]().length; if (printed > k && paper.children.length < want) paper.insertAdjacentHTML('beforeend', html); }, (o * 4 + j) * 150);
        });
      });
      printed = n;
    }
    function reset() { paper.innerHTML = ''; printed = 0; slips(); tick(); }
    slips();
    return { update: update, reset: reset, slipFeed: function (vh, calm) {
      secs.forEach(function (s) { var sl = $('[data-slip]', s); if (!sl || !sl.offsetParent) return; var r = sl.getBoundingClientRect(); sl.style.setProperty('--feed', calm ? '100%' : (smooth((vh * .98 - r.top) / (vh * .32)) * 100).toFixed(1) + '%'); });
    } };
  })();

  // ---------------------------------------------------------------- one scroll loop
  var night = $('[data-night]'), nightHand = false, office = $('#office'), foot = $('.foot'), torn = $('[data-torn]');
  if (finePointer) {
    night.addEventListener('pointermove', function (e) { nightHand = true; var r = night.getBoundingClientRect(); night.style.setProperty('--lx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); night.style.setProperty('--ly', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); });
    night.addEventListener('pointerleave', function () { nightHand = false; tick(); });
  }
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function seen(el, a, b) { var r = el.getBoundingClientRect(), vh = innerHeight; return clamp((vh * a - r.top) / (vh * b), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    tape.update(vh); tape.slipFeed(vh, calm);
    // the office mosaic follows the scroll both ways
    var mp = calm ? 1 : seen($('[data-mosaic]'), 1, .85); mosaic.set(mp); if (!calm) mosaic.kick();
    // work: payslip feeds, the report is signed, the machine photo drifts
    var wp = calm ? 1 : seen(work, 1, 1.1);
    slip.style.setProperty('--py', calm ? '0%' : lerp(-100, 0, smooth((wp - .15) / .6)).toFixed(1) + '%');
    sign.style.setProperty('--sign', calm ? 0 : (400 * (1 - smooth((wp - .3) / .55))).toFixed(0));
    sheet1.style.transform = calm ? '' : 'rotate(' + lerp(-3, 0, smooth(wp)).toFixed(2) + 'deg)';
    machine.style.setProperty('--ks', calm ? 1.05 : lerp(1.25, 1.05, smooth(wp)).toFixed(3));
    machine.style.setProperty('--kx', calm ? '0' : lerp(-4, 2, smooth(wp)).toFixed(2) + '%');
    if (!finePointer) docs.forEach(function (d) { var r = d.getBoundingClientRect(); d.classList.toggle('lit', r.top < vh * .7 && r.bottom > vh * .3 && r.left < innerWidth * .8 && r.right > innerWidth * .2); });
    // reviews: ink runs through each quote as it passes up the screen
    quotes.forEach(function (q) {
      var ws = $$('.wd', q).filter(function (w) { return w.offsetParent; }), u = calm ? 1 : seen(q, .92, .55), n = Math.round(u * ws.length);
      ws.forEach(function (w, i) { w.classList.toggle('on', i < n); });
    });
    // Haifa at night: without a hand, the lamp sweeps with the scroll
    if (!nightHand) { var np = seen(night, 1, 1.2); night.style.setProperty('--lx', lerp(15, 80, np).toFixed(1) + '%'); night.style.setProperty('--ly', lerp(70, 45, np).toFixed(1) + '%'); }
    // the torn total drops into place
    torn.style.setProperty('--tear', calm ? 0 : ((1 - smooth(seen(foot, 1, .45))) * 50).toFixed(1));
  }

  function layout() { facets.size(); gold.size(); mosaic.size(); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (innerWidth !== lw || !phone()) { lw = innerWidth; layout(); } else tick(); }, 140); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1000);
  addEventListener('load', function () { layout(); });
})();
