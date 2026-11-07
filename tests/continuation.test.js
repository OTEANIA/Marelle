import test from'node:test';import assert from'node:assert/strict';import{migratePlanner}from'../schedule.js';import{resolveDay,previewLessonSlot}from'../resolved-day.js';
const date='2026-11-02';
const make=(lessons={})=>migratePlanner({slots:[{id:'a',start:'08:00',end:'09:00',label:'Français'},{id:'b',start:'09:00',end:'10:00',label:'Mathématiques'},{id:'r',start:'10:00',end:'10:15',label:'Récréation'},{id:'c',start:'10:15',end:'11:30',label:'Sciences'},{id:'p',start:'11:30',end:'13:00',label:'Pause déjeuner'},{id:'d',start:'13:00',end:'14:00',label:'EPS'}],lessons});
const lesson=title=>({title,extendUntilNext:true,subject:'EPS',level:'CE1/CE2',objectives:'COURIR_ENSEMBLE',steps:[]});
test('cross se prolonge toute la journée sans copier les données',()=>{const data=make({[`${date}|a|all`]:lesson('Cross')}),before=JSON.stringify(data);const view=resolveDay(data,date);assert.equal(view.groups.length,1);assert.equal(view.groups[0].effectiveSlot.end,'14:00');assert.equal(view.groups[0].effectiveSlot.teachingMinutes,255);assert.deepEqual(view.groups[0].coveredSlots.map(s=>s.id),['a','b','c','d']);assert.deepEqual(view.groups[0].pauses.map(s=>s.id),['r','p']);assert.equal(view.journalRows.length,1);assert.equal(JSON.stringify(data),before)});
test('la prochaine préparation interrompt la prolongation',()=>{const data=make({[`${date}|a|all`]:lesson('Cross'),[`${date}|c|all`]:lesson('Lecture')});const view=resolveDay(data,date);assert.equal(view.groups[0].effectiveSlot.end,'10:00');assert.equal(view.groups[1].effectiveSlot.start,'10:15');assert.equal(view.groups[1].effectiveSlot.end,'14:00');assert(view.journalRows.some(row=>row.kind==='break'&&row.slot.id==='r'))});
test('une journée libre avant toute préparation reste libre',()=>{const view=resolveDay(make({[`${date}|c|all`]:lesson('Cross')}),date);assert.deepEqual(view.rows.slice(0,2).map(row=>row.kind),['empty','empty']);assert.equal(view.groups.length,1);assert.equal(view.groups[0].effectiveSlot.start,'10:15')});
test('un créneau renseigné pour un seul groupe arrête le groupe précédent',()=>{const view=resolveDay(make({[`${date}|a|all`]:lesson('Cross'),[`${date}|b|CE1`]:lesson('CE1')}),date);assert.equal(view.groups[0].effectiveSlot.end,'09:00');assert.equal(view.groups[1].effectiveSlot.end,'14:00');assert.equal(view.groups[1].entries[0].lane,'CE1')});
test('deux préparations parallèles se prolongent ensemble sur un créneau entièrement libre',()=>{const view=resolveDay(make({[`${date}|a|CE1`]:lesson('A'),[`${date}|a|CE2`]:lesson('B')}),date);assert.equal(view.groups[0].entries.length,2);assert.equal(view.groups[0].effectiveSlot.end,'14:00')});
test('limite de fin des classes respectée et pauses finales restent visibles',()=>{const data=make({[`${date}|a|all`]:lesson('Cross')});data.weekTemplate[0].endTime='10:10';const view=resolveDay(data,date);assert.equal(view.groups[0].effectiveSlot.end,'10:00');assert.equal(view.journalRows.at(-1).kind,'break');assert.equal(view.journalRows.at(-1).slot.end,'10:10')});
test('créer une séance dans un prolongement donne un nouvel horaire sans changer la source',()=>{const data=make({[`${date}|a|all`]:lesson('Cross')});const slot=data.slots.find(s=>s.id==='c');const proposed=previewLessonSlot(data,date,slot);assert.equal(proposed.id,'c');assert.equal(proposed.start,'10:15');assert.equal(proposed.end,'11:30');assert.equal(proposed.teachingMinutes,75);assert.equal(Object.keys(data.lessons).length,1)});
test('aucune propagation d’un jour à l’autre ou au-delà d’une journée fermée',()=>{const data=make({[`${date}|a|all`]:lesson('Cross')});assert.equal(resolveDay(data,'2026-11-03').groups.length,0);data.weekTemplate[0].enabled=false;assert.equal(resolveDay(data,date).rows.length,0)});

test('la prolongation est facultative et une ancienne séance sans option reste sur son créneau',()=>{
 const ordinary={...lesson('Ordinaire'),extendUntilNext:false};
 const data=make({[date+'|a|all']:ordinary});
 assert.equal(resolveDay(data,date).groups[0].effectiveSlot.end,'09:00');
 delete ordinary.extendUntilNext;
 assert.equal(resolveDay(data,date).groups[0].effectiveSlot.end,'09:00');
});

test('l’aperçu respecte aussi les séances renseignées uniquement en double niveau',()=>{
 const data=make({[date+'|a|CE1']:lesson('A'),[date+'|a|CE2']:lesson('B')});
 assert.equal(previewLessonSlot(data,date,data.slots[0]).end,'14:00');
 data.lessons[date+'|a|CE2'].extendUntilNext=false;
 assert.equal(previewLessonSlot(data,date,data.slots[0]).end,'09:00');
});
