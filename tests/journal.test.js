import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import{createRequire}from'node:module';import{build}from'esbuild';import{migratePlanner}from'../schedule.js';
test('le journal rendu exclut réellement les séances après la sortie et les journées fermées',async()=>{
 const directory=await fs.mkdtemp(path.join(os.tmpdir(),'marelle-journal-'));try{
  let source=await fs.readFile(new URL('../src.jsx',import.meta.url),'utf8');source=source.replace(/createRoot\(document\.getElementById\("root"\)\)\.render\([\s\S]*$/, '');
  source+='\nimport {renderToStaticMarkup} from "react-dom/server"; export {Journal,LessonPrint,SubjectFields,Resources,WeeklyPrint,DaySlots,renderToStaticMarkup};';
  const outfile=path.join(directory,'components.cjs');await build({stdin:{contents:source,loader:'jsx',resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',outfile,plugins:[{name:'omit-css',setup(b){b.onLoad({filter:/\.css$/},()=>({contents:'',loader:'js'}))}}]});
  const {Journal,LessonPrint,SubjectFields,Resources,WeeklyPrint,DaySlots,renderToStaticMarkup}=createRequire(import.meta.url)(outfile);
  const lesson=title=>({title,subject:'Français',level:'CE1',steps:[{id:'a',title:'Étape',instruction:'Consigne',details:'DETAIL_CACHE',observables:'OBS_CACHE'}]});
  const data=migratePlanner({slots:[{id:'m',start:'08:00',end:'11:30',label:'Français'},{id:'a',start:'13:00',end:'14:30',label:'Arts'}],lessons:{'2026-10-28|m|all':lesson('MATIN_PRESENT'),'2026-10-28|a|all':lesson('APRES_MIDI_MASQUE')}});data.weekTemplate[2].endTime='11:30';
  let html=renderToStaticMarkup(Journal({date:'2026-10-28',data}));assert(html.includes('MATIN_PRESENT'));assert(!html.includes('APRES_MIDI_MASQUE'));assert(!html.includes('13:00'));assert(!html.includes('DETAIL_CACHE'));assert(!html.includes('OBS_CACHE'));assert(html.includes('11:30'));
  data.weekTemplate[2].enabled=false;html=renderToStaticMarkup(Journal({date:'2026-10-28',data}));assert(!html.includes('MATIN_PRESENT'));assert(html.includes('Journée sans classe'));
  const science={...lesson('SCIENCES'),subject:'Sciences',cycle:'Cycle 3',subTheme:'Physique-Chimie'};
  const sciData=migratePlanner({slots:data.slots,lessons:{'2026-10-28|m|all':science}});
  assert(renderToStaticMarkup(Journal({date:'2026-10-28',data:sciData})).includes('Sciences · Cycle 3 · Physique-Chimie'));
  assert(renderToStaticMarkup(LessonPrint({lesson:science,date:'2026-10-28',slot:data.slots[0]})).includes('Sciences · Cycle 3 · Physique-Chimie'));
  let fields=renderToStaticMarkup(SubjectFields({lesson:science,onChange:()=>{}}));assert(fields.includes('Physique-Chimie'));assert(!fields.includes('Le vivant, la matière et les objets'));assert(fields.includes('Éducation musicale'));
  fields=renderToStaticMarkup(SubjectFields({lesson:{subject:'Français'},onChange:()=>{}}));assert(fields.includes('Phonologie'));assert(!fields.includes('Technologie'));
  const resources=renderToStaticMarkup(Resources({notify:()=>{}}));assert(resources.includes('Consulter en ligne'));assert(resources.includes('copie hors ligne'));
  const weeklyData=migratePlanner({slots:data.slots,lessons:{'2026-10-28|m|CE1':{...lesson('CE1_VISIBLE'),subTheme:"Production d'écrits"},'2026-10-28|m|CE2':{...lesson('CE2_VISIBLE'),subject:'Vie de classe',level:'CE2'},'2026-10-28|a|all':lesson('APREM_HORS_CLASSE')}});
  weeklyData.weekTemplate[2].endTime='11:30';weeklyData.weekTemplate[4].enabled=false;
  const weekly=renderToStaticMarkup(WeeklyPrint({week:'2026-10-26',data:weeklyData,profile:{name:'Test',className:'CE1/CE2'}}));
  assert(weekly.includes('Mon semainier'));assert(weekly.includes('Lundi'));assert(weekly.includes('Vendredi'));assert(weekly.includes('CE1_VISIBLE'));assert(weekly.includes('CE2_VISIBLE'));assert(weekly.includes('Production d&#x27;écrits'));assert(weekly.includes('Vie de classe'));assert(!weekly.includes('APREM_HORS_CLASSE'));assert(!weekly.includes('DETAIL_CACHE'));assert(weekly.includes('Journée sans classe'));assert(weekly.includes('Fin des classes : 11:30'));
  const fullDay=migratePlanner({slots:[{id:'one',start:'08:00',end:'09:00',label:'Français'},{id:'break',start:'09:00',end:'09:15',label:'Récréation'},{id:'two',start:'09:15',end:'10:00',label:'Mathématiques'}],lessons:{'2026-11-02|one|all':{...lesson('CROSS_UNIQUE'),subject:'EPS',objectives:'OBJECTIF_VISIBLE'}}});
  const printed=renderToStaticMarkup(Journal({date:'2026-11-02',data:fullDay,printable:true}));
  assert.equal((printed.match(/CROSS_UNIQUE/g)||[]).length,1);assert.equal((printed.match(/Observations :/g)||[]).length,1);assert.equal((printed.match(/class="observation-line/g)||[]).length,2);assert(printed.includes('10:00'));assert(printed.includes('Pauses maintenues'));assert(printed.includes('Récréation'));
  assert(!renderToStaticMarkup(Journal({date:'2026-11-02',data:fullDay})).includes('Observations :'));
  const dayCards=renderToStaticMarkup(DaySlots({date:'2026-11-02',data:fullDay,onOpen:()=>{},onSelect:()=>{}}));assert(dayCards.includes('OBJECTIF_VISIBLE'));assert(dayCards.includes('Suite :'));assert(dayCards.includes('Nouvelle séance ici'));
  const weekWithObjectives=renderToStaticMarkup(WeeklyPrint({week:'2026-11-02',data:fullDay,profile:{}}));assert(weekWithObjectives.includes('OBJECTIF_VISIBLE'));assert(weekWithObjectives.includes('Suite :'));
  const full=renderToStaticMarkup(LessonPrint({lesson:lesson('FICHE'),date:'2026-10-28',slot:data.slots[0]}));assert(full.includes('DETAIL_CACHE'));assert(full.includes('OBS_CACHE'));assert(full.includes('sheet-bg'));
  const timed=renderToStaticMarkup(LessonPrint({lesson:{...lesson('DICO'),steps:[{id:'x',title:'Phase',time:'45',instruction:'CONSIGNE_INTEGRALE',details:'DETAIL_INTEGRAL',mode:'Collectif',observables:'OBSERVABLE_INTEGRAL'}]},date:'2026-11-02',slot:{start:'08:00',end:'08:20'}}));
  assert(timed.includes('45 min'));assert(timed.includes('20 min'));assert(timed.includes('+25 min'));assert(timed.includes('stage-band'));assert(timed.includes('CONSIGNE_INTEGRALE'));assert(timed.includes('DETAIL_INTEGRAL'));assert(timed.includes('OBSERVABLE_INTEGRAL'));assert(timed.includes('Modalité :'));
  assert(renderToStaticMarkup(SubjectFields({lesson:{subject:'Français',subTheme:'Langage oral'},onChange:()=>{}})).includes('Langage oral'));
  assert(!renderToStaticMarkup(LessonPrint({lesson:{...lesson('SANS FOND'),showBackground:false},date:'2026-10-28',slot:data.slots[0]})).includes('sheet-bg'));
 }finally{await fs.rm(directory,{recursive:true,force:true})}
});
