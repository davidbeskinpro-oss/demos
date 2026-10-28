(function () {
  var root = document.documentElement, WA = '972505678393';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth <= 860; };
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'אלכספרו · שירות ותיקון מוצרי חשמל · משה שרת 51, קריית ים', en: 'Alexpro · Home appliance service & repair · 51 Moshe Sharett St, Kiryat Yam' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור אלכספרו שירות ותיקון מוצרי חשמל · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Alexpro appliance service & repair · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'אלכספרו', 'Alexpro');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-call]', 'התקשרו לאלכס, 050-567-8393', 'Call Alex, 050-567-8393');
    aria('[data-t-wa]', 'וואטסאפ לאלכס', 'WhatsApp Alex');
    aria('[data-prev]', 'השלב הקודם', 'Previous step');
    aria('[data-next]', 'השלב הבא', 'Next step');
    aria('[data-dial]', 'בחירת מכשיר', 'Choose the appliance');
    aria('.rv .stars', '5 כוכבים', '5 stars');
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ap592-lang', l); } catch (e) {}
    texts(l); hours(); labels(); write(true); test.render(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('ap592-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    deal.finish(); layout(); coils.kick(); test.render(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed, [0,24] = all day
  var H = { 0: [0, 24], 1: [0, 24], 2: [0, 24], 3: [0, 24], 4: [0, 24], 5: [0, 24], 6: [0, 24] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return (h % 24) + ':' + (m < 10 ? '0' : '') + m; };
  var allDay = function (t) { return t && t[0] === 0 && t[1] === 24; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false, week = [0, 1, 2, 3, 4, 5, 6].every(function (d) { return allDay(H[d]); });
    if (week) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות, כל השבוע' : 'Open now · 24 hours, all week'; }
    else if (allDay(t)) { open = true; txt = l ? 'פתוח עכשיו · כל היום' : 'Open now · all day'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
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
      var val = !t ? (l ? 'סגור' : 'Closed') : allDay(t) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento,.cbento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); if (e.target.__onin) e.target.__onin(); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // letters: the headline settles out of a blur, the footer name rises letter by letter
  function split(sp, start) {
    var i = start || 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  }
  $$('[data-split] .ln > span[lang]').forEach(function (sp) { split(sp, sp.closest('.ln').previousElementSibling ? 8 : 0); });
  $$('[data-wordmark] > span[lang]').forEach(function (sp) { split(sp, 0); });

  // labels decode out of scrambled glyphs
  var GLY = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHKLMNOPRSTUVWXZ0123456789' };
  function decode(el) {
    if (still()) return;
    $$('span[lang]', el).forEach(function (sp) {
      var fin = sp.dataset.fin || (sp.dataset.fin = sp.textContent), set = GLY[sp.lang] || GLY.en, t0 = performance.now(), dur = 480;
      (function f(t) {
        var k = clamp((t - t0) / dur, 0, 1), n = Math.floor(fin.length * k);
        sp.textContent = fin.slice(0, n) + fin.slice(n).replace(/\S/g, function () { return set[Math.floor(Math.random() * set.length)]; });
        if (k < 1) requestAnimationFrame(f); else sp.textContent = fin;
      })(t0);
    });
  }

  var hero = $('[data-hero]'), nav = $('[data-nav]'), frame = $('.h-frame');

  // ---------------------------------------------------------------- the stator: the copper windings in his real photo light up in a rotating
  // three-phase sequence; the field speeds up with the scroll and, on desktop, turns toward the hand
  var coils = (function () {
    var img = $('[data-coilsrc]'), cv = $('[data-coils]'), c = cv.getContext('2d'), N = 360, idx = [], ang = [], m = [], data, raf = 0, vis = true, ok = false;
    var phi = .6, power = 0, t0 = 0, last = 0, target = null, boost = 0;
    var CX = .378, CY = .40, RX = .30, RY = .37;      // where the ring of windings sits in the photo
    function sample() {
      try {
        var s = document.createElement('canvas'); s.width = s.height = N; var x = s.getContext('2d');
        x.drawImage(img, 0, 0, N, N); var d = x.getImageData(0, 0, N, N).data;
        for (var y = 0; y < N; y++) for (var xx = 0; xx < N; xx++) {
          var k = (y * N + xx) * 4, r = d[k], g = d[k + 1], b = d[k + 2];
          var u = (xx / N - CX) / RX, v = (y / N - CY) / RY, rr = Math.sqrt(u * u + v * v);
          if (rr < .55 || rr > 1.14) continue;
          if (r > 50 && r < 235 && r > g * 1.22 && g >= b * .9 && r - b > 34) {
            idx.push(k); ang.push(Math.atan2(v, u)); m.push(clamp((r - g) / 70, .35, 1) * (rr > 1.06 ? (1.14 - rr) / .08 : 1));
          }
        }
        cv.width = cv.height = N; data = c.createImageData(N, N); ok = idx.length > 200;
      } catch (e) { ok = false; }
    }
    function draw(T) {
      var D = data.data, i, a, lobe, v;
      for (i = 0; i < idx.length; i++) {
        a = Math.cos(3 * (ang[i] - phi)); lobe = a > 0 ? a * a * a * a * a : 0;
        v = Math.min(1, m[i] * (.22 + 1.25 * lobe) * power);
        var k = idx[i]; D[k] = 255; D[k + 1] = 140 + 80 * lobe; D[k + 2] = 60 + 70 * lobe; D[k + 3] = v * 255;
      }
      c.putImageData(data, 0, 0);
    }
    function frame_(t) {
      raf = 0; if (!ok) return;
      if (still()) { power = .8; phi = .6; draw(); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      power = Math.min(1, power + dt / 1.2);
      boost *= .92;
      if (target !== null) { var dd = Math.atan2(Math.sin(target - phi * 3), Math.cos(target - phi * 3)) / 3; phi += dd * .08 + dt * .25; }
      else phi += dt * (.9 + boost);
      draw(t);
      if (vis) raf = requestAnimationFrame(frame_);
    }
    function kick() { if (ok && !raf) { last = 0; raf = requestAnimationFrame(frame_); } }
    function start() { sample(); if (still()) power = .8; kick(); }
    if (finePointer) {
      hero.addEventListener('pointermove', function (e) { var r = frame.getBoundingClientRect(); var u = ((e.clientX - r.left) / r.width - CX) / RX, v = ((e.clientY - r.top) / r.height - CY) / RY; target = Math.atan2(v, u) * 3; });
      hero.addEventListener('pointerleave', function () { target = null; });
    }
    watch(hero, function (v) { vis = v; kick(); });
    return { start: function () { if (img.complete && img.naturalWidth) start(); else img.addEventListener('load', start, { once: true }); }, kick: kick, scroll: function (dv) { boost = Math.min(7, boost + Math.abs(dv) * .01); }, zero: function () { power = 0; } };
  })();

  // the photo leans toward the hand (desktop), and leans with the scroll on phones
  var tiltEl = $('[data-tilt] .h-frame');
  if (finePointer) {
    hero.addEventListener('pointermove', function (e) {
      if (still()) return; var r = tiltEl.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      tiltEl.style.transform = 'rotateY(' + (x * 8).toFixed(2) + 'deg) rotateX(' + (-y * 8).toFixed(2) + 'deg)';
    });
    hero.addEventListener('pointerleave', function () { tiltEl.style.transform = ''; });
  }

  // ---------------------------------------------------------------- opening: his photos dealt like cards; the last one opens into the hero
  var deal = (function () {
    var box = $('[data-deal]'), cards = $$('img', box), anims = [], done = false, timer;
    var seen = false; try { seen = sessionStorage.getItem('ap592-dealt') === '1'; } catch (e) {}
    function finish() {
      if (done) return; done = true; clearTimeout(timer);
      anims.forEach(function (a) { try { a.cancel(); } catch (e) {} });
      box.classList.remove('on'); decode($('.callout.c1')); decode($('.callout.c2')); decode($('.callout.c3')); coils.kick();
      try { sessionStorage.setItem('ap592-dealt', '1'); } catch (e) {}
    }
    function run() {
      if (still() || seen || !box.animate) { finish(); return; }
      box.classList.add('on'); coils.zero();
      var last = cards[cards.length - 1];
      last.style.cssText = 'left:0;top:0;width:100%;height:100%;border-radius:0;box-shadow:none';
      cards.forEach(function (cd, i) {
        var off = i - 2, fan = 'translate(' + (off * 15) + '%,' + (Math.abs(off) * 3) + '%) rotate(' + (off * 7) + 'deg)';
        if (cd === last) {
          anims.push(cd.animate([
            { opacity: 0, transform: 'translateY(30%) scale(.8)', clipPath: 'inset(20% 27% 20% 27% round 16px)' },
            { opacity: 1, transform: 'translate(30%,6%) rotate(12deg)', clipPath: 'inset(20% 27% 20% 27% round 16px)', offset: .4 },
            { opacity: 1, transform: 'translate(30%,6%) rotate(12deg)', clipPath: 'inset(20% 27% 20% 27% round 16px)', offset: .55 },
            { opacity: 1, transform: 'none', clipPath: 'inset(0% 0% 0% 0% round 0px)' }
          ], { duration: 1350, delay: 360, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'both' }));
        } else {
          anims.push(cd.animate([
            { opacity: 0, transform: 'translateY(30%) scale(.8)' },
            { opacity: 1, transform: fan, offset: .45 },
            { opacity: 1, transform: fan, offset: .7 },
            { opacity: 0, transform: fan + ' translateY(18%) scale(.92)' }
          ], { duration: 1250, delay: i * 90, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'both' }));
        }
      });
      timer = setTimeout(finish, 1760);
      ['pointerdown', 'keydown', 'wheel', 'touchmove'].forEach(function (ev) { addEventListener(ev, finish, { once: true, passive: true }); });
    }
    return { run: run, finish: finish };
  })();

  // ---------------------------------------------------------------- tiles: a spotlight under the hand
  $$('.tile,.ct').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });

  // ---------------------------------------------------------------- THE TEST: cover off, probes on the terminals, cover back on
  var test = (function () {
    var sec = $('[data-test]'), cover = $('[data-cover]'), pr = { r: $('[data-probe="r"]'), b: $('[data-probe="b"]') }, ld = { r: $('[data-lead="r"]'), b: $('[data-lead="b"]') };
    var sp = { r: $('[data-spark="r"]'), b: $('[data-spark="b"]') }, val = $('[data-mval]'), unit = $('[data-munit]'), dialI = $('[data-mdial] i'), items = $$('[data-steps] li'), nowEl = $('[data-now]');
    var PARK = { r: [470, 600], b: [400, 650] };
    // probe tips on the real photo: L1 / N, then the element's pair, then earth and the cable clamp
    var P = [PARK, { r: [336, 192], b: [350, 354] }, { r: [339, 243], b: [358, 422] }, { r: [370, 492], b: [223, 437] }, PARK];
    var MODE = ['off', 'v', 'o', 'o', 'off'], READ = [null, ['230', 'V~'], ['26.4', 'Ω'], ['0.3', 'Ω'], null];
    var ANG = { r: 150, b: 168 }, JACK = { r: [640, 900], b: [600, 920] }, L = 250;
    var t = 0, stepK = 0, shown = '', contact = -1;
    function place(id, x, y) {
      var a = ANG[id] * Math.PI / 180, hx = x + Math.sin(a) * L, hy = y - Math.cos(a) * L, j = JACK[id];
      pr[id].setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + ANG[id] + ')');
      // the lead leaves the handle and sags under its own weight on the way to the meter
      ld[id].setAttribute('d', 'M' + hx.toFixed(1) + ' ' + hy.toFixed(1) + ' C' + (hx + Math.sin(a) * 70).toFixed(1) + ' ' + (hy - Math.cos(a) * 70 + 40).toFixed(1) + ' ' + (j[0] - 60) + ' ' + (j[1] + 20) + ' ' + j[0] + ' ' + j[1]);
      sp[id].setAttribute('cx', x); sp[id].setAttribute('cy', y);
    }
    function readout(txt, u) {
      if (txt === shown) return; shown = txt; unit.textContent = u || '';
      if (still() || !/\d/.test(txt)) { val.textContent = txt; return; }
      var t0 = performance.now();
      (function f(n) { var k = clamp((n - t0) / 360, 0, 1); val.textContent = k < 1 ? txt.replace(/\d/g, function () { return Math.floor(Math.random() * 10); }) : txt; if (k < 1 && shown === txt) requestAnimationFrame(f); else if (shown === txt) val.textContent = txt; })(t0);
    }
    function apply(T) {
      var k = Math.min(4, Math.floor(T)), f = T - k, mv = smooth(f / .55), c;
      c = k === 0 ? smooth(f / .6) : k === 4 ? 1 - smooth(f / .6) : 1;
      cover.setAttribute('transform', 'translate(' + (c * 250).toFixed(1) + ' ' + (-c * 60).toFixed(1) + ') rotate(' + (c * 14).toFixed(2) + ' 364 345)');
      cover.style.opacity = (1 - c * .9).toFixed(3);
      var from = P[Math.max(0, k - 1)], to = P[k];
      if (k === 0) { from = to = PARK; }
      ['r', 'b'].forEach(function (id) {
        var x = lerp(from[id][0], to[id][0], mv), y = lerp(from[id][1], to[id][1], mv) - Math.sin(mv * Math.PI) * 50;   // lifted on the way
        place(id, x, y);
      });
      var mode = MODE[k]; dialI.style.transform = 'rotate(' + (mode === 'off' ? -55 : mode === 'v' ? 0 : 55) + 'deg)';
      var touching = f >= .55 && READ[k];
      if (touching) readout(READ[k][0], READ[k][1]); else readout(mode === 'off' ? 'OFF' : mode === 'v' ? '0.0' : 'OL', mode === 'off' ? '' : mode === 'v' ? 'V~' : 'Ω');
      if (touching && contact !== k && !still() && sp.r.animate) { ['r', 'b'].forEach(function (id) { sp[id].animate([{ opacity: .9, r: 4 }, { opacity: 0, r: 22 }], { duration: 420, easing: 'ease-out' }); }); }
      contact = touching ? k : -1;
      var act = clamp(Math.floor(T + (still() ? 0 : .05)), 0, 4);
      items.forEach(function (li, i) { li.classList.toggle('on', i === act); li.classList.toggle('done', i < act); });
      var lab = $('span[lang="' + root.lang + '"]', items[act]); nowEl.textContent = lab ? lab.textContent : '';
      $('[data-prev]').disabled = still() && stepK === 0; $('[data-next]').disabled = still() && stepK === 4;
    }
    function scroll() {
      if (still()) return;
      var r = sec.getBoundingClientRect(), p = clamp(-r.top / (r.height - innerHeight), 0, 1);
      t = Math.min(4.999, p * 5); apply(t);
    }
    function go(k) {
      stepK = clamp(k, 0, 4);
      if (still()) { apply(stepK === 0 ? .99 : stepK === 4 ? 4.99 : stepK + .99); return; }
      var top = sec.getBoundingClientRect().top + scrollY, span = sec.offsetHeight - innerHeight;
      scrollTo({ top: top + (stepK + .8) / 5 * span, behavior: 'smooth' });
    }
    $$('[data-step]').forEach(function (b) { b.addEventListener('click', function () { go(+b.dataset.step); }); });
    $('[data-prev]').addEventListener('click', function () { go(stepK - 1); });
    $('[data-next]').addEventListener('click', function () { go(stepK + 1); });
    return { scroll: scroll, render: function () { shown = ''; if (still()) go(stepK); else scroll(); } };
  })();

  // ---------------------------------------------------------------- FROM THE FIELD: four screws out, the back panel lifts, the photos run past
  var field = (function () {
    var sec = $('[data-field]'), panel = $('[data-panel]'), screws = $$('.p-screw', panel), rail = $('[data-rail]'), win = $('.rail-win'), lidLen = 0, railLen = 0, decoded = false;
    function size() {
      if (still()) { sec.style.height = ''; rail.style.transform = ''; return; }
      lidLen = innerHeight * 1.1; railLen = Math.max(0, rail.scrollWidth - win.clientWidth);
      sec.style.height = (innerHeight + lidLen + railLen + innerHeight * .25) + 'px';
    }
    function scroll() {
      if (still()) return;
      var r = sec.getBoundingClientRect(), s = -r.top, p = clamp(s / lidLen, 0, 1);
      screws.forEach(function (sc, i) {
        var u = smooth((p - i * .08) / .25), v = clamp((p - .42 - i * .03) / .18, 0, 1);
        sc.style.transform = 'translateY(' + (v * v * 160).toFixed(2) + 'vh) rotate(' + (-u * 1080 - v * 200).toFixed(1) + 'deg) scale(' + (1 + u * .32).toFixed(3) + ')';
        sc.style.opacity = v >= 1 ? '0' : ''; sc.style.filter = u > 0 ? 'drop-shadow(0 ' + (u * 10).toFixed(1) + 'px ' + (u * 8).toFixed(1) + 'px rgba(0,0,0,.45))' : ''; // taste-skill-ignore: the screw's shadow as it lifts off the panel
      });
      var lift = smooth((p - .6) / .1), w = smooth((p - .72) / .28);
      panel.style.transform = 'perspective(1400px) translateY(' + (-w * 106).toFixed(2) + '%) rotateX(' + (w * 12).toFixed(2) + 'deg) scale(' + (1 + lift * .012).toFixed(4) + ')';
      panel.style.visibility = w >= 1 ? 'hidden' : '';
      var x = clamp(s - lidLen, 0, railLen);
      rail.style.transform = 'translate3d(' + (rtl() ? x : -x).toFixed(1) + 'px,0,0)';
      if (!decoded && p > .9) { decoded = true; $$('.shot figcaption', rail).forEach(function (fc, i) { setTimeout(function () { decode(fc); }, i * 70); }); }
    }
    if (finePointer) $$('.shot figure').forEach(function (fg) {
      fg.addEventListener('pointermove', function (e) { if (still()) return; var r = fg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; fg.style.transform = 'rotateY(' + (x * 10).toFixed(2) + 'deg) rotateX(' + (-y * 10).toFixed(2) + 'deg) scale(1.02)'; });
      fg.addEventListener('pointerleave', function () { fg.style.transform = ''; });
    });
    return { size: size, scroll: scroll };
  })();

  // ---------------------------------------------------------------- reviews: two copies for a seamless drift; the rating rolls up
  var track = $('[data-track]');
  $$('.rv', track).forEach(function (r) { var k = r.cloneNode(true); k.setAttribute('aria-hidden', 'true'); track.appendChild(k); });
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      return /\d/.test(ch) ? '<span class="col" aria-hidden="true"><span data-d="' + ch + '"></span></span>' : '<span aria-hidden="true">' + ch + '</span>';
    }).join('');
    var set = function () { $$('[data-d]', o).forEach(function (d) { d.style.transform = 'translateY(' + (-d.dataset.d * 1.02) + 'em)'; }); };
    $$('[data-d]', o).forEach(function (d) { d.style.transform = still() ? 'translateY(' + (-d.dataset.d * 1.02) + 'em)' : 'translateY(0)'; });
    var host = o.closest('[data-reveal]'); if (still() || !host) set(); else { host.__onin = function () { setTimeout(set, 200); }; if (host.classList.contains('in')) set(); }
  });

  // ---------------------------------------------------------------- the program knob
  var OPTS = [
    { he: 'מקרר', en: 'Fridge', ih: 'במקרר', ie: 'my fridge' },
    { he: 'תנור', en: 'Oven', ih: 'בתנור', ie: 'my oven' },
    { he: 'מכונת כביסה', en: 'Washer', ih: 'במכונת הכביסה', ie: 'my washing machine' },
    { he: 'מייבש', en: 'Dryer', ih: 'במייבש', ie: 'my dryer' },
    { he: 'מדיח כלים', en: 'Dishwasher', ih: 'במדיח הכלים', ie: 'my dishwasher' },
    { he: 'מיקרוגל', en: 'Microwave', ih: 'במיקרוגל', ie: 'my microwave' },
    { he: 'אחר', en: 'Other', ih: 'במכשיר חשמלי אחר', ie: 'another appliance' }
  ];
  var dial = $('[data-dial]'), lab = $('[data-labels]'), note = $('[data-note]'), out = $('[data-out]'), send = $('[data-send]'), sel = 2, typing = 0;
  var angOf = function (i) { return -135 + i * 45; };
  function labels() {
    var W = lab.clientWidth || 300, R = W / 2 - 34;
    lab.innerHTML = OPTS.map(function (o, i) {
      var a = angOf(i) * Math.PI / 180, x = 50 + Math.sin(a) * R / W * 100, y = 50 - Math.cos(a) * R / W * 100;
      var tx = 50 + Math.sin(a) * (W / 2 - 74) / W * 100, ty = 50 - Math.cos(a) * (W / 2 - 74) / W * 100;
      return '<i class="tick" style="left:' + tx.toFixed(2) + '%;top:' + ty.toFixed(2) + '%;transform:rotate(' + angOf(i) + 'deg)"></i><button type="button" data-opt="' + i + '" style="left:' + x.toFixed(2) + '%;top:' + y.toFixed(2) + '%"' + (i === sel ? ' class="on"' : '') + '>' + o[he() ? 'he' : 'en'] + '</button>';
    }).join('');
    $$('[data-opt]', lab).forEach(function (b) { b.addEventListener('click', function () { pick(+b.dataset.opt); }); });
  }
  function pick(i, fromDrag) {
    i = clamp(i, 0, OPTS.length - 1); var changed = i !== sel; sel = i;
    dial.style.transform = 'rotate(' + angOf(i) + 'deg)';
    dial.setAttribute('aria-valuenow', i); dial.setAttribute('aria-valuetext', OPTS[i][he() ? 'he' : 'en']);
    $$('[data-opt]', lab).forEach(function (b) { b.classList.toggle('on', +b.dataset.opt === i); });
    if (changed && !still() && dial.animate && !fromDrag) dial.animate([{ scale: '1' }, { scale: '.97' }, { scale: '1' }], { duration: 140, easing: 'ease-out' });
    write(false);
  }
  function message() {
    var o = OPTS[sel], n = note.value.trim();
    return he() ? 'שלום אלכס, ראיתי את האתר. יש לי תקלה ' + o.ih + (n ? ': ' + n : '.') : 'Hi Alex, I saw the website. I have a problem with ' + o.ie + (n ? ': ' + n : '.');
  }
  function write(instant) {
    var m = message(); send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    cancelAnimationFrame(typing);
    if (instant || still()) { out.textContent = m; return; }
    var t0 = performance.now();
    (function f(t) { var n = Math.min(m.length, Math.floor((t - t0) / 14)); out.innerHTML = ''; out.textContent = m.slice(0, n); var c = document.createElement('i'); c.className = 'cur'; out.appendChild(c); if (n < m.length) typing = requestAnimationFrame(f); })(t0);
  }
  note.addEventListener('input', function () { write(true); });
  var dragging = false;
  function angleAt(e) { var r = dial.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); return Math.atan2(dx, -dy) * 180 / Math.PI; }
  dial.addEventListener('pointerdown', function (e) { dragging = true; dial.classList.add('drag'); dial.setPointerCapture(e.pointerId); });
  dial.addEventListener('pointermove', function (e) { if (!dragging) return; var a = clamp(angleAt(e), -150, 150); dial.style.transform = 'rotate(' + a.toFixed(1) + 'deg)'; var i = Math.round((clamp(a, -135, 135) + 135) / 45); if (i !== sel) { sel = i; $$('[data-opt]', lab).forEach(function (b) { b.classList.toggle('on', +b.dataset.opt === i); }); write(true); } });
  dial.addEventListener('pointerup', function () { if (!dragging) return; dragging = false; dial.classList.remove('drag'); pick(sel, true); });
  dial.addEventListener('keydown', function (e) {
    var k = e.key, d = k === 'ArrowRight' || k === 'ArrowUp' ? 1 : k === 'ArrowLeft' || k === 'ArrowDown' ? -1 : 0;
    if (k === 'Home') { pick(0); e.preventDefault(); } else if (k === 'End') { pick(OPTS.length - 1); e.preventDefault(); } else if (d) { pick(sel + d); e.preventDefault(); }
  });

  // ---------------------------------------------------------------- footer: a curtain, the name rises, the oven element heats up
  var foot = $('[data-foot]'), main = $('#main');
  var COL = [[75, 82, 78], [194, 54, 26], [255, 138, 58]];
  function heat() {
    var rev = clamp((innerHeight - main.getBoundingClientRect().bottom) / foot.offsetHeight, 0, 1), h = still() ? 1 : smooth(rev * 1.25);
    var a = h < .5 ? COL[0] : COL[1], b = h < .5 ? COL[1] : COL[2], k = h < .5 ? h * 2 : (h - .5) * 2;
    foot.style.setProperty('--el', 'rgb(' + a.map(function (v, i) { return Math.round(lerp(v, b[i], k)); }).join(',') + ')');
    foot.style.setProperty('--glow', (h * .85).toFixed(3));
    if (rev > .25) foot.classList.add('in');
  }

  // ---------------------------------------------------------------- layout + the scroll loop
  function layout() {
    foot.classList.toggle('curtain', !still() && foot.offsetHeight < innerHeight * .85);
    field.size(); onScroll();
  }
  var ticking = false, lastY = scrollY;
  function onScroll() {
    nav.classList.toggle('pill', scrollY > 60);
    coils.scroll(scrollY - lastY); lastY = scrollY;
    test.scroll(); field.scroll(); heat();
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; onScroll(); }); } }, { passive: true });
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { labels(); layout(); }, 120); });

  texts(root.lang); hours(); labels(); pick(sel, true); write(true);
  coils.start(); deal.run();
  test.render(); layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  addEventListener('load', layout);
})();
