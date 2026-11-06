import {subjectLabel} from './curriculum.js';
import {SubjectColors} from './subject-appearance.jsx';
import {SUBJECTS} from './disciplines.js';
import {subjectPalette} from './subject-palette.js';
import {migratePlanner} from "./schedule.js";
import React, { useState, useEffect, useRef } from "react";
import { THEMES, normalizeTheme } from "./appearance.js";
const get = (k) => {
  try {
    return JSON.parse(localStorage.getItem(k));
  } catch {
    return null;
  }
};
export function AccountGate({ renderApp }) {
  const [ready, setReady] = useState(false), [initial, setInitial] = useState(null), [profile, setProfile] = useState(null), [fields, setFields] = useState({ name: "", className: "CE1 / CE2", theme: "rose" }), [edit, setEdit] = useState(false), [error, setError] = useState(""), [status, setStatus] = useState("Chargement\u2026");
  const current = useRef(null), last = useRef(""), timer = useRef(null), job = useRef(null);
  const native = window.marelle;
  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const document2 = native ? await native.load() : get("marelle-desktop-browser");
        if (!live) return;
        if (document2) {
          current.current = document2;
          last.current = JSON.stringify(document2);
          setInitial(migratePlanner(document2.planner));
          setProfile(document2.profile);
        }
        setReady(true);
        setStatus(native ? "Enregistr\xE9 sur cet ordinateur" : "Aper\xE7u navigateur \xB7 stockage local");
      } catch (e) {
        if (live) setError(e.message);
      }
    };
    load();
    return () => {
      live = false;
      clearTimeout(timer.current);
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = normalizeTheme(profile?.theme);
  }, [profile?.theme]);
  const flush = async () => {
    clearTimeout(timer.current);
    if (job.current) return job.current;
    const task = (async () => {
      while (current.current?.planner && JSON.stringify(current.current) !== last.current) {
        const snapshot = structuredClone(current.current);
        setStatus("Enregistrement\u2026");
        try {
          if (native) await native.save(snapshot);
          else localStorage.setItem("marelle-desktop-browser", JSON.stringify(snapshot));
          last.current = JSON.stringify(snapshot);
          setStatus(native ? "\u2713 Enregistr\xE9 sur cet ordinateur" : "\u2713 Enregistr\xE9 dans ce navigateur");
          setError("");
        } catch (e) {
          setStatus("\u26A0 \xC9chec de la sauvegarde");
          setError("Les derni\xE8res modifications ne sont pas enregistr\xE9es : " + e.message);
          throw e;
        }
      }
    })();
    job.current = task;
    try {
      await task;
    } finally {
      job.current = null;
    }
  };
  const update = (document2) => {
    if (JSON.stringify(document2) === JSON.stringify(current.current)) return;
    current.current = document2;
    setStatus("Modifications \xE0 enregistrer\u2026");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => flush().catch(() => {
    }), 350);
  };
  useEffect(() => {
    if (!native) return;
    return native.onCloseRequest(async () => {
      if (document.querySelector(".overlay") && !confirm("Une fen\xEAtre de pr\xE9paration est ouverte. Fermer sans enregistrer les champs de ce formulaire ?")) return;
      try {
        await flush();
        native.confirmClose();
      } catch {
      }
    });
  }, [ready, profile]);
  useEffect(() => {
    const handler = (e) => {
      if (JSON.stringify(current.current) !== last.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);
  const form = <form className="account-card" onSubmit={(e) => {
    e.preventDefault();
    const p = { ...fields, name: fields.name.trim(), className: fields.className.trim(), theme: normalizeTheme(fields.theme) };
    if (!p.name || !p.className) return;
    if (!current.current) current.current = { profile: p, planner: null };
    else update({ ...current.current, profile: p });
    setProfile(p);
    setEdit(false);
  }}><div className="account-flower">✿</div><h1>{profile ? "Mon profil" : "Bienvenue sur Marelle"}</h1><p>Ton atelier de classe, sur ton ordinateur.<br />Aucun compte ni connexion nécessaire.</p><label className="field"><span>Nom affiché</span><input required maxLength={80} value={fields.name} onChange={(e) => setFields({ ...fields, name: e.target.value })} /></label><label className="field"><span>Classe en cours</span><input required maxLength={100} value={fields.className} onChange={(e) => setFields({ ...fields, className: e.target.value })} /></label><fieldset className="theme-picker"><legend>Couleur du thème</legend><div className="theme-options">{THEMES.map((t) => <label className="theme-option" key={t.id}><input type="radio" name="theme" checked={normalizeTheme(fields.theme) === t.id} onChange={() => setFields({ ...fields, theme: t.id })} /><span className="theme-swatch" style={{ background: t.color }} />{t.label}</label>)}</div></fieldset>{profile&&<fieldset className="subject-colors"><legend>Couleurs des disciplines</legend>{SUBJECTS.map(([subject])=><label key={subject}>{subjectLabel(subject)}<input type="color" value={fields.subjectColors?.[subject]||subjectPalette(subject).accent} onChange={e=>setFields({...fields,subjectColors:{...fields.subjectColors,[subject]:e.target.value}})}/></label>)}<button type="button" onClick={()=>setFields({...fields,subjectColors:{}})}>Rétablir les couleurs par défaut</button></fieldset>}<button className="primary">{profile ? "Enregistrer" : "Ouvrir mon atelier"}</button>{profile && <button type="button" onClick={() => setEdit(false)}>Annuler</button>}</form>;
  if (!ready) return <div className="account-page"><div className="account-card"><h1>Marelle ✿</h1><p role="alert">{error || "Chargement des donn\xE9es\u2026"}</p>{error && <><p>Le fichier existant n’est pas remplacé. Une copie doit être récupérée dans le dossier des données.</p><button onClick={() => native?.openDataFolder()}>Ouvrir le dossier de données</button></>}</div></div>;
  if (!profile) return <div className="account-page">{form}</div>;
  return <><SubjectColors.Provider value={profile.subjectColors}>{renderApp({ initialData: initial, storageKey: "marelle-desktop-render-cache", profile, onProfile: () => {
    setFields({ ...profile });
    setEdit(true);
  }, onLogout: () => native ? native.openDataFolder() : alert("Cet aper\xE7u utilise le stockage du navigateur. Dans l\u2019application de bureau, ce bouton ouvre le dossier des donn\xE9es."), onData: (planner) => update({ ...current.current, planner }), syncStatus: status, retrySync: () => flush().catch(() => {
  }) })}</SubjectColors.Provider>{edit && <div className="overlay">{form}</div>}{error && <div className="account-error" role="alert">{error}<button onClick={() => flush().catch(() => {
  })}>Réessayer</button></div>}</>;
}
