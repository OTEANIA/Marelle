import LessonSkills from "./LessonSkills.jsx";
import {lessonSkills} from "./lesson-skills.js";
import {subjectLabel} from './curriculum.js';
import {useSubjectPalette,useSheetPalette} from './subject-appearance.jsx';
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import { showLessonBackground } from "./appearance.js";
import { AccountGate } from "./account.jsx";
import WeekSettings from "./WeekSettings.jsx";
import SubjectFields from "./SubjectFields.jsx";
import Resources from "./Resources.jsx";
import WeeklyPrint from "./WeeklyPrint.jsx";
import Journal from "./Journal.jsx";
import Workshop,{validateWorkshop} from "./Workshop.jsx";
import PrintPreview from "./PrintPreview.jsx";
import {paletteStyle} from "./subject-palette.js";
import {lessonTiming} from "./lesson-duration.js";
import DaySlots from "./DaySlots.jsx";
import{previewLessonSlot}from"./resolved-day.js";
import {SUBJECTS,lessonDescriptor} from "./disciplines.js";
import { DAYS, migratePlanner, configForDay, effectiveSlots, slotsForDate, isBreak, visibleLessonKeys, validateWeekTemplate } from "./schedule.js";
const subjects = SUBJECTS;
const days = DAYS;
const uid = () => crypto.randomUUID();
const step = () => ({ id: uid(), title: "", time: "", instruction: "", details: "", observables: "", mode: "Collectif" });
const blank = () => ({ title: "", showBackground: true, subject: "Français", subTheme: "", cycle: "", level: "CE1 / CE2", number: "", sequence: "", objectives: "", skills: "", material: "", criteria: "", differentiation: "", notes: "", steps: [step()] });
const initialSlots = [["08:00", "08:20", "Accueil et rituels"], ["08:20", "09:05", "Français"], ["09:05", "09:50", "Mathématiques"], ["09:50", "10:10", "Récréation"], ["10:10", "10:50", "Langues"], ["10:50", "11:30", "Ateliers"], ["11:30", "13:00", "Pause déjeuner"], ["13:00", "13:45", "Découverte"], ["13:45", "14:30", "Arts / EPS"]].map(([start, end, label]) => ({ id: uid(), start, end, label }));
const example = { ...blank(), title: "Utiliser un compas", subject: "Mathématiques", number: "3", objectives: "Parfaire le tracé d’un cercle au compas. Utiliser le centre et le rayon pour construire des cercles.", skills: "Utiliser les instruments de tracé. Construire un cercle connaissant son centre et son rayon.", material: "Compas, règles, feuilles de brouillon et fiches de tracé.", criteria: "Tracer un cercle en gardant la pointe fixe. Identifier le centre et le rayon.", steps: [{ ...step(), title: "Rappel et entraînement", time: "15", instruction: "Reprendre la tenue du compas et tracer des cercles.", details: "Rappel collectif puis essais individuels. Utiliser un point de repère pour stabiliser la pointe.", observables: "La pointe reste fixe pendant le tracé." }, { ...step(), title: "Défis de tracé", time: "20", instruction: "Tracer des cercles de rayons différents, puis une rosace.", details: "Proposer des tracés guidés, puis libres selon les besoins.", observables: "L’écartement du compas est conservé.", mode: "Individuel" }, { ...step(), title: "Institutionnalisation", time: "10", instruction: "Identifier et légender le centre et le rayon.", details: "Construire une trace écrite collective.", observables: "Les élèves nomment le centre et le rayon." }] };
function monday(d) {
  let x = /* @__PURE__ */ new Date(d + "T12:00:00");
  x.setDate(x.getDate() - (x.getDay() + 6) % 7);
  return localDate(x);
}
function localDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function plus(d, n) {
  let x = /* @__PURE__ */ new Date(d + "T12:00:00");
  x.setDate(x.getDate() + n);
  return localDate(x);
}
const pretty = (d) => (/* @__PURE__ */ new Date(d + "T12:00:00")).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
const duration = (s) => {
  if(Number.isFinite(s.teachingMinutes))return s.teachingMinutes;
  const t = (v) => v.split(":").reduce((h, m) => h * 60 + +m);
  return t(s.end) - t(s.start);
};
const meta = (s) => subjects.find((x) => x[0] === s) || subjects[0];
function App({ initialData, storageKey, profile, onProfile, onLogout, onData, syncStatus, retrySync }) {
 const subjectPalette=useSubjectPalette();

  const [data, setData] = useState(() => {
    if (initialData) return migratePlanner(initialData);
    try {
      let v = JSON.parse(localStorage.getItem(storageKey));
      if (v?.slots && v.lessons) return migratePlanner(v);
    } catch {
    }
    return migratePlanner({ slots: initialSlots, lessons: {}, seeded: false });
  });
  const [week, setWeek] = useState(() => monday(new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Tahiti", year: "numeric", month: "2-digit", day: "2-digit" }).format(/* @__PURE__ */ new Date())));
  const [view, setView] = useState("week");
  const [day, setDay] = useState(0);
  const [edit, setEdit] = useState(null);
  const [draft, setDraft] = useState(null);
  const [settings, setSettings] = useState(false);
  const [print, setPrint] = useState(null);
  const [preview,setPreview]=useState(null);
  const [sheetFit,setSheetFit]=useState(1);
  const [notice, setNotice] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [tab, setTab] = useState("Essentiel");
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
    onData(data);
  }, [data]);
  useEffect(() => {
    const f = (e) => {
      if (e.key === "Escape") {
        setEdit(null);
        setSettings(false);
      }
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);
  const key = (d, s, l) => `${d}|${s.id}|${l}`;
  const open = (d, s, l) => {
    s=previewLessonSlot(data,d,s);
    let k = key(d, s, l);
    setEdit({ key: k, date: d, slot: s, lane: l });
    setDraft(structuredClone(data.lessons[k] || { ...blank(), level: l === "all" ? "CE1 / CE2" : l }));
    setTab("Essentiel");
  };
  const flash = (t) => {
    setNotice(t);
    setTimeout(() => setNotice(""), 3500);
  };
  const save = () => {
    if(edit.loose){const items=data.looseLessons||[];setData({...data,looseLessons:items.some(x=>x.id===draft.id)?items.map(x=>x.id===draft.id?draft:x):[...items,draft]});setEdit(null);flash("Séance hors semainier enregistrée");return;}
    let lessons = { ...data.lessons };
    const base = edit.date + "|" + edit.slot.id + "|";
    const conflicts = edit.lane === "all" ? ["CE1", "CE2"] : ["all"];
    if (conflicts.some((l) => lessons[base + l])) {
      if (!confirm("Remplacer l’activité commune par les groupes séparés (ou inversement) sur ce créneau ?")) return;
      conflicts.forEach((l) => delete lessons[base + l]);
    }
    lessons[edit.key] = draft;
    setData({ ...data, lessons });
    setEdit(null);
    flash("Séance enregistrée ♡");
  };
  const exportJSON = () => {
    let a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ version: 2, ...data }, null, 2)], { type: "application/json" }));
    a.download = "marelle-sauvegarde.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importJSON = async (e) => {
    try {
      let v = JSON.parse(await e.target.files[0].text());
      if (!Array.isArray(v.slots) || !v.lessons || Object.values(v.lessons).some(l => !Array.isArray(l.steps) || typeof l.title !== "string")) throw Error();
      v = validateWorkshop(migratePlanner(v));
      if (confirm("Remplacer les données actuelles par cette sauvegarde ?")) {
        setData(v);
        flash("Sauvegarde restaurée");
      }
    } catch {
      flash("Ce fichier n’est pas une sauvegarde Marelle valide.");
    }
    e.target.value = "";
  };
  const executePrint = (p) => {
    setPrint(p);
    setTimeout(async () => {
      await document.fonts.ready;
      await Promise.all([...document.querySelectorAll("#print-area img")].map((i) => i.complete ? Promise.resolve() : new Promise((r) => {
        i.onload = r;
        i.onerror = r;
      })));
      window.marelle ? window.marelle.print(p.type).catch((e) => flash("Impression : " + e.message)) : window.print();
    }, 150);
  };
  const doPrint=p=>{if(['lesson','sequence','project'].includes(p.type)){setSheetFit(1);setPreview(p)}else executePrint(p)};
  const openLoose=item=>{const lesson=item||{...blank(),id:uid()};setDraft(structuredClone(lesson));setEdit({loose:true,date:null,slot:{start:"00:00",end:"00:00",teachingMinutes:lessonTiming(lesson,0).total}});setTab("Essentiel")};
  const workshopView=["loose","sequences","projects"].includes(view);
  const weekDates = days.map((_,i)=>plus(week,i));
  const visibleKeys = visibleLessonKeys(data,weekDates);
  const preparedKeys = Object.keys(data.lessons).filter(k=>k.slice(0,10)>=week&&k.slice(0,10)<=plus(week,4));
  const count = preparedKeys.filter(k=>visibleKeys.has(k)).length;
  const hiddenCount = preparedKeys.length-count;
  return <><div className="app"><aside><a className="brand" href="#"><span className="brand-icon">✿</span><span>Marelle<small>MON ATELIER DE CLASSE</small></span></a><div className="teacher"><div className="avatar">{profile.name?.slice(0, 1).toUpperCase() || "✿"}</div><div>{profile.name}<small>{profile.className}</small></div><span>✧</span></div><div className="nav-label">MON ORGANISATION</div><button className={"nav " + (view === "week" ? "active" : "")} onClick={() => setView("week")}>▦ <span>Mon semainier</span></button><button className={"nav " + (view === "day" ? "active" : "")} onClick={() => setView("day")}>▤ <span>Cahier journal</span></button><button className="nav" onClick={() => {
    setSettings(true);
  }}>◷ <span>Ma semaine type</span></button><button className={"nav "+(view==='resources'?'active':'')} onClick={()=>setView('resources')}>▤ <span>Ressources pédagogiques</span></button>{[["loose","Séances hors semainier"],["sequences","Mes séquences"],["projects","Projets interdisciplinaires"]].map(([id,label])=><button className={"nav "+(view===id?"active":"")} key={id} onClick={()=>setView(id)}>✿ <span>{label}</span></button>)}<div className="sidebar-note"><span>✿</span><h3>Une petite case,<br />de grandes idées.</h3><p>Double-clique sur un créneau pour préparer ta séance.</p></div><button className="nav" onClick={onProfile}>♡ <span>Mon profil</span></button><button className="nav" onClick={onLogout}>▱ <span>Dossier de données</span></button><div className="sync-note" role="status">{syncStatus}<button onClick={retrySync}>Enregistrer maintenant</button></div><div className="backup"><button onClick={exportJSON}>↓ Sauvegarder mes données</button><label>↥ Restaurer une sauvegarde<input type="file" accept=".json" onChange={importJSON} /></label><small>{storageError ? "⚠ Sauvegarde locale indisponible : exporte tes données." : "● Enregistré dans ce navigateur"}</small></div></aside><main><header><span>MON ESPACE ENSEIGNANT</span><div>Un peu d’organisation, beaucoup d’imagination <b>✧</b></div></header><section className="welcome"><div className="eyebrow">BONJOUR {profile.name.toUpperCase()} ☀</div><h1>{workshopView?({loose:"Mes séances hors semainier.",sequences:"Mes fiches séquences.",projects:"Mes projets interdisciplinaires."}[view]):view === "week" ? "Ma semaine, tout en douceur." : view==='resources'?"Mes ressources pédagogiques.":"Mon cahier journal."}</h1><p>{workshopView?"Des préparations à conserver, compléter et imprimer au fil de tes cours.":view === "week" ? "Préparer, imaginer, transmettre. Une séance à la fois." : view==='resources'?"Des repères à garder à portée de main.":"L’essentiel de ma journée, prêt à être emporté en classe."}</p><div className="welcome-flower">✿<i>✧</i></div></section>{!workshopView&&view!=='resources'&&<div className="toolbar"><div className="week-picker"><button aria-label="Semaine précédente" onClick={() => setWeek(plus(week, -7))}>‹</button><div><strong>{pretty(week)} — {pretty(plus(week, 4))}</strong><small>{new Date(week).getFullYear()} · Semaine de classe</small></div><button aria-label="Semaine suivante" onClick={() => setWeek(plus(week, 7))}>›</button><input aria-label="Choisir la semaine" type="date" value={week} onChange={(e) => e.target.value && setWeek(monday(e.target.value))} /></div><div className="actions"><span className="counter">✧ {count} séance{count > 1 ? "s" : ""} préparée{count > 1 ? "s" : ""}</span><button onClick={() => {
    let next = plus(week, 7), lessons = { ...data.lessons };
    for (let k in data.lessons) {
      if (visibleKeys.has(k)) {
        const nk = plus(k.slice(0, 10), 7) + k.slice(10);
        if (!lessons[nk]) lessons[nk] = structuredClone(data.lessons[k]);
      }
    }
    setData({ ...data, lessons });
    setWeek(next);
    flash("Séances copiées vers la semaine suivante");
  }}>Dupliquer la semaine</button><button onClick={()=>doPrint({type:"week",week})}>▤ Imprimer le semainier</button><button className="primary" onClick={() => {
    setView("day");
    doPrint({ type: "journal", date: plus(week, day) });
  }}>↓ Cahier du jour</button></div></div>}{workshopView?<Workshop key={view} kind={view} data={data} onData={setData} onLesson={openLoose} onNewLesson={()=>openLoose()} onPrint={doPrint}/>:view==='resources'?<Resources notify={flash}/>:view === "week" ? <><div className="legend">{subjects.map((s) => <span key={s[0]}><i style={{ background: subjectPalette(s[0]).card }} />{subjectLabel(s[0])}</span>)}</div><div className="mobile-week-days" aria-label="Jour du semainier">{days.map((label,index)=><button key={label} type="button" aria-pressed={index===day} onClick={()=>setDay(index)}>{label}</button>)}</div><div className="planner week-planner"><div className="weekly-layout">{days.map((label,index)=>{
 const date=plus(week,index), config=configForDay(data,index);
 return <section className={"week-column"+(index===day?" week-column-current":"")} key={label} aria-label={label}><div className={'week-column-head '+(index===day?'selected-day':'')}><button onClick={()=>{setDay(index);setView('day')}}>{label}<span>{new Date(date+'T12:00:00').getDate()}</span></button><small>{config.enabled?'Fin des classes à '+config.endTime:'Sans classe'}</small></div><div className="week-column-body"><DaySlots date={date} data={data} onOpen={open} onSelect={()=>setDay(index)}/><div className="end-of-day"><span>{config.enabled?'☀':'☁'}</span><strong>{config.enabled?'Fin des classes · '+config.endTime:'Journée sans classe'}</strong><small>{config.enabled?'Aucun créneau au-delà de cette heure.':'Aucune séance prévue.'}</small></div></div></section>
})}</div></div>{hiddenCount>0&&<p className="schedule-notice">{hiddenCount} séance(s) hors des horaires actuels sont conservées dans tes données. Elles ne sont pas imprimées dans le cahier journal ; réactive leurs créneaux pour les retrouver.</p>}<div className="bottom-hint"><span>♡ Ton semainier garde le rythme. Tes idées font le reste.</span><button onClick={() => {
    const mondaySlots=slotsForDate(data,week).filter(s=>!isBreak(s));
    let s=mondaySlots.find(x=>x.label==='Mathématiques')||mondaySlots[0];
    if(!s){flash('Ajoute un créneau le lundi dans Ma semaine type.');return;}
    const k = key(week, s, "all");
    if (data.lessons[k] && !confirm("Remplacer cette séance par l’exemple ?")) return;
    setData({ ...data, lessons: { ...data.lessons, [k]: structuredClone(example) } });
    flash("Exemple ajouté au lundi");
  }}>Essayer avec une séance exemple ↗</button></div></> : <><div className="day-tabs">{days.map((d, i) => <button className={day === i ? "chosen" : ""} onClick={() => setDay(i)} key={d}>{d} {(/* @__PURE__ */ new Date(plus(week, i) + "T12:00:00")).getDate()}</button>)}</div><Journal date={plus(week, day)} data={data} onEdit={open} profile={profile} /></>}<footer>Marelle <span>✿</span> Un espace pour faire grandir les idées.</footer></main></div>
{edit && draft && <div className="overlay" onMouseDown={(e) => {
    if (e.target === e.currentTarget && confirm("Fermer sans enregistrer les modifications ?")) setEdit(null);
  }}><section className="modal" role="dialog" aria-modal="true" aria-label="Préparer ma séance"><div className="modal-head"><div><small>{edit.loose?"Séance indépendante du semainier":<>{days[(/* @__PURE__ */ new Date(edit.date + "T12:00:00")).getDay() - 1]} {pretty(edit.date)} · {edit.slot.start}–{edit.slot.end}</>}</small><h2>Une nouvelle idée à faire grandir ✿</h2></div><button aria-label="Fermer" onClick={() => {
    if (confirm("Fermer sans enregistrer ?")) setEdit(null);
  }}>×</button></div><div className="tabs">{["Essentiel", "Déroulement", "Réussite & adaptations"].map((t) => <button className={tab === t ? "chosen" : ""} onClick={() => setTab(t)} key={t}>{t}</button>)}</div><label className="background-toggle"><input type="checkbox" checked={showLessonBackground(draft)} onChange={(e) => setDraft({ ...draft, showBackground: e.target.checked })} /> Inclure le fond de la discipline (opacité 20 %)</label><div className="modal-body"><p className="soft-note" role="status"><b>Durée des étapes : {lessonTiming(draft,duration(edit.slot)).total} min</b>{!edit.loose&&<> · Créneau : {duration(edit.slot)} min</>}{!lessonTiming(draft,duration(edit.slot)).complete&&" · Certaines durées restent à renseigner."}</p>{tab === "Essentiel" ? <><div className="form-grid"><Field label="Nom de la séance" value={draft.title} change={(v) => setDraft({ ...draft, title: v })} wide /><SubjectFields lesson={draft} onChange={setDraft} /><Field label="Niveau / groupe" value={draft.level} change={(v) => setDraft({ ...draft, level: v })} /><Field label="Séquence" value={draft.sequence} change={(v) => setDraft({ ...draft, sequence: v })} /><Field label="N° de séance" value={draft.number} change={(v) => setDraft({ ...draft, number: v })} /><LessonSkills key={JSON.stringify([draft.subject,draft.cycle,draft.level,draft.subTheme])} lesson={draft} onChange={setDraft} />{[["objectives", "Objectifs"], ["material", "Matériel"]].map(([k, l]) => <Field key={k} label={l} value={draft[k]} area wide change={(v) => setDraft({ ...draft, [k]: v })} />)}</div><p className="soft-note">Tu peux enregistrer une séance partielle et la compléter plus tard.</p></> : tab === "Déroulement" ? <><div className="step-summary"><b>{draft.steps.length} étape(s)</b><span>{lessonTiming(draft,duration(edit.slot)).total} min renseignées{!edit.loose&&<> / {duration(edit.slot)} min au créneau</>}</span></div>{!edit.loose&&lessonTiming(draft,duration(edit.slot)).total > duration(edit.slot) && <p className="warning">Le déroulement dépasse la durée du créneau.</p>}{draft.steps.map((s, i) => <div className="step-card" key={s.id}><div className="step-header"><span>ÉTAPE {i + 1}</span><div><button disabled={!i} aria-label="Monter l’étape" onClick={() => {
    let a = [...draft.steps];
    [a[i - 1], a[i]] = [a[i], a[i - 1]];
    setDraft({ ...draft, steps: a });
  }}>↑</button><button disabled={i === draft.steps.length - 1} aria-label="Descendre l’étape" onClick={() => {
    let a = [...draft.steps];
    [a[i + 1], a[i]] = [a[i], a[i + 1]];
    setDraft({ ...draft, steps: a });
  }}>↓</button><button aria-label="Supprimer l’étape" onClick={() => setDraft({ ...draft, steps: draft.steps.filter((x) => x.id !== s.id) })}>×</button></div></div><div className="form-grid">{[["title", "Nom de l’étape", false], ["time", "Temps (minutes)", false], ["instruction", "Consigne principale · reprise dans le cahier journal", true], ["details", "Précisions / descriptif · fiche complète uniquement", true], ["observables", "Observables · fiche complète uniquement", true]].map(([k, l, a]) => <Field key={k} label={l} value={s[k]} type={k === "time" ? "number" : "text"} area={a} wide={a} change={(v) => setDraft({ ...draft, steps: draft.steps.map((x) => x.id === s.id ? { ...x, [k]: v } : x) })} />)}<Field label="Modalité de travail" value={s.mode} options={["Collectif", "Individuel", "Binômes", "Groupes", "Autonomie", "Avec l’enseignant"]} change={(v) => setDraft({ ...draft, steps: draft.steps.map((x) => x.id === s.id ? { ...x, mode: v } : x) })} /></div></div>)}<button className="add-step" onClick={() => setDraft({ ...draft, steps: [...draft.steps, step()] })}>＋ Ajouter une étape</button></> : <div className="form-grid">{[["criteria", "Critères de réussite"], ["differentiation", "Différenciation / aides"], ["notes", "Bilan après la séance / suites à prévoir"]].map(([k, l]) => <Field key={k} label={l} value={draft[k]} area wide change={(v) => setDraft({ ...draft, [k]: v })} />)}</div>}</div><div className="modal-foot"><button className="danger" onClick={() => {
    if (confirm("Supprimer cette séance ?")) {
      if(edit.loose){setData({...data,looseLessons:(data.looseLessons||[]).filter(x=>x.id!==draft.id)});setEdit(null);return;}
      let lessons = { ...data.lessons };
      delete lessons[edit.key];
      setData({ ...data, lessons });
      setEdit(null);
    }
  }}>Supprimer</button><button onClick={() => doPrint({ type: "lesson", lesson: draft, date: edit.date, slot: edit.slot })}>Aperçu / PDF</button><button className="primary" onClick={save}>♡ Enregistrer la séance</button></div></section></div>}
{settings && <WeekSettings value={data.weekTemplate} onClose={()=>setSettings(false)} onSave={weekTemplate=>{setData({...data,weekTemplate});setSettings(false);flash('Semaine type enregistrée')}}/>}
{notice && <div className="toast" role="status">{notice}</div>}{preview && <PrintPreview landscape={preview.type!=="lesson"} onClose={()=>setPreview(null)} onFit={setSheetFit} onPrint={()=>executePrint(preview)}>{preview.content||<LessonPrint {...preview}/>}</PrintPreview>}<div id="print-area" style={{"--sheet-fit":sheetFit}}>{print?.content?print.content:print?.type === "week" ? <WeeklyPrint week={print.week} data={data} profile={profile}/> : print?.type === "journal" ? <Journal date={print.date} data={data} profile={profile} printable /> : print?.type === "lesson" ? <LessonPrint {...print} /> : null}</div></>;
}
function Field({ label, value, change, area, options, wide, type = "text" }) {
  return <label className={"field " + (wide ? "wide" : "")}><span>{label}</span>{options ? <select value={value || ""} onChange={(e) => change(e.target.value)}>{options.map((v) => <option key={v}>{v}</option>)}</select> : area ? <textarea rows={3} value={value || ""} onChange={(e) => change(e.target.value)} /> : <input min={type === "number" ? 0 : void 0} type={type} value={value || ""} onChange={(e) => change(e.target.value)} />}</label>;
}
function LessonPrint({ lesson: l, date, slot }) {
 const timing=lessonTiming(l,duration(slot));
 const skills=lessonSkills(l);
 const palette=useSheetPalette(l);
 return <article className="lesson-print" style={paletteStyle(palette)}>{showLessonBackground(l)&&<img className="sheet-bg" alt="" src={"assets/"+meta(l.subject)[1]}/>}
 <div className="sheet-content"><h1>{l.title||"Séance à préparer"}</h1><div className="sheet-sub">Séance {l.number||"…"} · {l.level}{date&&<> · {pretty(date)}</>}</div>
 <div className="sheet-info"><b>Discipline :</b> {lessonDescriptor(l)} {l.sequence&&" · "+l.sequence}<br/>
 <b>Durée des étapes :</b> {timing.total?`${timing.total} min${timing.complete?'':' (total partiel)'}`:'non renseignée'}{date&&<> · <b>Créneau :</b> {timing.slotMinutes} min</>}
 {date&&timing.total>0&&timing.difference!==0&&<small className="timing-note">Écart au créneau : {timing.difference>0?'+':''}{timing.difference} min{!timing.complete?' (durées à compléter)':''}</small>}</div>
 {l.material&&<div className="sheet-info"><b>Matériel :</b> {l.material}</div>}
 {(skills.main.length>0||skills.associated.length>0)&&<div className="sheet-info sheet-skills">
  {[[skills.main,"Compétences principales"],[skills.associated,"Compétences associées"]].map(([items,label])=>items.length>0&&<div key={label}>
   <b>{label}</b><ul>{items.map(text=><li key={text}>{text}</li>)}</ul>
  </div>)}
 </div>}
 {l.objectives&&<div className="sheet-info"><b>Objectifs :</b> {l.objectives}</div>}
 <table><thead><tr><th>Durée</th><th>Consigne · Déroulement</th><th>Observables</th></tr></thead><tbody>{(l.steps||[]).map((s,i)=><React.Fragment key={s.id||i}><tr className="stage-band"><th colSpan="3">{i+1}. {s.title||"Étape"}</th></tr><tr className="stage-body"><td>{s.time&&s.time+" min"}</td><td>{s.instruction&&<div className="stage-instruction">{s.instruction}</div>}{s.details&&<p>{s.details}</p>}</td><td>{s.mode&&<div className="stage-mode"><b>Modalité :</b> {s.mode}</div>}{s.observables}</td></tr></React.Fragment>)}</tbody></table>
 {[["criteria","Critères de réussite"],["differentiation","Différenciation"],["notes","Bilan / suites"]].map(([k,t])=>l[k]&&<div className="sheet-info" key={k}><b>{t} :</b> {l[k]}</div>)}</div></article>;
}
createRoot(document.getElementById("root")).render(<AccountGate renderApp={(props) => <App {...props} />} />);
