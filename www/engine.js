const GAME_VER='1.5 (профілі, озвучка v2)';
'use strict';
/* ---------- utils ---------- */
const VW=1280,VH=720,GY=585,FEET=655,TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>{t=clamp(t,0,1);return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2};
const fmt=(n,d=2)=>Number(n.toFixed(d)).toString().replace('.',',');
const $=id=>document.getElementById(id);
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function lg(c,x0,y0,x1,y1,stops){const g=c.createLinearGradient(x0,y0,x1,y1);stops.forEach((s,i)=>g.addColorStop(s[0],s[1]));return g}

/* ---------- audio ---------- */
const Sfx={ctx:null,master:null,musicOn:true,sfxOn:true,timer:null,n:0,
 init(){ if(this.ctx)return; try{const A=window.AudioContext||window.webkitAudioContext;this.ctx=new A();this.master=this.ctx.createGain();this.master.gain.value=.9;this.master.connect(this.ctx.destination)}catch(e){this.ctx=null} if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume()},
 tone(f,d=.15,type='sine',v=.12,slide=0,delay=0){ if(!this.ctx||!this.sfxOn)return; const c=this.ctx,t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain(); o.type=type;o.frequency.setValueAtTime(f,t); if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),t+d); g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d); o.connect(g);g.connect(this.master);o.start(t);o.stop(t+d+.02)},
 coin(){this.tone(880,.09,'square',.07);this.tone(1320,.16,'square',.07,0,.07)},
 jump(){this.tone(320,.2,'triangle',.14,420)},
 hit(){this.tone(160,.25,'sawtooth',.12,-90)},
 ok(){[523,659,784,1046].forEach((f,i)=>this.tone(f,.18,'triangle',.12,0,i*.07))},
 bad(){this.tone(200,.22,'sawtooth',.1,-60)},
 click(){this.tone(600,.05,'square',.05)},
 whoosh(){this.tone(180,.6,'sawtooth',.05,900)},
 step(){this.tone(90+Math.random()*30,.05,'triangle',.05)},
 startMusic(){Music.start('park')},
 mus(f,d,type,v){ const c=this.ctx,t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+d+.05)}
};
const hashTxt=s=>{let x=5381;for(let i=0;i<s.length;i++)x=(Math.imul(x,33)^s.charCodeAt(i))>>>0;return x.toString(16).padStart(8,'0')};
/* фонова музика: готові mp3-петлі (park / space) */
const Music={el:{},cur:null,vol:.2,duck:false,started:false,
 get(th){if(!this.el[th]){const a=new Audio('audio/music_'+th+'.mp3');a.loop=true;a.preload='auto';a.volume=0;this.el[th]=a}return this.el[th]},
 start(th){this.started=true;this.play(th||this.cur||'park')},
 play(th){if(!this.started)return;th=th==='space'?'space':'park';if(this.cur===th&&this.el[th]&&!this.el[th].paused)return;this.cur=th;Object.keys(this.el).forEach(k=>{if(k!==th)this.fade(this.el[k],0,true)});const a=this.get(th);if(Sfx.musicOn){const p=a.play();if(p&&p.catch)p.catch(()=>{})}this.fade(a,this.target())},
 target(){return Sfx.musicOn?(this.duck?this.vol*.35:this.vol):0},
 fade(a,to,pause){clearInterval(a._f);a._f=setInterval(()=>{const d=to-a.volume;if(Math.abs(d)<.012){a.volume=Math.max(0,Math.min(1,to));clearInterval(a._f);if(pause&&to===0)a.pause();return}a.volume=Math.max(0,Math.min(1,a.volume+Math.sign(d)*.012))},40)},
 apply(){if(!this.started)return;const a=this.el[this.cur];if(!a)return;if(Sfx.musicOn){const p=a.play();if(p&&p.catch)p.catch(()=>{})}this.fade(a,this.target(),!Sfx.musicOn)},
 setDuck(d){this.duck=d;const a=this.el[this.cur];if(a&&Sfx.musicOn)this.fade(a,this.target())}
};
document.addEventListener('visibilitychange',()=>{const a=Music.el[Music.cur];if(!a)return;if(document.hidden)a.pause();else if(Sfx.musicOn&&Music.started)a.play().catch(()=>{})});
/* озвучка: записані mp3 (audio/<hash>.mp3), запасний варіант — голос пристрою */
const Voice={on:true,voice:null,au:null,
 init(){ if(!('speechSynthesis' in window))return; const pick=()=>{const vs=speechSynthesis.getVoices();this.voice=vs.find(v=>/^uk/i.test(v.lang))||null}; pick(); try{speechSynthesis.onvoiceschanged=pick}catch(e){} },
 sys(text,who,done){ if(!this.voice){done();return false} try{ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.voice=this.voice;u.lang='uk-UA';u.pitch=who==='giro'?1.55:1.05;u.rate=who==='giro'?1.03:1; u.onend=u.onerror=()=>done(); speechSynthesis.speak(u); return true}catch(e){done();return false} },
 speak(text,who,done){ if(!this.on)return false; this.stop(); let fin=false;const end=()=>{if(fin)return;fin=true;Music.setDuck(false);done()};
  try{const a=this.el();this.au=a;a.onended=end;a.onerror=()=>{if(this.au===a){Music.setDuck(false);if(!this.sys(text,who,end))end()}};a.src='audio/'+hashTxt(text)+'.mp3';a.volume=1;const p=a.play();Music.setDuck(true);if(p&&p.catch)p.catch(()=>{if(this.au===a){Music.setDuck(false);if(!this.sys(text,who,end))end()}});return true}catch(e){return this.sys(text,who,done)} },
 el(){if(!this._a)this._a=new Audio();return this._a},
 unlock(){try{const a=this.el();a.src='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';const p=a.play();if(p&&p.catch)p.catch(()=>{})}catch(e){}},
 stop(){ try{speechSynthesis.cancel()}catch(e){} if(this.au){const a=this.au;this.au=null;a.onended=a.onerror=null;try{a.pause()}catch(e){}} Music.setDuck(false) }
};

/* ---------- art ---------- */
const Art={L:{},stars:[],flies:[],
 init(){this.setTheme('park')},
 setTheme(th){if(this.th===th&&this.L.sky)return;this.th=th;this.stars=[];this.flies=[];th==='space'?this.buildSpace():this.buildPark()},
 buildPark(){
  const R=rng(7);
  for(let i=0;i<90;i++)this.stars.push({x:R()*VW,y:R()*330,r:R()*1.6+.4,p:R()*TAU});
  for(let i=0;i<26;i++)this.flies.push({x:R()*VW,y:420+R()*220,p:R()*TAU,s:.3+R()});
  // sky
  let c=this.mk(VW,VH);let x=c.getContext('2d');
  x.fillStyle=lg(x,0,0,0,VH,[[0,'#070b34'],[.35,'#2a1b78'],[.62,'#8a3b9e'],[.78,'#ff7ea8'],[.9,'#ffb36b']]);x.fillRect(0,0,VW,VH);
  // far clouds
  for(let i=0;i<7;i++){const cx=R()*VW,cy=250+R()*140;x.fillStyle='rgba(255,180,220,.10)';for(let k=0;k<5;k++){x.beginPath();x.ellipse(cx+k*46,cy+Math.sin(k)*10,70,16,0,0,TAU);x.fill()}}
  this.L.sky=c;
  // city
  const CW=2300;c=this.mk(CW,380);x=c.getContext('2d');
  let bx=0;while(bx<CW){const w=44+R()*70,h=70+R()*210;x.fillStyle=lg(x,0,380-h,0,380,[[0,'#2b1a6b'],[1,'#150f45']]);x.fillRect(bx,380-h,w,h);
   if(R()>.7){x.fillRect(bx+w*.4,380-h-26,5,26)}
   for(let wy=380-h+10;wy<366;wy+=15)for(let wx=bx+7;wx<bx+w-9;wx+=13){if(R()>.62){x.fillStyle=R()>.5?'rgba(255,214,130,.85)':'rgba(125,249,255,.55)';x.fillRect(wx,wy,6,8)}}
   bx+=w+R()*8}
  // TV tower
  const tx=1180;x.fillStyle='#1a1055';x.beginPath();x.moveTo(tx-9,380);x.lineTo(tx-3,60);x.lineTo(tx+3,60);x.lineTo(tx+9,380);x.fill();x.fillRect(tx-22,150,44,16);x.fillRect(tx-14,110,28,12);x.fillStyle='#ff4d8d';x.beginPath();x.arc(tx,56,5,0,TAU);x.fill();
  this.L.city=c;
  // hills + pines
  const HW=2800;c=this.mk(HW,300);x=c.getContext('2d');
  x.fillStyle=lg(x,0,60,0,300,[[0,'#24206e'],[1,'#120f3a']]);x.beginPath();x.moveTo(0,300);for(let i=0;i<=HW;i+=20)x.lineTo(i,120+Math.sin(i*.004)*40+Math.sin(i*.011+2)*22);x.lineTo(HW,300);x.fill();
  for(let i=0;i<110;i++){const px=R()*HW,py=140+Math.sin(px*.004)*40+Math.sin(px*.011+2)*22+R()*30,s=.6+R()*.8;x.fillStyle='#0e0b34';for(let k=0;k<3;k++){x.beginPath();x.moveTo(px,py-70*s+k*22*s);x.lineTo(px-26*s,py-24*s+k*22*s);x.lineTo(px+26*s,py-24*s+k*22*s);x.fill()}x.fillRect(px-3*s,py-6*s,6*s,12*s)}
  this.L.hills=c;
  // trees
  const TW=3800;c=this.mk(TW,360);x=c.getContext('2d');
  for(let i=0;i<46;i++){const px=60+i*80+R()*40,h=120+R()*100;x.fillStyle='#0b1a3d';x.fillRect(px-7,360-h,14,h);const col=['#17407a','#1b5a7a','#2a3d8c'][i%3];for(let k=0;k<4;k++){x.fillStyle=lg(x,0,360-h-40,0,360-h+40,[[0,'#2f8f9a'],[1,col]]);x.beginPath();x.arc(px+(k-1.5)*22,360-h-10+(k%2)*18,40+R()*10,0,TAU);x.fill()}}
  this.L.trees=c;
 },
 buildSpace(){
  const R=rng(11);
  for(let i=0;i<170;i++)this.stars.push({x:R()*VW,y:R()*420,r:R()*1.8+.3,p:R()*TAU});
  for(let i=0;i<30;i++)this.flies.push({x:R()*VW,y:300+R()*340,p:R()*TAU,s:.3+R()});
  let c=this.mk(VW,VH),x=c.getContext('2d');
  x.fillStyle=lg(x,0,0,0,VH,[[0,'#02030f'],[.4,'#0e0a3a'],[.75,'#2a1260'],[1,'#5b2a8a']]);x.fillRect(0,0,VW,VH);
  [[300,180,280,'rgba(255,80,170,.22)'],[900,120,320,'rgba(80,160,255,.18)'],[640,320,260,'rgba(150,90,255,.18)']].forEach(n=>{const g=x.createRadialGradient(n[0],n[1],10,n[0],n[1],n[2]);g.addColorStop(0,n[3]);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,VW,VH)});
  const px=1010,py=215,pr=105;
  const ringHalf=(a0,a1)=>{x.save();x.translate(px,py);x.rotate(-.35);x.strokeStyle='rgba(255,224,176,.6)';x.lineWidth=15;x.beginPath();x.ellipse(0,0,178,40,0,a0,a1);x.stroke();x.strokeStyle='rgba(255,180,120,.35)';x.lineWidth=6;x.beginPath();x.ellipse(0,0,205,47,0,a0,a1);x.stroke();x.restore()};
  ringHalf(Math.PI,TAU);
  let g=x.createRadialGradient(px-36,py-36,8,px,py,pr);g.addColorStop(0,'#ffe0b0');g.addColorStop(.5,'#e8794f');g.addColorStop(1,'#5a2377');x.fillStyle=g;x.beginPath();x.arc(px,py,pr,0,TAU);x.fill();
  x.save();x.beginPath();x.arc(px,py,pr,0,TAU);x.clip();x.strokeStyle='rgba(255,255,255,.12)';x.lineWidth=9;for(let i=-3;i<=3;i++){x.beginPath();x.ellipse(px,py+i*26,pr,10,0,0,TAU);x.stroke()}x.restore();
  ringHalf(0,Math.PI);
  g=x.createRadialGradient(222,142,4,240,150,40);g.addColorStop(0,'#c5f2ff');g.addColorStop(.5,'#2b79d6');g.addColorStop(1,'#0a2a6a');x.fillStyle=g;x.beginPath();x.arc(240,150,38,0,TAU);x.fill();
  this.L.sky=c;
  const CW=2300;c=this.mk(CW,380);x=c.getContext('2d');
  let bx=0;while(bx<CW){const t=R(),w=50+R()*80;
   x.fillStyle=lg(x,0,200,0,380,[[0,'#2a2d82'],[1,'#12134a']]);
   if(t<.35){const h=40+R()*50;x.beginPath();x.ellipse(bx+w/2,380,w/2,h+20,0,Math.PI,TAU);x.fill();x.strokeStyle='rgba(125,249,255,.7)';x.lineWidth=2;x.stroke();for(let k=0;k<4;k++){x.fillStyle='rgba(125,249,255,.55)';x.fillRect(bx+10+k*(w-24)/4,380-h*.5+(k%2)*8,6,8)}}
   else{const h=90+R()*190;x.fillRect(bx,380-h,w,h);x.fillStyle='rgba(125,249,255,.8)';x.fillRect(bx,380-h,w,3);x.fillStyle='#2a2d82';if(R()>.4){x.fillRect(bx+w/2-2,380-h-34,4,34);x.fillStyle='#ff4d8d';x.beginPath();x.arc(bx+w/2,380-h-36,4,0,TAU);x.fill()}
    for(let wy=380-h+12;wy<366;wy+=16)for(let wx=bx+8;wx<bx+w-10;wx+=14){if(R()>.6){x.fillStyle=R()>.5?'rgba(255,214,130,.8)':'rgba(125,249,255,.6)';x.fillRect(wx,wy,6,8)}}}
   bx+=w+R()*14}
  this.L.city=c;
  const HW=2800;c=this.mk(HW,300);x=c.getContext('2d');
  x.fillStyle=lg(x,0,60,0,300,[[0,'#3a2f86'],[1,'#17144a']]);x.beginPath();x.moveTo(0,300);let hx=0,hy=170;while(hx<=HW){x.lineTo(hx,hy);hx+=30+R()*50;hy=clamp(hy+(R()-.5)*90,60,210)}x.lineTo(HW,300);x.fill();
  for(let i=0;i<40;i++){const cx=R()*HW,cy=200+R()*60;x.fillStyle='rgba(10,8,50,.45)';x.beginPath();x.ellipse(cx,cy,24+R()*30,6+R()*5,0,0,TAU);x.fill()}
  this.L.hills=c;
  const TW=3800;c=this.mk(TW,360);x=c.getContext('2d');
  for(let i=0;i<40;i++){const px2=50+i*95+R()*50,n=2+Math.floor(R()*3);for(let k=0;k<n;k++){const w=14+R()*16,h=90+R()*150,cx=px2+(k-n/2)*20,col=R()>.5?['#7df9ff','#3a8fe0']:['#ff7bd5','#7b4fe0'];
    x.fillStyle=lg(x,0,360-h,0,360,[[0,col[0]],[1,col[1]]]);x.globalAlpha=.88;x.beginPath();x.moveTo(cx-w,360);x.lineTo(cx-w*.7,360-h*.8);x.lineTo(cx,360-h);x.lineTo(cx+w*.7,360-h*.8);x.lineTo(cx+w,360);x.fill();x.fillStyle='rgba(255,255,255,.25)';x.beginPath();x.moveTo(cx,360-h);x.lineTo(cx+w*.7,360-h*.8);x.lineTo(cx+w,360);x.lineTo(cx,360);x.fill();x.globalAlpha=1}}
  this.L.trees=c;
 },
 groundSpace(c,cam,t){
  c.fillStyle=lg(c,0,GY+25,0,VH,[[0,'#1a2060'],[.4,'#10153f'],[1,'#080b25']]);c.fillRect(0,GY+25,VW,VH-GY-25);
  c.fillStyle='rgba(125,249,255,.5)';c.fillRect(0,GY+25,VW,3);
  c.fillStyle=lg(c,0,630,0,710,[[0,'#3a4294'],[1,'#222868']]);c.fillRect(0,632,VW,72);
  c.fillStyle='rgba(125,249,255,.85)';c.fillRect(0,632,VW,3);c.fillStyle='rgba(255,123,213,.7)';c.fillRect(0,702,VW,2);
  c.strokeStyle='rgba(125,249,255,.18)';c.lineWidth=2;const off=-(cam%110);for(let x=off;x<VW+110;x+=110){c.beginPath();c.moveTo(x,635);c.lineTo(x-24,702);c.stroke()}
  const o2=-(cam%240);for(let x=o2;x<VW+240;x+=240){const on=Math.floor(t*2+x/240)%2;c.fillStyle=on?'#7df9ff':'#ff7bd5';c.beginPath();c.arc(x,645,4,0,TAU);c.fill()}
 },
 pylons(c,cam,t){for(let wx=300;wx<3700;wx+=520){const x=wx-cam;if(x<-80||x>VW+80)continue;c.fillStyle='#161a58';c.beginPath();c.moveTo(x-9,GY+55);c.lineTo(x-4,GY-150);c.lineTo(x+4,GY-150);c.lineTo(x+9,GY+55);c.fill();const pu=.6+.4*Math.sin(t*3+wx);const g=c.createRadialGradient(x,GY-156,2,x,GY-156,120);g.addColorStop(0,'rgba(125,249,255,'+(.7*pu)+')');g.addColorStop(1,'rgba(125,249,255,0)');c.fillStyle=g;c.fillRect(x-120,GY-280,240,250);c.fillStyle='#e8ffff';c.beginPath();c.arc(x,GY-156,8,0,TAU);c.fill();c.strokeStyle='#7df9ff';c.lineWidth=3;c.beginPath();c.ellipse(x,GY-120,22,6,0,0,TAU);c.stroke()}},
 orrery(c,cx,gy,sp,s,o={}){
  const rx=215*s,ry=54*s,hy=gy-150*s;
  c.fillStyle='rgba(0,0,20,.35)';c.beginPath();c.ellipse(cx,gy+22*s,rx+24*s,ry+10*s,0,0,TAU);c.fill();
  c.fillStyle='#232a78';c.beginPath();c.ellipse(cx,gy+16*s,rx+6*s,ry+6*s,0,0,TAU);c.fill();c.fillRect(cx-rx-6*s,gy,2*rx+12*s,16*s);c.fillStyle='#161a58';c.beginPath();c.ellipse(cx,gy+16*s,rx+6*s,ry+6*s,0,0,Math.PI);c.lineTo(cx-rx-6*s,gy);c.fill();
  const g0=c.createRadialGradient(cx,gy,10,cx,gy,rx);g0.addColorStop(0,'#4a56c4');g0.addColorStop(1,'#242b80');c.fillStyle=g0;c.beginPath();c.ellipse(cx,gy,rx,ry,0,0,TAU);c.fill();
  c.strokeStyle='rgba(125,249,255,.9)';c.lineWidth=3*s;c.beginPath();c.ellipse(cx,gy,rx,ry,0,0,TAU);c.stroke();c.strokeStyle='rgba(125,249,255,.3)';c.beginPath();c.ellipse(cx,gy,rx*.6,ry*.6,0,0,TAU);c.stroke();
  // column
  c.fillStyle=lg(c,cx-14*s,0,cx+14*s,0,[[0,'#3a4294'],[.5,'#8f9cf0'],[1,'#2a3080']]);c.fillRect(cx-14*s,hy,28*s,gy-hy);
  // orbit
  const ox=170*s,oy=44*s,a=sp,mo=sp*9;
  c.strokeStyle='rgba(125,249,255,.55)';c.lineWidth=2*s;c.setLineDash([8*s,7*s]);c.beginPath();c.ellipse(cx,hy,ox,oy,0,0,TAU);c.stroke();c.setLineDash([]);
  const ex=cx+ox*Math.cos(a),ey=hy+oy*Math.sin(a);
  const mx=ex+36*s*Math.cos(mo),my=ey+11*s*Math.sin(mo);
  const sun=()=>{const g=c.createRadialGradient(cx,hy,4,cx,hy,74*s);g.addColorStop(0,'rgba(255,230,120,.95)');g.addColorStop(.35,'rgba(255,160,60,.5)');g.addColorStop(1,'rgba(255,120,60,0)');c.fillStyle=g;c.fillRect(cx-76*s,hy-76*s,152*s,152*s);c.fillStyle='#fff0a8';c.beginPath();c.arc(cx,hy,26*s,0,TAU);c.fill();c.fillStyle='#ffc44a';c.beginPath();c.arc(cx+4*s,hy+4*s,20*s,0,TAU);c.fill()};
  const earth=()=>{c.strokeStyle='rgba(180,200,255,.5)';c.lineWidth=2*s;c.beginPath();c.moveTo(cx,hy);c.lineTo(ex,ey);c.stroke();
   if(!o.noMark){const gl=c.createRadialGradient(ex,ey,2,ex,ey,50*s);gl.addColorStop(0,'rgba(125,249,255,.8)');gl.addColorStop(1,'rgba(125,249,255,0)');c.fillStyle=gl;c.fillRect(ex-52*s,ey-52*s,104*s,104*s)}
   const g=c.createRadialGradient(ex-6*s,ey-6*s,2,ex,ey,17*s);g.addColorStop(0,'#bff0ff');g.addColorStop(.55,'#2b8be6');g.addColorStop(1,'#0b3a8a');c.fillStyle=g;c.beginPath();c.arc(ex,ey,17*s,0,TAU);c.fill();c.fillStyle='rgba(80,220,140,.8)';c.beginPath();c.ellipse(ex-4*s+Math.sin(sp*6)*3*s,ey-2*s,6*s,4*s,.5,0,TAU);c.fill();
   c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1.5*s;c.setLineDash([3*s,4*s]);c.beginPath();c.ellipse(ex,ey,36*s,11*s,0,0,TAU);c.stroke();c.setLineDash([])};
  const moon=()=>{c.fillStyle='#d8dcea';c.beginPath();c.arc(mx,my,7*s,0,TAU);c.fill();c.fillStyle='rgba(120,130,160,.6)';c.beginPath();c.arc(mx-2*s,my-1*s,2*s,0,TAU);c.fill()};
  const items=[{d:0,f:sun},{d:Math.sin(a),f:earth},{d:Math.sin(a)+Math.sin(mo)*.05+.001,f:moon}];
  if(Math.sin(a)<0){items[1].d=-1;items[2].d=-.99;items[0].d=0}
  items.sort((p,q)=>p.d-q.d).forEach(i=>i.f());
  c.strokeStyle='rgba(125,249,255,.55)';c.lineWidth=2*s;c.beginPath();c.ellipse(cx,hy,ox,oy,0,0,Math.PI);c.stroke();
  // top hologram ring
  c.strokeStyle='rgba(255,123,213,.7)';c.lineWidth=3*s;c.beginPath();c.ellipse(cx,hy-100*s,34*s,9*s,0,0,TAU);c.stroke();c.fillStyle='rgba(255,123,213,.85)';c.beginPath();c.arc(cx,hy-100*s,4*s,0,TAU);c.fill();
  return {x:ex,y:ey}
 },

 mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c},
 bg(c,cam,t){
  c.drawImage(this.L.sky,0,0);
  // moon
  if(this.th!=='space'){const mx=930-cam*.03,my=150;let g=c.createRadialGradient(mx,my,10,mx,my,170);g.addColorStop(0,'rgba(255,245,210,.55)');g.addColorStop(1,'rgba(255,245,210,0)');c.fillStyle=g;c.fillRect(mx-180,my-180,360,360);
  c.fillStyle='#fff6d6';c.beginPath();c.arc(mx,my,56,0,TAU);c.fill();c.fillStyle='rgba(220,200,160,.5)';[[-16,-10,12],[14,8,9],[-4,24,7]].forEach(q=>{c.beginPath();c.arc(mx+q[0],my+q[1],q[2],0,TAU);c.fill()});}
  for(const s of this.stars){c.globalAlpha=.4+.6*Math.abs(Math.sin(t*1.3+s.p));c.fillStyle='#fff';c.beginPath();c.arc((s.x-cam*.02+VW)%VW,s.y,s.r,0,TAU);c.fill()}c.globalAlpha=1;
  c.drawImage(this.L.city,-cam*.12,GY-340-30);
  c.drawImage(this.L.hills,-cam*.3,GY-250);
  c.drawImage(this.L.trees,-cam*.6,GY-300);
 },
 ground(c,cam,t){
  if(this.th==='space')return this.groundSpace(c,cam,t);
  // grass
  c.fillStyle=lg(c,0,GY+25,0,VH,[[0,'#1f6f68'],[.35,'#14504f'],[1,'#0b2f3d']]);c.fillRect(0,GY+25,VW,VH-GY-25);
  c.fillStyle='rgba(0,0,0,.16)';c.fillRect(0,GY+25,VW,5);
  // path
  c.fillStyle=lg(c,0,630,0,710,[[0,'#4a4fa6'],[1,'#2d2f78']]);c.beginPath();c.moveTo(0,632);c.lineTo(VW,632);c.lineTo(VW,704);c.lineTo(0,704);c.fill();
  c.fillStyle='rgba(255,255,255,.07)';c.fillRect(0,632,VW,3);
  c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=3;const off=-(cam%120);for(let x=off;x<VW+120;x+=120){c.beginPath();c.moveTo(x,634);c.lineTo(x-26,704);c.stroke()}
  // tufts
  const R=rng(3);c.fillStyle='#2fae86';for(let i=0;i<70;i++){const wx=i*65+R()*40,sx=((wx-cam)%(VW+200)+VW+200)%(VW+200)-100,sy=R()>.5?600+R()*28:712+R()*8;if(sy>700&&sy<712)continue;c.beginPath();c.moveTo(sx-6,sy);c.lineTo(sx-3,sy-12);c.lineTo(sx,sy);c.lineTo(sx+3,sy-15);c.lineTo(sx+6,sy);c.fill()}
 },
 lamps(c,cam,t){ if(this.th==='space')return this.pylons(c,cam,t); for(let wx=300;wx<3700;wx+=520){const x=wx-cam;if(x<-80||x>VW+80)continue;c.fillStyle='#10163f';c.fillRect(x-4,GY-120,8,175);rr(c,x-18,GY-138,36,20,6);c.fill();const g=c.createRadialGradient(x,GY-126,2,x,GY-126,150);g.addColorStop(0,'rgba(255,224,150,.55)');g.addColorStop(1,'rgba(255,224,150,0)');c.fillStyle=g;c.fillRect(x-150,GY-280,300,300);c.fillStyle='#ffe9a6';c.beginPath();c.arc(x,GY-126,8,0,TAU);c.fill()} },
 flyDraw(c,cam,t){ for(const f of this.flies){const x=((f.x-cam*.9+Math.sin(t*f.s+f.p)*30)%VW+VW)%VW,y=f.y+Math.cos(t*f.s*1.3+f.p)*20;c.globalAlpha=.5+.5*Math.sin(t*2+f.p);const g=c.createRadialGradient(x,y,0,x,y,10);const sp=this.th==='space';g.addColorStop(0,sp?'rgba(150,240,255,.95)':'rgba(190,255,150,.95)');g.addColorStop(1,sp?'rgba(150,240,255,0)':'rgba(190,255,150,0)');c.fillStyle=g;c.fillRect(x-10,y-10,20,20)}c.globalAlpha=1 },
 shadow(c,x,w,a=.32){c.fillStyle='rgba(0,0,20,'+a+')';c.beginPath();c.ellipse(x,FEET+4,w,w*.22,0,0,TAU);c.fill()},
 spark(c,x,y,t,s=1){c.save();c.translate(x,y+Math.sin(t*3+x)*5);c.rotate(Math.sin(t*2+x)*.2);const g=c.createRadialGradient(0,0,2,0,0,34*s);g.addColorStop(0,'rgba(125,249,255,.8)');g.addColorStop(1,'rgba(125,249,255,0)');c.fillStyle=g;c.fillRect(-36*s,-36*s,72*s,72*s);c.fillStyle='#e8ffff';c.beginPath();for(let i=0;i<8;i++){const r=i%2?7*s:17*s,a=i*Math.PI/4-Math.PI/2;c.lineTo(Math.cos(a)*r,Math.sin(a)*r)}c.closePath();c.fill();c.strokeStyle='#38d6ff';c.lineWidth=2;c.stroke();c.restore()},
 cube(c,x,t,seed){ c.save();c.translate(x,FEET);this.shadow(c,0,40,.3);c.restore();c.save();c.translate(x,FEET-5);const j=Math.sin(t*14+seed)>.82?(Math.random()-.5)*10:0;
  c.fillStyle=lg(c,-30,-70,30,0,[[0,'#8b5cf6'],[1,'#4c1d95']]);rr(c,-30+j,-62,60,60,8);c.fill();c.fillStyle='#a78bfa';c.beginPath();c.moveTo(-30+j,-62);c.lineTo(-18+j,-76);c.lineTo(42+j,-76);c.lineTo(30+j,-62);c.fill();c.fillStyle='#3b0f7a';c.beginPath();c.moveTo(30+j,-62);c.lineTo(42+j,-76);c.lineTo(42+j,-18);c.lineTo(30+j,-2);c.fill();
  c.fillStyle='rgba(125,249,255,.85)';c.fillRect(-30-6*(j!==0),-44,66,6);c.fillStyle='rgba(255,60,160,.8)';c.fillRect(-26+8*(j!==0),-24,56,5);
  c.fillStyle='#fff';c.fillRect(-14,-52,8,12);c.fillRect(6,-52,8,12);c.fillStyle='#111';c.fillRect(-12+(j?2:0),-48,4,6);c.fillRect(8+(j?2:0),-48,4,6);c.restore()},
 max(c,x,y,o){
  const ph=o.ph||0,air=!!o.air,s=o.s||1,run=o.run||0;c.save();c.translate(x,y);c.scale((o.face||1)*s,s);
  const hipX=-2,hipY=-64,shX=0,shY=-108,breath=Math.sin((o.t||0)*3)*1.2*(1-run);
  const legs=side=>{const a=air?(side?.7:-.5):Math.sin(ph+(side?Math.PI:0))*.85*run;const lift=air?(side?16:6):Math.max(0,Math.cos(ph+(side?Math.PI:0)))*18*run;const fx=hipX+Math.sin(a)*58,fy=hipY+Math.cos(a)*58-lift;
   c.strokeStyle=side?'#27338a':'#1c2670';c.lineWidth=18;c.lineCap='round';c.beginPath();c.moveTo(hipX,hipY);c.lineTo(fx,fy-6);c.stroke();
   c.fillStyle='#fff';c.beginPath();c.ellipse(fx+6,fy-3,17,9,0,0,TAU);c.fill();c.fillStyle='#ff6b3d';c.fillRect(fx-8,fy+1,28,4)};
  const arm=side=>{const a=air?(side?-1.5:-.4):-Math.sin(ph+(side?Math.PI:0))*1.0*run+(run?0:.1);const hx=shX+Math.sin(a)*42,hy=shY+Math.cos(a)*42+10;
   c.strokeStyle=side?'#16b5a3':'#0f8f82';c.lineWidth=15;c.lineCap='round';c.beginPath();c.moveTo(shX,shY+4);c.lineTo(hx,hy);c.stroke();c.fillStyle='#ffd4ac';c.beginPath();c.arc(hx,hy,8,0,TAU);c.fill()};
  legs(0);arm(0);
  // backpack
  c.fillStyle='#ff8a3d';rr(c,-36,-110+breath,20,40,7);c.fill();c.fillStyle='#e56d22';rr(c,-36,-92+breath,20,10,4);c.fill();
  // torso
  c.fillStyle=lg(c,-20,-112,20,-58,[[0,'#2fe0c8'],[1,'#12a190']]);rr(c,-20,-114+breath,40,56,15);c.fill();
  c.fillStyle='rgba(255,255,255,.9)';c.fillRect(-20,-70+breath,40,5);
  c.fillStyle='#ffd23f';c.beginPath();c.moveTo(3,-104+breath);c.lineTo(-7,-90+breath);c.lineTo(-1,-90+breath);c.lineTo(-5,-78+breath);c.lineTo(8,-95+breath);c.lineTo(1,-95+breath);c.closePath();c.fill();
  legs(1);
  // head
  const hy=-137+breath;c.fillStyle='#ffd4ac';c.beginPath();c.arc(3,hy,25,0,TAU);c.fill();
  c.fillStyle='#3a2418';c.beginPath();c.arc(1,hy-3,27,Math.PI*.92,Math.PI*2.08);c.lineTo(22,hy-12);c.lineTo(8,hy-24);c.closePath();c.fill();
  for(let i=0;i<4;i++){c.beginPath();c.moveTo(-18+i*13,hy-22);c.lineTo(-12+i*13,hy-40-(i%2)*6);c.lineTo(-4+i*13,hy-22);c.fill()}
  c.fillStyle='#3a2418';c.beginPath();c.ellipse(-20,hy+2,7,15,0,0,TAU);c.fill();
  const blink=((o.t||0)%3.4)<.12;c.fillStyle='#fff';c.beginPath();c.ellipse(15,hy+1,7,blink?1:8,0,0,TAU);c.fill();if(!blink){c.fillStyle='#14213d';c.beginPath();c.arc(17,hy+2,4,0,TAU);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(18.5,hy,1.4,0,TAU);c.fill()}
  c.strokeStyle='#8a4b2a';c.lineWidth=2.5;c.lineCap='round';c.beginPath();c.arc(14,hy+12,7,.15,Math.PI-.5);c.stroke();c.strokeStyle='#3a2418';c.lineWidth=3;c.beginPath();c.moveTo(9,hy-11);c.lineTo(22,hy-9);c.stroke();
  c.fillStyle='rgba(255,120,120,.35)';c.beginPath();c.arc(8,hy+10,5,0,TAU);c.fill();
  arm(1);c.restore()},
 giro(c,x,y,t,o={}){
  c.save();c.translate(x,y+Math.sin(t*2.4)*7);const tilt=(o.tilt||0);c.rotate(tilt);
  // jets
  const g=c.createRadialGradient(0,44,2,0,56,30);g.addColorStop(0,'rgba(125,249,255,.85)');g.addColorStop(1,'rgba(125,249,255,0)');c.fillStyle=g;c.fillRect(-30,40,60,50);
  // antenna
  c.strokeStyle='#8fa3d6';c.lineWidth=4;c.beginPath();c.moveTo(0,-38);c.lineTo(0,-58);c.stroke();c.fillStyle=Math.sin(t*5)>0?'#ff4d8d':'#ffd1e3';c.beginPath();c.arc(0,-62,6,0,TAU);c.fill();
  // arms
  c.fillStyle='#b9c6ee';c.beginPath();c.ellipse(-42,6+Math.sin(t*3)*3,9,13,.5,0,TAU);c.fill();c.beginPath();c.ellipse(42,6+Math.cos(t*3)*3,9,13,-.5,0,TAU);c.fill();
  // body
  c.fillStyle=lg(c,-34,-36,34,40,[[0,'#f2f6ff'],[.6,'#b5c4ef'],[1,'#7f8fcf']]);c.beginPath();c.arc(0,0,38,0,TAU);c.fill();c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=2;c.stroke();
  // visor
  c.fillStyle='#0a1238';rr(c,-30,-18,60,34,16);c.fill();c.strokeStyle='#38d6ff';c.lineWidth=2;c.stroke();
  const bl=(t%4)<.13,m=o.mood||0;c.fillStyle='#7df9ff';
  if(bl){c.fillRect(-18,-1,13,3);c.fillRect(5,-1,13,3)}else if(m===1){c.lineWidth=4;c.strokeStyle='#7df9ff';c.beginPath();c.arc(-11,3,8,Math.PI*1.1,Math.PI*1.9);c.stroke();c.beginPath();c.arc(11,3,8,Math.PI*1.1,Math.PI*1.9);c.stroke()}else{c.beginPath();c.ellipse(-11,-1,6,8,0,0,TAU);c.fill();c.beginPath();c.ellipse(11,-1,6,8,0,0,TAU);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(-9,-4,2,0,TAU);c.arc(13,-4,2,0,TAU);c.fill()}
  c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.ellipse(-14,-28,12,6,-.5,0,TAU);c.fill();
  c.restore()},
 carousel(c,cx,gy,sp,s,o={}){
  const rx=215*s,ry=54*s,canY=gy-255*s,apex=canY-92*s,cols=['#ff7bd5','#7df9ff','#ffd166','#9b8bff','#6ee7a8'];
  // base
  c.fillStyle='rgba(0,0,20,.35)';c.beginPath();c.ellipse(cx,gy+22*s,rx+24*s,ry+10*s,0,0,TAU);c.fill();
  c.fillStyle='#6b3a2a';c.beginPath();c.ellipse(cx,gy+16*s,rx+6*s,ry+6*s,0,0,TAU);c.fill();c.fillRect(cx-rx-6*s,gy,2*rx+12*s,16*s);
  c.fillStyle=lg(c,0,gy,0,gy+18*s,[[0,'#d9704f'],[1,'#8a3d2c']]);c.beginPath();c.ellipse(cx,gy+16*s,rx+6*s,ry+6*s,0,0,Math.PI);c.lineTo(cx-rx-6*s,gy);c.fill();
  for(let i=0;i<28;i++){const a0=sp+i*TAU/28,a1=a0+TAU/28;if(Math.sin((a0+a1)/2)<0)continue;c.fillStyle=i%2?'#ffd166':'#ff4d8d';c.beginPath();c.moveTo(cx+(rx+6*s)*Math.cos(a0),gy+(ry+6*s)*Math.sin(a0));c.lineTo(cx+(rx+6*s)*Math.cos(a1),gy+(ry+6*s)*Math.sin(a1));c.lineTo(cx+(rx+6*s)*Math.cos(a1),gy+(ry+6*s)*Math.sin(a1)+14*s);c.lineTo(cx+(rx+6*s)*Math.cos(a0),gy+(ry+6*s)*Math.sin(a0)+14*s);c.fill()}
  // floor
  const fg=c.createRadialGradient(cx,gy,10,cx,gy,rx);fg.addColorStop(0,'#fff0c2');fg.addColorStop(1,'#e9a46a');c.fillStyle=fg;c.beginPath();c.ellipse(cx,gy,rx,ry,0,0,TAU);c.fill();
  c.strokeStyle='rgba(180,70,70,.35)';c.lineWidth=3*s;for(let i=0;i<8;i++){const a=sp+i*TAU/8;c.beginPath();c.moveTo(cx,gy);c.lineTo(cx+rx*Math.cos(a),gy+ry*Math.sin(a));c.stroke()}
  c.strokeStyle='rgba(180,70,70,.4)';c.beginPath();c.ellipse(cx,gy,rx*.72,ry*.72,0,0,TAU);c.stroke();
  // seats data
  const n=5,seats=[];for(let k=0;k<n;k++){const a=sp+k*TAU/n;seats.push({k,a,sn:Math.sin(a),px:cx+rx*.72*Math.cos(a),py:gy+ry*.72*Math.sin(a)})}
  seats.sort((p,q)=>p.sn-q.sn);
  const seat=q=>{const bob=Math.sin(q.a*2)*7*s,sy=q.py-84*s+bob,fx=-Math.sin(q.a)>=0?1:-1;
   c.strokeStyle='#ffd166';c.lineWidth=7*s;c.beginPath();c.moveTo(q.px,q.py);c.lineTo(q.px,canY+6*s);c.stroke();c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=2*s;c.beginPath();c.moveTo(q.px-1.5*s,q.py);c.lineTo(q.px-1.5*s,canY+6*s);c.stroke();
   const col=cols[q.k];c.save();c.translate(q.px,sy);c.scale(fx*s,s);
   c.fillStyle=col;rr(c,-34,-14,68,34,16);c.fill();c.fillStyle='rgba(255,255,255,.35)';rr(c,-28,-10,50,8,4);c.fill();
   c.fillStyle=col;c.beginPath();c.ellipse(34,-14,14,12,.3,0,TAU);c.fill();c.beginPath();c.moveTo(30,-24);c.lineTo(34,-38);c.lineTo(40,-24);c.fill();
   c.fillStyle='#14213d';c.beginPath();c.arc(38,-16,3,0,TAU);c.fill();c.fillStyle='#ffd166';rr(c,-14,-22,26,10,5);c.fill();
   c.fillStyle='#fff';c.fillRect(-26,16,8,12);c.fillRect(14,16,8,12);c.restore();
   if(q.k===0&&!o.noMark){const gl=c.createRadialGradient(q.px,sy,2,q.px,sy,50*s);gl.addColorStop(0,'rgba(125,249,255,.9)');gl.addColorStop(1,'rgba(125,249,255,0)');c.fillStyle=gl;c.fillRect(q.px-52*s,sy-52*s,104*s,104*s);c.strokeStyle='#7df9ff';c.lineWidth=3*s;c.beginPath();c.arc(q.px,sy,36*s,0,TAU);c.stroke()}};
  seats.filter(q=>q.sn<0).forEach(seat);
  // pole
  c.fillStyle=lg(c,cx-12*s,0,cx+12*s,0,[[0,'#b8860b'],[.4,'#ffe27a'],[1,'#a06a08']]);c.fillRect(cx-12*s,canY,24*s,gy-canY);
  seats.filter(q=>q.sn>=0).forEach(seat);
  // canopy
  const sl=18,sli=[];for(let i=0;i<sl;i++){const a0=sp*.0+i*TAU/sl,a1=a0+TAU/sl,m=(a0+a1)/2;sli.push({i,a0,a1,sn:Math.sin(m)})}sli.sort((p,q)=>p.sn-q.sn);
  const rX=rx*1.1,rY=ry*1.12;sli.forEach(q=>{c.fillStyle=q.i%2?'#fff2c9':'#ff4d8d';c.beginPath();c.moveTo(cx,apex);c.lineTo(cx+rX*Math.cos(q.a0),canY+rY*Math.sin(q.a0));c.lineTo(cx+rX*Math.cos(q.a1),canY+rY*Math.sin(q.a1));c.closePath();c.fill();c.fillStyle='rgba(0,0,40,'+(.28-.22*(q.sn+1)/2)+')';c.fill()});
  c.strokeStyle='#ffd166';c.lineWidth=5*s;c.beginPath();c.ellipse(cx,canY,rX,rY,0,0,Math.PI);c.stroke();
  for(let i=0;i<22;i++){const a=i*TAU/22+.1;if(Math.sin(a)<0)continue;const on=(Math.floor((o.t||0)*3)+i)%2;c.fillStyle=on?'#fff7b0':'#ff9e3d';c.beginPath();c.arc(cx+rX*Math.cos(a),canY+rY*Math.sin(a)+6*s,5*s,0,TAU);c.fill()}
  c.fillStyle='#ffd166';c.beginPath();c.arc(cx,apex-6*s,10*s,0,TAU);c.fill();c.fillRect(cx-2*s,apex-34*s,4*s,28*s);c.fillStyle='#ff4d8d';c.beginPath();c.moveTo(cx+2*s,apex-34*s);c.lineTo(cx+30*s,apex-26*s);c.lineTo(cx+2*s,apex-18*s);c.fill();
  return seats.find(q=>q.k===0)}
};
