// Palettes des documents, indépendantes du thème du profil.
export const PALETTES={
 'Français':{ink:'#674817',accent:'#87601b',line:'#bd9d60',soft:'#faedcc',card:'#f8e9ba'},
 'Arts visuels':{ink:'#713c42',accent:'#9b555e',line:'#c78d94',soft:'#fae5e2',card:'#f7d8d1'},
 'EMC':{ink:'#414141',accent:'#606060',line:'#a0a0a0',soft:'#eeeeee',card:'#e7e7e7'},
 'Anglais':{ink:'#1c5558',accent:'#276f73',line:'#7cb7b6',soft:'#ddf2ef',card:'#cfece8'},
 'EPS':{ink:'#792f35',accent:'#a33b44',line:'#cb868c',soft:'#fae2e4',card:'#f4cfd3'},
 'Géographie':{ink:'#235542',accent:'#287457',line:'#79ad96',soft:'#def0e7',card:'#cfe9dc'},
 'Histoire':{ink:'#65432f',accent:'#805b40',line:'#b3947d',soft:'#f1e5da',card:'#e9d9c9'},
 'Mathématiques':{ink:'#283d78',accent:'#3657a5',line:'#8da3d1',soft:'#e3eafa',card:'#d5e0f7'},
 'Reo Tahiti':{ink:'#794219',accent:'#a35c22',line:'#d1a070',soft:'#faead6',card:'#f8dfbf'},
 'Sciences':{ink:'#5a3d73',accent:'#79539b',line:'#ad91c3',soft:'#eee3f7',card:'#e4d5f1'}
};
export const GRAYSCALE={ink:'#333333',accent:'#555555',line:'#999999',soft:'#eeeeee',card:'#e7e7e7'};
export function subjectPalette(subject){return PALETTES[subject]|| (subject==='Éducation musicale'?PALETTES['Arts visuels']:subject==='Vie de classe'?PALETTES.EMC:GRAYSCALE)}
export function sheetPalette(lesson){return lesson.showBackground===false?GRAYSCALE:subjectPalette(lesson.subject)}
export function paletteStyle(palette){return Object.fromEntries(Object.entries(palette).map(([key,value])=>['--subject-'+key,value]))}
