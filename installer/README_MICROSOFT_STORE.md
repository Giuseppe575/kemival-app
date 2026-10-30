# KEMIVAL - pacchetto Microsoft Store

Questa build e separata dall'installer Windows tradizionale.

- `npm run build` continua a creare l'installer NSIS in `dist/`.
- `npm run build:store:test` crea un AppX non firmato con identita di prova in `dist-store/`.
- `npm run build:store` crea il pacchetto da inviare a Partner Center, usando l'identita ufficiale riservata nello Store.

Entrambe le build Store generano automaticamente in `build/appx/` le icone richieste, partendo dal logo KEMIVAL esistente. Queste risorse sono usate soltanto dal pacchetto Store.

La configurazione NSIS esistente rimane nel `package.json`. La configurazione Store e contenuta in `electron-builder.store.cjs` e usa una cartella di output diversa, quindi una build Store non sovrascrive l'installer EXE.

## Prima build locale

Dalla cartella `installer`:

```powershell
npm run build:store:test
```

Il pacchetto risultante non e destinato alla pubblicazione e non puo essere installato normalmente finche non viene firmato. Serve per verificare che la conversione AppX/MSIX venga completata.

## Build da inviare allo Store

1. Creare l'account da `https://storedeveloper.microsoft.com/`.
2. Riservare il nome KEMIVAL in Partner Center.
3. Aprire in Partner Center la pagina dell'identita del prodotto e copiare esattamente:
   - Package/Identity/Name;
   - Package/Identity/Publisher;
   - Publisher display name.
4. Nella stessa sessione PowerShell impostare i valori e avviare la build:

```powershell
$env:KEMIVAL_STORE_IDENTITY_NAME = 'valore Package/Identity/Name'
$env:KEMIVAL_STORE_PUBLISHER = 'valore Package/Identity/Publisher'
$env:KEMIVAL_STORE_PUBLISHER_DISPLAY_NAME = 'nome editore mostrato nello Store'
npm run build:store
```

Il comando rifiuta di creare il pacchetto di pubblicazione se uno dei tre valori manca. Non inserire questi valori direttamente nel codice: in questo modo la configurazione locale rimane riutilizzabile e non rischia di essere inviata con dati provvisori.

## Aggiornamenti e ritorno all'installer precedente

Nel pacchetto Store, KEMIVAL riconosce `process.windowsStore` e lascia gli aggiornamenti a Microsoft Store. Nell'installer NSIS, `electron-updater` continua a funzionare come prima tramite GitHub Releases.

Per tornare o continuare a usare l'installer tradizionale basta eseguire:

```powershell
npm run build
```

I due percorsi restano quindi disponibili in parallelo:

- `dist/KEMIVAL-Setup-<versione>.exe`: installer tradizionale;
- `dist-store/KEMIVAL-Store-<versione>-x64.appx`: pacchetto Microsoft Store.
