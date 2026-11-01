'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { unzipSync } = require('fflate');

test('il bundle Excel esporta numeri, Unicode e testo simile a formule senza eseguirlo', async () => {
  const window = {};
  vm.runInNewContext(fs.readFileSync(require.resolve('../src/lib/excel.bundle.js'), 'utf8'), {
    window, Blob, TextEncoder, TextDecoder, Uint8Array, ArrayBuffer, Date, setTimeout, clearTimeout
  });
  const blob = await window.KemivalExcel.toBlob([
    { Prodotto: 'Ètanolo à', Rtot: 4.25, Nota: '=HYPERLINK("https://example.invalid")' },
    { Prodotto: '+123', Rtot: null, Nota: '@SUM(1,2)' }
  ]);
  const zip = unzipSync(new Uint8Array(await blob.arrayBuffer()));
  const sheet = Buffer.from(zip['xl/worksheets/sheet1.xml']).toString();
  const strings = Object.entries(zip).filter(([key]) => /sharedStrings|sheet1/.test(key)).map(([,data]) => Buffer.from(data).toString()).join('');
  assert.match(sheet, /<v>4\.25<\/v>/);
  assert.match(strings, /Ètanolo à/);
  assert.match(strings, /HYPERLINK/);
  assert.match(strings, /@SUM/);
  assert.doesNotMatch(sheet, /<f[ >]/);
  assert.ok(zip['[Content_Types].xml']);
});
