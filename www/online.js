'use strict';
/* Онлайн-рейтинг: Firebase Anonymous Auth + Firestore через REST (без SDK).
   Передається лише: нік, код класу, XP, зірки. Правила бази — в firestore.rules. */
const Online=(()=>{
 const KEY='AIzaSyDydAb_z4e8DveD9ssBTVTyHFbKecNWA38',PROJ='fizykon-8769a';
 const FS='https://firestore.googleapis.com/v1/projects/'+PROJ+'/databases/(default)/documents';
 const DOC='projects/'+PROJ+'/databases/(default)/documents';
 let S=null,tokP=null;
 try{S=JSON.parse(localStorage.getItem('fzo'))}catch(e){}
 const save=()=>{try{localStorage.setItem('fzo',JSON.stringify(S))}catch(e){}};
 const jf=async(url,opt)=>{const r=await fetch(url,opt);const j=await r.json().catch(()=>({}));if(!r.ok){const e=new Error((j.error&&j.error.message)||('HTTP '+r.status));e.code=r.status;throw e}return j};
 async function token(){
  if(S&&S.id&&S.exp>Date.now()+60000)return S.id;
  if(tokP)return tokP;
  tokP=(async()=>{try{
   if(S&&S.rt){
    const j=await jf('https://securetoken.googleapis.com/v1/token?key='+KEY,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=refresh_token&refresh_token='+encodeURIComponent(S.rt)});
    S={uid:j.user_id,rt:j.refresh_token,id:j.id_token,exp:Date.now()+(+j.expires_in)*1000};
   }else{
    const j=await jf('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='+KEY,{method:'POST',headers:{'Content-Type':'application/json'},body:'{"returnSecureToken":true}'});
    S={uid:j.localId,rt:j.refreshToken,id:j.idToken,exp:Date.now()+(+j.expiresIn)*1000};
   }
   save();return S.id}finally{tokP=null}})();
  return tokP}
 const hdr=async()=>({'Content-Type':'application/json',Authorization:'Bearer '+await token()});
 const clean=s=>String(s||'').replace(/[<>&"'`\\]/g,'').replace(/\s+/g,' ').trim();
 const normRoom=s=>String(s||'').toUpperCase().replace(/[^A-ZА-ЯІЇЄҐ0-9]/g,'').slice(0,12);
 const str=v=>({stringValue:v}),int=v=>({integerValue:String(Math.round(v))});
 async function docId(pid,cid){await token();return S.uid+'_'+pid+'_'+cid}
 /* записати результат гравця (профіль pl: {id,online:{nick,room}}) */
 async function push(pl,xp,stars,cid){
  const o=pl.online;if(!o||!o.on)return;
  const id=await docId(pl.id,cid);
  const body={writes:[{update:{name:DOC+'/players/'+id,fields:{owner:str(S.uid),nick:str(o.nick),room:str(o.room||''),course:str(cid),xp:int(xp),stars:int(stars)}},updateTransforms:[{fieldPath:'t',setToServerValue:'REQUEST_TIME'}]}]};
  await jf(FS+':commit',{method:'POST',headers:await hdr(),body:JSON.stringify(body)})}
 async function leave(pl,cids){for(const c of cids){const id=await docId(pl.id,c);try{await jf(FS+'/players/'+id,{method:'DELETE',headers:await hdr()})}catch(e){if(e.code!==404)throw e}}}
 const parse=r=>r.filter(x=>x.document).map(x=>{const f=x.document.fields||{};return{id:x.document.name.split('/').pop(),nick:(f.nick||{}).stringValue||'?',room:(f.room||{}).stringValue||'',course:(f.course||{}).stringValue||'',xp:+((f.xp||{}).integerValue||0),stars:+((f.stars||{}).integerValue||0)}});
 async function top(room,cid){
  const q=room?{from:[{collectionId:'players'}],where:{fieldFilter:{field:{fieldPath:'room'},op:'EQUAL',value:str(room)}},limit:300}
              :{from:[{collectionId:'players'}],where:{fieldFilter:{field:{fieldPath:'course'},op:'EQUAL',value:str(cid)}},limit:300};
  const r=await jf(FS+':runQuery',{method:'POST',headers:await hdr(),body:JSON.stringify({structuredQuery:q})});
  const l=parse(r).filter(x=>x.course===cid);l.sort((a,b)=>b.xp-a.xp||b.stars-a.stars);return l.slice(0,30)}
 const myId=(pl,cid)=>S&&S.uid?S.uid+'_'+pl.id+'_'+cid:null;
 return{push,leave,top,clean,normRoom,myId,token,get uid(){return S&&S.uid}}
})();
