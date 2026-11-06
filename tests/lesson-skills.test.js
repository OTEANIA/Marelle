import test from 'node:test';
import assert from 'node:assert/strict';
import {lessonSkills,skillChoices} from '../lesson-skills.js';

const reading={subject:'Français',cycle:'Cycle 2',subTheme:'Lecture et compréhension de l’écrit'};
const audience='Prendre en compte des récepteurs ou interlocuteurs.';
const oral='Dire pour être entendu et compris, en situation d’adresse à un auditoire ou de présentation de textes';

test('le sélecteur distingue le sous-thème et les compétences associées du programme',()=>{
 assert.equal(skillChoices(reading,false).some(x=>x.text===oral),false);
 assert.equal(skillChoices(reading,false,true).some(x=>x.text===oral),true);
 assert.equal(skillChoices(reading,true,true).some(x=>x.text===audience&&x.officialAssociated),true);
});

test('les anciennes compétences reconnues reprennent les libellés du catalogue',()=>{
 const skills='• '+oral+'.\nCompétences associées :\n• '+audience.replace('.',' .')+'\n• Lire à haute voix.\nPratiquer différentes formes de lecture.';
 assert.deepEqual(lessonSkills({...reading,skills}),{
  main:[oral],associated:[audience,'Lire à haute voix.','Pratiquer différentes formes de lecture.']
 });
 assert.deepEqual(lessonSkills({...reading,skills,selectedSkills:{main:[],associated:[]}}),{main:[],associated:[]});
});

test('les formulations multiplicatives sont proposées avec leur rubrique et leur page',()=>{
 const lesson={subject:'Mathématiques',cycle:'Cycle 2',subTheme:'Nombres et calculs'};
 const choices=skillChoices(lesson,false);
 assert.ok(choices.some(x=>x.text.startsWith('Réaliser que certains problèmes')&&x.kind.includes('Modéliser')));
 assert.ok(choices.some(x=>x.text==='Il résout des problèmes du champ multiplicatif (itération d’addition).'&&x.kind.includes('CE1 · p. 96')));
 assert.ok(skillChoices(lesson,true).some(x=>x.text.startsWith('Modéliser ces problèmes')&&x.officialAssociated));
 assert.ok(!skillChoices({...lesson,subTheme:'Espace et géométrie'},false).some(x=>x.kind.includes('CE1 · p. 96')));
});
