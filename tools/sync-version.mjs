// node tools/sync-version.mjs — GAME_VER в engine.js береться з package.json (мажор.мінор)
import fs from 'fs';
const v=JSON.parse(fs.readFileSync('package.json','utf8')).version.split('.').slice(0,2).join('.');
const f='www/engine.js';let s=fs.readFileSync(f,'utf8');
s=s.replace(/GAME_VER\s*=\s*["'][^"']*["']/,`GAME_VER="${v}"`);fs.writeFileSync(f,s);console.log('GAME_VER =',v);
