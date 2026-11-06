(function () {
  var root = document.documentElement, WA = '972542134114';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 700; };
  var hover = matchMedia('(hover: hover)').matches;
  root.classList.toggle('touch', !hover);
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'וידאל · עיצוב שיער לגברים, לנשים ולילדים · חניתה 64, חיפה', en: 'Vidal · Hair design for men, women and kids · 64 Hanita St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור מספרה וידאל · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Vidal hair salon · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'מספרה וידאל', 'Vidal hair salon');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו, 054-213-4114', 'Call 054-213-4114');
    aria('[data-t-wa]', 'וואטסאפ למספרה', 'WhatsApp the salon');
    aria('[data-t-who]', 'למי התספורת', 'Who is the haircut for');
    aria('[data-t-day]', 'איזה יום', 'Which day');
    aria('[data-t-part]', 'מתי ביום', 'Time of day');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: חניתה 64, חיפה' : 'Map: 64 Hanita St, Haifa'; });
    $$('.tag').forEach(function (t) { $('b', t).textContent = t.dataset[l]; });
    var d = $('[data-decode]'); if (d) d.textContent = d.dataset[l];
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('vidal-lang', l); } catch (e) {}
    texts(l); hours(); days(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('vidal-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],.rv').forEach(function (el) { el.classList.add('in'); });
    layout(); ring.kick(); rose.kick(); dust.kick(); write(true); tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8, 18.5], 1: [8, 20], 2: [8, 20], 3: [8, 20], 4: [8, 20], 5: [8, 16], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60, hm: ((+o.hour) % 24) + ':' + o.minute }; }
  function nextOpen(d) { var nd = (d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7; return H[nd] ? nd : -1; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = nextOpen(n.d);
      txt = nd < 0 ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.add('chip'); el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
    var c = $('[data-clock]'); if (c) c.textContent = (n.hm || hhmm(n.h)).replace(/^(\d):/, '0$1:');
  }
  // consecutive days with the same hours share a row; the week starts on Sunday
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], ds = [], k; for (k = r[0]; k <= r[1]; k++) ds.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed');
      return '<tr data-days="' + ds.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 20000);

  // ---------------------------------------------------------------- entrances
  $$('.bento,.v-bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  $$('.rv').forEach(function (r, i) { r.style.setProperty('--d', i * 140 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); if (e.target.dataset.odo) odo(e.target); $$('[data-odo]', e.target).forEach(odo); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile],.rv').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letter by letter, out of a blur, filling from dusk-rose to the ink
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = 0; sp.innerHTML = sp.textContent.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('');
  });

  // odometer figures: each digit rolls on its own wheel
  function odo(el) {
    if (el.dataset.rolled) return; el.dataset.rolled = 1;
    var v = el.dataset.odo; if (still()) return;
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', v);
    el.innerHTML = v.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span aria-hidden="true">' + ch + '</span>';
      var s = []; for (var k = 0; k <= 10 + (+ch); k++) s.push(k % 10);
      return '<span class="col" aria-hidden="true"><span data-d="' + s.join('&#10;') + '" data-n="' + (s.length - 1) + '"></span></span>';
    }).join('');
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      $$('.col > span', el).forEach(function (w, i) { w.style.transitionDelay = i * 120 + 'ms'; w.style.transform = 'translateY(-' + w.dataset.n + 'em)'; });
    }); });
  }
  $$('.odo,[data-odo]').forEach(function (el) { if (!el.closest('[data-tile],[data-reveal]')) watch(el, function (v) { if (v) odo(el); }); });

  // ---------------------------------------------------------------- photos sized to cover their stage (so labels stay on their objects)
  function cover(el) {
    var p = el.parentElement, wh = el.dataset.cover.split('x'), iw = +wh[0], ih = +wh[1], fx = +(el.dataset.focus || .5), fy = +(el.dataset.focusY || .5);
    var W = p.clientWidth, Hh = p.clientHeight, s = Math.max(W / iw, Hh / ih) * 1.06, w = iw * s, h = ih * s;
    var ox = clamp(W / 2 - fx * w, W - w, 0) + w / 2;   // where the photo's centre sits
    el.style.width = w + 'px'; el.style.height = h + 'px';
    el.style.marginLeft = (ox - W / 2 - w / 2) + 'px'; var oy = clamp(Hh / 2 - fy * h, Hh - h, 0) + h / 2; el.style.marginTop = (oy - Hh / 2 - h / 2) + 'px';
    return { w: w, h: h, x0: ox - w / 2, W: W };
  }

  // ---------------------------------------------------------------- hero: the real room under the hand; labels decode onto its objects
  var hero = $('[data-hero]'), hm = $('.h-media', hero), nav = $('[data-nav]'), tags = $$('.tag', hero), hcov;
  var hp = { x: 0, y: 0, tx: 0, ty: 0 }, tagI = 0, tagTimer = 0;
  var GL = 'אבגדהוזחטיכלמנסעפצקרשת', GLE = 'abcdefghijklmnopqrstuvwxyz';
  function decode(el, text) {
    if (still()) { el.textContent = text; return; }
    var t0 = performance.now(), set = he() ? GL : GLE;
    (function st(t) {
      var k = (t - t0) / 600, out = '';
      for (var i = 0; i < text.length; i++) out += (text[i] === ' ' || i / text.length < k) ? text[i] : set[Math.floor(Math.random() * set.length)];
      el.textContent = out; if (k < 1) requestAnimationFrame(st); else el.textContent = text;
    })(t0);
  }
  function visibleTags() { if (!hcov) hcov = cover(hm); return tags.filter(function (t) { var x = hcov.x0 + parseFloat(t.style.getPropertyValue('--x')) / 100 * hcov.w; return x > 20 && x < hcov.W - 140 && (!phone() || t.getBoundingClientRect().top < innerHeight * .42); }); }
  function showTag(t) {
    tags.forEach(function (o) { o.classList.toggle('on', o === t); });
    if (t) decode($('b', t), t.dataset[root.lang]);
  }
  function cycleTags() {
    clearTimeout(tagTimer); if (still()) { var vt = visibleTags(); tags.forEach(function (t) { t.classList.toggle('on', vt.indexOf(t) >= 0); }); return; }
    var v = visibleTags(); if (v.length) showTag(v[tagI++ % v.length]);
    tagTimer = setTimeout(cycleTags, 2600);
  }
  if (hover) hero.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect(); hp.tx = (e.clientX - r.left) / r.width - .5; hp.ty = (e.clientY - r.top) / r.height - .5;
    if (still()) return;
    var best = null, bd = 1e9; visibleTags().forEach(function (t) { var b = t.getBoundingClientRect(), d = Math.hypot(b.left - e.clientX, b.top - e.clientY); if (d < bd) { bd = d; best = t; } });
    if (best && bd < 260 && !best.classList.contains('on')) { clearTimeout(tagTimer); showTag(best); tagTimer = setTimeout(cycleTags, 4000); }
  });
  var heroRaf = 0;
  function heroFrame(t) {
    heroRaf = 0; if (still()) { hm.style.transform = ''; return; }
    if (!hover) { hp.tx = Math.sin(t / 2600) * .35; hp.ty = Math.cos(t / 3400) * .25; }
    hp.x = lerp(hp.x, hp.tx, .06); hp.y = lerp(hp.y, hp.ty, .06);
    var sy = clamp(scrollY / innerHeight, 0, 1);
    hm.style.transform = 'translate(' + (-hp.x * 22) + 'px,' + (-hp.y * 16 + sy * 90) + 'px)';
    if (heroVis) heroRaf = requestAnimationFrame(heroFrame);
  }
  var heroVis = true; watch(hero, function (v) { heroVis = v; if (v && !heroRaf) heroRaf = requestAnimationFrame(heroFrame); });

  // ---------------------------------------------------------------- opening deal (≤1.5 s, skipped by any tap, key or scroll)
  var deal = $('[data-deal]');
  function ready() { hero.classList.add('ready'); cycleTags(); }
  function endDeal() { if (!deal) return; deal.classList.add('done'); var d = deal; deal = null; setTimeout(function () { d.remove(); }, 380); ready(); }
  if (still() || !deal) { if (deal) deal.remove(); deal = null; ready(); }
  else {
    requestAnimationFrame(function () { deal.classList.add('go'); });
    setTimeout(function () { if (deal) deal.classList.add('open'); }, 700);
    setTimeout(endDeal, 1500);
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) { addEventListener(ev, endDeal, { once: true, passive: true }); });
  }

  // ---------------------------------------------------------------- the sign: lights on, then its red floods the screen
  var sign = $('[data-sign]'), sm = $('.s-media', sign), glow = $('[data-glow]'), flood = $('[data-flood]'), scopy = $('[data-scopy]'), stage = $('.s-stage', sign), decoded = false;
  var FLICK = [0, 1, 0, 0, 1, .2, 1, 1];
  function signFrame() {
    var calm = still(), r = sign.getBoundingClientRect(), p = calm ? 1 : clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
    var on = p < .05 ? 0 : p < .3 ? FLICK[Math.floor((p - .05) / .25 * FLICK.length) % FLICK.length] : 1;
    if (calm) on = 1;
    sm.style.setProperty('--lit', (.42 + on * .58).toFixed(3));
    sm.style.setProperty('--glow', on);
    var c = calm ? 1 : smooth((p - .16) / .16) * (1 - smooth((p - .46) / .12));
    scopy.style.opacity = c; scopy.style.transform = 'translateY(' + ((1 - c) * 30) + 'px)';
    if (c > .5 && !decoded) { decoded = true; var d = $('[data-decode]'); decode(d, d.dataset[root.lang]); }
    if (c < .1) decoded = false;
    if (!calm) {
      var f = smooth((p - .42) / .5), s = stage.getBoundingClientRect(), g = glow.getBoundingClientRect();
      var T = (g.top - s.top) * (1 - f), L = (g.left - s.left) * (1 - f), R = (s.right - g.right) * (1 - f), B = (s.bottom - g.bottom) * (1 - f);
      var mr = sm.getBoundingClientRect(), fi = flood.firstElementChild;
      var w0 = .3513 * mr.width, h0 = .1167 * mr.height, x0 = mr.left + .1875 * mr.width - s.left, y0 = mr.top + .1383 * mr.height - s.top;
      var w1 = s.width * 1.12, h1 = w1 * 140 / 562, x1 = (s.width - w1) / 2, y1 = (s.height - h1) / 2;
      fi.style.cssText = 'position:absolute;object-fit:fill;left:' + lerp(x0, x1, f) + 'px;top:' + lerp(y0, y1, f) + 'px;width:' + lerp(w0, w1, f) + 'px;height:' + lerp(h0, h1, f) + 'px';
      flood.style.setProperty('--lo', ((1 - smooth((p - .86) / .14)) * lerp(1, .45, f)).toFixed(3));
      flood.style.setProperty('--clip', p < .42 ? 'inset(0 0 100% 0)' : 'inset(' + T + 'px ' + R + 'px ' + B + 'px ' + L + 'px round ' + (6 * (1 - f)) + 'px)');
    }
  }

  // ---------------------------------------------------------------- the arc of their photos: turns by itself, with the scroll and with a drag
  var ring = (function () {
    var wrap = $('[data-ringwrap]'), el = $('[data-ring]');
    $$('.rc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $$('img', k).forEach(function (i) { i.alt = ''; }); el.appendChild(k); });
    var cards = $$('.rc', el), N = cards.length, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = false, last = 0, lastY = scrollY;
    function R() { var cw = cards[0].offsetWidth || 200; return Math.max(cw * 1.08 / (2 * Math.tan(Math.PI / N)), phone() ? 300 : innerWidth * .4); }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; }); return; }
      var dt = last ? Math.min(50, t - last) : 16; last = t;
      if (!drag) { rot += dt * .012 + vel * .02; vel *= .94; }
      var dy = scrollY - lastY; lastY = scrollY; rot += dy * .05;
      var rad = R();
      el.style.transform = 'translateZ(' + (-rad) + 'px) rotateX(-6deg)';
      cards.forEach(function (c, i) {
        var a = (i * 360 / N + rot) % 360, ar = a * Math.PI / 180, front = (Math.cos(ar) + 1) / 2;
        c.style.transform = 'rotateY(' + a + 'deg) translateZ(' + rad + 'px) scale(' + (.86 + front * .16).toFixed(3) + ')';
        c.style.filter = 'brightness(' + (.45 + front * .55).toFixed(3) + ')';
      });
      if (vis || drag) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); kick(); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .25; vel = dx; });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(wrap, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- bento: spotlight under the hand (drifting by itself on phones), the card tilts
  $$('.tile').forEach(function (t) {
    if (hover) {
      t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); t.classList.add('lit'); });
      t.addEventListener('pointerleave', function () { t.classList.remove('lit'); });
    }
  });
  var tilts = $$('[data-tilt]');
  tilts.forEach(function (t) {
    var face = t.classList.contains('pcard') ? t : $('.cardface', t);
    if (!hover) return;
    t.addEventListener('pointermove', function (e) {
      if (still()) return; var r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      face.style.setProperty('--ty', ((x - .5) * 14).toFixed(2) + 'deg'); face.style.setProperty('--tx', ((.5 - y) * 10).toFixed(2) + 'deg');
      face.style.setProperty('--gx', x * 100 + '%'); face.style.setProperty('--gy', y * 100 + '%');
    });
    t.addEventListener('pointerleave', function () { face.style.setProperty('--tx', '0deg'); face.style.setProperty('--ty', '0deg'); });
  });
  // the three words of their card light in turn
  var who = $$('[data-who] li'), wi = 0;
  setInterval(function () { if (still()) { who.forEach(function (l) { l.classList.remove('on'); }); return; } who.forEach(function (l, i) { l.classList.toggle('on', i === wi % 3); }); wi++; }, 1400);

  // ---------------------------------------------------------------- the rose painting: red where you point, a slow wandering light otherwise
  var rose = (function () {
    var el = $('[data-rose]'), raf = 0, vis = false, pt = null, t0 = performance.now();
    function frame(t) {
      raf = 0; if (still()) return;
      var x, y; if (pt && t - pt.t < 2500) { x = pt.x; y = pt.y; } else { var k = (t - t0) / 1000; x = 50 + Math.sin(k * .7) * 32; y = 45 + Math.sin(k * .45 + 1) * 32; }
      el.style.setProperty('--px', x.toFixed(1) + '%'); el.style.setProperty('--py', y.toFixed(1) + '%');
      if (vis) raf = requestAnimationFrame(frame);
    }
    function at(e) { var r = el.getBoundingClientRect(); pt = { x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 100, t: performance.now() }; }
    el.addEventListener('pointermove', at); el.addEventListener('pointerdown', at);
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    watch(el, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- the live thing: their card is the form, the message feeds out on a slip
  var pick = { who: 'm', day: -1, part: 'am' }, msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
  var short = { he: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'] };
  function days() {
    var box = $('[data-pick="day"]'), n = now(), l = root.lang;
    if (pick.day < 0) { var d = n.d; pick.day = H[d] && n.h < H[d][1] - 1 ? d : nextOpen(d); if (pick.day < 0 || pick.day > 5) pick.day = 0; }
    box.innerHTML = [0, 1, 2, 3, 4, 5].map(function (d) {
      return '<button type="button" role="radio" aria-checked="' + (d === pick.day) + '" data-v="' + d + '" aria-label="' + (l === 'he' ? 'יום ' + dayHe[d] : dayEn[d]) + '">' + short[l][d] + '<small>' + hhmm(H[d][0]) + '–' + hhmm(H[d][1]) + '</small></button>';
    }).join('');
  }
  function compose() {
    var l = root.lang, dn = (l === 'he' ? dayHe : dayEn)[pick.day];
    if (l === 'he') {
      var w = { m: 'לגבר', w: 'לאישה', k: 'לילד' }[pick.who], p = pick.part === 'am' ? 'בבוקר' : 'אחר הצהריים';
      return 'שלום, אשמח לקבוע תור לתספורת ' + w + ' ביום ' + dn + ' ' + p + '. מתי אפשר?';
    }
    var we = { m: 'a man', w: 'a woman', k: 'a child' }[pick.who], pe = pick.part === 'am' ? 'morning' : 'afternoon';
    return 'Hi, I’d like to book a haircut for ' + we + ' on ' + dn + ' ' + pe + '. When would suit you?';
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
  $$('[data-pick]').forEach(function (g) {
    g.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var k = g.dataset.pick; pick[k] = k === 'day' ? +b.dataset.v : b.dataset.v;
      $$('button', g).forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
      write();
    });
  });
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .35 });

  // ---------------------------------------------------------------- footer: the sign's own letters gather out of red dust
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), img = $('[data-dustsrc]'), P = [], w, h, raf = 0, vis = false, ok = false, mx = -999, my = -999, t0 = 0;
    function sample() {
      try {
        var sc = document.createElement('canvas'), iw = 420, ih = 105; sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data; P = [];
        for (var y = 0; y < ih; y++) for (var x = 0; x < iw; x++) {
          var k = (y * iw + x) * 4, r = d[k], g = d[k + 1], b = d[k + 2];
          var light = r > 180 && g > 160 && b > 150 && y > ih * .03 && y < ih * .95;
          if (light && (x + y) % 2 === 0) P.push({ hx: x / iw, hy: y / ih, x: Math.random(), y: Math.random() * 1.5, vx: 0, vy: 0, dl: Math.random() * .8 });
        }
        if (P.length > (phone() ? 3000 : 6000)) P = P.filter(function (_, i) { return i % 2 === 0; });
        ok = P.length > 100;
      } catch (e) { ok = false; }
      root.classList.toggle('dusty', ok && !still());
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); P.forEach(function (p) { p.sx = undefined; }); }
    function frame(t) {
      raf = 0; if (!ok) return;
      if (still()) { root.classList.remove('dusty'); c.clearRect(0, 0, w, h); return; }
      root.classList.add('dusty');
      if (!t0) t0 = t; var T = (t - t0) / 1000;
      var ox = w * .0536, oy = h * .0968, bw = w * .8929, bh = h * .8065;   // the image's box inside the larger canvas
      c.clearRect(0, 0, w, h);
      var s = Math.max(1.6, bw / 420 * 1.5), io = smooth((T - 2) / .9);
      cv.parentElement.style.setProperty('--io', io.toFixed(3));
      for (var i = 0; i < P.length; i++) {
        var p = P[i], a = smooth((T - p.dl) / 1.4), tx = ox + p.hx * bw, ty = oy + p.hy * bh;
        if (a < 1) { if (p.sx === undefined) { p.sx = p.x * w; p.sy = p.y * h; } p.x = lerp(p.sx, tx, a); p.y = lerp(p.sy, ty, a); }
        else {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 6400) { var f = (6400 - d2) / 6400 * 3, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
          p.vx += (tx - p.x) * .07; p.vy += (ty - p.y) * .07; p.vx *= .8; p.vy *= .8; p.x += p.vx; p.y += p.vy;
        }
        c.fillStyle = '#fff4ef'; c.globalAlpha = .95 - io * .55;
        c.fillRect(p.x, p.y, s, s);
      }
      c.globalAlpha = 1;
      if (vis) raf = requestAnimationFrame(frame);
    }
    cv.parentElement.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    cv.parentElement.addEventListener('pointerleave', function () { mx = my = -999; });
    cv.parentElement.addEventListener('pointerdown', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; setTimeout(function () { mx = my = -999; }, 400); });
    function kick() { if (ok && !raf) raf = requestAnimationFrame(frame); }
    function start() { sample(); size(); }
    if (img.complete && img.naturalWidth) start(); else img.addEventListener('load', start, { once: true });
    watch(cv, function (v) { vis = v; if (v) { t0 = t0 || 0; kick(); } else t0 = 0; });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // ---------------------------------------------------------------- one scroll loop
  var shrink = $('[data-shrink] img'), slip = $('[data-slip]'), foot = $('[data-foot]'), dock = $('[data-dock]'), ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false; var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    signFrame();
    if (!calm) ring.kick();
    var sr = shrink.getBoundingClientRect(), sp = clamp((vh - sr.top) / (vh * .9), 0, 1);
    shrink.style.setProperty('--sh', calm ? 1 : (1.45 - smooth(sp) * .45).toFixed(3));
    var lr = slip.getBoundingClientRect(), lp = clamp((vh - lr.top) / (vh * .55), 0, 1);
    slip.style.setProperty('--feed', calm ? '0%' : ((1 - smooth(lp)) * 100).toFixed(1) + '%');
    dock.classList.toggle('away', $('#main').getBoundingClientRect().bottom < vh * .8);
  }
  addEventListener('scroll', tick, { passive: true });

  function layout() {
    hcov = cover(hm); cover(sm);
    root.classList.toggle('curtain', !still() && foot.offsetHeight < innerHeight * .85);
    dust.size(); tick();
  }
  var rt = 0; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 120); });

  texts(root.lang); hours(); days(); write(true); layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  addEventListener('load', layout);
})();
