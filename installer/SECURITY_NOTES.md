# Sicurezza del desktop

Le regole operative correnti sono in [SECURITY.md](../SECURITY.md). La distribuzione Microsoft Store sostituisce l’installer e l’aggiornatore GitHub. La licenza è verificata tramite le API Windows, non attraverso checksum di chiavi o identificativi hardware generati dall’app.

Il test `npm run test:runtime` esegue finestre nascoste con il vero preload isolato, controlla che Node non sia esposto, verifica il blocco fuori Store e il rifiuto delle richieste di una finestra secondaria. Non sostituisce il collaudo con un diritto Microsoft reale.
