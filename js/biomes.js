// The five islands. Each has a fitness formula over the four genes:
//   A = brain, B = beak (0 short & fat .. 15 long & thin), C = feathers, D = speed
// and a mutation rate (chance of each bit flipping in a newborn).
(function (F) {
  'use strict';

  const sq = function (x) { return x * x; };

  F.BIOMES = [
    {
      id: 'desert',
      icon: '🏜️',
      name: 'Sandspit',
      biome: 'Desert',
      image: 'images/biomes/desert.jpg',
      scene: 'linear-gradient(180deg,#f6d58e 0%,#f0b76a 55%,#d98d4a 100%)',
      blurb: 'Open dunes with hawks overhead. Long legs to outrun them, thin feathers to shed heat. Running burns the same scarce water a big brain needs.',
      formula: '6D + 6A − AD/5 − A²/4 + 3B − B²/6 + C − C²/2',
      fitness: function (A, B, C, D) {
        return 6 * D + 6 * A - (A * D) / 5 - sq(A) / 4 + 3 * B - sq(B) / 6 + C - sq(C) / 2;
      },
      mutationRate: 0.05,
      pace: 'Fast',
      paceNote: 'Smooth landscape, high mutation'
    },
    {
      id: 'tundra',
      icon: '❄️',
      name: 'Frostholm',
      biome: 'Tundra',
      image: 'images/biomes/tundra.jpg',
      scene: 'linear-gradient(180deg,#dfeaf3 0%,#b9cfe0 55%,#8fa9c0 100%)',
      blurb: 'Freezing winds. Thick feathers keep a bird alive but weigh it down. A short, stubby beak and short legs lose less heat (Allen’s rule).',
      formula: '5C + 4A − A²/5 + 4D − D²/4 − CD/5 + 2B − B²/2',
      fitness: function (A, B, C, D) {
        return 5 * C + 4 * A - sq(A) / 5 + 4 * D - sq(D) / 4 - (C * D) / 5 + 2 * B - sq(B) / 2;
      },
      mutationRate: 0.025,
      pace: 'Medium',
      paceNote: 'Smooth landscape, medium mutation'
    },
    {
      id: 'woodland',
      icon: '🌳',
      name: 'Oakhaven',
      biome: 'Woodland',
      image: 'images/biomes/woodland.jpg',
      scene: 'linear-gradient(180deg,#cfe3b4 0%,#94b672 55%,#5d7f45 100%)',
      blurb: 'Oak and hazel woods. A short, fat beak cracks nuts and a big brain remembers where they are hidden. Foraging time leaves little for running.',
      formula: '4A − A²/6 − AD/6 + 3D − D²/4 + 6B − B² + 2C − C²/7',
      fitness: function (A, B, C, D) {
        return 4 * A - sq(A) / 6 - (A * D) / 6 + 3 * D - sq(D) / 4 + 6 * B - sq(B) + 2 * C - sq(C) / 7;
      },
      mutationRate: 0.035,
      pace: 'Medium',
      paceNote: 'Smooth, but many near-ideal birds'
    },
    {
      id: 'rainforest',
      icon: '🌴',
      name: 'Verdant Isle',
      biome: 'Rainforest',
      image: 'images/biomes/rainforest.jpg',
      scene: 'linear-gradient(180deg,#a9d8b8 0%,#4f9a6c 55%,#24603f 100%)',
      blurb: 'Humid jungle. Grubs hide deep in bark: a long, thin beak reaches them, and a clever bird uses a twig as a tool, so brain and beak work together. Feathers just get soggy.',
      formula: 'AB/4 − A²/5 − B²/6 + 2B + 2D − D²/5 − C',
      fitness: function (A, B, C, D) {
        return (A * B) / 4 - sq(A) / 5 - sq(B) / 6 + 2 * B + 2 * D - sq(D) / 5 - C;
      },
      mutationRate: 0.02,
      pace: 'Slow',
      paceNote: 'Linked genes, low mutation'
    },
    {
      id: 'volcano',
      icon: '🌋',
      name: 'Ember Isle',
      biome: 'Volcanic',
      image: 'images/biomes/volcano.jpg',
      scene: 'linear-gradient(180deg,#f2b8a0 0%,#a65a48 55%,#3d2a2a 100%)',
      blurb: 'Bare lava fields and hunting hawks. A bird can outrun them or outwit them by hiding in lava tubes, but doing both is a waste. Running is the easy answer; cleverness pays more.',
      formula: 'A²/3 + 4D − AD/3 + 2B − B²/8 − C',
      fitness: function (A, B, C, D) {
        return sq(A) / 3 + 4 * D - (A * D) / 3 + 2 * B - sq(B) / 8 - C;
      },
      mutationRate: 0.015,
      pace: 'Very slow',
      paceNote: 'Rugged: a false peak to get stuck on'
    }
  ];
})(typeof window !== 'undefined' ? (window.Finches = window.Finches || {}) : (globalThis.Finches = globalThis.Finches || {}));
