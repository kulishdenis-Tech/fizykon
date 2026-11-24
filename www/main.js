'use strict';
const cv=$('cv'),ctx=cv.getContext('2d');
const CX=3000,STOPX=CX+275,CAMCUT=CX-360;
const NAMES={};
function voc(n){n=(n||'').trim();if(!n)return 'друже';const l=n.slice(-1).toLowerCase(),l2=n.slice(-2,-1).toLowerCase();const V='аеєиіїоуюя';
 if(l==='й'||l==='ь')return n.slice(0,-1)+'ю';if(l==='а')return n.slice(0,-1)+'о';if(l==='я')return n.slice(0,-1)+(V.includes(l2)?'є':'ю');if(l==='о')return n.slice(0,-1)+'е';
 if(V.includes(l))return n;if('гкх'.includes(l)&&false)return n;return n+'е'}
const fillName=t=>String(t).replace(/\{n\}/g,voc(CUR.name||''));
let Z=COURSES[0].zones[0],RUN=0;let CID='phys7';
const COURSE=()=>COURSES.find(c=>c.id===CID)||COURSES[0];
const ZL=()=>COURSE().zones;const NEXTZ=()=>{const l=ZL(),i=l.findIndex(z=>z.id===Z.id);return l[i+1]||null};
const DB=(()=>{try{return JSON.parse(localStorage.getItem('fz4'))||{cur:null,list:[]}}catch(e){return {cur:null,list:[]}}})();
/* міграція збережень: v5 — без віку й статі; резервна копія перед змінами */
(function migrate(){try{if((DB.v||4)>=5)return;const raw=localStorage.getItem('fz4');if(raw){try{localStorage.setItem('fz4_bak_4',raw)}catch(e){}}(DB.list||[]).forEach(p=>{delete p.age;delete p.sex});DB.v=5;localStorage.setItem('fz4',JSON.stringify(DB))}catch(e){}})();
let CUR={name:'',lvl:2,P:{}};const P={};
const saveDB=()=>{try{localStorage.setItem('fz4',JSON.stringify(DB))}catch(e){}};
function detachP(){if(CUR&&CUR.PP&&CUR.PP[CID]===P)CUR.PP[CID]=JSON.parse(JSON.stringify(P))}
function loadP(){Object.keys(P).forEach(k=>delete P[k]);Object.assign(P,CUR.PP[CID]||{});CUR.PP[CID]=P}
function setPlayer(pl){detachP();CUR=pl;DB.cur=pl.id;if(!pl.PP){pl.PP={phys7:pl.P||{}};delete pl.P}
 CID=(pl.course&&COURSES.some(c=>c.id===pl.course&&c.ready))?pl.course:'phys7';loadP();window.LVL=pl.lvl||2;saveDB()}
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
const SPARKS=[];for(let i=0;i<16;i++){const x=520+i*150+(i%3)*30;SPARKS.push({x,y:FEET-70-(i%4===1?95:i%4===3?40:0)})}
const BLOCKS=[780,1330,1880,2300];
const LASTSPARK=Math.max(...SPARKS.map(s=>s.x));

const sparkHud=()=>{$('sparkN').textContent=G.sparks};
const pop=(x,y,t,c)=>{G.pops.push({x,y,t,c,l:1.3})};
let tipTO=0;const tip=(t,ms=3500)=>{const h=$('hint');h.hidden=false;h.textContent=t;clearTimeout(tipTO);tipTO=setTimeout(()=>{if(G.mode==='run')h.textContent='✦ збирай іскри · ▲ перестрибуй фіолетові блоки'},ms)};
/* ---------- speech ---------- */
let skipRes=null;
function say(who,txt,spoken,min=0,nav=null){return new Promise(resolve=>{
 const sub=$('sub'),sk=$('skip');sub.hidden=false;sub.className=who;$('subWho').textContent=who==='giro'?'Гіро':'Макс';$('subTxt').textContent=fillName(txt);sk.classList.remove('ready');
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
 document.querySelectorAll('#pForm [data-lvl]').forEach(b=>b.addEventListener('click',()=>{pForm.lvl=+b.dataset.lvl;document.querySelectorAll('#pForm [data-lvl]').forEach(x=>x.classList.toggle('sel',x===b))}));
 $('pGo').addEventListener('click',()=>{const name=$('pName').value.trim().replace(/\s+/g,' ');
  if(name.length<2){$('pErr').textContent='Напиши своє ім’я.';return}if(!pForm.lvl){$('pErr').textContent='Обери, наскільки ти впевнений(а) у фізиці.';return}
  let old={};if(!DB.list.length){try{old=JSON.parse(localStorage.getItem('fz3'))||{}}catch(e){}}
  const pl={id:'p'+Date.now(),name,lvl:pForm.lvl,P:old};DB.list.push(pl);enterApp(pl)});
 $('bWho').addEventListener('click',()=>{Voice.stop();showProfiles()})}

function showMap(){Music.play('park');RUN++;G.sparks=0;sparkHud();skipRes&&skipRes('abort');Voice.stop();G.mode='map';G.holoK=0;G.beat='';$('ctl').classList.add('hide');$('hint').hidden=true;$('sub').hidden=true;$('play').hidden=true;$('endcard').hidden=true;$('task').hidden=true;
 $('mapList').innerHTML=ZL().map((z,zi)=>{const p=P[z.id];return '<button class="zc" data-z="'+z.id+'" style="--c:'+z.color+'"><span class="zn">ЗОНА '+(zi+1)+' · '+z.par+'</span><b>'+z.name+'</b><small>'+z.blurb+'</small>'+(Theory.data(z.id)?'<span class="thb" data-th="'+z.id+'">📖 Теорія</span>':'')+(p&&p.part?'<span class="thb" data-res="'+z.id+'">▶ Продовжити задачі '+p.part.i+'/'+z.tasks.length+'</span>':'')+'<em>'+(p&&p.max?'★ '+p.stars+'/'+(p.max||6)+' · '+p.xp+' XP ✓':'грати ▸')+'</em></button>'}).join('')+FUTURE.map(z=>'<button class="zc lock" disabled style="--c:'+z.color+'"><span class="zn">'+(z.id===7?'ФІНАЛ':'ЗОНА '+z.id)+' · '+z.par+'</span><b>'+z.name+'</b><small>'+z.blurb+'</small><em>скоро</em></button>').join('');
 const tot=Object.values(P).reduce((q,p)=>q+p.xp,0);$('mapStat').textContent=COURSE().subj+', '+COURSE().grade+' клас · '+(CUR.name?'Гравець: '+CUR.name+' · рівень: '+LVN[CUR.lvl||2]+' · ':'')+'Загалом досвіду: '+tot+' XP';$('map').hidden=false}
async function startZone(id){Z=ZL().find(z=>z.id===id);const tok=++RUN;Art.setTheme(Z.theme);Music.play(Z.theme);document.documentElement.style.setProperty('--zc',Z.color);
 $('map').hidden=true;$('endcard').hidden=true;$('zchip').innerHTML='<b>ЗОНА '+(ZL().findIndex(q=>q.id===Z.id)+1)+'</b><span>'+Z.par+' · '+Z.name+'</span>';
 Object.assign(G,{mode:'intro',px:200,y:0,vy:0,vx:0,face:1,ph:0,keys:{l:0,r:0},sparks:0,got:{},hurt:0,cam:0,camT:0,beat:'',holoK:0,arrived:false,Tmin:99,Tmax:0,unlocked:false,cutDone:false,T:10,Ttarget:10,giroMood:0,fx:[],val:Z.play.val,giroX:300,giroY:380});
 $('sparkN').textContent=0;$('ctl').classList.add('hide');$('hint').hidden=true;$('play').hidden=true;$('goTask').disabled=true;$('goTask').textContent='Покрути повзунок ↑';
 $('plabel').innerHTML=Z.play.label?Z.play.label.replace(/^(\S+)\s(.+)$/,'$1 <b>$2</b>'):'Період <b>T</b>';const sl=$('tslider');sl.min=Z.play.min;sl.max=Z.play.max;sl.step=Z.play.step;sl.value=Z.play.val;$('tval').textContent=Z.play.fmt(Z.play.val);
 Tasks.setList(Z.tasks.map(t=>t.given&&window.LVL!==2?LEVELS(t,window.LVL):t));Tasks.reset();
 for(const l of Z.intro){await say(l[0],l[1],l[2]);if(tok!==RUN)return}
 $('sub').hidden=true;G.mode='run';G.Ttarget=4.2;$('ctl').classList.remove('hide');$('hint').hidden=false;$('hint').textContent='▶ Біжи вправо · ✦ збирай іскри · ▲ перестрибуй фіолетові блоки';
}
function resumeZone(id){Z=ZL().find(z=>z.id===id);++RUN;Art.setTheme(Z.theme);Music.play(Z.theme);document.documentElement.style.setProperty('--zc',Z.color);
 $('map').hidden=true;$('endcard').hidden=true;$('zchip').innerHTML='<b>ЗОНА '+(ZL().findIndex(q=>q.id===Z.id)+1)+'</b><span>'+Z.par+' · '+Z.name+'</span>';
 Object.assign(G,{mode:'task',px:200,y:0,vy:0,vx:0,face:1,ph:0,keys:{l:0,r:0},sparks:0,got:{},hurt:0,cam:0,camT:0,beat:'',holoK:0,arrived:true,Tmin:99,Tmax:0,unlocked:true,cutDone:true,T:4,Ttarget:4,giroMood:0,fx:[],val:Z.play.val,giroX:300,giroY:380});
 Tasks.setList(Z.tasks.map(t=>t.given&&window.LVL!==2?LEVELS(t,window.LVL):t));Tasks.reset();const pr=P[Z.id].part;Tasks.resume(pr);openTasks(pr.i)}
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
 if(!res){if(pr&&pr.i<Z.tasks.length&&(pr.i>0||pr.t.done>0)){const o=P[Z.id]||(P[Z.id]={xp:0,stars:0});o.part=pr;saveP()}showMap();return}
 G.xp=res.xp;G.stars=res.stars;finish()})}
async function finish(){G.mode='end';$('play').hidden=true;Sfx.ok();setTimeout(()=>Sfx.ok(),400);
 const bonus=G.sparks*2+(G.sparks>=SPARKS.length?10:0);G.bonus=bonus;G.xp+=bonus;
 const old=P[Z.id]||{xp:0,stars:0};P[Z.id]={xp:Math.max(old.xp,G.xp),stars:Math.max(old.stars,G.stars),max:Tasks.max()};saveP();window.Rank&&Rank.sync();
 $('endTag').textContent='Отримано деталь Ядра: «'+Z.gem+'»';
 $('endStat').innerHTML='Досвід: <b>+'+G.xp+' XP</b> · зірки за задачі: <b>'+G.stars+'/'+Tasks.max()+'</b><br>іскри: <b>'+G.sparks+'/'+SPARKS.length+'</b> (бонус <b>+'+G.bonus+' XP</b>'+(G.sparks>=SPARKS.length?', усі зібрано!':'')+')';
 $('bNext').hidden=!NEXTZ();{const n=NEXTZ();$('endNext').textContent='Зону «'+Z.name+'» пройдено! '+(n?'Далі: «'+n.name+'».':'Усі зони цього курсу пройдено!')}$('endcard').hidden=false}
$('cList').addEventListener('click',e=>{const b=e.target.closest('.zc');if(!b||b.disabled)return;Sfx.click();setCourse(b.dataset.c);$('course').hidden=true;showMap()});
$('bCourse').addEventListener('click',()=>{Sfx.click();showCourses()});
bindProfiles();$('bPlay').addEventListener('click',startGame);$('verTxt').textContent=GAME_VER;
$('mapList').addEventListener('click',e=>{const rs=e.target.closest('[data-res]');if(rs){Sfx.click();resumeZone(+rs.dataset.res);return}const th=e.target.closest('.thb');if(th&&th.dataset.th){Sfx.click();Theory.open(+th.dataset.th,'map');return}const b=e.target.closest('.zc');if(b&&!b.disabled){Sfx.click();startZone(+b.dataset.z)}});
$('bMap').addEventListener('click',()=>{Sfx.click();if(G.mode==='run'&&G.sparks>0&&!confirm('Вийти на карту? Іскри цього забігу пропадуть.'))return;showMap()});$('bMap2').addEventListener('click',()=>{Sfx.click();showMap()});
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
    pop(bx,FEET-90,lost?'−'+lost+' ✦ Глітч вкрав іскри!':'Глітч-блок! Стрибай ▲','#ff4d8d');G.hits=(G.hits||0)+1;
    if(G.hits===1)tip('⚠ Червоні глітч-блоки крадуть іскри. Перестрибуй їх: пробіл або ▲',4200);
    for(let k=0;k<10;k++)G.fx.push({x:bx,y:FEET-40,vx:(Math.random()-.5)*400,vy:-Math.random()*300,l:.5})}});
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
 const vg=c.createRadialGradient(VW/2,VH/2,VH*.45,VW/2,VH/2,VH*.95);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(3,4,20,.45)');c.fillStyle=vg;c.fillRect(0,0,VW,VH);
}
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;update(dt);if(G.mode!=='task'||!document.body.classList.contains('intask'))draw();requestAnimationFrame(loop)}
Art.init();requestAnimationFrame(loop);
G.debug={teleport(x){G.px=x;G.cam=G.camT=clamp(x-420,0,CAMCUT)},skip(){skipRes&&skipRes()},openTasks};

/* ---------- налаштування ---------- */
(()=>{const S=Settings,f=v=>Math.round(v*100)+'%';
 const map=[['sRate','rate',v=>v.toFixed(2).replace(/0$/,'').replace(/\.$/,'')+'×'],['sVoice','voice',f],['sMusic','music',f],['sSfx','sfx',f]];
 const sync=()=>map.forEach(([id,k,fm])=>{$(id).value=S.v[k];$(id+'V').textContent=fm(S.v[k])});
 const open=()=>{Sfx.click();sync();$('settings').hidden=false};
 map.forEach(([id,k,fm])=>$(id).addEventListener('input',e=>{S.v[k]=parseFloat(e.target.value);$(id+'V').textContent=fm(S.v[k]);S.save();S.apply()}));
 $('bAbout').addEventListener('click',()=>{try{Sfx.init()}catch(e){}open()});$('bSet').addEventListener('click',open);$('bSet2').addEventListener('click',open);
 $('sClose').addEventListener('click',()=>{Sfx.click();Voice.stop();$('settings').hidden=true});
 $('sReset').addEventListener('click',()=>{Object.assign(S.v,{rate:1,voice:1,music:.5,sfx:1});S.save();S.apply();sync()});
 $('sTest').addEventListener('click',()=>{try{Sfx.init();Voice.init();Voice.unlock()}catch(e){}Voice.speak('Поїхали!','max',()=>{})});
 S.apply()})();

$('tTheory').addEventListener('click',()=>{Sfx.click();if(Z)Theory.open(Z.id,'task')});
