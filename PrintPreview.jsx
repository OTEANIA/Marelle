import React,{useEffect,useRef,useState} from 'react';
export default function PrintPreview({children,onClose,onPrint,onFit,landscape=false}) {
 const ref=useRef(null),[fit,setFit]=useState(1),[ready,setReady]=useState(false),[overflow,setOverflow]=useState(false);
 useEffect(()=>{
  let cancelled=false;
  async function measure(){
   await document.fonts.ready;
   if(cancelled)return;
   await Promise.all([...ref.current.querySelectorAll('img')].map(img=>img.complete?null:new Promise(resolve=>{img.onload=resolve;img.onerror=resolve})));
   if(cancelled)return;
   const content=ref.current.querySelector('.sheet-content');
   const available=(landscape?189.5:272.5)*96/25.4;
   for(const factor of [1,.95,.9,.85]){
    content.style.setProperty('--sheet-fit',factor);
    const height=content.getBoundingClientRect().height;
    if(height<=available||factor===.85){
     setFit(factor);onFit(factor);setOverflow(height>available+1);setReady(true);break;
    }
   }
  }
  measure();
  const key=e=>{if(e.key==='Escape'){e.stopImmediatePropagation();onClose()}};
  document.addEventListener('keydown',key,true);
  const old=document.activeElement;
  ref.current.querySelector('button').focus();
  return()=>{cancelled=true;document.removeEventListener('keydown',key,true);old?.focus()};
 },[]);
 return <div className="print-preview" ref={ref} role="dialog" aria-modal="true" aria-label="Aperçu de la fiche A4" onKeyDown={e=>{
 if(e.key==='Tab'){const buttons=[...ref.current.querySelectorAll('button:not(:disabled)')];if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0].focus()}}
 }}><div className="preview-controls"><button onClick={onClose}>← Retour à la séance</button><strong>Aperçu A4 {landscape?"paysage":"portrait"}</strong><span role="status">{!ready?'Ajustement…':overflow?'Contenu trop long : impression sur plusieurs pages. Aucun texte supprimé.':`Une page · ajustement ${Math.round(fit*100)} %`}</span><button className="primary" disabled={!ready} onClick={onPrint}>Imprimer / Enregistrer en PDF</button></div><div className="preview-scroll"><div className="preview-paper" style={{'--sheet-fit':fit,width:landscape?'297mm':'210mm'}}>{children}</div></div></div>;
}
