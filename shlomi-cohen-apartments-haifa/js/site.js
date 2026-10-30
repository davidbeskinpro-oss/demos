(function () {
  var root = document.documentElement, WA = '972543500100';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var TITLE = { he: 'שלומי כהן · דירות למכירה בחיפה · שדרות הנשיא', en: 'Shlomi Cohen · Apartments for sale in Haifa · Sderot HaNassi' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור שלומי כהן דירות למכירה בחיפה · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Shlomi Cohen, Apartments for Sale in Haifa · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'שלומי כהן, דירות למכירה בחיפה', 'Shlomi Cohen, apartments for sale in Haifa');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-prev]', 'הקודם', 'Previous');
    aria('[data-t-next]', 'הבא', 'Next');
    aria('[data-t-mode]', 'מוכרים או קונים', 'Selling or buying');
    aria('[data-t-less]', 'פחות חדרים', 'Fewer rooms');
    aria('[data-t-more]', 'יותר חדרים', 'More rooms');
    aria('[data-t-hood]', 'שכונה', 'Neighbourhood');
    aria('[data-t-call]', 'התקשרו לשלומי, 054-350-0100', 'Call Shlomi, 054-350-0100');
    aria('[data-t-wa]', 'וואטסאפ לשלומי', 'WhatsApp Shlomi');
    $$('[data-decode]').forEach(function (d) { decode(d, true); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('sc-lang', l); } catch (e) {}
    texts(l); hours(); hoods(); sign(true); write(true); pathCap(); tick();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('sc-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-land]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-tilt]').forEach(function (f) { f.style.transform = ''; });
    if (!on) { pathK = Math.round(lastP); }
    sky.kick(); write(true); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [7.5, 22], 1: [7.5, 22], 2: [7.5, 22], 3: [7.5, 22], 4: [7.5, 22], 5: [7, 17], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  var isOpen = false;
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
    isOpen = open;
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
    lightBlock();
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }

  // the hours tile: a Haifa block whose windows are lit by the hour in Haifa right now
  var block = $('[data-block]'), wins = [];
  (function () {
    var wall = document.createElementNS(NS, 'rect'); wall.setAttribute('class', 'wall'); wall.setAttribute('x', 40); wall.setAttribute('y', 8); wall.setAttribute('width', 120); wall.setAttribute('height', 142); wall.setAttribute('rx', 3); block.appendChild(wall);
    for (var r = 0; r < 6; r++) for (var c = 0; c < 4; c++) {
      var w = document.createElementNS(NS, 'rect'); w.setAttribute('class', 'w');
      w.setAttribute('x', 52 + c * 26); w.setAttribute('y', 18 + r * 21); w.setAttribute('width', 18); w.setAttribute('height', 13); w.setAttribute('rx', 1.5);
      block.appendChild(w); wins.push(w);
    }
  })();
  var seed = wins.map(function () { return Math.random(); });
  function lightBlock() {
    var n = window.__now || now(), h = n.h, share = h >= 18 || h < 1 ? .75 : h < 6 ? .12 : h < 9 ? .4 : .22;
    if (isOpen) share = Math.max(share, .3);
    wins.forEach(function (w, i) { w.classList.toggle('lit', seed[i] < share); });
  }
  var blockOn = false;
  watch($('.t-hours'), function (v) { blockOn = v; });
  setInterval(function () { if (!blockOn || still()) return; var i = Math.floor(Math.random() * seed.length); seed[i] = Math.random(); lightBlock(); }, 1400);
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento, .rb-grid').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 70 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  // the review pages land, and lift again when you scroll back up past them
  $$('[data-land]').forEach(function (p) { watch(p, function (v) { if (v) p.classList.add('in'); else if (p.getBoundingClientRect().top > 0) p.classList.remove('in'); }, { rootMargin: '0px 0px -12% 0px' }); });

  // ---------------------------------------------------------------- headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').classList.contains('l2') ? 10 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // ---------------------------------------------------------------- labels that decode out of scrambled letters
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHKLMNOPRSTUVXZ' };
  function decode(el, instant) {
    var l = he() ? 'he' : 'en', txt = el.dataset[l], g = GL[l];
    cancelAnimationFrame(el._r);
    if (instant || still()) { el.textContent = txt; return; }
    var t0 = performance.now();
    (function st(t) {
      var k = Math.floor((t - t0) / 38), out = '';
      for (var i = 0; i < txt.length; i++) out += i < k - 4 || txt[i] === ' ' ? txt[i] : g[Math.floor(Math.random() * g.length)];
      el.textContent = out;
      if (k - 4 < txt.length) el._r = requestAnimationFrame(st); else el.textContent = txt;
    })(t0);
  }

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- the logo's rising columns, rebuilt from its own pixels as a skyline
  var sky = (function () {
    var cv = $('[data-skyline]'), c = cv.getContext('2d'), img = $('[data-logosrc]');
    var P = [], w, h, raf = 0, vis = true, t0 = 0, mx = -999, my = -999, ok = false, beam = -1;
    function sample() {
      try {
        var iw = 500, ih = 350, sc = document.createElement('canvas'); sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data, pts = [], minx = 1, miny = 1, maxx = 0, maxy = 0;
        for (var y = 0; y < ih; y += 2) for (var x = 0; x < iw; x += 2) {
          var k = (y * iw + x) * 4, r = d[k], g = d[k + 1], b = d[k + 2];
          var navy = b > r + 45 && b > 70, text = y > ih * .55 && x < iw * .79;
          if (navy && !text) { var u = x / iw, v = y / ih; pts.push([u, v]); minx = Math.min(minx, u); maxx = Math.max(maxx, u); miny = Math.min(miny, v); maxy = Math.max(maxy, v); }
        }
        var want = phone() ? 1300 : 2600, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) {
          var q = pts[Math.floor(f)];
          P.push({ hx: (q[0] - minx) / (maxx - minx), hy: (q[1] - miny) / (maxy - miny), x: 0, y: 0, vx: 0, vy: 0, ph: Math.random() * 6.28, win: Math.random() < .09, glow: Math.random() < .4 ? Math.random() : 0, dl: Math.random() * .5 });
        }
        ok = P.length > 50;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(now) {
      raf = 0; if (!ok) return;
      var calm = still(), T = (now - t0) / 1000;
      // the mark sits low and wide behind the title, on the side away from the portrait
      var bw = phone() ? w * .9 : innerWidth <= 900 ? w * .5 : Math.min(w * .3, 520), bh = bw * .78, ox = phone() ? w * .05 : innerWidth <= 900 ? (rtl() ? w * .02 : w * .48) : (rtl() ? .46 : .54) * w - bw / 2, oy = phone() ? h * .1 : h * .1;
      var hr = hero.getBoundingClientRect(), sink = calm ? 0 : clamp(-hr.top / hr.height, 0, 1);
      if (phone() && !calm) beam = ((T * .16) % 1.4) - .2;
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], rise = calm ? 1 : smooth((T - p.dl) / 1.4);
        var tx = ox + p.hx * bw, ty = oy + p.hy * bh + (1 - rise) * (h - oy - p.hy * bh + 30) + sink * bh * .25 * p.hy;
        if (calm) { p.x = tx; p.y = ty; }
        else {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 9000 && rise >= 1) { var f = (9000 - d2) / 9000 * 1.6, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
          if (rise < 1) { p.x = tx; p.y = ty; p.vx = p.vy = 0; }
          else { p.vx += (tx - p.x) * .07; p.vy += (ty - p.y) * .07; p.vx *= .8; p.vy *= .8; p.x += p.vx; p.y += p.vy; }
        }
        var lit = 0;
        if (p.win) {
          lit = calm ? (p.glow > .5 ? .9 : 0) : .5 + .5 * Math.sin(T * (.6 + p.glow) + p.ph);
          if (mx > -900) { var near = Math.hypot(p.x - mx, p.y - my); if (near < 140) lit = Math.max(lit, 1 - near / 140); }
          if (beam > -1) { var bx = Math.abs(p.hx - beam); if (bx < .12) lit = Math.max(lit, 1 - bx / .12); }
        }
        if (lit > .35) { c.globalAlpha = lit * .95; c.fillStyle = '#f2b25c'; c.fillRect(p.x - 2, p.y - 2, 4, 4); }
        else { c.globalAlpha = .62; c.fillStyle = '#4d6fb8'; c.fillRect(p.x - 1.4, p.y - 1.4, 2.8, 2.8); }
      }
      c.globalAlpha = 1;
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() { size(); sample(); t0 = performance.now(); kick(); }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // ---------------------------------------------------------------- real photos lean toward the hand (desktop)
  $$('[data-tilt]').forEach(function (f) {
    f.addEventListener('pointermove', function (e) {
      if (!fine.matches || still()) return;
      var r = f.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      f.style.transform = 'perspective(900px) rotateY(' + (x * 6).toFixed(2) + 'deg) rotateX(' + (-y * 6).toFixed(2) + 'deg)';
    });
    f.addEventListener('pointerleave', function () { f.style.transform = ''; });
  });

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 4) % 10; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- bento spotlight; the sale sign swings while the section is on screen
  var who = $('#who');
  watch(who, function (v) { who.classList.toggle('on', v); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- the path: one sticky scene, flown by the scroll (or stepped when motion is off)
  var path = $('[data-path]'), shots = $$('.shot', path), steps = $$('[data-pgo]'), forsale = $('[data-forsale]'), pcap = $('[data-pcap]');
  var pathK = 0, lastP = 0, capK = -1;
  var CAP = [
    { he: 'מרכז הכרמל · צילום: Deror avi, CC BY-SA 3.0', en: 'Carmel Center · photo: Deror avi, CC BY-SA 3.0' },
    { he: 'שדרות הנשיא וגן האם · צילום: Deror avi, CC BY-SA 3.0', en: 'Sderot HaNassi and Gan HaEm · photo: Deror avi, CC BY-SA 3.0' },
    { he: 'בניין בכרמל, תמונה להמחשה · צילום: Deror avi, CC BY-SA 3.0', en: 'A Carmel building, for illustration · photo: Deror avi, CC BY-SA 3.0' },
    { he: 'בניין בכרמל, תמונה להמחשה · צילום: Deror avi, CC BY-SA 3.0', en: 'A Carmel building, for illustration · photo: Deror avi, CC BY-SA 3.0' },
    { he: 'שולחן החתימה · מתוך תמונות העסק בגוגל', en: 'The signing table · from the business’s Google photos' }
  ];
  // where the balcony railing is inside the building photo (fractions of the image), so the sign hangs on it at any crop
  var RAIL = [.45, .585], BIMG = [1280, 960];
  function coverPoint(img, u, v, iw, ih) {
    var W = img.clientWidth, Hh = img.clientHeight, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s;
    return [img.offsetLeft + (W - dw) / 2 + dw * u, img.offsetTop + (Hh - dh) / 2 + dh * v];
  }
  function placeSign() {
    var fig = shots[2], pt = coverPoint($('img', fig), RAIL[0], RAIL[1], BIMG[0], BIMG[1]);
    forsale.style.left = (pt[0] - forsale.offsetWidth / 2) + 'px'; forsale.style.top = pt[1] + 'px';
    fig.dataset.fx = (pt[0] / fig.clientWidth).toFixed(3); fig.dataset.fy = ((pt[1] + forsale.offsetHeight * .5) / fig.clientHeight).toFixed(3);
  }
  function zoom(sh, s) { sh.style.transformOrigin = (+sh.dataset.fx * 100) + '% ' + (+sh.dataset.fy * 100) + '%'; sh.style.transform = 'scale(' + s.toFixed(4) + ')'; }
  function renderPath(P) {
    lastP = P;
    // each shot pushes in on its focal point, and the next one arrives on top of it while it is still fully there: no gap ever shows
    var a = smooth(P), b = smooth(P - 1), c2 = smooth((P - 2) / .9), d = smooth(P - 3);
    zoom(shots[0], 1 + 1.4 * a);
    var f1 = smooth((P - .5) / .5); shots[1].style.opacity = f1.toFixed(3);
    zoom(shots[1], (P < 1 ? lerp(1.3, 1, f1) : 1 + 1.6 * b));
    var f2 = smooth((P - 1.5) / .5); shots[2].style.opacity = f2.toFixed(3);
    zoom(shots[2], P < 2 ? lerp(1.3, 1, f2) : P < 3 ? 1 + .1 * c2 : 1.1 + 1.7 * d);
    var drop = smooth((P - 2.25) / .55);
    forsale.style.opacity = drop.toFixed(3);
    forsale.style.transform = 'translateY(' + ((1 - drop) * -60).toFixed(1) + 'px) rotate(' + (still() ? 0 : Math.sin(drop * Math.PI * 2.5) * (1 - drop) * 14).toFixed(2) + 'deg)';
    var f3 = smooth((P - 3.5) / .5); shots[3].style.opacity = f3.toFixed(3);
    zoom(shots[3], lerp(1.25, 1, f3) + (P > 4 ? .04 * smooth(P - 4) : 0));
    var k = clamp(Math.round(P), 0, 4);
    steps.forEach(function (s, i) { s.classList.toggle('on', i === k); s.setAttribute('aria-current', i === k ? 'step' : 'false'); });
    if (k !== capK) { capK = k; pathCap(); }
  }
  function pathCap() { if (capK < 0) return; pcap.dataset.he = CAP[capK].he; pcap.dataset.en = CAP[capK].en; decode(pcap); }
  function pathScrollTo(k) {
    var r = path.getBoundingClientRect(), top = scrollY + r.top + parseFloat(getComputedStyle(path).paddingTop), span = path.offsetHeight - parseFloat(getComputedStyle(path).paddingTop) - innerHeight;
    scrollTo({ top: top + span * (k / 4.4) + 2, behavior: 'smooth' });
  }
  steps.forEach(function (s) { s.addEventListener('click', function () { var k = +s.dataset.pgo; if (still()) { pathK = k; tick(); } else pathScrollTo(k); }); });
  $('[data-pprev]').addEventListener('click', function () { pathK = (pathK + 4) % 5; tick(); });
  $('[data-pnext]').addEventListener('click', function () { pathK = (pathK + 1) % 5; tick(); });

  // ---------------------------------------------------------------- the roller shutters in Shlomi's windows
  var facade = $('[data-facade]'), shutters = $$('.shutter', facade);

  // ---------------------------------------------------------------- compose: the sign is the form, the message writes itself
  var HOODS = [
    ['any', 'כל חיפה', 'anywhere in Haifa', 'בחיפה', 'in Haifa'],
    ['carmel', 'מרכז הכרמל', 'Carmel Center', 'במרכז הכרמל', 'in Carmel Center'],
    ['ahuza', 'אחוזה', 'Ahuza', 'באחוזה', 'in Ahuza'],
    ['carmelia', 'כרמליה', 'Carmelia', 'בכרמליה', 'in Carmelia'],
    ['denya', 'דניה', 'Denya', 'בדניה', 'in Denya'],
    ['neve', 'נווה שאנן', 'Neve Sha’anan', 'בנווה שאנן', 'in Neve Sha’anan'],
    ['romema', 'רוממה', 'Romema', 'ברוממה', 'in Romema'],
    ['hadar', 'הדר', 'Hadar', 'בהדר', 'in Hadar'],
    ['batgalim', 'בת גלים', 'Bat Galim', 'בבת גלים', 'in Bat Galim'],
    ['kh', 'קריית חיים', 'Kiryat Haim', 'בקריית חיים', 'in Kiryat Haim']
  ];
  var sel = $('[data-hood]'), modeB = $$('[data-mode]'), roomsV = $('[data-roomsv]'), rooms = 4, msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
  var cSteps = $$('[data-step]'), bigSign = $('[data-bigsign]');
  function hoods() {
    var v = sel.value || 'carmel', l = he();
    sel.innerHTML = HOODS.map(function (h) { return '<option value="' + h[0] + '">' + (l ? h[1] : h[2]) + '</option>'; }).join('');
    sel.value = v;
  }
  function mode() { return modeB.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0].dataset.mode; }
  function hood() { var v = sel.value; return HOODS.filter(function (h) { return h[0] === v; })[0] || HOODS[0]; }
  function roomsTxt(l) { var n = String(rooms); return l ? 'דירת ' + n + ' חדרים' : 'a ' + n + '-room apartment'; }
  function sign(instant) {
    var l = he(), m = mode(), hd = hood();
    $('[data-sw]').textContent = m === 'sell' ? (l ? 'למכירה' : 'For sale') : (l ? 'מחפשים' : 'Wanted');
    $('[data-sl]').textContent = (l ? roomsTxt(true) : rooms + ' rooms') + ' · ' + (hd[0] === 'any' ? (l ? 'חיפה' : 'Haifa') : (l ? hd[1] : hd[2]));
    roomsV.textContent = rooms;
    if (!instant && !still() && bigSign.animate) bigSign.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(2deg)' }, { transform: 'rotate(-.8deg)' }, { transform: 'rotate(0)' }], { duration: 900, easing: 'ease-out' });
  }
  function compose() {
    var l = he(), m = mode(), hd = hood();
    return l ? 'שלום שלומי, ' + (m === 'sell' ? 'אנחנו רוצים למכור ' : 'אנחנו מחפשים ') + roomsTxt(true) + ' ' + hd[3] + '. אשמח לדבר.'
             : 'Hi Shlomi, ' + (m === 'sell' ? 'we’d like to sell ' : 'we’re looking for ') + roomsTxt(false) + ' ' + hd[4] + '. Happy to talk.';
  }
  function lightStep(n) { cSteps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
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
  function change(step) { lightStep(step); sign(); write(); }
  modeB.forEach(function (b) { b.addEventListener('click', function () { modeB.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); change(0); }); });
  $$('[data-rooms]').forEach(function (b) { b.addEventListener('click', function () { rooms = clamp(rooms + (+b.dataset.rooms) * .5, 1.5, 7); change(1); }); });
  sel.addEventListener('change', function () { change(1); });
  $('[data-send]').addEventListener('pointerenter', function () { lightStep(2); });
  $('[data-send]').addEventListener('focus', function () { lightStep(2); });
  watch($('.chat'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- footer and the hanging sign
  var foot = $('[data-foot]'), hang = $('[data-hang]'), reachOn = false, footOn = false;
  watch(foot, function (v) { footOn = v; if (v) foot.classList.add('on'); else if (foot.getBoundingClientRect().top > 0) foot.classList.remove('on'); upHang(); });
  watch($('#reach'), function (v) { reachOn = v; upHang(); }, { rootMargin: '-20% 0px -20% 0px' });
  function upHang() { hang.classList.toggle('away', reachOn || footOn); }
  setTimeout(function () { hang.classList.add('nudge'); }, 3500);

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) sky.kick();
    // shutters roll up one after another as the facade comes up the screen
    var fr = facade.getBoundingClientRect();
    shutters.forEach(function (s, i) { s.style.setProperty('--roll', calm ? 1 : smooth((vh * .92 - fr.top) / (vh * .5) - i * .16).toFixed(3)); });
    // the path
    if (calm) renderPath(pathK);
    else {
      var r = path.getBoundingClientRect(), pad = parseFloat(getComputedStyle(path).paddingTop), span = Math.max(1, path.offsetHeight - pad - vh);
      renderPath(clamp((-(r.top + pad)) / span * 4.4, 0, 4.4));
    }
  }
  addEventListener('scroll', tick, { passive: true });
  function layout() { sky.size(); placeSign(); tick(); }
  addEventListener('resize', layout);

  // ---------------------------------------------------------------- start
  texts(root.lang === 'en' ? 'en' : 'he');
  hoods(); hours(); sign(true); write(true); layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); });
  addEventListener('load', layout);
  requestAnimationFrame(function () { hero.classList.add('ready'); $$('[data-decode]').forEach(function (d) { setTimeout(function () { decode(d); }, 700); }); });
})();
