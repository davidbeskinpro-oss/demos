(function () {
  var root = document.documentElement, WA = '972547336733';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var YEAR = +new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', year: 'numeric' }).format(new Date()) || 2026;
  var TITLE = { he: 'עידן – שירותי ביטוח ופיננסים · זכריה הולנדר M.Sc · שדרות המגינים 44, חיפה', en: 'Idan Insurance & Finance Services · Zecharia Hollander M.Sc · 44 Sderot HaMeginim, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור עידן – שירותי ביטוח ופיננסים, הולנדר זכריה M.Sc · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Idan Insurance & Finance Services, Zecharia Hollander M.Sc · This is not the business’s official website' };
  $$('[data-year],[data-open-year]').forEach(function (e) { e.textContent = YEAR; });

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'עידן – שירותי ביטוח ופיננסים', 'Idan Insurance & Finance Services');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-visit]', 'יצירת קשר', 'Contact');
    aria('[data-t-cover]', 'איזה ביטוח', 'Which cover');
    aria('[data-t-need]', 'מה צריך', 'What you need');
    aria('[data-t-names]', 'ביקורות', 'Reviews');
    aria('[data-t-call],[data-t-callnav]', 'התקשרו למשרד, 04-8516929', 'Call the office, 04-8516929');
    aria('[data-t-wa]', 'וואטסאפ למשרד', 'WhatsApp the office');
    aria('[data-eprev]', 'הקודם', 'Previous');
    aria('[data-enext]', 'הבא', 'Next');
    $$('[data-decode]').forEach(function (d) { d.textContent = d.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('idn-lang', l); } catch (e) {}
    texts(l); hours(); splitQuotes(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('idn-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    resetInline(); layout(); write(true); revs.show(revs.cur, true); hero.classList.add('ready');
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8, 16], 1: [8, 16], 2: [8, 16], 3: [8, 16], 4: [8, 17], 5: [8, 12], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var shortHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'שבת'], shortEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
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
    var f = $('[data-fab]'); if (f) f.classList.toggle('open', open);
  }
  // consecutive days with the same hours share a row; the week starts on Sunday
  function hours() {
    var l = he(), names = l ? shortHe : shortEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? (l ? 'יום ' + dayHe[r[0]] : dayEn[r[0]]) : names[r[0]] + '–' + names[r[1]];
      if (l && r[0] === 6 && r[0] === r[1]) name = 'שבת';
      var val = !t ? (l ? 'סגור' : 'Closed') : (t[0] === 0 && t[1] === 24) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 10 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // ---------------------------------------------------------------- labels decode out of scrambled glyphs
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHKLMNPRSTUVWXYZ' };
  function decode(el) {
    var l = root.lang, txt = el.dataset[l]; clearInterval(el._d);
    if (still()) { el.textContent = txt; return; }
    var t = 0, n = txt.length, pool = GL[l];
    el._d = setInterval(function () {
      t++; var out = '';
      for (var i = 0; i < n; i++) out += (i < t / 2 || txt[i] === ' ' || /[,.\d]/.test(txt[i])) ? txt[i] : pool[Math.floor(Math.random() * pool.length)];
      el.textContent = out; if (t / 2 >= n) { clearInterval(el._d); el.textContent = txt; }
    }, 34);
  }

  // ---------------------------------------------------------------- the logo's green word gains depth: copies of the real pixels stacked under it
  var xwords = $$('[data-xword]').map(function (w) {
    var src = $('img', w), N = 12;
    for (var i = 0; i < N; i++) { var c = src.cloneNode(); c.className = 'dp'; c.alt = ''; w.insertBefore(c, src); }
    var layers = $$('img', w);
    return { el: w, set: function (dx, dy) { layers.forEach(function (im, k) { var d = layers.length - 1 - k; im.style.transform = d ? 'translate(' + (dx * d).toFixed(2) + 'px,' + (dy * d).toFixed(2) + 'px)' : ''; }); } };
  });
  xwords.forEach(function (x) { x.set(1.1, 1.1); });   // the logo's own depth falls down and to the right

  var hero = $('[data-hero]'), nav = $('[data-nav]'), people = $('[data-people]');

  // ---------------------------------------------------------------- opening
  (function () {
    var o = $('[data-open]'); if (!root.classList.contains('opening')) return;
    try { sessionStorage.setItem('idn-open', '1'); } catch (e) {}
    var x = xwords[0], yel = $('[data-open-year]'), t0 = performance.now(), done = false;
    function end() { if (done) return; done = true; o.classList.add('go'); setTimeout(function () { root.classList.remove('opening'); }, 950); }
    o.addEventListener('click', end);
    requestAnimationFrame(function () { o.classList.add('run'); });
    (function st(t) {
      var p = smooth((t - t0) / 1100);
      x.set(1.4 * p, 1.4 * p); yel.textContent = Math.round(lerp(1983, YEAR, p));
      if (p < 1 && !done) requestAnimationFrame(st);
    })(t0);
    setTimeout(end, 1350);
  })();

  // ---------------------------------------------------------------- the era dial: one tick a year, 1983 to today, filled once as the page opens
  var dial = (function () {
    var g = $('[data-dial-ticks]'), arc = $('[data-dial-arc]'), hy = $('[data-hyear]'), NS = 'http://www.w3.org/2000/svg';
    var Y0 = 1983, span = YEAR - Y0, A0 = -150, A1 = 150;     // a 300° sweep, open at the bottom where the year sits
    var ang = function (y) { return A0 + (y - Y0) / span * (A1 - A0); };
    var pt = function (a, r) { var q = (a - 90) * Math.PI / 180; return [Math.cos(q) * r, Math.sin(q) * r]; };
    var html = '';
    for (var y = Y0; y <= YEAR; y++) {
      var a = ang(y), big = (y % 5 === 0) || y === Y0 || y === YEAR, p1 = pt(a, big ? 252 : 262), p2 = pt(a, 280);
      html += '<line class="tk' + (big ? ' big' : '') + (y === YEAR ? ' now' : '') + '" x1="' + p1[0].toFixed(1) + '" y1="' + p1[1].toFixed(1) + '" x2="' + p2[0].toFixed(1) + '" y2="' + p2[1].toFixed(1) + '"/>';
      if (y === Y0 || y === YEAR || y % 10 === 0) { var lp = pt(a, 226); html += '<text class="' + (y === YEAR ? 'now' : '') + '" x="' + lp[0].toFixed(1) + '" y="' + lp[1].toFixed(1) + '">' + y + '</text>'; }
    }
    g.innerHTML = html;
    function to(yf) {   // yf: a fractional year
      var a = ang(clamp(yf, Y0, YEAR)), s = pt(A0, 282), e = pt(a, 282), large = (a - A0) > 180 ? 1 : 0;
      arc.setAttribute('d', 'M' + s[0].toFixed(1) + ' ' + s[1].toFixed(1) + ' A282 282 0 ' + large + ' 1 ' + e[0].toFixed(1) + ' ' + e[1].toFixed(1));
      hy.textContent = Math.round(clamp(yf, Y0, YEAR));
    }
    var started = 0;
    function play() {
      if (still()) { to(YEAR); return; }
      var t0 = performance.now();
      (function st(t) { var p = smooth((t - t0) / 1800); to(lerp(Y0, YEAR, p)); if (p < 1) requestAnimationFrame(st); })(t0);
    }
    to(still() ? YEAR : Y0);
    return { play: function () { if (!started) { started = 1; setTimeout(play, 350); } }, to: to };
  })();

  // ---------------------------------------------------------------- hero: his photo leans toward the hand, the light moves over it; the city drifts in depth
  var hv = $('[data-hvis]'), tilt = $('[data-tilt]'), plate = $('[data-plate]'), city = $('[data-hcity]'), dialEl = $('[data-dial]');
  var ptr = { x: .5, y: .5, on: false }, heroVis = true, hraf = 0, cur = { x: .5, y: .5 };
  hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; ptr.x = e.clientX / innerWidth; ptr.y = e.clientY / innerHeight; ptr.on = true; kickHero(); });
  hero.addEventListener('pointerleave', function () { ptr.on = false; });
  watch(hero, function (v) { heroVis = v && people.getBoundingClientRect().top > -4; kickHero(); });
  function heroFrame(t) {
    hraf = 0; if (still()) return;
    var tx = ptr.x, ty = ptr.y;
    if (!ptr.on || !fine.matches) { tx = .5 + Math.sin(t / 2600) * .28; ty = .45 + Math.cos(t / 3300) * .18; }   // on phones the light and lean move by themselves
    cur.x = lerp(cur.x, tx, .06); cur.y = lerp(cur.y, ty, .06);
    var dx = cur.x - .5, dy = cur.y - .5;
    tilt.style.setProperty('--ty', (dx * 14).toFixed(2) + 'deg'); tilt.style.setProperty('--tx', (-dy * 10).toFixed(2) + 'deg');
    tilt.style.setProperty('--lx', (cur.x * 100).toFixed(1) + '%'); tilt.style.setProperty('--ly', (cur.y * 100).toFixed(1) + '%');
    tilt.style.setProperty('--px', (-dx * 14).toFixed(1) + 'px'); tilt.style.setProperty('--py', (-dy * 10).toFixed(1) + 'px');
    plate.style.setProperty('--py2', (dy * 22).toFixed(1) + 'px');
    city.style.setProperty('--cx', (-dx * 30).toFixed(1) + 'px'); city.style.setProperty('--cy', (-dy * 12).toFixed(1) + 'px');
    dialEl.style.transform = 'rotate(' + (dx * 8).toFixed(2) + 'deg)';
    if (heroVis) hraf = requestAnimationFrame(heroFrame);
  }
  function kickHero() { if (!hraf && heroVis && !still()) hraf = requestAnimationFrame(heroFrame); }

  // ticker: two copies so the loop is seamless
  var tk = $('[data-ticker]'); tk.innerHTML += tk.innerHTML;

  // ---------------------------------------------------------------- Idan's card: the word's depth follows the hand (by itself on phones)
  var pI = $('.p-i'), xI = xwords[1];
  pI.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse' || still()) return; var r = pI.getBoundingClientRect(); xI.set(((r.left + r.width / 2) - e.clientX) / r.width * 3.2, ((r.top + r.height / 2) - e.clientY) / r.height * 3.2); });
  pI.addEventListener('pointerleave', function () { xI.set(1.1, 1.1); });
  $$('[data-spot]').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- eras rail
  var eras = $('[data-eras]'), epin = $('[data-epin]'), eview = $('[data-eview]'), rail = $('[data-erail]'), cards = $$('[data-era]', rail), last = $('[data-elast]'), eline = $('[data-eline]');
  var ecur = $('[data-ecur]'), prevB = $('[data-eprev]'), nextB = $('[data-enext]'); $('[data-etot]').textContent = cards.length;
  var full = document.createElement('div'); full.className = 'e-full'; full.setAttribute('aria-hidden', 'true');
  full.innerHTML = '<div class="box" style="position:absolute;overflow:hidden"><img src="img/haifa-bay.jpg" alt=""><i class="scrim"></i><i class="fade"></i></div>'; epin.appendChild(full);
  var fbox = $('.box', full), fscrim = $('.scrim', full), ffade = $('.fade', full);
  var EM = { shift: 0, expand: 0, active: -1 }, officeEl = $('[data-office]');
  function eLayout() {
    if (still()) { eras.style.height = ''; rail.style.transform = ''; full.style.visibility = 'hidden'; epin.style.visibility = ''; officeEl.classList.add('lit'); return; }
    rail.style.transform = '';
    EM.shift = Math.max(0, rail.scrollWidth - eview.clientWidth);
    EM.expand = innerHeight * .9;
    eras.style.height = (innerHeight + EM.shift + EM.expand) + 'px';
  }
  function setActive(i) {
    if (i === EM.active) return; EM.active = i;
    cards.forEach(function (c, k) { c.classList.toggle('on', k === i); });
    ecur.textContent = i + 1; prevB.disabled = i <= 0; nextB.disabled = i >= cards.length - 1;
    var h = $('h3', cards[i]); if (h) decode(h);
  }
  function eUpdate() {
    var vw = eview.clientWidth;
    if (still()) {   // a normal row: the arrows and a swipe step through it
      var mid = rail.getBoundingClientRect().left + vw / 2, best = 0, bd = 1e9;
      cards.forEach(function (c, k) { var r = c.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = k; } });
      setActive(best); return;
    }
    var r = eras.getBoundingClientRect(), s = clamp(-r.top, 0, EM.shift + EM.expand);
    var x = Math.min(s, EM.shift), e = EM.shift + EM.expand > 0 ? clamp((s - EM.shift) / EM.expand, 0, 1) : 0;
    rail.style.transform = 'translate3d(' + (rtl() ? x : -x).toFixed(1) + 'px,0,0)';
    eline.parentNode.style.setProperty('--p', (EM.shift ? x / EM.shift : 1).toFixed(4));
    var vr = eview.getBoundingClientRect(), vc = vr.left + vr.width / 2, best2 = 0, bd2 = 1e9;
    cards.forEach(function (c, k) {
      var cr = c.getBoundingClientRect(), cc = cr.left + cr.width / 2, d = cc - vc;
      if (Math.abs(d) < bd2) { bd2 = Math.abs(d); best2 = k; }
      c.style.setProperty('--kx', (-d * .05).toFixed(1) + 'px');
    });
    setActive(e > 0 ? cards.length - 1 : best2);
    // the last picture opens to the whole screen
    // once the picture fills the screen the office lies under it, identical: hand over to it
    var done = e >= .999; epin.style.visibility = done ? 'hidden' : ''; officeEl.classList.toggle('lit', done);
    if (e <= 0 || done) { full.style.visibility = 'hidden'; return; }
    var pr = epin.getBoundingClientRect(), fr = $('figure', last).getBoundingClientRect(), k2 = smooth(e / .8);
    full.style.visibility = 'visible';
    fbox.style.left = lerp(fr.left - pr.left, 0, k2).toFixed(1) + 'px'; fbox.style.top = lerp(fr.top - pr.top, 0, k2).toFixed(1) + 'px';
    fbox.style.width = lerp(fr.width, pr.width, k2).toFixed(1) + 'px'; fbox.style.height = lerp(fr.height, pr.height, k2).toFixed(1) + 'px';
    fbox.style.borderRadius = lerp(26, 0, k2).toFixed(1) + 'px';
    var sm = smooth((e - .45) / .5); fscrim.style.opacity = (sm * .72).toFixed(3); ffade.style.opacity = sm.toFixed(3);
  }
  function eGo(dir) {
    var i = clamp(EM.active + dir, 0, cards.length - 1);
    if (still()) { var c = cards[i]; rail.scrollTo({ left: c.offsetLeft - (rail.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' }); return; }
    var step = cards.length > 1 ? EM.shift / (cards.length - 1) : 0, top = eras.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + step * i + 2, behavior: 'smooth' });
  }
  prevB.addEventListener('click', function () { eGo(-1); }); nextB.addEventListener('click', function () { eGo(1); });
  rail.addEventListener('scroll', function () { if (still()) eUpdate(); }, { passive: true });

  // ---------------------------------------------------------------- the office printer
  var printer = $('[data-printer]'), paper = $('[data-paper]'), stamp = $('[data-stamp]'), led = $('[data-led]');
  // odometers (only the real figures from their site)
  $$('[data-odo]').forEach(function (o) {
    var v = o.dataset.odo, sep = o.dataset.sep, s = sep ? v.replace(/\B(?=(\d{3})+(?!\d))/g, sep) : v;
    o.innerHTML = s.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="sep" aria-hidden="true">' + ch + '</span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 120) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .4 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- how: steps light up; the composer
  var steps = $$('[data-step]');
  if (io) steps.forEach(function (s) { new IntersectionObserver(function (es) { if (es[0].isIntersecting) s.classList.add('on'); }, { rootMargin: '-35% 0px -35% 0px' }).observe(s); });
  var cdial = $('[data-cdial]'), covers = $$('[data-cover]'), needs = $$('[data-need]'), cdarc = $('[data-cdarc]'), pick = $('[data-cdpick]'), needBox = $('[data-t-need]');
  function dialLayout() {
    var R = cdial.clientWidth * .39;
    covers.forEach(function (b, i) { b.style.setProperty('--a', (i * 360 / covers.length * (rtl() ? -1 : 1)) + 'deg'); b.style.setProperty('--R', R + 'px'); });
    dialArc();
  }
  function selIndex(list) { for (var i = 0; i < list.length; i++) if (list[i].getAttribute('aria-checked') === 'true') return i; return 0; }
  function dialArc() {
    var i = selIndex(covers), a = i * 360 / covers.length, r = 150, sgn = rtl() ? -1 : 1;
    var q = function (d) { var t = (d * sgn - 90) * Math.PI / 180; return [Math.cos(t) * r, Math.sin(t) * r]; };
    var s = q(-14), e = q(a + 14), large = a + 28 > 180 ? 1 : 0;
    cdarc.setAttribute('d', 'M' + s[0].toFixed(1) + ' ' + s[1].toFixed(1) + ' A' + r + ' ' + r + ' 0 ' + large + ' ' + (sgn > 0 ? 1 : 0) + ' ' + e[0].toFixed(1) + ' ' + e[1].toFixed(1));
    var b = covers[i]; pick.innerHTML = '<span lang="he">' + $('[lang="he"]', b).textContent + '</span><span lang="en">' + $('[lang="en"]', b).textContent + '</span>';
  }
  var DEF = { 'ביטוח רכב': 'ביטוח הרכב', 'ביטוח דירה': 'ביטוח הדירה', 'ביטוח משכנתא': 'ביטוח המשכנתא', 'ביטוח בריאות': 'ביטוח הבריאות', 'ביטוח חיים': 'ביטוח החיים', 'ביטוח נסיעות לחו״ל': 'ביטוח הנסיעות לחו״ל', 'ביטוח עסק': 'ביטוח העסק', 'קופת גמל או פנסיה': 'קופת הגמל או הפנסיה' };
  function compose() {
    var c = covers[selIndex(covers)], n = selIndex(needs);
    if (he()) {
      var x = c.dataset.he, d = DEF[x] || x;
      return ['שלום, אשמח לקבל הצעה ל' + x + '.', 'שלום, אשמח לחדש את ' + d + '.', 'שלום, אשמח שתבדקו את ' + d + ' שלי.', 'שלום, אשמח לעזרה בפתיחת תביעה ב' + d + '.'][n];
    }
    var y = c.dataset.en;
    return ['Hello, I’d like a quote for ' + y + '.', 'Hello, I’d like to renew my ' + y + '.', 'Hello, could you review my ' + y + '?', 'Hello, I need help opening a claim on my ' + y + '.'][n];
  }
  var msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur0 = shown, t0 = performance.now(), del = cur0.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 15);
      shown = n < del ? cur0.slice(0, cur0.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  function radio(list, b) { list.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); }
  covers.forEach(function (b) { b.addEventListener('click', function () { radio(covers, b); dialArc(); write(); }); });
  function needPos() { var k = selIndex(needs); needBox.style.setProperty('--k', k); needBox.style.setProperty('--kc', k % 2); needBox.style.setProperty('--kr', Math.floor(k / 2)); }
  needs.forEach(function (b) { b.addEventListener('click', function () { radio(needs, b); needPos(); write(); }); });
  // arrow keys turn the dial
  [covers, needs].forEach(function (list) { list.forEach(function (b, i) { b.addEventListener('keydown', function (e) {
    var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0; if (!d) return;
    e.preventDefault(); if (rtl() && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) d = -d;
    var nb = list[(i + d + list.length) % list.length]; nb.focus(); nb.click();
  }); }); });
  watch($('.chat'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- reviews: one at a time, the words fill in
  function splitQuotes() {
    $$('[data-rq] p').forEach(function (p) {
      if (!p._t) p._t = p.textContent;
      var i = 0;
      p.innerHTML = p._t.split(' ').map(function (w) { return '<span class="w" style="white-space:nowrap">' + w.split('').map(function (c) { return '<span class="lt" data-i="' + (i++) + '">' + c + '</span>'; }).join('') + '</span>'; }).join(' ');
      p._n = i;
    });
  }
  var revs = (function () {
    var qs = $$('[data-rq]'), nb = $$('[data-name]'), cur = 0, raf = 0, vis = false, cycled = false, auto = true, wait = 0;
    function letters(q) { var p = $$('p', q).filter(function (x) { return x.offsetParent; })[0]; return p ? $$('.lt', p) : []; }
    function show(i, instant) {
      cur = i; api.cur = i; cancelAnimationFrame(raf); clearTimeout(wait);
      qs.forEach(function (q, k) { q.classList.toggle('on', k === i); });
      nb.forEach(function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); b.style.setProperty('--rp', k === i ? (still() || instant ? 1 : 0) : 0); });
      var L = letters(qs[i]);
      if (still() || instant) { L.forEach(function (l) { l.classList.add('f'); }); return; }
      L.forEach(function (l) { l.classList.remove('f'); });
      var t0 = performance.now(), dur = Math.max(1800, L.length * 24);
      (function st(t) {
        var p = clamp((t - t0) / dur, 0, 1), n = Math.floor(p * L.length);
        for (var k = 0; k < n; k++) if (!L[k].classList.contains('f')) L[k].classList.add('f');
        nb[i].style.setProperty('--rp', p.toFixed(3));
        if (p < 1) raf = requestAnimationFrame(st);
        else if (auto && vis) wait = setTimeout(function () { var nx = (cur + 1) % qs.length; if (nx === 0) { cycled = true; auto = false; } show(nx, nx === 0); }, 2600);
      })(t0);
    }
    nb.forEach(function (b, k) { b.addEventListener('click', function () { auto = false; show(k); }); });
    var api = { cur: 0, show: show };
    watch($('[data-rstage]'), function (v) { vis = v; if (v && !api.started) { api.started = true; show(0); } }, { threshold: .35 });
    return api;
  })();

  // ---------------------------------------------------------------- the one scroll loop
  var fab = $('[data-fab]'), foot = $('[data-foot]'), frule = $('[data-frule]'), fplate = $('[data-fplate]');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function resetInline() {
    hero.style.transform = ''; hero.style.filter = ''; hero.style.top = ''; hero.style.visibility = '';
    paper.style.removeProperty('--feed'); stamp.classList.toggle('on', still());
    fplate.style.removeProperty('--fy'); fplate.style.removeProperty('--fra'); frule.style.removeProperty('--fr');
    tilt.style.cssText = ''; dialEl.style.transform = '';
    cards.forEach(function (c) { c.style.removeProperty('--kx'); });
    kickHero();
  }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // the people sheet lands over the hero, which settles back
    if (!calm) {
      hero.style.top = Math.min(0, vh - hero.offsetHeight) + 'px';
      var pt = people.getBoundingClientRect().top, k = clamp(1 - pt / vh, 0, 1);
      hero.style.transform = k ? 'scale(' + (1 - k * .06).toFixed(4) + ')' : '';
      hero.style.filter = k ? 'brightness(' + (1 - k * .45).toFixed(3) + ')' : '';
      var covered = pt < -4; hero.style.visibility = covered ? 'hidden' : '';
      if (heroVis === covered) { heroVis = !covered; kickHero(); }
    }
    eUpdate();
    // the policy is fed out of the printer, then stamped
    if (!calm) {
      var otop = officeEl.getBoundingClientRect().top, f = officeEl.classList.contains('lit') ? smooth((-otop - vh * .04) / (vh * .55)) : 0;
      paper.style.setProperty('--feed', ((1 - f) * 100).toFixed(2) + '%');
      led.classList.toggle('on', f > 0 && f < 1);
      stamp.classList.toggle('on', f >= .985);
    } else { stamp.classList.add('on'); }
    // footer: the green rule draws across, the logo plate rises
    var fr = foot.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / Math.min(fr.height, vh * .8));
    frule.style.setProperty('--fr', fp.toFixed(3));
    fplate.style.setProperty('--fy', ((1 - fp) * 70).toFixed(1) + 'px'); fplate.style.setProperty('--fra', ((1 - fp) * (rtl() ? 5 : -5)).toFixed(2) + 'deg');
    // phone dial: away while the hero's own buttons are on screen
    var er = eras.getBoundingClientRect(); fab.classList.toggle('hide', scrollY < vh * .55 || (!calm && er.top <= 1 && er.bottom >= vh - 1));
  }

  function layout() { eLayout(); dialLayout(); needPos(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); splitQuotes(); write(true); layout();
  if (still()) stamp.classList.add('on');
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); dial.play(); kickHero(); decode($('[data-decode]', hero)); }); };
  var delay = root.classList.contains('opening') ? 1100 : 0;
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(go, delay); });
  setTimeout(go, 1300 + delay);
  addEventListener('load', layout);
})();
