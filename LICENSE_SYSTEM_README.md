# Licenza KEMIVAL — Microsoft Store

La versione 1.6.0 usa il diritto dell’app completa nello Store, prodotto `9PGRQHQ6GQKV`. Non sono previsti un checkout web, chiavi manuali o un server di attivazione KEMIVAL.

## Verifica

`src/license-activation.js` mantiene l’interfaccia bloccata durante la verifica. Il preload isolato espone soltanto le operazioni Store previste. Il processo principale accetta richieste dalla finestra principale e dal suo frame principale, poi avvia il bridge nativo con percorso fisso e limite temporale.

`installer/store-bridge/StoreLicense.cs` controlla l’identità del pacchetto e interroga `Windows.Services.Store.StoreContext.GetAppLicenseAsync`. Concede il diritto solo se il prodotto corrisponde, la licenza è attiva e non è una prova. Il riconoscimento di un pacchetto Store, da solo, non concede accesso. La cache offline è gestita da Windows; l’app non salva flag di sblocco nel browser.

## Transizione

Il prezzo dell’app deve essere configurato in Partner Center e pubblicato insieme al pacchetto verificato. Le installazioni gratuite pregresse non dimostrano un acquisto: il passaggio a pagamento non genera incassi retroattivi e il diritto degli utenti esistenti deve essere verificato nel test Store. La cartella dati storica `MOVARISCH` resta invariata.

## Prove necessarie prima della pubblicazione

Oltre ai test automatici e al pacchetto AppX, verificare una distribuzione privata associata al prodotto: avvio con diritto valido, account senza diritto, ripristino/reinstallazione, avvio offline con cache Windows e comportamento dopo revoca. Il test locale fuori Store verifica il rifiuto dell’accesso, non l’acquisto reale.

Riferimento: https://learn.microsoft.com/en-us/uwp/api/windows.services.store.storecontext.getapplicenseasync
