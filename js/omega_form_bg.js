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
     CORE RENDERER
     All geometry measured via pixel-level analysis of the 1123×794
     reference image. Coordinates normalised: x = fraction of W,
     y = fraction of H.
  ═══════════════════════════════════════════════════════════════════════ */
  function drawOmegaForm(ctx, W, H, t) {
    function X(f) { return f * W; }
    function Y(f) { return f * H; }

    /* ── GEOMETRY CONSTANTS ──────────────────────────────────────────── */
    var CX  = 0.1671;          // Left lobe centre  [frac W]
    var CY  = 0.2594;          // Both lobe centres [frac H]
    var CR  = 0.2853;          // Lobe radius       [frac W]
    var RCX = 1 - CX;          // Right lobe centre [frac W]
    var CR_H      = CR * W / H;
    var circleBot = Math.min(CY + CR_H, 0.96);

    /* ── ANIMATION OSCILLATORS ───────────────────────────────────────── */
    /* Uncomment and wire into gradient stops / polygon offsets to animate */
    /*
    var breathe = 1.0 + 0.015 * Math.sin(t * 0.80);   // slow organic breath
    var pulse   = 1.0 + 0.008 * Math.sin(t * 2.30);   // apex glow pulse
    var sway    = 0.003 * Math.sin(t * 0.55);          // subtle arch lean
    */

    /* ── BOUNDARY ARRAYS  [x_frac_W, y_frac_H] ─────────────────────── */
    /*
     * tailInner  – inner edge of lobe tail below the circle.
     *              Left of this = bright lobe surface.
     *              Right of this = recessed inner surface.
     *
     * archOuter  – outer boundary of arch wall.
     *              Left of this = inner surface.
     *              Right of this = arch wall.
     *
     * archInner  – inner boundary of arch wall (facing arch interior).
     *              Left of this = arch wall.
     *              Right of this = arch interior.
     */

    var tailInner = [
      [0.452, circleBot],
      [0.413, 0.500], [0.389, 0.540],
      [0.362, 0.600], [0.318, 0.660],
      [0.272, 0.700], [0.212, 0.740],
      [0.163, 0.780], [0.128, 0.820],
      [0.104, 0.860], [0.094, 0.900],
      [0.088, 1.000]
    ];

    var archOuter = [
      [0.495, circleBot],
      [0.447, 0.500], [0.423, 0.540],
      [0.411, 0.600], [0.396, 0.660],
      [0.364, 0.700], [0.317, 0.750],
      [0.260, 0.800], [0.229, 0.850],
      [0.217, 0.900], [0.213, 1.000]
    ];

    var archInner = [
      [0.495, circleBot],
      [0.492, 0.560], [0.484, 0.580],
      [0.476, 0.600], [0.471, 0.620],
      [0.465, 0.640], [0.455, 0.660],
      [0.427, 0.700], [0.375, 0.750],
      [0.308, 0.800], [0.272, 0.850],
      [0.263, 0.900], [0.260, 1.000]
    ];

    /* ── POLYGON PATH HELPERS ────────────────────────────────────────── */
    function tracePts(pts) {
      pts.forEach(function (p) { ctx.lineTo(X(p[0]), Y(p[1])); });
    }
    function tracePtsMirror(pts) {
      pts.forEach(function (p) { ctx.lineTo(X(1 - p[0]), Y(p[1])); });
    }
    function tracePtsRev(pts) {
      for (var i = pts.length - 1; i >= 0; i--) {
        ctx.lineTo(X(pts[i][0]), Y(pts[i][1]));
      }
    }
    function tracePtsRevMirror(pts) {
      for (var i = pts.length - 1; i >= 0; i--) {
        ctx.lineTo(X(1 - pts[i][0]), Y(pts[i][1]));
      }
    }

    /* ╔═══════════════════════════════════════════════════════════════╗
       ║  LAYER 0 — BACKGROUND FILL                                   ║
       ╚═══════════════════════════════════════════════════════════════╝ */
    ctx.fillStyle = '#E9E9E9';
    ctx.fillRect(0, 0, W, H);

    /* ╔═══════════════════════════════════════════════════════════════╗
       ║  LAYER 1 — CHANNEL / ARCH GRADIENT PLATE                     ║
       ║                                                               ║
       ║  Fills the entire canvas.  Lobes overpaint the outer areas.  ║
       ║  Darkest at Gothic arch apex (y≈46%, measured #8B8B8B).      ║
       ╚═══════════════════════════════════════════════════════════════╝ */
    var cg = ctx.createLinearGradient(0, 0, 0, H);
    cg.addColorStop(0.00, '#C8C8C8');
    cg.addColorStop(0.20, '#C3C3C3');
    cg.addColorStop(0.40, '#BEBEBE');
    cg.addColorStop(0.46, '#8B8B8B');   // arch apex — darkest measured
    cg.addColorStop(0.54, '#ABABAB');
    cg.addColorStop(0.65, '#C5C5C5');
    cg.addColorStop(0.80, '#D8D8D8');
    cg.addColorStop(1.00, '#DFDFDF');
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, W, H);

    /* ╔═══════════════════════════════════════════════════════════════╗
       ║  LAYER 2 — LEFT LOBE CIRCLE                                  ║
       ║                                                               ║
       ║  Horizontal gradient: darker outer-left → white inner face.  ║
       ║  To animate: vary CR with `breathe`, or shift gradient stops.║
       ╚═══════════════════════════════════════════════════════════════╝ */
    ctx.save();
    ctx.beginPath();
    ctx.arc(X(CX), Y(CY), X(CR), 0, Math.PI * 2);
    ctx.clip();

    var lg = ctx.createLinearGradient(X(CX - CR), 0, X(CX + CR), 0);
    lg.addColorStop(0.00, '#EBEBEB');
    lg.addColorStop(0.18, '#E8E8E8');
    lg.addColorStop(0.36, '#E4E4E4');
    lg.addColorStop(0.47, '#E1E1E1');   // measured midpoint darkest
    lg.addColorStop(0.60, '#E6E6E6');
    lg.addColorStop(0.74, '#F0F0F0');
    lg.addColorStop(0.88, '#FAFAFA');
    lg.addColorStop(1.00, '#FFFFFF');   // inner face — brightest
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, W, H);

    /* Shadow at inner-bottom: concave face curving away from viewer */
    var ls = ctx.createRadialGradient(
      X(CX + CR * 0.82), Y(CY + CR_H * 0.78), 0,
      X(CX + CR * 0.82), Y(CY + CR_H * 0.78), X(CR * 0.40)
    );
    ls.addColorStop(0.00, 'rgba(0,0,0,0.15)');
    ls.addColorStop(0.60, 'rgba(0,0,0,0.04)');
    ls.addColorStop(1.00, 'rgba(0,0,0,0.00)');
    ctx.fillStyle = ls;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    /* ╔═══════════════════════════════════════════════════════════════╗
       ║  LAYER 3 — RIGHT LOBE CIRCLE  (mirror of layer 2)            ║
       ╚═══════════════════════════════════════════════════════════════╝ */
    ctx.save();
    ctx.beginPath();
    ctx.arc(X(RCX), Y(CY), X(CR), 0, Math.PI * 2);
    ctx.clip();

    var rg = ctx.createLinearGradient(X(RCX - CR), 0, X(RCX + CR), 0);
    rg.addColorStop(0.00, '#FFFFFF');
    rg.addColorStop(0.12, '#FAFAFA');
    rg.addColorStop(0.26, '#F0F0F0');
    rg.addColorStop(0.40, '#E6E6E6');
    rg.addColorStop(0.53, '#E1E1E1');
    rg.addColorStop(0.64, '#E4E4E4');
    rg.addColorStop(0.82, '#E8E8E8');
    rg.addColorStop(1.00, '#EBEBEB');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);

    var rs = ctx.createRadialGradient(
      X(RCX - CR * 0.82), Y(CY + CR_H * 0.78), 0,
      X(RCX - CR * 0.82), Y(CY + CR_H * 0.78), X(CR * 0.40)
    );
    rs.addColorStop(0.00, 'rgba(0,0,0,0.15)');
    rs.addColorStop(0.60, 'rgba(0,0,0,0.04)');
    rs.addColorStop(1.00, 'rgba(0,0,0,0.00)');
    ctx.fillStyle = rs;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    /* ╔═══════════════════════════════════════════════════════════════╗
       ║  LAYER 4 — LEFT LOBE TAIL  (lobe surface below the circle)   ║
       ║  Bright inner face → darker outer left edge.                 ║
       ╚═══════════════════════════════════════════════════════════════╝ */
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(X(tailInner[0][0]), Y(tailInner[0][1]));
    tracePts(tailInner.slice(1));
    ctx.lineTo(0, H);
    ctx.lineTo(0, Y(circleBot));
    ctx.closePath();

    var ltg = ctx.createLinearGradient(X(0.45), Y(0.72), 0, Y(0.72));
    ltg.addColorStop(0.00, '#FFFFFF');
    ltg.addColorStop(0.15, '#F9F9F9');
    ltg.addColorStop(0.38, '#F0F0F0');
    ltg.addColorStop(0.65, '#EBEBEB');
    ltg.addColorStop(1.00, '#E5E5E5');
    ctx.fillStyle = ltg;
    ctx.fill();
    ctx.restore();

    /* ╔═══════════════════════════════════════════════════════════════╗
       ║  LAYER 5 — RIGHT LOBE TAIL  (mirror of layer 4)              ║
       ╚═══════════════════════════════════════════════════════════════╝ */
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(X(1 - tailInner[0][0]), Y(tailInner[0][1]));
    tracePtsMirror(tailInner.slice(1));
    ctx.lineTo(W, H);
    ctx.lineTo(W, Y(circleBot));
    ctx.closePath();

    var rtg = ctx.createLinearGradient(X(1 - 0.45), Y(0.72), W, Y(0.72));
    rtg.addColorStop(0.00, '#FFFFFF');
    rtg.addColorStop(0.15, '#F9F9F9');
    rtg.addColorStop(0.38, '#F0F0F0');
    rtg.addColorStop(0.65, '#EBEBEB');
    rtg.addColorStop(1.00, '#E5E5E5');
    ctx.fillStyle = rtg;
    ctx.fill();
    ctx.restore();

    /* ╔═══════════════════════════════════════════════════════════════╗
       ║  LAYER 6 — LEFT INNER SURFACE                                ║
       ║  Recessed band between lobe tail and arch wall.              ║
       ║  Measured colours: #BF–#D9 (191–217).                        ║
       ╚═══════════════════════════════════════════════════════════════╝ */
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(X(archOuter[0][0]), Y(archOuter[0][1]));
    tracePts(archOuter.slice(1));
    tracePtsRev(tailInner);
    ctx.closePath();

    var lig = ctx.createLinearGradient(X(0.495), Y(0.72), X(0.088), Y(0.72));
    lig.addColorStop(0.00, '#D9D9D9');  // arch-wall side — lighter
    lig.addColorStop(0.40, '#CACACA');
    lig.addColorStop(0.75, '#C3C3C3');
    lig.addColorStop(1.00, '#BFBFBF');  // lobe-tail side — darker
    ctx.fillStyle = lig;
    ctx.fill();
    ctx.restore();

    /* ╔═══════════════════════════════════════════════════════════════╗
       ║  LAYER 7 — RIGHT INNER SURFACE  (mirror of layer 6)          ║
       ╚═══════════════════════════════════════════════════════════════╝ */
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(X(1 - archOuter[0][0]), Y(archOuter[0][1]));
    tracePtsMirror(archOuter.slice(1));
    tracePtsRevMirror(tailInner);
    ctx.closePath();

    var rig = ctx.createLinearGradient(X(1 - 0.495), Y(0.72), X(1 - 0.088), Y(0.72));
    rig.addColorStop(0.00, '#D9D9D9');
    rig.addColorStop(0.40, '#CACACA');
    rig.addColorStop(0.75, '#C3C3C3');
    rig.addColorStop(1.00, '#BFBFBF');
    ctx.fillStyle = rig;
    ctx.fill();
    ctx.restore();

    /* ╔═══════════════════════════════════════════════════════════════╗
       ║  LAYER 8 — LEFT ARCH WALL                                    ║
       ║  Dark band. Measured: outer face ~#A5, inner face ~#BB.      ║
       ╚═══════════════════════════════════════════════════════════════╝ */
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(X(archOuter[0][0]), Y(archOuter[0][1]));
    tracePts(archOuter.slice(1));
    tracePtsRev(archInner);
    ctx.closePath();

    var awl = ctx.createLinearGradient(X(0.495), Y(0.72), X(0.213), Y(0.72));
    awl.addColorStop(0.00, '#BBBBBB');  // inner face (facing arch interior)
    awl.addColorStop(0.50, '#ABABAB');
    awl.addColorStop(1.00, '#A5A5A5');  // outer face (facing inner surface)
    ctx.fillStyle = awl;
    ctx.fill();
    ctx.restore();

    /* ╔═══════════════════════════════════════════════════════════════╗
       ║  LAYER 9 — RIGHT ARCH WALL  (mirror of layer 8)              ║
       ╚═══════════════════════════════════════════════════════════════╝ */
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(X(1 - archOuter[0][0]), Y(archOuter[0][1]));
    tracePtsMirror(archOuter.slice(1));
    tracePtsRevMirror(archInner);
    ctx.closePath();

    var awr = ctx.createLinearGradient(X(1 - 0.495), Y(0.72), X(1 - 0.213), Y(0.72));
    awr.addColorStop(0.00, '#BBBBBB');
    awr.addColorStop(0.50, '#ABABAB');
    awr.addColorStop(1.00, '#A5A5A5');
    ctx.fillStyle = awr;
    ctx.fill();
    ctx.restore();

    /* ╔═══════════════════════════════════════════════════════════════╗
       ║  LAYER 10 — ARCH INTERIOR                                    ║
       ║                                                               ║
       ║  Space between the two arch walls.                           ║
       ║  Width: ~1.6% at tip → 48% at bottom (Gothic arch shape).   ║
       ║  Gradient anchored to circleBot so it scales with aspect.    ║
       ╚═══════════════════════════════════════════════════════════════╝ */
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(X(archInner[0][0]), Y(archInner[0][1]));
    tracePts(archInner.slice(1));
    /* Bottom edge across to mirrored side */
    ctx.lineTo(X(1 - archInner[archInner.length - 1][0]), H);
    /* Right boundary going upward (mirrored, reversed) */
    var archInnerRev = archInner.slice().reverse();
    tracePtsMirror(archInnerRev.slice(1));
    ctx.closePath();

    var aig = ctx.createLinearGradient(0, Y(circleBot), 0, H);
    aig.addColorStop(0.00, '#909090');  // apex            — darkest
    aig.addColorStop(0.12, '#A2A2A2');  // measured ~y=50% centre
    aig.addColorStop(0.22, '#AEAEAE');  // measured ~y=55%
    aig.addColorStop(0.34, '#CECECE');  // measured ~y=60%
    aig.addColorStop(0.46, '#D8D8D8');  // measured ~y=65%
    aig.addColorStop(0.60, '#DCDCDC');  // measured ~y=70%
    aig.addColorStop(0.80, '#DEDEDE');  // measured ~y=80%
    aig.addColorStop(1.00, '#DFDFDF');  // measured ~y=90%+
    ctx.fillStyle = aig;
    ctx.fill();
    ctx.restore();

    /* ╔═══════════════════════════════════════════════════════════════╗
       ║  LAYER 11 — ARCH APEX ACCENT                                 ║
       ║  Extra radial darkening at the tip.                          ║
       ║  Darkest measured pixel in entire image: #8B at x=50% y=46%.║
       ║  To animate: modulate opacity stops with `pulse` oscillator. ║
       ╚═══════════════════════════════════════════════════════════════╝ */
    ctx.save();
    var apx = W / 2;
    var apy = Y(0.460);
    var apr = X(0.048);
    var apg = ctx.createRadialGradient(apx, apy, 0, apx, apy, apr);
    apg.addColorStop(0.00, 'rgba(6,6,6,0.55)');
    apg.addColorStop(0.30, 'rgba(6,6,6,0.28)');
    apg.addColorStop(0.65, 'rgba(6,6,6,0.08)');
    apg.addColorStop(1.00, 'rgba(6,6,6,0.00)');
    ctx.fillStyle = apg;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
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
    function _autoInit() { initOmegaFormBg(); }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _autoInit);
    } else {
      _autoInit();
    }
  }

}(typeof window !== 'undefined' ? window : this));
