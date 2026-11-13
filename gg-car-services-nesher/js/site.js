(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- language ---------- */
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור גג שירותי רכב · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for G.G. Car Services · This is not the business’s official website' };
  function texts() {
    var l = root.lang;
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var m = $('[data-model]'); m.placeholder = m.dataset[l === 'he' ? 'phHe' : 'phEn'];
    document.title = l === 'he' ? 'ג.ג. שירותי רכב · מולטימדיה, מצלמות ואביזרים לרכב · דרך בר יהודה 143, נשר' : 'G.G. Car Services · Car multimedia, cameras & accessories · 143 Derech Bar Yehuda, Nesher';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('gg-lang', l); } catch (e) {}
    texts(); hours(); status(); compose(true); legendSel(cur, true); led.build();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  /* ---------- motion switch ---------- */
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(); root.classList.toggle('still', !on);
    try { localStorage.setItem('gg-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI(); $$('[data-reveal],[data-note]').forEach(function (el) { el.classList.add('in'); });
    applyStill(); kick();
  }); });
  motionUI();

  /* ---------- hours + live status (Asia/Jerusalem). null = closed ---------- */
  var HOURS = [[8, 17], [8, 17], [8, 17], [8, 17], [8, 17], [8, 14], null]; // Sun..Sat
  var DAYS = { he: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] };
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, hh: ((+o.hour) % 24), mm: o.minute };
  }
  function hours() {
    var l = root.lang, t = now().d;
    $('[data-hours]').innerHTML = HOURS.map(function (r, i) {
      var v = !r ? (l === 'he' ? 'סגור' : 'Closed') : (r[0] === 0 && r[1] === 24) ? (l === 'he' ? '24 שעות' : 'Open 24 hours') : hhmm(r[0]) + '–' + hhmm(r[1]);
      return '<tr' + (i === t ? ' class="today"' : '') + '><td>' + (l === 'he' ? 'יום ' : '') + DAYS[l][i] + '</td><td>' + v + '</td></tr>';
    }).join('');
  }
  function status() {
    var n = now(), l = root.lang, r = HOURS[n.d], open = !!r && n.h >= r[0] && n.h < r[1], txt, short;
    if (open) { txt = l === 'he' ? 'פתוח עכשיו · עד ' + hhmm(r[1]) : 'Open now · until ' + hhmm(r[1]); short = l === 'he' ? 'פתוח' : 'OPEN'; }
    else {
      var d = n.d, k = 0, nx;
      if (r && n.h < r[0]) nx = { d: d, h: r[0] };
      while (!nx && k < 7) { k++; var dd = (d + k) % 7; if (HOURS[dd]) nx = { d: dd, h: HOURS[dd][0] }; }
      var when = nx.d === d ? (l === 'he' ? 'היום' : 'today') : nx.d === (d + 1) % 7 ? (l === 'he' ? 'מחר' : 'tomorrow') : (l === 'he' ? 'ביום ' : 'on ') + DAYS[l][nx.d];
      txt = l === 'he' ? 'סגור עכשיו · נפתח ' + when + ' ב-' + hhmm(nx.h) : 'Closed now · opens ' + when + ' at ' + hhmm(nx.h);
      short = l === 'he' ? 'סגור' : 'CLOSED';
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-status-short]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + short; });
    var c = $('[data-clock]'); if (c) c.textContent = (n.hh < 10 ? '0' : '') + n.hh + ':' + n.mm;
  }
  hours(); status(); setInterval(status, 30000);

  /* ---------- headline: letter by letter ---------- */
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.big') ? 0 : 4;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  /* ---------- reveals ---------- */
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-note]').forEach(function (n, i) { n.style.setProperty('--d', i * 160 + 'ms'); });
  $$('[data-reveal],[data-note]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  /* ---------- glyph decode for labels ---------- */
  var GLYPH = '01#%&*+<>/\\=ABCDEFXYZ';
  function decode(el) {
    if (still() || !el) return;
    var final = el.dataset.final || (el.dataset.final = el.textContent), t0 = performance.now();
    (function step(t) {
      var p = clamp((t - t0) / 520, 0, 1), n = Math.floor(final.length * p);
      el.textContent = final.slice(0, n) + final.slice(n).replace(/\S/g, function () { return GLYPH[(Math.random() * GLYPH.length) | 0]; });
      if (p < 1) requestAnimationFrame(step); else el.textContent = final;
    })(t0);
  }

  /* ---------- odometers ---------- */
  function odo(el) {
    var to = parseFloat(el.dataset.odo), dec = (el.dataset.odo.split('.')[1] || '').length;
    if (still()) { el.textContent = to.toFixed(dec); return; }
    var t0 = performance.now();
    (function step(t) { var p = clamp((t - t0) / 1300, 0, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = (to * e).toFixed(dec); if (p < 1) requestAnimationFrame(step); })(t0);
  }
  $$('[data-odo]').forEach(function (el) { watch(el, function (v) { if (v && !el.dataset.done) { el.dataset.done = 1; odo(el); } }); });

  /* ---------- nav gathers into a pill ---------- */
  var nav = $('[data-nav]');

  /* ---------- hero: tilt toward the cursor, ambient LED hue, night streaks ---------- */
  var hero = $('[data-hero]'), unit = $('.unit'), amb = $('[data-ambient]');
  if (fine) hero.addEventListener('pointermove', function (e) {
    if (still()) return;
    var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    unit.style.setProperty('--tx', (x * 10).toFixed(2)); unit.style.setProperty('--ty', (-y * 8).toFixed(2));
    amb.style.setProperty('--hue', Math.round(200 + x * 120));
  });
  var streaks = (function () {
    var cv = $('[data-streaks]'), c = cv.getContext('2d'), w, h, S = [], vis = true;
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = []; for (var i = 0; i < 26; i++) S.push({ x: Math.random() * w, y: h * (.35 + Math.random() * .6), l: 40 + Math.random() * 160, v: .4 + Math.random() * 1.6, warm: Math.random() < .5, a: .15 + Math.random() * .35 }); }
    function draw(dt) {
      c.clearRect(0, 0, w, h);
      S.forEach(function (s) {
        if (dt) { s.x += s.v * dt * (s.warm ? 1 : -1) * .06; if (s.x > w + s.l) s.x = -s.l; if (s.x < -s.l) s.x = w + s.l; }
        var g = c.createLinearGradient(s.x, 0, s.x + s.l, 0), col = s.warm ? '255,207,120' : '255,80,80';
        g.addColorStop(0, 'rgba(' + col + ',0)'); g.addColorStop(.6, 'rgba(' + col + ',' + s.a + ')'); g.addColorStop(1, 'rgba(' + col + ',0)');
        c.fillStyle = g; c.fillRect(s.x, s.y, s.l, 2);
      });
    }
    watch(hero, function (v) { vis = v; });
    return { size: function () { size(); draw(0); }, frame: function (dt) { if (vis) draw(dt); } };
  })();

  /* ---------- install map ---------- */
  var car = $('[data-car]'), wires = $$('.wires path', car), legend = $('[data-legend]'), cur = 'media', auto = true, autoT = 0;
  wires.forEach(function (p) { p.setAttribute('pathLength', 1); });
  var pulseG = document.createElementNS('http://www.w3.org/2000/svg', 'g'); pulseG.setAttribute('class', 'pulse');
  wires.forEach(function (p) { var q = p.cloneNode(); q.setAttribute('pathLength', 100); q.removeAttribute('style'); pulseG.appendChild(q); });
  $('.wires', car).after(pulseG);
  var pulses = $$('path', pulseG);
  var GROUP = { media: ['cams', 'sensors', 'speakers', 'hands', 'kodan', 'safe'] };
  function legendSel(k, quiet) {
    cur = k;
    $$('button', legend).forEach(function (b) { var on = b.dataset.k === k; b.setAttribute('aria-selected', on); if (on && !quiet) $$('b[data-decode]', b).forEach(decode); });
    $$('.pts g', car).forEach(function (g) { g.classList.toggle('on', g.dataset.p === k); });
    var ws = GROUP[k] || [k];
    wires.forEach(function (p, i) { var on = ws.indexOf(p.dataset.w) >= 0; p.classList.toggle('on', on); pulses[i].classList.toggle('on', on); });
    if (!quiet && innerWidth < 960) { var b = $('[data-k="' + k + '"]', legend); legend.scrollTo({ left: b.offsetLeft - (legend.clientWidth - b.clientWidth) / 2, behavior: still() ? 'auto' : 'smooth' }); }
  }
  $$('button', legend).forEach(function (b) { b.addEventListener('click', function () { auto = false; legendSel(b.dataset.k); }); });
  $$('.pts g', car).forEach(function (g) { g.addEventListener('click', function () { auto = false; legendSel(g.dataset.p); }); });
  legendSel('media', true);
  var mapVis = false, KEYS = ['media', 'cams', 'sensors', 'speakers', 'hands', 'kodan', 'safe'];
  watch(car, function (v) { mapVis = v; }, { threshold: .4 });
  setInterval(function () { if (auto && mapVis && !still() && !document.hidden) legendSel(KEYS[(KEYS.indexOf(cur) + 1) % KEYS.length]); }, 2800);

  /* ---------- scan: steps light up beside a running readout ---------- */
  var term = $('[data-term]'), mods = $$('.mods li', term), steps = $$('[data-steps] li'), pct = $('[data-pct]'), wave = $('[data-wave]'), scanTimers = [], scanVis = false;
  function scanReset() { scanTimers.forEach(clearTimeout); scanTimers = []; mods.forEach(function (m) { m.classList.remove('done'); m.querySelector('i').style.setProperty('--p', 0); }); steps.forEach(function (s) { s.classList.remove('on'); }); pct.textContent = '0%'; }
  function scanDone() { mods.forEach(function (m) { m.classList.add('done'); m.querySelector('i').style.setProperty('--p', 1); }); steps.forEach(function (s) { s.classList.add('on'); }); pct.textContent = '100%'; }
  function scanRun() {
    scanReset(); if (still()) { scanDone(); return; }
    var T = function (ms, f) { scanTimers.push(setTimeout(f, ms)); };
    T(200, function () { steps[0].classList.add('on'); });
    T(900, function () { steps[1].classList.add('on'); });
    mods.forEach(function (m, i) {
      T(1000 + i * 520, function () { m.querySelector('i').style.setProperty('--p', 1); });
      T(1450 + i * 520, function () { m.classList.add('done'); pct.textContent = Math.round((i + 1) / mods.length * 100) + '%'; });
    });
    T(1500 + mods.length * 520, function () { steps[2].classList.add('on'); });
  }
  watch(term, function (v) { if (v && !scanVis) scanRun(); scanVis = v; }, { threshold: .35 });

  /* ---------- ring of real photos: scroll + drag ---------- */
  var stage = $('[data-ring-stage]'), ring = $('[data-ring]'), figs = $$('figure', ring), drag = 0, dragging = false, lx = 0, rot = 0;
  figs.forEach(function (f, i) { f.style.setProperty('--i', i); });
  stage.addEventListener('pointerdown', function (e) { if (still()) return; dragging = true; lx = e.clientX; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointermove', function (e) { if (!dragging) return; drag += (e.clientX - lx) * .35; lx = e.clientX; });
  ['pointerup', 'pointercancel'].forEach(function (t) { stage.addEventListener(t, function () { dragging = false; }); });

  /* ---------- composer ---------- */
  var apps = $$('[data-apps] button'), model = $('[data-model]'), msgEl = $('[data-msg]'), send = $('[data-send]'), typeT = 0, shown = '';
  function message() {
    var l = root.lang, pick = apps.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.dataset[l]; }), m = model.value.trim();
    var list = pick.length > 1 ? pick.slice(0, -1).join(', ') + (l === 'he' ? ' ו' : ' and ') + pick[pick.length - 1] : pick[0];
    if (l === 'he') return 'שלום, ' + (list ? 'אשמח לפרטים על ' + list : 'יש לי שאלה') + (m ? ' לרכב ' + m : '') + '. מתי אפשר להגיע?';
    return 'Hi, ' + (list ? 'I’d like details about ' + list : 'I have a question') + (m ? ' for my ' + m : '') + '. When can I come by?';
  }
  function compose(instant) {
    var txt = message();
    send.href = 'https://wa.me/972522853741?text=' + encodeURIComponent(txt);
    clearTimeout(typeT);
    if (instant || still()) { msgEl.textContent = shown = txt; return; }
    var k = 0; while (k < shown.length && k < txt.length && shown[k] === txt[k]) k++;
    (function step() { if (k <= txt.length) { msgEl.textContent = shown = txt.slice(0, k); k += 2; typeT = setTimeout(step, 18); } else msgEl.textContent = shown = txt; })();
  }
  apps.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); compose(); }); });
  model.addEventListener('input', function () { compose(true); });

  /* ---------- LED dot-matrix wordmark ---------- */
  var led = (function () {
    var cv = $('[data-led]'), c = cv.getContext('2d'), w, h, dots = [], vis = false, px = -1e3, step = 9;
    function build() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; if (!w) return;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      step = Math.max(6, Math.round(w / 110));
      var o = document.createElement('canvas'); o.width = w; o.height = h; var oc = o.getContext('2d');
      oc.fillStyle = '#fff'; oc.textAlign = 'center'; oc.textBaseline = 'middle';
      oc.font = '700 ' + Math.round(h * 1.05) + 'px Karantina, sans-serif';
      oc.direction = 'rtl'; oc.fillText('ג.ג.', w / 2, h * .54);
      var d = oc.getImageData(0, 0, w, h).data; dots = [];
      for (var y = step / 2; y < h; y += step) for (var x = step / 2; x < w; x += step) { var on = d[((y | 0) * w + (x | 0)) * 4 + 3] > 128; dots.push({ x: x, y: y, on: on }); }
      draw(0);
    }
    function draw(t) {
      c.clearRect(0, 0, w, h); var r = step * .34;
      dots.forEach(function (p) {
        var a;
        if (p.on) { var wave = still() ? 1 : .55 + .45 * Math.sin(t / 700 - p.x / 60); var near = Math.max(0, 1 - Math.hypot(p.x - px, p.y - (h / 2)) / 160); a = Math.min(1, wave + near); c.fillStyle = 'rgba(255,207,46,' + a.toFixed(3) + ')'; }
        else c.fillStyle = 'rgba(143,177,255,.07)';
        c.beginPath(); c.arc(p.x, p.y, r, 0, 6.283); c.fill();
      });
    }
    cv.addEventListener('pointermove', function (e) { px = e.clientX - cv.getBoundingClientRect().left; });
    cv.addEventListener('pointerleave', function () { px = -1e3; });
    watch(cv, function (v) { vis = v; });
    return { build: build, frame: function (t) { if (vis) draw(t); } };
  })();

  /* ---------- the scroll + frame loop ---------- */
  var install = $('[data-install]'), scanIn = $('.scan-in'), place = $('[data-place]'), rear = $('[data-rearcam]'), dist = $('[data-dist]'), bars = $$('.bars i', rear);
  var prog = function (el, a, b) { var r = el.getBoundingClientRect(), vh = innerHeight; return clamp((vh * a - r.top) / (vh * (a - b) || 1), 0, 1); };
  function scrollWork() {
    nav.classList.toggle('pill', scrollY > 40);
    if (still()) return;
    car.style.setProperty('--draw', prog(car, .95, .3).toFixed(3));
    scanIn.style.setProperty('--on', prog(scanIn, 1, .55).toFixed(3));
    place.style.setProperty('--land', (1 - prog(place, 1, .55)).toFixed(3));
    var pr = place.getBoundingClientRect(); rot = (pr.top / innerHeight) * 90;
    var near = prog(rear, 1, .25); rear.style.setProperty('--near', near.toFixed(3));
    var m = Math.round(50 * (1 - near)); dist.textContent = m;
    bars.forEach(function (b, i) { b.classList.toggle('on', near > i / 5 + .05); });
  }
  function applyStill() {
    if (still()) {
      ['--draw', '--on', '--land'].forEach(function (v) { car.style.removeProperty(v); scanIn.style.removeProperty(v); place.style.removeProperty(v); });
      unit.style.removeProperty('--tx'); unit.style.removeProperty('--ty');
      dist.textContent = '50'; bars.forEach(function (b) { b.classList.remove('on'); }); rear.style.removeProperty('--near');
      scanDone(); legendSel(cur, true);
    }
    scrollWork(); led.build(); streaks.size(); compose(true);
  }
  var last = 0, raf = 0;
  function frame(t) {
    raf = 0; if (still()) return;
    var dt = last ? Math.min(50, t - last) : 16; last = t;
    streaks.frame(dt); led.frame(t);
    if (!dragging) drag *= .985;
    ring.style.setProperty('--rot', (rot + drag + t / 400).toFixed(2));
    var a = ((-(rot + drag + t / 400)) % 360 + 360) % 360, front = Math.round(a / 60) % 6;
    figs.forEach(function (f, i) { f.classList.toggle('front', i === front); });
    kick();
  }
  function kick() { if (!raf && !still()) { last = 0; raf = requestAnimationFrame(frame); } }
  addEventListener('scroll', scrollWork, { passive: true });
  addEventListener('resize', function () { streaks.size(); led.build(); scrollWork(); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });

  texts(); compose(true);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () { led.build(); });
  applyStill(); kick();
  figs[0].classList.add('front');
})();
