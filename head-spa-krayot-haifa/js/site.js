(function () {
  var root = document.documentElement, WA = '972546808930';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 760; };
  var TITLE = { he: 'ספא ראש קריות · עיסוי ראש אצל אתי · שדרות אח״י אילת 8, חיפה', en: 'Head Spa Krayot · Head massage with Etti · 8 Ahi Eilat Blvd, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור ספא ראש קריות · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Head Spa Krayot · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'ספא ראש קריות', 'Head Spa Krayot');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לאתי, 054-680-8930', 'Call Etti, 054-680-8930');
    aria('[data-t-wa]', 'וואטסאפ לאתי', 'WhatsApp Etti');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: שדרות אח״י אילת 8, חיפה' : 'Map: 8 Ahi Eilat Blvd, Haifa'; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('hsk-lang', l); } catch (e) {}
    texts(l); hours(); fillWords(); compose(true); wordmark(); tick();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('hsk-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    foam.kick(); ripple.kick(); compose(true); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 21], 1: [9, 21], 2: [9, 21], 3: [9, 21], 4: [9, 21], 5: [8, 16.5], 6: null };
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
  // consecutive days with the same hours share a row; the week starts on Sunday
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 6 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- foam: pearl bubbles rising through the candlelight, parting around the hand
  var foam = (function () {
    var cv = $('[data-foam]'), c = cv.getContext('2d'), B = [], w, h, raf = 0, vis = true, mx = -999, my = -999;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 26 : 54; B = [];
      for (var i = 0; i < n; i++) B.push(make(Math.random() * h));
    }
    function make(y) { var r = 3 + Math.pow(Math.random(), 2.2) * 22; return { x: Math.random() * w, y: y, r: r, v: .15 + Math.random() * .35 + r * .01, ph: Math.random() * 6.28, a: .18 + Math.random() * .3, dx: 0 }; }
    function draw(t) {
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < B.length; i++) {
        var b = B[i], x = b.x + Math.sin(t / 1400 + b.ph) * (6 + b.r * .4) + b.dx;
        c.globalAlpha = b.a;
        c.beginPath(); c.arc(x, b.y, b.r, 0, 6.283); c.strokeStyle = '#f6ebe4'; c.lineWidth = 1.2; c.stroke();
        c.fillStyle = 'rgba(246,235,228,.08)'; c.fill();
        c.beginPath(); c.arc(x - b.r * .35, b.y - b.r * .35, b.r * .28, 0, 6.283); c.fillStyle = 'rgba(255,248,240,.75)'; c.fill();
      }
      c.globalAlpha = 1;
    }
    function frame(t) {
      raf = 0;
      if (still()) { draw(0); return; }
      for (var i = 0; i < B.length; i++) {
        var b = B[i]; b.y -= b.v;
        var dx = b.x - mx, dy = b.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 14400) b.dx += (dx > 0 ? 1 : -1) * (14400 - d2) / 14400 * 2.2;
        b.dx *= .96;
        if (b.y < -40) { B[i] = make(h + 30); }
      }
      draw(t);
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    return { size: function () { size(); draw(0); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- the basin's surface: a real height-field ripple over the photo.
  // Light falls on the slopes (soft-light blend), so the photo itself seems to move. Drops under the finger, and by themselves.
  var ripple = (function () {
    var cv = $('[data-ripple]'), c = cv.getContext('2d'), N = 120, A = new Float32Array(N * N), Bf = new Float32Array(N * N), img = c.createImageData(N, N), raf = 0, vis = true, last = 0, lastAuto = 0, drew = false;
    cv.width = N; cv.height = N;
    function drop(x, y, s) {
      var cx = Math.floor(x * N), cy = Math.floor(y * N), R = 3;
      for (var j = -R; j <= R; j++) for (var i = -R; i <= R; i++) {
        var X = cx + i, Y = cy + j; if (X < 1 || Y < 1 || X >= N - 1 || Y >= N - 1) continue;
        var d = Math.sqrt(i * i + j * j); if (d <= R) A[Y * N + X] += s * (1 - d / R) * 420;
      }
    }
    function step() {
      for (var y = 1; y < N - 1; y++) for (var x = 1; x < N - 1; x++) {
        var k = y * N + x;
        Bf[k] = ((A[k - 1] + A[k + 1] + A[k - N] + A[k + N]) / 2 - Bf[k]) * .975;
      }
      var t = A; A = Bf; Bf = t;
    }
    function paint() {
      var d = img.data;
      for (var y = 1; y < N - 1; y++) for (var x = 1; x < N - 1; x++) {
        var k = y * N + x, sx = A[k - 1] - A[k + 1], sy = A[k - N] - A[k + N], s = clamp((sx + sy) * .9, -255, 255), p = k * 4;
        if (s > 0) { d[p] = 255; d[p + 1] = 244; d[p + 2] = 228; d[p + 3] = s; } else { d[p] = 40; d[p + 1] = 14; d[p + 2] = 26; d[p + 3] = -s; }
      }
      c.putImageData(img, 0, 0);
    }
    function frame(t) {
      raf = 0;
      if (still()) { if (drew) { c.clearRect(0, 0, N, N); drew = false; } return; }
      if (t - lastAuto > (phone() ? 1300 : 2200)) { lastAuto = t; drop(.2 + Math.random() * .6, .2 + Math.random() * .6, .8 + Math.random() * .6); }
      step(); paint(); drew = true;
      if (vis) raf = requestAnimationFrame(frame);
    }
    function at(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; }
    cv.addEventListener('pointermove', function (e) { var p = at(e), n = performance.now(); if (n - last > 40) { last = n; drop(p[0], p[1], .45); } });
    cv.addEventListener('pointerdown', function (e) { var p = at(e); drop(p[0], p[1], 1.6); kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    watch(hero, function (v) { vis = v; kick(); });
    // the dealt photos land like drops: each one rings the water
    [500, 880, 1260].forEach(function (ms) { setTimeout(function () { if (!still()) drop(.5, .5, 2.2); }, ms); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 6) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { setTimeout(function () { roll(o, true); }, 60); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- the statement fills word by word as the basin opens
  var fill = $('[data-fill]');
  function fillWords() {
    $$('span[lang]', fill).forEach(function (sp) {
      if (sp.dataset.done) return; sp.dataset.done = 1;
      var parts = [];
      [].slice.call(sp.childNodes).forEach(function (n) {
        var wrapEm = n.nodeType === 1;
        n.textContent.split(/(\s+)/).forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) { parts.push(w); return; }
          parts.push(wrapEm ? '<em class="fw">' + w + '</em>' : '<span class="fw">' + w + '</span>');
        });
      });
      sp.innerHTML = parts.join('');
    });
  }

  // ---------------------------------------------------------------- bento: spotlight, the voucher leans toward the hand
  var menu = $('#menu');
  watch(menu, function (v) { menu.classList.toggle('on', v); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var vt = $('[data-tilt]'), vtile = vt.closest('.tile');
  vtile.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var r = vtile.getBoundingClientRect(); vt.classList.add('held');
    vt.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 22).toFixed(1) + 'deg');
    vt.style.setProperty('--rx', ((.5 - (e.clientY - r.top) / r.height) * 18).toFixed(1) + 'deg');
  });
  vtile.addEventListener('pointerleave', function () { vt.classList.remove('held'); vt.style.removeProperty('--rx'); vt.style.removeProperty('--ry'); });

  // ---------------------------------------------------------------- the voucher composer
  var vTitle = $('[data-vtitle]'), vFor = $('[data-vfor]'), vTr = $('[data-vtr]'), msgEl = $('[data-msg]'), send = $('[data-send]'), voucher = $('[data-voucher]');
  var nameIn = $('[data-name]'), nameField = $('[data-namefield]'), typing = 0, chatSeen = false, shown = '';
  function val(sel) { var x = $$(sel).filter(function (i) { return i.checked; })[0]; return x; }
  function message() {
    var l = he(), gift = val('[data-who]').value === 'gift', tr = val('[data-tr]'), T = tr.dataset[l ? 'he' : 'en'], name = nameIn.value.trim().replace(/\s+/g, ' ');
    var card = {
      title: gift ? (l ? 'שובר מתנה' : 'Gift voucher') : (l ? 'בקשת תור' : 'Booking request'),
      who: gift ? (name ? (l ? 'עבור ' : 'For ') + name : (l ? 'עבור ...' : 'For …')) : (l ? 'בשבילי' : 'For me'),
      tr: T ? (l ? T : T.replace(/^(a |the )/, function (m) { return ''; }).replace(/^./, function (ch) { return ch.toUpperCase(); })) : (l ? 'טיפול לפי המלצה של אתי' : 'A treatment Etti recommends')
    }, m;
    if (l) {
      if (gift) m = T ? 'היי אתי, אשמח לשובר מתנה ל' + T + (name ? ' עבור ' + name : '') + '.' : 'היי אתי, אשמח לשובר מתנה' + (name ? ' עבור ' + name : '') + ', ולהמלצה על טיפול.';
      else m = T ? 'היי אתי, אשמח לקבוע תור ל' + T + '.' : 'היי אתי, אשמח לקבוע תור ולשמוע המלצה על טיפול.';
    } else {
      if (gift) m = T ? 'Hi Etti, I’d like a gift voucher for ' + T + (name ? ' for ' + name : '') + '.' : 'Hi Etti, I’d like a gift voucher' + (name ? ' for ' + name : '') + ', and a treatment recommendation.';
      else m = T ? 'Hi Etti, I’d like to book ' + T + '.' : 'Hi Etti, I’d like to book a treatment and hear what you recommend.';
    }
    return { card: card, msg: m, gift: gift };
  }
  function typeInto(el, txt, instant) {
    clearInterval(el._t);
    if (instant || still()) { el.textContent = txt; return; }
    var cur = el.textContent, keep = 0; while (keep < cur.length && keep < txt.length && cur[keep] === txt[keep]) keep++;
    var i = keep; el.textContent = txt.slice(0, i);
    el._t = setInterval(function () { el.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(el._t); }, 28);
  }
  function compose(instant) {
    var r = message();
    nameField.hidden = !r.gift;
    vTitle.textContent = r.card.title;
    typeInto(vFor, r.card.who, instant); typeInto(vTr, r.card.tr, instant);
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(r.msg);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = r.msg; msgEl.textContent = r.msg; return; }
    var keep = 0; while (keep < shown.length && keep < r.msg.length && shown[keep] === r.msg[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 14);
      shown = n < del ? cur.slice(0, cur.length - n) : r.msg.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== r.msg) typing = requestAnimationFrame(st);
    })(t0);
  }
  function shine() { voucher.classList.remove('shine'); void voucher.offsetWidth; voucher.classList.add('shine'); }
  $$('[data-who],[data-tr]').forEach(function (i) { i.addEventListener('change', function () { compose(); shine(); }); });
  nameIn.addEventListener('input', function () { compose(); });
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; compose(); shine(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- reviews: two copies so the drift loops seamlessly
  var drow = $('[data-drow]');
  $$('.rv', drow).forEach(function (r) { var k = r.cloneNode(true); k.setAttribute('aria-hidden', 'true'); drow.appendChild(k); });

  // ---------------------------------------------------------------- footer wordmark letters
  var word = $('[data-word]'), wch = [];
  function wordmark() {
    $$('span[lang]', word).forEach(function (sp) {
      if (sp.dataset.done) return; sp.dataset.done = 1;
      sp.innerHTML = sp.textContent.split('').map(function (ch) { return ch === ' ' ? ' ' : '<span class="ch">' + ch + '</span>'; }).join('');
    });
    wch = $$('span[lang="' + root.lang + '"] .ch', word);
    var avail = word.parentNode.clientWidth; word.style.fontSize = ''; var fs = parseFloat(getComputedStyle(word).fontSize);
    var w = word.scrollWidth; if (w > avail) word.style.fontSize = (fs * avail / w * .98) + 'px';
  }

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var open = $('[data-open]'), ophoto = $('[data-ophoto]'), visit = $('[data-visit]'), vphoto = $('[data-vphoto]'), vcards = $$('[data-vcards] > *'), towels = $$('.towel'), dock = $('[data-dock]'), foot = $('[data-foot]');
  var hA = true, hC = true, heroActs = true; watch($('.h-acts'), function (v) { hA = v; heroActs = hA || hC; tick(); }); watch($('.h-chips'), function (v) { hC = v; heroActs = hA || hC; tick(); });
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // the basin opens to full screen; the line fills word by word
    var op = calm ? 1 : prog(open), e = smooth(op / .55);
    var r0 = phone() ? 30 : 22;
    ophoto.style.setProperty('--cr', calm ? '75%' : lerp(r0, 75, e).toFixed(2) + '%');
    ophoto.style.setProperty('--cs', calm ? '1' : lerp(1.18, 1, e).toFixed(3));
    var fw = $$('span[lang="' + root.lang + '"] .fw', fill);
    fw.forEach(function (w, i) { var t = calm ? 1 : clamp((op - .3 - i * (.4 / fw.length)) / .12, 0, 1); w.style.opacity = (.18 + .82 * t).toFixed(3); });
    // towels: the one underneath sinks a little as the next lands on it
    towels.forEach(function (tw, i) {
      if (calm || i === towels.length - 1) { tw.style.transform = ''; tw.style.filter = ''; return; }
      var nx = towels[i + 1].getBoundingClientRect(), me = tw.getBoundingClientRect(), cover = clamp(1 - (nx.top - me.top) / Math.max(1, me.height), 0, 1);
      tw.style.transform = cover > 0 ? 'scale(' + (1 - cover * .06).toFixed(4) + ')' : '';
      tw.style.filter = cover > 0 ? 'brightness(' + (1 - cover * .25).toFixed(3) + ')' : '';
    });
    // visit: the candle photo settles from big into its frame; the cards rise beside it
    var vr = visit.getBoundingClientRect(), vp = calm ? 1 : smooth((vh - vr.top) / (vh * .9));
    vphoto.style.setProperty('--vs', calm ? '1' : lerp(1.32, 1, vp).toFixed(4));
    vphoto.style.setProperty('--vr', calm ? '28px' : lerp(0, 28, vp).toFixed(1) + 'px');
    vcards.forEach(function (c, i) { var t = calm ? 1 : smooth((vp - .35 - i * .12) / .35); c.style.setProperty('--vo', t.toFixed(3)); c.style.setProperty('--vy', ((1 - t) * 30).toFixed(1) + 'px'); });
    // footer: the name rises letter by letter as the page lifts off it
    var mb = $('main').getBoundingClientRect().bottom, fp = calm ? 1 : clamp((vh - mb) / foot.offsetHeight, 0, 1);
    wch.forEach(function (ch, i) { var t = calm ? 1 : smooth(fp * 1.6 - i * .05); ch.style.setProperty('--ty', ((1 - t) * 0.9).toFixed(3) + 'em'); });
    // the pebbles step aside over the footer
    dock.classList.toggle('hide', heroActs || mb < vh * .75);
  }

  function layout() { foam.size(); wordmark(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); fillWords(); compose(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { go(); wordmark(); tick(); });
  setTimeout(go, 900);
  addEventListener('load', tick);
})();
