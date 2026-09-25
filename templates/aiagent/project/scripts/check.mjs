import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
if(Number(process.versions.node.split('.')[0])<22)throw new Error('Node.js 22 or newer is required.');
const required=['src/index.tsx','src/config.ts','public/reference-audio.m4a','public/images/meadow-input.png','public/images/meadow-outro.png','public/fonts/GeistVF.woff2','public/fonts/Geist-OFL.txt'];
for(const file of required)if(!fs.existsSync(path.join(root,file)))throw new Error(`Missing asset: ${file}`);
for(const name of ['remotion','@remotion/cli','@remotion/renderer','@remotion/bundler']){
 const version=JSON.parse(fs.readFileSync(path.join(root,'node_modules',name,'package.json'),'utf8')).version;
 if(version!=='4.0.332')throw new Error(`${name} must be 4.0.332; run npm ci.`);
}
const check=spawnSync(process.execPath,[path.join(root,'node_modules/typescript/bin/tsc'),'--noEmit'],{cwd:root,stdio:'inherit'});
if(check.status!==0)process.exit(check.status??1);
console.log('Source, required assets and pinned runtime checked.');
