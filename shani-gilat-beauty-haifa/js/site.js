(function () {
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 760; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'שני גילת · טיפוח, יופי ושיזוף · שדרות אח״י אילת 51, חיפה', en: 'Shani Gilat · Care, beauty & tanning · 51 Achi Eilat Blvd, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור שני גילת - טיפוח ויופי · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Shani Gilat – Beauty & Care · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'שני גילת - טיפוח ויופי', 'Shani Gilat – Beauty & Care');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-salon]', 'הסלון', 'The salon');
    aria('[data-t-call]', 'התקשרו לשני, 077-454-6430', 'Call Shani, 077-454-6430');
    aria('[data-walk-prev]', 'החדר הקודם', 'Previous room');
    aria('[data-walk-next]', 'החדר הבא', 'Next room');
    aria('[data-set-lang]', 'English', 'עברית');
    var map = $('[data-t-map]'); if (map) map.title = l === 'he' ? 'מפה: שדרות אח״י אילת 51, חיפה' : 'Map: 51 Achi Eilat Blvd, Haifa';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('sg-lang', l); } catch (e) {}
    texts(l); hours(); walkLabel(true); buildPicks(); render(false); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var wasStill = still();
    root.classList.toggle('still', !wasStill);
    try { localStorage.setItem('sg-motion', wasStill ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],.rv').forEach(function (el) { el.classList.add('in'); });
    $('[data-foot]').classList.add('in');
    layout(); glitter.restart(); walkLabel(true); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 19], 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    if (window.__now) return window.__now;
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function isOpen(n) { var t = H[n.d]; return !!(t && n.h >= t[0] && n.h < t[1]); }
  function status() {
    var n = now(), l = he(), t = H[n.d], txt, open = isOpen(n);
    if (open) txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]);
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    var dd = $('[data-dock-dot]'); if (dd) dd.classList.toggle('open', open);
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? (t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>') : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('[data-bento]').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  $$('[data-reveal],[data-tile],.rv').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  requestAnimationFrame(function () { $$('.hero [data-reveal]').forEach(function (el) { el.classList.add('in'); }); });

  // ---------------------------------------------------------------- headline letter by letter
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').classList.contains('l2') ? 9 : 0;
    var walk = function (node) {
      var out = document.createDocumentFragment();
      [].slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          ch.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { out.appendChild(document.createTextNode(' ')); return; }
            var ws = document.createElement('span'); ws.className = 'w';
            w.split('').forEach(function (c) { var s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = c; ws.appendChild(s); });
            out.appendChild(ws);
          });
        } else { var cl = ch.cloneNode(false); cl.appendChild(walk(ch)); out.appendChild(cl); }
      });
      return out;
    };
    var frag = walk(sp); sp.textContent = ''; sp.appendChild(frag);
  });

  // ---------------------------------------------------------------- odometer figures
  $$('[data-odo]').forEach(function (o) {
    o.setAttribute('aria-label', o.dataset.odo);
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span aria-hidden="true" class="pt" data-n="' + ch + '"></span>';
      var col = ''; for (var k = 0; k < 10; k++) col += '<i data-n="' + k + '"></i>';
      return '<span class="d" aria-hidden="true" data-to="' + ch + '"><span>' + col + '</span></span>';
    }).join('');
    var roll = function () { $$('.d', o).forEach(function (d, i) { var s = d.firstChild; s.style.transitionDelay = (i * 160) + 'ms'; s.style.transform = 'translateY(' + (-d.dataset.to * 10) + '%)'; }); };
    if (still() || !io) roll(); else watch(o, function (v) { if (v) roll(); }, { threshold: .4 });
  });

  // ---------------------------------------------------------------- nav: bar -> floating pill
  var nav = $('[data-nav]'), concept = $('.concept'), cb = 30;

  // ---------------------------------------------------------------- hero glitter: gold dust gathers into her real SG monogram, then drifts
  var hero = $('[data-hero]'), gemWrap = $('[data-gem]'), gemPhoto = $('.gem-photo');
  var glitter = (function () {
    var cv = $('[data-glitter]'), c = cv.getContext('2d'), w = 0, h = 0, P = [], pts = [], t0 = 0, raf = 0, vis = true, mx = -999, my = -999, burst = [];
    var img = new Image(); img.src = 'img/logo-mark.jpg';
    var cols = ['233,201,139', '248,232,227', '242,170,150', '214,176,106'];
    function sample() {
      var n = 190, o = document.createElement('canvas'); o.width = o.height = n; var x = o.getContext('2d');
      x.drawImage(img, 0, 0, n, n);
      var d = x.getImageData(0, 0, n, n).data, L = new Float32Array(n * n), I = new Float32Array((n + 1) * (n + 1));
      for (var i = 0; i < n * n; i++) L[i] = d[i * 4] * .3 + d[i * 4 + 1] * .59 + d[i * 4 + 2] * .11;
      for (var yy = 0; yy < n; yy++) for (var xx = 0; xx < n; xx++) I[(yy + 1) * (n + 1) + xx + 1] = L[yy * n + xx] + I[yy * (n + 1) + xx + 1] + I[(yy + 1) * (n + 1) + xx] - I[yy * (n + 1) + xx];
      var r = 7, out = [];
      for (yy = r; yy < n - r; yy++) for (xx = r; xx < n - r; xx++) {
        var s = I[(yy + r + 1) * (n + 1) + xx + r + 1] - I[(yy - r) * (n + 1) + xx + r + 1] - I[(yy + r + 1) * (n + 1) + xx - r] + I[(yy - r) * (n + 1) + xx - r];
        var mean = s / ((2 * r + 1) * (2 * r + 1));
        if (L[yy * n + xx] < 80 && mean > 105) out.push([xx / n - .5, yy / n - .5]);
      }
      pts = out;
    }
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function seed() {
      var N = phone() ? 700 : 1300, S = Math.min(w, h) * (phone() ? .5 : .42); P = [];
      for (var i = 0; i < N; i++) {
        var tp = pts.length ? pts[(Math.random() * pts.length) | 0] : [Math.random() - .5, Math.random() - .5];
        var a = Math.random() * 6.283, rr = (.45 + Math.random() * .6) * Math.max(w, h);
        P.push({ sx: w / 2 + Math.cos(a) * rr, sy: h / 2 + Math.sin(a) * rr, tx: w / 2 + tp[0] * S + (Math.random() - .5) * 1.5, ty: h / 2 + tp[1] * S + (Math.random() - .5) * 1.5,
          d: Math.random() * .5, r: .8 + Math.random() * 1.4, c: cols[(Math.random() * cols.length) | 0], ph: Math.random() * 6.283,
          vx: (Math.random() - .5) * .5, vy: -.15 - Math.random() * .5, keep: i % 9 === 0 });
      }
    }
    function frame(tm) {
      raf = 0; if (still() || !vis) return;
      var t = (tm - t0) / 1000; c.clearRect(0, 0, w, h); c.globalCompositeOperation = 'lighter';
      var lit = smooth((t - 2.9) / 1.1); gemPhoto.style.setProperty('--lit', (.32 + .68 * lit).toFixed(3));
      for (var i = 0; i < P.length; i++) {
        var p = P[i], x, y, a;
        var k = smooth((t - p.d) / 1.5);                         // gather
        var rel = clamp((t - 3.1 - p.d * .6) / 2.2, 0, 1);        // release
        if (rel <= 0) { x = lerp(p.sx, p.tx, k); y = lerp(p.sy, p.ty, k); a = .25 + .75 * k; }
        else {
          if (!p.keep && rel >= 1) continue;
          if (p.fx === undefined) { p.fx = p.tx; p.fy = p.ty; }
          p.fx += p.vx + Math.sin(t * .7 + p.ph) * .25; p.fy += p.vy;
          if (p.fy < -10) { p.fy = h + 10; p.fx = Math.random() * w; }
          var dx = p.fx - mx, dy = p.fy - my, dd = dx * dx + dy * dy;
          if (dd < 9000) { var f = (1 - dd / 9000) * 2.2; p.fx += dx / Math.sqrt(dd + 1) * f; p.fy += dy / Math.sqrt(dd + 1) * f; }
          x = p.fx; y = p.fy; a = p.keep ? .35 + .65 * (1 - rel * .4) : 1 - rel;
        }
        var tw = .55 + .45 * Math.sin(t * 3 + p.ph);
        c.fillStyle = 'rgba(' + p.c + ',' + (a * tw).toFixed(3) + ')';
        c.beginPath(); c.arc(x, y, p.r, 0, 6.283); c.fill();
        if (p.r > 1.9 && tw > .93) { c.fillRect(x - p.r * 3, y - .4, p.r * 6, .8); c.fillRect(x - .4, y - p.r * 3, .8, p.r * 6); }
      }
      burst = burst.filter(function (b) { return t - b.t < 1.1; });
      burst.forEach(function (b) {
        var q = (t - b.t) / 1.1;
        b.p.forEach(function (s) { c.fillStyle = 'rgba(233,201,139,' + (1 - q).toFixed(3) + ')'; c.beginPath(); c.arc(b.x + s[0] * q * 60, b.y + s[1] * q * 60 + q * q * 20, 1.4, 0, 6.283); c.fill(); });
      });
      c.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still() && vis) raf = requestAnimationFrame(frame); }
    function start() { size(); if (!pts.length && img.complete && img.naturalWidth) sample(); seed(); t0 = performance.now(); kick(); }
    img.onload = function () { sample(); if (!still()) start(); };
    hero.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) {
      if (still()) return; var r = cv.getBoundingClientRect(), ps = [];
      for (var i = 0; i < 18; i++) { var a = Math.random() * 6.283, s = .4 + Math.random(); ps.push([Math.cos(a) * s, Math.sin(a) * s]); }
      burst.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: (performance.now() - t0) / 1000, p: ps });
    });
    watch(hero, function (v) { vis = v; kick(); });
    return {
      restart: function () { if (still()) { gemPhoto.style.setProperty('--lit', 1); c.clearRect(0, 0, w, h); } else start(); },
      size: function () { size(); seed(); t0 = performance.now() - 6000; }
    };
  })();
  if (still()) gemPhoto.style.setProperty('--lit', 1);

  // ---------------------------------------------------------------- hero: her other rooms, dealt out of the diamond, orbit it
  var orbit = $$('.oc'), gem = $('[data-tilt]'), heroT0 = performance.now(), tiltX = 0, tiltY = 0, tx = 0, ty = 0, orbRaf = 0, heroVis = true;
  function orbitFrame(tm) {
    orbRaf = 0;
    var W = gemWrap.clientWidth, Hh = gemWrap.clientHeight, ph = phone();
    if (still()) {
      orbit.forEach(function (o, i) {
        var a = i / orbit.length * 6.283 + .6, x = Math.cos(a) * W * (ph ? .44 : .56), y = Math.sin(a) * Hh * (ph ? .5 : .3);
        o.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(.85)'; o.style.zIndex = Math.sin(a) > 0 ? 3 : 0; o.style.opacity = 1;
      });
      gem.style.transform = ''; ribbon.style.transform = ''; return;
    }
    var t = (tm - heroT0) / 1000, deal = smooth((t - .5) / 1.3);
    var base = t * .12 + (scrollY / Math.max(1, innerHeight)) * 1.1;
    orbit.forEach(function (o, i) {
      var a = base + i / orbit.length * 6.283, sa = Math.sin(a);
      var x = Math.cos(a) * W * (ph ? .44 : .56) * deal, y = sa * Hh * (ph ? .5 : .3) * deal;
      var s = (.62 + .38 * (sa + 1) / 2) * (.3 + .7 * deal);
      o.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
      o.style.opacity = (Math.min(1, deal * 2) * (.55 + .45 * (sa + 1) / 2)).toFixed(3);
      o.style.zIndex = sa > 0 ? 3 : 0;
    });
    ribbonMove(t);
    tx = lerp(tx, tiltX, .07); ty = lerp(ty, tiltY, .07);
    gem.style.transform = 'perspective(1400px) rotateY(' + (tx * 7).toFixed(2) + 'deg) rotateX(' + (-ty * 5).toFixed(2) + 'deg)';
    gemPhoto.style.setProperty('--px', (-tx * 18).toFixed(1) + 'px'); gemPhoto.style.setProperty('--py', (-ty * 14).toFixed(1) + 'px');
    if (ph) { tiltX = Math.sin(t * .5) * .6; tiltY = Math.cos(t * .4) * .4; }   // phones: the diamond sways by itself
    if (heroVis) orbRaf = requestAnimationFrame(orbitFrame);
  }
  var ribbon = $('[data-ribbon]');
  function ribbonMove(t) {
    var half = ribbon.scrollWidth / 2 || 1, x = ((t || 0) * 22 + scrollY * .5) % half;
    ribbon.style.transform = 'translateX(' + (root.dir === 'rtl' ? x : -x).toFixed(1) + 'px)';
  }
  function orbitKick() { if (!orbRaf) orbRaf = requestAnimationFrame(orbitFrame); }
  hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; tiltX = e.clientX / innerWidth * 2 - 1; tiltY = e.clientY / innerHeight * 2 - 1; });
  watch(hero, function (v) { heroVis = v; if (v) orbitKick(); });

  // ---------------------------------------------------------------- WALK-IN: through her rooms, each one opening as a diamond of the gold screen
  var walk = $('[data-walk]'), shots = $$('[data-shot]'), N = shots.length, rim = $('[data-rim]'), rimSvg = $('.iris-rim'), sparks = $('[data-sparks]');
  var ROOMS = [
    { he: ['השלט על השדרה', 'שני גילת, שדרות אח״י אילת 51, חיפה.'], en: ['The sign on the boulevard', 'Shani Gilat, 51 Achi Eilat Blvd, Haifa.'] },
    { he: ['עמדות הציפורניים', 'מניקור, לק ג׳ל ובנייה, ליד החלון הגדול.'], en: ['The nail bar', 'Manicures, gel and extensions by the big window.'] },
    { he: ['כורסת הפדיקור', 'פדיקור ולק ג׳ל לרגליים, מול מחיצת הזהב.'], en: ['The pedicure chair', 'Pedicures and gel for toes, by the gold screen.'] },
    { he: ['חדר הטיפולים', 'חדר שקט מול הטפט הטרופי והמראה המוזהבת.'], en: ['The treatment room', 'A quiet room with tropical wallpaper and a gilded mirror.'] },
    { he: ['תא השיזוף', 'שיזוף בהתזה, במנוי או חד-פעמי.'], en: ['The tanning booth', 'Spray tanning, with a package or one at a time.'] },
    { he: ['הדלפק', 'מנורות זהב, ולוח הטיפולים מעל הדלפק.'], en: ['The front desk', 'Gold pendant lights, and the treatment board above.'] }
  ];
  var cur = -1, stillIdx = 0, dots = $('[data-walk-dots]'), wlName = $('[data-wl-name]'), wlLine = $('[data-wl-line]');
  ROOMS.forEach(function (r, i) {
    var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab');
    b.addEventListener('click', function () { goRoom(i); }); dots.appendChild(b);
  });
  var GLYPH = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHJKLMNOPRSTUVWXYZ' };
  function decode(el, text) {
    if (still()) { el.textContent = text; return; }
    var set = GLYPH[root.lang], start = performance.now(), dur = 520;
    (function step(tm) {
      var q = clamp((tm - start) / dur, 0, 1), n = Math.floor(text.length * q), s = text.slice(0, n);
      for (var i = n; i < text.length; i++) s += text[i] === ' ' ? ' ' : set[(Math.random() * set.length) | 0];
      el.textContent = s; if (q < 1) requestAnimationFrame(step);
    })(start);
  }
  function walkLabel(force, idx) {
    if (idx === undefined) idx = still() ? stillIdx : Math.max(cur, 0);
    var r = ROOMS[idx][root.lang];
    if (force) { wlName.textContent = r[0]; } else decode(wlName, r[0]);
    wlLine.textContent = r[1];
    if (!still() && !force && wlLine.animate) wlLine.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.23,1,.32,1)' });
    $$('button', dots).forEach(function (b, i) { b.setAttribute('aria-selected', i === idx ? 'true' : 'false'); b.setAttribute('aria-label', ROOMS[i][root.lang][0]); });
  }
  function spray(x, y, W, Hh) {
    if (!sparks.animate) return;
    for (var i = 0; i < 12; i++) {
      var s = document.createElement('i'), a = Math.random() * 6.283, d = 30 + Math.random() * 70;
      s.style.left = (x + (Math.random() - .5) * W * .3) + 'px'; s.style.top = (y + (Math.random() - .5) * Hh * .3) + 'px'; sparks.appendChild(s);
      s.animate([{ opacity: 1, transform: 'translate(0,0) scale(1)' }, { opacity: 0, transform: 'translate(' + Math.cos(a) * d + 'px,' + (Math.sin(a) * d + 30) + 'px) scale(.3)' }], { duration: 700 + Math.random() * 400, easing: 'cubic-bezier(.23,1,.32,1)' }).onfinish = function () { this.effect.target.remove(); };
    }
  }
  var lastAmt = [];
  function walkUpdate() {
    if (still()) return;
    var r = walk.getBoundingClientRect(), vh = innerHeight, span = walk.offsetHeight - vh;
    var p = clamp(-r.top / Math.max(1, span), 0, 1), s = p * (N - 1);
    var W = innerWidth, Hh = vh, cx = W / 2, cy = Hh / 2, amax = (W / 2 + Hh / 3.464) * 1.04, idx = 0, rimOn = false;
    shots.forEach(function (sh, k) {
      var img = sh.firstElementChild, fx = +sh.dataset.x, fy = +sh.dataset.y;
      img.style.transformOrigin = fx + '% ' + fy + '%';
      if (k === 0) { sh.style.clipPath = 'none'; img.style.transform = 'scale(' + (1 + .32 * smooth(s / 1.1)).toFixed(4) + ')'; return; }
      var amt = smooth((s - (k - 1) - .35) / .6);
      if (amt >= .5) idx = k;
      var a = amt * amax, b = a * 1.732;
      if (amt <= 0) sh.style.clipPath = 'polygon(50% 50%,50% 50%,50% 50%,50% 50%)';
      else if (amt >= 1) sh.style.clipPath = 'none';
      else {
        sh.style.clipPath = 'polygon(' + cx + 'px ' + (cy - b) + 'px,' + (cx + a) + 'px ' + cy + 'px,' + cx + 'px ' + (cy + b) + 'px,' + (cx - a) + 'px ' + cy + 'px)';
        rim.setAttribute('points', '50,' + ((cy - b) / Hh * 100).toFixed(2) + ' ' + ((cx + a) / W * 100).toFixed(2) + ',50 50,' + ((cy + b) / Hh * 100).toFixed(2) + ' ' + ((cx - a) / W * 100).toFixed(2) + ',50');
        rimOn = true;
      }
      var local = clamp((s - (k - .65)) / 1.8, 0, 1);
      img.style.transform = 'scale(' + (1.3 - .22 * smooth(local)).toFixed(4) + ') translate3d(0,' + ((.5 - local) * 3).toFixed(2) + '%,0)';
      if (lastAmt[k] !== undefined && ((lastAmt[k] < .5) !== (amt < .5))) spray(cx, cy, W, Hh);
      lastAmt[k] = amt;
    });
    rimSvg.style.opacity = rimOn ? 1 : 0;
    if (idx !== cur) { cur = idx; walkLabel(false, idx); }
  }
  function stillShow() { shots.forEach(function (sh, k) { sh.classList.toggle('on', k === stillIdx); sh.style.clipPath = 'none'; }); walkLabel(true, stillIdx); }
  function goRoom(i) {
    i = (i + N) % N;
    if (still()) { stillIdx = i; stillShow(); return; }
    var span = walk.offsetHeight - innerHeight, top = walk.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + (i / (N - 1)) * span + (i ? 2 : 0), behavior: 'smooth' });
  }
  $('[data-walk-prev]').addEventListener('click', function () { goRoom((still() ? stillIdx : Math.max(cur, 0)) - 1); });
  $('[data-walk-next]').addEventListener('click', function () { goRoom((still() ? stillIdx : Math.max(cur, 0)) + 1); });

  // ---------------------------------------------------------------- bento: spotlight + the shelf of colours
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var SHADES = [
    { c: '#e8b4b0', he: 'ורוד פודרה', en: 'Powder pink' }, { c: '#d9b49b', he: 'ניוד', en: 'Nude' },
    { c: '#b0182a', he: 'אדום קלאסי', en: 'Classic red' }, { c: '#6b1426', he: 'בורדו', en: 'Burgundy' },
    { c: '#ef7a5f', he: 'אלמוגי', en: 'Coral' }, { c: '#f4ece6', he: 'פרנץ׳', en: 'French' },
    { c: '#d4ae63', he: 'זהב שימר', en: 'Gold shimmer' }, { c: '#efe2dd', he: 'שקוף', en: 'Clear' }
  ];
  var bottles = $$('[data-bottles] i'), bi = 0, bTimer = 0, shadesTile = $('.t-shades');
  bottles.forEach(function (b, i) { b.style.setProperty('--c', SHADES[i].c); });
  function bottleStep() {
    bottles.forEach(function (b) { b.classList.remove('on'); });
    var b = bottles[bi % bottles.length]; void b.offsetWidth; b.classList.add('on');
    shadesTile.style.backgroundColor = mix(SHADES[bi % bottles.length].c, '#2f1b22', .82); bi++;
  }
  function mix(a, b, t) {
    var pa = [1, 3, 5].map(function (i) { return parseInt(a.substr(i, 2), 16); }), pb = [1, 3, 5].map(function (i) { return parseInt(b.substr(i, 2), 16); });
    return 'rgb(' + pa.map(function (v, i) { return Math.round(v * (1 - t) + pb[i] * t); }).join(',') + ')';
  }
  watch(shadesTile, function (v) { clearInterval(bTimer); if (v && !still()) { bottleStep(); bTimer = setInterval(function () { if (still()) { clearInterval(bTimer); return; } bottleStep(); }, 1700); } });

  // ---------------------------------------------------------------- SEAM: the gold screen closes over the change from rose to night, then opens
  var seam = $('[data-seam]'), pa = $('.p-a'), pb = $('.p-b'), smark = $('.seam-mark'), cardSec = $('#card');
  function seamUpdate() {
    if (still()) { seam.classList.remove('on'); return; }
    var vh = innerHeight, b = cardSec.getBoundingClientRect().top;
    var c = smooth(1 - (Math.abs(b - vh * .5) - vh * .06) / (vh * .44));
    seam.classList.toggle('on', c > 0);
    if (c <= 0) return;
    pa.style.transform = 'translateX(' + (-101 * (1 - c)).toFixed(2) + '%)';
    pb.style.transform = 'translateX(' + (101 * (1 - c)).toFixed(2) + '%)';
    var m = smooth((c - .85) / .15); smark.style.opacity = m.toFixed(3); smark.style.transform = 'scale(' + (.8 + .2 * m).toFixed(3) + ') rotate(' + ((1 - m) * -20).toFixed(1) + 'deg)';
  }

  // ---------------------------------------------------------------- reviews wallpaper drifts; closing photo shrinks into its frame
  var paper = $('.paper img'), revs = $('#reviews'), shrink = $('[data-shrink]'), vpIn = $('.vp-in');
  function revUpdate() {
    if (still()) { paper.style.setProperty('--pp', '0px'); return; }
    var r = revs.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    paper.style.setProperty('--pp', (r.top * -.12).toFixed(1) + 'px');
  }
  function shrinkUpdate() {
    if (still()) { vpIn.style.transform = ''; vpIn.style.borderRadius = ''; return; }
    var r = shrink.getBoundingClientRect(), vh = innerHeight;
    var p = smooth((vh - r.top) / (vh * .85)), s0 = Math.min(1.3, Math.max(1.04, innerWidth / r.width * 1.02));
    vpIn.style.transform = 'scale(' + lerp(s0, 1, p).toFixed(4) + ')';
    vpIn.style.borderRadius = lerp(0, 22, p).toFixed(1) + 'px';
  }

  // ---------------------------------------------------------------- footer curtain
  var foot = $('[data-foot]'), page = $('.page');
  function curtain() {
    var fits = !still() && foot.offsetHeight <= innerHeight - 60;
    foot.classList.toggle('curtain', fits);
    page.style.marginBottom = fits ? foot.offsetHeight + 'px' : '';
  }
  function footUpdate() {
    if (still()) { foot.classList.add('in'); return; }
    var docH = document.documentElement.scrollHeight;
    if (scrollY + innerHeight >= docH - foot.offsetHeight * .5) foot.classList.add('in');
  }

  // ---------------------------------------------------------------- dock
  var dock = $('[data-dock]');
  function dockUpdate() { dock.classList.toggle('show', scrollY > hero.offsetHeight * .55); }

  // ---------------------------------------------------------------- THE CARD: compose the next appointment
  var TREATS = [
    { id: 'mani', he: 'מניקור', en: 'Manicure', heTo: 'למניקור', shade: true },
    { id: 'gel', he: 'לק ג׳ל', en: 'Gel polish', heTo: 'ללק ג׳ל', shade: true },
    { id: 'acryl', he: 'בנייה באקריל', en: 'Acrylic extensions', heTo: 'לבנייה באקריל', shade: true },
    { id: 'pedi', he: 'פדיקור', en: 'Pedicure', heTo: 'לפדיקור', shade: true },
    { id: 'tan', he: 'שיזוף בהתזה', en: 'Spray tan', heTo: 'לשיזוף בהתזה', shade: false },
    { id: 'brow', he: 'עיצוב גבות', en: 'Brow shaping', heTo: 'לעיצוב גבות', shade: false },
    { id: 'pmu', he: 'איפור קבוע', en: 'Permanent makeup', heTo: 'לאיפור קבוע', shade: false }
  ];
  var TIMES = [
    { id: 'am', he: 'בוקר', en: 'Morning', heAt: 'בבוקר', enAt: 'in the morning', h: [9, 12] },
    { id: 'mid', he: 'צהריים', en: 'Midday', heAt: 'בצהריים', enAt: 'at midday', h: [12, 15] },
    { id: 'pm', he: 'אחר הצהריים', en: 'Afternoon', heAt: 'אחר הצהריים', enAt: 'in the afternoon', h: [15, 19] }
  ];
  var dShort = { he: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] };
  var st = { t: 1, s: 0, d: 0, tm: 0 };
  (function () { var n = now(), d = n.d, k = 0; if (!H[d] || n.h >= H[d][1] - 1) { d = (d + 1) % 7; } while (!H[d] && k++ < 7) d = (d + 1) % 7; st.d = d; })();
  function radio(container, items, sel, onPick, cls, extra) {
    container.setAttribute('role', 'radiogroup'); container.innerHTML = '';
    items.forEach(function (it, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = cls; b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', i === sel ? 'true' : 'false');
      if (extra) extra(b, it, i);
      b.addEventListener('click', function () { if (b.disabled) return; onPick(i); });
      container.appendChild(b);
    });
  }
  function buildPicks() {
    var l = root.lang;
    radio($('[data-treats]'), TREATS, st.t, function (i) { st.t = i; buildPicks(); render(true); }, 'opt', function (b, it) { b.textContent = it[l]; });
    radio($('[data-shades]'), SHADES, st.s, function (i) { st.s = i; buildPicks(); render(true); }, 'sw', function (b, it) { b.style.setProperty('--c', it.c); b.setAttribute('aria-label', it[l]); b.title = it[l]; });
    var shadeOk = TREATS[st.t].shade, fs = $('[data-shade-set]'); fs.disabled = !shadeOk;
    radio($('[data-days]'), [0, 1, 2, 3, 4, 5, 6], st.d, function (i) { st.d = i; if (st.d === 5 && st.tm === 2) st.tm = 1; buildPicks(); render(true); }, 'day', function (b, d) {
      var t = H[d]; b.innerHTML = dShort[l][d] + '<small>' + (t ? hhmm(t[0]).replace(':00', '') + '–' + hhmm(t[1]).replace(':00', '') : (l === 'he' ? 'סגור' : 'closed')) + '</small>';
      b.setAttribute('aria-label', (l === 'he' ? 'יום ' + dayHe[d] : dayEn[d]) + (t ? '' : (l === 'he' ? ', סגור' : ', closed'))); b.disabled = !t;
    });
    radio($('[data-times]'), TIMES, st.tm, function (i) { st.tm = i; buildPicks(); render(true); }, 'tm', function (b, it) {
      b.textContent = it[l]; var t = H[st.d]; b.disabled = !t || it.h[0] >= t[1];
    });
  }
  var ticket = $('[data-ticket]'), copyLabel = $('[data-copy-label]');
  function message() {
    var tr = TREATS[st.t], sh = SHADES[st.s], tm = TIMES[st.tm], l = he();
    if (l) return 'היי שני, אשמח לקבוע תור ' + tr.heTo + (tr.shade ? ', בגוון ' + sh.he : '') + ', ביום ' + dayHe[st.d] + ' ' + tm.heAt + '.';
    return 'Hi Shani, I’d like to book an appointment for ' + tr.en.toLowerCase() + (tr.shade ? ' in ' + sh.en.toLowerCase() : '') + ' on ' + dayEn[st.d] + ' ' + tm.enAt + '.';
  }
  function render(anim) {
    var tr = TREATS[st.t], sh = SHADES[st.s], tm = TIMES[st.tm], l = root.lang, t = H[st.d];
    $('[data-tk="treat"]').textContent = tr[l];
    var sd = $('[data-tk="shade"]'); sd.style.setProperty('--c', sh.c); $('span', sd).textContent = sh[l];
    $('[data-tk-shade-row]').hidden = !tr.shade;
    $('[data-tk="day"]').textContent = l === 'he' ? 'יום ' + dayHe[st.d] : dayEn[st.d];
    var hEnd = t ? Math.min(tm.h[1], t[1]) : tm.h[1];
    $('[data-tk="time"]').innerHTML = tm[l] + ' · <span dir="ltr">' + hhmm(tm.h[0]) + '–' + hhmm(hEnd) + '</span>';
    copyLabel.textContent = l === 'he' ? 'העתקת הפרטים' : 'Copy the details';
    if (anim && !still()) { ticket.classList.remove('feed'); void ticket.offsetWidth; ticket.classList.add('feed'); }
  }
  $('[data-copy]').addEventListener('click', function () {
    var txt = message(), done = function () { copyLabel.textContent = he() ? 'הועתק, אפשר להדביק' : 'Copied, ready to paste'; setTimeout(function () { render(false); }, 2200); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, fallback); else fallback();
    function fallback() { var ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); done(); }
  });

  // ---------------------------------------------------------------- loop
  var ticking = false;
  function tick() {
    ticking = false;
    var y = scrollY;
    nav.classList.toggle('pill', y > 40);
    nav.style.top = Math.max(0, cb - y) + 'px';
    walkUpdate(); seamUpdate(); revUpdate(); shrinkUpdate(); footUpdate(); dockUpdate();
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }, { passive: true });
  function layout() {
    cb = concept.offsetHeight; root.style.setProperty('--cb', cb + 'px');
    curtain(); glitter.size && !still() && glitter.size();
    if (still()) stillShow(); else shots.forEach(function (sh) { sh.classList.remove('on'); });
    orbitKick(); cur = -1; tick();
  }
  var rt = 0; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 150); });

  texts(root.lang); hours(); buildPicks(); render(false);
  cb = concept.offsetHeight; root.style.setProperty('--cb', cb + 'px');
  curtain(); if (still()) stillShow(); walkLabel(true, 0); orbitKick(); tick();
  addEventListener('load', function () { curtain(); tick(); });
})();
