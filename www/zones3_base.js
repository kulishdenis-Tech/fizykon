'use strict';
/* ====== Зони 8–20: решта підручника (§8–11, §19–36). Дані — у zones3.js ====== */
/* орієнтир-«вежа» з емодзі */
const LM3=(emo,label,col)=>(c,x,t,sp)=>{const gy=GY+30;c.fillStyle=lg(c,0,gy-320,0,gy,[[0,col],[1,'#1a1760']]);rr(c,x-110,gy-320,220,320,14);c.fill();
 c.fillStyle='rgba(255,255,255,.18)';rr(c,x-96,gy-306,192,18,9);c.fill();glow(c,x,gy-190,150,'rgba(255,255,255,.35)');
 c.font='110px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff';c.save();c.translate(x,gy-190+Math.sin(t*2)*6);c.rotate(Math.sin(t*.8)*.05);c.fillText(emo,0,0);c.restore();
 c.fillStyle='#0b0b2e';rr(c,x-90,gy-80,180,44,10);c.fill();txt(c,label,x,gy-50,26,'#ffd166','center','Russo');
 for(let i=0;i<6;i++){const a=t*1.2+i;c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.arc(x-120+i*48,gy-4-Math.abs(Math.sin(a))*10,4,0,TAU);c.fill()}};
/* сцени в верхній частині панелі */
const SC={
 car(c,bt,a,G,B){const v=B&&B.play?G.val:10,x=PX+60+((a*v*8)%380);c.strokeStyle='#9db0d8';c.lineWidth=4;c.beginPath();c.moveTo(PX+30,PY+190);c.lineTo(PX+PW-30,PY+190);c.stroke();
  c.fillStyle='#ff7bd5';rr(c,x,PY+150,90,32,10);c.fill();c.fillStyle='#7df9ff';rr(c,x+52,PY+138,34,20,6);c.fill();c.fillStyle='#14213d';[18,70].forEach(d=>{c.beginPath();c.arc(x+d,PY+188,11,0,TAU);c.fill()});
  for(let i=0;i<=5;i++){c.fillStyle='#ffd166';c.fillRect(PX+60+i*76,PY+194,3,12);txt(c,String(i*5)+' м',PX+60+i*76,PY+224,14,'#9db0d8','center')}},
 meet(c,bt,a,G){const p=Math.min(1,(a*.25)%1.4),x1=PX+60+p*190,x2=PX+PW-90-p*190;c.strokeStyle='#9db0d8';c.lineWidth=4;c.beginPath();c.moveTo(PX+30,PY+190);c.lineTo(PX+PW-30,PY+190);c.stroke();
  [[x1,'#7df9ff'],[x2,'#ff7bd5']].forEach(q=>{c.fillStyle=q[1];c.beginPath();c.arc(q[0],PY+160,22,0,TAU);c.fill();c.fillStyle='#14213d';c.fillRect(q[0]-3,PY+176,6,12)});arrow(c,x1+26,PY+130,40,0,'#7df9ff');arrow(c,x2-26,PY+130,-40,0,'#ff7bd5')},
 graph(c,bt,a,G,B){const v=B&&B.play?G.val:4,x0=PX+60,y0=PY+210,w=PW-120,h=170;c.strokeStyle='#9db0d8';c.lineWidth=3;c.beginPath();c.moveTo(x0,y0-h);c.lineTo(x0,y0);c.lineTo(x0+w,y0);c.stroke();txt(c,'l',x0-14,y0-h+10,18,'#ffd166','center');txt(c,'t',x0+w+4,y0+18,18,'#7df9ff','center');
  const k=Math.min(1,reveal(bt,.3,2)),sl=Math.min(h*.95,v*17);c.strokeStyle='#ffd166';c.lineWidth=5;c.beginPath();c.moveTo(x0,y0);c.lineTo(x0+w*k,y0-sl*k);c.stroke()},
 carts2(c,bt,a,G,B){const m=B&&B.play?G.val:5,s=Math.sin(a*1.2),x1=PX+160+s*40,x2=PX+PW-170-s*30,w=44+m*2;c.strokeStyle='#9db0d8';c.lineWidth=5;c.beginPath();c.moveTo(PX+30,PY+196);c.lineTo(PX+PW-30,PY+196);c.stroke();
  [[x1,70,'#7df9ff'],[x2,w+20,'#ff7bd5']].forEach(q=>{c.fillStyle=q[2];rr(c,q[0]-q[1]/2,PY+146,q[1],46,8);c.fill();c.fillStyle='#14213d';[-.3,.3].forEach(k=>{c.beginPath();c.arc(q[0]+q[1]*k,PY+196,10,0,TAU);c.fill()})});arrow(c,x1+10,PY+120,50,0,'#7df9ff')},
 rocket(c,bt,a,G){const y=PY+170-Math.min(1,bt/8)*60+Math.sin(a*6)*2,x=HX;c.fillStyle='#e6ecff';c.beginPath();c.moveTo(x,y-70);c.quadraticCurveTo(x+26,y-20,x+20,y+30);c.lineTo(x-20,y+30);c.quadraticCurveTo(x-26,y-20,x,y-70);c.fill();c.fillStyle='#ff4d8d';c.beginPath();c.arc(x,y-20,9,0,TAU);c.fill();
  for(let i=0;i<7;i++){c.fillStyle='rgba(255,'+(160+i*10)+',60,'+(.8-i*.1)+')';c.beginPath();c.arc(x+Math.sin(a*8+i)*5,y+40+i*12,12-i,0,TAU);c.fill()}arrow(c,x+60,y,0,-60,'#6ee7a8')},
 rope(c,bt,a,G,B){const v=B&&B.play?G.val:200,sh=(v-300)/20,y=PY+170;c.strokeStyle='#d4a373';c.lineWidth=7;c.beginPath();c.moveTo(PX+40,y);c.lineTo(PX+PW-40,y);c.stroke();c.fillStyle='#ff4d8d';c.fillRect(HX+sh-5,y-14,10,28);
  c.fillStyle='#7df9ff';[0,1,2].forEach(i=>{c.beginPath();c.arc(PX+70+i*34+sh,y-26,14,0,TAU);c.fill()});c.fillStyle='#ffd166';[0,1].forEach(i=>{c.beginPath();c.arc(PX+PW-70-i*34+sh,y-26,14,0,TAU);c.fill()});
  arrow(c,HX-40,y+40,-60,0,'#7df9ff');arrow(c,HX+40,y+40,Math.min(160,Math.max(10,v/4)),0,'#ffd166')},
 spring(c,bt,a,G,B){const F=B&&B.play?G.val:8,ext=20+F*7,x=HX,y0=PY+40;c.strokeStyle='#cfe6ff';c.lineWidth=5;c.beginPath();c.moveTo(x-40,y0);c.lineTo(x+40,y0);c.stroke();c.strokeStyle='#ffd166';c.lineWidth=4;c.beginPath();c.moveTo(x,y0);
  for(let i=1;i<=14;i++)c.lineTo(x+(i%2?-16:16),y0+ext*i/14);c.lineTo(x,y0+ext);c.stroke();c.fillStyle='#7df9ff';rr(c,x-26,y0+ext,52,34,6);c.fill();arrow(c,x+46,y0+ext+17,0,40,'#ff9ec2')},
 apple(c,bt,a,G){const t=(a*.5)%1,y=PY+70+t*t*110;c.fillStyle='#ef4444';c.beginPath();c.arc(HX,y,18,0,TAU);c.fill();c.fillStyle='#22c55e';c.fillRect(HX-2,y-24,4,8);c.fillStyle='#3a4294';c.fillRect(PX+60,PY+210,PW-120,10);arrow(c,HX+40,y,0,50,'#ffd166');txt(c,'F тяж',HX+56,y+60,16,'#ffd166','left')},
 block(c,bt,a,G,B){const m=B&&B.play?G.val:5,x=HX-40+Math.sin(a)*12,y=PY+170,w=40+m*2.5;c.fillStyle='#3a4294';c.fillRect(PX+40,y+30,PW-80,12);c.fillStyle='#c9d3e8';rr(c,x-w/2,y-w*.6+30,w,w*.6,6);c.fill();
  arrow(c,x+w/2,y+4,60,0,'#7df9ff');arrow(c,x-w/2,y+4,-Math.min(80,20+m*4),0,'#ff9ec2');txt(c,'F тертя',x-w/2-46,y-10,15,'#ff9ec2','center')},
 press(c,bt,a,G,B){const S=B&&B.play?G.val:20,w=Math.max(16,Math.min(190,S*3));c.fillStyle='#c9d3e8';rr(c,HX-w/2,PY+150,w,34,6);c.fill();c.fillStyle='#3a4294';c.fillRect(PX+60,PY+184,PW-120,12);arrow(c,HX,PY+60,0,86,'#ffd166');txt(c,'F',HX+14,PY+80,22,'#ffd166','left','Russo');txt(c,'S',HX,PY+218,20,'#7df9ff','center','Russo')},
 liquid(c,bt,a,G,B){const h=B&&B.play?Math.min(1,G.val/Math.max(1,B.max||50)):.6;c.strokeStyle='#9db0d8';c.lineWidth=4;c.strokeRect(HX-90,PY+40,180,180);c.fillStyle='rgba(80,160,255,.55)';c.fillRect(HX-88,PY+222-180*(.4+h*.5),176,180*(.4+h*.5)-2);
  [.25,.5,.75].forEach((k,i)=>arrow(c,HX-88,PY+222-180*(.4+h*.5)*k*1.0,30+i*22,0,'#ffd166'))},
 press2(c,bt,a,G){const s=Math.sin(a*1.1)*.5+.5;c.fillStyle='rgba(80,160,255,.5)';rr(c,PX+90,PY+170,PW-180,36,8);c.fill();c.fillStyle='rgba(80,160,255,.5)';c.fillRect(PX+110,PY+90,28,90);c.fillRect(PX+PW-190,PY+90,80,90);
  c.fillStyle='#c9d3e8';rr(c,PX+108,PY+80+s*30,32,12,3);c.fill();rr(c,PX+PW-192,PY+110-s*8,84,12,3);c.fill();arrow(c,PX+124,PY+40,0,36,'#ffd166');arrow(c,PX+PW-150,PY+84-s*8,0,-40,'#6ee7a8')},
 float(c,bt,a,G){const y=PY+120+Math.sin(a*1.3)*4;c.fillStyle='rgba(80,160,255,.45)';c.fillRect(PX+60,PY+120,PW-120,100);c.fillStyle='#c98a4b';rr(c,HX-34,y-20,68,60,8);c.fill();arrow(c,HX-10,y+50,0,-44,'#7df9ff');arrow(c,HX+10,y-8,0,44,'#ff9ec2');txt(c,'F арх',HX-52,y+30,15,'#7df9ff','right');txt(c,'F тяж',HX+50,y+30,15,'#ff9ec2','left')},
 balloon(c,bt,a,G){const y=PY+100-Math.sin(a*.8)*10,x=HX;c.fillStyle='#ff4d8d';c.beginPath();c.ellipse(x,y,48,60,0,0,TAU);c.fill();c.fillStyle='#ffd166';c.fillRect(x-14,y+70,28,18);c.strokeStyle='#cfe6ff';c.lineWidth=2;c.beginPath();c.moveTo(x-30,y+45);c.lineTo(x-12,y+70);c.moveTo(x+30,y+45);c.lineTo(x+12,y+70);c.stroke();arrow(c,x+70,y+40,0,-50,'#6ee7a8')}
};
/* універсальний мультик: сцена + рядки з тексту */
function drawGen(c,b,bt,rev,a,T,G){const B=(Z.bd&&Z.bd[b])||{};
 if(B.scene&&SC[B.scene])SC[B.scene](c,bt,a,G,B);
 if(b==='play'){const P=Z.play,rows=P.rows;if(P.scene&&SC[P.scene])SC[P.scene](c,bt,a,G,{play:1,max:P.max});
  const v=G.val;
  rows.forEach((r,i)=>{let val;try{val=new Function('v','return '+r[1])(v)}catch(e){val=''}const s=typeof val==='number'?fmt(val,Math.abs(val)<10&&val%1?2:val%1?1:0):String(val);txt(c,r[0]+': '+s+' '+r[2],HX,PY+262+i*36,22,['#ffd166','#6ee7a8','#ff9ec2'][i%3],'center')});return}
 if(B.lines)lines(c,B.lines,bt,PY+(B.scene?260:130),B.scene?46:70,22)}
/* фабрика зон */
function mk(s){const first={who:'giro',txt:s.d_first||s.first,sp:s.first,beat:'',title:''};
 const bd={};s.beats.forEach(b=>bd[b.k]=b);const lb=s.beats[s.beats.length-1];
 const steps=[first].concat(s.beats.map(b=>({who:'giro',beat:b.k,title:b.title,min:b.min||6,txt:b.dsp||b.txt,sp:b.txt})),
  [{who:'max',beat:lb.k,title:lb.title,txt:s.d_maxsay||s.maxsay,sp:s.maxsay,keep:true},{who:'giro',beat:'play',title:'ТВІЙ ПУЛЬТ',play:true,txt:s.d_playTxt||s.playTxt,sp:s.playTxt}]);
 const P=s.play;
 return {id:s.id,ord:s.ord,par:s.par,name:s.name,color:s.color,gem:s.gem,theme:s.theme,tint:s.tint,gravity:s.gravity,jump:s.jump,blurb:s.blurb,landmark:LM3(s.lm[0],s.lm[1],s.color),
  intro:intro3(s.intro[0],s.intro[1],s.intro[2]),play:{min:P.min,max:P.max,step:P.step,val:P.val,label:P.label,unit:P.unit,rows:P.rows,scene:P.scene,fmt:v=>fmt(v,v%1?1:0)+' '+P.unit,vis:v=>2+4*(v-P.min)/Math.max(1,P.max-P.min)},
  draw:drawGen,bd,steps,tasks:s.tasks.map(t=>t.type==='lab'?Object.assign({},t,{gen:LABGEN[t.labid]}):t)}}
