(function () {
  var root = document.documentElement, WA = '972504600930';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var io = 'IntersectionObserver' in window;
  var NS = 'http://www.w3.org/2000/svg';
  var TITLE = { he: 'לימור ירון קוסמטיקס · טיפולי פנים ועיסוי ראש יפני · שלום עליכם 3, חיפה', en: 'Limor Yaron Cosmetics · Facials & Japanese head spa · 3 Shalom Aleichem St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור לימור ירון קוסמטיקס · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Limor Yaron Cosmetics · This is not the business’s official website' };

  // ------------------------------------------------ language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'לימור ירון קוסמטיקס', 'Limor Yaron Cosmetics');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרי ללימור, 050-460-0930', 'Call Limor, 050-460-0930');
    aria('[data-t-wa]', 'וואטסאפ ללימור', 'WhatsApp Limor');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-mode]', 'סוג הבקשה', 'Request type');
    aria('[data-t-prev]', 'הטיפול הקודם', 'Previous treatment');
    aria('[data-t-next]', 'הטיפול הבא', 'Next treatment');
    aria('[data-t-dial]', 'צבע האור', 'Light colour');
    aria('[data-t-row]', 'גלריית תמונות', 'Photo gallery');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: שלום עליכם 3, חיפה' : 'Map: 3 Shalom Aleichem St, Haifa'; });
    var w = $('[data-wa-hero]'); if (w) w.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(l === 'he' ? 'היי לימור, אשמח לקבוע טיפול' : 'Hi Limor, I’d like to book a treatment');
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ly-lang', l); } catch (e) {}
    texts(l); hours(); splitTag(); voucher(false); window.__lq && window.__lq(); dialName(); fitMail(); drift();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ------------------------------------------------ motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('ly-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],.tag,[data-odo]').forEach(function (el) { el.classList.add('in'); });
    $('[data-logo]').classList.remove('assembling');
    dust.kick(); scroll(); lab.restart();
  }); });
  motionUI();

  // ------------------------------------------------ hours (Haifa time). null = closed
  var H = { 0: [9, 18.5], 1: [9, 18.5], 2: [9, 18.5], 3: [9, 18.5], 4: [9, 18.5], 5: [9, 13], 6: null };
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
      var val = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ------------------------------------------------ nav gathers into a pill
  var nav = $('[data-nav]');

  // ------------------------------------------------ reveals
  $$('.row').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', Math.min(i, 5) * 70 + 'ms'); }); });
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', i * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-odo]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ------------------------------------------------ tagline, letter by letter
  function splitTag() {
    $$('[data-split] > span[lang]').forEach(function (sp) {
      if (sp.dataset.done) return; sp.dataset.done = 1;
      var i = 0;
      var walk = function (node) {
        [].slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (w) {
              if (!w) return;
              if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
              var ws = document.createElement('span'); ws.className = 'w';
              w.split('').forEach(function (c) { var s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = c; ws.appendChild(s); });
              frag.appendChild(ws);
            });
            n.parentNode.replaceChild(frag, n);
          } else walk(n);
        });
      };
      walk(sp);
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () { $$('[data-split]').forEach(function (t) { t.classList.add('in'); }); }); });
  }

  // ------------------------------------------------ halo: the head-spa bed's golden arc with its strings
  function halo(svg, w, h, cx, cy, r, n, grad) {
    svg.innerHTML = '';
    if (grad) {
      var defs = document.createElementNS(NS, 'defs'), g = document.createElementNS(NS, 'linearGradient');
      g.id = 'goldg'; g.setAttribute('x1', '0'); g.setAttribute('x2', '1'); g.setAttribute('y1', '0'); g.setAttribute('y2', '0');
      [['0', '#9c6d26'], ['.3', '#f6d68f'], ['.55', '#c8913a'], ['.8', '#f2cf86'], ['1', '#9c6d26']].forEach(function (s) { var st = document.createElementNS(NS, 'stop'); st.setAttribute('offset', s[0]); st.setAttribute('stop-color', s[1]); g.appendChild(st); });
      defs.appendChild(g); svg.appendChild(defs);
    }
    var strings = [];
    for (var i = 0; i < n; i++) {
      var a = Math.PI + Math.PI * (i + .5) / n, l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', cx + Math.cos(a) * r); l.setAttribute('y1', cy + Math.sin(a) * r);
      l.setAttribute('x2', cx + Math.cos(a) * r * .22); l.setAttribute('y2', cy + Math.sin(a) * r * .22);
      l.setAttribute('class', 'st'); svg.appendChild(l); strings.push(l);
    }
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', 'M' + (cx - r) + ' ' + cy + ' A' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy);
    p.setAttribute('class', 'arc'); svg.appendChild(p);
    return strings;
  }
  var haloStrings = halo($('[data-halo]'), 120, 64, 60, 60, 54, 21);

  // ------------------------------------------------ stage: the photo follows the section you read
  function stageOf(stageEl, keyEls) {
    var slides = $$('.sl', stageEl), cur = null;
    function show(k) { if (k === cur) return; cur = k; slides.forEach(function (s) { s.classList.toggle('on', s.dataset.k === k); }); }
    return { pick: function () {
      var mid = innerHeight * (innerWidth < 900 ? .62 : .5), best = null;
      keyEls.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < mid) best = el; });
      show(best ? best.dataset.key : keyEls[0].dataset.key);
      return best;
    } };
  }
  var act1 = $('.act1'), act1b = $('[data-act1b]');
  var st1 = stageOf($('[data-stage]'), $$('[data-key]', act1));
  var st2 = stageOf($('[data-stage2]'), $$('[data-key]', act1b));
  var steps = $$('[data-step]');

  // ------------------------------------------------ the logo's dust: points taken from the real logo assemble it, then sparkle around it
  var dust = (function () {
    var wrap = $('[data-logo]'), img = $('.logo', wrap), cv = $('[data-dust]'), c = cv.getContext('2d');
    var pts = [], spark = [], W, Hh, ox, oy, lw, lh, t0 = 0, raf = 0, vis = true, px = -9999, py = -9999, ready = false;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1), r = cv.getBoundingClientRect(), ir = img.getBoundingClientRect();
      W = r.width; Hh = r.height; cv.width = W * dpr; cv.height = Hh * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      ox = ir.left - r.left; oy = ir.top - r.top; lw = ir.width; lh = ir.height;
    }
    function sample() {
      try {
        var s = document.createElement('canvas'), sw = 90, sh = Math.round(90 * 535 / 467), x = s.getContext('2d');
        s.width = sw; s.height = sh; x.drawImage(img, 0, 0, sw, sh);
        var d = x.getImageData(0, 0, sw, sh).data;
        for (var yy = 0; yy < sh; yy += 1) for (var xx = 0; xx < sw; xx += 1) {
          var k = (yy * sw + xx) * 4; if (d[k + 3] < 120) continue;
          var gold = d[k] > 150 && d[k + 2] < 140;
          if (!gold && Math.random() > .55) continue;
          if (gold && Math.random() > .35) continue;
          pts.push({ u: xx / sw, v: yy / sh, gold: gold, sx: Math.random(), sy: Math.random(), dl: Math.random() * .35 });
        }
        return pts.length > 50;
      } catch (e) { return false; }
    }
    for (var i = 0; i < 26; i++) spark.push({ a: Math.random() * 6.28, r: .45 + Math.random() * .5, s: 3 + Math.random() * 6, ph: Math.random() * 6.28, sp: .0003 + Math.random() * .0005 });
    function star(x, y, s, a) {
      c.globalAlpha = a; c.beginPath(); c.moveTo(x, y - s); c.quadraticCurveTo(x, y, x + s, y); c.quadraticCurveTo(x, y, x, y + s); c.quadraticCurveTo(x, y, x - s, y); c.quadraticCurveTo(x, y, x, y - s); c.fill();
    }
    function frame(t) {
      raf = 0; if (!t0) t0 = t; var e = (t - t0) / 1000;
      c.clearRect(0, 0, W, Hh);
      if (ready && e < 2.1) {
        for (var i = 0; i < pts.length; i++) {
          var p = pts[i], q = clamp((e - p.dl) / 1.25, 0, 1), k = 1 - Math.pow(1 - q, 3);
          var tx = ox + p.u * lw, ty = oy + p.v * lh, sx = p.sx * W, sy = p.sy * Hh;
          c.fillStyle = p.gold ? '#e0ae55' : '#3a2528'; c.globalAlpha = clamp(1.9 - e, 0, 1) * (.35 + .65 * k);
          c.fillRect(sx + (tx - sx) * k, sy + (ty - sy) * k, p.gold ? 2.4 : 1.4, p.gold ? 2.4 : 1.4);
        }
        if (e > 1.3) wrap.classList.remove('assembling');
      } else if (wrap.classList.contains('assembling')) wrap.classList.remove('assembling');
      // sparkles of the logo's four-point stars, drifting round the mark and stepping away from the hand
      c.fillStyle = '#b5822f';
      var cx = ox + lw * .5, cy = oy + lh * .4;
      for (var j = 0; j < spark.length; j++) {
        var s = spark[j], a = s.a + t * s.sp, rr = s.r * lw * 1.05;
        var x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * .8, dx = x - px, dy = y - py, dd = Math.sqrt(dx * dx + dy * dy);
        if (dd < 90) { x += dx / dd * (90 - dd) * .6; y += dy / dd * (90 - dd) * .6; }
        star(x, y, s.s, .25 + .55 * (.5 + .5 * Math.sin(t * .0016 + s.ph)) * Math.min(1, e / 1.4));
      }
      c.globalAlpha = 1;
      if (vis && !still()) raf = requestAnimationFrame(frame);
    }
    function kick() { if (still()) { c && c.clearRect(0, 0, W || 0, Hh || 0); return; } if (!raf && vis) raf = requestAnimationFrame(frame); }
    function start() {
      size();
      if (!still()) { ready = sample(); if (ready) wrap.classList.add('assembling'); }
      kick();
    }
    if (img.complete && img.naturalWidth) start(); else img.addEventListener('load', start);
    $('[data-hero]').addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
    $('[data-hero]').addEventListener('pointerleave', function () { px = py = -9999; });
    if (io) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; kick(); }).observe(wrap);
    // safety: never leave the logo hidden
    setTimeout(function () { wrap.classList.remove('assembling'); }, 2600);
    return { kick: kick, size: size };
  })();

  // ------------------------------------------------ glint: a soft light on the photograph that follows the hand (drifts by itself on phones)
  $$('[data-glint]').forEach(function (g) {
    var fr = g.parentNode;
    fr.parentNode.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = fr.getBoundingClientRect(); g.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100) + '%'); g.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100) + '%'); });
  });
  var hoverable = matchMedia('(hover: hover)').matches;

  // ------------------------------------------------ the light lab
  var lab = (function () {
    var sec = $('[data-lab]'), btns = $$('[data-led]'), imgs = $$('.lp'), name = $('[data-dialname]'), dial = $('[data-dial]');
    var C = { violet: '#9b6cf0', pink: '#ff4fb8', aqua: '#2ee6c4', amber: '#ffa257' };
    var N = { violet: ['סגול', 'Violet'], pink: ['ורוד', 'Pink'], aqua: ['טורקיז', 'Aqua'], amber: ['ענבר', 'Amber'] };
    var cur = 'violet', timer = 0, touched = false, vis = false;
    var strings = halo($('[data-dialarc]'), 320, 170, 160, 160, 140, 27, true);
    function place() {
      var r = dial.getBoundingClientRect(), n = btns.length, rtl = root.dir === 'rtl';
      btns.forEach(function (b, i) {
        var f = (i + .5) / n, a = Math.PI + Math.PI * (rtl ? 1 - f : f);
        b.style.left = (50 + Math.cos(a) * 140 / 320 * 100) + '%';
        b.style.top = ((160 + Math.sin(a) * 140) / 190 * 100) + '%';
      });
    }
    function set(k) {
      cur = k;
      btns.forEach(function (b) { b.setAttribute('aria-checked', b.dataset.led === k ? 'true' : 'false'); });
      imgs.forEach(function (im) { im.classList.toggle('on', im.dataset.c === k); });
      root.style.setProperty('--led', C[k]); sec.style.setProperty('--led', C[k]);
      var idx = Object.keys(C).indexOf(k);
      strings.forEach(function (s, i) { var f = i / strings.length; s.classList.toggle('lit', f >= idx / 4 - .02 && f < (idx + 1) / 4 + .02); });
      dialName();
    }
    function next() { var ks = Object.keys(C); set(ks[(ks.indexOf(cur) + 1) % ks.length]); }
    function restart() { clearInterval(timer); timer = 0; if (!touched && vis && !still()) timer = setInterval(next, 4200); }
    btns.forEach(function (b) { b.addEventListener('click', function () { touched = true; restart(); set(b.dataset.led); }); });
    dial.addEventListener('keydown', function (e) {
      var ks = Object.keys(C), i = ks.indexOf(cur), d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
      if (!d) return; e.preventDefault(); touched = true; restart(); set(ks[(i + d + ks.length) % ks.length]); $('[data-led="' + cur + '"]').focus();
    });
    if (io) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; restart(); }, { threshold: .25 }).observe(sec);
    window.__dialName = function () { name.textContent = N[cur][he() ? 0 : 1]; };
    place(); set('violet');
    return { restart: restart, place: place };
  })();
  function dialName() { window.__dialName && window.__dialName(); }

  // ------------------------------------------------ gallery: drag with the mouse, sheen under the hand
  (function () {
    var row = $('[data-row]'), down = false, sx = 0, sl = 0, moved = 0;
    row.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = row.scrollLeft; row.classList.add('drag'); });
    addEventListener('pointerup', function () { down = false; row.classList.remove('drag'); });
    row.addEventListener('pointermove', function (e) {
      if (down) { moved = e.clientX - sx; row.scrollLeft = sl - moved; }
      var f = e.target.closest && e.target.closest('figure'); if (!f) return;
      var r = f.getBoundingClientRect(); f.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%'); f.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
    row.addEventListener('click', function (e) { if (Math.abs(moved) > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
  })();

  // ------------------------------------------------ bento spotlight
  $$('[data-spot]').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--sx', (e.clientX - r.left) + 'px'); t.style.setProperty('--sy', (e.clientY - r.top) + 'px'); }); });

  // ------------------------------------------------ voucher composer
  var TR = [
    ['הד ספא – עיסוי ראש יפני', 'Head spa – Japanese head massage'],
    ['טיפול פנים מותאם', 'Tailored facial'],
    ['טיפול פנים קלאסי', 'Classic facial'],
    ['עיסוי גוף עם אבנים חמות', 'Body massage with hot stones'],
    ['מיקרונידלינג', 'Microneedling'],
    ['טיפול RF', 'RF treatment'],
    ['פוטותרפיה (LED)', 'Phototherapy (LED)'],
    ['אלקטרופורציה', 'Electroporation']
  ];
  var vi = 0, mode = 'gift';
  var vTo = $('[data-v-to]'), vFrom = $('[data-v-from]');
  function voucher(anim) {
    var l = he() ? 0 : 1, tr = $('[data-v-tr]');
    $('[data-v-title]').textContent = mode === 'gift' ? (l ? 'Gift voucher' : 'שובר מתנה') : (l ? 'An appointment' : 'תור אצל לימור');
    tr.textContent = TR[vi][l];
    if (anim && !still()) { tr.classList.remove('swap'); void tr.offsetWidth; tr.classList.add('swap'); }
    $('[data-v-l1]').textContent = mode === 'gift' ? (l ? 'For' : 'למי השובר?') : (l ? 'Your name' : 'השם שלך');
    $('[data-v-fromwrap]').hidden = mode !== 'gift';
    var to = vTo.value.trim(), fr = vFrom.value.trim(), msg;
    if (l === 0) msg = mode === 'gift'
      ? 'היי לימור, אשמח לשובר מתנה: ' + TR[vi][0] + (to ? ', עבור ' + to : '') + (fr ? '. השובר מ' + fr : '') + '.'
      : 'היי לימור, אשמח לקבוע תור ל' + TR[vi][0] + '.' + (to ? ' שמי ' + to + '.' : '');
    else msg = mode === 'gift'
      ? 'Hi Limor, I’d like a gift voucher: ' + TR[vi][1] + (to ? ', for ' + to : '') + (fr ? '. It’s from ' + fr : '') + '.'
      : 'Hi Limor, I’d like to book: ' + TR[vi][1] + '.' + (to ? ' My name is ' + to + '.' : '');
    $('[data-v-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
  }
  $('[data-v-prev]').addEventListener('click', function () { vi = (vi - 1 + TR.length) % TR.length; voucher(true); });
  $('[data-v-next]').addEventListener('click', function () { vi = (vi + 1) % TR.length; voucher(true); });
  [vTo, vFrom].forEach(function (i) { i.addEventListener('input', function () { voucher(false); }); });
  $$('[data-mode]').forEach(function (b) { b.addEventListener('click', function () {
    mode = b.dataset.mode; $$('[data-mode]').forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); voucher(true);
  }); });

  // ------------------------------------------------ the email, fitted margin to margin
  function fitMail() {
    var m = $('[data-mail]'); if (!m) return;
    var w = m.parentNode.clientWidth - parseFloat(getComputedStyle(m.parentNode).paddingLeft) - parseFloat(getComputedStyle(m.parentNode).paddingRight);
    m.style.fontSize = '100px';
    var spans = $$('span', m), widest = Math.max.apply(null, spans.map(function (s) { return s.scrollWidth || s.getBoundingClientRect().width; }));
    var r = document.createRange(); r.selectNodeContents(spans[1]); var tw = r.getBoundingClientRect().width || widest;
    m.style.fontSize = Math.min(150, Math.floor(100 * w / tw * .98)) + 'px';
  }

  // ------------------------------------------------ reviews drift with the scroll (not a loop)
  var track = $('[data-track]'), drf = $('[data-drift]');
  function drift() {
    if (!track) return;
    var r = drf.getBoundingClientRect(), p = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1);
    var span = Math.max(0, track.scrollWidth - innerWidth);
    var x = still() ? 0 : (p - .5) * Math.min(span + 120, innerWidth * .5);
    track.style.setProperty('--dx', (root.dir === 'rtl' ? x : -x) + 'px');
  }

  // ------------------------------------------------ scroll-linked scenes
  var limor = $('[data-limor]');
  var ticking = false;
  function scroll() {
    ticking = false;
    nav.classList.toggle('pill', scrollY > 40);
    st1.pick(); st2.pick();
    // ritual steps light up; the halo's strings fill with the progress
    var mid = innerHeight * (innerWidth < 900 ? .66 : .55), lit = -1;
    steps.forEach(function (s, i) { var r = s.getBoundingClientRect(); if (r.top < mid) lit = i; });
    steps.forEach(function (s, i) { s.classList.toggle('on', i === lit || (still() && false)); });
    var prog = lit < 0 ? 0 : (lit + 1) / steps.length;
    haloStrings.forEach(function (s, i) { s.classList.toggle('lit', lit < 0 ? true : i / haloStrings.length < prog); });
    // the menu sinks back as the light card rides over it
    if (!still() && innerWidth >= 900) {
      var lr = $('[data-lab]').getBoundingClientRect(), k = clamp(1 - lr.top / innerHeight, 0, 1);
      act1b.style.transform = 'scale(' + (1 - .04 * k) + ')'; act1b.style.opacity = 1 - .35 * k;
    } else { act1b.style.transform = ''; act1b.style.opacity = ''; }
    // the logo's sun opens onto Limor
    var rr = limor.getBoundingClientRect(), p = still() ? 1 : clamp((innerHeight - rr.top) / (innerHeight * .7), 0, 1);
    limor.style.setProperty('--p', p.toFixed(3));
    drift();
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(scroll); } }, { passive: true });
  var rt = 0;
  addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { dust.size(); fitMail(); lab.place(); scroll(); }, 120); });

  // ------------------------------------------------ hero mini-card: a short line from a real review, changing slowly
  var LQ = [
    ['״לימור נעימה וחיננית, המקום נגיש מאוד״', '“Limor is lovely and gracious, the place is very easy to reach”', 'תמר אליאס'],
    ['״המקום שלך הוא אי של שקט״', '“Your place is an island of quiet”', 'Hilit Sheinbox'],
    ['״עיסוי הראש היפני הוא ממש חוויה מפנקת״', '“The Japanese head massage is a real treat”', 'אורית מלכובסקי']
  ];
  var lqi = 0, lqEl = $('[data-lvq]'), lqVis = true, lqT = 0;
  function lqShow() { var q = LQ[lqi]; lqEl.innerHTML = (he() ? q[0] : q[1]) + ' <b>· ' + q[2] + '</b>'; }
  function lqNext() {
    if (still() || !lqVis || document.hidden) return;
    lqEl.classList.add('out');
    setTimeout(function () { lqi = (lqi + 1) % LQ.length; lqShow(); lqEl.classList.remove('out'); }, 450);
  }
  lqT = setInterval(lqNext, 5200);
  if (io) new IntersectionObserver(function (es) { lqVis = es[0].isIntersecting; }).observe(lqEl);
  window.__lq = lqShow;

  texts(root.lang); hours(); splitTag(); voucher(false); fitMail(); scroll(); lqShow();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitMail(); dust.size(); });
  if (!io) $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
})();
