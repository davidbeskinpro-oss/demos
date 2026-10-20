(function () {
  var root = document.documentElement, WA = '972522613721';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: 'חיים דהן · שיפוצים והשבחה · השחף 2, חיפה', en: 'Haim Dahan · Renovation & Home Improvement · Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור חיים דהן · זה אינו האתר הרשמי של העסק', en: 'Concept demo made for Haim Dahan · not the business’s official website' };
  var STAR = '<svg viewBox="0 0 92 16" aria-hidden="true">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; }).join('') + '</svg>';
  $$('[data-stars]').forEach(function (s) { s.innerHTML = STAR; });

  // ---------------------------------------------------------------- language
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    try { localStorage.setItem('hd-lang', l); } catch (e) {}
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { var el = $(sel); if (el) el.setAttribute('aria-label', l === 'he' ? h : e); };
    aria('[data-pill]', 'ראשי', 'Main');
    aria('[data-tag-call]', 'התקשרו לחיים, 052-261-3721', 'Call Haim, 052-261-3721');
    aria('[data-tag-wa]', 'וואטסאפ לחיים', 'WhatsApp Haim');
    aria('.quote', 'ציטוט', 'Quote');
    hours(); write(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('hd-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    skimKey = null; tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. [open, close] per day; null = closed; [0, 24] = all day
  var H = { 0: [6, 17.5], 1: [6, 17.5], 2: [6, 17.5], 3: [6, 17.5], 4: [6, 17.5], 5: [6, 13], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  var allDay = function (t) { return t && t[0] === 0 && t[1] === 24; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (allDay(t)) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // consecutive days with the same hours share a row
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var two = r[1] - r[0] === 1;
      var label = r[0] === r[1] ? names[r[0]] : names[r[0]] + (two ? (l ? ' ו' : ' and ') : '–') + names[r[1]];
      var time = !t ? (l ? 'סגור' : 'Closed') : allDay(t) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + label + '</td><td>' + time + '</td></tr>';
    }).join('');
    status();
  }
  window.__status = status; window.__H = H; window.__hours = hours;
  setInterval(status, 30000);

  // ---------------------------------------------------------------- the scope sheet: rooms on a plan, the work, the timing on a tape
  var T = {
    he: { hi: 'היי חיים, הגעתי דרך האתר. ',
          plan: 'אנחנו מתכננים שיפוץ', office: 'אנחנו מתכננים שיפוץ במשרד', whole: ' של כל הבית', in: ': ',
          rooms: { living: 'סלון', kitchen: 'מטבח', bath: 'אמבטיה', bed: 'חדרי שינה', balcony: 'מרפסת' }, and: ' ו',
          work: { full: 'שיפוץ כללי', drywall: 'גבס ותקרות', tiles: 'ריצוף וחיפוי', mep: 'חשמל ומיזוג' }, workLead: '. העבודה: ', unsure: '. עוד לא בטוחים מה בדיוק צריך',
          when: ['בהקדם האפשרי', 'בחודש-חודשיים הקרובים', 'בעוד כמה חודשים', 'אנחנו עוד בודקים אפשרויות'], whenLead: '. מבחינת זמנים: ',
          at: '. האזור: ', end: '. אשמח לתאם פגישה ולשמוע ממך.', lw: 'איפה? (לא חובה)', ph: 'למשל: כרמל, חיפה…' },
    en: { hi: 'Hi Haim, I found you through your website. ',
          plan: 'We’re planning a renovation', office: 'We’re planning an office renovation', whole: ' of the whole home', in: ': ',
          rooms: { living: 'the living room', kitchen: 'the kitchen', bath: 'the bathroom', bed: 'the bedrooms', balcony: 'the balcony' }, and: ' and ',
          work: { full: 'a general renovation', drywall: 'drywall and ceilings', tiles: 'floor and wall tiling', mep: 'electrics and air conditioning' }, workLead: '. The work: ', unsure: '. We’re not sure yet exactly what’s needed',
          when: ['as soon as possible', 'within the next month or two', 'in a few months', 'we’re still exploring options'], whenLead: '. Timing: ',
          at: '. Area: ', end: '. I’d be glad to set up a meeting and hear from you.', lw: 'Where? (optional)', ph: 'E.g. Carmel, Haifa…' }
  };
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]'), where = $('[name=where]'), wl = $('[data-where-label]'), whenIn = $('[data-when]'), whenOut = $('[data-when-out]');
  var roomBtns = $$('[data-room]'), wholeBtn = $('[data-whole]'), officeBtn = $('[data-office]');
  function list(a, t) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + t.and + a[a.length - 1]; }
  function write() {
    var t = T[root.lang] || T.he, office = officeBtn.getAttribute('aria-pressed') === 'true', whole = wholeBtn.getAttribute('aria-pressed') === 'true';
    var rooms = roomBtns.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return t.rooms[b.dataset.room]; });
    var works = $$('[name=work]:checked', form).map(function (c) { return c.value; });
    var named = works.filter(function (v) { return v !== 'unsure'; }).map(function (v) { return t.work[v]; });
    var w = (where.value || '').trim().replace(/\s+/g, ' ').slice(0, 60), wi = +whenIn.value;
    var m = t.hi + (office ? t.office : t.plan + (whole ? t.whole : rooms.length ? t.in + list(rooms, t) : ''));
    if (named.length) m += t.workLead + list(named, t);
    if (works.indexOf('unsure') >= 0) m += t.unsure;
    m += t.whenLead + t.when[wi] + (w ? t.at + w : '') + t.end;
    whenOut.textContent = t.when[wi].charAt(0).toUpperCase() + t.when[wi].slice(1);
    wl.textContent = t.lw; where.placeholder = t.ph;
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    preview.textContent = m;
  }
  roomBtns.forEach(function (b) { b.addEventListener('click', function () {
    b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    var all = roomBtns.every(function (x) { return x.getAttribute('aria-pressed') === 'true'; });
    wholeBtn.setAttribute('aria-pressed', all ? 'true' : 'false');
    write();
  }); });
  wholeBtn.addEventListener('click', function () {
    var on = wholeBtn.getAttribute('aria-pressed') !== 'true';
    wholeBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    roomBtns.forEach(function (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    write();
  });
  officeBtn.addEventListener('click', function () { officeBtn.setAttribute('aria-pressed', officeBtn.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); write(); });
  form.addEventListener('change', write);
  form.addEventListener('input', write);

  // ---------------------------------------------------------------- entrances, once, staggered inside each section
  $$('section, header').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { io && !still() ? io.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- nav: where you are; the work-order tag shows once the other call buttons are off screen
  var pill = $('[data-pill]'), links = $$('.links a'), tag = $('[data-tag]'), away = new Set();
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['rooms', 'how', 'reviews', 'scope', 'find'].forEach(function (id) { var el = document.getElementById(id); if (el) nio.observe(el); });
    var kio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? away.add(e.target) : away.delete(e.target); }); tag.classList.toggle('show', away.size === 0); }, { threshold: 0 });
    $$('[data-hero-act], [data-find-act], [data-send]').forEach(function (el) { kio.observe(el); });
  } else tag.classList.add('show');

  // ---------------------------------------------------------------- the hero's laser line rests on the tile joint of the photo
  var heroImg = $('.hero-photo img'), laser = $('[data-laser]');
  // joint height as a share of each source image (desktop crop and phone crop)
  function placeLaser() {
    if (!heroImg || !laser) return;
    var box = heroImg.getBoundingClientRect(), src = heroImg.currentSrc || heroImg.src, mob = /hero-m/.test(src);
    var iw = mob ? 900 : 1600, ih = mob ? 1477 : 1000, jy = mob ? 0.4805 : 0.336;
    var s = Math.max(box.width / iw, box.height / ih), oy = (box.height - ih * s) * (mob ? 0.4 : 0.5);
    laser.style.setProperty('--laser-y', (oy + jy * ih * s).toFixed(1) + 'px');
  }
  heroImg && heroImg.addEventListener('load', placeLaser);

  // ---------------------------------------------------------------- THE SEAM: a skim coat, troweled on as you scroll
  // The wall below the intro is raw render. Its four stripes rise through a working line at 62% of the screen;
  // while a stripe crosses that line a steel trowel draws across it (each stripe the other way, as a plasterer works),
  // pushing a ridge of wet plaster ahead of the blade and leaving smooth limestone behind. When the last stripe is
  // done, one sheen of light runs over the wet wall. Scroll back up and the plaster comes off again in reverse.
  // Per frame the script writes only transform, opacity and the stripes' clip-path, and only while the wall is near.
  var skim = $('[data-skim]'), masks = $$('[data-mask]'), stripes = $$('[data-stripe]'), trowel = $('[data-trowel]'), bead = $('[data-bead]'), sheen = $('[data-sheen]');
  var vw = 0, vh = 0, G = {}, skimKey = null;
  var eio = function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  function layout() {
    vw = innerWidth; vh = innerHeight;
    placeLaser();
    if (!skim) return;
    skim.style.removeProperty('--sh');
    var sh = Math.round(stripes[0].getBoundingClientRect().height), W = skim.clientWidth;
    skim.style.setProperty('--sh', sh + 'px');
    var tw = Math.round(sh * 1.02 * 400 / 366), th = tw * 190 / 400;
    trowel.style.width = tw + 'px';
    G = { sh: sh, W: W, tw: tw, th: th, n: stripes.length, d0: root.dir === 'rtl' ? -1 : 1 };
    skimKey = null; tick();
  }
  // the wet edge is never straight: a slow wave plus a little ripple, different on every stripe
  function edge(i, y, sh) { return 11 * Math.sin((y / sh) * Math.PI * 1.6 + i * 1.7) + 4 * Math.sin((y / sh) * Math.PI * 5.3 + i); }
  // each stripe shows the raw render that is still left: from the wet edge to the far side
  function clipFor(i, q, d) {
    if (q <= 0) return 'none';
    if (q >= 1) return 'polygon(0 0, 0 0, 0 0)';
    var sh = G.sh, W = G.W, x = d > 0 ? q * W : W - q * W, pts = [], k, y;
    for (k = 0; k <= 8; k++) { y = sh * k / 8; pts.push((x + d * edge(i, y, sh)).toFixed(1) + 'px ' + y.toFixed(1) + 'px'); }
    return d > 0 ? 'polygon(' + W + 'px 0, ' + pts.join(', ') + ', ' + W + 'px ' + sh + 'px)'
                 : 'polygon(0 0, ' + pts.join(', ') + ', 0 ' + sh + 'px)';
  }
  // the words sit in the plaster: they show only where the coat is already on (a mask, so nothing covers them)
  function maskFor(i, q, d) {
    if (q >= 1) return 'none';
    if (q <= 0) return 'linear-gradient(transparent, transparent)'; // taste-skill-ignore: a mask, not a fill
    var W = G.W, x = d > 0 ? q * W : W - q * W, a = d > 0 ? x : W - x;
    return 'linear-gradient(' + (d > 0 ? 90 : 270) + 'deg, #000 ' + (a - 18).toFixed(1) + 'px, transparent ' + (a + 4).toFixed(1) + 'px)'; // taste-skill-ignore: a mask, not a fill
  }
  function setMasks(qs) {
    masks.forEach(function (m) { var i = +m.dataset.mask, d = i % 2 ? -G.d0 : G.d0, v = qs ? maskFor(i, qs[i], d) : 'none'; m.style.webkitMaskImage = v; m.style.maskImage = v; });
  }
  function paintSkim() {
    if (!skim || !G.sh) return;
    var off = still(), r = skim.getBoundingClientRect(), t0 = r.top;
    if (!off && (t0 > vh * 1.5 || r.bottom < -vh * 0.5)) {
      // far away: settle to the matching end state once
      var endK = t0 > 0 ? 'before' : 'after'; if (skimKey === endK) return; skimKey = endK;
      stripes.forEach(function (s, i) { s.style.clipPath = clipFor(i, t0 > 0 ? 0 : 1, 1); });
      setMasks(t0 > 0 ? [0, 0, 0, 0] : null);
      trowel.style.opacity = '0'; bead.style.opacity = '0'; sheen.style.opacity = '0';
      return;
    }
    var line = vh * 0.62, sh = G.sh, n = G.n;
    var key = off ? 'still' : Math.round(t0) + ':' + vw;
    if (key === skimKey) return; skimKey = key;
    var qs = stripes.map(function (s, i) { return off ? 1 : clamp((line - (t0 + i * sh)) / sh, 0, 1); });
    stripes.forEach(function (s, i) { var d = i % 2 ? -G.d0 : G.d0; var c = clipFor(i, qs[i], d); s.style.clipPath = c; s.style.webkitClipPath = c; });
    setMasks(off ? null : qs);
    if (off) return;
    // which stripe the trowel is on
    var a = 0; while (a < n - 1 && qs[a] >= 1) a++;
    var q = qs[a], d = a % 2 ? -G.d0 : G.d0, W = G.W, tw = G.tw, th = G.th;
    var xEdge = d > 0 ? q * W : W - q * W;
    var cy = a * sh + sh / 2;
    if (a > 0 && q < 0.14) { var k = eio(q / 0.14); cy = (a - 1) * sh + sh / 2 + k * sh; }   // step down to the next stripe
    cy += Math.sin(q * Math.PI) * sh * 0.05;                                                  // the stroke arcs a little
    var cx = xEdge - d * tw * 0.07;
    var tilt = d * (-4 + 6 * Math.sin(q * Math.PI * 2));                                       // leading edge lifted, the wrist turning
    var rot = (d > 0 ? -64 : 64) + tilt;
    var fadeIn = clamp((line + sh * 0.9 - t0) / (sh * 0.9), 0, 1), done = qs[n - 1];
    var exit = done >= 1 ? clamp((line - (t0 + n * sh)) / (sh * 0.6), 0, 1) : 0;
    var lift = exit * 40;
    trowel.style.transform = 'translate3d(' + (cx - tw / 2 + d * exit * tw * 0.6).toFixed(1) + 'px,' + (cy - th / 2 - lift).toFixed(1) + 'px,0) rotate(' + rot.toFixed(2) + 'deg)';
    trowel.style.opacity = (fadeIn * (1 - exit)).toFixed(3);
    var working = q > 0 && q < 1;
    bead.style.transform = 'translate3d(' + (xEdge - 280 + d * 2).toFixed(1) + 'px,' + (a * sh).toFixed(1) + 'px,0) scaleX(' + d + ')';
    bead.style.opacity = working ? Math.min(1, q * 10, (1 - q) * 10).toFixed(3) : '0';
    // the sheen: once, as the finished wall rises past the line
    var s = clamp((line - (t0 + n * sh)) / (vh * 0.4), 0, 1), sw = W;
    sheen.style.opacity = (Math.sin(Math.PI * s) * 0.95).toFixed(3);
    var sx = G.d0 > 0 ? (-1.45 + 1.4 * s) * sw : (-0.05 - 1.4 * s) * sw;
    sheen.style.transform = 'translate3d(' + sx.toFixed(1) + 'px,0,0)';
  }

  // ---------------------------------------------------------------- the levels: the nav's vial and the rating's big level.
  // Scrolling tips them, the bubble runs, then settles back dead centre (5.0 is level).
  var bub = $('[data-bubble]'), big = $('[data-big-bubble]'), pos = 0, vel = 0, push = 0, lastY = scrollY, raf = 0;
  function spring() {
    raf = 0;
    vel += (push - pos) * 0.12; vel *= 0.78; pos += vel; push *= 0.82;
    if (bub) bub.style.transform = 'translate3d(' + (pos * 0.6).toFixed(2) + 'px,0,0)';
    if (big) big.style.transform = 'translate3d(' + (pos * 2.2).toFixed(2) + 'px,0,0)';
    if (Math.abs(pos) > 0.02 || Math.abs(vel) > 0.02 || Math.abs(push) > 0.02) raf = requestAnimationFrame(spring);
    else { pos = 0; if (bub) bub.style.transform = ''; if (big) big.style.transform = ''; }
  }
  function nudge(dy) { if (still()) return; push = clamp(push + dy * 0.05, -12, 12); if (!raf) raf = requestAnimationFrame(spring); }

  function tick() {
    paintSkim();
    pill.classList.toggle('up', scrollY > 24);
  }
  var ticking = false;
  addEventListener('scroll', function () {
    var y = scrollY; nudge((y - lastY) * (root.dir === 'rtl' ? -1 : 1)); lastY = y;
    if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); }
  }, { passive: true });
  var rT = 0; addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(layout, 120); });

  hours(); write(); layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  addEventListener('load', layout);
  window.__skim = { tick: tick, layout: layout, G: function () { return G; } };
})();
