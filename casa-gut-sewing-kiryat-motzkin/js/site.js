(function () {
  var root = document.documentElement, WA = '972502583641';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'קסה גוט · המרכז למכונות תפירה בצפון · אוסישקין 30, קריית מוצקין', en: 'Casa Gut · Northern Sewing Machine Centre · 30 Ussishkin St, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור המרכז למכונות תפירה בצפון קסה גוט · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Casa Gut, the Northern Sewing Machine Centre · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'קסה גוט', 'Casa Gut');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-names]', 'מה יש בחנות', 'What’s in the shop');
    aria('[data-t-m]', 'איזו מכונה', 'Which machine');
    aria('[data-t-n]', 'מה צריך', 'What you need');
    aria('[data-t-visit]', 'הגעה ויצירת קשר', 'Visit and contact');
    aria('[data-t-call]', 'התקשרו לחנות, 04-871-2277', 'Call the shop, 04-871-2277');
    aria('[data-t-wa]', 'וואטסאפ לקסה גוט', 'WhatsApp Casa Gut');
    $$('[data-call]').forEach(function (c) { if (c.classList.contains('on')) $('b', c).textContent = c.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('cg-lang', l); } catch (e) {}
    texts(l); hours(); showItem(cur, true); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('cg-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-sew]').forEach(function (el) { el.classList.add('in'); });
    hero.classList.add('ready');
    layout(); sparks.kick(); lamp.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed; days may have a midday break
  var A = [[9, 13], [16, 19]], B = [[9, 13]];
  var H = { 0: A, 1: A, 2: B, 3: A, 4: A, 5: B, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d] || [], txt = '', open = false, i;
    for (i = 0; i < t.length; i++) if (n.h >= t[i][0] && n.h < t[i][1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[i][1]) : 'Open now · until ' + hhmm(t[i][1]); }
    if (!open) {
      var later = t.filter(function (r) { return r[0] > n.h; })[0];
      if (later) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(later[0]) : 'Closed now · opens today at ' + hhmm(later[0]);
      else {
        var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
        var o = H[nd] ? hhmm(H[nd][0][0]) : '';
        txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
          : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + o : 'Closed now · opens tomorrow at ' + o)
          : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + o : 'Closed now · opens ' + dayEn[nd] + ' at ' + o);
      }
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0, same = function (a, b) { return JSON.stringify(H[a]) === JSON.stringify(H[b]); };
    while (i < 7) { var j = i; while (j + 1 < 7 && same(j + 1, i)) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? '<span dir="ltr">' + t.map(function (x) { return hhmm(x[0]) + '–' + hhmm(x[1]); }).join(', ') + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('[data-bento]').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 70 + 'ms'); }); });
  $$('[data-sew]').forEach(function (t, i) { t.style.setProperty('--d', (i % 2) * 120 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-sew]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // the name is sewn on letter by letter
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 8 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // odometers: each digit rolls on its own wheel
  $$('[data-odo]').forEach(function (el) {
    var v = el.dataset.odo; el.setAttribute('aria-label', v);
    el.innerHTML = v.split('').map(function (c, i) {
      if (!/\d/.test(c)) return '<span aria-hidden="true">' + c + '</span>';
      return '<span class="dg" aria-hidden="true"><span class="col" style="--n:' + c + ';--k:' + i + '"></span></span>';
    }).join('');
    watch(el, function (v) { if (v) el.classList.add('roll'); });
  });
  var st = document.createElement('style');
  st.textContent = '.dg{display:inline-block;height:1.15em;overflow:hidden;vertical-align:-.1em;line-height:1.15}.dg .col{display:block;transform:translateY(0)}.dg .col::before{content:"0\\A 1\\A 2\\A 3\\A 4\\A 5\\A 6\\A 7\\A 8\\A 9";white-space:pre;display:block;line-height:1.15}' +
    '.roll .dg .col,.still .dg .col{transform:translateY(calc(var(--n) * -1.15em));transition:transform 1.5s cubic-bezier(.23,1,.32,1) calc(var(--k) * 120ms)}';
  document.head.appendChild(st);

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- the bobbin's winding: the sign's red thread, many turns
  (function () {
    var svg = $('[data-wind]'), NS = 'http://www.w3.org/2000/svg', cols = ['#e33b50', '#c92e44', '#f0566a', '#b8263b'];
    for (var r = 199, k = 0; r > 178; r -= 1.6, k++) {
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', 200); c.setAttribute('cy', 200); c.setAttribute('r', r.toFixed(1));
      c.setAttribute('stroke', cols[k % 4]); c.setAttribute('stroke-width', '1.7');
      if (k % 5 === 2) c.setAttribute('stroke-dasharray', (40 + k * 7) + ' 6');
      svg.appendChild(c);
    }
  })();

  // ---------------------------------------------------------------- the sewing lamp: follows the hand, drifts by itself on touch screens
  var lamp = (function () {
    var face = $('.b-face'), el = $('[data-lamp]'), raf = 0, vis = true, px = null, py = null, x = 60, y = 40, t0 = performance.now();
    var hover = matchMedia('(hover: hover)').matches;
    face.addEventListener('pointermove', function (e) { var r = face.getBoundingClientRect(); px = (e.clientX - r.left) / r.width * 100; py = (e.clientY - r.top) / r.height * 100; });
    face.addEventListener('pointerleave', function () { px = null; });
    function frame(t) {
      raf = 0; if (!vis || still()) return;
      var T = (t - t0) / 1000, tx = px != null ? px : 50 + 26 * Math.cos(T * .55), ty = py != null ? py : 46 + 20 * Math.sin(T * .43);
      if (!hover && px == null) { tx = 50 + 30 * Math.cos(T * .7); ty = 46 + 24 * Math.sin(T * .55); }
      x += (tx - x) * .08; y += (ty - y) * .08;
      el.style.setProperty('--lx', x.toFixed(1) + '%'); el.style.setProperty('--ly', y.toFixed(1) + '%');
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    watch(hero, function (v) { vis = v; kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- the shelf: one thing at a time on a bobbin disc
  var FACTS = [
    { he: 'Janome, Singer, Brother ועוד, על המדפים בחנות.', en: 'Janome, Singer, Brother and more, on the shop’s shelves.' },
    { he: 'Juki, Consew ו-Jack, על שולחנות העבודה.', en: 'Juki, Consew and Jack, on the work tables.' },
    { he: 'מספריים, סיכות וכלי תפירה על קיר האביזרים.', en: 'Scissors, pins and sewing tools on the accessories wall.' },
    { he: 'מכונות ביתיות ותעשייתיות, לבדיקה ולתיקון.', en: 'Home and industrial machines, checked and repaired.' }
  ];
  var names = $$('[data-item]'), dimgs = $$('.d-photo img'), fact = $('[data-fact]'), disc = $('[data-disc]'), cur = 0, touched = false, decT = 0;
  function decode(txt) {
    clearInterval(decT);
    if (still()) { fact.textContent = txt; return; }
    var G = he() ? 'אבגדהוזחטיכלמנסעפצקרשת' : 'abcdefghijklmnopqrstuvwxyz', f = 0, n = txt.length;
    decT = setInterval(function () {
      f++; var k = Math.floor(f * n / 16), out = '';
      for (var i = 0; i < n; i++) out += i < k || txt[i] === ' ' || /[.,\-]/.test(txt[i]) ? txt[i] : G[Math.floor(Math.random() * G.length)];
      fact.textContent = out; if (k >= n) { clearInterval(decT); fact.textContent = txt; }
    }, 30);
  }
  function showItem(i, quiet) {
    cur = i;
    names.forEach(function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); b.tabIndex = k === i ? 0 : -1; });
    dimgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
    disc.style.setProperty('--dc', names[i].dataset.c);
    var t = FACTS[i][root.lang]; if (quiet) { clearInterval(decT); fact.textContent = t; } else decode(t);
  }
  names.forEach(function (b, k) {
    b.addEventListener('click', function () { touched = true; showItem(k); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowDown' || e.key === (rtl() ? 'ArrowLeft' : 'ArrowRight') ? 1 : e.key === 'ArrowUp' || e.key === (rtl() ? 'ArrowRight' : 'ArrowLeft') ? -1 : 0;
      if (d) { e.preventDefault(); touched = true; var j = (k + d + names.length) % names.length; showItem(j); names[j].focus(); }
    });
  });
  var shelfVis = false;
  watch($('[data-shelf]'), function (v) { shelfVis = v; });
  setInterval(function () { if (shelfVis && !touched && !still() && !document.hidden) showItem((cur + 1) % names.length); }, 3800);

  // ---------------------------------------------------------------- the bench: real sparks fly off the shop's own grinding wheel
  var bench = $('[data-bench]'), bcam = $('[data-bcam]'), bphoto = $('[data-bphoto]'), calls = $$('[data-call]');
  var sparks = (function () {
    var cv = $('[data-sparks]'), c = cv.getContext('2d'), P = [], w = 1, h = 1, raf = 0, vis = false, rate = .5, near = 0;
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = bphoto.clientWidth; h = bphoto.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    bphoto.addEventListener('pointermove', function (e) { var r = bphoto.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - .44, dy = (e.clientY - r.top) / r.height - .43; near = clamp(1 - Math.hypot(dx, dy) * 3, 0, 1); });
    bphoto.addEventListener('pointerleave', function () { near = 0; });
    bphoto.addEventListener('pointerdown', function () { near = 1; setTimeout(function () { near = 0; }, 700); });
    function frame() {
      raf = 0; if (!vis || still()) { c.clearRect(0, 0, w, h); return; }
      var s = w / 1124, ex = w * .44, ey = h * .43, n = (rate + near * 1.6) * 3;
      for (var k = 0; k < n; k++) { if (Math.random() > .75) continue; var a = (.12 + Math.random() * .95), v = (3 + Math.random() * 7) * s; P.push({ x: ex + (Math.random() - .5) * 6 * s, y: ey + (Math.random() - .5) * 6 * s, vx: Math.cos(a) * v * (Math.random() < .12 ? -.5 : 1), vy: Math.sin(a) * v - 1.2 * s, l: 0, m: 22 + Math.random() * 34 }); }
      c.clearRect(0, 0, w, h); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
      for (var i = P.length - 1; i >= 0; i--) {
        var p = P[i], ox = p.x, oy = p.y; p.vy += .16 * s; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.l++;
        var t = 1 - p.l / p.m; if (t <= 0 || p.y > h) { P.splice(i, 1); continue; }
        c.strokeStyle = 'rgba(255,' + (170 + 70 * t | 0) + ',' + (90 + 80 * t | 0) + ',' + (t * .9).toFixed(2) + ')';
        c.lineWidth = Math.max(.6, 1.6 * s * (t + .3));
        c.beginPath(); c.moveTo(ox - p.vx * 1.4, oy - p.vy * 1.4); c.lineTo(p.x, p.y); c.stroke();
      }
      if (P.length > 900) P.splice(0, P.length - 900);
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    watch(bench, function (v) { vis = v; kick(); });
    return { size: size, kick: kick, set: function (r) { rate = r; } };
  })();
  function typeCall(c, on) {
    if (c.classList.contains('on') === on) return;
    c.classList.toggle('on', on); var b = $('b', c), t = c.dataset[root.lang];
    clearInterval(c._t); if (!on) { b.textContent = ''; return; }
    if (still()) { b.textContent = t; return; }
    var i = 0; c._t = setInterval(function () { b.textContent = t.slice(0, ++i); if (i >= t.length) clearInterval(c._t); }, 40);
  }

  // ---------------------------------------------------------------- the feed: the room passes under the presser foot and gets sewn
  var feed = $('[data-feed]'), fbed = $('[data-fbed]'), strip = $('[data-strip]'), hem = $('[data-hem]');
  var sewn = document.createElement('i'); sewn.className = 'sewn'; strip.appendChild(sewn);

  // ---------------------------------------------------------------- the thread that runs the whole page, sewn as you read
  var main = $('#main'), tsvg = $('[data-thread]'), tpath = $('[data-thrpath]'), tholes = $('[data-thrholes]'), treveal = $('[data-thrreveal]'), tmask = $('[data-thrmask]'), needle = $('[data-needle]');
  var TL = 0, samples = [];
  function threadLayout() {
    var W = main.clientWidth, Ht = main.scrollHeight, phone = innerWidth < 700, inset = phone ? 7 : Math.max(18, innerWidth * .016), x = rtl() ? inset : W - inset, d = rtl() ? 1 : -1;
    var secs = $$('#main > section').slice(1), mTop = main.getBoundingClientRect().top + scrollY;
    var y0 = secs[0].getBoundingClientRect().top + scrollY - mTop + 40, sw = phone ? 26 : 54;
    var p = 'M' + x + ' ' + y0;
    secs.slice(1).forEach(function (s) {
      var y = s.getBoundingClientRect().top + scrollY - mTop + (s.classList.contains('feed') ? 80 : 0);
      // a loose loop of thread at every seam between sections
      p += ' L' + x + ' ' + (y - 70) + ' C' + (x + d * sw) + ' ' + (y - 60) + ' ' + (x + d * sw) + ' ' + (y + 30) + ' ' + (x + d * sw * .2) + ' ' + (y + 10) + ' S' + x + ' ' + (y + 40) + ' ' + x + ' ' + (y + 80);
    });
    p += ' L' + x + ' ' + (Ht - 40);
    tsvg.setAttribute('width', W); tsvg.setAttribute('height', Ht); tsvg.style.height = Ht + 'px'; tsvg.setAttribute('viewBox', '0 0 ' + W + ' ' + Ht);
    tmask.setAttribute('x', 0); tmask.setAttribute('y', 0); tmask.setAttribute('width', W); tmask.setAttribute('height', Ht);
    [tpath, tholes, treveal].forEach(function (e) { e.setAttribute('d', p); });
    TL = tpath.getTotalLength(); treveal.style.strokeDasharray = TL + ' ' + TL;
    samples = []; for (var i = 0; i <= 300; i++) { var L = TL * i / 300; samples.push([L, tpath.getPointAtLength(L).y]); }
  }
  function lenAtY(y) { var best = 0; for (var i = 0; i < samples.length; i++) { if (samples[i][1] <= y) best = samples[i][0]; else break; } return best; }

  // ---------------------------------------------------------------- the scroll loop
  var spool = $('[data-spool]'), vfront = $('[data-vfront]'), foot = $('[data-foot]'), fsign = $('[data-fsign]'), fhem = $('.f-hem'), bobbin = $('[data-bobbin]'), qphoto = $('[data-qphoto]'), qimg = $('[data-qphoto] img');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var vh = innerHeight, calm = still(), sy = scrollY;
    nav.classList.toggle('gathered', sy > 40);
    spool.classList.toggle('show', sy > hero.offsetHeight * .5);

    // hero: the bobbin winds on as you leave
    var hr = hero.getBoundingClientRect(), hp = calm ? 0 : clamp(-hr.top / hr.height, 0, 1);
    $('.b-face').style.setProperty('--bz', (1.06 + hp * .16).toFixed(3));
    bobbin.style.transform = calm ? '' : 'rotate(' + (rtl() ? -1 : 1) * hp * 24 + 'deg)';
    $('.b-face img').style.rotate = calm ? '' : (rtl() ? 1 : -1) * hp * 24 + 'deg';

    // thread
    var mTop = main.getBoundingClientRect().top;
    var L = calm ? TL : lenAtY(vh * .62 - mTop);
    treveal.style.strokeDashoffset = (TL - L).toFixed(1);
    if (!calm && L > 2 && L < TL - 2) { var pt = tpath.getPointAtLength(L); needle.style.transform = 'translate(' + pt.x.toFixed(1) + 'px,' + pt.y.toFixed(1) + 'px)'; needle.style.opacity = 1; } else needle.style.opacity = 0;

    // bench: the camera walks in to the hands at the wheel
    var br = bench.getBoundingClientRect(), bp = calm ? 1 : clamp(-br.top / Math.max(1, br.height - vh), 0, 1), z = calm ? 1 : 1 + .42 * smooth(bp);
    bcam.style.setProperty('--z', z.toFixed(3));
    bcam.style.setProperty('--tx', (calm ? 0 : -smooth(bp) * 1.5) + '%');
    sparks.set(.35 + bp * 1.1);
    typeCall(calls[0], calm || bp > .22 || (br.top < vh * .4 && innerWidth < 900));
    typeCall(calls[1], calm || bp > .5);

    // feed
    var fr = feed.getBoundingClientRect(), fp = calm ? 1 : clamp(-fr.top / Math.max(1, fr.height - vh), 0, 1);
    var bw = fbed.clientWidth, sw2 = strip.scrollWidth, shift = calm ? 0 : fp * Math.max(0, sw2 - bw);
    strip.style.setProperty('--fx', (-shift).toFixed(1) + 'px');
    if (calm) { sewn.style.setProperty('--sl', '0px'); sewn.style.setProperty('--sw', '100%'); }
    else { sewn.style.setProperty('--sl', (bw / 2).toFixed(1) + 'px'); sewn.style.setProperty('--sw', shift.toFixed(1) + 'px'); }
    hem.style.setProperty('--hem', (calm ? 100 : smooth((vh - fr.top) / (vh * .7)) * 100).toFixed(1) + '%');

    // visit: the shop front settles into its frame
    var vr = vfront.getBoundingClientRect(), vp = calm ? 1 : smooth((vh - vr.top) / (vh * .85));
    vfront.style.setProperty('--vs', (1.28 - .28 * vp).toFixed(3));

    // faq: the shelf photo drifts inside its bobbin
    var qr = qphoto.getBoundingClientRect();
    qimg.style.setProperty('--qy', calm ? '0px' : (((qr.top + qr.height / 2) / vh - .5) * -40).toFixed(1) + 'px');

    // footer: the hem sews shut and the sign rises out of it
    var ft = foot.getBoundingClientRect(), pf = calm ? 1 : smooth((vh - ft.top) / (vh * .6));
    fhem.style.setProperty('--hem', (pf * 100).toFixed(1) + '%');
    fsign.style.setProperty('--sy', ((1 - pf) * 50).toFixed(1) + 'px'); fsign.style.setProperty('--so', (.25 + .75 * pf).toFixed(2));
  }

  // ---------------------------------------------------------------- the woven label (the live thing)
  var M = { he: ['מכונת תפירה ביתית', 'מכונת תפירה תעשייתית', 'מכונת אוברלוק'], en: ['a home sewing machine', 'an industrial sewing machine', 'an overlocker'] };
  var N = {
    he: [function (m) { return 'שלום, יש לנו ' + m + ' שצריכה בדיקה ותיקון. מתי אפשר להביא אותה לחנות?'; },
         function (m) { return 'שלום, אנחנו מחפשים ' + m + '. אפשר לבוא לראות מה יש בחנות?'; },
         function (m) { return 'שלום, אנחנו צריכים אביזרים ל' + m + '. מה יש אצלכם בחנות?'; },
         function (m) { return 'שלום, יש לנו שאלה על ' + m + ': '; }],
    en: [function (m) { return 'Hello, we have ' + m + ' that needs checking and repair. When can we bring it to the shop?'; },
         function (m) { return 'Hello, we’re looking for ' + m + '. Can we come and see what you have in the shop?'; },
         function (m) { return 'Hello, we need accessories for ' + m + '. What do you have in the shop?'; },
         function (m) { return 'Hello, we have a question about ' + m + ': '; }]
  };
  var mi = 0, ni = 0, msgEl = $('[data-msg]'), send = $('[data-send]'), steps = $$('[data-step]'), wT = 0;
  function msg() { return N[root.lang][ni](M[root.lang][mi]); }
  function write(instant) {
    var t = msg(); send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t);
    clearInterval(wT);
    if (instant || still()) { msgEl.textContent = t; return; }
    var i = 0; wT = setInterval(function () { i += 2; msgEl.textContent = t.slice(0, i); if (i >= t.length) clearInterval(wT); }, 22);
  }
  function radios(sel, key, set) {
    var bs = $$(sel);
    bs.forEach(function (b) { b.addEventListener('click', function () {
      bs.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); });
      set(+b.dataset[key]); write(false);
    }); });
  }
  radios('[data-m]', 'm', function (v) { mi = v; steps[1].classList.add('on'); });
  radios('[data-n]', 'n', function (v) { ni = v; steps[1].classList.add('on'); steps[2].classList.add('on'); });
  watch($('[data-label]'), function (v) { if (v) write(false); }, { threshold: .5 });

  // spotlight under the hand on the bento
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  function layout() { sparks.size(); threadLayout(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); showItem(0, true); write(true); layout();

  // ---------------------------------------------------------------- opening: a seam is sewn across, then unpicked onto the shop
  var opener = $('[data-opener]'), ready = function () { requestAnimationFrame(function () { hero.classList.add('ready'); }); };
  if (root.classList.contains('opening')) {
    var done = false, finish = function () { if (done) return; done = true; opener.classList.add('part'); ready(); setTimeout(function () { root.classList.remove('opening'); }, 640); try { sessionStorage.setItem('cg-open', '1'); } catch (e) {} };
    opener.addEventListener('pointerdown', finish);
    setTimeout(finish, 720);
  } else {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ready);
    setTimeout(ready, 900);
  }
  addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
})();
