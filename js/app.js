// Page wiring: islands, controls, the fitness graph, the birds and the lab.
(function (F) {
  'use strict';

  const GA = F.GA;
  const MAX_AUTO_GENERATIONS = 1000;
  const STUCK_AFTER = 100;
  const LAB_RUNS = 40;
  const RACE_GENERATIONS = 200;
  const SWEEP_CAP = 400;

  const $ = function (id) { return document.getElementById(id); };
  const css = function (name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); };
  const fmt = function (x) { return (Math.round(x * 10) / 10).toFixed(1); };
  const pct = function (x) { return (Math.floor(x * 10) / 10).toFixed(1) + '%'; };

  const state = {
    biome: F.BIOMES[0],
    size: 20,
    seed: F.randomSeed(),
    gray: true,
    run: null,
    timer: null,
    foundAt: null,
    lastGain: 1
  };

  let fitnessChart, raceChart, sweepChart;

  // ---------- Islands ----------

  function renderIslands() {
    const box = $('islands');
    box.innerHTML = '';
    F.BIOMES.forEach(function (b) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'island';
      card.setAttribute('role', 'radio');
      card.dataset.id = b.id;
      card.innerHTML =
        '<div class="island-photo" style="background:' + b.scene + '">' +
          '<span aria-hidden="true">' + b.icon + '</span>' +
          '<img src="' + b.image + '" alt="">' +
          '<span class="island-pace">' + b.pace + '</span>' +
        '</div>' +
        '<div class="island-body">' +
          '<div class="island-name">' + b.name + '<small>' + b.biome + '</small></div>' +
          '<div class="island-formula">f = ' + b.formula + '</div>' +
          '<p class="island-blurb">' + b.blurb + '</p>' +
          '<p class="island-meta">Mutation ' + +(b.mutationRate * 100).toFixed(1) + '% per bit · ' + b.paceNote + '</p>' +
        '</div>';
      // Until a photo is added, the gradient and icon show instead.
      card.querySelector('img').addEventListener('error', function () { this.remove(); });
      card.addEventListener('click', function () { selectIsland(b); });
      box.appendChild(card);
    });
    box.addEventListener('keydown', function (e) {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      const i = F.BIOMES.indexOf(state.biome);
      const next = F.BIOMES[(i + keys[e.key] + F.BIOMES.length) % F.BIOMES.length];
      selectIsland(next);
      box.querySelector('[data-id="' + next.id + '"]').focus();
    });
    markIsland();
  }

  function markIsland() {
    document.querySelectorAll('.island').forEach(function (card) {
      const on = card.dataset.id === state.biome.id;
      card.setAttribute('aria-checked', on ? 'true' : 'false');
      card.tabIndex = on ? 0 : -1;
    });
  }

  function selectIsland(biome) {
    if (biome === state.biome) return;
    state.biome = biome;
    markIsland();
    restart();
  }

  // ---------- Running ----------

  function restart() {
    stopAuto();
    state.run = GA.createRun(state.biome, state.size, state.seed, { gray: state.gray });
    state.foundAt = GA.reachedIdeal(state.run) ? 1 : null;
    state.lastGain = 1;
    rebuildFitnessChart();
    renderAll();
  }

  function nextGeneration() {
    const before = state.run.history[state.run.history.length - 1].max;
    const summary = GA.step(state.run);
    if (summary.max > before) state.lastGain = summary.generation;
    if (state.foundAt === null && GA.reachedIdeal(state.run)) state.foundAt = summary.generation;
    pushChartPoint(summary);
    renderAll();
  }

  function startAuto() {
    if (state.timer) return;
    $('autoBtn').textContent = '❚❚ Pause';
    $('autoBtn').setAttribute('aria-pressed', 'true');
    const tick = function () {
      nextGeneration();
      const r = state.run;
      if (state.foundAt !== null || r.generation >= MAX_AUTO_GENERATIONS) { stopAuto(); return; }
      state.timer = setTimeout(tick, Number($('speed').value));
    };
    state.timer = setTimeout(tick, 0);
  }

  function stopAuto() {
    if (state.timer) clearTimeout(state.timer);
    state.timer = null;
    $('autoBtn').textContent = '▶ Auto-run';
    $('autoBtn').setAttribute('aria-pressed', 'false');
  }

  // ---------- Rendering ----------

  function renderAll() {
    renderStatus();
    renderBirds();
    renderPopulation();
    if ($('historyTable').closest('details').open) renderHistoryTable();
  }

  function renderStatus() {
    const r = state.run;
    const last = r.history[r.history.length - 1];
    let html = 'Generation <strong>' + r.generation + '</strong> · fittest bird <strong>' + pct(last.maxPct) +
      '</strong> of ideal · average ' + pct(last.avgPct);
    if (state.foundAt !== null) {
      html += ' · <span class="found">Ideal bird found in generation ' + state.foundAt + '</span>';
    } else if (r.generation - state.lastGain >= STUCK_AFTER) {
      html += ' · <span class="stuck">No progress for ' + (r.generation - state.lastGain) +
        ' generations. Stuck on a false peak? A bigger population keeps more variety.</span>';
    } else if (r.generation >= MAX_AUTO_GENERATIONS) {
      html += ' · Auto-run stops at ' + MAX_AUTO_GENERATIONS + ' generations';
    }
    $('status').innerHTML = html;
  }

  function chromosomeRows(genes) {
    const bits = GA.genesToBits(genes, state.gray);
    return '<div class="chromosome">' + GA.GENES.map(function (g, i) {
      return '<span class="g-name">' + g.name + '</span>' +
        '<span class="g-bits" title="' + (state.gray ? 'Gray code' : 'Binary') + '">' + bits.slice(i * 4, i * 4 + 4).join('') + '</span>' +
        '<span class="g-track" title="' + g.name + ' ' + genes[i] + ' of 15 (' + (genes[i] < 8 ? g.low : g.high) + ')">' +
          '<span class="g-bar" style="display:block;width:' + (genes[i] / GA.GENE_MAX) * 100 + '%"></span></span>' +
        '<span class="g-val">' + genes[i] + '</span>';
    }).join('') + '</div>';
  }

  function birdCard(title, genes, fitness, extraClass) {
    const p = GA.percentOfIdeal(state.run.landscape, fitness);
    return '<article class="bird-card ' + (extraClass || '') + '">' +
      '<div class="bird-card-title">' + title + '</div>' +
      '<div class="bird-card-score"><span class="big">' + fmt(fitness) + '</span><span class="pct">' + pct(p) + ' of ideal</span></div>' +
      F.drawBird(genes) +
      chromosomeRows(genes) +
      '</article>';
  }

  function renderBirds() {
    const r = state.run;
    const current = r.history[r.history.length - 1].best;
    $('birds').innerHTML =
      birdCard('Generation 1 · fittest', r.firstBest.genes, r.firstBest.fitness) +
      birdCard('Generation ' + r.generation + ' · fittest', current.genes, current.fitness) +
      birdCard('Ideal for ' + state.biome.name, r.landscape.idealGenes, r.landscape.max, 'ideal');
  }

  function tile(bird, rank, kind, isBest) {
    const p = GA.percentOfIdeal(state.run.landscape, bird.fitness);
    const g = bird.genes;
    const label = kind + ', born generation ' + bird.born + '. Brain ' + g[0] + ', beak ' + g[1] + ', feathers ' + g[2] +
      ', speed ' + g[3] + '. Fitness ' + fmt(bird.fitness);
    return '<div class="tile ' + kind + (isBest ? ' best' : '') + '" title="' + label + '">' +
      (rank ? '<span class="rank">#' + rank + '</span>' : '') +
      F.drawBird(g, { label: label }) +
      '<div class="t-fit">' + pct(p) + '</div></div>';
  }

  function byFitness(a, b) { return b.fitness - a.fitness; }

  function renderPopulation() {
    const r = state.run;
    const ranked = r.population.slice().sort(byFitness);
    $('population').innerHTML = ranked.map(function (b, i) {
      const kind = r.generation === 1 ? 'founder' : (b.born === r.generation ? 'newborn' : 'survivor');
      return tile(b, i + 1, kind, i === 0);
    }).join('');
    const died = r.died.slice().sort(byFitness);
    $('diedTitle').hidden = died.length === 0;
    $('died').innerHTML = died.map(function (b) { return tile(b, 0, 'died', false); }).join('');
  }

  function renderHistoryTable() {
    const rows = state.run.history.map(function (h) {
      return '<tr><td>' + h.generation + '</td><td>' + fmt(h.max) + '</td><td>' + pct(h.maxPct) + '</td><td>' + fmt(h.avg) +
        '</td><td>' + pct(h.avgPct) + '</td></tr>';
    }).join('');
    $('historyTable').innerHTML = '<thead><tr><th>Generation</th><th>Fittest</th><th>% of ideal</th><th>Average</th><th>% of ideal</th></tr></thead><tbody>' +
      rows + '</tbody>';
  }

  // ---------- Charts ----------

  function axisStyle() {
    return {
      ticks: { color: css('--text-3'), font: { family: css('--font-body') || 'Inter', size: 11 } },
      grid: { color: css('--grid-line') },
      border: { color: css('--grid-line') }
    };
  }

  function baseOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: css('--surface'), titleColor: css('--text'), bodyColor: css('--text-2'),
          borderColor: css('--border'), borderWidth: 1, padding: 10, boxPadding: 4 }
      },
      scales: {
        x: Object.assign({ type: 'linear' }, axisStyle()),
        y: axisStyle()
      }
    };
  }

  function rebuildFitnessChart() {
    if (fitnessChart) fitnessChart.destroy();
    const r = state.run;
    const options = baseOptions();
    options.scales.x.title = { display: true, text: 'Generation', color: css('--text-3') };
    options.scales.x.min = 1;
    options.scales.x.ticks.precision = 0;
    options.scales.y.max = 100;
    options.scales.y.suggestedMin = 0;
    options.scales.y.ticks.callback = function (v) { return v + '%'; };
    options.plugins.tooltip.filter = function (item) { return item.datasetIndex !== 2; };
    options.plugins.tooltip.callbacks = {
      title: function (items) { return 'Generation ' + items[0].parsed.x; },
      label: function (item) {
        const h = state.run.history[item.dataIndex];
        return item.datasetIndex === 0
          ? ' Fittest: ' + pct(h.maxPct) + ' (score ' + fmt(h.max) + ')'
          : ' Average: ' + pct(h.avgPct) + ' (score ' + fmt(h.avg) + ')';
      }
    };
    fitnessChart = new Chart($('fitnessChart'), {
      type: 'line',
      data: {
        datasets: [
          { label: 'Fittest bird', data: [], borderColor: css('--series-max'), backgroundColor: css('--series-max'), borderWidth: 2,
            pointRadius: 0, pointHoverRadius: 4, cubicInterpolationMode: 'monotone' },
          { label: 'Population average', data: [], borderColor: css('--series-avg'), backgroundColor: css('--series-avg'), borderWidth: 2,
            pointRadius: 0, pointHoverRadius: 4, cubicInterpolationMode: 'monotone' },
          { label: 'Ideal', data: [], borderColor: css('--series-ideal'), borderWidth: 1.5, borderDash: [5, 4], pointRadius: 0,
            pointHoverRadius: 0 }
        ]
      },
      options: options
    });
    r.history.forEach(function (h) { pushChartPoint(h, true); });
    fitnessChart.update();
  }

  function pushChartPoint(h, quiet) {
    const ds = fitnessChart.data.datasets;
    ds[0].data.push({ x: h.generation, y: h.maxPct });
    ds[1].data.push({ x: h.generation, y: h.avgPct });
    ds[2].data = [{ x: 1, y: 100 }, { x: Math.max(10, h.generation), y: 100 }];
    fitnessChart.options.scales.x.max = Math.max(10, h.generation);
    if (!quiet) fitnessChart.update();
  }

  // ---------- Lab ----------

  const pause = function () { return new Promise(function (resolve) { setTimeout(resolve, 0); }); };

  function timeToIdeal(biome, size, seed, cap) {
    const run = GA.createRun(biome, size, seed, { gray: state.gray });
    while (!GA.reachedIdeal(run) && run.generation < cap) GA.step(run);
    return GA.reachedIdeal(run) ? run.generation : Infinity;
  }

  function quantile(sorted, q) { return sorted[Math.floor(q * (sorted.length - 1))]; }
  function showGens(x) { return isFinite(x) ? String(x) : '—'; }

  async function runRace() {
    const btn = $('raceBtn');
    btn.disabled = true;
    const size = state.size;
    const results = [];
    for (let i = 0; i < F.BIOMES.length; i++) {
      const b = F.BIOMES[i];
      $('raceStatus').textContent = 'Racing ' + b.name + '… (' + (i + 1) + ' of ' + F.BIOMES.length + ')';
      await pause();
      const found = [];
      for (let k = 0; k < LAB_RUNS; k++) found.push(timeToIdeal(b, size, state.seed + '-race-' + k, RACE_GENERATIONS));
      found.sort(function (x, y) { return x - y; });
      results.push({ biome: b, found: found });
    }
    drawRace(results, size);
    $('raceStatus').textContent = LAB_RUNS + ' runs per island, ' + size + ' birds, ' + (state.gray ? 'Gray code' : 'plain binary') + '.';
    btn.disabled = false;
  }

  function drawRace(results, size) {
    if (raceChart) raceChart.destroy();
    const options = baseOptions();
    options.plugins.legend = { display: true, position: 'top', align: 'start',
      labels: { color: css('--text-2'), boxWidth: 14, boxHeight: 3, font: { size: 11 } } };
    options.scales.x.min = 1;
    options.scales.x.max = RACE_GENERATIONS;
    options.scales.x.title = { display: true, text: 'Generation', color: css('--text-3') };
    options.scales.y.min = 0;
    options.scales.y.max = 100;
    options.scales.y.ticks.callback = function (v) { return v + '%'; };
    options.scales.y.title = { display: true, text: 'Runs that found the ideal', color: css('--text-3') };
    options.plugins.tooltip.callbacks = {
      title: function (items) { return 'By generation ' + items[0].parsed.x; },
      label: function (item) { return ' ' + item.dataset.label + ': ' + Math.round(item.parsed.y) + '% of runs'; }
    };
    const datasets = results.map(function (res, i) {
      const colour = css('--race-' + (F.BIOMES.indexOf(res.biome) + 1));
      const data = [];
      let k = 0;
      for (let g = 1; g <= RACE_GENERATIONS; g++) {
        while (k < res.found.length && res.found[k] <= g) k++;
        data.push({ x: g, y: (k / res.found.length) * 100 });
      }
      return { label: res.biome.name, data: data, borderColor: colour, backgroundColor: colour, borderWidth: 2,
        pointRadius: 0, pointHoverRadius: 4, stepped: true };
    });
    raceChart = new Chart($('raceChart'), { type: 'line', data: { datasets: datasets }, options: options });
    raceChart._results = results;
    raceChart._size = size;

    $('raceTable').innerHTML = '<thead><tr><th>Island</th><th>Median generations</th><th>90% of runs by</th><th>Not found by ' +
      RACE_GENERATIONS + '</th></tr></thead><tbody>' + results.map(function (res) {
        const missed = res.found.filter(function (x) { return !isFinite(x); }).length;
        const colour = css('--race-' + (F.BIOMES.indexOf(res.biome) + 1));
        return '<tr><td><i class="swatch-dot" style="background:' + colour + '"></i>' + res.biome.name + '</td><td>' +
          showGens(quantile(res.found, 0.5)) + '</td><td>' + showGens(quantile(res.found, 0.9)) + '</td><td>' +
          Math.round((missed / res.found.length) * 100) + '%</td></tr>';
      }).join('') + '</tbody>';
  }

  async function runSweep() {
    const btn = $('sweepBtn');
    btn.disabled = true;
    const biome = state.biome;
    const rows = [];
    for (let size = 4; size <= 40; size += 4) {
      $('sweepStatus').textContent = biome.name + ': ' + size + ' birds…';
      await pause();
      const found = [];
      for (let k = 0; k < LAB_RUNS; k++) found.push(timeToIdeal(biome, size, state.seed + '-sweep-' + k, SWEEP_CAP));
      found.sort(function (x, y) { return x - y; });
      rows.push({ size: size, found: found });
    }
    drawSweep(biome, rows);
    $('sweepStatus').textContent = biome.name + ', ' + LAB_RUNS + ' runs per size, ' + (state.gray ? 'Gray code' : 'plain binary') +
      '. Bars show the median.';
    btn.disabled = false;
  }

  function drawSweep(biome, rows) {
    if (sweepChart) sweepChart.destroy();
    const options = baseOptions();
    options.scales.x = Object.assign({ type: 'category' }, axisStyle());
    options.scales.x.title = { display: true, text: 'Population size', color: css('--text-3') };
    options.scales.x.grid.display = false;
    options.scales.y.beginAtZero = true;
    options.scales.y.title = { display: true, text: 'Generations to the ideal', color: css('--text-3') };
    options.plugins.tooltip.callbacks = {
      title: function (items) { return items[0].label + ' birds'; },
      label: function (item) {
        const row = rows[item.dataIndex];
        const missed = row.found.filter(function (x) { return !isFinite(x); }).length;
        return [' Median: ' + showGens(quantile(row.found, 0.5)) + ' generations',
          ' 90% of runs by: ' + showGens(quantile(row.found, 0.9)),
          ' Not found by ' + SWEEP_CAP + ': ' + Math.round((missed / row.found.length) * 100) + '%'];
      }
    };
    const colour = css('--series-max');
    sweepChart = new Chart($('sweepChart'), {
      type: 'bar',
      data: {
        labels: rows.map(function (r) { return r.size; }),
        datasets: [{ label: 'Median generations', data: rows.map(function (r) {
          const m = quantile(r.found, 0.5); return isFinite(m) ? m : SWEEP_CAP; }),
          backgroundColor: colour, borderRadius: { topLeft: 4, topRight: 4 }, borderSkipped: 'bottom', maxBarThickness: 34 }]
      },
      options: options
    });
    sweepChart._biome = biome;
    sweepChart._rows = rows;
  }

  // ---------- Theme ----------

  function currentTheme() {
    const set = document.documentElement.dataset.theme;
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function repaintCharts() {
    rebuildFitnessChart();
    if (raceChart) drawRace(raceChart._results, raceChart._size);
    if (sweepChart) drawSweep(sweepChart._biome, sweepChart._rows);
    renderBirds();
  }

  function initTheme() {
    try {
      const saved = localStorage.getItem('finches-theme');
      if (saved === 'light' || saved === 'dark') document.documentElement.dataset.theme = saved;
    } catch (e) { /* storage blocked: follow the system */ }
    $('themeToggle').addEventListener('click', function () {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('finches-theme', next); } catch (e) { /* ignore */ }
      repaintCharts();
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      if (!document.documentElement.dataset.theme) repaintCharts();
    });
  }

  // ---------- Controls ----------

  function initControls() {
    const pop = $('popSize');
    for (let n = 4; n <= 40; n += 4) {
      const o = document.createElement('option');
      o.value = n; o.textContent = n + ' birds';
      if (n === state.size) o.selected = true;
      pop.appendChild(o);
    }
    pop.addEventListener('change', function () { state.size = Number(pop.value); restart(); });

    const seed = $('seed');
    seed.value = state.seed;
    seed.addEventListener('change', function () {
      state.seed = seed.value.trim() || F.randomSeed();
      seed.value = state.seed;
      restart();
    });
    $('newSeed').addEventListener('click', function () {
      state.seed = F.randomSeed();
      seed.value = state.seed;
      restart();
    });

    $('encoding').addEventListener('change', function () { state.gray = this.value === 'gray'; restart(); });

    $('stepBtn').addEventListener('click', function () { stopAuto(); nextGeneration(); });
    $('autoBtn').addEventListener('click', function () { state.timer ? stopAuto() : startAuto(); });
    $('resetBtn').addEventListener('click', restart);
    $('raceBtn').addEventListener('click', runRace);
    $('sweepBtn').addEventListener('click', runSweep);
    $('historyTable').closest('details').addEventListener('toggle', function () { if (this.open) renderHistoryTable(); });
  }

  initTheme();
  renderIslands();
  initControls();
  restart();
})(window.Finches);
