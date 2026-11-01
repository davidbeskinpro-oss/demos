(function () {
  var root = document.documentElement, WA = '972585050360';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 761; };
  var TITLE = { he: "לירון פתרון לבניין ולבית · ז'בוטינסקי 61, קריית מוצקין", en: 'Liron Pitaron – building & home · 61 Jabotinsky St, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור לירון פתרון לבניין ולבית · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Liron Pitaron – building & home supplies · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'לירון פתרון לבניין ולבית', 'Liron Pitaron – building & home');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-deck]', 'מתוך החנות', 'Inside the shop');
    aria('[data-t-drawers]', 'מה צריך', 'What you need');
    aria('[data-t-visit]', 'הגעה', 'Visit');
    aria('[data-t-call]', 'התקשרו ללירון, 058-505-0360', 'Call Liron, 058-505-0360');
    aria('[data-t-wa]', 'וואטסאפ ללירון', 'WhatsApp Liron');
    var more = $('[data-more]'); more.placeholder = more.dataset[l === 'he' ? 'phHe' : 'phEn'];
    $$('.dw').forEach(function (d) { $('.tag', d).textContent = d.dataset[l].replace(/^./, function (c) { return c.toUpperCase(); }); });
    $$('[data-decode]').forEach(function (b) { b.textContent = b.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('lp-lang', l); } catch (e) {}
    texts(l); hours(); compose(true); frame();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('lp-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-odo]').forEach(function (o) { roll(o, true); });
    motes.kick(); keySwing.kick(); frame();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. Two shifts a day; null = closed
  var SH = [[8, 14], [16, 18.5]];
  var H = { 0: SH, 1: SH, 2: SH, 3: SH, 4: SH, 5: [[8, 14]], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  var isOpen = false;
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d] || [], txt = '', open = false, i;
    for (i = 0; i < t.length; i++) if (n.h >= t[i][0] && n.h < t[i][1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[i][1]) : 'Open now · until ' + hhmm(t[i][1]); }
    if (!open) {
      for (i = 0; i < t.length; i++) if (n.h < t[i][0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[i][0]) : 'Closed now · opens today at ' + hhmm(t[i][0]); break; }
      if (!txt) {
        var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
        txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
          : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0][0]))
          : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0][0]));
      }
    }
    isOpen = open;
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    var plate = $('[data-plate]'); plate.textContent = open ? (l ? 'פתוח' : 'Open') : txt.replace(/^[^·]*·\s*/, '') || (l ? 'סגור' : 'Closed'); plate.classList.toggle('open', open);
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? t.map(function (s) { return '<span dir="ltr">' + hhmm(s[0]) + '–' + hhmm(s[1]) + '</span>'; }).join(l ? ' ו־' : ', ') : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.unit [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); if (e.target.hasAttribute('data-tile')) decode(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // shelf labels decode out of scrambled glyphs
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHKLMNPRSTUWXZ' };
  function decode(tile) {
    var b = $('[data-decode]', tile); if (!b || still()) return;
    var l = he() ? 'he' : 'en', txt = b.dataset[l], n = 0, steps = 16;
    clearInterval(b._t);
    b._t = setInterval(function () {
      n++;
      var keep = Math.floor(txt.length * n / steps);
      b.textContent = txt.split('').map(function (c, i) { return i < keep || c === ' ' ? c : GL[l][Math.floor(Math.random() * GL[l].length)]; }).join('');
      if (n >= steps) { clearInterval(b._t); b.textContent = txt; }
    }, 45);
  }

  // headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 10 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), front = $('[data-front]'), shutter = $('[data-shutter]');
  requestAnimationFrame(function () { hero.classList.add('ready'); });

  // ---------------------------------------------------------------- the shutter: rolls up on arrival (half way only when the shop is closed now), all the way with the scroll
  var openT0 = performance.now();
  function shutterOpen() {
    if (still()) return 1;
    var arrive = smooth((performance.now() - openT0 - 300) / 1400) * (isOpen ? 1 : .32);
    var r = hero.getBoundingClientRect(), sc = smooth(-r.top / (r.height * .45));
    return Math.max(arrive, sc);
  }

  // dust in the light that spills out of the shop
  var motes = (function () {
    var cv = $('[data-motes]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = true;
    function size() { var d = Math.min(2, devicePixelRatio || 1); w = front.clientWidth; h = front.clientHeight; cv.width = w * d; cv.height = h * d; c.setTransform(d, 0, 0, d, 0, 0); }
    for (var i = 0; i < 46; i++) P.push({ x: Math.random(), y: .55 + Math.random() * .45, s: .6 + Math.random() * 1.6, v: .00025 + Math.random() * .0006, ph: Math.random() * 6.28 });
    function draw(t) {
      raf = 0; c.clearRect(0, 0, w, h);
      var o = parseFloat(front.style.getPropertyValue('--open')) || 0;
      if (o > .05 && !still()) {
        P.forEach(function (p) {
          p.y -= p.v; if (p.y < .6) { p.y = 1; p.x = .15 + Math.random() * .7; }
          var x = (p.x + Math.sin(t / 1600 + p.ph) * .015) * w, y = p.y * h, a = o * .55 * Math.sin((1 - (p.y - .6) / .4) * Math.PI);
          c.fillStyle = 'rgba(255,226,150,' + a.toFixed(3) + ')'; c.beginPath(); c.arc(x, y, p.s, 0, 6.283); c.fill();
        });
      }
      if (vis && !still()) raf = requestAnimationFrame(draw);
    }
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(draw); }
    return { size: size, kick: kick };
  })();

  // the yellow key from the facade: a pendulum pushed by the hand and by the scroll
  var keySwing = (function () {
    var k = $('[data-key]'), a = 0, v = 0, raf = 0, lx = null, ly = scrollY;
    function step() {
      raf = 0; if (still()) { k.style.setProperty('--swing', '0deg'); return; }
      v += -a * .02; v *= .975; a += v;
      var dy = scrollY - ly; ly = scrollY; v += clamp(dy, -40, 40) * .006;
      k.style.setProperty('--swing', a.toFixed(2) + 'deg');
      if (Math.abs(a) > .05 || Math.abs(v) > .01) raf = requestAnimationFrame(step);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(step); }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; if (lx !== null) v += clamp(e.clientX - lx, -30, 30) * .012; lx = e.clientX; kick(); });
    hero.addEventListener('pointerdown', function () { v += rtl() ? -2.4 : 2.4; kick(); });
    addEventListener('scroll', kick, { passive: true });
    setTimeout(function () { v = 1.8; kick(); }, 900);
    return { kick: kick };
  })();

  // the storefront leans toward the hand
  if (matchMedia('(hover: hover)').matches) {
    hero.addEventListener('pointermove', function (e) { if (still()) return; var r = front.getBoundingClientRect(); front.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 8 + 'deg'); front.style.setProperty('--rx', -((e.clientY - r.top) / r.height - .5) * 6 + 'deg'); });
    hero.addEventListener('pointerleave', function () { front.style.setProperty('--ry', '0deg'); front.style.setProperty('--rx', '0deg'); });
  }

  // ---------------------------------------------------------------- shelves: spotlight under the hand, an automatic sweep on phones
  $$('.bay').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var elec = $('[data-elec]'), sw = $('[data-switch]');
  function light(on) { elec.classList.toggle('on', on); sw.setAttribute('aria-pressed', on ? 'true' : 'false'); }
  sw.addEventListener('click', function () { light(!elec.classList.contains('on')); });
  if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { ob.disconnect(); setTimeout(function () { light(true); }, still() ? 0 : 900); } }, { threshold: .5 }).observe(elec); else light(true);

  // ---------------------------------------------------------------- the painted wall: vertical strokes, one after the other, the roller at the wet edge
  var adv = $('[data-advice]'), wet = $('[data-wet]'), roller = $('[data-roller]');
  function paint() {
    if (still()) { wet.style.clipPath = ''; return; }
    var r = adv.getBoundingClientRect(), span = r.height - innerHeight, p = clamp(-r.top / (span * .82), 0, 1);
    var N = phone() ? 3 : 5, W = adv.clientWidth, Hh = innerHeight, cw = 100 / N;
    var pos = p * N, k = Math.min(N - 1, Math.floor(pos)), f = p >= 1 ? 1 : pos - k, y = (f * 100).toFixed(2);
    var x0 = k * cw, x1 = (k + 1) * cw, X = function (x) { return (rtl() ? 100 - x : x).toFixed(2) + '%'; };
    wet.style.clipPath = p <= 0 ? 'polygon(0 0,0 0,0 0)' : 'polygon(' + X(0) + ' 0,' + X(x1) + ' 0,' + X(x1) + ' ' + y + '%,' + X(x0) + ' ' + y + '%,' + X(x0) + ' 100%,' + X(0) + ' 100%)';
    var rw = W / N * 1.04; roller.style.setProperty('--rw', rw + 'px');
    var cx = ((rtl() ? 100 - (x0 + x1) / 2 : (x0 + x1) / 2) / 100) * W;
    roller.style.setProperty('--rx', (cx - rw / 2) + 'px');
    roller.style.setProperty('--ry', (f * Hh - rw * 62 / 200 + 4) + 'px');
    roller.style.opacity = p >= 1 ? 0 : 1;
  }

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : 0; s.style.transitionDelay = go && !still() ? (i * 160) + 'ms' : '0ms'; s.style.transitionDuration = still() ? '0s' : ''; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .4 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- the list: drawers -> message on the phone
  var bubble = $('[data-bubble]'), send = $('[data-send]'), more = $('[data-more]'), typer = 0, shown = '';
  function msg() {
    var l = he(), items = $$('.dw[aria-pressed="true"]').map(function (d) { return d.dataset[l ? 'he' : 'en']; }), extra = more.value.trim();
    if (extra) items.push(extra);
    if (!items.length) return l ? 'שלום לירון, יש לי שאלה לגבי משהו לבית.' : 'Hi Liron, I have a question about something for the house.';
    return l ? 'שלום לירון, רציתי לבדוק אם יש אצלכם:\n' + items.map(function (x) { return '• ' + x; }).join('\n') + '\nתודה!'
             : 'Hi Liron, I wanted to check if you have:\n' + items.map(function (x) { return '• ' + x; }).join('\n') + '\nThanks!';
  }
  function compose(instant) {
    var t = msg();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t);
    clearInterval(typer);
    if (instant || still()) { bubble.textContent = t; shown = t; return; }
    var common = 0; while (common < shown.length && shown[common] === t[common]) common++;
    var i = common;
    typer = setInterval(function () {
      i++; bubble.innerHTML = ''; bubble.appendChild(document.createTextNode(t.slice(0, i)));
      var c = document.createElement('span'); c.className = 'cur'; bubble.appendChild(c);
      if (i >= t.length) { clearInterval(typer); shown = t; bubble.textContent = t; }
    }, 16);
    shown = t.slice(0, common);
  }
  $$('.dw').forEach(function (d) { d.addEventListener('click', function () { d.setAttribute('aria-pressed', d.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); compose(); light2(1); }); });
  more.addEventListener('input', function () { compose(true); light2(1); });
  send.addEventListener('click', function () { light2(2); });
  var steps = $$('[data-step]');
  function light2(n) { steps.forEach(function (s, i) { s.classList.toggle('lit', i <= n); }); }
  var list = $('[data-list]');
  if (io) new IntersectionObserver(function (es, ob) {
    if (!es[0].isIntersecting) return; ob.disconnect();
    light2(0);
    if (still()) return;
    // a little demonstration: two drawers open by themselves
    var d = $$('.dw'); setTimeout(function () { if (!$$('.dw[aria-pressed="true"]').length) { d[0].setAttribute('aria-pressed', 'true'); compose(); light2(1); } }, 900);
    setTimeout(function () { if ($$('.dw[aria-pressed="true"]').length === 1 && d[0].getAttribute('aria-pressed') === 'true') { d[5].setAttribute('aria-pressed', 'true'); compose(); } }, 2300);
  }, { threshold: .35 }).observe(list);

  // ---------------------------------------------------------------- receipts fed out of the till
  var revs = $('[data-revs]'), feeds = $$('.rc', revs);
  function feed() {
    if (still()) { feeds.forEach(function (f) { f.style.setProperty('--f', 1); }); return; }
    var r = revs.getBoundingClientRect(), p = clamp((innerHeight - r.top) / (innerHeight * .95), 0, 1.4);
    feeds.forEach(function (f, i) { f.style.setProperty('--f', smooth((p - .25 - i * .08) / .5).toFixed(3)); });
  }

  // ---------------------------------------------------------------- the shopfront arrives large and shrinks into its tile
  var shr = $('[data-shrink]');
  function shrink() {
    if (still()) { shr.style.transform = ''; return; }
    var r = shr.getBoundingClientRect(), p = smooth((innerHeight - r.top) / (innerHeight * .9)), s0 = Math.min(1.45, Math.max(innerWidth / r.width, 1));
    var s = 1 + (s0 - 1) * (1 - p);
    shr.style.transform = 'scale(' + s.toFixed(3) + ')';
    shr.style.borderRadius = (22 * p).toFixed(1) + 'px';
  }

  // ---------------------------------------------------------------- footer shutter comes down at the end of the page
  var fs = $('[data-fshutter]'), foot = $('[data-foot]');
  function footShutter() {
    if (still()) { fs.style.setProperty('--down', 1); return; }
    var r = fs.parentNode.getBoundingClientRect(), p = smooth((innerHeight - r.top - 40) / (innerHeight * .45));
    fs.style.setProperty('--down', p.toFixed(3));
  }

  // ---------------------------------------------------------------- tape measure (phones): pulled out after the hero, tucked away at the footer
  var tape = $('[data-tape]'), blade = $('.blade', tape);
  function tapeUI() {
    var hr = hero.getBoundingClientRect(), fr = foot.getBoundingClientRect();
    var away = hr.bottom > innerHeight * .35 || fr.top < innerHeight;
    tape.classList.toggle('away', away);
    blade.style.setProperty('--ext', still() ? 1 : away ? .05 : 1);
  }
  blade.style.transition = 'transform .6s cubic-bezier(.23,1,.32,1) .15s';

  // ---------------------------------------------------------------- one scroll loop
  var arcs = $$('[data-arcs],[data-bigarcs]');
  function frame() {
    var o = shutterOpen();
    front.style.setProperty('--open', o.toFixed(3)); shutter.style.setProperty('--open', o.toFixed(3));
    $('[data-spill]').style.setProperty('--open', o.toFixed(3));
    nav.classList.toggle('pill', scrollY > 60);
    var spin = (still() ? 0 : scrollY * .12) * (rtl() ? -1 : 1);
    arcs.forEach(function (a) { a.style.setProperty('--spin', spin + 'deg'); });
    paint(); feed(); shrink(); footShutter(); tapeUI();
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; frame(); }); } }, { passive: true });
  addEventListener('resize', function () { motes.size(); frame(); });

  texts(he() ? 'he' : 'en'); hours(); compose(true); motes.size(); motes.kick();
  (function arrive() { frame(); if (performance.now() - openT0 < 2000) requestAnimationFrame(arrive); })();
})();
