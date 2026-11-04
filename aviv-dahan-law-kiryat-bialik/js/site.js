(function () {
  var root = document.documentElement, WA = '972544960224';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 760; };
  var TITLE = { he: 'אביב דהן · משרד עורכי דין · קריית ביאליק', en: 'Aviv Dahan · Law office · Kiryat Bialik' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור משרד עורכי דין אביב דהן · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Aviv Dahan Law Office · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) { if (!io) { fn(true); return; } new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }, opt || {}).observe(el); };

  // ---------------------------------------------------------------- language
  function texts(l) {
    var h = l === 'he';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[h ? 'altHe' : 'altEn']; });
    $$('[data-ph-he]').forEach(function (i) { i.placeholder = i.dataset[h ? 'phHe' : 'phEn']; });
    var aria = function (sel, a, b) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', h ? a : b); }); };
    aria('[data-t-brand]', 'משרד עורכי דין אביב דהן', 'Aviv Dahan Law Office');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-wa]', 'וואטסאפ לאביב', 'WhatsApp Aviv');
    aria('[data-t-call]', 'התקשרו לאביב, 054-496-0224', 'Call Aviv, 054-496-0224');
    aria('[data-t-seal]', '5.0 בגוגל, 49 ביקורות', '5.0 on Google, 49 reviews');
    aria('[data-t-slips]', 'ביקורות', 'Reviews');
    aria('[data-t-steps]', 'שלבים', 'Stages');
    aria('[data-t-prev]', 'השלב הקודם', 'Previous stage');
    aria('[data-t-next]', 'השלב הבא', 'Next stage');
    $$('[data-t-map]').forEach(function (f) { f.title = h ? 'מפת גוגל: אילון, קריית ביאליק' : 'Google Maps: Eilon St, Kiryat Bialik'; });
    $$('[data-decode]').forEach(function (b) { b.textContent = b.dataset[l]; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('ad-lang', l); } catch (e) {}
    texts(l); splitTitle(); hours(); write(true); fitMark(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('ad-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-tile],[data-slip],[data-word]').forEach(function (el) { el.classList.add('in'); });
    showDoc(active); write(true); layout(); dust.kick(); try { still() ? clip.pause() : clip.play().catch(function () {}); } catch (e) {}
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed; [0,24] = all day
  var H = { 0: [8.5, 21.5], 1: [0, 24], 2: [0, 24], 3: [0, 24], 4: [8.5, 21.5], 5: [8.5, 14.5], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function nowParts() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return o; }
  function now() { var o = nowParts(); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  // when does the current open stretch end? follows all-day days into the next day
  function closeOf(d) {
    var end = H[d][1], k = 0;
    while (end === 24 && k++ < 7) { var nd = (d + 1) % 7; if (!H[nd] || H[nd][0] !== 0) break; d = nd; end = H[d][1]; }
    return { d: end === 24 ? (d + 1) % 7 : d, h: end % 24 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && n.h >= t[0] && n.h < t[1]) {
      open = true; var c = closeOf(n.d), at = c.h === 0 ? (l ? 'חצות' : 'midnight') : hhmm(c.h);
      var dayN = (c.d - n.d + 7) % 7;
      txt = dayN === 0 ? (l ? 'פתוח עכשיו · עד ' + at : 'Open now · until ' + at)
          : dayN === 1 && c.h === 0 ? (l ? 'פתוח עכשיו · עד חצות' : 'Open now · until midnight')
          : (l ? 'פתוח עכשיו · עד יום ' + dayHe[c.h === 0 ? (c.d + 6) % 7 : c.d] + (c.h === 0 ? ' בחצות' : ' ב-' + at) : 'Open now · until ' + dayEn[c.h === 0 ? (c.d + 6) % 7 : c.d] + ' ' + at);
    }
    else if (t && n.h < t[0]) txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]);
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      var o = H[nd] ? hhmm(H[nd][0]) : '';
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (H[nd][0] === 0 ? (l ? 'סגור עכשיו · נפתח בחצות' : 'Closed now · opens at midnight') : (l ? 'סגור עכשיו · נפתח מחר ב-' + o : 'Closed now · opens tomorrow at ' + o))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + o : 'Closed now · opens ' + dayEn[nd] + ' at ' + o);
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
  $$('[data-slip]').forEach(function (s, i) { s.style.setProperty('--d', Math.min(i, 2) * 110 + 'ms'); });
  $$('.tally').forEach(function (t) { var n = +getComputedStyle(t).getPropertyValue('--n') || 0; $$('i', t).forEach(function (x, i) { x.classList.toggle('f', i < n); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); if (e.target.hasAttribute('data-word')) decode($('[data-decode]', e.target)); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-tile],[data-slip],[data-word]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // the recurring words settle out of scrambled letters
  function decode(b) {
    if (!b || still()) return;
    var txt = b.dataset[root.lang], pool = he() ? 'אבגדהוזחטיכלמנסעפצקרשת' : 'abcdefghijklmnopqrstuvwxyz', t0 = performance.now();
    (function st(t) {
      var k = Math.floor((t - t0) / 45);
      b.textContent = txt.split('').map(function (c, i) { return c === ' ' || i < k - 4 ? c : pool[Math.floor(Math.random() * pool.length)]; }).join('');
      if (k - 4 < txt.length) requestAnimationFrame(st); else b.textContent = txt;
    })(t0);
  }

  // ---------------------------------------------------------------- headline: each letter inks in
  var title = $('[data-ink]');
  function splitTitle() {
    $$('.ln > span[lang]', title).forEach(function (sp) {
      if (!sp.dataset.raw) sp.dataset.raw = sp.textContent;
      var i = 0;
      sp.innerHTML = sp.dataset.raw.split(' ').map(function (w) {
        return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
      }).join(' ');
    });
  }

  var hero = $('[data-hero]'), nav = $('[data-nav]'), lamp = $('[data-lamp]'), hphoto = $('[data-hphoto] img');

  // ---------------------------------------------------------------- the desk lamp: a pool of light that follows the hand (drifts by itself on phones)
  var L = { x: .62, y: .34, tx: .62, ty: .34, user: 0 };
  hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = hero.getBoundingClientRect(); L.tx = (e.clientX - r.left) / r.width; L.ty = (e.clientY - r.top) / r.height; L.user = performance.now(); });
  hero.addEventListener('pointerdown', function (e) { var r = hero.getBoundingClientRect(); L.tx = (e.clientX - r.left) / r.width; L.ty = (e.clientY - r.top) / r.height; L.user = performance.now(); });

  // dust in the lamplight, brighter inside the pool
  var dust = (function () {
    var cv = $('[data-dust]'), c = cv.getContext('2d'), P = [], w = 0, h = 0, raf = 0, vis = true;
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = phone() ? 45 : 90; P = [];
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 1.8, vx: (Math.random() - .5) * .12, vy: -.05 - Math.random() * .18, ph: Math.random() * 6.3 });
    }
    function frame(t) {
      raf = 0;
      var calm = still();
      if (!calm) {
        if (t - L.user > 2600) { var s = t / 1000; L.tx = .5 + Math.sin(s * .23) * (phone() ? .3 : .22); L.ty = .38 + Math.cos(s * .31) * .16; }
        L.x = lerp(L.x, L.tx, .06); L.y = lerp(L.y, L.ty, .06);
        lamp.style.setProperty('--lx', (L.x * 100).toFixed(2) + '%'); lamp.style.setProperty('--ly', (L.y * 100).toFixed(2) + '%');
      }
      c.clearRect(0, 0, w, h);
      var lx = L.x * w, ly = L.y * h, R = Math.max(w, h) * .38;
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        if (!calm) { p.x += p.vx + Math.sin(t / 1700 + p.ph) * .08; p.y += p.vy; if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; } if (p.x < -4) p.x = w + 4; if (p.x > w + 4) p.x = -4; }
        var dx = p.x - lx, dy = p.y - ly, d = Math.sqrt(dx * dx + dy * dy), a = clamp(1 - d / R, 0, 1);
        if (a <= .02) continue;
        c.globalAlpha = a * .75 * (.6 + .4 * Math.sin(t / 900 + p.ph));
        c.fillStyle = '#f3dfb5'; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.283); c.fill();
      }
      c.globalAlpha = 1;
      if (!calm && vis) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    watch(hero, function (v) { vis = v; kick(); });
    return { size: function () { size(); kick(); }, kick: kick };
  })();

  // ---------------------------------------------------------------- the prints dealt out of the folder; they lean toward the hand
  var sheets = $$('[data-sheet]'), folder = $('[data-folder]'), tilt = { x: 0, y: 0 }, dealT0 = 0;
  hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; tilt.x = e.clientX / innerWidth - .5; tilt.y = e.clientY / innerHeight - .5; tick(); });
  function placeSheets(t) {
    var calm = still(), sc = clamp(scrollY / Math.max(1, hero.offsetHeight), 0, 1);
    sheets.forEach(function (s, i) {
      if (calm) { s.style.transform = ''; return; }
      var e = smooth(((t || performance.now()) - dealT0 - 300 - i * 140) / 800);
      var cs = getComputedStyle(s), X = cs.getPropertyValue('--x').trim(), Y = cs.getPropertyValue('--y').trim(), R = parseFloat(cs.getPropertyValue('--r')) || 0;
      var px = tilt.x * (10 + i * 5), py = tilt.y * (8 + i * 4) - sc * (60 + i * 30);
      s.style.transform = 'translate(-50%,-50%) translate(calc(' + X + ' * ' + e.toFixed(3) + ' + ' + px.toFixed(1) + 'px), calc(' + Y + ' * ' + e.toFixed(3) + ' + ' + py.toFixed(1) + 'px)) rotate(' + (R * e + sc * (i % 2 ? 6 : -6)).toFixed(2) + 'deg)';
    });
  }
  function dealLoop(t) { placeSheets(t); if (t - dealT0 < 1900 && !still()) requestAnimationFrame(dealLoop); }

  // ---------------------------------------------------------------- odometers
  $$('[data-odo]').forEach(function (o) {
    o.classList.add('odo');
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');
  });
  function roll(o, go) { $$('.d[data-to]', o).forEach(function (d, i) { var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 6) % 10; s.style.transitionDelay = go ? (i * 160) + 'ms' : '0ms'; s.style.transform = 'translateY(' + (-to * 10) + '%)'; }); }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { setTimeout(function () { roll(o, true); }, o.closest('.seal') ? 1100 : 0); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- the path of a file: sheets filed one over another
  var path = $('[data-path]'), docs = $$('[data-doc]'), tabs = $$('[data-tabbtn]'), active = 0, RR = [-2.4, 1.6, -1.2, 2, -.8];
  function showDoc(n) {
    active = clamp(n, 0, docs.length - 1);
    tabs.forEach(function (b, i) { b.setAttribute('aria-pressed', i === active ? 'true' : 'false'); });
    docs.forEach(function (d, i) { d.classList.toggle('on', i === active); if (still()) { d.style.transform = ''; d.style.filter = ''; } });
    var tb = tabs[active]; if (tb && phone()) { var ul = tb.closest('.tabs'); ul.scrollTo({ left: tb.offsetLeft - (ul.clientWidth - tb.offsetWidth) / 2, behavior: still() ? 'auto' : 'smooth' }); }
  }
  tabs.forEach(function (b, i) { b.addEventListener('click', function () {
    if (still()) { showDoc(i); return; }
    var top = path.getBoundingClientRect().top + scrollY, span = path.offsetHeight - innerHeight;
    scrollTo({ top: top + span * (i / (docs.length - 1)) / 1.12 + 2, behavior: 'smooth' });
  }); });
  $('[data-pprev]').addEventListener('click', function () { showDoc(active - 1); });
  $('[data-pnext]').addEventListener('click', function () { showDoc(active + 1); });
  function fileDocs(p) {
    var N = docs.length, f = clamp(p * 1.12, 0, 1) * (N - 1), cur = Math.round(f);
    if (cur !== active) showDoc(cur);
    docs.forEach(function (d, i) {
      var t = i === 0 ? 1 : smooth(f - (i - 1)), above = 0;
      for (var j = i + 1; j < N; j++) above += smooth(f - (j - 1));
      d.style.transform = 'translateY(' + ((1 - t) * 125).toFixed(2) + '%) rotate(' + lerp(9, RR[i], t).toFixed(2) + 'deg) scale(' + (1 - Math.min(above, 3) * .035).toFixed(3) + ')';
      d.style.filter = above > .01 ? 'brightness(' + (1 - Math.min(above, 2.5) * .16).toFixed(3) + ')' : '';
      d.style.zIndex = i + 1;
    });
  }

  // ---------------------------------------------------------------- write to Aviv: the form writes the message
  var nameIn = $('[data-name]'), msgEl = $('[data-msg]'), send = $('[data-send]'), shown = '', typing = 0, memoSeen = false;
  function pick(g) { return $$('[role="radio"]', g).filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0]; }
  $$('[role="radiogroup"]').forEach(function (g) {
    var opts = $$('[role="radio"]', g);
    opts.forEach(function (b, i) {
      b.addEventListener('click', function () { opts.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); x.tabIndex = x === b ? 0 : -1; }); write(); });
      b.addEventListener('keydown', function (e) {
        var k = e.key, d = (k === 'ArrowDown' || k === (rtl() ? 'ArrowLeft' : 'ArrowRight')) ? 1 : (k === 'ArrowUp' || k === (rtl() ? 'ArrowRight' : 'ArrowLeft')) ? -1 : 0;
        if (!d) return; e.preventDefault(); var nb = opts[(i + d + opts.length) % opts.length]; nb.click(); nb.focus();
      });
      b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1;
    });
  });
  nameIn.addEventListener('input', function () { write(); });
  function compose() {
    var l = he(), nm = nameIn.value.trim().replace(/\s+/g, ' '), s = pick($('[data-subj]')).dataset[l ? 'he' : 'en'], w = pick($('[data-when]')).dataset[l ? 'he' : 'en'];
    return l ? 'שלום אביב' + (nm ? ', כאן ' + nm : '') + '.\n' + s + '.\nנוח לי לדבר ' + w + '. תודה.'
             : 'Hi Aviv' + (nm ? ', this is ' + nm : '') + '.\n' + s + '.\nA good time to talk is ' + w + '. Thank you.';
  }
  function write(instant) {
    var target = compose();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(target);
    cancelAnimationFrame(typing);
    if (instant || still() || !memoSeen) { shown = target; msgEl.textContent = target; return; }
    var keep = 0; while (keep < shown.length && keep < target.length && shown[keep] === target[keep]) keep++;
    var cur = shown, t0 = performance.now(), del = cur.length - keep;
    (function st(t) {
      var n = Math.floor((t - t0) / 16);
      shown = n < del ? cur.slice(0, cur.length - n) : target.slice(0, keep + (n - del));
      msgEl.textContent = shown;
      if (shown !== target) typing = requestAnimationFrame(st);
    })(t0);
  }
  var wsec = $('[data-write]');
  var clip = $('[data-clip]');
  watch(wsec, function (v) { wsec.classList.toggle('on', v); try { if (v && !still()) clip.play().catch(function () {}); else clip.pause(); } catch (e) {} });
  watch($('[data-memo]'), function (v) { if (v && !memoSeen) { memoSeen = true; if (still()) return; shown = ''; msgEl.textContent = ''; write(); } }, { threshold: .4 });

  // ---------------------------------------------------------------- office: the photo shrinks from the whole section into its frame
  var office = $('[data-office]'), ophoto = $('[data-ophoto]'), ocards = $('[data-ocards]');
  $$('.tile').forEach(function (t) { t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });
  function shrink() {
    var img = $('img', ophoto), cap = $('figcaption', ophoto);
    if (still()) { ophoto.style.transform = ''; ophoto.style.borderRadius = ''; cap.style.opacity = ''; ocards.style.opacity = ''; ocards.style.transform = ''; return; }
    var sr = office.getBoundingClientRect(), W = office.clientWidth, fw = ophoto.offsetWidth;
    var e = smooth((innerHeight * .9 - sr.top) / (innerHeight * .75));
    var s0 = W / fw, s = lerp(s0, 1, e);
    // the frame's centre, measured without the transform: offsetLeft is relative to the section (position:relative)
    var fx = ophoto.offsetLeft + fw / 2, dx = (W / 2 - fx) * (1 - e);
    ophoto.style.transform = 'translateX(' + dx.toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
    ophoto.style.borderRadius = (18 * e / s).toFixed(1) + 'px';
    img.style.transform = 'scale(' + (1 + (1 - e) * .12).toFixed(3) + ')';
    cap.style.opacity = smooth((e - .7) / .3).toFixed(3);
    var c = smooth((e - .5) / .4); ocards.style.opacity = c.toFixed(3); ocards.style.transform = c >= 1 ? '' : 'translateY(' + ((1 - c) * 40).toFixed(1) + 'px)';
  }

  // ---------------------------------------------------------------- the red string runs down the page
  var thread = $('[data-thread]'), tw = $('[data-tw]'), twl = $('[data-twl]'), tip = $('[data-tip]'), main = $('#main'), closure = $('[data-closure]'), tLen = 1, tStart = 0, tEnd = 1;
  function buildThread() {
    var W = main.clientWidth, Hm = main.offsetHeight, mr = main.getBoundingClientRect(), cr = closure.getBoundingClientRect();
    thread.setAttribute('width', W); thread.setAttribute('height', Hm); thread.setAttribute('viewBox', '0 0 ' + W + ' ' + Hm); thread.style.height = Hm + 'px';
    // start at the closure's tail, swing out to the page's edge, then run down with a gentle sway
    var sx = (rtl() ? cr.left + cr.width * .17 : cr.right - cr.width * .17) - mr.left, sy = cr.bottom - mr.top;
    sx = rtl() ? cr.left + cr.width * (1 - 75 / 90) - mr.left : cr.left + cr.width * (75 / 90) - mr.left;
    var edge = phone() ? 7 : 20, ex = rtl() ? edge : W - edge, d = 'M' + sx.toFixed(1) + ' ' + sy.toFixed(1);
    var y = sy + 60; d += ' C' + sx.toFixed(1) + ' ' + (sy + 50) + ' ' + ex + ' ' + (y - 20) + ' ' + ex + ' ' + (y + 60);
    y += 60; var amp = phone() ? 4 : 12, k = 0;
    while (y < Hm - 40) { var ny = Math.min(Hm - 40, y + 260), mx = ex + (k % 2 ? amp : -amp) * (rtl() ? 1 : -1); d += ' Q' + mx.toFixed(1) + ' ' + ((y + ny) / 2).toFixed(1) + ' ' + ex + ' ' + ny.toFixed(1); y = ny; k++; }
    tw.setAttribute('d', d); twl.setAttribute('d', d);
    tLen = tw.getTotalLength(); tStart = sy; tEnd = Hm;
    tw.style.strokeDasharray = tLen; twl.style.strokeDasharray = '3 5';
  }
  function drawThread() {
    if (still()) { tw.style.strokeDashoffset = 0; twl.style.opacity = 1; twl.style.strokeDashoffset = 0; return; }
    var mr = main.getBoundingClientRect(), reach = -mr.top + innerHeight * .78;   // how far down the page the reader is
    var p = clamp((reach - tStart) / (tEnd - tStart), 0, 1), len = clamp(reach / (tEnd) * tLen, 0, tLen);
    // the string's length follows the reading point: find the length at the reader's height
    var lo = 0, hi = tLen;
    for (var it = 0; it < 18; it++) { var mid = (lo + hi) / 2; if (tw.getPointAtLength(mid).y < reach) lo = mid; else hi = mid; }
    len = p <= 0 ? 0 : lo;
    tw.style.strokeDashoffset = (tLen - len).toFixed(1);
    twl.style.clipPath = 'inset(0 0 ' + Math.max(0, main.offsetHeight - reach).toFixed(0) + 'px 0)';
    var pt = tw.getPointAtLength(len); tip.setAttribute('cx', pt.x.toFixed(1)); tip.setAttribute('cy', pt.y.toFixed(1)); tip.style.opacity = len > 4 && len < tLen - 4 ? 1 : 0;
  }

  // ---------------------------------------------------------------- footer: the wordmark rises as the curtain lifts, the knot ties itself
  var foot = $('[data-foot]'), mark = $('[data-wordmark]'), knot = $('[data-knot]');
  function splitMark() {
    $$('span[lang]', mark).forEach(function (sp) { if (!sp.dataset.raw) sp.dataset.raw = sp.textContent; sp.innerHTML = sp.dataset.raw.split('').map(function (c, i) { return c === ' ' ? ' ' : '<span class="ch" style="--i:' + i + '">' + c + '</span>'; }).join(''); });
  }
  function fitMark() {
    mark.style.fontSize = '';
    var avail = foot.clientWidth - 2 * parseFloat(getComputedStyle($('.ft-in')).paddingLeft), w = mark.scrollWidth;
    if (w) mark.style.fontSize = Math.min(parseFloat(getComputedStyle(mark).fontSize) * avail / w * .98, innerHeight * .3).toFixed(1) + 'px';
  }

  // ---------------------------------------------------------------- one scroll loop
  var ticking = false, dock = $('[data-dock]');
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function prog(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1); }
  function update() {
    ticking = false;
    var calm = still();
    nav.classList.toggle('pill', scrollY > 40);
    if (!calm) { var hs = clamp(scrollY / hero.offsetHeight, 0, 1); hphoto.style.transform = 'translateY(' + (hs * 18).toFixed(1) + '%) scale(1)'; } else hphoto.style.transform = '';
    placeSheets();
    if (!calm) fileDocs(prog(path));
    shrink();
    drawThread();
    var mb = main.getBoundingClientRect().bottom, k = calm ? 1 : smooth((innerHeight - mb) / (foot.offsetHeight * .8));
    foot.style.setProperty('--k', k.toFixed(3));
    foot.style.visibility = mb > innerHeight + 2 ? 'hidden' : '';
    var hc = $('[data-hcta]').getBoundingClientRect();
    dock.classList.toggle('away', mb < innerHeight - 60 || (hc.bottom > 0 && hc.top < innerHeight));
  }

  function layout() { dust.size(); fitMark(); foot.style.position = ''; if (foot.offsetHeight > innerHeight - 20) foot.style.position = 'relative'; buildThread(); tick(); }
  var rz, lastW = innerWidth; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); lastW = innerWidth; }, 150); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); splitTitle(); splitMark(); hours(); write(true); showDoc(0);
  var once = false, go = function () {
    if (once) return; once = true;
    requestAnimationFrame(function () { hero.classList.add('ready'); dealT0 = performance.now(); requestAnimationFrame(dealLoop); layout(); });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 1200);
  addEventListener('load', function () { layout(); });
  if (window.ResizeObserver) new ResizeObserver(function () { clearTimeout(rz); rz = setTimeout(buildThread, 150); }).observe(main);
})();
