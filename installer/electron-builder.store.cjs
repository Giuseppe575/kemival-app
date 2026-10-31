'use strict';

// Unico canale di distribuzione: Microsoft Store, identità del prodotto esistente.
const packageJson = require('./package.json');

const base = packageJson.build;
const identity = require('./store-identity.json');

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
    identityName: process.env.MOVARISCH_STORE_IDENTITY_NAME || identity.identityName,
    publisher: process.env.MOVARISCH_STORE_PUBLISHER || identity.publisher,
    publisherDisplayName: process.env.MOVARISCH_STORE_PUBLISHER_DISPLAY_NAME || identity.publisherDisplayName,
    displayName: 'KEMIVAL',
    backgroundColor: '#0b1220',
    languages: ['it-IT', 'en-US'],
    minVersion: '10.0.19041.0',
    maxVersionTested: '10.0.26100.0',
    artifactName: 'KEMIVAL-Store-${version}-${arch}.${ext}'
  }
};
