'use strict';
/* Екран «Рейтинг»: згода + нік + паралель (5–11), таблиця «Моя паралель» / «Усі». Залежить від main.js (CUR, P, saveDB, showMap) і online.js */
const Rank=(()=>{
 const tot=()=>{let xp=0,st=0;for(const k in P){xp+=(P[k].xp||0);st+=(P[k].stars||0)}return{xp,st}};
 let tab='room',editing=false,pick=0;
 const ADJ=['Швидкий','Сміливий','Хитрий','Мудрий','Веселий','Зоряний','Тихий','Кмітливий','Спритний','Відважний'],ANI=['Лис','Дельфін','Сокіл','Їжак','Бобер','Тигр','Яструб','Ведмідь','Кіт','Пінгвін'];
 const genNick=()=>(ADJ[Math.random()*ADJ.length|0]+ANI[Math.random()*ANI.length|0]+(10+Math.random()*90|0)).slice(0,16);
 const msg=t=>{$('rMsg').textContent=t||''};
 const errText=e=>e&&e.code===403?'Забагато оновлень поспіль — спробуй за кілька секунд.':(e&&e.message==='Failed to fetch'||!navigator.onLine)?'Немає інтернету. Рейтинг оновиться, коли він з’явиться.':'Не вдалося зв’язатися з сервером. Спробуй пізніше.';
 function open(){Sfx.click();$('map').hidden=true;$('rank').hidden=false;editing=false;render()}
 function close(){$('rank').hidden=true;showMap()}
 function render(){
  const o=CUR.online,joined=o&&o.on&&o.grade&&!editing;
  $('rJoin').hidden=!!joined;$('rBoard').hidden=!joined;msg('');
  if(!joined){
   $('rNick').value=(o&&o.nick)||genNick();pick=(o&&o.grade)||0;grades();if(o&&o.on&&!o.grade)msg('Обери свою паралель — рейтинг тепер по класах-паралелях.');
   $('rLeave').hidden=!(o&&o.on);$('rCancel').hidden=!(o&&o.on);return}
  $('rWho').textContent=COURSE().subj+', '+COURSE().grade+' кл. · '+o.nick+' · '+o.grade+' клас';
  $('rTabRoom').hidden=false;$('rTabAll').hidden=false;$('rTabRoom').textContent='Моя паралель ('+o.grade+')';
  $('rTabRoom').classList.toggle('sel',tab==='room');$('rTabAll').classList.toggle('sel',tab==='all');
  load()}
 async function load(){
  const o=CUR.online,box=$('rList');box.innerHTML='<p class="note2">Завантаження…</p>';
  try{
   const l=await (tab==='room'?Online.top(Online.roomOf(o.grade),CID):Online.topAll(CID));
   const me=Online.myId(CUR,CID);box.innerHTML='';
   if(!l.length){box.innerHTML='<p class="note2">Поки нікого. Пройди зону — і ти з’явишся тут!</p>';return}
   l.forEach((r,i)=>{const row=document.createElement('div');row.className='rr'+(r.id===me?' me':'');
    const mk=(c,t)=>{const s=document.createElement('span');s.className=c;s.textContent=t;row.appendChild(s)};
    mk('rn',i<3?['🥇','🥈','🥉'][i]:String(i+1));mk('rnick',r.nick);mk('rxp',r.xp+' XP');mk('rst','★ '+r.stars);box.appendChild(row)});
   msg('')
  }catch(e){box.innerHTML='';msg(errText(e))}}
 async function join(){
  const nick=Online.clean($('rNick').value).slice(0,16),grade=pick,room=grade?Online.roomOf(grade):'';
  if(nick.length<2){msg('Нік має бути від 2 літер.');return}
  if(!grade){msg('Обери свій клас (паралель).');return}
  const prev=CUR.online;CUR.online={on:true,nick,grade,room};
  $('rGo').disabled=true;msg('Підключаємось…');
  try{const t=tot();await Online.push(CUR,t.xp,t.st,CID);saveDB();editing=false;Sfx.ok();render()}
  catch(e){CUR.online=prev;msg(errText(e))}
  finally{$('rGo').disabled=false}}
 async function leave(){
  if(!confirm('Вийти з рейтингу? Твій нік і результат буде видалено з таблиці.'))return;
  try{await Online.leave(CUR,COURSES.map(c=>c.id))}catch(e){msg(errText(e));return}
  CUR.online=null;saveDB();editing=false;render()}
 function sync(){const o=CUR&&CUR.online;if(!o||!o.on)return;const t=tot();Online.push(CUR,t.xp,t.st,CID).then(()=>{CUR.syncErr=0}).catch(e=>{CUR.syncErr=1;try{const m=$('rMsg');if(m){msg(errText(e)+' Натисни «Оновити», щоб повторити.')}}catch(x){}})}
 function grades(){const b=$('rGrade');b.innerHTML=Online.GRADES.map(g=>'<button class="btn ghost'+(g===pick?' sel':'')+'" data-g="'+g+'">'+g+'</button>').join('')}
 function bind(){
  $('rGrade').addEventListener('click',e=>{const b=e.target.closest('[data-g]');if(!b)return;Sfx.click();pick=+b.dataset.g;grades()});
  $('bRank').addEventListener('click',open);$('rBack').addEventListener('click',()=>{Sfx.click();close()});$('rBack2').addEventListener('click',()=>{Sfx.click();close()});
  $('rGo').addEventListener('click',join);$('rLeave').addEventListener('click',leave);
  $('rEdit').addEventListener('click',()=>{editing=true;render()});$('rRefresh').addEventListener('click',()=>{Sfx.click();if(CUR.syncErr)sync();load()});
  $('rTabRoom').addEventListener('click',()=>{tab='room';render()});$('rTabAll').addEventListener('click',()=>{tab='all';render()});
  $('rCancel').addEventListener('click',()=>{editing=false;render()})}
 bind();
 return{sync}
})();
