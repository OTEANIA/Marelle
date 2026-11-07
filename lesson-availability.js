import {slotsForDate,isBreak} from './schedule.js';
import {lessonEntries} from './resolved-day.js';
import {lessonTiming} from './lesson-duration.js';

const minutes=time=>Number(time.slice(0,2))*60+Number(time.slice(3));
const round=value=>Math.round(value*100)/100;
const blocked=slot=>isBreak(slot)||/déjeuner|dejeuner|repas|méridien|meridien/i.test(slot.label);

// Seul le créneau immédiatement suivant peut compléter le premier.
// Un trou horaire, une pause ou une préparation existante arrête la disponibilité.
export function lessonAvailability(data,date,slot,lesson) {
 const slots=slotsForDate(data,date);
 const index=slots.findIndex(item=>item.id===slot.id);
 const first=slots[index];
 if(!first||blocked(first))return null;
 const next=slots[index+1];
 const second=next&&!blocked(next)&&next.start===first.end&&lessonEntries(data,date,next).length===0?next:null;
 const firstMinutes=minutes(first.end)-minutes(first.start);
 const secondMinutes=second?minutes(second.end)-minutes(second.start):0;
 const timing=lessonTiming(lesson,firstMinutes);
 const usedSecond=Math.max(0,timing.total-firstMinutes);
 return {
  firstMinutes,secondMinutes,boundary:first.end,
  firstRemaining:round(Math.max(0,firstMinutes-timing.total)),
  secondRemaining:round(Math.max(0,secondMinutes-usedSecond)),
  excess:round(Math.max(0,timing.total-firstMinutes-secondMinutes)),
  second,complete:timing.complete,total:timing.total
 };
}

export function availabilityLabel(value) {
 if(!value||!value.total)return '';
 const estimate=value.complete?'':'Estimation · ';
 if(value.excess)return estimate+value.excess+' min à reporter au-delà du temps disponible';
 if(value.second)return estimate+'2e créneau · '+value.second.start+'–'+value.second.end+' · '+value.secondRemaining+' min restantes';
 return estimate+'Créneau actuel · '+value.firstRemaining+' min restantes avant '+value.boundary;
}
