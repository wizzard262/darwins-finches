// Draws a finch as SVG from its four genes, side on and facing right.
//   Brain -> brain size, seen through the side of the head
//   Beak  -> short and fat (0) to long and thin (15)
//   Wings -> short and rounded (0) to long and pointed (15)
//   Speed -> short legs (0) to long legs (15)
(function (F) {
  'use strict';

  const GROUND = 196;

  function n(x) { return Math.round(x * 10) / 10; }

  function drawBird(genes, options) {
    const opts = options || {};
    const tA = genes[0] / 15, tB = genes[1] / 15, tC = genes[2] / 15, tD = genes[3] / 15;

    const body = '#a98157';
    const wing = '#6e4c2e';
    const belly = '#e9d4b2';

    // Legs and body
    const legLen = 4 + 86 * tD;
    const legWidth = 3.4 - 1.6 * tD;
    const bodyRx = 40, bodyRy = 26;
    const bx = 115, by = GROUND - legLen - bodyRy + 6;

    // Head
    const hr = 15 + 13 * tA;
    const hx = bx + bodyRx * 0.8, hy = by - bodyRy * 0.78;

    let svg = '';

    // Shadow on the ground
    svg += '<ellipse cx="' + n(bx + 8) + '" cy="' + (GROUND + 2) + '" rx="52" ry="4" class="bird-shadow"/>';

    // Speed lines for fast birds
    if (genes[3] >= 10) {
      const endX = bx - bodyRx * 0.75 - 6;
      for (let i = 0; i < 3; i++) {
        const y = by + 12 + i * 7, len = 8 + 16 * tD - i * 4;
        svg += '<line x1="' + n(endX - len) + '" y1="' + n(y) + '" x2="' + n(endX) + '" y2="' + n(y) + '" class="bird-speed"/>';
      }
    }

    // Legs: two thin legs with a slight backward knee, and three toes each
    [-4, 12].forEach(function (dx) {
      const hipX = bx + dx, hipY = by + bodyRy - 6;
      const kneeX = hipX - 4, kneeY = hipY + legLen * 0.5;
      const footX = hipX + 2;
      svg += '<polyline points="' + n(hipX) + ',' + n(hipY) + ' ' + n(kneeX) + ',' + n(kneeY) + ' ' + n(footX) + ',' + GROUND +
        '" class="bird-leg" stroke-width="' + n(legWidth) + '"/>';
      svg += '<path d="M' + n(footX) + ',' + GROUND + ' l9,0 M' + n(footX) + ',' + GROUND + ' l6,-3 M' + n(footX) + ',' + GROUND +
        ' l-6,0" class="bird-leg" stroke-width="' + n(legWidth) + '"/>';
    });

    // Tail
    const tailX = bx - bodyRx * 0.75;
    const tailW = 9;
    svg += '<path d="M' + n(tailX) + ',' + n(by - tailW) + ' L' + n(tailX - 40) + ',' + n(by - 18 - tailW) + ' L' + n(tailX - 36) +
      ',' + n(by - 4) + ' L' + n(tailX) + ',' + n(by + tailW) + ' Z" fill="' + wing + '" class="bird-line"/>';

    // Beak (drawn before the head so the head covers its base)
    const beakLen = 14 + 70 * tB;
    const beakH = 14 - 12.5 * tB;
    const kx = hx + hr * 0.82, ky = hy + hr * 0.2;
    svg += '<path d="M' + n(kx) + ',' + n(ky - beakH) + ' Q' + n(kx + beakLen * 0.55) + ',' + n(ky - beakH * 0.85) + ' ' +
      n(kx + beakLen) + ',' + n(ky + beakH * 0.15) + ' L' + n(kx) + ',' + n(ky) + ' Z" class="bird-beak"/>';
    svg += '<path d="M' + n(kx) + ',' + n(ky) + ' L' + n(kx + beakLen * 0.92) + ',' + n(ky + beakH * 0.2) + ' Q' +
      n(kx + beakLen * 0.45) + ',' + n(ky + beakH * 1.05) + ' ' + n(kx) + ',' + n(ky + beakH) + ' Z" class="bird-beak bird-beak-lower"/>';

    // Body
    svg += '<ellipse cx="' + bx + '" cy="' + n(by) + '" rx="' + bodyRx + '" ry="' + bodyRy + '" fill="' + body + '" class="bird-line"/>';
    svg += '<ellipse cx="' + n(bx + 12) + '" cy="' + n(by + bodyRy * 0.3) + '" rx="' + n(bodyRx * 0.62) + '" ry="' + n(bodyRy * 0.6) +
      '" fill="' + belly + '"/>';

    // Breast feather marks
    for (let i = 0; i < 6; i++) {
      const mx = bx + 2 + (i % 4) * 8 + (Math.floor(i / 4) % 2) * 4;
      const my = by + 2 + Math.floor(i / 4) * 7;
      svg += '<path d="M' + n(mx - 3) + ',' + n(my - 2) + ' q3,3 6,0" class="bird-mark"/>';
    }

    // Wing, folded along the side: a short rounded stub (0) to a long pointed wing
    // reaching well past the tail (15)
    const sx = bx + 20, sy = by - 8;
    const wingLen = 26 + 86 * tC;
    const tipX = sx - wingLen, tipY = by + 2 + 6 * tC;
    const wh = 17 - 7 * tC;
    svg += '<path d="M' + n(sx) + ',' + n(sy) + ' C' + n(sx - 10) + ',' + n(sy - wh * 1.1) + ' ' + n(tipX + wingLen * 0.35) + ',' +
      n(sy - wh * 0.6) + ' ' + n(tipX) + ',' + n(tipY) + ' C' + n(tipX + wingLen * 0.3) + ',' + n(tipY + wh * 0.5) + ' ' + n(sx - 14) + ',' +
      n(sy + wh * 1.6) + ' ' + n(sx) + ',' + n(sy) + ' Z" fill="' + wing + '" class="bird-line"/>';
    for (let i = 0; i < 3; i++) {
      svg += '<path d="M' + n(sx - wingLen * 0.25) + ',' + n(sy - 2 + i * 4) + ' L' + n(tipX + 6 + i * (4 + wingLen * 0.06)) + ',' +
        n(tipY - 1 + i * 1.5) + '" class="bird-mark"/>';
    }

    // Head
    svg += '<circle cx="' + n(hx) + '" cy="' + n(hy) + '" r="' + n(hr) + '" fill="' + body + '" class="bird-line"/>';

    // Brain, seen through the side of the head: a speck at 0, most of the head at 15
    const wx = hx - hr * 0.2, wy = hy - hr * 0.1, wr = hr * 0.62;
    const br = wr * (0.08 + 0.92 * tA);
    svg += '<ellipse cx="' + n(wx) + '" cy="' + n(wy + wr * 0.05) + '" rx="' + n(br) + '" ry="' + n(br * 0.8) + '" class="bird-brain"/>';
    if (br > 4) {
      svg += '<path d="M' + n(wx - br * 0.7) + ',' + n(wy - br * 0.05) + ' q' + n(br * 0.35) + ',' + n(-br * 0.45) + ' ' + n(br * 0.7) + ',0 t' +
        n(br * 0.7) + ',0 M' + n(wx - br * 0.55) + ',' + n(wy + br * 0.4) + ' q' + n(br * 0.3) + ',' + n(-br * 0.35) + ' ' + n(br * 0.55) +
        ',0 t' + n(br * 0.55) + ',0 M' + n(wx) + ',' + n(wy - br * 0.75) + ' q' + n(-br * 0.15) + ',' + n(br * 0.4) + ' 0,' +
        n(br * 0.7) + '" class="bird-brain-fold"/>';
    }

    // Eye
    const ex = hx + hr * 0.6, ey = hy - hr * 0.08;
    svg += '<circle cx="' + n(ex) + '" cy="' + n(ey) + '" r="3.4" class="bird-eye"/>';
    svg += '<circle cx="' + n(ex + 1) + '" cy="' + n(ey - 1.1) + '" r="1.1" fill="#fff"/>';

    const label = opts.label || ('Finch: brain ' + genes[0] + ', beak ' + genes[1] + ', wings ' + genes[2] + ', speed ' + genes[3]);
    return '<svg class="bird' + (opts.className ? ' ' + opts.className : '') + '" viewBox="0 0 260 210" role="img" aria-label="' +
      label + '">' + svg + '</svg>';
  }

  F.drawBird = drawBird;
})(typeof window !== 'undefined' ? (window.Finches = window.Finches || {}) : (globalThis.Finches = globalThis.Finches || {}));
