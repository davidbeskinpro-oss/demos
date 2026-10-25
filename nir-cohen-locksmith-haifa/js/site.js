(function () {
  var root = document.documentElement, WA = '972505341100';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var TITLE = { he: 'ניר כהן · מנעולן · גולדמן 6, חיפה', en: 'Nir Cohen · Locksmith · 6 Goldman St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור ניר כהן - מנעולן בחיפה · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Nir Cohen – Locksmith in Haifa · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'ניר כהן, מנעולן', 'Nir Cohen, locksmith');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-call]', 'התקשרו לניר, 050-534-1100', 'Call Nir, 050-534-1100');
    aria('[data-q="what"] [role=radiogroup]', 'במה מדובר', 'What it is');
    aria('[data-q="need"] [role=radiogroup]', 'מה צריך', 'What’s needed');
    aria('[data-q="area"] [role=radiogroup]', 'איפה', 'Where');
    $$('.call').forEach(function (s) { var t = s.dataset[l]; s.setAttribute('aria-label', t); if (s.classList.contains('on')) $('.tag', s).textContent = t; });
    lockWord(lockOpen, true);
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('nc-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('nc-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    clearStyles(); layout(); filings.restart(); drum.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [7, 22], 1: [7, 22], 2: [7, 22], 3: [7, 22], 4: [7, 22], 5: [7, 16], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function isOpen(t, h) { return !!t && (t[0] === 0 && t[1] === 24 || (h >= t[0] && h < t[1])); }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (isOpen(t, n.h)) { open = true; txt = t[1] === 24 && t[0] === 0 ? (l ? 'פתוח עכשיו' : 'Open now') : (l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1])); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-padlock]').forEach(function (p) { p.classList.toggle('open', open); });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // consecutive days with the same hours share a row; the week starts on Sunday
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letters cut into spans so they can fill from cold steel to warm white
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 9 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var door = $('[data-door]'), leaf = $('[data-leaf]'), inside = $('[data-inside]'), nav = $('[data-nav]');
  var bolts = $$('[data-bolt]'), lever = $('[data-lever]'), kw = $('[data-kw]'), seam = $('[data-seam]'), sheen = $('[data-sheen]'), hint = $('[data-hint]'), inBg = $('.in-bg');
  var inRise = $$('[data-in-rise]');

  // ---------------------------------------------------------------- the lock word on the door: decodes out of scrambled glyphs
  var lockEl = $('[data-lockword]'), lockOpen = false, lockT = 0;
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHJKLMNOPRSTUVWXYZ' };
  function lockWord(open, instant) {
    var l = root.lang, txt = lockEl.dataset[l + (open ? 'B' : 'A')];
    lockOpen = open; lockEl.classList.toggle('open', open); clearInterval(lockT);
    if (instant || still()) { lockEl.textContent = txt; return; }
    var n = 0, g = GL[l];
    lockT = setInterval(function () {
      n++;
      lockEl.textContent = txt.split('').map(function (c, i) { return i < n / 2 ? c : g[Math.floor(Math.random() * g.length)]; }).join('');
      if (n / 2 >= txt.length) { clearInterval(lockT); lockEl.textContent = txt; }
    }, 40);
  }

  // ---------------------------------------------------------------- filings: steel and brass shavings gather into the real logo and follow the hand like a magnet
  var filings = (function () {
    var cv = $('[data-filings]'), c = cv.getContext('2d'), img = $('[data-logosrc]'), slot = $('[data-slot]');
    var P = [], w = 0, h = 0, raf = 0, vis = true, ok = false, t0 = 0, box = { x: 0, y: 0, s: 1 };
    var mx = -1e4, my = -1e4, lastMove = -1e4, dpr = 1;
    var COLS = ['#cdd2d8', '#8e959d', '#d6b46c', '#e4404f', '#fff0d2'];
    function sample() {
      try {
        var S = 220, sc = document.createElement('canvas'); sc.width = S; sc.height = S;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, S, S);
        var d = sx.getImageData(0, 0, S, S).data, pts = [];
        for (var y = 0; y < S; y += 2) for (var x = 0; x < S; x += 2) {
          var k = (y * S + x) * 4; if (d[k + 3] < 140) continue;
          pts.push([x / S, y / S, d[k] > 140 && d[k + 1] < 100 ? 3 : 0]);
        }
        var want = phone() ? 1700 : 2600, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) {
          var q = pts[Math.floor(f)], r = Math.random(), col = q[2] === 3 ? 3 : (r < .5 ? 0 : r < .78 ? 1 : 2);
          var base = (Math.random() - .5) * 1.1 + .5;
          P.push({ hx: q[0] + (Math.random() - .5) * .006, hy: q[1] + (Math.random() - .5) * .006, col: col, a: Math.random() * 6.28, base: base, L: 1.5 + Math.random() * 1.5, x: 0, y: 0, vx: 0, vy: 0, dl: Math.random() * .55, sx: Math.random(), sy: .6 + Math.random() * .6 });
        }
        ok = P.length > 50;
      } catch (e) { ok = false; }
      leaf.classList.toggle('particles', ok);
    }
    function size() {
      dpr = Math.min(2, devicePixelRatio || 1); w = leaf.clientWidth; h = leaf.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var x = 0, y = 0, el = slot; while (el && el !== leaf) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
      var s = slot.offsetWidth * .86; box = { x: x + (slot.offsetWidth - s) / 2, y: y + (slot.offsetHeight - s) / 2, s: s };
    }
    function angDiff(a, b) { var d = (b - a) % Math.PI; if (d > Math.PI / 2) d -= Math.PI; if (d < -Math.PI / 2) d += Math.PI; return d; }  // a filing has no head: mod π
    function frame(nowT) {
      raf = 0; if (!ok) return;
      var calm = still(), T = (nowT - t0) / 1000, sc = box.s / 420;
      if (calm) { c.clearRect(0, 0, w, h); return; }   // animations off: the real logo plate shows instead
      var auto = nowT - lastMove > 2200, gx = mx, gy = my, R = Math.max(80, box.s * .24), str = 1;
      if (auto && !calm) { gx = box.x + box.s * (.5 + Math.cos(T * .55) * .42); gy = box.y + box.s * (.48 + Math.sin(T * .9) * .4); str = .7; }
      var buckets = [[], [], [], [], []];
      for (var i = 0; i < P.length; i++) {
        var p = P[i], hx = box.x + p.hx * box.s, hy = box.y + p.hy * box.s;
        var e = smooth((T - p.dl) / 1.05);
        if (e < 1) {     // the opening: shavings poured in from below gather into the logo
          var fx = p.sx * w, fy = h * p.sy;
          p.x = lerp(fx, hx, e); p.y = lerp(fy, hy, e) - Math.sin(e * Math.PI) * h * .08; p.a = lerp(p.a, p.base, e * .2);
          buckets[e > .02 ? p.col : 4].push(p); continue;
        }
        var dx = gx - p.x, dy = gy - p.y, d = Math.sqrt(dx * dx + dy * dy), tx = hx, ty = hy, hot = false;
        if (d < R) {
          var f = (1 - d / R) * str;
          tx = hx + (gx - hx) * f * .3; ty = hy + (gy - hy) * f * .3;
          p.a += angDiff(p.a, Math.atan2(dy, dx)) * f * .35; hot = f > .55;
        } else p.a += angDiff(p.a, p.base) * .05;
        p.vx = (p.vx + (tx - p.x) * .09) * .78; p.vy = (p.vy + (ty - p.y) * .09) * .78;
        p.x += p.vx; p.y += p.vy;
        buckets[hot ? 4 : p.col].push(p);
      }
      c.clearRect(0, 0, w, h); c.lineCap = 'round';
      for (var b = 0; b < 5; b++) {
        var arr = buckets[b]; if (!arr.length) continue;
        c.strokeStyle = COLS[b]; c.lineWidth = b === 3 ? 1.5 : 1.2; c.globalAlpha = b === 1 ? .8 : 1; c.beginPath();
        for (var j = 0; j < arr.length; j++) {
          var q = arr[j], L = q.L * sc * (b === 4 ? 1.25 : 1), ca = Math.cos(q.a) * L, sa = Math.sin(q.a) * L;
          c.moveTo(q.x - ca, q.y - sa); c.lineTo(q.x + ca, q.y + sa);
        }
        c.stroke();
      }
      c.globalAlpha = 1;
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() { sample(); size(); P.forEach(function (p) { p.x = p.sx * w; p.y = p.sy * h; }); t0 = performance.now(); kick(); }
    leaf.addEventListener('pointermove', function (e) { var r = leaf.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; lastMove = performance.now(); });
    leaf.addEventListener('pointerdown', function (e) { var r = leaf.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; lastMove = performance.now(); kick(); });
    leaf.addEventListener('pointerleave', function () { lastMove = -1e4; });
    watch(door, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return {
      size: function () { if (ok) { size(); kick(); } },
      kick: kick,
      hide: function (v) { vis = !v && door.getBoundingClientRect().bottom > 0; if (vis) kick(); },
      restart: function () { if (!ok) return; t0 = performance.now() - 5000; size(); kick(); }
    };
  })();

  // ---------------------------------------------------------------- the drum behind the door: his pictures turn on it like the plug of a lock
  var drum = (function () {
    var wrap = $('[data-drumwrap]'), el = $('[data-drum]');
    $$('.dc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $$('img', k).forEach(function (i) { i.alt = ''; i.removeAttribute('data-alt-he'); }); el.appendChild(k); });
    var cards = $$('.dc', el), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = false, last = 0;
    function R() { var cw = cards[0].offsetWidth || 160; return Math.max(cw * 1.1 / (2 * Math.tan(Math.PI / N)), phone() ? 250 : innerWidth * .36); }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (9 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var r = R(), sc = scrollY * .05 * (rtl() ? 1 : -1);
      cards.forEach(function (c, i) {
        var a = rot + sc + i * step, f = Math.cos(a * Math.PI / 180), lift = f > .95 ? (f - .95) * 20 : 0;
        c.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + (r + lift * 40).toFixed(1) + 'px)';
        c.style.filter = 'brightness(' + (.28 + .72 * Math.pow(Math.max(f, 0), 1.5)).toFixed(3) + ')';
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    el.style.transform = 'rotateX(-6deg)';
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .25; vel = dx * 2 * (rtl() ? 1 : -1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    return { kick: kick, show: function (v) { if (v !== vis) { vis = v; if (v) kick(); } } };
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
  var odoIn = $$('.inside [data-odo]'), odoRest = $$('[data-odo]').filter(function (o) { return odoIn.indexOf(o) < 0; });
  $$('[data-odo]').forEach(function (o) { roll(o, still()); });
  odoRest.forEach(function (o) { if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true); });
  var odoDone = false;

  // ---------------------------------------------------------------- work: callouts typed onto each photo
  var cards = $$('[data-sc]');
  function placeCalls() {
    cards.forEach(function (sc) {
      var fig = $('[data-fig]', sc), W = fig.clientWidth, Hh = fig.clientHeight, iw = +fig.dataset.iw, ih = +fig.dataset.ih;
      var s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s, ox = (W - dw) / 2, oy = (Hh - dh) / 2, kz = still() ? 1 : (+sc._kz || 1.06);
      var cx = W * +fig.dataset.ox, cy = Hh * +fig.dataset.oy;
      $$('.call', fig).forEach(function (sp) {
        var x = ox + dw * +sp.dataset.x, y = oy + dh * +sp.dataset.y;
        x = cx + (x - cx) * kz; y = cy + (y - cy) * kz;
        sp.style.left = x.toFixed(1) + 'px'; sp.style.top = y.toFixed(1) + 'px';
        sp.hidden = x < 30 || x > W - 30 || y < 60 || y > Hh - 110;
        sp.classList.toggle('edge-l', x < 110); sp.classList.toggle('edge-r', x > W - 110);
      });
      $('img', fig).style.transformOrigin = (+fig.dataset.ox * 100) + '% ' + (+fig.dataset.oy * 100) + '%';
    });
  }
  function typeTag(sp, on) {
    var tag = $('.tag', sp), txt = sp.dataset[he() ? 'he' : 'en'];
    if (on === sp.classList.contains('on')) return;
    sp.classList.toggle('on', on); clearInterval(sp._t);
    if (!on) { tag.textContent = ''; return; }
    if (still()) { tag.textContent = txt; return; }
    var i = 0; tag.textContent = '';
    sp._t = setInterval(function () { tag.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(sp._t); }, 38);
  }
  $$('.call').forEach(function (sp) {
    sp.addEventListener('mouseenter', function () { sp._hover = true; typeTag(sp, true); });
    sp.addEventListener('mouseleave', function () { sp._hover = false; tick(); });
    sp.addEventListener('click', function () { sp._pinned = !sp.classList.contains('on'); typeTag(sp, sp._pinned); });
  });

  // ---------------------------------------------------------------- message: three choices, the plate is engraved
  var WHAT = {
    home: { he: ['דלת הבית', 'בדלת הבית'], en: ['the front door', 'on the front door'] },
    office: { he: ['דלת המשרד', 'בדלת המשרד'], en: ['the office door', 'on the office door'] },
    car: { he: ['הרכב', 'ברכב'], en: ['my car', 'on my car'] },
    safe: { he: ['הכספת', 'בכספת'], en: ['my safe', 'on my safe'] }
  };
  var NEED = { open: { he: 'פתיחת ', en: 'opening ' }, cyl: { he: 'החלפת צילינדר ', en: 'a new cylinder ' }, install: { he: 'התקנת מנעול ', en: 'fitting a lock ' }, replace: { he: 'החלפת מנעול ', en: 'replacing the lock ' } };
  var AREA = { he: ['בחיפה', 'בקריות', 'בטבעון', 'ביקנעם', 'בעכו', 'בנשר', 'בטירת כרמל'], en: ['in Haifa', 'in the Krayot', 'in Tivon', 'in Yokneam', 'in Akko', 'in Nesher', 'in Tirat Carmel'] };
  var qs = $$('[data-q]'), msgEl = $('[data-msg]'), engr = $('.engr'), shown = '', typing = 0, plateSeen = false;
  function val(q) { var b = $('[data-q="' + q + '"] [aria-checked="true"]'); return b ? b.dataset.v : null; }
  qs.forEach(function (q) {
    var bs = $$('[role=radio]', q);
    bs.forEach(function (b) { b.addEventListener('click', function () { bs.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); q.classList.add('on'); write(); }); });
    q.addEventListener('keydown', function (e) {
      var k = e.key, i = bs.indexOf(document.activeElement); if (i < 0) return;
      var d = k === 'ArrowDown' || k === (rtl() ? 'ArrowLeft' : 'ArrowRight') ? 1 : k === 'ArrowUp' || k === (rtl() ? 'ArrowRight' : 'ArrowLeft') ? -1 : 0;
      if (!d) return; e.preventDefault(); var n = bs[(i + d + bs.length) % bs.length]; n.focus(); n.click();
    });
  });
  function compose() {
    var l = he() ? 'he' : 'en', w = WHAT[val('what')][l], n = val('need'), task = n === 'open' ? NEED.open[l] + w[0] : NEED[n][l] + w[1], area = AREA[l][+val('area')];
    return l === 'he' ? 'שלום ניר, אשמח לעזרה: ' + task + ', ' + area + '.' : 'Hi Nir, I’d like help with ' + task + ', ' + area + '.';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !plateSeen) { shown = target; msgEl.textContent = target; engr.classList.remove('cut'); return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    engr.classList.add('cut');
    (function st(t) {
      var n = Math.floor((t - t0) / 22);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st); else engr.classList.remove('cut');
    })(t0);
  }
  watch($('[data-plate]'), function (v) { if (v && !plateSeen) { plateSeen = true; qs[0].classList.add('on'); if (!still()) { shown = ''; msgEl.textContent = ''; write(); } } }, { threshold: .5 });

  // ---------------------------------------------------------------- bento: a lamp under the hand; living tiles only while seen
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); t.classList.add('lit'); });
    t.addEventListener('pointerleave', function () { t.classList.remove('lit'); });
  });
  $$('.t-areas,.t-pay').forEach(function (t) { watch(t, function (v) { t.classList.toggle('on', v); }); });

  // the brass key leans toward the hand; on phones it drifts with the scroll
  var kf = $('[data-keyfig]');
  kf.addEventListener('pointermove', function (e) { if (still()) return; var r = kf.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; kf.style.setProperty('--ty', ((x - .5) * 10).toFixed(2) + 'deg'); kf.style.setProperty('--tx', ((.5 - y) * 8).toFixed(2) + 'deg'); kf.style.setProperty('--px', ((.5 - x) * 16).toFixed(1) + 'px'); kf.style.setProperty('--py', ((.5 - y) * 12).toFixed(1) + 'px'); kf.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); kf.style.setProperty('--gy', (y * 100).toFixed(1) + '%'); kf._hand = true; });
  kf.addEventListener('pointerleave', function () { kf._hand = false; ['--tx', '--ty', '--px', '--py'].forEach(function (k) { kf.style.removeProperty(k); }); });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var revs = $('[data-revs]'), row = $('[data-row]'), rail = $('[data-rail]'), main = $('#main'), fglow = $('[data-fglow]');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function clearStyles() {
    [leaf, inBg, row, fglow, inside, kf].forEach(function (el) { el.removeAttribute('style'); });
    bolts.forEach(function (b) { b.removeAttribute('style'); }); lever.removeAttribute('style'); kw.removeAttribute('style');
    inRise.forEach(function (el) { el.style.opacity = ''; el.style.transform = ''; });
    cards.forEach(function (c) { c.style.transform = ''; c.style.removeProperty('--dim'); $('img', c).style.removeProperty('--kz'); });
    seam.style.opacity = ''; hint.style.opacity = '';
  }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, sgn = rtl() ? 1 : -1;
    nav.classList.toggle('pill', scrollY > 40);

    // the door: key turns, handle goes down, bolts slide back, the light grows in the gap, the leaf swings open
    var dr = door.getBoundingClientRect(), p = calm ? 1 : clamp(-dr.top / Math.max(1, dr.height - vh), 0, 1);
    if (!calm) {
      var u1 = smooth((p - .03) / .2), bw = phone() ? 22 : 32;
      kw.style.setProperty('--kr', (u1 * 90).toFixed(1) + 'deg');
      lever.style.setProperty('--lr', (sgn * 32 * smooth((p - .1) / .12)).toFixed(2) + 'deg');
      var allBack = 0;
      bolts.forEach(function (b, i) { var t = smooth((p - .06 - i * .05) / .12); allBack += t; b.style.setProperty('--bx', (t * bw).toFixed(1) + 'px'); });
      if ((allBack > 2.5) !== lockOpen) lockWord(allBack > 2.5);
      seam.style.opacity = (.25 + .75 * allBack / 3).toFixed(3);
      var u2 = smooth((p - .3) / .42), ang = u2 * 104;
      leaf.style.transform = ang > .05 ? 'rotateY(' + (sgn * -1 * ang).toFixed(2) + 'deg)' : '';
      leaf.style.setProperty('--shade', (u2 * .7).toFixed(3));
      leaf.style.visibility = ang > 96 ? 'hidden' : '';
      sheen.style.setProperty('--sx', (lerp(-30, 60, u2)).toFixed(1) + '%');
      hint.style.opacity = clamp(1 - p * 10, 0, 1).toFixed(2);
      inside.style.visibility = p < .26 ? 'hidden' : '';
      inBg.style.setProperty('--inz', lerp(1.18, 1.0, smooth((p - .22) / .7)).toFixed(4));
      inRise.forEach(function (el, i) { var t = smooth((p - .5 - i * .06) / .2); el.style.opacity = t.toFixed(3); el.style.transform = t < 1 ? 'translateY(' + ((1 - t) * 30).toFixed(1) + 'px)' : ''; });
      if (!odoDone && p > .62) { odoDone = true; odoIn.forEach(function (o) { roll(o, true); }); }
      if (odoDone && p < .4) { odoDone = false; odoIn.forEach(function (o) { roll(o, false); }); }
      filings.hide(ang > 90);
      drum.show(p > .32 && dr.bottom > 0);
    } else { drum.show(false); if (!lockOpen) lockWord(false, true); }

    // work: each plate lands, the one beneath steps back into the dark
    var stickBase = (phone() ? 10 : 18) + nav.offsetHeight;
    cards.forEach(function (sc, i) {
      var r = sc.getBoundingClientRect(), nx = cards[i + 1], cover = 0;
      if (!calm && nx) { var nr = nx.getBoundingClientRect().top, top = stickBase + (i + 1) * (phone() ? 10 : 14); cover = clamp(1 - (nr - top) / r.height, 0, 1); }
      if (!calm) {
        sc.style.transform = cover > 0 ? 'scale(' + (1 - cover * .06).toFixed(4) + ')' : '';
        sc.style.setProperty('--dim', (cover * .6).toFixed(3));
        sc._kz = 1 + .1 * clamp(r.top / vh, 0, 1);
        $('img', sc).style.setProperty('--kz', sc._kz.toFixed(4));
      }
      var front = calm || (r.top < vh * .7 && r.bottom > vh * .3 && cover < .45);
      $$('.call', sc).forEach(function (sp, k) { if (sp._hover || sp._pinned) return; if (front && !sp._wait) { sp._wait = setTimeout(function () { sp._wait = 0; typeTag(sp, true); }, calm ? 0 : 250 + k * 260); } else if (!front) { clearTimeout(sp._wait); sp._wait = 0; typeTag(sp, false); } });
    });
    if (!calm) placeCalls();

    // reviews drift past as the section goes by
    if (!calm) {
      var rr = revs.getBoundingClientRect(), range = Math.max(0, row.scrollWidth - rail.clientWidth), pr = smooth(clamp((vh - rr.top) / (vh + rr.height * .7), 0, 1));
      row.style.setProperty('--rx', (sgn * range * pr).toFixed(1) + 'px');
    }

    if (!calm && !kf._hand) { var kr = kf.getBoundingClientRect(), kp = clamp((vh - kr.top) / (vh + kr.height), 0, 1); kf.style.setProperty('--gx', (10 + kp * 80).toFixed(1) + '%'); kf.style.setProperty('--gy', (20 + kp * 50).toFixed(1) + '%'); kf.style.setProperty('--py', ((kp - .5) * -24).toFixed(1) + 'px'); }
    // the light under the door widens as the footer is uncovered
    var mb = main.getBoundingClientRect().bottom, fh = fglow.parentNode.offsetHeight, fp = calm ? 1 : smooth((vh - mb) / Math.max(1, fh));
    fglow.style.setProperty('--fg', (.15 + .85 * fp).toFixed(3));
  }

  function layout() { filings.size(); placeCalls(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { leaf.classList.add('ready'); filings.size(); tick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1000);
  addEventListener('load', function () { layout(); });
})();
