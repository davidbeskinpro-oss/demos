(function () {
  var root = document.documentElement, WA = '972585596355';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'הלנייז · בוטיק יופי · וולפסון 3, חיפה', en: 'Helenayz · Beauty boutique · 3 Wolfson St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור הלנייז – Helenayz בוטיק יופי · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Helenayz Beauty Boutique · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'הלנייז', 'Helenayz');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-arc]', 'קשת הטיפולים: גררו או השתמשו בחצים', 'Treatments arc: drag or use the arrow keys');
    aria('[data-t-call]', 'התקשרו להלנה, 058-559-6355', 'Call Helena, 058-559-6355');
    $('[data-t-map]').title = l === 'he' ? 'מפה: וולפסון 3, חיפה' : 'Map: 3 Wolfson St, Haifa';
    $$('[data-tag]').forEach(function (t) { decode(t, t.dataset[l]); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('hz-lang', l); } catch (e) {}
    texts(l); hours(); write(true); arc.name(true); tick();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('hz-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-word]').forEach(function (el) { el.classList.add('in'); });
    petals.kick(); arc.place(); write(true); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- glyph decode (labels settle out of scrambled letters)
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'abcdefghijklmnopqrstuvwxyz' };
  function decode(el, txt) {
    clearInterval(el._d);
    if (still()) { el.textContent = txt; return; }
    var set = /[א-ת]/.test(txt) ? GL.he : GL.en, n = 0, steps = 14;
    el._d = setInterval(function () {
      n++;
      var keep = Math.floor(txt.length * n / steps);
      el.textContent = txt.split('').map(function (c, i) { return i < keep || c === ' ' ? c : set[Math.floor(Math.random() * set.length)]; }).join('');
      if (n >= steps) { clearInterval(el._d); el.textContent = txt; }
    }, 40);
  }
  // the hero's treatment line cycles through her treatments
  var dec = $('[data-decode]'), di = 0;
  function cycle() { var list = dec.dataset[he() ? 'he' : 'en'].split('|'); di = (di + 1) % list.length; decode(dec, list[di]); }
  setInterval(function () { if (!still() && !document.hidden) cycle(); }, 2600);

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed; [0,24] = all day
  var H = { 0: [0, 24], 1: [0, 24], 2: [0, 24], 3: [0, 24], 4: [0, 24], 5: [0, 24], 6: [0, 24] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  var allDay = function (t) { return t && t[0] === 0 && t[1] === 24; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    var always = [0, 1, 2, 3, 4, 5, 6].every(function (d) { return allDay(H[d]); });
    if (always) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות, כל השבוע (לפי גוגל)' : 'Open now · 24 hours, all week (per Google)'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
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
  // consecutive days with the same hours share a row; the week starts on Sunday
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : allDay(t) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-word]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline + footer word: letter by letter
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 6 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });
  var word = $('[data-word]');
  word.innerHTML = word.textContent.split('').map(function (c, i) { return '<span class="ch" aria-hidden="true" style="--i:' + i + '">' + c + '</span>'; }).join('');

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- rose petals drifting over the hero, moving away from the hand
  var petals = (function () {
    var cv = $('[data-petals]'), c = cv.getContext('2d'), w, h, ps = [], raf = 0, vis = true, px = -999, py = -999;
    var COL = ['rgba(143,29,69,', 'rgba(168,50,90,', 'rgba(217,176,106,', 'rgba(248,227,218,'];
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = innerWidth < 700 ? 22 : 42;
      ps = []; for (var i = 0; i < n; i++) ps.push(make(true));
    }
    function make(any) {
      return { x: Math.random() * w, y: any ? Math.random() * h : -20, s: 8 + Math.random() * 14, r: Math.random() * 6.28, vr: (Math.random() - .5) * .03,
        vy: .25 + Math.random() * .5, vx: (Math.random() - .5) * .3, ph: Math.random() * 6.28, c: COL[Math.floor(Math.random() * COL.length)], a: .35 + Math.random() * .45, ox: 0, oy: 0 };
    }
    function petal(p) {
      c.save(); c.translate(p.x + p.ox, p.y + p.oy); c.rotate(p.r); c.scale(1, .55 + .45 * Math.abs(Math.sin(p.ph)));
      c.fillStyle = p.c + p.a + ')'; c.beginPath(); c.moveTo(0, -p.s);
      c.bezierCurveTo(p.s * .9, -p.s * .6, p.s * .7, p.s * .6, 0, p.s);
      c.bezierCurveTo(-p.s * .7, p.s * .6, -p.s * .9, -p.s * .6, 0, -p.s); c.fill(); c.restore();
    }
    function frame() {
      raf = 0; c.clearRect(0, 0, w, h);
      if (still()) return;
      ps.forEach(function (p, i) {
        p.ph += .03; p.y += p.vy; p.x += p.vx + Math.sin(p.ph) * .35; p.r += p.vr;
        var dx = p.x - px, dy = p.y - py, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 140) { var f = (140 - d) / 140 * 26; p.ox += (dx / (d || 1) * f - p.ox) * .12; p.oy += (dy / (d || 1) * f - p.oy) * .12; }
        else { p.ox *= .94; p.oy *= .94; }
        if (p.y > h + 20 || p.x < -30 || p.x > w + 30) ps[i] = make(false);
        petal(p);
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { px = py = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- the hero photo leans toward the hand, a soft light follows
  var stage = $('[data-tilt]'), photo = $('.h-photo', stage);
  stage.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    photo.style.transform = 'rotateY(' + ((x - .5) * 7).toFixed(2) + 'deg) rotateX(' + ((.5 - y) * 6).toFixed(2) + 'deg)';
    photo.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); photo.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
  });
  stage.addEventListener('pointerleave', function () { photo.style.transform = ''; });
  function tags() {
    var fr = photo.getBoundingClientRect(), dots = $$('.m-dots circle', photo);
    $$('[data-tag]', photo).forEach(function (t, i) { var r = dots[i].getBoundingClientRect(); t.style.setProperty('--x', ((r.left + r.width / 2 - fr.left) / fr.width * 100).toFixed(2) + '%'); t.style.setProperty('--y', ((r.top + r.height / 2 - fr.top) / fr.height * 100).toFixed(2) + '%'); });
  }

  // ---------------------------------------------------------------- the arc of her photos: turns with scroll and with a drag
  var arc = (function () {
    var wrap = $('[data-arcwrap]'), ring = $('[data-arc]'), cards = $$('.ac', ring), nameEl = $('[data-arcname]'), N = cards.length;
    var drag = 0, base = 0, startX = null, last = -1, ang = 0;
    function place() {
      if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; c.style.zIndex = ''; }); return; }
      var cw = cards[0].offsetWidth, R = Math.min(innerWidth * .3, cw * 1.6);
      var sp = $('[data-arcsec]').getBoundingClientRect();
      base = (innerHeight - sp.top) / (innerHeight + sp.height) * 160;
      ang = base + drag;
      var front = 0, best = 1e9;
      cards.forEach(function (c, i) {
        var a = ((i * 360 / N - ang) % 360 + 540) % 360 - 180, rad = a * Math.PI / 180;
        var z = Math.cos(rad);
        c.style.transform = 'translateX(' + (Math.sin(rad) * R * 1.25).toFixed(1) + 'px) translateZ(' + ((z - 1) * R * .9).toFixed(1) + 'px) rotateY(' + (a * .5).toFixed(1) + 'deg)';
        c.style.filter = 'brightness(' + (.55 + .45 * (z + 1) / 2).toFixed(2) + ')';
        c.style.zIndex = Math.round(z * 100) + 100;
        if (Math.abs(a) < best) { best = Math.abs(a); front = i; }
      });
      if (front !== last) { last = front; name(); }
    }
    function name(force) { var c = cards[Math.max(0, last)]; if (c) decode(nameEl, c.dataset[he() ? 'he' : 'en']); }
    wrap.addEventListener('pointerdown', function (e) { startX = e.clientX; wrap.setPointerCapture(e.pointerId); });
    wrap.addEventListener('pointermove', function (e) { if (startX === null) return; drag += (e.clientX - startX) * (root.dir === 'rtl' ? .25 : -.25); startX = e.clientX; place(); });
    wrap.addEventListener('keydown', function (e) { if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return; e.preventDefault(); drag += (e.key === 'ArrowRight' ? 1 : -1) * (root.dir === 'rtl' ? -60 : 60); place(); });
    var end = function () { startX = null; };
    wrap.addEventListener('pointerup', end); wrap.addEventListener('pointercancel', end);
    return { place: place, name: name };
  })();

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span>' + ch + '</span>';
      var s = ''; for (var k = 0; k < 10; k++) s += '<i data-n="' + k + '"></i>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + s + '</span></span>';
    }).join('');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 6) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    if (still()) { roll(o, true); return; }
    roll(o, false);
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { setTimeout(function () { roll(o, true); }, 60); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- bento spotlight, poppy print follows the hand
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) {
    var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px');
    if (!still()) { t.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3)); t.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3)); }
  }); });

  // laser flash runs only while its chapter is on screen
  var lz = $('[data-laser]'); watch(lz, function (v) { lz.classList.toggle('on', v); });

  // ---------------------------------------------------------------- the flower composer: petals → a WhatsApp message that writes itself
  var pts = $$('.pt'), steps = $$('[data-step]'), msgEl = $('[data-msg]'), send = $('[data-send]'), shown = '', typing = 0, chatSeen = false;
  function lightStep(n) { steps.forEach(function (s, i) { s.classList.toggle('on', i <= n); }); }
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = pts.filter(function (p) { return p.getAttribute('aria-pressed') === 'true'; }).map(function (p) { return p.dataset[l ? 'he' : 'en']; });
    if (!picked.length) return l ? 'היי הלנה, הגעתי מהאתר. אשמח לשמוע על הטיפולים בבוטיק.' : 'Hi Helena, I found you through the website. I’d love to hear about the treatments at the boutique.';
    return l ? 'היי הלנה, הגעתי מהאתר. אשמח לקבוע תור ל' + list(picked, true) + '. מתי יש מקום?'
      : 'Hi Helena, I found you through the website. I’d like to book ' + list(picked, false) + '. When do you have a slot?';
  }
  function write(instant) {
    var txt = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(txt);
    cancelAnimationFrame(typing);
    if (instant || still()) { shown = txt; msgEl.textContent = txt; return; }
    var keep = 0; while (keep < shown.length && keep < txt.length && shown[keep] === txt[keep]) keep++;
    var del = shown.length, t0 = 0;
    (function st(t) {
      if (!t0) t0 = t;
      var k = Math.floor((t - t0) / 16);
      if (del > keep) { del = Math.max(keep, shown.length - k * 2); msgEl.textContent = shown.slice(0, del); if (del > keep) { typing = requestAnimationFrame(st); return; } shown = shown.slice(0, keep); t0 = t; k = 0; }
      var n = Math.min(txt.length, keep + Math.floor((t - t0) / 22));
      msgEl.textContent = txt.slice(0, n);
      if (n < txt.length) typing = requestAnimationFrame(st); else { shown = txt; lightStep(1); }
    })(performance.now());
  }
  pts.forEach(function (p) { p.addEventListener('click', function () { p.setAttribute('aria-pressed', p.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); lightStep(0); write(); }); });
  send.addEventListener('pointerenter', function () { lightStep(2); });
  send.addEventListener('focus', function () { lightStep(2); });
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; lightStep(0); write(); } }, { threshold: .4 });

  // reviews: duplicate the row so the drift loops without a seam
  var row = $('[data-drift] .row'); row.innerHTML += row.innerHTML.replace(/<blockquote/g, '<blockquote aria-hidden="true"');

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var chs = $$('[data-ch]'), scan = $('[data-scan]'), visit = $('[data-close]'), shrink = $('[data-shrink]'), vcards = $$('.v-cards > *');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    arc.place();
    // chapter media come alive as each card arrives; the card below darkens a little as the next lands on it
    chs.forEach(function (c, i) {
      var r = c.getBoundingClientRect(), p = calm ? 1 : smooth((vh - r.top) / (vh * .9));
      c.style.setProperty('--p', p.toFixed(3));
      var next = chs[i + 1];
      if (!calm && next && phoneW() === false) {
        var nr = next.getBoundingClientRect(), cover = clamp((r.bottom - nr.top) / r.height, 0, 1);
        c.style.transform = 'scale(' + (1 - cover * .05).toFixed(3) + ')'; c.style.filter = 'brightness(' + (1 - cover * .25).toFixed(3) + ')';
      } else { c.style.transform = ''; c.style.filter = ''; }
    });
    // the laser line wipes the boutique section in, top to bottom
    if (!calm) {
      var sr = scan.getBoundingClientRect(), sp = smooth((vh - sr.top) / (vh * .85));
      scan.classList.toggle('scan-on', sp < 1);
      scan.style.setProperty('--sp', sp.toFixed(3)); scan.style.setProperty('--bh', sr.height + 'px');
    } else scan.classList.remove('scan-on');
    // the closing photo: full screen, then it shrinks into its frame and the contact cards land
    if (!calm && innerWidth > 860) {
      var vr = visit.getBoundingClientRect(), q = clamp(-vr.top / Math.max(1, vr.height - vh), 0, 1), u = smooth(q / .6);
      var pin = shrink.parentNode, fm = $('[data-frame]'), W = pin.clientWidth, Hh = pin.clientHeight, l = fm.offsetLeft, t = fm.offsetTop, w = fm.offsetWidth, hh = fm.offsetHeight;
      shrink.style.clipPath = 'inset(' + (t * u).toFixed(1) + 'px ' + ((W - l - w) * u).toFixed(1) + 'px ' + ((Hh - t - hh) * u).toFixed(1) + 'px ' + (l * u).toFixed(1) + 'px round ' + (32 * u).toFixed(1) + 'px)';
      vcards.forEach(function (c, i) { c.style.setProperty('--cv', smooth((q - .45 - i * .05) / .2).toFixed(3)); });
    } else { shrink.style.clipPath = ''; vcards.forEach(function (c) { c.style.removeProperty('--cv'); }); }
  }
  function phoneW() { return innerWidth < 860; }
  addEventListener('scroll', tick, { passive: true });
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { petals.size(); tags(); tick(); }, 120); });

  // ---------------------------------------------------------------- start
  texts(root.lang); hours(); write(true); petals.size(); tags(); arc.place(); tick();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); petals.kick(); }); };
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(go); setTimeout(go, 280); } else go();
  addEventListener('load', tick);
})();
