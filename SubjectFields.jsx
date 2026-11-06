import React from 'react';
import {curriculumFor,curriculumSkills,curriculumTheme,subjectLabel} from './curriculum.js';
import {SUBJECTS,scienceCycle,subthemesFor,changeSubject} from './disciplines.js';

export default function SubjectFields({lesson,onChange,showCurriculum=false}) {
 const cycle=scienceCycle(lesson);
 const catalog=curriculumFor(lesson.subject,cycle);
 const options=catalog?Object.keys(catalog.groups):subthemesFor(lesson);
 const theme=curriculumTheme(lesson.subject,cycle,lesson.subTheme);
 const skills=curriculumSkills(lesson.subject,cycle,theme);
 const subjects=SUBJECTS.filter(([name])=>name===lesson.subject||name==='Vie de classe'||curriculumFor(name,cycle));
 const addSkill=event=>{
  const skill=event.target.value;
  const lines=(lesson.skills||'').split('\n');
  if(skill&&!lines.includes(skill))onChange({...lesson,skills:[...lines.filter(Boolean),skill].join('\n')});
 };

 return <>
  <label className="field">
   <span>Discipline</span>
   <select value={lesson.subject} onChange={event=>onChange({...changeSubject(lesson,event.target.value),cycle})}>
    {!SUBJECTS.some(([name])=>name===lesson.subject)&&<option value={lesson.subject}>{lesson.subject}</option>}
    {subjects.map(([name])=><option key={name} value={name}>{subjectLabel(name,cycle)}{cycle==='Cycle 1'&&subjectLabel(name,cycle)!==name?' · '+name:''}</option>)}
   </select>
  </label>
  <label className="field">
   <span>Cycle</span>
   <select value={cycle} onChange={event=>onChange({...lesson,cycle:event.target.value})}>
    <option>Cycle 1</option>
    <option>Cycle 2</option>
    <option>Cycle 3</option>
   </select>
  </label>
  {(options.length>0||lesson.subTheme)&&<label className="field">
   <span>Sous-thème</span>
   <select value={theme||''} onChange={event=>onChange({...lesson,subTheme:event.target.value})}>
    <option value="">Non renseigné</option>
    {theme&&!options.includes(theme)&&<option value={theme}>{theme} (valeur conservée)</option>}
    {options.map(value=><option key={value}>{value}</option>)}
   </select>
  </label>}
  {showCurriculum&&<div className="field wide">
   <span>{catalog?.kind||'Compétences du programme polynésien'}</span>
   {skills.length>0?<><select aria-label="Ajouter une compétence du programme" value="" onChange={addSkill}>
    <option value="">Ajouter une compétence…</option>
    {skills.map(skill=><option key={skill}>{skill}</option>)}
   </select>
   <small>{catalog.source}</small></>:
    <small>Choisis un sous-thème du programme ou renseigne le champ Compétences librement.</small>}
  </div>}
 </>;
}
