(function () {
  var root = document.documentElement, WA = '972524649687';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var TITLE = { he: 'גולדן טאצ\' · מספרת גברים וילדים · זבולון 91, קריית אתא', en: 'Golden Touch · Men’s & kids’ barbershop · 91 Zevulun St, Kiryat Ata' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור גולדן טאצ\' · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Golden Touch · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var NS = 'http://www.w3.org/2000/svg';

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'גולדן טאצ\'', 'Golden Touch');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'חיוג למספרה, 052-464-9687', 'Call the shop, 052-464-9687');
    aria('[data-t-wa]', 'וואטסאפ ללירון', 'WhatsApp Liron');
    aria('[data-t-who]', 'מי מסתפר', 'Who’s the cut for');
    aria('[data-t-day]', 'באיזה יום', 'Which day');
    aria('[data-t-when]', 'מתי בערך', 'Roughly when');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: זבולון 91, קריית אתא' : 'Map: 91 Zevulun St, Kiryat Ata'; });
    $$('.spot').forEach(function (s) { var t = s.dataset[l]; s.setAttribute('aria-label', t); if (s.classList.contains('on')) $('.tag', s).textContent = t; });
    $$('.decode').forEach(function (d) { d.textContent = d.dataset[l === 'he' ? 'decodeHe' : 'decodeEn']; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('gt616-lang', l); } catch (e) {}
    texts(l); hours(); days(); write(true); split($('.f-word')); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('gt616-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $('.foot').classList.add('in');
    layout(); clouds.kick(); arc.kick(); tide.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [10.5, 19.5], 1: null, 2: [10, 19], 3: [10.5, 19.5], 4: [10.5, 19], 5: [9.5, 12], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function is247() { for (var d = 0; d < 7; d++) if (!H[d] || H[d][0] !== 0 || H[d][1] !== 24) return false; return true; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (is247()) { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב־' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב־' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב־' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    // the dock gets a short form: "open until 19:30" / "opens tomorrow at 10:30"
    var short = txt.replace(/^(Open now|Closed now|פתוח עכשיו|סגור עכשיו) · /, open ? (l ? 'פתוח ' : 'Open ') : '').replace(/(Sun|Mon|Tues|Wednes|Thurs|Fri|Satur)day/, function (m0) { return m0.slice(0, 3); }).replace(/^opens (tomorrow )?at /, function (m0, t) { return t ? 'Opens tomorrow ' : 'Opens '; }).replace(/^opens /, 'Opens ').replace(/ at (\d)/, ' $1');
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + (el.dataset.status === 'short' ? short : txt); });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
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
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); if (e.target.hasAttribute('data-tile')) decodeIn(e.target); } });
  }, { rootMargin: '0px 0px 0px 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- letters split for the headline and the footer word
  function split(el) {
    $$('span[lang]', el).forEach(function (sp) {
      var i = 0, txt = sp.dataset.txt || sp.textContent; sp.dataset.txt = txt;
      sp.innerHTML = txt.split(' ').map(function (w) {
        return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  }
  split($('[data-split]')); split($('.f-word'));

  // ---------------------------------------------------------------- glyph decode on the tile labels
  var GLHE = 'אבגדהוזחטיכלמנסעפצקרשת', GLEN = 'abcdefghkmnoprstuvwxyz';
  function decode(el) {
    var txt = el.dataset[he() ? 'decodeHe' : 'decodeEn'], GL = he() ? GLHE : GLEN;
    if (still()) { el.textContent = txt; return; }
    clearInterval(el._t); var f = 0, n = txt.length;
    el._t = setInterval(function () {
      f++; var done = Math.floor(f / 2);
      el.textContent = txt.split('').map(function (c, i) { return i < done || c === ' ' ? c : GL[Math.floor(Math.random() * GL.length)]; }).join('');
      if (done >= n) { clearInterval(el._t); el.textContent = txt; }
    }, 34);
  }
  function decodeIn(tile) { $$('.decode', tile).forEach(decode); }
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
    t.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') decodeIn(t); });
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), hcopy = $('.h-copy');

  // ---------------------------------------------------------------- cloud letters: puffs in the style of the painted GOLDEN TOUCH; wind under the hand
  var clouds = (function () {
    var cv = $('[data-clouds]'), c = cv.getContext('2d'), base = null, bOx = 0, bOy = 0, P = [], F = [], w, h, raf = 0, vis = true, t0 = 0, mx = -999, my = -999, gust = [], sprite, sR = 64;
    function makeSprite() {
      sprite = document.createElement('canvas'); sprite.width = sprite.height = sR * 2;
      var s = sprite.getContext('2d'), g = s.createRadialGradient(sR * .85, sR * .7, 2, sR, sR, sR);
      g.addColorStop(0, 'rgba(255,253,246,1)'); g.addColorStop(.55, 'rgba(250,244,228,.97)'); g.addColorStop(.8, 'rgba(240,222,170,.6)'); g.addColorStop(1, 'rgba(232,206,140,0)');
      s.fillStyle = g; s.beginPath(); s.arc(sR, sR, sR, 0, 6.29); s.fill();
    }
    function build() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var top = nav.getBoundingClientRect().bottom - hero.getBoundingClientRect().top + 6, bot = hcopy.offsetTop - 6, bh = Math.max(60, bot - top), bw = Math.min(w * .92, 1180);
      var lines = bw / bh > 4.2 ? ['GOLDEN TOUCH'] : ['GOLDEN', 'TOUCH'];
      var fs = Math.min(bh / (lines.length * 1.02), bw / (Math.max.apply(null, lines.map(function (x) { return x.length; })) * .66));
      var oc = document.createElement('canvas'), ow = Math.ceil(bw), oh = Math.ceil(fs * lines.length * 1.02); oc.width = ow; oc.height = oh;
      var o = oc.getContext('2d'); o.fillStyle = '#000'; o.textAlign = 'center'; o.textBaseline = 'middle'; o.font = '700 ' + fs + 'px Fredoka, sans-serif';
      lines.forEach(function (ln, i) { o.fillText(ln, ow / 2, fs * (i + .52) * 1.02); });
      var d = o.getImageData(0, 0, ow, oh).data, step = Math.max(3, fs / (phone() ? 14 : 10)), ox = (w - ow) / 2, oy = top + (bh - oh) / 2;
      var inside = function (x, y) { x = Math.floor(x); y = Math.floor(y); return x >= 0 && y >= 0 && x < ow && y < oh && d[(y * ow + x) * 4 + 3] > 128; };
      // the letter body: a soft cream fill; the puffs sit along its edges like the painted cloud letters
      base = document.createElement('canvas'); base.width = ow; base.height = oh; var bx = base.getContext('2d');
      bx.filter = 'blur(' + Math.max(.6, fs / 80).toFixed(1) + 'px)'; bx.drawImage(oc, 0, 0); bx.globalCompositeOperation = 'source-in'; bx.filter = 'none';
      var bg = bx.createLinearGradient(0, 0, 0, oh); bg.addColorStop(0, '#fffaf0'); bg.addColorStop(.7, '#f6ecd4'); bg.addColorStop(1, '#ecd49a'); bx.fillStyle = bg; bx.fillRect(0, 0, ow, oh);
      bOx = ox; bOy = oy;
      P = [];
      for (var y = step / 2; y < oh; y += step * .8) for (var x = step / 2; x < ow; x += step * .8) {
        var jx = x + (Math.random() - .5) * step * .4, jy = y + (Math.random() - .5) * step * .4, e = step * .7;
        if (inside(jx, jy) && !(inside(jx + e, jy) && inside(jx - e, jy) && inside(jx, jy + e) && inside(jx, jy - e))) P.push({ hx: ox + jx, hy: oy + jy, r: step * (phone() ? .6 + Math.random() * .3 : .75 + Math.random() * .4), x: Math.random() * w, y: Math.random() * h * .5, vx: 0, vy: 0, ph: Math.random() * 6.28, dl: Math.random() * .6 });
      }
      F = [];   // a few loose clouds drifting across the painted sky
      for (var k = 0; k < (phone() ? 5 : 9); k++) F.push({ x: Math.random() * w, y: h * (.08 + Math.random() * .5), s: .5 + Math.random() * 1.1, v: 6 + Math.random() * 12, n: 4 + Math.floor(Math.random() * 4), seed: Math.random() * 100 });
      P.forEach(function (p) { if (still()) { p.x = p.hx; p.y = p.hy; } });
    }
    function cloudShape(f, x) {
      for (var i = 0; i < f.n; i++) {
        var a = Math.sin(f.seed + i * 1.7), r = (26 + 18 * Math.abs(Math.cos(f.seed + i))) * f.s;
        c.drawImage(sprite, x + (i - f.n / 2) * 22 * f.s - r, f.y + a * 8 * f.s - r, r * 2, r * 2);
      }
    }
    function frame(nw) {
      raf = 0; var calm = still(), T = (nw - t0) / 1000;
      var hr = hero.getBoundingClientRect(), lift = calm ? 0 : clamp(-hr.top / hr.height, 0, 1);
      c.clearRect(0, 0, w, h);
      c.globalAlpha = .18;
      F.forEach(function (f) { var x = calm ? f.x : ((f.x + T * f.v * (rtl() ? -1 : 1)) % (w + 300) + w + 300) % (w + 300) - 150; cloudShape(f, x); });
      if (base) { c.globalAlpha = (calm ? 1 : smooth((T - .5) / 1.4)) * (.95 - lift * .6); c.drawImage(base, bOx, bOy - lift * 160); }
      gust = gust.filter(function (g) { return nw - g.t < 900; });
      for (var i = 0; i < P.length; i++) {
        var p = P[i], a = calm ? 1 : smooth((T - p.dl) / 1.6);
        var tx = p.hx + Math.sin(T * .7 + p.ph) * 1.6, ty = p.hy + Math.cos(T * .6 + p.ph) * 1.4 - lift * 160;
        if (calm) { p.x = p.hx; p.y = p.hy; }
        else if (a < 1) { p.x = lerp(p.x, tx, a * .2 + .04); p.y = lerp(p.y, ty, a * .2 + .04); }
        else {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 9000) { var f = (9000 - d2) / 9000 * 2.2, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
          for (var k = 0; k < gust.length; k++) { var g = gust[k], gx = p.x - g.x, gy = p.y - g.y, gd = Math.sqrt(gx * gx + gy * gy) || 1, rr = (nw - g.t) * .5; if (Math.abs(gd - rr) < 30) { p.vx += gx / gd * 3; p.vy += gy / gd * 3; } }
          p.vx += (tx - p.x) * .035; p.vy += (ty - p.y) * .035; p.vx *= .86; p.vy *= .86; p.x += p.vx; p.y += p.vy;
        }
        c.globalAlpha = (.95 - lift * .6) * (calm ? 1 : a * .9 + .1);
        c.drawImage(sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      c.globalAlpha = 1;
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) { var r = hero.getBoundingClientRect(); gust.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }); });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    makeSprite();
    // on phones, a soft breeze sweeps through the letters now and then, so the wind is seen without a cursor
    setInterval(function () { if (!still() && vis && matchMedia('(hover: none)').matches && P.length) { var p = P[Math.floor(Math.random() * P.length)]; gust.push({ x: p.hx, y: p.hy, t: performance.now() }); } }, 2600);
    return { size: function () { build(); t0 = performance.now(); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- the arc of their photos: turns by itself, with the scroll and with a drag
  var arc = (function () {
    var wrap = $('[data-arcwrap]'), el = $('[data-arc]');
    $$('.ac', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $('img', k).alt = ''; el.appendChild(k); });
    var cards = $$('.ac', el), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = true, last = 0;
    function R() { var cw = cards[0].offsetWidth || 180; return Math.max(cw * 1.1 / (2 * Math.tan(Math.PI / N)), phone() ? 300 : innerWidth * .4); }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (7 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var r = R(), sc = scrollY * .05 * (rtl() ? 1 : -1);
      cards.forEach(function (c, i) {
        var a = rot + sc + i * step, f = Math.cos(a * Math.PI / 180), lift = f > .95 ? (f - .95) * 20 : 0;
        c.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + (r + lift * 40).toFixed(1) + 'px) translateY(' + (-lift * 14).toFixed(1) + 'px)';
        c.style.filter = 'brightness(' + (.35 + .65 * Math.pow(Math.max(f, 0), 1.5)).toFixed(3) + ')';
        c.style.zIndex = Math.round(f * 100) + 100;
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    el.style.transform = 'rotateX(-6deg)';
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .25; vel = dx * 2 * (rtl() ? 1 : -1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- portal: into the painted O, out inside the room
  var portal = $('[data-portal]'), stage = $('.p-stage'), room = $('.p-room'), mural = $('[data-pmural]'), spots = $$('.spot'), MO = [345 / 960, 258 / 700], HOLE = 37 / 960;
  var mGeo = null;
  function muralGeo() {
    var W = stage.clientWidth, Hh = stage.clientHeight, s = Math.max(W / 960, Hh / 700), dw = 960 * s, dh = 700 * s, ox = (W - dw) * .36, oy = (Hh - dh) * .37;
    var cx = ox + dw * MO[0], cy = oy + dh * MO[1], r = HOLE * dw;
    var far = Math.max(Math.hypot(cx, cy), Math.hypot(W - cx, cy), Math.hypot(cx, Hh - cy), Math.hypot(W - cx, Hh - cy));
    mGeo = { cx: cx, cy: cy, r: r, S: far / r * 1.08 };
    var m = 'radial-gradient(circle ' + r.toFixed(1) + 'px at ' + cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px, transparent ' + (r - 1.5).toFixed(1) + 'px, #000 ' + r.toFixed(1) + 'px)';   // taste-skill-ignore: mask for the painted O
    mural.style.webkitMaskImage = m; mural.style.maskImage = m;
    mural.style.transformOrigin = cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px';
  }
  function placeSpots() {
    var W = stage.clientWidth, Hh = stage.clientHeight, s = Math.max(W / 1200, Hh / 1600), dw = 1200 * s, dh = 1600 * s, ox = (W - dw) * .5, oy = (Hh - dh) * .38;
    spots.forEach(function (sp) {
      var x = ox + dw * +sp.dataset.x, y = oy + dh * +sp.dataset.y;
      var flip = rtl() ? x < W * .45 : x > W * .55, dotLeft = rtl() ? flip : !flip;
      sp.classList.toggle('flip', flip); sp.style.top = y + 'px';
      if (dotLeft) { sp.style.left = (x - 9) + 'px'; sp.style.right = 'auto'; } else { sp.style.right = (W - x - 9) + 'px'; sp.style.left = 'auto'; }
      sp.hidden = x < 20 || x > W - 20 || y < 70 || y > Hh * .55;
    });
  }
  function typeTag(sp, on) {
    var tag = $('.tag', sp), txt = sp.dataset[he() ? 'he' : 'en'];
    if (on === sp.classList.contains('on')) return;
    sp.classList.toggle('on', on); clearInterval(sp._t);
    if (!on) { tag.textContent = ''; return; }
    if (still()) { tag.textContent = txt; return; }
    var i = 0; tag.textContent = '';
    sp._t = setInterval(function () { tag.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(sp._t); }, 36);
  }
  spots.forEach(function (sp) { sp.addEventListener('click', function () { sp._pin = !sp.classList.contains('on'); typeTag(sp, sp._pin); }); });

  // ---------------------------------------------------------------- the clock on their wall: live Israel time
  var tk = $('[data-ticks]');
  for (var q = 0; q < 12; q++) { var ln = document.createElementNS(NS, 'line'), a = q * Math.PI / 6; ln.setAttribute('x1', 100 + Math.sin(a) * 78); ln.setAttribute('y1', 100 - Math.cos(a) * 78); ln.setAttribute('x2', 100 + Math.sin(a) * (q % 3 ? 70 : 64)); ln.setAttribute('y2', 100 - Math.cos(a) * (q % 3 ? 70 : 64)); tk.appendChild(ln); }
  var hh = $('[data-hh]'), mm = $('[data-mm]'), ss = $('[data-ss]'), chair = $('#chair'), chairOn = false;
  function clock() { var o = nowParts(), H12 = (+o.hour % 12), M = +o.minute, S = +o.second; hh.setAttribute('transform', 'rotate(' + (H12 * 30 + M * .5) + ' 100 100)'); mm.setAttribute('transform', 'rotate(' + (M * 6 + S * .1) + ' 100 100)'); ss.setAttribute('transform', 'rotate(' + S * 6 + ' 100 100)'); }
  clock(); setInterval(function () { if (chairOn) clock(); }, 1000);
  watch(chair, function (v) { chairOn = v; chair.classList.toggle('on', v); });

  // ---------------------------------------------------------------- tide: three waves of the painted sea roll up into booking
  var tide = (function () {
    var box = $('[data-tide]'), paths = $$('path', box), raf = 0, vis = false;
    function wave(t, k, rise) {
      var W = 1440, Hh = 220, base = Hh * (1 - rise) + k * 26 + 10, amp = 16 + k * 6, len = 360 + k * 140, sp = .6 + k * .25, d = 'M0 ' + Hh;
      for (var x = 0; x <= W; x += 40) d += ' L' + x + ' ' + (base + Math.sin(x / len * 6.283 + t * sp * (k % 2 ? -1 : 1)) * amp).toFixed(1);
      return d + ' L' + W + ' ' + Hh + ' Z';
    }
    function draw(t) {
      var r = box.getBoundingClientRect(), rise = still() ? .78 : clamp((innerHeight - r.top) / (innerHeight * .9), .15, 1) * .85;
      paths[2].setAttribute('d', wave(t, 2, rise * .85)); paths[1].setAttribute('d', wave(t, 1, rise * .7)); paths[0].setAttribute('d', wave(t, 0, rise * .55));
    }
    // paths: w3 (back), w2, w1 (front, the colour of the next section)
    function frame(t) { raf = 0; draw(t / 1000); if (vis && !still()) raf = requestAnimationFrame(frame); }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    watch(box, function (v) { vis = v; if (v) kick(); }, { rootMargin: '100px 0px' });
    draw(0);
    return { kick: kick, draw: function () { draw(performance.now() / 1000); } };
  })();

  // ---------------------------------------------------------------- composer: the postcard to Liron writes itself
  var dayBox = $('[data-days]'), whoB = $$('[data-who]'), whenB = $$('[data-when]'), steps = $$('[data-step]'), msgEl = $('[data-msg]'), shown = '', typing = 0, seen = false, pickDay = null;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  function radio(group, b) { group.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); }
  function days() {
    var n = now(), l = he(), order = [];
    for (var k = 0; k < 7; k++) { var d = (n.d + k) % 7; if (H[d] && !(k === 0 && n.h >= H[d][1] - .5)) order.push(d); }
    if (pickDay === null || order.indexOf(pickDay) < 0) pickDay = order[0];
    dayBox.innerHTML = order.map(function (d) { return '<button type="button" role="radio" aria-checked="' + (d === pickDay) + '" data-day="' + d + '">' + (l ? dayHe[d] : dayEn[d]) + '</button>'; }).join('');
    $$('button', dayBox).forEach(function (b) { b.addEventListener('click', function () { pickDay = +b.dataset.day; radio($$('button', dayBox), b); lightStep(1); limits(); write(); }); });
    limits();
  }
  // Friday is open until noon: only the morning can be picked
  function limits() {
    var t = H[pickDay] || [0, 24];
    whenB.forEach(function (b) { var from = { m: 0, a: 11.5, e: 14 }[b.dataset.when]; b.disabled = from >= t[1] - .5; });
    var cur = whenB.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0];
    if (cur && cur.disabled) radio(whenB, whenB[0]);
  }
  whoB.forEach(function (b) { b.addEventListener('click', function () { radio(whoB, b); lightStep(0); write(); }); });
  whenB.forEach(function (b) { b.addEventListener('click', function () { radio(whenB, b); lightStep(2); write(); }); });
  var send = $('[data-send]');
  ['pointerenter', 'focus'].forEach(function (ev) { send.addEventListener(ev, function () { lightStep(3); }); });
  function pick(g) { return g.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0]; }
  function compose() {
    var l = he(), w = pick(whoB), wh = pick(whenB), d = pickDay;
    return l ? 'היי לירון, אשמח לקבוע תור ל' + w.dataset.he + ' ביום ' + dayHe[d] + ' ' + wh.dataset.he + '. תודה!'
             : 'Hi Liron, I’d like to book ' + w.dataset.en + ' on ' + dayEn[d] + ' ' + wh.dataset.en + '. Thanks!';
  }
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !seen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-post]'), function (v) { if (v && !seen) { seen = true; lightStep(0); if (!still()) { shown = ''; msgEl.textContent = ''; } write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 4) % 10; s.style.transitionDelay = go ? (300 + i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- reviews: two copies so the drift loops without a seam
  var lane = $('[data-lane]');
  $$('.rv', lane).forEach(function (r) { var k = r.cloneNode(true); k.setAttribute('aria-hidden', 'true'); lane.appendChild(k); });

  // ---------------------------------------------------------------- footer
  var foot = $('[data-foot]'), fsun = $('.f-sun'), land = $('[data-land]');
  watch(foot, function (v) { if (v) foot.classList.add('in'); }, { threshold: .25 });

  // ---------------------------------------------------------------- one scroll loop
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) { clouds.kick(); arc.kick(); tide.kick(); } else tide.draw();
    // portal
    var p = calm ? 1 : prog(portal), e = calm ? 1 : smooth((p - .03) / .47);
    if (!calm && mGeo) {
      var sc = Math.pow(mGeo.S, e);
      mural.style.transform = 'scale(' + sc.toFixed(4) + ')';
      mural.style.opacity = (1 - smooth((e - .8) / .17)).toFixed(3);
      room.style.transform = 'scale(' + lerp(1.3, 1, e).toFixed(4) + ')';
    } else { mural.style.transform = ''; room.style.transform = ''; }
    stage.style.setProperty('--pc', smooth((p - .52) / .18).toFixed(3));
    stage.style.setProperty('--ps', smooth((p - .6) / .14).toFixed(3));
    spots.forEach(function (sp, i) { if (sp._pin !== undefined) return; typeTag(sp, calm || p > .64 + i * .05); });
    // visit lands over the questions
    if (!calm) {
      var lr = land.getBoundingClientRect(), lp = smooth((vh - lr.top) / (vh * .7));
      land.style.transform = 'translateY(' + ((1 - lp) * 70).toFixed(1) + 'px) scale(' + lerp(.95, 1, lp).toFixed(4) + ')';
    } else land.style.transform = '';
    // the sun rises behind the footer curtain
    var fr = foot.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / fr.height);
    fsun.style.setProperty('--rise', ((1 - fp) * 120).toFixed(1) + 'px');
  }

  function layout() { clouds.size(); muralGeo(); placeSpots(); tide.draw(); tick(); }
  var rz, lw = innerWidth; addEventListener('resize', function () { if (innerWidth === lw && phone()) return; lw = innerWidth; clearTimeout(rz); rz = setTimeout(layout, 140); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); days(); write(true);
  var once = false, go = function () { if (once) return; once = true; layout(); requestAnimationFrame(function () { hero.classList.add('ready'); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { layout(); });
  if (still()) { $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); }); foot.classList.add('in'); }
})();
