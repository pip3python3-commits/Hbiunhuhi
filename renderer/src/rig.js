// Procedural 3D "stick-figure" character: shaded sphere head with painted-on face,
// thin rubber-hose limbs, capsule torso, swappable hats. Everything is a pure function of time.
import * as THREE from 'three';

const INK = 0x2a1a24;           // shared aubergine "ink" from the style bible
const OUTLINE = new THREE.MeshBasicMaterial({ color: 0x1a0f16, side: THREE.BackSide });

// ------------------------------------------------------------------ face textures
const faceCache = new Map();
function drawFace(extras, expr, blink) {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#fbfaf8'; g.fillRect(0, 0, 1024, 512);
  const cx = 256, cy = 250;               // u = 0.25 is the +Z (front) meridian of a three.js sphere
  const ex = 40, ey = cy - 18;
  g.lineCap = 'round'; g.lineJoin = 'round';
  const ink = '#1d1218';
  g.strokeStyle = ink; g.fillStyle = ink;

  const dot = (x, y, rx, ry) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); };
  const ring = (x, y, r) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.lineWidth = 5; g.stroke(); g.fillStyle = ink; };
  const line = (x0, y0, x1, y1, w = 6) => { g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
  const curve = (x0, y0, qx, qy, x1, y1, w = 6) => { g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(qx, qy, x1, y1); g.stroke(); };
  const drop = (x, y) => { g.fillStyle = '#7fc4f0'; g.strokeStyle = ink; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y - 20); g.quadraticCurveTo(x + 15, y + 5, x, y + 12); g.quadraticCurveTo(x - 15, y + 5, x, y - 20); g.fill(); g.stroke(); g.fillStyle = ink; };

  let eyes = 'dot', brows = null, mouth = 'line', drops = 0;
  switch (expr) {
    case 'smug':    eyes = 'lid'; brows = 'smug'; mouth = 'smirk'; break;
    case 'smile':   eyes = 'dot'; brows = 'up'; mouth = 'smile'; break;
    case 'grin':    eyes = 'dot'; brows = 'up'; mouth = 'grin'; break;
    case 'shock':   eyes = 'wide'; brows = 'high'; mouth = 'O'; break;
    case 'panic':   eyes = 'wide'; brows = 'high'; mouth = 'scream'; drops = 2; break;
    case 'worried': eyes = 'dot'; brows = 'worry'; mouth = 'wavy'; drops = 1; break;
    case 'sweat':   eyes = 'lid'; brows = 'worry'; mouth = 'wavy'; drops = 3; break;
    case 'sad':     eyes = 'dot'; brows = 'worry'; mouth = 'frown'; break;
    case 'angry':   eyes = 'dot'; brows = 'angry'; mouth = 'frown'; break;
    default:        eyes = 'dot'; brows = 'flat'; mouth = 'line';
  }
  // eyes
  for (const s of [-1, 1]) {
    const x = cx + s * ex;
    if (blink && eyes !== 'wide') { line(x - 16, ey, x + 16, ey, 7); continue; }
    if (eyes === 'dot') dot(x, ey, 10, 14);
    else if (eyes === 'wide') { ring(x, ey, 25); dot(x + (s > 0 ? -3 : 3), ey + 2, 6, 8); }
    else if (eyes === 'lid') {      // half-lidded
      g.fillStyle = '#e9e5e2'; g.beginPath(); g.ellipse(x, ey + 2, 20, 15, 0, 0, 7); g.fill(); g.fillStyle = ink;
      dot(x, ey + 7, 8, 8); line(x - 22, ey - 7, x + 22, ey - 7, 8);
    }
  }
  // brows
  if (brows) {
    for (const s of [-1, 1]) {
      const x = cx + s * ex, y = ey - 38;
      if (brows === 'flat') line(x - 18, y + 6, x + 18, y + 6, 6);
      else if (brows === 'up') curve(x - 18, y + 6, x, y - 8, x + 18, y + 6, 6);
      else if (brows === 'high') curve(x - 20, y - 10, x, y - 24, x + 20, y - 10, 6);
      else if (brows === 'worry') line(s < 0 ? x - 20 : x + 20, y + 10, s < 0 ? x + 20 : x - 20, y - 8, 6);
      else if (brows === 'angry') line(s < 0 ? x - 20 : x + 20, y - 8, s < 0 ? x + 20 : x - 20, y + 12, 7);
      else if (brows === 'smug') { if (s < 0) line(x - 20, y + 10, x + 20, y + 10, 6); else curve(x - 20, y + 8, x, y - 14, x + 20, y - 6, 6); }
    }
  }
  // mouth
  const my = cy + 62;
  if (mouth === 'line') line(cx - 20, my, cx + 20, my, 6);
  else if (mouth === 'smirk') curve(cx - 24, my + 2, cx + 6, my + 10, cx + 34, my - 12, 7);
  else if (mouth === 'smile') curve(cx - 36, my - 6, cx, my + 28, cx + 36, my - 6, 7);
  else if (mouth === 'grin') {
    g.fillStyle = '#3a1218'; g.beginPath(); g.moveTo(cx - 42, my - 8); g.quadraticCurveTo(cx, my + 46, cx + 42, my - 8); g.closePath(); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(cx - 38, my - 6); g.lineTo(cx + 38, my - 6); g.lineTo(cx + 34, my + 4); g.lineTo(cx - 34, my + 4); g.closePath(); g.fill(); g.strokeStyle = ink; g.lineWidth = 5; g.beginPath(); g.moveTo(cx - 42, my - 8); g.quadraticCurveTo(cx, my + 46, cx + 42, my - 8); g.closePath(); g.stroke(); g.fillStyle = ink;
  }
  else if (mouth === 'O') { g.fillStyle = '#3a1218'; g.beginPath(); g.ellipse(cx, my + 8, 17, 24, 0, 0, 7); g.fill(); g.strokeStyle = ink; g.lineWidth = 5; g.stroke(); g.fillStyle = ink; }
  else if (mouth === 'scream') { g.fillStyle = '#3a1218'; g.beginPath(); g.ellipse(cx, my + 12, 36, 34, 0, 0, 7); g.fill(); g.strokeStyle = ink; g.lineWidth = 5; g.stroke(); g.fillStyle = '#e8737f'; g.beginPath(); g.ellipse(cx, my + 28, 20, 11, 0, 0, 7); g.fill(); g.fillStyle = ink; }
  else if (mouth === 'wavy') { g.lineWidth = 6; g.beginPath(); g.moveTo(cx - 30, my + 4); for (let i = 0; i <= 6; i++) g.lineTo(cx - 30 + i * 10, my + 4 + (i % 2 ? -8 : 6)); g.stroke(); }
  else if (mouth === 'frown') curve(cx - 30, my + 14, cx, my - 14, cx + 30, my + 14, 7);

  for (let i = 0; i < drops; i++) drop(cx + (i % 2 ? 100 : -100) + i * 6, cy - 60 + i * 26);

  if (extras === 'mustache') {
    g.fillStyle = '#2b1a14'; g.beginPath();
    g.moveTo(cx, my - 26); g.quadraticCurveTo(cx - 40, my - 44, cx - 78, my - 16); g.quadraticCurveTo(cx - 40, my - 20, cx, my - 12);
    g.quadraticCurveTo(cx + 40, my - 20, cx + 78, my - 16); g.quadraticCurveTo(cx + 40, my - 44, cx, my - 26); g.fill();
  }
  if (extras === 'glasses') {
    g.strokeStyle = ink; g.lineWidth = 5; g.fillStyle = 'rgba(180,220,255,0.25)';
    for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * ex, ey, 30, 0, 7); g.fill(); g.stroke(); }
    line(cx - 10, ey, cx + 10, ey, 5);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
function faceTex(extras, expr, blink) {
  const k = `${extras}|${expr}|${blink ? 1 : 0}`;
  if (!faceCache.has(k)) faceCache.set(k, drawFace(extras, expr, blink));
  return faceCache.get(k);
}

// ------------------------------------------------------------------ limb (rubber hose)
class Hose {
  constructor(radius, color, segs = 12, rad = 6) {
    this.segs = segs; this.rad = rad; this.radius = radius;
    const n = (segs + 1) * rad;
    this.pos = new Float32Array(n * 3);
    const idx = [];
    for (let i = 0; i < segs; i++) for (let j = 0; j < rad; j++) {
      const a = i * rad + j, b = i * rad + (j + 1) % rad, c = (i + 1) * rad + j, d = (i + 1) * rad + (j + 1) % rad;
      idx.push(a, c, b, b, c, d);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    geo.setIndex(idx);
    this.geo = geo;
    this.mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.7 }));
    this.mesh.castShadow = true; this.mesh.frustumCulled = false;
    this._a = new THREE.Vector3(); this._m = new THREE.Vector3(); this._b = new THREE.Vector3();
    this._t = new THREE.Vector3(); this._n = new THREE.Vector3(); this._bn = new THREE.Vector3(); this._p = new THREE.Vector3();
  }
  update(a, b, mid) {
    const { segs, rad, radius, pos } = this;
    // quadratic bezier whose midpoint passes through `mid`
    const c = this._m.copy(mid).multiplyScalar(2).sub(this._a.copy(a).add(b).multiplyScalar(0.5));
    for (let i = 0; i <= segs; i++) {
      const u = i / segs, iu = 1 - u;
      this._p.set(
        iu * iu * a.x + 2 * iu * u * c.x + u * u * b.x,
        iu * iu * a.y + 2 * iu * u * c.y + u * u * b.y,
        iu * iu * a.z + 2 * iu * u * c.z + u * u * b.z);
      this._t.set(
        2 * iu * (c.x - a.x) + 2 * u * (b.x - c.x),
        2 * iu * (c.y - a.y) + 2 * u * (b.y - c.y),
        2 * iu * (c.z - a.z) + 2 * u * (b.z - c.z)).normalize();
      const ref = Math.abs(this._t.y) > 0.9 ? this._bn.set(1, 0, 0) : this._bn.set(0, 1, 0);
      this._n.crossVectors(this._t, ref).normalize();
      this._bn.crossVectors(this._t, this._n).normalize();
      for (let j = 0; j < rad; j++) {
        const th = (j / rad) * Math.PI * 2, cs = Math.cos(th) * radius, sn = Math.sin(th) * radius;
        const o = (i * rad + j) * 3;
        pos[o] = this._p.x + this._n.x * cs + this._bn.x * sn;
        pos[o + 1] = this._p.y + this._n.y * cs + this._bn.y * sn;
        pos[o + 2] = this._p.z + this._n.z * cs + this._bn.z * sn;
      }
    }
    this.geo.attributes.position.needsUpdate = true;
    this.geo.computeVertexNormals();
  }
}

// ------------------------------------------------------------------ outfits and hats
const OUTFITS = {
  worker:   { torso: 0x7a4a2a, trousers: INK, hat: 'flatcap', hatColor: 0x4b3a33, extras: '', scale: 1, vest: true },
  boss:     { torso: 0x24304f, trousers: 0x1a2038, hat: 'bowler', hatColor: 0x1d1a22, extras: 'mustache', scale: 1.05, tie: 0xc23a30 },
  kid:      { torso: 0x3b6fc4, trousers: 0x3b6fc4, hat: 'flatcap', hatColor: 0xb8442e, extras: '', scale: 0.8, overalls: true },
  judge:    { torso: 0x17141a, trousers: 0x17141a, hat: 'wig', hatColor: 0xf3efe8, extras: '', scale: 1.05, robe: true },
  engineer: { torso: 0x3f7a62, trousers: 0x2a3d36, hat: 'flatcap', hatColor: 0xd7a53a, extras: 'glasses', scale: 1, tie: 0xf0e6d0 },
  rescuer:  { torso: 0x56607a, trousers: 0x2a2f3d, hat: 'cap', hatColor: 0x2b3a6e, extras: '', scale: 1 },
};

function lam(color, rough = 0.75) { return new THREE.MeshStandardMaterial({ color, roughness: rough }); }
function addWithOutline(parent, mesh, thick = 1.05) {
  mesh.castShadow = true; parent.add(mesh);
  const o = new THREE.Mesh(mesh.geometry, OUTLINE);
  o.scale.setScalar(thick); mesh.add(o);
  return mesh;
}
function makeHat(kind, color) {
  const g = new THREE.Group();
  const m = lam(color, 0.8);
  if (kind === 'flatcap' || kind === 'cap') {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.64, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.52), m);
    dome.scale.set(1, kind === 'cap' ? 0.62 : 0.5, 1.08); dome.position.y = 0.14;
    addWithOutline(g, dome, 1.04);
    const brim = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.05, 0.42), m);
    brim.position.set(0, 0.16, 0.66); brim.rotation.x = 0.18;
    addWithOutline(g, brim, 1.12);
  } else if (kind === 'bowler') {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), m);
    dome.scale.set(1, 1.05, 1); dome.position.y = 0.34; addWithOutline(g, dome, 1.05);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.06, 28), m); brim.position.y = 0.33; addWithOutline(g, brim, 1.05);
  } else if (kind === 'wig') {
    for (const [x, y, z, r] of [[0, 0.5, -0.05, 0.42], [-0.5, 0.18, 0, 0.3], [0.5, 0.18, 0, 0.3], [-0.52, -0.12, -0.05, 0.27], [0.52, -0.12, -0.05, 0.27], [-0.25, 0.46, -0.1, 0.3], [0.25, 0.46, -0.1, 0.3], [0, 0.2, -0.45, 0.4]]) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), m); s.position.set(x, y, z); addWithOutline(g, s, 1.06);
    }
  }
  return g;
}

// ------------------------------------------------------------------ animation library
// Each anim returns a pose in character-local space (+Z forward, +Y up). Home: shoulders (+-0.34, 2.2), hips (+-0.16, 1.4).
const S = Math.sin, C = Math.cos;
const clamp01 = (x) => Math.max(0, Math.min(1, x));
function basePose() {
  return { y: 0, lean: 0, twist: 0, nod: 0, roll: 0, hL: [-0.58, 1.35, 0.05], hR: [0.58, 1.35, 0.05], fL: [-0.2, 0, 0], fR: [0.2, 0, 0], liftL: 0, liftR: 0, crouch: 0 };
}
const ANIMS = {
  idle(t) { const p = basePose(), s = S(t * 2.1); p.y = s * 0.02; p.hL[1] += s * 0.03; p.hR[1] -= s * 0.03; p.roll = S(t * 1.1) * 0.04; p.nod = S(t * 1.7) * 0.03; return p; },
  walk(t, k = 1) { const p = basePose(), ph = t * 7 * k; p.y = Math.abs(S(ph)) * 0.07; p.fL = [-0.2, 0, S(ph) * 0.5]; p.fR = [0.2, 0, -S(ph) * 0.5]; p.liftL = Math.max(0, C(ph)) * 0.3; p.liftR = Math.max(0, -C(ph)) * 0.3; p.hL = [-0.58, 1.4, -S(ph) * 0.4]; p.hR = [0.58, 1.4, S(ph) * 0.4]; p.twist = S(ph) * 0.08; p.roll = S(ph) * 0.04; return p; },
  wade(t, k = 1) { const p = ANIMS.walk(t, 0.55 * k); p.liftL *= 1.4; p.liftR *= 1.4; p.hL = [-0.9, 1.7 + S(t * 2) * 0.1, 0.1]; p.hR = [0.9, 1.7 + C(t * 2) * 0.1, 0.1]; p.lean = 0.12; p.nod = 0.15; return p; },
  run(t, k = 1) { const p = basePose(), ph = t * 11 * k; p.y = Math.abs(S(ph)) * 0.16 + 0.05; p.lean = 0.28; p.fL = [-0.2, 0, S(ph) * 0.85]; p.fR = [0.2, 0, -S(ph) * 0.85]; p.liftL = Math.max(0, C(ph)) * 0.6; p.liftR = Math.max(0, -C(ph)) * 0.6; p.hL = [-0.5, 1.9, -S(ph) * 0.8]; p.hR = [0.5, 1.9, S(ph) * 0.8]; p.twist = S(ph) * 0.2; p.roll = S(ph) * 0.1; return p; },
  wave(t) { const p = ANIMS.idle(t); p.hR = [0.7 + S(t * 9) * 0.22, 3.2, 0.1]; p.roll += 0.05; return p; },
  point(t) { const p = ANIMS.idle(t); p.hR = [0.85, 2.55 + S(t * 6) * 0.05, 1.1]; p.hL = [-0.5, 1.6, 0.2]; p.twist = -0.15; p.nod = -0.05; return p; },
  present(t) { const p = ANIMS.idle(t); p.hR = [1.0 + S(t * 2) * 0.1, 2.35, 0.5]; p.hL = [-0.55, 1.6, 0.15]; p.twist = -0.2; return p; },
  smug(t) { const p = ANIMS.idle(t); p.hL = [-0.5, 1.62, 0.2]; p.hR = [0.52, 1.62, 0.2]; p.lean = -0.07; p.nod = -0.1; p.roll = S(t * 0.9) * 0.05 + 0.05; return p; },
  shock(t) { const p = basePose(), j = Math.abs(S(t * 9)); p.y = j * 0.18; p.hL = [-0.9, 3.0 + S(t * 25) * 0.05, 0]; p.hR = [0.9, 3.0 + C(t * 25) * 0.05, 0]; p.liftL = j * 0.2; p.liftR = j * 0.2; p.lean = -0.12; p.nod = -0.2; return p; },
  panic(t) { const p = ANIMS.run(t, 0.7); p.hL = [-0.9, 2.8 + S(t * 14) * 0.5, 0.2]; p.hR = [0.9, 2.8 + C(t * 14) * 0.5, 0.2]; p.roll = S(t * 18) * 0.1; return p; },
  cower(t) { const p = basePose(); p.crouch = 0.45; p.lean = 0.35; p.hL = [-0.3, 3.05, 0.3]; p.hR = [0.3, 3.05, 0.3]; p.roll = S(t * 30) * 0.04; p.nod = 0.3; return p; },
  sweat(t) { const p = ANIMS.idle(t); p.hR = [0.3 + S(t * 6) * 0.15, 3.35, 0.45]; p.hL = [-0.5, 1.6, 0.2]; p.lean = 0.05; p.nod = 0.1; p.roll = S(t * 2) * 0.05; return p; },
  paint(t) { const p = ANIMS.idle(t); const s = S(t * 3.2); p.hR = [0.35, 2.5 + s * 0.65, 1.0]; p.hL = [-0.5, 1.6, 0.2]; p.lean = 0.15 + s * 0.03; p.twist = 0.1; return p; },
  scoop(t) { const p = ANIMS.idle(t); const s = S(t * 4); p.hR = [0.45, 1.0, 0.95]; p.hL = [-0.2 + s * 0.15, 1.1 + C(t * 4) * 0.2, 0.9]; p.lean = 0.22; p.nod = 0.15; p.y = -0.02; return p; },
  gavel(t) { const p = ANIMS.idle(t); const k = Math.pow(Math.max(0, S(t * 5)), 3); p.hR = [0.5, 2.9 - k * 1.45, 0.6]; p.hL = [-0.5, 1.7, 0.5]; p.lean = 0.05 + k * 0.1; p.nod = k * 0.2; return p; },
  dejected(t) { const p = basePose(); const s = S(t * 1.4); p.lean = 0.28; p.nod = 0.32; p.y = -0.04 + s * 0.015; p.hL = [-0.5, 1.2, 0.0]; p.hR = [0.5, 1.2, 0.0]; p.roll = 0.06; return p; },
};
function poseFor(name, t, k) { return (ANIMS[name] || ANIMS.idle)(t, k); }
function lerpArr(a, b, f) { return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; }
function blendPose(a, b, f) {
  const o = {};
  for (const k of Object.keys(a)) o[k] = Array.isArray(a[k]) ? lerpArr(a[k], b[k], f) : a[k] + (b[k] - a[k]) * f;
  return o;
}

// ------------------------------------------------------------------ character
export class Character {
  constructor(spec) {
    const def = OUTFITS[spec.type] || OUTFITS.worker;
    this.def = def;
    this.extras = def.extras;
    this.root = new THREE.Group();
    this.root.visible = false;
    this.phase = Math.random() * 0;   // deterministic: no randomness
    this.seed = [...(spec.type || 'x')].reduce((a, c) => a + c.charCodeAt(0), 0) * 0.37;

    const body = this.body = new THREE.Group();
    this.root.add(body);
    // torso
    const tmat = lam(def.torso, 0.8);
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.55, 6, 14), tmat);
    torso.scale.set(1, 1, 0.78); torso.position.y = 1.9;
    addWithOutline(body, torso, 1.06);
    if (def.robe) { const sk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.62, 1.0, 16), tmat); sk.position.y = 1.2; addWithOutline(body, sk, 1.04); }
    if (def.tie) { const tie = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, 0.04), lam(def.tie)); tie.position.set(0, 2.02, 0.235); body.add(tie); }
    if (def.vest) { const v = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 0.04), lam(0xe9dcc2)); v.position.set(0, 1.98, 0.235); body.add(v); }
    if (def.overalls) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.04), lam(0xe9c24a)); b.position.set(0, 2.0, 0.235); body.add(b); }
    // head
    this.head = new THREE.Group(); this.head.position.y = 2.95; body.add(this.head);
    this.headMat = new THREE.MeshStandardMaterial({ roughness: 0.55, map: faceTex(this.extras, 'neutral', false), emissive: 0xffffff, emissiveIntensity: 0.28 });
    this.headMat.emissiveMap = this.headMat.map;
    const hm = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 24), this.headMat);
    addWithOutline(this.head, hm, 1.035);
    const hat = makeHat(def.hat, def.hatColor); hat.position.y = 0.38; this.head.add(hat);
    if (spec.hat && spec.hat !== def.hat) { hat.removeFromParent(); const h2 = makeHat(spec.hat, def.hatColor); h2.position.y = 0.38; this.head.add(h2); }
    // limbs
    this.armL = new Hose(0.05, INK); this.armR = new Hose(0.05, INK);
    this.legL = new Hose(0.055, def.trousers, 12, 6); this.legR = new Hose(0.055, def.trousers, 12, 6);
    for (const l of [this.armL, this.armR, this.legL, this.legR]) this.root.add(l.mesh);
    const hmat = lam(0xf5f2ee, 0.6);
    this.handL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), hmat); this.handR = this.handL.clone();
    const smat = lam(0x1d1a22, 0.7);
    this.footL = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), smat); this.footL.scale.set(0.9, 0.5, 1.5); this.footR = this.footL.clone();
    for (const m of [this.handL, this.handR, this.footL, this.footR]) { m.castShadow = true; this.root.add(m); }
    // held props
    this.prop = null;
    const pk = { scoop: 'bucket', paint: 'roller', gavel: 'gavel' };
    this.propKinds = pk;
    this.props = {
      bucket: (() => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.4, 14, 1, true), new THREE.MeshStandardMaterial({ color: 0xb9bcc4, roughness: 0.4, metalness: 0.5, side: THREE.DoubleSide })); const f = new THREE.Mesh(new THREE.CircleGeometry(0.31, 14), new THREE.MeshStandardMaterial({ color: 0xd9962b, roughness: 0.25 })); f.rotation.x = -Math.PI / 2; f.position.y = 0.12; g.add(b, f); b.castShadow = true; return g; })(),
      roller: (() => { const g = new THREE.Group(); const r = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.7, 12), new THREE.MeshStandardMaterial({ color: 0x6b3a1a, roughness: 0.5 })); r.rotation.z = Math.PI / 2; r.position.y = 0.2; const h = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6), lam(INK)); h.position.y = -0.2; g.add(r, h); r.castShadow = true; return g; })(),
      gavel: (() => { const g = new THREE.Group(); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.55, 12), lam(0x6b3d1e)); h.rotation.z = Math.PI / 2; h.position.y = 0.3; const s = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), lam(0x4a2b14)); g.add(h, s); h.castShadow = true; return g; })(),
    };
    for (const p of Object.values(this.props)) { p.visible = false; this.root.add(p); }
    this.cur = null;
  }

  // st: { pos:[x,y,z], rotY:rad, scale, anim, prevAnim, animT (secs since anim change), face, t, camPos }
  apply(st) {
    const root = this.root;
    root.visible = true;
    const sc = (st.scale || 1) * this.def.scale;
    root.position.set(st.pos[0], st.pos[1], st.pos[2]);
    root.rotation.y = st.rotY; root.scale.setScalar(sc);
    const t = st.t + this.seed;
    const blend = clamp01(st.animT / 0.2);
    const speed = st.speed || 1;
    let pose = poseFor(st.anim, t, speed);
    if (st.prevAnim && blend < 1) pose = blendPose(poseFor(st.prevAnim, t, speed), pose, blend * blend * (3 - 2 * blend));

    // body & head
    const crouch = pose.crouch;
    // rotate the torso about the hip pivot (0,1.4,0)
    const PV = 1.4;
    this.body.position.set(0, pose.y - crouch + PV * (1 - Math.cos(pose.lean)), -PV * Math.sin(pose.lean));
    this.body.rotation.set(pose.lean, pose.twist, pose.roll * 0.5);
    // head tracks camera a little
    let yawToCam = 0;
    if (st.camPos) {
      const dx = st.camPos[0] - st.pos[0], dz = st.camPos[2] - st.pos[2];
      yawToCam = Math.atan2(dx, dz) - st.rotY;
      yawToCam = Math.atan2(Math.sin(yawToCam), Math.cos(yawToCam));
    }
    this.head.rotation.set(pose.nod, Math.max(-0.7, Math.min(0.7, yawToCam)) * 0.55, pose.roll);

    // face
    const blink = ((t * 0.8) % 3.3) < 0.11;
    const map = faceTex(this.extras, st.face || 'neutral', blink);
    if (this.headMat.map !== map) { this.headMat.map = map; this.headMat.emissiveMap = map; this.headMat.needsUpdate = false; }

    // limb targets in root space
    const bodyM = new THREE.Matrix4().compose(this.body.position, new THREE.Quaternion().setFromEuler(this.body.rotation), new THREE.Vector3(1, 1, 1));
    const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
    const sL = V([-0.34, 2.2, 0]).applyMatrix4(bodyM), sR = V([0.34, 2.2, 0]).applyMatrix4(bodyM);
    const hipY = 1.4 - crouch;
    const hL = V([-0.16, hipY, 0]), hR = V([0.16, hipY, 0]);
    const handL = V(pose.hL), handR = V(pose.hR);
    const fL = V(pose.fL), fR = V(pose.fR); fL.y += pose.liftL + 0.07; fR.y += pose.liftR + 0.07;
    const reach = (a, b, L, out, fwd, hose, shoulder) => {
      const d = a.distanceTo(b);
      if (d > L) b.copy(a).add(b.clone().sub(a).setLength(L));
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const slack = Math.sqrt(Math.max(0, (L / 2) ** 2 - (Math.min(d, L) / 2) ** 2));
      const bend = new THREE.Vector3(out, 0, fwd).normalize().multiplyScalar(slack * 1.05 + 0.02);
      hose.update(a, b, mid.add(bend));
    };
    reach(sL, handL, 1.5, -0.7, -0.55, this.armL);
    reach(sR, handR, 1.5, 0.7, -0.55, this.armR);
    reach(hL, fL, 1.45, -0.15, 0.95, this.legL);
    reach(hR, fR, 1.45, 0.15, 0.95, this.legR);
    this.handL.position.copy(handL); this.handR.position.copy(handR);
    this.footL.position.copy(fL); this.footR.position.copy(fR);
    this.footL.position.y = Math.max(0.07, fL.y - 0.02); this.footR.position.y = Math.max(0.07, fR.y - 0.02);

    // prop
    const pk = this.propKinds[st.anim];
    for (const [k, p] of Object.entries(this.props)) p.visible = (k === pk);
    if (pk) {
      const p = this.props[pk];
      p.position.copy(handR); p.rotation.set(0, 0, 0);
      if (pk === 'bucket') p.position.add(new THREE.Vector3(0, 0, 0.12));
      if (pk === 'roller') { p.rotation.set(0.5, 0, 0); }
      if (pk === 'gavel') { p.rotation.set(-0.4 - Math.max(0, Math.sin(t * 5)) * 0.6, 0, 0); }
    }
  }
  hide() { this.root.visible = false; }
}
