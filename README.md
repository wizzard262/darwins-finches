# Darwin's Finches

Darwinian evolution shown with a genetic algorithm. Pick an island, release a flock of storm-blown mainland finches and watch natural selection shape them one generation at a time.

Plain HTML, CSS and JavaScript with no build step. Open `index.html` in a browser, or use the GitHub Pages site.

## The finch chromosome

Each bird carries 16 bits: four genes of four bits, so each gene is 0–15.

| Gene | Bits | Trait | 0 | 15 |
|---|---|---|---|---|
| A | 1–4 | Brain | tiny | large |
| B | 5–8 | Beak | short and fat | long and thin |
| C | 9–12 | Feathers | thin | thick |
| D | 13–16 | Speed | short legs | long legs |

The bird pictures are drawn from the genes: brain size shows through a window in the side of the head, the beak runs from short and fat to long and thin, feathers go from sleek to fluffy, and the legs from short to long.

## The islands

| Island | Biome | Fitness formula | Ideal bird (A,B,C,D) | Mutation per bit | Pace |
|---|---|---|---|---|---|
| Sandspit | Desert | 6D + 6A − AD/5 − A²/4 + 3B − B²/6 + C − C²/2 | 6, 9, 1, 15 | 5% | Fast |
| Frostholm | Tundra | 5C + 4A − A²/5 + 4D − D²/4 − CD/5 + 2B − B²/2 | 10, 2, 15, 2 | 2.5% | Medium |
| Oakhaven | Woodland | 4A − A²/6 − AD/6 + 3D − D²/4 + 6B − B² + 2C − C²/7 | 11, 3, 7, 2 | 3.5% | Medium |
| Verdant Isle | Rainforest | AB/4 − A²/5 − B²/6 + 2B + 2D − D²/5 − C | 7, 11, 0, 5 | 2% | Slow |
| Ember Isle | Volcanic | A²/3 + 4D − AD/2 + 2B − B²/8 − C | 15, 8, 0, 0 | 1.5% | Very slow |

Each formula has trade-offs, so not every gene is best at 0 or 15:

- **Desert:** running (D) and thinking (A) share scarce water (−AD), so the best brain is middling.
- **Tundra:** thick feathers are vital but heavy (−CD); short beaks and legs lose less heat.
- **Woodland:** a short, fat beak for nuts, and a big brain to remember hidden nuts. Foraging leaves little time for running.
- **Rainforest:** brain and beak work together (+AB: a clever bird uses a twig to reach grubs), so the two genes have to evolve together. That makes it slower.
- **Volcanic:** two ways to survive the hawks, outrun them or outwit them. Brains only pay off once they are big (A²), so running is the easy early answer: a false peak at 77% of the ideal that small populations can get stuck on.

Fitness is shown both as the raw score and as a percentage: 100% is the island's ideal bird and 0% is the average of all 65,536 possible birds.

## The founders

Darwin's finches descend from a few birds that reached the Galápagos from the mainland. Here the first birds are storm-blown strays, suited to somewhere else: every founder scores below an average random bird for its new island, so generation 1 starts at or below 0% and the climb to the ideal is easy to see. Set **Founders** to *Random birds* to start from purely random birds instead; with 20 of them, the luckiest one is typically already 55–90% of the way to the ideal.

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
| Gray code: median generations to ideal | 77 | 33 | 25 | 21 |
| Gray code: runs stuck | 0% | 0% | 0% | 0% |
| Plain binary: median generations to ideal | 264 | 86 | 46 | 21 |
| Plain binary: runs stuck | 31% | 13% | 1% | 0% |

On Oakhaven in plain binary, 74% of 4-bird runs and 28% of 40-bird runs never found the ideal. With Gray code, 1% of 4-bird runs got stuck and none of the larger ones.

## Controls

- **Population:** 4 to 40 birds.
- **Founders:** mainland strays (below average, the default) or random birds.
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
