# Darwin's Finches

Darwinian evolution shown with a genetic algorithm. Pick an island, release a flock of storm-blown mainland finches and watch natural selection shape them one generation at a time.

Plain HTML, CSS and JavaScript with no build step. Open `index.html` in a browser, or use the GitHub Pages site.

## The finch chromosome

Each bird carries 16 bits: four genes of four bits, so each gene is 0–15.

| Gene | Bits | Trait | 0 | 15 |
|---|---|---|---|---|
| A | 1–4 | Brain | tiny | large |
| B | 5–8 | Beak | short and fat | long and thin |
| C | 9–12 | Wings | short and rounded | long and pointed |
| D | 13–16 | Speed | short legs | long legs |

The bird pictures are drawn from the genes: brain size shows through the side of the head, from a speck to most of the head, the beak runs from short and fat to long and thin, the folded wing from a stub to a long wing reaching past the tail, and the legs from short to long.

## The islands

| Island | Biome | Fitness formula | Ideal bird (A,B,C,D) | Mutation per bit | Pace |
|---|---|---|---|---|---|
| Sandspit | Desert | 6D + 6A − AD/5 − A²/4 + 3B − B²/6 + 3C − C²/4 | 6, 9, 6, 15 | 5% | Fast |
| Frostholm | Tundra | 5C + 4A − A²/5 + 4D − D²/4 − CD/5 + 2B − B²/2 | 10, 2, 15, 2 | 2.5% | Medium |
| Oakhaven | Woodland | 4A − A²/6 − AD/6 + 3D − D²/4 + 6B − B² + 2C − C²/4 | 11, 3, 4, 2 | 3.5% | Medium |
| Verdant Isle | Rainforest | AB/4 − A²/5 − B²/6 + 2B + 2D − D²/5 − C | 7, 11, 0, 5 | 2% | Very slow |
| Ember Isle | Volcanic | A²/2 + 3D − AD/3 + 2B − B²/8 − 2C | 15, 8, 0, 0 | 1.5% | Slow |

Each formula has trade-offs, so not every gene is best at 0 or 15:

- **Desert:** water holes are far apart, so middling wings glide between them (longer ones are too heavy). Running (D) and thinking (A) share the scarce water (−AD), so the best brain is middling.
- **Tundra:** long wings carry the birds on their migration south, but flight muscles use the energy running would (−CD). Short beaks and legs lose less heat.
- **Woodland:** short, rounded wings to dart between branches, a short, fat beak for nuts, and a big brain to remember hidden nuts. Foraging leaves little time for running.
- **Rainforest:** brain and beak work together (+AB: a clever bird uses a twig to reach grubs), so the two genes have to evolve together. That makes it the slowest island. Long wings snag in the undergrowth (−C).
- **Volcanic:** hawks rule the air, so wings are dead weight (−2C). There are two ways to survive: outrun the hawks or outwit them. Brains only pay off once they are big (A²), so running is the easy early answer: a false peak (a fast, small-brained bird scores 53 against the ideal's 121) that small populations can get stuck on.

Fitness is shown both as the raw score and as a percentage: 100% is the island's ideal bird and 0% is the average of all 65,536 possible birds.

## The founders

Darwin's finches descend from a few birds that reached the Galápagos from the mainland. Here the first birds are storm-blown strays, suited to somewhere else: every gene of every founder is at least 7 steps (out of 15) from the island's ideal. Generation 1 looks nothing like the ideal bird and scores far below it (Frostholm: about 13 against an ideal of 98, with 20 birds). Set **Founders** to *Random birds* to start from purely random birds instead; with 20 of them, the luckiest one is typically already 55–90% of the way to the ideal.

## One generation

1. Rank the birds by fitness (ties broken at random).
2. The fitter half survive; the rest die.
3. Survivors are paired at random. Each pair has two chicks by **single-point crossover**: both chromosomes are cut at the same random point and the tails swapped.
4. Each of a chick's bits may flip (**mutation**), at the island's rate.
5. Survivors + chicks = the same population size as before. That is why population sizes go up in fours.

Because the survivors carry on, the fittest bird never gets worse.

## Gray code

In plain binary, 7 is `0111` and 8 is `1000`, so a one-step change in a trait needs all four bits to flip at once. Evolution often stalls just short of the ideal (a "Hamming cliff"). By default the genes are read as Gray code, where neighbouring numbers always differ by one bit. It is still a 16-bit binary chromosome, only read differently. Switch **Gene encoding** to *Plain binary* to compare.

Simulated over 150 runs per setting with mainland-stray founders (600-generation limit):

| Sandspit, birds | 4 | 12 | 20 | 40 |
|---|---|---|---|---|
| Gray code: median generations to ideal | 79 | 37 | 30 | 23 |
| Gray code: runs stuck | 0% | 0% | 0% | 0% |
| Plain binary: median generations to ideal | 516 | 187 | 47 | 27 |
| Plain binary: runs stuck | 45% | 13% | 1% | 0% |

On Oakhaven in plain binary, 65% of 4-bird runs and 7% of 40-bird runs never found the ideal. With Gray code, 1% of 4-bird runs got stuck and none of the larger ones.

## Controls

- **Population:** 4 to 40 birds.
- **Founders:** mainland strays (every trait far from the ideal, the default) or random birds.
- **Seed:** the same seed, island and settings always replay the same run. 🎲 picks a new one.
- **Next generation / Auto-run / Restart.** Auto-run stops when the ideal bird is found (or after 1,000 generations).
- **Evolution lab:** *Race all five islands* runs each island 40 times and plots the share of runs that have found the ideal by each generation. *Does a bigger population help?* runs the chosen island 40 times at each population size and charts the median generations to the ideal.

## Island photos

Put photos in `images/biomes/` named `desert.jpg`, `tundra.jpg`, `woodland.jpg`, `rainforest.jpg` and `volcano.jpg`. Until then each card shows a coloured placeholder.

## Files

| File | What it does |
|---|---|
| `index.html` | The page |
| `css/styles.css` | Styles, light and dark themes |
| `js/rng.js` | Seeded random numbers |
| `js/ga.js` | Chromosomes, crossover, mutation, selection |
| `js/biomes.js` | The five islands and their fitness formulas |
| `js/bird.js` | Draws a finch as SVG from its genes |
| `js/app.js` | Page wiring, charts and the lab |
| `vendor/chart.umd.min.js` | Chart.js 4.4.1 |
