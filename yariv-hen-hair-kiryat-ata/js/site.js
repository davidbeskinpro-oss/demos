(function () {
  var root = document.documentElement, WA = '972525490450';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth <= 760; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var TITLE = { he: 'יריב חן · בוטיק שיער · העצמאות 51, קריית אתא', en: 'Yariv Hen · Hair boutique · 51 HaAtzmaut St, Kiryat Ata' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור מעצב שיער יריב חן · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Yariv Hen Hair Boutique · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-stub]', 'צרו קשר עם יריב', 'Contact Yariv');
    aria('[data-t-call]', 'התקשרו ליריב, 052-549-0450', 'Call Yariv, 052-549-0450');
    $('.map').title = l === 'he' ? 'Google Maps: העצמאות 51, קריית אתא' : 'Google Maps: 51 HaAtzmaut St, Kiryat Ata';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('yh-lang', l); } catch (e) {}
    texts(l); cb(); split(); hours(); buildDays(); write(); rowText(-1); frame();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('yh-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI(); $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    reset(); frame(); motes.kick(); strand.kick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9, 18], 1: [9, 18], 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [8, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function isOpen(n) { var t = H[n.d]; return !!(t && (t[0] === 0 && t[1] === 24 || n.h >= t[0] && n.h < t[1])); }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = isOpen(n);
    if (open) txt = t[0] === 0 && t[1] === 24 ? (l ? 'פתוח עכשיו' : 'Open now') : (l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]));
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $('[data-dot]').classList.toggle('open', open);
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
    // the mirror: today's hours as a lit arc on a 12-hour face, the hand at the time now
    var arc = $('[data-arc]'), hand = $('[data-hand]');
    var pt = function (h, r) { var a = (h % 12) / 12 * Math.PI * 2 - Math.PI / 2; return [100 + r * Math.cos(a), 100 + r * Math.sin(a)]; };
    if (t && !(t[0] === 0 && t[1] === 24)) {
      var a = pt(t[0], 70), b = pt(t[1], 70), big = (t[1] - t[0]) % 12 > 6 || t[1] - t[0] >= 12 ? 1 : 0;
      arc.setAttribute('d', 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + ' A70 70 0 ' + big + ' 1 ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1));
    } else if (t) arc.setAttribute('d', 'M100 30 A70 70 0 1 1 99.9 30'); else arc.setAttribute('d', '');
    var e = pt(n.h, 58); hand.setAttribute('x2', e[0].toFixed(1)); hand.setAttribute('y2', e[1].toFixed(1));
  }
  // consecutive days with the same hours share a row; the week starts on Sunday
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    var html = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    $$('[data-hours]').forEach(function (b) { b.innerHTML = html; });
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- the card's title, letter by letter out of a blur
  function split() {
    var i = 0;
    $$('.title > span > span[lang]').forEach(function (sp) {
      if (!sp.dataset.txt) sp.dataset.txt = sp.textContent;
      if (getComputedStyle(sp).display === 'none') return;
      sp.innerHTML = sp.dataset.txt.split(' ').map(function (w) {
        return '<span style="white-space:nowrap">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  }
  split();

  // ---------------------------------------------------------------- entrances
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); onIn(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('.bento [data-reveal]').forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 90 + 'ms'); });
  $$('[data-reveal]').forEach(function (el) { rio ? rio.observe(el) : (el.classList.add('in'), onIn(el)); });
  function onIn(el) { if (el.classList.contains('t-rate')) roll(true); }

  // the rating rolls up like a counter
  var odo = $('[data-odo]');
  odo.innerHTML = odo.dataset.odo.split('').map(function (ch) {
    if (!/\d/.test(ch)) return '<span class="dp" data-n="' + ch + '"></span>';
    var s = ''; for (var k = 0; k < 10; k++) s += '<i data-n="' + k + '"></i>';
    return '<span class="d" data-to="' + ch + '"><span>' + s + '</span></span>';
  }).join('');
  function roll(go) { $$('.d', odo).forEach(function (d, i) { var s = d.firstChild; s.style.transitionDelay = (i * 160) + 'ms'; s.style.transform = 'translateY(' + (-(go || still() ? +d.dataset.to : 0) * 10) + '%)'; }); }
  roll(still());

  // bento: a soft light follows the hand
  $$('[data-tile]').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var b = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - b.left) + 'px'); t.style.setProperty('--my', (e.clientY - b.top) + 'px'); t.classList.add('lit'); });
    t.addEventListener('pointerleave', function () { t.classList.remove('lit'); });
  });

  // ---------------------------------------------------------------- the stage: the iron's passes
  var stage = $('[data-stage]'), layers = $$('[data-layer]', stage), iron = $('[data-iron]'), gloss = $('[data-gloss]'), card = $('[data-card]'), row = $('[data-row]'), stub = $('[data-stub]'), bar = $('[data-bar]');
  // scroll budget of the stage: hold on the card, pass 1, hold, pass 2, hold
  var SEG = [[0.10, 0.44], [0.56, 0.90]];
  var ROWS = [
    null,
    { he: ['צילום מהסלון', 'החלקה', 'ישר ומבריק עד הקצוות'], en: ['Photographed in the salon', 'Straightening', 'Straight and glossy to the ends'] },
    { he: ['יריב בעבודה', 'פן ועיצוב', 'קווצה אחרי קווצה'], en: ['Yariv at work', 'Blow-dry & styling', 'One section at a time'] }
  ];
  var shown = -2;
  function rowText(k) {
    if (k === shown) return; shown = k;
    if (k < 1) { row.classList.remove('on', 'set'); return; }
    var r = ROWS[k][he() ? 'he' : 'en'];
    row.classList.remove('set');
    $('[data-r="a"]', row).textContent = r[0]; $('[data-r="b"]', row).textContent = r[2];
    $('[data-r="t"]', row).innerHTML = r[1].split('').map(function (c, i) { return '<span class="ch" style="--i:' + i + '">' + (c === ' ' ? '&nbsp;' : c) + '</span>'; }).join('');
    row.classList.add('on'); requestAnimationFrame(function () { requestAnimationFrame(function () { row.classList.add('set'); }); });
  }
  function reset() {
    [card, iron, gloss].forEach(function (el) { el.style.cssText = ''; });
    layers.forEach(function (l) { l.style.clipPath = ''; });
    rowText(-1); qStep(-1);
    $$('.v-frame').forEach(function (f) { f.style.cssText = ''; });
  }
  var lastY = scrollY;
  function frame() {
    raf = 0;
    var vh = innerHeight, y = scrollY;
    bar.classList.toggle('down', y > 30); bar.classList.toggle('low', y > lastY + 4 && y > vh * .6); if (y < lastY - 4 || y < vh * .6) bar.classList.remove('low'); lastY = y;
    var sb = stage.getBoundingClientRect(), p = clamp(-sb.top / (sb.height - vh), 0, 1);
    var stubOn;
    if (still()) { stubOn = sb.top < -vh * .7; }
    else {
      var t1 = clamp((p - SEG[0][0]) / (SEG[0][1] - SEG[0][0]), 0, 1), t2 = clamp((p - SEG[1][0]) / (SEG[1][1] - SEG[1][0]), 0, 1);
      layers[1].style.clipPath = 'inset(0 0 ' + ((1 - t1) * 100).toFixed(3) + '% 0)';
      layers[2].style.clipPath = 'inset(0 0 ' + ((1 - t2) * 100).toFixed(3) + '% 0)';
      var t = t2 > 0 ? t2 : t1, moving = (t1 > 0 && t1 < 1) || (t2 > 0 && t2 < 1);
      // the iron's plates sit exactly on the seam; it fades in at the top and away at the bottom so it never jumps
      var ih = iron.getBoundingClientRect().height, flip = root.dir === 'rtl' ? ' scaleX(-1)' : '';
      iron.style.transform = 'translateY(' + (t * vh - ih / 2).toFixed(1) + 'px)' + flip;
      iron.style.opacity = moving ? Math.min(1, t * 12, (1 - t) * 12).toFixed(3) : 0;
      gloss.style.transform = 'translateY(' + (t * vh - gloss.offsetHeight).toFixed(1) + 'px)';
      gloss.style.opacity = moving ? Math.min(1, t * 8, (1 - t) * 6).toFixed(3) : 0;
      // slow push-in on the newly pressed photograph
      layers[1].firstElementChild.style.transform = 'scale(' + (1.12 - .06 * smooth(t1) - .03 * t2).toFixed(4) + ')';
      layers[2].firstElementChild.style.transform = 'scale(' + (1.10 - .06 * smooth(t2)).toFixed(4) + ')';
      // the card shrinks toward the corner where the stub waits, and becomes it
      var c = smooth(t1 / .8), cw = card.offsetWidth, ch = card.offsetHeight, sr = stub.getBoundingClientRect();
      var cl = (innerWidth - cw) / 2, ct = vh * (phone() ? .56 : .54) - ch / 2;
      var s = 1 + (sr.width / cw - 1) * c, tx = (sr.left - cl) * c, ty = (sr.top - ct) * c;
      card.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
      card.style.opacity = (1 - smooth((t1 - .6) / .25)).toFixed(3);
      card.style.visibility = t1 > .86 ? 'hidden' : '';
      rowText(t2 > .5 ? 2 : t1 > .5 ? 1 : 0);
      stubOn = t1 > .82 || sb.bottom < vh;
    }
    var vt = $('[data-visit]').getBoundingClientRect();
    stub.classList.toggle('on', stubOn && !(vt.top < vh * .35 && vt.bottom > vh * .6));
    reviews(vh); visit(vh); foot(vh);
  }
  var raf = 0;
  function ask() { if (!raf) raf = requestAnimationFrame(frame); }
  addEventListener('scroll', ask, { passive: true });
  addEventListener('resize', function () { ask(); motes.size(); strand.size(); });

  // ---------------------------------------------------------------- reviews: one step per screen
  var rv = $('[data-reviews]'), qs = $$('.q', rv), pics = $$('.rv-pics img', rv), qOn = -2;
  function qStep(k) {
    if (k === qOn) return; qOn = k;
    qs.forEach(function (q, i) { q.classList.toggle('on', i === k); });
    pics.forEach(function (p, i) { p.classList.toggle('on', i === Math.max(0, k)); });
  }
  function reviews(vh) {
    if (still() || innerWidth <= 1000) return;
    var b = rv.getBoundingClientRect(), p = clamp(-b.top / (b.height - vh), 0, .999);
    qStep(b.top > vh * .5 ? -1 : Math.floor(p * 3));
  }

  // ---------------------------------------------------------------- visit: the storefront shrinks into its frame
  var vf = $('.v-frame');
  function visit(vh) {
    if (still()) return;
    var b = vf.parentNode.getBoundingClientRect(), sec = $('[data-visit]').getBoundingClientRect();
    var k = smooth(clamp(-sec.top / (vh * .9), 0, 1));
    var inset = (phone() ? 0 : 1) * k * Math.min(56, innerWidth * .04);
    vf.style.setProperty('--ci', inset.toFixed(1) + 'px'); vf.style.setProperty('--cr', (k * 22).toFixed(1) + 'px');
    vf.style.setProperty('--cs', (1.12 - .1 * k).toFixed(4));
  }

  // ---------------------------------------------------------------- footer: the sign switches on above its horizon
  var ft = $('[data-foot]');
  function foot(vh) {
    var b = ft.getBoundingClientRect(), k = clamp((vh - b.top) / (vh * .8), 0, 1);
    ft.classList.toggle('lit', k > .45 || still());
    ft.style.setProperty('--hy', ((1 - k) * 140).toFixed(1) + 'px');
  }

  // ---------------------------------------------------------------- hero: light motes in the room, a sheen that follows the hand
  var motes = (function () {
    var cv = $('[data-motes]'), cx = cv.getContext('2d'), P = [], w = 0, h = 0, run = 0, vis = true, px = -1e3, py = -1e3, sheen = $('[data-sheen]'), t0 = performance.now(), user = 0;
    function size() {
      var d = Math.min(devicePixelRatio || 1, 2); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * d; cv.height = h * d; cx.setTransform(d, 0, 0, d, 0, 0);
      P = []; var n = phone() ? 34 : 70;
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 1.8, v: .12 + Math.random() * .35, a: .25 + Math.random() * .6, ph: Math.random() * 6.3, c: Math.random() < .6 ? '217,210,255' : '231,182,166' });
    }
    function tick(t) {
      run = 0; if (still() || !vis) return;
      cx.clearRect(0, 0, w, h);
      P.forEach(function (p) {
        p.y -= p.v; p.x += Math.sin(t / 1600 + p.ph) * .25;
        var dx = p.x - px, dy = p.y - py, d = Math.hypot(dx, dy); if (d < 120) { p.x += dx / d * 1.6; p.y += dy / d * 1.6; }
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.3); cx.fillStyle = 'rgba(' + p.c + ',' + (p.a * (.6 + .4 * Math.sin(t / 700 + p.ph))).toFixed(3) + ')'; cx.fill();
      });
      // without a mouse (phones) the sheen drifts across the hair by itself
      if (!fine || t - user > 2600) { var s = (t - t0) / 5200; sheen.style.setProperty('--sx', (50 + 22 * Math.sin(s * 2.1)).toFixed(1) + '%'); sheen.style.setProperty('--sy', (44 + 16 * Math.sin(s * 1.3 + 1)).toFixed(1) + '%'); }
      kick();
    }
    function kick() { if (!run && !still() && vis) run = requestAnimationFrame(tick); }
    var l0 = cv.parentNode;
    l0.parentNode.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return; var b = l0.getBoundingClientRect(); px = e.clientX - b.left; py = e.clientY - b.top; user = performance.now();
      sheen.style.setProperty('--sx', (px / b.width * 100).toFixed(1) + '%'); sheen.style.setProperty('--sy', (py / b.height * 100).toFixed(1) + '%');
    });
    if (io) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; kick(); }).observe(stage);
    size(); kick();
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- the strand tile: a sheet of fine hair, a band of light running down it
  var strand = (function () {
    var cv = $('[data-strand]'), cx = cv.getContext('2d'), w = 0, h = 0, run = 0, vis = false, lis = $$('.svc li'), lines = [];
    function size() {
      var d = Math.min(devicePixelRatio || 1, 2); w = cv.clientWidth; h = cv.clientHeight; if (!w) return; cv.width = w * d; cv.height = h * d; cx.setTransform(d, 0, 0, d, 0, 0);
      lines = []; for (var x = -6; x < w + 6; x += 2.2) lines.push({ x: x, k: Math.random(), s: .3 + Math.random() * .7 });
      if (still()) draw(performance.now());
    }
    function draw(t) {
      cx.clearRect(0, 0, w, h);
      var band = still() ? h * .4 : ((t / 3600) % 1) * (h + 260) - 130;
      lines.forEach(function (L) {
        cx.beginPath(); cx.moveTo(L.x, 0);
        var sway = still() ? 0 : Math.sin(t / 2400 + L.k * 3) * 2.2 * L.s;
        cx.bezierCurveTo(L.x + sway, h * .33, L.x - sway, h * .66, L.x + sway * .6, h);
        var g = cx.createLinearGradient(0, 0, 0, h);
        var b0 = clamp((band - 90) / h, 0, 1), b1 = clamp(band / h, 0, 1), b2 = clamp((band + 90) / h, 0, 1);
        g.addColorStop(0, 'rgba(60,40,36,' + (.55 + .3 * L.k) + ')'); g.addColorStop(b0, 'rgba(60,40,36,' + (.55 + .3 * L.k) + ')');
        g.addColorStop(b1, 'rgba(236,226,255,' + (.55 + .4 * L.s) + ')'); g.addColorStop(b2, 'rgba(70,46,40,' + (.55 + .3 * L.k) + ')'); g.addColorStop(1, 'rgba(30,22,24,.9)');
        cx.strokeStyle = g; cx.lineWidth = .9 + L.s * .8; cx.stroke();
      });
      var hot = Math.floor(clamp(band / h, 0, .999) * lis.length);
      lis.forEach(function (li, i) { li.classList.toggle('hot', !still() && i === hot); });
    }
    function tick(t) { run = 0; if (still() || !vis) return; draw(t); kick(); }
    function kick() { if (still()) { size(); return; } if (!run && vis) run = requestAnimationFrame(tick); }
    if (io) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; kick(); }).observe(cv.parentNode); else vis = true;
    size();
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- booking: the card writes the WhatsApp message
  var book = $('[data-book]'), daysBox = $('[data-days]'), partsBox = $('[data-parts]'), preview = $('[data-preview]'), send = $('[data-send]');
  var SVC = { he: ['החלקה', 'צבע', 'תספורת', 'פן ועיצוב', null], en: ['straightening', 'colour', 'a cut', 'a blow-dry and styling', null] };
  var PARTS = { he: ['בבוקר', 'בצהריים', 'אחר הצהריים'], en: ['morning', 'midday', 'afternoon'] };
  var SHORT_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], SHORT_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function buildDays() {
    var l = he(), n = window.__now || now(), sel = book.querySelector('input[name="day"]:checked'), keep = sel ? +sel.value : -1;
    if (keep < 0) { keep = n.d; var k = 0; while ((!H[keep] || (keep === n.d && n.h >= H[keep][1] - 1)) && k++ < 8) keep = (keep + 1) % 7; }
    daysBox.innerHTML = [0, 1, 2, 3, 4, 5, 6].map(function (d) {
      return '<label><input type="radio" name="day" value="' + d + '"' + (H[d] ? '' : ' disabled') + (d === keep ? ' checked' : '') + '>' + (l ? SHORT_HE : SHORT_EN)[d] + '<small>' + (H[d] ? '' : (l ? 'סגור' : 'closed')) + '</small></label>';
    }).join('');
    buildParts();
  }
  function buildParts() {
    var l = he(), d = +(book.querySelector('input[name="day"]:checked') || { value: 0 }).value, sel = book.querySelector('input[name="part"]:checked'), keep = sel ? +sel.value : 0;
    var parts = H[d] && H[d][1] <= 14 ? [0, 1] : [0, 1, 2]; if (parts.indexOf(keep) < 0) keep = 0;
    partsBox.innerHTML = parts.map(function (i) { return '<label><input type="radio" name="part" value="' + i + '"' + (i === keep ? ' checked' : '') + '>' + PARTS[l ? 'he' : 'en'][i] + '</label>'; }).join('');
  }
  function write() {
    var l = he(), s = +book.querySelector('input[name="svc"]:checked').value, d = +(book.querySelector('input[name="day"]:checked') || { value: 0 }).value, pt = +(book.querySelector('input[name="part"]:checked') || { value: 0 }).value;
    var svc = SVC[l ? 'he' : 'en'][s], day = (l ? dayHe : dayEn)[d], part = PARTS[l ? 'he' : 'en'][pt];
    var msg = l
      ? 'היי יריב, ' + (svc ? 'אשמח לקבוע תור ל' + svc : 'אשמח לקבוע תור') + ', ביום ' + day + ' ' + part + '. מתי יש לך מקום?'
      : 'Hi Yariv, I’d like to book ' + (svc || 'an appointment') + ' on ' + day + ', ' + (pt === 0 ? 'in the morning' : pt === 1 ? 'around midday' : 'in the afternoon') + '. When do you have a free slot?';
    preview.textContent = msg;
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
  }
  book.addEventListener('change', function (e) { if (e.target.name === 'day') buildParts(); write(); });
  book.addEventListener('submit', function (e) { e.preventDefault(); });

  // ---------------------------------------------------------------- opening: once per visit, skippable
  (function opening() {
    var op = $('[data-opener]');
    if (!root.classList.contains('opening')) { op.remove(); return; }
    var done = false;
    function end() { if (done) return; done = true; op.classList.add('done'); try { sessionStorage.setItem('yh-open', '1'); } catch (e) {} setTimeout(function () { root.classList.remove('opening'); op.remove(); }, 700); }
    op.addEventListener('click', end); addEventListener('keydown', end, { once: true });
    setTimeout(end, 1500);
  })();

  function cb() { root.style.setProperty('--cb', $('.concept').offsetHeight + 'px'); }
  cb(); addEventListener('resize', cb);
  texts(root.lang); split(); hours(); buildDays(); write(); frame();
  window.__yh = { frame: frame, status: status };
})();
