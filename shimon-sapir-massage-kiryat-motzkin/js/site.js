(function () {
  var root = document.documentElement, WA = '972525417858';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 700; };
  var touchOnly = matchMedia('(hover: none)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'שמעון ספיר · עיסוי בקריות · החשמונאים 45, קרית מוצקין', en: 'Shimon Sapir · Massage in the Krayot · 45 HaHashmonaim St, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור עיסוי בקריות שמעון ספיר · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Shimon Sapir Massage in the Krayot · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'שמעון ספיר – עיסוי בקריות', 'Shimon Sapir – Massage in the Krayot');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-wa]', 'וואטסאפ לשמעון', 'WhatsApp Shimon');
    aria('[data-t-call]', 'להתקשר לשמעון, 052-541-7858', 'Call Shimon, 052-541-7858');
    aria('[data-t-prev]', 'התמונה הקודמת', 'Previous photo');
    aria('[data-t-next]', 'התמונה הבאה', 'Next photo');
    aria('[data-t-treat]', 'איזה טיפול', 'Which treatment');
    aria('[data-t-when]', 'מתי נוח', 'Best time');
    aria('[data-t-who]', 'מי כתב', 'Who wrote it');
    aria('[data-t-bay]', 'מפרץ חיפה, ונקודה בקרית מוצקין', 'Haifa Bay, with a dot at Kiryat Motzkin');
    $$('[data-decode]').forEach(function (el) { decode(el, el.dataset[l]); });
    zoneLabels();
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ss336-lang', l); } catch (e) {}
    texts(l); hours(); whenLabel(); write(true); showStage(stageIdx, true); fit(); tick();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- labels that decode out of scrambled letters
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'abcdefghijklmnopqrstuvwxyz' };
  function decode(el, txt) {
    cancelAnimationFrame(el._d);
    if (still() || !txt) { el.textContent = txt || ''; return; }
    var g = GL[he() ? 'he' : 'en'], t0 = performance.now(), dur = 520;
    (function st(t) {
      var k = (t - t0) / dur, n = Math.floor(k * txt.length), out = '';
      for (var i = 0; i < txt.length; i++) out += i < n || txt[i] === ' ' ? txt[i] : g[Math.floor(Math.random() * g.length)];
      el.textContent = out;
      if (k < 1) el._d = requestAnimationFrame(st); else el.textContent = txt;
    })(t0);
  }

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('ss336-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    endDeal(); cups.kick(); showStage(stageIdx, true); layout();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [8, 21], 1: [8, 21], 2: [8, 21], 3: [8, 21], 4: [8, 21], 5: [9, 13], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function allDay(t) { return t && t[0] === 0 && t[1] === 24; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (allDay(t)) { open = true; txt = l ? 'פתוח עכשיו · כל היום' : 'Open now · all day'; }
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
    var td = $('[data-today]'); if (td) td.innerHTML = !t ? (l ? 'סגור' : 'Closed') : allDay(t) ? (l ? 'כל היום' : 'All day') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
  }
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
  $$('section').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', (i % 5) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- letters (the name soaks in, the footer line rises)
  function letters(sel) {
    $$(sel).forEach(function (sp) {
      var i = 0;
      sp.innerHTML = sp.textContent.split(' ').map(function (w) {
        return '<span style="display:inline-block;white-space:nowrap">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  }
  letters('[data-split] > span[lang]'); letters('[data-rise-letters] > span[lang]');

  // the name fills its band on one line
  var nameEl = $('.h-name');
  function fit() {
    var sp = $$('span[lang]', nameEl).filter(function (s) { return s.offsetParent !== null; })[0]; if (!sp) return;
    nameEl.style.setProperty('--fs', '100px');
    var w = sp.getBoundingClientRect().width || 1, avail = nameEl.clientWidth;
    nameEl.style.setProperty('--fs', Math.min(100 * avail / w * .98, phone() ? innerWidth * .3 : Math.max(150, innerHeight * .25)).toFixed(1) + 'px');
  }

  var hero = $('[data-hero]'), hphoto = $('[data-hphoto]'), nav = $('[data-nav]'), dock = $('[data-dock]');

  // ---------------------------------------------------------------- glass cups drifting over his hands: lenses that magnify and warm the photo
  var cups = (function () {
    var els = $$('[data-cup]'), raf = 0, vis = true, W = 0, Hh = 0, px = -1, py = -1, t0 = performance.now();
    var st = els.map(function (el, i) { return { el: el, inn: $('.cup-in', el), x: 0, y: 0, ph: i * 2.1 }; });
    function size() { W = hphoto.clientWidth; Hh = hphoto.clientHeight; st.forEach(function (s) { s.inn.style.width = W + 'px'; s.inn.style.height = Hh + 'px'; s.d = s.el.offsetWidth; if (!s.x) { s.x = W * (.3 + .2 * s.ph / 4); s.y = Hh * .5; } }); }
    function frame(t) {
      raf = 0; if (still() || !vis) return;
      var T = (t - t0) / 1000;
      st.forEach(function (s, i) {
        var tx, ty;
        if (i === 0 && px >= 0) { tx = px; ty = py; }
        else {
          var cx = W * (i === 0 ? .46 : i === 1 ? .7 : .26), cy = Hh * (i === 0 ? .5 : i === 1 ? .36 : .64);
          tx = cx + Math.sin(T * (.23 + i * .07) + s.ph) * W * (phone() ? .22 : .14);
          ty = cy + Math.cos(T * (.31 + i * .05) + s.ph) * Hh * .14;
        }
        var k = i === 0 && px >= 0 ? .14 : .05;
        s.x = lerp(s.x, tx, k); s.y = lerp(s.y, ty, k);
        var d = s.d, ox = s.x - d / 2, oy = s.y - d / 2, mag = i === 0 ? 1.5 : 1.35;
        s.el.style.transform = 'translate3d(' + ox.toFixed(1) + 'px,' + oy.toFixed(1) + 'px,0)';
        s.inn.style.transformOrigin = s.x.toFixed(1) + 'px ' + s.y.toFixed(1) + 'px';
        s.inn.style.transform = 'translate3d(' + (-ox).toFixed(1) + 'px,' + (-oy).toFixed(1) + 'px,0) scale(' + mag + ')';
      });
      // the lamp light follows the big cup
      hphoto.style.setProperty('--lx', (st[0].x / W * 100).toFixed(1) + '%'); hphoto.style.setProperty('--ly', (st[0].y / Hh * 100).toFixed(1) + '%');
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); }
    if (!touchOnly) {
      hphoto.addEventListener('pointermove', function (e) { var r = hphoto.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
      hphoto.addEventListener('pointerleave', function () { px = py = -1; });
    }
    // on a phone a tap places the big cup; it settles there, then drifts on
    hphoto.addEventListener('pointerdown', function (e) {
      if (still()) return; var r = hphoto.getBoundingClientRect(), s = st[0];
      s.x = e.clientX - r.left; s.y = e.clientY - r.top;
      s.el.animate([{ scale: '1.18' }, { scale: '.94' }, { scale: '1' }], { duration: 480, easing: 'cubic-bezier(.23,1,.32,1)' });
    });
    watch(hero, function (v) { vis = v; kick(); });
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- the opening: three of his photos are dealt onto the table, the hero opens out of them
  var dealt = false, dealAnims = [];
  function endDeal() { dealAnims.forEach(function (a) { try { a.finish(); } catch (e) {} }); hero.classList.remove('dealing'); }
  function deal() {
    if (dealt || still() || !Element.prototype.animate) return; dealt = true;
    hero.classList.add('dealing');
    var cards = $$('[data-deal] img'), side = root.dir === 'rtl' ? 1 : -1, img = $('.h-img');
    cards.forEach(function (c, i) {
      var x = (i - 1) * Math.min(innerWidth * .2, 170), r = (i - 1) * 8;
      dealAnims.push(c.animate([
        { opacity: 0, transform: 'translate(-50%,-50%) translate(' + (side * 60) + 'px,60vh) rotate(' + (r * 2) + 'deg)' },
        { opacity: 1, transform: 'translate(-50%,-50%) translate(' + x + 'px,0) rotate(' + r + 'deg)', offset: .55 },
        { opacity: 1, transform: 'translate(-50%,-50%) translate(' + x + 'px,0) rotate(' + r + 'deg)', offset: .8 },
        { opacity: 0, transform: 'translate(-50%,-50%) translate(' + (x * 1.6) + 'px,0) rotate(' + r + 'deg) scale(1.15)' }
      ], { duration: 1250, delay: i * 90, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'both' }));
    });
    var a = img.animate([
      { clipPath: 'inset(32% 40% 32% 40% round 18px)', opacity: 0 },
      { clipPath: 'inset(32% 40% 32% 40% round 18px)', opacity: 1, offset: .5 },
      { clipPath: 'inset(0% 0% 0% 0% round 0px)', opacity: 1 }
    ], { duration: 1350, easing: 'cubic-bezier(.77,0,.175,1)' });
    dealAnims.push(a);
    a.onfinish = function () { hero.classList.remove('dealing'); };
    hero.addEventListener('pointerdown', endDeal, { once: true });
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
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- THE ROOM: each next photo opens inside the widening rim of a glass cup
  var scene = $('[data-scene]'), stage = $('[data-stage]'), sps = $$('[data-sp]'), rim = $('[data-rim]'), sItems = $$('[data-slist] li'), sLabel = $('[data-slabel]');
  var CAP = {
    he: ['הידיים של שמעון, על שולחן הטיפולים', 'כוסות רוח על הגב', 'מחטים בגב התחתון', 'שמיכה, וכוסות על הרגליים'],
    en: ['Shimon’s hands, on the treatment table', 'Glass cups on a back', 'Needles in the lower back', 'A blanket, and cups on the legs']
  };
  var stageIdx = 0, prevBtn = $('[data-prev]'), nextBtn = $('[data-next]');
  function showStage(i, force) {
    if (i === stageIdx && !force) return; stageIdx = i;
    sItems.forEach(function (li, k) { li.classList.toggle('on', k === i); });
    sps.forEach(function (s, k) { s.classList.toggle('show', k === i); });
    decode(sLabel, CAP[he() ? 'he' : 'en'][i]);
    prevBtn.disabled = i === 0; nextBtn.disabled = i === sps.length - 1;
  }
  function goStage(i) {
    i = clamp(i, 0, sps.length - 1);
    if (still()) { showStage(i); return; }
    var r = scene.getBoundingClientRect(), span = scene.offsetHeight - innerHeight, p = i === 0 ? 0 : (i - .08) / (sps.length - 1);
    scrollTo({ top: scrollY + r.top + span * p, behavior: 'smooth' });
  }
  prevBtn.addEventListener('click', function () { goStage(stageIdx - 1); });
  nextBtn.addEventListener('click', function () { goStage(stageIdx + 1); });
  $$('[data-go]').forEach(function (b) { b.addEventListener('click', function () { goStage(+b.dataset.go); }); });
  function sceneUpdate() {
    if (still()) { sps.forEach(function (s) { s.style.removeProperty('--r'); s.style.removeProperty('--k'); }); return; }
    var r = scene.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    var span = Math.max(1, scene.offsetHeight - innerHeight), p = clamp(-r.top / span, 0, 1), u = p * (sps.length - 1);
    var W = stage.clientWidth, Hs = stage.clientHeight, idx = 0, rimOn = false;
    sps.forEach(function (s, k) {
      if (k === 0) { s.style.setProperty('--k', lerp(1.1, 1.02, smooth(u)).toFixed(4)); return; }
      var loc = smooth((u - (k - 1) - .12) / .72), cx = W * +s.dataset.cx, cy = Hs * +s.dataset.cy;
      var maxR = Math.hypot(Math.max(cx, W - cx), Math.max(cy, Hs - cy)) + 30, rr = loc > 0 ? lerp(Math.min(W, Hs) * .14, maxR, loc) : 0;
      s.style.setProperty('--cx', cx.toFixed(1) + 'px'); s.style.setProperty('--cy', cy.toFixed(1) + 'px'); s.style.setProperty('--r', rr.toFixed(1) + 'px');
      s.style.setProperty('--k', lerp(1.16, 1.03, loc).toFixed(4));
      if (loc > .5) idx = k;
      if (loc > 0 && loc < 1) { rimOn = true; rim.style.transform = 'translate(' + (cx - rr).toFixed(1) + 'px,' + (cy - rr).toFixed(1) + 'px)'; rim.style.width = rim.style.height = (2 * rr).toFixed(1) + 'px'; rim.style.opacity = (1 - Math.pow(loc, 3)).toFixed(3); }
    });
    if (!rimOn) rim.style.opacity = 0;
    showStage(idx);
  }

  // ---------------------------------------------------------------- WRITE: pick, tap the back, cups settle, the message writes itself
  // spots on the real photo of a back on his table (crop 800x500 units)
  var ZONES = [
    { he: 'צוואר', bhe: 'בצוואר', en: 'neck', p: [[326, 72]] },
    { he: 'כתפיים', bhe: 'בכתפיים', en: 'shoulders', p: [[178, 222], [556, 132]] },
    { he: 'גב עליון', bhe: 'בגב העליון', en: 'upper back', p: [[410, 196]] },
    { he: 'אמצע הגב', bhe: 'באמצע הגב', en: 'mid back', p: [[460, 276]] },
    { he: 'גב תחתון', bhe: 'בגב התחתון', en: 'lower back', p: [[492, 372], [372, 392]] },
    { he: 'זרועות', bhe: 'בזרועות', en: 'arms', p: [[96, 330]] }
  ];
  var zBox = $('[data-zones]'), zOn = ZONES.map(function () { return false; }), zBtns = [];
  ZONES.forEach(function (z, zi) {
    z.p.forEach(function (pt, k) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'zone';
      b.style.left = (pt[0] / 800 * 100) + '%'; b.style.top = (pt[1] / 500 * 100) + '%';
      b.setAttribute('aria-pressed', 'false');
      if (k) { b.tabIndex = -1; b.setAttribute('aria-hidden', 'true'); } else b.innerHTML = '<span class="zl"></span>';
      b.addEventListener('click', function () { toggleZone(zi); });
      zBox.appendChild(b); zBtns.push({ b: b, zi: zi, first: !k });
    });
  });
  function zoneLabels() { zBtns.forEach(function (o) { if (!o.first) return; var z = ZONES[o.zi]; $('.zl', o.b).textContent = he() ? z.he : z.en; o.b.setAttribute('aria-label', he() ? z.he : z.en[0].toUpperCase() + z.en.slice(1)); }); }
  function toggleZone(zi) {
    zOn[zi] = !zOn[zi];
    zBtns.forEach(function (o) {
      if (o.zi !== zi) return;
      o.b.setAttribute('aria-pressed', zOn[zi] ? 'true' : 'false');
      var g = $('.gc', o.b);
      if (zOn[zi]) {
        if (!g) { g = document.createElement('span'); g.className = 'gc'; o.b.appendChild(g); }
        if (!still() && g.animate) g.animate([{ transform: 'translateY(-30px) scale(1.4)', opacity: 0 }, { transform: 'translateY(2px) scale(.9)', opacity: 1, offset: .7 }, { transform: 'none', opacity: 1 }], { duration: 560, delay: o.first ? 0 : 90, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' });
      } else if (g) {
        if (!still() && g.animate) g.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(-24px) scale(1.2)', opacity: 0 }], { duration: 200, easing: 'cubic-bezier(.23,1,.32,1)' }).onfinish = function () { g.remove(); };
        else g.remove();
      }
    });
    lightStep(1); write();
  }
  var treats = $$('[data-treat]'), whenEl = $('[data-when]'), whenL = $('[data-whenl]'), steps = $$('[data-step]');
  var WHEN = { he: ['בוקר', 'צהריים', 'ערב', 'שישי בבוקר'], bhe: ['בבוקר', 'בצהריים', 'בערב', 'ביום שישי בבוקר'], en: ['Morning', 'Midday', 'Evening', 'Friday morning'] };
  function lightStep(n) { steps.forEach(function (s, i) { if (i === n) s.classList.add('on'); }); }
  lightStep(0);
  treats.forEach(function (b) { b.addEventListener('click', function () { treats.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lightStep(0); write(); }); });
  function whenLabel() { whenL.textContent = WHEN[he() ? 'he' : 'en'][+whenEl.value]; }
  whenEl.addEventListener('input', function () { whenLabel(); lightStep(2); write(); });
  $('[data-send]').addEventListener('pointerenter', function () { lightStep(3); });
  $('[data-send]').addEventListener('focus', function () { lightStep(3); });
  $('[data-send]').addEventListener('click', function () { lightStep(3); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), t = treats.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0], w = +whenEl.value;
    var tn = t ? t.dataset[l ? 'he' : 'en'] : '', zs = ZONES.filter(function (z, i) { return zOn[i]; });
    if (l) {
      var m = tn ? 'שלום שמעון, אשמח לקבוע תור ל' + tn + '.' : 'שלום שמעון, אשמח לקבוע תור ולהתייעץ איזה טיפול מתאים לי.';
      if (zs.length) m += ' העומס בעיקר ' + list(zs.map(function (z) { return z.bhe; }), true) + '.';
      return m + ' נוח לי ' + WHEN.bhe[w] + '.';
    }
    var e = tn ? 'Hi Shimon, I’d like to book ' + tn + '.' : 'Hi Shimon, I’d like to book a session and ask which treatment suits me.';
    if (zs.length) e += ' It’s mostly my ' + list(zs.map(function (z) { return z.en; }), false) + '.';
    return e + ' ' + ['Mornings suit me best.', 'Midday suits me best.', 'Evenings suit me best.', 'Friday morning suits me best.'][w];
  }
  var msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
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
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- REVIEWS: words surface one by one; the names are tabs that advance by themselves
  $$('[data-q] p').forEach(function (p) {
    var i = 0, html = '';
    [].slice.call(p.childNodes).forEach(function (n) {
      if (n.nodeType === 3) html += n.textContent.split(/(\s+)/).map(function (w) { return /^\s+$/.test(w) || !w ? w : '<span class="wd" style="--i:' + (i++) + '">' + w + '</span>'; }).join('');
      else html += '<br>';
    });
    p.innerHTML = html;
  });
  var qs = $$('[data-q]'), who = $$('[data-who]'), qi = 0, qOn = false, qTimer = null, bar = null;
  who.forEach(function (b) { var i = document.createElement('i'); i.setAttribute('aria-hidden', 'true'); b.appendChild(i); });
  function showQ(i, user) {
    qi = i;
    qs.forEach(function (q, k) { q.classList.toggle('on', k === i); q.classList.remove('play'); q.hidden = k !== i; });
    who.forEach(function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    void qs[i].offsetWidth; qs[i].classList.add('play');
    if (bar) bar.cancel(); clearTimeout(qTimer);
    if (!user && qOn && !still()) {
      var ln = $('i', who[i]);
      if (ln.animate) bar = ln.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 8000, easing: 'linear' });
      qTimer = setTimeout(function () { showQ((qi + 1) % qs.length); }, 8000);
    }
  }
  who.forEach(function (b, k) { b.addEventListener('click', function () { showQ(k, true); }); });
  watch($('[data-reviews]'), function (v) { var was = qOn; qOn = v; if (v && !was) showQ(qi); if (!v) { clearTimeout(qTimer); if (bar) bar.cancel(); } }, { threshold: .35 });
  showQ(0, true);

  // ---------------------------------------------------------------- photos that lean toward the hand (scroll-driven on phones)
  var tilts = $$('[data-tilt]');
  if (!touchOnly) tilts.forEach(function (t) {
    t.addEventListener('pointermove', function (e) { if (still()) return; var r = t.getBoundingClientRect(); t.style.setProperty('--tx', (((e.clientX - r.left) / r.width - .5) * 10).toFixed(2) + 'deg'); t.style.setProperty('--ty', ((.5 - (e.clientY - r.top) / r.height) * 8).toFixed(2) + 'deg'); });
    t.addEventListener('pointerleave', function () { t.style.setProperty('--tx', '0deg'); t.style.setProperty('--ty', '0deg'); });
  });

  // ---------------------------------------------------------------- footer
  var foot = $('[data-foot]');
  watch(foot, function (v) { if (v) foot.classList.add('in'); }, { threshold: .2 });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var aerial = $('[data-drift]'), sq = $('[data-drift2]'), visit = $('[data-visit]'), towel = $('[data-towel]');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function seen(el) { var r = el.getBoundingClientRect(); return clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    dock.classList.toggle('show', scrollY > hero.offsetHeight * .5);
    // the hero's lower edge curves into the swoosh of his logo's band as you leave
    var hr = hero.getBoundingClientRect(), q = calm ? 0 : clamp(-hr.top / (hr.height * .7), 0, 1);
    hphoto.style.setProperty('--ex', lerp(160, 72, smooth(q)).toFixed(1) + '%');
    if (!calm) cups.kick();
    aerial.style.setProperty('--z', calm ? 1 : lerp(1.18, 1, smooth(seen(aerial))).toFixed(4));
    sceneUpdate();
    sq.style.setProperty('--dy', calm ? '0px' : ((.5 - seen(sq)) * 70).toFixed(1) + 'px');
    if (touchOnly && !calm) tilts.forEach(function (t) { t.style.setProperty('--ty', ((seen(t) - .5) * -10).toFixed(2) + 'deg'); });
    // the towel is lifted off the room photo, both ways with the scroll
    var vr = visit.getBoundingClientRect(), tp = calm ? 1 : smooth((vh - vr.top) / vh * 1.3 - .12);
    towel.style.setProperty('--tt', (-tp * 104).toFixed(2) + '%');
  }

  function layout() { root.style.setProperty('--cb', $('.concept').offsetHeight + 'px'); fit(); cups.size(); tick(); }
  var rz, lastW = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); lastW = innerWidth; }, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); whenLabel(); write(true); showStage(0, true); layout();
  var once = false, go = function () { if (once) return; once = true; fit(); requestAnimationFrame(function () { hero.classList.add('ready'); cups.size(); cups.kick(); }); };
  // deal only once the photos are decoded, and only early in the visit; otherwise the hero simply shows
  var dimg = $$('[data-deal] img').concat([$('.h-img')]);
  Promise.all(dimg.map(function (i) { return i.decode ? i.decode().catch(function () {}) : 0; })).then(function () { if (performance.now() < 2500 && scrollY < 50) requestAnimationFrame(function () { requestAnimationFrame(deal); }); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 900);
  addEventListener('load', function () { fit(); cups.size(); tick(); });
})();
