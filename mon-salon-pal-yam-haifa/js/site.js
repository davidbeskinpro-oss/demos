(function () {
  var root = document.documentElement, WA = '972542890111';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth <= 700; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'Mon Salon · סלון יופי · שדרות פל ים 11, חיפה', en: 'Mon Salon · Beauty salon · 11 Sderot Pal-Yam, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Mon Salon · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Mon Salon · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-visit]', 'יצירת קשר', 'Contact');
    aria('[data-t-picks]', 'טיפולים', 'Treatments');
    aria('[data-t-days]', 'יום', 'Day');
    aria('[data-t-parts]', 'מתי', 'When');
    aria('[data-t-call]', 'התקשרו לסלון, 054-289-0111', 'Call the salon, 054-289-0111');
    aria('[data-t-wa]', 'וואטסאפ לסלון', 'WhatsApp the salon');
    tags.forEach(function (t) { if (t.classList.contains('on')) $('b', t).textContent = t.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('mon-lang', l); } catch (e) {}
    splitTitle(); texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('mon-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-mirror]').forEach(function (el) { el.classList.add('in'); });
    clearStyles(); layout(); sign.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours, Haifa time. null = closed
  var H = { 0: [9, 18], 1: null, 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
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
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento,.vb').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-mirror]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline: letter by letter
  var titleSrc = $$('[data-split] .ln > span[lang]').map(function (sp) { return [sp, sp.textContent]; });
  function splitTitle() {
    titleSrc.forEach(function (pair) {
      var sp = pair[0], i = sp.closest('.ln').previousElementSibling ? 16 : 0;
      sp.innerHTML = pair[1].split(' ').map(function (w) {
        return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  }
  splitTitle();

  var hero = $('[data-hero]'), nav = $('[data-nav]'), hphoto = $('[data-hphoto]');
  // the photo's framing; the same numbers place the sign's particles and the door
  function op() { return phone() ? [.74, .3] : [.5, .3]; }
  function cover(W, Hh, iw, ih, o) { var s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s; return { s: s, x: (W - dw) * o[0], y: (Hh - dh) * o[1] }; }

  // ---------------------------------------------------------------- the sign switches on: its own pixels fly in and settle on the letters in the photo
  var sign = (function () {
    var cv = $('[data-signfield]'), c = cv.getContext('2d'), img = $('[data-signsrc]');
    var P = [], w, h, raf = 0, vis = true, t0 = 0, mx = -999, my = -999, ok = false, map;
    function sample() {
      try {
        var iw = 340, ih = 290, sc = document.createElement('canvas'); sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data, pts = [];
        for (var y = 0; y < ih; y += 2) for (var x = 0; x < iw; x += 2) {
          var k = (y * iw + x) * 4, r = d[k], g = d[k + 1], b = d[k + 2], mxv = Math.max(r, g, b), mnv = Math.min(r, g, b);
          if (mnv > 222 && mxv - mnv < 14) pts.push([x, y, 1]); else if (mxv < 95) pts.push([x, y, 0]);
        }
        var want = phone() ? 1300 : 2400, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) { var q = pts[Math.floor(f)]; P.push({ ix: 930 + q[0], iy: 20 + q[1], face: q[2], x: Math.random(), y: Math.random(), vx: 0, vy: 0, ph: Math.random() * 6.28, dl: Math.random() * .8, sx: undefined }); }
        ok = true;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); map = cover(w, h, 1600, 1200, op()); P.forEach(function (p) { p.sx = undefined; }); }
    function frame(nowT) {
      raf = 0; if (!ok) return;
      var calm = still(), T = (nowT - t0) / 1000, hr = hero.getBoundingClientRect(), burst = calm ? 0 : clamp(-hr.top / (hr.height * .8), 0, 1);
      c.clearRect(0, 0, w, h); var sz = Math.max(1.8, map.s * 2.2);
      var settle = smooth((T - 1.9) / 1.2), land = clamp((T - 1.7) / 1.6, 0, 1);
      // the sign "switches on": a soft rose halo blooms behind the letters once the pixels land
      if (!calm && land > 0 && land < 1) {
        var gx = map.x + 1100 * map.s, gy = map.y + 160 * map.s, gr = 260 * map.s * (0.6 + land);
        var gg = c.createRadialGradient(gx, gy, 0, gx, gy, gr); gg.addColorStop(0, 'rgba(255,214,222,' + (.5 * Math.sin(Math.PI * land)).toFixed(3) + ')'); gg.addColorStop(1, 'rgba(255,214,222,0)');
        c.fillStyle = gg; c.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
      }
      for (var i = 0; i < P.length; i++) {
        var p = P[i], a = calm ? 1 : smooth((T - p.dl) / 1.5);
        var tx = map.x + p.ix * map.s, ty = map.y + p.iy * map.s;
        if (burst > 0) { tx += Math.sin(p.ph * 3) * burst * w * .5; ty -= (0.3 + (p.ph / 6.28)) * burst * h * .9; }
        if (calm) { p.x = tx; p.y = ty; }
        else if (a < 1) { if (p.sx === undefined) { p.sx = p.x * w; p.sy = p.y * h; } p.x = lerp(p.sx, tx, a); p.y = lerp(p.sy, ty, a); }
        else {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 9000) { var f = (9000 - d2) / 9000 * 3, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
          p.vx += (tx - p.x) * .07; p.vy += (ty - p.y) * .07; p.vx *= .8; p.vy *= .8; p.x += p.vx; p.y += p.vy;
        }
        // in flight: every pixel shows; landed: only a few twinkle on the letters, and any the hand pushes away
        var moved = Math.abs(p.x - tx) + Math.abs(p.y - ty), tw = Math.sin(T * 1.7 + p.ph * 9);
        var al = calm ? (p.face && tw > .9 ? .8 : 0) : Math.max(1 - settle, clamp(moved / 30, 0, 1), tw > .93 ? (tw - .93) * 14 : 0);
        if (al < .02) continue;
        c.globalAlpha = Math.min(1, al) * (1 - burst * .5);
        c.fillStyle = p.face ? '#fff4ee' : '#f3b3c0';
        var s2 = a < 1 ? sz * 2 : sz * 1.3;
        c.fillRect(p.x - s2 / 2, p.y - s2 / 2, s2, s2);
      }
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() { size(); sample(); t0 = performance.now(); kick(); }
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
      if (e.pointerType === 'mouse') { hero.style.setProperty('--px', ((mx / r.width) * 2 - 1).toFixed(3)); hero.style.setProperty('--py', ((my / r.height) * 2 - 1).toFixed(3)); }
    });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // ---------------------------------------------------------------- inside: through the door, along their room
  var inside = $('[data-inside]'), stage = $('[data-istage]'), room = $('[data-iroom]'), front = $('[data-ifront]'), flies = $$('[data-fly] i'), tags = $$('[data-tags] .tag'), icopy = $('[data-icopy]');
  var GLY = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'abcdefghijklmnopqrstuvwxyz' };
  function decode(t) {
    var b = $('b', t), txt = t.dataset[he() ? 'he' : 'en'];
    if (still()) { b.textContent = txt; return; }
    var set = GLY[he() ? 'he' : 'en'], n = 0; clearInterval(t._t);
    t._t = setInterval(function () {
      n++; var keep = Math.floor(n / 14 * txt.length);
      b.textContent = txt.split('').map(function (ch, i) { return i < keep || ch === ' ' ? ch : set[Math.floor(Math.random() * set.length)]; }).join('');
      if (keep >= txt.length) { clearInterval(t._t); b.textContent = txt; }
    }, 34);
  }
  function showTag(t, on) {
    if (on === t.classList.contains('on')) return;
    t.classList.toggle('on', on); clearInterval(t._t);
    if (on) decode(t); else $('b', t).textContent = '';
  }
  function placeTags(ox, oy, rw, rh, W, Hh, visible) {
    var limit = Hh - (icopy.offsetHeight || 0) * (still() ? 0 : .8);
    tags.forEach(function (t) {
      var x = ox + rw * +t.dataset.x, y = oy + rh * +t.dataset.y, inView = x > 20 && x < W - 20 && y > (still() ? 10 : 70) && y < limit - 10;
      t.style.left = x.toFixed(1) + 'px'; t.style.top = y.toFixed(1) + 'px';
      t.classList.toggle('flip', x > W * .58);
      showTag(t, visible && inView);
    });
  }
  function insideFrame() {
    var W = stage.clientWidth, Hh = stage.clientHeight;
    if (still()) {
      W = room.clientWidth; Hh = room.clientHeight; stage.style.setProperty('--rh', Hh + 'px');
      var m = cover(W, Hh, 1600, 709, phone() ? [.2, .5] : [.5, .5]);
      placeTags(m.x, m.y, 1600 * m.s, 709 * m.s, W, Hh, true); return;
    }
    var p = prog(inside), o = op();
    // 1. walk up to the glass door of the shopfront
    var fm = cover(W, Hh, 1600, 1200, o), door = [fm.x + 1075 * fm.s, fm.y + 690 * fm.s];
    var z = lerp(1, 3.4, Math.pow(smooth(p / .34), 1.3));
    front.style.transformOrigin = door[0].toFixed(1) + 'px ' + door[1].toFixed(1) + 'px';
    front.style.transform = 'scale(' + z.toFixed(4) + ')';
    front.style.opacity = (1 - smooth((p - .2) / .15)).toFixed(3);
    // 2. the room: settles from close up, then the camera travels along it
    var rh = Math.max(Hh, W / 2.257) * 1.06, rw = rh * 2.257;
    room.style.width = rw.toFixed(0) + 'px'; room.style.height = rh.toFixed(0) + 'px';
    var sc = lerp(1.3, 1, smooth((p - .18) / .26)), pan = smooth((p - .36) / .6), tx = -(rw - W) * pan, ty = -(rh - Hh) / 2;
    var Tx = W / 2 * (1 - sc) + tx * sc, Ty = Hh / 2 * (1 - sc) + ty * sc;
    room.style.transform = 'translate3d(' + Tx.toFixed(1) + 'px,' + Ty.toFixed(1) + 'px,0) scale(' + sc.toFixed(4) + ')';
    // 3. their tinted panes slide past the camera
    flies.forEach(function (f, i) {
      var t = clamp((p - (.12 + i * .07)) / .24, 0, 1), s = lerp(.35, 4.2, t * t), x = (i - 1) * 34 * t;
      f.style.opacity = t <= 0 || t >= 1 ? '0' : (Math.sin(Math.PI * t) * .62).toFixed(3);
      f.style.transform = 'translate3d(' + x.toFixed(1) + 'vw,' + ((i - 1) * 6 * t).toFixed(1) + 'vh,0) scale(' + s.toFixed(3) + ') rotate(' + ((i - 1) * 4) + 'deg)';
    });
    stage.style.setProperty('--cp', smooth((p - .5) / .14).toFixed(3));
    placeTags(Tx, Ty, rw * sc, rh * sc, W, Hh, p > .42);
  }

  // ---------------------------------------------------------------- the window: spotlight and the shine on the work
  $$('.tile,.vt').forEach(function (t) {
    t.addEventListener('pointermove', function (e) {
      var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px');
      if (e.pointerType === 'mouse') { t._hov = true; t.style.setProperty('--sx', lerp(-60, 60, (e.clientX - r.left) / r.width).toFixed(1) + '%'); }
    });
    t.addEventListener('pointerleave', function () { t._hov = false; tick(); });
  });
  var shineTiles = $$('.t-hair,.t-nails');
  var cyc = $$('[data-cycle] li'), ci = 0, winOn = false;
  watch($('#window'), function (v) { winOn = v; });
  function cycle() { cyc.forEach(function (li, i) { li.classList.toggle('on', still() || i === ci); }); }
  setInterval(function () { if (!winOn || still()) return; ci = (ci + 1) % cyc.length; cycle(); }, 1700);
  cycle();

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : 0; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting && es[0].boundingClientRect.left < innerWidth && es[0].boundingClientRect.right > 0) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- work: sideways run
  var work = $('[data-work]'), track = $('[data-wtrack]'), wcs = $$('.wc', track), bar = $('[data-wbar]').parentNode;
  function workSize() {
    if (still()) { work.style.removeProperty('--wh'); return; }
    var extra = Math.max(0, track.scrollWidth - innerWidth);
    work.style.setProperty('--wh', (innerHeight + extra * 1.1) + 'px');
  }
  function workFrame() {
    if (still()) return;
    var p = prog(work), extra = Math.max(0, track.scrollWidth - innerWidth), x = extra * p * (rtl() ? 1 : -1);
    track.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
    bar.style.setProperty('--wp', p.toFixed(3));
    var W = innerWidth, best = null, bd = 1e9;
    wcs.forEach(function (c) {
      var r = c.getBoundingClientRect(), cx = r.left + r.width / 2, d = Math.abs(cx - W / 2);
      if (d < bd) { bd = d; best = c; }
      var im = $('img', c); if (im) { im.parentNode.style.setProperty('--ix', ((cx - W / 2) * -.06).toFixed(1) + 'px'); }
    });
    wcs.forEach(function (c) { var on = c === best; c.classList.toggle('mid', on); c.style.transform = on ? 'translateY(-8px)' : ''; });
  }
  $$('.wp').forEach(function (w) { var im = $('img', w); im.style.transform = 'translateX(var(--ix,0px))'; });

  // ---------------------------------------------------------------- mirrors: the light runs round the frame, a reflection follows the hand
  var mirrors = $$('[data-mirror]');
  function mirrorSize() { mirrors.forEach(function (m) { var r = $('.led rect', m); r.setAttribute('x', 3); r.setAttribute('y', 3); r.setAttribute('width', Math.max(0, m.offsetWidth - 6)); r.setAttribute('height', Math.max(0, m.offsetHeight - 6)); }); }
  mirrors.forEach(function (m) { m.addEventListener('pointermove', function (e) { var r = m.getBoundingClientRect(); m.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); m.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); }); });

  // ---------------------------------------------------------------- book: the note on the glass writes itself
  var picks = $$('[data-pick]'), days = $$('[data-day]'), parts = $$('[data-part]'), late = $('[data-late]'), msgEl = $('[data-msg]'), send = $('[data-send]'), steps = $$('[data-step]');
  var shown = '', typing = 0, seen = false;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  picks.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); lightStep(0); write(); }); });
  function radio(group, b) { group.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); }
  days.forEach(function (b) { b.addEventListener('click', function () {
    radio(days, b); var fri = b.dataset.day === '5'; late.disabled = fri;
    if (fri && late.getAttribute('aria-checked') === 'true') radio(parts, parts[0]);
    lightStep(1); write();
  }); });
  parts.forEach(function (b) { b.addEventListener('click', function () { radio(parts, b); lightStep(1); write(); }); });
  ['pointerenter', 'focus'].forEach(function (ev) { send.addEventListener(ev, function () { lightStep(2); }); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), chosen = picks.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return l ? 'ל' + b.dataset.he : b.dataset.en; });
    var d = +days.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0].dataset.day;
    var part = parts.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0].dataset[l ? 'he' : 'en'];
    return l ? 'שלום, אשמח לקבוע תור' + (chosen.length ? ' ' + list(chosen, true) : '') + ' ביום ' + dayHe[d] + ' ' + part + '.'
             : 'Hi, I’d like to book ' + (chosen.length ? list(chosen, false) : 'an appointment') + ' on ' + dayEn[d] + ', ' + part + '.';
  }
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
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
  watch($('[data-glass]'), function (v) { if (v && !seen) { seen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- footer curtain + the name rising
  var foot = $('[data-foot]'), page = $('#main'), fword = $('[data-fword]');
  fword.innerHTML = fword.textContent.split('').map(function (c, i) { return c === ' ' ? ' ' : '<span class="fl" style="--i:' + i + '" aria-hidden="true">' + c + '</span>'; }).join('');
  var handle = $('[data-handle]');

  // ---------------------------------------------------------------- one scroll loop
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, y = scrollY;
    nav.classList.toggle('pill', y > 40);
    if (!calm) {
      sign.kick();
      if (matchMedia('(hover: none)').matches) { hero.style.setProperty('--px', (Math.sin(y / 160) * .8).toFixed(3)); hero.style.setProperty('--py', '0'); }
    }
    insideFrame();
    workFrame();
    shineTiles.forEach(function (t) { if (t._hov) return; var r = t.getBoundingClientRect(); t.style.setProperty('--sx', calm ? '-60%' : lerp(70, -70, clamp((r.top + r.height / 2) / vh, 0, 1)).toFixed(1) + '%'); });
    var docH = document.documentElement.scrollHeight, fh = foot.offsetHeight;
    foot.classList.toggle('up', calm || y + vh > docH - fh * .7);
    handle.classList.toggle('show', y > vh * .6 && y + vh < docH - fh * .5);
  }
  function clearStyles() {
    [front, room].concat(flies, wcs).forEach(function (el) { el.style.transform = ''; el.style.opacity = ''; });
    room.style.width = room.style.height = ''; track.style.transform = '';
  }
  function layout() {
    var o = op(); hphoto.style.setProperty('--op', o[0] * 100 + '% ' + o[1] * 100 + '%'); front.style.setProperty('--op', o[0] * 100 + '% ' + o[1] * 100 + '%');
    sign.size(); workSize(); mirrorSize();
    page.style.setProperty('--fh', foot.offsetHeight + 'px');
    tick();
  }
  var rz, lastW = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); }, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { go(); layout(); });
  setTimeout(go, 1200);
  addEventListener('load', layout);
})();
