/**
 * omega_dunes_bg.js
 * ─────────────────────────────────────────────────────────────────
 * Static WebGL dune background for custom website builds.
 * No mouse reactivity. No animation loop. Renders once on load.
 *
 * USAGE A — plain script tag (auto-inits behind document.body)
 * ─────────────────────────────────────────────────────────────────
 *   <script src="omega_dunes_bg.js"></script>
 *
 * USAGE B — ES module import
 * ─────────────────────────────────────────────────────────────────
 *   import { initDunes } from './omega_dunes_bg.js';
 *   initDunes();                                     // mounts on body
 *   initDunes(document.getElementById('bg-mount')); // specific container
 *
 * DEPENDENCY — Three.js r128
 * ─────────────────────────────────────────────────────────────────
 *   npm:  npm install three
 *         then change the import block below to: import * as THREE from 'three';
 *
 *   CDN:  If THREE is already on window (global), this file uses it directly.
 *         If not found, the CDN build is loaded automatically.
 *
 * VISUAL SPEC
 * ─────────────────────────────────────────────────────────────────
 *   Reference:  Matte studio dune photograph (Image 1)
 *   Modified:
 *     Background lightened   #ADADAD → #CECECE  (+18% luminance)
 *     Shadow depth reduced   ambient 0.90 / key 0.13  (from 0.60/0.55)
 *     Dune heights           42% of photographic reference
 *     Mesh fidelity          200×200 verts desktop, 110×110 mobile
 *
 * ─────────────────────────────────────────────────────────────────
 */

// ── If bundling with npm Three.js, REPLACE the _autoInit CDN loader
//    at the bottom with: import * as THREE from 'three';
//    and remove the typeof THREE check.


// ═════════════════════════════════════════════════════════════════
//  VISUAL CONFIGURATION
// ═════════════════════════════════════════════════════════════════
const CFG = {
  segsDesktop  : 220,          // 221×221 = 48,841 verts — extra fidelity for smooth curves
  segsMobile   : 110,          // 111×111 = 12,321 verts

  planeW       : 12.0,
  planeD       : 16.0,

  // Camera — low-angle studio framing matching reference image.
  // Y=0.45 puts the lens near surface level so dunes rise dramatically.
  // LookAt aims toward the left peak so it dominates the left of frame.
  camPos  : [ 0.0,  0.45,  3.50],
  camLook : [-0.5,  0.90,  0.0 ],
  fov     : 52,

  // Lighting — strong directional key from upper-left creates the soft
  // highlight/shadow contrast visible in the reference photograph.
  // Ambient is kept low so valleys fall into clear shadow.
  ambient : { intensity: 0.48 },
  key     : { intensity: 1.05, pos: [-3.5,  5.5,  3.5] },  // upper-left, in front
  fill    : { intensity: 0.30, pos: [ 4.5,  3.0,  2.0] },  // right fill, softens shadows
  rim     : { intensity: 0.06, pos: [ 0.0, -1.0, -3.5] },  // subtle back-rim

  // Background + fog — must stay in sync with body { background: #CECECE }
  bgColor    : 0xCECECE,
  fogColor   : 0xCECECE,
  fogDensity : 0.11,

  // Surface — near-white matte, matching the photograph's bright dune faces
  matColor    : 0xF5F5F5,
  matRoughness: 0.96,
  matMetal    : 0.00,

  // Full-height dunes — matches photographic reference (was 0.42, far too flat)
  duneScale : 1.0,

  // Vignette — subtle edge darkening matching studio fall-off
  vignette : 'radial-gradient(ellipse 85% 75% at 50% 42%, transparent 28%, rgba(90,90,90,0.20) 100%)',
};


// ═════════════════════════════════════════════════════════════════
//  PERLIN NOISE  (zero external dependencies)
// ═════════════════════════════════════════════════════════════════
const _P = (() => {
  const src = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,
    103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,
    252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,
    68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,
    230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,
    76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,
    186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,
    59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,
    70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,
    178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,
    81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,
    115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,
    195,78,66,215,61,156,180];
  const p = new Array(512);
  for (let i = 0; i < 256; i++) p[i] = p[i + 256] = src[i];
  return p;
})();

function _fd(t)       { return t*t*t*(t*(t*6-15)+10); }
function _lp(t,a,b)   { return a+t*(b-a); }
function _gd(h,x,y,z) {
  h &= 15;
  const u = h<8?x:y, v = h<4?y:(h===12||h===14?x:z);
  return ((h&1)?-u:u)+((h&2)?-v:v);
}
function _noise(x, y, z) {
  z = z || 0;
  const X=Math.floor(x)&255, Y=Math.floor(y)&255, Z=Math.floor(z)&255;
  x-=Math.floor(x); y-=Math.floor(y); z-=Math.floor(z);
  const u=_fd(x),v=_fd(y),w=_fd(z);
  const A=_P[X]+Y,AA=_P[A]+Z,AB=_P[A+1]+Z,B=_P[X+1]+Y,BA=_P[B]+Z,BB=_P[B+1]+Z;
  return _lp(w,
    _lp(v,_lp(u,_gd(_P[AA],x,y,z),_gd(_P[BA],x-1,y,z)),
          _lp(u,_gd(_P[AB],x,y-1,z),_gd(_P[BB],x-1,y-1,z))),
    _lp(v,_lp(u,_gd(_P[AA+1],x,y,z-1),_gd(_P[BA+1],x-1,y,z-1)),
          _lp(u,_gd(_P[AB+1],x,y-1,z-1),_gd(_P[BB+1],x-1,y-1,z-1))));
}

// 4-octave fBm — richer organic surface detail than single-octave noise
function _fbm(x, y) {
  var v=0, a=0.5, f=1.0, m=0;
  for (var o=0;o<4;o++) { v+=_noise(x*f,y*f)*a; m+=a; a*=0.5; f*=2.0; }
  return v/m;
}


// ═════════════════════════════════════════════════════════════════
//  DUNE HEIGHT MAP
//
//  Two-mound composition matching the reference photograph:
//    g1 — LEFT dominant mound. Large, tall, partially cuts left edge.
//         Wide Gaussian spread so it reads as one long sweeping form.
//    g2 — RIGHT secondary mound. Shorter, further right, lower peak.
//         Creates the valley-then-rise visible on the right of frame.
//
//  Noise is intentionally low-amplitude — the reference surface is
//  extremely smooth (matte studio material), not sandy/gritty.
//
//  Coordinate system (after PlaneGeometry.rotateX(-PI/2)):
//    pos.getX(i) → world X  (horizontal,  ±6.0 with planeW=12)
//    pos.getY(i) → world Y  = HEIGHT  ← what we set here
//    pos.getZ(i) → world Z  depth  (+8 near camera, -8 far horizon)
// ═════════════════════════════════════════════════════════════════
function _duneH(wx, wz) {
  var s = CFG.duneScale;

  // g1 — left dominant mound: wide, tall, center at (-1.8, 1.1)
  // Low exponent coefficients = broad, smooth Gaussian — matches the
  // long rolling left peak in the reference.
  var g1 = 1.15 * Math.exp(-((wx+1.8)*(wx+1.8)*0.18 + (wz-1.1)*(wz-1.1)*0.22));

  // g2 — right secondary mound: lower amplitude, slightly closer to camera
  var g2 = 0.70 * Math.exp(-((wx-2.6)*(wx-2.6)*0.16 + (wz-0.8)*(wz-0.8)*0.25));

  // Very low-frequency noise only — keeps the surface glassy-smooth.
  // High-frequency (nHi) removed: the reference has no sandy micro-detail.
  var nLo  = _fbm(wx*0.22+4.3, wz*0.22+1.7) * 0.030;
  var nMid = _fbm(wx*0.48+2.1, wz*0.48+3.8) * 0.012;

  // Taper — geometry dissolves at edges and toward the far horizon
  var eX = Math.max(0, 1.0 - Math.abs(wx) * 0.11);
  var eZ = Math.max(0, Math.min(1.0, (wz + 6.0) * 0.14));

  return ((g1 + g2) * eX * s + nLo + nMid) * eZ;
}


// ═════════════════════════════════════════════════════════════════
//  PUBLIC API
// ═════════════════════════════════════════════════════════════════

/**
 * initDunes(container?)
 * Builds and renders the static dune scene once.
 *
 * @param {HTMLElement} [container=document.body] - Where to mount the canvas.
 * @returns {object} - The renderer, in case you need to dispose it.
 */
function initDunes(container) {
  var root = container || document.body;
  if (root.__omegaDunesInit) return;   // prevent double-init
  root.__omegaDunesInit = true;

  var W = window.innerWidth;
  var H = window.innerHeight;
  var isMobile = W < 768 || navigator.maxTouchPoints > 0;
  var SEGS  = isMobile ? CFG.segsMobile : CFG.segsDesktop;
  var TOTAL = (SEGS + 1) * (SEGS + 1);

  // ── Scene ──────────────────────────────────────────────────────
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(CFG.bgColor);
  scene.fog        = new THREE.FogExp2(new THREE.Color(CFG.fogColor), CFG.fogDensity);

  // ── Camera ─────────────────────────────────────────────────────
  var camera = new THREE.PerspectiveCamera(CFG.fov, W/H, 0.05, 50);
  camera.position.set(CFG.camPos[0], CFG.camPos[1], CFG.camPos[2]);
  camera.lookAt(CFG.camLook[0], CFG.camLook[1], CFG.camLook[2]);

  // ── Renderer ───────────────────────────────────────────────────
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  if (renderer.outputEncoding !== undefined) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  }

  // Canvas — fixed, full-screen, behind all content
  var cv = renderer.domElement;
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = [
    'position:fixed', 'top:0', 'left:0',
    'width:100%',     'height:100%',
    'z-index:-1',     'pointer-events:none',
    'touch-action:none', 'display:block',
  ].join(';');
  root.insertBefore(cv, root.firstChild);

  // CSS vignette — subtle studio edge-lighting falloff (matches photo)
  var vig = document.createElement('div');
  vig.setAttribute('aria-hidden', 'true');
  vig.style.cssText = [
    'position:fixed', 'inset:0',
    'background:' + CFG.vignette,
    'pointer-events:none', 'z-index:-1',
  ].join(';');
  root.insertBefore(vig, root.firstChild);

  // ── Lighting ───────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, CFG.ambient.intensity));

  var kl = new THREE.DirectionalLight(0xfffcf8, CFG.key.intensity);
  kl.position.set(CFG.key.pos[0], CFG.key.pos[1], CFG.key.pos[2]);
  scene.add(kl);

  var fl = new THREE.DirectionalLight(0xffffff, CFG.fill.intensity);
  fl.position.set(CFG.fill.pos[0], CFG.fill.pos[1], CFG.fill.pos[2]);
  scene.add(fl);

  var rl = new THREE.DirectionalLight(0xffffff, CFG.rim.intensity);
  rl.position.set(CFG.rim.pos[0], CFG.rim.pos[1], CFG.rim.pos[2]);
  scene.add(rl);

  // ── Terrain ────────────────────────────────────────────────────
  var geom = new THREE.PlaneGeometry(CFG.planeW, CFG.planeD, SEGS, SEGS);
  geom.rotateX(-Math.PI / 2);

  var pos = geom.attributes.position;
  for (var i = 0; i < TOTAL; i++) {
    pos.setY(i, _duneH(pos.getX(i), pos.getZ(i)));
  }
  pos.needsUpdate = true;
  geom.computeVertexNormals();

  scene.add(new THREE.Mesh(geom, new THREE.MeshStandardMaterial({
    color:     CFG.matColor,
    roughness: CFG.matRoughness,
    metalness: CFG.matMetal,
  })));

  // ── ONE render call — no loop ──────────────────────────────────
  renderer.render(scene, camera);

  // ── Resize: re-render once on viewport change ──────────────────
  window.addEventListener('resize', function() {
    var nW = window.innerWidth, nH = window.innerHeight;
    camera.aspect = nW / nH;
    camera.updateProjectionMatrix();
    renderer.setSize(nW, nH);
    renderer.render(scene, camera);
  }, { passive: true });

  return renderer;
}

// Expose on window for plain script-tag usage
if (typeof window !== 'undefined') {
  window.initDunes = initDunes;
}


// ═════════════════════════════════════════════════════════════════
//  AUTO-INIT for plain <script src="omega_dunes_bg.js"> usage
// ═════════════════════════════════════════════════════════════════
function _boot() {
  if (typeof THREE !== 'undefined') {
    initDunes();
    return;
  }
  // Three.js not present — load CDN build silently then init
  var s   = document.createElement('script');
  s.src     = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  s.onload  = function() { initDunes(); };
  s.onerror = function() { console.warn('[omega_dunes_bg] Three.js failed to load.'); };
  document.head.appendChild(s);
}

if (typeof document !== 'undefined') {
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', _boot)
    : _boot();
}
