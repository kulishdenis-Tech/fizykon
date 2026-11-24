'use strict';
/* Екран «Рейтинг»: згода + нік + код класу, таблиця «Мій клас» / «Усі». Залежить від main.js (CUR, P, saveDB, showMap) і online.js */
const Rank=(()=>{
 const tot=()=>{let xp=0,st=0;for(const k in P){xp+=(P[k].xp||0);st+=(P[k].stars||0)}return{xp,st}};
 let tab='room',editing=false;
 const firstWord=n=>String(n||'').trim().split(' ')[0].slice(0,16);
 const msg=t=>{$('rMsg').textContent=t||''};
 const errText=e=>e&&e.code===403?'Забагато оновлень поспіль — спробуй за кілька секунд.':(e&&e.message==='Failed to fetch'||!navigator.onLine)?'Немає інтернету. Рейтинг оновиться, коли він з’явиться.':'Не вдалося зв’язатися з сервером. Спробуй пізніше.';
 function open(){Sfx.click();$('map').hidden=true;$('rank').hidden=false;editing=false;render()}
 function close(){$('rank').hidden=true;showMap()}
 function render(){
  const o=CUR.online,joined=o&&o.on&&!editing;
  $('rJoin').hidden=!!joined;$('rBoard').hidden=!joined;msg('');
  if(!joined){
   $('rNick').value=(o&&o.nick)||firstWord(CUR.name);$('rRoom').value=(o&&o.room)||'';
   $('rLeave').hidden=!(o&&o.on);$('rCancel').hidden=!(o&&o.on);return}
  $('rWho').textContent=o.nick+(o.room?' · клас '+o.room:'');
  $('rTabRoom').hidden=!o.room;if(!o.room)tab='all';
  $('rTabRoom').classList.toggle('sel',tab==='room');$('rTabAll').classList.toggle('sel',tab==='all');
  load()}
 async function load(){
  const o=CUR.online,box=$('rList');box.innerHTML='<p class="note2">Завантаження…</p>';
  try{
   const l=await Online.top(tab==='room'?o.room:'');
   const me=Online.myId(CUR);box.innerHTML='';
   if(!l.length){box.innerHTML='<p class="note2">Поки нікого. Пройди зону — і ти з’явишся тут!</p>';return}
   l.forEach((r,i)=>{const row=document.createElement('div');row.className='rr'+(r.id===me?' me':'');
    const mk=(c,t)=>{const s=document.createElement('span');s.className=c;s.textContent=t;row.appendChild(s)};
    mk('rn',i<3?['🥇','🥈','🥉'][i]:String(i+1));mk('rnick',r.nick);mk('rxp',r.xp+' XP');mk('rst','★ '+r.stars);box.appendChild(row)});
   msg('')
  }catch(e){box.innerHTML='';msg(errText(e))}}
 async function join(){
  const nick=Online.clean($('rNick').value).slice(0,16),room=Online.normRoom($('rRoom').value);
  if(nick.length<2){msg('Нік має бути від 2 літер.');return}
  const prev=CUR.online;CUR.online={on:true,nick,room};
  $('rGo').disabled=true;msg('Підключаємось…');
  try{const t=tot();await Online.push(CUR,t.xp,t.st);saveDB();editing=false;Sfx.ok();render()}
  catch(e){CUR.online=prev;msg(errText(e))}
  finally{$('rGo').disabled=false}}
 async function leave(){
  if(!confirm('Вийти з рейтингу? Твій нік і результат буде видалено з таблиці.'))return;
  try{await Online.leave(CUR)}catch(e){if(e.code!==404){msg(errText(e));return}}
  CUR.online=null;saveDB();editing=false;render()}
 function sync(){const o=CUR&&CUR.online;if(!o||!o.on)return;const t=tot();Online.push(CUR,t.xp,t.st).catch(()=>{})}
 function bind(){
  $('bRank').addEventListener('click',open);$('rBack').addEventListener('click',()=>{Sfx.click();close()});$('rBack2').addEventListener('click',()=>{Sfx.click();close()});
  $('rGo').addEventListener('click',join);$('rLeave').addEventListener('click',leave);
  $('rEdit').addEventListener('click',()=>{editing=true;render()});$('rRefresh').addEventListener('click',()=>{Sfx.click();load()});
  $('rTabRoom').addEventListener('click',()=>{tab='room';render()});$('rTabAll').addEventListener('click',()=>{tab='all';render()});
  $('rCancel').addEventListener('click',()=>{editing=false;render()})}
 bind();
 return{sync}
})();
