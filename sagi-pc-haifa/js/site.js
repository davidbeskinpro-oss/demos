(function () {
  var root = document.documentElement, WA = '972559810311', EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';   // = --ease in site.css
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: 'Sagi PC · מעבדת מחשבים · זלמן שז״ר 6, חיפה', en: 'Sagi PC · Computer repair lab · 6 Zalman Shazar St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Sagi PC · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Sagi PC · This is not the business’s official website' };
  var STAR = '<svg viewBox="0 0 92 16" aria-hidden="true">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; }).join('') + '</svg><span class="vh"><span lang="he">5 כוכבים</span><span lang="en">5 stars</span></span>';
  document.querySelectorAll('[data-stars]').forEach(function (s) { s.innerHTML = STAR; });

  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    document.title = TITLE[l];
    document.querySelector('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    try { localStorage.setItem('lang', l); } catch (e) {}
    var d = document.querySelector('[name=detail]'); if (d) d.placeholder = d.dataset['ph' + (l === 'he' ? 'He' : 'En')];
    document.querySelectorAll('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    document.querySelector('[data-panel]').setAttribute('aria-label', l === 'he' ? 'יצירת קשר מהירה' : 'Quick contact');
    document.querySelector('nav.top').setAttribute('aria-label', l === 'he' ? 'ראשי' : 'Main');
    document.querySelector('.qcode').setAttribute('aria-label', l === 'he' ? '5.0 בגוגל מ-332 ביקורות' : '5.0 on Google from 332 reviews');
    document.querySelector('.dips').setAttribute('aria-label', l === 'he' ? 'שלבי הסיפור בתוך המחשב' : 'Stages of the story inside the laptop');
    document.querySelector('[data-stepper]').setAttribute('aria-label', l === 'he' ? 'מעבר בין השלבים' : 'Step through the stages');
    document.querySelectorAll('.dip').forEach(function (b) { var s = b.querySelector('[lang="' + l + '"]'); b.title = s ? s.textContent : ''; });
    write(); status(); hours(); if (window.__trackRender) window.__trackRender();
  }
  document.querySelectorAll('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // animations switch, remembered for next time
  var switches = [].slice.call(document.querySelectorAll('[data-motion-toggle]'));
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(), keep = storyBefore();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    storyAfter(keep);
    try { localStorage.setItem('motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI(); write(); seg(5.0, true); xfer(true);
    if (window.__motion3d) window.__motion3d(on);
    if (window.__trackRender) window.__trackRender();
  }); });
  motionUI();

  // the name fits the column in two lines at most, whatever its length or language
  var h1 = document.querySelector('.hero h1');
  function fitName() {
    h1.style.fontSize = '';
    var lh = parseFloat(getComputedStyle(h1).lineHeight) || parseFloat(getComputedStyle(h1).fontSize) * 0.9, n = 0;
    while (n++ < 30 && (h1.scrollWidth > h1.clientWidth + 1 || h1.getBoundingClientRect().height > lh * 2.2)) {
      var fs = parseFloat(getComputedStyle(h1).fontSize) * 0.92; if (fs < 34) break;
      h1.style.fontSize = fs + 'px'; lh = fs * 0.9;
    }
  }
  addEventListener('resize', fitName);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitName);
  fitName();

  // the chip's contact pads, drawn once around the edge
  (function () {
    var g = document.querySelector('[data-pads]'), h = '';
    for (var i = 0; i < 12; i++) { h += '<rect x="' + (60 + i * 24) + '" y="356" width="12" height="28"/>'; h += '<rect x="356" y="' + (60 + i * 24) + '" width="28" height="12"/>'; }
    g.innerHTML = h;
  })();

  // the rating on a seven-segment debug display, counting up once on load
  var SEGS = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
  var segEl = document.querySelector('[data-seg]');
  (function () {
    var P = { a: 'M6 0h28l-5 6H11z', b: 'M35 1v29l-6-4V7z', c: 'M35 34v29l-6-6V38z', d: 'M6 64h28l-5-6H11z', e: 'M0 34v29l6-6V38z', f: 'M0 1v29l6-4V7z', g: 'M3 32l5-4h24l5 4-5 4H8z' };
    var html = '';
    [0, 1].forEach(function (k) {
      html += '<g transform="translate(' + (k ? 86 : 14) + ' 16)" data-digit="' + k + '">';
      Object.keys(P).forEach(function (s) { html += '<path class="s" data-s="' + s + '" d="' + P[s] + '"/>'; });
      html += '</g>';
    });
    html += '<rect class="s on" x="64" y="74" width="8" height="8"/>';
    segEl.innerHTML = html;
  })();
  function showDigit(k, n) { segEl.querySelectorAll('[data-digit="' + k + '"] .s').forEach(function (p) { p.classList.toggle('on', SEGS[n].indexOf(p.dataset.s) >= 0); }); }
  function seg(v, now) {
    if (now || still()) { showDigit(0, Math.floor(v)); showDigit(1, Math.round(v * 10) % 10); return; }
    var t0 = performance.now();
    (function step(t) { var k = Math.max(0, Math.min(1, (t - t0) / 700)), e = 1 - Math.pow(1 - k, 3), x = v * e; showDigit(0, Math.floor(x)); showDigit(1, Math.floor(x * 10) % 10); if (k < 1) requestAnimationFrame(step); else seg(v, true); })(t0);
  }
  seg(5.0, false);

  // live opening status in Haifa time. null = closed that day
  var H = { 0: [8, 22], 1: [8, 22], 2: [8, 22], 3: [8, 22], 4: [8, 22], 5: [9, 15], 6: [19, 22] };
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
    var led = document.querySelector('[data-led]'); if (led) led.classList.toggle('open', open);
    document.querySelectorAll('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // consecutive days with the same hours share a row
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

  // the memory slots write the WhatsApp message
  var T = {
    he: { n: { laptop: 'תקלה במחשב נייד', desktop: 'תקלה במחשב נייח', fan: 'מאוורר רועש או מחשב שמתחמם', build: 'הרכבת מחשב חדש', upgrade: 'שדרוג כרטיס מסך או מעבד', files: 'העברת קבצים למחשב חדש' },
          hi: 'היי שגיא, הגעתי דרך האתר. אשמח לעזרה עם ', d: '. מה קורה: ', end: '. מתי אפשר להביא?' },
    en: { n: { laptop: 'a laptop fault', desktop: 'a desktop fault', fan: 'a loud fan or a computer that overheats', build: 'building a new PC', upgrade: 'upgrading a graphics card or processor', files: 'moving my files to a new PC' },
          hi: 'Hi Sagi, I found you through your website. I would like help with ', d: '. What’s happening: ', end: '. When could I bring it in?' }
  };
  var form = document.getElementById('composer'), preview = document.querySelector('[data-preview]'), send = document.querySelector('[data-send]');
  function write() {
    var t = T[root.lang] || T.he, f = new FormData(form), det = (f.get('detail') || '').trim().slice(0, 90);
    var m = t.hi + t.n[f.get('need') || 'laptop'] + (det ? t.d + det : '') + t.end;
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
    // the module clicks into its slot: a short settle, played with WAAPI so fast re-taps restart cleanly
    var s = e.target.parentNode.querySelector('.stick');
    if (s && s.animate && !still()) s.animate([{ transform: 'translateY(-10px)' }, { transform: 'translateY(1px)' }, { transform: 'none' }], { duration: 180, easing: EASE });
  });
  form.addEventListener('input', function (e) { if (e.target.name === 'detail') write(); });

  // entrances, once, staggered inside each section
  document.querySelectorAll('section').forEach(function (s) { s.querySelectorAll('[data-reveal]').forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 4) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); if (e.target.hasAttribute('data-leds')) leds(); if (e.target.hasAttribute('data-xfer')) xfer(); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  document.querySelectorAll('[data-reveal]').forEach(function (el) { io ? io.observe(el) : el.classList.add('in'); });
  if (!io) { leds(); xfer(); }

  // the four status lights come on one after the other
  function leds() {
    var ls = document.querySelectorAll('.led');
    ls.forEach(function (l, i) { if (still()) l.classList.add('lit'); else setTimeout(function () { l.classList.add('lit'); }, 300 + i * 450); });
  }
  // the transfer. The old disk spins up and its arm hunts across the platter for scattered pieces; every read goes down
  // the cable as a packet, and the count, the bar and the chips on the new drive only move when a packet lands.
  // The rest of the data sits in long runs and streams; then the arm parks on its ramp and the platter spins down.
  var xf = document.querySelector('[data-xfer]'), X = null;
  if (xf && xf.querySelector('[data-cable]') && xf.querySelector('[data-cable]').getTotalLength) X = {
    arm: xf.querySelector('[data-arm]'), clamp: xf.querySelector('[data-clamp]'), cable: xf.querySelector('[data-cable]'), ctrl: xf.querySelector('[data-ctrl]'),
    pk: [].slice.call(xf.querySelectorAll('.pk')), fills: [].slice.call(xf.querySelectorAll('[data-nand] .fill'))
  };
  var PARK = 9, OMEGA = 0.6, TRAVEL = 480, SLOW = 14, SEEK = 90, READ = 120, FAST = 40, GAP = 42;   // degrees, degrees per ms, ms
  // arm angle (around its pivot at 160,222, head 118 out) that puts the head at radius r from the spindle at 92,118
  function headR(phi) { var a = phi * Math.PI / 180, x = 68 + 118 * Math.sin(a), y = 104 - 118 * Math.cos(a); return Math.sqrt(x * x + y * y); }
  function phiFor(r) { var lo = -33, hi = 0, i, m; for (i = 0; i < 24; i++) { m = (lo + hi) / 2; if (headR(m) < r) lo = m; else hi = m; } return m; }
  function xplan() {
    var s = 7, rnd = function () { s = s * 16807 % 2147483647; return s / 2147483647; };
    var moves = [], sends = [], t = 450, r = 46, i;
    moves.push({ t0: t, t1: t + 220, a: PARK, b: phiFor(r) }); t += 220;   // loads off the ramp once the platter is up to speed
    for (i = 0; i < SLOW; i++) {   // seek, read, send
      var nr = 24 + rnd() * 42;
      moves.push({ t0: t, t1: t + SEEK, a: phiFor(r), b: phiFor(nr) }); t += SEEK + READ; r = nr;
      sends.push({ t: t, v: 45 / SLOW });
    }
    var r1 = r > 45 ? r - 22 : r + 22;   // one long run: the head creeps across the tracks while the packets stream
    moves.push({ t0: t, t1: t + FAST * GAP, a: phiFor(r), b: phiFor(r1), lin: true });
    for (i = 1; i <= FAST; i++) sends.push({ t: t + i * GAP, v: 55 / FAST });
    t += FAST * GAP;
    moves.push({ t0: t + 120, t1: t + 380, a: phiFor(r1), b: PARK });
    return { moves: moves, sends: sends, down: t + 420, end: Math.max(t + TRAVEL, t + 420 + 1400) };
  }
  function xfill(v) {
    var bar = document.querySelector('[data-xfer-bar]'), c = document.querySelector('[data-xfer-count]');
    bar.style.transform = 'scaleX(' + (v / 100).toFixed(4) + ')'; c.textContent = Math.round(v) + '%';
    if (X) X.fills.forEach(function (f, i) {   // the chips fill in order, from the bottom up
      var k = Math.max(0, Math.min(1, v / 25 - i)), yb = +f.getAttribute('y') + +f.getAttribute('height');
      f.setAttribute('transform', 'translate(0 ' + (yb * (1 - k)).toFixed(2) + ') scale(1 ' + k.toFixed(3) + ')');
    });
  }
  var xferDone = false, xferRaf = 0;
  function xferEnd() {
    xferDone = true; cancelAnimationFrame(xferRaf);
    if (X) { X.arm.setAttribute('transform', 'rotate(' + PARK + ' 160 222)'); X.pk.forEach(function (p) { p.setAttribute('visibility', 'hidden'); }); X.ctrl.style.opacity = 0; }
    xfill(100);
  }
  function xfer(now) {
    if (xferDone || xferRaf) return;
    if (now === true || still() || !X) { if (now === true && !document.querySelector('[data-xfer].in')) return; return xferEnd(); }
    var P = xplan(), len = X.cable.getTotalLength(), t0 = performance.now(), last = t0, theta = 0, drawn = -1;
    var io2 = function (k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };   // a seek: the arm accelerates and brakes hard
    xferRaf = requestAnimationFrame(function frame(t) {
      if (still()) return xferEnd();
      var e = t - t0, dt = Math.min(50, t - last), i; last = t;
      // platter: up to speed in 600 ms, coasts down after the arm parks
      var w = e < 600 ? 1 - Math.pow(1 - e / 600, 2) : e < P.down ? 1 : Math.pow(Math.max(0, 1 - (e - P.down) / 1400), 2);
      theta = (theta + OMEGA * w * dt) % 360;
      X.clamp.setAttribute('transform', 'rotate(' + theta.toFixed(1) + ' 92 118)');
      var phi = PARK;
      P.moves.forEach(function (m) { if (e >= m.t0) { var k = Math.min(1, (e - m.t0) / (m.t1 - m.t0)); phi = m.a + (m.b - m.a) * (m.lin ? k : io2(k)); } });
      X.arm.setAttribute('transform', 'rotate(' + phi.toFixed(2) + ' 160 222)');
      // packets on the cable; what has landed is what has been copied
      var got = 0, landed = -1e9, n = 0;
      for (i = 0; i < P.sends.length; i++) {
        var k = (e - P.sends[i].t) / TRAVEL;
        if (k >= 1) { got += P.sends[i].v; landed = P.sends[i].t + TRAVEL; }
        else if (k >= 0 && n < X.pk.length) {
          var a = X.cable.getPointAtLength(k * len), b = X.cable.getPointAtLength(Math.min(len, k * len + 2));
          X.pk[n].setAttribute('transform', 'translate(' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) + ') rotate(' + (Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI).toFixed(1) + ')');
          X.pk[n++].setAttribute('visibility', 'visible');
        }
      }
      for (i = n; i < X.pk.length; i++) X.pk[i].setAttribute('visibility', 'hidden');
      X.ctrl.style.opacity = Math.max(0, 1 - (e - landed) / 160) * 0.8;   // the controller blinks as each packet arrives
      var v = Math.min(100, got);
      if (v !== drawn) { drawn = v; xfill(v); }
      if (e < P.end) xferRaf = requestAnimationFrame(frame); else xferEnd();
    });
  }

  // the panel shows once the hero's buttons are gone, and steps aside over the visit card and the composer
  var panel = document.querySelector('[data-panel]'), away = new Set();
  function panelUI() { panel.classList.toggle('show', away.size === 0); }
  if ('IntersectionObserver' in window) {
    var pio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? away.add(e.target) : away.delete(e.target); }); panelUI(); }, { threshold: 0 });
    [document.querySelector('.hero-act'), document.querySelector('.qcode'), document.querySelector('.v-act'), document.querySelector('.screen'), document.querySelector('.dips'), document.querySelector('[data-stepper]'), document.querySelector('.label')].forEach(function (el) { pio.observe(el); });
  } else panel.classList.add('show');

  // ---------------------------------------------------------------- the laptop story
  // readout shared with the 3D scene: CPU temperature, clock and fan speed for a scroll position
  function read(p) {
    var c = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; }, sm = function (t) { return t * t * (3 - 2 * t); };
    if (p < 0.5) { var k = sm(c(p / 0.12)), t = Math.round(71 + 26 * k); return { t: t, ghz: t >= 95 ? 1.1 : t >= 90 ? 2.2 : 3.4, rpm: 5200, off: false }; }
    if (p < 0.83) return { t: 0, ghz: 0, rpm: 0, off: true };
    var u = sm(c((p - 0.86) / 0.11)); return { t: Math.round(97 - 35 * u), ghz: u > 0.25 ? 3.4 : 2.2, rpm: Math.round(3100 * sm(c((p - 0.86) / 0.04)) / 100) * 100, off: false };
  }
  window.__pcRead = read;
  var track = document.querySelector('[data-track]'), stage = track.querySelector('[data-stage]');
  var stillImg = track.querySelector('[data-still]'), capT = track.querySelector('[data-cap-title]'), capX = track.querySelector('[data-cap-text]');
  var dips = [].slice.call(track.querySelectorAll('[data-go]'));
  // animations off: the story is a normal block, stepped with the arrow keys or the chips; scrolling leaves it alone
  var step = 0, stepN = track.querySelector('[data-step-n]'), stepBtns = [].slice.call(track.querySelectorAll('[data-step]'));
  var rT = track.querySelector('[data-r-temp]'), rG = track.querySelector('[data-r-ghz]'), rR = track.querySelector('[data-r-rpm]'), rB = track.querySelector('[data-r-bar]'), meter = track.querySelector('.meter');
  var STAGES = [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1];
  var S = {
    he: [['רותח ומאט.', 'תחת עומס המעבד מטפס ל-97 מעלות. כדי לא להישרף הוא מוריד את התדר בעצמו, והמחשב נהיה איטי, בזמן שהמאוורר צורח במלוא המהירות.'],
         ['פותחים את המכסה.', 'מתחת למקלדת: המעבד, פלטת הנחושת וצינור החום שמוביל לצלעות הקירור. על פני הצלעות יושבת שכבת אבק, והאוויר החם חוזר פנימה במקום לצאת.'],
         ['המסב השחוק.', 'המאוורר עצמו מתנדנד על ציר שחוק. הוא רועש ודוחף פחות אוויר. את זה צריך להסביר ללקוח לפני שמזמינים חלק.'],
         ['מאוורר חדש.', 'שלושה ברגים, המאוורר הישן יוצא, שכבת האבק יורדת מהצלעות בחתיכה אחת, והמאוורר החדש נכנס למקומו.'],
         ['משחה טרמית.', 'מרימים את הקירור. המשחה הישנה התייבשה ונסדקה, מנקים אותה, שמים טיפה קטנה של משחה חדשה, והלחץ של הפלטה מורח אותה לשכבה דקה.'],
         ['קר ומהיר.', 'סוגרים. האוויר זורם החוצה דרך הצלעות, הטמפרטורה יורדת והמעבד חוזר לתדר המלא.']],
    en: [['Hot and throttling.', 'Under load the CPU climbs to 97 °C. To protect itself it cuts its own clock speed, so the computer crawls while the fan screams at full speed.'],
         ['The cover comes off.', 'Under the keyboard: the CPU, the copper plate and the heat pipe running to the cooling fins. A mat of dust sits across the fins, so hot air backs up instead of leaving.'],
         ['The worn bearing.', 'The fan itself wobbles on a worn bearing. It is loud and moves less air. That is what gets explained to the customer before a part is ordered.'],
         ['A new fan.', 'Three screws, the old fan comes out, the dust mat lifts off the fins in one piece, and the new fan drops into place.'],
         ['Thermal paste.', 'The cooler comes up. The old paste has dried and cracked; it is wiped off, a small pea of fresh paste goes on, and the plate’s pressure spreads it into a thin layer.'],
         ['Cool and fast.', 'Closed up again. Air flows out through the fins, the temperature falls and the CPU goes back to full speed.']]
  };
  var STILL_W = 1200, STILL_H = 1000;
  // label anchors (fraction of the still) recorded when the stills were rendered from pc3d.js (stills.py)
  var STILL_L = {"1": [["screen", 0.7623, 0.4539, "<span lang=\"he\">המסך: טמפרטורה ותדר המעבד</span><span lang=\"en\">The screen: CPU temperature and clock</span>"]], "2": [["dust", 0.4806, 0.3729, "<span lang=\"he\">שכבת אבק חוסמת את הצלעות</span><span lang=\"en\">A mat of dust blocks the fins</span>"]], "3": [["bearing", 0.4615, 0.4425, "<span lang=\"he\">מסב שחוק: המאוורר מתנדנד</span><span lang=\"en\">Worn bearing: the fan wobbles</span>"]], "4": [["newfan", 0.0932, 0.4569, "<span lang=\"he\">מאוורר חדש</span><span lang=\"en\">A new fan</span>"]], "5": [["newpaste", 0.506, 0.5726, "<span lang=\"he\">משחה חדשה מתפזרת בלחץ</span><span lang=\"en\">Fresh paste spreads under pressure</span>"]], "6": [["screen", 0.6757, 0.5073, "<span lang=\"he\">המסך: טמפרטורה ותדר המעבד</span><span lang=\"en\">The screen: CPU temperature and clock</span>"]]};
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
      slab.appendChild(e);
      // keep the whole label inside the stage on narrow screens
      x = Math.max(4 + 6, Math.min(x, sw - e.offsetWidth - 4 + 6));
      e.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px)';
    });
  }
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var shown = -1, lastRead = '';
  function render() {
    var r = track.getBoundingClientRect(), ps = clamp(-r.top / Math.max(1, r.height - innerHeight)), l = he() ? 'he' : 'en';
    var live = !!window.__pc3d;
    var sg = 0; while (sg < 5 && ps >= STAGES[sg + 1]) sg++;
    if (still()) sg = step;
    if (!live) {
      var src = 'img/still-' + (sg + 1) + '.jpg';
      if (stillImg.getAttribute('src') !== src) stillImg.src = src;
      stillImg.alt = S[l][sg][0] + ' ' + S[l][sg][1];
      placeLabels(sg);
    }
    if (sg !== shown || capT.dataset.l !== l) {
      var moved = shown >= 0 && sg !== shown;
      shown = sg; capT.dataset.l = l;
      capT.textContent = S[l][sg][0]; capX.textContent = S[l][sg][1];
      // a new stage's words settle in place instead of snapping
      if (moved && !still() && capT.animate) [capT, capX].forEach(function (el) { el.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: EASE }); });
      dips.forEach(function (c, i) { c.setAttribute('aria-pressed', i === sg ? 'true' : 'false'); });
      stepN.textContent = sg + 1;
      stepBtns.forEach(function (b) { b.disabled = +b.dataset.step < 0 ? sg === 0 : sg === 5; });
    }
    // in stills mode the readout shows each stage's settled numbers
    var q = live ? ps : [0.1, 0.25, 0.42, 0.63, 0.75, 0.995][sg], rd = read(q), key = rd.off + '|' + rd.t + '|' + rd.ghz + '|' + rd.rpm + l;
    if (key !== lastRead) {
      lastRead = key;
      meter.classList.toggle('off', rd.off);
      rT.textContent = rd.off ? '–' : rd.t; rG.textContent = rd.off ? '–' : rd.ghz.toFixed(1); rR.textContent = rd.off ? (l === 'he' ? 'כבוי' : 'off') : rd.rpm;
      rB.style.transform = 'scaleX(' + (rd.off ? 0 : rd.t / 100) + ')'; rB.classList.toggle('cool', !rd.off && rd.t < 80);
    }
    if (live) window.__pc3d.set(ps);
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; render(); }); } }, { passive: true });
  addEventListener('resize', function () { labelKey = ''; render(); });
  stillImg.addEventListener('load', function () { labelKey = ''; render(); });
  function go(i) { step = Math.max(0, Math.min(5, i)); render(); }
  stepBtns.forEach(function (b) { b.addEventListener('click', function () { go(shown + +b.dataset.step); }); });
  dips.forEach(function (c, i) { c.addEventListener('click', function () {
    if (still()) return go(i);
    var r = track.getBoundingClientRect();
    scrollTo({ top: scrollY + r.top + parseFloat(c.dataset.go) * (r.height - innerHeight), behavior: still() ? 'auto' : 'smooth' });
  }); });
  // switching modes keeps the visitor on the same stage, and on the story if they were in it
  function storyBefore() { var r = stage.getBoundingClientRect(); return { sg: shown < 0 ? 0 : shown, pinned: !still() && r.top <= 1 && r.bottom >= innerHeight - 1, seen: r.top < innerHeight && r.bottom > 0 }; }
  function storyAfter(k) {
    if (still()) { step = k.sg; if (k.pinned) scrollTo(0, scrollY + stage.getBoundingClientRect().top); return; }
    if (!k.seen) return;
    var r = track.getBoundingClientRect();
    scrollTo(0, scrollY + r.top + parseFloat(dips[k.sg].dataset.go) * (r.height - innerHeight));
  }
  window.__trackRender = function () { shown = -1; labelKey = ''; lastRead = ''; render(); };

  var qs = new URLSearchParams(location.search).get('lang'), saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  hours();
  setLang(qs === 'en' || qs === 'he' ? qs : (saved === 'en' ? 'en' : 'he'));
  render();
  setInterval(status, 60000);
})();
