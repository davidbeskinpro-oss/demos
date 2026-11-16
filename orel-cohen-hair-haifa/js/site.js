(function () {
  var root = document.documentElement, WA = '972549480203';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var io = 'IntersectionObserver' in window;
  var TITLE = { he: 'אוראל כהן · מעצב שיער · שדרות אח״י אילת 6, חיפה', en: 'Orel Cohen · Hairdresser · 6 Ahi Eilat Blvd, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור אוראל כהן – מעצב שיער · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Orel Cohen – Hairdresser · This is not the business’s official website' };

  // ---------------------------------------------------------------- the salon's grey brick, laid in running bond (drawn once, used as a texture)
  (function bricks() {
    try {
      var cv = document.createElement('canvas'), W = 840, Hh = 480, c = cv.getContext('2d'), bw = 104, bh = 27, m = 4;
      cv.width = W; cv.height = Hh; c.fillStyle = '#29272b'; c.fillRect(0, 0, W, Hh);
      var seed = 7, rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      for (var row = 0, y = 0; y < Hh; row++, y += bh + m) {
        for (var x = row % 2 ? -bw / 2 : 0; x < W; x += bw + m) {
          var g = 44 + Math.floor(rnd() * 11), b = g + 4;
          c.fillStyle = 'rgb(' + g + ',' + (g - 1) + ',' + b + ')'; c.fillRect(x, y, bw, bh);
          for (var k = 0; k < 26; k++) { c.fillStyle = 'rgba(' + (rnd() < .5 ? '255,255,255,.025' : '0,0,0,.07') + ')'; c.fillRect(x + rnd() * bw, y + rnd() * bh, 2 + rnd() * 9, 1 + rnd() * 3); }
          c.fillStyle = 'rgba(255,255,255,.03)'; c.fillRect(x, y, bw, 1);
        }
      }
      root.style.setProperty('--brick-img', 'url(' + cv.toDataURL('image/jpeg', .72) + ')');
    } catch (e) {}
  })();

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'אוראל כהן – מעצב שיער', 'Orel Cohen – Hairdresser');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-call]', 'התקשרו לאוראל, 054-948-0203', 'Call Orel, 054-948-0203');
    aria('[data-t-wa]', 'וואטסאפ לאוראל', 'WhatsApp Orel');
    aria('[data-t-what]', 'טיפול', 'Treatment');
    aria('[data-t-day]', 'יום', 'Day');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: שדרות אח״י אילת 6, חיפה' : 'Map: 6 Ahi Eilat Blvd, Haifa'; });
    $$('[data-tag]').forEach(function (t) { t.textContent = t.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('oc-lang', l); } catch (e) {}
    texts(l); hours(); days(); write(true); layout(); frame();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- hours and live status, Haifa time; null = closed
  var H = { 0: [9.25, 19.5], 1: [9.25, 19.5], 2: [9.25, 19.5], 3: [9.25, 20], 4: [9.25, 20], 5: [9.5, 15.5], 6: null };
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
    var html = rows.map(function (r) {
      var t = H[r[0]], ds = [], k; for (k = r[0]; k <= r[1]; k++) ds.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? (t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>') : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + ds.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    $$('[data-hours]').forEach(function (tb) { tb.innerHTML = html; });
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  var seen = function (sel, cls, opt) {
    var els = $$(sel);
    if (!io) { els.forEach(function (e) { e.classList.add(cls); }); return; }
    var ob = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add(cls); ob.unobserve(e.target); } }); }, opt || { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { ob.observe(e); });
  };
  seen('[data-reveal]', 'in'); seen('[data-cape]', 'in', { threshold: .35 }); seen('[data-tvs]', 'on', { threshold: .3 });

  // headline letters arrive out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 10 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (ch) { return '<span class="ch" style="--i:' + (i++) + '">' + ch + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // ---------------------------------------------------------------- odometers: real figures roll up
  function odo(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    var to = parseFloat(el.dataset.odo), dec = (el.dataset.odo.split('.')[1] || '').length;
    if (still()) { el.textContent = el.dataset.odo; return; }
    var t0 = performance.now();
    (function step(n) { var t = clamp((n - t0) / 1400, 0, 1), e = 1 - Math.pow(1 - t, 3); el.textContent = (to * e).toFixed(dec); if (t < 1) requestAnimationFrame(step); })(t0);
  }
  if (io) { var oo = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !e.target.closest('[data-panel]')) odo(e.target); }); }, { threshold: .6 }); $$('[data-odo]').forEach(function (e) { oo.observe(e); }); }

  // ---------------------------------------------------------------- the hero: ceiling spots, motes, labels, and the cut
  var cut = $('[data-cut]'), stage = $('[data-stage]'), top = $('[data-half="top"]'), bot = $('[data-half="bot"]');
  var shears = $('[data-shears]'), cutl = $('[data-cutline]'), copy = $('[data-hcopy]'), panel = $('[data-panel]'), tags = $('.tags');
  var CY = .58, spot = { x: .3, y: .42, tx: .3, ty: .42, last: -1e9 }, sw = 0, sh = 0;
  stage.style.setProperty('--cy', CY * 100 + '%');
  stage.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = stage.getBoundingClientRect(); spot.tx = (e.clientX - r.left) / r.width; spot.ty = (e.clientY - r.top) / r.height; spot.last = performance.now(); });
  stage.addEventListener('pointerdown', function (e) { var r = stage.getBoundingClientRect(); spot.tx = (e.clientX - r.left) / r.width; spot.ty = (e.clientY - r.top) / r.height; spot.last = performance.now(); });

  function placeTags() {
    var w = stage.clientWidth, h = Math.min(stage.clientHeight, Math.max(560, innerHeight)), s = Math.max(w / 1600, h / 900), px = phone() ? .3 : .5;
    var ox = (w - 1600 * s) * px, oy = (h - 900 * s) * .5, sr = stage.getBoundingClientRect();
    var avoid = $$('.h-title .ln > span[lang], .h-lead > span[lang], .h-act', stage).filter(function (e) { return e.getClientRects().length; }).map(function (e) { var r = e.getBoundingClientRect(); return { left: r.left - sr.left, right: r.right - sr.left, top: r.top - sr.top, bottom: r.bottom - sr.top }; });
    $$('[data-tag]').forEach(function (t) {
      var xy = t.dataset.tag.split(','), x = ox + xy[0] * s, y = oy + xy[1] * s;
      var ok = x > 80 && x < w - 80 && y > 120 && y < h * .5 && !avoid.some(function (a) { return x > a.left - 110 && x < a.right + 110 && y > a.top - 30 && y - 50 < a.bottom; });
      t.classList.toggle('on', ok); t.style.left = x + 'px'; t.style.top = y + 'px';
    });
  }
  // labels decode out of scrambled letters
  function decode() {
    var G = 'אבגדהוזחטיכלמנסעפצקרשתABCDEFGHKLMNORSTUVWXZ';
    $$('[data-tag]').forEach(function (t, k) {
      var target = t.dataset[root.lang], t0 = performance.now() + 500 + k * 260;
      if (still()) { t.textContent = target; return; }
      (function step(n) {
        var p = clamp((n - t0) / 700, 0, 1), keep = Math.floor(p * target.length);
        t.textContent = target.split('').map(function (ch, i) { return i < keep || ch === ' ' ? ch : G[Math.floor(Math.random() * G.length)]; }).join('');
        if (p < 1) requestAnimationFrame(step); else t.textContent = target;
      })(performance.now());
    });
  }

  // motes in the light of the ceiling spots
  var motes = (function () {
    var cv = $('[data-motes]'), c = cv.getContext('2d'), P = [], w = 0, h = 0;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = stage.clientWidth; h = stage.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      P = []; for (var i = 0; i < (phone() ? 40 : 80); i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 1.6, v: .08 + Math.random() * .25, ph: Math.random() * 6.28 });
    }
    function draw(T) {
      c.clearRect(0, 0, w, h); var sx = spot.x * w, sy = spot.y * h, R = Math.max(w, h) * .3;
      for (var i = 0; i < P.length; i++) {
        var p = P[i]; p.y -= p.v; p.x += Math.sin(T / 1900 + p.ph) * .18; if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; }
        var d = Math.hypot(p.x - sx, p.y - sy), a = clamp(1 - d / R, 0, 1) * .75 + .06;
        c.fillStyle = 'rgba(255,236,226,' + a.toFixed(3) + ')'; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
      }
    }
    return { size: size, draw: draw };
  })();

  function setAngle(svg, a) { var pa = $('.pa', svg), pb = $('.pb', svg); pa.style.transform = 'rotate(' + (-a) + 'deg)'; pb.style.transform = 'rotate(' + a + 'deg)'; }
  var panelShown = false, cutT = 0;
  function cutFrame() {
    var w = stage.clientWidth, h = stage.clientHeight;
    if (still()) return;
    var r = cut.getBoundingClientRect(), total = cut.offsetHeight - h, p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
    var co = 1 - smooth((p - .05) / .2);
    stage.style.setProperty('--co', co.toFixed(3)); stage.style.setProperty('--scrim', (1 - smooth((p - .45) / .2)).toFixed(3)); tags.style.opacity = co.toFixed(3);
    copy.style.visibility = co < .02 ? 'hidden' : '';
    var t = clamp((p - .1) / .38, 0, 1), shw = shears.getBoundingClientRect().width || 200;
    var x = rtl() ? lerp(w + 10, -shw - 30, t) : lerp(-shw - 10, w + 30, t);
    stage.style.setProperty('--shx', x.toFixed(1) + 'px');
    cutT = t; if (t > 0 && t < 1) { spot.tx = clamp((x + shw * (rtl() ? .25 : .75)) / w, 0, 1); spot.ty = CY; spot.last = performance.now() - 2000; }
    setAngle(shears, t <= 0 ? 20 : t >= 1 ? 0 : 17 * Math.abs(Math.cos(t * Math.PI * 7)));
    stage.style.setProperty('--from', rtl() ? 'right' : 'left');
    stage.style.setProperty('--cl', t.toFixed(4));
    stage.style.setProperty('--clo', (1 - smooth((p - .5) / .1)).toFixed(3));
    var k = smooth((p - .5) / .38), ease = 1 - Math.pow(1 - k, 2);
    top.style.transform = 'translate3d(0,' + (-ease * h * CY * 1.02).toFixed(1) + 'px,0) rotate(' + (rtl() ? 1 : -1) * ease * 1.2 + 'deg)';
    bot.style.transform = 'translate3d(0,' + (ease * h * (1 - CY) * 1.04).toFixed(1) + 'px,0) rotate(' + (rtl() ? -1 : 1) * ease * 1.2 + 'deg)';
    var po = smooth((p - .5) / .3); panel.style.setProperty('--po', po.toFixed(3));
    if (po > .5 && !panelShown) { panelShown = true; $$('[data-odo]', panel).forEach(odo); }
  }
  function resetCut() {
    [top, bot].forEach(function (e) { e.style.transform = ''; });
    copy.style.visibility = ''; tags.style.opacity = '';
    $$('[data-odo]', panel).forEach(odo);
  }

  // ---------------------------------------------------------------- mirrors: a reflection that follows the hand / the scroll
  var wall = $('[data-wall]'), gpx = 0;
  wall.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') gpx = (e.clientX / innerWidth - .5) * 60; });
  function glare() {
    var r = wall.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    var prog = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1);
    $$('.glass', wall).forEach(function (g, i) { g.style.setProperty('--gx', (lerp(-45, 45, prog) + gpx - i * 8).toFixed(1) + '%'); });
  }

  // ---------------------------------------------------------------- footer: the window glass, the glare, the lettering fitted to the width
  var win = $('[data-window]'), word = $('[data-fit]');
  function fit() { word.style.fontSize = '80px'; var avail = word.parentNode.clientWidth * .86, need = word.scrollWidth; word.style.fontSize = Math.max(22, Math.min(150, 80 * avail / need)).toFixed(1) + 'px'; }
  function windowGlare() { var r = win.getBoundingClientRect(); if (r.top > innerHeight) return; var p = clamp((innerHeight - r.top) / (innerHeight * .9), 0, 1); win.style.setProperty('--wg', lerp(-45, 45, p).toFixed(1) + '%'); }

  // ---------------------------------------------------------------- bento spotlight
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', e.clientX - r.left + 'px'); t.style.setProperty('--my', e.clientY - r.top + 'px'); }); });

  // ---------------------------------------------------------------- nav + sticky drawer
  var nav = $('[data-nav]'), bar = $('.drawer-bar');
  function chrome() { nav.classList.toggle('pill', scrollY > 40); bar.classList.toggle('away', scrollY < innerHeight * .5); }

  // ---------------------------------------------------------------- the note to Orel (live thing)
  var WHAT = { cut: ['תספורת', 'a haircut'], colour: ['צבע', 'a colour appointment'], blow: ['פן', 'a blow-dry'] };
  var what = 'cut', day = -1, typed = '', target = '', timer = 0, msg = $('[data-msg]'), nameIn = $('[data-name]'), send = $('[data-send]');
  var touched = { what: false, day: false };
  function days() {
    var box = $('[data-daypick]'), n = now(), l = he();
    if (day < 0) { var d = n.d; for (var k = 0; k < 7 && !H[d]; k++) d = (d + 1) % 7; day = d; }
    box.innerHTML = [0, 1, 2, 3, 4, 5, 6].map(function (d) {
      var name = (l ? dayHe : dayEn)[d];
      return '<button type="button" role="radio" data-day="' + d + '" aria-checked="' + (d === day) + '"' + (H[d] ? '' : ' disabled') + '>' + (H[d] ? name : name + (l ? ' · סגור' : ' · closed')) + '</button>';
    }).join('');
    $$('button', box).forEach(function (b) { b.addEventListener('click', function () { day = +b.dataset.day; touched.day = true; $$('button', box).forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write(); }); });
  }
  $$('[data-what]').forEach(function (b) { b.addEventListener('click', function () { what = b.dataset.what; touched.what = true; $$('[data-what]').forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write(); }); });
  nameIn.addEventListener('input', function () { write(); });
  function compose() {
    var nm = nameIn.value.trim(), l = he();
    if (l) return 'היי אוראל, ' + (nm ? 'כאן ' + nm + '. ' : '') + 'אשמח לקבוע תור ל' + WHAT[what][0] + ' ביום ' + dayHe[day] + '. מתי נוח לך?';
    return 'Hi Orel, ' + (nm ? 'it’s ' + nm + '. ' : '') + 'I’d like to book ' + WHAT[what][1] + ' on ' + dayEn[day] + '. When suits you?';
  }
  function write(instant) {
    target = compose(); send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    $$('.q[data-step]').forEach(function (q) { var s = +q.dataset.step; q.classList.toggle('lit', s === 0 ? touched.what : s === 1 ? touched.day : !!nameIn.value.trim()); });
    clearTimeout(timer);
    if (instant || still()) { typed = target; msg.textContent = typed; msg.classList.remove('typing'); return; }
    msg.classList.add('typing');
    (function tick() {
      if (typed === target) { msg.classList.remove('typing'); return; }
      if (target.indexOf(typed) !== 0) typed = typed.slice(0, -1); else typed = target.slice(0, typed.length + 1);
      msg.textContent = typed; timer = setTimeout(tick, target.indexOf(typed) !== 0 ? 8 : 24);
    })();
  }
  if (io) { var chatSeen = false, co2 = new IntersectionObserver(function (es) { if (es[0].isIntersecting && !chatSeen) { chatSeen = true; typed = ''; msg.textContent = ''; write(); } }, { threshold: .4 }); co2.observe(msg); }

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('oc-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-cape]').forEach(function (el) { el.classList.add('in'); }); $$('[data-tvs]').forEach(function (el) { el.classList.add('on'); });
    if (!on) resetCut();
    layout(); write(true); kick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- opening: brick wall snipped open, once per visit
  (function opening() {
    var op = $('[data-opening]'), done = false;
    try { done = sessionStorage.getItem('oc-open') === '1'; sessionStorage.setItem('oc-open', '1'); } catch (e) {}
    var isReady = false, ready = function () { if (isReady) return; isReady = true; document.body.classList.add('ready'); decode(); };
    if (still() || done || scrollY > 50) { ready(); return; }
    if (!op.animate) { ready(); return; }
    op.classList.add('go');
    var W = innerWidth, r = rtl(), sv = $('.op-shears', op), line = $('.op-line', op), anims = [], EIO = 'cubic-bezier(.65,0,.35,1)';
    var from = r ? W + 20 : -170, to = r ? -170 : W + 20, flip = r ? ' scaleX(-1)' : '';
    line.style.transformOrigin = r ? 'right center' : 'left center';
    anims.push(sv.animate([{ transform: 'translateX(' + from + 'px)' + flip }, { transform: 'translateX(' + to + 'px)' + flip }], { duration: 760, delay: 120, easing: EIO, fill: 'both' }));
    anims.push(line.animate([{ transform: 'scaleX(0)', opacity: 1 }, { transform: 'scaleX(1)', opacity: 1, offset: .8 }, { transform: 'scaleX(1)', opacity: 0 }], { duration: 900, delay: 160, easing: EIO, fill: 'both' }));
    anims.push($('.op-top', op).animate([{ transform: 'none' }, { transform: 'translateY(-101%)' }], { duration: 820, delay: 860, easing: EIO, fill: 'both' }));
    anims.push($('.op-bot', op).animate([{ transform: 'none' }, { transform: 'translateY(101%)' }], { duration: 820, delay: 860, easing: EIO, fill: 'both' }));
    var t0 = performance.now();
    (function snip(n) { var t = (n - t0 - 120) / 760; setAngle(sv, t < 0 ? 18 : t > 1 ? 0 : 16 * Math.abs(Math.cos(t * Math.PI * 5))); if (t < 1 && op.classList.contains('go')) requestAnimationFrame(snip); })(t0);
    var finish = function () { anims.forEach(function (a) { try { a.finish(); } catch (e) {} }); op.classList.remove('go'); ready(); };
    anims[3].finished.then(finish, finish);
    setTimeout(ready, 1000);
    addEventListener('pointerdown', finish, { once: true });
  })();

  // ---------------------------------------------------------------- one loop for everything that follows scroll and time
  var raf = 0, vis = true;
  if (io) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; kick(); }).observe(stage);
  function frame(T) {
    raf = 0; T = T || performance.now();
    chrome(); glare(); windowGlare();
    if (still()) return;
    cutFrame();
    if (vis) {
      if (T - spot.last > 2600) { spot.tx = .5 + Math.sin(T / 3100) * .32; spot.ty = .38 + Math.sin(T / 2300 + 1) * .14; }
      spot.x = lerp(spot.x, spot.tx, .06); spot.y = lerp(spot.y, spot.ty, .06);
      stage.style.setProperty('--sx', (spot.x * 100).toFixed(2) + '%'); stage.style.setProperty('--sy', (spot.y * 100).toFixed(2) + '%');
      stage.style.setProperty('--sr', (13 + Math.sin(T / 900) * 1.5).toFixed(2) + '%');
      motes.draw(T);
      raf = requestAnimationFrame(frame);
    }
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  addEventListener('scroll', kick, { passive: true });
  function layout() {
    stage.style.setProperty('--ox', phone() ? '30%' : '50%');
    placeTags(); motes.size(); fit(); kick();
  }
  addEventListener('resize', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

  texts(root.lang); hours(); days(); write(true); layout();
})();
