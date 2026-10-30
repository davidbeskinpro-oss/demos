(function () {
  var root = document.documentElement, WA = '972585700828';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var hover = matchMedia('(hover: hover)').matches;
  var TITLE = { he: 'בקצות האצבעות · עיסוי לנשים בלבד · יצחק בן צבי 2, חיפה', en: 'At the Fingertips · Massage for women only · 2 Yitzhak Ben Zvi St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור בקצות האצבעות - עיסוי לנשים בלבד · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for “At the Fingertips” women-only massage · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'בקצות האצבעות', 'At the Fingertips');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-where]', 'איפה', 'Where');
    aria('[data-t-call]', 'התקשרו לאלייה, 058-570-0828', 'Call Aliya, 058-570-0828');
    aria('[data-t-wa]', 'וואטסאפ לאלייה', 'WhatsApp Aliya');
    $$('[data-ph-he]').forEach(function (i) { i.placeholder = i.dataset[l === 'he' ? 'phHe' : 'phEn']; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ba-lang', l); } catch (e) {}
    texts(l); hours(); days(); compose(true); fit(); tick();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('ba-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    clearScroll(); tick(); ripple.kick(); warm.kick(); compose(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [10, 22], 1: [7, 22], 2: [7, 22], 3: [9, 17], 4: [7, 22], 5: [7, 19], 6: null };
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
  // consecutive days with the same hours share a row; the week starts on Sunday
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], d = [], k; for (k = r[0]; k <= r[1]; k++) d.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : 'Open 24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + d.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('[data-bento],.v-grid').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- letters: hero name arrives letter by letter; footer word rises with the curtain
  function split(sp, i0) {
    var i = i0 || 0;
    sp.innerHTML = sp.textContent.trim().split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  }
  $$('[data-split] .ln > span[lang]').forEach(function (sp) { split(sp); });
  $$('[data-split]').forEach(function (h) { h.classList.add('js-split'); });
  $$('.f-word > span[lang]').forEach(function (sp) { split(sp); });

  // ---------------------------------------------------------------- odometers (only real figures: rating, reviews, open days)
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = '<span class="odo">' + o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d">' + ch + '</span>';
      return '<span class="d" data-to="' + ch + '"><span></span></span>';
    }).join('') + '</span>';
    o.setAttribute('aria-label', o.dataset.odo);
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    if (still()) { roll(o, true); return; }
    roll(o, false);
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .4 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- the mandala from her ceiling, drawn ring by ring
  function petal(r1, r2, w) { var m = (r1 + r2) / 2; return 'M0,' + (-r1) + ' Q' + w + ',' + (-m) + ' 0,' + (-r2) + ' Q' + (-w) + ',' + (-m) + ' 0,' + (-r1) + 'Z'; }
  function buildMandala(svg) {
    var rings = [
      { n: 1, c: 6 }, { n: 8, p: [8, 26, 7] }, { n: 1, c: 27 }, { n: 12, p: [27, 50, 9] }, { n: 12, p: [32, 46, 4], off: 15 },
      { n: 1, c: 52 }, { n: 16, p: [52, 74, 8], off: 11.25 }, { n: 24, dot: [80, 2.2] }, { n: 32, p: [84, 94, 4] }, { n: 1, c: 97 }
    ];
    rings.forEach(function (r, ri) {
      var g = document.createElementNS(NS, 'g'); g.setAttribute('data-ring', ri);
      for (var k = 0; k < r.n; k++) {
        var el;
        if (r.c) { el = document.createElementNS(NS, 'circle'); el.setAttribute('r', r.c); }
        else if (r.dot) { el = document.createElementNS(NS, 'circle'); el.setAttribute('r', r.dot[1]); el.setAttribute('cy', -r.dot[0]); el.setAttribute('transform', 'rotate(' + (k * 360 / r.n) + ')'); }
        else { el = document.createElementNS(NS, 'path'); el.setAttribute('d', petal(r.p[0], r.p[1], r.p[2])); el.setAttribute('transform', 'rotate(' + ((r.off || 0) + k * 360 / r.n) + ')'); }
        el.setAttribute('pathLength', '1'); el.setAttribute('stroke-dasharray', '1 1');
        g.appendChild(el);
      }
      svg.appendChild(g);
    });
  }
  $$('[data-mandala]').forEach(buildMandala);
  var unfold = $('[data-unfold]'), uRings = unfold ? $$('g', unfold) : [];
  function drawRings(p) { uRings.forEach(function (g, i) { var t = smooth((p - i * .06) / .45); $$('path,circle', g).forEach(function (el) { el.style.strokeDashoffset = (1 - t).toFixed(3); }); }); }
  $$('.v-mandala g,.g-mandala g').forEach(function (g) { $$('path,circle', g).forEach(function (el) { el.style.strokeDashoffset = 0; }); });

  // ---------------------------------------------------------------- hero: lights dim from day to lamplight, then the fingertip ripples
  var hero = $('[data-hero]'), hPhoto = $('.h-photo');
  requestAnimationFrame(function () { setTimeout(function () { hero.classList.add('lit'); }, 200); });

  var ripple = (function () {
    var cv = $('[data-ripple]'), c = cv.getContext('2d'), w = 0, h = 0, rings = [], raf = 0, vis = true, lx = -999, ly = -999, lt = 0, auto = 0, px = -1, py = -1;
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function add(x, y, big) { rings.push({ x: x, y: y, t: performance.now(), big: big }); if (rings.length > 24) rings.shift(); kick(); }
    function frame(t) {
      raf = 0; c.clearRect(0, 0, w, h);
      if (still() || !vis) return;
      if (px >= 0) { var g = c.createRadialGradient(px, py, 0, px, py, 120); g.addColorStop(0, 'rgba(255,214,170,.28)'); g.addColorStop(1, 'rgba(255,214,170,0)'); c.fillStyle = g; c.fillRect(px - 120, py - 120, 240, 240); }
      if (!hover && t - auto > 2300) { auto = t; add(w * (.25 + Math.random() * .5), h * (.42 + Math.random() * .3), true); }
      rings = rings.filter(function (r) { return t - r.t < (r.big ? 2600 : 1700); });
      rings.forEach(function (r) {
        var dur = r.big ? 2600 : 1700, k = (t - r.t) / dur, e = 1 - Math.pow(1 - k, 3), R = (r.big ? 150 : 80) * e + 4;
        for (var j = 0; j < 3; j++) {
          var rr = R - j * (r.big ? 16 : 10); if (rr <= 1) continue;
          c.beginPath(); c.ellipse(r.x, r.y, rr, rr * .62, 0, 0, Math.PI * 2);
          c.strokeStyle = 'rgba(255,232,208,' + ((1 - k) * (r.big ? .55 : .42) * (1 - j * .28)).toFixed(3) + ')';
          c.lineWidth = r.big ? 1.6 : 1.2; c.stroke();
        }
      });
      if (rings.length || px >= 0 || !hover) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still() && vis) raf = requestAnimationFrame(frame); }
    function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var p = pos(e); px = p[0]; py = p[1];
      var now = performance.now();
      if (Math.hypot(px - lx, py - ly) > 34 && now - lt > 110) { lx = px; ly = py; lt = now; add(px, py, false); }
      kick();
    });
    hero.addEventListener('pointerleave', function () { px = py = -1; });
    hero.addEventListener('pointerdown', function (e) { if (e.target.closest('a,button')) return; var p = pos(e); add(p[0], p[1], true); });
    watch(hero, function (v) { vis = v; kick(); });
    size();
    return { kick: kick, size: size };
  })();

  // ---------------------------------------------------------------- Aliya's portrait warms where the hand rests (wanders by itself on phones)
  var warm = (function () {
    var fig = $('[data-warm]'), vis = false, raf = 0, user = 0, t0 = performance.now();
    function set(x, y) { fig.style.setProperty('--x', x + '%'); fig.style.setProperty('--y', y + '%'); }
    function frame(t) {
      raf = 0; if (still() || !vis) return;
      if (t - user > 1800) { var k = (t - t0) / 1000; set(50 + 26 * Math.sin(k * .55), 38 + 22 * Math.sin(k * .83 + 1)); }
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && vis && !still()) raf = requestAnimationFrame(frame); }
    fig.addEventListener('pointermove', function (e) { var r = fig.getBoundingClientRect(); user = performance.now(); set(((e.clientX - r.left) / r.width * 100).toFixed(1), ((e.clientY - r.top) / r.height * 100).toFixed(1)); });
    watch(fig, function (v) { vis = v; kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- bento: a warm spotlight follows the hand
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); t.classList.add('lit'); });
    t.addEventListener('pointerleave', function () { t.classList.remove('lit'); });
  });

  // ---------------------------------------------------------------- the live voucher: book for yourself, or a gift
  var form = $('[data-form]'), daysEl = $('[data-days]'), vKind = $('[data-v-kind]'), vWho = $('[data-v-who]'), vWhen = $('[data-v-when]'), send = $('[data-send]'), voucher = $('[data-voucher]');
  var short = { he: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'] };
  var pick = (function () { var n = now().d; return H[n] ? n : 0; })();
  function days() {
    var l = he() ? 'he' : 'en', names = he() ? dayHe : dayEn;
    daysEl.innerHTML = [0, 1, 2, 3, 4, 5].map(function (d) {
      return '<label class="pebble"><input type="radio" name="day" value="' + d + '"' + (d === pick ? ' checked' : '') + ' aria-label="' + names[d] + '"><span>' + short[l][d] + '</span></label>';
    }).join('');
  }
  var typing = [];
  function type(el, txt, delay) {
    if (still()) { el.textContent = txt; el.classList.remove('caret'); return; }
    el.textContent = ''; el.classList.add('caret');
    var i = 0, id = setTimeout(function step() {
      el.textContent = txt.slice(0, ++i);
      if (i < txt.length) typing.push(setTimeout(step, 22)); else el.classList.remove('caret');
    }, delay); typing.push(id);
  }
  var lastKey = '';
  function compose(force) {
    var fd = new FormData(form), gift = fd.get('for') === 'gift', d = +(fd.get('day') || pick), part = +(fd.get('part') || 0), to = (fd.get('to') || '').trim().replace(/\s+/g, ' ');
    var l = he();
    $('[data-giftbox]').hidden = !gift; $('[data-me]').hidden = gift;
    var eve = $('input[name="part"][value="2"]');
    eve.disabled = d === 3; if (d === 3 && part === 2) { $('input[name="part"][value="1"]').checked = true; part = 1; }
    var partHe = ['בבוקר', 'בצהריים', 'בערב'][part], partEn = ['morning', 'afternoon', 'evening'][part];
    var kind, who, when, msg;
    if (gift) {
      kind = l ? 'שובר מתנה' : 'Gift voucher';
      who = to ? (l ? 'עבור ' + to : 'For ' + to) : (l ? 'עבור מישהי אהובה' : 'For someone you love');
      when = l ? 'מועד לתיאום עם אלייה' : 'Date to arrange with Aliya';
      msg = l ? 'היי אלייה, אשמח לקנות שובר מתנה לעיסוי' + (to ? ' עבור ' + to : '') + '. אפשר פרטים? תודה'
              : 'Hi Aliya, I’d like to buy a massage gift voucher' + (to ? ' for ' + to : '') + '. Could you send me the details? Thank you';
    } else {
      kind = l ? 'תור לעיסוי' : 'A massage';
      who = l ? 'בשבילי' : 'For me';
      when = l ? 'יום ' + dayHe[d] + ' · ' + partHe : dayEn[d] + ' · ' + partEn;
      msg = l ? 'היי אלייה, אשמח לקבוע עיסוי ביום ' + dayHe[d] + ', ' + partHe + ' אם אפשר. תודה'
              : 'Hi Aliya, I’d like to book a massage on ' + dayEn[d] + ', in the ' + partEn + ' if possible. Thank you';
    }
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
    var key = [kind, who, when].join('|');
    if (key === lastKey && !force) return; lastKey = key;
    typing.forEach(clearTimeout); typing = [];
    if (vKind.textContent !== kind || force) type(vKind, kind, 0);
    type(vWho, who, 140); type(vWhen, when, 260);
    if (!still()) { voucher.classList.remove('pulse'); void voucher.offsetWidth; voucher.classList.add('pulse'); voucher.style.setProperty('--sheen', '120%'); setTimeout(function () { voucher.style.transition = 'none'; voucher.style.setProperty('--sheen', '-120%'); void voucher.offsetWidth; voucher.style.transition = ''; }, 1150); }
  }
  form.addEventListener('change', function () { compose(); });
  form.addEventListener('input', function (e) { if (e.target.name === 'to') compose(); });
  var wrap = $('.g-card-wrap');
  if (hover) {
    wrap.addEventListener('pointermove', function (e) { if (still()) return; var r = voucher.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; voucher.style.transform = 'rotateY(' + (x * 12).toFixed(2) + 'deg) rotateX(' + (-y * 10).toFixed(2) + 'deg)'; });
    wrap.addEventListener('pointerleave', function () { voucher.style.transform = ''; });
  }

  // ---------------------------------------------------------------- reviews: a second copy makes the drift seamless
  var lane = $('.lane');
  $$('.rv', lane).forEach(function (r) { var k = r.cloneNode(true); k.setAttribute('aria-hidden', 'true'); lane.appendChild(k); });

  // ---------------------------------------------------------------- footer wordmark fits its width
  function fit() {
    $$('[data-fit]').forEach(function (el) {
      el.style.fontSize = ''; var sp = $('span[lang="' + root.lang + '"]', el); if (!sp) return;
      var avail = el.clientWidth, need = sp.scrollWidth;
      if (need > avail) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * avail / need * .97) + 'px';
    });
  }

  // ---------------------------------------------------------------- one scroll loop: nav pill, hero depth, mandala, closing photo, curtain
  var nav = $('[data-nav]'), photo = $('.v-photo'), pImg = $('.v-photo img'), foot = $('[data-foot]'), cL = $('.c-l'), cR = $('.c-r'), fChars = function () { return $$('.f-word > span[lang="' + root.lang + '"] .ch'); };
  var ticking = false;
  function clearScroll() {
    hPhoto.style.transform = ''; photo.style.clipPath = ''; pImg.style.transform = ''; cL.style.transform = cR.style.transform = '';
    fChars().forEach(function (c) { c.style.removeProperty('--o'); });
    if (still()) { drawRings(1); $('.mandala', unfold).style.transform = ''; }
  }
  function tick() {
    ticking = false;
    var y = scrollY, vh = innerHeight;
    nav.classList.toggle('pill', y > 50);
    if (still()) return;
    if (y < vh * 1.2) { var hp = clamp(y / vh, 0, 1); hPhoto.style.transform = 'translateY(' + (hp * 14).toFixed(2) + '%) scale(' + (1 + hp * .1).toFixed(4) + ')'; }
    var ur = unfold.getBoundingClientRect();
    if (ur.top < vh && ur.bottom > 0) { var up = clamp((vh - ur.top) / (vh * 1.15), 0, 1); drawRings(up); $('.mandala', unfold).style.transform = 'rotate(' + (up * 70 - 20).toFixed(2) + 'deg) scale(' + (.82 + up * .18).toFixed(3) + ')'; }
    var pr = photo.getBoundingClientRect();
    if (pr.top < vh && pr.bottom > 0) {
      var cp = smooth(clamp((vh * .85 - pr.top) / (vh * .7), 0, 1)), m = innerWidth < 700 ? 16 : Math.min(56, innerWidth * .04);
      photo.style.clipPath = 'inset(' + (cp * 28).toFixed(1) + 'px ' + (cp * m).toFixed(1) + 'px 0px ' + (cp * m).toFixed(1) + 'px round ' + (cp * 28).toFixed(1) + 'px)';
      pImg.style.transform = 'scale(' + (1.14 - cp * .14).toFixed(4) + ')';
    }
    var fr = foot.getBoundingClientRect();
    if (fr.top < vh) {
      var fp = smooth(clamp((vh - fr.top) / (fr.height * .85), 0, 1));
      cL.style.transform = 'translateX(' + (-fp * 102).toFixed(2) + '%)'; cR.style.transform = 'translateX(' + (fp * 102).toFixed(2) + '%)';
      var ch = fChars(), n = ch.length;
      ch.forEach(function (c, i) { c.style.setProperty('--o', smooth(fp * 1.6 - i / n * .6).toFixed(3)); });
    }
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }, { passive: true });
  addEventListener('resize', function () { ripple.size(); fit(); tick(); });

  // ---------------------------------------------------------------- start
  texts(root.lang); hours(); days(); compose(true);
  if (still()) clearScroll();
  tick();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit); else fit();
})();
