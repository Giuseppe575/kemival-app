# Validazione interna del candidato 1.6.0

Aggiornato: 1 novembre 2026. Questo documento descrive il collaudo del candidato; non è un’attestazione di conformità normativa.

## Esiti locali

- 107 test applicativi superati: calcolo, percorso CMR, revisione, cumulativa HTML/DOCX, limiti PDF, avvio e file Excel reale.
- 5 test desktop superati: configurazione Store e servizio di verifica del diritto, con errori, trial e prodotto errato rifiutati.
- Smoke test Electron 43.8.6 con finestre nascoste: preload sandbox funzionante, Node non esposto, bridge congelato, blocco fuori Store, IPC da finestra secondaria rifiutato, PDF sintetico letto dal vero worker PDF.js.
- Candidato AppX x64 generato. Gate su identità, versione, corrispondenza sorgenti/pacchetto, bridge e ASAR; fuse di sicurezza verificati nell’eseguibile.
- Landing `kemival` e copie `docs/` identiche; collegamenti locali verificati. Terzo repository `ilcodicedidante.github.io`: scheda KEMIVAL aggiornata, dati professionali e test del consenso marketing (3 test).

## Dipendenze

`npm audit` del 31/10/2026: applicazione 0; runtime desktop (`--omit=dev`) 0; strumenti desktop 15 moderate, 0 alte/critiche. Le segnalazioni residue riguardano la catena di compilazione con minimatch. Non è stato imposto un cambio di major alle dipendenze transitive né il downgrade proposto da `npm audit --force`. La CI usa input di build del repository e limite di 20 minuti; queste misure non equivalgono alla correzione dell’advisory. Occorre aggiornare la toolchain quando diventa disponibile una catena compatibile corretta.

Electron, pur installato come devDependency per il packaging, è distribuito nel prodotto ed è stato aggiornato separatamente a 43.8.6. L’assenza di advisory npm non dimostra l’assenza di vulnerabilità.

## Collaudo Microsoft Store

Il bridge nativo compilato restituisce `not-store` fuori pacchetto. Il 1 novembre 2026 il candidato è stato inviato nell'anteprima privata `KEMIVAL-1.6.0-Store-license`, associata al prodotto `9PGRQHQ6GQKV` e riservata al titolare. Microsoft ne ha confermato l'elaborazione riuscita; aggiornando dal Microsoft Store sul PC del titolare è stato installato `Ilcodicedidante.MOVARISCH` versione `1.6.0.0`, `SignatureKind: Store`, `Status: Ok`.

Primo avvio e secondo avvio dopo chiusura completa riusciti: l'interfaccia principale è accessibile, senza finestra di attivazione manuale. La pagina parte da `license-locked`; il relativo blocco viene rimosso soltanto quando il bridge nativo restituisce `state: licensed` e `licensed: true`. È quindi verificato il percorso positivo del diritto Store reale sul dispositivo del titolare, che ha acquisito l'app mentre il prodotto pubblico è ancora gratuito. Non è stato eseguito né simulato un acquisto a pagamento.

Il titolare ha inoltre eseguito la prova di chiusura e riapertura senza connessione e riferito che l'app si apre normalmente anche offline; questa prova è riportata come esito comunicato dal titolare, non come osservazione remota dell'agente.

I percorsi negativi (assenza del bridge, errori, trial, prodotto errato e risposte incoerenti) sono verificati dai test locali; la build fuori Store resta bloccata nello smoke test Electron reale. Restano da completare sul canale Store la prova con un diverso account privo del diritto, la reinstallazione e la revoca. Questi casi non sono dichiarati superati per effetto della sola certificazione Microsoft.

L'AppX locale resta il candidato da inviare a Microsoft; la copia installata per il collaudo è stata firmata e distribuita dallo Store tramite anteprima privata. La bozza pubblica contiene versione 1.6.0, prezzo italiano 104,99 EUR, presentazioni italiana/inglese e proprietà aggiornate, con pubblicazione manuale. L'aggiornamento pubblico non è stato inviato per la certificazione. Le vecchie acquisizioni gratuite non costituiscono vendite retroattive.

Partner Center indica inoltre per il programma Microsoft Store in Italia profilo fiscale, profilo di pagamento e verifica tutti completati. Il profilo di accredito al titolare usa PayPal: è distinto dal checkout esterno rimosso dal prodotto. Nessun dato fiscale o finanziario è stato modificato.

Il titolare ha approvato acquisto unico a 104,99 € (livello Store approvato il 1/11/2026), vendita sia B2B sia B2C, aggiornamenti di sicurezza per almeno cinque anni dalla pubblicazione della versione 1.6.0 e assistenza tecnica email per due anni dall’acquisto. I testi sono aggiornati su questa base. La revisione rimuove checkout esterno e clausole incoerenti. La scelta dei servizi e i relativi rapporti privacy richiedono verifica documentale del titolare.
