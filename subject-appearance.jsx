import {createContext,useContext} from 'react';
import {customSubjectPalette,GRAYSCALE} from './subject-palette.js';

export const SubjectColors=createContext(null);

export function useSubjectPalette() {
 const colors=useContext(SubjectColors);
 return subject=>customSubjectPalette(subject,colors);
}

export function useSheetPalette(lesson) {
 const palette=useSubjectPalette();
 return lesson.showBackground===false?GRAYSCALE:palette(lesson.subject);
}
