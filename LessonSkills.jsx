import React,{useId,useState} from 'react';
import {lessonSkills,skillChoices} from './lesson-skills.js';

export default function LessonSkills({lesson,onChange}) {
 const [category,setCategory]=useState(null);
 const [pending,setPending]=useState([]);
 const [query,setQuery]=useState('');
 const [allThemes,setAllThemes]=useState(false);
 const panelId=useId();
 const selected=lessonSkills(lesson);
 const choices=category?skillChoices(lesson,category==='associated',allThemes):[];
 const search=text=>text.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
 const visible=choices.filter(({text,group,kind})=>search(text+' '+group+' '+kind).includes(search(query.trim())));
 const labels={main:'Compétences principales',associated:'Compétences associées'};
 const update=(key,items)=>onChange({...lesson,selectedSkills:{...selected,[key]:items}});
 const close=()=>{
  setCategory(null);
  setPending([]);
  setAllThemes(false);
  setQuery('');
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
    <label className="field"><span>Rechercher dans le programme</span><input type="search" value={query} onChange={event=>setQuery(event.target.value)} /></label>
    <div className="lesson-skill-options">
     {visible.length===0&&<p>Aucune proposition pour cette sélection.</p>}
     {visible.map(({text,group,kind,source})=><label key={text}>
      <input type="checkbox" disabled={selected[key].includes(text)} checked={pending.includes(text)||selected[key].includes(text)}
       onChange={event=>setPending(event.target.checked?[...pending,text]:pending.filter(item=>item!==text))}/>
      <span>{text}<small>{group} · {kind}<br/>{source}</small></span>
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
