import test from'node:test';import assert from'node:assert/strict';import{SUBJECTS,SUBTHEMES,SCIENCE_SUBTHEMES,subthemesFor,changeSubject,changeScienceCycle,scienceCycle,lessonDescriptor}from'../disciplines.js';
test('éducation musicale disponible avec un fond existant',()=>{assert(SUBJECTS.some(([name,file])=>name==='Éducation musicale'&&file==='_arts(1).png'))});
test('les sous-thèmes français et maths correspondent aux choix demandés',()=>{assert.deepEqual(SUBTHEMES['Français'],['Littérature','Vocabulaire','Étude de la langue','Phonologie','Lecture',"Production d'écrits",'Langage oral']);assert.deepEqual(SUBTHEMES['Mathématiques'],['Nombres','Mesures','Géométrie','Problèmes','Calcul'])});
test('sciences : les deux cycles proposent des listes distinctes',()=>{assert.deepEqual(subthemesFor({subject:'Sciences',cycle:'Cycle 2'}),['Le vivant, la matière et les objets',"L'espace",'Le temps']);assert.deepEqual(subthemesFor({subject:'Sciences',cycle:'Cycle 3'}),['Physique-Chimie','Sciences et Vie de la Terre','Technologie'])});
test('anciennes préparations conservées et cycle proposé selon le niveau',()=>{assert.equal(scienceCycle({level:'CE1 / CE2'}),'Cycle 2');assert.equal(scienceCycle({level:'CM1 / CM2'}),'Cycle 3');assert.equal(scienceCycle({level:'CE2',cycle:'Cycle 3'}),'Cycle 3');assert.equal(lessonDescriptor({subject:'Français',level:'CE1'}),'Français')});
test('changement de discipline réinitialise seulement les champs associés',()=>{const l={subject:'Français',subTheme:'Lecture',title:'Texte',steps:[{instruction:'Lire'}],level:'CM1'};const next=changeSubject(l,'Sciences');assert.equal(next.subTheme,'');assert.equal(next.cycle,'Cycle 3');assert.equal(next.title,l.title);assert.deepEqual(next.steps,l.steps);assert.equal(l.subTheme,'Lecture');assert.equal(changeSubject(next,'Mathématiques').cycle,'')});
test('changement de cycle ne conserve pas un sous-thème incompatible',()=>{const l={subject:'Sciences',cycle:'Cycle 2',subTheme:'Le temps',objectives:'Se repérer'};const next=changeScienceCycle(l,'Cycle 3');assert.equal(next.subTheme,'');assert.equal(next.objectives,'Se repérer');assert.equal(changeScienceCycle({...next,subTheme:'Technologie'},'Cycle 3').subTheme,'Technologie');assert.throws(()=>changeScienceCycle(l,'Cycle 8'))});
test('sous-thème et cycle sont conservés par export/import JSON',()=>{const l={subject:'Sciences',cycle:'Cycle 3',subTheme:'Technologie'};assert.equal(lessonDescriptor(JSON.parse(JSON.stringify(l))),'Sciences et technologie · Cycle 3 · Matériaux et objets techniques');assert.deepEqual(subthemesFor({subject:'Éducation musicale'}),[])});

test("vie de classe et production d’écrits sont proposés et conservés",()=>{assert(SUBJECTS.some(s=>s[0]==='Vie de classe'));const lesson={subject:'Français',subTheme:"Production d'écrits"};assert(subthemesFor(lesson).includes(lesson.subTheme));assert.equal(lessonDescriptor(JSON.parse(JSON.stringify(lesson))),"Français · Écriture")});

test('le référentiel couvre les disciplines de chaque cycle et filtre les sous-thèmes',async()=>{
 const {CURRICULUM}=await import('../curriculum-data.js');
 const {curriculumFor,curriculumSkills,curriculumTheme}=await import('../curriculum.js');
 for(const [cycle,subjects] of Object.entries(CURRICULUM)){
  for(const [subject,catalog] of Object.entries(subjects)){
   assert.ok(catalog.source);
   for(const [theme,skills] of Object.entries(catalog.groups)){
    assert.ok(skills.length>0,cycle+' · '+subject+' · '+theme);
    assert.deepEqual(curriculumSkills(subject,cycle,theme),skills);
   }
  }
 }
 assert.equal(curriculumFor('Histoire','Cycle 2'),null);
 assert.equal(curriculumTheme('Français','Cycle 2','Vocabulaire'),'Étude de la langue (grammaire, orthographe, lexique)');
 assert.ok(curriculumSkills('EPS','Cycle 2','Conduire et maîtriser un affrontement collectif ou interindividuel').includes('Accepter l’opposition et la coopération.'));
 assert.ok(!curriculumSkills('EPS','Cycle 2','Produire une performance optimale, mesurable à une échéance donnée').includes('Accepter l’opposition et la coopération.'));
 assert.deepEqual(curriculumSkills('Français','Cycle 3','Sous-thème inconnu'),[]);
});
