/* Slash – concept demo. One world: their room — hexagon LED ceiling, backlit arched mirrors, the logo's double-stroke A. */
(function () {
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var ease = function (t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 860; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io || !el) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var WA = 'https://wa.me/972547948988';
  var store = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };

  /* ---------- language ---------- */
  var DAYS = { he: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] };
  function texts() {
    var l = root.lang;
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-aria-he]').forEach(function (a) { a.setAttribute('aria-label', a.dataset[l === 'he' ? 'ariaHe' : 'ariaEn']); });
    $$('.lbl').forEach(function (p) { p.textContent = p.dataset[l === 'he' ? 'decodeHe' : 'decodeEn']; });
    var c = $('.concept'); c.dataset.concept = $('[lang="' + l + '"]', c).textContent;
    $('.links').setAttribute('aria-label', l === 'he' ? 'ראשי' : 'Main');
    $('.v-map iframe').title = l === 'he' ? 'מפה: קרן היסוד 38, קריית ביאליק' : 'Map: Keren HaYesod 38, Kiryat Bialik';
    $('[data-wa-quick]').href = WA + '?text=' + encodeURIComponent(l === 'he' ? 'היי Slash, אשמח לקבוע תור לתספורת' : 'Hi Slash, I’d like to book a haircut');
    $('[data-wa-acad]').href = WA + '?text=' + encodeURIComponent(l === 'he' ? 'היי Slash, אשמח לשמוע פרטים על הלימודים באקדמיה' : 'Hi Slash, I’d like to hear about studying at the academy');
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr'; store('slash-lang', l);
    var u = new URL(location.href); if (l === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang'); history.replaceState(null, '', u);
    texts(); hours(); status(); compose(true); split(); fill(); dispatchEvent(new Event('resize'));
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  /* ---------- motion switch ---------- */
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    root.classList.toggle('still'); store('slash-motion', still() ? 'off' : 'on'); motionUI();
    if (still()) { $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); }); $$('video[data-vid]').forEach(function (v) { v.pause(); }); }
    layout(); kickAll(); compose(true);
  }); });
  motionUI();

  /* ---------- hours + live status (Asia/Jerusalem) ---------- */
  var HRS = [[9, 20], null, [9, 20], [9, 20], [9, 20], [8, 14], null];   // Sun..Sat, null = closed
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = now(), t = HRS[n.d], L = he(), open = !!(t && n.h >= t[0] && n.h < t[1]), txt;
    if (open) txt = L ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]);
    else if (t && n.h < t[0]) txt = L ? 'סגור עכשיו · נפתח היום ב־' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else { var d = n.d, k = 0; do { d = (d + 1) % 7; k++; } while (!HRS[d] && k < 8); txt = L ? 'סגור עכשיו · נפתח ' + (k === 1 ? 'מחר' : 'ביום ' + DAYS.he[d]) + ' ב־' + hhmm(HRS[d][0]) : 'Closed now · opens ' + (k === 1 ? 'tomorrow' : DAYS.en[d]) + ' at ' + hhmm(HRS[d][0]); }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span><span>' + txt + '</span>'; });
    $$('[data-hours] tr').forEach(function (r, i) { r.classList.toggle('today', i === n.d); });
    var dial = $('[data-dial]');
    if (dial) { dial.style.setProperty('--a0', t ? t[0] * 15 + 'deg' : '0deg'); dial.style.setProperty('--a1', t ? t[1] * 15 + 'deg' : '0deg'); $('.hand', dial).style.setProperty('--h', n.h * 15 + 'deg'); }
  }
  function hours() {
    var L = he() ? 'he' : 'en';
    $('[data-hours]').innerHTML = HRS.map(function (t, i) { return '<tr><td>' + DAYS[L][i] + '</td><td dir="ltr">' + (t ? hhmm(t[0]) + '–' + hhmm(t[1]) : (L === 'he' ? 'סגור' : 'Closed')) + '</td></tr>'; }).join('');
  }

  /* ---------- reveals ---------- */
  $$('.bento,.vbento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { threshold: .12 }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  /* ---------- headline: letters fill in one by one ---------- */
  var h1 = $('h1[data-split]');
  function split() {
    var i = 0;
    $$('.ln', h1).forEach(function (ln) {
      var targets = $$('span[lang="' + root.lang + '"]', ln); if (!targets.length) targets = [ln];
      targets.forEach(function (t) {
        (function walk(node) {
          [].slice.call(node.childNodes).forEach(function (c) {
            if (c.nodeType === 3) {
              var f = document.createDocumentFragment();
              c.textContent.split(/(\s+)/).forEach(function (w) {
                if (!w) return; if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(w)); return; }
                var ws = document.createElement('span'); ws.className = 'w';
                w.split('').forEach(function (ch) { var s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = ch; ws.appendChild(s); });
                f.appendChild(ws);
              });
              c.parentNode.replaceChild(f, c);
            } else if (c.nodeType === 1 && !c.classList.contains('ch') && !c.classList.contains('w')) walk(c);
          });
        })(t);
      });
    });
  }
  function fill() { h1.classList.remove('in-h'); void h1.offsetWidth; requestAnimationFrame(function () { h1.classList.add('in-h'); }); }

  /* ---------- figures count up as they arrive ---------- */
  $$('[data-odo]').forEach(function (o) {
    var v = o.dataset.odo, to = parseFloat(v), dec = (v.split('.')[1] || '').length;
    var go = function () { if (still()) { o.textContent = v; return; } var t0 = performance.now(); (function step(t) { var k = ease((t - t0) / 1400); o.textContent = (to * k).toFixed(dec); if (k < 1) requestAnimationFrame(step); else o.textContent = v; })(t0); };
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { o.textContent = (0).toFixed(dec); go(); ob.disconnect(); } }, { threshold: .3 }).observe(o); else go();
  });
  var st = document.createElement('style'); st.textContent = '.odo{direction:ltr;unicode-bidi:isolate;font-variant-numeric:tabular-nums}'; document.head.appendChild(st);

  /* ---------- the hexagon LED ceiling (their own ceiling), lit by a travelling wave + the cursor / finger ---------- */
  function Ceiling(cv, host, opt) {
    var c = cv.getContext('2d'), w = 0, h = 0, cells = [], R = 60, raf = 0, vis = false, px = -1e4, py = -1e4, t0 = performance.now(), taps = [];
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = host.clientWidth; h = host.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = phone() ? 40 : 64; cells = [];
      var dx = R * 1.5, dy = R * Math.sqrt(3), maxY = h * (opt.depth || .62);
      for (var col = -1; col * dx < w + R; col++) for (var row = -1; row * dy < maxY + R; row++) cells.push({ x: col * dx, y: row * dy + (col % 2 ? dy / 2 : 0), v: 0 });
    }
    function hex(x, y, r) { c.moveTo(x + r, y); for (var k = 1; k <= 6; k++) { var a = k * Math.PI / 3; c.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); } }
    function draw(t) {
      c.clearRect(0, 0, w, h);
      var maxY = h * (opt.depth || .62), wx = ((t / 4200) % 1.6 - .3) * w, auto = phone() || px < -1e3;
      var ax = auto ? w * (.5 + .38 * Math.sin(t / 2300)) : px, ay = auto ? maxY * (.45 + .3 * Math.sin(t / 1700)) : py;
      cells.forEach(function (q) {
        var fade = clamp(1 - q.y / maxY, 0, 1); if (fade <= 0) return;
        var d = Math.hypot(q.x - ax, q.y - ay), near = clamp(1 - d / (R * 3.2), 0, 1);
        var wave = clamp(1 - Math.abs(q.x - wx + q.y * .4) / (R * 2.4), 0, 1) * .5;
        var tap = 0; taps.forEach(function (p) { var r = (t - p.t) * .7, dd = Math.abs(Math.hypot(q.x - p.x, q.y - p.y) - r); tap = Math.max(tap, clamp(1 - dd / (R * 1.4), 0, 1) * clamp(1 - (t - p.t) / 1400, 0, 1)); });
        var target = Math.max(near, wave, tap);
        q.v += (target - q.v) * .12;
        q.a = (.16 + q.v * .84) * fade;
      });
      c.lineJoin = 'round';
      [[9, .1], [3.2, .35], [1.4, 1]].forEach(function (p, pass) {
        c.lineWidth = p[0] * (R / 64);
        cells.forEach(function (q) { if (!q.a) return; var a = pass < 2 ? q.a * q.a * p[1] : q.a * p[1]; if (a < .02) return; c.strokeStyle = 'rgba(251,246,255,' + a.toFixed(3) + ')'; c.beginPath(); hex(q.x, q.y, R * .9); c.closePath(); c.stroke(); });
      });
      taps = taps.filter(function (p) { return t - p.t < 1400; });
    }
    function frame(t) { raf = 0; if (!vis) return; draw(still() ? t0 + 2100 : t); if (!still()) raf = requestAnimationFrame(frame); }
    function kick() { if (!raf && vis) raf = requestAnimationFrame(frame); }
    host.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = cv.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
    host.addEventListener('pointerleave', function () { px = -1e4; });
    host.addEventListener('pointerdown', function (e) { var r = cv.getBoundingClientRect(); taps.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }); kick(); });
    watch(host, function (v) { vis = v; kick(); });
    return { size: function () { size(); vis && draw(performance.now()); kick(); }, kick: kick };
  }
  var ceilings = [new Ceiling($('.hero .ceiling'), $('.hero'), { depth: .6 }), new Ceiling($('.foot .ceiling'), $('.foot'), { depth: .55 })];

  /* ---------- the logo plate: hair clippings fall and settle into the real logo, then the real file shows ---------- */
  var plate = $('[data-plate]'), clipCv = $('[data-clip]'), logoImg = $('img', plate), clips = [], clipRaf = 0, clipT = 0;
  function sampleLogo() {
    var W = 300, H = Math.round(W * logoImg.naturalHeight / logoImg.naturalWidth), o = document.createElement('canvas'); o.width = W; o.height = H;
    var x = o.getContext('2d'); x.drawImage(logoImg, 0, 0, W, H);
    var d; try { d = x.getImageData(0, 0, W, H).data; } catch (e) { return null; }
    var pts = []; for (var y = 0; y < H; y += 3) for (var i = 0; i < W; i += 3) { var k = (y * W + i) * 4; if (d[k] < 130 && d[k + 2] < 130) pts.push([i / W, y / H]); }
    return pts;
  }
  function formLogo() {
    if (still() || !logoImg.complete || !logoImg.naturalWidth) return;
    var pts = sampleLogo(); if (!pts) return;
    var r = plate.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1), c = clipCv.getContext('2d');
    clipCv.width = r.width * dpr; clipCv.height = r.height * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
    clips = pts.map(function (p) { return { tx: p[0] * r.width, ty: p[1] * r.height, x: Math.random() * r.width, y: -10 - Math.random() * r.height * 1.4, a: Math.random() * Math.PI, va: (Math.random() - .5) * .3, l: 2 + Math.random() * 3.5, dl: Math.random() * 380 }; });
    plate.classList.add('forming'); clipCv.style.opacity = 1; clipT = performance.now();
    if (!clipRaf) clipRaf = requestAnimationFrame(function step(t) {
      var e = t - clipT; c.clearRect(0, 0, r.width, r.height); c.strokeStyle = '#4a1d48'; c.lineWidth = 1.5; c.lineCap = 'round'; c.beginPath();
      clips.forEach(function (p) { var k = ease((e - p.dl) / 1100); var x = p.x + (p.tx - p.x) * k, y = p.y + (p.ty - p.y) * k, a = p.a + p.va * e / 16 * (1 - k); c.moveTo(x - Math.cos(a) * p.l, y - Math.sin(a) * p.l); c.lineTo(x + Math.cos(a) * p.l, y + Math.sin(a) * p.l); });
      c.stroke();
      if (e > 1300) plate.classList.remove('forming');
      if (e > 1800) { clipCv.style.opacity = 0; clipRaf = 0; return; }
      clipRaf = requestAnimationFrame(step);
    });
  }
  clipCv.style.transition = 'opacity .5s';
  plate.addEventListener('click', formLogo);

  /* ---------- hero opening: their photos are dealt into the arch, the room lands last and stays ---------- */
  function deal() {
    var cards = $$('[data-deck] img'), hero = $('.hero-img');
    if (still() || !cards[0].animate) return;
    var dir = rtl() ? -1 : 1;
    hero.animate([{ opacity: 0, transform: 'translateY(30%) rotate(' + (4 * dir) + 'deg) scale(1.1)' }, { opacity: 1, transform: 'translateY(0) rotate(0) scale(1.04)' }], { duration: 760, delay: 4 * 170 + 120, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' });
    cards.forEach(function (im, i) {
      var r = (i % 2 ? -1 : 1) * (6 + i * 2) * dir;
      im.animate([{ opacity: 0, transform: 'translate(' + (dir * 40) + '%, 30%) rotate(' + r + 'deg) scale(1.08)' }, { opacity: 1, transform: 'translate(0,0) rotate(' + (r / 4) + 'deg) scale(1)', offset: .55 }, { opacity: 1, transform: 'translate(0,0) rotate(0) scale(1)', offset: .8 }, { opacity: 0, transform: 'translate(0,0) rotate(0) scale(1)' }],
        { duration: 1100, delay: i * 170, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'both' });
    });
    var g = $('.glint'); g.animate([{ transform: 'translateX(-70%)' }, { transform: 'translateX(70%)' }], { duration: 1400, delay: 1500, easing: 'cubic-bezier(.65,0,.35,1)' });
  }
  /* cursor: the room shifts behind the glass, the glint follows the hand */
  var arch = $('[data-arch]');
  arch.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return; var r = arch.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    arch.style.setProperty('--px', (-x * 18) + 'px'); arch.style.setProperty('--py', (-y * 14) + 'px'); arch.style.setProperty('--gx', (x * 120) + '%');
  });
  arch.addEventListener('pointerleave', function () { arch.style.setProperty('--px', '0px'); arch.style.setProperty('--py', '0px'); arch.style.setProperty('--gx', '-60%'); });
  $$('[data-tilt]').forEach(function (im) { var t = im.parentNode; t.addEventListener('pointermove', function (e) { if (still() || e.pointerType !== 'mouse') return; var r = t.getBoundingClientRect(); im.style.setProperty('--tx', (-((e.clientX - r.left) / r.width - .5) * 22) + 'px'); im.style.setProperty('--ty', (-((e.clientY - r.top) / r.height - .5) * 22) + 'px'); }); t.addEventListener('pointerleave', function () { im.style.setProperty('--tx', '0px'); im.style.setProperty('--ty', '0px'); }); });

  /* bento spotlight (follows the cursor; on phones it drifts on its own while the tile is in view) */
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  /* ---------- glyph decode for the mirror labels ---------- */
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHJKLMNPRSTUVWXYZ' };
  function decode(p) {
    var fin = p.dataset[he() ? 'decodeHe' : 'decodeEn'], set = GL[he() ? 'he' : 'en'], t0 = performance.now();
    if (still()) { p.textContent = fin; return; }
    (function step(t) { var k = (t - t0) / 700, n = Math.floor(fin.length * clamp(k, 0, 1)), s = fin.slice(0, n);
      for (var i = n; i < fin.length; i++) s += fin[i] === ' ' || fin[i] === '·' ? fin[i] : set[(Math.random() * set.length) | 0];
      p.textContent = s; if (k < 1) requestAnimationFrame(step); else p.textContent = fin; })(t0);
  }
  if (io) { var dio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) decode(e.target); }); }, { threshold: 1 }); $$('.lbl').forEach(function (p) { dio.observe(p); }); }

  /* ---------- scroll scenes ---------- */
  var slash = $('[data-slash]'), cuts = $$('.cut', slash), rail = $('[data-rail]'), track = $('[data-rail-track]'), mcards = $$('.mcard'), acad = $('[data-open]'), stack = $('[data-stack]'), rvs = $$('.rv'), foot = $('[data-foot]'), fplate = $('.foot-plate'), nav = $('[data-nav]'), dock = $('[data-dock]');
  var railRun = 0;
  function layout() {
    var live = !still();
    rail.classList.toggle('pinned', live);
    acad.classList.toggle('live', live);
    stack.classList.toggle('live', live && !phone());
    rvs.forEach(function (r, i) { r.style.setProperty('--k', i); });
    railRun = Math.max(0, track.scrollWidth - innerWidth + 40);
    rail.style.setProperty('--pin-h', live ? (innerHeight + railRun * 1.1) + 'px' : 'auto');
    if (!live) { track.style.transform = ''; mcards.forEach(function (m) { m.style.transform = ''; $('img', m).style.removeProperty('--sh'); }); slash.style.clipPath = ''; cuts.forEach(function (c) { c.style.opacity = 0; }); rvs.forEach(function (r) { r.style.removeProperty('--sc'); r.style.removeProperty('--br'); }); fplate.style.removeProperty('--fy'); fplate.style.removeProperty('--fo'); }
    ceilings.forEach(function (c) { c.size(); });
    scene();
  }
  function scene() {
    var vh = innerHeight, y = scrollY;
    nav.classList.toggle('pill', y > 40);
    if (dock) dock.classList.toggle('away', $('.page').getBoundingClientRect().bottom < vh * .6);
    if (still()) return;

    /* SEAM 1 — the logo's double stroke slices the hero open: a diagonal cut that levels out as you arrive */
    var sr = slash.getBoundingClientRect(), p = smooth((vh - sr.top) / (vh * .75)), W = innerWidth;
    var drop = (1 - p) * Math.min(W * .32, 360);              // how far the far side of the cut hangs down
    var L = rtl() ? 0 : drop, R = rtl() ? drop : 0;
    slash.style.clipPath = p >= 1 ? '' : 'polygon(0 ' + L + 'px, 100% ' + R + 'px, 100% 100%, 0 100%)';
    var ang = Math.atan2(R - L, W) * 180 / Math.PI;
    cuts.forEach(function (c, i) {
      var off = i ? 30 : 8, run = (1 - ease(p * 1.3 - i * .12)) * 120 * (rtl() ? 1 : -1);
      c.style.opacity = (1 - smooth((p - .82) / .18)).toFixed(3);
      c.style.transform = 'translateY(' + ((L + R) / 2 + off) + 'px) rotate(' + ang + 'deg) translateX(' + run + '%)';
    });

    /* the wall of arched mirrors slides by (sticky; the page keeps scrolling normally) and curves like a real wall */
    var rr = rail.getBoundingClientRect(), rp = clamp(-rr.top / Math.max(1, rr.height - vh), 0, 1), tx = rp * railRun * (rtl() ? 1 : -1);
    track.style.transform = 'translate3d(' + tx + 'px,0,0)';
    var cx = W / 2;
    mcards.forEach(function (m) { var b = m.getBoundingClientRect(), d = clamp((b.left + b.width / 2 - cx) / W, -1, 1); m.style.transform = 'rotateY(' + (-d * 28) + 'deg) translateZ(' + (-Math.abs(d) * 120) + 'px)'; $('img', m).style.setProperty('--sh', (d * -30) + 'px'); });

    /* ACADEMY — the arch opens out into the whole screen; the camera pulls back as it opens */
    var ar = acad.getBoundingClientRect(), ap = clamp(-ar.top / Math.max(1, ar.height - vh), 0, 1), o = smooth(ap / .62);
    var side = phone() ? 14 : 34, top = phone() ? 10 : 14, bot = phone() ? 34 : 12;
    acad.style.setProperty('--cl', (side * (1 - o)) + '%'); acad.style.setProperty('--cr', (side * (1 - o)) + '%');
    acad.style.setProperty('--ct', (top * (1 - o)) + '%'); acad.style.setProperty('--cb', (bot * (1 - o)) + '%');
    acad.style.setProperty('--cr0', (999 * Math.pow(1 - o, 2)) + 'px'); acad.style.setProperty('--crb', (16 * (1 - o)) + 'px');
    acad.style.setProperty('--zs', (1.25 - .25 * o).toFixed(3));
    acad.style.setProperty('--co', smooth((ap - .5) / .2).toFixed(3));

    /* REVIEWS — each cape lands over the one before; the one underneath settles back */
    if (stack.classList.contains('live')) rvs.forEach(function (r, i) { var n = rvs[i + 1]; if (!n) return; var a = r.getBoundingClientRect(), b = n.getBoundingClientRect(), k = clamp((a.bottom - b.top) / a.height, 0, 1); r.style.setProperty('--sc', (1 - k * .05).toFixed(3)); r.style.setProperty('--br', (1 - k * .25).toFixed(3)); });

    /* FOOTER curtain — the logo plate rises as the page lifts off it */
    var fr2 = foot.getBoundingClientRect(), fp = clamp((vh - fr2.top) / fr2.height, 0, 1);
    fplate.style.setProperty('--fy', ((1 - ease(fp)) * 60) + 'px'); fplate.style.setProperty('--fo', smooth(fp * 1.3).toFixed(3));
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; scene(); }); } }, { passive: true });
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  function kickAll() { ceilings.forEach(function (c) { c.kick(); }); }

  /* videos only play in view and with motion on */
  $$('video[data-vid]').forEach(function (v) { watch(v, function (on) { if (on && !still()) { v.preload = 'auto'; var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } else v.pause(); }, { threshold: .2 }); });

  /* ---------- composer: the message writes itself on the mirror ---------- */
  var form = $('[data-composer]'), msgEl = $('[data-msg]'), send = $('[data-send]'), typing = 0, lastMsg = '';
  var PART = { he: { m: 'בבוקר', n: 'בצהריים', a: 'אחר הצהריים', e: 'בערב' }, en: { m: 'in the morning', n: 'around midday', a: 'in the afternoon', e: 'in the evening' } };
  function message() {
    var f = new FormData(form), who = f.get('who'), day = +f.get('day'), part = f.get('part'), L = he();
    if (who === 'acad') return L ? 'היי Slash, אשמח לשמוע פרטים על הלימודים באקדמיה. מתי נוח לדבר?' : 'Hi Slash, I’d like to hear about studying at the academy. When is a good time to talk?';
    var what = L ? { me: 'תור לתספורת', kid: 'תור לתספורת לילד שלי', both: 'שני תורים, לי ולילד שלי,' }[who] : { me: 'a haircut', kid: 'a haircut for my kid', both: 'two haircuts, for me and my kid,' }[who];
    return L ? 'היי Slash, אשמח לקבוע ' + what + ' ביום ' + DAYS.he[day] + ' ' + PART.he[part] + '. יש מקום?' : 'Hi Slash, I’d like to book ' + what + ' on ' + DAYS.en[day] + ' ' + PART.en[part] + '. Do you have a slot?';
  }
  function compose(instant) {
    var f = new FormData(form), who = f.get('who'), fri = f.get('day') === '5';
    $$('[data-late]').forEach(function (l) { l.classList.toggle('off', fri); });
    if (fri && /[ae]/.test(f.get('part'))) { form.querySelector('input[name=part][value=m]').checked = true; }
    $$('fieldset[data-step="day"],fieldset[data-step="part"]', form).forEach(function (fs) { fs.disabled = who === 'acad'; });
    var m = message(); send.href = WA + '?text=' + encodeURIComponent(m);
    clearInterval(typing);
    if (instant === true || still()) { msgEl.textContent = m; lastMsg = m; return; }
    var common = 0; while (common < m.length && m[common] === lastMsg[common]) common++;
    var i = common; lastMsg = m;
    typing = setInterval(function () { i += 2; msgEl.textContent = m.slice(0, i); if (i >= m.length) clearInterval(typing); }, 22);
  }
  form.addEventListener('change', function (e) { var fs = e.target.closest('fieldset'); if (fs) fs.classList.add('lit'); compose(); });
  watch($('[data-mirror]'), function (v) { if (v && !msgEl.textContent) { lastMsg = ''; compose(); } }, { threshold: .4 });
  $('fieldset[data-step="who"]').classList.add('lit');

  /* ---------- start ---------- */
  texts(); hours(); status(); split(); setInterval(status, 60000);
  msgEl.textContent = ''; send.href = WA + '?text=' + encodeURIComponent(message());
  if (still()) { msgEl.textContent = message(); lastMsg = msgEl.textContent; }
  layout();
  requestAnimationFrame(function () { fill(); deal(); });
  if (logoImg.complete) setTimeout(formLogo, 250); else logoImg.addEventListener('load', function () { setTimeout(formLogo, 100); });
  window.__slash = true;
})();
