/* FROST LINE — the signature transition, loaded only when motion is on.
   Every seam between two sections is a cold line. As a seam rises from the bottom of the screen, frost feathers
   grow out of it, up into the section you are leaving and down into the one arriving: the main needles first,
   side branches at 60° (ice is hexagonal), twigs off those, then a thin rime fills the gaps nearest the line.
   Past the middle of the screen the seam defrosts: the thinnest tips go first, the roots on the line last, each
   melted feather leaves a wet streak with a few beads that dry off. Everything is a pure function of where the
   seam is, so scrolling back runs it backwards (re-freezing) and every pass plays it again.
   How: one fixed WebGL canvas over the page. At layout a 2D canvas draws the feathers once into a "time map"
   (red = when the frost reaches that pixel, green = how thick it is there). On scroll only a few numbers per
   seam change and the GPU thresholds the map; the main thread does almost nothing. */
(function () {
  var root = document.documentElement;
  var cv = document.createElement('canvas');
  cv.className = 'frost'; cv.setAttribute('aria-hidden', 'true');
  var gl = null;
  try { gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false }); } catch (e) {}
  var noop = function () {};
  if (!gl) { window.__frost = { start: noop, stop: noop, layout: noop }; return; }
  document.body.appendChild(cv);

  var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision highp float;',
    'uniform sampler2D uMap;uniform vec2 uView;uniform float uDpr;uniform float uBand;uniform vec2 uMapSize;uniform vec4 uS0;uniform vec4 uS1;',
    'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
    'float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}',
    'float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*noise(p);p*=2.03;a*=.5;}return s;}',
    'vec4 seam(vec2 px,vec4 s){',
    '  float dy=px.y-s.x; if(abs(dy)>uBand) return vec4(0.);',
    '  float g=s.y,m=s.z,v=s.w;',
    '  vec2 uv=vec2(px.x/uMapSize.x,(dy+uBand)/(2.*uBand));',
    '  if(mod(v,2.)>=1.) uv.x=1.-uv.x;',
    '  if(mod(v,4.)>=2.) uv.y=1.-uv.y;',
    '  vec2 tx=1./uMapSize;',
    '  vec4 a=texture2D(uMap,uv); vec4 b=texture2D(uMap,uv+vec2(-1.2,-1.2)*tx);',
    '  float front=min(g,1.-m);',
    '  float t=a.r,t2=b.r;',
    '  float vis=smoothstep(front+.004,front-.03,t)*step(t,.985);',
    '  float vis2=smoothstep(front+.004,front-.03,t2)*step(t2,.985);',
    '  float w=a.g;',
    '  float line=vis*(.3+.7*w);',
    '  float rim=clamp(vis-vis2,0.,1.);',
    '  float d=abs(dy)/uBand;',
    '  float n=fbm(px*.016+v*7.1);',
    '  float grain=noise(px*.21+v*3.)*.7+noise(px*.9+v)*.3;',
    '  float ts=.38+d*.8+(n-.5)*.5;',
    '  float sheet=smoothstep(ts+.04,ts-.14,g)*(1.-smoothstep(0.,.5,m+d*.3));',
    '  sheet*=(.07+.2*grain*grain)*(1.-d)*(1.-d)*(1.-d);',
    '  float melted=step(t,.985)*smoothstep(1.-m,1.-m+.03,t)*(1.-smoothstep(1.-m+.03,1.-m+.24,t));',
    '  float bead=step(.86,hash(floor(px/3.)+v));',
    '  float wet=melted*(.06+.42*bead*w)*smoothstep(0.,.06,m)*(1.-smoothstep(.7,1.,m));',
    '  float h=hash(floor(px/2.)+v*13.);',
    '  float glint=step(.982,h)*vis*w*(.5+.5*sin(s.x*.08+h*40.));',
    '  float cw=uBand*.05; float cold=exp(-dy*dy/(2.*cw*cw))*g*(1.-smoothstep(0.,.7,m))*(.12+.2*noise(px*vec2(.012,.05)+v*5.));',
    '  float al=clamp(line*.8+rim*.6+sheet+wet+glint*.9+cold,0.,1.);',
    '  vec3 col=mix(vec3(.6,.74,.97),vec3(.94,.97,1.),clamp(line*.7+rim+glint,0.,1.));',
    '  col=mix(col,vec3(.72,.84,.98),clamp(wet/(al+1e-4),0.,1.)*.7);',
    '  return vec4(col*al,al);',
    '}',
    'void main(){',
    '  vec2 px=vec2(gl_FragCoord.x,uView.y*uDpr-gl_FragCoord.y)/uDpr;',
    '  vec4 c=seam(px,uS0); vec4 c1=seam(px,uS1);',
    '  gl_FragColor=c+c1*(1.-c.a);',
    '}'
  ].join('\n');

  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  var prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (e) { cv.remove(); window.__frost = { start: noop, stop: noop, layout: noop }; return; }
  gl.useProgram(prog);
  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var U = {}; ['uMap', 'uView', 'uDpr', 'uBand', 'uMapSize', 'uS0', 'uS1'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.uniform1i(U.uMap, 0);
  gl.clearColor(0, 0, 0, 0);

  function rng(seed) { return function () { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; }; }

  // ---------------------------------------------------------------- the time map: feathers grown once, drawn earliest-on-top
  function buildMap(W, B, k) {
    var H = 2 * B, c = document.createElement('canvas');
    c.width = Math.round(W * k); c.height = Math.round(H * k);
    var x = c.getContext('2d');
    x.scale(k, k); x.fillStyle = 'rgb(255,0,0)'; x.fillRect(0, 0, W, H); x.lineCap = 'round';
    var r = rng(4271), segs = [];
    var STEP = 3, SPD = [1, .8, .64], LW = [1.6, .95, .6], WT = [1, .62, .4];
    function grow(px, py, ang, len, depth, t0) {
      var s = 0, side = r() < .5 ? 1 : -1, next = (depth ? 3 : 5) + r() * (depth ? 4 : 7);
      while (s < len) {
        ang += (r() - .5) * .08 * (depth + 1);
        var nx = px + Math.cos(ang) * STEP, ny = py + Math.sin(ang) * STEP; s += STEP;
        var t = t0 + s / (B * SPD[depth]), f = s / len;
        segs.push([px, py, nx, ny, t, WT[depth] * (1 - .55 * f), LW[depth] * (1 - .5 * f)]);
        if (depth < 2 && s > next && len - s > 10) {
          var bl = Math.min(len - s, len * .5) * (.16 + r() * .22) * (depth ? .6 : 1);
          grow(nx, ny, ang + side * (Math.PI / 3) * (.9 + r() * .2), bl, depth + 1, t + .012);
          side = -side; next = s + (depth ? 3 : 4) + r() * (depth ? 4 : 6);
        }
        px = nx; py = ny;
      }
    }
    for (var X = -30; X < W + 30; X += 24 + r() * 40) {
      var d0 = r() * .14, L1 = r() < .25 ? .7 + r() * .25 : .22 + r() * .38, L2 = r() < .25 ? .7 + r() * .25 : .22 + r() * .38;
      grow(X, B + (r() - .5) * 6, -Math.PI / 2 + (r() - .5) * 2.1, B * L1, 0, d0);
      grow(X + (r() - .5) * 14, B + (r() - .5) * 6, Math.PI / 2 + (r() - .5) * 2.1, B * L2, 0, d0 + r() * .05);
      if (r() < .4) grow(X, B + (r() - .5) * 4, (r() < .5 ? 0 : Math.PI) + (r() - .5) * .35, B * (.2 + r() * .3), 1, d0 + .03);   // a needle along the cold line itself
    }
    var mx = 0; segs.forEach(function (s) { if (s[4] > mx) mx = s[4]; });
    segs.sort(function (a, b) { return b[4] - a[4]; });
    segs.forEach(function (s) {
      x.strokeStyle = 'rgb(' + Math.round(s[4] / mx * 248) + ',' + Math.round(s[5] * 255) + ',0)';
      x.lineWidth = s[6]; x.beginPath(); x.moveTo(s[0], s[1]); x.lineTo(s[2], s[3]); x.stroke();
    });
    return c;
  }

  var seams = [].slice.call(document.querySelectorAll('.sec:not(.hero), .foot'));
  var W = 0, VH = 0, B = 0, dpr = 1, running = false, painted = false;
  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = cv.clientWidth || innerWidth, h = cv.clientHeight || innerHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    gl.viewport(0, 0, cv.width, cv.height);
    if (w !== W || Math.abs(h - VH) > 140 || !B) {
      W = w; VH = h; B = Math.round(Math.max(120, Math.min(270, innerHeight * .24)));
      var t0 = performance.now(); var m = buildMap(W, B, Math.min(dpr, 1.5)); window.__frostBuild = Math.round(performance.now() - t0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, m);
    }
    gl.uniform2f(U.uView, w, h); gl.uniform1f(U.uDpr, dpr); gl.uniform1f(U.uBand, B); gl.uniform2f(U.uMapSize, W, 2 * B);
    painted = true; frame();
  }
  var smooth = function (a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  var OFF = [-1e5, 0, 0, 0];
  function frame() {
    if (!running) return;
    var vh = innerHeight, act = [], amt = 0;
    for (var i = 0; i < seams.length && act.length < 2; i++) {
      var top = seams[i].getBoundingClientRect().top, q = (vh - top) / vh;
      if (q <= 0 || q >= .82) continue;
      var gx = Math.min(1, Math.max(0, (q - .02) / .36)), g = 1 - (1 - gx) * (1 - gx);   // fast at first, slowing as the frost thickens
      var m = smooth(.44, .78, q);
      act.push([top, g, m, i % 4]);
      amt = Math.max(amt, g * (1 - m));
    }
    if (window.__onFrost) window.__onFrost(amt);
    if (!act.length) { if (painted) { gl.clear(gl.COLOR_BUFFER_BIT); painted = false; } return; }
    var a = act[0] || OFF, b = act[1] || OFF;
    gl.uniform4f(U.uS0, a[0], a[1], a[2], a[3]); gl.uniform4f(U.uS1, b[0], b[1], b[2], b[3]);
    gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    painted = true;
  }
  var tk = false;
  function onScroll() { if (tk || !running) return; tk = true; requestAnimationFrame(function () { tk = false; frame(); }); }
  addEventListener('scroll', onScroll, { passive: true });
  var rT = 0; addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { if (running) layout(); }, 150); });
  function start() { if (root.classList.contains('still')) return; running = true; cv.style.display = ''; layout(); }
  function stop() { running = false; gl.clear(gl.COLOR_BUFFER_BIT); cv.style.display = 'none'; if (window.__onFrost) window.__onFrost(0); }
  window.__frost = { start: start, stop: stop, layout: function () { if (running) layout(); }, frame: frame };
  start();
})();
