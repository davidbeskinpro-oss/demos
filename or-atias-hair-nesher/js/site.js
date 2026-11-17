(function () {
  var root = document.documentElement, WA = '972535551334';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 800; };
  var TITLE = { he: 'אור אטיאס · עיצוב שיער · העמק 3, נשר', en: 'Or Atias · Hair design · 3 HaEmek St, Nesher' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור אור אטיאס עיצוב שיער · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Or Atias Hair Design · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-call]', 'להתקשר לאור, 053-555-1334', 'Call Or, 053-555-1334');
    aria('[data-t-sw]', 'טיפולים', 'Treatments');
    aria('[data-t-sun]', 'מתי נוח', 'When suits you');
    aria('[data-barange]', 'לפני ואחרי: הזזת המחליק', 'Before and after: move the iron');
    $$('[data-dec]').forEach(function (f) { f.textContent = f.dataset[l]; });
    decodeHero(true);
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('oa-lang', l); } catch (e) {}
    texts(l); hours(); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('oa-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI(); $$('[data-tile]').forEach(function (el) { el.classList.add('in'); });
    strands.kick(); layout(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [8.5, 20], 1: [8.5, 20], 2: [8.5, 20], 3: [8.5, 20], 4: [8.5, 20], 5: [8.5, 14], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && t[0] === 0 && t[1] === 24) { open = true; txt = l ? 'פתוח עכשיו' : 'Open now'; }
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

  // ---------------------------------------------------------------- headline letter by letter, out of a blur
  $$('[data-split] .ln > span[lang]').forEach(function (sp) {
    var i = 0;
    sp.innerHTML = sp.textContent.split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  });

  // ---------------------------------------------------------------- the hero's line decodes from scattered letters into each treatment in turn
  var dec = $('[data-decode]'), decSpan = dec.firstElementChild, decI = 0, decT = 0;
  var GLY = function () { return he() ? 'אבגדהוזחטיכלמנסעפצקרשת' : 'abcdefghijklmnopqrstuvwxyz'; };
  var rnd = function () { var g = GLY(); return g[Math.floor(Math.random() * g.length)]; };
  function decodeTo(word, instant) {
    clearInterval(decT);
    if (instant || still()) { decSpan.textContent = word; return; }
    var f = 0, n = word.length;
    decT = setInterval(function () {
      f++; var out = '';
      for (var k = 0; k < n; k++) out += word[k] === ' ' ? ' ' : k < f / 2 ? word[k] : rnd();
      decSpan.textContent = out; if (f / 2 >= n) clearInterval(decT);
    }, 40);
  }
  function decodeHero(instant) { var words = dec.dataset[root.lang].split('·'); decodeTo(words[decI % words.length], instant); }
  setInterval(function () { if (still() || document.hidden) return; decI++; decodeHero(); }, 2600);

  // ---------------------------------------------------------------- strands of golden light: flowing hair that parts under the hand
  var hero = $('[data-hero]'), nav = $('[data-nav]');
  var strands = (function () {
    var cv = $('[data-strands]'), c = cv.getContext('2d'), w, h, raf = 0, vis = true, mx = -9999, my = -9999, S = [];
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 26 : 46; S = [];
      for (var i = 0; i < n; i++) S.push({ x: (i + Math.random()) / n, a: 18 + Math.random() * 40, f: .6 + Math.random() * 1.4, p: Math.random() * 6.28, lw: .8 + Math.random() * 2, al: .22 + Math.random() * .4, hue: Math.random() < .7 ? '233,191,134' : '231,154,169' });
    }
    function draw(T) {
      c.clearRect(0, 0, w, h); c.lineCap = 'round';
      var sc = clamp(-hero.getBoundingClientRect().top / h, 0, 1);
      for (var i = 0; i < S.length; i++) {
        var s = S[i], bx = s.x * w; c.beginPath();
        for (var y = -20; y <= h + 20; y += 18) {
          var x = bx + Math.sin(y / 140 * s.f + T * .6 + s.p) * s.a + Math.sin(y / 60 + T * .9 + s.p) * 4 + sc * (s.x - .5) * 160;
          var dx = x - mx, dy = y - my, d2 = dx * dx + dy * dy;
          if (d2 < 22000) x += (dx >= 0 ? 1 : -1) * (22000 - d2) / 22000 * 70;    // the comb parts the strands
          y === -20 ? c.moveTo(x, y) : c.lineTo(x, y);
        }
        c.strokeStyle = 'rgba(' + s.hue + ',' + (s.al * (1 - sc * .7)).toFixed(3) + ')'; c.lineWidth = s.lw; c.stroke();
      }
    }
    function frame(t) { raf = 0; draw(still() ? 0 : t / 1000); if (!still() && vis) raf = requestAnimationFrame(frame); }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -9999; });
    watch(hero, function (v) { vis = v; kick(); });
    // phones: a slow comb passes through by itself
    setInterval(function () { if (!phone() || still() || !vis) return; var t = performance.now() / 1000; mx = w * (.5 + .45 * Math.sin(t * .5)); my = h * (.35 + .25 * Math.cos(t * .37)); }, 50);
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- opening: her photos are dealt off the frame, the last becomes the hero
  function dealOut() {
    if (still()) return;
    $$('.deal img').reverse().forEach(function (im, i) {
      im.style.setProperty('--dx', (i % 2 ? -1 : 1) * (110 + i * 8) + '%'); im.style.setProperty('--dr', (i % 2 ? -1 : 1) * (10 + i * 3) + 'deg');
      setTimeout(function () { im.classList.add('out'); }, 260 + i * 190);
    });
  }

  // ---------------------------------------------------------------- foils: one strip folds away at a time with the scroll
  var foil = $('[data-foil]'), fbox = $('[data-foils]'), fmeter = $('[data-fmeter]'), N = 9, fl = [];
  for (var k = 0; k < N; k++) { var i = document.createElement('i'); fbox.appendChild(i); fl.push(i); }
  var ORDER = [4, 1, 7, 2, 6, 0, 5, 8, 3];

  // ---------------------------------------------------------------- before / after: the flat iron
  var ba = $('[data-ba]'), range = $('[data-barange]'), touched = false;
  function setX(v) { ba.style.setProperty('--x', v + '%'); range.value = Math.round(v); }
  range.addEventListener('input', function () { touched = true; setX(+range.value); });

  // ---------------------------------------------------------------- work band: decoding labels
  var work = $('[data-work]'), band = $('[data-band]');
  watch(work, function (v) { if (!v || still()) return; $$('[data-dec]').forEach(function (f, i) { setTimeout(function () { var word = f.dataset[root.lang], fr = 0; var t = setInterval(function () { fr++; var o = ''; for (var q = 0; q < word.length; q++) o += word[q] === ' ' ? ' ' : q < fr / 2 ? word[q] : rnd(); f.textContent = o; if (fr / 2 >= word.length) { clearInterval(t); f.textContent = word; } }, 40); }, i * 160); }); }, { threshold: .3 });
  $$('.wc').forEach(function (c) {
    c.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse' || still()) return; var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = 'perspective(800px) rotateY(' + (x * 8).toFixed(2) + 'deg) rotateX(' + (-y * 8).toFixed(2) + 'deg)'; });
    c.addEventListener('pointerleave', function () { c.style.transform = ''; });
  });

  // ---------------------------------------------------------------- bento: entrances + spotlight
  $$('[data-tile]').forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  var rio = io ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-tile]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><b data-n="' + ch + '"></b></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d dd" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join(''); o.setAttribute('role', 'img');
  });
  function roll(o, go) { $$('.dd', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 5) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) { roll(o, still()); watch(o, function (v) { if (v) roll(o, true); }, { threshold: .3 }); });

  // ---------------------------------------------------------------- composer: her photos as swatches, the sun's arc for the time of day
  var trs = $$('[data-tr]'), whens = $$('[data-when]'), steps = $$('[data-step]'), msgEl = $('[data-msg]'), dot = $('[data-sundot]'), sunBox = $('.sun');
  var shown = '', typing = 0, chatSeen = false;
  function light(n) { steps.forEach(function (s, i) { if (i <= n) s.classList.add('on'); }); }
  trs.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); light(0); write(); }); });
  whens.forEach(function (b) { b.addEventListener('click', function () { whens.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); light(1); placeSun(); write(); }); });
  $('[data-send]').addEventListener('pointerenter', function () { light(2); });
  $('[data-send]').addEventListener('focus', function () { light(2); });
  function placeSun() {
    var i = whens.findIndex(function (x) { return x.getAttribute('aria-checked') === 'true'; }), b = whens[i];
    var bx = b.offsetLeft + b.offsetWidth / 2, W = sunBox.clientWidth, u = bx / W;   // sit on the arc above the chosen button
    var y = 6 + 84 * (1 - 4 * u * (1 - u) * .96) * .9;
    dot.style.transform = 'translate(' + bx + 'px,' + y.toFixed(1) + 'px)';
  }
  function list(items, l) {
    if (l) return items.map(function (x, i) { return (i === 0 ? 'ל' : i === items.length - 1 ? ' ול' : ', ל') + x; }).join('');
    return items.length < 2 ? items.join('') : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }
  function compose() {
    var l = he(), picked = trs.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.dataset[l ? 'he' : 'en']; });
    var w = whens.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0].dataset[l ? 'he' : 'en'];
    return l ? 'היי אור, אשמח לקבוע תור' + (picked.length ? ' ' + list(picked, true) : '') + '. הכי נוח לי ' + w + '. תודה'
             : 'Hi Or, I’d like to book' + (picked.length ? ' ' + list(picked, false) : ' a visit') + '. ' + w.charAt(0).toUpperCase() + w.slice(1) + ' suits me best. Thanks';
  }
  function write(instant) {
    var target = compose();
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !chatSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 16);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown; if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  watch($('[data-chat]'), function (v) { if (v && !chatSeen) { chatSeen = true; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // reviews: two copies so the drift loops seamlessly (the copy is hidden from assistive tech)
  var row = $('[data-row]'); $$('.rv', row).forEach(function (r) { var k = r.cloneNode(true); k.setAttribute('aria-hidden', 'true'); row.appendChild(k); });

  // footer name in letters, fitted to its width
  var word = $('[data-word]');
  $$('span[lang]', word).forEach(function (sp) { sp.innerHTML = sp.textContent.split('').map(function (c) { return c === ' ' ? ' ' : '<span class="lt">' + c + '</span>'; }).join(''); });
  function fitWord() { word.style.fontSize = ''; var cs = parseFloat(getComputedStyle(word).fontSize), W = word.parentNode.clientWidth, s = $('span[lang="' + root.lang + '"]', word); if (s && s.scrollWidth > W) word.style.fontSize = (cs * W / s.scrollWidth * .98) + 'px'; }

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still(), vh = innerHeight;
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) strands.kick();
    // foils
    var fp = calm ? 1 : prog(foil);
    ORDER.forEach(function (o, i) { var t = calm ? 1 : smooth((fp - .08 - i * .075) / .14); fl[o].style.setProperty('--s', (1 - t).toFixed(3)); });
    fmeter.style.setProperty('--p', fp.toFixed(3));
    // the iron glides with the scroll until it is touched
    if (!touched && !calm) { var br = ba.getBoundingClientRect(), bp = clamp((vh - br.top) / (vh + br.height), 0, 1); setX(88 - smooth((bp - .2) / .5) * 76 + Math.sin(bp * 6) * 0); }
    // work band
    if (!calm) {
      var wp = prog(work), dist = Math.max(0, band.scrollWidth - innerWidth);
      band.style.transform = 'translate3d(' + ((rtl() ? 1 : -1) * dist * wp).toFixed(1) + 'px,0,0)';
    }
    // footer letters rise
    // the curtain: how much of the footer the page has uncovered
    var fh = $('[data-foot]').offsetHeight, mb = $('main').getBoundingClientRect().bottom, fpp = calm ? 1 : clamp((vh - mb) / Math.max(1, fh * .75), 0, 1);
    $$('span[lang="' + root.lang + '"] .lt', word).forEach(function (lt, i) { var v = calm ? 1 : smooth(fpp * 1.8 - i * .1); lt.style.setProperty('--ty', ((1 - v) * 60).toFixed(1) + 'px'); lt.style.setProperty('--op', (.15 + v * .85).toFixed(3)); });
  }
  function layout() {
    strands.size();
    // the work section is tall enough to carry the band its full width
    work.style.height = still() ? '' : (Math.max(0, band.scrollWidth - innerWidth) + innerHeight) + 'px';
    placeSun(); fitWord(); tick();
  }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write(true); layout();
  var once = false, go = function () { if (once) return; once = true; requestAnimationFrame(function () { hero.classList.add('ready'); dealOut(); }); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 900);
  addEventListener('load', layout);
})();
