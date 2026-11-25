#!/usr/bin/env python3
"""Перевірка змісту Фізикона: python3 -I tools/check-content.py   (потрібен playwright для Python)
Перевіряє: expr ≈ ans (з урахуванням СІ·mul), відповіді rows, один ok у quiz/формулах, числівники словами у показуваному тексті,
Запис у зошит (= / ≈, без «= ?»), літери хибних формул, імена дітей у коді."""
import re,sys,json,os
from playwright.sync_api import sync_playwright
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','www'))
NUMW=re.compile(r'\b(один|одна|одне|два|дві|три|чотири|п[’\']ять|шість|сім|вісім|дев[’\']ять|десять|двадцять|тридцять|сто|двісті)\b',re.I)
BADW=re.compile(r'цілих|п[’\']ятих|восьмих|тисяч метрів|тисяч паскалів|мільйонів кілометрів',re.I)
issues=[]
src=open(ROOT+'/tasks.js').read()
a=src.index(' function mkRec(m){');b=src.index('\n',src.index("out.push('Розв’язання",a));fn=src[a:b]
ev=[l for l in src.split('\n') if l.startswith(' const evalExpr') or l.startswith(' const PI')]
with sync_playwright() as p:
    br=p.chromium.launch();pg=br.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+ROOT+'/index.html?fast');pg.wait_for_timeout(600)
    pg.evaluate("window.__f=(()=>{"+" ".join(ev)+"const fnum=x=>String(+x.toFixed(6));"+fn+";return mkRec})();0")
    r=pg.evaluate("""()=>{const bad=[],ev=e=>Function('"use strict";return ('+e.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/(\\d),(\\d)/g,'$1.$2')+')')();
     const all=[...ZONES.map(z=>['phys',z]),...MZ.map(z=>['math',z])];
     all.forEach(([c,z])=>{z.tasks.forEach(t=>{
      if(t.expr&&t.find){try{let v=ev(t.expr);if(t.find.si!=null&&t.find.mul)v*=t.find.mul;if(Math.abs(v-t.find.ans)>Math.abs(t.find.ans)*.006+1e-9)bad.push(t.id+': expr='+v+' ≠ ans='+t.find.ans);
        const rec=__f(t);if(/= \\?/.test(rec.join?rec.join(' '):rec))bad.push(t.id+': запис містить «= ?»')}catch(e){bad.push(t.id+': помилка expr/mkRec '+e)}}
      if(t.type==='quiz'&&t.opts.filter(o=>o.ok).length!==1)bad.push(t.id+': quiz — ok≠1');
      if(t.formulas){if(t.formulas.filter(f=>f.ok).length!==1)bad.push(t.id+': формули — ok≠1');
        const L=x=>(x.t.split('=')[0]||'').trim();const ok=t.formulas.find(f=>f.ok);t.formulas.forEach(f=>{if(ok&&L(f)!==L(ok))bad.push(t.id+': хибна формула з іншою літерою: '+f.t)})}
      if(t.type==='chain'&&t.rows.some(r=>typeof r.ans!=='number'))bad.push(t.id+': chain rows.ans не число');
      if(t.type==='fill'&&t.rows)t.rows.forEach((r,i)=>{if(r.expr!=null){try{const v=ev(r.expr);if(r.ans!=null&&Math.abs(v-r.ans)>1e-6*Math.max(1,Math.abs(v)))bad.push(t.id+' рядок '+i+': expr≠ans')}catch(e){}}})});
      (z.steps||[]).forEach((s,i)=>{const txt=s.txt||'';if(BAD.test(txt))bad.push('слова-числа '+c+z.id+'#'+i+': '+txt.slice(0,60));const n=(txt.match(NUM)||[]).length;if(n>=2)bad.push('≥2 числівників словами '+c+z.id+'#'+i+': '+txt.slice(0,60))})});
     return bad}""".replace('BAD.test','/'+BADW.pattern+'/i.test').replace('NUM)','/'+NUMW.pattern+'/gi)'))
    issues+=r+errs
    br.close()
for f in os.listdir(ROOT):
    if f.endswith(('.js','.html')):
        t=open(os.path.join(ROOT,f),encoding='utf8').read()
        if re.search(r'\bМаксим\b|\bМакс\b',t):issues.append(f+': ім’я дитини в коді')
print('\n'.join(issues) if issues else 'Зауважень: 0');sys.exit(1 if issues else 0)
