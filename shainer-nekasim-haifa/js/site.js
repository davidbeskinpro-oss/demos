(function () {
  var root = document.documentElement, WA = '972505370312';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var TITLE = { he: 'שיינר נכסים · אלי שיינר · תיווך, שיווק וייעוץ נדל״ן בחיפה', en: 'Shainer Nekasim · Eli Shainer · Real-estate brokerage in Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור שיינר נכסים · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Shainer Nekasim · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'שיינר נכסים', 'Shainer Nekasim');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-visit]', 'יצירת קשר', 'Contact');
    aria('[data-t-side]', 'באיזה צד אתם', 'Which side you’re on');
    aria('[data-t-deal]', 'סוג העסקה', 'Kind of deal');
    aria('[data-t-less]', 'פחות חדרים', 'Fewer rooms');
    aria('[data-t-more]', 'יותר חדרים', 'More rooms');
    aria('[data-t-prev]', 'השלב הקודם', 'Previous step');
    aria('[data-t-next]', 'השלב הבא', 'Next step');
    aria('[data-t-stages]', 'שלבים', 'Steps');
    aria('[data-t-call]', 'התקשרו לאלי, 050-537-0312', 'Call Eli, 050-537-0312');
    aria('[data-t-wa]', 'וואטסאפ לאלי', 'WhatsApp Eli');
    var ar = $('[data-area]'); ar.placeholder = ar.dataset[l === 'he' ? 'phHe' : 'phEn'];
    decodeTo(true);
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('shn-lang', l); } catch (e) {}
    texts(l); hours(); write(true); splitName(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('shn-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-wipe]').forEach(function (el) { el.classList.add('in'); });
    door.kick(); dots.kick(); write(true); layout();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 23], 1: [9, 23], 2: [9, 23.5], 3: [9, 23], 4: [9, 23], 5: [9, 16.5], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { if (x >= 24) return '24:00'; var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    var allDay = function (x) { return x && x[0] === 0 && x[1] >= 24; };
    if (allDay(t)) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
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
  // consecutive days with the same hours share a row; the week starts on Sunday
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] >= 24) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); if (e.target.hasAttribute('data-decode') || e.target.querySelector('[data-decode]')) decodeTo(); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-wipe]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 12 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });
  // the footer name, letters that climb into place as the curtain lifts
  var fname = $('[data-fname]');
  function splitName() {
    $$('span[lang]', fname).forEach(function (sp) {
      if (sp.dataset.done) return; sp.dataset.done = 1;
      sp.innerHTML = sp.textContent.split('').map(function (c, i) { return c === ' ' ? ' ' : '<span class="ch" style="--i:' + i + '">' + c + '</span>'; }).join('');
    });
  }
  splitName();

  var hero = $('[data-hero]'), hmedia = $('[data-hmedia]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- glyph decode: his name out of scrambled letters
  var dec = $('[data-decode]'), decT = 0;
  function decodeTo(instant) {
    var target = dec.dataset[he() ? 'he' : 'en'], pool = he() ? 'אבגדהוזחטיכלמנסעפצקרשת' : 'ABCDEFGHIKLMNOPRSTUVWXYZ';
    clearInterval(decT);
    if (instant === true || still()) { dec.textContent = target; return; }
    var f = 0;
    decT = setInterval(function () {
      f++;
      dec.textContent = target.split('').map(function (c, i) { return c === ' ' || f > 6 + i * 2 ? c : pool[Math.floor(Math.random() * pool.length)]; }).join('');
      if (f > 8 + target.length * 2) { clearInterval(decT); dec.textContent = target; }
    }, 45);
  }

  // where the hero photo really sits: object-fit cover at 50% 60%, then the CSS scale about 50% 40%
  var heroS = 0;
  function heroMap(W, Hh) {
    var iw = 1800, ih = 1285, s0 = Math.max(W / iw, Hh / ih), w0 = iw * s0, h0 = ih * s0, x0 = (W - w0) * .5, y0 = (Hh - h0) * .6;
    var S = still() ? 1 : 1.06 + heroS * .08, Ox = W * .5, Oy = Hh * .4;
    return { w: w0 * S, h: h0 * S, ox: Ox + (x0 - Ox) * S, oy: Oy + (y0 - Oy) * S };
  }

  // ---------------------------------------------------------------- hero: the red tower and its doorway, a window of daylight
  var door = (function () {
    var el = $('[data-door]'), pane = $('[data-pane]'), raf = 0, vis = true, px = null, py = null, x = 0, y = 0, t0 = performance.now(), W, Hh;
    function cover() { W = hmedia.clientWidth; Hh = hmedia.clientHeight; return heroMap(W, Hh); }
    var cv = null;
    function place() {
      var dw = el.offsetWidth, dh = el.offsetHeight;
      el.style.transform = 'translate3d(' + (x - dw / 2).toFixed(1) + 'px,' + (y - dh / 2).toFixed(1) + 'px,0)';
      // the pane shows the same photo in full daylight, lined up with the dimmed one under it
      var pr = pane.getBoundingClientRect(), mr = hmedia.getBoundingClientRect();
      pane.style.backgroundSize = cv.w + 'px ' + cv.h + 'px';
      pane.style.backgroundPosition = (cv.ox - (pr.left - mr.left)).toFixed(1) + 'px ' + (cv.oy - (pr.top - mr.top)).toFixed(1) + 'px';
    }
    function frame(t) {
      raf = 0; cv = cover();
      var T = (t - t0) / 1000;
      // where it goes: the hand on a desktop; on touch it walks an S of its own (and jumps to a tap)
      var tx, ty;
      if (still()) { tx = W * (rtl() ? .22 : .78); ty = Hh * .38; }
      else if (px !== null) { tx = px; ty = py; }
      else { var side = rtl() ? .28 : .72; tx = W * (side + Math.sin(T * .35) * (phone() ? .18 : .14)); ty = Hh * (phone() ? .26 : .4) + Math.sin(T * .7) * Hh * (phone() ? .08 : .12); }
      if (still() || !x) { x = tx; y = ty; } else { x = lerp(x, tx, .08); y = lerp(y, ty, .08); }
      place();
      if (!still() && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { cv = null; if (!raf) raf = requestAnimationFrame(frame); }
    if (fine.matches) {
      hero.addEventListener('pointermove', function (e) { var r = hmedia.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
      hero.addEventListener('pointerleave', function () { px = py = null; });
    } else {
      hero.addEventListener('pointerdown', function (e) { if (e.target.closest('a,button')) return; var r = hmedia.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; setTimeout(function () { px = py = null; }, 2600); });
    }
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- opening: the logo's doorway opens onto the hero photo
  function opening() {
    var ov = $('[data-opening]'), lg = $('[data-oplogo]'), ph = $('[data-opphoto]');
    if (!root.classList.contains('opening-on')) return false;
    try { sessionStorage.setItem('shn-open', '1'); } catch (e) {}
    var done = false, t0 = 0, raf = 0;
    var D = [0.327, 0.321, 0.547, 0.772];   // the grey door inside the real logo (fractions of the image)
    function end() { if (done) return; done = true; cancelAnimationFrame(raf); root.classList.remove('opening-on'); ov.remove(); start(); }
    ov.addEventListener('click', end);
    function go() {
      ov.classList.add('show');
      var m = hmedia.getBoundingClientRect();
      ph.style.left = m.left + 'px'; ph.style.top = m.top + 'px'; ph.style.width = m.width + 'px'; ph.style.height = m.height + 'px';
      // align the photo layer exactly with the hero image
      var hm = heroMap(m.width, m.height);
      ph.style.backgroundSize = hm.w + 'px ' + hm.h + 'px';
      ph.style.backgroundPosition = hm.ox + 'px ' + hm.oy + 'px';
      var L = lg.getBoundingClientRect();
      var dr = { l: L.left + L.width * D[0], t: L.top + L.height * D[1], r: L.left + L.width * D[2], b: L.top + L.height * D[3] };
      var cx = (dr.l + dr.r) / 2, cy = (dr.t + dr.b) / 2;
      // how far the logo must grow around its doorway for the door to cover the whole hero photo
      var zmax = Math.max((cx - m.left) / (cx - dr.l), (m.right - cx) / (dr.r - cx), (cy - m.top) / (cy - dr.t), (m.bottom - cy) / (dr.b - cy)) * 1.02;
      requestAnimationFrame(function st(t) {
        if (!t0) t0 = t;
        var e = (t - t0) / 1000;
        var o = smooth((e - .5) / .9);                 // the door opens from .5s to 1.4s
        var z = Math.pow(zmax, o * o * (3 - 2 * o) * .35 + o * .65);   // we walk toward the door: slow, then through
        lg.style.left = '0'; lg.style.top = '0';
        lg.style.transform = 'translate(' + (cx - (cx - L.left) * z) + 'px,' + (cy - (cy - L.top) * z) + 'px) scale(' + z + ')';
        // the photo shows exactly inside the grown doorway, cut to the hero's frame
        var l = Math.max(m.left, cx - (cx - dr.l) * z), r = Math.min(m.right, cx + (dr.r - cx) * z), tp = Math.max(m.top, cy - (cy - dr.t) * z), bt = Math.min(m.bottom, cy + (dr.b - cy) * z);
        ph.style.clipPath = 'inset(' + (tp - m.top) + 'px ' + (m.right - r) + 'px ' + (m.bottom - bt) + 'px ' + (l - m.left) + 'px)';
        ph.style.opacity = String(smooth(o / .12));
        var dim = smooth((o - .7) / .3);
        ph.style.filter = 'grayscale(' + (.75 * dim) + ') brightness(' + lerp(1, .42, dim) + ') contrast(' + lerp(1, 1.05, dim) + ')';
        lg.style.opacity = String(1 - smooth((o - .82) / .18));
        ov.style.backgroundColor = o >= 1 ? 'transparent' : '';
        if (e < 1.5) raf = requestAnimationFrame(st); else end();
      });
    }
    if (lg.complete && lg.naturalWidth) setTimeout(go, 120); else lg.addEventListener('load', function () { setTimeout(go, 60); }, { once: true });
    setTimeout(end, 2600);   // never block the page
    return true;
  }

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 4) % 10; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- tilt toward the hand: the logo plate and the work photographs
  if (fine.matches) {
    $$('[data-tilt]').forEach(function (t) {
      var p = $('[data-plate]', t);
      t.addEventListener('pointermove', function (e) { if (still()) return; var r = t.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5; p.style.setProperty('--ry', (nx * 18).toFixed(2) + 'deg'); p.style.setProperty('--rx', (-ny * 14).toFixed(2) + 'deg'); });
      t.addEventListener('pointerleave', function () { p.style.setProperty('--ry', '0deg'); p.style.setProperty('--rx', '0deg'); });
    });
    $$('[data-tilt2]').forEach(function (f) {
      f.addEventListener('pointermove', function (e) { if (still()) return; var r = f.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5; f.style.setProperty('--ry', (nx * 8).toFixed(2) + 'deg'); f.style.setProperty('--rx', (-ny * 6).toFixed(2) + 'deg'); });
      f.addEventListener('pointerleave', function () { f.style.setProperty('--ry', '0deg'); f.style.setProperty('--rx', '0deg'); });
    });
  }
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- two sides: the S seam between a home and the people looking for it
  var match = $('[data-match]'), clip = $('[data-sclip]'), band = $('[data-band]'), bedge = $('[data-bedge]'), seam = $('.m-seam');
  var mlines = $$('[data-mlines] li'), mchips = $$('[data-mchip]'), mquote = $('.m-quote'), mimgs = $$('.m-photos img'), stage = 0, mOn = false, mT0 = performance.now();
  function seamAt(p, T) {
    // stage 0: only the home. 1: the seam comes in and settles as an S. 2: the red tower rises in it. 3: it sweeps across.
    var c = p < .25 ? lerp(1.08, .62, smooth((p - .08) / .17)) : p < .75 ? lerp(.62, .5, smooth((p - .25) / .25)) : lerp(.5, -.12, smooth((p - .76) / .2));
    var a = .1 * (1 - smooth((p - .9) / .1)) + (still() ? 0 : Math.sin(T * 1.1) * .012);
    var bw = p < .5 ? 0 : p < .75 ? smooth((p - .5) / .18) : 1 - smooth((p - .82) / .14);
    return { c: c, a: a, bw: bw };
  }
  function drawSeam(p) {
    var T = (performance.now() - mT0) / 1000, s = seamAt(p, T), r = rtl();
    // in Hebrew the people looking come in from the left (reading flows right to left), in English from the right
    var cx = r ? 1 - s.c : s.c, a = r ? -s.a : s.a;
    var far = r ? -0.2 : 1.2;
    clip.setAttribute('d', 'M' + cx + ' 0 C ' + (cx + a) + ' .33 ' + (cx - a) + ' .67 ' + cx + ' 1 L ' + far + ' 1 L ' + far + ' 0 Z');
    var d = 'M' + cx * 1000 + ' 0 C ' + (cx + a) * 1000 + ' 333 ' + (cx - a) * 1000 + ' 667 ' + cx * 1000 + ' 1000';
    band.setAttribute('d', d); bedge.setAttribute('d', d);
    var vw = innerWidth;
    seam.style.setProperty('--bw', (s.bw * Math.min(vw * .11, 150)).toFixed(1) + 'px');
    seam.style.setProperty('--ew', (s.c > 1 || s.c < 0 ? 0 : phone() ? 8 : 14) + 'px');
    var kb = still() ? 1.03 : lerp(1.12, 1.02, p);
    mimgs.forEach(function (im) { im.style.setProperty('--kb', kb.toFixed(4)); });
    var st = Math.min(3, Math.floor(p * 4));
    mlines.forEach(function (li, i) { li.classList.toggle('on', i === st); });
    mchips.forEach(function (b, i) { b.setAttribute('aria-pressed', i === st ? 'true' : 'false'); });
    mquote.style.setProperty('--q', still() ? 1 : smooth((p - .55) / .2).toFixed(3));
  }
  function stillStage(i) { stage = (i + 4) % 4; drawSeam((stage + .5) / 4 + (stage === 3 ? .1 : 0)); }
  $('[data-mprev]').addEventListener('click', function () { stillStage(stage - 1); });
  $('[data-mnext]').addEventListener('click', function () { stillStage(stage + 1); });
  mchips.forEach(function (b, i) { b.addEventListener('click', function () {
    if (still()) { stillStage(i); return; }
    // with motion on, a chip scrolls to its part of the story
    var r = match.getBoundingClientRect(), span = match.offsetHeight - innerHeight;
    scrollTo({ top: scrollY + r.top + span * ((i + .55) / 4), behavior: 'smooth' });
  }); });
  watch(match, function (v) { mOn = v; if (v) seamLoop(); });
  var sl = 0;
  function seamLoop() { if (sl || still() || !mOn) return; sl = requestAnimationFrame(function () { sl = 0; drawSeam(prog(match)); seamLoop(); }); }

  // ---------------------------------------------------------------- composer: the live thing
  var side = $('[data-side]'), sideB = $$('[data-sidev]'), dealB = $$('[data-deal]'), rv = $('[data-roomsv]'), area = $('[data-area]'), msgEl = $('[data-msg]'), steps = $$('[data-step]'), rooms = 3, shown = '', typing = 0, chatSeen = false;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function pick(list, v) { list.forEach(function (x) { x.setAttribute('aria-checked', x === v ? 'true' : 'false'); }); }
  sideB.forEach(function (b) { b.addEventListener('click', function () { pick(sideB, b); side.dataset.v = b.dataset.sidev; lightStep(0); write(); }); });
  dealB.forEach(function (b) { b.addEventListener('click', function () { pick(dealB, b); lightStep(1); write(); }); });
  $$('[data-rooms]').forEach(function (b) { b.addEventListener('click', function () { rooms = clamp(rooms + +b.dataset.rooms, 1, 6); rv.textContent = rooms === 6 ? '6+' : rooms; lightStep(2); write(); }); });
  area.addEventListener('input', function () { lightStep(2); write(true); });
  $('[data-send]').addEventListener('pointerenter', function () { lightStep(3); });
  $('[data-send]').addEventListener('focus', function () { lightStep(3); });
  $('[data-send]').addEventListener('click', function () { lightStep(3); });
  side.dataset.v = 'owner';
  function compose() {
    var l = he(), s = side.dataset.v, d = dealB.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0].dataset.deal;
    var a = area.value.trim().replace(/\s+/g, ' ');
    if (l) {
      var flat = rooms === 1 ? 'דירת חדר' : rooms === 6 ? 'דירה של 6 חדרים ומעלה' : 'דירת ' + rooms + ' חדרים';
      var where = a ? ' ב' + (/^ב/.test(a) ? a.slice(1) : a) : '';
      return s === 'owner'
        ? 'שלום אלי, יש לי ' + flat + where + ' ואני רוצה ' + (d === 'rent' ? 'להשכיר' : 'למכור') + ' אותה. אשמח לדבר.'
        : 'שלום אלי, אנחנו מחפשים ' + flat + where + ' ' + (d === 'rent' ? 'לשכירות' : 'לקנייה') + '. נשמח לשמוע מה יש.';
    }
    var fe = rooms === 1 ? 'a one-room flat' : rooms === 6 ? 'a flat with 6 rooms or more' : 'a ' + rooms + '-room flat';
    var we = a ? ' in ' + a : '';
    return s === 'owner'
      ? 'Hi Eli, I have ' + fe + we + ' and I’d like to ' + (d === 'rent' ? 'rent it out' : 'sell it') + '. Happy to talk.'
      : 'Hi Eli, I’m looking for ' + fe + we + ' to ' + (d === 'rent' ? 'rent' : 'buy') + '. I’d like to hear what you have.';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 14);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('.wd-pane'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; lightStep(0); write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- footer: the logo's own pixels gather into it and part under the hand
  var dots = (function () {
    var cv = $('[data-dots]'), c = cv.getContext('2d'), src = new Image(), P = [], w, h, raf = 0, vis = false, ok = false, mx = -999, my = -999, t0 = 0;
    src.src = 'img/logo.jpg';
    function sample() {
      try {
        var iw = 200, ih = 225, sc = document.createElement('canvas'); sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(src, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data; P = [];
        for (var y = 0; y < ih; y += 2) for (var x = 0; x < iw; x += 2) {
          var k = (y * iw + x) * 4, r = d[k], g = d[k + 1], b = d[k + 2];
          if (r + g + b > 640) continue;                       // the white plate stays behind
          P.push({ hx: x / iw, hy: y / ih, col: 'rgb(' + r + ',' + g + ',' + b + ')', x: Math.random(), y: Math.random() + 1, vx: 0, vy: 0, dl: Math.random() * .5, ph: Math.random() * 6.3 });
        }
        ok = true;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); P.forEach(function (p) { p.sx = undefined; }); t0 = performance.now(); }
    function frame(now) {
      raf = 0; if (!ok) return;
      var calm = still(), T = (now - t0) / 1000;
      var lh = h * .98, lw = lh * 200 / 225, ox = rtl() ? w - lw - (w > 500 ? w * .18 : 0) : (w > 500 ? w * .18 : 0), oy = 0;
      if (w < 500) ox = (w - lw) / 2 - (rtl() ? -30 : 30);
      c.clearRect(0, 0, w, h);
      var s = w < 500 ? 2.2 : 2.8;
      for (var i = 0; i < P.length; i++) {
        var p = P[i], a = calm ? 1 : smooth((T - p.dl) / 1.4);
        var tx = ox + p.hx * lw + (calm ? 0 : Math.sin(T * 1.2 + p.ph) * .9), ty = oy + p.hy * lh + (calm ? 0 : Math.cos(T + p.ph) * .9);
        if (calm) { p.x = tx; p.y = ty; }
        else if (a < 1) { if (p.sx === undefined) { p.sx = p.x * w; p.sy = p.y * h; } p.x = lerp(p.sx, tx, a); p.y = lerp(p.sy, ty, a); }
        else {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 6400) { var f = (6400 - d2) / 6400 * 2.4, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
          p.vx += (tx - p.x) * .07; p.vy += (ty - p.y) * .07; p.vx *= .8; p.vy *= .8; p.x += p.vx; p.y += p.vy;
        }
        c.fillStyle = p.col; c.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    cv.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    cv.addEventListener('pointerleave', function () { mx = my = -999; });
    cv.addEventListener('pointerdown', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; setTimeout(function () { mx = my = -999; }, 700); });
    function start() { sample(); size(); kick(); }
    if (src.complete && src.naturalWidth) start(); else src.addEventListener('load', start, { once: true });
    watch(cv, function (v) { var was = vis; vis = v; if (v && !was) { P.forEach(function (p) { p.x = Math.random(); p.y = Math.random() + 1; p.sx = undefined; }); t0 = performance.now(); } kick(); });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var cards = $$('.card'), fdoor = $('[data-fdoor]'), sfill = $('[data-sfill]'), sline = $('[data-sline]'), eph = $('[data-parallax]'), revs = $('[data-revs]'), rail = $('[data-rail]'), rbar = $('[data-rvbar]'), visit = $('[data-visit]'), foot = $('[data-foot]'), tower = $('[data-tower]');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // the hero's S edge straightens as you leave it, the red line draws along it
    var hr = hero.getBoundingClientRect(), hp = calm ? 0 : clamp(-hr.top / (hr.height * .7), 0, 1);
    var amp = 60 * (1 - hp), mid = 60;
    sfill.setAttribute('d', 'M0 120 L0 ' + mid + ' C 250 ' + (mid - amp) + ' 750 ' + (mid + amp) + ' 1000 ' + mid + ' L1000 120 Z');
    sline.setAttribute('d', 'M0 ' + mid + ' C 250 ' + (mid - amp) + ' 750 ' + (mid + amp) + ' 1000 ' + mid);
    hero.style.setProperty('--sl', calm ? 1 : (.25 + hp * 1.5).toFixed(3));
    hero.style.setProperty('--hs', hp.toFixed(3)); heroS = hp;
    if (!calm) door.kick();
    // Eli's photo drifts against the scroll
    if (!calm && innerWidth > 600) { var er = eph.getBoundingClientRect(); eph.style.setProperty('--py', ((er.top + er.height / 2 - vh / 2) * -.06).toFixed(1) + 'px'); } else eph.style.removeProperty('--py');
    // two sides
    if (!calm) { drawSeam(prog(match)); seamLoop(); }
    // reviews: the rail slides sideways with the scroll
    if (!calm) {
      var rp = smooth(prog(revs) * 1.08 - .04), span = Math.max(0, rail.scrollWidth - innerWidth);
      rail.style.setProperty('--rx2', ((rtl() ? 1 : -1) * rp * span).toFixed(1) + 'px');
      rbar.parentNode.style.setProperty('--rp', rp.toFixed(3)); rbar.style.setProperty('--rp', rp.toFixed(3));
      // the doors rise into line one after another as the rail starts to move
      var pr0 = prog(revs);
      cards.forEach(function (cd, i) { cd.style.setProperty('--cy', ((1 - smooth(pr0 * 3.2 - i * .28)) * 70).toFixed(1) + 'px'); });
    } else { rail.style.removeProperty('--rx2'); cards.forEach(function (cd) { cd.style.removeProperty('--cy'); }); }
    // the open door in the questions: the bay drifts inside it
    if (!calm) { var fdr = fdoor.getBoundingClientRect(); fdoor.style.setProperty('--fy', (clamp((fdr.top - vh) / (vh + fdr.height), -1, 0) * 18).toFixed(1) + '%'); } else fdoor.style.removeProperty('--fy');
    // visit lands over the questions
    var vr = visit.getBoundingClientRect(), vp = calm ? 1 : smooth((vh - vr.top) / (vh * .7));
    visit.style.setProperty('--vy', calm ? '0px' : ((1 - vp) * 90).toFixed(1) + 'px');
    // footer name climbs into place as the curtain lifts
    // (the footer is sticky, so measure how much of the page is left above it instead of its own box)
    var left = document.documentElement.scrollHeight - scrollY - vh, fh = foot.offsetHeight, fp = calm ? 1 : smooth(1 - left / (fh * .9));
    foot.style.setProperty('--fp', fp.toFixed(3));
    tower.classList.toggle('hide', left < fh * .6 || scrollY < hero.offsetHeight * .55);
  }

  function layout() { door.kick(); dots.size(); if (still()) stillStage(stage); else drawSeam(prog(match)); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false;
  function start() { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); door.kick(); }); }
  if (!opening()) {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
    setTimeout(start, 900);
  }
  addEventListener('load', function () { layout(); });
})();
