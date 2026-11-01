(function () {
  var root = document.documentElement, WA = '972507707686';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'חשמל רכב אשקר (גוטמן) · חשמלאי רכב · חרושת 52, קריית ביאליק', en: 'Ashkar (Gutman) Auto Electric · Auto electrician · 52 Haroshet St, Kiryat Bialik' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור חשמל רכב אשקר (גוטמן) · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Ashkar (Gutman) Auto Electric · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';
  var svgEl = function (tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'חשמל רכב אשקר', 'Ashkar Auto Electric');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו למוסך, 050-770-7686', 'Call the garage, 050-770-7686');
    aria('[data-t-wa]', 'וואטסאפ למוסך', 'WhatsApp the garage');
    aria('[data-t-key]', 'מצב המפתח', 'Key position');
    aria('[data-t-prev]', 'השלב הקודם', 'Previous step');
    aria('[data-t-next]', 'השלב הבא', 'Next step');
    aria('[data-t-prevp]', 'התמונה הקודמת', 'Previous photo');
    aria('[data-t-nextp]', 'התמונה הבאה', 'Next photo');
    aria('[data-t-nextr]', 'הביקורת הבאה', 'Next review');
    aria('[data-t-board]', 'נורות בלוח', 'Dash lamps');
    aria('[data-t-rock]', 'מה קורה לרכב', 'What the car is doing');
    $('[data-cluster]').setAttribute('aria-label', l === 'he' ? 'לוח שעונים: סל"ד ומתח המצבר' : 'Instrument cluster: engine speed and battery voltage');
    var car = $('[data-car]'); car.placeholder = car.dataset[l === 'he' ? 'phHe' : 'phEn'];
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ash-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('ash-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    layout(); onScroll(); kickHero(); kickIgn();
  }); });
  motionUI();

  // ---------------------------------------------------------------- opening: a tap skips it; it also ends by itself in CSS
  var boot = $('[data-boot]');
  if (boot) {
    boot.addEventListener('click', function () { boot.classList.add('gone'); });
    setTimeout(function () { boot.remove(); }, 1800);
  }

  // ---------------------------------------------------------------- hours and live status, Israel time.
  // H = null: the hours are not listed on Google. When they are known: {0:[8,17], ..., 6:null} (null = closed), or 'all' for 24/7.
  var H = null;
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var l = he(), txt, open = false;
    if (!H) txt = l ? 'שעות הפעילות לא פורסמו · כדאי להתקשר לפני' : 'Hours not listed · call before you come';
    else if (H === 'all') { open = true; txt = l ? 'פתוח 24/7' : 'Open 24/7'; }
    else {
      var n = now(), t = H[n.d];
      if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
      else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
      else {
        var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
        txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now') : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
      }
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
  }
  function hours() {
    var l = he(), note = $('[data-hours-note]');
    if (!H) note.textContent = l ? 'השעות לא מפורסמות בגוגל. התקשרו או שלחו וואטסאפ לפני שמגיעים.' : 'The hours aren’t listed on Google. Call or WhatsApp before you come.';
    else if (H === 'all') note.textContent = l ? 'פתוח 24 שעות, כל השבוע.' : 'Open 24 hours, all week.';
    else note.textContent = [0, 1, 2, 3, 4, 5, 6].map(function (d) { var t = H[d]; return (l ? dayHe : dayEn)[d] + ' ' + (t ? hhmm(t[0]) + '–' + hhmm(t[1]) : (l ? 'סגור' : 'closed')); }).join(' · ');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento,.cb').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter, out of a blur (CSS does the timing)
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // ---------------------------------------------------------------- gauges: one dial geometry for the whole page
  // value fraction f (0..1) → angle in degrees, sweeping 270° clockwise from bottom-left
  var ang = function (f) { return 135 + 270 * f; };
  function ticks(g, o) {
    g.innerHTML = '';
    for (var v = o.min; v <= o.max + 1e-6; v += o.step) {
      var f = (v - o.min) / (o.max - o.min), a = (o.a0 + o.sweep * f) * Math.PI / 180, maj = Math.abs(v - Math.round(v / o.major) * o.major) < 1e-6;
      var r1 = maj ? o.r1 - o.majX : o.r1, ca = Math.cos(a), sa = Math.sin(a);
      var t = svgEl('line', { x1: (ca * r1).toFixed(2), y1: (sa * r1).toFixed(2), x2: (ca * o.r2).toFixed(2), y2: (sa * o.r2).toFixed(2), 'class': 'tk' + (maj ? ' maj' : '') + (o.red && v >= o.red ? ' red' : '') }, g);
      t.dataset.v = v.toFixed(2);
      if (maj && o.lr) { var lt = svgEl('text', { x: (ca * o.lr).toFixed(2), y: (sa * o.lr).toFixed(2), 'class': 'lbl' }, g); lt.textContent = o.fmt ? o.fmt(v) : v; }
    }
  }
  function arcPath(r, f0, f1, a0, sweep) {
    var A = (a0 + sweep * f0) * Math.PI / 180, B = (a0 + sweep * f1) * Math.PI / 180;
    return 'M' + (Math.cos(A) * r).toFixed(2) + ' ' + (Math.sin(A) * r).toFixed(2) + 'A' + r + ' ' + r + ' 0 ' + ((f1 - f0) * sweep > 180 ? 1 : 0) + ' 1 ' + (Math.cos(B) * r).toFixed(2) + ' ' + (Math.sin(B) * r).toFixed(2);
  }

  // ---------------------------------------------------------------- hero: the tachometer runs its self-test sweep, idles, and revs with the hand
  var hero = $('[data-hero]'), dial = $('[data-dial]'), ring = $('[data-ticks]'), hNeedle = $('[data-needle]'), rpmOut = $('[data-rpm]');
  ticks(ring, { min: 0, max: 8, step: .25, major: 1, a0: 135, sweep: 270, r1: 90, r2: 99, majX: 4, lr: 106, red: 6.5 });
  var hTicks = $$('.tk', ring), heroVis = true, hRaf = 0, rpm = 0, rpmGoal = .8, t0 = performance.now(), px = -1, py = -1, wander = 0;
  function heroFrame(t) {
    hRaf = 0;
    var e = (t - t0) / 1000, idle = .78 + Math.sin(e * 2.1) * .03 + Math.sin(e * 5.3) * .012;
    if (still()) rpm = .8;
    else if (e < 2.2) { var k = clamp((e - .9) / 1.3, 0, 1); rpm = k < .5 ? 8 * smooth(k * 2) : lerp(8, idle, smooth((k - .5) * 2)); }   // the cluster's self-test sweep, once
    else { rpm += ((px >= 0 ? rpmGoal : idle) - rpm) * .08; }
    hNeedle.setAttribute('transform', 'rotate(' + ang(clamp(rpm / 8, 0, 1)).toFixed(2) + ')');
    rpmOut.textContent = Math.round(rpm * 1000 / 10) * 10;
    hTicks.forEach(function (tk) { tk.classList.toggle('lit', +tk.dataset.v <= rpm + .01); });
    // the headlight beam: the hand on desktop, a slow wander on phones
    var bx, by;
    if (px >= 0) { bx = px; by = py; } else { wander += .006; bx = 50 + Math.sin(wander * 1.3) * 22; by = 52 + Math.sin(wander * .9 + 1) * 16; }
    dial.style.setProperty('--bx', bx.toFixed(1) + '%'); dial.style.setProperty('--by', by.toFixed(1) + '%');
    if (heroVis && !still()) hRaf = requestAnimationFrame(heroFrame);
  }
  function kickHero() { if (!hRaf) hRaf = requestAnimationFrame(heroFrame); }
  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var r = dial.getBoundingClientRect(), hr = hero.getBoundingClientRect();
    px = clamp((e.clientX - r.left) / r.width * 100, 0, 100); py = clamp((e.clientY - r.top) / r.height * 100, 0, 100);
    var fx = clamp((e.clientX - hr.left) / hr.width, 0, 1); rpmGoal = 1 + 4.2 * (rtl() ? 1 - fx : fx);   // further from the text = more revs
    $('.dial-photo img').style.setProperty('--px', ((px - 50) * -.08).toFixed(2) + 'px');
    $('.dial-photo img').style.setProperty('--py', ((py - 50) * -.08).toFixed(2) + 'px');
    kickHero();
  });
  hero.addEventListener('pointerleave', function () { px = py = -1; });
  hero.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') { rpmGoal = 4.5; px = 50; py = 50; setTimeout(function () { px = py = -1; }, 450); kickHero(); } });   // a tap blips the throttle
  watch(hero, function (v) { heroVis = v; if (v) kickHero(); });

  // ---------------------------------------------------------------- ignition: LOCK → ON → START → running after the work
  var ign = $('[data-ign]'), ignBg = $('.ign-bg'), tachG = $('[data-ticks-tach]'), voltG = $('[data-ticks-volt]');
  var nT = $('[data-n-tach]'), nV = $('[data-n-volt]'), vRead = $('[data-vread]'), keyEl = $('[data-key]');
  ticks(tachG, { min: 0, max: 7, step: .5, major: 1, a0: 135, sweep: 270, r1: 128, r2: 136, majX: 12, lr: 98, red: 6 });
  ticks(voltG, { min: 8, max: 16, step: .5, major: 2, a0: 135, sweep: 270, r1: 128, r2: 136, majX: 12, lr: 98 });
  var vf = function (v) { return (v - 8) / 8; };
  svgEl('path', { d: arcPath(140, 0, vf(11), 135, 270), 'class': 'band', stroke: '#d42a32' }, voltG);
  svgEl('path', { d: arcPath(140, vf(13.6), vf(14.8), 135, 270), 'class': 'band', stroke: '#2f8f55' }, voltG);
  var K = [{ rpm: 0, v: 12.1 }, { rpm: 0, v: 11.9 }, { rpm: .18, v: 9.4 }, { rpm: .8, v: 14.2 }];
  var OFF = { oil: 2.56, temp: 2.6, engine: 2.66, abs: 2.72, brake: 2.78, batt: 2.92 };   // after the start: the battery light is the last to go out
  var lamps = $$('[data-lamp]'), caps = $$('[data-cap]'), kps = $$('.kp'), bgs = $$('[data-bg]');
  var KEYA = [-62, -18, 26, 70], S = 0, ignVis = false, iRaf = 0, sTarget = 0;
  function ignDraw(t) {
    var s = S, i = Math.min(2, Math.floor(s)), f = smooth(s - i), a = K[i], b = K[i + 1];
    var r = lerp(a.rpm, b.rpm, f), v = lerp(a.v, b.v, f), live = !still() && ignVis, e = (t || performance.now()) / 1000;
    var crank = s > 1.55 && s < 2.45;
    if (live && crank) { r += Math.abs(Math.sin(e * 23)) * .12; v += Math.sin(e * 31) * .22; }   // a weak crank: the needle stutters, the voltage shakes
    if (live && s > 2.6) { r += Math.sin(e * 2.3) * .02; v += Math.sin(e * 1.7) * .03; }       // a real idle is never perfectly still
    nT.setAttribute('transform', 'rotate(' + ang(clamp(r / 7, 0, 1)).toFixed(2) + ')');
    nV.setAttribute('transform', 'rotate(' + ang(clamp(vf(v), 0, 1)).toFixed(2) + ')');
    vRead.textContent = v.toFixed(1) + ' V';
    lamps.forEach(function (l) {
      var on = s >= .6 && s < OFF[l.dataset.lamp];
      if (on && crank && live) on = Math.sin(e * 40 + l.dataset.lamp.length) > -.6;               // brown-out flicker while cranking
      l.classList.toggle('on', on);
    });
    var idx = Math.round(s);
    caps.forEach(function (c, k) { c.classList.toggle('on', k === idx); });
    kps.forEach(function (k, n) { k.classList.toggle('on', n === idx); });
    keyEl.style.setProperty('--k', lerp(KEYA[i], KEYA[i + 1], f).toFixed(1) + 'deg');
    bgs[0].style.setProperty('--o', (1 - smooth((s - 1.4) / .4)).toFixed(3));
    bgs[1].style.setProperty('--o', (smooth((s - 1.4) / .4) * (1 - smooth((s - 2.45) / .35))).toFixed(3));
    bgs[2].style.setProperty('--o', smooth((s - 2.45) / .35).toFixed(3));
  }
  function ignFrame(t) {
    iRaf = 0;
    if (still()) { S += (sTarget - S) * 1; }
    ignDraw(t);
    if (ignVis && !still()) iRaf = requestAnimationFrame(ignFrame);
  }
  function kickIgn() { if (!iRaf) iRaf = requestAnimationFrame(ignFrame); }
  watch(ign, function (v) { ignVis = v; if (v) kickIgn(); });
  function goStage(n) {
    n = clamp(n, 0, 3);
    if (still()) { sTarget = S = n; ignDraw(); return; }
    var r = ign.getBoundingClientRect(), span = ign.offsetHeight - innerHeight;
    scrollTo({ top: scrollY + r.top + span * ((n + .2) / 3.4) + 2, behavior: 'smooth' });
  }
  kps.forEach(function (k) { k.addEventListener('click', function () { goStage(+k.dataset.stage); }); });
  $$('[data-step]').forEach(function (b) { b.addEventListener('click', function () { goStage(Math.round(S) + (+b.dataset.step)); }); });

  // ---------------------------------------------------------------- work tiles: spotlight, charge readout, fault codes decoding, the alternator turning
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var work = $('[data-work]'), workVis = false, chargeOut = $('[data-charge]'), cv = ['11.9 V', '12.1 V', '12.3 V', '12.5 V', '12.6 V'], ci = 0;
  watch(work, function (v) { workVis = v; });
  setInterval(function () { if (!workVis) return; if (still()) { chargeOut.textContent = '12.6 V'; return; } ci = (ci + 1) % 5; chargeOut.textContent = cv[ci]; }, 640);
  var codeEl = $('[data-decode]'), codes = ['P0562 · SYSTEM VOLTAGE LOW', 'P0620 · GENERATOR CONTROL', 'U0100 · LOST COMM. WITH ECM'], cn = 0, GL = 'ABCDEFGHJKLMNPRSTUVXYZ0123456789';
  function decode(to) {
    var t0 = performance.now();
    (function st(t) {
      var k = clamp((t - t0) / 700, 0, 1), n = Math.floor(to.length * k);
      codeEl.textContent = to.slice(0, n) + to.slice(n).replace(/[^ ·.]/g, function () { return GL[Math.floor(Math.random() * GL.length)]; });
      if (k < 1) requestAnimationFrame(st);
    })(t0);
  }
  setInterval(function () { if (!workVis || still()) return; cn = (cn + 1) % codes.length; decode(codes[cn]); }, 4200);
  // the pulley is cut from the same photo at its real place and turned about its own axle
  var altBox = $('.altbox'), altImg = $('.altbox img'), pulley = $('.pulley');
  function placePulley() {
    var W = altBox.clientWidth, Hh = altBox.clientHeight, iw = 1200, ih = 800, sc = Math.max(W / iw, Hh / ih), dw = iw * sc, dh = ih * sc;
    var ox = (W - dw) * .5, oy = (Hh - dh) * .62, cx = ox + .5417 * dw, cy = oy + .64 * dh, r = .079 * dw;
    pulley.style.cssText = 'left:' + (cx - r) + 'px;top:' + (cy - r) + 'px;width:' + (2 * r) + 'px;height:' + (2 * r) + 'px;background-size:' + dw + 'px ' + dh + 'px;background-position:' + (ox - (cx - r)) + 'px ' + (oy - (cy - r)) + 'px';
  }

  // ---------------------------------------------------------------- garage: the photo dial under a fixed needle
  var garage = $('[data-garage]'), arc = $('[data-arc]'), acs = $$('.ac', arc), aIdx = 0, drag = false, lx = 0, dragRot = 0, rot = 0;
  function step() { return phone() ? 30 : 30; }
  function arcDraw() {
    var st = step(), dir = rtl() ? -1 : 1;
    acs.forEach(function (c, i) {
      var th = i * st - rot, a = Math.abs(th) / st;
      c.style.setProperty('--t', (th * dir).toFixed(2) + 'deg');
      c.style.setProperty('--s', (1 + .14 * Math.max(0, 1 - a)).toFixed(3));
      c.style.setProperty('--b', (1 - Math.min(.55, a * .28)).toFixed(3));
      c.style.zIndex = 10 - Math.round(a);
      c.style.visibility = Math.abs(th) > 100 ? 'hidden' : 'visible';
    });
  }
  function arcScroll() {
    var st = step(), max = (acs.length - 1) * st;
    if (still()) { rot = aIdx * st; }
    else {
      var r = garage.getBoundingClientRect(), gs = garage.querySelector('.g-stick'), p = clamp(-(r.top + 40) / Math.max(1, garage.offsetHeight - gs.offsetHeight - innerHeight * .25), 0, 1);
      rot = clamp(p * max + dragRot, 0, max);
    }
    arcDraw();
  }
  arc.addEventListener('pointerdown', function (e) { drag = true; lx = e.clientX; arc.classList.add('drag'); });
  addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; if (still()) return; dragRot += dx * .12 * (rtl() ? 1 : -1); arcScroll(); });
  addEventListener('pointerup', function () { if (!drag) return; drag = false; arc.classList.remove('drag'); });
  $$('[data-arc-step]').forEach(function (b) { b.addEventListener('click', function () {
    var st = step(), max = (acs.length - 1) * st;
    if (still()) { aIdx = clamp(aIdx + (+b.dataset.arcStep), 0, acs.length - 1); arcScroll(); return; }
    var cur = Math.round(rot / st), want = clamp(cur + (+b.dataset.arcStep), 0, acs.length - 1);
    dragRot += (want - cur) * st; dragRot = clamp(dragRot, -max, max); arcScroll();
  }); });

  // ---------------------------------------------------------------- reviews: the rating gauge, the odometer, the stack
  var rateG = $('[data-ticks-rate]'), nR = $('[data-n-rate]'), rvSec = $('[data-reviews]');
  ticks(rateG, { min: 0, max: 5, step: .25, major: 1, a0: 180, sweep: 180, r1: 86, r2: 96, majX: 8, lr: 104 });
  var rTicks = $$('.tk', rateG);
  function rate(v) { nR.setAttribute('transform', 'rotate(' + (180 + 180 * v / 5).toFixed(2) + ')'); rTicks.forEach(function (t) { t.classList.toggle('lit', +t.dataset.v <= v + .01); }); }
  rate(still() ? 4.3 : 0);
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span>' + ch + '</span>';
      var s = ''; for (var k = 0; k < 10; k++) s += '<i data-n="' + k + '"></i>';
      return '<span class="d" data-to="' + ch + '"><span>' + s + '</span></span>';
    }).join('');
    o.setAttribute('aria-label', o.dataset.odo); o.setAttribute('role', 'img');
  });
  function roll(go) { $$('[data-odo] .d').forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : 0; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  roll(still());
  var rateT = 0;
  watch($('.rv-gauge'), function (v) {
    if (!v || rateT) return; rateT = 1; roll(true);
    if (still()) { rate(4.3); return; }
    var a = performance.now(); (function st(t) { var k = clamp((t - a) / 1400, 0, 1), e = 1 - Math.pow(1 - k, 3); rate(4.3 * e); if (k < 1) requestAnimationFrame(st); })(a);
  }, { threshold: .4 });
  var rvs = $$('.rv'), rvI = 0, rvVis = false, rvCount = $('[data-rv-count]');
  function showRv(n) {
    rvs.forEach(function (r, k) { r.classList.toggle('out', k === rvI && n !== rvI); r.classList.toggle('on', k === n); r.setAttribute('aria-hidden', k === n ? 'false' : 'true'); });
    rvI = n; rvCount.textContent = (n + 1) + ' / ' + rvs.length;
  }
  showRv(0);
  $('[data-rv-step]').addEventListener('click', function () { showRv((rvI + 1) % rvs.length); });
  watch(rvSec, function (v) { rvVis = v; });
  setInterval(function () { if (rvVis && !still() && !rvSec.matches(':hover')) showRv((rvI + 1) % rvs.length); }, 6500);

  // ---------------------------------------------------------------- the live thing: the message to the garage writes itself
  var lbs = $$('.lb'), rks = $$('.rk'), carIn = $('[data-car]'), bubble = $('[data-bubble]'), send = $('[data-send]'), shown = '', typeT = 0;
  lbs.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); write(); }); });
  rks.forEach(function (b) { b.addEventListener('click', function () { rks.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write(); }); });
  carIn.addEventListener('input', function () { write(true); });
  function message() {
    var l = he() ? 'he' : 'en', on = lbs.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.dataset[l]; });
    var rk = rks.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0], car = carIn.value.trim();
    var m = l === 'he' ? ['שלום, הגעתי אליכם דרך האתר.'] : ['Hi, I found you through the website.'];
    if (on.length) m.push(l === 'he' ? 'נורות דלוקות בלוח: ' + on.join(', ') + '.' : 'Lights on in the dash: ' + on.join(', ') + '.');
    if (rk) m.push(l === 'he' ? 'מה קורה: ' + rk.dataset.he + '.' : 'What’s happening: ' + rk.dataset.en + '.');
    if (car) m.push(l === 'he' ? 'הרכב: ' + car + '.' : 'The car: ' + car + '.');
    m.push(l === 'he' ? 'אפשר לתאם בדיקה?' : 'Could we set up a check?');
    return m.join('\n');
  }
  function write(instant) {
    var msg = message();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
    clearInterval(typeT);
    if (instant || still()) { shown = msg; bubble.textContent = msg; return; }
    var k = 0; while (k < shown.length && k < msg.length && shown[k] === msg[k]) k++;   // keep what is already written, type the rest
    typeT = setInterval(function () {
      k = Math.min(msg.length, k + 2); shown = msg.slice(0, k);
      bubble.innerHTML = ''; bubble.appendChild(document.createTextNode(shown));
      if (k < msg.length) { var c = document.createElement('span'); c.className = 'caret'; bubble.appendChild(c); }
      else clearInterval(typeT);
    }, 18);
  }

  // ---------------------------------------------------------------- footer: the wordmark fits its sign; the shutter rolls up
  var sign = $('[data-fit]'), foot = $('[data-foot]'), shutter = $('[data-shutter]');
  function fitSign() {
    sign.style.fontSize = '80px';
    var sp = $('span[lang="' + root.lang + '"]', sign), avail = sign.clientWidth - parseFloat(getComputedStyle(sign).paddingLeft) * 2;
    sign.style.fontSize = Math.min(phone() ? 64 : 150, 80 * avail / Math.max(1, sp.getBoundingClientRect().width)) * .98 + 'px';
  }

  // ---------------------------------------------------------------- scroll: nav pill, the ignition stage, the circle reveal, the garage landing, the shutter
  var nav = $('[data-nav]'), start = $('[data-start]'), heroActs = $('.h-acts'), actsVis = true, ticking = false;
  watch(heroActs, function (v) { actsVis = v; start.classList.toggle('hide', v); });
  function onScroll() {
    ticking = false;
    nav.classList.toggle('pill', scrollY > 40);
    var vh = innerHeight, r = ign.getBoundingClientRect();
    if (!still()) {
      var span = ign.offsetHeight - vh, p = clamp(-r.top / Math.max(1, span), 0, 1);
      S = clamp(p * 3.4 - .2, 0, 3); sTarget = S;
      ignBg.style.setProperty('--rv', (12 + 140 * smooth(1 - r.top / vh)).toFixed(1) + '%');
      var g = garage.getBoundingClientRect(), gp = smooth((vh - g.top) / (vh * .55));
      garage.style.setProperty('--lift', ((1 - gp) * 90).toFixed(1) + 'px'); garage.style.setProperty('--ls', (.95 + .05 * gp).toFixed(4));
      var f = foot.getBoundingClientRect(), fh = Math.min(f.height, vh), up = smooth((vh - f.top) / (fh * .82));
      shutter.style.setProperty('--up', up.toFixed(4));
    } else {
      ignBg.style.setProperty('--rv', '150%'); garage.style.removeProperty('--lift'); garage.style.removeProperty('--ls');
    }
    ignDraw(); arcScroll();
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  function layout() { $('[data-cluster]').setAttribute('viewBox', phone() ? '64 22 672 318' : '0 0 800 330'); garage.style.setProperty('--gh', (garage.querySelector('.g-stick').offsetHeight + 60) + 'px'); placePulley(); fitSign(); arcScroll(); onScroll(); }
  var rz = 0; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  texts(root.lang); hours(); write(true); layout(); kickHero();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitSign);
})();
