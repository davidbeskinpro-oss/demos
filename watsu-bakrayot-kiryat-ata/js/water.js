/* Her pool, alive: the real photo rendered through a small WebGL water shader.
   Ripples where you touch or point, light dappling on the water, and a level that rises
   with the scroll until the whole view is under water (caustics, refraction, rising bubbles).
   Never loaded work when animations are off: the script returns before creating a context. */
(function () {
  var root = document.documentElement;
  var cv = document.querySelector('[data-water]');
  window.__water = { ready: false, level: 0, ripple: function () {}, render: function () {} };
  if (!cv || root.classList.contains('still')) return;
  var gl = cv.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: /still=render/.test(location.search) });
  if (!gl) return;

  var VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision highp float;',
    'uniform sampler2D T;uniform vec2 R;uniform vec2 I;uniform float t;uniform float L;uniform float W;uniform float F;',
    'uniform vec4 rp[6];varying vec2 v;',
    // cover-fit the photo, keeping focus F (0..1 from top) in view
    'vec2 cover(vec2 uv){float ra=R.x/R.y,ia=I.x/I.y;vec2 s=ra>ia?vec2(1.,ia/ra):vec2(ra/ia,1.);vec2 c=vec2(.5,1.-F);',
    ' vec2 o=c-s*.5;o=clamp(o,vec2(0.),vec2(1.)-s);return o+uv*s;}',
    // tileable water caustics (iterative), returns 0..1 bright lines
    'float caustic(vec2 uv,float time){vec2 p=mod(uv*6.2831,6.2831)-250.;vec2 i=p;float c=1.;float inten=.005;',
    ' for(int n=0;n<4;n++){float tt=time*(1.-(3.5/float(n+1)));i=p+vec2(cos(tt-i.x)+sin(tt+i.y),sin(tt-i.y)+cos(tt+i.x));',
    '  c+=1./length(vec2(p.x/(sin(i.x+tt)/inten),p.y/(cos(i.y+tt)/inten)));}',
    ' c/=4.;c=1.17-pow(c,1.4);return clamp(pow(abs(c),8.),0.,1.);}',
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'void main(){vec2 uv=v;float asp=R.x/R.y;',
    // touch ripples: rings travelling outward, squashed by perspective on the pool surface
    ' vec2 d=vec2(0.);float glint=0.;',
    ' for(int k=0;k<6;k++){vec4 r=rp[k];float age=t-r.z;if(age<0.||age>5.)continue;',
    '  vec2 dv=uv-r.xy;dv.x*=asp;dv.y*=1.9;float dist=length(dv);float fr=age*.17;',
    '  float env=exp(-pow((dist-fr)*14.,2.))*exp(-age*.75)*r.w;float w=sin((dist-fr)*90.)*env;',
    '  d+=normalize(dv+1e-5)*w*.010;glint+=max(w,0.)*.5;}',
    ' vec2 iu=cover(uv);',
    ' float surf=smoothstep(1.-W+.015,1.-W-.03,iu.y);',
    ' float persp=clamp((1.-W-iu.y)/(1.-W),0.,1.);',
    ' vec2 amb=vec2(sin(iu.y*(40.+140.*(1.-persp))+t*1.2)*.6+sin(iu.x*21.+t*.6)*.4,cos(iu.x*29.-t*.9))*.0022*(.25+persp);',
    // the water level, a moving meniscus line with a small double wave
    ' float line=L*1.12-.06+sin(uv.x*7.+t*1.5)*.012+sin(uv.x*19.-t*2.2)*.005;',
    ' float under=smoothstep(line+.004,line-.004,uv.y);',
    ' vec2 uw=vec2(sin(uv.y*18.+t*1.3)+sin(uv.y*7.-t*.7),cos(uv.x*16.+t*1.)+cos(uv.x*5.+t*.5))*.0045;',
    ' vec2 off=d+amb*surf*(1.-under)+(uw+d*1.4)*under;',
    ' vec3 col=texture2D(T,cover(uv+off)).rgb;',
    ' vec3 col2=texture2D(T,cover(uv+off*1.8+vec2(.003,0.))).rgb;',
    ' float cz=caustic(uv*vec2(asp,1.)*1.15+vec2(t*.01,t*.015),t*.33);',
    // above: warm the photo, light dapples on its water, glints on ripple crests
    ' vec3 top=col*vec3(1.02,.97,.92)*.9;',
    ' top+=vec3(1.,.92,.78)*cz*.16*surf*(.35+persp);',
    ' top+=vec3(1.,.95,.86)*glint*surf*.6;',
    // under: refracted, blurred, tinted teal-warm, caustic light from above, bubbles
    ' vec3 b=mix(col,col2,.5);',
    ' vec3 deep=vec3(.035,.14,.15);',
    ' float depth=clamp((line-uv.y)/max(line,.2),0.,1.);',
    ' vec3 uc=mix(b*vec3(.5,.82,.86),deep,.42+depth*.3);',
    ' uc+=vec3(.98,.9,.74)*cz*(.5-depth*.28);',
    ' vec2 bp=vec2(uv.x*asp,uv.y)*16.;bp.y-=t*1.1;vec2 cell=floor(bp);float rnd=h(cell);vec2 fp=fract(bp)-.5;',
    ' fp-=(vec2(h(cell+1.3),h(cell+7.1))-.5)*.55;fp.x+=sin(t*2.+rnd*6.)*.07;float rr=.04+.07*h(cell+3.);float dd=length(fp);',
    ' float br=step(.88,rnd)*(smoothstep(rr,rr*.55,dd)*.28+smoothstep(rr*.35,0.,length(fp-vec2(-rr*.35,rr*.35)))*.9);',
    ' uc+=vec3(.9,1.,1.)*br*.55*under;',
    ' col=mix(top,uc,under);',
    ' float m=exp(-pow((uv.y-line)*R.y*.22,2.));col+=vec3(1.,.95,.86)*m*.6*step(.002,L)*step(L,.98);',
    ' col*=1.-.25*smoothstep(.55,1.2,length((uv-.5)*vec2(asp,1.)));',
    ' gl_FragColor=vec4(col,1.);}'
  ].join('\n');

  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; }
  var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;
  var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var pl = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(pl); gl.vertexAttribPointer(pl, 2, gl.FLOAT, false, 0, 0);
  var U = {}; ['T', 'R', 'I', 't', 'L', 'W', 'F', 'rp'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
  gl.uniform1f(U.W, .43); // the photo's water starts 43% down from its top edge
  var rip = new Float32Array(24), ri = 0, t0 = performance.now(), level = 0, raf = 0, vis = true, img = new Image();

  function now() { return (performance.now() - t0) / 1000; }
  function ripple(x, y, s) { rip.set([x, y, now(), s || 1], (ri % 6) * 4); ri++; kick(); }
  function size() {
    var dpr = Math.min(window.devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 1.25);
    var w = Math.round(cv.clientWidth * dpr), hh = Math.round(cv.clientHeight * dpr);
    if (cv.width !== w || cv.height !== hh) { cv.width = w; cv.height = hh; gl.viewport(0, 0, w, hh); }
    gl.uniform1f(U.F, innerWidth > innerHeight ? .42 : .6);
  }
  function draw() {
    size();
    gl.uniform2f(U.R, cv.width, cv.height); gl.uniform1f(U.t, now()); gl.uniform1f(U.L, level); gl.uniform4fv(U.rp, rip);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  function loop() { raf = 0; if (!vis || root.classList.contains('still')) return; draw(); raf = requestAnimationFrame(loop); }
  function kick() { if (!raf && vis && window.__water.ready) raf = requestAnimationFrame(loop); }

  img.onload = function () {
    var tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(U.T, 0); gl.uniform2f(U.I, img.naturalWidth, img.naturalHeight);
    window.__water.ready = true; draw(); cv.classList.add('on'); kick();
    document.dispatchEvent(new Event('water-ready'));
  };
  img.src = cv.dataset.src;

  new IntersectionObserver(function (e) { vis = e[0].isIntersecting; kick(); }).observe(cv);
  // touch or point at the water
  var stage = cv.closest('.stage'), last = 0;
  stage.addEventListener('pointerdown', function (e) { var r = cv.getBoundingClientRect(); ripple((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height, 1.2); });
  stage.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return; var n = performance.now(); if (n - last < 260) return; last = n;
    var r = cv.getBoundingClientRect(); ripple((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height, .55);
  });
  // a slow rhythm of drops on the pool so it is alive on phones too
  setInterval(function () { if (vis && !root.classList.contains('still') && level < .5) ripple(.2 + Math.random() * .6, .1 + Math.random() * .32, .8); }, 2600);

  window.__water.ripple = ripple;
  window.__water.setLevel = function (l) { level = l; kick(); };
  window.__water.render = function (l, tt) { level = l; if (tt != null) t0 = performance.now() - tt * 1000; draw(); };
  addEventListener('resize', kick);
})();
