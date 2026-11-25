'use strict';
const cv=$('cv'),ctx=cv.getContext('2d');
const CX=3000,STOPX=CX+275,CAMCUT=CX-360;
const NAMES={};
function voc(n){n=(n||'').trim();if(!n)return 'друже';const l=n.slice(-1).toLowerCase(),l2=n.slice(-2,-1).toLowerCase();const V='аеєиіїоуюя';
 if(l==='й'||l==='ь')return n.slice(0,-1)+'ю';if(l==='г')return n.slice(0,-1)+'же';if(l==='а')return n.slice(0,-1)+'о';if(l==='я')return n.slice(0,-1)+(V.includes(l2)?'є':'ю');if(l==='о')return n.slice(0,-1)+'е';
 if(V.includes(l))return n;if('гкх'.includes(l)&&false)return n;return n+'е'}
const fillName=t=>String(t).replace(/\{n\}/g,voc(CUR.name||''));
let Z=COURSES[0].zones[0],RUN=0;let CID='phys7';
const COURSE=()=>COURSES.find(c=>c.id===CID)||COURSES[0];
const ZL=()=>COURSE().zones;
const ZT=z=>{if(z.boss)return z.tasks;const ex=(typeof EXTRA!=='undefined'&&EXTRA[CID]&&EXTRA[CID][z.id])||[],L=window.LVL||2,b=z.tasks.slice(),pick=ex.filter(t=>!t.lv||t.lv===L);const last=b[b.length-1];if(last&&last.type==='lab'){b.pop();return b.concat(pick,[last])}return b.concat(pick)};
const NEXTZ=()=>{if(Z&&Z.boss)return null;const l=ZL(),i=l.findIndex(z=>z.id===Z.id);return l[i+1]||null};
const DB=(()=>{try{return JSON.parse(localStorage.getItem('fz4'))||{cur:null,list:[]}}catch(e){return {cur:null,list:[]}}})();
/* міграція збережень: v5 — без віку й статі; резервна копія перед змінами */
const MIG=[[5,p=>{delete p.age;delete p.sex}],[6,p=>{if(!p.lvl)p.lvl=2;if(!p.PP||typeof p.PP!=='object')p.PP={};p.best=p.best||{}}]];
function migrateDB(db){/* послідовні кроки v→v+1; перед змінами — резервна копія fz4_bak_<v>, лишаємо дві останні */
 const v0=db.v||4;if(v0>=MIG[MIG.length-1][0])return db;
 try{const raw=JSON.stringify(db);localStorage.setItem('fz4_bak_'+v0,raw);const baks=Object.keys(localStorage).filter(k=>/^fz4_bak_\d+$/.test(k)).sort((x,y)=>+x.slice(8)-+y.slice(8));while(baks.length>2)localStorage.removeItem(baks.shift())}catch(e){}
 MIG.forEach(([to,fn])=>{if((db.v||4)<to){(db.list||[]).forEach(fn);db.v=to}});return db}
(function(){try{migrateDB(DB);localStorage.setItem('fz4',JSON.stringify(DB));if(DB.v>=6&&DB.list&&DB.list.length)localStorage.removeItem('fz3')}catch(e){}})();
window.migrateDB=migrateDB;
let CUR={name:'',lvl:2,P:{}};const P={};
const saveDB=()=>{try{localStorage.setItem('fz4',JSON.stringify(DB))}catch(e){}};
function detachP(){if(CUR&&CUR.PP&&CUR.PP[CID]===P)CUR.PP[CID]=JSON.parse(JSON.stringify(P))}
function loadP(){Object.keys(P).forEach(k=>delete P[k]);Object.assign(P,CUR.PP[CID]||{});CUR.PP[CID]=P}
function setPlayer(pl){detachP();CUR=pl;DB.cur=pl.id;if(!pl.PP){pl.PP={phys7:pl.P||{}};delete pl.P}
 window.HERO=pl.hero||0;CID=(pl.course&&COURSES.some(c=>c.id===pl.course&&c.ready))?pl.course:'phys7';loadP();window.LVL=pl.lvl||2;saveDB()}
function setCourse(cid){detachP();CID=cid;CUR.course=cid;loadP();saveDB()}
function enterApp(pl){setPlayer(pl);$('prof').hidden=true;Sfx.click();pl.course?showMap():showCourses()}
function showCourses(){Voice.stop();$('map').hidden=true;$('course').hidden=false;
 $('cList').innerHTML=COURSES.map(c=>'<button class="zc'+(c.ready?'':' lock')+'" data-c="'+c.id+'" style="--c:'+c.color+'"'+(c.ready?'':' disabled')+'><span class="zn">'+c.grade+' КЛАС</span><b>'+c.icon+' '+c.subj+'</b><small>'+c.book+'</small><em>'+(c.ready?(c.id===CID&&CUR.course?'✓ обрано':'грати ▸'):'скоро')+'</em></button>').join('')}
const saveP=()=>saveDB();
window.onTaskProgress=pr=>{try{const o=P[Z.id]||(P[Z.id]={xp:0,stars:0});o.part=pr;saveP()}catch(e){}};
addEventListener('pagehide',()=>{try{saveDB()}catch(e){}});document.addEventListener('visibilitychange',()=>{if(document.hidden){try{saveDB()}catch(e){}}});
const FAST=/[?&]fast/.test(location.search);
const G={mode:'title',t:0,cam:0,camT:0,px:200,y:0,vy:0,vx:0,face:1,ph:0,keys:{l:0,r:0},sparks:0,got:{},pops:[],hits:0,shake:0,hurt:0,spin:0,T:10,Ttarget:10,val:4,
 holoK:0,holoTitle:'',beat:'',beatT0:0,spin0:0,arrived:false,Tmin:99,Tmax:0,xp:0,stars:0,unlocked:false,cutDone:false,giroX:300,giroY:380,giroMood:0,fx:[],pops:[],shake:0,hits:0};
window.G=G;
let SPARKS=[],BLOCKS=[],LASTSPARK=0,ENEM=[],BOSS=null;
const STORY=['Ентропус зіпсував закон цієї зони. Його глітчі розсипаються, якщо наступити зверху.','Ентропус розсіяв Спідлінгів: вони завмирають і мигають перед ривком. Не стій на місці!','Глітчі Ентропуса вже знають твій маршрут. Тримай ритм і стрибай вчасно.','Ентропус посилає дронів-хаосу: вони літають і низько, і високо. Дивись угору!','Ентропус нервує: Ядро збирається докупи. Ще трохи, {n}!','Ентропус тікає в наступну зону, але його вороги ще тут. Не зупиняйся!'];
const ENAME={walk:'Глітч',dash:'Спідлінг',fly:'Дрон-хаос',boss:'Міні-Ентропус'};
function setLayout(zi,id){const R=rng(id*7919+13),L=window.LVL||2;SPARKS=[];let x=520;
 for(let i=0;i<16;i++){const h=[0,95,0,40,0,70][Math.floor(R()*6)];SPARKS.push({x:Math.round(x),y:FEET-70-h});x+=125+R()*45}
 LASTSPARK=Math.max(...SPARKS.map(q=>q.x));
 BLOCKS=[];let bx=760;for(let i=0;i<4;i++){bx+=240+R()*260;if(bx>LASTSPARK-200)break;BLOCKS.push(Math.round(bx))}
 spawnEnemies(zi,R,L)}
function spawnEnemies(zi,R,L){ENEM=[];BOSS=null;const n=Math.max(2,Math.min(8,2+(zi>>1)+(L-2))),sp=(46+zi*3.5)*(L===1?.8:L===3?1.2:1);
 const types=['walk'];if(zi>=1)types.push('dash');if(zi>=3)types.push('fly');
 for(let i=0;i<n;i++){const t=types[i%types.length],ex=Math.round(900+(LASTSPARK-1400)*(i+.4)/n+R()*120);
  ENEM.push({type:t,x:ex,x0:ex,rng:t==='fly'?220:150,y:FEET,spd:sp*(t==='fly'?1.3:1),dir:R()<.5?-1:1,ph:R()*6,alive:true,cd:1.5+R()*2,dash:0,tele:0})}
 if(zi%3===2){BOSS={type:'boss',boss:true,x:LASTSPARK-80,x0:LASTSPARK-80,rng:170,y:FEET,spd:sp*1.4,dir:-1,ph:0,alive:true,hp:3,inv:0,cd:2,dash:0,tele:0};ENEM.push(BOSS)}
 G.deaths=G.deaths||0}
const lifeHud=()=>{const e=$('livesN');if(e)e.textContent='♥'.repeat(Math.max(0,G.lives))+'♡'.repeat(Math.max(0,3-G.lives))};
const sparkHud=()=>{$('sparkN').textContent=G.sparks};
const pop=(x,y,t,c)=>{G.pops.push({x,y,t,c,l:1.3})};
let tipTO=0;const tip=(t,ms=3500)=>{const h=$('hint');h.hidden=false;h.textContent=t;clearTimeout(tipTO);tipTO=setTimeout(()=>{if(G.mode==='run')h.textContent='✦ збирай іскри · ▲ перестрибуй фіолетові блоки'},ms)};
/* ---------- speech ---------- */
let skipRes=null;
function say(who,txt,spoken,min=0,nav=null){return new Promise(resolve=>{
 const sub=$('sub'),sk=$('skip');sub.hidden=false;sub.className=who;$('subWho').textContent=who==='giro'?'Гіро':'Рекс';$('subTxt').textContent=fillName(txt);sk.classList.remove('ready');
 $('back').hidden=!(nav&&nav.back);$('replay').hidden=!nav;
 let fin=false,speechOK=false,minOK=min<=0;const k=FAST?.25:1;
 const est=Math.max(2.2,spoken.length*.07)*1000*k,t0=performance.now();
 const finish=(d='next')=>{if(fin)return;fin=true;skipRes=null;Voice.stop();setTimeout(()=>resolve(d),FAST?60:120)};
 const check=()=>{if(speechOK&&minOK){sk.classList.add('ready');if(FAST)finish()}};
 skipRes=finish;
 const spoke=FAST?false:Voice.speak(spoken,who,()=>{const el=performance.now()-t0;if(el<est*.3)setTimeout(()=>{speechOK=true;check()},est-el);else{speechOK=true;check()}});
 if(!spoke)setTimeout(()=>{speechOK=true;check()},est);
 if(min>0)setTimeout(()=>{minOK=true;check()},min*1000*k);
})}
const sleep=ms=>new Promise(r=>setTimeout(r,FAST?ms*.25:ms));
const until=f=>new Promise(r=>{const i=setInterval(()=>{if(f()){clearInterval(i);r()}},50)});
$('skip').addEventListener('click',e=>{e.stopPropagation();Sfx.click();skipRes&&skipRes('next')});$('back').addEventListener('click',e=>{e.stopPropagation();Sfx.click();skipRes&&skipRes('back')});$('replay').addEventListener('click',e=>{e.stopPropagation();Sfx.click();skipRes&&skipRes('replay')});$('sub').addEventListener('click',()=>{skipRes&&skipRes()});

/* ---------- flow ---------- */
async function startGame(){Sfx.init();Voice.init();Voice.unlock();Sfx.startMusic();Sfx.click();$('title').hidden=true;showProfiles()}
const LVN=['','Новачок','Середній','Профі'];let pForm={lvl:0};
function showProfiles(){$('map').hidden=true;$('prof').hidden=false;const has=DB.list.length>0;
 $('pList').innerHTML=DB.list.map(p=>'<button class="btn pl" data-id="'+p.id+'">👤 '+p.name.replace(/</g,'&lt;')+' <small>· '+LVN[p.lvl||2]+'</small></button>').join('');
 $('pNew').hidden=!has;$('pForm').hidden=has;$('pHead').textContent=has?'ХТО ГРАЄ?':'ПОЗНАЙОМИМОСЬ';$('pErr').textContent=''}
function bindProfiles(){
 $('pList').addEventListener('click',e=>{const b=e.target.closest('.pl');if(!b)return;const pl=DB.list.find(p=>p.id===b.dataset.id);if(!pl)return;enterApp(pl)});
 $('pNew').addEventListener('click',()=>{$('pForm').hidden=false;$('pNew').hidden=true});
 document.querySelectorAll('#pHero [data-hero]').forEach(b=>b.addEventListener('click',()=>{pForm.hero=+b.dataset.hero;document.querySelectorAll('#pHero [data-hero]').forEach(x=>x.classList.toggle('sel',x===b))}));
 document.querySelectorAll('#pForm [data-lvl]').forEach(b=>b.addEventListener('click',()=>{pForm.lvl=+b.dataset.lvl;document.querySelectorAll('#pForm [data-lvl]').forEach(x=>x.classList.toggle('sel',x===b))}));
 $('pGo').addEventListener('click',()=>{const name=$('pName').value.trim().replace(/\s+/g,' ');
  if(name.length<2){$('pErr').textContent='Напиши своє ім’я.';return}if(!pForm.lvl){$('pErr').textContent='Обери, наскільки ти впевнений(а) у фізиці.';return}
  let old={};if(!DB.list.length){try{old=JSON.parse(localStorage.getItem('fz3'))||{}}catch(e){}}
  const pl={id:'p'+Date.now(),name,lvl:pForm.lvl,hero:pForm.hero||0,P:old};DB.list.push(pl);enterApp(pl)});
 $('bWho').addEventListener('click',()=>{Voice.stop();showProfiles()})}

function showMap(){document.body.classList.add('onmap');document.body.classList.remove('inrun');Music.play('park');RUN++;G.sparks=0;sparkHud();skipRes&&skipRes('abort');Voice.stop();G.mode='map';G.holoK=0;G.beat='';$('ctl').classList.add('hide');$('hint').hidden=true;$('sub').hidden=true;$('play').hidden=true;$('endcard').hidden=true;$('task').hidden=true;
 $('mapList').innerHTML=ZL().map((z,zi)=>{const p=P[z.id];const lk=zoneLocked(zi);return '<button class="zc'+(lk?' lock':'')+'"'+(lk?' disabled':'')+' data-z="'+z.id+'" style="--c:'+z.color+'"><span class="zn">ЗОНА '+(zi+1)+' · '+z.par+' · '+ZT(z).length+' місій</span><b>'+z.name+'</b><small>'+z.blurb+'</small>'+(Theory.data(z.id)?'<span class="thb" data-th="'+z.id+'">📖 Теорія</span>':'')+(p&&p.part?'<span class="thb" data-res="'+z.id+'">▶ Продовжити задачі '+p.part.i+'/'+ZT(z).length+'</span>':'')+(!lk?'<span class="thb" data-tk="'+z.id+'">📝 Лише задачі</span>':'')+'<em>'+(lk?'🔒 пройди попередню зону (≥1★)':p&&p.max?'★ '+p.stars+'/'+(p.max||6)+' · '+p.xp+' XP ✓':'грати ▸')+'</em></button>'}).join('')+(bossOpen()?'<button class="zc" data-boss="1" style="--c:#ff4d8d"><span class="zn">ФІНАЛ · '+zonesDone()+' з '+ZL().length+' зон пройдено</span><b>⚔ Ентропус</b><small>'+Math.min(8,ZL().length)+' ударів: по завданню з різних зон курсу, щоразу нові.</small><em>у бій ▸</em></button>':'<button class="zc lock" disabled style="--c:#ff4d8d"><span class="zn">ФІНАЛ</span><b>⚔ Ентропус</b><small>Пройди всі зони курсу, щоб викликати фінального боса.</small><em>🔒 ще '+ZL().filter(z=>!(P[z.id]&&P[z.id].max&&P[z.id].stars>=1)).length+' зон</em></button>')+FUTURE.map(z=>'<button class="zc lock" disabled style="--c:'+z.color+'"><span class="zn">'+(z.id===7?'ФІНАЛ':'ЗОНА '+z.id)+' · '+z.par+'</span><b>'+z.name+'</b><small>'+z.blurb+'</small><em>скоро</em></button>').join('');
 const tot=Object.values(P).reduce((q,p)=>q+p.xp,0);$('mapStat').textContent=COURSE().subj+', '+COURSE().grade+' клас · '+(CUR.name?'Гравець: '+CUR.name+' · рівень: '+LVN[CUR.lvl||2]+' · ':'')+'Загалом досвіду: '+tot+' XP';$('map').hidden=false}
async function startZone(id){document.body.classList.remove('onmap');document.body.classList.add('inrun');Z=ZL().find(z=>z.id===id);const tok=++RUN;Art.setTheme(Z.theme);Music.play(Z.theme);document.documentElement.style.setProperty('--zc',Z.color);
 $('map').hidden=true;$('endcard').hidden=true;$('zchip').innerHTML='<b>'+(Z.boss?'ФІНАЛ':'ЗОНА '+(ZL().findIndex(q=>q.id===Z.id)+1))+'</b><span>'+Z.par+' · '+Z.name+'</span>';
 G.deaths=0;G.kills=0;G.lives=3;setLayout(ZL().findIndex(q=>q.id===Z.id),Z.id);lifeHud();
 Object.assign(G,{mode:'intro',px:200,y:0,vy:0,vx:0,face:1,ph:0,keys:{l:0,r:0},sparks:0,got:{},hurt:0,cam:0,camT:0,beat:'',holoK:0,arrived:false,Tmin:99,Tmax:0,unlocked:false,cutDone:false,T:10,Ttarget:10,giroMood:0,fx:[],val:Z.play.val,giroX:300,giroY:380});
 $('sparkN').textContent=0;$('ctl').classList.add('hide');$('hint').hidden=true;$('play').hidden=true;$('goTask').disabled=true;$('goTask').textContent='Покрути повзунок ↑';
 $('plabel').innerHTML=Z.play.label?Z.play.label.replace(/^(\S+)\s(.+)$/,'$1 <b>$2</b>'):'Період <b>T</b>';const sl=$('tslider');sl.min=Z.play.min;sl.max=Z.play.max;sl.step=Z.play.step;sl.value=Z.play.val;$('tval').textContent=Z.play.fmt(Z.play.val);
 Tasks.setList(ZT(Z).map(t=>t.given&&window.LVL!==2?LEVELS(t,window.LVL):t));Tasks.reset();
 {const GR='Привіт, {n}!',gz=ZL().find(z=>z.intro&&z.intro[0]&&z.intro[0][1].startsWith(GR));
  let L=Z.intro.slice();
  if(CUR.giro){if(gz===Z)L=L.slice(1)}                      // знайомство з Гіро — один раз на профіль
  else{if(gz&&gz!==Z)L=[gz.intro[0]].concat(L);CUR.giro=1;saveP()}
  for(const l of L){await say(l[0],l[1],l[2]);if(tok!==RUN)return}}
 $('sub').hidden=true;G.mode='run';G.Ttarget=4.2;$('ctl').classList.remove('hide');$('hint').hidden=false;$('hint').textContent='▶ Біжи вправо · ✦ збирай іскри · ▲ перестрибуй блоки · наступай на глітчів згори';tip(STORY[(ZL().findIndex(q=>q.id===Z.id))%STORY.length],5600);
}
function zoneLocked(zi){if(CUR.openAll||zi===0)return false;const pq=P[ZL()[zi-1].id];return !(pq&&pq.max&&pq.stars>=1)}
const zonesDone=()=>ZL().filter(z=>{const q=P[z.id];return q&&q.max&&q.stars>=1}).length;
function bossZone(){const L=ZL(),T=[];L.forEach(z=>{const c=ZT(z).filter(t=>t.type!=='lab');if(c.length)T.push(c[Math.floor(Math.random()*c.length)])});for(let i=T.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[T[i],T[j]]=[T[j],T[i]]}
 return Object.assign({},L[L.length-1],{id:'boss',boss:true,name:'Фінал: Ентропус',par:'Підсумок курсу',color:'#ff4d8d',gem:'Ядро законів',tasks:T.slice(0,8).map((t,i)=>Object.assign({},t,{title:'Удар '+(i+1)+' · '+(t.title||'').replace(/^Місія [\d.]+ · /,'')}))})}
const bossOpen=()=>{const L=ZL();return CUR.openAll||L.every(z=>{const q=P[z.id];return q&&q.max&&q.stars>=1})};
function resumeZone(id,fresh){document.body.classList.remove('onmap');document.body.classList.add('inrun');Z=id==='boss'?bossZone():ZL().find(z=>z.id===id);++RUN;Art.setTheme(Z.theme);Music.play(Z.theme);document.documentElement.style.setProperty('--zc',Z.color);
 $('map').hidden=true;$('endcard').hidden=true;$('zchip').innerHTML='<b>'+(Z.boss?'ФІНАЛ':'ЗОНА '+(ZL().findIndex(q=>q.id===Z.id)+1))+'</b><span>'+Z.par+' · '+Z.name+'</span>';
 Object.assign(G,{mode:'task',px:200,y:0,vy:0,vx:0,face:1,ph:0,keys:{l:0,r:0},sparks:0,got:{},hurt:0,cam:0,camT:0,beat:'',holoK:0,arrived:true,Tmin:99,Tmax:0,unlocked:true,cutDone:true,T:4,Ttarget:4,giroMood:0,fx:[],val:Z.play.val,giroX:300,giroY:380});
 G.kills=0;G.deaths=0;ENEM=[];BOSS=null;const LST=ZT(Z).map(t=>t.given&&window.LVL!==2?LEVELS(t,window.LVL):t);Tasks.setList(LST);Tasks.reset();const pr=(fresh||Z.boss)?null:(P[Z.id]||{}).part;
 if(pr&&pr.i>=LST.length){/* усі задачі вже розв’язано — одразу фініш, без повторного відкриття */Tasks.resume(pr);G.xp=pr.t.xp;G.stars=pr.t.stars;finish();return}
 if(pr)Tasks.resume(pr);openTasks(pr?pr.i:0)}
async function runSteps(i,tok){const STEPS=Z.steps;
 while(i<STEPS.length){const s=STEPS[i];
  if(!s.keep){G.beat=s.beat;G.beatT0=G.t;G.spin0=G.spin;G.holoTitle=s.title;if(s.beat)Sfx.click()}
  if(s.beat&&!G.arrived){await until(()=>G.arrived||tok!==RUN);if(tok!==RUN)return}
  if(s.play){G.mode='play';$('play').hidden=false;if(!G.unlocked){G.Tmin=99;G.Tmax=0}$('tslider').value=G.val;setVal(G.val)}else{G.mode='auto';$('play').hidden=true;G.Ttarget=4}
  if(s.beat&&G.holoK<.1)G.holoK=.01;
  const r=await say(s.who,s.txt,s.sp,s.min||0,{back:i>0});
  if(tok!==RUN||r==='abort')return;
  if(r==='back')i=Math.max(0,i-1);else if(r==='replay'){}else i++;
 }
 $('sub').hidden=true;G.cutDone=true}
async function cutscene(){const tok=RUN;
 G.mode='auto';$('ctl').classList.add('hide');$('hint').hidden=true;G.camT=CAMCUT;Sfx.whoosh();G.Ttarget=4;G.giroMood=1;
 await runSteps(0,tok)}
function setVal(v){v=parseFloat(v);G.val=v;G.Ttarget=Z.play.vis(v);G.Tmin=Math.min(G.Tmin,v);G.Tmax=Math.max(G.Tmax,v);
 $('tval').textContent=Z.play.fmt(v);
 if(!G.unlocked&&G.Tmax-G.Tmin>=(Z.play.max-Z.play.min)*.3){G.unlocked=true;$('goTask').disabled=false;$('goTask').textContent='Далі: задачі ▸';Sfx.ok()}}
$('tslider').addEventListener('input',e=>{setVal(e.target.value);Sfx.click()});
$('goTask').addEventListener('click',()=>{if($('goTask').disabled)return;skipRes&&skipRes();$('sub').hidden=true;openTasks(0)});
function openTasks(i){G.mode='task';$('play').hidden=true;Tasks.open(i,(res,pr)=>{
 if(!res){if(pr&&pr.i<ZT(Z).length&&(pr.i>0||pr.t.done>0)){const o=P[Z.id]||(P[Z.id]={xp:0,stars:0});o.part=pr;saveP()}showMap();return}
 G.xp=res.xp;G.stars=res.stars;finish()})}
async function finish(){G.mode='end';$('play').hidden=true;Sfx.ok();setTimeout(()=>Sfx.ok(),400);
 const bonus=G.sparks*2+(G.sparks>=SPARKS.length?10:0)+(G.kills||0)*2+(BOSS&&!BOSS.alive?10:0);G.bonus=bonus;G.xp+=bonus;
 const old=P[Z.id]||{xp:0,stars:0};P[Z.id]={xp:Math.max(old.xp,G.xp),stars:Math.max(old.stars,G.stars),max:Tasks.max()};saveP();window.Rank&&Rank.sync();
 $('endTag').textContent='Отримано деталь Ядра: «'+Z.gem+'»';
 $('endStat').innerHTML='Досвід: <b>+'+G.xp+' XP</b> · зірки за задачі: <b>'+G.stars+'/'+Tasks.max()+'</b><br>іскри: <b>'+G.sparks+'/'+SPARKS.length+'</b> (бонус <b>+'+G.bonus+' XP</b>'+(G.sparks>=SPARKS.length?', усі зібрано!':'')+')';
 $('bNext').hidden=!NEXTZ();{const n=NEXTZ();$('endNext').textContent=Z.boss?'Ентропуса переможено! Ядро законів знову ціле. Ти пройшов увесь курс!':'Зону «'+Z.name+'» пройдено! '+(n?'Далі: «'+n.name+'».':'Усі зони цього курсу пройдено!')}$('endcard').hidden=false}
$('cList').addEventListener('click',e=>{const b=e.target.closest('.zc');if(!b||b.disabled)return;Sfx.click();setCourse(b.dataset.c);$('course').hidden=true;showMap()});
$('bCourse').addEventListener('click',()=>{Sfx.click();showCourses()});
bindProfiles();$('bPlay').addEventListener('click',startGame);$('verTxt').textContent=GAME_VER;
$('mapList').addEventListener('click',e=>{const bo=e.target.closest('[data-boss]');if(bo){Sfx.click();resumeZone('boss',true);return}const tk=e.target.closest('[data-tk]');if(tk){Sfx.click();const id=+tk.dataset.tk,q=P[id];if(q&&q.part&&!confirm('Почати задачі спочатку? Збережений прогрес задач цієї зони буде скинуто.'))return;if(q)delete q.part;resumeZone(id,true);return}const rs=e.target.closest('[data-res]');if(rs){Sfx.click();resumeZone(+rs.dataset.res);return}const th=e.target.closest('.thb');if(th&&th.dataset.th){Sfx.click();Theory.open(+th.dataset.th,'map');return}const b=e.target.closest('.zc');if(b&&!b.disabled){Sfx.click();startZone(+b.dataset.z)}});
$('bMap').addEventListener('click',()=>{Sfx.click();if(G.mode==='run'&&!confirm(G.sparks>0?'Вийти на карту? Іскри цього забігу пропадуть.':'Вийти на карту? Забіг почнеться спочатку.'))return;showMap()});$('bMap2').addEventListener('click',()=>{Sfx.click();showMap()});
$('bNext').addEventListener('click',()=>{Sfx.click();{const n=NEXTZ();if(n)startZone(n.id)}});
$('bCartoon').addEventListener('click',()=>{$('endcard').hidden=true;Tasks.reset();G.unlocked=false;$('goTask').disabled=true;$('goTask').textContent='Покрути повзунок ↑';G.arrived=true;G.Ttarget=4;runSteps(1,++RUN)});

/* ---------- input ---------- */
const K={ArrowLeft:'l',a:'l',A:'l',ArrowRight:'r',d:'r',D:'r'};
addEventListener('keydown',e=>{if(G.mode!=='run'&&skipRes&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){skipRes(e.key==='ArrowLeft'?'back':'next');e.preventDefault();return}if(K[e.key]){G.keys[K[e.key]]=1;e.preventDefault()}if(e.key===' '||e.key==='ArrowUp'||e.key==='w'){if(G.mode==='run')jump();e.preventDefault()}if((e.key==='Enter'||(e.key===' '&&G.mode!=='run'))&&skipRes)skipRes()});
addEventListener('keyup',e=>{if(K[e.key])G.keys[K[e.key]]=0});
function hold(id,k){const b=$(id);const on=e=>{e.preventDefault();G.keys[k]=1;b.classList.add('on')},off=e=>{e.preventDefault();G.keys[k]=0;b.classList.remove('on')};b.addEventListener('pointerdown',on);['pointerup','pointercancel','pointerleave'].forEach(n=>b.addEventListener(n,off))}
hold('bL','l');hold('bR','r');
$('bJ').addEventListener('pointerdown',e=>{e.preventDefault();jump()});
function jump(){if(G.mode==='run'&&G.y===0){G.vy=-Z.jump;Sfx.jump()}}
$('bMusic').addEventListener('click',()=>{Sfx.musicOn=!Sfx.musicOn;$('bMusic').classList.toggle('off',!Sfx.musicOn);Music.apply()});
$('bVoice').addEventListener('click',()=>{Voice.on=!Voice.on;if(!Voice.on)Voice.stop();$('bVoice').classList.toggle('off',!Voice.on)});

/* ---------- update ---------- */
let last=performance.now(),stepT=0;
function update(dt){
 G.t+=dt;if(G.hurt>0)G.hurt-=dt;if(G.shake>0)G.shake-=dt;G.pops.forEach(p=>{p.l-=dt;p.y-=40*dt});G.pops=G.pops.filter(p=>p.l>0);
 // carousel spin
 G.T+=(G.Ttarget-G.T)*Math.min(1,dt*3);
 G.spin+=TAU/G.T*dt;
 if(G.mode==='run'){
  const dir=G.keys.r-G.keys.l;G.vx+=(dir*360-G.vx)*Math.min(1,dt*9);if(dir)G.face=dir;
  G.px=clamp(G.px+G.vx*dt,60,CX+300);
  if(Math.abs(G.vx)>20&&G.y===0){G.ph+=dt*Math.abs(G.vx)/32;stepT+=dt;if(stepT>.26){stepT=0;Sfx.step()}}
  // іскри: +1 до заряду; кожна дає +2 XP наприкінці зони
  SPARKS.forEach((s,i)=>{if(G.got[i])return;if(Math.abs(s.x-G.px)<40&&Math.abs((s.y)-(FEET+G.y-70))<70){G.got[i]=1;G.sparks++;sparkHud();Sfx.coin();pop(s.x,s.y-30,'+1 ✦','#7df9ff');for(let k=0;k<8;k++)G.fx.push({x:s.x,y:s.y,vx:(Math.random()-.5)*300,vy:-Math.random()*260,l:.6})}});
  // глітч-блоки: вкрадають до 3 іскор (вони повертаються на місце — збери знову)
  BLOCKS.forEach(bx=>{if(G.hurt<=0&&Math.abs(bx-G.px)<42&&G.y>-62){G.hurt=1;G.px-=110;G.vx=-200;G.giroMood=0;Sfx.hit();G.shake=.35;
    let lost=0;for(let i=SPARKS.length-1;i>=0&&lost<3;i--){if(G.got[i]){G.got[i]=0;lost++}}G.sparks-=lost;sparkHud();
    pop(bx,FEET-150,lost?'−'+lost+' ✦ іскри вкрадено':'Глітч-блок! Стрибай ▲','#ff4d8d');G.hits=(G.hits||0)+1;
    if(G.hits===1)tip('⚠ Фіолетові блоки крадуть іскри, червоні глітчі шкодять. Перестрибуй: пробіл або ▲',4200);
    for(let k=0;k<10;k++)G.fx.push({x:bx,y:FEET-40,vx:(Math.random()-.5)*400,vy:-Math.random()*300,l:.5})}});
  updEnemies(dt);
  G.camT=clamp(G.px-420,0,CAMCUT);
  if(G.px>LASTSPARK+90&&G.mode==='run'){cutscene()}
 }
 if(G.mode==='auto'){G.vx=250;G.face=1;G.px+=G.vx*dt;G.ph+=dt*8;stepT+=dt;if(stepT>.26){stepT=0;Sfx.step()}if(G.px>=STOPX){G.px=STOPX;G.vx=0;G.arrived=true;G.face=-1}if(G.arrived){G.vx=0}}
 else if(G.mode!=='run'){G.vx=0}
 if(G.y<0||G.vy<0){G.vy+=Z.gravity*dt;G.y+=G.vy*dt;if(G.y>=0){G.y=0;G.vy=0}}
 G.cam+=(G.camT-G.cam)*Math.min(1,dt*3.2);
 // giro follow
 let gx,gy;
 if(G.mode==='run'||G.mode==='intro'||(G.mode==='auto'&&!G.arrived)){gx=G.px-80*G.face-G.cam;gy=FEET-250}else{gx=618;gy=FEET-300}
 if(G.mode==='intro'){gx=G.px-G.cam+150;gy=FEET-230}
 G.giroX+=(gx-G.giroX)*Math.min(1,dt*4);G.giroY+=(gy-G.giroY)*Math.min(1,dt*4);
 // holo
 const wantHolo=(G.beat&&G.mode!=='task'&&G.mode!=='end'&&G.arrived)?1:0;G.holoK+=(wantHolo-G.holoK)*Math.min(1,dt*4);
 G.fx.forEach(f=>{f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=700*dt;f.l-=dt});G.fx=G.fx.filter(f=>f.l>0);
}


function updEnemies(dt){
 const sc=Math.max(.6,1-.12*(G.deaths||0));
 ENEM.forEach(e=>{if(!e.alive)return;e.ph+=dt;if(e.inv>0)e.inv-=dt;
  if(e.type==='dash'){if(e.dash>0){e.x+=e.dir*430*dt;e.dash-=dt;if(e.dash<=0){e.dir=-e.dir;e.cd=2.2}}else if(e.tele>0){e.tele-=dt;if(e.tele<=0)e.dash=.55}else{e.cd-=dt;if(e.cd<=0&&Math.abs(e.x-G.px)<520){e.dir=G.px<e.x?-1:1;e.tele=.55}}}
  else{e.x+=e.dir*e.spd*sc*dt;if(Math.abs(e.x-e.x0)>e.rng)e.dir=e.x>e.x0?-1:1}
  e.y=e.type==='fly'?FEET-120-Math.abs(Math.sin(e.ph*1.6))*70:FEET;
  if(G.hurt>0)return;
  const s=e.boss?2.4:1.25,fy=FEET+G.y,top=e.y-52*s;
  if(Math.abs(e.x-G.px)<28+24*s&&fy>top&&fy-110<e.y){
   if(G.vy>40&&fy<top+34*s+10){hitEnemy(e);G.vy=-Z.jump*.65}
   else if(!(e.inv>0))hurtPlayer(e.x)}});
 if(BOSS&&BOSS.alive&&G.px>LASTSPARK+30)G.px=LASTSPARK+30}
function hitEnemy(e){if(e.boss){if(e.inv>0)return;e.hp--;e.inv=.9;Sfx.ok();pop(e.x,e.y-130,e.hp>0?'Ще '+e.hp+'!':'Знищено!','#ffd166');G.shake=.2;if(e.hp>0)return}
 e.alive=false;G.kills=(G.kills||0)+1;Sfx.coin();pop(e.x,e.y-60,e.boss?'Міні-Ентропус розсипався! +10 XP':'+1 ✦ розсипався','#7df9ff');
 if(CUR){const b=CUR.best||(CUR.best={});b[e.type]=(b[e.type]||0)+1;saveDB()}
 for(let k=0;k<(e.boss?30:14);k++)G.fx.push({x:e.x,y:e.y-26,vx:(Math.random()-.5)*480,vy:-Math.random()*380,l:.7})}
function hurtPlayer(ex){G.hurt=1.2;G.px+=(G.px<ex?-1:1)*110;G.vx=(G.px<ex?-1:1)*200;G.lives--;lifeHud();Sfx.hit();G.shake=.35;
 let lost=0;for(let i=SPARKS.length-1;i>=0&&lost<2;i--){if(G.got[i]){G.got[i]=0;lost++}}G.sparks-=lost;sparkHud();
 pop(ex,FEET-100,lost?'−'+lost+' ✦ і ♥':'♥ −1','#ff4d8d');
 for(let k=0;k<10;k++)G.fx.push({x:G.px,y:FEET-40,vx:(Math.random()-.5)*400,vy:-Math.random()*300,l:.5});
 if(G.lives<=0){G.deaths=(G.deaths||0)+1;G.lives=3;lifeHud();G.px=200;G.vx=0;G.got={};G.sparks=0;sparkHud();spawnEnemies(ZL().findIndex(q=>q.id===Z.id),rng(Z.id*31+G.deaths),window.LVL||2);
  tip('Ентропус відкинув тебе на старт! Спробуй ще — глітчі стали повільнішими.',4200)}}
function drawEn(c,e,x,t){const s=e.boss?2.4:1.25,f=e.dir>0?1:-1,fl=e.tele>0&&Math.floor(t*16)%2;
 c.save();c.translate(x,e.y);c.scale(s*f,s);if(e.inv>0&&Math.floor(t*20)%2)c.globalAlpha=.4;
 const col=e.boss?'#b04dff':e.type==='dash'?(fl?'#fff':'#ff9a3d'):e.type==='fly'?'#4dd2ff':'#ff4d8d';
 c.globalAlpha*=.28;c.fillStyle=col;c.beginPath();c.ellipse(0,-28,40,34,0,0,TAU);c.fill();c.globalAlpha=(e.inv>0&&Math.floor(t*20)%2)?.4:1;c.fillStyle=col;
 const w=Math.sin(e.ph*10)*5;
 if(e.type==='fly'){c.beginPath();c.ellipse(0,-26,26,20,0,0,TAU);c.fill();c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.ellipse(-24,-40-w,16,7,-.5,0,TAU);c.ellipse(24,-40-w,16,7,.5,0,TAU);c.fill()}
 else{rr(c,-27,-50,54,42,10);c.fill();if(e.type==='dash'){c.beginPath();c.moveTo(-18,-50);c.lineTo(-8,-66);c.lineTo(0,-50);c.lineTo(8,-66);c.lineTo(18,-50);c.fill()}
  c.fillRect(-20,-10,12,10+w*.4);c.fillRect(8,-10,12,10-w*.4)}
 c.fillStyle='#fff';c.beginPath();c.arc(-9,-32,7,0,TAU);c.arc(11,-32,7,0,TAU);c.fill();c.fillStyle='#1a1030';c.beginPath();c.arc(-6,-31,3.2,0,TAU);c.arc(14,-31,3.2,0,TAU);c.fill();
 c.strokeStyle='#1a1030';c.lineWidth=3;c.beginPath();c.moveTo(-16,-42);c.lineTo(-3,-38);c.moveTo(18,-42);c.lineTo(5,-38);c.stroke();
 c.restore()}
/* ---------- holo ---------- */
function holo(c){
 const k=ease(G.holoK);if(k<.02)return;const bt=G.t-G.beatT0,rev=(G.spin-G.spin0)/TAU,T=G.T,a=G.spin;
 c.save();c.translate(PX+PW/2,PY+PH/2);c.scale(.88+.12*k,.88+.12*k);c.globalAlpha=k;c.translate(-PX-PW/2,-PY-PH/2);
 c.shadowColor='#5df2ff';c.shadowBlur=26;c.fillStyle=lg(c,PX,PY,PX+PW,PY+PH,[[0,'rgba(10,50,100,.66)'],[1,'rgba(50,20,110,.66)']]);rr(c,PX,PY,PW,PH,26);c.fill();c.shadowBlur=0;c.strokeStyle='rgba(125,249,255,.7)';c.lineWidth=2.5;c.stroke();
 c.save();rr(c,PX,PY,PW,PH,26);c.clip();c.strokeStyle='rgba(125,249,255,.06)';c.lineWidth=1;for(let y=PY;y<PY+PH;y+=6){c.beginPath();c.moveTo(PX,y);c.lineTo(PX+PW,y);c.stroke()}const sy=PY+((G.t*120)%PH);c.fillStyle='rgba(125,249,255,.07)';c.fillRect(PX,sy,PW,22);c.restore();
 txt(c,G.holoTitle,PX+26,PY+44,24,'#7df9ff','left','Russo');
 Z.draw(c,G.beat,bt,rev,a,T,G);
 c.restore()}

/* ---------- render ---------- */
function draw(){
 const r=cv.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),W=Math.round(r.width*dpr),H=Math.round(r.height*dpr);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
 const c=ctx,cam=G.cam,t=G.t;c.setTransform(W/VW,0,0,H/VH,0,0);if(G.shake>0)c.translate((Math.random()-.5)*10*G.shake*3,(Math.random()-.5)*8*G.shake*3);
 Art.bg(c,cam,t);Art.ground(c,cam,t);Art.lamps(c,cam,t);
 // carousel
 if(Z.tint&&G.mode!=='title'){c.fillStyle=Z.tint;c.fillRect(0,0,VW,VH)}
 const cxs=CX-cam;let mark=null;if(cxs>-400&&cxs<VW+400&&G.mode!=='map'&&G.mode!=='title'){Z.landmark(c,cxs,t,G.spin)}
 // blocks & sparks
 BLOCKS.forEach((bx,i)=>{const x=bx-cam;if(x>-80&&x<VW+80)Art.cube(c,x,t,i*3)});
 ENEM.forEach(e=>{if(!e.alive)return;const x=e.x-cam;if(x>-120&&x<VW+120)drawEn(c,e,x,t)});
 SPARKS.forEach((s,i)=>{if(G.got[i])return;const x=s.x-cam;if(x>-60&&x<VW+60)Art.spark(c,x,s.y,t)});
 // max
 const mx=G.px-cam,run=Math.min(1,Math.abs(G.vx)/200);
 Art.shadow(c,mx,34*(1+G.y/700));
 if(!(G.hurt>0&&Math.floor(G.hurt*14)%2)&&G.mode!=='title')(Z.theme==='block'?Art.maxB:Art.max).call(Art,c,mx,FEET+G.y,{ph:G.ph,face:G.face,air:G.y<-4,run,t,s:1});
 else if(G.mode==='title'){}
 // title-mode idle preview
 Art.flyDraw(c,cam,t);
 (Z.theme==='block'?Art.giroB:Art.giro).call(Art,c,G.giroX,G.giroY,t,{mood:G.giroMood,tilt:Math.sin(t*1.5)*.06});
 G.fx.forEach(f=>{c.globalAlpha=clamp(f.l*2,0,1);c.fillStyle='#7df9ff';c.beginPath();c.arc(f.x-cam,f.y,4,0,TAU);c.fill()});c.globalAlpha=1;
 G.pops.forEach(p=>{c.globalAlpha=clamp(p.l*1.6,0,1);txt(c,p.t,p.x-cam,p.y,26,p.c,'center');c.globalAlpha=1});
 holo(c);
 // vignette
 if(!window._vgc||_vgc.width!==VW||_vgc.height!==VH){window._vgc=document.createElement('canvas');_vgc.width=VW;_vgc.height=VH;const q=_vgc.getContext('2d'),vg=q.createRadialGradient(VW/2,VH/2,VH*.45,VW/2,VH/2,VH*.95);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(3,4,20,.45)');q.fillStyle=vg;q.fillRect(0,0,VW,VH)}c.drawImage(_vgc,0,0);
}
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;update(dt);if(G.mode!=='task'||!document.body.classList.contains('intask'))draw();requestAnimationFrame(loop)}
Art.init();requestAnimationFrame(loop);
G.debug={teleport(x){G.px=x;G.cam=G.camT=clamp(x-420,0,CAMCUT)},skip(){skipRes&&skipRes()},openTasks};

/* ---------- налаштування ---------- */
(()=>{const S=Settings,f=v=>Math.round(v*100)+'%';
 const map=[['sRate','rate',v=>v.toFixed(2).replace(/0$/,'').replace(/\.$/,'')+'×'],['sVoice','voice',f],['sMusic','music',f],['sSfx','sfx',f]];
 const sync=()=>map.forEach(([id,k,fm])=>{$(id).value=S.v[k];$(id+'V').textContent=fm(S.v[k])});
 const open=()=>{Sfx.click();sync();syncP();$('settings').hidden=false};
 const syncP=()=>{document.querySelectorAll('#sLvl [data-l]').forEach(b=>b.classList.toggle('on',+b.dataset.l===(CUR.lvl||2)));$('sOpenAll').checked=!!CUR.openAll;$('sWho').textContent=CUR.name?'Гравець: '+CUR.name:'';{const b=CUR.best||{},t=Object.keys(ENAME).filter(k=>b[k]).map(k=>ENAME[k]+' ×'+b[k]);$('sBest').textContent=t.length?'Бестіарій: '+t.join(' · '):'Бестіарій порожній: переможи глітчів у забігах.'}};
 $('sLvl').addEventListener('click',e=>{const b=e.target.closest('[data-l]');if(!b)return;const nl=+b.dataset.l;if(nl===(CUR.lvl||2))return;
  const hasPart=Object.values(CUR.PP||{}).some(c=>Object.values(c||{}).some(o=>o&&o.part));
  if(hasPart){if(!confirm('Є незавершені зони. Задачі на іншому рівні відрізняються, тож розпочаті зони (кнопка «Продовжити») почнуться спочатку. Змінити рівень?'))return;
   Object.values(CUR.PP||{}).forEach(c=>Object.values(c||{}).forEach(o=>{if(o)delete o.part}));if(P)Object.values(P).forEach(o=>{if(o)delete o.part})}
  CUR.lvl=nl;window.LVL=nl;saveDB();syncP();Sfx.click()});
 $('sRen').addEventListener('click',()=>{Sfx.click();$('sRenBox').hidden=false;$('sRenIn').value=CUR.name||'';$('sRenMsg').textContent='Можна вигадане ім’я або прізвисько. Від 2 до 20 символів.';$('sRenIn').focus()});
$('sRenNo').addEventListener('click',()=>{Sfx.click();$('sRenBox').hidden=true;$('sRenMsg').textContent=''});
$('sRenOk').addEventListener('click',()=>{const v=$('sRenIn').value.trim().replace(/\s+/g,' ').slice(0,20);if(v.length<2){$('sRenMsg').textContent='Ім’я має бути від 2 символів.';return}CUR.name=v;saveDB();syncP();Sfx.ok();$('sRenBox').hidden=true;$('sRenMsg').textContent='Збережено.'});
 $('sOpenAll').addEventListener('change',e=>{CUR.openAll=e.target.checked;saveDB();if(!$('map').hidden)showMap()});
 $('sDel').addEventListener('click',()=>{if(!CUR.id||!confirm('Видалити профіль «'+CUR.name+'» разом з усім прогресом? Це не можна скасувати.'))return;const gone=CUR;try{if(gone.online&&gone.online.on&&typeof Online!=='undefined')Online.leave(gone,COURSES.map(c=>c.id)).catch(()=>{})}catch(e){}DB.list=DB.list.filter(p=>p.id!==CUR.id);DB.cur=null;saveDB();$('settings').hidden=true;Voice.stop();showProfiles()});
 map.forEach(([id,k,fm])=>$(id).addEventListener('input',e=>{S.v[k]=parseFloat(e.target.value);$(id+'V').textContent=fm(S.v[k]);S.save();S.apply()}));
 $('bAbout').addEventListener('click',()=>{try{Sfx.init()}catch(e){}open()});$('bSet').addEventListener('click',open);$('bSet2').addEventListener('click',open);
 $('sClose').addEventListener('click',()=>{Sfx.click();Voice.stop();$('settings').hidden=true});
 $('sReset').addEventListener('click',()=>{Object.assign(S.v,{rate:1,voice:1,music:.5,sfx:1});S.save();S.apply();sync()});
 $('sTest').addEventListener('click',()=>{try{Sfx.init();Voice.init();Voice.unlock()}catch(e){}Voice.speak('Поїхали!','max',()=>{})});
 S.apply()})();

$('tTheory').addEventListener('click',()=>{Sfx.click();if(Z)Theory.open(Z.id,'task')});

/* ---------- кнопка «Назад» (Android) ---------- */
(()=>{const vis=id=>{const e=$(id);return e&&!e.hidden};
 function back(){
  const chain=[['settings','sClose'],['theory','thClose'],['thList','zlClose'],['cheat','chClose'],['rank','rBack'],['task','tclose'],['endcard','bMap2']];
  for(const [o,b] of chain){if(vis(o)&&$(b)){$(b).click();return true}}
  if(vis('prof')){$('prof').hidden=true;$('title').hidden=false;return true}
  if(vis('course')){showMap();return true}
  if(vis('map')){if(CUR&&DB.list.length)return false;return false}
  if(G.mode==='run'||G.mode==='intro'||G.mode==='auto'||G.mode==='play'){$('bMap').click();return true}
  return false}
 window.fzBack=back;
 try{const A=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.App;
  if(A&&A.addListener)A.addListener('backButton',()=>{if(!back()){if(vis('map')||vis('title')){if(confirm('Вийти з гри?'))A.exitApp()}else A.exitApp()}})}catch(e){}
})();
