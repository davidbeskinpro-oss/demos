(function () {
  var root = document.documentElement, WA = '972547570276';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 760; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'עו״ד עדן כהן · עורך דין תעבורה · הרצל 6, טירת כרמל', en: 'Adv. Eden Cohen · Traffic lawyer · 6 Herzl St, Tirat Carmel' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור משרד עורכי דין עדן כהן · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Eden Cohen Law Office · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'משרד עורכי דין עדן כהן', 'Eden Cohen Law Office');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לעדן, 054-757-0276', 'Call Eden, 054-757-0276');
    aria('[data-t-wa]', 'וואטסאפ לעדן', 'WhatsApp Eden');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: הרצל 6, טירת כרמל' : 'Map: 6 Herzl St, Tirat Carmel'; });
    var d = $('[data-detail]'); d.placeholder = d.dataset[l === 'he' ? 'phHe' : 'phEn'];
    $$('[data-tag]').forEach(function (t) { t.textContent = t.dataset[l]; });
    decodeAll(true);
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ec-lang', l); } catch (e) {}
    texts(l); split(); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('ec-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-seal],[data-rise]').forEach(function (el) { el.classList.add('in'); });
    layout(); motes.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours: listed on Google as open 24 hours, every day. null = closed
  var H = { 0: [0, 24], 1: [0, 24], 2: [0, 24], 3: [0, 24], 4: [0, 24], 5: [0, 24], 6: [0, 24] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x) % 24, m = Math.round((x - Math.floor(x)) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  var allDay = function (t) { return t && t[0] === 0 && t[1] === 24; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    var always = [0, 1, 2, 3, 4, 5, 6].every(function (k) { return allDay(H[k]); });
    if (always) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = allDay(t) ? (l ? 'פתוח עכשיו · כל היום' : 'Open now · all day') : (l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1])); }
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
      var val = !t ? (l ? 'סגור' : 'Closed') : allDay(t) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 90 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-rise]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- letters: the hero headline and the road headline are split into letters
  function split() {
    $$('[data-split] .ln > span[lang], [data-fill] > span[lang]').forEach(function (sp) {
      if (sp.dataset.done) return; sp.dataset.done = 1;
      var i = 0;
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
            node.replaceChild(frag, c);
          } else if (c.nodeType === 1) walk(c);
        });
      })(sp);
    });
  }
  split();
  var rise = $('[data-rise]'); rise.innerHTML = rise.textContent.split('').map(function (c, i) { return '<span class="c" style="--i:' + i + '">' + (c === ' ' ? '&nbsp;' : c) + '</span>'; }).join('');

  // ---------------------------------------------------------------- labels decode out of scrambled glyphs
  var GL = 'אבגדהוזחטיכלמנסעפצקרשתABCDEFGHKLMNPRSTVXZ0123456789';
  function decode(el, instant) {
    var txt = el.dataset[he() ? 'he' : 'en'] || el.textContent; clearInterval(el._t);
    if (instant || still()) { el.textContent = txt; return; }
    var f = 0, n = txt.length;
    el._t = setInterval(function () {
      f++; var done = Math.floor(f / 2);
      el.textContent = txt.split('').map(function (c, i) { return i < done || c === ' ' || c === '·' ? c : GL[Math.floor(Math.random() * GL.length)]; }).join('');
      if (done >= n) clearInterval(el._t);
    }, 32);
  }
  function decodeAll(instant) { $$('[data-decode]').forEach(function (el) { decode(el, instant); }); }

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
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .4 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- hero: dust in the lamplight, the brand's scales sway toward the hand, the photo leans toward it
  var hero = $('[data-hero]'), nav = $('[data-nav]'), scales = $('[data-scales]'), desk = $('.fc-desk'), heroVis = true, ptrX = 0, ptrY = 0, ptrOn = false;
  hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); ptrX = (e.clientX - r.left) / r.width - .5; ptrY = (e.clientY - r.top) / r.height - .5; ptrOn = e.pointerType === 'mouse'; });
  hero.addEventListener('pointerleave', function () { ptrX = ptrY = 0; ptrOn = false; });
  var motes = (function () {
    var cv = $('[data-motes]'), c = cv.getContext('2d'), P = [], w, h, raf = 0;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 46 : 90; P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 1.8, s: .1 + Math.random() * .35, ph: Math.random() * 6.28, a: .15 + Math.random() * .45 });
    }
    function frame(t) {
      raf = 0; var T = t / 1000;
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        if (!still()) { p.y -= p.s; p.x += Math.sin(T * .6 + p.ph) * .25 + ptrX * p.s * 1.4; if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; } }
        c.globalAlpha = p.a * (.6 + .4 * Math.sin(T * 1.3 + p.ph));
        c.fillStyle = '#ecd2de'; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
      }
      c.globalAlpha = 1;
      // the scales: a slow sway, pulled by the hand on desktop, by the scroll on phones
      var tilt = still() ? 0 : Math.sin(T * .7) * 2.2 + (ptrOn ? ptrX * 9 : Math.sin(scrollY / 180) * 3) * (rtl() ? -1 : 1);
      scales.style.setProperty('--tilt', tilt.toFixed(2) + 'deg');
      if (desk.classList.contains('live')) {
        var rx = still() ? 0 : ptrOn ? -ptrY * 10 : Math.sin(T * .8) * 2.5, ry = still() ? 0 : ptrOn ? ptrX * 14 : Math.cos(T * .6) * 4;
        desk.style.setProperty('--rx', rx.toFixed(2) + 'deg'); desk.style.setProperty('--ry', ry.toFixed(2) + 'deg');
        desk.style.setProperty('--sx', (50 + ry * 3.5).toFixed(1) + '%'); desk.style.setProperty('--sy', (30 - rx * 3).toFixed(1) + '%');
      }
      if (heroVis && !still()) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    watch(hero, function (v) { heroVis = v; if (v) kick(); });
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- the road: light trails along the real lanes (photo coordinates, 1600×1067)
  var road = $('[data-road]'), cam = $('[data-roadcam]'), tags = $$('[data-tag]'), fillCh = [], roadVis = false;
  var trails = (function () {
    var cv = $('[data-trails]'), c = cv.getContext('2d'), w, h, raf = 0, S = [], last = 0, speed = 1;
    var VP = [760, 545], LANES = [[[-60, 1067], [120, 1067]], [[160, 1067], [520, 1067]], [[540, 1067], [700, 1067]], [[860, 1067], [1240, 1067]], [[1420, 900], [1600, 860]]];
    // lanes 0–2 come toward us (white), 3–4 go away (red)
    function map(x, y) { var s = Math.max(w / 1600, h / 1067), ox = (w - 1600 * s) * .47, oy = (h - 1067 * s) * .5; return [ox + x * s, oy + y * s]; }
    function spawn() { var li = Math.floor(Math.random() * LANES.length), L = LANES[li], u = Math.random(); return { lane: li, ex: lerp(L[0][0], L[1][0], u), ey: lerp(L[0][1], L[1][1], u), t: 0, v: .18 + Math.random() * .22, toward: li < 3 }; }
    function size() { var dpr = Math.min(1.5, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); S = []; for (var i = 0; i < (phone() ? 26 : 46); i++) { var s = spawn(); s.t = Math.random(); S.push(s); } }
    function pos(s, t) { var e = t * t; return map(lerp(VP[0], s.ex, e), lerp(VP[1], s.ey, e)); }   // perspective: slow near the horizon, fast up close
    function frame(now) {
      raf = 0; var dt = last ? Math.min(.05, (now - last) / 1000) : .016; last = now;
      c.clearRect(0, 0, w, h); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
      for (var i = 0; i < S.length; i++) {
        var s = S[i]; s.t += s.v * dt * speed * (s.toward ? 1 : -1);
        if (s.t > 1.05 || s.t < 0) { S[i] = spawn(); S[i].t = s.toward ? 0 : 1; continue; }
        var a = pos(s, s.t), b = pos(s, clamp(s.t - (s.toward ? .07 : -.07), 0, 1.05)), g = c.createLinearGradient(a[0], a[1], b[0], b[1]);
        var col = s.toward ? '255,236,214' : '255,92,84', al = .25 + .6 * s.t;
        g.addColorStop(0, 'rgba(' + col + ',' + al.toFixed(2) + ')'); g.addColorStop(1, 'rgba(' + col + ',0)');
        c.strokeStyle = g; c.lineWidth = .6 + s.t * 3.2; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
      }
      c.globalCompositeOperation = 'source-over';
      speed = lerp(speed, 1, .05);
      if (roadVis && !still()) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    return { size: size, kick: kick, boost: function (v) { speed = clamp(speed + v, 1, 4); } };
  })();
  watch(road, function (v) { roadVis = v; if (v) trails.kick(); });

  // ---------------------------------------------------------------- the filing drawer
  var areas = $('[data-areas]'), track = $('[data-track]'), folders = $$('.folder', track), meter = $('[data-meter]'), runX = 0;
  watch(areas, function (v) { areas.classList.toggle('on', v); });
  function areasLayout() {
    runX = Math.max(0, track.scrollWidth - innerWidth);
    areas.style.height = still() ? '' : (innerHeight + runX * 1.1) + 'px';
  }

  // ---------------------------------------------------------------- Eden: the portrait opens out of the hexagon; the logo is pressed on like a seal
  var eden = $('[data-eden]'), paper = $('.paper', eden), seal = $('[data-seal]');
  watch(seal, function (v) { if (v) seal.classList.add('in'); }, { threshold: .6 });

  // ---------------------------------------------------------------- the letter writes itself
  var topics = $$('[data-topic]'), detail = $('[data-detail]'), msgEl = $('[data-msg]'), steps = $$('[data-step]'), shown = '', typing = 0, seen = false;
  function lightStep(n) { steps.forEach(function (s, i) { s.classList.toggle('on', i <= n); }); }
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = topics.filter(function (t) { return t.checked; }).map(function (t) { return t.dataset[l ? 'he' : 'en']; }), d = detail.value.trim();
    var m = l ? (picked.length ? 'שלום עדן, אשמח להתייעץ איתך לגבי ' + list(picked, true) + '.' : 'שלום עדן, אשמח להתייעץ איתך.')
              : (picked.length ? 'Hi Eden, I’d like to consult you about ' + list(picked, false) + '.' : 'Hi Eden, I’d like to consult you.');
    return d ? m + ' ' + d : m;
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
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
  topics.forEach(function (t) { t.addEventListener('change', function () { lightStep(0); write(); }); });
  detail.addEventListener('input', function () { lightStep(1); write(true); });
  ['pointerenter', 'focus'].forEach(function (ev) { $('[data-send]').addEventListener(ev, function () { lightStep(2); }); });
  watch($('[data-letter]'), function (v) {
    if (!v || seen) return; seen = true;
    if (still()) { lightStep(0); return; }
    shown = ''; msgEl.textContent = ''; write();
    steps.forEach(function (s, i) { setTimeout(function () { s.classList.add('on'); }, 300 + i * 650); });
  }, { threshold: .45 });

  // ---------------------------------------------------------------- reviews drift both ways with the scroll
  var drift = $('[data-drift]'), rows = $$('.row', drift);

  // ---------------------------------------------------------------- spotlight under the hand on the contact tiles
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- one scroll loop
  var ticking = false, lastY = scrollY;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, dy = scrollY - lastY; lastY = scrollY;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) motes.kick();

    // road: the camera pushes in, the headline fills, tags arrive, then the drawer lands over it
    var rp = calm ? 1 : prog(road);
    if (!calm) {
      cam.style.setProperty('--z', (1.04 + smooth(rp) * .5).toFixed(4));
      trails.boost(Math.abs(dy) * .004);
    } else cam.style.removeProperty('--z');
    var lit = calm ? 1 : clamp((rp - .02) / .4, 0, 1), chs = $$('[data-fill] .ch');
    chs.forEach(function (c, i) { c.classList.toggle('lit', i < lit * chs.length); });
    tags.forEach(function (t, i) { t.classList.toggle('on', calm || (rp > .2 + i * .1 && rp < .7)); });

    // the drawer runs sideways; each folder leans as it passes the middle
    if (!calm) {
      var ap = prog(areas), x = runX * ap * (rtl() ? 1 : -1);
      track.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
      meter.style.setProperty('--m', ap.toFixed(3));
      var mid = innerWidth / 2;
      folders.forEach(function (f) {
        var r = f.getBoundingClientRect(), off = clamp((r.left + r.width / 2 - mid) / innerWidth, -1, 1);
        f.style.transform = 'rotateY(' + (-off * 18).toFixed(2) + 'deg) translateZ(' + (-Math.abs(off) * 60).toFixed(1) + 'px)';
      });
    }

    // Eden: the hexagon iris opens as the section arrives
    var er = eden.getBoundingClientRect(), ep = calm ? 1 : smooth((vh - er.top) / (vh * .85));
    paper.style.setProperty('--r', calm ? 1 : lerp(.16, 1, ep).toFixed(3));
    paper.style.setProperty('--ps', calm ? 1 : lerp(1.18, 1, ep).toFixed(3));

    // reviews: two rows drift in opposite directions
    var dr = drift.getBoundingClientRect(), dp = calm ? 0 : clamp((vh - dr.top) / (vh + dr.height), 0, 1);
    rows.forEach(function (r, i) {
      if (calm || phone()) { r.style.transform = ''; return; }
      var run = Math.max(0, r.scrollWidth - innerWidth), s = i ? dp : 1 - dp;
      r.style.transform = 'translate3d(' + ((rtl() ? 1 : -1) * run * s).toFixed(1) + 'px,0,0)';
    });
  }

  var foot = $('[data-foot]');
  function layout() {
    motes.size(); trails.size(); areasLayout();
    foot.classList.toggle('flat', still() || foot.offsetHeight > innerHeight * .9);
    tick();
  }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () {
    if (once) return; once = true;
    requestAnimationFrame(function () { hero.classList.add('ready'); decodeAll(); setTimeout(function () { desk.classList.add('live'); }, 1900); });
  };
  if (still()) { hero.classList.add('ready'); desk.classList.add('live'); once = true; }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 400);
  addEventListener('load', layout);
})();
