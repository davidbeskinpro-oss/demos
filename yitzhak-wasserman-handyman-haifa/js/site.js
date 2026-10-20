(function () {
  var root = document.documentElement, WA = '972549847272';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  var eo = function (t) { return 1 - Math.pow(1 - t, 3); };
  var io2 = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var TITLE = { he: 'יצחק וסרמן · הנדימן · שדרות מוריה 125, חיפה', en: 'Yitzhak Wasserman · Handyman · 125 Moriah Blvd, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור יצחק וסרמן · זה אינו האתר הרשמי של העסק', en: 'Concept demo made for Yitzhak Wasserman · not the business’s official website' };
  var BASE = { he: 'שלום יצחק, הגעתי דרך האתר ואשמח לעזרה בבית.', en: 'Hi Yitzhak, I found you through your website and would like some help at home.' };
  var STAR = '<svg viewBox="0 0 92 16" aria-hidden="true">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; }).join('') + '</svg>';
  $$('[data-stars]').forEach(function (s) { s.innerHTML = STAR; });

  // ================================================================ language
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    try { localStorage.setItem('yw-lang', l); } catch (e) {}
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    $('[data-pill]').setAttribute('aria-label', l === 'he' ? 'ראשי' : 'Main');
    $('[data-dk-call]').setAttribute('aria-label', l === 'he' ? 'התקשרו ליצחק, 054-984-7272' : 'Call Yitzhak, 054-984-7272');
    $('[data-dk-wa]').setAttribute('aria-label', l === 'he' ? 'וואטסאפ ליצחק' : 'WhatsApp Yitzhak');
    var mf = $('.map iframe'); if (mf) mf.title = l === 'he' ? 'מפה: שדרות מוריה 125, חיפה' : 'Map: 125 Moriah Blvd, Haifa';
    $$('[data-wa]').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(BASE[l]); });
    note.placeholder = l === 'he' ? 'למשל: מדף 80 ס״מ מעל השולחן…' : 'E.g. a shelf 80 cm above the desk…';
    hours(); write(true); paintBoard(true);
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ================================================================ motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('yw-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    cardsPlay(); paintBoard(true); paintFix(true); tick();
  }); });
  motionUI();

  // ================================================================ hours and live status, Israel time. null = closed that day, [0, 24] = all day
  var H = { 0: [6, 23], 1: [6, 23], 2: [6, 23], 3: [6, 23], 4: [6, 23], 5: [6, 12], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var dayEnS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  var all = function (t) { return t && t[0] === 0 && t[1] === 24; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: dayEnS.indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, short, open = false;
    if (all(t)) { open = true; txt = l ? 'זמין עכשיו · 24 שעות' : 'Available now · 24 hours'; short = l ? 'זמין עכשיו' : 'Available now'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'זמין עכשיו · עד ' + hhmm(t[1]) : 'Available now · until ' + hhmm(t[1]); short = l ? 'זמין עד ' + hhmm(t[1]) : 'Till ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) { txt = l ? 'לא זמין עכשיו · היום מ-' + hhmm(t[0]) : 'Not available now · today from ' + hhmm(t[0]); short = l ? 'היום מ-' + hhmm(t[0]) : 'Opens ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      var from = H[nd] ? hhmm(H[nd][0]) : '', allNext = all(H[nd]), tomorrow = nd === (n.d + 1) % 7;
      txt = !H[nd] ? (l ? 'לא זמין עכשיו' : 'Not available now')
        : tomorrow ? (l ? 'לא זמין עכשיו · מחר ' + (allNext ? 'כל היום' : 'מ-' + from) : 'Not available now · tomorrow ' + (allNext ? 'all day' : 'from ' + from))
        : (l ? 'לא זמין עכשיו · ביום ' + dayHe[nd] + ' ' + (allNext ? 'כל היום' : 'מ-' + from) : 'Not available now · ' + dayEn[nd] + (allNext ? ', all day' : ' from ' + from));
      short = !H[nd] ? (l ? 'השאירו הודעה' : 'Leave a message') : tomorrow ? (l ? 'מחר מ-' + from : 'Tmrw ' + from) : (l ? 'ב' + dayHe[nd] + ' מ-' + from : dayEnS[nd] + ' ' + from);
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span><span>' + txt + '</span>'; });
    var ds = $('[data-dk-status]'); if (ds) ds.textContent = short;
    var fl = $('.dk-fl'); if (fl) fl.classList.toggle('off', !open);
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // consecutive days with the same hours share a row
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var label = r[0] === r[1] ? names[r[0]] : names[r[0]] + (r[1] - r[0] === 1 ? (l ? ' ו' : ' and ') : '–') + names[r[1]];
      var time = !t ? (l ? 'סגור' : 'Closed') : all(t) ? (l ? '24 שעות' : '24 hours') : '<bdi dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</bdi>';
      return '<tr data-days="' + days.join(',') + '"><td>' + label + '</td><td>' + time + '</td></tr>';
    }).join('');
    status();
  }
  window.__status = status; window.__H = H; window.__hours = hours;
  setInterval(status, 30000);

  // ================================================================ the job list: tray + plan + tape → a WhatsApp message to Yitzhak
  var T = {
    he: { hi: 'שלום יצחק, הגעתי דרך האתר. ',
          job: { hang: 'אשמח שתתלה לי משהו על הקיר (מדף / כוננית / יחידה)', fix: 'אשמח לתיקון בקיר', paint: 'אשמח לעבודת צבע', other: 'יש לי עבודה קטנה בבית' },
          room: { living: 'בסלון', kitchen: 'במטבח', bed: 'בחדר השינה', kids: 'בחדר הילדים', bath: 'בחדר הרחצה', balc: 'במרפסת' },
          when: ['אם אפשר, היום או מחר.', 'מתי שנוח לך השבוע.', 'בשבוע הבא.', 'מבחינת זמנים אני גמיש.'],
          whenL: ['היום / מחר', 'השבוע', 'שבוע הבא', 'גמיש'], det: 'פרט: ', bye: 'תודה!' },
    en: { hi: 'Hi Yitzhak, I found you through your website. ',
          job: { hang: 'I’d like something hung on the wall (a shelf / unit / cabinet)', fix: 'I need a wall repaired', paint: 'I’d like some painting done', other: 'I have a small job at home' },
          room: { living: 'in the living room', kitchen: 'in the kitchen', bed: 'in the bedroom', kids: 'in the kids’ room', bath: 'in the bathroom', balc: 'on the balcony' },
          when: ['Today or tomorrow if possible.', 'Whenever suits you this week.', 'Next week.', 'My timing is flexible.'],
          whenL: ['Today / tomorrow', 'This week', 'Next week', 'Flexible'], det: 'Detail: ', bye: 'Thank you!' }
  };
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]'), note = $('[data-note]');
  function write(instant) {
    var l = he() ? 'he' : 'en', t = T[l];
    var job = (form.querySelector('input[name=job]:checked') || {}).value || 'hang';
    var room = (form.querySelector('input[name=room]:checked') || {}).value || 'living';
    var w = +((form.querySelector('input[name=when]:checked') || {}).value || 1), nt = (note.value || '').trim().slice(0, 90);
    var m = t.hi + t.job[job] + ' ' + t.room[room] + '. ' + t.when[w] + (nt ? '\n' + t.det + nt : '') + '\n' + t.bye;
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    type(m, instant);
  }
  var typeT = 0, lastM = '';
  function type(m, instant) {
    clearInterval(typeT);
    if (instant || still() || (lastM && Math.abs(m.length - lastM.length) < 3 && (m.indexOf(lastM) === 0 || lastM.indexOf(m) === 0))) { preview.textContent = m; lastM = m; return; }
    var common = 0; while (common < m.length && common < lastM.length && m[common] === lastM[common]) common++;
    lastM = m;
    var i = common, caret = '<span class="caret"></span>';
    typeT = setInterval(function () {
      i = Math.min(m.length, i + 3);
      preview.textContent = m.slice(0, i);
      if (i < m.length) preview.insertAdjacentHTML('beforeend', caret); else clearInterval(typeT);
    }, 16);
  }
  form.addEventListener('change', function () { write(); });
  note.addEventListener('input', function () { write(); });

  // ================================================================ entrances, once, staggered inside each section
  $$('section, header, footer').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { io && !still() ? io.observe(el) : el.classList.add('in'); });

  // the small living pictures on the board only move while on screen
  var cards = $('[data-cards]'), cardsIn = false;
  function cardsPlay() { cards.classList.toggle('play', cardsIn && !still()); }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { cardsIn = e.isIntersecting; cardsPlay(); }); }).observe(cards);

  // nav: where you are
  var pill = $('[data-pill]'), links = $$('.links a');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['level', 'work', 'words', 'msg', 'find'].forEach(function (id) { var el = document.getElementById(id); if (el) nio.observe(el); });
  }

  // ================================================================ THE SIGNATURE: the board settles to 0°
  // The board is screwed at its first corner (right in Hebrew, left in English) and rises tilted, low end down.
  // As it comes up the screen it swings level. The level lying on it is part of it, so its bubble runs to the HIGH end
  // (the pivot side) and comes back to the centre between the marks as the angle reaches zero. The bubble is a little
  // heavier than the scroll: it follows with a short spring, so it lags and settles, exactly as a real one does.
  var board = $('[data-board]'), slevel = $('[data-slevel]'), bub = $('[data-bubble]'), read = $('[data-read]');
  var bx = 0, btarget = 0, bAnim = 0, lastAng = null;
  function paintBoard(force) {
    if (still()) { board.style.transform = ''; bub.setAttribute('transform', ''); bx = btarget = 0; read.textContent = '0.0°'; slevel.classList.add('zero'); lastAng = null; return; }
    var r = board.getBoundingClientRect(), vh = innerHeight;
    var p = seg(vh - r.top, 0, vh * .74); p = p * p * (3 - 2 * p);
    var max = innerWidth < 760 ? 5.5 : 7;
    var ang = (he() ? -1 : 1) * max * (1 - p);
    if (!force && lastAng !== null && Math.abs(ang - lastAng) < .002) return;
    lastAng = ang;
    board.style.transform = 'rotate(' + ang.toFixed(3) + 'deg)';
    btarget = clamp(-ang * 10.5, -66, 66);
    var a = Math.abs(ang);
    read.textContent = (a < .05 ? 0 : a).toFixed(1) + '°';
    slevel.classList.toggle('zero', a < .05);
    if (!bAnim) bAnim = requestAnimationFrame(spring);
  }
  var bv = 0;
  function spring() {
    bAnim = 0;
    var d = btarget - bx; bv = bv * .72 + d * .16; bx += bv;
    if (Math.abs(d) < .05 && Math.abs(bv) < .05) { bx = btarget; bv = 0; }
    bub.setAttribute('transform', 'translate(' + bx.toFixed(2) + ' 0)');
    if (bx !== btarget) bAnim = requestAnimationFrame(spring);
  }

  // ================================================================ SECOND TRANSITION: the wall cutaway (pencil → drill → anchor → screw → shelf)
  var cut = $('[data-cut]'), parts = {
    pencil: $('[data-pencil]', cut), markp: $('[data-markp]', cut), drill: $('[data-drill]', cut), hole: $('[data-hole] rect', cut),
    flutes: $('#flutes', cut), anchor: $('[data-anchor]', cut), ribs: $('[data-ribs]', cut), bracket: $('[data-bracket]', cut),
    screw: $('[data-screw]', cut), thread: $('#thread', cut), plank: $('[data-plank]', cut), dustG: $('[data-dust]', cut)
  };
  // dust: small irregular crumbs, each leaves the hole's mouth at its own moment while the bit bores, falls under gravity and stays on the floor
  var dust = [], seed = 7;
  var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  for (var di = 0; di < 22; di++) {
    var pts = [], n = 5 + Math.floor(rnd() * 3), rr = 2.2 + rnd() * 3.2;
    for (var k = 0; k < n; k++) { var an = k / n * Math.PI * 2, rad = rr * (.6 + rnd() * .55); pts.push((Math.cos(an) * rad).toFixed(2) + ' ' + (Math.sin(an) * rad).toFixed(2)); }
    var pth = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pth.setAttribute('d', 'M' + pts.join('L') + 'Z'); pth.setAttribute('class', 'dust'); pth.style.opacity = 0;
    parts.dustG.appendChild(pth);
    dust.push({ el: pth, t0: .33 + rnd() * .17, vx: 22 + rnd() * 70, y0: 134 + rnd() * 12, r: rr });
  }
  var lastFix = null;
  function paintFix(force) {
    var p;
    if (still()) p = 1;
    else { var r = cut.getBoundingClientRect(), vh = innerHeight; p = seg(vh * .82 - r.top, 0, vh * .66); }
    var key = p.toFixed(4); if (!force && key === lastFix) return; lastFix = key;
    // pencil: in, touches the face, leaves its mark, out
    var pin = eo(seg(p, .02, .12)), pout = io2(seg(p, .15, .24));
    parts.pencil.setAttribute('transform', 'translate(' + (-260 * (1 - pin) - 260 * pout).toFixed(1) + ' 0)');
    parts.pencil.style.opacity = p < .25 ? 1 : 0;
    parts.markp.style.opacity = p >= .12 ? 1 : 0;
    // drill: comes in to the mark, bores 88 units deep, the bit spinning; slows as it reaches depth; then backs out
    var appr = io2(seg(p, .22, .32)), bore = seg(p, .32, .5), back = io2(seg(p, .52, .62));
    var boreE = 1 - Math.pow(1 - bore, 1.6);
    var tx = -470 + 502 * appr + 88 * boreE - 560 * back;
    parts.drill.setAttribute('transform', 'translate(' + tx.toFixed(1) + ' 0)');
    parts.drill.style.opacity = back < 1 && appr > 0 ? 1 : 0;
    var spin = p > .3 && p < .54 ? (p * 2600) % 20 : 0;
    parts.flutes.setAttribute('patternTransform', 'translate(0 ' + spin.toFixed(2) + ')');
    var depth = clamp(tx + 388 - 420, 0, 88);
    var maxDepth = Math.max(depth, bore > 0 ? 88 * boreE : 0);
    parts.hole.setAttribute('width', maxDepth.toFixed(1));
    parts.hole.style.opacity = maxDepth > .5 ? 1 : 0;
    // dust crumbs: a ballistic fall from the mouth of the hole to the floor (y 262), where they rest in a little heap
    dust.forEach(function (d) {
      if (p < d.t0) { d.el.style.opacity = 0; return; }
      var t = (p - d.t0) * 9;                // fall time in seconds-ish
      var y = d.y0 + 0.5 * 260 * t * t, x = 414 - d.vx * Math.min(t, .55);
      if (y > 262 - d.r) y = 262 - d.r * .7;
      d.el.style.opacity = 1;
      d.el.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
    });
    // anchor slides into the hole
    var anc = io2(seg(p, .62, .72));
    parts.anchor.setAttribute('transform', 'translate(' + (-170 * (1 - anc)).toFixed(1) + ' 0)');
    parts.anchor.style.opacity = anc > 0 ? 1 : 0;
    // bracket held against the wall, then the screw is driven in: thread turning, the anchor's ribs spread as it bites
    var br = eo(seg(p, .72, .78));
    parts.bracket.setAttribute('transform', 'translate(' + (-60 * (1 - br)).toFixed(1) + ' 0)');
    parts.bracket.style.opacity = br > 0 ? br.toFixed(3) : 0;
    var sc = seg(p, .78, .9), scE = 1 - Math.pow(1 - sc, 1.8);
    parts.screw.setAttribute('transform', 'translate(' + (-120 * (1 - scE)).toFixed(1) + ' 0)');
    parts.screw.style.opacity = sc > 0 ? 1 : 0;
    parts.thread.setAttribute('patternTransform', 'translate(0 ' + ((sc * 360) % 20).toFixed(2) + ')');
    var grip = seg(p, .84, .9);
    parts.ribs.setAttribute('transform', 'translate(0 140) scale(1 ' + (1 + .2 * grip).toFixed(3) + ') translate(0 -140)');
    // the shelf comes down onto the bracket, and its little level reads true
    var pl = eo(seg(p, .9, .99));
    parts.plank.setAttribute('transform', 'translate(0 ' + (-46 * (1 - pl)).toFixed(1) + ')');
    parts.plank.style.opacity = pl.toFixed(3);
  }

  // ================================================================ scroll loop: read everything, then write
  var dock = $('[data-dock]'), hero = $('.hero'), foot = $('.foot'), ticking = false, dockAway = null;
  function tick() {
    ticking = false;
    pill.classList.toggle('up', scrollY > 24);
    var away = hero.getBoundingClientRect().bottom > innerHeight * .5 || foot.getBoundingClientRect().top < innerHeight * .85;
    if (away !== dockAway) { dockAway = away; dock.classList.toggle('away', away); }
    paintBoard(); paintFix();
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }, { passive: true });
  addEventListener('resize', function () { lastAng = null; lastFix = null; requestAnimationFrame(tick); });

  // a long name never pushes the hero headline past two lines: shrink it only as far as needed
  function fitH1() {
    var h = $('.hero h1'); h.style.fontSize = '';
    var sp = $$('[lang]', h).filter(function (x) { return x.lang === root.lang; })[0]; if (!sp) return;
    var base = parseFloat(getComputedStyle(h).fontSize), f = base, lh = function () { return parseFloat(getComputedStyle(h).lineHeight); };
    for (var i = 0; i < 12 && sp.getBoundingClientRect().height > lh() * 2.2 && f > base * .5; i++) { f *= .92; h.style.fontSize = f.toFixed(1) + 'px'; }
  }
  var _setLang = setLang; setLang = function (l) { _setLang(l); fitH1(); };
  addEventListener('resize', fitH1);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitH1);
  setLang(root.lang === 'en' ? 'en' : 'he');
  paintFix(true); tick();
  window.__paint = function () { lastAng = null; lastFix = null; paintBoard(true); paintFix(true); };
})();
