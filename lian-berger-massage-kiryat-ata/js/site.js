(function () {
  var root = document.documentElement, WA = '972528977333';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth <= 860; };
  var hover = matchMedia('(hover: hover)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'ליאן ברגר · עיסוי רפואי מקצועי · הרב הרצוג 6, קריית אתא', en: 'Lian Berger · Professional medical massage · 6 HaRav Herzog St, Kiryat Ata' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור ליאן ברגר – עיסוי רפואי מקצועי בקרית אתא · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Lian Berger – professional medical massage in Kiryat Ata · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'ליאן ברגר', 'Lian Berger');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-areas]', 'איפה תפוס', 'Where is it tight');
    aria('[data-t-week]', 'מתי נוח', 'When suits you');
    aria('[data-t-visit]', 'הגעה', 'Visit');
    aria('[data-t-call]', 'התקשרו לליאן, 052-897-7333', 'Call Lian, 052-897-7333');
    aria('[data-t-wa]', 'וואטסאפ לליאן', 'WhatsApp Lian');
    aria('[data-fname]', 'ליאן ברגר', 'Lian Berger');
    cos.forEach(function (c) { c.setAttribute('aria-label', c.dataset.la + ' · ' + c.dataset[l]); if (c.classList.contains('on')) $('.tg', c).innerHTML = label(c); });
    $$('[data-decode]').forEach(function (r) { r.dataset.done = ''; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('lb-lang', l); } catch (e) {}
    texts(l); hours(); buildWeek(); write(true); split(); tick();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('lb-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('.plate').forEach(function (p) { p.classList.add('on'); });
    resetInline(); haze.kick(); write(true); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [8.5, 20], 1: [8.5, 12], 2: [8.5, 20], 3: [8.5, 12], 4: [8.5, 20], 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], shortEn = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
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
    $$('[data-bars] span').forEach(function (s, i) { s.classList.toggle('today', i === n.d); });
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
    // the week as bars: the height is how long the day is
    $('[data-bars]').innerHTML = [0, 1, 2, 3, 4, 5, 6].map(function (d) {
      var t = H[d], h = t ? (t[1] - t[0]) / 11.5 : 0;
      return '<span><i style="--h:' + h.toFixed(3) + ';--d:' + d * 70 + 'ms"></i>' + (l ? shortHe : shortEn)[d] + '</span>';
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

  // ---------------------------------------------------------------- headline + footer name: letter by letter
  function splitEl(sp, start) {
    if (!sp.dataset.raw) sp.dataset.raw = sp.textContent;
    var i = start;
    sp.innerHTML = sp.dataset.raw.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  }
  function split() {
    $$('[data-split] .ln > span[lang]').forEach(function (sp) { splitEl(sp, sp.closest('.ln').previousElementSibling ? 10 : 0); });
    $$('[data-fname] > span[lang]').forEach(function (sp) { splitEl(sp, 0); });
  }
  split();
  var fname = $('[data-fname]');
  watch(fname, function (v) { if (v) fname.classList.add('in'); }, { threshold: .3 });

  // ---------------------------------------------------------------- heat haze: warm motes rising behind the copy, parting around the hand
  var hero = $('[data-hero]'), stage = $('[data-hstage]');
  var haze = (function () {
    var cv = $('[data-haze]'), c = cv.getContext('2d'), P = [], w = 0, h = 0, raf = 0, vis = true, mx = -999, my = -999;
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = stage.clientWidth; h = stage.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 46 : 90; P = []; for (var i = 0; i < n; i++) P.push(mote(true)); }
    function mote(any) { return { x: Math.random() * w, y: any ? Math.random() * h : h + 20, r: 1 + Math.random() * 3.2, v: .25 + Math.random() * .6, ph: Math.random() * 6.3, a: .15 + Math.random() * .5 }; }
    function frame(t) {
      raf = 0; if (still() || !vis) { c.clearRect(0, 0, w, h); return; }
      c.clearRect(0, 0, w, h);
      P.forEach(function (p, i) {
        p.y -= p.v; p.x += Math.sin(t / 1400 + p.ph) * .35;
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { var f = (14000 - d2) / 14000 * 2.2, d = Math.sqrt(d2) || 1; p.x += dx / d * f; p.y += dy / d * f; }
        if (p.y < -20) P[i] = mote(false);
        var life = clamp(p.y / h, 0, 1);
        c.beginPath(); c.fillStyle = 'rgba(242,170,100,' + (p.a * life).toFixed(3) + ')'; c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
      });
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    stage.addEventListener('pointermove', function (e) { var r = stage.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    stage.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    size(); kick();
    return { kick: kick, size: size };
  })();

  // ---------------------------------------------------------------- the charts on the wall: labels type themselves where you point
  var fig = $('[data-hfig]'), cos = $$('.co'), zones = $$('.zones i'), auto = 0, autoT = 0, pinned = null;
  function label(c) { return '<b>' + c.dataset.la + '</b> · ' + c.dataset[he() ? 'he' : 'en']; }
  function show(c) {
    cos.forEach(function (o) { if (o !== c && o !== pinned) { o.classList.remove('on'); clearInterval(o._t); } });
    if (!c || c.classList.contains('on')) return;
    c.classList.add('on');
    var tg = $('.tg', c), full = c.dataset.la + ' · ' + c.dataset[he() ? 'he' : 'en'], i = 0, la = c.dataset.la.length;
    // keep the label inside the photo: measure it at full length, then type it
    tg.style.minWidth = ''; tg.innerHTML = label(c); c.style.setProperty('--sx', '0px');
    var fr = fig.getBoundingClientRect(), tr = tg.getBoundingClientRect(), sx = 0, sc = fr.width / fig.offsetWidth || 1;
    if (tr.left < fr.left + 8) sx = fr.left + 8 - tr.left; else if (tr.right > fr.right - 8) sx = fr.right - 8 - tr.right;
    c.style.setProperty('--sx', (sx / sc).toFixed(1) + 'px'); tg.style.minWidth = (tr.width / sc).toFixed(1) + 'px';
    clearInterval(c._t);
    if (still()) { tg.innerHTML = label(c); return; }
    c._t = setInterval(function () { i++; var s = full.slice(0, i); tg.innerHTML = i <= la ? '<b>' + s + '</b>' : '<b>' + c.dataset.la + '</b>' + s.slice(la); if (i >= full.length) clearInterval(c._t); }, 28);
    // warm the nearest zone on the chart
    var cx = +getComputedStyle(c).getPropertyValue('--x'), cy = +getComputedStyle(c).getPropertyValue('--y'), best = null, bd = 9;
    zones.forEach(function (z) { var d = Math.pow(+z.style.getPropertyValue('--x') - cx, 2) + Math.pow(+z.style.getPropertyValue('--y') - cy, 2); if (d < bd) { bd = d; best = z; } z.classList.remove('hot'); });
    if (best && bd < .02) best.classList.add('hot');
  }
  fig.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var r = fig.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height, best = null, bd = 9;
    cos.forEach(function (c) { var d = Math.pow(+c.style.getPropertyValue('--x') - x, 2) + Math.pow(+c.style.getPropertyValue('--y') - y, 2); if (d < bd) { bd = d; best = c; } });
    if (bd < .03) { show(best); autoT = performance.now(); }
  });
  cos.forEach(function (c) { c.addEventListener('click', function () { pinned = c; show(c); autoT = performance.now() + 3000; }); });
  // by itself (phones and idle desktops): one label after another
  setInterval(function () { if (performance.now() - autoT < 2600) return; var heroOn = hero.getBoundingClientRect().bottom > 0; if (!heroOn) return; pinned = null; auto = (auto + 1) % cos.length; show(cos[auto]); }, 2200);
  setTimeout(function () { show(cos[0]); }, still() ? 0 : 1100);

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="sep" aria-hidden="true">' + ch + '</span>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span></span></span>';
    }).join('');
  });
  var odoCss = document.createElement('style');
  odoCss.textContent = '.odo{display:inline-flex;direction:ltr;line-height:1}.odo .d{display:inline-block;height:1em;overflow:hidden;vertical-align:top}.odo .sep{display:inline-block;height:1em;vertical-align:top}.odo .d>span{display:block;white-space:pre}.odo .d>span::before{content:"0\\A 1\\A 2\\A 3\\A 4\\A 5\\A 6\\A 7\\A 8\\A 9"}.odo .d>span{transition:transform 1.2s cubic-bezier(.23,1,.32,1)}';
  document.head.appendChild(odoCss);
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go || still() ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = (i * 160) + 'ms'; s.style.transform = 'translateY(' + (-to) + 'em)'; }); }
  $$('[data-odo]').forEach(function (o) { roll(o, false); watch(o, function (v) { if (v) roll(o, true); }, { threshold: .4 }); });

  // ---------------------------------------------------------------- bento: warm light under the hand (by itself on phones)
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });
  if (!hover) {
    var tiles = $$('.tile'), ti = 0;
    setInterval(function () { if (still()) { tiles.forEach(function (t) { t.classList.remove('lit'); }); return; } tiles.forEach(function (t) { t.classList.remove('lit'); }); var t = tiles[ti++ % tiles.length]; t.style.setProperty('--mx', '50%'); t.style.setProperty('--my', '40%'); t.classList.add('lit'); }, 1500);
  }
  var breath = $('[data-breath]'), inhale = true;
  setInterval(function () { if (still()) return; inhale = !inhale; breath.innerHTML = inhale ? '<span lang="he">שאיפה</span><span lang="en">Breathe in</span>' : '<span lang="he">נשיפה</span><span lang="en">Breathe out</span>'; }, 2400);

  // ---------------------------------------------------------------- the live thing: area labels, her real week, the message
  var areas = $$('[data-area]'), steps = $$('[data-step]'), week = $('[data-week]'), msgEl = $('[data-msg]'), send = $('[data-send]');
  var pick = null, shown = '', typing = 0, chatSeen = false;
  function lightStep(n) { steps.forEach(function (s, i) { s.classList.toggle('on', i <= n); }); }
  areas.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); lightStep(pick ? 1 : 0); write(); }); });
  var OPEN = 8.5, CLOSE = 20, SPAN = CLOSE - OPEN;
  function buildWeek() {
    var l = he();
    week.innerHTML = [0, 1, 2, 3, 4].map(function (d) {
      var t = H[d], w = (t[1] - OPEN) / SPAN;
      return '<div class="day' + (pick && pick.d === d ? ' sel' : '') + '" data-d="' + d + '"><b>' + (l ? 'יום ' + dayHe[d] : dayEn[d]) + '</b>' +
        '<div class="track" role="slider" tabindex="0" aria-label="' + (l ? 'שעה ביום ' + dayHe[d] : dayEn[d] + ' time') + '" aria-valuemin="' + t[0] + '" aria-valuemax="' + (t[1] - .5) + '" aria-valuenow="' + (pick && pick.d === d ? pick.h : t[0]) + '" aria-valuetext="' + (pick && pick.d === d ? hhmm(pick.h) : hhmm(t[0])) + '">' +
        '<i class="open" style="--w:' + w.toFixed(3) + '"></i><i class="thumb" style="--t:' + ((pick && pick.d === d ? pick.h : t[0]) - OPEN) / SPAN + '"></i><span class="ticks" aria-hidden="true"><span>8:30</span><span>14:00</span><span>20:00</span></span></div>' +
        '<span class="tm">' + (pick && pick.d === d ? hhmm(pick.h) : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>') + '</span></div>';
    }).join('');
    $$('.track', week).forEach(function (tr) {
      var d = +tr.parentNode.dataset.d, dragging = false;
      function at(e) { var r = tr.getBoundingClientRect(), f = (e.clientX - r.left) / r.width; if (rtl()) f = 1 - f; setPick(d, OPEN + clamp(f, 0, 1) * SPAN); }
      tr.addEventListener('pointerdown', function (e) { dragging = true; at(e); });
      tr.addEventListener('pointermove', function (e) { if (dragging && e.pointerType === 'mouse') at(e); });
      addEventListener('pointerup', function () { dragging = false; });
      tr.addEventListener('keydown', function (e) {
        var k = e.key, cur = pick && pick.d === d ? pick.h : H[d][0];
        if (k === 'ArrowRight' || k === 'ArrowUp') { e.preventDefault(); setPick(d, cur + (rtl() && k === 'ArrowRight' ? -.5 : .5), true); }
        if (k === 'ArrowLeft' || k === 'ArrowDown') { e.preventDefault(); setPick(d, cur - (rtl() && k === 'ArrowLeft' ? -.5 : .5), true); }
      });
    });
  }
  function setPick(d, h, kb) {
    var t = H[d]; h = clamp(Math.round(h * 2) / 2, t[0], t[1] - .5);
    pick = { d: d, h: h };
    $$('.day', week).forEach(function (row) {
      var dd = +row.dataset.d, sel = dd === d, tr = $('.track', row), tt = H[dd], hv = sel ? h : tt[0];
      row.classList.toggle('sel', sel);
      $('.thumb', row).style.setProperty('--t', ((hv - OPEN) / SPAN).toFixed(4));
      $('.tm', row).innerHTML = sel ? hhmm(h) : '<span dir="ltr">' + hhmm(tt[0]) + '–' + hhmm(tt[1]) + '</span>';
      tr.setAttribute('aria-valuenow', hv); tr.setAttribute('aria-valuetext', hhmm(hv));
    });
    if (kb) $('.day[data-d="' + d + '"] .track', week).focus();
    lightStep(1); write();
  }
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = areas.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.dataset[l ? 'he' : 'en']; });
    var s = l ? 'היי ליאן, אשמח לקבוע עיסוי' : 'Hi Lian, I’d like to book a massage';
    s += picked.length ? (l ? ', בעיקר ' + list(picked, true) + '.' : ', mainly for my ' + list(picked, false) + '.') : '.';
    if (pick) s += l ? ' נוח לי ביום ' + dayHe[pick.d] + ' בסביבות ' + hhmm(pick.h) + ', אם יש מקום.' : ' ' + dayEn[pick.d] + ' around ' + hhmm(pick.h) + ' would suit me, if you have a spot.';
    return s;
  }
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
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
  send.addEventListener('pointerenter', function () { lightStep(2); });
  send.addEventListener('focus', function () { lightStep(2); });
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- the address decodes into place
  var GL = 'אבגדהוזחטיכלמנסעפצקרשת0123456789';
  function decode(r) {
    var sp = $('span[lang="' + root.lang + '"]', r), txt = r.dataset[root.lang], t0 = performance.now();
    if (still()) { sp.textContent = txt; return; }
    var glyphs = root.lang === 'he' ? GL : 'ABCDEFGHKLMNRSTZ0123456789';
    (function st(t) {
      var k = (t - t0) / 900, out = '';
      for (var i = 0; i < txt.length; i++) out += txt[i] === ' ' || i / txt.length < k ? txt[i] : glyphs[Math.floor(Math.random() * glyphs.length)];
      sp.textContent = out; if (k < 1.05) requestAnimationFrame(st); else sp.textContent = txt;
    })(t0);
  }
  $$('[data-decode]').forEach(function (r, i) { watch(r, function (v) { if (v && r.dataset.done !== root.lang) { r.dataset.done = root.lang; setTimeout(function () { decode(r); }, i * 220); } }, { threshold: .5 }); });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var bottle = $('[data-bottle]'), nav = $('[data-nav]'), veil = $('[data-veil]'), copy = $('[data-hcopy]');
  var atlas = $('[data-atlas]'), rail = $('[data-rail]'), plates = $$('.plate'), abar = $('[data-abar]');
  var panels = $$('.panel'), RR = [-2.4, 1.6, -1.2, 2, -1.8];
  var spine = $$('[data-spine] li'), chapters = ['#top', '#atlas', '#clinic', '#write', '#reviews', '#faq', '#visit'].map(function (s) { return $(s); });
  $$('.draw path').forEach(function (p) { try { var L = Math.ceil(p.getTotalLength()); p.style.setProperty('--len', L); } catch (e) {} });
  function resetInline() {
    fig.style.transform = ''; veil.style.opacity = ''; stage.style.backgroundColor = ''; fig.classList.remove('diving'); copy.style.opacity = ''; copy.style.transform = '';
    rail.style.transform = ''; panels.forEach(function (p) { p.style.transform = ''; p.style.opacity = ''; });
    $$('.pic img').forEach(function (i) { i.style.setProperty('--px', '0px'); });
  }
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, vw = innerWidth;
    nav.classList.toggle('pill', scrollY > 40);
    bottle.classList.toggle('show', calm ? scrollY > 300 : hero.getBoundingClientRect().bottom < vh * 1.2 || scrollY > vh * .9);
    // spine: which chapter
    var cur = 0; chapters.forEach(function (c, i) { if (c.getBoundingClientRect().top < vh * .5) cur = i; });
    spine.forEach(function (s, i) { s.classList.toggle('on', i === cur); });
    if (calm) return;
    // hero: dive into the chart behind her, the clinic wall becomes the next chapter's colour
    var hp = prog(hero), e = smooth((hp - .08) / .8);
    if (e > 0) {
      var r0 = { l: fig.offsetLeft, t: fig.offsetTop, w: fig.offsetWidth, h: fig.offsetHeight };
      var fx = .3, fy = .14, S = lerp(1, Math.min(4.2, Math.max(vw / (r0.w * .32), vh / (r0.h * .3))), e);
      var tx = lerp(0, vw / 2 - (r0.l + r0.w * fx), e), ty = lerp(0, vh / 2 - (r0.t + r0.h * fy), e);
      fig.style.transformOrigin = (fx * 100) + '% ' + (fy * 100) + '%';
      fig.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + S.toFixed(4) + ')';
      fig.style.animation = 'none';
    } else { fig.style.transform = ''; }
    veil.style.opacity = smooth((hp - .5) / .46).toFixed(3);
    stage.style.backgroundColor = e > 0 ? 'color-mix(in srgb, #3a1f1a ' + (smooth(e * 1.6) * 100).toFixed(1) + '%, #1c130f)' : '';
    fig.classList.toggle('diving', e > .06);
    var cf = smooth(hp / .35); copy.style.opacity = (1 - cf).toFixed(3); copy.style.transform = 'translateY(' + (-cf * 60).toFixed(1) + 'px)';
    // atlas: the plates run sideways while you scroll down
    var ap = prog(atlas), maxX = Math.max(0, rail.scrollWidth - vw);
    rail.style.transform = 'translate3d(' + ((rtl() ? 1 : -1) * ap * maxX).toFixed(1) + 'px,0,0)';
    abar.parentNode.style.setProperty('--p', ap.toFixed(3)); abar.style.transform = 'scaleX(' + ap.toFixed(3) + ')';
    plates.forEach(function (p) {
      var r = p.getBoundingClientRect(), c = (r.left + r.width / 2 - vw / 2) / vw;
      if (Math.abs(c) < .38) p.classList.add('on');
      $('.pic img', p).style.setProperty('--px', (c * -40).toFixed(1) + 'px');
    });
    // reviews: each chart panel is pinned to the wall as it reaches you
    panels.forEach(function (p, i) {
      var r = p.getBoundingClientRect(), t = smooth((vh - r.top) / (vh * .38));
      p.style.transform = t >= 1 ? '' : 'translateY(' + ((1 - t) * 50).toFixed(1) + 'px) rotate(' + ((1 - t) * RR[i] * 3).toFixed(2) + 'deg) scale(' + (1 + (1 - t) * .06).toFixed(3) + ')';
      p.style.opacity = (.25 + .75 * t).toFixed(3);
    });
  }
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', function () { haze.size(); tick(); });

  // ---------------------------------------------------------------- start
  texts(root.lang); hours(); buildWeek(); write(true); tick();
  var go = function () { hero.classList.add('ready'); };
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(go); setTimeout(go, 600); } else go();
})();
