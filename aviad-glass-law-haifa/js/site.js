(function () {
  var root = document.documentElement, WA = '972549247257';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth <= 760; };
  var fine = matchMedia('(hover:hover) and (pointer:fine)');
  var TITLE = { he: 'אביעד גלס · משרד עורכי דין · חדלות פירעון · חיפה', en: 'Aviad Glass · Law Office · Insolvency · Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור אביעד גלס משרד עורכי דין · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Aviad Glass Law Office · This is not the business’s official website' };
  var HELLO = { he: 'שלום אביעד, הגעתי דרך האתר.', en: 'Hi Aviad, I found you through the website.' };
  var io = 'IntersectionObserver' in window;

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'אביעד גלס, משרד עורכי דין', 'Aviad Glass Law Office');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-callnav]', 'להתקשר לאביעד', 'Call Aviad');
    aria('[data-t-call]', 'להתקשר לאביעד, 054-924-7257', 'Call Aviad, 054-924-7257');
    aria('[data-t-wa]', 'וואטסאפ לאביעד', 'WhatsApp Aviad');
    aria('[data-t-prev]', 'השלב הקודם', 'Previous step');
    aria('[data-t-next]', 'השלב הבא', 'Next step');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: פלי״ם 2, חיפה' : 'Map: 2 Palyam St, Haifa'; });
    $$('[data-wa-hello]').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(HELLO[l]); });
    $$('[data-ph-he]').forEach(function (i) { i.placeholder = i.dataset[l === 'he' ? 'phHe' : 'phEn']; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ag-lang', l); } catch (e) {}
    splitTitle(); texts(l); hours(); compose(true); onScroll();
    $('.title').classList.add('lit');
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('ag-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    $('.title').classList.add('lit');
    resetStyles(); fog.init(); glints.kick(); onScroll();
  }); });
  motionUI();
  function resetStyles() {
    [$('[data-frost]'), $('[data-door]'), $('[data-area]'), $('[data-track]')].forEach(function (el) { if (el) el.removeAttribute('style'); });
    $$('.letter p').forEach(function (p) { p.style.removeProperty('--b'); });
    showStage(stageIdx, true);
  }

  // ---------------------------------------------------------------- hours, Haifa time. null = closed day
  var H = { 0: [8.5, 20.5], 1: [8.5, 20.5], 2: [8.5, 20.5], 3: [8.5, 20.5], 4: [8.5, 20.5], 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function allDay(t) { return t && t[0] === 0 && t[1] === 24; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (allDay(t)) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב־' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב־' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב־' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span><span>' + txt + '</span>'; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = allDay(t) ? (l ? '24 שעות' : '24 hours') : t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances, staggered inside each section
  $$('section').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', i * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline: letters set dim, then filled as they lock
  var titleSrc = $$('.title .ln > span[lang]').map(function (sp) { return sp.innerHTML; });
  function splitTitle() {
    var i = 0;
    $$('.title .ln > span[lang]').forEach(function (sp, k) {
      sp.innerHTML = titleSrc[k];
      if (sp.lang !== root.lang) return;
      var target = sp.querySelector('em') || sp;
      target.innerHTML = target.textContent.split(' ').map(function (w) {
        return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  }

  // ---------------------------------------------------------------- odometer figures
  function roll(el) {
    var to = parseFloat(el.dataset.odo), dec = (el.dataset.odo.split('.')[1] || '').length;
    if (still()) { el.textContent = el.dataset.odo; return; }
    var t0 = performance.now(), D = 1300;
    (function f(t) { var k = smooth((t - t0) / D); el.textContent = (to * k).toFixed(dec); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  if (io) { var oio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { $$('[data-odo]', e.target.closest('[data-odo-wrap],h2') || e.target).forEach(roll); oio.unobserve(e.target); } }); }, { threshold: .6 });
    $$('[data-odo-wrap],#rev-h').forEach(function (el) { oio.observe(el); }); }

  // ---------------------------------------------------------------- the frosted glass over his portrait: wipe it with a hand
  var fog = (function () {
    var cv = $('[data-fog]'), ctx = cv.getContext('2d'), img = new Image(), ready = false, last = null, W = 0, Hh = 0, dpr = 1;
    img.src = 'img/aviad-fog.webp';
    function cover(iw, ih) { var s = Math.max(W / iw, Hh / ih), w = iw * s, h = ih * s; return [(W - w) / 2, (Hh - h) * .22, w, h]; }
    function paint() {
      if (!ready || still()) return;
      var r = cv.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
      W = r.width; Hh = r.height; if (!W || !Hh) return;
      cv.width = W * dpr; cv.height = Hh * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      var c = cover(img.naturalWidth, img.naturalHeight); ctx.drawImage(img, c[0], c[1], c[2], c[3]);
      ctx.fillStyle = 'rgba(150,182,178,.22)'; ctx.fillRect(0, 0, W, Hh);
      // condensation: fine beads scattered over the pane
      for (var i = 0; i < 260; i++) { var x = Math.random() * W, y = Math.random() * Hh, rr = Math.random() * 1.6 + .3; ctx.fillStyle = 'rgba(255,255,255,' + (Math.random() * .25 + .08) + ')'; ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.3); ctx.fill(); }
    }
    function wipe(x, y, rad) {
      ctx.globalCompositeOperation = 'destination-out';
      var steps = last ? Math.max(1, Math.ceil(Math.hypot(x - last[0], y - last[1]) / 6)) : 1;
      for (var s = 1; s <= steps; s++) {
        var px = last ? last[0] + (x - last[0]) * s / steps : x, py = last ? last[1] + (y - last[1]) * s / steps : y;
        var g = ctx.createRadialGradient(px, py, rad * .35, px, py, rad); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, rad, 0, 6.3); ctx.fill();
      }
      last = [x, y];
    }
    // a hand's sweep across the glass, first over his face, so the portrait shows within the first second
    function sweep(delay) {
      var pts = [[.42, .2], [.62, .24], [.38, .32], [.66, .36], [.28, .44], [.78, .48], [.3, .58], [.75, .64], [.45, .74], [.6, .14]];
      var t0 = performance.now() + (delay || 0), D = 1300; last = null;
      (function f(t) {
        if (still()) return;
        var k = (t - t0) / D; if (k < 0) { requestAnimationFrame(f); return; }
        k = clamp(k, 0, 1); var e = 1 - Math.pow(1 - k, 2), seg = e * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(seg)), u = seg - i;
        var x = (pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u) * W, y = (pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u) * Hh;
        wipe(x, y, Math.max(W, Hh) * .15);
        if (k < 1) requestAnimationFrame(f); else last = null;
      })(performance.now());
    }
    function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    cv.addEventListener('pointermove', function (e) { if (still()) return; var p = pos(e); wipe(p[0], p[1], Math.max(36, W * .09)); });
    cv.addEventListener('pointerleave', function () { last = null; });
    cv.addEventListener('pointerup', function () { last = null; });
    cv.addEventListener('pointerdown', function (e) { last = null; var p = pos(e); wipe(p[0], p[1], Math.max(36, W * .09)); });
    var started = false;
    function init(delay) { if (!ready || still()) return; paint(); sweep(delay || 0); started = true; }
    img.onload = function () { ready = true; if (dealDone || dealLanding) init(dealLanding && !dealDone ? 600 : 100); };
    return { init: init, paint: paint };
  })();

  // ---------------------------------------------------------------- the opening deal
  var dealDone = false, dealLanding = false, fogStarted = false, deal = $('[data-deal]');
  function endDeal() {
    if (dealDone) return; dealDone = true;
    deal.classList.add('done'); setTimeout(function () { deal.style.display = 'none'; }, 500);
    $('.title').classList.add('lit'); if (!fogStarted) fog.init(100);
  }
  function runDeal() {
    if (still() || !deal.animate || scrollY > 50) { deal.style.display = 'none'; dealDone = true; $('.title').classList.add('lit'); fog.init(); return; }
    deal.classList.add('run');
    var cards = $$('.dc', deal), mark = $('.deal-mark i', deal), E = 'cubic-bezier(.23,1,.32,1)';
    mark.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 900, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
    cards.forEach(function (c, i) {
      c.animate([{ opacity: 0, transform: 'translate(' + c.style.getPropertyValue('--x') + ',60vh) rotate(' + c.style.getPropertyValue('--r') + ')' },
        { opacity: 1, transform: 'translate(' + c.style.getPropertyValue('--x') + ',0) rotate(' + c.style.getPropertyValue('--r') + ')' }],
        { duration: 620, delay: 80 + i * 130, easing: E, fill: 'forwards' });
    });
    var last = cards[cards.length - 1], pane = $('.pane');
    setTimeout(function () {
      var a = last.getBoundingClientRect(), b = pane.getBoundingClientRect();
      var dx = (b.left + b.width / 2) - (a.left + a.width / 2), dy = (b.top + b.height / 2) - (a.top + a.height / 2);
      var s = Math.max(b.width / a.width, b.height / a.height);
      cards.slice(0, -1).forEach(function (c) { c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }); });
      $('.deal-mark', deal).animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: 'forwards' });
      last.animate([{ transform: getComputedStyle(last).transform, borderRadius: '14px' },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')', borderRadius: '2px' }], { duration: 650, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
      deal.animate([{ backgroundColor: 'rgba(14,19,22,1)' }, { backgroundColor: 'rgba(14,19,22,0)' }], { duration: 650, easing: 'ease-out', fill: 'forwards' });
      dealLanding = true; fogStarted = true; fog.init(620);
      setTimeout(endDeal, 640);
    }, 1050);
    deal.addEventListener('click', endDeal);
    setTimeout(endDeal, 2600);
  }

  // ---------------------------------------------------------------- the process stage: four photos behind office glass
  var proc = $('[data-process]'), steps = $$('[data-step]'), photos = $$('.photos img'), frost = $('[data-frost]'), door = $('[data-door]'), stageIdx = 0;
  function showStage(i, hard) {
    stageIdx = i;
    steps.forEach(function (s, k) { s.classList.toggle('on', k === i); });
    photos.forEach(function (p, k) { p.classList.toggle('on', k === i); if (hard) p.style.opacity = ''; });
  }
  showStage(0);
  function goto(i) {
    i = clamp(i, 0, 3);
    if (still()) { showStage(i); return; }
    var top = proc.getBoundingClientRect().top + scrollY, len = proc.offsetHeight - innerHeight;
    scrollTo({ top: top + len * ((i + .55) / 4), behavior: 'smooth' });
  }
  steps.forEach(function (s, k) { $('button', s).addEventListener('click', function () { goto(k); }); });
  $('[data-prev]').addEventListener('click', function () { showStage(clamp(stageIdx - 1, 0, 3)); });
  $('[data-next]').addEventListener('click', function () { showStage(clamp(stageIdx + 1, 0, 3)); });
  function processScroll() {
    if (still()) return;
    var r = proc.getBoundingClientRect(), len = proc.offsetHeight - innerHeight;
    var p = clamp(-r.top / len, 0, 1) * 4, i = Math.min(3, Math.floor(p)), u = p - i;
    // within a step: the frost is pulled down off the glass (0.12 → 0.62 of the step)
    var c = smooth((u - .1) / .5) * 104;
    // the next frosted door slides across (0.70 → 1.0 of this step, then off in 0 → 0.12 of the next)
    var dx;
    if (i < 3 && u > .7) dx = -104 + smooth((u - .7) / .3) * 104;           // closing over the photo
    else if (i > 0 && u < .12) dx = smooth(u / .12) * 104;                 // opening the other way
    else dx = -104;
    if (root.dir === 'rtl') dx = -dx;
    door.style.setProperty('--dx', dx + '%');
    // the photo swaps only while the door covers the whole pane; the frost resets with it
    var shown = i, covered = false;
    if (i < 3 && u > .985) { shown = i + 1; covered = true; }
    if (i > 0 && u < .015) covered = true;
    if (shown !== stageIdx) showStage(shown);
    if (i < 3 && u > .7) c = 104;                                             // already clear when the door arrives
    if (covered || (i > 0 && u < .12)) c = 0;                                 // new photo arrives fogged
    if (i === 0 && u < .1) c = 0;
    frost.style.setProperty('--c', c + '%');
    frost.style.setProperty('--bo', c > 2 && c < 100 ? 1 : 0);
    steps.forEach(function (s, k) { s.classList.toggle('on', k === shown); });
  }

  // ---------------------------------------------------------------- glints of glass gather into the diamond of his logo
  var glints = (function () {
    var sec = $('[data-area]'), cv = $('[data-glints]'), ctx = cv.getContext('2d'), N = 220, P = [], W = 0, Hh = 0, dpr = 1, raf = 0, vis = false, mx = -999, my = -999, prog = 0;
    function build() {
      var r = sec.getBoundingClientRect(); W = r.width; Hh = r.height; dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = W * dpr; cv.height = Hh * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var cx = W / 2, cy = Hh / 2, R = Math.min(W, Hh) * (phone() ? .44 : .4);
      P = [];
      for (var i = 0; i < N; i++) {
        // two concentric diamonds, like the double frame of the AG mark
        var ring = i % 3 === 0 ? .82 : 1, t = Math.random() * 4, side = Math.floor(t), f = t - side;
        var corners = [[0, -1], [1, 0], [0, 1], [-1, 0], [0, -1]];
        var tx = cx + (corners[side][0] + (corners[side + 1][0] - corners[side][0]) * f) * R * ring;
        var ty = cy + (corners[side][1] + (corners[side + 1][1] - corners[side][1]) * f) * R * ring;
        P.push({ sx: Math.random() * W, sy: Math.random() * Hh, tx: tx, ty: ty, x: 0, y: 0, d: Math.random() * .35, s: Math.random() * 2.2 + .8, ph: Math.random() * 6.28, a: Math.random() * 6.28, ox: 0, oy: 0 });
      }
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, Hh);
      var T = t / 1000;
      for (var i = 0; i < P.length; i++) {
        var p = P[i], k = smooth((prog - p.d) / (1 - .35)), dr = (1 - k) * 18;
        var x = p.sx + (p.tx - p.sx) * k + Math.sin(T * .6 + p.ph) * dr, y = p.sy + (p.ty - p.sy) * k + Math.cos(T * .5 + p.ph) * dr;
        var dx = x - mx, dy = y - my, dd = dx * dx + dy * dy;
        if (dd < 12000) { var f = (1 - dd / 12000) * 26, l = Math.sqrt(dd) || 1; p.ox += dx / l * f * .12; p.oy += dy / l * f * .12; }
        p.ox *= .92; p.oy *= .92; x += p.ox; y += p.oy;
        var tw = .45 + .55 * Math.max(0, Math.sin(T * 1.7 + p.ph)), s = p.s;
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4 + p.a * (1 - k));
        ctx.fillStyle = 'rgba(' + (i % 4 ? '228,234,255,' : '169,216,204,') + (.25 + .6 * tw * (.5 + k * .5)) + ')';
        ctx.fillRect(-s, -s, s * 2, s * 2); ctx.restore();
      }
    }
    function frame(t) { raf = 0; if (!vis) return; draw(t); if (!still()) raf = requestAnimationFrame(frame); }
    function kick() { if (still()) { prog = 1; draw(0); return; } if (!raf && vis) raf = requestAnimationFrame(frame); }
    sec.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    sec.addEventListener('pointerleave', function () { mx = my = -999; });
    if (io) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; kick(); }).observe(sec); else { vis = true; }
    return { build: build, kick: kick, set: function (p) { prog = p; } };
  })();

  // ---------------------------------------------------------------- the yellow pad composes the WhatsApp note
  var pad = $('[data-pad]'), out = $('[data-out]'), send = $('[data-send]'), typed = '', typeT = 0;
  var LINES = {
    he: ['אשמח לקבוע פגישת היכרות.', 'יש לי שאלה על חדלות פירעון.', 'ההליך שלי כבר פתוח, ויש לי שאלה.'],
    en: ['I’d like to set up an introductory meeting.', 'I have a question about insolvency.', 'My proceedings are already open, and I have a question.']
  };
  function message() {
    var l = root.lang, k = +(pad.querySelector('input[name=topic]:checked') || { value: 0 }).value, n = pad.elements.name.value.trim();
    var m = (l === 'he' ? 'שלום אביעד, הגעתי דרך האתר. ' : 'Hi Aviad, I found you through the website. ') + LINES[l][k];
    if (n) m += l === 'he' ? ' קוראים לי ' + n + '.' : ' My name is ' + n + '.';
    return m;
  }
  function compose(instant) {
    var m = message(); send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    clearTimeout(typeT);
    if (instant || still()) { typed = m; out.textContent = m; return; }
    var keep = 0; while (keep < typed.length && keep < m.length && typed[keep] === m[keep]) keep++;
    typed = typed.slice(0, keep);
    (function step() { if (typed.length < m.length) { typed = m.slice(0, typed.length + 2); out.textContent = typed; typeT = setTimeout(step, 18); } else out.textContent = m; })();
  }
  pad.addEventListener('input', function () { compose(false); });
  pad.addEventListener('submit', function (e) { e.preventDefault(); window.open(send.href, '_blank', 'noopener'); });

  // ---------------------------------------------------------------- scroll-linked layers
  var hero = $('[data-hero]'), nav = $('[data-nav]'), strip = $('.strip img'), area = $('[data-area]'), track = $('[data-track]'), row = $('[data-row]'),
    letterPs = $$('.letter p'), mini = $('[data-minicard]'), foot = $('.foot'), footLogo = $('.foot-logo'), seal = $('[data-seal]'), room = $('[data-room]'), bcard = $('[data-bcard]');
  function heroTop() { hero.style.top = phone() ? '' : Math.min(0, innerHeight - hero.offsetHeight) + 'px'; }
  function onScroll() {
    var y = scrollY, vh = innerHeight;
    nav.classList.toggle('pill', y > 40);
    var mb = $('main').getBoundingClientRect().bottom;
    mini.classList.toggle('show', y > vh * .7 && mb > vh - 20);
    if (still()) return;
    // hero: the photo strip pushes in as the next card rides up over it
    var hr = hero.getBoundingClientRect();
    if (strip) strip.style.setProperty('--sp', clamp(-hr.top / vh, 0, 1).toFixed(3));
    processScroll();
    // colour page floods up from below as it arrives
    var ar = area.getBoundingClientRect(), ap = clamp(1 - ar.top / vh, 0, 1);
    area.style.setProperty('--ci', ((1 - smooth(ap / .7)) * 30).toFixed(2) + '%');
    glints.set(clamp((vh - ar.top) / (vh * 1.05), 0, 1) - clamp((-ar.top - ar.height * .55) / (vh * .6), 0, 1) * .9);
    if (seal) seal.style.setProperty('--so', smooth((vh * .9 - ar.top) / (vh * .6)).toFixed(3));
    // the letter clears out of the fog paragraph by paragraph
    letterPs.forEach(function (p) { var b = p.getBoundingClientRect(); var k = clamp((b.top - vh * .45) / (vh * .4), 0, 1); p.style.setProperty('--b', (k * 7).toFixed(2)); });
    // the row of glass panes drifts with the scroll, light sliding across them
    var rr = row.getBoundingClientRect(), rp = clamp((vh - rr.top) / (vh + rr.height), 0, 1), over = Math.max(0, track.scrollWidth - row.clientWidth + 40);
    var tx = (rp - .5) * -Math.max(over, 220); if (root.dir === 'rtl') tx = -tx;
    track.style.setProperty('--tx', tx.toFixed(1) + 'px');
    track.style.setProperty('--gl', (-50 + rp * 200).toFixed(1) + '%');
    $$('.glasscard', track).forEach(function (g) { g.style.setProperty('--gl', (-50 + rp * 200).toFixed(1) + '%'); });
    // footer curtain: the logo rises into place
    var fh = foot.offsetHeight; footLogo.style.setProperty('--fu', clamp((mb - (vh - fh)) / fh, 0, 1).toFixed(3));
    // phones: the light in the room and the card's tilt follow the scroll
    if (!fine.matches) {
      var rm = room.getBoundingClientRect(), q = clamp((vh - rm.top) / (vh + rm.height), 0, 1);
      room.style.setProperty('--sx', (20 + q * 65) + '%'); room.style.setProperty('--sy', (40 + Math.sin(q * 3.1) * 25) + '%');
      var bc = bcard.getBoundingClientRect(), bq = clamp((vh - bc.top) / (vh + bc.height), 0, 1) - .5;
      bcard.style.setProperty('--ry', (bq * -16).toFixed(2) + 'deg'); bcard.style.setProperty('--rx', (bq * 10).toFixed(2) + 'deg'); bcard.style.setProperty('--sh', (-60 + (bq + .5) * 160) + '%');
    }
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; onScroll(); }); } }, { passive: true });

  // desktop: a lamp's light follows the hand around his waiting room; the card leans toward it
  room.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse' || still()) return; var r = room.getBoundingClientRect(); room.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); room.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); });
  var tile = $('.cardtile');
  tile.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse' || still()) return; var r = tile.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; bcard.style.setProperty('--rx', (x * 18).toFixed(2) + 'deg'); bcard.style.setProperty('--ry', (y * -14).toFixed(2) + 'deg'); bcard.style.setProperty('--sh', (-60 + (x + .5) * 160) + '%'); });
  tile.addEventListener('pointerleave', function () { bcard.style.setProperty('--rx', '0deg'); bcard.style.setProperty('--ry', '0deg'); });
  // hero glow drifts toward the hand, and the portrait answers with a little parallax
  hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse' || still()) return; var x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5; hero.style.setProperty('--lx', (x * 60) + 'px'); hero.style.setProperty('--ly', (y * 40) + 'px'); var s = $('.pane .sharp'); s.style.setProperty('--px', (x * -14) + 'px'); s.style.setProperty('--py', (y * -10) + 'px'); });

  var rT = 0, lastW = innerWidth;
  addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { heroTop(); glints.build(); glints.kick(); if (innerWidth !== lastW) { lastW = innerWidth; fog.paint(); } onScroll(); }, 150); });

  // ---------------------------------------------------------------- go
  splitTitle(); texts(root.lang); hours(); compose(true); heroTop(); glints.build(); onScroll();
  if (still()) { $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); }); }
  runDeal();
  window.__ag = { ready: true, setLang: setLang };
})();
