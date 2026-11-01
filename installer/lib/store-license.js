'use strict';
const { execFile } = require('node:child_process');
const PRODUCT_ID = '9PGRQHQ6GQKV';
const STORE_URL = `https://apps.microsoft.com/detail/${PRODUCT_ID}`;

function createStoreLicenseService({ isStore, helperPath, getWindowHandle, run = execFile }) {
  let pending = null;
  let licensed = false;
  async function refresh() {
    if (!isStore) return { state: 'not-store', licensed: false };
    if (pending) return pending;
    pending = new Promise(resolve => {
      let handle;
      try {
        const buffer = getWindowHandle();
        handle = buffer.length === 8 ? buffer.readBigUInt64LE().toString() : buffer.readUInt32LE().toString();
      } catch {
        licensed = false;
        resolve({ state: 'unavailable', licensed });
        return;
      }
      run(helperPath, [handle], { windowsHide: true, timeout: 20000, maxBuffer: 16384, encoding: 'utf8' }, (error, stdout) => {
        let result;
        try { result = error ? null : JSON.parse(stdout.replace(/^\uFEFF/, '').trim()); } catch { result = null; }
        licensed = result?.productId === PRODUCT_ID && result.state === 'licensed' && result.isTrial === false;
        const state = licensed ? 'licensed' : result?.state === 'unlicensed' ? 'unlicensed' : 'unavailable';
        resolve({ state, licensed });
      });
    }).finally(() => { pending = null; });
    return pending;
  }
  return Object.freeze({ refresh, isLicensed: () => licensed });
}
module.exports = { createStoreLicenseService, PRODUCT_ID, STORE_URL };
