(function () {
  var root = document.documentElement, WA = '972542725050';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  var eio = function (t) { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var eout = function (t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: 'טוהר החשמל · רועי יונה, חשמלאי מוסמך · ארתור הנטקה 12, חיפה', en: 'Tohar Electric · Roi Yona, licensed electrician · 12 Arthur Hantke St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור טוהר החשמל · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Tohar Electric · This is not the business’s official website' };
  var STAR = '<svg viewBox="0 0 92 16" aria-hidden="true">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; }).join('') + '</svg>';
  $$('[data-stars]').forEach(function (s) { s.innerHTML = STAR; s.setAttribute('role', 'img'); });

  // ------------------------------------------------------------ language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-stars]').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
    $('[data-pill]').setAttribute('aria-label', l === 'he' ? 'ראשי' : 'Main');
    $('.thumbs').setAttribute('aria-label', l === 'he' ? 'שלבים' : 'Steps');
    $('[data-meter]').setAttribute('aria-label', l === 'he' ? 'דירוג 4.7 מתוך 5 בגוגל' : 'Rated 4.7 out of 5 on Google');
    $('.map iframe').title = l === 'he' ? 'מפה: ארתור הנטקה 12, חיפה' : 'Map: 12 Arthur Hantke St, Haifa';
    var nm = $('[name=nm]'); nm.placeholder = nm.dataset[l === 'he' ? 'phHe' : 'phEn'];
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('th-lang', l); } catch (e) {}
    texts(l); hours(); write(true); measure(); frame();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ------------------------------------------------------------ motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(), keep = $('#order').getBoundingClientRect().top;
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('th-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    if (!on) { lampsDone(); setStage(stage); } else { resetLayers(); }
    measure(); frame();
    if (keep < innerHeight) { var now = $('#order').getBoundingClientRect().top; if (now !== keep) scrollBy(0, now - keep); }
  }); });
  motionUI();

  // ------------------------------------------------------------ hours, Haifa time. null = closed; [0,24] = around the clock
  var H = { 0: [7, 20], 1: [7, 20], 2: [7, 20], 3: [7, 20], 4: [7, 19], 5: [7, 12.5], 6: null };
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
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
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
  window.__H = H; window.__hours = hours;
  setInterval(status, 60000);

  // ------------------------------------------------------------ THE LAMPS (hero). Their own photo, lit one shade at a time.
  // Two copies of the same photograph: the room at dusk with the six shades dark, and the room as it was shot, lit.
  // Each shade switches on with an LED's quick double flicker, its light spreading from the shade outward;
  // when the sixth is on, the light fills the whole room. Only a mask and opacity change.
  var lampOn = $('[data-lamp-on]'), lamp = $('[data-lamp]'), blooms = $$('.blooms i'), lampsT = 0;
  function lampsDone() { cancelAnimationFrame(lampsT); lamp.classList.add('lit'); blooms.forEach(function (b) { b.style.opacity = 0; }); }
  function lampsRun() {
    if (still()) { lampsDone(); return; }
    var t0 = performance.now() + 380, STEP = 190, LIGHT = 620, FILL = 900;
    var flick = function (t) { // 0..1 → an LED's quick catch: on, dip, on
      if (t <= 0) return 0; if (t < .25) return t / .25; if (t < .38) return 1 - (t - .25) / .13 * .7; if (t < .5) return .3 + (t - .38) / .12 * .7; return 1;
    };
    function tick(nw) {
      var e = nw - t0, allEnd = 5 * STEP + LIGHT;
      for (var i = 0; i < 6; i++) {
        var t = (e - i * STEP) / LIGHT, f = flick(clamp(t * 2.2, 0, 1)), r = f * lerp(4, 17, eout(t));
        lampOn.style.setProperty('--r' + (i + 1), r.toFixed(2) + '%');
        blooms[i].style.opacity = (f * (1 - eout(seg(e, allEnd, allEnd + FILL)))).toFixed(3);
      }
      lampOn.style.setProperty('--all', eio(seg(e, allEnd - 120, allEnd + FILL)).toFixed(3));
      if (e < allEnd + FILL + 40) lampsT = requestAnimationFrame(tick); else lamp.classList.add('lit');
    }
    lampsT = requestAnimationFrame(tick);
  }
  var heroImg = $('.lamp-off');
  if (heroImg.complete) lampsRun(); else heroImg.addEventListener('load', lampsRun);

  // ------------------------------------------------------------ ORDER: the signature, tied to the scroll both ways
  // The window holds three of their own photos.
  //   1 → 2: the camera pushes into the wire bundle of the open wall; at the bundle a flash of light (the moment the
  //          circuit closes) covers the cut, and out of it the routed cable run settles back to its frame.
  //   2 → 3: a steel panel door swings shut over the window; behind it the photo changes; it swings open on the tidy board.
  // The window's ground is the page's ground and every layer covers it whole, so no gap can show anything else.
  var track = $('[data-track]'), win = $('[data-win]'), S = $$('.win .s'), spark = $('.spark'), door = $('.door');
  var lines = $$('[data-line]'), thumbs = $$('[data-goto]'), stage = 0, tTop = 0, tLen = 1;
  var STOPS = [0.06, 0.5, 0.94];
  function measure() {
    var r = track.getBoundingClientRect(); tTop = r.top + scrollY; tLen = Math.max(1, track.offsetHeight - innerHeight);
  }
  function showStage(k) {
    if (k === stage && lines[k].classList.contains('on')) return;
    stage = k;
    lines.forEach(function (p, i) { p.classList.toggle('on', i === k); });
    thumbs.forEach(function (b, i) { b.setAttribute('aria-pressed', i === k ? 'true' : 'false'); });
  }
  function resetLayers() { S.forEach(function (s) { s.style.opacity = ''; s.style.transform = ''; }); }
  function setStage(k) { // motion off: a plain block, the arrows and thumbnails step it
    k = clamp(k, 0, 2); S.forEach(function (s, i) { s.style.opacity = i === k ? 1 : 0; }); showStage(k);
  }
  function frame() {
    if (still()) return;
    var p = clamp((scrollY - tTop) / tLen, 0, 1);
    // 1: hold and a slow push, then the zoom into the bundle
    var push = lerp(1, 1.08, seg(p, 0, .14)), z = eio(seg(p, .14, .36));
    S[0].style.transformOrigin = '52% 30%';
    S[0].style.transform = 'scale(' + (push * lerp(1, 2.7, z)).toFixed(4) + ')';
    S[0].style.opacity = (1 - seg(p, .29, .34)).toFixed(3);
    var fl = seg(p, .24, .31) * (1 - seg(p, .31, .42));
    spark.style.opacity = eio(fl).toFixed(3);
    spark.style.transform = 'scale(' + lerp(.35, 1.05, eout(seg(p, .24, .34))).toFixed(3) + ')';
    // 2: the cable run settles back out of the light, drifts, then the door
    var s2in = eout(seg(p, .29, .48));
    S[1].style.transformOrigin = '45% 42%';
    S[1].style.opacity = p < .29 ? 0 : p < .705 ? 1 : 0;
    S[1].style.transform = 'scale(' + (lerp(1.45, 1, s2in) * lerp(1, 1.04, seg(p, .48, .6))).toFixed(4) + ')';
    // door: open (-100deg) → shut (0) between .58 and .69, opens again .71 → .84
    var shut = eio(seg(p, .58, .69)), open = eio(seg(p, .71, .84)), ang = p < .7 ? lerp(-100, 0, shut) : lerp(0, -100, open);
    door.style.visibility = ang > -99 ? 'visible' : 'hidden';
    door.style.transform = 'rotateY(' + ang.toFixed(2) + 'deg)';
    S[2].style.opacity = p >= .69 ? 1 : 0;
    S[2].style.transformOrigin = '50% 40%';
    S[2].style.transform = 'scale(' + lerp(1.06, 1, eout(seg(p, .71, 1))).toFixed(4) + ')';
    showStage(p < .31 ? 0 : p < .7 ? 1 : 2);
  }
  function goStage(k) {
    k = clamp(k, 0, 2);
    if (still()) { setStage(k); return; }
    measure(); scrollTo({ top: tTop + STOPS[k] * tLen, behavior: 'smooth' });
  }
  thumbs.forEach(function (b) { b.addEventListener('click', function () { goStage(+b.dataset.goto); }); });
  $$('[data-step]').forEach(function (b) { b.addEventListener('click', function () { goStage(stage + (+b.dataset.step)); }); });
  if (still()) setStage(0);

  // ------------------------------------------------------------ THE BOARD: breakers compose the WhatsApp message
  var JOB = {
    he: { fault: 'תקלה בחשמל', panel: 'לוח חשמל', light: 'תאורה', socket: 'שקעים ונקודות חשמל', smart: 'בית חכם', data: 'נקודות תקשורת', heater: 'דוד חשמלי', biz: 'חשמל לעסק או למפעל' },
    en: { fault: 'an electrical fault', panel: 'a panel', light: 'lighting', socket: 'sockets and power points', smart: 'a smart home', data: 'data points', heater: 'a water heater', biz: 'power for a business or plant' }
  };
  var brks = $$('.brk'), preview = $('[data-preview]'), send = $('[data-send]'), nm = $('[name=nm]');
  function message() {
    var l = he() ? 'he' : 'en', on = brks.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; }).map(function (b) { return JOB[l][b.dataset.k]; });
    var name = (nm.value || '').replace(/\s+/g, ' ').trim().slice(0, 40).replace(/[.!?]+$/, '');
    var join = function (a) { if (a.length < 2) return a.join(''); return a.slice(0, -1).join(', ') + (l === 'he' ? ' ו' : ' and ') + a[a.length - 1]; };
    var m = l === 'he' ? 'שלום רועי, הגעתי דרך האתר.' : 'Hi Roi, I found your website.';
    if (on.length) m += l === 'he' ? ' אשמח לעזרה עם ' + join(on) + '.' : ' I’d like help with ' + join(on) + '.';
    else m += l === 'he' ? ' יש לי שאלה על עבודת חשמל.' : ' I have a question about some electrical work.';
    if (name) m += l === 'he' ? ' קוראים לי ' + name + '.' : ' My name is ' + name + '.';
    return m + (l === 'he' ? ' מתי נוח לדבר?' : ' When is a good time to talk?');
  }
  var typeT = 0, lastM = '';
  function write(instant) {
    var m = message();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    clearInterval(typeT);
    if (instant || still() || !lastM) { preview.textContent = m; lastM = m; return; }
    var keep = 0; while (keep < m.length && keep < lastM.length && m[keep] === lastM[keep]) keep++;
    lastM = m; var i = keep;
    typeT = setInterval(function () {
      i = Math.min(m.length, i + 2);
      preview.textContent = m.slice(0, i);
      if (i < m.length) preview.insertAdjacentHTML('beforeend', '<span class="caret"></span>'); else clearInterval(typeT);
    }, 16);
  }
  brks.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-checked', b.getAttribute('aria-checked') === 'true' ? 'false' : 'true'); write(); }); });
  nm.addEventListener('input', function () { write(true); });

  // ------------------------------------------------------------ the meter: ticks, then the needle swings to 4.7 and settles
  var tk = $('[data-ticks]'), cx = 160, cy = 220, R = 150, svg = '';
  for (var v = 0; v <= 50; v++) {
    var a = (-50 + v * 2) * Math.PI / 180, major = v % 10 === 0, half = v % 5 === 0, len = major ? 18 : half ? 12 : 7;
    var x1 = cx + R * Math.sin(a), y1 = cy - R * Math.cos(a), x2 = cx + (R - len) * Math.sin(a), y2 = cy - (R - len) * Math.cos(a);
    svg += '<line class="tick' + (major ? ' major' : '') + '" x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>';
    if (major) svg += '<text class="num" x="' + (cx + (R - 34) * Math.sin(a)).toFixed(1) + '" y="' + (cy - (R - 34) * Math.cos(a) + 5).toFixed(1) + '">' + (v / 10) + '</text>';
  }
  tk.innerHTML = svg;
  var needle = $('[data-needle]'), END = -50 + 100 * 4.7 / 5;
  function needleTo(deg) { needle.setAttribute('transform', 'rotate(' + deg.toFixed(2) + ' 160 220)'); }
  function swing() {
    if (still()) { needleTo(END); return; }
    var t0 = performance.now(), D = 1500;
    (function tick(nw) {
      var t = clamp((nw - t0) / D, 0, 1);
      // an underdamped meter movement: overshoot, swing back, settle
      var k = 1 - Math.exp(-5.2 * t) * Math.cos(9.5 * t);
      needleTo(lerp(-50, END, k));
      if (t < 1) requestAnimationFrame(tick); else needleTo(END);
    })(t0);
  }
  if ('IntersectionObserver' in window && !still()) {
    var mio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { swing(); mio.disconnect(); } }); }, { threshold: .5 });
    mio.observe($('[data-meter]'));
  } else needleTo(END);

  // ------------------------------------------------------------ light band: each photo eases in; the lamps in it glow once
  var pio = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in'); pio.unobserve(e.target);
      var h = $('.halo', e.target);
      if (h && !still() && h.animate) h.animate([{ opacity: 0 }, { opacity: .9, offset: .35 }, { opacity: .25 }], { duration: 2200, easing: 'ease-out', fill: 'forwards', delay: 250 });
    });
  }, { threshold: .35 }) : null;
  $$('.p').forEach(function (p) { pio && !still() ? pio.observe(p) : p.classList.add('in'); });

  // ------------------------------------------------------------ entrances: heading, text, picture, 80ms apart
  ['.order-text h2', '.board-head > *', '.rail', '.slip', '.work-body h2', '.statement', '.facts', '.light h2', '.meter-col > *', '.letter', '.shorts blockquote', '.visit-copy > *', '.map', '.card']
    .forEach(function (sel) { $$(sel).forEach(function (el) { el.setAttribute('data-reveal', ''); }); });
  $$('section, footer').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { io && !still() ? io.observe(el) : el.classList.add('in'); });

  // ------------------------------------------------------------ nav: current section; the pill rises past the concept bar
  var pill = $('[data-pill]'), links = $$('.links a');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['order', 'board', 'reviews', 'visit'].forEach(function (id) { nio.observe(document.getElementById(id)); });
  }

  // ------------------------------------------------------------ the wall plate: on phones, once the page's own buttons are out of sight
  var tray = $('[data-tray]'), seen = new Set();
  tray.classList.add('away');
  if ('IntersectionObserver' in window) {
    var kio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.isIntersecting ? seen.add(e.target) : seen.delete(e.target); });
      tray.classList.toggle('away', seen.size > 0 || scrollY < 200);
    }, { threshold: 0 });
    $$('[data-keep-clear]').forEach(function (el) { kio.observe(el); });
  }

  // ------------------------------------------------------------ scroll loop
  var ticking = false;
  function onScroll() {
    pill.classList.toggle('up', scrollY > 30);
    if (scrollY >= 200 && seen.size === 0) tray.classList.remove('away');
    if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; frame(); }); }
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', function () { measure(); frame(); });
  addEventListener('load', function () { measure(); frame(); });

  texts(root.lang === 'en' ? 'en' : 'he'); hours(); write(true); measure(); frame(); onScroll();
  window.__frame = function () { measure(); frame(); };
})();
