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
 const NAMES=['Дано / СІ','Формула','Підстановка','Калькулятор','Запис'];
 const LV=()=>window.LVL||2,AM=m=>LV()===3?'solo':LV()===1?'assist':m.mode,XM=()=>[0,.9,1,1.3][LV()];
 let S=null,idx=0,onAll=null,totals={xp:0,stars:0,done:0};

 function open(startIdx,cb){idx=startIdx||0;onAll=cb;$('task').hidden=false;document.body.classList.add('intask');begin()}
 function close(){$('task').hidden=true;document.body.classList.remove('intask')}
 function begin(){const m=LIST[idx];S={m,type:m.type||'calc',completed:false,qdone:false,labStarted:false,ci:0,step:1,errs:0,hints:0,msg:'',cls:'',expr:AM(m)==='assist'?'':'',res:'',sel:null,slots:[],opts:shuffle((m.formulas||[]).map((f,i)=>i),idx+11),okF:false,sub:false,solved:false};
  S.slots=(m.tpl||[]).filter(x=>typeof x==='object').map(()=>null);
  $('tbadge').textContent=m.title+'  ·  '+(idx+1)+'/'+LIST.length;$('tprog').innerHTML=LIST.map((_,i)=>'<i class="'+(i<idx?'d':i===idx?'c':'')+'"></i>').join('');$('task').scrollTop=0;$('tstory').innerHTML=m.story;render()}
 function steps(){ $('stp').innerHTML='<div class="steps">'+NAMES.map((n,i)=>'<div class="stp '+(i+1<S.step?'done':i+1===S.step?'cur':'')+'">'+(i+1)+'. '+n+'</div>').join('')+'</div>' }
 function gbar(click){const m=S.m;return '<div class="givenbar"><b>Дано (СІ):</b> '+m.given.map(q=>'<button class="gv" '+(click?'data-a="ins" data-v="'+q.si+'"':'disabled')+'>'+q.sym+' = '+esc(q.si)+(q.siUnit?' '+esc(q.siUnit):'')+'</button>').join('')+'<button class="gv" disabled>знайти: '+m.find.s+'</button>'+(click?'<span class="conv"> · тапни, щоб вставити число у вираз</span>':'')+'</div>'}
 function msg(){return '<div class="msg '+S.cls+'" id="msg">'+S.msg+'</div>'}
 function setMsg(t,c){S.msg=t;S.cls=c;const e=$('msg');if(e){e.textContent=t;e.className='msg '+c}}
 function err(t){S.errs++;Sfx.bad();setMsg(t,'bad');const w=$('wb');w.classList.remove('shake');void w.offsetWidth;w.classList.add('shake')}
 function complete(){if(S.completed)return;S.completed=true;const m=S.m;S.st=S.errs===0?3:S.errs<=2?2:1;S.gain=Math.round(m.xp*XM()*Math.max(.4,1-.15*S.errs-.1*S.hints));totals.xp+=S.gain;totals.stars+=S.st;totals.done++;Sfx.ok()}
 function doneHtml(){return '<div class="msg ok">+'+S.gain+' XP · <span class="stars">'+'★'.repeat(S.st)+'☆'.repeat(3-S.st)+'</span></div><button class="btn big" data-a="next">'+(idx<LIST.length-1?'Наступна місія →':'Завершити зону ✓')+'</button>'}
 function renderSpecial(){$('stp').innerHTML='';const w=$('wb'),m=S.m;let h='';
  if(S.type==='quiz'){h='<h3>Обери правильну відповідь</h3>'+m.opts.map((o,i)=>'<button class="opt'+(S.qdone&&o.ok?' ok':'')+(S.bad&&S.bad[i]?' no':'')+'" style="font-family:inherit;font-size:16px" data-a="qo" data-i="'+i+'">'+esc(o.t)+'</button>').join('')+msg();if(S.qdone){complete();h+='<p class="conv">'+esc(m.exp)+'</p>'+doneHtml()}w.innerHTML=h}
  else if(S.type==='fill'){h='<h3>Впиши значення</h3>'+m.rows.map((r,i)=>'<div class="g"><span>'+esc(r.l)+'</span><input data-fi="'+i+'" inputmode="decimal" placeholder="число" value="'+esc((S.fv||[])[i]||'')+'"'+(S.completed?' class="ok" disabled':'')+'> <span>'+esc(r.u)+'</span></div>').join('')+msg()+(S.completed?'':'<button class="btn" data-a="fchk">Перевірити</button> <button class="btn ghost" data-a="fhint">Підказка</button>');if(S.completed)h+=doneHtml();w.innerHTML=h}
  else if(S.type==='chain'){const R=m.rows;h='<h3>Крок за кроком</h3>';R.forEach((r,i)=>{if(i<S.ci)h+='<div class="g"><span>✓ '+esc(r.q)+'</span><b>'+esc(String(r.show||r.ans).replace('.',','))+' '+esc(r.u)+'</b></div>';else if(i===S.ci)h+='<p class="conv"><b>Крок '+(i+1)+'/'+R.length+'.</b> '+r.q+'</p><div class="g"><input data-ci inputmode="decimal" placeholder="число"> <span>'+esc(r.u)+'</span></div>'});
   if(S.ci>=R.length){complete();h+=(m.exp?'<p class="conv">'+esc(m.exp)+'</p>':'')+doneHtml()}else h+=msg()+'<button class="btn" data-a="cchk">Перевірити</button> <button class="btn ghost" data-a="chint">Підказка</button>';w.innerHTML=h}
  else if(S.type==='lab'){if(S.completed){w.innerHTML='<h3>Лабораторну виконано</h3>'+doneHtml();return}if(!S.labStarted){S.labStarted=true;w.innerHTML='<div id="labhost"></div>';Labs[m.lab]($('labhost'),errs=>{S.errs=errs;complete();render()})}}
 }
 function render(){if(S.type!=='calc')return renderSpecial();steps();const w=$('wb'),m=S.m;let h='';
  if(S.step===1){h='<h3>Крок 1. Запиши «Дано» і переведи в СІ</h3><p class="conv">Введи значення у системі СІ (секунди, метри). Якщо вже в СІ — перепиши як є.</p>'+m.given.map((q,i)=>'<div class="g"><span class="sym">'+q.sym+'</span><span>'+esc(q.name)+' = <b>'+q.val+' '+esc(q.unit)+'</b></span><span>→ у СІ:</span><input data-si="'+i+'" inputmode="decimal" placeholder="число"> <span>'+esc(q.siUnit)+'</span></div>').join('')+'<div class="g"><span class="sym">'+m.find.s+'</span><span>знайти: '+esc(m.find.name)+' ('+esc(m.find.unit)+')</span></div>'+msg()+'<button class="btn" data-a="chk1">Перевірити</button> <button class="btn ghost" data-a="hint1">Підказка</button>'}
  else if(S.step===2){h='<h3>Крок 2. Обери формулу</h3>'+gbar(false)+'<p class="conv">'+esc(m.fhint)+'</p>'+S.opts.map(i=>'<button class="opt'+(S.okF&&i===S.okI?' ok':'')+'" data-a="f" data-i="'+i+'">'+esc(m.formulas[i].t)+'</button>').join('')+msg()+(S.okF?'<button class="btn" data-a="to3">Далі →</button>':'')}
  else if(S.step===3){let k=0;const tp=m.tpl.map(x=>typeof x==='string'?'<span>'+esc(x)+'</span>':'<button class="sl'+(S.slots[k]?' f':'')+'" data-a="slot" data-k="'+(k++)+'">'+(S.slots[k-1]?S.slots[k-1]:'?')+'</button>').join('');
   const used=new Set(S.slots);h='<h3>Крок 3. Підстав величини</h3>'+gbar(false)+'<p class="conv">Тапни величину, потім — порожнє місце у формулі.</p><div class="tpl">'+tp+'</div><div class="chips">'+shuffle(m.chips,idx+3).map(c=>'<button class="chip2'+(S.sel===c?' sel':'')+(used.has(c)?' used':'')+'" data-a="chip" data-c="'+c+'">'+c+'</button>').join('')+'</div>'+msg()+(S.slots.every(Boolean)?'<button class="btn" data-a="to4">До калькулятора →</button>':'')}
  else if(S.step===4){const rows=[['AC','π','÷','⌫'],['7','8','9','×'],['4','5','6','−'],['1','2','3','+']];
   h='<h3>Крок 4. Порахуй</h3>'+gbar(true)+'<p class="conv">'+(AM(m)==='assist'?'Вираз уже введено — натисни «=».':'Склади вираз сам(а) за підстановкою. π = 3,14.')+'</p><div class="s4"><div><div class="calc"><div class="disp"><div class="e" id="ce">'+esc(S.expr)+'</div><div class="r" id="cr">'+esc(S.res)+'</div></div><div class="keys">'+rows.flat().map(k=>'<button class="k '+('÷×−+'.includes(k)?'op':k==='AC'||k==='⌫'?'ac':'')+'" data-a="key" data-k="'+k+'">'+k+'</button>').join('')+'<button class="k" data-a="key" data-k="0">0</button><button class="k" data-a="key" data-k=",">,</button><button class="k eq" data-a="key" data-k="=" style="grid-column:span 2">=</button></div></div></div><div class="r4">'
    +'<div class="ans"><button class="btn ghost" data-a="put">↓ Результат у відповідь</button></div><div class="ans"><span><b>'+m.find.s+'</b> =</span><input id="ain" inputmode="decimal" placeholder="відповідь"><select id="aun"><option value="" selected disabled>одиниця</option>'+m.find.units.map(u=>'<option>'+esc(u)+'</option>').join('')+'</select><button class="btn" data-a="chk4">Перевірити</button></div>'+msg()+'<button class="btn ghost" data-a="hint4">Підказка (вираз)</button></div></div>'}
  else if(S.step===5){h='<h3>Крок 5. Запис у зошит</h3><div class="note">'+m.rec.map(r=>{const p=r.split(': ');return '<div><b>'+esc(p[0])+':</b> '+esc(p.slice(1).join(': '))+'</div>'}).join('')+'</div><p class="conv">Перевір себе: '+esc(m.sense)+'</p><div class="msg ok">+'+S.gain+' XP · <span class="stars">'+'★'.repeat(S.st)+'☆'.repeat(3-S.st)+'</span></div><button class="btn big" data-a="next">'+(idx<LIST.length-1?'Наступна задача →':'Завершити зону ✓')+'</button>'}
  w.innerHTML=h;
  if(S.step===4&&S.expr&&!S.res){/* assist prefilled */}
 }
 function click(e){const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,m=S.m;Sfx.click();
  if(a==='chk1'){let ok=true;m.given.forEach((q,i)=>{const inp=document.querySelector('[data-si="'+i+'"]'),v=parseNum(inp.value);const good=!isNaN(v)&&near(v,parseFloat(q.si.replace(',','.')),.001);inp.className=good?'ok':'bad';if(!good)ok=false});
   if(ok){Sfx.ok();S.step=2;S.msg='';S.cls='';render()}else err('Перевір значення в СІ: '+m.given.filter(q=>q.conv!=='—').map(q=>q.conv).join('; ')+(m.given.every(q=>q.conv==='—')?' Просто перепиши числа.':''))}
  else if(a==='hint1'){S.hints++;setMsg(m.given.filter(q=>q.conv!=='—').map(q=>q.conv).join('; ')||'Усе вже в СІ — перепиши числа.','info')}
  else if(a==='f'){const i=+b.dataset.i;if(m.formulas[i].ok){S.okF=true;S.okI=i;Sfx.ok();S.msg=m.formulas[i].ok;S.cls='ok';render()}else err(m.formulas[i].no)}
  else if(a==='to3'){S.step=3;S.msg='';render()}
  else if(a==='chip'){S.sel=b.dataset.c;render()}
  else if(a==='slot'){const k=+b.dataset.k;if(!S.sel){setMsg('Спочатку тапни величину внизу.','info');return}
   const need=m.tpl.filter(x=>typeof x==='object')[k].v;if(S.sel===need){S.slots[k]=S.sel;S.sel=null;Sfx.coin();S.msg='';S.cls='';render()}else err('Сюди не підходить «'+S.sel+'». Подумай, яка величина стоїть у цьому місці формули.')}
  else if(a==='to4'){S.step=4;S.expr=AM(m)==='assist'?m.expr:'';S.res='';S.msg='';render()}
  else if(a==='key'){key(b.dataset.k)}
  else if(a==='ins'){[...b.dataset.v].forEach(ch=>key(ch))}
  else if(a==='put'){const v=evalExpr(S.expr);if(isNaN(v)){setMsg('Спочатку склади вираз і натисни «=».','info');return}$('ain').value=fmt(v,m.find.round).replace('.',',');setMsg('Число вставлено — обери одиницю й перевір.','info')}
  else if(a==='hint4'){S.hints++;setMsg('Вираз: '+m.expr,'info')}
  else if(a==='chk4'){const v=parseNum($('ain').value),u=$('aun').value;if(isNaN(v))return err('Введи відповідь числом (кому можна).');if(!u)return err('Обери одиницю вимірювання.');
   if(!near(v,m.find.ans))return err('Число не збігається. Перевір вираз на калькуляторі ще раз.');if(u!==m.find.unit)return err('Число правильне, але одиниця не така. Швидкість — м/с, період — с.');
   S.st=S.errs+S.hints===0?3:S.errs+S.hints<=2?2:1;S.gain=Math.round(m.xp*XM()*Math.max(.4,1-.15*S.errs-.1*S.hints));totals.xp+=S.gain;totals.stars+=S.st;totals.done++;Sfx.ok();S.step=5;render()}
  else if(a==='qo'){const i=+b.dataset.i,o=m.opts[i];if(o.ok){S.qdone=true;S.msg='';render()}else{S.bad=S.bad||{};S.bad[i]=1;err(o.why||'Не те. Спробуй ще.');render()}}
  else if(a==='fchk'){S.fv=m.rows.map((r,i)=>document.querySelector('[data-fi="'+i+'"]').value);let ok=true;m.rows.forEach((r,i)=>{const inp=document.querySelector('[data-fi="'+i+'"]'),v=parseNum(inp.value);const good=!isNaN(v)&&near(v,r.ans,.001);inp.className=good?'ok':'bad';if(!good)ok=false});if(ok){S.msg='Усе вірно!';S.cls='ok';complete();render()}else err('Є помилки — перевір множення. '+m.hint)}
  else if(a==='cchk'){const r=m.rows[S.ci],v=parseNum(document.querySelector('[data-ci]').value);if(isNaN(v))return err('Впиши число (кома — десятковий роздільник).');const wr=(r.wrong||[]).find(x=>near(v,x.v,.01));if(wr)return err(wr.msg);if(near(v,r.ans,r.tol||.01)){S.ci++;S.msg=r.ok||'Так!';S.cls='ok';Sfx.ok();render()}else err('Не збігається. '+(r.hint||'Перевір обчислення.'))}
  else if(a==='chint'){S.hints++;setMsg(m.rows[S.ci].hint||'',"info")}
  else if(a==='fhint'){S.hints++;setMsg(m.hint,'info')}
  else if(a==='next'){if(idx<LIST.length-1){idx++;begin()}else{close();onAll&&onAll({...totals})}}
 }
 function key(k){if(S.res&&k!=='AC'&&k!=='='){const had=S.res;S.res='';if(/[÷×−+]/.test(k))S.expr=(had==='помилка'?'':had);else S.expr=''}
  if(k==='AC'){S.expr='';S.res=''}else if(k==='⌫'){S.expr=S.expr.replace(/\s*[÷×−+]\s*$|.$/,'').trim()}
  else if(k==='='){const v=evalExpr(S.expr);S.res=isNaN(v)?'помилка':fmt(v,4)}
  else if('÷×−+'.includes(k)){S.expr=S.expr.trim()+' '+k+' '}else S.expr+=k;
  $('ce').textContent=S.expr;$('cr').textContent=S.res}
 document.addEventListener('click',e=>{if(!$('task').hidden)click(e)});
 $('tclose').addEventListener('click',()=>{close();onAll&&onAll(null)});
 return {open,close,setList(l){LIST=l},totals:()=>totals,max:()=>LIST.length*3,reset(){totals={xp:0,stars:0,done:0}}};
})();
