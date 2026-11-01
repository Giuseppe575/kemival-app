'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const { unzipSync } = require('fflate');
const health = require('../src/lib/report-health');
const source = fs.readFileSync(path.resolve(__dirname, '../src/cumulative-report.js'), 'utf8');
function render(rows) {
  const elements = new Map(); let exported;
  const element = () => ({ innerHTML:'', textContent:'', disabled:false, style:{}, addEventListener(_name, callback){this.click=callback;} });
  for (const id of ['report','exportStatus','exportCumulativeWordBtn','printCumulativeBtn']) elements.set(id, element());
  const context = {
    KemivalReportHealth: health, docx: require('docx'), console,
    localStorage:{ getItem:()=>JSON.stringify({rows,timestamp:new Date().toISOString(),version:'1.6.0'}),removeItem(){} },
    document:{ getElementById:id=>elements.get(id), createElement:()=>({style:{},click(){},remove(){}}),body:{appendChild(){}} },
    URL:{createObjectURL(blob){exported=blob;return 'blob:test';},revokeObjectURL(){}},setTimeout(){}
  }; context.window=context;
  vm.runInNewContext(source, context);
  return {elements, async export(){await elements.get('exportCumulativeWordBtn').click();return exported;}};
}
test('CMR e risultati non determinati non diventano rischio irrilevante', () => {
  const review={status:'confirmed'};
  for (const row of [{isCmr:true,Rtot:0,review},{healthAssessmentStatus:'excluded_cmr',Rtot:0,review},{Rtot:null,review},{Rtot:0,review}]) {
    const result=health.classify(row);assert.equal(result.value,null);assert.doesNotMatch(result.label,/Irrilevante/);
  }
  const summary=health.summarize([{isCmr:true,Rtot:0,review},{Rtot:4,review}]);
  assert.equal(summary.maximum,4);assert.match(summary.classification.label,/CMR/);
});
test('la cumulativa HTML e il DOCX conservano il percorso CMR senza un esito favorevole', async () => {
  const app=render([{nome:'Fixture H350',file:'fixture.pdf',hcodes:['H350'],isCmr:true,
    healthAssessmentStatus:'excluded_cmr',Rtot:0,SCORE:0,review:{status:'confirmed'},sdsEvidence:{}}]);
  assert.doesNotMatch(app.elements.get('report').innerHTML,/Irrilevante per la salute/);
  assert.match(app.elements.get('report').innerHTML,/Capo II/);
  const blob=await app.export();assert.ok(blob,'DOCX generato');
  const archive=unzipSync(new Uint8Array(await blob.arrayBuffer()));
  const xml=Buffer.from(archive['word/document.xml']).toString();
  assert.doesNotMatch(xml,/Irrilevante per la salute/);assert.match(xml,/Capo II/);
  assert.match(xml,/w:highlight w:val="yellow"/);
  const styles=Buffer.from(archive['word/styles.xml']).toString();
  assert.match(styles,/Times New Roman/);assert.match(styles,/w:line="360"/);
});
test('un riepilogo non confermato blocca la generazione', () => {
  const app=render([{Rtot:0,review:{status:'pending'}}]);
  assert.equal(app.elements.get('exportCumulativeWordBtn').disabled,true);
});
