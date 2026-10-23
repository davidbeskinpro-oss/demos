(function () {
  var root = document.documentElement, PHONE = '+972583215106';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 820; };
  var TITLE = { he: 'שרה · אפילציה ועיצוב גבות · ביל״ו 20, חיפה', en: 'Sarah · Electrolysis & brow design · 20 Bilu St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור אפילציה בחיפה שרה · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Epilation in Haifa – Sarah · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';
  var SLOW = Math.max(1, +new URLSearchParams(location.search).get('slowmo') || 1);   // review aid: ?slowmo=8 plays the opening 8x slower
  // Sarah has no WhatsApp: every message goes by SMS. iPhones want "&body=", everything else "?body="
  var apple = /iP(hone|ad|od)/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  var smsHref = function (msg) { return 'sms:' + PHONE + (apple ? '&' : '?') + 'body=' + encodeURIComponent(msg); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-ph-he]').forEach(function (i) { i.placeholder = i.dataset[l === 'he' ? 'phHe' : 'phEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'שרה אפילציה', 'Sarah Epilation');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-treat]', 'טיפול', 'Treatment');
    aria('[data-t-dial]', 'יום', 'Day');
    aria('[data-t-ba]', 'לפני ואחרי', 'Before and after');
    aria('[data-t-visit]', 'ביקור', 'Visit');
    aria('[data-t-dsms]', 'הודעת SMS לשרה', 'Text Sarah');
    aria('[data-t-dcall]', 'להתקשר לשרה, 058-321-5106', 'Call Sarah, 058-321-5106');
    var map = $('[data-t-map]'); if (map) map.title = l === 'he' ? 'מפה: ביל״ו 20, חיפה' : 'Map: 20 Bilu St, Haifa';
    $$('.tag').forEach(function (t) { if (t.classList.contains('on') || still()) $('b', t).textContent = t.dataset[l]; });
    var dfl = l === 'he' ? 'היי שרה, אשמח לקבוע תור.' : 'Hi Sarah, I’d like to book a visit.';
    $$('[data-sms]').forEach(function (a) { a.href = smsHref(dfl); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('sarah-lang', l); } catch (e) {}
    $$('.tag').forEach(function (t) { t.classList.remove('on'); $('b', t).textContent = ''; });
    texts(l); hours(); weekRing(); dialBuild(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('sarah-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    hero.classList.add('ready');
    texts(root.lang); layout(); down.kick(); orbit.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [14, 23], 1: [14, 23], 2: [14, 23], 3: [14, 23], 4: [14, 23], 5: [8, 12], 6: [21, 23] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
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
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      if (r[0] === 6 && r[1] === 6) name = l ? 'מוצאי שבת' : 'Saturday night';
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(function () { status(); weekHand(); }, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); if (e.target.matches('[data-tile]')) $$('[data-dc-in] > span', e.target).forEach(decode); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- letters: headline, the room's line, the footer word
  function split(sp, start) {
    var i = start || 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
    return i;
  }
  $$('[data-split] .ln > span[lang]').forEach(function (sp) { split(sp, sp.closest('.ln').previousElementSibling ? 18 : 0); });
  $$('[data-fill] > span[lang]').forEach(function (sp) {
    // keep the <em> accent: split its text and the plain text separately
    var i = 0; [].slice.call(sp.childNodes).forEach(function (n) {
      if (n.nodeType === 3) { var s = document.createElement('span'); s.textContent = n.textContent; sp.replaceChild(s, n); i = split(s, i); }
      else i = split(n, i);
    });
  });
  $$('[data-fword] > span').forEach(function (sp) { split(sp); });

  // ---------------------------------------------------------------- glyph decode
  var POOL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' };
  function decode(el) {
    if (!el._txt) el._txt = el.textContent;
    var txt = el._txt, pool = POOL[el.lang === 'en' ? 'en' : 'he'];
    if (still()) { el.textContent = txt; return; }
    var t0 = performance.now(), dur = 900;
    (function st(t) {
      var k = clamp((t - t0) / dur, 0, 1), n = Math.floor(k * txt.length), out = '';
      for (var i = 0; i < txt.length; i++) out += i < n || /[\s·0-9״,]/.test(txt[i]) ? txt[i] : pool[Math.floor(Math.random() * pool.length)];
      el.textContent = out;
      if (k < 1) requestAnimationFrame(st);
    })(t0);
  }

  var hero = $('[data-hero]'), nav = $('[data-nav]'), stage = $('[data-stage]'), arch = $('[data-arch]');

  // ---------------------------------------------------------------- the down: her logo's feather, made of its own pixels,
  // holds its shape for a moment and then sheds into floating down; the hand blows it aside; a tap gathers it again
  var down = (function () {
    var cv = $('[data-down]'), c = cv.getContext('2d'), img = $('[data-downsrc]');
    var P = [], w, h, raf = 0, vis = true, ok = false, t0 = 0, form = 0, formAt = 0, mx = -999, my = -999, lastY = scrollY, wind = 0, prev = 0;
    function sample() {
      try {
        var sc = document.createElement('canvas'), iw = 250, ih = 200; sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data, pts = [];
        for (var y = 0; y < ih; y += 2) for (var x = 0; x < iw; x += 2) { var k = (y * iw + x) * 4; if (d[k + 3] > 70) pts.push([x / iw, y / ih, d[k], d[k + 1], d[k + 2]]); }
        var want = phone() ? 700 : 1500; P = [];
        for (var i = 0; i < want; i++) {
          var q = pts[Math.floor(Math.random() * pts.length)];
          // lift the logo's colours a little so they glow on the dusk ground
          var mixc = function (v, t) { return Math.round(v * .45 + t * .55); }, col = 'rgb(' + mixc(q[2], 246) + ',' + mixc(q[3], 200) + ',' + mixc(q[4], 208) + ')';
          P.push({ hx: q[0], hy: q[1], col: col, x: Math.random(), y: Math.random(), init: false, vx: 0, vy: 0, fall: .15 + Math.random() * .5, ph: Math.random() * 6.28, sz: Math.random() < .08 ? 2.6 : 1 + Math.random() * 1.2, tw: Math.random() < .1 });
        }
        ok = P.length > 0;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function box() {
      // the logo's shape sits large around the arch
      var hr = hero.getBoundingClientRect(), ar = arch.getBoundingClientRect();
      var bw = Math.min(w * .95, ar.width * (phone() ? 1.9 : 1.75)), bh = bw * .8;
      return { x: ar.left - hr.left + ar.width / 2 - bw / 2, y: ar.top - hr.top + ar.height * .42 - bh / 2, w: bw, h: bh };
    }
    function frame(t) {
      raf = 0; if (!ok) return;
      var calm = still(), dt = prev ? Math.min(.05, (t - prev) / 1000) : .016; prev = t;
      var T = (t - t0) / 1000, b = box();
      // the shape holds ~2.4 s after the page is ready, then lets go over 1.6 s
      var target = calm ? 0 : (t < formAt ? 1 : 0);
      form += (target - form) * (target > form ? .05 : .025);
      wind *= .92;
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        if (!p.init) { p.init = true; p.x *= w; p.y *= h; }      // first frame: spread over the hero
        // free flight: slow fall with a sideways sway, like down in still air
        p.vy += (p.fall * 22 - p.vy) * .04 + wind * .6;
        var sway = Math.sin(T * .8 + p.ph) * 14;
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 16000) { var f = (16000 - d2) / 16000 * 90, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f * dt * 6; p.vy += dy / dd * f * dt * 6; }
        p.vx *= .94;
        p.x += (p.vx + sway * .05) * dt * 3; p.y += p.vy * dt;
        if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w; }
        if (p.y < -20) p.y = h; if (p.x < -20) p.x = w + 10; if (p.x > w + 20) p.x = -10;
        var hx = b.x + p.hx * b.w, hy = b.y + p.hy * b.h, e = smooth(form);
        var X = lerp(p.x, hx, e), Y = lerp(p.y, hy, e);
        if (e > .98) { p.x = lerp(p.x, hx, .2); p.y = lerp(p.y, hy, .2); }
        var a = p.tw ? .35 + .65 * Math.abs(Math.sin(T * 1.7 + p.ph)) : .5 + .35 * e;
        c.globalAlpha = a; c.fillStyle = p.col;
        c.beginPath(); c.arc(X, Y, p.sz * (1 + e * .2), 0, 6.283); c.fill();
      }
      c.globalAlpha = 1;
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf && vis && !still()) { prev = 0; raf = requestAnimationFrame(frame); } else if (ok && still()) { c && c.clearRect(0, 0, w || 0, h || 0); } }
    function start() { size(); sample(); t0 = performance.now(); formAt = t0 + 3400 * SLOW; kick(); }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    // tap / click on the hero gathers the feather again for a moment
    hero.addEventListener('click', function (e) { if (e.target.closest('a,button')) return; formAt = performance.now() + 1800; kick(); });
    addEventListener('scroll', function () { var d = scrollY - lastY; lastY = scrollY; wind = clamp(wind + d * .4, -60, 60); }, { passive: true });
    watch(hero, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } }, hold: function (ms) { formAt = performance.now() + ms; } };
  })();

  // ---------------------------------------------------------------- the lamp lights her photo where you point; labels type onto it
  var tags = $$('[data-tags] .tag'), lx = .48, ly = .33, ltx = .48, lty = .33, lampRaf = 0, autoT = 0, pointing = false;
  function placeTags(list, map) { list.forEach(function (t) { var p = map(+t.dataset.x, +t.dataset.y); t.style.left = p[0] + 'px'; t.style.top = p[1] + 'px'; t.classList.toggle('flip', rtl() ? p[0] < p[2] * .45 : p[0] > p[2] * .55); }); }
  function archMap(x, y) {
    var W = arch.clientWidth, Hh = arch.clientHeight, iw = 1000, ih = 1250, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s;
    return [(W - dw) * .5 + dw * x, (Hh - dh) * .3 + dh * y, W];
  }
  function typeTag(t, on) {
    var b = $('b', t), txt = t.dataset[he() ? 'he' : 'en'];
    if (on === t.classList.contains('on')) return;
    t.classList.toggle('on', on); clearInterval(t._t);
    if (!on) { b.textContent = ''; return; }
    if (still()) { b.textContent = txt; return; }
    var i = 0; b.textContent = '';
    t._t = setInterval(function () { b.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(t._t); }, 38);
  }
  function lamp(t) {
    lampRaf = 0;
    if (!pointing) {   // by itself the light drifts slowly around the lamp and over her
      autoT += .006;
      ltx = .46 + Math.sin(autoT) * .2; lty = .34 + Math.sin(autoT * 1.7) * .14;
    }
    lx += (ltx - lx) * .08; ly += (lty - ly) * .08;
    arch.style.setProperty('--lx', (lx * 100).toFixed(2) + '%'); arch.style.setProperty('--ly', (ly * 100).toFixed(2) + '%');
    // the label under the light types itself; the others rest
    var W = arch.clientWidth, Hh = arch.clientHeight;
    tags.forEach(function (tg) { var p = archMap(+tg.dataset.x, +tg.dataset.y), d = Math.hypot(p[0] / W - lx, (p[1] / Hh - ly) * 1.25); typeTag(tg, d < .2); });
    if (!still() && heroVis) lampRaf = requestAnimationFrame(lamp);
  }
  var heroVis = true;
  arch.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = arch.getBoundingClientRect(); pointing = true; ltx = (e.clientX - r.left) / r.width; lty = (e.clientY - r.top) / r.height; });
  arch.addEventListener('pointerleave', function () { pointing = false; });
  arch.addEventListener('click', function (e) { var r = arch.getBoundingClientRect(); ltx = (e.clientX - r.left) / r.width; lty = (e.clientY - r.top) / r.height; pointing = true; clearTimeout(arch._p); arch._p = setTimeout(function () { pointing = false; }, 2600); });
  function lampKick() { if (still()) { tags.forEach(function (tg) { tg.classList.add('on'); $('b', tg).textContent = tg.dataset[he() ? 'he' : 'en']; }); return; } if (!lampRaf) lampRaf = requestAnimationFrame(lamp); }
  watch(hero, function (v) { heroVis = v; if (v) lampKick(); });

  // ---------------------------------------------------------------- her photos orbit the arch on a tilted ring; drag or scroll turns it
  var orbit = (function () {
    var box = $('[data-orbit]'), src = $('[data-ringsrc]');
    $$('.oc', src).forEach(function (c) { box.appendChild(c); });
    var cards = $$('.oc', box), N = cards.length, rot = 0, vel = 0, drag = false, px = 0, raf = 0, last = 0;
    function frame(t) {
      raf = 0;
      if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; c.style.zIndex = ''; }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (.28 + vel) * dt * (rtl() ? -1 : 1); vel *= .95; }
      var W = stage.clientWidth, Hh = stage.clientHeight, aw = arch.offsetWidth, ah = arch.offsetHeight;
      var rx = Math.min(W * .5, aw * (phone() ? .95 : 1.02)), ry = ah * .12, cy = ah * .2, sc = scrollY * .0015 * (rtl() ? -1 : 1);
      cards.forEach(function (c, i) {
        var a = rot + sc + i * 6.283 / N, sn = Math.sin(a), cs = Math.cos(a);
        var depth = (sn + 1) / 2;   // 0 behind, 1 in front
        var x = cs * rx, y = cy + sn * ry, s = .62 + depth * .5, tilt = -cs * 18;
        c.style.transform = 'translate(-50%,-50%) translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotateY(' + tilt.toFixed(1) + 'deg) scale(' + s.toFixed(3) + ')';
        c.style.zIndex = sn > 0 ? 60 + Math.round(sn * 10) : 10 + Math.round((sn + 1) * 10);
        c.style.filter = 'brightness(' + (.45 + depth * .6).toFixed(3) + ')';
      });
      if (heroVis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    stage.addEventListener('pointerdown', function (e) { if (still() || e.target.closest('.arch')) return; drag = true; px = e.clientX; stage.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - px; px = e.clientX; rot += dx * .006; vel = dx * .05; });
    addEventListener('pointerup', function () { drag = false; stage.classList.remove('drag'); });
    watch(hero, function (v) { if (v) kick(); });
    return { kick: kick };
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
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : 0; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { setTimeout(function () { roll(o, true); }, 200); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- bento: spotlight under the hand, the loupe over the brow, the week ring
  var craft = $('#craft');
  watch(craft, function (v) { craft.classList.toggle('on', v); if (v) loupeKick(); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var loupe = $('[data-loupe]'), lens = $('[data-lens]'), lpx = .5, lpy = .4, lpt = 0, lpHand = false, lpRaf = 0;
  function lensDraw() {
    var W = loupe.clientWidth, Hh = loupe.clientHeight, iw = 1200, ih = 771, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s, ox = (W - dw) / 2, oy = (Hh - dh) * .25, Z = 2.3;
    var x = lpx * W, y = lpy * Hh;
    lens.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    lens.style.backgroundSize = (dw * Z).toFixed(0) + 'px ' + (dh * Z).toFixed(0) + 'px';
    lens.style.backgroundPosition = (-((x - ox) * Z - 60)).toFixed(1) + 'px ' + (-((y - oy) * Z - 60)).toFixed(1) + 'px';
  }
  function loupeLoop() {
    lpRaf = 0;
    if (!lpHand) { lpt += .008; lpx = .5 + Math.sin(lpt) * .32; lpy = .32 + Math.sin(lpt * 2.1) * .1; }
    lensDraw();
    if (!still() && craft.classList.contains('on')) lpRaf = requestAnimationFrame(loupeLoop);
  }
  function loupeKick() { if (still()) { lpx = .55; lpy = .3; lensDraw(); return; } if (!lpRaf) lpRaf = requestAnimationFrame(loupeLoop); }
  loupe.addEventListener('pointermove', function (e) { var r = loupe.getBoundingClientRect(); lpHand = true; lpx = clamp((e.clientX - r.left) / r.width, 0, 1); lpy = clamp((e.clientY - r.top) / r.height, 0, 1); if (still()) lensDraw(); });
  loupe.addEventListener('pointerleave', function () { lpHand = false; });

  var week = $('[data-week]');
  function arcPath(r, a0, a1) {
    var p = function (a) { return [Math.sin(a) * r, -Math.cos(a) * r]; }, s = p(a0), e = p(a1);
    return 'M' + s[0].toFixed(2) + ' ' + s[1].toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + (a1 - a0 > Math.PI ? 1 : 0) + ' 1 ' + e[0].toFixed(2) + ' ' + e[1].toFixed(2);
  }
  function weekRing() {
    var l = he(), ini = l ? ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'], n = window.__now || now(), out = '', TAU = Math.PI * 2;
    for (var d = 0; d < 7; d++) {
      var a0 = d / 7 * TAU, a1 = (d + 1) / 7 * TAU;
      out += '<path class="arc" d="' + arcPath(78, a0 + .04, a1 - .04) + '"/>';
      if (H[d]) out += '<path class="arc open' + (d === n.d ? ' today' : '') + '" d="' + arcPath(78, a0 + H[d][0] / 24 / 7 * TAU, a0 + H[d][1] / 24 / 7 * TAU) + '"/>';
      var m = (a0 + a1) / 2; out += '<text x="' + (Math.sin(m) * 100).toFixed(1) + '" y="' + (-Math.cos(m) * 100).toFixed(1) + '">' + ini[d] + '</text>';
    }
    out += '<line class="hand" x1="0" y1="0" x2="0" y2="-58" data-hand/><circle class="hub" r="5"/>';
    week.innerHTML = out; weekHand();
  }
  function weekHand() { var hd = $('[data-hand]'); if (!hd) return; var n = window.__now || now(); hd.setAttribute('transform', 'rotate(' + ((n.d + n.h / 24) / 7 * 360).toFixed(2) + ')'); }

  // ---------------------------------------------------------------- before / after: follows the scroll until you take it
  var ba = $('[data-ba]'), range = $('[data-barange]'), baTouched = false;
  function baSet(v) { ba.style.setProperty('--p', v.toFixed(2) + '%'); range.value = Math.round(v); }
  range.addEventListener('input', function () { baTouched = true; baSet(+range.value); });
  range.addEventListener('pointerdown', function () { baTouched = true; });

  // ---------------------------------------------------------------- the room
  var room = $('[data-room]'), rmStage = $('[data-rmstage]'), cam = $('[data-rmcam]'), fl = $('[data-feathers]'), rmTags = $$('[data-rmtags] .tag');
  var SPR = [[190, 242, 61, 59], [249, 285, 73, 116], [151, 307, 63, 138], [112, 325, 29, 26], [223, 352, 7, 21], [97, 360, 28, 22], [210, 370, 46, 59], [125, 394, 37, 82], [198, 450, 11, 20], [122, 456, 13, 15], [141, 478, 24, 19]];
  var feathers = SPR.map(function (s, i) {
    var im = document.createElement('img'); im.src = 'img/f' + i + '.png'; im.alt = ''; im.loading = 'lazy'; im.width = s[2]; im.height = s[3];
    im.style.width = s[2] + 'px'; im.style.height = s[3] + 'px'; fl.appendChild(im);
    return { el: im, x: s[0], y: s[1], w: s[2], h: s[3], dl: [0, .05, .02, .1, .14, .08, .04, .06, .16, .12, .1][i], dx: [-.25, .3, -.05, -.35, .1, -.2, .2, .05, .3, -.1, .15][i], grow: [1.1, 1.5, 1.7, .8, .6, .7, 1.2, 1.4, .6, .5, .7][i], ph: i * 1.7 };
  });
  var camS = 1, camX = 0, camY = 0;
  function camAt(p) {
    var W = rmStage.clientWidth, Hh = rmStage.clientHeight, base = Math.max(W / 1600, Hh / 1200);
    // focus points on her room: the feathers on the wall -> the lamp -> the whole room
    var K = [[0, 260, 400, 1.08], [.42, 950, 560, 1.22], [1, 820, 640, 1]], a = K[0], b = K[1];
    for (var i = 0; i < K.length - 1; i++) if (p >= K[i][0]) { a = K[i]; b = K[i + 1]; }
    var t = smooth((p - a[0]) / (b[0] - a[0] || 1)), fx = lerp(a[1], b[1], t), fy = lerp(a[2], b[2], t), s = base * lerp(a[3], b[3], t);
    var x = clamp(W / 2 - fx * s, W - 1600 * s, 0), y = clamp(Hh * .45 - fy * s, Hh - 1200 * s, 0);
    camS = s; camX = x; camY = y;
    cam.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
  }
  function roomUpdate(p) {
    var calm = still(), W = rmStage.clientWidth, Hh = rmStage.clientHeight;
    camAt(calm ? .42 : p);
    if (!calm) {
      cam.style.setProperty('--lamp', smooth((p - .18) / .22).toFixed(3));
      feathers.forEach(function (f) {
        var l = smooth((p - .1 - f.dl) / .62);
        var cx = camX + (f.x + f.w / 2) * camS, cy = camY + (f.y + f.h / 2) * camS;
        // peel off the wall, drift toward you, sway down and out of the frame
        var X = cx + l * f.dx * W + Math.sin(l * 6 + f.ph) * 40 * l;
        var Y = cy + l * l * (Hh * 1.25) - Math.sin(l * Math.PI) * 50;
        var S = camS * (1 + l * f.grow), R = Math.sin(l * 5 + f.ph) * 30 * l;
        f.el.style.transform = 'translate3d(' + (X - f.w / 2).toFixed(1) + 'px,' + (Y - f.h / 2).toFixed(1) + 'px,0) scale(' + S.toFixed(3) + ') rotate(' + R.toFixed(1) + 'deg)';
        f.el.style.setProperty('--lift', Math.min(1, l * 4).toFixed(2));
      });
      $$('[data-fill] .ch', rmStage).forEach(function (c, i, all) { c.style.setProperty('--on', p > .04 + i / all.length * .4 ? 1 : 0); });
    }
    placeTags(rmTags, function (x, y) { return [camX + x * camS, camY + y * camS, W]; });
    rmTags.forEach(function (t, i) { var y = parseFloat(t.style.top), x = parseFloat(t.style.left), vis = y > 70 && y < Hh * .62 && x > 24 && x < W - 24; t.style.visibility = vis ? '' : 'hidden'; var on = vis && (calm || (p > .34 + i * .08 && p < .96)); typeTag(t, on); });
  }

  // ---------------------------------------------------------------- book: treatment, a day on the lamp's ring, and the text writes itself
  var treats = $$('[data-tr]'), dialSvg = $('[data-dialsvg]'), dialC = $('[data-dialc]'), nameIn = $('[data-name]'), msgEl = $('[data-msg]'), sendA = $('[data-send]');
  var TR_HE = ['לאפילציה', 'לעיצוב גבות', 'לאפילציה ולעיצוב גבות'];
  var selDay = (function () { var n = now(); return H[n.d] ? n.d : (n.d + 1) % 7; })(), steps = $$('[data-step]');
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  treats.forEach(function (b) { b.addEventListener('click', function () { treats.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lightStep(0); write(); }); });
  function dayWords(d, l) {
    if (l) return d === 6 ? 'במוצאי שבת' : d === 5 ? 'ביום שישי בבוקר' : 'ביום ' + dayHe[d];
    return d === 6 ? 'on Saturday night' : d === 5 ? 'on Friday morning' : 'on ' + dayEn[d];
  }
  function dialBuild() {
    var l = he(), TAU = Math.PI * 2, out = '<defs><linearGradient id="lampg" x1="0" x2="1"><stop offset="0" stop-color="#f3d9a8"/><stop offset=".5" stop-color="#e9b6c0"/><stop offset="1" stop-color="#b88a4c"/></linearGradient></defs><circle class="halo" r="142"/>';
    var lab = l ? ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'מוצ״ש'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (var d = 0; d < 7; d++) {
      var a0 = d / 7 * TAU + .035, a1 = (d + 1) / 7 * TAU - .035, m = (a0 + a1) / 2;
      out += '<g class="seg' + (d === selDay ? ' sel' : '') + '" role="radio" tabindex="' + (d === selDay ? 0 : -1) + '" aria-checked="' + (d === selDay) + '" aria-label="' + (l ? (d === 6 ? 'מוצאי שבת' : 'יום ' + dayHe[d]) : dayEn[d]) + '" data-day="' + d + '"><path d="' + arcPath(118, a0, a1) + '"/><text x="' + (Math.sin(m) * 118).toFixed(1) + '" y="' + (-Math.cos(m) * 118).toFixed(1) + '">' + lab[d] + '</text></g>';
    }
    dialSvg.innerHTML = out;
    $$('.seg', dialSvg).forEach(function (g) {
      g.addEventListener('click', function () { pickDay(+g.dataset.day); });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickDay(+g.dataset.day); }
        if (/Arrow/.test(e.key)) { e.preventDefault(); var dd = (+g.dataset.day + (/Right|Down/.test(e.key) ? 1 : 6)) % 7; pickDay(dd); $('[data-day="' + dd + '"]', dialSvg).focus(); }
      });
    });
    dialCenter();
  }
  function dialCenter() {
    var l = he(), t = H[selDay];
    dialC.innerHTML = '<b>' + (l ? (selDay === 6 ? 'מוצאי שבת' : 'יום ' + dayHe[selDay]) : (selDay === 6 ? 'Saturday night' : dayEn[selDay])) + '</b><span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
  }
  function pickDay(d) {
    selDay = d;
    $$('.seg', dialSvg).forEach(function (g) { var on = +g.dataset.day === d; g.classList.toggle('sel', on); g.setAttribute('aria-checked', on); g.setAttribute('tabindex', on ? 0 : -1); });
    dialCenter(); lightStep(1); write();
  }
  function compose() {
    var l = he(), ti = treats.map(function (x) { return x.getAttribute('aria-checked') === 'true'; }).indexOf(true), tb = treats[ti];
    var nm = (nameIn.value || '').trim();
    return l ? 'היי שרה, ' + (nm ? 'כאן ' + nm + '. ' : '') + 'אשמח לקבוע תור ' + TR_HE[ti] + ' ' + dayWords(selDay, true) + '. מתי נוח לך?'
             : 'Hi Sarah, ' + (nm ? 'it’s ' + nm + '. ' : '') + 'I’d like to book ' + tb.dataset.en + ' ' + dayWords(selDay, false) + '. When suits you?';
  }
  var shown = '', typing = 0, chatSeen = false, bub = $('.bub');
  function write(instant) {
    var target = compose();
    sendA.href = smsHref(target);
    cancelAnimationFrame(typing); bub.classList.remove('typing');
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep; bub.classList.add('typing');
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st); else bub.classList.remove('typing');
    })(t0);
  }
  nameIn.addEventListener('input', function () { write(); });
  sendA.addEventListener('pointerenter', function () { lightStep(2); });
  sendA.addEventListener('focus', function () { lightStep(2); });
  sendA.addEventListener('click', function () { lightStep(2); });
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; lightStep(0); write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- one scroll loop
  var sheet = $('.sheet'), revs = $$('[data-rv]'), visit = $('[data-visit]'), mirror = $('[data-mirror]'), mirImg = $('img', mirror), vcards = $$('[data-vscards] > *'), foot = $('[data-foot]'), fword = $$('[data-fword] .ch'), flight = $('.f-light'), dock = $('[data-dock]');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // the sheet lands over the hero
    var st = sheet.getBoundingClientRect().top, q = calm ? 0 : clamp(1 - st / vh, 0, 1);
    hero.style.setProperty('--cover', q.toFixed(3));
    hero.style.transform = calm || q <= 0 ? '' : 'scale(' + (1 - q * .06).toFixed(4) + ')';
    // before/after follows the scroll until you take the line
    if (!baTouched) {
      var r = ba.getBoundingClientRect(), t = clamp((vh * .85 - r.top) / (vh * .7), 0, 1);
      baSet(calm ? 50 : lerp(92, 8, smooth(t)));
    }
    // the room
    roomUpdate(calm ? .42 : prog(room));
    // reviews drift down and land, swaying like the feathers
    revs.forEach(function (rv, i) {
      if (calm) { rv.style.transform = ''; rv.style.opacity = ''; return; }
      var rr = rv.getBoundingClientRect(), k = smooth(clamp((vh - rr.top) / (vh * .5), 0, 1)), u = 1 - k;
      rv.style.transform = 'translate3d(' + (Math.sin(u * 4 + i * 1.3) * 40 * u).toFixed(1) + 'px,' + (-u * 110).toFixed(1) + 'px,0) rotate(' + (Math.sin(u * 5 + i) * 7 * u).toFixed(2) + 'deg)';
      rv.style.opacity = (.15 + .85 * k).toFixed(3);
    });
    // visit: the mirror fills the screen and draws back onto the wall
    if (!calm) {
      var vr = mirror.getBoundingClientRect(), mp = smooth(clamp((vh - vr.top) / (vh * .95), 0, 1));
      var big = Math.max(vh, innerWidth) * 1.5 / Math.max(1, vr.width);
      mirror.style.transform = 'scale(' + lerp(big, 1, mp).toFixed(4) + ')';
      mirImg.style.transform = 'scale(' + lerp(1.7, 1, mp).toFixed(4) + ')';
      mirror.style.setProperty('--veil', (.15 + (1 - mp) * .85).toFixed(3));
      vcards.forEach(function (c, i) { var v = smooth((mp - .55 - i * .06) / .3); c.style.opacity = v.toFixed(3); c.style.transform = v >= 1 ? '' : 'translateY(' + ((1 - v) * 30).toFixed(1) + 'px)'; });
    } else { mirror.style.transform = ''; mirImg.style.transform = ''; vcards.forEach(function (c) { c.style.opacity = ''; c.style.transform = ''; }); }
    // footer: the curtain lifts, her name rises letter by letter over the lamp's light
    var fr = foot.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / Math.max(1, fr.height));
    flight.style.setProperty('--rise', ((1 - fp) * 120).toFixed(1) + 'px');
    fword.forEach(function (c, i) { c.style.setProperty('--k', calm ? 1 : smooth(fp * 1.6 - i * .12).toFixed(3)); });
    // the lamp dock: away while the hero's own buttons are on screen
    dock.classList.toggle('away', scrollY < hero.offsetHeight * .55);
  }

  function layout() {
    hero.style.setProperty('--stick', Math.min(0, innerHeight - hero.offsetHeight) + 'px');
    down.size();
    placeTags(tags, archMap);
    lensDraw(); tick(); lampKick();
  }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); lw = innerWidth; }, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); weekRing(); dialBuild(); write(true); layout();

  // ---------------------------------------------------------------- the opening: plaque, ring of light, her photos dealt, the last one flies into the arch
  var opener = $('[data-open]'), started = false;
  function ready() {
    if (started) return; started = true;
    requestAnimationFrame(function () { hero.classList.add('ready'); down.hold(2600 * SLOW); $$('[data-decode] [data-dc]').forEach(decode); });
  }
  function finishOpen() {
    if (!root.classList.contains('opening')) return;
    opener.classList.add('done'); ready();
    try { sessionStorage.setItem('sarah-opened', '1'); } catch (e) {}
    setTimeout(function () { root.classList.remove('opening'); }, 520);
  }
  if (root.classList.contains('opening')) {
    var deck = $$('[data-odeck] img'), lastC = $('[data-olast]'), FAN = [[-220, -40, -12], [-110, -90, -5], [110, -90, 5], [220, -40, 12]];
    if (innerWidth < 600) FAN = [[-120, -150, -10], [-60, -190, -4], [60, -190, 4], [120, -150, 10]];
    deck.forEach(function (im, i) {
      if (im === lastC) return;
      var f = FAN[i]; im.animate([{ opacity: 0, transform: 'translate(-50%,-50%) scale(.6) rotate(0deg)' }, { opacity: 1, transform: 'translate(-50%,-50%) translate(' + f[0] + 'px,' + f[1] + 'px) rotate(' + f[2] + 'deg) scale(.9)' }], { duration: 560 * SLOW, delay: (120 + i * 90) * SLOW, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'forwards' });
    });
    lastC.animate([{ opacity: 0, transform: 'translate(-50%,-50%) scale(.6)' }, { opacity: 1, transform: 'translate(-50%,-50%) translateY(40px) scale(1)' }], { duration: 480 * SLOW, delay: (480) * SLOW, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'forwards' });
    setTimeout(function () {
      // fly into the arch (FLIP from the card's place to the arch's rectangle)
      var a = arch.getBoundingClientRect(), cx = innerWidth / 2, cy = innerHeight / 2 + 40;
      var sx = a.width / 150, sy = a.height / 190;
      lastC.animate([{ opacity: 1, transform: 'translate(-50%,-50%) translateY(40px) scale(1)', borderRadius: '16px' },
                     { opacity: 1, transform: 'translate(-50%,-50%) translate(' + (a.left + a.width / 2 - cx).toFixed(1) + 'px,' + (a.top + a.height / 2 - cy + 40).toFixed(1) + 'px) scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')', borderRadius: '999px 999px 30px 30px' }],
        { duration: 520 * SLOW, easing: 'cubic-bezier(.77,0,.175,1)', fill: 'forwards' });
      deck.forEach(function (im) { if (im !== lastC) im.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 * SLOW, fill: 'forwards' }); });
    }, 860 * SLOW);
    setTimeout(finishOpen, 1380 * SLOW);
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) { addEventListener(ev, finishOpen, { once: true, passive: true }); });
  } else {
    var once = false, go = function () { if (once) return; once = true; ready(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    setTimeout(go, 900);
  }
  addEventListener('load', function () { layout(); });
})();
