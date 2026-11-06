import {useSubjectPalette} from './subject-appearance.jsx';
import{paletteStyle}from'./subject-palette.js';
import React from 'react';
import{DAYS,configForDay,isBreak}from'./schedule.js';
import{lessonDescriptor}from'./disciplines.js';
import{resolveDay}from'./resolved-day.js';
const addDays=(date,n)=>{const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const format=date=>new Date(date+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});
export default function WeeklyPrint({week,data,profile}){
 const subjectPalette=useSubjectPalette();

 const columns=DAYS.map((name,i)=>{const config=configForDay(data,i);return{name,date:addDays(week,i),config,rows:resolveDay(data,addDays(week,i)).rows}});
 const count=Math.max(1,...columns.map(c=>c.rows.length));
 return <article className="week-print"><header className="week-print-heading"><div><small>{profile?.name||'Mon atelier'} · {profile?.className||''}</small><h1>Mon semainier</h1></div><p>Du {format(week)} au {format(addDays(week,4))}</p></header><p className="week-print-note">Les horaires sont propres à chaque jour. Les cases d’une même ligne ne correspondent pas nécessairement à la même heure.</p><table className="week-print-table"><thead><tr>{columns.map(c=><th scope="col" key={c.name}>{c.name}<small>{format(c.date)}</small></th>)}</tr></thead><tbody>{Array.from({length:count},(_,row)=><tr key={row}>{columns.map(c=>{const resolved=c.rows[row];const slot=resolved?.kind==='lesson'?resolved.group.effectiveSlot:resolved?.slot;if(!slot)return <td className="week-print-empty" key={c.name}>{row===0&&!c.config.enabled?'Sans classe':''}</td>;
 const entries=resolved.kind==='lesson'?resolved.group.entries:[];
 return <td key={c.name} className={isBreak(slot)?'week-print-break':''}><div className="week-print-time">{slot.start} – {slot.end}</div>{resolved.kind==='continuation'?<p className="week-print-continuation" style={{color:subjectPalette(resolved.group.entries[0].lesson.subject).ink,background:subjectPalette(resolved.group.entries[0].lesson.subject).soft}}>↳ Suite : {resolved.group.entries.map(e=>e.lesson.title||e.lesson.subject).join(' / ')}</p>:isBreak(slot)?<p>{slot.label}</p>:entries.length?<div className={entries.length>1?"week-print-lessons-split":undefined}>{entries.map(({lane,lesson})=><section className="week-print-lesson" key={lane} style={{...paletteStyle(subjectPalette(lesson.subject)),borderColor:subjectPalette(lesson.subject).line,background:subjectPalette(lesson.subject).soft,color:subjectPalette(lesson.subject).ink}}><small>{lane!=='all'&&<b>{lane} · </b>}{lessonDescriptor(lesson)}</small><strong>{lesson.title||'Séance sans titre'}</strong><span>{lesson.level}{lesson.number?' · Séance '+lesson.number:''}</span>{lesson.objectives&&<p className="week-print-objective"><b>Objectif : </b>{lesson.objectives}</p>}</section>)}</div>:<p className="week-print-label">{slot.label}</p>}</td>
 })}</tr>)}</tbody><tfoot><tr>{columns.map(c=><td key={c.name}>{c.config.enabled?'Fin des classes : '+c.config.endTime:'Journée sans classe'}</td>)}</tr></tfoot></table><p className="week-print-footer">Marelle · Planning de la semaine</p></article>
}
