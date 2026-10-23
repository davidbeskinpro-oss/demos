(function () {
  var root = document.documentElement, WA = '972544851412';
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
  var TITLE = { he: 'אדיר לוי & שרון לוי · בוטיק שיער · שדרות מוריה 118, חיפה', en: 'Adir Levi & Sharon Levi · Hair boutique · 118 Moriah Blvd, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור אדיר לוי & שרון לוי – בוטיק שיער · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Adir Levi & Sharon Levi Hair Boutique · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- glyph decode: a label settles out of scrambled letters
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' };
  function decode(el, instant) {
    var l = root.lang, txt = el.dataset[l] || '';
    clearInterval(el._d);
    if (instant || still()) { el.textContent = txt; return; }
    var set = GL[l], n = 0, steps = 14;
    el._d = setInterval(function () {
      n++;
      el.textContent = txt.split('').map(function (c, i) {
        if (c === ' ' || n >= steps * (i + 1) / txt.length + 2) return c;
        return set[Math.floor(Math.random() * set.length)];
      }).join('');
      if (n > steps + 3) { clearInterval(el._d); el.textContent = txt; }
    }, 40);
  }
  var decs = $$('[data-decode]');

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'אדיר לוי ושרון לוי, בוטיק שיער', 'Adir Levi & Sharon Levi, hair boutique');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-callnav]', 'התקשרו, 054-485-1412', 'Call, 054-485-1412');
    aria('[data-t-call]', 'התקשרו לאדיר ושרון, 054-485-1412', 'Call Adir and Sharon, 054-485-1412');
    aria('[data-t-wa]', 'וואטסאפ לאדיר ושרון', 'WhatsApp Adir and Sharon');
    aria('[data-t-range]', 'השוואה בין לפני לאחרי', 'Compare before and after');
    aria('[data-t-visit]', 'הגעה ויצירת קשר', 'Visit and contact');
    var note = $('[name=note]'); note.placeholder = note.dataset[l === 'he' ? 'phHe' : 'phEn'];
    decs.forEach(function (d) { decode(d, true); });
    $$('[data-tags] span').forEach(function (t) { t.textContent = t.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('al-lang', l); } catch (e) {}
    splitAll(); texts(l); hours(); buildBook(); write(true); layout();
    $$('[data-split] .ch, [data-fname] .ch').length && hero.classList.add('ready');
    fname.classList.add('in');
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('al-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    cameo.classList.add('dealt'); fname.classList.add('in');
    decs.forEach(function (d) { decode(d, true); });
    layout(); laurel.kick(); arc.kick(); strands.kick(); petals.kick(); fall.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed that day
  var H = { 0: [9, 17], 1: null, 2: [9, 17], 3: [9, 17], 4: [9, 17], 5: [8, 13], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], shortEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'numeric', year: 'numeric', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, date: new Date(Date.UTC(+o.year, +o.month - 1, +o.day)) };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false, short;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; short = txt; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); short = l ? 'פתוח עד ' + hhmm(t[1]) : 'Open till ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); short = l ? 'נפתח ב-' + hhmm(t[0]) : 'Opens ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
      short = !H[nd] ? (l ? 'סגור' : 'Closed') : nd === (n.d + 1) % 7 ? (l ? 'נפתח מחר ב-' + hhmm(H[nd][0]) : 'Opens tomorrow ' + hhmm(H[nd][0])) : (l ? 'נפתח ביום ' + shortHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Opens ' + shortEn[nd] + ' ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $('[data-clipst]').textContent = short;
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
    $('[data-today]').textContent = t ? (l ? 'היום ' : 'Today ') + hhmm(t[0]) + '–' + hhmm(t[1]) : (l ? 'היום המספרה סגורה' : 'Closed today');
    dial(n);
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var two = r[1] - r[0] === 1;
      var label = r[0] === r[1] ? names[r[0]] : names[r[0]] + (two ? (l ? ' ו' : ' and ') : '–') + names[r[1]];
      var time = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + label + '</td><td>' + time + '</td></tr>';
    }).join('');
    status();
  }
  window.__status = status; window.__H = H;
  setInterval(status, 30000);

  // the little clock in the bento: Haifa time, and today's opening hours drawn as a rose arc
  var NS = 'http://www.w3.org/2000/svg';
  (function () { var g = $('[data-ticks]'); for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6, l = document.createElementNS(NS, 'line'); l.setAttribute('x1', 60 + Math.sin(a) * 44); l.setAttribute('y1', 60 - Math.cos(a) * 44); l.setAttribute('x2', 60 + Math.sin(a) * 49); l.setAttribute('y2', 60 - Math.cos(a) * 49); g.appendChild(l); } })();
  function dial(n) {
    var h = n.h, mA = (h % 1) * 360, hA = (h % 12) * 30;
    $('[data-hm]').setAttribute('transform', 'rotate(' + mA.toFixed(1) + ' 60 60)');
    $('[data-hh]').setAttribute('transform', 'rotate(' + hA.toFixed(1) + ' 60 60)');
    var t = H[n.d], p = $('[data-openarc]');
    if (!t) { p.setAttribute('d', ''); return; }
    var a0 = (t[0] % 12) * 30, a1 = (t[1] % 12) * 30, span = t[1] - t[0], R = 38;
    var pt = function (a) { a = a * Math.PI / 180; return (60 + Math.sin(a) * R).toFixed(2) + ' ' + (60 - Math.cos(a) * R).toFixed(2); };
    p.setAttribute('d', 'M' + pt(a0) + ' A' + R + ' ' + R + ' 0 ' + (span > 6 ? 1 : 0) + ' 1 ' + pt(a1));
  }

  // ---------------------------------------------------------------- the appointment diary: the next seven days, from today
  var SLOTS = [[0, 12, 'בוקר', 'Morning', 'בבוקר', 'in the morning'], [12, 14, 'צהריים', 'Midday', 'בצהריים', 'around midday'], [14, 24, 'אחה״צ', 'Afternoon', 'אחר הצהריים', 'in the afternoon']];
  var days = [], picked = null;
  function buildBook() {
    var l = he(), n = window.__now || now(), d0 = n.date || new Date();
    days = [];
    for (var i = 0; i < 7; i++) { var dt = new Date(d0.getTime() + i * 864e5); days.push({ dow: (n.d + i) % 7, dd: dt.getUTCDate(), mm: dt.getUTCMonth() + 1, i: i }); }
    var fmt = function (d) { return d.dd + '.' + d.mm; };
    $('[data-week]').textContent = fmt(days[0]) + ' – ' + fmt(days[6]);
    $('[data-days]').innerHTML = '<th scope="col"><span class="vh">' + (l ? 'שעה' : 'Time') + '</span></th>' + days.map(function (d) {
      var closed = !H[d.dow], name = d.i === 0 ? (l ? 'היום' : 'Today') : d.i === 1 ? (l ? 'מחר' : 'Tmrw') : (l ? shortHe[d.dow] : shortEn[d.dow]);
      return '<th scope="col" class="' + (closed ? 'closed' : '') + '">' + name + '<small>' + fmt(d) + '</small></th>';
    }).join('');
    $('[data-grid]').innerHTML = SLOTS.map(function (s, si) {
      return '<tr><th scope="row">' + (l ? s[2] : s[3]) + '</th>' + days.map(function (d) {
        var t = H[d.dow];
        if (!t) return '<td class="closed">' + (si === 1 ? (l ? 'סגור' : 'Closed') : '') + '</td>';
        var a = Math.max(t[0], s[0]), b = Math.min(t[1], s[1]);
        if (b <= a) return '<td class="past"></td>';
        var past = d.i === 0 && n.h >= b - 0.5, id = d.i + '-' + si, chk = picked === id && !past;
        var lab = (l ? (d.i === 0 ? 'היום' : 'יום ' + dayHe[d.dow]) : (d.i === 0 ? 'Today' : dayEn[d.dow])) + ' ' + d.dd + '.' + d.mm + ', ' + (l ? s[4] : s[5]);
        return '<td' + (past ? ' class="past"' : '') + '><label class="slot"><input type="radio" name="slot" value="' + id + '"' + (past ? ' disabled' : '') + (chk ? ' checked' : '') + ' aria-label="' + lab + '"><svg viewBox="0 0 40 30" aria-hidden="true"><path class="ring" d="M30.5 4.5C26 1.8 13 2 7 6.5 1.5 10.6 2.6 21.2 9.6 25c7.1 3.9 19.1 2.9 24-2.4 4.7-5.1 2.3-13.4-5.2-16.6"/><path class="tick" d="M14 15.6l4.2 4.3 8.4-9.2-1.3-1.2-7.1 7.7-2.9-3z"/></svg></label></td>';
      }).join('') + '</tr>';
    }).join('');
  }
  var T = {
    he: { hi: 'היי אדיר ושרון, הגעתי דרך האתר. ', svc: { cut: 'לתספורת', colour: 'לגוונים', ext: 'לתוספות שיער', blow: 'לפן' }, want: 'אשמח לקבוע תור ', on: ' ביום ', today: ' היום', note: '. הערה: ', ask: '. זה מתאים לכם?', any: '. מתי יש מקום?' },
    en: { hi: 'Hi Adir and Sharon, I found you through your website. ', svc: { cut: 'a haircut', colour: 'highlights', ext: 'hair extensions', blow: 'a blowout' }, want: 'I’d like to book ', on: ' on ', today: ' today', note: '. A note: ', ask: '. Does that work for you?', any: '. When do you have a slot?' }
  };
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]'), note = $('[name=note]'), chatSeen = false;
  function message() {
    var l = root.lang, t = T[l] || T.he, fd = new FormData(form), svc = fd.get('svc') || 'cut', slot = fd.get('slot'), nt = (note.value || '').trim().slice(0, 90);
    var m = t.hi + t.want + t.svc[svc];
    if (slot) {
      var p = slot.split('-'), d = days[+p[0]], s = SLOTS[+p[1]];
      if (d) m += (d.i === 0 ? t.today : t.on + (l === 'he' ? dayHe[d.dow] : dayEn[d.dow]) + ' ' + d.dd + '.' + d.mm) + ', ' + (l === 'he' ? s[4] : s[5]);
    }
    if (nt) m += t.note + nt.replace(/[.!?]+$/, '');
    return m + (slot ? t.ask : t.any);
  }
  var shown = '', typing = 0;
  function write(instant) {
    var target = message();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; preview.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 14);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      preview.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  var steps = $$('[data-step]');
  function lightStep(n) { steps.forEach(function (s, i) { s.classList.toggle('on', i <= n); }); }
  form.addEventListener('change', function (e) {
    if (e.target.name === 'slot') { picked = e.target.value; lightStep(2); } else if (e.target.name === 'svc') lightStep(picked ? 2 : 1);
    write();
  });
  note.addEventListener('input', function () { write(true); });
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; lightStep(0); shown = ''; preview.textContent = ''; write(); } }, { threshold: .5 });

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); $$('[data-decode]', e.target).forEach(function (d) { decode(d); }); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  $$('.svc-list li').forEach(function (li) { li.addEventListener('pointerenter', function () { decode($('[data-decode]', li)); }); });

  // ---------------------------------------------------------------- split headline and footer name into letters
  var fname = $('[data-fname]');
  function splitAll() {
    $$('[data-split] .ln > span[lang], [data-fname] > span[lang]').forEach(function (sp) {
      if (sp.dataset.done) return; sp.dataset.done = 1;
      var i = sp.closest('.ln') && sp.closest('.ln').previousElementSibling ? 11 : 0;
      sp.innerHTML = sp.textContent.split(' ').map(function (w) {
        return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  }
  splitAll();
  if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { fname.classList.add('in'); ob.disconnect(); } }, { threshold: .4 }).observe(fname); else fname.classList.add('in');

  var hero = $('[data-hero]'), nav = $('[data-nav]'), cameo = $('[data-cameo]'), oval = $('[data-oval]');

  // ---------------------------------------------------------------- opening: their photos are dealt like cards, the last settles into the cameo
  function deal() {
    if (still() || !cameo.animate) { cameo.classList.add('dealt'); return; }
    var imgs = $$('img', $('[data-deck]')), side = rtl() ? -1 : 1, FAN = [-16, -6, 5, 14];
    imgs.forEach(function (im, i) {
      im.animate([
        { opacity: 0, transform: 'translate(-50%,-50%) translate(' + (side * 260) + 'px,180px) rotate(' + (side * 24) + 'deg) scale(.8)' },
        { opacity: 1, transform: 'translate(-50%,-50%) translate(' + ((i - 1.5) * 34) + 'px,' + (Math.abs(i - 1.5) * 8) + 'px) rotate(' + FAN[i] + 'deg)', offset: .45 },
        { opacity: 1, transform: 'translate(-50%,-50%) translate(' + ((i - 1.5) * 34) + 'px,' + (Math.abs(i - 1.5) * 8) + 'px) rotate(' + FAN[i] + 'deg)', offset: .7 },
        { opacity: 0, transform: 'translate(-50%,-50%) rotate(0deg) scale(.9)' }
      ], { duration: 1400, delay: 80 + i * 110, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'both' });
    });
    setTimeout(function () { cameo.classList.add('dealt'); }, 820);   // the last card opens into the oval as the deck folds away
  }
  deal();

  // ---------------------------------------------------------------- the laurel of their real logo, made of gold dust around the cameo
  var laurel = (function () {
    var cv = $('[data-laurel]'), c = cv.getContext('2d'), img = new Image(), P = [], w, h, raf = 0, vis = true, t0 = 0, mx = -999, my = -999, ok = false;
    var COLS = ['#c9a26a', '#d9b884', '#c98a84', '#e6c9a0', '#b98c5a'];
    img.src = 'img/logo.jpg';
    function sample() {
      try {
        var S = 220, sc = document.createElement('canvas'); sc.width = S; sc.height = S;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, S, S);
        var d = sx.getImageData(0, 0, S, S).data, pts = [];
        for (var y = 0; y < S; y += 1) for (var x = 0; x < S; x += 1) {
          var k = (y * S + x) * 4, v = (d[k] + d[k + 1] + d[k + 2]) / 3;
          var ex = (x - S * .5) / (S * .22), ey = (y - S * .49) / (S * .29);
          if (v > 150 && ex * ex + ey * ey > 1) pts.push([x / S - .5, y / S - .5]);   // the wreath only; the monogram sits under the photo
        }
        var want = phone() ? 1500 : 2600, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) { var q = pts[Math.floor(f)]; P.push({ hx: q[0], hy: q[1], col: COLS[Math.floor(Math.random() * COLS.length)], x: 0, y: 0, vx: 0, vy: 0, ph: Math.random() * 6.28, dl: Math.random() * .8, fx: Math.random() - .5, fy: -Math.random(), s: 1.2 + Math.random() * 1.9 }); }
        ok = true;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); P.forEach(function (p) { p.sx = undefined; }); }
    function frame(now) {
      raf = 0; if (!ok) return;
      var calm = still(), T = (now - t0) / 1000, hr = hero.getBoundingClientRect(), cr = cameo.getBoundingClientRect();
      var cx = cr.left - hr.left + cr.width / 2, cy = cr.top - hr.top + cr.height / 2, S = cr.width * 2.2;
      var lift = calm ? 0 : clamp(-hr.top / (hr.height * .8), 0, 1.2);
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], a = calm ? 1 : smooth((T - .2 - p.dl) / 1.6), br = 1 + Math.sin(T * .9) * .012;
        var tx = cx + p.hx * S * br + Math.sin(T * 1.2 + p.ph) * 1.2, ty = cy + p.hy * S * 1.08 * br + Math.cos(T + p.ph) * 1.2;
        if (lift > 0) { tx += p.fx * lift * w * .7 + Math.sin(T * 2 + p.ph) * lift * 20; ty += p.fy * lift * h * .9; }
        if (calm) { p.x = tx; p.y = ty; }
        else if (a < 1) { if (p.sx === undefined) { p.sx = Math.random() * w; p.sy = h + Math.random() * 60; } p.x = lerp(p.sx, tx, a) + Math.sin(T * 3 + p.ph) * (1 - a) * 30; p.y = lerp(p.sy, ty, a); }
        else {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 9000) { var f = (9000 - d2) / 9000 * 2.2, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
          p.vx += (tx - p.x) * .05; p.vy += (ty - p.y) * .05; p.vx *= .84; p.vy *= .84; p.x += p.vx; p.y += p.vy;
        }
        c.globalAlpha = (.55 + .45 * Math.sin(T * 2.2 + p.ph * 3)) * (1 - clamp(lift, 0, 1) * .6) * (calm ? .85 : 1);
        c.fillStyle = p.col; c.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
      }
      c.globalAlpha = 1;
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() { size(); sample(); t0 = performance.now(); kick(); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // the light follows the hand across the hair; on a phone it drifts by itself
  var shine = $('.shine'), shT = 0;
  oval.addEventListener('pointermove', function (e) { var r = oval.getBoundingClientRect(); shine.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100) + '%'); shine.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100) + '%'); shT = performance.now(); });
  (function orbit(t) {
    if (!still() && t - shT > 2500) { var a = t / 2600; shine.style.setProperty('--sx', (50 + Math.cos(a) * 26) + '%'); shine.style.setProperty('--sy', (40 + Math.sin(a * 1.3) * 24) + '%'); }
    requestAnimationFrame(orbit);
  })(0);

  var tk = $('[data-ticker]'); tk.innerHTML += tk.innerHTML;

  // ---------------------------------------------------------------- the arc: their photos on the inside of a gentle curve; drag, scroll, or let it turn
  var arc = (function () {
    var wrap = $('[data-arcwrap]'), el = $('[data-arc]');
    $$('.ac', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $$('[data-decode]', k).forEach(function (d) { decs.push(d); }); el.appendChild(k); });
    var cards = $$('.ac', el), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = false, last = 0, front = -1;
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; c.style.opacity = ''; }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (5 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var cw = cards[0].offsetWidth || 200, R = cw * 2.6, push = R * .8;
      var sc = scrollY * .05 * (rtl() ? 1 : -1), best = 99, bi = 0;
      cards.forEach(function (c, i) {
        var a = ((rot + sc + i * step) % 360 + 540) % 360 - 180, ab = Math.abs(a);
        if (ab < best) { best = ab; bi = i; }
        c.style.transform = 'translateZ(' + push.toFixed(0) + 'px) rotateY(' + a.toFixed(2) + 'deg) translateZ(' + (-R).toFixed(0) + 'px)';
        c.style.opacity = ab > 62 ? '0' : ab > 48 ? ((62 - ab) / 14).toFixed(3) : '1';
        c.style.filter = 'brightness(' + (1 - Math.min(ab, 50) / 50 * .28).toFixed(3) + ')';
      });
      if (bi !== front) { front = bi; var d = $('[data-decode]', cards[bi]); if (d) decode(d); }
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot -= dx * .09; vel = -dx * 1.2 * (rtl() ? 1 : -1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(wrap, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- the swatch wall: their real photo cut into strands that hang and sway
  var strands = (function () {
    var wall = $('[data-wall]'), box = $('[data-strands]'), tags = $$('[data-tags] span'), S = [], W = 0, Hh = 0, raf = 0, vis = false, lastX = null, lastT = 0, t0 = performance.now(), lastSY = scrollY, auto = 0;
    // one canvas, the real photo drawn as strands: each strand is a slice of the photo skewed from its hook
    var cv = document.createElement('canvas'), c = cv.getContext('2d'), src = $('.wall-src'), dpr = 1;
    box.appendChild(cv);
    function build() {
      S = [];
      W = wall.clientWidth; Hh = wall.clientHeight; if (!W) return;
      dpr = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr);
      var n = phone() ? 30 : 46, sw = W / n;
      for (var i = 0; i < n; i++) {
        var lx = Math.round(i * sw) - 3, wx = Math.round((i + 1) * sw) - lx + 3;   // each strand overlaps its neighbours by 3px, so a sway never opens a gap
        S.push({ lx: Math.max(0, lx), wx: Math.min(W, lx + wx) - Math.max(0, lx), a: 0, v: 0, x: (i + .5) / n, ph: Math.random() * 6.28 });
      }
      draw();
    }
    function draw() {
      if (!src.complete || !src.naturalWidth || !W) return;
      var k = src.naturalWidth / W, y0 = Hh * .04;
      c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0b0f15'; c.fillRect(0, 0, cv.width, cv.height);
      S.forEach(function (s) {
        var t = Math.tan(s.a * Math.PI / 180);
        c.setTransform(dpr, 0, dpr * t, dpr, -dpr * t * y0, 0);
        c.drawImage(src, s.lx * k, 0, s.wx * k, src.naturalHeight, s.lx, 0, s.wx, Hh);
      });
    }
    src.addEventListener('load', function () { draw(); });
    function push(fx, force, rad) { S.forEach(function (s) { var d = Math.abs(s.x - fx); if (d < rad) s.v += force * (1 - d / rad); }); }
    function frame(t) {
      raf = 0; if (still()) { S.forEach(function (s) { s.a = 0; s.v = 0; }); draw(); return; }
      var T = (t - t0) / 1000;
      // a slow breeze rolls across now and then, so the wall is never quite still
      if (t - auto > (fine ? 5200 : 3200)) { auto = t; var dir = Math.random() < .5 ? 1 : -1; S.forEach(function (s, i) { setTimeout(function () { s.v += dir * 1.1; }, (dir > 0 ? i : S.length - i) * 22); }); }
      S.forEach(function (s) {
        var wind = Math.sin(T * 1.1 + s.x * 4) * .35;
        s.v += (wind - s.a) * .045; s.v *= .93; s.a += s.v * .16;
        s.a = clamp(s.a, -6, 6);
      });
      // neighbouring strands pull on each other, like real hair: the sway travels instead of tearing
      for (var k = 0; k < 2; k++) for (var j = 1; j < S.length - 1; j++) S[j].a = S[j].a * .5 + (S[j - 1].a + S[j + 1].a) * .25;
      draw();
      if (vis) raf = requestAnimationFrame(frame);
    }
    function showTag(fx) {
      var best = null, bd = 1;
      tags.forEach(function (t) { var d = Math.abs(+t.dataset.x - fx); if (d < bd) { bd = d; best = t; } });
      tags.forEach(function (t) {
        var on = t === best && bd < .1;
        if (on && !t.classList.contains('on')) { t.textContent = t.dataset[root.lang]; var tw = t.offsetWidth, ww = wall.clientWidth; t.style.left = clamp(+t.dataset.x * ww, tw / 2 + 10, ww - tw / 2 - 10) + 'px'; decode(t); }
        t.classList.toggle('on', on);
      });
    }
    wall.addEventListener('pointermove', function (e) {
      if (still()) return;
      var r = wall.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height, now = performance.now();
      if (lastX !== null && fy > .12) { var vx = (fx - lastX) / Math.max(8, now - lastT) * 1000; push(fx, clamp(vx, -4, 4) * -1.6, .09); }
      lastX = fx; lastT = now; showTag(fx); kick();
    });
    wall.addEventListener('pointerleave', function () { lastX = null; tags.forEach(function (t) { t.classList.remove('on'); }); });
    wall.addEventListener('pointerdown', function (e) { if (still()) return; var r = wall.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width; push(fx, 5, .18); showTag(fx); kick(); });
    addEventListener('scroll', function () { if (!vis || still()) return; var d = scrollY - lastSY; lastSY = scrollY; if (Math.abs(d) > 2) S.forEach(function (s, i) { s.v += clamp(d, -40, 40) * .012 * (1 + Math.sin(i * .7) * .3); }); }, { passive: true });
    // on touch screens a tag shows by itself now and then
    var ti = 0; setInterval(function () { if (fine || !vis || still()) return; var t = tags[ti++ % tags.length]; showTag(+t.dataset.x); }, 2200);
    watch(wall, function (v) { vis = v; if (v) kick(); });
    function kick() { if (!raf && S.length) raf = requestAnimationFrame(frame); }
    return { build: build, kick: kick };
  })();

  // ---------------------------------------------------------------- before / after
  var cmp = $('[data-cmp]'), range = $('[data-range]'), touched = false, ba = $('[data-ba]');
  function setX(v) { cmp.style.setProperty('--x', v + '%'); range.value = v; }
  range.addEventListener('input', function () { touched = true; setX(+range.value); });
  range.addEventListener('pointerdown', function () { touched = true; });

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

  // ---------------------------------------------------------------- bento spotlight, and gold laurel leaves rising off the real card
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  function leafSprite(col) { var s = document.createElement('canvas'); s.width = 12; s.height = 24; var g = s.getContext('2d'); g.fillStyle = col; g.beginPath(); g.moveTo(6, 0); g.bezierCurveTo(-1, 6, 0, 18, 6, 24); g.bezierCurveTo(12, 18, 13, 6, 6, 0); g.fill(); g.strokeStyle = 'rgba(80,50,20,.35)'; g.lineWidth = .8; g.beginPath(); g.moveTo(6, 2); g.lineTo(6, 22); g.stroke(); return s; }
  var LEAVES = ['#d9b884', '#c9a26a', '#e8d2a6', '#d4a39b'].map(leafSprite);
  function leafField(cv, opts) {
    var c = cv.getContext('2d'), L = [], raf = 0, vis = false, w, h, last = 0;
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function add(x, y, burst) { var n = burst ? 10 : 1; for (var k = 0; k < n; k++) L.push(opts.make(x, y, w, h, burst)); }
    function frame(t) {
      raf = 0; if (still()) { c.clearRect(0, 0, w, h); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (Math.random() < opts.rate * dt * 60) add();
      c.clearRect(0, 0, w, h);
      L = L.filter(function (p) {
        p.t += dt; p.x += p.vx * dt + Math.sin(p.t * p.wf + p.ph) * p.sway * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        var al = Math.min(1, p.t * 2) * (p.life ? clamp((p.life - p.t) / 1.2, 0, 1) : 1);
        if (al <= 0 || p.y < -40 || p.y > h + 40) return false;
        c.save(); c.globalAlpha = al * .9; c.translate(p.x, p.y); c.rotate(p.r); c.scale(p.s, p.s); c.drawImage(p.img, -6, -12); c.restore();
        return true;
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    watch(cv, function (v) { vis = v; if (v) { size(); kick(); } });
    return { kick: kick, size: size, add: add, pos: function () { return [w, h]; } };
  }
  var petals = leafField($('[data-petals]'), { rate: .05, make: function (x, y, w, h, burst) {
    var ox = x == null ? w * (.36 + Math.random() * .28) : x, oy = y == null ? h * .74 : y;
    return { x: ox, y: oy, vx: (Math.random() - .5) * (burst ? 90 : 20), vy: -(30 + Math.random() * 50) * (burst ? 1.8 : 1), r: Math.random() * 6.28, vr: (Math.random() - .5) * 1.6, s: .6 + Math.random() * .7, t: 0, ph: Math.random() * 6, wf: 1.5 + Math.random(), sway: 18, life: 4 + Math.random() * 3, img: LEAVES[Math.floor(Math.random() * LEAVES.length)] };
  } });
  var cardTile = $('[data-cardtile]');
  cardTile.addEventListener('pointerdown', function (e) { var r = cardTile.getBoundingClientRect(); petals.add(e.clientX - r.left, e.clientY - r.top, true); petals.kick(); });
  var fall = leafField($('[data-fall]'), { rate: .09, make: function (x, y, w) {
    return { x: Math.random() * w, y: -20, vx: (Math.random() - .5) * 14, vy: 26 + Math.random() * 30, r: Math.random() * 6.28, vr: (Math.random() - .5) * 1.4, s: .7 + Math.random() * .9, t: 0, ph: Math.random() * 6, wf: 1 + Math.random(), sway: 26, life: 0, img: LEAVES[Math.floor(Math.random() * LEAVES.length)] };
  } });

  // ---------------------------------------------------------------- reviews: copies make the drift seamless
  watch($('#reviews'), function (v) { $('#reviews').classList.toggle('on', v); });
  watch(hero, function (v) { hero.classList.toggle('on', v); });
  $$('[data-row]').forEach(function (r) { $$('.rv', r).forEach(function (b) { var k = b.cloneNode(true); k.setAttribute('aria-hidden', 'true'); r.appendChild(k); }); });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var work = $('[data-work]'), cardZoom = $('[data-cardzoom]'), vwrap = $('[data-vwrap]'), vphoto = $('[data-vphoto]'), vcards = $$('[data-vcards] > *');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function through(el) { var r = el.getBoundingClientRect(); return clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) laurel.kick();
    // hero settles back as the pearl sheet rides over it
    var wr = work.getBoundingClientRect(), hp = calm ? 0 : clamp(1 - (wr.top - vh * .15) / (vh * .85), 0, 1);
    hero.style.transform = hp > 0 ? 'scale(' + (1 - hp * .06).toFixed(4) + ')' : '';
    hero.style.filter = hp > 0 ? 'brightness(' + (1 - hp * .12).toFixed(3) + ')' : '';
    // the before/after wipe follows the scroll until a hand takes it
    if (!touched) setX(calm ? 50 : Math.round(lerp(90, 14, smooth((through(cmp) - .18) / .5))));
    // the pearl horizon rises into the boutique
    var br = ba.getBoundingClientRect(), rp = calm ? 1 : smooth((vh - br.bottom + vh * .55) / (vh * .55));
    ba.style.setProperty('--rise', ((1 - rp) * 120).toFixed(1) + 'px');
    // the camera pushes into the card's laurel
    var cz = calm ? 1 : 1 + smooth((through(cardTile) - .2) / .6) * .6;
    cardZoom.style.setProperty('--z', cz.toFixed(4));
    // visit: the shopfront shrinks into its frame, the cards rise beside it
    var kp = calm ? 1 : prog(vwrap), s2 = calm ? 1 : smooth(kp / .55);
    if (!calm) {
      var PW = vphoto.parentNode.clientWidth, PH = vphoto.parentNode.clientHeight, t1, b1, st, en;
      if (innerWidth <= 800) { t1 = 78; b1 = PH * .44; st = 16; en = 16; } else { t1 = PH * .12; b1 = PH * .12; st = PW * .5; en = PW * .04; }
      var L = rtl() ? en : st, Rr = rtl() ? st : en;
      vphoto.style.setProperty('--pt', (t1 * s2).toFixed(1) + 'px'); vphoto.style.setProperty('--pb', (b1 * s2).toFixed(1) + 'px');
      vphoto.style.setProperty('--pl', (L * s2).toFixed(1) + 'px'); vphoto.style.setProperty('--pr', (Rr * s2).toFixed(1) + 'px'); vphoto.style.setProperty('--pr2', (26 * s2).toFixed(1) + 'px');
    } else { ['--pt', '--pb', '--pl', '--pr', '--pr2'].forEach(function (k) { vphoto.style.removeProperty(k); }); }
    vcards.forEach(function (r, i) { var v = calm ? 1 : innerWidth <= 800 ? smooth((s2 - .82 - i * .04) / .06) : smooth((s2 - .7 - i * .06) / .12); r.style.opacity = calm ? '' : v.toFixed(3); r.style.visibility = !calm && v < .02 ? 'hidden' : ''; r.style.transform = calm || v >= 1 ? '' : 'translateY(' + ((1 - v) * 30).toFixed(1) + 'px)'; });
  }

  // the curtain footer only exists once the page is about to lift off it
  var foot = $('[data-foot]'), main = $('#main');
  function curtain() { foot.style.visibility = main.getBoundingClientRect().bottom < innerHeight * 1.6 ? '' : 'hidden'; }
  addEventListener('scroll', curtain, { passive: true });
  function layout() { curtain(); laurel.size(); strands.build(); strands.kick(); petals.size(); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); }, 140); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); buildBook(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { layout(); });
})();
