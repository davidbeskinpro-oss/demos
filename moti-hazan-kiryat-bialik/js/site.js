(() => {
  const R = document.documentElement, $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const still = () => R.classList.contains('still');
  const he = () => R.lang === 'he';
  const store = (k, v) => { try { localStorage.setItem(k, v) } catch (e) {} };
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const WA = '972523984698';

  /* ---------- language ---------- */
  function setLang(l) {
    R.lang = l; R.dir = l === 'he' ? 'rtl' : 'ltr'; store('mh-lang', l);
    $$('[data-alt-en]').forEach(i => { i.dataset.altHe ??= i.alt; i.alt = l === 'en' ? i.dataset.altEn : i.dataset.altHe; });
    $$('.arrow.prev').forEach(b => b.setAttribute('aria-label', l === 'en' ? 'Previous' : 'הקודם')); $$('.arrow.next').forEach(b => b.setAttribute('aria-label', l === 'en' ? 'Next' : 'הבא'));
    const rs = $('[data-rosette]'); rs && rs.setAttribute('aria-label', l === 'en' ? 'Choose family members and a day' : 'בחירת בני משפחה ויום');
    status(); hoursList(); compose(); buildRosette(); walkUpdate();
  }
  $$('[data-set-lang]').forEach(b => b.addEventListener('click', () => setLang(he() ? 'en' : 'he')));

  /* ---------- motion switch (g3) ---------- */
  function syncToggles() { $$('[data-motion-toggle]').forEach(b => b.setAttribute('aria-checked', String(!still()))); }
  $$('[data-motion-toggle]').forEach(b => b.addEventListener('click', () => {
    R.classList.toggle('still'); store('mh-motion', still() ? 'off' : 'on'); syncToggles();
    if (still()) { stopLoops(); walkStill(0); } else { startLoops(); }
    onScroll();
  }));
  syncToggles();

  /* ---------- hours + live status (Israel time) ---------- */
  const HOURS = [[9, 19], [9, 19], [9, 19], [9, 19], [9, 19], [9, 19], null]; // Sunday..Saturday; null = closed
  const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function nowIL() {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    const g = t => p.find(x => x.type === t).value;
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday')), m: +g('hour') * 60 + +g('minute') };
  }
  function nextOpen(d) { for (let i = 1; i <= 7; i++) { const k = (d + i) % 7; if (HOURS[k]) return k; } return -1; }
  function state() {
    const { d, m } = nowIL(), h = HOURS[d];
    if (h && m >= h[0] * 60 && m < h[1] * 60) return { open: true, until: h[1] };
    if (h && m < h[0] * 60) return { open: false, day: d, at: h[0], today: true };
    const k = nextOpen(d); return { open: false, day: k, at: k < 0 ? null : HOURS[k][0], tomorrow: k === (d + 1) % 7 };
  }
  function statusText() {
    const s = state();
    if (s.open) return he() ? `פתוח עכשיו, עד <bdi dir="ltr">${s.until}:00</bdi>` : `Open now, until ${s.until}:00`;
    if (s.at == null) return he() ? 'סגור כרגע' : 'Closed now';
    if (s.today) return he() ? `סגור כרגע, נפתח היום ב-<bdi dir="ltr">${s.at}:00</bdi>` : `Closed now, opens today at ${s.at}:00`;
    if (s.tomorrow) return he() ? `סגור כרגע, נפתח מחר ב-<bdi dir="ltr">${s.at}:00</bdi>` : `Closed now, opens tomorrow at ${s.at}:00`;
    return he() ? `סגור כרגע, נפתח ביום ${DAYS_HE[s.day]} ב-<bdi dir="ltr">${s.at}:00</bdi>` : `Closed now, opens ${DAYS_EN[s.day]} at ${s.at}:00`;
  }
  function status() {
    const t = statusText(), open = state().open;
    $$('[data-status]').forEach(e => e.innerHTML = `<i class="dotl${open ? '' : ' closed'}" aria-hidden="true"></i><span>${t}</span>`);
    $$('[data-status-line]').forEach(e => e.innerHTML = `<b>${t}.</b> ${he() ? 'ראשון עד שישי <bdi dir="ltr">9:00–19:00</bdi>, שבת סגור.' : 'Sunday to Friday 9:00–19:00, closed Saturday.'}`);
  }
  function hoursList() {
    const ul = $('[data-hours]'); if (!ul) return; const { d } = nowIL();
    ul.innerHTML = HOURS.map((h, i) => `<li class="${i === d ? 'today' : ''}${h ? '' : ' off'}"><span>${he() ? 'יום ' + DAYS_HE[i] : DAYS_EN[i]}${i === d ? (he() ? ' · היום' : ' · today') : ''}</span><span class="t">${h ? `${h[0]}:00–${h[1]}:00` : (he() ? 'סגור' : 'Closed')}</span></li>`).join('');
  }

  /* ---------- nav gathers into a pill; dock hides at the footer ---------- */
  const nav = $('[data-nav]'), dock = $('.dock'), foot = $('.foot');

  /* ---------- hero: tagline words, dealt photos, pointer parallax, motes in the sunbeams ---------- */
  $$('[data-words] > span').forEach(sp => { sp.innerHTML = sp.textContent.split(' ').map((w, k) => `<span class="w" style="--k:${k}">${w}</span>`).join(' '); });
  function deal() {
    if (still() || !Element.prototype.animate) return;
    const photo = $('[data-hero-photo]'), cards = $$('.deck .card'), vw = innerWidth;
    const spots = [[-0.9, -8], [0.9, 7]];
    cards.forEach((c, i) => c.animate([
      { opacity: 0, transform: `translate(-50%,-30%) rotate(0deg) scale(.6)` },
      { opacity: 1, offset: .35, transform: `translate(calc(-50% + ${spots[i][0] * Math.min(vw * .22, 260)}px),-50%) rotate(${spots[i][1]}deg) scale(1)` },
      { opacity: 1, offset: .8, transform: `translate(calc(-50% + ${spots[i][0] * Math.min(vw * .22, 260)}px),-50%) rotate(${spots[i][1]}deg) scale(1)` },
      { opacity: 0, transform: `translate(calc(-50% + ${spots[i][0] * Math.min(vw * .3, 340)}px),-46%) rotate(${spots[i][1] * 1.4}deg) scale(1.05)` }
    ], { duration: 1500, delay: i * 90, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'both' }));
    photo.animate([
      { clipPath: 'inset(32% 38% 32% 38% round 18px)', transform: 'rotate(-2deg)' },
      { clipPath: 'inset(32% 38% 32% 38% round 18px)', transform: 'rotate(-2deg)', offset: .4 },
      { clipPath: 'inset(0% 0% 0% 0% round 0px)', transform: 'rotate(0deg)' }
    ], { duration: 1450, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'backwards' });
  }
  const heroImg = $('[data-hero-photo] img'), hero = $('[data-hero]');
  if (fine) hero.addEventListener('pointermove', e => {
    if (still()) return; const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    heroImg.style.setProperty('--px', (-x * 24) + 'px'); heroImg.style.setProperty('--py', (-y * 16) + 'px'); mouse.x = e.clientX; mouse.y = e.clientY - hero.getBoundingClientRect().top;
  });
  const mouse = { x: -999, y: -999 };
  const motes = $('[data-motes]'), mctx = motes.getContext('2d');
  let M = [], mRaf = 0;
  function sizeMotes() {
    const dpr = Math.min(devicePixelRatio || 1, 2); motes.width = motes.offsetWidth * dpr; motes.height = motes.offsetHeight * dpr; mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = innerWidth < 600 ? 46 : 90;
    M = Array.from({ length: n }, () => ({ x: Math.random() * motes.offsetWidth, y: Math.random() * motes.offsetHeight, r: .6 + Math.random() * 1.9, vx: .05 + Math.random() * .18, vy: -.04 - Math.random() * .12, ph: Math.random() * 6.28 }));
  }
  function drawMotes(t) {
    const w = motes.offsetWidth, h = motes.offsetHeight; mctx.clearRect(0, 0, w, h);
    for (const p of M) {
      p.ph += .01; p.x += p.vx + Math.sin(p.ph) * .15; p.y += p.vy + Math.cos(p.ph * .7) * .08;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 14000) { const f = (14000 - d2) / 14000 * 1.6; p.x += dx / Math.sqrt(d2 + 1) * f; p.y += dy / Math.sqrt(d2 + 1) * f; }
      if (p.x > w + 10) p.x = -10; if (p.y < -10) p.y = h + 10; if (p.x < -10) p.x = w + 10;
      // brighter where the roof's light bands fall (diagonal stripes)
      const band = .5 + .5 * Math.sin((p.x * .9 + p.y * .42) / 70 + t / 4000);
      mctx.globalAlpha = .18 + band * .6; mctx.fillStyle = '#ffeec8';
      mctx.beginPath(); mctx.arc(p.x, p.y, p.r, 0, 6.283); mctx.fill();
    }
    mRaf = requestAnimationFrame(drawMotes);
  }

  /* ---------- hair snips falling in the women's card ---------- */
  const snip = $('[data-snips]'), sctx = snip && snip.getContext('2d');
  let S = [], sRaf = 0, snipVisible = false;
  function spawnSnips(n) {
    const w = snip.offsetWidth;
    for (let i = 0; i < n; i++) S.push({ x: w * (.38 + Math.random() * .2), y: snip.offsetHeight * (.32 + Math.random() * .1), vx: (Math.random() - .5) * .8, vy: Math.random() * .4, a: Math.random() * 6.28, va: (Math.random() - .5) * .08, len: 10 + Math.random() * 18, bend: (Math.random() - .5) * 10, life: 0 });
  }
  function drawSnips() {
    const dpr = Math.min(devicePixelRatio || 1, 2), w = snip.offsetWidth, h = snip.offsetHeight;
    if (snip.width !== Math.round(w * dpr)) { snip.width = w * dpr; snip.height = h * dpr; }
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0); sctx.clearRect(0, 0, w, h);
    if (snipVisible && Math.random() < .12) spawnSnips(2);
    S = S.filter(p => p.y < h + 30);
    for (const p of S) {
      p.vy = Math.min(p.vy + .035, 1.6); p.vx *= .99; p.vx += Math.sin(p.life / 18) * .02; p.x += p.vx; p.y += p.vy; p.a += p.va; p.life++;
      sctx.save(); sctx.translate(p.x, p.y); sctx.rotate(p.a);
      sctx.strokeStyle = 'rgba(236,206,140,.9)'; sctx.lineWidth = 1.1; sctx.lineCap = 'round';
      sctx.beginPath(); sctx.moveTo(-p.len / 2, 0); sctx.quadraticCurveTo(0, p.bend, p.len / 2, 0); sctx.stroke();
      sctx.strokeStyle = 'rgba(120,84,40,.5)'; sctx.lineWidth = .7; sctx.beginPath(); sctx.moveTo(-p.len / 2, 1.2); sctx.quadraticCurveTo(0, p.bend + 1.2, p.len / 2, 1.2); sctx.stroke();
      sctx.restore();
    }
    sRaf = requestAnimationFrame(drawSnips);
  }
  if (snip) {
    new IntersectionObserver(es => es.forEach(e => snipVisible = e.isIntersecting), { threshold: .3 }).observe(snip);
    snip.closest('.tile').addEventListener('click', () => !still() && spawnSnips(14));
  }

  /* ---------- the men's card: a lamp's spotlight follows the hand, sweeps by itself on touch ---------- */
  const men = $('[data-spot] .vis');
  let spotAuto = 0;
  if (men) {
    if (fine) men.addEventListener('pointermove', e => { const r = men.getBoundingClientRect(); men.style.setProperty('--sx', (e.clientX - r.left) + 'px'); men.style.setProperty('--sy', (e.clientY - r.top) + 'px'); spotAuto = -1; });
  }
  function spotSweep(t) {
    if (men && spotAuto !== -1) { const r = men.getBoundingClientRect(); men.style.setProperty('--sx', (r.width * (.5 + .32 * Math.sin(t / 1900))) + 'px'); men.style.setProperty('--sy', (r.height * (.55 + .18 * Math.sin(t / 1300))) + 'px'); }
  }

  /* ---------- cards lean toward the hand ---------- */
  if (fine) $$('[data-tilt]').forEach(c => {
    c.addEventListener('pointermove', e => { if (still()) return; const r = c.getBoundingClientRect(); c.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 8 + 'deg'); c.style.setProperty('--rx', -((e.clientY - r.top) / r.height - .5) * 8 + 'deg'); });
    c.addEventListener('pointerleave', () => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
  });

  /* ---------- SIGNATURE: walk through the salon; a column passes in front and carries each cut ---------- */
  const walk = $('[data-walk]'), f1 = $('.f1'), f2 = $('.f2'), f3 = $('.f3'), colA = $('.col-a'), colB = $('.col-b'), caps = $$('[data-caps] li'), pips = $$('.pip');
  let stillStep = 0;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  function wipe(frame, col, t) {
    // the column travels right → left across the frame; the old photo stays to the left of its centre line
    const W = walk.querySelector('.walk-stage').offsetWidth, cw = col.getBoundingClientRect().width || W * .16;
    const cx = W + cw - ease(t) * (W + cw * 2) + cw / 2; // centre line in px
    col.style.transform = `translate3d(${cx - cw / 2}px,0,0)`;
    frame.style.clipPath = t <= 0 ? 'inset(0 0 0 0)' : t >= 1 ? 'inset(0 100% 0 0)' : `inset(0 ${Math.max(0, W - cx)}px 0 0)`;
  }
  function setCap(i) { caps.forEach((c, k) => c.classList.toggle('on', k === i)); pips.forEach((p, k) => p.classList.toggle('on', k === i)); }
  function walkUpdate() {
    if (!walk) return;
    if (still()) { walkStill(stillStep); return; }
    [f1, f2, f3].forEach(f => f.style.opacity = '');
    const r = walk.getBoundingClientRect(), total = walk.offsetHeight - innerHeight, p = clamp(-r.top / total);
    const t1 = clamp((p - .26) / .2), t2 = clamp((p - .6) / .2);
    wipe(f1, colA, t1); wipe(f2, colB, t2);
    if (t1 <= 0) colA.style.transform = 'translate3d(-120vw,0,0)';
    if (t2 <= 0) colB.style.transform = 'translate3d(-120vw,0,0)';
    // the camera keeps pushing into each room while it is on screen
    f1.querySelector('img').style.setProperty('--z', (1.02 + clamp(p / .46) * .14).toFixed(4));
    f2.querySelector('img').style.setProperty('--z', (1.12 - clamp((p - .26) / .54) * .08).toFixed(4));
    f3.querySelector('img').style.setProperty('--z', (1.1 - clamp((p - .6) / .4) * .08).toFixed(4));
    setCap(t2 > .5 ? 2 : t1 > .5 ? 1 : 0);
  }
  function walkStill(i) {
    stillStep = (i + 3) % 3;
    f1.style.clipPath = f2.style.clipPath = 'none';
    [f1, f2, f3].forEach((f, k) => f.style.opacity = k === stillStep ? '1' : '0');
    colA.style.transform = colB.style.transform = '';
    setCap(stillStep);
  }
  $$('[data-step]').forEach(b => b.addEventListener('click', () => walkStill(stillStep + +b.dataset.step)));
  $$('[data-go]').forEach(b => b.addEventListener('click', () => {
    const i = +b.dataset.go;
    if (still()) return walkStill(i);
    const total = walk.offsetHeight - innerHeight, p = [.1, .5, .9][i];
    scrollTo({ top: walk.offsetTop + total * p, behavior: 'smooth' });
  }));

  /* ---------- LIVE THING: the floor rosette as a family booking ---------- */
  const WHO = [
    { he: 'אמא', en: 'Mum', max: 1 }, { he: 'אבא', en: 'Dad', max: 1 }, { he: 'בן', en: 'Son', max: 3, pl: ['בן', 'שני בנים', 'שלושה בנים'], plEn: ['a son', 'two sons', 'three sons'] },
    { he: 'בת', en: 'Daughter', max: 3, pl: ['בת', 'שתי בנות', 'שלוש בנות'], plEn: ['a daughter', 'two daughters', 'three daughters'] },
    { he: 'סבתא', en: 'Grandma', max: 1 }, { he: 'סבא', en: 'Grandpa', max: 1 }
  ];
  const cnt = WHO.map(() => 0); let day = -1;
  const ros = $('[data-rosette]');
  const pt = (r, a) => [r * Math.cos(a), r * Math.sin(a)];
  function arc(r0, r1, a0, a1) {
    const [x0, y0] = pt(r1, a0), [x1, y1] = pt(r1, a1), [x2, y2] = pt(r0, a1), [x3, y3] = pt(r0, a0), L = a1 - a0 > Math.PI ? 1 : 0;
    return `M${x0} ${y0}A${r1} ${r1} 0 ${L} 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 ${L} 0 ${x3} ${y3}Z`;
  }
  function buildRosette() {
    if (!ros) return;
    const NS = 'http://www.w3.org/2000/svg', rtl = he();
    const who = $('.who', ros), days = $('.days', ros), halo = $('.halo', ros);
    who.innerHTML = ''; days.innerHTML = '';
    const order = i => rtl ? -i : i; // segments run clockwise in English, counter-clockwise in Hebrew (reading direction)
    WHO.forEach((w, i) => {
      const a0 = -Math.PI / 2 + order(i) * (Math.PI * 2 / 6) - Math.PI / 6, a1 = a0 + Math.PI * 2 / 6;
      const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'seg' + (cnt[i] ? ' on' : '')); g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button');
      const label = rtl ? w.he : w.en; g.setAttribute('aria-label', label + (cnt[i] ? ` (${cnt[i]})` : '')); g.setAttribute('aria-pressed', String(!!cnt[i]));
      const [tx, ty] = pt(104, (a0 + a1) / 2);
      g.innerHTML = `<path d="${arc(70, 140, a0 + .012, a1 - .012)}"/><text x="${tx}" y="${ty - (w.max > 1 ? 6 : 0)}">${label}</text>` +
        (w.max > 1 ? `<g class="dots">${[0, 1, 2].map(k => `<circle cx="${tx + (k - 1) * 12}" cy="${ty + 16}" r="${k < cnt[i] ? 4 : 2}" opacity="${k < cnt[i] ? 1 : .45}"/>`).join('')}</g>` : '');
      const act = () => { cnt[i] = cnt[i] >= w.max ? 0 : cnt[i] + 1; buildRosette(); compose(); pulse(i, 'who'); };
      g.addEventListener('click', act); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
      who.appendChild(g);
    });
    for (let i = 0; i < 7; i++) {
      const a0 = -Math.PI / 2 + order(i) * (Math.PI * 2 / 7) - Math.PI / 7, a1 = a0 + Math.PI * 2 / 7, shut = !HOURS[i];
      const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'seg' + (day === i ? ' on' : '') + (shut ? ' shut' : ''));
      const name = rtl ? DAYS_HE[i] : DAYS_EN[i].slice(0, 3);
      g.setAttribute('aria-label', (rtl ? 'יום ' + DAYS_HE[i] : DAYS_EN[i]) + (shut ? (rtl ? ', סגור' : ', closed') : ''));
      if (!shut) { g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-pressed', String(day === i)); } else g.setAttribute('aria-disabled', 'true');
      const [tx, ty] = pt(171, (a0 + a1) / 2);
      g.innerHTML = `<path d="${arc(146, 196, a0 + .01, a1 - .01)}"/><text x="${tx}" y="${ty - (shut ? 6 : 0)}">${name}</text>` + (shut ? `<text x="${tx}" y="${ty + 10}" style="font-size:11px">${rtl ? 'סגור' : 'closed'}</text>` : '');
      if (!shut) { const act = () => { day = day === i ? -1 : i; buildRosette(); compose(); pulse(i, 'days'); }; g.addEventListener('click', act); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } }); }
      days.appendChild(g);
    }
    if (!halo.childElementCount) { let h = ''; for (let k = 0; k < 72; k++) { h += `<rect x="-4" y="-209" width="8" height="8" rx="1.5" transform="rotate(${k * 5})"/>`; } halo.innerHTML = h; }
    $('[data-core-n]', ros).textContent = cnt.reduce((a, b) => a + b, 0);
  }
  function pulse(i, ring) {
    if (still() || !Element.prototype.animate) return;
    const g = $(`.${ring} .seg:nth-child(${i + 1}) path`, ros); g && g.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.035)' }, { transform: 'scale(1)' }], { duration: 260, easing: 'cubic-bezier(.23,1,.32,1)' });
    $('.core', ros).animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'cubic-bezier(.23,1,.32,1)' });
  }
  function listJoin(items, lastJoin) { return items.length < 2 ? items.join('') : items.slice(0, -1).join(', ') + lastJoin + items[items.length - 1]; }
  function compose() {
    const msg = $('[data-msg]'), send = $('[data-send]'); if (!msg) return;
    let text;
    if (he()) {
      const items = WHO.map((w, i) => cnt[i] ? (w.pl ? w.pl[cnt[i] - 1] : w.he) : null).filter(Boolean).map(x => 'ל' + x);
      const list = items.length < 2 ? items.join('') : items.slice(0, -1).join(', ') + ' ו' + items[items.length - 1];
      text = 'היי מוטי, ' + (items.length ? `אשמח לקבוע תור ${list}` : 'אשמח לקבוע תור') + (day >= 0 ? ` ביום ${DAYS_HE[day]}` : '') + '. מתי נוח לך?';
    } else {
      const items = WHO.map((w, i) => cnt[i] ? (w.plEn ? w.plEn[cnt[i] - 1] : w.en) : null).filter(Boolean);
      text = 'Hi Moti, ' + (items.length ? `I’d like to book for ${listJoin(items, ' and ')}` : 'I’d like to book a visit') + (day >= 0 ? ` on ${DAYS_EN[day]}` : '') + '. When suits you?';
    }
    msg.textContent = text; send.href = `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  }
  $('[data-reset]')?.addEventListener('click', () => { cnt.fill(0); day = -1; buildRosette(); compose(); });

  /* ---------- odometer for the rating ---------- */
  const odos = $$('[data-odo]');
  odos.forEach(o => { const t = +o.dataset.odo; o.querySelector('i').dataset.col = Array.from({ length: t + 1 }, (_, k) => k).join('\n'); });
  function rollOdos(on) { odos.forEach(o => { const t = +o.dataset.odo; o.querySelector('i').style.transform = on ? `translateY(-${t}em)` : 'translateY(0)'; }); }
  new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) rollOdos(true); else if (e.boundingClientRect.top > 0 && !still()) rollOdos(false); }), { threshold: .4 }).observe($('.score'));

  /* ---------- scroll: nav, iris into the rosette, closing photo shrink ---------- */
  const fam = $('[data-iris]'), vis = $('[data-shrink]');
  function onScroll() {
    const y = scrollY;
    nav.classList.toggle('gathered', y > 60);
    const fr = foot.getBoundingClientRect(); dock.classList.toggle('hide', fr.top < innerHeight * .7);
    if (still()) { rollOdos(true); fam.style.removeProperty('--iris'); vis.style.setProperty('--k', 1); return; }
    walkUpdate();
    const r = fam.getBoundingClientRect(), p = clamp((innerHeight - r.top) / (innerHeight * .9));
    fam.style.setProperty('--iris', (8 + ease(p) * 142).toFixed(2) + '%');
    const v = vis.getBoundingClientRect(), k = clamp((innerHeight - v.top) / (innerHeight * .95));
    vis.style.setProperty('--k', ease(k).toFixed(4));
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { sizeMotes(); onScroll(); });

  /* ---------- loops ---------- */
  let tRaf = 0;
  function tick(t) { spotSweep(t); tRaf = requestAnimationFrame(tick); }
  function startLoops() { stopLoops(); sizeMotes(); mRaf = requestAnimationFrame(drawMotes); if (snip) sRaf = requestAnimationFrame(drawSnips); tRaf = requestAnimationFrame(tick); }
  function stopLoops() { cancelAnimationFrame(mRaf); cancelAnimationFrame(sRaf); cancelAnimationFrame(tRaf); mctx.clearRect(0, 0, motes.width, motes.height); if (sctx) sctx.clearRect(0, 0, snip.width, snip.height); S = []; }
  // pause the canvases when the hero is out of view
  new IntersectionObserver(es => es.forEach(e => { if (still()) return; cancelAnimationFrame(mRaf); if (e.isIntersecting) mRaf = requestAnimationFrame(drawMotes); })).observe(hero);

  setLang(R.lang === 'en' ? 'en' : 'he');
  if (!still()) { startLoops(); deal(); } else walkStill(0);
  onScroll();
  setInterval(() => { status(); }, 60000);
})();
