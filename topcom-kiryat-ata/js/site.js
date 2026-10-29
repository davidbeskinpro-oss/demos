/* TopCom concept — lang + motion switches, live hours, link lights, packets → logo, plug seam, patch-panel composer */
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var still = function () { return root.classList.contains('still'); };
  var lang = function () { return root.lang === 'en' ? 'en' : 'he'; };
  var PHONE = '972546524272';

  /* ---------- language ---------- */
  var listeners = [];
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('tc-lang', l); } catch (e) {}
    var u = new URL(location.href); if (l === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang');
    history.replaceState(null, '', u);
    listeners.forEach(function (f) { f(); });
  }
  $('[data-lang]').addEventListener('click', function () { setLang(lang() === 'he' ? 'en' : 'he'); });

  /* ---------- motion switch ---------- */
  var mBtn = $('[data-motion]');
  function syncMotion() { mBtn.setAttribute('aria-pressed', String(!still())); }
  mBtn.addEventListener('click', function () {
    var off = !still(); root.classList.toggle('still', off);
    try { localStorage.setItem('tc-motion', off ? 'off' : 'on'); } catch (e) {}
    syncMotion(); motionChanged();
  });
  syncMotion();

  /* ---------- hours (Asia/Jerusalem). index 0 = Sunday; null = closed ---------- */
  var HOURS = [[9, 18], [9, 18], [9, 15], [9, 18], [9, 18], null, null];
  var DAY_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  var DAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var SHORT_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
  var SHORT_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  function nowIL() {
    var p = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), m: (+p.hour % 24) * 60 + (+p.minute) };
  }
  var hh = function (h) { return h + ':00'; };
  function status() {
    var n = nowIL(), t = HOURS[n.d], he = lang() === 'he';
    if (t && n.m >= t[0] * 60 && n.m < t[1] * 60) return { open: true, a: he ? 'פתוח עכשיו' : 'Open now', b: he ? 'עד ' + hh(t[1]) + ' היום' : 'until ' + hh(t[1]) + ' today' };
    if (t && n.m < t[0] * 60) return { open: false, a: he ? 'סגור כרגע' : 'Closed right now', b: he ? 'נפתח היום ב-' + hh(t[0]) : 'opens today at ' + hh(t[0]) };
    for (var k = 1; k <= 7; k++) {
      var d = (n.d + k) % 7; if (!HOURS[d]) continue;
      var when = k === 1 ? (he ? 'מחר' : 'tomorrow') : (he ? 'ביום ' + DAY_HE[d] : 'on ' + DAY_EN[d]);
      return { open: false, a: he ? 'סגור כרגע' : 'Closed right now', b: he ? 'נפתח ' + when + ' ב-' + hh(HOURS[d][0]) : 'opens ' + when + ' at ' + hh(HOURS[d][0]) };
    }
    return { open: false, a: '', b: '' };
  }
  function paintStatus() {
    var s = status(), he = lang() === 'he', n = nowIL();
    var mini = $('[data-status-mini]');
    mini.classList.toggle('closed', !s.open);
    $('[data-status-text]').textContent = s.a + ' · ' + s.b;
    var lcd = $('[data-lcd]');
    lcd.classList.toggle('closed', !s.open);
    $('[data-state]').textContent = s.a;
    $('[data-when]').textContent = (he ? 'טופקום, חנקין 2 · ' : 'TopCom, 2 Henkin St · ') + s.b;
    var wk = $('[data-week]'); wk.setAttribute('aria-label', he ? 'שעות פתיחה' : 'Opening hours'); wk.innerHTML = '';
    HOURS.forEach(function (t, i) {
      var li = document.createElement('li');
      if (!t) li.className = 'off'; if (i === n.d) li.className += ' today';
      li.innerHTML = '<span class="bar" style="--h:' + (t ? ((t[1] - t[0]) / 9 * 100) : 0) + '%;transition-delay:' + (i * 70) + 'ms"></span><span>' + (he ? SHORT_HE[i] : SHORT_EN[i]) + '</span>';
      li.title = (he ? DAY_HE[i] : DAY_EN[i]) + ': ' + (t ? hh(t[0]) + '–' + hh(t[1]) : (he ? 'סגור' : 'closed'));
      li.setAttribute('aria-label', li.title);
      wk.appendChild(li);
    });
  }
  paintStatus(); listeners.push(paintStatus); setInterval(paintStatus, 60000);

  /* ---------- nav gathers; wall plate appears after the hero ---------- */
  var ear = $('[data-ear]'), plate = $('[data-plate]'), hero = $('.hero'), foot = $('.foot');
  function onScrollUI() {
    var y = scrollY;
    ear.classList.toggle('gathered', y > 80);
    var fr = foot.getBoundingClientRect();
    plate.classList.toggle('show', y > hero.offsetHeight * 0.7 && fr.top > innerHeight - 40);
  }
  addEventListener('scroll', onScrollUI, { passive: true }); onScrollUI();

  /* ---------- reveals ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  $$('.rv, .t-board, .t-net, .t-rate, .reviews').forEach(function (el) { io.observe(el); });

  /* ---------- h1: letters light up one by one, like link lights ---------- */
  var h1 = $('[data-fill]');
  $$('[lang]', h1).forEach(function (span) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            var ws = document.createElement('span'); ws.className = 'w';
            Array.from(w).forEach(function (ch) { var s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = ch; ws.appendChild(s); });
            frag.appendChild(ws);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1) walk(c);
      });
    })(span);
  });
  requestAnimationFrame(function () { setTimeout(function () { h1.classList.add('lit'); }, 120); });

  /* ---------- hero: the photo's own link lights blink with traffic ---------- */
  // LED centres measured on the original 1920×1282 photo (crop origin 691,423)
  var OX = 691, OY = 423, W0 = 1920, H0 = 1282;
  var LEDS = [
    [85, 187, 'pwr'],
    [147, 88, 'poe'], [199, 83, 'poe'], [251, 78, 'poe'], [302, 72, 'poe'],
    [151, 133], [203, 128], [257, 123], [306, 118], [356, 112], [406, 106], [455, 101], [501, 96],
    [155, 178, 'spd'], [207, 172, 'spd'], [259, 166, 'spd'], [310, 160, 'spd'], [359, 155, 'spd'], [409, 150, 'spd'], [457, 144, 'spd'], [504, 138, 'spd'],
    [283, 538, 'poe2'], [326, 530, 'poe2'], [368, 522, 'poe2'], [409, 512, 'poe2'],
    [287, 577, 'b2'], [329, 569, 'b2'], [371, 560, 'b2'], [411, 551, 'b2'], [454, 543, 'b2'],
    [288, 614, 'b2'], [331, 605, 'b2'], [373, 596, 'b2'], [414, 588, 'b2'], [456, 580, 'b2'],
    [230, 628, 'pwr2']
  ];
  var ledBox = $('[data-leds]'), ledEls = [];
  LEDS.forEach(function (l) {
    var i = document.createElement('i');
    i.style.setProperty('--x', ((OX + l[0]) / W0 * 100).toFixed(2) + '%');
    i.style.setProperty('--y', ((OY + l[1]) / H0 * 100).toFixed(2) + '%');
    var lower = l[1] > 400;
    if (lower) { i.style.setProperty('--s', '.02'); i.style.setProperty('--b', '2px'); }
    if (l[2] === 'spd' || l[2] === 'pwr2') i.className = 'amber';
    ledBox.appendChild(i);
    ledEls.push({ el: i, kind: l[2] || 'act', on: true, next: 0, lower: lower });
  });
  var traffic = 0.25, lastT = 0, ledRAF = 0;
  function ledFrame(t) {
    ledRAF = requestAnimationFrame(ledFrame);
    if (t - lastT < 45) return; lastT = t;
    traffic = Math.max(0.22, traffic * 0.97);
    ledEls.forEach(function (L) {
      if (L.kind === 'pwr' || L.kind === 'pwr2' || L.kind === 'poe' || L.kind === 'poe2') { L.el.style.opacity = L.lower ? .55 : .9; return; }
      if (t < L.next) return;
      // activity: short dark gaps whose rate follows the traffic level
      L.on = !L.on || Math.random() > traffic;
      L.el.style.opacity = L.on ? (L.lower ? .55 : .95) : .08;
      L.next = t + (L.on ? 40 + Math.random() * (420 - traffic * 330) : 30 + Math.random() * 70);
    });
  }
  function bump(v) { traffic = Math.min(1, traffic + v); }
  var stage = $('[data-stage]');
  hero.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    stage.style.setProperty('--px', (-x * 22).toFixed(1) + 'px'); stage.style.setProperty('--py', (-y * 14).toFixed(1) + 'px');
    bump(0.04);
  });
  var lastY = scrollY;
  addEventListener('scroll', function () { var d = Math.abs(scrollY - lastY); lastY = scrollY; if (d) bump(Math.min(.3, d / 400)); }, { passive: true });
  hero.addEventListener('pointerdown', function () { bump(.6); });

  /* ---------- opening: packets leave the lights and assemble the TOP COM logo ---------- */
  var cvs = $('[data-packets]'), plateEl = $('[data-logo]'), logoImg = $('img', plateEl);
  var opened = false;
  function openLogo() {
    if (opened) return; opened = true;
    if (still()) return;
    plateEl.classList.add('wait');
    var img = new Image(); img.src = 'img/logo.png';
    img.decode().then(run, function () { plateEl.classList.remove('wait'); });
    function run() {
      var hr = hero.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      cvs.width = hr.width * dpr; cvs.height = hr.height * dpr;
      var ctx = cvs.getContext('2d'); ctx.scale(dpr, dpr);
      var lr = logoImg.getBoundingClientRect(); var lx = lr.left - hr.left, ly = lr.top - hr.top;
      // sample the dark letters of the real logo
      var oc = document.createElement('canvas'), sw = 160, sh = Math.round(sw * img.naturalHeight / img.naturalWidth);
      oc.width = sw; oc.height = sh; var o = oc.getContext('2d'); o.drawImage(img, 0, 0, sw, sh);
      var px = o.getImageData(0, 0, sw, sh).data, targets = [];
      for (var y = 0; y < sh; y += 2) for (var x = 0; x < sw; x += 2) { var k = (y * sw + x) * 4; if (px[k] + px[k + 1] + px[k + 2] < 120) targets.push([lx + x / sw * lr.width, ly + y / sh * lr.height]); }
      var src = ledEls.filter(function (L) { return !L.lower; }).map(function (L) { var r = L.el.getBoundingClientRect(); return [r.left + r.width / 2 - hr.left, r.top + r.height / 2 - hr.top]; })
        .filter(function (p) { return p[0] > -20 && p[0] < hr.width + 20 && p[1] > 0 && p[1] < hr.height; });
      if (!src.length) src = [[hr.width / 2, hr.height / 3]];
      var parts = targets.map(function (t, i) {
        var s = src[i % src.length];
        return { sx: s[0], sy: s[1], tx: t[0], ty: t[1], d: Math.random() * 380, c: Math.random() < .7 ? '#c9ffb4' : '#ffd38a' };
      });
      var t0 = performance.now(), dur = 900, total = 1500;
      bump(1);
      (function frame(now) {
        var t = now - t0; ctx.clearRect(0, 0, hr.width, hr.height);
        parts.forEach(function (p) {
          var k = Math.min(1, Math.max(0, (t - p.d) / dur)); if (k <= 0) return;
          var e = 1 - Math.pow(1 - k, 3), mx = (p.sx + p.tx) / 2, my = Math.min(p.sy, p.ty) - 60;
          var x = (1 - e) * (1 - e) * p.sx + 2 * (1 - e) * e * mx + e * e * p.tx, y = (1 - e) * (1 - e) * p.sy + 2 * (1 - e) * e * my + e * e * p.ty;
          ctx.globalAlpha = t > total - 300 ? Math.max(0, (total - t) / 300) : 1;
          ctx.fillStyle = p.c; ctx.fillRect(x - 1, y - 1, 2.2, 2.2);
        });
        if (t > dur + 200) plateEl.classList.remove('wait');
        if (t < total) requestAnimationFrame(frame); else ctx.clearRect(0, 0, hr.width, hr.height);
      })(t0);
    }
  }

  /* ---------- bento: spotlight follows the pointer (drifts by itself on touch) ---------- */
  $$('[data-tile]').forEach(function (t) {
    t.addEventListener('pointermove', function (e) {
      var r = t.getBoundingClientRect();
      t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); t.style.setProperty('--spot', 1);
    });
    t.addEventListener('pointerleave', function () { t.style.setProperty('--spot', 0); });
  });
  var tilt = $('[data-tilt]'), saleTile = tilt.closest('.tile');
  saleTile.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var r = saleTile.getBoundingClientRect();
    tilt.style.setProperty('--tx', (((e.clientX - r.left) / r.width - .5) * 2).toFixed(2));
    tilt.style.setProperty('--ty', (((e.clientY - r.top) / r.height - .5) * 2).toFixed(2));
  });
  saleTile.addEventListener('pointerleave', function () { tilt.style.setProperty('--tx', 0); tilt.style.setProperty('--ty', 0); });

  /* glyph-decode labels on the board */
  var GL = 'אבגדהוזחטיכלמנסעפצקרשת01#%&ABCDEFGHKMNPRSTUVXZ';
  function decodeAll(instant) {
    $$('[data-decode]').forEach(function (b, n) {
      var parts = b.getAttribute('data-decode').split('|'), txt = lang() === 'he' ? parts[0] : parts[1];
      if (instant || still()) { b.textContent = txt; return; }
      var f = 0, frames = 16 + n * 4;
      (function step() {
        f++;
        var keep = Math.floor(txt.length * f / frames);
        b.textContent = txt.slice(0, keep) + Array.from(txt.slice(keep)).map(function (c) { return c === ' ' ? ' ' : GL[(Math.random() * GL.length) | 0]; }).join('');
        if (f < frames) setTimeout(step, 45); else b.textContent = txt;
      })();
    });
  }
  decodeAll(true);
  listeners.push(function () { decodeAll(true); });
  new IntersectionObserver(function (es, ob) { es.forEach(function (e) { if (e.isIntersecting) { decodeAll(false); ob.disconnect(); } }); }, { threshold: .4 }).observe($('[data-board]'));

  /* networks tile + sale tilt on phones: driven by scroll */
  var netImg = $('.net img');
  function tileScroll() {
    if (still()) return;
    var r = netImg.parentNode.getBoundingClientRect(), k = (r.top + r.height / 2) / innerHeight - .5;
    netImg.style.setProperty('--ny', (k * -30).toFixed(1) + 'px');
    if (!matchMedia('(hover:hover)').matches) {
      var s = saleTile.getBoundingClientRect(), q = (s.top + s.height / 2) / innerHeight - .5;
      tilt.style.setProperty('--tx', (q * 1.6).toFixed(2));
    }
  }
  addEventListener('scroll', tileScroll, { passive: true });

  /* rating odometer: the digit rolls up 0 → 5 when the tile arrives */
  var roll = $('[data-roll]');
  new IntersectionObserver(function (es, ob) {
    if (!es[0].isIntersecting) return; ob.disconnect();
    if (still() || !roll.animate) return;
    var n = 0; roll.textContent = '0';
    (function tick() {
      roll.animate([{ transform: 'translateY(.35em)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 140 + n * 40, easing: 'cubic-bezier(.23,1,.32,1)' });
      if (n < 5) setTimeout(function () { roll.textContent = String(++n); tick(); }, 110 + n * 45);
    })();
  }, { threshold: .5 }).observe(roll.closest('.tile'));

  /* ---------- SEAM: plug slides in, latch clicks, link light floods the next section ---------- */
  var seam = $('[data-seam]'), plug = $('[data-plug]'), latch = $('[data-latch]'), cable = $('[data-cable]'), cableHi = $('[data-cablehi]');
  var flood = $('[data-flood]'), ledG = $('[data-ledg]'), ledA = $('[data-leda]'), glowG = $('[data-glowg]'), glowA = $('[data-glowa]'), scene = $('[data-plugscene]');
  var ease = function (x) { return 1 - Math.pow(1 - x, 3); };
  var clamp01 = function (x) { return Math.max(0, Math.min(1, x)); };
  var blinkT = 0;
  function seamDraw(p) {
    // travel: 0 → .5 approach; .5 → .62 insert (latch pressed then released); click at .62
    var travel = ease(clamp01(p / .5)) * 0.88 + clamp01((p - .5) / .12) * 0.12;
    var dx = -520 + travel * 560;                       // plug nose 590 → reaches jack face 610 and goes 40 in
    var press = p < .5 ? 0 : p < .6 ? Math.sin(clamp01((p - .5) / .1) * Math.PI / 2) : Math.max(0, 1 - (p - .6) / .02);
    plug.setAttribute('transform', 'translate(' + dx.toFixed(1) + ' 0)');
    latch.setAttribute('transform', 'rotate(' + (press * -9).toFixed(2) + ' 584 238)');
    // the cable trails behind with a sag that tightens as it is pushed home
    var bx = 330 + dx, sag = 60 * (1 - travel) + 14;
    var d = 'M-80 ' + (330 + sag * .4).toFixed(1) + ' C ' + (bx * .35).toFixed(1) + ' ' + (300 + sag).toFixed(1) + ' ' + (bx - 120).toFixed(1) + ' 270 ' + bx.toFixed(1) + ' 270';
    cable.setAttribute('d', d); cableHi.setAttribute('d', d.replace(/ 270/g, ' 262'));
    var linked = p >= .62;
    ledG.setAttribute('fill', linked ? '#b9ffc4' : '#1c3a24');
    glowG.setAttribute('opacity', linked ? Math.min(1, (p - .62) / .04).toFixed(2) : 0);
    var act = linked && (blinkT++ % 6 < 3);
    ledA.setAttribute('fill', act ? '#ffe2a8' : '#3c2c14'); glowA.setAttribute('opacity', act ? .9 : 0);
    // flood: a circle grows from the green light until it is the next section's ground
    var fr = clamp01((p - .68) / .24), sr = scene.getBoundingClientRect(), pr = seam.firstElementChild.getBoundingClientRect();
    var cx = sr.left - pr.left + sr.width * ((660 - 300) / 860), cy = sr.top - pr.top + sr.height * ((190 - 110) / 330);
    flood.style.setProperty('--cx', cx.toFixed(0) + 'px'); flood.style.setProperty('--cy', cy.toFixed(0) + 'px');
    flood.style.clipPath = 'circle(' + (ease(fr) * Math.hypot(pr.width, pr.height) * 1.05).toFixed(0) + 'px at ' + cx.toFixed(0) + 'px ' + cy.toFixed(0) + 'px)';
    seam.classList.toggle('done', p > .8);
  }
  function seamScroll() {
    if (still()) return;
    var r = seam.getBoundingClientRect(), span = r.height - innerHeight;
    seamDraw(clamp01(-r.top / span));
  }
  addEventListener('scroll', seamScroll, { passive: true });
  addEventListener('resize', seamScroll);

  /* ---------- SHOP: the monitor boots, then shows the live status ---------- */
  var screen = $('[data-screen]'), boot = $('[data-boot]');
  function bootScreen() {
    if (still()) { screen.classList.add('on'); return; }
    var lines = ['TOPCOM · POST', 'CPU ........ OK', 'RAM ........ OK', 'LAN ........ LINK', 'CLOCK ...... Asia/Jerusalem'], i = 0;
    boot.textContent = '';
    (function next() {
      if (i < lines.length) { boot.textContent += (i ? '\n' : '') + lines[i++]; setTimeout(next, 170); }
      else setTimeout(function () { screen.classList.add('on'); }, 260);
    })();
  }
  new IntersectionObserver(function (es, ob) { es.forEach(function (e) { if (e.isIntersecting) { bootScreen(); ob.disconnect(); } }); }, { threshold: .45 }).observe(screen);

  /* ---------- reviews drift slowly along the cable; a touch or hover stops them ---------- */
  var track = $('[data-track]'), hold = false, drift = 0, dirSign = function () { return root.dir === 'rtl' ? -1 : 1; };
  ['pointerenter', 'pointerdown', 'focusin', 'wheel', 'touchstart'].forEach(function (ev) { track.addEventListener(ev, function () { hold = true; }, { passive: true }); });
  track.addEventListener('pointerleave', function () { hold = false; });
  var trackVis = false;
  new IntersectionObserver(function (es) { trackVis = es[0].isIntersecting; }).observe(track);
  var lastD = 0;
  (function driftLoop(t) {
    requestAnimationFrame(driftLoop);
    if (still() || hold || !trackVis || t - lastD < 16) return; lastD = t;
    drift += .45;
    if (drift >= 1) {
      var max = track.scrollWidth - track.clientWidth, cur = Math.abs(track.scrollLeft);
      if (cur >= max - 2) { hold = true; return; }   // reached the end: stop (no endless loop)
      track.scrollLeft += dirSign() * Math.floor(drift); drift -= Math.floor(drift);
    }
  })(0);

  /* ---------- CONTACT: patch-panel composer ---------- */
  var MSG = {
    desk: ['היי טופקום, יש לי מחשב נייח שצריך בדיקה. אפשר להביא אותו לחנות?', 'Hi TopCom, I have a desktop computer that needs a check. Can I bring it to the shop?'],
    lap: ['היי טופקום, יש לי מחשב נייד שצריך בדיקה. אפשר להביא אותו לחנות?', 'Hi TopCom, I have a laptop that needs a check. Can I bring it to the shop?'],
    net: ['היי טופקום, רציתי לשאול לגבי רשת מחשבים.', 'Hi TopCom, I wanted to ask about a computer network.'],
    buy: ['היי טופקום, רציתי לשאול לגבי קניית מחשב.', 'Hi TopCom, I wanted to ask about buying a computer.'],
    other: ['היי טופקום, רציתי לשאול משהו.', 'Hi TopCom, I wanted to ask you something.']
  };
  var panel = $('[data-panel]'), cord = $('[data-cord]'), cordPath = $('[data-cordpath]'), uplink = $('[data-uplink]'), msgEl = $('[data-msg]'), send = $('[data-send]');
  var picked = 'desk';
  function cordTo(port, animate) {
    var pr = panel.getBoundingClientRect(), a = $('.hole', port).getBoundingClientRect(), b = $('.hole', uplink).getBoundingClientRect();
    var x1 = a.left + a.width / 2 - pr.left, y1 = a.top + a.height / 2 - pr.top, x2 = b.left + b.width / 2 - pr.left, y2 = b.top + b.height / 2 - pr.top;
    var drop = Math.max(40, (y2 - y1) * .6) + 30;
    var d = 'M' + x1 + ' ' + y1 + ' C ' + x1 + ' ' + (y1 + drop) + ' ' + x2 + ' ' + (y2 - drop * .2 + 40) + ' ' + x2 + ' ' + y2;
    cordPath.setAttribute('d', d);
    var L = cordPath.getTotalLength();
    cordPath.style.transition = 'none'; cordPath.style.strokeDasharray = L; cordPath.style.strokeDashoffset = animate && !still() ? L : 0;
    panel.classList.remove('linked');
    if (animate && !still()) {
      cordPath.getBoundingClientRect();
      cordPath.style.transition = 'stroke-dashoffset .55s cubic-bezier(.23,1,.32,1)'; cordPath.style.strokeDashoffset = 0;
      setTimeout(function () { panel.classList.add('linked'); }, 520);
    } else panel.classList.add('linked');
  }
  function pick(key, animate) {
    picked = key;
    $$('[data-port]').forEach(function (p) { p.setAttribute('aria-checked', String(p.dataset.port === key)); });
    var text = MSG[key][lang() === 'he' ? 0 : 1];
    msgEl.textContent = text;
    send.href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(text);
    cordTo($('[data-port="' + key + '"]'), animate);
  }
  $$('[data-port]').forEach(function (p) { p.addEventListener('click', function () { pick(p.dataset.port, true); }); });
  pick('desk', false);
  listeners.push(function () { pick(picked, false); });
  addEventListener('resize', function () { pick(picked, false); seamScroll(); });

  /* ---------- motion on/off ---------- */
  function motionChanged() {
    if (still()) {
      cancelAnimationFrame(ledRAF); ledRAF = 0;
      ledEls.forEach(function (L) { L.el.style.opacity = L.lower ? .55 : .9; });
      plateEl.classList.remove('wait');
      seamDraw(1); seam.classList.add('done'); flood.style.clipPath = 'circle(0 at 50% 50%)';
      screen.classList.add('on');
      stage.style.removeProperty('--px'); stage.style.removeProperty('--py');
    } else {
      if (!ledRAF) ledRAF = requestAnimationFrame(ledFrame);
      seamScroll();
    }
  }
  motionChanged();
  if (!still()) {
    if (document.readyState === 'complete') openLogo(); else addEventListener('load', openLogo);
  }
  tileScroll();
})();
