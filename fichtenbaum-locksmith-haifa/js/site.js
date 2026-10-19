(function () {
  var root = document.documentElement, WA = '972522660148';
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: 'א. פיכטנבאום · מנעולן ושכפול מפתחות · עין דור 13, חיפה', en: 'A. Fichtenbaum · Locksmith & key cutting · 13 Ein Dor St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור א. פיכטנבאום · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for A. Fichtenbaum · This is not the business’s official website' };

  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    document.title = TITLE[l];
    document.querySelector('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    try { localStorage.setItem('lang', l); } catch (e) {}
    var w = document.querySelector('[name=where]'); if (w) w.placeholder = w.dataset['ph' + (l === 'he' ? 'He' : 'En')];
    document.querySelectorAll('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    document.querySelector('.fkey').setAttribute('aria-label', l === 'he' ? 'יצירת קשר מהירה' : 'Quick contact');
    document.querySelector('.chambers').setAttribute('aria-label', l === 'he' ? 'שלבי הסיפור בתוך המנעול' : 'Stages of the story inside the lock');
    document.querySelectorAll('.chamber').forEach(function (b) { var s = b.querySelector('[lang="' + l + '"]'); b.title = s ? s.textContent : ''; });
    write(); status(); hours(); fitAll(); if (window.__trackRender) window.__trackRender();
  }
  document.querySelectorAll('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // animations switch, remembered for next time
  var switches = [].slice.call(document.querySelectorAll('[data-motion-toggle]'));
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI(); write();
    if (window.__motion3d) window.__motion3d(on);
    if (window.__trackRender) window.__trackRender();
  }); });
  motionUI();

  // the wordmark fills the tag's width, whatever the language or font; a very long name wraps to two lines instead of shrinking away
  function fitAll() { document.querySelectorAll('[data-fit]').forEach(fitWordmark); }
  function fitWordmark(el) {
    var h1 = el.parentNode, phone = innerWidth < 760, min = phone ? 36 : 64;
    h1.classList.remove('wrap'); h1.style.fontSize = '100px';
    var w = el.getBoundingClientRect().width, avail = h1.clientWidth; if (!w || !avail) return;
    var size = Math.min(240, Math.floor(100 * avail / w * 0.99));
    if (size >= min) { h1.style.fontSize = size + 'px'; return; }
    h1.classList.add('wrap'); h1.style.fontSize = min + 'px';
  }
  addEventListener('resize', fitAll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);

  // live opening status in Haifa time. null = closed that day
  var H = { 0: [8, 16], 1: [8, 16], 2: [8, 16], 3: [8, 16], 4: [8, 16], 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      var full = H[nd] && H[nd][0] === 0 && H[nd][1] === 24;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now') : full ? (l ? 'סגור עכשיו · ביום ' + dayHe[nd] + ' פתוח 24 שעות' : 'Closed now · open 24 hours on ' + dayEn[nd])
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    document.querySelectorAll('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    var tr = document.querySelectorAll('[data-hours] tr'); tr.forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // the hours table: consecutive days with the same hours share a row
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    document.querySelector('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var two = r[1] - r[0] === 1;
      var label = r[0] === r[1] ? names[r[0]] : names[r[0]] + (two ? (l ? ' ו' : ' and ') : (l ? ' עד ' : ' to ')) + names[r[1]];
      var time = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + label + '</td><td>' + time + '</td></tr>';
    }).join('');
    status();
  }
  window.__status = status; window.__H = H; window.__hours = hours;

  // the counter ticket writes the WhatsApp message from the blank you picked
  var T = {
    he: { n: { home: 'שכפול מפתח לבית', car: 'מפתח לרכב', remote: 'שכפול שלט', out: 'פתיחת דלת, ננעלתי בחוץ', cyl: 'החלפת צילינדר', door: 'פלדלת או דלת רב-בריח', safe: 'כספת' },
          hi: 'שלום פיכטנבאום, הגעתי דרך האתר. אשמח לעזרה עם ', at: ', באזור ', end: '. מתי אפשר?' },
    en: { n: { home: 'copying a house key', car: 'a car key', remote: 'copying a remote', out: 'opening a door, I’m locked out', cyl: 'changing a cylinder', door: 'a steel or multi-bolt door', safe: 'a safe' },
          hi: 'Hello Fichtenbaum, I found you through your website. I would like help with ', at: ', in ', end: '. When would suit you?' }
  };
  var form = document.getElementById('composer'), preview = document.querySelector('[data-preview]'), send = document.querySelector('[data-send]');
  function write() {
    var t = T[root.lang] || T.he, f = new FormData(form), where = (f.get('where') || '').trim().slice(0, 80);
    var m = t.hi + t.n[f.get('need') || 'home'] + (where ? t.at + where : '') + t.end;
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    type(m);
  }
  var typeT = 0;
  function type(m) {
    clearInterval(typeT);
    if (still()) { preview.textContent = m; return; }
    var i = 0, caret = '<span class="caret"></span>';
    preview.innerHTML = caret;
    typeT = setInterval(function () {
      i = Math.min(m.length, i + 2);
      preview.textContent = m.slice(0, i);
      if (i < m.length) preview.insertAdjacentHTML('beforeend', caret); else clearInterval(typeT);
    }, 16);
  }
  form.addEventListener('change', function (e) {
    write();
    // the picked blank swings on its hook, damped, then hangs still
    if (e.target.name === 'need' && !still() && e.target.parentNode.querySelector('svg').animate) {
      e.target.parentNode.querySelector('svg').animate([{ rotate: '0deg' }, { rotate: '9deg' }, { rotate: '-5deg' }, { rotate: '2.5deg' }, { rotate: '0deg' }], { duration: 760, easing: 'ease-out' });
    }
  });
  form.addEventListener('input', function (e) { if (e.target.name === 'where') write(); });

  // entrances, once, staggered inside each section
  document.querySelectorAll('section, .visit').forEach(function (s) { s.querySelectorAll('[data-reveal]').forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 4) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  document.querySelectorAll('[data-reveal]').forEach(function (el) { io ? io.observe(el) : el.classList.add('in'); });

  // the hero tag swings a little and shrinks as you scroll away from it
  var tag = document.querySelector('[data-tag]'), heroEl = document.querySelector('.hero'), fkey = document.querySelector('[data-fkey]');
  function heroScroll() {
    var r = heroEl.getBoundingClientRect(), k = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height)));
    if (still()) { tag.style.removeProperty('--sway'); tag.style.removeProperty('--shrink'); }
    else { tag.style.setProperty('--sway', (k * (he() ? -4 : 4)).toFixed(2)); tag.style.setProperty('--shrink', (1 - 0.08 * k).toFixed(3)); }
  }
  // the floating key shows once the hero's buttons are gone, and steps aside over the visit card
  var away = new Set();
  function keyUI() { fkey.classList.toggle('show', away.size === 0); }
  if ('IntersectionObserver' in window) {
    var kio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? away.add(e.target) : away.delete(e.target); }); keyUI(); }, { threshold: 0 });
    [document.querySelector('.tag-foot'), document.querySelector('.card'), document.querySelector('.back-addr'), document.querySelector('.counter'), document.querySelector('[data-stage]')].forEach(function (el) { kio.observe(el); });
  } else fkey.classList.add('show');

  // the footage only plays with animations on and while it is on screen
  var clip = document.querySelector('[data-clip]'), clipSeen = false;
  function clipUI() { if (!clip) return; if (!still() && clipSeen) { var pr = clip.play(); if (pr && pr.catch) pr.catch(function () {}); } else clip.pause(); }
  if (clip && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { clipSeen = es[0].isIntersecting; clipUI(); }, { threshold: 0.2 }).observe(clip);
  switches.forEach(function (b) { b.addEventListener('click', clipUI); });

  // ---------------------------------------------------------------- the lock story
  var track = document.querySelector('[data-track]'), stage = track.querySelector('[data-stage]');
  var stillImg = track.querySelector('[data-still]'), capT = track.querySelector('[data-cap-title]'), capX = track.querySelector('[data-cap-text]');
  var chambers = [].slice.call(track.querySelectorAll('[data-go]'));
  var STAGES = [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1];
  var S = {
    he: [['המפתח נתקע.', 'מפתח שחוק כבר לא מרים שני פינים מספיק גבוה. הפינים העליונים שלהם חוצים את קו הגזירה, הגליל זז מילימטר ונעצר, והבריחים נשארים בתוך המשקוף.'],
         ['קו הגזירה.', 'בכל תא יש קפיץ, פין עליון ופין תחתון. הקו שבין הגליל המסתובב לגוף הצילינדר הוא הקו הקובע. כשהמפתח השחוק יוצא, הפינים יורדים לאורך השיניים שלו.'],
         ['פותחים, פין אחרי פין.', 'מפתח מתח מסובב את הגליל קלות, וכל פין מורם עד שהפין העליון נתפס מעל הקו. כשכל החמישה בחוץ, הגליל מסתובב וגלגל השיניים מושך את שלושת הבריחים.'],
         ['צילינדר חדש.', 'כשהדלת פתוחה, משחררים את בורג הצילינדר מצד הדלת, שולפים את הצילינדר הישן ומכניסים חדש, עם פינים באורכים אחרים.'],
         ['עותק במכונת השכפול.', 'המפתח המקורי והמפתח הריק נתפסים זה לצד זה. מחט עוקבת אחרי השיניים של המקור, והסכין חותכת את אותן שיניים בדיוק בעותק.'],
         ['כל הפינים על הקו.', 'העותק נכנס, כל פין נעצר בדיוק על קו הגזירה, הגליל מסתובב חלק והבריחים ננעלים.']],
    en: [['The key jams.', 'A worn key no longer lifts two of the pins high enough. Their driver pins sit across the shear line, so the plug moves a millimetre and stops, and the bolts stay in the frame.'],
         ['The shear line.', 'Each chamber holds a spring, a driver pin and a key pin. The gap between the turning plug and the cylinder body is the line that counts. As the worn key comes out, the pins ride down its cuts.'],
         ['Opened, pin by pin.', 'A tension wrench turns the plug ever so slightly while each pin is lifted until its driver catches above the line. With all five clear, the plug turns and the gear pulls the three bolts back.'],
         ['A new cylinder.', 'With the door open, the cylinder screw is undone from the door’s edge, the old cylinder slides out and a new one, with different pin lengths, goes in.'],
         ['A copy on the duplicator.', 'The original key and a blank are clamped side by side. A tracer follows the original’s cuts while the cutter cuts exactly the same cuts into the copy.'],
         ['Every pin on the line.', 'The copy goes in, every pin stops exactly on the shear line, the plug turns smoothly and the bolts throw.']]
  };
  var STILL_P = [0.1, 0.25, 0.42, 0.6, 0.76, 0.92];
  var STILL_W = 1200, STILL_H = 1000;
  // label anchors (fraction of the still) recorded when the stills were rendered from lock3d.js (stills.py)
  var STILL_L = {"1": [["worn", 0.583, 0.3916, "<span lang=\"he\">מפתח שחוק</span><span lang=\"en\">Worn key</span>"], ["bolts", 0.1633, 0.2494, "<span lang=\"he\">הבריחים בתוך המשקוף</span><span lang=\"en\">Bolts in the frame</span>"]], "2": [["shear", 0.2437, 0.4755, "<span lang=\"he\">קו הגזירה</span><span lang=\"en\">Shear line</span>"], ["spring", 0.6128, 0.3108, "<span lang=\"he\">קפיץ</span><span lang=\"en\">Spring</span>"], ["driver", 0.5343, 0.4013, "<span lang=\"he\">פין עליון</span><span lang=\"en\">Driver pin</span>"], ["keypin", 0.4558, 0.5416, "<span lang=\"he\">פין תחתון</span><span lang=\"en\">Key pin</span>"], ["blocked", 0.3761, 0.4012, "<span lang=\"he\">פינים שחוצים את הקו</span><span lang=\"en\">Pins across the line</span>"]], "3": [["wrench", 0.2476, 0.8712, "<span lang=\"he\">מפתח מתח</span><span lang=\"en\">Tension wrench</span>"], ["pick", 0.1358, 0.6103, "<span lang=\"he\">מרים פין אחרי פין</span><span lang=\"en\">Lifting pin by pin</span>"]], "4": [["newcyl", 0.3987, 0.3755, "<span lang=\"he\">צילינדר חדש</span><span lang=\"en\">New cylinder</span>"]], "5": [["tracer", 0.4688, 0.4729, "<span lang=\"he\">המפתח המקורי</span><span lang=\"en\">The original key</span>"], ["cutter", 0.6068, 0.3823, "<span lang=\"he\">הסכין חותכת את העותק</span><span lang=\"en\">The cutter cuts the copy</span>"]], "6": [["aligned", 0.253, 0.4541, "<span lang=\"he\">כל הפינים על הקו</span><span lang=\"en\">Every pin on the line</span>"]]};
  var slab = track.querySelector('[data-slabels]'), labelKey = '';
  function placeLabels(si) {
    var sw = stillImg.clientWidth || stage.clientWidth, sh = stillImg.clientHeight || stage.clientHeight;
    var k = Math.min(sw / STILL_W, sh / STILL_H), ox = (sw - STILL_W * k) / 2, oy = (sh - STILL_H * k) * 0.4;
    var key = si + '|' + sw + 'x' + sh + root.lang; if (key === labelKey) return; labelKey = key;
    slab.innerHTML = '';
    (STILL_L[si + 1] || []).forEach(function (l) {
      var e = document.createElement('span'); e.className = 'l3d l3d-' + l[0]; e.innerHTML = l[3];
      var x = ox + STILL_W * k * l[1], y = oy + STILL_H * k * Math.min(0.95, Math.max(0.05, l[2]));
      e.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px)'; slab.appendChild(e);
    });
  }
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var shown = -1;
  function render() {
    heroScroll();
    var r = track.getBoundingClientRect(), ps = clamp(-r.top / Math.max(1, r.height - innerHeight)), l = he() ? 'he' : 'en';
    var live = !!window.__lock3d, useStills = !live;
    var sg = 0; while (sg < 5 && ps >= STAGES[sg + 1]) sg++;
    if (useStills) {
      var src = 'img/still-' + (sg + 1) + '.jpg';
      if (stillImg.getAttribute('src') !== src) stillImg.src = src;
      stillImg.alt = S[l][sg][0] + ' ' + S[l][sg][1];
      placeLabels(sg);
    }
    if (sg !== shown || capT.dataset.l !== l) {
      shown = sg; capT.dataset.l = l;
      capT.textContent = S[l][sg][0]; capX.textContent = S[l][sg][1];
      chambers.forEach(function (c, i) { c.setAttribute('aria-pressed', i === sg ? 'true' : 'false'); });
    }
    if (live) window.__lock3d.set(ps);
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; render(); }); } }, { passive: true });
  addEventListener('resize', function () { labelKey = ''; render(); });
  stillImg.addEventListener('load', function () { labelKey = ''; render(); });
  chambers.forEach(function (c) { c.addEventListener('click', function () {
    var r = track.getBoundingClientRect();
    scrollTo({ top: scrollY + r.top + parseFloat(c.dataset.go) * (r.height - innerHeight), behavior: still() ? 'auto' : 'smooth' });
  }); });
  window.__trackRender = function () { shown = -1; labelKey = ''; render(); };

  var qs = new URLSearchParams(location.search).get('lang'), saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  hours();
  setLang(qs === 'en' || qs === 'he' ? qs : (saved === 'en' ? 'en' : 'he'));
  render();
  setInterval(status, 60000);
})();
