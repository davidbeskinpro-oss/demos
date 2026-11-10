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
  var WA = 'https://wa.me/972542393775';

  /* ---------- language ---------- */
  function texts() {
    var l = he() ? 'he' : 'en';
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var c = $('.dock-call'); if (c) c.setAttribute('aria-label', l === 'he' ? 'להתקשר לאיגור' : 'Call Igor');
    document.title = l === 'he' ? 'B ENERGY · מועדון כושר ותזונה · דרך עכו 61, קריית מוצקין' : 'B ENERGY · Fitness & nutrition club · 61 Derech Akko, Kiryat Motzkin';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('be-lang', l); } catch (e) {}
    var u = new URL(location.href); if (l === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang');
    try { history.replaceState(null, '', u); } catch (e) {}
    texts(); status(); hours(); compose(); splitFill(); onScroll();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  /* ---------- motion switch ---------- */
  var switches = $$('[data-motion]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) {
    b.addEventListener('click', function () {
      var on = still();
      root.classList.toggle('still', !on);
      try { localStorage.setItem('be-motion', on ? 'on' : 'off'); } catch (e) {}
      motionUI();
      $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
      $$('[data-fill]').forEach(function (el) { el.classList.add('lit'); });
      if (on) { dust.start(); logoDust.start(); } else { dust.stop(); logoDust.stop(); }
      onScroll();
    });
  });
  motionUI();

  /* ---------- hours + status ---------- */
  // [open, close] per weekday, Sun=0. 24 = midnight. null = closed.
  var H = [[7.25, 23], [7.25, 23], [7.25, 23], [7.25, 24], [7.25, 24], [7.5, 18], null];
  var DAYS = { he: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] };
  var hhmm = function (x) { if (x >= 24) return '24:00'; var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = now(), t = H[n.d], open = !!(t && n.h >= t[0] && n.h < t[1]), txt;
    if (open) txt = he() ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]);
    else {
      var k = 0, d = n.d;
      if (t && n.h < t[0]) k = 0; else { do { d = (d + 1) % 7; k++; } while (!H[d] && k < 7); }
      if (k === 0) d = n.d;
      var when = k === 0 ? (he() ? 'היום' : 'today') : k === 1 ? (he() ? 'מחר' : 'tomorrow') : (he() ? 'ביום ' + DAYS.he[d] : 'on ' + DAYS.en[d]);
      txt = he() ? 'סגור עכשיו · נפתח ' + when + ' ב-' + hhmm(H[d][0]) : 'Closed now · opens ' + when + ' at ' + hhmm(H[d][0]);
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span><span></span>'; el.lastChild.textContent = txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', +r.dataset.d === n.d); });
  }
  function hours() {
    var l = he() ? 'he' : 'en', n = now();
    $('[data-hours]').innerHTML = '<tbody>' + H.map(function (t, i) {
      return '<tr data-d="' + i + '" class="' + (t ? '' : 'closed') + (i === n.d ? ' today' : '') + '"><td>' + DAYS[l][i] + '</td><td>' + (t ? hhmm(t[0]) + '–' + hhmm(t[1]) : (l === 'he' ? 'סגור' : 'Closed')) + '</td></tr>';
    }).join('') + '</tbody>';
  }

  /* ---------- WhatsApp composer ---------- */
  var GOAL = { he: ['אימון פונקציונלי', 'בניית כוח', 'תפריט תזונה ומעקב', 'חזרה לכושר'], en: ['functional training', 'building strength', 'a meal plan and follow-up', 'getting back in shape'] };
  var WHEN = { he: ['בבוקר', 'בצהריים', 'בערב'], en: ['in the mornings', 'around midday', 'in the evenings'] };
  function compose() {
    var g = +($('input[name=goal]:checked') || { value: 0 }).value, w = +($('input[name=when]:checked') || { value: 2 }).value;
    var msg = he()
      ? 'היי איגור, ראיתי את B ENERGY ואשמח לשמוע פרטים. מה שמעניין אותי: ' + GOAL.he[g] + '. הכי נוח לי להגיע ' + WHEN.he[w] + '.'
      : 'Hi Igor, I saw B ENERGY and would like to hear more. I\'m interested in ' + GOAL.en[g] + ', and it suits me best to come ' + WHEN.en[w] + '.';
    $('[data-preview]').textContent = msg;
    $('[data-compose]').href = WA + '?text=' + encodeURIComponent(msg);
    var hi = he() ? 'היי איגור, ראיתי את B ENERGY ואשמח לשמוע פרטים על אימונים.' : 'Hi Igor, I saw B ENERGY and would like to hear about training.';
    $$('[data-wa]:not([data-compose])').forEach(function (a) { a.href = WA + '?text=' + encodeURIComponent(hi); });
  }
  $('#composer').addEventListener('change', compose);

  /* ---------- reveals ---------- */
  $$('.kit [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', i * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  // run living tiles only while visible
  $$('[data-run]').forEach(function (k) {
    if (!io) { k.classList.add('run'); return; }
    new IntersectionObserver(function (es) { k.classList.toggle('run', es[0].isIntersecting); }).observe(k);
  });
  // spotlight on tiles (cursor on desktop, the tile in view lights on phones)
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });

  /* ---------- letter-by-letter fill ---------- */
  function splitFill() {
    $$('[data-fill]').forEach(function (el) {
      var i = 0;
      var targets = el.querySelectorAll('.ln').length ? $$('.ln', el) : [el];
      targets.forEach(function (ln) {
        if (ln.dataset.split) { $$('.ch', ln).forEach(function (c) { c.style.setProperty('--i', i++); }); return; }
        ln.dataset.split = 1;
        var t = ln.textContent;
        ln.setAttribute('aria-label', t);
        ln.innerHTML = t.split(' ').map(function (w) {
          return '<span class="w" aria-hidden="true" style="display:inline-block">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
        }).join(' ');
      });
    });
  }
  splitFill();
  var fio = io ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('lit'); }); }, { rootMargin: '0px 0px -12% 0px' }) : null;
  $$('[data-fill]').forEach(function (el) { fio ? fio.observe(el) : el.classList.add('lit'); });

  /* ---------- odometer ---------- */
  $$('[data-odo]').forEach(function (d) {
    var s = document.createElement('span'); s.className = 'strip';
    d.appendChild(s);
    var go = function () { s.style.transform = 'translateY(-' + (+d.dataset.odo * 1.1) + 'em)'; };
    if (still() || !io) go(); else new IntersectionObserver(function (es) { if (es[0].isIntersecting) go(); }).observe(d);
  });

  /* ---------- printer feed + ticks ---------- */
  var slip = $('#slip'), slipLis = $$('#slip li');

  /* ---------- the stage: photos swap like lights coming on ---------- */
  var sps = $$('.sp'), cur = 0;
  function stageTo(n) {
    if (n === cur) return;
    sps[cur].classList.remove('on', 'flick');
    cur = n; sps[n].classList.add('on');
    if (!still()) { sps[n].classList.remove('flick'); void sps[n].offsetWidth; sps[n].classList.add('flick'); }
  }
  var chapters = $$('[data-stage]');

  /* ---------- scroll-linked scenes ---------- */
  var nav = $('#nav'), fill = $('.thread-fill'), igor = $('#igor'), plate = $('#plate'), drift = $('[data-drift]'), closing = $('#closing'), cert = $('#cert');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = scrollY, vh = innerHeight, docH = document.documentElement.scrollHeight;
    nav.classList.toggle('pill', y > 40);
    fill.style.setProperty('--p', clamp(y / Math.max(1, docH - vh), 0, 1).toFixed(4));
    // stage chapter (desktop)
    var n = 0;
    chapters.forEach(function (c) { var r = c.getBoundingClientRect(); if (r.top < vh * 0.55) n = +c.dataset.stage; });
    stageTo(phone() ? 0 : n);
    // slip feeds out of the printer slot
    var pr = slip.getBoundingClientRect(), pt = $('.printer').getBoundingClientRect();
    var f = still() ? 1 : clamp((vh * 0.92 - pt.top) / (vh * 0.55), 0, 1);
    slip.style.setProperty('--feed', f.toFixed(3)); slip.style.visibility = f < 0.02 ? 'hidden' : '';
    slipLis.forEach(function (li, i) { li.classList.toggle('tick', f > 0.35 + i * 0.13); });
    // Igor's mat rides up over the floor
    var ir = igor.getBoundingClientRect();
    igor.style.setProperty('--ride', still() ? '0px' : (clamp((ir.top - vh * 0.15) / vh, 0, 1) * 90).toFixed(1) + 'px');
    // certificate sheen follows scroll on phones
    if (phone() || still()) cert.style.setProperty('--sh', (clamp(1 - ir.top / vh, 0, 1) * 160 - 60).toFixed(1) + '%');
    // plate turns with scroll, reviews drift
    var rr = plate.getBoundingClientRect();
    if (!still()) {
      plate.style.setProperty('--rot', ((vh - rr.top) * 0.35).toFixed(1) + 'deg');
      var dr = drift.parentNode.getBoundingClientRect(), p = clamp((vh - dr.top) / (vh + dr.height), 0, 1);
      var span = Math.max(0, drift.scrollWidth - innerWidth);
      drift.style.setProperty('--dx', ((he() ? 1 : -1) * p * span).toFixed(1) + 'px');
    } else { plate.style.setProperty('--rot', '0deg'); drift.style.setProperty('--dx', '0px'); }
    // closing photo shrinks into its frame
    var cr = closing.getBoundingClientRect();
    var k = still() ? 1 : clamp(-cr.top / Math.max(1, cr.height - vh), 0, 1);
    closing.style.setProperty('--k', k.toFixed(3));
    // rail photos parallax inside their cards
    $$('.card img').forEach(function (im) {
      var r = im.parentNode.getBoundingClientRect();
      im.style.setProperty('--px', still() ? '0px' : (((r.left + r.width / 2) - innerWidth / 2) * -0.05).toFixed(1) + 'px');
    });
  }
  var req = function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', function () { req(); dust.size(); logoDust.size(); });
  $('#rail').addEventListener('scroll', req, { passive: true });

  /* certificate tilts toward the hand (desktop) */
  cert.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var r = cert.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, yy = (e.clientY - r.top) / r.height - 0.5;
    cert.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg'); cert.style.setProperty('--rx', (-yy * 10).toFixed(2) + 'deg');
    cert.style.setProperty('--sh', (x * 160).toFixed(1) + '%');
  });
  cert.addEventListener('pointerleave', function () { cert.style.setProperty('--rx', '0deg'); cert.style.setProperty('--ry', '0deg'); });

  /* drag the rail with a mouse */
  (function () {
    var rail = $('#rail'), down = false, sx = 0, sl = 0, moved = false;
    rail.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; rail.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; rail.scrollLeft = sl - dx; });
    addEventListener('pointerup', function () { if (!down) return; down = false; rail.classList.remove('drag'); });
    rail.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  })();

  /* ---------- spotlight on the stage: cursor on desktop, a slow drift on touch ---------- */
  var stage = $('#stage'), spot = $('#spot'), sx = 0.6, sy = 0.4, tx = 0.6, ty = 0.4, userAt = 0;
  stage.addEventListener('pointermove', function (e) { var r = stage.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; userAt = performance.now(); dust.push(e.clientX - r.left, e.clientY - r.top); });

  /* ---------- chalk dust in the neon light ---------- */
  var dust = (function () {
    var cv = $('#dust'), cx = cv.getContext('2d'), W = 0, Hh = 0, ps = [], raf = 0, vis = true, mx = -999, my = -999, dpr = 1;
    function size() { var r = cv.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = r.width; Hh = r.height; cv.width = W * dpr; cv.height = Hh * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function seed() { ps = []; var n = phone() ? 55 : 110; for (var i = 0; i < n; i++) ps.push({ x: Math.random() * W, y: Math.random() * Hh, r: Math.random() * 1.8 + 0.4, vx: (Math.random() - 0.5) * 0.15, vy: -Math.random() * 0.25 - 0.05, a: Math.random() * 0.5 + 0.2, g: Math.random() < 0.25 }); }
    function frame(t) {
      raf = 0; if (!vis || still()) return;
      // spotlight drift on touch / idle
      if (t - userAt > 2500) { tx = 0.5 + Math.sin(t / 3100) * 0.28; ty = 0.45 + Math.cos(t / 2300) * 0.18; }
      sx += (tx - sx) * 0.06; sy += (ty - sy) * 0.06;
      spot.style.setProperty('--sx', (sx * 100).toFixed(1) + '%'); spot.style.setProperty('--sy', (sy * 100).toFixed(1) + '%');
      cx.clearRect(0, 0, W, Hh);
      var lx = sx * W, ly = sy * Hh;
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i], dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 9000) { var f = (9000 - d2) / 9000 * 0.6; p.vx += dx * f * 0.01; p.vy += dy * f * 0.01; }
        p.vx *= 0.97; p.vy = p.vy * 0.97 - 0.004;
        p.x += p.vx + Math.sin((t / 1800) + i) * 0.08; p.y += p.vy;
        if (p.y < -5) { p.y = Hh + 5; p.x = Math.random() * W; }
        if (p.x < -5) p.x = W + 5; if (p.x > W + 5) p.x = -5;
        var ld = Math.hypot(p.x - lx, p.y - ly), lit = clamp(1 - ld / 360, 0.15, 1);
        cx.globalAlpha = p.a * lit;
        cx.fillStyle = p.g ? '#9fd13a' : '#eeede8';
        cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill();
      }
      mx += (-999 - mx) * 0.02; my += (-999 - my) * 0.02;
      raf = requestAnimationFrame(frame);
    }
    function start() { if (still()) return; if (!W) { size(); seed(); } if (!raf) raf = requestAnimationFrame(frame); }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; cx.clearRect(0, 0, W, Hh); }
    if (io) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) start(); }).observe(cv);
    return { size: function () { if (!W) return; size(); seed(); }, start: start, stop: stop, push: function (x, y) { mx = x; my = y; } };
  })();

  /* ---------- the real logo, gathered out of chalk dust in the footer ---------- */
  var logoDust = (function () {
    var cv = $('#logoDust'), cx = cv.getContext('2d'), pts = [], raf = 0, W = 0, Hh = 0, t0 = 0, vis = false, img = new Image(), ready = false;
    img.src = 'img/logo.jpg';
    img.onload = function () { ready = true; build(); if (vis) start(); };
    function size() { var r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); W = r.width; Hh = r.height; cv.width = W * dpr; cv.height = Hh * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function build() {
      size(); if (!W) return;
      var c = document.createElement('canvas'), sw = 220, sh = Math.round(sw * img.height / img.width); c.width = sw; c.height = sh;
      var g = c.getContext('2d'); g.drawImage(img, 0, 0, sw, sh);
      var d = g.getImageData(0, 0, sw, sh).data; pts = [];
      for (var y = 0; y < sh; y += 2) for (var x = 0; x < sw; x += 2) {
        var k = (y * sw + x) * 4, r = d[k], gg = d[k + 1], b = d[k + 2], mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
        var sat = mx - mn, dark = mx < 140;
        if (sat > 70 || dark) pts.push({ hx: x / sw * W, hy: y / sh * Hh, c: 'rgb(' + r + ',' + gg + ',' + b + ')', x: Math.random() * W, y: Hh + Math.random() * Hh * 0.8, s: Math.random() * 0.5 + 0.6 });
      }
    }
    function frame(t) {
      raf = 0; if (!vis || still()) return;
      if (!t0) t0 = t;
      var e = clamp((t - t0) / 1800, 0, 1), ease = 1 - Math.pow(1 - e, 3);
      cx.clearRect(0, 0, W, Hh);
      var sz = Math.max(1.6, W / 220 * 1.7);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i], q = clamp(ease * 1.15 - (i % 17) * 0.009, 0, 1);
        var x = p.x + (p.hx - p.x) * q + Math.sin(t / 900 + i) * (1 - q) * 6 + Math.sin(t / 1400 + i * 0.7) * 0.6;
        var y = p.y + (p.hy - p.y) * q;
        cx.fillStyle = p.c; cx.globalAlpha = 0.35 + q * 0.65;
        cx.fillRect(x, y, sz * p.s, sz * p.s);
      }
      raf = requestAnimationFrame(frame);
    }
    function start() { if (still() || !ready) return; if (!raf) { t0 = 0; raf = requestAnimationFrame(frame); } }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
    if (io) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) start(); else stop(); }).observe(cv);
    return { size: function () { if (ready) build(); }, start: start, stop: stop };
  })();

  /* ---------- LED interval timer (stage chip ambient + rail card on tap) ---------- */
  (function () {
    var led = $('[data-led]'), ph = $('[data-led-phase]'), chip = $('.led'), s0 = performance.now();
    var tEl = $('[data-t]'), card = $('#timer'), btn = $('[data-tbtn]'), run = false, tStart = 0, rounds = 0;
    var fmt = function (s) { return '0:' + (s < 10 ? '0' : '') + s; };
    setInterval(function () {
      var e = Math.floor((performance.now() - s0) / 1000) % 60, work = e < 40;
      var left = work ? 40 - e : 60 - e;
      if (!still()) { led.textContent = fmt(left); ph.textContent = work ? 'WORK' : 'REST'; chip.classList.toggle('rest', !work); }
      if (run) {
        var r = Math.floor((performance.now() - tStart) / 1000);
        if (r >= 60) { run = false; rounds++; tEl.textContent = '0:40'; card.classList.remove('rest'); btn.querySelector('[lang=he]').textContent = 'עוד סבב'; btn.querySelector('[lang=en]').textContent = 'Another round'; return; }
        var w = r < 40; tEl.textContent = fmt(w ? 40 - r : 60 - r); card.classList.toggle('rest', !w);
      }
    }, 250);
    btn.addEventListener('click', function () {
      run = !run; tStart = performance.now();
      if (!run) { tEl.textContent = '0:40'; card.classList.remove('rest'); }
      btn.querySelector('[lang=he]').textContent = run ? 'לעצור' : 'להפעיל סבב';
      btn.querySelector('[lang=en]').textContent = run ? 'Stop' : 'Start a round';
    });
  })();

  /* ---------- opening: their photos dealt like cards, the last lands on the stage ---------- */
  function deal() {
    var d = $('#deal'), imgs = $$('img', d);
    var skip = false; try { skip = sessionStorage.getItem('be-dealt'); } catch (e) {}
    if (still() || skip || !d.animate) return;
    try { sessionStorage.setItem('be-dealt', 1); } catch (e) {}
    d.classList.add('go');
    var target = stage.getBoundingClientRect();
    var done = 0;
    imgs.forEach(function (im, i) {
      var last = i === imgs.length - 1, rot = [-9, 6, -4, 0][i], off = [-60, 40, -20, 0][i];
      var a = im.animate([
        { opacity: 0, transform: 'translate(-50%,-30%) translateX(' + off + 'px) rotate(' + (rot * 2) + 'deg) scale(.8)' },
        { opacity: 1, transform: 'translate(-50%,-50%) translateX(' + off + 'px) rotate(' + rot + 'deg) scale(1)', offset: 0.45 },
        { opacity: 1, transform: 'translate(-50%,-50%) translateX(' + off + 'px) rotate(' + rot + 'deg) scale(1)' }
      ], { duration: 520, delay: i * 120, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'forwards' });
      a.onfinish = function () {
        if (!last) { im.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: 260, fill: 'forwards' }); return; }
        var r = im.getBoundingClientRect();
        var sc = Math.max(target.width / r.width, target.height / r.height);
        var dx = (target.left + target.width / 2) - (r.left + r.width / 2), dy = (target.top + target.height / 2) - (r.top + r.height / 2);
        var b = im.animate([
          { transform: 'translate(-50%,-50%)', borderRadius: '22px', opacity: 1, clipPath: 'inset(0 round 22px)' },
          { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(' + sc + ')', opacity: 1 }
        ], { duration: 640, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
        b.onfinish = function () { d.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: 'forwards' }).onfinish = function () { d.classList.remove('go'); }; };
      };
    });
    d.addEventListener('click', function () { d.classList.remove('go'); });
    setTimeout(function () { d.classList.remove('go'); }, 2600);
  }

  /* the dock steps aside while the hero's own buttons are on screen */
  (function () {
    var dock = $('.dock'), cta = $('.hero .cta');
    if (!io || !dock || !cta) return;
    new IntersectionObserver(function (es) { dock.classList.toggle('away', es[0].isIntersecting); }).observe(cta);
  })();

  /* ---------- init ---------- */
  texts(); hours(); status(); compose(); onScroll();
  setInterval(status, 60000);
  if (!still()) { dust.start(); }
  deal();
  if (still()) { $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); }); $$('[data-fill]').forEach(function (el) { el.classList.add('lit'); }); }
})();
