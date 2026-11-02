/* IBD נדל"ן demo — motion, live hours, composer. Plain JS, no dependencies. */
(function(){
'use strict';
var d=document,H=d.documentElement,$=function(s,c){return(c||d).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))};
var PHONE='972502211334';
var en=function(){return H.lang==='en'};
var on=function(){return !H.classList.contains('motion-off')};
var clamp=function(v,a,b){return v<a?a:v>b?b:v},lerp=function(a,b,t){return a+(b-a)*t};
var sm=function(v,a,b){var t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t)};
var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;

/* ---------- language ---------- */
function setLang(l){H.lang=l;H.dir=l==='en'?'ltr':'rtl';try{var u=new URL(location.href);if(l==='en')u.searchParams.set('lang','en');else u.searchParams.delete('lang');history.replaceState(null,'',u)}catch(e){}refreshText()}
$('#lng').addEventListener('click',function(){setLang(en()?'he':'en')});

/* ---------- motion switch (g3) ---------- */
var mot=$('#mot');
function syncMot(){mot.setAttribute('aria-pressed',on()?'true':'false')}
mot.addEventListener('click',function(){H.classList.toggle('motion-off');try{localStorage.setItem('ibd-motion',on()?'on':'off')}catch(e){}syncMot();startStop();sigDraw(true);odoAll()});
syncMot();

/* ---------- hours / live status ---------- */
var HRS=[[9,19],[9,19],[9,19],[9,19],[9,19],[9,13],null];
var DHE=['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'],DEN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var SHE=['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'],SEN=['S','M','T','W','T','F','S'];
function nowIL(){var p={};new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Jerusalem',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date()).forEach(function(x){p[x.type]=x.value});
  return{day:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(p.weekday),h:(+p.hour%24)+(+p.minute)/60}}
function fmt(h){return Math.floor(h)+':'+(h%1?'30':'00')}
function status(){var n=nowIL(),t=HRS[n.day];
  if(t&&n.h>=t[0]&&n.h<t[1])return{open:true,he:'פתוח עכשיו · עד '+fmt(t[1]),en:'Open now · until '+fmt(t[1])};
  for(var k=0;k<8;k++){var dd=(n.day+k)%7,s=HRS[dd];if(!s)continue;if(k===0&&n.h>=s[0])continue;
    var he=k===0?'היום':k===1?'מחר':'ביום '+DHE[dd],e=k===0?'today':k===1?'tomorrow':'on '+DEN[dd];
    return{open:false,he:'סגור עכשיו · נפתח '+he+' ב-'+fmt(s[0]),en:'Closed now · opens '+e+' at '+fmt(s[0])}}
  return{open:false,he:'',en:''}}
function hoursUI(){var n=nowIL(),tb=$('#hours'),wk=$('#week');tb.innerHTML='';wk.innerHTML='';
  for(var i=0;i<7;i++){var t=HRS[i],tr=d.createElement('tr');if(i===n.day)tr.className='today';
    tr.innerHTML='<td>'+(en()?DEN[i]:'יום '+DHE[i])+'</td><td>'+(t?fmt(t[0])+'–'+fmt(t[1]):(en()?'Closed':'סגור'))+'</td>';tb.appendChild(tr)}
  for(i=0;i<7;i++){var c=d.createElement('div'),b=d.createElement('i'),bb=d.createElement('b');t=HRS[i];if(i===n.day)b.className='today';bb.style.height=t?((t[1]-t[0])/10*100)+'%':'0';b.appendChild(bb);c.appendChild(b);var em=d.createElement('em');em.textContent=en()?SEN[i]:SHE[i];c.appendChild(em);c.style.display='grid';c.style.gap='4px';wk.appendChild(c)}
  wk.style.gridTemplateColumns='repeat(7,1fr)';
  var s=status();$('#stxt').textContent=en()?s.en:s.he;$('#sdot').className='dot'+(s.open?' on':'');
  $('#wkTitle').textContent=en()?(s.open?'Open now':'Office hours'):(s.open?'פתוח עכשיו':'שעות המשרד')}

/* ---------- reviews ---------- */
var REV=[
 {n:'אהרון פורמן',ne:'Aharon Forman',he:'פשוט אלופים, שירות, ליווי, יעוץ. הכל ברמה הכי גבוהה ותמיד עם חיוך אין עליכם',en:'Simply champions: service, guidance, advice. Everything at the highest level and always with a smile. You are the best.'},
 {n:'מלוב',ne:'Malov',he:'שירות אדיב וסבלני מאוד. מומלץ בחום!!',en:'Very kind and patient service. Warmly recommended!!'},
 {n:'מוישי מקובצקי',ne:'Moishi Makovetsky',he:'איש נהדר ואמין עם דאגה ואכפתיות עד השלבים האחרונים, תודה רבה',en:'A wonderful, trustworthy man who cares right through to the final stages. Thank you so much.'},
 {n:'Adi Arbili',ne:'Adi Arbili',he:'פנינו לעידן בן דוד שהציע לנו מגוון דירות, הלכנו לראות את הדירות והדירה הראשונה שהראה לנו הייתה התאמה מושלמת עבורנו. … עידן בעל לב זהב, אדיב ודואג ללקוחותיו.',en:'We turned to Idan Ben David, who offered us a range of apartments; we went to see them and the first one he showed us was a perfect match for us. … Idan has a heart of gold, kind and caring toward his clients.'},
 {n:'שירה אוחיון',ne:'Shira Ohayon',he:'עידן היקר סייע לנו במכירת הנכס שלנו במהירות וביעילות. הוא הפגין ידע ומקצועיות יוצאי דופן לאורך כל התהליך, החל מהערכת שווי הנכס ועד לחתימה על החוזה. …',en:'Dear Idan helped us sell our property quickly and efficiently. He showed exceptional knowledge and professionalism throughout the process, from valuing the property to signing the contract. …'}];
function revCard(r){var a=d.createElement('article');a.className='rv';
  a.innerHTML='<span class="stars" role="img" aria-label="5/5"></span><p style="margin-top:8px">'+(en()?r.en:r.he)+'</p><footer><b style="font-weight:500;color:var(--ink)">'+(en()?r.ne:r.n)+'</b><span class="tr">'+(en()?'Google · translated from Hebrew':'ביקורת בגוגל')+'</span></footer>';return a}
function buildRevs(){var r1=$('#row1'),r2=$('#row2');r1.innerHTML='';r2.innerHTML='';
  [0,1,2,0,1,2].forEach(function(i){r1.appendChild(revCard(REV[i]))});[3,4,3,4].forEach(function(i){r2.appendChild(revCard(REV[i]))})}

/* ---------- composer: open a file ---------- */
var C={k:'buy',n:3,m:'take'};
function roomsPhrase(e){var n=C.n;if(e)return n===1?'one-room apartment':n===5?'5+ room apartment':n+'-room apartment';return n===1?'דירת חדר':n===5?'דירה של 5 חדרים ומעלה':'דירת '+n+' חדרים'}
function compose(){var a=$('#area').value.trim(),e=en(),hi=e?'Hi Idan, I found you through the website. ':'שלום עידן, הגעתי דרך האתר. ',at=a?(e?' in '+a:' באזור '+a):'',t;
  if(C.k==='buy')t=e?'We are looking to buy a '+roomsPhrase(1)+at+'. I would be glad to talk.':'אנחנו מחפשים לקנות '+roomsPhrase()+at+'. אשמח לשיחה.';
  else if(C.k==='sell')t=e?'We have a '+roomsPhrase(1)+' to sell'+at+', and would like a valuation and a talk.':'יש לנו '+roomsPhrase()+' למכירה'+at+', ונשמח להערכת שווי ולשיחה.';
  else if(C.k==='mort')t=e?'We would like advice on '+(C.m==='take'?'taking out a mortgage':'refinancing our mortgage')+at+'. When can we talk?':'נשמח לייעוץ על '+(C.m==='take'?'לקיחת משכנתא':'מחזור משכנתא')+(a?', הנכס באזור '+a:'')+'. מתי אפשר לדבר?';
  else t=e?'We are interested in an investment property'+at+'. I would be glad to talk.':'אנחנו מתעניינים בנכס להשקעה'+at+'. אשמח לשיחה.';
  var m=hi+t;$('#msg').textContent=m;$('#send').href='https://wa.me/'+PHONE+'?text='+encodeURIComponent(m)}
$$('#tabs button').forEach(function(b){b.addEventListener('click',function(){C.k=b.dataset.k;$$('#tabs button').forEach(function(x){x.setAttribute('aria-selected',x===b?'true':'false')});
  $('#roomsBox').hidden=!(C.k==='buy'||C.k==='sell');$('#mortBox').hidden=C.k!=='mort';compose()})});
function litRooms(){$$('#rooms button').forEach(function(b){b.classList.toggle('lit',+b.dataset.n<=C.n);b.setAttribute('aria-pressed',+b.dataset.n===C.n?'true':'false')})}
$$('#rooms button').forEach(function(b){b.addEventListener('click',function(){C.n=+b.dataset.n;litRooms();compose()})});
$$('#mseg button').forEach(function(b){b.addEventListener('click',function(){C.m=b.dataset.m;$$('#mseg button').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});compose()})});
$('#area').addEventListener('input',compose);litRooms();

function refreshText(){hoursUI();buildRevs();compose();$('#area').placeholder=en()?'e.g. Givat Alonim':'למשל גבעת אלונים';stepText();sigLabels()}

/* ---------- odometers ---------- */
function odoBuild(el){var v=el.dataset.v;if(!el.firstChild){v.split('').forEach(function(ch){var s=d.createElement('span');if(/\d/.test(ch)){var c=d.createElement('span');c.className='col';s.appendChild(c);s.dataset.d=ch}else s.className='pt';el.appendChild(s)})}}
function odo(el,instant){odoBuild(el);$$('span[data-d]',el).forEach(function(s){var c=s.firstChild;if(instant||!on())c.style.transition='none';c.style.transform='translateY(-'+(+s.dataset.d)+'em)';if(instant||!on())requestAnimationFrame(function(){c.style.transition=''})})}
function odoAll(instant){$$('.odo').forEach(function(o){if(o.dataset.seen||instant||!on())odo(o,instant||!on())})}
$$('.odo').forEach(function(o){var s=o.dataset.v;o.setAttribute('aria-label',s);o.setAttribute('role','img');o.innerHTML='';});
$$('.odo').forEach(function(o){o.dataset.v=o.getAttribute('aria-label');odoBuild(o)});

/* ---------- reveal on enter ---------- */
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var t=e.target;
  if(t.classList.contains('rv-in')){var sib=$$('.rv-in',t.parentNode),k=sib.indexOf(t);t.style.transitionDelay=(Math.max(0,k)%6*70)+'ms';t.classList.add('vis')}
  if(t.classList.contains('odo')){t.dataset.seen=1;odo(t)}
  if(t.id==='t1945')setTimeout(function(){t.classList.add('warm')},500);
  if(t.classList.contains('sv'))t.classList.add('in');
  if(t.id==='bigIbd')t.classList.add('up');
  io.unobserve(t)})},{rootMargin:'0px 0px -12% 0px'});
$$('.rv-in,.odo,#t1945,.sv,#bigIbd').forEach(function(x){io.observe(x)});
setTimeout(function(){$$('.rv-in').forEach(function(x){var r=x.getBoundingClientRect();if(r.top<innerHeight)x.classList.add('vis')})},50);

/* ---------- hero: headline seam, photo deal, depth ---------- */
function heroIntro(){var lns=$$('#h1 .ln>span:not([hidden])');
  if(!on())return;
  $$('#h1 .ln').forEach(function(l,i){$$(':scope>span',l).forEach(function(s){s.animate([{transform:'translateY('+(i?'-':'')+'105%)'},{transform:'none'}],{duration:760,delay:60+i*90,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'})})});
  var bg=$('#heroBg'),cards=$$('#deal img'),W=innerWidth,Hh=$('#hero').offsetHeight;
  var cw=Math.min(300,W*.52),ch=cw*4/3,cx=W/2,cy=Hh*.44;
  var x0=(cx-cw/2)/W*100,y0=(cy-ch/2)/Hh*100,x1=100-(cx+cw/2)/W*100,y1=100-(cy+ch/2)/Hh*100;
  bg.animate([{clipPath:'inset('+y0+'% '+x1+'% '+y1+'% '+x0+'% round 18px)'},{clipPath:'inset('+y0+'% '+x1+'% '+y1+'% '+x0+'% round 18px)',offset:.55},{clipPath:'inset(0% 0% 0% 0% round 0px)'}],{duration:1500,easing:'cubic-bezier(.65,0,.35,1)',fill:'backwards'});
  cards.slice(0,4).forEach(function(c,i){var a=(i-1.5)*9,fx=(i%2?1:-1)*(W*.45),fy=(i<2?-1:1)*Hh*.3;
    c.animate([{opacity:0,transform:'translate(calc(-50% + '+fx+'px),calc(-50% + '+fy+'px)) rotate('+(a*3)+'deg)'},{opacity:1,transform:'translate(-50%,-50%) rotate('+a+'deg)',offset:.45},{opacity:1,transform:'translate(-50%,-50%) rotate('+a+'deg)',offset:.7},{opacity:0,transform:'translate(-50%,-50%) rotate('+a+'deg) scale(1.15)'}],{duration:1500,delay:i*70,easing:'cubic-bezier(.23,1,.32,1)'})});
  setTimeout(function(){$('#deal').remove()},1800)}

/* tiny wireframe cubes (the logo's cube) drifting over the hero */
var cv=$('#cubes'),cx2=cv.getContext('2d'),parts=[],mx=-999,my=-999,heroVis=true;
function initParts(){var w=cv.width=cv.offsetWidth*devicePixelRatio,h=cv.height=cv.offsetHeight*devicePixelRatio,n=innerWidth<700?20:40;parts=[];
  for(var i=0;i<n;i++)parts.push({x:Math.random()*w,y:Math.random()*h,s:(6+Math.random()*12)*devicePixelRatio,r:Math.random()*6,vr:(Math.random()-.5)*.01,vy:-(.15+Math.random()*.35)*devicePixelRatio,a:.18+Math.random()*.32,ox:0,oy:0})}
function cubePts(s,r){var c=Math.cos(r),sn=Math.sin(r),pts=[];[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].forEach(function(p){var x=p[0]*c-p[1]*sn,y=p[0]*sn+p[1]*c;pts.push([x*s*.5,y*s*.29-p[2]*s*.55])});return pts}
var E=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
function drawParts(){var w=cv.width,h=cv.height;cx2.clearRect(0,0,w,h);cx2.lineWidth=1*devicePixelRatio;
  parts.forEach(function(p){p.y+=p.vy;p.r+=p.vr;if(p.y<-30)p.y=h+30;
    var dx=p.x-mx*devicePixelRatio,dy=p.y-my*devicePixelRatio,dd=Math.hypot(dx,dy),R=140*devicePixelRatio;
    if(dd<R){p.ox+=dx/dd*(R-dd)*.04;p.oy+=dy/dd*(R-dd)*.04}p.ox*=.94;p.oy*=.94;
    var pts=cubePts(p.s,p.r);cx2.strokeStyle='rgba(190,208,255,'+p.a+')';cx2.beginPath();
    E.forEach(function(e){cx2.moveTo(p.x+p.ox+pts[e[0]][0],p.y+p.oy+pts[e[0]][1]);cx2.lineTo(p.x+p.ox+pts[e[1]][0],p.y+p.oy+pts[e[1]][1])});cx2.stroke()})}
$('#hero').addEventListener('pointermove',function(e){var r=cv.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;if(fine&&on()){var bg=$('#heroBg');bg.style.transform='translate('+((e.clientX/innerWidth-.5)*-18)+'px,'+((e.clientY/innerHeight-.5)*-12)+'px) scale(1.02)'}});
$('#hero').addEventListener('pointerleave',function(){mx=my=-999});

/* arc of photo cards */
var ring=$('#ring'),cardsA=$$('#ring .card'),ang=0,drag=null,lastSY=scrollY;
function placeArc(){var cw=cardsA[0].offsetWidth,R=cw*1.9;cardsA.forEach(function(c,i){var a=i*360/cardsA.length+ang,rad=a*Math.PI/180,f=(Math.cos(rad)+1)/2;
  c.style.transform='rotateY('+a+'deg) translateZ('+R+'px)';c.style.opacity=(.25+.75*f).toFixed(2);c.style.zIndex=Math.round(f*10)});
  ring.style.transform='translateZ(-'+(R*.9)+'px) rotateX(-6deg)'}
var arc=$('#arc');
arc.addEventListener('pointerdown',function(e){if(!on())return;drag={x:e.clientX,a:ang}});
addEventListener('pointerup',function(){drag=null});
arc.addEventListener('pointermove',function(e){if(drag){ang=drag.a+(e.clientX-drag.x)*.25}});

/* ---------- signature: the logo cube opens into a floor plan, ends at a key ---------- */
var pc=$('#plan'),px=pc.getContext('2d'),stage=$('#stage'),sig=$('#path'),keyshot=$('#keyshot'),lbls=$('#lbls'),offStep=0,sigP=0;
var WALLS=[[6,0,6,2.6],[6,3.6,6,6],[6,4,10,4],[0,6,2,6],[3,6,7.5,6],[8.5,6,10,6],[5,6,5,10]];
var OUT=[[0,0,10,0],[10,0,10,10],[10,10,3.2,10],[1.6,10,0,10],[0,10,0,0]];
var ROOMS=[{r:[0,0,6,6],he:'סלון',en:'Living room'},{r:[6,0,10,4],he:'מטבח',en:'Kitchen'},{r:[6,4,10,6],he:'מקלחת',en:'Bathroom'},{r:[5,6,10,10],he:'חדר שינה',en:'Bedroom'},{r:[0,6,5,10],he:'חדר',en:'Room'}];
var DOOR=[2.4,10];
ROOMS.forEach(function(){var s=d.createElement('span');s.className='room-lbl';lbls.appendChild(s)});
function sigLabels(){$$('.room-lbl').forEach(function(s,i){s.textContent=en()?ROOMS[i].en:ROOMS[i].he})}
var STEP_D={he:['מסתכלים על הנכס מכל צד.','דירות לפי מה שאתם מחפשים.','ליווי מול הבנקים ומול הצד השני.','ליווי אישי עד קבלת המפתח.'],en:['Looking at the property from every side.','Homes that fit what you are looking for.','Guidance with the banks and with the other side.','Personal guidance until you get the keys.']};
var curStep=-1;
function stepText(){$('#mobd').textContent=STEP_D[en()?'en':'he'][Math.max(0,curStep)]}
function setStep(s){if(s===curStep)return;curStep=s;$$('#steps li').forEach(function(li,i){li.classList.toggle('on',i===s)});stepText()}
function sigDraw(force){var w=stage.clientWidth,h=stage.clientHeight,dpr=Math.min(devicePixelRatio,2);if(pc.width!==Math.round(w*dpr)||force){pc.width=Math.round(w*dpr);pc.height=Math.round(h*dpr)}
  var P=on()?sigP:[0.1,0.42,0.7,1][offStep],t=on()?performance.now()/1000:0;
  setStep(P<.26?0:P<.5?1:P<.78?2:3);
  var a=sm(P,.16,.5),yaw=lerp(.785+P*3.2+Math.sin(t*.4)*.18,0,a),pitch=lerp(.62,Math.PI/2-.0001,sm(P,.24,.56));
  var Hw=lerp(10,.7,sm(P,.26,.58)),lift=sm(P,.14,.34)*9,lidA=1-sm(P,.18,.36),ih=sm(P,.3,.44)*lerp(3.6,.5,sm(P,.46,.6));
  var zoom=1+sm(P,.8,.98)*1.6,sc=Math.min(w,h)/(19.5)*zoom,cs=Math.cos(yaw),sn=Math.sin(yaw),sp=Math.sin(pitch),cp=Math.cos(pitch);
  var ox=w/2,oy=h/2+Hw*cp*sc*.42;
  function pr(x,y,z){x-=5;y-=5;var rx=x*cs-y*sn,ry=x*sn+y*cs;return[ox+rx*sc,oy+(ry*sp-z*cp)*sc]}
  if(zoom>1){var dp=pr(DOOR[0],DOOR[1],0),k=sm(P,.8,.98);ox+=(w/2-dp[0])*k;oy+=(h*.62-dp[1])*k}
  px.setTransform(dpr,0,0,dpr,0,0);px.clearRect(0,0,w,h);px.lineJoin='round';px.lineCap='round';
  /* floor + room fills */
  var fl=[pr(0,0,0),pr(10,0,0),pr(10,10,0),pr(0,10,0)];px.fillStyle='rgba(58,108,240,'+(.05+.07*sm(P,.4,.6))+')';px.beginPath();fl.forEach(function(p,i){i?px.lineTo(p[0],p[1]):px.moveTo(p[0],p[1])});px.closePath();px.fill();
  var lamp=sm(P,.72,.84);
  ROOMS.forEach(function(R,i){var f=sm(P,.55+i*.035,.61+i*.035),r=R.r,q=[pr(r[0]+.15,r[1]+.15,0),pr(r[2]-.15,r[1]+.15,0),pr(r[2]-.15,r[3]-.15,0),pr(r[0]+.15,r[3]-.15,0)];
    if(f>0){px.fillStyle='rgba(58,108,240,'+(.3*f)+')';px.beginPath();q.forEach(function(p,j){j?px.lineTo(p[0],p[1]):px.moveTo(p[0],p[1])});px.closePath();px.fill()}
    if(lamp>0){var c=pr((r[0]+r[2])/2,(r[1]+r[3])/2,0),rad=Math.min(r[2]-r[0],r[3]-r[1])*sc*.7,g=px.createRadialGradient(c[0],c[1],0,c[0],c[1],rad);g.addColorStop(0,'rgba(242,212,155,'+(.4*lamp)+')');g.addColorStop(1,'rgba(242,212,155,0)');px.fillStyle=g;px.beginPath();px.arc(c[0],c[1],rad,0,7);px.fill()}
    var lb=lbls.children[i],cc=pr((r[0]+r[2])/2,(r[1]+r[3])/2,0);lb.style.left=cc[0]+'px';lb.style.top=cc[1]+'px';lb.style.opacity=(f*(1-sm(P,.84,.92))).toFixed(2)});
  function wall(s,hh,col,lw){var a0=pr(s[0],s[1],0),a1=pr(s[2],s[3],0),b0=pr(s[0],s[1],hh),b1=pr(s[2],s[3],hh);
    if(hh>.05){px.fillStyle='rgba(20,30,52,.55)';px.beginPath();px.moveTo(a0[0],a0[1]);px.lineTo(a1[0],a1[1]);px.lineTo(b1[0],b1[1]);px.lineTo(b0[0],b0[1]);px.closePath();px.fill()}
    px.strokeStyle=col;px.lineWidth=lw;px.beginPath();px.moveTo(a0[0],a0[1]);px.lineTo(a1[0],a1[1]);if(hh>.05){px.moveTo(b0[0],b0[1]);px.lineTo(b1[0],b1[1]);px.moveTo(a0[0],a0[1]);px.lineTo(b0[0],b0[1]);px.moveTo(a1[0],a1[1]);px.lineTo(b1[0],b1[1])}px.stroke()}
  /* draw far walls first so the near ones overlap them */
  var segs=OUT.map(function(s){return{s:s,h:Hw,c:'rgba(238,241,246,.92)',lw:1.8}}).concat(WALLS.map(function(s){return{s:s,h:ih,c:'rgba(157,182,255,.85)',lw:1.4}}));
  segs.forEach(function(o){var m=pr((o.s[0]+o.s[2])/2,(o.s[1]+o.s[3])/2,0);o.k=m[1]});segs.sort(function(a,b){return a.k-b.k});
  segs.forEach(function(o){wall(o.s,o.h,o.c,o.lw)});
  /* lid of the cube: the logo's top face with its inner diamond */
  if(lidA>0){var z=Hw+lift,L=[pr(0,0,z),pr(10,0,z),pr(10,10,z),pr(0,10,z)],M=[pr(5,0,z),pr(10,5,z),pr(5,10,z),pr(0,5,z)];
    px.strokeStyle='rgba(238,241,246,'+(.92*lidA)+')';px.lineWidth=1.8;px.beginPath();L.forEach(function(p,i){i?px.lineTo(p[0],p[1]):px.moveTo(p[0],p[1])});px.closePath();px.stroke();
    px.strokeStyle='rgba(157,182,255,'+(.7*lidA)+')';px.lineWidth=1.2;px.beginPath();M.forEach(function(p,i){i?px.lineTo(p[0],p[1]):px.moveTo(p[0],p[1])});px.closePath();px.stroke();
    if(lift>.05){px.setLineDash([3,5]);px.strokeStyle='rgba(238,241,246,'+(.3*lidA)+')';px.beginPath();[[0,0],[10,0],[10,10],[0,10]].forEach(function(c){var p0=pr(c[0],c[1],Hw),p1=pr(c[0],c[1],z);px.moveTo(p0[0],p0[1]);px.lineTo(p1[0],p1[1])});px.stroke();px.setLineDash([])}}
  /* dimension marks once the plan is flat */
  var dm=sm(P,.58,.7)*(1-sm(P,.84,.92));if(dm>0){var A=pr(0,-.9,0),B=pr(10,-.9,0),C2=pr(10.9,0,0),D=pr(10.9,10,0);px.strokeStyle='rgba(185,193,207,'+(.7*dm)+')';px.lineWidth=1;px.beginPath();
    px.moveTo(A[0],A[1]);px.lineTo(lerp(A[0],B[0],dm),lerp(A[1],B[1],dm));px.moveTo(C2[0],C2[1]);px.lineTo(lerp(C2[0],D[0],dm),lerp(C2[1],D[1],dm));
    [A,B].forEach(function(p){px.moveTo(p[0],p[1]-5);px.lineTo(p[0],p[1]+5)});[C2,D].forEach(function(p){px.moveTo(p[0]-5,p[1]);px.lineTo(p[0]+5,p[1])});px.stroke()}
  /* the door swing, then the real key photo opens out of the doorway */
  var dsw=sm(P,.62,.76);if(dsw>0){var hinge=pr(1.6,10,0),rr=1.6*sc;px.strokeStyle='rgba(242,212,155,'+(.9*dsw)+')';px.lineWidth=1.4;px.beginPath();px.arc(hinge[0],hinge[1],rr,0,-Math.PI/2*dsw,true);px.stroke();px.beginPath();px.moveTo(hinge[0],hinge[1]);px.lineTo(hinge[0]+rr*Math.cos(-Math.PI/2*dsw),hinge[1]+rr*Math.sin(-Math.PI/2*dsw));px.stroke()}
  var kp=sm(P,.84,.99),dpp=pr(DOOR[0],DOOR[1],0);keyshot.style.clipPath='circle('+(kp*150).toFixed(2)+'% at '+(dpp[0]/w*100).toFixed(1)+'% '+(dpp[1]/h*100).toFixed(1)+'%)';
  keyshot.firstElementChild.style.transform='scale('+(1.25-.2*kp).toFixed(3)+')'}
$('#sPrev').addEventListener('click',function(){offStep=(offStep+3)%4;sigDraw()});
$('#sNext').addEventListener('click',function(){offStep=(offStep+1)%4;sigDraw()});
$$('#steps li').forEach(function(li,i){li.addEventListener('click',function(){if(!on()){offStep=i;sigDraw()}})});

/* ---------- services stack, investment cubes ---------- */
(function(){var g='',col=['#9db6ff','#eef1f6','#3a6cf0'];for(var i=0;i<3;i++){var x=130+i*70,y=200-i*58,s=46+i*8;
  g+='<g style="transform-origin:'+x+'px '+y+'px;animation:rise'+' 3.6s cubic-bezier(.23,1,.32,1) '+(i*.35)+'s infinite alternate"><path fill="none" stroke="'+col[i]+'" stroke-width="1.6" stroke-linejoin="round" d="M'+x+' '+(y-s)+'l'+s+' '+(s*.55)+'v'+s+'l-'+s+' '+(s*.55)+'l-'+s+' -'+(s*.55)+'v-'+s+'z M'+(x-s)+' '+(y-s*.45)+'l'+s+' '+(s*.55)+'l'+s+' -'+(s*.55)+' M'+x+' '+(y+s*.1)+'v'+s+'"/></g>'}
  var st=d.createElement('style');st.textContent='@keyframes rise{from{transform:translateY(14px);opacity:.55}to{transform:none;opacity:1}}.motion-off #invCubes g{animation:none!important}';d.head.appendChild(st);$('#invCubes').innerHTML=g})();
var svs=$$('.sv');
function stackFx(){for(var i=0;i<svs.length-1;i++){var a=svs[i].getBoundingClientRect(),b=svs[i+1].getBoundingClientRect(),k=clamp((a.bottom-b.top)/a.height,0,1);
  svs[i].style.transform=on()?'scale('+(1-.06*k).toFixed(3)+')':'';svs[i].firstElementChild.style.opacity=on()?(1-.6*k).toFixed(2):''}}

/* bento spotlight, portrait light */
var bento=$('#bento');bento.addEventListener('pointermove',function(e){$$('.tile',bento).forEach(function(t){var r=t.getBoundingClientRect();t.style.setProperty('--mx',(e.clientX-r.left)+'px');t.style.setProperty('--my',(e.clientY-r.top)+'px')})});
var por=$('#portrait');
if(fine)por.addEventListener('pointermove',function(e){if(!on())return;var r=por.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;por.style.transform='perspective(900px) rotateY('+((x-.5)*6)+'deg) rotateX('+((.5-y)*5)+'deg)';por.style.setProperty('--lx',x*100+'%');por.style.setProperty('--ly',y*100+'%')});
por.addEventListener('pointerleave',function(){por.style.transform=''});

/* ---------- scroll-driven pieces ---------- */
var nav=$('#nav'),keytag=$('#keytag'),closeS=$('#close'),closePh=$('#closePh'),row1=$('#row1'),row2=$('#row2'),revS=$('#reviews'),revHover=false;
revS.addEventListener('pointerenter',function(){revHover=true});revS.addEventListener('pointerleave',function(){revHover=false});
function onScroll(){var y=scrollY,vh=innerHeight;
  nav.classList.toggle('pill',y>60);keytag.classList.toggle('show',y>vh*.6);
  var r=sig.getBoundingClientRect();sigP=on()?clamp(-r.top/(r.height-vh),0,1):sigP;
  if(on()){var c=closeS.getBoundingClientRect(),q=clamp(-c.top/(c.height-vh),0,1),e=sm(q,0,1);
    closePh.style.clipPath='inset('+(e*12)+'% '+(e*(innerWidth<700?5:14))+'% '+(e*12)+'% '+(e*(innerWidth<700?5:14))+'% round '+(e*28)+'px)'}else closePh.style.clipPath='';
  stackFx()}
addEventListener('scroll',onScroll,{passive:true});

/* ---------- one animation loop, running only when needed ---------- */
var raf=0,last=performance.now(),rx1=0,sigVis=false,revVis=false;
var vo=new IntersectionObserver(function(es){es.forEach(function(e){if(e.target.id==='hero')heroVis=e.isIntersecting;if(e.target.id==='path')sigVis=e.isIntersecting;if(e.target.id==='reviews')revVis=e.isIntersecting})});
['#hero','#path','#reviews'].forEach(function(s){vo.observe($(s))});
function loop(now){var dt=Math.min(.05,(now-last)/1000);last=now;
  if(heroVis){drawParts();if(!drag)ang+=dt*7+(lastSY-scrollY)*-.04;lastSY=scrollY;placeArc()}
  if(sigVis)sigDraw();
  if(revVis&&!revHover){rx1+=dt*28;var h1=row1.scrollWidth/2,h2=row2.scrollWidth/2;row1.style.transform='translateX('+(-(rx1%h1))+'px)';row2.style.transform='translateX('+(-(h2-(rx1*.8%h2)))+'px)'}
  raf=requestAnimationFrame(loop)}
function startStop(){cancelAnimationFrame(raf);raf=0;
  if(on()){initParts();last=performance.now();raf=requestAnimationFrame(loop)}
  else{cx2.clearRect(0,0,cv.width,cv.height);cardsA.forEach(function(c){c.style.transform='';c.style.opacity=''});ring.style.transform='';$('#heroBg').style.transform='';row1.style.transform=row2.style.transform='';sigDraw(true)}
  onScroll()}
addEventListener('resize',function(){if(on())initParts();sigDraw(true);onScroll()});

refreshText();startStop();heroIntro();sigDraw(true);
})();
