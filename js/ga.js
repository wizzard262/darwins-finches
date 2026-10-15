// The genetic algorithm: chromosomes, breeding, mutation and selection.
//
// A bird's chromosome is 16 bits, read as 4 genes of 4 bits each (0-15):
//   bits  0-3  A  brain size
//   bits  4-7  B  beak (0 = short and fat, 15 = long and thin)
//   bits  8-11 C  feathers (0 = thin, 15 = thick)
//   bits 12-15 D  speed / leg length
(function (F) {
  'use strict';

  const GENE_BITS = 4;
  const GENE_COUNT = 4;
  const CHROMOSOME_BITS = GENE_BITS * GENE_COUNT;
  const GENE_MAX = (1 << GENE_BITS) - 1; // 15

  const GENES = [
    { key: 'A', name: 'Brain', low: 'tiny', high: 'large' },
    { key: 'B', name: 'Beak', low: 'short & fat', high: 'long & thin' },
    { key: 'C', name: 'Feathers', low: 'thin', high: 'thick' },
    { key: 'D', name: 'Speed', low: 'short legs', high: 'long legs' }
  ];

  // Gray code: neighbouring values (7 and 8, say) differ by one bit, not four.
  function grayToValue(gray) {
    let value = gray;
    for (let shift = 1; shift < GENE_BITS; shift++) value ^= gray >> shift;
    return value;
  }
  function valueToGray(value) { return value ^ (value >> 1); }

  function bitsToGenes(bits, gray) {
    const genes = [];
    for (let g = 0; g < GENE_COUNT; g++) {
      let value = 0;
      for (let b = 0; b < GENE_BITS; b++) value = (value << 1) | bits[g * GENE_BITS + b];
      genes.push(gray ? grayToValue(value) : value);
    }
    return genes;
  }

  function genesToBits(genes, gray) {
    const bits = [];
    genes.forEach(function (gene) {
      const value = gray ? valueToGray(gene) : gene;
      for (let b = GENE_BITS - 1; b >= 0; b--) bits.push((value >> b) & 1);
    });
    return bits;
  }

  // Every possible bird as an index 0..65535 (A in the top 4 bits).
  function genesToIndex(g) { return (g[0] << 12) | (g[1] << 8) | (g[2] << 4) | g[3]; }
  function indexToGenes(i) { return [(i >> 12) & 15, (i >> 8) & 15, (i >> 4) & 15, i & 15]; }

  // Score every one of the 65,536 possible birds once, so we know the island's
  // best and worst bird and can turn any fitness into "% of ideal".
  function analyseBiome(biome) {
    if (biome._landscape) return biome._landscape;
    const size = 1 << CHROMOSOME_BITS;
    const table = new Float64Array(size);
    let max = -Infinity, min = Infinity, total = 0, ideal = 0;
    for (let i = 0; i < size; i++) {
      const g = indexToGenes(i);
      const f = biome.fitness(g[0], g[1], g[2], g[3]);
      table[i] = f;
      total += f;
      if (f > max) { max = f; ideal = i; }
      if (f < min) min = f;
    }
    biome._landscape = { table: table, max: max, min: min, mean: total / size, idealGenes: indexToGenes(ideal) };
    return biome._landscape;
  }

  // 0% = an average random bird, 100% = the ideal bird. Below-average birds go negative.
  function percentOfIdeal(landscape, fitness) {
    return ((fitness - landscape.mean) / (landscape.max - landscape.mean)) * 100;
  }

  let nextId = 1;

  function makeBird(run, bits, generation, origin, parents) {
    const genes = bitsToGenes(bits, run.gray);
    return {
      id: nextId++,
      bits: bits,
      genes: genes,
      fitness: run.landscape.table[genesToIndex(genes)],
      born: generation,
      origin: origin,       // 'founder' | 'newborn'
      parents: parents || null
    };
  }

  // Single-point crossover: cut both parents at the same random point and swap tails.
  function crossover(mum, dad, rng) {
    const cut = 1 + rng.int(CHROMOSOME_BITS - 1);
    return [
      mum.slice(0, cut).concat(dad.slice(cut)),
      dad.slice(0, cut).concat(mum.slice(cut))
    ];
  }

  // Each bit has a small chance of flipping.
  function mutate(bits, rate, rng) {
    let flips = 0;
    for (let i = 0; i < bits.length; i++) {
      if (rng.chance(rate)) { bits[i] ^= 1; flips++; }
    }
    return flips;
  }

  // Best first. Shuffling before the (stable) sort breaks ties at random.
  function rank(population, rng) {
    return rng.shuffle(population.slice()).sort(function (a, b) { return b.fitness - a.fitness; });
  }

  function summarise(run) {
    const ranked = rank(run.population, run.rng);
    const total = run.population.reduce(function (s, b) { return s + b.fitness; }, 0);
    const avg = total / run.population.length;
    const best = ranked[0];
    return {
      generation: run.generation,
      best: best,
      max: best.fitness,
      avg: avg,
      maxPct: percentOfIdeal(run.landscape, best.fitness),
      avgPct: percentOfIdeal(run.landscape, avg)
    };
  }

  // options.gray: read each gene as Gray code instead of plain binary.
  function createRun(biome, size, seed, options) {
    if (size % 4 !== 0 || size < 4) throw new Error('Population must be a multiple of 4');
    const landscape = analyseBiome(biome);
    const rng = F.makeRng(seed + '|' + biome.id + '|' + size);
    const run = {
      biome: biome, size: size, seed: seed, rng: rng, landscape: landscape,
      gray: !!(options && options.gray), generation: 1, population: [], died: [], history: []
    };
    // options.founderDistance: every founder gene is at least this far (0-15 scale)
    // from the island's ideal, so the first birds look and score clearly worse.
    const distance = (options && options.founderDistance) || 0;
    while (run.population.length < size) {
      let bits = [];
      if (distance > 0) {
        const genes = landscape.idealGenes.map(function (ideal) {
          const far = [];
          for (let v = 0; v <= GENE_MAX; v++) if (Math.abs(v - ideal) >= distance) far.push(v);
          return far[rng.int(far.length)];
        });
        bits = genesToBits(genes, run.gray);
      } else {
        for (let b = 0; b < CHROMOSOME_BITS; b++) bits.push(rng.int(2));
      }
      run.population.push(makeBird(run, bits, 1, 'founder'));
    }
    const first = summarise(run);
    run.history.push(first);
    run.firstBest = first.best;
    return run;
  }

  // One generation: the fitter half survive, are paired at random, and each pair
  // has two children. Survivors + children keep the island's population constant.
  function step(run) {
    const ranked = rank(run.population, run.rng);
    const half = run.size / 2;
    const survivors = ranked.slice(0, half);
    run.died = ranked.slice(half);

    const parents = run.rng.shuffle(survivors.slice());
    const children = [];
    const childGeneration = run.generation + 1;
    for (let i = 0; i < parents.length; i += 2) {
      const mum = parents[i], dad = parents[i + 1];
      const kids = crossover(mum.bits, dad.bits, run.rng);
      kids.forEach(function (bits) {
        mutate(bits, run.biome.mutationRate, run.rng);
        children.push(makeBird(run, bits, childGeneration, 'newborn', [mum.id, dad.id]));
      });
    }

    run.population = survivors.concat(children);
    run.generation = childGeneration;
    const summary = summarise(run);
    run.history.push(summary);
    return summary;
  }

  function reachedIdeal(run) {
    return run.history[run.history.length - 1].max >= run.landscape.max - 1e-9;
  }

  F.GA = {
    GENE_BITS: GENE_BITS, GENE_MAX: GENE_MAX, GENES: GENES, CHROMOSOME_BITS: CHROMOSOME_BITS,
    bitsToGenes: bitsToGenes, genesToBits: genesToBits, analyseBiome: analyseBiome,
    percentOfIdeal: percentOfIdeal, createRun: createRun, step: step, reachedIdeal: reachedIdeal
  };
})(typeof window !== 'undefined' ? (window.Finches = window.Finches || {}) : (globalThis.Finches = globalThis.Finches || {}));
