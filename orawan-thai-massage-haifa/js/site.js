(function () {
  var root = document.documentElement, WA = '972526919902';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var desk = function () { return innerWidth > 980; };
  var NS = 'http://www.w3.org/2000/svg';
  var TITLE = { he: "אורוואן · עיסוי תאילנדי לנשים בלבד · ח'ורי 1, חיפה", en: 'Orawan · Thai massage, women only · 1 Khouri St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור אורוואן עיסוי לנשים בלבד · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Orawan Thai Massage, women only · This is not the business’s official website' };

  // ------------------------------------------------ language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'אורוואן עיסוי תאילנדי', 'Orawan Thai Massage');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-areas]', 'איפה', 'Where');
    aria('[data-t-arc]', 'תמונות מהקליניקה, גררי או השתמשי בחיצים', 'Photos from the clinic, drag or use the arrow keys');
    aria('[data-t-pressure]', 'עוצמת מגע', 'Pressure');
    aria('[data-t-call]', 'התקשרי לאורוואן, 052-691-9902', 'Call Orawan, 052-691-9902');
    aria('[data-t-wa]', 'וואטסאפ לאורוואן', 'WhatsApp Orawan');
    $$('.spot').forEach(function (s) { s.setAttribute('aria-label', s.dataset[l]); $('.tag', s).textContent = s.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('or-lang', l); } catch (e) {}
    texts(l); hours(); status(); days(); compose(true); words(); fit(); arc.layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ------------------------------------------------ motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('or-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    if (on) { petals.start(); curtainIntro(); } else petals.stop();
    frame(); compose(true);
  }); });
  motionUI();

  // ------------------------------------------------ hours and live status (Haifa time). null = closed
  var H = { 0: [9, 19.5], 1: [9, 19.5], 2: [9, 19.5], 3: [9, 19.5], 4: [9, 19.5], 5: [9, 15], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
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
      var t = H[r[0]], ds = [], k; for (k = r[0]; k <= r[1]; k++) ds.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      return '<tr data-days="' + ds.join(',') + '"><td>' + name + '</td><td>' + (t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed')) + '</td></tr>';
    }).join('');
  }

  // ------------------------------------------------ composer: petals for where, stones for pressure, a day; the WhatsApp writes itself
  var picked = [], pressure = 2, typer = 0;
  var AREA = { head: ['הראש', 'head'], neck: ['הצוואר', 'neck'], shoulders: ['הכתפיים', 'shoulders'], back: ['הגב', 'back'], legs: ['הרגליים', 'legs'], feet: ['כפות הרגליים', 'feet'] };
  var PRESS = { 1: ['עדין', 'gentle'], 2: ['בינוני', 'medium'], 3: ['חזק', 'firm'] };
  function list(a, l) { if (a.length < 2) return a.join(''); return a.slice(0, -1).join(', ') + (l ? ' ו' : ' and ') + a[a.length - 1]; }
  function days() {
    var sel = $('[data-day]'), v = sel.value, l = he();
    var o = '<option value="">' + (l ? 'לא משנה לי' : 'Any day') + '</option>';
    for (var d = 0; d < 7; d++) if (H[d]) o += '<option value="' + d + '">' + (l ? 'יום ' + dayHe[d] : dayEn[d]) + ' · ' + hhmm(H[d][0]) + '–' + hhmm(H[d][1]) + '</option>';
    sel.innerHTML = o; sel.value = v;
    sel.setAttribute('aria-label', l ? 'יום שנוח לי' : 'A day that suits me');
  }
  function message() {
    var l = he(), i = l ? 0 : 1, a = picked.map(function (k) { return AREA[k][i]; }), d = $('[data-day]').value;
    if (l) return 'שלום אורוואן, אשמח לקבוע עיסוי.' + (a.length ? ' הכי תפוס לי ' + list(a, true) + '.' : '') + ' אני אוהבת מגע ' + PRESS[pressure][0] + '.' + (d ? ' נוח לי ביום ' + dayHe[d] + '.' : '') + ' תודה!';
    return 'Hi Orawan, I’d like to book a massage.' + (a.length ? ' My ' + list(a, false) + (a.length > 1 || a[0] === 'shoulders' || a[0] === 'legs' || a[0] === 'feet' ? ' feel' : ' feels') + ' tight.' : '') + ' I like ' + PRESS[pressure][1] + ' pressure.' + (d ? ' ' + dayEn[d] + ' would suit me.' : '') + ' Thank you!';
  }
  function compose(instant) {
    var m = message(), b = $('[data-bubble]');
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    cancelAnimationFrame(typer);
    if (instant || still()) { b.textContent = m; return; }
    var from = b.textContent, k = 0;
    while (k < from.length && from[k] === m[k]) k++;
    var t0 = performance.now(), start = k;
    (function step(t) { var n = Math.min(m.length, start + Math.floor((t - t0) / 18)); b.textContent = m.slice(0, n); if (n < m.length) typer = requestAnimationFrame(step); })(t0);
  }
  $$('[data-area]').forEach(function (b) { b.addEventListener('click', function () {
    var k = b.dataset.area, i = picked.indexOf(k);
    if (i < 0) picked.push(k); else picked.splice(i, 1);
    var order = Object.keys(AREA); picked.sort(function (x, y) { return order.indexOf(x) - order.indexOf(y); });
    b.setAttribute('aria-pressed', i < 0 ? 'true' : 'false'); compose();
  }); });
  $$('[data-stones] button').forEach(function (b) { b.addEventListener('click', function () {
    pressure = +b.dataset.p;
    $$('[data-stones] button').forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); compose();
  }); });
  $('[data-day]').addEventListener('change', function () { compose(); });
  // soft spotlight that follows the pointer on the tiles
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ------------------------------------------------ statement fills word by word with scroll
  var stmt = $('[data-fill]');
  function words() {
    $$('span[lang]', stmt).forEach(function (s) {
      if (s.dataset.split) return; s.dataset.split = 1;
      s.innerHTML = s.textContent.split(' ').map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
    });
  }

  // ------------------------------------------------ hero curtains: her own red curtains, drawn aside on arrival, fully open as you scroll
  var arch = $('[data-arch]'), heroOpen = 0, introT = 0;
  function curtainIntro() {
    if (still()) return;
    var t0 = performance.now(); cancelAnimationFrame(introT);
    (function step(t) { var k = clamp((t - t0 - 250) / 1700, 0, 1); heroOpen = .55 * (1 - Math.pow(1 - k, 3)); frame(); if (k < 1) introT = requestAnimationFrame(step); })(t0);
  }

  // ------------------------------------------------ petals: the lotus petals of her sign, drifting up; the pointer pushes them aside
  var petals = (function () {
    var cv = $('[data-petals]'), cx = cv.getContext('2d'), P = [], raf = 0, vis = true, w, h, dpr, mx = -999, my = -999;
    var cols = ['#eaa6ba', '#f4c9d4', '#e2b15c', '#d9819a'];
    function size() { dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; }
    function seed(p, top) { p.x = Math.random() * w; p.y = top ? Math.random() * h : h + 20; p.s = 5 + Math.random() * 9; p.vy = .25 + Math.random() * .5; p.a = Math.random() * 6.28; p.va = (Math.random() - .5) * .02; p.sw = Math.random() * 6.28; p.c = cols[(Math.random() * cols.length) | 0]; p.o = .35 + Math.random() * .5; p.dx = 0; return p; }
    function petal(p) {
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.globalAlpha = p.o; cx.fillStyle = p.c;
      var s = p.s; cx.beginPath(); cx.moveTo(0, -s); cx.bezierCurveTo(s * .62, -s * .5, s * .5, s * .6, 0, s * .9); cx.bezierCurveTo(-s * .5, s * .6, -s * .62, -s * .5, 0, -s); cx.fill(); cx.restore();
    }
    function tick() {
      cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, w, h);
      P.forEach(function (p) {
        p.sw += .012; p.y -= p.vy; p.a += p.va; p.x += Math.sin(p.sw) * .35 + p.dx; p.dx *= .94;
        var ddx = p.x - mx, ddy = p.y - my, d2 = ddx * ddx + ddy * ddy;
        if (d2 < 12000) { var f = (12000 - d2) / 12000; p.dx += (ddx > 0 ? 1 : -1) * f * 1.4; p.y -= f * 1.2; }
        if (p.y < -30 || p.x < -40 || p.x > w + 40) seed(p, false);
        petal(p);
      });
      raf = requestAnimationFrame(tick);
    }
    function start() { if (still() || raf || !vis) return; size(); if (!P.length) for (var i = 0; i < (w < 700 ? 26 : 46); i++) P.push(seed({}, true)); raf = requestAnimationFrame(tick); }
    function stop() { cancelAnimationFrame(raf); raf = 0; }
    var hero = $('.hero');
    hero.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; vis ? start() : stop(); }).observe(hero);
    addEventListener('resize', function () { if (raf) size(); });
    return { start: start, stop: stop };
  })();

  // ------------------------------------------------ the bloom: eight lotus petals open from the centre; together they become the room's photo
  var bloom = (function () {
    var sec = $('[data-bloom]'), svg = $('[data-bloom-svg]'), clip = $('[data-bloom-clip]'), outline = $('[data-bloom-outline]'), spots = $('[data-spots]'), N = 7, paths = [], lines = [], circ;
    var PET = 'M0,0 C34,-26 40,-92 0,-150 C-40,-92 -34,-26 0,0 Z';
    for (var i = 0; i < N * 2; i++) {
      var p = document.createElementNS(NS, 'path'); p.setAttribute('d', PET); clip.appendChild(p); paths.push(p);
      var o = document.createElementNS(NS, 'path'); o.setAttribute('d', PET); o.setAttribute('fill', 'none'); o.setAttribute('stroke', '#e2b15c'); o.setAttribute('stroke-width', '1.4'); o.setAttribute('vector-effect', 'non-scaling-stroke'); outline.appendChild(o); lines.push(o);
    }
    circ = document.createElementNS(NS, 'circle'); clip.appendChild(circ);
    var active = -1, cyc = 0;
    function draw(p) {
      var r = sec.getBoundingClientRect(), W = innerWidth, Hh = innerHeight, cx = W / 2, cy = Hh * (W < 700 ? .5 : .7), diag = Math.hypot(W, Hh);
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh);
      var bud = 1, open = .45 + .55 * smooth(p / .28), cover = smooth((p - .32) / .4);
      var base = Math.min(W, Hh) / (W < 700 ? 260 : 330);
      for (var i = 0; i < N * 2; i++) {
        // like the lotus on her sign: an outer fan of wide petals and an inner fan, rising from one base
        var inner = i >= N, k = i % N, span = inner ? 52 : 82;
        var ang = (k / (N - 1) - .5) * 2 * span * (.1 + .9 * open);
        var sc = base * (1 + bud * .2 + open * (inner ? .4 : .6)) * (1 + cover * cover * 6);
        var wide = inner ? .8 : 1.05;
        var tr = 'translate(' + cx + ' ' + cy + ') rotate(' + ang + ') scale(' + (sc * wide) + ' ' + sc + ')';
        paths[i].setAttribute('transform', tr); lines[i].setAttribute('transform', tr);
      }
      // the photo shows through the petals once they open; a growing disc at the heart makes the cover seamless
      outline.style.opacity = .55 * (1 - smooth((p - .2) / .2));
      circ.setAttribute('cx', cx); circ.setAttribute('cy', cy); circ.setAttribute('r', cover * diag * 1.05);
      var im = $('[data-bloom-img]'); im.style.opacity = 1;
      var z = 1.14 - .14 * smooth(p / .95); im.setAttribute('transform', 'translate(' + cx * (1 - z) + ' ' + Hh / 2 * (1 - z) + ') scale(' + z + ')');
      var c = smooth((p - .7) / .12); sec.style.setProperty('--copy', c.toFixed(3)); sec.style.setProperty('--scrim', cover.toFixed(3)); var was = sec.classList.contains('done'); sec.classList.toggle('done', c > .5); if (!was && c > .5 && active < 0) { show(0); cyc = performance.now() - 3000; }
      // overlay box matching the slice-covered photo, so labels sit on the real objects
      var ar = 1600 / 901, bw = W, bh = W / ar; if (bh < Hh) { bh = Hh; bw = Hh * ar; }
      spots.style.cssText = 'left:' + (W - bw) / 2 + 'px;top:' + (Hh - bh) / 2 + 'px;width:' + bw + 'px;height:' + bh + 'px';
    }
    // labels decode out of scrambled letters, one object at a time
    var GL = 'אבגדהוזחטיכלמנסעפצקרשת', GLE = 'abcdefghijklmnopqrstuvwxyz';
    function decode(s) {
      var t = s.dataset[he() ? 'he' : 'en'], tag = $('.tag', s), n = 0, G = he() ? GL : GLE;
      // keep the label inside the screen
      tag.textContent = t; tag.style.marginLeft = '0px'; var tr = tag.getBoundingClientRect(), shift = 0;
      if (tr.left < 12) shift = 12 - tr.left; else if (tr.right > innerWidth - 12) shift = innerWidth - 12 - tr.right;
      tag.style.marginLeft = shift + 'px';
      if (still()) { tag.textContent = t; return; }
      var iv = setInterval(function () { n++; tag.textContent = t.split('').map(function (ch, j) { return ch === ' ' || j < n / 2 ? ch : G[(Math.random() * G.length) | 0]; }).join(''); if (n / 2 >= t.length) { clearInterval(iv); tag.textContent = t; } }, 28);
    }
    function show(i) { var ss = $$('.spot', spots); if (i === active) return; active = i; ss.forEach(function (s, j) { s.classList.toggle('on', j === i); }); if (ss[i]) decode(ss[i]); }
    $$('.spot', spots).forEach(function (s, i) { s.addEventListener('pointerenter', function () { show(i); cyc = performance.now(); }); s.addEventListener('click', function () { show(i); cyc = performance.now(); }); s.addEventListener('focus', function () { show(i); }); });
    setInterval(function () { if (still() || !sec.classList.contains('done') || performance.now() - cyc < 5000) return; show((active + 1) % 5); }, 2600);
    return { draw: draw, sec: sec };
  })();

  // ------------------------------------------------ the arc: photo cards on a turning ring (scroll + drag)
  var arc = (function () {
    var stage = $('[data-arc]'), ring = $('[data-arc-ring]'), cards = $$('.card', ring), drag = 0, vel = 0, down = false, lx = 0, R = 600, step = 30, total = cards.length * step;
    function layout() { step = innerWidth < 640 ? 40 : 30; total = cards.length * step; R = innerWidth < 640 ? 290 : Math.min(900, innerWidth * .52); }
    function draw(scrollP) {
      var base = (scrollP * 120 - 60) + drag;
      cards.forEach(function (c, i) {
        var a = (((i - (cards.length - 1) / 2) * step + base) % total + total * 1.5) % total - total / 2, rad = a * Math.PI / 180, front = Math.cos(rad);
        c.style.transform = 'translate3d(' + (Math.sin(rad) * R) + 'px,' + ((1 - front) * 40) + 'px,' + ((front - 1) * R * .7) + 'px) rotateY(' + a * .8 + 'deg)';
        c.style.opacity = smooth((total / 2 - Math.abs(a)) / step);
        c.lastChild.style.opacity = smooth((front - .93) / .05);
        c.style.zIndex = Math.round(front * 100) + 100;
        c.style.filter = 'brightness(' + (.45 + .55 * smooth((front + .2) / 1.2)) + ')';
        c.style.visibility = Math.abs(a) > total / 2 - step * .6 ? 'hidden' : 'visible';
      });
    }
    stage.addEventListener('pointerdown', function (e) { down = true; lx = e.clientX; vel = 0; stage.setPointerCapture(e.pointerId); });
    stage.addEventListener('pointermove', function (e) { if (!down) return; var d = (e.clientX - lx) * .25; lx = e.clientX; drag += d; vel = d; frame(); });
    var end = function () { if (!down) return; down = false; (function coast() { if (Math.abs(vel) < .05) return; vel *= .93; drag += vel; frame(); requestAnimationFrame(coast); })(); };
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
    stage.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { drag += e.key === 'ArrowLeft' ? -step : step; frame(); } });
    stage.tabIndex = 0;
    layout();
    return { draw: draw, layout: layout, stage: stage };
  })();

  // ------------------------------------------------ odometer for the 5.0
  var odo = $('[data-odo]'), odoDone = false;
  function rollOdo() {
    if (odoDone) return; odoDone = true;
    var d = $$('.odo', odo);
    if (still()) { d[0].textContent = '5'; d[1].textContent = '0'; return; }
    var t0 = performance.now();
    (function step(t) { var k = clamp((t - t0) / 1400, 0, 1), e = 1 - Math.pow(1 - k, 3), v = 5 * e; d[0].textContent = Math.floor(v + 1e-6); d[1].textContent = k < 1 ? Math.floor((v * 10) % 10) : 0; if (k < 1) requestAnimationFrame(step); })(t0);
  }

  // ------------------------------------------------ footer wordmark fitted to its width
  function fit() { var w = $('[data-fit]'); w.style.fontSize = '100px'; var span = $$('span', w).filter(function (x) { return x.offsetWidth; })[0]; if (!span) return; w.style.fontSize = Math.min(260, 100 * (w.parentNode.clientWidth * .9) / span.offsetWidth) + 'px'; }

  // ------------------------------------------------ the frame loop (scroll-linked, reversible)
  var duo = $('[data-duo]'), da = duo.children[0], db = duo.children[1], tx = 0, ty = 0;
  addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; queue(); }, { passive: true });
  var nav = $('[data-nav]'), lan = $('[data-lanterns]'), hero = $('.hero'), q = $$('.q'), door = $('[data-door]'), visit = $('[data-visit]'), queued = false;
  function frame() {
    queued = false;
    var vh = innerHeight, y = scrollY, s = still();
    nav.classList.toggle('scrolled', y > 40);
    lan.classList.toggle('show', y > hero.offsetHeight * .6 || (!desk() && y > 200));
    // hero curtains
    var hr = hero.getBoundingClientRect(), scrollOpen = clamp(-hr.top / (hr.height * .45), 0, 1);
    arch.style.setProperty('--open', s ? 1 : (heroOpen + (1 - heroOpen) * smooth(scrollOpen)).toFixed(4));
    // statement words
    var sr = stmt.getBoundingClientRect(), sp = clamp((vh * .85 - sr.top) / (sr.height + vh * .35), 0, 1);
    var ws = $$('.w', stmt).filter(function (w) { return w.offsetParent; });
    ws.forEach(function (w, i) { w.classList.toggle('on', s || i < sp * ws.length * 1.1); });
    // the two framed photos drift apart at different speeds; on desktop they lean toward the pointer
    var dr = duo.getBoundingClientRect();
    if (!s && dr.top < vh && dr.bottom > 0) {
      var dp = (dr.top + dr.height / 2 - vh / 2) / vh;
      da.style.transform = 'translate3d(' + (tx * -10) + 'px,' + (dp * 40 + ty * -8) + 'px,0)';
      db.style.transform = 'translate3d(' + (tx * 14) + 'px,' + (dp * -60 + ty * 10) + 'px,0)';
      da.firstElementChild.style.transform = db.firstElementChild.style.transform = 'scale(' + (1.12 - .06 * clamp(1 - Math.abs(dp), 0, 1)) + ')';
    }
    // bloom
    if (!s) { var br = bloom.sec.getBoundingClientRect(); if (br.top < vh && br.bottom > 0) bloom.draw(clamp(-br.top / (br.height - vh), 0, 1)); }
    // arc
    var ar = arc.stage.getBoundingClientRect(); if (ar.top < vh && ar.bottom > 0) arc.draw(s ? .5 : clamp((vh - ar.top) / (vh + ar.height), 0, 1));
    // stacked review cards: each one settles back a little as the next lands on it
    q.forEach(function (c, i) {
      if (s || !q[i + 1]) { c.style.setProperty('--s', 1); return; }
      var a = c.getBoundingClientRect(), b = q[i + 1].getBoundingClientRect(), k = clamp(1 - (b.top - a.top) / a.height, 0, 1);
      c.style.setProperty('--s', (1 - k * .05).toFixed(4));
    });
    // hallway photo: from oversized into its lotus arch
    var vr = visit.getBoundingClientRect(), vp = clamp((vh - vr.top) / (vh * .95), 0, 1);
    door.style.transform = s ? '' : 'scale(' + (1 + (1 - smooth(vp)) * .55).toFixed(4) + ') translateY(' + ((1 - smooth(vp)) * 8).toFixed(2) + '%)';
    if (odo.getBoundingClientRect().top < vh * .85) rollOdo();
  }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', function () { arc.layout(); fit(); queue(); });

  // ------------------------------------------------ reveals
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    $$('[data-reveal]').forEach(function (el) { ro.observe(el); });
  } else $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });

  // ------------------------------------------------ go
  texts(root.lang); hours(); status(); days(); words(); compose(true); frame(); curtainIntro(); petals.start();
  setInterval(status, 60000);
  if (document.fonts) document.fonts.ready.then(function () { fit(); frame(); }); else fit();
  window.__orawan = true;
})();
