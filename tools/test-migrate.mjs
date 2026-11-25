// node tools/test-migrate.mjs — перевіряє, що міграції fz4 (v4→v6) не втрачають XP, зірки і part
import fs from 'fs';
const src=fs.readFileSync(new URL('../www/main.js',import.meta.url),'utf8');
const a=src.indexOf('const MIG='),b=src.indexOf('return db}',src.indexOf('function migrateDB'))+'return db}'.length;
const store={};globalThis.localStorage={setItem:(k,v)=>{store[k]=v},removeItem:k=>{delete store[k]},getItem:k=>store[k]??null,get length(){return Object.keys(store).length},key:i=>Object.keys(store)[i]};
Object.defineProperty(globalThis.localStorage,'__keys',{get:()=>Object.keys(store)});
const code=src.slice(a,b).replace(/Object\.keys\(localStorage\)/g,'localStorage.__keys');
const migrateDB=new Function('localStorage',code+';return migrateDB')(globalThis.localStorage);
const sum=p=>{const z=(p.PP&&p.PP.phys7)||p.P||{};let xp=0,st=0,part=0;for(const k in z){xp+=z[k].xp||0;st+=z[k].stars||0;if(z[k].part)part+=z[k].part.xp||0}return [xp,st,part].join('/')};
let bad=0;
for(const v of [4,5,6]){const db=JSON.parse(fs.readFileSync(new URL(`./fixtures/fz4_v${v}.json`,import.meta.url)));const before=sum(db.list[0]);migrateDB(db);
 const p=db.list[0],after=sum(p);const ok=before===after&&db.v===6&&p.lvl&&typeof p.PP==='object'&&p.age===undefined;
 console.log(`v${v}: ${before} → ${after} ${ok?'OK':'РОЗБІЖНІСТЬ'}`);if(!ok)bad++}
console.log(bad?`${bad} розбіжностей`:'0 розбіжностей');process.exit(bad?1:0);
