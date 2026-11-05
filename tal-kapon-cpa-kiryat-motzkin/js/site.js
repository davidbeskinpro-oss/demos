(function () {
  var root = document.documentElement, WA = '972524492262';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 900; };
  var TITLE = { he: 'טל קפון · רואה חשבון · ש״י עגנון 16, קריית מוצקין', en: 'Tal Kapon · CPA · 16 Shai Agnon St, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור טל קפון רואה חשבון · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Tal Kapon CPA · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'טל קפון רואה חשבון', 'Tal Kapon CPA');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-tabs]', 'שלבים', 'Steps');
    aria('[data-t-prev]', 'הקודם', 'Previous');
    aria('[data-t-next]', 'הבא', 'Next');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-wa]', 'וואטסאפ לטל', 'WhatsApp Tal');
    aria('[data-t-call]', 'התקשרו לטל, 052-449-2262', 'Call Tal, 052-449-2262');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: ש״י עגנון 16, קריית מוצקין' : 'Map: 16 Shai Agnon St, Kiryat Motzkin'; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('tk-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('tk-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $('.foot').classList.add('in');
    layout(); figs.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [8, 17.5], 1: [8, 17.5], 2: [8, 17.5], 3: [8, 17.5], 4: [8, 17.5], 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { if (x >= 24) return '24:00'; var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] >= 24) { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
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
      var val = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] >= 24) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
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

  // letter by letter (hero headline, footer name)
  $$('[data-split] .ln > span[lang], [data-letters] > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln') && sp.closest('.ln').previousElementSibling ? 14 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), stage = $('[data-stage]'), frame = $('[data-frame]');

  // ---------------------------------------------------------------- the real K logo, rebuilt from gold figures.
  // They gather into the logo, keep flickering like a counter, part around the hand, and fall into ledger columns on scroll.
  var figs = (function () {
    var cv = $('[data-figs]'), c = cv.getContext('2d'), img = $('[data-ksrc]');
    var P = [], w, h, raf = 0, vis = true, t0 = 0, mx = -999, my = -999, ok = false, pulses = [], box = { x: 0, y: 0, s: 1 };
    var DIG = '0123456789';
    function sample() {
      try {
        var sc = document.createElement('canvas'), iw = 200, ih = 190; sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data, pts = [], st = phone() ? 6 : 4;
        for (var y = 0; y < ih; y += st) for (var x = 0; x < iw; x += st) { var k = (y * iw + x) * 4; if (d[k + 3] > 150) pts.push([x / iw, y / ih, d[k], d[k + 1], d[k + 2]]); }
        P = pts.map(function (q) { return { hx: q[0], hy: q[1], col: 'rgb(' + q[2] + ',' + q[3] + ',' + q[4] + ')', ch: DIG[Math.floor(Math.random() * 10)], x: Math.random(), y: Math.random(), vx: 0, vy: 0, ph: Math.random() * 6.28, dl: Math.random() * .8, col5: Math.floor(Math.random() * 6), fv: .6 + Math.random() * .8 }; });
        ok = P.length > 0;
      } catch (e) { ok = false; }
    }
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      // the logo sits over the upper corner of the photo frame, on the copy side
      var hr = hero.getBoundingClientRect(), sr = stage.getBoundingClientRect(), s;
      if (phone()) { s = Math.min(sr.width * .5, 210); box = { x: (rtl() ? sr.left - hr.left + sr.width * .04 : sr.right - hr.left - s - sr.width * .04), y: sr.top - hr.top + 4, s: s }; }
      else { s = Math.min(sr.width * .5, 360); box = { x: rtl() ? sr.right - hr.left - s * .72 : sr.left - hr.left - s * .28, y: sr.top - hr.top + sr.height * .1, s: s }; }
      P.forEach(function (p) { p.sx = undefined; });
    }
    function frameFn(now) {
      raf = 0; if (!ok) return;
      var calm = still(), T = (now - t0) / 1000, hr = hero.getBoundingClientRect();
      var fall = calm ? 0 : clamp(-hr.top / (hr.height * .8), 0, 1.3);
      var fs = phone() ? 8 : 10, sc = box.s;
      c.clearRect(0, 0, w, h);
      c.font = '700 ' + fs + 'px "Noto Sans Hebrew", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      if (!calm && Math.random() < .5) { var r = P[Math.floor(Math.random() * P.length)]; r.ch = DIG[Math.floor(Math.random() * 10)]; }
      for (var i = 0; i < P.length; i++) {
        var p = P[i], a = calm ? 1 : smooth((T - p.dl) / 1.2);
        var tx = box.x + p.hx * sc, ty = box.y + p.hy * sc * .95;
        if (fall > 0) {   // the figures drop into six ledger columns across the page and run out at the bottom
          var colx = w * (.12 + p.col5 * .152), f = smooth(fall * p.fv * 1.4);
          tx = lerp(tx, colx, f); ty = ty + fall * fall * h * 1.2 * p.fv;
        }
        if (calm) { p.x = tx; p.y = ty; }
        else if (a < 1) { if (p.sx === undefined) { p.sx = p.x * w; p.sy = p.y * h; } p.x = lerp(p.sx, tx, a); p.y = lerp(p.sy, ty, a); }
        else {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 8100) { var ff = (8100 - d2) / 8100 * 2.4, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * ff; p.vy += dy / dd * ff; }
          p.vx += (tx - p.x) * .07; p.vy += (ty - p.y) * .07; p.vx *= .8; p.vy *= .8; p.x += p.vx; p.y += p.vy;
        }
        var glow = 0;
        for (var k = 0; k < pulses.length; k++) { var pu = pulses[k], rr = (now - pu.t) * .3, ddx = p.x - pu.x, ddy = p.y - pu.y; if (Math.abs(Math.sqrt(ddx * ddx + ddy * ddy) - rr) < 12) glow = Math.max(glow, 1 - (now - pu.t) / 1300); }
        c.globalAlpha = (glow ? 1 : .55 + .35 * Math.sin(T * 1.6 + p.ph) * .5 + .2) * (1 - clamp(fall - .3, 0, 1));
        c.fillStyle = glow ? '#fff4d6' : p.col;
        c.fillText(p.ch, p.x, p.y);
      }
      c.globalAlpha = 1;
      pulses = pulses.filter(function (q) { return now - q.t < 1300; });
      if (!calm && vis) raf = requestAnimationFrame(frameFn);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frameFn); }
    function start() { sample(); size(); t0 = performance.now(); kick(); if (document.fonts) document.fonts.ready.then(kick); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) { var r = hero.getBoundingClientRect(); pulses.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }); kick(); });
    watch(hero, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    // on phones the logo sends a pulse by itself every few seconds, so the figures visibly move without a cursor
    setInterval(function () { if (!vis || still() || !ok || !phone()) return; pulses.push({ x: box.x + box.s * (.2 + Math.random() * .6), y: box.y + box.s * (.2 + Math.random() * .6), t: performance.now() }); kick(); }, 2600);
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // the photo in the frame follows the hand; on touch it drifts with the scroll
  frame.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var r = frame.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    frame.style.setProperty('--px', ((.5 - x) * 4).toFixed(2) + '%'); frame.style.setProperty('--py', ((.5 - y) * 4).toFixed(2) + '%');
    frame.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); frame.style.setProperty('--my', (y * 100).toFixed(1) + '%');
  });
  frame.addEventListener('pointerleave', function () { frame.style.setProperty('--px', '0'); frame.style.setProperty('--py', '0'); });

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : 0; s.style.transitionDelay = go ? (i * 120) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('.t-figs [data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- books: four stages, from the scroll (motion on) or the tabs/arrows (off)
  var books = $('[data-books]'), bpin = $('.b-pin', books), sheet = $('[data-sheet]'), tabs = $$('[data-tab]'), blines = $$('[data-blines] li'), bcount = $('[data-bcount]'), bbg = $('[data-bbg]');
  var total = $('.total .odo'), stageN = -1;
  function setStage(n) {
    if (n === stageN) return; stageN = n;
    var inner = $('.b-in', books);
    inner.classList.remove('s0', 's1', 's2', 's3'); inner.classList.add('s' + n);
    tabs.forEach(function (t, i) { t.setAttribute('aria-selected', i === n ? 'true' : 'false'); });
    blines.forEach(function (l, i) { l.classList.toggle('on', i === n); });
    bcount.textContent = (n + 1) + ' / 4';
    roll(total, n >= 2);
  }
  // where each receipt flies: the middle of its own row
  function slipTargets() {
    var sr = sheet.getBoundingClientRect(), rows = $$('[data-rows] li');
    $$('.slip', sheet).forEach(function (s, i) {
      var r = rows[i].getBoundingClientRect();
      s.style.setProperty('--tx', (r.left + r.width / 2 - (sr.left + sr.width / 2)).toFixed(0) + 'px');
      s.style.setProperty('--ty', (r.top + r.height / 2 - (sr.top + sr.height * .48)).toFixed(0) + 'px');
    });
  }
  function gotoStage(n) {
    n = clamp(n, 0, 3);
    if (still()) { setStage(n); return; }
    var top = books.getBoundingClientRect().top + scrollY, span = books.offsetHeight - innerHeight;
    scrollTo({ top: top + span * (n + .5) / 4, behavior: 'smooth' });
  }
  tabs.forEach(function (t, i) { t.addEventListener('click', function () { gotoStage(i); }); });
  $$('[data-bstep]').forEach(function (b) { b.addEventListener('click', function () { gotoStage(stageN + +b.dataset.bstep); }); });
  setStage(0);

  // ---------------------------------------------------------------- team: files slide out of a slanted stack, the team photo comes forward
  var team = $('[data-team]'), files = $$('.file', $('[data-files]'));
  function fileDeal(p) {
    var box = $('[data-files]'), W = box.clientWidth, Hh = box.clientHeight, e = smooth((p - .02) / .5), g = smooth((p - .38) / .35), side = rtl() ? 1 : -1;
    files.forEach(function (f, i) {
      var lead = i === files.length - 1, x, y, r, s, k = i - 1;
      // stacked: a tight diagonal pile at the K's angle; fanned: spread up the diagonal
      var sx = side * -i * 10, sy = -i * 14;
      if (lead) { x = lerp(sx, side * W * .02, g); y = lerp(sy, Hh * .12, g); r = lerp(-6, -1.5, e); s = lerp(.86, 1, g); }
      else { x = lerp(sx, side * -(k - .1) * W * .2, e); y = lerp(sy, -Hh * .2 + Math.abs(k) * Hh * .03, e); r = lerp(-6 + i * 2, (k) * -7, e); s = lerp(.86, .7, g); }
      f.style.transform = 'translate(-50%,-50%) translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + r.toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')';
      f.style.zIndex = lead ? 10 : i + 1;
    });
  }

  // ---------------------------------------------------------------- bento: spotlight under the hand, tiles come alive in view
  var desk = $('#desk');
  watch(desk, function (v) { if (v) $$('.tile', desk).forEach(function (t) { t.classList.add('on'); }); }, { rootMargin: '0px 0px -15% 0px' });
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); t.classList.add('lit'); });
    t.addEventListener('pointerleave', function () { t.classList.remove('lit'); });
  });
  // the bars re-grow every few seconds like another month closing, while in view
  var bars = $$('.v-bars i'), deskOn = false;
  watch(desk, function (v) { deskOn = v; });
  setInterval(function () { if (!deskOn || still()) return; bars.forEach(function (b) { b.style.setProperty('--h', (.3 + Math.random() * .65).toFixed(2)); }); }, 2800);

  // ---------------------------------------------------------------- write: journal slip -> WhatsApp, typing itself
  var groups = $$('[data-group]'), steps = $$('[data-step]'), msgEl = $('[data-msg]'), chat = $('[data-chat]'), shown = '', typing = 0, chatSeen = false;
  function lightStep(n) { steps.forEach(function (s, i) { s.classList.toggle('on', i <= n); }); }
  groups.forEach(function (g, gi) {
    var opts = $$('.ln-opt', g);
    g.setAttribute('role', 'radiogroup');
    opts.forEach(function (o) { o.addEventListener('click', function () { opts.forEach(function (x) { x.setAttribute('aria-checked', x === o ? 'true' : 'false'); }); lightStep(gi); write(); }); });
  });
  $('[data-send]').addEventListener('pointerenter', function () { lightStep(2); });
  $('[data-send]').addEventListener('focus', function () { lightStep(2); });
  function pick(name) { var o = $('[data-group="' + name + '"] [aria-checked="true"]'); return o.dataset[he() ? 'he' : 'en']; }
  function compose() {
    return he() ? 'שלום טל, הגעתי מהאתר. מדובר ב' + pick('who') + ', ואשמח לדבר על ' + pick('what') + '.'
                : 'Hi Tal, I found you through the website. It’s about ' + pick('who') + ', and I’d like to talk about ' + pick('what') + '.';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
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
  watch(chat, function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; lightStep(0); write(); } }, { threshold: .4 });

  // reviews: two copies so the drift loops seamlessly
  var track = $('[data-track]');
  $$('.rv', track).forEach(function (r) { var k = r.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.classList.add('dup'); track.appendChild(k); });
  function dupVis() { $$('.rv.dup', track).forEach(function (r) { r.hidden = still(); }); }

  // ---------------------------------------------------------------- visit: door photo, full screen -> its frame
  var visit = $('[data-visit]'), vpin = $('[data-vpin]'), vframe = $('[data-vframe]'), vphoto = $('[data-vphoto]'), vcopy = $('.v-copy', visit);
  var write$ = $('[data-write]'), foot = $('[data-foot]'), dock = $('[data-dock]');
  watch(foot, function (v) { if (v) foot.classList.add('in'); }, { threshold: .25 });

  // ---------------------------------------------------------------- one scroll loop
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) figs.kick();
    // books
    if (!calm) { var bp = prog(books); bbg.style.setProperty('--bp', bp.toFixed(3)); setStage(Math.min(3, Math.floor(bp * 4 * .999))); }
    else bbg.style.setProperty('--bp', '0');
    // team
    var tr = team.getBoundingClientRect(), tp = calm ? 1 : clamp((vh - tr.top) / (vh * 1.1), 0, 1);
    fileDeal(tp);
    // write: the gold edge sweeps it in
    var wr = write$.getBoundingClientRect(), wp = calm ? 1 : smooth((vh - wr.top) / (vh * .7));
    write$.style.setProperty('--wp', wp.toFixed(3));
    // visit
    if (!calm) {
      var vp = clamp(-vpin.getBoundingClientRect().top / Math.max(1, vpin.offsetHeight - vh), 0, 1), e = smooth(vp / .7);
      var fr = vframe.getBoundingClientRect(), S = Math.max(innerWidth / fr.width, vh / fr.height) * 1.02;
      var stg = vframe.parentNode.getBoundingClientRect(), cx = innerWidth / 2 - (fr.left + fr.width / 2), cy = stg.top + vh / 2 - (fr.top + fr.height / 2);
      vphoto.style.transform = 'translate3d(' + lerp(cx, 0, e).toFixed(1) + 'px,' + lerp(cy, 0, e).toFixed(1) + 'px,0) scale(' + lerp(S, 1, e).toFixed(4) + ')';
      vphoto.style.borderRadius = lerp(0, 22, e).toFixed(1) + 'px';
      vcopy.style.setProperty('--vc', smooth((vp - .45) / .35).toFixed(3));
    } else { vphoto.style.transform = ''; vphoto.style.borderRadius = ''; vcopy.style.setProperty('--vc', '1'); }
    // dock hides over the hero's own buttons and over the footer
    var hb = hero.getBoundingClientRect().bottom, fb = $('.page').getBoundingClientRect().bottom;
    dock.classList.toggle('hide', hb > vh * .55 || fb < vh - 40);
  }
  function layout() { figs.size(); slipTargets(); dupVis(); update(); }
  addEventListener('scroll', tick, { passive: true });
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 120); });

  texts(root.lang); hours(); write(true);
  if (still()) $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
  layout();
  addEventListener('load', layout);
})();
