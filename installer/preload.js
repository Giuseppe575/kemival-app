/**
 * KEMIVAL - Preload Script
 *
 * Questo script viene eseguito prima del caricamento della pagina web.
 * Fornisce un bridge sicuro tra il processo principale e il renderer.
 *
 * IMPORTANTE: Questo script gira in un contesto isolato per sicurezza.
 * Non espone direttamente Node.js o Electron al renderer.
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Espone API sicure al renderer process
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // Informazioni sull'app
  platform: process.platform,
  version: process.argv.find(value => value.startsWith('--kemival-version='))?.split('=')[1] || '',

  // Flag per indicare che siamo in Electron
  isElectron: true,

  getStoreLicense: () => ipcRenderer.invoke('kemival:store-license'),
  openStore: () => ipcRenderer.invoke('kemival:open-store')
});

/**
 * Inietta informazioni di runtime
 */
window.addEventListener('DOMContentLoaded', () => {
  // Aggiungi classe al body per CSS specifici di Electron
  document.body.classList.add('electron-app');

});
