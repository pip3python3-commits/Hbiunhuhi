// Timeline driver: window.init(timeline) then window.renderFrame(t) -> draws one deterministic frame.
import * as THREE from 'three';
import { buildWorld } from './world.js';
import { Character } from './rig.js';
import { createLook } from './look.js';
import { GRADES } from './grades.js';
import { normalizeBeat } from './shots.js';

const q = new URLSearchParams(location.search);
const W = +(q.get('w') || 720), H = +(q.get('h') || 1280);
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const EASE = { linear: (x) => x, inOut: smooth, out: (x) => 1 - Math.pow(1 - x, 2.2), in: (x) => x * x };
const lerp = (a, b, f) => a + (b - a) * f;
const lerp3 = (a, b, f) => [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)];
const WORLD_DEFAULT = { paint: 0, leak: 0, swell: 0, burst: 0, waveZ: -300, flood: 0, aftermath: 0, thermo: 0, rivets: 0, droop: 0, protoDroop: 0 };

let S = null;   // state

window.init = async function (timeline) {
  await document.fonts.ready;
  const FMT = timeline.format || {};
  timeline.beats.forEach(normalizeBeat);
  const canvas = document.getElementById('c');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NoToneMapping;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#bcd8f2', 90, 420);
  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 2000);

  const hemi = new THREE.HemisphereLight('#8fb8ff', '#34202b', 1.0); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff0cc', 3);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera; sc.left = -34; sc.right = 34; sc.top = 34; sc.bottom = -34; sc.near = 1; sc.far = 220;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.06; sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight('#ffffff', 0.9); scene.add(fill, fill.target);

  const world = buildWorld(scene);
  const look = createLook(renderer, scene, camera, W, H, { paint: +(q.get('paint') ?? 1), msaa: +(q.get('msaa') ?? 4) });

  // cast
  const chars = {};
  for (const [id, spec] of Object.entries(timeline.cast)) { chars[id] = new Character(spec); scene.add(chars[id].root); }

  // world-state keyframes, carried across beats
  const wstates = []; let prev = { ...WORLD_DEFAULT };
  for (const b of timeline.beats) {
    const from = { ...prev }, to = { ...prev };
    for (const [k, v] of Object.entries(b.world || {})) { if (Array.isArray(v)) { from[k] = v[0]; to[k] = v[1]; } else { from[k] = v; to[k] = v; } }
    wstates.push({ from, to }); prev = to;
  }

  // caption element
  const cap = document.getElementById('cap');
  cap.style.fontSize = Math.round(H * (FMT.captionSize || 0.052)) + 'px';
  cap.style.top = Math.round(H * (FMT.captionY || 0.70)) + 'px';
  const title = document.getElementById('title');
  title.style.fontSize = Math.round(H * (W > H ? 0.11 : 0.07)) + 'px';
  const r = Math.max(2, Math.round(H * (W > H ? 0.0055 : 0.0075))); const sh = [];
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; sh.push(`${(Math.cos(a) * r).toFixed(1)}px ${(Math.sin(a) * r).toFixed(1)}px 0 #1a0f16`); }
  sh.push(`0 ${Math.round(r * 1.6)}px ${Math.round(r * 2)}px rgba(0,0,0,.45)`);
  cap.style.textShadow = sh.join(',');

  const basePaint = +(q.get('paint') ?? 1);
  S = { basePaint, renderer, scene, camera, hemi, sun, fill, world, look, chars, timeline, wstates, cap, title, fovScale: FMT.fovScale || 1 };
  return { duration: timeline.duration, beats: timeline.beats.length };
};

function findBeat(tl, t) {
  const b = tl.beats; let i = 0;
  while (i < b.length - 1 && t >= b[i + 1].start) i++;
  return i;
}
function bracket(kfs, p, key) {
  const has = kfs.filter((k) => k[key] !== undefined);
  if (!has.length) return null;
  if (p <= has[0].at) return has[0][key];
  for (let i = 0; i < has.length - 1; i++) {
    const a = has[i], b = has[i + 1];
    if (p >= a.at && p <= b.at) return key === 'rot' ? lerpAngle(a[key], b[key], smooth((p - a.at) / Math.max(1e-6, b.at - a.at))) : lerp3(a[key], b[key], (p - a.at) / Math.max(1e-6, b.at - a.at));
  }
  return has[has.length - 1][key];
}
function lerpAngle(a, b, f) { let d = ((b - a + 540) % 360) - 180; return a + d * f; }

window.renderFrame = function (t) {
  const { renderer, scene, camera, hemi, sun, fill, world, look, chars, timeline, wstates, cap, title, fovScale } = S;
  const bi = findBeat(timeline, t), beat = timeline.beats[bi];
  const lt = Math.max(0, t - beat.start);
  const p = clamp01(lt / beat.dur);
  const OFF = world.offset(beat.set), off = OFF[0];

  // world state
  const ws = wstates[bi], st = {};
  for (const k of Object.keys(WORLD_DEFAULT)) st[k] = lerp(ws.from[k], ws.to[k], p);
  world.setSet(beat.set);
  world.setBoard(beat.set === 'court' ? beat.board : null);
  beat._p = p;
  world.update(st, t, beat);

  // grade
  const gr = GRADES[beat.grade] || GRADES.dayCool;
  scene.fog.color.set(gr.fog); scene.fog.near = gr.fogNear; scene.fog.far = gr.fogFar;
  scene.background = new THREE.Color(gr.fog);
  hemi.color.set(gr.hemiSky); hemi.groundColor.set(gr.hemiGnd); hemi.intensity = gr.hemiI * 1.5; fill.color.set(gr.hemiSky).lerp(new THREE.Color('#ffffff'), 0.5);
  sun.color.set(gr.sun); sun.intensity = gr.sunI;
  world.applyGrade(gr);

  // camera
  const cam = beat.cam, e = (EASE[cam.ease] || EASE.inOut)(p);
  const pos = lerp3(cam.from.p, cam.to.p, e), tgt = lerp3(cam.from.t, cam.to.t, e);
  const fov = lerp(cam.from.fov, cam.to.fov, e) * fovScale;
  const sk = (cam.shake || 0);
  const hx = Math.sin(t * 1.3) * 0.04 + Math.sin(t * 2.9 + 1) * 0.02;
  const hy = Math.sin(t * 1.7 + 2) * 0.03;
  const jx = sk * (Math.sin(t * 37.1) + Math.sin(t * 23.7 + 1.3)) * 0.18, jy = sk * (Math.sin(t * 41.3 + 0.4) + Math.sin(t * 19.1)) * 0.18;
  camera.position.set(pos[0] + off + hx + jx, pos[1] + hy + jy, pos[2]);
  camera.up.set(0, 1, 0);
  camera.lookAt(tgt[0] + off, tgt[1], tgt[2]);
  camera.rotateZ(sk * Math.sin(t * 29) * 0.012);
  camera.fov = fov; camera.updateProjectionMatrix();
  const camPos = [camera.position.x, camera.position.y, camera.position.z];

  // sun follows the focus so shadows stay crisp
  const f = new THREE.Vector3(tgt[0] + off, 0, tgt[2]);
  const d = new THREE.Vector3(...gr.sunDir).normalize().multiplyScalar(90);
  fill.position.set(camera.position.x, camera.position.y + 6, camera.position.z + 4); fill.target.position.copy(f); fill.intensity = 0.8;
  sun.position.copy(f).add(d); sun.target.position.copy(f); sun.target.updateMatrixWorld();

  // actors
  const used = new Set();
  for (const a of beat.actors || []) {
    const c = chars[a.id]; if (!c) continue; used.add(a.id);
    const kfs = a.tl;
    const pp = bracket(kfs, p, 'pos') || [0, 0, 0];
    const rot = bracket(kfs, p, 'rot') ?? 0;
    // anim + face = step functions
    let anim = 'idle', prevAnim = null, animAt = -1, face = 'neutral', speed = 1, scale = 1, lastAnimIdx = -1;
    kfs.forEach((k, i) => { if (k.at <= p + 1e-9) { if (k.anim) { lastAnimIdx = i; } } });
    kfs.forEach((k) => { if (k.at <= p + 1e-9) { if (k.face) face = k.face; if (k.speed) speed = k.speed; if (k.scale) scale = k.scale; } });
    if (lastAnimIdx >= 0) { anim = kfs[lastAnimIdx].anim; animAt = kfs[lastAnimIdx].at; for (let i = lastAnimIdx - 1; i >= 0; i--) if (kfs[i].anim && kfs[i].anim !== anim) { prevAnim = kfs[i].anim; break; } }
    const animT = animAt <= 0 ? 99 : (p - animAt) * beat.dur;
    c.apply({ pos: [pp[0] + off, pp[1], pp[2]], rotY: rot * Math.PI / 180, scale, anim, prevAnim, animT, face, t, speed, camPos });
  }
  for (const [id, c] of Object.entries(chars)) if (!used.has(id)) c.hide();

  // post
  const cut = beat.cut || 'none';
  look.u.whip.value = cut === 'whip' ? Math.pow(Math.max(0, 1 - lt / 0.3), 2) : 0;
  look.u.flash.value = cut === 'flash' ? Math.pow(Math.max(0, 1 - lt / 0.22), 2) * 0.85 : 0;
  look.u.sat.value = gr.sat || 1.1;
  look.u.paint.value = S.basePaint * (beat.paint ?? 1);
  look.composer.render();

  // chapter title card:  "title": {"text":"Chapter 2", "sub":"The Warm Day", "dur":2.6}
  if (beat.title && lt < (beat.title.dur || 2.6)) {
    const d = beat.title.dur || 2.6, a = Math.min(1, lt / 0.25, (d - lt) / 0.3);
    title.innerHTML = `<div class="t">${beat.title.text}</div>` + (beat.title.sub ? `<div class="s">${beat.title.sub}</div>` : '');
    title.style.opacity = String(Math.max(0, a)); title.style.transform = `translate(-50%,-50%) scale(${(0.94 + 0.06 * Math.max(0, a)).toFixed(3)})`;
  } else title.style.opacity = '0';

  // caption
  const ch = (beat.chunks || []).find((c) => lt >= c.s && lt < c.e);
  if (ch) {
    if (cap.textContent !== ch.text) cap.textContent = ch.text;
    const k = Math.max(0, 1 - (lt - ch.s) / 0.11);
    cap.style.opacity = '1';
    cap.style.transform = `scale(${(1 + 0.2 * k * k).toFixed(3)})`;
  } else { cap.style.opacity = '0'; }
  return { beat: beat.id, p };
};

window.ready = true;
