(function () {
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 761; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var TITLE = { he: 'גיל גולדרייך · משרד עורכי דין ונוטריון · רובינשטיין 43א, חיפה', en: 'Gil Goldreich · Law Office & Notary · 43A Rubinstein St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור גיל גולדרייך משרד עורכי דין ונוטריון · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Gil Goldreich Law Office & Notary · This is not the firm’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'גיל גולדרייך משרד עורכי דין ונוטריון', 'Gil Goldreich Law Office & Notary');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-kinds]', 'סוג התאונה', 'Kind of accident');
    aria('[data-tel]', 'התקשרו לגיל, 077-535-0634', 'Call Gil, 077-535-0634');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: רובינשטיין 43א, חיפה' : 'Map: 43A Rubinstein St, Haifa'; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('gg-lang', l); } catch (e) {}
    texts(l); hours(); fitWordmark(); writeSheet(true); decodeAll(); tick();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('gg-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    endDeal(); resetScene(); tick(); orbit.kick(); dust.kick(); seal.kick(); writeSheet(true); gauge.kick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 18], 1: [9, 18], 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 13], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function isAllDay(t) { return t && t[0] === 0 && t[1] >= 24; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, short, open = false;
    if (isAllDay(t) || (t && n.h >= t[0] && n.h < t[1])) {
      open = true;
      txt = isAllDay(t) ? (l ? 'פתוח עכשיו' : 'Open now') : (l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]));
      short = txt;
    } else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); short = l ? 'נפתח היום ב-' + hhmm(t[0]) : 'Opens today at ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      if (!H[nd]) { txt = l ? 'סגור עכשיו' : 'Closed now'; short = txt; }
      else if (nd === (n.d + 1) % 7) { txt = l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]); short = l ? 'נפתח מחר ב-' + hhmm(H[nd][0]) : 'Opens tomorrow at ' + hhmm(H[nd][0]); }
      else { txt = l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]); short = l ? 'נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]); }
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-status-short]').forEach(function (el) { el.textContent = short; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = isAllDay(t) ? (l ? '24 שעות' : '24 hours') : t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento,.trio,.cbento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- letters: the name settles in out of a blur; the footer name rises
  function split(sp, start) {
    var i = start || 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  }
  $$('.h-name .nm > span[lang]').forEach(function (sp, k) { split(sp, k > 1 ? 4 : 0); });
  $$('[data-wordmark] > span[lang]').forEach(function (sp) { split(sp, 0); });

  // ---------------------------------------------------------------- opening: the real photos are dealt while the logo's diamond fills
  var deal = $('[data-deal]'), dealt = false;
  function endDeal() { if (dealt) return; dealt = true; root.classList.remove('dealing'); if (deal) { deal.classList.add('done'); setTimeout(function () { deal.remove(); }, 600); } }
  var seen = false; try { seen = sessionStorage.getItem('gg-dealt') === '1'; sessionStorage.setItem('gg-dealt', '1'); } catch (e) {}
  if (deal && !still() && !seen && scrollY < 50) {
    root.classList.add('dealing');
    deal.addEventListener('click', endDeal);
    addEventListener('keydown', endDeal, { once: true });
    setTimeout(endDeal, 1150);
  } else endDeal();

  // ---------------------------------------------------------------- the orbit of his real photos around the diamond: turns by itself, with the scroll and with a drag
  var hero = $('[data-hero]'), stage = $('[data-stage]');
  var orbit = (function () {
    var el = $('[data-orbit]'), cards = $$('.oc', el), N = cards.length, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = true, last = 0;
    function frame(t) {
      raf = 0; if (still()) return;
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (9 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var dw = stage.offsetWidth, R = phone() ? dw * .62 : dw * .78, tilt = -9 * Math.PI / 180, sc = scrollY * .05 * (rtl() ? 1 : -1);
      cards.forEach(function (c, i) {
        var a = (rot + sc + i * 360 / N) * Math.PI / 180, x = Math.sin(a) * R, z = Math.cos(a) * R, y = z * .2;
        var X = x * Math.cos(tilt) - y * Math.sin(tilt), Y = x * Math.sin(tilt) + y * Math.cos(tilt) - dw * .05;
        var f = (z / R + 1) / 2;
        c.style.transform = 'translate(-50%,-50%) perspective(1100px) translate3d(' + X.toFixed(1) + 'px,' + Y.toFixed(1) + 'px,' + (z * .9).toFixed(1) + 'px) rotateY(' + (Math.sin(a) * 22).toFixed(1) + 'deg)';
        c.style.opacity = (.35 + .65 * f).toFixed(3);
        c.style.zIndex = 1;   // the ring passes behind the diamond, never over his face
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still()) { last = 0; raf = requestAnimationFrame(frame); } }
    stage.addEventListener('pointerdown', function (e) { if (still() || e.pointerType !== 'mouse') return; drag = true; lx = e.clientX; });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .25; vel = dx * 2 * (rtl() ? 1 : -1); });
    addEventListener('pointerup', function () { drag = false; });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // the diamond leans toward the hand, its silver catching the light; on touch it breathes with the scroll
  var diaIn = $('.dia-in');
  hero.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var r = stage.getBoundingClientRect(), dx = (e.clientX - (r.left + r.width / 2)) / innerWidth, dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
    diaIn.style.setProperty('--ty', (dx * 18).toFixed(2) + 'deg'); diaIn.style.setProperty('--tx', (-dy * 18).toFixed(2) + 'deg');
    diaIn.style.setProperty('--sx', (dx * 120).toFixed(1) + '%');
  });
  hero.addEventListener('pointerleave', function () { diaIn.style.setProperty('--tx', '0deg'); diaIn.style.setProperty('--ty', '0deg'); });

  // ---------------------------------------------------------------- silver dust drifting in the hero light, parting around the hand
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), P = [], w = 0, h = 0, raf = 0, vis = true, mx = -999, my = -999, t0 = 0;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 46 : 90; P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.6 + .4, vx: (Math.random() - .5) * .12, vy: -Math.random() * .18 - .04, a: Math.random() * .5 + .15, ph: Math.random() * 6.28 });
    }
    function frame(t) {
      raf = 0; c.clearRect(0, 0, w, h); if (still()) return;
      P.forEach(function (p) {
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 14400) { var f = (1 - d2 / 14400) * 1.6; p.x += dx / Math.sqrt(d2 + 1) * f; p.y += dy / Math.sqrt(d2 + 1) * f; }
        p.x += p.vx; p.y += p.vy; if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; } if (p.x < -5) p.x = w + 5; if (p.x > w + 5) p.x = -5;
        c.globalAlpha = p.a * (.6 + .4 * Math.sin(t / 900 + p.ph)); c.fillStyle = '#d3d7dd'; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- labels that decode out of scrambled glyphs
  var GLY = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHKLMNPRSTUVWXYZ' };
  function decode(el) {
    var final = el.dataset.final || el.textContent; el.dataset.final = final;
    if (still()) { el.textContent = final; return; }
    var set = GLY[el.getAttribute('lang') === 'en' ? 'en' : 'he'], n = 0, steps = 16;
    (function run() {
      n++;
      el.textContent = final.split('').map(function (ch, i) { return ch === ' ' || ch === ',' || i < (n / steps) * final.length ? ch : set[(Math.random() * set.length) | 0]; }).join('');
      if (n < steps) setTimeout(run, 40); else el.textContent = final;
    })();
  }
  function decodeAll() { $$('[data-decode]').forEach(function (el) { if (el.dataset.final) el.textContent = el.dataset.final; }); }

  // ---------------------------------------------------------------- bento spotlight; on touch it drifts across the tiles by itself
  $$('[data-spot] .tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = t.getBoundingClientRect(); t.style.setProperty('--lx', (e.clientX - r.left) + 'px'); t.style.setProperty('--ly', (e.clientY - r.top) + 'px'); });
    t.addEventListener('pointerleave', function () { t.style.setProperty('--lx', '-999px'); });
  });

  // ---------------------------------------------------------------- the medical-board gauge
  var gauge = (function () {
    var tile = $('.t-nii'), needle = $('.g-needle'), fill = $('.g-fill'), read = $('[data-gauge-read]'), vals = [20, 37, 50, 74, 30], k = 0, timer = 0, vis = false, cur = 0;
    function set(v) {
      needle.style.transition = still() ? 'none' : 'transform 1.4s cubic-bezier(.23,1,.32,1)';
      fill.style.transition = still() ? 'none' : 'stroke-dashoffset 1.4s cubic-bezier(.23,1,.32,1)';
      needle.style.transform = 'rotate(' + (-90 + v * 1.8) + 'deg)'; fill.style.strokeDashoffset = 100 - v;
      var from = cur, t0 = performance.now(); cur = v;
      if (still()) { read.textContent = v; return; }
      (function step(t) { var p = smooth((t - t0) / 1200); read.textContent = Math.round(lerp(from, v, p)); if (p < 1) requestAnimationFrame(step); })(t0);
    }
    function loop() { clearTimeout(timer); if (!vis || still()) return; set(vals[k++ % vals.length]); timer = setTimeout(loop, 2800); }
    watch(tile, function (v) { vis = v; loop(); });
    if (still()) set(50);
    return { kick: function () { if (still()) set(50); else loop(); } };
  })();

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    var target = o.dataset.odo, dec = (target.split('.')[1] || '').length, val = parseFloat(target), done = false;
    o.classList.add('odo');
    function paint(str, flick) {
      if (o.children.length !== str.length) o.innerHTML = str.split('').map(function () { return '<span class="dg"></span>'; }).join('');
      str.split('').forEach(function (ch, i) {
        var d = o.children[i]; if (d.textContent === ch) return; d.textContent = ch;
        if (flick && d.animate) d.animate([{ transform: 'translateY(-45%)', opacity: .25 }, { transform: 'none', opacity: 1 }], { duration: 140, easing: 'cubic-bezier(.23,1,.32,1)' });
      });
    }
    function run() {
      if (done) return; done = true;
      if (still()) { paint(target, false); return; }
      var t0 = performance.now(), dur = 1500;
      (function step(t) { var p = smooth((t - t0) / dur), v = val * p, str = v.toFixed(dec); while (str.length < target.length) str = '0' + str; paint(str, true); if (p < 1) requestAnimationFrame(step); else paint(target, false); })(t0);
    }
    paint(target, false);
    if (still() || !io) return;
    var zero = (0).toFixed(dec); while (zero.length < target.length) zero = '0' + zero; paint(zero, false);
    watch(o, function (v) { if (v) run(); }, { rootMargin: '0px 0px -10% 0px' });
  });

  // ---------------------------------------------------------------- AFTER: the rules from the firm's own articles, written onto one sheet
  var RULES = {
    road: { he: ['רושמים את פרטי כל הרכבים והנהגים המעורבים, ובודקים שהטלפון שנמסר באמת מצלצל.', 'רושמים את פרטי העדים ושומרים איתם על קשר.', 'מגיעים לטיפול רפואי מיד, לא בערב ולא למחרת.', 'מוודאים שכל התלונות רשומות בתעודת חדר המיון. אם משהו חסר, מבקשים מהרופא לתקן ולחתום.', 'מוסרים לכל גורם רק עותקים של מסמכים רפואיים, לא מקור.', 'לא משוחחים עם חוקרים של חברת הביטוח לפני שמתייעצים עם עורך דין.', 'מוסרים עדות במשטרת התנועה ומקבלים אישור על התאונה.'],
            en: ['Write down the details of every vehicle and driver involved, and check that the phone number you were given really rings.', 'Write down the witnesses’ details and stay in touch with them.', 'Get medical treatment right away, not in the evening and not the next day.', 'Make sure every complaint is written on the ER form. If something is missing, ask the doctor to correct it and sign.', 'Give anyone only copies of medical documents, never the originals.', 'Don’t talk to insurance company investigators before consulting a lawyer.', 'Give a statement at the traffic police and get a confirmation of the accident.'],
            t: { he: 'אחרי תאונת דרכים', en: 'After a road accident' } },
    work: { he: ['מגיעים לטיפול מיד, לא בסוף יום העבודה ולא למחרת. עיכוב עלול לפגוע בהכרה בתאונה.', 'לא חותמים לנהג האמבולנס על שום טופס לפני שבודקים שרשם את מקום התאונה ואת נסיבותיה.', 'מוודאים שהמסמך הרפואי הראשון מפרט את כל התלונות.', 'תאונת דרכים בדרך לעבודה או ממנה היא גם תאונת עבודה.', 'מוסרים לכל גורם רק עותקים של מסמכים רפואיים, לא מקור.', 'שומרים כל קבלה על הוצאה שקשורה לתאונה.'],
            en: ['Get treatment right away, not at the end of the working day and not the next day. A delay can harm recognition of the accident.', 'Don’t sign any form for the ambulance driver before checking that he recorded where and how the accident happened.', 'Make sure the first medical document lists every complaint.', 'A road accident on the way to or from work is also a work accident.', 'Give anyone only copies of medical documents, never the originals.', 'Keep every receipt for expenses connected to the accident.'],
            t: { he: 'אחרי תאונת עבודה', en: 'After a work accident' } },
    army: { he: ['מגיעים מיד למרפאת היחידה, ומחוץ לבסיס לחדר המיון הקרוב. בזמן השירות אי אפשר לפנות לקופת חולים.', 'מוודאים שכל מקום שנפגע רשום במסמך הרפואי. פגיעה שלא נרשמה עלולה שלא להיות מוכרת.', 'לא חותמים לנהג האמבולנס על שום טופס לפני שבודקים מה הוא רשם.', 'נפגעתם ברכב אזרחי בדרך לבסיס או ממנו? אפשר לבחור בין תביעה מול משרד הביטחון לבין תביעת תאונת דרכים.', 'ברכב צבאי, התביעה בדרך כלל רק מול משרד הביטחון.', 'מוסרים לכל גורם רק עותקים של מסמכים רפואיים, לא מקור.'],
            en: ['Go straight to the unit clinic, or off base to the nearest ER. During service you can’t go to your health fund.', 'Make sure every injured spot is written in the medical record. An injury that wasn’t recorded may not be recognised.', 'Don’t sign any form for the ambulance driver before checking what he wrote.', 'Hurt in a civilian car on the way to or from base? You can choose between a Ministry of Defence claim and a road-accident claim.', 'In a military vehicle, the claim is usually only against the Ministry of Defence.', 'Give anyone only copies of medical documents, never the originals.'],
            t: { he: 'אחרי פציעה בצבא', en: 'After an injury in the army' } }
  };
  var kind = 'road', sheet = $('[data-sheet]'), rulesEl = $('[data-rules]'), steps = $$('[data-steps] li'), writeTok = 0, sheetSeen = false;
  var TICK = '<svg class="tick" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M6.5 12.5l3.5 3.5 7.5-8"/></svg>';
  function light(n) { steps.forEach(function (s, i) { s.classList.toggle('lit', i < n); }); }
  function writeSheet(instant) {
    var tok = ++writeTok, l = he() ? 'he' : 'en', list = RULES[kind][l];
    $('[data-sheet-title]').textContent = RULES[kind].t[l];
    sheet.classList.remove('sealed');
    if (instant || still() || !sheetSeen) {
      rulesEl.innerHTML = list.map(function (r) { return '<li class="done">' + TICK + '<span>' + r + '</span></li>'; }).join('');
      if (still() || instant) { sheet.classList.add('sealed'); light(4); }
      return;
    }
    rulesEl.innerHTML = list.map(function () { return '<li>' + TICK + '<span></span></li>'; }).join('');
    light(2);
    var items = $$('li', rulesEl), i = 0;
    (function next() {
      if (tok !== writeTok) return;
      if (i >= items.length) { sheet.classList.add('sealed'); light(4); return; }
      var li = items[i], sp = $('span', li), txt = list[i], c = 0;
      (function type() {
        if (tok !== writeTok) return;
        c = Math.min(txt.length, c + 3); sp.textContent = txt.slice(0, c);
        if (c < txt.length) setTimeout(type, 16); else { li.classList.add('done'); i++; setTimeout(next, 140); }
      })();
    })();
  }
  $$('[data-kind]').forEach(function (b) {
    b.addEventListener('click', function () {
      kind = b.dataset.kind; $$('[data-kind]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      light(1); writeSheet(false);
    });
  });
  watch(sheet, function (v) { if (v && !sheetSeen) { sheetSeen = true; light(1); writeSheet(false); } }, { rootMargin: '0px 0px -25% 0px' });
  $('[data-share]').addEventListener('click', function () {
    var l = he() ? 'he' : 'en', txt = RULES[kind].t[l] + ' · ' + (l === 'he' ? 'גיל גולדרייך, עורך דין ונוטריון' : 'Gil Goldreich, lawyer & notary') + '\n\n' + RULES[kind][l].map(function (r) { return '• ' + r; }).join('\n') + '\n\n' + (l === 'he' ? 'טלפון: ' : 'Phone: ') + '077-535-0634';
    var btn = this, label = $('span[lang="' + l + '"]', btn), old = label.textContent;
    function done(msg) { label.textContent = msg; setTimeout(function () { label.textContent = old; }, 1800); }
    if (navigator.share) navigator.share({ title: RULES[kind].t[l], text: txt }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { done(l === 'he' ? 'הועתק' : 'Copied'); }, function () {});
  });

  // ---------------------------------------------------------------- NOTARY: the real logo's diamond, grain by grain, pressed into the paper
  var seal = (function () {
    var box = $('[data-notpaper]'), cv = $('[data-sealcv]'), c = cv.getContext('2d'), src = $('[data-sealsrc]'), P = [], ok = false, w = 0, raf = 0, vis = false, prog = 0, mx = -999, my = -999, pulse = null;
    function sample() {
      var iw = src.naturalWidth, ih = src.naturalHeight; if (!iw) return;
      var x0 = Math.round(iw * 447 / 509), sw = iw - x0;   // the diamond with its G, at the logo's end
      var oc = document.createElement('canvas'); oc.width = sw; oc.height = ih; var o = oc.getContext('2d'); o.drawImage(src, x0, 0, sw, ih, 0, 0, sw, ih);
      var d; try { d = o.getImageData(0, 0, sw, ih).data; } catch (e) { return; }
      P = [];
      for (var y = 0; y < ih; y++) for (var x = 0; x < sw; x++) {
        var k = (y * sw + x) * 4; if (d[k + 3] < 120) continue;
        var lum = (d[k] + d[k + 1] + d[k + 2]) / 3;
        P.push({ u: x / sw - .5, v: y / ih - .5, g: lum > 140, sx: Math.random() * 2 - .5, sy: Math.random() * 2 - .5, j: Math.random() });
      }
      ok = P.length > 0; size();
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = box.clientWidth; cv.width = w * dpr; cv.height = w * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); draw(); }
    function draw(t) {
      if (!ok) return;
      var p = still() ? 1 : prog, S = w * .56, cx = w / 2, cy = w / 2, g = smooth(p / .75), press = smooth((p - .72) / .28), dot = Math.max(1.4, S / 52);
      var scale = 1 + (1 - press) * .08 * (p > .72 ? 1 : 0);
      c.clearRect(0, 0, w, w);
      // the pressed ring of the seal
      if (press > 0) {
        c.globalAlpha = press; c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.arc(cx - 1, cy - 1, w * .43, 0, 6.283); c.stroke();
        c.strokeStyle = 'rgba(60,54,40,.28)'; c.beginPath(); c.arc(cx + 1.5, cy + 1.5, w * .43, 0, 6.283); c.stroke(); c.globalAlpha = 1;
      }
      for (var i = 0; i < P.length; i++) {
        var q = P[i], tx = cx + q.u * S * scale, ty = cy + q.v * S * scale, e = smooth((g - q.j * .35) / .65);
        var x = lerp(q.sx * w, tx, e), y = lerp(q.sy * w, ty, e);
        if (mx > -900 && !still()) { var dx = x - mx, dy = y - my, d2 = dx * dx + dy * dy; if (d2 < 3600) { var f = (1 - d2 / 3600) * 10; x += dx / Math.sqrt(d2 + 1) * f; y += dy / Math.sqrt(d2 + 1) * f; } }
        if (pulse && !still()) { var age = (t - pulse.t) / 900; if (age < 1) { var pdx = x - pulse.x, pdy = y - pulse.y, pd = Math.sqrt(pdx * pdx + pdy * pdy), ring = age * w * .6; if (Math.abs(pd - ring) < 30) { var k = (1 - Math.abs(pd - ring) / 30) * 8 * (1 - age); x += pdx / (pd + 1) * k; y += pdy / (pd + 1) * k; } } }
        // embossed: light from top-left, shade to bottom-right, the G raised more than the field
        var lift = (q.g ? 1.6 : .9) * press;
        if (lift > 0) { c.fillStyle = 'rgba(255,255,255,' + (.5 * press).toFixed(3) + ')'; c.fillRect(x - lift, y - lift, dot, dot); c.fillStyle = 'rgba(70,62,46,' + (.35 * press).toFixed(3) + ')'; c.fillRect(x + lift, y + lift, dot, dot); }
        c.fillStyle = q.g ? (press > .5 ? '#d9d2c2' : '#e4e7eb') : (press > .5 ? '#bdb5a2' : '#6b717a');
        c.globalAlpha = .35 + .65 * e; c.fillRect(x, y, dot, dot); c.globalAlpha = 1;
      }
    }
    function frame(t) { raf = 0; draw(t); if (vis && !still() && (mx > -900 || (pulse && t - pulse.t < 900))) raf = requestAnimationFrame(frame); }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    box.addEventListener('pointermove', function (e) { var r = box.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; kick(); });
    box.addEventListener('pointerleave', function () { mx = my = -999; kick(); });
    box.addEventListener('pointerdown', function (e) { var r = box.getBoundingClientRect(); pulse = { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }; kick(); });
    watch(box, function (v) { vis = v; if (v) kick(); });
    if (src.complete && src.naturalWidth) sample(); else src.addEventListener('load', sample);
    return { size: function () { if (ok) size(); }, set: function (p) { if (Math.abs(p - prog) > .001) { prog = p; kick(); } }, kick: kick };
  })();

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked (all of it reverses on the way up)
  var nav = $('[data-nav]'), gil = $('[data-iris]'), irisPhoto = $('[data-iris-photo]'), irisImg = $('img', irisPhoto), callouts = $('[data-callouts]'), gilCard = $('[data-gilcard]');
  var areas = $('[data-areas]'), areasIn = $('[data-areas-in]'), team = $('#team'), notary = $('[data-notary]');
  var shrink = $('[data-shrink]'), shrinkPhoto = $('[data-shrink-photo]'), shrinkH = $('.shrink-h'), rvs = $$('.rv'), pano = $('[data-pano]'), panoIn = $('.pano-in', pano);
  var callsOn = false, foot = $('[data-foot]'), wm = $('[data-wordmark]');
  function prog(el, start, len) { var r = el.getBoundingClientRect(); return clamp((start - r.top) / len, 0, 1); }
  function resetScene() {
    irisPhoto.style.clipPath = ''; irisImg.style.transform = ''; areasIn.style.transform = ''; areasIn.style.opacity = '';
    shrinkPhoto.style.clipPath = ''; shrinkH.style.opacity = ''; rvs.forEach(function (r) { r.style.transform = ''; r.style.opacity = ''; });
    callouts.classList.toggle('on', still()); gilCard.classList.toggle('on', still());
    if (still()) { $$('[data-decode]', callouts).forEach(decode); }
  }
  function tick() {
    var vh = innerHeight, vw = innerWidth;
    nav.classList.toggle('pill', scrollY > 40);
    foot.classList.toggle('curtain', !still() && $('main').getBoundingClientRect().bottom < vh * 2);
    if (still()) { seal.set(1); return; }
    // the diamond iris opens out of the hero into the office
    var p = prog(gil, 0, gil.offsetHeight - vh), q = smooth(p / .5);
    var s0 = Math.max(Math.min(vw, vh) * .3, vw * .4), s1 = Math.hypot(vw, vh) * .75, s = lerp(s0, s1, q), cx = vw / 2, cy = vh / 2;
    var pct = function (v, base) { return (v / base * 100).toFixed(2) + '%'; };
    irisPhoto.style.clipPath = q >= 1 ? 'none' : 'polygon(' + pct(cx, vw) + ' ' + pct(cy - s, vh) + ',' + pct(cx + s, vw) + ' ' + pct(cy, vh) + ',' + pct(cx, vw) + ' ' + pct(cy + s, vh) + ',' + pct(cx - s, vw) + ' ' + pct(cy, vh) + ')';
    irisImg.style.transform = 'scale(' + lerp(1.22, 1.02, smooth(p)).toFixed(4) + ')';
    var on = p > .5;
    if (on !== callsOn) { callsOn = on; callouts.classList.toggle('on', on); gilCard.classList.toggle('on', on); if (on) $$('[data-decode]', callouts).forEach(decode); }
    // the team sheet rides up over the practice areas
    if (areas) {
      var tr = team.getBoundingClientRect(), k = clamp(1 - tr.top / vh, 0, 1);
      areas.style.top = Math.min(0, vh - areas.offsetHeight) + 'px';
      areasIn.style.transform = 'scale(' + (1 - k * .06).toFixed(4) + ')'; areasIn.style.opacity = (1 - k * .55).toFixed(3);
    }
    // team photo: on phones the panorama pans with the scroll
    if (phone()) { var pp = prog(pano, vh, vh + pano.offsetHeight); panoIn.style.setProperty('--pan', ((pp - .5) * 60).toFixed(1) + 'px'); panoIn.style.setProperty('--pz', 1.25); }
    // the notary seal gathers as you arrive and presses at the centre of the screen
    seal.set(phone() ? prog(notary, vh * 1.05, vh * .55) : prog(notary, vh * .95, vh * .75));
    // reviews land on the desk one by one
    rvs.forEach(function (r, i) {
      var b = r.getBoundingClientRect(), t = smooth(clamp((vh - b.top) / (vh * .45), 0, 1));
      r.style.opacity = t.toFixed(3);
      r.style.transform = 'translateY(' + ((1 - t) * 90).toFixed(1) + 'px) rotate(calc(var(--r) * ' + (phone() ? .4 : 1) + ' + ' + ((1 - t) * (i % 2 ? 7 : -7)).toFixed(2) + 'deg)) scale(' + (1 + (1 - t) * .04).toFixed(3) + ')';
    });
    // Haifa shrinks from full screen into its frame
    var sp = smooth(prog(shrink, 0, shrink.offsetHeight - vh) / .8);
    var ix = lerp(0, phone() ? 4 : 9, sp), iy = lerp(0, phone() ? 12 : 12, sp);
    shrinkPhoto.style.clipPath = 'inset(' + iy.toFixed(2) + '% ' + ix.toFixed(2) + '% ' + iy.toFixed(2) + '% ' + ix.toFixed(2) + '% round ' + (sp * 28).toFixed(1) + 'px)';
    shrinkPhoto.firstElementChild.style.transform = 'scale(' + lerp(1.12, 1, sp).toFixed(4) + ')';
  }

  // team panorama: a warm light and a slight pan follow the hand
  pano.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || still()) return;
    var r = pano.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    pano.style.setProperty('--plx', (x * 100).toFixed(1) + '%'); pano.style.setProperty('--ply', (y * 100).toFixed(1) + '%');
    panoIn.style.setProperty('--pan', ((.5 - x) * 24).toFixed(1) + 'px'); panoIn.style.setProperty('--pz', 1.04);
  });
  pano.addEventListener('pointerleave', function () { panoIn.style.setProperty('--pan', '0px'); panoIn.style.setProperty('--pz', 1); });

  // ---------------------------------------------------------------- footer: name fitted to the width, rising when the curtain opens
  function fitWordmark() {
    wm.style.fontSize = '100px';
    var sp = $('span[lang="' + root.lang + '"]', wm); if (!sp) return;
    var w = sp.getBoundingClientRect().width || 1, avail = wm.clientWidth;
    wm.style.fontSize = Math.min(220, Math.floor(100 * avail / w * .98)) + 'px';
  }
  watch(foot, function (v) { if (v) { foot.classList.add('in'); wm.classList.add('in'); } }, { rootMargin: '0px 0px -10% 0px' });

  // ---------------------------------------------------------------- layout
  var rz = 0;
  function layout() { dust.size(); seal.size(); fitWordmark(); tick(); }
  addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', function () { requestAnimationFrame(tick); }, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWordmark);

  texts(root.lang); hours(); writeSheet(true); resetScene(); layout(); orbit.kick();
  window.__gg = { tick: tick, setLang: setLang, seal: seal };
})();
