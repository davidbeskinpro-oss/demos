(function () {
  var root = document.documentElement, WA = '972523103737';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var desk = matchMedia('(min-width: 900px)');
  var io = 'IntersectionObserver' in window;
  var TITLE = { he: 'THE ART BOX · עומרי שריקי · מספרה וטיפולי קרקפת · שדרות הנשיא 23, חיפה', en: 'THE ART BOX · Omri Shriki · Hair salon & scalp treatments · 23 Hanassi Blvd, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור THE ART BOX by Omri Shriki · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for THE ART BOX by Omri Shriki · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-wa]', 'וואטסאפ לעומרי', 'WhatsApp Omri');
    aria('[data-t-call]', 'התקשרו לעומרי, 052-310-3737', 'Call Omri, 052-310-3737');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: שדרות הנשיא 23, חיפה' : 'Map: 23 Hanassi Blvd, Haifa'; });
    var hi = l === 'he' ? 'היי עומרי, אשמח לקבוע תור.' : 'Hi Omri, I’d like to book an appointment.';
    $$('[data-wa-link]').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(hi); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ab-lang', l); } catch (e) {}
    texts(l); hours(); splitFill(); compose(true); fit(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('ab-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-mirror]').forEach(function (el) { el.classList.add('in'); });
    introEnd(); drift(); stage.show(current, true); compose(true); layout();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 18], 1: null, 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [8, 13.5], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
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
      var val = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : 'Open 24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- nav gathers into a pill
  var nav = $('[data-nav]');

  // ---------------------------------------------------------------- hero line fills letter by letter
  function splitFill() {
    $$('[data-fill] > span[lang]').forEach(function (sp) {
      if (sp.dataset.done) return; sp.dataset.done = 1;
      var i = 0;
      sp.innerHTML = sp.textContent.split(' ').map(function (w) {
        return '<span style="white-space:nowrap">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
      sp.setAttribute('aria-label', sp.textContent);
    });
  }

  // ---------------------------------------------------------------- entrances
  $$('.shelf [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', i * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); if (e.target.hasAttribute('data-odo') || e.target.querySelector('[data-roll]')) roll(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  $$('[data-reveal],[data-tile],.chap .mirror:not(.hero .mirror)').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  $$('.chap .mirror').forEach(function (m) { if (m.closest('.hero')) return; });

  // ---------------------------------------------------------------- odometer: real figures roll into place
  function roll(scope) {
    $$('[data-roll]', scope).forEach(function (b) {
      if (b.dataset.rolled) return; b.dataset.rolled = 1;
      var v = b.dataset.roll; b.setAttribute('aria-label', v); b.setAttribute('role', 'img'); b.innerHTML = '';
      v.split('').forEach(function (c, k) {
        if (!/\d/.test(c)) { var s = document.createElement('span'); s.textContent = c; s.setAttribute('aria-hidden', 'true'); b.appendChild(s); return; }
        var w = document.createElement('span'); w.className = 'roll'; w.setAttribute('aria-hidden', 'true');
        var col = document.createElement('span'); w.appendChild(col); b.appendChild(w);
        var to = 10 + (+c);
        if (still()) col.style.transform = 'translateY(-' + to + 'em)';
        else { col.style.transitionDelay = k * 120 + 'ms'; requestAnimationFrame(function () { requestAnimationFrame(function () { col.style.transform = 'translateY(-' + to + 'em)'; }); }); }
      });
    });
  }
  $$('.rev-head').forEach(function (h) { if (!io) roll(h); });

  // ---------------------------------------------------------------- the stage: one lit mirror reflecting each chapter
  var chaps = $$('[data-chap]'), keyOf = { intro: 'omri', omri: 'omri2', care: 'shelf', salon: 'salon', learn: 'learn' };
  var stageEl = $('[data-stage]'), sm = $('[data-stage-mirror]'), sweep = $('.sweep', sm), current = 'intro', introOn = false;
  var stage = (function () {
    var layers = {}, z = 1, shown = null;
    chaps.forEach(function (c) {
      $$('.layer', c).forEach(function (l) { var k = l.cloneNode(true); $$('img', k).forEach(function (i) { i.alt = ''; }); sm.insertBefore(k, sweep); layers[k.dataset.k] = k; });
    });
    function hidden() { return root.dir === 'rtl' ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'; }
    function show(k, instant) {
      var el = layers[k]; if (!el || (shown === k && !instant)) return;
      shown = k; el.style.zIndex = ++z; el.style.clipPath = 'inset(0)';
      if (instant || still() || !el.animate) return;
      var e = 'cubic-bezier(.65,0,.35,1)', d = 1050, r = root.dir === 'rtl';
      el.animate([{ clipPath: hidden() }, { clipPath: 'inset(0)' }], { duration: d, easing: e });
      sweep.style.zIndex = z + 1;
      sweep.animate([{ transform: 'translateX(' + (r ? '100%' : '0%') + ')', opacity: 0 }, { opacity: 1, offset: .08 }, { opacity: 1, offset: .9 }, { transform: 'translateX(' + (r ? '0%' : '100%') + ')', opacity: 0 }], { duration: d, easing: e });
    }
    return { show: show, layers: layers };
  })();
  function chapterNow() {
    var mid = innerHeight * .5, k = chaps[0].dataset.chap;
    chaps.forEach(function (c) { var r = c.getBoundingClientRect(); if (r.top <= mid) k = c.dataset.chap; });
    return k;
  }

  // parallax + sheen: the mirror follows the hand on desktop, drifts by itself on touch
  var sheenAuto = !matchMedia('(hover: hover)').matches;
  stageEl.addEventListener('pointermove', function (e) {
    if (still()) return;
    var r = sm.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    sm.style.setProperty('--sx', (x * 100).toFixed(1) + '%'); sm.style.setProperty('--sy', (y * 100).toFixed(1) + '%');
    sm.style.setProperty('--px', ((x - .5) * -18).toFixed(1) + 'px'); sm.style.setProperty('--py', ((y - .5) * -14).toFixed(1) + 'px');
  });
  document.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var t = e.target.closest && e.target.closest('.tile'); if (!t) return;
    var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });

  // ---------------------------------------------------------------- opening: the logo gathers out of fine clippings on the dark mirror
  var PTS = window.LOGO_PTS || [];
  function intro(fig, done) {
    var layer = $('.layer[data-k="intro"]', fig), cv = $('.dust', layer), card = $('.logo-card', layer);
    var ctx = cv.getContext && cv.getContext('2d'); if (!ctx || !PTS.length) { card.style.opacity = 1; done(); return; }
    var dpr = Math.min(devicePixelRatio || 1, 2), W = layer.clientWidth, Hh = layer.clientHeight;
    cv.width = W * dpr; cv.height = Hh * dpr; ctx.scale(dpr, dpr);
    var cr = card.getBoundingClientRect(), lr = layer.getBoundingClientRect(), ox = cr.left - lr.left, oy = cr.top - lr.top, s = cr.width;
    var P = [];
    for (var i = 0; i < PTS.length; i += 2) {
      var a = Math.random() * Math.PI * 2, rad = Math.max(W, Hh) * (.35 + Math.random() * .6);
      P.push({ x0: W / 2 + Math.cos(a) * rad, y0: Hh / 2 + Math.sin(a) * rad * .8, x1: ox + PTS[i] * s, y1: oy + PTS[i + 1] * s, d: Math.random() * 320, ang: Math.random() * Math.PI, len: 3 + Math.random() * 5, curl: (Math.random() - .5) * 120 });
    }
    var t0 = performance.now(), cardShown = false, ended = false;
    function frame(t) {
      if (ended) return;
      var e = t - t0; ctx.clearRect(0, 0, W, Hh);
      var fade = clamp(1 - (e - 1250) / 450, 0, 1);
      ctx.strokeStyle = 'rgba(236,227,212,' + (0.9 * fade) + ')'; ctx.lineWidth = 1.2; ctx.lineCap = 'round'; ctx.beginPath();
      for (var j = 0; j < P.length; j++) {
        var p = P[j], q = clamp((e - p.d) / 1050, 0, 1), k = 1 - Math.pow(1 - q, 3);
        var x = p.x0 + (p.x1 - p.x0) * k, y = p.y0 + (p.y1 - p.y0) * k, c = Math.sin(k * Math.PI) * p.curl;
        x += c * .3; y += c * .2;
        var an = p.ang + (1 - k) * 4, l = p.len * (1 - k * .85);
        ctx.moveTo(x - Math.cos(an) * l, y - Math.sin(an) * l); ctx.lineTo(x + Math.cos(an) * l, y + Math.sin(an) * l);
      }
      ctx.stroke();
      if (!cardShown && e > 1050) { cardShown = true; card.animate ? card.animate([{ opacity: 0, transform: 'translate(-50%,-50%) scale(.96)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }], { duration: 600, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'forwards' }) : (card.style.opacity = 1); }
      if (e > 2150) { ended = true; ctx.clearRect(0, 0, W, Hh); done(); return; }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return function () { ended = true; ctx.clearRect(0, 0, W, Hh); card.style.opacity = 1; };
  }
  var stopIntro = null;
  function introEnd() {
    if (!introOn) return; introOn = false;
    if (stopIntro) stopIntro();
    stageEl.classList.remove('intro');
    $('.hero .mirror').classList.add('done');
    current = chapterNow(); stage.show(keyOf[current], still());
  }
  if (still()) { stage.show(keyOf[chapterNow()], true); $('.hero .mirror').classList.add('done'); }
  else {
    introOn = true; stageEl.classList.add('intro'); stage.show('intro', true);
    stopIntro = intro(desk.matches ? sm : $('.hero .mirror'), introEnd);
  }

  // ambient: motes of dust floating in the mirror light (desktop stage)
  var dust = (function () {
    var cv = document.createElement('canvas'); cv.className = 'dust'; cv.style.zIndex = 29; cv.style.pointerEvents = 'none'; cv.setAttribute('aria-hidden', 'true');
    sm.appendChild(cv);
    var ctx = cv.getContext('2d'), M = [], W = 0, Hh = 0, run = false, vis = true;
    function size() { var d = Math.min(devicePixelRatio || 1, 2); W = sm.clientWidth; Hh = sm.clientHeight; cv.width = W * d; cv.height = Hh * d; ctx.setTransform(d, 0, 0, d, 0, 0); }
    for (var i = 0; i < 46; i++) M.push({ x: Math.random(), y: Math.random(), r: .6 + Math.random() * 1.6, v: .00006 + Math.random() * .00012, ph: Math.random() * 6.3 });
    function tick(t) {
      if (!run) return;
      ctx.clearRect(0, 0, W, Hh);
      M.forEach(function (m) {
        m.y -= m.v * 16; if (m.y < -.02) { m.y = 1.02; m.x = Math.random(); }
        var x = (m.x + Math.sin(t / 2400 + m.ph) * .012) * W, y = m.y * Hh, a = .25 + .35 * Math.sin(t / 900 + m.ph * 3) ** 2;
        ctx.fillStyle = 'rgba(255,232,190,' + a.toFixed(3) + ')'; ctx.beginPath(); ctx.arc(x, y, m.r, 0, 6.283); ctx.fill();
      });
      if (sheenAuto) { sm.style.setProperty('--sx', (50 + Math.sin(t / 3000) * 35).toFixed(1) + '%'); sm.style.setProperty('--sy', (30 + Math.cos(t / 4100) * 22).toFixed(1) + '%'); }
      requestAnimationFrame(tick);
    }
    function kick() { var want = !still() && desk.matches && vis; if (want && !run) { run = true; size(); requestAnimationFrame(tick); } else if (!want) { run = false; ctx.clearRect(0, 0, W, Hh); } }
    if (io) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; kick(); }).observe(stageEl);
    addEventListener('resize', function () { if (run) size(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- lights in the salon: scroll and the switch
  var salon = $('#salon'), dimmer = $('[data-dimmer]'), forced = null;
  dimmer.addEventListener('click', function () { forced = dimmer.getAttribute('aria-checked') !== 'true'; layout(); });
  function lights() {
    var r = salon.getBoundingClientRect(), vh = innerHeight;
    var p = clamp((vh * .8 - r.top) / (Math.min(r.height, vh) * .75), 0, 1);
    if (forced !== null) p = forced ? 1 : 0;
    if (still() && forced === null) p = 1;
    $$('.lights').forEach(function (l) { l.style.setProperty('--lit', p.toFixed(3)); });
    dimmer.setAttribute('aria-checked', p > .5 ? 'true' : 'false');
  }

  // ---------------------------------------------------------------- the avenue settles into its frame
  var ave = $('[data-avenue]');
  function avenue() { var r = ave.getBoundingClientRect(), vh = innerHeight; var p = still() ? 1 : clamp((vh - r.top) / (vh * .85), 0, 1); ave.style.setProperty('--p', p.toFixed(3)); }

  // ---------------------------------------------------------------- reviews drift
  var dr = $('[data-drift]'), run = $('.run', dr), clones = [];
  function drift() {
    if (still()) { clones.forEach(function (c) { c.remove(); }); clones = []; dr.classList.remove('go'); return; }
    if (!clones.length) $$('.rv', run).forEach(function (li) { var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); run.appendChild(c); clones.push(c); });
    if (io) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { dr.classList.add('go'); o.disconnect(); } }).observe(dr); else dr.classList.add('go');
  }
  drift();

  // ---------------------------------------------------------------- the box: compartments write the message to Omri
  var tray = $('[data-tray]'), msg = $('[data-msg]'), send = $('[data-send]'), shown = '', typer = 0, seen = false;
  $$('.well', tray).forEach(function (w) {
    w.addEventListener('click', function () {
      var fs = w.closest('fieldset'), multi = fs.hasAttribute('data-multi'), on = w.getAttribute('aria-pressed') === 'true';
      if (!multi) $$('.well', fs).forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
      w.setAttribute('aria-pressed', on ? 'false' : 'true');
      compose();
    });
  });
  function picked(g) { return $$('[data-group="' + g + '"] .well[aria-pressed="true"]', tray).map(function (w) { return w.dataset[he() ? 'he' : 'en']; }); }
  function list(a, l) { if (a.length < 2) return a.join(''); return a.slice(0, -1).join(', ') + (l ? ' ו' : ' and ') + a[a.length - 1]; }
  function text() {
    var l = he(), svc = picked('svc'), hair = picked('hair')[0], when = picked('when')[0];
    var learn = svc.filter(function (s) { return /ללמוד|learning/.test(s); }).length; svc = svc.filter(function (s) { return !/ללמוד|learning/.test(s); });
    var out = [];
    if (l) {
      out.push(svc.length ? 'היי עומרי, אשמח לקבוע תור: ' + list(svc, 1) + '.' : 'היי עומרי, אשמח לקבוע תור.');
      if (learn) out.push(svc.length ? 'אשמח גם ללמוד איך לסדר את השיער שלי בבית.' : 'אשמח ללמוד איך לסדר את השיער שלי בבית.');
      if (hair) out.push('השיער שלי ' + hair + '.');
      if (when) out.push('הכי נוח לי ' + when + '.');
      out.push('תודה!');
    } else {
      out.push(svc.length ? 'Hi Omri, I’d like to book ' + list(svc, 0) + '.' : 'Hi Omri, I’d like to book an appointment.');
      if (learn) out.push(svc.length ? 'I’d also love to learn how to handle my hair at home.' : 'I’d love to learn how to handle my hair at home.');
      if (hair) out.push('My hair is ' + hair + '.');
      if (when) out.push(when + ' work best for me.');
      out.push('Thanks!');
    }
    return out.join(' ');
  }
  function compose(instant) {
    var t = text(); send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t);
    clearInterval(typer);
    if (instant || still() || !seen) { shown = t; msg.textContent = t; return; }
    var k = 0; while (k < shown.length && k < t.length && shown[k] === t[k]) k++;
    var cur = shown.slice(0, k);
    typer = setInterval(function () {
      if (cur.length < t.length) { cur = t.slice(0, cur.length + 2); msg.textContent = cur; }
      else { clearInterval(typer); shown = t; }
    }, 16);
    shown = t.slice(0, k);
  }
  if (io) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { seen = true; o.disconnect(); if (!still()) { shown = ''; msg.textContent = ''; compose(); } } }, { threshold: .4 }).observe(msg);

  // ---------------------------------------------------------------- footer wordmark fits its width
  var word = $('[data-fit]');
  function fit() { word.style.fontSize = '100px'; var w = word.parentNode.clientWidth, s = word.scrollWidth; word.style.fontSize = Math.min(260, Math.floor(100 * w / s * .98)) + 'px'; }

  // ---------------------------------------------------------------- one loop for everything scroll-linked
  var ticking = false;
  function layout() {
    ticking = false;
    nav.classList.toggle('pill', scrollY > 30);
    if (desk.matches) {
      var k = chapterNow();
      if (k !== current) { if (introOn && k !== 'intro') introEnd(); current = k; if (!introOn) stage.show(keyOf[k]); }
    }
    lights(); avenue(); dust.kick();
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(layout); } }, { passive: true });
  addEventListener('resize', function () { fit(); layout(); });
  if (desk.addEventListener) desk.addEventListener('change', function () { stage.show(keyOf[chapterNow()], true); dust.kick(); });

  texts(root.lang); hours(); splitFill(); compose(true); layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit); else fit();
})();
