/* Шпаргалки: аркуш A4 малюється на canvas, зберігається як PDF (JPEG усередині) або друкується. */
const Cheat={sel:'all',cv:null,
 zones(){return (typeof ZL==='function'?ZL():[]).filter(z=>Theory.data(z.id))},
 open(){this.sel='all';$('cheat').hidden=false;this.tabs();this.draw()},
 tabs(){$('chTabs').innerHTML='<button class="btn '+(this.sel==='all'?'':'ghost')+'" data-s="all">Усі теми</button>'+this.zones().map(z=>'<button class="btn '+(this.sel==z.id?'':'ghost')+'" data-s="'+z.id+'">'+z.par+'</button>').join('')},
 wrap(ctx,t,w){const o=[];let l='';for(const s of t.split(' ')){const x=l?l+' '+s:s;if(ctx.measureText(x).width>w&&l){o.push(l);l=s}else l=x}if(l)o.push(l);return o},
 draw(){const W=1240,H=1754,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  x.fillStyle='#fff';x.fillRect(0,0,W,H);x.fillStyle='#0f172a';x.font='800 54px Rubik,sans-serif';
  const co=COURSE(),all=this.sel==='all',zs=this.zones().filter(z=>all||z.id==this.sel);
  x.fillText('Шпаргалка · '+co.subj+', '+co.grade+' клас',60,95);x.fillStyle='#64748b';x.font='400 24px Rubik,sans-serif';x.fillText('Фізикон'+(CUR&&CUR.name?' · '+CUR.name:''),60,135);
  const cols=all?2:1,cw=(W-120-(cols-1)*40)/cols;let cx=60,cy=180,rowY=[180,180],k=0;
  zs.forEach(z=>{const d=Theory.data(z.id),col=all?k%2:0;k++;let px=60+col*(cw+40),py=rowY[col];
   const big=!all,fs=big?40:28,lh=big?60:40;x.font='800 '+(big?44:30)+'px Rubik,sans-serif';
   const lines=[];d.cheat.forEach(s=>{x.font='500 '+fs+'px Rubik,sans-serif';this.wrap(x,s,cw-50).forEach((q,i)=>lines.push([q,i===0]))});
   const bh=70+lines.length*lh+24;
   x.fillStyle=z.color+'22';x.fillRect(px,py,cw,bh);x.fillStyle=z.color;x.fillRect(px,py,10,bh);
   x.fillStyle='#0f172a';x.font='800 '+(big?44:30)+'px Rubik,sans-serif';x.fillText(d.par+' · '+d.title,px+28,py+(big?56:44));
   x.font='500 '+fs+'px Rubik,sans-serif';lines.forEach((q,i)=>{x.fillStyle='#1e293b';x.fillText((q[1]?'• ':'   ')+q[0],px+28,py+(big?56:44)+ (big?30:22)+(i+1)*lh)});
   rowY[col]=py+bh+24});
  this.cv=c;const v=$('chView');v.innerHTML='';c.style.cssText='width:100%;height:auto;background:#fff;border-radius:6px';v.appendChild(c)},
 pdf(){const c=this.cv,j=atob(c.toDataURL('image/jpeg',.92).split(',')[1]),n=j.length,e=s=>s,parts=[],off=[];let len=0;
  const add=s=>{parts.push(s);len+=s.length};
  add('%PDF-1.4\n');const obj=(i,s)=>{off[i]=len;add(i+' 0 obj\n'+s+'\nendobj\n')};
  obj(1,'<</Type/Catalog/Pages 2 0 R>>');obj(2,'<</Type/Pages/Kids[3 0 R]/Count 1>>');
  obj(3,'<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</XObject<</Im 4 0 R>>>>/Contents 5 0 R>>');
  off[4]=len;add('4 0 obj\n<</Type/XObject/Subtype/Image/Width '+c.width+'/Height '+c.height+'/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length '+n+'>>\nstream\n');add(j);add('\nendstream\nendobj\n');
  const cs='q 595 0 0 842 0 0 cm /Im Do Q';obj(5,'<</Length '+cs.length+'>>\nstream\n'+cs+'\nendstream');
  const xr=len;add('xref\n0 6\n0000000000 65535 f \n');for(let i=1;i<=5;i++)add(String(off[i]).padStart(10,'0')+' 00000 n \n');
  add('trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n'+xr+'\n%%EOF');
  const u=new Uint8Array(len);let p=0;parts.forEach(s=>{for(let i=0;i<s.length;i++)u[p++]=s.charCodeAt(i)&255});return new Blob([u],{type:'application/pdf'})},
 async save(){const b=this.pdf(),nm='shpargalka-'+(CID||'x')+'-'+this.sel+'.pdf',f=new File([b],nm,{type:'application/pdf'});
  try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Шпаргалка'});return}}catch(e){if(e&&e.name==='AbortError')return}
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=nm;document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(a.href)},4000)},
 print(){const w=document.createElement('img');w.id='chImg';w.src=this.cv.toDataURL('image/png');document.body.appendChild(w);document.body.classList.add('printing');
  const done=()=>{w.remove();document.body.classList.remove('printing')};window.addEventListener('afterprint',done,{once:true});setTimeout(()=>{try{window.print()}catch(e){done()}},150)}};
$('chTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;Sfx.click();Cheat.sel=b.dataset.s==='all'?'all':+b.dataset.s;Cheat.tabs();Cheat.draw()});
$('chPdf').onclick=()=>{Sfx.click();Cheat.save()};$('chPrint').onclick=()=>{Sfx.click();Cheat.print()};$('chClose').onclick=()=>{Sfx.click();$('cheat').hidden=true};
$('bCheat').onclick=()=>{Sfx.click();Cheat.open()};
