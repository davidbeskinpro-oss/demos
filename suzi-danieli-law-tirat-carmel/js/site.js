(function () {
  var root = document.documentElement, WA = '972549983969';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var phone = function () { return innerWidth < 861; };
  var TITLE = { he: 'עו״ד סוזי דניאלי · עסקאות דירה וייעוץ בענייני עבודה · מנחם בגין 35, טירת כרמל', en: 'Adv. Suzi Danieli · Home deals and employment advice · 35 Menachem Begin St, Tirat Carmel' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור עו״ד סוזי דניאלי · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Adv. Suzi Danieli · This is not the business’s official website' };
  var io = 'IntersectionObserver' in window;

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-band]', 'מילים מתוך הביקורות בגוגל', 'Words from her Google reviews');
    aria('[data-t-prev]', 'שלב קודם', 'Previous stage');
    aria('[data-t-next]', 'שלב הבא', 'Next stage');
    aria('[data-t-five]', '5 כוכבים', '5 stars');
    aria('[data-t-topic]', 'נושא', 'Subject');
    aria('[data-t-call]', 'התקשרו לסוזי, 054-998-3969', 'Call Suzi, 054-998-3969');
    var m = $('[data-t-map]'); if (m) m.title = l === 'he' ? 'מפה: מנחם בגין 35, טירת כרמל' : 'Map: 35 Menachem Begin St, Tirat Carmel';
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('sd-lang', l); } catch (e) {}
    texts(l); hours(); stage(cur, true); write(true); curtain();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('sd-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-rise],[data-tile],[data-land],[data-fname]').forEach(function (el) { el.classList.add('in'); });
    lights.kick(); curtain(); stage(cur, true); onScroll(); write(true);
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. null = closed
  var H = { 0: [9, 18], 1: [9, 18], 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 12], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
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
    // the clock in the hours tile shows the time in Tirat Carmel
    var hh = $('[data-hh]'), mm = $('[data-mm]');
    if (hh) { hh.style.transform = 'rotate(' + ((n.h % 12) * 30) + 'deg)'; mm.style.transform = 'rotate(' + ((n.h % 1) * 360) + 'deg)'; }
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

  // ---------------------------------------------------------------- letters: hero headline out of a blur, footer name rising
  function split(sp, start) {
    var i = start || 0;
    sp.innerHTML = sp.textContent.trim().split(' ').map(function (w) {
      return '<span class="w">' + w.split('').map(function (c) { return '<span class="ch" style="--i:' + (i++) + '">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
  }
  $$('.h-title .ln').forEach(function (ln, k) { $$(':scope > span[lang]', ln).forEach(function (sp) { split(sp, k * 10); }); });
  $$('[data-fname] > span[lang]').forEach(function (sp) { split(sp); });

  // ---------------------------------------------------------------- entrances
  $$('.bento [data-tile]').forEach(function (t, i) { t.style.setProperty('--d', i * 80 + 'ms'); });
  $$('[data-land]').forEach(function (t, i) { t.style.setProperty('--d', i * 160 + 'ms'); });
  $$('section').forEach(function (s) { $$('[data-rise]', s).forEach(function (t, i) { t.style.setProperty('--d', i * 80 + 'ms'); }); });
  var rio = io ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  $$('[data-rise],[data-tile],[data-land],[data-fname]').forEach(function (el) { rio ? rio.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- odometers: digits roll into place when seen
  $$('[data-odo]').forEach(function (el) {
    var v = el.dataset.odo;
    el.classList.add('odo-w'); el.setAttribute('dir', 'ltr'); el.style.display = 'inline-flex';
    el.setAttribute('aria-label', v);
    el.innerHTML = v.split('').map(function (c) {
      if (!/\d/.test(c)) return '<span aria-hidden="true">' + c + '</span>';
      var col = ''; for (var k = 0; k <= 9; k++) col += '<i data-n="' + k + '"></i>';
      return '<span aria-hidden="true" class="dg" style="display:inline-block;height:1em;line-height:1;overflow:hidden;vertical-align:top"><span data-d="' + c + '" style="display:block;transition:transform 1.4s cubic-bezier(.23,1,.32,1)">' + col + '</span></span>';
    }).join('');
    var roll = function () { $$('[data-d]', el).forEach(function (c, i) { c.style.transitionDelay = (i * 120) + 'ms'; c.style.transform = 'translateY(' + (-c.dataset.d) + 'em)'; }); };
    if (still() || !io) return roll();
    var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { setTimeout(roll, 400); o.disconnect(); } }); o.observe(el);
  });

  // ---------------------------------------------------------------- opening: the papers are dealt, then the hero
  var hero = $('[data-hero]'), deal = $('[data-deal]');
  function ready() { hero.classList.add('ready'); }
  var seen = false; try { seen = sessionStorage.getItem('sd-dealt') === '1'; } catch (e) {}
  if (!still() && !seen && deal) {
    try { sessionStorage.setItem('sd-dealt', '1'); } catch (e) {}
    var R = [-9, 6, -3, 8, -1], X = [-34, 26, -12, 14, 0];
    $$('img', deal).forEach(function (im, i) { im.style.setProperty('--i', i); im.style.setProperty('--r', R[i] + 'deg'); im.style.setProperty('--x', X[i] + 'vw'); });
    deal.classList.add('run');
    setTimeout(function () { deal.classList.add('out'); ready(); }, 1050);
    setTimeout(function () { deal.classList.remove('run', 'out'); }, 1650);
  } else requestAnimationFrame(ready);

  // ---------------------------------------------------------------- hero: the city's own lights twinkle out of the photograph; the hand is a lamp
  var lights = (function () {
    var cv = $('[data-lights]'), img = $('[data-hphoto] img'), c = cv.getContext('2d'), P = [], raf = 0, vis = true, mx = -999, my = -999, t0 = 0, w, h;
    function sample() {
      if (!img.naturalWidth) return;
      var sw = 320, sh = Math.round(sw * img.naturalHeight / img.naturalWidth), o = document.createElement('canvas'); o.width = sw; o.height = sh;
      var oc = o.getContext('2d'); oc.drawImage(img, 0, 0, sw, sh);
      var d; try { d = oc.getImageData(0, 0, sw, sh).data; } catch (e) { return; }
      P = [];
      for (var y = 0; y < sh; y += 2) for (var x = 0; x < sw; x += 2) {
        var k = (y * sw + x) * 4, b = Math.max(d[k], d[k + 1], d[k + 2]);
        if (b > 205 && Math.random() < .5) P.push({ u: x / sw, v: y / sh, s: Math.random() * 6.28, f: .6 + Math.random() * 1.6, r: .8 + Math.random() * 1.6, g: d[k + 2] > 180 ? 1 : 0 });
      }
      if (P.length > 900) P = P.filter(function () { return Math.random() < 900 / P.length; });
    }
    function size() {
      var dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function frame(t) {
      raf = 0; if (!vis || still()) { c.clearRect(0, 0, w, h); return; }
      if (!t0) t0 = t; var s = (t - t0) / 1000;
      c.clearRect(0, 0, w, h);
      // object-fit: cover at 50% 70%
      var ir = img.naturalWidth / img.naturalHeight, cr = w / h, dw, dh, ox, oy;
      if (cr > ir) { dw = w; dh = w / ir; ox = 0; oy = (h - dh) * .7; } else { dh = h; dw = h * ir; oy = 0; ox = (w - dw) * .5; }
      // on phones the lamp drifts across the city by itself
      var lx = mx, ly = my; if (mx < -900) { lx = w * (.5 + .38 * Math.sin(s * .35)); ly = h * (.62 + .08 * Math.sin(s * .7)); }
      for (var i = 0; i < P.length; i++) {
        var p = P[i], x = ox + p.u * dw, y = oy + p.v * dh, tw = .45 + .55 * Math.sin(s * p.f + p.s);
        var dd = Math.hypot(x - lx, y - ly), near = Math.max(0, 1 - dd / 180);
        var a = clamp(tw * .55 + near * .9, 0, 1), r = p.r * (1 + near * 1.8);
        c.fillStyle = p.g ? 'rgba(255,236,200,' + a + ')' : 'rgba(255,190,110,' + a + ')';
        c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill();
        if (near > .2) { c.fillStyle = 'rgba(255,200,120,' + (near * .18) + ')'; c.beginPath(); c.arc(x, y, r * 4, 0, 6.283); c.fill(); }
      }
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && !still()) raf = requestAnimationFrame(frame); }
    function start() { sample(); size(); kick(); }
    if (img.complete) start(); else img.addEventListener('load', start);
    hero.addEventListener('pointermove', function (e) { if (e.pointerType === 'touch') return; var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -999; });
    if (io) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; kick(); }).observe(hero);
    return { kick: kick, size: function () { size(); } };
  })();

  // the letterhead leans toward the hand, lamplight moves across it
  var sheet = $('[data-sheet] .sheet-in');
  hero.addEventListener('pointermove', function (e) {
    if (still() || e.pointerType === 'touch' || phone()) return;
    var r = sheet.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    sheet.style.transform = 'rotate(-2.5deg) rotateY(' + clamp(x * 16, -12, 12) + 'deg) rotateX(' + clamp(-y * 12, -10, 10) + 'deg)';
    sheet.style.setProperty('--lx', (x + .5) * 100 + '%'); sheet.style.setProperty('--ly', (y + .5) * 100 + '%');
  });
  hero.addEventListener('pointerleave', function () { sheet.style.transform = ''; });

  // ---------------------------------------------------------------- the signature: a home deal lights the building floor by floor
  var story = $('[data-story]'), tower = $('[data-tower]'), lis = $$('[data-stages] li'), cur = 0;
  var NAMES = { he: ['שיחה ראשונה', 'בדיקות הנכס', 'החוזה', 'החתימה', 'המפתח'], en: ['First call', 'Checking the property', 'The contract', 'Signing', 'The key'] };
  var WIN = {"w":1000,"h":1068,"b":[[907,290,11,10],[401,135,58,21],[54,403,21,21],[228,861,69,33],[848,881,10,29],[360,642,15,23],[852,747,16,18],[589,872,55,33],[638,199,58,30],[618,511,16,10],[762,748,9,19],[407,1029,71,41],[101,150,12,30],[662,516,43,13],[811,546,46,17],[222,129,64,29],[747,807,59,32],[249,708,41,24],[101,291,13,32],[-2,913,22,61],[251,940,9,25],[715,274,11,23],[806,854,26,21],[101,80,12,30],[480,306,60,31],[480,516,12,16],[872,300,51,28],[26,737,22,11],[426,1054,9,15],[580,590,57,29],[613,732,30,28],[755,948,50,32],[454,794,10,27],[665,946,59,34],[323,1029,86,41],[510,796,23,17],[887,604,49,15],[-2,1042,13,20],[736,538,55,28],[486,444,57,28],[586,389,42,14],[416,722,16,17],[101,16,12,24],[666,676,10,12],[410,415,28,15],[577,521,61,32],[628,611,9,10],[922,951,33,31],[325,788,9,29],[432,725,9,16],[362,790,9,12],[700,921,18,11],[-2,706,30,64],[100,966,13,32],[326,864,32,32],[-2,862,16,22],[829,950,50,31],[54,517,21,26],[323,479,46,11],[817,677,50,29],[800,861,9,11],[216,1036,34,34],[644,900,10,9],[55,378,20,23],[235,470,25,11],[217,618,73,13],[101,582,13,33],[672,188,21,11],[676,689,17,12],[750,524,28,11],[802,463,22,10],[496,942,62,36],[815,928,15,13],[249,1032,52,38],[798,288,50,27],[411,647,33,24],[454,944,14,29],[458,1029,12,9],[456,868,10,24],[780,744,10,24],[409,435,33,24],[308,494,65,30],[305,123,18,10],[800,695,12,10],[734,457,52,12],[274,940,9,17],[327,940,12,34],[591,945,58,33],[298,1055,20,15],[801,397,33,13],[822,663,22,10],[400,159,63,28],[852,666,10,9],[585,729,27,24],[329,642,16,26],[406,502,66,33],[902,883,53,31],[20,1049,12,11],[473,170,63,31],[435,489,32,12],[866,883,10,26],[530,797,10,29],[433,792,10,30],[101,435,13,33],[301,637,26,31],[344,738,10,11],[665,399,37,26],[345,696,30,14],[679,921,22,12],[435,867,9,31],[647,529,62,31],[668,666,19,9],[929,751,11,27],[888,616,55,32],[303,140,64,28],[824,747,28,22],[503,796,10,30],[223,250,42,14],[804,416,32,24],[844,665,11,9],[263,257,24,11],[805,477,50,30],[651,515,13,9],[932,816,11,29],[-2,999,18,45],[271,785,11,18],[312,566,60,29],[54,540,21,26],[101,731,13,35],[216,628,81,40],[249,786,9,23],[100,885,13,35],[569,253,57,28],[580,508,17,12],[355,865,23,16],[597,509,13,9],[885,552,55,31],[101,656,13,34],[657,732,57,33],[762,740,18,9],[355,585,18,11],[444,720,31,31],[790,797,12,9],[809,786,12,15],[734,473,55,27],[701,929,27,15],[350,943,9,31],[101,220,13,32],[101,808,12,34],[252,1033,9,11],[620,664,9,13],[54,447,21,48],[495,869,59,33],[684,850,69,23],[872,284,38,14],[458,443,9,10],[587,813,13,11],[407,574,64,31],[916,824,9,13],[500,292,16,10],[670,803,46,32],[576,387,13,10],[580,951,10,17],[892,541,21,12],[101,363,13,32],[846,812,10,23],[308,192,54,14],[225,485,67,33],[203,1044,9,10],[638,1052,56,18],[228,939,9,17],[453,836,13,10],[433,943,9,24],[728,1029,12,10],[356,877,10,19],[803,880,37,51],[408,485,28,17],[403,295,60,18],[511,816,9,10],[723,215,52,25],[800,716,11,15],[815,812,24,27],[791,268,67,26],[101,508,13,33],[790,225,54,26],[312,712,66,33],[491,723,58,33],[637,263,66,33],[638,181,35,14],[310,478,14,9],[336,788,15,31],[305,211,63,27],[447,851,22,11],[604,661,18,9],[223,269,67,32],[605,800,30,32],[641,247,69,25],[724,196,46,16],[438,893,32,44],[660,687,19,12],[645,396,23,24],[668,598,41,18]]}, GL = '#%*+=?<>/אבגדהוזחטיכלמנ';
  function decode(el, text) {
    if (still()) { el.textContent = text; return; }
    var n = 0, id = setInterval(function () {
      n++; el.textContent = text.split('').map(function (ch, i) { return ch === ' ' || i < n * 1.4 ? ch : GL[(Math.random() * GL.length) | 0]; }).join('');
      if (n * 1.4 >= text.length) { clearInterval(id); el.textContent = text; }
    }, 34);
  }
  // the windows: drawn from the lit photograph, each fades on with a short flicker; order is scattered, like a real evening
  var tcv = $('[data-ton]'), tc = tcv.getContext('2d'), onImg = new Image(), A = WIN.b.map(function () { return 0; }), target = 0, wraf = 0;
  onImg.src = 'img/building-on.jpg';
  function tsize() { var dpr = Math.min(2, devicePixelRatio || 1); tcv.width = Math.round(tower.clientWidth * dpr); tcv.height = Math.round(tower.clientHeight * dpr); }
  function tdraw() {
    wraf = 0; if (!onImg.complete || !onImg.naturalWidth) return;
    var k = tcv.width / WIN.w, ky = tcv.height / WIN.h, moving = false, now = performance.now();
    tc.clearRect(0, 0, tcv.width, tcv.height);
    WIN.b.forEach(function (r, i) {
      var t = i < target ? 1 : 0;
      if (still()) A[i] = t;
      else if (A[i] !== t) { A[i] = t ? Math.min(1, A[i] + .09) : Math.max(0, A[i] - .12); moving = true; }
      if (!A[i]) return;
      var a = A[i]; if (t && a < 1 && !still()) a *= .55 + .45 * Math.abs(Math.sin(now / 38 + i));   // the tube catches
      tc.globalAlpha = a;
      tc.drawImage(onImg, r[0], r[1], r[2], r[3], r[0] * k, r[1] * ky, r[2] * k, r[3] * ky);
    });
    tc.globalAlpha = 1;
    if (moving) wraf = requestAnimationFrame(tdraw);
  }
  function tkick() { if (!wraf) wraf = requestAnimationFrame(tdraw); }
  onImg.onload = function () { tsize(); tkick(); };
  function light(frac) {
    var n = Math.round(clamp(frac, 0, 1) * WIN.b.length);
    if (n === target && !still()) return;
    target = n; $('[data-rfloor]').textContent = n; $('[data-rtotal]').textContent = WIN.b.length;
    tower.style.setProperty('--lit', (n / WIN.b.length).toFixed(2));
    tkick();
  }
  function stage(i, force) {
    i = clamp(i, 0, 4);
    if (i === cur && !force) return; cur = i;
    lis.forEach(function (li, k) { li.classList.toggle('on', k === i); li.classList.toggle('done', k < i); });
    decode($('[data-rstage]'), NAMES[he() ? 'he' : 'en'][i]);
    var d = $$(':scope > button > span[lang="' + (he() ? 'he' : 'en') + '"]', lis[i])[0]; $('[data-rdesc]').textContent = d ? d.textContent : '';
    if (still()) light((i + 1) / 5);
  }
  $$('[data-stage]').forEach(function (b) { b.addEventListener('click', function () {
    var i = +b.dataset.stage;
    if (still() || !story.offsetHeight) return stage(i);
    // motion on: tapping a stage scrolls the pinned story to it
    var top = story.getBoundingClientRect().top + scrollY, span = story.offsetHeight - innerHeight;
    scrollTo({ top: top + span * ((i + .55) / 5), behavior: 'smooth' });
  }); });
  $('[data-prev]').addEventListener('click', function () { stage(cur - 1); });
  $('[data-next]').addEventListener('click', function () { stage(cur + 1); });

  // ---------------------------------------------------------------- scroll loop
  var nav = $('[data-nav]'), desk = $('[data-desk]'), vph = $('[data-vphoto]'), dock = $('[data-dock]'), foot = $('[data-foot]'), ticking = false;
  function onScroll() {
    ticking = false;
    var vh = innerHeight;
    nav.classList.toggle('gather', scrollY > 40);
    // the stamp: comes down, presses, lifts away
    var r = desk.getBoundingClientRect(), p = clamp((vh - r.top) / (vh + r.height * .3), 0, 1);
    if (still()) { desk.style.setProperty('--st-o', 0); desk.style.setProperty('--ink-o', 1); desk.style.setProperty('--ink-s', 1); }
    else {
      var down = clamp((p - .15) / .35, 0, 1), up = clamp((p - .62) / .25, 0, 1);
      desk.style.setProperty('--st', ((1 - down) * 70 + up * 90).toFixed(2));
      desk.style.setProperty('--st-o', (down > 0 ? 1 - up : 0).toFixed(3));
      var inked = clamp((p - .48) / .08, 0, 1);
      desk.style.setProperty('--ink-o', inked.toFixed(3));
      desk.style.setProperty('--ink-s', (1.06 - inked * .06).toFixed(3));
    }
    // the story: pinned and scrubbed
    if (!still()) {
      var sr = story.getBoundingClientRect(), span = story.offsetHeight - vh, sp = clamp(-sr.top / span, 0, 1);
      light(sp * 1.08);
      stage(Math.min(4, Math.floor(sp * 5)));
    }
    // the closing photo shrinks into its frame
    var vr = vph.getBoundingClientRect(), k = still() ? 1 : clamp((vh * .9 - vr.top) / (vh * .7), 0, 1);
    vph.style.setProperty('--k', k.toFixed(3));
    // the dock steps aside over the contact cards and the footer
    var mb = $('main').getBoundingClientRect().bottom, cr = $('.contact').getBoundingClientRect();
    dock.classList.toggle('hide', mb < vh || (cr.top < vh * .8 && cr.bottom > 0));
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  // footer curtain only when it fits the screen
  function curtain() { foot.classList.toggle('curtain', foot.offsetHeight < innerHeight * .9); }

  // bento: a lamp follows the hand
  $$('[data-tile]').forEach(function (t) {
    t.addEventListener('pointermove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
    t.addEventListener('pointerleave', function () { t.style.setProperty('--mx', '-400px'); });
  });

  // ---------------------------------------------------------------- the folder: a tab types a note, sent on WhatsApp
  var MSG = {
    buy: { he: 'שלום סוזי, אנחנו בתהליך של קניית דירה ונשמח לליווי משפטי. אפשר לתאם שיחה קצרה?', en: 'Hello Suzi, we are in the process of buying a flat and would like legal guidance. Could we arrange a short call?' },
    sell: { he: 'שלום סוזי, אנחנו מתכננים למכור דירה ונשמח לליווי משפטי. אפשר לתאם שיחה קצרה?', en: 'Hello Suzi, we are planning to sell a flat and would like legal guidance. Could we arrange a short call?' },
    work: { he: 'שלום סוזי, יש לי שאלה בענייני עבודה ואשמח להתייעץ. מתי נוח לדבר?', en: 'Hello Suzi, I have a question about an employment matter and would like to consult you. When is a good time to talk?' },
    other: { he: 'שלום סוזי, יש לי שאלה משפטית ואשמח לשיחה קצרה. מתי נוח לך?', en: 'Hello Suzi, I have a legal question and would like a short call. When suits you?' }
  };
  var topic = 'buy', typed = $('[data-typed]'), nameIn = $('[data-name]'), send = $('[data-send]'), typeId = 0;
  function text() {
    var l = he() ? 'he' : 'en', t = MSG[topic][l], n = nameIn.value.trim();
    if (n) t += l === 'he' ? '\n' + n : '\n' + n;
    return t;
  }
  function write(instant) {
    var t = text();
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t);
    clearInterval(typeId);
    if (instant || still()) { typed.textContent = t; return; }
    var i = 0; typed.textContent = '';
    typeId = setInterval(function () {
      i += 2; typed.innerHTML = '';
      typed.appendChild(document.createTextNode(t.slice(0, i)));
      var car = document.createElement('span'); car.className = 'car'; typed.appendChild(car);
      if (i >= t.length) { clearInterval(typeId); }
    }, 22);
  }
  $$('[data-topic]').forEach(function (b) { b.addEventListener('click', function () {
    topic = b.dataset.topic;
    $$('[data-topic]').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
    write();
  }); });
  nameIn.addEventListener('input', function () { write(true); });
  if (io) { var wo = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { write(); wo.disconnect(); } }, { threshold: .4 }); wo.observe($('[data-folder]')); }

  // generic WhatsApp buttons carry a short hello
  $$('[data-wa]').forEach(function (a) { a.addEventListener('click', function () {
    a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(he() ? 'שלום סוזי, אשמח לשיחה קצרה.' : 'Hello Suzi, I would like a short call.');
  }); });

  addEventListener('resize', function () { lights.size(); tsize(); tkick(); curtain(); onScroll(); });
  texts(root.lang); hours(); stage(0, true); write(true); curtain(); onScroll();
})();
