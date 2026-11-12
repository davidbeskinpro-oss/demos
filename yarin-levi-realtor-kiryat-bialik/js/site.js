(function () {
  var root = document.documentElement, WA = '972504567763';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var wide = function () { return innerWidth >= 1000; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'ירין לוי · סוכן נדל״ן ומלווה משקיעים · יגאל בשן 2, קריית ביאליק', en: 'Yarin Levi · Real-estate agent & investor guide · 2 Yigal Bashan, Kiryat Bialik' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור ירין לוי סוכן נדל״ן ומלווה משקיעים · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Yarin Levi, real-estate agent & investor guide · This is not the business’s official website' };
  var CAPS = [
    ['המפרץ והקריות, ממרפסת בכרמל', 'The bay and the Krayot, from a Carmel balcony'],
    ['חלון בקריית ביאליק', 'A window in Kiryat Bialik'],
    ['הקריות מלמעלה', 'The Krayot from above'],
    ['מפרץ חיפה וחוף הגליל', 'Haifa Bay and the Galilee coast'],
    ['הקריות מהמפרץ', 'The Krayot from the bay']
  ];

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'ירין לוי נדל״ן', 'Yarin Levi Real Estate');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-stage]', 'תמונות', 'Photos');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-call]', 'התקשרו לירין, 050-456-7763', 'Call Yarin, 050-456-7763');
    aria('[data-t-wa]', 'וואטסאפ לירין', 'WhatsApp Yarin');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: יגאל בשן 2, קריית ביאליק' : 'Map: 2 Yigal Bashan, Kiryat Bialik'; });
    capEl.textContent = CAPS[scene][l === 'he' ? 0 : 1];
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('yl-lang', l); } catch (e) {}
    texts(l); hours(); fillSelects(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('yl-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-row],[data-stamp],[data-lt]').forEach(function (el) { el.classList.add('in'); });
    frame.classList.add('toned'); tone.clear();
    layout(); sign.kick(); loupe.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed, [0,24] = all day
  var H = { 0: [0, 24], 1: [0, 24], 2: [0, 24], 3: [0, 24], 4: [0, 24], 5: [0, 24], 6: [0, 24] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var allDay = function (t) { return t && t[0] === 0 && t[1] === 24; };
  var hhmm = function (x) { var h = Math.floor(x) % 24, m = Math.round((x - Math.floor(x)) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
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
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', i * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-lt]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // letters: the name in the hero and the footer wordmark
  function splitChars(sp, cls) {
    var i = 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  }
  $$('.h-name .ln > span[lang]').forEach(function (sp) { splitChars(sp); });
  $$('[data-fword] > span[lang]').forEach(function (sp) { splitChars(sp); });

  // odometer
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 6) % 10; s.style.transitionDelay = go ? (600 + i * 180) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }

  var conceptEl = $('[data-concept]'), hero = $('[data-hero]'), nav = $('[data-nav]'), frame = $('[data-frame]'), scenes = $$('[data-scene]', frame), capEl = $('[data-cap]');
  var shutter = $('[data-shutter]'), chapters = $$('[data-chapter]'), scene = 0;

  // ---------------------------------------------------------------- the stage's caption decodes out of scrambled letters
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHJKLMNPRSTUVWXYZ' };
  function decode(el, txt) {
    clearInterval(el._t);
    if (still()) { el.textContent = txt; return; }
    var g = GL[he() ? 'he' : 'en'], t0 = performance.now();
    el._t = setInterval(function () {
      var p = (performance.now() - t0) / 520, n = Math.floor(p * txt.length), out = '';
      for (var i = 0; i < txt.length; i++) out += i < n || txt[i] === ' ' || txt[i] === ',' ? txt[i] : g[Math.floor(Math.random() * g.length)];
      el.textContent = out;
      if (p >= 1) { clearInterval(el._t); el.textContent = txt; }
    }, 40);
  }
  function showScene(k) {
    if (k === scene) return;
    scene = k;
    scenes.forEach(function (s) { s.classList.toggle('on', +s.dataset.scene === k); });
    decode(capEl, CAPS[k][he() ? 0 : 1]);
  }

  // ---------------------------------------------------------------- halftone: the stage develops out of printed dots, and a print lens follows the hand
  var tone = (function () {
    var cv = $('[data-tone]'), c = cv.getContext('2d'), w = 0, h = 0, dpr = 1, cell = 9, grids = {}, raf = 0, t0 = 0, intro = false, lens = null, lensA = 0, face = [0, 0];
    function size() { dpr = Math.min(2, devicePixelRatio || 1); w = frame.clientWidth; h = frame.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); grids = {}; cell = wide() ? 9 : 7; }
    // draw an <img> into ctx as the CSS lays it out (object-fit cover inside its own box)
    function drawCover(ctx, img, pos) {
      var fr = frame.getBoundingClientRect(), r = img.getBoundingClientRect(), iw = img.naturalWidth, ih = img.naturalHeight;
      if (!iw) return;
      var s = Math.max(r.width / iw, r.height / ih), dw = iw * s, dh = ih * s;
      ctx.drawImage(img, r.left - fr.left + (r.width - dw) * pos[0], r.top - fr.top + (r.height - dh) * pos[1], dw, dh);
    }
    function grid(k) {
      if (grids[k]) return grids[k];
      var cols = Math.ceil(w / cell), rows = Math.ceil(h / cell), oc = document.createElement('canvas');
      oc.width = cols; oc.height = rows;
      var ox = oc.getContext('2d'); ox.scale(cols / w, rows / h);
      ox.fillStyle = '#1a0f12'; ox.fillRect(0, 0, w, h);
      var sc = scenes[k], bg = $('.s-bg', sc), man = $('.s-man', sc);
      drawCover(ox, bg, k === 0 ? [.5, .4] : k === 2 ? [.4, .5] : [.5, .5]);
      if (man) { var fr = frame.getBoundingClientRect(), r = man.getBoundingClientRect(); ox.drawImage(man, r.left - fr.left, r.top - fr.top, r.width, r.height); face = [r.left - fr.left + r.width * .5, r.top - fr.top + r.height * .22]; }
      var d = ox.getImageData(0, 0, cols, rows).data;   // throws on file:// — the caller falls back to the plain photo
      return (grids[k] = { cols: cols, rows: rows, d: d });
    }
    function dots(g, fn) {
      for (var y = 0; y < g.rows; y++) for (var x = 0; x < g.cols; x++) {
        var k = (y * g.cols + x) * 4, R = g.d[k], G = g.d[k + 1], B = g.d[k + 2], lum = (R * .3 + G * .59 + B * .11) / 255;
        var cx = x * cell + cell / 2, cy = y * cell + cell / 2, a = fn(cx, cy);
        if (a <= 0) continue;
        var rad = cell * .56 * Math.sqrt(lum) * a;
        if (rad < .35) continue;
        c.fillStyle = 'rgb(' + Math.min(255, R + 30) + ',' + Math.min(255, G + 18) + ',' + B + ')';
        c.beginPath(); c.arc(cx, cy, rad, 0, 6.2832); c.fill();
      }
    }
    function clear() { cancelAnimationFrame(raf); raf = 0; intro = false; lens = null; c.clearRect(0, 0, w, h); cv.style.opacity = ''; }
    function introFrame(t) {
      raf = 0;
      var T = (t - t0) / 1000, g;
      try { g = grid(0); } catch (e) { frame.classList.add('toned'); clear(); return; }
      c.clearRect(0, 0, w, h);
      c.fillStyle = '#1a0f12'; c.fillRect(0, 0, w, h);
      var maxD = Math.hypot(w, h);
      dots(g, function (x, y) { var dd = Math.hypot(x - face[0], y - face[1]) / maxD; return smooth((T - dd * 1.1) / .5); });
      if (T > 1.05 && !frame.classList.contains('toned')) frame.classList.add('toned');
      cv.style.opacity = String(1 - smooth((T - 1.15) / .6));
      if (T < 1.8) raf = requestAnimationFrame(introFrame); else { intro = false; c.clearRect(0, 0, w, h); cv.style.opacity = ''; }
    }
    function lensFrame() {
      raf = 0; c.clearRect(0, 0, w, h);
      if (!lens || still()) return;
      var g; try { g = grid(scene); } catch (e) { return; }
      var R = wide() ? 96 : 80, A = lensA;
      c.save(); c.beginPath(); c.arc(lens[0], lens[1], R, 0, 6.2832); c.clip();
      c.fillStyle = 'rgba(26,15,18,' + (.92 * A) + ')'; c.fillRect(lens[0] - R, lens[1] - R, R * 2, R * 2);
      dots(g, function (x, y) { var dd = Math.hypot(x - lens[0], y - lens[1]) / R; return A * smooth((1 - dd) / .25); });
      c.restore();
      c.strokeStyle = 'rgba(246,196,28,' + (.8 * A) + ')'; c.lineWidth = 2; c.beginPath(); c.arc(lens[0], lens[1], R, 0, 6.2832); c.stroke();
    }
    function start() {
      size();
      if (still()) { frame.classList.add('toned'); return; }
      intro = true; t0 = performance.now(); raf = requestAnimationFrame(introFrame);
    }
    var fade = 0;
    function setLens(x, y, on) {
      if (intro || still()) return;
      if (on) { lens = [x, y]; lensA = 1; } else lensA = 0;
      if (!raf) raf = requestAnimationFrame(lensFrame);
    }
    frame.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = frame.getBoundingClientRect(); setLens(e.clientX - r.left, e.clientY - r.top, true); });
    frame.addEventListener('pointerleave', function () { setLens(0, 0, false); });
    frame.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') return; var r = frame.getBoundingClientRect(); setLens(e.clientX - r.left, e.clientY - r.top, true); clearTimeout(fade); fade = setTimeout(function () { setLens(0, 0, false); }, 1400); });
    return { start: start, size: function () { size(); }, clear: clear, redraw: function () { if (lens && lensA) setLens(lens[0], lens[1], true); } };
  })();

  // ---------------------------------------------------------------- the hanging sign: a real pendulum, pushed by the hand, the scroll and a little wind
  var sign = (function () {
    var el = $('[data-sign]'), hang = $('[data-hang]'), th = .05, om = 0, raf = 0, vis = true, last = 0, lx = null, T = 0;
    function frameFn(t) {
      raf = 0;
      if (still()) { el.style.transform = ''; return; }
      var dt = last ? Math.min(.04, (t - last) / 1000) : .016; last = t; T += dt;
      var wind = Math.sin(T * 1.3) * .35 + Math.sin(T * .53 + 1) * .25;
      om += (-22 * th - 1.1 * om + wind) * dt; th += om * dt; th = clamp(th, -.6, .6);
      el.style.transform = 'rotate(' + (th * 57.3).toFixed(2) + 'deg)';
      if (vis) raf = requestAnimationFrame(frameFn);
    }
    function kick() { if (!raf && !still()) { last = 0; raf = requestAnimationFrame(frameFn); } }
    hang.addEventListener('pointermove', function (e) { if (lx !== null) om += clamp((e.clientX - lx) * .02, -.8, .8); lx = e.clientX; kick(); });
    hang.addEventListener('pointerleave', function () { lx = null; });
    hang.addEventListener('pointerdown', function () { om += .9; kick(); });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { kick: kick, push: function (v) { om += v; } };
  })();

  // ---------------------------------------------------------------- the bento: spotlight under the hand, and a loupe over the Krayot
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var who = $('#who'); watch(who, function (v) { who.classList.toggle('on', v); });
  var loupe = (function () {
    var tile = $('[data-loupe]'), lens = $('[data-lens]', tile), img = $('img', tile), Z = 2.3, held = false, raf = 0, vis = false, T = 0, last = 0;
    function place(cx, cy) {
      var w = tile.clientWidth, h = tile.clientHeight, R = lens.offsetWidth / 2, iw = 1400, ih = 928, s = Math.max(w / iw, h / ih), dw = iw * s, dh = ih * s, ox = (w - dw) / 2, oy = (h - dh) / 2;
      cx = clamp(cx, R * .6, w - R * .6); cy = clamp(cy, R * .6, h - R * .6);
      lens.style.setProperty('--lx', (cx - R).toFixed(1) + 'px'); lens.style.setProperty('--ly', (cy - R).toFixed(1) + 'px');
      lens.style.backgroundSize = (dw * Z).toFixed(0) + 'px ' + (dh * Z).toFixed(0) + 'px';
      lens.style.backgroundPosition = (-((cx - ox) * Z - R)).toFixed(1) + 'px ' + (-((cy - oy) * Z - R)).toFixed(1) + 'px';
    }
    function auto(t) {
      raf = 0; if (held || !vis) return;
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t; if (!still()) T += dt;
      var w = tile.clientWidth, h = tile.clientHeight;
      place(w * (.5 + .32 * Math.sin(T * .45)), h * (.42 + .22 * Math.sin(T * .7 + 1)));
      if (!still()) raf = requestAnimationFrame(auto);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(auto); } }
    tile.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; held = true; var r = tile.getBoundingClientRect(); place(e.clientX - r.left, e.clientY - r.top); });
    tile.addEventListener('pointerleave', function () { held = false; kick(); });
    tile.addEventListener('pointerdown', function (e) { var r = tile.getBoundingClientRect(); held = true; place(e.clientX - r.left, e.clientY - r.top); setTimeout(function () { held = false; kick(); }, 1800); });
    watch(tile, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- composer: blanks in one sentence, typeset as a classified ad
  var F = {
    act: [['sell', 'למכור', 'sell'], ['buy', 'לקנות', 'buy'], ['invest', 'להשקיע ב', 'invest in']],
    kind: [['apt', 'דירה', 'apartment'], ['house', 'בית פרטי', 'house'], ['garden', 'דירת גן', 'garden apartment']],
    rooms: [['3', '2–3 חדרים', '2–3 rooms'], ['4', '4 חדרים', '4 rooms'], ['5', '5 חדרים ומעלה', '5+ rooms'], ['x', 'גודל פתוח', 'any size']],
    where: [['haifa', 'בחיפה', 'in Haifa', 'חיפה', 'Haifa'], ['bialik', 'בקריית ביאליק', 'in Kiryat Bialik', 'קריית ביאליק', 'Kiryat Bialik'], ['motzkin', 'בקריית מוצקין', 'in Kiryat Motzkin', 'קריית מוצקין', 'Kiryat Motzkin'], ['yam', 'בקריית ים', 'in Kiryat Yam', 'קריית ים', 'Kiryat Yam'], ['ata', 'בקריית אתא', 'in Kiryat Ata', 'קריית אתא', 'Kiryat Ata'], ['area', 'בסביבה', 'in the area', 'חיפה והסביבה', 'Haifa and around']]
  };
  var sel = {}, pick = { act: 'sell', kind: 'apt', rooms: '4', where: 'bialik' };
  $$('[data-f]').forEach(function (s) { sel[s.dataset.f] = s; s.addEventListener('change', function () { pick[s.dataset.f] = s.value; write(); }); });
  function fillSelects() {
    var l = he() ? 1 : 2;
    Object.keys(F).forEach(function (k) { sel[k].innerHTML = F[k].map(function (o) { return '<option value="' + o[0] + '"' + (pick[k] === o[0] ? ' selected' : '') + '>' + o[l] + '</option>'; }).join(''); });
  }
  var get = function (k) { return F[k].filter(function (o) { return o[0] === pick[k]; })[0]; };
  function compose() {
    var a = get('act'), k = get('kind'), r = get('rooms'), w = get('where'), l = he();
    if (l) {
      var room = r[0] === 'x' ? '' : ' של ' + r[1];
      var title = (a[0] === 'sell' ? 'למכירה: ' : a[0] === 'buy' ? 'מחפשים לקנות: ' : 'השקעה: ') + k[1] + (r[0] === 'x' ? '' : ', ' + r[1]) + ', ' + w[3];
      return { t: title, m: 'היי ירין, אני רוצה ' + a[1] + (a[0] === 'invest' ? '' : ' ') + k[1] + room + ' ' + w[1] + '. אשמח לדבר.' };
    }
    var art = /^[aeiou]/i.test(k[2]) ? 'an ' : 'a ', roomE = r[0] === 'x' ? '' : ' with ' + r[2];
    var titleE = (a[0] === 'sell' ? 'For sale: ' : a[0] === 'buy' ? 'Looking to buy: ' : 'Investment: ') + k[2] + (r[0] === 'x' ? '' : ', ' + r[2]) + ', ' + w[4];
    return { t: titleE, m: 'Hi Yarin, I’d like to ' + a[2] + ' ' + art + k[2] + roomE + ' ' + w[2] + '. Could we talk?' };
  }
  var adT = $('[data-adt]'), msgEl = $('[data-msg]'), shown = '', typing = 0, seen = false;
  function write(instant) {
    var o = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(o.m);
    msgEl.textContent = o.m;
    cancelAnimationFrame(typing);
    if (instant || still() || !seen) { shown = o.t; adT.textContent = o.t; return; }
    var keep = 0; while (keep < shown.length && keep < o.t.length && shown[keep] === o.t[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 22);
      shown = n < del ? cur.slice(0, cur.length - n) : o.t.slice(0, keep + (n - del));
      adT.textContent = shown;
      if (shown !== o.t) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-ad]'), function (v) { if (v && !seen) { seen = true; shown = ''; adT.textContent = ''; write(); } }, { threshold: .5 });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var printer = $('[data-printer]'), slip = $('[data-slip]'), rowsEl = $$('[data-row]', slip), stamp = $('[data-stamp]');
  var railWrap = $('[data-railwrap]'), rail = $('[data-rail]'), bands = $$('[data-band]'), dock = $('[data-dock]'), foot = $('[data-foot]'), main = $('#main');
  var fchars = function () { return $$('[data-fword] > span[lang]:not([hidden]) .ch').filter(function (c) { return c.offsetParent; }); };
  var ticking = false, lastY = scrollY, px = 0, py = 0;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, y = scrollY, vy = y - lastY; lastY = y;
    nav.classList.toggle('pill', y > 40);
    nav.style.top = y > 40 ? '' : Math.max(0, conceptEl.offsetHeight - y) + 'px';
    if (!calm && Math.abs(vy) > 2) sign.push(clamp(vy * .004, -.25, .25));

    // stage: the chapter in view picks the scene; at each change a roller shutter drops and lifts
    if (wide()) {
      var k = 0, cov = 0, W = vh * .2, prev = 0;
      chapters.forEach(function (ch) {
        var s = +ch.dataset.chapter, d = ch.getBoundingClientRect().top - vh * .55;
        if (d <= 0) k = s;
        if (s !== prev) cov = Math.max(cov, clamp((1 - Math.abs(d) / W) * 1.6, 0, 1));
        prev = s;
      });
      if (calm) cov = 0;
      shutter.style.setProperty('--c', smooth(cov).toFixed(4));
      showScene(k);
      // a slow drift through each photograph, plus depth under the hand
      var pg = y / Math.max(1, document.documentElement.scrollHeight - vh);
      scenes.forEach(function (s) {
        $$('[data-depth]', s).forEach(function (im) {
          var dp = +im.dataset.depth;
          im.style.transform = calm ? '' : 'translate3d(' + (px * dp).toFixed(1) + 'px,' + (py * dp + (im.classList.contains('s-man') ? 0 : (pg - .5) * 30)).toFixed(1) + 'px,0)' + (im.classList.contains('s-man') ? '' : ' scale(' + (1 + pg * .05).toFixed(4) + ')');
        });
      });
    }

    // the deal slip prints out of the slot, each line inks in, then the stamp lands
    var pr = printer.getBoundingClientRect(), e = calm ? 1 : smooth((vh * .92 - pr.top) / (vh * .62));
    slip.style.transform = calm ? '' : 'translateY(' + (-(1 - e) * 100).toFixed(2) + '%)';
    printer.classList.toggle('printing', e > 0 && e < 1);
    rowsEl.forEach(function (r, i) { r.classList.toggle('in', calm || e > .25 + i * .12); });
    stamp.classList.toggle('in', calm || e > .985);

    // reviews: the rail slides sideways with the scroll on wide screens
    var drive = wide() && !calm;
    root.classList.toggle('drive', drive);
    if (drive) {
      var rr = railWrap.getBoundingClientRect(), p = smooth((vh - rr.top) / (vh + rr.height * .6)), max = Math.max(0, rail.scrollWidth - railWrap.clientWidth + 40);
      rail.style.transform = 'translate3d(' + ((rtl() ? 1 : -1) * p * max).toFixed(1) + 'px,0,0)';
    } else rail.style.transform = '';

    // phone: each chapter's photo is opened by a rolling shutter as it arrives
    if (!wide()) bands.forEach(function (b) { var r = b.getBoundingClientRect(); b.querySelector('.b-shut').style.setProperty('--c', calm ? 1 : smooth((vh * .98 - r.top) / (vh * .55)).toFixed(4)); });

    // footer: the curtain lifts and the name rises letter by letter
    var mb = main.getBoundingClientRect().bottom, fh = foot.offsetHeight, fp = clamp((vh - mb) / Math.max(1, fh * .8), 0, 1);
    fchars().forEach(function (c, i, a) { c.style.setProperty('--fr', calm ? 0 : (1 - smooth(fp * 1.6 - i / a.length * .6)).toFixed(3)); });
    if (dock) dock.classList.toggle('away', hero.getBoundingClientRect().bottom > vh * .4 || fp > .3);
  }
  frame.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = frame.getBoundingClientRect(); px = ((e.clientX - r.left) / r.width - .5) * (rtl() ? -1 : 1) * -1; py = (e.clientY - r.top) / r.height - .5; tick(); });

  function curtain() {
    var fits = foot.offsetHeight < innerHeight * .85;
    foot.classList.toggle('curtain', fits);
    main.style.marginBottom = fits ? foot.offsetHeight + 'px' : '';
  }
  function layout() { tone.size(); curtain(); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); if (innerWidth !== lw) { lw = innerWidth; } }, 120); });
  addEventListener('scroll', tick, { passive: true });

  fillSelects(); texts(root.lang); hours(); write(true); layout();
  if (still()) $$('[data-reveal],[data-tile],[data-row],[data-stamp],[data-lt]').forEach(function (el) { el.classList.add('in'); });
  var once = false, go = function () {
    if (once) return; once = true;
    requestAnimationFrame(function () { hero.classList.add('ready'); $$('[data-odo]').forEach(function (o) { roll(o, true); }); tone.start(); sign.kick(); });
  };
  $$('[data-odo]').forEach(function (o) { roll(o, still()); });
  var bgImg = $('.s-bg', scenes[0]), man = $('.s-man', scenes[0]);
  var ready = function (im) { return new Promise(function (res) { if (im.complete && im.naturalWidth) res(); else { im.addEventListener('load', res, { once: true }); im.addEventListener('error', res, { once: true }); } }); };
  Promise.all([ready(bgImg), ready(man), document.fonts ? document.fonts.ready : 0]).then(go);
  setTimeout(go, 1600);
  addEventListener('load', function () { curtain(); tick(); });
})();
