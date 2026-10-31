'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createStoreLicenseService, PRODUCT_ID } = require('../lib/store-license');
const handle = Buffer.alloc(8); handle.writeBigUInt64LE(1234n);
function service(response, error = null) {
  return createStoreLicenseService({ isStore: true, helperPath: 'trusted.exe', getWindowHandle: () => handle,
    run(file, args, options, callback) {
      assert.equal(file, 'trusted.exe'); assert.deepEqual(args, ['1234']);
      assert.equal(options.windowsHide, true); assert.equal(options.timeout, 20000);
      callback(error, typeof response === 'string' ? response : JSON.stringify(response));
    }
  });
}
test('il bridge concede solo il diritto completo dello stesso prodotto', async () => {
  const bridge = service({ state: 'licensed', productId: PRODUCT_ID, isTrial: false });
  assert.deepEqual(await bridge.refresh(), { state: 'licensed', licensed: true });
  assert.equal(bridge.isLicensed(), true);
});
test('risposte malformate, prodotto errato, trial e processi falliti restano chiusi', async () => {
  for (const value of ['not-json', {}, { state: 'licensed', productId: 'OTHER', isTrial: false },
    { state: 'licensed', productId: PRODUCT_ID, isTrial: true }, { state: 'licensed', productId: PRODUCT_ID }]) {
    const bridge = service(value); assert.equal((await bridge.refresh()).licensed, false);
  }
  assert.equal((await service('', new Error('timeout')).refresh()).licensed, false);
  const outsideStore = createStoreLicenseService({ isStore: false, run() { throw Error('Must not run'); } });
  assert.equal((await outsideStore.refresh()).licensed, false);
});
test('una verifica fallita non riutilizza un precedente consenso e le richieste sono coalescenti', async () => {
  let calls = 0, done;
  const bridge = createStoreLicenseService({ isStore: true, getWindowHandle: () => handle,
    run(_file, _args, _options, callback) { calls++; done = callback; }
  });
  const first = bridge.refresh(), second = bridge.refresh(); assert.equal(calls, 1);
  done(null, JSON.stringify({ state: 'licensed', productId: PRODUCT_ID, isTrial: false }));
  await Promise.all([first, second]); assert.equal(bridge.isLicensed(), true);
  const third = bridge.refresh(); done(new Error('failed')); await third;
  assert.equal(bridge.isLicensed(), false);
});
