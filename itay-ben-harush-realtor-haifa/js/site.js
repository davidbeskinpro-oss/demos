(function () {
  var root = document.documentElement, WA = '972509125421';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'איתי בן הרוש · מתווך נדל״ן בחיפה · שדרות מוריה 131', en: 'Itay Ben Harush · Real-estate agent in Haifa · 131 Moriah Blvd' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור איתי בן הרוש מתווך – נדלניסט חיפה · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Itay Ben Harush, real-estate agent in Haifa · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  var AREAS = [['עוד לא החלטתי', 'Not decided yet'], ['הכרמל', 'The Carmel'], ['אחוזה', 'Ahuza'], ['דניה', 'Denya'], ['נווה שאנן', 'Neve Sha’anan'], ['רמת אלמוגי', 'Ramat Almogi'], ['הדר', 'Hadar'], ['בת גלים', 'Bat Galim'], ['קריית חיים', 'Kiryat Haim']];
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'איתי בן הרוש, מתווך נדל״ן בחיפה', 'Itay Ben Harush, real-estate agent in Haifa');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-steps]', 'איך זה עובד', 'How it works');
    aria('[data-t-want]', 'אני רוצה', 'I want to');
    aria('[data-t-rooms]', 'כמה חדרים', 'How many rooms');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-call]', 'התקשרו לאיתי, 050-912-5421', 'Call Itay, 050-912-5421');
    aria('[data-t-wa]', 'וואטסאפ לאיתי', 'WhatsApp Itay');
    $$('[data-area] option').forEach(function (o, i) { o.textContent = AREAS[i][l === 'he' ? 0 : 1]; });
    $$('.ht').forEach(function (t) { $('b', t).textContent = t.dataset[l]; });
    $$('.dec').forEach(function (d) { d.textContent = d.dataset[l]; });
    splitAll();
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ib-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- letters: split words into letters for the reveals
  function split(sp, cls) {
    if (sp.dataset.split === sp.textContent) return;
    var i = 0, txt = sp.textContent;
    sp.innerHTML = txt.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
    sp.dataset.split = sp.textContent;
  }
  function splitAll() {
    $$('.h-name .ln > span[lang], .verb > span[lang], .f-mark > span[lang], [data-quote]').forEach(function (s) { split(s); });
  }

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('ib-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal], .hrow, .rq').forEach(function (el) { el.classList.add('in'); });
    $$('.vp').forEach(function (v) { v.classList.add('lit'); });
    portrait.classList.add('draw', 'dev');
    layout(); lights.kick(); contours.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 21], 1: [9, 21], 2: [9, 21], 3: [9, 21], 4: [9, 21], 5: [9, 16], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); if (m === 60) { h++; m = 0; } return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
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
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  $$('[data-reveal], .hrow, .rq').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  var hero = $('[data-hero]'), stage = $('[data-hstage]'), nav = $('[data-nav]'), foot = $('[data-foot]');
  var heroImg = $('[data-heroimg]'), dusk = $('[data-dusk]'), sunset = $('[data-sunset]'), lens = $('[data-lens]'), clockEl = $('[data-clock]');

  // where an object-fit:cover image lands inside its box (for lights and labels)
  function coverBox(W, Hh, iw, ih, px, py) { var s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s; return { s: s, ox: (W - dw) * (px == null ? .5 : px), oy: (Hh - dh) * (py == null ? .5 : py), dw: dw, dh: dh }; }

  // ---------------------------------------------------------------- the city's windows, sampled from the real photo
  var LIGHTS = [];
  function sampleLights(img) {
    try {
      var iw = 420, ih = Math.round(iw * img.naturalHeight / img.naturalWidth), c = document.createElement('canvas'); c.width = iw; c.height = ih;
      var x = c.getContext('2d'); x.drawImage(img, 0, 0, iw, ih);
      var d = x.getImageData(0, 0, iw, ih).data, pts = [];
      for (var y = Math.floor(ih * .15); y < ih * .64; y++) for (var xx = 0; xx < iw; xx++) {
        var k = (y * iw + xx) * 4, r = d[k], g = d[k + 1], b = d[k + 2], lum = (r + g + b) / 3;
        var sea = b > r + 35 && b > g - 5, green = g > r + 12 && g >= b, sky = y < ih * .2 && b > r + 15;
        if (sea || green || sky || lum < 70) continue;
        // buildings: light walls and roofs; nearer rows are sparser in the band
        pts.push([xx / iw, y / ih, lum > 175 ? 1 : .6]);
      }
      var want = phone() ? 520 : 1100, step = Math.max(1, pts.length / want);
      LIGHTS = [];
      for (var f = 0; f < pts.length; f += step) {
        var p = pts[Math.floor(f + Math.random() * step) % pts.length], far = p[1] < .22;
        LIGHTS.push({ x: p[0], y: p[1], th: .22 + Math.random() * .62, ph: Math.random() * 6.3, sp: .6 + Math.random() * 1.8, s: far ? .9 + Math.random() * .6 : 1.1 + Math.random() * 1.4 * p[2], c: Math.random() < .72 ? '255,206,130' : Math.random() < .6 ? '255,240,214' : '170,215,255' });
      }
      // a few ships on the water
      for (var sh = 0; sh < 7; sh++) LIGHTS.push({ x: .05 + Math.random() * .55, y: .19 + Math.random() * .1, th: .4 + Math.random() * .3, ph: Math.random() * 6, sp: .3, s: 1.6, c: '255,250,235' });
      return true;
    } catch (e) { return false; }
  }

  // pre-rendered layers: the lights are drawn once per size into bands by the hour they come on; scrolling only
  // changes each band's opacity, a twinkle layer blinks in CSS, and a masked layer shows every light under the hand
  var BANDS = 6;
  var lights = (function () {
    var wrap = $('[data-lights]'), wrap2 = $('[data-lights2]'), ok = false, dusk01 = -1, mx = -9, my = -9, lensOn = false, raf = 0, t0 = performance.now(), cvs = [], tw, all, one;
    function mk(parent, cls) { var c = document.createElement('canvas'); c.className = cls || ''; parent.appendChild(c); return c; }
    for (var i = 0; i < BANDS; i++) cvs.push(mk(wrap));
    tw = mk(wrap, 'tw'); all = mk(wrap, 'all'); one = mk(wrap2);
    function draw(cv, W, Hh, pick, k) {
      cv.width = W; cv.height = Hh; var cx = cv.getContext('2d'), b = coverBox(W, Hh, heroImg.naturalWidth, heroImg.naturalHeight);
      cx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < LIGHTS.length; i++) {
        var L = LIGHTS[i]; if (!pick(L, i)) continue;
        var px = b.ox + L.x * b.dw, py = b.oy + L.y * b.dh, s = L.s * k;
        if (px < -4 || px > W + 4 || py < -4 || py > Hh + 4) continue;
        cx.fillStyle = 'rgba(' + L.c + ',.16)'; cx.fillRect(px - s * 2.2, py - s * 2.2, s * 4.4, s * 4.4);
        cx.fillStyle = 'rgba(' + L.c + ',.95)'; cx.fillRect(px - s / 2, py - s / 2, s, s);
      }
    }
    function size() {
      if (!ok) return;
      var W = stage.clientWidth, Hh = stage.clientHeight, k = phone() ? .9 : 1.1;
      cvs.forEach(function (c, b) { draw(c, W, Hh, function (L) { return Math.min(BANDS - 1, Math.floor((L.th - .22) / .62 * BANDS)) === b; }, k); });
      draw(tw, W, Hh, function (L, i) { return i % 6 === 0; }, k * 1.15);
      draw(all, W, Hh, function () { return true; }, k);
      var p = wrap2.parentNode; draw(one, p.clientWidth, p.clientHeight, function (L) { return L.th < .9; }, phone() ? .85 : 1);
      var d = dusk01; dusk01 = -1; set(d < 0 ? 0 : d);
    }
    function set(v) {
      if (v === dusk01) return; dusk01 = v;
      cvs.forEach(function (c, b) { c.style.opacity = smooth((v - (.22 + .62 * (b + .5) / BANDS)) / .14).toFixed(3); });
      wrap.classList.toggle('late', v > .55);
    }
    function lensAt(x, y, on) { lens.style.setProperty('--lx', x + 'px'); lens.style.setProperty('--ly', y + 'px'); all.style.setProperty('--lx', x + 'px'); all.style.setProperty('--ly', y + 'px'); lens.classList.toggle('on', on); all.classList.toggle('on', on); }
    // touch screens: dusk drifts along the city by itself for the first seconds, so the photo is alive at once
    function drift(t) {
      raf = 0; var T = (t - t0) / 1000;
      if (lensOn || still() || dusk01 > .2 || T > 9) { if (!lensOn) lensAt(0, 0, false); return; }
      var b = coverBox(stage.clientWidth, stage.clientHeight, heroImg.naturalWidth || 4, heroImg.naturalHeight || 3);
      lensAt(b.ox + b.dw * (.5 + .28 * Math.sin(T * .55)), b.oy + b.dh * (.36 + .05 * Math.sin(T * .9)), true);
      raf = requestAnimationFrame(drift);
    }
    if (fine) {
      stage.addEventListener('pointermove', function (e) { var r = stage.getBoundingClientRect(); lensOn = !still(); lensAt(e.clientX - r.left, e.clientY - r.top, lensOn); });
      stage.addEventListener('pointerleave', function () { lensOn = false; lensAt(0, 0, false); });
    } else {
      stage.addEventListener('pointerdown', function (e) { if (still()) return; var r = stage.getBoundingClientRect(); lensOn = true; lensAt(e.clientX - r.left, e.clientY - r.top, true); clearTimeout(lens._t); lens._t = setTimeout(function () { lensOn = false; lensAt(0, 0, false); }, 1800); });
    }
    function start() { ok = sampleLights(heroImg); size(); if (!fine && !still()) { t0 = performance.now(); raf = requestAnimationFrame(drift); } }
    if (heroImg.complete && heroImg.naturalWidth) setTimeout(start, 0); else heroImg.addEventListener('load', start, { once: true });
    return { size: size, kick: function () {}, set: set };
  })();

  // ---------------------------------------------------------------- labels on the photo decode out of scrambled letters
  var tags = $$('.ht');
  function placeTags() {
    var W = stage.clientWidth, Hh = stage.clientHeight, b = coverBox(W, Hh, heroImg.naturalWidth || 1680, heroImg.naturalHeight || 1260);
    tags.forEach(function (t) {
      var x = b.ox + b.dw * +t.dataset.x, y = b.oy + b.dh * +t.dataset.y;
      t.style.left = x + 'px'; t.style.top = y + 'px';
      t.hidden = x < 20 || x > W - 120 || y < 90 || y > Hh * .5;
    });
  }
  var GL = 'אבגדהוזחטיכלמנסעפצקרשת', GLE = 'ABCDEFGHKLMNPRSTVXZ';
  function decode(el, txt, delay) {
    if (still()) { el.textContent = txt; return; }
    var n = 0, total = 16, set = he() ? GL : GLE;
    clearInterval(el._d);
    setTimeout(function () {
      el._d = setInterval(function () {
        n++; var keep = Math.floor(txt.length * n / total);
        el.textContent = txt.slice(0, keep) + txt.slice(keep).replace(/\S/g, function () { return set[Math.floor(Math.random() * set.length)]; });
        if (n >= total) { clearInterval(el._d); el.textContent = txt; }
      }, 45);
    }, delay || 0);
  }

  // ---------------------------------------------------------------- the office on a contour map of the Carmel, slowly breathing
  var contours = (function () {
    var cv = $('[data-contours]'), c = cv.getContext('2d'), raf = 0, vis = false, w, h, t0 = performance.now(), mx = -1, my = -1;
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function draw(T) {
      c.clearRect(0, 0, w, h);
      var cx = w * .58, cy = h * .4, R = Math.max(w, h) * .95;
      for (var k = 13; k >= 1; k--) {
        var r0 = R * k / 13; c.beginPath();
        for (var a = 0; a <= 64; a++) {
          var th = a / 64 * Math.PI * 2, n = Math.sin(th * 3 + k * .7 + T * .25) * .07 + Math.sin(th * 5 - k * .4 - T * .18) * .045 + Math.cos(th * 2 + k) * .06;
          var rr = r0 * (1 + n), px = cx + Math.cos(th) * rr * 1.25, py = cy + Math.sin(th) * rr * .8;
          if (mx >= 0) { var dx = px - mx, dy = py - my, d2 = dx * dx + dy * dy; if (d2 < 6400) { var f = (6400 - d2) / 6400 * 10; px += dx / Math.sqrt(d2 + 1) * f; py += dy / Math.sqrt(d2 + 1) * f; } }
          a ? c.lineTo(px, py) : c.moveTo(px, py);
        }
        c.closePath(); c.strokeStyle = k % 4 === 0 ? 'rgba(233,179,95,.55)' : 'rgba(150,200,230,.22)'; c.lineWidth = k % 4 === 0 ? 1.4 : 1; c.stroke();
      }
    }
    function frame(t) { raf = 0; draw(still() ? 0 : (t - t0) / 1000); if (vis && !still()) raf = requestAnimationFrame(frame); }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    cv.parentNode.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; kick(); });
    cv.parentNode.addEventListener('pointerleave', function () { mx = my = -1; kick(); });
    watch(cv.parentNode, function (v) { vis = v; kick(); });
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- portrait: blueprint first, then the real photo develops
  var portrait = $('[data-portrait]');
  watch(portrait, function (v) { if (v) { portrait.classList.add('draw'); setTimeout(function () { portrait.classList.add('dev'); }, 1100); } }, { threshold: .35 });
  var decoded = false;
  watch($('.i-facts'), function (v) { if (v && !decoded) { decoded = true; $$('.dec').forEach(function (d, i) { decode(d, d.dataset[root.lang], 300 + i * 200); }); } }, { threshold: .4 });

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) { roll(o, still()); watch(o, function (v) { if (v) roll(o, true); }, { threshold: .4 }); });

  // ---------------------------------------------------------------- photos lean toward the hand
  if (fine) $$('[data-tilt]').forEach(function (f) {
    f.addEventListener('pointermove', function (e) { if (still()) return; var r = f.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; f.style.transform = 'perspective(900px) rotateY(' + (x * 8).toFixed(2) + 'deg) rotateX(' + (-y * 8).toFixed(2) + 'deg) scale(1.02)'; });
    f.addEventListener('pointerleave', function () { f.style.transform = ''; });
  });

  // ---------------------------------------------------------------- compose: key tags, rooms on the plan, the area; the message writes itself
  var wants = $$('[data-want]'), rooms = $$('[data-room]'), area = $('[data-area]'), msgEl = $('[data-msg]'), roomsOut = $('[data-roomsout]'), nRooms = 3, shown = '', typing = 0, chatSeen = false;
  wants.forEach(function (b) { b.addEventListener('click', function () {
    wants.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); });
    b.classList.remove('swing'); void b.offsetWidth; b.classList.add('swing'); write();
  }); });
  function lightRooms(pop) { rooms.forEach(function (r) { var k = +r.dataset.room, on = k <= nRooms; if (pop && on && !r.classList.contains('lit')) { r.classList.remove('pop'); void r.offsetWidth; r.classList.add('pop'); } r.classList.toggle('lit', on); r.setAttribute('aria-checked', k === nRooms ? 'true' : 'false'); }); }
  rooms.forEach(function (r) { r.addEventListener('click', function () { nRooms = +r.dataset.room; lightRooms(true); write(); }); });
  area.addEventListener('change', function () { write(); });
  function roomsText(l) {
    if (l) return nRooms === 1 ? 'דירת חדר' : nRooms === 5 ? 'דירת 5 חדרים או יותר' : 'דירת ' + nRooms + ' חדרים';
    return nRooms === 1 ? 'a one-room flat' : nRooms === 5 ? 'a flat with 5 rooms or more' : 'a ' + nRooms + '-room flat';
  }
  function compose() {
    var l = he(), w = wants.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], o = area.options[area.selectedIndex];
    roomsOut.textContent = l ? (nRooms === 5 ? '5 ומעלה' : nRooms === 1 ? 'חדר אחד' : nRooms + ' חדרים') : (nRooms === 5 ? '5 or more' : nRooms === 1 ? 'one' : String(nRooms));
    return l ? 'שלום איתי, אני רוצה ' + w.dataset.he + ' ' + roomsText(true) + ' ' + o.dataset.he + '. אשמח לדבר.'
             : 'Hi Itay, I’d like to ' + w.dataset.en + ' ' + roomsText(false) + ' ' + o.dataset.en + '. Happy to talk.';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 14);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; if (still()) return; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });
  lightRooms(false);

  // ---------------------------------------------------------------- one scroll loop
  var vps = $$('[data-vp]'), rq = $('[data-rq]'), rail = $('[data-rail]'), track = $('[data-track]'), reach = $('[data-reach]'), rphoto = $('[data-rphoto]'), card = $('[data-card]'), keybar = $('[data-keybar]');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  var lastClock = '';
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // hero: morning to night with the scroll; still = early evening with the lights on
    var hp = calm ? .82 : prog(hero), t = calm ? .82 : smooth(hp / .92);
    dusk.style.opacity = (t * .9).toFixed(3);
    sunset.style.opacity = (Math.max(0, 1 - Math.abs(t - .45) / .3)).toFixed(3);
    lights.set(t);
    var hrs = 9 + 12 * (calm ? 1 : t), cl = (hrs < 10 ? '0' : '') + hhmm(hrs - (hrs % .25));
    if (cl !== lastClock) { lastClock = cl; clockEl.textContent = calm ? '21:00' : cl; }
    keybar.classList.toggle('show', scrollY > vh * .6);
    // the verb panels: each one lands over the last, the covered one sinks and dims
    vps.forEach(function (v, i) {
      var r = v.getBoundingClientRect(), inner = v.firstElementChild, img = inner.firstElementChild;
      if (calm) { inner.style.transform = ''; inner.style.filter = ''; img.style.setProperty('--kb', 1.04); v.classList.add('lit'); return; }
      var next = vps[i + 1], cov = 0;
      if (next) { var nr = next.getBoundingClientRect(); cov = clamp(1 - nr.top / vh, 0, 1); }
      inner.style.transform = cov ? 'scale(' + (1 - cov * .08).toFixed(4) + ') translateY(' + (cov * -2).toFixed(2) + '%)' : '';
      inner.style.filter = cov ? 'brightness(' + (1 - cov * .55).toFixed(3) + ')' : '';
      img.style.setProperty('--kb', (1.12 - .08 * clamp(1 - r.top / vh, 0, 1) - cov * .04).toFixed(4));
      v.classList.toggle('lit', r.top < vh * .45 && r.bottom > vh * .3 || (cov > 0 && cov < .5));
    });
    // reviews: the night photo drifts, the written reviews slide by with the scroll (desktop)
    var rr = rq.getBoundingClientRect();
    if (!calm) rq.style.setProperty('--py', (clamp((rr.top / vh), -1, 1) * -8).toFixed(2) + '%');
    if (!calm && !phone()) {
      var rp = clamp((vh - rail.getBoundingClientRect().top) / (vh + rail.offsetHeight), 0, 1), over = Math.max(0, track.scrollWidth - rail.clientWidth + 40);
      track.style.setProperty('--rx', ((he() ? 1 : -1) * over * rp).toFixed(1) + 'px');
    } else track.style.setProperty('--rx', '0px');
    // contact: the view shrinks into its frame, the visit card is set beside it
    var kp = calm ? 1 : prog(reach), s2 = calm ? 1 : smooth(kp / .6), W = innerWidth;
    var top = phone() ? 70 : vh * .1, side = phone() ? 12 : W * .04, bot = phone() ? vh * .48 : vh * .1, far = phone() ? 12 : W * .44;
    var rtl = root.dir === 'rtl';
    rphoto.style.setProperty('--pt', (top * s2).toFixed(1) + 'px');
    rphoto.style.setProperty('--pb', (bot * s2).toFixed(1) + 'px');
    rphoto.style.setProperty('--pl', ((rtl ? side : far) * s2).toFixed(1) + 'px');
    rphoto.style.setProperty('--pr', ((rtl ? far : side) * s2).toFixed(1) + 'px');
    rphoto.style.setProperty('--prr', (26 * s2).toFixed(1) + 'px');
    var cv = calm ? 1 : smooth((s2 - .55) / .4);
    card.style.opacity = calm ? '' : cv.toFixed(3);
    card.style.transform = calm || cv >= 1 ? '' : 'translateY(' + ((1 - cv) * 40).toFixed(1) + 'px)';
  }
  watch(foot, function (v) { if (v) foot.classList.add('in'); }, { threshold: .25 });

  // the footer name fills its width
  function fit() { $$('[data-fit]').forEach(function (el) { var s = $('span[lang="' + root.lang + '"]', el); el.style.fontSize = '200px'; var w = s.getBoundingClientRect().width || 1; el.style.fontSize = Math.min(260, 200 * (el.clientWidth / w) * .98).toFixed(1) + 'px'; }); }

  function layout() { root.style.setProperty('--cb', $('.concept').offsetHeight + 'px'); lights.size(); contours.size(); placeTags(); fit(); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (innerWidth !== lw || !phone()) { lw = innerWidth; layout(); } }, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();

  // ---------------------------------------------------------------- opening, then the hero
  var opening = $('[data-opening]'), started = false;
  function heroIn() {
    if (started) return; started = true;
    requestAnimationFrame(function () { hero.classList.add('ready'); });
    tags.forEach(function (t, i) { decode($('b', t), t.dataset[root.lang], 900 + i * 260); });
  }
  if (root.classList.contains('op-on')) {
    try { sessionStorage.setItem('ib-open', '1'); } catch (e) {}
    var cnt = $('[data-occount]'), t0 = performance.now();
    (function cl(t) { var p = clamp((t - t0) / 1500, 0, 1); cnt.textContent = '09:' + String(Math.round(p * 59)).padStart(2, '0'); if (p < 1 && root.classList.contains('op-on')) requestAnimationFrame(cl); })(t0);
    var end = function () { if (!root.classList.contains('op-on')) return; opening.classList.add('op-end'); heroIn(); setTimeout(function () { root.classList.remove('op-on'); layout(); }, 380); };
    requestAnimationFrame(function () { opening.classList.add('op-go'); });
    setTimeout(function () { opening.classList.add('op-done'); }, 1250);
    setTimeout(end, 1750);
    opening.addEventListener('click', end);
  } else {
    var go = function () { heroIn(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    setTimeout(go, 900);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(); });
  addEventListener('load', function () { placeTags(); fit(); tick(); });
})();
