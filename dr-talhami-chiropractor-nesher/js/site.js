(function () {
  var root = document.documentElement, WA = '972528676787', MAIL = 'doctortalhami@gmail.com';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 760; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';
  var TITLE = { he: 'ד״ר חוסאם תלחמי · כירופרקטור · דרך בר יהודה 147, נשר', en: 'Dr. Husam Talhami · Chiropractor · 147 Bar Yehuda Rd, Nesher' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור ד״ר חוסאם תלחמי · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Dr. Husam Talhami · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'ד״ר תלחמי, לראש העמוד', 'Dr. Talhami, back to top');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-wa]', 'וואטסאפ לקליניקה', 'WhatsApp the clinic');
    aria('[data-t-mail]', 'מייל לקליניקה', 'Email the clinic');
    aria('[data-t-for]', 'בשביל מי', 'Who is it for');
    aria('[data-t-more]', 'עוד ביקורות', 'More reviews');
    aria('.rv-stars', '5 כוכבים', '5 stars');
    $('[data-t-map]').setAttribute('title', l === 'he' ? 'מפת הגעה לקליניקה' : 'Map to the clinic');
    $('[data-talkmail]').href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(l === 'he' ? 'הזמנת הרצאה' : 'Lecture request');
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('tl-lang', l); } catch (e) {}
    texts(l); hours(); write(true); scanLabel(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('tl-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-odo]').forEach(function (o) { o._done = true; roll(o, true); });
    film(); layout(); scan.kick(); dots.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours: the listing gives none, so the clinic is shown as "by appointment".
  // H can hold real hours later: { 0: [9, 12], 1: [[9, 12], [15.5, 19]] ... , 6: null } (null = closed); '24/7' for always open.
  var H = null;
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  var spans = function (t) { return !t ? [] : typeof t[0] === 'number' ? [t] : t; };
  function status() {
    var l = he(), txt, open = false, n = now();
    if (!H) txt = l ? 'קבלת קהל בתיאום מראש' : 'Visits by appointment';
    else if (H === '24/7') { open = true; txt = l ? 'פתוח 24/7' : 'Open 24/7'; }
    else {
      var cur = spans(H[n.d]).filter(function (s) { return n.h >= s[0] && n.h < s[1]; })[0];
      var later = spans(H[n.d]).filter(function (s) { return n.h < s[0]; })[0];
      if (cur) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(cur[1]) : 'Open now · until ' + hhmm(cur[1]); }
      else if (later) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(later[0]) : 'Closed now · opens today at ' + hhmm(later[0]);
      else {
        var nd = (n.d + 1) % 7, k = 0; while (!spans(H[nd]).length && k++ < 7) nd = (nd + 1) % 7;
        var f = spans(H[nd])[0];
        txt = !f ? (l ? 'סגור עכשיו' : 'Closed now') : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(f[0]) : 'Closed now · opens tomorrow at ' + hhmm(f[0])) : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(f[0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(f[0]));
      }
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  function hours() {
    var l = he(), t = $('[data-hours]');
    if (!H || H === '24/7') {
      t.innerHTML = !H ? '<tr><td>' + (l ? 'שעות' : 'Hours') + '</td><td>' + (l ? 'בתיאום טלפוני מראש' : 'Arranged by phone') + '</td></tr>' : '<tr><td>' + (l ? 'כל יום' : 'Every day') + '</td><td>24/7</td></tr>';
      status(); return;
    }
    var names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    t.innerHTML = rows.map(function (r) {
      var days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = spans(H[r[0]]).length ? '<span dir="ltr">' + spans(H[r[0]]).map(function (s) { return hhmm(s[0]) + '–' + hhmm(s[1]); }).join(', ') + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-letter]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- the name: two halves of each letter slide shut like a seam
  $$('[data-seam]').forEach(function (n) { var t = n.textContent; n.innerHTML = '<span class="sm sm-a">' + t + '</span><span class="sm sm-b" aria-hidden="true">' + t + '</span>'; });

  // statement: fills in letter by letter as you read down
  var fillEls = $$('[data-fill] > span[lang]');
  fillEls.forEach(function (sp) {
    var i = 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span style="white-space:nowrap">' + w.split('').map(function (c) { return '<span class="c" data-i="' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
    sp._c = $$('.c', sp);
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), filmEl = $('[data-film]'), filmIn = $('[data-filmin]'), video = $('[data-video]'), doctor = $('[data-doctor]');

  // ---------------------------------------------------------------- the film: plays while it is seen; light and parallax follow the hand
  var heroSeen = true;
  function film() {
    if (!video) return;
    if (still() || !heroSeen) { video.pause(); if (still()) { try { video.currentTime = 0; } catch (e) {} } }
    else { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
  }
  watch(hero, function (v) { heroSeen = v; film(); });
  var px = .6, py = .35, tpx = .6, tpy = .35;
  filmEl.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = filmEl.getBoundingClientRect(); tpx = (e.clientX - r.left) / r.width; tpy = (e.clientY - r.top) / r.height; });
  var filmRaf = 0;
  function filmLoop(t) {
    filmRaf = 0; if (still() || !heroSeen) return;
    if (!fine) { tpx = .55 + Math.sin(t / 2600) * .22; tpy = .35 + Math.cos(t / 3400) * .14; }
    px = lerp(px, tpx, .06); py = lerp(py, tpy, .06);
    filmEl.style.setProperty('--lx', (px * 100).toFixed(1) + '%'); filmEl.style.setProperty('--ly', (py * 100).toFixed(1) + '%');
    filmIn.style.transform = 'translate3d(' + ((.5 - px) * 2.2).toFixed(2) + '%,' + ((.5 - py) * 1.6).toFixed(2) + '%,0)';
    filmRaf = requestAnimationFrame(filmLoop);
  }
  function kickFilm() { if (!filmRaf) filmRaf = requestAnimationFrame(filmLoop); }

  // callouts that type themselves onto the film
  function typeTags() {
    $$('.tag').forEach(function (tg, k) {
      var b = $('b', tg), txt = tg.dataset[he() ? 'he' : 'en'];
      clearInterval(tg._t);
      if (still()) { b.textContent = txt; tg.classList.add('on'); return; }
      setTimeout(function () {
        tg.classList.add('on'); var i = 0; b.textContent = '';
        tg._t = setInterval(function () { b.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(tg._t); }, 30);
      }, 500 + k * 450);
    });
  }

  // ---------------------------------------------------------------- opening: frames dealt like cards, the last one opens into the film
  var deal = $('[data-deal]');
  function ready() { hero.classList.add('ready'); typeTags(); kickFilm(); film(); }
  function openingRun() {
    var seen = false; try { seen = sessionStorage.getItem('tl-dealt') === '1'; } catch (e) {}
    if (still() || seen || !deal) { if (deal) deal.classList.add('done'); requestAnimationFrame(ready); return; }
    try { sessionStorage.setItem('tl-dealt', '1'); } catch (e) {}
    var cards = $$('.dc', deal), n = cards.length, skip = false;
    cards.forEach(function (c, i) {
      var k = i - (n - 1) / 2;
      c.style.setProperty('--i', i); c.style.setProperty('--tx', (k * Math.min(70, innerWidth * .1)).toFixed(0) + 'px');
      c.style.setProperty('--ty', (Math.abs(k) * 12 + 30).toFixed(0) + 'px'); c.style.setProperty('--rot', (i === n - 1 ? 0 : k * 6) + 'deg');
    });
    deal.classList.add('go');
    function open() {
      if (skip) return; skip = true;
      var last = cards[n - 1], r = last.getBoundingClientRect(), f = filmEl.getBoundingClientRect();
      var s = Math.max(f.width / r.width, f.height / r.height) * 1.04;
      var dx = (f.left + f.width / 2) - (r.left + r.width / 2), dy = (f.top + f.height / 2) - (r.top + r.height / 2);
      last.style.animation = 'none'; last.style.opacity = 1;
      last.style.transform = 'translate(var(--tx),var(--ty))';
      deal.classList.add('open');
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        last.style.transform = 'translate(' + (parseFloat(last.style.getPropertyValue('--tx')) + dx) + 'px,' + (parseFloat(last.style.getPropertyValue('--ty')) + dy) + 'px) scale(' + s.toFixed(3) + ')';
        last.style.borderRadius = '0'; last.style.opacity = 0;
      }); });
      setTimeout(ready, 300);
      setTimeout(function () { deal.classList.add('done'); }, 950);
    }
    setTimeout(open, 820);
    deal.style.pointerEvents = 'auto'; deal.addEventListener('click', open);
  }

  // ---------------------------------------------------------------- portrait: leans toward the hand (on phones, with the scroll)
  var portrait = $('[data-tilt]');
  if (fine) {
    portrait.addEventListener('pointermove', function (e) { if (still()) return; var r = portrait.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; portrait.style.setProperty('--ry', ((x - .5) * 10).toFixed(2) + 'deg'); portrait.style.setProperty('--rx', ((.5 - y) * 8).toFixed(2) + 'deg'); portrait.style.setProperty('--sx', (x * 100) + '%'); portrait.style.setProperty('--sy', (y * 100) + '%'); });
    portrait.addEventListener('pointerleave', function () { portrait.style.setProperty('--rx', '0deg'); portrait.style.setProperty('--ry', '0deg'); });
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
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 120) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    o._done = still();
  });

  // ---------------------------------------------------------------- care tiles: spotlight under the hand; on phones it wanders by itself
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  // the side view of a spine in the posture tile: vertebrae on their natural curves, discs between, a plumb line
  (function () {
    var s = $('[data-spine]'), out = '<line class="plumb" x1="60" y1="0" x2="60" y2="260"/><g class="col">';
    for (var i = 0; i < 22; i++) {
      var t = i / 21, x = 60 + Math.sin(t * Math.PI * 2.1 + .3) * 14, y = 8 + t * 236, w = 16 + t * 14, h = 7 + t * 3;
      out += '<rect class="vb" x="' + (x - w / 2).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="3"/>';
      if (i < 21) out += '<rect class="ds" x="' + (x - w / 2 + 3).toFixed(1) + '" y="' + (y + h + .6).toFixed(1) + '" width="' + (w - 6).toFixed(1) + '" height="2.2" rx="1"/>';
    }
    s.innerHTML = out + '</g>';
  })();

  // ---------------------------------------------------------------- first visit: the scan screen
  var first = $('[data-first]'), steps = $$('[data-step]'), mode = 0;
  var LABELS = { he: ['שאלון', 'בדיקה ידנית', 'סריקה ממוחשבת', 'תוכנית אישית'], en: ['Questionnaire', 'Hands-on check', 'Computerised scan', 'Personal plan'] };
  function scanLabel() { var el = $('[data-scanlabel]'); el.textContent = LABELS[he() ? 'he' : 'en'][mode]; el.lang = he() ? 'he' : 'en'; }
  var scan = (function () {
    var cv = $('[data-scancv]'), c = cv.getContext('2d'), w, h, raf = 0, vis = false, t0 = performance.now(), modeAt = 0, lastMode = -1;
    var SEG = []; ['C', 7, 'T', 12, 'L', 5].forEach(function (v, i, a) { if (i % 2) for (var k = 1; k <= v; k++) SEG.push(a[i - 1] + k); }); SEG.push('S');
    var base = SEG.map(function (s, i) { return .35 + .5 * Math.abs(Math.sin(i * 1.7 + .4)) * (i % 5 === 2 ? 1.2 : .8); });
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function col(v) { return v > .75 ? '#e2c06a' : v > .5 ? '#a9d34f' : '#8cbbe6'; }
    function draw(t) {
      var T = (t - t0) / 1000, mt = still() ? 9 : (t - modeAt) / 1000, n = SEG.length, top = 22, bot = h - (mode === 3 ? 62 : 22), sh = (bot - top) / n, cx = w / 2;
      c.clearRect(0, 0, w, h);
      c.font = '500 11px "IBM Plex Sans Hebrew", Arial'; c.textBaseline = 'middle';
      var scanY = top + ((mt * .35) % 1) * (bot - top), marker = top + clamp(mt / 3.2, 0, 1) * (bot - top);
      for (var i = 0; i < n; i++) {
        var y = top + i * sh + sh / 2, appear = mode === 0 ? clamp(mt * 9 - i * .9, 0, 1) : 1;
        if (appear <= 0) continue;
        var vw = 18 + (i / n) * 14, hit = mode === 1 && Math.abs(y - marker) < sh * 1.5;
        c.globalAlpha = appear;
        c.fillStyle = hit ? '#a9d34f' : 'rgba(214,205,196,.85)';
        c.beginPath(); c.roundRect ? c.roundRect(cx - vw / 2, y - sh * .36, vw, sh * .72, 3) : c.rect(cx - vw / 2, y - sh * .36, vw, sh * .72); c.fill();
        c.fillStyle = 'rgba(196,212,228,.7)'; c.textAlign = 'center'; c.fillText(SEG[i], cx - vw / 2 - 40, y);
        if (mode >= 2) {
          var grow = mode === 2 ? clamp((mt * 1.2) - i * .04, 0, 1) : 1;
          var wob = still() ? 0 : Math.sin(T * 2 + i) * .05;
          var vl = clamp(base[i] + wob, .1, 1), vr = clamp(base[(i + 7) % n] - wob, .1, 1), maxL = w * .3;
          c.fillStyle = col(vl); c.fillRect(cx - vw / 2 - 6 - vl * maxL * grow, y - sh * .25, vl * maxL * grow, sh * .5);
          c.fillStyle = col(vr); c.fillRect(cx + vw / 2 + 6, y - sh * .25, vr * maxL * grow, sh * .5);
        }
      }
      c.globalAlpha = 1;
      if (mode === 1) { c.fillStyle = 'rgba(169,211,79,.25)'; c.beginPath(); c.arc(cx, marker, 22, 0, 6.29); c.fill(); c.strokeStyle = '#a9d34f'; c.lineWidth = 2; c.beginPath(); c.arc(cx, marker, 22, 0, 6.29); c.stroke(); }
      if (mode === 2 && !still()) { c.fillStyle = 'rgba(169,211,79,.9)'; c.fillRect(16, scanY, w - 32, 2); }
      if (mode === 0) {
        var q = he() ? ['מה כואב?', 'ממתי?', 'מה כבר ניסיתם?'] : ['What hurts?', 'Since when?', 'What have you tried?'];
        c.font = '500 15px "IBM Plex Sans Hebrew", Arial'; c.textAlign = rtl() ? 'right' : 'left';
        q.forEach(function (s, k) { var a = clamp(mt * 1.5 - k * .6, 0, 1); if (!a) return; c.globalAlpha = a; c.fillStyle = '#e8e1d9'; var x = rtl() ? w - 20 : 20; c.fillText(s.slice(0, Math.ceil(s.length * clamp(mt * 1.5 - k * .6, 0, 1))), x, 40 + k * 30); });
        c.globalAlpha = 1;
      }
      if (mode === 3) {
        var k2 = 10, gap = (w - 40) / k2; c.textAlign = 'center';
        for (var j = 0; j < k2; j++) { var a2 = still() ? 1 : clamp(mt * 4 - j * .35, 0, 1); c.globalAlpha = a2; c.fillStyle = j < 3 ? '#a9d34f' : 'rgba(140,187,230,.5)'; c.beginPath(); c.arc(20 + gap * (rtl() ? k2 - 1 - j : j) + gap / 2, h - 30, 7, 0, 6.29); c.fill(); }
        c.globalAlpha = 1;
      }
    }
    function frame(t) { raf = 0; draw(t); if (vis && !still()) raf = requestAnimationFrame(frame); }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    watch(first, function (v) { vis = v; kick(); });
    return { size: function () { size(); kick(); }, kick: kick, setMode: function (m) { if (m === lastMode) return; lastMode = m; mode = m; modeAt = performance.now(); scanLabel(); kick(); } };
  })();

  // ---------------------------------------------------------------- reviews: the drifting row needs two copies to loop
  var drift = $('[data-drift]');
  $$('p', drift).forEach(function (p) { var k = p.cloneNode(true); k.setAttribute('aria-hidden', 'true'); drift.appendChild(k); });

  // ---------------------------------------------------------------- the composer: tap where it hurts, the message writes itself
  var zones = $$('[data-zone]'), fors = $$('[data-for]'), msgEl = $('[data-msg]'), shown = '', typing = 0, seen = false;
  zones.forEach(function (z) { z.addEventListener('click', function () { z.setAttribute('aria-pressed', z.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); write(); }); });
  fors.forEach(function (b) { b.addEventListener('click', function () { fors.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write(); }); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = zones.filter(function (z) { return z.getAttribute('aria-pressed') === 'true'; }).map(function (z) { return z.dataset[l ? 'he' : 'en']; });
    var who = fors.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0].dataset.for;
    if (l) return { he: 1, t: 'שלום ד״ר תלחמי, אשמח לקבוע ייעוץ ראשון' + (who === 'child' ? ' לילד שלי' : who === 'baby' ? ' לתינוק שלי' : '') + '.' + (picked.length ? ' האזור שמטריד: ' + list(picked, true) + '.' : '') + ' מתי אפשר להגיע?' };
    return { t: 'Hello Dr. Talhami, I’d like to book a first consultation' + (who === 'child' ? ' for my child' : who === 'baby' ? ' for my baby' : '') + '.' + (picked.length ? ' The area of concern: ' + list(picked, false) + '.' : '') + ' When could I come in?' };
  }
  function write(instant) {
    var target = compose().t;
    $('[data-send-wa]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    $('[data-send-mail]').href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(he() ? 'בקשה לייעוץ ראשון' : 'First consultation request') + '&body=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !seen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 14);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-letter]'), function (v) { if (v && !seen) { seen = true; if (still()) return; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .5 });

  // ---------------------------------------------------------------- footer: the real logo, turned into particles that gather over the green arc
  var foot = $('[data-foot]'), mainEl = $('main');
  var dots = (function () {
    var cv = $('[data-fdots]'), c = cv.getContext('2d'), img = new Image(), P = [], ok = false, w, h, raf = 0, vis = false, mx = -999, my = -999, fp = 0, pulses = [];
    img.src = 'img/logo.png';
    function sample() {
      try {
        var sc = document.createElement('canvas'), iw = 468, ih = 144; sc.width = iw; sc.height = ih;
        var x2 = sc.getContext('2d'); x2.drawImage(img, 0, 0, iw, ih);
        var d = x2.getImageData(0, 0, iw, ih).data, pts = [];
        for (var y = 0; y < ih; y += 2) for (var x = 0; x < iw; x += 2) { var k = (y * iw + x) * 4; if (d[k + 3] > 140) pts.push([x / iw, y / ih, d[k + 1] > d[k + 2] + 20 ? '#b4dc5a' : '#9cc6ee']); }
        var want = phone() ? 1300 : 2600, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) { var q = pts[Math.floor(f)]; P.push({ hx: q[0], hy: q[1], col: q[2], x: Math.random(), y: Math.random(), vx: 0, vy: 0, ph: Math.random() * 6.28, dl: Math.random() * .35, sx: Math.random(), sy: Math.random() }); }
        ok = true;
      } catch (e) { ok = false; }
    }
    var gapTop = 0, gapBot = 0;
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = foot.clientWidth; h = foot.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); var fc = $('.f-cols'), fmk = $('.f-mark'); gapTop = fc.offsetTop + fc.offsetHeight; gapBot = fmk.offsetTop; }
    function frame(t) {
      raf = 0; if (!ok) return;
      var calm = still(), T = t / 1000, bw = Math.min(w * (phone() ? .86 : .5), 720), bh = bw * 144 / 468, ox = (w - bw) / 2, oy = (gapTop + gapBot) / 2 - bh / 2;
      pulses = pulses.filter(function (p) { return t - p.t < 1300; });
      c.clearRect(0, 0, w, h);
      var sz = phone() ? 1.8 : 2.2;
      for (var i = 0; i < P.length; i++) {
        var p = P[i], a = calm ? 1 : smooth((fp - p.dl) / .55);
        var tx = ox + p.hx * bw + (calm ? 0 : Math.sin(T * 1.2 + p.ph) * 1.2), ty = oy + p.hy * bh + (calm ? 0 : Math.cos(T + p.ph) * 1.2);
        var bx = lerp(p.sx * w, tx, a), by = lerp(p.sy * h, ty, a);
        if (calm) { p.x = tx; p.y = ty; }
        else if (a < 1) { p.x = bx; p.y = by; p.vx = p.vy = 0; }
        else {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 9000) { var f = (9000 - d2) / 9000 * 2.4, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
          p.vx += (tx - p.x) * .06; p.vy += (ty - p.y) * .06; p.vx *= .82; p.vy *= .82; p.x += p.vx; p.y += p.vy;
        }
        var glow = 0;
        for (var k = 0; k < pulses.length; k++) { var pu = pulses[k], r = (t - pu.t) * .3, ex = p.x - pu.x, ey = p.y - pu.y; if (Math.abs(Math.sqrt(ex * ex + ey * ey) - r) < 10) glow = 1; }
        c.globalAlpha = glow ? 1 : .75 * (calm ? 1 : .3 + .7 * a);
        c.fillStyle = glow ? '#ffffff' : p.col;
        c.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
      }
      c.globalAlpha = 1;
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    foot.addEventListener('pointermove', function (e) { var r = foot.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    foot.addEventListener('pointerleave', function () { mx = my = -999; });
    foot.addEventListener('pointerdown', function (e) { var r = foot.getBoundingClientRect(); pulses.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }); kick(); });
    watch(foot, function (v) { vis = v; kick(); });
    function start() { size(); sample(); kick(); }
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    setInterval(function () { if (vis && !still() && ok && P.length && fp > .8) { var q = P[Math.floor(Math.random() * P.length)]; pulses.push({ x: q.x, y: q.y, t: performance.now() }); } }, 1600);
    return { kick: kick, size: function () { if (ok) { size(); kick(); } }, setP: function (v) { fp = v; } };
  })();

  // footer wordmark: one letter at a time
  $$('[data-fm]').forEach(function (fm) { fm.innerHTML = fm.textContent.split('').map(function (ch) { return '<span class="l">' + (ch === ' ' ? '&nbsp;' : ch) + '</span>'; }).join(''); fm._l = $$('.l', fm); });

  // ---------------------------------------------------------------- fitting big type to its width
  function fit(el, box, max) {
    if (!el || !el.offsetParent) return;
    el.style.fontSize = '100px';
    var wd = el.scrollWidth || el.getBoundingClientRect().width, avail = box.clientWidth - parseFloat(getComputedStyle(box).paddingLeft) - parseFloat(getComputedStyle(box).paddingRight);
    el.style.fontSize = Math.min(max, Math.floor(100 * avail / wd * .985)) + 'px';
  }
  function fitAll() {
    var band = $('.band'), nm = $('.name-in[lang="' + root.lang + '"]');
    var name = $('.name');
    if (phone()) {
      // two lines on a phone: fit the longer line
      name.style.fontSize = '';
      var words = $('.sm-a', nm).textContent.trim().split(' '), l1 = words.slice(0, words.length - 1).join(' '), probe = document.createElement('span');
      probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:700 100px/1 ' + getComputedStyle(name).fontFamily + ';letter-spacing:-.035em';
      probe.textContent = l1.length > words[words.length - 1].length ? l1 : words[words.length - 1]; document.body.appendChild(probe);
      var avail = band.clientWidth - 2 * parseFloat(getComputedStyle(band).paddingLeft);
      name.style.fontSize = Math.floor(100 * avail / probe.getBoundingClientRect().width * .97) + 'px'; probe.remove();
    } else { name.style.fontSize = '100px'; var r = nm.scrollWidth; var avail2 = band.clientWidth - 2 * parseFloat(getComputedStyle(band).paddingLeft); name.style.fontSize = Math.min(innerHeight * .24, Math.floor(100 * avail2 / r * .98)) + 'px'; }
    var fmEl = $('.fm[lang="' + root.lang + '"]'), fmBox = $('.f-mark');
    fmBox.style.fontSize = '100px'; var fw = fmEl.scrollWidth; fmBox.style.fontSize = Math.floor(100 * (foot.clientWidth - 2 * parseFloat(getComputedStyle(foot).paddingLeft)) / fw * .98) + 'px';
  }

  // ---------------------------------------------------------------- inside the clinic: from a curve to a straight line
  var clinic = $('[data-clinic]'), track = $('[data-track]'), vcs = $$('.vc', track), cpath = $('[data-cpath]'), cline = $('[data-cline]'), cbar = $('[data-cbar]'), discs = [];
  vcs.forEach(function (v, i) { if (i < vcs.length - 1) { var e = document.createElementNS(NS, 'ellipse'); e.setAttribute('class', 'disc'); e.setAttribute('rx', 9); e.setAttribute('ry', 5); cline.appendChild(e); discs.push(e); } });
  var CL = {};
  function clinicLayout() {
    CL.w = track.clientWidth; CL.h = track.clientHeight;
    CL.cw = phone() ? Math.min(innerWidth * .68, 320) : innerWidth < 1000 ? innerWidth * .46 : clamp(Math.min(innerWidth * .3, (CL.h - 60) * 1.2), 240, 560);
    CL.gap = CL.cw * .2; CL.ch = CL.cw * 2 / 3;
    CL.start = phone() ? innerWidth * .12 : innerWidth * .06;
    CL.total = CL.start * 2 + vcs.length * CL.cw + (vcs.length - 1) * CL.gap;
    vcs.forEach(function (v) { v.style.setProperty('--cw', CL.cw + 'px'); });
  }
  function clinicUpdate(p) {
    if (still()) return;
    var a = smooth(p / .32), sp = smooth((p - .3) / .68), shift = Math.max(0, CL.total - CL.w) * sp, n = vcs.length;
    var A = Math.min(CL.h * .2, 130) * (1 - a), cy0 = CL.h * .44 - CL.ch / 2, pts = [];
    vcs.forEach(function (v, i) {
      var u = i / (n - 1), ph = u * Math.PI * 1.9 + .5, x = CL.start + i * (CL.cw + CL.gap) - shift;
      if (rtl()) x = CL.w - x - CL.cw;
      var y = cy0 + Math.sin(ph) * A, rot = Math.cos(ph) * 9 * (1 - a) * (rtl() ? -1 : 1);
      v.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + rot.toFixed(2) + 'deg)';
      pts.push([x + CL.cw / 2, y + CL.ch / 2]);
    });
    var d = 'M' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) { var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; d += ' C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ',' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ',' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1); }
    cpath.setAttribute('d', d);
    discs.forEach(function (e, i) { var mx2 = (pts[i][0] + pts[i + 1][0]) / 2, my2 = (pts[i][1] + pts[i + 1][1]) / 2, ang = Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]) * 180 / Math.PI + 90; e.setAttribute('cx', mx2.toFixed(1)); e.setAttribute('cy', my2.toFixed(1)); e.setAttribute('transform', 'rotate(' + ang.toFixed(1) + ' ' + mx2.toFixed(1) + ' ' + my2.toFixed(1) + ')'); });
    cbar.parentNode.style.setProperty('--cp', p.toFixed(3));
  }

  // ---------------------------------------------------------------- the book's keyhole
  var book = $('[data-book]'), bkImg = $('[data-book-img]'), kh = $('[data-keyhole]'), khPath = $('[data-khpath]'), khImg = $('[data-khimg]'), bkOpen = $('[data-bkopen]'), bkCover = $('.bk-cover');
  function bookUpdate(p) {
    if (still()) { kh.style.opacity = ''; bkCover.style.opacity = ''; bkOpen.style.opacity = ''; return; }
    var W = innerWidth, Hh = innerHeight, g = smooth((p - .12) / .48);
    kh.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh); khImg.setAttribute('width', W); khImg.setAttribute('height', Hh);
    var r = bkImg.getBoundingClientRect(), sx = r.left + r.width * .745, sy = r.top + r.height * .57, s0 = (r.height * .36) / 120, s1 = Math.sqrt(W * W + Hh * Hh) / 2 / 30 * 1.15;
    var s = s0 * Math.pow(s1 / s0, g), x = lerp(sx, W / 2, smooth(g * 1.4)), y = lerp(sy, Hh / 2 + 30 * s, smooth(g * 1.4));
    khPath.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + s.toFixed(4) + ')');
    kh.style.opacity = p > .1 ? 1 : 0;
    bkImg.style.setProperty('--bs', (1 + g * .25).toFixed(3)); bkImg.style.setProperty('--br', lerp(-3, 0, g).toFixed(2) + 'deg');
    bkCover.style.opacity = (1 - smooth((g - .1) / .3)).toFixed(3);
    var o = smooth((p - .62) / .14); bkOpen.style.opacity = o.toFixed(3); bkOpen.classList.toggle('show', o > .5);
  }

  // ---------------------------------------------------------------- contact: the photo shrinks into its frame
  var contact = $('[data-contact]'), ctPhoto = $('[data-ctphoto]'), ctCards = $('[data-ctcards]');
  function contactUpdate(p) {
    if (still() || innerWidth <= 860) { ['--pt', '--pr', '--pb', '--pl', '--prr', '--ix'].forEach(function (k) { ctPhoto.style.removeProperty(k); }); ctCards.style.removeProperty('--co'); ctCards.style.removeProperty('--cy'); ctCards.style.pointerEvents = ''; return; }
    var W = ctPhoto.clientWidth, s = smooth(p / .45), near = W * .55, far = clamp(W * .03, 16, 44);
    ctPhoto.style.setProperty('--pt', (96 * s).toFixed(1) + 'px'); ctPhoto.style.setProperty('--pb', (40 * s).toFixed(1) + 'px');
    ctPhoto.style.setProperty('--pl', ((rtl() ? far : near) * s).toFixed(1) + 'px'); ctPhoto.style.setProperty('--pr', ((rtl() ? near : far) * s).toFixed(1) + 'px');
    ctPhoto.style.setProperty('--prr', (28 * s).toFixed(1) + 'px');
    ctPhoto.style.setProperty('--ix', ((rtl() ? -.36 : .12) * W * s).toFixed(1) + 'px');
    var co = smooth((s - .8) / .2); ctCards.style.setProperty('--co', co.toFixed(3)); ctCards.style.setProperty('--cy', ((1 - co) * 30).toFixed(1) + 'px'); ctCards.style.pointerEvents = co > .5 ? '' : 'none';
  }

  // ---------------------------------------------------------------- one scroll loop
  var figures = $('[data-figures]'), slit = $('[data-slit]'), reviews = $('[data-reviews]'), rvs = $$('[data-rv]'), RR = [-5, 4, -3], dock = $('[data-dock]'), care = $('[data-care]');
  var odos = $$('[data-odo]');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    odos.forEach(function (o) { if (o._done) return; var r = o.getBoundingClientRect(); if (r.top < vh * .92 && r.bottom > 0) { o._done = true; roll(o, true); } });
    // hero: the doctor's section rides up over the film; the film steps back
    var dt = doctor.getBoundingClientRect().top, k = calm ? 0 : clamp(1 - dt / vh, 0, 1);
    hero.style.transform = k ? 'scale(' + (1 - k * .06).toFixed(4) + ')' : '';
    hero.style.filter = k ? 'brightness(' + (1 - k * .55).toFixed(3) + ')' : '';
    if (!calm) kickFilm();
    // statement fill
    fillEls.forEach(function (sp) {
      if (!sp._c || !sp.offsetParent) return;
      var r = sp.getBoundingClientRect(), p = calm ? 1 : clamp((vh * .9 - r.top) / (r.height + vh * .45), 0, 1), n = sp._c.length;
      sp._c.forEach(function (c, i) { var o = clamp(p * 1.25 * n - i, 0, 6) / 6; c.style.setProperty('--o', (.22 + .78 * o).toFixed(3)); });
    });
    // figures: the photo opens out of a scan line
    var fr = figures.getBoundingClientRect(), e = calm ? 1 : smooth((vh - fr.top) / (vh * .85)), fh = slit.clientHeight;
    slit.style.setProperty('--slit', ((1 - e) * 50).toFixed(2) + '%');
    slit.style.setProperty('--sy', ((1 - e) * .5 * fh - .5 * fh).toFixed(1) + 'px');
    slit.style.setProperty('--so', calm ? 0 : clamp((1 - e) * 5, 0, 1).toFixed(3));
    slit.style.setProperty('--fz', (1.14 - .14 * e).toFixed(4));
    // clinic
    clinicUpdate(prog(clinic));
    // care spotlight wanders on touch screens
    if (!fine && !calm) { var cr = care.getBoundingClientRect(); if (cr.top < vh && cr.bottom > 0) $$('.tile').forEach(function (t, i) { var tr = t.getBoundingClientRect(); t.style.setProperty('--mx', (tr.width * (.5 + .4 * Math.sin(scrollY / 140 + i))).toFixed(0) + 'px'); t.style.setProperty('--my', (tr.height * (.5 + .35 * Math.cos(scrollY / 170 + i))).toFixed(0) + 'px'); }); }
    // first visit: steps light up, the screen follows
    var fr2 = first.getBoundingClientRect(), fp2 = clamp((vh * .62 - fr2.top) / Math.max(1, fr2.height - vh * .25), 0, 1), m = calm ? 3 : Math.min(3, Math.floor(fp2 * 4.2));
    steps.forEach(function (s, i) { s.classList.toggle('on', calm || i <= m); });
    scan.setMode(m);
    // book
    bookUpdate(prog(book));
    // reviews arrive askew and settle into line
    var rr = reviews.getBoundingClientRect(), re = clamp((vh - rr.top) / (vh * .95), 0, 1);
    rvs.forEach(function (rv, i) {
      if (calm) { rv.style.transform = ''; return; }
      var t = smooth((re - .2 - i * .12) / .45);
      rv.style.transform = 'translateY(' + ((1 - t) * 110).toFixed(1) + 'px) rotate(' + ((1 - t) * RR[i]).toFixed(2) + 'deg)';
    });
    // contact
    contactUpdate(prog(contact));
    // footer: uncovered like a curtain
    var mb = mainEl.getBoundingClientRect().bottom, fpv = calm ? 1 : clamp((vh - mb) / (vh * .8), 0, 1);
    dots.setP(fpv); if (fpv > 0) dots.kick();
    $$('[data-fm]').forEach(function (fm) { if (!fm.offsetParent) return; fm._l.forEach(function (l, i) { var v = calm ? 1 : smooth(fpv * 1.6 - i * .06); l.style.setProperty('--ly', ((1 - v) * 90).toFixed(1) + '%'); l.style.setProperty('--lo', v.toFixed(3)); }); });
    foot.querySelector('.f-arc').style.setProperty('--rise', (-(1 - fpv) * 160).toFixed(1) + 'px');
    // phone dock steps aside where the contact cards already are
    var ct = contact.getBoundingClientRect();
    dock.classList.toggle('away', (ct.top < vh * .6 && ct.bottom > vh * .3) || fpv > .5);
  }

  function layout() { root.style.setProperty('--cbar', $('.concept').offsetHeight + 'px'); fitAll(); clinicLayout(); scan.size(); dots.size(); tick(); }
  var rz, lastW = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); lastW = innerWidth; }, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); scanLabel(); layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitAll(); tick(); });
  addEventListener('load', function () { layout(); });
  openingRun();
})();
