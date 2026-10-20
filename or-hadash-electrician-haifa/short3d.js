// A 3D cutaway of a living-room wall: a heater on a socket, the cable runs up a conduit to a junction box where
// one joint was only twisted and taped. Under load the loose joint heats, the insulation chars, live touches
// neutral, the breaker trips and the room goes dark. Then the fault is tested, cut out, remade with lever
// connectors, re-tested and the breaker goes back up. Scroll (0..1) drives everything. Textures: Poly Haven (CC0).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const span = (p, a, b) => clamp((p - a) / (b - a));
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// the shared timeline (the page reads the same numbers for its text and its meter)
export const T = {
  load: (p) => (p < 0.44 ? span(p, 0.02, 0.06) : p < 0.93 ? 0 : span(p, 0.93, 0.95)),
  heat: (p) => (p < 0.44 ? smooth(span(p, 0.13, 0.4)) : p < 0.71 ? 1 - 0.9 * smooth(span(p, 0.44, 0.64)) : 0),
  char: (p) => (p < 0.71 ? smooth(span(p, 0.24, 0.42)) : 0),
  arc: (p) => p >= 0.405 && p < 0.44,
  tripped: (p) => p >= 0.44 && p < 0.905,
  light: (p) => (p < 0.44 ? 1 : p < 0.93 ? 0 : smooth(span(p, 0.93, 0.96))),
  head: (p) => (p < 0.47 ? 0 : p < 0.93 ? span(p, 0.47, 0.5) : 1 - span(p, 0.93, 0.95)),
  probeA: (p) => (p >= 0.62 && p < 0.7 ? 1 : 0),
  probeB: (p) => (p >= 0.79 && p < 0.83 ? 1 : 0),
  cut: (p) => p >= 0.7,
  conn: (p) => smooth(span(p, 0.72, 0.78)),
  lid: (p) => smooth(span(p, 0.832, 0.86)),
};

// camera keyframes: [p, position, target]
const KEYS = [
  [0.0, [0.75, 0.05, 3.3], [0.05, 0.05, 0]],
  [0.12, [1.3, -0.55, 1.35], [0.74, -0.64, 0]],
  [0.24, [0.8, 0.39, 0.44], [0.6, 0.3, 0.03]],
  [0.37, [0.645, 0.335, 0.19], [0.6, 0.306, 0.03]],
  [0.46, [0.63, 0.37, 0.44], [0.58, 0.31, 0.02]],
  [0.52, [-0.05, 0.74, 0.62], [-0.3, 0.7, 0]],
  [0.58, [-0.94, 0.9, 0.5], [-1.05, 0.94, 0.05]],
  [0.63, [0.05, 0.72, 0.62], [0.25, 0.7, 0]],
  [0.68, [0.69, 0.36, 0.3], [0.6, 0.305, 0.03]],
  [0.8, [0.625, 0.325, 0.19], [0.6, 0.302, 0.033]],
  [0.84, [0.64, 0.34, 0.26], [0.6, 0.302, 0.03]],
  [0.86, [0.66, 0.35, 0.34], [0.6, 0.3, 0.03]],
  [0.9, [-0.94, 0.92, 0.5], [-1.05, 0.94, 0.05]],
  [1.0, [0.72, 0.2, 3.1], [0.3, 0.25, 0]],
];

const JBOX = V(0.6, 0.3, 0), PANEL = V(-1.05, 0.95, 0), SOCKET = V(0.72, -0.62, 0), SCONCE = V(1.3, 1.12, 0);
const J = { L: V(0.586, 0.316, 0.036), N: V(0.607, 0.319, 0.034), E: V(0.629, 0.311, 0.03) };   // the old twisted joints
const C = { L: V(0.588, 0.302, 0.036), N: V(0.6, 0.302, 0.036), E: V(0.612, 0.302, 0.036) };          // the new lever connectors
const COL = { L: 0x7a4a26, N: 0x1f4fd8, E: 0x3f9a3a, copper: 0xc8763a, conduit: 0x3b8a46, box: 0xd8452c };

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

export function initShort3D(host, labelHost, opts = {}) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); } catch (e) { return null; }
  if (!renderer.getContext()) return null;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  host.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 40);
  const loader = new THREE.TextureLoader();
  const tex = (name, srgb, rx, ry) => { const t = loader.load('tex/' + name + '.jpg', () => dirty = true); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const mats = [];   // materials whose environment light dims with the room
  const M = (o) => { const m = new THREE.MeshStandardMaterial(o); m.userData.env = o.envMapIntensity ?? 1; mats.push(m); return m; };

  // ---- the block wall, as in the photographs of Salah's rough-in work
  const blockMat = M({ map: tex('concrete_block_wall_light_diff', true, 2.2, 1.7), normalMap: tex('concrete_block_wall_nor_gl', false, 2.2, 1.7), roughnessMap: tex('concrete_block_wall_rough', false, 2.2, 1.7), roughness: 1, color: 0xe8e4de });
  const wall = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.7, 0.2), blockMat); wall.position.set(0, 0.25, -0.1); scene.add(wall);

  // ---- the plaster, with the opening cut by hand (ragged, irregular edge)
  const shape = new THREE.Shape(); shape.moveTo(-1.8, -1.1); shape.lineTo(1.8, -1.1); shape.lineTo(1.8, 1.6); shape.lineTo(-1.8, 1.6); shape.closePath();
  const hole = new THREE.Path(), r = rng(7), pts = [];
  const ox0 = -0.42, ox1 = 1.0, oy0 = -0.48, oy1 = 0.86, seg = 64;
  for (let i = 0; i < seg; i++) {
    const t = i / seg, per = 2 * (ox1 - ox0) + 2 * (oy1 - oy0); let d = t * per, x, y;
    if (d < ox1 - ox0) { x = ox0 + d; y = oy0; } else if ((d -= ox1 - ox0) < oy1 - oy0) { x = ox1; y = oy0 + d; }
    else if ((d -= oy1 - oy0) < ox1 - ox0) { x = ox1 - d; y = oy1; } else { d -= ox1 - ox0; x = ox0; y = oy1 - d; }
    const j = (r() - 0.5) * 0.045 + Math.sin(i * 1.7) * 0.012;
    pts.push([x + (x === ox0 ? -j : x === ox1 ? j : 0), y + (y === oy0 ? -j : y === oy1 ? j : 0)]);
  }
  hole.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach((q) => hole.lineTo(q[0], q[1])); hole.closePath(); shape.holes.push(hole);
  const plGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.028, bevelEnabled: false, curveSegments: 4 });
  const plMat = M({ map: tex('white_plaster_02_diff', true, 1.6, 1.3), normalMap: tex('white_plaster_02_nor_gl', false, 1.6, 1.3), roughnessMap: tex('white_plaster_02_rough', false, 1.6, 1.3), color: 0xf3efe8, envMapIntensity: 0.5 });
  plGeo.attributes.uv && (() => { const uv = plGeo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 3.6 + 0.5, uv.getY(i) / 2.7 + 0.4); })();
  const plaster = new THREE.Mesh(plGeo, plMat); scene.add(plaster);

  // ---- floor
  const floorTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#cfc8bd'; g.fillRect(0, 0, w, h); const rr = rng(3); for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${90 + rr() * 60},${80 + rr() * 50},${70 + rr() * 40},${0.08 + rr() * 0.12})`; g.fillRect(rr() * w, rr() * h, 2 + rr() * 3, 2 + rr() * 3); } g.fillStyle = 'rgba(120,110,100,.55)'; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h); });
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(6, 6);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), M({ map: floorTex, roughness: 0.55, envMapIntensity: 0.6 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, -1.05, 2.9); scene.add(floor);
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.07, 0.012), M({ color: 0xcfc8bd, roughness: 0.6 })); skirt.position.set(0, -1.015, 0.034); scene.add(skirt);

  // ---- conduits (corrugated, like the green ones in the photos)
  const ribs = canvasTex(64, 16, (g, w, h) => { for (let x = 0; x < w; x++) { const v = 0.65 + 0.35 * Math.sin(x / w * Math.PI * 2 * 4); g.fillStyle = `rgb(${v * 255},${v * 255},${v * 255})`; g.fillRect(x, 0, 1, h); } }, false);
  ribs.wrapS = ribs.wrapT = THREE.RepeatWrapping;
  function conduit(points, color = COL.conduit, rad = 0.011) {
    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
    const len = curve.getLength(); const bm = ribs.clone(); bm.needsUpdate = true; bm.repeat.set(len * 22, 1);
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.ceil(len * 60), rad, 12, false), M({ color, roughness: 0.45, bumpMap: bm, bumpScale: 0.6, envMapIntensity: 0.7 }));
    scene.add(m); return curve;
  }
  conduit([V(0.72, -0.62, 0.015), V(0.72, -0.2, 0.016), V(0.66, 0.1, 0.016), V(0.6, 0.2, 0.016), V(0.6, 0.255, 0.016)]);
  conduit([V(0.6, 0.345, 0.016), V(0.6, 0.5, 0.016), V(0.45, 0.66, 0.016), V(0.0, 0.7, 0.016), V(-0.6, 0.72, 0.016), V(-1.05, 0.7, 0.016)]);
  conduit([V(0.65, 0.3, 0.016), V(0.8, 0.31, 0.016), V(0.9, 0.5, 0.016), V(0.92, 0.95, 0.016), V(1.3, 1.08, 0.016)], 0xd77a2a, 0.01);
  conduit([V(-0.3, -0.48, 0.016), V(-0.28, 0.2, 0.016), V(-0.2, 0.75, 0.016), V(-0.18, 0.95, 0.016)]);
  conduit([V(0.2, -0.55, 0.016), V(0.25, -0.1, 0.016), V(0.24, 0.6, 0.016), V(0.3, 0.92, 0.016)], 0xd77a2a, 0.01);
  // the other wall boxes of the rough-in, sealed
  [[-0.3, -0.36], [0.24, -0.3]].forEach(([x, y]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.075, 0.045), M({ color: COL.box, roughness: 0.5 })); b.position.set(x, y, 0.022); scene.add(b); });

  // ---- the junction box, open
  const boxMat = M({ color: COL.box, roughness: 0.5, envMapIntensity: 0.6 });
  const jb = new THREE.Group(); jb.position.copy(JBOX); scene.add(jb);
  const wallT = 0.004, bw = 0.1, bh = 0.1, bd = 0.05;
  [[0, 0, -bd / 2 + 0.004, bw, bh, wallT], [-bw / 2, 0, 0, wallT, bh, bd], [bw / 2, 0, 0, wallT, bh, bd], [0, -bh / 2, 0, bw, wallT, bd], [0, bh / 2, 0, bw, wallT, bd]].forEach(([x, y, z, w, h, d]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), boxMat); m.position.set(x, y, z + bd / 2); jb.add(m);
  });
  const soot = new THREE.Mesh(new THREE.CircleGeometry(0.03, 24), new THREE.MeshBasicMaterial({ color: 0x120c08, transparent: true, opacity: 0, depthWrite: false, map: canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }) }));
  soot.position.set(-0.004, 0.02, 0.0065); soot.scale.set(1.3, 1, 1); jb.add(soot);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(0.104, 0.104, 0.006), boxMat);
  scene.add(lid);
  const lidOpen = V(0.77, 0.16, 0.012), lidShut = V(0.6, 0.3, 0.053);

  // wires
  const insul = (c) => M({ color: c, roughness: 0.42, envMapIntensity: 0.8 });
  const copperMat = M({ color: COL.copper, metalness: 1, roughness: 0.32 });
  const eMat = M({ color: COL.E, roughness: 0.42, map: canvasTex(64, 8, (g, w, h) => { for (let x = 0; x < w; x += 16) { g.fillStyle = '#3f9a3a'; g.fillRect(x, 0, 8, h); g.fillStyle = '#e8c82a'; g.fillRect(x + 8, 0, 8, h); } }) });
  eMat.map.wrapS = THREE.RepeatWrapping; eMat.map.repeat.set(30, 1); eMat.color.set(0xffffff);
  const charL = new THREE.Color(0x140e0a);
  const wireMat = { L: insul(COL.L), N: insul(COL.N), E: eMat };
  const charMat = insul(COL.L);   // the brown insulation next to the bad joint, which chars
  const tube = (pts, mat, rad = 0.0021) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, rad, 8, false), mat);
  const off = { L: -0.012, N: 0, E: 0.012 };
  const oldWires = new THREE.Group(), newWires = new THREE.Group(); scene.add(oldWires, newWires);
  const flows = [];   // curves the current indicator runs along
  ['L', 'N', 'E'].forEach((k) => {
    const lo = V(0.6 + off[k], 0.255, 0.016), hi = V(0.6 + off[k] * 0.8, 0.345, 0.016), j = J[k];
    const a = [lo, V(lo.x, 0.27, 0.024), V(lerp(lo.x, j.x, 0.6), j.y - 0.03, 0.034), V(j.x - 0.002, j.y - 0.008, j.z)];
    const b = [hi, V(hi.x, 0.335, 0.026), V(lerp(hi.x, j.x, 0.5), j.y + 0.018, 0.034), V(j.x + 0.002, j.y - 0.002, j.z)];
    if (k === 'L') {
      [a, b].forEach((pts) => { const cv = new THREE.CatmullRomCurve3(pts), q = cv.getPoints(30);
        oldWires.add(tube(q.slice(0, 22), wireMat.L), tube(q.slice(21), charMat)); });
    } else oldWires.add(tube(a, wireMat[k]), tube(b, wireMat[k]));
    if (k === 'L') flows.push(new THREE.CatmullRomCurve3(a), new THREE.CatmullRomCurve3(b.slice().reverse()));
    // the twist and the tape over it
    const tape = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0046, 0.016, 12), k === 'L' ? charMat : M({ color: 0x1b1b1b, roughness: 0.6 }));
    tape.position.copy(j).add(V(0, 0.004, 0.004)); tape.rotation.x = 0.9; oldWires.add(tape);
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.0016, 0.0024, 0.007, 8), copperMat); tip.position.copy(j).add(V(0, 0.0105, 0.0105)); tip.rotation.x = 0.9; oldWires.add(tip);
    // the remade joint: trimmed, stripped to the gauge, into a lever connector each side
    const c = C[k];
    const na = [lo, V(lo.x, 0.268, 0.026), V(c.x, 0.282, 0.034), V(c.x, c.y - 0.011, c.z)];
    const nb = [hi, V(hi.x, 0.336, 0.026), V(c.x, 0.322, 0.034), V(c.x, c.y + 0.011, c.z)];
    newWires.add(tube(na, wireMat[k]), tube(nb, wireMat[k]));
    if (k === 'L') flows.push(new THREE.CatmullRomCurve3(na), new THREE.CatmullRomCurve3(nb.slice().reverse()));
  });
  // lever connectors (clear body, orange levers)
  const connMat = new THREE.MeshPhysicalMaterial({ color: 0xdfe6ea, roughness: 0.15, transmission: 0.6, thickness: 0.004, transparent: true, opacity: 0.85 });
  const leverMat = M({ color: 0xf07b1a, roughness: 0.4 });
  const conns = ['L', 'N', 'E'].map((k) => {
    const g = new THREE.Group(); g.position.copy(C[k]);
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.0085, 0.024, 0.0135), connMat));
    [-0.006, 0.006].forEach((y) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.0022, 0.0095, 0.012), leverMat); l.position.set(0.0052, y, 0); g.add(l); });
    newWires.add(g); return g;
  });

  // ---- socket, plug, heater
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.088, 0.088, 0.01), M({ color: 0xf6f5f1, roughness: 0.35 })); plate.position.set(SOCKET.x, SOCKET.y, 0.033); scene.add(plate);
  const plug = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.046, 0.03), M({ color: 0x2a2a2a, roughness: 0.5 })); plug.position.set(SOCKET.x, SOCKET.y, 0.053); scene.add(plug);
  const cordPts = [V(SOCKET.x, SOCKET.y - 0.022, 0.055), V(SOCKET.x, -0.75, 0.08), V(0.8, -1.0, 0.16), V(0.98, -1.04, 0.25), V(1.06, -1.0, 0.27)];
  scene.add(tube(cordPts, M({ color: 0x232323, roughness: 0.5 }), 0.0035));
  flows.unshift(new THREE.CatmullRomCurve3(cordPts.slice().reverse()));
  const heater = new THREE.Group(); heater.position.set(1.2, -0.9, 0.28); scene.add(heater);
  heater.add(new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.13), M({ color: 0xe9e7e2, roughness: 0.4 })));
  const grilleMat = new THREE.MeshStandardMaterial({ color: 0x2b1a12, emissive: 0xff5a14, emissiveIntensity: 0, roughness: 0.6 });
  for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.016, 0.01), grilleMat); b.position.set(0, -0.07 + i * 0.03, 0.068); heater.add(b); }
  const heatGlow = new THREE.PointLight(0xff6a2a, 0, 0.9, 2); heatGlow.position.set(1.2, -0.88, 0.45); scene.add(heatGlow);

  // ---- the sconce (room light), like the wall lights in Salah's photo
  const sconce = new THREE.Group(); sconce.position.set(SCONCE.x, SCONCE.y, 0.03); scene.add(sconce);
  sconce.add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 32).rotateX(Math.PI / 2), M({ color: 0xf2f0ea, roughness: 0.3 })));
  const lensMat = new THREE.MeshStandardMaterial({ color: 0xfff1d6, emissive: 0xffd9a0, emissiveIntensity: 2.4 });
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.042, 32), lensMat); lens.position.z = 0.026; sconce.add(lens);
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, map: canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 4, 128, 128, 126); gr.addColorStop(0, 'rgba(255,214,150,.55)'); gr.addColorStop(0.35, 'rgba(255,200,130,.16)'); gr.addColorStop(1, 'rgba(255,200,130,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }) }));
  halo.position.set(SCONCE.x, SCONCE.y, 0.031); scene.add(halo);

  // ---- the panel: enclosure, DIN rail, main switch, RCD and six breakers
  const pn = new THREE.Group(); pn.position.copy(PANEL); scene.add(pn);
  const white = M({ color: 0xf4f3ef, roughness: 0.38 });
  const encl = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.3, 0.012), M({ color: 0xe3e1db, roughness: 0.5 })); encl.position.z = 0.012; pn.add(encl);
  [[-0.18, 0, 0.012, 0.3], [0.18, 0, 0.012, 0.3]].forEach(([x, y, w, h]) => { const s = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.07), white); s.position.set(x, y, 0.045); pn.add(s); });
  [[0, 0.15], [0, -0.15]].forEach(([x, y]) => { const s = new THREE.Mesh(new THREE.BoxGeometry(0.372, 0.012, 0.07), white); s.position.set(x, y, 0.045); pn.add(s); });
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.035, 0.008), M({ color: 0xb9bcc0, metalness: 1, roughness: 0.35 })); rail.position.set(0, 0.02, 0.022); pn.add(rail);
  const toggles = [];
  const mods = [{ w: 2, c: 0x2f3338, k: 'main' }, { w: 2, c: 0x1f4fd8, k: 'rcd' }, { w: 1 }, { w: 1 }, { w: 1, k: 'ours' }, { w: 1 }, { w: 1 }, { w: 1 }];
  let mx = -0.162;
  mods.forEach((m) => {
    const w = 0.0315 * m.w; const g = new THREE.Group(); g.position.set(mx + w / 2, 0.02, 0.026); pn.add(g); mx += w + 0.0015;
    const body = new THREE.Mesh(new THREE.BoxGeometry(w - 0.002, 0.09, 0.05), white); body.position.z = 0.025; g.add(body);
    const front = new THREE.Mesh(new THREE.BoxGeometry(w - 0.01, 0.045, 0.012), white); front.position.z = 0.055; g.add(front);
    const piv = new THREE.Group(); piv.position.set(0, 0, 0.061); g.add(piv);
    const tg = new THREE.Mesh(new THREE.BoxGeometry(Math.min(w - 0.014, 0.022), 0.022, 0.012), M({ color: m.c || 0x2a2d31, roughness: 0.4 })); tg.position.set(0, 0.011, 0.005); piv.add(tg);
    piv.rotation.x = -0.6;   // up = on
    const ind = new THREE.Mesh(new THREE.PlaneGeometry(0.006, 0.006), new THREE.MeshBasicMaterial({ color: 0xd42a1e })); ind.position.set(-(w - 0.01) / 2 + 0.006, -0.03, 0.0615); g.add(ind);
    if (m.k === 'rcd') { const tb = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.006, 16).rotateX(Math.PI / 2), M({ color: 0xf2c400 })); tb.position.set(0.02, -0.03, 0.058); g.add(tb); }
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.006, 0.014), M({ color: m.k === 'ours' ? 0xfff6cc : 0xfafafa, roughness: 0.7 })); lab.position.set(0, -0.06, 0.03); lab.rotation.x = -0.2; g.add(lab);
    if (m.k === 'ours') { toggles.ind = ind; toggles.ours = piv; toggles.oursPos = g.position.clone().add(PANEL); }
  });

  // ---- the tester's probes and the headlamp
  const probe = (c) => { const g = new THREE.Group(); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.0034, 0.0034, 0.09, 12), M({ color: c, roughness: 0.4 })); h.position.y = 0.055; g.add(h); const n = new THREE.Mesh(new THREE.CylinderGeometry(0.0009, 0.0012, 0.02, 8), M({ color: 0xd9dde0, metalness: 1, roughness: 0.25 })); n.position.y = -0.002; g.add(n); scene.add(g); return g; };
  const prR = probe(0xc4241c), prB = probe(0x151515);

  // ---- lights
  const hemi = new THREE.HemisphereLight(0xfff4e6, 0x6b6156, 0.9); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff0dc, 1.6); key.position.set(1.5, 2.8, 3); scene.add(key);
  const moon = new THREE.DirectionalLight(0x8aa6d8, 0); moon.position.set(-2, 1.5, 3); scene.add(moon);
  const sconceLight = new THREE.PointLight(0xffd29a, 2.2, 2.6, 1.6); sconceLight.position.set(SCONCE.x, SCONCE.y - 0.05, 0.25); scene.add(sconceLight);
  const jointGlow = new THREE.PointLight(0xff5a1a, 0, 0.16, 2); jointGlow.position.copy(J.L).add(V(0, 0.005, 0.01)); scene.add(jointGlow);
  const arcLight = new THREE.PointLight(0xcfe4ff, 0, 1.2, 2); arcLight.position.copy(J.L).lerp(J.N, 0.5).add(V(0, 0.004, 0.012)); scene.add(arcLight);
  const lamp = new THREE.SpotLight(0xf4f8ff, 0, 3, 0.36, 0.65, 1.4); scene.add(lamp, lamp.target);

  // ---- the arc, sparks and smoke
  const arcMat = new THREE.MeshBasicMaterial({ color: 0xeef6ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  let arcMesh = new THREE.Mesh(new THREE.BufferGeometry(), arcMat); scene.add(arcMesh);
  const dot = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 1, 32, 32, 31); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const arcHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: 0xbfdcff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  arcHalo.position.copy(J.L).lerp(J.N, 0.5).add(V(0, 0.004, 0.012)); arcHalo.scale.setScalar(0.028); scene.add(arcHalo);
  const NS = 70, sr = rng(11), sparkV = Array.from({ length: NS }, () => [(sr() - 0.5) * 0.9, 0.2 + sr() * 0.7, 0.2 + sr() * 0.6, sr() * 0.4]);
  const sparkGeo = new THREE.BufferGeometry(); sparkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NS * 3), 3));
  const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({ map: dot, color: 0xffb547, size: 0.006, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  sparks.frustumCulled = false; scene.add(sparks);
  const smokeTex = canvasTex(128, 128, (g) => { const rr = rng(5); for (let i = 0; i < 18; i++) { const x = 30 + rr() * 68, y = 30 + rr() * 68, rad = 14 + rr() * 26; const gr = g.createRadialGradient(x, y, 1, x, y, rad); gr.addColorStop(0, 'rgba(255,255,255,.22)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); } });
  const smoke = Array.from({ length: 14 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: 0x9d9790, transparent: true, depthWrite: false, opacity: 0 })); s.userData.o = i / 14; scene.add(s); return s; });
  // the current indicator: small bright beads running along the live conductor, speed follows the load
  const beads = Array.from({ length: 14 }, (_, i) => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.0026, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0 })); b.userData.o = i / 14; scene.add(b); return b; });

  // ---- labels projected from the scene
  const LBL = [
    ['heater', V(1.2, -0.72, 0.3), [0.06, 0.2], '<span lang="he">תנור, 2,000 וואט</span><span lang="en">Heater, 2,000 W</span>'],
    ['plug', V(0.74, -0.58, 0.07), [0.08, 0.2], '<span lang="he">שקע בסלון</span><span lang="en">Living-room socket</span>'],
    ['joint', J.L.clone().add(V(-0.012, 0.012, 0.01)), [0.22, 0.43], '<span lang="he">חיבור שזור ומבודד בסלוטייפ</span><span lang="en">Twisted joint, taped over</span>'],
    ['breaker', V(0, 0, 0), [0.53, 0.64], '<span lang="he">המפסק של השקעים קפץ</span><span lang="en">The sockets breaker tripped</span>'],
    ['conn', C.E.clone().add(V(0.01, -0.01, 0.004)), [0.77, 0.84], '<span lang="he">מחברי מנוף חדשים</span><span lang="en">New lever connectors</span>'],
    ['breaker2', V(0, 0, 0), [0.905, 0.95], '<span lang="he">מרימים את המפסק</span><span lang="en">Breaker back up</span>'],
  ];
  const lEls = LBL.map((l) => { const e = document.createElement('span'); e.className = 'l3d l3d-' + l[0]; e.innerHTML = l[3]; e.style.opacity = '0'; labelHost.appendChild(e); return e; });

  // ---- state
  let P = 0, last = 0, lastSet = performance.now(), dirty = true, running = true, visible = true, raf = 0, t0 = performance.now();
  const calm = opts.calm || (() => false);
  const tmpP = V(0, 0, 0), tmpT = V(0, 0, 0);
  function camAt(p) {
    let i = 0; while (i < KEYS.length - 2 && p > KEYS[i + 1][0]) i++;
    const a = KEYS[i], b = KEYS[i + 1], t = smooth(span(p, a[0], b[0]));
    tmpP.set(lerp(a[1][0], b[1][0], t), lerp(a[1][1], b[1][1], t), lerp(a[1][2], b[1][2], t));
    tmpT.set(lerp(a[2][0], b[2][0], t), lerp(a[2][1], b[2][1], t), lerp(a[2][2], b[2][2], t));
  }
  function resize() {
    const w = host.clientWidth || 1, h = host.clientHeight || 1; renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the horizontal view on narrow screens (portrait phones)
    const hf = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(40) / 2) * Math.max(1, 1.25));
    camera.fov = camera.aspect >= 1.2 ? 40 : Math.min(72, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(hf / 2) / camera.aspect)) * 0.82);
    camera.updateProjectionMatrix(); dirty = true;
  }
  addEventListener('resize', resize); resize();

  function frame(now) {
    const p = P, time = Math.max(0, (now - t0) / 1000), still = calm();
    camAt(p);
    // portrait: back the camera off a little along its view line so wide shots keep the whole wall
    if (camera.aspect < 1) { const d = tmpP.clone().sub(tmpT); tmpP.copy(tmpT).add(d.multiplyScalar(1 + (1 - camera.aspect) * 0.35)); }
    camera.position.copy(tmpP); camera.lookAt(tmpT);
    const load = T.load(p), heat = T.heat(p), ch = T.char(p), light = T.light(p), head = T.head(p), cut = T.cut(p);
    // room light and dark
    hemi.intensity = lerp(0.07, 0.9, light); key.intensity = lerp(0, 1.6, light); moon.intensity = lerp(0.35, 0, light);
    sconceLight.intensity = 2.2 * light; lensMat.emissiveIntensity = 2.4 * light; halo.material.opacity = light; lensMat.color.set(light > 0.5 ? 0xfff1d6 : 0xd9d6cf);
    mats.forEach((m) => { m.envMapIntensity = m.userData.env * lerp(0.08, 1, light); });
    // heater
    grilleMat.emissiveIntensity = 1.6 * load; heatGlow.intensity = 0.5 * load;
    // the bad joint: glows with heat, chars, then cools
    jointGlow.intensity = 0.12 * heat * heat * (cut ? 0 : 1);
    charMat.color.set(COL.L).lerp(charL, ch * 0.92);
    charMat.emissive = charMat.emissive || new THREE.Color(); charMat.emissive.setRGB(0.9 * heat * heat, 0.22 * heat * heat, 0.02 * heat); charMat.emissiveIntensity = cut ? 0 : 0.9;
    soot.material.opacity = 0.75 * span(p, 0.41, 0.43) * (1 - 0.6 * T.lid(p));
    oldWires.visible = !cut; newWires.visible = cut;
    const cn = T.conn(p);
    conns.forEach((g, i) => { const k = clamp(cn * 1.4 - i * 0.2); g.position.copy(C[['L', 'N', 'E'][i]]).add(V(0, 0, 0.05 * (1 - k))); g.scale.setScalar(0.6 + 0.4 * k); g.children[1].rotation.y = g.children[2].rotation.y = k < 0.95 ? 0.9 : 0; });
    // lid
    const lt = T.lid(p); lid.position.copy(lidOpen).lerp(lidShut, lt); lid.rotation.set(0, 0, lerp(0.28, 0, lt));
    // the arc: a jagged path between live and neutral, re-drawn each frame while it lasts
    const arcOn = T.arc(p) && !cut;
    arcMat.opacity = arcOn ? 1 : 0; arcHalo.material.opacity = arcOn ? 0.85 + 0.15 * Math.sin(time * 61) : 0; arcLight.intensity = arcOn ? 0.5 + 0.6 * Math.abs(Math.sin(time * 47)) : 0;
    if (arcOn) {
      const a = J.L.clone().add(V(0.003, 0.004, 0.008)), b = J.N.clone().add(V(-0.003, 0.004, 0.008)), rr = rng(Math.floor(time * 30) + Math.floor(p * 4000)), q = [];
      for (let i = 0; i < 9; i++) { const v = a.clone().lerp(b, i / 8); if (i && i < 8) v.add(V(0, (rr() - 0.5) * 0.008, (rr() - 0.5) * 0.006)); q.push(v); }
      arcMesh.geometry.dispose(); arcMesh.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(q, false, 'chordal'), 24, 0.0009, 5, false);
    }
    // sparks: thrown from the arc, fall under gravity and fade (a function of scroll, so it reverses)
    const sp = sparkGeo.attributes.position, st = (p - 0.405) * 9;   // ~ seconds after the arc
    sparks.material.opacity = st > 0 && st < 0.9 && !cut ? 1 - st / 0.9 : 0;
    for (let i = 0; i < NS; i++) {
      const v = sparkV[i], t = Math.max(0, st - v[3] * 0.25);
      sp.setXYZ(i, arcLight.position.x + v[0] * 0.18 * t, arcLight.position.y + v[1] * 0.16 * t - 0.5 * 1.4 * t * t, arcLight.position.z + v[2] * 0.14 * t);
    }
    sp.needsUpdate = true;
    // smoke from the hot insulation; it thins out after the trip
    const smokeAmt = cut ? 0 : clamp(span(p, 0.28, 0.4) * (p < 0.44 ? 1 : 1 - span(p, 0.44, 0.62)));
    smoke.forEach((s) => { const k = ((still ? 0.5 : time * 0.16) + s.userData.o) % 1; s.position.set(J.L.x + Math.sin(k * 9 + s.userData.o * 20) * 0.01 + k * 0.02, J.L.y + 0.01 + k * 0.14, J.L.z + 0.01 + k * 0.03); s.scale.setScalar(0.02 + k * 0.08); s.material.opacity = smokeAmt * 0.55 * Math.sin(k * Math.PI); });
    // current beads along the cord and the live conductor
    const I = load; const speed = still ? 0 : 0.35;
    beads.forEach((b, i) => {
      const c = flows[0], u = ((time * speed) + b.userData.o) % 1;
      c.getPointAt(u, b.position); b.material.opacity = I * 0.9 * (still ? 0 : 1);
    });
    // the breaker
    const tr = T.tripped(p); toggles.ours.rotation.x = tr ? 0.75 : -0.6; toggles.ind.material.color.set(tr ? 0x2f9e44 : 0xd42a1e);
    // the headlamp, carried at the camera
    lamp.intensity = 3.6 * head; lamp.position.copy(camera.position).add(V(0.04, 0.08, 0)); lamp.target.position.copy(tmpT);
    // probes
    const pa = T.probeA(p) && !cut, pb = T.probeB(p);
    prR.visible = prB.visible = !!(pa || pb);
    if (pa) { prR.position.copy(J.L).add(V(-0.004, 0.012, 0.012)); prB.position.copy(J.N).add(V(0.004, 0.012, 0.012)); }
    if (pb) { prR.position.copy(C.L).add(V(0, 0.013, 0.007)); prB.position.copy(C.N).add(V(0, 0.013, 0.007)); }
    prR.rotation.set(0.7, 0, 0.35); prB.rotation.set(0.7, 0, -0.35);
    renderer.render(scene, camera);
    // labels
    const w = host.clientWidth, h = host.clientHeight;
    LBL.forEach((l, i) => {
      const e = lEls[i], on = p >= l[2][0] && p < l[2][1];
      const wp = l[0].startsWith('breaker') ? toggles.oursPos.clone().add(V(0, -0.075, 0.06)) : l[1];
      const s = wp.clone().project(camera);
      const ok = on && s.z < 1 && s.x > -0.95 && s.x < 0.95 && s.y > -0.95 && s.y < 0.95;
      e.style.opacity = ok ? '1' : '0';
      if (ok) {
        // keep the label on screen: RTL labels hang to the left of their point, LTR ones to the right
        const lw = e.offsetWidth + 12, rtl = document.documentElement.dir === 'rtl';
        let x = (s.x + 1) / 2 * w; x = rtl ? Math.max(lw + 8, x) : Math.min(w - lw - 8, x);
        e.style.transform = `translate(${x.toFixed(1)}px, ${((1 - s.y) / 2 * h).toFixed(1)}px)`;
      }
    });
    dirty = false;
  }
  function loop(now) {
    raf = 0; if (!running || !visible) return;
    // the live details (current, smoke) run while the visitor scrolls, and settle 5 s after they stop
    const animating = !calm() && now - lastSet < 5000 && (T.load(P) > 0 || T.arc(P) || (P > 0.28 && P < 0.62));
    if (dirty || (animating && now - last > 32)) { last = now; frame(now); }
    raf = requestAnimationFrame(loop);
  }
  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); });
  io.observe(host);
  raf = requestAnimationFrame(loop);
  return {
    set(p) { if (clamp(p) !== P) lastSet = performance.now(); P = clamp(p); dirty = true; if (!raf && running) raf = requestAnimationFrame(loop); },
    pause() { running = false; cancelAnimationFrame(raf); raf = 0; renderer.domElement.style.visibility = 'hidden'; },
    resume() { running = true; renderer.domElement.style.visibility = 'visible'; dirty = true; if (!raf) raf = requestAnimationFrame(loop); },
    render() { frame(performance.now()); },
  };
}
