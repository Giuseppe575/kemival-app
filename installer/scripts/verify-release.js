'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const installer = path.join(root, 'installer');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const app = read(path.join(root, 'package.json'));
const pkg = read(path.join(installer, 'package.json'));
const identity = read(path.join(installer, 'store-identity.json'));
const config = require('../electron-builder.store.cjs');
for (const directory of [root, installer]) {
  const lock = read(path.join(directory, 'package-lock.json'));
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[''].version, pkg.version);
}
assert.equal(app.version, pkg.version);
assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
assert.equal(pkg.build.publish, null);
assert.equal(config.publish, null);
assert.equal(config.win.target[0].target, 'appx');
assert.equal(config.appx.identityName, identity.identityName);
assert.equal(config.appx.publisher, identity.publisher);
assert.equal(identity.storeId, '9PGRQHQ6GQKV');
assert.equal(pkg.build.electronFuses.runAsNode, false);
assert.equal(pkg.build.electronFuses.enableNodeOptionsEnvironmentVariable, false);
assert.equal(pkg.build.electronFuses.enableNodeCliInspectArguments, false);
assert.equal(pkg.build.electronFuses.onlyLoadAppFromAsar, true);
assert.equal(pkg.dependencies?.['electron-updater'], undefined);
assert.equal(app.dependencies.xlsx, undefined);
assert.equal(pkg.devDependencies.electron, '43.8.6');
if (process.argv.includes('--artifacts')) {
  const file = path.join(installer, 'dist-store', `KEMIVAL-Store-${pkg.version}-x64.appx`);
  const { unzipSync } = require(path.join(root, 'node_modules/fflate'));
  const sourceFiles = ['index.html', 'app.js', 'src/license-activation.js', 'src/cumulative-report.js',
    'src/lib/excel.bundle.js', 'src/lib/pdf-document-reader.js', 'src/electron-security-policy.js',
    'docs/privacy.html', 'docs/eula.html', 'docs/termini.html', 'docs/css/store.css', 'src/cumulative-report.css', 'src/license-activation.css', 'THIRD_PARTY_NOTICES.txt'];
  const selected = unzipSync(fs.readFileSync(file), { filter: entry =>
    entry.name === 'AppxManifest.xml' || entry.name.endsWith('resources/app.asar') ||
    entry.name.endsWith('resources/store-bridge/Kemival.StoreLicense.exe') ||
    sourceFiles.some(source => entry.name.endsWith(`resources/app/${source}`))
  });
  const manifest = Buffer.from(selected['AppxManifest.xml'] || []).toString();
  assert.ok(manifest.includes(identity.identityName));
  assert.ok(manifest.includes(identity.publisher));
  assert.ok(manifest.includes(`Version="${pkg.version}.0"`));
  assert.ok(Object.keys(selected).some(name => name.endsWith('resources/store-bridge/Kemival.StoreLicense.exe')));
  assert.ok(Object.keys(selected).some(name => name.endsWith('resources/app.asar')));
  const html = Object.entries(selected).find(([name]) => name.endsWith('resources/app/index.html'));
  assert.ok(html);
  assert.match(Buffer.from(html[1]).toString(), /src\/license-activation\.js/);
  for (const source of sourceFiles) {
    const packed = Object.entries(selected).find(([name]) => name.endsWith(`resources/app/${source}`));
    assert.ok(packed, `File assente: ${source}`);
    assert.ok(Buffer.from(packed[1]).equals(fs.readFileSync(path.join(root, source))), `File non aggiornato nel pacchetto: ${source}`);
  }
  const asarPath = path.join(installer, 'dist-store/win-unpacked/resources/app.asar');
  const asar = require('@electron/asar');
  for (const source of ['main.js', 'preload.js', 'lib/store-license.js', 'lib/trusted-renderer.js']) {
    assert.ok(asar.extractFile(asarPath, source).equals(fs.readFileSync(path.join(installer, source))), `Codice desktop non aggiornato: ${source}`);
  }
  const packedAsar = Object.entries(selected).find(([name]) => name.endsWith('resources/app.asar'));
  assert.ok(Buffer.from(packedAsar[1]).equals(fs.readFileSync(asarPath)));
  const packedHelper = Object.entries(selected).find(([name]) => name.endsWith('resources/store-bridge/Kemival.StoreLicense.exe'));
  assert.ok(Buffer.from(packedHelper[1]).equals(fs.readFileSync(path.join(installer, 'store-bridge/bin/Kemival.StoreLicense.exe'))));
  import('@electron/fuses').then(async ({getCurrentFuseWire, FuseV1Options, FuseState}) => {
    const wire = await getCurrentFuseWire(path.join(installer, 'dist-store/win-unpacked/KEMIVAL.exe'));
    for (const option of ['RunAsNode', 'EnableNodeOptionsEnvironmentVariable', 'EnableNodeCliInspectArguments']) {
      assert.equal(wire[FuseV1Options[option]], FuseState.DISABLE, `Fuse ${option}`);
    }
    for (const option of ['OnlyLoadAppFromAsar', 'EnableEmbeddedAsarIntegrityValidation']) {
      assert.equal(wire[FuseV1Options[option]], FuseState.ENABLE, `Fuse ${option}`);
    }
    console.log('Fuse del runtime verificati.');
  }).catch(error => { console.error(error); process.exitCode = 1; });
  console.log(`Artefatto verificato: ${file}`);
}
console.log(`Gate Microsoft Store superato per KEMIVAL ${pkg.version}.`);
