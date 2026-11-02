(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var still = function () { return root.classList.contains('still'); };
  var lang = function () { return root.lang === 'en' ? 'en' : 'he'; };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var PHONE = '972509013957';

  // ------------------------------------------------------------ hours (Haifa time). index 0 = Sunday, null = closed
  var HOURS = [[540, 1080], [540, 1080], [540, 1080], [540, 1080], [540, 1080], [510, 780], null];
  var DAY = {
    he: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  };
  var DAYS = { he: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] };
  var fmt = function (m) { return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2); };
  function now() {
    var p = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), m: (parseInt(p.hour, 10) % 24) * 60 + parseInt(p.minute, 10) };
  }
  function status() {
    var n = now(), l = lang(), h = HOURS[n.d], el = $('[data-status]'), t;
    var open = h && n.m >= h[0] && n.m < h[1];
    if (open) t = l === 'he' ? 'פתוח עכשיו · עד ' + fmt(h[1]) : 'Open now · until ' + fmt(h[1]);
    else {
      var k = 0, d = n.d, s;
      if (h && n.m < h[0]) s = h[0];
      else { do { d = (d + 1) % 7; k++; } while (!HOURS[d] && k < 7); s = HOURS[d] && HOURS[d][0]; }
      var when = k === 0 ? (l === 'he' ? 'היום' : 'today') : k === 1 ? (l === 'he' ? 'מחר' : 'tomorrow') : (l === 'he' ? 'ביום ' + DAY.he[d] : 'on ' + DAY.en[d]);
      t = s == null ? '' : (l === 'he' ? 'סגור עכשיו · נפתח ' + when + ' ב־' + fmt(s) : 'Closed now · opens ' + when + ' at ' + fmt(s));
    }
    el.classList.toggle('open', !!open);
    $('[data-status-t]').textContent = t;
    var tb = $('[data-hours] tbody');
    tb.innerHTML = HOURS.map(function (x, i) {
      return '<tr' + (i === n.d ? ' class="today"' : '') + '><td>' + DAY[l][i] + '</td><td>' + (x ? fmt(x[0]) + '–' + fmt(x[1]) : (l === 'he' ? 'סגור' : 'Closed')) + '</td></tr>';
    }).join('');
  }

  // ------------------------------------------------------------ language
  function setAlts() {
    $$('img[data-alt-en]').forEach(function (im) {
      if (!im.dataset.altHe) im.dataset.altHe = im.alt;
      im.alt = lang() === 'en' ? im.dataset.altEn : im.dataset.altHe;
    });
  }
  function applyLang() {
    root.dir = lang() === 'he' ? 'rtl' : 'ltr';
    setAlts(); status(); split(); buildWeek(); write(); tagText(cur, true); fitWord();
    $('.iris').closest('.stage').querySelector('[role=group]').setAttribute('aria-label', lang() === 'he' ? 'נקודות בתמונה' : 'Points on the photo');
  }
  $$('[data-set-lang]').forEach(function (b) {
    b.addEventListener('click', function () {
      root.lang = lang() === 'he' ? 'en' : 'he';
      try { localStorage.setItem('sa-lang', root.lang); } catch (e) {}
      var u = new URL(location.href); u.searchParams.delete('lang'); history.replaceState(null, '', u);
      applyLang(); frame();
    });
  });

  // ------------------------------------------------------------ motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) {
    b.addEventListener('click', function () {
      var on = still();
      root.classList.toggle('still', !on);
      try { localStorage.setItem('sa-motion', on ? 'on' : 'off'); } catch (e) {}
      motionUI(); $$('[data-print],[data-rise]').forEach(function (el) { el.classList.add('in'); });
      if (on) startPetals(); frame();
    });
  });
  motionUI();

  // ------------------------------------------------------------ seam-shut headline (split per visible language)
  function split() {
    var h = $('[data-seam] [lang="' + lang() + '"]');
    if (!h || h.dataset.split) return;
    h.setAttribute('aria-label', h.textContent);
    var i = 0;
    h.innerHTML = h.textContent.split(' ').map(function (w) {
      return '<span class="wd" aria-hidden="true">' + Array.from(w).map(function (c) { return '<span class="ch ' + (i++ % 2 ? 'd' : 'u') + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
    h.dataset.split = '1';
  }

  // ------------------------------------------------------------ opening: photos dealt from one deck onto the rail
  function deal() {
    if (still()) return;
    var rail = $('[data-rail]'), cards = $$('[data-card]', rail);
    root.classList.add('deal', 'seam-open');
    var rr = rail.getBoundingClientRect(), cx = rr.left + rr.width / 2, cy = rr.top + Math.min(rr.height, innerHeight) / 2.4;
    cards.forEach(function (c, i) {
      if (c.classList.contains('p-ghost')) { c.style.transform = 'rotate(' + ((i - 3.5) * 6) + 'deg)'; return; }
      var r = c.getBoundingClientRect();
      var dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2);
      c.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(' + ((i - 1) * 9) + 'deg) scale(.55)';
      c.style.transitionDelay = (260 + i * 110) + 'ms';
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.classList.remove('seam-open');
        $$('[data-seam] .ch').forEach(function (s, i) { s.style.transitionDelay = (i * 35) + 'ms'; });
        root.classList.add('dealt');
        cards.forEach(function (c) { c.style.transform = ''; });
        setTimeout(function () { root.classList.remove('deal', 'dealt'); cards.forEach(function (c) { c.style.transitionDelay = ''; }); }, 1800);
      });
    });
  }

  // ------------------------------------------------------------ magnifying lenses
  var ZOOM = 2.2;
  function lensPaint(lensEl, imgEl, host, x, y) {
    // x, y = lens centre in host px
    var hw = host.clientWidth, hh = host.clientHeight, s = lensEl.offsetWidth, r = s / 2;
    var bg = lensEl.firstElementChild;
    if (!bg.style.backgroundImage) bg.style.backgroundImage = 'url(' + imgEl.currentSrc + ')';
    // the image is object-fit: cover in the host
    var iw = imgEl.naturalWidth || 1, ih = imgEl.naturalHeight || 1, sc = Math.max(hw / iw, hh / ih);
    var dw = iw * sc, dh = ih * sc, ox = (hw - dw) / 2, oy = (hh - dh) / 2;
    bg.style.backgroundSize = (dw * ZOOM) + 'px ' + (dh * ZOOM) + 'px';
    bg.style.backgroundPosition = (r - (x - ox) * ZOOM) + 'px ' + (r - (y - oy) * ZOOM) + 'px';
    lensEl.style.setProperty(lensEl.classList.contains('lens') ? '--lx' : '--gx', (x - r) + 'px');
    lensEl.style.setProperty(lensEl.classList.contains('lens') ? '--ly' : '--gy', (y - r) + 'px');
  }
  var heroHost = $('[data-lens-host]'), heroImg = $('img', heroHost), heroLens = $('[data-lens]');
  var lensT = { x: .5, y: .45 }, lensP = { x: .5, y: .45 }, pointerIn = false;
  if (finePointer) {
    heroHost.addEventListener('pointermove', function (e) {
      var r = heroHost.getBoundingClientRect(); pointerIn = true;
      lensT.x = (e.clientX - r.left) / r.width; lensT.y = (e.clientY - r.top) / r.height;
    });
    heroHost.addEventListener('pointerleave', function () { pointerIn = false; });
  }
  function heroLensTick(t) {
    if (!pointerIn) {
      if (still()) { lensT.x = .62; lensT.y = .36; }
      else { lensT.x = .55 + Math.sin(t / 2100) * .22; lensT.y = .42 + Math.sin(t / 1500 + 1) * .2; }
    }
    var k = still() ? 1 : .08;
    lensP.x += (lensT.x - lensP.x) * k; lensP.y += (lensT.y - lensP.y) * k;
    lensPaint(heroLens, heroImg, heroHost, lensP.x * heroHost.clientWidth, lensP.y * heroHost.clientHeight);
  }

  // ------------------------------------------------------------ the loupe chapter
  var loupe = $('[data-loupe]'), iris = $('[data-iris]'), glass = $('[data-glass]'), stageImg = $('.stage-img');
  // points on photo n2 (fractions of the frame): cuticle line, free edge, the shine
  var STOPS = [{ x: .62, y: .57 }, { x: .8, y: .2 }, { x: .79, y: .33 }];
  var TAGS = { he: ['קו הקוטיקולה', 'הקצה', 'הברק'], en: ['Cuticle line', 'The free edge', 'The shine'] };
  var cur = 0, stillIdx = 0, gpos = { x: STOPS[0].x, y: STOPS[0].y };
  var GLYPHS = 'אבגדהוזחטיכלמנסעפצקרשת◦•';
  var tagEl = $('[data-tag-t]'), decodeTimer = 0;
  function tagText(i, instant) {
    var target = TAGS[lang()][i];
    clearInterval(decodeTimer);
    if (instant || still()) { tagEl.textContent = target; return; }
    var f = 0, n = target.length;
    decodeTimer = setInterval(function () {
      f++;
      tagEl.textContent = Array.from(target).map(function (c, k) { return k < f / 2 || c === ' ' ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]; }).join('');
      if (f / 2 >= n) { clearInterval(decodeTimer); tagEl.textContent = target; }
    }, 34);
  }
  function setStop(i) {
    if (i === cur) return;
    cur = i;
    $$('[data-stop]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.stop === i)); });
    tagText(i);
  }
  function loupeFrame() {
    var p, ir = 75, pos;
    if (still()) {
      pos = STOPS[stillIdx]; setStop(stillIdx);
    } else {
      var r = loupe.getBoundingClientRect();
      p = clamp(-r.top / (r.height - innerHeight), 0, 1);
      var pe = clamp((innerHeight - r.top) / innerHeight, 0, 1); // entering: the iris opens
      ir = lerp(14, 75, ease(clamp((pe - .25) / .75, 0, 1)));
      var seg = clamp(p * 1.15 - .08, 0, 1) * (STOPS.length - 1), a = Math.floor(seg), b = Math.min(a + 1, STOPS.length - 1), t = seg - a;
      t = t < .45 ? 0 : t > .85 ? 1 : ease((t - .45) / .4);
      pos = { x: lerp(STOPS[a].x, STOPS[b].x, t), y: lerp(STOPS[a].y, STOPS[b].y, t) };
      setStop(t > .5 ? b : a);
      iris.style.setProperty('--dim', String(lerp(.95, .58, clamp(pe * 1.4 - .4, 0, 1))));
    }
    iris.style.setProperty('--iris', ir + '%');
    var k = still() ? 1 : .2;
    gpos.x += (pos.x - gpos.x) * k; gpos.y += (pos.y - gpos.y) * k;
    lensPaint(glass, stageImg, iris, gpos.x * iris.clientWidth, gpos.y * iris.clientHeight);
  }
  $$('[data-stop]').forEach(function (b) {
    b.addEventListener('click', function () {
      var i = +b.dataset.stop;
      if (still()) { stillIdx = i; frame(); return; }
      var r = loupe.getBoundingClientRect(), span = r.height - innerHeight;
      var p = (i / (STOPS.length - 1) + .08) / 1.15 + .02;
      scrollTo({ top: scrollY + r.top + span * p, behavior: 'smooth' });
    });
  });
  $$('[data-step]').forEach(function (b) {
    b.addEventListener('click', function () { stillIdx = (stillIdx + +b.dataset.step + STOPS.length) % STOPS.length; frame(); });
  });

  // ------------------------------------------------------------ petals (ambient, pointer parts them)
  var cv = $('[data-petals]'), ctx = cv.getContext('2d'), petals = [], petalsOn = false, heroVisible = true, ptr = { x: -999, y: -999 };
  var COLS = ['#e48ab6', '#f2c6da', '#f5efe9', '#c79bbb', '#b23d79'];
  function sizeCanvas() {
    var d = Math.min(devicePixelRatio || 1, 2);
    cv.width = cv.clientWidth * d; cv.height = cv.clientHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  function seedPetals() {
    var n = innerWidth < 700 ? 16 : 28; petals = [];
    for (var i = 0; i < n; i++) petals.push({ x: Math.random() * cv.clientWidth, y: Math.random() * cv.clientHeight, s: 6 + Math.random() * 10, r: Math.random() * 6.28, vr: (Math.random() - .5) * .02, vy: .25 + Math.random() * .45, ph: Math.random() * 6.28, c: COLS[i % COLS.length], vx: 0 });
  }
  function drawPetals(t) {
    var w = cv.clientWidth, h = cv.clientHeight;
    ctx.clearRect(0, 0, w, h);
    petals.forEach(function (p) {
      var dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy;
      if (d2 < 14000) { var f = (14000 - d2) / 14000; p.vx += dx / Math.sqrt(d2 + 1) * f * .6; }
      p.vx *= .94;
      p.x += Math.sin(t / 1400 + p.ph) * .35 + p.vx; p.y += p.vy; p.r += p.vr;
      if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; }
      if (p.x < -20) p.x = w + 10; if (p.x > w + 20) p.x = -10;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(1, .55 + .45 * Math.abs(Math.sin(t / 900 + p.ph)));
      ctx.globalAlpha = .78; ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.moveTo(0, -p.s); ctx.bezierCurveTo(p.s * .9, -p.s * .6, p.s * .7, p.s * .7, 0, p.s);
      ctx.bezierCurveTo(-p.s * .7, p.s * .7, -p.s * .9, -p.s * .6, 0, -p.s); ctx.fill();
      ctx.globalAlpha = .5; ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(0, -p.s * .7); ctx.lineTo(0, p.s * .6); ctx.stroke();
      ctx.restore();
    });
  }
  function startPetals() { if (!petals.length) { sizeCanvas(); seedPetals(); } petalsOn = true; }
  var hero = $('[data-hero]');
  hero.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; });
  hero.addEventListener('pointerleave', function () { ptr.x = ptr.y = -999; });
  hero.addEventListener('pointerdown', function (e) { var r = cv.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; setTimeout(function () { ptr.x = ptr.y = -999; }, 500); });
  new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; }).observe(hero);

  // ------------------------------------------------------------ scroll-linked frame
  var nav = $('[data-nav]'), dock = $('[data-dock]'), sheets = $$('[data-sheet]'), prints = $$('[data-print]');
  var wordsPhoto = $('[data-words-photo]'), drift = $('[data-drift]'), driftRow = $('.drift-row'), shrink = $('[data-shrink]'), shrinkImg = $('img', shrink);
  function prog(el, a, b) { // 0 when el top is at a*vh, 1 when at b*vh
    var r = el.getBoundingClientRect(); return clamp((a * innerHeight - r.top) / ((a - b) * innerHeight), 0, 1);
  }
  function frame() {
    var y = scrollY, s = still();
    nav.classList.toggle('pill', y > 80);
    dock.classList.toggle('on', y > hero.offsetHeight * .6);
    loupeFrame();
    // gel gloss and the French focus pull
    var g = $('.gloss', sheets[0]); g.style.setProperty('--gl', s ? '20%' : (lerp(-80, 80, prog(sheets[0], 1, .1))) + '%');
    var f = $('[data-focus]'); f.style.setProperty('--blur', s ? '0' : String(lerp(9, 0, ease(prog(f, 1, .45)))));
    // prints drift at three depths
    prints.forEach(function (p, i) {
      if (s) { p.style.setProperty('--py', '0px'); return; }
      var r = p.getBoundingClientRect(), c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      p.style.setProperty('--py', (c * [-40, 60, -20, 50, -30, 70][i]).toFixed(1) + 'px');
    });
    // reviews: the photo drifts, the row is carried sideways by the scroll
    wordsPhoto.firstElementChild.style.setProperty('--wy', s ? '0px' : (-prog(wordsPhoto, 1, -1) * 12) + '%');
    if (s) driftRow.style.setProperty('--dx', '0px');
    else {
      var over = Math.max(0, driftRow.scrollWidth - drift.clientWidth), dp = prog(drift, 1, .05);
      driftRow.style.setProperty('--dx', ((lang() === 'he' ? 1 : -1) * over * ease(dp)).toFixed(1) + 'px');
    }
    // visit: the photo shrinks from full width into an almond frame
    var sp = s ? 1 : ease(prog(shrink, .95, .15)), w = shrink.clientWidth, h = shrink.clientHeight;
    var tw = Math.min(w * .62, h * .6), cs = (w - tw) / 2 / w * 100 * sp;
    var rx = (tw / 2) * sp, ry = (h * .3) * sp, rb = 22 * sp;
    shrinkImg.style.clipPath = 'inset(' + (6 * sp) + '% ' + cs + '% ' + (4 * sp) + '% ' + cs + '% round ' + rx + 'px ' + rx + 'px ' + rb + 'px ' + rb + 'px / ' + ry + 'px ' + ry + 'px ' + rb + 'px ' + rb + 'px)';
    shrinkImg.style.transform = 'scale(' + lerp(1.12, 1, sp) + ')';
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; frame(); }); } }, { passive: true });
  addEventListener('resize', function () { if (petals.length) sizeCanvas(); fitWord(); frame(); });

  // continuous loop only while something on screen needs it
  var loupeVisible = false;
  new IntersectionObserver(function (es) { loupeVisible = es[0].isIntersecting; }).observe(loupe);
  function loop(t) {
    if (heroVisible) {
      heroLensTick(t);
      if (petalsOn && !still()) drawPetals(t);
      else if (petals.length) ctx.clearRect(0, 0, cv.width, cv.height);
    }
    if (loupeVisible && !still()) loupeFrame();
    requestAnimationFrame(loop);
  }

  // print tilt toward the cursor
  if (finePointer) prints.forEach(function (p) {
    var inn = $('.pr-in', p);
    p.addEventListener('pointermove', function (e) {
      if (still()) return;
      var r = p.getBoundingClientRect();
      inn.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 10).toFixed(2) + 'deg');
      inn.style.setProperty('--rx', ((.5 - (e.clientY - r.top) / r.height) * 8).toFixed(2) + 'deg');
    });
    p.addEventListener('pointerleave', function () { inn.style.setProperty('--rx', '0deg'); inn.style.setProperty('--ry', '0deg'); });
  });
  // tile spotlight
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });

  // ------------------------------------------------------------ arrivals, odometer, footer wordmark
  $$('.loupe-head > *, .care-head > *, .prints-head > *, .score > *, .book-copy > *, .faq h2, .qs details, .visit-copy > *, .bento .tile').forEach(function (el) {
    var sib = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.setAttribute('data-rise', ''); el.style.setProperty('--d', String(Math.min(sib, 6)));
  });
  function odo(el) {
    var to = parseFloat(el.dataset.odo), dec = (el.dataset.odo.split('.')[1] || '').length, t0 = 0;
    if (still()) return;
    function st(t) { if (!t0) t0 = t; var k = ease(clamp((t - t0) / 1400, 0, 1)); el.textContent = (to * k).toFixed(dec); if (k < 1) requestAnimationFrame(st); }
    requestAnimationFrame(st);
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in'); io.unobserve(e.target);
      if (e.target.classList.contains('score')) $$('[lang="' + lang() + '"] .odo, .big-num .odo', e.target).forEach(odo);
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  $$('[data-rise],[data-print]').forEach(function (el) { io.observe(el); });
  io.observe($('.score'));

  var word = $('[data-word]');
  function fitWord() {
    var span = $('[lang="' + lang() + '"]', word); if (!span) return;
    if (!span.dataset.split) { span.innerHTML = Array.from(span.textContent).map(function (c) { return '<span class="ch">' + (c === ' ' ? '&nbsp;' : c) + '</span>'; }).join(''); span.dataset.split = '1'; }
    word.style.setProperty('--wf', '100px');
    var w = word.clientWidth, sw = span.getBoundingClientRect().width || 1;
    word.style.setProperty('--wf', Math.floor(100 * w / sw * .98) + 'px');
  }
  new IntersectionObserver(function (es) {
    var on = es[0].isIntersecting;
    $$('.ch', word).forEach(function (c, i) { c.style.transitionDelay = (on ? i * 45 : 0) + 'ms'; c.style.setProperty('--rise', on || still() ? '0%' : '60%'); });
  }, { threshold: .25 }).observe(word);

  // ------------------------------------------------------------ the appointment card (WhatsApp)
  var TR = { he: ['לק ג\'ל', 'מניקור', 'פדיקור רפואי'], en: ['gel polish', 'a manicure', 'a medical pedicure'] };
  var PART = { he: ['בבוקר', 'בצהריים', 'אחר הצהריים'], en: ['in the morning', 'around midday', 'in the afternoon'] };
  var pick = { tr: [0], day: -1, part: 0 };
  var weekEl = $('[data-week]'), msgEl = $('[data-msg]'), sendEl = $('[data-send]'), nameEl = $('[data-name]'), appt = $('[data-appt]');
  function buildWeek() {
    var l = lang(), n = now();
    if (pick.day < 0) { var d = n.d; var h = HOURS[d]; if (!h || n.m > h[1] - 60) { do { d = (d + 1) % 7; } while (!HOURS[d]); } pick.day = d; }
    $$('.day', weekEl).forEach(function (b) { b.remove(); });
    for (var i = 0; i < 7; i++) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'day'; b.dataset.day = i;
      b.disabled = !HOURS[i];
      b.setAttribute('aria-pressed', String(i === pick.day));
      b.setAttribute('aria-label', DAY[l][i] + (HOURS[i] ? '' : (l === 'he' ? ' · סגור' : ' · closed')));
      b.innerHTML = DAYS[l][i] + (HOURS[i] ? '' : '<small>' + (l === 'he' ? 'סגור' : 'closed') + '</small>');
      weekEl.appendChild(b);
    }
    partLimit();
  }
  function partLimit() { // Friday closes at 13:00
    var fri = pick.day === 5, inputs = $$('[data-part] input');
    inputs[2].disabled = fri;
    if (fri && pick.part === 2) { pick.part = 0; inputs[0].checked = true; }
  }
  weekEl.addEventListener('click', function (e) {
    var b = e.target.closest('.day'); if (!b || b.disabled) return;
    pick.day = +b.dataset.day; $$('.day', weekEl).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    partLimit(); write(true);
  });
  $$('.nl').forEach(function (b) {
    b.addEventListener('click', function () {
      var i = +b.dataset.tr, k = pick.tr.indexOf(i);
      if (k >= 0) { if (pick.tr.length > 1) pick.tr.splice(k, 1); } else pick.tr.push(i);
      pick.tr.sort();
      $$('.nl').forEach(function (x) { x.setAttribute('aria-pressed', String(pick.tr.indexOf(+x.dataset.tr) >= 0)); });
      write(true);
    });
  });
  $$('[data-part] input').forEach(function (r) { r.addEventListener('change', function () { pick.part = +r.value; write(true); }); });
  nameEl.addEventListener('input', function () { write(); });
  function list(a, l) { return a.length < 2 ? a[0] : a.slice(0, -1).join(', ') + (l === 'he' ? ' ו' : ' and ') + a[a.length - 1]; }
  function write(feed) {
    var l = lang(), tr = pick.tr.map(function (i) { return TR[l][i]; }), nm = nameEl.value.trim(), t;
    if (l === 'he') t = 'היי סוניה' + (nm ? ', כאן ' + nm : '') + '.\nאשמח לקבוע תור ל' + list(tr, l).replace(/^/, '') + ', ביום ' + DAY.he[pick.day] + ' ' + PART.he[pick.part] + '.\nמתי נוח לך?';
    else t = 'Hi Sonia' + (nm ? ', this is ' + nm : '') + '.\nI’d like to book ' + list(tr, l) + ' on ' + DAY.en[pick.day] + ' ' + PART.en[pick.part] + '.\nWhen suits you?';
    msgEl.textContent = t;
    sendEl.href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(t);
    if (feed && !still() && appt.animate) appt.animate([{ transform: 'translateY(-18px)', clipPath: 'inset(18px 0 0 0 round 0 0 26px 26px)' }, { transform: 'none', clipPath: 'inset(0 0 0 0 round 0 0 26px 26px)' }], { duration: 420, easing: 'cubic-bezier(.23,1,.32,1)' });
  }

  // ------------------------------------------------------------ start
  setAlts(); split(); status(); buildWeek(); write(); tagText(0, true); fitWord();
  setInterval(status, 60000);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitWord(); frame(); });
  if (!still()) startPetals();
  deal();
  frame();
  requestAnimationFrame(loop);
})();
