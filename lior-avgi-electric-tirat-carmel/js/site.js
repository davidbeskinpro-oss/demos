(function () {
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 700; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var PHONE = '972526483505';

  /* ---------- language ---------- */
  function texts() {
    var l = root.lang;
    $$('img[data-alt-en]').forEach(function (i) { if (!i.dataset.altHe) i.dataset.altHe = i.alt; i.alt = l === 'he' ? i.dataset.altHe : i.dataset.altEn; });
    $$('[data-ph-en]').forEach(function (i) { if (!i.dataset.phHe) i.dataset.phHe = i.placeholder; i.placeholder = l === 'he' ? i.dataset.phHe : i.dataset.phEn; });
    var lb = $('[data-set-lang]'); if (lb) lb.setAttribute('aria-label', l === 'he' ? 'Switch to English' : 'מעבר לעברית');
    $$('.plate a').forEach(function (a, i) { a.setAttribute('aria-label', [l === 'he' ? 'התקשרו לליאור' : 'Call Lior', l === 'he' ? 'וואטסאפ לליאור' : 'WhatsApp Lior'][i]); });
    var cd = $('[data-concept]'); if (cd) cd.setAttribute('data-concept', l === 'he' ? 'קונספט לדוגמה שנבנה עבור ליאור אבגי · זה אינו האתר הרשמי של העסק' : 'A sample concept built for Lior Avgi · This is not the business’s official website');
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('la-lang', l); } catch (e) {}
    texts(); split(); status(); hours(); compose(); arcLabel(true); baCap(); cable.size();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  /* ---------- motion switch ---------- */
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var off = !still(); root.classList.toggle('still', off);
    try { localStorage.setItem('la-motion', off ? 'off' : 'on'); } catch (e) {}
    motionUI(); if (off) { settle(); arcLabel(true); } else { arc.kick(); scope.kick(); }
    onScroll();
  }); });
  function settle() { $$('[data-reveal],[data-tile],[data-mod],.lamp-photo,.meter').forEach(function (el) { el.classList.add('in'); }); $$('h2[data-fill]').forEach(function (h) { h.classList.add('on'); }); $$('[data-odo]').forEach(function (o) { roll(o); }); $('.seam').classList.add('shut'); }

  /* ---------- hours: Sun–Thu 24 h, Fri 7–15, Sat closed ---------- */
  var H = [[0, 24], [0, 24], [0, 24], [0, 24], [0, 24], [7, 15], null];
  var DN = { he: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] };
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function isOpen(n) { var s = H[n.d]; return !!s && n.h >= s[0] && n.h < s[1]; }
  function status() {
    var n = now(), open = isOpen(n), L = he() ? 'he' : 'en', txt;
    if (open) {
      var s = H[n.d];
      txt = s[1] === 24 ? (L === 'he' ? 'פתוח עכשיו · היום 24 שעות' : 'Open now · 24 hours today') : (L === 'he' ? 'פתוח עכשיו · עד ' + hhmm(s[1]) : 'Open now · until ' + hhmm(s[1]));
    } else {
      // the next opening: later today, or the next day that has hours
      var d = n.d, k = 0, s2 = H[d];
      if (!(s2 && n.h < s2[0])) { do { d = (d + 1) % 7; k++; } while (!H[d] && k < 7); }
      var t = hhmm(H[d][0]);
      txt = L === 'he' ? 'סגור עכשיו · ' + (k === 0 ? 'נפתח היום ב-' + t : k === 1 ? 'נפתח מחר ב-' + t : 'נפתח ביום ' + DN.he[d] + ' ב-' + t) : 'Closed now · ' + (k === 0 ? 'opens today at ' + t : k === 1 ? 'opens tomorrow at ' + t : 'opens ' + DN.en[d] + ' at ' + t);
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot" aria-hidden="true"></span>' + txt; });
    dial(n);
  }
  function hours() {
    var L = he() ? 'he' : 'en', n = now();
    $('[data-hours]').innerHTML = H.map(function (s, i) {
      var v = !s ? (L === 'he' ? 'סגור' : 'Closed') : s[1] - s[0] >= 24 ? (L === 'he' ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(s[0]) + '–' + hhmm(s[1]) + '</span>';
      return '<tr' + (i === n.d ? ' class="today"' : '') + '><td>' + (L === 'he' ? 'יום ' : '') + DN[L][i] + '</td><td>' + v + '</td></tr>';
    }).join('');
  }
  /* 24 h time switch: 96 pins (15 min), pushed in (amber) where today is open; the dial turns so now sits under the red pointer */
  var dialG = $('[data-dial]');
  (function buildDial() {
    var ns = 'http://www.w3.org/2000/svg', g = document.createElementNS(ns, 'g'); g.setAttribute('data-rot', '');
    var html = '<circle class="face" r="100"/>';
    for (var i = 0; i < 96; i++) { var a = i / 96 * Math.PI * 2; html += '<rect class="pin" data-pin="' + i + '" x="-2.6" y="-97" width="5.2" height="14" rx="1.5" transform="rotate(' + (i * 3.75) + ')"/>'; }
    for (var h = 0; h < 24; h += 3) { var b = h / 24 * Math.PI * 2; html += '<text class="num" x="' + (Math.sin(b) * 70).toFixed(1) + '" y="' + (-Math.cos(b) * 70).toFixed(1) + '">' + h + '</text>'; }
    html += '<circle class="hub" r="46"/>';
    g.innerHTML = html; dialG.appendChild(g);
  })();
  function dial(n) {
    var s = H[n.d];
    $$('.pin', dialG).forEach(function (p, i) { var t = i / 4; p.classList.toggle('on', !!s && t >= s[0] && t < s[1]); });
    $('[data-rot]', dialG).style.transform = 'rotate(' + (-n.h / 24 * 360) + 'deg)';
    $('[data-dial-day]').textContent = (he() ? 'יום ' : '') + DN[he() ? 'he' : 'en'][n.d];
  }

  /* ---------- heading letters fill when the section's circuit closes ---------- */
  function split() {
    $$('h2[data-fill]').forEach(function (h) {
      var i = 0;
      $$('span[lang]', h).forEach(function (sp) {
        if (sp.dataset.done) return; sp.dataset.done = 1;
        (function walk(node) {
          [].slice.call(node.childNodes).forEach(function (c) {
            if (c.nodeType === 3) {
              var f = document.createDocumentFragment();
              c.textContent.split(/(\s+)/).forEach(function (w) {
                if (!w) return;
                if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(w)); return; }
                var ws = document.createElement('span'); ws.className = 'w'; ws.style.whiteSpace = 'nowrap';
                w.split('').forEach(function (ch) { var s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = ch; ws.appendChild(s); });
                f.appendChild(ws);
              });
              node.replaceChild(f, c);
            } else if (c.nodeType === 1 && !c.classList.contains('odo')) walk(c);
          });
        })(sp);
      });
    });
  }
  split();

  /* ---------- reveals ---------- */
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); if (e.target.matches('h2[data-fill]')) e.target.classList.add('on'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px' }) : null;
  $$('[data-mod]').forEach(function (m, i) { m.style.setProperty('--d', (i * 90) + 'ms'); });
  $$('[data-tile]').forEach(function (m, i) { m.style.setProperty('--d', (i * 70) + 'ms'); });
  $$('[data-reveal],[data-tile],[data-mod],h2[data-fill],.lamp-photo,.meter').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  /* ---------- odometers ---------- */
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span aria-hidden="true">' + ch + '</span>';
      var col = ''; for (var k = 0; k < 10; k++) col += '<span data-n="' + k + '"></span>';
      return '<span class="d" aria-hidden="true" data-to="' + ch + '"><span>' + col + '</span></span>';
    }).join('');
  });
  function roll(o) { $$('.d', o).forEach(function (d, i) { var s = d.firstChild; s.style.transitionDelay = (i * 160) + 'ms'; s.style.transform = 'translateY(' + (-d.dataset.to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) { watch(o, function (v) { if (v) roll(o); }, { threshold: .4 }); });

  /* ---------- hero: seam-shut name + 3D arc of his photos ---------- */
  var arc = (function () {
    var wrap = $('[data-arc-wrap]'), cards = $$('.ac', wrap), N = cards.length, rot = 0, vel = 0, raf = 0, vis = true, drag = false, lx = 0, tilt = 0, tiltT = 0, deal = 0, front = -1, last = 0;
    // a wide, gentle partial ring (horizonx arc): cards sit 24 deg apart, the ring wraps behind the back
    var STEP = 24;
    function R() { return phone() ? 420 : Math.min(1100, innerWidth * .62); }
    function place(t) {
      var r = R(), best = 0, bd = 999, span = N * STEP;
      cards.forEach(function (c, i) {
        var a = ((i * STEP + rot) % span + span * 1.5) % span - span / 2;   // -span/2..span/2, 0 = front
        var d = Math.abs(a), k = deal < 1 ? 1 - Math.pow(1 - deal, 3) : 1;
        var aa = a * k, x = Math.sin(aa * Math.PI / 180) * r, z = (Math.cos(aa * Math.PI / 180) - 1) * r;
        c.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + (d * .9 - (d < STEP / 2 ? 14 : 0)).toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotateY(' + (-aa * .6).toFixed(1) + 'deg) rotateX(' + tilt.toFixed(2) + 'deg)';
        c.style.zIndex = 100 - Math.round(d);
        c.style.opacity = clamp((span / 2 - d) / 14, 0, 1).toFixed(2);
        c.style.filter = 'brightness(' + (1 - Math.min(d, 90) / 150).toFixed(2) + ')';
        if (d < bd) { bd = d; best = i; }
      });
      if (best !== front) { front = best; arcLabel(); }
    }
    function frame(t) {
      raf = 0; var dt = last ? Math.min(50, t - last) : 16; last = t;
      if (deal < 1) deal = Math.min(1, deal + dt / 1100);
      if (!drag) { vel += ((root.dir === 'rtl' ? 1 : -1) * 0.012 - vel) * .04; rot += vel * dt; }
      tilt += (tiltT - tilt) * .08;
      place(t);
      if (vis && !still()) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still()) { last = 0; raf = requestAnimationFrame(frame); } else if (still()) { deal = 1; place(); } }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) {
      if (drag) { var dx = e.clientX - lx; lx = e.clientX; rot += dx * .22; vel = dx * .01; }
      else if (e.pointerType === 'mouse') { tiltT = (e.clientY / innerHeight - .5) * -10; }
    });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    watch($('.hero'), function (v) { vis = v; if (v) kick(); });
    return { kick: kick, front: function () { return cards[Math.max(front, 0)]; }, scroll: function (dy) { if (!still()) rot += dy * .05 * (root.dir === 'rtl' ? 1 : -1); }, place: function () { deal = 1; place(); } };
  })();
  /* front card label decodes out of static glyphs */
  var decodeT = 0;
  function arcLabel(instant) {
    var el = $('[data-arc-label]'), c = arc && arc.front ? arc.front() : $('.ac'); if (!c) return;
    var txt = c.dataset[he() ? 'he' : 'en'];
    el.parentNode.setAttribute('aria-label', txt);
    clearInterval(decodeT);
    if (instant || still()) { el.textContent = txt; return; }
    var glyph = he() ? 'אבגדהוזחטיכלמנסעפצקרשת' : 'ABCDEFGHKLMNPRSTVWXZ', f = 0;
    decodeT = setInterval(function () {
      f++; var out = '';
      for (var i = 0; i < txt.length; i++) out += (i < f * 1.5 || txt[i] === ' ') ? txt[i] : glyph[(Math.random() * glyph.length) | 0];
      if (f * 1.5 >= txt.length || still()) { clearInterval(decodeT); out = txt; } el.textContent = out;
    }, 40);
  }

  /* ---------- opening ---------- */
  var boot = $('[data-boot]');
  function openUp() { boot.classList.add('gone'); setTimeout(function () { $('.seam').classList.add('shut'); }, 80); arc.kick(); }
  if (still()) { boot.classList.add('gone'); settle(); arc.place(); }
  else {
    var bv = $('[data-boot-v]'), t0 = performance.now();
    (function v(t) { var k = clamp((t - t0) / 900, 0, 1); bv.textContent = String(Math.round(230 * (1 - Math.pow(1 - k, 3)))).padStart(3, '0'); if (k < 1) requestAnimationFrame(v); })(t0);
    var bt = setTimeout(openUp, 1150);
    boot.addEventListener('click', function () { clearTimeout(bt); openUp(); });
  }

  /* ---------- headlamp on his photo ---------- */
  (function () {
    var el = $('[data-lamp]'), vis = false, raf = 0, x = .4, y = .4, tx = .4, ty = .4, user = 0;
    el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; user = performance.now(); kick(); });
    function frame(t) {
      raf = 0;
      if (t - user > 2500) { tx = .45 + Math.sin(t / 1500) * .28; ty = .42 + Math.sin(t / 1100) * .18; }   // wanders by itself on phones
      x += (tx - x) * .07; y += (ty - y) * .07;
      el.style.setProperty('--x', (x * 100).toFixed(1) + '%'); el.style.setProperty('--y', (y * 100).toFixed(1) + '%');
      if (vis && !still()) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); }
    watch(el, function (v) { vis = v; kick(); });
  })();

  /* ---------- before / after ---------- */
  var PAIRS = [
    { b: 'img/board-before.jpg', a: 'img/board-after.jpg', w: 560, h: 860, he: 'חיווט לא מסודר בקופסה ישנה, ואחרי: לוח חדש ומסודר.', en: 'Messy wiring in an old box, and after: a new, orderly panel.', bhe: 'לפני: חיווט לא מסודר בקופסה ישנה', ben: 'Before: messy wiring in an old box', ahe: 'אחרי: לוח חדש ומסודר', aen: 'After: a new, orderly panel' },
    { b: 'img/busbar-before.jpg', a: 'img/busbar-after.jpg', w: 434, h: 690, he: 'תקלה בפס ההזנה בלוח החשמל, לפני התיקון ואחריו.', en: 'A fault in the panel’s busbar, before and after the repair.', bhe: 'לפני: פס הזנה פגוע בלוח', ben: 'Before: a damaged busbar in the panel', ahe: 'אחרי: פס הזנה אחרי התיקון', aen: 'After: the busbar after the repair' }
  ];
  var ba = $('[data-ba]'), range = $('[data-ba-range]'), cur = 0;
  function baSet(p) { ba.style.setProperty('--p', p + '%'); ba.style.setProperty('--rot', ((p - 50) * 1.8).toFixed(0)); range.value = p; }
  function baCap() {
    var P = PAIRS[cur], L = he() ? 'he' : 'en';
    $('[data-ba-cap]').textContent = P[L];
    var b = $('[data-ba-before]'), a = $('[data-ba-after]');
    b.dataset.altHe = P.bhe; b.dataset.altEn = P.ben; a.dataset.altHe = P.ahe; a.dataset.altEn = P.aen;
    b.alt = P['b' + L]; a.alt = P['a' + L];
    range.setAttribute('aria-label', L === 'he' ? 'גררו כדי להשוות לפני ואחרי' : 'Drag to compare before and after');
  }
  range.addEventListener('input', function () { baSet(+range.value); });
  $$('[data-pair]').forEach(function (b) { b.addEventListener('click', function () {
    cur = +b.dataset.pair; $$('[data-pair]').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
    var P = PAIRS[cur], A = $('[data-ba-after]'), B = $('[data-ba-before]');
    A.src = P.a; B.src = P.b; A.width = B.width = P.w; A.height = B.height = P.h; ba.style.aspectRatio = P.w + '/' + P.h; ba.style.setProperty('--ar', (P.w / P.h).toFixed(3)); baCap();
    sweep();
  }); });
  // the wipe sweeps once across the photo when it arrives (and on each pair change)
  function sweep() {
    if (still()) { baSet(50); return; }
    var t0 = performance.now();
    (function f(t) { var k = clamp((t - t0) / 1800, 0, 1); baSet(Math.round(50 + 36 * Math.sin(k * Math.PI * 2) * (1 - k))); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  watch(ba, function (v) { if (v && !ba.dataset.swept) { ba.dataset.swept = 1; sweep(); } }, { threshold: .5 });

  /* ---------- DIN rail + bento spotlight ---------- */
  [$('[data-din]'), $('.bento')].forEach(function (g) {
    g.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = g.getBoundingClientRect();
      if (g.classList.contains('bento')) $$('.tile', g).forEach(function (t) { var q = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - q.left) + 'px'); t.style.setProperty('--my', (e.clientY - q.top) + 'px'); });
      else { g.style.setProperty('--mx', (e.clientX - r.left) + 'px'); g.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
    });
  });

  /* ---------- oscilloscope ---------- */
  var scope = (function () {
    var cv = $('[data-scope]'), c = cv.getContext('2d'), w = 0, h = 0, raf = 0, vis = false, mode = 'spd', ph = 0, read = $('[data-scope-read]');
    var READ = { spd: '230 V · 50 Hz', loose: '230 V · 50 Hz', clean: '230 V · 50 Hz', ev: '230 V · 32 A' };
    function size() { var d = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * d; cv.height = h * d; c.setTransform(d, 0, 0, d, 0, 0); }
    function draw(t) {
      c.clearRect(0, 0, w, h);
      c.strokeStyle = 'rgba(159,227,154,.12)'; c.lineWidth = 1;
      for (var gx = 0; gx <= 10; gx++) { c.beginPath(); c.moveTo(gx * w / 10, 0); c.lineTo(gx * w / 10, h); c.stroke(); }
      for (var gy = 0; gy <= 8; gy++) { c.beginPath(); c.moveTo(0, gy * h / 8); c.lineTo(w, gy * h / 8); c.stroke(); }
      var mid = h / 2, A = h * .26, cyc = 3, lim = A * 1.12;
      c.beginPath(); c.lineWidth = 2.4; c.strokeStyle = '#9fe39a'; c.shadowColor = '#9fe39a'; c.shadowBlur = 8;
      var spikeAt = ((t / 2600) % 1) * w;
      for (var x = 0; x <= w; x += 2) {
        var v = Math.sin((x / w) * cyc * Math.PI * 2 - ph) * A;
        if (mode === 'spd') {   // a surge spike rides in, and is clipped at the limit (the SPD at work)
          var dx = x - spikeAt; v += Math.exp(-dx * dx / 120) * A * 2.2 * (Math.sin(dx / 3) > 0 ? 1 : -.4);
          v = clamp(v, -lim, lim);
        } else if (mode === 'loose') {  // a loose contact: the wave drops out in bursts
          var n = Math.sin(x * .31 + t * .02) * Math.sin(x * .07 - t * .013);
          if (n > .55) v *= .15; v += (Math.random() - .5) * A * .12 * (n > .3 ? 1 : 0);
        } else if (mode === 'ev') { v *= 1; }
        x === 0 ? c.moveTo(x, mid - v) : c.lineTo(x, mid - v);
      }
      c.stroke(); c.shadowBlur = 0;
      if (mode === 'spd') { c.setLineDash([6, 6]); c.strokeStyle = 'rgba(247,160,5,.7)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, mid - lim); c.lineTo(w, mid - lim); c.moveTo(0, mid + lim); c.lineTo(w, mid + lim); c.stroke(); c.setLineDash([]); }
    }
    function frame(t) { raf = 0; ph += .045; draw(t); if (vis && !still()) raf = requestAnimationFrame(frame); }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    function setMode(m) { mode = m; read.textContent = READ[m]; kick(); }
    $$('.faq details').forEach(function (d) { d.addEventListener('toggle', function () { if (d.open) { $$('.faq details').forEach(function (o) { if (o !== d) o.open = false; }); setMode(d.dataset.mode); } }); });
    addEventListener('resize', function () { size(); kick(); });
    size();
    watch(cv, function (v) { vis = v; if (v) { size(); kick(); } });
    return { kick: kick };
  })();

  /* ---------- composer ---------- */
  var flips = $$('.flip'), where = $('[data-where]'), what = $('[data-what]');
  function compose() {
    var L = he() ? 'he' : 'en';
    var picks = flips.filter(function (f) { return f.getAttribute('aria-pressed') === 'true'; }).map(function (f) { return f.dataset[L]; });
    var w = where.value.trim(), d = what.value.trim(), m;
    if (L === 'he') m = 'היי ליאור,\n' + (picks.length ? 'אשמח לעזרה עם: ' + picks.join(', ') + '.' : 'אשמח לעזרה בעבודת חשמל.') + (w ? '\nאיפה: ' + w + '.' : '') + (d ? '\n' + d : '');
    else m = 'Hi Lior,\n' + (picks.length ? 'I’d like help with ' + picks.join(', ') + '.' : 'I’d like help with an electrical job.') + (w ? '\nWhere: ' + w + '.' : '') + (d ? '\n' + d : '');
    $('[data-preview]').textContent = m;
    $('[data-send]').href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(m);
    var st = $$('[data-steps] li'); st[0].classList.toggle('on', picks.length > 0); st[1].classList.toggle('on', !!w); st[2].classList.toggle('on', picks.length > 0 && !!w);
  }
  flips.forEach(function (f) { f.addEventListener('click', function () { f.setAttribute('aria-pressed', f.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); compose(); }); });
  where.addEventListener('input', compose); what.addEventListener('input', compose);

  /* ---------- the cable run (three conductors down the page, current fills with scroll) ---------- */
  var cable = (function () {
    var svg = $('[data-cable]'), base = $('[data-cable-base]'), live = $('[data-cable-live]'), spark = $('[data-spark]'), paths = [], len = 0, H2 = 0;
    var COL = ['#9a5a32', '#2f6fd6', '#4fa046'];
    function size() {
      var main = $('#main'); H2 = main.offsetHeight + main.offsetTop; var W = phone() ? 14 : 40, rtl = root.dir === 'rtl';
      svg.setAttribute('width', W); svg.setAttribute('height', H2); svg.style.height = H2 + 'px';
      var secs = $$('#main > section'), top0 = $('.hero').offsetTop + $('.hero').offsetHeight * .82;
      base.innerHTML = ''; live.innerHTML = ''; paths = [];
      [0, 1, 2].forEach(function (k) {
        var gap = phone() ? 4 : 9, x0 = (phone() ? 3 : 10) + k * gap, x = rtl ? W - x0 : x0, d = 'M' + x + ' ' + top0;
        secs.slice(1).forEach(function (s, i) { var y = s.offsetTop + 30, sh = (i % 2 ? 1 : -1) * (phone() ? 2 : 6); d += ' L' + x + ' ' + (y - 40) + ' Q' + (x + sh) + ' ' + y + ' ' + x + ' ' + (y + 40); });
        d += ' L' + x + ' ' + (H2 - 10);
        var p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); p.setAttribute('class', 'b'); p.setAttribute('stroke', COL[k]); base.appendChild(p);
        if (k === 2) { p.setAttribute('stroke-dasharray', '14 10'); var q = p.cloneNode(); q.setAttribute('stroke', '#e2c21d'); q.setAttribute('stroke-dashoffset', '12'); base.appendChild(q); }
        var l = p.cloneNode(); l.setAttribute('class', 'l'); l.removeAttribute('stroke-dasharray'); l.setAttribute('stroke', k === 0 ? '#f7a005' : COL[k]); live.appendChild(l); paths.push(l);
      });
      len = paths[0].getTotalLength(); paths.forEach(function (p) { p.style.strokeDasharray = len; });
      update();
    }
    function update() {
      if (!len) return;
      var y = scrollY + innerHeight * .6, k = still() ? 1 : clamp(y / H2, 0, 1);
      paths.forEach(function (p, i) { p.style.strokeDashoffset = len * (1 - k) + (i ? 30 : 0); });
      var pt = paths[0].getPointAtLength(len * k); spark.setAttribute('cx', pt.x); spark.setAttribute('cy', pt.y);
      spark.style.opacity = still() || k >= 1 ? 0 : 1;
    }
    return { size: size, update: update };
  })();

  /* ---------- scroll loop ---------- */
  var nav = $('[data-nav]'), plate = $('[data-plate]'), markers = $('[data-markers]'), wire = $('[data-wire]'), lastY = scrollY, ticking = false, hideFor = false;
  watch($('#ticket'), function (v) { hideFor = v; onScroll(); }, { threshold: .15 });
  function onScroll() {
    ticking = false;
    var y = scrollY; nav.classList.toggle('pill', y > 60);
    plate.classList.toggle('show', y > innerHeight * .7 && !hideFor && y < $('#contact').offsetTop - innerHeight * .4);
    arc.scroll(y - lastY); lastY = y;
    cable.update();
    // reviews slide along the cable with scroll, each marker swinging a little
    var r = wire.getBoundingClientRect(), k = clamp(1 - (r.top + r.height) / (innerHeight + r.height), 0, 1);
    var over = markers.scrollWidth - wire.clientWidth;
    if (still() || over <= 0) { markers.style.setProperty('--tx', '0px'); $$('.mk', markers).forEach(function (m) { m.style.setProperty('--rz', '0deg'); }); }
    else {
      var dir = root.dir === 'rtl' ? 1 : -1;
      markers.style.setProperty('--tx', (dir * (k * (over + 80) - 40)).toFixed(1) + 'px');
      $$('.mk', markers).forEach(function (m, i) { m.style.setProperty('--rz', (Math.sin(k * 9 + i * 1.7) * 2.2).toFixed(2) + 'deg'); });
    }
    sparks.scroll();
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  /* ---------- footer: the LA logo assembles from sparks ---------- */
  var sparks = (function () {
    var foot = $('.foot'), cv = $('[data-sparks]'), c = cv.getContext('2d'), P = [], img = new Image(), w = 0, h = 0, raf = 0, vis = false, k = 0, mx = -999, my = -999, ok = false;
    img.src = 'img/logo-la.png';
    img.onload = function () { ok = true; build(); };
    function build() {
      var d = Math.min(2, devicePixelRatio || 1); w = foot.clientWidth; h = foot.clientHeight; cv.width = w * d; cv.height = h * d; c.setTransform(d, 0, 0, d, 0, 0);
      var lg = $('.foot-logo'), fr = foot.getBoundingClientRect(), lr = lg.getBoundingClientRect();
      var ox = lr.left - fr.left, oy = lr.top - fr.top, S = lr.width / img.width;
      var o = document.createElement('canvas'); o.width = img.width; o.height = img.height; var oc = o.getContext('2d'); oc.drawImage(img, 0, 0);
      var data = oc.getImageData(0, 0, o.width, o.height).data, step = 4; P = [];
      for (var y = 0; y < o.height; y += step) for (var x = 0; x < o.width; x += step) {
        var i = (y * o.width + x) * 4; if (data[i + 3] < 140) continue;
        P.push({ tx: ox + x * S, ty: oy + y * S, sx: Math.random() * w, sy: h + Math.random() * h * .3, col: 'rgb(' + data[i] + ',' + data[i + 1] + ',' + data[i + 2] + ')', ph: Math.random() * 6.3, x: 0, y: 0 });
      }
      kick();
    }
    function frame(t) {
      raf = 0; c.clearRect(0, 0, w, h);
      var e = 1 - Math.pow(1 - k, 3), sz = Math.max(2, w < 700 ? 2.6 : 3.2);
      P.forEach(function (p) {
        var x = p.sx + (p.tx - p.sx) * e + Math.sin(t / 600 + p.ph) * (1 - e) * 20, y = p.sy + (p.ty - p.sy) * e;
        var dx = x - mx, dy = y - my, dd = dx * dx + dy * dy;
        if (dd < 3600) { var f = (1 - dd / 3600) * 14; x += dx / Math.sqrt(dd + 1) * f; y += dy / Math.sqrt(dd + 1) * f; }
        c.fillStyle = p.col; c.globalAlpha = .35 + .65 * e; c.fillRect(x, y, sz, sz);
      });
      c.globalAlpha = 1;
      if (vis && !still()) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf && !still()) raf = requestAnimationFrame(frame); }
    foot.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    foot.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(foot, function (v) { vis = v; foot.classList.toggle('live', v && ok && !still()); if (v) kick(); });
    return {
      scroll: function () { if (!ok) return; var r = foot.getBoundingClientRect(); k = clamp((innerHeight - r.top) / (r.height * .8), 0, 1); foot.classList.toggle('live', vis && !still()); },
      size: function () { if (ok) build(); }
    };
  })();

  /* curtain footer: fixed under the page, uncovered as the last section scrolls away */
  function curtain() { var f = $('.foot'), cw = $('[data-curtain]'), fh = f.offsetHeight; var flat = fh > innerHeight * .92; cw.classList.toggle('flat', flat); cw.style.height = flat ? '' : fh + 'px'; }

  /* ---------- go ---------- */
  texts(); motionUI(); status(); hours(); compose(); baCap(); arcLabel(true);
  setInterval(status, 60000);
  var rs = 0;
  addEventListener('resize', function () { clearTimeout(rs); rs = setTimeout(function () { cable.size(); sparks.size(); arc.kick(); curtain(); onScroll(); }, 150); });
  addEventListener('load', function () { curtain(); cable.size(); sparks.size(); onScroll(); });
  if (document.fonts) document.fonts.ready.then(function () { cable.size(); });
  curtain(); cable.size(); onScroll();
})();
