import {useEffect,useState} from 'react';
import type {Language} from './i18n';
import './loading-screen.css';

/** Tips describe existing rules; no loading percentages or artificial startup delay. */
export const LOADING_TIPS:Record<Language,readonly string[]>={
 de:['Hardware arbeitet auch, wenn du nicht tippst.','Qualität steigert den Umsatz pro Nutzer. Effizienz schafft Platz für mehr Nutzer.','Seltene Komponenten bleiben nach einem Prestige erhalten.','Vergleiche Item-Boni, bevor du deine Ausrüstung wechselst.','Forschung läuft auch offline weiter.','Crafting und Fusion passieren sofort – vorausgesetzt, alle Materialien sind vorhanden.'],
 en:['Hardware keeps working even when you are not tapping.','Quality increases revenue per user. Efficiency makes room for more users.','Rare components survive a prestige reset.','Compare item bonuses before changing your equipment.','Research continues while you are offline.','Crafting and fusion are instant when you have the required materials.'],
 es:['El hardware sigue trabajando aunque no pulses.','La calidad aumenta los ingresos por usuario. La eficiencia permite más usuarios.','Los componentes raros se conservan tras el prestigio.','Compara las bonificaciones antes de cambiar tu equipo.','La investigación continúa mientras estás sin conexión.','La fabricación y la fusión son instantáneas si tienes los materiales.'],
 fr:['Le matériel travaille même sans appuyer.','La qualité augmente le revenu par utilisateur. L’efficacité permet plus d’utilisateurs.','Les composants rares sont conservés après le prestige.','Compare les bonus avant de changer ton équipement.','Les recherches continuent même hors ligne.','La fabrication et la fusion sont instantanées avec les matériaux requis.'],
 pt:['O hardware continua a trabalhar mesmo sem toques.','A qualidade aumenta a receita por utilizador. A eficiência permite mais utilizadores.','Os componentes raros mantêm-se após o prestígio.','Compara os bónus antes de mudar o equipamento.','A pesquisa continua mesmo offline.','A criação e a fusão são instantâneas com os materiais necessários.'],
 it:['L’hardware lavora anche quando non tocchi lo schermo.','La qualità aumenta il ricavo per utente. L’efficienza permette più utenti.','I componenti rari restano dopo il prestigio.','Confronta i bonus prima di cambiare equipaggiamento.','La ricerca continua anche offline.','Creazione e fusione sono istantanee con i materiali richiesti.'],
 pl:['Sprzęt pracuje również wtedy, gdy nie stukasz.','Jakość zwiększa przychód na użytkownika. Wydajność pozwala obsłużyć więcej użytkowników.','Rzadkie komponenty zostają po prestiżu.','Porównaj premie przed zmianą wyposażenia.','Badania trwają również offline.','Tworzenie i łączenie są natychmiastowe, jeśli masz materiały.'],
};
export function LoadingScreen({language='de'}:{language?:Language}){
 const [index,setIndex]=useState(()=>Math.floor(Math.random()*LOADING_TIPS[language].length));
 useEffect(()=>{const timer=window.setInterval(()=>setIndex(i=>i+1),5000);return()=>window.clearInterval(timer)},[]);
 const de=language==='de',tips=LOADING_TIPS[language];
 return <main className="loading-screen" aria-label={de?'Idle Intelligence wird geladen':'Loading Idle Intelligence'}>
  <div className="loading-screen__ambient" aria-hidden="true"/>
  <div className="loading-screen__identity"><span className="loading-screen__eyebrow">NEURAL SYSTEMS / ONLINE</span><h1><img className="loading-screen__icon" src="/icons/icon-512.png" width="220" height="220" alt="Idle Intelligence"/></h1><p>{de?'Dein nächster Durchbruch wartet.':'Your next breakthrough awaits.'}</p></div>
  <div className="loading-screen__footer"><div className="loading-screen__status" role="status">{de?'Spielstand wird geladen …':'Loading your game …'}</div><div className="loading-screen__track" aria-hidden="true"><span/></div><div className="loading-screen__tip"><span>{de?'MIRA’S TIPP':'MIRA’S TIP'}</span><p>{tips[index%tips.length]}</p></div><small>IDLE INTELLIGENCE · NEURAL LINK</small></div>
 </main>;
}
