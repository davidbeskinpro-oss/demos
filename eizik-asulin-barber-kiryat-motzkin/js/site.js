(function () {
  var root = document.documentElement, WA = '972526730926';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'איציק אסולין · מספרה · שדרות משה גושן 81, קריית מוצקין', en: 'Eizik Asulin · Barbershop · 81 Moshe Goshen Blvd, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור איציק אסולין · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Eizik Asulin · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-hero]', 'שיער מסורק לאחור, פייד גבוה וזקן, מתמונות העסק', 'Slicked-back hair, a high fade and a beard, from the business’s photos');
    aria('[data-t-call]', 'התקשרו לאיציק, 052-673-0926', 'Call Eizik, 052-673-0926');
    aria('[data-t-wa]', 'וואטסאפ לאיציק', 'WhatsApp Eizik');
    aria('[data-rail-step="-1"]', 'התמונה הקודמת', 'Previous photo');
    aria('[data-rail-step="1"]', 'התמונה הבאה', 'Next photo');
    $$('.reviews .stars').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
    $$('[data-cap]').forEach(function (c) { c.textContent = c.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ia-lang', l); } catch (e) {}
    texts(l); hours(); fillSelects(); write(true); split(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('ia-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    layout(); kickAll(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9.25, 19.5], 1: [9.25, 19.5], 2: [9.25, 19.5], 3: [9.25, 20], 4: [9.25, 20], 5: [9.5, 15.5], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, date: +o.day }; }
  function statusText(n) {
    var l = he(), t = H[n.d];
    if (t && t[0] === 0 && t[1] === 24) return [true, l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'];
    if (t && n.h >= t[0] && n.h < t[1]) return [true, l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1])];
    if (t && n.h < t[0]) return [false, l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0])];
    var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
    if (!H[nd]) return [false, l ? 'סגור עכשיו' : 'Closed now'];
    if (nd === (n.d + 1) % 7) return [false, l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0])];
    return [false, l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0])];
  }
  var decoded = false;
  function status() {
    var n = window.__now || now(), s = statusText(n), l = he();
    $$('[data-status]').forEach(function (el) {
      el.classList.toggle('open', s[0]);
      if (el.hasAttribute('data-decode') && !decoded && !still()) { decode(el, s[1]); return; }
      el.innerHTML = '<span class="dot"></span>' + s[1];
    });
    decoded = true;
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
    var t = H[n.d];
    $('[data-today]').textContent = t ? (l ? 'היום: ' : 'Today: ') + hhmm(t[0]) + '–' + hhmm(t[1]) : (l ? 'היום סגור' : 'Closed today');
    $('[data-dname]').textContent = l ? 'יום ' + dayHe[n.d] : dayEn[n.d];
    $('[data-dnum]').textContent = n.date || '';
    // the clock on the tile shows Israel time
    var hr = (n.h % 12) * 30, mn = (n.h % 1) * 360;
    $('[data-hh]').style.transform = 'rotate(' + hr + 'deg)'; $('[data-mm]').style.transform = 'rotate(' + mn + 'deg)';
  }
  // the label decodes out of scrambled letters
  function decode(el, txt) {
    var pool = he() ? 'אבגדהוזחטיכלמנסעפצקרשת' : 'abcdefghijklmnopqrstuvwxyz', t0 = performance.now();
    (function st(t) {
      var k = Math.floor((t - t0) / 28), out = '';
      for (var i = 0; i < txt.length; i++) out += i < k || txt[i] === ' ' || /[\d:·–-]/.test(txt[i]) ? txt[i] : pool[Math.floor(Math.random() * pool.length)];
      el.innerHTML = '<span class="dot"></span>' + out;
      if (k < txt.length) requestAnimationFrame(st);
    })(t0);
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 30000);
  (function ticks() { var g = $('.clock .ticks'), s = ''; for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6; s += '<line x1="' + (60 + Math.sin(a) * 46) + '" y1="' + (60 - Math.cos(a) * 46) + '" x2="' + (60 + Math.sin(a) * (i % 3 ? 49 : 42)) + '" y2="' + (60 - Math.cos(a) * (i % 3 ? 49 : 42)) + '"/>'; } g.innerHTML = s; })();

  // ---------------------------------------------------------------- entrances
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  watch($('#station'), function (v) { $('#station').classList.toggle('on', v); });

  // ---------------------------------------------------------------- headline letter by letter
  function split() {
    $$('[data-split] .ln > span[lang]').forEach(function (sp) {
      if (!sp.dataset.raw) sp.dataset.raw = sp.textContent;
      var i = 0;
      sp.innerHTML = sp.dataset.raw.split(' ').map(function (w) { return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>'; }).join(' ');
    });
  }
  split();

  var hero = $('[data-hero]'), nav = $('[data-nav]'), heroVis = true;
  watch(hero, function (v) { heroVis = v; kickAll(); });

  // ---------------------------------------------------------------- the clipper pass: sharp only where the blade goes
  var pass = $('[data-pass]'), px = null, praf = 0, pt0 = performance.now();
  if (fine) {
    hero.addEventListener('pointermove', function (e) { var r = pass.getBoundingClientRect(); px = clamp((e.clientX - r.left) / r.width, 0, 1); kickPass(); });
    hero.addEventListener('pointerleave', function () { px = null; });
  }
  var cur = .5;
  function passFrame(t) {
    praf = 0; if (still()) return;
    var auto = .5 + Math.sin((t - pt0) / 1700) * .42, target = px === null ? auto : px;
    cur += (target - cur) * .12;
    pass.style.setProperty('--x', (cur * 100).toFixed(2) + '%');
    if (heroVis) praf = requestAnimationFrame(passFrame);
  }
  function kickPass() { if (!praf && !still()) praf = requestAnimationFrame(passFrame); }

  // ---------------------------------------------------------------- the signature seam: hair cut down to stubble, into the skin tone
  var stub = (function () {
    var cv = $('[data-stubble]'), c = cv.getContext('2d'), w = 0, h = 0, hairs = [];
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(w * h / (phone() ? 34 : 26)); hairs = [];
      for (var i = 0; i < n; i++) hairs.push({ x: Math.random() * w, u: Math.random(), r: Math.random(), a: -1.25 + (Math.random() - .5) * .5, len: 7 + Math.random() * 9 });
    }
    // p: 0 = long hair down to the bottom, 1 = cut to the skin line at the top
    function draw(p) {
      c.clearRect(0, 0, w, h);
      var L = h * (.08 - .3 * p), band = h * (.9 - .2 * p);   // solid hair above L, blend below it
      c.fillStyle = '#c39b7f'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#161413'; c.fillRect(0, 0, w, Math.max(0, L));
      c.strokeStyle = '#161413'; c.lineCap = 'round';
      c.beginPath(); c.lineWidth = phone() ? 1.3 : 1.5;
      for (var i = 0; i < hairs.length; i++) {
        var hr = hairs[i], y = L + hr.u * band;
        if (y > h + 4 || y < -10) continue;
        var dens = Math.pow(1 - hr.u, 1.6);              // fewer hairs lower down
        if (hr.r > dens * 1.15) continue;
        var ln = hr.len * (.18 + .82 * Math.pow(1 - hr.u, 1.3)) * (1 - .55 * p);   // shorter lower down and as the clipper passes
        c.moveTo(hr.x, y); c.lineTo(hr.x + Math.cos(hr.a) * ln * (rtl() ? -1 : 1), y + Math.sin(hr.a) * ln);
      }
      c.stroke();
      // stubble dots at the very end of the blend
      c.fillStyle = 'rgba(22,20,19,.55)';
      for (var k = 0; k < hairs.length; k += 3) { var q = hairs[k], yy = L + band + q.u * h * .25; if (yy < h && q.r < .35 * (1 - q.u)) c.fillRect(q.x, yy, 1.4, 1.4); }
    }
    return { size: size, draw: draw };
  })();

  // ---------------------------------------------------------------- the rail of his photos
  var work = $('[data-work]'), rail = $('[data-rail]'), rcs = $$('.rc', rail), railMax = 0;
  function railLayout() {
    if (still()) { work.style.height = ''; return; }
    railMax = Math.max(0, rail.scrollWidth - innerWidth);
    work.style.height = (innerHeight + railMax * 1.1) + 'px';
  }
  function capOn(rc, on) {
    var fc = $('figcaption', rc), txt = fc.dataset[root.lang];
    if (rc._on === on) return; rc._on = on; rc.classList.toggle('on', on);
    if (on && !still()) { var i = 0; clearInterval(rc._t); rc._t = setInterval(function () { i++; fc.textContent = txt.slice(0, i) + (i < txt.length ? '▍' : ''); if (i >= txt.length) clearInterval(rc._t); }, 32); }
    else fc.textContent = txt;
  }
  $$('[data-rail-step]').forEach(function (b) { b.addEventListener('click', function () {
    var d = +b.dataset.railStep * (rtl() ? -1 : 1) * (rcs[0].offsetWidth + 20);
    rail.scrollBy({ left: d, behavior: 'smooth' });
  }); });
  if (fine) rcs.forEach(function (rc) {
    rc.addEventListener('pointermove', function (e) { if (still()) return; var r = rc.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; rc.style.transform = 'perspective(900px) rotateY(' + (x * 8).toFixed(2) + 'deg) rotateX(' + (-y * 8).toFixed(2) + 'deg)'; });
    rc.addEventListener('pointerleave', function () { rc.style.transform = ''; });
  });

  // ---------------------------------------------------------------- the loupe
  var stage = $('[data-stage]'), loupe = $('[data-loupe]'), lens = $('i', loupe), mark = $('[data-mark]'), lp = null;
  // a path along the blend line of the photo (fractions of the photo), walked by the scroll on touch screens
  var PATH = [[.12, .42], [.35, .4], [.55, .42], [.75, .5], [.88, .62], [.84, .78]];
  function along(t) { t = clamp(t, 0, 1) * (PATH.length - 1); var i = Math.min(PATH.length - 2, Math.floor(t)), f = t - i; return [PATH[i][0] + (PATH[i + 1][0] - PATH[i][0]) * f, PATH[i][1] + (PATH[i + 1][1] - PATH[i][1]) * f]; }
  function placeLoupe(fx, fy) {
    var W = stage.clientWidth, Hh = stage.clientHeight, Z = 2.4, D = loupe.offsetWidth;
    loupe.style.setProperty('--lx', (fx * W) + 'px'); loupe.style.setProperty('--ly', (fy * Hh) + 'px');
    lens.style.backgroundSize = (W * Z) + 'px ' + (Hh * Z) + 'px';
    lens.style.backgroundPosition = (-(fx * W * Z) + D / 2 - 6) + 'px ' + (-(fy * Hh * Z) + D / 2 - 6) + 'px';
    mark.style.setProperty('--my', (fy * 100).toFixed(1) + '%');
  }
  if (fine) {
    stage.addEventListener('pointermove', function (e) { var r = stage.getBoundingClientRect(); lp = [clamp((e.clientX - r.left) / r.width, 0, 1), clamp((e.clientY - r.top) / r.height, 0, 1)]; placeLoupe(lp[0], lp[1]); });
    stage.addEventListener('pointerleave', function () { lp = null; tick(); });
  }

  // ---------------------------------------------------------------- odometer
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join(''); o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) { roll(o, still()); watch(o, function (v) { if (v) roll(o, true); }, { threshold: .4 }); });

  // ---------------------------------------------------------------- the booking sentence and the guard rack
  var svc = $('[data-svc]'), day = $('[data-day]'), part = $('[data-part]'), guards = $('[data-guards]'), rack = $('.rack', guards), msgEl = $('[data-msg]'), send = $('[data-send]');
  var SVC = [['תספורת', 'a haircut', 'לתספורת'], ['פייד', 'a fade', 'לפייד'], ['תספורת וזקן', 'a haircut and beard', 'לתספורת וזקן'], ['סידור זקן', 'a beard trim', 'לסידור זקן']];
  var PART = [['בבוקר', 'in the morning', 0], ['בצהריים', 'at noon', 0], ['אחר הצהריים', 'in the afternoon', 0], ['בערב', 'in the evening', 1]];
  var GUARD = [['any', 'שאיציק יחליט', 'Eizik decides'], ['0', '0', '0'], ['0.5', '½', '½'], ['1', '1', '1'], ['2', '2', '2'], ['3', '3', '3']];
  var gsel = 'any';
  function guardSvg(n) {
    // a clipper guard, drawn side-on: longer teeth for a higher number
    var t = n === 'any' ? 0 : 6 + (+n) * 7, s = '<svg viewBox="0 0 44 56" aria-hidden="true"><rect class="body" x="6" y="4" width="32" height="16" rx="5"/>';
    if (n === 'any') s += '<path class="teeth" d="M12 30h20M12 38h20M12 46h20" fill="none"/>';
    else for (var i = 0; i < 6; i++) s += '<line class="teeth" x1="' + (9 + i * 5.2) + '" y1="20" x2="' + (9 + i * 5.2) + '" y2="' + (20 + t) + '"/>';
    return s + '</svg>';
  }
  function fillSelects() {
    var l = he() ? 0 : 1, sv = svc.value || '0', dv = day.value, pv = part.value || '2';
    svc.innerHTML = SVC.map(function (s, i) { return '<option value="' + i + '">' + s[l] + '</option>'; }).join(''); svc.value = sv;
    var n = window.__now || now(), opts = [];
    var h1 = !l;
    for (var k = 0; k < 7; k++) { var d = (n.d + k) % 7; if (!H[d]) continue; if (k === 0 && n.h > H[d][1] - 1) continue; opts.push('<option value="' + d + '">' + (k === 0 ? (h1 ? 'היום' : 'today') : k === 1 ? (h1 ? 'מחר' : 'tomorrow') : (h1 ? 'ביום ' + dayHe[d] : 'on ' + dayEn[d])) + '</option>'); }
    day.innerHTML = opts.join(''); if (dv && $('option[value="' + dv + '"]', day)) day.value = dv;
    fillParts(pv);
    rack.innerHTML = GUARD.map(function (g) { return '<button type="button" role="radio" class="guard' + (g[0] === 'any' ? ' any' : '') + '" aria-checked="' + (g[0] === gsel) + '" data-g="' + g[0] + '">' + guardSvg(g[0]) + '<span>' + g[1 + l] + '</span></button>'; }).join('');
    rack.setAttribute('role', 'radiogroup');
  }
  function fillParts(pv) {
    var l = he() ? 0 : 1, friday = +day.value === 5;
    part.innerHTML = PART.filter(function (p) { return !(friday && p[2]); }).map(function (p) { return '<option value="' + PART.indexOf(p) + '">' + p[l] + '</option>'; }).join('');
    part.value = $('option[value="' + pv + '"]', part) ? pv : part.options[0].value;
  }
  rack.addEventListener('click', function (e) { var b = e.target.closest('.guard'); if (!b) return; gsel = b.dataset.g; $$('.guard', rack).forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write(); });
  svc.addEventListener('change', function () { write(); });
  day.addEventListener('change', function () { fillParts(part.value); write(); });
  part.addEventListener('change', function () { write(); });
  function compose() {
    var s = +svc.value, d = day.selectedOptions[0], p = PART[+part.value], beard = s === 3;
    guards.hidden = beard;
    var g = GUARD.filter(function (x) { return x[0] === gsel; })[0];
    if (he()) {
      return 'היי איציק, אשמח לקבוע תור ' + SVC[s][2] + ' ' + d.textContent + ' ' + p[0] + '.' +
        (beard ? '' : gsel === 'any' ? ' את האורך בצדדים אשאיר לך.' : ' בצדדים מספר ' + g[1] + '.') + ' מתי נוח לך?';
    }
    return 'Hi Eizik, I’d like to book ' + SVC[s][1] + ' ' + d.textContent + ' ' + p[1] + '.' +
      (beard ? '' : gsel === 'any' ? ' I’ll leave the length on the sides to you.' : ' Sides: a number ' + g[2] + '.') + ' When suits you?';
  }
  var shown = '', typing = 0, chatSeen = false;
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var from = shown, t0 = performance.now(), del = from.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 14);
      shown = n < del ? from.slice(0, from.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; if (!still()) { shown = ''; msgEl.textContent = ''; write(); } } }, { threshold: .4 });

  // ---------------------------------------------------------------- footer: his name grows back in hair
  var grow = (function () {
    var cv = $('[data-grow]'), c = cv.getContext('2d'), w = 0, h = 0, pts = [];
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var name = he() ? 'איציק אסולין' : 'Eizik Asulin', o = document.createElement('canvas'), ox = o.getContext('2d');
      o.width = Math.max(1, Math.floor(w)); o.height = Math.max(1, Math.floor(h));
      var fs = h * .78; ox.font = '800 ' + fs + 'px Rubik, Arial, sans-serif';
      var tw = ox.measureText(name).width; if (tw > w * .98) { fs *= w * .98 / tw; ox.font = '800 ' + fs + 'px Rubik, Arial, sans-serif'; tw = ox.measureText(name).width; }
      ox.textBaseline = 'middle'; ox.direction = he() ? 'rtl' : 'ltr'; ox.textAlign = 'center';
      ox.fillText(name, w / 2, h * .55);
      var d = ox.getImageData(0, 0, o.width, o.height).data, step = phone() ? 3 : 4; pts = [];
      for (var y = 0; y < o.height; y += step) for (var x = 0; x < o.width; x += step) if (d[(y * o.width + x) * 4 + 3] > 128) pts.push({ x: x + Math.random() * step, y: y + Math.random() * step, a: -1.35 + (Math.random() - .5) * .6, l: step * (1.6 + Math.random() * 1.6), d: Math.random() });
    }
    function draw(p) {
      c.clearRect(0, 0, w, h); c.strokeStyle = '#e1d6c8'; c.lineCap = 'round'; c.lineWidth = phone() ? 1.1 : 1.3; c.beginPath();
      for (var i = 0; i < pts.length; i++) {
        var q = pts[i], g = clamp((p - q.d * .35) / .65, 0, 1);
        if (g <= 0) { c.rect(q.x, q.y, .8, .8); continue; }    // stubble before it grows
        var ln = q.l * g; c.moveTo(q.x, q.y); c.lineTo(q.x + Math.cos(q.a) * ln * (rtl() ? -1 : 1), q.y + Math.sin(q.a) * ln);
      }
      c.stroke();
    }
    return { size: size, draw: draw };
  })();

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var clipper = $('[data-clipper]');
  var ticking = false, revs = $('[data-revs]'), rrow = $('[data-rrow]'), foot = $('[data-foot]');
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    clipper.classList.toggle('away', hero.getBoundingClientRect().bottom > vh * .5);
    // the seam: the clipper takes the hair down as the hero leaves
    var hr = hero.getBoundingClientRect(), sp = calm ? .45 : smooth(-hr.top / (hr.height * .6));
    stub.draw(sp);
    // the rail
    var wr = work.getBoundingClientRect(), wp = calm ? 0 : clamp(-wr.top / Math.max(1, wr.height - vh), 0, 1);
    if (!calm) rail.style.transform = 'translate3d(' + ((rtl() ? 1 : -1) * wp * railMax).toFixed(1) + 'px,0,0)';
    rcs.forEach(function (rc) { var r = rc.getBoundingClientRect(), mid = r.left + r.width / 2; capOn(rc, calm || (mid > innerWidth * .05 && mid < innerWidth * .95 && wr.top < vh * .6)); });
    // the loupe on touch screens, or parked when the pointer is away
    if (!lp) { var er = stage.getBoundingClientRect(), ep = calm ? .45 : clamp((vh - er.top) / (vh + er.height), 0, 1); var a = along(calm ? .45 : smooth((ep - .15) / .7)); placeLoupe(a[0], a[1]); }
    // reviews drift sideways with the scroll
    var rr = revs.getBoundingClientRect(), rp = calm ? 0 : clamp((vh - rr.top) / (vh + rr.height), 0, 1);
    var over = Math.max(0, rrow.scrollWidth - revs.clientWidth + 40);
    rrow.style.transform = calm ? '' : 'translate3d(' + ((rtl() ? 1 : -1) * (rp * (over + 120) - 60)).toFixed(1) + 'px,0,0)';
    revs.style.filter = calm ? '' : 'brightness(' + (1 - .35 * clamp((-rr.top) / vh, 0, 1)).toFixed(3) + ')';
    // footer name
    var fr = foot.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / (fr.height * .75));
    grow.draw(fp);
  }
  function kickAll() { kickPass(); tick(); }
  function layout() { stub.size(); grow.size(); railLayout(); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (innerWidth !== lw || !phone()) { lw = innerWidth; layout(); } else tick(); }, 140); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); fillSelects(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; grow.size(); tick(); requestAnimationFrame(function () { hero.classList.add('ready'); kickPass(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { layout(); });
})();
