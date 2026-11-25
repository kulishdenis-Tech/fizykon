'use strict';
/* Універсальна віртуальна лабораторна: кнопки вимірювань → введення результату. Дані — LABGEN[id]() */
const rpick=a=>a[Math.floor(Math.random()*a.length)];
const LABGEN={
 v_cart(){const v=rpick([.2,.25,.4,.5]),t=rpick([4,5,6,8,10]),l=+(v*t).toFixed(2);return{icon:'🛒',intro:'Візок їде рівномірно. Виміряй шлях лінійкою й час секундоміром, тоді знайди швидкість.',reads:[{l:'Шлях l',v:l,u:'м',b:'📏 Виміряти шлях'},{l:'Час t',v:t,u:'с',b:'⏱ Виміряти час'}],asks:[{l:'v =',u:'м/с',a:l/t,bad:'v = l / t. Поділи шлях на час.'}],ok:'v = l / t = '+fmt(l/t,2)+' м/с.'}},
 v_ball(){const l=rpick([1.2,1.5,1.8,2.4]),t=rpick([3,4,5,6]);return{icon:'⚽',intro:'Кулька котиться жолобом. Знайди її середню швидкість: весь шлях ділимо на весь час.',reads:[{l:'Шлях l',v:l,u:'м',b:'📏 Виміряти шлях'},{l:'Час t',v:t,u:'с',b:'⏱ Виміряти час'}],asks:[{l:'v сер =',u:'м/с',a:l/t,bad:'v сер = l / t.'}],ok:'v сер = l / t = '+fmt(l/t,2)+' м/с.'}},
 v_stick(){const m1=rpick([2,3,4]),v1=rpick([2,3,4,5]),m2=rpick([2,3,6]),v=m1*v1/(m1+m2);return{icon:'🛷',intro:'Візок m₁ наїжджає на нерухомий візок m₂ й зчіплюється з ним. Знайди швидкість пари: m₁v₁ = (m₁ + m₂)v.',reads:[{l:'Маса m₁',v:m1,u:'кг',b:'⚖ Маса першого'},{l:'Швидкість v₁',v:v1,u:'м/с',b:'⏱ Швидкість першого'},{l:'Маса m₂',v:m2,u:'кг',b:'⚖ Маса другого'}],asks:[{l:'v =',u:'м/с',a:v,bad:'Імпульс до = імпульс після: v = m₁v₁ / (m₁ + m₂).'}],ok:'v = '+m1+'·'+v1+' / ('+m1+'+'+m2+') = '+fmt(v,2)+' м/с.'}},
 f_two(){const F1=rpick([4,5,6,8]),F2=rpick([1,2,3]);return{icon:'🧲',intro:'Кільце тягнуть у протилежні боки двома динамометрами. Знайди рівнодійну.',reads:[{l:'Динамометр ліворуч F₁',v:F1,u:'Н',b:'🔍 Показ ліворуч'},{l:'Динамометр праворуч F₂',v:F2,u:'Н',b:'🔍 Показ праворуч'}],asks:[{l:'R =',u:'Н',a:F1-F2,bad:'Сили протилежні: від більшої відніми меншу.'}],ok:'R = '+F1+' − '+F2+' = '+(F1-F2)+' Н, у бік більшої сили.'}},
 k_spring(){const k=rpick([50,100,200,250]),F=rpick([2,3,4,5]),x=+(F/k*100).toFixed(2);return{icon:'🌀',intro:'Підвісили вантаж: динамометр показав силу, лінійка — видовження пружини. Знайди жорсткість k = F / x. Видовження переведи в метри!',reads:[{l:'Сила F',v:F,u:'Н',b:'🔍 Зняти силу'},{l:'Видовження x',v:x,u:'см',b:'📏 Виміряти видовження'}],asks:[{l:'k =',u:'Н/м',a:k,bad:'k = F / x, видовження — у метрах (см ÷ 100).'}],ok:'k = '+F+' / '+(x/100)+' = '+k+' Н/м.'}},
 m_dyn(){const m=rpick([.2,.3,.45,.6,.75]),F=m*10;return{icon:'⚖️',intro:'Тіло висить на динамометрі в спокої. Динамометр показав вагу. Знайди масу (g = 10 Н/кг).',reads:[{l:'Вага P',v:F,u:'Н',b:'🔍 Зняти показ'}],asks:[{l:'m =',u:'кг',a:m,bad:'m = P / g = P / 10.'}],ok:'m = '+fmt(F,2)+' / 10 = '+fmt(m,2)+' кг.'}},
 mu_slide(){const m=rpick([.2,.4,.5]),mu=rpick([.2,.25,.3,.4]),P=m*10,F=+(mu*P).toFixed(3);return{icon:'🧱',intro:'Брусок рівномірно тягнуть по столу. Динамометр показує силу тяги (вона дорівнює силі тертя). Вага бруска відома. Знайди μ = F / P.',reads:[{l:'Вага бруска P',v:P,u:'Н',b:'🔍 Вага бруска'},{l:'Сила тяги F',v:F,u:'Н',b:'🔍 Сила тяги'}],asks:[{l:'μ =',u:'',a:mu,bad:'μ = F / N, де N = P на горизонтальному столі.'}],ok:'μ = '+fmt(F,2)+' / '+fmt(P,1)+' = '+fmt(mu,2)+'.'}},
 p_block(){const m=rpick([1.2,1.5,2.4,3]),l=rpick([10,12,15,20]),d=rpick([5,6,8,10]),p=m*10/(l*d/10000);return{icon:'🧱',intro:'Брусок лежить на столі. Знайди тиск p = F / S, де F = mg (g = 10 Н/кг), S = l · d. Площу переводь у м² (1 см² = 0,0001 м²).',reads:[{l:'Маса m',v:m,u:'кг',b:'⚖ Маса'},{l:'Довжина l',v:l,u:'см',b:'📏 Довжина'},{l:'Ширина d',v:d,u:'см',b:'📏 Ширина'}],asks:[{l:'p =',u:'Па',a:p,bad:'F = m·10, S = l·d у м². p = F / S.'}],ok:'p = '+(m*10)+' / '+fmt(l*d/10000,4)+' = '+Math.round(p)+' Па.'}},
 p_liquid(){const L=rpick([['вода',1000],['гас',800],['олія',900],['ртуть',13600]]),hg=L[0]==='ртуть',h=hg?rpick([2,5,10,20]):rpick([2,5,8,12,20]),hm=hg?h/100:h,p=Math.round(L[1]*10*hm);return{icon:'🤿',intro:'Датчик тиску занурили в рідину. Знайди тиск p = ρgh (g = 10 Н/кг).'+(hg?' Глибину переведи в метри.':''),reads:[{l:'Рідина',v:L[0]+', ρ = '+L[1],u:'кг/м³',b:'🧪 Рідина'},{l:'Глибина h',v:h,u:hg?'см':'м',b:'📏 Глибина'}],asks:[{l:'p =',u:'Па',a:p,bad:'p = ρ · g · h = ρ · 10 · h (h — у метрах).'}],ok:'p = '+L[1]+'·10·'+hm+' = '+p+' Па.'}},
 u_tube(){const r2=900,h1=rpick([9,18,27,36]),h2=1000*h1/r2;return{icon:'🧪',intro:'У U-подібній трубці зліва вода, справа олія. Знайди висоту олії: ρ₁h₁ = ρ₂h₂. Відповідь у сантиметрах.',reads:[{l:'Висота води h₁',v:h1,u:'см',b:'📏 Висота води'},{l:'Густина олії ρ₂',v:r2,u:'кг/м³',b:'🔍 Густина олії'}],asks:[{l:'h₂ =',u:'см',a:h2,bad:'h₂ = ρ₁h₁ / ρ₂, ρ₁ = 1000 кг/м³ (вода).'}],ok:'h₂ = 1000·'+h1+' / '+r2+' = '+fmt(h2,1)+' см.'}},
 press_lab(){const F=rpick([20,50,100]),S1=rpick([5,10,20]),S2=rpick([100,200,400]),F2=F*S2/S1;return{icon:'🏗',intro:'Гідравлічний прес на стенді. Знайди силу на великому поршні: F₂ / F₁ = S₂ / S₁.',reads:[{l:'Сила F₁',v:F,u:'Н',b:'🔍 Сила на малий'},{l:'Площа S₁',v:S1,u:'см²',b:'📏 Площа малого'},{l:'Площа S₂',v:S2,u:'см²',b:'📏 Площа великого'}],asks:[{l:'F₂ =',u:'Н',a:F2,bad:'F₂ = F₁ · S₂ / S₁.'}],ok:'F₂ = '+F+'·'+S2+' / '+S1+' = '+F2+' Н.'}},
 archimedes(){const F=rpick([.5,1,1.5,2]),P1=rpick([3,4,5,6]),P2=P1-F;return{icon:'⚓',intro:'Зважуємо тіло в повітрі й у воді. Знайди архімедову силу й об’єм тіла (ρ води 1000 кг/м³, g = 10 Н/кг).',reads:[{l:'Вага в повітрі P₁',v:P1,u:'Н',b:'🔍 У повітрі'},{l:'Вага у воді P₂',v:P2,u:'Н',b:'🔍 У воді'}],asks:[{l:'F_A =',u:'Н',a:F,bad:'F_A = P₁ − P₂.'},{l:'V =',u:'см³',a:F*100,bad:'V = F / (ρg) у м³, потім у см³ (× 1 000 000). Підказка: F · 100.'}],ok:'F = '+fmt(F,1)+' Н, V = '+Math.round(F*100)+' см³.'}},
 float_lab(){const r=rpick([.6,.8,.9,1.2,2.7,7.8]),V=rpick([10,20,25,50]),m=+(r*V).toFixed(1);return{icon:'🛟',intro:'Виміряй масу й об’єм тіла, знайди густину й визнач, чи плаватиме воно у воді (1 г/см³).',reads:[{l:'Маса m',v:m,u:'г',b:'⚖ Маса'},{l:'Об’єм V',v:V,u:'см³',b:'🧪 Об’єм'}],asks:[{l:'ρ =',u:'г/см³',a:m/V,bad:'ρ = m / V.'},{l:'Плаває? (1 — так, 0 — ні)',u:'',a:r<1?1:0,bad:'Плаває, якщо густина менша за густину води (1 г/см³).',exact:1}],ok:'ρ = '+fmt(m/V,2)+' г/см³ — '+(r<1?'плаватиме':'потоне')+'.'}}
};

/* Лабораторні з дією гравця: повзунок задає величину, покази й відповідь залежать від неї */
const svgT=(w,h,b)=>'<svg viewBox="0 0 '+w+' '+h+'" class="labsvg" role="img" aria-label="установка">'+b+'</svg>';
Object.assign(LABGEN,{
 p_liquid(){const L=rpick([['вода',1000,'#4aa8ff'],['гас',800,'#ffe08a'],['олія',900,'#e8c547'],['ртуть',13600,'#b9c2d6']]),hg=L[0]==='ртуть',u=hg?'см':'м',cv=x=>hg?x/100:x;
  return{icon:'🤿',intro:'Датчик тиску в посудині з рідиною. <b>Задай глибину повзунком</b>, зніми покази й знайди тиск p = ρgh (g = 10 Н/кг).'+(hg?' Глибину переведи в метри.':''),
   ctl:{l:'Глибина занурення',u,min:hg?2:1,max:hg?20:20,step:hg?2:1,val:hg?6:5},
   vis:x=>{const mx=hg?20:20,y=30+x/mx*150;return svgT(200,220,'<rect x="40" y="20" width="120" height="180" rx="6" fill="'+L[2]+'" fill-opacity=".35" stroke="#cfe6ff" stroke-width="3"/><line x1="40" y1="30" x2="160" y2="30" stroke="#cfe6ff" stroke-dasharray="5 4"/><line x1="100" y1="30" x2="100" y2="'+y+'" stroke="#ffd166" stroke-width="3"/><circle cx="100" cy="'+y+'" r="11" fill="#ff7bd5" stroke="#fff" stroke-width="2"/><text x="170" y="'+(y+5)+'" fill="#ffd166" font-size="15" font-weight="700">h = '+String(x).replace('.',',')+' '+u+'</text>')},
   reads:[{l:'Рідина',v:L[0]+', ρ = '+L[1],u:'кг/м³',b:'🧪 Рідина'},{l:'Глибина h',v:x=>x,u,b:'📏 Глибина'}],
   asks:[{l:'p =',u:'Па',a:x=>Math.round(L[1]*10*cv(x)),bad:'p = ρ · g · h = ρ · 10 · h (h — у метрах).'}],ok:x=>'p = '+L[1]+'·10·'+String(cv(x)).replace('.',',')+' = '+Math.round(L[1]*10*cv(x))+' Па.'}},
 k_spring(){const k=rpick([25,50,100]);
  return{icon:'🌀',intro:'Підвішуй гирьки по 50 г: <b>задай їх кількість повзунком</b>. Динамометр покаже силу, лінійка — видовження пружини. Знайди жорсткість k = F / x.',
   ctl:{l:'Кількість гирьок',u:'шт',min:1,max:6,step:1,val:2},
   vis:n=>{const F=n*.5,x=F/k*100,len=40+Math.min(x,14)*9;return svgT(200,220,'<rect x="60" y="8" width="80" height="8" fill="#6b7bb8"/><path d="M100 16 v6 '+Array.from({length:8},(_,i)=>'l-10 '+(len/16)+' l20 '+(len/16)).join(' ')+' l-10 '+(len/16)+' v6" fill="none" stroke="#cfe6ff" stroke-width="3" transform="translate(0 0)"/><g transform="translate(0 '+(len+30)+')">'+Array.from({length:n},(_,i)=>'<rect x="78" y="'+(i*14)+'" width="44" height="12" rx="3" fill="#ffd166" stroke="#fff"/>').join('')+'</g><text x="150" y="40" fill="#ffd166" font-size="14" font-weight="700">x = '+String(x).replace('.',',')+' см</text>')},
   reads:[{l:'Сила F',v:n=>n*.5,u:'Н',b:'🔍 Динамометр'},{l:'Видовження x',v:n=>n*.5/k*100,u:'см',b:'📏 Лінійка'}],
   asks:[{l:'k =',u:'Н/м',a:()=>k,bad:'k = F / x, де x — у метрах (1 см = 0,01 м).'}],ok:n=>'k = '+String(n*.5).replace('.',',')+' / '+String(n*.5/k).replace('.',',')+' = '+k+' Н/м.'}},
 v_cart(){const v=rpick([.2,.25,.4,.5]);
  return{icon:'🛒',intro:'Візок їде рівномірно. <b>Задай довжину траси повзунком</b>, виміряй шлях лінійкою та час секундоміром і знайди швидкість v = l / t.',
   ctl:{l:'Довжина траси',u:'м',min:1,max:5,step:1,val:2},
   vis:l=>svgT(260,100,'<line x1="20" y1="70" x2="240" y2="70" stroke="#6b7bb8" stroke-width="4"/><line x1="20" y1="62" x2="20" y2="78" stroke="#cfe6ff" stroke-width="3"/><line x1="'+(20+l/5*220)+'" y1="55" x2="'+(20+l/5*220)+'" y2="85" stroke="#ff4d8d" stroke-width="4"/><rect x="26" y="46" width="34" height="18" rx="4" fill="#7df9ff"/><circle cx="34" cy="68" r="5" fill="#222"/><circle cx="52" cy="68" r="5" fill="#222"/><text x="'+(20+l/5*110)+'" y="30" fill="#ffd166" font-size="15" text-anchor="middle" font-weight="700">l = '+String(l).replace('.',',')+' м</text>'),
   reads:[{l:'Шлях l',v:l=>l,u:'м',b:'📏 Лінійка'},{l:'Час t',v:l=>+(l/v).toFixed(2),u:'с',b:'⏱ Секундомір'}],
   asks:[{l:'v =',u:'м/с',a:()=>v,bad:'v = l / t: шлях поділи на час.'}],ok:l=>'v = '+String(l).replace('.',',')+' / '+String(+(l/v).toFixed(2)).replace('.',',')+' = '+String(v).replace('.',',')+' м/с.'}},
 press_lab(){const S1=rpick([5,10,20]),S2=rpick([100,200,400]);
  return{icon:'🏗',intro:'Гідравлічний прес. <b>Задай силу на малому поршні повзунком</b> і знайди силу на великому: F₂ / F₁ = S₂ / S₁.',
   ctl:{l:'Сила F₁ на малому поршні',u:'Н',min:10,max:100,step:10,val:30},
   vis:F=>svgT(240,160,'<rect x="20" y="70" width="40" height="70" fill="#4aa8ff" fill-opacity=".5" stroke="#cfe6ff"/><rect x="110" y="60" width="110" height="80" fill="#4aa8ff" fill-opacity=".5" stroke="#cfe6ff"/><rect x="18" y="'+(60-F/10)+'" width="44" height="8" fill="#ffd166"/><rect x="108" y="'+(50-F/20)+'" width="114" height="10" fill="#ff7bd5"/><text x="40" y="30" fill="#ffd166" font-size="14" text-anchor="middle" font-weight="700">F₁ = '+F+' Н</text>'+'<text x="165" y="150" fill="#cfe6ff" font-size="12" text-anchor="middle">S₂/S₁ = '+(S2/S1)+'</text>'),
   reads:[{l:'F₁',v:F=>F,u:'Н',b:'🔍 Сила F₁'},{l:'S₁',v:S1,u:'см²',b:'📐 Малий поршень'},{l:'S₂',v:S2,u:'см²',b:'📐 Великий поршень'}],
   asks:[{l:'F₂ =',u:'Н',a:F=>F*S2/S1,bad:'F₂ = F₁ · S₂ / S₁.'}],ok:F=>'F₂ = '+F+'·'+S2+'/'+S1+' = '+(F*S2/S1)+' Н.'}},
 f_two(){const F2=rpick([1,2,3]);
  return{icon:'🧲',intro:'Кільце тягнуть у протилежні боки двома динамометрами. <b>Задай силу першого повзунком</b> і знайди рівнодійну.',
   ctl:{l:'Сила F₁ (праворуч)',u:'Н',min:4,max:10,step:1,val:6},
   vis:F=>svgT(260,90,'<circle cx="130" cy="45" r="12" fill="#ffd166" stroke="#fff" stroke-width="2"/><line x1="142" y1="45" x2="'+(142+F*10)+'" y2="45" stroke="#7df9ff" stroke-width="5"/><line x1="118" y1="45" x2="'+(118-F2*10)+'" y2="45" stroke="#ff7bd5" stroke-width="5"/><text x="200" y="25" fill="#7df9ff" font-size="14" font-weight="700">F₁ = '+F+' Н</text><text x="20" y="25" fill="#ff7bd5" font-size="14" font-weight="700">F₂ = '+F2+' Н</text>'),
   reads:[{l:'Динамометр 1: F₁',v:F=>F,u:'Н',b:'🔍 Праворуч'},{l:'Динамометр 2: F₂',v:F2,u:'Н',b:'🔍 Ліворуч'}],
   asks:[{l:'R =',u:'Н',a:F=>F-F2,bad:'Сили протилежні: R = F₁ − F₂.'}],ok:F=>'R = '+F+' − '+F2+' = '+(F-F2)+' Н.'}}
});

const emo=(e,l,extra)=>svgT(200,150,'<text x="100" y="95" font-size="72" text-anchor="middle">'+e+'</text><text x="100" y="135" fill="#ffd166" font-size="15" text-anchor="middle" font-weight="700">'+l+'</text>'+(extra||''));
Object.assign(LABGEN,{
 v_ball(){const v=rpick([.3,.4,.5,.6]);
  return{icon:'⚽',intro:'Кулька котиться жолобом. <b>Задай довжину жолоба повзунком</b>, виміряй шлях і час і знайди середню швидкість: весь шлях ділимо на весь час.',
   ctl:{l:'Довжина жолоба',u:'м',min:.6,max:3,step:.6,val:1.8},
   vis:l=>svgT(260,100,'<line x1="20" y1="70" x2="240" y2="70" stroke="#6b7bb8" stroke-width="5"/><line x1="'+(20+l/3*220)+'" y1="58" x2="'+(20+l/3*220)+'" y2="82" stroke="#ff4d8d" stroke-width="4"/><circle cx="34" cy="58" r="12" fill="#fff"/><text x="'+(20+l/6*220)+'" y="30" fill="#ffd166" font-size="15" text-anchor="middle" font-weight="700">l = '+String(l).replace('.',',')+' м</text>'),
   reads:[{l:'Шлях l',v:l=>l,u:'м',b:'📏 Лінійка'},{l:'Час t',v:l=>+(l/v).toFixed(2),u:'с',b:'⏱ Секундомір'}],
   asks:[{l:'v =',u:'м/с',a:()=>v,bad:'v = l / t: весь шлях поділи на весь час.'}],ok:l=>'v = '+String(l).replace('.',',')+' / '+String(+(l/v).toFixed(2)).replace('.',',')+' = '+String(v).replace('.',',')+' м/с.'}},
 v_stick(){const m1=rpick([2,4]),v1=rpick([3,5]);
  return{icon:'🛷',intro:'Візок m₁ наїжджає на нерухомий візок m₂ й зчіплюється з ним. <b>Задай масу другого візка повзунком</b> і знайди швидкість обох після зчеплення: m₁v₁ = (m₁ + m₂)v.',
   ctl:{l:'Маса другого візка m₂',u:'кг',min:2,max:8,step:2,val:4},
   vis:m2=>svgT(260,100,'<rect x="30" y="40" width="'+(20+m1*8)+'" height="30" rx="5" fill="#7df9ff"/><rect x="150" y="40" width="'+(20+m2*8)+'" height="30" rx="5" fill="#ff7bd5"/><circle cx="45" cy="76" r="6" fill="#222"/><circle cx="'+(40+m1*8)+'" cy="76" r="6" fill="#222"/><circle cx="165" cy="76" r="6" fill="#222"/><circle cx="'+(150+m2*8)+'" cy="76" r="6" fill="#222"/><text x="50" y="30" fill="#7df9ff" font-size="13" font-weight="700">m₁ = '+m1+' кг</text><text x="150" y="30" fill="#ff9ec2" font-size="13" font-weight="700">m₂ = '+m2+' кг</text>'),
   reads:[{l:'m₁',v:m1,u:'кг',b:'⚖ Візок 1'},{l:'v₁',v:v1,u:'м/с',b:'⏱ Швидкість v₁'},{l:'m₂',v:m2=>m2,u:'кг',b:'⚖ Візок 2'}],
   asks:[{l:'v =',u:'м/с',a:m2=>m1*v1/(m1+m2),bad:'v = m₁v₁ / (m₁ + m₂): маса після зчеплення — сума мас обох візків.'}],ok:m2=>'v = '+m1+'·'+v1+' / ('+m1+' + '+m2+') = '+String(+(m1*v1/(m1+m2)).toFixed(2)).replace('.',',')+' м/с.'}},
 m_dyn(){const M=[.2,.3,.45,.6,.75,.9];
  return{icon:'⚖️',intro:'Тіло висить на динамометрі в спокої. <b>Обери вантаж повзунком</b>, зніми показ динамометра (вага) і знайди масу (g = 10 Н/кг).',
   ctl:{l:'Вантаж №',u:'',min:1,max:6,step:1,val:2},
   vis:n=>emo('⚖️','вантаж № '+n),
   reads:[{l:'Вага P',v:n=>+(M[n-1]*10).toFixed(2),u:'Н',b:'🔍 Динамометр'}],
   asks:[{l:'m =',u:'кг',a:n=>M[n-1],bad:'m = P / g = P / 10.'}],ok:n=>'m = '+String(+(M[n-1]*10).toFixed(2)).replace('.',',')+' / 10 = '+String(M[n-1]).replace('.',',')+' кг.'}},
 mu_slide(){const mu=rpick([.2,.25,.3,.4]);
  return{icon:'🧱',intro:'Брусок рівномірно тягнуть по столу. <b>Додавай вантажі по 100 г повзунком</b> (брусок без вантажів — 200 г). Динамометр показує силу тертя. Знайди коефіцієнт тертя μ = F / P (g = 10 Н/кг).',
   ctl:{l:'Вантажів по 100 г',u:'шт',min:0,max:4,step:1,val:1},
   vis:n=>svgT(240,110,'<rect x="20" y="78" width="200" height="10" fill="#6b7bb8"/><rect x="80" y="50" width="70" height="28" rx="4" fill="#c98a4b"/>'+Array.from({length:n},(_,i)=>'<rect x="92" y="'+(40-i*10)+'" width="46" height="9" rx="2" fill="#ffd166" stroke="#fff"/>').join('')+'<line x1="150" y1="64" x2="205" y2="64" stroke="#7df9ff" stroke-width="4"/>'),
   reads:[{l:'Вага бруска з вантажами P',v:n=>+((.2+.1*n)*10).toFixed(2),u:'Н',b:'🔍 Вага'},{l:'Сила тяги F',v:n=>+(mu*(.2+.1*n)*10).toFixed(3),u:'Н',b:'🔍 Сила тяги'}],
   asks:[{l:'μ =',u:'',a:()=>mu,bad:'μ = F / P: силу тертя поділи на вагу.'}],ok:n=>'μ = '+String(+(mu*(.2+.1*n)*10).toFixed(3)).replace('.',',')+' / '+String(+((.2+.1*n)*10).toFixed(2)).replace('.',',')+' = '+String(mu).replace('.',',')+'.'}},
 p_block(){const m=rpick([1.2,1.5,2.4,3]),F=[[20,10],[20,5],[10,5]];
  return{icon:'🧱',intro:'Брусок має розміри 20 × 10 × 5 см. <b>Обери повзунком грань, якою він лежить</b>, і знайди тиск p = F / S, де F = mg (g = 10 Н/кг), S — площа цієї грані. Площу переведи в м².',
   ctl:{l:'Грань №',u:'',min:1,max:3,step:1,val:1},
   vis:n=>{const f=F[n-1],w=f[0]*4,h=f[1]*4;return svgT(220,130,'<rect x="20" y="108" width="180" height="8" fill="#6b7bb8"/><rect x="'+(110-w/2)+'" y="'+(108-h*(n===1?1:n===2?2:1.25))+'" width="'+w+'" height="'+h*(n===1?1:n===2?2:1.25)+'" rx="4" fill="#c98a4b" stroke="#fff"/><text x="110" y="20" fill="#ffd166" font-size="14" text-anchor="middle" font-weight="700">грань '+f[0]+' × '+f[1]+' см</text>')},
   reads:[{l:'Маса m',v:m,u:'кг',b:'⚖ Маса'},{l:'Грань',v:n=>F[n-1][0]+' × '+F[n-1][1],u:'см',b:'📏 Розміри грані'}],
   asks:[{l:'p =',u:'Па',a:n=>m*10/(F[n-1][0]*F[n-1][1]/10000),bad:'p = mg / S, де S у м² (1 см² = 0,0001 м²).'}],ok:n=>'p = '+String(m*10).replace('.',',')+' / '+String(F[n-1][0]*F[n-1][1]/10000).replace('.',',')+' = '+Math.round(m*10/(F[n-1][0]*F[n-1][1]/10000))+' Па.'}},
 u_tube(){return{icon:'🧪',intro:'У U-подібній трубці зліва вода, справа олія (900 кг/м³). <b>Задай висоту стовпа води повзунком</b> і знайди висоту стовпа олії: ρ₁h₁ = ρ₂h₂. Відповідь — у см.',
   ctl:{l:'Висота води h₁',u:'см',min:9,max:36,step:9,val:18},
   vis:h=>svgT(200,170,'<path d="M50 20 v110 a50 20 0 0 0 100 0 v-110" fill="none" stroke="#cfe6ff" stroke-width="4"/><rect x="54" y="'+(130-h*2.6)+'" width="38" height="'+(h*2.6)+'" fill="#4aa8ff" fill-opacity=".6"/><rect x="108" y="'+(130-h*2.6*1000/900)+'" width="38" height="'+(h*2.6*1000/900)+'" fill="#e8c547" fill-opacity=".6"/><text x="100" y="160" fill="#ffd166" font-size="13" text-anchor="middle" font-weight="700">h₁ = '+h+' см</text>'),
   reads:[{l:'ρ₁ (вода)',v:1000,u:'кг/м³',b:'🧪 Вода'},{l:'ρ₂ (олія)',v:900,u:'кг/м³',b:'🧪 Олія'},{l:'h₁',v:h=>h,u:'см',b:'📏 Висота води'}],
   asks:[{l:'h₂ =',u:'см',a:h=>1000*h/900,bad:'h₂ = ρ₁h₁ / ρ₂: менша густина — вищий стовп.'}],ok:h=>'h₂ = 1000·'+h+' / 900 = '+String(+(1000*h/900).toFixed(1)).replace('.',',')+' см.'}},
 archimedes(){const F=[.5,1,1.5,2];
  return{icon:'⚓',intro:'Зважуємо тіло в повітрі й у воді. <b>Обери тіло повзунком</b>, зніми покази й знайди архімедову силу й об’єм тіла (ρ води 1000 кг/м³, g = 10 Н/кг).',
   ctl:{l:'Тіло №',u:'',min:1,max:4,step:1,val:2},
   vis:n=>emo('⚓','тіло № '+n),
   reads:[{l:'Вага в повітрі P₁',v:n=>2+n+1,u:'Н',b:'🔍 У повітрі'},{l:'Вага у воді P₂',v:n=>2+n+1-F[n-1],u:'Н',b:'🔍 У воді'}],
   asks:[{l:'F_A =',u:'Н',a:n=>F[n-1],bad:'F_A = P₁ − P₂.'},{l:'V =',u:'см³',a:n=>F[n-1]*100,bad:'V = F_A / (ρg) у м³, потім у см³ (× 1 000 000). Підказка: F_A · 100.'}],ok:n=>'F_A = '+String(F[n-1]).replace('.',',')+' Н, V = '+Math.round(F[n-1]*100)+' см³.'}},
 float_lab(){const R=[.6,.8,.9,1.2,2.7,7.8],V=[10,20,25,50,20,10];
  return{icon:'🛟',intro:'<b>Обери тіло повзунком</b>, виміряй його масу й об’єм, знайди густину й визнач, чи плаватиме воно у воді (1 г/см³).',
   ctl:{l:'Тіло №',u:'',min:1,max:6,step:1,val:3},
   vis:n=>emo('🛟','тіло № '+n),
   reads:[{l:'Маса m',v:n=>+(R[n-1]*V[n-1]).toFixed(1),u:'г',b:'⚖ Маса'},{l:'Об’єм V',v:n=>V[n-1],u:'см³',b:'🧪 Об’єм'}],
   asks:[{l:'ρ =',u:'г/см³',a:n=>R[n-1],bad:'ρ = m / V.'},{l:'Плаває? (1 — так, 0 — ні)',u:'',a:n=>R[n-1]<1?1:0,bad:'Плаває, якщо густина менша за густину води (1 г/см³).',exact:1}],ok:n=>'ρ = '+String(R[n-1]).replace('.',',')+' г/см³ — '+(R[n-1]<1?'плаватиме':'потоне')+'.'}}
});
Labs.gen=function(host,done,m){
 const G=LABGEN[m.labid]();let errs=0,seen={},X=G.ctl?G.ctl.val:null;const V=f=>typeof f==='function'?f(X):f;
 const visHtml=()=>G.vis?G.vis(X):'<div class="labic">'+G.icon+'</div>';
 host.innerHTML='<div class="lab"><div class="labvis" id="gVis">'+visHtml()+'</div><div class="labside"><p class="conv">'+G.intro+'</p>'+
  (G.ctl?'<div class="g"><span>'+G.ctl.l+'</span><input type="range" id="gCtl" min="'+G.ctl.min+'" max="'+G.ctl.max+'" step="'+G.ctl.step+'" value="'+X+'" aria-label="'+G.ctl.l+'"><b id="gCv"></b></div>':'')+
  '<div class="row" style="justify-content:flex-start;gap:6px;flex-wrap:wrap">'+G.reads.map((r,i)=>'<button class="btn ghost" data-r="'+i+'">'+r.b+'</button>').join('')+'</div>'+
  '<div class="big" id="gRd" style="min-height:1.4em"></div>'+
  '<div class="gfoot">'+G.asks.map((q,i)=>'<div class="g"><span class="sym">'+q.l+'</span><input data-q="'+i+'" inputmode="decimal" placeholder="число"><span>'+q.u+'</span></div>').join('')+
  '<button class="btn" id="gChk">Перевірити</button></div><div class="msg" id="gMsg"></div></div></div>';
 const $q=s=>host.querySelector(s),msg=(t,c)=>{$q('#gMsg').textContent=t;$q('#gMsg').className='msg '+(c||'')};
 const fm=v=>String(typeof v==='number'?+v.toFixed(3):v).replace('.',',');
 const cv=()=>{if(G.ctl)$q('#gCv').textContent=fm(X)+' '+G.ctl.u};cv();
 const show=()=>{$q('#gRd').innerHTML=G.reads.map((r,i)=>seen[i]?'<span>'+r.l+' = <b>'+fm(V(r.v))+'</b> '+r.u+'</span>':'').filter(Boolean).join(' &nbsp; ')};
 if(G.ctl)$q('#gCtl').addEventListener('input',e=>{X=+e.target.value;seen={};host.querySelectorAll('[data-r]').forEach(b=>b.style.outline='none');$q('#gVis').innerHTML=visHtml();cv();show();msg('Установку змінено — зніми покази знову.','info')});
 host.addEventListener('click',e=>{const b=e.target.closest('[data-r]');if(!b)return;Sfx.click();seen[b.dataset.r]=1;b.style.outline='2px solid #7df9ff';show()});
 $q('#gChk').onclick=()=>{if(Object.keys(seen).length<G.reads.length){return msg('Спершу зроби всі вимірювання.','info')}
  for(let i=0;i<G.asks.length;i++){const q=G.asks[i],a=V(q.a),v=parseNum($q('[data-q="'+i+'"]').value);
   const okv=!isNaN(v)&&(q.exact?v===a:near(v,a,.04));if(!okv){errs++;Sfx.bad();return msg(q.bad,'bad')}}
  Sfx.ok();msg('Так! '+V(G.ok),'ok');setTimeout(()=>done(errs),1700)}};
