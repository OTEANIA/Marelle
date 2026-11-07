import test from 'node:test';
import assert from 'node:assert/strict';
import {migratePlanner} from '../schedule.js';
import {planningPeriods} from '../lesson-availability.js';

const date='2026-11-06';
const slots=[
 {id:'a',label:'Mathématiques',start:'10:30',end:'11:10'},
 {id:'b',label:'Français',start:'11:10',end:'11:40'},
 {id:'c',label:'Anglais',start:'11:40',end:'12:00'}
];
const data=()=>migratePlanner({slots,lessons:{}});
const lesson=time=>({steps:[{time}]});

test('vendredi : 90 minutes puis 60 puis 20 disponibles, indépendamment des durées des créneaux',()=>{
 const value=data();
 assert.equal(planningPeriods(value,date)[0].remaining,90);
 value.lessons[date+'|a|all']=lesson('30');
 assert.equal(planningPeriods(value,date)[0].remaining,60);
 value.lessons[date+'|b|all']=lesson('40');
 assert.equal(planningPeriods(value,date)[0].remaining,20);
 assert.equal(planningPeriods(value,date)[0].empty,1);
 value.lessons[date+'|c|all']=lesson('20');
 assert.equal(planningPeriods(value,date)[0].remaining,0);
 value.lessons[date+'|a|all']=lesson('35');
 assert.equal(planningPeriods(value,date)[0].excess,5);
 delete value.lessons[date+'|b|all'];
 assert.equal(planningPeriods(value,date)[0].remaining,35);
});

test('pauses, trous horaires et fin des classes délimitent les plages',()=>{
 for(const label of ['Récréation','Pause méridienne','Déjeuner']){
  const value=migratePlanner({slots:[slots[0],{id:'pause',label,start:'11:10',end:'11:20'},{...slots[2],start:'11:20'}],lessons:{}});
  value.weekTemplate[4].endTime='11:50';
  assert.deepEqual(planningPeriods(value,date).map(p=>p.capacity),[40,30]);
 }
 const gap=migratePlanner({slots:[slots[0],slots[2]],lessons:{}});
 assert.deepEqual(planningPeriods(gap,date).map(p=>p.capacity),[40,20]);
 gap.weekTemplate[4].enabled=false;
 assert.deepEqual(planningPeriods(gap,date),[]);
});

test('deux niveaux simultanés consomment la durée la plus longue et signalent les durées incomplètes',()=>{
 const value=data();
 value.lessons[date+'|a|CE1']=lesson('30');
 value.lessons[date+'|a|CE2']=lesson('40');
 value.lessons[date+'|b|all']={steps:[{time:'10'},{time:''}]};
 const period=planningPeriods(value,date)[0];
 assert.equal(period.used,50);
 assert.equal(period.remaining,40);
 assert.equal(period.complete,false);
});
