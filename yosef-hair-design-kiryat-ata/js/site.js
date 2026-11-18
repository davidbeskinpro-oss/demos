(function () {
  var root = document.documentElement, WA = '972547627088';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 761; };
  var TITLE = { he: 'יוסף עיצוב שיער · מספרה · דוכיפת 3, קריית אתא', en: 'Yosef Hair Design · Barbershop · 3 Duchifat St, Kiryat Ata' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור יוסף עיצוב שיער · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Yosef Hair Design · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!el) return; if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';
  var GLY = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHKMNRSTXZ' };

  // ---------------------------------------------------------------- glyph decode: a label settles out of scrambled letters
  function decode(el, txt) {
    clearInterval(el._dt);
    if (still()) { el.textContent = txt; return; }
    var set = /[֐-׿]/.test(txt) ? GLY.he : GLY.en, n = 0, len = txt.length;
    el._dt = setInterval(function () {
      n += Math.max(1, len / 14);
      var out = '';
      for (var i = 0; i < len; i++) out += i < n || txt[i] === ' ' ? txt[i] : set[Math.floor(Math.random() * set.length)];
      el.textContent = out;
      if (n >= len) { clearInterval(el._dt); el.textContent = txt; }
    }, 38);
  }

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'יוסף עיצוב שיער', 'Yosef Hair Design');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-wa]', 'וואטסאפ ליוסף', 'WhatsApp Yosef');
    aria('[data-t-call]', 'התקשרו ליוסף, 054-762-7088', 'Call Yosef, 054-762-7088');
    aria('[data-t-who]', 'מי מתיישב', 'Who’s sitting');
    aria('[data-t-what]', 'מה עושים', 'What for');
    aria('[data-t-when]', 'מתי', 'When');
    aria('[data-motion-toggle]', 'תנועה', 'Motion');
    aria('[data-set-lang]', 'English', 'עברית');
    var m = $('[data-t-map]'); if (m) m.title = l === 'he' ? 'מפה: דוכיפת 3, קריית אתא' : 'Map: 3 Duchifat St, Kiryat Ata';
    $$('.callouts li').forEach(function (c) { if (c.classList.contains('show')) $('b', c).textContent = c.dataset[l]; });
    var ch = chaps[activeChap]; if (ch && ctag) ctag.textContent = ch.dataset[l];
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('yhd-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('yhd-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $$('.callouts li').forEach(function (c) { c.classList.add('show'); $('b', c).textContent = c.dataset[he() ? 'he' : 'en']; });
    hero.classList.add('ready'); spotsOn(true);
    layout(); ring.kick(); clips.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed / not published.
  // Google lists no opening hours for this business yet, so every day is null and the page asks visitors to check on WhatsApp.
  var H = { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null };
  var PUBLISHED = Object.keys(H).some(function (k) { return H[k]; });
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (!PUBLISHED) txt = l ? 'בתיאום מראש בוואטסאפ' : 'By arrangement on WhatsApp';
    else if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · כל היום' : 'Open now · all day'; }
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
    var tb = $('[data-hours]'); tb.hidden = !PUBLISHED; $('[data-hnote]').hidden = PUBLISHED;
    if (PUBLISHED) {
      var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
      while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
      tb.innerHTML = rows.map(function (r) {
        var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
        var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
        var val = !t ? (l ? 'סגור' : 'Closed') : t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
        return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
      }).join('');
    }
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', i * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // headline: letters rise out of a seam
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), hphoto = $('[data-hphoto]');

  // ---------------------------------------------------------------- hero: the real track spots in the photo, switched on one by one
  var IW = 1138, IH = 1024, copyBox = { left: 0, right: 0, top: 9e9 };
  var SPOTS = [[205, 22, 170], [402, 246, 110], [428, 236, 110], [455, 214, 120], [483, 190, 120], [597, 118, 150], [642, 90, 150], [681, 62, 160], [720, 36, 160], [760, 12, 170]];
  var glowBox = $('[data-spots]'), glows = SPOTS.map(function (s, i) { var g = document.createElement('i'); g.style.setProperty('--dl', (i * .37).toFixed(2) + 's'); glowBox.appendChild(g); return g; });
  function coverMap() {
    var W = hero.clientWidth, Hh = hero.clientHeight, s0 = Math.max(W / IW, Hh / IH), dw = IW * s0, dh = IH * s0, px = phone() ? .38 : .5;
    var ox = (W - dw) * px, oy = (Hh - dh) * .4, k = 1.08;
    return function (x, y) { return [W / 2 + (ox + x * s0 - W / 2) * k, Hh / 2 + (oy + y * s0 - Hh / 2) * k, s0 * k]; };
  }
  function placeSpots() {
    var f = coverMap(), hb = hero.getBoundingClientRect(), cb = $('.h-copy > *:first-child').getBoundingClientRect(), cb2 = $('.h-copy').getBoundingClientRect();
    copyBox = { left: cb2.left - hb.left + (rtl() ? cb2.width - Math.max(cb.width, cb2.width * .6) : 0), right: rtl() ? cb2.right - hb.left : cb2.left - hb.left + Math.max(cb.width, cb2.width * .6), top: cb.top - hb.top };
    glows.forEach(function (g, i) { var p = f(SPOTS[i][0], SPOTS[i][1]); g.style.left = p[0] + 'px'; g.style.top = p[1] + 'px'; g.style.setProperty('--s', Math.round(SPOTS[i][2] * p[2] * 1.4) + 'px'); });
    $$('.callouts li').forEach(function (c) {
      var p = f(+c.dataset.x * IW, +c.dataset.y * IH), W = hero.clientWidth;
      c.style.left = p[0] + 'px'; c.style.top = p[1] + 'px';
      var flip = p[0] > W * .55; c.classList.toggle('flip', flip);
      c.style.transform = 'translate(' + (flip ? 'calc(-100% + 6px)' : '-6px') + ',-50%)';
      var cr = copyBox, lw = 230, x0 = flip ? p[0] - lw : p[0], x1 = flip ? p[0] : p[0] + lw;
      c.hidden = x0 < 12 || x1 > W - 12 || p[1] < 110 || (x1 > cr.left && x0 < cr.right && p[1] > cr.top - 30);
    });
  }
  function spotsOn(instant) { glows.forEach(function (g, i) { if (instant || still()) g.classList.add('on'); else setTimeout(function () { g.classList.add('on'); }, 120 + i * 95); }); }
  function callouts() {
    $$('.callouts li').forEach(function (c, i) {
      setTimeout(function () { c.classList.add('show'); decode($('b', c), c.dataset[he() ? 'he' : 'en']); }, still() ? 0 : 1500 + i * 420);
    });
  }
  // the room leans gently toward the hand; on phones it drifts by itself with the scroll
  hero.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType !== 'mouse') return;
    var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    hero.style.setProperty('--px', (-x * 22).toFixed(1) + 'px'); hero.style.setProperty('--py', (-y * 14).toFixed(1) + 'px');
    glowBox.style.transform = 'translate3d(' + (-x * 22).toFixed(1) + 'px,' + (-y * 14).toFixed(1) + 'px,0)';
  });

  // ---------------------------------------------------------------- hair clippings drifting in the spot light, cut like the strands of the logo's hair; they part under the hand
  var clips = (function () {
    var cv = $('[data-clippings]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = true, mx = -999, my = -999, last = 0;
    function make(top) { return { x: Math.random() * w, y: top ? -20 - Math.random() * h * .3 : Math.random() * h, vx: 0, vy: 0, len: 7 + Math.random() * 10, a: Math.random() * 6.28, va: (Math.random() - .5) * .02, sp: .12 + Math.random() * .3, ph: Math.random() * 6.28, al: .25 + Math.random() * .45, cv: .3 + Math.random() * .5 }; }
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 55 : 120; P = []; for (var i = 0; i < n; i++) P.push(make(false));
      draw(0);
    }
    function strand(p) {
      // a tapered crescent, like one white stroke in the logo's hair
      c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.globalAlpha = p.al;
      var L = p.len, b = L * p.cv;
      c.beginPath(); c.moveTo(-L / 2, 0); c.quadraticCurveTo(0, -b, L / 2, 0); c.quadraticCurveTo(0, -b + 1.6, -L / 2, 0); c.fill(); c.restore();
    }
    function draw(dt) {
      c.clearRect(0, 0, w, h); c.fillStyle = '#f3e6cc';
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        if (dt) {
          p.ph += dt * .8;
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 14000) { var f = (14000 - d2) / 14000 * .9, d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f; }
          p.vx *= .93; p.vy *= .93;
          p.x += p.vx + Math.sin(p.ph) * .25; p.y += p.vy + p.sp * dt * 60 * .5; p.a += p.va + p.vx * .01;
          if (p.y > h + 20) { var q = make(true); for (var k in q) p[k] = q[k]; }
          if (p.x < -30) p.x = w + 20; if (p.x > w + 30) p.x = -20;
        }
        strand(p);
      }
    }
    function frame(t) {
      raf = 0; var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (still() || !vis) { draw(0); last = 0; return; }
      draw(dt); raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; setTimeout(function () { mx = my = -999; }, 400); });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 6) % 10; s.style.transitionDelay = go ? (i * 160 + 200) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- seam 1: the logo's head fills with the shop and grows over the screen
  var grow = $('[data-grow]'), gphoto = $('[data-gphoto]'), glogo = $('[data-glogo]'), gcopy = $('[data-gcopy]');
  var MX0 = 130 / 512, MY0 = 12 / 512, MW = 300 / 512, MH = 498 / 512;
  function growFrame(p) {
    if (still()) { [gphoto, glogo, gcopy].forEach(function (el) { el.removeAttribute('style'); }); gphoto.classList.remove('full'); return; }
    var W = innerWidth, Hh = innerHeight, ph = phone();
    var L = ph ? Math.min(W * .72, Hh * .42) : Math.min(W * .36, Hh * .62);
    var lx = ph ? (W - L) / 2 : (rtl() ? W * .27 - L / 2 : W * .73 - L / 2), ly = ph ? Hh * .58 - L / 2 : (Hh - L) / 2 + 20;
    // where the head sits inside the logo at the start
    var hx = lx + L * MX0, hy = ly + L * MY0, hw = L * MW, hh = L * MH;
    // at the end: big enough that the screen lies inside the solid head
    var ew = Math.max(W / .62, (Hh / .62) * 300 / 498) * 1.05, eh = ew * 498 / 300;
    var e = smooth((p - .2) / .66);
    var cx = lerp(hx + hw / 2, W / 2, e), cy = lerp(hy + hh * .52, Hh / 2, e), mw = lerp(hw, ew, e * e), mh = mw * 498 / 300;
    gphoto.style.setProperty('--mw', mw.toFixed(1) + 'px'); gphoto.style.setProperty('--mh', mh.toFixed(1) + 'px');
    gphoto.style.setProperty('--mx', (cx - mw / 2).toFixed(1) + 'px'); gphoto.style.setProperty('--my', (cy - mh * .52).toFixed(1) + 'px');
    gphoto.style.setProperty('--gs', lerp(1.35, 1, e).toFixed(3));
    gphoto.classList.toggle('full', e >= .999);
    glogo.style.setProperty('--lx', lx + 'px'); glogo.style.setProperty('--ly', ly + 'px'); glogo.style.setProperty('--lw', L + 'px');
    var lo = 1 - smooth((p - .06) / .14);
    glogo.style.opacity = lo.toFixed(3); glogo.style.transform = 'scale(' + lerp(1, 1.06, 1 - lo).toFixed(3) + ')'; glogo.style.visibility = lo <= 0 ? 'hidden' : '';
    var co = 1 - smooth((p - .04) / .14); gcopy.style.opacity = co.toFixed(3); gcopy.style.visibility = co <= 0 ? 'hidden' : '';
  }

  // ---------------------------------------------------------------- in the chair: rack focus between his photos as the chapters pass
  var chaps = $$('[data-chap]'), cphs = $$('[data-cph]'), ctag = $('[data-ctag]'), cstage = $('[data-cstage]'), activeChap = -1;
  function setChap(i) {
    if (i === activeChap) return; activeChap = i;
    chaps.forEach(function (c, k) { c.classList.toggle('on', k === i); });
    cphs.forEach(function (c, k) { c.classList.toggle('on', k === i); });
    decode(ctag, chaps[i].dataset[he() ? 'he' : 'en']);
  }

  // ---------------------------------------------------------------- wax: down the thread, then pull back
  var wax = $('[data-wax]'), wmove = $('[data-wmove]'), wfig = $('[data-wfig]');
  watch(wax, function (v) { wax.classList.toggle('on', v); });
  function waxFrame(p) {
    if (still()) { wmove.removeAttribute('style'); return; }
    var Hf = wfig.clientHeight, S, a = smooth(p / .62), b = smooth((p - .66) / .3);
    S = lerp(1.65, 1, b);
    var y = -(S - 1) * Hf * (b > 0 ? 1 : a);
    wmove.style.setProperty('--ws', S.toFixed(4)); wmove.style.setProperty('--wy', y.toFixed(1) + 'px');
    wmove.style.setProperty('--go', (100 - clamp(p / .64, 0, 1) * 100).toFixed(2)); wmove.style.setProperty('--gop', (1 - b).toFixed(3));
  }

  // ---------------------------------------------------------------- bento: spot under the hand, the room tilts, the clipper buzzes now and then
  var shop = $('#shop'), shopOn = false, clipper = $('[data-clipper]');
  watch(shop, function (v) { shopOn = v; shop.classList.toggle('on', v); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var tilt = $('[data-tilt]');
  tilt.addEventListener('pointermove', function (e) { if (still() || e.pointerType !== 'mouse') return; var r = tilt.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; tilt.style.setProperty('--rx', (x * 7).toFixed(2) + 'deg'); tilt.style.setProperty('--ry', (-y * 6).toFixed(2) + 'deg'); });
  tilt.addEventListener('pointerleave', function () { tilt.style.setProperty('--rx', '0deg'); tilt.style.setProperty('--ry', '0deg'); });
  function buzz() { if (!shopOn || still()) return; clipper.classList.remove('buzz'); void clipper.getBoundingClientRect(); clipper.classList.add('buzz'); }
  setInterval(buzz, 3800);
  $('.t-clip').addEventListener('pointerdown', buzz);

  // ---------------------------------------------------------------- the arc of his photos under the brass rail: turns by itself, with the scroll and with a drag
  var ring = (function () {
    var wrap = $('[data-ringwrap]'), el = $('[data-ring]'), rail = $('[data-rail]');
    $$('.rc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $$('img', k).forEach(function (i) { i.alt = ''; i.removeAttribute('data-alt-he'); }); el.appendChild(k); });
    var cards = $$('.rc', el), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = true, last = 0;
    // bulbs along the rail, each with a halo that brightens as the arc turns under it
    var bulbs = [];
    for (var i = 0; i < 11; i++) {
      var t = (i + .5) / 11, x = (1 - t) * (1 - t) * 20 + 2 * (1 - t) * t * 600 + t * t * 1180, y = (1 - t) * (1 - t) * 150 + 2 * (1 - t) * t * -40 + t * t * 150;
      var g = document.createElementNS(NS, 'g'), ha = document.createElementNS(NS, 'ellipse'), bu = document.createElementNS(NS, 'ellipse');
      ha.setAttribute('class', 'halo'); ha.setAttribute('cx', x); ha.setAttribute('cy', y + 16); ha.setAttribute('rx', 34); ha.setAttribute('ry', 26);
      bu.setAttribute('class', 'bulb'); bu.setAttribute('cx', x); bu.setAttribute('cy', y + 8); bu.setAttribute('rx', 7); bu.setAttribute('ry', 6);
      g.appendChild(ha); g.appendChild(bu); rail.appendChild(g); bulbs.push(ha);
    }
    function R() { var cw = cards[0].offsetWidth || 180; return Math.max(cw * 1.1 / (2 * Math.tan(Math.PI / N)), phone() ? 300 : innerWidth * .4); }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (7 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var r = R(), sc = scrollY * .05 * (rtl() ? 1 : -1);
      cards.forEach(function (c, i) {
        var a = rot + sc + i * step, f = Math.cos(a * Math.PI / 180), lift = f > .95 ? (f - .95) * 20 : 0;
        c.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + (r + lift * 40).toFixed(1) + 'px) scale(' + (1 + lift * .06).toFixed(3) + ')';
        c.style.filter = 'brightness(' + (.28 + .72 * Math.pow(Math.max(f, 0), 1.6)).toFixed(3) + ')';
      });
      bulbs.forEach(function (b, i) { b.style.opacity = (.25 + .75 * Math.pow(Math.max(0, Math.cos((rot + sc) * Math.PI / 90 + i * .6)), 2)).toFixed(3); });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    el.style.transform = 'rotateX(-6deg)';
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .25; vel = dx * 2 * (rtl() ? 1 : -1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(wrap, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- message Yosef: chair, drawer, clock; the message writes itself
  var steps = $$('[data-step]');
  function lightStep(n) { steps.forEach(function (s, i) { s.classList.toggle('on', i <= n); }); }
  function radios(sel, n) {
    var bs = $$(sel);
    bs.forEach(function (b) { b.addEventListener('click', function () { bs.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lightStep(n); write(); }); });
    return bs;
  }
  var whoB = radios('[data-who]', 0), whatB = radios('[data-what]', 1), whenB = radios('[data-when]', 2);
  var msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
  var pick = function (bs) { return bs.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0]; };
  function compose() {
    var k = he() ? 'he' : 'en', who = pick(whoB).dataset[k], what = pick(whatB).dataset[k], when = pick(whenB).dataset[k];
    return he() ? 'היי יוסף, אפשר לקבוע תור ' + when + '? ' + who + ': ' + what + '.'
                : 'Hi Yosef, could I book a slot ' + when + '? ' + who + ': ' + what + '.';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; lightStep(0); if (!still()) { shown = ''; msgEl.textContent = ''; } write(); } }, { threshold: .4 });
  $('[data-send]').addEventListener('pointerenter', function () { lightStep(3); });

  // ---------------------------------------------------------------- reviews: pinned to the leather, the row slides with the scroll on wide screens
  var revs = $('[data-revs]'), rrail = $('[data-rrail]'), rtrack = $('[data-rtrack]'), RT = [-1.6, 1.2, -.8, 1.5, -1.1];
  $$('.rv', revs).forEach(function (r, i) { r.style.setProperty('--rt', RT[i % RT.length] + 'deg'); r.style.setProperty('--d', i * 90 + 'ms'); });
  watch(revs, function (v) { if (v) revs.classList.add('on'); }, { threshold: .15 });
  revs.addEventListener('pointermove', function (e) { var r = revs.getBoundingClientRect(); revs.style.setProperty('--lx', (e.clientX - r.left) + 'px'); revs.style.setProperty('--ly', (e.clientY - r.top) + 'px'); });

  // ---------------------------------------------------------------- visit
  var visit = $('[data-visit]'), vfront = $('[data-vfront]'), vinfo = $('[data-vinfo]');

  // ---------------------------------------------------------------- footer: curtain, clippings that settle into the head, the name letter by letter
  var foot = $('[data-foot]'), main = $('#main'), fword = $('[data-fword]'), dock = $('[data-dock]');
  fword.innerHTML = fword.textContent.split('').map(function (c, i) { return c === ' ' ? ' ' : '<span style="--i:' + i + '" aria-hidden="true">' + c + '</span>'; }).join('');
  var fall = (function () {
    var cv = $('[data-fcv]'), c = cv.getContext('2d'), img = $('[data-flogo]'), P = [], ok = false, raf = 0, t0 = 0, w, h;
    function sample() {
      try {
        var sc = document.createElement('canvas'), n = 120; sc.width = n; sc.height = n;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, n, n);
        var d = sx.getImageData(0, 0, n, n).data, pts = [];
        for (var y = 0; y < n; y += 2) for (var x = 0; x < n; x += 2) { var k = (y * n + x) * 4; if (d[k] < 90) pts.push([x / n, y / n]); }
        P = pts.map(function (q) { return { tx: q[0], ty: q[1], x: Math.random(), y: -Math.random() * .6, dl: Math.random() * .8, a: Math.random() * 6.28 }; });
        ok = P.length > 20;
      } catch (e) { ok = false; }
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(t) {
      raf = 0; var T = (t - t0) / 1000; size(); c.clearRect(0, 0, w, h); c.fillStyle = '#f3e6cc';
      var off = .4 / 1.8, sc = 1 / 1.8, done = true;
      for (var i = 0; i < P.length; i++) {
        var p = P[i], e = smooth((T - p.dl) / 1.1); if (e < 1) done = false;
        var x = lerp(p.x * w, (off + p.tx * sc) * w, e), y = lerp(p.y * h, (off + p.ty * sc) * h, e * e);
        c.globalAlpha = .85 * (1 - smooth((T - 2.1) / .6));
        c.save(); c.translate(x, y); c.rotate(p.a * (1 - e)); c.fillRect(-2.2, -.9, 4.4, 1.8); c.restore();
      }
      if (!done || T < 2.8) raf = requestAnimationFrame(frame); else c.clearRect(0, 0, w, h);
      if (T > 1.5) foot.classList.add('lit');
    }
    function play() {
      if (still() || !ok) { foot.classList.add('lit'); return; }
      cancelAnimationFrame(raf); t0 = performance.now(); raf = requestAnimationFrame(frame);
    }
    if (img.complete && img.naturalWidth) sample(); else img.addEventListener('load', sample, { once: true });
    return { play: play, reset: function () { cancelAnimationFrame(raf); raf = 0; c.clearRect(0, 0, cv.width, cv.height); foot.classList.remove('lit'); } };
  })();
  var footShown = false;
  function curtain() {
    var fh = foot.offsetHeight, use = !still() && fh < innerHeight - 60;
    foot.classList.toggle('curtain', use); main.style.marginBottom = use ? fh + 'px' : '';
  }

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight, W = innerWidth;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) { ring.kick(); clips.kick(); }
    // hero drifts on phones
    if (!calm && phone()) { var hr = hero.getBoundingClientRect(); hero.style.setProperty('--py', (clamp(-hr.top, 0, vh) * .12).toFixed(1) + 'px'); }
    growFrame(calm ? 1 : prog(grow));
    // chapters: whichever crosses the middle of the screen
    var mid = vh * .5, best = 0;
    chaps.forEach(function (c, i) { var r = c.getBoundingClientRect(); if (r.top < mid) best = i; if (phone() && !calm) { var img = $('.c-inl img', c), q = clamp((vh - r.top) / (vh + r.height), 0, 1); img.style.setProperty('--iy', ((q - .5) * -40).toFixed(1) + 'px'); } });
    setChap(best);
    if (!calm && !phone()) {
      var cr = chaps[best].getBoundingClientRect(), cq = clamp((mid - cr.top) / cr.height, 0, 1);
      $('img', cphs[best]).style.setProperty('--cy', ((cq - .5) * -30).toFixed(1) + 'px');
      // the next card lands: the chair stage sinks back under the wax card
      var wt = wax.getBoundingClientRect().top, sink = clamp(1 - wt / vh, 0, 1);
      cstage.style.transform = sink ? 'scale(' + (1 - sink * .06).toFixed(4) + ')' : ''; cstage.style.filter = sink ? 'brightness(' + (1 - sink * .45).toFixed(3) + ')' : '';
    } else { cstage.style.transform = ''; cstage.style.filter = ''; }
    waxFrame(calm ? 1 : prog(wax));
    // reviews slide sideways with the scroll on wide screens; phones swipe
    if (!calm && W > 860) {
      var rr = revs.getBoundingClientRect(), rp = clamp((vh - rr.top) / (vh + rr.height), 0, 1), extra = Math.max(0, rtrack.scrollWidth - rrail.clientWidth + 40);
      rrail.style.overflowX = 'hidden'; rtrack.style.setProperty('--rx', ((rtl() ? 1 : -1) * extra * smooth((rp - .15) / .7)).toFixed(1) + 'px');
    } else { rrail.style.overflowX = ''; rtrack.style.setProperty('--rx', '0px'); }
    // visit: from the sign over the door back to the whole shopfront, settling into its frame
    if (!calm && W > 860) {
      var vp = prog(visit), e = smooth((vp - .08) / .5), endH = vh * .78, endW = Math.min(W * .32, endH * .62), m = parseFloat(getComputedStyle(visit).paddingLeft) || 0;
      var mm = Math.max(16, Math.min(44, W * .03)), ex = rtl() ? W - mm - endW : mm, ey = (vh - endH) / 2 + 26;
      vfront.style.setProperty('--fl', lerp(0, ex, e).toFixed(1) + 'px'); vfront.style.setProperty('--ft', lerp(0, ey, e).toFixed(1) + 'px');
      vfront.style.setProperty('--fw', lerp(W, endW, e).toFixed(1) + 'px'); vfront.style.setProperty('--fh', lerp(vh, endH, e).toFixed(1) + 'px');
      vfront.style.setProperty('--fr', (28 * e).toFixed(1) + 'px'); vfront.style.setProperty('--fs', lerp(1.2, 1, smooth((vp - .02) / .56)).toFixed(4));
      var vo = smooth((vp - .3) / .25);
      vinfo.style.setProperty('--vo', vo.toFixed(3)); vinfo.style.setProperty('--vt', ((1 - vo) * 30).toFixed(1) + 'px'); vinfo.style.visibility = vo <= 0 ? 'hidden' : '';
    } else if (!calm) {
      var fr0 = vfront.getBoundingClientRect(), fq = clamp((vh - fr0.top) / (vh + fr0.height), 0, 1);
      vfront.style.setProperty('--fs', lerp(1.7, 1, smooth(fq / .8)).toFixed(4));
      vinfo.style.setProperty('--vo', 1); vinfo.style.setProperty('--vt', '0px'); vinfo.style.visibility = '';
      ['--fl', '--ft', '--fw', '--fh', '--fr'].forEach(function (k) { vfront.style.removeProperty(k); });
    } else { vfront.removeAttribute('style'); vinfo.removeAttribute('style'); }
    // footer: replays every time the curtain opens
    var mb = main.getBoundingClientRect().bottom, show = mb < vh - Math.min(foot.offsetHeight * .45, vh * .4);
    if (show && !footShown) { footShown = true; fall.play(); }
    else if (!show && footShown && mb > vh - 10) { footShown = false; if (!calm) fall.reset(); }
    foot.style.visibility = foot.classList.contains('curtain') && mb > vh + 2 ? 'hidden' : '';
    dock.classList.toggle('away', mb < vh - 120 || hero.getBoundingClientRect().bottom > vh * .35);
  }

  function layout() { curtain(); placeSpots(); clips.size(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () {
    if (once) return; once = true;
    requestAnimationFrame(function () { spotsOn(false); setTimeout(function () { hero.classList.add('ready'); }, 0); callouts(); clips.kick(); });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 900);
  addEventListener('load', function () { layout(); });
})();
