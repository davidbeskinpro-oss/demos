(function () {
  var root = document.documentElement, WA = '972509907311';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 860; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'גלי טל, עורכת דין · נזקי גוף וביטוח לאומי · קריית מוצקין', en: 'Gali Tal, Attorney · Personal injury & National Insurance · Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור גלי טל, עו״ד · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Gali Tal, Attorney · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'גלי טל, עורכת דין', 'Gali Tal, Attorney');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-shelf]', 'תחומי עיסוק', 'Practice areas');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-call]', 'התקשרו לגלי, 050-990-7311', 'Call Gali, 050-990-7311');
    aria('[data-t-wa]', 'וואטסאפ לגלי', 'WhatsApp Gali');
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('gt-lang', l); } catch (e) {}
    texts(l); hours(); openVol(cur, true); write(true); dust.size(); moreUI();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('gt-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    dust.kick(); write(true); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status (Israel time). null = closed, [0,24] = all day
  var H = { 0: [0, 24], 1: [0, 24], 2: [0, 24], 3: [0, 24], 4: [0, 24], 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { x = x % 24; var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  var allDay = function (t) { return t && t[0] === 0 && t[1] === 24; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && n.h >= t[0] && n.h < t[1]) {
      open = true;
      txt = allDay(t) ? (l ? 'פתוח עכשיו' : 'Open now') : (l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]));
    } else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      var at = H[nd] && !allDay(H[nd]) ? (l ? ' ב-' : ' at ') + hhmm(H[nd][0]) : '';
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר' : 'Closed now · opens tomorrow') + at
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] : 'Closed now · opens ' + dayEn[nd]) + at;
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
      var val = !t ? (l ? 'סגור' : 'Closed') : allDay(t) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline letter by letter
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 7 : 0;
    sp.innerHTML = sp.textContent.trim().split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), arch = $('[data-arch]'), archIn = $('.arch-in', arch), sheen = $('[data-sheen]');

  // ---------------------------------------------------------------- the monogram: gathers from silver dust over the portrait, then lets go and drifts
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), img = $('[data-logosrc]');
    var P = [], w = 0, h = 0, raf = 0, vis = true, t0 = 0, mx = -999, my = -999, ok = false, rip = [];
    function sample() {
      try {
        var sc = document.createElement('canvas'), iw = 220, ih = 280; sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data, pts = [];
        for (var y = 0; y < ih * .74; y += 2) for (var x = 0; x < iw; x += 2) {   // the mark only, not the lettering below it
          var k = (y * iw + x) * 4; if (d[k + 3] > 120) pts.push([x / iw, y / (ih * .74)]);
        }
        var want = phone() ? 700 : 1300, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) {
          var q = pts[Math.floor(f)];
          P.push({ hx: q[0], hy: q[1], x: Math.random(), y: Math.random(), vx: 0, vy: 0, ph: Math.random() * 6.28, dl: Math.random() * .45, ax: Math.random(), ay: Math.random(), sp: .2 + Math.random() * .8, r: .6 + Math.random() * 1.3 });
        }
        ok = P.length > 0;
      } catch (e) { ok = false; }
    }
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function box() {
      var hr = hero.getBoundingClientRect(), ar = archIn.getBoundingClientRect();
      var bw = ar.width * .62, bh = bw * 1.05;
      return { x: ar.left - hr.left + (ar.width - bw) / 2, y: ar.top - hr.top + ar.height * .14, w: bw, h: bh };
    }
    function frame(now) {
      raf = 0; if (!ok || still()) { c.clearRect(0, 0, w, h); return; }
      var T = (now - t0) / 1000, b = box();
      // 0–1.3 s gather into the mark · 1.3–1.9 s hold · then release into drifting dust
      var rel = smooth((T - 1.9) / 1.4);
      c.clearRect(0, 0, w, h);
      rip = rip.filter(function (r) { return now - r.t < 1200; });
      for (var i = 0; i < P.length; i++) {
        var p = P[i], g = smooth((T - p.dl) / 1.1);
        var hx = b.x + p.hx * b.w + Math.sin(T * 1.4 + p.ph) * 1.2, hy = b.y + p.hy * b.h + Math.cos(T * 1.2 + p.ph) * 1.2;
        // the drifting place: slow rise, wrapping round
        var ay = ((p.ay - T * .012 * p.sp) % 1 + 1) % 1, dx = p.ax * w + Math.sin(T * .3 + p.ph) * 30, dy = ay * h;
        var tx = lerp(hx, dx, rel), ty = lerp(hy, dy, rel);
        if (g < 1) { tx = lerp(p.x * w, tx, g); ty = lerp(p.y * h, ty, g); p.px = tx; p.py = ty; }
        else {
          if (p.px === undefined) { p.px = tx; p.py = ty; }
          var ddx = p.px - mx, ddy = p.py - my, d2 = ddx * ddx + ddy * ddy;
          if (d2 < 9000) { var f = (9000 - d2) / 9000 * 2.4, dd = Math.sqrt(d2) || 1; p.vx += ddx / dd * f; p.vy += ddy / dd * f; }
          for (var k = 0; k < rip.length; k++) { var rr = (now - rip[k].t) * .5, ex = p.px - rip[k].x, ey = p.py - rip[k].y, ed = Math.sqrt(ex * ex + ey * ey) || 1; if (Math.abs(ed - rr) < 14) { p.vx += ex / ed * 1.6; p.vy += ey / ed * 1.6; } }
          if (Math.abs(ty - p.py) > h * .5) p.py = ty;        // wrapped: jump, don't streak across
          p.vx += (tx - p.px) * .05; p.vy += (ty - p.py) * .05; p.vx *= .84; p.vy *= .84; p.px += p.vx; p.py += p.vy;
        }
        var a = lerp(.9, .38, rel) * (g < 1 ? .3 + g * .7 : 1);
        c.globalAlpha = a; c.fillStyle = i % 5 ? '#d6d9df' : '#e7c9a8';
        var s = lerp(1.7, p.r * 1.6, rel); c.fillRect(p.px - s / 2, p.py - s / 2, s, s);
      }
      c.globalAlpha = 1;
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() { size(); sample(); t0 = performance.now(); kick(); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) { var r = hero.getBoundingClientRect(); rip.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }); });
    watch(hero, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) size(); } };
  })();

  // ---------------------------------------------------------------- photos that lean toward the hand; the light follows it across the portrait
  function tilt(el, k) {
    if (!fine) return;
    el.addEventListener('pointermove', function (e) {
      if (still()) return;
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = 'perspective(1000px) rotateY(' + (x * k).toFixed(2) + 'deg) rotateX(' + (-y * k).toFixed(2) + 'deg)';
      if (el === archIn) sheen.style.setProperty('--sx', (x * 140) + '%');
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  }
  tilt(archIn, 7); tilt($('[data-sign] .sign-in'), 6);

  // ---------------------------------------------------------------- the shelf
  var AREAS = [
    { he: ['נזקי גוף', 'תביעות פיצויים על פגיעה בגוף.'], en: ['Personal injury', 'Compensation claims for bodily injury.'] },
    { he: ['ביטוח לאומי', 'תביעות נכות, ועדות רפואיות וערעורים מול המוסד לביטוח לאומי.'], en: ['National Insurance', 'Disability claims, medical committees and appeals with the National Insurance Institute.'] },
    { he: ['תאונות דרכים', 'תביעות על נזקי גוף אחרי תאונת דרכים.'], en: ['Road accidents', 'Bodily-injury claims after a road accident.'] },
    { he: ['משרד הביטחון', 'הכרה וזכויות מול אגף השיקום במשרד הביטחון.'], en: ['Ministry of Defence', 'Recognition and rights with the Ministry of Defence Rehabilitation Department.'] },
    { he: ['מיצוי זכויות', 'לבדוק מה מגיע לכם, ולממש את זה.'], en: ['Your rights', 'Finding out what you are entitled to, and claiming it.'] }
  ];
  var vols = $$('[data-vol]'), leaf = $('[data-page]'), pT = $('[data-ptitle]'), pL = $('[data-pline]'), cur = 0, touched = false, decodeT = 0;
  var GLY = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'abcdefghijklmnopqrstuvwxyz' };
  function decode(el, txt) {
    clearInterval(decodeT);
    if (still()) { el.textContent = txt; return; }
    var set = GLY[he() ? 'he' : 'en'], n = 0, total = txt.length + 8;
    decodeT = setInterval(function () {
      n++;
      el.textContent = txt.split('').map(function (ch, i) { return ch === ' ' || i < n - 8 ? ch : set[Math.floor(Math.random() * set.length)]; }).join('');
      if (n >= total) { clearInterval(decodeT); el.textContent = txt; }
    }, 34);
  }
  function openVol(i, quiet) {
    var dir = i > cur ? 1 : -1; cur = i;
    vols.forEach(function (v, k) {
      v.setAttribute('aria-selected', k === i ? 'true' : 'false'); v.tabIndex = k === i ? 0 : -1;
      v.classList.toggle('lean-l', k === i + (rtl() ? 1 : -1)); v.classList.toggle('lean-r', k === i + (rtl() ? -1 : 1));
    });
    var a = AREAS[i][he() ? 'he' : 'en'];
    pL.textContent = a[1];
    if (quiet) { clearInterval(decodeT); pT.textContent = a[0]; return; }
    decode(pT, a[0]);
    leaf.style.setProperty('--ry', (dir * (rtl() ? 14 : -14)) + 'deg'); leaf.style.setProperty('--tx', (dir * (rtl() ? 10 : -10)) + 'px');
    leaf.classList.remove('flip'); void leaf.offsetWidth; leaf.classList.add('flip');
  }
  vols.forEach(function (v, k) {
    v.addEventListener('click', function () { touched = true; openVol(k); });
    v.addEventListener('keydown', function (e) {
      var fwd = rtl() ? 'ArrowLeft' : 'ArrowRight', back = rtl() ? 'ArrowRight' : 'ArrowLeft', n = null;
      if (e.key === fwd) n = (k + 1) % vols.length; else if (e.key === back) n = (k + vols.length - 1) % vols.length;
      if (n !== null) { e.preventDefault(); touched = true; openVol(n); vols[n].focus(); }
    });
  });
  $('[data-pgo]').addEventListener('click', function () {
    var box = $$('[data-topic]')[cur]; if (box && !box.checked) { box.checked = true; lightStep(0); write(); }
  });
  var areas = $('[data-areas]'), areasOn = false;
  watch(areas, function (v) { areasOn = v; });
  setInterval(function () { if (areasOn && !touched && !still() && !document.hidden) openVol((cur + 1) % vols.length); }, 3400);
  openVol(0, true);
  var shelfImg = $('[data-par]');
  if (fine) areas.addEventListener('pointermove', function (e) {
    if (still()) return; var r = areas.getBoundingClientRect();
    shelfImg.style.setProperty('--px', (((e.clientX - r.left) / r.width - .5) * -26).toFixed(1) + 'px');
    shelfImg.style.setProperty('--py', (((e.clientY - r.top) / r.height - .5) * -18).toFixed(1) + 'px');
  });

  // ---------------------------------------------------------------- write: the letter composes itself
  var topics = $$('[data-topic]'), fors = $$('[data-for]'), nameEl = $('[data-name]'), msgEl = $('[data-msg]'), send = $('[data-send]'), steps = $$('[data-step]'), nib = $('[data-nib]');
  var shown = '', typing = 0, seen = false;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function list(items, l) {
    if (items.length < 2) return items.join('');
    return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }
  function compose() {
    var l = he(), t = topics.filter(function (x) { return x.checked; }).map(function (x) { return x.dataset[l ? 'he' : 'en']; });
    var fam = fors.filter(function (x) { return x.checked; })[0].value === 'family', nm = nameEl.value.trim().replace(/\s+/g, ' ');
    if (l) return 'שלום גלי' + (nm ? ', כאן ' + nm : '') + '. אני פונה אלייך' + (fam ? ' בשם בן משפחה' : '') + (t.length ? (fam ? ',' : '') + ' בנושא ' + list(t, true) + '. אשמח לשיחה קצרה.' : ' ואשמח לשיחה קצרה.');
    var hi = 'Hi Gali' + (nm ? ', this is ' + nm : '') + '. ';
    if (!t.length) return hi + (fam ? 'I’m writing on behalf of a family member and would be glad to talk briefly.' : 'I’d like to consult with you and would be glad to talk briefly.');
    return hi + 'I’m writing' + (fam ? ' on behalf of a family member,' : '') + ' about ' + list(t, false) + '. I’d be glad to talk briefly.';
  }
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    nib.style.setProperty('--nx', ((rtl() ? -1 : 1) * Math.min(60, target.length / 3)).toFixed(0) + 'px');
    cancelAnimationFrame(typing);
    if (instant || still() || !seen) { shown = target; msgEl.textContent = target; msgEl.classList.remove('typing'); return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var from = shown, t0 = performance.now(), del = from.length - keep;
    msgEl.classList.add('typing');
    (function st(t) {
      var n = Math.floor((t - t0) / 14);
      shown = n < del ? from.slice(0, from.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st); else msgEl.classList.remove('typing');
    })(t0);
  }
  topics.forEach(function (x) { x.addEventListener('change', function () { lightStep(0); write(); }); });
  fors.forEach(function (x) { x.addEventListener('change', function () { lightStep(1); write(); }); });
  nameEl.addEventListener('input', function () { write(true); });
  send.addEventListener('pointerenter', function () { lightStep(2); });
  send.addEventListener('focus', function () { lightStep(2); });
  watch($('[data-letter]'), function (v) { if (v && !seen) { seen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .35 });

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // drifting reviews: two copies make the loop seamless
  var track = $('[data-track]');
  var rvs = $$('.rv', track);
  rvs.forEach(function (r) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'more'; b.dataset.more = '';
    b.innerHTML = '<span lang="he">לקריאת הכול</span><span lang="en">Read all</span>'; $('blockquote', r).appendChild(b);
  });
  rvs.forEach(function (r) { var k = r.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $$('button', k).forEach(function (b) { b.tabIndex = -1; }); track.appendChild(k); });
  function moreUI() {
    $$('.rv', track).forEach(function (r) {
      var vis = $$('blockquote p', r).filter(function (x) { return x.offsetParent; })[0];
      $('.more', r).hidden = r.classList.contains('open') || !vis || vis.scrollHeight <= vis.clientHeight + 2;
    });
  }
  track.addEventListener('click', function (e) { var b = e.target.closest('[data-more]'); if (!b) return; b.closest('.rv').classList.add('open'); moreUI(); });
  addEventListener('load', moreUI); setTimeout(moreUI, 300);

  // bento spotlight
  $$('.t').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked (all reversible)
  var who = $('#gali'), sign = $('[data-sign] .sign-in'), floor = $('[data-floor]'), floorIn = $('[data-floorin]'), sky = $('[data-sky]'), skyImg = $('[data-skyimg]'), foot = $('#foot'), fArc = $('.f-arc'), fPhoto = $('[data-par2]'), hGrid = $('.h-grid');
  var coins = $('.coins'), wsec = $('#write'), ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function seen01(el, a, b) { var r = el.getBoundingClientRect(), vh = innerHeight; return clamp((vh * a - r.top) / (vh * (a - b)), 0, 1); }   // 0 when its top is at a·vh, 1 at b·vh
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40); var wr = wsec.getBoundingClientRect(); coins.classList.toggle('show', scrollY > innerHeight * .75 && !(wr.top < innerHeight && wr.bottom > 0));   // the form has its own send button
    if (calm) {
      [hGrid, who, sign, floorIn, skyImg, fArc, fPhoto].forEach(function (el) { el.style.transform = ''; });
      sign.style.removeProperty('--open'); who.style.removeProperty('--rr'); floorIn.style.removeProperty('--fx'); floorIn.style.removeProperty('--fy'); skyImg.style.removeProperty('--ss'); fArc.style.removeProperty('--fa');
      return;
    }
    // hero sinks back as the walnut panel rides up over it
    var hp = clamp(scrollY / (hero.offsetHeight || 1), 0, 1);
    hGrid.style.transform = 'translate3d(0,' + (hp * 110).toFixed(1) + 'px,0) scale(' + (1 - hp * .05).toFixed(4) + ')';
    who.style.setProperty('--rr', lerp(1, .3, smooth(seen01(who, 1, .1))).toFixed(3));
    if (!fine) sheen.style.setProperty('--sx', (lerp(-80, 80, hp * 2.4) % 160).toFixed(1) + '%');
    // the sign opens out of a slit
    sign.style.setProperty('--open', (lerp(46, 0, smooth(seen01(sign, .95, .45)))).toFixed(2));
    // the marble band rises from a sliver and slides through
    var fr = floor.getBoundingClientRect(), fp = clamp((vh - fr.top) / (vh + fr.height), 0, 1);
    floorIn.style.setProperty('--fx', ((rtl() ? 1 : -1) * fp * 24).toFixed(2) + '%');
    floorIn.style.setProperty('--fy', lerp(.18, 1, smooth(fp * 2.2)).toFixed(3));
    // books photo drifts in the FAQ
    var qr = fPhoto.getBoundingClientRect(); fPhoto.style.setProperty('--py2', (((qr.top + qr.height / 2) / vh - .5) * -40).toFixed(1) + 'px');
    // the aerial photo shrinks into its tile
    skyImg.style.setProperty('--ss', lerp(1.55, 1, smooth(seen01(sky, 1, .35))).toFixed(4));
    // the footer arc rises as the curtain lifts
    var ft = foot.getBoundingClientRect(); fArc.style.setProperty('--fa', (clamp((ft.top - (vh - ft.height)) / ft.height, 0, 1) * 160).toFixed(1) + 'px');
  }
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', function () { dust.size(); tick(); });

  // go
  texts(root.lang); hours(); write(true);
  requestAnimationFrame(function () { document.body.classList.add('ready'); tick(); });
  setTimeout(function () { $$('.btn:not(.ghost)').forEach(function (b) { b.classList.add('glint'); }); }, 1800);
  $$('.btn:not(.ghost)').forEach(function (b) { b.addEventListener('pointerenter', function () { b.classList.remove('glint'); void b.offsetWidth; b.classList.add('glint'); }); });
  if (!fine && !still()) { sheen.style.transition = 'transform 1.6s cubic-bezier(.77,0,.175,1)'; setTimeout(function () { sheen.style.setProperty('--sx', '80%'); }, 1400); }
})();
