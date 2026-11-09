(function () {
  var root = document.documentElement, WA = '972522634633';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var TITLE = { he: 'אייזיק · עבודות צבע וחשמל · מנחם בגין 12, קריית מוצקין', en: 'Isaac · Painting & electrical works · 12 Menachem Begin St, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור אייזיק עבודות צבע וחשמל · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Isaac Painting & Electrical Works · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('[data-alt-he]').forEach(function (i) { var t = i.dataset[l === 'he' ? 'altHe' : 'altEn']; if (i.tagName === 'IMG') i.alt = t; else i.setAttribute('aria-label', t); });
    $$('[data-ph-he]').forEach(function (i) { i.placeholder = i.dataset[l === 'he' ? 'phHe' : 'phEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'אייזיק עבודות צבע וחשמל', 'Isaac Painting & Electrical Works');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-fan]', 'תמונות', 'Photos');
    aria('[data-t-mix]', 'גוונים', 'Colours');
    aria('[data-t-gang]', 'מה צריך', 'What you need');
    aria('[data-t-call]', 'להתקשר לאייזיק', 'Call Isaac');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: מנחם בגין 12, קריית מוצקין' : 'Map: 12 Menachem Begin St, Kiryat Motzkin'; });
    var on = $('.sw[aria-pressed="true"]'); if (on) $('[data-mixname]').textContent = on.dataset[l];
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('iz-lang', l); } catch (e) {}
    texts(l); hours(); write(true); slats(); frame();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch (a rocker on a wall plate)
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('iz-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    $('[data-slats]').classList.remove('pre');
    if (on) startLoop(); frame(); write(true); drops.kick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [7, 23], 1: [7, 23], 2: [7, 23], 3: [7, 23], 4: [7, 23], 5: [7, 16], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { if (x === 24) return '24:00'; var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  var allDay = [0, 1, 2, 3, 4, 5, 6].every(function (d) { return H[d] && H[d][0] === 0 && H[d][1] === 24; });
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (allDay) { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
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
      var val = t ? (t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>') : (l ? 'סגור' : 'Closed');
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

  // ---------------------------------------------------------------- headline, letter by letter
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').classList.contains('big') ? 0 : 7;
    [].slice.call(sp.childNodes).forEach(function (node) {
      var txt = node.textContent, wrap = node.nodeType === 1 ? node : null;
      var html = txt.split(' ').map(function (w) { return w ? '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>' : ''; }).join(' ');
      if (wrap) wrap.innerHTML = html; else { var s = document.createElement('span'); s.innerHTML = html; sp.replaceChild(s, node); }
    });
  });
  var fw = $('[data-fword]');
  $$('span[lang]', fw).forEach(function (sp) { sp.innerHTML = sp.textContent.split('').map(function (c, k) { return '<span class="ch" data-k="' + k + '">' + c + '</span>'; }).join(''); });

  // ---------------------------------------------------------------- hero: a raking light on his plaster
  var hero = $('[data-hero]'), nav = $('[data-nav]'), light = { x: .7, y: .35, tx: .7, ty: .35, user: 0 };
  if (fine) hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); light.tx = (e.clientX - r.left) / r.width; light.ty = (e.clientY - r.top) / r.height; light.user = performance.now(); });

  // ---------------------------------------------------------------- the fan deck: opens from its rivet, turns with the scroll and a drag
  var fan = $('[data-fan]'), blades = $$('.blade', fan), drag = { on: false, x0: 0, off: 0, v: 0 }, open = 0;
  fan.addEventListener('pointerdown', function (e) { drag.on = true; drag.x0 = e.clientX; drag.base = drag.off; fan.classList.add('drag'); try { fan.setPointerCapture(e.pointerId); } catch (x) {} });
  fan.addEventListener('pointermove', function (e) { if (!drag.on) return; drag.off = clamp(drag.base + (e.clientX - drag.x0) / 9, -40, 40); if (still()) placeFan(1, 0); });
  var up = function () { drag.on = false; fan.classList.remove('drag'); };
  fan.addEventListener('pointerup', up); fan.addEventListener('pointercancel', up);
  function placeFan(op, sc) {
    var n = blades.length, spread = (phone() ? 13 : innerWidth >= 1000 ? 10 : 15) * op, mid = (n - 1) / 2;
    var turn = drag.off + sc * 22 * (he() ? 1 : -1);
    blades.forEach(function (b, i) {
      var a = (i - mid) * spread + turn * op;
      b.style.setProperty('--a', a.toFixed(2) + 'deg');
      var front = Math.abs(a) < spread / 2 + .1;
      b.style.setProperty('--lift', (front ? -18 : 0) + 'px');
      b.style.zIndex = 100 - Math.round(Math.abs(a));
      b.classList.toggle('dim', !front && Math.abs(a) > spread * 2.2);
    });
  }

  // ---------------------------------------------------------------- the wood wall arrives slat by slat out of its own photo
  var slatBox = $('[data-slatstrips]'), slatFig = $('[data-slats]');
  function slats() {
    var w = slatBox.clientWidth, h = slatBox.clientHeight || 420, n = phone() ? 9 : 12, W = Math.max(w, h * 536 / 1500);
    var ox = (W - w) / 2, html = '';
    for (var i = 0; i < n; i++) html += '<i class="sl" style="--W:' + W.toFixed(0) + 'px;--x:' + (-(ox + i * w / n)).toFixed(1) + 'px;--dir:' + (i % 2 ? -1 : 1) + ';--sd:' + (i * 55) + 'ms"></i>';
    slatBox.innerHTML = html;
  }
  slats();
  if (!still()) slatFig.classList.add('pre');
  if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { slatFig.classList.remove('pre'); ob.disconnect(); } }, { threshold: .25 }).observe(slatFig); else slatFig.classList.remove('pre');

  // ---------------------------------------------------------------- photos that lean toward the hand, with a moving glint
  function tilt(el, inner) {
    if (!fine) return;
    el.addEventListener('pointermove', function (e) {
      if (still()) return;
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      inner.style.setProperty('--tx', ((x - .5) * 8).toFixed(2) + 'deg'); inner.style.setProperty('--ty', ((.5 - y) * 8).toFixed(2) + 'deg');
      inner.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); inner.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      inner.style.setProperty('--px', ((x - .5) * -18).toFixed(1) + 'px'); inner.style.setProperty('--py', ((y - .5) * -18).toFixed(1) + 'px');
    });
    el.addEventListener('pointerleave', function () { ['--tx', '--ty', '--px', '--py'].forEach(function (p) { inner.style.removeProperty(p); }); });
  }
  tilt($('[data-plaster]'), $('.pp-in'));
  tilt($('[data-tilt]'), $('[data-tilt]'));

  // ---------------------------------------------------------------- colour on the wall (the live sampler)
  var mixWall = $('[data-mixwall]');
  $$('.sw').forEach(function (b) { b.addEventListener('click', function () {
    $$('.sw').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); x.classList.toggle('on', x === b); });
    mixWall.style.setProperty('--mc', b.dataset.c); $('[data-mixname]').textContent = b.dataset[he() ? 'he' : 'en'];
    if (!still()) { mixWall.classList.remove('swipe'); void mixWall.offsetWidth; mixWall.classList.add('swipe'); }
  }); });

  // ---------------------------------------------------------------- the board: breakers flip on as the current arrives; tap one to read it
  var brks = $$('.brk'), power = $('[data-power]'), board = $('[data-board]');
  brks.forEach(function (b) { b.addEventListener('click', function () {
    var ex = b.getAttribute('aria-expanded') === 'true';
    brks.forEach(function (x) { x.setAttribute('aria-expanded', 'false'); });
    b.setAttribute('aria-expanded', ex ? 'false' : 'true'); b.classList.add('on');
  }); });
  var GL = 'אבגדהוזחטיכלמנסעפצקרשתABCDEFGHKLMNPRSTVXZ0123456789';
  function decode(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    var sp = $('span[lang="' + root.lang + '"]', el); if (!sp || still()) return;
    var final = sp.textContent, t0 = performance.now();
    (function step(t) {
      var k = clamp((t - t0) / 600, 0, 1), cut = Math.floor(final.length * k);
      sp.textContent = final.slice(0, cut) + final.slice(cut).replace(/\S/g, function () { return GL[Math.random() * GL.length | 0]; });
      if (k < 1) requestAnimationFrame(step); else sp.textContent = final;
    })(t0);
  }

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><b data-n="' + ch + '"></b></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d dr" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.dr', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { setTimeout(function () { roll(o, true); }, 60); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- composer: the message writes itself on the tape
  var kinds = { paint: true, power: false }, msgEl = $('[data-msg]'), send = $('[data-send]'), typed = '', target = '', typer = 0;
  $$('.g-r').forEach(function (b) { b.addEventListener('click', function () {
    var k = b.dataset.kind; kinds[k] = !kinds[k];
    if (!kinds.paint && !kinds.power) kinds[k === 'paint' ? 'power' : 'paint'] = true;
    $$('.g-r').forEach(function (x) { x.setAttribute('aria-pressed', kinds[x.dataset.kind] ? 'true' : 'false'); });
    $$('[data-jobs]').forEach(function (j) { j.hidden = !kinds[j.dataset.jobs]; });
    write();
  }); });
  $$('.job').forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); write(); }); });
  $$('[data-where],[data-note]').forEach(function (i) { i.addEventListener('input', function () { write(true); }); });
  function compose() {
    var l = he() ? 'he' : 'en', jobs = $$('.job[aria-pressed="true"]').filter(function (b) { return !b.closest('[data-jobs]').hidden; }).map(function (b) { return b.dataset[l]; });
    var where = $('[data-where]').value.trim(), note = $('[data-note]').value.trim();
    var what = jobs.length ? jobs.join(', ') : (l === 'he' ? (kinds.paint && kinds.power ? 'עבודת צבע וחשמל' : kinds.paint ? 'עבודת צבע' : 'עבודת חשמל') : (kinds.paint && kinds.power ? 'painting and electrical work' : kinds.paint ? 'painting work' : 'electrical work'));
    var s = l === 'he' ? 'שלום אייזיק, הגעתי דרך האתר.\nאשמח לעזרה ב: ' + what + '.' : 'Hi Isaac, I found you through your website.\nI’d like help with: ' + what + '.';
    if (where) s += l === 'he' ? '\nהאזור: ' + where + '.' : '\nArea: ' + where + '.';
    if (note) s += '\n' + note;
    s += l === 'he' ? '\nתודה!' : '\nThanks!';
    var steps = $$('.m-steps li'); steps[0].classList.add('lit'); steps[1].classList.toggle('lit', jobs.length > 0 || !!where); steps[2].classList.toggle('lit', jobs.length > 0 && !!where);
    return s;
  }
  function write(now) {
    target = compose(); send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    if (now || still()) { typed = target; msgEl.textContent = typed; return; }
    var same = 0; while (same < typed.length && typed[same] === target[same]) same++;
    typed = typed.slice(0, same); cancelAnimationFrame(typer);
    (function step() { if (typed.length < target.length) { typed = target.slice(0, typed.length + 2); msgEl.textContent = typed; typer = requestAnimationFrame(step); } })();
  }

  // ---------------------------------------------------------------- the footer: the real logo forms out of drops of its own orange
  var drops = (function () {
    var cv = $('[data-drops]'), img = $('[data-dropsrc]'), ctx = cv.getContext('2d'), pts = [], ready = false, dpr = Math.min(devicePixelRatio || 1, 2), logo = $('[data-flogo]');
    function build() {
      if (!img.naturalWidth) return;
      var c = document.createElement('canvas'), w = 60, h = Math.round(60 * img.naturalHeight / img.naturalWidth); c.width = w; c.height = h;
      var x = c.getContext('2d'); x.drawImage(img, 0, 0, w, h); var d = x.getImageData(0, 0, w, h).data; pts = [];
      for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) if (d[(j * w + i) * 4 + 3] > 140) pts.push({ u: i / w, v: j / h, sx: Math.random(), sy: Math.random() * -.6, r: .7 + Math.random() * .6 });
      ready = true; size();
    }
    function size() { cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; }
    function draw(p) {
      if (!ready) return; ctx.clearRect(0, 0, cv.width, cv.height);
      var lr = logo.getBoundingClientRect(), cr = cv.getBoundingClientRect(), W = lr.width, Hh = lr.height;
      var e = smooth(p), dot = Math.max(2, W / 60 * .9) * dpr;
      ctx.fillStyle = '#fe8614';
      pts.forEach(function (q) {
        var tx = (lr.left - cr.left + q.u * W) * dpr, ty = (lr.top - cr.top + q.v * Hh) * dpr;
        var sx = q.sx * cv.width, sy = q.sy * cv.height;
        var x = sx + (tx - sx) * e, y = sy + (ty - sy) * Math.min(1, e * 1.15);
        ctx.globalAlpha = .35 + .65 * e; ctx.beginPath(); ctx.ellipse(x, y, dot * q.r * .5, dot * q.r * (.5 + (1 - e) * .9), 0, 0, 6.283); ctx.fill();
      });
      logo.classList.toggle('show', p > .985); cv.style.opacity = p > .985 ? 0 : 1;
    }
    if (img.complete) build(); else img.addEventListener('load', build);
    addEventListener('resize', size);
    return { draw: draw, kick: function () { if (still()) { ctx.clearRect(0, 0, cv.width, cv.height); logo.classList.add('show'); } } };
  })();

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var coat = $('[data-coat]'), wet = $('[data-wet]'), roller = $('[data-roller]'), foot = $('[data-foot]'), dock = $('[data-dock]'), rvImg = $('.rv-wall img');
  var decoded = false, running = false, mainEl = $('#main');
  function frame(t) {
    var vh = innerHeight, y = scrollY, s = still();
    nav.classList.toggle('pill', y > 40);
    // hero light: follows the hand; on its own it sweeps slowly across the wall
    if (!s) {
      var idle = !fine || performance.now() - light.user > 2600, tt = (t || 0) / 1000;
      if (idle) { light.tx = .5 + Math.sin(tt * .35) * .32; light.ty = .38 + Math.sin(tt * .53) * .16; }
      light.x += (light.tx - light.x) * .08; light.y += (light.ty - light.y) * .08;
    } else { light.x = .82; light.y = .78; }
    hero.style.setProperty('--lx', (light.x * 100).toFixed(2) + '%'); hero.style.setProperty('--ly', (light.y * 100).toFixed(2) + '%');
    // fan
    var hr = hero.getBoundingClientRect(), sc = clamp(-hr.top / (hr.height || 1), 0, 1);
    if (!s) { open += ((t ? 1 : 1) - open) * .06; } else open = 1;
    placeFan(s ? 1 : Math.max(.08, open), s ? 0 : sc);
    // seam 1: the roller crosses as the band passes the middle of the screen
    var cr = coat.getBoundingClientRect(), p = s ? 1 : smooth((vh - cr.top) / (vh * .55 + cr.height * .5) - .15);
    wet.style.setProperty('--p', (1 - p).toFixed(4)); wet.style.setProperty('--tp', (s ? 1 : smooth((p - .9) / .1)).toFixed(3));
    if (!s) {
      var rw = roller.getBoundingClientRect().width, W = coat.clientWidth, edge = he() ? W * (1 - p) : W * p;
      var rx = he() ? edge - rw * .18 : edge - rw * .42;
      roller.style.setProperty('--rx', rx.toFixed(1) + 'px'); roller.style.opacity = p > .995 || p < .005 ? (p > .995 ? 0 : 1) : 1;
      roller.style.transition = 'opacity .5s';
    }
    // seam 2: the lights come on as the power section arrives
    var pr = power.getBoundingClientRect(), lit = s ? 1 : smooth((vh - pr.top) / (vh * .7) - .15);
    power.style.setProperty('--lit', lit.toFixed(3));
    var br = board.getBoundingClientRect(), cur = s ? 1 : smooth((vh * .85 - br.top) / (br.height * .9));
    board.style.setProperty('--cur', cur.toFixed(3));
    brks.forEach(function (b, i) { var on = s || cur > (i + .6) / brks.length; if (on && !b.classList.contains('on')) { b.classList.add('on'); decode($('[data-decode]', b)); } if (!s && cur < (i + .2) / brks.length && b.getAttribute('aria-expanded') !== 'true') b.classList.remove('on'); });
    if (s && !decoded) { decoded = true; }
    // reviews wall drifts
    if (!s) { var rr = rvImg.parentNode.getBoundingClientRect(); rvImg.parentNode.parentNode && rvImg.style.setProperty('--rvy', ((rr.top + rr.height / 2 - vh / 2) * -.08).toFixed(1) + 'px'); }
    // footer curtain: drops gather into the logo, the name rises letter by letter
    var mb = mainEl.getBoundingClientRect().bottom, fp = s ? 1 : clamp((vh - mb) / (vh * .85), 0, 1);
    if (!s) drops.draw(fp);
    $$('.ch', fw).forEach(function (c) { var k = +c.dataset.k; c.style.setProperty('--fw', (s ? 1 : smooth(fp * 2.2 - .9 - k * .12)).toFixed(3)); });
    // the dock steps aside on the footer
    dock.classList.toggle('away', mb < vh * .55);
  }
  function loop(t) { frame(t); if (!still()) requestAnimationFrame(loop); else running = false; }
  function startLoop() { if (!running) { running = true; requestAnimationFrame(loop); } }
  addEventListener('scroll', function () { if (still()) frame(); }, { passive: true });
  addEventListener('resize', function () { slats(); frame(); });

  // ---------------------------------------------------------------- the bento spotlight follows the hand
  if (fine) $$('[data-spot]').forEach(function (el) { el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); el.style.setProperty('--sx', (e.clientX - r.left) + 'px'); el.style.setProperty('--sy', (e.clientY - r.top) + 'px'); }); });

  texts(root.lang); hours(); write(true); frame(0);
  if (still()) { drops.kick(); $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); }); } else startLoop();
})();
