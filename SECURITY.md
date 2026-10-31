# Politica di sicurezza KEMIVAL

## Distribuzione

La versione 1.6.0 è destinata a Microsoft Store. Installazione e aggiornamenti passano dallo Store. I candidati AppX locali o prodotti dalla CI non sono release pubbliche: devono superare il collaudo associato al prodotto e la certificazione Microsoft, che applica la firma della distribuzione Store.

L’aggiornamento va mantenuto attivo nello Store. Il periodo di supporto dichiarato al cliente deve essere coerente con le condizioni del prodotto e gli obblighi applicabili; questa pagina non determina un periodo contrattuale.

## Segnalazione riservata

Segnalare vulnerabilità a **atis.giuseppe@gmail.com**, indicando versione, Windows, impatto e riproduzione minima. Non inserire SDS, report o dati di clienti in issue pubbliche. La ricezione viene normalmente confermata entro 5 giorni lavorativi, come obiettivo operativo. Dopo la verifica vengono comunicati severità e correzione coordinata.

## Controlli

Sandbox e isolamento dei contesti attivi, Node non esposto al renderer, permessi negati per impostazione predefinita, navigazione limitata e IPC verificato per finestra/frame. Il pacchetto disabilita RunAsNode, NODE_OPTIONS e ispezione CLI e abilita l’integrità ASAR. I PDF hanno limiti di dimensione, pagine e tempo e possono essere annullati.

Le dipendenze applicative e gli strumenti di compilazione hanno inventari separati in `sbom/`. `THIRD_PARTY_NOTICES.txt` contiene le licenze delle librerie applicative. Electron include ulteriori avvisi propri nella distribuzione.
