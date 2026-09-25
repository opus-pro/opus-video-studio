import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const manifest = JSON.parse(readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));
for (const file of manifest.files) {
  const bytes = readFileSync(new URL('../' + file.path, import.meta.url));
  if (createHash('sha256').update(bytes).digest('hex') !== file.sha256) throw new Error('Checksum mismatch: ' + file.path);
}
console.log('Published package verified. Run this before editing; use npm run check after edits.');
