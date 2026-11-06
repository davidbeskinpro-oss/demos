(function () {
  var root = document.documentElement, WA = '972508105323';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 820; };
  var TITLE = { he: 'גבי אספקה · מנעולים, מפתחות ושלטים · שד׳ חן 5, קריית ביאליק', en: 'Gabi Supply · Locks, keys and remotes · 5 Chen Blvd, Kiryat Bialik' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור גבי אספקה · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Gabi Supply · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'גבי אספקה', 'Gabi Supply');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'התקשרו לגבי, 050-810-5323', 'Call Gabi, 050-810-5323');
    aria('[data-t-wa]', 'וואטסאפ לגבי', 'WhatsApp Gabi');
    aria('[data-t-tabs]', 'לאן', 'What for');
    aria('[data-t-keys]', 'מה צריך', 'What you need');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-prev]', 'שלב קודם', 'Previous step');
    aria('[data-t-next]', 'שלב הבא', 'Next step');
    aria('.stars', '5 כוכבים', '5 stars');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: שד׳ חן 5, קריית ביאליק' : 'Map: 5 Chen Blvd, Kiryat Bialik'; });
    $$('.rc.live').forEach(function (c, i) { c.setAttribute('aria-label', i ? (l === 'he' ? 'סוללה לשלט' : 'Remote battery') : (l === 'he' ? 'שלט לשער' : 'Gate remote')); });
    $('.v-bio').setAttribute('aria-label', l === 'he' ? 'שרטוט של ידית ביומטרית עם קורא טביעת אצבע' : 'Drawing of a biometric handle with a fingerprint reader');
    $$('.spot').forEach(function (s) { s.setAttribute('aria-label', s.dataset[l]); if (s.classList.contains('on')) $('.tag', s).textContent = s.dataset[l]; });
    $$('[data-glyph]').forEach(function (g) { g.textContent = g.dataset[l]; });
    split();
    tabDesc();
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('gabi-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('gabi-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $('[data-fword]').classList.add('in');
    layout(); ring.kick(); dust.kick(); setStage(still() ? cpStill : stage, true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours: live status (Israel time) and the weekly slip. null = closed
  var H = { 0: [9, 17], 1: [9, 17], 2: [9, 17], 3: [9, 17], 4: [9, 17], 5: [9, 13], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', +r.dataset.day === n.d); });
  }
  function hrs(n) { return he() ? n + ' ש׳' : n + ' h'; }
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, total = 0, rows = '';
    for (var d = 0; d < 7; d++) {
      var t = H[d], len = t ? t[1] - t[0] : 0; total += len;
      rows += '<tr data-day="' + d + '"' + (t ? '' : ' class="closed"') + '><td>' + names[d] + '</td><td>' + (t ? '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>' : (l ? 'סגור' : 'Closed')) +
        '</td><td class="lead-dots"><span></span></td><td>' + hrs(len) + '</td></tr>';
    }
    $('[data-hours]').innerHTML = rows;
    $('.r-total b').textContent = hrs(total);   // the slip really sums to the total shown
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', i * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-fword]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- the name, split into letters (sign panel + footer)
  function split() {
    $$('.p-name > span[lang], [data-fword] > span[lang]').forEach(function (sp) {
      if (!sp.dataset.txt) sp.dataset.txt = sp.textContent;
      var i = 0;
      sp.innerHTML = sp.dataset.txt.split('').map(function (c) { return c === ' ' ? ' ' : '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('');
    });
  }

  var hero = $('[data-hero]'), hphoto = $('[data-hphoto]'), nav = $('[data-nav]'), fob = $('[data-fob]');

  // ---------------------------------------------------------------- hero light: a spotlight follows the hand; on a phone it wanders by itself and jumps to a tap
  var spot = { x: .62, y: .4, tx: .62, ty: .4, user: 0 };
  hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = hero.getBoundingClientRect(); spot.tx = (e.clientX - r.left) / r.width; spot.ty = (e.clientY - r.top) / r.height; spot.user = performance.now(); });
  hero.addEventListener('pointerdown', function (e) { var r = hero.getBoundingClientRect(); spot.tx = (e.clientX - r.left) / r.width; spot.ty = (e.clientY - r.top) / r.height; spot.user = performance.now(); });

  // dust drifting through the light, as in a shop doorway
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), P = [], w, h, raf = 0, vis = true, t0 = performance.now();
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      P = []; var n = phone() ? 70 : 140;
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 1.8, vx: (Math.random() - .5) * .25, vy: -.08 - Math.random() * .3, ph: Math.random() * 6.28 });
    }
    function frame(t) {
      raf = 0;
      var T = (t - t0) / 1000;
      if (performance.now() - spot.user > 2500) { spot.tx = .5 + Math.sin(T * .35) * .26; spot.ty = .42 + Math.sin(T * .52 + 1) * .16; }
      spot.x = lerp(spot.x, spot.tx, .07); spot.y = lerp(spot.y, spot.ty, .07);
      hphoto.style.setProperty('--mx', (spot.x * 100).toFixed(2) + '%'); hphoto.style.setProperty('--my', (spot.y * 100).toFixed(2) + '%');
      hphoto.style.setProperty('--rad', Math.round(Math.max(170, Math.min(w, 1600) * (phone() ? .42 : .2))) + 'px');
      c.clearRect(0, 0, w, h);
      var sx = spot.x * w, sy = spot.y * h, R = Math.max(220, w * .22);
      for (var i = 0; i < P.length; i++) {
        var p = P[i]; p.x += p.vx + Math.sin(T + p.ph) * .15; p.y += p.vy;
        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; } if (p.x < -5) p.x = w + 5; if (p.x > w + 5) p.x = -5;
        var d = Math.hypot(p.x - sx, p.y - sy), a = clamp(1 - d / R, 0, 1);
        if (a <= 0) continue;
        c.globalAlpha = a * .8; c.fillStyle = '#ffe9a8'; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
      }
      c.globalAlpha = 1;
      if (vis && !still()) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); if (still()) { c.clearRect(0, 0, w || 0, h || 0); hphoto.style.setProperty('--mx', '55%'); hphoto.style.setProperty('--my', '38%'); } }
    watch(hero, function (v) { vis = v; kick(); });
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // labels typed onto the photo, mapped onto the cover-cropped image
  var spots = $$('.spot');
  function placeSpots() {
    var W = hphoto.clientWidth, Hh = hphoto.clientHeight, iw = 1600, ih = 747, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s;
    var ox = (W - dw) * (phone() ? .52 : .5), oy = (Hh - dh) * (phone() ? .4 : .45), panel = $('[data-panel]').getBoundingClientRect(), hr = hero.getBoundingClientRect();
    spots.forEach(function (sp) {
      var x = ox + dw * +sp.dataset.x, y = oy + dh * +sp.dataset.y;
      sp.style.left = x + 'px'; sp.style.top = y + 'px';
      sp.classList.toggle('flip', rtl() ? x < W * .4 : x > W * .6);
      var py = panel.top - hr.top, px0 = panel.left - hr.left, px1 = panel.right - hr.left;
      sp.hidden = x < 14 || x > W - 14 || y < 90 || y > Hh - 14 || (y > py - 20 && x > px0 - 10 && x < px1 + 10);
    });
  }
  function typeTag(sp, on) {
    var tag = $('.tag', sp), txt = sp.dataset[he() ? 'he' : 'en'];
    if (on === sp.classList.contains('on')) return;
    sp.classList.toggle('on', on); clearInterval(sp._t);
    if (!on) { tag.textContent = ''; return; }
    if (still()) { tag.textContent = txt; return; }
    var i = 0; tag.textContent = '';
    sp._t = setInterval(function () { tag.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(sp._t); }, 45);
  }
  spots.forEach(function (sp) { sp.addEventListener('click', function () { typeTag(sp, !sp.classList.contains('on')); }); });
  function showSpots() { spots.forEach(function (sp, i) { setTimeout(function () { typeTag(sp, true); }, still() ? 0 : 2200 + i * 380); }); }

  // ---------------------------------------------------------------- the ring of shelf cards: turns by itself, with the scroll and a drag; the tabs bring a card to the front
  var DESC = {
    car: { he: 'מפתחות ושלטים לרכב, גם מפתחות חכמים.', en: 'Car keys and remotes, smart keys too.' },
    home: { he: 'שכפול מפתחות וצילינדרים לדלת הבית.', en: 'Key copies and cylinders for the front door.' },
    gate: { he: 'שלטים לשערים חשמליים, וסוללות לשלטים.', en: 'Remotes for electric gates, and batteries for them.' }
  };
  var curTab = 'car';
  function tabDesc() {
    $('[data-desc]').textContent = DESC[curTab][he() ? 'he' : 'en'];
    var msg = he() ? 'שלום גבי, יש לי שאלה על ' + { car: 'מפתח לרכב', home: 'מפתח לבית', gate: 'שלט לשער' }[curTab] + '.' : 'Hi Gabi, I have a question about ' + { car: 'a car key', home: 'a home key', gate: 'a gate remote' }[curTab] + '.';
    $('[data-wa-tab]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
  }
  var ring = (function () {
    var wrap = $('[data-ringwrap]'), el = $('[data-ring]'), cards = $$('.rc', el), N = cards.length, step = 360 / N;
    var rot = 0, vel = 0, drag = false, lx = 0, raf = 0, vis = false, last = 0, target = null, hold = 0;
    function R() { var cw = cards[0].offsetWidth || 180; return Math.max(cw * 1.1 / (2 * Math.tan(Math.PI / N)), phone() ? 230 : 300); }
    function frame(t) {
      raf = 0; if (still()) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; }); return; }
      var dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
      if (target !== null) { var d = ((target - rot) % 360 + 540) % 360 - 180; rot += d * Math.min(1, dt * 5); if (Math.abs(d) < .3) target = null; }
      else if (!drag && t > hold) { rot += (7 + vel) * dt * (rtl() ? 1 : -1); vel *= .94; }
      var r = R(), sc = target === null && t > hold ? 0 : 0;
      cards.forEach(function (c, i) {
        var a = rot + sc + i * step, f = Math.cos(a * Math.PI / 180), lift = f > .92 ? (f - .92) * 12.5 : 0;
        c.style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + (r + lift * 40).toFixed(1) + 'px) scale(' + (1 + lift * .08).toFixed(3) + ')';
        c.style.filter = 'brightness(' + (.28 + .72 * Math.pow(Math.max(f, 0), 1.5)).toFixed(3) + ')';
        c.style.zIndex = Math.round(f * 100) + 100;
      });
      if (vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    el.style.transform = 'rotateX(-6deg)';
    wrap.addEventListener('pointerdown', function (e) { if (still()) return; drag = true; target = null; lx = e.clientX; wrap.classList.add('drag'); });
    addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .3; vel = Math.abs(dx) * 1.5; });
    addEventListener('pointerup', function () { if (drag) { drag = false; wrap.classList.remove('drag'); hold = performance.now() + 1500; } });
    watch(wrap, function (v) { vis = v; if (v) kick(); });
    function front(key) {
      var i = cards.findIndex(function (c) { return c.dataset.card === key; });
      if (i < 0) return;
      if (still()) { cards[i].scrollIntoView({ block: 'nearest', inline: 'center' }); return; }
      target = -i * step; hold = performance.now() + 4000; kick();
    }
    return { kick: kick, front: front };
  })();
  $$('[data-tab]').forEach(function (b) { b.addEventListener('click', function () {
    $$('[data-tab]').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
    curTab = b.dataset.tab; tabDesc(); ring.front(curTab);
  }); });

  // ---------------------------------------------------------------- the second key: scroll moves through four stages (motion on); arrows and steps (motion off)
  var copy = $('[data-copy]'), steps = $$('[data-step]'), stage = -1, cpStill = 0, bit = $('.cp-bit'), path = $('.cp-path'), codeEl = $('[data-code]');
  var GL = '0123456789ABCDEF#%*';
  function decode(el, txt) {
    clearInterval(el._t);
    if (still()) { el.textContent = txt; return; }
    var n = 0; el._t = setInterval(function () {
      n++; el.textContent = txt.split('').map(function (c, i) { return c === ' ' || i < n / 2 ? c : GL[Math.floor(Math.random() * GL.length)]; }).join('');
      if (n / 2 >= txt.length) { el.textContent = txt; clearInterval(el._t); }
    }, 40);
  }
  function setStage(s, force) {
    if (s === stage && !force) return;
    var prev = stage; stage = s;
    copy.dataset.stage = s;
    steps.forEach(function (li, i) { li.classList.toggle('on', i <= s); });
    if (s >= 1 && (prev < 1 || force)) decode(codeEl, 'A7 3F 19 C2');
    if (s < 1) { clearInterval(codeEl._t); codeEl.textContent = '· · · ·'; }
    $$('[data-glyph]').forEach(function (g, i) { if ((i === 0 && s >= 0) || (i === 1 && s >= 3)) { if (g._shown !== root.lang + s) { g._shown = root.lang + s; decode(g, g.dataset[root.lang]); } } });
    if (still()) bitAt(s >= 2 ? (s === 2 ? .6 : 1) : 0);
  }
  function bitAt(u) {
    try { var L = path.getTotalLength(), p = path.getPointAtLength(L * clamp(u, 0, 1)); bit.setAttribute('cx', p.x); bit.setAttribute('cy', p.y); } catch (e) {}
  }
  steps.forEach(function (li, i) { $('button', li).addEventListener('click', function () {
    if (still()) { cpStill = i; setStage(i, true); return; }
    var top = copy.getBoundingClientRect().top + scrollY, span = copy.offsetHeight - innerHeight;
    scrollTo({ top: top + span * (i * .26 + .08), behavior: 'smooth' });
  }); });
  $$('[data-cp]').forEach(function (b) { b.addEventListener('click', function () { cpStill = clamp(cpStill + +b.dataset.cp, 0, 3); setStage(cpStill, true); }); });

  // ---------------------------------------------------------------- odometer
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
    var roll = function (go) { $$('.d', o).forEach(function (d, i) { var to = go ? +d.dataset.to : 0; d.firstChild.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; d.firstChild.style.transform = 'translateY(' + (-to * 10) + '%)'; }); };
    roll(still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(true);
  });

  // ---------------------------------------------------------------- FAQ: one card open at a time
  var fcs = $$('.fc');
  fcs.forEach(function (fc) { $('.fq', fc).addEventListener('click', function () {
    var open = !fc.classList.contains('open');
    fcs.forEach(function (x) { x.classList.toggle('open', x === fc && open); $('.fq', x).setAttribute('aria-expanded', x === fc && open ? 'true' : 'false'); });
  }); });

  // ---------------------------------------------------------------- the remote composer
  var needs = $$('[data-need]'), detail = $('[data-detail]'), msgEl = $('[data-msg]'), chat = $('[data-chat]'), rled = $('[data-rled]'), shown = '', typing = 0, seen = false;
  function pulse() {
    if (still()) return;
    rled.classList.add('on'); setTimeout(function () { rled.classList.remove('on'); }, 260);
    $$('[data-rwaves] path').forEach(function (p, i) {
      p.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, offset: .3 }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 700, delay: i * 90, easing: 'cubic-bezier(.23,1,.32,1)' });
    });
  }
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), picked = needs.filter(function (n) { return n.getAttribute('aria-pressed') === 'true'; }).map(function (n) { return n.dataset[l ? 'he' : 'en']; });
    var d = detail.value.trim();
    var m = l ? (picked.length ? 'שלום גבי, אשמח לעזרה עם ' + list(picked, true) + '.' : 'שלום גבי, יש לי שאלה על משהו מהחנות.')
              : (picked.length ? 'Hi Gabi, I’d like help with ' + list(picked, false) + '.' : 'Hi Gabi, I have a question about something in the shop.');
    if (d) m += (l ? ' פרטים: ' : ' Details: ') + d;
    return m;
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !seen) { shown = target; msgEl.textContent = target; chat.classList.remove('typing'); return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    chat.classList.add('typing');
    (function st(t) {
      var n = Math.floor((t - t0) / 18);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st); else chat.classList.remove('typing');
    })(t0);
  }
  needs.forEach(function (n) { n.addEventListener('click', function () { n.setAttribute('aria-pressed', n.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); pulse(); write(); }); });
  detail.addEventListener('input', function () { write(true); });
  $('[data-send]').addEventListener('pointerdown', pulse);
  watch(chat, function (v) { if (v && !seen) { seen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .5 });

  // spotlight on the contact tiles
  $$('.b-tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var sheets = $$('.sheet'), revs = $('[data-revs]'), rvs = $$('.rv', revs), vphoto = $('[data-vphoto] img'), fh = $('.f-horizon'), foot = $('[data-foot]');
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function enter(el) { var r = el.getBoundingClientRect(); return clamp((innerHeight - r.top) / (innerHeight + r.height * .2), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    fob.classList.toggle('show', scrollY > hero.offsetHeight * .7 && foot.getBoundingClientRect().top > vh - 40);
    // sheets: each photo settles as its sheet lands
    sheets.forEach(function (s) { var r = s.getBoundingClientRect(); s.style.setProperty('--zoom', calm ? 1 : (1 + .14 * clamp(r.top / vh, 0, 1)).toFixed(4)); });
    // the second key
    if (!calm) {
      var p = prog(copy), s = p < .2 ? 0 : p < .45 ? 1 : p < .72 ? 2 : 3;
      setStage(s);
      bitAt(s < 2 ? 0 : s === 2 ? smooth((p - .45) / .27) : 1);
      $('.cp-b').style.opacity = s < 3 ? (1 - smooth((p - .62) / .14)).toFixed(3) : '';
    } else $('.cp-b').style.opacity = '';
    // reviews: slips drop in one by one and land
    var rp = calm ? 1 : enter(revs);
    rvs.forEach(function (rv, i) {
      if (calm) { rv.style.transform = ''; rv.style.opacity = ''; return; }
      var t = smooth((rp - .25 - i * .12) / .3);
      rv.style.transform = 'translateY(' + ((1 - t) * -90).toFixed(1) + 'px) rotate(' + lerp(+rv.style.getPropertyValue('--r').replace('deg', '') * 3 + (i % 2 ? 10 : -10), +rv.style.getPropertyValue('--r').replace('deg', ''), t).toFixed(2) + 'deg)';
      rv.style.opacity = (.15 + .85 * t).toFixed(3);
    });
    // visit: the photo pulls back from the door
    var vp = calm ? 1 : smooth(enter(vphoto.parentNode) * 1.2);
    vphoto.style.transform = calm ? '' : 'scale(' + lerp(1.45, 1, vp).toFixed(4) + ')';
    // footer horizon rises as it is uncovered
    var fr = foot.getBoundingClientRect(), fp = calm ? 1 : smooth((vh - fr.top) / fr.height);
    fh.style.setProperty('--rise', ((1 - fp) * 80).toFixed(1) + 'px');
  }

  function layout() { dust.size(); placeSpots(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); setStage(0, true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); showSpots(); dust.kick(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 900);
  addEventListener('load', function () { placeSpots(); tick(); });
})();
