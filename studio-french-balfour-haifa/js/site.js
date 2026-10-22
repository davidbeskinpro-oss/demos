(function () {
  var root = document.documentElement, WA = '972522885275', MAIL = 'haifa.studiofrench@gmail.com';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang !== 'en'; };
  var TITLE = { he: 'סטודיו פרנץ\' · ציפורניים וקוסמטיקה · בלפור 2, חיפה', en: 'Studio French · Nails and cosmetics · 2 Balfour St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Studio French · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Studio French · This is not the business’s official website' };
  var STAR = '<svg viewBox="0 0 92 16" aria-hidden="true">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; }).join('') + '</svg>';
  $$('[data-stars]').forEach(function (s) { s.innerHTML = STAR; s.setAttribute('role', 'img'); });

  // ---------------------------------------------------------------- nail shapes (one path structure, so shapes can morph)
  // [c1x, c1y, c2x, c2y, -, tipY] in a 100 x 140 box; the cuticle end is the same for all
  var SH = { almond: [8, 50, 30, 4, 50, 2], square: [8, 9, 11, 6, 50, 6], stiletto: [8, 60, 40, 20, 50, 0] };
  function nd(p, s, ox, oy) {
    var X = function (x) { return +(ox + x * s).toFixed(2); }, Y = function (y) { return +(oy + y * s).toFixed(2); };
    return 'M' + X(8) + ' ' + Y(96) + 'C' + X(p[0]) + ' ' + Y(p[1]) + ' ' + X(p[2]) + ' ' + Y(p[3]) + ' ' + X(50) + ' ' + Y(p[5]) +
      'C' + X(100 - p[2]) + ' ' + Y(p[3]) + ' ' + X(100 - p[0]) + ' ' + Y(p[1]) + ' ' + X(92) + ' ' + Y(96) +
      'C' + X(92) + ' ' + Y(124) + ' ' + X(74) + ' ' + Y(140) + ' ' + X(50) + ' ' + Y(140) +
      'C' + X(26) + ' ' + Y(140) + ' ' + X(8) + ' ' + Y(124) + ' ' + X(8) + ' ' + Y(96) + 'Z';
  }
  var maskURI = function (k) { return 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140" preserveAspectRatio="none"><path d="' + nd(SH[k], 1, 0, 0) + '"/></svg>') + '")'; };
  $$('[data-mini]').forEach(function (p) { p.setAttribute('d', nd(SH[p.dataset.mini], 1, 0, 0)); });

  // ---------------------------------------------------------------- the run: each photo opens inside the last through a nail
  var run = $('[data-run]'), stage = $('[data-stage]'), slot = $('[data-slot]'), hero = $('[data-hero]');
  var layers = $$('[data-layer]'), caps = $$('[data-cap]'), rim = $('[data-rim]'), rimPath = $('[data-rim-path]');
  layers.forEach(function (l) { var m = maskURI(l.dataset.shape); l.style.webkitMaskImage = m; l.style.maskImage = m; });
  var G = {};
  function geom() {
    var sr = stage.getBoundingClientRect(), r = slot.getBoundingClientRect();
    G.sw = sr.width; G.sh = sr.height;
    G.cx = r.left - sr.left + r.width / 2; G.cy = r.top - sr.top + r.height / 2; G.w0 = r.width;
    // the box must hold the whole stage: the shape always contains x 20–80, y 45–125 of its 100 x 140 box
    G.wf = Math.max(G.sw / 0.6, G.sh / 0.8) * 1.04;
    G.fx = G.sw / 2; G.fy = G.sh / 2 - (85 - 70) / 140 * G.wf * 1.4;
  }
  function place(l, w, cx, cy) {
    var h = w * 1.4, x = cx - w / 2, y = cy - h / 2;
    l.style.webkitMaskSize = l.style.maskSize = w.toFixed(1) + 'px ' + h.toFixed(1) + 'px';
    l.style.webkitMaskPosition = l.style.maskPosition = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
    return [x, y, w, h];
  }
  function setRim(box, op, shape) {
    if (!box || op <= 0.01) { rim.style.opacity = 0; return; }
    if (rim.dataset.shape !== shape) { rimPath.setAttribute('d', nd(SH[shape], 1, 0, 0)); rim.dataset.shape = shape; }
    rim.style.opacity = op.toFixed(3);
    rim.style.transform = 'translate(' + box[0].toFixed(1) + 'px,' + box[1].toFixed(1) + 'px)';
    rim.style.width = box[2].toFixed(1) + 'px'; rim.style.height = box[3].toFixed(1) + 'px';
  }
  function grow(l, t) { // t 0..1: from the slot to the whole screen
    var e = smooth(t), w = G.w0 * Math.pow(G.wf / G.w0, e);
    return place(l, w, G.cx + (G.fx - G.cx) * e, G.cy + (G.fy - G.cy) * e);
  }
  // the photo is moved so its focus nail sits inside the small window, and eases back as the window grows.
  // the move is clamped so the photo always covers the window: no ground can ever show through the opening
  function aim(l, e, s0, box, sFix) {
    var im = l.querySelector('img'), iw = +im.getAttribute('width'), ih = +im.getAttribute('height');
    var f = (l.dataset.focus || '.5 .5').split(' ').map(Number), pp = (im.style.getPropertyValue('--pos') || '50% 50%').split(' ').map(function (v) { return parseFloat(v) / 100; });
    var sc = Math.max(G.sw / iw, G.sh / ih), W = iw * sc, H = ih * sc, s = sFix || s0 + (1 - s0) * e;
    var ox = (G.sw - W) * pp[0], oy = (G.sh - H) * pp[1];
    if (im.dataset.w !== W.toFixed(1)) { im.style.width = W + 'px'; im.style.height = H + 'px'; im.dataset.w = W.toFixed(1); }
    var dx = (G.cx - ox - W / 2 - (f[0] * W - W / 2) * s) * (1 - e), dy = (G.cy - oy - H / 2 - (f[1] * H - H / 2) * s) * (1 - e);
    if (box) {
      var x0 = Math.max(0, box[0]), x1 = Math.min(G.sw, box[0] + box[2]), y0 = Math.max(0, box[1]), y1 = Math.min(G.sh, box[1] + box[3]);
      dx = clamp(dx, x1 - ox - W / 2 - W * s / 2 + 1, x0 - ox - W / 2 + W * s / 2 - 1);
      dy = clamp(dy, y1 - oy - H / 2 - H * s / 2 + 1, y0 - oy - H / 2 + H * s / 2 - 1);
    }
    im.style.transform = 'translate(' + (ox + dx).toFixed(1) + 'px,' + (oy + dy).toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
  }
  var lastP = -1;
  function frame(force) {
    if (still()) return;
    var r = run.getBoundingClientRect(), total = run.offsetHeight - stage.offsetHeight;
    var P = clamp(-r.top / total, 0, 1) * 3.2;
    if (!force && Math.abs(P - lastP) < 0.0005) return; lastP = P;
    var rimBox = null, rimOp = 0, rimShape = 'almond';
    // the first window: the hero's nail, growing to the whole screen
    var t0 = clamp((P - 0.05) / 0.8, 0, 1), e0 = smooth(t0);
    layers[0].classList.add('vis');
    layers[0].classList.toggle('full', t0 >= 1);
    var b0 = grow(layers[0], t0);
    aim(layers[0], e0, 0.86, b0);
    if (t0 < 1) { rimBox = b0; rimOp = 1 - smooth(t0 * 1.6); rimShape = 'almond'; }
    hero.style.opacity = (1 - smooth(P / 0.3)).toFixed(3);
    hero.style.visibility = P > 0.3 ? 'hidden' : '';
    // the next windows open small inside the photo, rest a moment, then swallow the screen
    for (var k = 1; k < layers.length; k++) {
      var l = layers[k], a = clamp((P - k) / 0.22, 0, 1), t = clamp((P - k - 0.38) / 0.5, 0, 1), e = smooth(t), prev = layers[k - 1];
      var on = P > k;
      l.classList.toggle('vis', on);
      l.classList.toggle('full', t >= 1);
      var sh = prev.querySelector('.shade');
      if (sh) sh.style.opacity = on ? (0.28 * smooth(a) + 0.2 * e).toFixed(3) : 0;
      if (!on) continue;
      var box;
      if (t <= 0) box = place(l, Math.max(1, G.w0 * smooth(a)), G.cx, G.cy);
      else box = grow(l, t);
      aim(l, e, 1.25, box);
      aim(prev, 1, 1, null, 1 + 0.1 * e);
      if (t < 1) { rimBox = box; rimOp = smooth(a) * (1 - smooth(t * 1.6)); rimShape = l.dataset.shape; }
    }
    setRim(rimBox, rimOp, rimShape);
    caps.forEach(function (c, i) {
      var from = i + 0.8, to = i === caps.length - 1 ? 99 : i + 1.32;
      c.classList.toggle('on', P >= from && P < to);
    });
  }
  function stillStage() { // motion off: the hero's nail window stays at its size; nothing moves
    layers.forEach(function (l, i) { l.classList.toggle('vis', i === 0); l.classList.remove('full'); l.querySelector('img').style.transform = ''; var s = l.querySelector('.shade'); if (s) s.style.opacity = 0; });
    var b = place(layers[0], G.w0, G.cx, G.cy); aim(layers[0], 0, 0.86, b); setRim(b, 1, 'almond');
    hero.style.opacity = ''; hero.style.visibility = '';
    caps.forEach(function (c) { c.classList.remove('on'); });
  }
  var ticking = false;
  function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(function () { ticking = false; frame(); }); }
  // long names: each half of the name must fit beside the nail window (desktop) or across the screen (phone)
  function fitName() {
    var h1 = $('#h1'); h1.style.fontSize = '';
    var sw = stage.clientWidth, slotW = slot.getBoundingClientRect().width, phone = innerWidth <= 900;
    var room = phone ? sw - 32 : (sw - slotW) / 2 - 40;
    var widest = Math.max.apply(null, $$('#h1 > span').map(function (sp) { return sp.getBoundingClientRect().width; }));
    if (widest > room) h1.style.fontSize = (parseFloat(getComputedStyle(h1).fontSize) * room / widest).toFixed(1) + 'px';
  }
  function layout() { fitName(); geom(); lastP = -1; if (still()) stillStage(); else frame(true); }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', layout);
  window.__frame = function () { frame(true); };

  // ---------------------------------------------------------------- stepper (motion off)
  var stI = 0, figs = $$('[data-st]'), chips = $$('[data-go]');
  function stShow(i) {
    stI = (i + figs.length) % figs.length;
    figs.forEach(function (f, k) { f.classList.toggle('is-on', k === stI); });
    chips.forEach(function (c, k) { c.setAttribute('aria-pressed', k === stI ? 'true' : 'false'); });
    var cap = caps[stI], l = he() ? 'he' : 'en';
    $('[data-st-title]').innerHTML = cap.querySelector('h2 [lang="' + l + '"]').textContent + '<small>' + cap.querySelector('p [lang="' + l + '"]').textContent + '</small>';
  }
  $('[data-st-prev]').addEventListener('click', function () { stShow(stI - 1); });
  $('[data-st-next]').addEventListener('click', function () { stShow(stI + 1); });
  chips.forEach(function (c) { c.addEventListener('click', function () { stShow(+c.dataset.go); }); });

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-stars]').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
    $$('[data-title-he]').forEach(function (f) { f.title = f.dataset[l === 'he' ? 'titleHe' : 'titleEn']; });
    $$('[data-svc] option').forEach(function (o) { o.textContent = o.dataset[l]; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-nav]', 'ראשי', 'Main'); aria('[data-fnav]', 'סוף העמוד', 'Footer');
    aria('[data-t-call]', 'התקשרו לסטודיו, 052-288-5275', 'Call the studio, 052-288-5275');
    aria('[data-t-wa]', 'וואטסאפ לסטודיו', 'WhatsApp the studio');
    aria('[data-stepper]', 'עבודות', 'Work'); aria('[data-st-chips]', 'עבודה', 'Work');
    aria('[data-nail]', 'ציפורן בצורה שנבחרה', 'A nail in the chosen shape');
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('sf-lang', l); } catch (e) {}
    texts(l); hours(); stShow(stI); write(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(), anchor = $('#desk'), keep = anchor.getBoundingClientRect().top;
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('sf-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-rv]').forEach(function (el) { el.classList.add('in'); });
    layout();
    if (keep < innerHeight) { var now = anchor.getBoundingClientRect().top; if (now !== keep) scrollBy(0, now - keep); }
  }); });
  motionUI();

  // ---------------------------------------------------------------- entrances, staggered inside each section
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    $$('section').forEach(function (s) { $$('[data-rv]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 4) * 80 + 'ms'); io.observe(el); }); });
  } else { $$('[data-rv]').forEach(function (el) { el.classList.add('in'); }); }

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
    else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); }
    else {
      var nd2 = (n.d + 1) % 7, k = 0; while (!H[nd2] && k++ < 7) nd2 = (nd2 + 1) % 7;
      txt = !H[nd2] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd2 === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd2][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd2][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd2] + ' ב-' + hhmm(H[nd2][0]) : 'Closed now · opens ' + dayEn[nd2] + ' at ' + hhmm(H[nd2][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  function hours() { // consecutive days with the same hours share a row; the week starts on Sunday
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
  window.__H = H; window.__hours = hours;
  setInterval(status, 60000);

  // ---------------------------------------------------------------- the live nail and the message
  var form = $('#composer'), nail = $('[data-nail]'), body = $('[data-nail-body]'), clip = $('[data-nail-clip]');
  var cur = SH.almond.slice(), anim = null;
  var NAME = { almond: ['שקד', 'Almond'], square: ['מרובע', 'Square'], stiletto: ['סטילטו', 'Stiletto'] };
  function drawNail(p) { var d = nd(p, 1.2, 40, 4); body.setAttribute('d', d); clip.setAttribute('d', d); }
  function morph(to) {
    var from = cur.slice(), t0 = performance.now(), dur = still() ? 0 : 380;
    if (anim) cancelAnimationFrame(anim);
    (function step(ts) {
      var t = dur ? clamp((ts - t0) / dur, 0, 1) : 1, e = 1 - Math.pow(1 - t, 3);
      cur = from.map(function (v, i) { return v + (to[i] - v) * e; }); drawNail(cur);
      if (t < 1) anim = requestAnimationFrame(step);
    })(t0);
  }
  var T = {
    he: { hi: 'שלום, הגעתי דרך האתר. אשמח לקבוע תור ל', shape: ' צורה: ', tip: ', עם קצה לבן (פרנץ\').', tipOnly: ' עם קצה לבן (פרנץ\').', ask: ' מתי יש מקום?', subj: 'תור ב-Studio French' },
    en: { hi: 'Hi, I found your website. I’d like to book ', shape: ' Shape: ', tip: ', with a white French tip.', tipOnly: ' With a white French tip.', ask: ' When do you have a free slot?', subj: 'Booking at Studio French' }
  };
  var SVC_EN = { gel: 'a gel polish manicure', ext: 'nail extensions', art: 'nail art', str: 'nail strengthening', ped: 'a pedicure', both: 'a manicure and pedicure together' };
  function message() {
    var l = he() ? 'he' : 'en', t = T[l], fd = new FormData(form), svc = fd.get('svc') || 'gel', shape = fd.get('shape') || 'almond', tip = !!fd.get('tip');
    var opt = form.querySelector('option[value="' + svc + '"]');
    var m = t.hi + (l === 'he' ? opt.dataset.he : SVC_EN[svc]) + '.';
    if (svc !== 'ped') m += t.shape + (l === 'he' ? NAME[shape][0] : NAME[shape][1].toLowerCase()) + (tip ? t.tip : '.');
    else if (tip) m += t.tipOnly;
    return m + t.ask;
  }
  function write() {
    var m = message(), l = he() ? 'he' : 'en', shape = new FormData(form).get('shape') || 'almond';
    $('[data-preview]').textContent = m;
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    $('[data-mail]').href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(T[l].subj) + '&body=' + encodeURIComponent(m);
    $('[data-nail-name]').textContent = NAME[shape][l === 'he' ? 0 : 1] + (new FormData(form).get('tip') ? (l === 'he' ? ' · פרנץ\'' : ' · French') : '');
    nail.classList.toggle('no-tip', !new FormData(form).get('tip'));
  }
  form.addEventListener('change', function (e) {
    if (e.target.name === 'shape') morph(SH[e.target.value]);
    write();
  });
  drawNail(cur);

  // ---------------------------------------------------------------- start
  texts(he() ? 'he' : 'en'); hours(); stShow(0); write();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  layout();
})();
