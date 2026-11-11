(function () {
  var root = document.documentElement, WA = '972526769423';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 900; };
  var hover = matchMedia('(hover: hover)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'E&S Barbershop · עיצוב שיער לגברים ולילדים · שדרות הנשיא 121, חיפה', en: 'E&S Barbershop · Men’s & kids’ hair · 121 HaNassi Blvd, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור E&S barbershop עיצוב שיער לגברים וילדים · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for E&S Barbershop, men’s & kids’ hair design · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-chairsvg]', 'כיסא ספרים הידראולי בזהב ועור שחור', 'A gold and black leather hydraulic barber chair');
    aria('[data-t-lever]', 'מצב הכיסא', 'Chair position');
    aria('[data-t-prev]', 'הקודם', 'Previous');
    aria('[data-t-next]', 'הבא', 'Next');
    aria('[data-t-wa]', 'וואטסאפ למספרה', 'WhatsApp the shop');
    aria('[data-t-call]', 'התקשרו למספרה, 052-676-9423', 'Call the shop, 052-676-9423');
    $('[data-t-map]').title = l === 'he' ? 'מפה: שדרות הנשיא 121, חיפה' : 'Map: 121 HaNassi Blvd, Haifa';
    $$('.spot').forEach(function (s) { if (s.classList.contains('on')) $('.tag', s).textContent = s.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('es148-lang', l); } catch (e) {}
    texts(l); hours(); days(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('es148-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    clearInline(); layout(); hairs.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [10, 19], 1: null, 2: [10, 19], 3: [10, 19], 4: [10, 19], 5: [9, 15], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
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
      var t = H[r[0]], ds = [], k; for (k = r[0]; k <= r[1]; k++) ds.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + ds.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letters land one by one out of a blur
  var ci = 0;
  $$('[data-split] .ln').forEach(function (ln) {
    ln.innerHTML = ln.textContent.split('').map(function (c) { return c === ' ' ? ' ' : '<span class="ch" aria-hidden="true" style="--i:' + (ci++) + '">' + c + '</span>'; }).join('');
  });
  $('[data-split]').setAttribute('aria-label', 'E&S Barbershop');

  var hero = $('[data-hero]'), stage = $('[data-stage]'), nav = $('[data-nav]'), concept = $('.concept');
  var mirror = $('[data-mirror]'), slot = $('[data-slot]'), hcopy = $('[data-hcopy]'), roomcopy = $('[data-roomcopy]'), lamps = $('.lamps');
  var tilt = $('[data-tilt]'), lampspot = $('[data-lampspot]'), spots = $$('.spot');
  var heroOn = true;
  watch(hero, function (v) { heroOn = v; hairs.kick(); });

  // ---------------------------------------------------------------- cut hair drifting down through the lamplight
  var hairs = (function () {
    var cv = $('[data-hairs]'), c = cv.getContext('2d'), P = [], w = 0, h = 0, raf = 0, last = 0, mx = -999, my = -999, T = 0;
    function mk(top) {
      return { x: Math.random() * w, y: top ? -20 - Math.random() * h * .3 : Math.random() * h, l: 6 + Math.random() * 12, a: Math.random() * 6.28,
        va: (Math.random() - .5) * 1.4, vy: 14 + Math.random() * 26, vx: 0, sw: Math.random() * 6.28, cu: (Math.random() - .5) * 8, o: .22 + Math.random() * .4 };
    }
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = stage.clientWidth; h = stage.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var want = phone() ? 46 : 90; P = []; for (var i = 0; i < want; i++) P.push(mk(false));
    }
    function frame(t) {
      raf = 0;
      if (still() || !heroOn) { c.clearRect(0, 0, w, h); last = 0; return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t; T += dt;
      c.clearRect(0, 0, w, h); c.lineCap = 'round'; c.lineWidth = 1.3;
      for (var i = 0; i < P.length; i++) {
        var p = P[i], dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 9000) { var f = (9000 - d2) / 9000 * 260, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f * dt; p.vy += dy / dd * f * dt * .4; }
        p.vx *= .96; p.vy = lerp(p.vy, 14 + (i % 7) * 4, .02);
        p.sw += dt * 1.6; p.x += (p.vx + Math.sin(p.sw) * 9) * dt; p.y += p.vy * dt; p.a += p.va * dt;
        if (p.y > h + 20 || p.x < -40 || p.x > w + 40) { P[i] = mk(true); continue; }
        var ca = Math.cos(p.a) * p.l / 2, sa = Math.sin(p.a) * p.l / 2;
        c.strokeStyle = 'rgba(236,214,168,' + p.o.toFixed(2) + ')';
        c.beginPath(); c.moveTo(p.x - ca, p.y - sa); c.quadraticCurveTo(p.x + p.cu * Math.sin(p.a), p.y - p.cu * Math.cos(p.a), p.x + ca, p.y + sa); c.stroke();
      }
      if (!hover) { lampspot.style.setProperty('--lx', (50 + Math.sin(T * .5) * 26).toFixed(1) + '%'); lampspot.style.setProperty('--ly', (34 + Math.sin(T * .37) * 22).toFixed(1) + '%'); }
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    stage.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
      if (e.pointerType === 'mouse' && !still()) {
        var m = mirror.getBoundingClientRect(), fx = (e.clientX - m.left) / m.width, fy = (e.clientY - m.top) / m.height;
        lampspot.style.setProperty('--lx', (fx * 100).toFixed(1) + '%'); lampspot.style.setProperty('--ly', (fy * 100).toFixed(1) + '%');
        tilt.style.transform = 'translate(' + ((fx - .5) * -14).toFixed(1) + 'px,' + ((fy - .5) * -14).toFixed(1) + 'px) scale(1.02)';
      }
    });
    stage.addEventListener('pointerleave', function () { mx = my = -999; tilt.style.transform = ''; });
    stage.addEventListener('pointerdown', function (e) {   // a snip: a small burst of hair from where you tap
      if (still()) return; var r = stage.getBoundingClientRect();
      for (var k = 0; k < 12; k++) { var p = mk(false); p.x = e.clientX - r.left; p.y = e.clientY - r.top; p.vx = (Math.random() - .5) * 120; p.vy = 30 + Math.random() * 40; P.push(p); }
      if (P.length > 160) P.splice(0, P.length - 160);
    });
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- labels decode out of scrambled glyphs
  var GL = 'אבגדהוזחטיכלמנסעפצקרשתABCDEFGHKLMNPRSTXZ#*';
  function decode(sp, on) {
    var tag = $('.tag', sp), txt = sp.dataset[he() ? 'he' : 'en'];
    if (on === sp.classList.contains('on')) return;
    sp.classList.toggle('on', on); clearInterval(sp._t);
    if (!on) { tag.textContent = ''; return; }
    if (still()) { tag.textContent = txt; return; }
    var n = 0;
    sp._t = setInterval(function () {
      n++; var done = Math.floor(n / 2);
      tag.textContent = txt.split('').map(function (ch, i) { return i < done || ch === ' ' ? ch : GL[Math.floor(Math.random() * GL.length)]; }).join('');
      if (done >= txt.length) { clearInterval(sp._t); tag.textContent = txt; }
    }, 30);
  }
  function placeSpots(W, Hh) {
    var bw = W * 1.06, bh = Hh * 1.06, s = Math.max(bw / 899, bh / 2040), dw = 899 * s, dh = 2040 * s, ox = -W * .03 + (bw - dw) * .5, oy = -Hh * .03 + (bh - dh) * .4;
    spots.forEach(function (sp) {
      var x = ox + dw * +sp.dataset.x, y = oy + dh * +sp.dataset.y;
      sp.style.left = x.toFixed(1) + 'px'; sp.style.top = y.toFixed(1) + 'px';
      sp.classList.toggle('flip', x > W * .55);
      sp.style.visibility = x < 14 || x > W - 14 || y < 14 || y > Hh - 14 ? 'hidden' : '';
    });
  }

  // ---------------------------------------------------------------- the mirror opens into the room
  function heroScene(vh) {
    var stR = stage.getBoundingClientRect(), d = -hero.getBoundingClientRect().top, W = stage.clientWidth;
    var a = slot.getBoundingClientRect(), x0 = a.left - stR.left, y0 = a.top - stR.top, w0 = a.width, h0 = a.height, x1, y1, w1, h1, r1;
    if (phone()) { x1 = 0; y1 = 0; w1 = W; h1 = vh; r1 = 0; }
    else { var m = clamp(W * .04, 16, 56); y1 = 88; h1 = vh - 88 - 28; w1 = Math.min(h1 * .8, W * .5); var side = Math.max(m, (W - 1700) / 2 + 60); x1 = rtl() ? side : W - w1 - side; r1 = 28; }
    var e = smooth(d / (vh * .6));
    var x = lerp(x0, x1, e), y = lerp(y0, y1, e), w = lerp(w0, w1, e), hh = lerp(h0, h1, e);
    mirror.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
    mirror.style.width = w.toFixed(1) + 'px'; mirror.style.height = hh.toFixed(1) + 'px';
    mirror.style.borderRadius = lerp(w / 2, r1, e).toFixed(1) + 'px / ' + lerp(hh / 2, r1, e).toFixed(1) + 'px';
    mirror.style.setProperty('--rim', (1 - e * (phone() ? 1 : .55)).toFixed(3));
    mirror.style.setProperty('--scrim', (phone() ? e : 0).toFixed(3));
    mirror.style.setProperty('--cap', (1 - e).toFixed(3));
    var fade = smooth(d / (vh * .32));
    hcopy.style.opacity = (1 - fade).toFixed(3); hcopy.style.translate = '0 ' + (-50 * fade).toFixed(1) + 'px';
    hcopy.style.visibility = fade >= 1 ? 'hidden' : '';
    lamps.style.opacity = (1 - e).toFixed(3);
    var rc = smooth((d - vh * .55) / (vh * .2));
    roomcopy.style.opacity = rc.toFixed(3); roomcopy.style.translate = '0 ' + ((1 - rc) * 30).toFixed(1) + 'px';
    placeSpots(w, hh);
    spots.forEach(function (sp, i) { decode(sp, d > vh * (.62 + i * .08)); });
    // the chair section rides up and lands over the room, which sinks back under it
    var ct = chair.getBoundingClientRect().top, k = clamp(1 - ct / vh, 0, 1);
    stage.style.transform = k ? 'scale(' + (1 - k * .06).toFixed(4) + ')' : '';
    stage.style.filter = k ? 'brightness(' + (1 - k * .55).toFixed(3) + ')' : '';
  }

  // ---------------------------------------------------------------- the chair: haircut, beard, kids
  var chair = $('[data-chair]'), back = $('[data-back]'), head = $('[data-head]'), lift = $('[data-lift]'), pedal = $('[data-pedal]');
  var notches = $$('.notch'), knob = $('[data-knob]'), cardsC = $$('[data-card]'), goldG = $$('[data-goldgrad]'), cur = -1, stillStage = 0;
  var STAGE_Q = [.14, .46, .94];
  function pose(rec, lf, ped) {
    back.setAttribute('transform', 'rotate(' + (rec * 34).toFixed(2) + ' 311 286)');
    head.setAttribute('transform', 'rotate(' + (rec * 10).toFixed(2) + ' 327 92)');
    lift.setAttribute('transform', 'translate(0 ' + (-lf * 88).toFixed(2) + ')');
    pedal.setAttribute('transform', 'rotate(' + ped.toFixed(2) + ' 236 474)');
  }
  function showStage(i) {
    if (i === cur) return; cur = i;
    notches.forEach(function (n, k) { n.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
    cardsC.forEach(function (c, k) { c.classList.toggle('on', k === i); });
    var n = notches[i]; if (n && knob) knob.style.top = (n.offsetTop + n.offsetHeight / 2) + 'px';
  }
  function chairScene(vh) {
    var r = chair.getBoundingClientRect(), q = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
    var rec = smooth((q - .3) / .13) * (1 - smooth((q - .6) / .07));
    var t = (q - .68) / .24, lf = 0, ped = 0;
    if (t > 0) {
      var cyc = clamp(t, 0, 1) * 3, k = Math.min(2, Math.floor(cyc)), f = t >= 1 ? 1 : cyc - k;
      lf = (k + smooth(f / .5)) / 3;
      ped = t >= 1 ? 0 : f < .5 ? 16 * smooth(f / .5) : 16 * (1 - smooth((f - .5) / .5));
    }
    pose(rec, lf, ped);
    showStage(q < .32 ? 0 : q < .66 ? 1 : 2);
    if (!hover) goldShift(q * 1.4);
  }
  function stillChair() { var i = stillStage; pose(i === 1 ? 1 : 0, i === 2 ? 1 : 0, 0); showStage(i); }
  function goldShift(v) { goldG.forEach(function (g) { g.setAttribute('gradientTransform', g.id === 'goldv' ? 'translate(0 ' + (v * .5).toFixed(3) + ')' : 'translate(' + v.toFixed(3) + ' 0)'); }); }
  chair.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; goldShift((e.clientX / innerWidth - .5) * 1.2); });
  function goStage(i) {
    i = clamp(i, 0, 2);
    if (still()) { stillStage = i; stillChair(); return; }
    var top = chair.getBoundingClientRect().top + scrollY, span = chair.offsetHeight - innerHeight;
    scrollTo({ top: top + span * STAGE_Q[i], behavior: 'smooth' });
  }
  notches.forEach(function (n, i) { n.addEventListener('click', function () { goStage(i); }); });
  $$('[data-step]').forEach(function (b) { b.addEventListener('click', function () { goStage((still() ? stillStage : cur) + (+b.dataset.step)); }); });

  // ---------------------------------------------------------------- odometer
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 200) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- the review fills in with gold as you read
  var revs = $('[data-revs]'), rsheen = $('[data-rsheen]'), fillQ = $('[data-fillq]');
  $$('[data-fill]').forEach(function (p) {
    var gold = /זהב|golden/;
    p.innerHTML = p.textContent.split(' ').map(function (w) {
      var g = gold.test(w) ? ' g' : '';
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="c' + g + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });
  revs.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = revs.getBoundingClientRect(); rsheen.style.setProperty('--sx', (e.clientX - r.left) + 'px'); rsheen.style.setProperty('--sy', (e.clientY - r.top) + 'px'); });
  function revScene(vh) {
    var ps = $$('[data-fill]:not([hidden])').filter(function (p) { return p.offsetParent; });
    var r = fillQ.getBoundingClientRect(), f = still() ? 1 : clamp((vh * .9 - r.top) / (r.height + vh * .4), 0, 1);
    ps.forEach(function (p) { var cs = $$('.c', p), n = Math.round(cs.length * f); cs.forEach(function (c, i) { c.classList.toggle('on', i < n); }); });
    if (!hover) { var rr = revs.getBoundingClientRect(), pr = clamp(-rr.top / rr.height + .5, 0, 1); rsheen.style.setProperty('--sx', (15 + pr * 70).toFixed(1) + '%'); rsheen.style.setProperty('--sy', (30 + pr * 40).toFixed(1) + '%'); }
  }

  // ---------------------------------------------------------------- book: the message engraves itself on the gold plate
  var grpEls = $$('[data-grp]'), msgEl = $('[data-msg]'), send = $('[data-send]'), shown = '', typing = 0, plateSeen = false, dayVal = 'soon';
  function days() {
    var box = $('[data-days]'), l = he(), out = '<button type="button" class="tab" aria-pressed="' + (dayVal === 'soon') + '" data-v="soon">' + (l ? 'בהקדם' : 'Soonest') + '</button>';
    for (var d = 0; d < 7; d++) if (H[d]) out += '<button type="button" class="tab" aria-pressed="' + (dayVal === String(d)) + '" data-v="' + d + '">' + (l ? dayHe[d] : dayEn[d]) + '</button>';
    box.innerHTML = out;
  }
  function pick(g) { var b = $('.tab[aria-pressed="true"]', g); return b ? b.dataset.v : null; }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.tab'); if (!b) return;
    var g = b.closest('[data-grp]');
    $$('.tab', g).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    if (g.dataset.grp === 'day') dayVal = b.dataset.v;
    g.classList.add('lit'); write();
  });
  function compose() {
    var l = he(), g = {}; grpEls.forEach(function (x) { g[x.dataset.grp] = pick(x); });
    var whoHe = { me: 'בשבילי', son: 'בשביל הבן שלי', both: 'בשבילי ובשביל הבן שלי' }, whoEn = { me: 'me', son: 'my son', both: 'me and my son' };
    var whatHe = { cut: 'לתספורת', beard: 'לזקן', cutbeard: 'לתספורת וזקן' }, whatEn = { cut: 'a haircut', beard: 'a beard trim', cutbeard: 'a haircut and beard' };
    var day = g.day || 'soon', whenHe = day === 'soon' ? 'בהקדם' : 'ביום ' + dayHe[+day], whenEn = day === 'soon' ? 'as soon as possible' : 'on ' + dayEn[+day];
    return l ? 'היי, אשמח לקבוע תור ' + whatHe[g.what || 'cut'] + ' ' + whoHe[g.who || 'me'] + ', ' + whenHe + '. מתי אפשר?'
             : 'Hi, I’d like to book ' + whatEn[g.what || 'cut'] + ' for ' + whoEn[g.who || 'me'] + ', ' + whenEn + '. What time works?';
  }
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !plateSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var from = shown, t0 = performance.now(), del = from.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? from.slice(0, from.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-plate]'), function (v) {
    if (v && !plateSeen) { plateSeen = true; grpEls[0].classList.add('lit'); if (!still()) { shown = ''; msgEl.textContent = ''; } write(); }
  }, { threshold: .5 });

  // ---------------------------------------------------------------- visit: the lamp follows the hand over the tiles
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- footer curtain + phone lever
  var levBlock = $$('.h-acts,[data-send],.t-talk');
  var foot = $('[data-foot]'), fword = $('[data-fword]'), page = $('.page'), lev = $('[data-lev]');
  foot.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') fword.style.setProperty('--fx', (e.clientX / innerWidth * 100).toFixed(1) + '%'); });
  function fitWord() { fword.style.fontSize = ''; }

  // ---------------------------------------------------------------- one scroll loop
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var vh = innerHeight, calm = still();
    nav.style.top = Math.max(10, concept.getBoundingClientRect().bottom + 6) + 'px';
    nav.classList.toggle('pill', scrollY > 30);
    if (!calm) { heroScene(vh); chairScene(vh); }
    revScene(vh);
    var pb = page.getBoundingClientRect().bottom, fp = clamp((vh - pb) / Math.max(1, foot.offsetHeight), 0, 1);
    if (!hover || !foot.matches(':hover')) fword.style.setProperty('--fx', (10 + fp * 80).toFixed(1) + '%');
    if (lev) lev.classList.toggle('away', pb < vh * .9 || levBlock.some(function (el) { var r = el.getBoundingClientRect(); return el.offsetParent && r.bottom > 0 && r.top < vh && getComputedStyle(el).visibility !== 'hidden'; }));
  }
  function clearInline() {
    [mirror, hcopy, roomcopy, lamps, stage, tilt].forEach(function (el) { el.removeAttribute('style'); });
    if (still()) { placeSpots(mirror.clientWidth, mirror.clientHeight); spots.forEach(function (sp) { decode(sp, true); }); stillStage = Math.max(0, cur); cur = -1; stillChair(); }
    else { cur = -1; }
  }
  function layout() {
    hairs.size(); fitWord();
    page.style.setProperty('--fh', foot.offsetHeight + 'px');
    if (still()) { placeSpots(mirror.clientWidth, mirror.clientHeight); spots.forEach(function (sp) { decode(sp, true); }); stillChair(); }
    tick();
  }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); days(); write(true); layout();
  if (still()) clearInline();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); hairs.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { layout(); });
})();
