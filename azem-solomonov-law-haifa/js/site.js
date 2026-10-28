(function () {
  var root = document.documentElement, WA = '972503343349';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth <= 760; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var TITLE = { he: 'עאזם & סולומונוב · משרד עורכי דין · חדלות פירעון ומקרקעין · הבנקים 4, חיפה', en: 'Azem & Solomonov · Law Office · Insolvency & real estate · 4 HaBankim St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור עאזם & סולומונוב – משרד עורכי דין · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Azem & Solomonov Law Office · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'עאזם & סולומונוב – משרד עורכי דין', 'Azem & Solomonov Law Office');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-topic]', 'נושא', 'Subject');
    aria('[data-t-call]', 'התקשרו למשרד, 050-334-3349', 'Call the office, 050-334-3349');
    aria('[data-t-wa]', 'וואטסאפ למשרד', 'WhatsApp the office');
    aria('[data-prev]', 'השלב הקודם', 'Previous step');
    aria('[data-next]', 'השלב הבא', 'Next step');
    $$('.sn').forEach(function (b, i) { b.setAttribute('aria-label', (l === 'he' ? 'שלב ' : 'Step ') + (i + 1)); });
    $$('.rv .stars').forEach(function (s) { s.setAttribute('aria-label', l === 'he' ? '5 כוכבים' : '5 stars'); });
    var fr = $('.v-map iframe'); if (fr) fr.title = l === 'he' ? 'מפה: הבנקים 4, חיפה' : 'Map: 4 HaBankim St, Haifa';
    decode(true); callouts(); fitWord();
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('az-lang', l); } catch (e) {}
    texts(l); hours(); splitQuote(); write(true); stage.paint(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('az-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    hero.classList.add('ready');
    if (!on) clearHero();
    layout(); ring.kick(); dust.kick(); drift.kick(); write(true); stage.paint();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8.5, 18], 1: [8.5, 18], 2: [8.5, 18], 3: [8.5, 18], 4: [8.5, 18], 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function allDay(t) { return t && t[0] === 0 && t[1] >= 24; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (allDay(t)) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
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
      var val = allDay(t) ? (l ? '24 שעות' : '24 hours') : t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento,.vb').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- the headline: letters set grey, then locked in as the seam shuts
  $$('[data-seam] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 14 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c.replace('&', '&amp;') + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // a label that decodes out of scrambled letters
  var dec = $('[data-decode]'), decT = 0;
  function decode(instant) {
    var target = dec.dataset[he() ? 'he' : 'en'], pool = he() ? 'אבגדהוזחטיכלמנסעפצקרשת' : 'ABCDEFGHIJKLMNOPRSTUVWZ';
    clearInterval(decT);
    if (instant || still()) { dec.textContent = target; return; }
    var f = 0;
    decT = setInterval(function () {
      f++; var out = '';
      for (var i = 0; i < target.length; i++) out += (target[i] === ' ' || target[i] === '·' || i < f * .7 - 4) ? target[i] : pool[Math.floor(Math.random() * pool.length)];
      dec.textContent = out;
      if (f * .7 - 4 > target.length) { clearInterval(decT); dec.textContent = target; }
    }, 34);
  }

  var hero = $('[data-hero]'), nav = $('[data-nav]'), hphoto = $('[data-hphoto]'), hcopy = $('[data-hcopy]'), hzoom = $('[data-hzoom]'), beam = $('[data-beam]');

  // ---------------------------------------------------------------- the photo's callout: a point, a leader and a label that types itself
  var co = $('[data-callout]'), coT = 0, coShown = false;
  function placeCallout() {
    var W = hphoto.clientWidth, Hh = hphoto.clientHeight, iw = 1600, ih = 1200, bw = W * 1.06, bh = Hh * 1.06;
    var s = Math.max(bw / iw, bh / ih), dw = iw * s, dh = ih * s, ox = -W * .03 + (bw - dw) * .52, oy = -Hh * .03 + (bh - dh) * .52;
    var x = ox + dw * .468, y = oy + dh * .47;
    co.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    co.hidden = x < 20 || x > W - 120;
  }
  function callouts() {
    var tag = $('.cl', co), txt = co.dataset[he() ? 'he' : 'en'];
    clearInterval(coT);
    if (!coShown) { tag.textContent = ''; co.classList.remove('on'); return; }
    co.classList.add('on');
    if (still()) { tag.textContent = txt; return; }
    var i = 0; tag.textContent = '';
    coT = setInterval(function () { tag.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(coT); }, 40);
  }

  // ---------------------------------------------------------------- dust in the light: drifts up slowly, swirls away from the hand
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = true, mx = -999, my = -999, t0 = performance.now();
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hphoto.clientWidth; h = hphoto.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 60 : 110; P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 1.8, v: .08 + Math.random() * .28, ph: Math.random() * 6.28, vx: 0, vy: 0 });
    }
    function frame(t) {
      raf = 0; c.clearRect(0, 0, w, h);
      if (still()) return;
      var T = (t - t0) / 1000, bx = (parseFloat(hphoto.style.getPropertyValue('--bxp')) || .4) * w;
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        p.y -= p.v; p.x += Math.sin(T * .6 + p.ph) * .18;
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 9000) { var f = (9000 - d2) / 9000 * .9, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
        p.vx *= .92; p.vy *= .92; p.x += p.vx; p.y += p.vy;
        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
        if (p.x < -5) p.x = w + 5; else if (p.x > w + 5) p.x = -5;
        // dust shows only where the shaft of light passes (skewed band)
        var bandX = bx + (h * .5 - p.y) * .29, inB = 1 - Math.min(1, Math.abs(p.x - bandX) / (w * .2));
        if (inB <= 0) continue;
        c.globalAlpha = inB * (.35 + .35 * Math.sin(T * 2 + p.ph));
        c.fillStyle = '#fbe9c4'; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
      }
      c.globalAlpha = 1;
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { var r = hphoto.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // the shaft follows the hand on desktop; on phones it drifts across the wall by itself and with the scroll
  var bxTarget = .42, bxNow = .42, pX = 0, pY = 0, pXn = 0, pYn = 0, beamRaf = 0;
  hero.addEventListener('pointermove', function (e) { if (!fine.matches) return; bxTarget = .15 + .7 * (e.clientX / innerWidth); pX = (e.clientX / innerWidth - .5); pY = (e.clientY / innerHeight - .5); beamLoop(); });
  function beamLoop() {
    if (beamRaf || still()) return;
    beamRaf = requestAnimationFrame(function st(t) {
      beamRaf = 0;
      if (!fine.matches) bxTarget = .42 + Math.sin(t / 2600) * .22 + clamp(scrollY / innerHeight, 0, 1) * .15;
      bxNow += (bxTarget - bxNow) * .06; pXn += (pX - pXn) * .07; pYn += (pY - pYn) * .07;
      hphoto.style.setProperty('--bxp', bxNow.toFixed(4));
      beam.style.setProperty('--bx', (bxNow * 100).toFixed(2) + '%');
      hzoom.style.setProperty('--px', (-pXn * 18).toFixed(2) + 'px'); hzoom.style.setProperty('--py', (-pYn * 12).toFixed(2) + 'px');
      if (heroVis && (!fine.matches || Math.abs(bxTarget - bxNow) > .001 || Math.abs(pX - pXn) > .001)) beamLoop();
    });
  }
  var heroVis = true; watch(hero, function (v) { heroVis = v; if (v) beamLoop(); });
  function clearHero() { ['--hz', '--px', '--py'].forEach(function (k) { hzoom.style.removeProperty(k); }); ['--ct', '--cs', '--cb', '--cr'].forEach(function (k) { hphoto.style.removeProperty(k); }); hcopy.style.removeProperty('--co'); hcopy.style.removeProperty('--cy'); }

  // ---------------------------------------------------------------- Firas: a spotlight finds him, the quote fills word by word, the card leans to the hand
  var lit = $('[data-lit]'), who = $('[data-who]');
  lit.addEventListener('pointermove', function (e) { if (!fine.matches) return; var r = lit.getBoundingClientRect(); lit.style.setProperty('--lx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); lit.style.setProperty('--ly', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); lit._hand = true; });
  lit.addEventListener('pointerleave', function () { lit._hand = false; });
  var qWords = [];
  function splitQuote() {
    var sp = $('[data-fill] > span[lang="' + (he() ? 'he' : 'en') + '"]');
    if (!sp.dataset.split) { sp.innerHTML = sp.textContent.split(' ').map(function (w) { return '<span class="wd">' + w + '</span>'; }).join(' '); sp.dataset.split = '1'; }
    qWords = $$('.wd', sp);
  }
  var card = $('[data-tilt]');
  card.addEventListener('pointermove', function (e) { if (!fine.matches || still()) return; var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; card.style.setProperty('--ry', ((x - .5) * 16).toFixed(2) + 'deg'); card.style.setProperty('--rx', ((.5 - y) * 12).toFixed(2) + 'deg'); card.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); card.style.setProperty('--gy', (y * 100).toFixed(1) + '%'); });
  card.addEventListener('pointerleave', function () { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 150) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- debts: stone blocks set in order, one per step
  var stage = (function () {
    var sec = $('[data-debts]'), st = $('[data-stage]'), blks = $$('.blk', st), steps = $$('[data-step]'), count = $('[data-count]'), shaft = $('.db-shaft', st);
    var N = blks.length, cur = 0, manual = 0;
    // tumbled: x, y as fractions of the stage, rotation; widths shrink up the stack
    var WID = [.5, .44, .39, .34, .29], TUMB = [[.2, .74, -22], [.72, .66, 31], [.44, .48, -9], [.18, .3, 48], [.76, .26, -36]];
    function place(p) {
      var W = st.clientWidth, Hh = st.clientHeight, bh = Math.min(Hh * .125, W * .14), base = Hh * .93 - Hh * .045;
      blks.forEach(function (b, i) {
        var bw = W * WID[i] * (phone() ? 1.04 : 1);
        b.style.width = bw.toFixed(1) + 'px'; b.style.height = bh.toFixed(1) + 'px';
        var lab = $('b[lang="' + (he() ? 'he' : 'en') + '"]', b), n = lab ? lab.textContent.length : 6;
        if (lab) lab.style.fontSize = Math.min(bh * .4, bw * .86 / (n * (he() ? .52 : .7))).toFixed(1) + 'px';
        var t = smooth(p * N - i), tb = TUMB[i];
        var x0 = tb[0] * W - bw / 2, y0 = tb[1] * Hh - bh / 2, x1 = (W - bw) / 2, y1 = base - bh * (i + 1) - 2 * i;
        // lift, carry, set down: a gentle arc above the straight line
        var x = lerp(x0, x1, t), y = lerp(y0, y1, t) - Math.sin(t * Math.PI) * Hh * .12, r = lerp(tb[2], 0, smooth(t * 1.2));
        b.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + r.toFixed(2) + 'deg)';
        b.style.zIndex = t > .02 ? 10 + i : i;
        b.style.filter = 'brightness(' + lerp(.55, 1.02, t).toFixed(3) + ')';
      });
      shaft.style.setProperty('--sh', lerp(.32, 1, p).toFixed(3));
      var c = clamp(Math.floor(p * N - .35), -1, N - 1);
      if (p >= .999) c = N - 1;
      mark(Math.max(0, c), c >= 0);
    }
    function mark(c, any) {
      cur = c;
      steps.forEach(function (s, i) { s.classList.toggle('on', any && i < c); s.classList.toggle('cur', i === c); });
      count.textContent = he() ? 'שלב ' + (c + 1) + ' מתוך ' + N : 'Step ' + (c + 1) + ' of ' + N;
    }
    function prog() { var r = sec.getBoundingClientRect(); return clamp((-r.top) / Math.max(1, r.height - innerHeight) * 1.08, 0, 1); }
    function paint() { place(still() ? (manual + 1) / N : prog()); }
    function go(i) {
      i = clamp(i, 0, N - 1);
      if (still()) { manual = i; paint(); return; }
      var r = sec.getBoundingClientRect(), top = scrollY + r.top, span = r.height - innerHeight;
      scrollTo({ top: top + span * ((i + .9) / N) / 1.08, behavior: 'smooth' });
    }
    steps.forEach(function (s, i) { $('.sn', s).addEventListener('click', function () { go(i); }); });
    $('[data-prev]').addEventListener('click', function () { go(cur - 1); });
    $('[data-next]').addEventListener('click', function () { go(cur + 1); });
    return { paint: paint };
  })();

  // ---------------------------------------------------------------- areas: living tiles run only while seen; spotlight under the hand
  var areas = $('#areas');
  watch(areas, function (v) { areas.classList.toggle('on', v); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- the arc of their photos: turns by itself, with the scroll and with a drag
  var ring = (function () {
    var wrap = $('[data-arcwrap]'), el = $('[data-ring]');
    $$('.rc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); el.appendChild(k); });
    var cards = $$('.rc', el), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = false, last = 0;
    function R() { var cw = cards[0].offsetWidth || 190; return Math.max(cw * 1.1 / (2 * Math.tan(Math.PI / N)), phone() ? 300 : innerWidth * .4); }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (7 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var r = R(), sc = scrollY * .05 * (rtl() ? 1 : -1);
      cards.forEach(function (c, i) {
        var a = rot + sc + i * step, f = Math.cos(a * Math.PI / 180), lift = f > .95 ? (f - .95) * 20 : 0;
        c.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + (r + lift * 40).toFixed(1) + 'px) scale(' + (1 + lift * .07).toFixed(3) + ')';
        c.style.filter = 'brightness(' + (.28 + .72 * Math.pow(Math.max(f, 0), 1.6)).toFixed(3) + ')';
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && vis) { last = 0; raf = requestAnimationFrame(frame); } }
    el.style.transform = 'translateZ(-' + 0 + 'px) rotateX(-6deg)';
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .25; vel = dx * 2 * (rtl() ? 1 : -1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch($('[data-arcsec]'), function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- reviews drift past; scroll nudges them, a hand stops them
  var drift = (function () {
    var box = $('[data-drift]'), inner = $('[data-driftin]');
    $$('.rv', inner).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); inner.appendChild(k); });
    var x = 0, raf = 0, vis = false, hold = false, last = 0, lastY = scrollY;
    function frame(t) {
      raf = 0; if (still()) { inner.style.removeProperty('--dx'); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      var half = inner.scrollWidth / 2, dy = scrollY - lastY; lastY = scrollY;
      if (!hold) x += (28 * dt + Math.abs(dy) * .25);
      x = x % half;
      inner.style.setProperty('--dx', ((rtl() ? 1 : -1) * x).toFixed(1) + 'px');
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && vis) { last = 0; raf = requestAnimationFrame(frame); } }
    box.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hold = true; });
    box.addEventListener('pointerleave', function () { hold = false; });
    box.addEventListener('pointerdown', function () { hold = true; });
    addEventListener('pointerup', function () { if (!fine.matches) hold = false; });
    watch(box, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- the letter on the office's letterhead writes itself
  var topics = $$('[data-topic]'), nameIn = $('[data-name]'), msgEl = $('[data-msg]'), send = $('[data-send]'), shown = '', typing = 0, seen = false;
  topics.forEach(function (b) { b.addEventListener('click', function () {
    var on = b.getAttribute('aria-pressed') !== 'true';
    if (!on && topics.filter(function (x) { return x.getAttribute('aria-pressed') === 'true'; }).length === 1) return;   // one subject stays chosen
    b.setAttribute('aria-pressed', on ? 'true' : 'false'); write();
  }); });
  nameIn.addEventListener('input', function () { write(true); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = topics.filter(function (n) { return n.getAttribute('aria-pressed') === 'true'; }).map(function (n) { return n.dataset[l ? 'he' : 'en']; });
    var nm = nameIn.value.trim().replace(/\s+/g, ' ').slice(0, 40);
    return l ? 'שלום,' + (nm ? ' שמי ' + nm + '.' : '') + '\nאשמח לתאם פגישה במשרד בנושא ' + list(picked, true) + '.\nתודה.'
             : 'Hello,' + (nm ? ' my name is ' + nm + '.' : '') + '\nI would like to set up a meeting at the office about ' + list(picked, false) + '.\nThank you.';
  }
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
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
  watch($('[data-sheet]'), function (v) { if (v && !seen) { seen = true; shown = ''; msgEl.textContent = ''; if (!still()) write(); else write(true); } }, { threshold: .35 });

  // ---------------------------------------------------------------- footer wordmark: fit to width, letters rise as the curtain opens
  var word = $('[data-word]'), foot = $('[data-foot]'), flight = $('[data-flight]');
  function fitWord() {
    var sp = $('span[lang="' + (he() ? 'he' : 'en') + '"]', word);
    if (!sp.dataset.split) { var i = 0; sp.innerHTML = sp.textContent.split('').map(function (c) { return c === ' ' ? ' ' : '<span class="ch" style="--k:' + (i++) + '">' + c.replace('&', '&amp;') + '</span>'; }).join(''); sp.dataset.split = '1'; }
    word.style.fontSize = '100px';
    var w = sp.getBoundingClientRect().width || 1, avail = word.clientWidth;
    word.style.fontSize = Math.min(260, Math.floor(100 * avail / w * .98)) + 'px';
  }

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // hero: the camera walks into the hall, then the photo closes into a framed exhibit and the copy lifts away
    if (!calm) {
      var hr = hero.getBoundingClientRect(), hp = clamp(-hr.top / Math.max(1, hr.height - vh), 0, 1);
      hzoom.style.setProperty('--hz', lerp(1.04, 1.24, smooth(hp)).toFixed(4));
      var fr = smooth((hp - .3) / .6);
      hphoto.style.setProperty('--ct', (fr * vh * .12).toFixed(1) + 'px');
      hphoto.style.setProperty('--cb', (fr * vh * .16).toFixed(1) + 'px');
      hphoto.style.setProperty('--cs', (fr * Math.min(innerWidth * .1, 160)).toFixed(1) + 'px');
      hphoto.style.setProperty('--cr', (fr * 28).toFixed(1) + 'px');
      var cf = smooth((hp - .12) / .35);
      hcopy.style.setProperty('--co', (1 - cf).toFixed(3)); hcopy.style.setProperty('--cy', (-cf * 60).toFixed(1) + 'px');
      if (!coShown && hp > .04) { coShown = true; callouts(); } else if (coShown && hp < .01) { coShown = false; callouts(); }
      if (!fine.matches) beamLoop();
    }
    // Firas: the light moves over his portrait as you pass (phones), the quote fills word by word
    var wr = lit.getBoundingClientRect(), wp = clamp((vh - wr.top) / (vh + wr.height), 0, 1);
    if (!lit._hand) { lit.style.setProperty('--lx', (calm ? 50 : lerp(30, 62, wp)).toFixed(1) + '%'); lit.style.setProperty('--ly', (calm ? 30 : lerp(12, 40, wp)).toFixed(1) + '%'); }
    var qr = $('[data-fill]').getBoundingClientRect(), qp = calm ? 1 : clamp((vh * .9 - qr.top) / (vh * .55), 0, 1), qn = Math.round(qp * qWords.length);
    qWords.forEach(function (w, i) { w.classList.toggle('on', i < qn); });
    stage.paint();
    // the arc's horizon and the footer's light rise as you arrive
    var gl = $('[data-glow]'), gr = gl.parentNode.getBoundingClientRect(), gp = calm ? 1 : smooth((vh - gr.top) / (gr.height * .9));
    gl.style.setProperty('--rise', ((1 - gp) * 120).toFixed(1) + 'px');
    var fb = foot.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fb.top) / (fb.height * .8));
    flight.style.setProperty('--rise', ((1 - fp) * 120).toFixed(1) + 'px');
    $$('.ch', word).forEach(function (c, i) { var k = calm ? 0 : 1 - smooth(fp * 1.6 - i * .045); c.style.setProperty('--fr', k.toFixed(3)); });
  }

  function layout() { dust.size(); placeCallout(); fitWord(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  // ---------------------------------------------------------------- opening: their photos are dealt, the court photo becomes the hero
  var deal = $('[data-deal]');
  function opening(done) {
    var played = false; try { played = sessionStorage.getItem('az-dealt') === '1'; } catch (e) {}
    if (still() || played || scrollY > 10 || window.__noDeal) { done(); return; }
    try { sessionStorage.setItem('az-dealt', '1'); } catch (e) {}
    deal.classList.add('go');
    var last = $('.dc-last', deal), fin = false;
    function finish() {
      if (fin) return; fin = true;
      last.style.animation = 'none'; last.style.opacity = '1'; last.style.transform = 'none'; void last.offsetWidth;
      var r = last.getBoundingClientRect(), sx = innerWidth / r.width, sy = innerHeight / r.height, s = Math.max(sx, sy);
      last.style.transition = 'transform .6s cubic-bezier(.65,0,.35,1), border-radius .6s';
      last.style.transform = 'translate(' + (innerWidth / 2 - (r.left + r.width / 2)).toFixed(1) + 'px,' + (innerHeight / 2 - (r.top + r.height / 2)).toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
      last.style.borderRadius = '0';
      setTimeout(function () { deal.classList.add('out'); done(); }, 520);
      setTimeout(function () { deal.remove(); }, 1200);
    }
    deal.addEventListener('click', finish);
    setTimeout(finish, 1050);
  }

  texts(root.lang); hours(); splitQuote(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; opening(function () { requestAnimationFrame(function () { hero.classList.add('ready'); decode(); beamLoop(); dust.kick(); }); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 900);
  addEventListener('load', function () { layout(); });
})();
