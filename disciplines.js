import {curriculumFor,curriculumTheme,subjectLabel} from './curriculum.js';
import {subjectPalette} from './subject-palette.js';
// Libellés de classement demandés pour les préparations de Marelle.
export const SUBJECTS = [
 ['Français','_francais(1).png','#f9e3e9','Aa'],
 ['Mathématiques','_mathematiques(1).png','#deebfb','123'],
 ['Reo Tahiti','_reotahiti(1).png','#e2f0e4','☀'],
 ['Arts visuels','_arts(1).png','#efe3fb','✿'],
 ['Éducation musicale','_arts(1).png','#f8e8c9','♫'],
 ['Anglais','_english.png','#ffe9d5','Hello'],
 ['EPS','_eps(1).png','#f9e8dd','↗'],
 ['EMC','_emc(1).png','#e7e5fb','♡'],
 ['Vie de classe','_emc(1).png','#efe9da','☀'],
 ['Géographie','_geographie(1).png','#e0f0eb','◎'],
 ['Histoire des arts','_arts(1).png','#efe3fb','✿'],
 ['Histoire','_histoire(1).png','#f2e6d9','◷'],
 ['Sciences','_sciences(1).png','#e7efda','⚗']
].map(([name,image,color,symbol])=>[name,image,subjectPalette(name).card,symbol]);
export const SCIENCE_SUBTHEMES = {
 'Cycle 2':['Le vivant, la matière et les objets',"L'espace","Le temps"],
 'Cycle 3':['Physique-Chimie','Sciences et Vie de la Terre','Technologie']
};
export const SUBTHEMES = {
 'Français':['Littérature','Vocabulaire','Étude de la langue','Phonologie','Lecture',"Production d'écrits",'Langage oral'],
 'Mathématiques':['Nombres','Mesures','Géométrie','Problèmes','Calcul']
};
export function scienceCycle(lesson) {
 if (lesson.cycle === 'Cycle 1' || lesson.cycle === 'Cycle 2' || lesson.cycle === 'Cycle 3') return lesson.cycle;
 const level=lesson.level||'';
 if (/\b(PS|MS|GS)\b|cycle\s*1/i.test(level)) return 'Cycle 1';
 if (/\b(CP|CE1|CE2)\b/i.test(level)) return 'Cycle 2';
 return /\b(CM1|CM2|6e|6ème|6eme)\b|cycle\s*3/i.test(level)?'Cycle 3':'Cycle 2';
}
export function subthemesFor(lesson) {return lesson.subject==='Sciences'?(SCIENCE_SUBTHEMES[scienceCycle(lesson)]||[]):SUBTHEMES[lesson.subject]||[];}
export function changeSubject(lesson,subject) {
 if(subject===lesson.subject)return {...lesson};
 return {...lesson,subject,subTheme:'',cycle:subject==='Sciences'?scienceCycle({level:lesson.level}):''};
}
export function changeScienceCycle(lesson,cycle) {
 if(!Object.hasOwn(SCIENCE_SUBTHEMES,cycle))throw new Error('Cycle non pris en charge');
 const subTheme=SCIENCE_SUBTHEMES[cycle].includes(lesson.subTheme)?lesson.subTheme:'';
 return {...lesson,cycle,subTheme};
}
export function lessonDescriptor(lesson) {
 const cycle=scienceCycle(lesson);
 return [subjectLabel(lesson.subject,cycle),lesson.subject==='Sciences'?cycle:'',curriculumTheme(lesson.subject,cycle,lesson.subTheme)].filter(Boolean).join(' · ');
}
