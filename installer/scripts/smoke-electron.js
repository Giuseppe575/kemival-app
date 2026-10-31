'use strict';
// Runs the real renderer/preload in hidden windows. No production bypass or Store credentials.
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const assert = require('node:assert/strict');
const { isTrustedMainFrame } = require('../lib/trusted-renderer');
const { createStoreLicenseService } = require('../lib/store-license');
const root = path.resolve(__dirname, '../..');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'kemival-smoke-'));
app.setPath('userData', profile);
const deadline = setTimeout(() => { console.error('Smoke test timed out'); app.exit(1); }, 30000);
function fixturePdf() {
  const stream = 'BT /F1 12 Tf 20 100 Td (SDS FIXTURE H350) Tj ET';
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 150] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index+1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(offset=>String(offset).padStart(10,'0')+' 00000 n ').join('\n')}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf).toString('base64');
}
app.whenReady().then(async () => {
  const errors = [];
  const preferences = { preload: path.resolve(__dirname, '../preload.js'), sandbox: true,
    nodeIntegration: false, contextIsolation: true, additionalArguments: ['--kemival-version=1.6.0'] };
  const main = new BrowserWindow({ show: false, webPreferences: preferences });
  main.webContents.on('preload-error', (_event, file, error) => errors.push(`${file}: ${error.message}`));
  main.webContents.on('console-message', (_event, details) => { if (details.level === 'error') errors.push(details.message); });
  const licensing = createStoreLicenseService({ isStore: false });
  ipcMain.handle('kemival:store-license', event => {
    if (!isTrustedMainFrame(event, main, root)) throw Error('Denied untrusted renderer');
    return licensing.refresh();
  });
  await main.loadFile(path.join(root, 'index.html'));
  const state = await main.webContents.executeJavaScript(`(async () => ({
    version: window.electronAPI?.version,
    node: typeof require,
    bridgeFrozen: Object.isFrozen(window.electronAPI),
    license: await window.electronAPI.getStoreLicense(),
    locked: document.body.classList.contains('license-locked'),
    inert: document.querySelector('main').inert,
    excel: typeof window.KemivalExcel?.toBlob,
    pdf: typeof window.KemivalPdfReader?.read
  }))()`);
  assert.equal(state.version, '1.6.0');
  assert.equal(state.node, 'undefined');
  assert.equal(state.bridgeFrozen, true);
  assert.deepEqual(state.license, { state: 'not-store', licensed: false });
  assert.equal(state.locked, true); assert.equal(state.inert, true);
  assert.equal(state.excel, 'function');
  assert.equal(state.pdf, 'function');
  const extracted = await main.webContents.executeJavaScript(`(async () => {
    const bytes = Uint8Array.from(atob(${JSON.stringify(fixturePdf())}), c => c.charCodeAt(0));
    const file = new File([bytes], 'synthetic-sds.pdf', {type:'application/pdf'});
    const document = await window.KemivalPdfReader.read(file, {pdfjs:window.pdfjsLib,
      readFile:file=>file.arrayBuffer(), layoutPages:window.SdsTextLayout.layoutPages});
    return document.text;
  })()`);
  assert.match(extracted, /SDS FIXTURE H350/);
  const child = new BrowserWindow({ show: false, webPreferences: preferences });
  await child.loadFile(path.join(root, 'docs/privacy.html'));
  const denied = await child.webContents.executeJavaScript(`window.electronAPI.getStoreLicense().then(() => false, () => true)`);
  assert.equal(denied, true);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ ...state, realPdfWorker: true, untrustedRendererDenied: denied, errors }));
  child.destroy(); main.destroy(); clearTimeout(deadline); app.quit();
}).catch(error => { console.error(error); clearTimeout(deadline); app.exit(1); });
app.on('quit', () => { fs.rmSync(profile, { recursive: true, force: true }); });
