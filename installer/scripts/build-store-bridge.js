'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
if (process.platform !== 'win32') throw new Error('La compilazione del bridge Store richiede Windows.');
const framework = path.join(process.env.WINDIR || 'C:\\Windows', 'Microsoft.NET/Framework64/v4.0.30319');
const kitRoot = path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Windows Kits/10/UnionMetadata');
const versions = fs.readdirSync(kitRoot).filter(name => /^10\.0\.\d+\.0$/.test(name))
  .sort((a, b) => Number(b.split('.')[2]) - Number(a.split('.')[2]));
const metadata = versions.map(version => path.join(kitRoot, version, 'Windows.winmd')).find(file => fs.existsSync(file));
if (!metadata) throw new Error('Windows SDK: Windows.winmd non disponibile.');
const output = path.join(root, 'store-bridge/bin');
fs.mkdirSync(output, { recursive: true });
const referenceRoot = path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)',
  'Reference Assemblies/Microsoft/Framework/.NETFramework/v4.8');
const refs = ['System.Runtime.dll', 'System.Runtime.InteropServices.WindowsRuntime.dll', 'System.Threading.Tasks.dll']
  .map(name => path.join(referenceRoot, 'Facades', name));
refs.push(path.join(framework, 'System.Runtime.WindowsRuntime.dll'), 'System.Web.Extensions.dll', metadata);
const result = spawnSync(path.join(framework, 'csc.exe'), [
  '/nologo', '/target:exe', '/platform:x64', '/optimize+', '/utf8output',
  `/out:${path.join(output, 'Kemival.StoreLicense.exe')}`,
  ...refs.map(file => `/reference:${file}`), path.join(root, 'store-bridge/StoreLicense.cs')
], { stdio: 'inherit', windowsHide: true });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
