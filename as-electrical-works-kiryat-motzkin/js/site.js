(function () {
  var root = document.documentElement, WA = '972506265109';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var TITLE = { he: 'AS עבודות חשמל · חשמלאי ראשי והנדימן · שדרות בן גוריון 74, קריית מוצקין', en: 'AS Electrical Works · Master electrician & handyman · 74 Ben Gurion Blvd, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור AS- עבודות חשמל, חשמלאי ראשי והנדימן · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for AS Electrical Works, master electrician & handyman · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'AS עבודות חשמל', 'AS Electrical Works');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו ל-AS, 050-626-5109', 'Call AS, 050-626-5109');
    aria('[data-t-wa]', 'וואטסאפ ל-AS', 'WhatsApp AS');
    aria('[data-t-what]', 'מה צריך', 'What you need');
    aria('[data-t-when]', 'מתי נוח', 'Good time');
    aria('[data-test]', 'כפתור בדיקה T', 'Test button T');
    aria('[data-lever]', 'ידית הפחת', 'RCD lever');
    aria('.mod .stars', '5 כוכבים', '5 stars');
    $$('.pin').forEach(function (p) { if (p.classList.contains('on')) $('.tag', p).textContent = p.dataset[l]; });
    rcdMsg();
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('as850-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('as850-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-mod]').forEach(function (el) { el.classList.add('in'); });
    layout(); ring.kick(); sparks.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [8, 20], 1: [8, 20], 2: [8, 20], 3: [8, 20], 4: [8, 20], 5: [8, 13], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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
  }
  // consecutive days with the same hours share a row; the week starts on Sunday
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

  // ---------------------------------------------------------------- entrances (reversible: they leave when you scroll back above them)
  $$('.bento [data-tile], .cb [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); });
  $$('[data-mod]').forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 140 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('in'); else if (e.boundingClientRect.top > innerHeight) e.target.classList.remove('in'); });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-mod]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w"' + (/^[A-Za-z]/.test(w) ? ' dir="ltr"' : '') + '>' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]'), dock = $('[data-dock]');

  // ---------------------------------------------------------------- copper sparks rising off the cable's cut face; they lean away from the hand
  var sparks = (function () {
    var cv = $('[data-sparks]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = true, mx = -999, my = -999;
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function spawn() { var a = Math.PI + Math.random() * Math.PI, R = Math.min(1500, innerWidth * 1.7) / 2 * .96; return { x: w / 2 + Math.cos(a) * R * (.2 + Math.random() * .8), y: h + 10 - Math.random() * h * .25, vy: -(.25 + Math.random() * .7), vx: (Math.random() - .5) * .3, life: 0, max: 200 + Math.random() * 260, s: .8 + Math.random() * 1.8 }; }
    function frame() {
      raf = 0; c.clearRect(0, 0, w, h); if (still() || !vis) return;
      var want = phone() ? 40 : 90; while (P.length < want) P.push(spawn());
      c.globalCompositeOperation = 'lighter';
      for (var i = 0; i < P.length; i++) {
        var p = P[i], dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { var f = (14000 - d2) / 14000 * .9, d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f * .4; }
        p.vx *= .96; p.x += p.vx + Math.sin((p.life + i) * .03) * .25; p.y += p.vy; p.life++;
        var a = Math.sin(Math.PI * p.life / p.max);
        c.fillStyle = 'rgba(255,' + (170 + (i % 5) * 12) + ',110,' + (a * .8).toFixed(3) + ')';
        c.beginPath(); c.arc(p.x, p.y, p.s, 0, 6.283); c.fill();
        if (p.life > p.max || p.y < -10) P[i] = spawn();
      }
      c.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    }
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    return { size: function () { size(); P = []; }, kick: kick };
  })();

  // ---------------------------------------------------------------- the arc of their photos: dealt from one stack, then turning with time, scroll and drag
  var ring = (function () {
    var wrap = $('[data-ringwrap]'), el = $('[data-ring]');
    $$('.rc', el).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); $('img', k).alt = ''; el.appendChild(k); });
    var cards = $$('.rc', el), N = cards.length, step = 360 / N, rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = true, last = 0, t0 = 0;
    function R() { var cw = cards[0].offsetWidth || 180; return Math.max(cw * 1.1 / (2 * Math.tan(Math.PI / N)), phone() ? 250 : Math.min(innerWidth * .4, 620)); }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; }); return; }
      if (!t0 && hero.classList.contains('ready')) t0 = t;
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      var deal = t0 ? smooth((t - t0 - 250) / 1300) : 0;
      if (!drag) { rot += (7 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var r = R(), sc = scrollY * .07 * (rtl() ? 1 : -1);
      cards.forEach(function (c, i) {
        var a = (rot + sc) * deal + i * step * deal, f = Math.cos(a * Math.PI / 180), lift = f > .95 ? (f - .95) * 20 : 0;
        var z = lerp(r + 40 - i * 2, r + lift * 46, deal), y = lerp(-i * 3, 0, deal), tilt = lerp((i % 2 ? 4 : -4), 0, deal);
        c.style.transform = 'translate(-50%,-50%) rotateY(' + a.toFixed(2) + 'deg) translateZ(' + z.toFixed(1) + 'px) translateY(' + y.toFixed(1) + 'px) rotate(' + tilt.toFixed(2) + 'deg) scale(' + (1 + lift * .06).toFixed(3) + ')';
        c.style.filter = 'brightness(' + (.28 + .72 * Math.pow(Math.max(f, 0), 1.5)).toFixed(3) + ')';
        c.style.zIndex = Math.round(f * 100) + 100;
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    el.style.transform = 'rotateX(-8deg)';
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .25; vel = dx * 2 * (rtl() ? 1 : -1); });
    addEventListener('pointerup', function () { drag = false; wrap.classList.remove('drag'); });
    watch(hero, function (v) { vis = v; if (v) kick(); });
    return { kick: kick };
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
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 6) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) { roll(o, still() || !io); watch(o, function (v) { if (v || still()) roll(o, true); else if (o.getBoundingClientRect().top > innerHeight) roll(o, false); }, { threshold: .3 }); });

  // ---------------------------------------------------------------- bento: spotlight under the hand
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // RCD tile: press T and the lever drops; lift it and the panel lights again
  var rcd = $('[data-rcd]'), tbtn = $('[data-test]'), lever = $('[data-lever]'), rcdState = 'idle';
  function rcdMsg() {
    var l = he(), m = { idle: ['לחצו על T, כמו בבדיקת פחת.', 'Press T, like an RCD test.'], trip: ['הפחת קפץ. הרימו את הידית.', 'It tripped. Lift the lever.'], back: ['החשמל חזר.', 'Power is back on.'] }[rcdState];
    $('[data-rcdmsg]').textContent = m[l ? 0 : 1];
  }
  function trip() { if (rcdState === 'trip') return; rcdState = 'trip'; rcd.classList.add('trip', 'tested'); lever.setAttribute('aria-pressed', 'false'); rcdMsg(); }
  function reset() { if (rcdState !== 'trip') return; rcdState = 'back'; rcd.classList.remove('trip'); lever.setAttribute('aria-pressed', 'true'); rcdMsg(); }
  tbtn.addEventListener('click', function () { userRcd = true; trip(); });
  lever.addEventListener('click', function () { userRcd = true; if (rcdState === 'trip') reset(); else trip(); });
  var userRcd = false, rcdShown = false;
  watch(rcd, function (v) {   // shows itself once, so the idea is visible without a tap
    if (!v || rcdShown || still()) return; rcdShown = true;
    setTimeout(function () { if (userRcd) return; tbtn.classList.add('press'); setTimeout(function () { tbtn.classList.remove('press'); if (!userRcd) trip(); }, 160); }, 1600);
    setTimeout(function () { if (!userRcd) reset(); }, 3600);
  }, { threshold: .5 });

  // lamp tile: the dimmer drives the real lamp's glow; it sweeps once on arrival
  var lamp = $('[data-lamp]'), dim = $('[data-dim]'), lampShown = false;
  function setDim(v) { lamp.style.setProperty('--dim', (v / 100).toFixed(3)); }
  dim.addEventListener('input', function () { setDim(+dim.value); });
  setDim(+dim.value);
  watch(lamp, function (v) {
    if (!v || lampShown || still()) return; lampShown = true;
    var t0 = performance.now();
    (function st(t) { var u = clamp((t - t0) / 2200, 0, 1), val = Math.round(70 - 55 * Math.sin(u * Math.PI)); dim.value = val; setDim(val); if (u < 1) requestAnimationFrame(st); })(t0);
  }, { threshold: .5 });

  // fan tile: air only while it is on screen
  var fan = $('[data-fan]'); watch(fan, function (v) { fan.classList.toggle('on', v); });

  // level tile: the bubble runs toward the hand; on touch it follows the scroll
  var lvl = $('[data-level]'), bub = $('[data-bub]');
  function bubble(f) { bub.style.transform = 'translateX(' + (clamp(f, -1, 1) * 50).toFixed(1) + 'px)'; }
  var lvlMouse = false;
  lvl.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; lvlMouse = true; var r = lvl.getBoundingClientRect(); bubble(((e.clientX - r.left) / r.width - .5) * 2); });
  lvl.addEventListener('pointerleave', function () { bubble(0); });

  // meter tile: the mains reading drifts by a few tenths while visible
  var volt = $('[data-volt]'), meterOn = false;
  watch($('.t-meter'), function (v) { meterOn = v; });
  setInterval(function () { if (!meterOn || still()) return; volt.textContent = (229.4 + Math.random() * 1.3).toFixed(1); }, 900);

  // ---------------------------------------------------------------- the panel camera
  var zbg = $('[data-zbg]'), zoom = $('[data-zoom]'), cam = $('[data-zcam]'), frameEl = $('[data-zframe]'), pins = $$('.pin'), zsteps = $$('[data-zsteps] li');
  var KEYS = [[0, .5, .5, 1], [.28, .42, .6, 2.1], [.58, .64, .33, 2.5], [.88, .25, .35, 2.2], [1, .25, .35, 2.2]];
  function camAt(p) {
    for (var i = 0; i < KEYS.length - 1; i++) if (p <= KEYS[i + 1][0]) break;
    var a = KEYS[i], b = KEYS[Math.min(i + 1, KEYS.length - 1)], u = smooth((p - a[0]) / Math.max(.001, b[0] - a[0]));
    return { x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), s: lerp(a[3], b[3], u) };
  }
  var GL = '01<>/\\|=+*#%';
  function decode(pin, on) {
    var tag = $('.tag', pin), txt = pin.dataset[he() ? 'he' : 'en'];
    if (on === pin.classList.contains('on')) return;
    pin.classList.toggle('on', on); clearInterval(pin._t);
    if (!on) { tag.textContent = ''; return; }
    if (still()) { tag.textContent = txt; return; }
    var n = 0;
    pin._t = setInterval(function () {
      n++; tag.textContent = txt.split('').map(function (ch, i) { return i < n / 2 || ch === ' ' ? ch : GL[Math.floor(Math.random() * GL.length)]; }).join('');
      if (n / 2 >= txt.length) { clearInterval(pin._t); tag.textContent = txt; }
    }, 28);
  }
  
  // ---------------------------------------------------------------- composer: rocker switches write the WhatsApp message
  var whats = $$('[data-what]'), whens = $$('[data-when]'), steps = $$('[data-step]'), msgEl = $('[data-msg]'), shown = '', typing = 0, chatSeen = false;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  whats.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); lightStep(0); write(); }); });
  whens.forEach(function (b) { b.addEventListener('click', function () { whens.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lightStep(1); write(); }); });
  var send = $('[data-send]');
  ['pointerenter', 'focus'].forEach(function (ev) { send.addEventListener(ev, function () { lightStep(2); }); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = whats.filter(function (n) { return n.getAttribute('aria-pressed') === 'true'; }).map(function (n) { return n.dataset[l ? 'he' : 'en']; });
    var w = whens.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0];
    return l ? 'שלום, הגעתי דרך האתר. אשמח לעזרה ' + (picked.length ? 'עם ' + list(picked, true) : 'בעבודת חשמל') + '. נוח לי לדבר ' + w.dataset.he + '.'
             : 'Hi, I found you through the website. I’d like help ' + (picked.length ? 'with ' + list(picked, false) : 'with some electrical work') + '. ' + w.dataset.en + ' is a good time to talk.';
  }
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
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
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var svc = $('[data-svc]'), strip = $('[data-strip]'), jacket = $('[data-jacket]'), wires = $$('.w'), bento = $('.bento'), foot = $('[data-foot] .f-xsec');
  wires.forEach(function (w) { w.setAttribute('pathLength', '1'); w.style.strokeDasharray = '1 1'; });
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    dock.classList.toggle('show', scrollY > vh * .6);
    if (!calm) { ring.kick(); sparks.kick(); }
    // the jacket is stripped, then the cores run down into the tiles
    var sr = strip.getBoundingClientRect(), sp = calm ? 1 : clamp((vh * .92 - sr.top) / (vh * .62), 0, 1);
    var p1 = smooth(sp / .6), p2 = smooth((sp - .4) / .6);
    jacket.style.transform = 'translateX(' + (p1 * 1320).toFixed(1) + 'px)';
    jacket.style.opacity = (1 - smooth((p1 - .8) / .2)).toFixed(3);
    wires.forEach(function (w, i) { w.style.strokeDashoffset = (1 - lerp(.5 + i * .02, 1, smooth((p2 - i * .06) / .9))).toFixed(4); });
    bento.classList.toggle('live', p2 > .95);
    if (!lvlMouse) bubble(calm ? 0 : Math.sin(scrollY / 160) * .85);
    // the panel camera
    var zp = calm ? 1 : prog(zoom), k = calm ? { x: .5, y: .5, s: 1 } : camAt(zp);
    var W = frameEl.clientWidth, Hh = frameEl.clientHeight;
    var tx = clamp(W / 2 - k.x * W * k.s, W - W * k.s, 0), ty = clamp(Hh / 2 - k.y * Hh * k.s, Hh - Hh * k.s, 0);
    cam.style.transform = calm ? '' : 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + k.s.toFixed(4) + ')';
    cam.style.setProperty('--inv', (1 / k.s).toFixed(4));
    zbg.style.transform = calm ? '' : 'scale(' + (1.25 + (k.s - 1) * .25).toFixed(3) + ') translate(' + ((.5 - k.x) * 18).toFixed(1) + '%,' + ((.5 - k.y) * 18).toFixed(1) + '%)';
    pins.forEach(function (p) { var px = calm ? +p.style.getPropertyValue('--x') : (+p.style.getPropertyValue('--x') * W * k.s + tx) / W; p.classList.toggle('flip', px > .5); });
    var stage = calm ? 3 : zp < .14 ? -1 : zp < .45 ? 0 : zp < .74 ? 1 : 2;
    pins.forEach(function (p) { var s = +p.dataset.pin; decode(p, calm ? true : s === stage); });
    zsteps.forEach(function (li, i) { li.classList.toggle('on', calm || i <= stage); });
    // the footer's cable face rises as you arrive
    var fr = foot.parentNode.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / fr.height);
    foot.style.setProperty('--rise', ((1 - fp) * 120).toFixed(1) + 'px');
  }

  function layout() { sparks.size(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); ring.kick(); sparks.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 300);
  addEventListener('load', tick);
})();
