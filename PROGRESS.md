# KEMIVAL - Progress e Stato del Progetto

**Ultimo aggiornamento:** 20 Maggio 2026

---

## Stato Attuale: v1.3.1 ✅ (rilasciata)

### v1.3.1 — fix UI dopo hardening v1.3.0
- **Link "Supporto rapido" funzionanti di nuovo**: `setWindowOpenHandler` consente `file://` per le pagine interne (`support/*.html`) con sandbox sicura (preload + contextIsolation + nodeIntegration:false).
- **Nota legenda aggiornata** ai 2 preset: "P1 (Laboratorio) + P2 (Produzione rapida)" con rinvio ai bottoni in tabella.

### v1.3.0 — adeguamento normativo + UX + security

**Adeguamento MoVaRisCh 2026 e D.Lgs. 135/2024 (in vigore 11/10/2024):**
- Rimosse dal calcolo P: H360, H360D, H360F, H360FD, H360Df, H360Fd (Repr. 1A/1B → ora trattate ex Titolo IX Capo II, art. 234 mod.).
- Mantenute nel calcolo P: H341, H351, H361, H361d, H361f, H361fd, H362 (cat. 2 / allattamento, NON coperte dal D.Lgs. 135/2024).
- Aggiunte: EUH380=10.00, EUH381=8.00 (interferenti endocrini, MoVaRisCh 28/02/2026).
- Nuovo flag `isCmr` + lista `cmrCodes` su ogni riga; warning rosso esplicito nel Word + nuova colonna `Sostanza_CMR_TitIX_CapoII` nell'Excel.

**Preset operativi:**
- Aggiunto `PRESETS.preset2` (Produzione rapida: ventilazione generale, <15min, contatto accidentale).
- `PRESETS.preset1` (Laboratorio) resta default.
- Bottoni "P1"/"P2" in tabella per riga; il bottone si spegne se l'utente modifica manualmente un dropdown.

**Coerenza Word ↔ Calcolo:**
- Indici nel report Word ora stampati come "valore_numerico (descrizione_opzione)" — niente più ambiguità.
- Appendice fissa "Guida agli indici MoVaRisCh" (D/Q/U/C/T/I) con esempi laboratorio vs produzione + formula + riferimento normativo.

**Security hardening (Electron):**
- CSP `<meta http-equiv="Content-Security-Policy">` in index.html.
- `setWindowOpenHandler` e `will-navigate` resi restrittivi (blocca `javascript:`, `data:`, `blob:` ecc.).
- Handler `web-contents-created` blocca `<webview>` e nuove finestre non autorizzate.
- Documentate limitazioni note: `sign:null`, `verifyUpdateCodeSignature:false`, license checksum reversibile.
- TODO supply-chain annotati nei loader CDN (xlsx, docx, pdfjs).

### Cose da fare prima del build effettivo
- Aggiornare `en.json` con le nuove chiavi i18n (CMR warning, indexGuide, presets).
- Bundle locale per docx/xlsx/pdfjs (TODO_PRIORITY_ALTA, rinviato a v1.3.1).
- Test aggiuntivi: H360 deve NON contribuire a SCORE; H361 deve contribuire; preset apply/clear.

---

## Stato Precedente: v1.2.0 ✅

### Repository
- **GitHub Programma:** https://github.com/Giuseppe575/kemival-app
- **GitHub Releases:** https://github.com/Giuseppe575/kemival-app/releases
- **Sito Acquisto:** https://giuseppe575.github.io/kemival/

### Release Pubblicate
- **v1.1.0** - Release Ufficiale (29 Nov 2025)
- **v1.2.0** - Sistema aggiornamenti automatici (1 Feb 2026) ← ATTUALE

---

## Completato ✅

### Sistema Licenze Offline
- [x] `src/license-validator.js` - Validazione licenze con checksum
- [x] `src/license-activation.js` - UI per attivazione licenza
- [x] `src/license-settings.js` - Gestione impostazioni licenza
- [x] Bug risolti nel sistema di validazione
- [x] Test di regressione in `__tests__/movarisch.test.js`

### Sistema Aggiornamenti Automatici
- [x] `installer/updater.js` - Modulo electron-updater
- [x] `installer/main.js` - Integrazione updater all'avvio
- [x] `installer/preload.js` - Eventi update esposti al renderer
- [x] `installer/package.json` - Configurazione publish per GitHub Releases
- [x] Menu "Aiuto → Controlla aggiornamenti..."
- [x] Notifiche automatiche quando disponibile nuova versione
- [x] **TESTATO E FUNZIONANTE** - Gli utenti riceveranno notifiche per versioni future

### Electron Installer Windows
- [x] Configurazione electron-builder
- [x] Icona professionale KEMIVAL
- [x] Installer NSIS in italiano
- [x] Script di build (`build-windows.bat`)

### GitHub Releases
- [x] Release v1.1.0 pubblicata con installer
- [x] Release v1.2.0 pubblicata con sistema aggiornamenti
- [x] File `latest.yml` per electron-updater

---

## Da Fare (Prossime Versioni)

### Per la v1.3.0
- [ ] Migliorare messaggio quando non ci sono aggiornamenti (attualmente mostra "Errore")
- [ ] Eventuali nuove funzionalità richieste dagli utenti
- [ ] Aggiornare sito acquisto se necessario

---

## Come Pubblicare un Aggiornamento

### 1. Aggiorna la versione
Modifica in **3 file**:

**installer/package.json:**
```json
"version": "1.3.0"
```

**installer/main.js** (2 punti):
- Titolo finestra: `title: 'KEMIVAL v1.3.0'`
- Dialog info: `message: 'KEMIVAL v1.3.0'`

**installer/preload.js** (2 punti):
- `version: '1.3.0'`
- `console.log('KEMIVAL v1.3.0 - Electron App')`

### 2. Build dell'installer
```powershell
cd C:\Users\atisg\movarisch\installer
npm run build
```

### 3. Pubblica su GitHub Releases
1. Vai su https://github.com/Giuseppe575/kemival-app/releases/new
2. Tag: `v1.3.0`
3. Target: `main`
4. Titolo: `KEMIVAL v1.3.0`
5. Descrizione con novità
6. Carica i file dalla cartella `installer/dist/`:
   - `KEMIVAL-Setup-1.3.0.exe`
   - `latest.yml`
7. Spunta "Set as the latest release"
8. Pubblica

### 4. Commit e push
```powershell
cd C:\Users\atisg\movarisch
git add installer/main.js installer/package.json installer/preload.js
git commit -m "chore: Aggiornamento versione a v1.3.0"
git push origin main
```

### 5. Gli utenti riceveranno la notifica automaticamente!

---

## Struttura File Importanti

```
movarisch/
├── src/
│   ├── license-validator.js    # Validazione licenze
│   ├── license-activation.js   # UI attivazione
│   └── license-settings.js     # Impostazioni
├── installer/
│   ├── main.js                 # Entry point Electron
│   ├── preload.js              # Bridge sicuro
│   ├── updater.js              # Sistema aggiornamenti
│   ├── package.json            # Config build + publish
│   ├── dist/                   # Output build (non committato)
│   └── build/
│       └── icon.ico            # Icona app
├── __tests__/
│   └── movarisch.test.js       # Test automatici
├── docs/
│   ├── eula.html               # Licenza utente
│   └── privacy.html            # Privacy policy
└── PROGRESS.md                 # Questo file
```

---

## Note Tecniche

### electron-updater
- Provider: GitHub Releases
- Owner: Giuseppe575
- Repo: movarisch
- Auto-download: disabilitato (chiede conferma all'utente)
- Auto-install on quit: abilitato
- Controllo automatico: all'avvio + ogni 4 ore

### Test
Esegui con: `npm test`
- 3 test per calcoli KEMIVAL
- Tutti passano ✓

---

## Storico Sessioni di Lavoro

### 1 Febbraio 2026
- ✅ Risolti bug sistema licenze
- ✅ Implementato sistema aggiornamenti automatici (electron-updater)
- ✅ Pubblicata release v1.2.0 su GitHub
- ✅ Testato funzionamento aggiornamenti (funziona!)
- ✅ Aggiornato PROGRESS.md

### Commit Recenti
1. `7ba475d` - chore: Aggiornamento versione a v1.2.0
2. `9a2c5b3` - docs: Aggiunto PROGRESS.md
3. `a044b41` - feat: Sistema aggiornamenti automatici con electron-updater
4. `1441a43` - feat: Aggiunti strumenti di supporto per build Windows
5. `b270832` - feat: Aggiunta icona KEMIVAL professionale

---

## Diario di ripresa — 31 luglio 2026

### Obiettivo della revisione in corso

- Rendere la verifica delle SDS molto più rapida per l'operatore.
- Conservare il controllo professionale, concentrandolo soltanto sulle vere eccezioni.
- Revisionare integralmente la scheda cumulativa per più prodotti.
- Estrarre i DPI dalla Sezione 8 delle SDS e distinguere indicazioni, consigli e condizioni d'uso senza inventare obblighi.
- Collaudare il flusso con le 8 SDS reali presenti in `__tests__/schede test`.

### Modifiche implementate ma non ancora pubblicate

- Nuova conferma rapida di gruppo con un solo nominativo e una sola dichiarazione di verifica.
- Le schede calcolabili restano chiuse e sintetiche; si aprono automaticamente soltanto quelle da approfondire.
- Il dettaglio di Sezione 3 e Sezione 16 resta disponibile come controllo tecnico, ma non appesantisce il flusso ordinario.
- Nuovo parser DPI in `src/lib/sds/dpi-parser.js`, basato sulla Sezione 8.
- Classificazione DPI: indicato dalla SDS, consigliato, condizionato allo scenario, non richiesto/non determinato.
- Nuova scheda cumulativa multiprodotto: usa tutte le righe e non più soltanto la prima SDS.
- La cumulativa contiene riepilogo prodotti, matrice DPI, riferimenti a prodotto/pagina e interventi; non genera obblighi DPI fittizi dallo score.
- Corretto il motore salute: H2xx, H4xx ed EUH informative non sospendono il coefficiente P come se fossero errori del modello salute.
- Aggiunto versionamento alla risorsa del motore nell'HTML per evitare che una vecchia copia in cache annulli la correzione.
- Evitata la duplicazione degli eventi della conferma rapida durante i rerender.

### Esito del collaudo reale con 8 SDS

- 8 file caricati ed elaborati insieme senza errore.
- 6 schede risultano pronte e sono state confermate correttamente con un'unica operazione di prova.
- 2 schede restano correttamente da approfondire:
  - `MULTIGIENIC (SS).pdf`
  - `SPEED (SS).pdf`
- Per entrambe la regola è `UNCLASSIFIED_MIXTURE_REQUIRES_STRUCTURED_INGREDIENT_DATA`: la Sezione 2 riporta soltanto pericoli non sanitari, quindi il metodo richiede dati ingredienti strutturati prima di attribuire P.
- DPI rilevati: 3–4 famiglie per quasi tutti i prodotti; MULTIGIENIC ne rileva 1.
- Gli score corretti verificati nel test includono: AQUA SC 4,50; IDRO PROFUMATO 6,25; KALC 5,75; SCRUB SC 5,75; SUPRACID 5,75; XTRA-CALC PLUS 4,50.

### Test automatici

- Suite completa superata: 85 test su 85.
- Nuovi test dedicati a DPI, cumulativa multiprodotto, conferma rapida e pericoli non sanitari.
- `node --check app.js` superato.
- `git diff --check` superato prima dell'ultimo piccolo aggiornamento; da ripetere alla ripresa.

### Stato di rilascio

- Versione pubblica precedente: v1.4.4.
- Questa revisione non è stata ancora versionata, compilata, installata, committata o pubblicata.
- Nessun aggiornamento automatico è stato inviato agli utenti.

### Da riprendere domani, in ordine

1. Migliorare il testo visibile delle due eccezioni, sostituendo il codice tecnico della regola con una spiegazione semplice.
2. Decidere e implementare il flusso più rapido per correggere i dati ingredienti di MULTIGIENIC e SPEED senza chiedere controlli inutili.
3. Completare il test della scheda cumulativa con tutte e 8 le SDS confermate in una sessione di collaudo.
4. Verificare visivamente layout, stampa/PDF e matrice DPI della cumulativa.
5. Ripetere l'intera suite automatica e il controllo delle differenze.
6. Portare la versione a v1.4.5 e creare un installer locale di prova.
7. Consegnare l'installer al professionista per il test; pubblicare l'aggiornamento automatico soltanto dopo approvazione esplicita.

### File principali modificati nella revisione

- `app.js`
- `index.html`
- `style.css`
- `cumulative-report.html`
- `src/lib/movarisch-health-engine.js`
- `src/lib/sds/dpi-parser.js`
- `__tests__/health-score-2026.test.js`
- `__tests__/offline-assets.test.js`
- `__tests__/ui-table-layout.test.js`
- `__tests__/dpi-parser.test.js`
- `__tests__/cumulative-multi-sds.test.js`

---

## Diario di avanzamento — 3 agosto 2026

### Completato

- Sostituiti i codici tecnici delle eccezioni con spiegazioni operative comprensibili.
- Ridotta la gestione delle eccezioni a punteggio professionale e motivazione sintetica; la motivazione standard viene proposta automaticamente ed è modificabile.
- Spostati i dettagli delle Sezioni 2, 3 e 16 in un pannello tecnico chiuso per impostazione predefinita.
- Collaudo reale ripetuto: 6 SDS confermate con una sola operazione; MULTIGIENIC e SPEED restano le sole eccezioni corrette.
- Completata la scheda cumulativa con 8 prodotti e 4 famiglie DPI.
- Il giudizio DPI ora è distinto prodotto per prodotto e non usa più un unico esito cumulativo ambiguo.
- Verificata visivamente la cumulativa completa: prodotto, giudizio SDS, pagina e testo sorgente sono leggibili.
- Versione portata a v1.4.5; versione del preload ricavata automaticamente dal package anziché mantenuta come valore statico.

### Verifiche superate

- Test applicazione: 87/87.
- Test installer/updater: 3/3.
- Release gate configurazione: superato.
- Build Windows NSIS: completato.
- Controllo artefatti e `latest.yml`: superato.

### Installer locale di prova

- File: `installer/dist/KEMIVAL-Setup-1.4.5.exe`
- Dimensione: 101.168.113 byte.
- SHA-256: `6D62E1C671195C91E61C449C10E2F7BED0AA79124DCE2B6F52E7C9597393ECC0`
- Firma digitale: assente, come concordato per questa fase.
- Aggiornamento automatico: non pubblicato; attendere il test e l'approvazione del professionista.

### Nota sul collaudo

- I valori 1,00 inseriti temporaneamente per MULTIGIENIC e SPEED servivano esclusivamente ad aprire e verificare la cumulativa; non rappresentano una valutazione professionale e non sono stati salvati nell'app o nell'installer.
- Build rigenerata dopo la richiesta del professionista: la nota metodologica sulle Sezioni SDS, la validazione, le correzioni e i warning tecnici non compaiono più nel Word esportato.

### Controllo finale dell'interfaccia prima della pubblicazione

- Verificata la legenda del rischio rispetto alla matrice MoVaRisCh 2026 ufficiale; soglie, giudizi e gestione dei valori di confine sono coerenti con il motore di calcolo.
- Aggiunto al giudizio di rischio irrilevante il richiamo a consultare comunque il medico competente.
- Precisato che i preset P1/P2 sono scenari precompilati di praticità e devono essere verificati rispetto alla mansione reale; non sono valori normativi.
- Aggiornato il tutorial al flusso attuale: caricamento SDS, estrazione preliminare, conferma rapida di gruppo, gestione delle sole eccezioni ed esportazione Excel/Word/cumulativa.
- Verificati i quattro collegamenti locali di supporto: knowledge base, documentazione tecnica, ticket e licenza d'uso.
- Sostituito lo sfondo blu molto scuro con una palette blu ardesia più chiara, mantenendo contrasto e leggibilità.
- Suite completa aggiornata e superata: 91/91 test; controllo sintattico e `git diff --check` superati.
- Installer v1.4.5 rigenerato con la nuova palette: 101.168.388 byte, SHA-256 `6D1294F856E3D65B2850CD305218A9AF7EBE79CB70F6B823EA2F1D9DF93AAA13`.
- Release gate e controllo degli artefatti superati; firma digitale assente come concordato.

### Pubblicazione finale v1.4.5

- Pull request `#26` approvata dai controlli CI e integrata in `main` il 3 agosto 2026.
- Tag pubblico `v1.4.5` creato sul commit di rilascio.
- Release GitHub pubblicata come release stabile, non bozza e non prerelease.
- Pubblicati `KEMIVAL-Setup-1.4.5.exe`, `latest.yml` e `KEMIVAL-Setup-1.4.5.exe.blockmap`.
- Verificato tramite API GitHub che `releases/latest` restituisce `v1.4.5` e che tutti gli asset risultano caricati.
- Le installazioni dotate di updater possono rilevare la 1.4.5; download e installazione richiedono la conferma dell'utente. La 1.1.0 richiede invece l'installazione manuale.

---

## Diario di avanzamento - revisione cumulativa v1.4.6

- Aggiunto l’export della scheda cumulativa in Word modificabile.
- Ridisegnato il DOCX come relazione tecnica sobria: testata, metadati, quadro generale, tabelle a righe alternate, misure, validazione e firma.
- Aggiunta la tabella “Prodotto e SDS di riferimento / Frase H / Descrizione” per i pericoli del prodotto presenti in Sezione 2.
- Aggiunto il repertorio italiano delle descrizioni CLP, con gestione distinta delle varianti H360/H361.
- Eliminato il taglio fisso della fonte DPI; introdotta una sintesi che conserva norma, materiale, prestazioni e condizioni operative senza spezzare parole.
- Compattata la matrice DPI in un’unica tabella con prodotto, file SDS, dispositivo, stato, sintesi tecnica e pagina.
- Versione di lavoro portata a 1.4.6 perché la 1.4.5 è già pubblica.
- Verifiche superate: 95/95 test, sintassi JavaScript e controllo differenze.
- Collaudo browser completato con dati multiprodotto fittizi; schermata salvata in `output/playwright/cumulative-report.png`.
- DOCX di prova aperto in Microsoft Word, convertito in PDF e controllato pagina per pagina: 4 pagine, 5 tabelle, nessun contenuto tagliato o sovrapposto.
- Installer locale v1.4.6 creato e verificato: 101.174.260 byte, SHA-256 `113044FB5BC56153698716ED14CAB482A1305BB27972F35BAB1C6986599547F0`.
- Release gate, artefatti e `latest.yml` superati; firma digitale assente come concordato.
- Pull request `#27` approvata dai controlli CI e integrata in `main` il 3 agosto 2026.
- Tag e release stabile `v1.4.6` pubblicati con installer, `latest.yml` e blockmap.
- Verificato tramite API GitHub che `releases/latest` restituisce `v1.4.6` e che tutti gli asset risultano caricati con digest coerente.
- Aggiornamento automatico attivo per le installazioni dotate di updater; download e installazione richiedono la conferma dell’utente.

---

## Diario di avanzamento — pubblicazione Microsoft Store (5–6 agosto 2026)

### Strategia di distribuzione

- Confermato che l’installer NSIS/GitHub esistente deve rimanere disponibile e invariato come percorso di distribuzione alternativo.
- Aggiunto un percorso di build separato per Microsoft Store in formato APPX, senza sostituire o modificare l’installer tradizionale.
- Verificato nuovamente l’installer esistente `installer/dist/KEMIVAL-Setup-1.4.6.exe`: SHA-256 `113044FB5BC56153698716ED14CAB482A1305BB27972F35BAB1C6986599547F0`, invariato durante il lavoro Store.
- Per la versione Store gli aggiornamenti sono gestiti dal Microsoft Store; per la versione NSIS resta attivo `electron-updater` tramite GitHub Releases.

### Implementazione del pacchetto Store

- Aggiunta la configurazione separata `installer/electron-builder.store.cjs`.
- Aggiunti gli script `installer/scripts/build-store.js` e `installer/scripts/generate-store-assets.js`.
- Aggiunti gli asset APPX in `installer/build/appx/` e la guida `installer/README_MICROSOFT_STORE.md`.
- Aggiunti i comandi `store:assets`, `build:store:test` e `build:store` in `installer/package.json`.
- Aggiunto il test `installer/test/store-config.test.js` e ignorata la cartella di output `installer/dist-store/`.
- `installer/updater.js` ora riconosce `process.windowsStore`: la build Store non usa l’updater GitHub, mentre la build NSIS conserva il comportamento precedente.
- Pacchetto definitivo generato: `installer/dist-store/KEMIVAL-Store-1.4.6-x64.appx`, circa 144,4 MB.
- Il pacchetto locale è intenzionalmente non firmato: Microsoft applicherà la propria firma dopo la certificazione.
- Verifiche superate: 97/97 test applicazione, 5/5 test installer e release gate di configurazione.

### Identità Microsoft Store

- Nome riservato: `KEMIVAL`.
- Store ID: `9PGRQHQ6GQKV`.
- Package Identity Name: `Ilcodicedidante.KEMIVAL`.
- Publisher: `CN=A86609EB-DF07-4138-9EFD-272E5709FBAD`.
- Publisher display name: `Ilcodicedidante`.
- Package Family Name: `Ilcodicedidante.KEMIVAL_6krz5prms6kkj`.
- Submission 1: `1152921505701586815`.
- Il pacchetto APPX è stato caricato, analizzato e accettato da Partner Center per Windows 10/11 Desktop, architettura x64, versione `1.4.6.0`.
- La capability `runFullTrust`, necessaria per l’app desktop Electron, è stata dichiarata e motivata ai certificatori: esecuzione Win32, apertura dei PDF scelti dall’utente, generazione locale di file Excel/Word e salvataggio delle impostazioni, senza elevazione amministrativa, servizi o driver.

### Prezzo, licenza e documentazione commerciale

- Il download dal Microsoft Store è configurato come gratuito in tutti i mercati.
- L’uso completo richiede la licenza perpetua KEMIVAL per 1 PC, prezzo `€105` comprensivo di oneri fiscali.
- L’acquisto rimane esterno al Microsoft Store e viene gestito tramite PayPal sulla pagina ufficiale: `https://giuseppe575.github.io/kemival/acquista.html`.
- Dichiarato in Partner Center che il prodotto consente acquisti senza utilizzare il sistema commerciale Microsoft Store.
- Nelle schede Store italiana e inglese è stato chiarito che, entro 24 ore dall’acquisto, il cliente riceve via email:
  - chiave di licenza nel formato `MOVA-XXXX-XXXX-XXXX-XXXX`;
  - guida rapida di attivazione;
  - fattura elettronica;
  - collegamento all’ultima versione.
- Aggiornati `src/license-activation.js`, `docs/acquista.html`, `docs/index.html`, `docs/termini.html` e `docs/eula.html` per rendere coerenti prezzo, oneri fiscali, consegna e link ufficiale.
- Aggiunto `__tests__/store-license.test.js` per impedire la ricomparsa del vecchio prezzo di €100, delle diciture IVA obsolete e del dominio segnaposto.
- Privacy Policy Store collegata a `https://giuseppe575.github.io/kemival/privacy.html`.

### Scheda Store e certificazione

- Categoria: `Business` → `Data + analytics`.
- Classificazione IARC completata: 3+ / adatto a tutti, con indicazione di acquisti nell’app dovuta alla licenza digitale esterna.
- Completate le schede Store in italiano e inglese con descrizione, funzionalità, prezzo della licenza, avvertenza professionale e due screenshot reali dell’app per lingua.
- Inserite in Partner Center istruzioni riservate per i certificatori e una licenza di prova dedicata; il valore della chiave non è riportato in questo diario.
- Configurata la pubblicazione automatica appena la submission supera la certificazione.
- Submission inviata definitivamente a Microsoft il 5 agosto 2026.

### Stato verificato il 6 agosto 2026

- Stato generale: **In certification**.
- Avanzamento: **fase 3 di 4 — Certification**.
- Submission: completata.
- Pre-processing: completato.
- Certification: in corso.
- Publishing: non ancora iniziato.
- Nessun errore, rifiuto o richiesta di intervento presente in Partner Center.
- Nessuna email ricevuta finora: situazione normale finché la certificazione non cambia stato; Microsoft indica alcune ore e, in certi casi, fino a 3 giorni lavorativi.
- Prossima azione: controllare Partner Center e l’email; se la certificazione viene approvata, la pubblicazione partirà automaticamente.

### Nota per future applicazioni PWA

- Una PWA pubblicata nel Microsoft Store viene distribuita dallo Store su Windows.
- La stessa PWA può essere installata direttamente dal browser su Android e iPhone/iPad, se responsive e dotata di HTTPS, manifest e service worker.
- La presenza nel Google Play Store o nell’Apple App Store richiede invece pacchetti, account e revisioni separati; non deriva automaticamente dalla pubblicazione Microsoft.

## Pubblicazione completata e documentazione tecnica — 6 agosto 2026

- KEMIVAL versione `1.4.6` è stato certificato e pubblicato nel Microsoft Store.
- Pagina pubblica: `https://apps.microsoft.com/detail/9PGRQHQ6GQKV`.
- Data di rilascio mostrata dallo Store: 6 agosto 2026.
- La pagina pubblica mostra correttamente l'editore `Ilcodicedidante`, ma il campo **Sviluppato da** riporta soltanto `Giuseppe`.
- Il nome corretto da inserire nel prossimo aggiornamento della scheda Store è **Dott. Giuseppe Strifezza**; nelle informazioni dell'editore va inoltre indicata la **P. IVA 04107650659**.
- Nei sorgenti sono stati corretti autore e copyright in `installer/package.json` e nella finestra Informazioni di `installer/main.js`; la modifica diventerà parte del prossimo pacchetto.
- Creata la presentazione tecnica `docs/PRESENTAZIONE_TECNICA_KEMIVAL.md`, che descrive architettura Electron, pipeline SDS, calcolo, licenza, sicurezza, build NSIS e distribuzione APPX/MSIX tramite Microsoft Store.
- Verifiche successive alla correzione: 97/97 test applicazione e 5/5 test installer superati.

## Prima acquisizione internazionale e analisi lingue — 10 agosto 2026

- Il valore `240` mostrato nella panoramica Partner Center indica i mercati di disponibilità, non il numero di download.
- Nel report Acquisitions, intervallo ultimi 30 giorni, KEMIVAL registra:
  - 4 visualizzazioni della pagina Store;
  - 1 installazione completata;
  - conversione pagina-installazione del 25%;
  - tasso di successo installazione del 100%;
  - mercato attribuito: Polonia, 1 installazione (100% delle installazioni registrate).
- Il report Usage mostra 0 dispositivi attivi mensili e 0 sessioni. Le metriche di utilizzo sono indicate come `Opt-in`, quindi lo zero non dimostra con certezza che l'app non sia mai stata aperta; non è comunque presente un segnale di uso attivo rilevato.
- L'installazione Store è gratuita e non equivale all'acquisto della licenza esterna da €105; è quindi coerente che non risulti alcun pagamento PayPal.
- Il pacchetto e l'app dispongono già di italiano e inglese, ma il confronto dei file i18n rileva 249 voci italiane e 204 inglesi: mancano 45 traduzioni inglesi, soprattutto preset, avvertenze normative e parti tecniche dei report.
- Strategia consigliata: completare e collaudare prima l'inglese nella stessa app e nello stesso pacchetto; non creare un secondo prodotto Store. Valutare una lingua polacca solo dopo ulteriori segnali di domanda.
- Nota commerciale: tradurre l'interfaccia non rende automaticamente il metodo conforme alla normativa di altri Paesi. KEMIVAL applica un modello e riferimenti normativi italiani; all'estero deve essere presentato con chiarezza come strumento basato sul metodo italiano, salvo successivo adattamento normativo locale.

## Correzione autore Store — bozza del 7 agosto 2026

- Creata in Partner Center la **Submission 2**: `1152921505701602007`.
- La submission modifica soltanto le schede Store; pacchetto APPX, prezzo, disponibilità, proprietà e classificazione restano invariati.
- Scheda italiana aggiornata con:
  - `Sviluppato da: Dott. Giuseppe Strifezza`;
  - `© 2026 Dott. Giuseppe Strifezza — P. IVA 04107650659. KEMIVAL. Tutti i diritti riservati.`
- Scheda inglese aggiornata con:
  - `Developed by: Dott. Giuseppe Strifezza`;
  - `© 2026 Dott. Giuseppe Strifezza — VAT No. IT04107650659. KEMIVAL. All rights reserved.`
- Opzione di pubblicazione: automatica appena la submission supera la certificazione.
- Stato: **bozza completa**, pulsante `Submit for certification` abilitato; invio definitivo in attesa della conferma del titolare.

### Invio definitivo della correzione

- Il titolare ha confermato l'invio definitivo il 7 agosto 2026.
- La Submission 2 è stata inviata correttamente a Microsoft.
- Stato immediatamente successivo all'invio: **Update in certification**, fase **2 di 4 — Pre-processing**.
- Submission: completata; pre-processing: in corso; certification e publishing: non ancora iniziati.
- Dopo il superamento della certificazione, Microsoft pubblicherà automaticamente il nuovo nome sviluppatore e la partita IVA.

## Inglese completo e strategia commerciale Store — 10 agosto 2026

- Completate le 45 traduzioni inglesi mancanti in `src/i18n/en.json`: italiano e inglese espongono ora 249 chiavi ciascuno.
- Aggiunto `__tests__/i18n-parity.test.js`, che controlla automaticamente la parità delle chiavi e dei segnaposto dinamici tra le due lingue.
- Nessuna modifica apportata alla logica di calcolo, al parser SDS, alla licenza o al pacchetto di installazione.
- Verifica completa superata: 99/99 test applicazione.
- Nel pannello Partner Center del prodotto non risulta esposta una funzione per creare campagne pubblicitarie Store a pagamento; sono presenti condivisione social, esperimenti della pagina e componenti aggiuntivi acquistabili.
- Per misurare promozioni esterne si possono usare collegamenti Store con parametro `cid`, ad esempio `https://apps.microsoft.com/detail/9PGRQHQ6GQKV?cid=website`.
- Microsoft Commerce può essere adottato creando un componente aggiuntivo durevole per la licenza completa, ma richiede integrazione tecnica dell'entitlement Store nell'app. La commissione Microsoft indicata per le app è il 15%.
- Strategia consigliata: mantenere per ora PayPal e l'attuale licenza offline; usare campagne esterne tracciate; valutare successivamente Microsoft Commerce come secondo canale, conservando la compatibilità con le licenze già vendute.
