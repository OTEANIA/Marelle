import {CURRICULUM_DETAILS} from './curriculum-details.js';
import {curriculumFor,curriculumTheme} from './curriculum.js';
import {scienceCycle} from './disciplines.js';

// Programme Cycle 2 · Français, « Connaissances et compétences associées ».
const oralPresentation='Dire pour être entendu et compris, en situation d’adresse à un auditoire ou de présentation de textes';
const frenchOral='Langage oral';
const frenchReading='Lecture et compréhension de l’écrit';
const frenchAssociated={
 [frenchOral]:[
  'Maintenir une attention orientée en fonction du but.',
  'Repérer et mémoriser des informations importantes. Les relier entre elles pour leur donner du sens.',
  'Prendre en compte des récepteurs ou interlocuteurs.',
  'Mobiliser des techniques qui font qu’on est écouté.',
  'Organiser son discours.',
  'Mémoriser des textes.',
  'Lire à haute voix.',
  'Respecter des règles organisant les échanges.',
  'Prendre conscience et tenir compte des enjeux.',
  'Se corriger après écoute.'
 ],
 [frenchReading]:[
  'Savoir discriminer de manière auditive et savoir analyser les constituants des mots (conscience phonologique).',
  'Savoir mobiliser la compétence de décodage.',
  'Mettre en œuvre (de manière guidée, puis autonome) une démarche explicite pour découvrir et comprendre un texte.',
  'Savoir parcourir le texte de manière rigoureuse.',
  'Savoir décoder et comprendre un texte.',
  'Identifier les marques de ponctuation et les prendre en compte.'
 ],
 'Écriture':[
  'Maîtriser des gestes de l’écriture cursive exécutés avec une vitesse et une sûreté croissantes.'
 ],
 'Étude de la langue (grammaire, orthographe, lexique)':[
  'Connaître les correspondances graphophonologiques.'
 ]
};

const associatedByCycle={
 'Cycle 2':{
  Français:frenchAssociated,
  Sciences:{
   'Qu’est-ce que la matière ?':[
    'Comparer et mesurer la température, le volume, la masse de l’eau à l’état liquide et à l’état solide.',
    'Reconnaître les états de l’eau et leur manifestation dans divers phénomènes naturels.',
    'Mettre en œuvre des expériences simples impliquant l’eau et/ou l’air.'
   ]
  }
 },
 'Cycle 3':{
  Sciences:{
   'Matière, mouvement, énergie, information':[
    'Mettre en œuvre des observations et des expériences pour caractériser un échantillon de matière.'
   ]
  }
 }
};

export function skillChoices(lesson,associated,allThemes=false) {
 const cycle=scienceCycle(lesson);
 const catalog=curriculumFor(lesson.subject,cycle);
 if(!catalog)return [];
 const theme=curriculumTheme(lesson.subject,cycle,lesson.subTheme);
 const frenchCycleTwo=cycle==='Cycle 2'&&lesson.subject==='Français';
 const seen=new Set();
 const subjectDetails=CURRICULUM_DETAILS[cycle]?.[lesson.subject];
 const additional=associatedByCycle[cycle]?.[lesson.subject];
 return Object.entries(catalog.groups).flatMap(([group,main])=>{
  if(!allThemes&&theme&&group!==theme)return [];
  const readingTheme=cycle==='Cycle 3'&&lesson.subject==='Français'&&!Object.hasOwn(subjectDetails||{},group);
  const extra=[
   ...(subjectDetails?.[readingTheme?frenchReading:group]||[]),
   ...(subjectDetails?.['*']||[])
  ];
  const detailed=(additional?.[group]||[]).map(text=>({text,kind:'Connaissances et compétences associées'}));
  const primary=main.map(text=>({
   text:frenchCycleTwo&&group===frenchOral&&text==='Dire pour être entendu et compris.'?oralPresentation:text,
   kind:catalog.kind
  }));
  const choices=associated?[...detailed,...extra,...primary]:
   [...primary,...extra.filter(item=>!item.kind.startsWith('Connaissances et compétences associées'))];
  return choices.filter(({text})=>{
   const key=normalize(text);
   if(seen.has(key))return false;
   seen.add(key);
   return true;
  }).map(item=>({...item,group,source:catalog.source,
   officialAssociated:associated&&item.kind.startsWith('Connaissances et compétences associées')}));
 });
}

function normalize(text) {
 return text.trim().replace(/^[•*–-]\s*/,'').replace(/[’‘]/g,"'").replace(/\s+/g,' ').replace(/\s*[.!?]+$/,'').toLowerCase();
}

export function lessonSkills(lesson) {
 if(lesson.selectedSkills){
  const {main,associated}=lesson.selectedSkills;
  return {
   main:Array.isArray(main)?main.filter(text=>typeof text==='string'):[],
   associated:Array.isArray(associated)?associated.filter(text=>typeof text==='string'):[]
  };
 }
 const result={main:[],associated:[]};
 const main=skillChoices(lesson,false,true);
 const associated=skillChoices(lesson,true,true);
 let category='main';
 for(const line of (typeof lesson.skills==='string'?lesson.skills:'').split('\n')){
  const value=normalize(line.replace(/^\s*Compétences\s*:\s*/i,''));
  if(/^compétences associées\s*:$/.test(value)){
   category='associated';
   continue;
  }
  const options=category==='associated'?associated:main;
  const match=options.find(({text})=>normalize(text)===value||
   (text===oralPresentation&&value==='dire pour être entendu et compris'));
  if(match&&!result[category].includes(match.text))result[category].push(match.text);
 }
 return result;
}
