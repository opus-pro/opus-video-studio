import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const rows=fs.readFileSync(path.join(root,'SHA256SUMS.txt'),'utf8').trim().split('\n');
let passed=0;
for(const row of rows){
 const match=/^([a-f0-9]{64})  (.+)$/.exec(row);
 if(!match)throw new Error('Invalid checksum file.');
 const [,expected,relative]=match;
 const target=path.resolve(root,relative);
 if(!target.startsWith(root+path.sep))throw new Error(`Invalid file path: ${relative}`);
 if(fs.lstatSync(target).isSymbolicLink())throw new Error(`Unexpected symlink: ${relative}`);
 const actual=createHash('sha256').update(fs.readFileSync(target)).digest('hex');
 if(actual!==expected)throw new Error(`Checksum differs: ${relative}. If intentionally edited, retain the original package separately.`);
 passed++;
}
console.log(`Verified ${passed} original package files.`);
