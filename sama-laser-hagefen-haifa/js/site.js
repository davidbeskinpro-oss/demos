(function () {
  var root = document.documentElement, WA = 'https://wa.me/972524043094';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var ease = function (t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var wide = function () { return innerWidth >= 900; };
  var canHover = matchMedia('(hover: hover)').matches;
  var TITLE = { he: 'סמא · הסרת שיער בלייזר לגבר · הגפן 43, חיפה', en: 'Sama · Laser hair removal for men · 43 HaGefen St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור סמא - הסרת שיער בלייזר לגבר · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Sama – laser hair removal for men · This is not the business’s official website' };
  var waHref = function (msg) { return WA + '?text=' + encodeURIComponent(msg); };
  var io = 'IntersectionObserver' in window;
  function watch(el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { es.forEach(function (e) { fn(e.isIntersecting, e); }); }, opt || {}).observe(el); }
  function secProgress(el) { var r = el.getBoundingClientRect(), span = r.height - innerHeight; return span > 0 ? clamp(-r.top / span, 0, 1) : (r.top < 0 ? 1 : 0); }

  // ------------------------------------------------ language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'סמא, לראש העמוד', 'Sama, back to top');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-ba]', 'השוואת לפני ואחרי', 'Compare before and after');
    aria('[data-t-side]', 'צד הגוף', 'Side of the body');
    aria('[data-t-week]', 'שעות פתיחה', 'Opening hours');
    aria('[data-t-foot]', 'קישורים', 'Links');
    aria('[data-t-dwa]', 'וואטסאפ לסמא', 'WhatsApp Sama');
    aria('[data-t-dcall]', 'להתקשר לסמא, 052-404-3094', 'Call Sama, 052-404-3094');
    $('[data-t-map]').title = l === 'he' ? 'מפה: הגפן 43, חיפה' : 'Map: 43 HaGefen St, Haifa';
    var hi = l === 'he' ? 'היי סמא, אשמח לשמוע על הסרת שיער בלייזר.' : 'Hi Sama, I’d like to hear about laser hair removal.';
    $$('[data-wa]').forEach(function (a) { a.href = waHref(hi); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('sama-lang', l); } catch (e) {}
    texts(l); hours(); buildZones(); compose(true); fitWord(); odoAll(true); frame();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ------------------------------------------------ motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var wasOff = still();
    root.classList.toggle('still', !wasOff);
    try { localStorage.setItem('sama-motion', wasOff ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-seam]').forEach(function (el) { el.classList.add('in'); });
    if (still()) { $('[data-ba-frame]').style.setProperty('--p', .5); $('[data-ba-range]').value = 50; pct(.5); $('[data-area]').style.removeProperty('--r'); outroStatic(); $('[data-logo-stage]').classList.add('done'); }
    else { logoDraw(1); }
    frame();
  }); });
  motionUI();

  // ------------------------------------------------ hours, Haifa time. null = closed
  var H = { 0: [10, 18], 1: [10, 18], 2: [10, 18], 3: [10, 18], 4: [10, 18], 5: [10, 15], 6: null };
  var dHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var sHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], sEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: sEn.indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function hours() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false, st = $('[data-status]');
    var all = Object.keys(H).every(function (k) { return H[k] && H[k][0] === 0 && H[k][1] >= 24; });
    if (all) { open = true; txt = l ? 'פתוח 24/7' : 'Open 24/7'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב־' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור כרגע' : 'Closed for now') : nd === (n.d + 1) % 7
        ? (l ? 'סגור עכשיו · נפתח מחר ב־' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dHe[nd] + ' ב־' + hhmm(H[nd][0]) : 'Closed now · opens ' + dEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    st.textContent = txt; st.classList.toggle('open', open);
    var w = $('[data-week]'); w.innerHTML = '';
    for (var d = 0; d < 7; d++) {
      var h = H[d], li = document.createElement('li');
      li.className = 'day' + (d === n.d ? ' today' : '');
      li.style.setProperty('--f', h ? (h[1] - h[0]) / 12 : 0);
      li.innerHTML = '<span class="dial"><b>' + (l ? sHe : sEn)[d] + '</b></span><span class="hrs">' + (h ? hhmm(h[0]) + '<br>' + hhmm(h[1]) : (l ? 'סגור' : 'Closed')) + '</span>';
      li.setAttribute('aria-label', (l ? dHe : dEn)[d] + ': ' + (h ? hhmm(h[0]) + '–' + hhmm(h[1]) : (l ? 'סגור' : 'closed')));
      w.appendChild(li);
    }
  }

  // ------------------------------------------------ odometer (real numbers only)
  function odo(el, instant) {
    var val = el.dataset.odo; el.innerHTML = '';
    val.split('').forEach(function (ch, i) {
      var col = document.createElement('span'); col.className = 'col';
      if (!/\d/.test(ch)) { col.textContent = ch; el.appendChild(col); return; }
      var reel = document.createElement('span'), n = +ch;
      reel.className = 'reel'; col.appendChild(reel); el.appendChild(col);
      var to = 'translateY(' + (-(10 + n) * 1.05) + 'em)';
      if (instant || still() || !reel.animate) { reel.style.transform = to; return; }
      reel.animate([{ transform: 'translateY(0)' }, { transform: to }], { duration: 1100 + i * 220, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'forwards' });
    });
  }
  function odoAll(instant) { $$('.odo').forEach(function (el) { if (instant || el.dataset.done) odo(el, true); }); }
  $$('.odo').forEach(function (el) { watch(el, function (vis) { if (vis && !el.dataset.done) { el.dataset.done = 1; odo(el); } }, { threshold: .6 }); });

  // ------------------------------------------------ entrances
  $$('[data-reveal]').forEach(function (el) {
    var sib = el.parentElement ? $$('[data-reveal]', el.parentElement).indexOf(el) : 0;
    el.style.transitionDelay = (Math.max(0, sib) * 80) + 'ms';
    watch(el, function (vis) { if (vis) el.classList.add('in'); }, { rootMargin: '0px 0px -8% 0px' });
  });
  requestAnimationFrame(function () { $('[data-seam]').classList.add('in'); $$('.hero [data-reveal]').forEach(function (el) { el.classList.add('in'); }); });

  // ------------------------------------------------ nav gathers, dock hides on the hero (desktop)
  var nav = $('[data-nav]'), dock = $('[data-dock]'), hero = $('[data-hero]');
  watch(hero, function (vis) { dock.classList.toggle('hide', vis); }, { threshold: .35 });

  // ------------------------------------------------ hero: photos dealt into the spot, then laser pulses
  var deal = $('[data-deal]'), area = $('[data-pulse-area]');
  (function opening() {
    if (still() || !deal.animate) return;
    var imgs = $$('img', deal), ph = $('img', area);
    ph.animate([{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(.3)', opacity: 0, offset: .55 }, { transform: 'scale(1.06)', opacity: 1 }], { duration: 1500, easing: 'cubic-bezier(.23,1,.32,1)' });
    imgs.forEach(function (im, i) {
      var a = (-28 + i * 28) * Math.PI / 180, dx = Math.sin(a) * 120, dy = -Math.cos(a) * 40;
      im.animate([
        { opacity: 0, transform: 'translate(0,60%) rotate(0deg) scale(.6)' },
        { opacity: 1, transform: 'translate(' + dx + '%,' + dy + '%) rotate(' + (i * 14 - 14) + 'deg) scale(1)', offset: .45 },
        { opacity: 0, transform: 'translate(0,0) rotate(0deg) scale(2.6)' }
      ], { duration: 1300, delay: i * 90, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
    });
  })();
  var heroVis = true, lastPulse = 0;
  watch(hero, function (vis) { heroVis = vis; }, { threshold: 0 });
  function pulse(x, y, big) {
    if (still() || !area.animate) return;
    var p = document.createElement('span'); p.className = 'pulse'; p.style.left = x + 'px'; p.style.top = y + 'px';
    area.appendChild(p);
    var s = big ? 1.6 : 1;
    p.animate([{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(' + (.9 * s) + ')', opacity: 1, offset: .18 }, { transform: 'scale(' + (1.5 * s) + ')', opacity: 0 }], { duration: 760, easing: 'cubic-bezier(.23,1,.32,1)' }).onfinish = function () { p.remove(); };
  }
  setInterval(function () {
    if (!heroVis || still() || document.hidden) return;
    if (performance.now() - lastPulse < 1200) return;
    var r = area.getBoundingClientRect(), a = Math.random() * Math.PI * 2, d = Math.random() * .3;
    pulse(r.width * (.5 + Math.cos(a) * d), r.height * (.55 + Math.sin(a) * d));
  }, 900);
  if (canHover) hero.addEventListener('pointermove', function (e) {
    var t = performance.now(); if (t - lastPulse < 140) return;
    var r = area.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, cx = r.width / 2;
    if (Math.hypot(x - cx, y - r.height / 2) > cx) return;
    lastPulse = t; pulse(x, y);
  });
  area.addEventListener('pointerdown', function (e) { var r = area.getBoundingClientRect(); lastPulse = performance.now(); pulse(e.clientX - r.left, e.clientY - r.top, true); });

  // ------------------------------------------------ before / after beam
  var ba = $('[data-ba]'), fr = $('[data-ba-frame]'), range = $('[data-ba-range]'), pctEl = $('[data-ba-pct]'), manual = false, lastP = -1, lastSpark = 0;
  function pct(p) { pctEl.textContent = Math.round(p * 100); }
  function setBeam(p) {
    fr.style.setProperty('--p', p); pct(p);
    var t = performance.now();
    if (!still() && Math.abs(p - lastP) > .004 && p > .01 && p < .99 && t - lastSpark > 90 && fr.animate) {
      lastSpark = t;
      var s = document.createElement('span'); s.className = 'spark';
      s.style.left = (p * 100) + '%'; s.style.top = (12 + Math.random() * 76) + '%';
      fr.appendChild(s);
      s.animate([{ transform: 'scale(.3)', opacity: 1 }, { transform: 'scale(1.4)', opacity: 0 }], { duration: 520, easing: 'ease-out' }).onfinish = function () { s.remove(); };
    }
    lastP = p;
  }
  range.addEventListener('input', function () { manual = true; setBeam(range.value / 100); });
  watch(ba, function (vis) { if (!vis) manual = false; });
  if (still()) { setBeam(.5); range.value = 50; }

  // ------------------------------------------------ treatments index with preview
  var rows = $$('[data-row]'), prev = $$('.preview-spot img'), cap = $('[data-preview-cap]');
  var caps = [['תמונה להמחשה', 'Illustrative photo'], ['מהקליניקה', 'From the clinic'], ['מהקליניקה', 'From the clinic'], ['מהעמוד של העסק בגוגל', 'From the business’s Google page']];
  function pick(i) {
    rows.forEach(function (r, k) { r.classList.toggle('on', k === i); });
    prev.forEach(function (im, k) { im.classList.toggle('on', k === i); });
    cap.innerHTML = '<span lang="he">' + caps[i][0] + '</span><span lang="en">' + caps[i][1] + '</span>';
  }
  rows.forEach(function (r, i) {
    r.addEventListener('pointerenter', function () { if (canHover) pick(i); });
    r.addEventListener('focus', function () { pick(i); });
    r.addEventListener('click', function () { pick(i); });
  });

  // ------------------------------------------------ area map: the live thing
  var Z = {
    beard: ['קו הזקן', 'Beard line'], neck: ['צוואר', 'Neck'], chest: ['חזה', 'Chest'], belly: ['בטן', 'Stomach'],
    shoulders: ['כתפיים', 'Shoulders'], arms: ['זרועות', 'Arms'], nape: ['עורף', 'Nape'], upper: ['גב עליון', 'Upper back'], lower: ['גב תחתון', 'Lower back']
  };
  // [key, x, y, label side] in the 300x520 drawing
  var SPOTS = {
    front: [['beard', 150, 116, 'r'], ['neck', 150, 148, 'l'], ['shoulders', 74, 190, 'l'], ['shoulders', 226, 190, 'r'], ['chest', 150, 250, 'r'], ['belly', 150, 360, 'r'], ['arms', 54, 310, 'l'], ['arms', 246, 310, 'r']],
    back: [['nape', 150, 140, 'r'], ['shoulders', 74, 190, 'l'], ['shoulders', 226, 190, 'r'], ['upper', 150, 236, 'r'], ['lower', 150, 400, 'r'], ['arms', 54, 310, 'l'], ['arms', 246, 310, 'r']]
  };
  var picked = [], side = 'front', body = $('[data-body]'), zonesEl = $('[data-zones]'), lit = $('[data-lit]'), tattoo = $('[data-tattoo]');
  function buildZones() {
    zonesEl.innerHTML = ''; lit.innerHTML = '';
    var l = he() ? 0 : 1;
    SPOTS[side].forEach(function (s) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'zone' + (picked.indexOf(s[0]) > -1 ? ' on' : '');
      b.style.left = (s[1] / 3) + '%'; b.style.top = (s[2] / 5.2) + '%';
      var end = s[3]; if (!he()) end = end; b.dataset.end = end;
      b.dataset.z = s[0]; b.setAttribute('aria-pressed', picked.indexOf(s[0]) > -1);
      b.innerHTML = '<span class="zl">' + Z[s[0]][l] + '</span>';
      // one label per key: hide the mirrored twin's label
      if (SPOTS[side].filter(function (t) { return t[0] === s[0]; })[0] !== s) b.querySelector('.zl').style.display = 'none';
      b.addEventListener('click', function () { toggle(s[0]); });
      zonesEl.appendChild(b);
      if (picked.indexOf(s[0]) > -1) {
        var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', s[1]); c.setAttribute('cy', s[2]); c.setAttribute('r', s[0] === 'belly' || s[0] === 'upper' || s[0] === 'lower' || s[0] === 'chest' ? 62 : 38);
        lit.appendChild(c);
        if (!still() && c.animate) c.animate([{ opacity: .4 }, { opacity: 1 }, { opacity: .75 }], { duration: 700, easing: 'ease-out', fill: 'forwards' });
      }
    });
  }
  function toggle(k) { var i = picked.indexOf(k); if (i > -1) picked.splice(i, 1); else picked.push(k); buildZones(); compose(); }
  function list(arr, l) {
    if (arr.length < 2) return arr.join('');
    return arr.slice(0, -1).join(', ') + (l ? ' ו' : ' and ') + arr[arr.length - 1];
  }
  function message() {
    var l = he(), names = picked.map(function (k) { return Z[k][l ? 0 : 1]; }), ink = tattoo.checked, m;
    if (l) {
      m = names.length ? 'היי סמא, אשמח לשמוע על הסרת שיער בלייזר: ' + list(names, true) + '.' : (ink ? 'היי סמא, יש לי קעקוע שאשמח להסיר.' : 'היי סמא, אשמח לשמוע על הסרת שיער בלייזר.');
      if (ink && names.length) m += ' יש לי גם קעקוע שאשמח להסיר.';
    } else {
      m = names.length ? 'Hi Sama, I’d like to hear about laser hair removal: ' + list(names.map(function (n) { return n.toLowerCase(); }), false) + '.' : (ink ? 'Hi Sama, I have a tattoo I’d like removed.' : 'Hi Sama, I’d like to hear about laser hair removal.');
      if (ink && names.length) m += ' I also have a tattoo I’d like removed.';
    }
    return m;
  }
  var msgEl = $('[data-msg]'), send = $('[data-send]'), typing = 0;
  function compose(instant) {
    var m = message(); send.href = waHref(m); cancelAnimationFrame(typing);
    if (instant || still()) { msgEl.textContent = m; return; }
    var old = msgEl.textContent, same = 0; while (same < old.length && old[same] === m[same]) same++;
    var t0 = performance.now(), n = m.length - same, dur = Math.min(600, n * 14);
    (function step(t) { var k = dur ? clamp((t - t0) / dur, 0, 1) : 1; msgEl.textContent = m.slice(0, same + Math.round(n * k)); if (k < 1) typing = requestAnimationFrame(step); })(t0);
  }
  tattoo.addEventListener('change', function () { compose(); });
  $$('[data-side]').forEach(function (b) { b.addEventListener('click', function () {
    if (b.dataset.side === side) return;
    var go = function () { side = b.dataset.side; body.classList.toggle('back', side === 'back'); buildZones(); };
    $$('[data-side]').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    if (still() || !body.animate) { go(); return; }
    body.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0.02)' }], { duration: 180, easing: 'ease-in' }).onfinish = function () {
      go(); body.animate([{ transform: 'scaleX(0.02)' }, { transform: 'scaleX(1)' }], { duration: 260, easing: 'cubic-bezier(.23,1,.32,1)' });
    };
  }); });

  // ------------------------------------------------ studio: the logo assembles from its own pixels
  var stage = $('[data-logo-stage]'), cv = $('[data-logo-canvas]'), ctx = cv.getContext && cv.getContext('2d'), parts = null, logoP = -1;
  function logoParts() {
    var im = new Image(); im.src = 'img/logo.png';
    im.onload = function () {
      var W = 520, off = document.createElement('canvas'); off.width = off.height = W;
      var o = off.getContext('2d'); o.drawImage(im, 0, 0, W, W);
      var d; try { d = o.getImageData(0, 0, W, W).data; } catch (e) { stage.classList.add('done'); return; }
      parts = []; var step = 7;
      for (var y = 0; y < W; y += step) for (var x = 0; x < W; x += step) {
        var i = (y * W + x) * 4; if (d[i + 3] < 120) continue;
        var dark = d[i] < 120;
        if (!dark && (x / step + y / step) % 2) continue;
        var a = Math.random() * Math.PI * 2, r = 220 + Math.random() * 260;
        parts.push({ x: x, y: y, sx: 260 + Math.cos(a) * r, sy: 260 + Math.sin(a) * r, c: 'rgb(' + d[i] + ',' + d[i + 1] + ',' + d[i + 2] + ')', s: dark ? 2.4 : 3.6, k: Math.random() * .35 });
      }
      logoP = -1; frame();
    };
  }
  function logoDraw(p) {
    if (!ctx || !parts) return;
    ctx.clearRect(0, 0, 520, 520);
    for (var i = 0; i < parts.length; i++) {
      var q = parts[i], t = ease((p - q.k) / (1 - q.k) * 1.15);
      ctx.fillStyle = q.c; ctx.beginPath();
      ctx.arc(q.sx + (q.x - q.sx) * t, q.sy + (q.y - q.sy) * t, q.s, 0, 6.283); ctx.fill();
    }
    stage.classList.toggle('done', p >= .98);
  }
  if (!still()) logoParts(); else stage.classList.add('done');

  // ------------------------------------------------ reviews drift (scroll-linked, not a loop)
  var drift = $('[data-drift]'), row = $('[data-drift-row]');

  // ------------------------------------------------ outro: the hero photo closes into the spot
  var outro = $('[data-outro]'), opic = $('[data-outro-pic]'), oline = $('[data-outro-line]');
  function outroStatic() { opic.style.removeProperty('--cr'); opic.style.removeProperty('--cs'); oline.style.removeProperty('--lo'); }

  // ------------------------------------------------ footer word fits its width
  function fitWord() {
    var w = $('[data-fit]'); w.style.fontSize = '';
    var max = innerWidth * .82, cur = w.getBoundingClientRect().width;
    if (cur > max) w.style.fontSize = (parseFloat(getComputedStyle(w).fontSize) * max / cur) + 'px';
  }

  // ------------------------------------------------ the scroll frame
  var ticking = false;
  function frame() {
    ticking = false;
    nav.classList.toggle('gathered', scrollY > 40);
    if (still()) return;
    // beam
    if (!manual) { var p = clamp((secProgress(ba) - .08) / .8, 0, 1); setBeam(p); range.value = Math.round(p * 100); }
    // area: the spot opens into the next field
    var ar = $('[data-area]').getBoundingClientRect(), k = clamp((innerHeight - ar.top) / (innerHeight * .85), 0, 1);
    $('[data-area]').style.setProperty('--r', (8 + ease(k) * 142) + '%');
    // index: on phones the row nearest the middle lights up
    if (!wide()) { var best = 0, bd = 1e9; rows.forEach(function (r, i) { var b = r.getBoundingClientRect(), d = Math.abs(b.top + b.height / 2 - innerHeight * .5); if (d < bd) { bd = d; best = i; } }); if (!rows[best].classList.contains('on')) pick(best); }
    // logo particles
    if (parts) { var sr = stage.getBoundingClientRect(), lp = clamp((innerHeight - sr.top) / (innerHeight * .8 + sr.height * .2), 0, 1); if (Math.abs(lp - logoP) > .002) { logoP = lp; logoDraw(lp); } }
    // reviews drift
    var rr = drift.getBoundingClientRect(), dp = clamp((innerHeight - rr.top) / (innerHeight + rr.height), 0, 1), over = Math.max(0, row.scrollWidth - innerWidth);
    row.style.transform = 'translateX(' + ((he() ? 1 : -1) * dp * over) + 'px)';
    // outro
    var op = ease(secProgress(outro) / .85), vmin = Math.min(innerWidth, innerHeight);
    var full = Math.hypot(innerWidth, innerHeight) / 2 + 2, small = vmin * .26;
    opic.style.setProperty('--cr', (full + (small - full) * op) + 'px');
    opic.style.setProperty('--cs', (1.12 - .12 * op).toFixed(3));
    oline.style.setProperty('--lo', clamp((op - .7) / .3, 0, 1).toFixed(2));
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener('resize', function () { fitWord(); frame(); });

  texts(root.lang); hours(); buildZones(); compose(true); fitWord(); frame();
  if (still()) { $$('[data-reveal],[data-seam]').forEach(function (el) { el.classList.add('in'); }); odoAll(true); }
  setInterval(hours, 60000);
  if (document.fonts) document.fonts.ready.then(fitWord);
})();
