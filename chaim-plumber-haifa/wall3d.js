// Chaim's leak scan: a shower wall seen through a leak-detection camera. Scroll (0..1) drives it:
// a damp grout line, the camera switches to thermal and finds a hot plume running down from a leaking
// fitting inside the wall, six tiles come off, the fitting is replaced, the patch is closed, the wall dries.
// Textures: Poly Haven (CC0). The temperature field is shared with the page's readouts via tempAt().
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const span = (p, a, b) => clamp((p - a) / (b - a));
const smooth = (t) => t * t * (3 - 2 * t);

// timeline, matched to the page's text and readouts
export const TL = {
  // thermal to find it, normal view to open and fix, thermal again to confirm it cooled, then normal
  thermal: (p) => (p < 0.46 ? span(p, 0.18, 0.28) : p < 0.72 ? 1 - span(p, 0.46, 0.52) : p < 0.86 ? span(p, 0.72, 0.76) : 1 - span(p, 0.86, 0.92)),
  leak: (p) => (p < 0.66 ? 0.3 + 0.7 * span(p, 0.2, 0.5) : 1 - span(p, 0.66, 0.76)),
  cool: (p) => (p < 0.82 ? span(p, 0.68, 0.8) : 1 - span(p, 0.86, 0.98)),
  open: (p) => (p < 0.84 ? span(p, 0.52, 0.61) : 1 - span(p, 0.86, 0.95)),
  swap: (p) => span(p, 0.62, 0.68),
  solder: (p) => p >= 0.62 && p < 0.68,
  patch: (p) => span(p, 0.8, 0.85),
  damp: (p) => (p < 0.8 ? 0.7 + 0.3 * span(p, 0.05, 0.4) : 1 - span(p, 0.86, 0.98)),
};

const LEAK = { x: 0.16, y: 1.15 };
// temperature on the wall surface, in °C (also used in the shader, keep the two in step)
export function tempAt(x, y, L, C) {
  let t = 21.5;
  const dp = Math.min(Math.abs(x - LEAK.x) + Math.max(0, y - 2.2) + Math.max(0, LEAK.y - y), Math.abs(y - LEAK.y) + Math.max(0, x - LEAK.x) + Math.max(0, -x));
  t += 4.5 * Math.exp(-Math.pow(dp / 0.05, 2));
  const below = LEAK.y - y, reach = 0.75 * L;
  if (below > -0.04 && below < reach + 0.1) {
    const w = 0.05 + 0.32 * Math.max(0, below);
    t += 10 * L * Math.exp(-Math.pow((x - LEAK.x) / w, 2)) * (1 - smooth(span(below, reach - 0.08, reach + 0.1)));
  }
  if (below > -0.04 && below < 0.8) t -= 2.6 * C * Math.exp(-Math.pow((x - LEAK.x) / (0.08 + 0.3 * Math.max(0, below)), 2)) * (1 - span(below, 0.6, 0.8));
  return t;
}

const GLSL = `
uniform float uThermal; uniform float uLeak; uniform float uCool; uniform float uDamp; uniform float uTime;
varying vec3 vW;
float lh(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vn(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(lh(i), lh(i + vec3(1,0,0)), f.x), mix(lh(i + vec3(0,1,0)), lh(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(lh(i + vec3(0,0,1)), lh(i + vec3(1,0,1)), f.x), mix(lh(i + vec3(0,1,1)), lh(i + vec3(1,1,1)), f.x), f.y), f.z); }
float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p *= 2.03; a *= 0.5; } return s; }
float tempField(vec3 w){
  float x = w.x, y = w.y;
  float t = 21.5 + (fbm(w * 4.0) - 0.5) * 0.9;
  float dp = min(abs(x - 0.16) + max(0.0, y - 2.2) + max(0.0, 1.15 - y), abs(y - 1.15) + max(0.0, x - 0.16) + max(0.0, -x));
  t += 4.5 * exp(-pow(dp / 0.05, 2.0));
  float below = 1.15 - y + (fbm(w * 9.0) - 0.5) * 0.08, reach = 0.75 * uLeak;
  float wd = 0.05 + 0.32 * max(0.0, below);
  float plume = exp(-pow((x - 0.16 + (fbm(w * 6.0) - 0.5) * 0.06) / wd, 2.0)) * (1.0 - smoothstep(reach - 0.08, reach + 0.1, below)) * step(-0.04, below);
  t += 10.0 * uLeak * plume;
  float cw = 0.08 + 0.3 * max(0.0, below);
  t -= 2.6 * uCool * exp(-pow((x - 0.16) / cw, 2.0)) * (1.0 - smoothstep(0.6, 0.8, below)) * step(-0.04, below);
  if (w.y < 0.02) t = 20.5 + (fbm(w * 5.0) - 0.5) * 0.8;   // the floor runs a little cooler
  return t;
}
vec3 inferno(float t){
  const vec3 c0 = vec3(0.0002189403691192265, 0.001651004631001012, -0.01948089843709184);
  const vec3 c1 = vec3(0.1065134194856116, 0.5639564367884091, 3.932712388889277);
  const vec3 c2 = vec3(11.60249308247187, -3.972853965665698, -15.9423941062914);
  const vec3 c3 = vec3(-41.70399613139459, 17.43639888205313, 44.35414519872813);
  const vec3 c4 = vec3(77.162935699427, -33.40235894210092, -81.80730925738993);
  const vec3 c5 = vec3(-71.31942824499214, 32.62606426397723, 73.20951985803202);
  const vec3 c6 = vec3(25.13112622477341, -12.24266895238567, -23.07032500287172);
  return c0 + t * (c1 + t * (c2 + t * (c3 + t * (c4 + t * (c5 + t * c6)))));
}`;

// every surface gets: a thermal view (blended in at the very end), and optionally a damp darkening
function camMaterial(mat, opts) {
  const o = opts || {};
  mat.userData.u = { uThermal: { value: 0 }, uLeak: { value: 0 }, uCool: { value: 0 }, uDamp: { value: 0 }, uTime: { value: 0 } };
  mat.customProgramCacheKey = () => 'cam-' + (o.damp ? 'damp' : 'plain') + '-' + (o.key || '');
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, mat.userData.u);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vW;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    let f = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + GLSL);
    if (o.damp) {
      f = f.replace('#include <map_fragment>', `#include <map_fragment>
        float bl = 1.15 - vW.y;
        float dampMask = exp(-pow((vW.x - 0.16) / (0.07 + 0.2 * max(0.0, bl)), 2.0)) * (1.0 - smoothstep(0.35, 0.6, bl)) * step(0.0, bl) * (0.6 + 0.4 * fbm(vW * 12.0));
        diffuseColor.rgb *= mix(vec3(1.0), vec3(0.5, 0.45, 0.36), dampMask * uDamp * ${(o.dampStrength || 1).toFixed(2)});`);
    }
    f = f.replace('#include <dithering_fragment>', `#include <dithering_fragment>
      float tt = clamp((tempField(vW) - 16.0) / 18.0, 0.0, 1.0);
      vec3 th = inferno(tt) * (0.92 + 0.08 * lh(vec3(gl_FragCoord.xy, floor(uTime * 24.0))));
      gl_FragColor.rgb = mix(gl_FragColor.rgb, th, uThermal);`);
    sh.fragmentShader = f;
  };
  return mat;
}

export function initWall3D(host) {
  const canvas = document.createElement('canvas');
  host.appendChild(canvas);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); } catch (e) { return null; }
  const small = matchMedia('(max-width: 900px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0d0c);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.03).texture;
  scene.environmentIntensity = 0.75;
  const camera = new THREE.PerspectiveCamera(48, 1, 0.01, 20);

  const loader = new THREE.TextureLoader();
  const tex = (name, rep, color) => {
    const t = loader.load(`tex/${name}.jpg`); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]);
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); if (color) t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  const pbr = (id, rep, extra) => new THREE.MeshStandardMaterial(Object.assign({ map: tex(`${id}_diff`, rep, true), normalMap: tex(`${id}_nor`, rep), roughnessMap: tex(`${id}_rough`, rep), roughness: 1 }, extra || {}));

  const mats = [];
  const cm = (m, o) => { camMaterial(m, o); mats.push(m); return m; };
  const M = {
    grout: cm(pbr('gravel_concrete', [6, 7], { color: 0xc9c4b9 }), { damp: true, dampStrength: 1.8, key: 'grout' }),
    mortar: cm(pbr('gravel_concrete', [2, 2], { color: 0xb9b3a7 }), { key: 'mortar' }),
    patch: cm(pbr('gravel_concrete', [2, 2], { color: 0x9e9a92, transparent: true, opacity: 0 }), { key: 'patch' }),
    cavity: cm(pbr('gravel_concrete_02', [1, 1], { color: 0x8f877a }), { damp: true, key: 'cavity' }),
    floor: cm(pbr('floor_tiles_06', [3, 2]), { key: 'floor' }),
    side: cm(pbr('plastered_wall', [1.5, 1.5], { color: 0xe8e3da }), { key: 'side' }),
    tile: cm(new THREE.MeshPhysicalMaterial({ color: 0xe9e6df, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08, metalness: 0 }), { damp: true, dampStrength: 0.6, key: 'tile' }),
    tileNew: cm(new THREE.MeshPhysicalMaterial({ color: 0xfbfaf6, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }), { key: 'tilenew' }),
    chrome: cm(new THREE.MeshPhysicalMaterial({ color: 0xeceff1, metalness: 1, roughness: 0.06 }), { key: 'chrome' }),
    copper: cm(new THREE.MeshPhysicalMaterial({ color: 0xc27a45, metalness: 1, roughness: 0.3 }), { key: 'copper' }),
    fittingOld: cm(new THREE.MeshPhysicalMaterial({ color: 0x7f8a64, metalness: 0.6, roughness: 0.65 }), { key: 'fold' }),
    fittingNew: cm(new THREE.MeshPhysicalMaterial({ color: 0xd9b46a, metalness: 1, roughness: 0.2 }), { key: 'fnew' }),
  };
  const water = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, transmission: 1, thickness: 0.01, ior: 1.33, clearcoat: 1 });

  const add = (geo, mat, x, y, z, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; scene.add(m); return m; };
  // the opening behind the six tiles
  const OX0 = 0.0, OX1 = 0.31, OY0 = 0.77, OY1 = 1.235;
  // mortar bed behind the tiles, with a hole where the chase is; the grout shows through between tiles
  const wallW = 2.0, wallH = 2.3;
  const rect = (x0, x1, y0, y1, mat, z) => add(new THREE.PlaneGeometry(x1 - x0, y1 - y0), mat, (x0 + x1) / 2, (y0 + y1) / 2, z, false);
  rect(-1, OX0, 0, wallH, M.grout, 0); rect(OX1, 1, 0, wallH, M.grout, 0); rect(OX0, OX1, 0, OY0, M.grout, 0); rect(OX0, OX1, OY1, wallH, M.grout, 0);
  // the chase cut into the wall: back and four sides
  const depth = 0.07;
  rect(OX0, OX1, OY0, OY1, M.cavity, -depth);
  const sideGeoV = new THREE.PlaneGeometry(depth, OY1 - OY0), sideGeoH = new THREE.PlaneGeometry(OX1 - OX0, depth);
  const s1 = add(sideGeoV, M.mortar, OX0, (OY0 + OY1) / 2, -depth / 2, false); s1.rotation.y = Math.PI / 2;
  const s2 = add(sideGeoV, M.mortar, OX1, (OY0 + OY1) / 2, -depth / 2, false); s2.rotation.y = -Math.PI / 2;
  const s3 = add(sideGeoH, M.mortar, (OX0 + OX1) / 2, OY1, -depth / 2, false); s3.rotation.x = Math.PI / 2;
  const s4 = add(sideGeoH, M.mortar, (OX0 + OX1) / 2, OY0, -depth / 2, false); s4.rotation.x = -Math.PI / 2;
  const patch = rect(OX0, OX1, OY0, OY1, M.patch, 0.0015);
  // pipes in the chase: hot supply down from above, elbow at the leak, across to the mixer
  const pipeZ = -0.035;
  add(new THREE.CylinderGeometry(0.011, 0.011, wallH - LEAK.y, 16), M.copper, LEAK.x, (wallH + LEAK.y) / 2, pipeZ);
  const horiz = add(new THREE.CylinderGeometry(0.011, 0.011, LEAK.x - 0.0, 16), M.copper, LEAK.x / 2, LEAK.y, pipeZ); horiz.rotation.z = Math.PI / 2;
  const fitOld = add(new THREE.SphereGeometry(0.02, 18, 14), M.fittingOld, LEAK.x, LEAK.y, pipeZ);
  const fitNew = add(new THREE.SphereGeometry(0.02, 18, 14), M.fittingNew, LEAK.x, LEAK.y, pipeZ); fitNew.visible = false;
  // the wet run below the fitting: soft, uneven edges, widest under the drip, fading out lower down
  const streakMask = (() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 256; const g = c.getContext('2d'), img = g.createImageData(64, 256);
    for (let y = 0; y < 256; y++) {
      const v = y / 255, w = 0.16 + 0.22 * Math.min(1, v * 2.2) + 0.05 * Math.sin(v * 23) + 0.03 * Math.sin(v * 61 + 1), cx = 0.5 + 0.04 * Math.sin(v * 9 + 2);
      const fade = (1 - Math.pow(v, 2.4)) * Math.min(1, v * 14);
      for (let x = 0; x < 64; x++) { const d = Math.abs(x / 63 - cx) / w; const a = Math.max(0, 1 - d * d) * fade; const i = (y * 64 + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = 255 * a; img.data[i + 3] = 255; }
    }
    g.putImageData(img, 0, 0); return new THREE.CanvasTexture(c);
  })();
  const wetStreak = add(new THREE.PlaneGeometry(0.07, 0.4), cm(new THREE.MeshStandardMaterial({ color: 0x24170a, roughness: 1, transparent: true, opacity: 0, alphaMap: streakMask, depthWrite: false, envMapIntensity: 0 }), { key: 'streak' }), LEAK.x + 0.004, LEAK.y - 0.21, -depth + 0.001, false);
  // tiles: 15 x 15 cm ceramic, 3 mm grout, each slightly different, as real tiles are
  const T = 0.15, G = 0.003, PITCH = T + G, TH = 0.008;
  const tileGeo = new THREE.BoxGeometry(T, T, TH);
  const openTiles = [];
  for (let r = 0; r * PITCH < wallH; r++) for (let c = 0; -1 + c * PITCH < 1; c++) {
    const x = -1 + G / 2 + T / 2 + c * PITCH, y = G / 2 + T / 2 + r * PITCH;
    const inOpen = x > OX0 && x < OX1 && y > OY0 && y < OY1;
    const m = add(tileGeo, inOpen ? M.tile.clone() : M.tile, x, y, TH / 2 + 0.0005);
    m.rotation.z = (Math.sin(r * 12.9 + c * 78.2) * 0.5) * 0.004;
    m.position.z += Math.sin(r * 3.1 + c * 1.7) * 0.0006;
    if (inOpen) { camMaterial(m.material, { damp: true, dampStrength: 0.6, key: 'tile' }); mats.push(m.material); m.userData.home = m.position.clone(); openTiles.push(m); }
  }
  openTiles.sort((a, b) => b.userData.home.y - a.userData.home.y || a.userData.home.x - b.userData.home.x);
  // chrome mixer and shower arm, and the floor and side wall
  add(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 32).rotateX(Math.PI / 2), M.chrome, 0, LEAK.y, 0.03);
  add(new THREE.BoxGeometry(0.11, 0.016, 0.016), M.chrome, 0.06, LEAK.y + 0.005, 0.06);
  add(new THREE.CylinderGeometry(0.009, 0.009, 0.75, 16), M.chrome, 0, LEAK.y + 0.38, 0.03);
  add(new THREE.CylinderGeometry(0.075, 0.06, 0.018, 32), M.chrome, 0, LEAK.y + 0.76, 0.1);
  add(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 16).rotateX(Math.PI / 2), M.chrome, 0, LEAK.y + 0.76, 0.06);
  const floor = add(new THREE.PlaneGeometry(wallW, 1.6), M.floor, 0, 0, 0.8, false); floor.rotation.x = -Math.PI / 2;
  const side = add(new THREE.PlaneGeometry(1.6, wallH), M.side, -1, wallH / 2, 0.8, false); side.rotation.y = Math.PI / 2;
  // drops from the old fitting, running down the back of the chase
  const drops = Array.from({ length: 3 }, (_, i) => { const d = add(new THREE.SphereGeometry(0.006, 14, 10), water, LEAK.x, -9, pipeZ + 0.012, false); d.userData.t = i / 3; return d; });

  scene.add(new THREE.HemisphereLight(0xf2ece0, 0x3a3631, 0.45));
  const key = new THREE.SpotLight(0xffe9cc, 7, 6, 0.8, 0.6, 1.4); key.position.set(0.6, 2.3, 1.6); key.target.position.set(0.1, 1.0, 0); key.castShadow = true;
  key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048); key.shadow.bias = -0.0002; key.shadow.normalBias = 0.01; scene.add(key, key.target);
  const torch = new THREE.PointLight(0xfff6e8, 0, 1.4, 2); torch.position.set(0.25, 1.05, 0.35); scene.add(torch);
  const flame = new THREE.PointLight(0x6ab0ff, 0, 0.45, 2); flame.position.set(LEAK.x + 0.04, LEAK.y, 0.05); scene.add(flame);

  // the inspector's path: wide on the wall, closer on the damp grout, a thermal sweep, in close to open and fix, back out
  const KEYS = [
    [0.00, [0.45, 1.2, 1.6], [0.08, 1.0, 0]],
    [0.16, [0.3, 1.0, 0.95], [0.15, 0.92, 0]],
    [0.30, [-0.25, 1.12, 1.25], [0.05, 0.98, 0]],
    [0.44, [0.32, 1.04, 1.0], [0.15, 0.95, 0]],
    [0.56, [0.24, 1.02, 0.55], [0.15, 1.0, -0.02]],
    [0.70, [0.2, 1.04, 0.45], [0.15, 1.05, -0.03]],
    [0.80, [0.32, 1.02, 0.85], [0.15, 0.98, 0]],
    [1.00, [0.22, 1.12, 1.45], [0.08, 1.0, 0]],
  ];
  const posC = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k[1])), false, 'centripetal');
  const tgtC = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k[2])), false, 'centripetal');
  const ps = KEYS.map((k) => k[0]);
  const camAt = (p) => { let i = 0; while (i < ps.length - 2 && p > ps[i + 1]) i++; const u = (i + smooth(span(p, ps[i], ps[i + 1]))) / (ps.length - 1); return [posC.getPoint(u), tgtC.getPoint(u)]; };

  let P = 0, inView = false, raf = 0, last = 0, clock = 0, paused = false, snapping = false;
  // motion follows the page's animations switch (html.still), not only the OS setting
  const still = () => document.documentElement.classList.contains('still');
  function resize() { const r = host.getBoundingClientRect(); renderer.setSize(Math.max(1, r.width), Math.max(1, r.height), false); camera.aspect = r.width / Math.max(1, r.height); camera.updateProjectionMatrix(); kick(); }

  function frame(ts) {
    raf = 0; if ((!inView && !snapping) || paused) return;
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts; clock += dt;
    const p = P, motion = !still() && !snapping;
    const cp = motion || snapping ? p : [0.08, 0.36, 0.66, 0.95][p < 0.22 ? 0 : p < 0.5 ? 1 : p < 0.86 ? 2 : 3];
    const [pos, tgt] = camAt(cp);
    if (motion) { pos.x += Math.sin(clock * 0.9) * 0.006; pos.y += Math.sin(clock * 1.3 + 1) * 0.005; tgt.x += Math.sin(clock * 0.7 + 2) * 0.004; }
    camera.position.copy(pos); camera.lookAt(tgt);
    const thermal = TL.thermal(p), L = TL.leak(p), C = TL.cool(p), damp = TL.damp(p);
    mats.forEach((m) => { const u = m.userData.u; u.uThermal.value = thermal; u.uLeak.value = L; u.uCool.value = C; u.uDamp.value = damp; u.uTime.value = clock; });
    // tiles are pried off top-down, one by one: they tip out from their bottom edge and drop out of frame.
    // Closing: the old tiles are broken, so new ones are pressed into fresh adhesive, bottom row first.
    const O = TL.open(p), n = openTiles.length, closing = p >= 0.84;
    openTiles.forEach((t, i) => {
      const h = t.userData.home;
      if (!closing) {
        const k = clamp(O * n - i);
        t.position.set(h.x + k * 0.05, h.y - k * k * 0.9, h.z + k * 0.25);
        t.rotation.x = -k * 1.1; t.visible = k < 0.99; t.material = t.userData.oldMat || (t.userData.oldMat = t.material);
      } else {
        const c = clamp((1 - O) * n - (n - 1 - i));
        t.position.set(h.x, h.y, h.z + 0.035 * (1 - smooth(c)));
        t.rotation.x = 0; t.visible = c > 0.01; t.material = M.tileNew;
      }
    });
    // the chase: old fitting drips, is swapped with a soldering flash, the patch closes
    const sw = TL.swap(p); fitOld.visible = sw < 0.5; fitNew.visible = sw >= 0.5;
    flame.intensity = TL.solder(p) ? (motion ? 0.7 + 0.6 * Math.abs(Math.sin(clock * 31)) + 0.3 * Math.random() : 0.9) : 0;
    if (snapping) drops.forEach((d, i) => { d.userData.t = 0.2 + i * 0.27; });
    torch.intensity = O > 0.1 ? 2.2 * O : 0;
    wetStreak.material.opacity = sw < 0.5 ? 0.85 * clamp(L * 1.4) * clamp(O * 3) : 0.85 * (1 - span(p, 0.68, 0.84));
    const dripping = O > 0.2 && sw < 0.5 && L > 0.2;
    drops.forEach((d, i) => {
      if (!dripping) { d.position.y = -9; return; }
      if (motion) d.userData.t = (d.userData.t + dt * 0.9) % 1;
      const t = d.userData.t;
      if (t < 0.35) { d.position.y = LEAK.y - 0.02; d.scale.setScalar(0.4 + 1.6 * t); }
      else { const f = (t - 0.35) / 0.65; d.position.y = LEAK.y - 0.02 - 0.35 * f * f; d.scale.set(1, 1.3 + f, 1); }
    });
    M.patch.opacity = TL.patch(p);
    renderer.render(scene, camera);
    if (inView && !snapping && (motion || flame.intensity > 0)) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && inView && !paused) raf = requestAnimationFrame(frame); }
  new ResizeObserver(resize).observe(host); resize();
  new IntersectionObserver((es) => { inView = es[0].isIntersecting; last = 0; kick(); }).observe(host);
  return {
    set(p) { P = p; snapping = false; kick(); },
    // the animations switch: stop drawing and free the GPU loop, or pick up again
    pause() { paused = true; if (raf) cancelAnimationFrame(raf); raf = 0; canvas.style.visibility = 'hidden'; },
    resume() { paused = false; canvas.style.visibility = ''; last = 0; resize(); },
    // one exact frame at p without camera sway (used to render the still images)
    // holds that frame until the next set()
    snap(p) { P = p; snapping = true; resize(); if (raf) cancelAnimationFrame(raf); raf = 0; frame(performance.now()); },
    tempAt: (p) => tempAt(LEAK.x, LEAK.y - 0.12, TL.leak(p), TL.cool(p)),
  };
}
