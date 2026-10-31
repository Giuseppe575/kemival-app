'use strict';
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
fs.mkdirSync(path.join(root, 'sbom'), { recursive: true });
for (const [name, cwd, omit] of [['application', root, ['--omit=dev', '--omit=optional']], ['build-tools', path.join(root, 'installer'), []]]) {
  const result = spawnSync(process.execPath, [process.env.npm_execpath || require.resolve('npm/bin/npm-cli.js'), 'sbom', '--sbom-format=cyclonedx', '--package-lock-only', ...omit],
    { cwd, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  if (result.status !== 0) throw Error(result.stderr || 'SBOM generation failed');
  const sbom = JSON.parse(result.stdout);
  fs.writeFileSync(path.join(root, 'sbom', `${name}.cdx.json`), JSON.stringify(sbom, null, 2) + '\n');
  console.log(`${name}: ${sbom.components?.length || 0} componenti`);
}
