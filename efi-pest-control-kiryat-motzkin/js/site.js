(function () {
  var root = document.documentElement, WA = '972545444883';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 700; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';
  var TITLE = { he: 'אפי הדברה והרחקת יונים · קריות וחיפה', en: 'Efi Pest Control & Pigeon Deterrence · Krayot & Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור אפי הדברה והרחקת יונים – קריות וחיפה · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Efi Pest Control & Pigeon Deterrence – Krayot & Haifa · This is not the business’s official website' };
  var WHERE = { roof: ['גג', 'Roof', 'על הגג', 'on the roof'], facade: ['חזית', 'Facade', 'בחזית הבניין', 'on the facade'], balcony: ['מרפסת', 'Balcony', 'במרפסת', 'on the balcony'], flat: ['דירה', 'Flat', 'בדירה', 'in the flat'], stairs: ['חדר מדרגות', 'Stairwell', 'בחדר המדרגות', 'in the stairwell'], yard: ['חצר', 'Yard', 'בחצר', 'in the yard'] };
  var WHAT = { pigeons: ['בעיה של יונים', 'a pigeon problem'], roaches: ['מקקים', 'cockroaches'], wasps: ['קן צרעות', 'a wasp nest'], rodents: ['סימנים של מכרסמים', 'signs of rodents'], snake: ['נחש', 'a snake'], other: ['משהו שצריך לבדוק', 'something that needs a look'] };
  var TOWN = { motzkin: ['קריית מוצקין', 'Kiryat Motzkin'], bialik: ['קריית ביאליק', 'Kiryat Bialik'], yam: ['קריית ים', 'Kiryat Yam'], ata: ['קריית אתא', 'Kiryat Ata'], haim: ['קריית חיים', 'Kiryat Haim'], haifa: ['חיפה', 'Haifa'] };
  var STAGE = [['עולים לגג בחבלים.', 'Up to the roof on ropes.'], ['פורשים את הרשת על החזית.', 'The net is spread over the facade.'], ['מותחים ומעגנים. החזית סגורה ליונים.', 'Tensioned and anchored. The facade is closed to pigeons.']];

  // ---------------------------------------------------------------- language
  function texts(l) {
    var k = l === 'he' ? 0 : 1;
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', k ? e : h); }); };
    aria('[data-t-brand]', 'אפי הדברה והרחקת יונים', 'Efi Pest Control');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לאפי, 054-544-4883', 'Call Efi, 054-544-4883');
    aria('[data-t-wa]', 'וואטסאפ לאפי', 'WhatsApp Efi');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-knots]', 'שלבי העבודה', 'Stages of the job');
    aria('[data-t-prev]', 'השלב הקודם', 'Previous stage');
    aria('[data-t-next]', 'השלב הבא', 'Next stage');
    aria('[data-t-where]', 'איפה', 'Where');
    $$('.part').forEach(function (g) { $('text', g).textContent = WHERE[g.dataset.where][k]; g.setAttribute('aria-label', WHERE[g.dataset.where][k]); });
    $$('[data-town] option').forEach(function (o) { o.textContent = TOWN[o.value][k]; });
    $$('.pin').forEach(function (p) { if ($('b', p).textContent) $('b', p).textContent = p.dataset[l]; });
    var d = $('[data-decode]'); if (d.textContent) d.textContent = d.dataset[l];
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('efi-lang', l); } catch (e) {}
    texts(l); hours(); stageText(); write(true); fitName();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('efi-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    hnet.kick(); tnet.kick(); stepTo(stage, true); onScroll(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed day
  var H = { 0: [7, 21], 1: [7, 21], 2: [7, 21], 3: [7, 21], 4: [7, 21], 5: [6, 18], 6: [19, 23.5] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
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
      var val = !t ? (l ? 'סגור' : 'Closed') : t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento,.cbento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- opening: once per visit, motion on, tap to skip
  var intro = $('[data-intro]');
  (function () {
    var seen = false; try { seen = sessionStorage.getItem('efi-intro'); sessionStorage.setItem('efi-intro', '1'); } catch (e) {}
    if (still() || seen || /[?&]nointro/.test(location.search)) { intro.remove(); return; }
    intro.classList.add('run');
    var tm = [setTimeout(function () { intro.classList.add('grow'); }, 1000), setTimeout(function () { intro.classList.add('out'); }, 1350), setTimeout(function () { intro.remove(); }, 1750)];
    intro.addEventListener('click', function () { tm.forEach(clearTimeout); intro.remove(); });
  })();

  // ---------------------------------------------------------------- a real net: diamond mesh on verlet points, it gives under the hand
  function Net(cv, host, o) {
    var c = cv.getContext('2d'), P = [], L = [], w = 0, h = 0, raf = 0, vis = true, mx = -999, my = -999, pmx = 0, pmy = 0, gust = 0, gx = 0;
    function build() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = host.clientWidth; h = host.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var s = o.cell(w), dy = s * .62, cols = Math.ceil(w / s) + 2, rows = Math.ceil(h * o.depth / dy);
      P = []; L = [];
      for (var r = 0; r <= rows; r++) for (var q = 0; q < cols; q++) {
        var x = q * s - s + (r % 2 ? s / 2 : 0), y = r * dy + (o.top || 0);
        P.push({ x: x, y: y, ox: x, oy: y, px: x, py: y, pin: r === 0 || (o.pinSides && (q === 0 || q === cols - 1)) || (o.pinBottom && r === rows) });
      }
      var at = function (r, q) { return r * cols + q; };
      for (r = 0; r < rows; r++) for (q = 0; q < cols; q++) {
        var a = at(r, q), n1 = r % 2 ? q : q - 1, n2 = r % 2 ? q + 1 : q;
        [n1, n2].forEach(function (n) { if (n >= 0 && n < cols) { var b = at(r + 1, n); L.push([a, b, Math.hypot(P[a].x - P[b].x, P[a].y - P[b].y) * (o.slack || 1)]); } });
      }
      for (var i = 0; i < 90; i++) step(1);
    }
    function step(calm) {
      var g = o.gravity, t = performance.now() / 1000;
      if (!calm && o.gusts && Math.random() < .01) { gust = 1; gx = Math.random() * w; }
      gust *= .97;
      for (var i = 0; i < P.length; i++) {
        var p = P[i]; if (p.pin) continue;
        var vx = (p.x - p.px) * .96, vy = (p.y - p.py) * .96;
        p.px = p.x; p.py = p.y;
        if (!calm) {
          vx += Math.sin(t * .9 + p.oy * .02 + p.ox * .01) * .03;
          if (gust > .05) { var dg = Math.abs(p.x - gx); if (dg < 160) vy -= gust * (1 - dg / 160) * .6; }
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy, R = o.reach;
          if (d2 < R * R) { var f = (1 - Math.sqrt(d2) / R); vx += (mx - pmx) * f * .25 + dx * f * .05; vy += (my - pmy) * f * .25 + dy * f * .05; }
        }
        p.x += vx; p.y += vy + g;
        p.x += (p.ox - p.x) * .004; p.y += (p.oy - p.y) * .004;
      }
      for (var k = 0; k < 3; k++) for (var j = 0; j < L.length; j++) {
        var a = P[L[j][0]], b = P[L[j][1]], ddx = b.x - a.x, ddy = b.y - a.y, d = Math.sqrt(ddx * ddx + ddy * ddy) || 1, diff = (d - L[j][2]) / d * .5;
        if (diff < 0) continue;   // a net is a rope: it pulls, it never pushes
        if (!a.pin) { a.x += ddx * diff; a.y += ddy * diff; }
        if (!b.pin) { b.x -= ddx * diff; b.y -= ddy * diff; }
      }
      pmx = mx; pmy = my;
    }
    function draw() {
      c.clearRect(0, 0, w, h);
      c.strokeStyle = o.color; c.lineWidth = o.line; c.beginPath();
      for (var j = 0; j < L.length; j++) { var a = P[L[j][0]], b = P[L[j][1]]; c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); }
      c.stroke();
      if (o.knots) { c.fillStyle = o.knots; for (var i = 0; i < P.length; i += 1) c.fillRect(P[i].x - 1, P[i].y - 1, 2, 2); }
    }
    function frame() { raf = 0; if (still() || !vis) { draw(); return; } step(0); draw(); raf = requestAnimationFrame(frame); }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    function pt(e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; }
    host.addEventListener('pointermove', pt);
    host.addEventListener('pointerdown', function (e) { pt(e); pmx = mx - 30; pmy = my - 30; kick(); });
    host.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(host, function (v) { vis = v; if (v) kick(); });
    build(); draw();
    return { kick: kick, size: function () { build(); draw(); kick(); }, poke: function (x, y) { mx = x; my = y; pmx = x; pmy = y - 40; } };
  }
  var hero = $('[data-hero]');
  var hnet = Net($('[data-hnet]'), hero, { cell: function (w) { return w < 700 ? 26 : 34; }, depth: .62, gravity: .05, reach: 110, color: 'rgba(226,234,230,.3)', line: 1, gusts: true, slack: 1.04 });
  var tile = $('.t-net');
  var tnet = Net($('[data-tnet]'), tile, { cell: function () { return 22; }, depth: 1.1, gravity: .03, reach: 80, color: 'rgba(232,201,131,.42)', line: 1, gusts: true, pinSides: true, slack: 1.06 });
  // on touch screens a pigeon-sized poke lands on the hero net now and then, so the net is visibly alive
  setInterval(function () { if (!still() && matchMedia('(hover: none)').matches) { hnet.poke(Math.random() * hero.clientWidth, hero.clientHeight * (.15 + Math.random() * .3)); setTimeout(function () { hnet.poke(-999, -999); }, 260); } }, 2600);

  // pins type themselves onto the photo
  function typeIn(el, txt, ms) {
    clearInterval(el._t); if (still()) { el.textContent = txt; return; }
    var i = 0; el.textContent = ''; el._t = setInterval(function () { el.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(el._t); }, ms || 45);
  }
  setTimeout(function () { $$('.pin').forEach(function (p, i) { setTimeout(function () { typeIn($('b', p), p.dataset[root.lang]); }, i * 500); }); }, still() ? 0 : 1900);

  // ---------------------------------------------------------------- nav gathers into a pill
  var nav = $('[data-nav]');

  // ---------------------------------------------------------------- THE NET: the stage net lowers over his photo, the finished facade behind it
  var net = $('[data-net]'), stageEl = $('[data-stage]'), scv = $('[data-snet]'), sc = scv.getContext('2d'), imgB = $('[data-clip]'), kfill = $('[data-k-fill]'), knots = $$('[data-knot]'), sline = $('[data-stage-line]'), SW = 0, SH = 0, stage = 0, sp = 0;
  function sSize() { var dpr = Math.min(2, devicePixelRatio || 1); SW = stageEl.clientWidth; SH = stageEl.clientHeight; scv.width = SW * dpr; scv.height = SH * dpr; sc.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function edgeY(x, e, sag) { return e * (SH + 40) - 20 + sag * Math.sin(Math.PI * x / SW); }
  function renderStage(p, t) {
    var e = smooth(p / .62), sag = lerp(SH * .09, SH * .015, smooth((p - .55) / .4)) * (e > 0 ? 1 : 0), fade = 1 - smooth((p - .7) / .3) * .75, N = 28, pts = [], i, x;
    for (i = 0; i <= N; i++) { x = SW * i / N; pts.push([x, edgeY(x, e, sag) + (t ? Math.sin(t * 1.6 + i * .7) * 2.2 * (1 - e) : 0)]); }
    imgB.style.clipPath = 'polygon(0 0,' + SW + 'px 0,' + pts.slice().reverse().map(function (q) { return q[0].toFixed(1) + 'px ' + q[1].toFixed(1) + 'px'; }).join(',') + ')';
    sc.clearRect(0, 0, SW, SH);
    if (e <= 0) return;
    sc.save(); sc.beginPath(); sc.moveTo(0, 0); sc.lineTo(SW, 0); for (i = N; i >= 0; i--) sc.lineTo(pts[i][0], pts[i][1]); sc.closePath(); sc.clip();
    var s = phone() ? 18 : 24, sh = (t || 0) * 3 % s;
    sc.strokeStyle = 'rgba(232,238,235,' + (.42 * fade).toFixed(3) + ')'; sc.lineWidth = 1; sc.beginPath();
    for (x = -SH; x < SW + SH; x += s) { sc.moveTo(x + sh, 0); sc.lineTo(x + sh + SH * .8, SH); sc.moveTo(x - sh, 0); sc.lineTo(x - sh - SH * .8, SH); }
    sc.stroke(); sc.restore();
    // the edge cable hides the seam between the two photos
    sc.lineWidth = 6; sc.strokeStyle = 'rgba(9,20,19,.55)'; sc.beginPath(); pts.forEach(function (q, k) { k ? sc.lineTo(q[0], q[1] + 2) : sc.moveTo(q[0], q[1] + 2); }); sc.stroke();
    sc.lineWidth = 3.5; sc.strokeStyle = '#d9e2df'; sc.beginPath(); pts.forEach(function (q, k) { k ? sc.lineTo(q[0], q[1]) : sc.moveTo(q[0], q[1]); }); sc.stroke();
    sc.fillStyle = '#cfa857'; for (i = 0; i <= N; i += 4) { sc.beginPath(); sc.arc(pts[i][0], pts[i][1], 4.5, 0, 7); sc.fill(); }
  }
  function stageText() { $$('span', sline).forEach(function (s, k) { s.textContent = STAGE[stage][s.lang === 'he' ? 0 : 1]; }); }
  function setStage(n) {
    if (n === stage && sline.dataset.done) return; stage = n; sline.dataset.done = 1;
    knots.forEach(function (k, i) { k.classList.toggle('on', i <= n); k.setAttribute('aria-pressed', i === n ? 'true' : 'false'); });
    stageText();
  }
  var SP = [.1, .48, 1];
  function stepTo(n, instant) {
    n = clamp(n, 0, 2);
    if (still()) { setStage(n); sp = SP[n]; renderStage(sp, 0); kfill.style.transform = 'scaleX(' + (n / 2) + ')'; return; }
    if (instant) return;
    var r = net.getBoundingClientRect(), top = scrollY + r.top, span = net.offsetHeight - innerHeight;
    scrollTo({ top: top + span * (n === 2 ? .92 : SP[n] * .9 + .04), behavior: 'smooth' });
  }
  knots.forEach(function (k) { k.addEventListener('click', function () { stepTo(+k.dataset.knot); }); });
  $$('[data-step-btn]').forEach(function (b) { b.addEventListener('click', function () { stepTo(stage + (+b.dataset.stepBtn)); }); });
  var netOn = false; watch(net, function (v) { netOn = v; if (v) ambient(); });
  var amb = 0;
  function ambient() { if (amb || still()) return; (function f(t) { amb = 0; if (!netOn || still()) return; renderStage(sp, t / 1000); amb = requestAnimationFrame(f); })(performance.now()); }

  // ---------------------------------------------------------------- stations: decode label, label tilts toward the hand
  var dec = $('[data-decode]');
  function decode() {
    var txt = dec.dataset[root.lang], glyph = he() ? 'אבגדהוזחטיכלמנסעפצקרשת' : 'ABCDEFGHKLMNPRSTUVXZ', i = 0;
    if (still()) { dec.textContent = txt; return; }
    clearInterval(dec._t);
    dec._t = setInterval(function () { i++; var out = ''; for (var k = 0; k < txt.length; k++) out += k < i / 2 || txt[k] === ' ' ? txt[k] : glyph[Math.floor(Math.random() * glyph.length)]; dec.textContent = out; if (i / 2 >= txt.length) clearInterval(dec._t); }, 40);
  }
  watch(dec, function (v) { if (v) decode(); });
  var tag = $('[data-tag]'), stations = $('[data-stations]');
  stations.addEventListener('pointermove', function (e) { if (still() || e.pointerType !== 'mouse') return; var r = tag.getBoundingClientRect(); tag.style.setProperty('--ty', ((e.clientX - r.left - r.width / 2) / innerWidth * 30).toFixed(2) + 'deg'); tag.style.setProperty('--tx', (-(e.clientY - r.top - r.height / 2) / innerHeight * 24).toFixed(2) + 'deg'); });
  stations.addEventListener('pointerleave', function () { tag.style.setProperty('--tx', '0deg'); tag.style.setProperty('--ty', '0deg'); });

  // ---------------------------------------------------------------- services: wasp comb cells, spotlight under the hand
  var hexSvg = $('[data-hex]'), cells = [];
  for (var hr = 0; hr < 5; hr++) for (var hc = 0; hc < 9; hc++) {
    var R = 13, cx = 14 + hc * R * 1.75 + (hr % 2 ? R * .87 : 0), cy = 14 + hr * R * 1.5, pg = document.createElementNS(NS, 'polygon'), pts = [];
    for (var a = 0; a < 6; a++) pts.push((cx + R * Math.cos(Math.PI / 3 * a + Math.PI / 6)).toFixed(1) + ',' + (cy + R * Math.sin(Math.PI / 3 * a + Math.PI / 6)).toFixed(1));
    pg.setAttribute('points', pts.join(' ')); hexSvg.appendChild(pg); cells.push(pg);
  }
  var svc = $('#services'), svcOn = false;
  watch(svc, function (v) { svcOn = v; svc.classList.toggle('on', v); });
  setInterval(function () { if (!svcOn || still()) return; var c = cells[Math.floor(Math.random() * cells.length)]; c.classList.add('lit'); setTimeout(function () { c.classList.remove('lit'); }, 900); }, 260);
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- write to Efi: the live thing
  var what = 'pigeons', where = 'balcony', town = $('[data-town]'), msgEl = $('[data-msg]'), shown = '', typer = 0, chatSeen = false;
  $$('[data-what] button').forEach(function (b) { b.addEventListener('click', function () { what = b.dataset.v; $$('[data-what] button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); lightSteps(1); write(); }); });
  $$('.part').forEach(function (g) {
    var pick = function () { where = g.dataset.where; $$('.part').forEach(function (x) { x.setAttribute('aria-pressed', x === g ? 'true' : 'false'); }); lightSteps(1); write(); };
    g.addEventListener('click', pick); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  });
  town.addEventListener('change', function () { lightSteps(2); write(); });
  function message() {
    var l = he(), k = l ? 0 : 1, wv = WHAT[what][k], pl = WHERE[where][k + 2], tw = TOWN[town.value][k];
    return l ? 'שלום אפי, ראיתי את האתר.\nיש לנו ' + wv + ' ' + pl + ', ב' + tw + '.\nאפשר לתאם בדיקה?'
             : 'Hi Efi, I saw your website.\nWe have ' + wv + ' ' + pl + ', in ' + tw + '.\nCould we arrange an inspection?';
  }
  function write(instant) {
    var target = message();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    clearInterval(typer); msgEl.classList.remove('typing');
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && shown[keep] === target[keep]) keep++;
    var cur = shown.slice(0, keep); msgEl.classList.add('typing');
    typer = setInterval(function () { cur = target.slice(0, cur.length + 2); msgEl.textContent = cur; if (cur.length >= target.length) { clearInterval(typer); msgEl.classList.remove('typing'); shown = target; } }, 22);
  }
  var steps = $$('[data-step]');
  function lightSteps(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  watch($('[data-write]'), function (v) { if (v && !chatSeen) { chatSeen = true; lightSteps(0); shown = ''; write(); } }, { threshold: .25 });

  // ---------------------------------------------------------------- odometer
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join(''); o.setAttribute('role', 'img');
    var roll = function (go) { $$('.d[data-to]', o).forEach(function (d, i) { var to = go ? +d.dataset.to : (+d.dataset.to + 6) % 10; d.firstChild.style.transitionDelay = go ? i * 160 + 'ms' : '0ms'; d.firstChild.style.transform = 'translateY(' + (-to * 10) + '%)'; }); };
    roll(still());
    watch(o, function (v) { if (v) roll(true); }, { threshold: .3 });
  });

  // ---------------------------------------------------------------- reviews hang from a rope and sway with the scroll
  var rail = $('[data-rail]'), rvs = $$('[data-rv]'), sway = 0, swayT = 0, railOn = false;
  watch(rail, function (v) { railOn = v; });
  function railRope() { rail.style.setProperty('--rw', rail.scrollWidth + 'px'); }
  rail.addEventListener('scroll', function () { sway = clamp(sway + 1.2, 0, 5); });
  function swing(t) {
    if (still()) { rvs.forEach(function (r) { r.style.setProperty('--sw', '0deg'); }); return; }
    sway *= .96; swayT = t / 1000;
    rvs.forEach(function (r, i) { r.style.setProperty('--sw', (Math.sin(swayT * 2.2 + i * .9) * (sway + .5)).toFixed(2) + 'deg'); });
  }

  // ---------------------------------------------------------------- footer wordmark fits its width
  var fname = $('[data-fit]');
  function fitName() { fname.style.fontSize = '100px'; var w = fname.parentNode.clientWidth, s = $('span[lang="' + root.lang + '"]', fname).offsetWidth || 1; fname.style.fontSize = Math.min(220, Math.floor(100 * w / s * .98)) + 'px'; }

  // ---------------------------------------------------------------- one scroll loop
  var desc = $('[data-desc]'), hImg = $('.h-photo'), stf = $('[data-stframe]'), shr = $('[data-shrink]'), lastY = scrollY, tick = 0;
  function onScroll() {
    tick = 0;
    var y = scrollY, vh = innerHeight, docH = document.documentElement.scrollHeight - vh, calm = still();
    nav.classList.toggle('gathered', y > 40);
    desc.style.transform = 'translateY(' + (clamp(y / (docH || 1), 0, 1) * (vh - 40)).toFixed(1) + 'px)';
    if (!calm) { hImg.style.transform = 'translateY(' + (Math.min(y, vh) * .22).toFixed(1) + 'px) scale(1.04)'; sway = clamp(sway + Math.abs(y - lastY) * .02, 0, 6); }
    else hImg.style.transform = '';
    lastY = y;
    // net stage
    if (!calm) {
      var r = net.getBoundingClientRect(), p = clamp(-r.top / (net.offsetHeight - vh), 0, 1);
      sp = p; kfill.style.transform = 'scaleX(' + p.toFixed(3) + ')';
      setStage(p < .3 ? 0 : p < .66 ? 1 : 2);
      if (!amb) renderStage(p, performance.now() / 1000);
    }
    // stations frame opens to full width
    var sr = stf.getBoundingClientRect(), q = calm ? 1 : smooth((vh - sr.top) / (vh * 1.05));
    stf.style.setProperty('--ci', ((1 - q) * 8).toFixed(2) + '%'); stf.style.setProperty('--cr', ((1 - q) * 28).toFixed(1) + 'px'); stf.style.setProperty('--cs', (1 + (1 - q) * .12).toFixed(3));
    // closing photo shrinks into its frame
    var cr = shr.getBoundingClientRect(), s2 = calm ? 1 : smooth((vh * .35 - cr.top) / (vh * .7));
    shr.style.setProperty('--si', (s2 * 12).toFixed(2) + '%'); shr.style.setProperty('--sr', (s2 * 28).toFixed(1) + 'px');
  }
  addEventListener('scroll', function () { if (!tick) tick = requestAnimationFrame(onScroll); }, { passive: true });
  (function loop(t) { if (railOn) swing(t); requestAnimationFrame(loop); })(0);

  // ---------------------------------------------------------------- hero photo leans with the hand (desktop)
  hero.addEventListener('pointermove', function (e) { if (still() || e.pointerType !== 'mouse') return; var img = $('img', hImg); img.style.transform = 'translate(' + ((e.clientX / innerWidth - .5) * -14).toFixed(1) + 'px,' + ((e.clientY / innerHeight - .5) * -10).toFixed(1) + 'px)'; });

  function layout() { sSize(); renderStage(sp, 0); railRope(); fitName(); onScroll(); }
  var rz = 0, lw = innerWidth;
  addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (innerWidth !== lw) { lw = innerWidth; hnet.size(); tnet.size(); } layout(); }, 150); });

  var clipBar = $('[data-clipbar]'); watch($('.h-acts'), function (v) { clipBar.classList.toggle('show', !v); });
  texts(root.lang); hours(); layout(); setStage(0); write(true);
  if (still()) stepTo(0, true), renderStage(SP[0], 0);
  if (document.fonts) document.fonts.ready.then(function () { fitName(); railRope(); });
})();
