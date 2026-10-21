(function () {
  var root = document.documentElement, WA = '972523220492';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: 'מיקה ציפורניים · לק ג\'ל ועיצוב ציפורניים · פיארברג 15, חיפה', en: 'Mika’s Nails · Gel polish and nail art · 15 Fierberg St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור מיקה ציפורניים · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Mika’s Nails · This is not the business’s official website' };
  var STAR = '<svg viewBox="0 0 92 16" aria-hidden="true">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; }).join('') + '</svg>';
  $$('[data-stars]').forEach(function (s) { s.innerHTML = STAR; s.setAttribute('role', 'img'); });

  // ---------------------------------------------------------------- her six pieces: swatch, the colour for the bottle and the UI, names
  var SHADES = [
    { sw: '#6e0b24', fill: '#6e0b24', ui: '#7a1430', he: 'בורדו ופרח יבש', en: 'Burgundy and a dried flower', mHe: 'הבורדו עם הפרח היבש', mEn: 'the burgundy with the dried flower' },
    { sw: 'linear-gradient(#f7f2ef 0 30%, #efd4ce 30%)', fill: '#efd4ce', ui: '#8a3a4a', he: 'פרנץ\' ולב קטן', en: 'French with a tiny heart', mHe: 'הפרנץ\' עם הלב הקטן', mEn: 'the French with the tiny heart' }, // taste-skill-ignore: swatches render real lacquer finishes (French tip, chrome, striped)
    { sw: 'linear-gradient(135deg, #d0a443, #8a1f55 45%, #3a0d22 70%, #b07a2a)', fill: '#7a2350', ui: '#7a2350', he: 'כרום בבורדו־זהב', en: 'Burgundy-gold chrome', mHe: 'הכרום בבורדו־זהב', mEn: 'the burgundy-gold chrome' }, // taste-skill-ignore: swatches render real lacquer finishes (French tip, chrome, striped)
    { sw: 'linear-gradient(90deg, #ece6e1 0 58%, #141012 58% 68%, #ece6e1 68%)', fill: '#17100f', ui: '#3a3034', he: 'קווים ונקודות', en: 'Lines and dots', mHe: 'הקווים והנקודות בשחור־לבן', mEn: 'the black-and-white lines and dots' }, // taste-skill-ignore: swatches render real lacquer finishes (French tip, chrome, striped)
    { sw: '#d8336e', fill: '#d8336e', ui: '#b82a5f', he: 'ורוד נוצץ', en: 'Shimmer pink', mHe: 'הוורוד הנוצץ', mEn: 'the shimmer pink' },
    { sw: '#a50f1f', fill: '#a50f1f', ui: '#a50f1f', he: 'אדום וכובעי סנטה', en: 'Red with Santa hats', mHe: 'האדום עם כובעי הסנטה', mEn: 'the red with the Santa hats' }
  ];
  var ALT = [
    ['ציפורניים בגוון בורדו מבריק, ואחת חלבית עם פרח יבש', 'Glossy burgundy nails, one milky nail with a dried flower'],
    ['פרנץ\' לבן עם לב אדום קטן', 'White French tips with a tiny red heart'],
    ['ציפורניים בכרום מנצנץ בגוונים של בורדו וזהב', 'Nails in glittering burgundy-gold chrome'],
    ['עיצוב בשחור ולבן: קווים דקים ונקודות', 'Black and white design: fine lines and dots'],
    ['ציפורניים בוורוד נוצץ', 'Shimmer-pink nails'],
    ['פרנץ\' אדום בצורת כובע סנטה ואדום נוצץ', 'Red Santa-hat French tips and glitter red']
  ];
  var cur = 0;
  try { var s0 = +localStorage.getItem('mk-shade'); if (s0 >= 0 && s0 < 6) cur = s0; } catch (e) {}
  var band = $('[data-band]'), slices = $$('.slice', band), swWrap = $('[data-swatches]');
  swWrap.innerHTML = SHADES.map(function (s, i) {
    return '<button type="button" class="swatch" role="radio" data-sw="' + i + '" style="--c:' + s.sw + '"><i></i></button>';
  }).join('');
  var sws = $$('.swatch', swWrap);
  function shade(i, user) {
    cur = i;
    var s = SHADES[i], l = he() ? 'he' : 'en';
    slices.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
    sws.forEach(function (b, k) { b.setAttribute('aria-checked', k === i ? 'true' : 'false'); b.tabIndex = k === i ? 0 : -1; b.setAttribute('aria-label', SHADES[k][l]); });
    $('[data-shade-name]').textContent = s[l];
    root.style.setProperty('--shade', s.fill);
    root.style.setProperty('--shade-ui', s.ui);
    var lq = $('[data-lacquer]'); if (lq) lq.setAttribute('fill', s.fill);
    if (user) {
      try { localStorage.setItem('mk-shade', i); } catch (e) {}
      var b = $('[data-bottle]');
      if (b && !still()) { b.classList.remove('tilt'); void b.getBoundingClientRect(); b.classList.add('tilt'); }
    }
    write();
  }
  slices.forEach(function (b, k) { b.addEventListener('click', function () { shade(k, true); }); });
  sws.forEach(function (b, k) {
    b.addEventListener('click', function () { shade(k, true); });
    b.addEventListener('keydown', function (e) {
      var d = { ArrowRight: he() ? -1 : 1, ArrowLeft: he() ? 1 : -1, ArrowDown: 1, ArrowUp: -1 }[e.key];
      if (d) { e.preventDefault(); var n = (k + d + 6) % 6; shade(n, true); sws[n].focus(); }
    });
  });

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    slices.forEach(function (b, k) { b.setAttribute('aria-label', ALT[k][l === 'he' ? 0 : 1]); });
    $$('[data-stars]').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
    var set = function (sel, attr, h, e) { $$(sel).forEach(function (el) { el.setAttribute(attr, l === 'he' ? h : e); }); };
    set('[data-pill]', 'aria-label', 'ראשי', 'Main');
    set('[data-t-call]', 'aria-label', 'חיוג למיקה, 052-322-0492', 'Call Mika, 052-322-0492');
    set('[data-swatches]', 'aria-label', 'גוונים', 'Shades');
    set('[data-bottle]', 'aria-label', 'בקבוק לק בגוון שנבחר', 'A bottle of polish in the chosen shade');
    set('.map iframe', 'title', 'מפה: פיארברג 15, חיפה', 'Map: 15 Fierberg St, Haifa');
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('mk-lang', l); } catch (e) {}
    texts(l); hours(); shade(cur); fitName(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(), anchor = $('#shades'), keep = anchor.getBoundingClientRect().top;
    root.classList.toggle('still', !on);
    try { localStorage.setItem('mk-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    layout();
    // the coat changes height between the two modes: keep the visitor where they were if they were past it
    if (keep < innerHeight) { var now = anchor.getBoundingClientRect().top; if (now !== keep) scrollBy(0, now - keep); }
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 19], 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 15], 6: null };
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
    else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · נפתח היום ב־' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב־' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב־' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot" aria-hidden="true"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // consecutive days with the same hours share a row; the week starts on Sunday
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
  window.__status = status; window.__H = H; window.__hours = hours;
  setInterval(status, 60000);

  // ---------------------------------------------------------------- the message: what, the shade, when
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]');
  var T = {
    he: { hi: 'היי מיקה, הגעתי מהאתר. ', what: { gel: 'אשמח לתאם לק ג\'ל', art: 'אשמח לתאם עיצוב ציפורניים', ask: 'אשמח להתייעץ איתך על טיפול' }, like: ', משהו בסגנון ', when: { am: ' נוח לי בבוקר.', noon: ' נוח לי בצהריים.', pm: ' נוח לי אחר הצהריים.' }, ask: ' מתי יש מקום?' },
    en: { hi: 'Hi Mika, I found your website. ', what: { gel: 'I’d like to book gel polish', art: 'I’d like to book nail art', ask: 'I’d like to ask you about a treatment' }, like: ', something like ', when: { am: ' Mornings suit me.', noon: ' Midday suits me.', pm: ' Afternoons suit me.' }, ask: ' When do you have a free slot?' }
  };
  function message() {
    var l = he() ? 'he' : 'en', t = T[l], fd = new FormData(form), w = fd.get('what') || 'gel', wn = fd.get('when');
    var m = t.hi + t.what[w] + t.like + SHADES[cur][l === 'he' ? 'mHe' : 'mEn'];
    m += '.';
    if (wn) m += t.when[wn];
    return m + t.ask;
  }
  function waLink(m) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m); }
  var typeT = 0, lastM = '';
  function write() {
    var m = message();
    send.href = waLink(m);
    $$('[data-wa]').forEach(function (a) { a.href = waLink(m); });
    clearInterval(typeT);
    if (still() || !lastM || !preview.getBoundingClientRect().height) { preview.textContent = m; lastM = m; return; }
    var keep = 0; while (keep < m.length && keep < lastM.length && m[keep] === lastM[keep]) keep++;
    lastM = m;
    var i = keep;
    typeT = setInterval(function () { i = Math.min(m.length, i + 2); preview.textContent = m.slice(0, i); if (i >= m.length) clearInterval(typeT); }, 16);
  }
  form.addEventListener('change', write);

  // ---------------------------------------------------------------- the name fills the band's width on wide screens
  var nameEl = $('[data-name]');
  function fitName() {
    nameEl.style.removeProperty('--fit');
    if (innerWidth < 700) return;
    nameEl.style.setProperty('--fit', '100px');
    var avail = nameEl.parentElement.clientWidth - 2 * parseFloat(getComputedStyle(nameEl.parentElement).paddingLeft);
    var sp = nameEl.querySelector('[lang="' + root.lang + '"]'), w = (sp && sp.getBoundingClientRect().width) || 1;
    nameEl.style.setProperty('--fit', Math.min(300, innerHeight * 0.21, Math.floor(100 * avail / w * 0.995)) + 'px');
  }

  // ---------------------------------------------------------------- SIGNATURE: three strokes of gel, it levels, the top coat shines
  // On a nail, gel goes on in three strokes: down the middle, then each side. Each stroke here is a mask over her chrome photograph,
  // with a ragged bristle edge, brush lines inside that level out, and a wet bead at the brush's head. Scroll-linked both ways.
  var stage = $('[data-stage]'), coat = $('#coat'), svg = $('[data-coat-svg]');
  var bead = $('[data-bead]', svg), gloss = $('[data-gloss]', svg), imgA = $('[data-coat-a]');
  var STROKES = [
    { cx: .5, w: .44, t0: .00, t1: .27, ph: 0.3 },
    { cx: .8, w: .48, t0: .25, t1: .50, ph: 1.9 },
    { cx: .2, w: .48, t0: .48, t1: .73, ph: 3.7 }
  ];
  var W = 0, Hh = 0;
  function noise(y, ph) { return Math.sin(y * 0.021 + ph) * 0.55 + Math.sin(y * 0.063 + ph * 2.3) * 0.3 + Math.sin(y * 0.17 + ph * 4.1) * 0.15; }
  function sizeCoat() {
    W = stage.clientWidth; Hh = stage.clientHeight;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh);
    gloss.setAttribute('height', Hh * 1.4); gloss.setAttribute('y', -Hh * .2); gloss.setAttribute('width', W * .34);
  }
  // one stroke of gel as a closed outline: ragged bristle edges, a brush that lands narrower, a rounded head of gel
  function strokeD(s, u) {
    var y0 = (0.03 + 0.03 * Math.sin(s.ph * 3)) * Hh, y1 = 1.1 * Hh, yh = lerp(y0, y1, u), cx = s.cx * W, base = s.w * W / 2, A = 0.012 * W;
    if (u <= 0.002) return { d: '', yh: yh, hw: 0 };
    var N = 36, L = [], R = [], i, y, hw, land;
    for (i = 0; i <= N; i++) {
      y = lerp(y0, yh, i / N);
      land = clamp((y - y0) / (0.1 * Hh), 0, 1);
      hw = base * (0.8 + 0.2 * smooth(land)) * (1 - 0.06 * clamp((y - (yh - 0.08 * Hh)) / (0.08 * Hh), 0, 1));
      L.push([cx - hw + A * noise(y, s.ph), y]); R.push([cx + hw + A * noise(y, s.ph + 2.1), y]);
    }
    var f = function (v) { return v.toFixed(1); }, hwEnd = R[N][0] - L[N][0];
    var d = 'M' + L.map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join(' L');
    d += ' C' + f(L[N][0]) + ' ' + f(yh + hwEnd * 0.26) + ' ' + f(L[N][0] + hwEnd * 0.2) + ' ' + f(yh + hwEnd * 0.34) + ' ' + f(cx) + ' ' + f(yh + hwEnd * 0.34);
    d += ' C' + f(R[N][0] - hwEnd * 0.2) + ' ' + f(yh + hwEnd * 0.34) + ' ' + f(R[N][0]) + ' ' + f(yh + hwEnd * 0.26) + ' ' + f(R[N][0]) + ' ' + f(yh);
    d += ' L' + R.slice().reverse().map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join(' L');
    // where the brush landed: a soft rounded start
    var w0 = R[0][0] - L[0][0];
    d += ' C' + f(R[0][0]) + ' ' + f(y0 - w0 * 0.3) + ' ' + f(L[0][0]) + ' ' + f(y0 - w0 * 0.3) + ' ' + f(L[0][0]) + ' ' + f(y0) + ' Z';
    return { d: d, yh: yh + hwEnd * 0.34, hw: hwEnd / 2 };
  }
  var ease = function (t) { t = clamp(t, 0, 1); return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  function coatFrame() {
    if (still()) return;
    var r = coat.getBoundingClientRect(), vh = innerHeight;
    var p = clamp((vh * 0.35 - r.top) / (r.height - vh + vh * 0.35), 0, 1);
    var lev = smooth((p - .72) / .13), active = null, ds = [];
    STROKES.forEach(function (s, k) {
      var u = ease((p - s.t0) / (s.t1 - s.t0)), g = strokeD(s, u);
      if (g.d) ds.push(g.d);
      if (u > 0 && u < 1) active = { s: s, g: g, u: u };
    });
    stage.style.setProperty('--strokes', ds.length ? "path('" + ds.join(' ') + "')" : 'inset(0 0 100% 0)');
    stage.style.setProperty('--lev', lev.toFixed(3));
    if (active && active.g.yh < Hh * 1.05) {
      var fade = Math.min(1, active.u / .06, (1 - active.u) / .1);
      bead.setAttribute('cx', (active.s.cx * W).toFixed(1)); bead.setAttribute('cy', (active.g.yh - active.g.hw * 0.16).toFixed(1));
      bead.setAttribute('rx', (active.g.hw * 0.7).toFixed(1)); bead.setAttribute('ry', (active.g.hw * 0.14).toFixed(1));
      bead.setAttribute('opacity', clamp(fade, 0, 1).toFixed(3));
    } else bead.setAttribute('opacity', '0');
    // the top coat: one broad highlight crosses the cured surface
    var g2 = clamp((p - .82) / .14, 0, 1);
    gloss.setAttribute('x', lerp(-0.45 * W, 1.15 * W, ease(g2)).toFixed(1));
    gloss.setAttribute('opacity', (Math.sin(Math.PI * g2)).toFixed(3));
    gloss.setAttribute('transform', 'skewX(-14)');
    stage.style.setProperty('--copy', smooth((p - .86) / .09).toFixed(3));
  }

  // ---------------------------------------------------------------- the burgundy field rises with a French-tip smile line
  var tip = $('[data-tip]'), arch = $('[data-arch]');
  function archFrame() {
    if (still()) { tip.style.removeProperty('--clip-outer'); arch.style.removeProperty('--clip-inner'); return; }
    var r = tip.getBoundingClientRect(), vh = innerHeight, w = tip.clientWidth;
    var q = smooth((vh - r.top) / (vh * 0.75));
    var maxD = Math.min(vh * 0.3, w * 0.32), D = maxD * (1 - q);
    if (D < 0.6) { tip.style.setProperty('--clip-outer', 'none'); arch.style.setProperty('--clip-inner', 'none'); return; }
    var RY = 5000, half = w / 2;
    var RX = half / Math.sqrt(1 - Math.pow(1 - D / RY, 2));
    var band = Math.max(5, Math.min(10, w * 0.012));
    tip.style.setProperty('--clip-outer', 'ellipse(' + RX.toFixed(1) + 'px ' + RY + 'px at 50% ' + RY + 'px)');
    arch.style.setProperty('--clip-inner', 'ellipse(' + RX.toFixed(1) + 'px ' + RY + 'px at 50% ' + (RY + band) + 'px)');
  }

  // ---------------------------------------------------------------- the name settles as the first screen leaves
  function nameFrame() {
    if (still()) { nameEl.style.transform = ''; return; }
    var t = clamp(scrollY / innerHeight, 0, 1);
    nameEl.style.transform = 'scale(' + (1 - 0.06 * t).toFixed(4) + ')';
  }

  // ---------------------------------------------------------------- nav, dock
  var pill = $('[data-pill]'), links = $$('.links a'), dock = $('[data-dock]'), acts = $('[data-hero-acts]'), visitBtn = $('.card .btn');
  function chrome() {
    pill.classList.toggle('up', scrollY > 36);
    var a = acts.getBoundingClientRect(), v = visitBtn.getBoundingClientRect();
    var show = a.bottom < 0 && !(v.top < innerHeight && v.bottom > 0);
    dock.classList.toggle('on', show);
  }
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['shades', 'reviews', 'message', 'visit'].forEach(function (id) { var el = document.getElementById(id); if (el) nio.observe(el); });
  }

  // ---------------------------------------------------------------- entrances, once, staggered inside each section
  $$('section, header, .map').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { io && !still() && !el.closest('.hero') ? io.observe(el) : null; });
  // the first screen never waits for the observer: it arrives right away
  requestAnimationFrame(function () { $$('.hero [data-reveal]').forEach(function (el) { el.classList.add('in'); }); });
  if (!io || still()) $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });

  // ---------------------------------------------------------------- frame loop on scroll
  var ticking = false;
  function frame() { ticking = false; coatFrame(); archFrame(); nameFrame(); chrome(); }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  function layout() { root.style.setProperty('--bar', $('.concept').offsetHeight + 'px'); sizeCoat(); fitName(); frame(); }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', function () { layout(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitName);

  texts(root.lang === 'en' ? 'en' : 'he');
  hours();
  shade(cur);
  layout();
  window.__coat = coatFrame; window.__layout = layout;
})();
