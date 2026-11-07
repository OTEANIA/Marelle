import React from 'react';
import {planningPeriods,planningBreak} from './lesson-availability.js';
import {slotsForDate} from './schedule.js';
import {resolveDay} from './resolved-day.js';
import {lessonTiming} from './lesson-duration.js';
import {useSubjectPalette} from './subject-appearance.jsx';
import {paletteStyle} from './subject-palette.js';
import {lessonDescriptor} from './disciplines.js';

export default function DaySlots({date,data,onOpen,onSelect}) {
 const subjectPalette=useSubjectPalette();
 const periods=planningPeriods(data,date);
 const {rows}=resolveDay(data,date);
 return <>{rows.map(row=>{
  const slot=row.slot;
  const pause=planningBreak(slot);
  const prepared=row.kind==='lesson'?row.group.entries:[];
  const entries=prepared.length?prepared:[{lane:'all',lesson:null}];
  const effectiveSlot=row.kind==='lesson'?row.group.effectiveSlot:slot;
  const period=periods.find(value=>value.slots[0].id===slot.id);
  return <React.Fragment key={slot.id}>
   {period&&<div className="period-budget" role="status">
    <strong>{period.start}–{period.end} · {period.capacity} min</strong>
    <span>{period.used} min prévues · {period.remaining} min restantes</span>
    <small>{period.empty} créneau{period.empty>1?'x':''} à préparer{!period.complete?' · Durées à compléter':''}</small>
    {period.excess>0&&<b>{period.excess} min de trop sur cette plage</b>}
   </div>}
   <div className={'day-slot'+(pause?' day-break':'')}>
    <div className="day-slot-time">{effectiveSlot.start}<span>— {effectiveSlot.end}</span></div>
    {pause?<div className="break-label">☁ {slot.label}</div>:row.kind==='continuation'?<div className="continuation-content">
     <p>↳ Suite : {row.group.entries.map(({lesson})=>lesson.title||lesson.subject).join(' / ')}</p>
     {row.group.entries.map(({lane,lesson})=><button key={lane} onClick={()=>onOpen(date,row.group.sourceSlot,lane)}>Modifier {lesson.title||'la séance'}</button>)}
     <button onClick={()=>onOpen(date,slot,'all')}>＋ Nouvelle séance ici</button>
    </div>:<div className="cell">
     <div className={entries.length>1?'slot-lessons slot-lessons-split':'slot-lessons'}>
      {entries.map(({lane,lesson})=><div className={'lesson'+(!lesson?' empty':'')} key={lane}
       style={lesson?{background:subjectPalette(lesson.subject).card,...paletteStyle(subjectPalette(lesson.subject))}:{}}
       role="button" tabIndex={0} aria-label={(lesson?.title||slot.label)+' · '+date+' · '+slot.start}
       onDoubleClick={()=>onOpen(date,slot,lane)}
       onKeyDown={event=>{
        if(event.target===event.currentTarget&&(event.key==='Enter'||event.key===' ')){
         event.preventDefault();onOpen(date,slot,lane);
        }
       }} onClick={onSelect}>
       <span className="lesson-top">{lesson?lessonDescriptor(lesson):slot.label}
        <button className="edit-icon" aria-label={'Modifier '+(lesson?.title||slot.label)}
         onClick={event=>{event.stopPropagation();onOpen(date,slot,lane)}}>↗</button>
       </span>
       {lane!=='all'&&<b className="lesson-lane">{lane}</b>}
       <strong>{lesson?.title||'Préparer une séance'}</strong>
       <small>{lesson?lesson.level+(lesson.number?' · Séance '+lesson.number:''):'Double-cliquer pour commencer'}</small>
       {lesson&&<small>{lessonTiming(lesson,effectiveSlot.teachingMinutes??0).total} min de séance</small>}
       {lesson?.objectives&&<p className="lesson-objective"><b>Objectif : </b>{lesson.objectives}</p>}
      </div>)}
     </div>
     <div className="split-add">
      <button onClick={()=>onOpen(date,slot,'CE1')}>+ CE1</button>
      <button onClick={()=>onOpen(date,slot,'CE2')}>+ CE2</button>
     </div>
    </div>}
   </div>
  </React.Fragment>;
 })}</>;
}
