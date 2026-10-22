(function () {
  var root = document.documentElement, WA = '972559950569';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var eio = function (t) { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var Q = new URLSearchParams(location.search), SHOT = Q.get('shot');
  var TITLE = { he: 'דמיטרי · טכנאי מזגנים · לאון בלום 62, חיפה', en: 'Dmitri · AC technician · 62 Leon Blum St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור טכנאי מזגנים דמיטרי · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Dmitri, AC technician · This is not the business’s official website' };
  $$('[data-stars]').forEach(function (s) { s.innerHTML = [0, 1, 2, 3, 4].map(function () { return '<svg viewBox="0 0 16 16" aria-hidden="true"><use href="#i-star"/></svg>'; }).join(''); s.setAttribute('role', 'img'); });

  // ---------------------------------------------------------------- seven-segment display (the unit's own readout)
  var SEGS = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
  function seg(svg, text) {
    var vb = svg.viewBox.baseVal, H = vb.height, t = H * 0.13, w = H * 0.54, gap = H * 0.2, x = 0, out = '';
    String(text).split('').forEach(function (ch) {
      if (ch === '.') { out += '<rect class="on" x="' + (x - gap * 0.55) + '" y="' + (H - t) + '" width="' + t + '" height="' + t + '" rx="' + t / 3 + '"/>'; x += t * 0.6; return; }
      var on = SEGS[ch] || '', h2 = H / 2, r = t / 2.2;
      var R = { a: [x + t, 0, w - 2 * t, t], b: [x + w - t, t * 0.9, t, h2 - t * 1.3], c: [x + w - t, h2 + t * 0.4, t, h2 - t * 1.3], d: [x + t, H - t, w - 2 * t, t], e: [x, h2 + t * 0.4, t, h2 - t * 1.3], f: [x, t * 0.9, t, h2 - t * 1.3], g: [x + t, h2 - t / 2, w - 2 * t, t] };
      Object.keys(R).forEach(function (k) { var q = R[k]; out += '<rect class="' + (on.indexOf(k) >= 0 ? 'on' : 'off') + '" x="' + q[0].toFixed(2) + '" y="' + q[1].toFixed(2) + '" width="' + q[2].toFixed(2) + '" height="' + q[3].toFixed(2) + '" rx="' + r.toFixed(2) + '"/>'; });
      x += w + gap;
    });
    svg.innerHTML = '<g transform="skewX(-7) translate(' + (H * 0.12).toFixed(1) + ' 0)">' + out + '</g>';
  }
  var readSvg = $('.readout .seg'), readout = $('.readout'), lastT = null;
  function temp(n) { if (n === lastT) return; lastT = n; seg(readSvg, n); readout.classList.toggle('cool', n <= 26); }
  temp(31);
  var lcd = $('[data-lcd] svg');
  seg(lcd, '5.0');

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-stars]').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
    var aria = function (sel, h, e) { var el = $(sel); if (el) el.setAttribute('aria-label', l === 'he' ? h : e); };
    aria('[data-unit]', 'ראשי', 'Main');
    aria('[data-m-call]', 'התקשרו לדמיטרי, 055-995-0569', 'Call Dmitri, 055-995-0569');
    aria('[data-m-wa]', 'וואטסאפ לדמיטרי', 'WhatsApp Dmitri');
    aria('[data-st-chips]', 'שלבי האנימציה', 'Animation stages');
    var nm = $('[name=nm]'); nm.placeholder = nm.dataset[l === 'he' ? 'phHe' : 'phEn'];
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('dm-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(), keep = $('#city').getBoundingClientRect().top;
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('dm-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-slat]').forEach(function (el) { el.classList.add('open'); });
    if (!on) { resetStage(); airStop(); }
    layout();
    if (keep < innerHeight) { var now = $('#city').getBoundingClientRect().top; if (now !== keep) scrollBy(0, now - keep); }
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed, [0,24] = 24 hours
  var H = { 0: [8, 18], 1: [8, 18], 2: [8, 18], 3: [8, 18], 4: [8, 18], 5: [8, 17], 6: [9, 17] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'עובד עכשיו · 24 שעות' : 'Working now · 24 hours'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'עובד עכשיו · עד ' + hhmm(t[1]) : 'Working now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) { txt = l ? 'מחוץ לשעות הפעילות · מתחיל היום ב־' + hhmm(t[0]) : 'Off hours · starts today at ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'מחוץ לשעות הפעילות' : 'Off hours')
        : nd === (n.d + 1) % 7 ? (l ? 'מחוץ לשעות הפעילות · מחר מ־' + hhmm(H[nd][0]) : 'Off hours · tomorrow from ' + hhmm(H[nd][0]))
        : (l ? 'מחוץ לשעות הפעילות · ביום ' + dayHe[nd] + ' מ־' + hhmm(H[nd][0]) : 'Off hours · ' + dayEn[nd] + ' from ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $('[data-led]').classList.toggle('open', open);
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

  // ---------------------------------------------------------------- the remote: what is wrong, which unit, when to call back
  var T = {
    he: { hi: 'שלום דמיטרי, הגעתי דרך האתר. ',
      pb: { cool: 'המזגן שלי לא מקרר.', drip: 'המזגן שלי מטפטף מים.', noise: 'המזגן שלי עושה רעש.', smell: 'יש ריח לא נעים מהמזגן.', clean: 'אשמח לתאם ניקוי למזגן.', install: 'אשמח לתאם התקנת מזגן.' },
      un: { wall: ' מדובר במזגן עילי.', mini: ' מדובר במזגן מיני מרכזי.', central: ' מדובר במזגן מרכזי.', unsure: '' },
      wh: { am: ' נוח לי שתחזור אליי בבוקר.', noon: ' נוח לי שתחזור אליי בצהריים.', pm: ' נוח לי שתחזור אליי אחר הצהריים.', none: ' אשמח שתחזור אליי.' },
      name: ' קוראים לי ', mode: { cool: 'לא מקרר', drip: 'מטפטף', noise: 'רעש', smell: 'ריח', clean: 'ניקוי', install: 'התקנה' } },
    en: { hi: 'Hi Dmitri, I found your website. ',
      pb: { cool: 'My AC isn’t cooling.', drip: 'My AC is dripping water.', noise: 'My AC is making a noise.', smell: 'There’s a bad smell from my AC.', clean: 'I’d like to book a cleaning.', install: 'I’d like to book an installation.' },
      un: { wall: ' It’s a wall unit.', mini: ' It’s a mini-central unit.', central: ' It’s a central unit.', unsure: '' },
      wh: { am: ' Could you call me back in the morning?', noon: ' Could you call me back around midday?', pm: ' Could you call me back in the afternoon?', none: ' Could you call me back?' },
      name: ' My name is ', mode: { cool: 'NOT COOLING', drip: 'DRIPPING', noise: 'NOISE', smell: 'SMELL', clean: 'CLEANING', install: 'INSTALL' } }
  };
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]'), nm = $('[name=nm]'), modeEl = $('[data-mode]');
  function message() {
    var l = he() ? 'he' : 'en', t = T[l], fd = new FormData(form), pb = fd.get('pb') || 'cool', un = fd.get('un') || 'unsure', wh = fd.get('wh') || 'none';
    var name = (nm.value || '').replace(/\s+/g, ' ').trim().slice(0, 40).replace(/[.!?]+$/, '');
    modeEl.textContent = t.mode[pb];
    return t.hi + t.pb[pb] + t.un[un] + t.wh[wh] + (name ? t.name + name + '.' : '');
  }
  function write(instant) {
    var m = message();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    type(m, instant);
  }
  // the screen writes the message in, a few letters at a time, from where it changed
  var typeT = 0, lastM = '';
  function type(m, instant) {
    clearInterval(typeT);
    if (instant || still() || !lastM) { preview.textContent = m; lastM = m; return; }
    var keep = 0; while (keep < m.length && keep < lastM.length && m[keep] === lastM[keep]) keep++;
    lastM = m;
    var i = keep, caret = '<span class="caret"></span>';
    typeT = setInterval(function () {
      i = Math.min(m.length, i + 2);
      preview.textContent = m.slice(0, i);
      if (i < m.length) preview.insertAdjacentHTML('beforeend', caret); else clearInterval(typeT);
    }, 16);
  }
  form.addEventListener('change', function () { write(); });
  nm.addEventListener('input', function () { write(true); });

  // ---------------------------------------------------------------- entrances, once, staggered inside each section
  $$('section, header').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting || e.boundingClientRect.top < 0) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { io && !still() ? io.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- the slats: six vertical vanes over each photo swing open,
  // each card in its own order (from one side, from the middle, from the other side, every other, all together)
  var ORDERS = [
    function (i) { return i * 70; }, function (i) { return Math.abs(i - 2.5) * 90; }, function (i) { return (5 - i) * 70; },
    function (i) { return (i % 2) * 220 + i * 25; }, function (i) { return 60 + i * 12; }
  ];
  $$('[data-vanes]').forEach(function (sv, c) {
    for (var i = 0; i < 6; i++) {
      var v = document.createElement('i'); v.className = 'vane'; v.setAttribute('aria-hidden', 'true');
      v.style.left = (i * 100 / 6) + '%'; v.style.width = 'calc(' + (100 / 6) + '% + 1px)';
      v.style.transitionDelay = Math.round(ORDERS[c % 5](i)) + 'ms';
      if (c === 4) v.style.transitionDuration = '1300ms';
      sv.appendChild(v);
    }
  });
  var sio = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('open'); sio.unobserve(e.target); } });
  }, { threshold: .45 }) : null;
  $$('[data-slat]').forEach(function (el) { sio && !still() ? sio.observe(el) : el.classList.add('open'); });

  // ---------------------------------------------------------------- the display powers on: every segment, a blink, then the score
  if ('IntersectionObserver' in window) {
    var lio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; lio.disconnect();
        if (still()) return;
        seg(lcd, '8.8');
        setTimeout(function () { lcd.style.opacity = '.15'; }, 380);
        setTimeout(function () { seg(lcd, '5.0'); lcd.style.opacity = ''; }, 520);
      });
    }, { threshold: .6 });
    lio.observe($('[data-lcd]'));
  }

  // ---------------------------------------------------------------- footer: the outdoor fan spins up as you arrive, then coasts to a stop
  var spokes = $('.spokes'), sp = '';
  for (var a = 0; a < 24; a++) { var ang = a * Math.PI / 12; sp += '<line x1="' + (13 * Math.cos(ang)).toFixed(2) + '" y1="' + (13 * Math.sin(ang)).toFixed(2) + '" x2="' + (92 * Math.cos(ang)).toFixed(2) + '" y2="' + (92 * Math.sin(ang)).toFixed(2) + '"/>'; }
  spokes.innerHTML = sp;
  var fan = $('[data-fan]'), fanA = null;
  fan.style.transformBox = 'view-box'; fan.style.transformOrigin = '50% 50%';
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting || still() || !fan.animate) return;
      if (fanA && fanA.playState === 'running') return;
      fanA = fan.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(1080deg)' }], { duration: 4600, easing: 'cubic-bezier(.3,.55,.25,1)' });
    });
  }, { threshold: .5 }).observe($('[data-foot]'));

  // ---------------------------------------------------------------- nav: where you are; the unit rises past the concept bar
  var unit = $('[data-unit]'), links = $$('.links a'), slot = $('[data-slot]');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['work', 'voices', 'remote', 'visit'].forEach(function (id) { var el = document.getElementById(id); if (el) nio.observe(el); });
  }

  // ---------------------------------------------------------------- the mini remote: on phones, once the page's own buttons are out of sight
  var mini = $('[data-mini]'), seen = new Set();
  if (mini && 'IntersectionObserver' in window) {
    var kio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? seen.add(e.target) : seen.delete(e.target); }); mini.classList.toggle('away', seen.size > 0 || scrollY < 40); }, { threshold: 0 });
    $$('[data-keep-clear]').forEach(function (el) { kio.observe(el); });
  }

  // ---------------------------------------------------------------- motion off: the story as three stills with arrows and chips
  var stImgs = $$('[data-still]'), stChips = $$('[data-st]'), stI = 0;
  function stGo(i) {
    stI = (i + stImgs.length) % stImgs.length;
    stImgs.forEach(function (im, k) { im.hidden = k !== stI; });
    stChips.forEach(function (b, k) { b.setAttribute('aria-pressed', k === stI ? 'true' : 'false'); });
  }
  $('[data-st-prev]').addEventListener('click', function () { stGo(stI - 1); });
  $('[data-st-next]').addEventListener('click', function () { stGo(stI + 1); });
  stChips.forEach(function (b, k) { b.addEventListener('click', function () { stGo(k); }); });

  // ---------------------------------------------------------------- THE LOUVRE
  // Dmitri's portrait is cut into horizontal blades. Tied to the scroll, both ways, every pass:
  //   the blades swing open from the top down like a flap sweeping; each blade's back is the matching slice of the
  //   inside photo, and the gaps show that same photo underneath at the same place, so nothing else can ever show;
  //   the camera then moves into the inside photo toward the wiring and the board, and the parts are named in turn;
  //   finally the frame cools to the next section's ground while the air takes over.
  // Only transform, opacity and a couple of custom properties are written while scrolling.
  var stage = $('[data-stage]'), panel = $('[data-panel]'), bladesEl = $('[data-blades]'), face = $('[data-face]'), bImg = $('[data-b]'),
      copy = $('[data-copy]'), copy2 = $('[data-copy2]'), dusk = $('[data-dusk]'), pcap = $('[data-pcap]'), pcapB = $('[data-pcap-b]'), tags = $$('[data-tag]');
  var vw = 0, vh = 0, sTop = 0, sH = 0, pw = 0, ph = 0, A = {}, B = {}, blades = [], lastKey = '', N = 0;
  // points on the inside photo (share of 1600 x 1200): the coil, the blower drum, the control board at the right edge
  var TAGP = [[0.36, 0.2], [0.46, 0.46], [0.975, 0.5]], FOC = [0.84, 0.42];
  function geo() {
    pw = panel.clientWidth; ph = panel.clientHeight;
    var sa = Math.max(pw / 1024, ph / 1536); A = { w: 1024 * sa, h: 1536 * sa }; A.x = (pw - A.w) * 0.5; A.y = (ph - A.h) * 0.22;
    var sb = Math.max(pw / 1600, ph / 1200) * (ph / pw > 1.5 ? 1.0 : 1.38); B = { s: sb, w: 1600 * sb, h: 1200 * sb }; B.x = (pw - B.w) * 0.42; B.y = (ph - B.h) * 0.12;
    B.s1 = sb * (pw < 600 ? 1.5 : 1.3);
    N = ph < 720 ? 9 : 12;
    var bh = ph / N, html = '';
    for (var i = 0; i < N; i++) {
      var top = Math.floor(i * bh), hgt = Math.ceil((i + 1) * bh) - top + 1;
      html += '<div class="blade" style="top:' + top + 'px;height:' + hgt + 'px">' +
        '<i class="f" style="background-image:url(img/dmitri.jpg);background-size:' + A.w.toFixed(1) + 'px ' + A.h.toFixed(1) + 'px;background-position:' + A.x.toFixed(1) + 'px ' + (A.y - top).toFixed(1) + 'px"></i>' +
        '<i class="b" style="background-image:url(img/inside.jpg);background-size:' + B.w.toFixed(1) + 'px ' + B.h.toFixed(1) + 'px;background-position:' + B.x.toFixed(1) + 'px ' + (B.y - top).toFixed(1) + 'px"></i></div>';
    }
    bladesEl.innerHTML = html; blades = $$('.blade', bladesEl);
    bImg.style.width = '1600px'; bImg.style.height = '1200px';
  }
  function cam(t) {
    // from the resting crop toward the board: scale up and bring the focus to the panel's middle, never uncovering an edge
    var s = lerp(B.s, B.s1, t);
    var fx = FOC[0] * 1600, fy = FOC[1] * 1200;
    var x0 = B.x, y0 = B.y, x1 = pw * 0.56 - fx * s, y1 = ph * 0.42 - fy * s;
    var x = lerp(x0, x1, t), y = lerp(y0, y1, t);
    x = clamp(x, pw - 1600 * s, 0); y = clamp(y, ph - 1200 * s, 0);
    return { s: s, x: x, y: y };
  }
  function resetStage() {
    [copy, copy2, dusk, pcap, pcapB, bImg].concat(tags).forEach(function (e) { e.style.transform = ''; e.style.opacity = ''; e.style.translate = ''; });
    panel.classList.remove('flipping'); lastKey = '';
    bImg.style.transform = 'translate3d(' + B.x + 'px,' + B.y + 'px,0) scale(' + B.s + ')';
  }
  function paint(p) {
    // the blades: start one after another from the top, each takes 0.15 of the run
    var any = false, allOpen = true;
    blades.forEach(function (b, i) {
      var st = 0.07 + (N > 1 ? (N - 1 - i) / (N - 1) : 0) * 0.2, k = eio((p - st) / 0.15), th = 180 * k;
      if (k > 0 && k < 1) any = true;
      if (k < 1) allOpen = false;
      var sn = Math.sin(th * Math.PI / 180);
      b.style.transform = 'rotateX(' + (-th).toFixed(2) + 'deg)';
      b.style.setProperty('--dk', (sn * 0.62).toFixed(3));
      b.style.setProperty('--lip', sn.toFixed(3));
    });
    var started = p > 0.07;
    panel.classList.toggle('flipping', any || (started && !allOpen));
    face.style.opacity = started && allOpen ? '0' : '';
    // the camera into the inside photo
    var ct = eio((p - 0.42) / 0.36), c = cam(ct);
    bImg.style.transform = 'translate3d(' + c.x.toFixed(1) + 'px,' + c.y.toFixed(1) + 'px,0) scale(' + c.s.toFixed(4) + ')';
    // the parts, named in turn, each pinned to its place on the moving photo
    var out = 1 - smooth((p - 0.74) / 0.05);
    tags.forEach(function (tg, k) {
      var x = c.x + TAGP[k][0] * 1600 * c.s, y = c.y + TAGP[k][1] * 1200 * c.s;
      var o = smooth((p - (0.47 + k * 0.07)) / 0.04) * out;
      var flip = x > pw * 0.55;
      tg.style.flexDirection = (flip === (root.dir === 'ltr')) ? 'row-reverse' : 'row';
      var tw = tg.offsetWidth || 160;
      var tx = flip ? x - tw + 7 : x - 7;
      tx = clamp(tx, 8, pw - tw - 8);
      tg.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + (y - 14 + 10 * (1 - o)).toFixed(1) + 'px,0)';
      tg.style.opacity = o.toFixed(3);
    });
    // words
    var o1 = 1 - smooth((p - 0.01) / 0.08);
    copy.style.opacity = o1.toFixed(3);
    copy.style.translate = '0 ' + (-30 * (1 - o1)).toFixed(1) + 'px';
    copy.style.visibility = o1 < 0.01 ? 'hidden' : '';
    var o2 = smooth((p - 0.42) / 0.06) * (1 - smooth((p - 0.7) / 0.06));
    copy2.style.opacity = o2.toFixed(3);
    copy2.style.visibility = o2 < 0.01 ? 'hidden' : '';
    copy2.style.translate = '0 ' + (24 * (1 - smooth((p - 0.42) / 0.08))).toFixed(1) + 'px';
    pcap.style.opacity = (1 - smooth(p / 0.05)).toFixed(3);
    pcapB.style.opacity = (smooth((p - 0.43) / 0.04) * (1 - smooth((p - 0.72) / 0.04))).toFixed(3);
    dusk.style.opacity = (p >= 1 ? 1 : smooth((p - 0.8) / 0.19)).toFixed(3);
  }
  function layout() {
    vw = root.clientWidth; vh = innerHeight;
    sTop = stage.getBoundingClientRect().top + scrollY; sH = stage.offsetHeight;
    geo(); lastKey = '';
    if (still() && !SHOT) resetStage();
    airSize();
    tick();
  }
  var city = $('#city'), cityImg = $('[data-city] img');
  function tick() {
    var y = scrollY;
    unit.classList.toggle('up', y > 24);
    var docH = document.documentElement.scrollHeight - vh;
    slot.style.setProperty('--prog', clamp(y / Math.max(1, docH), 0, 1).toFixed(4));
    // the room cools as you read: 31° at the top, 23° once you are past the city
    var cr = city.getBoundingClientRect(), coolEnd = cr.bottom + y - vh * 0.6;
    temp(Math.round(31 - 8 * clamp(y / Math.max(1, coolEnd), 0, 1)));
    if (mini && y < 40) mini.classList.add('away');
    else if (mini && seen.size === 0) mini.classList.remove('away');
    if (still() || SHOT) return;
    var run = sH - vh;
    var p = clamp((y - sTop) / Math.max(1, run), 0, 1), key = p.toFixed(4);
    if (key !== lastKey) { lastKey = key; paint(p); }
    // the city drifts a little under its words
    if (cr.bottom > 0 && cr.top < vh) { var t = clamp((vh - cr.top) / (vh + cr.height), 0, 1); cityImg.style.transform = 'translate3d(0,' + lerp(-4, 4, t).toFixed(2) + '%,0) scale(1.04)'; }
    // the air: rises as the louvre finishes, carries over the city, settles once the city has passed
    var aIn = smooth((p - 0.68) / 0.2), aOut = smooth((cr.bottom - vh * 0.15) / (vh * 0.45));
    airLevel(p < 1 ? aIn : aOut);
  }

  // ---------------------------------------------------------------- the air current: soft streamlines out of the louvre
  var cv = $('[data-air]'), cx = cv.getContext && cv.getContext('2d'), parts = [], level = 0, running = false, lastMove = 0, dpr = 1, raf = 0, tPrev = 0;
  function airSize() {
    if (!cx) return;
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);
    cv.style.width = vw + 'px'; cv.style.height = vh + 'px';
    var n = vw < 700 ? 34 : 60; parts = [];
    for (var i = 0; i < n; i++) parts.push(spawn(true));
  }
  function spawn(any) {
    // out of the louvre: across the photo panel (the whole width on phones), from its upper part
    var r = panel.getBoundingClientRect();
    var x0 = vw < 900 ? 0 : r.left, x1 = vw < 900 ? vw : r.right;
    var dirX = root.dir === 'rtl' ? 1 : -1, edge = dirX > 0 ? x0 : x1;
    return { x: any ? Math.random() * vw : edge + (Math.random() - 0.5) * 120, y: any ? Math.random() * vh : lerp(vh * 0.05, vh * 0.85, Math.random()), s: 0.6 + Math.random() * 0.8, w: 0.8 + Math.random() * 1.4, ph: Math.random() * 6.28, life: 0 };
  }
  function airLevel(a) {
    level = a;
    cv.style.opacity = a.toFixed(3);
    cv.style.visibility = a > 0.01 ? 'visible' : 'hidden';
    lastMove = performance.now();
    if (a > 0.01 && !running && cx && !still()) { running = true; tPrev = performance.now(); raf = requestAnimationFrame(airStep); }
  }
  function airStop() { running = false; cancelAnimationFrame(raf); if (cx) cx.clearRect(0, 0, cv.width, cv.height); cv.style.opacity = 0; }
  function airStep(ts) {
    if (!running) return;
    var dt = Math.min(48, ts - tPrev) / 16.7; tPrev = ts;
    // without scrolling the air settles over two seconds and the loop stops; any scroll wakes it again
    var idle = (ts - lastMove - 4000) / 2000, calm = 1 - smooth(idle);
    if (level < 0.01 || calm <= 0 || still() || document.hidden) { running = false; cx.clearRect(0, 0, cv.width, cv.height); return; }
    cx.globalCompositeOperation = 'destination-out';
    cx.fillStyle = 'rgba(0,0,0,' + (0.03 * dt).toFixed(3) + ')';
    cx.fillRect(0, 0, cv.width, cv.height);
    cx.globalCompositeOperation = 'source-over';
    cx.lineCap = 'round';
    var t = ts / 1000, dirX = root.dir === 'rtl' ? 1 : -1;
    for (var i = 0; i < parts.length; i++) {
      var q = parts[i], ox = q.x, oy = q.y;
      // air leaving a louvre: it travels out sideways, sinks slowly as it cools, and rolls in long soft waves
      var vx = dirX * (2.3 + Math.sin(q.y * 0.004 + t * 0.4 + q.ph) * 0.5) * q.s, vy = (0.75 + Math.sin(q.x * 0.0045 + t * 0.55 + q.ph) * 1.05) * q.s;
      q.x += vx * dt * 1.4 * calm; q.y += vy * dt * 1.4 * calm; q.life += dt;
      var fade = smooth(q.life / 40) * (1 - smooth((q.life - 260) / 80));
      cx.beginPath(); cx.moveTo(ox * dpr, oy * dpr); cx.lineTo(q.x * dpr, q.y * dpr);
      cx.strokeStyle = 'rgba(190,240,224,' + (0.035 * fade).toFixed(4) + ')'; cx.lineWidth = q.w * 7 * dpr; cx.stroke();
      cx.strokeStyle = 'rgba(225,250,242,' + (0.11 * fade * q.s).toFixed(4) + ')'; cx.lineWidth = q.w * 0.8 * dpr; cx.stroke();
      if (q.y > vh + 30 || q.x < -60 || q.x > vw + 60 || q.life > 340) parts[i] = spawn(false);
    }
    raf = requestAnimationFrame(airStep);
  }

  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); } }, { passive: true });
  var rT = 0, lastW = 0;
  addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { if (root.clientWidth !== lastW || Math.abs(innerHeight - vh) > 120) { lastW = root.clientWidth; layout(); } else { vh = innerHeight; tick(); } }, 120); });
  addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  texts(he() ? 'he' : 'en');
  hours(); write(true);
  lastW = root.clientWidth;
  layout();
  if (still()) resetStage();
  // still-frame rendering (used once to render the motion-off stills): ?shot=<0..1>
  if (SHOT !== null) { root.classList.remove('still'); root.classList.add('shoot'); layout(); paint(+SHOT); }
  window.__stage = { layout: layout, paint: paint, tick: tick };
})();
