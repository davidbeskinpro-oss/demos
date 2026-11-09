(function () {
  var root = document.documentElement, WA = '972546677064';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 800; };
  var TITLE = { he: 'Sport Therapy & Spa · עיסוי ספורטאים וספא · עלוני נח 3, קריית מוצקין', en: 'Sport Therapy & Spa · Sports massage & spa · 3 Aluney Noah St, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Sport Therapy & Spa עיסוי ספורטאים וספא · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Sport Therapy & Spa · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לאריאל, 054-667-7064', 'Call Ariel, 054-667-7064');
    aria('[data-t-wa]', 'וואטסאפ לאריאל', 'WhatsApp Ariel');
    aria('[data-t-zones]', 'איפה מציק', 'Where it bothers you');
    aria('[data-t-when]', 'מתי נוח', 'Best time');
    aria('[data-t-dock]', 'יצירת קשר', 'Contact');
    $('iframe').title = l === 'he' ? 'Google Maps: עלוני נח 3, קריית מוצקין' : 'Google Maps: 3 Aluney Noah St, Kiryat Motzkin';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('st1131-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('st1131-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    layout(); heroF.kick(); tileF.kick(); loops.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [7.5, 20], 1: [7.5, 20], 2: [7.5, 20], 3: [7.5, 20], 4: [7.5, 20], 5: [7.5, 16], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && (t[0] === 0 && t[1] === 24)) { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
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
      var val = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento,.vb').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // letters for the brand name (hero + footer)
  function split(el, start) {
    var i = start || 0;
    var lines = $$('.ln', el); if (!lines.length) lines = [el];
    lines.forEach(function (ln) {
      ln.innerHTML = ln.textContent.split(' ').map(function (w) {
        return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + (c === '&' ? '&amp;' : c) + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  }
  split($('[data-split]')); split($('[data-wordmark]'));

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- muscle fibres: knotted bundles that smooth out under the hand (or a wandering hand on phones)
  function fibres(cv, host, o) {
    var c = cv.getContext('2d'), W, Hh, S = [], raf = 0, vis = true, px = -1, py = -1, lastMove = -1e9, t0 = performance.now(), hand = { x: -1, y: -1 }, release = 0;
    var COOL = [95, 208, 192], HEAT = [255, 138, 76];
    function build() {
      var dpr = Math.min(2, devicePixelRatio || 1); W = host.clientWidth; Hh = host.clientHeight;
      cv.width = W * dpr; cv.height = Hh * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = o.count(W, Hh), step = 6; S = [];
      for (var i = 0; i < n; i++) {
        var base = o.top * Hh + (i + .5) * (o.span * Hh) / n, pts = Math.ceil(W / step) + 2, t = new Float32Array(pts), t0a = new Float32Array(pts);
        var knots = [Math.random() * W, Math.random() * W, (i % 3 === 0) ? Math.random() * W : -9999];
        for (var k = 0; k < pts; k++) {
          var x = k * step, v = .08;
          knots.forEach(function (kx) { var d = (x - kx) / (W * .09); v += Math.exp(-d * d) * .95; });
          t[k] = t0a[k] = Math.min(1, v);
        }
        S.push({ base: base, t: t, t0: t0a, ph: Math.random() * 6.28, step: step, amp: o.amp * (.7 + Math.random() * .6) });
      }
    }
    function draw(T) {
      c.clearRect(0, 0, W, Hh);
      var calm = still(), m = calm ? .18 : (1 - release);
      c.lineCap = 'round';
      for (var i = 0; i < S.length; i++) {
        var s = S[i], prevX = 0, prevY = 0, buckets = [[], [], [], [], [], []], acc = s.ph;
        for (var k = 0; k < s.t.length; k++) {
          var x = k * s.step, tt = s.t[k] * m;
          acc += s.step * (.008 + tt * .016);   // phase accumulates, so a knot bunches the fibre without zig-zagging it
          var y = s.base + Math.sin(acc + T * 1.3) * s.amp * (.3 + tt * 1.15) + Math.sin(x * .004 + i * .7 + T * .3) * o.drift;
          if (k) buckets[Math.min(5, Math.floor(tt * 6))].push(prevX, prevY, x, y);
          prevX = x; prevY = y;
        }
        for (var b = 0; b < 6; b++) {
          var seg = buckets[b]; if (!seg.length) continue;
          var f = b / 5, col = 'rgba(' + Math.round(lerp(COOL[0], HEAT[0], f)) + ',' + Math.round(lerp(COOL[1], HEAT[1], f)) + ',' + Math.round(lerp(COOL[2], HEAT[2], f)) + ',' + (o.alpha * (.55 + f * .6)).toFixed(3) + ')';
          c.strokeStyle = col; c.lineWidth = o.width * (1 + f * .7); c.beginPath();
          for (var q = 0; q < seg.length; q += 4) { c.moveTo(seg[q], seg[q + 1]); c.lineTo(seg[q + 2], seg[q + 3]); }
          c.stroke();
        }
      }
    }
    function frame(now) {
      raf = 0; var T = (now - t0) / 1000;
      if (still()) { draw(0); return; }
      var auto = now - lastMove > 2200;
      if (auto) { hand.x = W * (.5 + .38 * Math.sin(T * .37 + 1)); hand.y = Hh * (o.top + o.span * (.5 + .42 * Math.sin(T * .61))); }
      else { hand.x = px; hand.y = py; }
      var R = o.radius(W);
      for (var i = 0; i < S.length; i++) {
        var s = S[i], dy = s.base - hand.y;
        for (var k = 0; k < s.t.length; k++) {
          var dx = k * s.step - hand.x, d2 = (dx * dx + dy * dy) / (R * R);
          if (d2 < 1) s.t[k] = Math.max(0, s.t[k] - .07 * (1 - d2));
          s.t[k] += (s.t0[k] - s.t[k]) * o.recover;
        }
      }
      if (o.onHand) o.onHand(hand.x, hand.y, W, Hh);
      draw(T);
      if (vis) raf = requestAnimationFrame(frame);
    }
    host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; lastMove = performance.now(); });
    host.addEventListener('pointerdown', function (e) { var r = host.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; lastMove = performance.now(); });
    watch(host, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: function () { build(); kick(); }, kick: kick, release: function (v) { release = v; } };
  }
  var warm = $('[data-warm]');
  var heroF = fibres($('[data-fibres]'), hero, {
    count: function (W, H) { return W < 800 ? 14 : 20; }, top: .1, span: .82, amp: 9, drift: 12, width: 1.2, alpha: .42, recover: .004,
    radius: function (W) { return W < 800 ? 120 : 190; },
    onHand: function (x, y) {
      var r = warm.getBoundingClientRect(), hr = hero.getBoundingClientRect(), lx = x - (r.left - hr.left), ly = y - (r.top - hr.top);
      if (rtl()) lx = r.width - lx;     // the photo is mirrored in Hebrew
      warm.style.setProperty('--x', lx.toFixed(0) + 'px'); warm.style.setProperty('--y', ly.toFixed(0) + 'px');
    }
  });
  var mt = $('[data-minifibres]'), tileF = fibres(mt, mt.parentNode, {
    count: function () { return 16; }, top: .06, span: .6, amp: 7, drift: 5, width: 1.6, alpha: .8, recover: .006,
    radius: function () { return 110; }
  });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 4) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- the spine (vertebrae drawn once)
  var vg = $('[data-verts]'), V = [];
  function vert(x, y, w, h, r) { var e = document.createElementNS(NS, 'rect'); e.setAttribute('x', (x - w / 2).toFixed(1)); e.setAttribute('y', y.toFixed(1)); e.setAttribute('width', w.toFixed(1)); e.setAttribute('height', h.toFixed(1)); e.setAttribute('rx', r); e.setAttribute('class', 'v'); vg.appendChild(e); V.push(e); }
  for (var i = 0; i < 7; i++) vert(110, 72 + i * 5.8, 13 + i * .7, 4.4, 2);
  for (i = 0; i < 12; i++) vert(110, 116 + i * 15.4, 19 + i * .6, 12.2, 4);
  for (i = 0; i < 5; i++) vert(110, 304 + i * 17.8, 29 + i * 1.2, 14.6, 5);
  var sac = document.createElementNS(NS, 'path'); sac.setAttribute('d', 'M92 396h36l-8 40c-2 8-18 8-20 0z'); sac.setAttribute('class', 'v'); vg.appendChild(sac); V.push(sac);
  var scaps = $$('.scap'), pelvis = $('.pelvis');
  var ZMAP = { neck: [0, 6], shoulders: [7, 9], upper: [10, 18], lower: [19, 23], hips: [24, 24] };

  // ---------------------------------------------------------------- the composer
  var zones = $$('[data-zone]'), whens = $$('[data-when]'), pr = $('[data-pressure]'), plabel = $('[data-plabel]'), msgEl = $('[data-msg]'), steps = $$('[data-step]');
  var PRES = { he: ['עדינה', 'בינונית', 'חזקה'], en: ['gentle', 'medium', 'firm'] };
  var GLY = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'abcdefghijklmnopqrstuvwxyz' };
  function lightStep(n) { steps.forEach(function (s, i) { if (i === n) s.classList.add('on'); }); }
  function decode(el) {
    var final = el.dataset.final || (el.dataset.final = el.textContent), g = GLY[el.lang] || GLY.en, f = 0;
    if (still()) { el.textContent = final; return; }
    clearInterval(el._t);
    el._t = setInterval(function () {
      f++; el.textContent = final.split('').map(function (ch, i) { return ch === ' ' || i < f / 2 ? ch : g[Math.floor(Math.random() * g.length)]; }).join('');
      if (f / 2 >= final.length) { clearInterval(el._t); el.textContent = final; }
    }, 28);
  }
  function paintSpine() {
    V.forEach(function (v) { v.classList.remove('lit'); });
    scaps.forEach(function (s) { s.classList.remove('lit'); }); pelvis.classList.remove('lit');
    zones.forEach(function (z) {
      if (z.getAttribute('aria-pressed') !== 'true') return;
      var r = ZMAP[z.dataset.zone]; for (var k = r[0]; k <= r[1]; k++) V[k].classList.add('lit');
      if (z.dataset.zone === 'shoulders') scaps.forEach(function (s) { s.classList.add('lit'); });
      if (z.dataset.zone === 'hips') pelvis.classList.add('lit');
    });
  }
  zones.forEach(function (z) { z.addEventListener('click', function () {
    var on = z.getAttribute('aria-pressed') !== 'true'; z.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) decode($('.tag[lang="' + root.lang + '"]', z));
    paintSpine(); lightStep(0); pulse(); write();
  }); });
  pr.addEventListener('input', function () { lightStep(1); write(); });
  whens.forEach(function (b) { b.addEventListener('click', function () { whens.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lightStep(2); write(); }); });
  $('[data-send]').addEventListener('click', function () { lightStep(3); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = zones.filter(function (z) { return z.getAttribute('aria-pressed') === 'true'; }).map(function (z) { return z.dataset[l ? 'he' : 'en']; });
    var p = PRES[l ? 'he' : 'en'][+pr.value - 1], w = whens.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0].dataset[l ? 'he' : 'en'];
    plabel.textContent = l ? p : p.charAt(0).toUpperCase() + p.slice(1);
    return l ? 'היי אריאל, הגעתי מהאתר ואשמח לתאם טיפול.\n' + (picked.length ? 'מה מציק: ' + list(picked, true) + '.\n' : '') + 'עוצמת מגע: ' + p + '.\nנוח לי ' + w + '.'
             : 'Hi Ariel, I found you through the website and I’d like to book a treatment.\n' + (picked.length ? 'What’s bothering me: my ' + list(picked, false) + '.\n' : '') + 'Pressure: ' + p + '.\nBest time for me: ' + w + '.';
  }
  var shown = '', typing = 0, chatSeen = false;
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing); msgEl.classList.remove('typing');
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep; msgEl.classList.add('typing');
    (function st(t) {
      var n = Math.floor((t - t0) / 14);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st); else msgEl.classList.remove('typing');
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });
  // a pulse of relief runs down the spine: on arrival (three passes) and on every tap
  var pulseRun = 0;
  function pulse(passes) {
    if (still()) return; var n = 0, total = V.length * (passes || 1); clearInterval(pulseRun);
    pulseRun = setInterval(function () { V.forEach(function (v) { v.classList.remove('pulse'); }); if (n >= total) { clearInterval(pulseRun); return; } var k = n % V.length; V[k].classList.add('pulse'); if (V[k + 1]) V[k + 1].classList.add('pulse'); n++; }, 45);
  }
  watch($('[data-back]'), function (v) { if (v) pulse(3); }, { threshold: .5 });

  // ---------------------------------------------------------------- living tiles: a stretch that deepens, a sitter who straightens up
  var tableSec = $('#table'), tableOn = false;
  watch(tableSec, function (v) { tableOn = v; tableSec.classList.toggle('on', v); loops.kick(); });
  var sp = $('[data-stretchpath]'), shd = $('[data-stretchhead]'), J = $$('[data-j]'), sspine = $('[data-sitspine]'), shead = $('[data-sithead]'), deg = $('[data-deg]');
  function tiles(s, u) {
    var hy = lerp(74, 38, s), hx = lerp(128, 134, s);
    sp.setAttribute('d', 'M40 128 Q ' + lerp(78, 92, s).toFixed(1) + ' ' + (hy + 18).toFixed(1) + ' ' + hx.toFixed(1) + ' ' + hy.toFixed(1) + ' Q ' + lerp(178, 168, s).toFixed(1) + ' ' + (hy + 18).toFixed(1) + ' 205 128');
    var sx = lerp(40, hx, .3), sy = lerp(128, hy, .3) + 4;
    shd.setAttribute('cx', (sx - 10).toFixed(1)); shd.setAttribute('cy', (sy + 10).toFixed(1));
    J[0].setAttribute('cx', hx.toFixed(1)); J[0].setAttribute('cy', hy.toFixed(1)); J[1].setAttribute('cx', sx.toFixed(1)); J[1].setAttribute('cy', sy.toFixed(1));
    var nx = lerp(110, 92, u), ny = lerp(72, 64, u);
    sspine.setAttribute('d', 'M88 124 C ' + lerp(84, 86, u).toFixed(1) + ' 104 ' + lerp(96, 88, u).toFixed(1) + ' 86 ' + nx.toFixed(1) + ' ' + ny.toFixed(1));
    shead.setAttribute('cx', (nx + lerp(10, 3, u)).toFixed(1)); shead.setAttribute('cy', (ny - lerp(6, 12, u)).toFixed(1));
    deg.textContent = Math.round(lerp(45, 10, u)) + '°';
  }
  var loops = (function () {
    var raf = 0, t0 = performance.now();
    function frame(now) {
      raf = 0; if (still() || !tableOn) { if (still()) tiles(1, 1); return; }
      var T = (now - t0) / 1000;
      tiles(smooth(.5 + .5 * Math.sin(T * .9)), smooth(.5 + .5 * Math.sin(T * .7 - 1)));
      raf = requestAnimationFrame(frame);
    }
    return { kick: function () { if (!raf) raf = requestAnimationFrame(frame); } };
  })();
  tiles(1, 1);

  // ---------------------------------------------------------------- the room: his photos stacked like his stones; the stack opens and the room fills the screen
  var room = $('[data-room]'), stage = $('.r-stage', room), pebs = $$('[data-peb]', room).filter(function (p) { return !p.hasAttribute('data-bigpeb'); }), big = $('[data-bigpeb]'), bigImg = $('img', big), cap = $('[data-rcap]'), rcopy = $('[data-rcopy]');
  var RS = [], BR = null, roomVis = false, roomT0 = performance.now(), ROTS = [-8, 6, -4, 5];
  function roomLayout() {
    if (still()) { pebs.forEach(function (p) { p.style.width = p.style.height = ''; }); return; }
    var W = stage.clientWidth, Hs = stage.clientHeight, ph = phone();
    var w = ph ? Math.min(W * .8, Hs * .3) : Math.min(W * .4, Hs * .5, 560);
    var cx = ph ? W / 2 : (rtl() ? W * .34 : W * .66), bottom = ph ? Hs * .93 : Hs * .88;
    var bh = w * .64; BR = { x: cx - w / 2, y: bottom - bh, w: w, h: bh };
    var y = BR.y, scales = [.4, .52, .64, .8];
    RS = [];
    for (var k = 3; k >= 0; k--) {
      var pw = w * scales[k], phh = pw * .56; y = y - phh * .8;
      RS[k] = { x: cx - pw / 2 + (k % 2 ? 1 : -1) * w * .03, y: y, w: pw, h: phh,
        // where each stone goes when the stack opens: out to the sides of the room
        ox: (k % 2 ? 1 : -1) * W * (.38 + k * .03), oy: (k - 1.5) * Hs * .12 };
    }
    pebs.forEach(function (p, k) { p.style.width = RS[k].w + 'px'; p.style.height = RS[k].h + 'px'; });
  }
  watch(room, function (v) { roomVis = v; if (v) roomTick(); });
  function roomTick() { if (roomVis && !still()) { roomUpdate(); requestAnimationFrame(roomTick); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  var RAD = [58, 42, 47, 53, 52, 46, 54, 48];
  function roomUpdate() {
    if (still() || !BR) { big.style.clipPath = ''; bigImg.style.transform = ''; pebs.forEach(function (p) { p.style.transform = ''; p.style.opacity = ''; }); stage.style.setProperty('--cap', 1); return; }
    var p = prog(room), W = stage.clientWidth, Hs = stage.clientHeight, T = (performance.now() - roomT0) / 1000;
    var open = smooth((p - .12) / .3), grow = smooth((p - .36) / .4), seat = smooth(p / .1);
    pebs.forEach(function (el, k) {
      var r = RS[k], bob = Math.sin(T * 1.2 + k) * 3 * (1 - open);
      var x = r.x + r.ox * open, y = r.y - (1 - seat) * 40 * (k + 1) * .3 + r.oy * open + bob;
      el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + lerp(ROTS[k] * .4, ROTS[k] * 2.4, open).toFixed(2) + 'deg) scale(' + lerp(1, .85, open).toFixed(3) + ')';
      el.style.opacity = (1 - smooth((open - .55) / .45) * (grow > .2 ? 1 : .6)).toFixed(3);
    });
    var t = BR.y * (1 - grow), l = BR.x * (1 - grow), b = (Hs - BR.y - BR.h) * (1 - grow), rr = (W - BR.x - BR.w) * (1 - grow), q = 1 - grow;
    big.style.clipPath = 'inset(' + t.toFixed(1) + 'px ' + rr.toFixed(1) + 'px ' + b.toFixed(1) + 'px ' + l.toFixed(1) + 'px round ' + RAD.slice(0, 4).map(function (v) { return (v * q).toFixed(1) + '%'; }).join(' ') + ' / ' + RAD.slice(4).map(function (v) { return (v * q).toFixed(1) + '%'; }).join(' ') + ')';
    var s0 = Math.max(BR.w / W, BR.h / Hs) * 1.15, dx = (BR.x + BR.w / 2 - W / 2) * q, dy = (BR.y + BR.h / 2 - Hs / 2) * q;
    bigImg.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0) scale(' + lerp(s0, 1, grow).toFixed(4) + ')';
    big.style.setProperty('--scrim', grow.toFixed(3));
    stage.style.setProperty('--cap', smooth((grow - .75) / .25).toFixed(3));
  }

  // ---------------------------------------------------------------- reviews settle onto the pile
  var rvs = $$('[data-rv]'), REST = [-1.4, 1.1, .9, -1.2], FROM = [-9, 8, 7, -8];
  function revUpdate(calm, vh) {
    rvs.forEach(function (rv, i) {
      if (calm) { rv.style.transform = 'rotate(' + REST[i] + 'deg)'; rv.style.opacity = ''; return; }
      var t = smooth((vh * .98 - rv.getBoundingClientRect().top) / (vh * .55));
      rv.style.transform = 'translate3d(0,' + ((1 - t) * -70).toFixed(1) + 'px,0) rotate(' + lerp(FROM[i], REST[i], t).toFixed(2) + 'deg) scale(' + lerp(1.08, 1, t).toFixed(3) + ')';
      rv.style.opacity = Math.min(1, t * 1.6).toFixed(3);
    });
  }

  // ---------------------------------------------------------------- footer: the name rises, the stone heats up
  var foot = $('[data-foot]'), wm = $('[data-wordmark]');
  watch(foot, function (v) { foot.classList.toggle('in', v); }, { threshold: .15 });
  function fitWordmark() { wm.style.fontSize = ''; var cs = parseFloat(getComputedStyle(wm).fontSize), avail = wm.parentNode.clientWidth; if (wm.scrollWidth > avail) wm.style.fontSize = Math.floor(cs * avail / wm.scrollWidth) + 'px'; }

  // ---------------------------------------------------------------- one scroll loop
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    var hr = hero.getBoundingClientRect(); heroF.release(calm ? 0 : smooth(-hr.top / (hr.height * .7)));
    roomUpdate();
    revUpdate(calm, vh);
    var fr = foot.getBoundingClientRect(); foot.style.setProperty('--heat-v', calm ? 1 : smooth((vh - fr.top) / (fr.height * .9)).toFixed(3));
  }

  function layout() { heroF.size(); tileF.size(); roomLayout(); fitWordmark(); $('[data-back]').style.setProperty('--lead', ($('[data-back]').clientWidth * .34 - 6) + 'px'); tick(); }
  var rz, lastW = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (innerWidth !== lastW || !phone()) { lastW = innerWidth; layout(); } else tick(); }, 120); });
  addEventListener('scroll', tick, { passive: true });

  zones.forEach(function (z) { z.style.top = z.dataset.y + '%'; });
  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); heroF.kick(); }); fitWordmark(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { layout(); });
})();
