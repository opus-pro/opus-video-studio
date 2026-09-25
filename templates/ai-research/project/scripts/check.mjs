import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = new Set(['fonts/Geist-OFL.txt']);
for (const file of fs.readdirSync(path.join(root, 'src'))) {
  const text = fs.readFileSync(path.join(root, 'src', file), 'utf8');
  for (const match of text.matchAll(/staticFile\(['"]([^'"]+)['"]\)/g)) assets.add(match[1]);
}
const audio = JSON.parse(fs.readFileSync(path.join(root, 'config/audio.json'), 'utf8'));
if (audio.enabled) assets.add(audio.master);
for (const asset of assets) {
  const target = path.resolve(root, 'public', asset);
  if (!target.startsWith(path.join(root, 'public') + path.sep) || !fs.existsSync(target))
    throw new Error('Missing or nonportable asset: ' + asset);
}
console.log('All ' + assets.size + ' local assets available.');
