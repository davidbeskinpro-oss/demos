(function () {
  var root = document.documentElement, WA = '972559810311', EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';   // = --ease in site.css
  var JOB = window.__JOB;
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: 'Sagi PC · תיקון, הרכבה ושדרוג מחשבים · זלמן שז״ר 6, חיפה', en: 'Sagi PC · Computer repair, builds and upgrades · 6 Zalman Shazar St, Haifa' };
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
    var aria = function (sel, h, e) { var el = document.querySelector(sel); if (el) el.setAttribute('aria-label', l === 'he' ? h : e); };
    aria('[data-bay]', 'יצירת קשר מהירה', 'Quick contact');
    aria('[data-dimms]', 'ראשי', 'Main');
    stripUI();
    aria('[data-statuses]', 'סטטוסים בכרטיס העבודה', 'Statuses on the job card');
    aria('[data-stepper]', 'מעבר בין הסטטוסים', 'Step through the statuses');
    var map = document.querySelector('.map iframe'); if (map) map.title = l === 'he' ? 'Google Maps: זלמן שז״ר 6, חיפה' : 'Google Maps: 6 Zalman Shazar St, Haifa';
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
    motionUI(); write(); xfer(true); if (window.__chrome) window.__chrome();
    document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    if (window.__motion3d) window.__motion3d(on);
    if (window.__trackRender) window.__trackRender();
  }); });
  motionUI();

  // the name always fits the hero on one line
  var h1 = document.querySelector('.logo');
  function fitName() {
    h1.style.fontSize = ''; h1.style.whiteSpace = '';
    var n = 0, box = h1.parentNode, room = box.clientWidth - parseFloat(getComputedStyle(box).paddingLeft) - parseFloat(getComputedStyle(box).paddingRight);
    while (n++ < 30 && h1.scrollWidth > room + 1) { var fs = parseFloat(getComputedStyle(h1).fontSize) * 0.93; if (fs < 40) break; h1.style.fontSize = fs + 'px'; }
    if (h1.scrollWidth > room + 1) h1.style.whiteSpace = 'normal';   // a very long name wraps rather than push the page sideways
  }
  addEventListener('resize', fitName);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitName);
  fitName();

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

  // the PSU: the socket you plug a cable into writes the WhatsApp message on the little display
  var T = {
    he: { n: { desktop: 'תקלה במחשב נייח', fan: 'מאוורר רועש או מחשב שמתחמם', laptop: 'תקלה במחשב נייד', build: 'הרכבת מחשב חדש', upgrade: 'שדרוג כרטיס מסך או מעבד', files: 'העברת קבצים למחשב חדש' },
          hi: 'היי שגיא, הגעתי דרך האתר. אשמח לפתוח כרטיס: ', d: '. מה קורה: ', end: '. מתי אפשר להביא?' },
    en: { n: { desktop: 'a desktop fault', fan: 'a loud fan or a computer that overheats', laptop: 'a laptop fault', build: 'building a new PC', upgrade: 'upgrading a graphics card or processor', files: 'moving my files to a new PC' },
          hi: 'Hi Sagi, I found you through your website. I’d like to open a job card: ', d: '. What’s happening: ', end: '. When could I bring it in?' }
  };
  var form = document.getElementById('composer'), preview = document.querySelector('[data-preview]'), send = document.querySelector('[data-send]'), detail = document.querySelector('[name=detail]');
  function write() {
    var t = T[root.lang] || T.he, f = new FormData(form), det = (detail.value || '').trim().slice(0, 90);
    var m = t.hi + t.n[f.get('need') || 'desktop'] + (det ? t.d + det : '') + t.end;
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
  detail.addEventListener('input', write);

  // entrances, once, staggered inside each section
  document.querySelectorAll('section, header').forEach(function (s) { s.querySelectorAll('[data-reveal]').forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 4) * 70 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  document.querySelectorAll('[data-reveal]').forEach(function (el) { io ? io.observe(el) : el.classList.add('in'); });
  var xio = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { xio.disconnect(); xfer(); } });
  }, { threshold: 0.35 }) : null;
  if (xio && document.querySelector('[data-xfer]')) xio.observe(document.querySelector('[data-xfer]')); else xfer();

  // the transfer. The old disk spins up and its arm hunts across the platter for scattered pieces; every read goes down
  // the cable as a packet, and the count, the bar and the chips on the new drive only move when a packet lands.
  // The rest of the data sits in long runs and streams; then the arm parks on its ramp and the platter spins down.
  var xf = document.querySelector('[data-xfer]'), X = null, xferSeen = false;
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
    if (now !== true) xferSeen = true;
    if (xferDone || xferRaf) return;
    if (now === true || still() || !X) { if (now === true && !xferSeen) return; return xferEnd(); }
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

  // the front panel shows once the hero's buttons have gone, and steps aside where the page already offers the same buttons
  var bay = document.querySelector('[data-bay]'), away = new Set();
  function bayUI() { bay.classList.toggle('show', away.size === 0); }
  if ('IntersectionObserver' in window) {
    var bio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? away.add(e.target) : away.delete(e.target); }); bayUI(); }, { threshold: 0 });
    ['[data-hero-act]', '.oled', '[data-visit-act]', '.foot'].forEach(function (s) { var el = document.querySelector(s); if (el) bio.observe(el); });
    // on wide screens the bay would sit on the graph while the job is pinned, so it steps aside there; the card keeps its own
    var wide = matchMedia('(min-width: 900px)'), stageEl = document.querySelector('[data-stage]');
    var sio = new IntersectionObserver(function (es) { es.forEach(function (e) { var r = e.boundingClientRect; (wide.matches && e.isIntersecting && e.intersectionRatio > 0.6) ? away.add(stageEl) : away.delete(stageEl); }); bayUI(); }, { threshold: [0, 0.6, 1] });
    sio.observe(stageEl);
  } else bay.classList.add('show');

  // the reviews strip: a second copy makes the loop seamless; it pauses on hover/focus (CSS), with its button, and off screen
  var strip = document.querySelector('[data-strip]'), pauseBtn = document.querySelector('[data-strip-pause]');
  if (strip) {
    var qs0 = strip.querySelector('.quotes'), cl = qs0.cloneNode(true);
    cl.setAttribute('aria-hidden', 'true'); cl.setAttribute('data-clone', ''); cl.inert = true;
    strip.querySelector('[data-run]').appendChild(cl);
    pauseBtn.addEventListener('click', function () { strip.classList.toggle('paused'); stripUI(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { strip.classList.toggle('off', !e.isIntersecting); }); }).observe(strip);
  }
  function stripUI() {
    if (!pauseBtn) return;
    var p = strip.classList.contains('paused'), l = he();
    pauseBtn.setAttribute('aria-pressed', p ? 'true' : 'false');
    pauseBtn.innerHTML = '<span class="pz" aria-hidden="true"></span>' + (p ? (l ? 'המשך' : 'Play') : (l ? 'עצירה' : 'Pause'));
  }

  // the RAM sticks: the one for the section on screen lights up
  var sticks = [].slice.call(document.querySelectorAll('.stick'));
  if ('IntersectionObserver' in window) {
    var secIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (!e.isIntersecting) return; sticks.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main > section[id], #top').forEach(function (s) { secIO.observe(s); });
  }

  // the RGB strips on the edges: their colour runs with the scroll. Scroll-driven CSS does it where it can; here otherwise
  var flows = [].slice.call(document.querySelectorAll('[data-flow]')), sda = window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()');
  var dimms = document.querySelector('[data-dimms]'), navAway = false;
  function chrome() {
    if (!sda) {
      var max = Math.max(1, document.documentElement.scrollHeight - innerHeight), k = still() ? 0 : Math.min(1, scrollY / max);
      var tf = k ? 'translate3d(0,' + (-k * 3.6 * innerHeight).toFixed(1) + 'px,0)' : '';
      flows.forEach(function (f) { f.style.transform = tf; });
    }
    // the menu slides away while the repair story holds the screen
    var tr = document.querySelector('[data-track]').getBoundingClientRect();
    var away = !still() && tr.top < dimms.offsetHeight && tr.bottom > innerHeight * 0.6;
    if (away !== navAway) { navAway = away; dimms.classList.toggle('away', away); }
  }
  var cTick = false;
  addEventListener('scroll', function () { if (!cTick) { cTick = true; requestAnimationFrame(function () { cTick = false; chrome(); }); } }, { passive: true });
  addEventListener('resize', chrome);
  window.__chrome = chrome;

  // ---------------------------------------------------------------- the job card, the graph and the bench camera
  var track = document.querySelector('[data-track]'), stage = track.querySelector('[data-stage]');
  var stillImg = stage.querySelector('[data-still]'), noteT = stage.querySelector('[data-note-title]'), noteX = stage.querySelector('[data-note]');
  var sts = [].slice.call(stage.querySelectorAll('.st')), stepBtns = [].slice.call(stage.querySelectorAll('[data-step]'));
  var STAGES = JOB.STAGES, NS = 6;
  // where each status shows its still (animations off); the same p the stills were rendered at
  var STILL_P = [0.05, 0.24, 0.43, 0.555, 0.85, 0.985];
  var S = {
    he: [['התקבל', 'המחשב מגיע: תחת עומס הוא מתחמם, מרעיש ומאט.'],
         ['אובחן והוסבר', '97° במבחן עומס: אבק בצלעות הקירור ומאוורר אחורי שחוק. שגיא מסביר לפני שמזמינים.'],
         ['הוזמן חלק', 'מוזמן מאוורר 120 מ״מ חדש. המחשב מחכה כבוי על השולחן.'],
         ['הותקן', 'האבק מועף מהצלעות, המאוורר מוחלף, ומשחה טרמית חדשה נמרחת.'],
         ['נבדק בעומס', 'אותו מבחן עומס: 68°, והמעבד נשאר בתדר המלא.'],
         ['מוכן, שגיא מתקשר', 'המכסה נסגר, ושגיא מתקשר להגיד שאפשר לבוא לקחת.']],
    en: [['Received', 'It arrives: under load it runs hot, loud and slow.'],
         ['Diagnosed, explained', '97 °C under a stress test: dust in the cooler fins and a worn rear fan. Sagi explains before ordering.'],
         ['Part ordered', 'A new 120 mm fan is ordered. The computer waits on the bench, switched off.'],
         ['Fitted', 'The dust is blown out of the fins, the fan is replaced and fresh thermal paste goes on.'],
         ['Stress-tested', 'The same stress test: 68 °C, and the CPU holds its full clock.'],
         ['Ready, Sagi calls', 'The panel goes back on, and Sagi calls to say you can collect it.']]
  };
  // the work log under the note: each line is ticked when the bench gets there
  var LOG = [
    [[0.0, 'נרשם: מחשב נייח, מתחמם תחת עומס', 'Logged: desktop, runs hot under load'], [0.06, 'מקום על השולחן', 'A place on the bench']],
    [[0.105, 'הודלק, מבחן עומס התחיל', 'Powered on, stress test started'], [0.138, 'המכסה הצדדי הוסר', 'Side panel off'], [0.2, 'אבק על צלעות הקירור', 'Dust on the cooler fins'], [0.3, 'מאוורר אחורי: מסב שחוק', 'Rear fan: worn bearing'], [0.345, 'הוסבר ללקוח', 'Explained to the customer']],
    [[0.37, 'כובה', 'Switched off'], [0.39, 'הוזמן מאוורר 120 מ״מ', '120 mm fan ordered'], [0.43, 'החלק הגיע', 'The part arrived']],
    [[0.505, 'מאוורר אחורי ישן הוצא', 'Old rear fan out'], [0.53, 'מאוורר הקירור שוחרר', 'Cooler fan unclipped'], [0.575, 'האבק הועף מהצלעות', 'Dust blown out of the fins'], [0.618, 'מאוורר אחורי חדש הותקן', 'New rear fan fitted'], [0.668, 'המשחה הישנה נוקתה', 'Old paste cleaned off'], [0.71, 'משחה חדשה, הקירור הוחזר', 'Fresh paste, cooler back on'], [0.728, 'מאוורר הקירור הוחזר', 'Cooler fan clipped back']],
    [[0.765, 'הודלק', 'Powered on'], [0.89, 'מבחן עומס: 68°, ‎4.6 GHz', 'Stress test: 68°, 4.6 GHz']],
    [[0.955, 'המכסה הוחזר', 'Side panel back on'], [0.97, 'שגיא מתקשר ללקוח', 'Sagi calls the customer']]
  ];
  var logEl = stage.querySelector('[data-log]'), logKey = '';
  function drawLog(sg, ps, l) {
    var key = sg + l; if (key !== logKey) { logKey = key; logEl.innerHTML = LOG[sg].map(function (e) { return '<li>' + (l === 'he' ? e[1] : e[2]) + '</li>'; }).join(''); }
    [].forEach.call(logEl.children, function (li, i) { li.classList.toggle('on', still() || ps >= LOG[sg][i][0]); });
  }
  var GSTATE = { he: { idle: 'במנוחה', off: 'כבוי', A: 'לפני התיקון', B: 'אחרי התיקון', wait: 'ממתין לבדיקה' }, en: { idle: 'Idle', off: 'Off', A: 'Before the fix', B: 'After the fix', wait: 'Waiting for the test' } };

  // the two runs, drawn once as paths in the graph's 600 × 176 box (temperature lane 0–112, clock lane 124–176)
  var gsvg = stage.querySelector('[data-g-svg]'), gState = stage.querySelector('[data-g-state]');
  var yT = function (t) { return 112 - (t - 30) / 75 * 112; }, yC = function (g) { return 174 - (g - 2) / 3 * 48; };
  function pathOf(f, y) { var d = '', i, N = 160; for (i = 0; i <= N; i++) { var u = i / N; d += (i ? 'L' : 'M') + (u * 600).toFixed(1) + ' ' + y(f(u)).toFixed(1); } return d; }
  var runs = { a: stage.querySelector('[data-run-a]'), b: stage.querySelector('[data-run-b]'), ca: stage.querySelector('[data-clk-a]'), cb: stage.querySelector('[data-clk-b]') };
  runs.a.setAttribute('d', pathOf(JOB.tempA, yT)); runs.b.setAttribute('d', pathOf(JOB.tempB, yT));
  runs.ca.setAttribute('d', pathOf(JOB.clkA, yC)); runs.cb.setAttribute('d', pathOf(JOB.clkB, yC));
  // paths are drawn up to "now" with a dash the length of the path
  var LEN = {}; Object.keys(runs).forEach(function (k) { LEN[k] = runs[k].getTotalLength ? runs[k].getTotalLength() : 1000; runs[k].style.strokeDasharray = LEN[k] + ' ' + LEN[k]; });
  function drawRun(k, u) { runs[k].style.strokeDashoffset = (LEN[k] * (1 - u)).toFixed(1); runs[k].style.visibility = u > 0.001 ? 'visible' : 'hidden'; }
  var rT = stage.querySelector('[data-r-temp]'), rG = stage.querySelector('[data-r-ghz]'), rR = stage.querySelector('[data-r-rpm]');

  var STILL_W = 1200, STILL_H = 900;
  // label anchors (fraction of the still) recorded when the stills were rendered from tower3d.js (stills.py)
  var STILL_L = {};
  var slab = stage.querySelector('[data-slabels]'), labelKey = '';
  function placeLabels(si) {
    var sw = stillImg.clientWidth, sh = stillImg.clientHeight;
    var k = Math.max(sw / STILL_W, sh / STILL_H), ox = (sw - STILL_W * k) / 2, oy = (sh - STILL_H * k) / 2;
    var key = si + '|' + sw + 'x' + sh + root.lang; if (key === labelKey) return; labelKey = key;
    slab.innerHTML = '';
    (STILL_L[si + 1] || []).forEach(function (l) {
      var x = ox + STILL_W * k * l[1], y = oy + STILL_H * k * l[2];
      if (x < 8 || x > sw - 40 || y < 16 || y > sh - 30) return;
      var e = document.createElement('span'); e.className = 'l3d l3d-' + l[0]; e.innerHTML = l[3];
      slab.appendChild(e);
      x = Math.max(8, Math.min(x, sw - e.offsetWidth - 8));   // the whole label stays inside the camera tile
      e.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px)';
    });
  }
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var step = 0, shown = -1, lastG = '';
  function progress() { var r = track.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight)); }
  function render() {
    var l = he() ? 'he' : 'en', live = !!window.__tower3d && !still();
    var ps = still() ? STILL_P[step] : progress();
    var sg = 0; while (sg < NS - 1 && ps >= STAGES[sg + 1]) sg++;
    if (still()) sg = step;
    if (!live) {
      var src = 'img/still-' + (sg + 1) + '.jpg';
      if (stillImg.getAttribute('src') !== src) stillImg.src = src;
      stillImg.alt = S[l][sg][0] + ': ' + S[l][sg][1];
      placeLabels(sg);
    }
    if (sg !== shown || noteT.dataset.l !== l) {
      var moved = shown >= 0 && sg !== shown, fwd = sg > shown;
      shown = sg; noteT.dataset.l = l;
      noteT.textContent = S[l][sg][0]; noteX.textContent = S[l][sg][1];
      sts.forEach(function (b, i) {
        var wasDone = b.classList.contains('done');
        b.classList.toggle('done', i <= sg);
        if (i === sg) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
        b.setAttribute('aria-label', S[l][i][0]);
        // a status that has just been reached is stamped: the box lands from slightly above, quickly
        if (i <= sg && !wasDone && moved && fwd && !still() && b.animate) b.querySelector('.st-box').animate([{ transform: 'scale(1.35)', opacity: 0.4 }, { transform: 'none', opacity: 1 }], { duration: 160, easing: EASE });
      });
      if (moved && !still() && noteX.animate) [noteT, noteX].forEach(function (el) { el.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: EASE }); });
      stepBtns.forEach(function (b) { b.disabled = +b.dataset.step < 0 ? sg === 0 : sg === NS - 1; });
    }
    drawLog(sg, ps, l);
    // the graph and the readouts: what the bench measures at this point of the job
    var rd = JOB.read(ps), uA = clamp((ps - JOB.A[0]) / (JOB.A[1] - JOB.A[0])), uB = clamp((ps - JOB.B[0]) / (JOB.B[1] - JOB.B[0]));
    var gk = [l, uA.toFixed(3), uB.toFixed(3), rd.on, rd.temp ? Math.round(rd.temp) : '', rd.ghz ? rd.ghz.toFixed(1) : '', Math.round(rd.rpmRear / 10)].join('|');
    if (gk !== lastG) {
      lastG = gk;
      drawRun('a', ps < JOB.A[0] ? 0 : uA); drawRun('ca', ps < JOB.A[0] ? 0 : uA); drawRun('b', uB); drawRun('cb', uB);
      gsvg.classList.toggle('both', uB > 0);
      var key = !rd.on ? (ps < JOB.A[0] ? 'wait' : 'off') : rd.run || 'idle';
      gState.textContent = GSTATE[l][key];
      gState.className = 'g-state' + (rd.run === 'A' ? ' hot' : rd.run === 'B' ? ' cool' : '');
      rT.textContent = rd.on && rd.temp ? Math.round(rd.temp) : '–';
      rT.className = rd.on && rd.temp ? (rd.temp >= 90 ? 'hot' : rd.temp < 75 && ps > 0.5 ? 'cool' : '') : '';
      rG.textContent = rd.ghz ? rd.ghz.toFixed(1) : '–';
      rR.textContent = rd.on ? Math.round(rd.rpmRear / 10) * 10 : '–';
    }
    if (live) window.__tower3d.set(ps);
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; render(); }); } }, { passive: true });
  addEventListener('resize', function () { labelKey = ''; render(); });
  stillImg.addEventListener('load', function () { labelKey = ''; render(); });
  function go(i) { step = Math.max(0, Math.min(NS - 1, i)); render(); }
  stepBtns.forEach(function (b) { b.addEventListener('click', function () { go(shown + +b.dataset.step); }); });
  sts.forEach(function (b, i) { b.addEventListener('click', function () {
    if (still()) return go(i);
    var r = track.getBoundingClientRect();
    scrollTo({ top: scrollY + r.top + parseFloat(b.dataset.go) * (r.height - innerHeight), behavior: 'smooth' });
  }); });
  // switching modes keeps the visitor on the same status, and on the story if they were in it
  function storyBefore() { var r = stage.getBoundingClientRect(); return { sg: shown < 0 ? 0 : shown, pinned: !still() && r.top <= 1 && r.bottom >= innerHeight - 1, seen: r.top < innerHeight && r.bottom > 0 }; }
  function storyAfter(k) {
    if (still()) { step = k.sg; if (k.pinned) scrollTo(0, scrollY + stage.getBoundingClientRect().top - document.querySelector('[data-dimms]').offsetHeight); return; }
    if (!k.seen) return;
    var r = track.getBoundingClientRect();
    scrollTo(0, scrollY + r.top + parseFloat(sts[k.sg].dataset.go) * (r.height - innerHeight));
  }
  window.__trackRender = function () { shown = -1; labelKey = ''; lastG = ''; logKey = ''; render(); };
  window.__jobStill = function (i) { go(i); };
  fetch('img/still-labels.json').then(function (r) { return r.json(); }).then(function (j) { STILL_L = j; labelKey = ''; render(); }).catch(function () {});

  var qs = new URLSearchParams(location.search).get('lang'), saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  hours();
  setLang(qs === 'en' || qs === 'he' ? qs : (saved === 'en' ? 'en' : 'he'));
  render(); chrome();
  setInterval(status, 60000);
})();
