'use strict';

// Configurazione separata per Microsoft Store.
// Importa la configurazione NSIS esistente senza modificarla e sostituisce
// soltanto target, output e metadati specifici AppX/MSIX.
const packageJson = require('./package.json');

const base = packageJson.build;

module.exports = {
  ...base,
  directories: {
    ...base.directories,
    output: 'dist-store'
  },
  win: {
    ...base.win,
    target: [
      {
        target: 'appx',
        arch: ['x64']
      }
    ],
    // La firma attendibile viene applicata da Microsoft dopo la certificazione.
    verifyUpdateCodeSignature: false
  },
  nsis: null,
  publish: null,
  appx: {
    applicationId: 'MOVARISCH',
    identityName: process.env.MOVARISCH_STORE_IDENTITY_NAME || 'MOVARISCH.Test',
    publisher: process.env.MOVARISCH_STORE_PUBLISHER || 'CN=MOVARISCH Test',
    publisherDisplayName: process.env.MOVARISCH_STORE_PUBLISHER_DISPLAY_NAME || 'KEMIVAL',
    displayName: 'KEMIVAL',
    backgroundColor: '#0b1220',
    languages: ['it-IT', 'en-US'],
    minVersion: '10.0.17763.0',
    maxVersionTested: '10.0.26100.0',
    artifactName: 'KEMIVAL-Store-${version}-${arch}.${ext}'
  }
};
