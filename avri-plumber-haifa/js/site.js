(function () {
  var root = document.documentElement, WA = '972508311400';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 900; };
  var hoverable = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'אברי אינסטלטור · חיפה והסביבה · נזילות, אסלות, כיורים וניקוז', en: 'Avri, Plumber · Haifa and around · leaks, toilets, sinks and drains' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור אברי אינסטלטור בחיפה והסביבה · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Avri, Plumber in Haifa and around · This is not the business’s official website' };

  // ---------------------------------------------------------------- glyph decode for short labels
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHKLMNPRSTUVWXYZ' };
  function decode(el, text) {
    if (!el) return;
    if (el._to === text) return;
    el._to = text;
    if (still()) { clearInterval(el._dc); el.textContent = text; return; }
    var set = /[֐-׿]/.test(text) ? GL.he : GL.en, t0 = performance.now(), dur = 420;
    clearInterval(el._dc);
    el._dc = setInterval(function () {
      var k = (performance.now() - t0) / dur, n = Math.floor(text.length * k), s = '';
      for (var i = 0; i < text.length; i++) s += i < n || text[i] === ' ' ? text[i] : set[Math.floor(Math.random() * set.length)];
      el.textContent = s;
      if (k >= 1) { clearInterval(el._dc); el.textContent = text; }
    }, 40);
  }

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('[data-alt-he]').forEach(function (i) { var t = i.dataset[l === 'he' ? 'altHe' : 'altEn']; if (i.tagName === 'IMG') i.alt = t; else i.setAttribute('aria-label', t); });
    $$('[data-ph-he]').forEach(function (i) { i.placeholder = i.dataset[l === 'he' ? 'phHe' : 'phEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'אברי אינסטלציה', 'Avri Plumbing');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-jobs]', 'עבודות', 'Jobs');
    aria('[data-t-chat]', 'תצוגת ההודעה', 'Message preview');
    aria('[data-t-call]', 'התקשרו לאברי, 050-831-1400', 'Call Avri, 050-831-1400');
    aria('[data-t-wa]', 'וואטסאפ לאברי', 'WhatsApp Avri');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: מרכז זיו, חיפה' : 'Map: Merkaz Ziv, Haifa'; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('avri-lang', l); } catch (e) {}
    texts(l); hours(); write(true); mosaic.label(); work.label(true); fill.split(); wordmark.draw(true);
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('avri-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    drops.kick(); work.reset(); wordmark.draw(true); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8, 18], 1: [8, 18], 2: [8, 18], 3: [8, 18], 4: [8, 18], 5: [9, 16], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
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
  $$('.bento, .kbento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 8 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // ---------------------------------------------------------------- opening: his job photos dealt like tiles; the last becomes the hero
  (function () {
    var d = $('[data-deal]'), seen = false;
    try { seen = sessionStorage.getItem('avri-dealt') === '1'; sessionStorage.setItem('avri-dealt', '1'); } catch (e) {}
    if (still() || seen || location.hash) return;
    // deal only once its photos are decoded; if they take longer than 700ms the page simply opens without it
    var imgs = $$('img', d), t0 = performance.now(), t;
    var end = function () { d.classList.add('out'); setTimeout(function () { d.classList.remove('go', 'out'); }, 600); };
    Promise.all(imgs.map(function (i) { return i.decode ? i.decode().catch(function () {}) : 0; })).then(function () {
      if (performance.now() - t0 > 700 || still()) return;
      d.classList.add('go'); t = setTimeout(end, 1600);
    });
    d.addEventListener('click', function () { clearTimeout(t); end(); });
  })();

  // ---------------------------------------------------------------- tile grids cut from one real photo (two faces: after / before)
  function tiles(host, cols, rows, front, back) {
    host.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)';
    host.style.gridTemplateRows = 'repeat(' + rows + ',1fr)';
    host.style.direction = 'ltr';
    var out = [], html = '';
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var pos = (c / (cols - 1) * 100).toFixed(3) + '% ' + (r / (rows - 1) * 100).toFixed(3) + '%', size = cols * 100 + '% ' + rows * 100 + '%';
      var st = 'background-size:' + size + ';background-position:' + pos;
      html += '<span class="mt"><i style="background-image:url(' + front + ');' + st + '"></i><i style="background-image:url(' + back + ');' + st + '"></i></span>';
    }
    host.innerHTML = html;
    $$('.mt', host).forEach(function (el, k) { out.push({ el: el, c: k % cols, r: Math.floor(k / cols), on: false, n: Math.random() }); });
    return out;
  }
  function setOn(t, v) { if (t.on !== v) { t.on = v; t.el.classList.toggle('on', v); } }

  // ---------------------------------------------------------------- hero mosaic: tiles turn over under the hand, or in a wave by themselves
  var mosaic = (function () {
    var fig = $('[data-mosaic]'), grid = $('[data-mgrid]'), btn = $('[data-mflip]'), lab = $('[data-mstate]');
    var T = [], cols, rows, pinned = false, last = {}, wave = 0, lastMove = 0;
    function build() {
      cols = phone() ? 6 : 8; rows = phone() ? 4 : 5;
      T = tiles(grid, cols, rows, fig.dataset.after, fig.dataset.before);
    }
    function label() {
      var b = pinned || T.some(function (t) { return t.on; });
      decode(lab, he() ? (b ? 'לפני' : 'אחרי') : (b ? 'Before' : 'After'));
      btn.setAttribute('aria-pressed', pinned ? 'true' : 'false');
      $$('span[lang]', btn).forEach(function (s) { s.textContent = s.lang === 'he' ? (pinned ? 'הצג אחרי' : 'הצג לפני') : (pinned ? 'Show after' : 'Show before'); });
    }
    btn.addEventListener('click', function () {
      pinned = !pinned;
      T.forEach(function (t) { t.el.style.transitionDelay = still() ? '0ms' : ((t.c + t.r) * 35) + 'ms'; setOn(t, pinned); });
      label();
    });
    grid.addEventListener('pointermove', function (e) {
      if (pinned || still()) return;
      var r = grid.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * cols, y = (e.clientY - r.top) / r.height * rows, nowt = performance.now();
      lastMove = nowt;
      T.forEach(function (t) { var dx = t.c + .5 - x, dy = t.r + .5 - y; if (dx * dx + dy * dy < 2.2) { t.el.style.transitionDelay = '0ms'; setOn(t, true); last[t.c + ',' + t.r] = nowt; } });
      label();
    });
    grid.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') runWave(); });
    function runWave() {
      if (pinned || still()) return;
      wave = performance.now();
      T.forEach(function (t) { t.el.style.transitionDelay = ((t.c + t.r) * 55 + t.n * 60) + 'ms'; setOn(t, true); });
      label();
      setTimeout(function () { if (pinned) return; T.forEach(function (t) { t.el.style.transitionDelay = ((t.c + t.r) * 55 + t.n * 60) + 'ms'; setOn(t, false); }); label(); }, 2300);
    }
    // clear tiles the hand left; on idle (and always on touch), a diagonal wave shows the room before
    setInterval(function () {
      if (pinned || still()) return;
      var nowt = performance.now();
      if (nowt - wave > 2400) T.forEach(function (t) { var k = t.c + ',' + t.r; if (t.on && last[k] && nowt - last[k] > 900) { setOn(t, false); delete last[k]; } });
      if (nowt - lastMove > 4200 && nowt - wave > 6500 && vis) runWave();
      label();
    }, 300);
    var vis = true; watch(fig, function (v) { vis = v; });
    build(); setTimeout(runWave, 1900);
    return { build: build, label: label };
  })();

  // ---------------------------------------------------------------- the glazed wall in the hero: condensation drops run down the tiles
  var drops = (function () {
    var hero = $('[data-hero]'), cv = $('[data-ripples]'), c = cv.getContext('2d'), D = [], w, h, raf = 0, vis = true, tile = 64, lastSpawn = 0;
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function add(x, y, r) { D.push({ x: x, y: y, r: r || 2.6 + Math.random() * 3.6, vy: 0, stick: 300 + Math.random() * 900, trail: [] }); if (D.length > 70) D.shift(); }
    function seed() { D = []; for (var i = 0; i < 26; i++) add(Math.random() * w, Math.random() * h, 1.5 + Math.random() * 2.5); D.forEach(function (d) { d.stick = 1e9; }); }
    function drawDrop(d) {
      c.fillStyle = 'rgba(220,236,255,.10)';
      for (var i = 0; i < d.trail.length; i++) { var p = d.trail[i]; c.beginPath(); c.arc(p[0], p[1], d.r * .35, 0, 6.283); c.fill(); }
      var g = c.createRadialGradient(d.x - d.r * .35, d.y - d.r * .4, d.r * .1, d.x, d.y, d.r * 1.2);
      g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.35, 'rgba(190,220,255,.55)'); g.addColorStop(1, 'rgba(90,140,230,.15)');
      var ry = d.r * (1 + Math.min(d.vy * .25, .6));
      c.fillStyle = 'rgba(3,20,60,.35)'; c.beginPath(); c.ellipse(d.x + .6, d.y + 1.2, d.r * .95, ry, 0, 0, 6.283); c.fill();   // taste-skill-ignore: the drop's own shade on the glaze
      c.fillStyle = g; c.beginPath(); c.ellipse(d.x, d.y, d.r * .9, ry, 0, 0, 6.283); c.fill();
      c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(d.x - d.r * .3, d.y - ry * .4, Math.max(.7, d.r * .22), 0, 6.283); c.fill();
    }
    function frame(t) {
      raf = 0; c.clearRect(0, 0, w, h);
      var calm = still();
      if (!calm && t - lastSpawn > 520) { lastSpawn = t; add(Math.random() * w, Math.random() * h * .5); }
      for (var i = D.length - 1; i >= 0; i--) {
        var d = D[i];
        if (!calm) {
          if (d.stick > 0) d.stick -= 16; else {
            // heavier drops run; on a grout line they hesitate, then go on
            d.vy = Math.min(d.vy + .05 * d.r * .4, 1.2 + d.r * .5);
            var onGrout = (d.y % tile) < 3; if (onGrout && Math.random() < .08) { d.vy *= .2; }
            d.y += d.vy; d.x += Math.sin(d.y * .05 + d.r) * .15;
            if (d.trail.length === 0 || d.y - d.trail[d.trail.length - 1][1] > 4) { d.trail.push([d.x, d.y]); if (d.trail.length > 40) d.trail.shift(); }
            d.r -= .0025; if (d.y > h + 10 || d.r < .8) { D.splice(i, 1); continue; }
          }
        }
        drawDrop(d);
      }
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { if (still()) return; var r = hero.getBoundingClientRect(); if (Math.random() < .12) add(e.clientX - r.left + (Math.random() - .5) * 30, e.clientY - r.top, 3 + Math.random() * 2.5); D[D.length - 1] && (D[D.length - 1].stick = 120); });
    watch(hero, function (v) { vis = v; kick(); });
    size(); seed(); kick();
    return { kick: kick, size: function () { size(); seed(); kick(); } };
  })();

  // ---------------------------------------------------------------- his own line fills letter by letter; the photos fan out
  var fill = (function () {
    var el = $('[data-fill]'), sec = $('[data-words]'), fan = $('[data-fan]'), C = [];
    function split() {
      $$('span[lang]', el).forEach(function (sp) {
        if (!sp.dataset.raw) sp.dataset.raw = sp.textContent;
        sp.innerHTML = sp.dataset.raw.split(' ').map(function (w) { return '<span class="w">' + w.split('').map(function (ch) { return '<span class="c">' + ch + '</span>'; }).join('') + '</span>'; }).join(' ');
      });
      C = $$('span[lang="' + root.lang + '"] .c', el);
      update();
    }
    function update() {
      var r = sec.getBoundingClientRect(), vh = innerHeight;
      var p = still() ? 1 : clamp((vh * .85 - r.top) / (r.height * .75), 0, 1);
      var n = Math.round(p * C.length);
      C.forEach(function (c, i) { c.classList.toggle('lit', i < n); });
      fan.style.setProperty('--spread', still() ? 1 : smooth(p * 1.3).toFixed(3));
    }
    split();
    return { split: split, update: update };
  })();

  // ---------------------------------------------------------------- before / after: scroll turns the tiles over; each job lands over the last
  var work = (function () {
    var track = $('[data-wtrack]'), frames = $$('[data-frame]'), state = $('[data-wstate]'), cap = $('[data-wcap]'), thumbs = $$('[data-job]');
    var F = [], cols, rows, cur = -1, after = null, stillCur = 0, stillAfter = false;
    function build() {
      cols = phone() ? 6 : 12; rows = phone() ? 4 : 8;
      F = frames.map(function (f) { return tiles(f, cols, rows, f.dataset.before, f.dataset.after); });
    }
    function label(force) {
      var k = still() ? stillCur : Math.max(cur, 0), f = frames[k], a = still() ? stillAfter : !!after;
      if (force) { state._to = cap._to = null; }
      decode(state, he() ? (a ? 'אחרי' : 'לפני') : (a ? 'After' : 'Before'));
      decode(cap, f.dataset[he() ? 'he' : 'en']);
      thumbs.forEach(function (b, i) { b.setAttribute('aria-pressed', i === k ? 'true' : 'false'); });
      var ba = $('[data-wba]'); ba.setAttribute('aria-pressed', stillAfter ? 'true' : 'false');
      $$('span[lang]', ba).forEach(function (s) { s.textContent = s.lang === 'he' ? (stillAfter ? 'הצג לפני' : 'הצג אחרי') : (stillAfter ? 'Show before' : 'Show after'); });
    }
    function update() {
      if (still()) return;
      var r = track.getBoundingClientRect(), span = r.height - innerHeight, P = clamp(-r.top / span, 0, .9999) * F.length;
      var k = Math.floor(P), t = P - k, fp = clamp((t - .22) / .5, 0, 1);
      frames.forEach(function (f, i) {
        var land = i < k ? 1 : i === k ? (i === 0 ? 1 : smooth(t / .18)) : 0;
        f.style.setProperty('--land', land.toFixed(4));
        var all = i < k ? 1 : i === k ? fp : 0;
        F[i].forEach(function (tt) { var th = ((tt.c + tt.r) / (cols + rows - 2)) * .82 + tt.n * .16 + .01; setOn(tt, all >= th); });
      });
      var a = fp > .5;
      if (k !== cur || a !== after) { var ch = k !== cur; cur = k; after = a; label(); if (ch) {} }
    }
    function showStill() {
      frames.forEach(function (f, i) { f.classList.toggle('cur', i === stillCur); f.style.removeProperty('--land'); });
      F[stillCur].forEach(function (tt) { tt.el.style.transitionDelay = ((tt.c + tt.r) * 22) + 'ms'; setOn(tt, stillAfter); });
      label();
    }
    function reset() { if (still()) { stillAfter = false; showStill(); } else { frames.forEach(function (f) { f.classList.remove('cur'); }); F.forEach(function (g) { g.forEach(function (tt) { tt.el.style.transitionDelay = '0ms'; }); }); cur = -1; update(); } }
    thumbs.forEach(function (b, i) { b.addEventListener('click', function () {
      if (still()) { stillCur = i; stillAfter = false; showStill(); return; }
      var r = track.getBoundingClientRect(), span = r.height - innerHeight, y = scrollY + r.top + span * (i + .8) / F.length;
      scrollTo({ top: y, behavior: 'smooth' });
    }); });
    $('[data-wprev]').addEventListener('click', function () { stillCur = (stillCur + F.length - 1) % F.length; stillAfter = false; showStill(); });
    $('[data-wnext]').addEventListener('click', function () { stillCur = (stillCur + 1) % F.length; stillAfter = false; showStill(); });
    $('[data-wba]').addEventListener('click', function () { stillAfter = !stillAfter; showStill(); });
    build(); reset();
    return { build: function () { build(); reset(); }, update: update, label: label, reset: reset };
  })();

  // ---------------------------------------------------------------- bento: the glint on the glaze follows the hand
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });

  // ---------------------------------------------------------------- composer: the WhatsApp message writes itself
  var ROOM = { he: { shower: ' במקלחת', wc: ' בשירותים', kitchen: ' במטבח', balcony: ' במרפסת', other: '' }, en: { shower: ' in the shower', wc: ' in the toilet', kitchen: ' in the kitchen', balcony: ' on the balcony', other: '' } };
  var WHAT = { he: { leak: 'נזילה', clog: 'סתימה', toilet: 'תקלה באסלה', tap: 'תקלה בברז', pressure: 'בעיה בלחץ המים', other: 'תקלה באינסטלציה' }, en: { leak: 'a leak', clog: 'a blockage', toilet: 'a toilet problem', tap: 'a tap problem', pressure: 'a water pressure problem', other: 'a plumbing problem' } };
  var comp = $('[data-composer]'), bubble = $('[data-bubble]'), send = $('[data-send]'), area = $('[data-area]'), typer = 0;
  function message() {
    var l = root.lang, room = $('input[name=room]:checked', comp).value, what = $('input[name=what]:checked', comp).value, a = area.value.trim().replace(/[<>]/g, '');
    if (l === 'he') return 'שלום אברי, יש לי ' + WHAT.he[what] + ROOM.he[room] + (a ? ', באזור ' + a : '') + '. אפשר לתאם שתבוא לבדוק? אשלח גם תמונה.';
    return 'Hi Avri, I have ' + WHAT.en[what] + ROOM.en[room] + (a ? ', in the ' + a + ' area' : '') + '. Could we set a time for you to come and look? I’ll send a photo too.';
  }
  function write(instant) {
    var txt = message();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(txt);
    clearInterval(typer);
    if (instant || still()) { bubble.textContent = txt; return; }
    var i = 0; bubble.innerHTML = '<span class="car"></span>';
    typer = setInterval(function () { i += 2; bubble.innerHTML = ''; bubble.textContent = txt.slice(0, i); if (i < txt.length) bubble.insertAdjacentHTML('beforeend', '<span class="car"></span>'); else clearInterval(typer); }, 22);
  }
  comp.addEventListener('change', function (e) { $$('.step', comp).forEach(function (s) { s.classList.toggle('now', s.contains(e.target)); }); write(false); });
  area.addEventListener('input', function () { write(true); });
  area.addEventListener('focus', function () { $$('.step', comp).forEach(function (s) { s.classList.toggle('now', s.contains(area)); }); });
  var wrote = false; watch(comp, function (v) { if (v && !wrote) { wrote = true; write(false); } }, { threshold: .3 });

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    var v = o.dataset.odo;
    o.innerHTML = v.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span>' + ch + '</span>';
      return '<span class="dg" data-to="' + ch + '"></span>';
    }).join('');
    o.setAttribute('aria-label', v); o.setAttribute('role', 'img');
    var go = function () { $$('.dg', o).forEach(function (d) { d.style.transform = 'translateY(-' + (+d.dataset.to * 1.1) + 'em)'; }); };
    if (still()) { $$('.dg', o).forEach(function (d) { d.style.transition = 'none'; }); go(); }
    else watch(o, function (vv) { if (vv) go(); });
  });

  // ---------------------------------------------------------------- review rails drift; a touch holds them
  $$('[data-rail]').forEach(function (r) {
    $$('.rv', r).forEach(function (q) { var k = q.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.setAttribute('data-clone', ''); r.appendChild(k); });
    var k2 = $$('.rv:not([data-clone])', r); if (k2.length < 3) k2.forEach(function (q) { var k = q.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.setAttribute('data-clone', ''); r.appendChild(k); });
    r.style.setProperty('--dur', ($$('.rv', r).length * 11) + 's');
  });
  var rails = $('[data-rails]'), holdT = 0;
  rails.addEventListener('touchstart', function () { rails.classList.add('hold'); clearTimeout(holdT); }, { passive: true });
  rails.addEventListener('touchend', function () { holdT = setTimeout(function () { rails.classList.remove('hold'); }, 2500); });

  // ---------------------------------------------------------------- footer: his name laid in glazed tiles
  var wordmark = (function () {
    var cv = $('[data-wordmark]'), c = cv.getContext('2d'), foot = $('[data-foot]'), cells = [], W, Hh, t0 = 0, raf = 0, shown = false;
    function prep() {
      W = Math.floor(foot.clientWidth - parseFloat(getComputedStyle(foot).paddingLeft) * 2); if (W < 100) return;
      var word = he() ? 'אברי' : 'Avri', off = document.createElement('canvas'), o = off.getContext('2d');
      var fs = 100; o.font = fs + 'px "Secular One", sans-serif';
      fs = fs * (W * .99) / o.measureText(word).width; fs = Math.min(fs, 420);   // fit the name to the width
      Hh = Math.round(fs * 1.02);
      off.width = W; off.height = Hh; o.font = fs + 'px "Secular One", sans-serif'; o.textBaseline = 'alphabetic'; o.fillStyle = '#000';
      o.direction = he() ? 'rtl' : 'ltr'; o.textAlign = 'center'; o.fillText(word, W / 2, fs * .84);
      var d = o.getImageData(0, 0, W, Hh).data, cell = Math.max(7, Math.round(W / 70)); cells = [];
      for (var y = 0; y < Hh; y += cell) for (var x = 0; x < W; x += cell) {
        var a = d[((Math.min(Hh - 1, y + (cell >> 1))) * W + Math.min(W - 1, x + (cell >> 1))) * 4 + 3];
        if (a > 120) cells.push({ x: x, y: y, s: cell - 2, col: Math.random() < .06 ? '#ff4828' : ['#1d63d6', '#2a6ad6', '#3c7ce6', '#4d8bf0', '#c9d3de'][Math.floor(Math.random() * 4)], dl: (x / W) * .9 + Math.random() * .35 });
      }
      var dpr = Math.min(2, devicePixelRatio || 1); cv.width = W * dpr; cv.height = Hh * dpr; cv.style.height = Hh + 'px'; c.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function paint(T) {
      raf = 0; c.clearRect(0, 0, W, Hh); var done = true;
      cells.forEach(function (q) {
        var k = still() ? 1 : clamp((T - q.dl) / .55, 0, 1), e = 1 - Math.pow(1 - k, 3); if (k < 1) done = false; if (k <= 0) return;
        var y = q.y - (1 - e) * 60;
        c.globalAlpha = e; c.fillStyle = q.col; c.beginPath(); if (c.roundRect) c.roundRect(q.x, y, q.s, q.s, q.s * .18); else c.rect(q.x, y, q.s, q.s); c.fill();
        c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(q.x + q.s * .12, y + q.s * .12, q.s * .32, q.s * .12);
      });
      c.globalAlpha = 1;
      if (!done) raf = requestAnimationFrame(function (n) { paint((n - t0) / 1000); });
    }
    watch(foot, function (v) { if (v && !shown) { shown = true; prep(); t0 = performance.now(); paint(0); } }, { threshold: .2 });
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { if (shown || still()) { shown = true; prep(); paint(1e3); } });
    return { draw: function () { if (shown || still()) { shown = true; prep(); paint(1e3); } } };
  })();

  // ---------------------------------------------------------------- one scroll loop
  var nav = $('[data-nav]'), dock = $('[data-dock]'), shrink = $('[data-shrink]'), ticking = false;
  function tick() {
    ticking = false;
    nav.classList.toggle('pill', scrollY > 40);
    dock.classList.toggle('away', scrollY < innerHeight * .5);
    fill.update(); work.update();
    var r = shrink.getBoundingClientRect(), p = clamp((innerHeight - r.top) / (innerHeight + r.height * .2), 0, 1);
    shrink.style.setProperty('--p', still() ? 1 : smooth(p).toFixed(3));
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }, { passive: true });
  function setCB() { root.style.setProperty('--cb', $('.concept').offsetHeight + 'px'); }
  var wasPhone = phone(), rz = 0;
  addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () {
    setCB(); drops.size();
    if (phone() !== wasPhone) { wasPhone = phone(); mosaic.build(); mosaic.label(); work.build(); }
    wordmark.draw(true); tick();
  }, 150); });

  setCB(); texts(root.lang); hours(); write(true); mosaic.label(); tick();
})();
