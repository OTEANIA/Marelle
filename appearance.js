export const THEMES=[{id:'mauve',label:'Mauve',color:'#827092'},{id:'or',label:'Jaune or',color:'#ae832a'},{id:'rose',label:'Rose',color:'#ad526e'},{id:'gris',label:'Gris',color:'#686868'},{id:'turquoise',label:'Turquoise',color:'#377c7e'},{id:'rouge',label:'Rouge',color:'#b34d4d'},{id:'vert',label:'Vert',color:'#527d58'},{id:'beige',label:'Marrons-beiges',color:'#916b4c'}];
export const normalizeTheme=id=>THEMES.some(t=>t.id===id)?id:'rose';
export const showLessonBackground=lesson=>lesson.showBackground!==false;
