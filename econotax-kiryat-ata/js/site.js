(function () {
  var root = document.documentElement, WA = '972522550515';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var TITLE = { he: 'Econotax · ייעוץ מס וכלכלה · ז\'בוטינסקי 4, קריית אתא', en: 'Econotax · Tax & economic advice · 4 Jabotinsky St, Kiryat Ata' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Econotax LTD · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Econotax LTD · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לשלומי, 052-255-0515', 'Call Shlomi, 052-255-0515');
    aria('[data-t-wa]', 'וואטסאפ לשלומי', 'WhatsApp Shlomi');
    aria('[data-t-topic]', 'נושא', 'Topic');
    aria('[data-t-who]', 'מי אתם', 'Who you are');
    aria('[data-set-lang]', 'English', 'עברית');
    $('[data-t-map]').title = l === 'he' ? 'מפה: ז\'בוטינסקי 4, קריית אתא' : 'Map: 4 Jabotinsky St, Kiryat Ata';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ecx-lang', l); } catch (e) {}
    texts(l); hours(); week(); write(true); typer.reset(); tick();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('ecx-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    logo.kick(); typer.reset(); layout();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9, 17], 1: [9, 17], 2: [9, 17], 3: [9, 17], 4: [9, 17], 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
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
    $$('[data-week] span').forEach(function (s, i) { s.classList.toggle('today', i === n.d); });
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
  // the week tile: seven coins, the working days in the logo's amber
  function week() {
    var s = he() ? ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    $('[data-week]').innerHTML = s.map(function (d, i) { return '<span style="--k:' + i + '"' + (H[i] ? ' class="work"' : '') + '>' + d + '</span>'; }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento,.v-bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- headline: letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = sp.closest('.ln').previousElementSibling ? 14 : 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  var hero = $('[data-hero]'), nav = $('[data-nav]');

  // ---------------------------------------------------------------- the real logo, assembled out of its own pixels;
  // they scatter under the hand or a tap and fly up toward the coin as you scroll, then the real file shows again
  var logo = (function () {
    var box = $('.h-logo'), cv = $('[data-logofield]'), c = cv.getContext('2d'), img = $('[data-logosrc]');
    var P = [], w, h, ox, oy, lw, lh, raf = 0, vis = true, t0 = 0, mx = -999, my = -999, ok = false, calmSince = 0, lastMove = 0;
    var NAVY = [0, 20, 79];
    function sample() {
      try {
        var iw = 420, ih = 85, sc = document.createElement('canvas'); sc.width = iw; sc.height = ih;
        var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, iw, ih);
        var d = sx.getImageData(0, 0, iw, ih).data, pts = [];
        for (var y = 0; y < ih; y++) for (var x = 0; x < iw; x++) {
          var k = (y * iw + x) * 4, diff = Math.abs(d[k] - NAVY[0]) + Math.abs(d[k + 1] - NAVY[1]) + Math.abs(d[k + 2] - NAVY[2]);
          if (diff > 200 && (x + y) % 2 === 0) pts.push([x / iw, y / ih, 'rgb(' + d[k] + ',' + d[k + 1] + ',' + d[k + 2] + ')']);
        }
        var want = phone() ? 1700 : 3200, stp = Math.max(1, pts.length / want); P = [];
        for (var f = 0; f < pts.length; f += stp) { var q = pts[Math.floor(f)]; P.push({ hx: q[0], hy: q[1], col: q[2], x: Math.random(), y: Math.random() * 2 - .5, vx: 0, vy: 0, dl: Math.random() * .6, ph: Math.random() * 6.28, sx: undefined }); }
        ok = P.length > 50;
      } catch (e) { ok = false; }
    }
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      lw = img.clientWidth || box.clientWidth; lh = lw * 255 / 1260; ox = (w - lw) / 2; oy = (h - lh) / 2;
    }
    function frame(now) {
      raf = 0; if (!ok) return;
      if (still()) { c.clearRect(0, 0, w, h); box.classList.remove('live'); return; }
      var T = (now - t0) / 1000, hr = hero.getBoundingClientRect(), burst = clamp(-hr.top / (hr.height * .6), 0, 1.3), moving = 0;
      c.clearRect(0, 0, w, h);
      var sz = phone() ? 1.7 : 1.9;
      for (var i = 0; i < P.length; i++) {
        var p = P[i], a = smooth((T - p.dl) / 1.1);
        var tx = ox + p.hx * lw, ty = oy + p.hy * lh;
        if (burst > 0) { tx += Math.sin(p.ph) * burst * w * .35; ty -= burst * (h * .8 + p.ph * 30); }
        if (a < 1) { if (p.sx === undefined) { p.sx = p.x * w; p.sy = p.y * h; } p.x = lerp(p.sx, tx, a); p.y = lerp(p.sy, ty, a); moving++; }
        else {
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 6400) { var f = (6400 - d2) / 6400 * 3, dd = Math.sqrt(d2) || 1; p.vx += dx / dd * f; p.vy += dy / dd * f; }
          p.vx += (tx - p.x) * .07; p.vy += (ty - p.y) * .07; p.vx *= .8; p.vy *= .8; p.x += p.vx; p.y += p.vy;
          if (Math.abs(p.x - tx) + Math.abs(p.y - ty) > .6) moving++;
        }
        c.globalAlpha = 1 - clamp(burst, 0, 1) * .5; c.fillStyle = p.col; c.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
      }
      c.globalAlpha = 1;
      // once every pixel is home and the hand has moved on, the real logo file takes over (crisp, as-is)
      if (moving < 4 && burst === 0 && now - lastMove > 600) { if (!calmSince) calmSince = now; } else calmSince = 0;
      if (calmSince && now - calmSince > 250) { box.classList.remove('live'); c.clearRect(0, 0, w, h); return; }
      box.classList.add('live');
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (ok && !raf && !still()) raf = requestAnimationFrame(frame); if (still()) { box.classList.remove('live'); c.clearRect(0, 0, w || 0, h || 0); } }
    function start() { size(); sample(); t0 = performance.now(); if (!still()) box.classList.add('live'); kick(); }
    function at(e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; lastMove = performance.now(); }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; at(e); var r = cv.getBoundingClientRect(); if (my > -40 && my < r.height + 40) kick(); });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    hero.addEventListener('pointerdown', function (e) { at(e); P.forEach(function (p) { var dx = p.x - mx, dy = p.y - my, d = Math.sqrt(dx * dx + dy * dy) || 1; if (d < 160) { p.vx += dx / d * 14; p.vy += dy / d * 14; } }); kick(); setTimeout(function () { mx = my = -999; }, 120); });
    watch(hero, function (v) { vis = v; kick(); });
    if (img.complete && img.naturalWidth) setTimeout(start, 0); else img.addEventListener('load', start, { once: true });
    return { kick: kick, size: function () { if (ok) { size(); kick(); } } };
  })();

  // ---------------------------------------------------------------- hero: the town tilts toward the hand; on phones it drifts by itself
  var lastHand = 0, heroVis = true, amb = 0;
  hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse' || still()) return; lastHand = performance.now(); hero.style.setProperty('--px', ((e.clientX / innerWidth) * 2 - 1).toFixed(3)); });
  watch(hero, function (v) { heroVis = v; if (v) ambient(); });
  function ambient() {
    if (amb) return;
    amb = requestAnimationFrame(function loop(t) {
      amb = 0; if (!heroVis || still()) { if (still()) hero.style.setProperty('--px', '0'); return; }
      if (t - lastHand > 2500) hero.style.setProperty('--px', (Math.sin(t / 3200) * .6).toFixed(3));
      amb = requestAnimationFrame(loop);
    });
  }

  // ---------------------------------------------------------------- the letter: phrases decode out of scrambled letters
  var GLY = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHKLMNOPRSTUVWXYZ' };
  function decode(el) {
    var sp = $('span[lang="' + root.lang + '"]', el.querySelector('q')); if (!sp) return;
    if (!sp.dataset.txt) sp.dataset.txt = sp.textContent;
    var txt = sp.dataset.txt, g = GLY[root.lang], t0 = performance.now(), dur = 700;
    cancelAnimationFrame(el._r);
    if (still()) { sp.textContent = txt; return; }
    (function st(t) {
      var k = (t - t0) / dur, n = Math.floor(k * txt.length), out = '';
      for (var i = 0; i < txt.length; i++) out += i < n || txt[i] === ' ' ? txt[i] : g[Math.floor(Math.random() * g.length)];
      sp.textContent = out;
      if (k < 1) el._r = requestAnimationFrame(st); else sp.textContent = txt;
    })(t0);
  }
  var words = $$('[data-word]');

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 120) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- bento: a spotlight under the hand, the photo tilts toward it
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) {
      var r = t.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      t.style.setProperty('--mx', x + 'px'); t.style.setProperty('--my', y + 'px');
      if (t.hasAttribute('data-tilt') && !still()) { t.style.setProperty('--tx', ((x / r.width - .5) * 8).toFixed(2) + 'deg'); t.style.setProperty('--ty', ((.5 - y / r.height) * 8).toFixed(2) + 'deg'); }
    });
    t.addEventListener('pointerleave', function () { t.style.setProperty('--tx', '0deg'); t.style.setProperty('--ty', '0deg'); });
  });

  // a WhatsApp bubble that types a few real kinds of first messages, while it is on screen
  var typer = (function () {
    var el = $('[data-typer]'), tile = $('.t-chat'), on = false, timer = 0, m = 0, i = 0, dir = 1;
    var MSG = { he: ['שלום שלומי, יש לי שאלה על הדוח השנתי.', 'היי שלומי, אפשר לקבוע שיחה השבוע?', 'שלום שלומי, אני לפני פתיחת עסק ויש לי כמה שאלות.'],
                en: ['Hi Shlomi, I have a question about my annual report.', 'Hi Shlomi, could we set up a call this week?', 'Hi Shlomi, I’m about to open a business and have a few questions.'] };
    function step() {
      timer = 0; if (!on || still()) return;
      var s = MSG[root.lang][m];
      i += dir; el.textContent = s.slice(0, i);
      var wait = 38;
      if (dir > 0 && i >= s.length) { dir = -1; wait = 2400; }
      else if (dir < 0 && i <= 0) { dir = 1; m = (m + 1) % MSG[root.lang].length; wait = 500; }
      else if (dir < 0) wait = 14;
      timer = setTimeout(step, wait);
    }
    watch(tile, function (v) { on = v; if (v && !timer) step(); });
    return { reset: function () { clearTimeout(timer); timer = 0; m = 0; i = 0; dir = 1; el.textContent = still() ? MSG[root.lang][0] : ''; if (on && !still()) step(); } };
  })();

  // ---------------------------------------------------------------- write to Shlomi: the note writes itself in the envelope's window
  var topics = $$('[data-topic]'), whos = $$('[data-who]'), steps = $$('[data-step]'), msgEl = $('[data-msg]'), send = $('[data-send]'), mail = $('.mail');
  var shown = '', typing = 0, chatSeen = false;
  function lightStep(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  topics.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); lightStep(0); write(); }); });
  whos.forEach(function (b) { b.addEventListener('click', function () { whos.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); lightStep(1); write(); }); });
  send.addEventListener('pointerenter', function () { lightStep(2); });
  send.addEventListener('focus', function () { lightStep(2); });
  send.addEventListener('click', function () { lightStep(2); mail.classList.add('sealed'); setTimeout(function () { mail.classList.remove('sealed'); }, 3200); });
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = topics.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.dataset[l ? 'he' : 'en']; });
    var w = whos.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0], who = w ? w.dataset[l ? 'he' : 'en'] : '';
    return l ? 'שלום שלומי, הגעתי דרך האתר. ' + (picked.length ? 'יש לי שאלה בנושא ' + list(picked, true) + '. ' : 'אשמח להתייעץ איתך. ') + who
             : 'Hi Shlomi, I found you through the website. ' + (picked.length ? 'I have a question about ' + list(picked, false) + '. ' : 'I’d like to consult with you. ') + who;
  }
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 14);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-wenv]'), function (v) { if (v && !chatSeen) { chatSeen = true; if (!still()) { shown = ''; msgEl.textContent = ''; } write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var env = $('[data-env]'), envelope = $('[data-envelope]'), letter = $('[data-letter]'), seal = $('[data-seal]'), flap = $('[data-flap]'), stamp = $('[data-stamp]');
  var wr = $('[data-write]'), wedge = $('[data-wedge]'), bars = $$('[data-bar]'), barsBox = $('.bars'), bcoin = $('[data-bcoin]');
  var iris = $('[data-iris]'), irisFig = $('[data-irisfig]'), irisCopy = $('.iris-copy'), foot = $('[data-foot]'), fcoin = $('[data-fcoin]'), flogo = $('[data-flogo]');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    // hero: the coin climbs into the sky as you leave
    var hr = hero.getBoundingClientRect();
    hero.style.setProperty('--rise', calm ? '0' : clamp(-hr.top / hr.height, 0, 1).toFixed(3));
    if (!calm && hr.bottom > 0) logo.kick();

    // the envelope (t counts screens since the section's top reached the bottom of the window)
    var er = env.getBoundingClientRect(), t = (vh - er.top) / vh;
    if (calm) {
      ['--ey', '--flap', '--seal', '--sealo'].forEach(function (k) { envelope.style.removeProperty(k); });
      ['--ly', '--ls', '--lb', '--stamp', '--stampo'].forEach(function (k) { letter.style.removeProperty(k); });
      letter.style.clipPath = ''; words.forEach(function (wd) { wd.classList.add('on'); });
    } else {
      var a = smooth((t - .1) / .9), b = smooth((t - 1) / .15), c = smooth((t - 1.1) / .25), d = smooth((t - 1.35) / .35), e = smooth((t - 1.7) / .35);
      var EW = envelope.offsetWidth, EH = envelope.offsetHeight, LW = letter.offsetWidth, LH = letter.offsetHeight;
      var ey = (1 - a) * vh * .6 + e * vh * 1.1;
      envelope.style.setProperty('--ey', ey.toFixed(1) + 'px');
      envelope.style.setProperty('--seal', (1 + b * .5).toFixed(3)); envelope.style.setProperty('--sealo', (1 - b).toFixed(3));
      envelope.style.setProperty('--flap', (c * 178).toFixed(1) + 'deg');
      // inside, the letter is folded to the envelope's width; it climbs out, then comes to the middle at full size
      var s0 = Math.min(1, EW * .86 / LW), half = LH * s0 * .5;
      var inY = ey - EH * .42 + half, outY = Math.max(ey - EH * .05 - half, -vh / 2 + 84 + half);
      var ly = lerp(lerp(inY, outY, d), 0, e), ls = lerp(s0, 1, e);
      var cover = smooth((t - 2.6) / 1);
      letter.style.setProperty('--ly', ly.toFixed(1) + 'px');
      letter.style.setProperty('--ls', (ls * (1 - cover * .06)).toFixed(4));
      letter.style.setProperty('--lb', (1 - cover * .45).toFixed(3));
      // the envelope's front pocket hides the part of the letter still inside it
      var lr = letter.getBoundingClientRect(), pocket = vh / 2 + ey - EH * .5 + EH * .3, hidden = clamp(lr.bottom - pocket, 0, lr.height);
      letter.style.clipPath = d <= 0 ? 'inset(0 0 100% 0)' : hidden > 0 && e < 1 ? 'inset(0 0 ' + (hidden / (lr.height / LH)).toFixed(1) + 'px 0)' : '';
      words.forEach(function (wd, i) { var on = t > 1.8 + i * .06; if (on && !wd.classList.contains('on')) { wd.classList.add('on'); decode(wd); } else if (!on) wd.classList.remove('on'); });
      var sp = smooth((t - 2.15) / .12);
      letter.style.setProperty('--stamp', (2.4 - sp * 1.4).toFixed(3)); letter.style.setProperty('--stampo', sp.toFixed(3));
    }

    // the amber wedge of the logo sweeps the write section in and settles in its corner
    var wrr = wr.getBoundingClientRect(), wp = calm ? 1 : smooth((vh - wrr.top) / (vh * .95));
    if (!calm) {
      var R = rtl();
      wedge.style.setProperty('--wa', lerp(0, R ? 0 : 88, wp).toFixed(2) + '%');
      wedge.style.setProperty('--wb', lerp(100, R ? 12 : 100, wp).toFixed(2) + '%');
      wedge.style.setProperty('--wc', lerp(50, R ? 0 : 100, wp).toFixed(2) + '%');
      wedge.style.setProperty('--wh', lerp(100, 22, wp).toFixed(2) + '%');
    } else ['--wa', '--wb', '--wc', '--wh'].forEach(function (k) { wedge.style.removeProperty(k); });

    // the three bars run out of the coin, one after another
    var br = barsBox.getBoundingClientRect(), q = calm ? 1 : clamp((vh * .92 - br.top) / (br.height * .9 + vh * .15), 0, 1);
    bars.forEach(function (bar, i) {
      var g = calm ? 1 : smooth((q - i * .17) / .45);
      bar.style.setProperty('--g', (calm ? 1 : .03 + g * .97).toFixed(4));
      bar.style.setProperty('--go', calm ? '1' : smooth((g - .88) / .12).toFixed(3));
    });
    bcoin.style.setProperty('--bspin', calm ? '0' : (q * -.5).toFixed(3));

    // the coin opens like an iris onto Kiryat Ata
    var ir = iris.getBoundingClientRect(), ip = calm ? 1 : smooth(-ir.top / Math.max(1, ir.height - vh));
    var minR = Math.min(innerWidth, vh) * (phone() ? .3 : .24), maxR = Math.hypot(innerWidth, vh) * .6;
    irisFig.style.setProperty('--ir', calm ? '150%' : lerp(minR, maxR, ip).toFixed(1) + 'px');
    irisFig.style.setProperty('--iz', calm ? '1' : lerp(1.35, 1, ip).toFixed(3));
    irisCopy.style.setProperty('--icy', calm ? '0px' : ((1 - ip) * 40).toFixed(1) + 'px');

    // footer: the coin sets into the town and the name rises letter by letter
    var fr = foot.getBoundingClientRect(), fp = calm ? 1 : clamp((vh - fr.top) / Math.min(fr.height, vh), 0, 1);
    fcoin.style.setProperty('--set', (fp * Math.min(foot.offsetHeight * .3, phone() ? 0 : 220)).toFixed(1) + 'px');
    var fv = calm ? 1 : smooth((fp - .25) / .6); flogo.style.setProperty('--fc', ((1 - fv) * 100).toFixed(1) + '%'); flogo.style.setProperty('--fy', ((1 - fv) * 40).toFixed(1) + 'px');
  }

  // the curtain footer only when it fits the window
  function curtain() { var fit = foot.offsetHeight < innerHeight - 20; root.classList.toggle('curtain', fit && !still()); }
  function layout() { logo.size(); curtain(); tick(); ambient(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); week(); write(true); typer.reset(); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { logo.size(); curtain(); tick(); });
})();
