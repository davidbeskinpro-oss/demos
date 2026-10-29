(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth <= 860; };
  var io = 'IntersectionObserver' in window;

  /* ---------- language ---------- */
  var onLang = [];
  function applyLang() {
    $$('[data-alt-he]').forEach(function (i) { i.alt = i.dataset[he() ? 'altHe' : 'altEn']; });
    $$('[data-set-lang]').forEach(function (b) { b.setAttribute('aria-label', he() ? 'Switch to English' : 'מעבר לעברית'); });
    $('.links').setAttribute('aria-label', he() ? 'ניווט' : 'Navigation');
    $('[data-apps]').setAttribute('aria-label', he() ? 'מכשירים' : 'Appliances');
    $('[data-drift]').setAttribute('aria-label', he() ? 'ביקורות' : 'Reviews');
    $('[data-knob]').setAttribute('aria-label', he() ? 'הנושא הבא' : 'Next topic');
    $('[data-positions]').setAttribute('aria-label', he() ? 'נושא' : 'Topic');
    $('.d-wa').setAttribute('aria-label', he() ? 'וואטסאפ למאיר' : 'WhatsApp Meir');
    $('.d-call').setAttribute('aria-label', he() ? 'חייגו למאיר' : 'Call Meir');
    document.title = he() ? 'מאיר חשמל · חשמלאי מוסמך וראשי · הנרייטה סולד 16, קריית אתא' : 'Meir Electric · Licensed master electrician · 16 Henrietta Szold St, Kiryat Ata';
    onLang.forEach(function (f) { f(); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('meir-lang', l); } catch (e) {}
    var u = new URL(location.href); if (l === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang');
    history.replaceState(null, '', u);
    applyLang();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  /* ---------- motion switch ---------- */
  var onMotion = [];
  function motionUI() { $$('[data-motion]').forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  $$('[data-motion]').forEach(function (b) { b.addEventListener('click', function () {
    var on = still(); root.classList.toggle('still', !on);
    try { localStorage.setItem('meir-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI(); onMotion.forEach(function (f) { f(); });
  }); });
  motionUI();

  /* ---------- name: letters light up one by one ---------- */
  $$('[data-letters]').forEach(function (el) {
    var i = 0;
    el.innerHTML = el.textContent.split(' ').map(function (w) {
      return '<span style="white-space:nowrap">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });
  var nameEl = $('.name');
  function fitName() {
    var band = $('.band'), sp = $('[lang="' + root.lang + '"]', nameEl);
    nameEl.style.fontSize = '';
    var cs = parseFloat(getComputedStyle(nameEl).fontSize), avail = band.clientWidth - 48, w = sp.getBoundingClientRect().width;
    var maxH = band.clientHeight * 0.86 / 0.88;
    var size = Math.min(cs * avail / w, maxH);
    nameEl.style.fontSize = Math.floor(size) + 'px';
  }
  requestAnimationFrame(function () { requestAnimationFrame(function () { nameEl.classList.add('lit'); }); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitName);
  fitName(); onLang.push(fitName);

  /* ---------- counters roll up; stars ---------- */
  var STAR = '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>';
  $$('.stars').forEach(function (el) { el.innerHTML = STAR + STAR + STAR + STAR + STAR; });
  function roll(el) {
    var to = parseFloat(el.dataset.odo), dec = (el.dataset.odo.split('.')[1] || '').length;
    if (still()) { el.textContent = el.dataset.odo; return; }
    var t0 = performance.now(), D = 1300;
    (function f(t) { var k = clamp((t - t0) / D, 0, 1), e = 1 - Math.pow(1 - k, 3); el.textContent = (to * e).toFixed(dec); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  $$('[data-odo]').forEach(function (el) {
    if (still() || !io) { el.textContent = el.dataset.odo; return; }
    el.textContent = (0).toFixed(1);
    new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(el); ob.disconnect(); } }, { threshold: 0.6 }).observe(el);
  });
  onMotion.push(function () { if (still()) $$('[data-odo]').forEach(function (el) { el.textContent = el.dataset.odo; }); });

  /* ---------- hours + live status ---------- */
  // Sun..Sat; null = closed. A day of [0, 24] reads as open all day.
  var HOURS = [[8, 23.5], [8, 23.5], [8, 23.5], [8, 23.5], [8, 23.5], [8, 17], null];
  var DAYS = { he: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] };
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false })
      .formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = now(), t = HOURS[n.d], l = he() ? 'he' : 'en', txt, open = false;
    if (HOURS.every(function (x) { return x && x[0] === 0 && x[1] === 24; })) { open = true; txt = he() ? 'פתוח 24/7' : 'Open 24/7'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = he() ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else {
      var k, d;
      for (k = 0; k < 8; k++) { d = (n.d + k) % 7; if (HOURS[d] && (k > 0 || n.h < HOURS[d][0])) break; }
      var when = k === 0 ? (he() ? 'היום' : 'today') : k === 1 ? (he() ? 'מחר' : 'tomorrow') : (he() ? 'ביום ' + DAYS.he[d] : 'on ' + DAYS.en[d]);
      txt = he() ? 'סגור עכשיו · נפתח ' + when + ' ב־' + hhmm(HOURS[d][0]) : 'Closed now · opens ' + when + ' at ' + hhmm(HOURS[d][0]);
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span><span>' + txt + '</span>'; });
    var tb = $('[data-hours]');
    tb.innerHTML = HOURS.map(function (h, i) {
      var v = h ? (h[0] === 0 && h[1] === 24 ? '24h' : hhmm(h[0]) + '–' + hhmm(h[1])) : (he() ? 'סגור' : 'Closed');
      return '<tr' + (i === n.d ? ' class="today"' : '') + '><td>' + DAYS[l][i] + '</td><td>' + v + '</td></tr>';
    }).join('');
  }
  status(); setInterval(status, 60000); onLang.push(status);

  /* ---------- hero: callouts type onto the lights in his photo ---------- */
  var stage = $('[data-stage]'), img = $('.room', stage), drift = $('.drift', stage);
  var POINTS = [
    { x: 0.905, y: 0.06, he: 'גוף תאורה עגול', en: 'Round ceiling light' },
    { x: 0.51, y: 0.385, he: 'גוף תאורה עגול', en: 'Round ceiling light' },
    { x: 0.40, y: 0.435, he: 'פס תאורה', en: 'Linear light' }
  ];
  var cos = [], glows = [];
  POINTS.forEach(function (p, i) {
    var c = document.createElement('div'); c.className = 'co'; c.innerHTML = '<span class="dot"></span><span class="tag"></span>';
    $('.callouts', stage).appendChild(c); cos.push(c);
    if (true) { var g = document.createElement('div'); g.className = 'glow'; $('.glows', stage).appendChild(g); glows.push(g); } else glows.push(null);
  });
  function placeCo() {
    var W = drift.clientWidth, H = drift.clientHeight, iw = 1200, ih = 1600, s = Math.max(W / iw, H / ih);
    var ox = (W - iw * s) * 0.5, oy = (H - ih * s) * 0.45;
    POINTS.forEach(function (p, i) {
      var x = ox + p.x * iw * s, y = oy + p.y * ih * s, vis = x > 16 && x < W - 16 && y > 16 && y < H - 60;
      [cos[i], glows[i]].forEach(function (el) { if (!el) return; el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.display = vis ? '' : 'none'; });
      cos[i].classList.toggle('flip', root.dir === 'rtl' ? x < 190 : x > W - 190);
      cos[i]._vis = vis;
    });
  }
  var active = -1, typeT;
  function activate(i) {
    if (i === active) return;
    active = i;
    cos.forEach(function (c, k) {
      c.classList.toggle('on', k === i);
      if (glows[k]) glows[k].classList.toggle('on', k === i || (i >= 0 && k === 2 && i === 1));
      var tag = $('.tag', c); if (k !== i) tag.textContent = '';
    });
    clearInterval(typeT);
    if (i < 0) return;
    var tag = $('.tag', cos[i]), txt = POINTS[i][he() ? 'he' : 'en'], n = 0;
    if (still()) { tag.textContent = txt; return; }
    typeT = setInterval(function () { tag.textContent = txt.slice(0, ++n); if (n >= txt.length) clearInterval(typeT); }, 38);
  }
  var cycleI = 0, cycleT, lastPointer = 0;
  function cycle() {
    clearTimeout(cycleT);
    if (performance.now() - lastPointer > 2500) {
      var vis = cos.map(function (c, i) { return c._vis ? i : -1; }).filter(function (i) { return i >= 0; });
      if (vis.length) { cycleI = (cycleI + 1) % vis.length; activate(-1); activate(vis[cycleI]); }
    }
    cycleT = setTimeout(cycle, 2800);
  }
  stage.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    lastPointer = performance.now();
    var r = drift.getBoundingClientRect(), best = -1, bd = 1e9;
    cos.forEach(function (c, i) { if (!c._vis) return; var dx = parseFloat(c.style.left) - (e.clientX - r.left), dy = parseFloat(c.style.top) - (e.clientY - r.top), d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } });
    activate(best);
  });
  stage.addEventListener('click', function () { lastPointer = 0; cycle(); });
  placeCo(); addEventListener('resize', placeCo);
  setTimeout(function () { activate(cos[1]._vis ? 1 : 0); cycleT = setTimeout(cycle, 2800); }, still() ? 0 : 900);
  onLang.push(function () { var a = active; active = -1; activate(a); placeCo(); });

  /* ---------- the board: pieces flip up like breaker levers ---------- */
  var mosaic = $('[data-mosaic]'), pieces = [];
  var LAYOUT = {
    wide: { cols: 6, rows: 4, taken: { '1,6': 1, '2,2': 1, '3,5': 1, '4,1': 1, '4,4': 1 } },
    tall: { cols: 3, rows: 6, taken: { '1,2': 1, '1,3': 1, '3,1': 1, '4,3': 1, '6,2': 1 } }
  };
  var mode = '';
  function buildMosaic() {
    var m = phone() ? 'tall' : 'wide'; if (m === mode) return; mode = m;
    pieces.forEach(function (p) { p.remove(); }); pieces = [];
    var L = LAYOUT[m], order = [];
    for (var r = 1; r <= L.rows; r++) for (var c = L.cols; c >= 1; c--) if (!L.taken[r + ',' + c]) order.push([r, c]);
    order.forEach(function (rc, k) {
      var d = document.createElement('div'); d.className = 'pc'; d.setAttribute('aria-hidden', 'true');
      d.style.gridArea = rc[0] + ' / ' + rc[1];
      var i = document.createElement('i');
      i.style.backgroundPosition = ((rc[1] - 1) / (L.cols - 1) * 100) + '% ' + ((rc[0] - 1) / (L.rows - 1) * 100) + '%';
      d.appendChild(i); mosaic.appendChild(d); d._k = k; d._n = order.length; pieces.push(d);
    });
    flip();
  }
  function flip() {
    if (still()) { pieces.forEach(function (p) { p.firstChild.style.transform = ''; p.firstChild.style.filter = ''; }); return; }
    var r = mosaic.getBoundingClientRect(), vh = innerHeight;
    var p = clamp((vh - r.top) / (vh * 0.55 + r.height * 0.55), 0, 1);
    pieces.forEach(function (pc) {
      var t0 = pc._k / pc._n * 0.62, l = clamp((p - t0) / 0.38, 0, 1), e = 1 - Math.pow(1 - l, 3);
      pc.firstChild.style.transform = 'rotateX(' + ((1 - e) * -96).toFixed(2) + 'deg)';
      pc.firstChild.style.filter = 'brightness(' + (0.35 + 0.65 * e + (l > 0.96 && l < 1 ? 0.25 : 0)).toFixed(3) + ')';
    });
  }
  buildMosaic(); addEventListener('resize', buildMosaic);
  onMotion.push(flip);

  /* ---------- load check ---------- */
  var gauge = $('.gauge'), needle = $('.needle', gauge), MAX = 32, LIMIT = 16;
  (function ticks() {
    var t = '', n = '';
    for (var a = 0; a <= MAX; a += 2) {
      var ang = Math.PI * (1 - a / MAX), big = a % 8 === 0, r1 = 124, r2 = big ? 106 : 114;
      var x1 = 160 + r1 * Math.cos(ang), y1 = 170 - r1 * Math.sin(ang), x2 = 160 + r2 * Math.cos(ang), y2 = 170 - r2 * Math.sin(ang);
      t += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke-width="' + (big ? 2.4 : 1.2) + '"/>';
      if (big) n += '<text x="' + (160 + 92 * Math.cos(ang)).toFixed(1) + '" y="' + (174 - 92 * Math.sin(ang)).toFixed(1) + '">' + a + '</text>';
    }
    $('.ticks', gauge).innerHTML = t; $('.nums', gauge).innerHTML = n;
  })();
  var apps = $$('.app'), splitBtn = $('[data-split]'), split = false, shown = false;
  var readout = $('[data-amps]'), lines = $$('[data-lines] .ln');
  function amps(w) { return w / 230; }
  function loadUI() {
    var on = apps.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return +b.dataset.w; });
    var total = on.reduce(function (s, w) { return s + amps(w); }, 0);
    var L = [0, 0, 0];
    if (split) on.slice().sort(function (a, b) { return b - a; }).forEach(function (w) { var k = L.indexOf(Math.min.apply(null, L)); L[k] += amps(w); });
    else L[0] = total;
    var main = split ? Math.max.apply(null, L) : total, show = shown || still() ? main : 0;
    var deg = -90 + 180 * clamp(show, 0, MAX + 1) / MAX;
    needle.style.transform = 'rotate(' + deg.toFixed(1) + 'deg)';
    readout.textContent = show.toFixed(1);
    readout.parentNode.classList.toggle('over', main > LIMIT);
    lines.forEach(function (ln, i) {
      $('b', ln).style.width = (shown || still() ? clamp(L[i] / MAX, 0, 1) * 100 : 0) + '%';
      $('.amp', ln).textContent = L[i].toFixed(1) + 'A';
      ln.classList.toggle('over', L[i] > LIMIT);
      $('.lbl', ln).textContent = (he() ? 'קו ' : 'Line ') + (i + 1);
    });
    var v = $('[data-verdict]'), over = main > LIMIT;
    if (!on.length) v.textContent = he() ? 'שום דבר לא עובד. סמנו מכשיר.' : 'Nothing is on. Tick an appliance.';
    else if (!split) v.textContent = over ? (he() ? 'הכול על קו אחד: ' + total.toFixed(1) + 'A. המפסק עלול לקפוץ.' : 'All on one line: ' + total.toFixed(1) + ' A. The breaker may trip.') : (he() ? 'בתוך הגבול של קו 16 אמפר.' : 'Within a 16 A line.');
    else v.textContent = over ? (he() ? 'גם בחלוקה, מכשיר אחד כבד מדי לקו רגיל. כאן צריך קו ייעודי.' : 'Even split, one appliance is too heavy for a normal line. It needs its own.') : (he() ? 'בחלוקה לשלושה קווים, כל קו בתוך הגבול.' : 'Split across three lines, each one stays within the limit.');
  }
  apps.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); loadUI(); }); });
  splitBtn.addEventListener('click', function () { split = !split; splitBtn.setAttribute('aria-pressed', split); loadUI(); });
  if (io) new IntersectionObserver(function (es) { if (es[0].isIntersecting && !shown) { shown = true; loadUI(); } }, { threshold: 0.45 }).observe(gauge);
  else shown = true;
  loadUI(); onLang.push(loadUI); onMotion.push(loadUI);

  /* ---------- the kitchen closes into the round light ---------- */
  var shrink = $('.shrink'), disc = $('[data-disc]'), stext = $('.shrink-text');
  function shrinkFrame() {
    if (still()) { disc.style.removeProperty('--rad'); disc.style.removeProperty('--zs'); stext.style.removeProperty('--to'); return; }
    var r = shrink.getBoundingClientRect(), span = r.height - innerHeight;
    var p = clamp(-r.top / Math.max(span, 1), 0, 1), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    var vmin = Math.min(innerWidth, innerHeight), full = Math.hypot(innerWidth, innerHeight) / 2;
    var endR = vmin * (phone() ? 0.36 : 0.3);
    disc.style.setProperty('--rad', (full + (endR - full) * e).toFixed(1) + 'px');
    disc.style.setProperty('--zs', (1 + 0.18 * e).toFixed(3));
    stext.style.setProperty('--to', clamp((p - 0.8) / 0.18, 0, 1).toFixed(3));
    disc.style.transform = 'translateY(' + (-(phone() ? 9 : 7) * e).toFixed(2) + 'svh)';
  }
  onMotion.push(function () { disc.style.transform = ''; shrinkFrame(); });

  /* ---------- reviews drift; a touch or hover pauses them ---------- */
  var row = $('[data-drift]'), rowVis = false, held = 0, dir = 1;
  if (io) new IntersectionObserver(function (es) { rowVis = es[0].isIntersecting; if (rowVis) tickDrift(); }, { threshold: 0.3 }).observe(row);
  ['pointerdown', 'wheel', 'touchstart', 'focusin'].forEach(function (ev) { row.addEventListener(ev, function () { held = performance.now() + 4000; }, { passive: true }); });
  row.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') held = Infinity; });
  row.addEventListener('pointerleave', function () { held = performance.now() + 800; });
  var driftRaf = 0;
  function tickDrift() {
    if (driftRaf) return;
    (function f() {
      driftRaf = 0;
      if (!rowVis || still()) return;
      if (performance.now() > held) {
        var max = row.scrollWidth - row.clientWidth, sign = root.dir === 'rtl' ? -1 : 1, pos = Math.abs(row.scrollLeft);
        if (pos >= max - 1) dir = -1; else if (pos <= 0) dir = 1;
        row.style.scrollSnapType = 'none';
        row.scrollLeft += sign * dir * 0.6;
      } else row.style.scrollSnapType = '';
      driftRaf = requestAnimationFrame(f);
    })();
  }
  onMotion.push(function () { row.style.scrollSnapType = ''; tickDrift(); });

  /* ---------- composer: the rotary selector ---------- */
  var TOPICS = {
    he: ['לוח החשמל או תקלה', 'תאורה', 'עמדת טעינה לרכב חשמלי', 'דוד חשמל', 'עבודת חשמל אחרת'],
    en: ['the electrical board or a fault', 'lighting', 'an EV charging point', 'a water heater', 'some other electrical work']
  };
  var topic = 0, radios = $$('[data-topic]'), knob = $('[data-knob]'), details = $('[data-details]'), preview = $('[data-preview]'), send = $('[data-send]');
  function compose() {
    radios.forEach(function (b, i) { b.setAttribute('aria-checked', i === topic ? 'true' : 'false'); });
    $('.knob-grip', knob).style.setProperty('--k', (-60 + topic * 30) + 'deg');
    var d = details.value.trim(), t = TOPICS[he() ? 'he' : 'en'][topic];
    var msg = he() ? 'היי מאיר, הגעתי דרך האתר. אשמח לעזרה בנושא ' + t + '.' + (d ? ' ' + d : '')
                   : 'Hi Meir, I found you through your website. I’d like help with ' + t + '.' + (d ? ' ' + d : '');
    preview.textContent = msg;
    send.href = 'https://wa.me/972584203328?text=' + encodeURIComponent(msg);
  }
  radios.forEach(function (b, i) { b.addEventListener('click', function () { topic = i; compose(); }); });
  knob.addEventListener('click', function () { topic = (topic + 1) % radios.length; compose(); });
  details.addEventListener('input', compose);
  $('[data-compose]').addEventListener('submit', function (e) { e.preventDefault(); send.click(); });
  compose(); onLang.push(compose);
  onLang.push(function () {
    $('[data-wa-photo]').href = 'https://wa.me/972584203328?text=' + encodeURIComponent(he() ? 'היי מאיר, שולח תמונה של הלוח שלי' : 'Hi Meir, sending a photo of my electrical board');
    details.placeholder = he() ? 'למשל: המפסק קופץ כשהתנור עובד' : 'e.g. the breaker trips when the oven runs';
  });

  /* ---------- dock + reveals ---------- */
  var dock = $('[data-dock]'), heroEl = $('.hero');
  if (io) new IntersectionObserver(function (es) { dock.classList.toggle('show', !es[0].isIntersecting); }, { threshold: 0.15 }).observe(heroEl);
  else dock.classList.add('show');
  $$('.rows [data-reveal]').forEach(function (el, i) { el.style.setProperty('--d', (i % 3) * 80 + 'ms'); });
  if (io) {
    var rio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { threshold: 0.15 });
    $$('[data-reveal]').forEach(function (el) { rio.observe(el); });
  } else $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });

  /* ---------- one scroll loop ---------- */
  var ticking = false;
  function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(function () { ticking = false; flip(); shrinkFrame(); }); }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  applyLang();
})();
