'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

test('il solo canale di compilazione e pubblicazione è Microsoft Store', () => {
  const packageJson = require('../package.json');
  const storeConfig = require('../electron-builder.store.cjs');

  assert.equal(packageJson.build.directories.output, 'dist-store');
  assert.equal(packageJson.build.win.target[0].target, 'appx');
  assert.equal(packageJson.build.win.verifyUpdateCodeSignature, true);

  assert.equal(storeConfig.directories.output, 'dist-store');
  assert.equal(storeConfig.win.target[0].target, 'appx');
  assert.equal(storeConfig.win.verifyUpdateCodeSignature, false);
  assert.equal(storeConfig.nsis, null);
  assert.equal(storeConfig.publish, null);
});

test('la configurazione Store usa metadati AppX validi per la build di prova', () => {
  const storeConfig = require('../electron-builder.store.cjs');

  assert.equal(storeConfig.appx.applicationId, 'MOVARISCH');
  assert.match(storeConfig.appx.identityName, /^[A-Za-z0-9.-]{3,50}$/);
  assert.deepEqual(storeConfig.appx.languages, ['it-IT', 'en-US']);
  assert.match(storeConfig.appx.artifactName, /^KEMIVAL-Store-/);
});
