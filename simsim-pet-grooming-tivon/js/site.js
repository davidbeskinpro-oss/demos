(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var sm = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var store = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var progress = function (el) { var r = el.getBoundingClientRect(), span = r.height - innerHeight; return span > 0 ? clamp(-r.top / span, 0, 1) : (r.top < 0 ? 1 : 0); };
  var WA = '972542144205';

  // ---------------------------------------------------------------- language
  var refreshers = [];
  function texts(l) {
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('.nav-links', 'ניווט', 'Navigation');
    aria('.st-prev', 'הקודם', 'Previous');
    aria('.st-next', 'הבא', 'Next');
    aria('.coat', 'איור של פרווה שאפשר לסרק', 'Drawing of a coat you can comb');
    aria('.belt', 'שלבי הטיפול', 'Grooming steps');
    aria('.tags', 'יצירת קשר', 'Contact');
    aria('.slide-tall .s-range', 'לפני ואחרי: מלטז', 'Before and after: Maltese');
    aria('.slide-wide .s-range', 'לפני ואחרי: שיצו', 'Before and after: Shih Tzu');
    $('.map iframe').title = l === 'he' ? 'מפה: זבולון 1, קריית טבעון' : 'Map: 1 Zevulun St., Kiryat Tivon';
    document.title = l === 'he' ? 'סימסים · סימה בסקין · ספרית כלבים וחתולים · קריית טבעון' : 'SimSim · Sima Beskin · dog & cat groomer · Kiryat Tivon';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr'; store('lang', l);
    texts(l); split(); refreshers.forEach(function (f) { f(); });
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var motionFns = [];
  function motionUI() { $$('[data-motion]').forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  $$('[data-motion]').forEach(function (b) { b.addEventListener('click', function () {
    var off = !still(); root.classList.toggle('still', off); store('motion', off ? 'off' : 'on'); motionUI();
    motionFns.forEach(function (f) { f(); });
  }); });

  // ---------------------------------------------------------------- headline letters
  function split() {
    $$('.fill-h .ln').forEach(function (ln) {
      if (!ln.dataset.txt) ln.dataset.txt = ln.textContent;
      var i = +(ln.dataset.base || 0);
      ln.innerHTML = ln.dataset.txt.split(' ').map(function (w) {
        return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
    $$('.fill-h').forEach(function (h) { var i = 0; $$('.ch', h).forEach(function (c) { c.style.setProperty('--i', i++); }); });
  }
  split();
  var fw = $('.foot-word');
  fw.innerHTML = fw.textContent.split('').map(function (c, i) { return '<span class="ch" style="--i:' + i + '">' + c + '</span>'; }).join('');

  // ---------------------------------------------------------------- reveals
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  $$('[data-reveal], .fill-h, .foot-word').forEach(function (el, i) {
    if (el.hasAttribute('data-reveal')) el.style.setProperty('--d', (i % 3) * 80 + 'ms');
    rio ? rio.observe(el) : el.classList.add('in');
  });
  requestAnimationFrame(function () { $('.fill-h').classList.add('in'); });

  // ---------------------------------------------------------------- nav gathers into a strap
  var nav = $('#nav');

  // ---------------------------------------------------------------- tilt toward the hand
  if (matchMedia('(hover: hover)').matches) $$('[data-tilt]').forEach(function (f) {
    var img = $('img', f);
    f.addEventListener('pointermove', function (e) {
      if (still()) return;
      var r = f.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      img.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg'); img.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg');
    });
    f.addEventListener('pointerleave', function () { img.style.setProperty('--ry', '0deg'); img.style.setProperty('--rx', '0deg'); });
  });

  // ---------------------------------------------------------------- hero: clipped hairs drifting in the light
  var hairs = (function () {
    var hero = $('.hero'), cv = $('.hero-hairs'), c = cv.getContext('2d'), H = [], w = 0, h = 0, raf = 0, vis = true, mx = -999, my = -999, last = 0;
    var COLS = ['#e8d2ad', '#f3e4c8', '#d8b48a', '#c9945f', '#2a241e', '#8f8579'];
    function size() {
      var dpr = Math.min(devicePixelRatio || 1, 2); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = w < 700 ? 34 : 70; H = [];
      for (var i = 0; i < n; i++) H.push(make(true));
    }
    function make(any) {
      return { x: Math.random() * w, y: any ? Math.random() * h : -30, vx: 0, vy: 8 + Math.random() * 16, a: Math.random() * 6.28, va: (Math.random() - 0.5) * 0.8,
        l: 10 + Math.random() * 30, bend: (Math.random() - 0.5) * 0.9, col: COLS[Math.floor(Math.random() * COLS.length)], lw: 0.8 + Math.random() * 1.4, ph: Math.random() * 6.28 };
    }
    function frame(now) {
      raf = 0; var dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      c.clearRect(0, 0, w, h); c.lineCap = 'round';
      H.forEach(function (p, i) {
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { var f = (1 - d2 / 14000) * 260; p.vx += dx / Math.sqrt(d2 + 1) * f * dt; p.vy += dy / Math.sqrt(d2 + 1) * f * dt; p.va += (Math.random() - 0.5) * 4 * dt; }
        p.vx *= 0.97; p.vy = lerp(p.vy, 12 + (i % 5) * 3, 0.02);
        p.x += (p.vx + Math.sin(now / 1400 + p.ph) * 9) * dt; p.y += p.vy * dt; p.a += p.va * dt;
        if (p.y > h + 40 || p.x < -60 || p.x > w + 60) H[i] = make(false);
        var cx = Math.cos(p.a) * p.l / 2, cy = Math.sin(p.a) * p.l / 2;
        c.strokeStyle = p.col; c.lineWidth = p.lw; c.beginPath(); c.moveTo(p.x - cx, p.y - cy);
        c.quadraticCurveTo(p.x - cy * p.bend, p.y + cx * p.bend, p.x + cx, p.y + cy); c.stroke();
      });
      if (vis && !still()) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && vis && !still()) { last = 0; raf = requestAnimationFrame(frame); } }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    size();
    return { size: size, kick: function () { if (still()) c.clearRect(0, 0, w, h); kick(); } };
  })();

  // ---------------------------------------------------------------- no leash: the camera goes down to the floor
  var drop = (function () {
    var sec = $('#noleash'), stage = $('.drop-stage'), world = $('.drop-world'), loop = $('.loop', world), tags = $$('.tag', world);
    var end = $('.drop-end'), read = $('.drop-cm'), stepper = $('[data-stepper="drop"]'), ticks = $('.ticks', world);
    var s = 1, W = 0, Hh = 0, cam0 = 0, cam1 = 0, step = 0, STEPS = 5, lastCm = -1;
    // centimetre marks on the stick: 618 units = 90 cm
    var t = '';
    for (var cm = 0; cm <= 90; cm += 5) { var y = 1326 - cm / 90 * 618; t += '<line x1="' + (cm % 10 ? 70 : 58) + '" y1="' + y + '" x2="84" y2="' + y + '"/>'; }
    ticks.innerHTML = t;
    function layout() {
      W = stage.clientWidth; Hh = stage.clientHeight;
      s = Math.max(W / 1000, Hh / 820);
      var focus = rtl() ? 1000 - 520 : 520, wx = clamp(W / 2 - focus * s, W - 1000 * s, 0);
      world.style.setProperty('--s', s); world.style.setProperty('--wx', wx + 'px');
      var stickEdge = rtl() ? W - (wx + (1000 - 92) * s) : wx + 92 * s;
      // tags live inside the world box, so offset them by the box's own shift
      var off = rtl() ? (W - (wx + 1000 * s)) : wx;
      world.style.setProperty('--tagx', (Math.max(16, stickEdge + 10) - off) + 'px');
      cam0 = -150 * s;
      cam1 = -(1326 * s - 0.74 * Hh);
      apply(still() ? stepState(step) : stateAt(progress(sec)));
    }
    function stateAt(pr) {
      return { fall: sm((pr - 0.05) / 0.14), cam: lerp(cam0, cam1, sm((pr - 0.2) / 0.62)), end: sm((pr - 0.84) / 0.14) };
    }
    function camForTag(i) { var y = +tags[i].style.getPropertyValue('--y'); return clamp(-(y * s - 0.56 * Hh), cam1, cam0); }
    function stepState(k) {
      if (k === 0) return { fall: 1, cam: cam0, end: 0 };
      if (k === 1) return { fall: 1, cam: camForTag(1), end: 0 };
      if (k === 2) return { fall: 1, cam: camForTag(2), end: 0 };
      if (k === 3) return { fall: 1, cam: cam1, end: 0 };
      return { fall: 1, cam: cam1, end: 1 };
    }
    var head = $('.drop-h');
    function apply(st) {
      world.style.setProperty('--cam', st.cam + 'px');
      head.style.opacity = still() ? 1 : (1 - sm((st.cam - cam0) / (cam1 - cam0) * 4)).toFixed(3);
      // the loop: unclipped, it drops onto the table and slumps into a heap
      var f = st.fall, dy = 196 * Math.pow(Math.min(1, f * 1.25), 2), heap = sm((f - 0.8) / 0.2), sway = Math.sin(f * 9) * (1 - f) * 4;
      loop.setAttribute('transform', 'translate(0 ' + dy.toFixed(1) + ') rotate(' + sway.toFixed(2) + ' 500 224) translate(500 512) scale(' + (1 + 0.45 * heap).toFixed(3) + ' ' + (1 - 0.78 * heap).toFixed(3) + ') translate(-500 -512)');
      // eye height on the stick
      var eye = (-st.cam + 0.56 * Hh) / s, cmv = Math.round(clamp((1326 - eye) / 618 * 90, 0, 90));
      if (cmv !== lastCm) { read.textContent = cmv; lastCm = cmv; }
      var best = 0, bd = 1e9;
      tags.forEach(function (tg, i) { var d = Math.abs(+tg.style.getPropertyValue('--y') - eye); if (d < bd) { bd = d; best = i; } });
      tags.forEach(function (tg, i) { tg.classList.toggle('on', i === best); });
      end.style.clipPath = 'inset(' + ((1 - st.end) * 100).toFixed(2) + '% 0 0 0)';
      end.style.setProperty('--e', st.end.toFixed(3));
      read.parentNode.style.opacity = (1 - sm(st.end * 3)).toFixed(3);
    }
    function setStep(k) {
      step = clamp(k, 0, STEPS - 1); apply(stepState(step));
      $('.st-count', stepper).textContent = (step + 1) + ' / ' + STEPS;
      $('.st-prev', stepper).disabled = step === 0; $('.st-next', stepper).disabled = step === STEPS - 1;
    }
    $('.st-prev', stepper).addEventListener('click', function () { setStep(step - 1); });
    $('.st-next', stepper).addEventListener('click', function () { setStep(step + 1); });
    function mode() { stepper.hidden = !still(); layout(); if (still()) setStep(step); }
    return { layout: layout, scroll: function () { if (!still()) apply(stateAt(progress(sec))); }, mode: mode };
  })();

  // ---------------------------------------------------------------- the touch: the coat through the whole groom
  var touch = (function () {
    var sec = $('#touch'), cv = $('.coat'), lines = $$('.tl'), tools = $$('.tool[data-go]'), kn = $('.kn'), hint = $('.coat-hint');
    var stepper = $('[data-stepper="touch"]'), step = 0, STEPS = [0, 1, 1.45, 2.6, 4], vis = false, lastLine = -1;
    var coat = new window.Coat(cv, { flip: rtl(), onChange: function () { ui(coat.p); } });
    function count() { kn.textContent = coat.removed() + ' / ' + coat.mats.length; }
    cv.addEventListener('pointermove', function () { hint.classList.add('gone'); }, { once: true });
    cv.addEventListener('pointerdown', function () { hint.classList.add('gone'); }, { once: true });
    function pOf(pr) { return clamp((pr - 0.06) / 0.88, 0, 1) * 4; }
    function ui(p) {
      var li = p < 0.12 ? (coat.removed() < coat.mats.length ? 0 : 1) : Math.min(4, Math.floor(p) + 1);
      if (li !== lastLine) { lines.forEach(function (l, i) { l.classList.toggle('on', i === li); }); lastLine = li; }
      tools.forEach(function (b, i) {
        var f = i === 0 ? (li === 0 ? 1 : 0) : clamp(p - (i - 1), 0, 1);
        b.style.setProperty('--fill', f.toFixed(3)); b.classList.toggle('on', li === i);
      });
      count();
    }
    function set(p) { coat.set(p); ui(p); }
    function scroll() { if (!still()) set(pOf(progress(sec))); }
    tools.forEach(function (b) { b.addEventListener('click', function () {
      var k = +b.dataset.go;
      if (still()) { setStep(k); return; }
      var target = k === 0 ? 0 : k - 1 + 0.6;
      var r = sec.getBoundingClientRect(), top = scrollY + r.top, span = sec.offsetHeight - innerHeight;
      scrollTo({ top: top + (0.06 + target / 4 * 0.88) * span, behavior: 'smooth' });
    }); });
    $('[data-reset]').addEventListener('click', function () {
      coat.reset();
      if (!still()) { var r = sec.getBoundingClientRect(); scrollTo({ top: scrollY + r.top, behavior: 'smooth' }); } else setStep(0);
    });
    function setStep(k) {
      step = clamp(k, 0, STEPS.length - 1); set(STEPS[step]);
      $('.st-count', stepper).textContent = (step + 1) + ' / ' + STEPS.length;
      $('.st-prev', stepper).disabled = step === 0; $('.st-next', stepper).disabled = step === STEPS.length - 1;
    }
    $('.st-prev', stepper).addEventListener('click', function () { setStep(step - 1); });
    $('.st-next', stepper).addEventListener('click', function () { setStep(step + 1); });
    function run() { if (vis && !still()) coat.start(); else coat.stop(); }
    watch(sec, function (v) { vis = v; run(); });
    function mode() { stepper.hidden = !still(); if (still()) setStep(step); else scroll(); run(); }
    function resize() { coat.flip = rtl(); coat.resize(); if (still()) set(STEPS[step]); else scroll(); }
    return { scroll: scroll, mode: mode, resize: resize };
  })();

  // ---------------------------------------------------------------- before / after: the comb opens it
  $$('[data-ba]').forEach(function (f) {
    var r = $('.s-range', f), seen = false;
    function setX(v) { f.style.setProperty('--x', v + '%'); r.value = v; }
    r.addEventListener('input', function () { setX(+r.value); });
    watch(f, function (v) {
      if (!v || seen || still() || !f.animate) return; seen = true;
      var t0 = performance.now(), path = [50, 88, 12, 50], dur = 2600;
      (function tick(now) {
        var k = clamp((now - t0) / dur, 0, 1), seg = Math.min(2, Math.floor(k * 3)), u = sm(k * 3 - seg);
        setX(lerp(path[seg], path[seg + 1], u).toFixed(1));
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.5 });
  });

  // ---------------------------------------------------------------- care list lights up as you pass
  var care = $$('[data-lit]');
  function lit() { var line = innerHeight * 0.74; care.forEach(function (li) { li.classList.toggle('lit', li.getBoundingClientRect().top < line); }); }

  // ---------------------------------------------------------------- dogs: prints dealt along the mat, carried sideways
  var dogs = (function () {
    var sec = $('#dogs'), mat = $('.mat', sec), rail = $('.rail', sec), prints = $$('.print', sec), span = 0;
    prints.forEach(function (p, i) { p.style.setProperty('--k', i % 6); });
    watch(mat, function (v) { if (v) sec.classList.add('dealt'); }, { threshold: 0.15 });
    function layout() {
      var on = !still() && innerWidth >= 900;
      sec.classList.toggle('pin', on);
      if (!on) { mat.style.removeProperty('--pinH'); rail.style.removeProperty('--rx'); return; }
      rail.style.setProperty('--rx', '0px');
      span = Math.max(0, rail.scrollWidth - innerWidth);
      mat.style.setProperty('--pinH', (span + innerHeight) + 'px');
      scroll();
    }
    function scroll() {
      if (!sec.classList.contains('pin')) return;
      var r = mat.getBoundingClientRect(), pr = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
      rail.style.setProperty('--rx', ((rtl() ? 1 : -1) * pr * span).toFixed(1) + 'px');
    }
    return { layout: layout, scroll: scroll };
  })();

  // ---------------------------------------------------------------- odometer
  $$('[data-odo]').forEach(function (el) {
    var val = +el.dataset.odo, done = false;
    function roll() {
      if (done) return; done = true;
      if (still()) { el.textContent = val.toFixed(1); return; }
      var t0 = performance.now();
      (function tick(now) {
        var k = clamp((now - t0) / 1300, 0, 1), e = 1 - Math.pow(1 - k, 3);
        el.textContent = (val * e).toFixed(1);
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    }
    if (still()) roll(); else { el.textContent = '0.0'; watch(el, function (v) { if (v) roll(); }, { threshold: 0.6 }); }
    motionFns.push(function () { if (still()) { done = true; el.textContent = val.toFixed(1); } });
  });

  // ---------------------------------------------------------------- hours and live status (Asia/Jerusalem)
  var HOURS = [[8, 20], [8, 20], [8, 20], [8, 20], [8, 20], [8, 16], null];   // Sun..Sat
  var DAY_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], DAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function hours() {
    var rows = [{ days: '0,1,2,3,4', he: 'ראשון עד חמישי', en: 'Sunday to Thursday', t: HOURS[0] }, { days: '5', he: 'שישי', en: 'Friday', t: HOURS[5] }, { days: '6', he: 'שבת', en: 'Saturday', t: null }];
    $('[data-hours]').innerHTML = rows.map(function (r) {
      return '<tr data-days="' + r.days + '"><td>' + (he() ? r.he : r.en) + '</td><td dir="ltr">' + (r.t ? hhmm(r.t[0]) + '–' + hhmm(r.t[1]) : (he() ? 'סגור' : 'Closed')) + '</td></tr>';
    }).join('');
    status();
  }
  function status() {
    var n = now(), t = HOURS[n.d], open = !!t && n.h >= t[0] && n.h < t[1], txt;
    if (open) txt = he() ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]);
    else {
      var k = 0, d = n.d;
      if (t && n.h < t[0]) k = 0; else { do { k++; d = (n.d + k) % 7; } while (!HOURS[d] && k < 7); }
      var when = k === 0 ? (he() ? 'היום' : 'today') : k === 1 ? (he() ? 'מחר' : 'tomorrow') : (he() ? 'ביום ' + DAY_HE[d] : 'on ' + DAY_EN[d]);
      txt = he() ? 'סגור עכשיו · נפתח ' + when + ' ב־' + hhmm(HOURS[d][0]) : 'Closed now · opens ' + when + ' at ' + hhmm(HOURS[d][0]);
    }
    var el = $('[data-status]'); el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt;
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', r.dataset.days.split(',').indexOf(String(n.d)) >= 0); });
  }
  hours(); setInterval(status, 60000);

  // ---------------------------------------------------------------- the introduction card writes the message
  var form = $('[data-composer]'), prev = $('[data-preview]'), send = $('[data-send]');
  function message() {
    var v = function (n) { var x = form.querySelector('[name="' + n + '"]:checked'); return x ? x.value : ''; };
    var name = form.name.value.trim(), cat = v('who') === 'cat';
    var size = { s: he() ? 'קטן' : 'small', m: he() ? 'בינוני' : 'medium', l: he() ? 'גדול' : 'large' }[v('size')];
    if (he()) {
      var whom = name ? 'ל' + name : cat ? 'לחתול שלי' : 'לכלב שלי';
      var coat = { ok: 'פרווה רגילה', knots: 'יש לו קשרים בפרווה', long: 'הפרווה ארוכה ועבה' }[v('coat')];
      var mood = { calm: 'הוא רגוע', nervous: 'הוא קצת לחוץ', touch: 'הוא לא אוהב שנוגעים בו' }[v('mood')];
      return 'היי סימה, אשמח לקבוע טיפול ' + whom + '. ' + (cat ? 'חתול ' : 'כלב ') + size + ', ' + coat + '. ' + mood + '. מתי נוח לך?';
    }
    var who = name || (cat ? 'my cat' : 'my dog');
    var coatE = { ok: 'a normal coat', knots: 'his coat has knots', long: 'a long, thick coat' }[v('coat')];
    var moodE = { calm: "He's calm", nervous: 'He gets a bit nervous', touch: "He doesn't like being touched" }[v('mood')];
    return 'Hi Sima, I\'d like to book a groom for ' + who + '. A ' + size + ' ' + (cat ? 'cat' : 'dog') + ', ' + coatE + '. ' + moodE + '. When would suit you?';
  }
  function compose() { var m = message(); prev.textContent = m; send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m); }
  form.addEventListener('input', compose); form.addEventListener('change', compose);
  function placeholder() { form.name.placeholder = he() ? 'לא חובה' : 'Optional'; }
  placeholder(); compose();
  $$('[data-wa]').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(he() ? 'היי סימה, אשמח לקבוע תספורת' : 'Hi Sima, I\'d like to book a groom'); });
  refreshers.push(function () {
    compose(); placeholder(); hours();
    $$('[data-wa]').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(he() ? 'היי סימה, אשמח לקבוע תספורת' : 'Hi Sima, I\'d like to book a groom'); });
    drop.layout(); touch.resize(); dogs.layout();
  });

  // ---------------------------------------------------------------- tags swing with the scroll
  var tagsEl = $('.tags'), swing = 0, swingV = 0, lastY = scrollY, tagRaf = 0;
  function swingTick() {
    tagRaf = 0; var dy = scrollY - lastY; lastY = scrollY;
    swingV += (clamp(dy * 0.25, -12, 12) - swing) * 0.08; swingV *= 0.86; swing += swingV;
    tagsEl.style.setProperty('--swing', swing.toFixed(2) + 'deg');
    if (Math.abs(swing) > 0.05 || Math.abs(dy) > 0) tagRaf = requestAnimationFrame(swingTick);
  }

  // ---------------------------------------------------------------- scroll loop
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      nav.classList.toggle('gathered', scrollY > 90);
      drop.scroll(); touch.scroll(); dogs.scroll(); lit();
      var inStage = [$('#noleash'), $('#touch')].some(function (el) { var r = el.getBoundingClientRect(); return r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5; });
      tagsEl.classList.toggle('away', inStage);
      if (!still() && !tagRaf && getComputedStyle(tagsEl).display !== 'none') tagRaf = requestAnimationFrame(swingTick);
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  var rt = 0, lastW = innerWidth;
  addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var wChanged = innerWidth !== lastW; lastW = innerWidth;
      drop.layout(); dogs.layout(); if (wChanged) { touch.resize(); hairs.size(); }
      onScroll();
    }, 150);
  });
  motionFns.push(function () { drop.mode(); touch.mode(); dogs.layout(); hairs.kick(); if (still()) { tagsEl.style.setProperty('--swing', '0deg'); $$('[data-reveal], .fill-h, .foot-word').forEach(function (el) { el.classList.add('in'); }); } onScroll(); });

  texts(root.lang); motionUI();
  drop.mode(); touch.mode(); dogs.layout(); lit(); onScroll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { dogs.layout(); });
})();
