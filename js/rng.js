// Seeded random numbers, so any run can be repeated exactly from its seed.
(function (F) {
  'use strict';

  // Turn any text seed into a 32-bit number.
  function hashSeed(text) {
    let h = 1779033703 ^ text.length;
    for (let i = 0; i < text.length; i++) {
      h = Math.imul(h ^ text.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
  }

  // mulberry32: small, fast and good enough for a simulation.
  function makeRng(seed) {
    let a = hashSeed(String(seed));
    const next = function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return {
      next: next,
      int: function (n) { return Math.floor(next() * n); },
      chance: function (p) { return next() < p; },
      shuffle: function (list) {
        for (let i = list.length - 1; i > 0; i--) {
          const j = Math.floor(next() * (i + 1));
          const tmp = list[i]; list[i] = list[j]; list[j] = tmp;
        }
        return list;
      }
    };
  }

  // A short, readable seed such as "finch-4821".
  function randomSeed() {
    return 'finch-' + Math.floor(1000 + Math.random() * 9000);
  }

  F.makeRng = makeRng;
  F.randomSeed = randomSeed;
})(typeof window !== 'undefined' ? (window.Finches = window.Finches || {}) : (globalThis.Finches = globalThis.Finches || {}));
