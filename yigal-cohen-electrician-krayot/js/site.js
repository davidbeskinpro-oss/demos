(function () {
  var root = document.documentElement, WA = '972506891859';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: 'יגאל כהן · חשמלאי · החשמונאים 39, קריית מוצקין', en: 'Yigal Cohen · Electrician · 39 HaHashmonaim St, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור יגאל כהן · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Yigal Cohen · This is not the business’s official website' };
  var STAR = '<svg viewBox="0 0 92 16" aria-hidden="true">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; }).join('') + '</svg>';
  $$('[data-stars]').forEach(function (s) { s.innerHTML = STAR; });

  // ---------------------------------------------------------------- language
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    try { localStorage.setItem('yc-lang', l); } catch (e) {}
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { var el = $(sel); if (el) el.setAttribute('aria-label', l === 'he' ? h : e); };
    aria('[data-pill]', 'ראשי', 'Main');
    aria('[data-lev-call]', 'התקשרו ליגאל, 050-689-1859', 'Call Yigal, 050-689-1859');
    aria('[data-lev-wa]', 'וואטסאפ ליגאל', 'WhatsApp Yigal');
    ringText(); hours(); write(); layout();
  }
  var RING = { he: 'יגאל כהן ◦ חשמלאי ◦ קריית מוצקין ◦ 24/7 ◦ 050-689-1859 ◦ ', en: 'YIGAL COHEN ◦ ELECTRICIAN ◦ KIRYAT MOTZKIN ◦ 24/7 ◦ 050-689-1859 ◦ ' };
  // the print runs once round the cut end without overlapping itself: as many repeats as fit, spaced out to close the ring
  function ringText() {
    var t = $('[data-ring-text]'); if (!t) return;
    var C = 2 * Math.PI * 467, one = RING[root.lang], n = 1;
    t.removeAttribute('textLength'); t.textContent = one;
    var w = t.getComputedTextLength ? t.getComputedTextLength() : 0;
    if (w > 0) n = Math.max(1, Math.floor(C / w));
    t.textContent = new Array(n + 1).join(one);
    if (w > 0) { t.setAttribute('textLength', (C - 2).toFixed(0)); t.setAttribute('lengthAdjust', 'spacing'); }
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('yc-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI(); write();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    seams.forEach(function (s) { s.k = null; });
    if (jobs) jobs.classList.add('go');
    tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. [open, close] per day; null = closed; [0, 24] = all day
  var H = { 0: [0, 24], 1: [0, 24], 2: [0, 24], 3: [0, 24], 4: [0, 24], 5: [0, 24], 6: [0, 24] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  var allDay = function (t) { return t && t[0] === 0 && t[1] === 24; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (allDay(t)) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
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
    lcd(n, open);
  }
  // consecutive days with the same hours share a row
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var two = r[1] - r[0] === 1;
      var label = r[0] === r[1] ? names[r[0]] : names[r[0]] + (two ? (l ? ' ו' : ' and ') : '–') + names[r[1]];
      var time = !t ? (l ? 'סגור' : 'Closed') : allDay(t) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + label + '</td><td>' + time + '</td></tr>';
    }).join('');
    status();
  }

  // ---------------------------------------------------------------- the meter's display shows the time in the Krayot, in its own seven segments
  var SEG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
  var SP = { a: 'M6 2h28l-5 6H11z', b: 'M35 3l3 4v24l-3 3-5-4V9z', c: 'M35 36l3 3v24l-3 4-5-5V40z', d: 'M6 68h28l-5-6H11z', e: 'M5 36l5 4v22l-5 5-3-4V39z', f: 'M5 3l5 6v21l-5 4-3-3V7z', g: 'M7 35l4-4h18l4 4-4 4H11z' };
  function digit(ch, x) {
    var on = SEG[ch] || '';
    return '<g transform="translate(' + x + ' 0) skewX(-6)">' + 'abcdefg'.split('').map(function (s) { return '<path class="' + (on.indexOf(s) >= 0 ? 'seg' : 'off') + '" d="' + SP[s] + '"/>'; }).join('') + '</g>';
  }
  var lcdEl = $('[data-lcd]'), lcdCap = $('[data-lcd-cap]');
  function lcd(n, open) {
    if (!lcdEl) return;
    var h = Math.floor(n.h), m = Math.round((n.h - h) * 60); if (m === 60) { m = 0; h = (h + 1) % 24; }
    var s = (h < 10 ? '0' : '') + h + (m < 10 ? '0' : '') + m;
    lcdEl.innerHTML = '<svg viewBox="0 0 200 70">' + digit(s[0], 4) + digit(s[1], 46) + '<circle class="seg" cx="94" cy="22" r="3.6"/><circle class="seg" cx="91" cy="48" r="3.6"/>' + digit(s[2], 108) + digit(s[3], 150) + '</svg>';
    var t = s.slice(0, 2) + ':' + s.slice(2);
    lcdCap.innerHTML = he() ? 'השעה בקריות עכשיו: <span class="num" dir="ltr">' + t + '</span> · ' + (open ? 'יגאל זמין' : 'סגור כרגע')
      : 'In the Krayot right now: <span class="num">' + t + '</span> · ' + (open ? 'Yigal is on call' : 'closed for now');
  }
  window.__status = status; window.__H = H; window.__hours = hours;
  setInterval(status, 30000);

  // ---------------------------------------------------------------- the message: a compartment from the organiser, printed along a cable
  var T = {
    he: { hi: 'היי יגאל, הגעתי דרך האתר. ',
          job: { fault: 'יש לי תקלה בחשמל', socket: 'אשמח להתקנת שקע או נקודה חדשה', ac: 'אשמח לנקודה למזגן', fan: 'אשמח להתקנת מאוורר תקרה', light: 'אשמח לעבודת תאורה', panel: 'אשמח שתבדוק את לוח החשמל' },
          at: ', ב', when: { now: '. זה דחוף, אפשר עכשיו?', today: '. אפשר היום?', later: '. מתי נוח לך להגיע?' },
          lw: 'איפה? (לא חובה)', ph: 'למשל: קריית ביאליק…' },
    en: { hi: 'Hi Yigal, I found you through your website. ',
          job: { fault: 'There’s an electrical fault', socket: 'I’d like a new socket or point', ac: 'I need a point for an AC', fan: 'I’d like a ceiling fan installed', light: 'I need some lighting work', panel: 'Could you check my electrical panel' },
          at: ', in ', when: { now: '. It’s urgent, can you come now?', today: '. Could you make it today?', later: '. When would suit you to come?' },
          lw: 'Where? (optional)', ph: 'E.g. Kiryat Bialik…' }
  };
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]'), where = $('[name=where]'), wl = $('[data-where-label]'), said = $('[data-said]');
  function write() {
    var t = T[root.lang] || T.he, fd = new FormData(form), w = (where.value || '').trim().replace(/\s+/g, ' ').slice(0, 60);
    var m = t.hi + t.job[fd.get('job') || 'fault'] + (w ? t.at + w : '') + t.when[fd.get('when') || 'today'];
    wl.textContent = t.lw; where.placeholder = t.ph;
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    said.textContent = m;
    print(m);
  }
  var printT = 0, lastM = '';
  function print(m) {
    clearInterval(printT);
    var ink = document.createElement('span'); ink.className = 'ink';
    preview.textContent = ''; preview.appendChild(ink);
    if (still() || (lastM && m.indexOf(lastM) === 0 && m.length - lastM.length < 3) || (lastM && lastM.indexOf(m) === 0)) { ink.textContent = m; lastM = m; return; }
    lastM = m;
    var i = 0, caret = document.createElement('span'); caret.className = 'caret';
    ink.appendChild(caret);
    printT = setInterval(function () {
      i = Math.min(m.length, i + 2);
      ink.textContent = m.slice(0, i);
      if (i < m.length) ink.appendChild(caret); else clearInterval(printT);
    }, 16);
  }
  form.addEventListener('change', write);
  where.addEventListener('input', write);

  // ---------------------------------------------------------------- entrances, once, staggered inside each section
  $$('section, header').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { io && !still() ? io.observe(el) : el.classList.add('in'); });
  var jobs = $('[data-jobs]');
  if (jobs) {
    if ('IntersectionObserver' in window && !still()) new IntersectionObserver(function (es, o) { es.forEach(function (e) { if (e.isIntersecting) { jobs.classList.add('go'); o.disconnect(); } }); }, { threshold: 0.3 }).observe(jobs);
    else jobs.classList.add('go');
  }

  // ---------------------------------------------------------------- nav: where you are; the sticky connector appears once the hero's buttons are gone
  var pill = $('[data-pill]'), links = $$('.links a'), wago = $('[data-wago]'), away = new Set();
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['van', 'work', 'always', 'reviews', 'msg', 'find'].forEach(function (id) { var el = document.getElementById(id); if (el) nio.observe(el); });
    var kio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? away.add(e.target) : away.delete(e.target); }); wago.classList.toggle('show', away.size === 0); }, { threshold: 0 });
    $$('[data-hero-act], [data-find-act], [data-send]').forEach(function (el) { kio.observe(el); });
  } else wago.classList.add('show');

  // ---------------------------------------------------------------- THE SEAM
  // A grey three-core cable lies across the top edge of every section. Tied to the scroll, both ways:
  //   it is pulled in from the side; a knife scores the sheath; the cut length of sheath slides off the end, baring
  //   the brown, blue and green-yellow cores; their insulation ends are pulled off one by one, baring the copper;
  //   the cable is pushed forward so the copper enters a three-way lever connector; the three orange levers snap down;
  //   then current runs along the cable and the section's own ground (the tone of one core) comes on.
  // Scroll back up and it all comes undone in reverse, so every pass plays it again.
  // The script lays the pieces out once in px; per frame it writes only transform and opacity, only for seams near the screen.
  var GLOW = { br: 'rgba(222, 160, 110, 0.4)', bl: 'rgba(130, 170, 240, 0.42)', gy: 'rgba(214, 214, 100, 0.36)' };
  var PRINT = '<span lang="he">יגאל כהן ◦ חשמלאי ◦ קריית מוצקין ◦ <bdi dir="ltr">3×2.5</bdi> ממ״ר ◦ 24/7</span><span lang="en">YIGAL COHEN ◦ ELECTRICIAN ◦ KIRYAT MOTZKIN ◦ 3×2.5 MM² ◦ 24/7</span>';
  var secs = $$('.sec'), seams = [];
  secs.forEach(function (s, i) {
    if (i > 0) s.style.setProperty('--prev', getComputedStyle(secs[i - 1]).getPropertyValue('--own').trim());
    if (!s.dataset.seam) return;
    var tint = document.createElement('div'); tint.className = 'tint'; tint.setAttribute('aria-hidden', 'true'); tint.appendChild(document.createElement('i')); s.insertBefore(tint, s.firstChild);
    var el = document.createElement('div'); el.className = 'seam'; el.setAttribute('aria-hidden', 'true');
    var core = function (k) { return '<i class="core ' + k + '"><b class="cu"></b><b class="tip"></b></i>'; };
    el.innerHTML = '<div class="rig"><div class="cg"><div class="jacket"><span class="print">' + PRINT + PRINT + PRINT + PRINT + '</span><i class="pulse"></i></div>' +
      core('k1') + core('k2') + core('k3') + '<div class="sleeve"><span class="print">' + PRINT + '</span></div><i class="score"></i></div>' +
      '<div class="term"><i class="glow"></i><span class="cell"><i class="lever"></i></span><span class="cell"><i class="lever"></i></span><span class="cell"><i class="lever"></i></span></div></div>';
    s.insertBefore(el, tint.nextSibling);
    el.querySelector('.glow').style.setProperty('--glow', GLOW[s.dataset.seam] || GLOW.br);
    seams.push({ sec: s, el: el, tint: tint.firstChild, cg: $('.cg', el), jacket: $('.jacket', el), sleeve: $('.sleeve', el), score: $('.score', el), pulse: $('.pulse', el),
      cores: $$('.core', el), tips: $$('.tip', el), cus: $$('.cu', el), term: $('.term', el), levers: $$('.lever', el), glow: $('.glow', el), k: null });
  });

  var vw = 0, vh = 0, G = {};
  var px = function (v) { return v.toFixed(1) + 'px'; };
  function layout() {
    vw = innerWidth; vh = innerHeight;
    if (!seams.length) return;
    var W = seams[0].el.clientWidth, c = seams[0].jacket.offsetHeight, mob = W < 700;
    var E = W * (mob ? 0.62 : 0.58), X = E - W * (mob ? 0.25 : 0.17), tipL = c * 0.95, gap = c * 0.55, termW = c * 1.25, P = W * (mob ? 0.4 : 0.3);
    G = { W: W, c: c, E: E, X: X, tipL: tipL, gap: gap, P: P, A: gap + tipL * 0.82, jw: X + P + 40 };
    seams.forEach(function (s) {
      s.jacket.style.left = px(-P - 40); s.jacket.style.width = px(G.jw);
      s.sleeve.style.left = px(X); s.sleeve.style.width = px(E - X);
      s.score.style.left = px(X);
      s.cores.forEach(function (k) { k.style.left = px(X - c * 0.6); k.style.width = px(E - X + c * 0.6); });
      s.tips.forEach(function (t) { t.style.width = px(tipL); });
      s.cus.forEach(function (t) { t.style.width = px(tipL); });
      s.term.style.left = px(E + gap); s.term.style.width = px(termW);
      s.pulse.style.width = px(Math.max(160, W * 0.3));
      s.k = null;
    });
    tick();
  }
  var seg = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  var eo = function (t) { return 1 - Math.pow(1 - t, 3); };
  var eio = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  function paint(s, p) {
    var pull = 1 - eo(seg(p, 0, 0.2)), push = eio(seg(p, 0.6, 0.74));
    s.cg.style.transform = 'translate3d(' + px(-G.P * pull + G.A * push) + ',0,0)';
    s.score.style.opacity = (seg(p, 0.17, 0.26) * (1 - seg(p, 0.42, 0.5))).toFixed(3);
    var k = eio(seg(p, 0.26, 0.5));
    s.sleeve.style.transform = 'translate3d(' + px(k * G.W * 0.42) + ',0,0)';
    s.sleeve.style.opacity = (1 - seg(k, 0.55, 1)).toFixed(3);
    s.tips.forEach(function (t, i) {
      var q = eio(seg(p, 0.46 + i * 0.035, 0.58 + i * 0.035));
      t.style.transform = 'translate3d(' + px(q * G.tipL * 2.4) + ',0,0)';
      t.style.opacity = (1 - seg(q, 0.35, 1)).toFixed(3);
    });
    s.levers.forEach(function (l, i) {
      var q = eo(seg(p, 0.73 + i * 0.03, 0.81 + i * 0.03));
      l.style.transform = 'scaleX(' + (0.42 + 0.58 * q).toFixed(3) + ')';
      l.style.setProperty('--lift', (1 - q).toFixed(3));
    });
    var tk = eo(seg(p, 0.46, 0.6));
    s.term.style.transform = 'translate3d(0,' + px((1 - tk) * G.c * 1.3) + ',0)';
    s.term.style.opacity = tk.toFixed(3);
    var pw = seg(p, 0.84, 1);
    s.glow.style.opacity = (eo(pw) * 0.5).toFixed(3);
    s.pulse.style.transform = 'translate3d(' + px(-G.W * 0.35 + (G.jw + G.W * 0.35) * pw) + ',0,0)';
    s.pulse.style.opacity = (Math.sin(Math.PI * pw) * 0.9).toFixed(3);
    s.tint.style.transform = 'translate3d(0,' + (-100 * (1 - eio(seg(p, 0.8, 1)))).toFixed(2) + '%,0)';
  }
  var heroImg = $('.porthole img'), ring = $('[data-ring]'), hero = $('.hero');
  function tick() {
    var off = still();
    var tops = seams.map(function (s) { return s.sec.getBoundingClientRect().top; });   // read everything, then write
    seams.forEach(function (s, i) {
      var t = tops[i], p = off ? 1 : clamp((vh - t) / (vh * 0.62), 0, 1);
      if (!off && (t > vh * 1.6 || t < -vh * 0.8)) p = t > 0 ? 0 : 1;
      var key = p.toFixed(4); if (key === s.k) return; s.k = key;
      paint(s, p);
    });
    var y = scrollY;
    if (off) { heroImg.style.transform = ''; ring.style.transform = ''; }
    else if (y < vh * 1.2) { heroImg.style.transform = 'translate3d(0,' + px(y * 0.08) + ',0) scale(1.04)'; ring.style.transform = 'rotate(' + (-y * 0.04).toFixed(2) + 'deg)'; }
    pill.classList.toggle('up', y > 24);
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); } }, { passive: true });
  var rT = 0; addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(layout, 120); });

  ringText(); hours(); write(); layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ringText(); layout(); });
  window.__seam = { tick: tick, layout: layout, seams: seams, G: function () { return G; } };
})();
