(function () {
  var root = document.documentElement, WA = '972528228282';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'יונג · עיסוי תאילנדי מסורתי · גאולי תימן 10, חיפה', en: 'Yong · Traditional Thai massage · 10 Ge’ulei Teiman St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור יונג מסאג\' תאילנדי חיפה · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for YONG Thai Massage Haifa · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'יונג מסאג\' תאילנדי, לראש העמוד', 'Yong Thai Massage, back to top');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-fnav]', 'תפריט תחתון', 'Footer menu');
    aria('[data-t-call]', 'התקשרו ליונג, 052-822-8282', 'Call Yong, 052-822-8282');
    aria('[data-t-wa]', 'וואטסאפ ליונג', 'WhatsApp Yong');
    aria('[data-t-form]', 'הודעה ליונג', 'Message to Yong');
    aria('[data-t-press]', 'לחץ', 'Firmness');
    aria('[data-t-prev]', 'הביקורת הקודמת', 'Previous review');
    aria('[data-t-next]', 'הביקורת הבאה', 'Next review');
    $('[data-set-lang]').setAttribute('aria-label', l === 'he' ? 'English' : 'עברית');
    $$('.spot').forEach(function (s) { s.setAttribute('aria-label', s.dataset[l]); if (s.classList.contains('on')) $('.tag', s).textContent = s.dataset[l]; });
    caption();
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('yong-lang', l); } catch (e) {}
    texts(l); hours(); splitQuotes(); showQuote(qi, true); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('yong-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    hero.classList.add('dealt');
    petals.kick(); showQuote(qi, true); write(true); layout();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 19], 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [8, 16], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, s: +o.second }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, short, open = false;
    var all = [0, 1, 2, 3, 4, 5, 6].every(function (k) { return H[k] && H[k][0] === 0 && H[k][1] === 24; });
    if (all) { open = true; txt = short = l ? 'פתוח 24/7' : 'Open 24/7'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); short = l ? 'פתוח עד ' + hhmm(t[1]) : 'Open until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); short = l ? 'נפתח ב-' + hhmm(t[0]) : 'Opens at ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      if (!H[nd]) { txt = short = l ? 'סגור עכשיו' : 'Closed now'; }
      else if (nd === (n.d + 1) % 7) { txt = l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]); short = l ? 'מחר מ-' + hhmm(H[nd][0]) : 'Tomorrow from ' + hhmm(H[nd][0]); }
      else { txt = l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]); short = l ? 'יום ' + dayHe[nd] + ' מ-' + hhmm(H[nd][0]) : dayEn[nd] + ' from ' + hhmm(H[nd][0]); }
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-status-mini]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + short; });
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

  // the clock on the hours tile shows Haifa time, like the alarm clock on her altar
  var clock = $('[data-clock]');
  (function () {
    var g = $('.ticks', clock), s = '';
    for (var k = 0; k < 12; k++) { var a = k * Math.PI / 6, r1 = k % 3 ? 38 : 34; s += '<line x1="' + (50 + Math.sin(a) * r1).toFixed(1) + '" y1="' + (50 - Math.cos(a) * r1).toFixed(1) + '" x2="' + (50 + Math.sin(a) * 41).toFixed(1) + '" y2="' + (50 - Math.cos(a) * 41).toFixed(1) + '"/>'; }
    g.innerHTML = s;
  })();
  function tickClock() {
    var n = now(), h = n.h % 12, m = (n.h % 1) * 60;
    $('[data-hh]').setAttribute('transform', 'rotate(' + (h * 30).toFixed(2) + ' 50 50)');
    $('[data-mh]').setAttribute('transform', 'rotate(' + (m * 6).toFixed(2) + ' 50 50)');
  }
  tickClock(); setInterval(tickClock, 20000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 5) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline: two halves of each line slide shut like a seam
  $$('[data-seam] .ln > span[lang]').forEach(function (sp, i) {
    var t = sp.textContent, d = (i % 2) * 180 + 120;
    sp.innerHTML = '<span class="base">' + t + '</span><span class="half t" style="--sd:' + d + 'ms">' + t + '</span><span class="half b" style="--sd:' + (d + 60) + 'ms">' + t + '</span>';
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), wall = $('[data-wall]'), pns = $$('[data-pn]', wall), lampEl = $('[data-lamp]');

  // ---------------------------------------------------------------- the wall: dealt from one stack, then leaning toward the hand
  var deal0 = 0, dealing = false, tilt = { x: 0, y: 0, tx: 0, ty: 0 }, lamp = { x: 0, y: 0, tx: 0, ty: 0 }, lampOn = false;
  function dealWall() {
    if (still()) { hero.classList.add('dealt'); return; }
    deal0 = performance.now(); dealing = true; hero.classList.add('dealt'); kickHero();
  }
  // every panel's transform, from the deal, the hand and the scroll (the outer panels part as you leave)
  function placeWall(t) {
    var calm = still(), W = wall.clientWidth, hr = hero.getBoundingClientRect(), leave = calm ? 0 : clamp(-hr.top / (hr.height * .8), 0, 1);
    var order = [0, 4, 1, 3, 2];  // dealt outer first, the room last
    pns.forEach(function (p, i) {
      if (calm) { p.style.transform = ''; p.style.opacity = ''; return; }
      var k = order.indexOf(i), e = dealing ? smooth((t - deal0 - k * 170) / 750) : 1;
      var c = i - 2, sx = -c * (p.offsetLeft - W / 2 + p.offsetWidth / 2) / (c || 1);   // where the stack sits: the middle
      var homeX = (p.offsetLeft + p.offsetWidth / 2) - W / 2;
      var dx = lerp(-homeX, 0, e), dy = lerp(40 + k * -6, 0, e), rot = lerp((k - 2) * 7, 0, e), sc = lerp(.8, 1, e);
      var ry = tilt.x * 10 * (1 - Math.abs(c) * .15), rx = -tilt.y * 7;
      var part = c * leave * W * .22, lift = Math.abs(c) * leave * 60, fade = 1 - Math.abs(c) * leave * .35;
      p.style.transform = 'translate3d(' + (dx + part).toFixed(1) + 'px,' + (dy + lift - (c === 0 ? leave * 20 : 0)).toFixed(1) + 'px,0) rotate(' + (rot + c * leave * 4).toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) rotateX(' + rx.toFixed(2) + 'deg) scale(' + (sc * (c === 0 ? 1 + leave * .08 : 1)).toFixed(3) + ')';
      p.style.opacity = e < 1 ? clamp(e * 2.5, 0, 1).toFixed(3) : fade.toFixed(3);
      p.style.zIndex = c === 0 ? 5 : 4 - Math.abs(c);
      p.style.setProperty('--sx', (50 + tilt.x * 40).toFixed(1) + '%'); p.style.setProperty('--sy', (30 + tilt.y * 30).toFixed(1) + '%');
    });
    if (dealing && t - deal0 > 750 + 4 * 170) dealing = false;
  }
  var heroRaf = 0, heroVis = true, autoT = 0;
  function heroFrame(t) {
    heroRaf = 0; if (still()) { placeWall(t); return; }
    // on phones and when the hand is away, the lamp drifts by itself
    if (!lampOn) { autoT = t / 1000; lamp.tx = hero.clientWidth * (.5 + Math.sin(autoT * .5) * .32); lamp.ty = hero.clientHeight * (.55 + Math.cos(autoT * .37) * .22); tilt.tx = Math.sin(autoT * .5) * .5; tilt.ty = Math.cos(autoT * .37) * .3; }
    lamp.x = lerp(lamp.x, lamp.tx, .08); lamp.y = lerp(lamp.y, lamp.ty, .08);
    tilt.x = lerp(tilt.x, tilt.tx, .08); tilt.y = lerp(tilt.y, tilt.ty, .08);
    lampEl.style.transform = 'translate3d(' + lamp.x.toFixed(1) + 'px,' + lamp.y.toFixed(1) + 'px,0)';
    placeWall(t);
    if (heroVis) heroRaf = requestAnimationFrame(heroFrame);
  }
  function kickHero() { if (!heroRaf) heroRaf = requestAnimationFrame(heroFrame); }
  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var r = hero.getBoundingClientRect(); lampOn = true;
    lamp.tx = e.clientX - r.left; lamp.ty = e.clientY - r.top;
    var wr = wall.getBoundingClientRect();
    tilt.tx = clamp((e.clientX - (wr.left + wr.width / 2)) / (wr.width / 2), -1, 1); tilt.ty = clamp((e.clientY - (wr.top + wr.height / 2)) / (wr.height / 2), -1, 1);
  });
  hero.addEventListener('pointerleave', function () { lampOn = false; });
  watch(hero, function (v) { heroVis = v; if (v) kickHero(); });

  // ---------------------------------------------------------------- petals shed by the real logo's own orchids
  var petals = (function () {
    var cv = $('[data-petals]'), c = cv.getContext('2d'), img = $('[data-logo]'), src = [], P = [], w, h, raf = 0, vis = true, mx = -999, my = -999, ok = false, last = 0;
    function sample() {
      try {
        var sc = document.createElement('canvas'), iw = 190, ih = 113; sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data; src = [];
        for (var y = 0; y < ih * .55; y++) for (var x = 0; x < iw; x++) {
          var k = (y * iw + x) * 4; if (d[k + 3] < 200) continue;
          var r = d[k], g = d[k + 1], b = d[k + 2];
          if (r > 200 && b > 150 && r - g > 18) src.push([x / iw, y / ih, 'rgb(' + r + ',' + g + ',' + b + ')']);   // petal pinks and ivories
        }
        ok = src.length > 20;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function spawn(n) {
      var lr = img.getBoundingClientRect(), hr = hero.getBoundingClientRect();
      for (var i = 0; i < n; i++) {
        var s = src[Math.floor(Math.random() * src.length)];
        P.push({ x: lr.left - hr.left + s[0] * lr.width, y: lr.top - hr.top + s[1] * lr.height, vx: (Math.random() - .5) * .5 + (rtl() ? -.25 : .25), vy: -Math.random() * .4 - .05, a: Math.random() * 6.28, va: (Math.random() - .5) * .04, s: 3 + Math.random() * 5, col: s[2], life: 0, max: 600 + Math.random() * 500, ph: Math.random() * 6.28 });
      }
    }
    function frame(t) {
      raf = 0; if (!ok || still()) { c.clearRect(0, 0, w, h); return; }
      var dt = last ? Math.min(3, (t - last) / 16.7) : 1; last = t;
      if (P.length < (phone() ? 70 : 140) && Math.random() < .35 * dt) spawn(1);
      c.clearRect(0, 0, w, h);
      for (var i = P.length - 1; i >= 0; i--) {
        var p = P[i]; p.life += dt;
        p.vy += .006 * dt; p.vx += Math.sin(t / 900 + p.ph) * .006 * dt;
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { var f = (14000 - d2) / 14000 * .6, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
        p.vx *= .985; p.vy *= .985; p.vy = Math.min(p.vy, .9);
        p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt;
        var al = Math.min(1, p.life / 40) * Math.max(0, 1 - p.life / p.max);
        if (al <= 0 || p.y > h + 20 || p.x < -30 || p.x > w + 30) { P.splice(i, 1); continue; }
        c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.globalAlpha = al * .9;
        c.fillStyle = p.col; c.beginPath(); c.ellipse(0, 0, p.s, p.s * .55, 0, 0, 6.283); c.fill();
        c.fillStyle = 'rgba(210,88,143,.55)'; c.beginPath(); c.ellipse(-p.s * .45, 0, p.s * .3, p.s * .2, 0, 0, 6.283); c.fill();
        c.restore();
      }
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf && !still()) { last = 0; raf = requestAnimationFrame(frame); } else if (still() && ok) c.clearRect(0, 0, w, h); }
    function start() { size(); sample(); if (ok && !still()) spawn(26); kick(); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) { if (ok && !still()) { var r = hero.getBoundingClientRect(); for (var i = 0; i < 8; i++) P.push({ x: e.clientX - r.left, y: e.clientY - r.top, vx: (Math.random() - .5) * 3, vy: (Math.random() - .5) * 3, a: Math.random() * 6, va: .05, s: 3 + Math.random() * 4, col: src.length ? src[Math.floor(Math.random() * src.length)][2] : '#efafcb', life: 0, max: 400, ph: 0 }); kick(); } });
    watch(hero, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // ---------------------------------------------------------------- the room: the middle panel opens to full screen, the lamp walks the room
  var room = $('[data-room]'), rbox = $('[data-rbox]'), rimg = $('[data-rimg]'), rdark = $('[data-rdark]'), rcopy = $('[data-rcopy]'), spots = $$('.spot'), IW = 1200, IHt = 1600;
  function decode(el, txt, thai) {
    clearInterval(el._t);
    if (still()) { el.textContent = txt; return; }
    var glyphs = (thai || 'สวัสดีค่ะกขคงจฉชซ') + 'ابגדהו', n = 0, total = txt.length;
    el._t = setInterval(function () {
      n += 1.2; var out = '';
      for (var i = 0; i < total; i++) out += i < n - 4 ? txt[i] : (txt[i] === ' ' ? ' ' : glyphs[Math.floor(Math.random() * glyphs.length)]);
      el.textContent = out; if (n - 4 >= total) { el.textContent = txt; clearInterval(el._t); }
    }, 28);
  }
  function spotOn(sp, on) {
    if (on === sp.classList.contains('on')) return;
    sp.classList.toggle('on', on);
    var tag = $('.tag', sp);
    if (!on) { clearInterval(tag._t); tag.textContent = ''; return; }
    decode(tag, sp.dataset[he() ? 'he' : 'en'], sp.dataset.thai);
  }
  spots.forEach(function (sp) { sp.addEventListener('click', function () { sp._pin = !sp.classList.contains('on'); spotOn(sp, sp._pin); }); });
  var spotXY = [];
  function placeSpots() {
    var W = rbox.clientWidth, Hh = rbox.clientHeight, s = Math.max(W / IW, Hh / IHt), dw = IW * s, dh = IHt * s, ox = (W - dw) * .5, oy = (Hh - dh) * .18;
    spotXY = spots.map(function (sp) {
      var x = ox + dw * +sp.dataset.x, y = oy + dh * +sp.dataset.y;
      sp.style.left = x + 'px'; sp.style.top = y + 'px';
      sp.classList.toggle('flip', x > W * .55);
      sp.hidden = x < 16 || x > W - 16 || y < 100 || y > Hh - 40;
      return [x, y];
    });
  }
  function roomUpdate(calm, vh) {
    if (calm) {
      rbox.style.cssText = ''; rbox.classList.add('full'); rdark.style.cssText = ''; rcopy.style.cssText = '';
      placeSpots(); spots.forEach(function (sp) { spotOn(sp, true); }); return;
    }
    var r = room.getBoundingClientRect(), range = r.height - vh, p = clamp(-r.top / range, 0, 1), W = innerWidth;
    // from the size of the hero's middle panel to the whole screen
    var g = smooth(p / .18), pw = Math.min(W * (phone() ? .42 : .26), 330), ph = pw * 1.5;
    var bw = lerp(pw, W, g), bh = lerp(ph, vh, g), bx = (W - bw) / 2, by = lerp((vh - ph) / 2 + vh * .06, 0, g);
    rbox.style.width = bw.toFixed(1) + 'px'; rbox.style.height = bh.toFixed(1) + 'px';
    rbox.style.transform = 'translate3d(' + bx.toFixed(1) + 'px,' + by.toFixed(1) + 'px,0)';
    rbox.style.borderRadius = lerp(16, 0, g).toFixed(1) + 'px';
    rbox.classList.toggle('full', g > .98);
    if (Math.abs((rbox._w || 0) - bw) > .5 || Math.abs((rbox._h || 0) - bh) > .5) { rbox._w = bw; rbox._h = bh; placeSpots(); }
    // the lamp goes down, a warm light walks from one thing to the next
    var dk = smooth((p - .18) / .04), seg = (p - .22) / .2, n = spots.length, idx = clamp(Math.floor(seg * n), 0, n - 1), f = smooth((seg * n) - idx);
    var a = spotXY[idx] || [bw / 2, bh / 2], b = spotXY[Math.min(n - 1, idx + 1)] || a, lx, ly;
    if (seg < 0) { lx = a[0]; ly = a[1]; } else if (seg >= 1) { lx = bw / 2; ly = bh * .45; } else { var mv = smooth((f - .55) / .45); lx = lerp(a[0], b[0], mv); ly = lerp(a[1], b[1], mv); }
    var rad = seg >= 1 ? lerp(220, Math.max(bw, bh), smooth((p - .42) / .07)) : (phone() ? 160 : 270);
    rdark.style.background = 'rgba(24,7,13,' + (.86 * dk).toFixed(3) + ')';
    var mask = 'radial-gradient(circle ' + rad.toFixed(0) + 'px at ' + lx.toFixed(0) + 'px ' + ly.toFixed(0) + 'px, transparent 0, rgba(0,0,0,.15) 45%, #000 100%)'; // taste-skill-ignore: the lamp's light is a soft mask
    rdark.style.webkitMaskImage = mask; rdark.style.maskImage = mask;
    spots.forEach(function (sp, i) { if (sp._pin) return; spotOn(sp, !sp.hidden && seg >= i / n + .02); });
    var cp = smooth((p - .44) / .06);
    rcopy.style.opacity = cp.toFixed(3); rcopy.style.transform = 'translateY(' + ((1 - cp) * 24).toFixed(1) + 'px)';
  }

  // ---------------------------------------------------------------- treatments: the picture changes and breathes with each row
  var tstage = $('[data-tstage]'), timg = $('[data-timg]'), timg2 = $('[data-timg2]'), fx = $('[data-fx]'), tcap = $('[data-tcap]'), rows = $$('.t-row'), cur = rows[0], front = timg;
  function caption() { if (cur) tcap.textContent = cur.dataset[he() ? 'capHe' : 'capEn']; }
  function pickRow(row, fromUser) {
    if (row === cur && !fromUser) return;
    rows.forEach(function (r) { r.setAttribute('aria-pressed', r === row ? 'true' : 'false'); });
    var changed = row !== cur; cur = row; caption();
    tstage.className = 't-stage fx-' + row.dataset.fx;
    var fh = $('.t-frame', tstage).clientHeight; fx.style.setProperty('--fh', (fh * .48).toFixed(0) + 'px');
    if (changed) {
      var back = front === timg ? timg2 : timg;
      back.src = row.dataset.img; back.style.objectPosition = row.dataset.pos;
      back.classList.remove('wipe'); void back.offsetWidth;
      back.classList.add('on', 'wipe'); back.style.zIndex = 1; front.style.zIndex = 0;
      var old = front; front = back;
      setTimeout(function () { if (old !== front) old.classList.remove('on', 'wipe'); }, 900);
    }
    if (fromUser) { var r = $('input[name="t"][value="' + row.dataset.t + '"]'); if (r) { r.checked = true; write(); } }
  }
  timg.style.objectPosition = rows[0].dataset.pos; tstage.classList.add('fx-' + rows[0].dataset.fx); caption();
  rows.forEach(function (r) {
    r.addEventListener('click', function () { r._user = true; pickRow(r, true); });
    if (fine) r.addEventListener('mouseenter', function () { pickRow(r, false); });
  });
  // on scroll, the row crossing the middle of the screen takes the stage
  function treatScroll() {
    if (fine && innerWidth > 900) return;
    var mid = innerHeight * .62, best = null, bd = 1e9;
    rows.forEach(function (r) { var b = r.getBoundingClientRect(); if (b.bottom < 0 || b.top > innerHeight) return; var d = Math.abs(b.top + b.height / 2 - mid); if (d < bd) { bd = d; best = r; } });
    if (best) pickRow(best, false);
  }

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

  // ---------------------------------------------------------------- write: the voucher composes the WhatsApp message
  var voucher = $('[data-voucher]'), msgEl = $('[data-msg]'), press = $('[data-press]'), pout = $('[data-pout]'), steps = $$('[data-step]'), shown = '', typing = 0, chatSeen = false;
  var T = {
    thai: ['עיסוי תאילנדי מסורתי', 'a traditional Thai massage'], oil: ['עיסוי שמנים', 'an oil massage'], herbal: ['עיסוי צמחי מרפא', 'a herbal compress massage'],
    stones: ['עיסוי באבנים חמות', 'a hot stone massage'], foot: ['עיסוי רגליים', 'a foot massage'], deep: ['עיסוי רקמות עמוק', 'a deep tissue massage'],
    sport: ['עיסוי ספורט', 'a sports massage'], preg: ['עיסוי בהריון', 'a pregnancy massage']
  };
  var PR = [['עדין', 'gentle'], ['בינוני', 'medium'], ['חזק', 'firm']];
  function val(n) { var c = $('input[name="' + n + '"]:checked', voucher); return c ? c.value : ''; }
  function compose() {
    var l = he() ? 0 : 1, t = T[val('t')] || T.thai, d = val('d'), p = PR[+press.value], gift = val('f') === 'gift';
    if (l === 0) {
      var dur = d === '?' ? '' : ' של ' + d + ' דקות';
      return gift ? 'שלום יונג, אשמח לקנות שובר מתנה ל' + t[0] + dur + '. תודה'
                  : 'שלום יונג, אשמח לקבוע ' + t[0] + dur + ', בלחץ ' + p[0] + '. מתי יש לך מקום? תודה';
    }
    var durE = d === '?' ? '' : ', ' + d + ' minutes';
    return gift ? 'Hi Yong, I’d like to buy a gift voucher for ' + t[1] + durE + '. Thank you'
                : 'Hi Yong, I’d like to book ' + t[1] + durE + ', ' + p[1] + ' pressure. When do you have a free slot? Thank you';
  }
  function write(instant) {
    var target = compose();
    pout.textContent = PR[+press.value][he() ? 0 : 1];
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var curS = shown, t0 = performance.now(), del = curS.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 14);
      shown = n < del ? curS.slice(0, curS.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  $$('.v-set', voucher).forEach(function (fs) {
    fs.addEventListener('change', function (e) {
      lightStep(+fs.dataset.stepOf); write();
      if (e.target.name === 't') { var row = $('.t-row[data-t="' + e.target.value + '"]'); if (row) pickRow(row, false); }
    });
  });
  press.addEventListener('input', function () { lightStep(2); write(); });
  voucher.addEventListener('pointermove', function (e) { var r = voucher.getBoundingClientRect(); voucher.style.setProperty('--vx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); voucher.style.setProperty('--vy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); });
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; lightStep(0); shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .35 });
  $('[data-gift]').addEventListener('click', function () { var g = $('input[name="f"][value="gift"]'); g.checked = true; lightStep(3); write(); });

  // ---------------------------------------------------------------- reviews: letter-by-letter fill, one quote at a time
  var quotes = $$('.q'), dots = $$('[data-qdots] i'), qi = 0, qTimer = 0, revs = $('[data-revs]'), revsOn = false, rvphoto = $('[data-rvphoto]');
  function splitQuotes() {
    quotes.forEach(function (q) {
      $$('p[lang]', q).forEach(function (p) {
        if (!p._t) p._t = p.textContent;
        p.innerHTML = p._t.split(' ').map(function (w) { return '<span class="lt">' + w + '</span>'; }).join(' ');
      });
    });
  }
  function fillQuote(q) {
    var p = $('p[lang="' + root.lang + '"]', q), ws = $$('.lt', p);
    ws.forEach(function (w) { w.classList.remove('lit'); clearTimeout(w._t); });
    if (still()) { ws.forEach(function (w) { w.classList.add('lit'); }); return; }
    ws.forEach(function (w, i) { w._t = setTimeout(function () { w.classList.add('lit'); }, 120 + i * 90); });
  }
  function showQuote(i, instant) {
    qi = (i + quotes.length) % quotes.length;
    quotes.forEach(function (q, k) { q.classList.toggle('on', k === qi); });
    dots.forEach(function (d, k) { d.classList.remove('on'); if (k === qi) { void d.offsetWidth; d.classList.add('on'); } });
    fillQuote(quotes[qi]);
    clearTimeout(qTimer);
    if (!still() && revsOn) qTimer = setTimeout(function () { showQuote(qi + 1); }, 7000);
  }
  $('[data-qnext]').addEventListener('click', function () { showQuote(qi + 1); });
  $('[data-qprev]').addEventListener('click', function () { showQuote(qi - 1); });
  watch(revs, function (v) { var was = revsOn; revsOn = v; if (v && !was) showQuote(qi); if (!v) clearTimeout(qTimer); }, { threshold: .25 });
  function revsUpdate(calm, vh) {
    var r = revs.getBoundingClientRect(), W = revs.clientWidth, Hh = revs.clientHeight;
    var p = calm ? 1 : smooth((vh - r.top) / (vh * .85));
    var t, rr, b, l, mob = innerWidth <= 900;
    if (mob) { t = 24; b = Hh - Math.min(W * .78, 440) - 24; l = rr = 16; }
    else { var side = W * .5; t = Hh * .12; b = Hh * .12; if (rtl()) { l = W * .05; rr = side + W * .02; } else { rr = W * .05; l = side + W * .02; } }
    // phone: the photo also settles into its band, full screen first
    rvphoto.style.setProperty('--ct', (t * p).toFixed(1) + 'px'); rvphoto.style.setProperty('--cb', (b * p).toFixed(1) + 'px');
    rvphoto.style.setProperty('--cl', (l * p).toFixed(1) + 'px'); rvphoto.style.setProperty('--cr', (rr * p).toFixed(1) + 'px');
    rvphoto.style.setProperty('--cr2', (24 * p).toFixed(1) + 'px'); rvphoto.style.setProperty('--br', lerp(.42, .95, p).toFixed(3));
  }

  // ---------------------------------------------------------------- bento spotlight
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- one scroll loop
  var dock = $('[data-dock]'), foot = $('[data-foot]'), ftimg = $('.ft-photo img');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) kickHero(); else placeWall(0);
    roomUpdate(calm, vh);
    treatScroll();
    revsUpdate(calm, vh);
    var hb = hero.getBoundingClientRect().bottom, fr = foot.getBoundingClientRect();
    dock.classList.toggle('show', hb < vh * .4 && fr.top > vh * .5);
    if (!calm) foot.style.setProperty('--fp', smooth((vh - fr.top) / vh).toFixed(3));
  }
  function layout() { petals.size(); placeSpots(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { rbox._w = 0; layout(); }, 120); });
  addEventListener('scroll', tick, { passive: true });

  splitQuotes(); texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); dealWall(); kickHero(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { placeSpots(); tick(); });
  window.__yong = true;
})();
