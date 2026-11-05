(function () {
  var root = document.documentElement, WA = '972509412589';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 760; };
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'קיטי לק · מניקור, פדיקור ועיצובי ציפורניים · דבורה 1, קריית מוצקין', en: 'Kitty Lak · Manicure, pedicure and nail art · 1 Dvora St, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור קיטי לק · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Kitty Lak · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  // progress of an element through the viewport: 0 when its top meets the bottom of the screen, 1 when its top reaches `end` of the screen
  var prog = function (el, end) { var r = el.getBoundingClientRect(), h = innerHeight; return clamp((h - r.top) / (h * (1 - (end || 0))), 0, 1); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'קיטי לק', 'Kitty Lak');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לקיטי לק, 050-941-2589', 'Call Kitty Lak, 050-941-2589');
    aria('[data-t-wa]', 'וואטסאפ לקיטי לק', 'WhatsApp Kitty Lak');
    aria('[data-t-prev]', 'העיצוב הקודם', 'Previous design');
    aria('[data-t-next]', 'העיצוב הבא', 'Next design');
    aria('[data-t-svc]', 'מה עושים', 'What are we doing');
    aria('[data-t-rack]', 'גוון', 'Shade');
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('kl-lang', l); } catch (e) {}
    texts(l); hours(); buildRack(); buildDays(); compose(true); bigAlt();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('kl-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-wm],[data-flora]').forEach(function (el) { el.classList.add('in'); });
    hero.classList.add('painted'); foil.kick(); tfoil.kick(); scroll(); compose(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9, 20], 1: [9, 17], 2: [8, 20], 3: [8, 20], 4: [8, 20], 5: [8, 15], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], shortEn = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
    week(n);
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
  // the week as seven polish rails: each bar runs from opening to closing (7:00 at the top, 21:00 at the bottom)
  function week(n) {
    var w = $('[data-week]'), lab = he() ? shortHe : shortEn, top = 7, span = 14, order = [0, 1, 2, 3, 4, 5, 6];
    if (he()) order.reverse();
    w.innerHTML = order.map(function (d) {
      var t = H[d], bar = t ? '<i class="bar" style="top:' + ((t[0] - top) / span * 100) + '%;bottom:' + ((top + span - t[1]) / span * 100) + '%"></i>' : '';
      var mark = d === n.d && t && n.h >= top && n.h <= top + span ? '<i class="now" style="top:' + ((n.h - top) / span * 100) + '%"></i>' : '';
      return '<span class="col' + (d === n.d ? ' today' : '') + '"><span class="rail">' + bar + mark + '</span><span class="lb">' + lab[d] + '</span></span>';
    }).join('');
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-wm],[data-flora]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline letters
  $$('[data-split] > span[lang]').forEach(function (sp) {
    var i = 0;
    [].slice.call(sp.childNodes).forEach(function (node) {
      var wrapIn = node.nodeType === 3 ? null : node, txt = node.textContent, html = txt.split(' ').map(function (w) {
        return w ? '<span class="w" style="display:inline-block">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>' : '';
      }).join(' ');
      if (wrapIn) wrapIn.innerHTML = html; else { var s = document.createElement('span'); s.innerHTML = html; sp.replaceChild(s, node); }
    });
  });
  // footer watermark letters
  var wm = $('[data-wm]'); wm.innerHTML = wm.textContent.split('').map(function (c, i) { return '<span class="lt" aria-hidden="true" style="--i:' + i + '">' + c + '</span>'; }).join('');

  // odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
    var roll = function (go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 6) % 10; s.style.transitionDelay = go ? (300 + i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); };
    roll(still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { requestAnimationFrame(function () { roll(true); }); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(true);
  });

  // ---------------------------------------------------------------- hero: nails painted in, a cat-eye shine that follows the hand
  var hero = $('[data-hero]'), nav = $('[data-nav]');
  requestAnimationFrame(function () { setTimeout(function () { hero.classList.add('painted'); }, 60); });
  var cx = .4, tx = .4, pointerT = 0;
  function setCx(v) { hero.style.setProperty('--cx', v.toFixed(3)); $('[data-bignail]').style.setProperty('--cx', v.toFixed(3)); $('[data-pnail]').style.setProperty('--cx', v.toFixed(3)); }
  addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; tx = e.clientX / innerWidth; pointerT = performance.now(); }, { passive: true });

  // gold-leaf flakes drifting over the hero; they part around the cursor and flash as they turn to the light
  function flakes(cv, host, count, opt) {
    var c = cv.getContext('2d'), F = [], w, h, raf = 0, vis = true, mx = -999, my = -999;
    function mk() {
      F = []; for (var i = 0; i < count; i++) {
        var pts = [], n = 5 + Math.floor(Math.random() * 3), r = (opt.min + Math.random() * (opt.max - opt.min));
        for (var k = 0; k < n; k++) { var a = k / n * 6.283 + Math.random() * .6, rr = r * (.55 + Math.random() * .6); pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
        F.push({ x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, pts: pts, rot: Math.random() * 6.28, vr: (Math.random() - .5) * .01, flip: Math.random() * 6.28, fs: .01 + Math.random() * .025, fall: .12 + Math.random() * .25 });
      }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = host.clientWidth; h = host.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); mk(); }
    function draw(move) {
      c.clearRect(0, 0, w, h);
      for (var i = 0; i < F.length; i++) {
        var f = F[i];
        if (move) {
          var dx = f.x - mx, dy = f.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 14000) { var d = Math.sqrt(d2) || 1, k = (14000 - d2) / 14000 * .9; f.vx += dx / d * k; f.vy += dy / d * k; }
          f.vx *= .92; f.vy *= .92; f.x += f.vx + Math.sin(f.flip) * .15; f.y += f.vy + f.fall; f.rot += f.vr; f.flip += f.fs;
          if (f.y > h + 30) { f.y = -30; f.x = Math.random() * w; }
          if (f.x < -30) f.x = w + 20; if (f.x > w + 30) f.x = -20;
        }
        var turn = Math.cos(f.flip), shine = Math.pow(Math.abs(Math.sin(f.flip)), 6);
        c.save(); c.translate(f.x, f.y); c.rotate(f.rot); c.scale(Math.max(.15, Math.abs(turn)), 1);
        c.beginPath(); f.pts.forEach(function (p, j) { j ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.closePath();
        c.fillStyle = 'rgba(' + Math.round(214 + shine * 41) + ',' + Math.round(176 + shine * 70) + ',' + Math.round(102 + shine * 120) + ',' + opt.alpha + ')';
        c.fill(); c.restore();
      }
    }
    function frame() { raf = 0; if (still() || !vis) { draw(false); return; } draw(true); raf = requestAnimationFrame(frame); }
    host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    host.addEventListener('pointerleave', function () { mx = my = -999; });
    host.addEventListener('pointerdown', function (e) { var r = host.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top; F.forEach(function (f) { var dx = f.x - px, dy = f.y - py, d = Math.sqrt(dx * dx + dy * dy) || 1; if (d < 220) { f.vx += dx / d * 6; f.vy += dy / d * 6; } }); });
    watch(host, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    size(); kick();
    return { kick: kick, size: function () { size(); draw(false); } };
  }
  var foil = flakes($('[data-foil]'), hero, phone() ? 18 : 34, { min: 4, max: 11, alpha: .85 });
  var tfoil = flakes($('[data-tfoil]'), $('.t-photo'), 14, { min: 5, max: 12, alpha: .9 });

  // ---------------------------------------------------------------- designs: one big nail, each design painted over the last
  var items = $$('.d-item'), big = $('[data-bignail]'), cur = 0, dots = $('[data-ddots]');
  dots.innerHTML = items.map(function () { return '<i></i>'; }).join('');
  function bigAlt() { var it = items[cur], img = $('.layer:last-of-type img', big); if (img) img.alt = it.dataset[he() ? 'he' : 'en']; }
  function show(i) {
    i = (i + items.length) % items.length; if (i === cur && $('.layer', big)) { mark(); return; }
    cur = i; mark();
    var it = items[i], L = document.createElement('div');
    L.className = 'layer' + (still() ? '' : ' new'); L.setAttribute('data-layer', '');
    L.innerHTML = '<img src="' + it.dataset.img + '" width="' + it.dataset.w + '" height="' + it.dataset.h + '" alt="' + it.dataset[he() ? 'he' : 'en'] + '" style="object-position:' + it.dataset.pos + '">';
    big.insertBefore(L, $('.eye', big));
    var olds = $$('.layer', big).filter(function (x) { return x !== L; });
    var done = function () { olds.forEach(function (o) { o.remove(); }); };
    if (still()) done(); else { requestAnimationFrame(function () { requestAnimationFrame(function () { L.classList.add('go'); }); }); setTimeout(done, 950); }
  }
  function mark() { items.forEach(function (b, k) { b.classList.toggle('on', k === cur); }); $$('i', dots).forEach(function (d, k) { d.classList.toggle('on', k === cur); }); }
  $('.layer img', big).style.objectPosition = items[0].dataset.pos;
  mark();
  var manualUntil = 0;
  items.forEach(function (b, k) { b.addEventListener('click', function () { manualUntil = performance.now() + 1500; show(k); }); });
  $$('[data-dstep]').forEach(function (b) { b.addEventListener('click', function () { manualUntil = performance.now() + 1500; show(cur + +b.dataset.dstep); }); });
  function designScroll() {
    if (still() || performance.now() < manualUntil) return;
    var mid = innerHeight * (phone() ? .72 : .5), best = cur, bd = 1e9;
    items.forEach(function (b, k) { var r = b.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - mid); if (d < bd) { bd = d; best = k; } });
    var sec = $('[data-designs]').getBoundingClientRect();
    if (sec.top < innerHeight && sec.bottom > 0 && best !== cur) show(best);
  }

  // ---------------------------------------------------------------- bento: spotlight under the hand, the photo leans toward it
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.classList.add('lit'); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px');
      if (t.hasAttribute('data-tilt') && !still()) { t.style.setProperty('--tx', ((e.clientX - r.left) / r.width - .5) * -18 + 'px'); t.style.setProperty('--ty', ((e.clientY - r.top) / r.height - .5) * -18 + 'px'); } });
    t.addEventListener('pointerleave', function () { t.classList.remove('lit'); t.style.setProperty('--tx', '0px'); t.style.setProperty('--ty', '0px'); });
  });

  // ---------------------------------------------------------------- book: pick a bottle, the message writes itself
  var SHADES = [
    { c: '#b9a2f0', he: 'לילך', en: 'lilac' }, { c: '#d9338d', he: 'פוקסיה', en: 'fuchsia' }, { c: '#e9c2b4', he: 'נוד', en: 'nude' },
    { c: '#b8692e', he: 'קקאו', en: 'cocoa' }, { c: '#2a2226', he: 'שחור מט', en: 'matte black' }, { c: '#d8ae5c', he: 'זהב', en: 'gold' }
  ];
  var SVC = { he: ['מניקור', 'פדיקור', 'מניקור ופדיקור'], en: ['manicure', 'pedicure', 'manicure and pedicure'] };
  var st = { svc: 0, shade: 0, day: '', touched: 0 };
  function buildRack() {
    var r = $('[data-rack]'), l = he() ? 'he' : 'en';
    r.innerHTML = SHADES.map(function (s, i) { return '<button type="button" class="btl" role="radio" aria-checked="' + (i === st.shade) + '" data-i="' + i + '" style="--c:' + s.c + '"><i class="cap"></i><i class="glass"></i><span class="lb">' + s[l] + '</span></button>'; }).join('');
    $$('.btl', r).forEach(function (b) { b.addEventListener('click', function () { st.shade = +b.dataset.i; st.touched = Math.max(st.touched, 2); $$('.btl', r).forEach(function (x) { x.setAttribute('aria-checked', x === b); }); compose(); }); });
  }
  function buildDays() {
    var s = $('[data-day]'), l = he(), opts = ['<option value="">' + (l ? 'לא משנה' : 'Any day') + '</option>'];
    for (var d = 0; d < 7; d++) if (H[d]) opts.push('<option value="' + d + '">' + (l ? dayHe[d] : dayEn[d]) + '</option>');
    s.innerHTML = opts.join(''); s.value = st.day;
  }
  $$('[data-svc] button').forEach(function (b) { b.addEventListener('click', function () { st.svc = +b.dataset.v; st.touched = Math.max(st.touched, 1); $$('[data-svc] button').forEach(function (x) { x.setAttribute('aria-checked', x === b); }); compose(); }); });
  $('[data-day]').addEventListener('change', function (e) { st.day = e.target.value; st.touched = 3; compose(); });
  function message() {
    var l = he(), s = SHADES[st.shade], svc = SVC[l ? 'he' : 'en'][st.svc], d = st.day === '' ? null : +st.day;
    return l ? 'היי, הגעתי מהאתר. אשמח לקבוע תור ל' + svc + (d === null ? '' : ' ביום ' + dayHe[d]) + '. חשבתי על גוון ' + s.he + '.'
             : 'Hi, I found you through the website. I’d like to book a ' + svc + (d === null ? '' : ' on ' + dayEn[d]) + '. I was thinking of a ' + s.en + ' shade.';
  }
  var typing = 0;
  function compose(instant) {
    var m = message(), el = $('[data-msg]'), s = SHADES[st.shade];
    $('[data-pnail]').style.setProperty('--pc', s.c);
    $('[data-pname]').textContent = s[he() ? 'he' : 'en'];
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    $$('[data-step]').forEach(function (li) { li.classList.toggle('on', +li.dataset.step <= Math.min(2, st.touched)); });
    clearInterval(typing);
    if (instant || still()) { el.textContent = m; return; }
    var keep = 0, old = el.textContent; while (keep < old.length && old[keep] === m[keep]) keep++;
    var i = keep; el.textContent = m.slice(0, i);
    typing = setInterval(function () { i += 2; el.textContent = m.slice(0, i); if (i >= m.length) clearInterval(typing); }, 18);
  }

  // ---------------------------------------------------------------- scroll loop: nav pill, brush seam, iris, photo into its frame, the shine on phones
  var stroke = $('[data-stroke]'), bookIn = $('.b-in'), visit = $('[data-visit]');
  function scroll() {
    nav.classList.toggle('pill', scrollY > 60);
    var s = still();
    var hr = hero.getBoundingClientRect(), p = s ? 1 : clamp(-hr.top / (hr.height * .45), 0, 1);
    stroke.style.setProperty('--sp', s ? 1 : (.35 + p * .65).toFixed(3));
    stroke.style.setProperty('--sl', s ? 1 : (.15 + p * .85).toFixed(3));
    bookIn.style.setProperty('--ip', s ? 1 : prog(bookIn, .35).toFixed(3));
    visit.style.setProperty('--vp', s ? 1 : prog(visit, .3).toFixed(3));
    $$('[data-flora]').forEach(function (f) { var r = f.parentNode.getBoundingClientRect(); f.style.setProperty('--fy', s ? 0 : clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1).toFixed(3)); });
    designScroll();
  }
  addEventListener('scroll', scroll, { passive: true });
  addEventListener('resize', function () { foil.size(); tfoil.size(); scroll(); });

  // the cat-eye band glides: toward the mouse on desktop, by itself and with the scroll on phones
  (function loop(t) {
    if (!still()) {
      var idle = !finePointer || t - pointerT > 2500;
      var target = idle ? .5 + Math.sin(t / 1600) * .42 + Math.sin(scrollY / 300) * .08 : tx;
      cx += (target - cx) * .07; setCx(cx);
    } else if (cx !== .42) { cx = .42; setCx(cx); }
    requestAnimationFrame(loop);
  })(0);

  texts(root.lang); hours(); buildRack(); buildDays(); compose(true); scroll();
})();
