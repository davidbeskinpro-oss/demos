(function () {
  var root = document.documentElement, WA = '972522340500';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var TITLE = { he: 'חץ · תיקון מוצרי חשמל ביתיים · הרב וינרוב 18, טירת כרמל', en: 'Hetz · Home-appliance repair · 18 HaRav Weinrob St, Tirat Carmel' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור חץ, שירות מקצועי לתיקון מוצרי חשמל ביתיים בטירת הכרמל · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Hetz, home-appliance repair in Tirat Carmel · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'חץ', 'Hetz');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לציון, 052-234-0500', 'Call Tzion, 052-234-0500');
    aria('[data-t-wa]', 'וואטסאפ לציון', 'WhatsApp Tzion');
    aria('[data-t-which]', 'איזה מכשיר', 'Which appliance');
    aria('[data-t-what]', 'מה קורה לו', 'What it is doing');
    $$('.part').forEach(function (p) { p.textContent = p.dataset[l]; p._done = false; });
    $$('.tg').forEach(function (t) { t.setAttribute('aria-label', $('[lang="' + l + '"]', t).textContent); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('hz-lang', l); } catch (e) {}
    texts(l); hours(); symptoms(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('hz-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    hero.classList.add('ready'); layout(); field.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [8, 18.5], 1: [8, 18.5], 2: [8, 18.5], 3: [8, 18.5], 4: [8, 18.5], 5: [8, 13.5], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
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
      var val = !t ? (l ? 'סגור' : 'Closed') : t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);
  // the Tirat Carmel clock in the bento
  var clock = $('[data-clock]'), clockOn = false;
  watch(clock, function (v) { clockOn = v; });
  function clk() { var o = nowParts(); clock.textContent = ((o.hour % 24) < 10 ? '0' : '') + (o.hour % 24) + ':' + o.minute + ':' + o.second; }
  clk(); setInterval(function () { if (clockOn) clk(); }, 1000);

  // ---------------------------------------------------------------- entrances
  $$('[data-bento]').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 8 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), drum = $('[data-drum]');

  // ---------------------------------------------------------------- the hero: a drum that turns, and a field of arrows that point at you
  var spin = 0, spinV = 0, lastT = 0, px = -1, py = -1, auto = 0;
  var field = (function () {
    var cv = $('[data-field]'), c = cv.getContext('2d'), cell, cols, rows, w, h, raf = 0, vis = true, lit;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = phone() ? 34 : 44; cols = Math.ceil(w / cell); rows = Math.ceil(h / cell); lit = new Float32Array(cols * rows);
    }
    function draw(tx, ty, T) {
      c.clearRect(0, 0, w, h);
      var reach = Math.max(w, h) * .32;
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
        var k = y * cols + x, cx = x * cell + cell / 2, cy = y * cell + cell / 2, dx = tx - cx, dy = ty - cy, d = Math.sqrt(dx * dx + dy * dy) || 1;
        var near = clamp(1 - d / reach, 0, 1), a = Math.atan2(dy, dx), L = 7 + near * 7;
        var base = .08 + .05 * Math.sin(T * 1.2 + x * .5 + y * .3);
        c.save(); c.translate(cx, cy); c.rotate(a);
        c.strokeStyle = near > .02 ? 'rgba(255,' + Math.round(lerp(170, 100, near)) + ',' + Math.round(lerp(150, 70, near)) + ',' + (base + near * .8).toFixed(3) + ')' : 'rgba(190,210,230,' + base.toFixed(3) + ')';
        c.lineWidth = near > .5 ? 2 : 1.4; c.lineCap = 'round'; c.lineJoin = 'round';
        c.beginPath(); c.moveTo(-L, 0); c.lineTo(L, 0); c.moveTo(L - 4.5, -4); c.lineTo(L, 0); c.lineTo(L - 4.5, 4); c.stroke();
        c.restore();
      }
    }
    function frame(t) {
      raf = 0;
      var T = t / 1000, dt = lastT ? Math.min(.05, (t - lastT) / 1000) : .016; lastT = t;
      var tx, ty;
      if (px >= 0) { tx = px; ty = py; }
      else { auto += dt; tx = w * (.5 + .34 * Math.sin(auto * .45)); ty = h * (.45 + .25 * Math.sin(auto * .7 + 1)); }
      if (still()) { tx = w * (rtl() ? .25 : .75); ty = h * .35; }
      draw(tx, ty, still() ? 0 : T);
      // the drum: a slow turn of its own, the scroll and the hand add to it
      if (!still()) {
        spinV *= .92; spin += (6 + spinV) * dt * (rtl() ? -1 : 1);
        drum.style.transform = 'rotate(' + (spin + scrollY * .05 * (rtl() ? -1 : 1)).toFixed(2) + 'deg) scale(' + (1 + Math.min(scrollY / innerHeight, 1) * .12).toFixed(4) + ')';
      } else drum.style.transform = '';
      if (vis && !still()) raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); var nx = e.clientX - r.left; if (px >= 0) spinV += (nx - px) * .4; px = nx; py = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { px = -1; });
    hero.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') { var r = hero.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; setTimeout(function () { px = -1; }, 1600); } });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- the fault: arrowhead window, camera path, decoding labels
  var fault = $('[data-fault]'), win = $('[data-win]'), cam = $('[data-cam]'), parts = $$('.part'), farrow = $('[data-farrow]');
  var GLYPH = 'אבגדהוזחטיכלמנסעפצקרשת#%&*+=<>/\\0123456789';
  function decode(p) {
    if (p._done) return; p._done = true;
    var txt = p.dataset[he() ? 'he' : 'en'];
    if (still()) { p.textContent = txt; return; }
    var t0 = performance.now();
    (function st(t) {
      var n = Math.floor((t - t0) / 34), out = '';
      for (var i = 0; i < txt.length; i++) out += i < n - 4 || txt[i] === ' ' ? txt[i] : i < n + 2 ? GLYPH[Math.floor(Math.random() * GLYPH.length)] : '';
      p.textContent = out;
      if (n - 4 < txt.length) requestAnimationFrame(st); else p.textContent = txt;
    })(t0);
  }
  parts.forEach(function (p) { p.style.setProperty('--x', p.dataset.x); p.style.setProperty('--y', p.dataset.y); });
  // the camera's stops over the board: [progress, focus x, focus y, zoom]
  var PATH = [[0, .5, .5, 1], [.3, .42, .3, 1.5], [.45, .58, .5, 1.6], [.6, .6, .8, 1.55], [.72, .38, .72, 1.6], [.88, .3, .55, 2.1], [1, .3, .55, 2.1]];
  var SHOW = [[.26, 0], [.32, 1], [.44, 2], [.58, 3], [.7, 4], [.86, 5]];
  function camAt(q) {
    for (var i = 1; i < PATH.length; i++) if (q <= PATH[i][0]) {
      var a = PATH[i - 1], b = PATH[i], t = smooth((q - a[0]) / (b[0] - a[0] || 1));
      return [lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t)];
    }
    return PATH[PATH.length - 1].slice(1);
  }
  function faultUpdate(calm) {
    if (calm) { win.style.removeProperty('--clip'); cam.style.transform = ''; cam.style.setProperty('--z', 1); parts.forEach(function (p) { p.classList.add('on'); p.textContent = p.dataset[he() ? 'he' : 'en']; }); farrow.style.opacity = 1; farrow.style.transform = 'scale(1)'; return; }
    var r = fault.getBoundingClientRect(), W = innerWidth, Hh = innerHeight, p = clamp(-r.top / Math.max(1, r.height - Hh), 0, 1);
    // 1. the window: an arrowhead that points the reading way, growing from a small mark to the whole screen
    var o = smooth(p / .2), S = lerp(Math.min(W, Hh) * .36, Math.max(W, Hh) * 2.8, o * o), cx = W / 2, cy = Hh * .46, s = rtl() ? -1 : 1;
    var pt = function (x, y) { return (cx + s * x * S).toFixed(1) + 'px ' + (cy + y * S).toFixed(1) + 'px'; };
    win.style.setProperty('--clip', o >= 1 ? 'none' : 'polygon(' + [pt(1, 0), pt(-.75, -.9), pt(-.38, 0), pt(-.75, .9)].join(',') + ')');
    // 2. the camera travels over the board
    var q = clamp((p - .18) / .8, 0, 1), f = camAt(q), z = f[2], Wc = cam.offsetWidth, Hc = cam.offsetHeight;
    var tx = Wc / 2 - z * f[0] * Wc, ty = Hc / 2 - z * f[1] * Hc, L0 = W / 2 - Wc / 2, T0 = Hh / 2 - Hc / 2;
    tx = clamp(tx, W - z * Wc - L0, -L0); ty = clamp(ty, Hh - z * Hc - T0, -T0);
    cam.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + z.toFixed(4) + ')';
    cam.style.setProperty('--z', z.toFixed(4));
    SHOW.forEach(function (sw) { var el = parts[sw[1]], on = q >= sw[0]; el.classList.toggle('on', on); if (on) decode(el); else el._done = false; });
    // 3. the arrow flies in and lands on the burnt resistor
    var a = smooth((q - .84) / .12);
    farrow.style.opacity = a > 0 ? 1 : 0;
    farrow.style.transform = 'translateX(' + ((1 - a) * -70) + 'vw) scale(' + (1 / z).toFixed(4) + ')';
  }

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- bento: spotlight, a fridge light that flickers on, photos that take turns
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });
  var fridge = $('.t-fridge'), swap = $('.swap'), bentoOn = false;
  function flick() { fridge.classList.remove('flick'); void fridge.offsetWidth; fridge.classList.add('flick'); }
  fridge.addEventListener('pointerenter', function () { if (!still()) flick(); });
  watch($('[data-bento]'), function (v) { bentoOn = v; if (v && !still()) flick(); });
  setInterval(function () { if (bentoOn && !still()) swap.classList.toggle('b'); }, 3400);

  // ---------------------------------------------------------------- the live thing: aim at the appliance, point at what it does, the message writes itself
  var SYM = {
    wash: { he: ['לא נדלקת', 'לא מסתובבת', 'לא מרוקנת מים', 'נוזלת', 'עושה רעש חזק', 'מציגה קוד שגיאה', 'לא עובדת כמו שצריך'], en: ['won’t turn on', 'won’t spin', 'won’t drain', 'is leaking', 'is making a loud noise', 'shows an error code', 'isn’t working properly'] },
    fridge: { he: ['לא מקרר', 'מקפיא יותר מדי', 'עושה רעש', 'מטפטף מים', 'לא עובד כמו שצריך'], en: ['isn’t cooling', 'is freezing too much', 'is making noise', 'is dripping water', 'isn’t working properly'] },
    dish: { he: ['לא נדלק', 'לא מרוקן מים', 'לא מנקה טוב', 'נוזל', 'מציג קוד שגיאה', 'לא עובד כמו שצריך'], en: ['won’t turn on', 'won’t drain', 'isn’t cleaning well', 'is leaking', 'shows an error code', 'isn’t working properly'] },
    dry: { he: ['לא נדלק', 'לא מחמם', 'לא מסתובב', 'עושה רעש חזק', 'לא עובד כמו שצריך'], en: ['won’t turn on', 'isn’t heating', 'won’t tumble', 'is making a loud noise', 'isn’t working properly'] },
    other: { he: ['לא נדלק', 'עושה רעש', 'מתחמם יותר מדי', 'לא עובד כמו שצריך'], en: ['won’t turn on', 'is making noise', 'is overheating', 'isn’t working properly'] }
  };
  var tgs = $$('.tg'), scale = $('[data-scale]'), pointer = $('[data-pointer]'), steps = $$('[data-step]'), symIdx = 0;
  function app() { return tgs.filter(function (t) { return t.getAttribute('aria-checked') === 'true'; })[0]; }
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function symptoms() {
    var list = SYM[app().dataset.app][he() ? 'he' : 'en'];
    symIdx = Math.min(symIdx, list.length - 1);
    $$('button', scale).forEach(function (b) { b.remove(); });
    list.forEach(function (s, i) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'radio'); b.textContent = s;
      b.setAttribute('aria-checked', i === symIdx ? 'true' : 'false');
      b.addEventListener('click', function () { symIdx = i; $$('button', scale).forEach(function (x, j) { x.setAttribute('aria-checked', j === i ? 'true' : 'false'); }); aimPointer(); lightStep(0); write(); });
      scale.appendChild(b);
    });
    aimPointer();
  }
  function aimPointer() { var b = $$('button', scale)[symIdx]; if (b) pointer.style.transform = 'translateY(' + (b.offsetTop + b.offsetHeight / 2 - 6) + 'px)'; }
  tgs.forEach(function (t) { t.addEventListener('click', function () {
    tgs.forEach(function (x) { x.setAttribute('aria-checked', x === t ? 'true' : 'false'); x.classList.remove('shot'); });
    if (!still()) { void t.offsetWidth; t.classList.add('shot'); }
    symptoms(); lightStep(0); write();
  }); });
  var msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
  $('[data-send]').addEventListener('pointerenter', function () { lightStep(1); });
  $('[data-send]').addEventListener('focus', function () { lightStep(1); });
  function compose() {
    var a = app(), s = SYM[a.dataset.app][he() ? 'he' : 'en'][symIdx];
    return he() ? 'שלום ציון, ' + a.dataset.he + ' שלי ' + s + '. אפשר לתאם בדיקה?'
                : 'Hi Tzion, my ' + a.dataset.en + ' ' + s + '. Could we arrange a check?';
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
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });
  if (io) steps.forEach(function (s, i) { new IntersectionObserver(function (es) { if (es[0].isIntersecting) lightStep(i); }, { rootMargin: '-35% 0px -35% 0px' }).observe(s); });

  // ---------------------------------------------------------------- scroll loop
  var flight = $('[data-flight]'), farr = $('svg', flight);
  var revs = $('[data-revs]'), rvs = $$('.rv', revs), pins = rvs.map(function (r) { return $('.pin-arrow', r); });
  var reach = $('[data-reach]'), cphoto = $('[data-cphoto]'), crows = $$('[data-crow]');
  var foot = $('[data-foot]'), wm = $('[data-wm]'), wmArrow = $('[data-wmarrow]'), fletch = $('[data-fletch]');
  // the footer name, one span per letter
  $$('span[lang]', wm).forEach(function (s) { s.innerHTML = s.textContent.split('').map(function (c, i) { return '<span class="c" style="--k:' + i + '">' + c + '</span>'; }).join(''); });
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, W = innerWidth;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) field.kick();
    faultUpdate(calm);
    // seam 2: the arrow crosses the gap, the way the page reads
    var fr = flight.getBoundingClientRect(), fp = calm ? .5 : clamp((vh - fr.top) / (vh + fr.height), 0, 1), aw = farr.getBoundingClientRect().width;
    var x0 = rtl() ? W : -aw, x1 = rtl() ? -aw : W, fx = lerp(x0, x1, fp);
    farr.style.transform = 'translateX(' + fx.toFixed(1) + 'px)' + (rtl() ? ' scaleX(-1)' : '');
    flight.style.setProperty('--trail', calm ? 0 : clamp(fp * 1.6 - .1, 0, 1).toFixed(3));
    flight.style.setProperty('--o', rtl() ? '100%' : '0%');
    // reviews: each card flies in from alternating sides, then an arrow pins it
    var sticky = W > 1000 && !calm;
    rvs.forEach(function (rv, i) {
      if (calm) { rv.style.transform = ''; pins[i].style.transform = rtl() ? 'scaleX(-1)' : ''; pins[i].style.opacity = ''; return; }
      var t;
      if (sticky) { var pr = prog(revs); t = smooth((pr + .12 - i * .24) / .28); }
      else { var rr = rv.getBoundingClientRect(); t = smooth((vh - rr.top) / (vh * .5)); }
      var side = (i % 2 ? -1 : 1) * (rtl() ? -1 : 1);
      rv.style.transform = 'translateX(' + ((1 - t) * side * 70).toFixed(2) + 'vw) rotate(' + ((1 - t) * side * 9 + (i - 1) * 1.2 * t).toFixed(2) + 'deg)';
      var a = smooth((t - .78) / .22), dir = rtl() ? -1 : 1;
      pins[i].style.opacity = a > 0 ? 1 : 0;
      pins[i].style.transform = 'translateX(' + ((1 - a) * -220 * dir).toFixed(1) + 'px)' + (rtl() ? ' scaleX(-1)' : '');
    });
    // contact: the photo shrinks from full screen into its frame, the bento rises
    var desk = W > 1000;
    var kp = calm || !desk ? 1 : prog(reach), s2 = calm ? 1 : smooth(kp / .45);
    if (!calm && desk) {
      var PW = cphoto.clientWidth, PH = cphoto.clientHeight, t1 = PH * .12, b1 = PH * .08, st = PW * .5 + 22, en = 22;
      var L = rtl() ? en : st, R = rtl() ? st : en;
      cphoto.style.setProperty('--pt', (t1 * s2).toFixed(1) + 'px'); cphoto.style.setProperty('--pb', (b1 * s2).toFixed(1) + 'px');
      cphoto.style.setProperty('--pl', (L * s2).toFixed(1) + 'px'); cphoto.style.setProperty('--pr', (R * s2).toFixed(1) + 'px'); cphoto.style.setProperty('--pr2', (22 * s2).toFixed(1) + 'px');
    } else ['--pt', '--pb', '--pl', '--pr', '--pr2'].forEach(function (k) { cphoto.style.removeProperty(k); });
    crows.forEach(function (r, i) {
      var v = calm || !desk ? 1 : smooth((s2 - .55 - i * .07) / .2);
      r.style.opacity = calm || !desk ? '' : v.toFixed(3); r.style.transform = calm || !desk || v >= 1 ? '' : 'translateY(' + ((1 - v) * 30).toFixed(1) + 'px)';
    });
    // footer: the letters rise, the arrow flies into the name
    var ftr = foot.getBoundingClientRect(), fpp = calm ? 1 : smooth((vh - ftr.top) / (ftr.height * .8));
    $$('.c', wm).forEach(function (c, i) { c.style.setProperty('--rise', ((1 - smooth((fpp - i * .12) / .7)) * 60).toFixed(1)); c.style.color = fpp > .9 ? 'var(--ink)' : ''; });
    var aa = calm ? 1 : smooth((fpp - .55) / .4), wr = wm.getBoundingClientRect(), wfr = foot.getBoundingClientRect(), aw2 = wmArrow.getBoundingClientRect().width || 300;
    var endX = rtl() ? (wr.right - wfr.left - aw2 * .35) : (wr.left - wfr.left - aw2 * .65), startX = rtl() ? W + 40 : -aw2 - 40;
    wmArrow.style.left = '0px';
    wmArrow.style.transform = 'translateX(' + lerp(startX, endX, aa).toFixed(1) + 'px)' + (rtl() ? ' scaleX(-1)' : '');
    // the phone control steps aside when the contact cards are on screen
    var cr = reach.getBoundingClientRect(); fletch.classList.toggle('away', cr.top < vh * .5 && cr.bottom > vh * .5);
  }
  function fitWord() { var f = $('.f-word'); wm.style.fontSize = ''; var cs = parseFloat(getComputedStyle(wm).fontSize), ww = wm.scrollWidth, max = f.clientWidth * .78; if (ww > max) wm.style.fontSize = (cs * max / ww) + 'px'; }

  function layout() { field.size(); fitWord(); aimPointer(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); symptoms(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); field.kick(); aimPointer(); fitWord(); tick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { layout(); });
})();
