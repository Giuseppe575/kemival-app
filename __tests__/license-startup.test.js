'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.resolve(__dirname, '../src/license-activation.js'),'utf8');
function boot(getStoreLicense) {
  const elements = new Map();
  function element() {
    const classes = new Set(); const events = new Map();
    return { inert:true, disabled:false, textContent:'',
      classList:{ toggle(name,value){value?classes.add(name):classes.delete(name);}, contains:name=>classes.has(name) },
      addEventListener(name,fn){events.set(name,fn);}, fire(name,event={}){return events.get(name)?.(event);}
    };
  }
  const regions=[element(),element(),element()]; const body=element();
  body.insertAdjacentHTML=(_position,markup)=>{for(const m of markup.matchAll(/id="([^"]+)"/g))elements.set(m[1],element());};
  const window={electronAPI:getStoreLicense?{getStoreLicense}:undefined};
  const document={readyState:'complete',body,getElementById:id=>elements.get(id),querySelectorAll:()=>regions};
  vm.runInNewContext(source,{window,document});
  return {window,elements,regions,body,settle:()=>new Promise(setImmediate)};
}
function locked(app,value){
  assert.equal(app.body.classList.contains('license-locked'),value);
  assert.ok(app.regions.every(r=>r.inert===value));
  assert.equal(app.elements.get('licenseModal').classList.contains('active'),value);
}
test('avvio: nessun bridge o errore Store non concede accesso',async()=>{
  for(const get of [undefined,async()=>{throw Error('offline without cache');},async()=>({state:'unlicensed',licensed:false})]){
    const app=boot(get);await app.settle();locked(app,true);
  }
});
test('il controllo resta chiuso durante la risposta e richiede entrambi i segnali Store',async()=>{
  let finish;const app=boot(()=>new Promise(resolve=>{finish=resolve;}));
  locked(app,true);assert.equal(app.elements.get('checkStoreLicense').disabled,true);
  finish({state:'licensed',licensed:true});await app.settle();locked(app,false);
});
test('il pulsante verifica permette il recupero senza conservare flag locali',async()=>{
  let entitlement={state:'unlicensed',licensed:false};const app=boot(async()=>entitlement);
  await app.settle();locked(app,true);
  entitlement={state:'licensed',licensed:true};await app.elements.get('checkStoreLicense').fire('click');locked(app,false);
  entitlement={state:'unlicensed',licensed:true};await app.elements.get('checkStoreLicense').fire('click');locked(app,true);
});
