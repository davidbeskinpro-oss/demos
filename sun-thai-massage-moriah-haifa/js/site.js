(function () {
  var root = document.documentElement, WA = '972585453838';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 760; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'סאן · עיסוי תאילנדי · שדרות מוריה 116, חיפה', en: 'Sun · Thai massage · 116 Moriah Blvd, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Sun Thai Massage Haifa · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Sun Thai Massage Haifa · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-wa]', 'וואטסאפ לסאן', 'WhatsApp Sun');
    aria('[data-t-call]', 'שיחה לסאן, 058-545-3838', 'Call Sun, 058-545-3838');
    aria('[data-t-kind]', 'סוג העיסוי', 'The massage');
    aria('[data-t-len]', 'משך הטיפול', 'Length of the treatment');
    aria('[data-set-lang]', 'English', 'עברית');
    $$('.spot').forEach(function (s) { var t = s.dataset[l]; s.setAttribute('aria-label', t); if (s.classList.contains('on')) $('.tag', s).textContent = t; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('sun-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('sun-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    layout(); motes.kick(); orbit.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [10, 16], 1: [10, 16], 2: [10, 16], 3: [10, 16], 4: [10, 16], 5: [10, 13], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  var dayFrac = 0, dayUp = false;
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
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span><span>' + txt + '</span>'; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
    // the sun on the day's arc: where today's opening hours stand right now
    dayUp = open; dayFrac = !t ? 0 : clamp((n.h - t[0]) / (t[1] - t[0]), 0, 1);
    var end = $('[data-dayend]'); end.textContent = t ? hhmm(t[1]) : (l ? 'סגור היום' : 'Closed today');
    $('[data-daysun]').classList.toggle('down', !open);
    tick();
  }
  // consecutive days with the same hours share a row; the week starts on Sunday
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
  $$('.bento,.v-bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--td', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- letters: split text nodes into characters, keeping <em> accents
  function split(el, start) {
    var i = start || 0;
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
            var ws = document.createElement('span'); ws.className = 'w';
            w.split('').forEach(function (ch) { var s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = ch; ws.appendChild(s); });
            frag.appendChild(ws);
          });
          c.parentNode.replaceChild(frag, c);
        } else if (c.nodeType === 1) walk(c);
      });
    })(el);
    return i;
  }
  var hi = 0; $$('[data-split] .ln > span[lang]').forEach(function (sp) { hi = sp.lang === 'en' ? hi : hi; split(sp, sp.closest('.ln').previousElementSibling ? 4 : 0); });
  $$('[data-fill] > span[lang]').forEach(function (sp) { split(sp, 0); });
  // decorative giant letters: drawn from a data attribute so they stay pictures, not text
  $$('[data-sword] > span, [data-fword] > span').forEach(function (sp) { sp.innerHTML = sp.textContent.split('').map(function (c) { return '<span class="ch" data-c="' + c + '"></span>'; }).join(''); });

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- warm motes in the dawn air: they rise, drift, part around the hand
  var motes = (function () {
    var cv = $('[data-motes]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = true, mx = -999, my = -999, rings = [];
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 46 : 90; P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: .8 + Math.random() * 2.4, v: .15 + Math.random() * .45, ph: Math.random() * 6.28, vx: 0, vy: 0, a: .25 + Math.random() * .55 });
    }
    function draw(t) {
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        c.globalAlpha = p.a * (.6 + .4 * Math.sin(t / 900 + p.ph));
        c.fillStyle = p.r > 2.4 ? '#ffd9a0' : '#f4a43a';
        c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
      }
      c.globalAlpha = 1;
      rings.forEach(function (r) { var k = (t - r.t) / 1400; c.strokeStyle = 'rgba(255,208,122,' + (.6 * (1 - k)).toFixed(3) + ')'; c.lineWidth = 1.5; c.beginPath(); c.arc(r.x, r.y, 10 + k * 120, 0, 6.283); c.stroke(); });
    }
    function frame(t) {
      raf = 0; if (still()) { draw(0); return; }
      rings = rings.filter(function (r) { return t - r.t < 1400; });
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        p.y -= p.v; p.x += Math.sin(t / 2400 + p.ph) * .25;
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 14400) { var f = (14400 - d2) / 14400 * 1.4, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
        rings.forEach(function (r) { var k = (t - r.t) / 1400, rr = 10 + k * 120, ex = p.x - r.x, ey = p.y - r.y, d = Math.sqrt(ex * ex + ey * ey) || 1; if (Math.abs(d - rr) < 14) { p.vx += ex / d * 1.2; p.vy += ey / d * 1.2; } });
        p.x += p.vx; p.y += p.vy; p.vx *= .9; p.vy *= .9;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
      }
      draw(t);
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) { var r = hero.getBoundingClientRect(); rings.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }); kick(); });
    watch(hero, function (v) { vis = v; kick(); });
    return { size: function () { size(); draw(0); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- her photos orbit the sun: dealt out from one stack, then travelling; turns with scroll and drag
  var orbit = (function () {
    var wrap = $('[data-orbit]'), cards = $$('.oc', wrap), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = true, last = 0, t0 = 0;
    function frame(t) {
      raf = 0;
      if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; c.style.zIndex = ''; c.style.opacity = ''; }); return; }
      if (!t0) t0 = t;
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (7 + vel) * dt; vel *= .94; }
      var W = wrap.clientWidth, Hh = wrap.clientHeight, Rx = Math.min(W * .42, 420), Ry = Hh * (phone() ? .2 : .22);
      var deal = smooth((t - t0 - 500) / 1700), sc = scrollY * .08, dir = rtl() ? -1 : 1;
      cards.forEach(function (c, i) {
        var a = (rot + sc + i * step * deal) * Math.PI / 180, z = Math.cos(a), x = Math.sin(a) * Rx * dir, y = z * Ry;
        var front = z > .2, s = .6 + .42 * (z + 1) / 2, lift = z > .93 ? (z - .93) * 2.4 : 0;
        c.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + (y - lift * 40).toFixed(1) + 'px,0) rotate(' + (Math.sin(a) * -6 * dir).toFixed(2) + 'deg) scale(' + (s + lift * .35).toFixed(3) + ')';
        c.style.zIndex = front ? 7 + Math.round(z * 10) : 2 + Math.round((z + 1) * 1.4);
        c.style.filter = 'brightness(' + (.38 + .62 * Math.pow((z + 1) / 2, 1.3)).toFixed(3) + ')';
        c.style.opacity = (smooth((t - t0 - 300) / 500)).toFixed(3);
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .3 * (rtl() ? -1 : 1); vel = dx * 1.6 * (rtl() ? -1 : 1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { kick: kick, start: function () { t0 = 0; kick(); } };
  })();

  // ---------------------------------------------------------------- the room: callouts on real objects of the photo
  var room = $('[data-room]'), stage = $('.r-stage', room), frameEl = $('[data-rframe]'), beam = $('[data-beam]'), spots = $$('.spot', frameEl);
  var fillChars = $$('[data-fill] .ch');
  function placeSpots() {
    var W = frameEl.clientWidth, Hh = frameEl.clientHeight, iw = 900, ih = 1600, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s, ox = (W - dw) / 2, oy = (Hh - dh) / 2;
    spots.forEach(function (sp) {
      var x = ox + dw * +sp.dataset.x, y = oy + dh * +sp.dataset.y;
      sp.style.left = x + 'px'; sp.style.top = y + 'px';
      sp.classList.toggle('flip', x > W * .55);
      sp.hidden = x < 16 || x > W - 16 || y < 16 || y > Hh - 16;
    });
  }
  function typeTag(sp, on) {
    var tag = $('.tag', sp), txt = sp.dataset[he() ? 'he' : 'en'];
    if (on === sp.classList.contains('on')) return;
    sp.classList.toggle('on', on); clearInterval(sp._t);
    if (!on) { tag.textContent = ''; return; }
    if (still()) { tag.textContent = txt; return; }
    var i = 0; tag.textContent = '';
    sp._t = setInterval(function () { tag.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(sp._t); }, 40);
  }
  spots.forEach(function (sp) { sp.addEventListener('click', function () { sp._pinned = !sp.classList.contains('on'); typeTag(sp, sp._pinned); }); });

  // ---------------------------------------------------------------- the massages: living tiles, a warm spotlight, photos that take turns
  var care = $('#care'), careOn = false;
  watch(care, function (v) { careOn = v; care.classList.toggle('on', v); });
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); t.classList.add('lit'); });
    t.addEventListener('pointerleave', function () { t.classList.remove('lit'); });
  });
  var tp = $$('.t-photo img'), tpi = 0; tp[0].classList.add('on');
  setInterval(function () { if (!careOn || still()) return; tp[tpi].classList.remove('on'); tpi = (tpi + 1) % tp.length; tp[tpi].classList.add('on'); }, 3600);
  // the little sun walks the dial to 60, 90 and 120
  var dsun = $('[data-dsun]'), dial = dsun.parentNode, dArc = $('[data-dialarc]'), lensN = $$('[data-lensn]'), li = 2;
  function dialTo(k) {
    var f = [.18, .5, .82][k], W = dial.clientWidth, s = W / 200, a = Math.PI * (1 - f);
    var x = (100 + 86 * Math.cos(a)) * s, y = (100 - 86 * Math.sin(a)) * s;
    if (rtl()) x = W - x;
    dsun.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    dsun.style.transition = still() ? 'none' : 'transform 1.1s cubic-bezier(.77,0,.175,1)';
    dial.style.setProperty('--dd', (271 * (1 - f)).toFixed(1));
    dArc.style.transition = still() ? 'none' : 'stroke-dashoffset 1.1s cubic-bezier(.77,0,.175,1)';
    if (rtl()) dArc.parentNode.style.transform = 'scaleX(-1)'; else dArc.parentNode.style.transform = '';
    lensN.forEach(function (b, i) { b.classList.toggle('on', i === k); });
  }
  setInterval(function () { if (!careOn || still()) return; li = (li + 1) % 3; dialTo(li); }, 2200);

  // ---------------------------------------------------------------- Sun: the photo leans toward the hand; on phones it sways with the scroll
  var sunSec = $('[data-sun]'), deckEl = $('[data-deck]'), tilt = $('[data-tilt]'), sword = $$('[data-sword] .ch');
  if (fine) {
    deckEl.addEventListener('pointermove', function (e) {
      if (still()) return; var r = tilt.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      tilt.style.setProperty('--ry', ((px - .5) * 12).toFixed(2) + 'deg'); tilt.style.setProperty('--rx', ((.5 - py) * 10).toFixed(2) + 'deg');
      tilt.style.setProperty('--gx', (px * 100).toFixed(1) + '%'); tilt.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    });
    deckEl.addEventListener('pointerleave', function () { tilt.style.setProperty('--rx', '0deg'); tilt.style.setProperty('--ry', '0deg'); });
  }

  // ---------------------------------------------------------------- booking: stones and suns choose, the message writes itself
  var kinds = $$('[data-kind]'), lens = $$('[data-len]'), steps = $$('[data-step]'), msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function radio(group, b) { group.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); x.tabIndex = x === b ? 0 : -1; }); }
  function keys(group, after) {
    group.forEach(function (b, i) {
      b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1;
      b.addEventListener('keydown', function (e) {
        var k = e.key, d = (k === 'ArrowRight' || k === 'ArrowDown') ? 1 : (k === 'ArrowLeft' || k === 'ArrowUp') ? -1 : 0;
        if (!d) return; e.preventDefault(); if (rtl() && (k === 'ArrowRight' || k === 'ArrowLeft')) d = -d;
        var n = group[(i + d + group.length) % group.length]; radio(group, n); n.focus(); after();
      });
    });
  }
  kinds.forEach(function (b) { b.addEventListener('click', function () { radio(kinds, b); lightStep(1); write(); }); });
  lens.forEach(function (b) { b.addEventListener('click', function () { radio(lens, b); lightStep(2); write(); }); });
  keys(kinds, function () { lightStep(1); write(); }); keys(lens, function () { lightStep(2); write(); });
  function pick(g) { return g.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0]; }
  function compose() {
    var l = he(), k = pick(kinds).dataset[l ? 'he' : 'en'], n = pick(lens).dataset.len;
    return l ? 'שלום סאן, אשמח לתאם ' + k + ' של ' + n + ' דקות. מתי יש לך מקום פנוי?'
             : 'Hi Sun, I’d like to book ' + k + ', ' + n + ' minutes. When do you have a free slot?';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; if (still()) return; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- odometer for the score
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 6) % 10; s.style.transitionDelay = go ? (i * 180) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  var rows = $$('[data-drift]'), revs = $('[data-revs]'), vhor = $('[data-vhor]'), dayArc = $('[data-dayarc]'), daySun = $('[data-daysun]'), dayDone = $('[data-daydone]');
  var dayLen = dayDone.getTotalLength ? dayDone.getTotalLength() : 500; dayArc.style.setProperty('--dl', dayLen.toFixed(1));
  var foot = $('#foot'), main = $('#main'), fsky = $('[data-fsky]'), fword = $('[data-fword]'), fchars = $$('[data-fword] .ch'), dock = $('[data-dock]'), pathSun = $('[data-pathsun]'), slit = $('[data-slit]');

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function pass(el) { var r = el.getBoundingClientRect(); return clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, docH = document.documentElement.scrollHeight - vh;
    nav.classList.toggle('pill', scrollY > 40);
    // the little sun walks its arc under the nav, from sunrise to sunset
    var np = clamp(scrollY / Math.max(1, docH), 0, 1), ni = nav.firstElementChild, NW = ni.clientWidth, NH = ni.clientHeight, t = rtl() ? 1 - np : np;
    var bx = 2 * (1 - t) * t * 500 + t * t * 1000, by = (1 - t) * (1 - t) * 36 + 2 * (1 - t) * t * -20 + t * t * 36;
    pathSun.style.transform = 'translate(' + (22 + bx / 1000 * (NW - 44)).toFixed(1) + 'px,' + (NH - 5 + by / 40 * 12).toFixed(1) + 'px)';
    if (!calm) { motes.kick(); orbit.kick(); }
    // the horizon line stretches as the hero leaves; the room opens from it
    var hr = hero.getBoundingClientRect(), hp = clamp(-hr.top / (hr.height * .6), 0, 1);
    slit.style.setProperty('--sx', calm ? 1 : (.3 + .7 * hp).toFixed(3)); slit.style.setProperty('--so', calm ? .8 : (.6 + .4 * hp).toFixed(3));
    var rr = room.getBoundingClientRect(), rp = calm ? 1 : prog(room), o = calm ? 1 : smooth((vh - rr.top) / (vh * 1.05));
    stage.style.setProperty('--o', o.toFixed(4));
    var bp = smooth((rp - .1) / .7);
    beam.style.setProperty('--bx', (rtl() ? lerp(-120, 120, bp) : lerp(120, -120, bp)).toFixed(1) + '%');
    var fp = calm ? 1 : clamp((vh - rr.top) / vh - .35, 0, 1) * 1.6, nc = fillChars.length;
    fillChars.forEach(function (ch, i) { var a = clamp(fp * (nc + 6) - i, 0, 1); ch.style.setProperty('--a', (.16 + .84 * a).toFixed(3)); });
    spots.forEach(function (sp, i) { if (sp._pinned !== undefined) return; typeTag(sp, calm || rp > .18 + i * .14); });
    // Sun: her name drifts apart behind her; the second photo slides out from under the first
    var sp2 = calm ? .5 : pass(sunSec), mid = (sword.length - 1) / 2;
    sword.forEach(function (ch, i) { var k = i - mid, d = calm ? 0 : (sp2 - .5); ch.style.setProperty('--ly', (d * 160 * (k || .4) * (i % 2 ? 1 : -1)).toFixed(1) + 'px'); ch.style.setProperty('--lr', (d * 14 * k).toFixed(2) + 'deg'); });
    var dk = calm ? 1 : smooth((sp2 - .15) / .3);
    deckEl.style.setProperty('--bx', (lerp(0, -46, dk)).toFixed(1) + '%'); deckEl.style.setProperty('--by', (lerp(0, 22, dk)).toFixed(1) + '%'); deckEl.style.setProperty('--br', (lerp(0, -8, dk)).toFixed(2) + 'deg');
    if (!fine && !calm) { var sw = Math.sin(sp2 * Math.PI * 2); tilt.style.setProperty('--ry', (sw * 7).toFixed(2) + 'deg'); tilt.style.setProperty('--gx', (50 + sw * 40).toFixed(1) + '%'); tilt.style.setProperty('--gy', (30 + sp2 * 40).toFixed(1) + '%'); }
    // reviews drift sideways, two rows in opposite directions
    var rv = calm ? 0 : pass(revs);
    rows.forEach(function (r) {
      if (calm) { r.style.removeProperty('--dx'); return; }
      var over = Math.max(0, r.scrollWidth - innerWidth), tt = +r.dataset.drift > 0 ? rv : 1 - rv;
      r.style.setProperty('--dx', (-over * smooth(tt) * (rtl() ? -1 : 1)).toFixed(1) + 'px');
    });
    // the visit horizon rises as you arrive; the sun climbs the day's arc to this hour
    var vr = vhor.parentNode.getBoundingClientRect(), vp = calm ? 1 : smooth((vh - vr.top) / (vh * .8));
    vhor.style.setProperty('--rise', ((1 - vp) * 120).toFixed(1) + 'px');
    var ar = dayArc.getBoundingClientRect(), ap = calm ? 1 : smooth((vh - ar.top) / (vh * .55)), f = dayFrac * ap;
    var s = dayArc.clientWidth / 400, ang = Math.PI * f, x = (200 - 180 * Math.cos(ang)) * s, y = (160 - 140 * Math.sin(ang)) * s;
    if (!dayUp) y += 14 * s;
    if (rtl()) x = dayArc.clientWidth - x;
    daySun.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    dayArc.style.setProperty('--do', (dayLen * (1 - f)).toFixed(1));
    dayArc.firstElementChild.style.transform = rtl() ? 'scaleX(-1)' : '';
    // footer: the curtain lifts, the sun sets, the name rises letter by letter
    var mb = main.getBoundingClientRect().bottom, fh = foot.offsetHeight, cp = calm ? 1 : clamp((vh - mb) / Math.max(1, fh), 0, 1);
    fsky.style.setProperty('--set', ((cp) * 70).toFixed(1) + 'px');
    fchars.forEach(function (ch, i) { var e = calm ? 1 : smooth(cp * 1.6 - i * .14); ch.style.setProperty('--fy', ((1 - e) * 70).toFixed(1) + 'px'); ch.style.setProperty('--fo', (.15 + .85 * e).toFixed(3)); });
    // the dock appears once the hero's buttons are gone
    dock.classList.toggle('show', hr.bottom < vh * .5);
  }
  function fitWord() { fword.style.fontSize = ''; var W = fword.parentNode.clientWidth, sw = fword.scrollWidth; if (sw > W) fword.style.fontSize = (parseFloat(getComputedStyle(fword).fontSize) * W / sw * .96) + 'px'; }

  function layout() { motes.size(); placeSpots(); dialTo(li); fitWord(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); orbit.start(); motes.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitWord(); go(); });
  setTimeout(go, 1200);
  addEventListener('load', function () { placeSpots(); fitWord(); tick(); });
})();
