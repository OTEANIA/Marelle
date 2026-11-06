import React,{useId,useState} from 'react';
import {lessonSkills,skillChoices} from './lesson-skills.js';

export default function LessonSkills({lesson,onChange}) {
 const [category,setCategory]=useState(null);
 const [pending,setPending]=useState([]);
 const [allThemes,setAllThemes]=useState(false);
 const panelId=useId();
 const selected=lessonSkills(lesson);
 const choices=category?skillChoices(lesson,category==='associated',allThemes):[];
 const labels={main:'Compétences principales',associated:'Compétences associées'};
 const update=(key,items)=>onChange({...lesson,selectedSkills:{...selected,[key]:items}});
 const close=()=>{
  setCategory(null);
  setPending([]);
  setAllThemes(false);
 };

 return <fieldset className="lesson-skills field wide">
  <legend>Compétences</legend>
  {Object.entries(labels).map(([key,label])=><div key={key} className="lesson-skill-group">
   <div className="lesson-skill-heading">
    <strong>{label}</strong>
    <button type="button" aria-label={'Ajouter des '+label.toLowerCase()} aria-expanded={category===key}
     aria-controls={category===key?panelId:undefined} onClick={()=>{
      close();
      if(category!==key)setCategory(key);
     }}>+</button>
   </div>
   {selected[key].length>0&&<ul>{selected[key].map(text=><li key={text}>
    <span>{text}</span>
    <button type="button" aria-label={'Retirer '+text} onClick={()=>update(key,selected[key].filter(item=>item!==text))}>×</button>
   </li>)}</ul>}
   {category===key&&<div id={panelId} className="lesson-skill-picker">
    <label><input type="checkbox" checked={allThemes} onChange={event=>setAllThemes(event.target.checked)}/> Tous les sous-thèmes de la discipline</label>
    <div className="lesson-skill-options">
     {choices.length===0&&<p>Aucune proposition pour cette sélection.</p>}
     {choices.map(({text,group,officialAssociated})=><label key={text}>
      <input type="checkbox" disabled={selected[key].includes(text)} checked={pending.includes(text)||selected[key].includes(text)}
       onChange={event=>setPending(event.target.checked?[...pending,text]:pending.filter(item=>item!==text))}/>
      <span>{text}<small>{group}{officialAssociated?' · Connaissances et compétences associées':''}</small></span>
     </label>)}
    </div>
    <div className="lesson-skill-actions">
     <button type="button" onClick={close}>Annuler</button>
     <button type="button" className="primary" disabled={!pending.length} onClick={()=>{
      update(key,[...new Set([...selected[key],...pending])]);
      close();
     }}>Ajouter la sélection{pending.length>0?' ('+pending.length+')':''}</button>
    </div>
   </div>}
  </div>)}
 </fieldset>;
}
