(function () {
  var root = document.documentElement, WA = '972528707935';
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
  var TITLE = { he: 'אילן מלכה · מספרה ביתית · זאב שוהם 43, חיפה', en: 'Ilan Malka · Home hair salon · 43 Ze’ev Shoham St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור מספרה ביתית אילן מלכה · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Ilan Malka Home Hair Salon · This is not the business’s official website' };

  // ------------------------------------------------ language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'אילן מלכה', 'Ilan Malka');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-call]', 'התקשרו לאילן, 052-870-7935', 'Call Ilan, 052-870-7935');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: זאב שוהם 43, חיפה' : 'Map: 43 Ze’ev Shoham St, Haifa'; });
    $$('[data-tag]').forEach(function (t) { $('b', t).textContent = t.dataset[l]; t.setAttribute('aria-label', t.dataset[l]); });
    $$('[data-decode]').forEach(function (h) { h.textContent = h.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('im-lang', l); } catch (e) {}
    texts(l); hours(); compose(true); splitAll(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ------------------------------------------------ motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var wasStill = still();
    root.classList.toggle('still', !wasStill);
    try { localStorage.setItem('im-motion', wasStill ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    fan.deal(true); clearRoom(); layout(); motes.kick(); compose(true);
  }); });
  motionUI();

  // ------------------------------------------------ hours, Haifa time. null = closed
  var H = { 0: [9, 21 + 11 / 60], 1: [9, 21], 2: [9, 21 + 11 / 60], 3: [9, 21 + 11 / 60], 4: [9, 21 + 11 / 60], 5: [9, 20], 6: [9, 20] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x + 1e-6), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 + (+o.second) / 3600, s: +o.second };
  }
  function is247() { for (var d = 0; d < 7; d++) if (!H[d] || H[d][0] !== 0 || H[d][1] !== 24) return false; return true; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (is247()) { open = true; txt = l ? 'פתוח 24/7' : 'Open 24/7'; }
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
    var td = $('[data-today]');
    if (td) td.innerHTML = t ? (l ? 'היום, יום ' + dayHe[n.d] + ': ' : 'Today, ' + dayEn[n.d] + ': ') + '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'היום סגור' : 'Closed today');
    clock.arc(t);
  }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }

  // ------------------------------------------------ the wall clock: live hands, today's hours as an arc on a 24-hour ring
  var clock = (function () {
    var svg = $('[data-clock]'), NS = 'http://www.w3.org/2000/svg', g = $('[data-ticks]', svg);
    for (var i = 0; i < 12; i++) {
      var a = i * Math.PI / 6, ln = document.createElementNS(NS, 'line'), big = i % 3 === 0;
      ln.setAttribute('x1', 100 + Math.sin(a) * (big ? 68 : 74)); ln.setAttribute('y1', 100 - Math.cos(a) * (big ? 68 : 74));
      ln.setAttribute('x2', 100 + Math.sin(a) * 80); ln.setAttribute('y2', 100 - Math.cos(a) * 80);
      g.appendChild(ln);
    }
    var hh = $('[data-hh]', svg), mh = $('[data-mh]', svg), sh = $('[data-sh]', svg), arcEl = $('[data-openarc]', svg);
    function pt(h) { var a = h / 24 * Math.PI * 2; return [100 + Math.sin(a) * 92, 100 - Math.cos(a) * 92]; }
    return {
      arc: function (t) {
        if (!t) { arcEl.setAttribute('d', ''); return; }
        var p0 = pt(t[0]), p1 = pt(t[1]), large = (t[1] - t[0]) > 12 ? 1 : 0;
        arcEl.setAttribute('d', 'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) + ' A92 92 0 ' + large + ' 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2));
      },
      tick: function () {
        var n = now(), h = n.h % 12, m = (n.h * 60) % 60;
        hh.style.transform = 'rotate(' + (h * 30) + 'deg)';
        mh.style.transform = 'rotate(' + (m * 6) + 'deg)';
        sh.style.transform = 'rotate(' + (n.s * 6) + 'deg)';
      }
    };
  })();
  setInterval(function () { clock.tick(); if (new Date().getSeconds() === 0) status(); }, 1000);

  // ------------------------------------------------ split text into letters (headline seam + footer rise)
  function splitAll() {
    $$('[data-split] > span[lang], [data-footname] > span[lang]').forEach(function (sp) {
      if (!sp.dataset.raw) sp.dataset.raw = sp.textContent;
      var i = 0;
      sp.innerHTML = sp.dataset.raw.split(' ').map(function (w) {
        return '<span class="w" style="display:inline-block">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  }
  splitAll();

  // ------------------------------------------------ entrances + label decode
  var GLY = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHJKLMNPRSTUVWXYZ' };
  function decode(h) {
    var fin = h.dataset[root.lang], pool = GLY[root.lang], t0 = performance.now();
    if (still()) { h.textContent = fin; return; }
    (function f(t) {
      var k = (t - t0) / 650, out = '';
      for (var i = 0; i < fin.length; i++) out += (fin[i] === ' ' || i < k * fin.length) ? fin[i] : pool[(Math.random() * pool.length) | 0];
      h.textContent = out; if (k < 1) requestAnimationFrame(f); else h.textContent = fin;
    })(t0);
  }
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); });
  $$('.cbento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', i * 70 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in'); rio.unobserve(e.target);
      var d = $('[data-decode]', e.target); if (d) setTimeout(function () { decode(d); }, 250);
      $$('[data-odo]', e.target).forEach(odo);
    });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ------------------------------------------------ odometer figures (only real numbers: rating and review count)
  function odo(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    var to = parseFloat(el.dataset.odo), dec = (el.dataset.odo.split('.')[1] || '').length, t0 = performance.now();
    if (still()) return;
    (function f(t) { var k = smooth((t - t0) / 1300); el.textContent = (to * k).toFixed(dec); if (k < 1) requestAnimationFrame(f); else el.textContent = el.dataset.odo; })(t0);
  }
  if (io) { var oio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { odo(e.target); oio.unobserve(e.target); } }); }); $$('[data-odo]').forEach(function (el) { oio.observe(el); }); }

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ------------------------------------------------ the fan of real photos: dealt from the counter, opens on the scissors pivot
  var fan = (function () {
    var box = $('[data-fan]'), stage = $('[data-fanstage]'), cards = $$('.fc', box);
    var A = [-50, -32, -15, 17, 34, 0];
    cards.forEach(function (c, i) {
      c.style.setProperty('--i', i); c.style.setProperty('--a', A[i] + 'deg');
      c.style.zIndex = i === cards.length - 1 ? 8 : 5 - Math.round(Math.abs(A[i]) / 12);
      c.addEventListener('click', function () { var on = !c.classList.contains('up'); cards.forEach(function (o) { o.classList.remove('up'); }); if (on) c.classList.add('up'); });
    });
    function deal(now) {
      if (now || still()) { cards.forEach(function (c) { c.style.transitionDelay = ''; }); box.classList.add('dealt'); return; }
      cards.forEach(function (c, i) { c.style.transitionDelay = (200 + i * 110) + 'ms'; });
      requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.add('dealt'); }); });
      setTimeout(function () { cards.forEach(function (c) { c.style.transitionDelay = ''; }); }, 2200);
    }
    var mx = 0, my = 0;
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = hero.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5; });
    hero.addEventListener('pointerleave', function () { mx = my = 0; });
    function update(t) {
      var r = hero.getBoundingClientRect(), p = clamp(-r.top / (r.height * .8), 0, 1);
      var open = still() ? 1 : 1 - smooth(p) * .65;
      var sway = still() ? 0 : (phone() || !matchMedia('(hover: hover)').matches ? Math.sin(t / 1600) * 3 : mx * 9);
      stage.style.transform = still() ? '' : 'rotate(' + sway.toFixed(2) + 'deg) translateY(' + (p * 40).toFixed(1) + 'px)';
      cards.forEach(function (c) {
        c.style.setProperty('--open', open.toFixed(3));
        var img = c.firstElementChild;
        img.style.setProperty('--px', still() ? '0px' : (-mx * 14).toFixed(1) + 'px'); img.style.setProperty('--py', still() ? '0px' : (-my * 10).toFixed(1) + 'px');
      });
    }
    return { deal: deal, update: update };
  })();
  fan.deal(false);

  // ------------------------------------------------ dust in the window light; the hand pushes it aside
  var motes = (function () {
    var cv = $('[data-motes]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = true, px = -999, py = -999;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 45 : 90; P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 1.8, vx: (Math.random() - .5) * .15, vy: -.08 - Math.random() * .22, ph: Math.random() * 6.28 });
    }
    function draw(t) {
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        if (!still()) {
          var dx = p.x - px, dy = p.y - py, d2 = dx * dx + dy * dy;
          if (d2 < 9000) { var f = (9000 - d2) / 9000 * .9, d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f; }
          p.vx *= .96; p.vy = p.vy * .96 + (-.06 - p.r * .02) * .04;
          p.x += p.vx + Math.sin(t / 2000 + p.ph) * .12; p.y += p.vy;
          if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; } if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        }
        c.globalAlpha = .35 + .4 * Math.abs(Math.sin(t / 1400 + p.ph));
        c.fillStyle = i % 4 ? '#f3d7a6' : '#f2b49a';
        c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
      }
      c.globalAlpha = 1;
    }
    function frame(t) { raf = 0; draw(t); if (vis && !still()) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { px = py = -999; });
    if (io) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; kick(); }).observe(hero);
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // ------------------------------------------------ the mirror: from his black frame to the whole room, then the callouts
  var room = $('[data-room]'), glass = $('.mirror-glass'), copy = $('.room-copy'), rimg = $('img', glass), tags = $$('[data-tag]');
  function placeTags() {
    var w = glass.clientWidth, h = glass.clientHeight, s = Math.max(w / 1200, h / 1600), dw = 1200 * s, dh = 1600 * s, ox = (w - dw) / 2, oy = (h - dh) / 2;
    tags.forEach(function (t) {
      var x = parseFloat(t.style.getPropertyValue('--x')) / 100, y = parseFloat(t.style.getPropertyValue('--y')) / 100;
      var X = ox + x * dw, Y = oy + y * dh, out = X < 20 || X > w - 20 || Y < 20 || Y > h - 20;
      t.style.left = X + 'px'; t.style.top = Y + 'px'; t.style.visibility = out ? 'hidden' : '';
    });
  }
  function clearRoom() { glass.style.transform = ''; copy.style.visibility = ''; ['--mw', '--mh', '--mx', '--bw', '--br'].forEach(function (k) { glass.style.removeProperty(k); }); copy.style.removeProperty('--co'); copy.style.removeProperty('--cy'); }
  tags.forEach(function (t) { t.addEventListener('click', function () { t.classList.toggle('on'); }); });
  function roomUpdate() {
    if (still()) { tags.forEach(function (t) { t.classList.add('on'); }); placeTags(); return; }
    var r = room.getBoundingClientRect(), vh = innerHeight, vw = innerWidth, p = clamp(-r.top / (r.height - vh), 0, 1);
    var ph = vw < 900, mw0 = ph ? vw * .62 : Math.min(vw * .34, 470), mh0 = Math.min(mw0 * 4 / 3, vh * (ph ? .5 : .74)), mx0 = ph ? 0 : vw * .2 * (rtl() ? -1 : 1);
    var e = smooth((p - .2) / .4);
    glass.style.setProperty('--mw', lerp(mw0, vw, e).toFixed(1) + 'px');
    glass.style.setProperty('--mh', lerp(mh0, vh, e).toFixed(1) + 'px');
    glass.style.setProperty('--mx', (lerp(mx0, 0, e)).toFixed(1) + 'px');
    glass.style.transform = 'translate(calc(-50% + var(--mx)), calc(-50% + ' + (ph ? lerp(vh * .14, 0, e).toFixed(1) : 0) + 'px))';
    glass.style.setProperty('--bw', lerp(16, 0, e).toFixed(1) + 'px');
    glass.style.setProperty('--br', lerp(6, 0, e).toFixed(1) + 'px');
    glass.style.setProperty('--sx', lerp(-40, 40, p) + '%');
    copy.style.setProperty('--co', (1 - smooth((p - .04) / .14)).toFixed(3)); copy.style.visibility = p > .19 ? 'hidden' : '';
    copy.style.setProperty('--cy', (-smooth((p - .04) / .15) * 60).toFixed(1) + 'px');
    tags.forEach(function (t, i) { t.classList.toggle('on', p > .6 + i * .06); });
    placeTags();
  }

  // ------------------------------------------------ the window: shutter rolls up, the sky turns to evening
  var win = $('[data-winframe]');
  function winUpdate() {
    if (still()) { win.style.removeProperty('--sh'); win.style.removeProperty('--p'); return; }
    var r = win.getBoundingClientRect(), vh = innerHeight;
    var a = smooth((vh - r.top) / (vh * .55 + r.height * .5)), b = clamp((vh - r.top) / (vh + r.height), 0, 1);
    win.style.setProperty('--sh', a.toFixed(3));
    win.style.setProperty('--p', b.toFixed(3));
  }

  // ------------------------------------------------ reviews land one over another
  var rvs = $$('[data-rv]');
  rvs.forEach(function (r, i) { r.style.setProperty('--k', i); });
  function rvUpdate() {
    if (still()) { rvs.forEach(function (r) { r.style.removeProperty('--sc'); }); return; }
    rvs.forEach(function (r, i) {
      var n = rvs[i + 1]; if (!n) return;
      var a = r.getBoundingClientRect(), b = n.getBoundingClientRect(), cover = clamp(1 - (b.top - a.top) / a.height, 0, 1);
      r.style.setProperty('--sc', (1 - cover * .05).toFixed(4));
    });
  }

  // ------------------------------------------------ footer curtain: the name rises as the page lifts off it
  var foot = $('[data-foot]');
  function footUpdate() {
    foot.style.visibility = $('main').getBoundingClientRect().bottom < innerHeight + 4 ? '' : 'hidden';
    var r = foot.getBoundingClientRect(), vh = innerHeight, fp = still() ? 1 : clamp((vh - r.top) / (r.height * .9), 0, 1);
    $$('.foot-name .ch').forEach(function (c, i, all) { c.style.setProperty('--fp', smooth(fp * 1.6 - i / all.length * .6).toFixed(3)); });
  }

  // ------------------------------------------------ spotlight under the hand (tiles), drifting by itself on touch
  $$('[data-spot]').forEach(function (s) {
    s.addEventListener('pointermove', function (e) {
      var t = e.target.closest('.tile,.ct'); if (!t) return; var r = t.getBoundingClientRect();
      t.style.setProperty('--sx', (e.clientX - r.left) + 'px'); t.style.setProperty('--sy', (e.clientY - r.top) + 'px');
    });
  });
  var touch = !matchMedia('(hover: hover)').matches;
  function spotAuto(t) {
    if (!touch || still()) return;
    $$('.tile.in,.ct.in').forEach(function (el, i) {
      el.style.setProperty('--sx', (50 + Math.sin(t / 1900 + i) * 40) + '%'); el.style.setProperty('--sy', (50 + Math.cos(t / 2300 + i * 1.7) * 35) + '%');
    });
  }

  // ------------------------------------------------ the appointment card writes the WhatsApp message to Ilan
  var card = $('[data-card]'), bubble = $('[data-bubble]'), send = $('[data-send]'), typer = 0;
  var M = {
    he: { who: { me: 'תור בשבילי', kid: 'תור לילד שלי', both: 'תור לי ולילד שלי' }, day: { today: 'להיום', tomorrow: 'למחר', week: 'השבוע' }, time: { morning: 'בבוקר', noon: 'בצהריים', evening: 'בערב' },
      f: function (w, d, t) { return 'שלום אילן, אשמח לקבוע ' + w + ' ' + d + ', ' + t + ' אם אפשר. תודה'; } },
    en: { who: { me: 'a haircut for me', kid: 'a haircut for my child', both: 'haircuts for me and my child' }, day: { today: 'today', tomorrow: 'tomorrow', week: 'this week' }, time: { morning: 'in the morning', noon: 'around midday', evening: 'in the evening' },
      f: function (w, d, t) { return 'Hi Ilan, I’d like to book ' + w + ' ' + d + ', ' + t + ' if possible. Thanks'; } }
  };
  function compose(instant) {
    var v = function (n) { var x = $('input[name="' + n + '"]:checked', card); return x ? x.value : ''; };
    var L = M[root.lang], msg = L.f(L.who[v('who')], L.day[v('day')], L.time[v('time')]);
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
    cancelAnimationFrame(typer);
    if (instant || still()) { bubble.classList.remove('typing'); bubble.textContent = msg; return; }
    var t0 = performance.now(); bubble.classList.add('typing');
    (function f(t) { var n = Math.min(msg.length, Math.floor((t - t0) / 22)); bubble.textContent = msg.slice(0, n); if (n < msg.length) typer = requestAnimationFrame(f); else bubble.classList.remove('typing'); })(t0);
  }
  card.addEventListener('change', function () { compose(false); });
  var typedOnce = false;
  if (io) new IntersectionObserver(function (es) { if (es[0].isIntersecting && !typedOnce) { typedOnce = true; compose(false); } }, { threshold: .4 }).observe(bubble);

  // ------------------------------------------------ one loop for everything scroll-linked
  var queued = false;
  function frame() {
    queued = false;
    nav.classList.toggle('pill', scrollY > 40);
    fan.update(performance.now()); roomUpdate(); winUpdate(); rvUpdate(); footUpdate();
  }
  function req() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', req, { passive: true });
  function layout() { motes.size(); req(); }
  addEventListener('resize', layout);
  (function amb(t) { if (!still()) { spotAuto(t); if (phone() || touch) fan.update(t); } requestAnimationFrame(amb); })(0);

  texts(root.lang); hours(); clock.tick(); compose(true); layout();
})();
