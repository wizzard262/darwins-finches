// Draws a finch as SVG from its four genes, side on and facing right.
//   Brain    -> brain size, seen through a window in the side of the head
//   Beak     -> short and fat (0) to long and thin (15)
//   Feathers -> sleek and thin (0) to thick and fluffy (15)
//   Speed    -> short legs (0) to long legs (15)
(function (F) {
  'use strict';

  const GROUND = 196;

  function n(x) { return Math.round(x * 10) / 10; }

  function mix(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const ch = function (shift) {
      const x = (pa >> shift) & 255, y = (pb >> shift) & 255;
      return Math.round(x + (y - x) * t);
    };
    return '#' + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
  }

  // Bumps of fluff around an ellipse; they make the scalloped outline.
  function fluffRing(cx, cy, rx, ry, r, count, fill, from, to) {
    let out = '';
    for (let i = 0; i < count; i++) {
      const a = from + ((to - from) * i) / (count - 1);
      out += '<circle cx="' + n(cx + rx * Math.cos(a)) + '" cy="' + n(cy + ry * Math.sin(a)) +
        '" r="' + n(r) + '" fill="' + fill + '" class="bird-line"/>';
    }
    return out;
  }

  function drawBird(genes, options) {
    const opts = options || {};
    const tA = genes[0] / 15, tB = genes[1] / 15, tC = genes[2] / 15, tD = genes[3] / 15;

    const body = mix('#c8a27c', '#7a5230', tC);
    const wing = mix('#a07a55', '#4f3520', tC);
    const belly = mix('#ecd9bd', '#e3c79c', tC);

    // Legs and body
    const legLen = 4 + 86 * tD;
    const legWidth = 3.4 - 1.6 * tD;
    const bodyRx = 37 + 6 * tC, bodyRy = 23 + 6 * tC;
    const bx = 90, by = GROUND - legLen - bodyRy + 6;
    const fluff = 1 + 9 * tC;

    // Head
    const hr = 16 + 10 * tA;
    const hx = bx + bodyRx * 0.8, hy = by - bodyRy * 0.78;

    let svg = '';

    // Shadow on the ground
    svg += '<ellipse cx="' + n(bx + 8) + '" cy="' + (GROUND + 2) + '" rx="' + n(48 + 4 * tC) + '" ry="4" class="bird-shadow"/>';

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
    const tailW = 6 + 5 * tC;
    svg += '<path d="M' + n(tailX) + ',' + n(by - tailW) + ' L' + n(tailX - 40) + ',' + n(by - 18 - tailW) + ' L' + n(tailX - 36) +
      ',' + n(by - 4) + ' L' + n(tailX) + ',' + n(by + tailW) + ' Z" fill="' + wing + '" class="bird-line"/>';

    // Beak (drawn before the head so the head covers its base)
    const beakLen = 14 + 70 * tB + fluff * 0.6;
    const beakH = 14 - 12.5 * tB;
    const kx = hx + hr * 0.82, ky = hy + hr * 0.2;
    svg += '<path d="M' + n(kx) + ',' + n(ky - beakH) + ' Q' + n(kx + beakLen * 0.55) + ',' + n(ky - beakH * 0.85) + ' ' +
      n(kx + beakLen) + ',' + n(ky + beakH * 0.15) + ' L' + n(kx) + ',' + n(ky) + ' Z" class="bird-beak"/>';
    svg += '<path d="M' + n(kx) + ',' + n(ky) + ' L' + n(kx + beakLen * 0.92) + ',' + n(ky + beakH * 0.2) + ' Q' +
      n(kx + beakLen * 0.45) + ',' + n(ky + beakH * 1.05) + ' ' + n(kx) + ',' + n(ky + beakH) + ' Z" class="bird-beak bird-beak-lower"/>';

    // Body, with a ring of fluff for thick feathers
    svg += '<ellipse cx="' + bx + '" cy="' + n(by) + '" rx="' + n(bodyRx) + '" ry="' + n(bodyRy) + '" fill="' + body + '" class="bird-line"/>';
    if (fluff >= 2) svg += fluffRing(bx, by, bodyRx, bodyRy, fluff, 22, body, Math.PI * 0.05, Math.PI * 1.95);
    svg += '<ellipse cx="' + bx + '" cy="' + n(by) + '" rx="' + n(bodyRx) + '" ry="' + n(bodyRy) + '" fill="' + body + '"/>';
    svg += '<ellipse cx="' + n(bx + 12) + '" cy="' + n(by + bodyRy * 0.3) + '" rx="' + n(bodyRx * 0.62) + '" ry="' + n(bodyRy * 0.6) +
      '" fill="' + belly + '"/>';

    // Breast feather marks, more of them for thicker feathers
    const marks = Math.round(2 + 9 * tC);
    for (let i = 0; i < marks; i++) {
      const mx = bx + 2 + (i % 4) * 8 + (Math.floor(i / 4) % 2) * 4;
      const my = by + 2 + Math.floor(i / 4) * 7;
      svg += '<path d="M' + n(mx - 3) + ',' + n(my - 2) + ' q3,3 6,0" class="bird-mark"/>';
    }

    // Wing
    svg += '<path d="M' + n(bx + 22) + ',' + n(by - 12) + ' C' + n(bx + 4) + ',' + n(by - 24) + ' ' + n(bx - 30) + ',' + n(by - 14) + ' ' +
      n(bx - 46) + ',' + n(by + 4) + ' C' + n(bx - 22) + ',' + n(by + 12) + ' ' + n(bx + 10) + ',' + n(by + 8) + ' ' +
      n(bx + 22) + ',' + n(by - 12) + ' Z" fill="' + wing + '" class="bird-line"/>';
    svg += '<path d="M' + n(bx - 6) + ',' + n(by - 6) + ' L' + n(bx - 36) + ',' + n(by + 4) + ' M' + n(bx + 6) + ',' + n(by - 4) +
      ' L' + n(bx - 26) + ',' + n(by + 7) + '" class="bird-mark"/>';

    // Head, with fluff
    svg += '<circle cx="' + n(hx) + '" cy="' + n(hy) + '" r="' + n(hr) + '" fill="' + body + '" class="bird-line"/>';
    if (fluff >= 2) svg += fluffRing(hx, hy, hr, hr, fluff * 0.6, 14, body, -Math.PI * 0.95, Math.PI * 0.35);
    svg += '<circle cx="' + n(hx) + '" cy="' + n(hy) + '" r="' + n(hr) + '" fill="' + body + '"/>';

    // Brain, seen through a window in the side of the head
    const wx = hx - hr * 0.24, wy = hy - hr * 0.14, wr = hr * 0.56;
    svg += '<circle cx="' + n(wx) + '" cy="' + n(wy) + '" r="' + n(wr) + '" class="bird-skull"/>';
    const br = wr * (0.12 + 0.86 * tA);
    svg += '<ellipse cx="' + n(wx) + '" cy="' + n(wy + wr * 0.05) + '" rx="' + n(br) + '" ry="' + n(br * 0.8) + '" class="bird-brain"/>';
    if (br > 4) {
      svg += '<path d="M' + n(wx - br * 0.7) + ',' + n(wy - br * 0.05) + ' q' + n(br * 0.35) + ',' + n(-br * 0.45) + ' ' + n(br * 0.7) + ',0 t' +
        n(br * 0.7) + ',0 M' + n(wx - br * 0.55) + ',' + n(wy + br * 0.4) + ' q' + n(br * 0.3) + ',' + n(-br * 0.35) + ' ' + n(br * 0.55) +
        ',0 t' + n(br * 0.55) + ',0 M' + n(wx) + ',' + n(wy - br * 0.75) + ' q' + n(-br * 0.15) + ',' + n(br * 0.4) + ' 0,' +
        n(br * 0.7) + '" class="bird-brain-fold"/>';
    }

    // Eye
    const ex = hx + hr * 0.5, ey = hy - hr * 0.06;
    svg += '<circle cx="' + n(ex) + '" cy="' + n(ey) + '" r="3.4" class="bird-eye"/>';
    svg += '<circle cx="' + n(ex + 1) + '" cy="' + n(ey - 1.1) + '" r="1.1" fill="#fff"/>';

    const label = opts.label || ('Finch: brain ' + genes[0] + ', beak ' + genes[1] + ', feathers ' + genes[2] + ', speed ' + genes[3]);
    return '<svg class="bird' + (opts.className ? ' ' + opts.className : '') + '" viewBox="0 0 260 210" role="img" aria-label="' +
      label + '">' + svg + '</svg>';
  }

  F.drawBird = drawBird;
})(typeof window !== 'undefined' ? (window.Finches = window.Finches || {}) : (globalThis.Finches = globalThis.Finches || {}));
