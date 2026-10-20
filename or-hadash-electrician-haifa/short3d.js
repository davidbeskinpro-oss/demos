// A 3D cutaway of a living-room wall on one night. A heater and a floor lamp share a double socket; the cable
// runs up a conduit to a junction box where one joint was only twisted and taped. Under load the loose joint
// heats, the tape chars, live touches neutral and arcs, the sockets breaker in the panel trips and the room goes
// dark. Then the electrician isolates, insulation-tests the circuit at the panel (0.00 MΩ), opens the box, cuts
// the burnt joint out, remakes it in lever connectors, re-tests (>999 MΩ), closes up and resets the breaker.
// Scroll (0..1) drives everything; the camera follows the current and the fault. Textures: Poly Haven (CC0).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const span = (p, a, b) => clamp((p - a) / (b - a));
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// the shared timeline: the page reads the same numbers for its readouts (keep in step with index.html)
export const T = {
  load: (p) => (p < 0.395 ? span(p, 0.015, 0.05) : p < 0.925 ? 0 : span(p, 0.925, 0.95)),
  heat: (p) => (p < 0.395 ? smooth(span(p, 0.11, 0.33)) : p < 0.745 ? 1 - 0.92 * smooth(span(p, 0.395, 0.66)) : 0),
  char: (p) => (p < 0.745 ? smooth(span(p, 0.2, 0.37)) : 0),
  arc: (p) => p >= 0.335 && p < 0.395,
  tripped: (p) => p >= 0.395 && p < 0.925,
  light: (p) => (p < 0.395 ? 1 : p < 0.925 ? 0 : smooth(span(p, 0.925, 0.955))),
  head: (p) => (p < 0.565 ? 0 : p < 0.92 ? span(p, 0.565, 0.585) : 1 - span(p, 0.92, 0.94)),
  cover: (p) => (p < 0.57 ? 0 : p < 0.89 ? smooth(span(p, 0.57, 0.6)) : 1 - smooth(span(p, 0.895, 0.918))),
  probeA: (p) => p >= 0.605 && p < 0.655,
  ghost: (p) => p < 0.665,
  lid: (p) => (p < 0.665 ? 0 : p < 0.85 ? smooth(span(p, 0.67, 0.705)) : 1 - smooth(span(p, 0.852, 0.878))),
  cutters: (p) => (p >= 0.722 && p < 0.752 ? 1 : 0),
  cut: (p) => p >= 0.738,
  conn: (p) => smooth(span(p, 0.755, 0.805)),
  probeB: (p) => p >= 0.815 && p < 0.848,
};

// camera keyframes: [p, position, target]; it follows the current up the conduit, the fault back to the panel,
// the electrician back to the box, and then pulls out to the lit room
const KEYS = [
  [0.0, [0.35, 0.05, 3.35], [0.12, 0.12, 0]],
  [0.06, [0.68, -0.36, 0.78], [0.76, -0.78, 0.06]],
  [0.12, [0.95, 0.15, 0.75], [0.66, 0.35, 0.01]],
  [0.2, [0.675, 0.955, 0.3], [0.62, 0.92, 0.012]],
  [0.29, [0.64, 0.95, 0.2], [0.614, 0.922, 0.016]],
  [0.37, [0.632, 0.945, 0.18], [0.611, 0.924, 0.016]],
  [0.415, [0.52, 1.08, 0.42], [0.3, 1.11, 0.01]],
  [0.45, [-0.25, 1.1, 0.5], [-0.62, 1.1, 0.01]],
  [0.49, [-0.74, 0.74, 0.55], [-0.9, 0.52, 0.06]],
  [0.53, [-0.87, 0.35, 0.33], [-0.93, 0.32, 0.09]],
  [0.6, [-0.86, 0.29, 0.38], [-0.935, 0.27, 0.08]],
  [0.655, [-0.88, 0.3, 0.4], [-0.94, 0.28, 0.08]],
  [0.672, [-0.55, 1.1, 0.5], [-0.15, 1.11, 0.01]],
  [0.695, [0.25, 1.1, 0.48], [0.55, 1.02, 0.01]],
  [0.725, [0.645, 0.955, 0.24], [0.618, 0.922, 0.012]],
  [0.79, [0.64, 0.95, 0.2], [0.618, 0.912, 0.014]],
  [0.86, [0.66, 0.96, 0.27], [0.62, 0.92, 0.01]],
  [0.875, [0.3, 1.1, 0.5], [0.0, 1.11, 0.01]],
  [0.89, [-0.5, 1.1, 0.5], [-0.85, 0.9, 0.02]],
  [0.91, [-0.85, 0.36, 0.38], [-0.93, 0.32, 0.09]],
  [0.945, [-0.855, 0.36, 0.37], [-0.93, 0.32, 0.09]],
  [0.975, [0.4, 0.0, 3.25], [0.15, 0.08, 0]],
  [1.0, [0.4, 0.0, 3.25], [0.15, 0.08, 0]],
];

const FLOOR = -1.05;
const JBOX = V(0.62, 0.92, 0), PANEL = V(-0.95, 0.4, 0), SOCKET = V(0.72, -0.72, 0);
const J = { L: V(0.6, 0.925, 0.018), N: V(0.62, 0.928, 0.018), E: V(0.64, 0.922, 0.018) };   // the old twisted joints
const C = { L: V(0.601, 0.913, 0.017), N: V(0.62, 0.913, 0.017), E: V(0.639, 0.913, 0.017) }; // the new lever connectors
const COL = { L: 0x553018, N: 0x1d4fd0, conduit: 0x2f8a45, conduitO: 0xd8742a, box: 0xc4442e };
const MOD = 0.018;   // one DIN module, 18 mm

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  t.userData.redraw = () => { draw(c.getContext('2d'), w, h); t.needsUpdate = true; };
  return t;
}
const FONT = '"Noto Sans Hebrew", "Arial Hebrew", Arial, sans-serif';

export function initShort3D(host, labelHost, opts = {}) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); } catch (e) { return null; }
  if (!renderer.getContext()) return null;
  const small = matchMedia('(max-width: 900px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = false;
  host.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0c0f);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(40, 1, 0.005, 40);
  const loader = new THREE.TextureLoader();
  const texCache = {};
  const tex = (name, srgb, rx, ry) => {
    const t = loader.load('tex/' + name + '.jpg', () => { dirty = true; });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; texCache[name] = t; return t;
  };
  const mats = [];   // materials whose environment light dims with the room
  const M = (o, Kind = THREE.MeshStandardMaterial) => { const m = new Kind(o); m.userData.env = o.envMapIntensity ?? 1; mats.push(m); return m; };
  const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 1e-5, h / 2 - 1e-5, d / 2 - 1e-5)), mat);
  const add = (parent, m, x = 0, y = 0, z = 0) => { m.position.set(x, y, z); parent.add(m); return m; };

  // ---------------------------------------------------------------- the block wall (as in Saleh's rough-in photos)
  const blockMat = M({ map: tex('concrete_block_wall_light_diff', true, 2.6, 2.0), normalMap: tex('concrete_block_wall_nor', false, 2.6, 2.0), roughnessMap: tex('concrete_block_wall_rough', false, 2.6, 2.0), normalScale: new THREE.Vector2(1.1, 1.1), roughness: 1, color: 0xe2ddd5 });
  add(scene, new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.75, 0.2), blockMat), 0, 0.27, -0.1);

  // ---------------------------------------------------------------- the plaster, with the chase cut open by hand
  const ragged = (poly, seed) => {
    const r = rng(seed), out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(len / 0.035));
      const nx = -(b[1] - a[1]) / len, ny = (b[0] - a[0]) / len;
      for (let k = 0; k < n; k++) {
        const t = k / n, j = k === 0 ? 0 : (r() - 0.5) * 0.03 + Math.sin((i * 7 + k) * 1.9) * 0.007;
        out.push([lerp(a[0], b[0], t) + nx * j, lerp(a[1], b[1], t) + ny * j]);
      }
    }
    return out;
  };
  const shape = new THREE.Shape(); shape.moveTo(-1.9, FLOOR); shape.lineTo(1.9, FLOOR); shape.lineTo(1.9, 1.64); shape.lineTo(-1.9, 1.64); shape.closePath();
  const holePts = ragged([[0.42, -0.6], [0.42, 0.97], [-0.8, 0.97], [-0.8, 0.63], [-1.0, 0.63], [-1.0, 1.24], [0.93, 1.24], [0.93, -0.6]], 7);
  const hole = new THREE.Path(); hole.moveTo(...holePts[0]); holePts.slice(1).forEach((q) => hole.lineTo(...q)); hole.closePath(); shape.holes.push(hole);
  const plGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.025, bevelEnabled: false, curveSegments: 2 });
  { const uv = plGeo.attributes.uv, pos = plGeo.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / 1.3, pos.getY(i) / 1.3 + pos.getZ(i) * 2); }
  const plMat = M({ map: tex('plastered_wall_diff', true, 1, 1), normalMap: tex('plastered_wall_nor', false, 1, 1), roughnessMap: tex('plastered_wall_rough', false, 1, 1), normalScale: new THREE.Vector2(0.6, 0.6), color: 0xf1ede6, envMapIntensity: 0.55 });
  add(scene, new THREE.Mesh(plGeo, plMat));

  // ---------------------------------------------------------------- floor: large porcelain tiles, and the skirting
  const floorTex = canvasTex(1024, 1024, (g, w, h) => {
    const rr = rng(3); g.fillStyle = '#c9c2b6'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { const v = 150 + rr() * 70; g.fillStyle = `rgba(${v},${v - 8},${v - 18},${0.05 + rr() * 0.08})`; g.fillRect(rr() * w, rr() * h, 1 + rr() * 4, 1 + rr() * 4); }
    g.fillStyle = '#8f877c'; g.fillRect(0, 0, w, 4); g.fillRect(0, 0, 4, h); g.fillRect(0, h / 2, w, 3); g.fillRect(w / 2, 0, 3, h);
  });
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(3.2, 3.2);
  const floor = add(scene, new THREE.Mesh(new THREE.PlaneGeometry(6, 6), M({ map: floorTex, roughness: 0.28, envMapIntensity: 0.7 })), 0, FLOOR, 3);
  floor.rotation.x = -Math.PI / 2;
  add(scene, rbox(3.8, 0.08, 0.012, 0.003, M({ color: 0xbdb5a9, roughness: 0.35 })), 0, FLOOR + 0.04, 0.031);

  // ---------------------------------------------------------------- conduits (corrugated, green as in the photos)
  const ribs = canvasTex(64, 8, (g, w, h) => { for (let x = 0; x < w; x++) { const v = 0.5 + 0.5 * Math.sin((x / w) * Math.PI * 2 * 4); g.fillStyle = `rgb(${v * 255},${v * 255},${v * 255})`; g.fillRect(x, 0, 1, h); } }, false);
  ribs.wrapS = ribs.wrapT = THREE.RepeatWrapping;
  const curves = {};
  function conduit(name, points, color = COL.conduit, rad = 0.0105) {
    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.2);
    const len = curve.getLength(), bm = ribs.clone(); bm.needsUpdate = true; bm.repeat.set(len * 260, 1);
    add(scene, new THREE.Mesh(new THREE.TubeGeometry(curve, Math.ceil(len * 90), rad, 14, false), M({ color, roughness: 0.42, bumpMap: bm, bumpScale: 0.9, envMapIntensity: 0.75 })));
    if (name) curves[name] = curve; return curve;
  }
  const Z = 0.012;
  conduit('up', [V(0.72, -0.68, Z), V(0.72, -0.4, Z), V(0.69, 0.2, Z), V(0.63, 0.7, Z), V(0.62, 0.862, Z)]);
  conduit('panel', [V(0.6, 0.978, Z), V(0.6, 1.06, Z), V(0.5, 1.11, Z), V(0.0, 1.12, Z), V(-0.75, 1.12, Z), V(-0.88, 1.06, Z), V(-0.89, 0.8, Z), V(-0.89, 0.64, Z)]);
  conduit(null, [V(0.672, 0.92, Z), V(0.75, 0.93, Z), V(0.86, 1.02, Z), V(0.9, 1.3, Z)], COL.conduitO, 0.0095);
  conduit(null, [V(-0.3, 0.97, Z), V(-0.31, 1.3, Z)], COL.conduit, 0.0095);
  conduit(null, [V(0.2, 0.97, Z), V(0.22, 1.3, Z)], COL.conduitO, 0.0095);
  conduit(null, [V(-0.62, 0.97, Z), V(-0.6, 1.3, Z)], COL.conduitO, 0.0095);

  // ---------------------------------------------------------------- the junction box, recessed in the wall
  const boxMat = M({ color: COL.box, roughness: 0.62, envMapIntensity: 0.5 });
  const jb = new THREE.Group(); jb.position.copy(JBOX); scene.add(jb);
  const bw = 0.105, bd = 0.05, wt = 0.004;
  add(jb, rbox(bw, bw, wt, 0.0015, M({ color: 0x9c3020, roughness: 0.6, envMapIntensity: 0.35 })), 0, 0, -0.023);
  [[-1, 0], [1, 0]].forEach(([sx]) => add(jb, rbox(wt, bw, bd, 0.0015, boxMat), sx * (bw / 2 - wt / 2), 0, 0));
  [[-1], [1]].forEach(([sy]) => add(jb, rbox(bw, wt, bd, 0.0015, boxMat), 0, sy * (bw / 2 - wt / 2), 0));
  // screw bosses in the corners and the conduit collars
  [[-1, -1], [1, 1]].forEach(([sx, sy]) => add(jb, new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, bd - 0.006, 14).rotateX(Math.PI / 2), boxMat), sx * 0.041, sy * 0.041, 0.0));
  const sootMat = new THREE.MeshBasicMaterial({ color: 0x0d0906, transparent: true, opacity: 0, depthWrite: false, map: canvasTex(128, 128, (g) => { const rr = rng(9); for (let i = 0; i < 26; i++) { const x = 40 + rr() * 48, y = 44 + rr() * 50, rad = 8 + rr() * 30; const gr = g.createRadialGradient(x, y, 1, x, y, rad); gr.addColorStop(0, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); } }) });
  add(jb, new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.08), sootMat), -0.004, 0.012, -0.0205);
  // the lid: a ghost in the cutaway, solid once the electrician is at the box
  const lidMat = M({ color: COL.box, roughness: 0.45, transparent: true, opacity: 0.1, depthWrite: false });
  const lid = new THREE.Group(); scene.add(lid);
  add(lid, rbox(0.112, 0.112, 0.005, 0.002, lidMat));
  [[-1, -1], [1, 1]].forEach(([sx, sy]) => add(lid, new THREE.Mesh(new THREE.CylinderGeometry(0.0028, 0.0028, 0.002, 16).rotateX(Math.PI / 2), M({ color: 0xb8bcc0, metalness: 1, roughness: 0.3 })), sx * 0.041, sy * 0.041, 0.0032));
  const lidShut = V(JBOX.x, JBOX.y, 0.028), lidOff = V(JBOX.x + 0.16, JBOX.y - 0.13, 0.11);

  // ---------------------------------------------------------------- wires and the bad joint
  const insul = (c) => M({ color: c, roughness: 0.46, envMapIntensity: 0.7 });
  const copper = M({ color: 0xd07a45, metalness: 1, roughness: 0.28 });
  const copperHot = M({ color: 0xd07a45, metalness: 1, roughness: 0.3 });
  const earthTex = canvasTex(128, 8, (g, w, h) => { for (let x = 0; x < w; x += 32) { g.fillStyle = '#2f8f3a'; g.fillRect(x, 0, 16, h); g.fillStyle = '#e3c22b'; g.fillRect(x + 16, 0, 16, h); } });
  earthTex.wrapS = THREE.RepeatWrapping; earthTex.repeat.set(26, 1);
  const wireMat = { L: insul(COL.L), N: insul(COL.N), E: M({ map: earthTex, roughness: 0.38 }) };
  const charMat = insul(COL.L); charMat.emissive = new THREE.Color(0, 0, 0);
  const tapeTex = canvasTex(64, 128, (g, w, h) => { g.fillStyle = '#1a1a1b'; g.fillRect(0, 0, w, h); for (let y = -h; y < h * 2; y += 18) { g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + 22); g.stroke(); } });
  const tapeMat = M({ map: tapeTex, roughness: 0.32, envMapIntensity: 0.9 });
  const tapeMatL = M({ map: tapeTex, roughness: 0.32, envMapIntensity: 0.9 }); tapeMatL.emissive = new THREE.Color(0, 0, 0);
  const tube = (pts, mat, rad = 0.0021, seg = 40) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), seg, rad, 10, false), mat);
  const off = { L: -0.02, N: 0, E: 0.02 };
  const oldWires = new THREE.Group(), newWires = new THREE.Group(), cutPiece = new THREE.Group(); scene.add(oldWires, newWires, cutPiece);
  const flows = {};   // curves the current runs along
  const up = V(0, 0.55, 0.835).normalize();
  ['L', 'N', 'E'].forEach((k) => {
    const lo = V(0.62 + off[k] * 0.45, 0.866, Z), hi = V(0.6 + off[k] * 0.45, 0.975, Z), j = J[k];
    const base = j.clone().addScaledVector(up, -0.006);
    // supply (from the panel, comes down from the top conduit) and load (to the socket, comes up from below)
    // a pigtail: both wires come to the twist from below (the supply loops down beside it first)
    const sup = [hi, V(hi.x - 0.007, 0.95, 0.005), V(j.x - 0.009, 0.915, 0.008), V(j.x - 0.003, 0.904, 0.011), base.clone().add(V(-0.0012, -0.0015, 0))];
    const lod = [lo, V(lo.x, 0.884, 0.006), V(j.x + 0.004, 0.902, 0.011), base.clone().add(V(0.0012, -0.0015, 0))];
    if (k === 'L') {
      // the last few centimetres of the brown insulation next to the joint are the part that chars
      [sup, lod].forEach((pts) => { const q = new THREE.CatmullRomCurve3(pts, false, 'centripetal').getPoints(40); oldWires.add(tube(q.slice(0, 28), wireMat.L), tube(q.slice(27), charMat)); });
      flows.supOld = new THREE.CatmullRomCurve3(sup); flows.lodOld = new THREE.CatmullRomCurve3(lod);
    } else oldWires.add(tube(sup, wireMat[k]), tube(lod, wireMat[k]));
    // the twist: two copper strands wound round each other, pointing out of the box
    const piece = cutPiece;
    const side = V(1, 0, 0).cross(up).normalize(), side2 = up.clone().cross(side).normalize();
    for (let s = 0; s < 2; s++) {
      const pts = [];
      for (let i = 0; i <= 26; i++) { const t = i / 26, a = t * Math.PI * 2 * 3.2 + s * Math.PI; pts.push(base.clone().addScaledVector(up, -0.002 + t * 0.0205).addScaledVector(side, Math.cos(a) * 0.0011).addScaledVector(side2, Math.sin(a) * 0.0011)); }
      piece.add(tube(pts, k === 'L' ? copperHot : copper, 0.0007, 60));
    }
    // the tape, wound unevenly over the twist (thicker in the middle, a loose tail)
    const prof = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; prof.push(new THREE.Vector2(0.0024 + 0.0007 * Math.sin(t * Math.PI) + (i % 3 === 0 ? 0.00018 : 0), t * 0.015)); }
    const tape = new THREE.Mesh(new THREE.LatheGeometry(prof, 18), k === 'L' ? tapeMatL : tapeMat);
    tape.position.copy(base).addScaledVector(up, -0.001); tape.quaternion.setFromUnitVectors(V(0, 1, 0), up); piece.add(tape);
    if (k === 'L') { const sup2 = new THREE.CatmullRomCurve3(sup).getPoints(40).slice(27), lod2 = new THREE.CatmullRomCurve3(lod).getPoints(40).slice(27); cutPiece.add(tube(sup2, charMat), tube(lod2, charMat)); }

    // the remade joint: trimmed back, stripped to the gauge, both ends into one lever connector
    const c = C[k];
    const nsup = [hi, V(hi.x, 0.955, 0.006), V(c.x + 0.012 * Math.sign(off[k] || 1), 0.92, 0.014), V(c.x + 0.0075 * Math.sign(off[k] || 1), 0.888, 0.016), V(c.x - 0.003, 0.893, 0.017), V(c.x - 0.003, 0.9, 0.017)];
    const nlod = [lo, V(lo.x, 0.878, 0.008), V(c.x + 0.003, 0.892, 0.017), V(c.x + 0.003, 0.9, 0.017)];
    newWires.add(tube(nsup, wireMat[k], 0.0021, 60), tube(nlod, wireMat[k]));
    if (k === 'L') { flows.supNew = new THREE.CatmullRomCurve3(nsup); flows.lodNew = new THREE.CatmullRomCurve3(nlod); }
  });
  const cutPieceHome = cutPiece.position.clone();

  // lever connectors: clear body, orange levers, stripped copper visible inside
  const clearMat = new THREE.MeshPhysicalMaterial({ color: 0xe9eef0, roughness: 0.12, transmission: 0.55, thickness: 0.004, transparent: true, opacity: 0.6, envMapIntensity: 1.2 });
  const leverMat = M({ color: 0xf07818, roughness: 0.42 });
  const conns = ['L', 'N', 'E'].map((k) => {
    const g = new THREE.Group(); g.position.copy(C[k]);
    add(g, rbox(0.0131, 0.0186, 0.0082, 0.0012, clearMat));
    [-0.003, 0.003].forEach((x) => add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.0009, 0.0009, 0.011, 8), copper), x, -0.003, 0));
    const levers = [-0.003, 0.003].map((x) => { const piv = new THREE.Group(); piv.position.set(x, -0.009, 0.0041); g.add(piv); add(piv, rbox(0.0052, 0.016, 0.0024, 0.0008, leverMat), 0, 0.008, 0.0012); return piv; });
    g.userData.levers = levers; newWires.add(g); return g;
  });

  // side cutters, which snap the burnt joint off
  const cutters = new THREE.Group(); scene.add(cutters);
  const steel = M({ color: 0x9aa0a6, metalness: 1, roughness: 0.32 }), grip = M({ color: 0xc8302a, roughness: 0.55 });
  const jaws = [-1, 1].map((s) => { const piv = new THREE.Group(); cutters.add(piv); add(piv, rbox(0.012, 0.004, 0.003, 0.001, steel), 0.006, 0, 0); const h = add(piv, rbox(0.06, 0.007, 0.006, 0.0025, grip), -0.034, -0.004 * s, 0); h.rotation.z = -0.1 * s; return piv; });

  // ---------------------------------------------------------------- the double socket, the plugs, the heater and the floor lamp
  const sock = new THREE.Group(); sock.position.set(SOCKET.x, SOCKET.y, 0.025); scene.add(sock);
  const white = M({ color: 0xf2f1ec, roughness: 0.32 });
  add(sock, rbox(0.155, 0.085, 0.01, 0.006, white), 0, 0, 0.005);
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
  [-0.036, 0.036].forEach((x) => {
    add(sock, new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.004, 32).rotateX(Math.PI / 2), white), x, 0, 0.011);
    // Israeli type H: three slanted flat pins
    [[-0.007, 0.004, 0.45], [0.007, 0.004, -0.45], [0, -0.009, 0]].forEach(([hx, hy, rz]) => { const m = add(sock, new THREE.Mesh(new THREE.PlaneGeometry(0.0022, 0.0075), holeMat), x + hx, hy, 0.0131); m.rotation.z = rz; });
  });
  const plugMat = M({ color: 0x2a2b2e, roughness: 0.5 }), plugW = M({ color: 0xe9e7e1, roughness: 0.45 });
  add(sock, rbox(0.034, 0.042, 0.03, 0.006, plugMat), 0.036, 0, 0.028);     // heater plug
  add(sock, rbox(0.03, 0.036, 0.026, 0.006, plugW), -0.036, 0, 0.026);      // lamp plug
  const cordH = [V(SOCKET.x + 0.036, SOCKET.y - 0.022, 0.06), V(SOCKET.x + 0.04, -0.86, 0.09), V(0.8, -1.03, 0.16), V(0.84, -1.045, 0.26), V(0.88, -1.0, 0.31)];
  scene.add(tube(cordH, M({ color: 0x242424, roughness: 0.5 }), 0.0034, 60));
  const cordL = [V(SOCKET.x - 0.036, SOCKET.y - 0.02, 0.055), V(SOCKET.x - 0.03, -0.92, 0.07), V(0.8, -1.045, 0.08), V(1.3, -1.045, 0.1), V(1.4, -1.045, 0.24), V(1.45, -1.03, 0.32)];
  scene.add(tube(cordL, M({ color: 0xe6e3dc, roughness: 0.5 }), 0.0026, 60));
  flows.cordH = new THREE.CatmullRomCurve3(cordH.slice().reverse());

  // the heater: a convector with a glowing element behind a grille
  const heater = new THREE.Group(); heater.position.set(1.0, FLOOR + 0.2, 0.36); heater.rotation.y = -0.3; scene.add(heater);
  add(heater, rbox(0.42, 0.34, 0.12, 0.02, M({ color: 0xe8e6e1, roughness: 0.35 })));
  const grilleMat = M({ color: 0x3b3b3d, roughness: 0.5, metalness: 0.4 });
  for (let i = 0; i < 9; i++) add(heater, rbox(0.34, 0.009, 0.008, 0.003, grilleMat), 0, -0.085 + i * 0.021, 0.061);
  const elemMat = new THREE.MeshStandardMaterial({ color: 0x2a140c, emissive: 0xff5410, emissiveIntensity: 0, roughness: 0.7 });
  [-0.05, 0, 0.05].forEach((y) => add(heater, new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.32, 10).rotateZ(Math.PI / 2), elemMat), 0, y, 0.048));
  [-0.15, 0.15].forEach((x) => add(heater, rbox(0.03, 0.04, 0.16, 0.01, M({ color: 0x5a5a5c, roughness: 0.5 })), x, -0.18, 0));
  const heatGlow = new THREE.PointLight(0xff6a2a, 0, 1.1, 2); heatGlow.position.set(0.95, FLOOR + 0.22, 0.55); scene.add(heatGlow);

  // the floor lamp, plugged into the same socket: when the sockets breaker trips, the room goes dark
  const lampG = new THREE.Group(); lampG.position.set(1.45, FLOOR, 0.32); scene.add(lampG);
  const brass = M({ color: 0x6f6a62, metalness: 0.9, roughness: 0.35 });
  add(lampG, new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.018, 40), brass), 0, 0.009, 0);
  add(lampG, new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.42, 14), brass), 0, 0.72, 0);
  const shadeProf = []; for (let i = 0; i <= 10; i++) { const t = i / 10; shadeProf.push(new THREE.Vector2(lerp(0.19, 0.13, t), t * 0.26)); }
  const shadeMat = new THREE.MeshStandardMaterial({ color: 0xece4d4, emissive: 0xffc98a, emissiveIntensity: 0.9, roughness: 0.9, side: THREE.DoubleSide });
  add(lampG, new THREE.Mesh(new THREE.LatheGeometry(shadeProf, 48), shadeMat), 0, 1.36, 0);
  const lampLight = new THREE.PointLight(0xffc68a, 2.2, 4.2, 1.4); lampLight.position.set(1.45, FLOOR + 1.47, 0.32); scene.add(lampLight);
  const lampDown = new THREE.SpotLight(0xffd4a0, 2.0, 3, 0.9, 0.7, 1.2); lampDown.position.set(1.45, FLOOR + 1.4, 0.32); lampDown.target.position.set(1.45, FLOOR, 0.32); scene.add(lampDown, lampDown.target);

  // ---------------------------------------------------------------- the panel: surface-mounted, two rows, a dead-front cover and a door
  const pn = new THREE.Group(); pn.position.copy(PANEL); scene.add(pn);
  const pw = 0.33, ph = 0.42;
  const shell = M({ color: 0xe6e4df, roughness: 0.4 }), inner = M({ color: 0xcfccc6, roughness: 0.6 });
  add(pn, rbox(pw, ph, 0.006, 0.003, inner), 0, 0, 0.029);
  [[-1, 0], [1, 0]].forEach(([s]) => add(pn, rbox(0.012, ph, 0.09, 0.004, shell), s * (pw / 2 - 0.006), 0, 0.07));
  [[-1], [1]].forEach(([s]) => add(pn, rbox(pw, 0.014, 0.09, 0.004, shell), 0, s * (ph / 2 - 0.007), 0.07));
  const rows = [0.085, -0.085];
  const railMat = M({ color: 0xb9bdc2, metalness: 1, roughness: 0.38 });
  rows.forEach((y) => add(pn, new THREE.Mesh(new THREE.BoxGeometry(pw - 0.03, 0.035, 0.0075), railMat), 0, y, 0.036));
  // DIN module body: the stepped side profile of a real breaker, extruded across its width
  const profile = new THREE.Shape([[0, -0.045], [0.044, -0.045], [0.044, -0.0225], [0.07, -0.0225], [0.07, 0.0225], [0.044, 0.0225], [0.044, 0.045], [0, 0.045]].map(([a, b]) => new THREE.Vector2(a, b)));
  const modGeo = (n) => { const g = new THREE.ExtrudeGeometry(profile, { depth: n * MOD - 0.0012, bevelEnabled: true, bevelSize: 0.0006, bevelThickness: 0.0006, bevelSegments: 2, curveSegments: 2 }); g.rotateY(-Math.PI / 2); g.translate((n * MOD - 0.0012) / 2, 0, 0); return g; };
  const modMat = M({ color: 0xf4f3ef, roughness: 0.36 });
  const faceTex = (label, sub, n) => canvasTex(64 * n, 160, (g, w, h) => {
    g.fillStyle = '#f4f3ef'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1b1b1b'; g.textAlign = 'center'; g.font = `600 ${n > 1 ? 30 : 26}px ${FONT}`; g.fillText(label, w / 2, 132);
    g.font = `400 15px ${FONT}`; g.fillStyle = '#55524c'; g.fillText(sub, w / 2, 152);
    g.fillStyle = '#55524c'; g.font = `500 14px ${FONT}`; g.fillText('I-ON', w / 2, 16); g.fillText('O-OFF', w / 2, 100);
  });
  const tagTex = (txt) => canvasTex(160, 40, (g, w, h) => { g.fillStyle = '#fbfaf5'; g.fillRect(0, 0, w, h); g.fillStyle = '#20201f'; g.textAlign = 'center'; g.font = `500 21px ${FONT}`; g.fillText(txt, w / 2, 28); });
  const toggles = {};
  const layout = [
    [{ n: 2, k: 'main', lab: '40A', sub: '2P', c: 0xc8302a }, { n: 2, k: 'rcd', lab: '40A', sub: '30mA', c: 0x2f3338 }, { n: 1, lab: 'C10', sub: '6000', tag: 'תאורה' }, { n: 1, lab: 'C10', sub: '6000', tag: 'תאורה' }, { n: 1, lab: 'C16', sub: '6000', tag: 'מטבח' }, { n: 1, lab: 'C16', sub: '6000', tag: 'מטבח' }, { n: 1, lab: 'C20', sub: '6000', tag: 'דוד' }, { n: 1, lab: 'C16', sub: '6000', tag: 'מזגן' }],
    [{ n: 1, lab: 'C16', sub: '6000', tag: 'חדרים' }, { n: 1, lab: 'C16', sub: '6000', tag: 'חדרים' }, { n: 1, k: 'ours', lab: 'C16', sub: '6000', tag: 'סלון' }, { n: 1, lab: 'C16', sub: '6000', tag: 'מקלחת' }, { n: 1, lab: 'C16', sub: '6000', tag: 'כביסה' }, { n: 1, lab: 'C16', sub: '6000', tag: 'מזגן' }, { n: 1, lab: 'C10', sub: '6000', tag: 'חוץ' }, { n: 1, lab: 'C16', sub: '6000', tag: 'מרפסת' }],
  ];
  const tagMats = [];
  layout.forEach((row, ri) => {
    const total = row.reduce((a, m) => a + m.n, 0); let x = -(total * MOD) / 2;
    row.forEach((m) => {
      const w = m.n * MOD, g = new THREE.Group(); g.position.set(x + w / 2, rows[ri], 0.04); pn.add(g); x += w;
      const body = add(g, new THREE.Mesh(modGeo(m.n), modMat));
      // the printed front: rating and marks
      const fm = M({ map: faceTex(m.lab, m.sub, m.n), roughness: 0.45 });
      add(g, new THREE.Mesh(new THREE.PlaneGeometry(w - 0.002, 0.044), fm), 0, 0, 0.0712);
      // terminal screws top and bottom
      for (let i = 0; i < m.n; i++) [0.045, -0.045].forEach((ty) => add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.0033, 0.0033, 0.002, 12), M({ color: 0xbfc3c7, metalness: 1, roughness: 0.3 })), -w / 2 + MOD / 2 + i * MOD, ty + Math.sign(ty) * 0.0004, 0.034));
      // the flag window (red = on, green = off)
      const flag = add(g, new THREE.Mesh(new THREE.PlaneGeometry(0.0045, 0.0035), new THREE.MeshBasicMaterial({ color: 0xd42a1e })), w / 2 - 0.0042, 0.0165, 0.0716);
      // the toggle, on a pivot: up = on
      const piv = new THREE.Group(); piv.position.set(0, 0.002, 0.0712); g.add(piv);
      const tg = add(piv, rbox(Math.min(w - 0.007, 0.024), 0.013, 0.009, 0.002, M({ color: m.c || 0x3a3d42, roughness: 0.42 })), 0, 0.005, 0.0045);
      piv.rotation.x = -0.55;
      if (m.k === 'rcd') add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.004, 16).rotateX(Math.PI / 2), M({ color: 0xf2c400, roughness: 0.5 })), 0.012, -0.016, 0.073);
      if (m.tag) { const tm = M({ map: tagTex(m.tag), roughness: 0.7 }); tagMats.push(tm); g.userData.tag = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.0015, 0.0075), tm); g.userData.tag.position.set(g.position.x, g.position.y - 0.031, 0.0884); }
      if (m.k === 'ours') { toggles.ours = piv; toggles.flag = flag; toggles.pos = g.position.clone().add(PANEL); toggles.term = V(0, -0.045, 0.036).add(g.position).add(PANEL); }
      if (m.k === 'main') toggles.main = g;
    });
  });
  // the comb busbar over the top terminals, the neutral bar and the earth bar
  rows.forEach((y) => add(pn, rbox(pw - 0.05, 0.007, 0.006, 0.002, M({ color: 0x5b5d61, roughness: 0.5 })), 0, y + 0.05, 0.038));
  const nbar = add(pn, rbox(0.11, 0.008, 0.008, 0.0015, M({ color: 0xc9a24a, metalness: 1, roughness: 0.32 })), -0.07, -0.168, 0.04);
  add(pn, rbox(0.11, 0.008, 0.008, 0.0015, M({ color: 0xc9a24a, metalness: 1, roughness: 0.32 })), 0.07, -0.168, 0.04);
  for (let i = 0; i < 7; i++) add(pn, new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.002, 10), M({ color: 0xbfc3c7, metalness: 1, roughness: 0.3 })), -0.115 + i * 0.016, -0.168, 0.0445).rotation.x = Math.PI / 2;
  toggles.ntermIdx = 2; toggles.nterm = V(-0.115 + 2 * 0.016, -0.168, 0.046).add(PANEL);
  // wires leaving the bottom row: brown down to the trunk, blue from the neutral bar
  for (let i = 0; i < 8; i++) {
    const x = -4 * MOD + MOD / 2 + i * MOD, y0 = rows[1] - 0.047;
    pn.add(tube([V(x, y0, 0.05), V(x, y0 - 0.02, 0.05), V(x * 0.6, -0.15, 0.045), V(x * 0.3 + 0.03, -0.19, 0.036)], wireMat.L, 0.0016, 24));
    if (i < 7) pn.add(tube([V(-0.115 + i * 0.016, -0.168, 0.042), V(-0.115 + i * 0.016, -0.185, 0.04), V(-0.05 + i * 0.01, -0.2, 0.034)], wireMat.N, 0.0016, 16));
  }
  // the dead-front cover: a plate with a slot for each row; off for the test, back on before the reset
  const coverMat = M({ color: 0xf0eee9, roughness: 0.38, envMapIntensity: 0.9 });
  const cover = new THREE.Group(); pn.add(cover);
  const cvShape = new THREE.Shape(); cvShape.moveTo(-pw / 2 + 0.012, -ph / 2 + 0.014); cvShape.lineTo(pw / 2 - 0.012, -ph / 2 + 0.014); cvShape.lineTo(pw / 2 - 0.012, ph / 2 - 0.014); cvShape.lineTo(-pw / 2 + 0.012, ph / 2 - 0.014); cvShape.closePath();
  rows.forEach((y, ri) => { const hp = new THREE.Path(); const hw = (layout[ri].reduce((a, m) => a + m.n, 0) * MOD) / 2 + 0.0008; hp.moveTo(-hw, y - 0.0235); hp.lineTo(-hw, y + 0.0235); hp.lineTo(hw, y + 0.0235); hp.lineTo(hw, y - 0.0235); hp.closePath(); cvShape.holes.push(hp); });
  pn.children.forEach((g) => { if (g.userData.tag) cover.add(g.userData.tag); });
  add(cover, new THREE.Mesh(new THREE.ExtrudeGeometry(cvShape, { depth: 0.003, bevelEnabled: true, bevelSize: 0.001, bevelThickness: 0.001, bevelSegments: 1 }), coverMat), 0, 0, 0.083);
  const coverHome = cover.position.clone();
  // the door, hinged on the left and standing open, with the circuit list glued inside
  const door = new THREE.Group(); door.position.set(-pw / 2, 0, 0.116); pn.add(door);
  add(door, rbox(pw, ph, 0.008, 0.004, M({ color: 0xdedcd6, roughness: 0.4 })), pw / 2, 0, 0);
  const listTex = canvasTex(256, 320, (g, w, h) => { g.fillStyle = '#f6f3ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2925'; g.font = `600 22px ${FONT}`; g.textAlign = 'right'; g.fillText('רשימת מעגלים', w - 18, 34); g.font = `400 17px ${FONT}`; ['1  תאורה', '2  תאורה', '3  מטבח', '4  מטבח', '5  דוד', '6  מזגן', '7  חדרים', '8  סלון', '9  מקלחת', '10  כביסה'].forEach((r, i) => { g.fillText(r, w - 18, 70 + i * 24); g.fillStyle = 'rgba(42,41,37,.25)'; g.fillRect(18, 76 + i * 24, w - 36, 1); g.fillStyle = '#2a2925'; }); });
  add(door, new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.21), M({ map: listTex, roughness: 0.8 })), pw / 2, 0, -0.0045).rotation.y = Math.PI;
  door.rotation.y = -1.95;

  // ---------------------------------------------------------------- the tester's probes (with finger guards and leads) and the headlamp
  const probe = (col) => {
    const g = new THREE.Group();
    add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.0007, 0.0011, 0.016, 10), M({ color: 0xd9dde0, metalness: 1, roughness: 0.22 })), 0, 0.008, 0);
    add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.0032, 0.0028, 0.012, 16), M({ color: col, roughness: 0.45 })), 0, 0.022, 0);
    add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.0062, 0.0062, 0.0022, 24), M({ color: col, roughness: 0.45 })), 0, 0.0295, 0);
    add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.0046, 0.0052, 0.07, 18), M({ color: col, roughness: 0.42 })), 0, 0.066, 0);
    g.add(tube([V(0, 0.1, 0), V(0, 0.14, 0.01), V(0.02, 0.2, 0.06), V(0.06, 0.24, 0.2)], M({ color: col, roughness: 0.5 }), 0.0019, 30));
    scene.add(g); return g;
  };
  const prR = probe(0xc4241c), prB = probe(0x161616);

  // ---------------------------------------------------------------- lights
  const hemi = new THREE.HemisphereLight(0xfff1e0, 0x5f574e, 0.5); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe7cc, 1.1); key.position.set(1.2, 2.4, 3); scene.add(key);
  const moon = new THREE.DirectionalLight(0x7f9fd6, 0); moon.position.set(2.6, 1.2, 2.4); scene.add(moon);
  const jointGlow = new THREE.PointLight(0xff5a1a, 0, 0.1, 2); jointGlow.position.copy(J.L).add(V(0, 0.004, 0.012)); scene.add(jointGlow);
  const arcPos = J.L.clone().lerp(J.N, 0.5).addScaledVector(up, 0.012);
  const arcLight = new THREE.PointLight(0xcfe4ff, 0, 0.5, 2); arcLight.position.copy(arcPos).add(V(0, 0, 0.01)); scene.add(arcLight);
  const lamp = new THREE.SpotLight(0xf1f5ff, 0, 2.4, 0.32, 0.6, 1.3); scene.add(lamp, lamp.target);

  // ---------------------------------------------------------------- the arc, sparks, smoke and the current
  const arcMat = new THREE.MeshBasicMaterial({ color: 0xeef6ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const arcMesh = new THREE.Mesh(new THREE.BufferGeometry(), arcMat); scene.add(arcMesh);
  const dot = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 1, 32, 32, 31); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const arcHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: 0xbfdcff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  arcHalo.position.copy(arcPos); arcHalo.scale.setScalar(0.016); scene.add(arcHalo);
  const NS = 80, sr = rng(11), sparkV = Array.from({ length: NS }, () => [(sr() - 0.5) * 0.9, 0.15 + sr() * 0.7, 0.25 + sr() * 0.6, sr()]);
  const sparkGeo = new THREE.BufferGeometry(); sparkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NS * 3), 3));
  const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({ map: dot, color: 0xffb547, size: 0.005, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  sparks.frustumCulled = false; scene.add(sparks);
  const smokeTex = canvasTex(128, 128, (g) => { const rr = rng(5); for (let i = 0; i < 20; i++) { const x = 30 + rr() * 68, y = 30 + rr() * 68, rad = 14 + rr() * 26; const gr = g.createRadialGradient(x, y, 1, x, y, rad); gr.addColorStop(0, 'rgba(255,255,255,.22)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); } });
  const smoke = Array.from({ length: 16 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: 0x9d9790, transparent: true, depthWrite: false, opacity: 0 })); s.userData.o = i / 16; scene.add(s); return s; });
  // the current, drawn as a moving dash along its path (cord, conduit to the box, conduit to the panel): slow amber under load, fast and white in the fault
  const dashTex = canvasTex(128, 4, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.7, 'rgba(255,255,255,.9)'); gr.addColorStop(0.78, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  dashTex.wrapS = THREE.RepeatWrapping;
  const flowLines = [];
  const flowOn = (curve, rad, per) => { const t = dashTex.clone(); t.needsUpdate = true; t.repeat.set(curve.getLength() * per, 1); const m = new THREE.MeshBasicMaterial({ map: t, color: 0xffc06a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }); const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.ceil(curve.getLength() * 120), rad, 8, false), m); scene.add(mesh); flowLines.push(mesh); return mesh; };
  const fCord = flowOn(flows.cordH, 0.0042, 9), fUp = flowOn(curves.up, 0.0122, 9), fPanel = flowOn(new THREE.CatmullRomCurve3(curves.panel.getPoints(80).reverse()), 0.0122, 9);
  const fSup = flowOn(flows.supOld, 0.0023, 60), fLod = flowOn(flows.lodOld, 0.0023, 60);

  // ---------------------------------------------------------------- labels projected from the scene
  const LBL = [
    ['heater', () => V(1.0, FLOOR + 0.42, 0.38), [0.02, 0.1], '<span lang="he">תנור, 2,000 וואט</span><span lang="en">Heater, 2,000 W</span>'],
    ['lamp', () => V(1.45, FLOOR + 1.2, 0.32), [0.045, 0.1], '<span lang="he">מנורה, באותו שקע</span><span lang="en">Lamp, same socket</span>'],
    ['joint', () => J.L.clone().add(V(-0.006, 0.014, 0.008)), [0.2, 0.32], '<span lang="he">חיבור שזור, מלופף בבידוד</span><span lang="en">Twisted joint, taped over</span>'],
    ['breaker', () => toggles.pos.clone().add(V(0, -0.012, 0.12)), [0.5, 0.565], '<span lang="he">מפסק השקעים בסלון קפץ</span><span lang="en">The living-room sockets breaker tripped</span>'],
    ['probe', () => toggles.term.clone().add(V(0, -0.012, 0.02)), [0.612, 0.655], '<span lang="he">בדיקת בידוד, פאזה מול אפס</span><span lang="en">Insulation test, live to neutral</span>'],
    ['conn', () => C.E.clone().add(V(0.01, -0.002, 0.006)), [0.79, 0.848], '<span lang="he">מחברי מנוף חדשים</span><span lang="en">New lever connectors</span>'],
    ['reset', () => toggles.pos.clone().add(V(0, 0.01, 0.12)), [0.93, 0.965], '<span lang="he">מרימים את המפסק</span><span lang="en">Breaker back up</span>'],
  ];
  const lEls = LBL.map((l) => { const e = document.createElement('span'); e.className = 'l3d l3d-' + l[0]; e.innerHTML = l[3]; e.style.opacity = '0'; labelHost.appendChild(e); return e; });

  // redraw the printed labels once the page's Hebrew face has loaded
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { mats.forEach((m) => m.map && m.map.userData.redraw && m.map.userData.redraw()); dirty = true; });

  // ---------------------------------------------------------------- state and the frame
  let P = 0, last = 0, lastSet = performance.now(), dirty = true, running = true, visible = true, raf = 0;
  const t0 = performance.now();
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
    // keep roughly the same horizontal view on portrait screens
    camera.fov = camera.aspect >= 1.15 ? 40 : Math.min(70, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(40) / 2) * 1.15 / camera.aspect)) * 0.86);
    camera.updateProjectionMatrix(); dirty = true;
  }
  addEventListener('resize', resize); resize();

  const ro = 'ResizeObserver' in window ? new ResizeObserver(resize) : null; if (ro) ro.observe(host);

  function frame(now) {
    const p = P, time = Math.max(0, (now - t0) / 1000), still = calm();
    camAt(p);
    if (camera.aspect < 1) { const d = tmpP.clone().sub(tmpT); tmpP.copy(tmpT).add(d.multiplyScalar(1 + (1 - camera.aspect) * 0.3)); }
    camera.position.copy(tmpP); camera.lookAt(tmpT);
    const load = T.load(p), heat = T.heat(p), ch = T.char(p), light = T.light(p), head = T.head(p), cut = T.cut(p), arcOn = T.arc(p) && !cut;

    // the room: lamp light and the warm key fade to moonlight when the breaker trips
    renderer.toneMappingExposure = lerp(0.62, 1.0, Math.max(light, head * 0.7));
    hemi.intensity = lerp(0.025, 0.5, light); key.intensity = lerp(0.0, 0.9, light); moon.intensity = lerp(0.45, 0.0, light);
    lampLight.intensity = 2.2 * light; lampDown.intensity = 2.0 * light; shadeMat.emissiveIntensity = 0.9 * light; shadeMat.color.set(light > 0.5 ? 0xece4d4 : 0x8d877c);
    const envK = lerp(0.06, 1, Math.max(light, head * 0.22));
    scene.environmentIntensity = envK;
    mats.forEach((m) => { m.envMapIntensity = m.userData.env * envK; });
    elemMat.emissiveIntensity = 2.2 * load; heatGlow.intensity = 0.7 * load;

    // the bad joint: glows with heat, the tape and the brown insulation char, the copper darkens
    const hh = heat * heat * (cut ? 0 : 1);
    jointGlow.intensity = 0.0035 * hh + (arcOn ? 0.002 : 0);
    charMat.color.set(COL.L).lerp(new THREE.Color(0x120c08), ch * 0.94); charMat.emissive.setRGB(0.32 * hh, 0.05 * hh, 0.0);
    tapeMatL.emissive.setRGB(0.22 * hh, 0.03 * hh, 0.0); tapeMatL.roughness = lerp(0.32, 0.12, ch);
    copperHot.color.set(0xd07a45).lerp(new THREE.Color(0x3a2418), ch * 0.85);
    sootMat.opacity = 0.85 * span(p, 0.34, 0.39) * (cut ? 0.35 : 1);
    oldWires.visible = !cut; newWires.visible = cut;
    // the cut: the burnt piece drops out of the box and is gone
    const cp = span(p, 0.738, 0.752);
    cutPiece.visible = p < 0.752; cutPiece.position.copy(cutPieceHome).add(V(0.01 * cp, -0.14 * cp * cp, 0.06 * cp));
    const cn = T.conn(p);
    conns.forEach((g, i) => {
      const k = clamp(cn * 1.5 - i * 0.25), key = ['L', 'N', 'E'][i];
      g.position.copy(C[key]).add(V(0, 0, 0.06 * (1 - smooth(k)))); g.visible = k > 0.001;
      const shut = span(cn * 1.5 - i * 0.25, 0.85, 1.0);
      g.userData.levers.forEach((l) => { l.rotation.x = -1.25 * (1 - shut); });
    });
    
    // the cutters close on the joint, then pull back
    const ct = T.cutters(p); cutters.visible = !!ct;
    if (ct) { const q = span(p, 0.722, 0.738), back = span(p, 0.742, 0.752); cutters.position.copy(J.L).add(V(-0.0135 - 0.03 * back, -0.0105 - 0.02 * back, 0.004 + 0.05 * (1 - q) + 0.04 * back)); cutters.rotation.set(0.15, -0.5, 0.2); jaws[0].rotation.z = 0.18 * (1 - q); jaws[1].rotation.z = -0.18 * (1 - q); }

    // the lid: ghosted for the cutaway, solid when he is at the box, off for the work, back on
    const lt = T.lid(p), ghost = T.ghost(p);
    lidMat.opacity = ghost ? 0.1 : 1; lidMat.transparent = ghost; lidMat.depthWrite = !ghost;
    lid.position.copy(lidShut).lerp(lidOff, lt); lid.rotation.set(-0.5 * lt, 0.3 * lt, 0.4 * lt);
    // the dead-front cover off for the test; the door stays open
    const cv = T.cover(p); cover.position.copy(coverHome).add(V(0.25 * cv, -0.05 * cv, 0.16 * cv)); cover.rotation.y = -0.5 * cv; cover.visible = cv < 0.999;

    // the arc: a jagged path between live and neutral, re-drawn while it lasts
    arcMat.opacity = arcOn ? 1 : 0; arcHalo.material.opacity = arcOn ? 0.85 + 0.15 * Math.sin(time * 61) : 0;
    arcLight.intensity = arcOn ? 0.004 + 0.006 * Math.abs(Math.sin(time * 47 + p * 900)) : 0;
    if (arcOn) {
      const a = J.L.clone().addScaledVector(up, 0.011), b = J.N.clone().addScaledVector(up, 0.011), rr = rng(Math.floor((still ? 0 : time) * 30) + Math.floor(p * 4000)), q = [];
      for (let i = 0; i < 10; i++) { const v = a.clone().lerp(b, i / 9); if (i && i < 9) v.add(V(0, (rr() - 0.5) * 0.007, (rr() - 0.5) * 0.006)); q.push(v); }
      arcMesh.geometry.dispose(); arcMesh.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(q, false, 'chordal'), 30, 0.00085, 5, false);
    }
    // sparks: thrown from the arc, they fall under gravity and fade (a function of scroll, so it runs backwards too)
    const sp = sparkGeo.attributes.position, st = (p - 0.335) * 7;
    sparks.material.opacity = st > 0 && st < 0.9 && !cut ? 1 - st / 0.9 : 0;
    for (let i = 0; i < NS; i++) { const v = sparkV[i], t = Math.max(0, st - v[3] * 0.25); sp.setXYZ(i, arcPos.x + v[0] * 0.16 * t, Math.max(JBOX.y - 0.048, arcPos.y + v[1] * 0.14 * t - 0.7 * t * t), arcPos.z + v[2] * 0.12 * t); }
    sp.needsUpdate = true;
    // smoke from the hot insulation, thinning after the trip
    const smokeAmt = cut ? 0 : clamp(span(p, 0.24, 0.33) * (p < 0.395 ? 1 : 1 - span(p, 0.395, 0.58)));
    smoke.forEach((s) => { const k = ((still ? 0.5 : time * 0.16) + s.userData.o) % 1; s.position.set(J.L.x + Math.sin(k * 9 + s.userData.o * 20) * 0.01 + k * 0.015, J.L.y + 0.01 + k * 0.12, J.L.z + 0.012 + k * 0.03); s.scale.setScalar(0.02 + k * 0.07); s.material.opacity = smokeAmt * 0.5 * Math.sin(k * Math.PI); });

    // the current: slow amber dashes under load; in the fault, white and fast from the panel to the short
    const fault = arcOn ? 1 : 0, mv = still ? 0.37 : time;
    [fCord, fUp, fSup, fLod].forEach((m) => { m.material.opacity = 0.75 * load * (1 - fault) * (m === fLod || m === fSup ? (cut ? 0 : 1) : 1); m.material.color.set(0xffc06a); m.material.map.offset.x = -mv * 0.5; });
    fPanel.material.opacity = 0.75 * load * (1 - fault) + fault; fPanel.material.color.set(fault ? 0xe8f1ff : 0xffc06a); fPanel.material.map.offset.x = -mv * (fault ? 6 : 0.5);
    if (fault) { fSup.material.opacity = 0.8; fSup.material.color.set(0xe8f1ff); fSup.material.map.offset.x = -mv * 6; }

    // the breaker: down when tripped, flag green
    const tr = T.tripped(p); toggles.ours.rotation.x = tr ? 0.6 : -0.55; toggles.flag.material.color.set(tr ? 0x2f9e44 : 0xd42a1e);

    // the headlamp, carried at the camera
    lamp.intensity = 1.5 * head; lamp.position.copy(camera.position).add(V(0.03, 0.06, 0)); lamp.target.position.copy(tmpT);

    // the probes: on the breaker's outgoing terminal and the circuit's neutral, then on the connectors' test slots
    const pa = T.probeA(p), pb = T.probeB(p);
    prR.visible = prB.visible = pa || pb;
    if (pa) { prR.position.copy(toggles.term).add(V(0, -0.002, 0.0)); prR.rotation.set(Math.PI - 0.95, 0, 0.3); prB.position.copy(toggles.nterm); prB.rotation.set(Math.PI - 0.95, 0, -0.35); }
    if (pb) { prR.position.copy(C.L).add(V(0, -0.0094, 0.001)); prR.rotation.set(Math.PI - 0.55, 0, 0.35); prB.position.copy(C.N).add(V(0, -0.0094, 0.001)); prB.rotation.set(Math.PI - 0.55, 0, -0.35); }

    renderer.render(scene, camera);

    // labels
    const w = host.clientWidth, h = host.clientHeight, rtl = document.documentElement.dir === 'rtl';
    LBL.forEach((l, i) => {
      const e = lEls[i], on = p >= l[2][0] && p < l[2][1];
      const s = l[1]().project(camera);
      const ok = on && s.z < 1 && s.x > -0.92 && s.x < 0.92 && s.y > -0.9 && s.y < 0.9;
      e.style.opacity = ok ? '1' : '0';
      if (ok) {
        const lw = e.offsetWidth + 12;
        let x = ((s.x + 1) / 2) * w; x = rtl ? Math.max(lw + 8, x) : Math.min(w - lw - 8, x);
        e.style.transform = `translate(${x.toFixed(1)}px, ${(((1 - s.y) / 2) * h).toFixed(1)}px)`;
      }
    });
    dirty = false;
  }
  function loop(now) {
    raf = 0; if (!running || !visible) return;
    // the live details (current, smoke, the arc) run while the visitor scrolls and settle 5 s after they stop
    const animating = !calm() && now - lastSet < 5000 && (T.load(P) > 0 || T.arc(P) || (P > 0.24 && P < 0.58));
    if (dirty || (animating && now - last > 32)) { last = now; frame(now); }
    raf = requestAnimationFrame(loop);
  }
  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible && !raf && running) raf = requestAnimationFrame(loop); });
  io.observe(host);
  raf = requestAnimationFrame(loop);
  return {
    set(p) { const c = clamp(p); if (c !== P) lastSet = performance.now(); P = c; dirty = true; if (!raf && running) raf = requestAnimationFrame(loop); },
    pause() { running = false; cancelAnimationFrame(raf); raf = 0; renderer.domElement.style.visibility = 'hidden'; },
    resume() { running = true; renderer.domElement.style.visibility = 'visible'; dirty = true; if (!raf) raf = requestAnimationFrame(loop); },
    render() { frame(performance.now()); },
    resize,
  };
}
