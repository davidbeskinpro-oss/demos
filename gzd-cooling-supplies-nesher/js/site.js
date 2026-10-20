(function () {
  var root = document.documentElement, WA = '972505513876';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: "ג'י.זי.די ספקי קרור ומיזוג · חלקים, גז, כלים ומזגנים · המסילה 21, נשר", en: 'G.Z.D Refrigeration Suppliers · Parts, refrigerant, tools and AC · 21 HaMesila St, Nesher' };
  var CONCEPT = { he: "קונספט לדוגמה שנבנה עבור ג'י.זי.די ספקי קרור ומיזוג · זה אינו האתר הרשמי של העסק", en: 'A sample concept built for G.Z.D Refrigeration Suppliers · This is not the business’s official website' };
  var STAR = '<svg viewBox="0 0 92 16" aria-hidden="true">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; }).join('') + '</svg>';
  $$('[data-stars]').forEach(function (s) { s.innerHTML = STAR; });

  // ---------------------------------------------------------------- language
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    try { localStorage.setItem('gzd-lang', l); } catch (e) {}
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $$('[data-aria-he]').forEach(function (el) { el.setAttribute('aria-label', el.dataset[l === 'he' ? 'ariaHe' : 'ariaEn']); });
    var aria = function (sel, h, e) { var el = $(sel); if (el) el.setAttribute('aria-label', l === 'he' ? h : e); };
    aria('[data-pill]', 'ראשי', 'Main');
    aria('[data-g-call]', 'התקשרו לחנות, 050-551-3876', 'Call the shop, 050-551-3876');
    aria('[data-g-wa]', 'וואטסאפ לחנות', 'WhatsApp the shop');
    var cap = $('#sys-cap'); if (cap) cap.textContent = l === 'he' ? 'שרטוט: יחידה חיצונית שמזינה יחידות פנימיות דרך קווי נחושת' : 'Drawing: an outdoor unit feeding indoor units through copper lines';
    hours(); write(); sysWa();
    if (window.__frost) window.__frost.layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var turnOn = still();
    root.classList.toggle('still', !turnOn); delete root.dataset.motionAuto;
    try { localStorage.setItem('gzd-motion', turnOn ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    vizAll();
    if (turnOn) loadFrost(); else if (window.__frost) window.__frost.stop();
    needles(0); write();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed that day
  var H = { 0: [7.5, 17], 1: [7.5, 17], 2: [7.5, 17], 3: [7.5, 17], 4: [7.5, 17], 5: [7.5, 13], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, short, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; short = l ? 'פתוח' : 'Open'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); short = l ? 'פתוח עד ' + hhmm(t[1]) : 'Open until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); short = l ? 'נפתח ב-' + hhmm(t[0]) : 'Opens ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
      short = l ? 'סגור עכשיו' : 'Closed now';
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-status-short]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + short; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // consecutive days with the same hours share a row
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var two = r[1] - r[0] === 1;
      var label = r[0] === r[1] ? names[r[0]] : names[r[0]] + (two ? (l ? ' ו' : ' and ') : '–') + names[r[1]];
      var time = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + label + '</td><td>' + time + '</td></tr>';
    }).join('');
    status();
  }
  window.__status = status; window.__H = H; window.__hours = hours;
  setInterval(status, 60000);

  // ---------------------------------------------------------------- the order: drawers pulled out become the list, the bar writes the message
  var PARTS = {
    he: { gas: 'גז קירור', vac: 'משאבת ואקום', pipe: 'צנרת ובידוד', motor: 'מנוע למאוורר', remote: 'שלט למזגן', prot: 'מגן מנוע', tools: 'כלי עבודה', ac: 'מזגן תדיראן', other: 'חלק אחר' },
    en: { gas: 'refrigerant', vac: 'a vacuum pump', pipe: 'pipe and insulation', motor: 'a fan motor', remote: 'an AC remote', prot: 'a motor protector', tools: 'tools', ac: 'a Tadiran air conditioner', other: 'another part' }
  };
  var T = {
    he: { hi: "שלום ג'י.זי.די, הגעתי דרך האתר. ", ask: 'אשמח לבדוק אם יש לכם: ', none: 'אשמח לבדוק אם יש לכם חלק שאני צריך.', det: ' פרטים: ', end: ' תודה', ph: 'דגם, מידה או כמות…', pw: 'השם שלכם (לא חובה)…', lab: 'דגם, מידה או כמות' },
    en: { hi: 'Hi G.Z.D, I found you through your website. ', ask: 'Could you check if you have ', none: 'Could you check if you have a part I need?', det: ' Details: ', end: ' Thanks', ph: 'Model, size or quantity…', pw: 'Your name (optional)…', lab: 'Model, size or quantity' }
  };
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]'), detail = $('[name=detail]'), who = $('[name=who]'), dlab = $('[data-detail-label]');
  function list(a, l) {
    if (a.length < 2) return a.join('');
    return l === 'he' ? a.slice(0, -1).join(', ') + ' ו' + a[a.length - 1] : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
  }
  function message() {
    var l = root.lang === 'en' ? 'en' : 'he', t = T[l];
    var picked = $$('input[name=part]:checked', form).map(function (i) { return PARTS[l][i.value]; });
    var d = (detail.value || '').trim().slice(0, 90), w = (who.value || '').trim().slice(0, 40);
    var m = t.hi + (picked.length ? t.ask + list(picked, l) + (l === 'he' ? '.' : '?') : t.none);
    if (d) m += t.det + d + (/[.!?]$/.test(d) ? '' : '.');
    m += t.end + (w ? (l === 'he' ? ', ' : ', ') + w : '') + '.';
    return m;
  }
  function write() {
    var l = root.lang === 'en' ? 'en' : 'he';
    detail.placeholder = T[l].ph; who.placeholder = T[l].pw; dlab.textContent = T[l].lab;
    var m = message();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    type(m);
  }
  var typeT = 0, lastM = '';
  function type(m) {
    clearInterval(typeT);
    // typing only where it helps: when the list changes. Typing in the fields shows the text straight away.
    if (still() || !lastM || m.indexOf(lastM) === 0 || lastM.indexOf(m) === 0) { preview.textContent = m; lastM = m; return; }
    var common = 0; while (common < m.length && m[common] === lastM[common]) common++;
    lastM = m;
    var i = common;
    typeT = setInterval(function () {
      i = Math.min(m.length, i + 3);
      preview.textContent = m.slice(0, i);
      if (i < m.length) preview.insertAdjacentHTML('beforeend', '<span class="caret"></span>'); else clearInterval(typeT);
    }, 16);
  }
  form.addEventListener('change', write);
  detail.addEventListener('input', write);
  who.addEventListener('input', write);

  // ---------------------------------------------------------------- systems: tabs switch the drawing; lines carry refrigerant while in view
  var art = $('.sysart'), tabs = $$('[data-cfg]'), sysWaA = $('[data-sys-wa]');
  $$('.lines path', art).forEach(function (p) { var c = p.cloneNode(); c.classList.add('fl'); p.parentNode.appendChild(c); });
  var SYS = { he: { wall: 'מזגן עילי', mini: 'מזגן מיני מרכזי', vrf: 'מערכת VRF' }, en: { wall: 'a wall split unit', mini: 'a mini-central unit', vrf: 'a VRF system' } };
  function sysWa() {
    var l = he() ? 'he' : 'en', c = art.getAttribute('data-sys');
    var m = l === 'he' ? "שלום ג'י.זי.די, הגעתי דרך האתר. אשמח לשאול על " + SYS.he[c] + ' של תדיראן.' : 'Hi G.Z.D, I found you through your website. I’d like to ask about ' + SYS.en[c] + ' from Tadiran.';
    sysWaA.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
  }
  var litT = [];
  function lightUp() {
    litT.forEach(clearTimeout); litT = [];
    var g = $$('.cfg', art);
    g.forEach(function (x) { x.classList.remove('lit'); });
    var on = g.filter(function (x) { return x.classList.contains('c-' + art.getAttribute('data-sys')); });
    on.forEach(function (x) { litT.push(setTimeout(function () { x.classList.add('lit'); }, still() ? 0 : 450)); });
  }
  function pick(c, focus) {
    art.setAttribute('data-sys', c);
    tabs.forEach(function (b) { var s = b.dataset.cfg === c; b.setAttribute('aria-selected', s ? 'true' : 'false'); b.tabIndex = s ? 0 : -1; if (s && focus) b.focus(); });
    lightUp(); sysWa();
  }
  tabs.forEach(function (b, i) {
    b.addEventListener('click', function () { pick(b.dataset.cfg); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowLeft' ? (he() ? 1 : -1) : e.key === 'ArrowRight' ? (he() ? -1 : 1) : 0;
      if (d) { e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length].dataset.cfg, true); }
    });
  });
  pick('vrf');

  // ---------------------------------------------------------------- the shelves' living drawings: each runs once as it comes into view, resets when it leaves
  var easeIO = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  function tween(dur, fn, done, delay) {
    var t0 = 0, id = 0;
    function f(t) { if (!t0) t0 = t + (delay || 0); var k = clamp((t - t0) / dur, 0, 1); if (t >= t0) fn(k); if (k < 1) id = requestAnimationFrame(f); else if (done) done(); }
    id = requestAnimationFrame(f);
    return function () { cancelAnimationFrame(id); };
  }
  // the pipe bender: the tube wraps around the 42px former as the arm turns; what is bent comes out of the straight tail
  var tube = $('[data-tube]'), tubeHl = $('[data-tubehl]'), arm = $('[data-arm]');
  function bend(deg) {
    var th = deg * Math.PI / 180, R = 42, cx = 110, cy = 110, arc = R * th, tail = Math.max(0, 90 - arc);
    var phi = Math.PI / 2 - th;                                   // the point where the tube leaves the former
    var ex = cx + R * Math.cos(phi), ey = cy + R * Math.sin(phi);
    var dx = Math.sin(phi), dy = -Math.cos(phi);                  // direction of travel at that point
    var d = 'M16 152 H110' + (th > 0.001 ? ' A42 42 0 0 0 ' + ex.toFixed(2) + ' ' + ey.toFixed(2) : '') + ' L' + (ex + dx * tail).toFixed(2) + ' ' + (ey + dy * tail).toFixed(2);
    tube.setAttribute('d', d);
    tubeHl.setAttribute('d', d); tubeHl.setAttribute('transform', 'translate(-1.2 -1.6)');
    arm.style.transform = 'rotate(' + (-deg).toFixed(2) + 'deg)';
  }
  var VIZ = {
    gas: function (el, on) {
      var kg = $('[data-kg]', el);
      if (!on) { el.classList.remove('run'); kg.textContent = '11.30'; return; }
      el.classList.add('run');
      return tween(3400, function (k) { kg.textContent = (11.30 - 0.68 * (1 - Math.pow(1 - k, 2))).toFixed(2); });
    },
    vac: function (el, on) {
      var n = $('[data-micron]', el), bars = $$('[data-bar]', el);
      var show = function (v) { n.textContent = Math.round(v); var lit = Math.ceil(6 * Math.log10(v / 300) / Math.log10(5000 / 300)); bars.forEach(function (b, i) { b.style.opacity = i < lit ? 1 : .15; }); };
      if (!on) { show(4980); return; }
      // a pump pulls down fast at first, then slower and slower as the last moisture boils off
      return tween(3800, function (k) { show(4980 * Math.pow(480 / 4980, 1 - Math.pow(1 - k, 2.2))); }, null, 300);
    },
    pipe: function (el, on) { el.classList.toggle('run', !!on); },
    fan: function (el, on) {
      var b = $('.blades', el), r = $('.fblur', el);
      if (!on) return;
      var a1 = b.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(3240deg)' }], { duration: 6000, easing: 'cubic-bezier(.5,0,.3,1)' });
      var a2 = r.animate([{ opacity: 0 }, { opacity: .32, offset: .3 }, { opacity: .32, offset: .62 }, { opacity: 0 }], { duration: 6000 });
      return function () { a1.cancel(); a2.cancel(); };
    },
    bend: function (el, on) {
      if (!on) { bend(0); return; }
      return tween(1700, function (k) { bend(90 * easeIO(k)); }, null, 400);
    },
    ac: function (el, on) {
      var s = $('[data-set]', el);
      if (!on) { el.classList.remove('run'); s.textContent = '30°'; return; }
      el.classList.add('run');
      return tween(1800, function (k) { s.textContent = Math.round(30 - 6 * k) + '°'; }, null, 300);
    }
  };
  var vizEls = $$('[data-viz]');
  function vizFinal(el) {
    var k = el.dataset.viz;
    if (k === 'gas') { el.classList.add('run'); $('[data-kg]', el).textContent = '10.62'; }
    if (k === 'vac') { VIZ.vac(el, false); $('[data-micron]', el).textContent = '480'; $$('[data-bar]', el).forEach(function (b, i) { b.style.opacity = i < 1 ? 1 : .15; }); }
    if (k === 'bend') bend(90);
    if (k === 'ac') { el.classList.add('run'); $('[data-set]', el).textContent = '24°'; }
  }
  function vizAll() {
    vizEls.forEach(function (el) { if (el._stop) { el._stop(); el._stop = null; } if (still()) { VIZ[el.dataset.viz](el, false); vizFinal(el); } else { VIZ[el.dataset.viz](el, false); if (el._seen) el._stop = VIZ[el.dataset.viz](el, true); } });
  }
  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var el = e.target;
        el._seen = e.isIntersecting;
        if (still()) return;
        if (el._stop) { el._stop(); el._stop = null; }
        VIZ[el.dataset.viz](el, false);
        if (e.isIntersecting) el._stop = VIZ[el.dataset.viz](el, true);
      });
    }, { threshold: .45 });
    vizEls.forEach(function (el) { vio.observe(el); });
    new IntersectionObserver(function (es) { es.forEach(function (e) { art.parentNode.classList.toggle('run-sys', e.isIntersecting && !still()); }); }, { threshold: .1 }).observe(art);
  }
  vizAll();

  // ---------------------------------------------------------------- the photo row: arrows step one module
  var drag = $('[data-drag]');
  function step(d) {
    var mods = $$('.m', drag), w = mods[1] ? Math.abs(mods[1].getBoundingClientRect().left - mods[0].getBoundingClientRect().left) : 300;
    drag.scrollBy({ left: d * w * (root.dir === 'rtl' ? -1 : 1), behavior: still() ? 'auto' : 'smooth' });
  }
  $('[data-drag-next]').addEventListener('click', function () { step(1); });
  $('[data-drag-prev]').addEventListener('click', function () { step(-1); });

  // ---------------------------------------------------------------- entrances, once, staggered inside each section
  $$('section, header').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { io && !still() ? io.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- nav: where you are, and the pill rises past the concept bar
  var pill = $('[data-pill]'), links = $$('.links a');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['stock', 'shop', 'systems', 'reviews', 'order', 'visit'].forEach(function (id) { var el = document.getElementById(id); if (el) nio.observe(el); });
  }

  // ---------------------------------------------------------------- the manifold: in once the hero's buttons are gone, aside where other call buttons are on screen
  var mf = $('[data-manifold]'), heroGone = false, others = 0;
  function mfUI() { mf.classList.toggle('on', heroGone && others === 0); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { heroGone = !e.isIntersecting && e.boundingClientRect.top < 0; }); mfUI(); }).observe($('[data-hero-acts]'));
    var seen = new Set();
    var oio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target); }); others = seen.size; mfUI(); }, { threshold: .2 });
    $$('.bar3, [data-visit-acts], .lightbox').forEach(function (el) { oio.observe(el); });
  }
  // needles: the low side reads the frost (it falls below zero while a seam freezes); the high side steadies around its mark
  var nLow = $('[data-ndl-low]'), nHigh = $('[data-ndl-high]'), lastY = scrollY, vel = 0;
  function needles(frost) {
    if (still()) { nLow.style.transform = 'rotate(-30deg)'; nHigh.style.transform = 'rotate(48deg)'; return; }
    nLow.style.transform = 'rotate(' + (-30 - 72 * frost).toFixed(1) + 'deg)';
    nHigh.style.transform = 'rotate(' + (48 + clamp(vel, -1, 1) * 9).toFixed(1) + 'deg)';
  }
  window.__onFrost = function (a) { needles(a); };
  var tk = false;
  addEventListener('scroll', function () {
    if (tk) return; tk = true;
    requestAnimationFrame(function () {
      tk = false; vel = vel * .6 + ((scrollY - lastY) / 60) * .4; lastY = scrollY;
      pill.classList.toggle('up', scrollY > 24);
      if (!window.__frost || still()) needles(0);
    });
  }, { passive: true });
  needles(0);

  // ---------------------------------------------------------------- the frost layer is only fetched when motion is on
  function loadFrost() {
    if (still()) return;
    if (window.__frost) { window.__frost.start(); return; }
    if (document.querySelector('script[data-frost]')) return;
    var s = document.createElement('script'); s.src = 'js/frost.js'; s.async = true; s.dataset.frost = '1';
    document.body.appendChild(s);
  }
  function boot() { if ('requestIdleCallback' in window) requestIdleCallback(loadFrost, { timeout: 1200 }); else setTimeout(loadFrost, 300); }
  if (document.readyState === 'complete') boot(); else addEventListener('load', boot);

  hours(); write();
})();
