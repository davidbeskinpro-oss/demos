(function () {
  var root = document.documentElement, WA = '972524707710';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'ליליה · בריאות וטיפוח כף הרגל והציפורן · ורדיה 12, חיפה', en: 'Liliya · Foot health & nail care · 12 Vardia St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור המרכז לבריאות וטיפוח כף הרגל והציפורן Liliya · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Liliya Foot Health & Nail Care Centre · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'ליליה, בריאות וטיפוח כף הרגל והציפורן', 'Liliya, foot health and nail care');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-visit]', 'יצירת קשר', 'Contact');
    aria('[data-t-spots]', 'מה מציק', 'What bothers you');
    aria('[data-t-call]', 'התקשרו לליליה, 052-470-7710', 'Call Liliya, 052-470-7710');
    aria('[data-t-wa]', 'וואטסאפ לליליה', 'WhatsApp Liliya');
    spots.forEach(function (s) { var t = s.dataset[l]; s.setAttribute('aria-label', t); $('.sl', s).textContent = t; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ll240-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('ll240-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-odo]').forEach(function (o) { roll(o, true); });
    layout(); motes.kick(); care.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 18], 1: [9, 18], 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function always(t) { return t && t[0] === 0 && t[1] >= 24; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (always(t)) { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
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
      var val = always(t) ? (l ? '24 שעות' : '24 hours') : t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
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

  // ---------------------------------------------------------------- letters: the hero headline (both inks) and the spread quote
  function splitWords(sp, start) {
    var i = start;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
    return i;
  }
  $$('[data-split]').forEach(function (ink) { $$('.ln', ink).forEach(function (ln, k) { $$(':scope > span[lang]', ln).forEach(function (sp) { splitWords(sp, k ? 9 : 0); }); }); });
  $$('[data-spread] p').forEach(function (p) { var i = 0; $$('.sl-row > span', p).forEach(function (sp) { i = splitWords(sp, i); }); });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), title = $('[data-title]');

  // the two fields of the room meet inside the headline: the seam crosses line two at its upper third
  function seam() {
    var a = $('.ink-a', title), lns = $$('.ln', a), l1 = lns[0].offsetHeight, l2 = lns[1].offsetHeight, y = lns[1].offsetTop - lns[0].offsetTop + l2 * .36, hh = a.offsetHeight, gap = 0;
    if (innerWidth <= 860) { y = hh; gap = 18; }   // small screens: the seam moves below the headline so both lines read in one ink
    a.style.clipPath = 'inset(0 0 ' + (hh - y).toFixed(1) + 'px 0)';
    $('.ink-b', title).style.clipPath = 'inset(' + y.toFixed(1) + 'px 0 0 0)';
    var top = 0, el = title; while (el && el !== hero) { top += el.offsetTop; el = el.offsetParent; }
    hero.style.setProperty('--seam', (top + y + gap).toFixed(1) + 'px');
  }

  // ---------------------------------------------------------------- the pouch: film light under the hand, a gentle tilt, dust in the lamp's light
  var pouch = $('[data-pouch]'), win = $('.win', pouch);
  function tilt(x, y) { // x,y in -1..1
    if (still()) { pouch.style.transform = ''; return; }
    pouch.style.transform = 'rotate(-2.5deg) rotateY(' + (x * 7).toFixed(2) + 'deg) rotateX(' + (-y * 6).toFixed(2) + 'deg)';
    pouch.style.setProperty('--sx', (x * 22 - 4).toFixed(1) + '%'); pouch.style.setProperty('--sy', (y * 14).toFixed(1) + '%');
  }
  if (finePointer) {
    hero.addEventListener('pointermove', function (e) { var r = pouch.getBoundingClientRect(); tilt(clamp((e.clientX - r.left - r.width / 2) / (r.width * .9), -1, 1), clamp((e.clientY - r.top - r.height / 2) / (r.height * .9), -1, 1)); });
    hero.addEventListener('pointerleave', function () { tilt(0, 0); });
  }
  var motes = (function () {
    var cv = $('[data-motes]'), c = cv.getContext('2d'), P = [], w = 0, h = 0, raf = 0, vis = true, t0 = performance.now();
    function size() { var d = Math.min(2, devicePixelRatio || 1); w = win.clientWidth; h = win.clientHeight; cv.width = w * d; cv.height = h * d; c.setTransform(d, 0, 0, d, 0, 0);
      P = []; for (var i = 0; i < 46; i++) P.push({ x: Math.random(), y: Math.random(), r: .6 + Math.random() * 1.8, s: .2 + Math.random() * .8, ph: Math.random() * 6.28 }); }
    function frame(t) {
      raf = 0; c.clearRect(0, 0, w, h); if (still()) return;
      var T = (t - t0) / 1000, lx = w * .96, ly = h * .3;
      for (var i = 0; i < P.length; i++) {
        var p = P[i]; p.y -= p.s * .00045; p.x += Math.sin(T * .6 + p.ph) * .00035; if (p.y < -.02) { p.y = 1.02; p.x = Math.random(); }
        var x = p.x * w, y = p.y * h, d = Math.hypot(x - lx, y - ly) / (w * .75), a = clamp(1 - d, 0, 1) * (.35 + .35 * Math.sin(T * 1.7 + p.ph) + .3);
        if (a < .03) continue;
        c.globalAlpha = a; c.fillStyle = '#fff8ea'; c.beginPath(); c.arc(x, y, p.r, 0, 6.283); c.fill();
      }
      c.globalAlpha = 1;
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); }
    watch(hero, function (v) { vis = v; kick(); });
    return { size: size, kick: kick };
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
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .4 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- the frosted door: cursor moves the room a little
  var door = $('[data-door]'), dimg = $('.d-img', door);
  if (finePointer) {
    door.addEventListener('pointermove', function (e) { if (still()) return; var r = door.getBoundingClientRect(); dimg.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5) * -18 + 'px'); dimg.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5) * -14 + 'px'); });
    door.addEventListener('pointerleave', function () { dimg.style.setProperty('--px', '0px'); dimg.style.setProperty('--py', '0px'); });
  }

  // ---------------------------------------------------------------- treatments: the active name brings its own living picture
  var care = (function () {
    var rows = $$('[data-row]'), vs = $$('[data-stage] .v'), active = -1, hoverI = -1, vis = false, raf = 0, t0 = 0;
    var fungus = $('[data-fungus]'), healthy = $('[data-healthy]'), cut = $('[data-cut]'), scan = $('[data-scan]'), zones = $$('[data-sole] .zones circle');
    function set(i) {
      if (i === active) return; active = i;
      rows.forEach(function (r, k) { r.classList.toggle('on', k === i); });
      vs.forEach(function (v, k) { v.classList.toggle('on', k === i); });
      t0 = performance.now(); kick();
    }
    function nail(t) { // one cycle: the healthy plate grows out from the cuticle and pushes the discoloured part to the free edge, where it is trimmed
      var g = smooth(t / .86), grow = g * 132, top = 64, fb = 150 - grow, ht = 196 - grow;
      fungus.setAttribute('y', top); fungus.setAttribute('height', Math.max(0, fb - top).toFixed(1));
      healthy.setAttribute('y', Math.max(top, ht).toFixed(1)); healthy.setAttribute('height', (196 - Math.max(top, ht)).toFixed(1));
      var trim = (t > .3 && t < .38) || (t > .62 && t < .7); cut.style.opacity = trim ? 1 : 0;
    }
    function sole(t) { var y = 6 + t * 280; scan.setAttribute('y', y.toFixed(1)); zones.forEach(function (z) { var zy = +z.getAttribute('cy'); z.classList.toggle('lit', y > zy - 30 && y < zy + 60); }); }
    function rest() { nail(1); sole(.97); zones.forEach(function (z) { z.classList.add('lit'); }); scan.style.opacity = 0; }
    function frame(t) {
      raf = 0;
      if (still()) { rest(); return; }
      scan.style.opacity = '';
      var p = ((t - t0) / 4600) % 1;
      if (active === 2) nail(p); else if (active === 3) sole(((t - t0) / 3000) % 1);
      if (vis && (active === 2 || active === 3)) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    rows.forEach(function (r, k) {
      r.addEventListener('pointerenter', function () { if (finePointer) { hoverI = k; set(k); } });
      r.addEventListener('pointerleave', function () { if (finePointer) { hoverI = -1; scroll(); } });
      r.addEventListener('focus', function () { set(k); });
      r.addEventListener('click', function () { set(k); });
    });
    function scroll() {
      if (hoverI >= 0) return;
      var mid = innerHeight * (innerWidth <= 860 ? .62 : .5), best = 0, bd = 1e9;
      rows.forEach(function (r, k) { var b = r.getBoundingClientRect(), d = Math.abs(b.top + b.height / 2 - mid); if (d < bd) { bd = d; best = k; } });
      set(best);
    }
    watch($('[data-care]'), function (v) { vis = v; kick(); });
    set(0); nail(0); sole(0);
    return { scroll: scroll, kick: kick };
  })();

  // ---------------------------------------------------------------- the note to Liliya: tap the foot, choose, and it writes itself
  var spots = $$('[data-spot]'), steps = $$('[data-step]'), msgEl = $('[data-msg]'), send = $('[data-send]'), shown = '', typing = 0, seen = false;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  spots.forEach(function (s) {
    s.addEventListener('click', function () { s.setAttribute('aria-pressed', s.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); lightStep(0); write(); });
  });
  $$('.opt input').forEach(function (i) { i.addEventListener('change', function () { lightStep(1); write(); }); });
  send.addEventListener('pointerenter', function () { lightStep(2); });
  send.addEventListener('focus', function () { lightStep(2); });
  var WHAT = { he: ['לפדיקור רפואי', 'לפדיקור', 'לאבחון וייעוץ'], en: ['a medical pedicure', 'a pedicure', 'a check and some advice'] };
  var WHEN = { he: ['בבוקר', 'בצהריים', 'אחר הצהריים', 'ביום שישי'], en: ['in the morning', 'around midday', 'in the afternoon', 'on Friday'] };
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), k = l ? 'he' : 'en', what = +$('input[name=what]:checked').value, when = +$('input[name=when]:checked').value;
    var picked = spots.filter(function (s) { return s.getAttribute('aria-pressed') === 'true'; }).map(function (s) { return s.dataset[k]; });
    if (l) return 'שלום ליליה, אשמח לקבוע תור ' + WHAT.he[what] + '.' + (picked.length ? ' מה מציק לי: ' + list(picked, true) + '.' : '') + ' נוח לי ' + WHEN.he[when] + '.';
    return 'Hi Liliya, I’d like to book ' + WHAT.en[what] + '.' + (picked.length ? ' What bothers me: ' + list(picked, false) + '.' : '') + ' A good time for me is ' + WHEN.en[when] + '.';
  }
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !seen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 14);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  function placeSpots() { spots.forEach(function (s) { s.classList.toggle('flip', parseFloat(s.style.getPropertyValue('--x')) < 50); }); }
  watch($('[data-card]'), function (v) { if (v && !seen) { seen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .35 });

  // ---------------------------------------------------------------- scroll-linked pieces
  var spreadEl = $('[data-spread]'), pad = $('[data-pad]'), sheets = $$('.sheet', pad), RR = [-3, 2.5, -2, 1.5];
  sheets.forEach(function (s, i) { s.style.zIndex = sheets.length - i; });
  var orch = $('[data-orch] img'), vband = $('[data-vband]'), vphoto = $('[data-vphoto]'), foot = $('[data-foot]'), blocks = $$('.bl-set i'), toneEls = $$('[data-tone]');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function enter(el, span) { var r = el.getBoundingClientRect(); return (innerHeight - r.top) / (span || innerHeight); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    var dark = false; toneEls.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= 40 && r.bottom > 40) dark = s.dataset.tone === 'dark'; });
    nav.classList.toggle('on-dark', dark);
    // the pouch peels open as the hero leaves
    var hr = hero.getBoundingClientRect(), peel = calm ? 1 : Math.max(.13, smooth(-hr.top / (hr.height * .45) + .13));
    pouch.style.setProperty('--peel', peel.toFixed(3)); pouch.style.setProperty('--fo', peel > .01 && peel < .99 ? 1 : 0);
    if (!finePointer && !calm) pouch.style.setProperty('--sx', (-20 + clamp(-hr.top / vh, 0, 1) * 60).toFixed(1) + '%');
    // the frosted door slides open, then the camera walks in
    var op = calm ? 1 : smooth((enter(door, vh * .9) - .25) / .7);
    door.style.setProperty('--open', op.toFixed(3));
    dimg.style.setProperty('--dz', calm ? 1 : (1.2 - op * .2).toFixed(3));
    care.scroll();
    // the quote fills in letter by letter
    var chs = $$('.ch', $(he() ? 'p[lang=he]' : 'p[lang=en]', spreadEl)), fp = calm ? 1 : smooth((enter(spreadEl, vh * .8) - .25) / .75), nf = Math.round(fp * chs.length);
    chs.forEach(function (c, i) { c.classList.toggle('f', i < nf); });
    // the pad: one sheet comes off at a time
    var pp = calm ? 0 : clamp((enter(pad, vh + pad.offsetHeight) - .3) / .62, 0, 1), seg = 1 / (sheets.length - 1);
    sheets.forEach(function (s, i) {
      if (calm) return;
      var t = i === sheets.length - 1 ? 0 : smooth((pp - i * seg) / (seg * .9)), side = rtl() ? -1 : 1;
      s.style.transform = 'translateX(' + (side * t * 112).toFixed(1) + '%) translateY(' + (t * -6).toFixed(1) + '%) rotate(' + (lerp(RR[i] * .4, side * 14, t)).toFixed(2) + 'deg)';
      s.style.opacity = (1 - smooth((t - .55) / .45)).toFixed(3);
    });
    // orchids drift a little inside their arch
    if (!calm) orch.style.setProperty('--oy', ((enter(orch, vh + 400) - .5) * -40).toFixed(1) + 'px');
    // the round Haifa picture opens into the band behind the hours and map
    var cp = calm ? 1 : smooth((enter(vband, vh * .95) - .05) / .8);
    vphoto.style.setProperty('--cr', (8 + cp * 135).toFixed(1) + '%');
    // the name rises block by block
    var fr = enter(foot, foot.offsetHeight * .9);
    blocks.forEach(function (b, i) { b.style.setProperty('--up', calm ? 1 : smooth((fr - .1 - i * .07) / .45).toFixed(3)); });
  }

  function layout() { seam(); motes.size(); placeSpots(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; seam(); requestAnimationFrame(function () { hero.classList.add('ready'); motes.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { layout(); });
})();
