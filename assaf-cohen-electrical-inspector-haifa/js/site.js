(function () {
  var root = document.documentElement, WA = '972506369972';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth <= 860; };
  var TITLE = { he: 'אסף דטינקה כהן · מהנדס ובודק חשמל · אלכסנדר זייד 81, חיפה', en: 'Assaf Datinka Cohen · Electrical engineer & inspector · 81 Alexander Zaid St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור מהנדס ובודק חשמל אסף דטינקה כהן · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for electrical engineer & inspector Assaf Datinka Cohen · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'אסף דטינקה כהן, מהנדס ובודק חשמל', 'Assaf Datinka Cohen, electrical engineer & inspector');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-dial]', 'סוג הבדיקה', 'Type of test');
    aria('[data-t-prev]', 'השורה הקודמת', 'Previous line');
    aria('[data-t-next]', 'השורה הבאה', 'Next line');
    aria('[data-t-call]', 'התקשרו לאסף, 050-636-9972', 'Call Assaf, 050-636-9972');
    $$('[data-t-wa]').forEach(function (a) { a.removeAttribute('aria-label'); });
    var inp = $('[data-where]'); inp.placeholder = inp.dataset[l === 'he' ? 'phHe' : 'phEn'];
    $$('.spot').forEach(function (s) { $('.tag', s).textContent = s.dataset[l]; });
    $$('[data-decode]').forEach(function (d) { d.textContent = d.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('adk-lang', l); } catch (e) {}
    texts(l); hours(); report.show(report.cur, true); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('adk-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    hero.classList.add('ready');
    clearStyles(); layout(); scan.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 17], 1: [9, 17], 2: [9, 17], 3: [9, 17], 4: [9, 17], 5: [9, 12], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function allDay(t) { return t && t[0] === 0 && t[1] === 24; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = allDay(t) ? (l ? 'פתוח עכשיו' : 'Open now') : (l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1])); }
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
  // consecutive days with the same hours share a row; the week starts on Sunday
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : allDay(t) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline letter by letter
  function split(el, base) {
    var i = base || 0;
    el.innerHTML = el.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  }
  $$('[data-split] .ln > span[lang]').forEach(function (sp) { split(sp, sp.closest('.ln').classList.contains('acc') ? 14 : 0); });

  // labels decode out of scrambled glyphs when their tile arrives
  var GL = '01<>/#=%+*ΩΔ';
  function decode(el) {
    var target = el.dataset[root.lang], n = 0;
    if (still()) { el.textContent = target; return; }
    (function st() {
      n++;
      el.textContent = target.split('').map(function (c, i) { return i < n / 2 || c === ' ' ? c : GL[(Math.random() * GL.length) | 0]; }).join('');
      if (n / 2 < target.length) setTimeout(st, 40); else el.textContent = target;
    })();
  }
  $$('[data-decode]').forEach(function (d) { watch(d, function (v) { if (v) decode(d); }, { threshold: 1 }); });

  // ---------------------------------------------------------------- hero: the thermal band follows the hand (or sweeps by itself) and reads the spot
  var hero = $('[data-hero]');
  var scan = (function () {
    var fig = $('[data-scan]'), irImg = $('[data-ir]'), temp = $('[data-temp]'), spots = $$('.spot', fig);
    var gx = 0, gy = 0, grid = null, GW = 40, GH = 60, raf = 0, vis = true, aim = null, cur = { x: .62, y: .38 }, t0 = performance.now();
    function sample() {
      try {
        var c = document.createElement('canvas'); c.width = GW; c.height = GH;
        var x = c.getContext('2d'); x.drawImage(irImg, 0, 0, GW, GH);
        var d = x.getImageData(0, 0, GW, GH).data; grid = new Float32Array(GW * GH);
        for (var i = 0; i < GW * GH; i++) grid[i] = (d[i * 4] * .5 + d[i * 4 + 1] * .4 + d[i * 4 + 2] * .1) / 255;
      } catch (e) { grid = null; }
    }
    if (irImg.complete) sample(); else irImg.addEventListener('load', sample);
    // map a point of the photo (0..1) to the frame, given object-fit: cover at 50% 45%
    function map(px, py) {
      var W = fig.clientWidth, Hh = fig.clientHeight, iw = 1004, ih = 1500, s = Math.max(W / iw, Hh / ih) * 1.04;
      var dw = iw * s, dh = ih * s;
      return { x: (W - dw) * .5 + px * dw, y: (Hh - dh) * .45 + py * dh };
    }
    function unmap(fx, fy) {
      var W = fig.clientWidth, Hh = fig.clientHeight, s = Math.max(W / 1004, Hh / 1500) * 1.04;
      return { x: (fx - (W - 1004 * s) * .5) / (1004 * s), y: (fy - (Hh - 1500 * s) * .45) / (1500 * s) };
    }
    function place() {
      var W = fig.clientWidth;
      spots.forEach(function (s) { var p = map(+s.dataset.x, +s.dataset.y); s.style.setProperty('--sx', p.x.toFixed(1) + 'px'); s.style.setProperty('--syy', p.y.toFixed(1) + 'px'); s.classList.toggle('flip', p.x > W * .55); });
    }
    function read(fx, fy) {
      if (!grid) return 34.0;
      var p = unmap(fx, fy), i = clamp(Math.round(p.x * (GW - 1)), 0, GW - 1), j = clamp(Math.round(p.y * (GH - 1)), 0, GH - 1);
      return 22 + grid[j * GW + i] * 14;
    }
    function frame(t) {
      raf = 0;
      if (still()) return;
      var W = fig.clientWidth, Hh = fig.clientHeight;
      var tx, ty;
      if (aim) { tx = aim.x; ty = aim.y; }
      else { var k = (t - t0) / 1000; tx = .5 + Math.sin(k * .45) * .32; ty = .5 + Math.sin(k * .3 + 1) * .36; }
      cur.x += (tx - cur.x) * .08; cur.y += (ty - cur.y) * .08;
      var sy = cur.y * Hh, band = Hh * .2;
      fig.style.setProperty('--sy', sy.toFixed(1) + 'px');
      fig.style.setProperty('--mx', (cur.x * W).toFixed(1) + 'px');
      fig.style.setProperty('--bt', Math.max(0, sy - band).toFixed(1) + 'px');
      fig.style.setProperty('--bb', Math.max(0, Hh - sy - band).toFixed(1) + 'px');
      temp.textContent = read(cur.x * W, sy).toFixed(1) + '°C';
      spots.forEach(function (s) { var y = parseFloat(s.style.getPropertyValue('--syy')); s.classList.toggle('on', Math.abs(y - sy) < band * 1.1); });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); if (still()) spots.forEach(function (s) { s.classList.add('on'); }); }
    function pt(e) { var r = fig.getBoundingClientRect(); aim = { x: clamp((e.clientX - r.left) / r.width, .05, .95), y: clamp((e.clientY - r.top) / r.height, .05, .95) }; }
    fig.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') pt(e); });
    fig.addEventListener('pointerdown', function (e) { pt(e); clearTimeout(fig._t); fig._t = setTimeout(function () { aim = null; }, 3500); });
    fig.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') aim = null; });
    // the photo leans a little toward the hand
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse' || still()) return; fig.style.setProperty('--px', ((e.clientX / innerWidth - .5) * -14).toFixed(1) + 'px'); fig.style.setProperty('--py', ((e.clientY / innerHeight - .5) * -10).toFixed(1) + 'px'); });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { kick: kick, place: place };
  })();

  // bento spotlight
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- report: printed by the scroll; arrows step it when motion is off
  var report = (function () {
    var sec = $('[data-report]'), paper = $('[data-paper]'), rowsEl = $$('[data-row]'), stamp = $('[data-stamp]');
    var photos = $$('[data-rphoto] img'), cap = $('[data-rcap]'), count = $('[data-rcount]'), cur = 0;
    var CAP = { he: ['בדיקה ויזואלית ובידוד · הלוח', 'הארקה ולולאה · בשטח', 'מפסק המגן · מכשיר בבדיקה', 'סריקה תרמית · מבט להמחשה'], en: ['Visual & insulation · the panel', 'Earthing & loop · in the field', 'RCD · appliance under test', 'Thermal scan · illustrative view'] };
    function show(i, force) {
      i = clamp(i, 0, rowsEl.length - 1); if (i === api.cur && !force) return; api.cur = i;
      rowsEl.forEach(function (r, k) { r.classList.toggle('cur', k === i); });
      var ph = +rowsEl[i].dataset.ph;
      photos.forEach(function (p, k) { p.classList.toggle('on', k === ph); });
      cap.textContent = CAP[root.lang][ph];
      count.textContent = (i + 1) + ' / ' + rowsEl.length;
    }
    function update(p) {
      if (still()) { paper.style.setProperty('--feed', 1); rowsEl.forEach(function (r) { r.classList.add('on'); }); stamp.classList.add('on'); sec.classList.remove('printing'); return; }
      var feed = smooth(p / .8);
      paper.style.setProperty('--feed', feed.toFixed(4));
      var n = Math.floor(clamp(p / .8, 0, .999) * rowsEl.length);
      rowsEl.forEach(function (r, k) { r.classList.toggle('on', k <= n && p > .04); });
      stamp.classList.toggle('on', p > .86);
      sec.classList.toggle('printing', p > .02 && p < .82);
      show(p > .04 ? n : 0);
    }
    $$('[data-rstep]').forEach(function (b) { b.addEventListener('click', function () {
      var to = clamp(api.cur + +b.dataset.rstep, 0, rowsEl.length - 1);
      if (still()) { show(to); return; }
      var top = sec.getBoundingClientRect().top + scrollY, span = sec.offsetHeight - innerHeight;
      scrollTo({ top: top + span * .8 * (to + .5) / rowsEl.length, behavior: 'smooth' });
    }); });
    var api = { cur: -1, show: show, update: update, sec: sec };
    show(0, true);
    return api;
  })();

  // ---------------------------------------------------------------- odometer
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 3) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .4 }).observe(o); else roll(o, true);
  });
  // reviews: two copies so the drift loops seamlessly
  var track = $('[data-track]');
  $$('.rv', track).forEach(function (r) { var k = r.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.classList.add('dup'); track.appendChild(k); });

  // ---------------------------------------------------------------- the dial composer
  var knob = $('[data-knob]'), knobW = $('.knob-w'), posEl = $$('.pos'), where = $('[data-where]'), msgEl = $('[data-msg]'), steps = $$('[data-steps] li');
  var ANG = [-125, -75, -25, 25, 75, 125], sel = 0, shown = '', typing = 0, chatSeen = false;
  function placeDial() {
    var R = Math.min(118, ($('.m-dial').clientWidth / 2) - 44);
    posEl.forEach(function (p, i) { var a = ANG[i] * Math.PI / 180; p.style.setProperty('--lx', (Math.sin(a) * R).toFixed(1) + 'px'); p.style.setProperty('--ly', (-Math.cos(a) * R).toFixed(1) + 'px'); });
  }
  function choose(i, user) {
    sel = i; knob.style.setProperty('--ka', ANG[i] + 'deg');
    posEl.forEach(function (p, k) { p.setAttribute('aria-checked', k === i ? 'true' : 'false'); p.tabIndex = k === i ? 0 : -1; });
    if (user) { steps[0].classList.add('on'); write(); }
  }
  posEl.forEach(function (p, i) {
    p.addEventListener('click', function () { choose(i, true); });
    p.addEventListener('keydown', function (e) { var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (d) { e.preventDefault(); var n = (sel + d + 6) % 6; choose(n, true); posEl[n].focus(); } });
  });
  var turning = false;
  function angleAt(e) { var r = knobW.getBoundingClientRect(); return Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI; }
  knobW.addEventListener('pointerdown', function (e) { turning = true; knobW.setPointerCapture(e.pointerId); });
  knobW.addEventListener('pointermove', function (e) {
    if (!turning) return;
    var a = angleAt(e), best = 0; ANG.forEach(function (x, i) { if (Math.abs(x - a) < Math.abs(ANG[best] - a)) best = i; });
    if (best !== sel) choose(best, true);
  });
  knobW.addEventListener('pointerup', function () { turning = false; });
  where.addEventListener('input', function () { steps[1].classList.toggle('on', !!where.value.trim()); write(); });
  $('[data-send]').addEventListener('pointerenter', function () { steps[2].classList.add('on'); });
  $('[data-send]').addEventListener('focus', function () { steps[2].classList.add('on'); });
  function compose() {
    var l = he(), p = posEl[sel].dataset[l ? 'he' : 'en'], w = where.value.trim();
    return l ? 'שלום אסף, אשמח לתאם ' + p + (w ? ' ב' + w : '') + '. מתי אפשר?'
             : 'Hi Assaf, I’d like to arrange ' + p + (w ? ' in ' + w : '') + '. When would suit you?';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
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
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .5 });

  // ---------------------------------------------------------------- footer wordmark: fit to width, letters rise and fill with heat
  var fw = $('[data-fit]');
  $$('span[lang]', fw).forEach(function (s) { split(s); var cs = $$('.ch', s), HEAT = ['#7a1290', '#a51c84', '#c8286e', '#e04a48', '#f06428', '#f8892c', '#ffb828', '#ffd770', '#fff3c8'];
    cs.forEach(function (c, i) { c.style.setProperty('--k', (1 + (i % 5) * .35).toFixed(2)); c.style.setProperty('--c', HEAT[Math.round(i / Math.max(1, cs.length - 1) * (HEAT.length - 1))]); c.dataset.f = (i / cs.length).toFixed(3); }); });
  var fch = $$('.ch', fw);
  function fit() { fw.style.fontSize = '100px'; var s = $('span[lang="' + root.lang + '"]', fw), w = s.getBoundingClientRect().width || 1; fw.style.fontSize = Math.floor(100 * (fw.clientWidth * .98) / w) + 'px'; }

  // ---------------------------------------------------------------- one scroll loop
  var nav = $('[data-nav]'), dock = $('[data-dock]'), who = $('[data-who]'), rail = $('[data-rail]'), cards = $$('.rc', rail);
  var reach = $('[data-reach]'), kphoto = $('[data-kphoto]'), kslot = $('[data-kslot]'), krows = $$('[data-krows] > *'), foot = $('.foot'), concept = $('.concept');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function clearStyles() {
    rail.style.transform = ''; cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; });
    krows.forEach(function (r) { r.style.opacity = ''; r.style.transform = ''; }); 
    hero.style.removeProperty('--hp');
  }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, y = scrollY;
    nav.classList.toggle('pill', y > 30);
    dock.classList.toggle('show', y > vh * .6);
    // hero sinks back as the tests card lands over it
    if (!calm) { var hp = clamp(y / vh, 0, 1); hero.style.setProperty('--hp', hp.toFixed(3)); }
    // report printer
    report.update(prog(report.sec));
    // the rail slides sideways along a shallow curve
    if (!calm) {
      var p = prog(who), rw = rail.offsetWidth, span = Math.max(0, rw - innerWidth), rtlm = root.dir === 'rtl';
      var tx = (rtlm ? 1 : -1) * lerp(-span * .05, span, smooth(p)), base = rtlm ? rail.parentNode.clientWidth - rw : 0;
      rail.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,0,0)';
      cards.forEach(function (c) {
        var d = ((base + tx + c.offsetLeft + c.offsetWidth / 2) - innerWidth / 2) / innerWidth;
        c.style.transform = 'rotateY(' + clamp(d * -38, -50, 50).toFixed(2) + 'deg) translateZ(' + (-Math.min(1.2, Math.abs(d)) * 220).toFixed(1) + 'px)';
        c.style.filter = 'brightness(' + (1 - Math.min(.55, Math.abs(d) * .7)).toFixed(3) + ')';
      });
    }
    // contact: the photo starts as wide as the whole block and settles into its frame; the cards rise beside it
    var rr = reach.getBoundingClientRect(), kp = calm ? 1 : smooth((vh * .85 - rr.top) / (vh * .75));
    var ks = kslot.parentNode.getBoundingClientRect(), kr = kslot.getBoundingClientRect();
    kphoto.style.setProperty('--kt', ((kr.top - ks.top) * kp).toFixed(1) + 'px'); kphoto.style.setProperty('--kb', ((ks.bottom - kr.bottom) * kp).toFixed(1) + 'px');
    kphoto.style.setProperty('--kl', ((kr.left - ks.left) * kp).toFixed(1) + 'px'); kphoto.style.setProperty('--kr', ((ks.right - kr.right) * kp).toFixed(1) + 'px');
    krows.forEach(function (r, i) { if (calm) return; var v = smooth((kp - .55 - i * .06) / .3); r.style.opacity = v.toFixed(3); r.style.transform = v >= 1 ? '' : 'translateY(' + ((1 - v) * 30).toFixed(1) + 'px)'; });
    // footer letters rise and fill as the curtain lifts
    var fr = foot.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / (fr.height * .9));
    foot.style.setProperty('--fp', fp.toFixed(3));
    fch.forEach(function (c) { c.classList.toggle('lit', fp >= .999 || fp > +c.dataset.f * .9 + .08); });
  }
  function layout() {
    root.style.setProperty('--cb', concept.offsetHeight + 'px');
    hero.style.top = Math.min(0, innerHeight - hero.offsetHeight) + 'px';
    scan.place(); placeDial(); fit(); tick();
  }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); choose(0); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); scan.kick(); layout(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 900);
  addEventListener('load', layout);
})();
