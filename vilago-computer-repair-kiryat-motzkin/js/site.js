(function () {
  var root = document.documentElement, WA = '972542515540';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var TITLE = { he: 'וילאגו · תיקון מחשבים וניידים · שדרות וייצמן 65, קריית מוצקין', en: 'Vilago · Computer & laptop repair · 65 Weizmann Blvd, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור תיקון מחשבים בחיפה והקריות וילאגו · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Vilago Computer Repair, Haifa & Krayot · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var GLYPH = '01#%&*+=<>/\\|אבגדהוזחטיכלמנסעפצקרשת';

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'וילאגו', 'Vilago');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-tabs]', 'לפני ואחרי', 'Before and after');
    aria('[data-t-range]', 'לפני ואחרי', 'Before and after');
    aria('[data-t-dev]', 'איזה מחשב', 'Which computer');
    aria('[data-t-prob]', 'מה קורה לו', 'What’s going on');
    aria('[data-t-where]', 'איך נוח לכם', 'What suits you');
    aria('[data-t-call]', 'התקשרו לאיליה, 054-251-5540', 'Call Ilya, 054-251-5540');
    aria('[data-t-wa]', 'וואטסאפ לאיליה', 'WhatsApp Ilya');
    $$('.co').forEach(function (c) { c.setAttribute('aria-label', c.dataset[l]); if (c.classList.contains('on')) $('span', c).textContent = c.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('vl-lang', l); } catch (e) {}
    texts(l); hours(); write(true); listText(true); decodeFiles(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('vl-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    hero.classList.remove('opening', 'out');
    write(true); listText(true); decodeFiles(true); layout(); lamp.kick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [8, 20], 1: [8, 20], 2: [8, 20], 3: [8, 20], 4: [8, 20], 5: [8, 17], 6: null };
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
    $$('[data-pled]').forEach(function (el) { el.classList.toggle('open', open); });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // consecutive days with the same hours share a row; the week starts on Sunday
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

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 70 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 12 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), hphoto = $('[data-hphoto]');

  // ---------------------------------------------------------------- the inspection lamp: follows the hand, wanders by itself on phones
  var lamp = (function () {
    var lit = $('[data-lamp]'), x = .3, y = .4, tx = .3, ty = .4, hand = false, raf = 0, vis = true, t0 = performance.now();
    function frame(t) {
      raf = 0;
      if (still()) { hphoto.style.setProperty('--lx', '50%'); hphoto.style.setProperty('--ly', '45%'); hphoto.style.setProperty('--lr', Math.max(innerWidth, innerHeight) + 'px'); return; }
      if (!hand) { var s = (t - t0) / 1000; tx = .5 + Math.sin(s * .42) * .3; ty = .42 + Math.sin(s * .67 + 1) * .2; }
      x += (tx - x) * .08; y += (ty - y) * .08;
      hphoto.style.setProperty('--lx', (x * 100).toFixed(2) + '%'); hphoto.style.setProperty('--ly', (y * 100).toFixed(2) + '%');
      hphoto.style.setProperty('--lr', (phone() ? 200 : 300) + 'px');
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = hphoto.getBoundingClientRect(); hand = true; tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; });
    hero.addEventListener('pointerleave', function () { hand = false; });
    hero.addEventListener('pointerdown', function (e) { var r = hphoto.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; hand = true; setTimeout(function () { hand = false; }, 2500); });
    watch(hero, function (v) { vis = v; kick(); });
    return { kick: kick };
  })();

  // callouts on the parts: placed through object-fit:cover, labels type themselves
  var cos = $$('.co');
  function placeCallouts() {
    var W = hphoto.clientWidth, Hh = hphoto.clientHeight, iw = 1280, ih = 630, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s;
    var px = innerWidth <= 900 ? .74 : .5, lim = $('.h-copy').offsetTop - 24, ox = (W - dw) * px, oy = (Hh - dh) * .5;
    cos.forEach(function (c) {
      var x = ox + dw * +c.dataset.x, y = oy + dh * +c.dataset.y;
      c.style.left = x + 'px'; c.style.top = y + 'px';
      c.classList.toggle('flip', x > W * .6);
      c.hidden = x < 16 || x > W - 16 || y < 80 || y > Math.min(lim, Hh * .8);
    });
  }
  function typeTag(c, on) {
    var sp = $('span', c), txt = c.dataset[he() ? 'he' : 'en'];
    if (on === c.classList.contains('on')) return;
    c.classList.toggle('on', on); clearInterval(c._t);
    if (!on) { sp.textContent = ''; return; }
    if (still()) { sp.textContent = txt; return; }
    var i = 0; c._t = setInterval(function () { sp.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(c._t); }, 38);
  }
  cos.forEach(function (c) {
    c.addEventListener('mouseenter', function () { typeTag(c, true); });
    c.addEventListener('click', function () { c._pin = !c._pin; typeTag(c, c._pin || true); });
  });

  // ---------------------------------------------------------------- opening: the cover's screws turn out and it lifts away (once per visit)
  (function () {
    var seen = false; try { seen = sessionStorage.getItem('vl-open') === '1'; } catch (e) {}
    if (still() || seen) return;
    try { sessionStorage.setItem('vl-open', '1'); } catch (e) {}
    hero.classList.add('opening');
    var go = function () { hero.classList.add('out'); setTimeout(function () { hero.classList.remove('opening', 'out'); }, 1150); };
    setTimeout(go, 120);
    $('[data-opencover]').addEventListener('click', go);
  })();

  // ---------------------------------------------------------------- Ilya: the lid opens, his list types itself on the screen
  var lidSec = $('[data-lidsec]'), lid = $('[data-lid]'), items = $$('[data-llist] li'), lastN = -1;
  function listText(force, p) {
    var l = he() ? 'he' : 'en', all = items.map(function (li) { return li.dataset[l]; }), total = all.reduce(function (a, s) { return a + s.length; }, 0);
    var n = still() || p === undefined ? total : Math.round(total * clamp(p, 0, 1));
    if (n === lastN && !force) return; lastN = n;
    var left = n;
    items.forEach(function (li, i) {
      var s = all[i], k = clamp(left, 0, s.length); left -= s.length;
      li.textContent = s.slice(0, k);
      li.classList.toggle('cur', !still() && k > 0 && k < s.length);
    });
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
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 4) % 10; s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('.st [data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });
  var panelOdo = $('.panel [data-odo]'), panelRolled = null;

  // ---------------------------------------------------------------- bento: living tiles, a lamp under the hand (on phones it settles on the tile in the middle of the screen)
  var svc = $('#services'), tiles = $$('.tile');
  watch(svc, function (v) { svc.classList.toggle('on', v); });
  tiles.forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- cleaning: before / after with dust blowing off the line
  var ba = $('[data-ba]'), range = $('[data-range]'), cv = $('[data-dust]'), cx = cv.getContext('2d'), motes = [], dustRaf = 0, lastP = 50;
  var PAIRS = { grill: ['img/grill-before.jpg', 'img/grill-after.jpg', '785/370'], cooler: ['img/cooler-before.jpg', 'img/cooler-after.jpg', '785/600'] };
  function setP(p) {
    ba.style.setProperty('--p', p + '%'); range.value = p;
    if (!still() && Math.abs(p - lastP) > .2) emit(p, p < lastP);
    lastP = p;
  }
  function sizeDust() { var d = Math.min(2, devicePixelRatio || 1); cv.width = ba.clientWidth * d; cv.height = ba.clientHeight * d; cx.setTransform(d, 0, 0, d, 0, 0); }
  function emit(p, left) {
    var W = ba.clientWidth, Hh = ba.clientHeight, x = W * p / 100;
    for (var i = 0; i < 6; i++) motes.push({ x: x + (Math.random() - .5) * 6, y: Math.random() * Hh, vx: (left ? -1 : 1) * (.4 + Math.random() * 1.6), vy: -.2 - Math.random() * .8, r: .8 + Math.random() * 2.2, a: .9 });
    if (motes.length > 260) motes.splice(0, motes.length - 260);
    if (!dustRaf) dustRaf = requestAnimationFrame(dust);
  }
  function dust() {
    dustRaf = 0; cx.clearRect(0, 0, ba.clientWidth, ba.clientHeight);
    motes = motes.filter(function (m) { return m.a > .02; });
    motes.forEach(function (m) { m.x += m.vx; m.y += m.vy; m.vy -= .01; m.vx *= .99; m.a *= .965; cx.globalAlpha = m.a; cx.fillStyle = '#d8c4a6'; cx.beginPath(); cx.arc(m.x, m.y, m.r, 0, 6.283); cx.fill(); });
    cx.globalAlpha = 1;
    if (motes.length) dustRaf = requestAnimationFrame(dust);
  }
  range.addEventListener('input', function () { setP(+range.value); });
  $$('[data-pair]').forEach(function (b) { b.addEventListener('click', function () {
    $$('[data-pair]').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
    var P = PAIRS[b.dataset.pair]; $('[data-before]').src = P[0]; $('[data-after]').src = P[1]; ba.style.setProperty('--ar', P[2]);
    requestAnimationFrame(function () { sizeDust(); sweep(); });
  }); });
  function sweep() {
    if (still()) { setP(50); return; }
    var t0 = performance.now(), from = 92, to = 22;
    (function st(t) { var u = smooth((t - t0) / 1800); setP(lerp(from, to, u)); if (u < 1) requestAnimationFrame(st); else { var t1 = performance.now(); (function back(t) { var v = smooth((t - t1) / 700); setP(lerp(to, 50, v)); if (v < 1) requestAnimationFrame(back); })(t1); } })(t0);
  }
  if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { sweep(); ob.disconnect(); } }, { threshold: .55 }).observe(ba);

  // ---------------------------------------------------------------- data: the platter turns and the files decode out of noise
  var dsec = $('[data-datasec]'), files = $$('[data-files] li'), decoded = false;
  watch(dsec, function (v) { dsec.classList.toggle('on', v); if (v && !decoded) { decoded = true; decodeFiles(); } });
  function decodeFiles(instant) {
    var l = he() ? 'he' : 'en';
    files.forEach(function (li, i) {
      var txt = li.dataset[l]; clearInterval(li._t);
      if (instant || still() || !decoded) { li.textContent = txt; return; }
      var f = 0, start = i * 9;
      li._t = setInterval(function () {
        f++;
        var k = Math.max(0, Math.floor((f - start) / 2));
        li.textContent = txt.split('').map(function (c, j) { return j < k || c === ' ' ? c : GLYPH[Math.floor(Math.random() * GLYPH.length)]; }).join('');
        if (k >= txt.length) { clearInterval(li._t); li.textContent = txt; }
      }, 40);
    });
  }

  // ---------------------------------------------------------------- write: the keyboard, the steps and the message that types itself
  var steps = $$('[data-step]');
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  var devs = $$('[data-dev]'), probs = $$('[data-prob]'), wheres = $$('[data-where]'), msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
  function radio(group, b) { group.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); }
  devs.forEach(function (b) { b.addEventListener('click', function () { radio(devs, b); lightStep(0); write(); }); });
  probs.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); lightStep(1); write(); }); });
  wheres.forEach(function (b) { b.addEventListener('click', function () { radio(wheres, b); lightStep(2); write(); }); });
  $('[data-send]').addEventListener('pointerenter', function () { lightStep(3); });
  $('[data-send]').addEventListener('focus', function () { lightStep(3); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), k = l ? 'he' : 'en';
    var dev = devs.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0].dataset[k];
    var picked = probs.filter(function (x) { return x.getAttribute('aria-pressed') === 'true'; }).map(function (x) { return x.dataset[k]; });
    var w = wheres.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0].dataset[k];
    return l ? 'שלום איליה, אשמח לעזרה עם ' + dev + (picked.length ? ': ' + list(picked, true) : '') + '. ' + w + '.'
             : 'Hi Ilya, I’d like help with ' + dev + (picked.length ? ': ' + list(picked, false) : '') + '. ' + w + '.';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 16);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('.mini-screen'), function (v) { if (v && !chatSeen) { chatSeen = true; if (still()) return; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var screenSec = $('[data-screensec]'), sfig = $('[data-sfig]'), panel = $('[data-panel]');
  var revs = $('[data-revs]'), track = $('[data-track]'), rbar = $('[data-rbar]'), foot = $('[data-foot]'), mainEl = $('main'), driver = $('[data-driver]');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // hero: the camera pushes in toward the fan and the lamp, the copy lifts away
    var hp = calm ? 0 : prog(hero);
    hphoto.style.transform = calm ? '' : 'scale(' + (1 + hp * .3).toFixed(4) + ')';
    $('.h-copy').style.transform = calm ? '' : 'translateY(' + (-hp * 80).toFixed(1) + 'px)';
    var co = calm ? 1 : 1 - smooth((hp - .45) / .4);
    $('.h-copy').style.opacity = calm ? '' : co.toFixed(3);
    hphoto.style.setProperty('--sc', (.25 + co * .75).toFixed(3));
    cos.forEach(function (c, i) { if (c._pin) return; typeTag(c, calm || performance.now() > 1600 + i * 450 || hp > .02); });
    // the lid
    var lp = calm ? 1 : prog(lidSec), open = smooth(lp / .45);
    lid.style.setProperty('--lid', calm ? '0deg' : ((1 - open) * 84).toFixed(2) + 'deg');
    listText(false, calm ? undefined : (lp - .3) / .55);
    // the screen: the camera moves onto the panel, then the backlight sweeps down
    var sp = calm ? 1 : prog(screenSec);
    if (!calm) {
      var z = smooth(sp / .4), maxS = Math.min(phone() ? 1.9 : 1.2, innerHeight * .78 / (sfig.offsetHeight * .45));
      sfig.style.transform = 'scale(' + lerp(1, Math.max(1, maxS), z).toFixed(4) + ')';
      var sw = clamp((sp - .4) / .3, 0, 1.2);
      panel.style.setProperty('--on', sp > .38 ? '1' : '0'); panel.style.setProperty('--sweep', sw.toFixed(3)); panel.style.setProperty('--sw', sw > 0 && sw < 1 ? '1' : '0');
      var go = sw >= .9; if (go !== panelRolled) { panelRolled = go; roll(panelOdo, go); }
    } else { sfig.style.transform = ''; panel.style.setProperty('--on', '1'); panel.style.setProperty('--sweep', '1.2'); panel.style.setProperty('--sw', '0'); if (panelRolled !== true) { panelRolled = true; roll(panelOdo, true); } }
    // the reviews rail
    if (!calm) {
      var over = Math.max(0, track.scrollWidth - innerWidth + 2 * parseFloat(getComputedStyle(track.parentNode).paddingLeft || 0)), rp = prog(revs);
      track.style.transform = 'translateX(' + ((rtl() ? 1 : -1) * over * rp).toFixed(1) + 'px)';
      rbar.style.setProperty('--rp', rp.toFixed(3));
    } else track.style.transform = '';
    // the footer: screws turn back in as you arrive
    var mb = mainEl.getBoundingClientRect().bottom, fp = calm ? 1 : smooth((vh - mb) / Math.min(foot.offsetHeight, vh));
    foot.style.setProperty('--f', fp.toFixed(3));
    driver.classList.toggle('away', mb < vh * .75 || scrollY < vh * .6);
  }
  function railHeight() {
    if (still()) { revs.style.height = ''; return; }
    var over = Math.max(0, track.scrollWidth - innerWidth + 80);
    revs.style.height = (innerHeight + over * 1.1) + 'px';
  }

  function layout() { placeCallouts(); sizeDust(); railHeight(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); listText(true); decodeFiles(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); lamp.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { go(); layout(); });
  setTimeout(go, 1200);
  setTimeout(tick, 1700); setTimeout(tick, 3400);
  addEventListener('load', layout);
})();
