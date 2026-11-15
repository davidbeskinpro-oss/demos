(function () {
  var root = document.documentElement, WA = '972545520879';
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
  var TITLE = { he: 'אדם בריוטי · עיצוב שיער והחלקות · האלון, נשר', en: 'Adam Baryoti · Hair design & smoothing · HaAlon St, Nesher' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור אדם בריוטי עיצוב שיער המרכז להחלקות · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Adam Baryoti Hair Design – The Smoothing Centre · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var store = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'אדם בריוטי', 'Adam Baryoti');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לאדם, 054-552-0879', 'Call Adam, 054-552-0879');
    aria('[data-t-wa]', 'וואטסאפ לאדם', 'WhatsApp Adam');
    aria('[data-t-what]', 'טיפול', 'Treatment');
    aria('[data-t-len]', 'אורך השיער', 'Hair length');
    aria('[data-t-day]', 'יום', 'Day');
    aria('[data-t-5]', '5 כוכבים', '5 stars');
    $$('[data-decode]').forEach(function (d) { d.textContent = d.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    store('ab-lang', l);
    texts(l); hours(); buildDays(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    store('ab-motion', on ? 'on' : 'off');
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $('[data-fname]').classList.add('in');
    layout(); petals.kick(); fpetals.kick(); cloth.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [8.5, 19], 1: [8.5, 19], 2: [8.5, 19], 3: [8.5, 19], 4: [8.5, 19], 5: [8, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
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
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- letters: every text node becomes words of letter spans
  function split(el, start) {
    var i = start || 0;
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          if (!c.textContent.trim()) return;
          var frag = document.createElement('span'); frag.className = 'sw';
          frag.innerHTML = c.textContent.split(/(\s+)/).map(function (w) {
            if (!w) return '';
            if (/^\s+$/.test(w)) return ' ';
            return '<span class="w">' + w.split('').map(function (ch) { return '<span class="ch" style="--i:' + (i++) + '">' + ch + '</span>'; }).join('') + '</span>';
          }).join('');
          c.replaceWith(frag);
        } else if (c.nodeType === 1) walk(c);
      });
    })(el);
  }
  $$('.h-title .ln > span[lang]').forEach(function (sp) { split(sp, sp.closest('.ln').previousElementSibling ? 10 : 0); });
  $$('[data-fill] > span[lang], [data-fname] > span[lang]').forEach(function (sp) { split(sp); });

  // ---------------------------------------------------------------- entrances
  $$('.bento,.vb').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 70 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-fname]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- labels decode out of scrambled glyphs
  var GLY = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'abcdefghijklmnopqrstuvwxyz' };
  function decode(el) {
    var l = root.lang, txt = el.dataset[l], t0 = performance.now(), dur = 800;
    if (still()) { el.textContent = txt; return; }
    (function st(t) {
      var k = (t - t0) / dur, n = Math.floor(k * txt.length), out = '';
      for (var i = 0; i < txt.length; i++) out += i < n || txt[i] === ' ' ? txt[i] : GLY[l][Math.floor(Math.random() * GLY[l].length)];
      el.textContent = out;
      if (k < 1) requestAnimationFrame(st); else el.textContent = txt;
    })(t0);
  }
  $$('[data-decode]').forEach(function (d) { watch(d, function (v) { if (v && !d._done) { d._done = true; decode(d); } }, { threshold: .6 }); });

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- hero: the veil lifts under the hand; on touch a slow light drifts by itself
  var clear = $('[data-clear]'), heroVis = true, mx = -1, my = -1, driftRaf = 0;
  function setClear(x, y) { clear.style.setProperty('--mx', x.toFixed(1) + 'px'); clear.style.setProperty('--my', y.toFixed(1) + 'px'); }
  hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse' || still()) return; var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; setClear(mx, my); });
  hero.addEventListener('pointerleave', function () { mx = -1; driftKick(); });
  function drift(t) {
    driftRaf = 0; if (still() || !heroVis || mx >= 0) return;
    var w = hero.clientWidth, h = hero.clientHeight, s = t / 1000;
    setClear(w * (.55 + .3 * Math.sin(s * .37)), h * (.36 + .16 * Math.sin(s * .53 + 1)));
    clear.style.setProperty('--rad', (phone() ? 150 : 230) + 'px');
    driftRaf = requestAnimationFrame(drift);
  }
  function driftKick() { if (!driftRaf) driftRaf = requestAnimationFrame(drift); }
  watch(hero, function (v) { heroVis = v; driftKick(); petals.kick(); });

  // the gold lily: drawn in on arrival, its petals open as you scroll
  var hl = $('[data-hlily]');
  hl.setAttribute('viewBox', '0 0 200 200'); hl.innerHTML = '<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' + $('#lily g').innerHTML + '</g>';

  // ---------------------------------------------------------------- petals: lily petals drifting down, parting around the pointer, scattered by a tap
  function Petals(cv, host, count) {
    var c = cv.getContext('2d'), P = [], w = 0, h = 0, raf = 0, vis = true, px = -999, py = -999, last = 0;
    var COL = ['rgba(246,236,228,', 'rgba(240,194,196,', 'rgba(217,183,126,'];
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = host.clientWidth; h = host.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(count * (phone() ? .6 : 1));
      if (P.length !== n) { P = []; for (var i = 0; i < n; i++) P.push(make(true)); }
      draw();
    }
    function make(any) { return { x: Math.random() * w, y: any ? Math.random() * h : -20, vx: 0, vy: 0, s: 6 + Math.random() * 10, r: Math.random() * 6.28, vr: (Math.random() - .5) * .02, ph: Math.random() * 6.28, f: .25 + Math.random() * .45, col: COL[Math.floor(Math.random() * 3)], a: .35 + Math.random() * .4 }; }
    function petal(p) {
      c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.col + p.a + ')';
      c.beginPath(); c.moveTo(0, -p.s); c.bezierCurveTo(p.s * .7, -p.s * .5, p.s * .5, p.s * .6, 0, p.s); c.bezierCurveTo(-p.s * .5, p.s * .6, -p.s * .7, -p.s * .5, 0, -p.s); c.fill();
      c.restore();
    }
    function draw() { c.clearRect(0, 0, w, h); P.forEach(petal); }
    function frame(t) {
      raf = 0; if (still() || !vis) { draw(); return; }
      var dt = last ? Math.min(2, (t - last) / 16.7) : 1; last = t;
      P.forEach(function (p) {
        var dx = p.x - px, dy = p.y - py, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { var f = (14000 - d2) / 14000 * .9, d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f; }
        p.vx *= .94; p.vy *= .94;
        p.x += (p.vx + Math.sin(t / 1400 + p.ph) * .35) * dt; p.y += (p.vy + p.f) * dt; p.r += p.vr * dt;
        if (p.y > h + 20 || p.x < -30 || p.x > w + 30) { var q = make(false); for (var k in q) p[k] = q[k]; }
      });
      draw(); raf = requestAnimationFrame(frame);
    }
    function kick() { last = 0; if (!raf) raf = requestAnimationFrame(frame); }
    host.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
    host.addEventListener('pointerleave', function () { px = py = -999; });
    host.addEventListener('pointerdown', function (e) {
      if (still()) return; var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      P.forEach(function (p) { var dx = p.x - x, dy = p.y - y, d = Math.sqrt(dx * dx + dy * dy) || 1; if (d < 240) { p.vx += dx / d * 9 * (1 - d / 240); p.vy += dy / d * 9 * (1 - d / 240); } });
    });
    watch(host, function (v) { vis = v; kick(); });
    return { size: size, kick: kick };
  }
  var petals = Petals($('[data-petals]'), hero, 46);
  var foot = $('[data-foot]'), fpetals = Petals($('[data-fpetals]'), foot, 26);

  // ---------------------------------------------------------------- the satin: folds that flatten as you scroll, a sheen that follows the light
  var satin = $('[data-satin]');
  var cloth = (function () {
    var cv = $('[data-cloth]'), c = cv.getContext('2d'), off = document.createElement('canvas'), oc = off.getContext('2d');
    var GW = 0, GH = 0, img = null, raf = 0, vis = false, prog = 0, lx = .6, ly = -.8, tlx = .6, tly = -.8;
    var SH = [150, 86, 100], MID = [238, 194, 197], HI = [255, 243, 236];
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth || innerWidth, h = cv.clientHeight || innerHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      GW = phone() ? 110 : 170; GH = Math.max(40, Math.round(GW * h / w));
      off.width = GW; off.height = GH; img = oc.createImageData(GW, GH);
      paint(performance.now());
    }
    function paint(t) {
      if (!img) return;
      var s = still() ? 0 : t / 1000, A = still() ? .1 : lerp(1.15, .1, smooth(prog * 1.25)), d = img.data, asp = GH / GW;
      var band = still() ? .78 : lerp(.15, 1.05, prog) + Math.sin(s * .35) * .06;
      lx += (tlx - lx) * .06; ly += (tly - ly) * .06;
      for (var y = 0; y < GH; y++) {
        var v = y / GH * asp;
        for (var x = 0; x < GW; x++) {
          var u = x / GW;
          var q = u * .88 + v * .48, rr = -u * .48 + v * .88;
          var a1 = q * 12 + Math.sin(rr * 2.6 + s * .35) * 1.8, a2 = q * 21 + Math.sin(rr * 3.4 - s * .25 + 1) * 1.4 + 1.7, a3 = q * 6 + rr * 1.5 + s * .2;
          var hgt = A * (Math.sin(a1) * .6 + Math.sin(a2) * .28 + Math.sin(a3) * .35);
          var hq = A * (7.2 * Math.cos(a1) + 5.9 * Math.cos(a2) + 2.1 * Math.cos(a3));
          var dif = clamp(.64 + hq * (lx * .88 + ly * .48 + .4) * .05, 0, 1);
          var ridge = Math.pow(Math.max(0, Math.sin(a1 + .9)), 10) * A * .5;
          var b = (u * .8 + v * .6) - band + hgt * .08, sh = clamp(Math.exp(-b * b / .012) * .6 + Math.exp(-b * b / .16) * .16 + ridge, 0, 1);
          var k = (y * GW + x) * 4, r = lerp(SH[0], MID[0], dif), g = lerp(SH[1], MID[1], dif), bl = lerp(SH[2], MID[2], dif);
          d[k] = lerp(r, HI[0], sh); d[k + 1] = lerp(g, HI[1], sh); d[k + 2] = lerp(bl, HI[2], sh); d[k + 3] = 255;
        }
      }
      oc.putImageData(img, 0, 0);
      c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
      c.drawImage(off, 0, 0, cv.width, cv.height);
    }
    function frame(t) { raf = 0; paint(t); if (!still() && vis) raf = requestAnimationFrame(frame); }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    satin.addEventListener('pointermove', function (e) { var r = satin.getBoundingClientRect(); tlx = ((e.clientX - r.left) / r.width - .5) * 2; tly = ((e.clientY - r.top) / innerHeight - .5) * 2; });
    watch(satin, function (v) { vis = v; kick(); });
    return { size: size, kick: kick, set: function (p) { prog = p; if (!fine) { tlx = Math.cos(p * 5) * .8; tly = Math.sin(p * 5) * .8 - .3; } } };
  })();
  var fillCh = $$('[data-fill] .ch'), scards = $$('[data-scards] .sc');
  var SX = [-105, 0, 105], SY = [4, -6, 6], SR = [-7, 2, 8];

  // ---------------------------------------------------------------- Adam: the photo tilts toward the hand, light slides across it
  var aph = $('[data-tilt]');
  if (fine) {
    aph.addEventListener('pointermove', function (e) {
      if (still()) return; var r = aph.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      aph.style.transform = 'perspective(900px) rotateY(' + (x * 10).toFixed(2) + 'deg) rotateX(' + (-y * 8).toFixed(2) + 'deg)';
      aph.style.setProperty('--sx', (x * 140).toFixed(1) + '%');
    });
    aph.addEventListener('pointerleave', function () { aph.style.transform = ''; aph.style.setProperty('--sx', '-60%'); });
  }

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 4) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- bento: living tiles and a spotlight under the hand
  var svc = $('[data-svc]');
  watch(svc, function (v) { svc.classList.toggle('on', v); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- the salon: a framed photo opens to full screen, then the room slides past
  var salon = $('[data-salon]'), rail = $('[data-rail]'), openP = $('[data-open]');

  // ---------------------------------------------------------------- the note to Adam
  var whats = $$('[data-what]'), lenIn = $('[data-len]'), daysBox = $('[data-days]'), steps = $$('[data-step]'), msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false, day = -1;
  var LEN = { he: ['קצר', 'עד הכתפיים', 'ארוך'], en: ['short', 'shoulder length', 'long'] };
  var DSH = { he: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] };
  function light(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function buildDays() {
    if (day < 0) { var n = now(); day = n.d; var k = 0; while (!H[day] && k++ < 7) day = (day + 1) % 7; }
    var l = he() ? 'he' : 'en';
    daysBox.innerHTML = DSH[l].map(function (d, i) {
      return '<button type="button" role="radio" aria-checked="' + (i === day) + '" data-day="' + i + '"' + (H[i] ? '' : ' disabled') + ' aria-label="' + (l === 'he' ? 'יום ' + dayHe[i] : dayEn[i]) + (H[i] ? '' : (l === 'he' ? ', סגור' : ', closed')) + '">' + d + '</button>';
    }).join('');
  }
  daysBox.addEventListener('click', function (e) { var b = e.target.closest('[data-day]'); if (!b || b.disabled) return; day = +b.dataset.day; $$('[data-day]', daysBox).forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); light(2); write(); });
  whats.forEach(function (b) { b.addEventListener('click', function () { whats.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); light(0); write(); }); });
  lenIn.addEventListener('input', function () { light(1); write(); });
  function compose() {
    var l = he(), w = whats.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], what = w.dataset[l ? 'he' : 'en'], brows = w === whats[3];
    var len = LEN[l ? 'he' : 'en'][+lenIn.value];
    if (l) return 'שלום אדם, אשמח לקבוע תור ל' + what + '.' + (brows ? '' : '\nאורך השיער: ' + len + '.') + '\nיום שמתאים לי: ' + dayHe[day] + '.';
    return 'Hi Adam, I’d like to book ' + what + '.' + (brows ? '' : '\nHair length: ' + len + '.') + '\nA day that suits me: ' + dayEn[day] + '.';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
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
  watch($('[data-appt]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .5 });

  // ---------------------------------------------------------------- reviews: the swatch fan opens
  var revs = $('[data-revs]'), rvs = $$('.rv', revs);
  rvs.forEach(function (rv, i) { rv.addEventListener('focus', function () { rvs.forEach(function (x) { x.style.zIndex = ''; }); rv.style.zIndex = 5; }); rv.addEventListener('pointerenter', function () { rv.style.zIndex = 5; }); rv.addEventListener('pointerleave', function () { rv.style.zIndex = ''; }); });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // the lily opens as the hero scrolls away
    var hr = hero.getBoundingClientRect();
    hero.style.visibility = !calm && $('.s-stage').getBoundingClientRect().top <= 0 && satin.getBoundingClientRect().bottom > 0 ? 'hidden' : '';
    hl.style.setProperty('--bloom', calm ? 1 : (.35 + .65 * smooth(scrollY / (hr.height * .9 + 1))).toFixed(3));
    // satin
    var sp = calm ? 1 : prog(satin);
    cloth.set(sp); if (calm) cloth.kick();
    var nOn = calm ? fillCh.length : Math.round(smooth(sp / .4) * fillCh.length);
    fillCh.forEach(function (c, i) { c.classList.toggle('on', i < nOn); });
    scards.forEach(function (c, i) {
      var t = calm ? 1 : smooth((sp - .05 - i * .1) / .28);
      c.style.transform = 'translate(-50%,-50%) translate(' + SX[i] * (rtl() ? -1 : 1) + '%,' + (SY[i] + (1 - t) * 160).toFixed(1) + '%) rotate(' + (SR[i] + (1 - t) * (i - 1) * 18).toFixed(2) + 'deg)';
      c.style.opacity = calm ? '' : clamp(t * 3, 0, 1).toFixed(3);
    });
    // Adam on touch: a gentle tilt with the scroll
    if (!fine) { var ar = aph.getBoundingClientRect(), o = calm ? 0 : clamp((ar.top + ar.height / 2 - vh / 2) / vh, -1, 1); aph.style.transform = calm ? '' : 'perspective(900px) rotateX(' + (o * 7).toFixed(2) + 'deg)'; aph.style.setProperty('--sx', (o * -120).toFixed(1) + '%'); }
    // salon rail
    if (!calm) {
      var rp = prog(salon), op = smooth(rp / .22), mp = smooth((rp - .24) / .7);
      var ins = (1 - op), r0 = (1 - op) * 28 + 26;
      openP.style.clipPath = 'inset(' + (ins * 9).toFixed(2) + '% ' + (ins * 16).toFixed(2) + '% round ' + r0.toFixed(1) + 'px)';
      var dist = Math.max(0, rail.scrollWidth - rail.clientWidth);
      rail.style.transform = 'translate3d(' + ((rtl() ? 1 : -1) * dist * mp).toFixed(1) + 'px,0,0)';
    } else { openP.style.clipPath = ''; rail.style.transform = ''; }
    // reviews fan (wide screens)
    if (!calm && innerWidth > 860) {
      var rr = revs.getBoundingClientRect(), e = smooth((vh - rr.top) / (vh * .85) - .15), cw = rvs[0].offsetWidth;
      rvs.forEach(function (rv, i) {
        var k = (i - 1) * (rtl() ? -1 : 1);
        rv.style.transform = 'translateX(' + (k * cw * 1.04 * e).toFixed(1) + 'px) translateY(' + (Math.abs(k) * 22 * e).toFixed(1) + 'px) rotate(' + (k * lerp(3, 7, e)).toFixed(2) + 'deg)';
      });
    } else rvs.forEach(function (rv) { rv.style.transform = innerWidth > 860 ? '' : 'rotate(var(--tilt,0deg))'; });
  }

  function layout() { petals.size(); fpetals.size(); cloth.size(); tick(); }
  var rz, lastW = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); lastW = innerWidth; }, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); buildDays(); write(true); layout(); driftKick();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); petals.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { layout(); });
})();
