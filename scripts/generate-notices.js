'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
const sections = ['KEMIVAL — Third-party software notices\n\nElectron and Chromium notices are supplied separately with the Microsoft Store package.'];
const seen = new Set();
for (const [relative, entry] of Object.entries(lock.packages)) {
  if (!relative || entry.dev || entry.optional) continue;
  const folder = path.join(root, relative);
  if (!fs.existsSync(path.join(folder, 'package.json')) && entry.optional) continue;
  const pkg = JSON.parse(fs.readFileSync(path.join(folder, 'package.json'), 'utf8'));
  const id = `${pkg.name}@${pkg.version}`;
  if (seen.has(id)) continue;
  seen.add(id);
  const licenses = fs.readdirSync(folder).filter(name => /^(licen[sc]e|notice)([._-]|$)/i.test(name) && fs.statSync(path.join(folder, name)).isFile());
  const originalDocuments = licenses.length ? licenses : fs.readdirSync(folder).filter(name => /^readme(\.|$)/i.test(name));
  if (!originalDocuments.length) throw new Error(`License notice missing: ${id}`);
  sections.push(`${id}\nLicense: ${pkg.license || entry.license || ''}\n${originalDocuments.map(name => fs.readFileSync(path.join(folder, name), 'utf8')).join('\n')}`);
}
fs.writeFileSync(path.join(root, 'THIRD_PARTY_NOTICES.txt'), sections.join('\n\n' + '='.repeat(72) + '\n\n') + '\n');
console.log(`Licenze di ${seen.size} componenti incluse.`);
