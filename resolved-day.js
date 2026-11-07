import{slotsForDate,isBreak}from'./schedule.js';
const minutes=time=>+time.slice(0,2)*60+ +time.slice(3);
export function lessonEntries(data,date,slot){return ['all','CE1','CE2'].map(lane=>({lane,lesson:data.lessons[`${date}|${slot.id}|${lane}`]})).filter(entry=>entry.lesson);}
// Calcul dérivé uniquement : les prolongements ne dupliquent jamais les préparations sauvegardées.
export function resolveDay(data,date){
 const slots=slotsForDate(data,date), rows=[],groups=[];let active=null;
 for(const slot of slots){
  if(isBreak(slot)){rows.push({kind:'break',slot});continue;}
  const entries=lessonEntries(data,date,slot);
  if(entries.length){active={sourceSlot:slot,entries,coveredSlots:[slot],pauses:[]};groups.push(active);rows.push({kind:'lesson',slot,group:active});}
  else if(active&&active.entries.every(({lesson})=>lesson.extendUntilNext===true)){active.coveredSlots.push(slot);rows.push({kind:'continuation',slot,group:active});}
  else rows.push({kind:'empty',slot});
 }
 for(const group of groups){
  const last=group.coveredSlots.at(-1);
  group.pauses=slots.filter(slot=>isBreak(slot)&&slot.start>=group.sourceSlot.end&&slot.end<=last.end);
  group.effectiveSlot={...group.sourceSlot,end:last.end,teachingMinutes:group.coveredSlots.reduce((n,slot)=>n+minutes(slot.end)-minutes(slot.start),0)};
 }
 // Le journal présente une seule préparation avec ses pauses, pas une répétition à chaque créneau.
 const journalRows=rows.filter(row=>row.kind!=='continuation'&&!(row.kind==='break'&&groups.some(group=>group.pauses.some(pause=>pause.id===row.slot.id))));
 return{rows,groups,journalRows};
}
export function previewLessonSlot(data,date,slot){
 const actual=slotsForDate(data,date).find(value=>value.id===slot.id)||slot;
 if(isBreak(actual))return actual;
 // Une nouvelle préparation reste sur son créneau tant que la prolongation est décochée.
 const key=`${date}|${actual.id}|all`;
 const simulated=lessonEntries(data,date,actual).length?data:{...data,lessons:{...data.lessons,[key]:{title:'',extendUntilNext:false}}};
 return resolveDay(simulated,date).groups.find(group=>group.sourceSlot.id===actual.id)?.effectiveSlot||actual;
}
