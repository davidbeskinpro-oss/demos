(function () {
  var root = document.documentElement, WA = '972505747660';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var TITLE = { he: 'ירון זינמן · משרד עורכי דין · שושנה דמארי 4, קריית מוצקין', en: 'Yaron Zinman · Law Office · 4 Shoshana Damari St, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור משרד עורכי דין - ירון זינמן · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Yaron Zinman Law Office · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'משרד עורכי דין ירון זינמן', 'Yaron Zinman Law Office');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לירון, 050-574-7660', 'Call Yaron, 050-574-7660');
    aria('[data-t-wa]', 'וואטסאפ לירון', 'WhatsApp Yaron');
    $$('[data-decode]').forEach(function (d) { d.textContent = d.dataset[l]; d._done = true; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('yz-lang', l); } catch (e) {}
    texts(l); hours(); write(true); splitAll(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });
  texts(root.lang);

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('yz-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    texts(root.lang); dust.kick(); write(true); layout();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9, 18], 1: [9, 18], 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 13], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
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
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 70 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- letters: the hero name and the footer wordmark
  function split(el) { var i = 0; el.innerHTML = el.textContent.split('').map(function (c) { return c === ' ' ? ' ' : '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join(''); }
  function splitAll() {
    $$('[data-name] .w').forEach(function (w) { if (!w.querySelector('.ch')) split(w); });
    $$('[data-fword] > span').forEach(function (w) { if (!w.querySelector('.ch')) split(w); });
  }
  splitAll();

  // ---------------------------------------------------------------- review words decode out of letters
  var GLY = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHKLMNPRSTVXZ' };
  function decode(el) {
    var l = root.lang, txt = el.dataset[l], pool = GLY[l], t0 = performance.now(), dur = 900;
    if (still()) { el.textContent = txt; return; }
    (function st(t) {
      var p = (t - t0) / dur, n = Math.floor(txt.length * clamp(p, 0, 1)), out = txt.slice(0, n);
      for (var k = n; k < txt.length; k++) out += txt[k] === ' ' ? ' ' : pool[Math.floor(Math.random() * pool.length)];
      el.textContent = out;
      if (p < 1) requestAnimationFrame(st); else el.textContent = txt;
    })(t0);
  }
  $$('[data-decode]').forEach(function (d, i) {
    d.textContent = d.dataset[root.lang];
    if (!still() && io) { d.style.opacity = '0'; watch(d, function (v) { if (v && !d._seen) { d._seen = true; d.style.opacity = ''; setTimeout(function () { decode(d); }, i * 260); } }, { threshold: .6 }); }
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
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), sitter = $('[data-sitter] img'), words = $$('[data-name] .w');

  // ---------------------------------------------------------------- gold dust made of the real logo: it gathers into the monogram, then drifts in the studio light
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), img = $('[data-logosrc]'), P = [], w, h, raf = 0, vis = true, t0 = 0, mx = -999, my = -999, ok = false;
    function sample() {
      try {
        var sc = document.createElement('canvas'), iw = 160, ih = 125; sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data, pts = [];
        for (var y = 0; y < ih; y += 2) for (var x = 0; x < iw; x += 2) {
          var k = (y * iw + x) * 4, r = d[k], g = d[k + 1], b = d[k + 2];
          if (r > 120 && r > b + 30) pts.push([x / iw, y / ih, 'rgb(' + Math.min(255, r + 30) + ',' + Math.min(255, g + 25) + ',' + b + ')']);   // the gold strokes only
        }
        var want = innerWidth < 700 ? 700 : 1300, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) { var q = pts[Math.floor(f)]; P.push({ hx: q[0], hy: q[1], col: q[2], dl: Math.random() * .4, ph: Math.random() * 6.28, fx: Math.random(), fy: Math.random(), sp: .3 + Math.random() * .7, x: 0, y: 0, vx: 0, vy: 0 }); }
        ok = true;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(nw) {
      raf = 0; if (!ok) return;
      var calm = still(), T = (nw - t0) / 1000;
      c.clearRect(0, 0, w, h);
      if (calm) return;
      // monogram above his shoulder, then it lets go into dust
      var mw = Math.min(w * .3, 300), mh = mw * 125 / 160, ox = rtl() ? w * .12 : w - w * .12 - mw, oy = h * .1;
      if (innerWidth < 820) { mw = w * .5; mh = mw * 125 / 160; ox = (w - mw) / 2; oy = h * .2; }
      var gather = smooth(T / .9), letgo = smooth((T - 1.5) / 1.6);
      var sy = hero.getBoundingClientRect().top;
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        var mxp = ox + p.hx * mw, myp = oy + p.hy * mh;
        var fx = p.fx * w + Math.sin(T * .3 * p.sp + p.ph) * 30, fy = ((p.fy * h - T * 12 * p.sp - sy * .2 * p.sp) % h + h) % h;
        var tx = lerp(mxp, fx, letgo), ty = lerp(myp, fy, letgo);
        if (gather < 1) { tx = lerp(p.fx * w, tx, smooth((T - p.dl) / .8)); ty = lerp(h, ty, smooth((T - p.dl) / .8)); }
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 12000) { var fo = (12000 - d2) / 12000 * 3, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * fo; p.vy += dy / dd * fo; }
        p.vx = (p.vx + (tx - p.x) * .08) * .8; p.vy = (p.vy + (ty - p.y) * .08) * .8;
        if (T < .05) { p.x = tx; p.y = ty; } else { p.x += p.vx; p.y += p.vy; }
        c.globalAlpha = lerp(.95, .55, letgo) * (.6 + .4 * Math.sin(T * 2 + p.ph));
        c.fillStyle = p.col; var s = lerp(2.2, 1.6 + p.sp * 1.6, letgo);
        c.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
      c.globalAlpha = 1;
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() { size(); sample(); t0 = performance.now(); kick(); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // studio light follows the hand; on touch it drifts by itself
  var lx = .7, ly = .3, tlx = .7, tly = .3, hand = false;
  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return; hand = true;
    var r = hero.getBoundingClientRect(); tlx = (e.clientX - r.left) / r.width; tly = (e.clientY - r.top) / r.height;
  });
  (function light(t) {
    if (!still() && scrollY < hero.offsetHeight) {
      if (!hand) { tlx = .5 + Math.sin(t / 2600) * .3; tly = .32 + Math.cos(t / 3400) * .12; }
      lx += (tlx - lx) * .06; ly += (tly - ly) * .06;
      hero.style.setProperty('--lx', (lx * 100).toFixed(2) + '%'); hero.style.setProperty('--ly', (ly * 100).toFixed(2) + '%');
      sitter.style.setProperty('--tilt', ((lx - .5) * 6).toFixed(2) + 'deg');
    }
    requestAnimationFrame(light);
  })(0);

  // ---------------------------------------------------------------- who: the print tilts toward the hand, light passes over it
  var tilt = $('[data-tilt]');
  tilt.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return; var r = tilt.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    tilt.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg'); tilt.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
  });
  tilt.addEventListener('pointerleave', function () { tilt.style.setProperty('--ry', '0deg'); tilt.style.setProperty('--rx', '0deg'); });

  // ---------------------------------------------------------------- areas: the beam follows the hand; tap a column to light it
  var areas = $('[data-areas]'), temple = $('[data-temple]'), pillars = $$('[data-pillar]'), lintel = $('[data-lintel]'), handA = false;
  temple.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; handA = true; var r = temple.getBoundingClientRect(); areas.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); });
  pillars.forEach(function (p) {
    p.addEventListener('click', function () { pillars.forEach(function (q) { q.classList.toggle('on', q === p && !p.classList.contains('on')); }); });
    p.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { pillars.forEach(function (q) { q.classList.toggle('on', q === p); }); } });
  });
  temple.addEventListener('pointerleave', function () { pillars.forEach(function (q) { q.classList.remove('on'); }); });

  // ---------------------------------------------------------------- write: the card turns over, the form writes the message
  var flip = $('[data-flip]'), form = $('[data-form]'), msgEl = $('[data-msg]'), send = $('[data-send]'), steps = $$('[data-step]'), shown = '', typing = 0, seen = false;
  function lightStep(n) { steps.forEach(function (s, i) { s.classList.toggle('on', i <= n); }); }
  $('[data-turn]').addEventListener('click', function () { flip.classList.toggle('turned'); });
  watch(flip, function (v) { if (v && !seen) { seen = true; if (!still()) setTimeout(function () { flip.classList.add('turned'); setTimeout(function () { shown = ''; write(); }, 500); }, 350); else flip.classList.add('turned'); } }, { threshold: .45 });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), k = l ? 'he' : 'en';
    var picked = $$('input[type=checkbox]:checked', form).map(function (i) { return i.dataset[k]; });
    var how = $('input[name=how]:checked', form).dataset[k];
    return l ? 'שלום ירון, אשמח להתייעץ איתך' + (picked.length ? ' בנושא ' + list(picked, true) : '') + '. נוח לי ' + how + '.'
             : 'Hello Yaron, I’d like to consult you' + (picked.length ? ' about ' + list(picked, false) : '') + '. ' + how.charAt(0).toUpperCase() + how.slice(1) + ' would suit me.';
  }
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !seen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  form.addEventListener('change', function (e) { lightStep(e.target.type === 'radio' ? 1 : 0); write(); });
  send.addEventListener('pointerenter', function () { lightStep(2); });
  send.addEventListener('focus', function () { lightStep(2); });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var revs = $('[data-revs]'), rail = $('[data-rail]'), foot = $('[data-foot]'), fword = $('[data-fword]'), farc = $('.f-arc'), dock = $('[data-dock]'), write0 = $('[data-write]');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function enter(el, a, b) { var r = el.getBoundingClientRect(), vh = innerHeight; return clamp((vh * a - r.top) / (vh * b), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // hero: the two words of his name climb apart, the portrait settles back
    var hr = hero.getBoundingClientRect(), hp = calm ? 0 : clamp(-hr.top / hr.height, 0, 1);
    words.forEach(function (w, i) { w.style.transform = calm ? '' : 'translate3d(' + ((i ? 1 : -1) * hp * 12 * (rtl() ? -1 : 1)).toFixed(2) + 'vw,' + (-hp * (i ? 30 : 70)).toFixed(1) + 'px,0)'; });
    $('[data-sitter]').style.transform = calm ? '' : 'translateY(' + (hp * 60).toFixed(1) + 'px)';
    // who: the print drifts, the light passes
    var tp = calm ? .5 : enter(tilt, 1, 1.4);
    tilt.style.setProperty('--py', ((tp - .5) * -30).toFixed(1) + 'px'); tilt.style.setProperty('--gx', lerp(-70, 70, tp).toFixed(1) + '%');
    // areas: the gold seam widens, the columns rise one after another, the lintel lands on them
    var ap = calm ? 1 : enter(areas, 1.05, .7);
    areas.style.setProperty('--k', ap.toFixed(3));
    var tpp = calm ? 1 : enter(temple, 1, .75);
    pillars.forEach(function (p, i) { var o = rtl() ? i : 2 - i; p.style.setProperty('--up', smooth((tpp - o * .14) / .5).toFixed(3)); });
    var ll = calm ? 1 : smooth((tpp - .6) / .3);
    lintel.style.setProperty('--lt', ll.toFixed(3)); lintel.style.setProperty('--lo', clamp(ll * 1.6, 0, 1).toFixed(3));
    if (!handA && !calm) areas.style.setProperty('--sx', (50 + Math.sin(tpp * 3.4) * 30).toFixed(1) + '%');
    // write: steps light up as you read down
    if (!calm && seen) { var wp = enter(write0, .9, 1.2); if (wp > .55 && !steps[0].classList.contains('on') && !form.querySelector(':checked[type=checkbox]')) lightStep(0); }
    // reviews: the rail slides sideways while the section is held
    if (calm) rail.style.removeProperty('--rx');
    else { var rp = prog(revs), dist = Math.max(0, rail.scrollWidth - innerWidth); rail.style.setProperty('--rx', ((rtl() ? 1 : -1) * rp * dist).toFixed(1) + 'px'); }
    // footer: the curtain lifts, the wordmark rises letter by letter, the gold arc climbs
    var fr = foot.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / (fr.height * .8));
    fword.style.setProperty('--fp', fp.toFixed(3)); farc.style.setProperty('--rise', ((1 - fp) * 80).toFixed(1) + 'px');
    if (dock) dock.classList.toggle('away', fr.top < vh * .55);
  }

  function layout() { dust.size(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 900);
  addEventListener('load', tick);
})();
