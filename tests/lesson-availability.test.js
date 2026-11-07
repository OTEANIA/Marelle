import test from 'node:test';
import assert from 'node:assert/strict';
import {migratePlanner} from '../schedule.js';
import {lessonAvailability} from '../lesson-availability.js';

const date='2026-11-02';
const first={id:'a',label:'Français',start:'08:00',end:'08:30'};
const second={id:'b',label:'Mathématiques',start:'08:30',end:'09:00'};
const lesson={steps:[{time:'45'}]};
const planner=slots=>migratePlanner({slots,lessons:{}});

test('le temps pris dans le second créneau laisse 15 minutes disponibles',()=>{
 const value=lessonAvailability(planner([first,second]),date,first,lesson);
 assert.equal(value.secondRemaining,15);
 assert.equal(value.excess,0);
});

test('récréation, pause, trou horaire et séance existante arrêtent la disponibilité',()=>{
 for(const next of [
  {...second,label:'Récréation'},
  {...second,label:'Pause méridienne'},
  {...second,label:'Déjeuner'},
  {...second,start:'08:45',end:'09:15'}
 ]){
  const value=lessonAvailability(planner([first,next]),date,first,lesson);
  assert.equal(value.second,null);
  assert.equal(value.excess,15);
 }
 const data=planner([first,second]);
 data.lessons[date+'|b|CE2']={steps:[]};
 assert.equal(lessonAvailability(data,date,first,lesson).second,null);
});

test('la fin des cours tronque le second créneau et les durées incomplètes sont signalées',()=>{
 const data=planner([first,second]);
 data.weekTemplate[0].endTime='08:40';
 const value=lessonAvailability(data,date,first,{steps:[{time:'35'},{time:''}]});
 assert.equal(value.secondRemaining,5);
 assert.equal(value.complete,false);
 assert.equal(value.second.end,'08:40');
 assert.equal(lessonAvailability(data,date,{id:'absent'},lesson),null);
});
