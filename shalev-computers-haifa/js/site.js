(function () {
  var root = document.documentElement, WA = '972525221010';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var still = function () { return root.classList.contains('still'); };
  var he = function () { return root.lang === 'he'; };
  var rtl = function () { return root.dir === 'rtl'; };
  var phone = function () { return innerWidth < 700; };
  var TITLE = { he: 'שלו · שירותים למחשבים ולתקשורת · הרץ היינריך 2, חיפה', en: 'Shalev · Computer & network services · 2 Heinrich Hertz St, Haifa' };
  var CONCEPT = { he: 'קונספט לדוגמה שנבנה עבור שלו – מתן שירותים למחשבים ותקשורת · זה אינו האתר הרשמי של העסק', en: 'A sample concept built for Shalev Computer & Network Services · This is not the business’s official website' };

  // ---------------------------------------------------------------- language
  function texts(l) {
    document.title = TITLE[l];
    $('[data-concept]').setAttribute('data-concept', CONCEPT[l]);
    $$('img[data-alt-he]').forEach(function (i) { i.alt = i.dataset[l === 'he' ? 'altHe' : 'altEn']; });
    var aria = function (sel, h, e) { $$(sel).forEach(function (el) { el.setAttribute('aria-label', l === 'he' ? h : e); }); };
    aria('[data-t-brand]', 'שלו – מתן שירותים למחשבים', 'Shalev Computer Services');
    aria('[data-t-nav]', 'ראשי', 'Main');
    aria('[data-t-places]', 'איפה עמרי עובד', 'Where Omri works');
    aria('[data-t-letter]', 'ביקורות', 'Reviews');
    aria('[data-t-reach]', 'יצירת קשר', 'Contact');
    aria('[data-t-nodes]', 'מה צריך טיפול', 'What needs care');
    aria('[data-t-where]', 'איפה', 'Where');
    aria('[data-t-round]', 'וואטסאפ לעמרי', 'WhatsApp Omri');
    aria('[data-t-call]', 'התקשרו לעמרי, 052-522-1010', 'Call Omri, 052-522-1010');
    aria('[data-t-wa]', 'וואטסאפ לעמרי', 'WhatsApp Omri');
    $$('[data-node]').forEach(function (n) { $('.nl', n).textContent = n.dataset[l === 'he' ? 'he' : 'en'].replace(/^./, function (c) { return c.toUpperCase(); }); });
    $$('.spot').forEach(function (s) { var t = s.dataset[l]; s.setAttribute('aria-label', t); if (s.classList.contains('on')) $('.tag', s).textContent = t; });
  }
  function setLang(l) {
    root.lang = l; root.dir = l === 'he' ? 'rtl' : 'ltr';
    try { localStorage.setItem('sh-lang', l); } catch (e) {}
    texts(l); hours(); write(); layout();
  }
  $$('[data-set-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(he() ? 'en' : 'he'); }); });

  // ---------------------------------------------------------------- motion switch
  var switches = $$('[data-motion-toggle]');
  function motionUI() { switches.forEach(function (b) { b.setAttribute('aria-checked', still() ? 'false' : 'true'); }); }
  switches.forEach(function (b) { b.addEventListener('click', function () {
    var on = still();
    root.classList.toggle('still', !on); delete root.dataset.motionAuto;
    try { localStorage.setItem('sh-motion', on ? 'on' : 'off'); } catch (e) {}
    motionUI();
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    settleAll(); layout(); wave.kick();
  }); });
  motionUI();

  // ---------------------------------------------------------------- hours and live status, Haifa time. null = closed
  var H = { 0: [8, 20], 1: [8, 20], 2: [8, 20], 3: [8, 20], 4: [8, 20], 5: [8, 20], 6: null };
  var dayHe = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'], dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hhmm = function (x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; };
  function now() {
    var o = {}; new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: false }).formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday), h: ((+o.hour) % 24) + (+o.minute) / 60 };
  }
  function status() {
    var n = window.__now || now(), l = he(), t = H[n.d], txt, open = false;
    if (t && n.h >= t[0] && n.h < t[1]) { open = true; txt = l ? 'פתוח עכשיו · עד ' + hhmm(t[1]) : 'Open now · until ' + hhmm(t[1]); }
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
  // consecutive days with the same hours share a row; the week starts on Sunday
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

  // ---------------------------------------------------------------- entrances
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  $$('[data-reveal]').forEach(function (el) { io ? io.observe(el) : el.classList.add('in'); });

  // ---------------------------------------------------------------- hero: the calm waterline
  var hero = $('[data-hero]'), sea = $('[data-sea]'), water = $('[data-water]'), l2 = $('[data-l2]');
  var wave = (function () {
    var w = 0, h = 0, seam = 0, t0 = performance.now(), t = 0, run = false, bump = 0, target = 0, px = -999, last = 0, raf = 0, visible = true;
    function measure() {
      var hr = hero.getBoundingClientRect(), lr = l2.getBoundingClientRect();
      w = hr.width; h = hr.height; seam = lr.top - hr.top + lr.height * .56;
    }
    function amp(now) { return still() ? 5 : 5 + 26 * Math.exp(-(now - t0) / 900); }   // choppy on arrival, then calm: shalev
    function draw(now) {
      var A = amp(now), d = 'M0 ' + h + ' L0 ', x, y, step = w < 700 ? 12 : 18, s2 = 2 * 110 * 110;
      for (x = 0; x <= w + step; x += step) {
        y = seam + A * (.62 * Math.sin(x * .0105 + t * 1.1) + .38 * Math.sin(x * .023 - t * 1.7)) - bump * Math.exp(-((x - px) * (x - px)) / s2);
        d += (x ? ' L' : '') + Math.min(x, w).toFixed(1) + ' ' + y.toFixed(1);
      }
      d += ' L' + w + ' ' + h + ' Z';
      sea.style.clipPath = "path('" + d + "')";
    }
    function frame(now) {
      raf = 0;
      if (!visible) { run = false; return; }
      t += .016;
      bump = lerp(bump, target, .12);
      if (now - last > 900) target = 0;
      draw(now);
      var settling = !still() && (now - t0 < 3200 || Math.abs(bump) > .15 || target);
      if (settling) raf = requestAnimationFrame(frame); else run = false;
    }
    function kick() { if (!w) measure(); if (still()) { bump = target = 0; draw(performance.now()); return; } if (!run) { run = true; raf = requestAnimationFrame(frame); } }
    hero.addEventListener('pointermove', function (e) {
      if (still() || e.pointerType !== 'mouse') return;
      var r = hero.getBoundingClientRect(); px = e.clientX - r.left;
      var dy = Math.abs(e.clientY - r.top - seam); target = dy < 220 ? 20 * (1 - dy / 220) : 0; last = performance.now(); kick();
    });
    hero.addEventListener('pointerleave', function () { target = 0; kick(); });
    if (io) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) kick(); }).observe(hero);
    return { measure: function () { measure(); draw(performance.now()); }, kick: kick, start: function () { t0 = performance.now(); kick(); } };
  })();

  // the logo arrives in pixel blocks, like the dissolve on its own brain mark
  (function () {
    var m = $('[data-pixmark]'); if (!m) return;
    var cols = 8, rows = 6, cells = [];
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var i = document.createElement('i');
      i.style.cssText = 'left:' + (c * 100 / cols) + '%;top:' + (r * 100 / rows) + '%;width:' + (100 / cols + .6) + '%;height:' + (100 / rows + .6) + '%';
      m.appendChild(i); cells.push(i);
    }
    window.__pixmark = function () {
      cells.forEach(function (i) {
        if (still()) { i.style.transform = 'scale(0)'; return; } // taste-skill-ignore: logo pixel cover leaves
        setTimeout(function () { i.style.transform = 'scale(0)'; }, 80 + Math.random() * 620); // taste-skill-ignore: logo pixel cover leaves
      });
    };
  })();

  // the hero dissolves into the next section in square pixels as you scroll (and comes back when you scroll up)
  var px = $('[data-px]'), pxCells = [];
  function buildPx() {
    px.innerHTML = ''; pxCells = [];
    var w = hero.clientWidth, s = Math.max(28, Math.round(w / 26)), cols = Math.ceil(w / s), rows = 5;
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var i = document.createElement('i');
      i.style.cssText = 'width:' + (s + 1) + 'px;height:' + (s + 1) + 'px;left:' + (c * s) + 'px;bottom:' + (r * s) + 'px';
      i.dataset.th = (r * .19 + Math.random() * .32 - .1).toFixed(3);
      px.appendChild(i); pxCells.push(i);
    }
  }

  // ---------------------------------------------------------------- portrait: halftone dots in the logo's periwinkle resolve into the photo
  var tone = $('[data-halftone]'), toneCv = tone && $('canvas', tone), toneOk = false;
  function halftone() {
    var img = $('img', tone); if (!img.complete || !img.naturalWidth) { img.addEventListener('load', halftone, { once: true }); return; }
    try {
      var box = tone.clientWidth, dpr = Math.min(2, devicePixelRatio || 1), g = 9, n = Math.ceil(box / g);
      var sc = document.createElement('canvas'); sc.width = sc.height = n;
      var sx = sc.getContext('2d'); sx.drawImage(img, 0, 0, n, n);
      var px = sx.getImageData(0, 0, n, n).data;
      toneCv.width = toneCv.height = Math.round(box * dpr);
      var c = toneCv.getContext('2d'); c.scale(dpr, dpr);
      c.fillStyle = '#202334'; c.fillRect(0, 0, box, box); c.fillStyle = '#9a9dff';
      for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
        var k = (y * n + x) * 4, lum = (px[k] * .3 + px[k + 1] * .59 + px[k + 2] * .11) / 255, r = Math.pow(lum, .9) * g * .58;
        if (r > .4) { c.beginPath(); c.arc(x * g + g / 2, y * g + g / 2, r, 0, 6.2832); c.fill(); }
      }
      toneOk = true;
    } catch (e) { toneOk = false; }
    toneCv.style.display = toneOk ? '' : 'none';
    tick();
  }

  // ---------------------------------------------------------------- the places: each field rides up over the last
  var fields = $$('[data-field]');
  fields.forEach(function (f) { var s = document.createElement('i'); s.className = 'shade'; f.appendChild(s); });

  // ---------------------------------------------------------------- the work photo: a frame that opens, then labels that type themselves
  var work = $('[data-work]'), wfig = $('[data-wfig]'), wimg = $('img', wfig), spots = $$('.spot');
  function placeSpots() {
    var W = wfig.clientWidth, Hh = wfig.clientHeight, iw = 1100, ih = 2062, s = Math.max(W / iw, Hh / ih), dw = iw * s, dh = ih * s;
    var ox = (W - dw) * .5, oy = (Hh - dh) * .3;           // object-position 50% 30%
    spots.forEach(function (sp) {
      var x = ox + dw * +sp.dataset.x, y = oy + dh * +sp.dataset.y;
      sp.style.left = x + 'px'; sp.style.top = y + 'px';
      sp.classList.toggle('flip', x > W * .58);
      sp.hidden = x < 10 || x > W - 10 || y < 10 || y > Hh - 10;
    });
  }
  function typeTag(sp, on) {
    var tag = $('.tag', sp), txt = sp.dataset[he() ? 'he' : 'en'];
    if (on === sp.classList.contains('on')) return;
    sp.classList.toggle('on', on);
    clearInterval(sp._t);
    if (!on) { tag.textContent = ''; return; }
    if (still()) { tag.textContent = txt; return; }
    var i = 0; tag.textContent = '';
    sp._t = setInterval(function () { tag.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(sp._t); }, 34);
  }
  var hoverSpot = null;
  spots.forEach(function (sp) {
    sp.addEventListener('mouseenter', function () { hoverSpot = sp; typeTag(sp, true); });
    sp.addEventListener('mouseleave', function () { hoverSpot = null; tick(); });
    sp.addEventListener('click', function () { typeTag(sp, !sp.classList.contains('on')); sp._pinned = sp.classList.contains('on'); });
  });

  // ---------------------------------------------------------------- the numbers roll like an odometer
  $$('[data-odo]').forEach(function (o) {
    o.innerHTML = o.dataset.odo.split('').map(function (ch) {
      if (!/\d/.test(ch)) return '<span class="d" aria-hidden="true"><span><b data-n="' + ch + '"></b></span></span>';
      var b = ''; for (var k = 0; k < 10; k++) b += '<b data-n="' + k + '"></b>';
      return '<span class="d" data-to="' + ch + '" aria-hidden="true"><span>' + b + '</span></span>';
    }).join('');    // numerals come from CSS so only the real number is text (aria-label on the wrapper)
    o.setAttribute('role', 'img');
  });
  function roll(o, go) {
    $$('.d[data-to]', o).forEach(function (d, i) {
      var s = d.firstChild, to = go ? +d.dataset.to : (+d.dataset.to + 3) % 10;
      s.style.transitionDelay = go ? (i * 140) + 'ms' : '0ms';
      s.style.transform = 'translateY(' + (-to * 10) + '%)';
    });
  }
  $$('[data-odo]').forEach(function (o) {
    roll(o, still());
    if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { roll(o, true); ob.disconnect(); } }, { threshold: .3 }).observe(o); else roll(o, true);
  });

  // ---------------------------------------------------------------- the network map (the live thing)
  var map = $('[data-map]'), wires = $('[data-wires]'), hub = $('[data-hub]'), nodes = $$('[data-node]'), lines = [], NS = 'http://www.w3.org/2000/svg';
  var hubPos = [0, 0], nodePos = [];
  nodes.forEach(function (n, i) {
    var ln = document.createElementNS(NS, 'line'); wires.appendChild(ln); lines.push(ln);
    n.addEventListener('click', function () {
      var on = n.getAttribute('aria-pressed') !== 'true';
      n.setAttribute('aria-pressed', on ? 'true' : 'false'); ln.classList.toggle('on', on);
      if (on) packet(i);
      write();
    });
  });
  function mapLayout() {
    var W = map.clientWidth, Hh;
    if (phone()) {
      var top = 74, gap = 84; Hh = top + 70 + 4 * gap;
      map.style.height = Hh + 'px';
      hubPos = [W / 2, top];
      nodePos = nodes.map(function (n, i) { var col = i % 2, row = Math.floor(i / 2); return [W * (rtl() ? (col ? .25 : .75) : (col ? .75 : .25)), top + 110 + row * gap]; });
    } else {
      map.style.height = ''; Hh = map.clientHeight;
      hubPos = [W / 2, Hh / 2];
      var rx = Math.min(W * .4, 500), ry = Hh * .4;
      nodePos = nodes.map(function (n, i) { var a = -Math.PI / 2 + i * Math.PI * 2 / nodes.length; return [W / 2 + Math.cos(a) * rx * (rtl() ? -1 : 1), Hh / 2 + Math.sin(a) * ry]; });
    }
    hub.style.left = hubPos[0] + 'px'; hub.style.top = hubPos[1] + 'px';
    nodes.forEach(function (n, i) {
      n.style.left = nodePos[i][0] + 'px'; n.style.top = nodePos[i][1] + 'px';
      var l = lines[i]; l.setAttribute('x1', hubPos[0]); l.setAttribute('y1', hubPos[1]); l.setAttribute('x2', nodePos[i][0]); l.setAttribute('y2', nodePos[i][1]);
    });
  }
  function packet(i) {
    if (still()) return;
    var c = document.createElementNS(NS, 'circle'); c.setAttribute('r', 5); wires.appendChild(c);
    var t0 = performance.now(), a = hubPos, b = nodePos[i];
    (function step(now) {
      var t = smooth((now - t0) / 520);
      c.setAttribute('cx', lerp(b[0], a[0], t)); c.setAttribute('cy', lerp(b[1], a[1], t));   // the request travels from the device to the hub
      if (t < 1) requestAnimationFrame(step); else c.remove();
    })(t0);
  }
  // labels decode out of scrambled letters the first time the map comes into view
  function scramble() {
    var pool = he() ? 'אבגדהוזחטיכלמנסעפצקרשת' : 'abcdefghijklmnopqrstuvwxyz';
    nodes.forEach(function (n, j) {
      var el = $('.nl', n), txt = el.textContent, start = performance.now() + j * 70;
      (function step(now) {
        var p = clamp((now - start) / 640, 0, 1), k = Math.floor(p * txt.length), out = txt.slice(0, k);
        for (var q = k; q < txt.length; q++) out += txt[q] === ' ' ? ' ' : pool[Math.floor(Math.random() * pool.length)];
        el.textContent = out;
        if (p < 1) requestAnimationFrame(step); else el.textContent = txt;
      })(performance.now());
    });
  }
  if (io) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { if (!still()) scramble(); ob.disconnect(); } }, { threshold: .35 }).observe(map);

  var where = $$('[data-where]');
  where.forEach(function (b) { b.addEventListener('click', function () { where.forEach(function (x) { x.setAttribute('aria-checked', x === b ? 'true' : 'false'); }); write(); }); });
  function list(items, l) {
    if (items.length < 2) return items.join('');
    return l ? items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1] : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }
  function write() {
    var l = he(), picked = nodes.filter(function (n) { return n.getAttribute('aria-pressed') === 'true'; }).map(function (n) { return n.dataset[l ? 'he' : 'en']; });
    var w = where.filter(function (x) { return x.getAttribute('aria-checked') === 'true'; })[0];
    var place = w.dataset[l ? 'he' : 'en'];
    var msg = l ? 'שלום עמרי, אשמח לעזרה עם ' + (picked.length ? list(picked, true) : 'המחשב') + '. איפה: ' + place + '.'
                : 'Hi Omri, I’d like help with ' + (picked.length ? 'the ' + list(picked, false) : 'my computer') + '. Where: ' + place + '.';
    $('[data-msg]').textContent = msg;
    $('[data-send]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
  }

  // ---------------------------------------------------------------- contact: the photo shrinks into its frame
  var reach = $('.r-wrap'), rphoto = $('[data-rphoto]'), rows = $$('.row', $('[data-rows]'));

  // ---------------------------------------------------------------- one scroll loop for everything scroll-linked
  var ticking = false;
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function update() {
    ticking = false;
    var vh = innerHeight, y = scrollY, calm = still();
    // hero water drifts slower than the page; pixels eat the bottom edge
    var hr = hero.getBoundingClientRect();
    if (hr.bottom > 0) {
      water.style.transform = calm ? '' : 'translate3d(0,' + (y * .18).toFixed(1) + 'px,0)';
      var p = calm ? 0 : clamp(y / (hr.height * .55), 0, 1.4);
      pxCells.forEach(function (c) { c.classList.toggle('on', !calm && p > +c.dataset.th); });
    }
    // portrait
    if (tone && toneOk) {
      var tr = tone.getBoundingClientRect(), q = calm ? 1 : smooth((vh * .9 - tr.top) / (vh * .55));
      toneCv.style.opacity = (1 - q).toFixed(3);
    }
    // fields
    fields.forEach(function (f, i) {
      var nx = fields[i + 1], c = 0;
      if (!calm && nx) { var nt = nx.getBoundingClientRect().top; c = clamp(1 - nt / vh, 0, 1); }
      f.lastElementChild.style.opacity = (c * .55).toFixed(3);
      for (var k = 0; k < f.children.length - 1; k++) f.children[k].style.transform = c ? 'translateY(' + (-c * 4).toFixed(2) + 'vh) scale(' + (1 - c * .04).toFixed(4) + ')' : '';
    });
    // work photo
    var wr = work.getBoundingClientRect(), wp = calm ? 1 : clamp(-wr.top / Math.max(1, wr.height - vh), 0, 1), e = calm ? 1 : smooth(wp / .4);
    var it = phone() ? 20 : 18, is = phone() ? 9 : 30;
    wfig.style.setProperty('--it', (it * (1 - e)).toFixed(2) + '%');
    wfig.style.setProperty('--ib', (it * (1 - e)).toFixed(2) + '%');
    wfig.style.setProperty('--is', (is * (1 - e)).toFixed(2) + '%');
    $$('.w-copy [data-reveal]', work).forEach(function (el) { if (e > .85 || calm) el.classList.add('in'); else if (!calm) el.classList.remove('in'); });
    spots.forEach(function (sp, i) { if (sp === hoverSpot || sp._pinned) return; typeTag(sp, calm || wp > .46 + i * .1); });
    // contact
    var rr = reach.getBoundingClientRect(), rp = calm ? 1 : clamp(-rr.top / Math.max(1, rr.height - vh), 0, 1), s = calm ? 1 : smooth(rp / .55);
    if (!calm) {
      var W = rphoto.clientWidth, Hh = rphoto.clientHeight, t, b, st, en;
      if (innerWidth <= 800) { t = 0; b = Hh * .58; st = 0; en = 0; }
      else { t = Hh * .13; b = Hh * .13; st = W * .6; en = W * .05; }       // frame at the inline end, rows at the start
      var L = rtl() ? en : st, R = rtl() ? st : en;
      rphoto.style.setProperty('--pt', (t * s).toFixed(1) + 'px'); rphoto.style.setProperty('--pb', (b * s).toFixed(1) + 'px');
      rphoto.style.setProperty('--pl', (L * s).toFixed(1) + 'px'); rphoto.style.setProperty('--pr', (R * s).toFixed(1) + 'px');
    }
    rows.forEach(function (r, i) {
      var v = calm ? 1 : smooth((s - .45 - i * .07) / .2);
      r.style.opacity = v.toFixed(3); r.style.transform = v < 1 ? 'translateY(' + ((1 - v) * 24).toFixed(1) + 'px)' : '';
    });
  }
  function settleAll() {
    if (still()) { $$('[data-pixmark] i').forEach(function (i) { i.style.transform = 'scale(0)'; }); $$('[data-odo]').forEach(function (o) { roll(o, true); }); } // taste-skill-ignore: logo pixel cover leaves
    fields.forEach(function (f) { for (var k = 0; k < f.children.length; k++) f.children[k].style.transform = ''; });
    rows.forEach(function (r) { r.style.opacity = ''; r.style.transform = ''; });
    tick();
  }

  function layout() { wave.measure(); buildPx(); placeSpots(); mapLayout(); tick(); }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { layout(); if (toneOk || tone) halftone(); }, 120); });
  addEventListener('scroll', tick, { passive: true });

  texts(root.lang); hours(); write();
  layout(); halftone();
  var go = function () { hero.classList.add('ready'); window.__pixmark && window.__pixmark(); wave.measure(); wave.start(); };
  var once = false, fire = function () { if (!once) { once = true; requestAnimationFrame(go); } };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fire);
  setTimeout(fire, 1200);
})();
