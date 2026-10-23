(function () {
  var root = document.documentElement, WA = '972525221010';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var TITLE = { he: 'שלו · שירותים למחשבים ולתקשורת · הרץ היינריך 2, חיפה', en: 'Shalev · Computer & network services · 2 Heinrich Hertz St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור שלו – מתן שירותים למחשבים ותקשורת · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Shalev Computer & Network Services · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'שלו – מתן שירותים למחשבים', 'Shalev Computer Services');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-nodes]', 'מה צריך טיפול', 'What needs care');
    aria('[data-t-where]', 'איפה', 'Where');
    aria('[data-t-call]', 'התקשרו לעמרי, 052-522-1010', 'Call Omri, 052-522-1010');
    aria('[data-t-wa]', 'וואטסאפ לעמרי', 'WhatsApp Omri');
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('sh-lang', l); } catch (e) {}
    texts(l); hours(); write(true); tick();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('sh-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    ring.kick(); brain.kick(); write(true); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8, 20], 1: [8, 20], 2: [8, 20], 3: [8, 20], 4: [8, 20], 5: [8, 20], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
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

  // ---------------------------------------------------------------- entrances (tiles get a stagger by their place in the grid)
  $$('.bento,.r-bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 70 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 9 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // ---------------------------------------------------------------- nav gathers into a floating pill
  var nav = $('[data-nav]');

  // ---------------------------------------------------------------- the ring of cards: turns by itself, with the scroll and with a drag
  var hero = $('[data-hero]');
  var ring = (function () {
    var wrap = $('[data-ringwrap]'), el = $('[data-ring]');
    // twelve cards make a wide, gentle arc: repeat the photo cards (copies are hidden from screen readers)
    $$('.rc:not(.rc-brain):not(.rc-rate)', el).slice(0, 4).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); el.appendChild(k); });
    var cards = $$('.rc', el), N = cards.length, step = 360 / N;
    var rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = true, last = 0;
    function R() { var cw = cards[0].offsetWidth || 200; return Math.max(cw * 1.12 / (2 * Math.tan(Math.PI / N)), phone() ? 290 : innerWidth * .42); }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (8 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var r = R(), sc = scrollY * .06 * (rtl() ? 1 : -1);
      cards.forEach(function (c, i) {
        var a = rot + sc + i * step, f = Math.cos(a * Math.PI / 180), lift = f > .95 ? (f - .95) * 20 : 0;
        c.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + (r + lift * 46).toFixed(1) + 'px) scale(' + (1 + lift * .06).toFixed(3) + ')';
        c.style.filter = 'brightness(' + (.3 + .7 * Math.pow(Math.max(f, 0), 1.6)).toFixed(3) + ')';
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    el.style.transform = 'rotateX(-7deg)';
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .25; vel = dx * 2 * (rtl() ? 1 : -1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- the circuit brain card, made of the real logo's own pixels
  var brainEl = $('[data-brain]');
  var brain = (function () {
    var cv = $('canvas', brainEl), c = cv.getContext('2d'), img = $('.brain-still', brainEl);
    var P = [], w, h, raf = 0, vis = true, t0 = 0, pulses = [], lastPulse = 0, ok = false;
    function sample() {
      try {
        var sc = document.createElement('canvas'), iw = 380, ih = 304; sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data, pts = [];
        for (var y = 0; y < ih; y += 2) for (var x = 0; x < iw; x += 2) {
          var k = (y * iw + x) * 4, diff = Math.abs(d[k] - 32) + Math.abs(d[k + 1] - 35) + Math.abs(d[k + 2] - 52);
          if (diff > 90) pts.push([x / iw, y / ih, 'rgb(' + d[k] + ',' + d[k + 1] + ',' + d[k + 2] + ')']);
        }
        var want = 1300, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) { var q = pts[Math.floor(f)]; P.push({ hx: q[0], hy: q[1], col: q[2], ph: Math.random() * 6.28, rx: Math.random() * 2 - 1, ry: Math.random() * 2 - 1, dl: Math.random() * .6 }); }
        ok = true;
      } catch (e) { ok = false; brainEl.classList.add('fallback'); }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = brainEl.clientWidth; h = brainEl.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(now) {
      raf = 0; if (!ok) return;
      var calm = still(), T = (now - t0) / 1000, cyc = T % 7;
      // assemble, hold and pulse, then scatter and come back: a brain that keeps thinking
      var gather = calm ? 1 : cyc < 1.6 ? smooth(cyc / 1.6) : cyc < 6 ? 1 : 1 - smooth((cyc - 6) / 1);
      var bw = w * .84, bh = bw * 304 / 380, ox = (w - bw) / 2, oy = h * .1;
      if (!calm && gather === 1 && now - lastPulse > 700) { lastPulse = now; var o = P[Math.floor(Math.random() * P.length)]; pulses.push({ x: ox + o.hx * bw, y: oy + o.hy * bh, t: now }); }
      pulses = pulses.filter(function (p) { return now - p.t < 1200; });
      c.clearRect(0, 0, w, h); c.globalCompositeOperation = 'lighter';
      for (var i = 0; i < P.length; i++) {
        var p = P[i], g = calm ? 1 : smooth((gather - p.dl * (1 - gather)) / 1), sp = (1 - g) * w * .7;
        var x = ox + p.hx * bw + p.rx * sp + Math.sin(T * 1.4 + p.ph) * 1.1, y = oy + p.hy * bh + p.ry * sp + Math.cos(T * 1.2 + p.ph) * 1.1;
        var glow = 0;
        for (var k = 0; k < pulses.length; k++) { var pu = pulses[k], r = (now - pu.t) * .14, dx = x - pu.x, dy = y - pu.y, dd = Math.sqrt(dx * dx + dy * dy); if (Math.abs(dd - r) < 6) glow = 1; }
        c.globalAlpha = glow ? 1 : .85; c.fillStyle = glow ? '#fff' : p.col;
        var s = glow ? 2.6 : 1.7; c.fillRect(x - s / 2, y - s / 2, s, s);
      }
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() { size(); sample(); t0 = performance.now(); kick(); }
    watch(hero, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // ---------------------------------------------------------------- bento: living tiles, a spotlight that follows the hand, a live CCTV clock, packets on the network
  var svc = $('#services'), svcOn = false;
  watch(svc, function (v) { svcOn = v; svc.classList.toggle('on', v); });
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });
  var clock = $('[data-clock]');
  setInterval(function () { if (!svcOn) return; var o = nowParts(); clock.textContent = ((o.hour % 24) < 10 ? '0' : '') + (o.hour % 24) + ':' + o.minute + ':' + o.second; }, 1000);
  var pk = $('[data-pk]'), NS = 'http://www.w3.org/2000/svg', ends = [[60, 35], [60, 135], [340, 35], [340, 135], [200, 20], [200, 150]];
  function packet(g, a, b, dur, r) {
    var c = document.createElementNS(NS, 'circle'); c.setAttribute('r', r || 4); g.appendChild(c);
    var t0 = performance.now();
    (function st(t) { var u = smooth((t - t0) / dur); c.setAttribute('cx', lerp(a[0], b[0], u)); c.setAttribute('cy', lerp(a[1], b[1], u)); if (u < 1) requestAnimationFrame(st); else c.remove(); })(t0);
  }
  setInterval(function () { if (!svcOn || still()) return; var e = ends[Math.floor(Math.random() * ends.length)]; Math.random() < .5 ? packet(pk, e, [200, 85], 800) : packet(pk, [200, 85], e, 800); }, 350);

  // ---------------------------------------------------------------- Omri: the stack fans out behind his portrait
  var fan = $('[data-fan]'), fcs = $$('.fc', fan), fanHover = false;
  fan.addEventListener('pointerenter', function () { fanHover = true; tick(); });
  fan.addEventListener('pointerleave', function () { fanHover = false; tick(); });
  function fanOut() {
    var W = fan.clientWidth, Hh = fan.clientHeight, r = fan.getBoundingClientRect();
    var e = still() ? 1 : smooth((innerHeight - r.top) / (innerHeight * .7)), k = fanHover ? 1.3 : 1;
    fcs.forEach(function (c, i) {
      var front = i === fcs.length - 1, x, y, a;
      if (front) { x = 0; y = Hh * .05 * e; a = -2 * e; }
      else { x = (i - 1.5) * W * .17 * e * k; y = -Hh * .05 * e + Math.abs(i - 1.5) * Hh * .03 * e; a = (i - 1.5) * 9 * e * k; }
      c.style.transform = 'translate(-50%,-50%) translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + a.toFixed(2) + 'deg)';
    });
  }

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');    // numerals come from CSS so only the real number is text (aria-label on the wrapper)
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 4) % 10; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- how it works: steps light up, the chat writes itself (the live thing)
  var steps = $$('[data-step]');
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  if (io) steps.forEach(function (s, i) { new IntersectionObserver(function (es) { if (es[0].isIntersecting) lightStep(i); }, { rootMargin: '-35% 0px -35% 0px' }).observe(s); }); else lightStep(2);
  var nodes = $$('[data-node]'), where = $$('[data-where]'), msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
  nodes.forEach(function (n) { n.addEventListener('click', function () { n.setAttribute('aria-pressed', n.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); lightStep(0); write(); }); });
  where.forEach(function (b) { b.addEventListener('click', function () { where.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lightStep(1); write(); }); });
  $('[data-send]').addEventListener('pointerenter', function () { lightStep(2); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = nodes.filter(function (n) { return n.getAttribute('aria-pressed') === 'true'; }).map(function (n) { return n.dataset[l ? 'he' : 'en']; });
    var w = where.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], place = w.dataset[l ? 'he' : 'en'];
    return l ? 'שלום עמרי, אשמח לעזרה עם ' + (picked.length ? list(picked, true) : 'המחשב') + '. איפה: ' + place + '.'
             : 'Hi Omri, I’d like help with ' + (picked.length ? 'the ' + list(picked, false) : 'my computer') + '. Where: ' + place + '.';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 16);
      if (n < del) { shown = cur.slice(0, cur.length - n); }
      else { shown = target.slice(0, keep + (n - del)); }
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- reviews: two copies so the drift loops
  var dr = $('[data-drtrack]'); $$('.rv', dr).forEach(function (r) { var c = r.cloneNode(true); c.setAttribute('aria-hidden', 'true'); dr.appendChild(c); });

  // ---------------------------------------------------------------- one scroll loop
  var fh = $('.f-horizon'), ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    nav.classList.toggle('pill', scrollY > 40);
    fanOut();
    var r = fh.getBoundingClientRect(), p = still() ? 1 : smooth((innerHeight - r.top) / r.height);
    fh.style.setProperty('--rise', ((1 - p) * 90).toFixed(1) + 'px');
    if (!still()) ring.kick();
  }
  addEventListener('scroll', tick, { passive: true });
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { brain.size(); tick(); }, 120); });

  texts(root.lang); hours(); write(true); tick();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
})();
