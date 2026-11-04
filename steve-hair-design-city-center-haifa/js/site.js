(function () {
  var root = document.documentElement, WA = '972504422740';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var touch = !matchMedia('(hover: hover)').matches;
  var TITLE = { he: 'סטיב עיצוב שיער · קניון סיטי סנטר, שדרות בן גוריון 6, חיפה', en: 'STEVE Hair Design · City Center mall, 6 Ben Gurion Blvd, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור סטיב עיצוב שיער STEVE Hair Design · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for STEVE Hair Design · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'סטיב עיצוב שיער', 'STEVE Hair Design');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'להתקשר לסטיב', 'Call Steve');
    aria('[data-t-wa]', 'וואטסאפ לסטיב', 'WhatsApp Steve');
    $('.t-map iframe').title = l === 'he' ? 'מפה: סטיב עיצוב שיער, סיטי סנטר חיפה' : 'Map: STEVE Hair Design, City Center Haifa';
    $$('[data-decode]').forEach(function (el) { el.textContent = el.dataset[l]; el.dataset.done = ''; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('st-lang', l); } catch (e) {}
    texts(l); hours(); lamps(); composer(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('st-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('.wcard').forEach(function (c) { c.style.transform = ''; c.style.filter = ''; });
    $('[data-capsule]').removeAttribute('style'); $$('.capsule img,.tag,.shop-head').forEach(function (e) { e.removeAttribute('style'); });
    restoreTags();
    layout(); kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: null, 1: [10, 20.5], 2: [10, 20.5], 3: [10, 20.5], 4: [10, 20.5], 5: [10, 15], 6: [10, 20.5] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], shortEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: shortEn.indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
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
    $$('.lamp').forEach(function (lp) { lp.classList.toggle('today', +lp.dataset.d === n.d); });
  }
  function hours() {
    var l = he();
    $('[data-hours]').innerHTML = [0, 1, 2, 3, 4, 5, 6].map(function (d) {
      var t = H[d]; return '<tr><td>' + (l ? dayHe : dayEn)[d] + '</td><td>' + (t ? hhmm(t[0]) + '–' + hhmm(t[1]) : (l ? 'סגור' : 'Closed')) + '</td></tr>';
    }).join('');
    status();
  }
  // one iron street lamp per day: amber glass when open, dark glass when closed
  function lamps() {
    var l = he();
    $('[data-lamps]').innerHTML = [0, 1, 2, 3, 4, 5, 6].map(function (d) {
      var t = H[d];
      return '<div class="lamp ' + (t ? 'on' : 'off') + '" data-d="' + d + '" style="--sd:' + (-d * 0.7) + 's">' +
        '<svg viewBox="0 0 60 104" aria-hidden="true"><defs><linearGradient id="ag' + d + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2a8"/><stop offset=".55" stop-color="#f0b25c"/><stop offset="1" stop-color="#b86b22"/></linearGradient></defs><path class="l-iron" d="M28 0h4v9h-4zM9 23 30 8l21 15zM6 23h48v5H6z"/>' +
        '<path class="l-glass" fill="' + (t ? 'url(#ag' + d + ')' : '#2a2a24') + '" d="M10 28h40l-5 41H15z"/><path class="l-ribs" d="M30 28v41M20 28l2.5 41M40 28l-2.5 41"/>' +
        '<path class="l-iron" d="M12 69h36v5H12zM23 74h14l-3 8h-8zM27 82h6v22h-6z"/></svg>' +
        '<b>' + (l ? dayHe : dayEn)[d] + '</b><span class="hh">' + (t ? '<span>' + hhmm(t[0]) + '</span>–<span>' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed')) + '</span></div>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el, i) { if (el.dataset.tile !== undefined) el.style.setProperty('--d', (i % 5) * 70 + 'ms'); rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline letter by letter, out of a blur
  var ci = { he: 0, en: 0 };
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (ci[sp.lang]++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });
  // the review line in the figures band fills letter by letter with the scroll
  $$('[data-fill] p > span').forEach(function (sp) { sp.innerHTML = sp.textContent.split('').map(function (c) { return '<span class="ch">' + c + '</span>'; }).join(''); });

  // ---------------------------------------------------------------- glyph-decode labels
  var GLY = 'אבגדהוזחטיכלמנסעפצקרשת#%*+=/ABCDEFGHKMNPRSTVXZ';
  function decode(el) {
    if (el.dataset.done === '1') return; el.dataset.done = '1';
    var txt = el.dataset[he() ? 'he' : 'en'];
    if (still()) { el.textContent = txt; return; }
    var t0 = performance.now(), dur = 700;
    (function f(t) {
      var k = clamp((t - t0) / dur, 0, 1), n = Math.floor(k * txt.length);
      el.textContent = txt.slice(0, n) + txt.slice(n).replace(/\S/g, function () { return GLY[Math.random() * GLY.length | 0]; });
      if (k < 1) requestAnimationFrame(f); else el.textContent = txt;
    })(t0);
  }
  $$('.label[data-decode]').forEach(function (el) { el.textContent = el.dataset.he; watch(el, function (v) { if (v) decode(el); }); });
  function restoreTags() { $$('.tag').forEach(function (t) { t.textContent = t.dataset[he() ? 'he' : 'en']; t.dataset.done = ''; }); }
  restoreTags();

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- hero: a lamp's light follows the hand and lifts the real facade out of the dark
  var lightT = { x: 62, y: 30 }, light = { x: 62, y: 30 }, heroOn = true, handAt = 0;
  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var r = hero.getBoundingClientRect(); lightT.x = (e.clientX - r.left) / r.width * 100; lightT.y = (e.clientY - r.top) / r.height * 100; handAt = performance.now();
    crystals.hand((e.clientX - r.left), (e.clientY - r.top));
  });
  hero.addEventListener('pointerdown', function (e) { var r = hero.getBoundingClientRect(); crystals.hand(e.clientX - r.left, e.clientY - r.top, true); });
  hero.addEventListener('pointerleave', function () { crystals.hand(-999, -999); });

  // ---------------------------------------------------------------- the real sign's letters as a cloud of black-crystal drops
  var crystals = (function () {
    var cv = $('[data-crystals]'), ctx = cv.getContext('2d'), src = $('[data-signsrc]'), pts = [], W = 0, Hh = 0, dpr = 1, hx = -999, hy = -999, ready = false;
    function sample() {
      if (!src.naturalWidth) return;
      var c = document.createElement('canvas'), w = 200, h = Math.round(w * src.naturalHeight / src.naturalWidth);
      c.width = w; c.height = h; var x = c.getContext('2d'); x.drawImage(src, 0, 0, w, h);
      var d = x.getImageData(0, 0, w, h).data, out = [];
      // the letters are the dark iron on the cream wall; keep the dark pixels, skip the lamps (bright) at the bottom left
      for (var j = 0; j < h; j += 2) for (var i = 0; i < w; i += 2) {
        var k = (j * w + i) * 4, lum = d[k] * .3 + d[k + 1] * .59 + d[k + 2] * .11;
        if (lum < 70 && j > h * .08 && j < h * .92) out.push([i / w, j / h]);
      }
      pts = out.map(function (p) {
        return { u: p[0], v: p[1], aspect: h / w, fx: Math.random(), fy: Math.random(), s: 1.2 + Math.random() * 2.2, ph: Math.random() * 6.28, ox: 0, oy: 0, vx: 0, vy: 0, a: .35 + Math.random() * .5, gold: Math.random() < .28 };
      });
      ready = true; size();
    }
    function size() { var r = cv.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2); W = r.width; Hh = r.height; cv.width = W * dpr; cv.height = Hh * dpr; }
    function box() {
      var aw = $('[data-arcwrap]').getBoundingClientRect(), hr = hero.getBoundingClientRect();
      var wide = innerWidth >= 1100, w = Math.min(aw.width * (wide ? .78 : .86), 640);
      return { x: aw.left - hr.left + (aw.width - w) / 2, y: aw.top - hr.top + (wide ? 30 : -6), w: w };
    }
    function draw(t, sp) {
      if (!ready) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, Hh);
      var b = box(), mix = smooth(sp * 1.6), live = !still();
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var tx = b.x + p.u * b.w, ty = b.y + p.v * b.w * p.aspect;
        // scrolling away, the drops leave the letters and fall like chandelier crystals
        var fx = p.fx * W, fy = ty + (p.fy * .8 + .2) * Hh * .9;
        var x = lerp(tx, fx, mix), y = lerp(ty, fy, mix);
        if (live) {
          x += Math.sin(t * .0011 + p.ph) * 1.4; y += Math.cos(t * .0013 + p.ph) * 1.4;
          var dx = x + p.ox - hx, dy = y + p.oy - hy, dd = dx * dx + dy * dy;
          if (dd < 9000) { var f = (9000 - dd) / 9000 * 1.6, m = Math.sqrt(dd) || 1; p.vx += dx / m * f; p.vy += dy / m * f; }
          p.vx += -p.ox * .04; p.vy += -p.oy * .04; p.vx *= .88; p.vy *= .88; p.ox += p.vx; p.oy += p.vy;
          x += p.ox; y += p.oy;
        }
        var s = p.s * (1 + mix * .6), tw = live ? .75 + .25 * Math.sin(t * .003 + p.ph * 3) : 1;
        ctx.globalAlpha = p.a * tw;
        ctx.fillStyle = p.gold ? '#ffd59a' : '#e9ecea';
        ctx.beginPath(); ctx.moveTo(x, y - s * 1.5); ctx.lineTo(x + s, y); ctx.lineTo(x, y + s * 1.5); ctx.lineTo(x - s, y); ctx.closePath(); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    if (src.complete) sample(); else src.addEventListener('load', sample);
    addEventListener('resize', size);
    return { draw: draw, size: size, hand: function (x, y, burst) { hx = x; hy = y; if (burst) setTimeout(function () { hx = hy = -999; }, 380); } };
  })();

  // ---------------------------------------------------------------- the arc of their photos: turns by itself, with the scroll and with a drag
  var arc = (function () {
    var el = $('[data-arc]'), wrap = $('[data-arcwrap]'), cards = $$('.ac', el), N = cards.length, step = 360 / N, rot = 0, drag = 0, dv = 0, down = null;
    function R() { return cards[0].offsetWidth * (innerWidth < 700 ? 1.55 : 1.75); }
    cards.forEach(function (c, i) { c.dataset.a = i * step; });
    function place(sp) {
      var r = R(), a = rot + drag - sp * 60;
      el.style.transform = 'translateZ(' + (-r) + 'px) rotateX(-7deg) rotateY(' + a + 'deg)';
      cards.forEach(function (c) {
        var ang = (((+c.dataset.a + a) % 360) + 360) % 360, front = Math.cos(ang * Math.PI / 180);
        c.style.transform = 'rotateY(' + c.dataset.a + 'deg) translateZ(' + r + 'px)';
        c.style.opacity = (.25 + .75 * smooth((front + .3) / 1.3)).toFixed(3);
      });
    }
    wrap.addEventListener('pointerdown', function (e) { down = { x: e.clientX, d: drag }; wrap.setPointerCapture(e.pointerId); });
    wrap.addEventListener('pointermove', function (e) { if (down) { var nd = down.d + (e.clientX - down.x) * .25; dv = nd - drag; drag = nd; } });
    var up = function () { down = null; };
    wrap.addEventListener('pointerup', up); wrap.addEventListener('pointercancel', up);
    return { tick: function (dt, sp) { if (!still()) { rot += dt * .006; if (!down) { drag += dv; dv *= .92; } } place(still() ? 0 : sp); } };
  })();

  // ---------------------------------------------------------------- seam 1: the iron railing of the boulevard, drawn across with the scroll
  (function () {
    var d = 'M0 14H1200M0 34H1200M0 112H1200', x;
    for (x = 0; x <= 1200; x += 40) d += 'M' + x + ' 14V112';
    for (x = 0; x < 1200; x += 40) d += 'M' + x + ' 34Q' + (x + 20) + ' 64 ' + (x + 40) + ' 34';
    for (x = 0; x <= 1200; x += 200) d += 'M' + x + ' 14V2';
    $('[data-rail]').setAttribute('d', d);
  })();

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (el) {
    var v = el.dataset.odo;
    // the digits roll on a strip drawn by CSS (::before), the real figure stays readable for screen readers
    el.innerHTML = '<span class="vh">' + v + '</span><span aria-hidden="true" style="display:inline-flex">' + v.split('').map(function (ch, i) {
      return '<span class="col" style="--cd:' + i * 120 + 'ms"><i data-d="' + ch + '"' + (/\d/.test(ch) ? '' : ' class="fix"') + '></i></span>';
    }).join('') + '</span>';
    watch(el, function (v) {
      $$('.col i:not(.fix)', el).forEach(function (i) { i.style.transform = (v || still()) ? 'translateY(-10em)' : 'translateY(0)'; });
    }, { threshold: .4 });
  });

  // ---------------------------------------------------------------- black crystals drifting down the figures band
  var drops = (function () {
    var cv = $('[data-drops]'), ctx = cv.getContext('2d'), W, Hh, dpr, ps = [], on = false, mx = -999, my = -999;
    function size() { var r = cv.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2); W = r.width; Hh = r.height; cv.width = W * dpr; cv.height = Hh * dpr;
      ps = []; var n = Math.round(W * Hh / 9000); for (var i = 0; i < n; i++) ps.push({ x: Math.random() * W, y: Math.random() * Hh, s: 2 + Math.random() * 5, v: .15 + Math.random() * .35, sw: Math.random() * 6.28, r: Math.random() * .6 - .3 }); }
    cv.parentNode.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    watch(cv, function (v) { on = v; });
    function draw(t) {
      if (!on || !W) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, Hh);
      ps.forEach(function (p) {
        if (!still()) { p.y += p.v; if (p.y > Hh + 10) { p.y = -10; p.x = Math.random() * W; } var dx = p.x - mx, dy = p.y - my; if (dx * dx + dy * dy < 6400) p.x += dx > 0 ? 1.4 : -1.4; }
        var x = p.x + Math.sin(t * .0008 + p.sw) * 8, s = p.s;
        ctx.save(); ctx.translate(x, p.y); ctx.rotate(p.r + Math.sin(t * .001 + p.sw) * .2);
        ctx.beginPath(); ctx.moveTo(0, -s * 1.8); ctx.lineTo(s, -s * .3); ctx.lineTo(0, s * 1.8); ctx.lineTo(-s, -s * .3); ctx.closePath();
        ctx.fillStyle = 'rgba(8,10,10,.85)'; ctx.fill();
        ctx.strokeStyle = 'rgba(223,226,224,.35)'; ctx.lineWidth = .8; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -s * 1.8); ctx.lineTo(s * .4, -s * .3); ctx.lineTo(0, s * .4); ctx.closePath(); ctx.fillStyle = 'rgba(255,213,154,.22)'; ctx.fill();
        ctx.restore();
      });
    }
    addEventListener('resize', size); size();
    return { draw: draw };
  })();

  // ---------------------------------------------------------------- work cards: a sheen under the hand (follows the scroll on a phone)
  $$('[data-wcard]').forEach(function (c, i) {
    c.style.setProperty('--k', i); c.style.setProperty('--img', 'url("' + $('img', c).src + '")');
    c.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var ph = $('.w-ph', c), r = ph.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      ph.style.setProperty('--sx', x * 100 + '%'); ph.style.setProperty('--sy', y * 100 + '%');
      if (!still()) { $('img', ph).style.setProperty('--tx', (x - .5) * -14 + 'px'); $('img', ph).style.setProperty('--ty', (y - .5) * -14 + 'px'); }
    });
  });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--sx', e.clientX - r.left + 'px'); t.style.setProperty('--sy', e.clientY - r.top + 'px'); }); });

  // ---------------------------------------------------------------- book: three choices, the message writes itself
  var SVC = { he: ['תספורת', 'צבע וגוונים', 'פן', 'תספורת וצבע'], en: ['Haircut', 'Colour & highlights', 'Blow-dry', 'Cut & colour'] };
  var SVCMSG = { he: ['לתספורת', 'לצבע וגוונים', 'לפן', 'לתספורת וצבע'], en: ['a haircut', 'colour and highlights', 'a blow-dry', 'a cut and colour'] };
  var PART = { he: ['בבוקר', 'בצהריים', 'בערב'], en: ['morning', 'afternoon', 'evening'] };
  var PARTL = { he: ['בוקר', 'צהריים', 'ערב'], en: ['Morning', 'Afternoon', 'Evening'] };
  var sel = { svc: 0, day: null, part: 0 }, touched = {};
  (function () { var d = now().d, k = 0; while (k++ < 7) { d = (d + 1) % 7; if (H[d]) break; } sel.day = d; })();
  function composer() {
    var l = he() ? 'he' : 'en';
    var mk = function (g, items, cur) {
      $('[data-group="' + g + '"]').innerHTML = items.map(function (it) { return '<button type="button" class="opt" data-v="' + it[0] + '" aria-pressed="' + (it[0] === cur) + '">' + it[1] + '</button>'; }).join('');
    };
    mk('svc', SVC[l].map(function (s, i) { return [i, s]; }), sel.svc);
    mk('day', [1, 2, 3, 4, 5, 6].map(function (d) { return [d, (l === 'he' ? dayHe : dayEn)[d]]; }), sel.day);
    var parts = H[sel.day] && H[sel.day][1] <= 16 ? [0, 1] : [0, 1, 2];
    if (parts.indexOf(sel.part) < 0) sel.part = 0;
    mk('part', parts.map(function (p) { return [p, PARTL[l][p]]; }), sel.part);
    $$('.steps li').forEach(function (li, i) { li.classList.toggle('lit', !!touched[['svc', 'day', 'part'][i]]); });
  }
  function msg() {
    var l = he() ? 'he' : 'en';
    return l === 'he'
      ? 'היי סטיב, אשמח לקבוע תור ' + SVCMSG.he[sel.svc] + ' ביום ' + dayHe[sel.day] + ' ' + PART.he[sel.part] + '. מתי מתאים לך?'
      : 'Hi Steve, I’d like to book ' + SVCMSG.en[sel.svc] + ' on ' + dayEn[sel.day] + ' ' + PART.en[sel.part] + '. What time suits you?';
  }
  var bubble = $('[data-bubble]'), typing = 0;
  function write(instant) {
    var m = msg(); $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    var id = ++typing;
    if (instant || still()) { bubble.textContent = m; return; }
    var i = 0;
    (function f() { if (id !== typing) return; i += 2; bubble.innerHTML = ''; bubble.textContent = m.slice(0, i); var c = document.createElement('span'); c.className = 'caret'; bubble.appendChild(c); if (i < m.length) setTimeout(f, 22); else bubble.textContent = m; })();
  }
  $('.steps').addEventListener('click', function (e) {
    var b = e.target.closest('.opt'); if (!b) return;
    var g = b.parentNode.dataset.group; sel[g] = +b.dataset.v; touched[g] = 1; composer(); write();
  });
  watch($('.phone'), function (v) { if (v && !bubble.dataset.seen) { bubble.dataset.seen = 1; write(); } }, { threshold: .5 });

  // ---------------------------------------------------------------- layout numbers
  var shop = $('[data-shop]'), cap = $('[data-capsule]'), front = $('.cap-front'), salon = $('.cap-salon'), tags = $$('.tag'), shead = $('.shop-head');
  var rail = $('[data-railing]'), rv = $('[data-revrail]'), revs = $('.revs'), foot = $('[data-foot]'), page = $('.page');
  var figs = $('[data-figs]'), qch = $$('[data-fill] .ch'), wcards = $$('[data-wcard]'), word = $$('[data-word] span');
  word.forEach(function (s, i) { s.style.setProperty('--k', i); });
  function layout() { page.style.setProperty('--fh', foot.offsetHeight + 'px'); crystals.size(); }
  addEventListener('resize', layout);

  // ---------------------------------------------------------------- one loop for everything scroll-linked
  var last = performance.now(), dirty = true, running = false;
  addEventListener('scroll', function () { dirty = true; }, { passive: true });
  watch(hero, function (v) { heroOn = v; });
  function frame(t) {
    var dt = Math.min(t - last, 50); last = t;
    var vh = innerHeight, sy = scrollY, s = still();
    nav.classList.toggle('pill', sy > 40);

    // hero
    if (heroOn) {
      var hr = hero.getBoundingClientRect(), sp = clamp(-hr.top / hr.height, 0, 1);
      if (!s && (touch || t - handAt > 4000)) { lightT.x = 55 + Math.sin(t * .00035) * 24; lightT.y = 30 + Math.sin(t * .0005) * 12; }
      if (s) { lightT.x = 55; lightT.y = 30; }
      light.x = lerp(light.x, lightT.x, s ? 1 : .08); light.y = lerp(light.y, lightT.y, s ? 1 : .08);
      hero.style.setProperty('--mx', light.x.toFixed(1) + '%'); hero.style.setProperty('--my', light.y.toFixed(1) + '%');
      hero.style.setProperty('--px', s ? '0px' : ((50 - light.x) * .12).toFixed(1) + 'px'); hero.style.setProperty('--py', s ? '0px' : ((30 - light.y) * .1 + sp * 40).toFixed(1) + 'px');
      crystals.draw(t, s ? 0 : sp);
      arc.tick(dt, sp);
    }

    // railing draws itself across
    var rr = rail.getBoundingClientRect(), rp = s ? 1 : smooth((vh - rr.top) / (vh * .7));
    rail.style.clipPath = rtl() ? 'inset(0 0 0 ' + (100 - rp * 100) + '%)' : 'inset(0 ' + (100 - rp * 100) + '% 0 0)';

    // the shopfront: the capsule opens to the whole screen, the camera walks into the salon
    if (!s) {
      var sr = shop.getBoundingClientRect(), p = clamp(-sr.top / (sr.height - vh), 0, 1);
      if (sr.top < vh && sr.bottom > 0) {
        var w0 = Math.min(innerWidth * .86, 560), h0 = Math.min(innerWidth * .3, 190), e1 = smooth(p / .45);
        var w = lerp(w0, innerWidth, e1), h = lerp(h0, vh, e1);
        cap.style.width = w + 'px'; cap.style.height = h + 'px';
        cap.style.borderRadius = lerp(h0 / 2, 0, smooth((p - .2) / .25)) + 'px';
        cap.style.transform = 'translate(-50%,' + lerp(-30, -50, e1) + '%)';
        cap.style.borderColor = 'rgba(239,228,207,' + (.55 * (1 - e1)).toFixed(3) + ')';
        shead.style.opacity = 1 - smooth((p - .06) / .2); shead.style.transform = 'translateY(' + (-40 * smooth(p / .3)) + 'px)';
        var walk = smooth((p - .3) / .4);
        front.style.objectPosition = '50% ' + lerp(22, 48, e1) + '%';
        front.style.transform = 'scale(' + lerp(1, 1.9, walk) + ')'; front.style.transformOrigin = '58% 52%';
        var x = smooth((p - .52) / .2);
        front.style.opacity = 1 - x; salon.style.opacity = x; salon.style.transform = 'scale(' + lerp(1.25, 1, smooth((p - .52) / .4)) + ')';
        tags.forEach(function (tg, i) { var on = p > .78 + i * .03; tg.style.opacity = on ? 1 : 0; tg.style.transform = 'translate(-50%,-50%) translateY(' + (on ? 0 : 8) + 'px)'; tg.style.transition = 'opacity .5s, transform .5s'; if (on) decode(tg); else tg.dataset.done = ''; });
      }
    }

    // work cards: each one lands over the last, which settles back
    if (!s) wcards.forEach(function (c, i) {
      var nx = wcards[i + 1], k = 0;
      if (nx) { var a = nx.getBoundingClientRect().top, b = c.getBoundingClientRect().top; k = clamp(1 - (a - b) / (vh * .8), 0, 1); }
      c.style.transform = 'scale(' + (1 - k * .06) + ')'; c.style.filter = 'brightness(' + (1 - k * .45) + ')';
      if (touch) { var r = c.getBoundingClientRect(), q = clamp((vh - r.top) / (vh + r.height), 0, 1), ph = $('.w-ph', c); ph.style.setProperty('--sx', (20 + q * 60) + '%'); ph.style.setProperty('--sy', (70 - q * 50) + '%'); }
    });

    // the review line fills letter by letter
    var fr = figs.getBoundingClientRect(), fp = s ? 1 : clamp((vh * .85 - fr.top) / (fr.height * .8), 0, 1), vis = qch.filter(function (c) { return c.offsetParent; });
    vis.forEach(function (c, i) { c.style.setProperty('--o', clamp(fp * vis.length * 1.2 - i, 0, 1) * .82 + .18); });
    drops.draw(t);

    // reviews slide along with the scroll
    var vr = revs.getBoundingClientRect();
    if (!s && vr.top < vh && vr.bottom > 0) { var q = clamp((vh - vr.top) / (vh + vr.height), 0, 1), max = Math.max(0, rv.scrollWidth - innerWidth); rv.style.setProperty('--rx', (rtl() ? 1 : -1) * q * max + 'px'); }

    // footer curtain: the letters rise as the page lifts away
    var fh = foot.offsetHeight, fpp = s ? 1 : clamp((sy + vh - (document.documentElement.scrollHeight - fh)) / fh, 0, 1);
    foot.style.setProperty('--fp', fpp.toFixed(3));

    requestAnimationFrame(frame);
  }
  function kick() { if (!running) { running = true; requestAnimationFrame(frame); } }

  texts(he() ? 'he' : 'en'); hours(); lamps(); composer(); write(true); layout(); kick();
  addEventListener('load', layout);
})();
