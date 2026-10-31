/** KEMIVAL — Microsoft Store entitlement UI. */
(function (window) {
  'use strict';
  const storeUrl = 'https://apps.microsoft.com/detail/9PGRQHQ6GQKV';
  const english = (window.i18n?.getLanguage?.() || window.navigator?.language || 'it').startsWith('en');
  const copy = english ? {
    checking: 'Checking your Microsoft Store entitlement…',
    unlicensed: 'Your entitlement is not active. Open Microsoft Store with the account used for the purchase, then try again.',
    install: 'Install or open KEMIVAL from Microsoft Store. If it is already installed, check your Store account and try again.',
    unavailable: 'Verification is unavailable. Open Microsoft Store and try again.',
    about: 'Purchases and entitlement are managed by Microsoft Store and associated with your Microsoft account.',
    keys: 'No manual activation key is required.', open: 'Open Microsoft Store', check: 'Check purchase',
    support: 'KEMIVAL support', start: 'Open Microsoft Store from the Start menu and search for KEMIVAL.'
  } : {
    checking: 'Verifica del diritto di utilizzo in Microsoft Store…',
    unlicensed: 'Il diritto di utilizzo non risulta attivo. Apri Microsoft Store con l’account usato per l’acquisto, quindi riprova.',
    install: 'Installa o apri KEMIVAL da Microsoft Store. Se è già installato, controlla l’account dello Store e riprova.',
    unavailable: 'Verifica non disponibile. Apri Microsoft Store e riprova.',
    about: 'Acquisto e diritto di utilizzo sono gestiti da Microsoft Store e associati al tuo account Microsoft.',
    keys: 'Non sono richieste chiavi di attivazione manuali.', open: 'Apri Microsoft Store', check: 'Verifica acquisto',
    support: 'Assistenza KEMIVAL', start: 'Apri Microsoft Store dal menu Start e cerca KEMIVAL.'
  };
  let modal, status, retry;
  let checking = false;
  function lock(locked) {
    document.body.classList.toggle('license-locked', locked);
    document.querySelectorAll('body > header, body > main, body > footer').forEach(element => { element.inert = locked; });
    modal.classList.toggle('active', locked);
  }
  async function check() {
    if (checking) return;
    checking = true;
    retry.disabled = true;
    lock(true);
    status.textContent = copy.checking;
    try {
      const result = await window.electronAPI?.getStoreLicense?.();
      if (result?.licensed === true && result.state === 'licensed') {
        lock(false);
        status.textContent = '';
      } else {
        status.textContent = result?.state === 'unlicensed'
          ? copy.unlicensed
          : copy.install;
      }
    } catch {
      status.textContent = copy.unavailable;
    } finally {
      checking = false;
      retry.disabled = false;
    }
  }
  function init() {
    if (modal) return;
    document.body.insertAdjacentHTML('beforeend', `
      <div id="licenseModal" role="dialog" aria-modal="true" aria-labelledby="licenseTitle">
        <div class="license-container">
          <h1 id="licenseTitle">KEMIVAL · Microsoft Store</h1>
          <p>${copy.about}</p>
          <p>${copy.keys}</p>
          <div class="license-actions">
            <a class="btn-purchase" id="purchaseLink" href="https://apps.microsoft.com/detail/9PGRQHQ6GQKV" target="_blank" rel="noopener">${copy.open}</a>
            <button class="btn-activate" id="checkStoreLicense" type="button">${copy.check}</button>
          </div>
          <p id="licenseStatus" role="status" aria-live="polite"></p>
          <p><a href="mailto:atis.giuseppe@gmail.com">${copy.support}</a></p>
        </div>
      </div>`);
    modal = document.getElementById('licenseModal');
    status = document.getElementById('licenseStatus');
    retry = document.getElementById('checkStoreLicense');
    retry.addEventListener('click', check);
    document.getElementById('purchaseLink').addEventListener('click', event => {
      if (window.electronAPI?.openStore) {
        event.preventDefault();
        window.electronAPI.openStore().catch(() => { status.textContent = copy.start; });
      }
    });
    check();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
