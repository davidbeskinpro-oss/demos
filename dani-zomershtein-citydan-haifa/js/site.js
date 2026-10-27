(function () {
  var root = document.documentElement, WA = '972544411111';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var outq = function (t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'דני זומרשטיין · סיטידן נכסים · תיווך נדל״ן בחיפה', en: 'Dani Zomershtein · CityDan Properties · Real estate in Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור דני זומרשטיין – סיטידן נכסים בע״מ · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Dani Zomershtein – CityDan Properties Ltd · This is not the business’s official website' };
  var HELLO = { he: 'שלום דני, אשמח לשיחה.', en: 'Hi Dani, I would be glad to talk.' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'סיטידן נכסים', 'CityDan Properties');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לדני, 054-441-1111', 'Call Dani, 054-441-1111');
    aria('[data-t-wa]', 'וואטסאפ לדני', 'WhatsApp Dani');
    aria('[data-t-less]', 'פחות חדרים', 'Fewer rooms');
    aria('[data-t-more]', 'עוד חדרים', 'More rooms');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: לסקוב 3, חיפה' : 'Map: 3 Laskov St, Haifa'; });
    $('[data-hood]').placeholder = l === 'he' ? 'באיזו שכונה? (לא חובה)' : 'Which neighbourhood? (optional)';
    $$('[data-wa-plain]').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(HELLO[l]); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('cd-lang', l); } catch (e) {}
    texts(l); hours(); sign.render(true); odoAll(); layout(); clampCheck();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('cd-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-decode]').forEach(function (el) { if (el.dataset.txt) el.textContent = el.dataset.txt; });
    layout(); light.kick(); dots.kick(); sign.render(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8, 19.5], 1: [8, 19.5], 2: [8, 19.5], 3: [8, 19.5], 4: [8, 19.5], 5: [8, 14.5], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { if (x >= 24) return '24:00'; var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    var allDay = function (x) { return x && x[0] === 0 && x[1] >= 24; };
    if (allDay(t)) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
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
  $$('[data-bento]').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 5) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  // the small living drawings run only while their card is on screen
  $$('.fc').forEach(function (c) { watch(c, function (v) { c.classList.toggle('on', v); }); });

  // ---------------------------------------------------------------- headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // ---------------------------------------------------------------- labels decode out of scrambled letters as they arrive
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHKLMNPRSTUVXZ0123456789' };
  function decode(el) {
    var txt = el.dataset.txt || el.textContent; el.dataset.txt = txt;
    if (still()) { el.textContent = txt; return; }
    var set = /[֐-׿]/.test(txt) ? GL.he : GL.en, t0 = performance.now(), dur = Math.min(1100, 300 + txt.length * 22);
    (function step(now) {
      var p = clamp((now - t0) / dur, 0, 1), n = Math.floor(p * txt.length), out = '';
      for (var i = 0; i < txt.length; i++) { var c = txt[i]; out += i < n || /[\s·,.״׳"'()\-–]/.test(c) ? c : set[Math.floor(Math.random() * set.length)]; }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(step); else el.textContent = txt;
    })(t0);
  }
  if (io) { var dio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { decode(e.target); dio.unobserve(e.target); } }); }, { rootMargin: '0px 0px -10% 0px' }); $$('[data-decode]').forEach(function (el) { el.dataset.txt = el.textContent; dio.observe(el); }); }

  // ---------------------------------------------------------------- odometer figures: each digit rolls on its own wheel
  function odo(el, go) {
    var v = el.dataset.odo;
    if (!el.dataset.built) {
      el.dataset.built = 1; el.classList.add('odo');
      el.innerHTML = '<span class="vh">' + v + '</span>' + v.split('').map(function (c) {
        if (!/\d/.test(c)) return '<span class="odo-s" aria-hidden="true">' + c + '</span>';
        var col = ''; for (var k = 0; k <= 9; k++) col += '<span data-n="' + k + '"></span>';
        return '<span class="odo-d" aria-hidden="true" data-d="' + c + '"><span class="odo-c">' + col + '</span></span>';
      }).join('');
    }
    $$('.odo-c', el).forEach(function (c, i) {
      var d = +c.parentNode.dataset.d;
      c.style.transitionDelay = (i * 120) + 'ms';
      c.style.transform = 'translateY(' + (go || still() ? -d * 1.1 : 0) + 'em)';
    });
  }
  function odoAll() { $$('[data-odo]').forEach(function (el) { odo(el, el.dataset.seen === '1'); }); }
  $$('[data-odo]').forEach(function (el) { odo(el, false); watch(el, function (v) { if (v && el.dataset.seen !== '1') { el.dataset.seen = '1'; requestAnimationFrame(function () { odo(el, true); }); } }); });

  // ---------------------------------------------------------------- the studio light on his portrait: follows the hand, drifts by itself on touch
  var hero = $('[data-hero]'), portrait = $('[data-portrait]');
  var light = (function () {
    var vis = true, raf = 0, tx = 40, ty = 28, x = 40, y = 28, hand = false, t0 = performance.now();
    function frame(now) {
      raf = 0; if (still() || !vis) { portrait.style.setProperty('--lx', '42%'); portrait.style.setProperty('--ly', '26%'); return; }
      if (!hand) { var t = (now - t0) / 1000; tx = 46 + Math.sin(t * .55) * 18; ty = 30 + Math.cos(t * .42) * 12; }
      x = lerp(x, tx, .08); y = lerp(y, ty, .08);
      portrait.style.setProperty('--lx', x.toFixed(2) + '%'); portrait.style.setProperty('--ly', y.toFixed(2) + '%');
      portrait.style.setProperty('--px', ((x - 46) * -.12).toFixed(2) + 'px'); portrait.style.setProperty('--py', ((y - 30) * -.12).toFixed(2) + 'px');
      raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = portrait.getBoundingClientRect(); hand = true;
      tx = clamp((e.clientX - r.left) / r.width * 100, -10, 110); ty = clamp((e.clientY - r.top) / r.height * 100, -10, 110);
    });
    hero.addEventListener('pointerleave', function () { hand = false; });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- spotlight and tilt on the tiles (scroll-driven on touch)
  $$('[data-spot]').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });
  $$('[data-tilt]').forEach(function (t) {
    var inner = $('.tilt', t);
    t.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || still()) return;
      var r = t.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
      inner.style.setProperty('--ry', (dx * 14).toFixed(2) + 'deg'); inner.style.setProperty('--rx', (dy * -10).toFixed(2) + 'deg');
    });
    t.addEventListener('pointerleave', function () { inner.style.setProperty('--ry', '0deg'); inner.style.setProperty('--rx', '0deg'); });
  });

  // ---------------------------------------------------------------- WALK: the camera walks into the room, the middle window opens into Haifa
  var walk = $('[data-walk]'), wstage = $('[data-wstage]'), wroom = $('[data-wroom]'), wview = $('[data-wview]');
  var wBack = $('.w-back', wroom), wFloor = $('.w-floor', wroom), wSun = $('.w-sun', wroom), wCopy = $('.w-copy', walk), wCred = $('.w-credit', walk);
  var tags = $$('[data-tag]', walk);
  var IW = 1600, IH = 1200, WIN = { l: 812, t: 225, r: 1150, b: 690 }, WC = { x: 981, y: 457 };
  var TAGP = [[352, 792, .14, .42], [960, 960, .28, .56], [976, 380, .42, .66]];
  function walkFrame(H) {
    var W = wstage.clientWidth, Hs = wstage.clientHeight || H;
    if (still()) {
      [wBack, wFloor, wSun].forEach(function (el) { el.style.transform = ''; el.style.width = ''; el.style.height = ''; });
      tags.forEach(function (t) { t.style.removeProperty('--tx'); t.style.removeProperty('--ty'); t.style.removeProperty('--to'); });
      wstage.style.removeProperty('--ci'); wstage.style.removeProperty('--cr'); wCopy.style.removeProperty('--co'); wCopy.style.removeProperty('--cy'); return;
    }
    var r = walk.getBoundingClientRect(), span = r.height - Hs, p = clamp(-r.top / span, 0, 1);
    var s0 = Math.max(W / IW, Hs / IH);
    // opening: the photo grows from a framed card to the whole screen
    var o = smooth(p / .12);
    wstage.style.setProperty('--ci', ((1 - o) * Math.min(W, Hs) * .09).toFixed(1) + 'px');
    wstage.style.setProperty('--cr', ((1 - o) * 30).toFixed(1) + 'px');
    // the camera: focus point travels from the room's centre (the balcony side on phones) to the middle window, zooming in
    var wk = smooth((p - .1) / .7), Z = 1 + 1.9 * wk * wk + .25 * wk;
    var f0x = phone() ? 560 : 800, f0y = phone() ? 640 : 600;
    var fx = lerp(f0x, WC.x, smooth((p - .08) / .55)), fy = lerp(f0y, WC.y, smooth((p - .08) / .6));
    var sc = s0 * Z, cx = W / 2, cy = Hs / 2;
    // keep the image covering the stage whatever the focus
    var ox = cx - fx * sc, oy = cy - fy * sc;
    ox = clamp(ox, W - IW * sc, 0); oy = clamp(oy, Hs - IH * sc, 0);
    var tf = 'translate3d(' + ox.toFixed(2) + 'px,' + oy.toFixed(2) + 'px,0) scale(' + (sc * IW / 100).toFixed(5) + ')';
    [wBack, wSun].forEach(function (el) { el.style.width = '100px'; el.style.height = '75px'; el.style.transform = tf; });
    // the floor is nearer than the wall: it grows a touch faster around the same point
    var zf = 1 + .05 * wk, scf = sc * zf, oxf = cx - (cx - ox) * zf, oyf = cy - (cy - oy) * zf;
    wFloor.style.width = '100px'; wFloor.style.height = '75px';
    wFloor.style.transform = 'translate3d(' + oxf.toFixed(2) + 'px,' + oyf.toFixed(2) + 'px,0) scale(' + (scf * IW / 100).toFixed(5) + ')';
    // daylight slides across the floor tiles as the sun moves
    wSun.style.setProperty('--s1', (8 + p * 60).toFixed(1) + '%'); wSun.style.setProperty('--so', (.95 - smooth((p - .6) / .2) * .6).toFixed(2));
    // labels typed onto the photo, each held while its object is in frame
    var map = function (x, y) { return [ox + x * sc, oy + y * sc]; };
    tags.forEach(function (t, i) {
      var q = TAGP[i], pt = map(q[0], q[1]), vis = p > q[2] && p < q[3] && pt[0] > 8 && pt[0] < W - 140 && pt[1] > 80 && pt[1] < Hs - 40;
      t.style.setProperty('--tx', (pt[0] - 7).toFixed(1) + 'px'); t.style.setProperty('--ty', (pt[1] - 7).toFixed(1) + 'px'); t.style.setProperty('--to', vis ? 1 : 0);
    });
    // the copy rests over the photo, then steps aside as the window opens
    var cf = smooth((p - .5) / .1);
    wCopy.style.setProperty('--co', (1 - cf).toFixed(3)); wCopy.style.setProperty('--cy', (cf * 30).toFixed(1) + 'px');
    wCred.style.opacity = (1 - cf).toFixed(3);
    // the portal: Haifa appears inside the window glass, then the window opens to the whole screen
    var a = map(WIN.l, WIN.t), b = map(WIN.r, WIN.b), e = smooth((p - .68) / .26);
    var L = lerp(a[0], 0, e), T = lerp(a[1], 0, e), R = lerp(W - b[0], 0, e), B = lerp(Hs - b[1], 0, e);
    wview.style.setProperty('--vl', L.toFixed(1) + 'px'); wview.style.setProperty('--vt', T.toFixed(1) + 'px');
    wview.style.setProperty('--vr', R.toFixed(1) + 'px'); wview.style.setProperty('--vb', B.toFixed(1) + 'px');
    wview.style.setProperty('--vo', smooth((p - .56) / .1).toFixed(3));
  }

  // ---------------------------------------------------------------- FIELDS: the hillside parts into its depth layers; cards land
  var fields = $('[data-fields]'), lays = $$('.lay', fields), fcs = $$('.fc', fields), fphoto = $('.f-photo', fields);
  function fieldsFrame(H) {
    if (still()) { lays.forEach(function (l) { l.style.removeProperty('--ly'); l.style.removeProperty('--lsc'); }); fcs.forEach(function (c) { c.style.removeProperty('--fy'); c.style.removeProperty('--fs'); }); fphoto.style.removeProperty('--fd'); fphoto.style.removeProperty('--fo'); return; }
    var r = fields.getBoundingClientRect(), q = clamp(-r.top / (H * .9), 0, 1), e = smooth(q);
    var cfg = [[-.015, .02], [-.045, .05], [-.08, .12]];
    lays.forEach(function (l, i) { l.style.setProperty('--ly', (cfg[i][0] * H * e).toFixed(1) + 'px'); l.style.setProperty('--lsc', (1 + cfg[i][1] * e).toFixed(4)); });
    lays[2].style.transformOrigin = '50% 0'; lays[0].style.transformOrigin = '50% 100%';
    fphoto.style.setProperty('--fd', (e * .5).toFixed(3));
    fphoto.style.setProperty('--fo', r.top <= 1 ? 1 : 0);
    fcs.forEach(function (c, i) {
      var cr = c.getBoundingClientRect(), t = outq((H - cr.top + i * 20) / (H * .55));
      c.style.setProperty('--fy', ((1 - t) * 90).toFixed(1) + 'px'); c.style.setProperty('--fs', (.94 + .06 * t).toFixed(4));
    });
  }

  // ---------------------------------------------------------------- ROUTE: the red line fills from A to B and lights each stop
  var stops = $('[data-stops]'), stopEls = $$('.stop', stops);
  function routeFrame(H) {
    if (still()) { stops.style.setProperty('--fill', 1); stopEls.forEach(function (s) { s.classList.add('lit'); }); return; }
    var r = stops.getBoundingClientRect(), f = clamp((H * .62 - r.top) / r.height, 0, 1);
    stops.style.setProperty('--fill', f.toFixed(4));
    stopEls.forEach(function (s) { s.classList.toggle('lit', s.offsetTop + 16 <= f * r.height + 2); });
  }

  // ---------------------------------------------------------------- REVIEWS drift sideways with the scroll (desktop with a mouse)
  var revs = $('[data-reviews]'), rail = $('[data-rail]'), row = $('[data-row]');
  function revFrame(H) {
    if (still() || !fine.matches || innerWidth <= 860) { row.style.removeProperty('--rx'); return; }
    var r = revs.getBoundingClientRect(), p = clamp((H - r.top) / (H + r.height), 0, 1);
    var ov = Math.max(0, row.scrollWidth - rail.clientWidth);
    row.style.setProperty('--rx', ((rtl() ? 1 : -1) * smooth(p) * ov).toFixed(1) + 'px');
  }
  $$('[data-more]').forEach(function (b) { b.addEventListener('click', function () { var c = b.closest('.rv'); c.classList.toggle('open'); }); });
  function clampCheck() { $$('.rv').forEach(function (c) { var p = $('blockquote p:not([hidden])', c); var vis = $$('blockquote p', c).filter(function (x) { return x.offsetParent; })[0]; if (vis) c.classList.toggle('short', vis.scrollHeight <= vis.clientHeight + 2 && !c.classList.contains('open')); }); }

  // ---------------------------------------------------------------- nav gathers into a pill; the phone band appears after the hero
  var nav = $('[data-nav]'), band = $('[data-band]');
  function chrome() {
    var y = scrollY;
    nav.classList.toggle('pill', y > 140);
    band.classList.toggle('on', y > hero.offsetHeight * .55);
  }

  // ---------------------------------------------------------------- one scroll loop
  var ticking = false;
  function layout() {
    var H = innerHeight;
    walkFrame(H); fieldsFrame(H); routeFrame(H); revFrame(H); chrome();
  }
  function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(function () { ticking = false; layout(); }); }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', function () { layout(); clampCheck(); dots.size(); });

  // ---------------------------------------------------------------- the balcony sign: the live thing that becomes a WhatsApp message
  var sign = (function () {
    var I = [
      { he: 'למכירה', en: 'For sale', mhe: 'אני רוצה למכור', men: 'I would like to sell' },
      { he: 'להשכרה', en: 'For rent', mhe: 'אני רוצה להשכיר', men: 'I would like to rent out' },
      { he: 'מחפשים לקנות', en: 'Looking to buy', mhe: 'אני רוצה לקנות', men: 'I would like to buy' },
      { he: 'מחפשים לשכור', en: 'Looking to rent', mhe: 'אני רוצה לשכור', men: 'I would like to rent' }
    ];
    var k = 0, rooms = 4, hood = $('[data-hood]'), lab = $('[data-intent-label]'), out = $('[data-rooms-label]'), msgEl = $('[data-msg]'), send = $('[data-send]'), board = $('[data-sign-board]');
    var typing = 0;
    var num = function (r) { return String(r); };
    function roomsTxt(l) { return l === 'he' ? (rooms === 1 ? 'חדר אחד' : num(rooms) + ' חדרים') : (rooms === 1 ? '1 room' : num(rooms) + ' rooms'); }
    function message(l) {
      var it = I[k], h = hood.value.trim().replace(/\s+/g, ' ');
      if (l === 'he') return 'שלום דני, ' + it.mhe + ' דירת ' + (rooms === 1 ? 'חדר' : num(rooms) + ' חדרים') + (h ? ' ב' + h : '') + '. אשמח לפגישת היכרות.';
      return 'Hi Dani, ' + it.men + ' a ' + (rooms === 1 ? 'one-room' : num(rooms) + '-room') + ' flat' + (h ? ' in ' + h : '') + '. I would be glad to meet.';
    }
    function render(instant) {
      var l = root.lang;
      lab.textContent = I[k][l === 'he' ? 'he' : 'en'];
      out.textContent = roomsTxt(l);
      var m = message(l);
      send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
      cancelAnimationFrame(typing);
      if (instant || still()) { msgEl.textContent = m; return; }
      var t0 = performance.now();
      (function step(now) { var n = Math.floor((now - t0) / 14); msgEl.textContent = m.slice(0, n); if (n < m.length) typing = requestAnimationFrame(step); else msgEl.textContent = m; })(t0);
    }
    function nudge() { if (still() || !board.animate) return; board.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(' + (rtl() ? 3 : -3) + 'deg)' }, { transform: 'rotate(0deg)' }], { duration: 520, easing: 'cubic-bezier(.23,1,.32,1)', composite: 'add' }); }
    $('[data-intent-next]').addEventListener('click', function () {
      k = (k + 1) % I.length;
      if (!still() && lab.animate) {
        lab.animate([{ transform: 'rotateX(0deg)', opacity: 1 }, { transform: 'rotateX(90deg)', opacity: .2 }], { duration: 130, easing: 'cubic-bezier(.4,0,1,1)' }).onfinish = function () {
          render(); lab.animate([{ transform: 'rotateX(-90deg)', opacity: .2 }, { transform: 'rotateX(0deg)', opacity: 1 }], { duration: 160, easing: 'cubic-bezier(.23,1,.32,1)' });
        };
      } else render();
      nudge();
    });
    $$('[data-rooms]').forEach(function (b) { b.addEventListener('click', function () { rooms = clamp(rooms + (+b.dataset.rooms) * .5, 1, 8); render(); nudge(); }); });
    var hoodT = 0; hood.addEventListener('input', function () { clearTimeout(hoodT); hoodT = setTimeout(function () { render(); }, 260); });
    return { render: render };
  })();

  // ---------------------------------------------------------------- footer: the real logo rebuilt from its own white pixels; dots part under the hand
  var dots = (function () {
    var foot = $('[data-foot]'), cv = $('[data-logo-dots]'), img = $('[data-logo-src]'), c = cv.getContext('2d');
    var P = [], w = 0, h = 0, raf = 0, vis = false, mx = -999, my = -999, ok = false, t0 = 0, settled = false;
    function size() {
      if (!img.naturalWidth) return;
      var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; if (!w) return;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      try {
        var sc = document.createElement('canvas'); sc.width = Math.round(w); sc.height = Math.round(h);
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, sc.width, sc.height);
        var d = sx.getImageData(0, 0, sc.width, sc.height).data, step = w < 500 ? 3 : 4; P = [];
        for (var y = 0; y < sc.height; y += step) for (var x = 0; x < sc.width; x += step) {
          var k = (y * sc.width + x) * 4; if (d[k] > 200 && d[k + 1] > 170 && d[k + 2] > 170) P.push({ hx: x, hy: y, x: Math.random() * w, y: h + Math.random() * h * .6, vx: 0, vy: 0, dl: Math.random() * .5 });
        }
        P.s = step * .78; ok = P.length > 50; foot.classList.toggle('dots', ok && !still());
        t0 = performance.now(); settled = false;
      } catch (e) { ok = false; foot.classList.remove('dots'); }
    }
    function frame(now) {
      raf = 0; if (!ok) return;
      if (still()) { foot.classList.remove('dots'); return; }
      foot.classList.add('dots');
      var T = (now - t0) / 1000, moving = false, s = P.s;
      c.clearRect(0, 0, w, h); c.fillStyle = '#fff';
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        if (T < p.dl) { c.fillRect(p.x, p.y, s, s); moving = true; continue; }
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 3600) { var f = (3600 - d2) / 3600 * 3, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
        p.vx += (p.hx - p.x) * .07; p.vy += (p.hy - p.y) * .07; p.vx *= .8; p.vy *= .8; p.x += p.vx; p.y += p.vy;
        if (Math.abs(p.vx) + Math.abs(p.vy) > .05 || Math.abs(p.hx - p.x) > .3) moving = true;
        c.fillRect(p.x, p.y, s, s);
      }
      if (vis && (moving || mx > -999)) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    cv.parentNode.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; kick(); });
    cv.parentNode.addEventListener('pointerleave', function () { mx = my = -999; kick(); });
    watch(foot, function (v) { vis = v; if (v && !settled) { settled = true; P.forEach(function (p) { p.x = Math.random() * w; p.y = h + Math.random() * h * .6; }); t0 = performance.now(); } kick(); });
    function start() { size(); kick(); }
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok || img.naturalWidth) { size(); kick(); } } };
  })();

  // ---------------------------------------------------------------- opening: his card is laid down, then flies into the nav as the logo
  function ready() { hero.classList.add('ready'); }
  var op = $('[data-opening]');
  if (root.classList.contains('op-on')) {
    var done = false;
    var finish = function () {
      if (done) return; done = true;
      try { sessionStorage.setItem('cd-open', '1'); } catch (e) {}
      op.classList.add('gone'); ready();
      setTimeout(function () { root.classList.remove('op-on'); }, 520);
    };
    setTimeout(function () {
      var card = $('.op-card', op), br = $('.brand', nav).getBoundingClientRect(), cr = card.getBoundingClientRect();
      if (card.animate && br.width) {
        var dx = (br.left + br.width / 2) - (cr.left + cr.width / 2), dy = (br.top + br.height / 2) - (cr.top + cr.height / 2), s = br.width / cr.width;
        card.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')', opacity: 0 }], { duration: 480, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
      }
      setTimeout(finish, 380);
    }, 950);
    op.addEventListener('click', finish);
    setTimeout(finish, 1700);
  } else ready();

  texts(root.lang); hours(); sign.render(true); layout(); clampCheck();
  addEventListener('load', function () { layout(); clampCheck(); dots.size(); });
})();
