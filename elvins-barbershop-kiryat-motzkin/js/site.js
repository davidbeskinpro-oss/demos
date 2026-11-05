(function () {
  var root = document.documentElement, WA = '972525211970';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 700; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'Elvins · מספרת גברים וילדים · קדיש לוז 8, קריית מוצקין', en: 'Elvins · Men’s and kids’ barbershop · 8 Kadish Luz, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Elvins barbershop מספרת גברים וילדים · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Elvins barbershop · This is not the business’s official website' };

  // ---------------------------------------------------------------- glyph decode for short labels
  var GLY = 'אבגדהוזחטיכלמנסעפצקרשתABCDEFGHKLMNPRSTVXZ';
  function decode(el, text, ms) {
    if (still()) { el.textContent = text; return; }
    var t0 = performance.now(), n = text.length; ms = ms || 520;
    clearTimeout(el._dt); cancelAnimationFrame(el._raf);
    (function f(t) {
      var k = clamp((t - t0) / ms, 0, 1), done = Math.floor(k * n), s = '';
      for (var i = 0; i < n; i++) s += i < done || text[i] === ' ' ? text[i] : GLY[(Math.random() * GLY.length) | 0];
      el.textContent = s;
      if (k < 1) el._raf = requestAnimationFrame(f);
    })(t0);
  }

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו למספרה, 052-521-1970', 'Call the shop, 052-521-1970');
    aria('[data-t-wa]', 'וואטסאפ למספרה', 'WhatsApp the shop');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: קדיש לוז 8, קריית מוצקין' : 'Map: 8 Kadish Luz, Kiryat Motzkin'; });
    $$('.zone').forEach(function (z) { var s = z.firstChild || z.appendChild(document.createElement('span')); s.textContent = z.dataset[l]; });
    $$('.hs').forEach(function (s) { $('b', s).textContent = s.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('elv-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('elv-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-odo]').forEach(function (o) { roll(o, true); });
    layout(); lens.kick(); hairs.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9, 20], 1: [9, 20], 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [8, 15], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], shEn = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
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
    $$('[data-status],[data-status-plain]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span> ' + txt; });
    // the dock is narrow: only the part after the dot when closed
    [].slice.call(document.querySelectorAll('.dk-status')).forEach(function (el) { var sh = open ? txt : (txt.split(' · ')[1] || txt); el.innerHTML = '<span class="dot"></span> ' + sh; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
    // week tile: each day's opening as a bar between 7:00 and 21:00, a line at the current time today
    var wk = $('[data-week]'); if (wk) {
      var A = 7, B = 21, f = function (x) { return clamp((x - A) / (B - A), 0, 1); };
      wk.innerHTML = [0, 1, 2, 3, 4, 5, 6].map(function (d) {
        var tt = H[d], bar = tt ? '<i style="--a:' + f(tt[0]) + ';--b:' + f(tt[1]) + '"></i>' : '';
        var nowl = d === n.d && n.h >= A && n.h <= B ? '<span class="now" style="--n:' + f(n.h) + '"></span>' : '';
        return '<div class="wd' + (d === n.d ? ' today' : '') + '"><div class="bar">' + bar + nowl + '</div>' + (l ? shHe : shEn)[d] + '</div>';
      }).join('');
    }
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
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  watch($('.chair'), function (v) { $('.chair').classList.toggle('on', v); }, { threshold: .08 });

  // headline: the name arrives letter by letter out of a blur
  $$('[data-split] .ln').forEach(function (ln) { var i = 0; ln.innerHTML = ln.textContent.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join(''); ln.parentNode.setAttribute('aria-label', 'Elvins'); });

  // ---------------------------------------------------------------- opening, once per visit
  var intro = $('[data-intro]'), seen = false;
  try { seen = sessionStorage.getItem('elv-intro') === '1'; sessionStorage.setItem('elv-intro', '1'); } catch (e) {}
  if (!still() && !seen && intro) {
    intro.classList.add('play'); root.classList.add('intro-on');
    setTimeout(function () { intro.remove(); root.classList.remove('intro-on'); }, 2000);
  } else if (intro) intro.remove();
  var lensDelay = (!still() && !seen) ? 1500 : 200;

  // ---------------------------------------------------------------- hero lens: the ring of the EL logo, colour inside it
  var hero = $('[data-hero]'), heroImg = $('.h-photo img'), spots = $$('.hs');
  function cover(w, h) {
    var iw = 1600, ih = 1200, s = Math.max(w / iw, h / ih), dw = iw * s, dh = ih * s;
    var pos = getComputedStyle(heroImg).objectPosition.split(' ').map(function (v) { return parseFloat(v) / 100; });
    var ox = (w - dw) * (isNaN(pos[0]) ? .5 : pos[0]), oy = (h - dh) * (isNaN(pos[1]) ? .5 : pos[1]);
    return function (fx, fy) { return [ox + fx * dw, oy + fy * dh]; };
  }
  var lens = (function () {
    var W = 0, Hh = 0, map, pts = [], R = 0, x = 0, y = 0, r = 0, tx = 0, ty = 0, ptr = null, idle = 0, vis = true, raf = 0, t0 = performance.now() + lensDelay, lastOn = -1;
    function size() {
      W = hero.clientWidth; Hh = hero.clientHeight; map = cover(W, Hh);
      R = Math.min(W, Hh) * (phone() ? .36 : .25);
      pts = spots.map(function (s) { var p = map(+s.dataset.x, +s.dataset.y); s.style.left = p[0] + 'px'; s.style.top = p[1] + 'px'; return p; });
      if (!x) { x = pts[0] ? pts[0][0] : W / 2; y = pts[0] ? pts[0][1] : Hh / 2; tx = x; ty = y; }
    }
    function frame(t) {
      raf = 0; if (!vis || still()) return;
      var grow = smooth((t - t0) / 900);
      if (ptr && t - ptr.t < 2600) { tx = ptr.x; ty = ptr.y; }
      else { var k = Math.floor((t - t0) / 2600), i = ((k % pts.length) + pts.length) % pts.length; if (pts[i]) { tx = pts[i][0] + Math.sin(t / 900) * 14; ty = pts[i][1] + Math.cos(t / 1100) * 10; } }
      x = lerp(x, tx, .07); y = lerp(y, ty, .07); r = R * grow;
      hero.style.setProperty('--lx', x + 'px'); hero.style.setProperty('--ly', y + 'px'); hero.style.setProperty('--lr', r + 'px');
      hero.style.setProperty('--lxp', x + 'px'); hero.style.setProperty('--lyp', y + 'px'); hero.style.setProperty('--ls', (r * 2 / 200).toFixed(4));
      var best = -1, bd = 1e9;
      pts.forEach(function (p, i) { var d = Math.hypot(p[0] - x, p[1] - y); if (d < r * .8 && d < bd) { bd = d; best = i; } });
      if (best !== lastOn) {
        spots.forEach(function (s, i) { s.classList.toggle('on', i === best); });
        if (best >= 0) decode($('b', spots[best]), spots[best].dataset[root.lang]);
        lastOn = best;
      }
      raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var b = hero.getBoundingClientRect(); ptr = { x: e.clientX - b.left, y: e.clientY - b.top, t: performance.now() }; });
    hero.addEventListener('pointerdown', function (e) { var b = hero.getBoundingClientRect(); ptr = { x: e.clientX - b.left, y: e.clientY - b.top, t: performance.now() }; });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!still()) { if (!raf) raf = requestAnimationFrame(frame); } else spots.forEach(function (s) { s.classList.add('on'); $('b', s).textContent = s.dataset[root.lang]; }); }
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- the arc of photo cards
  var arcWrap = $('[data-arcwrap]'), cards = $$('.ac'), drag = 0, dragV = 0, dragging = false, lastX = 0, arcSpin = 0;
  function arc(scrollTurn) {
    if (still()) return;
    var n = cards.length, w = arcWrap.clientWidth, rad = Math.min(w * (phone() ? .55 : .4), 520), base = scrollTurn + drag;
    cards.forEach(function (c, i) {
      var a = ((i / n) * Math.PI * 2 + base) % (Math.PI * 2); if (a > Math.PI) a -= Math.PI * 2; if (a < -Math.PI) a += Math.PI * 2;
      var xx = Math.sin(a) * rad, zz = (Math.cos(a) - 1) * rad * .55, yy = (1 - Math.cos(a)) * 22;
      var front = Math.cos(a);
      c.style.transform = 'translate3d(' + xx.toFixed(1) + 'px,' + yy.toFixed(1) + 'px,' + zz.toFixed(1) + 'px) rotateY(' + (a * 0.55).toFixed(3) + 'rad) scale(' + (0.86 + 0.18 * Math.max(0, front)).toFixed(3) + ')';
      c.style.opacity = clamp(.15 + front * 1.0, 0, 1).toFixed(3);
      c.style.zIndex = Math.round(front * 100) + 100;
    });
  }
  arcWrap.addEventListener('pointerdown', function (e) { if (still()) return; dragging = true; lastX = e.clientX; dragV = 0; arcWrap.setPointerCapture(e.pointerId); });
  arcWrap.addEventListener('pointermove', function (e) { if (!dragging) return; var dx = e.clientX - lastX; lastX = e.clientX; dragV = dx / 260; drag += dragV; tick(); });
  ['pointerup', 'pointercancel'].forEach(function (ev) { arcWrap.addEventListener(ev, function () { dragging = false; (function glide() { if (Math.abs(dragV) < .0005 || dragging) return; dragV *= .93; drag += dragV; tick(); requestAnimationFrame(glide); })(); }); });

  // ---------------------------------------------------------------- composer: the WhatsApp message writes itself
  var pick = { who: 'me', what: 'cut', when: 'today' };
  var W_ = {
    he: { who: { me: 'בשבילי', son: 'לבן שלי', both: 'לי ולבן שלי' }, what: { cut: 'תספורת', fade: 'פייד' }, when: { today: 'היום', tomorrow: 'מחר', fri: 'שישי בבוקר' } },
    en: { who: { me: 'for myself', son: 'for my son', both: 'for me and my son' }, what: { cut: 'a haircut', fade: 'a fade' }, when: { today: 'Today', tomorrow: 'Tomorrow', fri: 'Friday morning' } }
  };
  function message() {
    var l = he() ? 'he' : 'en', w = W_[l], who = w.who[pick.who], when = w.when[pick.when];
    if (l === 'he') return pick.what === 'unsure'
      ? 'שלום, אשמח לקבוע תור ' + who + '. עוד לא החלטתי מה עושים. ' + when + ' מתאים לי, יש מקום?'
      : 'שלום, אשמח לקבוע תור ל' + w.what[pick.what] + ' ' + who + '. ' + when + ' מתאים לי, יש מקום?';
    return pick.what === 'unsure'
      ? 'Hi, I’d like to book ' + who + ', not sure yet what to do. ' + when + ' works for me, any time free?'
      : 'Hi, I’d like to book ' + w.what[pick.what] + ' ' + who + '. ' + when + ' works for me, any time free?';
  }
  var msgEl = $('[data-msg]'), bub = $('[data-bubble]'), send = $('[data-send]'), typing = 0;
  function write(instant) {
    var m = message(); send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    clearInterval(typing);
    if (instant || still()) { msgEl.textContent = m; bub.classList.add('done'); return; }
    var i = 0; bub.classList.remove('done'); msgEl.textContent = '';
    typing = setInterval(function () { i += 2; msgEl.textContent = m.slice(0, i); if (i >= m.length) { clearInterval(typing); bub.classList.add('done'); } }, 28);
  }
  $$('[data-pick]').forEach(function (g) {
    $$('button', g).forEach(function (b) { b.addEventListener('click', function () {
      $$('button', g).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      pick[g.dataset.pick] = b.dataset.v; write(false);
      var st = g.closest('[data-bstep]'); $$('[data-bstep]').forEach(function (s) { s.classList.toggle('on', s === st); });
    }); });
  });
  var bookTyped = false;
  watch($('[data-book]'), function (v) { if (v && !bookTyped) { bookTyped = true; write(false); } }, { threshold: .35 });

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
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- reviews drift: a second copy makes the loop seamless
  var row = $('[data-driftrow]');
  $$('.rv', row).forEach(function (r) { var c = r.cloneNode(true); c.setAttribute('data-clone', ''); c.setAttribute('aria-hidden', 'true'); row.appendChild(c); });

  // ---------------------------------------------------------------- bento spotlight follows the hand
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var b = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - b.left) + 'px'); t.style.setProperty('--my', (e.clientY - b.top) + 'px'); }); });

  // ---------------------------------------------------------------- footer: the EL monogram drawn in hair-fine strokes
  var hairs = (function () {
    var cv = $('[data-hairs]'), src = $('[data-hairsrc]'), c = cv.getContext('2d'), P = [], S = 0, vis = false, raf = 0, ptr = null, ok = false, born = 0;
    function sample() {
      var n = 140, t = document.createElement('canvas'); t.width = n; t.height = n;
      var x = t.getContext('2d'); x.drawImage(src, 0, 0, n, n);
      var d; try { d = x.getImageData(0, 0, n, n).data; } catch (e) { return; }
      P = [];
      for (var yy = 0; yy < n; yy += 2) for (var xx = 0; xx < n; xx += 2) {
        if (d[(yy * n + xx) * 4 + 3] > 120) P.push({ hx: xx / n, hy: yy / n, x: Math.random(), y: Math.random() * 1.4 - .2, vx: 0, vy: 0, a: Math.random() * Math.PI, l: .6 + Math.random() * .8 });
      }
      ok = P.length > 0;
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); S = cv.clientWidth; cv.width = S * dpr; cv.height = S * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(t) {
      raf = 0; if (!vis || still() || !ok) return;
      c.clearRect(0, 0, S, S); c.lineCap = 'round';
      var moving = 0, auto = (t - born) % 6000 / 6000, combX = -0.2 + auto * 1.4;
      P.forEach(function (p) {
        var fx = (p.hx - p.x) * .06, fy = (p.hy - p.y) * .06;
        var px = ptr && t - ptr.t < 1200 ? ptr : (phone() ? { x: combX, y: .5 + Math.sin(t / 700) * .3 } : null);
        if (px) { var dx = p.x - px.x, dy = p.y - px.y, dd = dx * dx + dy * dy; if (dd < .012) { var f = (.012 - dd) * 2.4; fx += dx * f * 14; fy += dy * f * 14; } }
        p.vx = (p.vx + fx) * .82; p.vy = (p.vy + fy) * .82; p.x += p.vx; p.y += p.vy;
        var sp = Math.abs(p.vx) + Math.abs(p.vy); if (sp > .0004) moving++;
        p.a += (Math.atan2(p.vy, p.vx) - p.a) * Math.min(1, sp * 40);
        var L = S * .011 * p.l, X = p.x * S, Y = p.y * S, ca = Math.cos(p.a) * L, sa = Math.sin(p.a) * L;
        c.strokeStyle = 'rgba(236,230,216,' + (.55 + p.l * .3) + ')'; c.lineWidth = 1.3;
        c.beginPath(); c.moveTo(X - ca, Y - sa); c.lineTo(X + ca, Y + sa); c.stroke();
      });
      if (moving || ptr || phone()) raf = requestAnimationFrame(frame);
    }
    cv.addEventListener('pointermove', function (e) { var b = cv.getBoundingClientRect(); ptr = { x: (e.clientX - b.left) / b.width, y: (e.clientY - b.top) / b.height, t: performance.now() }; kick(); });
    function kick() { if (ok && vis && !still() && !raf) raf = requestAnimationFrame(frame); }
    function start() { size(); sample(); born = performance.now(); kick(); }
    if (src.complete && src.naturalWidth) start(); else src.addEventListener('load', start);
    watch(cv, function (v) { vis = v; kick(); });
    return { size: function () { if (ok) size(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- fade: a few cut hairs drift down behind the stage
  (function () {
    var cv = $('[data-clips]'), c = cv.getContext('2d'), P = [], vis = false, raf = 0, w = 0, h = 0;
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      P = []; var n = Math.round(w * h / 26000); for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, v: .15 + Math.random() * .35, a: Math.random() * 6.28, s: (Math.random() - .5) * .02, l: 4 + Math.random() * 8, o: .12 + Math.random() * .25 }); }
    function frame(t) {
      raf = 0; if (!vis || still()) return;
      c.clearRect(0, 0, w, h); c.lineCap = 'round'; c.lineWidth = 1.2;
      P.forEach(function (p) { p.y += p.v; p.x += Math.sin(t / 1500 + p.a) * .25; p.a += p.s; if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w; }
        var ca = Math.cos(p.a) * p.l, sa = Math.sin(p.a) * p.l; c.strokeStyle = 'rgba(214,190,140,' + p.o + ')'; c.beginPath(); c.moveTo(p.x - ca, p.y - sa); c.lineTo(p.x + ca, p.y + sa); c.stroke(); });
      raf = requestAnimationFrame(frame);
    }
    size(); addEventListener('resize', size);
    watch(cv, function (v) { vis = v; if (v && !raf) raf = requestAnimationFrame(frame); });
    switches.forEach(function (b) { b.addEventListener('click', function () { if (vis && !raf) raf = requestAnimationFrame(frame); }); });
  })();

  // ---------------------------------------------------------------- one scroll loop
  var nav = $('[data-nav]'), fade = $('[data-fade]'), fphoto = $('.f-photo'), fsteps = $$('[data-fstep]'), zones = $$('.zone');
  var seam = $('[data-seam]'), room = $('[data-room]'), vphoto = $('[data-vphoto]'), vbento = $('.v-bento'), dock = $('[data-dock]'), bsteps = $$('[data-bstep]'), pend = 0;
  var lastZone = [];
  function layout() { lens.size(); hairs.size(); tick(); }
  function tick() { if (!pend) pend = requestAnimationFrame(update); }
  function prog(el, a, b) { var r = el.getBoundingClientRect(), vh = innerHeight; return clamp((vh * a - r.top) / (r.height + vh * (b - a)), 0, 1); }
  function update() {
    pend = 0;
    var y = scrollY, vh = innerHeight;
    nav.classList.toggle('pill', y > 60);
    dock.classList.toggle('show', y > vh * .6);
    var s = still();
    // fade: the clipper's line climbs from the neck to the top as the steps pass
    var fr = fade.getBoundingClientRect(), p = s ? 1 : clamp((vh * .55 - fr.top) / (fr.height - vh * .6), 0, 1);
    var pp = smooth(clamp(p * 1.15, 0, 1));
    fphoto.style.setProperty('--p', pp.toFixed(4));
    var lit = [pp > .1, pp > .45, pp > .8]; // skin, blend, length
    zones.forEach(function (z) { var k = +z.dataset.zone, on = s || lit[2 - k]; if (on && !lastZone[k]) decode(z.firstChild, z.dataset[root.lang]); lastZone[k] = on; z.classList.toggle('on', on); });
    var best = null, bd = 1e9;
    fsteps.forEach(function (st) { var r = st.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - vh * (innerWidth <= 820 ? .78 : .58)); if (d < bd) { bd = d; best = st; } });
    fsteps.forEach(function (st) { st.classList.toggle('on', s || st === best); });
    // seam: the velvet builds up in steps
    if (!s) seam.style.setProperty('--s', prog(seam, 1, .35).toFixed(4));
    // arc: scroll turns it
    arc(prog(room, 1, 0) * Math.PI * 1.1 - .9);
    // visit: the shop front starts big and settles into its frame
    if (!s) { var vr = vphoto.getBoundingClientRect(), v = clamp((vh - vr.top) / (vh * .9), 0, 1); vphoto.style.transform = 'scale(' + (1 + (1 - smooth(v)) * .14).toFixed(4) + ')'; vphoto.style.borderRadius = (26 * v).toFixed(1) + 'px'; vbento.style.opacity = smooth(v * 1.3 - .2).toFixed(3); vbento.style.transform = 'translateY(' + ((1 - smooth(v)) * 40).toFixed(1) + 'px)'; }
    else { vphoto.style.transform = ''; vbento.style.opacity = ''; vbento.style.transform = ''; }
    // composer steps light up in turn as you scroll past
    if (!bsteps.some(function (b) { return b.dataset.touched; })) {
      var bi = -1; bsteps.forEach(function (b, i) { if (b.getBoundingClientRect().top < vh * .7) bi = i; });
      bsteps.forEach(function (b, i) { b.classList.toggle('on', s || i === bi); });
    }
  }
  $$('[data-pick] button').forEach(function (b) { b.addEventListener('click', function () { bsteps.forEach(function (x) { x.dataset.touched = '1'; }); }); });
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', layout);

  texts(root.lang); hours(); write(true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  layout(); lens.kick();
  addEventListener('load', layout);
})();
