import {slotsForDate,isBreak} from './schedule.js';
import {lessonEntries,resolveDay} from './resolved-day.js';
import {lessonTiming,hasExplicitTiming} from './lesson-duration.js';

const minutes=time=>Number(time.slice(0,2))*60+Number(time.slice(3));
const round=value=>Math.round(value*100)/100;
export const planningBreak=isBreak;

// Les créneaux successifs partagent le budget de leur plage entre deux pauses.
// Les séances de deux niveaux simultanés consomment le maximum de leurs durées.
export function planningPeriods(data,date) {
 const periods=[];
 const occupied=new Set(resolveDay(data,date).groups
  .filter(group=>group.entries.every(({lesson})=>lesson.extendUntilNext===true))
  .flatMap(group=>group.coveredSlots.map(slot=>slot.id)));
 let current=null;
 for(const slot of slotsForDate(data,date)){
  if(planningBreak(slot)){current=null;continue;}
  if(!current||current.end!==slot.start){
   current={start:slot.start,end:slot.end,slots:[],capacity:0,used:0,empty:0,complete:true};
   periods.push(current);
  }
  current.slots.push(slot);
  current.end=slot.end;
  current.capacity+=minutes(slot.end)-minutes(slot.start);
  const entries=lessonEntries(data,date,slot);
  if(!entries.length&&!occupied.has(slot.id))current.empty++;
  const timings=entries.map(({lesson})=>lessonTiming(lesson,minutes(slot.end)-minutes(slot.start)));
  current.used+=occupied.has(slot.id)?minutes(slot.end)-minutes(slot.start):Math.max(0,...timings.map(value=>value.total));
  current.complete=current.complete&&entries.every(({lesson},index)=>!hasExplicitTiming(lesson)||timings[index].complete);
 }
 return periods.map(period=>({...period,
  capacity:round(period.capacity),used:round(period.used),
  remaining:round(Math.max(0,period.capacity-period.used)),
  excess:round(Math.max(0,period.used-period.capacity))
 }));
}
