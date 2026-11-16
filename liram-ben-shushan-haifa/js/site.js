(function () {
  var root = document.documentElement, WA = '972548360366';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'לירם בן שושן · מעצב שיער · ארתור הנטקה 64, חיפה', en: 'Liram Ben Shushan · Hair designer · 64 Arthur Hantke St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור לירם בן שושן · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Liram Ben Shushan · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'לירם בן שושן, מעצב שיער', 'Liram Ben Shushan, hair designer');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-wa]', 'וואטסאפ ללירם', 'WhatsApp Liram');
    aria('[data-t-call]', 'התקשרו ללירם, 054-836-0366', 'Call Liram, 054-836-0366');
    $('[data-t-map]').title = l === 'he' ? 'מפה: ארתור הנטקה 64, חיפה' : 'Map: 64 Arthur Hantke St, Haifa';
    $$('[data-decode]').forEach(function (f) { f.textContent = f.dataset[l]; f._done = false; });
    $('[data-hero-wa]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(l === 'he' ? 'היי לירם, אשמח לקבוע תור' : 'Hi Liram, I’d like to book an appointment');
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('lbs-lang', l); } catch (e) {}
    texts(l); hours(); days(); write(true); splitName(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('lbs-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-q]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-odo]').forEach(function (o) { roll(o, true); });
    $('[data-fname]').classList.add('lit');
    layout(); snips.kick(); facets.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 18.5], 1: null, 2: [9, 18.5], 3: [9, 18.5], 4: [9, 18.5], 5: [9, 13], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
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
      var t = H[r[0]], ds = [], k; for (k = r[0]; k <= r[1]; k++) ds.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + ds.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); });
  $$('[data-q]').forEach(function (q, i) { q.style.setProperty('--d', (i % 2) * 120 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-q]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- tilt toward the hand (mirrors, quotes) and the bento spotlight
  function tilt(el, target, k) {
    if (!fine) return;
    el.addEventListener('pointermove', function (e) { if (still()) return; var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; target.style.setProperty('--ry', (x * k).toFixed(2) + 'deg'); target.style.setProperty('--rx', (-y * k).toFixed(2) + 'deg'); });
    el.addEventListener('pointerleave', function () { target.style.setProperty('--ry', '0deg'); target.style.setProperty('--rx', '0deg'); });
  }
  $$('.fr').forEach(function (f) { tilt(f, $('.glass', f), 12); });
  $$('[data-q]').forEach(function (q) { tilt(q, q, 5); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- hero: the photo cut along the wall's own lines; facets settle, lean with the hand, part on scroll
  var facets = (function () {
    var fcs = $$('.fc'), raf = 0, vis = true, t0 = 0, mx = 0, my = 0, cx = 0, cy = 0;
    // each facet arrives from its own direction and has its own depth
    var A = [[-60, -40, -4], [10, -70, 3], [70, -30, 5], [-80, 40, 3], [60, 30, -4], [20, 80, -3]], D = [10, 6, 12, 8, 14, 9];
    function frame(t) {
      raf = 0;
      if (still()) { fcs.forEach(function (f) { f.style.transform = ''; f.style.opacity = ''; }); return; }
      if (!t0) t0 = t;
      var e = 1, done = true;
      cx += (mx - cx) * .08; cy += (my - cy) * .08;
      var hr = hero.getBoundingClientRect(), part = clamp(-hr.top / Math.max(1, hr.height), 0, 1);
      fcs.forEach(function (f, i) {
        var k = smooth((t - t0 - 120 - i * 90) / 1000); if (k < 1) done = false;
        var a = A[i], u = 1 - k, s = part * .55;
        var x = a[0] * u + a[0] * s + cx * D[i], y = a[1] * u + a[1] * s + cy * D[i], r = a[2] * u + a[2] * s * .5;
        f.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + r.toFixed(2) + 'deg) scale(' + (1 + u * .04).toFixed(3) + ')';
        f.style.opacity = Math.min(1, k * 1.6).toFixed(3);
      });
      if (vis && (!done || Math.abs(mx - cx) > .002 || Math.abs(my - cy) > .002)) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { if (!fine) return; var r = hero.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5; kick(); });
    hero.addEventListener('pointerleave', function () { mx = my = 0; kick(); });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { kick: kick, start: function () { t0 = 0; kick(); } };
  })();

  // ---------------------------------------------------------------- snips of cut hair drifting down through the light, pushed aside by the hand
  var snips = (function () {
    var cv = $('[data-snips]'), c = cv.getContext('2d'), S = [], w, h, raf = 0, vis = true, px = -999, py = -999;
    function one(top) {
      return { x: Math.random() * w, y: top ? -20 - Math.random() * h * .3 : Math.random() * h, len: 7 + Math.random() * 12, bend: (Math.random() - .5) * 8, a: Math.random() * 6.28,
        va: (Math.random() - .5) * .03, vy: .25 + Math.random() * .45, sw: Math.random() * 6.28, vx: 0,
        col: Math.random() < .22 ? 'rgba(234,210,154,' : Math.random() < .5 ? 'rgba(52,40,34,' : 'rgba(28,24,26,', al: .55 + Math.random() * .4 };
    }
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 26 : 46; S = []; for (var i = 0; i < n; i++) S.push(one(false));
    }
    function frame() {
      raf = 0; if (still() || !vis) return;
      c.clearRect(0, 0, w, h); c.lineCap = 'round';
      for (var i = 0; i < S.length; i++) {
        var s = S[i]; s.sw += .02;
        var dx = s.x - px, dy = s.y - py, d2 = dx * dx + dy * dy;
        if (d2 < 9000) { var f = (9000 - d2) / 9000; s.vx += dx / Math.sqrt(d2 + 1) * f * 1.4; s.va += (Math.random() - .5) * .04 * f; }
        s.vx *= .94; s.x += Math.sin(s.sw) * .35 + s.vx; s.y += s.vy; s.a += s.va + Math.sin(s.sw) * .004;
        if (s.y > h + 20 || s.x < -30 || s.x > w + 30) S[i] = one(true);
        var cs = Math.cos(s.a) * s.len / 2, sn = Math.sin(s.a) * s.len / 2;
        c.strokeStyle = s.col + (s.al * clamp((h - s.y) / (h * .25), 0, 1)).toFixed(3) + ')';
        c.lineWidth = 1.3; c.beginPath(); c.moveTo(s.x - cs, s.y - sn);
        c.quadraticCurveTo(s.x - sn * s.bend / 8, s.y + cs * s.bend / 8, s.x + cs, s.y + sn); c.stroke();
      }
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still() && vis) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { px = py = -999; });
    hero.addEventListener('pointerdown', function (e) { var r = hero.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; setTimeout(function () { px = py = -999; }, 500); });
    watch(hero, function (v) { vis = v; kick(); });
    return { size: size, kick: kick };
  })();

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
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { setTimeout(function () { roll(o, true); }, 300); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- frame captions decode out of scrambled letters
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' };
  function decode(f) {
    if (f._done) return; f._done = true;
    var l = he() ? 'he' : 'en', txt = f.dataset[l];
    if (still()) { f.textContent = txt; return; }
    var t0 = performance.now();
    (function st(t) {
      var k = (t - t0) / 700, n = Math.floor(k * txt.length), out = '';
      for (var i = 0; i < txt.length; i++) out += i < n || txt[i] === ' ' ? txt[i] : GL[l][Math.floor(Math.random() * GL[l].length)];
      f.textContent = out; if (k < 1) requestAnimationFrame(st); else f.textContent = txt;
    })(t0);
  }

  // ---------------------------------------------------------------- salon: the run of mirrors is carried sideways by the scroll
  var salon = $('[data-salon]'), stage = $('[data-sstage]'), view = $('[data-sview]'), track = $('[data-strack]'), sbar = $('[data-sbar]'), frs = $$('.fr'), run = 0, cutline = $('[data-cutline]');
  function salonSize() {
    track.style.transform = '';
    if (still()) { salon.style.removeProperty('--sh'); run = 0; return; }
    run = Math.max(0, track.scrollWidth - view.clientWidth);
    salon.style.setProperty('--sh', (innerHeight + run * .8) + 'px');
  }

  // ---------------------------------------------------------------- book: the message written in gold on the sign
  var what = $$('[data-what] button'), when = $$('[data-when] button'), dayBox = $('[data-days]'), msgEl = $('[data-msg]'), plate = $('[data-plate]'), send = $('[data-send]');
  var pick = { what: 'cut', day: -1, when: '' }, shown = '', typing = 0, seen = false;
  function days() {
    var l = he();
    dayBox.innerHTML = [0, 1, 2, 3, 4, 5, 6].map(function (d) {
      var closed = !H[d];
      return '<button type="button" role="radio" aria-checked="' + (pick.day === d) + '" data-d="' + d + '"' + (closed ? ' disabled' : '') + '>' + (l ? dayHe[d] : dayEn[d].slice(0, 3)) + '<small>' + (closed ? (l ? 'סגור' : 'closed') : '<span dir="ltr">' + hhmm(H[d][0]) + '–' + hhmm(H[d][1]) + '</span>') + '</small></button>';
    }).join('');
    $$('button', dayBox).forEach(function (b) { b.addEventListener('click', function () { pick.day = +b.dataset.d; days(); limit(); write(); }); });
  }
  // the time-of-day options follow the day's hours: Friday is a morning only
  function limit() {
    var t = pick.day >= 0 ? H[pick.day] : null;
    when.forEach(function (b) {
      var v = b.dataset.v, ok = !t || (v === 'am' ? t[0] < 12 : v === 'noon' ? t[1] > 12.5 : t[1] > 15.5);
      b.disabled = !ok; if (!ok && pick.when === v) pick.when = '';
    });
    radios(when, pick.when);
  }
  function radios(list, v) { list.forEach(function (b) { b.setAttribute('aria-checked', b.dataset.v === v ? 'true' : 'false'); }); }
  what.forEach(function (b) { b.addEventListener('click', function () { pick.what = b.dataset.v; radios(what, pick.what); write(); }); });
  when.forEach(function (b) { b.addEventListener('click', function () { pick.when = pick.when === b.dataset.v ? '' : b.dataset.v; radios(when, pick.when); write(); }); });
  function compose() {
    var l = he(), w = what.filter(function (b) { return b.dataset.v === pick.what; })[0];
    var tm = when.filter(function (b) { return b.dataset.v === pick.when; })[0];
    if (l) {
      var day = pick.day >= 0 ? ' ביום ' + dayHe[pick.day] : '', t = tm ? ' ' + tm.dataset.he : '';
      if (pick.what === 'ask') return 'היי לירם, יש לי שאלה' + (day || t ? ' (אפשר לדבר' + day + t + ')' : '') + ':';
      return 'היי לירם, אשמח לקבוע תור ל' + w.dataset.he + day + t + '. תודה!';
    }
    var dE = pick.day >= 0 ? ' on ' + dayEn[pick.day] : '', tE = tm ? (dE ? ' ' : ' in the ') + tm.dataset.en : '';
    if (pick.what === 'ask') return 'Hi Liram, I have a question' + (dE || tE ? ' (I can talk' + dE + tE + ')' : '') + ':';
    return 'Hi Liram, I’d like to book ' + w.dataset.en + dE + tE + '. Thanks!';
  }
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !seen) { shown = target; msgEl.textContent = target; plate.classList.remove('typing'); return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    plate.classList.add('typing');
    (function st(t) {
      var n = Math.floor((t - t0) / 22);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st); else plate.classList.remove('typing');
    })(t0);
  }
  watch(plate, function (v) { if (v && !seen) { seen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .45 });

  // ---------------------------------------------------------------- footer: the sign's letters, fitted to the plate and lit one by one
  var fname = $('[data-fname]');
  function splitName() {
    $$('span[lang]', fname).forEach(function (sp) {
      var t = sp.textContent; sp.setAttribute('aria-label', t);
      sp.innerHTML = t.split('').map(function (c, i) { return '<span class="ch" aria-hidden="true" style="--i:' + i + '">' + (c === ' ' ? '&nbsp;' : c) + '</span>'; }).join('');
    });
    fitName();
  }
  function fitName() {
    var sp = $('span[lang="' + root.lang + '"]', fname); if (!sp) return;
    fname.style.fontSize = '100px';
    var pe = fname.parentElement, cs = getComputedStyle(pe), avail = pe.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 24, s = Math.min(200, 100 * avail / Math.max(1, sp.offsetWidth));
    fname.style.fontSize = Math.max(34, s).toFixed(1) + 'px';
  }
  watch(fname, function (v) { if (v) fname.classList.add('lit'); }, { threshold: .6 });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var swirl = $('[data-swirl]'), swirlPath = $('[data-swirl] svg'), plateSwirl = $('.p-swirl'), room = $('[data-room]'), leaves = $('.door');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) facets.kick();
    // the cut: a gold blade line drawn along the diagonal as the salon rises over the hero
    var sr = salon.getBoundingClientRect();
    cutline.style.setProperty('--draw', calm ? 0 : (1 - smooth((vh - sr.top) / (vh * .55))).toFixed(3));
    // the mirrors travel sideways while the stage is pinned
    var p = calm || !run ? 0 : clamp(-sr.top / Math.max(1, sr.height - vh), 0, 1);
    if (!calm) track.style.transform = 'translate3d(' + ((rtl() ? 1 : -1) * p * run).toFixed(1) + 'px,0,0)';
    sbar.style.setProperty('--p', p.toFixed(3));
    var mid = innerWidth / 2;
    frs.forEach(function (f) {
      var r = f.getBoundingClientRect(), near = r.left < innerWidth * .85 && r.right > innerWidth * .15 && sr.top < vh * .6;
      if (near) { f.classList.add('lit'); var cap = $('[data-decode]', f); if (cap) decode(cap); }
      else if (Math.abs(r.left + r.width / 2 - mid) > innerWidth) f.classList.remove('lit');
    });
    // the swirl from the door glass draws itself across the seam, and undraws on the way back
    var wr = swirl.getBoundingClientRect();
    swirlPath.style.setProperty('--draw', calm ? 0 : (1 - smooth((vh - wr.top) / (vh * .7))).toFixed(3));
    var pr = plateSwirl.getBoundingClientRect();
    plateSwirl.style.setProperty('--draw', calm ? 0 : (1 - smooth((vh - pr.top) / (vh * .5))).toFixed(3));
    // the glass door slides open as the visit section comes up
    var rr = room.getBoundingClientRect(), o = calm ? 1 : smooth((vh * .82 - rr.top) / (vh * .55));
    leaves.style.setProperty('--open', o.toFixed(3));
    $$('.leaf svg', leaves).forEach(function (s) { s.style.setProperty('--draw', calm ? 0 : (1 - smooth((vh - rr.top) / (vh * .35))).toFixed(3)); });
  }

  function layout() { snips.size(); salonSize(); fitName(); tick(); }
  var rz, lastW = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (innerWidth !== lastW || !phone()) { lastW = innerWidth; layout(); } }, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); days(); limit(); write(true); splitName(); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); facets.start(); snips.kick(); fitName(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { layout(); });
})();
