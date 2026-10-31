# Build KEMIVAL

La build 1.6.0 produce esclusivamente il candidato Microsoft Store. I comandi, i requisiti Windows e la procedura di collaudo sono descritti in [README_MICROSOFT_STORE.md](README_MICROSOFT_STORE.md).

`npm run build` e `npm run release:build` usano il canale Store. `npm run build:dir` serve all’ispezione locale dei file; una directory scompattata non possiede una licenza Store e non sblocca l’app.
