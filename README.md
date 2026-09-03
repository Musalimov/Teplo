# Teplo

<p align="right">
  <a href="README.ru.md">
    <img src="https://img.shields.io/badge/Russian%20version-README-blue?style=for-the-badge" alt="Russian version">
  </a>
</p>

A daily word game: find the hidden word by typing other words. Every guess gets a number — its place in the list of all words ranked by how close they are in meaning to the answer.

**1** is the hidden word itself, you win. **2** is its nearest neighbour in meaning. **8** is very close. **350** is a warm direction. Beyond that you are off.

Closeness is about meaning, not spelling: "winter" is near "frost" and "december", not near "winner". A new puzzle every day at local midnight.

Runs entirely in the browser, no server. Two languages to choose from, Russian and English.

## How to play

Type a word in any form — the game reduces it to the base form: "cats" counts as "cat", "поезда" as "поезд".

The "•••" button next to the input opens the hint and "Give up". A hint picks a word from the warm zone and costs five guesses, so the counter jumps from `#4` straight to `#9`. It never lands closer than tenth place, so it will not hand you the answer.

The arrows in the header take you back to earlier days. Progress and the solved counter live in the browser; the "Reset" button in the footer wipes everything.

## Deployment

The game is built for GitHub Pages. It will not work as a local file: browsers forbid a page opened from `file://` to load neighbouring files.

1. Create a public repository.
2. Upload all five files to the root: `index.html`, `sw.js`, `slova.bin`, `ru.bin`, `en.bin`. Do not rename them — the game looks them up by name.
3. Settings → Pages → Source: Deploy from a branch → branch `main`, folder `/ (root)` → Save.
4. After a minute or two the game is live at `https://YOUR-NAME.github.io/REPO-NAME/`.

On iPhone it is worth adding to the home screen: Share → "Add to Home Screen". It then opens full screen without the address bar.

`sw.js` is optional. With it the game works offline after the first visit: the dictionaries stay in the browser cache, while the page itself is always fetched from the network and cached only as a fallback.

## Settings

There is a block at the top of `index.html` you can edit in any text editor:

```js
const CUSTOM = {
  title:      "Тепло",
  name:       { ru: "Бася", en: "Basya" },   // name used in the greeting
  winMessage: { ru: "Победа!", en: "Победа!" },
  extraRu:    [],    // your own words to be guessed, e.g. ["варенье"]
  extraEn:    []
};
```

The greeting follows the time of day and the language of the game: "Доброе утро, Бася" / "Good evening, Basya". Leave the name empty to greet without one.

Words listed in `extraRu` and `extraEn` are added to the built-in puzzles. Almost any ordinary word works; anything missing from the dictionary is skipped silently, with a warning in the browser console.

## How it works

**Models.** Russian uses word2vec from [RusVectores](https://rusvectores.org/), trained on the Russian National Corpus, with lemmatised and POS-tagged vectors. English uses [GloVe](https://nlp.stanford.edu/projects/glove/) trained on Wikipedia 2014 and Gigaword 5. Both are 300-dimensional.

**Storage.** Vectors are quantised to one byte per number. At 300 dimensions the loss is negligible: mean cosine error is 0.0008 and nearest-neighbour lists match the original float32 word for word. Files are served as binary and unpacked in the browser as a stream through `DecompressionStream`.

**Dictionary and core.** Guesses are accepted against the whole dictionary: 38,000 Russian lemmas and 30,000 English ones. But ranks are counted only over a core of everyday words — 15,000 and 12,000. Otherwise the rare tail inflates every number: "water" scored 1620 against "grape" instead of 653, because fifteen hundred words nobody would ever type were wedged in between. Rare words still get an honest number, they are simply measured against the same yardstick: "полустанок" sits at position 32,000 by frequency yet scores 19 against "вокзал".

**Morphology.** 555,755 Russian word forms map to their lemmas, generated with [pymorphy3](https://github.com/no-plagiarism/pymorphy3). English has 45,236 forms via [LemmInflect](https://github.com/bjascob/LemmInflect), irregular ones like `children → child` included. Forms are stored as a single sorted string and searched by bisection: an object with half a million keys would cost the browser tens of megabytes.

English forms are collapsed conservatively — plurals and `-ed` only. Anything broader makes the lemmatiser swallow words in their own right: `painting` becomes `paint`, `evening` becomes `even`, `number` becomes `numb`.

**Choosing the puzzles.** 628 Russian and 800 English. Words were selected using human ratings: Brysbaert's [concreteness norms](http://crr.ugent.be/archives/1330) and Warriner's [valence norms](https://link.springer.com/article/10.3758/s13428-012-0314-x). No such datasets exist for Russian, so the ratings were learned from the English scores and transferred through the cross-lingual space of [ConceptNet Numberbatch](https://github.com/commonsense/conceptnet-numberbatch): held-out accuracy is 0.881 for concreteness and 0.838 for valence. Abstractions like "relationship" are filtered out — they are miserable to guess because they have no clear neighbours. Anatomy, weapons and unpleasant words are excluded too, and for Russian also diminutives whose base word is already on the list.

**Ordering.** Puzzles are shuffled so that yesterday's answer does not give away today's: words are split into 16 semantic clusters, each spread evenly across the whole sequence, then a repair pass separates the remaining close pairs. The highest similarity between consecutive days is 0.41. The supply lasts until May 2028, after which the list repeats.

## Updating

When replacing files you need to bump two numbers, otherwise the browser will serve the page from cache:

- `CACHE` on the first line of `sw.js`;
- `BUILD` near the top of `index.html`.

The current build number is shown in the footer of the game, next to the solved counter. If it does not change after an upload, the page came from cache: Settings → Apps → Safari → Advanced → Website Data → delete the site. This also wipes saved progress.

## Sources

| What | Licence |
|---|---|
| RusVectores, word2vec on the Russian National Corpus | CC BY 4.0 |
| GloVe, Wikipedia + Gigaword | Public Domain Dedication and License |
| ConceptNet Numberbatch | CC BY-SA 4.0 |
| Concreteness norms, Brysbaert et al. 2014 | research use |
| Valence norms, Warriner et al. 2013 | research use |
| pymorphy3, LemmInflect, wordfreq | MIT / Apache 2.0 |

Numberbatch and both sets of human ratings were used only at build time, to select the words to be guessed. Neither ships with the game.

Inspired by [Semantle](https://semantle.com/) by David Turner.
