(function () {
  var root = document.documentElement, WA = '972525677282';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 700; };
  var hover = matchMedia('(hover: hover)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'ערן טבק שירותי מיחשוב · תיקון ומכירת מחשבים · י.ל. פרץ 9, קריית ים', en: 'Eran Tabak Computer Services · Computer repair & sales · 9 Y.L. Peretz St, Kiryat Yam' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור ערן טבק שירותי מיחשוב · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Eran Tabak Computer Services · This is not the business’s official website' };
  var GLY = '01<>/#%&+=*{}[]';

  // glyph decode: the text settles out of scrambled characters
  function decode(el, text, ms) {
    cancelAnimationFrame(el._dec);
    if (still() || !ms) { el.textContent = text; return; }
    var t0 = performance.now();
    (function f(t) {
      var k = clamp((t - t0) / ms, 0, 1), n = Math.floor(k * text.length), s = text.slice(0, n);
      for (var i = n; i < text.length; i++) s += text[i] === ' ' ? ' ' : GLY[(Math.random() * GLY.length) | 0];
      el.textContent = s;
      if (k < 1) el._dec = requestAnimationFrame(f);
    })(t0);
  }

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'ערן טבק שירותי מיחשוב', 'Eran Tabak Computer Services');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-parts]', 'חלקים', 'Parts');
    aria('[data-t-prev]', 'הקודם', 'Previous');
    aria('[data-t-next]', 'הבא', 'Next');
    aria('[data-t-visit]', 'ביקור ויצירת קשר', 'Visit and contact');
    aria('[data-t-call]', 'התקשרו לערן, 052-567-7282', 'Call Eran, 052-567-7282');
    aria('[data-t-wa]', 'וואטסאפ לערן', 'WhatsApp Eran');
    $('[data-t-map]').title = l === 'he' ? 'מפה: י.ל. פרץ 9, קריית ים' : 'Map: 9 Y.L. Peretz St, Kiryat Yam';
    $('[data-fit]').setAttribute('aria-label', l === 'he' ? 'ערן טבק' : 'Eran Tabak');
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('et-lang', l); } catch (e) {}
    texts(l); hours(); callouts(true); labShow(stage, true); monShow(cur, true); write(true); fit(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('et-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-seat]').forEach(function (el) { el.classList.add('in'); });
    $('[data-foot]').classList.add('in');
    deck.style.transform = ''; deck.style.opacity = '';
    hmedia.style.transform = ''; hmedia.style.filter = '';
    labShow(stage, true); layout(); ringKick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [8, 20], 1: [8, 20], 2: [8, 20], 3: [8, 20], 4: [8, 20], 5: [8, 16], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
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

  // ---------------------------------------------------------------- entrances
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); });
  $$('.vb [data-seat]').forEach(function (t, i) { t.style.setProperty('--d', i * 90 + 'ms'); });
  $$('section').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-seat]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // letters
  function split(el) {
    $$('span[lang]', el).forEach(function (sp) {
      var i = 0;
      sp.innerHTML = sp.textContent.split(' ').map(function (w) {
        return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  }
  split($('.h-name')); split($('.f-name'));

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (300 + i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { setTimeout(function () { roll(o, true); }, 30); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- hero: a spotlight in the dim shop, callouts typed onto the photo
  var hero = $('[data-hero]'), hmedia = $('[data-hmedia]'), lit = $('.h-lit'), cos = $$('.co'), IW = 1600, IH = 900, OX = .62, OY = .40;
  function cover() { var w = hmedia.clientWidth, h = hmedia.clientHeight, s = Math.max(w / IW, h / IH); return { s: s, x: (w - IW * s) * OX, y: (h - IH * s) * OY, w: w, h: h }; }
  function callouts(re) {
    var c = cover();
    cos.forEach(function (co) {
      var p = co.dataset.pt.split(','), x = c.x + p[0] * c.s, y = c.y + p[1] * c.s;
      co.style.left = x + 'px'; co.style.top = y + 'px';
      var textSide = phone() ? true : (he() ? x > c.w * .42 : x < c.w * .58);
      co.style.display = x < 10 || x > c.w - 10 || y < 90 || y > c.h * (textSide ? .5 : .78) ? 'none' : '';
      co.classList.toggle('flip', x > c.w * .62);
      if (re && co._done) $('b', co).textContent = co.dataset[he() ? 'he' : 'en'];
    });
  }
  function typeCallouts() {
    cos.forEach(function (co, i) { setTimeout(function () { co._done = true; decode($('b', co), co.dataset[he() ? 'he' : 'en'], 600); }, still() ? 0 : 900 + i * 380); });
  }
  var sx = .62, sy = .3, tx = sx, ty = sy, autoT = 0, userAt = 0, spotRaf = 0;
  function spot() {
    spotRaf = 0;
    if (!userAt || performance.now() - userAt > 2500) {
      autoT += .004; var c = cover(), pts = cos.map(function (co) { var p = co.dataset.pt.split(','); return [(c.x + p[0] * c.s) / c.w, (c.y + p[1] * c.s) / c.h]; });
      var k = autoT % pts.length, a = pts[Math.floor(k)], b = pts[(Math.floor(k) + 1) % pts.length], f = smooth((k % 1) * 1.6 - .3);
      tx = a[0] + (b[0] - a[0]) * f; ty = a[1] + (b[1] - a[1]) * f;
    }
    sx += (tx - sx) * .08; sy += (ty - sy) * .08;
    lit.style.setProperty('--sx', (sx * 100).toFixed(2) + '%'); lit.style.setProperty('--sy', (sy * 100).toFixed(2) + '%');
    lit.style.setProperty('--sr', Math.round(Math.max(170, Math.min(innerWidth, 1400) * .22)) + 'px');
    if (heroOn && !still()) spotRaf = requestAnimationFrame(spot);
  }
  var heroOn = true;
  watch(hero, function (v) { heroOn = v; if (v && !spotRaf && !still()) spotRaf = requestAnimationFrame(spot); });
  hero.addEventListener('pointermove', function (e) { var r = hmedia.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; userAt = performance.now(); });

  // ---------------------------------------------------------------- the lab: scan, lift the keyboard deck, light each part
  var lab = $('[data-lab]'), lap = $('[data-lap]'), deck = $('[data-deck]'), leds = $$('[data-part]'), ron = $('[data-ron]'), rot = $('[data-rot]'), tagl = $('[data-tagl]'), scan = $('.scan');
  var ST = { he: ['החלפת מסך שבור', 'החלפת מקלדת אחרי רטיבות או מקשים שבורים', 'החלפת שקע טעינה', 'תיקון לוח אם, עד רמת הצ׳יפסט'], en: ['Cracked screens, replaced', 'Keyboards after spills or broken keys', 'Charging ports, replaced', 'Motherboard repair, down to the chipset'] };
  var LB = { he: ['מסך', 'מחבר מקלדת', 'שקע טעינה', 'צ׳יפסט'], en: ['Screen', 'Keyboard connector', 'Charging port', 'Chipset'] };
  var PT = [[265, 112], [297, 512], [503, 406], [317, 460]], MID = [.12, .38, .62, .88], stage = -1;
  function labShow(s, force) {
    if (s === stage && !force) return;
    stage = s; var l = he() ? 'he' : 'en';
    lap.dataset.stage = s;
    if (still()) lap.dataset.open = s >= 1 ? '1' : '0'; else lap.removeAttribute('data-open');
    leds.forEach(function (b, i) { b.setAttribute('aria-selected', i === s ? 'true' : 'false'); b.tabIndex = i === s ? 0 : -1; });
    ron.textContent = (s + 1) + '/4';
    decode(rot, ST[l][s], force ? 0 : 420);
    tagl.textContent = LB[l][s];
    tagl.style.left = clamp(PT[s][0] / 526 * 100, 20, 80) + '%'; tagl.style.top = (PT[s][1] / 705 * 100) + '%';
  }
  function goStage(s) {
    s = (s + 4) % 4;
    if (still()) { labShow(s); return; }
    var top = lab.getBoundingClientRect().top + scrollY, span = lab.offsetHeight - innerHeight;
    scrollTo({ top: top + MID[s] * span, behavior: 'smooth' });
  }
  leds.forEach(function (b, i) { b.addEventListener('click', function () { goStage(i); }); });
  $$('[data-labstep]').forEach(function (b) { b.addEventListener('click', function () { goStage(stage + (+b.dataset.labstep) * (he() ? 1 : 1)); }); });
  $('.leds').addEventListener('keydown', function (e) { var d = e.key === 'ArrowLeft' ? (he() ? 1 : -1) : e.key === 'ArrowRight' ? (he() ? -1 : 1) : 0; if (d) { e.preventDefault(); goStage(stage + d); setTimeout(function () { leds[stage].focus(); }, 50); } });

  // ---------------------------------------------------------------- services: the bus lines draw in, spotlight under the hand
  var svc = $('[data-svc]'), bus = $$('[data-bus] path');
  bus.forEach(function (p) { p.setAttribute('pathLength', '1'); });
  watch(svc, function (v) { svc.classList.toggle('on', v); });
  var bento = $('[data-spot]');
  bento.addEventListener('pointermove', function (e) { $$('.tile', bento).forEach(function (t) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  bento.addEventListener('pointerleave', function () { $$('.tile', bento).forEach(function (t) { t.style.removeProperty('--mx'); t.style.removeProperty('--my'); }); });

  // ---------------------------------------------------------------- the ring of his photos: turns by itself, with the scroll and with a drag
  var rwrap = $('[data-ringwrap]'), ring = $('[data-ring]'), cards = $$('.rc', ring), N = cards.length, rot0 = 0, drag = 0, vel = 0, ringOn = false, rraf = 0, lastT = 0, dragging = false, px0 = 0;
  function R() { var cw = cards[0].offsetWidth || 200; return Math.max(cw * 1.1 / (2 * Math.tan(Math.PI / N)), phone() ? 260 : Math.min(innerWidth * .36, 520)); }
  function ringFrame(t) {
    rraf = 0;
    if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.opacity = ''; }); return; }
    var dt = lastT ? Math.min(50, t - lastT) : 16; lastT = t;
    if (!dragging) { rot0 += dt * .006 + vel; vel *= .94; }
    var sc = (scrollY - (rwrap.offsetTop || 0)) * .08, r = R();
    cards.forEach(function (c, i) {
      var a = i * 360 / N + rot0 + sc + drag, rad = a * Math.PI / 180, z = Math.cos(rad);
      c.style.transform = 'translate(-50%,-50%) rotateY(' + a.toFixed(2) + 'deg) translateZ(' + r.toFixed(0) + 'px) rotateX(-4deg)';
      c.style.opacity = (0.35 + .65 * smooth((z + 1) / 2)).toFixed(3);
      c.style.zIndex = Math.round(z * 100) + 100;
    });
    if (ringOn) rraf = requestAnimationFrame(ringFrame);
  }
  function ringKick() { lastT = 0; if (!rraf) rraf = requestAnimationFrame(ringFrame); }
  watch(rwrap, function (v) { ringOn = v; if (v) ringKick(); });
  rwrap.addEventListener('pointerdown', function (e) { if (still()) return; dragging = true; px0 = e.clientX; rwrap.setPointerCapture(e.pointerId); });
  rwrap.addEventListener('pointermove', function (e) { if (!dragging) return; var d = (e.clientX - px0) * .25; px0 = e.clientX; drag += d; vel = d * .2; });
  ['pointerup', 'pointercancel'].forEach(function (n) { rwrap.addEventListener(n, function () { dragging = false; }); });

  // ---------------------------------------------------------------- reviews on the shop's screen
  var rvs = $$('.rv'), msname = $('[data-msname]'), msq = $('[data-msq]'), cur = 0, picked = false, revOn = false;
  function monShow(i, inst) {
    cur = i; var l = he() ? 'he' : 'en', rv = rvs[i];
    rvs.forEach(function (r, k) { r.classList.toggle('on', k === i); });
    msname.textContent = rv.dataset['name' + (l === 'he' ? 'He' : 'En')];
    decode(msq, rv.dataset['short' + (l === 'he' ? 'He' : 'En')], inst ? 0 : 520);
  }
  rvs.forEach(function (r, i) { r.tabIndex = 0; r.addEventListener('click', function () { picked = true; monShow(i); }); r.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); picked = true; monShow(i); } }); });
  watch($('[data-revs]'), function (v) { revOn = v; });
  setInterval(function () { if (revOn && !picked && !still()) monShow((cur + 1) % rvs.length); }, 5200);

  // ---------------------------------------------------------------- the repair tag
  var devs = $$('[data-dev]'), dips = $$('.dip'), slide = $('[data-slide]'), nameIn = $('[data-name]'), msgEl = $('[data-msg]'), sendA = $('[data-send]'), tagc = $('.tagc'), shown = '', typing = 0, tagSeen = false;
  var dev = 0;
  devs.forEach(function (b, i) { b.addEventListener('click', function () { dev = i; devs.forEach(function (x, k) { x.setAttribute('aria-checked', k === i ? 'true' : 'false'); }); slide.style.setProperty('--k', i); $('[data-dips]').style.opacity = i === 3 ? '.45' : ''; write(); }); });
  dips.forEach(function (d) { d.addEventListener('click', function () { d.setAttribute('aria-pressed', d.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); write(); }); });
  nameIn.addEventListener('input', function () { write(); });
  function compose() {
    var l = he(), nm = nameIn.value.trim().slice(0, 40), probs = dips.filter(function (d) { return d.getAttribute('aria-pressed') === 'true'; }).map(function (d) { return d.dataset[l ? 'he' : 'en']; }).join(', ');
    var pr = probs ? ' (' + probs + ')' : '';
    if (l) {
      var a = nm ? 'שלום ערן, כאן ' + nm + '. ' : 'שלום ערן, ';
      return a + [ 'יש לי מחשב נייד שצריך טיפול' + pr + '. מתי אפשר להביא אותו?', 'יש לי מחשב נייח שצריך טיפול' + pr + '. מתי אפשר להביא אותו?', 'יש לי תקלה ברשת או במדפסת' + pr + '. מתי אפשר לתאם?', 'אשמח לשמוע על המחשבים החדשים והמחודשים שיש בחנות.' ][dev];
    }
    var b = nm ? 'Hi Eran, this is ' + nm + '. ' : 'Hi Eran, ';
    return b + [ 'I have a laptop that needs fixing' + pr + '. When can I bring it in?', 'I have a desktop that needs fixing' + pr + '. When can I bring it in?', 'I have a network or printer problem' + pr + '. When could we set a time?', 'I’d like to hear about the new and refurbished computers in the shop.' ][dev];
  }
  function write(instant) {
    var target = compose();
    sendA.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !tagSeen) { shown = target; msgEl.textContent = target; msgEl.classList.remove('typing'); return; }
    tagc.classList.remove('bump'); void tagc.offsetWidth; tagc.classList.add('bump');
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var from = shown, t0 = performance.now(), del = from.length - keep;
    msgEl.classList.add('typing');
    (function st(t) {
      var n = Math.floor((t - t0) / 14);
      shown = n < del ? from.slice(0, from.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st); else msgEl.classList.remove('typing');
    })(t0);
  }
  watch($('[data-tagcard]'), function (v) { if (v && !tagSeen) { tagSeen = true; if (!still()) { shown = ''; write(); } } }, { threshold: .4 });

  // ---------------------------------------------------------------- footer: the name fits its width and rises
  var foot = $('[data-foot]'), fname = $('[data-fit]');
  function fit() { fname.style.fontSize = '100px'; var w = $('.f-in').clientWidth - 2 * parseFloat(getComputedStyle($('.f-in')).paddingLeft), s = fname.scrollWidth; fname.style.fontSize = Math.floor(100 * w / s * .98) + 'px'; }
  watch(foot, function (v) { if (v) foot.classList.add('in'); }, { threshold: .2 });

  // ---------------------------------------------------------------- one scroll loop
  var cbar = $('.concept'), nav = $('[data-nav]'), dock = $('[data-dock]'), visitActs = $('.vb'), ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    nav.style.setProperty('--cb', (cbar.offsetHeight + 6) + 'px');
    // the lab lands over the hero: the shop sinks and dims behind it
    var lr = lab.getBoundingClientRect();
    if (!calm) {
      var c = clamp(1 - lr.top / vh, 0, 1);
      hmedia.style.transform = 'scale(' + (1 - c * .08).toFixed(4) + ')';
      hmedia.style.filter = c > 0 ? 'brightness(' + (1 - c * .5).toFixed(3) + ')' : '';
    }
    // the lab
    if (!calm) {
      var p = prog(lab), s = p < .27 ? 0 : p < .5 ? 1 : p < .74 ? 2 : 3, o = smooth((p - .22) / .2);
      labShow(s);
      deck.style.transform = 'translateY(' + (o * 60).toFixed(1) + '%) rotateX(' + (-o * 70).toFixed(1) + 'deg)';
      deck.style.opacity = (1 - smooth((p - .3) / .12)).toFixed(3);
      var sp = clamp(p / .2, 0, 1);
      scan.style.setProperty('--scan', (-100 + sp * 560).toFixed(1) + '%');
      scan.style.setProperty('--scano', (p < .22 ? Math.sin(sp * Math.PI) : 0).toFixed(3));
    } else { scan.style.setProperty('--scano', 0); }
    // the bus lines draw as services arrive
    var br = svc.getBoundingClientRect(), bp = calm ? 1 : smooth((vh - br.top) / (vh * .7));
    bus.forEach(function (pth) { pth.style.setProperty('--bus', (1 - bp).toFixed(3)); });
    // the dock steps aside where the big contact keys are
    var vr = visitActs.getBoundingClientRect();
    dock.classList.toggle('hide', vr.top < vh && vr.bottom > 0);
    if (ringOn) ringKick();
  }
  function layout() { callouts(); fit(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  // ---------------------------------------------------------------- opening: logo from its own pixels, photos dealt, the shop becomes the hero
  var boot = $('[data-boot]');
  function intro(done) {
    if (still() || scrollY > 50 || location.hash) { done(); return; }
    var seen = false; try { seen = sessionStorage.getItem('et-boot'); sessionStorage.setItem('et-boot', '1'); } catch (e) {}
    if (seen) { done(); return; }
    boot.classList.add('on');
    var cv = $('[data-bootpx]'), cx = cv.getContext('2d'), img = new Image(), lines = $('[data-bootlines]'), parts = [], t0;
    var L = ['CPU ........ OK', 'RAM ........ OK', 'DISK ....... OK'];
    img.onload = function () {
      var W = 255, Hh = 85, dpr = Math.min(2, devicePixelRatio || 1); cv.width = W * 2 * dpr; cv.height = Hh * 2 * dpr; cx.scale(2 * dpr, 2 * dpr);
      var off = document.createElement('canvas'); off.width = W; off.height = Hh; var oc = off.getContext('2d'); oc.drawImage(img, 0, 0);
      var d; try { d = oc.getImageData(0, 0, W, Hh).data; } catch (e) { d = null; }
      if (d) for (var y = 0; y < Hh; y += 2) for (var x = 0; x < W; x += 2) { var k = (y * W + x) * 4; if (d[k + 3] > 120) parts.push({ x: x, y: y, c: 'rgb(' + d[k] + ',' + d[k + 1] + ',' + d[k + 2] + ')', ox: Math.random() * W, oy: Hh + Math.random() * 60 - 30, dl: Math.random() * .35 }); }
      t0 = performance.now();
      (function f(t) {
        var k = (t - t0) / 650; cx.clearRect(0, 0, W, Hh);
        if (!parts.length) cx.drawImage(img, 0, 0);
        parts.forEach(function (p) { var e = smooth((k - p.dl) / .65); cx.fillStyle = p.c; cx.fillRect(p.ox + (p.x - p.ox) * e, p.oy + (p.y - p.oy) * e, 2, 2); });
        lines.textContent = L.slice(0, Math.min(3, Math.floor(k * 4))).join('\n');
        if (k < 1.05) requestAnimationFrame(f); else cx.drawImage(img, 0, 0);
      })(t0);
    };
    img.onerror = function () { done(); boot.classList.remove('on'); };
    img.src = 'img/logo.png';
    setTimeout(function () { boot.classList.add('deal'); }, 650);
    setTimeout(function () {
      var last = $('[data-lastcard]'), r = last.getBoundingClientRect(), s = Math.max(innerWidth / r.width, innerHeight / r.height) * 1.02;
      boot.classList.add('grow');
      last.style.transform = 'translate(-50%,-50%) scale(' + s.toFixed(3) + ')'; last.style.top = '50%'; last.style.borderRadius = '0';
    }, 1050);
    setTimeout(function () { boot.classList.add('out'); done(); }, 1550);
    setTimeout(function () { boot.classList.remove('on'); }, 1950);
  }

  texts(root.lang); hours(); labShow(0, true); monShow(0, true); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); typeCallouts(); if (!still()) spotRaf = requestAnimationFrame(spot); }); };
  intro(function () { if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); setTimeout(go, 900); });
  addEventListener('load', function () { callouts(); fit(); tick(); });
})();
