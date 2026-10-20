(function () {
  var root = document.documentElement, WA = '972544895289';
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: 'חיים מזגנים · טכנאי מזגנים ומקררים בחיפה והקריות', en: 'Haim Mazganim · AC & refrigerator technician, Haifa & Krayot' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור חיים מזגנים · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Haim Mazganim · This is not the business’s official website' };

  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    document.title = TITLE[l];
    document.querySelector('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    try { localStorage.setItem('lang', l); } catch (e) {}
    var w = document.querySelector('[name=where]'); if (w) w.placeholder = w.dataset['ph' + (l === 'he' ? 'He' : 'En')];
    document.querySelectorAll('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    document.querySelector('.pocket').setAttribute('aria-label', l === 'he' ? 'יצירת קשר מהירה' : 'Quick contact');
    document.querySelector('.keys').setAttribute('aria-label', l === 'he' ? 'שלבי הסיפור, כמו כפתורים בשלט' : 'Stages of the story, like remote buttons');
    write(); status(); hours(); if (window.__trackRender) window.__trackRender();
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

  // live opening status in Haifa time. null = closed that day; [0, 24] = around the clock
  var H = { 0: [7, 20], 1: [7, 20], 2: [7, 20], 3: [7, 20], 4: [7, 20], 5: [7, 16], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, short, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; short = l ? 'פתוח · 24 שעות' : 'Open · 24 h'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); short = l ? 'פתוח · עד ' + hhmm(t[1]) : 'Open · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); short = l ? 'נפתח ב-' + hhmm(t[0]) : 'Opens ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      var full = H[nd] && H[nd][0] === 0 && H[nd][1] === 24;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now') : full ? (l ? 'סגור עכשיו · ביום ' + dayHe[nd] + ' פתוח 24 שעות' : 'Closed now · open 24 hours on ' + dayEn[nd])
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
      short = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now') : (l ? 'סגור · נפתח ב-' + hhmm(H[nd][0]) : 'Closed · opens ' + hhmm(H[nd][0]));
    }
    document.querySelectorAll('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    document.querySelectorAll('[data-status-short]').forEach(function (el) { el.textContent = short; });
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

  // the remote writes the WhatsApp message from the mode you pressed
  var T = {
    he: { n: { warm: 'המזגן לא מקרר', drip: 'המזגן מטפטף', install: 'אני רוצה להתקין מזגן', fridge: 'יש תקלה במקרר', wash: 'יש תקלה במכונת הכביסה או במייבש' },
          hi: 'שלום חיים, הגעתי דרך האתר. ', at: '. אני ב', end: '. מתי תוכל להגיע?' },
    en: { n: { warm: 'my AC isn’t cooling', drip: 'my AC is dripping', install: 'I’d like an AC installed', fridge: 'my fridge has a fault', wash: 'my washing machine or dryer has a fault' },
          hi: 'Hello Haim, I found you through your website. ', at: '. I’m in ', end: '. When could you come?' }
  };
  var form = document.getElementById('composer'), preview = document.querySelector('[data-preview]'), send = document.querySelector('[data-send]');
  function write() {
    var t = T[root.lang] || T.he, f = new FormData(form), where = (f.get('where') || '').trim().slice(0, 80);
    var need = t.n[f.get('need') || 'warm'];
    if (root.lang === 'en') need = need.charAt(0).toUpperCase() + need.slice(1);
    var m = t.hi + need + (where ? t.at + where : '') + t.end;
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
  form.addEventListener('change', write);
  form.addEventListener('input', function (e) { if (e.target.name === 'where') write(); });

  // entrances, once, staggered inside each section
  document.querySelectorAll('section').forEach(function (s) { s.querySelectorAll('[data-reveal]').forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 4) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  document.querySelectorAll('[data-reveal]').forEach(function (el) { io ? io.observe(el) : el.classList.add('in'); });

  // the pocket remote shows once the hero's buttons are gone, and steps aside over the remote and the contact rows
  var pocket = document.querySelector('[data-pocket]'), away = new Set();
  function pocketUI() { pocket.classList.toggle('show', away.size === 0); }
  if ('IntersectionObserver' in window) {
    var kio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? away.add(e.target) : away.delete(e.target); }); pocketUI(); }, { threshold: 0 });
    [document.querySelector('.actions'), document.querySelector('.remote'), document.querySelector('.plate-rows'), document.querySelector('[data-stage]')].forEach(function (el) { kio.observe(el); });
  } else pocket.classList.add('show');

  // ---------------------------------------------------------------- the AC story
  var track = document.querySelector('[data-track]'), stage = track.querySelector('[data-stage]');
  var stillImg = track.querySelector('[data-still]'), capT = track.querySelector('[data-cap-title]'), capX = track.querySelector('[data-cap-text]'), capTemp = track.querySelector('[data-cap-temp]');
  var keys = [].slice.call(track.querySelectorAll('[data-go]'));
  var STAGES = [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1];
  // the room temperature at a scroll position, the same curve the 3D scene uses
  var sm = function (t) { return t * t * (3 - 2 * t); }, sp = function (p, a, b) { return clamp((p - a) / (b - a)); };
  function roomTemp(p) { return p < 0.14 ? 31 + 3 * sm(sp(p, 0, 0.14)) : p < 0.6 ? 34 : p < 0.83 ? 34 - 1.5 * sm(sp(p, 0.6, 0.83)) : 32.5 - 8.5 * sm(sp(p, 0.84, 0.97)); }
  var S = {
    he: [['חם בסלון.', 'המזגן בפנים עובד, אבל מה שיוצא ממנו הוא אוויר חם. המדחום בסלון מטפס מ-31 ל-34 מעלות.'],
         ['בחוץ, המאוורר עומד.', 'ביחידה החיצונית המאוורר לא מסתובב. בלי אוויר שעובר דרך הסליל הגז לא מתקרר, מד הלחץ בצד הגבוה עולה הרבה מעל הטווח, והמדחס מתחמם.'],
         ['קבל אחד, מנופח.', 'כשמורידים את המכסה רואים את הסיבה: קבל ההפעלה של המאוורר תפח. מנתקים חשמל, מוציאים אותו, מחברים קבל חדש באותם ערכים ומחזירים את המכסה.'],
         ['המאוורר חוזר, הלחץ יורד.', 'המאוורר מאיץ עד מהירות מלאה, אוויר עובר שוב דרך הסליל, ומחוג הלחץ הגבוה יורד חזרה אל הפס הירוק.'],
         ['הסליל בפנים מתקרר.', 'גז קר מגיע בצנרת הנחושת אל היחידה הפנימית. הלחות שבאוויר מתעבה על הסליל, מטפטפת למגש הניקוז ויוצאת החוצה בצינור הניקוז.'],
         ['קר בסלון.', 'האוויר שיוצא מהמזגן קר עכשיו, והמדחום בסלון יורד בהדרגה עד 24 מעלות.']],
    en: [['Hot in the living room.', 'The indoor unit is running, but what comes out is warm air. The living-room thermometer climbs from 31 to 34 degrees.'],
         ['Outside, the fan stands still.', 'In the outdoor unit the fan isn’t turning. With no air through the coil the refrigerant can’t shed its heat, the high-side gauge climbs far past its band, and the compressor runs hot.'],
         ['One swollen capacitor.', 'With the cover off, the cause shows: the fan’s run capacitor has swollen. Power off, the old one out, a new one of the same rating in, and the cover goes back on.'],
         ['The fan returns, pressure falls.', 'The fan spins up to full speed, air moves through the coil again, and the high-side needle drops back into the green band.'],
         ['The indoor coil goes cold.', 'Cold refrigerant reaches the indoor unit through the copper lines. Moisture in the air condenses on the coil, drips into the drain pan and leaves through the drain hose.'],
         ['Cool in the living room.', 'The air from the unit is cold now, and the living-room thermometer slowly falls to 24 degrees.']]
  };
  var STILL_W = 1200, STILL_H = 1000;
  // label anchors (fraction of the still) recorded when the stills were rendered from ac3d.js (stills.py)
  var STILL_L = {"1": [["temp", 0.4346, 0.5398, "<span lang=\"he\">33° בחדר</span><span lang=\"en\">33° in the room</span>"], ["warm", 0.5257, 0.4663, "<span lang=\"he\">אוויר חם יוצא מהמזגן</span><span lang=\"en\">Warm air from the unit</span>"]], "2": [["cap", 0.4134, 0.3791, "<span lang=\"he\">קבל מנופח</span><span lang=\"en\">A swollen capacitor</span>"], ["high", 0.3753, 0.7977, "<span lang=\"he\">לחץ גבוה מדי</span><span lang=\"en\">Head pressure far too high</span>"]], "3": [["newcap", 0.4081, 0.4848, "<span lang=\"he\">קבל חדש</span><span lang=\"en\">A new capacitor</span>"]], "4": [["spin", 0.5162, 0.405, "<span lang=\"he\">המאוורר מסתובב</span><span lang=\"en\">The fan turns again</span>"]], "5": [["coil", 0.5279, 0.408, "<span lang=\"he\">הסליל בפנים מתקרר</span><span lang=\"en\">The indoor coil goes cold</span>"], ["pan", 0.5008, 0.5258, "<span lang=\"he\">מגש הניקוז</span><span lang=\"en\">Drain pan</span>"]], "6": [["temp", 0.4962, 0.4937, "<span lang=\"he\">25° בחדר</span><span lang=\"en\">25° in the room</span>"], ["cool", 0.4752, 0.4495, "<span lang=\"he\">אוויר קר</span><span lang=\"en\">Cold air</span>"]]};
  var slab = track.querySelector('[data-slabels]'), labelKey = '';
  function placeLabels(si) {
    var sw = stillImg.clientWidth || stage.clientWidth, sh = stillImg.clientHeight || stage.clientHeight;
    var k = Math.max(sw / STILL_W, sh / STILL_H), ox = (sw - STILL_W * k) / 2, oy = (sh - STILL_H * k) * 0.4;
    var key = si + '|' + sw + 'x' + sh + root.lang; if (key === labelKey) return; labelKey = key;
    slab.innerHTML = '';
    (STILL_L[si + 1] || []).forEach(function (l) {
      var x = ox + STILL_W * k * l[1], y = oy + STILL_H * k * l[2];
      if (x < 8 || x > sw - 40 || y < 30 || y > sh - 8) return;
      var e = document.createElement('span'); e.className = 'l3d l3d-' + l[0]; e.innerHTML = l[3];
      e.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px)'; slab.appendChild(e);
    });
  }
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  var shown = -1, lcd = document.querySelector('[data-lcd]');
  function render() {
    var r = track.getBoundingClientRect(), ps = clamp(-r.top / Math.max(1, r.height - innerHeight)), l = he() ? 'he' : 'en';
    var live = !!window.__ac3d;
    var sg = 0; while (sg < 5 && ps >= STAGES[sg + 1]) sg++;
    if (!live) {
      var src = 'img/still-' + (sg + 1) + '.jpg';
      if (stillImg.getAttribute('src') !== src) stillImg.src = src;
      stillImg.alt = S[l][sg][0] + ' ' + S[l][sg][1];
      placeLabels(sg);
    }
    // stills mode: the temperature belongs to the still that is showing
    var temp = live ? roomTemp(ps) : roomTemp([0.1, 0.29, 0.45, 0.56, 0.72, 0.95][sg]);
    capTemp.textContent = Math.round(temp); capTemp.parentNode.classList.toggle('cool', temp < 30);
    if (sg !== shown || capT.dataset.l !== l) {
      shown = sg; capT.dataset.l = l;
      capT.textContent = S[l][sg][0]; capX.textContent = S[l][sg][1];
      keys.forEach(function (c, i) { c.setAttribute('aria-pressed', i === sg ? 'true' : 'false'); });
    }
    if (live) window.__ac3d.set(ps);
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; render(); }); } }, { passive: true });
  addEventListener('resize', function () { labelKey = ''; render(); });
  stillImg.addEventListener('load', function () { labelKey = ''; render(); });
  keys.forEach(function (c) { c.addEventListener('click', function () {
    var r = track.getBoundingClientRect();
    scrollTo({ top: scrollY + r.top + parseFloat(c.dataset.go) * (r.height - innerHeight), behavior: still() ? 'auto' : 'smooth' });
  }); });
  window.__trackRender = function () { shown = -1; labelKey = ''; render(); };

  // the unit's display in the hero counts down from the heat to the set point, once
  if (lcd && !still()) { var tv = 31; var lt = setInterval(function () { tv--; lcd.textContent = tv + '°'; if (tv <= 24) clearInterval(lt); }, 140); lcd.textContent = '31°'; }

  var qs = new URLSearchParams(location.search).get('lang'), saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  hours();
  setLang(qs === 'en' || qs === 'he' ? qs : (saved === 'en' ? 'en' : 'he'));
  render();
  setInterval(status, 60000);
})();
