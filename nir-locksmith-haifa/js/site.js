(function () {
  var root = document.documentElement, WA = '972505717955', NS = 'http://www.w3.org/2000/svg';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  var eo = function (t) { return 1 - Math.pow(1 - t, 3); };
  var eio = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var bell = function (p, a, b) { var t = seg(p, a, b); return Math.sin(Math.PI * t); };
  var TITLE = { he: 'ניר מנעולים · מנעולן, מפתחות ושלטים לרכב · המוסכים 53, חיפה', en: 'Nir Locks · Locksmith, car keys and remotes · 53 HaMosachim St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור ניר מנעולים · זה אינו האתר הרשמי של העסק', en: 'Concept demo made for Nir Locks · not the business’s official website' };
  var STAR = '<svg viewBox="0 0 92 16" aria-hidden="true">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; }).join('') + '</svg>';
  $$('[data-stars]').forEach(function (s) { s.innerHTML = STAR; });

  // ---------------------------------------------------------------- language
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    try { localStorage.setItem('nir-lang', l); } catch (e) {}
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { var el = $(sel); if (el) el.setAttribute('aria-label', l === 'he' ? h : e); };
    aria('[data-pill]', 'ראשי', 'Main');
    aria('[data-run]', 'מה ניר עושה', 'What Nir does');
    var ifr = $('.map iframe'); if (ifr) ifr.title = l === 'he' ? 'מפה: ניר מנעולים, המוסכים 53, חיפה' : 'Map: Nir Locks, 53 HaMosachim St, Haifa';
    var ct = $('#fob-t'); if (ct) ct.textContent = l === 'he' ? 'שלט לרכב במבט מפורק: מעטפת, כפתורי גומי, מעגל עם שבב ונורית, סוללה ובסיס; ואז הכול חוזר למקום והלהב נפתח' : 'A car remote in exploded view: shell, rubber buttons, a board with chip and LED, the cell and the base; then it all goes back together and the blade flips out';
    hours(); write(); caption(true); fitName(); orient();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('nir-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI(); write();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    $$('[data-card]').forEach(function (c) { c.classList.add('go'); });
    spinStop();
    lastKey = null; tick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Israel time. [open, close] per day; null = closed; [0, 24] = all day
  var H = { 0: [8.5, 16], 1: [8.5, 16], 2: [8.5, 16], 3: [8.5, 16], 4: [8.5, 16], 5: [8.5, 12], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  var allDay = function (t) { return t && t[0] === 0 && t[1] === 24; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (allDay(t)) { open = true; txt = l ? 'פתוח עכשיו · 24 שעות' : 'Open now · 24 hours'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
    else if (t && n.h < t[0]) { txt = l ? 'סגור עכשיו · נפתח היום ב-' + hhmm(t[0]) : 'Closed now · opens today at ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      txt = !H[nd] ? (l ? 'סגור עכשיו' : 'Closed now')
        : nd === (n.d + 1) % 7 ? (l ? 'סגור עכשיו · נפתח מחר ב-' + hhmm(H[nd][0]) : 'Closed now · opens tomorrow at ' + hhmm(H[nd][0]))
        : (l ? 'סגור עכשיו · נפתח ביום ' + dayHe[nd] + ' ב-' + hhmm(H[nd][0]) : 'Closed now · opens ' + dayEn[nd] + ' at ' + hhmm(H[nd][0]));
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
  }
  // consecutive days with the same hours share a row
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = '<tbody>' + rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var two = r[1] - r[0] === 1;
      var label = r[0] === r[1] ? names[r[0]] : names[r[0]] + (two ? (l ? ' ו' : ' and ') : '–') + names[r[1]];
      var time = !t ? (l ? 'סגור' : 'Closed') : allDay(t) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + label + '</td><td>' + time + '</td></tr>';
    }).join('') + '</tbody>';
    status();
  }
  window.__status = status; window.__H = H; window.__hours = hours;
  setInterval(status, 30000);

  // ---------------------------------------------------------------- the message: a key tag on the hook becomes the WhatsApp text
  var T = {
    he: { hi: 'היי ניר, הגעתי דרך האתר. ',
          job: { remote: 'אשמח לעזרה עם השלט של הרכב', carkey: 'אשמח למפתח לרכב', lost: 'המפתח שלי אבד ואשמח לעזרה', gate: 'אשמח לשכפל שלט לשער', door: 'אשמח לעזרה עם דלת או צילינדר', safe: 'אשמח לעזרה עם מפתח לכספת' },
          dl: { remote: 'איזה רכב? (לא חובה)', carkey: 'איזה רכב? (לא חובה)', lost: 'מה אבד, ואיפה? (לא חובה)', gate: 'איזה שער? (לא חובה)', door: 'איזו דלת? (לא חובה)', safe: 'איזו כספת? (לא חובה)' },
          ph: { remote: 'למשל: מאזדה 3…', carkey: 'למשל: טויוטה קורולה…', lost: 'למשל: מפתח לרכב, ליד הבית…', gate: 'למשל: שער חניה בבניין…', door: 'למשל: דלת כניסה…', safe: 'למשל: כספת קטנה בבית…' },
          where: { shop: '. אפשר לקפוץ לסדנה ברחוב המוסכים?', come: '. אפשר שתגיע אליי?' }, end: ' תודה!', wl: 'איפה נפגשים?' },
    en: { hi: 'Hi Nir, I found you through your website. ',
          job: { remote: 'I need help with my car remote', carkey: 'I need a car key', lost: 'I’ve lost my key and need help', gate: 'I’d like a copy of a gate remote', door: 'I need help with a door or cylinder', safe: 'I need help with a safe key' },
          dl: { remote: 'Which car? (optional)', carkey: 'Which car? (optional)', lost: 'What was lost, and where? (optional)', gate: 'Which gate? (optional)', door: 'Which door? (optional)', safe: 'Which safe? (optional)' },
          ph: { remote: 'E.g. Mazda 3…', carkey: 'E.g. Toyota Corolla…', lost: 'E.g. car key, near home…', gate: 'E.g. building car park gate…', door: 'E.g. front door…', safe: 'E.g. a small home safe…' },
          where: { shop: '. Can I drop by the workshop on HaMosachim St?', come: '. Could you come to me?' }, end: ' Thanks!', wl: 'Where do we meet?' }
  };
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]'), detail = $('[name=detail]'), dlab = $('[data-detail-label]'), wl = $('[data-where-label]');
  function write() {
    var t = T[root.lang] || T.he, fd = new FormData(form), job = fd.get('job') || 'remote', d = (detail.value || '').trim().replace(/\s+/g, ' ').slice(0, 60);
    var m = t.hi + t.job[job] + (d ? ' (' + d + ')' : '') + t.where[fd.get('where') || 'shop'] + t.end;
    dlab.textContent = t.dl[job]; detail.placeholder = t.ph[job]; wl.textContent = t.wl;
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    print(m);
  }
  var printT = 0, lastM = '';
  function print(m) {
    clearInterval(printT);
    if (still() || !lastM || (m.indexOf(lastM) === 0 && m.length - lastM.length < 3) || lastM.indexOf(m) === 0) { preview.textContent = m; lastM = m; return; }
    lastM = m;
    var i = 0, ink = document.createElement('span'), caret = document.createElement('span'); caret.className = 'caret';
    preview.textContent = ''; preview.appendChild(ink); preview.appendChild(caret);
    printT = setInterval(function () {
      i = Math.min(m.length, i + 3);
      ink.textContent = m.slice(0, i);
      if (i >= m.length) { clearInterval(printT); caret.remove(); }
    }, 16);
  }
  form.addEventListener('change', write);
  detail.addEventListener('input', write);

  // ---------------------------------------------------------------- hero: the one moving line (car · home · gate · safe), twice round, then it rests
  var spinT = 0;
  function spinStop() { clearInterval(spinT); $$('[data-spin]').forEach(function (s) { $$('b', s).forEach(function (b, i) { b.classList.toggle('on', i === 0); b.classList.remove('out'); }); }); }
  spinStop();
  if (!still()) {
    var step = 0;
    spinT = setInterval(function () {
      step++;
      $$('[data-spin]').forEach(function (s) {
        var bs = $$('b', s), cur = (step - 1) % bs.length, nx = step % bs.length;
        bs[cur].classList.remove('on'); bs[cur].classList.add('out');
        bs[nx].classList.remove('out'); bs[nx].classList.add('on');
        setTimeout(function () { bs[cur].classList.remove('out'); }, 380);
      });
      if (step >= 8) clearInterval(spinT);
    }, 2000);
  }

  // ---------------------------------------------------------------- entrances, once, staggered inside each section
  $$('section, header').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { io && !still() ? io.observe(el) : el.classList.add('in'); });

  // card visuals play once when seen; a tap plays them again
  var cards = $$('[data-card]');
  if ('IntersectionObserver' in window && !still()) {
    var cio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('go'); cio.unobserve(e.target); } }); }, { threshold: 0.55 });
    cards.forEach(function (c) { cio.observe(c); });
  } else cards.forEach(function (c) { c.classList.add('go'); });
  cards.forEach(function (c) { c.addEventListener('click', function () { if (still()) return; c.classList.remove('go'); void c.offsetWidth; c.classList.add('go'); }); });
  var run = $('[data-run]');
  $$('[data-run-step]').forEach(function (b) { b.addEventListener('click', function () {
    var dx = (+b.dataset.runStep) * Math.min(340, run.clientWidth * 0.8) * (root.dir === 'rtl' ? -1 : 1);
    run.scrollBy({ left: dx, behavior: still() ? 'auto' : 'smooth' });
  }); });

  // ---------------------------------------------------------------- nav: where you are; the fob dock appears once the hero's buttons are gone
  var pill = $('[data-pill]'), links = $$('.links a'), dock = $('[data-dock]'), away = new Set();
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['lock', 'jobs', 'place', 'reviews', 'msg', 'find'].forEach(function (id) { var el = document.getElementById(id); if (el) nio.observe(el); });
    var kio = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? away.add(e.target) : away.delete(e.target); }); dock.classList.toggle('show', away.size === 0); }, { threshold: 0 });
    $$('[data-hero-act], .find .acts, [data-send]').forEach(function (el) { kio.observe(el); });
  } else dock.classList.add('show');
  // the fob's LED blinks when a button is pressed
  var fled = $('.fd-led');
  $$('[data-fd]').forEach(function (b) { b.addEventListener('pointerdown', function () {
    if (still() || !fled.animate) { fled.classList.add('on'); setTimeout(function () { fled.classList.remove('on'); }, 220); return; }
    fled.animate([{ background: '#ffb347' }, { background: '#5a4630' }, { background: '#ffb347' }, { background: '#5a4630' }], { duration: 420, easing: 'ease-out' });
  }); });

  // ---------------------------------------------------------------- THE REMOTE, in exploded view
  // A flip-key car remote seen in isometric. Scroll lifts it apart layer by layer, top first: the shell, the rubber
  // button pad, the board (chip, LED, three tact switches under the buttons, the transponder coil), the coin cell, the base
  // with the folded blade. Then the old cell slides out and a fresh one slides in, the layers settle back down in reverse
  // order, the blade swings out on its hinge and the LED blinks twice. All of it is tied to the scroll, both ways.
  var lock = $('[data-lock]'), fob = $('[data-fob]');
  var ISO = 'matrix(.866 .5 -.866 .5 0 0)', CX = 300, CY = 470;
  var BTN = [-60, -10, 40];
  var ICON = [
    'M-7 -2v-5a7 7 0 0 1 14 0v5M-10 -2h20v12h-20z',          // locked
    'M-7 -2v-5a7 7 0 0 1 14 0M-10 -2h20v12h-20z',             // unlocked
    'M-11 6h22M-8 6l3-10h10l3 10M-4 -4v-4h8v4'                // boot
  ];
  function iso(y, body) { return '<g transform="translate(' + CX + ' ' + y + ') ' + ISO + '">' + body + '</g>'; }
  function slab(t, side, face) { return iso(CY + t, side) + iso(CY, face); }
  var shape = function (inset, rx, fill, extra) { return '<rect x="' + (-90 + inset) + '" y="' + (-150 + inset) + '" width="' + (180 - 2 * inset) + '" height="' + (300 - 2 * inset) + '" rx="' + rx + '" fill="' + fill + '"' + (extra || '') + '/>'; };
  var icons = function (r, fill, stroke) { return BTN.map(function (y, i) { return '<circle cx="0" cy="' + y + '" r="' + r + '" fill="' + fill + '"/><path transform="translate(0 ' + y + ')" d="' + ICON[i] + '" fill="none" stroke="' + stroke + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>'; }).join(''); };
  var LAYERS = [
    { k: 'base', o0: 0, o1: 190, d: 0.32,
      html: slab(16, shape(0, 56, '#15181b'), shape(0, 56, '#2a3036') + shape(12, 46, '#1d2125') + '<circle cx="0" cy="70" r="52" fill="none" stroke="#3a4148" stroke-width="4"/>' +
        '<g data-blade><path d="M-72 -128H-56V-20L-50 -16V-4L-56 0V20L-50 24V36L-56 40V60L-64 72L-72 60Z" fill="url(#bladeG)"/></g><circle cx="-64" cy="-128" r="13" fill="#9aa3ab"/><circle cx="-64" cy="-128" r="5" fill="#2a3036"/>') },
    { k: 'cell', o0: -5, o1: 66, d: 0.24, cell: true },
    { k: 'pcb', o0: -9, o1: -62, d: 0.16,
      html: slab(4, shape(16, 42, '#123227'), shape(16, 42, '#1f4a3c') +
        '<path d="M-40 -95h80M-40 -95v40M40 -95v120M-30 -35h60M-30 15h50M0 -100v-12M-20 70h40" fill="none" stroke="#c99a56" stroke-width="3" stroke-linecap="round"/>' +
        '<rect x="-24" y="-38" width="48" height="30" rx="4" fill="#111518"/>' +
        BTN.map(function (y) { return '<rect x="-14" y="' + (y - 14) + '" width="28" height="28" rx="4" fill="#c5cbd0"/><circle cx="0" cy="' + y + '" r="7" fill="#2a3036"/>'; }).join('') +
        '<ellipse cx="0" cy="98" rx="48" ry="22" fill="none" stroke="#c99a56" stroke-width="2.5"/><ellipse cx="0" cy="98" rx="40" ry="16" fill="none" stroke="#c99a56" stroke-width="2.5"/>' +
        '<circle cx="0" cy="-112" r="7" fill="#6b4a1f"/><circle data-led2 cx="0" cy="-112" r="34" fill="url(#ledG)" opacity="0"/>') },
    { k: 'pad', o0: -13, o1: -188, d: 0.08,
      html: slab(7, shape(10, 50, '#262b30'), shape(10, 50, '#3a4148') + icons(21, '#50585f', '#aeb5bc')) },
    { k: 'top', o0: -20, o1: -322, d: 0,
      html: slab(14, shape(0, 56, '#171a1d'), shape(0, 56, '#2b3137') + shape(6, 50, 'none', ' stroke="#59626a" stroke-width="3"') +
        BTN.map(function (y) { return '<circle cx="0" cy="' + y + '" r="25" fill="#1b1f23"/>'; }).join('') + icons(20, '#4b535a', '#c9ced3') +
        '<circle cx="0" cy="-112" r="8" fill="#3b2f22"/><circle cx="0" cy="-112" r="4" fill="#5a4630"/><circle data-led cx="0" cy="-112" r="30" fill="url(#ledG)" opacity="0"/>') }
  ];
  var cellFace = function (dull) { return slab(6, '<circle cx="0" cy="70" r="46" fill="#6d757d"/>', '<circle cx="0" cy="70" r="46" fill="url(#cellG)"' + (dull ? ' opacity=".7"' : '') + '/><circle cx="0" cy="70" r="35" fill="none" stroke="#8f98a0" stroke-width="2"/><path d="M-8 70h16M0 62v16" stroke="#6d757d" stroke-width="3" stroke-linecap="round"/>'); };
  var lg = [], oldCell, newCell, blade, led, led2;
  if (fob) {
    var holder = $('[data-layers]', fob), html = '';
    LAYERS.forEach(function (L) {
      html += '<g data-l="' + L.k + '">' + (L.cell ? '<g data-old>' + cellFace(true) + '</g><g data-new>' + cellFace(false) + '</g>' : L.html) + '</g>';
    });
    holder.innerHTML = html;
    lg = LAYERS.map(function (L) { return $('[data-l="' + L.k + '"]', holder); });
    oldCell = $('[data-old]', holder); newCell = $('[data-new]', holder); blade = $('[data-blade]', holder); led = $('[data-led]', holder); led2 = $('[data-led2]', holder);
  }
  // e: 0 assembled … 1 apart; sw: 0 old cell … 1 new cell; fl: blade 0 folded … 1 out; ld: LED 0…1
  function paintFob(e, sw, fl, ld) {
    LAYERS.forEach(function (L, i) {
      var q = eio(clamp((e - L.d) / (1 - 0.32), 0, 1));
      lg[i].setAttribute('transform', 'translate(0 ' + (L.o0 + (L.o1 - L.o0) * q).toFixed(1) + ')');
    });
    oldCell.setAttribute('transform', 'translate(' + (sw * 280).toFixed(1) + ' ' + (-sw * 40).toFixed(1) + ')'); oldCell.setAttribute('opacity', (1 - sw).toFixed(3));
    newCell.setAttribute('transform', 'translate(' + (-(1 - sw) * 280).toFixed(1) + ' ' + ((1 - sw) * 40).toFixed(1) + ')'); newCell.setAttribute('opacity', sw.toFixed(3));
    blade.setAttribute('transform', 'rotate(' + (180 * fl).toFixed(1) + ' -64 -128)');
    led.setAttribute('opacity', ld.toFixed(3)); led2.setAttribute('opacity', (ld * clamp(e * 3, 0, 1)).toFixed(3));
  }
  var CAPS = {
    he: ['שלט לרכב. מבחוץ זה נראה פשוט.', 'בפנים: כפתורי גומי, מעגל עם שבב ונורית, סוללה.', 'סוללה חדשה, וכל שכבה חוזרת למקומה.', 'הלהב נפתח, הנורית מהבהבת. נוסעים.'],
    en: ['A car remote. Simple from the outside.', 'Inside: rubber buttons, a board with a chip and an LED, a cell.', 'A fresh cell, and every layer goes back in place.', 'The blade flips out, the LED blinks. Off you go.']
  };
  var STILLS = [[0, 0, 0, 0], [1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 1, 1]], stage = 0, capEl = $('[data-cap]'), lastStage = -1;
  function caption(force) {
    if (!capEl) return;
    if (stage === lastStage && !force) return;
    lastStage = stage; capEl.textContent = CAPS[root.lang][stage];
    $$('[data-steps] i').forEach(function (d, i) { d.classList.toggle('on', i === stage); });
    var bs = $$('[data-step]'); if (bs.length) { bs[0].disabled = stage === 0; bs[1].disabled = stage === 3; }
  }
  function paintStill() { var s = STILLS[stage]; paintFob(s[0], s[1], s[2], s[3]); }
  $$('[data-step]').forEach(function (b) { b.addEventListener('click', function () { stage = clamp(stage + (+b.dataset.step), 0, 3); paintStill(); caption(); }); });
  function orient() {}

  // the section after the remote turns open on its top edge as it arrives
  var jobs = $('[data-open]'), jobsIn = $('[data-open-in]');

  var vh = innerHeight, lastKey = null, lastOpen = null;
  function tick() {
    var off = still(), y = scrollY;
    pill.classList.toggle('up', y > 24);
    if (!fob) return;
    var lr = lock.getBoundingClientRect(), jr = jobs.getBoundingClientRect();   // read, then write
    if (off) {
      if (lastKey !== 'still') { lastKey = 'still'; paintStill(); caption(true); }
      jobsIn.style.transform = ''; jobsIn.style.opacity = ''; jobsIn.style.clipPath = '';
      lastOpen = null;
      return;
    }
    var p = clamp(-lr.top / Math.max(1, lr.height - vh), 0, 1), key = p.toFixed(4);
    if (key !== lastKey) {
      lastKey = key;
      var e = p < 0.58 ? seg(p, 0.06, 0.36) : 1 - seg(p, 0.58, 0.8);
      var sw = eio(seg(p, 0.42, 0.56)), fl = eio(seg(p, 0.82, 0.9)), ld = Math.max(bell(p, 0.9, 0.945), bell(p, 0.95, 0.995));
      paintFob(e, sw, fl, ld);
      stage = p < 0.06 ? 0 : p < 0.5 ? 1 : p < 0.82 ? 2 : 3; caption();
    }
    var o = jr.top > vh * 1.2 ? 1 : clamp((jr.top - vh * 0.15) / (vh * 0.8), 0, 1), ok = o.toFixed(3);
    if (ok !== lastOpen) {
      lastOpen = ok;
      var k = eo(o);
      jobsIn.style.transform = o > 0 ? 'perspective(1400px) rotateX(' + (k * 18).toFixed(2) + 'deg) scale(' + (1 - k * 0.06).toFixed(4) + ')' : '';
      jobsIn.style.opacity = (1 - k * 0.55).toFixed(3);
      jobsIn.style.clipPath = o > 0 ? 'inset(0 ' + (k * 3).toFixed(2) + '% 0 ' + (k * 3).toFixed(2) + '% round ' + (k * 48).toFixed(1) + 'px)' : '';
    }
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); } }, { passive: true });
  var rT = 0; addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { vh = innerHeight; orient(); fitName(); lastKey = lastOpen = null; tick(); }, 120); });

  // footer: the name fits the key's bow
  function fitName() {
    var t = $('[data-fit-name]'); if (!t) return;
    t.textContent = he() ? t.dataset.he : t.dataset.en;
    t.removeAttribute('textLength'); t.style.fontSize = '';
    try {
      var w = t.getComputedTextLength();
      if (w > 200) { var f = Math.max(20, 52 * 200 / w); t.style.fontSize = f + 'px'; if (t.getComputedTextLength() > 200) { t.setAttribute('textLength', '200'); t.setAttribute('lengthAdjust', 'spacingAndGlyphs'); } }
    } catch (e) {}
  }

  orient(); hours(); write(); caption(true); fitName(); tick();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitName(); });
  window.__fob = { paint: function (a, b, c, d) { paintFob(a, b, c, d); }, tick: tick };
})();
