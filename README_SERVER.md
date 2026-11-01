# Anteprima locale

Il browser può mostrare le pagine informative del sito. Per un’anteprima locale, dalla radice eseguire:

```powershell
python -m http.server 8080 --bind 127.0.0.1 --directory site
```

Aprire `http://127.0.0.1:8080`. La landing pubblica è mantenuta nel repository `Giuseppe575/kemival`; `docs/` contiene le stesse pagine informative.

L’applicazione desktop richiede il diritto Microsoft Store. L’apertura di `index.html` nel browser non concede una licenza. Per lo sviluppo del desktop seguire `installer/README_MICROSOFT_STORE.md`.
