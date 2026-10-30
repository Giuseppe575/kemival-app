'use strict';

const { spawnSync } = require('node:child_process');

const requiredVariables = [
  'MOVARISCH_STORE_IDENTITY_NAME',
  'MOVARISCH_STORE_PUBLISHER',
  'MOVARISCH_STORE_PUBLISHER_DISPLAY_NAME'
];

const missingVariables = requiredVariables.filter((name) => !process.env[name]?.trim());

if (missingVariables.length > 0) {
  console.error('Build Microsoft Store interrotta: mancano i dati assegnati da Partner Center.');
  console.error(`Variabili mancanti: ${missingVariables.join(', ')}`);
  console.error('Per una build locale con identita di prova usa: npm run build:store:test');
  process.exit(1);
}

const builder = process.platform === 'win32' ? 'electron-builder.cmd' : 'electron-builder';
const result = spawnSync(
  builder,
  ['--config', 'electron-builder.store.cjs', '--win', 'appx', '--x64', '--publish', 'never'],
  { cwd: process.cwd(), stdio: 'inherit', shell: process.platform === 'win32' }
);

if (result.error) {
  console.error(`Impossibile avviare electron-builder: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
