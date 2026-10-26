(function () {
  var root = document.documentElement;
  var TEL = '+97248777710';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth <= 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var TITLE = { he: 'דסקטופ ישראל · מעבדת מחשבים בקריות · החשמונאים 39א, קרית מוצקין', en: 'DeskTop Israel · Computer lab in the Krayot · 39A HaHashmonaim St, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור דסקטופ ישראל · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for DeskTop Israel · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- glyph decode: text settles out of scrambled characters
  var GLYPHS = 'ABCDEFGHJKLMNPRSTUVXZ0123456789#%&';
  function decode(el, txt, dur) {
    clearInterval(el._dc);
    if (still()) { el.textContent = txt; return; }
    var t0 = performance.now(); dur = dur || 600;
    el._dc = setInterval(function () {
      var k = clamp((performance.now() - t0) / dur, 0, 1), n = Math.floor(txt.length * k), s = txt.slice(0, n);
      for (var i = n; i < txt.length; i++) s += txt[i] === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      el.textContent = s;
      if (k >= 1) { clearInterval(el._dc); el.textContent = txt; }
    }, 40);
  }

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'דסקטופ ישראל', 'DeskTop Israel');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-cmp]', 'השוואה בין PC ל-Apple', 'Compare PC and Apple');
    aria('[data-t-ring]', 'מכשיר', 'Device');
    aria('[data-t-dip]', 'מה קורה', 'What’s happening');
    aria('[data-t-prev]', 'המכשיר הקודם', 'Previous device');
    aria('[data-t-next]', 'המכשיר הבא', 'Next device');
    aria('[data-t-visit]', 'הגעה ויצירת קשר', 'Visit and contact');
    aria('[data-t-call]', 'התקשרו למעבדה, 04-877-7710', 'Call the lab, 04-877-7710');
    $('[data-copylbl]').textContent = l === 'he' ? 'העתקת הכרטיס' : 'Copy the ticket';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('dti-lang', l); } catch (e) {}
    texts(l); hours(); ticketWrite(false); splitQuotes(); buildTabs(); quoteShow(curQ, true); ring.place(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('dti-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    hero.classList.add('ready'); loupe.stop(); ring.place(); quoteShow(curQ, true); layout(); dots.kick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time.
  // The Google listing publishes no opening hours, so none are invented: H stays null and the page says so.
  // When the owner confirms them: H = {0:[9,19], ..., 5:[9,13], 6:null} (null = closed day), or H = '24/7'.
  var H = null;
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var l = he(), txt, open = false;
    if (!H) txt = l ? 'שעות הפתיחה לא מפורסמות · כדאי להתקשר לפני שמגיעים' : 'Opening hours aren’t listed · best to call before you come';
    else if (H === '24/7') { open = true; txt = l ? 'פתוח 24/7' : 'Open 24/7'; }
    else {
      var n = window.__now || now(), t = H[n.d];
      if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
      else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
      else {
        var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
        txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
          : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
          : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
      }
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
  }
  function hours() {
    var tb = $('[data-hours]');
    if (!H || H === '24/7') { tb.innerHTML = ''; status(); return; }
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    tb.innerHTML = rows.map(function (r) {
      var t = H[r[0]], name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      return '<tr><td>' + name + '</td><td>' + (t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed')) + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline: letters lock in, grey then lit
  function splitInto(sp, start, cls) {
    var i = start;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="' + (cls || 'w') + '">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  }
  $$('[data-split] .ln > span[lang]').forEach(function (sp) { splitInto(sp, sp.closest('.ln').previousElementSibling ? 12 : 0); });

  var hero = $('[data-hero]'), nav = $('[data-nav]');
  function cbSize() { root.style.setProperty('--cb', $('.concept').offsetHeight + 'px'); }

  // ---------------------------------------------------------------- opening: the logo fills like a gauge, the photos are dealt onto the sheet
  // each column gets two more frames (copies of its first two) so the sheet never runs out while it drifts
  $$('[data-col]', hero).forEach(function (c) { $$('.fr', c).slice(0, 2).forEach(function (f) { var k = f.cloneNode(true); k.setAttribute('aria-hidden', 'true'); c.appendChild(k); }); });
  var frames = $$('.fr', hero);
  function deal() {
    var hr = hero.getBoundingClientRect(), cx = hr.left + hr.width / 2, cy = Math.min(hr.top + hr.height / 2, innerHeight / 2);
    frames.forEach(function (f, i) {
      var r = f.getBoundingClientRect(); if (!r.width) return;
      var dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2), rot = ((i * 37) % 17) - 8;
      f.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + rot + 'deg) scale(.55)', opacity: 0 }, { transform: 'translate(' + dx * .2 + 'px,' + dy * .2 + 'px) rotate(' + rot * .3 + 'deg) scale(.8)', opacity: 1, offset: .35 }, { transform: 'none', opacity: 1 }],
        { duration: 900, delay: i * 38, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' });
    });
  }
  function start() {
    var seen = false; try { seen = sessionStorage.getItem('dti-boot') === '1'; } catch (e) {}
    var go = function () { requestAnimationFrame(function () { hero.classList.add('ready'); }); };
    if (still() || seen) { go(); return; }
    try { sessionStorage.setItem('dti-boot', '1'); } catch (e) {}
    root.classList.add('booting');
    var boot = $('[data-boot]'), n = $('[data-bootn]'), img = $('img', boot), t0 = performance.now(), done = false;
    function finish() { if (done) return; done = true; root.classList.add('booted'); deal(); setTimeout(go, 260); setTimeout(function () { root.classList.remove('booting', 'booted'); }, 700); }
    (function st(t) { if (done) return; var k = clamp((t - t0) / 900, 0, 1); n.textContent = Math.round(k * 100); img.style.setProperty('--fill', (k * 100) + '%'); if (k < 1) requestAnimationFrame(st); else setTimeout(finish, 120); })(t0);
    boot.addEventListener('click', finish); addEventListener('keydown', finish, { once: true });
  }

  // ---------------------------------------------------------------- the loupe: magnifies whatever bench photo is under the hand (drifts by itself on touch)
  var loupe = (function () {
    var el = $('[data-loupe]'), lens = $('[data-lens]'), Z = 3, x = 0, y = 0, raf = 0, auto = !fine.matches, t0 = 0, touching = false, vis = true, hot = null;
    function show(px, py) {
      var hr = hero.getBoundingClientRect(), cx = hr.left + px, cy = hr.top + py;
      el.style.visibility = 'hidden'; var under = document.elementFromPoint(cx, cy); el.style.visibility = '';
      var fr = under && under.closest && under.closest('.fr');
      if (hot && hot !== fr) hot.classList.remove('hot');
      if (!fr || still()) { el.classList.remove('on'); hot = null; return false; }
      hot = fr; fr.classList.add('hot');
      var img = $('img', fr), r = img.getBoundingClientRect(), iw = img.naturalWidth || 1, ih = img.naturalHeight || 1;
      var s = Math.max(r.width / iw, r.height / ih), dw = iw * s, dh = ih * s;
      var pos = (img.style.objectPosition || '50% 50%').split(' ').map(parseFloat);
      var ox = (r.width - dw) * (pos[0] / 100), oy = (r.height - dh) * ((pos[1] === pos[1] ? pos[1] : 50) / 100);
      var lx = cx - r.left - ox, ly = cy - r.top - oy, L = el.offsetWidth / 2;
      lens.style.backgroundImage = 'url(' + img.currentSrc + ')';
      lens.style.backgroundSize = (dw * Z) + 'px ' + (dh * Z) + 'px';
      lens.style.backgroundPosition = (L - lx * Z) + 'px ' + (L - ly * Z) + 'px';
      el.style.setProperty('--lx', px + 'px'); el.style.setProperty('--ly', py + 'px');
      el.classList.add('on'); return true;
    }
    function frame(t) {
      raf = 0; if (!auto || still() || !vis || touching) return;
      if (!t0) t0 = t; var k = (t - t0) / 1000;
      if (k > 1.6) {
        var w = hero.clientWidth, h = hero.clientHeight, pr = $('[data-panel]').getBoundingClientRect(), hr = hero.getBoundingClientRect();
        var top = phone() ? pr.bottom - hr.top + 40 : 80, span = Math.max(80, (phone() ? Math.min(h, innerHeight - hr.top) : h) - top - 60);
        var px = w * (.5 + .36 * Math.sin(k * .45)), py = top + span * (.5 + .45 * Math.sin(k * .31 + 1));
        if (!phone()) { px = w * (.5 + .45 * Math.sin(k * .4)); if (px > pr.left - hr.left - 20 && px < pr.right - hr.left + 20) py = Math.max(py, pr.bottom - hr.top + 90); }
        show(px, py);
      }
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && auto) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType === 'touch') return; auto = false; var r = hero.getBoundingClientRect(); show(e.clientX - r.left, e.clientY - r.top); });
    hero.addEventListener('pointerleave', function (e) { if (e.pointerType === 'touch') return; el.classList.remove('on'); if (hot) hot.classList.remove('hot'); hot = null; });
    hero.addEventListener('touchstart', function (e) { touching = true; var r = hero.getBoundingClientRect(), p = e.touches[0]; show(p.clientX - r.left, p.clientY - r.top); }, { passive: true });
    hero.addEventListener('touchmove', function (e) { var r = hero.getBoundingClientRect(), p = e.touches[0]; show(p.clientX - r.left, p.clientY - r.top); }, { passive: true });
    hero.addEventListener('touchend', function () { touching = false; auto = true; kick(); });
    watch(hero, function (v) { vis = v; kick(); });
    return { kick: kick, stop: function () { if (still()) { el.classList.remove('on'); if (hot) hot.classList.remove('hot'); } else kick(); } };
  })();

  // ---------------------------------------------------------------- PC & Apple: drag the seam; it sweeps once by itself
  var cmp = $('[data-cmp]'), cmpR = $('[data-cmpr]'), swept = false;
  function cmpSet(v) { cmp.style.setProperty('--x', v + '%'); cmpR.value = v; }
  cmpR.addEventListener('input', function () { swept = true; cmpSet(+cmpR.value); });
  watch(cmp, function (v) {
    if (!v) return;
    $$('[data-decode]', cmp).forEach(function (l, i) { setTimeout(function () { decode(l, l.dataset.decode, 700); }, i * 200); });
    if (swept || still()) return; swept = true;
    var t0 = performance.now(), keys = [50, 22, 78, 50];
    (function st(t) { var k = clamp((t - t0) / 2600, 0, 1), seg = Math.min(2, Math.floor(k * 3)), u = smooth(k * 3 - seg); cmpSet(lerp(keys[seg], keys[seg + 1], u)); if (k < 1 && !still()) requestAnimationFrame(st); else cmpSet(50); })(t0);
  }, { threshold: .5 });

  // ---------------------------------------------------------------- the reticle's ticks
  var ticks = $('.reticle .ticks');
  for (var a = 0; a < 360; a += 10) { var big = a % 30 === 0, r1 = big ? 176 : 184, rad = a * Math.PI / 180; ticks.insertAdjacentHTML('beforeend', '<line x1="' + (200 + Math.cos(rad) * r1).toFixed(1) + '" y1="' + (200 + Math.sin(rad) * r1).toFixed(1) + '" x2="' + (200 + Math.cos(rad) * 194).toFixed(1) + '" y2="' + (200 + Math.sin(rad) * 194).toFixed(1) + '"/>'); }
  var lab = $('[data-lab]'), lstage = $('[data-labstage]'), lphoto = $('[data-labphoto] img'), lmicro = $('[data-labmicro] img'), magEl = $('[data-mag]'), focusEl = $('[data-focus]'), focusState = '';

  // ---------------------------------------------------------------- what comes in: the board of tiles, one photo across them
  var mosaic = $('[data-mosaic]'), mtpl = $('[data-mtiles]'), mtiles = [], mcols = 0;
  function buildMosaic() {
    var cols = phone() ? 3 : 6, rows = phone() ? 6 : 4;
    if (cols === mcols) return; mcols = cols;
    var special = cols === 6 ? { 0: 'm-head', 8: 'm-fact', 13: 'm-fact f2', 22: 'm-fact f3', 17: 'm-act' } : { 0: 'm-head', 7: 'm-fact', 11: 'm-fact f2', 15: 'm-fact f3', 9: 'm-act' };
    var src = mtpl.content, map = { 'm-head': src.querySelector('.m-head'), 'm-fact': src.querySelector('.m-fact:not(.f2):not(.f3)'), 'm-fact f2': src.querySelector('.f2'), 'm-fact f3': src.querySelector('.f3'), 'm-act': src.querySelector('.m-act') };
    mosaic.innerHTML = ''; mtiles = [];
    var n = cols * rows - (cols === 3 ? 1 : 0);   // on phones the heading spans two cells
    for (var i = 0, cell = 0; i < n; i++) {
      var el = special[i] ? map[special[i]].cloneNode(true) : document.createElement('div');
      if (!special[i]) { el.className = 'mt pc'; el.setAttribute('aria-hidden', 'true'); }
      el.dataset.cell = cell; cell += (cols === 3 && special[i] === 'm-head') ? 2 : 1;
      mosaic.appendChild(el); mtiles.push(el);
      el.dataset.rx = ((i * 53) % 21 - 10); el.dataset.ry = ((i * 29) % 13 + 4); el.dataset.rr = ((i * 41) % 19 - 9); el.dataset.th = (((i * 7) % 11) / 11 * .45).toFixed(3);
    }
  }
  function placeMosaic() {
    var W = mosaic.clientWidth, cols = mcols, g = phone() ? 6 : 8, t = (W - g * (cols - 1)) / cols, rows = phone() ? 6 : 4, Hb = rows * t + (rows - 1) * g;
    var iw = 1200, ih = 750, s = Math.max(W / iw, Hb / ih), bw = iw * s, bh = ih * s, ox = (W - bw) / 2, oy = (Hb - bh) / 2;
    mtiles.forEach(function (el) {
      if (!el.classList.contains('pc')) return;
      var c = +el.dataset.cell, cx = c % cols, cy = Math.floor(c / cols);
      if (rtl()) cx = cols - 1 - cx;
      el.style.setProperty('--bw', bw + 'px'); el.style.setProperty('--bh', bh + 'px');
      el.style.setProperty('--bx', (ox - cx * (t + g)) + 'px'); el.style.setProperty('--by', (oy - cy * (t + g)) + 'px');
    });
  }

  // ---------------------------------------------------------------- the repair ticket (the live thing)
  var ring = (function () {
    var el = $('[data-ring]'), cards = $$('[data-dv]', el), N = cards.length, cur = 0, rot = 0, target = 0, raf = 0, drag = false, lx = 0, moved = 0;
    function R() { return phone() ? Math.min(150, el.clientWidth * .36) : Math.min(300, el.clientWidth * .33); }
    function draw() {
      var r = R(), step = 360 / N;
      cards.forEach(function (c, i) {
        if (still()) { c.style.transform = ''; c.style.filter = ''; c.style.zIndex = ''; return; }
        var ang = (i - rot) * step * (rtl() ? -1 : 1), f = Math.cos(ang * Math.PI / 180);
        var sn = Math.sin(ang * Math.PI / 180);
        c.style.transform = 'translate3d(' + (sn * r).toFixed(1) + 'px,' + ((1 - f) * 10).toFixed(1) + 'px,' + ((f - 1) * r * .55).toFixed(1) + 'px) rotateY(' + (-ang * .3).toFixed(2) + 'deg)';
        c.style.filter = 'brightness(' + (.35 + .65 * Math.max(0, f)).toFixed(3) + ')';
        c.style.zIndex = Math.round(f * 10) + 10;
      });
    }
    function frame() { raf = 0; if (!drag) rot += (target - rot) * .14; draw(); if (drag || Math.abs(target - rot) > .002) raf = requestAnimationFrame(frame); else { rot = target; draw(); } }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    function select(i, quiet) {
      var k = ((i % N) + N) % N; if (k !== cur || quiet === 'init') { cur = k; }
      var d = k - (((Math.round(target) % N) + N) % N); if (d > N / 2) d -= N; if (d < -N / 2) d += N; target = Math.round(target) + d;
      cards.forEach(function (c, j) { c.setAttribute('aria-checked', j === cur ? 'true' : 'false'); c.tabIndex = j === cur ? 0 : -1; });
      $('[data-dvname]').textContent = cards[cur].dataset[he() ? 'he' : 'en'].replace(/^./, function (c) { return c.toUpperCase(); });
      if (still()) { rot = target; draw(); } else kick();
      if (quiet !== 'init') { lightStep(0); ticketWrite(true); }
    }
    cards.forEach(function (c, i) {
      c.addEventListener('click', function () { if (moved > 6) return; select(i); });
      c.addEventListener('keydown', function (e) {
        var fw = (e.key === 'ArrowLeft') === rtl(), k = e.key;
        if (k === 'ArrowLeft' || k === 'ArrowRight') { e.preventDefault(); select(cur + (fw ? 1 : -1)); cards[cur].focus(); }
      });
    });
    $('[data-rprev]').addEventListener('click', function () { select(cur - 1); });
    $('[data-rnext]').addEventListener('click', function () { select(cur + 1); });
    el.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; moved = 0; lx = e.clientX; kick(); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; moved += Math.abs(dx); rot -= dx / (R() * 1.1) * (rtl() ? -1 : 1); });
    addEventListener('pointerup', function () { if (!drag) return; drag = false; if (moved > 6) select(Math.round(rot)); kick(); });
    return { place: function () { select(cur, 'init'); rot = target; draw(); }, cur: function () { return cards[cur]; }, select: select };
  })();

  var steps = $$('[data-step]');
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  var sws = $$('[data-sw]');
  sws.forEach(function (s) { s.addEventListener('click', function () { s.setAttribute('aria-checked', s.getAttribute('aria-checked') === 'true' ? 'false' : 'true'); lightStep(1); ticketWrite(true); }); });
  $('[data-call]').addEventListener('pointerenter', function () { lightStep(2); });
  $('[data-call]').addEventListener('focus', function () { lightStep(2); });
  var paper = $('[data-paper]'), led = $('[data-led]');
  function listJoin(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function ticketData() {
    var l = he(), d = new Date(), dev = ring.cur().dataset[l ? 'he' : 'en'];
    var sym = sws.filter(function (s) { return s.getAttribute('aria-checked') === 'true'; }).map(function (s) { return s.dataset[l ? 'he' : 'en']; });
    var date = new Intl.DateTimeFormat(l ? 'he-IL' : 'en-GB', { timeZone: 'Asia/Jerusalem', day: 'numeric', month: 'numeric', year: 'numeric' }).format(d);
    return { date: date, dev: l ? dev : dev.replace(/^./, function (c) { return c.toUpperCase(); }), sym: sym.length ? (l ? listJoin(sym, true) : listJoin(sym, false).replace(/^./, function (c) { return c.toUpperCase(); })) : (l ? 'עוד לא סומן' : 'Not marked yet') };
  }
  function ticketWrite(feed) {
    var t = ticketData();
    $('[data-tdate]').textContent = t.date; $('[data-tdev]').textContent = t.dev; $('[data-tsym]').textContent = t.sym;
    if (feed && !still() && paper.animate) {
      paper.animate([{ transform: 'translateY(-101%)' }, { transform: 'translateY(0)' }], { duration: 650, easing: 'cubic-bezier(.23,1,.32,1)' });
      led.classList.add('on'); clearTimeout(led._t); led._t = setTimeout(function () { led.classList.remove('on'); }, 700);
    }
  }
  $('[data-copy]').addEventListener('click', function () {
    var l = he(), t = ticketData(), lbl = $('[data-copylbl]');
    var txt = l ? 'כרטיס תיקון · דסקטופ ישראל\nתאריך: ' + t.date + '\nמכשיר: ' + t.dev + '\nמה קורה: ' + t.sym + '\nהחשמונאים 39א, קרית מוצקין · 04-877-7710'
                : 'Repair ticket · DeskTop Israel\nDate: ' + t.date + '\nDevice: ' + t.dev + '\nWhat’s happening: ' + t.sym + '\n39A HaHashmonaim St, Kiryat Motzkin · 04-877-7710';
    var ok = function () { lbl.textContent = l ? 'הועתק' : 'Copied'; setTimeout(function () { lbl.textContent = he() ? 'העתקת הכרטיס' : 'Copy the ticket'; }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, function () {}); else ok();
  });
  watch($('[data-printer]'), function (v) { if (v && !paper._fed) { paper._fed = true; ticketWrite(true); } }, { threshold: .4 });

  // ---------------------------------------------------------------- reviews: the quote changes with the scroll, each one assembling word by word
  var revs = $('[data-revs]'), qs = $$('[data-q]'), who = $('[data-who]'), rvDots = $$('[data-rvdots] i'), curQ = -1;
  function splitQuotes() { qs.forEach(function (q) { $$('p', q).forEach(function (p) { if (!p.dataset.raw) p.dataset.raw = p.textContent; var i = 0; p.innerHTML = p.dataset.raw.split(' ').map(function (w) { return '<span class="wd" style="--i:' + (i++) + '">' + w + '</span>'; }).join(' '); }); }); }
  var tabs = $('[data-rvtabs]'), pinQ = -1;
  function buildTabs() { tabs.innerHTML = qs.map(function (q, k) { return '<button type="button" aria-pressed="false" data-k="' + k + '">' + q.dataset[he() ? 'whoHe' : 'whoEn'] + '</button>'; }).join(''); $$('button', tabs).forEach(function (b) { b.addEventListener('click', function () { pinQ = +b.dataset.k; quoteShow(pinQ); }); }); }
  function quoteShow(i, instant) {
    i = clamp(i, 0, qs.length - 1);
    if (i === curQ && !instant) return; curQ = i;
    qs.forEach(function (q, k) { q.classList.toggle('on', k === i); });
    rvDots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
    $$('button', tabs).forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
    var name = qs[i].dataset[he() ? 'whoHe' : 'whoEn'];
    if (instant || still()) who.textContent = name; else decode(who, name, 500);
    if (!still() && !instant) $$('.wd', qs[i]).forEach(function (w, k) { w.animate && w.animate([{ opacity: 0, transform: 'translateY(.4em)', filter: 'blur(4px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 520, delay: k * 34, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' }); });
  }

  // ---------------------------------------------------------------- odometer
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) { roll(o, still()); watch(o, function (v) { if (v) roll(o, true); }, { threshold: .3 }); });

  // ---------------------------------------------------------------- footer: solder dots gather into the real logo mark
  var foot = $('[data-foot]'), fword = $('[data-fword]');
  $$('span[lang]', fword).forEach(function (sp) { splitInto(sp, 0, 'w'); });
  var dots = (function () {
    var cv = $('[data-fdots]'), c = cv.getContext('2d'), img = $('[data-fsrc]'), P = [], w = 0, h = 0, ok = false, raf = 0, mx = -999, my = -999, prog = 1;
    function sample() {
      try {
        var sc = document.createElement('canvas'), iw = 210, ih = 163; sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data, pts = [];
        for (var y = 0; y < ih; y += 3) for (var x = 0; x < iw; x += 3) { var k = (y * iw + x) * 4; if (d[k + 3] > 140) pts.push([x / iw, y / ih]); }
        P = pts.map(function (q, i) { return { hx: q[0], hy: q[1], sx: Math.random(), sy: Math.random() * .9 + .05, x: 0, y: 0, vx: 0, vy: 0, dl: (i % 17) / 17 * .35, r: 1.2 + ((i * 7) % 5) / 5 * 1.4 }; });
        ok = true;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame() {
      raf = 0; if (!ok || !w) return;
      var fwH = fword.offsetHeight || 60, lh = Math.max(60, Math.min(h * .78, h - fwH - 14)), lw = lh * 420 / 326, ox = rtl() ? w - lw : 0, oy = 0, calm = still(), moving = false;
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], e = calm ? 1 : smooth((prog - p.dl) / .65);
        var tx = lerp(p.sx * w, ox + p.hx * lw, e), ty = lerp(p.sy * h, oy + p.hy * lh, e);
        if (calm || !p.init) { p.x = tx; p.y = ty; p.init = true; }
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (!calm && d2 < 3600) { var f = (3600 - d2) / 3600 * 3, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
        p.vx += (tx - p.x) * .12; p.vy += (ty - p.y) * .12; p.vx *= .78; p.vy *= .78; p.x += p.vx; p.y += p.vy;
        if (Math.abs(p.vx) + Math.abs(p.vy) > .05) moving = true;
        c.fillStyle = e > .96 ? '#6cb6e4' : '#cfd8e0';
        c.beginPath(); c.arc(p.x, p.y, e > .96 ? 1.6 : p.r, 0, 6.283); c.fill();
      }
      if (moving && !calm) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    cv.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; kick(); });
    cv.addEventListener('pointerleave', function () { mx = my = -999; kick(); });
    function go() { size(); sample(); kick(); }
    if (img.complete && img.naturalWidth) setTimeout(go, 0); else img.addEventListener('load', go, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } }, prog: function (v) { if (Math.abs(v - prog) > .002) { prog = v; kick(); } } };
  })();

  // ---------------------------------------------------------------- visit
  var strip = $('[data-strip]'), vboard = $('[data-vboard]'), vphoto = $('[data-vphoto]'), vts = $$('[data-vt]'), tag = $('[data-tag]');
  var links = $$('.links a'), secs = links.map(function (a) { return $(a.getAttribute('href')); });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false, stripX = 0, lastT = 0;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update(t) {
    ticking = false;
    var calm = still(), vh = innerHeight, sy = scrollY;
    nav.classList.toggle('pill', sy > 40);
    var cur = -1; secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < vh * .45) cur = i; }); links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
    // hero: the columns drift at their own speeds, the panel lifts slower
    var hr = hero.getBoundingClientRect();
    if (!calm && hr.bottom > 0) $$('[data-col]', hero).forEach(function (c, i) { c.style.setProperty('--py', (-sy * [.12, .28, .18, .34, .1, .24][i]).toFixed(1) + 'px'); });
    tag.classList.toggle('on', hr.bottom < vh * .35);
    // lab: iris opens, the camera dives, the eyepiece closes in, the burnt part comes into focus
    if (!calm) {
      var lr = lab.getBoundingClientRect(), enter = clamp(1 - lr.top / vh, 0, 1), p = prog(lab);
      var iris = lerp(12, 80, smooth(enter));
      var zoom = smooth((p - .06) / .5), eyeK = smooth((p - .18) / .4), mo = smooth((p - .38) / .2), foc = smooth((p - .5) / .22), ro = smooth((p - .62) / .14);
      var vmin = Math.min(innerWidth, vh), eye = lerp(Math.hypot(innerWidth, vh), vmin * (phone() ? .42 : .38), eyeK);
      lstage.style.setProperty('--iris', iris + '%');
      lstage.style.setProperty('--eye', eye.toFixed(1) + 'px');
      lstage.style.setProperty('--mo', mo.toFixed(3));
      lstage.style.setProperty('--blur', (lerp(10, 0, foc)).toFixed(2) + 'px');
      lstage.style.setProperty('--ro', ro.toFixed(3));
      lphoto.style.transform = 'scale(' + lerp(1, 3.4, zoom).toFixed(4) + ')';
      lmicro.style.transform = 'scale(' + lerp(1.5, 1, smooth((p - .38) / .45)).toFixed(4) + ')';
      var m = Math.round(lerp(1, 40, smooth((p - .06) / .7)));
      magEl.textContent = '×' + m;
      var fs = foc >= .99 ? 'sharp' : foc > .01 ? 'focusing' : zoom > .02 ? 'zoom' : '';
      if (fs !== focusState) { focusState = fs; var L = { sharp: ['בפוקוס', 'In focus'], focusing: ['מכוונים פוקוס…', 'Focusing…'], zoom: ['מתקרבים…', 'Zooming in…'], '': ['', ''] }[fs][he() ? 0 : 1]; decode(focusEl, L, 380); }
    }
    // mosaic: the pieces land into place
    var mr = mosaic.getBoundingClientRect(), mp = calm ? 1 : clamp((vh - mr.top) / (vh * .85), 0, 1);
    mtiles.forEach(function (el) {
      if (calm) { el.style.transform = ''; el.style.opacity = ''; return; }
      var k = smooth((mp - +el.dataset.th) / .55);
      el.style.transform = k >= 1 ? '' : 'translate3d(' + ((1 - k) * +el.dataset.rx * 6).toFixed(1) + 'px,' + ((1 - k) * +el.dataset.ry * 14).toFixed(1) + 'px,0) rotate(' + ((1 - k) * +el.dataset.rr).toFixed(2) + 'deg) scale(' + lerp(.82, 1, k).toFixed(3) + ')';
      el.style.opacity = lerp(.15, 1, k).toFixed(3);
    });
    // reviews follow the scroll
    if (!calm) { var qi = Math.floor(prog(revs) * qs.length * .999); if (qi !== revs._qi) { revs._qi = qi; pinQ = -1; } quoteShow(pinQ >= 0 ? pinQ : qi); }
    // visit: the strip drifts with the scroll and with time; the aerial photo shrinks into its tile
    var dt = lastT ? Math.min(50, t - lastT) : 16; lastT = t;
    if (!calm) { stripX = -(sy * .25) % (strip.scrollWidth / 2 || 1); strip.style.setProperty('--sx', (rtl() ? -stripX : stripX).toFixed(1) + 'px'); }
    else strip.style.setProperty('--sx', '0px');
    var br = vboard.getBoundingClientRect(), e2 = calm ? 1 : smooth((vh - br.top) / (vh * .9));
    if (!calm && !phone()) {
      var pw = vphoto.offsetWidth, s0 = Math.max(innerWidth / pw, 1), cxn = br.left + vphoto.offsetLeft + pw / 2, dxx = (innerWidth / 2 - cxn) * (1 - e2);
      vphoto.style.transform = 'translate3d(' + dxx.toFixed(1) + 'px,0,0) scale(' + lerp(s0, 1, e2).toFixed(4) + ')';
      vphoto.style.zIndex = e2 < 1 ? 3 : '';
    } else { vphoto.style.transform = ''; }
    vts.forEach(function (v, i) { var k = calm ? 1 : smooth((e2 - .55 - i * .06) / .3); v.style.opacity = calm ? '' : k.toFixed(3); v.style.transform = calm || k >= 1 ? '' : 'translateY(' + ((1 - k) * 30).toFixed(1) + 'px)'; });
    // footer: the wordmark rises letter by letter, the dots gather into the logo
    var fr2 = foot.getBoundingClientRect(), fp = calm ? 1 : clamp((vh - fr2.top) / (fr2.height * .9), 0, 1);
    $$('.ch', fword).forEach(function (ch, i, all) { ch.style.setProperty('--k', smooth((fp - .3 - i / all.length * .4) / .3).toFixed(3)); });
    dots.prog(fp);
  }

  function layout() {
    cbSize(); buildMosaic(); placeMosaic(); dots.size();
    foot.classList.toggle('flat', foot.offsetHeight > innerHeight * .95);
    tick();
  }
  var rz, lw = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (innerWidth !== lw) { lw = innerWidth; mcols = 0; } layout(); ring.place(); }, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); splitQuotes(); buildTabs(); ring.place(); ticketWrite(false); quoteShow(0, true); layout();
  var once = false, go = function () { if (once) return; once = true; start(); loupe.kick(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1000);
  addEventListener('load', function () { layout(); });
})();
