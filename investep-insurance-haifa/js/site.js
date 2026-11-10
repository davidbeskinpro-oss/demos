(function () {
  var root = document.documentElement, WA = '972508330051';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 900; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'investep – צעדים פיננסים · סוכנות ביטוח · שדרות ההסתדרות 251, חיפה', en: 'investep – Financial Steps · Insurance agency · 251 HaHistadrut Ave, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור investep – צעדים פיננסים · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for investep – Financial Steps · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'investep – צעדים פיננסים', 'investep – Financial Steps');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-tabs]', 'שלבים', 'Stages');
    aria('[data-t-prev]', 'הקודם', 'Previous');
    aria('[data-t-next]', 'הבא', 'Next');
    aria('[data-t-run]', 'ביקורות', 'Reviews');
    aria('[data-t-picks]', 'נושאים', 'Topics');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-wa]', 'וואטסאפ ללירן', 'WhatsApp Liran');
    aria('[data-t-call]', 'התקשרו ללירן, 050-833-0051', 'Call Liran, 050-833-0051');
    aria('.rv .stars5', '5 כוכבים', '5 stars');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: שדרות ההסתדרות 251, חיפה' : 'Map: 251 HaHistadrut Ave, Haifa'; });
  }
  function waLinks() { $$('[data-wa]').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(he() ? 'שלום לירן, הגעתי דרך האתר.' : 'Hi Liran, I found you through the website.'); }); }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('iv-lang', l); } catch (e) {}
    texts(l); waLinks(); write(); decodeReset(); requestAnimationFrame(frame);
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('iv-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
    curtain(); sq.kick(); setStage(stage, true); requestAnimationFrame(frame);
  }); });
  motionUI();

  // ---------------------------------------------------------------- reveals (staggered per section)
  $$('section').forEach(function (s) { $$('[data-reveal],[data-tile]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 6) * 75 + 'ms'); }); });
  $$('[data-reveal],[data-tile]').forEach(function (el) {
    if (!io) { el.classList.add('in'); return; }
    var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { el.classList.add('in'); o.disconnect(); onIn(el); } }, { rootMargin: '0px 0px -8% 0px' });
    o.observe(el);
  });
  function onIn(el) { if (el.classList.contains('t-rate')) odo(); }

  // ---------------------------------------------------------------- odometer 4.9
  function odo() { $$('[data-odo]').forEach(function (d) { d.style.setProperty('--o', -d.dataset.odo + 'em'); }); }
  if (still() || !io) odo();

  // ---------------------------------------------------------------- glyph decode tile
  var dec = $('[data-decode]'), decT = 0, decI = 0, decTimer = null;
  var WORDS = { he: ['שאלה מורכבת', 'תשובה ברורה'], en: ['A tangled question', 'A clear answer'] };
  var GLY = { he: 'אבגדהוזחטיכלמנסעפצקרשת', en: 'ABCDEFGHJKLMNPRSTUVWXYZ' };
  function decodeTo(word) {
    var l = root.lang, g = GLY[l], n = 0, steps = 16;
    clearInterval(decT);
    if (still()) { dec.textContent = word; return; }
    decT = setInterval(function () {
      n++;
      var out = '';
      for (var i = 0; i < word.length; i++) out += word[i] === ' ' ? ' ' : (i < (n / steps) * word.length ? word[i] : g[(Math.random() * g.length) | 0]);
      dec.textContent = out;
      if (n >= steps) clearInterval(decT);
    }, 45);
  }
  function decodeReset() { decI = 1; dec.textContent = WORDS[root.lang][1]; }
  decodeReset();
  watch(dec, function (vis) {
    clearInterval(decTimer);
    if (!vis) return;
    decodeTo(WORDS[root.lang][decI]);
    decTimer = setInterval(function () { if (still()) return; decI = 1 - decI; decodeTo(WORDS[root.lang][decI]); }, 3200);
  });

  // ---------------------------------------------------------------- tiles: spotlight + photo parallax (pointer), scroll-driven on touch
  $$('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) {
      if (!fine) return;
      var r = t.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      t.style.setProperty('--mx', x + 'px'); t.style.setProperty('--my', y + 'px'); t.style.setProperty('--sp', 1);
      if (!still() && t.hasAttribute('data-spot')) { t.style.setProperty('--px', ((x / r.width) - .5) * -18 + 'px'); t.style.setProperty('--py', ((y / r.height) - .5) * -14 + 'px'); }
    });
    t.addEventListener('pointerleave', function () { t.style.setProperty('--sp', 0); t.style.setProperty('--px', '0px'); t.style.setProperty('--py', '0px'); });
  });

  // ---------------------------------------------------------------- business card: tilt toward the hand, turn on tap
  var tilt = $('[data-tilt]'), card = $('[data-flip]');
  function flip() { card.classList.toggle('flipped'); }
  $('[data-flip-btn]').addEventListener('click', flip);
  card.addEventListener('click', flip);
  tilt.addEventListener('pointermove', function (e) {
    if (!fine || still()) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty('--tx', ((e.clientX - r.left) / r.width - .5) * 16 + 'deg');
    card.style.setProperty('--ty', ((e.clientY - r.top) / r.height - .5) * -12 + 'deg');
  });
  tilt.addEventListener('pointerleave', function () { card.style.setProperty('--tx', '0deg'); card.style.setProperty('--ty', '0deg'); });
  var flippedOnce = false;
  watch(card, function (v) { if (v && !flippedOnce && !still()) { flippedOnce = true; setTimeout(function () { card.classList.add('flipped'); setTimeout(function () { card.classList.remove('flipped'); }, 2200); }, 900); } }, { threshold: .7 });

  // ---------------------------------------------------------------- hero squares: the logo's frame and green square, made of small squares
  var sq = (function () {
    var cv = $('[data-squares]'), cx = cv.getContext('2d'), hero = $('[data-hero]'), copy = $('.hero-copy');
    var R = [[0, 0, .499, .147], [0, 0, .147, 1], [0, .853, 1, .147], [.853, .537, .147, .463]], G = [.527, .192, .299, .299];
    var P = [], W = 0, H = 0, dpr = 1, t0 = 0, run = false, vis = true, mx = -999, my = -999;
    function inside(x, y, r) { return x >= r[0] && x <= r[0] + r[2] && y >= r[1] && y <= r[1] + r[3]; }
    function build() {
      P = []; var n = phone() ? 15 : 19, c = 1 / n;
      for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
        var x = (i + .5) * c, y = (j + .5) * c, g = inside(x, y, G), s = R.some(function (r) { return inside(x, y, r); });
        if (g || s) P.push({ x: x, y: y, g: g, sx: Math.random(), sy: Math.random() * 1.3 - .15, ph: Math.random() * 6.28, d: Math.random() });
      }
      for (var k = 0; k < (phone() ? 26 : 46); k++) P.push({ free: 1, x: Math.random(), y: Math.random(), ph: Math.random() * 6.28, d: Math.random(), g: Math.random() < .12 });
      P.cell = c;
    }
    function size() {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function box() {
      var top = copy.getBoundingClientRect().top - hero.getBoundingClientRect().top;
      if (phone()) { var s = clamp(Math.min(W * .44, top - 130), 90, 200); return { s: s, x: W / 2 - s / 2, y: Math.max(84, top - s - 34) }; }
      var s2 = clamp(Math.min(W * .24, top - 150, 400), 160, 400);
      return { s: s2, x: (he() ? W * .18 : W * .82) - s2 / 2, y: Math.max(110, top - s2 - 40) };
    }
    function draw(now) {
      var b = box(), c = P.cell * b.s, sz = c * .78, t = still() ? 1 : smooth((now - t0 - 450) / 1500);
      var r = hero.getBoundingClientRect(), sp = still() ? 0 : clamp(-r.top / (r.height * .8), 0, 1);
      cx.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++) {
        var p = P[i], x, y, a = 1, s = sz;
        if (p.free) {
          if (still()) continue;
          x = p.x * W + Math.sin(now / 2400 + p.ph) * 20; y = ((p.y - now / 90000 * (1 + p.d)) % 1 + 1) % 1 * H; s = 4 + p.d * 7; a = .25 + p.d * .35;
        } else {
          var hx = b.x + p.x * b.s - sz / 2, hy = b.y + p.y * b.s - sz / 2;
          var fx = p.sx * W, fy = p.sy * H, k = clamp(t * 1.35 - p.d * .35, 0, 1); k = smooth(k);
          x = fx + (hx - fx) * k; y = fy + (hy - fy) * k;
          if (!still()) { x += Math.sin(now / 1800 + p.ph) * 1.6; y += Math.cos(now / 2100 + p.ph) * 1.6; }
          // scrolling away: the mark shears into a staircase and lifts off
          y -= sp * (60 + p.x * 260); x += (he() ? 1 : -1) * sp * p.y * 40; a = 1 - sp * .85;
          var dx = x - mx, dy = y - my, dd = dx * dx + dy * dy;
          if (dd < 9000 && !still()) { var f = (1 - dd / 9000) * 22, dl = Math.sqrt(dd) || 1; x += dx / dl * f; y += dy / dl * f; }
        }
        cx.globalAlpha = a;
        cx.fillStyle = p.g ? '#74c92f' : 'rgba(150,152,158,.9)';
        cx.beginPath(); if (cx.roundRect) cx.roundRect(x, y, s, s, s * .14); else cx.rect(x, y, s, s); cx.fill();
      }
      cx.globalAlpha = 1;
    }
    function loop(now) { if (!run) return; draw(now); requestAnimationFrame(loop); }
    function kick() {
      run = false;
      size();
      if (still()) { draw(performance.now()); return; }
      if (vis) { run = true; requestAnimationFrame(loop); }
    }
    build(); size(); t0 = performance.now();
    addEventListener('resize', function () { var p = phone(); build(); kick(); });
    hero.addEventListener('pointermove', function (e) { if (!fine) return; var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
      if (!still()) { hero.style.setProperty('--hx', ((e.clientX / innerWidth) - .5) * -16 + 'px'); hero.style.setProperty('--hy', ((e.clientY / innerHeight) - .5) * -10 + 'px'); } });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    watch(hero, function (v) { vis = v; kick(); });
    return { kick: kick, draw: draw };
  })();

  // ---------------------------------------------------------------- the board: a real photo cut into squares
  var board = $('[data-board]'), wrap = board.parentNode, climber = $('[data-climber]'), stepSec = $('[data-step]');
  var tiles = [], cols = 8, rows = 6, stage = 0, hotSet = {};
  function buildBoard() {
    cols = innerWidth <= 560 ? 6 : 8; rows = 6;
    board.style.setProperty('--cols', cols); board.style.setProperty('--rows', rows);
    board.innerHTML = ''; tiles = [];
    var seed = 7; var rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    hotSet = {}; [[1, 1], [3, 2], [5, 1], [2, 4], [6, 3], [4, 4]].forEach(function (h) { if (h[0] < cols) hotSet[h[0] + ',' + h[1]] = 1; });
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var el = document.createElement('div'); el.className = 'tl' + (hotSet[c + ',' + r] ? ' hot' : '');
      var pos = (c / (cols - 1) * 100) + '% ' + (r / (rows - 1) * 100) + '%';
      el.innerHTML = '<b class="fa" style="background-position:' + pos + '"></b><b class="fb" style="background-position:' + pos + '"></b>';
      board.appendChild(el);
      tiles.push({ el: el, c: c, r: r, z: 30 + rnd() * 90, d: (c + (rows - 1 - r)) / (cols + rows - 2) });
    }
    board.style.direction = 'ltr';
  }
  function paint(p) {
    var sep = smooth((p - .2) / .2) * (1 - smooth((p - .58) / .16));
    board.style.setProperty('--gap', (sep * (phone() ? 6 : 10)).toFixed(2));
    for (var i = 0; i < tiles.length; i++) {
      var t = tiles[i], s = t.el.style;
      var f = smooth((p - .6 - t.d * .26) / .12);
      s.setProperty('--ly', (sep * (t.d - .5) * -40).toFixed(1));
      s.setProperty('--lz', (sep * t.z).toFixed(1));
      s.setProperty('--rad', (sep * 8 + f * (1 - f) * 20).toFixed(1));
      s.setProperty('--rot', (f * 180).toFixed(1));
      if (hotSet[t.c + ',' + t.r]) s.setProperty('--hl', sep.toFixed(2));
    }
    // the green square climbs the diagonal once the new picture is being set
    var q = clamp((p - .62) / .34, 0, 1), n = Math.min(cols, rows), k = q * (n - 1), a = Math.floor(k), fr = k - a;
    climber.style.setProperty('--co', p > .6 ? Math.min(1, (p - .6) * 20) : 0);
    var wr = wrap.getBoundingClientRect();
    function at(j) {
      j = clamp(j, 0, n - 1);
      var c = Math.round(j * (cols - 1) / (n - 1)), r = rows - 1 - Math.round(j * (rows - 1) / (n - 1));
      if (he()) c = cols - 1 - c;
      var el = tiles[r * cols + c].el.getBoundingClientRect(), cw = climber.offsetWidth;
      return { x: el.left - wr.left + el.width / 2 - cw / 2, y: el.top - wr.top + el.height / 2 - cw / 2 };
    }
    var A = at(a), B = at(a + 1), e = smooth(fr), hop = Math.sin(fr * Math.PI) * (phone() ? 22 : 36);
    climber.style.setProperty('--cx', (A.x + (B.x - A.x) * e).toFixed(1) + 'px');
    climber.style.setProperty('--cy', (A.y + (B.y - A.y) * e - hop).toFixed(1) + 'px');
  }
  var caps = $$('[data-cap]'), chips = $$('[data-go]');
  function markStage(s) {
    caps.forEach(function (c) { c.classList.toggle('on', +c.dataset.cap === s); });
    chips.forEach(function (c) { c.setAttribute('aria-pressed', +c.dataset.go === s ? 'true' : 'false'); });
  }
  var STAGE_P = [.08, .44, 1];
  function setStage(s, quiet) { stage = clamp(s, 0, 2); markStage(stage); if (still()) paint(STAGE_P[stage]); }
  function stepProgress() {
    var r = stepSec.getBoundingClientRect(), span = stepSec.offsetHeight - innerHeight;
    return span > 0 ? clamp(-r.top / span, 0, 1) : 0;
  }
  chips.forEach(function (c) { c.addEventListener('click', function () {
    var s = +c.dataset.go;
    if (still()) { setStage(s); return; }
    var span = stepSec.offsetHeight - innerHeight, top = stepSec.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + span * [.06, .42, .96][s], behavior: 'smooth' });
  }); });
  $('[data-prev]').addEventListener('click', function () { setStage(stage - 1); });
  $('[data-next]').addEventListener('click', function () { setStage(stage + 1); });

  // ---------------------------------------------------------------- composer: each pick becomes a step; the message writes itself
  var PICK = {
    he: ['יש לי פוליסה ואני רוצה להבין אותה', 'אני רוצה לעשות סדר בביטוחים שלי', 'יש לי שאלה כספית מורכבת', 'אני רוצה לתאם פגישה'],
    en: ['I have a policy I’d like to understand', 'I’d like to sort out my insurance', 'I have a complex money question', 'I’d like to set up a meeting']
  };
  var picks = $$('[data-pick]'), nameIn = $('[data-name]'), msgEl = $('[data-msg]'), build = $('[data-build]');
  function message() {
    var l = root.lang, on = picks.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return PICK[l][+b.dataset.pick]; });
    var nm = (nameIn.value || '').trim().slice(0, 40);
    if (l === 'he') return 'שלום לירן,' + (nm ? ' כאן ' + nm + '.' : '') + '\nהגעתי דרך האתר.' + (on.length ? '\n' + on.map(function (x) { return '• ' + x; }).join('\n') : '\nאשמח לדבר איתך.') + '\nתודה!';
    return 'Hi Liran,' + (nm ? ' this is ' + nm + '.' : '') + '\nI found you through the website.' + (on.length ? '\n' + on.map(function (x) { return '• ' + x; }).join('\n') : '\nI’d like to talk.') + '\nThanks!';
  }
  function write() {
    var m = message(), url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    msgEl.textContent = m; var cur = document.createElement('span'); cur.className = 'cur'; msgEl.appendChild(cur);
    $('[data-send]').href = url;
    var k = picks.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).length, bars = $$('i', build), sqb = $('b', build);
    bars.forEach(function (b, i) { b.classList.toggle('on', i < k); });
    // offset* ignore the bars' scale transition, so the square lands where the step will be
    var t = bars[Math.max(k, 1) - 1], x = t.offsetLeft + t.offsetWidth / 2 - 17, y = k > 0 ? -t.offsetHeight : 0;
    sqb.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  }
  picks.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); write(); }); });
  nameIn.addEventListener('input', write);

  // ---------------------------------------------------------------- footer curtain (only when it fits the screen)
  var foot = $('[data-foot]');
  function curtain() { foot.classList.toggle('curtain', !still() && foot.offsetHeight < innerHeight - 40); }

  // ---------------------------------------------------------------- scroll frame
  var nav = $('[data-nav]'), meterSq = $('.meter-sq'), secs = ['top', 'who', 'ask', 'step', 'say', 'visit'].map(function (id) { return document.getElementById(id); });
  var frameIn = $('[data-frame-in]'), whoSec = $('[data-frame]'), askIn = $('[data-shrink]'), seam = $('[data-seam]'), seamI = $$('i', seam), footLogo = $('.foot-logo');
  var lastStage = -1;
  function frame() {
    var vh = innerHeight, y = scrollY;
    nav.classList.toggle('gathered', y > 40);
    // mini staircase in the nav
    var cur = 0; secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < vh * .45) cur = i; });
    meterSq.style.transform = 'translate(' + cur * 10 + 'px,' + (-cur * 4) + 'px)';
    if (still()) {
      frameIn.style.removeProperty('--fi'); frameIn.style.removeProperty('--fs');
      askIn.style.removeProperty('--sk'); askIn.style.removeProperty('--so');
      seamI.forEach(function (i) { i.classList.add('lit'); i.style.removeProperty('--sg'); });
      return;
    }
    // WHO: the frame opens from a square
    var wr = whoSec.getBoundingClientRect(), wp = smooth((vh - wr.top) / (vh * .75));
    frameIn.style.setProperty('--fi', ((1 - wp) * 14).toFixed(2) + '%');
    frameIn.style.setProperty('--fs', ((1 - wp) * (phone() ? 8 : 26)).toFixed(2) + '%');
    // ASK sinks back as the board rides up over it
    var sr = stepSec.getBoundingClientRect(), cp = smooth((vh - sr.top) / vh);
    askIn.style.setProperty('--sk', (1 - cp * .06).toFixed(4)); askIn.style.setProperty('--so', (1 - cp * .55).toFixed(3));
    // the board
    var p = stepProgress(); paint(p);
    var s = p < .3 ? 0 : p < .62 ? 1 : 2; if (s !== lastStage) { lastStage = s; stage = s; markStage(s); }
    // seam: steps rise and light one by one
    var mr = seam.getBoundingClientRect(), mp = clamp((vh - mr.top) / (vh * .7), 0, 1);
    seamI.forEach(function (i, k) { var e = smooth(mp * 1.6 - k * .08); i.style.setProperty('--sg', e.toFixed(3)); i.classList.toggle('lit', mp > (k + 1) / 9); });
    // footer logo settles in
    var fr = foot.getBoundingClientRect(), fp = smooth((vh - fr.top) / (vh * .6));
    footLogo.style.setProperty('--fy', ((1 - fp) * 40).toFixed(1) + 'px'); footLogo.style.setProperty('--fsc', (.92 + fp * .08).toFixed(3));
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; frame(); }); } }, { passive: true });
  addEventListener('resize', function () { buildBoard(); curtain(); setStage(stage); frame(); write(); });

  // ---------------------------------------------------------------- start
  waLinks();
  if (still()) $$('[data-reveal],[data-tile]').forEach(function (el) { el.classList.add('in'); });
  texts(root.lang); buildBoard(); setStage(0); curtain(); write(); frame();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { write(); frame(); });
})();
