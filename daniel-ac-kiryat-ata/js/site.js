(function () {
  'use strict';
  var D = document, R = D.documentElement;
  var $ = function (s, c) { return (c || D).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || D).querySelectorAll(s)); };
  var still = function () { return R.classList.contains('still'); };
  var he = function () { return R.lang !== 'en'; };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var sstep = function (a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  var store = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- language ---------- */
  function applyLang() {
    var l = he();
    R.dir = l ? 'rtl' : 'ltr';
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-label', l ? 'Switch to English' : 'מעבר לעברית'); });
    var a = $('[data-area]'); if (a) a.placeholder = l ? 'למשל קריית אתא' : 'e.g. Kiryat Ata';
    var vc = $('.v-call'), vw = $('.v-wa');
    if (vc) vc.setAttribute('aria-label', l ? 'התקשרו לדניאל' : 'Call Daniel');
    if (vw) vw.setAttribute('aria-label', l ? 'וואטסאפ לדניאל' : 'WhatsApp Daniel');
    var dr = $('[data-drift]'); if (dr) dr.setAttribute('aria-label', l ? 'ביקורות' : 'Reviews');
    D.title = l ? 'דניאל מיזוג אוויר · התקנה, תיקונים, מכירה וייעוץ · שחף 2, קריית אתא' : 'Daniel Air Conditioning · installation, repairs, sales and advice · Kiryat Ata';
    renderMsg(true); renderHours(); layoutFan(); placeDots();
  }
  $$('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () {
      R.lang = he() ? 'en' : 'he'; store('daniel-lang', R.lang);
      try { var u = new URL(location.href); u.searchParams.delete('lang'); history.replaceState(null, '', u); } catch (e) {}
      applyLang();
    });
  });

  /* ---------- motion switch (reloads into the other mode) ---------- */
  $$('[data-motion]').forEach(function (b) {
    b.setAttribute('aria-pressed', still() ? 'false' : 'true');
    b.addEventListener('click', function () { store('daniel-motion', still() ? 'on' : 'off'); location.reload(); });
  });

  /* ---------- nav gathers into a pill ---------- */
  var nav = $('[data-nav]'), valves = $('[data-valves]'), hero = $('.hero');
  function onScrollUI() {
    var y = scrollY;
    nav.classList.toggle('pill', y > 40);
    var hb = hero.getBoundingClientRect().bottom, fb = $('.foot').getBoundingClientRect().top;
    var busy = [$('.panel'), $('.vbento')].some(function (el) { var r = el.getBoundingClientRect(); return r.top < innerHeight - 40 && r.bottom > 0; });
    valves.classList.toggle('hide', hb > innerHeight * 0.55 || fb < innerHeight * 0.7 || busy);
  }
  addEventListener('scroll', onScrollUI, { passive: true }); onScrollUI();

  /* ---------- headline seam ---------- */
  $$('[data-seam] [lang]').forEach(function (g) { $$('.w', g).forEach(function (w, i) { w.style.setProperty('--i', i); }); });

  /* ---------- opening: his photos dealt like cards; the last one is the hero ---------- */
  (function deal() {
    var box = $('[data-deal]');
    var seen = false; try { seen = sessionStorage.getItem('daniel-dealt'); } catch (e) {}
    if (still() || seen || !box.animate) return;
    try { sessionStorage.setItem('daniel-dealt', '1'); } catch (e) {}
    R.classList.add('dealing');
    var cards = $$('img:not(.last)', box), last = $('.last', box);
    var spread = innerWidth > 900 ? 1 : 0.55;
    cards.forEach(function (c, i) {
      var x = (i - 1.5) * 150 * spread, r = (i - 1.5) * 7;
      c.animate([
        { opacity: 0, transform: 'translate(-50%,60%) rotate(' + (r * 2) + 'deg) scale(.9)' },
        { opacity: 1, transform: 'translate(calc(-50% + ' + x + 'px),-50%) rotate(' + r + 'deg) scale(1)', offset: .45 },
        { opacity: 1, transform: 'translate(calc(-50% + ' + x + 'px),-50%) rotate(' + r + 'deg) scale(1)', offset: .8 },
        { opacity: 0, transform: 'translate(calc(-50% + ' + (x * .4) + 'px),-50%) rotate(' + (r * .5) + 'deg) scale(1.3)' }
      ], { duration: 1300, delay: i * 90, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'both' });
    });
    var a = last.animate([
      { clipPath: 'inset(40% 42% 40% 42% round 16px)', opacity: 0 },
      { clipPath: 'inset(40% 42% 40% 42% round 16px)', opacity: 1, offset: .35 },
      { clipPath: 'inset(0% 0% 0% 0% round 0px)', opacity: 1 }
    ], { duration: 900, delay: 900, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'both' });
    var end = function () { R.classList.remove('dealing'); };
    a.onfinish = end; box.addEventListener('click', end); setTimeout(end, 2600);
  })();

  /* ---------- air motes in the hero, pushed by the hand ---------- */
  (function air() {
    var cv = $('[data-air]'); if (still() || !cv.getContext) return;
    var ctx = cv.getContext('2d'), P = [], w, h, dpr, mx = -999, my = -999, run = true, vis = true;
    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2); w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = w < 700 ? 46 : 90; P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, r: Math.random() * 1.8 + .5, a: Math.random() * .5 + .2, s: Math.random() * .4 + .2, ph: Math.random() * 6.28 });
    }
    size(); addEventListener('resize', size);
    hero.addEventListener('pointermove', function (e) { var b = cv.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    new IntersectionObserver(function (en) { vis = en[0].isIntersecting; if (vis && !run) { run = true; requestAnimationFrame(tick); } }).observe(hero);
    var t0 = performance.now();
    function tick(t) {
      if (!vis) { run = false; return; }
      var tt = (t - t0) / 1000; ctx.clearRect(0, 0, w, h);
      // without a mouse (phones) an invisible hand drifts across the scene
      var hx = mx, hy = my;
      if (!finePointer || mx < -900) { hx = w * (.5 + .38 * Math.sin(tt * .35)); hy = h * (.45 + .25 * Math.sin(tt * .5 + 1)); }
      for (var i = 0; i < P.length; i++) {
        var p = P[i], dx = p.x - hx, dy = p.y - hy, d2 = dx * dx + dy * dy;
        if (d2 < 22000) { var f = (22000 - d2) / 22000 * .6; var d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f; }
        p.vx = p.vx * .94 + (Math.sin(tt * .6 + p.ph) * .08 - p.s * .35); p.vy = p.vy * .94 + Math.cos(tt * .4 + p.ph) * .06 - .05;
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10; if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
        ctx.beginPath(); ctx.fillStyle = 'rgba(190,220,255,' + p.a + ')'; ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        // a short streak shows the direction of the air
        ctx.strokeStyle = 'rgba(190,220,255,' + (p.a * .35) + ')'; ctx.lineWidth = p.r * .8; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 6, p.y - p.vy * 6); ctx.stroke();
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  /* ---------- object-fit:cover mapping, to pin overlays onto real photos ---------- */
  function coverMap(box, nw, nh, ox, oy) {
    var bw = box.clientWidth, bh = box.clientHeight, s = Math.max(bw / nw, bh / nh), W = nw * s, H = nh * s;
    var l = (bw - W) * ox, t = (bh - H) * oy;
    return function (x, y) { return [l + x * s, t + y * s, s]; };
  }
  function placeDots() {
    // spinning blades behind the grille of the outdoor unit in the repair photo (hub at 183,375 of 828x1200)
    var ph = $('.t-repair .ph'), bl = $('.t-repair .blades');
    if (ph && bl) { var m = coverMap(ph, 828, 1200, .2, .3), c = m(183, 375), r = 113 * c[2]; bl.style.cssText += ';left:' + (c[0] - r) + 'px;top:' + (c[1] - r) + 'px;width:' + (2 * r) + 'px;height:' + (2 * r) + 'px'; }
    // remote's IR window in the advice photo (390,305 of 700->828x1400 crop)
    var ad = $('.t-advice'), ir = $('.t-advice .ir');
    if (ad && ir) { var m2 = coverMap(ad, 828, 1400, .5, .25), c2 = m2(392, 300); ir.style.left = (c2[0] - 5) + 'px'; ir.style.top = (c2[1] - 5) + 'px'; }
  }
  addEventListener('resize', placeDots);

  /* ---------- THE AIR RUN: the fan spins up and the camera goes through the hub into open sky ---------- */
  var run = $('[data-airrun]'), stage = $('[data-stage]'), layer = $('[data-fanlayer]'), blades = $('[data-blades]'), sky = $('[data-sky]'), fcopy = $('[data-fancopy]'), ftag = $('.fan-tag');
  var NW = 828, NH = 1100, HX = 383, HY = 603, GR = 163, HR = 34, F = {};
  function layoutFan() {
    if (still()) return;
    var vw = stage.clientWidth, vh = stage.clientHeight, s = Math.max(vw / NW, vh / NH) * 1.02, W = NW * s, H = NH * s;
    var tx = vw * .5, ty = vh * (vw > 900 ? .62 : .6);
    var l = clamp(tx - HX * s, vw - W, 0), t = clamp(ty - HY * s, vh - H, 0);
    F = { vw: vw, vh: vh, s: s, l: l, t: t, hx: l + HX * s, hy: t + HY * s, diag: Math.hypot(vw, vh) };
    layer.style.width = W + 'px'; layer.style.height = H + 'px';
    var r = GR * s; blades.style.left = (HX * s - r) + 'px'; blades.style.top = (HY * s - r) + 'px'; blades.style.width = blades.style.height = (2 * r) + 'px';
    updateFan();
  }
  var fanP = 0, fanZ = 0, fanVis = false;
  function updateFan() {
    if (still() || !F.s) return;
    var b = run.getBoundingClientRect(), span = $('.air-runway').offsetHeight;
    var p = clamp(-b.top / span, 0, 1); fanP = p;
    var z = sstep(.08, .66, p); fanZ = z;
    var k = 1 + 8 * Math.pow(z, 2.2);
    var X = lerp(F.hx, F.vw / 2, z), Y = lerp(F.hy, F.vh / 2, z);
    layer.style.transform = 'translate(' + X + 'px,' + Y + 'px) scale(' + k + ') translate(' + (-HX * F.s) + 'px,' + (-HY * F.s) + 'px)';
    var rh = HR * F.s * k, r = 0;
    if (p > .26) r = rh * sstep(.26, .4, p);
    if (p > .5) r = lerp(rh, F.diag + 40, sstep(.5, .68, p));
    sky.style.clipPath = 'circle(' + r.toFixed(1) + 'px at ' + X.toFixed(1) + 'px ' + Y.toFixed(1) + 'px)';
    $('img', sky).style.transform = 'scale(' + (1.35 - .2 * sstep(.4, 1, p)) + ')';
    var o = 1 - sstep(.04, .26, p);
    fcopy.style.opacity = o; fcopy.style.visibility = o < .01 ? 'hidden' : 'visible'; fcopy.style.transform = 'translateY(' + (-40 * (1 - o)) + 'px)'; ftag.style.opacity = o;
    layer.style.visibility = p >= .69 ? 'hidden' : 'visible';
  }
  if (!still()) {
    layoutFan(); addEventListener('resize', layoutFan); addEventListener('scroll', updateFan, { passive: true });
    var ang = 0, last = 0, blurNow = -1;
    new IntersectionObserver(function (en) { fanVis = en[0].isIntersecting; if (fanVis) requestAnimationFrame(spin); }).observe(stage);
    var spin = function (t) {
      if (!fanVis) { last = 0; return; }
      var dt = last ? Math.min(t - last, 50) / 1000 : 0; last = t;
      ang = (ang + dt * 360 * (.5 + 5.5 * fanZ)) % 360;
      blades.style.transform = 'rotate(' + ang + 'deg)';
      var bl = Math.round((0.6 + 2.6 * fanZ) * 5) / 5; if (bl !== blurNow) { blurNow = bl; blades.style.filter = 'blur(' + bl + 'px)'; }
      requestAnimationFrame(spin);
    };
  }

  /* repair tile: the little fan turns while visible */
  (function miniFan() {
    var b = $('.t-repair .blades'); if (still() || !b) return;
    var vis = false, a = 0, lt = 0;
    new IntersectionObserver(function (en) { vis = en[0].isIntersecting; if (vis) requestAnimationFrame(f); }).observe(b);
    function f(t) { if (!vis) { lt = 0; return; } a = (a + (lt ? (t - lt) : 0) * .5) % 360; lt = t; b.style.transform = 'rotate(' + a + 'deg)'; requestAnimationFrame(f); }
  })();

  /* ---------- reveals (reverse when the block drops back below) ---------- */
  var rises = $$('[data-rise]');
  rises.forEach(function (el) {
    var sib = $$('[data-rise]', el.parentNode).indexOf(el);
    el.style.setProperty('--d', Math.max(0, sib) * 80 + 'ms');
  });
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); onIn(e.target); }
      else if (e.boundingClientRect.top > 0) e.target.classList.remove('in');
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  rises.forEach(function (el) { io.observe(el); });

  function onIn(el) {
    if (el.classList.contains('t-install')) lcd();
    if (el.querySelector && el.querySelector('[data-odo]')) odo();
  }
  // LCD on the install tile: the setpoint steps down to 24
  var lcdDone = false;
  function lcd() {
    var b = $('[data-lcd]'); if (lcdDone) return; lcdDone = true;
    if (still()) { b.textContent = '24'; return; }
    var v = 30; var id = setInterval(function () { v--; b.textContent = v; if (v <= 24) clearInterval(id); }, 260);
  }
  if (still()) { var lb = $('[data-lcd]'); if (lb) lb.textContent = '24'; }

  // 4.8 rolls like an odometer
  var odoDone = false;
  function odo() {
    var el = $('.odo-v'); if (odoDone || still() || !el) return; odoDone = true;
    var txt = el.textContent; el.textContent = '';
    txt.split('').forEach(function (ch) {
      if (!/\d/.test(ch)) { el.appendChild(D.createTextNode(ch)); return; }
      var dg = D.createElement('span'); dg.className = 'dg'; el.appendChild(dg);
      requestAnimationFrame(function () { requestAnimationFrame(function () { dg.style.setProperty('--y', -(10 + (+ch)) + 'em'); }); });
    });
  }

  /* ---------- spotlight under the hand on tiles ---------- */
  if (finePointer) $$('[data-spot]').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var b = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - b.left) + 'px'); t.style.setProperty('--my', (e.clientY - b.top) + 'px'); });
  });

  /* ---------- Daniel's photos lean toward the hand (scroll on phones) ---------- */
  (function tilt() {
    var st = $('[data-tilt]'); if (still()) return;
    var m = $('.d-main', st), s = $('.d-side', st);
    function set(x, y) { m.style.transform = 'rotateY(' + (x * 6) + 'deg) rotateX(' + (-y * 5) + 'deg)'; s.style.transform = 'translate3d(' + (x * -14) + 'px,' + (y * -14) + 'px,0) rotateY(' + (x * 8) + 'deg)'; }
    if (finePointer) {
      st.addEventListener('pointermove', function (e) { var b = st.getBoundingClientRect(); set((e.clientX - b.left) / b.width - .5, (e.clientY - b.top) / b.height - .5); });
      st.addEventListener('pointerleave', function () { set(0, 0); });
    } else {
      addEventListener('scroll', function () { var b = st.getBoundingClientRect(); var p = clamp((innerHeight - b.top) / (innerHeight + b.height), 0, 1) - .5; set(p * .8, p * .6); }, { passive: true });
    }
  })();

  /* ---------- reviews drift; a hand takes over at once ---------- */
  (function drift() {
    var box = $('[data-drift]'), tr = $('[data-track]');
    if (still()) return;
    $$('.rv', tr).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); tr.appendChild(k); });
    var vis = false, hold = 0, lt = 0, acc = 0;
    var pause = function () { hold = performance.now() + 3500; };
    ['pointerdown', 'wheel', 'touchstart', 'focusin'].forEach(function (ev) { box.addEventListener(ev, pause, { passive: true }); });
    if (finePointer) { box.addEventListener('pointerenter', function () { hold = Infinity; }); box.addEventListener('pointerleave', function () { hold = performance.now() + 600; }); }
    new IntersectionObserver(function (en) { vis = en[0].isIntersecting; if (vis) requestAnimationFrame(f); }).observe(box);
    function f(t) {
      if (!vis) { lt = 0; return; }
      var dt = lt ? Math.min(t - lt, 50) : 0; lt = t;
      if (t > hold) {
        acc += dt * .035; var stp = Math.floor(acc); acc -= stp;
        var dir = R.dir === 'rtl' ? -1 : 1, half = tr.scrollWidth / 2;
        box.scrollLeft += dir * stp;
        if (Math.abs(box.scrollLeft) >= half) box.scrollLeft -= dir * half;
      }
      requestAnimationFrame(f);
    }
  })();

  /* ---------- the mode dial composes the WhatsApp message ---------- */
  var mode = 0, place = 0, typed = null;
  var JOB = {
    he: ['התקנת מזגן', 'תיקון מזגן', 'קניית מזגן חדש', 'ייעוץ לגבי מזגן'],
    en: ['an AC installation', 'an AC repair', 'buying a new AC', 'some advice about an AC']
  };
  function message() {
    var a = ($('[data-area]').value || '').trim();
    if (he()) return 'היי דניאל, הגעתי מהאתר. אשמח לעזרה עם ' + JOB.he[mode] + (place ? ' בעסק' : ' בבית') + '.' + (a ? ' האזור שלי: ' + a + '.' : '');
    return 'Hi Daniel, I found you through the website. I’d like help with ' + JOB.en[mode] + (place ? ' at my business' : ' at home') + '.' + (a ? ' I’m in ' + a + '.' : '');
  }
  function renderMsg(instant) {
    var pv = $('[data-preview]'), txt = message();
    $('[data-send]').href = 'https://wa.me/972523686883?text=' + encodeURIComponent(txt);
    if (typed) clearInterval(typed);
    if (instant || still()) { pv.textContent = txt; return; }
    // types the new message from where the old one and the new one differ
    var old = pv.textContent, i = 0; while (i < old.length && old[i] === txt[i]) i++;
    pv.textContent = txt.slice(0, i); var cur = D.createElement('span'); cur.className = 'cur'; pv.appendChild(cur);
    typed = setInterval(function () { i = Math.min(txt.length, i + 2); pv.textContent = txt.slice(0, i); pv.appendChild(cur); if (i >= txt.length) { clearInterval(typed); typed = null; } }, 22);
  }
  var knob = $('[data-knob]'), modes = $$('[data-mode]'), turns = 0;
  function setMode(m, focus) {
    var delta = ((m - mode + 6) % 4) - 2;
    turns += delta; mode = m;
    knob.style.transform = 'rotate(' + (turns * 90) + 'deg)';
    modes.forEach(function (b, i) { b.setAttribute('aria-checked', i === m ? 'true' : 'false'); b.tabIndex = i === m ? 0 : -1; if (i === m && focus) b.focus(); });
    renderMsg();
  }
  modes.forEach(function (b, i) {
    b.addEventListener('click', function () { setMode(i); });
    b.addEventListener('keydown', function (e) {
      var k = e.key; if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); setMode((mode + 1) % 4, true); }
      if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); setMode((mode + 3) % 4, true); }
    });
  });
  modes.forEach(function (b, i) { b.tabIndex = i === 0 ? 0 : -1; });
  // drag the knob around
  (function () {
    var dragging = false;
    function ang(e) { var b = knob.getBoundingClientRect(); return Math.atan2(e.clientX - (b.left + b.width / 2), -(e.clientY - (b.top + b.height / 2))) * 180 / Math.PI; }
    knob.addEventListener('pointerdown', function (e) { dragging = true; knob.setPointerCapture(e.pointerId); });
    knob.addEventListener('pointermove', function (e) { if (!dragging) return; var a = (ang(e) + 360) % 360, m = Math.round(a / 90) % 4; if (m !== mode) setMode(m); });
    knob.addEventListener('pointerup', function () { dragging = false; });
    knob.addEventListener('click', function () { if (!dragging) setMode((mode + 1) % 4); });
  })();
  $$('[data-place]').forEach(function (b, i) {
    b.addEventListener('click', function () { place = i; $$('[data-place]').forEach(function (x, j) { x.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); renderMsg(); });
  });
  $('[data-area]').addEventListener('input', function () { renderMsg(true); });

  /* ---------- hours: a week of bars, today's bar shows "now" ---------- */
  // minutes from midnight per day, Sun..Sat. [open, close] or null (closed). 0..1440 = 24h.
  var HOURS = [[0, 1440], [0, 1440], [0, 1440], [0, 1440], [0, 1440], [0, 870], null];
  var DHE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], DEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DHEL = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], DENL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function hm(m) { return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2); }
  function nowIL() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: DEN.indexOf(o.weekday), m: ((+o.hour) % 24) * 60 + (+o.minute) };
  }
  function isOpenAt(d, m) { var h = HOURS[d]; return !!h && m >= h[0] && m < h[1]; }
  function renderHours() {
    var n = window.__now || nowIL(), l = he(), wk = $('[data-week]'), st = $('[data-status]');
    wk.innerHTML = '';
    HOURS.forEach(function (h, d) {
      var li = D.createElement('li'); if (!h) li.classList.add('closed'); if (d === n.d) li.classList.add('today');
      var span = h ? (h[1] - h[0]) / 1440 : 0;
      var label = !h ? (l ? 'סגור' : 'Closed') : (h[0] === 0 && h[1] === 1440 ? (l ? '24 שע׳' : '24h') : h[0] === 0 ? (l ? 'עד ' : 'till ') + hm(h[1]) : hm(h[0]) + '–' + hm(h[1]));
      li.innerHTML = '<span class="bar"><span class="fill" style="--h:' + (span * 100) + '%"></span>' + (d === n.d ? '<span class="now" style="--n:' + (100 - n.m / 1440 * 100) + '%"></span>' : '') + '</span><span>' + (l ? DHE[d] : DEN[d]) + '</span><b>' + label + '</b>';
      li.setAttribute('aria-label', (l ? DHEL[d] : DENL[d]) + ': ' + (!h ? (l ? 'סגור' : 'closed') : (h[0] === 0 && h[1] === 1440 ? (l ? 'פתוח 24 שעות' : 'open 24 hours') : hm(h[0]) + '–' + hm(h[1]))));
      wk.appendChild(li);
    });
    var open = isOpenAt(n.d, n.m), txt;
    if (open) {
      // open until when? walk forward through continuous days
      var d = n.d, k = 0, h = HOURS[d];
      while (h[1] === 1440 && k < 7) { var nd = (d + 1) % 7; if (!HOURS[nd] || HOURS[nd][0] !== 0) break; d = nd; h = HOURS[d]; k++; }
      if (k >= 7) txt = l ? 'פתוח עכשיו · 24/7' : 'Open now · 24/7';
      else if (d === n.d) txt = l ? 'פתוח עכשיו · עד ' + hm(h[1]) : 'Open now · until ' + hm(h[1]);
      else txt = l ? 'פתוח עכשיו · עד יום ' + DHEL[d] + ' ' + hm(h[1] % 1440) : 'Open now · until ' + DENL[d] + ' ' + hm(h[1] % 1440);
    } else {
      var dd = n.d, kk = 0, found = null;
      if (HOURS[dd] && n.m < HOURS[dd][0]) found = [dd, HOURS[dd][0]];
      while (!found && kk < 7) { dd = (dd + 1) % 7; kk++; if (HOURS[dd]) found = [dd, HOURS[dd][0]]; }
      txt = !found ? (l ? 'סגור עכשיו' : 'Closed now') : (l ? 'סגור עכשיו · נפתח ביום ' + DHEL[found[0]] + ' ב־' + hm(found[1]) : 'Closed now · opens ' + DENL[found[0]] + ' at ' + hm(found[1]));
    }
    st.classList.toggle('open', open); $('span', st).textContent = txt;
  }
  var wkEl = $('[data-week]');
  new IntersectionObserver(function (en) { if (en[0].isIntersecting) wkEl.classList.add('in'); else if (en[0].boundingClientRect.top > 0) wkEl.classList.remove('in'); }).observe(wkEl);

  /* ---------- footer: the air gathers into his real banner ---------- */
  (function logo() {
    var stg = $('[data-logo]'), img = $('img', stg), cv = $('[data-logocanvas]');
    if (still()) { stg.classList.add('built'); return; }
    var ctx = cv.getContext('2d'), pts = [], P = [], ready = false, vis = false, prog = 0, target = 0, lt = 0;
    function sample() {
      try {
        var w = 207, h = 88, c = D.createElement('canvas'); c.width = w; c.height = h; var x = c.getContext('2d');
        x.drawImage(img, 0, 0, w, h); var d = x.getImageData(0, 0, w, h).data; pts = [];
        for (var yy = 0; yy < h; yy += 2) for (var xx = 0; xx < w; xx += 2) { var i = (yy * w + xx) * 4, r = d[i], g = d[i + 1], b = d[i + 2]; if (r + g + b < 200 && b >= r) pts.push([xx / w, yy / h]); }
        ready = pts.length > 50;
      } catch (e) { ready = false; }
      if (!ready) { stg.classList.add('built'); return; }
      size();
    }
    function size() {
      var dpr = Math.min(devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var step = Math.max(1, Math.round(pts.length / (w < 500 ? 700 : 1400)));
      P = []; for (var i = 0; i < pts.length; i += step) P.push({ tx: pts[i][0] * w, ty: pts[i][1] * h, x: Math.random() * w, y: Math.random() * h, d: Math.random() * .35 });
      cv._w = w; cv._h = h;
    }
    if (img.complete && img.naturalWidth) sample(); else img.addEventListener('load', sample);
    addEventListener('resize', function () { if (ready) size(); });
    new IntersectionObserver(function (en) {
      vis = en[0].isIntersecting; target = vis && en[0].intersectionRatio > .45 ? 1 : 0;
      if (!vis && en[0].boundingClientRect.top > 0) { prog = 0; stg.classList.remove('built'); }
      if (vis) requestAnimationFrame(f);
    }, { threshold: [0, .45, .7] }).observe(stg);
    function f(t) {
      if (!vis || !ready) { lt = 0; return; }
      var dt = lt ? Math.min(t - lt, 50) / 1000 : 0; lt = t;
      prog = clamp(prog + (target ? dt / 1.6 : -dt / 1.6), 0, 1);
      var w = cv._w, h = cv._h; ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(30,40,110,' + (1 - sstep(.85, 1, prog)) + ')';
      for (var i = 0; i < P.length; i++) {
        var p = P[i], u = sstep(p.d, p.d + .65, prog);
        var x = lerp(p.x + Math.sin(t / 900 + i) * 8, p.tx, u), y = lerp(p.y + Math.cos(t / 1100 + i) * 6, p.ty, u);
        ctx.fillRect(x - 1, y - 1, 2.2, 2.2);
      }
      stg.classList.toggle('built', prog > .82);
      requestAnimationFrame(f);
    }
  })();

  applyLang();
})();
