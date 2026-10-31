'use strict';

const { spawnSync } = require('node:child_process');

const result = spawnSync(
  process.execPath,
  [require.resolve('electron-builder/cli.js'), '--config', 'electron-builder.store.cjs', '--win', 'appx', '--x64', '--publish', 'never'],
  { cwd: require('node:path').resolve(__dirname, '..'), stdio: 'inherit', windowsHide: true }
);

if (result.error) {
  console.error(`Impossibile avviare electron-builder: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
