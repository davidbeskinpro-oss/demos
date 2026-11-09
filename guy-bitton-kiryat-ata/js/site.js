(function () {
  var root = document.documentElement, WA = '972523223007';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var hoverable = matchMedia('(hover: hover)').matches;
  var TITLE = { he: 'גיא ביטון · סלון שיער · העצמאות 10, קריית אתא', en: 'Guy Bitton · Hair salon · 10 HaAtzmaut St, Kiryat Ata' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור סלון שיער גיא ביטון · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Guy Bitton Hair Salon · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';
  var PAL = ['#e2bdb6', '#93a594', '#9a6b74', '#f3e5e0', '#d9ae7a', '#6d5f66'];

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'סלון שיער גיא ביטון', 'Guy Bitton Hair Salon');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-wa]', 'וואטסאפ לגיא', 'WhatsApp Guy');
    aria('[data-t-call]', 'התקשרו לגיא, 052-322-3007', 'Call Guy, 052-322-3007');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: העצמאות 10, קריית אתא' : 'Map: 10 HaAtzmaut St, Kiryat Ata'; });
    $$('[data-decode]').forEach(function (el) { if (el._done || still()) el.textContent = el.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('gb-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('gb-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-decode]').forEach(function (el) { el._done = true; el.textContent = el.dataset[root.lang]; });
    layout(); heroChips.kick(); lampChips.kick(); shineLoop(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed; 9.5 = 9:30
  var H = { 0: [9.5, 19], 1: [9, 17], 2: [9.5, 19], 3: [9.5, 19], 4: [9.5, 19], 5: [8.5, 14], 6: null };
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
    $('[data-lampzone]').classList.toggle('lit', open);   // his lamp is lit while the salon is open
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
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 9 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // labels decode out of scrambled letters as they arrive
  var GLY = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'abcdefghijklmnopqrstuvwxyz' };
  function decode(el) {
    var l = root.lang, txt = el.dataset[l]; el._done = true;
    if (still()) { el.textContent = txt; return; }
    var t0 = performance.now(), g = GLY[l];
    (function st(t) {
      if (root.lang !== l) { el.textContent = el.dataset[root.lang]; return; }
      var k = (t - t0) / 650, n = Math.floor(k * txt.length), out = '';
      for (var i = 0; i < txt.length; i++) out += i < n || txt[i] === ' ' ? txt[i] : g[Math.floor(Math.random() * g.length)];
      el.textContent = out; if (k < 1) requestAnimationFrame(st); else el.textContent = txt;
    })(t0);
  }
  $$('[data-decode]').forEach(function (el) {
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { setTimeout(function () { decode(el); }, 500); ob.disconnect(); } }, { threshold: .6 }).observe(el);
    else el.textContent = el.dataset[root.lang];
  });

  // ---------------------------------------------------------------- terrazzo chips: his wall's flecks, drifting, parting under the hand
  function chipField(cv, host, count, opt) {
    var c = cv.getContext('2d'), P = [], w = 0, h = 0, raf = 0, vis = true, mx = -999, my = -999, t0 = performance.now();
    function shape() { var n = 5 + Math.floor(Math.random() * 3), pts = []; for (var k = 0; k < n; k++) { var a = k / n * 6.283 + Math.random() * .5, r = .55 + Math.random() * .45; pts.push([Math.cos(a) * r, Math.sin(a) * r * (.6 + Math.random() * .5)]); } return pts; }
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = host.clientWidth; h = host.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(count * (phone() ? .55 : 1)); P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: 3 + Math.pow(Math.random(), 2.4) * (opt.big || 16), a: Math.random() * 6.28, va: (Math.random() - .5) * .006, vy: -(.05 + Math.random() * .16), ox: 0, oy: 0, z: .3 + Math.random() * .7, col: PAL[i % PAL.length], al: .28 + Math.random() * .45, s: shape() });
    }
    function draw(T) {
      c.clearRect(0, 0, w, h);
      var sy = opt.parallax ? scrollY : 0;
      for (var i = 0; i < P.length; i++) {
        var p = P[i], x = p.x + p.ox, y = ((p.y + p.oy - sy * p.z * .25) % (h + 40) + h + 40) % (h + 40) - 20, lit = 1;
        if (opt.spot && mx > -900) { var d = Math.hypot(x - mx, y - my); lit = 1 + Math.max(0, 1 - d / 220) * 1.4; }
        c.save(); c.translate(x, y); c.rotate(p.a); c.globalAlpha = Math.min(1, p.al * (opt.spot ? .55 * lit : 1)); c.fillStyle = p.col;
        c.beginPath(); p.s.forEach(function (q, k) { k ? c.lineTo(q[0] * p.r, q[1] * p.r) : c.moveTo(q[0] * p.r, q[1] * p.r); }); c.closePath(); c.fill(); c.restore();
      }
    }
    function frame(t) {
      raf = 0;
      if (still() || !vis) { draw(t); return; }
      for (var i = 0; i < P.length; i++) {
        var p = P[i]; p.y += p.vy; p.a += p.va; if (p.y < -30) p.y += h + 60;
        if (!opt.spot && mx > -900) { var dx = p.x + p.ox - mx, dy = p.y + p.oy - my, d2 = dx * dx + dy * dy; if (d2 < 16000) { var f = (16000 - d2) / 16000 * 2.2, dd = Math.sqrt(d2) || 1; p.ox += dx / dd * f; p.oy += dy / dd * f; } }
        p.ox *= .97; p.oy *= .97;
      }
      draw(t); raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    host.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(host, function (v) { vis = v; kick(); });
    return { size: function () { size(); draw(0); }, kick: kick };
  }
  var hero = $('[data-hero]'), nav = $('[data-nav]');
  var heroChips = chipField($('[data-chips]'), hero, 80, { big: 18, parallax: true });
  var lampZone = $('[data-lampzone]');
  var lampChips = chipField($('[data-lampchips]'), lampZone, 60, { big: 14, spot: true });

  // ---------------------------------------------------------------- the shine on the hair follows the hand (on phones it sweeps by itself)
  var shines = $$('[data-shine]'), sRaf = 0, sx = .3, sy = .3, handT = 0;
  function setShine(fx, fy) { shines.forEach(function (d, i) { d.style.setProperty('--sx', ((fx + i * .08) * 100).toFixed(1) + '%'); d.style.setProperty('--sy', ((fy - i * .05) * 100).toFixed(1) + '%'); }); }
  $('[data-discs]').addEventListener('pointermove', function (e) { var r = this.getBoundingClientRect(); sx = (e.clientX - r.left) / r.width; sy = (e.clientY - r.top) / r.height; handT = performance.now(); setShine(sx, sy); });
  var heroVis = true; watch(hero, function (v) { heroVis = v; shineLoop(); });
  function shineLoop() {
    if (sRaf) return;
    (function st(t) {
      sRaf = 0; if (still() || !heroVis) { setShine(.32, .28); return; }
      if (t - handT > 2500) { var k = t / 2600; setShine(.5 + Math.cos(k) * .32, .45 + Math.sin(k * 1.3) * .26); }
      sRaf = requestAnimationFrame(st);
    })(performance.now());
  }

  // ---------------------------------------------------------------- the opening: chips gather into his real monogram, then the real logo
  var openEl = $('[data-open]');
  function finishOpen() {
    if (!root.classList.contains('opening')) return;
    openEl.classList.add('logo', 'done');
    try { sessionStorage.setItem('gb-open', '1'); } catch (e) {}
    setTimeout(function () { root.classList.remove('opening'); }, 650);
    go();
  }
  if (root.classList.contains('opening')) {
    openEl.addEventListener('click', finishOpen);
    var oc = $('[data-opencv]'), ctx = oc.getContext('2d'), src = new Image();
    src.onload = function () {
      var pts = [];
      try {
        var sc = document.createElement('canvas'), iw = 100, ih = 104; sc.width = iw; sc.height = ih;
        var sx2 = sc.getContext('2d'); sx2.drawImage(src, 0, 0, iw, ih);
        var d = sx2.getImageData(0, 0, iw, ih).data;
        for (var y = 0; y < ih; y += 2) for (var x = 0; x < iw; x += 2) if (d[(y * iw + x) * 4 + 3] > 140) pts.push([x / iw, y / ih]);
      } catch (e) { pts = []; }
      var dpr = Math.min(2, devicePixelRatio || 1), W = innerWidth, Hh = innerHeight; oc.width = W * dpr; oc.height = Hh * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var S = Math.min(W, Hh) * .36, ox = (W - S) / 2, oy = (Hh - S * 1.04) / 2;
      var P = pts.map(function (q, i) { return { x: Math.random() * W, y: Math.random() * Hh, tx: ox + q[0] * S, ty: oy + q[1] * S * 1.04, col: PAL[i % PAL.length], r: 2 + Math.random() * 3, a: Math.random() * 6, dl: Math.random() * .25 }; });
      var t0 = performance.now();
      (function st(t) {
        var k = (t - t0) / 1000; ctx.clearRect(0, 0, W, Hh);
        P.forEach(function (p) {
          var e = smooth((k - p.dl) / .75), x = lerp(p.x, p.tx, e), y = lerp(p.y, p.ty, e), dark = smooth((k - .8) / .25);
          ctx.fillStyle = dark > 0 ? p.col : p.col; ctx.globalAlpha = 1 - dark * .85;
          ctx.save(); ctx.translate(x, y); ctx.rotate(p.a * (1 - e)); ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * .8); ctx.restore();
        });
        if (k > .95) openEl.classList.add('logo');
        if (k < 1.5 && root.classList.contains('opening')) requestAnimationFrame(st); else finishOpen();
      })(t0);
    };
    src.onerror = finishOpen;
    src.src = 'img/mono.png';
    setTimeout(finishOpen, 2600);
  }

  // ---------------------------------------------------------------- SEAM: balayage painted from root to tip
  var strands = $('[data-strands]'), ssvg = $('[data-strandsvg]'), wide = [], fine = [];
  function buildStrands() {
    var W = strands.clientWidth, Hh = strands.clientHeight + 2; ssvg.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh);
    var gap = 14, html = '<defs><linearGradient id="bal" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="' + Hh + '">' +
      '<stop offset="0" stop-color="#1d191b"/><stop offset=".28" stop-color="#3b2c2a"/><stop offset=".55" stop-color="#a77d58"/><stop offset=".74" stop-color="#d9ae7a"/><stop offset=".9" stop-color="#dcb4a6"/><stop offset="1" stop-color="#e2bdb6"/></linearGradient>' +
      '<linearGradient id="glint" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="' + Hh + '"><stop offset=".2" stop-color="#f3dcc0" stop-opacity="0"/><stop offset=".6" stop-color="#f6e3c9" stop-opacity=".7"/><stop offset=".95" stop-color="#f3e5e0" stop-opacity="0"/></linearGradient></defs>';
    function path(x, amp, ph) {
      var d = 'M' + x.toFixed(1) + ' -2', n = 6;
      for (var k = 1; k <= n; k++) { var y = Hh * k / n, xx = x + Math.sin(k * 1.1 + ph) * amp * (k / n), cy = Hh * (k - .5) / n, cx = x + Math.sin((k - .5) * 1.1 + ph) * amp * ((k - .5) / n) * 1.4; d += ' Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + xx.toFixed(1) + ' ' + y.toFixed(1); }
      return d;
    }
    for (var x = -30; x <= W + 30; x += gap) html += '<path class="sw" pathLength="1" d="' + path(x, 16, x * .004) + '" fill="none" stroke="url(#bal)" stroke-width="38" stroke-dasharray="1 1" data-dl="' + (Math.random() * .35).toFixed(3) + '"/>';
    for (var f = -20; f <= W + 20; f += 9) html += '<path class="sf" pathLength="1" d="' + path(f + Math.random() * 6, 16, f * .004 + .2) + '" fill="none" stroke="url(#glint)" stroke-width="' + (1 + Math.random() * 1.6).toFixed(2) + '" stroke-dasharray="1 1" data-dl="' + (Math.random() * .35).toFixed(3) + '"/>';
    ssvg.innerHTML = html; wide = $$('.sw', ssvg); fine = $$('.sf', ssvg);
  }
  function paintStrands(p) {
    var all = wide.concat(fine);
    for (var i = 0; i < all.length; i++) { var s = all[i], t = still() ? 1 : smooth((p * 1.5 - +s.dataset.dl) / .7); s.style.strokeDashoffset = (1 - t).toFixed(4); }
  }

  // ---------------------------------------------------------------- the composer: his services as tress swatches, the bowl mixes, the note writes itself
  var shade = $('[data-shade]'), tresses = $$('[data-what] .tress'), whos = $$('[data-who] button'), msgEl = $('[data-msg]'), bowl = $('[data-bowl]'), shown = '', typing = 0, seen = false;
  watch(shade, function (v) { shade.classList.toggle('on', v); });
  tresses.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); mix(); write(); }); });
  whos.forEach(function (b) { b.addEventListener('click', function () { whos.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write(); }); });
  function mix() {
    var on = tresses.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }), r = 0, g = 0, bl = 0;
    if (!on.length) on = [tresses[1]];
    on.forEach(function (b) { var c = b.dataset.tone; r += parseInt(c.substr(1, 2), 16); g += parseInt(c.substr(3, 2), 16); bl += parseInt(c.substr(5, 2), 16); });
    bowl.style.setProperty('--mixc', 'rgb(' + Math.round(r / on.length) + ',' + Math.round(g / on.length) + ',' + Math.round(bl / on.length) + ')');
  }
  tresses.forEach(function (b) { $('i', b).style.background = b.dataset.tone; });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = tresses.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.dataset[l ? 'he' : 'en']; });
    var w = whos.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], who = w.dataset[l ? 'he' : 'en'];
    if (l) return 'היי גיא, ' + (picked.length ? 'אשמח לקבוע תור ל' + list(picked, true) : 'אשמח לקבוע תור') + (who ? ' ' + who : '') + '. מתי נוח לך?';
    return 'Hi Guy, I’d like to book ' + (picked.length ? 'an appointment for ' + list(picked, false) : 'an appointment') + (who ? ', ' + who : '') + '. When works for you?';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !seen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-card]'), function (v) { if (v && !seen) { seen = true; if (still()) return; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .5 });
  mix();

  // ---------------------------------------------------------------- the swatch fan
  var work = $('[data-work]'), fan = $('[data-fan]'), cardsF = $$('.ts', fan), lifted = -1, tilt = 0, tiltT = 0;
  cardsF.forEach(function (cd, i) {
    cd.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { lifted = i; tick(); } });
    cd.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { lifted = -1; tick(); } });
    cd.addEventListener('click', function () { lifted = lifted === i ? -1 : i; tick(); });
  });
  fan.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = fan.getBoundingClientRect(); tiltT = ((e.clientX - r.left) / r.width - .5) * 6; tick(); });
  function fanLayout(p) {
    var N = cardsF.length, spread = phone() ? 50 : 128, e = still() ? 1 : smooth((p - .02) / .36), drift = still() ? 0 : lerp(-1, 1, smooth((p - .5) / .5)) * 7;
    tilt = lerp(tilt, tiltT, .25);
    cardsF.forEach(function (cd, i) {
      var a = (i / (N - 1) - .5) * spread * (rtl() ? -1 : 1), ang = lerp(a * .14, a, e) + (e > .98 ? drift + tilt : 0), up = lifted === i ? -8 : 0, sc = lifted === i ? 1.06 : 1;
      cd.style.transform = 'translateX(-50%) rotate(' + ang.toFixed(2) + 'deg) translateY(' + up + '%) scale(' + sc + ')';
      cd.style.zIndex = lifted === i ? 20 : 10 - Math.round(Math.abs(i - (N - 1) / 2) * 2);
      cd.classList.toggle('lift', lifted === i);
    });
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
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .4 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- reviews fill in letter by letter as they reach the middle
  var quotes = $$('[data-fill]').map(function (q) {
    var chars = [];
    $$('p', q).forEach(function (p) {
      p.innerHTML = p.textContent.split(' ').map(function (w) { return '<span class="w">' + w.split('').map(function (c) { return '<span class="c">' + c + '</span>'; }).join('') + '</span>'; }).join(' ');
      $$('.w', p).forEach(function (w) { w.style.whiteSpace = 'nowrap'; });
    });
    return { q: q, n: -1 };
  });
  function fillQuotes(vh) {
    quotes.forEach(function (o) {
      var p = $('p[lang="' + root.lang + '"]', o.q), cs = p._cs || (p._cs = $$('.c', p)), r = o.q.getBoundingClientRect();
      var k = still() ? 1 : clamp((vh * .9 - r.top) / (r.height + vh * .3), 0, 1), n = Math.round(k * cs.length);
      if (n === p._n) return; p._n = n;
      for (var i = 0; i < cs.length; i++) cs[i].classList.toggle('on', i < n);
    });
  }

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var room = $('[data-room]'), roomFig = $('[data-roomfig]'), foot = $('[data-foot]'), spin = $('[data-spin]'), arcs = $('[data-arcs]'), discs = $$('.disc');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, y = scrollY;
    nav.classList.toggle('pill', y > 40);
    spin.style.transform = 'rotate(' + (y * .15).toFixed(1) + 'deg)';
    // hero: the monogram's arcs turn with the page, the discs drift apart a little
    var hp = clamp(y / vh, 0, 1.2);
    arcs.style.transform = calm ? '' : 'rotate(' + (hp * 40 * (rtl() ? -1 : 1)).toFixed(2) + 'deg)';
    discs[0].style.transform = calm ? '' : 'translateY(' + (-hp * 40).toFixed(1) + 'px)';
    discs[1].style.transform = calm ? '' : 'translateY(' + (hp * 30).toFixed(1) + 'px)';
    // strands
    var sr = strands.getBoundingClientRect();
    paintStrands(clamp((vh - sr.top) / (vh * .25 + sr.height), 0, 1));
    // fan
    fanLayout(calm ? 1 : prog(work));
    if (Math.abs(tilt - tiltT) > .05) tick();
    // room opens from a capsule to the full screen
    if (!calm) {
      var rp = prog(room), e = smooth(rp / .55), ph = phone();
      roomFig.style.setProperty('--it', lerp(ph ? 22 : 16, 0, e).toFixed(2) + '%');
      roomFig.style.setProperty('--ib', lerp(ph ? 22 : 16, 0, e).toFixed(2) + '%');
      roomFig.style.setProperty('--ix', lerp(ph ? 10 : 28, 0, e).toFixed(2) + '%');
      roomFig.style.setProperty('--ir', lerp(400, 0, e).toFixed(1) + 'px');
      roomFig.style.setProperty('--rs', lerp(1.25, 1, e).toFixed(4));
      room.style.setProperty('--rc', smooth((rp - .5) / .25).toFixed(3));
    }
    fillQuotes(vh);
    // the blind lifts off the footer
    var fr = foot.getBoundingClientRect();
    foot.style.setProperty('--bp', calm ? 1 : smooth((vh - fr.top) / (Math.min(fr.height, vh) * .85)).toFixed(3));
  }

  function layout() { heroChips.size(); lampChips.size(); buildStrands(); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (innerWidth !== lw || !phone()) { lw = innerWidth; layout(); } else tick(); }, 140); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false;
  function go() { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); heroChips.kick(); lampChips.kick(); shineLoop(); }); }
  if (!root.classList.contains('opening')) {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    setTimeout(go, 300);
  }
  addEventListener('load', tick);
})();
