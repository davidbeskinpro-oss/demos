(function () {
  var root = document.documentElement, WA = '972526846864';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var hover = matchMedia('(hover: hover)').matches;
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'אורי מחשבים · תיקון, החלפה ושדרוג מחשבים · עופרה חזה 8, קריית מוצקין', en: 'Uri Computers · Computer repairs, replacements & upgrades · 8 Ofra Haza St, Kiryat Motzkin' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור אורי מחשבים · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Uri Computers · This is not the business’s official website' };

  // ------------------------------------------------------------ language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'אורי מחשבים', 'Uri Computers');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-parts]', 'חלקים', 'Parts');
    aria('[data-t-prev]', 'הקודם', 'Previous');
    aria('[data-t-next]', 'הבא', 'Next');
    aria('[data-t-visit]', 'ביקור ויצירת קשר', 'Visit and contact');
    aria('[data-t-call]', 'התקשרו לאורי, 052-684-6864', 'Call Uri, 052-684-6864');
    aria('[data-t-wa]', 'וואטסאפ לאורי', 'WhatsApp Uri');
    $('[data-t-map]').title = l === 'he' ? 'מפה: עופרה חזה 8, קריית מוצקין' : 'Map: 8 Ofra Haza St, Kiryat Motzkin';
    $('[data-fit]').setAttribute('aria-label', l === 'he' ? 'אורי מחשבים' : 'Uri Computers');
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('uri-lang', l); } catch (e) {}
    texts(l); hours(); bays(); show(stage, true); compose(); fit(); frame();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ------------------------------------------------------------ motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('uri-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $('[data-foot]').classList.add('in'); $('[data-hero]').classList.add('dealt', 'stuck'); $('[data-fill]').classList.add('filled');
    if (!on) { photo.style.removeProperty('--ci'); photo.style.removeProperty('--cs'); quotes.style.transform = ''; portrait.style.removeProperty('--rx'); portrait.style.removeProperty('--ry'); }
    show(stage, true); frame(); dustKick(); cityKick();
  }); });
  motionUI();

  // ------------------------------------------------------------ hours, Israel time; null = closed
  var H = { 0: [8, 20], 1: [8, 20], 2: [8, 20], 3: [8, 20], 4: [8, 20], 5: [8, 13], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
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

  // ------------------------------------------------------------ letters
  function split(el) {
    $$('span[lang]', el).forEach(function (sp) {
      var i = 0;
      var walk = function (node) {
        [].slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var frag = document.createElement('span'); frag.style.display = 'contents';
            frag.innerHTML = c.textContent.split(' ').map(function (w) {
              return w ? '<span class="w">' + w.split('').map(function (ch) { return '<span class="ch" style="--i:' + (i++) + '">' + ch + '</span>'; }).join('') + '</span>' : '';
            }).join(' ');
            node.replaceChild(frag, c);
          } else walk(c);
        });
      };
      walk(sp);
    });
  }
  split($('[data-fill]')); split($('[data-fit]'));

  // ------------------------------------------------------------ opening: photos dealt onto the desk, Uri lands last, the sticker goes on
  var hero = $('[data-hero]'), portrait = $('[data-tilt]');
  $$('[data-deal]').forEach(function (c, i) { c.style.setProperty('--dd', (i * 140) + 'ms'); });
  requestAnimationFrame(function () {
    setTimeout(function () { hero.classList.add('dealt'); $('[data-fill]').classList.add('filled'); }, 60);
    setTimeout(function () { hero.classList.add('stuck'); }, still() ? 0 : 1100);
  });

  // portrait leans toward the hand; on phones it follows the scroll
  if (hover) hero.addEventListener('pointermove', function (e) {
    if (still()) return;
    var r = portrait.getBoundingClientRect();
    portrait.style.setProperty('--ry', clamp((e.clientX - (r.left + r.width / 2)) / r.width, -1, 1) * 7 + 'deg');
    portrait.style.setProperty('--rx', clamp(-(e.clientY - (r.top + r.height / 2)) / r.height, -1, 1) * 6 + 'deg');
  });

  // ------------------------------------------------------------ dust in the desk light; the hand (or a tap) blows it away
  var dc = $('[data-dust]'), dx = dc.getContext('2d'), motes = [], dOn = false, dRaf = 0, mouse = { x: -999, y: -999, t: 0 };
  function dustSize() {
    var r = hero.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    dc.width = r.width * d; dc.height = r.height * d; dx.setTransform(d, 0, 0, d, 0, 0);
    var n = r.width < 700 ? 46 : 90;
    motes = []; for (var i = 0; i < n; i++) motes.push({ x: Math.random() * r.width, y: Math.random() * r.height, r: .6 + Math.random() * 1.9, vx: 0, vy: 0, ph: Math.random() * 6.28, sp: .15 + Math.random() * .35 });
  }
  function dustTick(t) {
    var w = dc.width / (Math.min(devicePixelRatio || 1, 2)), h = dc.height / (Math.min(devicePixelRatio || 1, 2));
    dx.clearRect(0, 0, w, h);
    var bx = rtl() ? w * .12 : w * .88, by = h * .05;   // the light comes from the top corner
    motes.forEach(function (m) {
      m.ph += .01;
      m.vx += Math.cos(m.ph) * .006; m.vy += (Math.sin(m.ph * .7) * .006) - .0015;
      var ddx = m.x - mouse.x, ddy = m.y - mouse.y, dd = ddx * ddx + ddy * ddy;
      if (dd < 16000) { var f = (1 - dd / 16000) * 1.1; var l = Math.sqrt(dd) || 1; m.vx += ddx / l * f; m.vy += ddy / l * f; }
      m.vx *= .96; m.vy *= .96;
      m.x += m.vx + m.sp * .25; m.y += m.vy;
      if (m.x > w + 10) m.x = -10; if (m.x < -10) m.x = w + 10; if (m.y < -10) m.y = h + 10; if (m.y > h + 10) m.y = -10;
      var lit = 1 - clamp(Math.hypot(m.x - bx, m.y - by) / (Math.max(w, h) * .9), 0, 1);
      dx.globalAlpha = .12 + lit * .65 * (.75 + .25 * Math.sin(m.ph * 3));
      dx.fillStyle = lit > .45 ? '#ffe9a0' : '#cfe3df';
      dx.beginPath(); dx.arc(m.x, m.y, m.r, 0, 6.283); dx.fill();
    });
    dRaf = requestAnimationFrame(dustTick);
  }
  function dustKick() { cancelAnimationFrame(dRaf); if (dOn && !still()) dRaf = requestAnimationFrame(dustTick); else dx.clearRect(0, 0, dc.width, dc.height); }
  hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  hero.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });
  hero.addEventListener('pointerdown', function (e) { var r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; setTimeout(function () { mouse.x = mouse.y = -999; }, 380); });
  dustSize(); watch(hero, function (v) { dOn = v; dustKick(); });

  // ------------------------------------------------------------ INSIDE: the side panel comes off, the camera moves part to part in his own photo
  var sec = $('[data-inside]'), cs = $('[data-case]'), img = $('[data-caseimg]'), panel = $('[data-panel]'), ring = $('[data-focus]');
  var IW = 1600, IH = 1200;
  var ST = [
    { f: [800, 600], z: 1, he: ['המכסה הוסר', 'רואים את כל החלקים.'], en: ['Side panel off', 'Every part in view.'], bay: ['פתוח', 'Open'] },
    { f: [740, 385], z: 2.3, he: ['כונן SSD', 'החלפה ושדרוג של כוננים.'], en: ['SSD drive', 'Drives replaced and upgraded.'], bay: ['כונן', 'Drive'] },
    { f: [1060, 930], z: 2.3, he: ['קירור המעבד', 'ניקוי אבק מהמאוורר ומצלעות הקירור.'], en: ['CPU cooler', 'Dust cleaned off the fan and fins.'], bay: ['קירור', 'Cooling'] },
    { f: [690, 800], z: 2.05, he: ['כבלים וחיבורים', 'ספק כוח, כבלים ומחברים.'], en: ['Cables and connectors', 'Power supply, cables and connectors.'], bay: ['כבלים', 'Cables'] },
    { f: [800, 600], z: 1, he: ['סוגרים ומדביקים', 'המכסה חוזר, והמדבקה של אורי עליו.'], en: ['Closed and labelled', 'The panel goes back on, with Uri’s sticker.'], bay: ['סגור', 'Closed'] }
  ];
  var KEY = [0.14, 0.32, 0.52, 0.70, 0.86];          // scroll progress where each camera stop sits
  var stage = 0, W = 0, Hh = 0, s0 = 1, cam = { fx: 800, fy: 600, z: 1 };
  var pst = document.createElement('div'); pst.className = 'sticker panel-st'; pst.setAttribute('aria-hidden', 'true');
  pst.innerHTML = '<b lang="he">אורי מחשבים</b><b lang="en">Uri Computers</b><span dir="ltr">052-684-6864</span>';
  panel.appendChild(pst);
  function bays() {
    $('[data-bays]').innerHTML = ST.map(function (s, i) { return '<button type="button" class="bay" data-bay="' + i + '"' + (i === stage ? ' aria-current="true"' : '') + '><i></i>' + s.bay[he() ? 0 : 1] + '</button>'; }).join('');
    $$('[data-bay]').forEach(function (b) { b.addEventListener('click', function () { go(+b.dataset.bay); }); });
  }
  function show(i, force) {
    if (i === stage && !force) return;
    stage = i;
    var s = ST[i][he() ? 'he' : 'en'];
    $('[data-rot]').textContent = s[0]; $('[data-rol]').textContent = s[1];
    $$('[data-bay]').forEach(function (b) { b.setAttribute('aria-current', +b.dataset.bay === i ? 'true' : 'false'); });
    var b = $('[data-bay="' + i + '"]'); if (b) { var row = b.parentNode; row.scrollTo({ left: b.offsetLeft - row.clientWidth / 2 + b.offsetWidth / 2, behavior: 'auto' }); }
    cs.classList.toggle('closed', i === 4);
    if (still()) { var k = ST[i]; cam = { fx: k.f[0], fy: k.f[1], z: k.z }; place(); }
  }
  function measure() {
    var r = cs.getBoundingClientRect(); W = r.width; Hh = r.height;
    s0 = Math.max(W / IW, Hh / IH);
    img.style.width = IW * s0 + 'px'; img.style.height = IH * s0 + 'px';
    cd.width = W; cd.height = Hh;
  }
  function screenOf(fx, fy) {
    var z = cam.z, dw = IW * s0 * z, dh = IH * s0 * z;
    var tx = clamp(W / 2 - cam.fx * s0 * z, W - dw, 0), ty = clamp(Hh / 2 - cam.fy * s0 * z, Hh - dh, 0);
    return { tx: tx, ty: ty, x: fx * s0 * z + tx, y: fy * s0 * z + ty };
  }
  var ringW = 0;
  function place() {
    var p = screenOf(cam.fx, cam.fy);
    img.style.transform = 'translate3d(' + p.tx + 'px,' + p.ty + 'px,0) scale(' + cam.z + ')';
    var k = ST[stage], q = screenOf(k.f[0], k.f[1]);
    ring.style.transform = 'translate(' + q.x + 'px,' + q.y + 'px)';
    ring.style.opacity = (stage > 0 && stage < 4) ? ringW : 0;
  }
  function progress() { var r = sec.getBoundingClientRect(), span = r.height - innerHeight; return span > 0 ? clamp(-r.top / span, 0, 1) : 0; }
  function camAt(p) {
    if (p <= KEY[0]) return ST[0];
    for (var i = 0; i < KEY.length - 1; i++) if (p <= KEY[i + 1]) {
      var t = smooth((p - KEY[i]) / (KEY[i + 1] - KEY[i])), a = ST[i], b = ST[i + 1];
      // a camera move: pull back a little mid-way so it travels rather than slides
      var dip = Math.sin(t * Math.PI) * .18 * Math.min(a.z, b.z);
      return { f: [lerp(a.f[0], b.f[0], t), lerp(a.f[1], b.f[1], t)], z: Math.max(1, lerp(a.z, b.z, t) - dip) };
    }
    return ST[4];
  }
  function frame() {
    if (still()) { panel.style.transform = ''; pst.classList.toggle('on', stage === 4); place(); return; }
    var p = progress();
    var open = smooth((p - .02) / .12) - smooth((p - .88) / .08);       // 0 closed → 1 off → 0 closed again
    panel.style.transform = 'translate3d(' + ((rtl() ? 1 : -1) * open * 104) + '%,0,0) rotate(' + ((rtl() ? 1 : -1) * open * 2) + 'deg)';
    pst.classList.toggle('on', p > .95);
    var c = camAt(p); cam = { fx: c.f[0], fy: c.f[1], z: c.z };
    var i = p < .23 ? 0 : p < .42 ? 1 : p < .61 ? 2 : p < .78 ? 3 : 4;
    ringW = clamp(1 - Math.abs(p - KEY[clamp(i, 0, 4)]) / .07, 0, 1);
    show(i); place();
    coolW = clamp(1 - Math.abs(p - KEY[2]) / .09, 0, 1);
  }
  function go(i) {
    i = (i + ST.length) % ST.length;
    if (still()) { show(i, true); return; }
    var r = sec.getBoundingClientRect(), top = scrollY + r.top, span = r.height - innerHeight;
    scrollTo({ top: top + span * (i === 4 ? .97 : KEY[i]), behavior: 'smooth' });
  }
  $('[data-prev]').addEventListener('click', function () { go(stage - 1); });
  $('[data-next]').addEventListener('click', function () { go(stage + 1); });

  // the cooler stop: dust lifts off the fins and drifts away in the air stream
  var cd = $('[data-casedust]'), cx = cd.getContext('2d'), puffs = [], coolW = 0, cOn = false, cRaf = 0;
  function caseTick() {
    cx.clearRect(0, 0, cd.width, cd.height);
    var src = screenOf(1060, 930), rad = 150 * s0 * cam.z;
    if (coolW > .05 && puffs.length < 260) for (var n = 0; n < 6 * coolW; n++) {
      var a = Math.random() * 6.283, d = Math.random() * rad;
      puffs.push({ x: src.x + Math.cos(a) * d, y: src.y + Math.sin(a) * d * .8, vx: (Math.random() - .3) * 1.2, vy: -.6 - Math.random() * 1.4, r: .8 + Math.random() * 2.6, life: 1, ph: Math.random() * 6 });
    }
    puffs = puffs.filter(function (q) {
      q.ph += .08; q.vx += Math.sin(q.ph) * .05 + .02; q.vy -= .01; q.x += q.vx; q.y += q.vy; q.life -= .008 + Math.random() * .004;
      cx.globalAlpha = Math.max(0, q.life) * .7; cx.fillStyle = '#d9d2c4';
      cx.beginPath(); cx.arc(q.x, q.y, q.r * (1 + (1 - q.life)), 0, 6.283); cx.fill();
      return q.life > 0;
    });
    cRaf = requestAnimationFrame(caseTick);
  }
  watch(sec, function (v) { cOn = v; cancelAnimationFrame(cRaf); if (v && !still()) cRaf = requestAnimationFrame(caseTick); else { puffs = []; cx.clearRect(0, 0, cd.width, cd.height); } }, { rootMargin: '100px' });

  // ------------------------------------------------------------ ways: run arrows + a pin landing on a new rooftop
  var rail = $('[data-runrail]');
  $$('[data-run]').forEach(function (b) { b.addEventListener('click', function () {
    var d = +b.dataset.run * (rtl() ? -1 : 1), card = rail.querySelector('.way');
    rail.scrollBy({ left: d * (card.offsetWidth + 16), behavior: still() ? 'auto' : 'smooth' });
  }); });
  var drop = $('[data-drop]'), cityT = 0, cityOn = false;
  var SPOTS = [[38, 58], [62, 44], [50, 70], [28, 40], [72, 62], [45, 36]], si = 0;
  function cityStep() {
    var s = SPOTS[si++ % SPOTS.length];
    drop.style.setProperty('--x', s[0] + '%'); drop.style.setProperty('--y', s[1] + '%');
    drop.classList.remove('land'); void drop.offsetWidth; drop.classList.add('land');
  }
  function cityKick() { clearInterval(cityT); if (cityOn && !still()) { cityStep(); cityT = setInterval(cityStep, 2600); } }
  watch($('[data-city]'), function (v) { cityOn = v; cityKick(); });

  // ------------------------------------------------------------ reviews: the photo folds into its frame; quotes drift with the scroll
  var rsec = $('[data-reviews]'), photo = $('[data-rvphoto]'), quotes = $('[data-quotes]');
  function reviews() {
    if (still()) return;
    var r = rsec.getBoundingClientRect(), vh = innerHeight;
    var t = smooth((vh - r.top) / (vh * .9));          // 0 as it enters → 1 when it is in place
    var wide = innerWidth > 860;
    photo.style.setProperty('--ci', ((1 - t) * -40) + 'px');
    photo.style.setProperty('--cs', (1.18 - .18 * t).toFixed(3));
    if (wide) {
      var box = quotes.parentNode.getBoundingClientRect(), over = quotes.scrollWidth - box.width;
      var k = clamp((vh - r.top) / (r.height + vh * .2), 0, 1);
      quotes.style.transform = over > 0 ? 'translateX(' + ((rtl() ? 1 : -1) * over * k) + 'px)' : '';
    } else quotes.style.transform = '';
  }
  // odometer for the score
  var odo = $('[data-odo]');
  watch(odo, function (v) {
    if (!v || still() || odo._done) return; odo._done = true;
    var sp = odo.querySelectorAll('span'), t0 = performance.now();
    (function f(t) { var k = clamp((t - t0) / 800, 0, 1); sp[0].textContent = Math.round(smooth(k) * 5); sp[1].textContent = k < 1 ? Math.floor(Math.random() * 10) : 0; if (k < 1) requestAnimationFrame(f); })(t0);
  });

  // ------------------------------------------------------------ the sticker composer → WhatsApp
  var form = $('[data-composer]'), send = $('[data-send]'), big = $('[data-bigsticker]');
  var HOW = { home: ['ביקור בבית', 'a home visit'], remote: ['עזרה מרחוק', 'remote help'], new: ['מחשב חדש', 'a new computer'], printer: ['עזרה עם מדפסת', 'help with a printer'] };
  function compose() {
    var how = (form.querySelector('input[name=how]:checked') || {}).value || 'home', what = form.what.value.trim(), who = form.who.value.trim(), l = he(), txt;
    if (l) txt = 'היי אורי' + (who ? ', כאן ' + who : '') + '. אשמח ל' + HOW[how][0] + (what ? ': ' + what : '.');
    else txt = 'Hi Uri' + (who ? ', this is ' + who : '') + '. I’d like ' + HOW[how][1] + (what ? ': ' + what : '.');
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(txt);
  }
  form.addEventListener('input', compose); form.addEventListener('change', compose);
  form.addEventListener('submit', function (e) { e.preventDefault(); send.click(); });
  send.addEventListener('click', function () {
    if (still()) return;
    big.classList.add('peel');
    setTimeout(function () { big.classList.remove('peel'); }, 900);
  });

  // spotlight on tiles
  if (hover) $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', e.clientX - r.left + 'px'); t.style.setProperty('--my', e.clientY - r.top + 'px'); }); });

  // ------------------------------------------------------------ entrances
  $$('section').forEach(function (s) { $$('[data-reveal],[data-tile]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  watch($('[data-foot]'), function (v) { if (v) $('[data-foot]').classList.add('in'); }, { threshold: .2 });

  // ------------------------------------------------------------ footer wordmark fits its width
  function fit() {
    var el = $('[data-fit]'); el.style.fontSize = '100px';
    var cs2 = getComputedStyle(el.parentNode), w = el.parentNode.clientWidth - parseFloat(cs2.paddingLeft) - parseFloat(cs2.paddingRight);
    el.style.fontSize = Math.min(260, 100 * w / el.scrollWidth) * .98 + 'px';
  }

  // ------------------------------------------------------------ nav pill, dock, scroll loop
  var nav = $('[data-nav]'), dock = $('[data-dock]'), bento = $('.bento'), ticking = false;
  function onScroll() {
    nav.classList.toggle('pill', scrollY > 30);
    var br = bento.getBoundingClientRect();
    dock.classList.toggle('hide', br.top < innerHeight * .6 && br.bottom > 0);
    frame(); reviews(); ticking = false;
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { measure(); dustSize(); fit(); onScroll(); }, 120); });

  texts(root.lang); hours(); bays(); measure(); show(0, true); compose(); onScroll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit); else fit();
  window.__uri = true;
})();
