(function () {
  var root = document.documentElement, WA = '972526535565', MAIL = '4laptop@gmail.com';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth <= 760; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var TITLE = { he: 'ספקטור אלקטרוניקה ומחשבים · מעבדת תיקון לוחות · צבר 1, חיפה', en: 'Spektor Electronics & Computers · Board repair lab · 1 Tsabar St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור ספקטור אלקטרוניקה ומחשבים · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Spektor Electronics & Computers · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'ספקטור אלקטרוניקה ומחשבים', 'Spektor Electronics & Computers');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-prev]', 'הקודם', 'Previous');
    aria('[data-t-next]', 'הבא', 'Next');
    aria('[data-t-sprev]', 'השלב הקודם', 'Previous stage');
    aria('[data-t-snext]', 'השלב הבא', 'Next stage');
    aria('[data-t-stages]', 'שלבים', 'Stages');
    aria('[data-t-keys]', 'מה קרה', 'What happened');
    aria('[data-t-dev]', 'איזה מכשיר', 'Which device');
    aria('[data-t-visit]', 'ביקור ויצירת קשר', 'Visit and contact');
    aria('[data-t-call]', 'התקשרו למעבדה, 052-653-5565', 'Call the lab, 052-653-5565');
    aria('[data-t-wa]', 'וואטסאפ למעבדה', 'WhatsApp the lab');
    $$('[data-key]').forEach(function (k) { k.textContent = k.dataset[l === 'he' ? 'lhe' : 'len']; });
    $$('.dc').forEach(function (d) { d.textContent = (l === 'en' && d.dataset.decodeEn) || d.dataset.decode; });
    $$('.hs').forEach(function (s) { if (s.classList.contains('show')) $('b', s).textContent = s.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('spk-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still(), y = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('spk-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    layout(); lens.kick(); chip.kick(); write(true); setStage(stage, true);
    if (b.closest('.foot')) scrollTo(0, document.documentElement.scrollHeight);   // keep the footer switch under the finger
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9.5, 17.5], 1: [9.5, 17.5], 2: [9.5, 17.5], 3: [9.5, 17.5], 4: [9.5, 17.5], 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    var all = [0, 1, 2, 3, 4, 5, 6].every(function (d) { return H[d] && H[d][0] === 0 && H[d][1] === 24; });
    if (all) { open = true; txt = l ? 'פתוח עכשיו · 24/7' : 'Open now · 24/7'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-die]').forEach(function (el) { el.classList.toggle('open', open); });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
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
  $$('.bento, .vb').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 70 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline: each letter heats up, violet to amber to white
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 14 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });
  // footer name letters
  $$('[data-fname] > span[lang]').forEach(function (sp) { sp.innerHTML = sp.textContent.split('').map(function (c, i) { return '<span class="c" style="--i:' + i + '">' + c + '</span>'; }).join(''); });

  // ---------------------------------------------------------------- glyph decode for labels
  var GL = '01<>#%&*/=+ABCDEFXZ';
  function decode(el, txt, ms) {
    clearInterval(el._dt);
    if (still()) { el.textContent = txt; return; }
    var t0 = performance.now(), dur = ms || 520;
    el._dt = setInterval(function () {
      var u = clamp((performance.now() - t0) / dur, 0, 1), n = Math.floor(u * txt.length), out = '';
      for (var i = 0; i < txt.length; i++) out += i < n || txt[i] === ' ' ? txt[i] : GL[Math.floor(Math.random() * GL.length)];
      el.textContent = out; if (u >= 1) clearInterval(el._dt);
    }, 34);
  }

  var hero = $('[data-hero]'), hold = $('[data-herohold]'), nav = $('[data-nav]'), media = $('[data-hmedia]');

  // ---------------------------------------------------------------- hero: the thermal lens
  var lens = (function () {
    var ir = $('[data-ir]'), ring = $('[data-lens]'), spots = $$('.hs'), mk = $('[data-mk]');
    var x = 0, y = 0, tx = 0, ty = 0, r = 0, rt = 0, raf = 0, vis = true, lastMove = -1e9, t0 = performance.now(), ready = false, sp = [];
    function R() { return phone() ? 92 : clamp(innerWidth * .1, 120, 170); }
    var copy = $('.h-copy', hero);
    function copyTop() { return copy.offsetTop; }
    function copyX() { return copy.offsetLeft + copy.offsetWidth / 2; }
    function place() {
      // spots follow the photo under object-fit: cover
      var W = media.offsetWidth, Hh = media.offsetHeight, tall = phone(), iw = tall ? 900 : 1600, ih = tall ? 1200 : 1000;
      var s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s, ox = (W - dw) / 2, oy = (Hh - dh) / 2;
      sp = spots.map(function (el) {
        var c = el.dataset[tall ? 't' : 'w'].split(','), px = ox + dw * +c[0], py = oy + dh * +c[1];
        el.style.transform = 'translate(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px)';
        el.classList.toggle('flip', px > W * .62);
        var off = px < 24 || px > W - 24 || py < 84 || py > copyTop() - 26 && (phone() || Math.abs(px - copyX()) < 360) || py > Hh - 90;
        el.hidden = off;
        return { el: el, x: px, y: py, off: off, until: 0 };
      });
    }
    function show(s, on) {
      if (on === s.el.classList.contains('show')) return;
      s.el.classList.toggle('show', on);
      var b = $('b', s.el); if (on) decode(b, s.el.dataset[he() ? 'he' : 'en']); else b.textContent = '';
    }
    function roam(T) {   // a slow figure-eight over the photo, clear of the headline, when no hand is on it
      var W = media.offsetWidth, Hh = media.offsetHeight, top = 96 + R() * .5, bot = phone() ? copyTop() - R() * .7 : Hh * .62, cy = (top + bot) / 2, ay = Math.max(0, (bot - top) / 2);
      var cx = phone() ? W * .5 : (rtl() ? W * .19 : W * .81), ax = phone() ? W * .28 : W * .11;
      return [cx + ax * Math.sin(T * .23), cy + ay * Math.sin(T * .46 + .6)];
    }
    function frame(t) {
      raf = 0;
      var W = media.offsetWidth, Hh = media.offsetHeight, T = (t - t0) / 1000;
      if (still()) {
        var c = sp[0] || { x: W * .5, y: Hh * .4 }; x = c.x; y = c.y; r = R() * .9;
        sp.forEach(function (s) { show(s, !s.off); });
      } else {
        if (t - lastMove > 2600) { var p = roam(T); tx = p[0]; ty = p[1]; }
        x = lerp(x, tx, .09); y = lerp(y, ty, .09);
        rt = ready ? R() : 0; r = lerp(r, rt, .08);
        sp.forEach(function (s) { var d = Math.hypot(s.x - x, s.y - y); if (!s.off && d < r + 30) s.until = t + 2400; show(s, !s.off && t < s.until); });
      }
      ir.style.setProperty('--lx', x.toFixed(1) + 'px'); ir.style.setProperty('--ly', y.toFixed(1) + 'px'); ir.style.setProperty('--lr', r.toFixed(1) + 'px');
      ring.style.setProperty('--lr', r.toFixed(1) + 'px');
      ring.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      ring.classList.toggle('on', r > 20);
      var f = clamp(x / Math.max(1, W), 0, 1); mk.style.setProperty('--mk', ((rtl() ? 1 - f : f) * 100).toFixed(1) + '%');
      if (!still() && vis) raf = requestAnimationFrame(frame);
    }
    function local(e) { var rc = media.getBoundingClientRect(), k = media.offsetWidth / rc.width; return [(e.clientX - rc.left) * k, (e.clientY - rc.top) * k]; }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType === 'touch') return; var p = local(e); tx = p[0]; ty = p[1]; lastMove = performance.now(); });
    hero.addEventListener('pointerdown', function (e) { var p = local(e); tx = p[0]; ty = p[1]; lastMove = performance.now(); });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    var p0 = [innerWidth * .6, innerHeight * .4]; x = tx = p0[0]; y = ty = p0[1];
    return { kick: kick, place: function () { place(); kick(); }, start: function () { ready = true; kick(); } };
  })();

  // ---------------------------------------------------------------- opening: logo heats, photos dealt, last card becomes the hero
  var intro = $('[data-intro]');
  function startHero() { requestAnimationFrame(function () { hero.classList.add('ready'); lens.start(); }); }
  (function () {
    var seen = false; try { seen = sessionStorage.getItem('spk-intro') === '1'; } catch (e) {}
    if (still() || seen || scrollY > 40) { intro.remove(); startHero(); return; }
    try { sessionStorage.setItem('spk-intro', '1'); } catch (e) {}
    intro.hidden = false;
    var cards = $$('.i-deck img', intro), hot = $('.i-logo .hot', intro), done = false, t0 = performance.now();
    var POS = [[-30, -6, -9], [-10, 4, 5], [10, -4, -4], [30, 6, 8], [0, 0, 0]];
    cards.forEach(function (c, i) { c.style.setProperty('--x', POS[i][0] + 'vw'); c.style.setProperty('--y', POS[i][1] + 'vh'); c.style.setProperty('--r', POS[i][2] + 'deg'); });
    (function g(t) { var u = clamp((t - t0) / 520, 0, 1); hot.style.setProperty('--g', (u * 75).toFixed(1) + '%'); if (u < 1 && !done) requestAnimationFrame(g); })(t0);
    var timers = [];
    timers.push(setTimeout(function () { intro.classList.add('dealt'); }, 520));
    cards.forEach(function (c, i) { timers.push(setTimeout(function () { c.classList.add('in'); }, 560 + i * 110)); });
    timers.push(setTimeout(function () { cards[cards.length - 1].classList.add('grow'); }, 1120));
    function finish() { if (done) return; done = true; timers.forEach(clearTimeout); intro.classList.add('out'); startHero(); setTimeout(function () { intro.remove(); }, 480); }
    timers.push(setTimeout(finish, 1600));
    intro.addEventListener('click', finish);
    addEventListener('keydown', finish, { once: true });
    addEventListener('wheel', finish, { once: true, passive: true });
    addEventListener('touchmove', finish, { once: true, passive: true });
  })();

  // ---------------------------------------------------------------- the bench rail
  var lab = $('[data-lab]'), rail = $('[data-rail]'), railView = $('[data-railview]'), fcs = $$('[data-fc]', rail), labN = $('[data-labn]'), labProg = $('[data-labprog]'), active = -1;
  function setActive(i) {
    if (i === active) return; active = i; labN.textContent = i + 1;
    fcs.forEach(function (c, k) { c.classList.toggle('on', k === i); });
    var d = $('.dc', fcs[i]); if (d) decode(d, (!he() && d.dataset.decodeEn) || d.dataset.decode, 600);
  }
  fcs.forEach(function (c) {
    var pic = $('.fc-pic', c);
    pic.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || still()) return;
      var r = pic.getBoundingClientRect(), u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height;
      pic.style.setProperty('--ry', ((u - .5) * 10).toFixed(2) + 'deg'); pic.style.setProperty('--rx', ((.5 - v) * 8).toFixed(2) + 'deg');
      pic.style.setProperty('--mx', (u * 100).toFixed(1) + '%'); pic.style.setProperty('--my', (v * 100).toFixed(1) + '%');
    });
    pic.addEventListener('pointerleave', function () { pic.style.setProperty('--rx', '0deg'); pic.style.setProperty('--ry', '0deg'); });
  });
  $$('[data-labstep]').forEach(function (b) { b.addEventListener('click', function () {
    var n = clamp(active + +b.dataset.labstep, 0, fcs.length - 1);
    if (still()) { var c = fcs[n]; railView.scrollTo({ left: c.offsetLeft - (railView.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' }); setActive(n); return; }
    var top = lab.getBoundingClientRect().top + scrollY, span = lab.offsetHeight - innerHeight;
    scrollTo({ top: top + span * (n / (fcs.length - 1)) * .9 + 2, behavior: 'smooth' });
  }); });
  railView.addEventListener('scroll', function () { if (!still()) return; var mid = railView.getBoundingClientRect().left + railView.clientWidth / 2, best = 0, bd = 1e9; fcs.forEach(function (c, i) { var r = c.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = i; } }); setActive(best); }, { passive: true });

  // ---------------------------------------------------------------- the thermal camera
  var scan = $('[data-scan]'), vf = $('[data-vf]'), vfin = $('.vf-in', vf), hotLay = $('[data-hotlay]'), coolLay = $('[data-coollay]'), noz = $('[data-nozzle]'), lock = $('[data-lock]'), read = $('[data-read]'), vfmk = $('[data-vfmk]');
  var sts = $$('.st'), scs = $$('[data-sgo]'), stage = 0, readOdo = $('[data-odo]', read);
  var PRE = [{ h: 0, c: 0, n: 0, l: 0, r: 0, m: .12 }, { h: 160, c: 0, n: 0, l: 1, r: 1, m: .86 }, { h: 160, c: 0, n: 1, l: 1, r: 1, m: .86 }, { h: 160, c: 1, n: 0, l: 0, r: 0, m: .2 }];
  function applyScan(v) {
    hotLay.style.setProperty('--heat', v.h.toFixed(1) + '%');
    coolLay.style.setProperty('--cool', v.c.toFixed(3));
    noz.style.setProperty('--nz', v.n.toFixed(3)); noz.style.setProperty('--nzo', clamp(v.n * 3, 0, 1).toFixed(3));
    lock.style.setProperty('--lk', lerp(2, 1, v.l).toFixed(3)); lock.style.setProperty('--lko', (v.l * (1 - v.c)).toFixed(3));
    read.style.setProperty('--ro', v.r.toFixed(3));
    vfmk.parentNode.style.setProperty('--sm', v.m.toFixed(3));
  }
  function setStage(s, force) {
    if (s === stage && !force) return; stage = s;
    sts.forEach(function (el, i) { el.classList.toggle('on', i === s); });
    scs.forEach(function (b, i) { b.setAttribute('aria-pressed', i === s ? 'true' : 'false'); });
    roll(readOdo, s === 1 || s === 2 || still());
    if (still()) { vfin.style.setProperty('--ci', '0%'); applyScan(PRE[s]); }
  }
  function goStage(s) {
    s = clamp(s, 0, 3);
    if (still()) { setStage(s); return; }
    var top = scan.getBoundingClientRect().top + scrollY, span = scan.offsetHeight - innerHeight, at = [.2, .44, .66, .92][s];
    scrollTo({ top: top + span * at, behavior: 'smooth' });
  }
  scs.forEach(function (b, i) { b.addEventListener('click', function () { goStage(i); }); });
  $$('[data-sstep]').forEach(function (b) { b.addEventListener('click', function () { goStage(stage + +b.dataset.sstep); }); });

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 4) % 10; s.style.transitionDelay = go && !still() ? (i * 140) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    if (o.closest('[data-read]')) { roll(o, still()); return; }
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- shop: the hand heats the tile under it; on phones a warm spot roams the tile in view
  var shop = $('#shop'), shopOn = false, tiles = $$('.bento .tile');
  watch(shop, function (v) { shopOn = v; shop.classList.toggle('on', v || still()); chip.kick(); });
  tiles.forEach(function (t) {
    t.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); t.style.setProperty('--ho', '1'); });
    t.addEventListener('pointerleave', function () { if (fine.matches) t.style.setProperty('--ho', '0'); });
  });
  var chip = (function () {
    var raf = 0, t0 = performance.now();
    function frame(t) {
      raf = 0; if (fine.matches || still() || !shopOn) { if (!fine.matches) tiles.forEach(function (x) { x.style.setProperty('--ho', still() ? '0' : x.style.getPropertyValue('--ho')); }); return; }
      var T = (t - t0) / 1000, vh = innerHeight;
      tiles.forEach(function (x, i) {
        var r = x.getBoundingClientRect(), mid = r.top + r.height / 2, f = 1 - clamp(Math.abs(mid - vh * .5) / (vh * .45), 0, 1);
        x.style.setProperty('--ho', f.toFixed(3));
        x.style.setProperty('--mx', (r.width * (.5 + .38 * Math.sin(T * .9 + i))).toFixed(1) + 'px');
        x.style.setProperty('--my', (r.height * (.5 + .34 * Math.cos(T * .7 + i * 1.7))).toFixed(1) + 'px');
      });
      raf = requestAnimationFrame(frame);
    }
    return { kick: function () { if (!raf) raf = requestAnimationFrame(frame); } };
  })();

  // ---------------------------------------------------------------- reviews row
  var revs = $('[data-revs]'), rrow = $('[data-rrow]'), rvs = $$('.rv', rrow);
  rrow.parentNode.addEventListener('scroll', function () { tick(); }, { passive: true });   // phones swipe the row; each review still warms in the middle

  // ---------------------------------------------------------------- write to the lab: keys, device, the message types itself
  var keys = $$('[data-key]'), devs = $$('[data-dev]'), msgEl = $('[data-msg]'), steps = $$('[data-step]'), shown = '', typing = 0, seen = false;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  keys.forEach(function (k) { k.addEventListener('click', function () { k.setAttribute('aria-pressed', k.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); lightStep(0); write(); }); });
  devs.forEach(function (b) { b.addEventListener('click', function () { devs.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lightStep(1); write(); }); });
  $$('[data-send-wa],[data-send-mail]').forEach(function (a) { a.addEventListener('pointerenter', function () { lightStep(2); }); a.addEventListener('focus', function () { lightStep(2); }); a.addEventListener('click', function () { lightStep(2); }); });
  function list(items, l) {
    if (items.length < 2) return items.join('');
    return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }
  function compose() {
    var l = he(), picked = keys.filter(function (k) { return k.getAttribute('aria-pressed') === 'true'; }).map(function (k) { return k.dataset[l ? 'he' : 'en']; });
    var d = devs.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0].dataset[l ? 'he' : 'en'];
    if (l) return 'שלום, יש לי ' + d + ' ש' + (picked.length ? list(picked, true) : 'צריך בדיקה') + '. אפשר להביא אותו למעבדה?';
    return 'Hello, I have a ' + d + ' that ' + (picked.length ? list(picked, false) : 'needs checking') + '. Can I bring it to the lab?';
  }
  function write(instant) {
    var target = compose(), l = he(), d = devs.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0].dataset[l ? 'he' : 'en'];
    $('[data-send-wa]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    $('[data-send-mail]').href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(l ? 'בדיקה במעבדה: ' + d : 'Lab check: ' + d) + '&body=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !seen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 16);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-lt]'), function (v) { if (v && !seen) { seen = true; if (!still()) { shown = ''; msgEl.textContent = ''; write(); } } }, { threshold: .35 });

  // ---------------------------------------------------------------- footer: the real logo redrawn from its own pixels, heating from the die outwards
  var foot = $('[data-foot]'), fcv = $('[data-fcv]'), fsrc = $('[data-fsrc]'), fname = $('[data-fname]');
  var IRON = [[42, 13, 85], [106, 17, 150], [194, 48, 122], [240, 87, 44], [255, 165, 20], [255, 224, 122], [255, 246, 220]];
  function iron(t) { t = clamp(t, 0, 1) * (IRON.length - 1); var i = Math.min(IRON.length - 2, Math.floor(t)), u = t - i, a = IRON[i], b = IRON[i + 1]; return 'rgb(' + Math.round(lerp(a[0], b[0], u)) + ',' + Math.round(lerp(a[1], b[1], u)) + ',' + Math.round(lerp(a[2], b[2], u)) + ')'; }
  var logoFx = (function () {
    var c = fcv.getContext('2d'), P = [], S = 0, raf = 0, vis = false, mx = -999, my = -999, t0 = performance.now(), ok = false;
    function sample() {
      var N = 96, sc = document.createElement('canvas'); sc.width = sc.height = N; var sx = sc.getContext('2d');
      try { sx.drawImage(fsrc, 0, 0, N, N); var d = sx.getImageData(0, 0, N, N).data; P = [];
        for (var y = 0; y < N; y += 2) for (var x = 0; x < N; x += 2) if (d[(y * N + x) * 4 + 3] > 110) P.push({ x: x / N, y: y / N, d: Math.hypot(x / N - .5, y / N - .5) / .7, j: Math.random() * 6.28 });
        ok = P.length > 20;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); S = fcv.clientWidth; fcv.width = fcv.height = Math.round(S * dpr); c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function draw(t) {
      raf = 0; c.clearRect(0, 0, S, S);
      if (!ok) { c.drawImage(fsrc, 0, 0, S, S); return; }
      var T = (t - t0) / 1000, calm = still(), cell = S / 48, ph = (T * .42) % 1.4;
      for (var i = 0; i < P.length; i++) {
        var p = P[i], px = p.x * S, py = p.y * S, v;
        if (calm) v = .95 - p.d * .75;
        else {
          v = .16 + .1 * Math.sin(T * 1.6 + p.j) + Math.max(0, 1 - Math.abs(p.d - ph) / .14) * .8 + Math.max(0, .5 - p.d) * .5;
          var dd = Math.hypot(px - mx, py - my); if (dd < 46) v += (1 - dd / 46) * .7;
        }
        c.fillStyle = iron(v); c.fillRect(px, py, cell * .9, cell * .9);
      }
      if (!calm && vis) raf = requestAnimationFrame(draw);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(draw); }
    fcv.addEventListener('pointermove', function (e) { var r = fcv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    fcv.addEventListener('pointerleave', function () { mx = my = -999; });
    fcv.addEventListener('pointerdown', function (e) { var r = fcv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; setTimeout(function () { mx = my = -999; }, 700); });
    function start() { size(); sample(); kick(); }
    if (fsrc.complete && fsrc.naturalWidth) setTimeout(start, 0); else fsrc.addEventListener('load', start, { once: true });
    watch(foot, function (v) { vis = v; if (v) { fname.classList.add('in'); kick(); } });
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var dock = $('[data-dock]'), ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // hero settles back as the bench rides over it
    if (!calm) {
      var hp = prog(hold);
      hero.style.transform = 'scale(' + (1 - hp * .07).toFixed(4) + ')';
      media.style.filter = 'brightness(' + (1 - hp * .55).toFixed(3) + ')';
      media.style.transform = 'translateY(' + (hp * 40).toFixed(1) + 'px)';
    } else { hero.style.transform = ''; media.style.filter = ''; media.style.transform = ''; }
    if (dock) { var hr = hero.getBoundingClientRect(); dock.style.setProperty('--dy', (hr.bottom > vh * .55 && scrollY < vh * .5) ? '160%' : '0'); }
    // the bench rail
    if (!calm) {
      var lp = prog(lab), view = innerWidth, dist = Math.max(0, rail.scrollWidth - view);
      rail.style.transform = 'translate3d(' + ((rtl() ? 1 : -1) * dist * smooth(lp * 1.06)).toFixed(1) + 'px,0,0)';
      labProg.style.setProperty('--p', lp.toFixed(3));
      var mid = view / 2, best = 0, bd = 1e9;
      fcs.forEach(function (c, i) {
        var r = c.getBoundingClientRect(), cx = r.left + r.width / 2, d = cx - mid;
        if (Math.abs(d) < bd) { bd = Math.abs(d); best = i; }
        if (!fine.matches) { var pic = c.firstElementChild; pic.style.setProperty('--ry', clamp(d / view * -14, -9, 9).toFixed(2) + 'deg'); pic.style.setProperty('--mx', clamp(50 - d / view * 80, 0, 100).toFixed(1) + '%'); }
      });
      setActive(clamp(Math.round(smooth(lp * 1.06) * (fcs.length - 1)), 0, fcs.length - 1));
    } else { rail.style.transform = ''; if (active < 0) setActive(0); }
    // the thermal camera
    if (!calm) {
      var p = prog(scan), open = smooth(p / .1);
      vfin.style.setProperty('--ci', ((1 - open) * 16).toFixed(2) + '%');
      var heat = smooth((p - .28) / .17), cool = smooth((p - .8) / .12), nz = smooth((p - .56) / .1) * (1 - smooth((p - .8) / .07));
      applyScan({ h: heat * 160, c: cool, n: nz, l: smooth((p - .38) / .08), r: smooth((p - .36) / .06) * (1 - cool), m: lerp(lerp(.12, .86, heat), .2, cool) });
      setStage(p < .3 ? 0 : p < .55 ? 1 : p < .79 ? 2 : 3);
    }
    // reviews drift sideways with the scroll; each warms as it crosses the middle
    var rr = revs.getBoundingClientRect();
    if (!calm && rr.bottom > 0 && rr.top < vh) {
      var pr = clamp((vh - rr.top) / (rr.height + vh), 0, 1), rd = Math.max(0, rrow.scrollWidth - innerWidth);
      rrow.style.transform = phone() ? '' : 'translate3d(' + ((rtl() ? 1 : -1) * rd * smooth((pr - .12) / .76)).toFixed(1) + 'px,0,0)';
      rvs.forEach(function (v) { var b = v.getBoundingClientRect(), d = Math.abs(b.left + b.width / 2 - innerWidth / 2) / (innerWidth * .5); v.style.setProperty('--h', (1 - clamp(d, 0, 1)).toFixed(3)); });
    } else if (calm) { rrow.style.transform = ''; rvs.forEach(function (v) { v.style.setProperty('--h', '.35'); }); }
  }

  function layout() { root.style.setProperty('--cb', $('.concept').offsetHeight + 'px'); lens.place(); logoFx.size(); if (still()) setStage(stage, true); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); setStage(0, true); layout();
  if (!still()) applyScan(PRE[0]);
  if (still()) shop.classList.add('on');
  addEventListener('load', function () { lens.place(); tick(); });
})();
