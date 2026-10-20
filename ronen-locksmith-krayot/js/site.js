(function () {
  var root = document.documentElement, WA = '972522985629';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var TITLE = { he: 'רונן מנעולן · פתיחת דלתות והחלפת צילינדרים · הקריות וחיפה · 24/7', en: 'Ronen Locksmith · Doors opened, cylinders replaced · the Krayot & Haifa · 24/7' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור רונן מנעולן · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Ronen Locksmith · This is not the business’s official website' };
  var STAR = '<svg viewBox="0 0 92 16" aria-hidden="true">' + [0, 19, 38, 57, 76].map(function (x) { return '<path transform="translate(' + x + ')" d="M8 0l2.4 5 5.5.6-4.1 3.7 1.2 5.4L8 12l-5 2.7 1.2-5.4L.1 5.6 5.6 5z"/>'; }).join('') + '</svg>';
  $$('[data-stars]').forEach(function (s) { s.innerHTML = STAR; });

  // ================================================================ THE DOORS
  // Each is drawn from a door in Ronen's own photos, 90 x 200 cm (viewBox 450 x 1000).
  // c = the cylinder, h = the hinge side. Hardware is brushed steel; the leaf has a fine powder-coat or wood grain.
  var KINDS = {
    arc:   { base: '#23272c', c: [392, 610], h: 'l', grain: 'coat' },   // the black door with the arc bar handle (hero photo)
    wood:  { base: '#6a4127', c: [392, 612], h: 'l', grain: 'wood' },   // walnut veneer, lever handle (the door with the torch)
    green: { base: '#587f5e', c: [96, 700], h: 'r', grain: 'coat' },    // a building's green entrance door with glass panes
    grey:  { base: '#61686e', c: [393, 640], h: 'l', grain: 'coat' },   // grey steel door, long backplate
    oak:   { base: '#9c7140', c: [392, 610], h: 'l', grain: 'wood' },   // light oak with black edge bands
    'arc-r': { base: '#23272c', c: [58, 610], h: 'r', grain: 'coat', mirror: 'arc' }
  };
  KINDS['arc-low'] = KINDS.arc;
  var uidN = 0;
  function steelDefs(u) {
    return '<radialGradient id="' + u + 'rs" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#f6f7f8"/><stop offset=".55" stop-color="#a9b0b6"/><stop offset="1" stop-color="#555c63"/></radialGradient>' +
      '<linearGradient id="' + u + 'sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3f5f6"/><stop offset=".42" stop-color="#b3bac0"/><stop offset=".58" stop-color="#dde1e4"/><stop offset="1" stop-color="#5f666d"/></linearGradient>' +
      '<linearGradient id="' + u + 'sv" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5f666d"/><stop offset=".4" stop-color="#e9ecee"/><stop offset=".6" stop-color="#b3bac0"/><stop offset="1" stop-color="#4f555b"/></linearGradient>' +
      '<filter id="' + u + 'bl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>';
  }
  function grainDefs(u, kind) {
    if (kind === 'wood') return '<filter id="' + u + 'gr" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency="0.11 0.0045" numOctaves="3" seed="' + (7 + uidN) + '"/><feColorMatrix values="0 0 0 0 .08  0 0 0 0 .04  0 0 0 0 .01  3.4 0 0 0 -1.45"/></filter>';
    return '<filter id="' + u + 'gr" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .09 0"/></filter>';
  }
  function rose(u, x, y, r) {
    return '<circle cx="' + (x + 3) + '" cy="' + (y + 5) + '" r="' + r + '" fill="#000" opacity=".45" filter="url(#' + u + 'bl)"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#' + u + 'rs)"/><circle cx="' + x + '" cy="' + y + '" r="' + (r * .64) + '" fill="#9aa1a7"/><rect x="' + (x - 2) + '" y="' + (y - r * .5) + '" width="4" height="' + r + '" rx="1.5" fill="#0d0f11"/>';
  }
  function doorSVG(kindName) {
    var K = KINDS[kindName], kind = K.mirror || kindName, u = 'd' + (uidN++) + '-', b = '';
    var defs = steelDefs(u) + grainDefs(u, K.grain) +
      '<linearGradient id="' + u + 'li" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".06"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>';
    b += '<rect width="450" height="1000" fill="' + K.base + '"/><rect width="450" height="1000" filter="url(#' + u + 'gr)"/>';
    if (kind === 'arc') {
      b += '<path d="M0 252H200M0 562H196" stroke="#000" stroke-opacity=".35" stroke-width="2"/><path d="M0 255H200M0 565H196" stroke="#fff" stroke-opacity=".05" stroke-width="1.5"/>';
      ['M268 0C196 260 190 720 262 1000', 'M296 0C224 260 218 720 290 1000'].forEach(function (d) {
        b += '<path d="' + d + '" fill="none" stroke="#0d0f11" stroke-width="4" transform="translate(2 0)"/><path d="' + d + '" fill="none" stroke="#c9d0d6" stroke-opacity=".85" stroke-width="2.4"/>';
      });
      var bar = 'M336 236C296 430 298 700 352 930';
      b += '<path d="' + bar + '" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="16" stroke-linecap="round" transform="translate(12 10)" filter="url(#' + u + 'bl)"/>';
      b += '<circle cx="333" cy="258" r="17" fill="url(#' + u + 'rs)"/><circle cx="348" cy="908" r="17" fill="url(#' + u + 'rs)"/>';
      b += '<path d="' + bar + '" fill="none" stroke="#8f979e" stroke-width="15" stroke-linecap="round"/><path d="' + bar + '" fill="none" stroke="#f4f6f7" stroke-opacity=".9" stroke-width="4" stroke-linecap="round" transform="translate(-3 0)"/><path d="' + bar + '" fill="none" stroke="#3b4147" stroke-opacity=".8" stroke-width="3" stroke-linecap="round" transform="translate(5 0)"/>';
      b += rose(u, 392, 610, 17);
      b += '<circle cx="205" cy="300" r="8" fill="url(#' + u + 'rs)"/><circle cx="205" cy="300" r="4" fill="#0b0c0e"/>';
    } else if (kind === 'wood') {
      b += '<rect x="262" y="526" width="136" height="18" rx="9" fill="#000" opacity=".5" filter="url(#' + u + 'bl)" transform="translate(6 8)"/>';
      b += '<circle cx="392" cy="535" r="21" fill="url(#' + u + 'rs)"/><rect x="262" y="526" width="136" height="18" rx="9" fill="url(#' + u + 'sh)"/><circle cx="392" cy="535" r="11" fill="#e3e7ea"/>';
      b += rose(u, 392, 612, 16);
      b += '<circle cx="225" cy="300" r="8" fill="#caa65e"/><circle cx="225" cy="300" r="4" fill="#120c06"/>';
    } else if (kind === 'green') {
      for (var i = 0; i < 5; i++) {
        var y = 140 + i * 140;
        b += '<rect x="197" y="' + (y - 9) + '" width="216" height="118" rx="3" fill="#6b9871"/><rect x="205" y="' + y + '" width="200" height="100" fill="#172022"/><path d="M215 ' + (y + 92) + 'L262 ' + (y + 8) + 'H286L239 ' + (y + 92) + 'Z" fill="#fff" opacity=".06"/><rect x="197" y="' + (y + 106) + '" width="216" height="4" fill="#000" opacity=".25"/>';
      }
      b += '<rect x="88" y="420" width="16" height="230" rx="8" fill="#000" opacity=".45" filter="url(#' + u + 'bl)" transform="translate(7 6)"/>';
      b += '<circle cx="96" cy="440" r="12" fill="url(#' + u + 'rs)"/><circle cx="96" cy="630" r="12" fill="url(#' + u + 'rs)"/><rect x="88" y="420" width="16" height="230" rx="8" fill="#7fa883"/><rect x="91" y="424" width="4" height="222" rx="2" fill="#b9d6bb" opacity=".6"/>';
      b += rose(u, 96, 700, 15);
    } else if (kind === 'grey') {
      b += '<rect x="44" y="64" width="362" height="872" rx="4" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="3"/><rect x="47" y="67" width="356" height="866" rx="3" fill="none" stroke="#fff" stroke-opacity=".07" stroke-width="2"/>';
      b += '<rect x="376" y="455" width="34" height="230" rx="12" fill="#000" opacity=".45" filter="url(#' + u + 'bl)" transform="translate(5 7)"/>';
      b += '<rect x="376" y="455" width="34" height="230" rx="12" fill="url(#' + u + 'sv)"/><rect x="268" y="505" width="126" height="17" rx="8.5" fill="url(#' + u + 'sh)"/><circle cx="393" cy="513" r="13" fill="#e6e9eb"/>';
      b += '<circle cx="393" cy="640" r="10" fill="#8d959b"/><rect x="391" y="633" width="4" height="14" rx="1.5" fill="#0d0f11"/>';
    } else if (kind === 'oak') {
      b += '<rect width="10" height="1000" fill="#1b1c1e"/><rect x="440" width="10" height="1000" fill="#1b1c1e"/>';
      b += '<rect x="378" y="470" width="28" height="180" rx="6" fill="#000" opacity=".45" filter="url(#' + u + 'bl)" transform="translate(5 7)"/>';
      b += '<rect x="378" y="470" width="28" height="180" rx="6" fill="#151619"/><rect x="290" y="512" width="106" height="16" rx="8" fill="url(#' + u + 'sh)"/><circle cx="392" cy="520" r="11" fill="#e6e9eb"/>';
      b += '<circle cx="392" cy="610" r="10" fill="#9aa2a8"/><rect x="390" y="603" width="4" height="14" rx="1.5" fill="#0d0f11"/>';
    }
    b += '<rect width="450" height="1000" fill="url(#' + u + 'li)"/><rect width="3" height="1000" fill="#fff" opacity=".07"/><rect x="447" width="3" height="1000" fill="#000" opacity=".3"/>';
    if (K.mirror) b = '<g transform="translate(450 0) scale(-1 1)">' + b + '</g>';
    return '<svg viewBox="0 0 450 1000" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs>' + defs + '</defs>' + b + '</svg>';
  }
  $$('[data-door-art]').forEach(function (el) { el.innerHTML = doorSVG(el.getAttribute('data-door-art')); });

  // the magnifier over the cylinder: the plug with its keyway, a tension wrench in the bottom of the keyway and a pick in the top
  function lensSVG(base) {
    var u = 'l' + (uidN++) + '-';
    return '<svg viewBox="-100 -100 200 200" aria-hidden="true" focusable="false"><defs>' + steelDefs(u) +
      '<radialGradient id="' + u + 'pl" cx=".42" cy=".36" r=".7"><stop offset="0" stop-color="#e9edf0"/><stop offset=".6" stop-color="#a3abb2"/><stop offset="1" stop-color="#6b737a"/></radialGradient>' +
      '<filter id="' + u + 'n" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .08 0"/></filter></defs>' +
      '<rect x="-100" y="-100" width="200" height="200" fill="' + base + '"/><rect x="-100" y="-100" width="200" height="200" filter="url(#' + u + 'n)"/>' +
      '<circle cx="6" cy="9" r="74" fill="#000" opacity=".5" filter="url(#' + u + 'bl)"/>' +
      '<circle r="74" fill="url(#' + u + 'rs)"/><circle r="63" fill="#7d858c"/><circle r="60" fill="url(#' + u + 'rs)"/><circle r="45" fill="#2a2f34"/>' +
      '<g class="plug">' +
        '<circle r="41" fill="url(#' + u + 'pl)"/><circle r="41" fill="none" stroke="#4d545a" stroke-width="2"/>' +
        '<path d="M-3.5 -31h7v13l-3 3 3 3v9l-3 3 3 3v15h-7v-15l3-3-3-3v-9l3-3-3-3z" fill="#08090b"/><path d="M-41 0a41 41 0 0 1 82 0" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="1.5"/>' +
        '<g class="wrench"><path d="M-3 18h6v12h104v8H-3z" fill="#2a2e33"/><path d="M-3 30h106v2H-3z" fill="#8c949b"/></g>' +
        '<g class="pick"><path d="M2 -20l-6 -6L-120 -78" fill="none" stroke="#c3c9ce" stroke-width="3.4" stroke-linecap="round"/><path d="M2 -20l-6 -6" stroke="#eef1f3" stroke-width="3.4" stroke-linecap="round"/><path d="M-62 -52L-130 -83" stroke="#14171a" stroke-width="12" stroke-linecap="round"/></g>' +
      '</g></svg>';
  }

  // ================================================================ language
  var TOWNS = { mo: ['קרית מוצקין', 'Kiryat Motzkin'], bi: ['קרית ביאליק', 'Kiryat Bialik'], ya: ['קרית ים', 'Kiryat Yam'], ha: ['קרית חיים', 'Kiryat Haim'], at: ['קרית אתא', 'Kiryat Ata'], hf: ['חיפה', 'Haifa'] };
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    try { localStorage.setItem('rl-lang', l); } catch (e) {}
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { var el = $(sel); if (el) el.setAttribute('aria-label', l === 'he' ? h : e); };
    aria('[data-pill]', 'ראשי', 'Main');
    aria('[data-buckle]', 'וואטסאפ לרונן', 'WhatsApp Ronen');
    aria('[data-lens]', 'התקשרו לרונן, 052-298-5629', 'Call Ronen, 052-298-5629');
    $$('[data-town] option').forEach(function (o) { o.textContent = TOWNS[o.value][l === 'he' ? 0 : 1]; });
    hours(); write(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ================================================================ motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('rl-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI(); write();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    if (on) { build(); layout(); beamIn(); } else { idle(); }
    runPlay(); tick();
  }); });
  motionUI();

  // ================================================================ hours and live status, Israel time. null = closed that day, [0, 24] = all day
  var H = { 0: [0, 24], 1: [0, 24], 2: [0, 24], 3: [0, 24], 4: [0, 24], 5: [0, 24], 6: [0, 24] };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; };
  var all = function (t) { return t && t[0] === 0 && t[1] === 24; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, short, open = false;
    if (all(t)) { open = true; txt = l ? 'זמין עכשיו · 24 שעות' : 'Available now · 24 hours'; short = l ? 'זמין עכשיו' : 'Available now'; }
    else if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'זמין עכשיו · עד ' + hhmm(t[1]) : 'Available now · until ' + hhmm(t[1]); short = l ? 'זמין עכשיו' : 'Available now'; }
    else if (t && n.h < t[0]) { txt = l ? 'לא זמין עכשיו · היום מ-' + hhmm(t[0]) : 'Not available now · today from ' + hhmm(t[0]); short = l ? 'היום מ-' + hhmm(t[0]) : 'Today from ' + hhmm(t[0]); }
    else {
      var nd = (n.d + 1) % 7, k = 0; while (!H[nd] && k++ < 7) nd = (nd + 1) % 7;
      var from = H[nd] ? hhmm(H[nd][0]) : '', allNext = all(H[nd]);
      txt = !H[nd] ? (l ? 'לא זמין עכשיו' : 'Not available now')
        : nd === (n.d + 1) % 7 ? (l ? 'לא זמין עכשיו · מחר ' + (allNext ? 'כל היום' : 'מ-' + from) : 'Not available now · tomorrow ' + (allNext ? 'all day' : 'from ' + from))
        : (l ? 'לא זמין עכשיו · ביום ' + dayHe[nd] + ' ' + (allNext ? 'כל היום' : 'מ-' + from) : 'Not available now · ' + dayEn[nd] + (allNext ? ', all day' : ' from ' + from));
      short = l ? 'השאירו הודעה' : 'Leave a message';
    }
    $$('[data-status]').forEach(function (el) { el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt; });
    var ls = $('[data-lamp-status]'); if (ls) ls.textContent = short;
    lampEl.classList.toggle('open', open);
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', (r.dataset.days || '').split(',').indexOf(String(n.d)) >= 0); });
    var c = $('[data-clock]'); if (c) c.textContent = (l ? 'עכשיו בקריות ' : 'Now in the Krayot ') + hhmm(n.h);
  }
  // consecutive days with the same hours share a row
  function hours() {
    var l = he(), names = l ? dayHe : dayEn, rows = [], i = 0;
    while (i < 7) { var j = i; while (j + 1 < 7 && JSON.stringify(H[j + 1]) === JSON.stringify(H[i])) j++; rows.push([i, j]); i = j + 1; }
    $('[data-hours]').innerHTML = rows.map(function (r) {
      var t = H[r[0]], days = [], k; for (k = r[0]; k <= r[1]; k++) days.push(k);
      var label = r[0] === r[1] ? names[r[0]] : names[r[0]] + (r[1] - r[0] === 1 ? (l ? ' ו' : ' and ') : '–') + names[r[1]];
      var time = !t ? (l ? 'לא זמין' : 'Unavailable') : all(t) ? (l ? '24 שעות' : '24 hours') : '<span dir="ltr">' + hhmm(t[0]) + '–' + hhmm(t[1]) + '</span>';
      return '<tr data-days="' + days.join(',') + '"><td>' + label + '</td><td>' + time + '</td></tr>';
    }).join('');
    status();
  }
  var lampEl = $('[data-lamp]');
  window.__status = status; window.__H = H; window.__hours = hours;
  setInterval(status, 30000);

  // ================================================================ the message: tap the door, the hanger writes it
  var T = {
    he: { hi: 'היי רונן, הגעתי דרך האתר. ', need: { out: 'ננעלתי מחוץ לבית', cyl: 'צריך להחליף צילינדר', lock: 'יש בעיה במנעול של הדלת', handle: 'הידית של הדלת נשברה או נתקעה' },
          at: ', ב', st: ', ברחוב ', end: { out: '. אפשר להגיע עכשיו?', other: '. מתי אפשר להגיע?' } },
    en: { hi: 'Hi Ronen, I found you through your website. ', need: { out: 'I’m locked out of my home', cyl: 'I need a cylinder replaced', lock: 'There’s a problem with my door lock', handle: 'My door handle broke or jammed' },
          at: ', in ', st: ', on ', end: { out: '. Can you come now?', other: '. When could you come?' } }
  };
  var form = $('#composer'), preview = $('[data-preview]'), send = $('[data-send]'), street = $('[data-street]'), town = $('[data-town]');
  function write() {
    var l = he() ? 'he' : 'en', t = T[l], need = (form.querySelector('input[name=need]:checked') || {}).value || 'out';
    var tw = TOWNS[town.value] ? TOWNS[town.value][l === 'he' ? 0 : 1] : '', st = (street.value || '').trim().slice(0, 60);
    street.placeholder = l === 'he' ? 'למשל: הרצל 12…' : 'E.g. 12 Herzl St…';
    var m = t.hi + t.need[need] + (tw ? t.at + tw : '') + (st ? t.st + st : '') + (need === 'out' ? t.end.out : t.end.other);
    send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m);
    type(m);
  }
  var typeT = 0, lastM = '';
  function type(m) {
    clearInterval(typeT);
    if (still() || (lastM && m.indexOf(lastM) === 0 && m.length - lastM.length < 3) || (lastM && lastM.indexOf(m) === 0)) { preview.textContent = m; lastM = m; return; }
    lastM = m;
    var i = 0, caret = '<span class="caret"></span>';
    preview.innerHTML = caret;
    typeT = setInterval(function () {
      i = Math.min(m.length, i + 2);
      preview.textContent = m.slice(0, i);
      if (i < m.length) preview.insertAdjacentHTML('beforeend', caret); else clearInterval(typeT);
    }, 18);
  }
  form.addEventListener('change', write);
  street.addEventListener('input', write);

  // ================================================================ entrances, once, staggered inside each section
  $$('section, header').forEach(function (s) { $$('[data-reveal]', s).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms'); }); });
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -24% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { io && !still() ? io.observe(el) : el.classList.add('in'); });

  // the craft visuals only move while their run is on screen
  var run = $('[data-run]'), runIn = false;
  function runPlay() { run.classList.toggle('play', runIn && !still()); }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { runIn = e.isIntersecting; runPlay(); }); }).observe(run);

  // nav: where you are
  var pill = $('[data-pill]'), links = $$('.links a');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['reach', 'craft', 'field', 'reviews', 'message'].forEach(function (id) { var el = document.getElementById(id); if (el) nio.observe(el); });
  }

  // ================================================================ the hero: a headlamp's spot crosses the door and settles on the real cylinder
  var heroImg = $('[data-hero-img]'), beam = $('[data-beam]'), hero = $('.hero'), beamAnim = null;
  function cylOnScreen() {
    var r = hero.getBoundingClientRect(), mob = innerWidth < 700;
    var iw = mob ? 900 : 1600, ih = mob ? 1200 : 1000, cx = mob ? 580 : 1031, cy = mob ? 803 : 787, py = mob ? .4 : .5;
    var s = Math.max(r.width / iw, r.height / ih), dw = iw * s, dh = ih * s;
    return { x: (r.width - dw) * .5 + cx * s, y: (r.height - dh) * py + cy * s, w: r.width, h: r.height };
  }
  function beamIn() {
    if (still() || !beam.animate) return;
    var c = cylOnScreen();
    if (beamAnim) beamAnim.cancel();
    var tr = function (x, y, sc) { return 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + sc + ')'; };
    beamAnim = beam.animate([
      { transform: tr(c.w * .18, c.h * .2, 1.25), opacity: 0 },
      { transform: tr(c.w * .3, c.h * .3, 1.15), opacity: .85, offset: .2 },
      { transform: tr(c.x - c.w * .06, c.y - c.h * .12, 1), opacity: .9, offset: .7 },
      { transform: tr(c.x, c.y, .8), opacity: 1 }
    ], { duration: 2600, delay: 350, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
  }

  // ================================================================ the map: Ronen's routes from Michael St light up as the map scrolls in
  var map = $('[data-map]'), rds = $$('.rd', map), tws = $$('.tw', map), lbs = $$('[data-lb]', map), van = $('[data-van]', map);
  var bay = $('.bay', map), bayBox = $('[data-baybox]', map);
  function bayView() {
    var vb = innerWidth < 700 ? [70, 50, 520, 300] : [0, 0, 600, 375];
    bay.setAttribute('viewBox', vb.join(' ')); bayBox.style.setProperty('--ar', (vb[2] / vb[3]).toFixed(4));
    $$('[data-at]', map).forEach(function (l) { var a = l.dataset.at.split(','); l.style.left = ((a[0] - vb[0]) / vb[2] * 100).toFixed(2) + '%'; l.style.top = ((a[1] - vb[1]) / vb[3] * 100).toFixed(2) + '%'; });
  }
  bayView();
  var rdLen = rds.map(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L + ' ' + L; return L; });
  var mapK = null;
  function paintMap() {
    var q;
    if (still()) q = 1;
    else { var r = map.getBoundingClientRect(); q = clamp((innerHeight * .92 - r.top) / (innerHeight * .62), 0, 1); }
    var key = q.toFixed(3); if (key === mapK) return; mapK = key;
    var n = rds.length, head = null;
    rds.forEach(function (p, i) {
      var k = clamp(q * n - i, 0, 1);
      p.style.strokeDashoffset = (rdLen[i] * (1 - k)).toFixed(1);
      p.style.opacity = k > 0 ? 1 : 0;
      var lit = k >= .98; tws[i].classList.toggle('lit', lit); lbs[i].classList.toggle('lit', lit);
      if (k > 0 && k < 1) head = p.getPointAtLength(rdLen[i] * k);
    });
    if (head && !still()) { van.style.opacity = 1; van.setAttribute('cx', head.x.toFixed(1)); van.setAttribute('cy', head.y.toFixed(1)); }
    else van.style.opacity = 0;
  }

  // ================================================================ THE THRESHOLD
  // Every section waits behind a door from Ronen's photos, set in a stairwell wall. The wall is fixed to the screen and
  // clipped to the section, so it is uncovered as the section's top edge rises. All of it is tied to the scroll, both ways:
  //   the headlamp's spot finds the cylinder; a magnifier shows the pick raking the pins under the tension wrench's
  //   light pressure until the plug gives a quarter turn; the pick comes out and the plug turns two full turns as the
  //   bolts draw back; the door swings away on its hinges, its face darkening as it turns from our light; warm light from
  //   the room spills through and onto the landing floor; then we walk through and the wall falls away.
  // Scroll back up and it all runs in reverse, so the next pass plays it again. Only transform and opacity are written
  // (the small magnifier's SVG parts take an attribute), and only for the section that is crossing the screen.
  var rooms = $$('.room[data-door]'), built = false, G = {};
  var GRAIN = 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27180%27 height=%27180%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.8%27 numOctaves=%272%27/%3E%3CfeColorMatrix values=%270 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .07 0%27/%3E%3C/filter%3E%3Crect width=%27180%27 height=%27180%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")';
  var WALLS = ['#1c2128', '#221e1a', '#1a2024', '#211d19', '#1b1f26', '#1e2125'];
  function el(cls, parent, tag) { var e = document.createElement(tag || 'div'); e.className = cls; if (parent) parent.appendChild(e); return e; }
  function build() {
    if (built || still() || !(window.CSS && CSS.supports && CSS.supports('overflow', 'clip'))) return; built = true;
    rooms.forEach(function (s, i) {
      var K = KINDS[s.dataset.door];
      var th = el('th'); th.style.setProperty('--wall', WALLS[i % WALLS.length]); th.style.setProperty('--grain', GRAIN);
      var go = el('th-go', th);
      var o = { th: th, go: go, K: K, w: [el('th-wall', go), el('th-wall', go), el('th-wall', go)], glow: el('th-glow', go), floor: el('th-floor', go), f: [el('th-frame', go), el('th-frame', go), el('th-frame', go)] };
      o.hole = el('th-hole', go);
      o.light = el('th-light', o.hole);
      o.jamb = el('th-jamb', o.hole); el('', o.jamb, 'i').appendChild(document.createElement('b')); el('', o.jamb, 'i').appendChild(document.createElement('b'));
      o.door = el('th-door', o.hole); o.door.innerHTML = doorSVG(s.dataset.door);
      o.spot = el('th-spot', o.door); o.shade = el('th-shade', o.door);
      o.spill = el('th-spill', go);
      o.lens = el('th-lens', th); o.lens.innerHTML = lensSVG(K.base);
      o.plug = $('.plug', o.lens); o.pick = $('.pick', o.lens);
      o.k = null;
      var tr = el('th-track'); tr.setAttribute('aria-hidden', 'true'); tr.appendChild(th); o.track = tr;
      s.insertBefore(tr, s.firstChild); s.classList.add('has-th'); s._th = o;
    });
  }
  function idle() { rooms.forEach(function (s) { if (s._th) { s._th.th.classList.remove('on'); s._th.k = null; } }); lampGlow(0); }
  var px = function (v) { return v.toFixed(1) + 'px'; };
  function place(e, l, t, w, h) { e.style.left = px(l); e.style.top = px(t); e.style.width = px(w); e.style.height = px(h); }
  function layout() {
    var W = innerWidth, Hh = innerHeight;
    var Dh = Math.min(Hh * .62, W * .64 / .45), Dw = Dh * .45, x0 = (W - Dw) / 2, fl = Hh * .9, y0 = fl - Dh, f = Dw * .075;
    G = { W: W, H: Hh, Dw: Dw, Dh: Dh, x0: x0, y0: y0, S: Math.max(2.4, W / Dw * 1.05) };   // S: how far we walk in, so the doorway fills any screen
    rooms.forEach(function (s) {
      var o = s._th; if (!o) return;
      o.track.style.top = px(-Hh); o.track.style.height = px(2 * Hh); o.th.style.height = px(Hh);
      place(o.w[0], 0, 0, W, y0 - f); place(o.w[1], 0, y0 - f - .5, x0 - f + .5, fl - y0 + f + .5); place(o.w[2], x0 + Dw + f - .5, y0 - f - .5, W - x0 - Dw - f + .5, fl - y0 + f + .5);
      place(o.floor, 0, fl, W, Hh - fl + 1);
      place(o.glow, x0 + Dw / 2 - Dh * 1.1, y0 + Dh * .45 - Dh * 1.1, Dh * 2.2, Dh * 2.2);
      place(o.f[0], x0 - f, y0 - f, f, Dh + f); place(o.f[1], x0 + Dw, y0 - f, f, Dh + f); place(o.f[2], x0 - f, y0 - f, Dw + 2 * f, f);
      place(o.hole, x0, y0, Dw, Dh);
      o.hole.style.perspective = Math.round(Math.max(900, Dh * 1.9)) + 'px';
      o.hole.style.perspectiveOrigin = px(W / 2 - x0) + ' ' + px(Hh * .5 - y0);
      var hl = o.K.h === 'l';
      o.door.style.transformOrigin = hl ? '0 50%' : '100% 50%';
      o.jamb.style.left = hl ? 'auto' : '0'; o.jamb.style.right = hl ? '0' : 'auto';
      var cy = o.K.c[1] / 1000;
      $$('i', o.jamb).forEach(function (i, n) { i.style.top = ((cy - .1 + n * .085) * 100).toFixed(1) + '%'; i.style.height = '5.5%'; });
      o.spot.style.left = (o.K.c[0] / 4.5) + '%'; o.spot.style.top = (o.K.c[1] / 10) + '%';
      place(o.spill, x0, fl, Dw, Hh - fl + 1);
      o.cx = x0 + o.K.c[0] / 450 * Dw; o.cy = y0 + o.K.c[1] / 1000 * Dh;
      o.lens.style.left = px(o.cx); o.lens.style.top = px(o.cy);
      o.go.style.transformOrigin = px(x0 + Dw / 2) + ' ' + px(y0 + Dh / 2);
      o.k = null;
    });
    mapK = null; bayView(); fitName();
    tick();
    if (beamAnim && beamAnim.playState === 'finished') beamIn();
  }
  // the footer name always fits its line
  function fitName() {
    var f = $('.fname'); if (!f) return;
    f.style.fontSize = '';
    var w = f.scrollWidth, avail = f.clientWidth;
    if (w > avail) f.style.fontSize = (parseFloat(getComputedStyle(f).fontSize) * avail / w * .98).toFixed(1) + 'px';
  }
  var seg = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  var io2 = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var eo = function (t) { return 1 - Math.pow(1 - t, 3); };
  function paintRoom(o, p) {
    var spot = seg(p, .36, .42) * (1 - seg(p, .66, .72));
    var lin = seg(p, .40, .445), lout = seg(p, .64, .68), lensO = lin * (1 - lout);
    var rake = seg(p, .42, .52), give = eo(seg(p, .52, .55)), turns = io2(seg(p, .55, .66));
    var ang = -4 * seg(p, .40, .44) - 86 * give - 630 * turns;
    var wd = seg(p, .52, .565);
    var jig = rake > 0 && rake < 1 ? Math.sin(rake * Math.PI * 14) * 3.2 * (1 - wd) : 0;
    var swing = io2(seg(p, .66, .86)), deg = 80 * swing;
    var walk = seg(p, .83, 1), fade = seg(p, .88, 1), leaf = seg(p, .84, .95);
    o.spot.style.opacity = (spot * .95).toFixed(3);
    o.lens.style.opacity = lensO.toFixed(3);
    o.lens.style.transform = 'scale(' + (.88 + .12 * eo(lin) + .04 * lout).toFixed(3) + ')';
    o.plug.setAttribute('transform', 'rotate(' + ang.toFixed(2) + ')');
    o.pick.setAttribute('transform', 'translate(' + (-wd * 46 + jig * .9).toFixed(2) + ' ' + (-wd * 20 + jig * .45).toFixed(2) + ')');
    o.pick.setAttribute('opacity', (1 - wd).toFixed(3));
    o.door.style.transform = 'rotateY(' + ((o.K.h === 'l' ? 1 : -1) * deg).toFixed(2) + 'deg)';
    o.shade.style.opacity = (.62 * Math.sin(deg * Math.PI / 180)).toFixed(3);
    o.light.style.opacity = (.32 * seg(p, .66, .74) * (1 - seg(p, .86, 1))).toFixed(3);
    o.spill.style.opacity = (swing * (1 - fade)).toFixed(3);
    o.go.style.transform = 'scale(' + (1 + (G.S - 1) * walk * walk).toFixed(4) + ')';
    o.door.style.opacity = (1 - leaf).toFixed(3); o.jamb.style.opacity = (1 - leaf).toFixed(3);
    o.th.style.opacity = (1 - fade).toFixed(3);
    return spot;
  }
  function lampGlow(v) { var g = $('[data-glow]'); if (g) g.style.opacity = (.55 + .45 * v).toFixed(3); }
  var hidden = false;
  function tick() {
    paintMap();
    pill.classList.toggle('up', scrollY > 24);
    var heroGone = hero.getBoundingClientRect().bottom < innerHeight * .55;
    var wide = innerWidth >= 700;
    var foot = $('.foot').getBoundingClientRect().top < innerHeight * .7 && wide;
    var away = wide && (!heroGone || foot);
    if (away !== hidden) { hidden = away; lampEl.classList.toggle('away', away); }
    if (still() || !built) return;
    var Hh = G.H || innerHeight, glow = 0;
    var tops = rooms.map(function (s) { return s.getBoundingClientRect().top; });   // read everything, then write
    rooms.forEach(function (s, i) {
      var o = s._th, p = (Hh - tops[i]) / Hh, on = p > -.01 && p < 1;
      if (o.th.classList.contains('on') !== on) o.th.classList.toggle('on', on);
      if (!on) return;
      var key = p.toFixed(4); if (key === o.k) return; o.k = key;
      glow = Math.max(glow, paintRoom(o, p));
    });
    lampGlow(glow);
  }

  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; tick(); }); } }, { passive: true });
  var rT = 0, lastW = innerWidth;
  addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { layout(); if (innerWidth !== lastW) { lastW = innerWidth; beamIn(); } }, 120); });

  build();
  setLang(root.lang === 'en' ? 'en' : 'he');
  beamIn();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitName(); });
  window.__th = { tick: tick, layout: layout, rooms: rooms, paint: paintRoom, door: doorSVG, lens: lensSVG };
})();
