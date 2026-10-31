'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
test('il prodotto usa soltanto il commercio Microsoft Store',()=>{
 const source=['src/license-activation.js','docs/index.html','docs/acquista.html','docs/termini.html','docs/eula.html','docs/privacy.html'].map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
 assert.doesNotMatch(source,/paypal|stripe|MOVA-XXXX|24h|1 PC/i);
 assert.match(source,/https:\/\/apps\.microsoft\.com\/detail\/9PGRQHQ6GQKV/);
 assert.doesNotMatch(fs.readFileSync(path.join(root,'index.html'),'utf8'),/license-validator|storage-manager/);
});
