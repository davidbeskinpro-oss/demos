(function () {
  var root = document.documentElement, WA = '972549027671';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth <= 800; };
  var TITLE = { he: 'נטליה גונצ\'רוב · פדיקור רפואי · בלפור 3, חיפה', en: 'Natalia Goncharova · Medical pedicure · 3 Balfour St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור פדיקור רפואי, נטליה גונצ\'רוב · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Medical Pedicure, Natalia Goncharova · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  // where an image point lands inside a box showing it with object-fit: cover
  function cover(w, h, iw, ih, px, py) { var s = Math.max(w / iw, h / ih), rw = iw * s, rh = ih * s; return { s: s, rw: rw, rh: rh, ox: (w - rw) * px, oy: (h - rh) * py }; }

  // ---------------------------------------------------------------- glyph decode (labels settle out of scrambled letters)
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' };
  function decode(el, txt, l) {
    clearInterval(el._dt);
    if (still()) { el.textContent = txt; return; }
    var g = GL[l], n = 0, steps = Math.max(10, txt.length);
    el._dt = setInterval(function () {
      n++; var k = Math.floor(n / steps * txt.length * 1.4), out = '';
      for (var i = 0; i < txt.length; i++) out += i < k || txt[i] === ' ' || txt[i] === '·' ? txt[i] : g[Math.floor(Math.random() * g.length)];
      el.textContent = out; if (k >= txt.length) { el.textContent = txt; clearInterval(el._dt); }
    }, 34);
  }

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'נטליה גונצ\'רוב, פדיקור רפואי', 'Natalia Goncharova, medical pedicure');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-side]', 'איזו רגל', 'Which foot');
    aria('[data-t-contact]', 'יצירת קשר', 'Contact');
    aria('[data-t-call]', 'התקשרו לנטליה, 054-902-7671', 'Call Natalia, 054-902-7671');
    aria('[data-t-wa]', 'וואטסאפ לנטליה', 'WhatsApp Natalia');
    $$('[data-decode]').forEach(function (d) { decode(d, d.dataset[l], l); });
    $$('.spot').forEach(function (s) { if (s.classList.contains('on')) decode($('.tag', s), s.dataset[l], l); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('nt-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('nt-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-style-reset]').forEach(function (el) { el.removeAttribute('style'); });
    layout(); dust.kick(); lens.kick(); arc.kick(); slens.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [10, 18], 1: [10, 18], 2: [10, 18], 3: null, 4: [10, 18], 5: [9, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
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
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); });
  $$('.contact [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', i * 70 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- letters: hero headline, the room's heading, the footer name
  function split(sp, start) {
    var i = start || 0;
    var walk = function (node) {
      [].slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
            var ws = document.createElement('span'); ws.className = 'w';
            w.split('').forEach(function (ch) { var s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = ch; ws.appendChild(s); });
            frag.appendChild(ws);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1) walk(c);
      });
    };
    walk(sp); return i;
  }
  $$('[data-split] .ln > span[lang]').forEach(function (sp) { split(sp, sp.closest('.ln').previousElementSibling ? 14 : 0); });
  $$('[data-split2] > span[lang]').forEach(function (sp) { split(sp); });
  $$('[data-fname] > span[lang]').forEach(function (sp) { split(sp); });

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- particles. Hero: dust motes drifting up through the lamp's light, parting
  // under the hand. Footer: the same motes gather into her logo, large, behind the real logo tile
  var arch = $('[data-arch]');
  var COL = ['236,180,166', '227,193,147', '248,239,234', '217,150,140'];
  function field(host, cv, logo) {
    var c = cv.getContext('2d'), P = [], w = 0, h = 0, raf = 0, vis = false, t0 = performance.now(), mx = -999, my = -999, ok = !logo, box = { x: 0, y: 0, s: 1 }, glow = { x: 0, y: 0, r: 1 }, on = 0, onT = 0;
    function motes() {
      var n = phone() ? 150 : 320; P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, ph: Math.random() * 6.28, sp: 8 + Math.random() * 22, c: COL[i % COL.length], z: .5 + Math.random() * 1.4 });
    }
    function sample(img) {
      try {
        var sc = document.createElement('canvas'), iw = 240, ih = 228; sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data, pts = [];
        for (var y = 0; y < ih; y += 2) for (var x = 0; x < iw; x += 2) if (d[(y * iw + x) * 4 + 3] > 120) pts.push([x / iw, y / iw]);
        var want = phone() ? 1300 : 2400, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) { var q = pts[Math.floor(f)]; P.push({ hx: q[0], hy: q[1], rx: Math.random(), ry: Math.random(), x: 0, y: 0, vx: 0, vy: 0, ph: Math.random() * 6.28, dl: Math.random() * .6, c: COL[Math.floor(Math.random() * COL.length)], z: .6 + Math.random() * .9 }); }
        ok = true; size(); kick();
      } catch (e) { ok = false; }
    }
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = host.clientWidth; h = host.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var hr = host.getBoundingClientRect();
      if (logo) {
        var tr = $('.logo-tile', host).getBoundingClientRect(), s = Math.min(w * (phone() ? .86 : .42), 520);
        box = { s: s, x: tr.left - hr.left + tr.width / 2 - s / 2, y: tr.top - hr.top + tr.height / 2 - s * .474 };
      } else {
        var gr = $('.halo i:last-child', host).getBoundingClientRect();
        glow = { x: gr.left - hr.left + gr.width / 2, y: gr.top - hr.top + gr.height / 2, r: Math.max(gr.width, 300) * .9 };
        if (!P.length || Math.abs(P._w - w) > 40) { motes(); P._w = w; }
      }
    }
    function frame(now) {
      raf = 0; if (!ok || !w) return;
      var calm = still(), T = (now - t0) / 1000, dt = 1 / 60;
      c.clearRect(0, 0, w, h); c.globalCompositeOperation = 'lighter';
      var gather = logo ? (calm ? 1 : smooth((now - onT) / 1000 * (on ? 1 : -1.6) + (on ? 0 : 1))) : 0;
      for (var i = 0; i < P.length; i++) {
        var p = P[i], tx, ty, al;
        if (logo) {
          var g = calm ? 1 : smooth((gather * 1.3 - p.dl * .3));
          var hx = box.x + p.hx * box.s + Math.sin(T * .9 + p.ph) * 1.6 * p.z, hy = box.y + p.hy * box.s + Math.cos(T * .7 + p.ph) * 1.6 * p.z;
          var sx = p.rx * w, sy = p.ry * h + Math.sin(T * .3 + p.ph) * 20;
          tx = lerp(sx, hx, g); ty = lerp(sy, hy, g);
          var dx = tx - mx, dy = ty - my, d2 = dx * dx + dy * dy;
          if (d2 < 9000 && !calm) { var f = (9000 - d2) / 9000 * 26, dd = Math.sqrt(d2) || 1; p.vx = lerp(p.vx, dx / dd * f, .2); p.vy = lerp(p.vy, dy / dd * f, .2); } else { p.vx *= .9; p.vy *= .9; }
          p.x = tx + p.vx; p.y = ty + p.vy;
          al = .18 + .5 * g;
        } else {
          p.y -= p.sp * dt * .6 * p.z; p.x += Math.sin(T * .5 + p.ph) * .25;
          var ddx = p.x - mx, ddy = p.y - my, q2 = ddx * ddx + ddy * ddy;
          if (q2 < 12000) { var ff = (12000 - q2) / 12000 * 1.8, qd = Math.sqrt(q2) || 1; p.vx += ddx / qd * ff; p.vy += ddy / qd * ff; }
          p.x += p.vx; p.y += p.vy; p.vx *= .9; p.vy *= .9;
          if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; } if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
          var gd = Math.hypot(p.x - glow.x, p.y - glow.y) / glow.r;
          al = (.2 + .75 * Math.max(0, 1 - gd)) * (.6 + .4 * Math.sin(T * 1.7 + p.ph * 3));
          if (calm) al *= .8;
        }
        c.fillStyle = 'rgba(' + p.c + ',' + clamp(al, 0, 1).toFixed(3) + ')';
        var s = (logo ? 1.6 : 1.9) * p.z + (phone() ? 0 : .4);
        c.beginPath(); c.arc(p.x, p.y, s / 2 + .2, 0, 6.283); c.fill();
      }
      c.globalCompositeOperation = 'source-over';
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    host.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(host, function (v) { vis = v; if (v) kick(); });
    if (logo) {
      watch(host, function (v) { if (!!v !== !!on) { on = v ? 1 : 0; onT = performance.now(); } }, { threshold: .35 });
      var img = new Image(); img.onload = function () { sample(img); }; img.src = 'img/logo.png';
    }
    return { kick: kick, size: function () { size(); kick(); } };
  }
  var foot = $('[data-foot]');
  var heroDust = field(hero, $('[data-dust]'), false), footDust = field(foot, $('[data-fdust]'), true);
  var dust = { kick: function () { heroDust.kick(); footDust.kick(); }, size: function () { heroDust.size(); footDust.size(); } };

  // ---------------------------------------------------------------- the magnifier lens over her photo
  var lensEl = $('[data-lens]');
  var lens = (function () {
    var raf = 0, vis = true, lx = .45, ly = .55, tx = .45, ty = .55, user = 0, t0 = performance.now(), IW = 1400, IH = 1866, Z = 1.75;
    function place() {
      var w = arch.clientWidth, h = arch.clientHeight, cv = cover(w, h, IW, IH, .62, .4), L = lensEl.offsetWidth, R = L / 2;
      var cx = cv.ox + lx * cv.rw, cy = cv.oy + ly * cv.rh;
      cx = clamp(cx, R * .6, w - R * .6); cy = clamp(cy, R * .6, h - R * .6);
      lensEl.style.transform = 'translate(' + (cx - R).toFixed(1) + 'px,' + (cy - R).toFixed(1) + 'px)';
      lensEl.style.backgroundSize = (cv.rw * Z).toFixed(1) + 'px ' + (cv.rh * Z).toFixed(1) + 'px';
      lensEl.style.backgroundPosition = (R - (cx - cv.ox) * Z).toFixed(1) + 'px ' + (R - (cy - cv.oy) * Z).toFixed(1) + 'px';
    }
    function frame(t) {
      raf = 0; if (still()) return;
      var T = (t - t0) / 1000;
      if (t - user > 2600) { tx = .5 + .2 * Math.sin(T * .45) ; ty = .56 + .12 * Math.sin(T * .73 + 1); }   // drifts between her hands, the foot and her face
      lx += (tx - lx) * .06; ly += (ty - ly) * .06; place();
      if (vis) raf = requestAnimationFrame(frame);
    }
    function point(e) {
      var r = arch.getBoundingClientRect(), cv = cover(r.width, r.height, IW, IH, .62, .4);
      tx = clamp((e.clientX - r.left - cv.ox) / cv.rw, .05, .95); ty = clamp((e.clientY - r.top - cv.oy) / cv.rh, .05, .95); user = performance.now(); kick();
    }
    arch.addEventListener('pointermove', point);
    arch.addEventListener('pointerdown', point);
    function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); }
    watch(arch, function (v) { vis = v; kick(); });
    return { kick: kick, place: place };
  })();

  // ---------------------------------------------------------------- the door: the lens opens into the photo
  var door = $('[data-door]'), dph = $('[data-dphoto]'), dimg = $('img', dph), dring = $('[data-dring]'), spots = $$('.spot', door);
  var DPT = [.74, .4], doorCv = null;
  function doorLayout() {
    var w = dph.clientWidth, h = dph.clientHeight, cv = cover(w, h, 1600, 1200, .5, .5);
    // keep her sign in view on narrow screens
    var want = w * (phone() ? .5 : .62), ox = clamp(want - DPT[0] * cv.rw, w - cv.rw, 0), px = cv.rw > w ? ox / (w - cv.rw) : .5;
    dimg.style.objectPosition = (px * 100).toFixed(1) + '% 50%';
    cv.ox = (w - cv.rw) * px; doorCv = cv;
    spots.forEach(function (sp) {
      var x = cv.ox + cv.rw * +sp.dataset.x, y = cv.oy + cv.rh * +sp.dataset.y;
      sp.style.left = x + 'px'; sp.style.top = y + 'px';
      var flip = x > w * .55; sp.classList.toggle('flip', flip);
      sp.hidden = x < 20 || x > w - 20 || y < 70 || y > h - 150;
    });
  }
  function spotOn(sp, on) {
    if (on === sp.classList.contains('on')) return;
    sp.classList.toggle('on', on); var tag = $('.tag', sp);
    if (on) decode(tag, sp.dataset[he() ? 'he' : 'en'], he() ? 'he' : 'en'); else { clearInterval(tag._dt); tag.textContent = ''; }
  }

  // ---------------------------------------------------------------- bento: lamp spotlight under the hand, the pouch leans toward it
  $$('.tile').forEach(function (t) {
    var pouch = $('.pouch', t);
    t.addEventListener('pointermove', function (e) {
      var r = t.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      t.style.setProperty('--mx', x + 'px'); t.style.setProperty('--my', y + 'px');
      if (pouch && !still()) { pouch.style.setProperty('--ty', ((x / r.width - .5) * 16).toFixed(1) + 'deg'); pouch.style.setProperty('--tx', ((.5 - y / r.height) * 10).toFixed(1) + 'deg'); }
    });
    t.addEventListener('pointerleave', function () { if (pouch) { pouch.style.setProperty('--ty', '0deg'); pouch.style.setProperty('--tx', '0deg'); } });
  });

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { if (o._go === go) return; o._go = go; $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : 0; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  var roomOdos = $$('.r-stats [data-odo]'), revOdo = $('.rv-head [data-odo]');
  $$('[data-odo]').forEach(function (o) { roll(o, still()); });
  if (revOdo) watch(revOdo, function (v) { if (v) roll(revOdo, true); }, { threshold: .4 });

  // ---------------------------------------------------------------- the room
  var room = $('[data-room]'), rframe = $('[data-rframe]'), rlayer = $('[data-rlayer]'), rimg = $('img', rlayer), rcopy = $('[data-rcopy]'), rch = $$('.r-copy h2 .ch'), rpin = $('.r-pin'), FR = null;
  function roomLayout() {
    if (still()) { rlayer.removeAttribute('style'); rimg.style.filter = ''; FR = null; return; }
    var pr = rpin.getBoundingClientRect(), fr = rframe.getBoundingClientRect();
    FR = { x: fr.left - pr.left, y: fr.top - pr.top, w: fr.width, h: fr.height, W: pr.width, H: pr.height };
    rlayer.style.left = FR.x + 'px'; rlayer.style.top = FR.y + 'px'; rlayer.style.width = FR.w + 'px'; rlayer.style.height = FR.h + 'px';
  }

  // ---------------------------------------------------------------- book: the intake chart writes the note to Natalia
  var T = {
    he: { hi: 'שלום נטליה, הגעתי דרך האתר. ',
      what: { ped: 'אשמח לקבוע תור לפדיקור רפואי.', ingrown: 'אשמח לקבוע תור בגלל ציפורן חודרנית.', corns: 'אשמח לקבוע תור בגלל יבלת.', fungus: 'אשמח לקבוע תור בגלל פטרייה.', diab: 'אשמח לקבוע תור לטיפול בכף רגל סכרתית.', check: 'אשמח לקבוע תור לבדיקה.' },
      zone: { toe: 'בבוהן', toes: 'באצבעות', ball: 'בכרית כף הרגל', arch: 'בקשת כף הרגל', heel: 'בעקב' },
      side: { r: 'ברגל ימין', l: 'ברגל שמאל', b: 'בשתי הרגליים' }, it: ' זה ', name: ' קוראים לי ', ask: ' מתי יש מקום?' },
    en: { hi: 'Hi Natalia, I found your website. ',
      what: { ped: 'I’d like to book a medical pedicure.', ingrown: 'I’d like to book an appointment for an ingrown nail.', corns: 'I’d like to book an appointment for a corn.', fungus: 'I’d like to book an appointment for fungus.', diab: 'I’d like to book diabetic foot care.', check: 'I’d like to book a check-up.' },
      zone: { toe: 'on the big toe', toes: 'on the toes', ball: 'on the ball of the foot', arch: 'on the arch', heel: 'on the heel' },
      side: { r: 'right foot', l: 'left foot', b: 'both feet' }, it: ' It’s ', name: ' My name is ', ask: ' When do you have a free slot?' }
  };
  var form = $('#composer'), send = $('[data-send]'), nm = $('[name=nm]'), sole = $('[data-sole]'), msgEl = $('[data-msg]'), steps = $$('[data-step]'), shown = '', typing = 0, chatSeen = false;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function message() {
    var l = he() ? 'he' : 'en', t = T[l], fd = new FormData(form), what = fd.get('what') || 'check', zone = fd.get('zone'), side = fd.get('side') || 'r';
    var name = (nm.value || '').replace(/\s+/g, ' ').trim().slice(0, 40).replace(/[.!?]+$/, '');
    var m = t.hi + t.what[what];
    if (zone) m += t.it + t.zone[zone] + ', ' + t.side[side] + '.';
    if (name) m += t.name + name + '.';
    return m + t.ask;
  }
  function write(instant) {
    var target = message();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 14);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  form.addEventListener('change', function (e) {
    var n = e.target.name;
    if (n === 'side') sole.classList.toggle('mirror', e.target.value === 'l');
    if (n === 'zone' || n === 'side') lightStep(0);
    if (n === 'what') lightStep(1);
    write();
  });
  nm.addEventListener('input', function () { write(true); });
  ['pointerenter', 'focus', 'click'].forEach(function (ev) { send.addEventListener(ev, function () { lightStep(2); }); });
  $$('[data-pick]').forEach(function (a) { a.addEventListener('click', function () {
    var r = form.querySelector('input[name=what][value="' + a.dataset.pick + '"]'); if (r) { r.checked = true; lightStep(1); write(true); }
  }); });
  watch($('.card', form), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .5 });

  // ---------------------------------------------------------------- reviews: a concave arc of cards, turning with time, scroll and drag
  var arcWrap = $('[data-arcwrap]'), arcEl = $('[data-arc]');
  $$('.ac', arcEl).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $$('img', k).forEach(function (i) { i.alt = ''; i.removeAttribute('data-alt-he'); }); arcEl.appendChild(k); });
  var arc = (function () {
    var cards = $$('.ac', arcEl), N = cards.length, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = false, last = 0;
    function geo() { var cw = cards[0].offsetWidth || 260; var R = phone() ? Math.max(520, cw * 2.3) : Math.max(900, cw * 3.4); var step = 2 * Math.atan((cw * .5 + (phone() ? 8 : 14)) / R) * 180 / Math.PI; return { R: R, step: step, d0: phone() ? 140 : 220 }; }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; c.style.opacity = ''; }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      var dir = rtl() ? -1 : 1;
      if (!drag) { rot += (3 + vel) * dt * dir; vel *= .94; }
      var g = geo(), span = g.step * N, sc = scrollY * .03 * dir;
      cards.forEach(function (c, i) {
        var a = ((i * g.step - rot - sc) % span + span * 1.5) % span - span / 2;
        var vis2 = Math.abs(a) < 70;
        c.style.opacity = vis2 ? smooth((70 - Math.abs(a)) / 14).toFixed(3) : '0';
        c.style.transform = 'translateZ(' + (g.R - g.d0) + 'px) rotateY(' + (-a).toFixed(2) + 'deg) translateZ(' + (-g.R) + 'px)';
        c.style.filter = 'brightness(' + (1 - Math.min(.35, Math.abs(a) / 120)).toFixed(3) + ')';
        c.style.zIndex = String(100 - Math.round(Math.abs(a)));
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    arcWrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; arcWrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot -= dx * .08; vel = -dx * .8 * (rtl() ? -1 : 1); });
    addEventListener('pointerup', function () { drag = false; arcWrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; arcWrap.classList.remove('drag'); });
    watch(arcWrap, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- the lens reads the sign in the FAQ
  var sl = $('[data-signlens]'), slEl = $('[data-slens]');
  var slens = (function () {
    var raf = 0, vis = false, lx = .5, ly = .2, tx = .5, ty = .2, user = 0, t0 = performance.now(), IW = 420, IH = 699, Z = 2.1;
    function place() {
      var w = sl.clientWidth, h = sl.clientHeight, py = phone() ? .22 : .5, cv = cover(w, h, IW, IH, .5, py), L = slEl.offsetWidth, R = L / 2;
      var cx = cv.ox + lx * cv.rw, cy = cv.oy + ly * cv.rh;
      cx = clamp(cx, R * .5, w - R * .5); cy = clamp(cy, R * .5, h - R * .5);
      slEl.style.transform = 'translate(' + (cx - R).toFixed(1) + 'px,' + (cy - R).toFixed(1) + 'px)';
      slEl.style.backgroundSize = (cv.rw * Z).toFixed(1) + 'px ' + (cv.rh * Z).toFixed(1) + 'px';
      slEl.style.backgroundPosition = (R - (cx - cv.ox) * Z).toFixed(1) + 'px ' + (R - (cy - cv.oy) * Z).toFixed(1) + 'px';
    }
    function frame(t) {
      raf = 0; if (still()) return;
      var T = (t - t0) / 1000;
      // reads the sign line by line: across, then down a line, then back to the top
      if (t - user > 2600) { var line = Math.floor(T / 3.2) % 6, u = (T % 3.2) / 3.2; tx = rtl() ? lerp(.85, .15, smooth(u)) : lerp(.15, .85, smooth(u)); ty = .1 + line * .075; }
      lx += (tx - lx) * .07; ly += (ty - ly) * .07; place();
      if (vis) raf = requestAnimationFrame(frame);
    }
    function point(e) { var r = sl.getBoundingClientRect(), cv = cover(r.width, r.height, IW, IH, .5, phone() ? .22 : .5); tx = clamp((e.clientX - r.left - cv.ox) / cv.rw, 0, 1); ty = clamp((e.clientY - r.top - cv.oy) / cv.rh, 0, 1); user = performance.now(); kick(); }
    sl.addEventListener('pointermove', point); sl.addEventListener('pointerdown', point);
    function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); }
    watch(sl, function (v) { vis = v; kick(); });
    return { kick: kick, place: place };
  })();

  // ---------------------------------------------------------------- visit: the lens closes on her door
  var vstage = $('[data-vstage]'), vpin = $('.v-pin'), vph = $('[data-vphoto]'), vimg = $('img', vph), vring = $('[data-vring]'), vcopy = $('[data-vcopy]'), VP = null;
  var SPT = [.735, .43];   // the sign on her door, in the shop-front photo
  function visitLayout() {
    var w = vpin.clientWidth, h = vpin.clientHeight, cv = cover(w, h, 1350, 1800, .5, .5);
    var wantX = phone() ? w * .5 : w * .7, wantY = phone() ? h * .36 : h * .5;
    var ox = cv.rw > w ? clamp(wantX - SPT[0] * cv.rw, w - cv.rw, 0) : (w - cv.rw) / 2, oy = cv.rh > h ? clamp(wantY - SPT[1] * cv.rh, h - cv.rh, 0) : (h - cv.rh) / 2;
    vimg.style.objectPosition = (cv.rw > w ? ox / (w - cv.rw) * 100 : 50).toFixed(1) + '% ' + (cv.rh > h ? oy / (h - cv.rh) * 100 : 50).toFixed(1) + '%';
    var r = phone() ? Math.min(w * .33, 140) : clamp(w * .14, 150, 230);
    VP = { w: w, h: h, px: ox + SPT[0] * cv.rw, py: oy + SPT[1] * cv.rh, r: r, R: Math.hypot(w, h) };
  }
  function visitAt(e) {
    if (!VP) return;
    var cx = lerp(VP.w / 2, VP.px, smooth(e * 1.4)), cy = lerp(VP.h / 2, VP.py, smooth(e * 1.4)), r = lerp(VP.R, VP.r, Math.pow(e, .7));
    vph.style.setProperty('--r', r.toFixed(1) + 'px'); vph.style.setProperty('--cx', cx.toFixed(1) + 'px'); vph.style.setProperty('--cy', cy.toFixed(1) + 'px');
    vring.style.setProperty('--r2', r.toFixed(1) + 'px'); vring.style.setProperty('--px', cx.toFixed(1) + 'px'); vring.style.setProperty('--py', cy.toFixed(1) + 'px');
    vring.style.setProperty('--ro', smooth((e - .55) / .3).toFixed(3));
    vcopy.style.setProperty('--co', smooth((e - .6) / .35).toFixed(3));
  }

  // ---------------------------------------------------------------- footer curtain, the dock
  var dock = $('[data-dock]'), seen = new Set(), sedge = $('.sole-edge'), book = $('#book');
  watch(foot, function (v) { if (v) foot.classList.add('up'); }, { threshold: .25 });
  if (io) { var kio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? seen.add(e.target) : seen.delete(e.target); }); tick(); }); $$('[data-keep-clear]').forEach(function (el) { kio.observe(el); }); }

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    dock.classList.toggle('away', scrollY < hero.offsetHeight * .7 || seen.size > 0);

    // door: the lens opens
    if (doorCv) {
      var w = dph.clientWidth, h = dph.clientHeight;
      if (calm) {
        dph.style.removeProperty('--r'); spots.forEach(function (sp) { spotOn(sp, true); });
      } else {
        var dp = prog(door), dr = door.getBoundingClientRect(), pre = clamp((vh - dr.top) / vh, 0, 1);
        var e = smooth(dp / .36), r0 = Math.min(w, h) * (phone() ? .3 : .22);
        // the lens starts on the logo of her sign and opens until it covers every corner
        var cx = clamp(doorCv.ox + DPT[0] * doorCv.rw, r0, w - r0), cy = clamp(doorCv.oy + DPT[1] * doorCv.rh, r0 + 70, h - r0);
        var Rend = Math.max(Math.hypot(cx, cy), Math.hypot(w - cx, cy), Math.hypot(cx, h - cy), Math.hypot(w - cx, h - cy)) + 8;
        var R = lerp(r0 * lerp(.6, 1, pre), Rend, e);
        dph.style.setProperty('--r', R.toFixed(1) + 'px'); dph.style.setProperty('--cx', cx + 'px'); dph.style.setProperty('--cy', cy + 'px');
        dph.style.setProperty('--ds', lerp(1.6, 1, e).toFixed(4));
        dph.style.setProperty('--so', smooth((dp - .3) / .15).toFixed(3));
        dring.style.setProperty('--r', R.toFixed(1) + 'px'); dring.style.setProperty('--px', cx + 'px'); dring.style.setProperty('--py', cy + 'px');
        dring.style.setProperty('--ro', (1 - smooth((e - .45) / .4)).toFixed(3));
        spots.forEach(function (sp, i) { spotOn(sp, dp > .38 + i * .035); });
      }
    }

    // room: full screen, then into its arch, then the heading fills letter by letter
    if (FR && !calm) {
      var rp = prog(room), re = smooth((rp - .04) / .46);
      var S = Math.max(FR.W / FR.w, FR.H / FR.h) * 1.02, s = lerp(S, 1, re);
      var ccx = lerp(FR.W / 2, FR.x + FR.w / 2, re), ccy = lerp(FR.H / 2, FR.y + FR.h / 2, re);
      rlayer.style.transform = 'translate3d(' + (ccx - FR.w * s / 2 - FR.x).toFixed(1) + 'px,' + (ccy - FR.h * s / 2 - FR.y).toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
      rlayer.style.borderRadius = (50 * re).toFixed(2) + '% ' + (50 * re).toFixed(2) + '% ' + (26 * re).toFixed(1) + 'px ' + (26 * re).toFixed(1) + 'px / ' + (37.5 * re).toFixed(2) + '% ' + (37.5 * re).toFixed(2) + '% ' + (26 * re).toFixed(1) + 'px ' + (26 * re).toFixed(1) + 'px';
      rimg.style.filter = 'blur(' + ((1 - re) * 2.2).toFixed(2) + 'px) brightness(' + lerp(.7, 1, re).toFixed(3) + ')';
      var co = smooth((rp - .3) / .14);
      rcopy.style.opacity = co.toFixed(3); rcopy.style.transform = 'translateY(' + ((1 - co) * 30).toFixed(1) + 'px)';
      var lf = clamp((rp - .34) / .26, 0, 1) * rch.length;
      rch.forEach(function (c, i) { c.classList.toggle('on', i < lf); });
      roomOdos.forEach(function (o) { roll(o, rp > .5); });
    } else if (calm) { rcopy.style.opacity = ''; rcopy.style.transform = ''; roomOdos.forEach(function (o) { roll(o, true); }); }

    // the sole-shaped edge of the booking card rises
    var br = book.getBoundingClientRect().top;
    sedge.style.setProperty('--se', calm ? '1' : lerp(.15, 1, smooth((vh - br) / (vh * .55))).toFixed(3));

    // visit: the lens closes
    visitAt(calm ? 1 : smooth(prog(vstage) / .8));

    if (!calm) arc.kick();
  }

  function layout() {
    var fit = foot.offsetHeight < innerHeight - 30 && !still();
    foot.classList.toggle('curtain', fit);
    dust.size(); lens.place(); slens.place(); doorLayout(); roomLayout(); visitLayout(); tick();
  }
  var rz, lastW = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); lastW = innerWidth; }, 140); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); lens.kick(); layout(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', layout);
})();
