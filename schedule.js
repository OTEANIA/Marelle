export const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
export const isTime = value => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
export const dayIndex = date => (new Date(date + 'T12:00:00').getDay() + 6) % 7;
export const isBreak = slot => /récréation|pause/i.test(slot.label);
export function migratePlanner(input, defaults = []) {
  const source = input || {slots: defaults, lessons: {}};
  if (!Array.isArray(source.slots) || !source.lessons || typeof source.lessons !== 'object' || Array.isArray(source.lessons)) throw new Error('Planning invalide');
  const weekTemplate = source.weekTemplate || Object.fromEntries(DAYS.map((_, index) => [index, {
    enabled: true,
    endTime: source.slots.reduce((end, slot) => slot.end > end ? slot.end : end, '00:00') === '00:00' ? '14:30' : source.slots.reduce((end, slot) => slot.end > end ? slot.end : end, '00:00'),
    slots: structuredClone(source.slots)
  }]));
  const errors = validateWeekTemplate(weekTemplate);
  if (errors.length) throw new Error(errors[0]);
  return {...source, schemaVersion: 2, weekTemplate};
}
export function validateWeekTemplate(template) {
  if (!template || typeof template !== 'object') return ['Semaine type manquante.'];
  const errors = [];
  DAYS.forEach((day, index) => {
    const config = template[index];
    if (!config || !Array.isArray(config.slots) || typeof config.enabled !== 'boolean' || !isTime(config.endTime)) {errors.push(`${day} : journée ou fin de classe invalide.`);return;}
    if(config.slots.some(slot=>!slot||typeof slot!=='object')){errors.push(`${day} : créneau invalide.`);return;}
    const sorted = [...config.slots].sort((a,b) => String(a.start).localeCompare(String(b.start)));
    const ids = new Set();
    sorted.forEach((slot, i) => {
      if (!slot || typeof slot.id !== 'string' || !slot.id || ids.has(slot.id) || !isTime(slot.start) || !isTime(slot.end) || slot.end <= slot.start || typeof slot.label !== 'string' || !slot.label.trim()) errors.push(`${day} : vérifier le nom et les horaires de chaque créneau.`);
      else if (i && slot.start < sorted[i-1].end) errors.push(`${day} : deux créneaux se chevauchent.`);
      ids.add(slot?.id);
    });
  });
  return errors;
}
export function configForDay(data, index) {
  if (index < 0 || index > 4) return {enabled:false,endTime:'00:00',slots:[]};
  return (data.weekTemplate || migratePlanner(data).weekTemplate)[index];
}
export function effectiveSlots(config) {
  if (!config?.enabled) return [];
  return [...config.slots].sort((a,b)=>a.start.localeCompare(b.start)).filter(slot=>isTime(slot.start)&&isTime(slot.end)&&slot.end>slot.start&&slot.start < config.endTime).map(slot=>({...slot,end:slot.end > config.endTime ? config.endTime : slot.end}));
}
export function slotsForDate(data, date) {return effectiveSlots(configForDay(data, dayIndex(date)));}
export function copyDay(template, from, to, newId = () => crypto.randomUUID()) {
  const source=template[from], target=template[to];
  // Garder les associations seulement lorsque le créneau est strictement identique.
  const slots=source.slots.map(slot=>({...slot,id:target.slots.find(old=>old.start===slot.start && old.end===slot.end && old.label===slot.label)?.id || newId()}));
  return {...template,[to]:{...structuredClone(source),slots}};
}
export function visibleLessonKeys(data, dates) {
  const result=new Set();
  dates.forEach(date=>slotsForDate(data,date).filter(slot=>!isBreak(slot)).forEach(slot=>['all','CE1','CE2'].forEach(lane=>result.add(`${date}|${slot.id}|${lane}`))));
  return result;
}
