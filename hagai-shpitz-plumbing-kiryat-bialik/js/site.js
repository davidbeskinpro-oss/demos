(function () {
  var root = document.documentElement, WA = '972508697762';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth <= 900; };
  var TITLE = { he: 'חגי שפיץ · אינסטלטור בקריות · הנרייטה סולד 9, קריית ביאליק', en: 'Hagai Shpitz · Plumber in the Krayot · 9 Henrietta Szold St, Kiryat Bialik' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור חגי שפיץ אינסטלטור בקריות · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Hagai Shpitz, plumber in the Krayot · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'חגי שפיץ, אינסטלטור', 'Hagai Shpitz, plumber');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-stages]', 'שלבים', 'Stages');
    aria('[data-t-opts]', 'מה נסתם', 'What’s blocked');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-call]', 'התקשרו לחגי, 050-869-7762', 'Call Hagai, 050-869-7762');
    aria('[data-t-wa]', 'וואטסאפ לחגי', 'WhatsApp Hagai');
    $$('[data-town] option').forEach(function (o) { o.textContent = o.dataset[l] || (l === 'he' ? 'מקום אחר' : 'Somewhere else'); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('hs-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(), y = scrollY, onBore = y < bore.offsetTop + bore.offsetHeight;
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('hs-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    clearInline(); layout(); write(true); motes.kick();
    if (onBore && b.closest('.nav')) scrollTo(0, 0);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed, [0,24] = all day
  var H = { 0: [0, 24], 1: [0, 24], 2: [0, 24], 3: [0, 24], 4: [0, 24], 5: [0, 24], 6: [0, 24] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x) % 24, m = Math.round((x - Math.floor(x)) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  var allDay = function (t) { return t && t[0] === 0 && t[1] === 24; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (allDay(t)) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
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
  // consecutive days with the same hours share a row; the week starts on Sunday
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = allDay(t) ? (l ? '24 שעות' : 'Open 24 hours') : t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);
  var clock = $('[data-clock]');
  setInterval(function () { var o = nowParts(), h = (+o.hour) % 24; clock.textContent = (h < 10 ? '0' : '') + h + ':' + o.minute + ':' + o.second; }, 1000);

  // ---------------------------------------------------------------- entrances
  $$('.bores [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); });
  $$('.cbento > *').forEach(function (c, i) { c.setAttribute('data-reveal', ''); c.style.setProperty('--d', i * 70 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // letters: the headline and the footer name arrive one letter at a time
  function split(sp, start) {
    var i = start || 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
    return i;
  }
  $$('[data-split] .ln').forEach(function (ln, k) { $$('span[lang]', ln).forEach(function (sp) { split(sp, k * 10); }); });
  $$('[data-fname] > span[lang]').forEach(function (sp) { split(sp, 0); });

  var nav = $('[data-nav]'), bore = $('[data-bore]'), stage = $('[data-stage]'), lens = $('[data-lens]');
  var pipeA = $('[data-pipe]'), pipeB = pipeA.cloneNode(true);
  $$('img', pipeB).forEach(function (i) { i.alt = ''; i.removeAttribute('data-alt-he'); i.setAttribute('aria-hidden', 'true'); });
  pipeB.style.opacity = '0'; pipeA.after(pipeB);
  var ports = $$('[data-port]'), joint = $('[data-joint]'), hcopy = $('[data-hcopy]'), rcopy = $('[data-rcopy]');
  var rtxt = $$('[data-rtxt]'), rdots = $$('[data-rdot]'), osd = $('.osd'), illus = $('.illus');

  // ---------------------------------------------------------------- the LED ring around the lens: lights up one by one on arrival
  var ledBox = $('[data-leds]'), N_LED = 28;
  for (var q = 0; q < N_LED; q++) {
    var li = document.createElement('i'), a = q / N_LED * Math.PI * 2;
    li.style.transform = 'translate(' + (Math.cos(a) * 47.6 / 1.1 * 100).toFixed(1) + '%,' + (Math.sin(a) * 47.6 / 1.1 * 100).toFixed(1) + '%)';
    ledBox.appendChild(li);
  }
  var leds = $$('i', ledBox);
  function lightLeds() { leds.forEach(function (l, i) { if (still()) l.classList.add('on'); else setTimeout(function () { l.classList.add('on'); }, 60 + i * 34); }); }

  // ---------------------------------------------------------------- the LED's pool of light: follows the hand, drifts by itself on touch
  var lx = 50, ly = 47, tx = 50, ty = 47, lastMove = -1e9, pa = 1, pb = 1;
  stage.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    var r = lens.getBoundingClientRect(); lastMove = performance.now();
    tx = (e.clientX - r.left) / r.width * 100; ty = (e.clientY - r.top) / r.height * 100;
  });
  stage.addEventListener('pointerdown', function (e) {
    var r = lens.getBoundingClientRect(); lastMove = performance.now();
    tx = (e.clientX - r.left) / r.width * 100; ty = (e.clientY - r.top) / r.height * 100;
  });
  function lightAt(p, s) { p.style.setProperty('--lx', (50 + (lx - 50) / s).toFixed(2) + '%'); p.style.setProperty('--ly', (47 + (ly - 47) / s).toFixed(2) + '%'); }

  // ---------------------------------------------------------------- dust drifting through the light (ambient)
  var motes = (function () {
    var cv = $('[data-motes]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = true;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = stage.clientWidth; h = stage.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 46 : 90; P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 1.8, vx: (Math.random() - .5) * .18, vy: -.05 - Math.random() * .22, ph: Math.random() * 6.3 });
    }
    function frame(t) {
      raf = 0; c.clearRect(0, 0, w, h);
      if (still() || !vis) return;
      var r = lens.getBoundingClientRect(), Lx = r.left + r.width * lx / 100, Ly = r.top + r.height * ly / 100, R = Math.max(160, r.width * .2);
      for (var i = 0; i < P.length; i++) {
        var p = P[i]; p.x += p.vx + Math.sin(t / 1600 + p.ph) * .12; p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        var d = Math.hypot(p.x - Lx, p.y - Ly), g = clamp(1 - d / (R * 1.6), 0, 1);
        c.globalAlpha = .1 + g * .75; c.fillStyle = g > .2 ? '#e6fff6' : '#9fc7bd';
        c.beginPath(); c.arc(p.x, p.y, p.r * (1 + g * .6), 0, 6.283); c.fill();
      }
      c.globalAlpha = 1; raf = requestAnimationFrame(frame);
    }
    watch(stage, function (v) { vis = v; kick(); });
    function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); }
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- the bore: geometry of the lens in the hero and when it fills the screen
  var G = {};
  function geom() {
    var W = stage.clientWidth, V = stage.clientHeight, p = phone(), r = rtl();
    var hd = p ? W * 1.3 : Math.min(V * 1.2, W * .62), hx = p ? W / 2 : (r ? W * .22 : W * .78), hy = p ? V * .6 + hd / 2 : V * .55;
    var fx = p ? W / 2 : (r ? W * .36 : W * .64), fy = p ? V * .4 : V * .5;
    var fd = 2 * Math.max(Math.hypot(fx, fy), Math.hypot(W - fx, fy), Math.hypot(fx, V - fy), Math.hypot(W - fx, V - fy)) * 1.02;
    G = { W: W, V: V, hd: hd, hx: hx, hy: hy, fd: fd, fx: fx, fy: fy, pt: Math.min(V * (p ? .5 : .62), W * (p ? .82 : .4)) };
    lens.style.setProperty('--D', fd.toFixed(1) + 'px');
  }
  var stageIdx = 0;
  function setStage(k) {
    stageIdx = k;
    rtxt.forEach(function (t, i) { t.classList.toggle('on', i === k); });
    rdots.forEach(function (d, i) { d.classList.toggle('on', i === k); d.setAttribute('aria-pressed', i === k ? 'true' : 'false'); });
    if (still()) ports.forEach(function (p, i) { p.classList.toggle('on', i === k); });
  }
  function stepTo(k) {
    k = (k + ports.length) % ports.length;
    if (still()) { setStage(k); return; }
    scrollTo({ top: bore.offsetTop + (1.05 + k + .5) * G.V, behavior: 'smooth' });
  }
  rdots.forEach(function (d, i) { d.addEventListener('click', function () { stepTo(i); }); });
  $$('a[href="#run"]').forEach(function (a) { a.addEventListener('click', function (ev) { if (still()) return; ev.preventDefault(); stepTo(0); }); });
  $('[data-rprev]').addEventListener('click', function () { stepTo(stageIdx - 1); });
  $('[data-rnext]').addEventListener('click', function () { stepTo(stageIdx + 1); });

  function boreFrame(u) {
    // u = how many screens into the bore. 0–.15 hero; .15–1.05 the lens opens to the screen; then four stages of 1 screen
    var e = smooth((u - .15) / .9), d = lerp(G.hd, G.fd, e), cx = lerp(G.hx, G.fx, e), cy = lerp(G.hy, G.fy, e), s = d / G.fd;
    lens.style.transform = 'translate3d(' + (cx - G.fd / 2).toFixed(1) + 'px,' + (cy - G.fd / 2).toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
    hcopy.style.opacity = clamp(1 - e * 2.2, 0, 1).toFixed(3);
    hcopy.style.transform = 'translateY(' + (-e * 70).toFixed(1) + 'px)';
    hcopy.style.visibility = e > .6 ? 'hidden' : '';
    rcopy.style.opacity = smooth((e - .75) / .25).toFixed(3);
    var oo = phone() ? smooth((e - .6) / .3).toFixed(3) : ''; osd.style.opacity = oo; illus.style.opacity = oo;
    var su = u - 1.05, k = clamp(Math.floor(su), 0, ports.length - 1), t = su < 0 ? -1 : clamp(su - k, 0, 1);
    if (k === ports.length - 1 && su > k) t = Math.min(su - k, 1);
    if (t >= 0 && k !== stageIdx) setStage(k); else if (t < 0 && stageIdx !== 0) setStage(0);
    // the camera pushes into the pipe; at each joint the next length of pipe dissolves in out of the light
    var base = lerp(1, 1.3, e), last = k === ports.length - 1;
    var zA = t < 0 ? base : base * (1 + 1.15 * Math.pow(last ? Math.min(t, .6) : t, 1.15));
    var bnd = 1.05 + k + 1, dd = u - bnd + 1;     // distance past the start of this stage
    var xf = 0, zB = base;
    if (t >= 0 && !last && t > .88) { xf = smooth((t - .88) / .12); zB = base * lerp(.82, 1, xf); }
    if (t >= 0 && k > 0 && dd < .08) { xf = 0; }
    pa = zA; pb = zB;
    pipeA.style.transform = 'scale(' + zA.toFixed(4) + ')';
    pipeB.style.transform = 'scale(' + zB.toFixed(4) + ')';
    pipeB.style.opacity = xf.toFixed(3);
    // the joint ring rushes past at each hand-over
    var jp = t >= 0 && !last ? clamp((t - .8) / .2, 0, 1) : 0;
    joint.style.opacity = (Math.sin(jp * Math.PI) * .9).toFixed(3);
    joint.style.transform = 'translate(-50%,-50%) scale(' + (.6 + jp * jp * 7).toFixed(3) + ')';
    // the stage's real photo surfaces at the end of the pipe, holds, then flies past
    ports.forEach(function (p, i) {
      if (i !== k || t < 0) { p.style.opacity = '0'; p.classList.remove('on'); return; }
      var grow = smooth(t / .42), fly = last ? 0 : smooth((t - .78) / .16);
      var size = G.pt * lerp(.18, 1, grow) * (1 + fly * 2.4) / s;
      p.style.width = size.toFixed(1) + 'px';
      p.style.opacity = (Math.min(1, grow * 2.5) * (1 - fly)).toFixed(3);
      p.classList.add('on');
    });
  }
  function clearInline() {
    [lens, hcopy, rcopy, pipeA, pipeB, joint, osd, illus].forEach(function (el) { el.removeAttribute('style'); });
    pipeB.style.opacity = '0';
    ports.forEach(function (p) { p.removeAttribute('style'); });
    $('[data-work]').style.transform = '';
    setStage(stageIdx);
  }

  // ---------------------------------------------------------------- the composer: the message types itself on the round screen
  var opts = $$('[data-opt]'), town = $('[data-town]'), msgEl = $('[data-msg]'), shown = '', typing = 0, seen = false;
  var OPT = { sink: ['בכיור', 'sink'], shower: ['במקלחת', 'shower'], toilet: ['באסלה', 'toilet'], sewer: ['בקו הביוב', 'sewer line'], yard: ['בניקוז בחצר', 'yard drain'] };
  function placeOpts() {
    opts.forEach(function (o, i) {
      if (innerWidth <= 640) { o.style.removeProperty('--ox'); o.style.removeProperty('--oy'); return; }
      var a = -Math.PI / 2 + (i + .5) / opts.length * Math.PI * 2 * (rtl() ? -1 : 1);
      o.style.setProperty('--ox', (50 + Math.cos(a) * 39.5).toFixed(2) + '%'); o.style.setProperty('--oy', (50 + Math.sin(a) * 39.5).toFixed(2) + '%');
    });
  }
  opts.forEach(function (o) { o.addEventListener('click', function () { o.setAttribute('aria-pressed', o.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); write(); }); });
  town.addEventListener('change', function () { write(); });
  function list(items, l) {
    if (items.length < 2) return items.join('');
    return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }
  function compose() {
    var l = he(), on = opts.filter(function (o) { return o.getAttribute('aria-pressed') === 'true'; }).map(function (o) { return o.dataset.opt; });
    var blk = on.filter(function (k) { return OPT[k]; }).map(function (k) { return OPT[k][l ? 0 : 1]; }), leak = on.indexOf('leak') >= 0;
    var opt = town.options[town.selectedIndex], place = opt.dataset[l ? 'he' : 'en'];
    var m;
    if (l) {
      m = 'שלום חגי, ' + (blk.length ? 'יש לי סתימה ' + list(blk, true) + (leak ? ', וגם נזילה' : '') : leak ? 'יש לי נזילה' : 'אשמח לעזרה באינסטלציה') + '.';
      m += place ? ' אני ב' + place + '.' : '';
      m += ' מתי אפשר לתאם?';
    } else {
      m = 'Hi Hagai, ' + (blk.length ? 'I have a blocked ' + list(blk, false) + (leak ? ', and a leak too' : '') : leak ? 'I have a leak' : 'I’d like some help with plumbing') + '.';
      m += place ? ' I’m in ' + place + '.' : '';
      m += ' When could we arrange a visit?';
    }
    return m;
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !seen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 16);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-monitor]'), function (v) { if (v && !seen) { seen = true; if (!still()) { shown = ''; msgEl.textContent = ''; write(); } } }, { threshold: .35 });

  // ---------------------------------------------------------------- reviews: a gauge that fills, an odometer, a drifting row
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 6) % 10; s.style.transitionDelay = go ? (200 + i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  var gauge = $('[data-gauge]');
  $$('[data-odo]').forEach(function (o) { roll(o, still()); });
  watch(gauge, function (v) { if (v) { gauge.classList.add('in'); $$('[data-odo]').forEach(function (o) { roll(o, true); }); } }, { threshold: .4 });
  var track = $('[data-track]');
  $$('.rv', track).forEach(function (r) { var c = r.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var work = $('[data-work]'), rphoto = $('[data-rphoto]'), foot = $('[data-foot]'), mouth = $('.f-mouth'), cam = $('[data-camhead]'), coil = $('[data-coil]'), coilImg = $('[data-coilimg]');
  watch(work, function (v) { work.classList.toggle('on', v); });
  watch(foot, function (v) { if (v) foot.classList.add('in'); }, { threshold: .25 });
  var ticking = false, lightRaf = 0;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var calm = still(), V = innerHeight, y = scrollY;
    nav.classList.toggle('pill', y > 40);
    var u = (y - bore.offsetTop) / Math.max(1, G.V);
    if (!calm) boreFrame(u);
    // the work sheet rides up and lands over the run
    if (!calm) { var wr = work.getBoundingClientRect(), wp = smooth((V - wr.top) / V); work.style.transform = wp < 1 ? 'scale(' + lerp(.92, 1, wp).toFixed(4) + ')' : ''; }
    // contact: the water tower shrinks from the whole frame into a round lens
    var rr = rphoto.getBoundingClientRect(), kp = calm ? 1 : smooth((V - rr.top) / (V * .9));
    rphoto.style.setProperty('--cr', lerp(72, 47, kp).toFixed(2) + '%');
    $('img', rphoto).style.transform = calm ? '' : 'scale(' + lerp(1.18, 1, kp).toFixed(4) + ')';
    // the coiled cable in the FAQ turns as the page passes it
    var cr = coil.getBoundingClientRect(), cpv = (V - cr.top) / (V + cr.height);
    coilImg.style.transform = calm ? '' : 'rotate(' + ((cpv - .5) * (rtl() ? -150 : 150)).toFixed(2) + 'deg) scale(1.06)';
    // the footer's pipe mouth rises as you arrive
    var fr = foot.getBoundingClientRect(), fp = calm ? 1 : smooth((V - fr.top) / fr.height);
    mouth.style.setProperty('--rise', ((1 - fp) * 120).toFixed(1) + 'px');
    // the camera head steps aside while the hero's own buttons are on screen
    cam.classList.toggle('away', (!calm && u < .35) || (calm && y < V * .5));
  }
  // the light keeps its own gentle loop while the bore is on screen
  var boreVis = true;
  watch(bore, function (v) { boreVis = v; if (v) lightLoop(); });
  function lightLoop() {
    if (lightRaf) return;
    lightRaf = requestAnimationFrame(function f(t) {
      lightRaf = 0;
      if (!boreVis) return;
      var auto = t - lastMove > 2600;
      if (auto) { tx = 50 + Math.cos(t / 2600) * 17; ty = 47 + Math.sin(t / 2100) * 12; }
      if (still()) { lx = tx; ly = ty; } else { lx += (tx - lx) * .08; ly += (ty - ly) * .08; }
      lightAt(pipeA, still() ? 1 : pa); lightAt(pipeB, still() ? 1 : pb);
      if (!still() || !auto) lightRaf = requestAnimationFrame(f);
    });
  }
  stage.addEventListener('pointermove', lightLoop);

  function layout() { geom(); motes.size(); motes.kick(); placeOpts(); track.style.setProperty('--dur', Math.round(track.scrollWidth / 2 / 40) + 's'); tick(); }
  var rz, lastW = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); lastW = innerWidth; }, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); setStage(0); layout(); lightLoop();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { stage.classList.add('ready'); lightLeds(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1000);
  addEventListener('load', function () { layout(); });
})();
