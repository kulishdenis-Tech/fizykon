// node tools/test-voc.mjs — кличний відмінок на 20 поширених іменах
import fs from 'fs';
const src=fs.readFileSync(new URL('../www/main.js',import.meta.url),'utf8');
const a=src.indexOf('function voc(n)'),b=src.indexOf('return n+\'е\'}',a)+'return n+\'е\'}'.length;
const voc=new Function(src.slice(a,b)+';return voc')();
const T={Олег:'Олеже',Микола:'Миколо',Софія:'Софіє',Марія:'Маріє',Лев:'Леве',Андрій:'Андрію',Олексій:'Олексію',Дмитро:'Дмитре',Богдан:'Богдане',Тарас:'Тарасе',Артем:'Артеме',Назар:'Назаре',Денис:'Денисе',Катерина:'Катерино',Анна:'Анно',Оля:'Олю',Юля:'Юлю',Наталя:'Наталю',Ярослав:'Ярославе',Ігор:'Ігоре'};
let bad=0;for(const [n,e] of Object.entries(T)){const g=voc(n);if(g!==e){bad++;console.log(`${n}: ${g} ≠ ${e}`)}}
console.log(bad?`${bad} помилок`:'20/20 OK');process.exit(bad?1:0);
