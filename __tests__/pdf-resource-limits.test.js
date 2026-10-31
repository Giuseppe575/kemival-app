'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const reader=require('../src/lib/pdf-document-reader');
function setup(pages=1) {
  let destroyed=0,cleaned=0,read=0;
  return {get destroyed(){return destroyed;},get cleaned(){return cleaned;},get read(){return read;},
    options:{readFile:async()=>{read++;return new Uint8Array([1]);},layoutPages:pages=>pages.map(p=>({text:`page ${p.pageNumber}`})),
      pdfjs:{getDocument(options){assert.equal(options.isEvalSupported,false);return {promise:Promise.resolve({numPages:pages,getPage:async()=>({getTextContent:async()=>({items:[]}),getViewport:()=>({width:10,height:10}),cleanup(){cleaned++;}})}),async destroy(){destroyed++;}};}}}
  };
}
test('limiti di byte e pagine impediscono importazioni fuori budget e liberano il worker',async()=>{
 const probe=setup();await assert.rejects(reader.read({size:reader.MAX_BYTES+1},probe.options),/25 MB/);assert.equal(probe.read,0);
 const huge=setup(201);await assert.rejects(reader.read({size:1},huge.options),/200 pagine/);assert.equal(huge.destroyed,1);
 const valid=setup(2);assert.equal((await reader.read({size:1},valid.options)).text,'page 1\n\f\npage 2');
 assert.equal(valid.destroyed,1);assert.equal(valid.cleaned,2);
});
test('timeout e annullamento non lasciano in vita il worker',async()=>{
 let destroyed=0;const options={readFile:async()=>new Uint8Array([1]),layoutPages:()=>[],timeoutMs:10,
  pdfjs:{getDocument:()=>({promise:new Promise(()=>{}),async destroy(){destroyed++;}})}};
 await assert.rejects(reader.read({size:1},options),/Tempo massimo/);assert.equal(destroyed,1);
 const controller=new AbortController();const pending=reader.read({size:1},{...options,timeoutMs:1000,signal:controller.signal});
 await new Promise(setImmediate);controller.abort();await assert.rejects(pending,/annullata/);assert.equal(destroyed,2);
});
