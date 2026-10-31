# Validazione interna del candidato 1.6.0

Data: 31 ottobre 2026. Questo documento descrive il collaudo del candidato; non è un’attestazione di conformità normativa.

## Esiti locali

- 107 test applicativi superati: calcolo, percorso CMR, revisione, cumulativa HTML/DOCX, limiti PDF, avvio e file Excel reale.
- 5 test desktop superati: configurazione Store e servizio di verifica del diritto, con errori, trial e prodotto errato rifiutati.
- Smoke test Electron 43.8.6 con finestre nascoste: preload sandbox funzionante, Node non esposto, bridge congelato, blocco fuori Store, IPC da finestra secondaria rifiutato, PDF sintetico letto dal vero worker PDF.js.
- Candidato AppX x64 generato. Gate su identità, versione, corrispondenza sorgenti/pacchetto, bridge e ASAR; fuse di sicurezza verificati nell’eseguibile.
- Landing `kemival` e copie `docs/` identiche; collegamenti locali verificati. Terzo repository `ilcodicedidante.github.io`: scheda KEMIVAL aggiornata, dati professionali e test del consenso marketing (3 test).

## Dipendenze

`npm audit` del 31/10/2026: applicazione 0; runtime desktop (`--omit=dev`) 0; strumenti desktop 15 moderate, 0 alte/critiche. Le segnalazioni residue riguardano la catena di compilazione con minimatch. Non è stato imposto un cambio di major alle dipendenze transitive né il downgrade proposto da `npm audit --force`. La CI usa input di build del repository e limite di 20 minuti; queste misure non equivalgono alla correzione dell’advisory. Occorre aggiornare la toolchain quando diventa disponibile una catena compatibile corretta.

Electron, pur installato come devDependency per il packaging, è distribuito nel prodotto ed è stato aggiornato separatamente a 43.8.6. L’assenza di advisory npm non dimostra l’assenza di vulnerabilità.

## Collaudo Store ancora necessario

Il bridge nativo compilato restituisce `not-store` fuori pacchetto. Il diritto reale richiede una distribuzione privata associata a `9PGRQHQ6GQKV`, da verificare con account autorizzato e non autorizzato, reinstallazione, cache offline e revoca. Nessun acquisto reale è stato simulato come riuscito.

L’AppX candidato non è una distribuzione pubblica firmata. La certificazione e la firma Microsoft restano necessarie. Il prezzo e le informazioni della scheda Partner Center non sono stati pubblicati da questa modifica. Le vecchie acquisizioni gratuite non costituiscono vendite retroattive.

La revisione dei testi rimuove checkout esterno e clausole incoerenti; restano da definire destinazione B2B/B2C e impegni di supporto/aggiornamenti da dichiarare nel prodotto. La scelta dei servizi e i relativi rapporti privacy richiedono verifica documentale del titolare.
