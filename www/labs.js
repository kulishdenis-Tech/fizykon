
'use strict';
/* Віртуальні лабораторії */
const parseNum=s=>{s=String(s).trim().replace(/\s+/g,'').replace(',','.');if(!/^-?\d*\.?\d+$/.test(s))return NaN;return parseFloat(s)};
const near=(a,b,t=.006)=>Math.abs(a-b)<=Math.abs(b)*t+1e-9;
const Labs={
 /* Лабораторна №2: період і обертова частота (кулька на нитці) */
 rotation(host,done){
  const Tt=+(1.3+Math.random()*.9).toFixed(2);let errs=0,ang0=Math.random()*TAU,t0=performance.now(),run=null,res=null;
  host.innerHTML='<div class="lab"><svg id="labsvg" viewBox="0 0 360 360"><defs><radialGradient id="lg1" cx="35%" cy="30%"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#7df9ff"/><stop offset="1" stop-color="#2b79d6"/></radialGradient></defs><circle cx="180" cy="180" r="140" fill="rgba(93,242,255,.05)" stroke="rgba(125,249,255,.5)" stroke-width="2" stroke-dasharray="6 6"/><line x1="180" y1="180" x2="332" y2="180" stroke="#ff4d8d" stroke-width="4"/><text x="322" y="168" fill="#ff9ec2" font-size="14" font-weight="700" text-anchor="end">лінія старту</text><line id="thr" x1="180" y1="180" x2="320" y2="180" stroke="#cfe6ff" stroke-width="2"/><circle cx="180" cy="180" r="7" fill="#ffd166"/><circle id="ball" r="16" fill="url(#lg1)" stroke="#fff" stroke-width="2"/><text x="180" y="206" fill="#9db0d8" font-size="13" text-anchor="middle">R = 15 см</text></svg>'+
   '<div class="labside"><div class="big"><span>Оберти N:</span> <b id="lN">0</b></div><div class="big"><span>Час t:</span> <b id="lT">0,0</b> с</div>'+
   '<div class="row" style="justify-content:flex-start"><button class="btn" id="lStart">▶ Старт</button><button class="btn ghost" id="lStop" disabled>■ Стоп</button></div>'+
   '<p class="conv" id="lHelp">Натисни «Старт» у момент, коли кулька проходить червону лінію, і «Стоп» — одразу після 10-го оберту (на екрані N = 10).</p>'+
   '<div id="lForm" hidden><p class="conv">Результат: <b id="lRes"></b>. Тепер обчисли самостійно (кома — десятковий роздільник).</p><div class="g"><span class="sym">T =</span><input id="lTin" inputmode="decimal" placeholder="с"> <span>с  (T = t / N)</span></div><div class="g"><span class="sym">n =</span><input id="lNin" inputmode="decimal" placeholder="Гц"> <span>Гц  (n = N / t)</span></div><button class="btn" id="lChk">Перевірити</button></div><div class="msg" id="lMsg"></div></div></div>';
  const $q=s=>host.querySelector(s),ball=$q('#ball'),thr=$q('#thr');
  const msg=(t,c)=>{const e=$q('#lMsg');e.textContent=t;e.className='msg '+(c||'')};
  const ang=now=>ang0+TAU*((now-t0)/1000)/Tt;
  function loop(now){if(!host.isConnected)return;const a=ang(now),x=180+140*Math.cos(a),y=180+140*Math.sin(a);ball.setAttribute('cx',x);ball.setAttribute('cy',y);thr.setAttribute('x2',x);thr.setAttribute('y2',y);
   if(run&&!run.stopped){run.N=Math.max(0,Math.floor((a-run.a0)/TAU));run.t=(now-run.ts)/1000;$q('#lN').textContent=run.N;$q('#lT').textContent=fmt(run.t,1)}
   requestAnimationFrame(loop)}
  requestAnimationFrame(loop);
  $q('#lStart').onclick=()=>{Sfx.click();run={ts:performance.now(),a0:ang(performance.now()),N:0,t:0,stopped:false};$q('#lStart').disabled=true;$q('#lStop').disabled=false;$q('#lForm').hidden=true;msg('')};
  $q('#lStop').onclick=()=>{Sfx.click();if(!run)return;run.stopped=true;run.t=(performance.now()-run.ts)/1000;run.N=Math.max(0,Math.floor((ang(performance.now())-run.a0)/TAU));$q('#lT').textContent=fmt(run.t,1);$q('#lN').textContent=run.N;$q('#lStop').disabled=true;
   if(run.N<5){errs++;Sfx.bad();msg('Замало обертів: порахуй хоча б 5 (краще 10) — так точніше. Спробуй ще раз.','bad');$q('#lStart').disabled=false;return}
   res={N:run.N,t:run.t};$q('#lRes').textContent='N = '+res.N+', t = '+fmt(res.t,1)+' с';$q('#lForm').hidden=false;$q('#lStart').disabled=false;msg('')};
  $q('#lChk').onclick=()=>{if(!res)return;const pT=parseNum($q('#lTin').value),pn=parseNum($q('#lNin').value);const eT=res.t/res.N,en=res.N/res.t;
   if(isNaN(pT)||!near(pT,eT,.03)){errs++;Sfx.bad();return msg('Період T = t / N. Перевір ділення: '+res.N+' обертів за '+fmt(res.t,1)+' с — скільки секунд на один оберт?','bad')}
   if(isNaN(pn)||!near(pn,en,.03)){errs++;Sfx.bad();return msg('Частота n = N / t — обертів за секунду. Ти можеш перевірити: n = 1 / T.','bad')}
   const dev=Math.abs(eT-Tt)/Tt;
   if(dev>.08){errs++;Sfx.bad();msg('Розрахунки вірні, але вимірювання неточне: ти спізнювався з «Стоп» чи «Старт». Повтори вимірювання.','bad');res=null;$q('#lForm').hidden=true;return}
   msg('Чудово! Твоє T = '+fmt(eT,2)+' с, справжнє значення ≈ '+fmt(Tt,2)+' с. Перевірка: n = 1 / T ≈ '+fmt(1/eT,2)+' Гц.','ok');Sfx.ok();setTimeout(()=>done(errs),1800)};
 },
 /* Лабораторна №3: коливання маятника — від чого залежить період */
 pendulum(host,done){
  let errs=0,L=.5,M=100,A=15,ph0=Math.random()*TAU,t0=performance.now(),run=null,res=null,log=[];
  const Tof=l=>2*Math.PI*Math.sqrt(l/9.81);
  const sel=(id,arr,cur,u)=>'<div class="row" style="justify-content:flex-start;gap:6px;flex-wrap:wrap"><span class="conv" style="min-width:86px">'+id+'</span>'+arr.map(v=>'<button class="btn ghost pb" data-p="'+id+'" data-v="'+v+'">'+v+' '+u+'</button>').join('')+'</div>';
  host.innerHTML='<div class="lab"><svg id="pvg" viewBox="0 0 360 300"><rect x="90" y="18" width="180" height="10" rx="4" fill="#6b7bb8"/><line id="pth" x1="180" y1="28" x2="180" y2="200" stroke="#cfe6ff" stroke-width="2"/><circle id="pbob" r="16" fill="#ffd166" stroke="#fff" stroke-width="2"/><text id="plab" x="180" y="290" fill="#9db0d8" font-size="14" text-anchor="middle"></text></svg>'+
  '<div class="labside">'+sel('Довжина',[.25,.5,1],L,'м')+sel('Маса',[50,100,200],M,'г')+sel('Амплітуда',[5,15,30],A,'°')+
  '<div class="big"><span>N:</span> <b id="pN">0</b> &nbsp; <span>t:</span> <b id="pT">0,0</b> с</div>'+
  '<div class="row" style="justify-content:flex-start"><button class="btn" id="pStart">▶ Старт</button><button class="btn ghost" id="pStop" disabled>■ Стоп</button></div>'+
  '<div id="pForm" hidden><p class="conv" id="pRes"></p><div class="g"><span class="sym">T =</span><input id="pTin" inputmode="decimal" placeholder="с"> <span>с (T = t / N)</span> <button class="btn" id="pChk">Записати</button></div></div>'+
  '<div id="pLog" class="conv"></div><div id="pQ" hidden></div><div class="msg" id="pMsg"></div></div></div>';
  const $q=s=>host.querySelector(s),msg=(t,c)=>{$q('#pMsg').textContent=t;$q('#pMsg').className='msg '+(c||'')};
  const mark=()=>{host.querySelectorAll('.pb').forEach(b=>{const k=b.dataset.p,v=+b.dataset.v,cur=k==='Довжина'?L:k==='Маса'?M:A;b.classList.toggle('on',v===cur);b.style.outline=v===cur?'2px solid #7df9ff':'none'});$q('#plab').textContent='l = '+L+' м · m = '+M+' г · амплітуда '+A+'°'};mark();
  const ang=now=>ph0+TAU*((now-t0)/1000)/Tof(L);
  function loop(now){if(!host.isConnected)return;const a=ang(now),th=A*Math.PI/180*Math.sin(a),len=60+L*140+L*20;const x=180+len*Math.sin(th),y=28+len*Math.cos(th);$q('#pth').setAttribute('x2',x);$q('#pth').setAttribute('y2',y);const b=$q('#pbob');b.setAttribute('cx',x);b.setAttribute('cy',y);b.setAttribute('r',10+M/20);
   if(run&&!run.st){run.N=Math.max(0,Math.floor((a-run.a0)/TAU));run.t=(now-run.ts)/1000;$q('#pN').textContent=run.N;$q('#pT').textContent=fmt(run.t,1)}requestAnimationFrame(loop)}
  requestAnimationFrame(loop);
  host.addEventListener('click',e=>{const b=e.target.closest('.pb');if(!b)return;if(run&&!run.st)return msg('Спочатку зупини секундомір.','bad');Sfx.click();const v=+b.dataset.v;if(b.dataset.p==='Довжина')L=v;else if(b.dataset.p==='Маса')M=v;else A=v;ph0=ang(performance.now())-0;t0=performance.now();mark();$q('#pForm').hidden=true;res=null;msg('')});
  $q('#pStart').onclick=()=>{Sfx.click();const n=performance.now();run={ts:n,a0:ang(n),N:0,t:0,st:false};$q('#pN').textContent=0;$q('#pT').textContent='0,0';$q('#pStart').disabled=true;$q('#pStop').disabled=false;$q('#pForm').hidden=true;msg('')};
  $q('#pStop').onclick=()=>{Sfx.click();const n=performance.now();run.st=true;run.t=(n-run.ts)/1000;run.N=Math.max(0,Math.floor((ang(n)-run.a0)/TAU));$q('#pN').textContent=run.N;$q('#pT').textContent=fmt(run.t,1);$q('#pStop').disabled=true;$q('#pStart').disabled=false;
   if(run.N<5){errs++;Sfx.bad();return msg('Замало коливань: порахуй хоча б 5 повних (туди й назад).','bad')}
   res={N:run.N,t:run.t,L,M,A};$q('#pRes').innerHTML='Виміряно: N = <b>'+res.N+'</b>, t = <b>'+fmt(res.t,1)+' с</b>. Знайди період.';$q('#pForm').hidden=false};
  const renderLog=()=>{$q('#pLog').innerHTML=log.length?'<b>Журнал:</b> '+log.map(r=>'l='+r.L+' м, m='+r.M+' г, A='+r.A+'° → T='+fmt(r.T,2)+' с').join(' · '):''};
  $q('#pChk').onclick=()=>{if(!res)return;const v=parseNum($q('#pTin').value),e=res.t/res.N;if(isNaN(v)||!near(v,e,.04)){errs++;Sfx.bad();return msg('T = t / N: час ділимо на кількість повних коливань ('+res.N+').','bad')}
   if(Math.abs(e-Tof(res.L))/Tof(res.L)>.1){errs++;Sfx.bad();res=null;$q('#pForm').hidden=true;return msg('Рахунок вірний, але вимірювання неточне (спізнився з Старт/Стоп). Повтори.','bad')}
   log.push({L:res.L,M:res.M,A:res.A,T:e});res=null;$q('#pForm').hidden=true;$q('#pTin').value='';Sfx.ok();renderLog();
   const dl=new Set(log.map(r=>r.L)).size>1,dm=new Set(log.map(r=>r.M)).size>1,da=new Set(log.map(r=>r.A)).size>1;
   msg('Записано. Змінюй по одному параметру. '+(dl?'✓ довжина ':'· довжина ')+(dm?'✓ маса ':'· маса ')+(da?'✓ амплітуда':'· амплітуда'),'ok');
   if(dl&&dm&&da){const q=$q('#pQ');q.hidden=false;q.innerHTML='<p class="conv"><b>Висновок:</b> від чого залежить період коливань маятника?</p>'+[['Від довжини нитки; від маси й амплітуди — майже ні',1],['Від маси кульки',0],['Від амплітуди',0],['Не залежить ні від чого',0]].map((o,i)=>'<button class="opt" style="font-family:inherit" data-q="'+o[1]+'">'+o[0]+'</button>').join('')}};
  host.addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(!b)return;if(b.dataset.q==='1'){Sfx.ok();b.classList.add('ok');msg('Так! Саме довжина визначає період: чим довша нитка — тим більший T.','ok');setTimeout(()=>done(errs),1500)}else{errs++;Sfx.bad();b.classList.add('no');msg('Подивись у журнал: порівняй рядки, де змінювався лише один параметр.','bad')}});
 },
 /* Лабораторна №4: терези власноруч */
 balance(host,done){
  let errs=0;const M=30+Math.floor(Math.random()*90);const SET=[100,50,20,20,10,5,2,2,1];let on=[];
  host.innerHTML='<div class="lab"><svg viewBox="0 0 360 300"><polygon points="180,120 150,270 210,270" fill="#3a4294"/><g id="beam"><rect x="40" y="112" width="280" height="8" rx="4" fill="#cfe6ff"/><g id="pl"><line x1="60" y1="116" x2="60" y2="170" stroke="#9db0d8"/><rect x="20" y="170" width="80" height="8" rx="3" fill="#7df9ff"/><rect x="42" y="136" width="36" height="34" rx="6" fill="#ff7bd5"/><text x="60" y="158" font-size="13" text-anchor="middle" fill="#06122b" font-weight="700">?</text></g><g id="pr"><line x1="300" y1="116" x2="300" y2="170" stroke="#9db0d8"/><rect x="260" y="170" width="80" height="8" rx="3" fill="#7df9ff"/><text id="prw" x="300" y="162" font-size="13" text-anchor="middle" fill="#ffd166" font-weight="700"></text></g></g><text id="bst" x="180" y="40" font-size="18" text-anchor="middle" fill="#9db0d8" font-weight="700"></text></svg>'+
  '<div class="labside"><p class="conv">Поклади гирьки на праву шальку, щоб терези зрівноважились. Натисни на гирьку на шальці — зніме її.</p><div class="row" id="bSet" style="justify-content:flex-start;gap:6px;flex-wrap:wrap"></div><div class="big"><span>Гирьки:</span> <b id="bSum">0</b> г</div><div class="g"><span class="sym">m =</span><input id="bIn" inputmode="decimal" placeholder="г"> <span>г</span> <button class="btn" id="bChk">Записати</button></div><div class="msg" id="bMsg"></div></div></div>';
  const $q=s=>host.querySelector(s),msg=(t,c)=>{$q('#bMsg').textContent=t;$q('#bMsg').className='msg '+(c||'')};
  const sum=()=>on.reduce((a,i)=>a+SET[i],0);
  function draw(){const s=sum(),d=M-s,tilt=clamp(d/40,-1,1)*10;$q('#beam').setAttribute('transform','rotate('+(-tilt)+' 180 116)');$q('#pl').setAttribute('transform','rotate('+tilt+' 60 116)');$q('#pr').setAttribute('transform','rotate('+tilt+' 300 116)');
   $q('#bSum').textContent=s;$q('#bst').textContent=d===0?'РІВНОВАГА':d>0?'лівий важчий':'правий важчий';$q('#bst').setAttribute('fill',d===0?'#6ee7a8':'#9db0d8');
   $q('#bSet').innerHTML=SET.map((w,i)=>'<button class="btn ghost" style="min-width:52px;padding:8px 10px'+(on.includes(i)?';outline:2px solid #ffd166':'')+'" data-w="'+i+'">'+w+' г'+(on.includes(i)?' ✕':'')+'</button>').join('')}
  draw();
  host.addEventListener('click',e=>{const b=e.target.closest('[data-w]');if(!b)return;Sfx.click();const i=+b.dataset.w;on=on.includes(i)?on.filter(x=>x!==i):on.concat(i);draw();msg('')});
  $q('#bChk').onclick=()=>{const v=parseNum($q('#bIn').value);if(sum()!==M){errs++;Sfx.bad();return msg('Терези ще не зрівноважені — додай або зніми гирьки.','bad')}
   if(isNaN(v)||v!==M){errs++;Sfx.bad();return msg('Терези в рівновазі: маса тіла дорівнює сумі гирьок. Додай значення гирьок на шальці.','bad')}
   Sfx.ok();msg('Так! m = '+M+' г = '+fmt(M/1000,3)+' кг. Рівновага: маса тіла = сума мас гирьок.','ok');setTimeout(()=>done(errs),1700)};
 },
 /* Лабораторна №5: густина тіла (вага + мензурка) */
 density(host,done){
  let errs=0;const MAT=[['алюміній',2.7],['залізо',7.8],['мідь',8.9],['свинець',11.3]];const mt=MAT[Math.floor(Math.random()*4)];const V=[12,15,20,25][Math.floor(Math.random()*4)];const m=+(mt[1]*V).toFixed(1);const V1=40;let w=false,im=false,sel=null;
  host.innerHTML='<div class="lab"><svg viewBox="0 0 360 330"><rect x="30" y="220" width="130" height="14" rx="4" fill="#3a4294"/><rect x="45" y="170" width="100" height="46" rx="6" fill="#12134a" stroke="#7df9ff"/><text id="dsp" x="95" y="202" font-size="22" text-anchor="middle" fill="#7df9ff" font-family="monospace">0.0 г</text><rect id="dbody" x="75" y="130" width="40" height="38" rx="6" fill="#c9d3e8" stroke="#fff"/>'+
  '<rect x="220" y="40" width="90" height="250" rx="8" fill="rgba(125,249,255,.06)" stroke="#9db0d8" stroke-width="3"/><rect id="dwat" x="223" y="290" width="84" height="0" fill="rgba(80,160,255,.55)"/><g id="dtick"></g><rect id="dimm" x="250" y="30" width="30" height="30" rx="5" fill="#c9d3e8" stroke="#fff"/></svg>'+
  '<div class="labside"><div class="row" style="justify-content:flex-start"><button class="btn" id="dW">⚖ Зважити</button><button class="btn" id="dI">⬇ Занурити</button></div><div class="big"><span>m =</span> <b id="dm">—</b> г &nbsp; <span>V₁ =</span> <b>'+V1+'</b> мл &nbsp; <span>V₂ =</span> <b id="dv2">—</b> мл</div><div class="g"><span class="sym">V =</span><input id="dVin" inputmode="decimal" placeholder="см³"><span>см³ (1 мл = 1 см³)</span></div><div class="g"><span class="sym">ρ =</span><input id="dRin" inputmode="decimal" placeholder="г/см³"><span>г/см³ (ρ = m / V)</span></div>'+
  '<p class="conv">Яка це речовина?</p><div class="row" style="justify-content:flex-start;gap:6px;flex-wrap:wrap">'+MAT.map(x=>'<button class="btn ghost" data-mat="'+x[0]+'">'+x[0]+' · '+String(x[1]).replace('.',',')+'</button>').join('')+'</div><button class="btn" id="dChk">Перевірити</button><div class="msg" id="dMsg"></div></div></div>';
  const $q=s=>host.querySelector(s),msg=(t,c)=>{$q('#dMsg').textContent=t;$q('#dMsg').className='msg '+(c||'')};
  const lvl=v=>290-v*2.2;const setW=v=>{const y=lvl(v);$q('#dwat').setAttribute('y',y);$q('#dwat').setAttribute('height',290-y)};setW(V1);
  $q('#dtick').innerHTML=[40,60,80].map(v=>'<line x1="220" x2="232" y1="'+lvl(v)+'" y2="'+lvl(v)+'" stroke="#9db0d8"/><text x="318" y="'+(lvl(v)+4)+'" font-size="12" fill="#9db0d8">'+v+'</text>').join('');
  $q('#dW').onclick=()=>{Sfx.click();w=true;$q('#dm').textContent=String(m).replace('.',',');$q('#dsp').textContent=m.toFixed(1)+' г'};
  $q('#dI').onclick=()=>{Sfx.click();im=true;setW(V1+V);$q('#dv2').textContent=V1+V;$q('#dimm').setAttribute('y',lvl(V1+V)+8)};
  host.addEventListener('click',e=>{const b=e.target.closest('[data-mat]');if(!b)return;Sfx.click();sel=b.dataset.mat;host.querySelectorAll('[data-mat]').forEach(x=>x.style.outline=x===b?'2px solid #7df9ff':'none')});
  $q('#dChk').onclick=()=>{if(!w||!im){errs++;Sfx.bad();return msg('Спершу зваж тіло й зануж його у воду.','bad')}
   const pv=parseNum($q('#dVin').value),pr=parseNum($q('#dRin').value);
   if(isNaN(pv)||pv!==V){errs++;Sfx.bad();return msg('Об’єм тіла = різниця рівнів води: V = V₂ − V₁.','bad')}
   if(isNaN(pr)||!near(pr,mt[1],.03)){errs++;Sfx.bad();return msg('ρ = m / V. Подільте масу на об’єм.','bad')}
   if(sel!==mt[0]){errs++;Sfx.bad();return msg('Порівняй свою густину з таблицею — яка речовина найближча?','bad')}
   Sfx.ok();msg('Так! ρ = '+fmt(mt[1],1)+' г/см³ = '+Math.round(mt[1]*1000)+' кг/м³ — це '+mt[0]+'.','ok');setTimeout(()=>done(errs),1700)};
 }
};
