(function () {
  var root = document.documentElement, WA = '972542725050';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth <= 860; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'טוהר החשמל · רועי יונה, חשמלאי מוסמך · ארתור הנטקה 12, חיפה', en: 'Tohar Electric · Roi Yona, licensed electrician · 12 Arthur Hantke St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור טוהר החשמל · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Tohar Electric · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'טוהר החשמל', 'Tohar Electric');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-phases]', 'שלבי העבודה', 'Stages of the job');
    aria('[data-t-prev]', 'השלב הקודם', 'Previous stage');
    aria('[data-t-next]', 'השלב הבא', 'Next stage');
    aria('[data-t-dial]', 'סוג העבודה', 'Kind of job');
    aria('[data-t-where]', 'איפה', 'Where');
    aria('[data-t-call]', 'התקשרו לרועי, 054-272-5050', 'Call Roi, 054-272-5050');
    aria('[data-t-wa]', 'וואטסאפ לרועי', 'WhatsApp Roi');
    aria('[data-rocker]', 'מתג האור בתמונה', 'The light switch in the photo');
    $('[data-name]').placeholder = l === 'he' ? 'השם שלכם (לא חובה)' : 'Your name (optional)';
    topics.forEach(function (b) { b.textContent = b.dataset[l === 'he' ? 'shortHe' : 'shortEn']; });
    $$('.co').forEach(function (c) { if (c.classList.contains('on')) $('b', c).textContent = c.dataset[l]; else $('b', c).textContent = ''; });
    $$('[data-decode]').forEach(function (d) { d._tok = null; d.textContent = d.dataset[l]; });
    lcd(true); readout();
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('th-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('th-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    hero.classList.add('ready', 'dealt');
    if (!heroOn) power(true, true);
    layout(); ring.kick(); drift.kick(); torch.kick(); spot.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [7, 20], 1: [7, 20], 2: [7, 20], 3: [7, 20], 4: [7, 19], 5: [7, 12.5], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
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
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 9 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // callouts that type themselves onto a real photo
  function typeTag(c, on) {
    var b = $('b', c), txt = c.dataset[he() ? 'he' : 'en'];
    if (on === c.classList.contains('on') && (!on || b.textContent)) return;
    c.classList.toggle('on', on); clearInterval(c._t);
    if (!on) { b.textContent = ''; return; }
    if (still()) { b.textContent = txt; return; }
    var i = 0; b.textContent = '';
    c._t = setInterval(function () { b.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(c._t); }, 32);
  }
  // place a callout given as fractions of an image drawn with object-fit: cover (optionally scaled about an origin)
  function place(c, W, Hh, iw, ih, kb, ox, oy) {
    var s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s, x = (W - dw) / 2 + dw * +c.dataset.x, y = (Hh - dh) / 2 + dh * +c.dataset.y;
    if (kb) { x = ox + (x - ox) * kb; y = oy + (y - oy) * kb; }
    c.style.left = x.toFixed(1) + 'px'; c.style.top = y.toFixed(1) + 'px';
    var need = (c.dataset[he() ? 'he' : 'en'] || '').length * 7.6 + 48, room = rtl() ? x : W - x;
    c.classList.toggle('flip', room < need && (rtl() ? W - x : x) > room);
    return [x, y];
  }

  // ---------------------------------------------------------------- HERO
  var hero = $('[data-hero]'), nav = $('[data-nav]'), hphoto = $('[data-hphoto]'), lampfig = $('[data-lampfig]');
  var rocker = $('[data-rocker]'), cable = $('[data-cable]'), wire = $('[data-wire]'), hot = $('[data-hotwire]'), plug = $('[data-plug]'), spark = $('[data-spark]');
  var blooms = $$('[data-blooms] i'), heroOn = false, sparkRaf = 0;
  function rel(el) { var a = el.getBoundingClientRect(), b = hero.getBoundingClientRect(); return { l: a.left - b.left, t: a.top - b.top, w: a.width, h: a.height }; }
  function rounded(pts, r) {
    var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var i = 1; i < pts.length - 1; i++) {
      var p0 = pts[i - 1], p = pts[i], p1 = pts[i + 1];
      var d0 = Math.hypot(p[0] - p0[0], p[1] - p0[1]) || 1, d1 = Math.hypot(p1[0] - p[0], p1[1] - p[1]) || 1, rr = Math.min(r, d0 / 2, d1 / 2);
      var a = [p[0] - (p[0] - p0[0]) / d0 * rr, p[1] - (p[1] - p0[1]) / d0 * rr], b = [p[0] + (p1[0] - p[0]) / d1 * rr, p[1] + (p1[1] - p[1]) / d1 * rr];
      d += 'L' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + 'Q' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ' ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1);
    }
    var e = pts[pts.length - 1]; return d + 'L' + e[0].toFixed(1) + ' ' + e[1].toFixed(1);
  }
  // the logo's cable: from a plug, along the floor to the switch, then up and over into the pendant's canopy
  function cableLayout() {
    var hr = hero.getBoundingClientRect(), W = hr.width, Hh = hero.offsetHeight;
    cable.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh);
    // measure without the photo tilt
    var ph = rel(hphoto), rk = rel(rocker);
    var rx = rk.l + rk.w / 2, rTop = rk.t + 6, rBot = rk.t + rk.h - 6;
    var startX, startY, sup;
    if (phone()) { startX = rtl() ? W + 30 : -30; startY = rBot + 40; sup = [[startX, startY], [rx, startY], [rx, rBot]]; }
    else {
      var cp = rel($('.h-copy')); startX = rtl() ? cp.l + cp.w - 20 : cp.l + 20; startY = Hh - 30;
      sup = [[startX, startY], [rx, startY], [rx, rBot]];
    }
    var top = ph.t - 22, cx = ph.l + ph.w * .5, canopy = ph.t + ph.h * .1;
    var load = [[rx, rTop], [rx, top], [cx, top], [cx, canopy]];
    wire.setAttribute('d', rounded(sup, 26) + rounded(load, 26).replace(/^M/, 'M'));
    hot.setAttribute('d', rounded(load, 26));
    var goingLeft = sup[1][0] < sup[0][0];
    plug.setAttribute('transform', 'translate(' + startX.toFixed(1) + ' ' + startY.toFixed(1) + ') rotate(' + (goingLeft ? -90 : 90) + ')');
    plug.style.display = phone() ? 'none' : '';
  }
  function power(on, instant) {
    heroOn = on; rocker.setAttribute('aria-checked', on ? 'true' : 'false');
    cancelAnimationFrame(sparkRaf); spark.style.opacity = 0;
    if (!on) { hero.classList.remove('on'); return; }
    if (instant || still()) { hero.classList.add('on'); return; }
    // current runs from the switch up the cable into the canopy, then the lamps strike
    var len = hot.getTotalLength(), t0 = performance.now(), dur = 620;
    clearTimeout(power._t); power._t = setTimeout(function () { if (heroOn) { cancelAnimationFrame(sparkRaf); spark.style.opacity = 0; hero.classList.add('on'); } }, dur + 400);   // lamps never wait on a stalled frame
    (function st(t) {
      var u = clamp((t - t0) / dur, 0, 1), e = u * u, p = hot.getPointAtLength(e * len);
      spark.setAttribute('cx', p.x); spark.setAttribute('cy', p.y); spark.style.opacity = u < 1 ? 1 : 0;
      if (u < 1) sparkRaf = requestAnimationFrame(st); else hero.classList.add('on');
    })(t0);
  }
  rocker.addEventListener('click', function () { power(!heroOn); });
  // while the lamps are on, a pulse of current runs up the cable now and then
  var heroVis = true;
  setInterval(function () {
    if (!heroOn || still() || !heroVis || document.hidden) return;
    var len = hot.getTotalLength(), t0 = performance.now(), dur = 900;
    (function st(t) {
      var u = clamp((t - t0) / dur, 0, 1), p = hot.getPointAtLength(u * len);
      spark.setAttribute('cx', p.x); spark.setAttribute('cy', p.y); spark.style.opacity = u < 1 ? (u < .1 ? u * 10 : 1) : 0;
      if (u < 1 && heroOn) sparkRaf = requestAnimationFrame(st); else spark.style.opacity = 0;
    })(t0);
  }, 4200);
  watch(hero, function (v) { heroVis = v; });
  // the lamps answer the hand: nearer lamps bloom wider, the photo leans toward the pointer
  hero.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var r = lampfig.getBoundingClientRect();
    blooms.forEach(function (b) {
      var bx = r.left + r.width * parseFloat(b.style.getPropertyValue('--x')) / 100, by = r.top + r.height * parseFloat(b.style.getPropertyValue('--y')) / 100;
      var d = Math.hypot(e.clientX - bx, e.clientY - by); b.style.setProperty('--bs', (1 + .45 * clamp(1 - d / 260, 0, 1)).toFixed(3));
    });
    var nx = clamp((e.clientX - (r.left + r.width / 2)) / r.width, -1, 1), ny = clamp((e.clientY - (r.top + r.height / 2)) / r.height, -1, 1);
    lampfig.style.setProperty('--ry', (nx * 6).toFixed(2) + 'deg'); lampfig.style.setProperty('--rx', (-ny * 5).toFixed(2) + 'deg');
  });
  hero.addEventListener('pointerleave', function () { blooms.forEach(function (b) { b.style.setProperty('--bs', 1); }); lampfig.style.setProperty('--ry', '0deg'); lampfig.style.setProperty('--rx', '0deg'); });

  // a soft light in the dark hero: follows the mouse, drifts on its own on touch screens
  var torch = (function () {
    var el = $('[data-torch]'), raf = 0, vis = true, mx = -1, my = -1, last = 0;
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; last = performance.now(); kick(); });
    function frame(t) {
      raf = 0; if (still() || !vis) return;
      var x, y;
      if (mx >= 0 && t - last < 4000) { x = mx; y = my; }
      else { var W = hero.clientWidth, Hh = hero.clientHeight; x = W * (.5 + .32 * Math.sin(t / 3100)); y = Hh * (.45 + .25 * Math.sin(t / 2300)); }
      el.style.setProperty('--tx', x.toFixed(0) + 'px'); el.style.setProperty('--ty', y.toFixed(0) + 'px');
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    watch(hero, function (v) { vis = v; kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- PANEL: open wall to finished board
  var panel = $('[data-panel]'), pstage = $('[data-pstage]'), pphoto = $('[data-pphoto]'), layers = $$('.layer', pphoto), wipe = $('[data-wipe]');
  var cos = $$('[data-callouts] .co'), plines = $$('[data-pline]'), phs = $$('.ph'), volt = $('[data-volt]'), rl = $('[data-rl]');
  var ORIG = [[.5, .5], [.52, .27], [.5, .25]], stillStage = 0, curStage = -1, voltShown = -1;
  function originPx(k) { var W = pphoto.clientWidth, Hh = pphoto.clientHeight, s = Math.max(W / 3, Hh / 4), dw = 3 * s, dh = 4 * s; return [(W - dw) / 2 + dw * ORIG[k][0], (Hh - dh) / 2 + dh * ORIG[k][1]]; }
  function maxR(o) { var W = pphoto.clientWidth, Hh = pphoto.clientHeight; return Math.max(Math.hypot(o[0], o[1]), Math.hypot(W - o[0], o[1]), Math.hypot(o[0], Hh - o[1]), Math.hypot(W - o[0], Hh - o[1])) + 4; }
  function readout() {
    var v = curStage === 2 ? voltShown : 0; if (v < 0) v = 0;
    volt.textContent = Math.round(v);
    rl.textContent = curStage === 2 && v > 390 ? (he() ? '3 פאזות' : '3 phases') : (he() ? 'מנותק' : 'isolated');
  }
  function setStage(s, p) {
    if (s !== curStage) {
      curStage = s;
      plines.forEach(function (l, i) { l.classList.toggle('on', i === s); });
      phs.forEach(function (b, i) { b.setAttribute('aria-pressed', i === s ? 'true' : 'false'); b.classList.toggle('lit', i <= s); });
    }
  }
  function panelFrame(p) {
    var W = pphoto.clientWidth, Hh = pphoto.clientHeight, calm = still();
    var w1 = calm ? (stillStage >= 1 ? 1 : 0) : smooth((p - .3) / .15), w2 = calm ? (stillStage >= 2 ? 1 : 0) : smooth((p - .6) / .15);
    var o1 = originPx(1), o2 = originPx(2);
    layers[1].style.setProperty('--ox', o1[0] + 'px'); layers[1].style.setProperty('--oy', o1[1] + 'px'); layers[1].style.setProperty('--rr', (w1 * maxR(o1)).toFixed(1) + 'px');
    layers[2].style.setProperty('--ox', o2[0] + 'px'); layers[2].style.setProperty('--oy', o2[1] + 'px'); layers[2].style.setProperty('--rr', (w2 * maxR(o2)).toFixed(1) + 'px');
    // the glowing edge rides the wipe that is moving
    var wk = w2 > 0 && w2 < 1 ? 2 : w1 > 0 && w1 < 1 ? 1 : 0;
    if (wk && !calm) { var o = wk === 1 ? o1 : o2, ww = wk === 1 ? w1 : w2; wipe.style.setProperty('--ox', o[0] + 'px'); wipe.style.setProperty('--oy', o[1] + 'px'); wipe.style.setProperty('--wr', (ww * maxR(o)).toFixed(1) + 'px'); wipe.style.setProperty('--wo', Math.min(1, ww * 6, (1 - ww) * 4).toFixed(3)); }
    else wipe.style.setProperty('--wo', 0);
    // slow camera push on each photo while it is the live one
    var kb = [calm ? 1 : lerp(1.1, 1, smooth(p / .45)), calm ? 1 : lerp(1.1, 1, smooth((p - .3) / .45)), calm ? 1 : lerp(1.1, 1, smooth((p - .6) / .4))];
    layers.forEach(function (L, i) { L.style.setProperty('--kb', kb[i].toFixed(4)); });
    // the photo opens out of a framed card to the full panel
    var op = calm ? 1 : smooth(p / .12);
    pphoto.style.setProperty('--ci', (lerp(phone() ? 8 : 10, 0, op)).toFixed(2) + '%');
    pphoto.style.setProperty('--cx', (lerp(phone() ? 10 : 22, 0, op)).toFixed(2) + '%');
    pphoto.style.setProperty('--cr', lerp(44, 24, op).toFixed(1) + 'px');
    var s = calm ? stillStage : p < .45 ? 0 : p < .75 ? 1 : 2;
    setStage(s);
    // callouts: each appears at its moment in its stage
    var at = { 0: [.14, .2], 1: [.48, .53], 2: [.78, .83, .88] }, seen = { 0: 0, 1: 0, 2: 0 };
    cos.forEach(function (c) {
      var st = +c.dataset.st, k = seen[st]++, on = st === s && (calm || p >= at[st][k]);
      place(c, W, Hh, 3, 4, kb[st], W * .5, Hh * .45);
      typeTag(c, on);
    });
    // the meter reads the board once it is live
    var v = s === 2 ? (calm ? 400 : 400 * smooth((p - .86) / .09)) : 0;
    if (Math.round(v) !== Math.round(voltShown)) { voltShown = v; readout(); }
  }
  function goStage(i) {
    i = clamp(i, 0, 2);
    if (still()) { stillStage = i; tick(); return; }
    var r = panel.getBoundingClientRect(), span = panel.offsetHeight - innerHeight, at = [.2, .53, .9][i];
    scrollTo({ top: scrollY + r.top + span * at, behavior: 'smooth' });
  }
  phs.forEach(function (b, i) { b.addEventListener('click', function () { goStage(i); }); });
  $$('[data-step]').forEach(function (b) { b.addEventListener('click', function () { goStage(curStage + (+b.dataset.step)); }); });

  // ---------------------------------------------------------------- SERVICES: the board
  var svc = $('[data-svc]');
  watch(svc, function (v) { svc.classList.toggle('on', v); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  // three phases, 120 degrees apart, drawn two periods wide so the loop is seamless
  $$('[data-wave]').forEach(function (p) {
    var k = +p.dataset.wave, d = '';
    for (var x = 0; x <= 420; x += 4) { var y = 75 - 44 * Math.sin((x / 160) * Math.PI * 2 + k * Math.PI * 2 / 3); d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1); }
    p.setAttribute('d', d);
  });

  // ---------------------------------------------------------------- LIGHT: the ring luminaire and his photos hanging from it
  var light = $('[data-light]');
  watch(light, function (v) { light.classList.toggle('lit', v); }, { rootMargin: '-22% 0px -22% 0px' });
  var ring = (function () {
    var lum = $('[data-lum]'), car = $('[data-car]'), cards = $$('.cc', car), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = false, last = 0;
    function size() {
      var cw = phone() ? Math.min(170, innerWidth * .42) : Math.min(250, innerWidth * .17);
      var R = Math.max(cw * 1.1 / (2 * Math.tan(Math.PI / N)), phone() ? innerWidth * .34 : 330), rw = Math.min(innerWidth * .94, R * 2.15);
      lum.style.setProperty('--cw', cw + 'px'); lum.style.setProperty('--rw', rw + 'px');
      lum.style.setProperty('--lh', (18 + rw * .08 + 70 + cw * 4 / 3 * 1.35 + 40).toFixed(0) + 'px');
      return R;
    }
    var R = 300;
    function frame(t) {
      raf = 0;
      if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.removeProperty('--cs'); c.style.removeProperty('--co'); }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (7 + vel) * dt; vel *= .94; }
      var sc = scrollY * .05;
      cards.forEach(function (c, i) {
        var a = rot + sc + i * step, f = Math.cos(a * Math.PI / 180);
        c.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + R.toFixed(1) + 'px)';
        c.style.setProperty('--cs', (.78 * (1 - Math.pow(Math.max(f, 0), 1.5))).toFixed(3));
        c.style.setProperty('--co', clamp((f - .8) * 5, 0, 1).toFixed(2));
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    lum.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; lum.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .3; vel = dx * 2; });
    addEventListener('pointerup', function () { drag = false; lum.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; lum.classList.remove('drag'); });
    watch(lum, function (v) { vis = v; if (v) kick(); });
    R = size();
    return { kick: kick, size: function () { R = size(); kick(); } };
  })();

  // ---------------------------------------------------------------- ROI: a work light finds him in the dim room
  var spot = (function () {
    var fig = $('[data-litfig]'), raf = 0, vis = false, mx = -1, my = -1, last = 0, cs = $$('.co', fig);
    fig.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = fig.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width * 100; my = (e.clientY - r.top) / r.height * 100; last = performance.now(); kick(); });
    function frame(t) {
      raf = 0; if (still() || !vis) return;
      var x, y;
      if (mx >= 0 && t - last < 3000) { x = mx; y = my; }
      else { x = 52 + 22 * Math.sin(t / 2600); y = 34 + 16 * Math.sin(t / 1900 + 1); }
      var W = fig.clientWidth, Hh = fig.clientHeight, d = Math.round(W * .9);
      fig.style.setProperty('--ld', d + 'px'); fig.style.setProperty('--fw', W + 'px'); fig.style.setProperty('--fh', Hh + 'px');
      fig.style.setProperty('--lx', (W * x / 100 - d / 2).toFixed(1) + 'px'); fig.style.setProperty('--ly', (Hh * y / 100 - d / 2).toFixed(1) + 'px');
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    function placeAll() { cs.forEach(function (c) { place(c, fig.clientWidth, fig.clientHeight, 3, 4); }); }
    watch(fig, function (v) { vis = v; if (v) { kick(); cs.forEach(function (c, i) { setTimeout(function () { c.classList.remove('on'); typeTag(c, true); }, 500 + i * 500); }); } });
    return { kick: kick, place: placeAll };
  })();

  // odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .4 }).observe(o); else roll(o, true);
  });
  // captions decode out of scrambled glyphs
  function decode(el, txt) {
    if (still()) { el.textContent = txt; return; }
    var pool = he() ? 'אבגדהוזחטיכלמנסעפצקרשת' : 'ABCDEFGHJKLMNPRSTUVWXYZ', t0 = performance.now(), dur = 700, tok = {};
    el._tok = tok; clearTimeout(el._dt);
    el._dt = setTimeout(function () { if (el._tok === tok) { el._tok = null; el.textContent = txt; } }, dur + 150);   // never left scrambled
    (function st(t) {
      if (el._tok !== tok) return;
      var u = clamp((t - t0) / dur, 0, 1), n = Math.floor(u * txt.length), out = txt.slice(0, n);
      for (var i = n; i < txt.length; i++) out += txt[i] === ' ' ? ' ' : pool[Math.floor(Math.random() * pool.length)];
      el.textContent = out; if (u < 1) requestAnimationFrame(st); else el.textContent = txt;
    })(t0);
  }
  $$('[data-decode]').forEach(function (d, i) { if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { setTimeout(function () { decode(d, d.dataset[he() ? 'he' : 'en']); }, i * 120); ob.disconnect(); } }, { threshold: .5 }).observe(d); });

  // ---------------------------------------------------------------- MESSAGE: dial, keys, and the chat that writes itself
  var topics = $$('[data-topic]'), wheres = $$('[data-where]'), dial = $('[data-dial]'), knob = $('[data-knob]'), lcdEl = $('[data-lcd]');
  var msgEl = $('[data-msg]'), nameEl = $('[data-name]'), sendEl = $('[data-send]'), steps = $$('[data-step-li]');
  var ANG = topics.map(function (b, i) { return -140 + i * 40; }), sel = 0, shown = '', typing = 0, chatSeen = false;
  function dialLayout() { topics.forEach(function (b, i) { var a = ANG[i] * Math.PI / 180; b.style.setProperty('--ox', (50 + 45 * Math.sin(a)).toFixed(2) + '%'); b.style.setProperty('--oy', (50 - 45 * Math.cos(a)).toFixed(2) + '%'); }); }
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function topicName(l) { var t = topics[sel].dataset[l ? 'he' : 'en']; return t; }
  function lcd(instant) {
    var l = he(), t = topicName(l); if (!l) t = t.replace(/^(an|a|the) /, ''), t = t.charAt(0).toUpperCase() + t.slice(1);
    if (instant) { lcdEl._tok = null; lcdEl.textContent = t; } else decode(lcdEl, t);
  }
  function choose(i, user) {
    sel = (i + topics.length) % topics.length;
    topics.forEach(function (b, k) { b.setAttribute('aria-checked', k === sel ? 'true' : 'false'); b.tabIndex = k === sel ? 0 : -1; });
    knob.style.setProperty('--ka', ANG[sel] + 'deg');
    if (user) { lightStep(0); lcd(); write(); }
  }
  topics.forEach(function (b, i) {
    b.addEventListener('click', function () { choose(i, true); });
    b.addEventListener('keydown', function (e) { var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0; if (d) { e.preventDefault(); choose(sel + d, true); topics[sel].focus(); } });
  });
  // turn the knob itself
  (function () {
    var down = false;
    function ang(e) { var r = dial.getBoundingClientRect(), x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2); return Math.atan2(x, -y) * 180 / Math.PI; }
    knob.addEventListener('pointerdown', function (e) { down = true; knob.setPointerCapture(e.pointerId); knob.style.transition = 'none'; });
    knob.addEventListener('pointermove', function (e) { if (!down) return; var a = clamp(ang(e), -150, 150); knob.style.setProperty('--ka', a + 'deg'); var best = 0; ANG.forEach(function (x, i) { if (Math.abs(x - a) < Math.abs(ANG[best] - a)) best = i; }); if (best !== sel) choose(best, true); });
    function up() { if (!down) return; down = false; knob.style.transition = ''; knob.style.setProperty('--ka', ANG[sel] + 'deg'); }
    knob.addEventListener('pointerup', up); knob.addEventListener('pointercancel', up);
  })();
  wheres.forEach(function (b) { b.addEventListener('click', function () { wheres.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lightStep(1); write(); }); });
  nameEl.addEventListener('input', function () { write(true); });
  sendEl.addEventListener('pointerenter', function () { lightStep(2); });
  sendEl.addEventListener('focus', function () { lightStep(2); });
  sendEl.addEventListener('click', function () { lightStep(2); });
  function compose() {
    var l = he(), w = wheres.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], nm = nameEl.value.trim();
    var t = topicName(l), place = w.dataset[l ? 'he' : 'en'];
    return l ? 'שלום רועי' + (nm ? ', כאן ' + nm : '') + '. אשמח לעזרה עם ' + t + ' ' + place + '.'
             : 'Hi Roi' + (nm ? ', this is ' + nm : '') + '. I’d like help with ' + t + ' ' + place + '.';
  }
  function write(instant) {
    var target = compose();
    sendEl.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 16);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- REVIEWS: tags drifting along the cable
  var drift = (function () {
    var revs = $('[data-revs]'), box = $('[data-tags]'), line = $('[data-line]'), orig = $$('.tag', box), off = 0, raf = 0, vis = false, last = 0, hold = false, drag = false, lx = 0, setW = 0;
    orig.forEach(function (t, i) { t.style.setProperty('--k', i); });
    orig.forEach(function (t, i) { var c = t.cloneNode(true); c.classList.add('clone'); c.setAttribute('aria-hidden', 'true'); c.style.setProperty('--k', i + 2); box.appendChild(c); });
    box.style.direction = 'ltr'; $$('.tag', box).forEach(function (t) { t.style.direction = rtl() ? 'rtl' : 'ltr'; });
    function measure() { var a = orig[0], c = $$('.tag.clone', box)[0]; setW = c ? c.offsetLeft - a.offsetLeft : 0; $$('.tag', box).forEach(function (t) { t.style.direction = rtl() ? 'rtl' : 'ltr'; }); }
    function frame(t) {
      raf = 0;
      if (still()) { box.style.transform = ''; return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!hold && !drag) off -= 34 * dt;
      if (setW) { while (off <= -setW) off += setW; while (off > 0) off -= setW; }
      box.style.transform = 'translate3d(' + off.toFixed(1) + 'px,0,0)';
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    line.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hold = true; });
    line.addEventListener('pointerleave', function () { hold = false; });
    line.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; });
    addEventListener('pointermove', function (e) { if (!drag) return; off += e.clientX - lx; lx = e.clientX; });
    addEventListener('pointerup', function () { drag = false; });
    addEventListener('pointercancel', function () { drag = false; });
    watch(revs, function (v) { vis = v; revs.classList.toggle('on', v); if (v) kick(); });
    return { kick: kick, measure: measure };
  })();

  // ---------------------------------------------------------------- contact, footer
  var reach = $('[data-reach]'), kphoto = $('[data-kphoto]'), ks = $$('[data-k]'), main = $('#main'), fring = $('.f-ring'), plugbar = $('[data-plugbar]'), hacts = $('.h-acts');

  // ---------------------------------------------------------------- one scroll loop
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    plugbar.classList.toggle('show', hacts.getBoundingClientRect().bottom < 0 && main.getBoundingClientRect().bottom > vh * .6);
    panelFrame(calm ? 1 : prog(panel));
    // the board lands over the job: the job sinks back as it is covered
    var st = svc.getBoundingClientRect().top, q = calm ? 0 : clamp((vh - st) / vh, 0, 1);
    pstage.style.setProperty('--ps', (1 - .05 * q).toFixed(4)); pstage.style.setProperty('--pb', (1 - .55 * q).toFixed(3));
    // contact: the rooftop photo arrives at full width and shrinks into its frame
    var rr = reach.getBoundingClientRect(), kp = calm ? 1 : smooth((vh - rr.top) / (vh * .9));
    if (!calm) {
      var w = kphoto.offsetWidth, hgt = kphoto.offsetHeight, kr = kphoto.parentNode.getBoundingClientRect(), cx = kr.left + kphoto.offsetLeft + w / 2;
      var S = Math.min(2.6, innerWidth / w), tx = innerWidth / 2 - cx;
      kphoto.style.transform = 'translate3d(' + lerp(tx, 0, kp).toFixed(1) + 'px,' + '0px,0) scale(' + lerp(S, 1, kp).toFixed(4) + ')';
      kphoto.style.borderRadius = lerp(0, 24, kp).toFixed(1) + 'px';
    } else { kphoto.style.transform = ''; kphoto.style.borderRadius = ''; }
    ks.forEach(function (k, i) { var v = calm ? 1 : smooth((kp - .55 - i * .06) / .3); k.style.opacity = calm ? '' : v.toFixed(3); k.style.transform = calm || v >= 1 ? '' : 'translateY(' + ((1 - v) * 30).toFixed(1) + 'px)'; });
    // the footer's ring rises as the page lifts off it
    var mb = main.getBoundingClientRect().bottom, fh = $('.foot').offsetHeight, fp = calm ? 1 : clamp((vh - mb) / fh, 0, 1);
    fring.style.setProperty('--rise', ((1 - fp) * 110).toFixed(1) + 'px');
  }

  function layout() { cableLayout(); ring.size(); dialLayout(); drift.measure(); spot.place(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); choose(0); write(true); layout();
  // opening: headline letters, the ring strikes, his photos are dealt off the stack, the switch goes on, the lamps light
  var once = false, go = function () {
    if (once) return; once = true; layout();
    if (still()) { hero.classList.add('ready', 'dealt'); power(true, true); return; }
    requestAnimationFrame(function () {
      hero.classList.add('ready');
      setTimeout(function () { hero.classList.add('dealt'); }, 260);
      setTimeout(function () { power(true); }, 950);
    });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 650);
  addEventListener('load', layout);
})();
