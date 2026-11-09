(function () {
  var root = document.documentElement, WA = '972523519284';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'רון זילברמן · משרד עורכי דין · שדרות משה שרת 3, קריית ים', en: 'Ron Zilberman · Law Office · 3 Moshe Sharet Blvd, Kiryat Yam' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור רון זילברמן - משרד עורכי דין · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Ron Zilberman Law Office · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'רון זילברמן – משרד עורכי דין', 'Ron Zilberman Law Office');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-wa]', 'וואטסאפ לרון', 'WhatsApp Ron');
    aria('[data-t-call]', 'התקשרו לרון, 052-351-9284', 'Call Ron, 052-351-9284');
    aria('[data-t-tabs]', 'שלבי העסקה', 'Stages of the deal');
    aria('[data-t-fields]', 'תחומים', 'Practice areas');
    aria('[data-t-next]', 'הביקורת הבאה', 'Next review');
    aria('.file .prev', 'השלב הקודם', 'Previous stage');
    aria('.file .next', 'השלב הבא', 'Next stage');
    $('.map iframe').title = l === 'he' ? 'Google Maps: שדרות משה שרת 3, קרית ים' : 'Google Maps: 3 Moshe Sharet Blvd, Kiryat Yam';
    $$('[data-decode]').forEach(function (d) { decode(d, true); });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('rz-lang', l); } catch (e) {}
    texts(l); hours(); write(true); sizePile(); tick();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); root.classList.remove('opening'); delete root.dataset.motionAuto;
    try { localStorage.setItem('rz-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('.room,.doc,.keyring,.v-photo,.ron,.bcard').forEach(function (el) { el.removeAttribute('style'); });
    setStage(stage, true); write(true); dust.kick(); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- opening: once per visit, tap to skip, never longer than ~1.8 s
  (function () {
    var op = $('[data-opening]');
    if (!root.classList.contains('opening')) return;
    try { sessionStorage.setItem('rz-open', '1'); } catch (e) {}
    var done = function () { root.classList.remove('opening'); };
    op.addEventListener('click', done);
    // ends when the sheet has lifted (the animation only runs once the page is painted); a cap in case it never runs
    $('.op-sheet', op).addEventListener('animationend', function (e) { if (e.animationName === 'sheetLift') done(); });
    setTimeout(done, 4000);
  })();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [8, 23], 1: [8, 23], 2: [8, 23], 3: [8, 23], 4: [8, 23], 5: [8.5, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
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
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- headline letters (CSS staggers them)
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 10 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // ---------------------------------------------------------------- reveals
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', i * 90 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- glyph decode: labels settle out of scrambled letters
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHIKLMNOPRSTUVWXYZ' };
  function decode(el, instant) {
    var l = he() ? 'he' : 'en', txt = el.dataset[l];
    clearInterval(el._t);
    if (instant || still() || !el._seen) { el.textContent = txt; return; }
    var n = 0, pool = GL[l];
    el._t = setInterval(function () {
      n += .5;
      el.textContent = txt.split('').map(function (c, i) { return c === ' ' || i < n ? c : pool[Math.floor(Math.random() * pool.length)]; }).join('');
      if (n >= txt.length) { clearInterval(el._t); el.textContent = txt; }
    }, 28);
  }
  $$('[data-decode]').forEach(function (d, i) {
    d.textContent = d.dataset[he() ? 'he' : 'en'];
    watch(d, function (v) { if (v && !d._seen) { d._seen = true; setTimeout(function () { decode(d); }, (i % 4) * 120 + (d.closest('.hero') ? 900 : 0)); } }, { threshold: .6 });
  });

  // ---------------------------------------------------------------- odometers (only real figures: 5.0 and 48)
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="sep" data-n="' + ch + '"></span>';
      var col = ''; for (var k = 0; k < 10; k++) col += '<i data-n="' + k + '"></i>';
      return '<span class="d" data-to="' + ch + '"><span>' + col + '</span></span>';
    }).join('');
    o.setAttribute('aria-label', o.dataset.odo);
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 6) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    if (still()) { roll(o, true); return; }
    roll(o, false);
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { requestAnimationFrame(function () { roll(o, true); }); ob.disconnect(); } }, { threshold: .4 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- hero: a lamp of real colour over the inked sea, Ron leans with the hand
  var hero = $('[data-hero]'), heroWrap = $('[data-herowrap]'), ron = $('[data-ron]'), heroOn = true, sx = .3, sy = .45, tx = .3, ty = .45, autoT = 0, hraf = 0, lastMove = 0;
  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var r = hero.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; lastMove = performance.now();
    if (!still()) ron.style.setProperty('--rx', ((tx - .5) * -18).toFixed(1) + 'px'), ron.style.setProperty('--ry', ((ty - .5) * -10).toFixed(1) + 'px');
    kickHero();
  });
  function heroFrame(t) {
    hraf = 0; if (still() || !heroOn) return;
    if (t - lastMove > 2500) { autoT += .006; tx = .5 + Math.sin(autoT * 1.3) * .32; ty = .42 + Math.sin(autoT * 2.1) * .12; }
    sx += (tx - sx) * .08; sy += (ty - sy) * .08;
    hero.style.setProperty('--sx', (sx * 100).toFixed(2) + '%'); hero.style.setProperty('--sy', (sy * 100).toFixed(2) + '%');
    hraf = requestAnimationFrame(heroFrame);
  }
  function kickHero() { if (!hraf) hraf = requestAnimationFrame(heroFrame); }
  watch(hero, function (v) { heroOn = v; kickHero(); });

  // ---------------------------------------------------------------- THE FILE: five stages
  var file = $('[data-file]'), room = $('[data-room]'), docs = $$('[data-doc]'), lis = $$('[data-stages] li'), tabs = $$('[data-go]'), stage = -1, fileP = 0;
  var ROT = ['-3deg', '2deg', '-1.5deg', '3deg', '0deg'];
  // state of every layer for a progress value 0..5 (stage s fully landed at s+1)
  function paintFile(p) {
    docs.forEach(function (d, i) {
      var t = smooth(p - i), under = 0;
      for (var j = i + 1; j < docs.length - 1; j++) under += smooth(p - j);
      d.style.setProperty('--in', t.toFixed(3)); d.style.setProperty('--rot', ROT[i]); d.style.setProperty('--under', Math.min(under, 3).toFixed(3));
    });
    docs[2].style.setProperty('--sig', smooth((p - 2.2) / .5).toFixed(3));
    docs[2].style.setProperty('--seal', smooth((p - 2.7) / .2).toFixed(3));
    docs[3].style.setProperty('--filed', smooth((p - 3.6) / .2).toFixed(3));
    room.style.setProperty('--plan', smooth(p / .8).toFixed(3));
    room.style.setProperty('--day', smooth((p - .6) / 4).toFixed(3));
    room.style.setProperty('--sun', smooth((p - 4.2) / .7).toFixed(3));
  }
  function setStage(s, force) {
    s = clamp(s, 0, 4); if (s === stage && !force) return; stage = s;
    lis.forEach(function (li, i) { li.classList.toggle('on', i === s); });
    tabs.forEach(function (t, i) { t.setAttribute('aria-selected', i === s ? 'true' : 'false'); });
    if (still()) paintFile(s + 1);
  }
  function goStage(s) {
    s = clamp(s, 0, 4);
    if (still()) { setStage(s); return; }
    var r = file.getBoundingClientRect(), span = file.offsetHeight - innerHeight, top = scrollY + r.top;
    scrollTo({ top: top + span * ((s + .75) / 5.4), behavior: 'smooth' });
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { goStage(+t.dataset.go); }); });
  $$('.file [data-step]').forEach(function (b) { b.addEventListener('click', function () { goStage(stage + +b.dataset.step); }); });
  setStage(0, true);

  // ---------------------------------------------------------------- RON: the card leans toward the hand; on phones it rocks with the scroll
  var card = $('[data-tilt]');
  if (fine) card.addEventListener('pointermove', function (e) {
    if (still()) return;
    var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.style.setProperty('--ty', ((x - .5) * 14).toFixed(2) + 'deg'); card.style.setProperty('--tx', ((.5 - y) * 10).toFixed(2) + 'deg');
    card.style.setProperty('--lx', (x * 100).toFixed(1) + '%'); card.style.setProperty('--ly', (y * 100).toFixed(1) + '%');
  });
  if (fine) card.addEventListener('pointerleave', function () { card.style.setProperty('--tx', '0deg'); card.style.setProperty('--ty', '0deg'); });

  // ---------------------------------------------------------------- PRACTICE: spotlight, scales follow the hand, the stamp presses
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });
  var scales = $('.scales'), liTile = $('.t-li'), bento = $('.bento'), bentoOn = false;
  liTile.addEventListener('pointermove', function (e) { if (still()) return; var r = liTile.getBoundingClientRect(); scales.style.setProperty('--tilt', (((e.clientX - r.left) / r.width - .5) * 16).toFixed(1) + 'deg'); });
  watch(bento, function (v) { bentoOn = v; });
  var stampG = $('.stampv .stamp'), inkC = $('.stampv .ink'), sway = 0;
  setInterval(function () {
    if (!bentoOn || still()) return;
    // the stamp comes down, leaves its ring of ink, lifts (WAAPI so repeats never stack)
    stampG.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(52px)', offset: .45 }, { transform: 'translateY(48px)', offset: .55 }, { transform: 'translateY(0)' }], { duration: 900, easing: 'cubic-bezier(.23,1,.32,1)' });
    inkC.animate([{ opacity: 0 }, { opacity: 0, offset: .45 }, { opacity: .9, offset: .5 }, { opacity: 0 }], { duration: 2600, easing: 'ease-out' });
    if (!fine) { sway = sway > 0 ? -7 : 7; scales.style.setProperty('--tilt', sway + 'deg'); }
    $$('.tile').forEach(function (t, i) { if (!fine) t.classList.toggle('lit', i === Math.floor(Date.now() / 2800) % 4); });
  }, 2800);

  // ---------------------------------------------------------------- REVIEWS: the top slip goes back under the pile
  var pile = $('[data-pile]'), slips = $$('.slip-r', pile), order = slips.map(function (_, i) { return i; }), pileOn = false, pileHover = false, lastFlip = 0, cnt = $('[data-pile-count]');
  function sizePile() { pile.style.height = Math.max.apply(null, slips.map(function (x) { return x.offsetHeight; })) + 'px'; }
  addEventListener('resize', sizePile);
  function paintPile() {
    order.forEach(function (si, k) { var s = slips[si]; s.style.setProperty('--k', Math.min(k, 4)); s.classList.toggle('top', k === 0); s.setAttribute('aria-hidden', k === 0 ? 'false' : 'true'); });
    cnt.textContent = (order[0] + 1) + ' / ' + slips.length;
  }
  function flip(dir) {
    var top = slips[order[0]];
    lastFlip = Date.now();
    if (still()) { order.push(order.shift()); paintPile(); return; }
    top.style.setProperty('--dir', dir || (rtl() ? 1 : -1)); top.classList.add('out');
    setTimeout(function () { order.push(order.shift()); top.classList.remove('out'); paintPile(); }, 380);
  }
  $('[data-pile-next]').addEventListener('click', function () { flip(); });
  pile.addEventListener('pointerenter', function () { pileHover = true; });
  pile.addEventListener('pointerleave', function () { pileHover = false; });
  var sx0 = null;
  pile.addEventListener('pointerdown', function (e) { sx0 = e.clientX; });
  pile.addEventListener('pointerup', function (e) { if (sx0 !== null && Math.abs(e.clientX - sx0) > 40) flip(e.clientX < sx0 ? -1 : 1); sx0 = null; });
  watch(pile, function (v) { pileOn = v; if (v) lastFlip = Date.now(); });
  setInterval(function () { if (pileOn && !pileHover && !still() && Date.now() - lastFlip > 6000) flip(); }, 1000);
  paintPile(); sizePile(); if (document.fonts) document.fonts.ready.then(sizePile);

  // ---------------------------------------------------------------- OPEN A FILE: key tag engraving + WhatsApp message
  var groups = $$('[data-group]'), msgEl = $('[data-msg]'), eng = $('[data-engrave]'), shown = '', typing = 0, chatSeen = false;
  groups.forEach(function (g) {
    var bs = $$('.ktag', g);
    bs.forEach(function (b) { b.addEventListener('click', function () { bs.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); write(); }); });
  });
  function pick(name) { var b = $('[data-group="' + name + '"] .ktag[aria-pressed="true"]'); return b; }
  function compose() {
    var l = he(), d = pick('deal'), p = pick('prop'), dv = d.dataset[l ? 'he' : 'en'], pv = p.dataset[l ? 'he' : 'en'];
    return (l ? 'שלום רון, ' : 'Hi Ron, ') + dv.replace('{p}', pv) + (l ? '. אפשר לתאם שיחה?' : '. Could we arrange a call?');
  }
  function engrave() {
    var l = he(), d = pick('deal'), p = pick('prop');
    var a = $('[lang="' + (l ? 'he' : 'en') + '"]', d).textContent, b = $('[lang="' + (l ? 'he' : 'en') + '"]', p).textContent;
    var txt = a + ' · ' + b;
    if (still() || !chatSeen) { eng.textContent = txt; return; }
    eng.animate([{ opacity: .2, filter: 'blur(3px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 420, easing: 'cubic-bezier(.23,1,.32,1)' });
    eng.textContent = txt;
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    engrave();
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
  watch($('[data-chat]'), function (v) { if (v && !chatSeen && !still()) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .35 });

  // ---------------------------------------------------------------- FOOTER: gold dust gathers into the monogram from the real logo
  var dust = (function () {
    var foot = $('[data-foot]'), cv = $('[data-dust]'), src = $('[data-dustsrc]'), c = cv.getContext('2d'), P = [], w = 0, h = 0, raf = 0, on = false, t0 = 0, ok = false;
    function sample() {
      var s = document.createElement('canvas'), sw = 110, sh = Math.round(sw * src.naturalHeight / src.naturalWidth); s.width = sw; s.height = sh;
      var x = s.getContext('2d'); x.drawImage(src, 0, 0, sw, sh);
      var d = x.getImageData(0, 0, sw, sh).data; P = [];
      for (var y = 0; y < sh; y += 2) for (var i = 0; i < sw; i += 2) { var k = (y * sw + i) * 4; if (d[k + 3] > 120) P.push({ u: i / sw, v: y / sh, gold: d[k] > d[k + 2], a: Math.random() * 6.28, r: .4 + Math.random(), sp: .3 + Math.random() * .7 }); }
      ok = P.length > 0;
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = foot.clientWidth; h = foot.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(t) {
      raf = 0; if (!ok) return;
      var calm = still(), fr = foot.getBoundingClientRect(), e = calm ? 1 : smooth((innerHeight - fr.top) / (Math.min(fr.height, innerHeight) * .85)), S = Math.min(w * (phone() ? .62 : .32), h * .62), ox = rtl() ? w * (phone() ? .2 : .1) : w - S - w * (phone() ? .2 : .1), oy = phone() ? h * .06 : h * .12;
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], fx = ox + p.u * S, fy = oy + p.v * S, wob = calm ? 0 : Math.sin(t / 900 * p.sp + p.a) * 1.6;
        var sxp = (p.u * w * 1.3 + Math.cos(p.a) * w * .3) % w, syp = h * (.4 + .6 * ((p.a * 97) % 1));
        var x = sxp + (fx - sxp) * e + wob, y = syp + (fy - syp) * e + Math.cos(t / 1100 * p.sp + p.a) * 1.2;
        c.fillStyle = p.gold ? 'rgba(236,212,151,' + (.35 + .55 * e) + ')' : 'rgba(158,156,226,' + (.25 + .5 * e) + ')';
        c.fillRect(x, y, p.r + 1.6, p.r + 1.6);
      }
      if (!calm && on) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!ok) return; if (!raf) raf = requestAnimationFrame(frame); }
    function start() { size(); sample(); kick(); }
    watch(foot, function (v) { on = v; kick(); });
    if (src.complete && src.naturalWidth) start(); else src.addEventListener('load', start);
    addEventListener('resize', function () { size(); kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var nav = $('[data-nav]'), visit = $('[data-visit]'), vphoto = $('[data-vphoto]'), vcards = $('[data-vcards]'), ftab = $('[data-ftab]'), heroActs = $('.h-acts'), fText = $('.file-text');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    dust.kick();
    // the hero leans back under the file riding over it
    var hr = heroWrap.getBoundingClientRect(), hp = calm ? 0 : clamp(-hr.top / vh, 0, 1);
    hero.style.transform = calm || hp <= 0 ? '' : 'scale(' + (1 - hp * .06).toFixed(4) + ')';
    hero.style.filter = calm || hp <= 0 ? '' : 'brightness(' + (1 - hp * .5).toFixed(3) + ')';
    // the file
    if (calm) { setStage(stage, true); }
    else {
      if (phone()) file.style.setProperty('--textH', fText.offsetHeight + 'px');
      var fp = prog(file) * 5.4; fileP = fp;
      paintFile(clamp(fp, 0, 5));
      setStage(Math.floor(clamp(fp - .25, 0, 4.99)));
    }
    // visit: the beach photo shrinks into its frame, the cards rise
    if (!calm && innerWidth > 1000) {
      var vp = smooth(prog(visit) / .6), W = vphoto.parentNode.clientWidth, Hh = vphoto.parentNode.clientHeight, pad = parseFloat(getComputedStyle(vphoto.parentNode).paddingInlineStart) || 16, t, b, s, en;
      if (phone()) { t = 70; b = Hh - 70 - Math.min(Hh * .34, 260); s = pad; en = pad; vcards.style.paddingTop = ''; }
      else { t = 80; b = 80; s = W / 2 + 13; en = pad; }
      var L = rtl() ? en : s, R = rtl() ? s : en;
      vphoto.style.setProperty('--pt', (t * vp).toFixed(1) + 'px'); vphoto.style.setProperty('--pb', (b * vp).toFixed(1) + 'px');
      vphoto.style.setProperty('--pl', (L * vp).toFixed(1) + 'px'); vphoto.style.setProperty('--pr', (R * vp).toFixed(1) + 'px');
      vphoto.style.setProperty('--pls', ((rtl() ? R : L) * vp).toFixed(1) + 'px'); vphoto.style.setProperty('--prad', (22 * vp).toFixed(1) + 'px');
      var cv = smooth((vp - .8) / .2);
      vcards.style.opacity = cv.toFixed(3); vcards.style.transform = cv >= 1 ? '' : 'translateY(' + ((1 - cv) * 40).toFixed(1) + 'px)';
      vcards.style.pointerEvents = cv > .5 ? '' : 'none';
    } else { vcards.style.opacity = ''; vcards.style.transform = ''; vcards.style.pointerEvents = ''; ['--pt','--pb','--pl','--pr','--pls','--prad'].forEach(function (k) { vphoto.style.removeProperty(k); }); }
    // phones: the file tab slides out once the hero's buttons are gone, and hides over the footer
    var ar = heroActs.getBoundingClientRect(), fr = $('[data-foot]').getBoundingClientRect();
    ftab.classList.toggle('show', ar.bottom < 0 && fr.top > vh * .6);
  }
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', tick);

  texts(root.lang === 'en' ? 'en' : 'he'); hours(); write(true); update();
})();
