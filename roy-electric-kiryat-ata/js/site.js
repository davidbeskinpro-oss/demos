(function () {
  var root = document.documentElement, WA = '972526873119';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'חשמל רועי · רועי מלכה, חשמלאי ראשי · קריית אתא', en: 'Roy Electric · Roy Malka, master electrician · Kiryat Ata' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור חשמל רועי · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Roy Electric · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-wa]', 'וואטסאפ לרועי', 'WhatsApp Roy');
    aria('[data-t-call]', 'התקשרו לרועי, 052-687-3119', 'Call Roy, 052-687-3119');
    aria('[data-t-jobs]', 'איזו עבודה', 'Which job');
    aria('[data-t-where]', 'איפה', 'Where');
    aria('[data-dim]', 'עמעום', 'Dimmer');
    $('[data-t-map]').title = l === 'he' ? 'מפה: רחוב דוכיפת, קריית אתא' : 'Map: Dukhifat St, Kiryat Ata';
    $$('.spot').forEach(function (s) { s.setAttribute('aria-label', s.dataset[l]); if (s.classList.contains('on')) $('.tag', s).textContent = s.dataset[l]; });
    $$('.rc').forEach(function (c) { $('img', c).alt = c.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('roy-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout(); front = -1;
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('roy-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-tile],[data-pd]').forEach(function (el) { el.classList.add('in'); });
    layout(); ring.kick(); torch.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [8, 18], 1: [8, 18], 2: [8, 18], 3: [8, 18], 4: [8, 18], 5: [7, 17], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
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

  // ---------------------------------------------------------------- hero headline: letters fill as the laser passes
  $$('[data-seam] > span').forEach(function (sp) {
    sp.innerHTML = sp.textContent.split('').map(function (c, i) { return c === ' ' ? ' ' : '<span class="ch" style="--i:' + i + '">' + c + '</span>'; }).join('');
  });

  var hero = $('[data-hero]'), hphoto = $('[data-hphoto]'), nav = $('[data-nav]'), plate = $('[data-plate]');
  function cbh() { root.style.setProperty('--cbh', $('.concept').offsetHeight + 'px'); }

  // ---------------------------------------------------------------- the flashlight: follows the hand; on phones it searches the panel by itself
  var torch = (function () {
    var px = null, py = null, x = .62, y = .45, r = 0, raf = 0, vis = true, t0 = performance.now();
    function frame(t) {
      raf = 0;
      if (still()) return;
      var T = (t - t0) / 1000, W = hero.clientWidth, Hh = hero.clientHeight;
      var tx, ty;
      if (px !== null) { tx = px / W; ty = py / Hh; }
      else { tx = .6 + Math.sin(T * .45) * (phone() ? .16 : .2); ty = .4 + Math.sin(T * .7 + 1) * .14; }
      x = lerp(x, tx, .08); y = lerp(y, ty, .08);
      var want = Math.min(W, Hh) * (phone() ? .5 : .42) * smooth((T - 1.2) / .9);
      r = lerp(r, want, .1);
      hphoto.style.setProperty('--fx', (x * 100).toFixed(2) + '%');
      hphoto.style.setProperty('--fy', (y * 100).toFixed(2) + '%');
      hphoto.style.setProperty('--fr', r.toFixed(1) + 'px');
      // labels type themselves where the light falls
      spots.forEach(function (sp) {
        if (sp._pinned || sp.hidden) return;
        var dx = sp._x - x * W, dy = sp._y - y * Hh;
        typeTag(sp, Math.sqrt(dx * dx + dy * dy) < r * .75);
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var b = hero.getBoundingClientRect(); px = e.clientX - b.left; py = e.clientY - b.top; });
    hero.addEventListener('pointerleave', function () { px = py = null; });
    watch(hero, function (v) { vis = v; kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- callouts on the real panel photo
  var spots = $$('.spot');
  function placeSpots() {
    var copyTop = $('.h-copy').offsetTop, W = hero.clientWidth, Hh = hero.clientHeight, iw = 1600, ih = 1200, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s, ox = (W - dw) * .62, oy = (Hh - dh) * .4;
    spots.forEach(function (sp) {
      var x = ox + dw * +sp.dataset.x, y = oy + dh * +sp.dataset.y;
      sp._x = x; sp._y = y;
      sp.style.left = x + 'px'; sp.style.top = y + 'px';
      var tw = sp.dataset[he() ? 'he' : 'en'].length * 8.5 + 60, roomL = x - 10, roomR = W - x - 10;
      var natural = rtl() ? roomL : roomR, other = rtl() ? roomR : roomL;
      sp.classList.toggle('flip', natural < tw && other >= tw);
      sp.hidden = x < 20 || x > W - 20 || y < 76 || y > copyTop - 30 || (natural < tw && other < tw);
    });
    if (still()) spots.forEach(function (sp) { typeTag(sp, true); });
  }
  function typeTag(sp, on) {
    var tag = $('.tag', sp), txt = sp.dataset[he() ? 'he' : 'en'];
    if (on === sp.classList.contains('on')) return;
    sp.classList.toggle('on', on); clearInterval(sp._t);
    if (!on) { tag.textContent = ''; return; }
    if (still()) { tag.textContent = txt; return; }
    var i = 0; tag.textContent = '';
    sp._t = setInterval(function () { tag.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(sp._t); }, 32);
  }
  spots.forEach(function (sp) { sp.addEventListener('click', function () { sp._pinned = !sp.classList.contains('on') || !sp._pinned; typeTag(sp, sp._pinned); }); });

  // ---------------------------------------------------------------- the ring of his photos: turns by itself, with the scroll and with a drag
  var front = -1, wnow = $('[data-wnow]');
  var GLYPHS = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHKLMNPRSTVWXZabcdeghkmnprstuvwxz' };
  function decode(el, txt) {
    clearInterval(el._d);
    if (still()) { el.textContent = txt; return; }
    var n = 0, G = GLYPHS[root.lang] || GLYPHS.he;
    el._d = setInterval(function () {
      n++; var done = Math.floor(n / 2);
      el.textContent = txt.split('').map(function (c, i) { return i < done || c === ' ' ? c : G[Math.floor(Math.random() * G.length)]; }).join('');
      if (done >= txt.length) clearInterval(el._d);
    }, 28);
  }
  var ring = (function () {
    var wrap = $('[data-ringwrap]'), el = $('[data-ring]');
    $$('.rc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); el.appendChild(k); });
    var cards = $$('.rc', el), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = false, last = 0;
    function R() { var cw = cards[0].offsetWidth || 200; return Math.max(cw * 1.08 / (2 * Math.tan(Math.PI / N)), phone() ? 250 : 360); }
    function frame(t) {
      raf = 0;
      if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; }); el.style.transform = ''; return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (!drag) { rot += (7 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var r = R(), sc = scrollY * .05 * (rtl() ? 1 : -1), best = -2, bi = 0;
      el.style.transform = 'translateZ(' + (-r).toFixed(0) + 'px) rotateX(-6deg)';
      cards.forEach(function (c, i) {
        var a = rot + sc + i * step, f = Math.cos(a * Math.PI / 180);
        if (f > best) { best = f; bi = i; }
        c.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + r.toFixed(1) + 'px)';
        c.style.filter = 'brightness(' + (.25 + .75 * Math.pow(Math.max(f, 0), 2)).toFixed(3) + ')';
      });
      var fi = bi % (N / 2);
      if (fi !== front) {
        front = fi;
        cards.forEach(function (c, i) { var cap = $('figcaption', c); if (i === bi) decode(cap, c.dataset[he() ? 'he' : 'en']); else { clearInterval(cap._d); cap.textContent = ''; } });
        decode(wnow, cards[bi].dataset[he() ? 'he' : 'en']);
      }
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .3; vel = dx * 2 * (rtl() ? 1 : -1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    addEventListener('pointercancel', function () { drag = false; wrap.classList.remove('drag'); });
    watch(wrap, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
  })();

  // ---------------------------------------------------------------- bento: entrances, spotlight, living tiles
  var svc = $('[data-svc]'), svcOn = false;
  $$('[data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 3) * 90 + 'ms'); });
  watch(svc, function (v) { svcOn = v; svc.classList.toggle('on', v); if (v) liveKick(); });
  var rio = io ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var lamp = $('[data-lamp]'), dim = $('[data-dim]');
  function setDim() { lamp.style.setProperty('--dim', (dim.value / 100).toFixed(2)); }
  dim.addEventListener('input', setDim); setDim();
  // three phases, 120 degrees apart
  var waves = $$('[data-wave]'), chg = $('[data-chg]').parentNode, chgN = $('[data-chgn]'), meter = $('[data-meter]'), dial = $('[data-dial]');
  function drawWaves(T) {
    waves.forEach(function (p, k) {
      var d = ''; for (var x = 0; x <= 400; x += 8) { var y = 60 + Math.sin(x / 400 * Math.PI * 4 - T * 2.2 + k * 2.0944) * 42; d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1); }
      p.setAttribute('d', d);
    });
  }
  var liveRaf = 0, lt0 = performance.now(), lastMeter = 0;
  function live(t) {
    liveRaf = 0;
    var calm = still(), T = (t - lt0) / 1000;
    drawWaves(calm ? 0 : T);
    var c = calm ? 1 : (T % 5) / 4; c = clamp(c, 0, 1);   // the charge fills in four seconds, rests a second
    chg.querySelector('span').style.setProperty('--c', c.toFixed(3)); chgN.textContent = Math.round(c * 100) + '%';
    if (!calm && t - lastMeter > 1600) {
      lastMeter = t;
      var v = [230.4, 229.8, 231.1, 0.0, 230.0][Math.floor(T / 1.6) % 5];
      decodeNum(meter, v.toFixed(1)); dial.style.setProperty('--rot', (v ? 30 : -60) + 'deg');
    }
    if (calm) { meter.textContent = '230.0'; return; }
    if (svcOn) liveRaf = requestAnimationFrame(live);
  }
  function decodeNum(el, txt) {
    var n = 0; clearInterval(el._d);
    el._d = setInterval(function () { n++; el.textContent = txt.split('').map(function (ch, i) { return i < n / 2 || ch === '.' ? ch : Math.floor(Math.random() * 10); }).join(''); if (n / 2 >= txt.length) clearInterval(el._d); }, 30);
  }
  function liveKick() { if (!liveRaf) liveRaf = requestAnimationFrame(live); }
  drawWaves(0);

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    watch(o, function (v) { roll(o, v || still()); }, { threshold: .3 });
  });

  // ---------------------------------------------------------------- pendants drop and switch on (and lift again when you scroll back up)
  var pds = $$('[data-pd]');
  pds.forEach(function (p, i) {
    p.style.setProperty('--k', phone() ? 0 : i);
    watch(p, function (v) {
      if (v) { p.classList.add('in'); setTimeout(function () { if (p.classList.contains('in')) p.classList.add('on'); }, still() ? 0 : 700 + (phone() ? 0 : i * 120)); }
      else if (p.getBoundingClientRect().top > 0) { p.classList.remove('in', 'on'); }
    }, { rootMargin: '0px 0px -10% 0px' });
  });

  // ---------------------------------------------------------------- composer: tapes in, label tape out
  var jobs = $$('[data-job]'), places = $$('[data-where]'), msgEl = $('[data-msg]'), printer = $('[data-printer]'), shown = '', typing = 0, seen = false;
  jobs.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); write(); }); });
  places.forEach(function (b) { b.addEventListener('click', function () { places.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write(); }); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = jobs.filter(function (n) { return n.getAttribute('aria-pressed') === 'true'; }).map(function (n) { return n.dataset[l ? 'he' : 'en']; });
    var w = places.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0].dataset[l ? 'he' : 'en'];
    return l ? 'שלום רועי, אשמח לדבר איתך על ' + (picked.length ? list(picked, true) : 'עבודת חשמל') + ' ' + w + ', בקריית אתא או בסביבה.'
             : 'Hi Roy, I’d like to talk to you about ' + (picked.length ? list(picked, false) : 'some electrical work') + ' ' + w + ', in or near Kiryat Ata.';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !seen) { shown = target; msgEl.textContent = target; printer.classList.remove('busy'); return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    printer.classList.add('busy');
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st); else printer.classList.remove('busy');
    })(t0);
  }
  watch(printer, function (v) { if (v && !seen) { seen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- footer downlights
  var foot = $('[data-foot]');
  $$('.f-lights i').forEach(function (l, i) { l.style.setProperty('--k', i); });
  watch(foot, function (v) { foot.classList.toggle('on', v); }, { threshold: .25 });
  function fit() {
    var f = $('[data-fit]'), sp = $('span[lang="' + root.lang + '"]', f);
    f.style.fontSize = '100px';
    var w = sp.getBoundingClientRect().width || 1, avail = foot.clientWidth - 2 * parseFloat(getComputedStyle(foot).paddingLeft);
    f.style.fontSize = Math.min(260, Math.floor(100 * avail / w * .98)) + 'px';
  }

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var light = $('[data-light]'), llit = $('[data-llit]'), ldraw = $('[data-ldraw]'), lsteps = $$('[data-lsteps] li'), mks = $$('[data-mk]'), gls = $$('[data-gl]'), laser = $('[data-laser]');
  var contact = $('[data-contact]'), cphoto = $('[data-cphoto]');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    plate.classList.toggle('show', scrollY > vh * .6 && foot.getBoundingClientRect().top > vh * .55);
    // the hero: as you leave, the laser line drops down the photo and the light goes out above it
    var hr = hero.getBoundingClientRect(), hp = calm ? 0 : clamp(-hr.top / hr.height, 0, 1);
    var h1 = $('.h-name'), base = h1.getBoundingClientRect().bottom - hr.top + 4;
    laser.style.setProperty('--ly', lerp(base, hr.height - 2, hp).toFixed(1) + 'px');
    hphoto.style.transform = calm ? '' : 'scale(' + (1 + hp * .06).toFixed(4) + ')';
    // signature: measure, mark, wire, light
    var p = calm ? 1 : prog(light);
    var lz = smooth(p / .22), lzo = calm ? .35 : lerp(.95, .3, smooth((p - .6) / .25));
    ldraw.style.setProperty('--lz', lz.toFixed(3)); ldraw.style.setProperty('--lzo', lzo.toFixed(3));
    mks.forEach(function (m, i) { var t = smooth((p - .2 - i * .07) / .12); m.style.setProperty('--o', t.toFixed(3)); m.style.setProperty('--s', lerp(2.2, 1, t).toFixed(3)); m.style.opacity = (t * (1 - smooth((p - .78) / .15) * .7)).toFixed(3); });
    gls.forEach(function (g, i) { var t = smooth((p - .52 - i * .06) / .1); g.style.opacity = (t * .9).toFixed(3); });
    var lit = smooth((p - .55) / .3);
    llit.style.setProperty('--lit', lit.toFixed(3)); llit.style.setProperty('--lr', lerp(.25, 1.2, lit).toFixed(3));
    var stage = p < .2 ? 0 : p < .45 ? 1 : p < .6 ? 2 : 3;
    lsteps.forEach(function (li, i) { li.classList.toggle('on', calm || i <= stage); });
    // contact: a laser line uncovers the photo from the top
    var cr = cphoto.getBoundingClientRect(), cp = calm ? 1 : smooth((vh - cr.top) / (cr.height + vh * .2));
    cphoto.style.setProperty('--rv', (cp * 100).toFixed(2) + '%'); cphoto.style.setProperty('--lo', calm || cp >= 1 || cp <= 0 ? 0 : 1);
  }

  function layout() { cbh(); placeSpots(); fit(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout(); liveKick();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(); });
  addEventListener('load', layout);
})();
