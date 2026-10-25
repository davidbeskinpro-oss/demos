(function () {
  var root = document.documentElement, WA = '972543696653';
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
  var TITLE = { he: 'שלומי כהן · עיצוב שיער · קומוי 9, חיפה', en: 'Shlomi Cohen · Hair design · 9 Komoy St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור שלומי כהן - עיצוב שיער · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Shlomi Cohen Hair Design · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';

  // ---------------------------------------------------------------- glyph decode: a label settles out of scrambled letters
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'abcdefghijklmnopqrstuvwxyz' };
  function decode(el, txt) {
    clearInterval(el._dt);
    if (still()) { el.textContent = txt; return; }
    var set = GL[he() ? 'he' : 'en'], n = 0, steps = 14;
    el._dt = setInterval(function () {
      n++;
      var k = Math.floor(txt.length * n / steps);
      el.textContent = txt.slice(0, k) + txt.slice(k).replace(/[^\s·,\/\-–]/g, function () { return set[Math.floor(Math.random() * set.length)]; });
      if (n >= steps) { clearInterval(el._dt); el.textContent = txt; }
    }, 34);
  }

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'שלומי כהן - עיצוב שיער', 'Shlomi Cohen Hair Design');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-visit]', 'ביקור ויצירת קשר', 'Visit and contact');
    aria('[data-t-who]', 'בשביל מי', 'Who it’s for');
    aria('[data-t-fan]', 'מה עושים', 'What to do');
    aria('[data-t-call]', 'התקשרו לשלומי, 054-369-6653', 'Call Shlomi, 054-369-6653');
    aria('[data-t-wa]', 'וואטסאפ לשלומי', 'WhatsApp Shlomi');
    $$('[data-glyph]').forEach(function (g) { g.textContent = g.dataset[l]; });
    $$('.co').forEach(function (c) { if (c.classList.contains('on')) $('b', c).textContent = c.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('sc121-lang', l); } catch (e) {}
    texts(l); hours(); buildWeek(); ribbon.build(); fields(true); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('sc121-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    hero.classList.add('ready');
    resetStill(); layout(); strands.kick(); light.kick(); dust.kick(); write(true);
  }); });
  motionUI();
  function resetStill() {
    if (!still()) return;
    $$('.mc').forEach(function (c) { c.style.transform = ''; c.style.filter = ''; });
    $$('[data-rv]').forEach(function (c) { c.style.transform = ''; c.style.filter = ''; });
    sheet.style.transform = '';
    $$('.co').forEach(function (c) { setCo(c, true); });
    loupe.classList.remove('on');
  }

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 18], 1: null, 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [8, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function isOpenAll() { for (var k = 0; k < 7; k++) if (!H[k] || H[k][0] !== 0 || H[k][1] !== 24) return false; return true; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (isOpenAll()) { open = true; txt = l ? 'פתוח 24/7' : 'Open 24/7'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    var fr = $('[data-front]'); if (fr) fr.classList.toggle('open', open);
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // consecutive days with the same hours share a row; the week starts on Sunday
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? (t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>') : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento, .vb').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline: letter by letter, out of a blur
  $$('[data-split] span[lang]').forEach(function (sp) {
    var i = sp.closest('.acc') ? 10 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), shears = $('[data-shears]');

  // ---------------------------------------------------------------- the sign's three lines as strands of hair, combed apart under the hand
  var strands = (function () {
    var cv = $('[data-strands]'), c = cv.getContext('2d'), w = 0, h = 0, raf = 0, vis = true, t0 = performance.now();
    var S = [], mx = -999, my = -999, autoT = 0, STEP = 14;
    var COL = ['230,179,184', '233,201,143', '184,132,143'];
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var per = phone() ? 8 : 13, pts = Math.ceil(w / STEP) + 2; S = [];
      for (var b = 0; b < 3; b++) for (var j = 0; j < per; j++) S.push({ b: b, j: j, per: per, ph: Math.random() * .6, dy: new Float32Array(pts), a: .18 + Math.random() * .34 });
    }
    function baseY(s, x, T) {
      var b = s.b, by = h * (phone() ? [.16, .5, .84][b] : [.2, .52, .84][b]);
      return by + Math.sin(x / w * 5.4 + b * 1.7 + T * .32 + s.ph) * h * .055 + Math.sin(x / w * 12 + T * .5 + s.j * .21) * 6 + (s.j - s.per / 2) * (phone() ? 2.6 : 3.2);
    }
    function frame(now) {
      raf = 0;
      var calm = still(), T = calm ? 0 : (now - t0) / 1000;
      // on touch screens a comb passes across by itself every few seconds
      var cx = mx, cy = my;
      if (!calm && !fine.matches && mx < -900) {
        var u = ((now - autoT) % 6500) / 4200;
        if (u < 1) { cx = rtl() ? w * (1.1 - u * 1.2) : w * (-.1 + u * 1.2); cy = h * (.5 + Math.sin(u * 6.28) * .28); }
      }
      c.clearRect(0, 0, w, h);
      c.lineWidth = 1.15; c.lineCap = 'round';
      for (var i = 0; i < S.length; i++) {
        var s = S[i], dy = s.dy;
        c.strokeStyle = 'rgba(' + COL[s.b] + ',' + s.a.toFixed(3) + ')';
        c.beginPath();
        for (var k = 0, x = -STEP; k < dy.length; k++, x += STEP) {
          var y = baseY(s, x, T);
          if (!calm) {
            var ddx = x - cx, ddy = y - cy, d = Math.sqrt(ddx * ddx + ddy * ddy), R = phone() ? 80 : 120, tgt = 0;
            if (d < R) tgt = (ddy >= 0 ? 1 : -1) * (R - d) * .75;
            dy[k] += (tgt - dy[k]) * (tgt ? .22 : .06);
            y += dy[k];
          }
          if (k === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.stroke();
      }
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') { mx = my = -999; } });
    watch(hero, function (v) { vis = v; kick(); });
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- the mirror: a warm light wakes the photo, labels settle where it lands
  var glass = $('.m-glass'), cos = $$('.co');
  function setCo(c, on) {
    if (on === c.classList.contains('on')) return;
    c.classList.toggle('on', on);
    var b = $('b', c);
    if (on) decode(b, c.dataset[he() ? 'he' : 'en']); else { clearInterval(b._dt); b.textContent = ''; }
  }
  function placeCos() {
    var W = glass.clientWidth, Hh = glass.clientHeight, iw = 1500, ih = 1125, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s, ox = (W - dw) * .52, oy = (Hh - dh) * .5;
    cos.forEach(function (c) {
      var x = ox + dw * +c.dataset.x, y = oy + dh * +c.dataset.y;
      c.style.left = x + 'px'; c.style.top = y + 'px'; c._x = x; c._y = y;
      c.classList.toggle('flip', x > W * .55);
      c.hidden = x < 8 || x > W - 8 || y < 8 || y > Hh - 8;
    });
  }
  var light = (function () {
    var raf = 0, vis = true, px = -1, py = -1, t0 = performance.now(), pinned = 0;
    function frame(now) {
      raf = 0; if (still()) { cos.forEach(function (c) { setCo(c, true); }); return; }
      var W = glass.clientWidth, Hh = glass.clientHeight, x, y;
      if (px >= 0 && (fine.matches || now - pinned < 2600)) { x = px; y = py; }
      else { var T = (now - t0) / 1000; x = W * (.5 + Math.sin(T * .42) * .32); y = Hh * (.52 + Math.sin(T * .61 + 1) * .26); }
      glass.style.setProperty('--lx', x.toFixed(1) + 'px'); glass.style.setProperty('--ly', y.toFixed(1) + 'px');
      glass.style.setProperty('--lr', Math.round(Math.max(W, Hh) * .36) + 'px');
      var R = Math.max(W, Hh) * .24;
      cos.forEach(function (c) { var d = Math.hypot(c._x - x, c._y - y); setCo(c, d < R); });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    glass.addEventListener('pointermove', function (e) { var r = glass.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
    glass.addEventListener('pointerleave', function () { if (fine.matches) px = py = -1; });
    glass.addEventListener('pointerdown', function (e) { var r = glass.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; pinned = performance.now(); });
    watch(hero, function (v) { vis = v; kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- opening: the awning rolls up (motion on, once per visit, tap to skip)
  var opening = $('[data-opening]');
  function ready() { hero.classList.add('ready'); }
  function endOpening() {
    root.classList.add('op-up');
    try { sessionStorage.setItem('sc121-open', '1'); } catch (e) {}
    setTimeout(ready, 260);
    setTimeout(function () { root.classList.remove('opening', 'op-in', 'op-up'); }, 820);
  }
  if (root.classList.contains('opening')) {
    requestAnimationFrame(function () { root.classList.add('op-in'); });
    var ot = setTimeout(endOpening, 950);
    opening.addEventListener('click', function () { clearTimeout(ot); endOpening(); });
  }

  // ---------------------------------------------------------------- the ribbon seam: services written along the sign's lines, scissors travel along it
  var ribbon = (function () {
    var box = $('[data-ribbon]'), svg = $('[data-rbsvg]'), sc = $('[data-rbsc]'), ba = $('.bl-a', sc), bb = $('.bl-b', sc);
    var W = 0, Hh = 0, clip, words = [];
    var WORDS = { he: ['תספורת', 'צבע', 'גוונים', 'תלתלים', 'פן', 'גברים', 'ילדים'], en: ['Cuts', 'Colour', 'Highlights', 'Curls', 'Blow-dry', 'Men', 'Kids'] };
    function mid(x) { return Hh * .55 + Math.sin(x / W * 6.28 * (phone() ? .8 : 1.15) + .5) * Hh * .2; }
    function build() {
      W = box.clientWidth; Hh = box.clientHeight; if (!W) return;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh);
      var off = phone() ? [-9, 0, 9] : [-13, 0, 13], cls = ['l1', 'l2', 'l3'], html = '<defs><clipPath id="rbclip"><rect data-rbclip x="0" y="-40" width="0" height="' + (Hh + 80) + '"/></clipPath></defs><g clip-path="url(#rbclip)">';
      for (var l = 0; l < 3; l++) {
        var d = '';
        for (var x = -10; x <= W + 10; x += 8) { var y = mid(x) + off[l] + Math.sin(x / 90 + l) * 2.5; d += (x === -10 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1); }
        html += '<path class="rb-line ' + cls[l] + '" d="' + d + '"/>';
      }
      var list = WORDS[he() ? 'he' : 'en'].slice(0, phone() ? (he() ? 5 : 4) : 7), n = list.length;
      list.forEach(function (wd, i) {
        var f = (i + .5) / n, x = rtl() ? W * (1 - f) : W * f, y = mid(x) - (phone() ? 20 : 28), a = Math.atan2(mid(x + 4) - mid(x - 4), 8) * 180 / Math.PI;
        html += '<text class="rb-text" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="middle" transform="rotate(' + a.toFixed(2) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')">' + wd + '</text>';
      });
      html += '</g>';
      svg.innerHTML = html;
      clip = $('[data-rbclip]', svg);
    }
    function set(p) {
      if (!clip) return;
      var xc = rtl() ? W * (1.04 - p * 1.08) : W * (-.04 + p * 1.08);
      if (rtl()) { clip.setAttribute('x', xc.toFixed(1)); clip.setAttribute('width', Math.max(0, W - xc + 20).toFixed(1)); }
      else { clip.setAttribute('x', '-20'); clip.setAttribute('width', Math.max(0, xc + 20).toFixed(1)); }
      var y = mid(xc), a = Math.atan2(mid(xc + 4) - mid(xc - 4), 8) * 180 / Math.PI, sw = sc.offsetWidth, sh = sc.offsetHeight;
      sc.style.transform = 'translate(' + (xc - sw / 2).toFixed(1) + 'px,' + (y - sh / 2).toFixed(1) + 'px) rotate(' + a.toFixed(2) + 'deg)' + (rtl() ? ' scaleX(-1)' : '');
      var open = still() ? 10 : Math.abs(Math.sin(xc / 26)) * 16;
      ba.style.transform = 'rotate(' + (-open).toFixed(1) + 'deg)'; bb.style.transform = 'rotate(' + open.toFixed(1) + 'deg)';
      sc.style.opacity = still() || p > .995 ? '0' : '1';
    }
    return { build: build, set: set, box: box };
  })();

  // ---------------------------------------------------------------- the salon: his photos dealt like cards into a slowly turning arc of mirrors
  var arc = (function () {
    var wrap = $('[data-arcwrap]'), el = $('[data-arc]');
    $$('.mc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $$('img', k).forEach(function (i) { i.alt = ''; i.removeAttribute('data-alt-he'); i.removeAttribute('data-alt-en'); }); el.appendChild(k); });
    var cards = $$('.mc', el), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, lx = 0, ly = 0, raf = 0, vis = false, last = 0, deal = 0, moved = false;
    var ROT = [-9, 6, -4, 10, -2, 7];
    function R() { var cw = cards[0].offsetWidth || 180; return Math.max(cw * 1.1 / (2 * Math.tan(Math.PI / N)), phone() ? 270 : innerWidth * .36); }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (7 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var r = R(), sc = scrollY * .05 * (rtl() ? 1 : -1), e = smooth(deal);
      cards.forEach(function (c, i) {
        var a = (rot + sc + i * step) % 360, f = Math.cos(a * Math.PI / 180), lift = f > .96 ? (f - .96) * 25 : 0;
        c.style.transform = 'rotateY(' + (a * e).toFixed(2) + 'deg) translateZ(' + (r * e + lift * 40 * e).toFixed(1) + 'px) translateY(' + ((1 - e) * (40 - i * 2)).toFixed(1) + 'px) rotateZ(' + ((1 - e) * ROT[i % 6]).toFixed(2) + 'deg)';
        c.style.filter = 'brightness(' + lerp(1, .32 + .68 * Math.pow(Math.max(f, 0), 1.5), e).toFixed(3) + ')';
        c.style.zIndex = e < .5 ? i : '';
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    el.style.transform = 'rotateX(-8deg)';
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; moved = false; lx = e.clientX; ly = e.clientY; });
    addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - lx;
      if (!moved && Math.abs(e.clientY - ly) > Math.abs(dx) + 6) { drag = false; return; }   // a vertical swipe scrolls the page
      moved = true; wrap.classList.add('drag'); lx = e.clientX; rot += dx * .22; vel = dx * 2 * (rtl() ? 1 : -1);
    });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    watch(wrap, function (v) { vis = v; if (v) kick(); });
    return { kick: kick, setDeal: function (d) { deal = d; }, wrap: wrap };
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
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 180) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- services: living tiles, a rose light under the hand
  var svc = $('[data-svc]'), sheet = $('[data-sheet]');
  watch(svc, function (v) { svc.classList.toggle('on', v); });
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); t.classList.add('lit');
      if (t.classList.contains('t-cut') && !still()) { t.style.setProperty('--px', (((e.clientX - r.left) / r.width - .5) * -18).toFixed(1) + 'px'); t.style.setProperty('--py', (((e.clientY - r.top) / r.height - .5) * -12).toFixed(1) + 'px'); } });
    t.addEventListener('pointerleave', function () { t.classList.remove('lit'); t.style.setProperty('--px', '0px'); t.style.setProperty('--py', '0px'); });
  });

  // ---------------------------------------------------------------- before / after: the light wipe and the loupe
  var hv = $('[data-hvfig]'), loupe = $('[data-loupe]'), tags = $$('.hv-tag', hv), hvIn = false;
  var lp = { x: -1, y: -1, pin: 0, t0: performance.now(), raf: 0 };
  function hvGeom() { var W = hv.clientWidth, Hh = hv.clientHeight, s = Math.max(W / 1000, Hh / 1688), dw = 1000 * s, dh = 1688 * s; return { W: W, H: Hh, dw: dw, dh: dh, ox: (W - dw) * .5, oy: (Hh - dh) * .2 }; }
  function placeLoupe(x, y) {
    var g = hvGeom(), Z = 2.3, L = loupe.offsetWidth;
    loupe.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    loupe.style.backgroundImage = 'url(img/curls.jpg)';
    loupe.style.backgroundSize = (g.dw * Z).toFixed(0) + 'px ' + (g.dh * Z).toFixed(0) + 'px';
    loupe.style.backgroundPosition = (-((x - g.ox) * Z - L / 2)).toFixed(1) + 'px ' + (-((y - g.oy) * Z - L / 2)).toFixed(1) + 'px';
  }
  function loupeFrame(now) {
    lp.raf = 0; if (!hvIn) return;
    var g = hvGeom();
    if (lp.x >= 0 && (fine.matches || now - lp.pin < 3000)) { placeLoupe(lp.x, lp.y); loupe.classList.add('on'); }
    else if (!fine.matches && !still()) {
      var T = (now - lp.t0) / 1000;
      placeLoupe(g.ox + g.dw * (.5 + Math.sin(T * .45) * .24), g.oy + g.dh * (.5 + Math.sin(T * .7) * .1)); loupe.classList.add('on');
    } else loupe.classList.remove('on');
    if (!still() || lp.x >= 0) lp.raf = requestAnimationFrame(loupeFrame);
  }
  function kickLoupe() { if (!lp.raf) lp.raf = requestAnimationFrame(loupeFrame); }
  hv.addEventListener('pointermove', function (e) { var r = hv.getBoundingClientRect(); lp.x = e.clientX - r.left; lp.y = e.clientY - r.top; if (e.pointerType !== 'mouse') lp.pin = performance.now(); kickLoupe(); });
  hv.addEventListener('pointerdown', function (e) { var r = hv.getBoundingClientRect(); lp.x = e.clientX - r.left; lp.y = e.clientY - r.top; lp.pin = performance.now(); kickLoupe(); });
  hv.addEventListener('pointerleave', function () { if (fine.matches) { lp.x = lp.y = -1; loupe.classList.remove('on'); } });
  watch(hv, function (v) { hvIn = v; if (v) kickLoupe(); });
  var tagShown = [false, false];
  function showTag(i, on) { if (tagShown[i] === on) return; tagShown[i] = on; var t = tags[i]; if (on) { t.style.opacity = '1'; decode(t, t.dataset[he() ? 'he' : 'en']); } else t.style.opacity = '0'; }

  // ---------------------------------------------------------------- book: the live composer
  var book = $('[data-book]'), valance = $('[data-valance] i');
  var steps = $$('[data-step]'), whos = $$('[data-who]'), whats = $$('[data-what]'), when = null;
  var SLOTS = [{ he: 'בוקר', en: 'Morning', mhe: 'בבוקר', men: 'morning', a: 9, b: 12 }, { he: 'צהריים', en: 'Midday', mhe: 'בצהריים', men: 'midday', a: 12, b: 15 }, { he: 'אחה״צ', en: 'Afternoon', mhe: 'אחר הצהריים', men: 'afternoon', a: 15, b: 18 }];
  var DSH = { he: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'] };
  function lightStep(n) { steps.forEach(function (s, i) { if (i === n) s.classList.add('on'); }); }
  function buildWeek() {
    var l = he() ? 'he' : 'en';
    $('[data-weekhead]').innerHTML = '<th></th>' + DSH[l].map(function (d, i) { return '<th scope="col" title="' + (l === 'he' ? dayHe[i] : dayEn[i]) + '">' + d + '</th>'; }).join('');
    $('[data-weekbody]').innerHTML = SLOTS.map(function (s, si) {
      return '<tr><th scope="row" class="rowh">' + s[l] + '</th>' + [0, 1, 2, 3, 4, 5].map(function (d) {
        var t = H[d], ok = t && s.a < t[1] && s.b > t[0];
        if (!ok) return '<td><span class="closed">' + (l === 'he' ? 'סגור' : 'Closed') + '</span></td>';
        var on = when && when[0] === d && when[1] === si;
        return '<td><button type="button" aria-pressed="' + (on ? 'true' : 'false') + '" data-slot="' + d + ',' + si + '" aria-label="' + (l === 'he' ? 'יום ' + dayHe[d] + ' ' + s.mhe : dayEn[d] + ' ' + s.men) + '"></button></td>';
      }).join('') + '</tr>';
    }).join('');
    $$('[data-slot]').forEach(function (b) { b.addEventListener('click', function () {
      var v = b.dataset.slot.split(',').map(Number), same = when && when[0] === v[0] && when[1] === v[1];
      when = same ? null : v;
      $$('[data-slot]').forEach(function (x) { x.setAttribute('aria-pressed', !same && x === b ? 'true' : 'false'); });
      lightStep(2); fields(); write();
    }); });
  }
  whos.forEach(function (b) { b.addEventListener('click', function () { whos.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lightStep(0); fields(); write(); }); });
  whats.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); lightStep(1); fields(); write(); }); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function picks() {
    var l = he(), w = whos.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0];
    var what = whats.filter(function (x) { return x.getAttribute('aria-pressed') === 'true'; });
    return { l: l, who: w, what: what.map(function (x) { return x.dataset[l ? 'he' : 'en']; }), whatShort: what.map(function (x) { return $('span[lang="' + (l ? 'he' : 'en') + '"]', x).textContent; }) };
  }
  var fWho = $('[data-f-who]'), fWhat = $('[data-f-what]'), fWhen = $('[data-f-when]');
  function fields(instant) {
    var p = picks(), l = p.l;
    var vals = [
      $('span[lang="' + (l ? 'he' : 'en') + '"]', p.who).textContent,
      p.whatShort.length ? p.whatShort.join(' · ') : '—',
      when ? (l ? dayHe[when[0]] + ', ' + SLOTS[when[1]].he : dayEn[when[0]] + ', ' + SLOTS[when[1]].men) : (l ? 'עוד לא נבחר' : 'Not chosen yet')
    ];
    [fWho, fWhat, fWhen].forEach(function (el, i) { if (el._v === vals[i]) return; el._v = vals[i]; if (instant) el.textContent = vals[i]; else decode(el, vals[i]); });
  }
  function compose() {
    var p = picks(), l = p.l, who = p.who.dataset[l ? 'he' : 'en'];
    if (l) {
      var s = 'היי שלומי, אשמח לקבוע תור' + (p.what.length ? ': ' + list(p.what, true) : '') + ', ' + who + '. ';
      s += when ? 'הכי נוח לי ביום ' + dayHe[when[0]] + ' ' + SLOTS[when[1]].mhe + '.' : 'מתי יש לך מקום?';
      return s;
    }
    var e = 'Hi Shlomi, I’d like to book' + (p.what.length ? ': ' + list(p.what, false) : ' a chair') + ', ' + who + '. ';
    e += when ? dayEn[when[0]] + ' ' + SLOTS[when[1]].men + ' suits me best.' : 'When do you have a spot?';
    return e;
  }
  var msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
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
  watch($('[data-appt]'), function (v) {
    if (!v || chatSeen) return; chatSeen = true;
    if (still()) { lightStep(0); lightStep(1); return; }
    shown = ''; msgEl.textContent = ''; write();
    setTimeout(function () { lightStep(0); }, 300); setTimeout(function () { lightStep(1); }, 800);
  }, { threshold: .35 });

  // ---------------------------------------------------------------- reviews: mirrors that surface and catch the light; lean toward the hand
  var rvs = $$('[data-rv]');
  rvs.forEach(function (c) {
    c.addEventListener('pointermove', function (e) { if (!fine.matches || still()) return; var r = c.getBoundingClientRect(); c._tx = ((e.clientY - r.top) / r.height - .5) * -7; c._ty = ((e.clientX - r.left) / r.width - .5) * 9; tick(); });
    c.addEventListener('pointerleave', function () { c._tx = c._ty = 0; tick(); });
  });

  // ---------------------------------------------------------------- footer: specks gather into the sign's own lines, then the real sign settles in
  var foot = $('[data-foot]'), page = $('#main');
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), img = $('[data-flogo]'), P = [], ok = false, w = 0, h = 0, raf = 0, g = 0, t0 = performance.now();
    function sample() {
      try {
        var iw = 300, ih = Math.round(300 * img.naturalHeight / img.naturalWidth), sc = document.createElement('canvas'); sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data, pts = [];
        for (var y = 0; y < ih; y += 2) for (var x = 0; x < iw; x += 2) { var k = (y * iw + x) * 4; if (d[k + 3] > 200 && d[k] + d[k + 1] + d[k + 2] < 420) pts.push([x / iw, y / ih]); }
        var want = phone() ? 700 : 1400, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) { var q = pts[Math.floor(f)]; P.push({ hx: q[0], hy: q[1], sx: Math.random(), sy: Math.random(), ph: Math.random() * 6.28, col: Math.random() < .5 ? '230,179,184' : '233,201,143' }); }
        ok = P.length > 0;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(now) {
      raf = 0; c.clearRect(0, 0, w, h); if (!ok || still()) return;
      var T = (now - t0) / 1000, lw = img.offsetWidth, lh = img.offsetHeight, ox = (w - lw) / 2, oy = (h - lh) / 2, e = smooth(g / .9), fade = smooth((g - .85) / .15);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], tx = ox + p.hx * lw, ty = oy + p.hy * lh, x = lerp(p.sx * w, tx, e) + Math.sin(T * 1.4 + p.ph) * (1 - e) * 10, y = lerp(p.sy * h, ty, e) + Math.cos(T * 1.1 + p.ph) * (1 - e) * 10;
        c.fillStyle = 'rgba(' + p.col + ',' + ((.35 + .5 * e) * (1 - fade * .85)).toFixed(3) + ')';
        c.fillRect(x - 1, y - 1, 2.2, 2.2);
      }
      if (g > 0) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && ok) raf = requestAnimationFrame(frame); }
    function start() { size(); sample(); kick(); }
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) size(); }, set: function (v) { g = v; foot.classList.toggle('gathered', v > .82); if (v > 0) kick(); } };
  })();

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false, halves = $('[data-halves]');
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    shears.classList.toggle('show', calm || scrollY > vh * .5);
    // ribbon seam
    var rr = ribbon.box.getBoundingClientRect();
    ribbon.set(calm ? 1 : clamp((vh * .95 - rr.top) / (vh * .7), 0, 1));
    // deal into the arc
    var ar = arc.wrap.getBoundingClientRect();
    arc.setDeal(calm ? 1 : clamp((vh * .98 - ar.top) / (vh * .6), 0, 1)); if (!calm) arc.kick();
    // the services sheet rides up and lands
    if (!calm) {
      var sr = svc.getBoundingClientRect(), k = smooth((vh - sr.top) / (vh * .75));
      sheet.style.transform = 'translateY(' + ((1 - k) * 110).toFixed(1) + 'px) scale(' + (.93 + .07 * k).toFixed(4) + ')';
    }
    // before/after light wipe
    var hr = hv.getBoundingClientRect(), wp = calm ? 1 : smooth((vh * .9 - hr.top) / (hr.height * .95));
    hv.style.setProperty('--wipe', (wp * 100).toFixed(2) + '%');
    showTag(0, calm || wp > .3); showTag(1, calm || wp > .82);
    // the valance comes down over the appointment book
    var br = book.getBoundingClientRect(), vk = calm ? 1 : smooth((vh - br.top) / (vh * .45));
    valance.style.setProperty('--vy', ((vk - 1) * 100).toFixed(1) + '%');
    valance.style.setProperty('--vx', calm ? '0px' : (scrollY * .25 % 92).toFixed(1) + 'px');
    // reviews surface one by one
    rvs.forEach(function (c, i) {
      if (calm) { c.style.transform = ''; c.style.filter = ''; c.classList.add('landed'); return; }
      var r = c.getBoundingClientRect(), t = smooth((vh * .98 - r.top - i * 30) / (vh * .38));
      c.style.transform = 'perspective(1000px) translateY(' + ((1 - t) * 90).toFixed(1) + 'px) rotateX(' + ((1 - t) * 14 + (c._tx || 0)).toFixed(2) + 'deg) rotateY(' + (c._ty || 0).toFixed(2) + 'deg)';
      c.style.filter = t < 1 ? 'blur(' + ((1 - t) * 6).toFixed(2) + 'px)' : '';
      c.style.opacity = (.2 + .8 * t).toFixed(3);
      if (t > .96) c.classList.add('landed'); else if (t < .2) c.classList.remove('landed');
    });
    // footer curtain: how much of the footer is uncovered
    var pr = page.getBoundingClientRect(), fh = foot.offsetHeight;
    foot.style.visibility = pr.bottom < vh + 40 ? 'visible' : 'hidden';   // never peeks behind the transparent top bar
    dust.set(calm ? 1 : clamp((vh - pr.bottom) / (fh * .75), 0, 1));
  }

  function layout() { strands.size(); placeCos(); ribbon.build(); dust.size(); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); lw = innerWidth; }, 140); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); buildWeek(); fields(true); write(true); layout();
  if (still()) { resetStill(); }
  if (!root.classList.contains('opening')) {
    var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(ready); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    setTimeout(go, 400);
  }
  addEventListener('load', function () { layout(); });
})();
