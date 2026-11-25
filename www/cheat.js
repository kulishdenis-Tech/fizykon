/* Шпаргалки: аркуш A4 малюється на canvas, зберігається як PDF (JPEG усередині) або друкується. */
const Cheat={sel:'all',cv:null,
 zones(){const base=(typeof ZL==='function'?ZL():[]).filter(z=>Theory.data(z.id)).map(z=>({id:z.id,par:z.par,name:z.name,color:z.color}));
  const ex=Object.entries((THEORY[CID]||{})).filter(([k,v])=>v.extra).map(([k,v])=>({id:k,par:v.par,name:v.title,color:'#94a3b8'}));return base.concat(ex)},
 open(){this.sel='all';$('cheat').hidden=false;this.tabs();this.draw()},
 tabs(){$('chTabs').innerHTML='<button class="btn '+(this.sel==='all'?'':'ghost')+'" data-s="all">Усі теми</button>'+this.zones().map(z=>'<button class="btn '+(this.sel==z.id?'':'ghost')+'" data-s="'+z.id+'">'+z.par+'</button>').join('')},
 wrap(ctx,t,w){const o=[];let l='';for(const s of t.split(' ')){const x=l?l+' '+s:s;if(ctx.measureText(x).width>w&&l){o.push(l);l=s}else l=x}if(l)o.push(l);return o},
 page(){const W=1240,H=1754,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,W,H);return c},
 draw(){const W=1240,H=1754,all=this.sel==='all',co=COURSE(),zs=this.zones().filter(z=>all||String(z.id)===String(this.sel));
  const pages=[];let c=this.page(),x=c.getContext('2d');pages.push(c);
  const head=(x,n)=>{x.fillStyle='#0f172a';x.font='800 54px Rubik,sans-serif';x.fillText('Шпаргалка · '+co.subj+', '+co.grade+' клас',60,95);x.fillStyle='#64748b';x.font='400 24px Rubik,sans-serif';x.fillText('Фізикон'+(CUR&&CUR.name?' · '+CUR.name:'')+(n>1?' · стор. '+n:''),60,135)};head(x,1);
  const cols=all?2:1,cw=(W-120-(cols-1)*40)/cols,big=!all,fs=big?40:26,lh=big?60:36,tf=big?44:28;let col=0,y=[180,180];
  zs.forEach(z=>{const d=Theory.data(z.id);x.font='500 '+fs+'px Rubik,sans-serif';const lines=[];d.cheat.forEach(s=>this.wrap(x,s,cw-60).forEach((q,i)=>lines.push([q,i===0])));
   const bh=(big?86:62)+lines.length*lh+20;
   if(y[col]+bh>H-60){if(col+1<cols){col++}else{c=this.page();x=c.getContext('2d');pages.push(c);head(x,pages.length);col=0;y=[180,180]}}
   const px=60+col*(cw+40),py=y[col];x.fillStyle=z.color+'22';x.fillRect(px,py,cw,bh);x.fillStyle=z.color;x.fillRect(px,py,10,bh);
   x.fillStyle='#0f172a';x.font='800 '+tf+'px Rubik,sans-serif';x.fillText(d.par+' · '+d.title,px+28,py+(big?56:42));
   x.font='500 '+fs+'px Rubik,sans-serif';x.fillStyle='#1e293b';lines.forEach((q,i)=>x.fillText((q[1]?'• ':'   ')+q[0],px+28,py+(big?56:42)+(big?24:16)+(i+1)*lh));y[col]=py+bh+18});
  this.pages=pages;const v=$('chView');v.innerHTML='';pages.forEach(p=>{p.style.cssText='width:100%;height:auto;background:#fff;border-radius:6px;margin-bottom:8px;display:block';v.appendChild(p)})},
 pdf(){const P=this.pages,N=P.length,parts=[],off=[];let len=0;const add=s=>{parts.push(s);len+=s.length};
  add('%PDF-1.4\n');const obj=(i,s)=>{off[i]=len;add(i+' 0 obj\n'+s+'\nendobj\n')};
  obj(1,'<</Type/Catalog/Pages 2 0 R>>');obj(2,'<</Type/Pages/Kids['+P.map((_,k)=>(3+k*3)+' 0 R').join(' ')+']/Count '+N+'>>');
  P.forEach((c,k)=>{const b=3+k*3,j=atob(c.toDataURL('image/jpeg',.9).split(',')[1]);
   obj(b,'<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</XObject<</Im '+(b+1)+' 0 R>>>>/Contents '+(b+2)+' 0 R>>');
   off[b+1]=len;add((b+1)+' 0 obj\n<</Type/XObject/Subtype/Image/Width '+c.width+'/Height '+c.height+'/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length '+j.length+'>>\nstream\n');add(j);add('\nendstream\nendobj\n');
   const cs='q 595 0 0 842 0 0 cm /Im Do Q';obj(b+2,'<</Length '+cs.length+'>>\nstream\n'+cs+'\nendstream')});
  const tot=3+N*3,xr=len;add('xref\n0 '+tot+'\n0000000000 65535 f \n');for(let i=1;i<tot;i++)add(String(off[i]).padStart(10,'0')+' 00000 n \n');
  add('trailer\n<</Size '+tot+'/Root 1 0 R>>\nstartxref\n'+xr+'\n%%EOF');
  const u=new Uint8Array(len);let p=0;parts.forEach(s=>{for(let i=0;i<s.length;i++)u[p++]=s.charCodeAt(i)&255});return new Blob([u],{type:'application/pdf'})},
 async save(){const b=this.pdf(),nm='shpargalka-'+(CID||'x')+'-'+this.sel+'.pdf',f=new File([b],nm,{type:'application/pdf'});
  {const Pl=window.Capacitor&&Capacitor.Plugins;if(Pl&&Pl.Filesystem&&Pl.Share){try{const d=await new Promise((ok,no)=>{const fr=new FileReader();fr.onload=()=>ok(String(fr.result).split(',')[1]);fr.onerror=no;fr.readAsDataURL(b)});const w=await Pl.Filesystem.writeFile({path:nm,data:d,directory:'CACHE'});await Pl.Share.share({title:'Шпаргалка',url:w.uri});return}catch(e){if(/cancel/i.test(String(e&&e.message||e)))return}}}
  try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Шпаргалка'});return}}catch(e){if(e&&e.name==='AbortError')return}
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=nm;document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(a.href)},4000)},
 print(){const box=document.createElement('div');box.id='chImg';this.pages.forEach(p=>{const im=document.createElement('img');im.src=p.toDataURL('image/png');box.appendChild(im)});document.body.appendChild(box);document.body.classList.add('printing');
  const done=()=>{box.remove();document.body.classList.remove('printing')};window.addEventListener('afterprint',done,{once:true});setTimeout(()=>{try{window.print()}catch(e){done()}},200)}};
$('chTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;Sfx.click();Cheat.sel=b.dataset.s;Cheat.tabs();Cheat.draw()});
$('chPdf').onclick=()=>{Sfx.click();Cheat.save()};$('chPrint').onclick=()=>{Sfx.click();Cheat.print()};$('chClose').onclick=()=>{Sfx.click();$('cheat').hidden=true};
$('bCheat').onclick=()=>{Sfx.click();Cheat.open()};
