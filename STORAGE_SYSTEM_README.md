# Archiviazione locale

KEMIVAL elabora le SDS in memoria. Salvataggi Word, Excel e CSV sono richiesti dall’utente e gestiti dal sistema operativo. La preferenza linguistica è memorizzata in `localStorage` (`movarisch:lang`).

La scheda cumulativa riceve temporaneamente `movarisch_cumulative_data`, lo elimina alla lettura e rifiuta dati più vecchi di cinque minuti. I contenuti non vengono trasmessi automaticamente a servizi KEMIVAL.

La licenza non usa localStorage, sessionStorage, cookie o IndexedDB. Viene verificata tramite Microsoft Store; vedere `LICENSE_SYSTEM_README.md`. La cartella dati Electron resta `%APPDATA%/MOVARISCH` per preservare la continuità delle installazioni esistenti.
