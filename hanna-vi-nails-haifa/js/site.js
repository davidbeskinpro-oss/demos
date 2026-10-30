(function () {
  var root = document.documentElement, WA = '972546478515';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 900; };
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var TITLE = { he: 'Hanna Vi Nails · מניקור ופדיקור · כיכר מאירהוף 4, חיפה', en: 'Hanna Vi Nails · Manicure & pedicure · 4 Meirhof Square, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור Hanna Vi Nails · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Hanna Vi Nails · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-rack]', 'צבעים', 'Colours');
    aria('[data-t-when]', 'מתי נוח', 'When suits you');
    aria('[data-t-call]', 'התקשרו לחנה, 054-647-8515', 'Call Hanna, 054-647-8515');
    aria('[data-t-wa]', 'וואטסאפ לחנה', 'WhatsApp Hanna');
    $$('[data-t-map]').forEach(function (f) { f.title = l === 'he' ? 'מפה: כיכר מאירהוף 4, חיפה' : 'Map: 4 Meirhof Square, Haifa'; });
    $$('.sw').forEach(function (b) { b.setAttribute('aria-label', b.dataset[l]); });
    $$('.spot').forEach(function (s) { s.setAttribute('aria-label', s.dataset[l]); if (s.classList.contains('on')) $('.tag', s).textContent = s.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('hv-lang', l); } catch (e) {}
    texts(l); hours(); pick(cur, true); write(true); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on);
    try { localStorage.setItem('hv-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal],[data-tile],[data-land],.sprig,[data-wm]').forEach(function (el) { el.classList.add('in'); });
    layout(); glitter.kick(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [9, 19], 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [8, 16], 6: null };
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
      var val = !t ? (l ? 'סגור' : 'Closed') : t[0] === 0 && t[1] === 24 ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + name + '</td><td>' + val + '</td></tr>';
    }).join('');
    status();
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- entrances
  $$('.bento').forEach(function (g) { $$('[data-tile]', g).forEach(function (t, i) { t.style.setProperty('--d', (i % 4) * 80 + 'ms'); }); });
  $$('.r-row [data-land]').forEach(function (t, i) { t.style.setProperty('--d', i * 140 + 'ms'); });
  $$('.sprig .st').forEach(function (p) { p.setAttribute('pathLength', '1'); });
  $$('.tipline').forEach(function (p) { p.setAttribute('pathLength', '1'); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  $$('[data-reveal],[data-tile],[data-land],.sprig').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });
  // the gel layers peel again every time the tile comes back into view
  var off = $('.t-off'); watch(off, function (v) { if (v) { off.classList.remove('in'); void off.offsetWidth; off.classList.add('in'); } });

  // headline letter by letter
  $$('[data-split] .ln').forEach(function (ln, k) {
    var targets = $$('span[lang]', ln); if (!targets.length) targets = [ln];
    targets.forEach(function (sp) {
      var i = k ? 9 : 0;
      sp.innerHTML = sp.textContent.split(' ').map(function (w) {
        return '<span class="w" style="display:inline-block;white-space:nowrap">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  });
  // footer wordmark, letter by letter
  var wm = $('[data-wm]');
  wm.innerHTML = wm.textContent.split('').map(function (c, i) { return '<span class="l" style="--i:' + i + '">' + (c === ' ' ? '&nbsp;' : c) + '</span>'; }).join('');
  watch(wm, function (v) { if (v) wm.classList.add('in'); }, { threshold: .3 });

  // ---------------------------------------------------------------- glitter that gathers into her HV mark and scatters under the hand
  var glitter = (function () {
    var cv = $('[data-glitter]'), hero = $('[data-hero]'), c = cv.getContext('2d'), P = [], w = 0, h = 0, raf = 0, vis = true, t0 = 0, ptr = { x: -999, y: -999, a: 0 }, ok = false;
    var COL = ['#ffffff', '#d9d4df', '#c7b2d6', '#efc6d2', '#b9b5c0', '#e8dcf2'];
    var img = new Image(); img.src = 'img/logo-mark.png';
    function sample() {
      var s = phone() ? Math.min(w * .5, 210) : Math.min(h * .52, 420), ox, oy;
      var vis = $('.h-visual').getBoundingClientRect(), st = $('.h-stage').getBoundingClientRect();
      // behind the photo, peeking out from the side away from the copy
      if (phone()) { ox = (rtl() ? vis.right - st.left - s * .5 : vis.left - st.left - s * .5); oy = vis.top - st.top - s * .32; }
      else { ox = (rtl() ? vis.left - st.left - s * .62 : vis.right - st.left - s * .38); oy = vis.top - st.top - s * .3; }
      var g = document.createElement('canvas'), n = phone() ? 34 : 48; g.width = g.height = n;
      var gc = g.getContext('2d'); gc.drawImage(img, 0, 0, n, n);
      var d = gc.getImageData(0, 0, n, n).data, pts = [];
      for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (d[(y * n + x) * 4 + 3] > 120) pts.push([ox + x / n * s, oy + y / n * s]);
      var keep = P.length === pts.length;
      P = pts.map(function (p, i) {
        var q = keep ? P[i] : { x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, r: .9 + Math.random() * 1.9, c: COL[(Math.random() * COL.length) | 0], ph: Math.random() * 6.28, sp: .6 + Math.random() * 1.6 };
        q.hx = p[0] + (Math.random() - .5) * 2; q.hy = p[1] + (Math.random() - .5) * 2; return q;
      });
      // loose dust around the page
      for (var k = 0; k < (phone() ? 50 : 110); k++) P.push({ x: Math.random() * w, y: Math.random() * h, hx: Math.random() * w, hy: Math.random() * h, vx: 0, vy: 0, r: .5 + Math.random() * 1.2, c: COL[(Math.random() * COL.length) | 0], ph: Math.random() * 6.28, sp: .4 + Math.random(), free: 1 });
    }
    function size() { var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); if (ok) { sample(); if (still()) draw(performance.now(), true); } }
    function draw(now, fixed) {
      var t = (now - t0) / 1000;
      c.clearRect(0, 0, w, h);
      // on touch screens a soft breeze sweeps through the mark now and then
      if (!fine && !fixed) { var b = (t % 7) / 7; ptr.x = lerp(-80, w + 80, b); ptr.y = h * .35 + Math.sin(t) * 60; ptr.a = b < .99 ? 1 : 0; }
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        if (fixed) { p.x = p.hx; p.y = p.hy; }
        else {
          var hx = p.hx + (p.free ? Math.sin(t * .3 + p.ph) * 20 : 0), hy = p.hy + (p.free ? Math.cos(t * .25 + p.ph) * 14 : 0);
          var dx = p.x - ptr.x, dy = p.y - ptr.y, dd = dx * dx + dy * dy, R = phone() ? 70 : 110;
          if (ptr.a && dd < R * R) { var f = (1 - Math.sqrt(dd) / R) * 2.4; p.vx += dx / (Math.sqrt(dd) + .1) * f; p.vy += dy / (Math.sqrt(dd) + .1) * f; }
          p.vx += (hx - p.x) * .018; p.vy += (hy - p.y) * .018; p.vx *= .86; p.vy *= .86; p.x += p.vx; p.y += p.vy;
        }
        var tw = fixed ? .8 : .45 + .55 * Math.abs(Math.sin(t * p.sp + p.ph));
        c.globalAlpha = tw * (p.free ? .55 : .9); c.fillStyle = p.c;
        var r = p.r * (p.free ? 1 : 1.25);
        c.beginPath(); c.moveTo(p.x, p.y - r * 1.6); c.lineTo(p.x + r, p.y); c.lineTo(p.x, p.y + r * 1.6); c.lineTo(p.x - r, p.y); c.fill();
        if (tw > .93 && r > 1.4) { c.globalAlpha = (tw - .93) * 8; c.fillRect(p.x - r * 3, p.y - .4, r * 6, .8); c.fillRect(p.x - .4, p.y - r * 3, .8, r * 6); }
      }
      c.globalAlpha = 1;
    }
    function frame(now) { raf = 0; if (still() || !vis) return; draw(now); raf = requestAnimationFrame(frame); }
    function kick() { if (!ok) return; if (still()) { draw(performance.now(), true); return; } if (!raf) raf = requestAnimationFrame(frame); }
    img.onload = function () { ok = true; size(); t0 = performance.now(); kick(); };
    watch(hero, function (v) { vis = v; kick(); });
    hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = cv.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.a = 1; });
    hero.addEventListener('pointerleave', function () { ptr.a = 0; ptr.x = ptr.y = -999; });
    return { size: size, kick: kick };
  })();

  // ---------------------------------------------------------------- the swatch fan: opens on arrival, leans to the hand, turns with the scroll
  var tips = $$('.tip'), fanSpread = 0, fanLean = 0, fanScroll = 0;
  function fan() {
    var n = tips.length, s = rtl() ? -1 : 1;
    tips.forEach(function (t, i) {
      var a = s * (4 + i * (9 + fanLean * 2)) * fanSpread + s * fanScroll * (i + 1) * 6;
      t.style.setProperty('--r', a.toFixed(2) + 'deg');
    });
  }
  tips.forEach(function (t) { t.addEventListener('click', function () { pick(+t.dataset.swatch); $('#colors').scrollIntoView({ behavior: still() ? 'auto' : 'smooth' }); }); });
  var hv = $('.h-visual'), leaf = $('[data-leaf]');
  hv.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || still()) return;
    var r = hv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    fanLean = 1; fan();
    leaf.style.setProperty('--sx', (x * 60) + '%');
    leaf.dataset.tx = (x * 8).toFixed(2); leaf.dataset.ty = (-y * 8).toFixed(2); tick();
  });
  hv.addEventListener('pointerleave', function () { fanLean = 0; fan(); leaf.dataset.tx = leaf.dataset.ty = 0; tick(); });

  // ---------------------------------------------------------------- colours: a lacquer stroke paints the next real photo in
  var SRC = ['cow-print', 'french-hands-feet', 'black-gloss', 'nude-gloss', 'soft-french', 'french-glove'];
  var swatches = $$('.sw'), cphoto = $('[data-cphoto]'), curImg = $('.cur', cphoto), nxtImg = $('.nxt', cphoto), strokeEl = $('.stroke', cphoto);
  var cur = 2, busy = null, auto = null, touched = false;
  var GL = 'אבגדהוזחטיכלמנסעפצקרשתABCDEFGHKMNRSTVX';
  function decode(el, txt) {
    if (still()) { el.textContent = txt; return; }
    var f = 0, max = 14; clearInterval(el._t);
    el._t = setInterval(function () {
      f++; var k = Math.floor(txt.length * f / max);
      el.textContent = txt.slice(0, k) + txt.slice(k).replace(/\S/g, function () { return GL[(Math.random() * GL.length) | 0]; });
      if (f >= max) { clearInterval(el._t); el.textContent = txt; }
    }, 40);
  }
  function pick(i, quiet) {
    var b = swatches[i], name = b.dataset[he() ? 'he' : 'en'];
    swatches.forEach(function (s, k) { s.setAttribute('aria-selected', k === i ? 'true' : 'false'); s.tabIndex = k === i ? 0 : -1; });
    var alt = (he() ? 'עבודה של חנה: ' : 'Hanna’s work: ') + name;
    if (quiet) { $('[data-cname]').textContent = name; curImg.alt = alt; return; }
    decode($('[data-cname]'), name);
    if (i === cur && curImg.getAttribute('src').indexOf(SRC[i]) >= 0) return;
    cur = i;
    var src = 'img/' + SRC[i] + '.jpg';
    if (busy) { busy.forEach(function (a) { a.cancel(); }); busy = null; }
    if (still() || !nxtImg.animate) { curImg.src = src; curImg.alt = alt; return; }
    strokeEl.style.setProperty('--sc1', b.style.getPropertyValue('--c1')); strokeEl.style.setProperty('--sc2', b.style.getPropertyValue('--c2'));
    nxtImg.src = src;
    var go = function () {
      var hgt = cphoto.offsetHeight, ease = 'cubic-bezier(.65,0,.35,1)';
      busy = [
        nxtImg.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], { duration: 900, easing: ease, fill: 'forwards' }),
        strokeEl.animate([{ transform: 'translateY(-50px)', opacity: 1 }, { transform: 'translateY(' + (hgt - 20) + 'px)', opacity: 1, offset: .97 }, { transform: 'translateY(' + hgt + 'px)', opacity: 0 }], { duration: 900, easing: ease })
      ];
      busy[0].onfinish = function () { curImg.src = src; curImg.alt = alt; requestAnimationFrame(function () { if (busy) busy.forEach(function (a) { a.cancel(); }); busy = null; }); };
    };
    nxtImg.decode ? nxtImg.decode().then(go, go) : go();
  }
  swatches.forEach(function (b, i) {
    b.addEventListener('click', function () { touched = true; clearInterval(auto); pick(i); });
    b.addEventListener('keydown', function (e) {
      var d = { ArrowRight: rtl() ? -1 : 1, ArrowLeft: rtl() ? 1 : -1 }[e.key]; if (!d) return;
      e.preventDefault(); var n = (i + d + swatches.length) % swatches.length; touched = true; clearInterval(auto); pick(n); swatches[n].focus();
    });
  });
  // once in view, the rack plays through each colour one time
  var played = false;
  watch($('[data-colors]'), function (v) {
    if (!v || played || touched || still()) return; played = true; var k = 0;
    auto = setInterval(function () { if (touched || still() || ++k > swatches.length) { clearInterval(auto); return; } pick((cur + 1) % swatches.length); }, 3200);
  }, { threshold: .45 });
  var cstage = $('[data-cstage]');
  cstage.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || still()) return;
    var r = cphoto.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    cphoto.style.setProperty('--gx', x * 100 + '%'); cphoto.style.setProperty('--gy', y * 100 + '%');
    cphoto.style.setProperty('--tx', ((x - .5) * 8).toFixed(2) + 'deg'); cphoto.style.setProperty('--ty', ((.5 - y) * 6).toFixed(2) + 'deg');
  });
  cstage.addEventListener('pointerleave', function () { cphoto.style.setProperty('--tx', '0deg'); cphoto.style.setProperty('--ty', '0deg'); });

  // ---------------------------------------------------------------- up close: a loupe and labels that type themselves
  var tp = $('[data-tphoto]'), lens = $('.lens', tp), spots = $$('.spot', tp);
  function typeTag(sp, on) {
    var tag = $('.tag', sp), txt = sp.dataset[he() ? 'he' : 'en']; clearInterval(sp._t);
    sp.classList.toggle('on', on);
    if (!on) { tag.textContent = ''; return; }
    if (still()) { tag.textContent = txt; return; }
    var k = 0; tag.textContent = '';
    sp._t = setInterval(function () { tag.textContent = txt.slice(0, ++k); if (k >= txt.length) clearInterval(sp._t); }, 45);
  }
  function lensAt(x, y) {
    var r = tp.getBoundingClientRect(), z = 2.2;
    tp.style.setProperty('--lx', x + 'px'); tp.style.setProperty('--ly', y + 'px');
    lens.style.backgroundSize = (r.width * z) + 'px ' + (r.height * z) + 'px';
    lens.style.backgroundPosition = (-(x * z) + 75) + 'px ' + (-(y * z) + 75) + 'px';
  }
  function lensToSpot(sp) { var r = tp.getBoundingClientRect(); lensAt(parseFloat(sp.style.getPropertyValue('--x')) / 100 * r.width, parseFloat(sp.style.getPropertyValue('--y')) / 100 * r.height); }
  tp.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || still()) return;
    var r = tp.getBoundingClientRect(); tp.classList.add('looking'); lensAt(e.clientX - r.left, e.clientY - r.top);
    spots.forEach(function (sp) { var dx = parseFloat(sp.style.getPropertyValue('--x')) / 100 * r.width - (e.clientX - r.left), dy = parseFloat(sp.style.getPropertyValue('--y')) / 100 * r.height - (e.clientY - r.top); var near = dx * dx + dy * dy < 90 * 90; if (near !== sp.classList.contains('on')) typeTag(sp, near); });
  });
  tp.addEventListener('pointerleave', function () { tp.classList.remove('looking'); });
  spots.forEach(function (sp) { sp.addEventListener('click', function () { var on = !sp.classList.contains('on'); typeTag(sp, on); if (on && !still()) { tp.classList.add('looking'); lensToSpot(sp); } }); });
  // arriving: the loupe visits each point once and the labels type in
  var toured = false;
  watch(tp, function (v) {
    if (!v || toured) return; toured = true;
    if (still()) { spots.forEach(function (sp) { typeTag(sp, true); }); return; }
    spots.forEach(function (sp, i) { setTimeout(function () { tp.classList.add('looking'); lensToSpot(sp); typeTag(sp, true); }, 400 + i * 1300); });
    setTimeout(function () { if (!fine) tp.classList.remove('looking'); }, 400 + spots.length * 1300 + 600);
  }, { threshold: .5 });

  // ---------------------------------------------------------------- bento spotlight
  $$('[data-bento] .tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', e.clientX - r.left + 'px'); t.style.setProperty('--my', e.clientY - r.top + 'px'); });
    t.addEventListener('pointerleave', function () { if (fine) { t.style.setProperty('--mx', '-300px'); t.style.setProperty('--my', '-300px'); } });
  });

  // odometer
  var odo = $('[data-odo]');
  function roll(go) { $$('.d[data-to]', odo).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : 9; s.style.transitionDelay = go ? (i * 200) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  roll(still()); watch(odo, function (v) { roll(v || still()); }, { threshold: .6 });

  // ---------------------------------------------------------------- the note to Hanna, written as you choose
  var SV = { mani: ['מניקור', 'a manicure'], pedi: ['פדיקור', 'a pedicure'], gel: ['לק ג\'ל', 'gel polish'], off: ['הורדת לק ג\'ל', 'gel polish removal'], french: ['פרנץ\'', 'a French manicure'] };
  var WH = { am: ['בבוקר', 'Mornings work best for me.'], pm: ['אחר הצהריים', 'Afternoons work best for me.'], fri: ['ביום שישי', 'Friday works best for me.'] };
  var chosen = [], when = null, msgEl = $('[data-msg]'), sendEl = $('[data-send]'), steps = $$('[data-steps] li');
  function list(items, l) { if (items.length < 2) return items.join(''); return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
  function compose() {
    var l = he(), names = chosen.map(function (k) { return SV[k][l ? 0 : 1]; });
    if (l) return 'היי חנה, ' + (names.length ? 'אשמח לקבוע תור ל' + list(names, true) + '.' : 'אשמח לקבוע תור.') + (when ? ' נוח לי ' + WH[when][0] + '.' : '') + ' תודה!';
    return 'Hi Hanna, ' + (names.length ? 'I’d like to book ' + list(names, false) + '.' : 'I’d like to book an appointment.') + (when ? ' ' + WH[when][1] : '') + ' Thank you!';
  }
  function write(instant) {
    var txt = compose(); clearInterval(msgEl._t);
    sendEl.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(txt);
    steps.forEach(function (s, i) { s.classList.toggle('on', i === 0 ? chosen.length > 0 : i === 1 ? !!when : chosen.length > 0 && !!when); });
    if (instant || still()) { msgEl.classList.remove('typing'); msgEl.textContent = txt; return; }
    var start = msgEl.textContent, k = 0; while (k < start.length && start[k] === txt[k]) k++;
    msgEl.classList.add('typing');
    msgEl._t = setInterval(function () { msgEl.textContent = txt.slice(0, ++k); if (k >= txt.length) { clearInterval(msgEl._t); msgEl.classList.remove('typing'); } }, 22);
  }
  $$('[data-svc]').forEach(function (b) { b.addEventListener('click', function () {
    var k = b.dataset.svc, i = chosen.indexOf(k); if (i >= 0) chosen.splice(i, 1); else chosen.push(k);
    b.setAttribute('aria-pressed', i < 0 ? 'true' : 'false'); write();
  }); });
  $$('[data-when]').forEach(function (b) { b.addEventListener('click', function () {
    when = when === b.dataset.when ? null : b.dataset.when;
    $$('[data-when]').forEach(function (x) { x.setAttribute('aria-checked', x.dataset.when === when ? 'true' : 'false'); }); write();
  }); });
  // the first time the phone comes into view, the greeting types itself
  var greeted = false; watch($('.b-phone'), function (v) { if (v && !greeted) { greeted = true; msgEl.textContent = ''; write(); } }, { threshold: .5 });

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var nav = $('[data-nav]'), heroEl = $('[data-hero]'), copy = $('.h-copy'), dock = $('[data-dock]'), visit = $('[data-visit]'), vphoto = $('[data-vphoto]'), vframe = $('.v-frame'), vcards = $('.v-cards'), vstage = $('.v-stage');
  var tiles = $$('[data-bento] .tile'), revs = $$('.rv'), ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var y = scrollY, vh = innerHeight, s = still();
    nav.classList.toggle('gathered', y > 40);
    dock.classList.toggle('show', y > vh * .6);
    // hero: the leaf photo opens out to the whole screen, the copy steps back, the fan folds away
    var p = s ? 0 : clamp(y / (vh * .75), 0, 1), e = smooth(p);
    if (!s) {
      var r = hv.getBoundingClientRect(), st = $('.h-stage').getBoundingClientRect();
      var cx = st.left + st.width / 2 - (r.left + r.width / 2), cy = st.top + vh / 2 - (r.top + r.height / 2);
      var sc = Math.max(st.width / r.width, vh / r.height) * 1.02;
      var tx = +(leaf.dataset.tx || 0), ty = +(leaf.dataset.ty || 0);
      leaf.style.transform = 'translate(' + (cx * e).toFixed(1) + 'px,' + (cy * e).toFixed(1) + 'px) scale(' + lerp(1, sc, e).toFixed(4) + ') perspective(900px) rotateY(' + (tx * (1 - e)) + 'deg) rotateX(' + (ty * (1 - e)) + 'deg)';
      leaf.style.borderRadius = e > 0 ? (44 * (1 - e)) + 'px ' + (8 * (1 - e)) + 'px' : '';
      copy.style.opacity = (1 - smooth(p * 1.6)).toFixed(3); copy.style.transform = 'translateY(' + (-40 * e) + 'px) scale(' + (1 - .05 * e) + ')';
      if (!fine) leaf.style.setProperty('--sx', (-30 + 90 * p) + '%');
      fanScroll = e; fanSpread = Math.max(fanSpread, 0); fan();
      $('[data-fan]').style.opacity = (1 - smooth(p * 1.4)).toFixed(3);
      $('.glitter').style.opacity = (1 - smooth(p * 1.3)).toFixed(3);
    } else { leaf.style.transform = ''; leaf.style.borderRadius = ''; copy.style.opacity = ''; copy.style.transform = ''; $('[data-fan]').style.opacity = ''; $('.glitter').style.opacity = ''; }
    // bento photos drift at their own pace; on touch screens the spotlight follows the scroll
    tiles.forEach(function (t, i) {
      var r = t.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
      var q = (r.top + r.height / 2 - vh / 2) / vh, im = $('img', t);
      if (im) im.style.setProperty('--py', s ? '0px' : (q * -30).toFixed(1) + 'px');
      if (!fine && !s) { t.style.setProperty('--mx', (r.width * (.3 + .4 * Math.sin(i + q * 3))) + 'px'); t.style.setProperty('--my', (r.height * (.5 - q)) + 'px'); }
    });
    // reviews drift at different speeds
    revs.forEach(function (rv, i) { var r = rv.getBoundingClientRect(); var q = (r.top + r.height / 2 - vh / 2) / vh; rv.style.setProperty('--dy', s || phone() ? '0px' : (q * [18, -26, 10, -16][i]).toFixed(1) + 'px'); });
    // visit: the closing photo shrinks from the full screen into its frame
    var desk = matchMedia('(min-width:900px) and (min-height:620px)').matches;
    if (!s && desk) {
      var vr = visit.getBoundingClientRect(), vp = clamp(-vr.top / Math.max(1, vr.height - vh), 0, 1), ve = smooth(vp / .6);
      var fr = vframe.getBoundingClientRect(), sr = vstage.getBoundingClientRect();
      vphoto.style.setProperty('--ct', (fr.top - sr.top) * ve + 'px'); vphoto.style.setProperty('--cb', (sr.bottom - fr.bottom) * ve + 'px');
      vphoto.style.setProperty('--cl', (fr.left - sr.left) * ve + 'px'); vphoto.style.setProperty('--cr', (sr.right - fr.right) * ve + 'px');
      vphoto.style.setProperty('--cra', (44 * ve) + 'px');
      vphoto.style.setProperty('--vs', lerp(1.12, 1, ve).toFixed(4));
      var co = smooth((vp - .35) / .35); vcards.style.setProperty('--vo', co.toFixed(3)); vcards.style.setProperty('--vy', (40 * (1 - co)).toFixed(1) + 'px');
    } else if (!s) {
      var r2 = vphoto.getBoundingClientRect(), q2 = clamp((vh - r2.top) / (vh * .9), 0, 1);
      vphoto.style.setProperty('--vs', lerp(1.3, 1, smooth(q2)).toFixed(4));
      vcards.style.removeProperty('--vo'); vcards.style.removeProperty('--vy');
    } else { vphoto.style.setProperty('--vs', '1'); vcards.style.removeProperty('--vo'); vcards.style.removeProperty('--vy'); }
  }
  function layout() { glitter.size(); fan(); tick(); }
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', function () { clearTimeout(layout._t); layout._t = setTimeout(layout, 120); });

  // ---------------------------------------------------------------- start
  texts(root.lang); hours(); pick(cur, true); write(true);
  requestAnimationFrame(function () {
    document.body.classList.add('ready');
    // the fan opens a beat after the headline starts
    setTimeout(function () { fanSpread = 1; fan(); }, still() ? 0 : 450);
    layout();
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
})();
