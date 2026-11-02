(function () {
  var root = document.documentElement, WA = '972525988669';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 761; };
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'מעבדת Dphone · הילדים 32, קריית מוצקין', en: 'Dphone Lab · 32 HaYeladim St, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור מעבדת Dphone · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Dphone Lab · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'מעבדת Dphone', 'Dphone Lab');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לדני, 052-598-8669', 'Call Danny, 052-598-8669');
    aria('[data-t-wa]', 'וואטסאפ לדני', 'WhatsApp Danny');
    aria('[data-t-kdev]', 'מכשיר: לחצו להחלפה', 'Device: press to change');
    aria('[data-t-kiss]', 'מה קרה: לחצו להחלפה', 'What happened: press to change');
    $('[data-t-map]').title = l === 'he' ? 'מפה: הילדים 32, קריית מוצקין' : 'Map: 32 HaYeladim St, Kiryat Motzkin';
    var m = $('[data-model]'); m.placeholder = m.dataset[l === 'he' ? 'phHe' : 'phEn'];
    $$('[data-labels] span').forEach(function (s) { s.textContent = s.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('dp-lang', l); } catch (e) {}
    texts(l); splitName(); hours(); compose(true); buildMosaic(); frame();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('dp-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    board.classList.add('dealt');
    $$('.name .c').forEach(function (c) { c.classList.add('on'); });
    $$('[data-odo]').forEach(function (o) { o.textContent = o.dataset.odo; });
    if (still()) { $$('[data-visit] .v-photo').forEach(function (v) { v.removeAttribute('style'); }); }
    accRun(); smokeKick(); lensKick(); compose(true); frame();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status (Israel time); null = closed
  var D = [[10, 19]];
  var H = { 0: D, 1: D, 2: D, 3: D, 4: D, 5: [[10, 14]], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d] || [], txt = '', open = false, i;
    for (i = 0; i < t.length; i++) if (n.h >= t[i][0] && n.h < t[i][1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[i][1]) : 'Open now · until ' + hhmm(t[i][1]); }
    if (!open) {
      for (i = 0; i < t.length; i++) if (n.h < t[i][0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[i][0]) : 'Closed now · opens today at ' + hhmm(t[i][0]); break; }
      if (!txt) {
        var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
        txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
          : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0][0]))
          : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0][0]));
      }
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span><span>' + txt + '</span>'; });
    $$('[data-status-plain]').forEach(function (el) { el.textContent = txt; el.parentNode.classList.toggle('open', open); });
    var led = $('[data-dock-led]'); led.textContent = open ? (l ? 'פתוח' : 'Open') : (l ? 'סגור' : 'Closed'); led.classList.toggle('open', open);
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? t.map(function (s) { return '<span dir="ltr">' + hhmm(s[0]) + '–' + hhmm(s[1]) + '</span>'; }).join(l ? ' ו־' : ', ') : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- the name fills in letter by letter (the brand word in the sign's blue)
  function splitName() {
    $$('.name > span[lang]').forEach(function (sp) {
      if (!sp.dataset.raw) sp.dataset.raw = sp.textContent;
      var raw = sp.dataset.raw, bi = raw.indexOf('Dphone');
      sp.setAttribute('aria-label', raw);
      sp.innerHTML = raw.split('').map(function (c, i) {
        var b = bi >= 0 && i >= bi && i < bi + 6;
        return c === ' ' ? ' ' : '<span class="c' + (b ? ' b' : '') + '" aria-hidden="true">' + c + '</span>';
      }).join('');
    });
    fitName();
    var cs = $$('.name > span[lang]:not([hidden]) .c').filter(function (c) { return c.offsetParent; });
    if (still()) { cs.forEach(function (c) { c.classList.add('on'); }); return; }
    cs.forEach(function (c, i) { setTimeout(function () { c.classList.add('on'); }, 500 + i * 70); });
  }

  function fitName() {
    var n = $('.name'), band = n.parentNode, arcs = $('.arcs', band);
    n.style.fontSize = '';
    var cs = getComputedStyle(band), avail = band.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(getComputedStyle(arcs).width) - 24;
    var sp = $('span[lang="' + root.lang + '"]', n), w = sp.offsetWidth, fs = parseFloat(getComputedStyle(n).fontSize);
    var maxH = band.clientHeight * .78;
    if (w > 0) n.style.fontSize = Math.min(fs * avail / w, maxH / 1.0) + 'px';
  }

  // ---------------------------------------------------------------- the deal: board tiles come off one stack, the bench lands last
  var board = $('[data-board]');
  function deal() {
    var br = board.getBoundingClientRect(), cx = br.left + br.width / 2, cy = br.top + Math.min(br.height, innerHeight) / 2;
    var tiles = $$('[data-deal]', board), n = tiles.length;
    tiles.forEach(function (t, i) {
      var r = t.getBoundingClientRect(), bench = t.hasAttribute('data-bench');
      t.style.setProperty('--dx', (cx - (r.left + r.width / 2)) * .55 + 'px');
      t.style.setProperty('--dy', (cy - (r.top + r.height / 2)) * .55 + 'px');
      t.style.setProperty('--rot', ((i * 37) % 13 - 6) + 'deg');
      t.style.setProperty('--d', (bench ? n * 55 : i * 55) + 'ms');
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () { board.classList.add('dealt'); }); });
    setTimeout(function () { tiles.forEach(function (t) { t.style.removeProperty('--d'); }); }, 2200);
  }

  // ---------------------------------------------------------------- the microscope lens over Danny's real bench
  var bench = $('[data-bench]'), bimg = $('.bench-img', bench), lens = $('[data-lens]'), labels = $$('[data-labels] span');
  var Z = 2.4, geo = null, L = { x: 0, y: 0, tx: 0, ty: 0 }, lastUser = -1e9, lensRaf = 0, roamI = 0, roamT = 0;
  var POIS = labels.map(function (s) { var p = s.dataset.pt.split(','); return { u: +p[0], v: +p[1], el: s }; });
  function measure() {
    var w = bench.clientWidth, h = bench.clientHeight, iw = 1080, ih = 1920, s = Math.max(w / iw, h / ih);
    var pos = getComputedStyle(bimg).objectPosition.split(' ').map(function (v) { return parseFloat(v) / 100; });
    geo = { w: w, h: h, s: s, ox: (w - iw * s) * pos[0], oy: (h - ih * s) * pos[1], R: lens.offsetWidth / 2 };
    lens.style.backgroundImage = 'url("' + (bimg.currentSrc || bimg.src) + '")';
    lens.style.backgroundSize = (iw * s * Z) + 'px ' + (ih * s * Z) + 'px';
    POIS.forEach(function (p) {
      p.x = geo.ox + p.u * s; p.y = geo.oy + p.v * s;
      p.vis = p.x > 50 && p.x < w - 50 && p.y > 40 && p.y < h - 30;
      p.el.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px) translate(-50%,-150%)';
      p.el.style.left = '0';
    });
  }
  function drawLens() {
    if (!geo) return;
    var x = clamp(L.x, 0, geo.w), y = clamp(L.y, 0, geo.h);
    lens.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    var u = (x - geo.ox) / geo.s, v = (y - geo.oy) / geo.s;
    lens.style.backgroundPosition = (-(u * geo.s * Z) + geo.R) + 'px ' + (-(v * geo.s * Z) + geo.R) + 'px';
    POIS.forEach(function (p) {
      var on = p.vis && Math.hypot(p.x - x, p.y - y) < geo.R * 1.15;
      if (on && !p.el.classList.contains('on')) decode(p.el);
      p.el.classList.toggle('on', on);
    });
  }
  function visiblePois() { return POIS.filter(function (p) { return p.vis; }); }
  function park() { var v = visiblePois(); var p = v[0] || { x: geo.w / 2, y: geo.h / 2 }; L.x = L.tx = p.x; L.y = L.ty = p.y; drawLens(); }
  function lensTick(t) {
    lensRaf = 0;
    if (still() || !geo) return;
    if (t - lastUser > 3200) {           // roam between the instruments on the bench
      var v = visiblePois();
      if (v.length && t - roamT > 2300) { roamI = (roamI + 1) % v.length; roamT = t; L.tx = v[roamI].x; L.ty = v[roamI].y; }
    }
    L.x += (L.tx - L.x) * .075; L.y += (L.ty - L.y) * .075;
    drawLens();
    if (benchVisible) lensRaf = requestAnimationFrame(lensTick);
  }
  function lensKick() { if (!geo) return; if (still()) { park(); return; } if (!lensRaf && benchVisible) lensRaf = requestAnimationFrame(lensTick); }
  function aim(e) {
    var r = bench.getBoundingClientRect();
    L.tx = e.clientX - r.left; L.ty = e.clientY - r.top; lastUser = performance.now();
    if (still()) { L.x = L.tx; L.y = L.ty; drawLens(); } else lensKick();
  }
  if (finePointer) bench.addEventListener('pointermove', aim);
  bench.addEventListener('click', aim);
  var benchVisible = true;
  if (io) new IntersectionObserver(function (es) { benchVisible = es[0].isIntersecting; lensKick(); smokeKick(); }).observe(bench);

  // glyph-decode for the instrument labels
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHKLMNPRSTUWXZ' };
  function decode(el) {
    var l = he() ? 'he' : 'en', txt = el.dataset[l], n = 0, steps = 12;
    if (still()) { el.textContent = txt; return; }
    clearInterval(el._t);
    el._t = setInterval(function () {
      n++; var keep = Math.floor(txt.length * n / steps);
      el.textContent = txt.split('').map(function (c, i) { return i < keep || c === ' ' ? c : GL[l][Math.floor(Math.random() * GL[l].length)]; }).join('');
      if (n >= steps) { clearInterval(el._t); el.textContent = txt; }
    }, 40);
  }

  // ---------------------------------------------------------------- warm haze rising off the lit plate under the microscope
  var cv = $('[data-smoke]'), cx2 = cv.getContext('2d'), parts = [], smokeRaf = 0, dpr = Math.min(devicePixelRatio || 1, 2);
  function smokeSize() { cv.width = bench.clientWidth * dpr; cv.height = bench.clientHeight * dpr; }
  function smokeTick() {
    smokeRaf = 0;
    if (still() || !geo || !benchVisible) { cx2.clearRect(0, 0, cv.width, cv.height); return; }
    var sx = geo.ox + 830 * geo.s, sy = geo.oy + 1050 * geo.s;
    if (parts.length < 46 && Math.random() < .5) parts.push({ x: sx + (Math.random() - .5) * 30 * geo.s, y: sy, r: 8 + Math.random() * 10, a: 0, life: 0, max: 160 + Math.random() * 120, sw: Math.random() * 6.28 });
    cx2.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx2.clearRect(0, 0, geo.w, geo.h);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i]; p.life++;
      var k = p.life / p.max;
      p.y -= .55 + k * .4; p.x += Math.sin(p.sw + p.life * .03) * .45; p.r += .22;
      var a = Math.sin(Math.PI * k) * .11;
      var g = cx2.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, 'rgba(255,226,180,' + a + ')'); g.addColorStop(1, 'rgba(255,226,180,0)');
      cx2.fillStyle = g; cx2.beginPath(); cx2.arc(p.x, p.y, p.r, 0, 6.29); cx2.fill();
      if (p.life >= p.max) parts.splice(i, 1);
    }
    smokeRaf = requestAnimationFrame(smokeTick);
  }
  function smokeKick() { if (!smokeRaf) smokeRaf = requestAnimationFrame(smokeTick); }

  // ---------------------------------------------------------------- mosaic: one real photo of the bench cut across the board, assembling as you arrive
  var mosaic = $('[data-mosaic]'), mtiles = [], MIMG = { src: 'img/bench-top.jpg', w: 860, h: 1529, fy: .58 };
  var ACT_SVG = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 32 32 8M14 8h18v18"/></svg>';
  var CONTENT = {
    head: '<h2><span lang="he">מפרקים, <em>מחברים</em></span><span lang="en">Taken apart, <em>put back</em></span></h2>',
    f1: '<p><b><span lang="he">בהגדלה</span><span lang="en">Magnified</span></b><span lang="he">מיקרוסקופ על השולחן</span><span lang="en">a microscope on the bench</span></p>',
    f2: '<p><b><span lang="he">במדידה</span><span lang="en">Measured</span></b><span lang="he">ספק כוח ומולטימטר</span><span lang="en">power supply and multimeter</span></p>',
    f3: '<p><b><span lang="he">בהלחמה</span><span lang="en">Soldered</span></b><span lang="he">חוט הלחמה ופינצטות</span><span lang="en">solder wire and tweezers</span></p>',
    act: '<span lang="he">וואטסאפ לדני</span><span lang="en">WhatsApp Danny</span>' + ACT_SVG
  };
  function buildMosaic() {
    var ph = phone(), cols = ph ? 3 : 6, rows = ph ? 6 : 4, n = cols * rows;
    var map = ph ? { 0: 'head', 5: 'f1', 9: 'f2', 13: 'f3', 16: 'act' } : { 0: 'head', 9: 'f1', 14: 'f2', 19: 'f3', 23: 'act' };
    var html = '', i, k = 0;
    for (i = 0; i < n; i++) {
      if (ph && i === 1) continue;          // the heading spans two cells on phones
      var c = map[i];
      if (!c) html += '<div class="mt pic" aria-hidden="true"></div>';
      else if (c === 'act') html += '<a class="mt c act" href="https://wa.me/' + WA + '?text=' + encodeURIComponent(he() ? 'שלום דני' : 'Hi Danny') + '">' + CONTENT.act + '</a>';
      else html += '<div class="mt c ' + (c === 'head' ? 'head c1' : 'fact c' + (1 + (k++ % 3))) + '"' + (c === 'head' && ph ? ' style="grid-column:span 2;aspect-ratio:auto"' : '') + '>' + CONTENT[c] + '</div>';
    }
    mosaic.innerHTML = html;
    mtiles = $$('.mt', mosaic);
    mtiles.forEach(function (t, i) { t._dx = ((i * 53) % 17 - 8) * 7; t._dy = 40 + ((i * 31) % 11) * 9; t._r = ((i * 29) % 9 - 4) * 1.6; });
    cutMosaic();
  }
  function cutMosaic() {
    var gr = mosaic.getBoundingClientRect(), W = gr.width, Hh = gr.height;
    var s = Math.max(W / MIMG.w, Hh / MIMG.h), bw = MIMG.w * s, bh = MIMG.h * s, ox = (W - bw) / 2, oy = (Hh - bh) * MIMG.fy;
    mtiles.forEach(function (t) {
      if (!t.classList.contains('pic')) return;
      var r = { left: gr.left + t.offsetLeft, top: gr.top + t.offsetTop };
      t.style.backgroundImage = 'url(' + MIMG.src + ')';
      t.style.backgroundSize = bw + 'px ' + bh + 'px';
      t.style.backgroundPosition = (ox - (r.left - gr.left)) + 'px ' + (oy - (r.top - gr.top)) + 'px';
    });
  }

  // ---------------------------------------------------------------- reveals
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // odometer figures
  function roll(el) {
    var target = parseFloat(el.dataset.odo), dec = (el.dataset.odo.split('.')[1] || '').length, t0 = performance.now();
    if (still()) { el.textContent = el.dataset.odo; return; }
    (function step(t) {
      var k = smooth((t - t0) / 1400);
      el.textContent = (target * k).toFixed(dec);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  if (io) { var oio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { roll(e.target); oio.unobserve(e.target); } }); }); $$('[data-odo]').forEach(function (o) { oio.observe(o); }); }

  // spotlight that follows the cursor over the repair rows
  var spot = $('[data-spot]');
  if (finePointer) spot.addEventListener('pointermove', function (e) {
    $$('.row', spot).forEach(function (r) { var b = r.getBoundingClientRect(); r.style.setProperty('--x', e.clientX - b.left + 'px'); r.style.setProperty('--y', e.clientY - b.top + 'px'); });
  });

  // ---------------------------------------------------------------- counter → bench accordion
  var acc = $('[data-acc]'), pans = $$('.pan', acc), accUser = false, accSeen = false;
  function openPan(i) { pans.forEach(function (p, k) { p.classList.toggle('open', k === i); p.setAttribute('aria-expanded', k === i ? 'true' : 'false'); p.classList.remove('run'); }); accRun(); }
  function accRun() {
    pans.forEach(function (p) { p.classList.remove('run'); });
    if (accUser || still() || !accSeen) return;
    var p = $('.pan.open', acc); void p.offsetWidth; p.classList.add('run');
  }
  pans.forEach(function (p, i) {
    p.addEventListener('click', function () { accUser = true; openPan(i); });
    $('.prog', p).addEventListener('animationend', function () { if (!accUser) openPan((i + 1) % pans.length); });
  });
  if (io) new IntersectionObserver(function (es) { accSeen = es[0].isIntersecting; if (accSeen) accRun(); else pans.forEach(function (p) { p.classList.remove('run'); }); }, { threshold: .4 }).observe(acc);

  // ---------------------------------------------------------------- the composer: two power-supply knobs write the WhatsApp message
  var OPT = {
    dev: { he: ['טלפון', 'טאבלט', 'מחשב נייד', 'מחשב נייח'], en: ['phone', 'tablet', 'laptop', 'desktop computer'] },
    iss: { he: ['מסך שבור', 'לא נטען', 'נרטב', 'לא נדלק', 'משהו אחר'], en: ['a cracked screen', 'it won’t charge', 'it got wet', 'it won’t turn on', 'something else'] }
  };
  var LABEL = { dev: { he: ['טלפון', 'טאבלט', 'מחשב נייד', 'מחשב נייח'], en: ['Phone', 'Tablet', 'Laptop', 'Desktop'] }, iss: { he: ['מסך שבור', 'לא נטען', 'נרטב', 'לא נדלק', 'משהו אחר'], en: ['Cracked screen', 'Won’t charge', 'Got wet', 'Won’t turn on', 'Something else'] } };
  var sel = { dev: 0, iss: 0 }, model = $('[data-model]'), msgEl = $('[data-msg]'), waBtn = $('[data-wa-compose]'), typeT = 0;
  function message() {
    var l = he() ? 'he' : 'en', d = OPT.dev[l][sel.dev], m = model.value.trim(), i = sel.iss;
    if (l === 'he') {
      var dm = d + (m ? ' (' + m + ')' : '');
      var probs = ['עם מסך שבור', 'שלא נטען', 'שנרטב', 'שלא נדלק', 'עם תקלה'];
      return 'שלום דני, יש לי ' + dm + ' ' + probs[i] + '. אפשר להביא אליך לבדיקה?';
    }
    var art = /^[aeiou]/i.test(d) ? 'an ' : 'a ';
    var en = ['with a cracked screen', 'that won’t charge', 'that got wet', 'that won’t turn on', 'with a problem'];
    return 'Hi Danny, I have ' + art + d + (m ? ' (' + m + ')' : '') + ' ' + en[i] + '. Can I bring it in for a check?';
  }
  function compose(instant) {
    var l = he() ? 'he' : 'en', txt = message();
    $$('[data-kval]').forEach(function (o) { var k = o.dataset.kval; o.textContent = LABEL[k][l][sel[k]]; });
    $('[data-led-a]').textContent = '0' + (sel.dev + 1);
    $('[data-led-b]').textContent = '0' + (sel.iss + 1);
    waBtn.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(txt);
    clearInterval(typeT);
    if (instant || still()) { msgEl.textContent = txt; return; }
    var n = 0; msgEl.innerHTML = '<span class="cur"></span>';
    typeT = setInterval(function () {
      n += 2; msgEl.innerHTML = ''; msgEl.appendChild(document.createTextNode(txt.slice(0, n)));
      var c = document.createElement('span'); c.className = 'cur'; msgEl.appendChild(c);
      if (n >= txt.length) { clearInterval(typeT); msgEl.textContent = txt; }
    }, 22);
  }
  $$('[data-knob]').forEach(function (k) {
    var key = k.dataset.knob, cap = $('.cap', k), N = OPT[key].he.length, STEP = 300 / (N - 1), drag = null, moved = false;
    function set(i, type) { sel[key] = (i + N) % N; cap.style.setProperty('--a', (-150 + sel[key] * STEP) + 'deg'); compose(!type); }
    set(0);
    var ang = function (e) { var r = k.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; };
    k.addEventListener('pointerdown', function (e) { drag = { a: ang(e), acc: 0 }; moved = false; k.setPointerCapture(e.pointerId); });
    k.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var a = ang(e), d = a - drag.a; if (d > 180) d -= 360; if (d < -180) d += 360; drag.a = a; drag.acc += d;
      if (Math.abs(drag.acc) > 40) { moved = true; set(sel[key] + (drag.acc > 0 ? 1 : -1), true); drag.acc = 0; }
    });
    k.addEventListener('pointerup', function () { if (!moved) set(sel[key] + 1, true); drag = null; });
    k.addEventListener('pointercancel', function () { drag = null; });
    k.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); set(sel[key] + 1, true); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); set(sel[key] - 1, true); }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(sel[key] + 1, true); }
    });
  });
  model.addEventListener('input', function () { compose(true); });

  // ---------------------------------------------------------------- scroll-linked: nav pill, lens iris, mosaic assembly, closing photo, footer curtain
  var nav = $('[data-nav]'), iris = $('[data-iris]'), vphoto = $('.v-photo'), foot = $('[data-foot]'), footIn = $('.foot-in'), dock = $('[data-dock]');
  var queued = false;
  function frame() {
    queued = false;
    var vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 90);
    if (still()) { iris.style.clipPath = ''; mtiles.forEach(function (t) { t.style.transform = ''; }); footIn.style.removeProperty('--cur'); return; }
    // iris: the lens's light opens the next section from where the lens is
    var ir = iris.getBoundingClientRect(), pi = smooth((vh * 1.02 - ir.top) / (vh * .6));
    var lr = lens.getBoundingClientRect();
    iris.style.setProperty('--ix', (lr.left + lr.width / 2 - ir.left) + 'px');
    iris.style.setProperty('--iy', (lr.top + lr.height / 2 - ir.top) + 'px');
    var icx = lr.left + lr.width / 2 - ir.left, icy = lr.top + lr.height / 2 - ir.top;
    var far = Math.max(Math.hypot(icx, ir.height - icy), Math.hypot(ir.width - icx, ir.height - icy));
    iris.style.setProperty('--iris', lerp(40, far + 40, pi) + 'px');
    // pieces of the bench photo settle into place
    var pm = smooth((vh * .95 - ir.top) / (vh * .7));
    mtiles.forEach(function (t) { var q = 1 - pm; t.style.transform = q < .002 ? '' : 'translate(' + t._dx * q + 'px,' + t._dy * q + 'px) rotate(' + t._r * q + 'deg) scale(' + (1 - q * .12) + ')'; });
    // the closing photo shrinks into its frame beside the address (desktop)
    if (!phone()) {
      var vr = vphoto.getBoundingClientRect(), pv = smooth((vh * .55 - vr.top) / (vh * .55));
      vphoto.style.setProperty(rtl() ? '--kr' : '--kl', lerp(0, 48, pv) + '%');
      vphoto.style.setProperty(rtl() ? '--kl' : '--kr', '0%');
    } else vphoto.removeAttribute('style');
    // footer uncovered like a curtain
    var fr = foot.getBoundingClientRect(), pf = clamp((vh - fr.top) / Math.min(fr.height, vh), 0, 1);
    footIn.style.setProperty('--cur', (1 - pf).toFixed(3));
  }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', queue, { passive: true });
  var lastW = innerWidth;
  addEventListener('resize', function () {
    fitName(); measure(); smokeSize(); if (still()) park();
    if ((innerWidth < 761) !== (lastW < 761)) buildMosaic(); else cutMosaic();
    lastW = innerWidth; queue();
  });
  if (io) new IntersectionObserver(function (es) { dock.classList.toggle('hide', es[0].isIntersecting); }).observe($('.r5'));

  // ---------------------------------------------------------------- start
  texts(root.lang); splitName(); hours(); buildMosaic();
  if (!still()) deal(); else board.classList.add('dealt');
  function initLens() { measure(); smokeSize(); park(); lensKick(); smokeKick(); frame(); }
  if (bimg.complete) initLens(); else bimg.addEventListener('load', initLens);
  if (document.fonts) document.fonts.ready.then(function () { fitName(); measure(); cutMosaic(); frame(); });
  frame();
})();
