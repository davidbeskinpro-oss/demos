(function () {
  var root = document.documentElement, WA = '972524447666';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var outq = function (t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 4); };   // a soft-close: fast, then settling slowly
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var TITLE = { he: 'שלומי מטבחי יוקרה · נגרות מטבחים · שלמה בן יוסף 5, קריית אתא', en: 'Shlomi Luxury Kitchens · Kitchen carpentry · 5 Shlomo Ben Yosef St, Kiryat Ata' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור שלומי מטבחי יוקרה · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Shlomi Luxury Kitchens · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'שלומי מטבחי יוקרה', 'Shlomi Luxury Kitchens');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-visit]', 'יצירת קשר', 'Contact');
    aria('[data-t-rooms]', 'איזה חלל', 'Which room');
    aria('[data-t-shapes]', 'צורת המטבח', 'Kitchen shape');
    aria('[data-t-stage]', 'מצב', 'Stage');
    aria('[data-t-prev]', 'הביקורת הקודמת', 'Previous review');
    aria('[data-t-next]', 'הביקורת הבאה', 'Next review');
    aria('[data-t-call]', 'התקשרו לשלומי, 052-444-7666', 'Call Shlomi, 052-444-7666');
    aria('[data-t-wa]', 'וואטסאפ לשלומי', 'WhatsApp Shlomi');
    aria('[data-t-fname]', 'שלומי מטבחי יוקרה', 'Shlomi Luxury Kitchens');
    $$('.spot').forEach(function (s) { s.setAttribute('aria-label', s.dataset[l]); if (s.classList.contains('on')) $('.tag', s).textContent = s.dataset[l]; });
    $$('[data-decode]').forEach(function (d) { d.textContent = d.dataset[l]; d._done = false; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('sk-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(), y = scrollY, anchor = null;
    // keep the visitor on the section they were reading when the page changes height
    $$('main > section, .foot').some(function (s) { var r = s.getBoundingClientRect(); if (r.bottom > innerHeight * .3) { anchor = s; return true; } });
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('sk-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-led]').forEach(function (el) { el.classList.add('in'); });
    if (!on) { hero.classList.add('ready', 'built', 'done'); }
    layout(); write(true);
    if (anchor && anchor !== hero) anchor.scrollIntoView({ block: 'start' }); else scrollTo(0, y);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [7.5, 17], 1: [7.5, 17], 2: [7.5, 17], 3: [7.5, 17], 4: [7.5, 17], 5: [7.5, 13], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function always() { for (var k = 0; k < 7; k++) if (!H[k] || H[k][0] !== 0 || H[k][1] !== 24) return false; return true; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (always()) { open = true; txt = l ? 'פתוח 24/7' : 'Open 24/7'; }
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
    // the day bar: 6:00–20:00, today's open span and the hour it is now
    var day = $('[data-day]'), A = 6, B = 20, pct = function (x) { return (clamp((x - A) / (B - A), 0, 1) * 100).toFixed(2) + '%'; };
    var sp = $('[data-span]'), nw = $('[data-now]');
    if (t) { var a = (t[0] - A) / (B - A), b = (t[1] - A) / (B - A); sp.style.setProperty('--a', (rtl() ? (1 - b) : a) * 100 + '%'); sp.style.setProperty('--w', (b - a) * 100 + '%'); sp.hidden = false; } else sp.hidden = true;
    var x = clamp((n.h - A) / (B - A), 0, 1); nw.style.setProperty('--n', ((rtl() ? 1 - x : x) * 100).toFixed(2) + '%');
    day.setAttribute('title', l ? 'היום, 6:00–20:00' : 'Today, 6:00–20:00');
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? '<span dir="ltr">' + (t[0] === 0 && t[1] === 24 ? '24h' : hhmm(t[0]) + '–' + hhmm(t[1])) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  $$('.v-bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', i * 70 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-led]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // letters: the hero name and the footer name
  function split(sp, start) {
    var i = start || 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
    return i;
  }
  $$('[data-split] .ln > span[lang]').forEach(function (sp) { split(sp, sp.closest('.ln').previousElementSibling ? 6 : 0); });
  $$('[data-fnin] > span[lang]').forEach(function (sp) { split(sp, 0); });

  // glyph decode: a label settles out of loose letters
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' };
  function decode(el, text, ms) {
    if (still() || !text) { el.textContent = text; return; }
    var pool = GL[he() ? 'he' : 'en'], t0 = performance.now(), dur = ms || 700;
    cancelAnimationFrame(el._raf);
    (function st(t) {
      var k = clamp((t - t0) / dur, 0, 1), fixed = Math.floor(k * text.length), s = text.slice(0, fixed);
      for (var j = fixed; j < text.length; j++) s += text[j] === ' ' || text[j] === ',' ? text[j] : pool[Math.floor(Math.random() * pool.length)];
      el.textContent = s;
      if (k < 1) el._raf = requestAnimationFrame(st);
    })(t0);
  }

  var hero = $('[data-hero]'), nav = $('[data-nav]'), media = $('[data-hmedia]'), photo = $('.h-photo', media);

  // ---------------------------------------------------------------- hero: the fronts are hung over the drawing, strip by strip
  var STR = 8, strips = $('[data-strips]');
  for (var s = 0; s < STR; s++) {
    var im = document.createElement('img'); im.src = photo.getAttribute('src'); im.alt = ''; im.width = 1600; im.height = 1158; im.decoding = 'async';
    strips.appendChild(im);
  }
  function stripLayout() {
    $$('img', strips).forEach(function (im, i) {
      var k = rtl() ? STR - 1 - i : i;               // the first strip hung is at the reading start
      var l = i / STR * 100, r = 100 - (i + 1) / STR * 100;
      im.style.setProperty('--l', Math.max(0, l - .15).toFixed(3) + '%');
      im.style.setProperty('--r', Math.max(0, r - .15).toFixed(3) + '%');
      im.style.setProperty('--d', (k * 95) + 'ms');
    });
  }

  // the lens onto the drawing: follows the hand; drifts by itself on touch screens
  var lens = { x: .32, y: .42, tx: .32, ty: .42, r: 0, tr: 0, user: false, t0: 0 }, ring = $('[data-ring]'), heroOn = true, lraf = 0;
  var spots = $$('.spot');
  function coverMap() {   // where an image point lands on the hero, for object-fit cover with the current object-position
    var W = media.clientWidth, Hh = media.clientHeight, iw = 1600, ih = 1158, sc = Math.max(W / iw, Hh / ih), dw = iw * sc, dh = ih * sc;
    var pos = getComputedStyle(media).getPropertyValue('--hp').trim().split(/\s+/), px = parseFloat(pos[0]) / 100, py = parseFloat(pos[1] || '50') / 100;
    return { W: W, H: Hh, ox: (W - dw) * px, oy: (Hh - dh) * py, dw: dw, dh: dh };
  }
  function placeSpots() {
    var m = coverMap();
    spots.forEach(function (sp) {
      var x = m.ox + m.dw * +sp.dataset.x, y = m.oy + m.dh * +sp.dataset.y;
      sp._x = x; sp._y = y; sp.style.left = x + 'px'; sp.style.top = y + 'px';
      sp.classList.toggle('flip', rtl() ? x < m.W * .4 : x > m.W * .6);
      sp.hidden = x < 16 || x > m.W - 16 || y < 90 || y > m.H * (phone() ? .4 : .5);   // never under the headline
    });
  }
  function tagSpot(sp, on) {
    if (on === sp.classList.contains('on')) return;
    sp.classList.toggle('on', on);
    var tag = $('.tag', sp); if (on) decode(tag, sp.dataset[he() ? 'he' : 'en'], 520); else tag.textContent = '';
  }
  function lensFrame(t) {
    lraf = 0;
    var W = media.clientWidth, Hh = media.clientHeight, calm = still();
    if (calm) { lens.x = phone() ? .55 : .28; lens.y = phone() ? .22 : .28; lens.r = phone() ? 62 : 112; }
    else {
      if (!lens.user) {   // a slow figure-eight over the room, like a lamp being moved over a drawing
        var T = (t - lens.t0) / 1000;
        // it keeps above the name and away from the copy's side
        var cx = phone() ? .5 : (rtl() ? .4 : .6);
        lens.tx = cx + Math.sin(T * .32) * (phone() ? .26 : .26); lens.ty = (phone() ? .24 : .3) + Math.sin(T * .64) * (phone() ? .07 : .1);
      }
      lens.x = lerp(lens.x, lens.tx, .08); lens.y = lerp(lens.y, lens.ty, .08); lens.r = lerp(lens.r, lens.tr, .07);
    }
    var lx = lens.x * W, ly = lens.y * Hh;
    media.style.setProperty('--lx', lx.toFixed(1) + 'px'); media.style.setProperty('--ly', ly.toFixed(1) + 'px'); media.style.setProperty('--lr', lens.r.toFixed(1) + 'px');
    spots.forEach(function (sp) { if (sp._pinned || sp.hidden) return; var d = Math.hypot(sp._x - lx, sp._y - ly); tagSpot(sp, calm || d < lens.r + 30); });
    if (!calm && heroOn) lraf = requestAnimationFrame(lensFrame);
  }
  function kickLens() { if (!lraf) lraf = requestAnimationFrame(lensFrame); }
  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || still()) return;
    var r = media.getBoundingClientRect(); lens.user = true; lens.tx = (e.clientX - r.left) / r.width; lens.ty = (e.clientY - r.top) / r.height;
  });
  hero.addEventListener('pointerleave', function () { lens.user = false; lens.t0 = performance.now() - 2000; });
  media.addEventListener('pointerdown', function (e) {   // a tap moves the lens there
    if (still() || e.target.closest('.spot')) return;
    var r = media.getBoundingClientRect(); lens.user = e.pointerType === 'mouse'; lens.tx = (e.clientX - r.left) / r.width; lens.ty = (e.clientY - r.top) / r.height;
    if (!lens.user) { lens.hold = performance.now(); lens.user = true; setTimeout(function () { if (performance.now() - lens.hold >= 2900) { lens.user = false; lens.t0 = performance.now(); } }, 3000); }
  });
  spots.forEach(function (sp) { sp.addEventListener('click', function () { sp._pinned = !sp.classList.contains('on'); tagSpot(sp, sp._pinned); }); });

  function build() {
    if (still()) { hero.classList.add('ready', 'built', 'done'); lens.r = 120; kickLens(); return; }
    hero.classList.add('ready');                                   // the drawing wipes in, the name arrives letter by letter
    setTimeout(function () { hero.classList.add('built'); }, 650); // the fronts are hung strip by strip
    setTimeout(function () { hero.classList.add('done'); lens.t0 = performance.now(); lens.tr = phone() ? 66 : 118; kickLens(); }, 650 + 95 * STR + 950 + 60);
  }

  // ---------------------------------------------------------------- work: doors swing shut over each other
  var work = $('[data-doors]'), doors = $$('[data-door]'), wdots = $$('[data-wdots] i'), lastLanded = -1;
  function doorsUpdate(calm) {
    if (calm) { doors.forEach(function (d) { d.style.transform = ''; d.style.removeProperty('--sh'); d.style.zIndex = ''; }); doors.forEach(function (d) { var t = $('[data-decode]', d); if (!t._done) { t._done = true; t.textContent = t.dataset[root.lang]; } }); return; }
    var r = work.getBoundingClientRect(), total = Math.max(1, r.height - innerHeight), p = clamp(-r.top / total, 0, 1) * (doors.length - 1);
    var landed = 0;
    doors.forEach(function (d, i) {
      d.style.zIndex = i + 1;
      if (i === 0) { d.style.transform = ''; return; }
      var e = outq(clamp(p - (i - 1), 0, 1) / .92), ang = (1 - e) * 94, sign = d.dataset.hinge === 'l' ? -1 : 1;
      d.style.transform = e <= 0 ? 'rotateY(' + (sign * 94) + 'deg)' : 'rotateY(' + (sign * ang).toFixed(2) + 'deg)';
      d.style.visibility = e <= 0 ? 'hidden' : '';
      d.style.setProperty('--sh', ((1 - e) * .75).toFixed(3));                  // a swinging door is in its own shadow
      var under = doors[i - 1]; if (e > 0 && e < 1) under.style.setProperty('--sh', (e * .4).toFixed(3));  // and darkens the room it closes over
      else if (e >= 1) under.style.setProperty('--sh', '0');
      if (e > .96) landed = i;
    });
    if (p <= 0) doors[0].style.setProperty('--sh', '0');
    wdots.forEach(function (w, i) { w.classList.toggle('on', i === landed); });
    if (landed !== lastLanded) { lastLanded = landed; var t = $('[data-decode]', doors[landed]); decode(t, t.dataset[root.lang], 650); }
  }

  // ---------------------------------------------------------------- details: a warm light under the hand
  var craft = $('#craft');
  watch(craft, function (v) { craft.classList.toggle('on', v); });
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = t.getBoundingClientRect(); t.classList.add('hot'); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
    t.addEventListener('pointerleave', function () { t.classList.remove('hot'); t.style.removeProperty('--mx'); t.style.removeProperty('--my'); });
  });

  // ---------------------------------------------------------------- plan: the live thing
  var plan = $('[data-plan]'), sheet = $('[data-sheet]'), rooms = $$('[data-room]'), shapesBox = $('[data-shapes]'), shapes = $$('[data-shape]'), stages = $$('[data-stage]'), runner = $('.runner');
  var steps = $$('[data-step]'), groups = $$('[data-g]');
  var sel = { room: 'kitchen', shape: 'l', stage: 'new' };
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function radio(list, btn) { list.forEach(function (x) { x.setAttribute('aria-checked', x === btn ? 'true' : 'false'); }); }
  function drawBoard() {
    groups.forEach(function (g) { g.classList.toggle('on', g.dataset.g === sel.room); });
    var sh = sel.shape, has = { ra: true, rb: sh === 'l' || sh === 'u', rc: sh === 'u', ri: sh === 'isl' };
    ['ra', 'rb', 'rc', 'ri'].forEach(function (k) { $('.' + k).classList.toggle('hid', !has[k]); });
    var k = sel.room === 'kitchen'; shapesBox.classList.toggle('off', !k); shapes.forEach(function (b) { b.disabled = !k; });
    runner.classList.toggle('r2', sel.stage === 'renew');
  }
  rooms.forEach(function (b) { b.addEventListener('click', function () { radio(rooms, b); sel.room = b.dataset.room; lightStep(0); drawBoard(); write(); }); });
  shapes.forEach(function (b) { b.addEventListener('click', function () { radio(shapes, b); sel.shape = b.dataset.shape; lightStep(1); drawBoard(); write(); }); });
  stages.forEach(function (b) { b.addEventListener('click', function () { radio(stages, b); sel.stage = b.dataset.stage; lightStep(1); drawBoard(); write(); }); });
  var SHAPE = { he: { i: ' לאורך קיר אחד', l: ' בצורת ר', u: ' בצורת ח', isl: ' עם אי' }, en: { i: ' along one wall', l: ', L-shaped', u: ', U-shaped', isl: ' with an island' } };
  function phrase(l) {
    var s = sel.stage === 'new', sh = SHAPE[l][sel.shape];
    if (l === 'he') return {
      kitchen: s ? 'מטבח' + sh + ' לדירה חדשה' : 'חידוש של מטבח' + sh,
      bath: s ? 'ארונות אמבטיה לדירה חדשה' : 'חידוש ארונות האמבטיה',
      laundry: s ? 'חדר כביסה לדירה חדשה' : 'חידוש חדר הכביסה',
      wardrobe: s ? 'ארון קיר לדירה חדשה' : 'ארון קיר חדש במקום הישן',
      tv: s ? 'קיר טלוויזיה לדירה חדשה' : 'קיר טלוויזיה חדש בסלון',
      home: s ? 'נגרות לכל הבית, לדירה חדשה' : 'נגרות לכל הבית, במסגרת שיפוץ'
    }[sel.room];
    return {
      kitchen: s ? 'a kitchen' + sh + ' for a new home' : 'renewing a kitchen' + sh,
      bath: s ? 'bathroom cabinets for a new home' : 'renewing my bathroom cabinets',
      laundry: s ? 'a laundry room for a new home' : 'renewing my laundry room',
      wardrobe: s ? 'a wardrobe for a new home' : 'a new wardrobe to replace the old one',
      tv: s ? 'a TV wall for a new home' : 'a new TV wall in the living room',
      home: s ? 'carpentry for the whole home, for a new home' : 'carpentry for the whole home, as part of a renovation'
    }[sel.room];
  }
  function compose() {
    var l = he() ? 'he' : 'en';
    return l === 'he' ? 'שלום שלומי, הגעתי דרך האתר. אשמח לדבר איתך על ' + phrase(l) + '.'
                      : 'Hi Shlomi, I found you through the website. I’d like to talk to you about ' + phrase(l) + '.';
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
      var n = Math.floor((t - t0) / 15);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-order]'), function (v) { if (v && !chatSeen) { chatSeen = true; if (!still()) { shown = ''; msgEl.textContent = ''; } write(); } }, { threshold: .4 });
  watch(plan, function (v) { if (v) lightStep(0); }, { rootMargin: '-30% 0px -30% 0px' });
  $('[data-send]').addEventListener('pointerenter', function () { lightStep(2); });
  $('[data-send]').addEventListener('focus', function () { lightStep(2); });
  $('[data-send]').addEventListener('click', function () { lightStep(2); });

  // ---------------------------------------------------------------- reviews: the sample fan
  var revs = $('[data-revs]'), sws = $$('.sw'), fanA = 0, fanT = 0, fanRaf = 0, fanUser = null;
  function fanDraw() {
    sws.forEach(function (sw, i) {
      var d = i - fanA, ad = Math.abs(d), cd = clamp(d, -2.2, 2.2);   // beyond two samples they wait stacked behind
      sw.style.transform = 'rotate(' + (cd * (phone() ? 7 : 11) * (rtl() ? -1 : 1)).toFixed(2) + 'deg) translateY(' + (Math.min(ad, 3) * 8).toFixed(1) + 'px)';
      sw.style.zIndex = String(20 - Math.round(ad * 2));
      sw.style.filter = ad > .5 ? 'brightness(' + (1 - Math.min(ad, 3) * .14).toFixed(3) + ')' : '';
      sw.setAttribute('aria-hidden', ad > .5 ? 'true' : 'false');
    });
  }
  function fanStep() { fanRaf = 0; fanA = lerp(fanA, fanT, .14); if (Math.abs(fanA - fanT) < .002) fanA = fanT; fanDraw(); if (fanA !== fanT) fanRaf = requestAnimationFrame(fanStep); }
  function fanGo(t) { fanT = clamp(t, 0, sws.length - 1); if (still()) { fanA = fanT; fanDraw(); return; } if (!fanRaf) fanRaf = requestAnimationFrame(fanStep); }
  $$('[data-fan]').forEach(function (b) { b.addEventListener('click', function () {
    var n = clamp(Math.round(fanT) + (+b.dataset.fan), 0, sws.length - 1);
    // with motion on, the scroll drives the fan: move the page to that sample
    if (!still()) { var r = revs.getBoundingClientRect(), total = r.height - innerHeight; fanUser = n; scrollTo({ top: scrollY + r.top + total * (n / (sws.length - 1)) * .92 + 2, behavior: 'smooth' }); }
    fanGo(n);
  }); });

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
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { setTimeout(function () { roll(o, true); }, 30); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- FAQ photo leans toward the hand
  var tilt = $('[data-tilt]');
  tilt.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || still()) return;
    var r = tilt.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    tilt.style.setProperty('--ry', ((x - .5) * 7).toFixed(2) + 'deg'); tilt.style.setProperty('--rx', ((.5 - y) * 6).toFixed(2) + 'deg');
    tilt.style.setProperty('--sx', (x * 100).toFixed(1) + '%'); tilt.style.setProperty('--sy', (y * 100).toFixed(1) + '%');
  });
  tilt.addEventListener('pointerleave', function () { ['--rx', '--ry'].forEach(function (k) { tilt.style.setProperty(k, '0deg'); }); });

  // ---------------------------------------------------------------- footer name fits its width
  var fname = $('[data-fname]'), fnin = $('[data-fnin]');
  function fitName() { fnin.style.fontSize = '100px'; var w = fnin.getBoundingClientRect().width, avail = fname.clientWidth; if (w > 0) fnin.style.fontSize = Math.min(220, Math.floor(100 * avail / w * .98)) + 'px'; }
  watch(fname, function (v) { if (v) fname.classList.add('rise'); }, { threshold: .2 });

  // ---------------------------------------------------------------- one scroll loop
  var drawer = $('[data-drawer]'), pled = $('[data-pled]'), minis = $('[data-minis]'), foot = $('[data-foot]');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // hero: covered by the first door, it sinks back a little
    var hp = clamp(scrollY / vh, 0, 1);
    if (!calm) { media.style.transform = 'scale(' + (1 + hp * .06).toFixed(4) + ')'; hero.style.filter = hp > 0 ? 'brightness(' + (1 - hp * .5).toFixed(3) + ')' : ''; }
    else { media.style.transform = ''; hero.style.filter = ''; }
    var on = calm || scrollY < vh * 1.05; if (on !== heroOn) { heroOn = on; if (on) kickLens(); }
    hero.style.visibility = !calm && scrollY > vh * 2.2 ? 'hidden' : '';
    doorsUpdate(calm);
    // the drawing sheet is laid down on the bench
    var sr = sheet.getBoundingClientRect(), sp = calm ? 1 : smooth((vh - sr.top) / (vh * .75));
    sheet.style.transform = calm || sp >= 1 ? '' : 'translateY(' + ((1 - sp) * 70).toFixed(1) + 'px) rotate(' + ((1 - sp) * (rtl() ? 2.2 : -2.2)).toFixed(2) + 'deg)';
    // the fan turns with the scroll
    if (!calm) { var fp = prog(revs); var t = fp / .92 * (sws.length - 1); if (fanUser !== null && Math.abs(t - fanUser) < .35) fanUser = null; if (fanUser === null) fanGo(t); }
    // the drawer pulls out and settles
    var dr = drawer.getBoundingClientRect(), dp = calm ? 1 : outq((vh - dr.top) / (vh * .85));
    drawer.style.transform = calm || dp >= 1 ? '' : 'translateY(' + ((1 - dp) * -60).toFixed(1) + 'px) scale(' + (.93 + dp * .07).toFixed(4) + ')';
    // the plinth's LED lights from end to end
    var fr = foot.getBoundingClientRect(), lp = calm ? 1 : smooth((vh - fr.top) / (vh * .6));
    pled.style.setProperty('--pl', lp.toFixed(3));
    // the little fronts step aside when the footer or the order sheet's own button is on screen
    minis.classList.toggle('hide', fr.top < vh - 40 || scrollY < 120);
  }

  function layout() { stripLayout(); placeSpots(); fitName(); kickLens(); tick(); if (still()) { fanA = fanT = Math.round(fanT); fanDraw(); } }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); drawBoard(); write(true); layout(); fanDraw();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { build(); fitName(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 280);
  addEventListener('load', function () { placeSpots(); fitName(); tick(); });
})();
