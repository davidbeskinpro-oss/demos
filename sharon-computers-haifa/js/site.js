(function () {
  var root = document.documentElement, WA = '972546222637', MAIL = 'sharon@scts.co.il';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var eio = function (t) { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: 'שרון מחשבים · מעבדת מחשבים ולפטופים · זאב בנין 7, חיפה', en: 'Sharon Computers · computer and laptop lab · 7 Ze’ev Binyamin St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור SCompuTech שרון מחשבים · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for SCompuTech Sharon Computers · This is not the business’s official website' };
  var STAR = '<svg viewBox="0 0 92 16" aria-hidden="true">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; }).join('') + '</svg>';
  $$('[data-stars]').forEach(function (s) { s.innerHTML = STAR; s.setAttribute('role', 'img'); });

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-stars]').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
    $$('.score [data-stars]').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? 'דירוג 4.7 מתוך 5' : 'Rated 4.7 out of 5'); });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-mainnav]', 'ראשי', 'Main');
    aria('.brand', 'שרון מחשבים, לראש הדף', 'Sharon Computers, back to top');
    aria('[data-t-call]', 'התקשרו לשרון, 054-622-2637', 'Call Sharon, 054-622-2637');
    aria('[data-t-pcall]', 'התקשרו לשרון, 054-622-2637', 'Call Sharon, 054-622-2637');
    aria('[data-t-wa]', 'וואטסאפ לשרון', 'WhatsApp Sharon');
    aria('[data-power]', 'שרון מחשבים', 'Sharon Computers');
    aria('[data-story]', 'איך מתקנים', 'How a repair goes');
    aria('[data-pins], [data-spins]', 'שלבים', 'Stages');
    var m = $('[data-map]'); if (m) m.title = l === 'he' ? 'מפה: זאב בנין 7, חיפה' : 'Map: 7 Ze’ev Binyamin St, Haifa';
    var nm = $('[name=nm]'); nm.placeholder = nm.dataset[l === 'he' ? 'phHe' : 'phEn'];
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('sc-lang', l); } catch (e) {}
    texts(l); hours(); write(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(), anchor = $('#bench'), keep = anchor.getBoundingClientRect().top;
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('sc-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    layout();
    // the first act changes height between the two modes: keep the visitor where they were if they were past it
    if (keep < innerHeight) { var now = anchor.getBoundingClientRect().top; if (now !== keep) scrollBy(0, now - keep); }
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed day
  var H = { 0: [9, 20], 1: [9, 20], 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [9, 13], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], shortEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false, short;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; short = l ? 'פתוח עכשיו' : 'Open now'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); short = l ? 'פתוח עד ' + hhmm(t[1]) : 'Open till ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); short = l ? 'נפתח ב-' + hhmm(t[0]) : 'Opens ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
      short = !H[nd] ? (l ? 'סגור' : 'Closed') : nd === (n.d + 1) % 7 ? (l ? 'נפתח מחר ' + hhmm(H[nd][0]) : 'Opens tomorrow ' + hhmm(H[nd][0])) : (l ? 'נפתח ביום ' + shortHe[nd] + ' ' + hhmm(H[nd][0]) : 'Opens ' + shortEn[nd] + ' ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    var ps = $('[data-panel-status]'); if (ps) { ps.classList.toggle('open', open); ps.innerHTML = '<span class="dot"></span>' + short; }
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

  // ---------------------------------------------------------------- the repair tag: device + what happens -> WhatsApp or email
  var DEV = { he: ['מחשב נייד', 'מחשב נייח', 'מחשב AIO', 'טאבלט'], en: ['laptop', 'desktop', 'all-in-one', 'tablet'] };
  var ISS = { he: ['שלא נדלק', 'שעובד לאט', 'עם בעיה במסך', 'שנראה שיש בו וירוס', 'שצריך שדרוג', 'עם תקלה אחרת'],
              en: ['that won’t turn on', 'that runs slowly', 'with a screen problem', 'that seems to have a virus', 'that needs an upgrade', 'with a different fault'] };
  var form = $('[data-ticket]'), nm = $('[name=nm]'), msgEl = $('[data-msg]');
  function message() {
    var l = he() ? 'he' : 'en', d = +form.dev.value, s = +form.iss.value, n = nm.value.trim().replace(/\s+/g, ' ').slice(0, 40);
    if (l === 'he') return 'היי שרון, ' + (n ? 'כאן ' + n + '. ' : '') + 'יש לי ' + DEV.he[d] + ' ' + ISS.he[s] + '. אפשר לתאם בדיקה?';
    var dev = DEV.en[d]; return 'Hi Sharon, ' + (n ? 'this is ' + n + '. ' : '') + 'I have ' + (/^[aeiou]/.test(dev) ? 'an ' : 'a ') + dev + ' ' + ISS.en[s] + '. Could we set up a check?';
  }
  function write(flash) {
    var m = message();
    msgEl.textContent = m;
    $('[data-send-wa]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    var subj = he() ? 'פנייה מהאתר' : 'Message from the website';
    $('[data-send-mail]').href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(m);
    if (flash && !still() && msgEl.animate) msgEl.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' });
  }
  form.addEventListener('change', function () { write(true); });
  nm.addEventListener('input', function () { write(false); });

  // ---------------------------------------------------------------- reveals
  $$('section, header').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 4) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { io && !still() ? io.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- nav: slides up past the concept bar; marks the current section
  var nav = $('[data-nav]'), links = $$('.links a');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['bench', 'parts', 'reviews', 'visit'].forEach(function (id) { var el = document.getElementById(id); if (el) nio.observe(el); });
  }

  // ---------------------------------------------------------------- phone panel steps aside where the page already shows a call button
  var panel = $('[data-panel]'), seen = new Set(), heroOn = true;
  function panelState() { panel.classList.toggle('away', seen.size > 0 || heroOn); }
  if ('IntersectionObserver' in window) {
    var kio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? seen.add(e.target) : seen.delete(e.target); }); panelState(); }, { threshold: 0 });
    $$('[data-keep-clear]').forEach(function (el) { kio.observe(el); });
  }

  // ---------------------------------------------------------------- the parts tray: each card's small picture comes alive once as it arrives
  var tray = $('[data-trayrun]');
  $$('[data-tray]').forEach(function (b) { b.addEventListener('click', function () {
    var card = tray.querySelector('.part'), step = card ? card.getBoundingClientRect().width + 16 : 300, dir = +b.dataset.tray * (he() ? -1 : 1);
    tray.scrollBy({ left: dir * step, behavior: still() ? 'auto' : 'smooth' });
  }); });
  var A = {
    laptop: function (c) {
      return [$('[data-glow]', c).animate([{ opacity: 0 }, { opacity: 0.16, offset: 0.25 }, { opacity: 0.1 }], { duration: 2200, easing: 'ease-out', fill: 'forwards' }),
        $('[data-logo]', c).animate([{ opacity: 0.25 }, { opacity: 1, offset: 0.3 }, { opacity: 0.85 }], { duration: 2200, fill: 'forwards' }),
        $('[data-bar]', c).animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(0.35)', offset: 0.4 }, { transform: 'scaleX(1)' }], { duration: 2400, delay: 400, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' })];
    },
    case: function (c) { return [$('img', c).animate([{ transform: 'scale(1.14)' }, { transform: 'scale(1)' }], { duration: 2600, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' })]; },
    ram: function (c) { return [$('[data-shine]', c).animate([{ transform: 'translateX(-160%) skewX(-12deg)' }, { transform: 'translateX(320%) skewX(-12deg)' }], { duration: 1500, easing: 'cubic-bezier(.65,0,.35,1)' })]; },
    fault: function (c) { return [$('img', c).animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }], { duration: 2800, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' })]; },
    remote: function (c) {
      var cur = $('[data-cursor]', c), click = $('[data-click]', c), win = $('[data-win]', c);
      return [cur.animate([{ transform: 'translate(196px,120px)' }, { transform: 'translate(168px,76px)', offset: 0.35 }, { transform: 'translate(168px,76px)', offset: 0.45 }, { transform: 'translate(122px,52px)' }], { duration: 2400, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }),
        win.animate([{ transform: 'translate(0,0)', offset: 0 }, { transform: 'translate(0,0)', offset: 0.45 }, { transform: 'translate(-46px,-24px)' }], { duration: 2400, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }),
        click.animate([{ opacity: 0, transform: 'scale(.3)' }, { opacity: 0, transform: 'scale(.3)', offset: 0.36 }, { opacity: 1, transform: 'scale(.6)', offset: 0.4 }, { opacity: 0, transform: 'scale(1.6)', offset: 0.6 }, { opacity: 0, transform: 'scale(1.6)' }], { duration: 2400 })];
    },
    net: function (c) {
      return $$('[data-leds] circle', c).map(function (d, i) {
        var t = 380 + ((i * 137) % 5) * 120;
        return d.animate([{ opacity: 0.3 }, { opacity: 1 }, { opacity: 0.3 }], { duration: t, iterations: Math.floor(4200 / t), delay: (i * 97) % 400 });
      });
    }
  };
  var playing = new Map();
  function play(card) {
    if (still() || !card.animate) return;
    var k = card.dataset.part; (playing.get(card) || []).forEach(function (a) { a.cancel(); });
    playing.set(card, A[k] ? A[k](card) : []);
  }
  if ('IntersectionObserver' in window) {
    var pio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !e.target.dataset.seen) { e.target.dataset.seen = 1; play(e.target); } }); }, { threshold: 0.6 });
    $$('.part').forEach(function (c) { pio.observe(c); });
  }
  $$('.part').forEach(function (c) { c.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') play(c); }); c.addEventListener('click', function () { play(c); }); });

  // ---------------------------------------------------------------- the review tags swing a little when the page moves
  var tags = $$('[data-swing]'), sw = tags.map(function (t, i) { return { el: t, a: 0, v: 0, base: [-1.6, 1.2, -0.6][i % 3] }; }), swingOn = false, lastY = scrollY;
  function swing() {
    var busy = false;
    sw.forEach(function (s) { s.v += -s.a * 0.06; s.v *= 0.9; s.a += s.v; if (Math.abs(s.a) > 0.02 || Math.abs(s.v) > 0.02) busy = true; s.el.style.setProperty('--rot', (s.base + s.a).toFixed(2) + 'deg'); });
    if (busy) requestAnimationFrame(swing); else swingOn = false;
  }
  sw.forEach(function (s) { s.el.style.setProperty('--rot', s.base + 'deg'); });

  // ---------------------------------------------------------------- SIGNATURE: the board powers on
  // stops on the photograph (fractions of its width/height): chipset, memory slots, processor; plus the CMOS battery and the buzzer
  var IW = 1920, IH = 1272;
  var BAT = [0.094, 0.205], BUZ = [0.047, 0.833];
  var S = [[0.5, 0.48], [0.245, 0.455], [0.66, 0.73], [0.695, 0.33], [0.5, 0.5]];
  // keyframes: progress, zoom, darkness, sharp radius (fraction of width), wash of light over the whole board
  var K = [
    { p: 0, z: 1.0, dk: 0.6, fr: 0.8, w: 0 },
    { p: 0.22, z: 1.75, dk: 0.34, fr: 0.17, w: 0 },
    { p: 0.44, z: 1.5, dk: 0.32, fr: 0.2, w: 0 },
    { p: 0.66, z: 1.85, dk: 0.3, fr: 0.15, w: 0 },
    { p: 0.86, z: 1.0, dk: 0.08, fr: 1.4, w: 0.3 },
    { p: 1, z: 1.0, dk: 0.08, fr: 1.4, w: 0.3 }
  ];
  var power = $('[data-power]'), stage = $('[data-stage]'), cam = $('[data-cam]'), spots = $('[data-spots]'), dark = $('[data-dark]'), fadeOut = $('[data-fadeout]');
  var hero = $('[data-hero]'), caps = $$('[data-cap]'), pins = $$('[data-pin]'), pinBox = $('[data-pins]'), cue = $('[data-cue]'), beeps = $$('[data-beep] i');
  var paths = ['#tr1', '#tr2', '#tr3'].map(function (id) { return $(id); }), LEN = paths.map(function (pa) { return pa.getTotalLength(); });
  var fills = [$$('[data-fill]').filter(function (u, k) { return k % 3 === 0; }), $$('[data-fill]').filter(function (u, k) { return k % 3 === 1; }), $$('[data-fill]').filter(function (u, k) { return k % 3 === 2; })];
  var heads = [$$('[data-head]').filter(function (u, k) { return k % 3 === 0; }), $$('[data-head]').filter(function (u, k) { return k % 3 === 1; }), $$('[data-head]').filter(function (u, k) { return k % 3 === 2; })];
  var HEADLEN = 150;
  function pt(i, s) { var q = paths[i].getPointAtLength(clamp(s, 0, 1) * LEN[i]); return [q.x / IW, q.y / IH]; }
  // one trace: filled up to f (0..1), the bright head at h (0..1, or null), head brightness a
  function trace(i, f, h, a) {
    fills[i].forEach(function (u) { u.style.strokeDasharray = LEN[i] + ' ' + LEN[i]; u.style.strokeDashoffset = (LEN[i] * (1 - f)).toFixed(1); });
    heads[i].forEach(function (u) {
      if (h === null || a <= 0.01) { u.style.opacity = 0; return; }
      var at = h * LEN[i]; u.style.opacity = a.toFixed(3);
      u.style.strokeDasharray = HEADLEN + ' ' + (LEN[i] + HEADLEN * 2);
      u.style.strokeDashoffset = (HEADLEN - at).toFixed(1);
    });
  }
  var vw = 0, vh = 0, Wc = 0, Hc = 0, top0 = 0, span = 1, mobile = false, lastStage = -1;
  var MINT = '127,220,176';
  function glow(x, y, a, r) { return 'radial-gradient(circle at ' + (x * 100).toFixed(2) + '% ' + (y * 100).toFixed(2) + '%, rgba(' + MINT + ',' + a.toFixed(3) + ') 0, rgba(' + MINT + ',' + (a * 0.5).toFixed(3) + ') ' + (r * 0.35).toFixed(0) + 'px, rgba(' + MINT + ',0) ' + r.toFixed(0) + 'px)'; } // taste-skill-ignore: the light on the board
  function frame(p) {
    var i = 0; while (i < K.length - 2 && p > K[i + 1].p) i++;
    var a = K[i], b = K[i + 1], gap = b.p - a.p, hold = Math.min(0.035, gap * 0.2);
    var u = eio((p - a.p - hold) / (gap - 2 * hold));
    var fx = lerp(S[i][0], S[Math.min(i + 1, 4)][0], u), fy = lerp(S[i][1], S[Math.min(i + 1, 4)][1], u), z = lerp(a.z, b.z, u);
    // between two close-ups the lens follows the light along its trace and backs off a little, so the move reads as travel
    if (i >= 1 && i <= 2) {
      var q = pt(i, u), m = Math.sin(Math.PI * u) * 0.65;
      fx = lerp(fx, q[0], m); fy = lerp(fy, q[1], m); z *= 1 - 0.18 * Math.sin(Math.PI * u);
    }
    if (mobile) z = 1 + (z - 1) * 0.7;
    return { i: i, u: u, fx: fx, fy: fy, z: z, dk: lerp(a.dk, b.dk, u), fr: lerp(a.fr, b.fr, u), w: lerp(a.w, b.w, u) };
  }
  function layout() {
    root.style.setProperty('--ct', $('[data-concept]').offsetHeight + 'px');
    vw = stage.clientWidth; vh = stage.clientHeight; mobile = vw < 760;
    var s0 = Math.max(vw / 1920, vh / 1272) * 1.02; Wc = 1920 * s0; Hc = 1272 * s0;
    cam.style.width = Wc + 'px'; cam.style.height = Hc + 'px';
    var r = power.getBoundingClientRect(); top0 = r.top + scrollY; span = Math.max(1, power.offsetHeight - vh);
    tick(true);
  }
  function paint(p) {
    var f = frame(p);
    var tx = mobile || root.classList.contains('shoot') ? vw * 0.5 : (he() ? vw * 0.33 : vw * 0.67), ty = mobile ? vh * 0.34 : vh * 0.5;
    var X = clamp(tx - f.fx * Wc * f.z, vw - Wc * f.z, 0), Y = clamp(ty - f.fy * Hc * f.z, vh - Hc * f.z, 0);
    cam.style.transform = 'translate3d(' + X.toFixed(1) + 'px,' + Y.toFixed(1) + 'px,0) scale(' + f.z.toFixed(4) + ')';
    cam.style.setProperty('--fx', (f.fx * 100).toFixed(2) + '%'); cam.style.setProperty('--fy', (f.fy * 100).toFixed(2) + '%'); cam.style.setProperty('--fr', (f.fr * Wc).toFixed(0) + 'px');
    dark.style.opacity = f.dk.toFixed(3);
    // light: trace i fills while the lens travels it; the stop it reaches keeps a soft glow on its own pads
    var g = [], rr = 0.12 * Wc;
    for (var t = 0; t < 3; t++) {
      var fill = f.i > t ? 1 : f.i === t ? f.u : 0, head = f.i === t && f.u > 0 && f.u < 1 ? f.u : null, ha = head === null ? 0 : Math.min(1, Math.sin(Math.PI * f.u) * 1.6);
      if (f.i === 4 || (f.i === 3 && f.u > 0.5)) { var r2 = f.i === 4 ? 1 : (f.u - 0.5) * 2; head = (r2 * 1.15 + t * 0.12) % 1.15; ha = head > 1 ? 0 : Math.sin(Math.PI * Math.min(1, r2 * 1.4)) * 0.9; if (head > 1) head = null; }
      trace(t, fill, head, ha);
      if (head !== null) { var hp = pt(t, head); g.push(glow(hp[0], hp[1], ha, 0.06 * Wc)); }
    }
    g.push(glow(BAT[0], BAT[1], f.i === 0 ? lerp(0.75, 0.25, f.u) : 0.25, rr));
    [[1, S[1]], [2, S[2]], [3, S[3]]].forEach(function (st) { var v = f.i >= st[0] ? (f.i === st[0] ? 1 - 0.55 * f.u : 0.45) : (f.i === st[0] - 1 ? clamp((f.u - 0.75) * 4, 0, 1) : 0); if (v > 0.01) g.push(glow(st[1][0], st[1][1], v, rr)); });
    if (f.w > 0.005) g.push('linear-gradient(rgba(' + MINT + ',' + f.w.toFixed(3) + '),rgba(' + MINT + ',' + f.w.toFixed(3) + '))'); // taste-skill-ignore: the light on the board
    spots.style.backgroundImage = g.join(',') || 'none';
    // the beep: two soft rings from the buzzer once the board is up
    var bp = clamp((p - 0.8) / 0.12, 0, 1);
    beeps.forEach(function (el, k) { var q = clamp(bp * 1.25 - k * 0.25, 0, 1); el.style.opacity = (q > 0 && q < 1 ? (1 - q) * 0.9 : 0).toFixed(3); el.style.transform = 'scale(' + (0.25 + q * 2.6).toFixed(3) + ')'; });
    // words
    var h = clamp(1 - (p - 0.015) / 0.06, 0, 1);
    hero.style.opacity = h.toFixed(3); hero.style.visibility = h < 0.01 ? 'hidden' : 'visible';
    hero.style.transform = mobile ? 'translateY(' + ((1 - h) * -24).toFixed(1) + 'px)' : 'translateY(calc(-46% - ' + ((1 - h) * 24).toFixed(1) + 'px))';
    var active = 0;
    caps.forEach(function (c, k) {
      var kp = K[k + 1].p, d = Math.abs(p - kp), v = clamp(1 - (d - 0.045) / 0.05, 0, 1);
      if (k === 3) v = p > kp ? clamp(1 - (p - 0.95) / 0.05, 0, 1) * clamp(1 - (kp - p - 0.045) / 0.05, 0, 1) : v;
      c.style.opacity = v.toFixed(3); c.style.visibility = v < 0.01 ? 'hidden' : 'visible';
      var off = (p < kp ? 1 : -1) * (1 - v) * 26;
      c.style.transform = mobile ? 'translateY(' + off.toFixed(1) + 'px)' : 'translateY(calc(-46% + ' + off.toFixed(1) + 'px))';
      if (v > 0.5) active = k + 1;
    });
    if (active !== lastStage) { lastStage = active; pins.forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.pin === active ? 'true' : 'false'); }); }
    pinBox.classList.toggle('on', p > 0.08 && p < 0.97);
    if (cue) cue.style.opacity = h.toFixed(3);
    fadeOut.style.opacity = clamp((p - 0.93) / 0.07, 0, 1).toFixed(3);
  }
  function paintStill() {
    // motion off: the hero is the board at rest, lit
    var f = { fx: 0.5, fy: 0.5 };
    var X = clamp(vw * 0.5 - 0.5 * Wc, vw - Wc, 0), Y = clamp(vh * 0.5 - 0.5 * Hc, vh - Hc, 0);
    cam.style.transform = 'translate3d(' + X + 'px,' + Y + 'px,0)';
    cam.style.setProperty('--fx', '50%'); cam.style.setProperty('--fy', '50%'); cam.style.setProperty('--fr', (1.4 * Wc) + 'px');
    dark.style.opacity = '0.3';
    spots.style.backgroundImage = 'linear-gradient(rgba(' + MINT + ',.2),rgba(' + MINT + ',.2))'; // taste-skill-ignore: the light on the board
    for (var t = 0; t < 3; t++) trace(t, 1, null, 0);
    hero.style.opacity = 1; hero.style.visibility = 'visible'; hero.style.transform = '';
    caps.forEach(function (c) { c.style.opacity = 0; });
    beeps.forEach(function (el) { el.style.opacity = 0; });
    fadeOut.style.opacity = 0;
  }
  window.__paint = function (p) { paint(p); };

  // pin header: jump to that stop
  pins.forEach(function (b) { b.addEventListener('click', function () {
    var k = +b.dataset.pin; scrollTo({ top: top0 + K[k].p * span, behavior: 'smooth' });
  }); });

  // bench lamp: scroll-linked, both ways
  var bench = $('[data-bench]'), lamp = $('[data-lamp]');
  function lampPaint() {
    if (still()) { lamp.style.setProperty('--lr', '160%'); lamp.style.setProperty('--ls', '1'); lamp.style.setProperty('--lw', '0.5'); return; }
    var r = lamp.getBoundingClientRect(), q = clamp((vh * 0.92 - r.top) / (r.height * 0.75), 0, 1), e = eio(q);
    lamp.style.setProperty('--lr', (e * 140).toFixed(1) + '%');
    lamp.style.setProperty('--ls', (1.06 - 0.06 * e).toFixed(4));
    lamp.style.setProperty('--lw', (0.15 + 0.45 * e).toFixed(3));
  }

  var ticking = false, lastP = -1;
  function tick(force) {
    var y = scrollY;
    nav.classList.toggle('up', y > 30);
    if (still()) { paintStill(); heroOn = $('.hero-acts').getBoundingClientRect().bottom > 0; }
    else {
      var p = clamp((y - top0) / span, 0, 1);
      if (force || p !== lastP) { lastP = p; paint(p); }
      heroOn = p < 0.05;
    }
    panelState();
    lampPaint();
    var dy = y - lastY; lastY = y;
    if (dy && tags.length && !still()) {
      var r = tags[0].getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) { sw.forEach(function (s, k) { s.v += clamp(dy * (0.012 + k * 0.003), -0.5, 0.5); }); if (!swingOn) { swingOn = true; requestAnimationFrame(swing); } }
    }
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); } }, { passive: true });
  var rT, lastW = 0;
  addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(layout, 120); });

  // ---------------------------------------------------------------- motion off: the four moments as stills
  var stillIdx = 1, stillImg = $('[data-still]');
  function showStill(k) {
    stillIdx = clamp(k, 1, 4);
    stillImg.src = 'img/still-' + stillIdx + '.jpg';
    $$('[data-scap]').forEach(function (c) { c.hidden = +c.dataset.scap !== stillIdx; });
    $$('[data-spin]').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.spin === stillIdx ? 'true' : 'false'); });
    $('[data-still-step="-1"]').disabled = stillIdx === 1; $('[data-still-step="1"]').disabled = stillIdx === 4;
  }
  $$('[data-still-step]').forEach(function (b) { b.addEventListener('click', function () { showStill(stillIdx + +b.dataset.stillStep); }); });
  $$('[data-spin]').forEach(function (b) { b.addEventListener('click', function () { showStill(+b.dataset.spin); }); });
  showStill(1);

  texts(root.lang); hours(); write(); layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  addEventListener('load', layout);
})();
