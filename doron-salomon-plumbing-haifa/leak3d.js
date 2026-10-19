// A realistic 3D cutaway of an apartment floor: water from a leaking joint on floor 3 travels through the
// tiles, the mortar bed and the concrete slab, and stains the ceiling of floor 2. The page's scroll
// position (0..1) drives everything; the camera follows the water down. Textures: Poly Haven (CC0).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const span = (p, a, b) => clamp((p - a) / (b - a));
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

const PIPE = new THREE.Vector3(0.6, 0, -0.12);          // the riser, just behind the cut face
const JOINT_Y = 0.45, VALVE_Y = 1.05;
const L = { tile: 0, screed: -0.012, concrete: -0.07, plaster: -0.25, ceiling: -0.265, floor2: -2.86 };

// the shared timeline (also used by the page for its text and readouts)
export const T = {
  rate: (p) => (p < 0.04 ? 0 : p < 0.14 ? 0.15 + 0.85 * span(p, 0.04, 0.14) : p < 0.74 ? 1 : 1 - span(p, 0.74, 0.78)),
  puddle: (p) => (p < 0.86 ? span(p, 0.05, 0.2) : 1 - span(p, 0.86, 0.95)),
  screed: (p) => (p < 0.86 ? span(p, 0.17, 0.4) : 1 - smooth(span(p, 0.86, 0.97))),
  concrete: (p) => (p < 0.86 ? span(p, 0.3, 0.5) : 1 - span(p, 0.86, 0.98)),
  ceiling: (p) => (p < 0.86 ? smooth(span(p, 0.48, 0.7)) : 1 - smooth(span(p, 0.86, 0.99))),
  ceilingMax: (p) => smooth(span(p, 0.48, 0.7)),
  ceilDrip: (p) => (p < 0.62 ? 0 : p < 0.66 ? span(p, 0.62, 0.66) : p < 0.78 ? 1 : 1 - span(p, 0.78, 0.84)),
  valve: (p) => (p < 0.74 ? 0 : p < 0.78 ? span(p, 0.74, 0.78) : p < 0.88 ? 1 : 1 - span(p, 0.88, 0.92)),
  solder: (p) => (p >= 0.79 && p < 0.86 ? 1 : 0),
  fixed: (p) => p >= 0.86,
};

// camera keyframes: [p, position, target]
const KEYS = [
  [0.00, [1.55, 0.95, 1.35], [0.6, 0.38, -0.12]],
  [0.12, [1.05, 0.62, 0.75], [0.6, 0.2, -0.12]],
  [0.26, [1.3, 0.04, 0.95], [0.55, -0.08, -0.1]],
  [0.40, [0.96, -0.19, 0.5], [0.6, -0.2, -0.1]],
  [0.52, [1.6, -0.9, 1.4], [0.7, -0.3, -0.25]],
  [0.68, [1.35, -1.45, 1.1], [0.72, -0.28, -0.3]],
  [0.77, [1.2, 1.0, 1.05], [0.6, 0.82, -0.12]],
  [0.84, [1.0, 0.56, 0.72], [0.6, 0.45, -0.12]],
  [1.00, [1.9, -0.75, 1.9], [0.62, -0.32, -0.3]],
];

const GLSL_NOISE = `
float lh(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vn(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(lh(i), lh(i + vec3(1,0,0)), f.x), mix(lh(i + vec3(0,1,0)), lh(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(lh(i + vec3(0,0,1)), lh(i + vec3(1,0,1)), f.x), mix(lh(i + vec3(0,1,1)), lh(i + vec3(1,1,1)), f.x), f.y), f.z); }
float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p *= 2.03; a *= 0.5; } return s; }
`;

// patch a standard material so a "wet" field darkens it and makes it glossier, and optionally stains it
function wetMaterial(mat, kind) {
  mat.userData.u = { uR: { value: 0 }, uFront: { value: 0 }, uMax: { value: 0 }, uStain: { value: 0 }, uPipe: { value: PIPE.clone() } };
  mat.customProgramCacheKey = () => 'wet-' + kind;   // each wet material needs its own shader
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, mat.userData.u);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vW;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    const wet = {
      screed: `float d = length(vW.xz - uPipe.xz); float n = (fbm(vW * 7.0) - 0.5) * 0.28;
               float wet = 1.0 - smoothstep(uR - 0.05, uR + 0.03, d + n * (0.3 + uR));`,
      concrete: `float d = length(vW.xz - uPipe.xz); float n = (fbm(vW * 9.0) - 0.5) * 0.12;
               float crack = 1.0 - smoothstep(0.004, 0.012, abs(vW.x - 0.33 - 0.03 * sin(vW.y * 55.0) - 0.02 * fbm(vW * 30.0)));
               float along = 1.0 - smoothstep(uR - 0.03, uR + 0.03, d + n);
               float wet = max(along, crack * step(0.3, vW.x) * step(vW.x, 0.6) * smoothstep(0.1, 0.4, uR)) * smoothstep(uFront - 0.012, uFront + 0.012, vW.y);`,
      plaster: `float d = length(vW.xz - (uPipe.xz + vec2(0.12, -0.08))); float n = (fbm(vW * 5.0) - 0.5) * 0.36 + (fbm(vW * 22.0) - 0.5) * 0.06;
               float wet = 1.0 - smoothstep(uR - 0.08, uR + 0.02, d + n);
               float inside = 1.0 - smoothstep(uMax - 0.06, uMax + 0.01, d + n);
               float ring = exp(-pow((d + n - uMax) / 0.022, 2.0)) * step(0.02, uMax);
               float ring2 = exp(-pow((d + n * 1.3 - uMax * 0.62) / 0.018, 2.0)) * step(0.05, uMax) * 0.5;`,
    }[kind];
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vW;\nuniform float uR; uniform float uFront; uniform float uMax; uniform float uStain; uniform vec3 uPipe;\n${GLSL_NOISE}`)
      .replace('#include <map_fragment>', `#include <map_fragment>\n${wet}\n` +
        (kind === 'plaster'
          ? `vec3 stainTint = mix(vec3(1.0), vec3(0.78, 0.58, 0.28), clamp(inside * 0.6 + ring * 1.0 + ring2 * 0.7, 0.0, 1.0) * uStain);
             diffuseColor.rgb *= stainTint * mix(vec3(1.0), vec3(0.86, 0.80, 0.70), wet);`
          : `diffuseColor.rgb *= mix(vec3(1.0), vec3(0.40, 0.42, 0.45), wet * ${kind === 'screed' ? '0.95' : '0.9'});`))
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, ${kind === 'plaster' ? '0.45' : '0.18'}, wet);`);
  };
  return mat;
}

export function initLeak3D(host, labelsHost, opts) {
  const canvas = document.createElement('canvas');
  host.appendChild(canvas);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { return null; }
  const small = matchMedia('(max-width: 900px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x14181d);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environmentIntensity = 0.55;
  const camera = new THREE.PerspectiveCamera(42, 1, 0.02, 40);

  // textures
  const loader = new THREE.TextureLoader();
  const tex = (name, rep, color) => {
    const t = loader.load(`tex/${name}.jpg`);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]);
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    if (color) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  const pbr = (id, rep, extra) => new THREE.MeshStandardMaterial(Object.assign({
    map: tex(`${id}_diff`, rep, true), normalMap: tex(`${id}_nor`, rep), roughnessMap: tex(`${id}_rough`, rep), roughness: 1, metalness: 0,
  }, extra || {}));

  const M = {
    tiles: pbr('terrazzo_tiles', [4, 3]),
    wall3: pbr('plastered_wall', [2, 1.5], { color: 0xf2efe8 }),
    screed: wetMaterial(pbr('gravel_concrete', [3, 2.2], { color: 0xe3dccd }), 'screed'),
    concrete: wetMaterial(pbr('gravel_concrete_02', [3.5, 2.6], { color: 0xd6d2c8 }), 'concrete'),
    plaster: wetMaterial(pbr('white_stucco', [2.5, 2], { color: 0xece6db }), 'plaster'),
    wall2: pbr('plastered_wall', [2, 1.8], { color: 0xe9e2d4 }),
    floor2: pbr('terrazzo_tiles', [4, 3], { color: 0xc9c1b4 }),
    rebar: pbr('rusty_metal_02', [1, 4], { color: 0x8a5a3c, metalness: 0.6 }),
    copper: new THREE.MeshPhysicalMaterial({ color: 0xc27a45, metalness: 1, roughness: 0.32, clearcoat: 0.2 }),
    brass: new THREE.MeshPhysicalMaterial({ color: 0xb8954f, metalness: 1, roughness: 0.42 }),
    brassNew: new THREE.MeshPhysicalMaterial({ color: 0xe0bd6b, metalness: 1, roughness: 0.18 }),
    sleeve: new THREE.MeshStandardMaterial({ color: 0x3a3f44, roughness: 0.7 }),
    red: new THREE.MeshStandardMaterial({ color: 0xc8322a, roughness: 0.45 }),
    water: new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.02, transmission: 1, thickness: 0.02, ior: 1.33, clearcoat: 1, clearcoatRoughness: 0.02 }),
    puddle: new THREE.MeshPhysicalMaterial({ color: 0xdfeef4, metalness: 0, roughness: 0.02, transparent: true, opacity: 0.3, clearcoat: 1, clearcoatRoughness: 0.02, depthWrite: false }),
    film: new THREE.MeshPhysicalMaterial({ color: 0xcfe6f0, roughness: 0.05, transparent: true, opacity: 0, clearcoat: 1, depthWrite: false }),
  };

  const add = (geo, mat, x, y, z, opts) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    m.castShadow = !(opts && opts.noCast); m.receiveShadow = true; scene.add(m); return m;
  };
  const W = 3.2, D = 2.4, x0 = -1.6;
  // the slab, cut at z = 0, with a notch at the front so the pipe can be seen passing through it
  const nL = PIPE.x - 0.07, nR = PIPE.x + 0.07, nZ = PIPE.z - 0.06;
  function layer(mat, top, bottom) {
    const h = top - bottom, y = (top + bottom) / 2;
    add(new THREE.BoxGeometry(nL - x0, h, D), mat, (x0 + nL) / 2, y, -D / 2);
    add(new THREE.BoxGeometry(1.6 - nR, h, D), mat, (nR + 1.6) / 2, y, -D / 2);
    add(new THREE.BoxGeometry(nR - nL, h, D + nZ), mat, PIPE.x, y, (-D + nZ) / 2);
  }
  layer(M.tiles, L.tile, L.screed);
  layer(M.screed, L.screed, L.concrete);
  layer(M.concrete, L.concrete, L.plaster);
  layer(M.plaster, L.plaster, L.ceiling);
  // rebar: two layers of bars running back from the cut face, their rusty ends visible in section
  const barGeo = new THREE.CylinderGeometry(0.008, 0.008, D, 10); barGeo.rotateX(Math.PI / 2);
  for (const yb of [-0.105, -0.215]) for (let xb = -1.5; xb < 1.6; xb += 0.18) {
    if (Math.abs(xb - PIPE.x) < 0.09) continue;
    add(barGeo, M.rebar, xb, yb, -D / 2 + 0.004, { noCast: true });
  }
  // rooms
  add(new THREE.PlaneGeometry(W, 2.4), M.wall3, 0, 1.2, -D);
  const side3 = add(new THREE.PlaneGeometry(D, 2.4), M.wall3, x0, 1.2, -D / 2); side3.rotation.y = Math.PI / 2;
  add(new THREE.PlaneGeometry(W, 2.6), M.wall2, 0, (L.ceiling + L.floor2) / 2, -D);
  const side2 = add(new THREE.PlaneGeometry(D, 2.6), M.wall2, x0, (L.ceiling + L.floor2) / 2, -D / 2); side2.rotation.y = Math.PI / 2;
  const fl2 = add(new THREE.PlaneGeometry(W, D), M.floor2, 0, L.floor2, -D / 2); fl2.rotation.x = -Math.PI / 2;
  // the riser, its sleeve through the slab, the joint, and the apartment valve
  add(new THREE.CylinderGeometry(0.021, 0.021, 4.6, 24), M.copper, PIPE.x, -0.7, PIPE.z);
  add(new THREE.CylinderGeometry(0.034, 0.034, -L.ceiling + 0.01, 24, 1, true), M.sleeve, PIPE.x, (L.tile + L.ceiling) / 2, PIPE.z);
  const joint = add(new THREE.CylinderGeometry(0.03, 0.03, 0.07, 24), M.brass, PIPE.x, JOINT_Y, PIPE.z);
  const valveBody = add(new THREE.CylinderGeometry(0.036, 0.036, 0.09, 20), M.brass, PIPE.x, VALVE_Y, PIPE.z);
  const lever = new THREE.Group(); lever.position.set(PIPE.x, VALVE_Y, PIPE.z + 0.04); scene.add(lever);
  const leverBar = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.022, 0.012), M.red); leverBar.position.x = 0.07; leverBar.castShadow = true; lever.add(leverBar);
  // water: a film on the pipe, a puddle around its base, drops at the joint and at the ceiling
  const film = add(new THREE.CylinderGeometry(0.0235, 0.0235, JOINT_Y - 0.035, 20, 1, true), M.film, PIPE.x, (JOINT_Y - 0.035) / 2, PIPE.z, { noCast: true });
  const trickleGeo = new THREE.CylinderGeometry(0.0245, 0.0245, -L.ceiling, 20, 1, true); trickleGeo.translate(0, L.ceiling / 2, 0);
  const trickle = add(trickleGeo, M.film.clone(), PIPE.x, L.tile, PIPE.z, { noCast: true }); trickle.scale.y = 0.001;
  const front = add(new THREE.SphereGeometry(0.012, 16, 12), M.water, PIPE.x + 0.02, L.tile, PIPE.z + 0.02, { noCast: true });
  const puddle = add(new THREE.CircleGeometry(1, 48), M.puddle, PIPE.x + 0.05, 0.0025, PIPE.z + 0.02, { noCast: true });
  puddle.rotation.x = -Math.PI / 2; puddle.scale.setScalar(0.001);
  const dropGeo = new THREE.SphereGeometry(0.011, 20, 16);
  const mkDrops = (n) => Array.from({ length: n }, () => { const d = add(dropGeo, M.water, 0, -99, 0, { noCast: true }); d.userData.t = Math.random(); return d; });
  const jointDrops = mkDrops(3), ceilDrops = mkDrops(3);
  const ceilHang = add(dropGeo, M.water, PIPE.x + 0.12, L.ceiling - 0.012, PIPE.z - 0.08, { noCast: true });
  const puddle2 = add(new THREE.CircleGeometry(1, 48), M.puddle, PIPE.x + 0.12, L.floor2 + 0.003, PIPE.z - 0.08, { noCast: true });
  puddle2.rotation.x = -Math.PI / 2; puddle2.scale.setScalar(0.001);

  // light: a warm ceiling light upstairs, a cooler one downstairs, a soft key with shadows
  scene.add(new THREE.HemisphereLight(0xf4efe6, 0x2a2a2a, 0.35));
  const key = new THREE.DirectionalLight(0xfff3e0, 1.5); key.position.set(3, 4, 4); key.castShadow = true;
  key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048); key.shadow.camera.left = -3; key.shadow.camera.right = 3; key.shadow.camera.top = 3; key.shadow.camera.bottom = -4; key.shadow.bias = -0.0002; key.shadow.normalBias = 0.02;
  scene.add(key);
  const up = new THREE.PointLight(0xffe2b8, 6, 6, 1.6); up.position.set(0.2, 2.1, -1); scene.add(up);
  const down = new THREE.PointLight(0xf1ead8, 2.2, 6, 1.6); down.position.set(-0.4, -1.6, -1.2); scene.add(down);
  const flame = new THREE.PointLight(0x5aa8ff, 0, 1.2, 2); flame.position.set(PIPE.x + 0.08, JOINT_Y, PIPE.z + 0.06); scene.add(flame);

  // labels for the layers and floors, projected from 3D into the page
  const labelDefs = [
    ['tile', [0.2, -0.004, 0.005], 'אריחי טראצו', 'Terrazzo tiles'], ['screed', [0.2, -0.04, 0.005], 'מצע וטיט', 'Mortar bed'],
    ['concrete', [0.2, -0.16, 0.005], 'בטון מזוין', 'Reinforced concrete'], ['plaster', [0.2, -0.258, 0.005], 'טיח תקרה', 'Ceiling plaster'],
    ['f3', [-1.2, 1.9, -1.2], 'קומה 3', 'Floor 3'], ['f2', [-1.2, -0.9, -1.2], 'קומה 2', 'Floor 2'],
    ['joint', [PIPE.x, JOINT_Y + 0.07, PIPE.z], 'החיבור שדולף', 'The leaking joint'], ['valve', [PIPE.x + 0.15, VALVE_Y + 0.05, PIPE.z], 'ברז הדירה נסגר', 'Apartment valve closed'], ['solder', [PIPE.x, JOINT_Y + 0.07, PIPE.z], 'הלחמה מחדש של החיבור', 'Re-soldering the joint'],
  ];
  const labels = labelDefs.map(([id, pos, he, en]) => {
    const el = document.createElement('span'); el.className = 'l3d l3d-' + id;
    el.innerHTML = `<span lang="he">${he}</span><span lang="en">${en}</span>`; labelsHost.appendChild(el);
    return { id, el, v: new THREE.Vector3(...pos) };
  });

  // camera path through the keyframes
  const posCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k[1])), false, 'centripetal');
  const tgtCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k[2])), false, 'centripetal');
  const ps = KEYS.map((k) => k[0]);
  function camAt(p) {
    let i = 0; while (i < ps.length - 2 && p > ps[i + 1]) i++;
    const u = (i + smooth(span(p, ps[i], ps[i + 1]))) / (ps.length - 1);
    return [posCurve.getPoint(u), tgtCurve.getPoint(u)];
  }

  let P = 0, inView = false, raf = 0, last = 0, w = 0, h = 0, paused = false;
  const calm = (opts && opts.calm) || (() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  function resize() {
    const r = host.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height);
    renderer.setSize(w, h, false); camera.aspect = w / h;
    // the keyframes were framed at 16:11; on taller stages keep that width of view instead of cropping the sides
    const ref = 16 / 11, base = 42 * Math.PI / 180;
    camera.fov = camera.aspect >= ref ? 42 : Math.min(62, 2 * Math.atan(Math.tan(base / 2) * ref / camera.aspect) * 180 / Math.PI);
    camera.updateProjectionMatrix();
    if (typeof kick === 'function') kick();
  }
  new ResizeObserver(resize).observe(host); resize();

  function fallDrop(d, t, from, dist, size) {
    // t: 0..1 in the drop's cycle. Grow and hang for the first 35%, then fall with gravity.
    if (t < 0.35) { const g = t / 0.35; d.position.set(from.x, from.y - 0.004 * g, from.z); d.scale.set(size * (0.4 + 0.6 * g), size * (0.4 + 0.9 * g), size * (0.4 + 0.6 * g)); }
    else { const f = (t - 0.35) / 0.65; d.position.set(from.x, from.y - dist * f * f, from.z); d.scale.set(size * 0.85, size * (1.3 + 1.2 * f), size * 0.85); }
  }

  function frame(ts) {
    raf = 0; if (!inView) return;
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts;
    const p = P, motion = !calm();
    // camera: smooth along the path; with reduced motion, jump between stages
    const cp = motion ? p : [0.06, 0.24, 0.4, 0.62, 0.84][p < 0.16 ? 0 : p < 0.32 ? 1 : p < 0.5 ? 2 : p < 0.72 ? 3 : 4];
    const [cpos, ctgt] = camAt(cp); camera.position.copy(cpos); camera.lookAt(ctgt);
    // wet fields
    M.screed.userData.u.uR.value = 0.9 * T.screed(p);
    const c = T.concrete(p);
    M.concrete.userData.u.uR.value = 0.06 + 0.3 * c; M.concrete.userData.u.uFront.value = c > 0 ? lerp(L.concrete + 0.002, L.plaster - 0.01, c) : 1;
    M.plaster.userData.u.uR.value = 0.78 * T.ceiling(p); M.plaster.userData.u.uMax.value = 0.78 * T.ceilingMax(p);
    M.plaster.userData.u.uStain.value = p < 0.86 ? 1 : 1 - 0.55 * span(p, 0.86, 1);
    // water at the joint
    const R = T.rate(p);
    M.film.opacity = 0.55 * clamp((R - 0.4) * 2);
    puddle.scale.setScalar(Math.max(0.001, 0.3 * T.puddle(p)));
    // the trickle runs down the pipe through tile, mortar bed and concrete; a drop leads it
    const down = p < 0.86 ? span(p, 0.15, 0.5) : 1 - span(p, 0.86, 0.95);
    trickle.scale.y = Math.max(0.001, down);
    trickle.material.opacity = 0.6 * Math.min(1, down * 4) * (R > 0.01 || p < 0.86 ? 1 : 0.5);
    const lead = p > 0.15 && p < 0.52;
    front.position.y = lead ? L.tile + L.ceiling * span(p, 0.15, 0.5) - 0.01 : -99;
    const jFrom = new THREE.Vector3(PIPE.x + 0.006, JOINT_Y - 0.036, PIPE.z + 0.022);
    jointDrops.forEach((d, i) => {
      if (R <= 0.01 || (i > 0 && R < 0.6)) { d.position.y = -99; return; }
      if (motion) d.userData.t = (d.userData.t + dt * (0.5 + 0.9 * R)) % 1; else d.userData.t = 0.2;
      fallDrop(d, (d.userData.t + i / jointDrops.length) % 1, jFrom, JOINT_Y - 0.04, 1);
    });
    // drops from the ceiling below
    const CD = T.ceilDrip(p);
    const cFrom = new THREE.Vector3(PIPE.x + 0.12, L.ceiling - 0.012, PIPE.z - 0.08);
    ceilHang.scale.set(2 * (CD > 0.01 ? 1 : Math.max(0.001, span(p, 0.58, 0.62))), 2.6 * (CD > 0.01 ? 1 : Math.max(0.001, span(p, 0.58, 0.62))), 2 * (CD > 0.01 ? 1 : Math.max(0.001, span(p, 0.58, 0.62))));
    ceilHang.position.y = L.ceiling - 0.01;
    ceilDrops.forEach((d, i) => {
      if (CD <= 0.01 || (i > 0 && CD < 0.7)) { d.position.y = -99; return; }
      if (motion) d.userData.t = (d.userData.t + dt * (0.35 + 0.5 * CD)) % 1; else d.userData.t = 0.2;
      fallDrop(d, (d.userData.t + i / ceilDrops.length) % 1, cFrom, -L.floor2 + L.ceiling - 0.02, 2.1);
    });
    puddle2.scale.setScalar(Math.max(0.001, 0.2 * (p < 0.86 ? span(p, 0.64, 0.8) : 1 - span(p, 0.86, 0.96))));
    // the fix: a ball valve is open with its lever along the pipe and closed across it; a soldering flame flickers, the joint comes back bright
    lever.rotation.z = -Math.PI / 2 * (1 - smooth(T.valve(p)));
    const sol = T.solder(p);
    flame.intensity = sol ? (motion ? 2.2 + 1.4 * Math.sin(ts * 0.03) + Math.random() * 0.8 : 2.5) : 0;
    joint.material = T.fixed(p) ? M.brassNew : M.brass;
    // labels
    const show = {
      tile: p > 0.17 && p < 0.52, screed: p > 0.17 && p < 0.52, concrete: p > 0.28 && p < 0.52, plaster: p > 0.3 && p < 0.56,
      f3: p > 0.74, f2: p > 0.5 && (p < 0.74 || p > 0.88), joint: p < 0.16, solder: p > 0.79 && p < 0.88, valve: p > 0.74 && p < 0.82,
    };
    const v = new THREE.Vector3();
    labels.forEach((l) => {
      v.copy(l.v).project(camera);
      const vis = show[l.id] && v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05;
      l.el.style.opacity = vis ? 1 : 0;
      l.el.style.transform = `translate(${((v.x + 1) / 2 * w).toFixed(1)}px, ${((1 - v.y) / 2 * h).toFixed(1)}px)`;
    });
    renderer.render(scene, camera);
    if (inView && (motion || flame.intensity > 0)) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && inView && !paused) raf = requestAnimationFrame(frame); }
  new IntersectionObserver((es) => { inView = es[0].isIntersecting; last = 0; kick(); }).observe(host);
  return {
    set(p) { P = p; kick(); },
    redraw: kick,
    // animations switched off at runtime: stop drawing and hide the canvas; resume picks up at the current scroll
    pause() { paused = true; if (raf) cancelAnimationFrame(raf); raf = 0; canvas.style.visibility = 'hidden'; labelsHost.style.visibility = 'hidden'; },
    resume() { paused = false; canvas.style.visibility = ''; labelsHost.style.visibility = ''; last = 0; kick(); },
  };
}
