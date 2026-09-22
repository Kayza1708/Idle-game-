import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { advance, blockCost, buyHardware, computeRate, creditRate, GameState, trainingGoal } from './economy';
import { restore, SAVE_KEY, serialize } from './storage';
import { Hardware } from './Hardware';
import './style.css';

const num = (n: number, digits = 1) => new Intl.NumberFormat('de-DE', { maximumFractionDigits: digits, notation: n >= 1e6 ? 'compact' : 'standard' }).format(n);
function App() {
  const loaded = useRef(restore(localStorage.getItem(SAVE_KEY)));
  const now = Date.now();
  const elapsed = Math.max(0, (now - loaded.current.state.savedAt) / 1000);
  const resumed = advance(loaded.current.state, elapsed);
  resumed.state.savedAt = now;
  const [game, setGame] = useState<GameState>(resumed.state);
  const [saveError, setSaveError] = useState(loaded.current.error);
  const [offline, setOffline] = useState(elapsed > 10 ? { seconds: Math.min(elapsed, 86400), credits: resumed.state.credits - loaded.current.state.credits, levels: resumed.levels } : null);
  const [effects, setEffects] = useState(true);
  const [pulse, setPulse] = useState(0);
  const [levelFlash, setLevelFlash] = useState(resumed.levels > 0 ? 1 : 0);
  const gameRef = useRef(game); gameRef.current = game;
  const stage = game.hardware >= 25 ? 3 : game.hardware >= 10 ? 2 : 1;

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      if (!document.hidden) {
        const tickNow = Date.now();
        const result = advance(gameRef.current, (tickNow - gameRef.current.savedAt) / 1000);
        result.state.savedAt = tickNow;
        if (result.levels) setLevelFlash(x => x + 1);
        setGame(result.state);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (saveError) return;
    const save = () => localStorage.setItem(SAVE_KEY, serialize({ ...gameRef.current, savedAt: Date.now() }));
    const timer = window.setInterval(save, 5000);
    window.addEventListener('pagehide', save);
    return () => { window.clearInterval(timer); window.removeEventListener('pagehide', save); };
  }, [saveError]);

  const buy = () => {
    const next = buyHardware(game);
    if (next !== game) { next.savedAt = Date.now(); setGame(next); if (!saveError) localStorage.setItem(SAVE_KEY, serialize(next)); setPulse(x => x + 1); }
  };
  const reset = () => { if (confirm('Wirklich neu starten? Dein gesamter Fortschritt wird gelöscht.')) { localStorage.removeItem(SAVE_KEY); location.reload(); } };
  const cost = blockCost(game.hardware);
  const progress = Math.min(100, game.training / trainingGoal(game.level) * 100);
  return <main className={`${effects ? '' : 'effects-off'}`}>
    <header><div><span className="eyebrow">PROJEKT AURORA</span><h1>AI Singularity</h1></div><button className="icon-button" onClick={() => setEffects(v => !v)} aria-pressed={!effects} title="Effekte umschalten">{effects ? 'FX' : 'FX AUS'}</button></header>
    {saveError && <aside className="warning"><strong>Speicherhinweis</strong><span>{saveError}</span><button onClick={reset}>Neues Spiel beginnen</button></aside>}
    {offline && <aside className="return"><button aria-label="Schließen" onClick={() => setOffline(null)}>×</button><strong>Werkstatt weitergelaufen</strong><span>{num(offline.seconds / 60, 0)} Min · +{num(offline.credits)} Credits · {offline.levels} Modelllevel</span><small>Offline-Fortschritt ist auf 24 Stunden begrenzt.</small></aside>}
    <section className="resources">
      <div><span>Credits</span><strong>{num(game.credits)}</strong><small>+{num(creditRate(game.hardware, game.level))}/s</small></div>
      <div><span>Compute</span><strong>{num(computeRate(game.hardware), 0)}</strong><small>TFLOP/s</small></div>
    </section>
    <section className={`workshop ${pulse ? 'purchased' : ''}`}>
      <div className="ambient"/><Hardware stage={stage} pulse={pulse}/>
      {effects && pulse > 0 && <div key={pulse} className="particles">{Array.from({length: 10},(_,i)=><i key={i} style={{'--i':i} as React.CSSProperties}/>)}</div>}
      <div className="hardware-label"><span>{stage === 1 ? 'HEIMRECHNER' : stage === 2 ? 'GPU-AUFBAU' : 'SERVER-RACK'}</span><strong>{game.hardware} Blöcke</strong></div>
      <div className="milestones"><span className={game.hardware >= 10 ? 'done':''}>10 · GPU</span><span className={game.hardware >= 25 ? 'done':''}>25 · RACK</span></div>
    </section>
    <section key={levelFlash} className={`training ${levelFlash ? 'level-flash':''}`}>
      <div className="section-title"><div><span>AUTONOMES TRAINING</span><strong>Modelllevel {game.level}</strong></div><b>{num(progress, 0)}%</b></div>
      <div className="bar"><i style={{width:`${progress}%`}}/></div>
      <div className="training-meta"><span>{num(game.training, 0)} / {num(trainingGoal(game.level), 0)} Arbeit</span><span>Qualität ×{num(1.08 ** game.level, 2)}</span></div>
    </section>
    <button className="buy" disabled={game.credits < cost || !!saveError} onClick={buy}><span>Hardwareblock kaufen<small>Mehr Leistung für die Werkstatt</small></span><strong>{num(cost, 1)} C</strong></button>
    <footer><span>Automatisch gespeichert</span><button onClick={reset}>Spielstand zurücksetzen</button></footer>
  </main>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
