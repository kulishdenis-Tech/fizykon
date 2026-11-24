'use strict';
/* Верстак задач: Дано/СІ → формула → підстановка → калькулятор → запис */
const Tasks=(()=>{
 const PI=3.14;
 let LIST=[];
 const parseNum=s=>{s=String(s).trim().replace(/\s+/g,'').replace(',','.');if(!/^-?\d*\.?\d+$/.test(s))return NaN;return parseFloat(s)};
 const evalExpr=e=>{let s=e.replace(/π/g,'('+PI+')').replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/,/g,'.');if(!s.trim()||!/^[0-9.+\-*/() ]+$/.test(s))return NaN;try{const v=Function('"use strict";return ('+s+')')();return isFinite(v)?v:NaN}catch(x){return NaN}};
 const near=(a,b,t=.006)=>Math.abs(a-b)<=Math.abs(b)*t+1e-9;
 const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
 const shuffle=(a,seed)=>{const R=rng(seed),b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};

 const shufR=a=>{const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
 const RULES={'хв':'1 хв = 60 с','год':'1 год = 3600 с','доба':'1 доба = 86 400 с','доби':'1 доба = 86 400 с','діб':'1 доба = 86 400 с','мс':'1 мс = 0,001 с','см':'1 см = 0,01 м','мм':'1 мм = 0,001 м','дм':'1 дм = 0,1 м','км':'1 км = 1000 м','млн км':'1 млн км = 1 000 000 000 м','г':'1 г = 0,001 кг','т':'1 т = 1000 кг','см²':'1 см² = 0,0001 м²','дм²':'1 дм² = 0,01 м²','см³':'1 см³ = 0,000001 м³','дм³':'1 дм³ = 0,001 м³','л':'1 л = 0,001 м³','кН':'1 кН = 1000 Н','кПа':'1 кПа = 1000 Па','км/год':'км/год ÷ 3,6 = м/с','г/см³':'1 г/см³ = 1000 кг/м³'};
 const nums=e=>(e.match(/\d+(?:[.,]\d+)?/g)||[]);
 const fnum=x=>String(+x.toFixed(6)).replace('.',',');
 const blanks=e=>e.replace(/\d+(?:[.,]\d+)?/g,'▢').replace(/\(▢\)/g,'▢');
 function mkRec(m){const sg=m.given.filter(q=>q.conv&&q.conv!=='—').map(q=>q.conv),ans=fnum(+m.find.ans.toFixed(m.find.round>0?m.find.round:0)),u=m.find.unit;
  return ['Дано: '+m.given.map(q=>q.sym+' = '+q.val+(q.unit?' '+q.unit:'')).join('; '),'Знайти: '+m.find.s+' — ?','СІ: '+(sg.length?sg.join('; '):'усе вже в СІ'),'Формула: '+m.formulas[0].t,'Розв’язання: '+m.find.s+' = '+m.expr.replace(/×/g,'·').replace(/÷/g,'/')+' ≈ '+(m.find.si!=null?fnum(m.find.si)+' '+m.find.siUnit+' = '+ans+' '+u:ans+' '+u),'Відповідь: '+m.find.s+' ≈ '+ans+' '+u]}
 const NAMES=['Дано / СІ','Формула','Підстановка','Калькулятор','Запис'];
 const LV=()=>window.LVL||2,AM=m=>LV()===3?'solo':LV()===1?'assist':m.mode,XM=()=>[0,.9,1,1.3][LV()];
 let S=null,idx=0,onAll=null,totals={xp:0,stars:0,done:0};

 function open(startIdx,cb){idx=Math.min(startIdx||0,LIST.length-1);onAll=cb;$('task').hidden=false;document.body.classList.add('intask');begin()}
 function progress(){return {i:S&&S.completed?Math.min(idx+1,LIST.length):idx,t:{...totals}}}
 function resume(p){totals={...p.t};idx=p.i}
 function close(){$('task').hidden=true;document.body.classList.remove('intask')}
 function notify(){window.onTaskProgress&&window.onTaskProgress(progress())}
 function begin(){const m=LIST[idx];if(m.expr&&m.find&&(!m.rec||m.rec.length<6)){m.rec=mkRec(m)}S={m,e1:0,h1:0,h4:0,found:false,type:m.type||'calc',completed:false,qdone:false,labStarted:false,ci:0,step:1,errs:0,hints:0,msg:'',cls:'',expr:AM(m)==='assist'?'':'',res:'',sel:null,slots:[],opts:shufR((m.formulas||[]).map((f,i)=>i)),qord:shufR((m.opts||[]).map((o,i)=>i)),chipOrd:null,okF:false,sub:false,solved:false};
  S.slots=(m.tpl||[]).filter(x=>typeof x==='object').map(()=>null);
  $('tbadge').textContent=m.title+'  ·  '+(idx+1)+'/'+LIST.length;$('tprog').innerHTML=LIST.map((_,i)=>'<i class="'+(i<idx?'d':i===idx?'c':'')+'"></i>').join('');$('task').scrollTop=0;$('tstory').innerHTML=m.story;render()}
 function steps(){ $('stp').innerHTML='<div class="steps">'+NAMES.map((n,i)=>'<div class="stp '+(i+1<S.step?'done':i+1===S.step?'cur':'')+'">'+(i+1)+'. '+n+'</div>').join('')+'</div>' }
 function gbar(click){const m=S.m;return '<div class="givenbar"><b>Дано (СІ):</b> '+m.given.map(q=>'<button class="gv" '+(click?'data-a="ins" data-v="'+q.si+'"':'disabled')+'>'+q.sym+' = '+esc(q.si)+(q.siUnit?' '+esc(q.siUnit):'')+'</button>').join('')+'<button class="gv" disabled>знайти: '+m.find.s+'</button>'+(click?'<span class="conv"> · тапни, щоб вставити число у вираз</span>':'')+'</div>'}
 function msg(){return '<div class="msg '+S.cls+'" id="msg">'+S.msg+'</div>'}
 function setMsg(t,c){S.msg=t;S.cls=c;const e=$('msg');if(e){e.textContent=t;e.className='msg '+c}}
 function err(t){S.errs++;Sfx.bad();setMsg(t,'bad');const w=$('wb');w.classList.remove('shake');void w.offsetWidth;w.classList.add('shake')}
 function complete(){if(S.completed)return;S.completed=true;const m=S.m;S.st=S.errs===0?3:S.errs<=2?2:1;S.gain=Math.round(m.xp*XM()*Math.max(.4,1-.15*S.errs-.1*S.hints));totals.xp+=S.gain;totals.stars+=S.st;totals.done++;Sfx.ok();notify()}
 function doneHtml(){return '<div class="msg ok">+'+S.gain+' XP · <span class="stars">'+'★'.repeat(S.st)+'☆'.repeat(3-S.st)+'</span></div><button class="btn big" data-a="next">'+(idx<LIST.length-1?'Наступна місія →':'Завершити зону ✓')+'</button>'}
 function renderSpecial(){$('stp').innerHTML='';const w=$('wb'),m=S.m;let h='';
  if(S.type==='quiz'){h='<h3>Обери правильну відповідь</h3>'+S.qord.map(i=>{const o=m.opts[i];return '<button class="opt'+(S.qdone&&o.ok?' ok':'')+(S.bad&&S.bad[i]?' no':'')+'" style="font-family:inherit;font-size:16px" data-a="qo" data-i="'+i+'">'+esc(o.t)+'</button>'}).join('')+msg();if(S.qdone){complete();h+='<p class="conv">'+esc(m.exp)+'</p>'+doneHtml()}w.innerHTML=h}
  else if(S.type==='fill'){h='<h3>Впиши значення</h3>'+m.rows.map((r,i)=>'<div class="g"><span>'+esc(r.l)+'</span><input data-fi="'+i+'" inputmode="decimal" placeholder="число" value="'+esc((S.fv||[])[i]||'')+'"'+(S.completed?' class="ok" disabled':'')+'> <span>'+esc(r.u)+'</span></div>').join('')+msg()+(S.completed?'':'<button class="btn" data-a="fchk">Перевірити</button> <button class="btn ghost" data-a="fhint">Підказка</button>');if(S.completed)h+=doneHtml();w.innerHTML=h}
  else if(S.type==='chain'){const R=m.rows;h='<h3>Крок за кроком</h3>';R.forEach((r,i)=>{if(i<S.ci)h+='<div class="g"><span>✓ '+esc(r.q)+'</span><b>'+esc(String(r.show||r.ans).replace('.',','))+' '+esc(r.u)+'</b></div>';else if(i===S.ci)h+='<p class="conv"><b>Крок '+(i+1)+'/'+R.length+'.</b> '+r.q+'</p><div class="g"><input data-ci inputmode="decimal" placeholder="число"> <span>'+esc(r.u)+'</span></div>'});
   if(S.ci>=R.length){complete();h+=(m.exp?'<p class="conv">'+esc(m.exp)+'</p>':'')+doneHtml()}else h+=msg()+'<button class="btn" data-a="cchk">Перевірити</button> <button class="btn ghost" data-a="chint">Підказка</button>';w.innerHTML=h}
  else if(S.type==='lab'){if(S.completed){w.innerHTML='<h3>Лабораторну виконано</h3>'+doneHtml();return}if(!S.labStarted){S.labStarted=true;w.innerHTML='<div id="labhost"></div>';Labs[m.lab]($('labhost'),errs=>{S.errs=errs;complete();render()},m)}}
 }
 function render(){if(S.type!=='calc')return renderSpecial();steps();const w=$('wb'),m=S.m;let h='';
  if(S.step===1){h='<h3>Крок 1. Запиши «Дано» і переведи в СІ</h3><p class="conv">Введи значення у системі СІ (секунди, метри). Якщо вже в СІ — перепиши як є.</p>'+m.given.map((q,i)=>'<div class="g"><span class="sym">'+q.sym+'</span><span>'+esc(q.name)+' = <b>'+q.val+' '+esc(q.unit)+'</b></span><span>→ у СІ:</span><input data-si="'+i+'" inputmode="decimal" placeholder="число"> <span>'+esc(q.siUnit)+'</span></div>').join('')+'<div class="g"><span class="sym">'+m.find.s+'</span><span>знайти: '+esc(m.find.name)+' ('+esc(m.find.unit)+')</span></div>'+msg()+'<button class="btn" data-a="chk1">Перевірити</button> <button class="btn ghost" data-a="hint1">Підказка</button>'}
  else if(S.step===2){h='<h3>Крок 2. Обери формулу</h3>'+gbar(false)+'<p class="conv">'+esc(m.fhint)+'</p>'+S.opts.map(i=>'<button class="opt'+(S.okF&&i===S.okI?' ok':'')+'" data-a="f" data-i="'+i+'">'+esc(m.formulas[i].t)+'</button>').join('')+msg()+(S.okF?'<button class="btn" data-a="to3">Далі →</button>':'')}
  else if(S.step===3){let k=0;const tp=m.tpl.map(x=>typeof x==='string'?'<span>'+esc(x)+'</span>':'<button class="sl'+(S.slots[k]?' f':'')+'" data-a="slot" data-k="'+(k++)+'">'+(S.slots[k-1]?S.slots[k-1]:'?')+'</button>').join('');
   const used=new Set(S.slots);h='<h3>Крок 3. Підстав величини</h3>'+gbar(false)+'<p class="conv">Тапни величину, потім — порожнє місце у формулі.</p><div class="tpl">'+tp+'</div><div class="chips">'+(S.chipOrd||(S.chipOrd=shufR(m.chips))).map(c=>'<button class="chip2'+(S.sel===c?' sel':'')+(used.has(c)?' used':'')+'" data-a="chip" data-c="'+c+'">'+c+'</button>').join('')+'</div>'+msg()+(S.slots.every(Boolean)?'<button class="btn" data-a="to4">До калькулятора →</button>':'')}
  else if(S.step===4){const rows=[['AC','π','÷','⌫'],['7','8','9','×'],['4','5','6','−'],['1','2','3','+'],['(',')','0',',']];
   h='<h3>Крок 4. Порахуй</h3>'+gbar(true)+'<p class="conv">'+(AM(m)==='assist'?'Шаблон: <b>'+esc(blanks(m.expr))+'</b> — впиши числа з «Дано» (тапни число зверху) і натисни «=». π = 3,14.':'Склади вираз сам(а) за підстановкою. π = 3,14.')+'</p><div class="s4"><div><div class="calc"><div class="disp"><div class="e" id="ce">'+esc(S.expr)+'</div><div class="r" id="cr">'+esc(S.res)+'</div></div><div class="keys">'+rows.flat().map(k=>'<button class="k '+('÷×−+'.includes(k)?'op':k==='AC'||k==='⌫'?'ac':'')+'" data-a="key" data-k="'+k+'">'+k+'</button>').join('')+'<button class="k eq" data-a="key" data-k="=" style="grid-column:span 4">=</button></div></div></div><div class="r4">'
    +'<div class="ans"><button class="btn ghost" data-a="put">↓ Результат у відповідь</button></div><div class="ans"><span><b>'+m.find.s+'</b> =</span><input id="ain" inputmode="decimal" placeholder="відповідь"><select id="aun"><option value="" selected disabled>одиниця</option>'+m.find.units.map(u=>'<option>'+esc(u)+'</option>').join('')+'</select><button class="btn" data-a="chk4">Перевірити</button></div>'+msg()+'<button class="btn ghost" data-a="hint4">'+(AM(m)==='solo'&&LV()===3?'Підказка (−★)':'Підказка')+'</button></div></div>'}
  else if(S.step===5&&!S.found){const sy=[...new Set(m.given.map(q=>q.sym).concat([m.find.s]))];h='<h3>Крок 5. Запис у зошит</h3><p class="conv">Спершу познач, що саме треба знайти в задачі. Тапни величину.</p><div class="chips">'+sy.map(x=>'<button class="chip2" data-a="fnd" data-s="'+x+'">'+x+'</button>').join('')+'</div>'+msg()}
  else if(S.step===5){h='<h3>Крок 5. Запис у зошит</h3><div class="note">'+m.rec.map(r=>{const p=r.split(': ');return '<div>'+(p.length>1?'<b>'+esc(p[0])+':</b> '+esc(p.slice(1).join(': ')):esc(r))+'</div>'}).join('')+'</div><p class="conv">Перевір себе: '+esc(m.sense)+'</p><div class="msg ok">+'+S.gain+' XP · <span class="stars">'+'★'.repeat(S.st)+'☆'.repeat(3-S.st)+'</span></div><button class="btn big" data-a="next">'+(idx<LIST.length-1?'Наступна задача →':'Завершити зону ✓')+'</button>'}
  w.innerHTML=h;
  if(S.step===4&&S.expr&&!S.res){/* assist prefilled */}
 }
 function click(e){const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,m=S.m;Sfx.click();
  if(a==='chk1'){if([...document.querySelectorAll('[data-si]')].every(x=>!x.value.trim()))return setMsg('Спершу впиши значення в СІ.','info');let ok=true;const badi=[];m.given.forEach((q,i)=>{const inp=document.querySelector('[data-si="'+i+'"]'),v=parseNum(inp.value);const good=!isNaN(v)&&(near(v,parseFloat(q.si.replace(',','.')),.001)||(q.si2&&near(v,parseFloat(q.si2.replace(',','.')),.001)));inp.className=good?'ok':'bad';if(!good){ok=false;badi.push(q)}});
   if(ok){Sfx.ok();S.step=2;S.msg='';S.cls='';render()}else{S.e1++;const names=badi.map(q=>q.name).join(', ');
    if(S.e1===1)err('Перевір: '+names+' — це ще не в СІ.');
    else if(S.e1===2)err('Правило: '+badi.map(q=>RULES[q.unit]||('значення '+q.name+' треба перевести в СІ')).join('; ')+'.');
    else err('Переведення: '+badi.map(q=>q.conv!=='—'?q.conv:(q.name+' = '+q.si+' '+q.siUnit)).join('; ')+'.')}}
  else if(a==='hint1'){S.hints++;S.h1++;const cv=m.given.filter(q=>q.conv!=='—');setMsg(!cv.length?'Усе вже в СІ — перепиши числа.':S.h1===1?'Правило: '+cv.map(q=>RULES[q.unit]||q.name+' → в СІ').join('; ')+'.':'Переведення: '+cv.map(q=>q.conv).join('; ')+'.','info')}
  else if(a==='f'){const i=+b.dataset.i;if(m.formulas[i].ok){S.okF=true;S.okI=i;Sfx.ok();S.msg=m.formulas[i].ok;S.cls='ok';render()}else err(m.formulas[i].no)}
  else if(a==='to3'){S.step=3;S.msg='';render()}
  else if(a==='chip'){S.sel=b.dataset.c;render()}
  else if(a==='slot'){const k=+b.dataset.k;if(!S.sel){setMsg('Спочатку тапни величину внизу.','info');return}
   const need=m.tpl.filter(x=>typeof x==='object')[k].v;if(S.sel===need){S.slots[k]=S.sel;S.sel=null;Sfx.coin();S.msg='';S.cls='';render()}else err('Сюди не підходить «'+S.sel+'». Подумай, яка величина стоїть у цьому місці формули.')}
  else if(a==='to4'){S.step=4;S.expr='';S.res='';S.msg='';render()}
  else if(a==='key'){key(b.dataset.k)}
  else if(a==='ins'){[...b.dataset.v].forEach(ch=>key(ch))}
  else if(a==='put'){const v=evalExpr(S.expr);if(isNaN(v)){setMsg('Спочатку склади вираз і натисни «=».','info');return}$('ain').value=fmt(v,m.find.round).replace('.',',');setMsg(m.find.si!=null?'Число вставлено — це ще '+m.find.siUnit+'. Переведи у '+m.find.unit+'.':'Число вставлено — обери одиницю й перевір.','info')}
  else if(a==='hint4'){S.hints++;S.h4++;setMsg(S.h4===1?'Формула: '+m.formulas[0].t+'.':S.h4===2?'Підстановка: '+blanks(m.expr)+' — впиши числа з «Дано» (СІ).':'Вираз: '+m.expr,'info')}
  else if(a==='chk4'){const v=parseNum($('ain').value),u=$('aun').value;if(!$('ain').value.trim())return setMsg('Спершу введи відповідь.','info');if(isNaN(v))return err('Введи відповідь числом (кому можна).');if(!u)return err('Обери одиницю вимірювання.');
   if(m.find.si!=null&&!near(v,m.find.ans)&&near(v,m.find.si)){return err('Це значення в '+m.find.siUnit+'. У задачі питають у '+m.find.unit+' — переведи: '+(m.find.mul>=1?'помнож на ':'поділи на ')+fnum(m.find.mul>=1?m.find.mul:+(1/m.find.mul).toFixed(3))+'.')}
   if(!near(v,m.find.ans))return err(diag(m,v));if(u!==m.find.unit)return err('Число правильне, але одиниця не та. Тут шукаємо '+m.find.name+' — у '+m.find.unit+'.');
   S.st=S.errs+S.hints===0?3:S.errs+S.hints<=2?2:1;S.gain=Math.round(m.xp*XM()*Math.max(.4,1-.15*S.errs-.1*S.hints));if(!S.completed){S.completed=true;totals.xp+=S.gain;totals.stars+=S.st;totals.done++;notify()}Sfx.ok();S.step=5;S.msg='';S.cls='';render()}
  else if(a==='fnd'){if(b.dataset.s===m.find.s){S.found=true;S.msg='';S.cls='';Sfx.ok();render()}else setMsg('Ні, «'+b.dataset.s+'» — це дано. Що в задачі питають?','info')}
  else if(a==='qo'){const i=+b.dataset.i,o=m.opts[i];if(o.ok){S.qdone=true;S.msg='';render()}else{S.bad=S.bad||{};S.bad[i]=1;err(o.why||'Не те. Спробуй ще.');render()}}
  else if(a==='fchk'){S.fv=m.rows.map((r,i)=>document.querySelector('[data-fi="'+i+'"]').value);if(S.fv.every(x=>!String(x).trim()))return setMsg('Спершу впиши відповіді.','info');let ok=true;m.rows.forEach((r,i)=>{const inp=document.querySelector('[data-fi="'+i+'"]'),v=parseNum(inp.value);const good=!isNaN(v)&&near(v,r.ans,.001);inp.className=good?'ok':'bad';if(!good)ok=false});if(ok){S.msg='Усе вірно!';S.cls='ok';complete();render()}else err('Є помилки в позначених рядках. '+m.hint)}
  else if(a==='cchk'){const r=m.rows[S.ci],raw=document.querySelector('[data-ci]').value;if(!raw.trim())return setMsg('Спершу впиши число.','info');const v=parseNum(raw);if(isNaN(v))return err('Впиши число (кома — десятковий роздільник).');const wr=(r.wrong||[]).find(x=>near(v,x.v,.01));if(wr)return err(wr.msg);if(near(v,r.ans,r.tol||.01)){S.ci++;S.msg=r.ok||'Так!';S.cls='ok';Sfx.ok();render()}else err('Не збігається. '+(r.hint||'Перевір обчислення.'))}
  else if(a==='chint'){S.hints++;setMsg(m.rows[S.ci].hint||'',"info")}
  else if(a==='fhint'){S.hints++;setMsg(m.hint,'info')}
  else if(a==='next'){if(idx<LIST.length-1){idx++;begin()}else{close();onAll&&onAll({...totals})}}
 }
 function diag(m,v){const A=m.find.ans;try{let e=m.expr;m.given.forEach(q=>{if(q.val!==q.si&&q.val!=='?'){const a=String(q.si).replace('.',','),b=String(q.val).replace('.',',');e=e.split(a).join(b)}});if(e!==m.expr){const x=evalExpr(e);if(!isNaN(x)&&near(v,x,.01))return 'Схоже, ти не перевів величину в СІ.'}}catch(x){}
  const r=v/A;if(near(r,2,.02)&&m.given.some(q=>/радіус/i.test(q.name)))return 'Схоже, взято діаметр — потрібен радіус (R = d / 2).';
  if(near(r,1000,.03)||near(r,.001,.03))return 'Перевір переведення: множиш чи ділиш на 1000?';if(near(r,60,.03)||near(r,1/60,.03))return 'Перевір переведення: у 1 хвилині 60 секунд.';if(near(r,3.6,.03)||near(r,1/3.6,.03))return 'Перевір переведення км/год ↔ м/с: ділимо чи множимо на 3,6?';
  if(near(r,100,.03)||near(r,.01,.03)||near(r,10000,.03)||near(r,.0001,.03))return 'Перевір переведення см, дм, см², м²: на скільки ділити?';
  if(A&&near(v,1/A,.02))return 'Схоже, поділено навпаки.';return 'Число не збігається. Перевір вираз на калькуляторі ще раз.'}
 function key(k){if(S.res&&k!=='AC'&&k!=='='){const had=S.res;S.res='';if(/[÷×−+]/.test(k))S.expr=(had==='помилка'?'':had);else S.expr=''}
  if(k==='AC'){S.expr='';S.res=''}else if(k==='⌫'){S.expr=S.expr.replace(/\s*[÷×−+]\s*$|.$/,'').trim()}
  else if(k==='='){const v=evalExpr(S.expr);S.res=isNaN(v)?'помилка':fmt(v,4)}
  else if('÷×−+'.includes(k)){S.expr=S.expr.trim()+' '+k+' '}else S.expr+=k;
  $('ce').textContent=S.expr;$('cr').textContent=S.res}
 document.addEventListener('click',e=>{if(!$('task').hidden)click(e)});
 $('tclose').addEventListener('click',()=>{const pr=progress();close();onAll&&onAll(null,pr)});
 return {open,close,progress,resume,setList(l){LIST=l},totals:()=>totals,max:()=>LIST.length*3,reset(){totals={xp:0,stars:0,done:0}}};
})();
