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
