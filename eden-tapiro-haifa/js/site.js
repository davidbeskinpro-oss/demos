(function () {
  var root = document.documentElement, WA = '972526413565';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 760; };
  var NS = 'http://www.w3.org/2000/svg';
  var TITLE = { he: 'עדן טפירו · עיצוב שיער · מאפו 13, חיפה', en: 'Eden Tapiro · Hair design · 13 Mapu St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור עדן טפירו EDEN TAPIRO עיצוב שיער · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Eden Tapiro Hair Design · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute(el.tagName === 'IFRAME' ? 'title' : 'aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'עדן טפירו, עיצוב שיער', 'Eden Tapiro, hair design');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-score]', 'דירוג 5.0 בגוגל מ-54 ביקורות', 'Rated 5.0 on Google from 54 reviews');
    aria('[data-t-strands]', 'מה לכתוב לעדן', 'What to write to Eden');
    aria('[data-t-map]', 'מפה: מאפו 13, חיפה', 'Map: 13 Mapu St, Haifa');
    aria('[data-t-call]', 'התקשרו לעדן, 052-641-3565', 'Call Eden, 052-641-3565');
    aria('[data-t-wa]', 'וואטסאפ לעדן', 'WhatsApp Eden');
    $$('.tag').forEach(function (t) { if (t.classList.contains('typed')) $('b', t).textContent = t.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('et-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('et-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-rise]').forEach(function (el) { el.classList.add('in'); });
    $$('.c-item').forEach(function (c) { c.classList.add('lit'); });
    layout(); leaves.kick(); helix.kick(); dust.kick(); write(true); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time
  // H = null: the hours are not published on Google, so nothing is invented. When they are known, fill
  // H = {0:[9,19], ..., 6:null} (null = closed that day, [0,24] = around the clock) and the table and status follow.
  var H = null;
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var l = he(), txt, open = false, n = window.__now || now();
    if (!H) txt = l ? 'השעות לא מפורסמות בגוגל · שאלו את עדן בוואטסאפ' : 'Hours aren’t listed on Google · ask Eden on WhatsApp';
    else {
      var t = H[n.d];
      if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
      else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
      else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
      else {
        var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
        txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
          : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
          : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
      }
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  function hours() {
    var tb = $('[data-hours]');
    if (!H) { tb.innerHTML = ''; status(); return; }
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    tb.innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-rise]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline letter by letter; the big quotation fills letter by letter with the scroll
  function splitChars(el, start) {
    var i = start || 0;
    el.innerHTML = el.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  }
  $$('[data-split] > span[lang]').forEach(function (s) { splitChars(s); });
  $$('[data-fill]').forEach(function (p) { splitChars(p); });

  // ---------------------------------------------------------------- opening: once per visit, never longer than ~2 s, a tap skips it
  var op = $('[data-opening]'), seen = false;
  try { seen = sessionStorage.getItem('et-open') === '1'; sessionStorage.setItem('et-open', '1'); } catch (e) {}
  var hero = $('[data-hero]');
  function ready() { hero.classList.add('ready'); }
  if (!still() && !seen && !navigator.webdriver) {
    op.classList.add('go');
    var done = function () { op.classList.remove('go'); ready(); };
    var tm = setTimeout(done, 1950);
    op.addEventListener('click', function () { clearTimeout(tm); done(); });
    setTimeout(ready, 1500);
  } else ready();

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    if (!o.getAttribute('aria-label')) o.setAttribute('aria-label', o.dataset.odo);
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (300 + i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { requestAnimationFrame(function () { roll(o, true); }); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- hero: the photo leans with the hand (drifts by itself on phones)
  var hphoto = $('[data-hphoto]'), himg = $('img', hphoto), tags = $$('.tag', hero), heroOn = true;
  watch(hero, function (v) { heroOn = v; leaves.kick(); });
  hero.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    hphoto.style.setProperty('--px', (-x * 26).toFixed(1) + 'px'); hphoto.style.setProperty('--py', (-y * 18).toFixed(1) + 'px');
    leaves.wind(x);
  });
  // labels sit on the photo's own pixels (object-fit: cover, object-position 40% 32%)
  function placeTags() {
    var W = hphoto.clientWidth, Hh = hphoto.clientHeight, iw = 1600, ih = 1200, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s;
    var cs = getComputedStyle(hphoto), S = parseFloat(cs.getPropertyValue('--hs')) || 1, org = cs.transformOrigin.split(' ').map(parseFloat);
    var ox = (W - dw) * .4, oy = (Hh - dh) * .32, HW = hero.clientWidth;
    tags.forEach(function (t) {
      var x = ox + dw * +t.dataset.x, y = oy + dh * +t.dataset.y;
      x = hphoto.offsetLeft + org[0] + (x - org[0]) * S; y = hphoto.offsetTop + org[1] + (y - org[1]) * S;
      t.style.left = x + 'px'; t.style.top = y + 'px';
      t.classList.toggle('flip', x > HW * (phone() ? .5 : .58));
      t.hidden = x < 16 || x > HW - 16 || y < 90 || y > hero.clientHeight * .5;
    });
  }
  // glyph-decode: each label settles out of scrambled letters
  var GL = 'אבגדהוזחטיכלמנסעפצקרשתABCDEFGHKMNRSTXZ';
  function decode(t, delay) {
    setTimeout(function () {
      var txt = t.dataset[root.lang], b = $('b', t), n = 0; t.classList.add('typed');
      if (still()) { b.textContent = txt; return; }
      var iv = setInterval(function () {
        n++; var out = '';
        for (var i = 0; i < txt.length; i++) out += i < n / 2 || txt[i] === ' ' ? txt[i] : GL[Math.floor(Math.random() * GL.length)];
        b.textContent = out; if (n / 2 >= txt.length) { clearInterval(iv); b.textContent = txt[0] ? t.dataset[root.lang] : ''; }
      }, 32);
    }, delay);
  }
  tags.forEach(function (t, i) { decode(t, (still() ? 0 : 1900) + i * 420); });

  // ---------------------------------------------------------------- leaves from the tree by her door drift through the light
  var leaves = (function () {
    var cv = $('[data-leaves]'), c = cv.getContext('2d'), L = [], w, h, raf = 0, wind = 0, t0 = performance.now();
    function leaf(x, y, s, a, tone) {
      c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
      c.fillStyle = tone; c.beginPath();
      c.moveTo(0, -10); c.bezierCurveTo(6, -6, 6, 6, 0, 11); c.bezierCurveTo(-6, 6, -6, -6, 0, -10); c.fill();
      c.strokeStyle = 'rgba(42,24,32,.35)'; c.lineWidth = .8; c.beginPath(); c.moveTo(0, -9); c.lineTo(0, 10); c.stroke();
      c.restore();
    }
    var TONES = ['rgba(169,187,146,.85)', 'rgba(196,208,150,.8)', 'rgba(140,165,120,.8)', 'rgba(239,192,180,.55)'];
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 14 : 26; L = [];
      for (var i = 0; i < n; i++) L.push({ x: Math.random() * w, y: Math.random() * h, s: .7 + Math.random() * 1.1, a: Math.random() * 6.28, va: (Math.random() - .5) * .03, vy: .25 + Math.random() * .55, ph: Math.random() * 6.28, tone: TONES[i % 4] });
    }
    function draw(T) {
      c.clearRect(0, 0, w, h);
      L.forEach(function (p) { leaf(p.x + Math.sin(T * .8 + p.ph) * 14, p.y, p.s, p.a + Math.sin(T * 1.3 + p.ph) * .5, p.tone); });
    }
    function frame(t) {
      raf = 0; var T = (t - t0) / 1000;
      if (still()) { draw(0); return; }
      var auto = phone() ? Math.sin(T * .35) * .4 : 0;
      L.forEach(function (p) { p.y += p.vy; p.x += (wind + auto) * 1.6 + .15; p.a += p.va; if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; } if (p.x > w + 20) p.x = -20; if (p.x < -20) p.x = w + 20; });
      wind *= .97; draw(T);
      if (heroOn) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: function () { size(); kick(); }, kick: kick, wind: function (x) { wind = lerp(wind, x * 2, .1); } };
  })();

  // ---------------------------------------------------------------- seam 1: strands of hair fall over the photo's foot and become the next section
  var strandSvg = $('[data-strands]'), strands = [];
  (function () {
    var N = 64, html = '';
    for (var i = 0; i < N; i++) {
      var x = (i + .5) * 1200 / N, sw = 1200 / N * 1.9, wav = 6 + Math.random() * 10, d = 'M' + x.toFixed(1) + ' 230 C' + (x + wav).toFixed(1) + ' 160 ' + (x - wav).toFixed(1) + ' 80 ' + (x + wav * .4).toFixed(1) + ' 0';
      html += '<path d="' + d + '" stroke-width="' + sw.toFixed(1) + '" pathLength="1" data-th="' + (Math.random() * .45).toFixed(3) + '"/>';
    }
    strandSvg.innerHTML = '<rect x="0" y="206" width="1200" height="16"/>' + html;
    strands = $$('path', strandSvg);
    strands.forEach(function (p) { p.style.strokeDasharray = '1 2'; });
  })();
  function strandSeam(p) {
    strands.forEach(function (s) {
      var th = +s.dataset.th, v = (still() ? .6 : clamp((p - th * .5) / .5, 0, 1)) * (1 - th * 1.1);
      s.style.strokeDashoffset = (1 - v).toFixed(3); s.style.opacity = v < .01 ? 0 : 1;
    });
  }

  // ---------------------------------------------------------------- the braid: three strands, drawn down the page with the scroll
  var rope = $('[data-rope]'), rBase = $('.r-base', rope), rLive = $('.r-live', rope), craft = $('[data-craft]'), citems = $$('[data-citem]'), ropeLen = [];
  var COLS = ['#efc0b4', '#ddb97c', '#cf8f95'];
  function braidPaths(W, Hh, amp, period) {
    var out = [[], [], []], cx = W / 2;
    for (var s = 0; s < 3; s++) {
      var d = '';
      for (var y = 0; y <= Hh; y += 6) { var x = cx + Math.sin(y / period * Math.PI * 2 + s * 2.094) * amp; d += (y ? 'L' : 'M') + x.toFixed(1) + ' ' + y; }
      out[s] = d;
    }
    return out;
  }
  function buildRope() {
    var W = rope.clientWidth || 120, Hh = rope.clientHeight || 1000, sw = W < 80 ? 7 : 12, amp = W < 80 ? 12 : 26, per = W < 80 ? 130 : 210;
    rope.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh);
    var P = braidPaths(W, Hh, amp, per), base = '', live = '';
    P.forEach(function (d, i) {
      base += '<path d="' + d + '" stroke-width="' + sw + '"/>';
      live += '<path class="under" d="' + d + '" stroke-width="' + (sw + 5) + '"/><path d="' + d + '" stroke="' + COLS[i] + '" stroke-width="' + sw + '"/>';
    });
    rBase.innerHTML = base; rLive.innerHTML = live;
    ropeLen = $$('path', rLive).map(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L + ' ' + L; return L; });
  }
  function ropeDraw(p) {
    $$('path', rLive).forEach(function (el, i) { el.style.strokeDashoffset = (ropeLen[i] * (1 - p)).toFixed(1); });
  }

  // ---------------------------------------------------------------- photos lean toward the hand
  $$('[data-tilt]').forEach(function (f) {
    f.addEventListener('pointermove', function (e) { if (still() || e.pointerType !== 'mouse') return; var r = f.getBoundingClientRect(); f.style.setProperty('--tx', (((e.clientX - r.left) / r.width - .5) * 8).toFixed(2) + 'deg'); f.style.setProperty('--ty', (-((e.clientY - r.top) / r.height - .5) * 8).toFixed(2) + 'deg'); });
    f.addEventListener('pointerleave', function () { f.style.setProperty('--tx', '0deg'); f.style.setProperty('--ty', '0deg'); });
  });

  // ---------------------------------------------------------------- the helix: pictures turning on one strand; by itself, with the scroll and with a drag
  var helix = (function () {
    var wrap = $('[data-helixwrap]'), el = $('[data-helix]');
    $$('.hc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $('img', k).alt = ''; el.appendChild(k); });
    var cards = $$('.hc', el), N = cards.length, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = false, last = 0;
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (10 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var Hh = wrap.clientHeight, cw = cards[0].offsetWidth, ch = cards[0].offsetHeight, R = cw * N * 1.12 / (2 * Math.PI), sc = scrollY * .05 * (rtl() ? 1 : -1);
      var stepY = (Hh - ch) / (N - 1);
      cards.forEach(function (c, i) {
        var a = rot + sc + i * 30, f = Math.cos(a * Math.PI / 180);
        c.style.transform = 'translateY(' + (i * stepY).toFixed(1) + 'px) rotateY(' + a.toFixed(2) + 'deg) translateZ(' + R.toFixed(0) + 'px)';
        c.style.filter = 'brightness(' + (.35 + .65 * Math.pow(Math.max(f, 0), 1.4)).toFixed(3) + ')';
        c.style.zIndex = Math.round(f * 100) + 100;
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    el.style.transform = 'rotateX(-6deg)';
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .3; vel = dx * 2 * (rtl() ? 1 : -1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(wrap, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- reviews: a nudge sets a card swinging on its pin
  var rvs = $$('[data-rv]');
  rvs.forEach(function (r, i) {
    r.style.setProperty('--k', i);
    r.addEventListener('pointerenter', function (e) {
      if (still() || !r.animate) return;
      var dir = e.movementX >= 0 ? 1 : -1;
      r.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(' + (5 * dir) + 'deg)' }, { transform: 'rotate(' + (-2.5 * dir) + 'deg)' }, { transform: 'rotate(' + (1 * dir) + 'deg)' }, { transform: 'rotate(0deg)' }], { duration: 1300, easing: 'ease-out', composite: 'add' });
    });
  });
  var qchars = [];
  function fillQuote(p) { qchars = $$('.w-quote [lang="' + root.lang + '"] .ch'); var n = still() ? qchars.length : Math.floor(qchars.length * p); qchars.forEach(function (c, i) { c.classList.toggle('on', i < n); }); }

  // ---------------------------------------------------------------- the live thing: tie one hair tie on each strand; they braid into the message
  var groups = $$('.strand'), msgEl = $('[data-msg]'), weave = $('[data-weave]'), chat = $('[data-chat]'), shown = '', typing = 0, chatSeen = false;
  groups.forEach(function (g) {
    $$('.tie', g).forEach(function (b) {
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-pressed') !== 'true';
        $$('.tie', g).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        drawWeave(); write();
      });
    });
  });
  function pick(name) { var b = $('[data-group="' + name + '"] .tie[aria-pressed="true"]'); return b ? b.dataset[root.lang === 'he' ? 'he' : 'en'] : null; }
  function compose() {
    var l = he(), who = pick('who') || '', what = pick('what'), when = pick('when');
    if (l) return 'היי עדן, אשמח לקבוע תור ל' + (what || 'תספורת') + who + (when ? ', ' + when : '') + '. תודה!';
    return 'Hi Eden, I’d like to book ' + (what || 'a haircut') + who + (when ? ', ' + when : '') + '. Thank you!';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; chat.classList.remove('typing-now'); return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep; chat.classList.add('typing-now');
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st); else chat.classList.remove('typing-now');
    })(t0);
  }
  watch(chat, function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });
  // the weave: three loose strands; every chosen hair tie braids one more stretch, the last one ties it off
  var weaveDone = -1;
  function drawWeave() {
    var n = groups.filter(function (g) { return $('.tie[aria-pressed="true"]', g); }).length, W = 300, Hh = 150, x0 = 12, x1 = n === 3 ? 262 : 292, len = (x1 - x0) * n / 3, out = '';
    var ys = [42, 75, 108], amp = 24, per = 62;
    for (var s = 0; s < 3; s++) {
      var d = '';
      for (var x = x0; x <= x1; x += 4) {
        var u = x - x0, b = n === 3 ? 1 : 1 - smooth((u - len + 26) / 26), loose = 75 + (ys[s] - 75) * smooth(u / 70) + Math.sin(u / 34 + s * 2) * 5 * smooth(u / 60);
        var tight = 75 + Math.sin(u / per * Math.PI * 2 + s * 2.094) * amp * (n === 3 ? 1 - u / (x1 * 2.2) : 1);
        if (n === 0) b = 0;
        d += (x === x0 ? 'M' : 'L') + x + ' ' + lerp(loose, tight, b).toFixed(1);
      }
      out += '<path class="under" d="' + d + '"/><path d="' + d + '" stroke="' + COLS[s] + '"/>';
    }
    out += '<rect class="knot" x="' + (x0 - 4) + '" y="62" width="12" height="26" rx="6"/>';
    if (n === 3) out += '<rect class="knot" x="' + (x1 - 2) + '" y="61" width="13" height="28" rx="6"/><path d="M' + (x1 + 10) + ' 75 q12 -10 22 -16 M' + (x1 + 10) + ' 75 q14 0 24 2 M' + (x1 + 10) + ' 75 q12 10 22 16" stroke="' + COLS[0] + '" stroke-width="5"/>';
    weave.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh); weave.style.transform = rtl() ? 'scaleX(-1)' : '';
    weave.innerHTML = out;
    if (!still() && n !== weaveDone && weaveDone >= 0 && weave.animate) weave.animate([{ opacity: .5 }, { opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.23,1,.32,1)' });
    weaveDone = n;
  }

  // ---------------------------------------------------------------- bento: a soft light under the hand
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var visit = $('[data-visit]'); watch(visit, function (v) { visit.classList.toggle('on', v); });

  // ---------------------------------------------------------------- footer: rose particles gather into the letters of her real sign
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), foot = $('[data-foot]'), P = [], w, h, raf = 0, vis = false, ok = false, t0 = 0, mx = -999, my = -999;
    function sample() {
      try {
        // the sign itself is too faint to sample, so the name is set in capitals like the sign and sampled
        var iw = 476, ih = 120, sc = document.createElement('canvas'); sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.fillStyle = '#000'; sx.textAlign = 'center'; sx.textBaseline = 'middle';
        sx.font = '500 92px "Frank Ruhl Libre", serif'; sx.fillText('EDEN TAPIRO', iw / 2, ih / 2, iw - 8);
        var d = sx.getImageData(0, 0, iw, ih).data, pts = [];
        for (var y = 0; y < ih; y += 2) for (var x = 0; x < iw; x += 2) { if (d[(y * iw + x) * 4 + 3] > 128) pts.push([x / iw, y / ih]); }
        var want = phone() ? 1500 : 2200, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) { var q = pts[Math.floor(f)]; P.push({ hx: q[0], hy: q[1], x: Math.random(), y: Math.random() * .4 - .2, vx: 0, vy: 0, dl: Math.random() * .8, ph: Math.random() * 6.28, sx: undefined }); }
        ok = P.length > 50;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); P.forEach(function (p) { p.sx = undefined; }); }
    function frame(t) {
      raf = 0; if (!ok) return;
      var calm = still(), T = (t - t0) / 1000, bw = Math.min(w * .92, 820), bh = bw * 120 / 476, ox = (w - bw) / 2, oy = Math.max(10, (h - bh) / 2);
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], a = calm ? 1 : smooth((T - p.dl) / 1.6);
        var tx = ox + p.hx * bw + Math.sin(T * 1.2 + p.ph) * 1.2, ty = oy + p.hy * bh + Math.cos(T + p.ph) * 1.2;
        if (calm) { p.x = tx; p.y = ty; }
        else if (a < 1) { if (p.sx === undefined) { p.sx = p.x * w; p.sy = p.y * h; } p.x = lerp(p.sx, tx, a); p.y = lerp(p.sy, ty, a); }
        else {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 6400) { var f = (6400 - d2) / 6400 * 2.4, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
          p.vx += (tx - p.x) * .05; p.vy += (ty - p.y) * .05; p.vx *= .84; p.vy *= .84; p.x += p.vx; p.y += p.vy;
        }
        c.fillStyle = i % 5 ? 'rgba(239,192,180,.8)' : 'rgba(221,185,124,.9)';
        c.fillRect(p.x - 1.2, p.y - 1.2, 2.4, 2.4);
      }
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() { sample(); size(); }
    foot.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    foot.addEventListener('pointerleave', function () { mx = my = -999; });
    foot.addEventListener('pointerdown', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; setTimeout(function () { mx = my = -999; }, 500); });
    watch(foot, function (v) { if (v && !vis) { t0 = performance.now(); P.forEach(function (p) { p.sx = undefined; p.x = Math.random(); p.y = Math.random() * .4 - .2; }); } vis = v; kick(); });
    if (document.fonts && document.fonts.load) document.fonts.load('500 92px "Frank Ruhl Libre"').then(start, start); else start();
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var nav = $('[data-nav]'), words = $('[data-words]'), twist = $('[data-twist]'), close = $('[data-close]'), clphoto = $('[data-clphoto]'), clcopy = $('[data-clcopy]'), tiebar = $('[data-tiebar]'), foot = $('[data-foot]');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // hero: the photo sinks and the strands fall over it
    var hr = hero.getBoundingClientRect(), hp = clamp(-hr.top / (hr.height * .6), 0, 1);
    var hs0 = innerWidth / innerHeight > 1.1 ? 1.6 : 1.06; hphoto.style.setProperty('--hs', calm ? hs0 : (hs0 + hp * .08).toFixed(3));
    strandSeam(calm ? 1 : hp);
    // the braid draws itself as you go down, and undoes as you go up
    var cr = craft.getBoundingClientRect(), cp = calm ? 1 : clamp((vh * .6 - cr.top) / (cr.height - vh * .2), 0, 1);
    ropeDraw(cp);
    if (!calm) citems.forEach(function (c) { var r = c.getBoundingClientRect(); c.classList.toggle('lit', r.top < vh * .66 && r.bottom > vh * .2); });
    // reviews sheet rides up over the twist and lands
    var wr = words.getBoundingClientRect(), wl = calm ? 0 : clamp((wr.top - vh * .15) / vh, 0, 1);
    words.style.setProperty('--lift', (wl * 90).toFixed(1) + 'px');
    var qr = $('.w-quote', words).getBoundingClientRect();
    fillQuote(clamp((vh * .9 - qr.top) / (vh * .55), 0, 1));
    // closing: the photo fills the screen, then shrinks into the arched window
    if (!calm) {
      var p = prog(close), e = smooth((p - .08) / .62), W = close.clientWidth, Hs = vh, mob = phone();
      var fw = mob ? W * .72 : Math.min(W * .34, 460), fh = Math.min(fw * 4 / 3, Hs * (mob ? .52 : .78)), fx = mob ? (W - fw) / 2 : (rtl() ? W - fw - W * .08 : W * .08), fy = mob ? Hs * .1 : (Hs - fh) / 2;
      clphoto.style.left = lerp(0, fx, e).toFixed(1) + 'px'; clphoto.style.top = lerp(0, fy, e).toFixed(1) + 'px';
      clphoto.style.width = lerp(W, fw, e).toFixed(1) + 'px'; clphoto.style.height = lerp(Hs, fh, e).toFixed(1) + 'px';
      clphoto.style.borderRadius = (lerp(0, fw / 2, e)).toFixed(1) + 'px ' + (lerp(0, fw / 2, e)).toFixed(1) + 'px ' + lerp(0, 28, e).toFixed(1) + 'px ' + lerp(0, 28, e).toFixed(1) + 'px';
      var ce = smooth((p - .5) / .3);
      clcopy.style.opacity = ce.toFixed(3);
      if (!mob) { clcopy.style[rtl() ? 'right' : 'left'] = (W * .5) + 'px'; clcopy.style[rtl() ? 'left' : 'right'] = 'auto'; }
      clcopy.style.translate = '0 ' + lerp(30, 0, ce).toFixed(1) + 'px';
      clcopy.style.pointerEvents = ce > .5 ? 'auto' : 'none';
    } else { ['left', 'top', 'width', 'height', 'borderRadius'].forEach(function (k) { clphoto.style[k] = ''; }); clcopy.style.opacity = ''; clcopy.style.translate = ''; clcopy.style.left = clcopy.style.right = ''; clcopy.style.pointerEvents = ''; }
    // hair tie hides over the footer, where the same buttons already are
    var fr = foot.getBoundingClientRect(); tiebar.classList.toggle('hide', fr.top < vh * .7 || scrollY < 200);
  }
  addEventListener('scroll', tick, { passive: true });

  function layout() {
    update(); placeTags(); leaves.size(); buildRope(); drawWeave(); dust.size();
    root.classList.toggle('curtain', foot.offsetHeight < innerHeight * .92 && !still());
    tick();
  }
  var rz = 0, lastW = innerWidth;
  addEventListener('resize', function () { if (Math.abs(innerWidth - lastW) < 2 && phone()) return; lastW = innerWidth; clearTimeout(rz); rz = setTimeout(layout, 120); });
  if (still()) $$('.c-item').forEach(function (c) { c.classList.add('lit'); });
  texts(root.lang); hours(); write(true); layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  addEventListener('load', layout);
})();
