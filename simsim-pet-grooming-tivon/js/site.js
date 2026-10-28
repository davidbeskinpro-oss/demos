(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var he = function () { return root.lang === 'he'; };
  var store = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };
  var WA = '972542144205';

  // ---------------------------------------------------------------- motion switch (animations live in the CSS)
  function motionUI() { $$('[data-motion]').forEach(function (b) { b.setAttribute('aria-checked', root.classList.contains('still') ? 'false' : 'true'); }); }
  $$('[data-motion]').forEach(function (b) { b.addEventListener('click', function () {
    var off = root.classList.toggle('still'); store('motion', off ? 'off' : 'on'); motionUI();
  }); });

  // ---------------------------------------------------------------- hours and live status (Asia/Jerusalem)
  var HOURS = [[8, 20], [8, 20], [8, 20], [8, 20], [8, 20], [8, 16], null];   // Sun..Sat
  var DAY_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], DAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() { var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; }); return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 }; }
  function hours() {
    var rows = [{ days: '0,1,2,3,4', he: 'ראשון עד חמישי', en: 'Sunday to Thursday', t: HOURS[0] }, { days: '5', he: 'שישי', en: 'Friday', t: HOURS[5] }, { days: '6', he: 'שבת', en: 'Saturday', t: null }];
    $('[data-hours]').innerHTML = rows.map(function (r) {
      return '<tr data-days="' + r.days + '"><td>' + (he() ? r.he : r.en) + '</td><td dir="ltr">' + (r.t ? hhmm(r.t[0]) + '–' + hhmm(r.t[1]) : (he() ? 'סגור' : 'Closed')) + '</td></tr>';
    }).join('');
    status();
  }
  function status() {
    var n = now(), t = HOURS[n.d], open = !!t && n.h >= t[0] && n.h < t[1], txt;
    if (open) txt = he() ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]);
    else {
      var k = 0, d = n.d;
      if (!(t && n.h < t[0])) { do { k++; d = (n.d + k) % 7; } while (!HOURS[d] && k < 7); }
      var when = k === 0 ? (he() ? 'היום' : 'today') : k === 1 ? (he() ? 'מחר' : 'tomorrow') : (he() ? 'ביום ' + DAY_HE[d] : 'on ' + DAY_EN[d]);
      txt = he() ? 'סגור עכשיו · נפתח ' + when + ' ב־' + hhmm(HOURS[d][0]) : 'Closed now · opens ' + when + ' at ' + hhmm(HOURS[d][0]);
    }
    var el = $('[data-status]'); el.classList.toggle('open', open); el.innerHTML = '<span class="dot"></span>' + txt;
    $$('[data-hours] tr').forEach(function (r) { r.classList.toggle('today', r.dataset.days.split(',').indexOf(String(n.d)) >= 0); });
  }
  setInterval(status, 60000);

  // ---------------------------------------------------------------- the next chapter: the form writes the WhatsApp message
  var form = $('[data-composer]'), prev = $('[data-preview]'), send = $('[data-send]');
  function message() {
    var v = function (n) { var x = form.querySelector('[name="' + n + '"]:checked'); return x ? x.value : ''; };
    var name = form.name.value.trim(), cat = v('who') === 'cat';
    var size = { s: he() ? 'קטן' : 'small', m: he() ? 'בינוני' : 'medium', l: he() ? 'גדול' : 'large' }[v('size')];
    if (he()) {
      var whom = name ? 'ל' + name : cat ? 'לחתול שלי' : 'לכלב שלי';
      var coat = { ok: 'פרווה רגילה', knots: 'יש לו קשרים בפרווה', long: 'הפרווה ארוכה ועבה' }[v('coat')];
      var mood = { calm: 'הוא רגוע', nervous: 'הוא קצת לחוץ', touch: 'הוא לא אוהב שנוגעים בו' }[v('mood')];
      return 'היי סימה, אשמח לקבוע טיפול ' + whom + '. ' + (cat ? 'חתול ' : 'כלב ') + size + ', ' + coat + '. ' + mood + '. מתי נוח לך?';
    }
    var who = name || (cat ? 'my cat' : 'my dog');
    var coatE = { ok: 'a normal coat', knots: 'his coat has knots', long: 'a long, thick coat' }[v('coat')];
    var moodE = { calm: "He's calm", nervous: 'He gets a bit nervous', touch: "He doesn't like being touched" }[v('mood')];
    return 'Hi Sima, I\'d like to book a groom for ' + who + '. A ' + size + ' ' + (cat ? 'cat' : 'dog') + ', ' + coatE + '. ' + moodE + '. When would suit you?';
  }
  function compose() { var m = message(); prev.textContent = m; send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(m); }
  form.addEventListener('input', compose); form.addEventListener('change', compose);

  // ---------------------------------------------------------------- language: everything that isn't a lang span
  function texts() {
    var l = root.lang;
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', he() ? h : e); }); };
    aria('.nav-links', 'ניווט', 'Navigation');
    aria('.dock', 'יצירת קשר', 'Contact');
    aria('.the-end', 'סוף', 'The end');
    $('.map iframe').title = he() ? 'מפה: זבולון 1, קריית טבעון' : 'Map: 1 Zevulun St., Kiryat Tivon';
    document.title = he() ? 'סימסים · סימה בסקין · ספרית כלבים וחתולים · קריית טבעון' : 'SimSim · Sima Beskin · dog & cat groomer · Kiryat Tivon';
    form.name.placeholder = he() ? 'לא חובה' : 'Optional';
    var hi = encodeURIComponent(he() ? 'היי סימה, אשמח לקבוע תספורת' : 'Hi Sima, I\'d like to book a groom');
    $$('[data-wa]').forEach(function (a) { a.href = 'https://wa.me/' + WA + '?text=' + hi; });
    compose(); hours();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () {
    var l = he() ? 'en' : 'he'; root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr'; store('lang', l); texts();
  }); });

  texts(); motionUI();
})();
