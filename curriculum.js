import {CURRICULUM} from './curriculum-data.js';

const LABELS={
 'Arts visuels':'Arts plastiques',
 EPS:'Éducation physique et sportive',
 EMC:'Enseignement moral et civique',
 Anglais:'Langues vivantes étrangères',
 'Reo Tahiti':'Langues et culture polynésiennes'
};

const LEGACY_THEMES={
 Français:{
  Lecture:'Lecture et compréhension de l’écrit',
  "Production d'écrits":'Écriture',
  Vocabulaire:'Étude de la langue',
  Phonologie:'Étude de la langue'
 },
 Mathématiques:{
  Nombres:'Nombres et calculs',
  Calcul:'Nombres et calculs',
  Problèmes:'Nombres et calculs',
  Mesures:'Grandeurs et mesures',
  Géométrie:'Espace et géométrie'
 },
 Sciences:{
  "L'espace":'Se situer dans l’espace',
  'Le temps':'Se situer dans le temps',
  'Physique-Chimie':'Matière, mouvement, énergie, information',
  'Sciences et Vie de la Terre':'Le vivant, sa diversité et les fonctions qui le caractérisent',
  Technologie:'Matériaux et objets techniques'
 }
};

export function curriculumFor(subject,cycle) {
 const catalog=CURRICULUM[cycle];
 return catalog&&Object.hasOwn(catalog,subject)?catalog[subject]:null;
}

export function subjectLabel(subject,cycle) {
 return curriculumFor(subject,cycle)?.label||(Object.hasOwn(LABELS,subject)?LABELS[subject]:subject);
}

export function curriculumTheme(subject,cycle,theme) {
 const groups=curriculumFor(subject,cycle)?.groups;
 if(!groups||!theme||Object.hasOwn(groups,theme))return theme;
 const replacement=LEGACY_THEMES[subject]?.[theme]||theme;
 if(Object.hasOwn(groups,replacement))return replacement;
 if(replacement==='Étude de la langue'&&Object.hasOwn(groups,'Étude de la langue (grammaire, orthographe, lexique)'))
  return 'Étude de la langue (grammaire, orthographe, lexique)';
 return theme;
}

export function curriculumSkills(subject,cycle,theme) {
 const groups=curriculumFor(subject,cycle)?.groups;
 if(!groups)return [];
 const selected=curriculumTheme(subject,cycle,theme);
 if(!selected)return [...new Set(Object.values(groups).flat())];
 return Object.hasOwn(groups,selected)?groups[selected]:[];
}
