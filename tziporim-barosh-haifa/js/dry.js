/* Bath → dryer: the dryer's air front blows the wet photograph away and leaves the dried coat.
   Real photographs as the base; the front is a fur-streaked field radiating from the dryer's corner. */
(function () {
  "use strict";
  var VS = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
  var FS = [
    "precision highp float;",
    "uniform sampler2D uA,uB;uniform vec2 uRes,uSA,uSB,uFA,uFB,uO;uniform float uP;varying vec2 v;",
    "float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}",
    "float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);",
    " return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}",
    "float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}",
    "vec2 cover(vec2 uv,vec2 img,vec2 foc,float z){float rs=uRes.x/uRes.y,ri=img.x/img.y;",
    " vec2 s=rs>ri?vec2(1.,ri/rs):vec2(rs/ri,1.);s/=z;vec2 o=clamp(foc-s*.5,vec2(0.),vec2(1.)-s);return o+uv*s;}",
    "void main(){",
    " float asp=uRes.x/uRes.y;vec2 uv=v;vec2 q=vec2(uv.x*asp,uv.y);vec2 o=vec2(uO.x*asp,uO.y);",
    " vec2 d2=q-o;float d=length(d2);float ang=atan(d2.y,d2.x);vec2 dir=d2/max(d,1e-4);",
    " float streak=fbm(vec2(ang*9.,d*1.6-uP*1.2));float fine=fbm(q*7.);",
    " float field=d+(streak-.5)*.42+(fine-.5)*.14;",
    " float maxD=length(vec2(asp,1.))+.15;float t=mix(-.45,maxD+.45,uP);",
    " float reveal=1.-smoothstep(t-.05,t+.015,field);",
    " float ahead=smoothstep(.45,0.,field-t)*(1.-reveal);",
    " vec2 push=vec2(dir.x/asp,dir.y)*(.03*ahead*(.5+.5*fbm(q*5.+uP*2.)));",
    " vec3 a=texture2D(uA,cover(uv-push,uSA,uFA,1.+.05*uP)).rgb;",
    " a=mix(a,a*vec3(.92,.97,.98)+.03,ahead*.6);",
    " vec3 b=texture2D(uB,cover(uv,uSB,uFB,1.06-.06*uP)).rgb;",
    " float rim=exp(-pow((field-t)/.03,2.))*step(.001,uP)*step(uP,.999);",
    " vec3 c=mix(a,b,reveal)+vec3(1.,.9,.76)*rim*.28;",
    " float hz=exp(-pow((field-t)/.13,2.))*step(.001,uP)*step(uP,.999);",
    " vec2 bA=cover(uv-push,uSA,uFA,1.+.05*uP),bB=cover(uv,uSB,uFB,1.06-.06*uP);vec2 k=vec2(.012,0.),j=vec2(0.,.016);",
    " vec3 bl=(texture2D(uA,bA+k).rgb+texture2D(uA,bA-j).rgb+texture2D(uB,bB-k).rgb+texture2D(uB,bB+j).rgb)*.25;",
    " vec3 haze=bl*.55+vec3(.96,.9,.8)*.42;",
    " c=mix(c,haze,hz*.62*(.6+.4*fbm(q*3.+vec2(uP*4.,0.))));",
    " gl_FragColor=vec4(c,1.);}"
  ].join("\n");

  window.DryGL = function (canvas, srcA, srcB, o) {
    var g = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: "low-power" });
    if (!g) return null;
    function sh(t, s) { var x = g.createShader(t); g.shaderSource(x, s); g.compileShader(x); if (!g.getShaderParameter(x, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(x)); return x; }
    var pr = g.createProgram();
    g.attachShader(pr, sh(g.VERTEX_SHADER, VS)); g.attachShader(pr, sh(g.FRAGMENT_SHADER, FS));
    g.linkProgram(pr); if (!g.getProgramParameter(pr, g.LINK_STATUS)) return null;
    g.useProgram(pr);
    var b = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, b);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
    var lp = g.getAttribLocation(pr, "p"); g.enableVertexAttribArray(lp); g.vertexAttribPointer(lp, 2, g.FLOAT, false, 0, 0);
    var U = {}; ["uA", "uB", "uRes", "uSA", "uSB", "uFA", "uFB", "uO", "uP"].forEach(function (k) { U[k] = g.getUniformLocation(pr, k); });
    g.uniform1i(U.uA, 0); g.uniform1i(U.uB, 1);
    g.uniform2f(U.uFA, o.focA[0], 1 - o.focA[1]); g.uniform2f(U.uFB, o.focB[0], 1 - o.focB[1]);
    var loaded = 0, last = { p: 0, rtl: true };
    function tex(unit, src, sizeU) {
      var im = new Image(); im.decoding = "async";
      im.onload = function () {
        var t = g.createTexture(); g.activeTexture(g.TEXTURE0 + unit); g.bindTexture(g.TEXTURE_2D, t);
        g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, true);
        g.texImage2D(g.TEXTURE_2D, 0, g.RGB, g.RGB, g.UNSIGNED_BYTE, im);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
        g.uniform2f(U[sizeU], im.naturalWidth, im.naturalHeight);
        if (++loaded === 2) { api.resize(); api.draw(last.p, last.rtl, true); o.ready && o.ready(); window.__dry = true; }
      };
      im.src = src;
    }
    var api = {
      resize: function (quiet) {
        if (!canvas.clientWidth) return;
        var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        var w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
        if (canvas.width === w && canvas.height === h && quiet) return;
        canvas.width = w; canvas.height = h;
        g.viewport(0, 0, canvas.width, canvas.height);
        g.uniform2f(U.uRes, canvas.width || 1, canvas.height || 1);
        if (loaded === 2) api.draw(last.p, last.rtl, true);
      },
      draw: function (p, rtl, force) {
        if (!force && Math.abs(p - last.p) < 0.0005 && rtl === last.rtl && loaded === 2 && api._drawn) return;
        last.p = p; last.rtl = rtl;
        if (loaded < 2) return;
        g.uniform2f(U.uO, rtl ? -0.04 : 1.04, 1.04);
        g.uniform1f(U.uP, p);
        g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
        api._drawn = true;
      }
    };
    tex(0, srcA, "uSA"); tex(1, srcB, "uSB");
    return api;
  };
})();
