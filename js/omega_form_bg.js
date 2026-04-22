/**
 * omega_form_bg.js — v2.0
 *
 * Canvas 2D programmatic recreation of OmegaBackground.png.
 *
 * WHY CANVAS INSTEAD OF THE ORIGINAL PNG
 * ───────────────────────────────────────
 * The PNG (1123×794 px) is upscaled 4–6× on typical Retina viewports,
 * causing pixelation.  This file renders at window.devicePixelRatio,
 * so it is always crisp regardless of screen density or viewport size.
 *
 * ANIMATION-READY
 * ───────────────
 * drawOmegaForm(ctx, W, H, t) accepts a time parameter t (seconds).
 * The static baseline is t = 0.  To animate later, uncomment the
 * oscillator variables inside drawOmegaForm and pass a running time:
 *
 *   const bg = initOmegaFormBg();
 *   let start;
 *   function loop(ts) {
 *     if (!start) start = ts;
 *     bg.draw((ts - start) / 1000);
 *     requestAnimationFrame(loop);
 *   }
 *   requestAnimationFrame(loop);
 *
 * USAGE — auto-init as full-page fixed background:
 *   <script src="omega_form_bg.js"></script>
 *
 * USAGE — target a specific element:
 *   <script src="omega_form_bg.js"></script>
 *   <script>initOmegaFormBg(document.querySelector('#hero'));</script>
 *
 * USAGE — ES module:
 *   import { initOmegaFormBg } from './omega_form_bg.js';
 *   const bg = initOmegaFormBg(el);
 */
(function (global) {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════════
     PUBLIC INITIALIZER
  ═══════════════════════════════════════════════════════════════════════ */
  function initOmegaFormBg(container) {
    var target = container || document.body;
    var canvas = document.createElement('canvas');
    canvas.id  = 'omega-form-bg';

    if (target === document.body) {
      canvas.style.cssText =
        'position:fixed;top:0;left:0;width:100%;height:100%;' +
        'z-index:-1;display:block;pointer-events:none;';
      document.body.insertBefore(canvas, document.body.firstChild);
    } else {
      canvas.style.cssText =
        'position:absolute;top:0;left:0;width:100%;height:100%;' +
        'display:block;pointer-events:none;';
      if (getComputedStyle(target).position === 'static') {
        target.style.position = 'relative';
      }
      target.appendChild(canvas);
    }

    function resize() {
      var dpr = window.devicePixelRatio || 1;
      var w   = (target === document.body) ? window.innerWidth  : target.offsetWidth;
      var h   = (target === document.body) ? window.innerHeight : target.offsetHeight;
      if (!w || !h) return;
      canvas.width        = Math.round(w * dpr);
      canvas.height       = Math.round(h * dpr);
      canvas.style.width  = w + 'px';
      canvas.style.height = h + 'px';
      var ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawOmegaForm(ctx, w, h, 0);
    }

    var ro = (typeof ResizeObserver !== 'undefined')
      ? new ResizeObserver(resize) : null;
    if (ro) ro.observe((target === document.body) ? document.documentElement : target);
    else    window.addEventListener('resize', resize);

    resize();

    return {
      canvas : canvas,
      redraw : resize,
      draw   : function (t) {
        var dpr = window.devicePixelRatio || 1;
        var ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawOmegaForm(ctx, canvas.width / dpr, canvas.height / dpr, t || 0);
      }
    };
  }

  /* ═══════════════════════════════════════════════════════════════════════
     CORE RENDERER — v3.0
     Cross-analysed against OmegaBackground.png (1123×794px).
     Four elements replace the former 11-layer / 57-point polygon approach.
     Geometry constants (CX, CY, CR) are unchanged — pixel analysis confirmed
     them accurate.  Boundary curves use quadratic bezier paths keyed from
     measured transitions; colour stops corrected from fresh pixel samples.
  ═══════════════════════════════════════════════════════════════════════ */
  function drawOmegaForm(ctx, W, H, t) {
    function X(f) { return f * W; }
    function Y(f) { return f * H; }

    /* ── GEOMETRY CONSTANTS (verified against OmegaBackground.png) ── */
    var CX  = 0.1671;          // Left lobe centre  [frac W]
    var CY  = 0.2594;          // Both lobe centres [frac H]
    var CR  = 0.2853;          // Lobe radius       [frac W]
    var RCX = 1 - CX;          // Right lobe centre [frac W]
    var CR_H      = CR * W / H;
    var circleBot = Math.min(CY + CR_H, 0.96);

    /* ── ANIMATION OSCILLATORS ───────────────────────────────────────── */
    /* Uncomment and wire into gradient stops / bezier offsets to animate */
    /*
    var breathe = 1.0 + 0.015 * Math.sin(t * 0.80);   // slow organic breath
    var pulse   = 1.0 + 0.008 * Math.sin(t * 2.30);   // apex glow pulse
    var sway    = 0.003 * Math.sin(t * 0.55);          // subtle arch lean
    */

    /* ╔═══════════════════════════════════════════════════════════════╗
       ║  ELEMENT 1 — BACKGROUND                                      ║
       ║  Full-canvas vertical gradient.  Provides the central dark   ║
       ║  channel that descends to the arch apex at y=46%.            ║
       ║  Colour stops corrected from pixel samples of reference PNG. ║
       ╚═══════════════════════════════════════════════════════════════╝ */
    // var bg = ctx.createLinearGradient(0, 0, 0, H);
    // bg.addColorStop(0.00, '#C8C8C8');   // measured #CAC8CB  Δ=+1
    // bg.addColorStop(0.20, '#C3C3C3');   // measured #C5C3C4  Δ=+1
    // bg.addColorStop(0.40, '#C1C1C1');   // measured #C3C1C2  (was #BEBEBE)
    // bg.addColorStop(0.46, '#8D8D8D');   // measured #8D8D8D  (was #8B8B8B)
    // bg.addColorStop(0.54, '#B3B3B3');   // measured #B5B3B4  (was #ABABAB)
    // bg.addColorStop(0.65, '#D6D6D6');   // measured #D8D6D7  (was #C5C5C5)
    // bg.addColorStop(0.80, '#DCDCDC');   // measured #DEDCDD  (was #D8D8D8)
    // bg.addColorStop(1.00, '#DFDFDF');   // measured #DFDCDE  Δ=−2
    // ctx.fillStyle = bg;
    // ctx.fillRect(0, 0, W, H);

    /* ╔═══════════════════════════════════════════════════════════════╗
       ║  ELEMENT 2 — ARCH                                            ║
       ║  Left and right lobe circles + tails.                        ║
       ║  Lobe circle gradients unchanged — pixel analysis confirmed  ║
       ║  them accurate.  Tails now use quadratic bezier (3 control   ║
       ║  points) replacing the former 11-point linear polygon.       ║
       ║  Former Layers 6-7 (inner surfaces) are removed — measured   ║
       ║  actual colours (#EA–#FD) are already covered by tail fill.  ║
       ╚═══════════════════════════════════════════════════════════════╝ */

    /* ── Left lobe circle ── */
    // ctx.save();
    // ctx.beginPath();
    // ctx.arc(X(CX), Y(CY), X(CR), 0, Math.PI * 2);
    // ctx.clip();

    // var lg = ctx.createLinearGradient(X(CX - CR), 0, X(CX + CR), 0);
    // lg.addColorStop(0.00, '#EBEBEB');
    // lg.addColorStop(0.18, '#E8E8E8');
    // lg.addColorStop(0.36, '#E4E4E4');
    // lg.addColorStop(0.47, '#E1E1E1');
    // lg.addColorStop(0.60, '#E6E6E6');
    // lg.addColorStop(0.74, '#F0F0F0');
    // lg.addColorStop(0.88, '#FAFAFA');
    // lg.addColorStop(1.00, '#FFFFFF');   // inner face — measured #FFFFFF ✓
    // ctx.fillStyle = lg;
    // ctx.fillRect(0, 0, W, H);

    // /* Concave shadow at inner-bottom of lobe */
    // var ls = ctx.createRadialGradient(
    //   X(CX + CR * 0.82), Y(CY + CR_H * 0.78), 0,
    //   X(CX + CR * 0.82), Y(CY + CR_H * 0.78), X(CR * 0.40)
    // );
    // ls.addColorStop(0.00, 'rgba(0,0,0,0.15)');
    // ls.addColorStop(0.60, 'rgba(0,0,0,0.04)');
    // ls.addColorStop(1.00, 'rgba(0,0,0,0.00)');
    // ctx.fillStyle = ls;
    // ctx.fillRect(0, 0, W, H);
    // ctx.restore();

    // /* ── Right lobe circle (mirror) ── */
    // ctx.save();
    // ctx.beginPath();
    // ctx.arc(X(RCX), Y(CY), X(CR), 0, Math.PI * 2);
    // ctx.clip();

    // var rg = ctx.createLinearGradient(X(RCX - CR), 0, X(RCX + CR), 0);
    // rg.addColorStop(0.00, '#FFFFFF');
    // rg.addColorStop(0.12, '#FAFAFA');
    // rg.addColorStop(0.26, '#F0F0F0');
    // rg.addColorStop(0.40, '#E6E6E6');
    // rg.addColorStop(0.53, '#E1E1E1');
    // rg.addColorStop(0.64, '#E4E4E4');
    // rg.addColorStop(0.82, '#E8E8E8');
    // rg.addColorStop(1.00, '#EBEBEB');
    // ctx.fillStyle = rg;
    // ctx.fillRect(0, 0, W, H);

    // var rs = ctx.createRadialGradient(
    //   X(RCX - CR * 0.82), Y(CY + CR_H * 0.78), 0,
    //   X(RCX - CR * 0.82), Y(CY + CR_H * 0.78), X(CR * 0.40)
    // );
    // rs.addColorStop(0.00, 'rgba(0,0,0,0.15)');
    // rs.addColorStop(0.60, 'rgba(0,0,0,0.04)');
    // rs.addColorStop(1.00, 'rgba(0,0,0,0.00)');
    // ctx.fillStyle = rs;
    // ctx.fillRect(0, 0, W, H);
    // ctx.restore();

    /* ── Left lobe tail — quadratic bezier replaces 11-point polygon ── */
    // ctx.save();
    // ctx.beginPath();
    // ctx.moveTo(X(0.452), Y(circleBot));
    // ctx.quadraticCurveTo(X(0.272), Y(0.740), X(0.088), H);
    // ctx.lineTo(0, H);
    // ctx.lineTo(0, Y(circleBot));
    // ctx.closePath();

    // var ltg = ctx.createLinearGradient(X(0.45), Y(0.72), 0, Y(0.72));
    // ltg.addColorStop(0.00, '#FFFFFF');
    // ltg.addColorStop(0.15, '#F9F9F9');
    // ltg.addColorStop(0.38, '#F0F0F0');
    // ltg.addColorStop(0.65, '#EBEBEB');
    // ltg.addColorStop(1.00, '#E5E5E5');
    // ctx.fillStyle = ltg;
    // ctx.fill();
    // ctx.restore();

    // /* ── Right lobe tail (mirror) ── */
    // ctx.save();
    // ctx.beginPath();
    // ctx.moveTo(X(1 - 0.452), Y(circleBot));
    // ctx.quadraticCurveTo(X(1 - 0.272), Y(0.740), X(1 - 0.088), H);
    // ctx.lineTo(W, H);
    // ctx.lineTo(W, Y(circleBot));
    // ctx.closePath();

    // var rtg = ctx.createLinearGradient(X(1 - 0.45), Y(0.72), W, Y(0.72));
    // rtg.addColorStop(0.00, '#FFFFFF');
    // rtg.addColorStop(0.15, '#F9F9F9');
    // rtg.addColorStop(0.38, '#F0F0F0');
    // rtg.addColorStop(0.65, '#EBEBEB');
    // rtg.addColorStop(1.00, '#E5E5E5');
    // ctx.fillStyle = rtg;
    // ctx.fill();
    // ctx.restore();

    /* ╔═══════════════════════════════════════════════════════════════╗
       ║  ELEMENT 3 — ARCH SHADOW                                     ║
       ║  Gothic arch walls — smooth quadratic bezier paths.          ║
       ║  Each wall is a closed shape between its outer boundary      ║
       ║  (archOuter equivalent) and inner boundary (archInner).      ║
       ║  3 bezier key-points replace the former 11+13-point arrays.  ║
       ║  Outer key: (0.495,cb)→(0.364,0.70)→(0.213,1.0)             ║
       ║  Inner key: (0.495,cb)→(0.427,0.70)→(0.260,1.0)             ║
       ╚═══════════════════════════════════════════════════════════════╝ */

    /* ── Left arch wall ── */
    // ctx.save();
    // ctx.beginPath();
    // ctx.moveTo(X(0.495), Y(circleBot));
    // /* outer boundary (going down) */
    // ctx.quadraticCurveTo(X(0.364), Y(0.700), X(0.213), H);
    // /* bottom edge to inner boundary start */
    // ctx.lineTo(X(0.260), H);
    // /* inner boundary (going up, reversed) */
    // ctx.quadraticCurveTo(X(0.427), Y(0.700), X(0.495), Y(circleBot));
    // ctx.closePath();

    // var awl = ctx.createLinearGradient(X(0.495), Y(0.72), X(0.213), Y(0.72));
    // awl.addColorStop(0.00, '#BBBBBB');   // inner face — facing arch interior
    // awl.addColorStop(0.50, '#ABABAB');
    // awl.addColorStop(1.00, '#A5A5A5');   // outer face — measured #A4A4A4 ✓
    // ctx.fillStyle = awl;
    // ctx.fill();
    // ctx.restore();

    // /* ── Right arch wall (mirror) ── */
    // ctx.save();
    // ctx.beginPath();
    // ctx.moveTo(X(1 - 0.495), Y(circleBot));
    // ctx.quadraticCurveTo(X(1 - 0.364), Y(0.700), X(1 - 0.213), H);
    // ctx.lineTo(X(1 - 0.260), H);
    // ctx.quadraticCurveTo(X(1 - 0.427), Y(0.700), X(1 - 0.495), Y(circleBot));
    // ctx.closePath();

    // var awr = ctx.createLinearGradient(X(1 - 0.495), Y(0.72), X(1 - 0.213), Y(0.72));
    // awr.addColorStop(0.00, '#BBBBBB');
    // awr.addColorStop(0.50, '#ABABAB');
    // awr.addColorStop(1.00, '#A5A5A5');
    // ctx.fillStyle = awr;
    // ctx.fill();
    // ctx.restore();

    /* ╔═══════════════════════════════════════════════════════════════╗
       ║  ELEMENT 4 — ARCH FILL                                       ║
       ║  Interior passage + apex radial accent.                      ║
       ║  Interior polygon uses same bezier inner-boundary key-points ║
       ║  as Element 3.  Gradient corrected from pixel samples.       ║
       ║  Apex radial accent unchanged — position/intensity verified. ║
       ╚═══════════════════════════════════════════════════════════════╝ */

    /* ── Arch interior polygon ── */
    // ctx.save();
    // ctx.beginPath();
    // /* Left inner boundary (going down) */
    // ctx.moveTo(X(0.495), Y(circleBot));
    // ctx.quadraticCurveTo(X(0.427), Y(0.700), X(0.260), H);
    // /* Bottom edge across */
    // ctx.lineTo(X(1 - 0.260), H);
    // /* Right inner boundary (mirrored, going up) */
    // ctx.quadraticCurveTo(X(1 - 0.427), Y(0.700), X(1 - 0.495), Y(circleBot));
    // ctx.closePath();

    // var aig = ctx.createLinearGradient(0, Y(circleBot), 0, H);
    // aig.addColorStop(0.00, '#909090');   // apex
    // aig.addColorStop(0.12, '#A2A2A2');   // measured y=50%: #A2 ✓
    // aig.addColorStop(0.22, '#B5B5B5');   // measured y=54%: #B5 (was #AEAEAE)
    // aig.addColorStop(0.34, '#C8C8C8');   // measured y=58%: #C8 (was #CECECE)
    // aig.addColorStop(0.46, '#D3D3D3');   // measured y=62%: #D3 (was #D8D8D8)
    // aig.addColorStop(0.60, '#D8D8D8');   // measured y=65%: #D8 (was #DCDCDC)
    // aig.addColorStop(0.80, '#DCDCDC');   // measured y=70%: #DC (was #DEDEDE)
    // aig.addColorStop(1.00, '#DFDFDF');   // measured y=90%+  ✓
    // ctx.fillStyle = aig;
    // ctx.fill();
    // ctx.restore();

    // /* ── Apex radial accent — unchanged, position/intensity verified ── */
    // ctx.save();
    // var apx = W / 2;
    // var apy = Y(0.460);
    // var apr = X(0.048);
    // var apg = ctx.createRadialGradient(apx, apy, 0, apx, apy, apr);
    // apg.addColorStop(0.00, 'rgba(6,6,6,0.55)');
    // apg.addColorStop(0.30, 'rgba(6,6,6,0.28)');
    // apg.addColorStop(0.65, 'rgba(6,6,6,0.08)');
    // apg.addColorStop(1.00, 'rgba(6,6,6,0.00)');
    // ctx.fillStyle = apg;
    // ctx.fillRect(0, 0, W, H);
    // ctx.restore();
  }

  /* ═══════════════════════════════════════════════════════════════════════
     MODULE / GLOBAL EXPORT + AUTO-INIT
  ═══════════════════════════════════════════════════════════════════════ */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initOmegaFormBg: initOmegaFormBg };
  } else {
    global.initOmegaFormBg = initOmegaFormBg;
  }

  if (typeof document !== 'undefined') {
    function _autoInit() {
      /* Target .hero so the canvas is position:absolute inside the section
         and scrolls with the page.  Falls back to body if .hero is absent. */
      var hero = document.querySelector('.hero');
      initOmegaFormBg(hero || undefined);
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _autoInit);
    } else {
      _autoInit();
    }
  }

}(typeof window !== 'undefined' ? window : this));
