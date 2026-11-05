(function () {
  var root = document.documentElement, WA = '972503675197';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'STEPS נדל״ן · ליווי משקיעי נדל״ן · שדרות ההסתדרות 177, חיפה', en: 'STEPS Real Estate · Guidance for property investors · 177 Histadrut Ave, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור נדל״ן STEPS · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for STEPS Real Estate · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'נדל״ן STEPS', 'STEPS Real Estate');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-call]', 'התקשרו ל-STEPS, 050-367-5197', 'Call STEPS, 050-367-5197');
    aria('[data-t-wa]', 'וואטסאפ לעדי ורן', 'WhatsApp Adi and Ran');
    aria('[data-t-prev]', 'הצעד הקודם', 'Previous step');
    aria('[data-t-next]', 'הצעד הבא', 'Next step');
    $$('.lb').forEach(function (b) { $('.t', b).textContent = b.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('steps-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('steps-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-tilt]').forEach(function (p) { p.style.removeProperty('--tilt'); });
    layout(); feet.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 20], 1: [9, 20], 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [9, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח 24 שעות' : 'Open 24 hours'; }
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
  $$('.bento,.r-bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 70 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 12 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- the logo's five dots, walking as footprints: under the hand, and by themselves
  var feet = (function () {
    var cv = $('[data-feet]'), c = cv.getContext('2d'), w, h, raf = 0, vis = true, prints = [], lx = null, ly = null, side = 1, auto = 0, lastAuto = 0;
    var TOES = [[6, 32, 4.2, 5], [16, 25, 4.8, 5.8], [28, 19, 5.4, 6.6], [41, 12, 6, 7.4], [55, 9, 6.6, 8]];
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function drop(x, y, ang, coral) { prints.push({ x: x, y: y, a: ang, t: performance.now(), s: phone() ? .55 : .7, c: coral }); if (prints.length > 40) prints.shift(); }
    function draw(t) {
      c.clearRect(0, 0, w, h);
      prints = prints.filter(function (p) { return t - p.t < 2600; });
      prints.forEach(function (p) {
        var age = (t - p.t) / 2600, a = age < .08 ? age / .08 : 1 - smooth((age - .3) / .7);
        c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.scale(p.s, p.s); c.translate(-32, -20);
        c.globalAlpha = a * .55; c.fillStyle = p.c ? '#f68b62' : '#3bc1cd';
        TOES.forEach(function (e) { c.beginPath(); c.ellipse(e[0], e[1], e[2], e[3], 0, 0, 6.283); c.fill(); });
        c.restore();
      });
    }
    // the automatic walker climbs a staircase path across the hero, step by step
    function autoStep(t) {
      if (t - lastAuto < 420) return; lastAuto = t;
      var n = 14, i = auto % n, stepW = w / n, x = rtl() ? w - (i + .5) * stepW : (i + .5) * stepW;
      var y = h * .9 - Math.floor(i / 2) * h * .07 + (i % 2 ? -10 : 10);
      drop(x, y, rtl() ? Math.PI - .35 : -.35 + 0, i === n - 1);
      auto++;
    }
    function frame(t) {
      raf = 0;
      if (still()) { c.clearRect(0, 0, w, h); return; }
      if (!fine || lx === null) autoStep(t);
      draw(t);
      if (vis) raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || still()) return;
      var r = hero.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (lx === null) { lx = x; ly = y; return; }
      var dx = x - lx, dy = y - ly, d = Math.sqrt(dx * dx + dy * dy);
      if (d > 54) { var ang = Math.atan2(dy, dx); side = -side; drop(x + Math.cos(ang + Math.PI / 2) * side * 12, y + Math.sin(ang + Math.PI / 2) * side * 12, ang, false); lx = x; ly = y; kick(); }
    });
    hero.addEventListener('pointerleave', function () { lx = ly = null; });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- portraits lean toward the hand (on phones: with the scroll)
  var tilts = $$('[data-tilt]'), house = $('[data-house]');
  function tiltTo(rx, ry) { tilts.forEach(function (p, i) { var k = i ? -1 : 1; p.style.setProperty('--tilt', 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + (ry * (i ? .8 : 1)).toFixed(2) + 'deg) translateZ(0)'); p.classList.add('live'); }); }
  hero.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var r = house.getBoundingClientRect(), x = (e.clientX - (r.left + r.width / 2)) / r.width, y = (e.clientY - (r.top + r.height / 2)) / r.height;
    tiltTo(clamp(-y * 12, -10, 10), clamp(x * 16, -12, 12));
  });
  hero.addEventListener('pointerleave', function () { if (!still()) tiltTo(0, 0); });

  // ---------------------------------------------------------------- the stair seam: blocks climb up out of the hero
  var climb = $('[data-climb]'), climbCells = [];
  for (var ci = 0; ci < 8; ci++) { var b = document.createElement('i'); climb.appendChild(b); climbCells.push(b); }

  // ---------------------------------------------------------------- the office door: the camera walks in
  var door = $('[data-door]'), stage = $('.d-stage', door), cam = $('[data-dcam]'), shade = $('.d-shade', door), dcard = $('[data-dcard]'), labels = $$('.lb', door);
  var OX = .76, OY = .38;   // the open doorway in the photo
  cam.style.setProperty('--ox', OX * 100 + '%'); cam.style.setProperty('--oy', OY * 100 + '%');
  var dec = '#%&STEPS0123456789';
  function decode(lb, on) {
    if (lb._on === on) return; lb._on = on; lb.classList.toggle('on', on);
    var t = $('.t', lb), txt = lb.dataset[he() ? 'he' : 'en']; clearInterval(lb._t);
    if (!on || still()) { t.textContent = txt; return; }
    var f = 0; lb._t = setInterval(function () {
      f++; var out = ''; for (var i = 0; i < txt.length; i++) out += (i < f / 2 || txt[i] === ' ') ? txt[i] : dec[Math.floor(Math.random() * dec.length)];
      t.textContent = out; if (f / 2 >= txt.length) { clearInterval(lb._t); t.textContent = txt; }
    }, 28);
  }

  // ---------------------------------------------------------------- the staircase
  var stairs = $('[data-stairs]'), treads = $$('.tr', stairs), items = $$('[data-sl]', stairs), walker = $('[data-walker]'), sroof = $('[data-sroof]'), flight = $('.flight', stairs), manual = 3;
  function setStep(n, roofP) {
    treads.forEach(function (t, i) { t.classList.toggle('on', i <= n); });
    items.forEach(function (li, i) { li.classList.toggle('on', i <= n); li.classList.toggle('now', i === n); });
    var t = treads[Math.max(0, n)], fr = flight.getBoundingClientRect(), tr = t.getBoundingClientRect();
    var x = tr.left - fr.left + tr.width / 2 - 48, y = -(tr.height) - 8;
    walker.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)' + (rtl() ? ' scaleX(-1)' : '');
    walker.style.opacity = n < 0 ? 0 : 1;
    sroof.style.setProperty('--roof', (1 - roofP).toFixed(3));
  }
  $('[data-sprev]').addEventListener('click', function () { manual = Math.max(0, manual - 1); setStep(manual, manual === 3 ? 1 : 0); });
  $('[data-snext]').addEventListener('click', function () { manual = Math.min(3, manual + 1); setStep(manual, manual === 3 ? 1 : 0); });

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 4) % 10; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- bento: living tiles and a spotlight under the hand
  var what = $('[data-what]');
  watch(what, function (v) { what.classList.toggle('on', v); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  // on touch, the spotlight drifts across the tiles by itself
  if (!fine) setInterval(function () { if (still() || !what.classList.contains('on')) return; var tt = performance.now() / 1000; $$('.tile').forEach(function (t, i) { t.style.setProperty('--mx', (50 + Math.sin(tt * .9 + i) * 45) + '%'); t.style.setProperty('--my', (50 + Math.cos(tt * .7 + i * 1.7) * 40) + '%'); }); }, 60);

  // ---------------------------------------------------------------- the live message
  var msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false, groups = {};
  $$('[data-group]').forEach(function (g) {
    var bs = $$('button', g); groups[g.dataset.group] = bs;
    bs.forEach(function (b) { b.addEventListener('click', function () { bs.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write(); }); });
  });
  function pick(name) { var b = groups[name].filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0]; return b.dataset[he() ? 'he' : 'en']; }
  function compose() {
    var goal = pick('goal'), area = pick('area'), st = pick('stage');
    return he() ? 'שלום עדי ורן, אשמח לשיחה על ' + goal + (area ? ' ' + area : '') + '. ' + st
                : 'Hi Adi and Ran, I’d like to talk about ' + goal + (area ? ' ' + area : '') + '. ' + st;
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
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // reviews: two copies per row so the drift loops seamlessly
  $$('[data-row]').forEach(function (r) { var n = r.children.length; for (var i = 0; i < n; i++) { var k = r.children[i].cloneNode(true); k.setAttribute('aria-hidden', 'true'); r.appendChild(k); } });

  // footer: a line of footprints
  var fw = $('[data-fwalk]'), fwh = '';
  for (var fi = 0; fi < 16; fi++) fwh += '<use href="#i-feet" x="' + (fi * 75 + 6) + '" y="' + (fi % 2 ? 2 : 18) + '" width="40" height="26" style="--k:' + fi + '"/>';
  fw.innerHTML = fwh;

  var reach = $('[data-reach]'), rroof = $('[data-rroof]'), dock = $('.dock'), flogo = $('.f-logo'), foot = $('[data-foot]');

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // stair seam
    var hr = hero.getBoundingClientRect(), cp = calm ? 0 : clamp(-hr.top / (hr.height * .5), 0, 1);
    climbCells.forEach(function (c, i) { var k = rtl() ? i : climbCells.length - 1 - i; c.style.setProperty('--h', smooth((cp * 1.6) - k * .08).toFixed(3) * ((k + 1) / climbCells.length)); });
    // phones: the portraits lean with the scroll
    if (!calm && !fine) { var q = clamp(-hr.top / hr.height, 0, 1); tiltTo(q * 8, Math.sin(q * 3) * 6); }
    // door
    var dp = calm ? 1 : prog(door), z = calm ? 0 : smooth((dp - .08) / .72);
    var S = lerp(1, 4.2, z * z);
    cam.style.transform = calm ? '' : 'translate(-50%,-50%) scale(' + S.toFixed(4) + ')';
    shade.style.opacity = calm ? 0 : smooth((dp - .84) / .16) * .92.toFixed(3);
    dcard.style.setProperty('--dc', calm ? 1 : (smooth((dp - .02) / .14) * (1 - smooth((dp - .55) / .15))).toFixed(3));
    var sr = stage.getBoundingClientRect(), crW = cam.offsetWidth, crH = cam.offsetHeight, cx0 = sr.width / 2 - crW / 2, cy0 = sr.height / 2 - crH / 2;
    var ox = cx0 + crW * OX, oy = cy0 + crH * OY;
    labels.forEach(function (lb) {
      var px = cx0 + crW * +lb.style.getPropertyValue('--x'), py = cy0 + crH * +lb.style.getPropertyValue('--y');
      var x = ox + (px - ox) * (calm ? 1 : S), y = oy + (py - oy) * (calm ? 1 : S);
      var out = x < 8 || x > sr.width - 8 || y < 8 || y > sr.height - 8;
      lb.style.transform = 'translate(' + (x - 7).toFixed(1) + 'px,' + (y - 7).toFixed(1) + 'px)';
      var flip = x > sr.width * .6; lb.classList.toggle('flip', flip);
      if (flip) lb.style.transform = 'translate(calc(' + (x + 7).toFixed(1) + 'px - 100%),' + (y - 7).toFixed(1) + 'px)';
      decode(lb, !out && (calm || (dp > +lb.dataset.at && dp < .7)));
    });
    // stairs
    if (calm) setStep(manual, manual === 3 ? 1 : 0);
    else { var sp = prog(stairs), n = Math.min(3, Math.floor(sp * 4.6 - .1)); setStep(n, smooth((sp - .7) / .22)); }
    // the bento card lands on the stack
    var wr = what.getBoundingClientRect(), wp = calm ? 1 : smooth((vh - wr.top) / (vh * .6));
    what.style.transform = calm ? '' : 'scale(' + lerp(.94, 1, wp).toFixed(4) + ')';
    // the roof closes over the contact bento
    var rr = reach.getBoundingClientRect(), rp = calm ? 1 : smooth((vh - rr.top) / (vh * .7));
    rroof.style.setProperty('--rr', (1 - rp).toFixed(3));
    // footer logo rises as the curtain opens
    var fr = foot.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / fr.height);
    flogo.style.setProperty('--fl', ((1 - fp) * 60).toFixed(1) + 'px');
    // the dock steps aside over the contact block
    if (dock) dock.classList.toggle('hide', rr.top < vh * .5 && rr.bottom > 0);
  }

  function layout() { feet.size(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); feet.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', tick);
})();
