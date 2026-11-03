(function () {
  var root = document.documentElement, WA = '972548397829';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var TITLE = { he: 'יואב גולן · סוכן ביטוח · דרך עכו 140, קריית ביאליק', en: 'Yoav Golan · Insurance agent · 140 Akko Rd, Kiryat Bialik' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור יואב גולן סוכן ביטוח · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Yoav Golan Insurance Agent · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute(el.tagName === 'IFRAME' ? 'title' : 'aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'יואב גולן, סוכן ביטוח', 'Yoav Golan, insurance agent');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-wa]', 'וואטסאפ ליואב', 'WhatsApp Yoav');
    aria('[data-t-call]', 'התקשרו ליואב, 054-839-7829', 'Call Yoav, 054-839-7829');
    aria('[data-t-orbit]', 'תחומים', 'Areas');
    aria('[data-t-core]', 'הלוגו של יואב גולן', 'Yoav Golan’s logo');
    aria('[data-t-words]', 'מילים מהביקורות', 'Words from the reviews');
    aria('[data-t-map]', 'מפה: דרך עכו 140, קריית ביאליק', 'Map: 140 Akko Road, Kiryat Bialik');
    aria('[data-hour]', 'שעה נוחה לשיחה', 'A good hour to talk');
    $$('[data-w]').forEach(function (li) { $('.wt', li).textContent = li.dataset.w.split('|')[l === 'he' ? 0 : 1]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('yg-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('yg-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    layout(); dust.kick(); orbit.kick(); rains.forEach(function (r) { r.kick(); }); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- opening: the brush runs round the real logo, then lifts
  var veil = $('[data-intro]');
  function endIntro() {
    if (!root.classList.contains('intro')) return;
    veil.classList.add('gone'); try { sessionStorage.setItem('yg-intro', '1'); } catch (e) {}
    setTimeout(function () { root.classList.remove('intro'); }, 650);
  }
  if (root.classList.contains('intro')) { veil.addEventListener('click', endIntro); setTimeout(endIntro, 1450); }

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9, 17], 1: [9, 17], 2: [9, 17], 3: [9, 17], 4: [9, 17], 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
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
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
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

  // ---------------------------------------------------------------- letters: the headline out of a blur, the footer name rising
  function splitChars(sp, start) {
    var i = start || 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  }
  $$('[data-split] .ln > span[lang]').forEach(function (sp) { splitChars(sp, sp.closest('.ln').previousElementSibling ? 10 : 0); });
  $$('[data-fname] > span[lang]').forEach(function (sp) { splitChars(sp, 0); });

  // ---------------------------------------------------------------- glyph decode (labels settle out of scrambled letters)
  var GLY = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHJKLMNPRSTUVWXYZ' };
  function decode(el, txt, dur) {
    clearInterval(el._dc);
    if (still()) { el.textContent = txt; return; }
    var set = /[֐-׿]/.test(txt) ? GLY.he : GLY.en, t0 = performance.now(), d = dur || 700;
    el._dc = setInterval(function () {
      var p = (performance.now() - t0) / d, n = Math.floor(p * txt.length), s = '';
      for (var i = 0; i < txt.length; i++) s += i < n || txt[i] === ' ' ? txt[i] : set[Math.floor(Math.random() * set.length)];
      el.textContent = s; if (p >= 1) { clearInterval(el._dc); el.textContent = txt; }
    }, 40);
  }

  var hero = $('[data-hero]'), nav = $('[data-nav]'), orbitEl = $('[data-orbit]'), core = $('[data-core]');
  function orbitGeo() {
    var hr = hero.getBoundingClientRect(), r = orbitEl.getBoundingClientRect();
    return { cx: r.left - hr.left + r.width / 2, cy: r.top - hr.top + r.height / 2, rx: r.width * .44, ry: r.height * .19, core: core.getBoundingClientRect().width };
  }

  // ---------------------------------------------------------------- the logo's own pixels: they gather into its mark, then let go into the ring
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), img = $('[data-dustsrc]');
    var P = [], w, h, raf = 0, vis = true, t0 = 0, mx = -999, my = -999, ok = false, gather = 0, gTarget = 0, spin = 0, last = 0;
    function sample() {
      try {
        var sc = document.createElement('canvas'), iw = 160, ih = 158; sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data, pts = [];
        for (var y = 0; y < ih; y++) for (var x = 0; x < iw; x++) { var k = (y * iw + x) * 4; if (d[k + 3] > 140) pts.push([x / iw - .5, y / ih - .5, d[k + 2] > 210 && d[k + 1] > 150 ? 1 : 0]); }
        var want = phone() ? 900 : 1700, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) { var q = pts[Math.floor(f)]; P.push({ hx: q[0], hy: q[1], sky: q[2], a: Math.random() * 6.283, ro: (Math.random() - .5) * .16 + (Math.random() < .2 ? (Math.random() - .5) * .5 : 0), ph: Math.random() * 6.28, sp: .7 + Math.random() * .6, x: 0, y: 0, vx: 0, vy: 0, init: false }); }
        ok = true;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(t) {
      raf = 0; if (!ok) return;
      var calm = still(), T = (t - t0) / 1000, dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      var g = orbitGeo(), ms = g.core * .7;
      // first the mark, then it lets go into the ring; pointing at the disc gathers it back
      var auto = calm ? 1 : smooth((T - 1.1) / 1.4);
      gather = lerp(gather, gTarget, .06);
      var f = clamp(auto - gather, 0, 1);
      spin += dt * (.22 + orbit.vel() * .02) * (rtl() ? 1 : -1);
      c.clearRect(0, 0, w, h); c.globalCompositeOperation = 'lighter';
      for (var i = 0; i < P.length; i++) {
        var p = P[i], mxp = g.cx + p.hx * ms * (rtl() ? 1 : 1), myp = g.cy + p.hy * ms;
        var an = p.a + spin * p.sp, rr = 1 + p.ro;
        var rxp = g.cx + Math.cos(an) * g.rx * rr, ryp = g.cy + Math.sin(an) * g.ry * rr + Math.sin(T * 1.2 + p.ph) * 2;
        var tx = lerp(mxp, rxp, f), ty = lerp(myp, ryp, f);
        if (!p.init || calm) { p.x = tx; p.y = ty; p.init = true; }
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 8000) { var fo = (8000 - d2) / 8000 * 2.4, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * fo; p.vy += dy / dd * fo; }
        p.vx += (tx - p.x) * .08; p.vy += (ty - p.y) * .08; p.vx *= .8; p.vy *= .8; p.x += p.vx; p.y += p.vy;
        var front = f > .5 ? (Math.sin(an) > 0 ? 1 : .55) : 1;
        c.globalAlpha = (.35 + .45 * (Math.sin(T * 2 + p.ph) * .5 + .5)) * front;
        c.fillStyle = p.sky ? '#7fd2f4' : '#3f97d6';
        c.fillRect(p.x - 1.1, p.y - 1.1, 2.2, 2.2);
      }
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) { last = 0; raf = requestAnimationFrame(frame); } }
    function start() { size(); sample(); t0 = performance.now(); kick(); }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    core.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') gTarget = 1; });
    core.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') gTarget = 0; });
    core.addEventListener('click', function () { gTarget = gTarget > .5 ? 0 : 1; kick(); if (gTarget) setTimeout(function () { gTarget = 0; }, 1800); });
    watch(hero, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // ---------------------------------------------------------------- the orbit of pictures round the logo: turns by itself, with the scroll and with a drag
  var orbit = (function () {
    var cards = $$('.oc', orbitEl), N = cards.length, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = true, last = 0, bg = $('.h-bg'), px = 0, py = 0;
    function frame(t) {
      raf = 0;
      if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; c.style.zIndex = ''; }); bg.style.transform = ''; return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (.16 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var W = orbitEl.clientWidth, Hh = orbitEl.clientHeight, rx = W * .4, ry = Hh * .2, sc = scrollY * .0016 * (rtl() ? 1 : -1);
      cards.forEach(function (c, i) {
        var a = rot + sc + i * 6.2832 / N, s = Math.sin(a), k = (s + 1) / 2;
        var x = Math.cos(a) * rx, y = s * ry, scale = .66 + .4 * k;
        c.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotateY(' + (-Math.cos(a) * 18).toFixed(1) + 'deg) scale(' + scale.toFixed(3) + ')';
        c.style.zIndex = s > 0 ? 60 + Math.round(k * 20) : 10 + Math.round(k * 20);
        c.style.filter = 'brightness(' + (.42 + .58 * k).toFixed(3) + ')';
      });
      bg.style.transform = 'translate3d(' + (px * -14).toFixed(1) + 'px,' + (py * -10 + scrollY * .18).toFixed(1) + 'px,0)';
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    orbitEl.addEventListener('pointerdown', function (e) { if (still() || e.target.closest('.core')) return; drag = true; lx = e.clientX; orbitEl.classList.add('drag'); });
    addEventListener('pointermove', function (e) {
      if (e.pointerType === 'mouse') { px = e.clientX / innerWidth - .5; py = e.clientY / innerHeight - .5; }
      if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .006; vel = dx * .05 * (rtl() ? 1 : -1);
    });
    addEventListener('pointerup', function () { drag = false; orbitEl.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; orbitEl.classList.remove('drag'); });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { kick: kick, vel: function () { return Math.abs(vel); } };
  })();

  // ---------------------------------------------------------------- the brush seam
  var brush = $('[data-brush]'), stroke = $('[data-stroke]'), SL = stroke.getTotalLength ? stroke.getTotalLength() : 2000;
  stroke.style.strokeDasharray = SL; stroke.style.strokeDashoffset = 0;

  // ---------------------------------------------------------------- areas: rain on the umbrella picture, deflected by a ring of light under the hand
  function rainOn(cv) {
    var c = cv.getContext('2d'), w, h, drops = [], bits = [], raf = 0, vis = false, ax = .5, ay = .55, tx = .5, ty = .55, hand = false, T0 = performance.now();
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; if (!w) return; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); drops = []; for (var i = 0; i < (phone() ? 70 : 130); i++) drops.push(nd(true)); }
    function nd(any) { return { x: Math.random() * (w + 60) - 30, y: any ? Math.random() * h : -20 - Math.random() * 60, v: 9 + Math.random() * 7, l: 10 + Math.random() * 14 }; }
    function draw(calm) {
      c.clearRect(0, 0, w, h);
      var R = Math.min(w, h) * .3, cx = ax * w, cy = ay * h;
      // the ring of light: the logo's G, drawn as an open arc
      c.lineCap = 'round'; c.strokeStyle = 'rgba(127,210,244,.95)'; c.lineWidth = 5; c.shadowColor = 'rgba(42,170,226,.9)'; c.shadowBlur = 18;
      c.beginPath(); c.arc(cx, cy, R, Math.PI * 1.08, Math.PI * 1.92); c.stroke(); c.shadowBlur = 0;
      c.strokeStyle = 'rgba(210,232,250,.55)'; c.lineWidth = 1.2; c.beginPath();
      drops.forEach(function (d) {
        if (!calm) { d.y += d.v; d.x -= d.v * .12; }
        var dx = d.x - cx, dy = d.y - cy, dist = Math.sqrt(dx * dx + dy * dy);
        if (dy < 0 && dist < R && dist > R - 26 && Math.abs(dx) < R * .97) { for (var k = 0; k < 2; k++) bits.push({ x: d.x, y: d.y, vx: (dx / R) * 3 + (Math.random() - .5) * 2, vy: -2 - Math.random() * 2, t: 1 }); Object.assign(d, nd(false)); return; }
        if (d.y > h) { if (Math.random() < .5) bits.push({ x: d.x, y: h - 2, vx: (Math.random() - .5) * 2, vy: -1.5 - Math.random(), t: .7 }); Object.assign(d, nd(false)); return; }
        if (dy > -R * .2 && Math.abs(dx) < R * .9 && dist < R) return;   // dry under the arc
        c.moveTo(d.x, d.y); c.lineTo(d.x + d.l * .12, d.y - d.l);
      });
      c.stroke();
      c.fillStyle = 'rgba(220,238,252,.8)';
      bits = bits.filter(function (b) { if (!calm) { b.x += b.vx; b.y += b.vy; b.vy += .25; b.t -= .04; } c.globalAlpha = Math.max(0, b.t); c.fillRect(b.x, b.y, 2, 2); return b.t > 0; });
      c.globalAlpha = 1;
    }
    function frame(t) {
      raf = 0; if (!w) size(); if (!w) return;
      var calm = still();
      if (!hand) { var s = (t - T0) / 1000; tx = .5 + Math.sin(s * .5) * .22; ty = .5 + Math.sin(s * .37) * .08; }
      ax = lerp(ax, tx, .08); ay = lerp(ay, ty, .08);
      draw(calm);
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    var pic = cv.parentNode;
    pic.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = pic.getBoundingClientRect(); hand = true; tx = (e.clientX - r.left) / r.width; ty = clamp((e.clientY - r.top) / r.height + .1, .3, .9); });
    pic.addEventListener('pointerleave', function () { hand = false; });
    watch(pic, function (v) { vis = v; if (v) kick(); });
    return { kick: kick, size: function () { size(); kick(); } };
  }
  var rains = $$('[data-rain]').map(rainOn);

  // the sun walks its arc over the couple; the pen signs the contract; the titles decode as each panel arrives
  var sun = $('[data-sun]'), sunPath = $('.sun-path'), SPL = sunPath.getTotalLength(), sunOn = false;
  function placeSun(u) { var pt = sunPath.getPointAtLength(SPL * u); sun.setAttribute('cx', pt.x); sun.setAttribute('cy', pt.y); }
  placeSun(.62);
  (function sunLoop(t) { if (sunOn && !still()) placeSun(.18 + .64 * (Math.sin(t / 2600) * .5 + .5)); requestAnimationFrame(sunLoop); })(0);
  watch($('.p-pen'), function (v) { sunOn = v; });
  var sig = $('[data-sig]'), SGL = sig.getTotalLength();
  sig.style.strokeDasharray = SGL; sig.style.strokeDashoffset = still() ? 0 : SGL;
  watch($('.p-fin'), function (v) {
    if (still()) { sig.style.transition = 'none'; sig.style.strokeDashoffset = 0; return; }
    sig.style.transition = v ? 'stroke-dashoffset 2.4s cubic-bezier(.65,0,.35,1) .3s' : 'none';
    sig.style.strokeDashoffset = v ? 0 : SGL;
  }, { threshold: .4 });
  $$('[data-panel]').forEach(function (p) {
    var h3 = $('h3', p);
    watch(p, function (v) { if (!v) return; var sp = $('[lang="' + root.lang + '"]', h3); decode(sp, h3.dataset.decode.split('|')[he() ? 0 : 1], 800); }, { threshold: .45 });
  });
  var areas = $('[data-areas]'), track = $('[data-track]'), aprog = $('[data-aprog]');
  var pinned = function () { return !still() && innerWidth >= 1000; };

  // ---------------------------------------------------------------- yoav: the card tilts toward the hand (with the scroll on phones); the clients' words decode
  var yoav = $('[data-yoav]'), card = $('[data-card]'), cwrap = $('[data-cardwrap]'), handOnCard = false;
  function tilt(rx, ry) { card.style.transform = still() ? '' : 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)'; card.style.setProperty('--gx', (ry * 3 + 20) + '%'); card.style.setProperty('--gy', (-rx * 3 - 20) + '%'); }
  cwrap.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; handOnCard = true; var r = card.getBoundingClientRect(); tilt(-((e.clientY - r.top) / r.height - .5) * 16, ((e.clientX - r.left) / r.width - .5) * 20); });
  cwrap.addEventListener('pointerleave', function () { handOnCard = false; tick(); });
  var wordsDone = false;
  watch(cwrap, function (v) {
    if (!v || wordsDone) return; wordsDone = true;
    $$('[data-w]').forEach(function (li, i) { var wt = $('.wt', li), txt = li.dataset.w.split('|')[he() ? 0 : 1]; if (still()) { wt.textContent = txt; return; } wt.textContent = ''; setTimeout(function () { decode(wt, txt, 650); }, 200 + i * 260); });
  }, { threshold: .35 });

  // odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 6) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- ask: the circle closes around what you pick, the note writes itself
  var dial = $('[data-dial]'), dfill = $('[data-dfill]'), topics = $$('[data-topic]'), steps = $$('[data-step]'), hourIn = $('[data-hour]'), hourOut = $('[data-hourout]');
  var msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false, C = 942.5;
  function placeStations() {
    topics.forEach(function (b, i) {
      var a = -Math.PI / 2 + i * Math.PI * 2 / topics.length, x = 50 + Math.cos(a) * 37.5 * (rtl() ? -1 : 1), y = 50 + Math.sin(a) * 37.5;
      b.style.left = x + '%'; b.style.top = y + '%';
    });
  }
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function picked() { return topics.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }); }
  function closeCircle() {
    var k = picked().length, frac = k ? .2 + .8 * (k - 1) / (topics.length - 1) : 0;
    dfill.style.strokeDashoffset = (C * (1 - frac)).toFixed(1);
    dial.classList.toggle('some', k > 0);
  }
  topics.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); closeCircle(); lightStep(0); write(); }); });
  hourIn.addEventListener('input', function () { hourOut.textContent = hhmm(+hourIn.value); lightStep(1); write(); });
  $('[data-send]').addEventListener('pointerenter', function () { lightStep(2); });
  $('[data-send]').addEventListener('focus', function () { lightStep(2); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), p = picked().map(function (b) { return b.dataset[l ? 'he' : 'en']; }), t = hhmm(+hourIn.value);
    return l ? 'שלום יואב, אשמח לדבר איתך על ' + (p.length ? list(p, true) : 'הביטוחים שלי') + '. נוח לי לדבר בסביבות ' + t + '.'
             : 'Hi Yoav, I’d like to talk to you about ' + (p.length ? list(p, false) : 'my insurance') + '. A good time for me is around ' + t + '.';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 16);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- reviews: word by word
  $$('[data-fill]').forEach(function (p) { p.innerHTML = p.textContent.split(' ').map(function (w) { return '<span class="fw">' + w + '</span>'; }).join(' '); });
  var revs = $('[data-rwrap]'), rqs = $$('[data-rq]'), rtabs = $$('[data-rtabs] i'), rmark = $('[data-rmark]');

  // ---------------------------------------------------------------- visit + bento spotlight + footer
  var vtitle = $('.v-title'), vwrap = $('[data-vwrap]'), vphoto = $('[data-vphoto]'), foot = $('[data-foot]'), farc = $('.f-arc'), dock = $('[data-dock]');
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, hr = hero.getBoundingClientRect();
    nav.classList.toggle('pill', scrollY > 40);
    dock.classList.toggle('show', hr.bottom < vh * .55);
    if (!calm) { dust.kick(); orbit.kick(); }
    // the brush sweeps as the hero leaves
    var br = brush.getBoundingClientRect(), bp = calm ? 1 : smooth((vh - br.top) / (vh * .75));
    stroke.style.strokeDashoffset = (SL * (1 - bp)).toFixed(1);
    // areas ride sideways
    if (pinned()) {
      var ap = prog(areas), shift = Math.max(0, track.scrollWidth - innerWidth) * smooth(ap * 1.08 - .04);
      track.style.transform = 'translate3d(' + (rtl() ? shift : -shift).toFixed(1) + 'px,0,0)';
      aprog.style.transform = 'scaleX(' + ap.toFixed(3) + ')';
    } else { track.style.transform = ''; }
    // yoav lands over the areas
    var yr = yoav.getBoundingClientRect(), yp = calm ? 1 : smooth((vh - yr.top) / (vh * .8));
    yoav.style.transform = calm ? '' : 'translate3d(0,' + ((1 - yp) * 60).toFixed(1) + 'px,0) scale(' + lerp(.94, 1, yp).toFixed(4) + ')';
    if (!handOnCard) { var cr = cwrap.getBoundingClientRect(), cp = (cr.top + cr.height / 2) / vh - .5; tilt(clamp(cp * 14, -10, 10), clamp(-cp * 10, -8, 8)); }
    // reviews fill in
    if (!calm) {
      var rp = prog(revs) * 3, idx = Math.min(2, Math.floor(rp)), loc = clamp(rp - idx, 0, 1);
      rqs.forEach(function (q, i) {
        q.classList.toggle('cur', i === idx); q.classList.toggle('past', i < idx);
        var ws = $$('[lang="' + root.lang + '"] .fw', q), n = i < idx ? ws.length : i > idx ? 0 : Math.ceil(smooth(loc * 1.35) * ws.length);
        ws.forEach(function (w, k) { w.classList.toggle('lit', k < n); });
      });
      rtabs.forEach(function (t, i) { t.classList.toggle('on', i === idx); });
      rmark.style.transform = 'rotate(' + (prog(revs) * 120 * (rtl() ? -1 : 1)).toFixed(1) + 'deg)';
    }
    // the city opens through the logo's circle
    var W = vphoto.clientWidth, Hp = vphoto.clientHeight, R0 = Math.min(W, Hp) * .32, R1 = Math.hypot(W, Hp) / 2 + 4;
    var vp = calm ? 1 : smooth((prog(vwrap) - .02) / .7), R = lerp(R0, R1, vp);
    vphoto.style.setProperty('--r', R.toFixed(1) + 'px'); vphoto.style.clipPath = 'circle(' + R.toFixed(1) + 'px at 50% 50%)';
    vphoto.style.setProperty('--ro', (1 - smooth(vp * 1.6)).toFixed(3));
    vphoto.style.setProperty('--z', lerp(1.25, 1, vp).toFixed(4));
    vtitle.style.opacity = calm || vp > .55 ? '' : '0';
    // footer: the curtain lifts, the horizon rises, the name sets
    var fr = foot.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / Math.max(1, fr.height));
    farc.style.setProperty('--rise', ((1 - fp) * 120).toFixed(1) + 'px');
    foot.classList.toggle('up', calm || fp > .35);
  }

  function layout() { dust.size(); rains.forEach(function (r) { r.size(); }); placeStations(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  // a reader who stops mid-fill gets the whole quote: after a short pause the current one finishes lighting up
  var idle;
  addEventListener('scroll', function () {
    tick(); clearTimeout(idle);
    rqs.forEach(function (q) { q.classList.remove('done'); });
    idle = setTimeout(function () { rqs.forEach(function (q) { if (q.classList.contains('cur')) q.classList.add('done'); }); }, 500);
  }, { passive: true });

  texts(root.lang); hours(); write(true); layout(); closeCircle();
  var once = false, go = function () { if (once) return; once = true; setTimeout(function () { requestAnimationFrame(function () { hero.classList.add('ready'); }); }, root.classList.contains('intro') ? 1250 : 0); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { layout(); });
})();
