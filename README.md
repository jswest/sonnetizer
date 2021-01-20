# SONNETIZER

## Installation

(I used Node v14)

```bash
npm install
```

## Usage

Save a text file to `./texts/<NAME>.txt`. The name will be used for the JSON files that the program produces during intermediate steps.

```bash
node line.js --text=<NAME>
node generate.js --text=<NAME>
```

## How it works

The `line.js` script iterates over the source text, and breaks it into 10-syllable chunks. Then, it uses Tensorflow's Universal Sentence Encoder to embed each chunk (or putative line in the final sonnet) as a vector. It uses UMAP to reduce those vectors down to a more managable size. Then, it finds each pair of rhyming lines. Finally, it saves the map of rhymes and the embeddings.

A sonnet's lines take the following form:

```
ABAB
CDCD
EFEF
GG
```

The `generate.js` script randomly selects a line for the first `A`, then from pools of related lines (that's why we embedded the lines), it grabs a rhyming line for the second `A` as well as an initial `B`, `C`, `D`, `E`, `F`, and `G` line.
