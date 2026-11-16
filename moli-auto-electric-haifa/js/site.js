(function () {
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth <= 760; };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };
  var TITLE = { he: 'חשמל רכב מולי · האשלג 21, חיפה', en: 'Moli Auto Electric · 21 HaAshlag St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור חשמל רכב מולי · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Moli Auto Electric · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-call]', 'חייגו למוסך, 04-842-0164', 'Call the garage, 04-842-0164');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-dial]', 'מתג אורות', 'Light switch');
    aria('.wordmark', 'חשמל רכב מולי', 'Moli Auto Electric');
    $('.c-map iframe').title = l === 'he' ? 'מפה: האשלג 21, חיפה' : 'Map: 21 HaAshlag St, Haifa';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('moli-lang', l); } catch (e) {}
    texts(l); hours(); mode(cur, true); frame(); fit(); scroll();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('moli-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    $('.hero').classList.add('ready', 'lit'); $('.foot').classList.add('in');
    scroll(); kick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8, 16], 1: [8, 16], 2: [8, 16], 3: [8, 16], 4: [8, 16], 5: null, 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false, short;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    short = txt.split(' · ')[0];
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-status-short]').forEach(function (el) { el.textContent = short; });
    $('.dock').classList.toggle('open', open);
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  function hours() {   // consecutive days with the same hours share a row; the week starts on Sunday
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var name = r[0] === r[1] ? names[r[0]] : names[r[0]] + '–' + names[r[1]];
      var val = !t ? (l ? 'סגור' : 'Closed') : t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- glyph decode: labels settle out of scrambled letters
  var GL = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHIKLMNOPRSTUVWXYZabcdeghknorstuvw' };
  function decode(el) {
    var node = $('span[lang="' + root.lang + '"]', el) || el, orig = node.dataset.txt || node.textContent;
    node.dataset.txt = orig;
    if (still()) { node.textContent = orig; return; }
    var set = GL[root.lang], f = 0, N = 14;
    clearInterval(node._t);
    node._t = setInterval(function () {
      f++;
      node.textContent = orig.split('').map(function (c, i) { return c === ' ' || i < (f / N) * orig.length ? c : set[(Math.random() * set.length) | 0]; }).join('');
      if (f >= N) { clearInterval(node._t); node.textContent = orig; }
    }, 34);
  }

  // ---------------------------------------------------------------- entrances
  $$('.bento [data-tile],.contact [data-tile]').forEach(function (t, i, a) { t.style.setProperty('--d', (i % 5) * 80 + 'ms'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in'); rio.unobserve(e.target);
      var d = $('[data-decode]', e.target); if (d) setTimeout(function () { decode(d); }, 250);
    });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal],[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  var work = $('#work'); watch(work, function (v) { work.classList.toggle('on', v); });

  // ---------------------------------------------------------------- split headline and wordmark into letters
  function split(el, start) {
    var i = start || 0;
    $$('span[lang]', el).forEach(function (sp) {
      var k = i;
      sp.innerHTML = sp.textContent.split(' ').map(function (w) {
        return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (k++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  }
  split($('.h-title')); split($('.wordmark'));

  // ---------------------------------------------------------------- hero: the photo sits like object-fit:cover, but with the lamp placed by us
  var hero = $('.hero'), media = $('[data-hero]'), fr = $('[data-frame]'), IW = 1600, IH = 1068, LX = .264, LY = .512, geo = {};
  function frame() {
    var W = media.clientWidth, Hh = media.clientHeight, s = Math.max(W / IW, Hh / IH) * 1.04, w = IW * s, h = IH * s, mir = !he();
    var target = phone() ? .5 : (mir ? .7 : .3);       // screen spot for the lamp: away from the words
    var fx = mir ? 1 - LX : LX;
    var left = clamp(W * target - w * fx, W - w, 0), top = clamp(Hh * .5 - h * LY, Hh - h, 0);
    fr.classList.add('sized');
    fr.style.cssText = 'left:' + left + 'px;top:' + top + 'px;width:' + w + 'px;height:' + h + 'px;right:auto;bottom:auto;transform:' + (mir ? 'scaleX(-1)' : 'none');
    geo = { left: left, top: top, w: w, h: h, mir: mir };
  }
  // beam: rests on the lamp and drifts; follows the hand on desktop; sweeps by itself on touch
  var bx = LX, by = LY, tx = LX, ty = LY, lastMove = -1e4, hvis = true, raf = 0;
  hero.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var r = media.getBoundingClientRect(), x = (e.clientX - r.left - geo.left) / geo.w, y = (e.clientY - r.top - geo.top) / geo.h;
    tx = geo.mir ? 1 - x : x; ty = y; lastMove = performance.now();
  });
  var cv = $('.h-dust'), cx = cv.getContext('2d'), motes = [];
  function sizeDust() {
    var d = Math.min(2, devicePixelRatio || 1); cv.width = media.clientWidth * d; cv.height = media.clientHeight * d; cx.setTransform(d, 0, 0, d, 0, 0);
    motes = []; for (var i = 0; i < (phone() ? 70 : 140); i++) motes.push({ x: Math.random(), y: Math.random(), v: .00025 + Math.random() * .0006, r: .6 + Math.random() * 1.8, p: Math.random() * 6.28 });
  }
  function tick(t) {
    raf = 0;
    if (still() || !hvis) return;
    if (t - lastMove > 1800) {       // idle: a slow figure-eight around the lamp, wider on touch screens
      var a = t / 2600, k = phone() ? .2 : .14;
      tx = LX + Math.sin(a) * k + .06; ty = LY + Math.sin(a * 2) * k * .45;
    }
    bx = lerp(bx, tx, .08); by = lerp(by, ty, .08);
    fr.style.setProperty('--bx', (bx * 100).toFixed(2) + '%'); fr.style.setProperty('--by', (by * 100).toFixed(2) + '%');
    // motes in the light: brighter near the beam, drifting upward in warm air
    var W = media.clientWidth, Hh = media.clientHeight, sx = geo.left + (geo.mir ? 1 - bx : bx) * geo.w, sy = geo.top + by * geo.h, R = Math.max(W, Hh) * .32;
    cx.clearRect(0, 0, W, Hh);
    motes.forEach(function (m) {
      m.y -= m.v; m.x += Math.sin(t / 1800 + m.p) * .00018; if (m.y < -.02) { m.y = 1.02; m.x = Math.random(); }
      var px = m.x * W, py = m.y * Hh, d = Math.hypot(px - sx, py - sy), a2 = clamp(1 - d / R, 0, 1);
      if (a2 <= 0) return;
      cx.globalAlpha = a2 * .85; cx.fillStyle = '#ffe7b8'; cx.beginPath(); cx.arc(px, py, m.r, 0, 6.283); cx.fill();
    });
    raf = requestAnimationFrame(tick);
  }
  function kick() { if (!raf && !still()) raf = requestAnimationFrame(tick); }
  watch(hero, function (v) { hvis = v; kick(); });

  // opening: real pictures of the trade dealt like cards; the last one grows into the hero
  function deal() {
    var dk = $('.deal'), cards = $$('img', dk);
    if (still() || !dk.animate) { hero.classList.add('ready', 'lit'); dk.remove(); return; }
    dk.classList.add('go');
    var n = cards.length, spread = phone() ? 46 : 120;
    cards.forEach(function (c, i) {
      var x = (i - (n - 1) / 2) * spread, rot = (i - (n - 1) / 2) * 7;
      c.animate([{ opacity: 0, transform: 'translate(' + x * .3 + 'px, 70vh) rotate(' + rot * 2 + 'deg)' }, { opacity: 1, transform: 'translate(' + x + 'px, 0) rotate(' + rot + 'deg)' }],
        { duration: 620, delay: i * 85, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'forwards' });
    });
    setTimeout(function () {
      var last = cards[n - 1], W = media.clientWidth, Hh = media.clientHeight, s = Math.max(W / last.offsetWidth, Hh / last.offsetHeight) * 1.15;
      cards.slice(0, -1).forEach(function (c) { c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 380, fill: 'forwards' }); });
      last.animate([{ opacity: 1, transform: 'translate(' + ((n - 1) / 2) * spread + 'px,0) rotate(' + ((n - 1) / 2) * 7 + 'deg) scale(1)' }, { opacity: 0, transform: 'translate(0,0) rotate(0deg) scale(' + s + ')' }],
        { duration: 700, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
      setTimeout(function () { hero.classList.add('lit'); }, 380);
      setTimeout(function () { dk.remove(); }, 760);
    }, 860);
    setTimeout(function () { hero.classList.add('ready'); }, 120);    // the words never wait for the cards
  }

  // ---------------------------------------------------------------- the switch: four positions, a real wet road
  var stage = $('[data-stage]'), MODES = ['off', 'park', 'low', 'high'], ANG = [-60, -20, 20, 60], cur = still() ? 'low' : 'off', touched = false;
  var RO = {
    off: { he: ['כבוי', 'בלי אור, הגשם והכביש נעלמים בחושך.'], en: ['Off', 'No light: the rain and the road disappear into the dark.'] },
    park: { he: ['אורות חניה', 'מסמנים את הרכב לאחרים, אבל לא מאירים את הדרך.'], en: ['Parking lights', 'They mark the car for others but don’t light the way.'] },
    low: { he: ['אור נמוך', 'מאיר את הכביש לפניכם בלי לסנוור את מי שמגיע מולכם.'], en: ['Low beam', 'Lights the road ahead without dazzling oncoming drivers.'] },
    high: { he: ['אור גבוה', 'מאיר רחוק, לכבישים חשוכים כשאף אחד לא מגיע מולכם.'], en: ['High beam', 'Reaches far, for dark roads with no one coming the other way.'] }
  };
  function mode(m, quiet) {
    cur = m; stage.dataset.mode = m;
    var i = MODES.indexOf(m);
    $('.cap').style.setProperty('--rot', ANG[i] + 'deg');
    $$('.pos').forEach(function (b) { var on = b.dataset.pos === m; b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; });
    var t = RO[m][root.lang], ti = $('[data-ro-title]');
    ti.textContent = t[0]; delete ti.dataset.txt; $('[data-ro-line]').textContent = t[1];
    if (!quiet) decode(ti);
  }
  $$('.pos').forEach(function (b) {
    b.addEventListener('click', function () { touched = true; mode(b.dataset.pos); });
    b.addEventListener('keydown', function (e) {
      var d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key]; if (!d) return;
      e.preventDefault(); touched = true;
      var i = clamp(MODES.indexOf(cur) + d, 0, 3); mode(MODES[i]); $('.pos.p' + i).focus();
    });
  });
  var kn = $('[data-knob]'), drag = false;
  function fromPointer(e) {
    var r = kn.getBoundingClientRect(), a = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI, best = 0;
    ANG.forEach(function (g, i) { if (Math.abs(g - a) < Math.abs(ANG[best] - a)) best = i; });
    if (MODES[best] !== cur) mode(MODES[best]);
  }
  kn.addEventListener('pointerdown', function (e) { drag = true; touched = true; kn.setPointerCapture(e.pointerId); fromPointer(e); });
  kn.addEventListener('pointermove', function (e) { if (drag) fromPointer(e); });
  kn.addEventListener('pointerup', function () { drag = false; });
  mode(cur, true);
  // a first demonstration when the stage comes into view: the switch clicks through to low beam by itself
  var shown = false;
  watch(stage, function (v) {
    if (!v || shown || still() || touched) return; shown = true;
    ['park', 'low'].forEach(function (m, i) { setTimeout(function () { if (!touched) mode(m); }, 700 + i * 1100); });
  }, { threshold: .45 });

  // rain: you see the drops only where light falls on them
  var rc = $('.rain'), rx = rc.getContext('2d'), drops = [], svis = false, rraf = 0;
  function sizeRain() {
    var d = Math.min(2, devicePixelRatio || 1); rc.width = stage.clientWidth * d; rc.height = stage.clientHeight * d; rx.setTransform(d, 0, 0, d, 0, 0);
    drops = []; for (var i = 0; i < (phone() ? 160 : 320); i++) drops.push({ x: Math.random(), y: Math.random(), v: .012 + Math.random() * .014, l: 6 + Math.random() * 12 });
  }
  function light(x, y) {
    var ph = phone(), lx = ph ? .265 : .395, f;
    if (cur === 'off') return .03;
    if (cur === 'park') { f = Math.hypot((x - lx) * 3, (y - .57) * 3); return .05 + clamp(.4 - f, 0, .4); }
    var e = Math.hypot((x - .68) / (cur === 'high' ? .75 : .5), (y - .74) / (cur === 'high' ? .45 : .26));
    return clamp(1.05 - e, 0, 1) * (cur === 'high' ? 1 : .8) + .04;
  }
  function rain() {
    rraf = 0; if (still() || !svis) { rx.clearRect(0, 0, rc.width, rc.height); return; }
    var W = stage.clientWidth, Hh = stage.clientHeight;
    rx.clearRect(0, 0, W, Hh); rx.strokeStyle = '#ffe2a8'; rx.lineWidth = 1;
    drops.forEach(function (d) {
      d.y += d.v; d.x += d.v * .12; if (d.y > 1.02) { d.y = -.03; d.x = Math.random(); }
      var a = light(d.x, d.y); if (a < .05) return;
      rx.globalAlpha = a * .7; rx.beginPath(); rx.moveTo(d.x * W, d.y * Hh); rx.lineTo(d.x * W + d.l * .12, d.y * Hh + d.l); rx.stroke();
    });
    rraf = requestAnimationFrame(rain);
  }
  watch(stage, function (v) { svis = v; if (v && !rraf) rraf = requestAnimationFrame(rain); });

  // ---------------------------------------------------------------- odometer (4.6)
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
    o.setAttribute('role', 'img');
    var roll = function (go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); };
    roll(still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(true); ob.disconnect(); } }, { threshold: .4 }).observe(o); else roll(true);
  });

  // ---------------------------------------------------------------- footer wordmark fits its width
  function fit() {
    $$('[data-fit]').forEach(function (w) {
      w.style.fontSize = '120px';
      var sp = $('span[lang="' + root.lang + '"]', w), avail = w.clientWidth;
      if (sp && sp.offsetWidth) w.style.fontSize = Math.min(phone() ? 90 : 260, 120 * avail / sp.offsetWidth * .98) + 'px';
    });
  }

  // ---------------------------------------------------------------- scroll: nav pill, the cone of light, the bay opening, the curtain
  var nav = $('[data-nav]'), sw = $('#switch'), bay = $('[data-bay]'), foot = $('.foot'), sraf = 0;
  function scroll() {
    sraf = 0;
    var vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    if (!still()) {
      var r = sw.getBoundingClientRect(), p = smooth((vh - r.top) / (vh * .75));
      sw.style.setProperty('--cone', lerp(10, 100, p).toFixed(2) + '%'); sw.style.setProperty('--coneY', lerp(55, 0, p).toFixed(2) + '%');
      var b = bay.getBoundingClientRect(), q = smooth((vh - b.top) / (vh * .95));
      bay.style.setProperty('--inset', lerp(phone() ? 7 : 12, 0, q).toFixed(2) + '%'); bay.style.setProperty('--bs', lerp(1.18, 1, q).toFixed(3));
    }
    if (foot.getBoundingClientRect().top < vh * .8) foot.classList.add('in');
  }
  addEventListener('scroll', function () { if (!sraf) sraf = requestAnimationFrame(scroll); }, { passive: true });
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { frame(); sizeDust(); sizeRain(); fit(); scroll(); }, 120); });

  // ---------------------------------------------------------------- start
  texts(root.lang); hours(); frame(); sizeDust(); sizeRain(); scroll(); kick();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit); else fit();
  if (still()) { hero.classList.add('ready', 'lit'); $('.deal').remove(); $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); }); foot.classList.add('in'); }
  else deal();
})();
