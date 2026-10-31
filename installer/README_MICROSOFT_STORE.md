# Compilazione Microsoft Store

Unico canale previsto: Microsoft Store. Identità esistente in `store-identity.json`; `applicationId` e cartella dati storici sono conservati.

## Requisiti

Windows x64, Node 22, Windows 10/11 SDK con UnionMetadata e strumenti AppX, .NET Framework 4.8 e relativi reference assemblies. La versione minima di destinazione è Windows 10 2004 (19041).

Dalla radice:

```powershell
npm ci
npm test
cd installer
npm ci
npm test
npm run test:runtime
npm run release:build
```

Output: `dist-store/KEMIVAL-Store-1.6.0-x64.appx`. La build genera il bridge nativo, le risorse grafiche, il bundle Excel, gli avvisi di licenza e due SBOM. Il gate verifica identità, versione, helper nativo e codice di avvio nel pacchetto.

Il candidato non è firmato per installazione pubblica diretta: la firma attendibile è applicata dal Microsoft Store dopo la certificazione. Non viene pubblicato un installer EXE né un feed GitHub di aggiornamento. I workflow GitHub caricano soltanto artefatti candidati.

## Collaudo e pubblicazione

Usare una distribuzione privata di Partner Center per verificare il diritto reale del prodotto, gli account, la reinstallazione e l’uso offline. Per provare una nuova acquisizione a pagamento occorre il prezzo corretto nello Store. Il sito pubblico deve essere aggiornato contestualmente alla transizione; le nuove pagine sono mantenute sia in `docs/` sia nel repository separato `kemival`.

Le vecchie acquisizioni gratuite possono conservare il diritto al prodotto: controllare questo comportamento prima della transizione commerciale. La versione non implementa un componente aggiuntivo a pagamento separato.
