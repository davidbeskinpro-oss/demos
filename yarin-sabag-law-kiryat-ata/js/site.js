(function () {
  var root = document.documentElement, WA = '972534210018';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var io = 'IntersectionObserver' in window;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'עו״ד ירין סבג · פלילי ותעבורה · דרך חיפה 37, קריית אתא', en: 'Yarin Sabag, Adv. · Criminal & traffic law · 37 Derech Haifa, Kiryat Ata' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור ירין סבג – משרד עורך דין פלילי ותעבורה · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Yarin Sabag – Criminal & Traffic Law Office · This is not the business’s official website' };
  var RING = { he: '5.0 · 17 ביקורות בגוגל · 5.0 · 17 ביקורות בגוגל ·', en: '5.0 · 17 Google reviews · 5.0 · 17 Google reviews ·' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-seal]', '5.0 בגוגל, 17 ביקורות', '5.0 on Google, 17 reviews');
    aria('[data-t-wa]', 'וואטסאפ לירין', 'WhatsApp Yarin');
    aria('[data-t-prev]', 'התיק הקודם', 'Previous file');
    aria('[data-t-next]', 'התיק הבא', 'Next file');
    aria('[data-set-lang]', 'English', 'עברית');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: דרך חיפה 37, קריית אתא' : 'Map: 37 Derech Haifa, Kiryat Ata'; });
    $$('[data-ring]').forEach(function (t) { t.textContent = RING[l]; });
    $$('[data-ph-he]').forEach(function (t) { t.placeholder = t.dataset[l === 'he' ? 'phHe' : 'phEn']; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ys-lang', l); } catch (e) {}
    texts(l); hours(); compose(true); measure();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('ys-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-rise]').forEach(function (el) { el.classList.add('in'); });
    reset(); measure(); compose(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. [from, to] in hours; null = closed
  var H = { 0: [0, 24], 1: [0, 24], 2: [0, 24], 3: [0, 24], 4: [0, 24], 5: [0, 24], 6: [19, 24] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { x = x % 24; var h = Math.floor(x), m = Math.round((x - h) * 60); return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; };
  var full = function (t) { return t && t[0] === 0 && t[1] === 24; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, s: +o.second, m: +o.minute, hr: (+o.hour) % 24 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && n.h >= t[0] && n.h < t[1]) {
      open = true;
      var nextOpen = H[(n.d + 1) % 7], runs = t[1] === 24 && nextOpen && nextOpen[0] === 0;
      txt = full(t) ? (l ? 'פתוח עכשיו · 24 שעות היום' : 'Open now · 24 hours today')
        : runs ? (l ? 'פתוח עכשיו' : 'Open now')
        : (l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]));
    } else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
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
      var val = !t ? (l ? 'סגור' : 'Closed') : full(t) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.f-head > *, .folder, .w-head > *, .intake, .r-head > *, .rows > *, .v-side, .map').forEach(function (el, i) {
    el.setAttribute('data-rise', ''); el.style.setProperty('--d', (i % 4) * 80 + 'ms');
  });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { threshold: .12 }) : null;
  $$('[data-rise]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  // the rating rolls up like a counter when the reviews arrive
  var odo = $('[data-odo]'), rolled = false;
  function roll() {
    if (rolled) return; rolled = true;
    if (still() || !odo.animate) return;
    var v = 0;
    (function step() {
      odo.textContent = v.toFixed(1);
      odo.animate([{ transform: 'translateY(.18em)', opacity: .35 }, { transform: 'none', opacity: 1 }], { duration: 140, easing: 'cubic-bezier(.23,1,.32,1)' });
      v = Math.round((v + .5) * 10) / 10;
      if (v <= 5) setTimeout(step, 80 + v * 14);
    })();
  }
  if (io) new IntersectionObserver(function (es) { if (es[0].isIntersecting) roll(); }, { threshold: .4 }).observe(odo);

  // ---------------------------------------------------------------- the seam: drapes part, close, open onto scene B
  var seam = $('[data-seam]'), stage = $('.stage', seam), dl = $('[data-drape="l"]'), dr = $('[data-drape="r"]');
  var aPhoto = $('[data-a-photo]'), aCopy = $('[data-a-copy]'), sceneB = $('[data-scene-b]');
  var opening = 0.62, openT0 = performance.now();          // on arrival the drapes are drawn part way and part to the sides
  var ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  if (fine) stage.addEventListener('pointermove', function (e) { ptr.tx = e.clientX / innerWidth - .5; ptr.ty = e.clientY / innerHeight - .5; });
  if (fine) stage.addEventListener('pointerleave', function () { ptr.tx = ptr.ty = 0; });
  function seamFrame(t) {
    var vh = innerHeight, r = seam.getBoundingClientRect(), total = seam.offsetHeight - vh;
    var p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
    opening = 0.62 * (1 - smooth((t - openT0 - 150) / 1300));
    var c = p < .49 ? smooth((p - .28) / .19) : 1 - smooth((p - .51) / .22);
    c = Math.max(c, p < .49 ? opening : 0);
    seam.classList.toggle('b', p >= .49);
    ptr.x += (ptr.tx - ptr.x) * .08; ptr.y += (ptr.ty - ptr.y) * .08;
    var W = stage.clientWidth, dw = W * .53, edge = W < 700 || p >= .49 ? 0 : W * .03, sway = ptr.x * 10;
    var off = (1 - c) * (dw - edge + 70);
    dr.style.transform = 'translate3d(' + (off + sway).toFixed(1) + 'px,0,0)';
    dl.style.transform = 'translate3d(' + (-off + sway).toFixed(1) + 'px,0,0)';
    aPhoto.style.setProperty('--push', smooth((p - .08) / .4).toFixed(3));
    aPhoto.style.setProperty('--px', (ptr.x * -16).toFixed(1) + 'px');
    aPhoto.style.setProperty('--py', (ptr.y * -10).toFixed(1) + 'px');
    aCopy.style.setProperty('--lift', smooth((p - .2) / .18).toFixed(3));
    sceneB.style.setProperty('--open', smooth((p - .53) / .24).toFixed(3));
    return p;
  }
  // B&W card leans to the hand
  var bw = $('[data-tilt]');
  if (fine && bw) sceneB.addEventListener('pointermove', function (e) {
    var x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    bw.style.setProperty('--rx', (x * 10).toFixed(2) + 'deg'); bw.style.setProperty('--ry', (y * -8).toFixed(2) + 'deg');
  });

  // ---------------------------------------------------------------- dust in the window light
  var motes = (function () {
    var cv = $('[data-motes]'), c = cv.getContext('2d'), P = [], w = 0, h = 0, vis = true;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = w < 700 ? 26 : 54; P = [];
      for (var i = 0; i < n; i++) P.push({ x: w * (.42 + Math.random() * .58), y: Math.random() * h, r: .6 + Math.random() * 1.9, v: .08 + Math.random() * .22, a: Math.random() * 6.28, o: .2 + Math.random() * .5 });
    }
    function draw() {
      if (!vis) return;
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var q = P[i]; q.a += .01; q.y -= q.v; q.x += Math.sin(q.a) * .25 + ptr.x * .3;
        if (q.y < -6) { q.y = h + 6; q.x = w * (.42 + Math.random() * .58); }
        var tw = q.o * (.6 + .4 * Math.sin(q.a * 2.3));
        c.fillStyle = 'rgba(255,244,222,' + tw.toFixed(3) + ')';
        c.beginPath(); c.arc(q.x, q.y, q.r, 0, 6.283); c.fill();
      }
    }
    if (io) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(cv);
    size();
    return { size: size, draw: draw };
  })();

  // ---------------------------------------------------------------- files: run arrows, spotlight, sinking under the next card
  var run = $('[data-runrow]'), files = $('[data-files]'), write = $('[data-write]');
  $$('[data-run]').forEach(function (b) { b.addEventListener('click', function () {
    var f = $('.folder', run), step = f.offsetWidth + 18, dir = +b.dataset.run * (he() ? -1 : 1);
    run.scrollBy({ left: dir * step, behavior: still() ? 'auto' : 'smooth' });
  }); });
  if (fine) $$('[data-folder]').forEach(function (f) { f.addEventListener('pointermove', function (e) {
    var r = f.getBoundingClientRect(); f.style.setProperty('--mx', (e.clientX - r.left) + 'px'); f.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }); });
  // recorder timecode (mm:ss:frames) runs while the card is on screen
  var tc = $('[data-tc]'), tcVis = false, tc0 = 0;
  if (io) new IntersectionObserver(function (es) { tcVis = es[0].isIntersecting; if (tcVis) tc0 = performance.now(); }).observe(tc);
  function tcFrame(t) {
    if (!tcVis || still()) return;
    var ms = t - tc0, f = Math.floor(ms / 40) % 25, s = Math.floor(ms / 1000) % 60, m = Math.floor(ms / 60000) % 60;
    var z = function (v) { return (v < 10 ? '0' : '') + v; };
    tc.textContent = z(m) + ':' + z(s) + ':' + z(f);
  }
  // the hearing clock: real Israel time
  var ticks = $('.clock .ticks');
  for (var k = 0; k < 12; k++) {
    var a = k * Math.PI / 6, r1 = k % 3 ? 45 : 41, ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ln.setAttribute('x1', 60 + Math.sin(a) * r1); ln.setAttribute('y1', 60 - Math.cos(a) * r1); ln.setAttribute('x2', 60 + Math.sin(a) * 49); ln.setAttribute('y2', 60 - Math.cos(a) * 49);
    ticks.appendChild(ln);
  }
  var hh = $('[data-hh]'), mh = $('[data-mh]'), sh = $('[data-sh]'), secTurns = 0, lastS = -1;
  function clock() {
    var n = now();
    if (lastS >= 0 && n.s < lastS) secTurns++;
    lastS = n.s;
    hh.style.transform = 'rotate(' + ((n.hr % 12) * 30 + n.m * .5) + 'deg)';
    mh.style.transform = 'rotate(' + (n.m * 6 + n.s * .1) + 'deg)';
    sh.style.transition = still() ? 'none' : 'transform .22s cubic-bezier(.4,2.2,.6,1)';
    sh.style.transform = 'rotate(' + (secTurns * 360 + n.s * 6) + 'deg)';
  }
  clock(); setInterval(clock, 1000);

  // ---------------------------------------------------------------- the intake slip (live thing)
  var form = $('[data-intake]'), line = $('[data-line]'), pv = $('[data-preview]'), send = $('[data-send]'), steps = $$('[data-steps] li'), shown = '', target = '', sent = false;
  var TOP = {
    he: ['חקירה במשטרה', 'מעצר ושחרור', 'כתב אישום', 'עבירת תעבורה', 'שלילת רישיון', 'אחר'],
    en: ['police questioning', 'an arrest and release', 'an indictment', 'a traffic offence', 'a licence suspension', 'something else']
  };
  function compose(instant) {
    var l = he() ? 'he' : 'en', ch = $('input[name="t"]:checked', form), txt = line.value.trim().replace(/\s+/g, ' ');
    var t = ch ? TOP[l][+ch.value] : '';
    if (l === 'he') target = 'שלום ירין, ' + (t ? 'אני פונה בנושא ' + t + '.' : txt ? '' : 'אשמח להתייעץ איתך.') + (txt ? (t ? ' ' : '') + txt : '');
    else target = 'Hi Yarin, ' + (t ? "I'm writing about " + t + '.' : txt ? '' : "I'd like to consult with you.") + (txt ? (t ? ' ' : '') + txt : '');
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    steps[0].classList.toggle('on', !!ch);
    steps[1].classList.toggle('on', txt.length > 2);
    steps[2].classList.toggle('on', !!ch && txt.length > 2 || sent);
    steps[3].classList.toggle('on', sent);
    if (instant || still()) { shown = target; pv.textContent = shown; }
  }
  function typeFrame() {
    if (shown === target) return;
    var i = 0; while (i < shown.length && shown[i] === target[i]) i++;
    shown = shown.length > i ? shown.slice(0, Math.max(i, shown.length - 3)) : target.slice(0, i + 2);
    pv.textContent = shown;
  }
  form.addEventListener('input', function () { compose(false); });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  send.addEventListener('click', function () { sent = true; compose(false); });

  // ---------------------------------------------------------------- reviews drift: one copy more for a seamless loop
  var row = $('[data-band] .row');
  $$('.q', row).forEach(function (q) { var c = q.cloneNode(true); c.setAttribute('aria-hidden', 'true'); row.appendChild(c); });

  // ---------------------------------------------------------------- close: the portrait shrinks into the slot on the back of his card
  var close = $('[data-close]'), cStage = $('.c-stage', close), cPhoto = $('[data-cphoto]'), slot = $('[data-slot]'), card = $('[data-cardback]');
  var L = null;
  function measure() {
    motes.size();
    var s = cStage.getBoundingClientRect(), b = slot.getBoundingClientRect();
    L = { x: b.left - s.left, y: b.top - s.top, w: b.width, h: b.height, W: s.width, H: s.height };
    cPhoto.style.left = L.x + 'px'; cPhoto.style.top = L.y + 'px'; cPhoto.style.width = L.w + 'px'; cPhoto.style.height = L.h + 'px';
  }
  function closeFrame() {
    if (!L) return;
    var vh = innerHeight, r = close.getBoundingClientRect(), total = close.offsetHeight - vh;
    var p = total > 0 ? clamp(-r.top / total, 0, 1) : 1;
    var k = smooth(p / .62), s0 = Math.max(L.W / L.w, L.H / L.h) * 1.02, s = s0 + (1 - s0) * k;
    // start: the portrait covers the stage with his face in the upper third; end: exactly the slot
    var s1 = s0, top0 = clamp(L.H * .42 - L.h * s1 * .24, L.H - L.h * s1, 0);
    var tx = (L.W / 2 - L.x - L.w * s / 2) * (1 - k), ty = (top0 - L.y) * (1 - k);
    cPhoto.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
    var done = k > .999;
    cPhoto.style.visibility = done ? 'hidden' : 'visible';
    $('img', slot).style.visibility = done ? 'visible' : 'hidden';
    card.style.setProperty('--cb', smooth((p - .5) / .3).toFixed(3));
  }

  // ---------------------------------------------------------------- dock on phones
  var dock = $('[data-dock]');
  function dockFrame() { dock.classList.toggle('on', scrollY > innerHeight * .7); }

  function reset() {
    seam.classList.remove('b');
    [dl, dr].forEach(function (d) { d.style.transform = ''; });
    ['--push', '--px', '--py'].forEach(function (v) { aPhoto.style.removeProperty(v); });
    aCopy.style.removeProperty('--lift'); sceneB.style.removeProperty('--open');
    files.style.removeProperty('--sink');
    cPhoto.style.transform = ''; $('img', slot).style.visibility = ''; card.style.removeProperty('--cb');
  }

  function loop(t) {
    dockFrame();
    if (!still()) {
      seamFrame(t);
      motes.draw();
      var wr = write.getBoundingClientRect();
      files.style.setProperty('--sink', smooth((innerHeight - wr.top) / (innerHeight * .9)).toFixed(3));
      closeFrame();
      tcFrame(t);
      typeFrame();
    }
    requestAnimationFrame(loop);
  }

  texts(root.lang); hours(); compose(true);
  addEventListener('resize', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  addEventListener('load', measure);
  measure();
  requestAnimationFrame(loop);
})();
