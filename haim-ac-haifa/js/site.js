(function () {
  var root = document.documentElement, WA = '972544895289';
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var clamp = function (v, a, b) { a = a == null ? 0 : a; b = b == null ? 1 : b; return v < a ? a : v > b ? b : v; };
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var TITLE = { he: 'חיים מזגנים · טכנאי מזגנים ומקררים בחיפה והקריות', en: 'Haim AC · AC & refrigerator technician, Haifa & Krayot' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור חיים מזגנים · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Haim AC · This is not the business’s official website' };
  var ARIA = {
    '.lamps': ['ניווט', 'Navigation'], '[data-drops]': ['יצירת קשר מהירה', 'Quick contact'],
    '[data-stops]': ['שלבי הסיפור על מסלול הניקוז', 'Stages of the story, on the drain path'],
    '[data-stepper]': ['מעבר בין השלבים', 'Step through the stages'], '[data-row-track]': ['שלבי התקנה', 'Installation steps']
  };

  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    try { localStorage.setItem('lang', l); } catch (e) {}
    var w = $('[name=where]'); if (w) w.placeholder = w.dataset[l === 'he' ? 'phHe' : 'phEn'];
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    Object.keys(ARIA).forEach(function (k) { var el = $(k); if (el) el.setAttribute('aria-label', ARIA[k][l === 'he' ? 0 : 1]); });
    $('.map iframe').title = l === 'he' ? 'מפת Google: חיפה והקריות' : 'Google Maps: Haifa and the Krayot';
    write(); hours(); fitName(); layout(); storyShown = -1; storyRender(); rowProgress();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- animations switch, remembered
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(), keep = storyBefore();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI(); write();
    if (!on) openAll();
    storyAfter(keep);
    if (window.__motion3d) window.__motion3d(on);
    layout(); storyShown = -1; storyRender();
  }); });
  motionUI();

  // ---------------------------------------------------------------- live opening status in Haifa time. null = closed that day; [0, 24] = around the clock
  var H = { 0: [7, 20], 1: [7, 20], 2: [7, 20], 3: [7, 20], 4: [7, 20], 5: [7, 16], 6: null };
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
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // the hours as the unit's timer: each run of days with the same hours is one program, switched on and off
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var two = r[1] - r[0] === 1;
      var label = r[0] === r[1] ? names[r[0]] : names[r[0]] + (two ? (l ? ' ו' : ' and ') : (l ? ' עד ' : ' to ')) + names[r[1]];
      var time = !t ? '<span class="off-day">' + (l ? 'כבוי כל היום' : 'Off all day') + '</span>'
        : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : '24 hours')
        : '<span class="on">' + (l ? 'הפעלה' : 'on') + '</span><span dir="ltr">' + hhmm(t[0]) + '</span><span class="off">' + (l ? 'כיבוי' : 'off') + '</span><span dir="ltr">' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + label + '</td><td class="t">' + time + '</td></tr>';
    }).join('');
    status();
  }
  window.__status = status; window.__H = H; window.__hours = hours;

  // ---------------------------------------------------------------- the knob writes the WhatsApp message
  var T = {
    he: { n: { warm: 'המזגן לא מקרר', drip: 'המזגן מטפטף', install: 'אני רוצה להתקין מזגן', fridge: 'יש תקלה במקרר', wash: 'יש תקלה במכונת הכביסה או במייבש' },
          hi: 'שלום חיים, הגעתי דרך האתר. ', at: '. אני ב', end: '. מתי תוכל להגיע?' },
    en: { n: { warm: 'my AC isn’t cooling', drip: 'my AC is dripping', install: 'I’d like an AC installed', fridge: 'my fridge has a fault', wash: 'my washing machine or dryer has a fault' },
          hi: 'Hello Haim, I found you through your website. ', at: '. I’m in ', end: '. When could you come?' }
  };
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]'), knob = $('[data-knob]');
  var ANG = { warm: -76, drip: -38, install: 0, fridge: 38, wash: 76 };
  function write() {
    var t = T[root.lang] || T.he, f = new FormData(form), where = (f.get('where') || '').trim().slice(0, 80);
    var key = f.get('need') || 'warm', need = t.n[key];
    if (root.lang === 'en') need = need.charAt(0).toUpperCase() + need.slice(1);
    var m = t.hi + need + (where ? t.at + where : '') + t.end;
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    knob.style.transform = 'rotate(' + ANG[key] * (he() ? -1 : 1) + 'deg)';
    type(m);
  }
  var typeT = 0, lastMsg = '';
  function type(m) {
    clearInterval(typeT);
    if (still() || m === lastMsg) { preview.textContent = m; lastMsg = m; return; }
    var common = 0; while (common < m.length && common < lastMsg.length && m[common] === lastMsg[common]) common++;
    lastMsg = m;
    var i = common, caret = '<span class="caret"></span>';
    typeT = setInterval(function () {
      i = Math.min(m.length, i + 2);
      preview.textContent = m.slice(0, i);
      if (i < m.length) preview.insertAdjacentHTML('beforeend', caret); else clearInterval(typeT);
    }, 16);
  }
  form.addEventListener('change', write);
  form.addEventListener('input', function (e) { if (e.target.name === 'where') write(); });

  // ---------------------------------------------------------------- the drip line: where the hero unit's low corner is, every section's drop lands below it
  var unitImg = $('[data-unit] img'), hero = $('.hero');
  var DRIP = [0.7222, 0.7106];
  var secs = $$('.sec[data-splash]'), cornerY = 0, landY = 64;
  function layout() {
    var r = unitImg.getBoundingClientRect(), x = r.left + DRIP[0] * r.width;
    x = clamp(x, 24, innerWidth - 24);
    root.style.setProperty('--drip-x', x.toFixed(1) + 'px');
    cornerY = scrollY + r.top + DRIP[1] * r.height;
    // hero drops fall from the corner to the bottom of the hero
    var hb = hero.getBoundingClientRect().bottom + scrollY, fall = Math.max(120, hb - cornerY + 40);
    $$('.drop', hero).forEach(function (d) { d.style.setProperty('--fall', (fall / (d.getBoundingClientRect().height || 14) * 100).toFixed(0) + '%'); });
    landY = parseFloat(getComputedStyle(root).getPropertyValue('--land-y')) || 64;
    // the flood must reach the section's farthest corner from the splash point
    var dx = parseFloat(getComputedStyle(root).getPropertyValue('--drip-x')) || x;
    secs.forEach(function (s) { var w = s.offsetWidth, h = s.offsetHeight; s._R = Math.ceil(Math.hypot(Math.max(dx, w - dx), Math.max(landY, h - landY))) + 2; s._k = -1; });
    splashTick();
  }

  // ---------------------------------------------------------------- each section opens with a splash, all of it tied to the scroll, both ways:
  // the drop falls as you scroll in (and climbs back if you scroll up), lands, the rings and droplets spread, and the section's colour floods out
  // from the splash point. Scroll back above it and the colour drains back into the point, so the next pass down plays it again.
  var FLY = [[-46, -38], [-18, -58], [12, -64], [38, -44], [56, -22]];
  secs.forEach(function (s) {
    $$('.rv', s).forEach(function (el, i) { el.style.setProperty('--rd', (200 + Math.min(i, 6) * 80) + 'ms'); });
    var fl = document.createElement('i'); fl.className = 'flood'; fl.setAttribute('aria-hidden', 'true'); s.insertBefore(fl, s.firstChild);
    s._fl = fl; s._f = $('.fall', s); s._rings = $$('.ripple i', s); s._dots = $$('.ripple b', s); s._k = -1;
  });
  function openAll() { secs.forEach(function (s) { s.classList.add('open'); s._k = -1; }); }
  function dropT(off, sy) { return 'translate(-50%, ' + (-off).toFixed(1) + 'px) translateY(-100%) scale(' + (1 / Math.sqrt(sy)).toFixed(3) + ',' + sy.toFixed(3) + ')'; }
  var outC = function (t) { return 1 - Math.pow(1 - t, 3); };
  function splash(s, q) {
    var k = clamp((q - 1) / 0.7, 0, 1), k2 = clamp((q - 1.1) / 0.8, 0, 1);
    // two rings spread on the surface, the second one later and wider
    [k, k2].forEach(function (t, j) { var r = s._rings[j]; if (!r) return; r.style.opacity = t > 0 && t < 1 ? (0.9 * (1 - t)).toFixed(3) : 0; r.style.transform = 'scale(' + (0.1 + 2.5 * outC(t)).toFixed(3) + ')'; });
    // droplets thrown up and out, then falling back under gravity
    s._dots.forEach(function (b, j) {
      var fx = FLY[j][0], fy = FLY[j][1], x, y, sc, op;
      if (k <= 0 || k >= 1) { b.style.opacity = 0; return; }
      if (k < 0.55) { var u = outC(k / 0.55); x = fx * 0.75 * u; y = fy * u; sc = 1 - 0.1 * u; op = 1; }
      else { var v = (k - 0.55) / 0.45, g = v * v; x = fx * (0.75 + 0.25 * v); y = fy + (6 - fy) * g; sc = 0.9 - 0.3 * v; op = 1 - v; }
      b.style.opacity = op.toFixed(3); b.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px) scale(' + sc.toFixed(3) + ')';
    });
  }
  function splashTick() {
    if (still()) { openAll(); return; }
    var vh = innerHeight, tops = secs.map(function (s) { return s.getBoundingClientRect().top; });   // read everything, then write
    for (var i = 0; i < secs.length; i++) {
      var s = secs[i], top = tops[i] + landY, q = (vh - top) / (vh * 0.42);
      // q: 0 = the landing point enters at the bottom, 1 = the drop lands (58% down the screen), 2.2 = the colour fills the section
      var key = clamp(q, -0.01, 2.21).toFixed(3); if (key === s._k) continue; s._k = key;
      var f = s._f;
      if (f) {
        if (q > 0 && q < 1) {
          // the first drop comes from the unit's corner; later ones from the dark above the section. Gravity: the distance left shrinks with the square
          var D = i === 0 ? Math.max(vh * 0.4, tops[i] + scrollY + landY - cornerY) : vh * 0.55;
          f.style.opacity = 1; f.style.transform = dropT(D * (1 - q) * (1 - q), 1 + 0.45 * q);
        } else f.style.opacity = 0;
      }
      splash(s, q);
      var kf = clamp((q - 1) / 1.2, 0, 1);
      s._fl.style.clipPath = kf >= 1 ? 'none' : 'circle(' + (outC(kf) * s._R).toFixed(1) + 'px at var(--drip-x) var(--land-y))';
      s.classList.toggle('open', q >= 1);
    }
  }

  // ---------------------------------------------------------------- the lamps: the part of the page you are in
  var lamps = $$('[data-lamp]');
  if ('IntersectionObserver' in window) {
    var lio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) lamps.forEach(function (a) { a.classList.toggle('on', a.dataset.lamp === e.target.id); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['craft', 'drip', 'install', 'reviews', 'message', 'visit'].forEach(function (id) { var el = document.getElementById(id); if (el) lio.observe(el); });
    // the hero's drops only move while the hero is on screen
    new IntersectionObserver(function (es) { hero.classList.toggle('away', !es[0].isIntersecting); }).observe(hero);
  }

  // ---------------------------------------------------------------- the two drops appear once the hero's buttons are gone, and step aside over other call buttons
  var drops = $('[data-drops]'), away = new Set();
  function dropsUI() { drops.classList.toggle('show', away.size === 0); }
  if ('IntersectionObserver' in window) {
    var kio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? away.add(e.target) : away.delete(e.target); }); dropsUI(); }, { threshold: 0 });
    [$('[data-hero-actions]'), $('.send-row'), $('.card-actions'), $('.plate-b'), $('[data-stage]')].forEach(function (el) { if (el) kio.observe(el); });
  } else drops.classList.add('show');

  // ---------------------------------------------------------------- the install row: progress bar and arrows
  var row = $('[data-row-track]'), rowBar = $('[data-row-bar]');
  function rowProgress() {
    var max = row.scrollWidth - row.clientWidth, x = Math.abs(row.scrollLeft);
    var vis = row.clientWidth / row.scrollWidth, p = max > 0 ? x / max : 1;
    rowBar.style.transform = 'scaleX(' + (vis + (1 - vis) * p).toFixed(3) + ')';
  }
  row.addEventListener('scroll', function () { requestAnimationFrame(rowProgress); }, { passive: true });
  $$('[data-row]').forEach(function (b) { b.addEventListener('click', function () {
    var step = ($('.mo', row).getBoundingClientRect().width + 32) * +b.dataset.row * (he() ? -1 : 1);
    row.scrollBy({ left: step, behavior: still() ? 'auto' : 'smooth' });
  }); });

  // ---------------------------------------------------------------- the drip story
  var sm = function (t) { return t * t * (3 - 2 * t); }, sp = function (p, a, b) { return clamp((p - a) / (b - a)); }, lerp = function (a, b, t) { return a + (b - a) * t; };
  // the same timeline the 3D scene runs (drain3d.js T), for the readouts and the drain path
  var ST = {
    rate: function (p) { return p < 0.1 ? lerp(0.85, 1.4, sm(sp(p, 0, 0.1))) : p < 0.2 ? 1.4 : p < 0.545 ? lerp(1.4, 0.9, sm(sp(p, 0.2, 0.3))) : p < 0.72 ? 0.9 * Math.pow(1 - sp(p, 0.545, 0.72), 1.7) : 0; },
    floor: function (p) { return p < 0.6 ? lerp(110, 360, sm(sp(p, 0, 0.6))) : p < 0.69 ? 360 : 360 * (1 - sm(sp(p, 0.69, 0.82))); },
    room: function (p) { return p < 0.2 ? 26 : p < 0.845 ? lerp(26, 28.5, sp(p, 0.2, 0.8)) : lerp(28.5, 24, sm(sp(p, 0.86, 0.98))); },
    pan: function (p) { return p < 0.53 ? 1 : p < 0.83 ? lerp(1, 0.06, sm(sp(p, 0.53, 0.6))) : lerp(0.06, 0.16, sp(p, 0.88, 0.96)); },
    plug: function (p) { return 1 - sm(sp(p, 0.515, 0.565)); },
    flow: function (p) { return p < 0.52 ? 0 : p < 0.56 ? sm(sp(p, 0.52, 0.545)) : p < 0.7 ? Math.pow(1 - sp(p, 0.56, 0.7), 1.5) : p > 0.88 ? 0.1 * sp(p, 0.88, 0.94) : 0; },
    front: function (p) { return sp(p, 0.522, 0.6); },
    air: function (p) { return sm(sp(p, 0.87, 0.92)); }
  };
  var STILL_P = [0.075, 0.3, 0.44, 0.545, 0.79, 0.93];
  var STILL_W = 1200, STILL_H = 900;
  // label anchors (fractions of the still) recorded when the stills were rendered from drain3d.js (stills.py)
  var STILL_L = {"1": [["drip", 0.5469, 0.3986, "<span lang=\"he\">הטיפות נוצרות בנקודה הנמוכה</span><span lang=\"en\">Drops form at the lowest point</span>"], ["wall", 0.5255, 0.9734, "<span lang=\"he\">רטיבות יורדת בקיר</span><span lang=\"en\">Damp creeping down the wall</span>"]], "2": [["pan", 0.3841, 0.4447, "<span lang=\"he\">מגש הניקוז מלא עד השפה</span><span lang=\"en\">The drain pan, full to the lip</span>"]], "3": [["plug", 0.4177, 0.3576, "<span lang=\"he\">סתימה: רפש ואבק</span><span lang=\"en\">The plug: slime and dust</span>"]], "4": [["flush", 0.4229, 0.2292, "<span lang=\"he\">שטיפה בלחץ</span><span lang=\"en\">Flushing under pressure</span>"]], "5": [["dry", 0.3468, 0.6546, "<span lang=\"he\">מתייבש מהשוליים פנימה</span><span lang=\"en\">Drying from the edges in</span>"]], "6": [["air", 0.4626, 0.5409, "<span lang=\"he\">אוויר קר</span><span lang=\"en\">Cold air</span>"]]};
  var story = $('[data-story]'), stage = $('[data-stage]'), stillImg = $('[data-still]'), labelsEl = $('[data-slabels]');
  var steps = $$('[data-steps] .step'), stops = $$('[data-stops] .stop'), stepBtns = $$('[data-step]');
  var stepTitle = $('[data-step-title]'), stillText = $('[data-still-text]');
  var paPan = $('[data-pa-pan]'), paPlug = $('[data-pa-plug]'), paFlow = $('[data-pa-flow]'), paPuddle = $('[data-pa-puddle]'), paDrip = $('[data-pa-drip]'), paAir = $('[data-pa-air]');
  var flowLen = paFlow.getTotalLength ? paFlow.getTotalLength() : 300;
  paFlow.style.strokeDasharray = flowLen + ' ' + flowLen;
  var ro = { temp: $('[data-ro=temp]'), drops: $('[data-ro=drops]'), floor: $('[data-ro=floor]') };

  // seven-segment digits, as on the unit's own display
  var SEG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg', '-': 'g', ' ': '' };
  var SP = { a: 'M3 1h8l-1.5 2h-5z', b: 'M12 2v8l-2-1.4V3.5z', c: 'M12 12v8l-2-1.5v-5.1z', d: 'M3 21h8l-1.5-2h-5z', e: 'M2 12v8l2-1.5v-5.1z', f: 'M2 2v8l2-1.4V3.5z', g: 'M3 11l1.5-1h5l1.5 1-1.5 1h-5z' };
  function seg7(str, unit) {
    var w = 0, out = '';
    String(str).split('').forEach(function (ch) {
      if (ch === '.') { out += '<circle cx="' + (w + 1.5) + '" cy="20" r="1.3"/>'; w += 3; return; }
      var on = SEG[ch] || '';
      Object.keys(SP).forEach(function (k) { out += '<path transform="translate(' + w + ')" class="' + (on.indexOf(k) >= 0 ? 's1' : 's0') + '" d="' + SP[k] + '"/>'; });
      w += 15;
    });
    return '<svg viewBox="0 0 ' + (w + (unit ? 18 : 0)) + ' 22" aria-hidden="true">' + out + (unit ? '<text x="' + (w + 1) + '" y="12" class="su">' + unit + '</text>' : '') + '</svg>';
  }
  var roLast = {};
  function setRo(k, txt, unit, sr) {
    if (roLast[k] === txt + root.lang) return; roLast[k] = txt + root.lang;
    ro[k].innerHTML = seg7(txt, unit) + '<span class="vh">' + sr + '</span>';
  }

  var step = 0, storyShown = -1, labelKey = '', cardsFaded = false, cards = $$('[data-steps] .step-c');
  function readLine() { return innerWidth >= 960 ? innerHeight * 0.5 : innerHeight * 0.66 + 10; }
  // the scroll position as story progress: tied to the step texts, so the 3D, the readouts and the words always agree
  function storyP() {
    var y = readLine(), n = steps.length;
    for (var i = 0; i < n; i++) {
      var r = steps[i].getBoundingClientRect();
      if (y < r.bottom || i === n - 1) return clamp((i + clamp((y - r.top) / r.height)) / n);
    }
    return 0;
  }
  function placeLabels(sg) {
    var vw = stillImg.clientWidth, vhh = stillImg.clientHeight;
    var key = sg + '|' + vw + 'x' + vhh + root.lang; if (key === labelKey) return; labelKey = key;
    labelsEl.innerHTML = '';
    var k = Math.max(vw / STILL_W, vhh / STILL_H), ox = (vw - STILL_W * k) / 2, oy = (vhh - STILL_H * k) / 2;
    (STILL_L[sg + 1] || []).forEach(function (l) {
      var x = ox + STILL_W * k * l[1], y = oy + STILL_H * k * l[2];
      if (x < 40 || x > vw - 40 || y < 40 || y > vhh - 8) return;
      var e = document.createElement('span'); e.className = 'l3d'; e.innerHTML = '<span>' + l[3] + '</span>';
      e.style.opacity = 1; e.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      labelsEl.appendChild(e);
    });
  }
  function storyRender(force) {
    // nothing to do while the story is far off screen (the stills mode block is static anyway)
    var sr = story.getBoundingClientRect();
    if (force !== true && storyShown >= 0 && (sr.bottom < -200 || sr.top > innerHeight + 200)) return;
    var live = !!window.__drain3d && !still(), stillMode = still();
    var p = stillMode ? STILL_P[step] : storyP();
    var sg = stillMode ? step : Math.min(5, Math.floor(p * 6));
    var pr = live ? p : STILL_P[sg];   // stills show their own moment; the readouts match the picture
    if (!live) {
      var src = 'img/still-' + (sg + 1) + '.jpg';
      if (stillImg.getAttribute('src') !== src) stillImg.setAttribute('src', src);
      placeLabels(sg);
    } else if (labelKey) { labelsEl.innerHTML = ''; labelKey = ''; }
    labelsEl.hidden = live;
    // readouts
    var temp = ST.room(pr), dpm = Math.round(ST.rate(pr) * 60), ml = Math.round(ST.floor(pr) / 10) * 10;
    var l = he();
    setRo('temp', temp.toFixed(1), '°', (l ? 'בחדר ' : 'Room ') + temp.toFixed(1) + '°');
    setRo('drops', String(dpm), '', (l ? 'טיפות לדקה: ' : 'Drops a minute: ') + dpm);
    setRo('floor', String(ml), l ? 'מ״ל' : 'ml', (l ? 'מים על הרצפה: ' : 'Water on the floor: ') + ml + (l ? ' מ״ל' : ' ml'));
    // the drain path follows the water
    paPan.style.transform = 'scaleY(' + Math.max(0.05, ST.pan(pr)).toFixed(3) + ')';
    paPlug.style.transform = 'scale(' + Math.max(0.001, ST.plug(pr)).toFixed(3) + ')';
    var F = ST.flow(pr), reach = F > 0.005 ? (pr > 0.88 ? 1 : ST.front(pr)) : 0;
    paFlow.style.strokeDashoffset = (flowLen * (1 - reach)).toFixed(1);
    paFlow.style.opacity = F > 0.005 ? (0.35 + 0.65 * Math.min(1, F * 1.4)).toFixed(2) : 0;
    paPuddle.style.transform = 'scale(' + Math.max(0.02, Math.sqrt(ST.floor(pr) / 360)).toFixed(3) + ')';
    paDrip.style.opacity = ST.rate(pr) > 0.01 ? 1 : 0;
    paAir.style.opacity = ST.air(pr).toFixed(2);
    if (sg !== storyShown || stepTitle.dataset.l !== root.lang) {
      storyShown = sg; stepTitle.dataset.l = root.lang;
      stops.forEach(function (b, i) { b.setAttribute('aria-pressed', i === sg ? 'true' : 'false'); });
      steps.forEach(function (s, i) { s.classList.toggle('on', i === sg); });
      var h3 = $('h3 [lang=' + root.lang + ']', steps[sg]), tx = $('p [lang=' + root.lang + ']', steps[sg]);
      stepTitle.textContent = h3 ? h3.textContent : '';
      stillText.textContent = tx ? tx.textContent : '';
      stillImg.alt = (h3 ? h3.textContent + '. ' : '') + (tx ? tx.textContent : '');
      stepBtns.forEach(function (b) { b.disabled = +b.dataset.step < 0 ? sg === 0 : sg === 5; });
    }
    if (live) window.__drain3d.set(p);
    // phones: a card that is pushed up out of its band fades before it covers the picture
    if (!stillMode && innerWidth < 960) {
      var sb = stage.getBoundingClientRect().bottom, tops = cards.map(function (c) { return c.getBoundingClientRect().top; });
      cards.forEach(function (c, i) { c.style.opacity = clamp((tops[i] - (sb - 70)) / 60).toFixed(2); });
    } else if (cardsFaded) cards.forEach(function (c) { c.style.opacity = ''; });
    cardsFaded = !stillMode && innerWidth < 960;
  }
  window.__storyRender = function () { storyShown = -1; labelKey = ''; storyRender(true); };
  function go(i) { step = clamp(i, 0, 5); storyRender(true); }
  stepBtns.forEach(function (b) { b.addEventListener('click', function () { go(storyShown + +b.dataset.step); }); });
  function scrollToStage(i, smooth) {
    var r = steps[i].getBoundingClientRect();
    scrollTo({ top: scrollY + r.top - (readLine() - r.height * 0.45), behavior: smooth ? 'smooth' : 'auto' });
  }
  stops.forEach(function (b, i) { b.addEventListener('click', function () { if (still()) go(i); else scrollToStage(i, true); }); });
  // switching modes keeps the visitor on the same stage, and on the story if they were in it
  function storyBefore() { var r = story.getBoundingClientRect(); return { sg: storyShown < 0 ? 0 : storyShown, seen: r.top < innerHeight && r.bottom > 0 }; }
  function storyAfter(k) {
    if (still()) { step = k.sg; if (k.seen) scrollTo(0, scrollY + stage.getBoundingClientRect().top - 12); return; }
    if (k.seen) requestAnimationFrame(function () { scrollToStage(k.sg, false); });
  }

  // ---------------------------------------------------------------- the footer name fills the plate
  function fitName() {
    var el = $('[data-fit]'); if (!el) return;
    el.style.fontSize = ''; var box = el.parentNode.clientWidth, w = el.scrollWidth;
    if (w > box) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * box / w * 0.98) + 'px';
  }

  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; splashTick(); storyRender(); }); } }, { passive: true });
  addEventListener('resize', function () { labelKey = ''; layout(); fitName(); storyRender(); rowProgress(); });
  stillImg.addEventListener('load', function () { labelKey = ''; storyRender(); });
  if (unitImg.complete) layout(); else unitImg.addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitName(); layout(); });

  var qs = new URLSearchParams(location.search).get('lang'), saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  hours();
  setLang(qs === 'en' || qs === 'he' ? qs : (saved === 'en' ? 'en' : 'he'));
  setInterval(status, 60000);
})();
