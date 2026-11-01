(function () {
  var root = document.documentElement, WA = '972506853615';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 900; };
  var fmt = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };
  var LEAF = ['#e4007c', '#f08221', '#ec1c24', '#c51b8a', '#fbb714', '#e5e21a', '#8dc63f', '#00a651', '#00a99d', '#0072bc', '#0054a6', '#662d91', '#92278f'];
  var TITLE = { he: 'אמיל רפאל · רואה חשבון · דרך עכו 192, קריית ביאליק', en: 'Emil Refael · CPA · 192 Derech Akko, Kiryat Bialik' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור אמיל רפאל רואה חשבון · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Emil Refael, CPA · This is not the business’s official website' };
  var CAP = { he: ['אמיל רפאל', 'בכיתה, ליד הלוח', 'הלוגו של המשרד', 'המשרד, דרך עכו 192'], en: ['Emil Refael', 'Teaching, at the board', 'The office’s logo', 'The office, 192 Derech Akko'] };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var hero = $('[data-hero]'), stage = $('[data-stage]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'אמיל רפאל רואה חשבון', 'Emil Refael CPA');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-thumbs]', 'תמונות', 'Photos');
    aria('[data-t-revtabs]', 'ביקורות', 'Reviews');
    aria('[data-t-prev]', 'השלב הקודם', 'Previous step');
    aria('[data-t-next]', 'השלב הבא', 'Next step');
    aria('[data-t-call]', 'התקשרו לאמיל, 050-685-3615', 'Call Emil, 050-685-3615');
    aria('[data-t-wa]', 'וואטסאפ לאמיל', 'WhatsApp Emil');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: דרך עכו 192, קריית ביאליק' : 'Map: 192 Derech Akko, Kiryat Bialik'; });
    $('[data-name]').placeholder = l === 'he' ? 'למשל: דנה' : 'e.g. Dana';
    $$('[data-spot]').forEach(function (s) { if (s.classList.contains('on')) $('.tag', s).textContent = s.dataset[l]; });
    $$('[data-decode]').forEach(function (d) { d.textContent = d.dataset[l]; });
    capIdx = -1;
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('er-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('er-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    hero.classList.add('ready');
    layout(); leaves.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed, [0,24] = open all day
  var H = { 0: [0, 24], 1: [0, 24], 2: [0, 24], 3: [0, 24], 4: [0, 24], 5: [9, 17], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  var allDay = function (t) { return t && t[0] === 0 && t[1] === 24; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', month: 'numeric', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, m: (+o.month) - 1 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && n.h >= t[0] && n.h < t[1]) {
      open = true;
      if (allDay(t)) {
        var nx = H[(n.d + 1) % 7];
        txt = allDay(nx) ? (l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours') : (l ? 'פתוח עכשיו · עד חצות' : 'Open now · until midnight');
      } else txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]);
    } else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      var at = function (d) { return allDay(H[d]) ? '' : (l ? ' ב-' : ' at ') + hhmm(H[d][0]); };
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר' + at(nd) : 'Closed now · opens tomorrow' + at(nd))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + at(nd) : 'Closed now · opens ' + dayEn[nd] + at(nd));
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
      var val = !t ? (l ? 'סגור' : 'Closed') : allDay(t) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento,.v-grid').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); if (e.target.matches('.t-open')) decodeAll(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- the name: letters fill in out of a blur
  $$('[data-split] .half > span[lang]').forEach(function (sp) {
    var i = sp.closest('.half').classList.contains('b') ? 9 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span style="display:inline-block;white-space:nowrap">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // ---------------------------------------------------------------- glyph decode (labels settle out of scrambled characters)
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHJKLMNPRSTUVXYZ0123456789' };
  function decode(el, txt, ms) {
    clearInterval(el._dt);
    if (still()) { el.textContent = txt; return; }
    var g = GL[he() ? 'he' : 'en'], t0 = performance.now();
    el._dt = setInterval(function () {
      var k = clamp((performance.now() - t0) / (ms || 700), 0, 1), n = Math.floor(txt.length * k), out = txt.slice(0, n);
      for (var i = n; i < txt.length; i++) out += txt[i] === ' ' ? ' ' : g[Math.floor(Math.random() * g.length)];
      el.textContent = out; if (k >= 1) clearInterval(el._dt);
    }, 40);
  }
  function decodeAll(scope) { $$('[data-decode]', scope).forEach(function (d, i) { setTimeout(function () { decode(d, d.dataset[he() ? 'he' : 'en'], 600); }, 250 + i * 260); }); }

  // ---------------------------------------------------------------- his tree, sampled from the real logo file into coloured points
  var treePts = [], treeAR = 208 / 272, treeReady = [];
  (function () {
    var im = new Image(); im.src = 'img/tree.png';
    im.onload = function () {
      try {
        var w = im.naturalWidth, h = im.naturalHeight, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
        var c = cv.getContext('2d'); c.drawImage(im, 0, 0); var d = c.getImageData(0, 0, w, h).data, s = 4;
        for (var y = 0; y < h; y += s) for (var x = 0; x < w; x += s) {
          var k = (y * w + x) * 4; if (d[k + 3] < 160) continue;
          treePts.push({ x: x / w, y: y / h, c: 'rgb(' + d[k] + ',' + d[k + 1] + ',' + d[k + 2] + ')', r: Math.random(), q: Math.random() });
        }
        treeAR = h / w;
      } catch (e) { treePts = []; }
      treeReady.forEach(function (f) { f(); }); treeReady = null;
    };
  })();
  var onTree = function (f) { treeReady ? treeReady.push(f) : f(); };

  // ---------------------------------------------------------------- opening: the leaves gather into his tree, then fly into the nav label
  (function () {
    var ov = $('[data-opening]'), seen = false;
    try { seen = sessionStorage.getItem('er-open') === '1'; } catch (e) {}
    if (still() || seen) { requestAnimationFrame(function () { hero.classList.add('ready'); }); return; }
    try { sessionStorage.setItem('er-open', '1'); } catch (e) {}
    ov.classList.add('go');
    var cv = $('[data-open-cv]'), c = cv.getContext('2d'), t0 = 0, done = false, dpr = Math.min(2, devicePixelRatio || 1);
    function finish() {
      if (done) return; done = true; hero.classList.add('ready');
      ov.classList.add('out'); setTimeout(function () { ov.classList.remove('go', 'out'); ov.remove(); }, 600);
    }
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) { addEventListener(ev, finish, { once: true, passive: true }); });
    setTimeout(finish, 2600);   // never holds the page longer than this, whatever happens
    onTree(function () {
      if (done || !treePts.length) { finish(); return; }
      var W = innerWidth, Hh = innerHeight; cv.width = W * dpr; cv.height = Hh * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var tw = Math.min(240, W * .5), th = tw * treeAR, ox = W / 2 - tw / 2, oy = Hh / 2 - th / 2;
      var lab = $('.brand .label').getBoundingClientRect(), lx = lab.left + lab.width * .2, ly = lab.top + lab.height * .4;
      t0 = performance.now();
      (function fr(t) {
        if (done) return;
        var e = t - t0; c.clearRect(0, 0, W, Hh);
        treePts.forEach(function (p) {
          var a = smooth((e - p.r * 260) / 620), b = smooth((e - 1000 - p.q * 160) / 420);
          var sx = W / 2 + Math.cos(p.r * 6.283) * Math.max(W, Hh) * .7, sy = Hh / 2 + Math.sin(p.r * 6.283) * Math.max(W, Hh) * .7;
          var x = lerp(sx, ox + p.x * tw, a), y = lerp(sy, oy + p.y * th, a);
          x = lerp(x, lx, b); y = lerp(y, ly, b);
          c.globalAlpha = 1 - b * .7; c.fillStyle = p.c; c.fillRect(x, y, 3.2 - b * 2, 3.2 - b * 2);
        });
        if (e > 1150) hero.classList.add('ready');
        if (e > 1450) finish(); else requestAnimationFrame(fr);
      })(t0);
    });
  })();

  // ---------------------------------------------------------------- hero: leaves of his logo drift up through the ledger rulings, and part under the hand
  var leaves = (function () {
    var cv = $('[data-leaves]'), c = cv.getContext('2d'), P = [], w = 0, h = 0, raf = 0, vis = true, mx = -999, my = -999, wind = 0, lastY = scrollY;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = stage.clientWidth; h = stage.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = w < 700 ? 22 : 40;
      while (P.length < n) P.push({ x: Math.random() * w, y: Math.random() * h, s: 6 + Math.random() * 10, v: .15 + Math.random() * .35, a: Math.random() * 6.28, va: (Math.random() - .5) * .01, ph: Math.random() * 6.28, col: LEAF[P.length % LEAF.length], dx: 0, dy: 0 });
      P.length = n;
    }
    function frame(t) {
      raf = 0; if (still() || !vis) { c.clearRect(0, 0, w, h); return; }
      c.clearRect(0, 0, w, h);
      var dy = scrollY - lastY; lastY = scrollY; wind = lerp(wind, dy * .05, .1);
      P.forEach(function (p) {
        p.y -= p.v + Math.abs(wind) * .5; p.x += Math.sin(t / 1800 + p.ph) * .35 + wind * .3; p.a += p.va;
        var ddx = p.x - mx, ddy = p.y - my, d2 = ddx * ddx + ddy * ddy;
        if (d2 < 22000) { var f = (1 - d2 / 22000) * 2.6, d = Math.sqrt(d2) || 1; p.dx += ddx / d * f; p.dy += ddy / d * f; }
        p.dx *= .92; p.dy *= .92; p.x += p.dx; p.y += p.dy;
        if (p.y < -30) { p.y = h + 30; p.x = Math.random() * w; } if (p.x < -30) p.x = w + 30; if (p.x > w + 30) p.x = -30;
        c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.globalAlpha = .42; c.fillStyle = p.col;
        c.beginPath(); c.moveTo(-p.s, 0); c.quadraticCurveTo(0, -p.s * .62, p.s, 0); c.quadraticCurveTo(0, p.s * .62, -p.s, 0); c.fill(); c.restore();
      });
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    stage.addEventListener('pointermove', function (e) { var r = stage.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    stage.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(stage, function (v) { vis = v; kick(); });
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- the reel of his photos through the name
  var reel = $('[data-reel]'), reelCol = $('[data-reelcol]'), frames = $$('[data-fr]', reel), capT = $('[data-capt]'), capIdx = -1, thumbs = $$('[data-go]');
  function showFrame(i) {   // motion off: one frame at a time, chosen by the tabs
    frames.forEach(function (f, k) { f.classList.toggle('cur', k === i); });
    thumbs.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
  }
  showFrame(0);
  thumbs.forEach(function (b) { b.addEventListener('click', function () { showFrame(+b.dataset.go); }); });
  stage.addEventListener('pointermove', function (e) {
    if (still() || phone()) return;
    var r = reelCol.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    frames.forEach(function (f) { var im = $('img', f); im.style.setProperty('--px', (-x * 14).toFixed(1) + 'px'); im.style.setProperty('--py', (-y * 14).toFixed(1) + 'px'); });
  });

  // ---------------------------------------------------------------- the office: placed labels that type themselves
  var open = $('[data-open]'), ophoto = $('[data-ophoto]'), oimg = $('img', ophoto), ocopy = $('[data-ocopy]'), spots = $$('[data-spot]');
  function placeSpots() {
    var W = ophoto.clientWidth, Hh = ophoto.clientHeight, iw = 1600, ih = 1066, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s, ox = (W - dw) * .46, oy = (Hh - dh) * .45;
    spots.forEach(function (sp) {
      var x = ox + dw * +sp.dataset.x, y = oy + dh * +sp.dataset.y;
      sp.style.left = x + 'px'; sp.style.top = y + 'px';
      sp.classList.toggle('flip', x > W * .6);
      sp.hidden = x < 12 || x > W - 12 || y < 12 || y > Hh * .62;
    });
  }
  function typeTag(sp, on) {
    var tag = $('.tag', sp), txt = sp.dataset[he() ? 'he' : 'en'];
    if (on === sp.classList.contains('on')) return;
    sp.classList.toggle('on', on);
    if (!on) { clearInterval(tag._dt); tag.textContent = ''; return; }
    decode(tag, txt, 500);
  }

  // ---------------------------------------------------------------- the books: the ledger balances itself
  var books = $('[data-bal]'), bstage = $('[data-bstage]'), steps = $$('[data-step]'), rowsL = $$('[data-row]'), chits = $$('.chit'), sheet = $('[data-sheet]');
  var tots = $$('[data-tot]'), dbl = $('[data-dbl]'), stamp = $('[data-stamp]'), bold = $('[data-bold]'), bcount = $('[data-bcount]'), sline = $('[data-stepline]'), chitV = [], stillStep = 0, lastStep = -1;
  rowsL.forEach(function (r, i) { $('.tk', r).style.setProperty('--c', LEAF[(i * 2 + 6) % LEAF.length]); });
  function chitLayout() {
    var sx = sheet.offsetLeft + sheet.offsetWidth / 2, sy = sheet.offsetTop + sheet.offsetHeight / 2, R = [-9, 7, -4, 11, -6];
    chitV = chits.map(function (ch, i) { ch.style.transform = ''; return { dx: sx - (ch.offsetLeft + ch.offsetWidth / 2), dy: sy - (ch.offsetTop + ch.offsetHeight / 2), r: R[i] }; });
  }
  function setSheet(s) {
    chits.forEach(function (ch, i) {
      var v = chitV[i]; if (!v) return;
      var t = smooth((s - i * .1) / .6), o = 1 - smooth((t - .78) / .22);
      ch.style.transform = 'translate(' + (v.dx * t).toFixed(1) + 'px,' + (v.dy * t).toFixed(1) + 'px) rotate(' + lerp(v.r, 0, t).toFixed(2) + 'deg) scale(' + lerp(1, .45, t).toFixed(3) + ')';
      ch.style.opacity = o.toFixed(3);
    });
    rowsL.forEach(function (r, k) {
      var cell = $('[data-amt]', r), a = smooth((s - 1 - k * .13) / .22);
      cell.textContent = a <= 0 ? '' : fmt(+cell.dataset.amt * a);
      var tk = s - 2 - k * .14;
      $('.tk', r).style.setProperty('--t', tk > 0 ? 1 : 0);
      r.classList.toggle('hl', tk > 0 && tk < .3);
    });
    var tt = smooth((s - 3) / .4); tots.forEach(function (x) { x.textContent = fmt(28200 * tt); });
    dbl.style.setProperty('--d', smooth((s - 3.4) / .25).toFixed(3));
    var v = smooth((s - 3.6) / .25); stamp.style.setProperty('--ss', lerp(1.7, 1, v).toFixed(3)); stamp.style.setProperty('--so', v.toFixed(3));
    var act = clamp(Math.floor(s), 0, 3);
    if (act !== lastStep) {
      lastStep = act;
      steps.forEach(function (li, i) { li.classList.toggle('on', i === act); li.classList.toggle('done', i < act); });
      bcount.textContent = $('.st-t > [lang="' + (he() ? 'he' : 'en') + '"]', steps[act]).textContent;
      sline.textContent = $('.st-l > [lang="' + (he() ? 'he' : 'en') + '"]', steps[act]).textContent;
    }
  }
  var STILL_S = [.62, 2, 3, 4];
  function stillGo(k) { stillStep = clamp(k, 0, 3); lastStep = -1; setSheet(STILL_S[stillStep]); }
  $('[data-bprev]').addEventListener('click', function () { stillGo(stillStep - 1); });
  $('[data-bnext]').addEventListener('click', function () { stillGo(stillStep + 1); });
  $$('[data-stepbtn]').forEach(function (b) { b.addEventListener('click', function () {
    var k = +b.dataset.stepbtn;
    if (still()) { stillGo(k); return; }
    var top = books.getBoundingClientRect().top + scrollY, span = books.offsetHeight - innerHeight;
    scrollTo({ top: top + span * ((k + .55) / 4.2), behavior: 'smooth' });
  }); });

  // ---------------------------------------------------------------- the desk: months of the year, the current one lit
  var months = $('[data-months]'), MHE = ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני', 'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'], MEN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], monOn = false, sweepI = 0;
  function buildMonths() {
    var m = now().m, names = he() ? MHE : MEN;
    months.innerHTML = names.map(function (n, i) { return '<span class="' + (i < m ? 'past' : i === m ? 'now' : '') + '">' + n + '</span>'; }).join('');
  }
  watch(months, function (v) { monOn = v; });
  setInterval(function () {
    if (!monOn || still()) return;
    var sp = months.children; for (var i = 0; i < sp.length; i++) sp[i].classList.toggle('sweep', i === sweepI);
    sweepI = (sweepI + 1) % 14;
  }, 380);
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- the classroom: his photo leans toward the hand; the T-account is drawn as you scroll
  var cphoto = $('[data-cphoto]'), board = $('[data-board]'), marks = ['.t1', '.t2', '.h1', '.h2', '.r1', '.r2', '.r3', '.r4', '.r5', '.u1', '.u2'].map(function (s) { return $(s, board); });
  cphoto.addEventListener('pointermove', function (e) {
    if (still()) return; var r = cphoto.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    cphoto.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg'); cphoto.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg');
    $('img', cphoto).style.setProperty('--px', (-x * 16).toFixed(1) + 'px'); $('img', cphoto).style.setProperty('--py', (-y * 16).toFixed(1) + 'px');
  });
  cphoto.addEventListener('pointerleave', function () { ['--ry', '--rx'].forEach(function (k) { cphoto.style.setProperty(k, '0deg'); }); });

  // ---------------------------------------------------------------- reviews: odometer and the card file
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
  var tabs = $$('[role="tab"]'), cards = $$('[role="tabpanel"]');
  function pick(i, focus) {
    tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
    cards.forEach(function (c, k) { c.classList.toggle('on', k === i); });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pick(i); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowLeft' ? (rtl() ? 1 : -1) : e.key === 'ArrowRight' ? (rtl() ? -1 : 1) : 0;
      if (d) { e.preventDefault(); pick((i + d + tabs.length) % tabs.length, true); }
    });
  });

  // ---------------------------------------------------------------- write: the note to Emil types itself on the slip
  var radios = $$('input[name="topic"]'), nameIn = $('[data-name]'), msgEl = $('[data-msg]'), sendA = $('[data-send]'), shown = '', typing = 0, slipSeen = false;
  var TOP = { he: ['פתיחת עוסק', 'מע״מ והדיווחים השוטפים', 'תכנון מס', 'הנהלת החשבונות של העסק', 'הרצאה או קבוצת לימוד'], en: ['opening a business', 'VAT and the ongoing reports', 'tax planning', 'my business’s bookkeeping', 'a lecture or a study group'] };
  function compose() {
    var l = he(), k = +(radios.filter(function (r) { return r.checked; })[0] || radios[0]).value, n = nameIn.value.trim().replace(/\s+/g, ' ');
    if (l) return 'שלום אמיל' + (n ? ', כאן ' + n : '') + '. ' + (k === 5 ? 'יש לי שאלה, אשמח שנדבר.' : 'אשמח לדבר איתך על ' + TOP.he[k] + '.');
    return 'Hi Emil' + (n ? ', this is ' + n : '') + '. ' + (k === 5 ? 'I have a question, could we talk?' : 'I’d like to talk to you about ' + TOP.en[k] + '.');
  }
  function write(instant) {
    var target = compose();
    sendA.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !slipSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  radios.forEach(function (r) { r.addEventListener('change', function () { write(); }); });
  nameIn.addEventListener('input', function () { write(true); });
  watch($('[data-slip]'), function (v) { if (v && !slipSeen) { slipSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .5 });

  // ---------------------------------------------------------------- footer: curtain, wordmark fitted to its width, leaves gathering into the tree
  var foot = $('[data-foot]'), gap = $('.curtain-gap'), wm = $('[data-wm]'), fcv = $('[data-fcv]'), fc = fcv.getContext('2d'), fW = 0, fH = 0, lastFp = -1;
  function fitWm() { wm.style.fontSize = '120px'; var cw = wm.parentNode.clientWidth, sw = wm.scrollWidth; wm.style.fontSize = Math.min(240, Math.floor(120 * cw / sw * .98)) + 'px'; }
  function footSize() {
    var dpr = Math.min(2, devicePixelRatio || 1); fW = foot.clientWidth; fH = foot.clientHeight; fcv.width = fW * dpr; fcv.height = fH * dpr; fc.setTransform(dpr, 0, 0, dpr, 0, 0);
    gap.style.height = Math.min(fH, innerHeight) + 'px'; lastFp = -1;
  }
  function drawTree(fp) {
    if (Math.abs(fp - lastFp) < .002) return; lastFp = fp;
    fc.clearRect(0, 0, fW, fH); if (!treePts.length) return;
    var top = parseFloat(getComputedStyle(foot).paddingTop) || 200, th = top * .72, tw = th / treeAR, ox = rtl() ? fW - tw - Math.max(16, fW * .05) : Math.max(16, fW * .05), oy = top * .14;
    treePts.forEach(function (p) {
      var a = smooth((fp - p.r * .35) / .65);
      var sx = ox + p.x * tw + (p.q - .5) * fW * .9, sy = oy + p.y * th - 120 - p.r * fH * .4;
      fc.globalAlpha = .25 + a * .55; fc.fillStyle = p.c;
      fc.fillRect(lerp(sx, ox + p.x * tw, a), lerp(sy, oy + p.y * th, a), 3, 3);
    });
  }
  onTree(function () { lastFp = -1; update(); });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) leaves.kick();

    // hero: the reel, then the office opens
    if (!calm) {
      var p = prog(hero), raw = clamp(p / .4, 0, 1) * 3, i = Math.min(3, Math.floor(raw)), f = raw - i, idx = i >= 3 ? 3 : i + smooth((f - .3) / .7);
      var step = frames[0].offsetHeight + 24;
      reel.style.transform = 'translate3d(0,' + (-idx * step).toFixed(1) + 'px,0)';
      frames.forEach(function (fr, k) { var d = Math.min(1, Math.abs(k - idx)); fr.style.opacity = (1 - d * (phone() ? 1 : .6)).toFixed(3); fr.style.transform = 'scale(' + (1 - d * .07).toFixed(3) + ')'; });
      var ci = Math.round(idx);
      if (ci !== capIdx) { capIdx = ci; decode(capT, CAP[he() ? 'he' : 'en'][ci], 420); }
      var q = smooth((p - .43) / .16);
      open.classList.toggle('vis', q > 0);
      if (q > 0) {
        var sr = stage.getBoundingClientRect(), rc = frames[3].getBoundingClientRect();
        ophoto.style.left = lerp(rc.left - sr.left, 0, q).toFixed(1) + 'px';
        ophoto.style.top = lerp(rc.top - sr.top, 0, q).toFixed(1) + 'px';
        ophoto.style.width = lerp(rc.width, sr.width, q).toFixed(1) + 'px';
        ophoto.style.height = lerp(rc.height, sr.height, q).toFixed(1) + 'px';
        ophoto.style.borderRadius = lerp(6, 0, q).toFixed(1) + 'px';
        ophoto.style.setProperty('--shade', q.toFixed(3));
        oimg.style.setProperty('--oz', lerp(1.04, 1, q).toFixed(4));
        if (q >= 1) placeSpots();
      }
      $$('.half').forEach(function (h, k) {
        var dir = (k === 0 ? -1 : 1) * (rtl() ? -1 : 1);
        h.style.transform = q ? 'translateX(' + (dir * q * 30).toFixed(2) + 'vw)' : ''; h.style.opacity = q ? (1 - q).toFixed(3) : '';
      });
      [$('[data-sub]'), $('.rate'), $('.cap')].forEach(function (el) { el.style.visibility = q >= 1 ? 'hidden' : ''; el.style.opacity = q ? (1 - q).toFixed(3) : ''; });
      ocopy.style.setProperty('--co', smooth((p - .58) / .08).toFixed(3));
      spots.forEach(function (sp, k) { typeTag(sp, q >= 1 && p > .6 + k * .025); });
    }

    // books
    if (!calm) {
      var pb = prog(books), s = clamp(pb * 4.25, 0, 4);
      setSheet(s);
      bold.style.setProperty('--oy', (pb * -80).toFixed(1) + 'px');
    }

    // classroom board
    var br = board.getBoundingClientRect(), pc = calm ? 1 : clamp((vh * .95 - br.top) / (vh * .6), 0, 1);
    marks.forEach(function (m, k) { m.style.setProperty('--k', calm ? 1 : smooth(pc * 12 - k).toFixed(3)); });

    // footer
    var gr = gap.getBoundingClientRect(), fp = clamp((vh - gr.top) / Math.max(1, gr.height), 0, 1);
    foot.classList.toggle('vis', gr.top < vh + 2);
    foot.style.setProperty('--rise', (fp * 90).toFixed(1) + 'px');
    if (gr.top < vh + 2) drawTree(calm ? 1 : fp);
  }

  function layout() {
    leaves.size();
    if (still()) {
      // finished static states
      reel.style.transform = ''; frames.forEach(function (fr) { fr.style.opacity = ''; fr.style.transform = ''; });
      ['left', 'top', 'width', 'height', 'borderRadius'].forEach(function (k) { ophoto.style[k] = ''; });
      ophoto.style.setProperty('--shade', 1); open.classList.add('vis'); ocopy.style.setProperty('--co', 1);
      $$('.half').forEach(function (h) { h.style.transform = ''; h.style.opacity = ''; });
      [$('[data-sub]'), $('.rate'), $('.cap')].forEach(function (el) { el.style.visibility = ''; el.style.opacity = ''; });
      chits.forEach(function (ch) { ch.style.transform = ''; ch.style.opacity = ''; });
      placeSpots(); spots.forEach(function (sp) { sp.classList.remove('on'); typeTag(sp, true); });
      chitLayout(); stillGo(stillStep);
    } else {
      chitLayout(); placeSpots(); lastStep = -1;
    }
    buildMonths(); fitWm(); footSize(); update();
  }
  addEventListener('scroll', tick, { passive: true });
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 120); });
  texts(root.lang === 'en' ? 'en' : 'he'); hours(); write(true);
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitWm(); footSize(); update(); });
  addEventListener('load', layout);
})();
