'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('la schermata di attivazione usa la pagina ufficiale di acquisto', () => {
  const activation = read('src/license-activation.js');

  assert.match(activation, /https:\/\/giuseppe575\.github\.io\/kemival\/acquista\.html/);
  assert.doesNotMatch(activation, /tuosito\.com/);
  assert.match(activation, /€105, comprensivi di oneri fiscali/);
  assert.match(activation, /inviate via email entro 24 ore/);
});

test('prezzo e condizioni commerciali sono coerenti nei documenti', () => {
  const commercialDocuments = [
    read('docs/index.html'),
    read('docs/acquista.html'),
    read('docs/termini.html'),
    read('docs/eula.html')
  ].join('\n');

  assert.doesNotMatch(commercialDocuments, /€100|IVA esclusa|IVA inclusa/);
  assert.match(commercialDocuments, /€105/);
  assert.match(commercialDocuments, /oneri fiscali/i);
  assert.match(commercialDocuments, /Fattura elettronica/i);
  assert.match(commercialDocuments, /24 ore|24h/i);
});
