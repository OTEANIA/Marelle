// Les temps d’étapes sont des minutes positives, éventuellement décimales.
export function lessonTiming(lesson, slotMinutes) {
 const steps=lesson.steps||[];
 const values=steps.map(s=>String(s.time??'').trim().replace(',','.'));
 const valid=values.map(v=>v!==''&&Number.isFinite(Number(v))&&Number(v)>0);
 const calculated=Math.round(values.reduce((n,v,i)=>n+(valid[i]?Number(v):0),0)*100)/100;
 const unspecified=values.every(value=>value==='');
 const total=unspecified?Math.max(0,Number(slotMinutes)||0):calculated;
 return {total,complete:steps.length>0&&valid.every(Boolean),missing:valid.filter(v=>!v).length,slotMinutes,
  difference:Math.round((total-slotMinutes)*100)/100};
}

export function hasExplicitTiming(lesson){
 return (lesson.steps||[]).some(step=>String(step.time??'').trim()!=='');
}
