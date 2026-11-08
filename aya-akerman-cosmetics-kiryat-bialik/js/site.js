(function () {
  var root = document.documentElement, WA = '972526966409';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'איה אקרמן · קוסמטיקה מתקדמת · בנימין 17, קריית ביאליק', en: 'Aya Akerman · Advanced cosmetics · 17 Binyamin St, Kiryat Bialik' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור איה אקרמן קוסמטיקה מתקדמת · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Aya Akerman Advanced Cosmetics · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'איה אקרמן קוסמטיקה מתקדמת', 'Aya Akerman Advanced Cosmetics');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-beads]', 'טיפולים', 'Treatments');
    aria('[data-t-prev]', 'הביקורת הקודמת', 'Previous review');
    aria('[data-t-next]', 'הביקורת הבאה', 'Next review');
    aria('[data-t-pick]', 'טיפול', 'Treatment');
    aria('[data-t-week]', 'יום', 'Day');
    aria('[data-t-when]', 'שעה', 'Time');
    aria('[data-t-visit]', 'ביקור', 'Visit');
    aria('[data-t-wa]', 'וואטסאפ לאיה', 'WhatsApp Aya');
    aria('[data-t-call]', 'התקשרו לאיה, 052-696-6409', 'Call Aya, 052-696-6409');
    $$('[data-decode]').forEach(function (el) { if (still() || decoded) { clearInterval(el._t); el.textContent = el.dataset[l]; } });
    $$('.spot').forEach(function (s) { s.setAttribute('aria-label', s.dataset[l]); if (s.classList.contains('on')) $('.tag', s).textContent = s.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('aya-lang', l); } catch (e) {}
    texts(l); hours(); buildWeek(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('aya-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $('[data-fword]').classList.add('in');
    layout(); pearls.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9, 19], 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], shortEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: shortEn.indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
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
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-glow]').forEach(function (g) { g.classList.toggle('open', open); });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
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
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 70 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline and footer name: letter by letter (Hebrew letters do not join, so splitting them is safe)
  function split(sp, start) {
    var i = start || 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  }
  $$('[data-split] .ln > span[lang]').forEach(function (sp) { split(sp, sp.closest('.ln').previousElementSibling ? 10 : 0); });
  $$('[data-fword] > span[lang]').forEach(function (sp) { split(sp); });

  // labels decode out of scrambled letters
  function decode(el, txt, dur) {
    clearInterval(el._t);
    if (still()) { el.textContent = txt; return; }
    var pool = he() ? 'אבגדהוזחטיכלמנסעפצקרשת' : 'ABCDEFGHIJKLMNOPRSTUVWXYZ', t0 = performance.now();
    el._t = setInterval(function () {
      var k = clamp((performance.now() - t0) / (dur || 700), 0, 1), n = Math.floor(txt.length * k), s = txt.slice(0, n);
      for (var j = n; j < txt.length; j++) s += txt[j] === ' ' || txt[j] === '·' ? txt[j] : pool[Math.floor(Math.random() * pool.length)];
      el.textContent = s; if (k >= 1) clearInterval(el._t);
    }, 40);
  }

  var decoded = false;
  var hero = $('[data-hero]'), nav = $('[data-nav]'), hfig = $('[data-hfig]'), aya = $('.h-aya'), rose = $('[data-rose]');

  // ---------------------------------------------------------------- the pearl: one sprite drawn once, used by every canvas
  var sprite = (function () {
    var c = document.createElement('canvas'), s = 64; c.width = c.height = s; var x = c.getContext('2d');
    var g = x.createRadialGradient(s * .36, s * .3, 1, s * .5, s * .5, s * .5);
    g.addColorStop(0, '#ffffff'); g.addColorStop(.18, '#fbf3f0'); g.addColorStop(.55, '#ecd6d1'); g.addColorStop(.86, '#c99d99'); g.addColorStop(1, 'rgba(176,130,126,0)');
    x.fillStyle = g; x.beginPath(); x.arc(s / 2, s / 2, s / 2, 0, 7); x.fill();
    var r = x.createRadialGradient(s * .66, s * .72, 1, s * .66, s * .72, s * .3); r.addColorStop(0, 'rgba(217,236,229,.55)'); r.addColorStop(1, 'rgba(217,236,229,0)');
    x.fillStyle = r; x.beginPath(); x.arc(s / 2, s / 2, s / 2 - 2, 0, 7); x.fill();
    return c;
  })();

  // ---------------------------------------------------------------- hero: pearls rise out of the jar in her hand, part around the cursor,
  // and pour down out of the hero as you scroll
  var pearls = (function () {
    var cv = $('[data-pearls]'), c = cv.getContext('2d'), P = [], w = 0, h = 0, raf = 0, vis = true, mx = -999, my = -999, jar = [0, 0], last = 0, acc = 0;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var hr = hero.getBoundingClientRect(), fr = hfig.getBoundingClientRect(), fw = fr.width, fh = fr.height, s = Math.min(fw / 800, fh / 1201), dw = 800 * s, dh = 1201 * s;
      jar = [fr.left - hr.left + (fw - dw) / 2 + .628 * dw, fr.top - hr.top + (fh - dh) + .128 * dh];
      if (!P.length) for (var i = 0; i < (phone() ? 26 : 46); i++) P.push(ambient(true));
      draw();
    }
    function ambient(any) { return { x: Math.random() * w, y: any ? Math.random() * h : h + 20, vx: (Math.random() - .5) * .15, vy: -(.08 + Math.random() * .22), r: 3 + Math.random() * (phone() ? 9 : 14), a: .18 + Math.random() * .35, amb: 1, ph: Math.random() * 6.3 }; }
    function emit(x, y, n, burst) {
      for (var i = 0; i < n; i++) {
        var ang = burst ? Math.random() * 6.283 : -Math.PI / 2 + (Math.random() - .5) * 1.1, sp = burst ? 1 + Math.random() * 2.4 : .5 + Math.random() * 1.1;
        P.push({ x: x + (Math.random() - .5) * 14, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, r: 2 + Math.random() * 5.5, a: 0, life: 0, max: 220 + Math.random() * 200, amb: 0, ph: Math.random() * 6.3 });
      }
    }
    function draw() {
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) { var p = P[i]; c.globalAlpha = clamp(p.a, 0, 1); c.drawImage(sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2); }
      c.globalAlpha = 1;
    }
    function frame(t) {
      raf = 0; if (still()) { draw(); return; }
      var dt = last ? Math.min(3, (t - last) / 16.7) : 1; last = t;
      var hr = hero.getBoundingClientRect(), pour = clamp(-hr.top / (hr.height * .6), 0, 1.2);
      acc += dt * (phone() ? .22 : .34);
      while (acc > 1) { acc--; if (P.length < (phone() ? 120 : 220)) emit(jar[0], jar[1], 1); }
      for (var i = P.length - 1; i >= 0; i--) {
        var p = P[i];
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 14400) { var f = (14400 - d2) / 14400 * .55, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f * dt; p.vy += dy / dd * f * dt; }
        p.vy += pour * .09 * dt; p.vx += (w / 2 - p.x) * pour * .0004 * dt;
        p.vx += Math.sin(t / 900 + p.ph) * .006 * dt;
        if (p.amb) { p.vx *= .985; p.vy = lerp(p.vy, -(.1 + p.r * .012) + pour * 2, .02); }
        else { p.life += dt; p.vx *= .99; p.vy = p.vy * .99 - .004 * dt * (1 - pour); p.a = Math.min(.95, p.life / 20) * (1 - clamp((p.life - p.max * .7) / (p.max * .3), 0, 1)); }
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.amb && (p.y < -30 || p.y > h + 40 || p.x < -40 || p.x > w + 40)) { P[i] = ambient(false); if (pour > .3) P[i].y = -20; }
        else if (!p.amb && (p.life > p.max || p.y > h + 30 || p.y < -30)) P.splice(i, 1);
      }
      draw();
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
      if (e.pointerType !== 'mouse' || still()) return;
      var nx = mx / r.width - .5, ny = my / r.height - .5;
      aya.style.setProperty('--px', (nx * -14).toFixed(1) + 'px'); aya.style.setProperty('--py', (ny * -8).toFixed(1) + 'px');
      rose.style.setProperty('--rx', (nx * 34).toFixed(1) + 'px'); rose.style.setProperty('--ry', (ny * 22).toFixed(1) + 'px'); rose.style.setProperty('--rr', (nx * 5).toFixed(2) + 'deg');
    });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) { if (still()) return; var r = hero.getBoundingClientRect(); emit(e.clientX - r.left, e.clientY - r.top, 14, true); kick(); });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { size: size, kick: kick, burst: function () { emit(jar[0], jar[1], 18, true); } };
  })();

  // ---------------------------------------------------------------- treatments: the necklace
  var care = $('[data-care]'), strand = $('[data-strand]'), th = $('[data-th]'), thbg = $('[data-thbg]'), beads = $$('[data-bead]'), panels = $$('.panel'), thLen = 0, tPos = [];
  beads.forEach(function (b) { b.style.setProperty('--s', b.dataset.s); });
  function strandLayout() {
    var W = strand.clientWidth, Hh = strand.clientHeight, y0 = Hh * .1, cy = Hh * 1.12;
    var sx = rtl() ? W + 30 : -30, ex = rtl() ? -30 : W + 30;
    var d = 'M' + sx + ' ' + y0 + ' Q' + (W / 2) + ' ' + cy + ' ' + ex + ' ' + y0;
    th.setAttribute('d', d); thbg.setAttribute('d', d);
    thLen = th.getTotalLength(); th.style.strokeDasharray = thLen;
    var spread = phone() ? [.14, .32, .5, .68, .86] : [.2, .35, .5, .65, .8];
    tPos = spread;
    beads.forEach(function (b, i) {
      var t = spread[i], u = 1 - t;
      var x = u * u * sx + 2 * u * t * (W / 2) + t * t * ex, y = u * u * y0 + 2 * u * t * cy + t * t * y0;
      b.style.left = x.toFixed(1) + 'px'; b.style.top = y.toFixed(1) + 'px';
    });
  }
  function land(b, on) {
    if (on === b.classList.contains('landed')) return;
    b.classList.toggle('landed', on);
    if (on && b.animate) b.animate([{ transform: 'translateY(-90px)', opacity: 0 }, { transform: 'translateY(6px)', opacity: 1, offset: .7 }, { transform: 'translateY(-3px)', offset: .86 }, { transform: 'none', opacity: 1 }], { duration: 760, easing: 'cubic-bezier(.3,0,.4,1)' });
  }
  function choose(i, focus) {
    beads.forEach(function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); b.tabIndex = k === i ? 0 : -1; });
    panels.forEach(function (p, k) { var on = k === i; p.hidden = !on; p.classList.toggle('on', on); p.classList.remove('swap'); if (on) { void p.offsetWidth; p.classList.add('swap'); } });
    if (focus) beads[i].focus();
  }
  beads.forEach(function (b, i) {
    b.addEventListener('click', function () { choose(i); });
    b.addEventListener('keydown', function (e) {
      var k = e.key, d = (k === 'ArrowRight' ? 1 : k === 'ArrowLeft' ? -1 : 0) * (rtl() ? -1 : 1);
      if (d) { e.preventDefault(); choose((i + d + beads.length) % beads.length, true); }
    });
  });
  choose(0);

  // ---------------------------------------------------------------- Aya: cameo tilt, odometers
  var cameo = $('[data-cameo]'), rim = $('.c-rim'), sheen = $('.c-sheen'), pedge = $('[data-pedge]'), ayaSec = $('[data-aya]');
  cameo.addEventListener('pointermove', function (e) {
    if (still()) return;
    var r = rim.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
    rim.style.setProperty('--ty', (nx * 16).toFixed(2) + 'deg'); rim.style.setProperty('--tx', (ny * -12).toFixed(2) + 'deg');
    sheen.style.setProperty('--sx', ((nx + .5) * 100).toFixed(1) + '%'); sheen.style.setProperty('--sy', ((ny + .5) * 100).toFixed(1) + '%');
  });
  cameo.addEventListener('pointerleave', function () { rim.style.setProperty('--ty', '0deg'); rim.style.setProperty('--tx', '0deg'); });

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

  // ---------------------------------------------------------------- the room: labels placed on the photo (object-fit: cover, 50% 45%)
  var room = $('[data-room]'), rfig = $('[data-rfig]'), rimg = $('img', rfig), spots = $$('.spot', rfig), rrose = $('[data-rrose]');
  function placeSpots() {
    var W = rfig.offsetWidth, Hh = rfig.offsetHeight, iw = 721, ih = 1600, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s, ox = (W - dw) * .5, oy = (Hh - dh) * .45;
    spots.forEach(function (sp) {
      var x = ox + dw * +sp.dataset.x, y = oy + dh * +sp.dataset.y;
      sp.style.left = x + 'px'; sp.style.top = y + 'px';
      sp.classList.toggle('flip', x > W * .55);
      sp.hidden = x < 10 || x > W - 10 || y < 10 || y > Hh - 10;
    });
  }
  function spotOn(sp, on) {
    if (on === sp.classList.contains('on')) return;
    sp.classList.toggle('on', on);
    var tag = $('.tag', sp); if (!on) { clearInterval(tag._t); tag.textContent = ''; return; }
    decode(tag, sp.dataset[he() ? 'he' : 'en'], 600);
  }
  spots.forEach(function (sp) { sp.addEventListener('click', function () { sp._pin = !sp.classList.contains('on'); spotOn(sp, sp._pin); }); });

  // ---------------------------------------------------------------- reviews on the lid
  var revs = $('[data-revs]'), lid = $('[data-lid]'), rvs = $$('[data-rv]'), rdots = $$('[data-rvdots] i'), rcount = $('[data-rv-count]'), rvIdx = 0, rvManual = -1, lidSpin = 0;
  function showRv(i) {
    i = (i + rvs.length) % rvs.length; if (i === rvIdx && rvs[i].classList.contains('on')) return;
    rvIdx = i;
    rvs.forEach(function (r, k) { r.classList.toggle('on', k === i); r.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
    rdots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
    rcount.textContent = (i + 1) + ' / ' + rvs.length;
  }
  function revsSpan() { return Math.max(1, revs.offsetHeight - innerHeight); }
  function stepRv(d) {
    var to = (rvIdx + d + rvs.length) % rvs.length;
    if (still()) { lidSpin += d * 72; lid.style.setProperty('--lr', lidSpin + 'deg'); showRv(to); return; }
    var top = revs.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + (to + .5) / rvs.length * revsSpan(), behavior: 'smooth' });
  }
  $('[data-rv-prev]').addEventListener('click', function () { stepRv(-1); });
  $('[data-rv-next]').addEventListener('click', function () { stepRv(1); });
  (function () {   // a sideways drag on the lid turns it to the next review
    var wrap = $('[data-lidwrap]'), x0 = null;
    wrap.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    wrap.addEventListener('pointerup', function (e) { if (x0 === null) return; var dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) stepRv((dx < 0 ? 1 : -1) * (rtl() ? -1 : 1)); });
  })();
  showRv(0);

  // ---------------------------------------------------------------- the note to Aya (the live thing)
  var picks = $$('[data-pick]'), whens = $$('[data-when]'), weekEl = $('[data-week]'), jin = $('[data-jin]'), steps = $$('[data-step]'), msgEl = $('[data-msg]'), sendBtn = $('[data-send]');
  var day = -1, shown = '', typing = 0, noteSeen = false;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function firstDay() { var n = now(), d = n.d; for (var k = 0; k < 7; k++) { var t = H[d]; if (t && !(k === 0 && n.h > t[1] - 2)) return d; d = (d + 1) % 7; } return 0; }
  function buildWeek() {
    if (day < 0) day = firstDay();
    var l = he();
    weekEl.innerHTML = '';
    for (var d = 0; d < 7; d++) {
      var t = H[d], b = document.createElement('button');
      b.type = 'button'; b.className = 'day'; b.setAttribute('role', 'radio'); b.dataset.d = d;
      b.setAttribute('aria-checked', d === day ? 'true' : 'false');
      b.setAttribute('aria-label', (l ? 'יום ' + dayHe[d] : dayEn[d]) + (t ? '' : (l ? ', סגור' : ', closed')));
      b.innerHTML = '<span>' + (l ? shortHe : shortEn)[d] + '</span><small dir="ltr">' + (t ? t[0] + '–' + t[1] : (l ? 'סגור' : 'closed')) + '</small>';
      if (!t) b.disabled = true;
      b.addEventListener('click', function () { day = +this.dataset.d; $$('.day', weekEl).forEach(function (x) { x.setAttribute('aria-checked', +x.dataset.d === day ? 'true' : 'false'); }); fitWhen(); lightStep(1); write(); });
      weekEl.appendChild(b);
    }
    fitWhen();
  }
  function fitWhen() {   // Friday closes at 14:00, so no afternoon then
    var t = H[day], noPm = t && t[1] <= 15;
    whens[1].disabled = noPm;
    if (noPm && whens[1].getAttribute('aria-checked') === 'true') { whens[1].setAttribute('aria-checked', 'false'); whens[0].setAttribute('aria-checked', 'true'); }
  }
  whens.forEach(function (b) { b.addEventListener('click', function () { if (b.disabled) return; whens.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lightStep(1); write(); }); });
  function fillJar() {
    var on = picks.filter(function (p) { return p.getAttribute('aria-pressed') === 'true'; });
    var have = $$('b', jin);
    have.forEach(function (b) { if (on.indexOf(b._p) < 0) b.remove(); });
    on.forEach(function (p) {
      if ($$('b', jin).some(function (b) { return b._p === p; })) return;
      var b = document.createElement('b'); b._p = p; b.className = 'new'; jin.appendChild(b);
    });
    $$('b', jin).forEach(function (b, k) { var W = jin.clientWidth, cols = W > 80 ? 3 : 2, gap = (W - cols * 22) / (cols + 1); b.style.left = (gap + (k % cols) * (22 + gap)).toFixed(1) + 'px'; b.style.bottom = (6 + Math.floor(k / cols) * 19) + 'px'; });
  }
  picks.forEach(function (p) { p.addEventListener('click', function () { p.setAttribute('aria-pressed', p.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); fillJar(); lightStep(0); write(); }); });
  sendBtn.addEventListener('pointerenter', function () { lightStep(2); });
  sendBtn.addEventListener('focus', function () { lightStep(2); });
  sendBtn.addEventListener('click', function () { lightStep(2); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), chosen = picks.filter(function (p) { return p.getAttribute('aria-pressed') === 'true'; }).map(function (p) { return p.dataset[l ? 'he' : 'en']; });
    var w = whens.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], when = w.dataset[l ? 'he' : 'en'];
    return l ? 'שלום איה, אשמח לקבוע תור ל' + (chosen.length ? list(chosen, true) : 'טיפול') + '. מתאים לי ביום ' + dayHe[day] + ' ' + when + '. תודה!'
             : 'Hi Aya, I’d like to book ' + (chosen.length ? list(chosen, false) : 'a treatment') + '. ' + dayEn[day] + ' ' + when + ' would suit me. Thank you!';
  }
  function write(instant) {
    if (day < 0) return;
    var target = compose();
    sendBtn.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !noteSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 15);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-note]'), function (v) { if (v && !noteSeen) { noteSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // the rose plate beside the questions leans toward the hand
  var plate = $('[data-plate]');
  plate.addEventListener('pointermove', function (e) { if (still() || e.pointerType !== 'mouse') return; var r = plate.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5; plate.style.setProperty('--ty', (nx * 10).toFixed(2) + 'deg'); plate.style.setProperty('--tx', (ny * -8).toFixed(2) + 'deg'); });
  plate.addEventListener('pointerleave', function () { plate.style.setProperty('--ty', '0deg'); plate.style.setProperty('--tx', '0deg'); });

  // ---------------------------------------------------------------- bento spotlight
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- footer: pearls gather into her name, then the letters settle in
  var fword = $('[data-fword]'), fcv = $('[data-fpearls]'), fdone = false;
  function footPearls() {
    if (fdone || still()) { fword.classList.add('in'); return; }
    fdone = true;
    var box = fcv.parentNode, W = box.clientWidth, Hh = box.clientHeight + 40, dpr = Math.min(2, devicePixelRatio || 1), c = fcv.getContext('2d');
    fcv.width = W * dpr; fcv.height = Hh * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
    var sp = $('[lang="' + root.lang + '"]', fword), r = sp.getBoundingClientRect(), br = fcv.getBoundingClientRect(), cs = getComputedStyle(fword);
    var o = document.createElement('canvas'); o.width = W; o.height = Hh; var ox = o.getContext('2d');
    ox.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily; ox.textBaseline = 'middle'; ox.textAlign = 'center'; ox.direction = root.dir; ox.fillStyle = '#000';
    ox.fillText(sp.textContent, r.left - br.left + r.width / 2, r.top - br.top + r.height / 2);
    var data = ox.getImageData(0, 0, W, Hh).data, pts = [], st = phone() ? 6 : 8;
    for (var y = 0; y < Hh; y += st) for (var x = 0; x < W; x += st) if (data[(y * W + x) * 4 + 3] > 128) pts.push([x, y]);
    var P = pts.map(function (p) { return { tx: p[0], ty: p[1], x: Math.random() * W, y: Hh + Math.random() * 200, r: st * (.35 + Math.random() * .3), dl: Math.random() * 500 }; });
    var t0 = performance.now();
    setTimeout(function () { fword.classList.add('in'); }, 700);
    (function fr(t) {
      var T = t - t0; c.clearRect(0, 0, W, Hh);
      var fade = 1 - smooth((T - 1700) / 900);
      P.forEach(function (p) { var k = smooth((T - p.dl) / 1100); c.globalAlpha = .9 * fade; var x = lerp(p.x, p.tx, k), y = lerp(p.y, p.ty, k); c.drawImage(sprite, x - p.r, y - p.r, p.r * 2, p.r * 2); });
      c.globalAlpha = 1;
      if (fade > 0) requestAnimationFrame(fr); else c.clearRect(0, 0, W, Hh);
    })(t0);
  }
  watch($('[data-foot]'), function (v) { if (v) footPearls(); }, { threshold: .35 });

  // ---------------------------------------------------------------- the jar on phones hides while the hero buttons or the footer are in view
  var jarbar = $('[data-jarbar]'), heroActs = $('.h-acts'), actsIn = true, footIn = false;
  watch(heroActs, function (v) { actsIn = v; jarbar.classList.toggle('away', actsIn || footIn); });
  watch($('[data-foot]'), function (v) { footIn = v; jarbar.classList.toggle('away', actsIn || footIn); });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) pearls.kick();
    // necklace: the thread draws in, the pearls land on it
    var sr = strand.getBoundingClientRect(), sp = calm ? 1 : clamp((vh * .92 - sr.top) / (vh * .55), 0, 1);
    th.style.strokeDashoffset = (thLen * (1 - sp)).toFixed(1);
    beads.forEach(function (b, i) { land(b, calm || sp > tPos[i] + .04); });
    // pearl strand on the wine seam slides as you pass
    var ar = ayaSec.getBoundingClientRect();
    pedge.style.setProperty('--pe', calm ? '0px' : ((ar.top / vh) * 80 * (rtl() ? -1 : 1)).toFixed(1) + 'px');
    // the room assembles out of pearl dots
    var rp = calm ? 1 : prog(room), rt = room.getBoundingClientRect().top, e = calm ? 1 : smooth((vh * .9 - rt) / (vh * 1.5));
    if (!calm) {
      rfig.style.setProperty('--dr', (e >= 1 ? 60 : lerp(0, 19, e)).toFixed(2) + 'px');
      rfig.style.setProperty('--rs', lerp(.84, 1, e).toFixed(4));
      rfig.style.setProperty('--rr', lerp(300, 28, e).toFixed(1) + 'px');
      rrose.style.setProperty('--ry2', (rp * -120).toFixed(1) + 'px');
      // while the reviews ride up over it, the room steps back
      var cover = clamp((vh - revs.getBoundingClientRect().top) / vh, 0, 1);
      rfig.parentNode.style.filter = cover > 0 ? 'brightness(' + (1 - cover * .45).toFixed(3) + ')' : '';
    } else { rfig.style.removeProperty('--dr'); rfig.style.removeProperty('--rs'); rfig.style.removeProperty('--rr'); rfig.parentNode.style.filter = ''; }
    rfig.classList.toggle('done', calm || e >= 1);
    spots.forEach(function (s) { if (!s._pin) spotOn(s, calm || e >= 1); });
    var pl = plate.getBoundingClientRect(); plate.style.setProperty('--py', calm ? '0px' : (((pl.top + pl.height / 2) / vh - .5) * -40).toFixed(1) + 'px');
    // the lid turns with the scroll; every fifth of a turn brings the next review
    if (!calm) {
      var pr = prog(revs);
      lid.style.setProperty('--lr', (pr * 288 + scrollY * .02).toFixed(2) + 'deg');
      showRv(Math.min(rvs.length - 1, Math.floor(pr * rvs.length * .999)));
    }
  }

  function layout() { pearls.size(); strandLayout(); placeSpots(); fillJar(); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); lw = innerWidth; }, 140); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); buildWeek(); write(true); layout();
  var once = false, go = function () {
    if (once) return; once = true;
    requestAnimationFrame(function () {
      hero.classList.add('ready'); pearls.kick();
      setTimeout(function () { decoded = true; $$('[data-decode]').forEach(function (el, i) { setTimeout(function () { decode(el, el.dataset[root.lang], 800); }, i * 350); }); pearls.burst(); }, still() ? 0 : 900);
    });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { layout(); });
})();
