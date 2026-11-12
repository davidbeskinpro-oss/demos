(function () {
  var root = document.documentElement, WA = '972542560459';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 900; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'סלון רומן · עיצוב שיער · הרצל 4, טירת כרמל', en: 'Salon Roman · Hair design · 4 Herzl St, Tirat Carmel' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור סלון רומן - עיצוב שיער · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Roman Hair Salon · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'סלון רומן', 'Salon Roman');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-who]', 'בשביל מי', 'Who is it for');
    aria('[data-t-what]', 'מה עושים', 'What would you like');
    aria('[data-t-day]', 'יום', 'Day');
    aria('[data-t-part]', 'שעה ביום', 'Time of day');
    aria('[data-t-rail]', 'ביקורות', 'Reviews');
    $$('[data-decode]').forEach(function (d) { $('.dt', d).textContent = d.dataset[l]; });
    $$('[data-call] b').forEach(function (b) { b.textContent = b.dataset[l]; });
    $('.v-map iframe').title = l === 'he' ? 'מפת גוגל: הרצל 4, טירת כרמל' : 'Google Maps: 4 Herzl St, Tirat Carmel';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('roman-lang', l); } catch (e) {}
    texts(l); days(); hours(); write(true); split(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('roman-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-call]').forEach(function (c) { c.classList.add('on'); });
    rail(); layout(); sign.kick(); dust.kick(); room.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [10, 19], 1: [10, 19], 2: [10, 19], 3: [10, 19], 4: [10, 19], 5: [10, 15], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function allDay(t) { return t && t[0] === 0 && t[1] === 24; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, short, open = false;
    if (allDay(t)) { open = true; txt = short = l ? 'פתוח עכשיו' : 'Open now'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); short = txt; }
    else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); short = l ? 'נפתח היום ב-' + hhmm(t[0]) : 'Opens today ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      if (!H[nd]) { txt = short = l ? 'סגור עכשיו' : 'Closed now'; }
      else if (nd === (n.d + 1) % 7) { txt = l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]); short = l ? 'נפתח מחר ב-' + hhmm(H[nd][0]) : 'Opens tomorrow ' + hhmm(H[nd][0]); }
      else { txt = l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]); short = l ? 'נפתח ביום ' + dayHe[nd] : 'Opens ' + dayEn[nd]; }
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-status-mini]').forEach(function (el) { el.textContent = short; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // consecutive days with the same hours share a row; the week starts on Sunday
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], d = [], k; for (k = r[0]; k <= r[1]; k++) d.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = allDay(t) ? (l ? '24 שעות' : '24 hours') : t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + d.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento,.vbento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  $$('.qa details').forEach(function (d, i) { d.style.setProperty('--d', i * 70 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- letters: the hero headline arrives letter by letter; the colour headline fills with the scroll
  function splitEl(sp, start) {
    if (!sp.dataset.raw) sp.dataset.raw = sp.innerHTML;
    var i = start, tmp = document.createElement('div'); tmp.innerHTML = sp.dataset.raw;
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var html = c.textContent.split(' ').map(function (w) { return w ? '<span class="w">' + w.split('').map(function (ch) { return '<span class="ch" style="--i:' + (i++) + '">' + ch + '</span>'; }).join('') + '</span>' : ''; }).join(' ');
          var s = document.createElement('span'); s.innerHTML = html; node.replaceChild(s, c);
        } else walk(c);
      });
    })(tmp);
    sp.innerHTML = tmp.innerHTML; return i;
  }
  var fillChars = [];
  function split() {
    var i = 0;
    $$('[data-split] .ln').forEach(function (ln) { $$(':scope > span[lang], :scope > em > span[lang]', ln).forEach(function (sp) { if (sp.lang === root.lang) i = splitEl(sp, i); }); });
    $$('[data-fill] > span[lang]').forEach(function (sp) { if (sp.lang === root.lang) splitEl(sp, 0); });
    fillChars = $$('[data-fill] > span[lang=' + root.lang + '] .ch');
  }

  // ---------------------------------------------------------------- labels decode out of scrambled glyphs
  var GL = 'אבגדהוזחטיכלמנסעפצקרשת0123456789';
  function decode(d) {
    var el = $('.dt', d), txt = d.dataset[root.lang];
    if (still()) { el.textContent = txt; return; }
    var t0 = performance.now(), dur = 700;
    (function st(t) {
      var u = clamp((t - t0) / dur, 0, 1), n = Math.floor(u * txt.length);
      el.textContent = txt.slice(0, n) + txt.slice(n).replace(/[^\s·&]/g, function () { return GL[Math.floor(Math.random() * GL.length)]; });
      if (u < 1) requestAnimationFrame(st); else el.textContent = txt;
    })(t0);
  }
  $$('[data-decode]').forEach(function (d, i) { watch(d, function (v) { if (v && !d._seen) { d._seen = 1; setTimeout(function () { decode(d); }, 300 + i * 120); } }); });

  // ---------------------------------------------------------------- the hero: a lamp on the brick wall that follows the hand
  var hero = $('[data-hero]'), nav = $('[data-nav]'), heroOn = true, ptr = { x: -1, y: -1, t: 0 };
  hero.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect(); ptr.x = (e.clientX - r.left) / r.width; ptr.y = (e.clientY - r.top) / r.height; ptr.t = performance.now();
    if (!still()) { hero.style.setProperty('--lx', (ptr.x * 100).toFixed(1) + '%'); hero.style.setProperty('--ly', (ptr.y * 100).toFixed(1) + '%'); }
    sign.kick(); dust.kick();
  });
  hero.addEventListener('pointerleave', function () { ptr.x = -1; });
  watch(hero, function (v) { heroOn = v; sign.kick(); dust.kick(); });

  // ---------------------------------------------------------------- gold dust made of the logo's own gold (the R, the scissors, the number)
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), img = $('[data-logosrc]'), P = [], F = [], w, h, raf = 0, t0 = 0, ok = false, mx = -999, my = -999;
    // only the ROMAN word of the sign (its gold R and white letters), so the dust spells his name
    var CX = 0, CY = 0, CW = 380, CH = 92, IW = 380, IH = 92;
    function sample() {
      try {
        var sc = document.createElement('canvas'); sc.width = IW; sc.height = IH;
        var sx = sc.getContext('2d'); sx.drawImage(img, CX, CY, CW, CH, 0, 0, IW, IH);
        var d = sx.getImageData(0, 0, IW, IH).data, pts = [];
        for (var y = 0; y < IH; y++) for (var x = 0; x < IW; x++) {
          var k = (y * IW + x) * 4, r = d[k], g = d[k + 1], b = d[k + 2];
          var gold = r > 140 && r - b > 60 && g > 90 && r >= g, white = r > 185 && g > 185 && b > 175;
          if (gold) pts.push([x / IW, y / IH, r, g, b]); else if (white) pts.push([x / IW, y / IH, 241, 217, 162]);
        }
        var want = phone() ? 1100 : 2200, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) { var q = pts[Math.floor(f)]; P.push({ hx: q[0], hy: q[1], col: 'rgb(' + q[2] + ',' + q[3] + ',' + q[4] + ')', x: 0, y: 0, vx: 0, vy: 0, ph: Math.random() * 6.28, dl: Math.random() * .8, fx: (Math.random() - .5) * 2, fs: .4 + Math.random() }); }
        ok = P.length > 20;
      } catch (e) { ok = false; }
      F = []; for (var i = 0; i < (phone() ? 26 : 50); i++) F.push({ x: Math.random(), y: Math.random(), s: .6 + Math.random() * 1.6, v: .008 + Math.random() * .02, ph: Math.random() * 6.28 });
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function box() {
      // the word hangs on the brick wall over the sign
      var fr = $('[data-panel]').getBoundingClientRect(), hr = hero.getBoundingClientRect();
      var bw = Math.min(fr.width * (phone() ? .62 : .7), 420), bh = bw * IH / IW;
      return { x: fr.left - hr.left + (fr.width - bw) / 2, y: fr.top - hr.top - bh - (phone() ? 10 : 22), w: bw, h: bh };
    }
    function frame(t) {
      raf = 0; if (!ok) return;
      var calm = still(), T = (t - t0) / 1000, b = box();
      var hr = hero.getBoundingClientRect(), fallP = calm ? 0 : clamp(-hr.top / (hr.height * .7), 0, 1.2);
      var px = ptr.x >= 0 ? ptr.x * w : -999, py = ptr.x >= 0 ? ptr.y * h : -999;
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], tx = b.x + p.hx * b.w, ty = b.y + p.hy * b.h;
        if (calm) { p.x = tx; p.y = ty; }
        else {
          var a = smooth((T - p.dl) / 1.4);
          if (a < 1) { p.x = lerp(tx + p.fx * 120, tx, a); p.y = lerp(ty - 260 - p.fs * 160, ty, a); }   // gold dust settles from above into the logo's gold
          else {
            tx += Math.sin(T * 1.2 + p.ph) * 1.2; ty += Math.cos(T + p.ph) * 1.2 + fallP * fallP * h * (.5 + p.fs * .6); tx += p.fx * fallP * 60;
            var dx = p.x - px, dy = p.y - py, d2 = dx * dx + dy * dy;
            if (d2 < 7000) { var f = (7000 - d2) / 7000 * 2.2, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
            p.vx += (tx - p.x) * .05; p.vy += (ty - p.y) * .05; p.vx *= .84; p.vy *= .84; p.x += p.vx; p.y += p.vy;
          }
        }
        var tw = .55 + .45 * Math.sin(T * 2.4 + p.ph * 3);
        c.globalAlpha = (calm ? .5 : .32 + .3 * tw) * (1 - clamp(fallP, 0, 1) * .5); c.fillStyle = p.col;
        var s = 1.6 + (tw > .95 ? 1 : 0); c.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
      // loose glitter drifting down the brick wall
      for (var k = 0; k < F.length; k++) {
        var g = F[k]; if (!calm) { g.y += g.v * .016 * 3; if (g.y > 1.02) { g.y = -.02; g.x = Math.random(); } }
        var gx = g.x * w + Math.sin(T * .8 + g.ph) * 12, gy = g.y * h, al = .25 + .35 * Math.sin(T * 3 + g.ph);
        c.globalAlpha = Math.max(0, al); c.fillStyle = k % 3 ? '#f1d9a2' : '#e0a493'; c.beginPath(); c.arc(gx, gy, g.s, 0, 6.283); c.fill();
      }
      c.globalAlpha = 1;
      if (!calm && heroOn) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() { size(); sample(); t0 = performance.now(); kick(); }
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // ---------------------------------------------------------------- the sign: tiles flicker on, then slide to their next photo like a changing light-box; the panel leans to the hand
  var sign = (function () {
    var panel = $('[data-panel]'), slots = $$('[data-slot]'), raf = 0, t0 = performance.now(), turn = 0, timer = 0;
    slots.forEach(function (sl) { sl._i = 0; var r = $('.reel', sl), f = r.firstElementChild.cloneNode(true); f.setAttribute('aria-hidden', 'true'); f.alt = ''; f.removeAttribute('data-alt-he'); r.appendChild(f); });
    function cap(sl) { var img = $$('.reel img', sl)[sl._i % 2], fc = $('figcaption', sl); fc.dataset.he = img.dataset.he; fc.dataset.en = img.dataset.en; decode(fc); }
    function advance() {
      if (still() || !heroOn) return;
      var sl = slots[turn++ % slots.length], r = $('.reel', sl);
      sl._i++; r.style.transition = ''; r.style.transform = 'translateY(' + (-sl._i * 100) + '%)'; cap(sl);
      // the copy of the first photo has landed: jump back to the real first one, unseen
      if (sl._i === 2) setTimeout(function () { r.style.transition = 'none'; r.style.transform = 'translateY(0)'; sl._i = 0; void r.offsetHeight; r.style.transition = ''; }, 950);
    }
    function reset() { slots.forEach(function (sl) { var r = $('.reel', sl); r.style.transition = 'none'; r.style.transform = ''; sl._i = 0; cap(sl); }); }
    function frame(t) {
      raf = 0;
      if (still()) { panel.style.setProperty('--rx', '0deg'); panel.style.setProperty('--ry', '0deg'); return; }
      var T = (t - t0) / 1000, hr = hero.getBoundingClientRect(), away = smooth(-hr.top / (hr.height * .6));
      var own = ptr.x >= 0 && fine, px = own ? ptr.x * 2 - 1 : Math.sin(T * .45) * .5, py = own ? ptr.y * 2 - 1 : Math.cos(T * .35) * .4;
      panel.style.setProperty('--ry', (px * (rtl() ? -6 : 6)).toFixed(2) + 'deg');
      panel.style.setProperty('--rx', (-py * 4 + away * 14).toFixed(2) + 'deg');
      panel.style.setProperty('--gx', (50 + px * 40).toFixed(1) + '%'); panel.style.setProperty('--gy', (40 + py * 30).toFixed(1) + '%');
      if (heroOn) raf = requestAnimationFrame(frame);
    }
    function kick() {
      if (!raf) raf = requestAnimationFrame(frame);
      if (still()) { clearInterval(timer); timer = 0; reset(); }
      else if (!timer) timer = setInterval(advance, 2600);
    }
    setTimeout(function () { hero.classList.add('lit'); }, 200);
    watch(hero, function (v) { hero.classList.toggle('on', v); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- tiles: a spotlight under the hand, tools working while on screen
  var chair = $('[data-chair]');
  watch(chair, function (v) { chair.classList.toggle('on', v && !still()); });
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); t.classList.add('lit'); });
    t.addEventListener('pointerleave', function () { t.classList.remove('lit'); });
  });

  // ---------------------------------------------------------------- the room: a lamp you carry over the real salon photo (by itself on phones)
  var room = (function () {
    var fig = $('[data-room]'), on = false, raf = 0, t0 = performance.now(), own = false, calls = $$('[data-call]', fig);
    fig.addEventListener('pointermove', function (e) { if (!fine) return; own = true; var r = fig.getBoundingClientRect(); fig.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); fig.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); });
    fig.addEventListener('pointerleave', function () { own = false; kick(); });
    function frame(t) {
      raf = 0; if (still() || !on || own) return;
      var T = (t - t0) / 1000, x = 50 + Math.sin(T * .5) * 30, y = 45 + Math.sin(T * .37 + 1) * 25;
      fig.style.setProperty('--sx', x.toFixed(1) + '%'); fig.style.setProperty('--sy', y.toFixed(1) + '%');
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    watch(fig, function (v) { on = v; if (v) { kick(); calls.forEach(function (c, i) { setTimeout(function () { c.classList.add('on'); }, still() ? 0 : 500 + i * 380); }); } });
    return { kick: kick };
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
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { setTimeout(function () { roll(o, true); }, 60); ob.disconnect(); } }, { threshold: .4 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- reviews drift; a touch stops them so they can be read and swiped
  var railEl = $('[data-rail]'), railIn = $('[data-railin]'), railCopy = false;
  function rail() {
    if (!railCopy) { $$('.rv', railIn).forEach(function (r) { var k = r.cloneNode(true); k.setAttribute('aria-hidden', 'true'); railIn.appendChild(k); }); railCopy = true; }
    railIn.style.setProperty('--shift', rtl() ? '50%' : '-50%');
    railIn.style.setProperty('--dur', Math.round(railIn.scrollWidth / 2 / 28) + 's');
    $$('.rv[aria-hidden]', railIn).forEach(function (r) { r.hidden = still(); });
    railIn.classList.toggle('run', !still());
  }
  railEl.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') railEl.classList.add('touched'); });

  // ---------------------------------------------------------------- the booking message, written as you choose
  var book = $('[data-book]'), steps = $$('[data-step]'), whoB = $$('[data-who]'), svc = $$('[data-svc]'), partB = $$('[data-part]'), dayBox = $('.days'), msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false, day = -1;
  svc.forEach(function (b, i) { b.style.setProperty('--k', i); });
  watch(book, function (v) { book.classList.toggle('on', v); if (v) lightStep(0); });
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function radio(list, b) { list.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); }
  whoB.forEach(function (b) { b.addEventListener('click', function () { radio(whoB, b); lightStep(0); write(); }); });
  svc.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); lightStep(1); write(); }); });
  partB.forEach(function (b) { b.addEventListener('click', function () { radio(partB, b); lightStep(2); write(); }); });
  function days() {
    var l = he(), short = l ? ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (day < 0) { var n = now(), d = n.d, k = 0; if (!H[d] || n.h >= H[d][1] - 1) d = (d + 1) % 7; while (!H[d] && k++ < 7) d = (d + 1) % 7; day = d; }
    dayBox.innerHTML = '';
    for (var i = 0; i < 7; i++) if (H[i]) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'radio'); b.dataset.d = i;
      b.setAttribute('aria-checked', i === day ? 'true' : 'false'); b.setAttribute('aria-label', l ? 'יום ' + dayHe[i] : dayEn[i]); b.textContent = short[i];
      dayBox.appendChild(b);
    }
    $$('button', dayBox).forEach(function (b) { b.addEventListener('click', function () { day = +b.dataset.d; $$('button', dayBox).forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lightStep(2); parts(); write(); }); });
    parts();
  }
  // Friday closes at 15:00, so no afternoon slot then
  function parts() {
    var late = H[day] && H[day][1] <= 15, eve = partB[2];
    eve.disabled = !!late;
    if (late && eve.getAttribute('aria-checked') === 'true') radio(partB, partB[0]);
  }
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), kid = whoB[1].getAttribute('aria-checked') === 'true';
    var picked = svc.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.dataset[l ? 'he' : 'en']; });
    var part = partB.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0].dataset[l ? 'he' : 'en'];
    if (l) {
      var what = picked.length ? 'ל' + list(picked, true) : '';
      return 'שלום רומן, אשמח לקבוע תור' + (kid ? ' לילד/ה שלי' + (what ? ', ' + what : '') : (what ? ' ' + what : '')) + '. מתאים לי ביום ' + dayHe[day] + ' ' + part + '. תודה!';
    }
    return 'Hi Roman, I’d like to book ' + (kid ? 'for my child' : 'an appointment') + (picked.length ? ': ' + list(picked, false) : '') + '. ' + dayEn[day] + ' ' + part + ' would suit me. Thanks!';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 14);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var colour = $('[data-colour]'), cframe = $('[data-cframe]'), ccopy = $('.c-copy'), ccalls = $$('[data-call]', cframe);
  var salon = $('[data-salon]'), foot = $('[data-foot]'), main = $('main'), comb = $('[data-comb]'), flogo = $('.f-logo');
  // phones: the sticky comb shows only once the hero's own buttons have left the screen
  var ctaVis = true; watch($('.cta'), function (v) { ctaVis = v; tick(); });
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, vw = cframe.clientWidth;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) { sign.kick(); dust.kick(); }
    // colour: the big lit tile of the sign opens to the full screen
    var p = calm ? 1 : prog(colour), e = smooth(p / .5);
    var bw = Math.min(440, vw * (phone() ? .62 : .34)), bh = Math.min(bw * 4 / 3, vh * .74);
    cframe.style.setProperty('--is', (lerp((vw - bw) / 2, 0, e)).toFixed(1) + 'px');
    cframe.style.setProperty('--it', (lerp((vh - bh) / 2, 0, e)).toFixed(1) + 'px');
    cframe.style.setProperty('--ib', (lerp((vh - bh) / 2, 0, e)).toFixed(1) + 'px');
    cframe.style.setProperty('--ir', lerp(6, 0, e).toFixed(1) + 'px');
    cframe.style.setProperty('--zs', lerp(1.08, 1, e).toFixed(4));
    ccopy.style.setProperty('--co', calm ? 1 : smooth((p - .4) / .18).toFixed(3));
    var fp = calm ? 1 : clamp((p - .5) / .3, 0, 1), N = fillChars.length;
    fillChars.forEach(function (ch, i) { ch.style.setProperty('--o', (.16 + .84 * clamp(fp * N * 1.15 - i, 0, 1)).toFixed(2)); });
    ccalls.forEach(function (c, i) { c.classList.toggle('on', calm || p > .55 + i * .08); });
    // stacked seam: the services stick when their end arrives and the salon card lands over them
    if (!calm) {
      chair.style.setProperty('--st', Math.min(0, vh - chair.offsetHeight) + 'px');
      var st = salon.getBoundingClientRect().top;
      chair.style.setProperty('--dim', (clamp(1 - st / vh, 0, 1) * .55).toFixed(3));
    } else chair.style.setProperty('--dim', 0);
    // footer: the page lifts like a cape and the logo rises into place
    var mb = main.getBoundingClientRect().bottom, rv = calm ? 1 : clamp((vh - mb) / Math.max(1, foot.offsetHeight), 0, 1);
    flogo.style.setProperty('--fy', ((1 - rv) * 50).toFixed(1) + 'px');
    flogo.style.setProperty('--fs', (.92 + .08 * rv).toFixed(3));
    flogo.style.setProperty('--fo', (.25 + .75 * rv).toFixed(3));
    comb.classList.toggle('away', ctaVis || mb < vh * .6);
  }
  function layout() {
    var cb = $('.concept').offsetHeight; root.style.setProperty('--cb', cb + 'px');
    // the footer curtain only works while the footer fits on the screen
    foot.style.position = (!still() && foot.offsetHeight < innerHeight * .95) ? '' : 'relative';
    dust.size(); tick();
  }
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', layout);

  texts(root.lang); days(); hours(); split(); rail(); write(true);
  if (still()) { $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); }); }
  layout();
  if (document.fonts) document.fonts.ready.then(layout);
})();
