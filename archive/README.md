# Archive: the 1999 Master's project

Where this app started: Steve Jones's University of Salford Master's project, 1998–1999.

| File | What it is |
|------|------------|
| `ProjectProposal.doc` | Initial proposal, 10 Dec 1998: a Java applet implementation of genetic algorithms |
| `interim.doc` | Interim report, Apr 1999: modelling evolution through natural selection |
| `java/Genetic.java` | The 1999 genetic algorithm program (text output, no applet or graphics) |
| `java/*.class` | The same program compiled in 1999, so it runs without a compiler |

## The program

15 random finches, each with 20 genes (bits) split into 5 traits of 4 bits: intelligence, speed, size, beak and feathers. Each generation it scores every finch, sorts them, breeds the best (crossover) and mutates one gene. It prints the top two scores every 5 generations, then one finch's traits.

Run it (any Java runtime, from the `java` folder):

```
java testGenetic
```

The `Genetic` engine class is Mark Watson's (copyright 1996, from his Java AI library; see the header). The finch fitness model in `MyGenetic` (the 5 traits and how each is scored) is Steve's.

Known quirks, kept as they were: the final printout shows the last finch scored, not the best, and the crossover swaps the wrong gene index, so the population stops improving at about 90% of the best possible score.
